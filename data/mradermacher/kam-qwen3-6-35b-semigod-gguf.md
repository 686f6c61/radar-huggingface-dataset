# mradermacher/kam-qwen3.6-35b-semigod-GGUF

## Resumen

Este repositorio contiene las cuantizaciones GGUF del modelo `kam-qwen3.6-35b-semigod`, preparadas por mradermacher a partir del modelo base alojado en `SuperTensora/kam-qwen3.6-35b-semigod`. Se trata de un modelo de 35.505.251.456 parámetros (35,5B) que, por su nombre y por la familia Qwen 3.6, parece ser una variante del arquitectura MoE Qwen3.6-35B-A3B, aunque no se confirma explícitamente en la información disponible. El repositorio incluye además archivos `mmproj` (multi-modal projection), lo que indica que el modelo base incorpora capacidades de visión además de texto.

La relevancia de esta publicación radica en que ofrece un amplio abanico de cuantizaciones GGUF (desde Q2_K hasta Q8_0) que permiten ejecutar el modelo en hardware muy diverso, desde GPUs de consumo con 16 GB de VRAM hasta servidores con mayor capacidad. Al ser un modelo de la familia Qwen 3.6, hereda presumiblemente las mejoras de contexto largo y razonamiento de dicha generación, aunque no se dispone de documentación oficial que lo confirme para esta variante concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (probable, basado en Qwen3.6-35B-A3B) |
| Parametros totales | 35.505.251.456 (35,5B) |
| Parametros activos | 3B (estimado, no confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre el entrenamiento del modelo base `kam-qwen3.6-35b-semigod`. Por el nombre y el tamano, se infiere que se trata de una variante de la familia Qwen 3.6, concretamente del modelo Qwen3.6-35B-A3B, que en su version original es un transformer con arquitectura de mezcla de expertos (MoE) con 35B parametros totales y 3B activos por token. El sufijo "semigod" sugiere un fine-tuning especifico, posiblemente relacionado con la eliminacion o suavizado de restricciones de seguridad (abliteracion), aunque no hay confirmacion.

El repositorio actual es una cuantizacion estatica realizada por mradermacher, sin uso de imatrix ni pesos ponderados. Se incluyen dos archivos `mmproj` (Q8_0 y f16) que permiten al modelo procesar entradas multimodales (imagenes), lo que indica que el modelo base fue entrenado con un proyector de vision.

## Capacidades

- Generacion de texto en ingles.
- Procesamiento multimodal (vision) gracias a los archivos `mmproj` incluidos.
- Razonamiento y comprension de lenguaje natural, heredados de la familia Qwen 3.6 (no verificado para esta variante).
- Ejecucion local en CPU y GPU mediante el formato GGUF, compatible con llama.cpp, Ollama, LM Studio y otros motores.
- No se dispone de informacion sobre soporte de tool calling, function calling o capacidades de agente.

## Casos de uso

- Inferencia local en equipos de consumo: gracias a las cuantizaciones Q4_K_M (21,8 GB) o Q5_K_M (25,4 GB), el modelo puede ejecutarse en GPUs con 24 GB de VRAM (RTX 3090/4090) o incluso en Mac con 32 GB de RAM unificado, ofreciendo una alternativa a APIs de pago.
- Despliegue en servidores con recursos limitados: la cuantizacion Q2_K (13,3 GB) permite ejecutar el modelo en GPUs de 16 GB, aunque con perdida de calidad notable.
- Prototipado rapido con llama.cpp: al ser GGUF, se integra directamente con el ecosistema llama.cpp para pruebas de concepto sin necesidad de convertir pesos.
- Aplicaciones multimodales locales: los archivos `mmproj` permiten usar el modelo para tareas de vision-language (captioning, VQA) en entornos sin conexion.
- Experimentacion con modelos MoE de gran tamano: investigadores pueden estudiar el comportamiento de un MoE de 35B en hardware modesto gracias a las cuantizaciones de baja precision.
- Generacion de contenido creativo en ingles: el modelo puede utilizarse para redaccion, traduccion o dialogo, siempre que el caso de uso no requiera garantias de exactitud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan datos de MMLU, HumanEval, GSM8K ni otras evaluaciones para este modelo o su variante base.

## Requisitos de hardware

- VRAM estimada para inferencia (segun cuantizacion):
  - Q2_K: ~13,3 GB (cabe en GPU de 16 GB)
  - Q3_K_M: ~17,3 GB (requiere GPU de 20 GB o mas)
  - Q4_K_M: ~21,8 GB (recomendado para GPU de 24 GB)
  - Q5_K_M: ~25,4 GB (GPU de 32 GB o mas)
  - Q8_0: ~37,9 GB (GPU de 40 GB o mas, o multiples GPUs)
- GPUs recomendadas: RTX 3090/4090 (24 GB) para Q4_K_M; A100 40 GB o H100 para Q8_0; Mac M4 Pro/Max con 32 GB o mas para Q5_K_M.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, vLLM (con conversion previa a safetensors).
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantizacion. En una RTX 4090 con Q4_K_M se puede esperar un rendimiento de 20-40 tokens/s, pero es una estimacion no verificada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| kam-qwen3.6-35b-semigod (este repo) | 35,5B (MoE) | no disponible | no disponible | GGUF | Variante "semigod" de Qwen3.6-35B |
| Qwen3.6-35B-A3B-GGUF (mradermacher) | 35B (MoE, 3B activos) | 1M (segun guias) | Apache 2.0 (Qwen) | GGUF | Version original sin fine-tuning |
| Qwen3.6-27B (dense) | 27B | 1M | Apache 2.0 | safetensors/GGUF | Alternativa densa, menor tamano |

La comparativa se basa en informacion publica de la familia Qwen 3.6. No se dispone de datos de rendimiento para la variante "semigod".

## Limitaciones y advertencias

- Licencia no especificada: el repositorio no indica la licencia del modelo base ni de las cuantizaciones, lo que impide conocer las restricciones de uso comercial.
- Idioma limitado: la model card solo declara ingles; no se garantiza un rendimiento adecuado en otros idiomas.
- Sin informacion de sesgos ni alucinaciones: al no haber documentacion del fine-tuning, se desconocen los riesgos especificos de este modelo.
- Cuantizaciones estaticas: no se han generado con imatrix, por lo que la calidad puede ser inferior a la de cuantizaciones ponderadas del mismo tamaño.
- Contexto no confirmado: aunque la familia Qwen 3.6 soporta hasta 1M de tokens, no se ha verificado que esta variante mantenga esa capacidad.
- Riesgo de uso indebido: el sufijo "semigod" sugiere una posible eliminacion de salvaguardas; se recomienda evaluar el modelo antes de usarlo en produccion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/kam-qwen3.6-35b-semigod-GGUF
- Modelo base: https://huggingface.co/SuperTensora/kam-qwen3.6-35b-semigod
- Repositorio de Qwen3.6-35B-A3B-GGUF (mismo autor): https://huggingface.co/mradermacher/Qwen3.6-35B-A3B-GGUF
- Guia de Qwen 3.6 (insiderllm): https://insiderllm.com/guides/qwen-3-6-local-ai-guide/
- Guia para desarrolladores (lushbinary): https://lushbinary.com/blog/qwen-3-6-developer-guide-benchmarks-architecture-api-self-hosting/
- Articulo sobre ejecucion en Mac mini M4: https://medium.com/macoclock/qwen3-6-35b-runs-on-a-16-gb-m4-mac-mini-fully-in-memory-no-tricks-1ec4b5bcec35
