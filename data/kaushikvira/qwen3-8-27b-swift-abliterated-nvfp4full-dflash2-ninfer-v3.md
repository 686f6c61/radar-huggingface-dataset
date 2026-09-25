# kaushikvira/Qwen3.8-27B-swift-abliterated-nvfp4full-dflash2-NInfer-v3

## Resumen

Qwen3.8-27B-swift-abliterated-nvfp4full-dflash2-NInfer-v3 es un artefacto de inferencia publicado por el usuario kaushikvira a partir de un checkpoint Qwen3.8-27B de 27.000 millones de parámetros, en su variante abliterada (sin direcciones de rechazo) y cuantizada íntegramente en NVFP4 para el motor NInfer. No es un modelo entrenado desde cero: es el resultado de tomar el checkpoint BF16 d0xin/Swift-Qwen3.8-27B-Uncensored-BF16, cuantizarlo con llm-compressor (512 muestras de calibración de Ultrachat, secuencia 2048) y empaquetarlo en un contenedor nativo `.ninfer` de versión 3 junto al borrador especulativo DFlash2 de z-lab y una cabeza de propuesta indexada.

El modelo es multimodal (pipeline `image-text-to-text`), con torre de visión cuantizada en q4/q5/q6, soporte de modo *thinking* con presupuesto de tokens y decodificación especulativa DFlash2. El artefacto ocupa 19.782.447.364 bytes (18,42 GiB) y está diseñado para ejecutarse en una única RTX 5090 de 32 GB, aprovechando las unidades FP4 de la arquitectura Blackwell para las multiplicaciones W4A4.

Su relevancia actual es doble: por un lado, documenta una técnica poco habitual de normalización de divisores globales que permite fusionar padres de atención con un único `weight_global_scale` y evita que el motor rechace el artefacto; por otro, es un caso de estudio de cuantización NVFP4 agresiva (W4A4 group-16 en todas las proyecciones de texto) sobre un modelo abliterado, un terreno donde la degradación de calidad suele ser difícil de medir. El repositorio no tiene descargas ni *likes* y el autor no publica resultados de benchmarks sobre este artefacto concreto, solo la evaluación emparejada del checkpoint BF16 de origen.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible de forma explícita; el pipeline de cuantización describe capas de atención completa (padre fusionado `qkgv`, 14.336 filas) junto a capas GDN (padre `qkvz`, 16.384 filas), lo que apunta a una arquitectura híbrida de atención lineal y atención completa, con cabeza MTP y borrador especulativo DFlash2 |
| Parámetros totales | 27.000 millones (según la denominación del modelo; no verificado numéricamente en la model card) |
| Parámetros activos | No aplica / no disponible (no se describe una topología MoE) |
| Longitud de contexto | 262.144 tokens (configuración de servicio indicada por el autor con `--max-context 262144`); contexto nativo del modelo base no disponible |
| Tipos de cuantización | NVFP4 W4A4 group-16 en proyecciones de texto (348 padres fusionados); W8G32 groupwise en *token embedding* y cabeza de salida (30 objetos `q8_g32`); q4/q5/q6 en la torre de visión; BF16 en 9 tensores exceptuados, en la cabeza MTP y en el borrador DFlash2; caché KV en `k8v4` |
| Idiomas soportados | No disponible (el repositorio no declara idiomas) |
| Licencia | Apache 2.0 (declarada por el autor del artefacto; las licencias de los checkpoints base pueden imponer condiciones adicionales) |
| Formato de pesos | Contenedor nativo `.ninfer` versión 3 (no safetensors ni GGUF); 1.590 objetos almacenados; fichero `qwen3_8_27b_swift_abliterated_nvfp4full-dflash2.ninfer` |
| Tamaño del artefacto | 19.782.447.364 bytes (18,42 GiB) |
| SHA-256 | `74c9721303f5287bf3fbd39544f0a6446b03a95b7c28b3751d5e12866ca8b918` |
| Pipeline | `image-text-to-text` (multimodal imagen-texto) |
| Motor de inferencia | NInfer (biblioteca `ninfer`, contenedor v3, requiere ≥ `98dada0e`) |
| Fecha de creación | 25 de septiembre de 2026 |

## Arquitectura y entrenamiento

No hay información sobre el preentrenamiento del modelo original: la model card describe únicamente el proceso de cuantización y empaquetado, no el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. Lo que sí se detalla es la cadena de derivación. El checkpoint base es ukisai/Swift-Qwen3.8-27b, sobre el que d0xin aplicó una abliteración de tipo *OrcaRouter-compatible rank-1 residual-writer directional ablation*, con la fórmula `W' = W − r(rᵀW)`, 131 tensores modificados, dirección de referencia en la capa 38, rango 1, proyección en fp32 y una fuga residual máxima en BF16 de 1,49e-3. El autor de este artefacto declara no haber re-abliterado ni editado el comportamiento: hereda los pesos byte a byte y solo los cuantiza.

La innovación técnica propia es la normalización de divisor global. llm-compressor emite un `weight_global_scale` por módulo, pero la ruta de entrada A4 nativa de NInfer exige que cada padre de atención fusionado (GDN `qkvz` con 16.384 filas, atención completa `qkgv` con 14.336 filas) sea una región contigua con un único divisor. El autor unifica el divisor de cada grupo de empaquetado a `D = min(dᵢ)` y reescala las escalas de bloque E4M3 de cada miembro por `D/dᵢ` con redondeo RNE y solo reducción, lo que evita desbordamientos. La verificación de invariancia de dequantización reporta una deriva máxima del 2,7 % en los elementos de menor magnitud y un 0,0000 % en la mediana: los pesos quedan inalterados salvo el ruido de recodificación en E4M3. Con divisores uniformes, el conversor fusiona cada grupo en un único padre y el motor acepta el artefacto sin modificaciones. El empaquetado se hizo con el conversor NInfer v3 (`--components text,vision,mtp,dflash2 --proposal`).

## Capacidades

- Generación de texto conversacional multimodal: acepta entradas de imagen y texto (pipeline `image-text-to-text`), con un presupuesto de tokens de imagen configurable (`--image-token-budget 12` en la receta del autor).
- Modo *thinking* con presupuesto explícito de tokens de razonamiento (`--default-thinking-budget 16384`) y opción de preservar el bloque de pensamiento en la salida (`--preserve-thinking`).
- Decodificación especulativa con el borrador DFlash2 y cabeza de propuesta indexada, con 7 tokens de borrador por paso (`--draft-tokens 7 --lm-head-draft`).
- Predicción multi-token: el contenedor incluye un componente MTP conservado en BF16.
- Conversaciones multi-turno con contexto largo: la configuración de servicio admite hasta 262.144 tokens de contexto y 4 conversaciones concurrentes.
- Reutilización de prefijos: soporta hasta 16 prefijos compartidos y 16 continuaciones privadas en memoria host (`--host-kv-mib 49152`), lo que habilita *prompt caching* entre peticiones.
- Comportamiento sin rechazos: al estar abliterado, no aplica la dirección de rechazo eliminada; esto es una capacidad operativa, no una garantía de calidad ni de seguridad.
- Soporte de *tool calling* o *function calling*: no disponible (no se menciona en la información proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad declarada, aunque el borrador especulativo y el modo *thinking* son componentes compatibles con flujos multi-paso.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Audio o vídeo: no disponible (solo se menciona torre de visión).

## Casos de uso

- Investigación en seguridad y red-teaming: al ser un modelo abliterado con la dirección de rechazo eliminada por ablación direccional de rango 1, resulta adecuado para estudiar cómo se comporta un modelo sin alineamiento de rechazo, medir la tasa de cumplimiento ante peticiones sensibles y comparar contra el checkpoint BF16 de origen. Debe ejecutarse en entornos aislados y con supervisión humana.
- Estudio de cuantización NVFP4 en producción: el artefacto es reproducible (SHA-256, manifiesto `SHA256SUMS`, contrato de conversión en JSON) y documenta la técnica de normalización de divisor global, por lo que sirve para medir la degradación real de W4A4 group-16 frente a BF16 en tareas concretas y validar si el reescalado `D = min(dᵢ)` es seguro en otros modelos.
- Inferencia multimodal local en una sola GPU: con una RTX 5090 de 32 GB y la torre de visión en q4/q5/q6, permite procesar imágenes y texto en local sin depender de APIs externas, útil para prototipos de análisis de documentos escaneados o capturas con presupuesto de tokens de imagen limitado a 12.
- Análisis de documentos muy largos: los 262.144 tokens de contexto configurados permiten ingerir repositorios de código, expedientes o transcripciones extensas en una sola ventana, con la caché KV en `k8v4` y 48 GiB de memoria host reservados para KV y estado.
- Servicio conversacional interno de baja concurrencia: con `--max-concurrency 4`, 16 prefijos compartidos y 16 continuaciones privadas, encaja en un despliegue departamental donde varios usuarios comparten un *system prompt* largo y se benefician del almacenamiento en caché de prefijos.
- Generación con razonamiento largo y salidas extensas: el presupuesto de pensamiento de 16.384 tokens y el límite por defecto de 32.768 tokens de salida permiten tareas de síntesis o resolución de problemas que requieren cadenas de razonamiento largas antes de responder.
- Evaluación de decodificación especulativa: el par DFlash2 más cabeza de propuesta indexada con 7 tokens de borrador convierte este artefacto en un banco de pruebas para medir la tasa de aceptación del borrador y el impacto en latencia sobre una arquitectura híbrida con capas GDN.
- Procesamiento por lotes offline: el chunk de prefill de 4.096 tokens y el *timeout* de 900.000 ms para peticiones pendientes permiten colas de trabajos largos en un único servidor sin fragmentar el contexto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks sobre este artefacto NVFP4. La única evaluación numérica disponible corresponde al checkpoint BF16 abliterado de d0xin, no a la versión cuantizada:

| Evaluación | Resultado | Contexto |
|---|---|---|
| MMLU-Pro | +6,1 puntos frente al modelo base | Evaluación emparejada de 298 muestras realizada por d0xin sobre el checkpoint BF16; el autor indica que no es estadísticamente significativa (el intervalo de confianza cruza el 0) |
| MATH-500 | Sin cambios frente al modelo base | Misma evaluación emparejada de d0xin sobre el checkpoint BF16 |
| Resto de benchmarks (MMLU, HumanEval, GSM8K, etc.) | No disponible | No publicados en la información proporcionada |
| Rendimiento del artefacto cuantizado (tasa de aceptación del borrador, latencia, throughput) | No disponible | El autor describe un A/B en la misma sesión frente al perfil no abliterado, pero no publica cifras |

## Requisitos de hardware

- VRAM estimada: el peso del artefacto es de 18,42 GiB; con caché KV en `k8v4` a 262.144 tokens de contexto, 4 conversaciones concurrentes y torre de visión activa, la configuración de referencia apunta a una GPU de 32 GB.
- GPU de referencia: una única NVIDIA RTX 5090 de 32 GB, que es el hardware en el que el autor construyó y validó el artefacto.
- Requisito de arquitectura: las multiplicaciones W4A4 en NVFP4 requieren soporte nativo de FP4, disponible en Blackwell (RTX 50xx, B200, GB200 y posteriores). No es esperable que funcione en Ampere, Ada Lovelace ni Turing.
- Memoria host: la receta reserva 49.152 MiB (48 GiB) para KV y estado en memoria del sistema (`--host-kv-mib 49152`), por lo que conviene un equipo con al menos 64 GiB de RAM.
- GPU de consumo: cabe en una RTX 5090 de 32 GB. No cabe en GPUs de 24 GB o menos (RTX 4090, 4080, 3090) sin renunciar a contexto, concurrencia o torre de visión, y en cualquier caso esas arquitecturas no ejecutan NVFP4 de forma nativa.
- Opciones de despliegue: exclusivamente `ninfer-serve` del motor NInfer (contenedor v3, requiere un build ≥ `98dada0e`). No hay soporte indicado para vLLM, llama.cpp, Ollama, TGI ni TensorRT-LLM, y el formato de pesos no es safetensors ni GGUF, por lo que no es directamente portable.
- Latencia y throughput: no disponible. Se sabe que se activa decodificación especulativa con 7 tokens de borrador y `lm-head-draft`, que previsiblemente reduce la latencia por token, pero no se publican cifras de tokens por segundo ni de tasa de aceptación.
- Parámetros de servicio relevantes: `--prefill-chunk 4096`, `--max-concurrency 4`, `--default-max-tokens 32768`, `--pending-timeout-ms 900000`, `--temperature 0.9`, `--min-p 0.05`, `--kv-dtype k8v4`.

## Comparativa con modelos similares

| Modelo | Tipo | Cuantización | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este artefacto (kaushikvira, v3) | Abliterado, multimodal, DFlash2 | NVFP4 W4A4 group-16 + W8G32 + q4/q5/q6 visión | 262.144 tokens en la receta de servicio | Apache 2.0 | Contenedor `.ninfer` v3, solo motor NInfer, 0 descargas |
| d0xin/Swift-Qwen3.8-27B-Uncensored-BF16 | Abliterado, BF16 (origen de los pesos) | BF16 (18 fragmentos) | No disponible | No disponible | Safetensors en HuggingFace |
| kaushikvira/Qwen3.8-27B-nvfp4full-dflash2-NInfer-v3 | Versión no abliterada del mismo perfil | NVFP4 full + DFlash2 | No disponible | Apache 2.0 | Contenedor `.ninfer` v3; perfil de producción anterior del autor |
| Barding-Defense/Qwen3.8-27B-huihui-abliterated-NVFP4-NInfer | Abliterado (linaje huihui-ai), NVFP4 para NInfer | NVFP4 | No disponible | No disponible | Contenedor NInfer |
| ukisai/Swift-Qwen3.8-27b | Checkpoint base upstream | BF16 | No disponible | No disponible | HuggingFace |
| z-lab/Qwen3.8-27B-DFlash2 | Borrador especulativo (componente) | BF16 en este artefacto | No aplica | No disponible | HuggingFace, commit `50307d4c…` |

No se dispone de parámetros, contexto nativo ni resultados de benchmarks de las alternativas, por lo que la comparación cuantitativa de rendimiento no es posible con la información proporcionada. La diferencia verificable entre este artefacto y sus alternativas es el formato de pesos, el motor de ejecución y la cadena de custodia de hashes.

## Limitaciones y advertencias

- Modelo abliterado: se han eliminado direcciones de rechazo mediante ablación direccional, por lo que el modelo no aplica las salvaguardas de alineamiento del checkpoint original. No debe exponerse a usuarios finales sin una capa de filtrado externa y sin revisión legal.
- Sesgos conocidos: no disponibles explícitamente, pero al derivar de un modelo base no documentado y calibrarse la cuantización con 512 muestras de Ultrachat, es previsible un sesgo hacia el dominio y el idioma de ese corpus (mayoritariamente inglés conversacional).
- Riesgo de alucinación: no cuantificado. La cuantización W4A4 en todas las proyecciones de texto, incluidas las de atención, es agresiva; aunque el autor verifica invariancia de dequantización de los pesos, eso no garantiza que el comportamiento en generación coincida con el BF16 de origen.
- Ausencia de validación independiente: el repositorio tiene 0 descargas y 0 *likes*, y no hay benchmarks publicados del artefacto cuantizado. La única evaluación citada (298 muestras) corresponde al checkpoint BF16 previo y el propio autor la califica de no significativa.
- Idiomas: no declarados. No hay garantía de calidad fuera del idioma o idiomas del modelo base y del corpus de calibración.
- Licencia: el artefacto se declara Apache 2.0, pero al ser una derivación de varios checkpoints (ukisai, d0xin, huihui-ai, z-lab) conviene verificar las condiciones de cada uno antes de un uso comercial. La licencia del modelo base upstream no se especifica en la información disponible.
- Dependencia total del motor NInfer: el formato `.ninfer` v3 no es safetensors ni GGUF y exige un build ≥ `98dada0e`. Esto descarta vLLM, llama.cpp, Ollama y TGI, y crea un riesgo de bloqueo tecnológico si el motor deja de mantenerse.
- Requisito de hardware restrictivo: NVFP4 W4A4 necesita GPU Blackwell. El artefacto no es ejecutable en GPUs de generaciones anteriores, ni siquiera con menos contexto.
- Consumo de memoria host elevado: la receta reserva 48 GiB para KV y estado, lo que puede provocar intercambio a disco en máquinas con 64 GiB o menos de RAM si se llena la caché.
- Configuración de muestreo agresiva: la receta usa `temperature 0.9` y `min-p 0.05`, valores que en producción pueden aumentar la variabilidad y la tasa de alucinación percibida.
- Procedencia de los datos de cuantización: la calibración con Ultrachat, de naturaleza conversacional, puede no representar bien dominios técnicos como código, matemáticas o documentación jurídica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kaushikvira/Qwen3.8-27B-swift-abliterated-nvfp4full-dflash2-NInfer-v3
- Versión no abliterada del mismo perfil: https://huggingface.co/kaushikvira/Qwen3.8-27B-nvfp4full-dflash2-NInfer-v3
- Checkpoint abliterado BF16 de origen: https://huggingface.co/d0xin/Swift-Qwen3.8-27B-Uncensored-BF16
- Checkpoint base upstream: https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- Linaje de la técnica de abliteración: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Borrador especulativo DFlash2: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Alternativa abliterada NVFP4 para NInfer: https://huggingface.co/Barding-Defense/Qwen3.8-27B-huihui-abliterated-NVFP4-NInfer
- Motor NInfer: https://github.com/Neroued/ninfer
- Referencia de evaluación sin censura mencionada por el autor: https://pliny.gg
- Referencia de la técnica de ablación direccional (Arditi et al. 2024): no disponible como enlace en la información proporcionada
