# Lanilen/Inkling-2-Mini-Expert-Predictor

## Resumen

Inkling-2-Mini-Expert-Predictor es un artefacto auxiliar desarrollado por Lanilen que acompaña al modelo de lenguaje thinkingmachines/Inkling-2-Mini. No es un modelo de lenguaje ni genera texto: es un predictor de enrutamiento de expertos que permite a un motor de inferencia decidir qué expertos de tipo mixture-of-experts (MoE) mantener en VRAM y cuáles dejar en RAM del sistema. Su función es reducir el coste de los fallos de caché cuando el modelo no cabe completo en la GPU.

El modelo base Inkling-2-Mini emplea una arquitectura `inkling2_loop` con 24 capas MoE, 128 expertos enrutados por capa y 8 expertos activados por token; las capas 6 a 17 se ejecutan tres veces por token con los mismos expertos. Los expertos concentran aproximadamente 24,5 de los 26,4B parámetros totales, lo que hace crítico gestionar su ubicación entre VRAM y RAM. El predictor estima, para cada capa y experto, la frecuencia de selección futura sobre ventanas de 128 y 512 tokens.

El artefacto se distribuye como dos ficheros en contenedor GGUF con extensión `.moepred` (12,4 MiB y 7,8 MiB en float32) y solo funciona con el fork Polaris de llama.cpp, en modo de caché *hot spare*. Es relevante para quienes despliegan Inkling-2-Mini en GPUs de consumo (12 GB o menos) y necesitan maximizar el rendimiento de generación aprovechando la memoria de vídeo disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP de 2 capas (4621 → 512 → 128, GELU) con cabecera de bajo rango por horizonte; predicción de enrutamiento MoE |
| Parametros totales | no disponible (tamaño de fichero: 12,4 MiB y 7,8 MiB en float32) |
| Parametros activos | no aplica (no es un modelo de lenguaje) |
| Longitud de contexto | no aplica; predice sobre ventanas de 128 y 512 tokens |
| Tipos de cuantizacion | float32 (los ficheros `.moepred` se distribuyen sin cuantizar) |
| Idiomas soportados | no aplica (no procesa lenguaje de forma autónoma) |
| Licencia | MIT |
| Formato de pesos | GGUF (contenedor con `general.architecture` = `moe-predictor`, versión 1), extensión `.moepred` |

## Arquitectura y entrenamiento

El predictor es una red MLP de dos capas con activación GELU que recibe 4621 entradas y produce una salida de 512 dimensiones, seguida de una cabecera de bajo rango (rank-128) por cada horizonte de predicción. Las entradas combinan el estado oculto del modelo base en el token más reciente (las entradas de las capas 8 y 16 en su primera pasada, 2 × 2304 floats), nueve mapas de conteo de selecciones previas (con decaimientos de semivida 64 y 512, por conversación, por prompt del turno, por respuesta anterior, por respuesta en curso con semividas 32 y 8, y un prior fijo) y 13 buckets de posición dentro de la respuesta (de 0 a 1024 tokens).

La predicción se calcula mediante un softmax sobre los 128 expertos de cada capa, combinando un sesgo, una ponderación por bucket de los mapas de conteo y una proyección de rango 128 de la salida del MLP. Se ejecuta cada 16 tokens generados y al inicio de cada respuesta. El fichero de inicio (`inkling2-start-v3.moepred`) predice a partir del texto del turno antes de ejecutar el prompt, usando los conteos y la media de los embeddings de tokens del turno, de modo que los expertos se suben a VRAM mientras se computa el prompt. No se dispone de información sobre el dataset de entrenamiento, el número de tokens, ni si se emplearon técnicas de RLHF o DPO.

## Capacidades

- Predicción de enrutamiento de expertos: estima, para cada una de las 24 capas del modelo Inkling-2-Mini, la frecuencia de selección de cada uno de los 128 expertos en los próximos 128 y 512 tokens.
- Gestión de caché de expertos en VRAM: permite al motor de inferencia clasificar y priorizar qué expertos subir a la GPU dentro de un presupuesto de memoria configurable.
- Predicción anticipada al inicio de turno: el fichero de inicio permite precargar expertos durante el cómputo del prompt, solapando la transferencia con el cálculo.
- Integración con decodificación looped: contabiliza una predicción por pasada en las capas 6 a 17, que se ejecutan tres veces por token.
- No genera texto, no admite conversación, no se puede fusionar ni afinar, y no funciona con otros modelos ni con otros motores distintos del fork Polaris de llama.cpp.

## Casos de uso

- Despliegue de Inkling-2-Mini en GPUs de 12 GB: el predictor permite mantener en VRAM el subconjunto de expertos más probable, reduciendo los fallos de caché y sosteniendo 27–28,5 tokens/s de generación con 8,3 GB de VRAM en una RTX 4070 Ti.
- Servicio de inferencia local con presupuesto de memoria ajustado: configurando `--moe-cache-mib` según la VRAM libre (aproximadamente la memoria libre menos 4,5 GB), el predictor decide qué expertos ocupan el espacio disponible en cada momento.
- Optimización de latencia en lectura de prompts largos: con el fichero de inicio, la carga de expertos se solapa con el cómputo del prompt, alcanzando 65–70 tokens/s de lectura sobre un prompt de 1,3k tokens.
- Evaluación comparativa de estrategias de caché: permite medir el impacto del predictor frente al ranking por frecuencia reciente, útil para investigación sobre offloading de MoE.
- Despliegue en GPUs de gama baja (6 y 8 GB): el repositorio documenta configuraciones específicas para estas capacidades, donde la selección predictiva de expertos resulta más determinante.
- Verificación de integridad del artefacto: los vectores de prueba (`checks/pred-v3.vec`, `checks/start-v3.vec`) permiten validar que el fichero carga y computa lo esperado mediante `llama-moe-predictor-check`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card reporta métricas operativas del despliegue de referencia (RTX 4070 Ti de 12 GB, Intel 14600KF, 32 GB de RAM, cuantización UD-Q4_K_XL):

| Metrica | Valor |
|---|---|
| Generacion | 27–28,5 tokens/s |
| Lectura de prompt (1,3k tokens) | 65–70 tokens/s |
| VRAM utilizada | 8,3 GB |
| Coste de una prediccion | ~0,5 ms en CPU |
| Frecuencia de prediccion | cada 16 tokens generados y al inicio de cada respuesta |

## Requisitos de hardware

- VRAM: 8,3 GB en el despliegue de referencia con cuantización UD-Q4_K_XL y caché de 3500 MiB (`--moe-cache-mib 3500`).
- GPU recomendadas: RTX 4070 Ti (12 GB) como referencia; el repositorio documenta configuraciones para tarjetas de 6 y 8 GB y un montaje con RX 480.
- GPU de consumo: sí, cabe en tarjetas de 12 GB e incluso de 6–8 GB con ajustes de caché reducidos.
- Despliegue: exclusivamente con el fork Polaris de llama.cpp (rama `polaris`), mediante `llama-server` con `--moe-cache-mode hot-spare` y `--moe-cache-predictor`; no funciona con llama.cpp upstream, Ollama ni LM Studio.
- Notas de configuración: en GPUs NVIDIA es necesario `--no-op-offload` para evitar que el driver rechace la reserva de 8,5–10 GB de VRAM para copias de expertos de las capas looped; se asume una conversación a la vez (`-np 1`).
- Latencia: ~0,5 ms por predicción en CPU; el predictor se ejecuta en el dispositivo indicado por `--moe-cache-predictor-device` (Vulkan0 en el ejemplo).

## Comparativa con modelos similares

No disponible. No se conocen predictores de enrutamiento MoE comparables publicados con las mismas características ni se han proporcionado alternativas en la información disponible.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no admite chat, no se puede fusionar ni afinar, y no hace nada por sí solo.
- Compatibilidad restringida: solo funciona con el fork Polaris de llama.cpp en modo hot spare; es incompatible con llama.cpp upstream, Ollama, LM Studio y cualquier otro motor.
- Específico del modelo: solo sirve para Inkling-2-Mini; no funciona con otros modelos, incluido Inkling 2.
- Nombra las 24 capas físicas del modelo, no los 48 slots de caché de las tres pasadas; la caché ignora un fichero hecho para los slots.
- Asume una única conversación simultánea (`-np 1`); no se documenta comportamiento con concurrencia.
- El rendimiento depende del ajuste de `--moe-cache-mib` al espacio libre de VRAM; una configuración incorrecta puede provocar rechazo del driver en NVIDIA.
- Licencia MIT: permite uso comercial, pero la utilidad práctica queda limitada por la dependencia del fork y del modelo base.
- No se dispone de información sobre sesgos, alucinación o cobertura idiomática, al no ser un modelo generativo.

## Enlaces

- Hugging Face: https://huggingface.co/Lanilen/Inkling-2-Mini-Expert-Predictor
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- GGUF de referencia: https://huggingface.co/ggml-org/Inkling-2-Mini-GGUF
- GGUF de Unsloth: https://huggingface.co/unsloth/Inkling-2-Mini-GGUF
- Fork Polaris de llama.cpp (rama `polaris`): https://github.com/Lanilen/llama.cpp
- Documentación del despliegue: https://github.com/Lanilen/llama.cpp/blob/polaris/docs/inkling2-mini.md
- Formato y contrato del predictor: https://github.com/Lanilen/llama.cpp/blob/polaris/src/llama-moe-predictor.cpp
