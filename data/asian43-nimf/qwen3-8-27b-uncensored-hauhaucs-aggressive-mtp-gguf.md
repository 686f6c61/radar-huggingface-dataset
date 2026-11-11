# Asian43-Nimf/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF

## Resumen

Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP es una cuantización GGUF de la familia Qwen3.8-27B, publicada por el usuario Asian43-Nimf bajo el perfil de "uncensoring" Aggressive de HauhauCS. El modelo base es Qwen/Qwen3.8-27B, un transformer denso de 27.000 millones de parámetros con codificador de visión y una arquitectura híbrida que combina 48 capas Gated DeltaNet con 16 capas de atención con compuertas. La release añade HauhauCS FastMTP, un sidecar de decodificación especulativa que acelera la generación respecto al MTP embebido nativo.

El objetivo declarado es eliminar el comportamiento de rechazo del modelo original (la model card afirma "0/465 Refusals") manteniendo intactas las capacidades de texto, razonamiento, uso de herramientas, imagen y vídeo. La variante Aggressive prioriza respuestas directas y sin preámbulo en prompts difíciles, a costa de menor prudencia en contextos sensibles. Se distribuye exclusivamente en formato GGUF con cuantizaciones propietarias K_P ("Perfect") y un proyector de visión BF16 separado.

La relevancia actual reside en dos frentes: por un lado, ofrece contexto nativo de 262.144 tokens extensible hasta 1.000.000, poco habitual en modelos de este tamaño; por otro, el perfil FastMTP promete hasta 3,02x de velocidad en generación de documentos y 1,93x en razonamiento frente a la inferencia sin MTP, lo que lo hace atractivo para despliegues locales en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso causal híbrido: 48 capas Gated DeltaNet + 16 capas de atención con compuertas, más codificador de visión |
| Parametros totales | 27B (según model card); el campo safetensors del repo reporta 1.863.907.840 tensores de parámetros, dato inconsistente con la nomenclatura del modelo |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.000.000 |
| Tipos de cuantizacion | Q8_K_P, Q8_0, Q6_K_P, Q6_K, Q5_K_P, Q5_K_M, Q4_K_P, Q4_K_M, IQ4_XS, Q3_K_P, Q3_K_M, IQ3_M, IQ3_XS, Q2_K_P, IQ2_M; proyector de visión BF16; sidecar FastMTP 32K |
| Idiomas soportados | Inglés (en), chino (zh), multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (texto, proyector de visión y sidecar FastMTP) |
| Capas del modelo de lenguaje | 64 |
| Hidden size | 5.120 |
| FFN size | 17.408 |
| Vocabulario | 248.320 tokens (con padding) |
| Tamaño del repo | 172,5 GB |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida poco convencional: de sus 64 capas, 48 son Gated DeltaNet (un tipo de atención lineal con estado recurrente) y 16 son capas de atención con compuertas convencionales. Esta combinación busca reducir el coste computacional en contextos largos manteniendo la calidad de recuperación de información. El hidden size es 5.120 y la FFN tiene 17.408 unidades, con un vocabulario de 248.320 tokens. Incorpora además un codificador de visión para entrada image-text-to-text y un cabezal MTP (Multi-Token Prediction) / NextN embebido en los tensores de texto.

La release de HauhauCS no modifica datasets ni capacidades previstas del modelo original: aplica únicamente un perfil de uncensoring sobre los pesos y añade el sidecar FastMTP, un perfil de aceleración de 32K que se combina con el MTP nativo. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo base. Las cuantizaciones K_P se describen como perfiles de cuantización optimizados por modelo que preservan selectivamente la calidad en las capas más sensibles, con un incremento de tamaño del 5-15% respecto a la cuantización base y una calidad equivalente a uno o dos niveles superiores.

## Capacidades

- Generación de texto conversacional multi-turno en inglés, chino y otros idiomas.
- Razonamiento y modo de pensamiento (thinking) heredado de la familia Qwen3.
- Capacidades agénticas y de razonamiento multi-paso.
- Uso de herramientas y function calling, con endpoints compatibles según los tags del repo.
- Procesamiento de imagen y vídeo mediante el proyector BF16 separado (pipeline image-text-to-text).
- Contexto largo nativo de 262.144 tokens, extensible hasta 1.000.000.
- Decodificación especulativa acelerada mediante MTP nativo y sidecar FastMTP 32K.
- Perfil "uncensored" Aggressive: respuestas directas sin rechazo declarado y mínimo preámbulo en prompts difíciles.
- Compatibilidad con runtimes GGUF estándar (llama.cpp, LM Studio y similares) sin builds ni plugins especiales.

## Casos de uso

- Análisis de documentos extensos: con 262.144 tokens de contexto nativo, el modelo puede ingerir contratos, informes o bases de código completas en una sola pasada sin técnicas de chunking, lo que simplifica pipelines de extracción y resumen.
- Asistencia en investigación sobre corpus técnicos: la combinación de razonamiento multi-paso y contexto largo permite hacer preguntas cruzadas sobre múltiples papers o especificaciones en una misma sesión.
- Procesamiento de imagen y vídeo en local: con el proyector BF16, se pueden construir flujos de descripción de capturas, OCR asistido o análisis de fotogramas sin depender de APIs externas.
- Agentes autónomos con tool calling: la compatibilidad con function calling y endpoints permite integrarlo en orquestadores de agentes para tareas de automatización con acceso a herramientas externas.
- Generación de código en entornos con restricciones de privacidad: al ejecutarse en GGUF sobre hardware propio, es apto para equipos que no pueden enviar código a servicios en la nube, con cuantizaciones Q4_K_P o Q5_K_P que caben en GPUs de consumo.
- Escritura creativa y role-play sin filtros: el perfil Aggressive está pensado para escenarios donde se requiere respuesta directa sin rechazos, como narrativa adulta o simulación de personajes.
- Despliegue en estaciones de trabajo con una sola GPU: las cuantizaciones IQ3_M (12,79 GB) o Q4_K_P (17,92 GB) permiten inferencia local en GPUs de 16-24 GB de VRAM.
- Aceleración de pipelines de generación de documentos: el perfil FastMTP declara hasta 3,02x de velocidad en TG de documentos, útil en tareas de redacción masiva o generación de informes por lotes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas relativas de aceleración del perfil FastMTP frente a la inferencia sin MTP y frente al MTP embebido estándar:

| Metrica | FastMTP vs. sin MTP | FastMTP vs. MTP embebido |
|---|---|---|
| TG en documentos | Hasta 3,02x | Hasta +35,2% |
| TG en razonamiento | Hasta 1,93x | Hasta +21,1% |
| Tasa de rechazo declarada | 0/465 | No disponible |

No se dispone de datos de MMLU, HumanEval, GSM8K ni de comparativas estandarizadas con otros modelos.

## Requisitos de hardware

- VRAM estimada según cuantización (solo pesos de texto, sin proyector ni sidecar):
  - IQ2_M: 10,32 GB
  - Q2_K_P: 10,68 GB
  - IQ3_XS: 12,18 GB
  - IQ3_M: 12,79 GB
  - Q3_K_P: 13,44 GB
  - IQ4_XS: 15,71 GB
  - Q4_K_P: 17,92 GB
  - Q5_K_P: 20,22 GB
  - Q6_K_P: 25,92 GB
  - Q8_K_P: 31,46 GB
- Añadir 931 MB del proyector de visión BF16 si se usan entradas de imagen o vídeo, y 903 MB del sidecar FastMTP si se activa la decodificación especulativa.
- GPUs recomendadas: RTX 4090 (24 GB) para Q4_K_P o IQ4_XS con contexto moderado; A100 40/80 GB o H100 para Q8_K_P y contextos largos; RTX 3090 (24 GB) como alternativa consumer para Q4_K_P.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 (16 GB, con IQ3_M o IQ4_XS) y GPUs de 16 GB o más usando cuantizaciones bajas. Para contexto largo hay que reservar VRAM adicional para la KV cache.
- Opciones de despliegue: llama.cpp, LM Studio y cualquier runtime compatible con GGUF. Los tags del repo indican compatibilidad con endpoints.
- Latencia y throughput: no se dispone de cifras absolutas. Las únicas referencias son las aceleraciones relativas del perfil FastMTP indicadas en la sección de benchmarks.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP | 27B denso | 262.144 (ext. 1M) | Apache 2.0 | GGUF | Perfil uncensored Aggressive, visión, FastMTP |
| Qwen/Qwen3.8-27B (base) | 27B denso | 262.144 (ext. 1M) | Apache 2.0 | Safetensors (original) | Modelo base con alineamiento estándar; sin uncensoring ni FastMTP |
| Otros GGUF de la familia Qwen3.8-27B | 27B denso | 262.144 | Apache 2.0 | GGUF | Cuantizaciones estándar sin perfil K_P ni sidecar FastMTP |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El perfil "uncensored" Aggressive elimina deliberadamente los rechazos, lo que implica riesgo de generar contenido dañino, sesgado o inapropiado en producción sin salvaguardas.
- La model card recomienda una variante Balanced para trabajo agéntico crítico y de contexto largo; Aggressive no es la opción por defecto para fiabilidad.
- Riesgo de alucinación inherente a los modelos de lenguaje; no hay benchmarks publicados que cuantifiquen su tasa de error.
- La inconsistencia entre los 27B declarados y el campo safetensors del repo (1.863.907.840) debe verificarse antes de planificar despliegues.
- Los cuantizaciones K_P pueden mostrarse como "?" en la columna de cuantización de LM Studio; es un problema de visualización, no de carga.
- El widget de compatibilidad de hardware de Hugging Face puede no reconocer los cuantos K_P; hay que usar "View variants" o "Files and versions".
- El contexto de 1.000.000 tokens es una extensión declarada, no nativa; el rendimiento en esa longitud no está documentado.
- Licencia Apache 2.0 permite uso comercial, pero el usuario asume la responsabilidad legal del contenido generado sin filtros.
- No se dispone de información sobre sesgos específicos del perfil de uncensoring ni sobre evaluación de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Asian43-Nimf/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF
- Repo original del autor del perfil: https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Discord del autor: https://discord.gg/SZ5vacTXYf
- Fichero Q8_K_P: https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF/resolve/main/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-Q8_K_P.gguf
- Proyector de visión BF16: https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF/resolve/main/mmproj-Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-BF16.gguf
- Sidecar FastMTP 32K: https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF/resolve/main/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-FastMTP-32K.gguf
