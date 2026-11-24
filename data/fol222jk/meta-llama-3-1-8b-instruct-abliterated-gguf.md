# fol222jk/Meta-Llama-3.1-8B-Instruct-abliterated-GGUF

## Resumen

Meta-Llama-3.1-8B-Instruct-abliterated-GGUF es una distribucion en formato GGUF del modelo mlabonne/Meta-Llama-3.1-8B-Instruct-abliterated, que a su vez deriva de Meta-Llama-3.1-8B-Instruct de Meta. La variante "abliterated" aplica tecnicas de ablacion direccional sobre las direcciones de rechazo del modelo original, con el objetivo de eliminar el comportamiento de negativa ante ciertas peticiones, manteniendo el resto de capacidades del modelo base. Este repositorio concreto, publicado por fol222jk, empaqueta los pesos cuantizados en GGUF para su uso con llama.cpp y entornos compatibles como LM Studio.

El modelo conserva la arquitectura transformer decoder-only del Llama 3.1 8B, con 8.030.261.312 parametros totales y una ventana de contexto nominal de 128.000 tokens (caracteristica del modelo base Llama 3.1). La cuantizacion se realizo con llama.cpp release b3472 y la opcion imatrix, empleando un dataset de calibracion publicado por bartowski. El repositorio ocupa 124,8 GB e incluye multiples niveles de cuantizacion, desde f32 hasta IQ3_XS.

La relevancia de esta ficha reside en dos factores: por un lado, permite ejecutar un modelo de 8B en hardware de consumo con cuantizaciones de 4-5 GB; por otro, la naturaleza "abliterated" implica consideraciones eticas y de seguridad importantes que deben evaluarse antes de cualquier despliegue en produccion. La licencia heredada es llama3.1, con las restricciones que esta conlleva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) |
| Parametros totales | 8.030.261.312 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 3.1 soporta 128.000 tokens) |
| Tipos de cuantizacion | f32, Q8_0, Q6_K_L, Q6_K, Q5_K_L, Q5_K_M, Q5_K_S, Q4_K_L, Q4_K_M, Q3_K_XL, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, IQ3_M, Q2_K_L, Q3_K_S, IQ3_XS |
| Idiomas soportados | no disponibles |
| Licencia | llama3.1 |
| Formato de pesos | GGUF (cuantizado con llama.cpp b3472 e imatrix) |

## Arquitectura y entrenamiento

El modelo subyacente es Llama 3.1 8B Instruct, un transformer decoder-only con 8.030 millones de parametros. La variante "abliterated" de mlabonne se obtiene aplicando ablacion direccional sobre las representaciones internas asociadas al rechazo, una tecnica que modifica los pesos para suprimir el comportamiento de negativa sin reentrenar el modelo desde cero. Sobre esa variante, este repositorio aplica cuantizacion GGUF con la herramienta llama.cpp (release b3472) usando la opcion imatrix, que emplea una matriz de importancia calculada sobre un dataset de calibracion para preservar mejor la calidad en cuantizaciones bajas.

No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO especificas para esta variante. Se desconoce igualmente el procedimiento exacto de ablacion aplicado por mlabonne, mas alla de que se trata de una modificacion post-entrenamiento sobre el modelo Instruct original.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo Instruct base.
- Razonamiento y respuesta a instrucciones en formato chat con la plantilla Llama 3.1 (`<|start_header_id|>`).
- Generacion de codigo y matematicas, en linea con las capacidades del Llama 3.1 8B Instruct.
- Soporte de tool calling / function calling: no confirmado en la informacion proporcionada para esta variante concreta.
- Capacidades de agente y razonamiento multi-paso: no confirmadas explicitamente en la informacion disponible.
- Capacidades multilingues: no disponibles (el modelo base Llama 3.1 soporta varios idiomas, pero no se detalla en esta ficha).
- Supresion del comportamiento de rechazo gracias a la ablacion, lo que amplia el rango de peticiones que el modelo respondera sin negarse.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y con LM Studio segun la model card.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar como la ablacion de direcciones de rechazo afecta al comportamiento del modelo, comparando respuestas con el Llama 3.1 Instruct original en entornos controlados de laboratorio.
- Despliegue local en hardware de consumo: con cuantizaciones Q4_K_M (4,92 GB) o IQ4_XS (4,45 GB) puede ejecutarse en GPUs consumer con 8 GB de VRAM, lo que facilita prototipado offline sin dependencia de APIs.
- Generacion de texto creativo sin restricciones: para tareas de escritura donde el modelo base tiende a rechazar ciertos temas, la variante abliterated ofrece mayor flexibilidad, siempre que el uso cumpla la licencia y la legislacion aplicable.
- Evaluacion de robustez de filtros: util para probar sistemas de moderacion y clasificadores de contenido, ya que genera respuestas que un modelo alineado rechazaria, permitiendo validar la cobertura de los filtros.
- Fine-tuning y experimentacion: al estar en GGUF y derivar de un modelo ampliamente soportado, sirve como base para experimentos de cuantizacion, LoRA o comparativas de calidad entre niveles de quant.
- Asistente conversacional en local para entornos aislados: con la plantilla de chat Llama 3.1 y una cuantizacion Q5_K_M (5,73 GB) se obtiene un asistente funcional en equipos sin conexion, adecuado para demos y pruebas internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: f32 ~32,13 GB; Q8_0 ~8,54 GB; Q6_K_L ~6,85 GB; Q5_K_M ~5,73 GB; Q4_K_M ~4,92 GB; IQ4_XS ~4,45 GB; Q3_K_M ~4,02 GB; IQ3_XS ~3,66 GB (tamanos de fichero; la VRAM real requiere margen adicional para KV cache y contexto).
- GPU recomendadas: A100 o H100 para f32 y Q8_0 con contexto largo; RTX 4090 (24 GB) para Q6_K_L o Q8_0 con contexto amplio; RTX 3090/4080 para Q5_K_M y superiores.
- Cabe en GPU consumer: si, en tarjetas con 8 GB o mas de VRAM usando Q4_K_M o IQ4_XS; en 6 GB con Q3_K_M o IQ3_M; en 4 GB con IQ3_XS o Q2_K_L (calidad reducida).
- Opciones de despliegue: llama.cpp, LM Studio (recomendado en la model card), Ollama (importando el GGUF), y servidores compatibles con GGUF. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| fol222jk/Meta-Llama-3.1-8B-Instruct-abliterated-GGUF | 8,03B | no disponible (base: 128k) | GGUF | llama3.1 | Variante abliterated cuantizada |
| mlabonne/Meta-Llama-3.1-8B-Instruct-abliterated | 8,03B | 128k (base) | safetensors | llama3.1 | Modelo origen de la ablacion |
| meta-llama/Llama-3.1-8B-Instruct | 8,03B | 128k | safetensors | llama3.1 | Modelo oficial alineado |
| bartowski/Meta-Llama-3.1-8B-Instruct-abliterated-GGUF | 8,03B | 128k (base) | GGUF | llama3.1 | Cuantizaciones de referencia del mismo modelo origen |

## Limitaciones y advertencias

- La ablacion elimina el comportamiento de rechazo, lo que puede producir contenido danino, ofensivo o ilegal segun el contexto; no es apto para aplicaciones de cara al publico sin moderacion adicional.
- Riesgo elevado de alucinacion, comun en modelos de 8B y potencialmente agravado por la perdida de calidad de las cuantizaciones bajas (Q3 y Q2).
- Las cuantizaciones por debajo de Q4 reducen notablemente la calidad; la propia model card desaconseja Q3_K_S y califica Q2_K_L como "muy baja calidad".
- Licencia llama3.1: incluye restricciones de uso comercial (limite de 700 millones de usuarios mensuales para productos derivados) y obligaciones de atribucion; debe revisarse antes de cualquier despliegue.
- No se dispone de informacion sobre sesgos especificos ni sobre evaluaciones de seguridad de esta variante.
- Idiomas soportados no documentados en esta ficha; el rendimiento fuera del ingles puede degradarse.
- El repositorio tiene 0 descargas y 0 likes, sin validacion de la comunidad; conviene verificar la integridad de los ficheros antes de usarlos en produccion.
- El autor del repositorio (fol222jk) no es el autor original de las cuantizaciones (bartowski), lo que anade un paso de redistribucion que conviene auditar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fol222jk/Meta-Llama-3.1-8B-Instruct-abliterated-GGUF
- Modelo base (abliterated): https://huggingface.co/mlabonne/Meta-Llama-3.1-8B-Instruct-abliterated
- Cuantizaciones de referencia de bartowski: https://huggingface.co/bartowski/Meta-Llama-3.1-8B-Instruct-abliterated-GGUF
- Modelo oficial Llama 3.1 8B Instruct: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Release de llama.cpp b3472: https://github.com/ggerganov/llama.cpp/releases/tag/b3472
- LM Studio: https://lmstudio.ai/
- Dataset de calibracion imatrix: https://gist.github.com/bartowski1182/eb213dccb3571f863da82e99418f81e8
