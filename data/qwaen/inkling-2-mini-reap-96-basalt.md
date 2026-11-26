# qwaen/Inkling-2-Mini-REAP-96-Basalt

## Resumen

Inkling 2 Mini REAP 96 · Basalt es una variante podada del modelo multimodal Inkling 2 Mini de Thinking Machines Lab, publicada por el usuario qwaen en Hugging Face. Se trata de un modelo de arquitectura Mixture of Experts (MoE) con capacidades image-text-to-text, en el que se han conservado 96 de los 128 expertos enrutados por capa física mediante la técnica REAP (expert pruning basada en saliencia), manteniendo un enrutamiento top-8 y la repetición del bloque (repeat block) tres veces.

El paquete de pesos emplea formatos de cuantización de baja precisión: NVFP4 para las capas 0-19 y MXFP8 para las capas 20-23, además de Q8_0 para algunas proyecciones densas originalmente en BF16. Incluye la torre de visión y el drafter DSpark para decodificación especulativa. El repositorio ocupa 15,7 GB y está pensado para ejecutarse con el motor de inferencia Basalt, no con librerías convencionales como transformers o llama.cpp.

La relevancia de esta ficha radica en que documenta un caso de poda MoE agresiva orientada a despliegue en hardware de consumo, con mediciones piloto sobre una RTX 5060 Ti. No obstante, se trata de un modelo derivado de un base model del que no se dispone de información pública en la documentación proporcionada, por lo que muchos datos técnicos quedan marcados como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) con repeat block; vision tower incluida; drafter DSpark para decodificacion especulativa |
| Parametros totales | no disponible |
| Parametros activos | no disponible (enrutamiento top-8 sobre 96 expertos retenidos de 128 por capa fisica) |
| Longitud de contexto | 131.072 tokens (configurado y verificado en una prueba con prompt de 129.009 tokens); 16.384 tokens en las pruebas de rendimiento |
| Tipos de cuantizacion | NVFP4 (capas 0-19), MXFP8 (capas 20-23), Q8_0 (algunas proyecciones densas originalmente BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Paquete Basalt (.basalt); no se indica safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo base Inkling 2 Mini es un transformer MoE multimodal (image-text-to-text) con un bloque repetido tres veces y enrutamiento top-8. Esta variante aplica REAP (expert pruning por saliencia) para retener 96 de los 128 expertos enrutados en cada una de las 24 capas físicas (48 visitas de capa contando el repeat block). La saliencia se recopiló sobre 65 trayectorias de calibración de OpenCode que suman 679.958 tokens; el ranking de expertos lo realizó ExpertPruner de LLM Compressor y un exportador específico de ModelOpt copió las filas empaquetadas retenidas. El manifiesto del paquete lista los índices originales conservados en cada capa.

El paquete preserva los valores originales de expertos y las escalas de bloque en NVFP4 para las capas 0-19 y MXFP8 para las 20-23, e incluye la torre de visión y el drafter DSpark. No se dispone de información sobre el número total de tokens de entrenamiento del modelo base, la composición del dataset ni si hubo RLHF o DPO. La innovación destacable es la poda MoE con preservación de cuantización de baja precisión y la verificación funcional del perfil de colocación de expertos sobre tareas reales de OpenCode.

## Capacidades

- Generación de texto y razonamiento multimodal image-text-to-text, con torre de visión integrada.
- Enrutamiento MoE top-8 sobre 96 expertos retenidos por capa, con repeat block ejecutado tres veces.
- Decodificación especulativa mediante el drafter DSpark (parámetro `--spec 16` en Basalt).
- Soporte de contexto largo: verificado recuperando un valor al inicio de un prompt de 129.009 tokens con contexto configurado de 131.072.
- Ejecución de tareas de código en entornos OpenCode (creación de proyectos, ejecución de aserciones funcionales).
- Perfiles de colocación de expertos alternativos (`experts-shipped.prof` y `experts-reap.prof`) para ajustar el rendimiento.
- Capacidades multilingües: no disponible.
- Tool calling / function calling: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Asistencia de código en agentes OpenCode: el modelo fue calibrado y evaluado sobre trayectorias de OpenCode, por lo que encaja en flujos de agente que crean proyectos, ejecutan comandos y validan aserciones funcionales; el perfil de colocación estándar pasó 6/6 tareas retenidas.
- Procesamiento de documentos largos con imagen y texto: gracias a su ventana de 131.072 tokens y a la torre de visión, puede ingerir prompts extensos con contenido visual y recuperar información situada al inicio del contexto.
- Despliegue en estaciones de trabajo con GPU de consumo: el paquete en NVFP4/MXFP8 y Q8_0 ocupa 15,7 GB, lo que permite ejecutarlo en una RTX 5060 Ti según las mediciones del autor, con un throughput mediano de 122,20 tokens/s en generaciones de 2.048 tokens a contexto 16.384.
- Generación especulativa de alto rendimiento: el drafter DSpark con `--spec 16` acelera la decodificación en escenarios de generación de código o texto donde la latencia importa.
- Prototipado de investigación en poda MoE: el manifiesto de índices retenidos y los perfiles de expertos permiten estudiar el impacto de REAP sobre calidad y velocidad en un modelo multimodal.
- Evaluación comparativa de perfiles de expertos: los dos perfiles (`experts-shipped.prof` y `experts-reap.prof`) permiten medir el compromiso entre tasa de éxito en tareas y throughput (6/6 frente a 5/6 y 122,20 tokens/s en el perfil REAP).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos de evaluación son pruebas funcionales piloto sobre OpenCode y mediciones de throughput:

| Prueba | Resultado |
|---|---|
| Tareas OpenCode retenidas, perfil estandar | 6/6 |
| Tareas OpenCode retenidas, perfil REAP con spec=16 | 5/6 (fallo en proyecto C# creado en subdirectorio; las aserciones pasan ejecutando desde el directorio del proyecto) |
| Throughput mediano, perfil REAP, 3 generaciones de 2.048 tokens a contexto 16.384 | 122,20 tokens/s |
| Recuperación en contexto largo | Valor recuperado al inicio de un prompt de 129.009 tokens con contexto 131.072 |
| Hardware de las mediciones | RTX 5060 Ti, Docker Desktop/WSL2 |

## Requisitos de hardware

- VRAM estimada: el paquete pesa 15,7 GB en disco; con overhead de inferencia y caché KV en fp8 se requiere previsiblemente algo más de 16 GB de VRAM, aunque no se proporciona una cifra oficial.
- GPU verificada: RTX 5060 Ti (16 GB), según las mediciones piloto del autor.
- GPU recomendadas: no disponibles de forma oficial; por tamaño de paquete, tarjetas con 16 GB o más de VRAM son el mínimo razonable.
- Cabe en GPU de consumo: sí, al menos en RTX 5060 Ti según el autor; otras tarjetas de 16 GB no han sido verificadas.
- Opciones de despliegue: Basalt (commit 5b8a82c6b7e1069adbce42854e0732b2b19e4f32), con comando `basalt serve Inkling-2-Mini-96-NVFP4-MX8.basalt --kv fp8 --max-context 16384 --spec 16 --expert-profile experts-shipped.prof`. No se indica soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 122,20 tokens/s medianos en las condiciones descritas (RTX 5060 Ti, contexto 16.384, spec=16, perfil REAP).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Inkling 2 Mini REAP 96 (este) | no disponible (96/128 expertos por capa) | 131.072 | Apache 2.0 | Basalt (NVFP4/MXFP8/Q8_0) | Podado con REAP, multimodal, motor Basalt |
| Inkling 2 Mini (base) | no disponible (128/128 expertos) | no disponible | no disponible | no disponible | Modelo original de Thinking Machines Lab |
| Variante de 112 expertos (mencionada en la model card) | no disponible (112/128 expertos) | no disponible | no disponible | Basalt | Verificada con el mismo commit de Basalt |

No se dispone de información sobre otros modelos comparables de la misma categoría (MoE multimodal podado para hardware de consumo) en la documentación proporcionada.

## Limitaciones y advertencias

- Modelo derivado y podado: la eliminación de 32 de 128 expertos por capa puede degradar capacidades respecto al base; el propio autor reporta un fallo en 1 de 6 tareas OpenCode con el perfil REAP.
- Dependencia de un motor específico: requiere Basalt en un commit concreto; no hay evidencia de soporte en vLLM, llama.cpp, Ollama o TGI, lo que limita la portabilidad.
- Formatos de cuantización no estándar (NVFP4, MXFP8) que pueden no ser compatibles con toolchains convencionales.
- Evaluación muy limitada: solo 6 tareas OpenCode y mediciones en una única GPU; no hay benchmarks estandar publicados.
- Idiomas soportados no documentados; riesgo de comportamiento degradado fuera de los idiomas del modelo base.
- Riesgo de alucinación no cuantificado en la información disponible.
- Sesgos conocidos: no disponibles.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y sus condiciones no están documentados en la información proporcionada; conviene verificar la licencia del base model antes de producción.
- El rendimiento medido (122,20 tokens/s) procede de Docker Desktop/WSL2 en una RTX 5060 Ti, por lo que no es extrapolable a otros entornos sin validación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qwaen/Inkling-2-Mini-REAP-96-Basalt
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini/tree/7a67ae2314b44ef05c87fd1d4d311c58aaeb18f6
- Guía de Basalt para Inkling: https://github.com/jesdga95/basalt/blob/5b8a82c6b7e1069adbce42854e0732b2b19e4f32/docs/models/inkling2.md
- Repositorio Basalt: https://github.com/jesdga95/basalt
