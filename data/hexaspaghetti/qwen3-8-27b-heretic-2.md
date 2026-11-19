# HexaSpaghetti/Qwen3.8-27B-heretic

## Resumen

Qwen3.8-27B-heretic es una variante "decensored" (abliterated) del modelo Qwen3.8-27B de Alibaba Qwen, publicada por el usuario HexaSpaghetti. El modelo base es un modelo denso de 27.000 millones de parametros con arquitectura hibrida (Gated DeltaNet + Gated Attention), codificador de vision nativo y una longitud de contexto de 262.144 tokens extensible hasta 1.000.000. La modificacion se ha realizado con la herramienta Heretic v2.2.0.dev0 mediante una tecnica de ablacion de rango arbitrario (Arbitrary-Rank Ablation, ARA) aplicada sobre las capas 10 a 60.

El objetivo de la modificacion es reducir drasticamente la tasa de rechazos (refusals) del modelo original: segun la model card, pasa de 98/100 rechazos en el modelo base a 5/100 en esta version, con una divergencia KL de 0,2197 y una variacion minima en PIQA acc_norm (0,8118 frente a 0,8156). El resultado es un modelo que conserva en gran medida las capacidades del original pero elimina gran parte de las respuestas de negativa ante peticiones que el modelo base rechazaria.

Es relevante para desarrolladores e investigadores que necesiten un modelo multimodal de ~27B con contexto largo, control flexible de razonamiento y comportamiento menos restrictivo, y que valoren la reproducibilidad del proceso de ablacion (el repositorio incluye un directorio `reproduce`). El modelo se distribuye bajo licencia Apache 2.0 y en formato safetensors para transformers, con compatibilidad declarada con vLLM, SGLang y TokenSpeed.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con codificador de vision; hibrida Gated DeltaNet (atencion lineal) + Gated Attention, 64 capas en layout 16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)) |
| Parametros totales | 27.356.728.560 (~27,4B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.000.000 |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors; el modelo base es compatible con cuantizaciones habituales, pero no se documentan en la ficha) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); repo de 54,7 GB |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer causal denso con codificador de vision integrado. Su capa oculta mide 5.120 dimensiones, con embedding y salida de 248.320 tokens (con padding), 64 capas y una FFN de dimension intermedia 17.408. La atencion combina dos mecanismos: Gated DeltaNet (atencion lineal con 48 cabezas para V y 16 para QK, dimension de cabeza 128) y Gated Attention clasica (24 cabezas para Q, 4 para KV, dimension de cabeza 256, RoPE de 64 dimensiones). Incorpora Multi-Token Prediction (MTP) entrenado con multiples pasos. El modelo ha pasado por pre-entrenamiento y post-entrenamiento, e incluye control flexible de "thinking" con parametros `reasoning_effort` y `preserve_thinking`.

La modificacion heretic aplica Arbitrary-Rank Ablation sobre las capas 10 a 60 con los siguientes hiperparametros: `preserve_good_behavior_weight` 0,9658, `steer_bad_behavior_weight` 0,0009, `overcorrect_relative_weight` 1,0004 y `neighbor_count` 12. El proceso es reproducible segun el autor y esta documentado en el directorio `reproduce` del repositorio. No se dispone de informacion sobre la composicion exacta del dataset de entrenamiento del modelo base ni sobre el volumen de tokens utilizados.

## Capacidades

- Generacion de texto y razonamiento con modo "thinking" activado por defecto y desactivable por peticion.
- Control de profundidad de razonamiento mediante `reasoning_effort` y retencion de contexto de razonamiento historico con `preserve_thinking`.
- Comprension nativa de imagen y video (image-text-to-text), incluyendo diagramas STEM, documentos y videos de hasta una hora.
- Codigo, trabajo profesional, investigacion y tareas agenticas de horizonte largo.
- Planificacion autonoma y manejo de retroalimentacion del entorno para ejecucion de tareas de extremo a extremo.
- Compatibilidad con harnesses y herramientas de desarrollo populares (segun la model card del modelo base).
- Comportamiento menos restrictivo que el modelo original: 5/100 rechazos frente a 98/100.
- Soporte de tool calling / function calling: no se detalla explicitamente en la informacion disponible, aunque la model card menciona "official built-in tools" para la version alojada en Qwen Cloud.

## Casos de uso

- Atencion al cliente automatizada: con 262.144 tokens de contexto nativo, el modelo puede mantener conversaciones multi-turno muy largas y arrastrar historial completo sin truncamiento, reduciendo perdida de informacion en soporte tecnico complejo.
- Analisis de documentos extensos y diagramas: al ser un modelo vision-language nativo, permite procesar informes, papers y esquemas tecnicos en una sola pasada, util en investigacion y consultoria.
- Procesamiento de video de larga duracion: la capacidad de entender videos de hasta una hora lo hace adecuado para analisis de reuniones, auditoria de contenido audiovisual o resumen de material formativo.
- Generacion de codigo en produccion: su enfoque en tareas de codigo y agenticas permite integrarlo en pipelines de CI/CD y asistentes de desarrollo, con la salvedad de que el comportamiento decensored requiere revision de salidas.
- Agentes autonomos multi-paso: la mejora declarada en planificacion y manejo de feedback del entorno lo hace apto para orquestacion de tareas largas con herramientas externas.
- Investigacion sobre alineacion y seguridad: al ser una version abliterated reproducible, sirve como caso de estudio controlado para medir el efecto de la ablacion sobre rechazos, utilidad y divergencia KL.
- Despliegue en infraestructura propia: al ser un modelo denso de 27B con licencia Apache 2.0 y pesos safetensors, puede servirse en vLLM, SGLang o TokenSpeed sin dependencia de APIs externas.

## Benchmarks y rendimiento

| Metrica | Este modelo | Qwen3.8-27B original |
|---|---|---|
| Rechazos (refusals) | 5/100 | 98/100 |
| Divergencia KL | 0,2197 | 0 (por definicion) |
| PIQA acc_norm | 0,8118 | 0,8156 |

La model card del modelo base incluye tablas de benchmarks de texto y vision comparando con Qwen3.6-27B y Qwen3.7-Plus, pero los datos completos no estan disponibles en la informacion proporcionada. No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar para esta variante heretic.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 55 GB solo para pesos, mas overhead de KV cache y activaciones; se recomienda un minimo de 64-80 GB.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 28-30 GB de pesos, factible en GPUs de 40-48 GB.
- VRAM estimada en cuantizacion de 4 bits: alrededor de 15-18 GB de pesos, potencialmente ejecutable en GPUs consumer de 24 GB (RTX 3090, RTX 4090) con contexto limitado.
- GPUs recomendadas: A100 80GB, H100 80GB o multiples GPUs para contexto completo de 262K tokens; RTX 4090/3090 solo con cuantizacion agresiva y contextos reducidos.
- Opciones de despliegue: transformers, vLLM, SGLang y TokenSpeed (segun la model card del modelo base).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.8-27B-heretic | ~27,4B denso | 262.144 (ext. 1M) | Apache 2.0 | Variante abliterated, 5/100 rechazos |
| Qwen3.8-27B (original) | ~27B denso | 262.144 (ext. 1M) | Apache 2.0 | Modelo base, 98/100 rechazos, PIQA 0,8156 |
| Qwen3.6-27B | no disponible | no disponible | no disponible | Referenciado en benchmarks del modelo base |
| Qwen3.7-Plus | no disponible | no disponible | no disponible | Referenciado en benchmarks del modelo base |

Los datos de Qwen3.6-27B y Qwen3.7-Plus solo aparecen como columnas de comparacion en la model card del modelo base; no se dispone de sus especificaciones completas en la informacion proporcionada.

## Limitaciones y advertencias

- La ablacion elimina gran parte de los rechazos, lo que implica un mayor riesgo de generar contenido inapropiado, danino o no alineado con politicas de uso; no es recomendable desplegarlo en entornos de cara al publico sin filtros adicionales.
- La divergencia KL de 0,2197 respecto al modelo original indica que el comportamiento ha cambiado de forma medible; aunque PIQA apenas varia, otras capacidades no evaluadas podrian degradarse.
- Riesgo de alucinacion inherente a los modelos de lenguaje, no mitigado por la ablacion.
- No se documentan los idiomas soportados ni el rendimiento multilingue de esta variante.
- Aunque la licencia es Apache 2.0, el uso comercial de un modelo decensored puede chocar con las politicas de las plataformas de despliegue y con requisitos regulatorios; conviene revisar terminos de uso y normativa aplicable.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, por lo que no hay validacion comunitaria independiente del proceso ni de los resultados declarados.
- El repositorio ocupa 54,7 GB y no incluye pesos cuantizados; el usuario debe generar sus propias cuantizaciones.
- El proceso de ablacion es reproducible, pero los hiperparametros ARA solo estan documentados en la model card; conviene revisar el directorio `reproduce` antes de confiar en la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HexaSpaghetti/Qwen3.8-27B-heretic
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Heretic (herramienta de ablacion): https://heretic-project.org
- Qwen Cloud (servicio alojado del modelo base): https://www.qwencloud.com
- Overview de Qwen3.8-27B en Qwen Cloud: https://www.qwencloud.com/models/qwen3.8-27b
