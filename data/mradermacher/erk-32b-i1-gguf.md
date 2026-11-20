# mradermacher/Erk-32B-i1-GGUF

## Resumen

Erk-32B-i1-GGUF es la versión cuantizada en formato GGUF del modelo Erk-32B, un modelo de lenguaje de 32.762 millones de parámetros desarrollado originalmente por ecloudtech y cuantizado por mradermacher. Se trata de un modelo derivado de la familia Qwen3 mediante entrenamiento continuo (continued pretraining) especializado en turco, lo que lo convierte en una de las pocas alternativas de gran tamaño específicamente orientadas al idioma turco con licencia Apache 2.0.

El modelo aborda el problema de la baja representación del turco en los grandes modelos fundacionales: aunque Qwen3 cubre decenas de idiomas, su rendimiento en turco queda por debajo del de modelos entrenados específicamente con corpus nativos. Erk-32B parte de una base Qwen3 y aplica un entrenamiento continuo sobre datos turcos, preservando las capacidades generales de razonamiento y conversación del modelo original.

Esta ficha describe la variante cuantizada i1 (imatrix) publicada por mradermacher, que ofrece 24 niveles de cuantización desde IQ1_S (7,4 GB) hasta Q6_K (27,0 GB), permitiendo desplegar un modelo de 32B en hardware de consumo. Es relevante para desarrolladores que necesiten un LLM competente en turco ejecutable localmente con llama.cpp u Ollama, sin depender de APIs externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3, segun tags del autor) |
| Parametros totales | 32.762.123.264 (32,76 B) |
| Parametros activos | no disponible (no es MoE segun los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K |
| Idiomas soportados | Turco (tr) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1/imatrix); el modelo base en safetensors |
| Tamano del repositorio | 351,8 GB (todas las cuantizaciones) |
| Cuantizacion con imatrix | Si (fichero imatrix incluido para generar cuantizaciones propias) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only heredado de Qwen3, con 32.762 millones de parámetros totales. El modelo base ecloudtech/Erk-32B se construye mediante continued pretraining sobre una base Qwen3, con el objetivo de reforzar la competencia en turco. Los tags del autor indican explícitamente `qwen3` y `continued-pretraining`, lo que confirma la línea de trabajo, aunque no se detalla el volumen de tokens adicionales ni la composición exacta del corpus turco empleado.

No se dispone de información pública sobre el proceso de alineación (RLHF, DPO o similares), la composición del dataset de entrenamiento ni innovaciones técnicas específicas más allá del propio entrenamiento continuo. La variante descrita aquí es una cuantización i1 con matriz de importancia (imatrix), generada por mradermacher a partir del modelo base en safetensors; este proceso no modifica la arquitectura, sino que optimiza la asignación de bits por tensor para preservar la calidad en cada nivel de compresión.

## Capacidades

- Generación de texto y conversación multi-turno en turco, con etiqueta `conversational` en el repositorio.
- Razonamiento general y respuesta a instrucciones heredadas de la base Qwen3.
- Capacidades de código y matemáticas presumiblemente conservadas del modelo base, aunque no se documentan explícitamente en la información disponible.
- Soporte multilingüe limitado: el autor declara únicamente turco (`tr`) como idioma, por lo que el rendimiento en otros idiomas no está garantizado.
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que facilita su despliegue en infraestructuras de inferencia estándar.
- Tool calling y function calling: no disponible en la información proporcionada.
- Modo thinking o razonamiento extendido: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Atención al cliente en turco: el modelo puede gestionar conversaciones multi-turno con usuarios turcoparlantes, manteniendo coherencia contextual gracias a su tamaño de 32B y a su entrenamiento específico en turco, lo que reduce los errores gramaticales y de registro típicos de modelos multilingües genéricos.
- Generación de contenido editorial en turco: redacción de artículos, resúmenes y textos de marketing con fluidez nativa, desplegable localmente para evitar el envío de datos sensibles a APIs externas.
- Procesamiento de documentación técnica turca: extracción de información, reescritura y clasificación de documentos corporativos en turco, aprovechando la ventana de contexto del modelo base (no documentada pero presumiblemente amplia por herencia de Qwen3).
- Asistentes de código para desarrolladores turcos: generación y explicación de código con comentarios y documentación en turco, útil en equipos que trabajan en ese idioma.
- Investigación lingüística y evaluación de LLM en turco: banco de pruebas para estudiar el efecto del continued pretraining sobre una base multilingüe, comparando Erk-32B con Qwen3 original en tareas turcas.
- Despliegue en entornos con requisitos de soberanía de datos: al ser Apache 2.0 y ejecutable con llama.cpp, permite alojar el modelo en infraestructura propia (on-premise) sin dependencia de proveedores cloud.
- Prototipado rápido en estaciones de trabajo: la cuantización Q4_K_M (19,9 GB) permite ejecutar el modelo en una GPU de consumo de 24 GB, facilitando iteración local sin costes de API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, según tamaño del fichero GGUF más overhead de contexto):
  - i1-IQ1_S (7,4 GB): ~9-10 GB VRAM.
  - i1-IQ2_M (11,5 GB): ~13-14 GB VRAM.
  - i1-IQ3_M (15,0 GB): ~17-18 GB VRAM.
  - i1-IQ4_XS (17,8 GB): ~20 GB VRAM.
  - i1-Q4_K_M (19,9 GB): ~22-23 GB VRAM.
  - i1-Q5_K_M (23,3 GB): ~26 GB VRAM.
  - i1-Q6_K (27,0 GB): ~30 GB VRAM.
- GPU recomendadas: A100 40/80 GB o H100 para las cuantizaciones altas con contexto largo; RTX 4090 (24 GB) para Q4_K_M o IQ4_XS con contexto moderado; RTX 3090 (24 GB) equivalente.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con cuantizaciones Q4 o inferiores; en GPUs de 16 GB solo con IQ2/IQ3 y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF; el tag `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia estándar. vLLM y TGI no soportan GGUF de forma nativa generalizada, por lo que requerirían el modelo base en safetensors.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Erk-32B-i1-GGUF (este) | 32,76 B | no disponible | Turco | Apache 2.0 | GGUF |
| ecloudtech/Erk-32B (base) | 32,76 B | no disponible | Turco | Apache 2.0 | safetensors |
| Qwen3-32B (base presumible) | ~32 B | no disponible en esta ficha | Multilingue | Apache 2.0 | safetensors, GGUF |
| mradermacher/Erk-32B-GGUF (cuantizaciones estaticas) | 32,76 B | no disponible | Turco | Apache 2.0 | GGUF |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estas alternativas en la información proporcionada. La diferencia principal entre Erk-32B y Qwen3-32B radica en el entrenamiento continuo en turco; frente a las cuantizaciones estáticas de mradermacher, la variante i1 emplea matrices de importancia para mejorar la calidad por bit.

## Limitaciones y advertencias

- El modelo declara únicamente turco como idioma soportado; su rendimiento en castellano u otros idiomas no está garantizado y probablemente sea inferior al de Qwen3 original.
- Riesgo de alucinación inherente a los LLM de 32B, especialmente en dominios especializados no cubiertos por el corpus de entrenamiento continuo.
- No se documentan sesgos específicos, pero el continued pretraining sobre un corpus turco puede introducir sesgos culturales o políticos propios de las fuentes utilizadas.
- No se especifica la longitud de contexto efectiva; conviene validarla empíricamente antes de usarla en producción con documentos largos.
- Las cuantizaciones por debajo de Q4 (especialmente IQ1 e IQ2) degradan notablemente la calidad; el autor las etiqueta como "for the desperate" o "very low quality".
- Aunque la licencia es Apache 2.0 y permite uso comercial, debe verificarse que el modelo base ecloudtech/Erk-32B mantiene la misma licencia y que no arrastra restricciones adicionales de Qwen3.
- El repositorio ocupa 351,8 GB; conviene descargar solo la cuantización necesaria mediante descarga selectiva de ficheros.
- No hay información sobre tool calling ni modo thinking, por lo que no debe asumirse su disponibilidad en pipelines de agentes.

## Enlaces

- Repositorio Hugging Face (esta cuantización): https://huggingface.co/mradermacher/Erk-32B-i1-GGUF
- Modelo base: https://huggingface.co/ecloudtech/Erk-32B
- Cuantizaciones estáticas del mismo modelo: https://huggingface.co/mradermacher/Erk-32B-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Erk-32B-i1-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
