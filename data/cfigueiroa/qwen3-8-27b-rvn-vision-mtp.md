# cfigueiroa/Qwen3.8-27B-RVN-vision-MTP

## Resumen

Qwen3.8-27B-RVN-vision-MTP es una variante no oficial del modelo multimodal Qwen3.8-27B de Alibaba, creada por el usuario cfigueiroa. Combina tres modificaciones sobre el modelo base: un proceso de ablación de rechazo (abliteration) aplicado tres veces mediante la técnica ARA, que elimina las negativas de seguridad del modelo; la restauración de la cabeza de predicción multi-token (MTP/NextN) que el autor de la variante RVN había eliminado; y el proyector de visión oficial de Qwen3.8-27B en cuantización Q8_0. El resultado es un archivo GGUF único (RVN-Q4_K_M-MTP.gguf) de aproximadamente 16,8 GB que integra texto, visión y predicción multi-token en un solo fichero, más un proyector de visión separado.

Esta ficha es relevante para desarrolladores que buscan un modelo multimodal sin censura, capaz de procesar imágenes y texto, con soporte de predicción multi-token para acelerar la inferencia, y que quepa en una GPU de consumo con 24 GB de VRAM. La licencia Apache-2.0 permite uso comercial sin restricciones, aunque el modelo no está afiliado a Qwen ni a los autores de las variantes intermedias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (Qwen3.8-27B) con modificaciones RVN (abliteration ARA) y cabeza MTP/NextN |
| Parametros totales | 27B (modelo base); el archivo GGUF Q4_K_M pesa ~16,8 GB |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262K tokens (segun especificaciones del modelo base; no confirmado para esta variante) |
| Tipos de cuantizacion | Q4_K_M (modelo principal), Q8_0 (proyector de vision mmproj) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B, un transformer denso multimodal con codificador de vision nativo. Sobre esta base, el autor aplica la tecnica ARA (activation rectification and ablation) tres veces, dando lugar al "cerebro RVN" publicado por 0bserverx en su repositorio Heretic-Abliterated-Uncensored. Este proceso elimina las capas de rechazo de contenido, produciendo un modelo sin censura. Posteriormente, cfigueiroa restaura los 15 tensores de la cabeza MTP/NextN (`blk.64.*`) que el autor de RVN habia eliminado durante la conversion con `--no-nextn`, tomandolos del modelo Qwen original. Finalmente, anade el proyector de vision oficial de Qwen3.8-27B en formato GGUF Q8_0, obtenido del repositorio ggml-org. No se ha realizado ningun entrenamiento adicional; se trata de una recombinacion de pesos existentes.

## Capacidades

- Generacion de texto y razonamiento multimodal: procesa imagenes junto con texto gracias al proyector de vision mmproj.
- Prediccion multi-token (MTP/NextN): acelera la inferencia al predecir varios tokens por paso, reduciendo la latencia en generacion larga.
- Sin censura: el proceso de abliteration elimina las negativas de seguridad, permitiendo respuestas sin restricciones de contenido (con los riesgos asociados).
- Soporte de tool calling y agentes: heredado del modelo base Qwen3.8-27B, que incluye capacidades de llamada a funciones y razonamiento multi-paso.
- Capacidades multilingues: no se han publicado datos especificos para esta variante, pero el modelo base soporta multiples idiomas.
- Vision nativa: entrada de imagenes de alta resolucion, util para capturas de pantalla, diagramas, documentos escaneados y otros contenidos visuales.

## Casos de uso

- Asistente local multimodal sin censura: desplegar en una estacion de trabajo con RTX 3090 Ti (24 GB VRAM) para tareas de analisis de imagenes y generacion de texto sin filtros de contenido.
- Generacion de codigo a partir de capturas de pantalla: el modelo puede interpretar imagenes de interfaces o diagramas y generar codigo correspondiente, aprovechando la vision nativa y las capacidades de programacion de Qwen3.8-27B.
- Agente autonomo con vision y tool calling: integrar en pipelines de automatizacion donde el modelo observe el estado de una aplicacion (captura de pantalla) y ejecute acciones mediante llamadas a funciones.
- Investigacion en alineacion y abliteration: estudiar el impacto de la eliminacion de capas de seguridad en las capacidades del modelo, comparando con la version original.
- Prototipado rapido de aplicaciones multimodales: gracias al formato GGUF y la compatibilidad con llama.cpp, se puede integrar en proyectos con vLLM o llama-server sin necesidad de infraestructura pesada.
- Procesamiento de documentos con contenido visual: extraer informacion de facturas, formularios o graficos combinando OCR visual y razonamiento textual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para esta variante en la informacion disponible. El modelo base Qwen3.8-27B reporta puntuaciones como DeepSWE 42.2, Terminal Bench 73.0 y OSWorld 84.3, pero estas cifras corresponden al modelo original sin las modificaciones de abliteration ni la cuantizacion Q4_K_M. La cuantizacion y el proceso de ablacion pueden alterar el rendimiento real.

## Requisitos de hardware

- VRAM estimada: 24 GB para el archivo principal Q4_K_M (~16,8 GB) junto con el proyector de vision Q8_0 (~251 MiB). El contexto largo consume memoria KV adicional aparte.
- GPU recomendada: RTX 3090 Ti, RTX 4090, A100 40GB, o cualquier GPU con 24 GB o mas de VRAM.
- Compatibilidad con GPU de consumo: si, siempre que se disponga de 24 GB de VRAM (RTX 3090, 4090, etc.).
- Opciones de despliegue: llama-server (llama.cpp) con `--mmproj` para vision, tambien compatible con vLLM si se convierte a safetensors, y Ollama si se importa el GGUF.
- Latencia y throughput: no se han publicado mediciones especificas. La cabeza MTP/NextN deberia reducir la latencia de generacion en comparacion con la version sin ella, pero no hay datos cuantitativos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Censura | Licencia | Formato |
|---|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27B | 262K | Si | Si | Apache-2.0 | safetensors |
| Qwen3.8-27B-Heretic-Abliterated (0bserverx) | 27B | 262K | No | No | Apache-2.0 | GGUF (sin NextN) |
| Qwen3.8-27B-RVN-vision-MTP (este) | 27B | 262K (teorico) | Si | No | Apache-2.0 | GGUF (con NextN) |
| Llama 3.1 8B Instruct | 8B | 128K | No | Si | Llama 3.1 | safetensors/GGUF |

La principal diferencia frente al original es la ausencia de censura y la cuantizacion GGUF. Frente a la variante de 0bserverx, esta anade vision y restaura la prediccion multi-token. Comparado con modelos mas pequenos como Llama 3.1 8B, ofrece mucho mayor capacidad multimodal y de razonamiento, a costa de mayores requisitos de VRAM.

## Limitaciones y advertencias

- El proceso de abliteration puede degradar la calidad de las respuestas en tareas que requieren matices de seguridad o seguimiento de instrucciones complejas.
- La cuantizacion Q4_K_M introduce perdida de precision, especialmente en tareas de matematicas o codigo de alta complejidad.
- No hay garantia de que la cabeza MTP/NextN funcione correctamente en todos los escenarios; el autor advierte que el acelerador ya esta incluido en el archivo principal y no debe usarse un sidecar MTP.
- El modelo puede generar contenido ofensivo, ilegal o peligroso debido a la eliminacion de las salvaguardas. No es apto para aplicaciones en produccion donde se requiera moderacion de contenido.
- La longitud de contexto de 262K es teorica; en la practica, el consumo de memoria KV puede limitar el contexto util en GPUs de 24 GB.
- No hay soporte oficial ni mantenimiento por parte de Alibaba ni de los autores de las variantes intermedias. El repositorio puede desaparecer o cambiar sin aviso.
- Los datos de parametros totales en safetensors (460.730.096) no corresponden al modelo completo; probablemente se refieren a un componente especifico, por lo que se ha indicado el valor del modelo base.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/cfigueiroa/Qwen3.8-27B-RVN-vision-MTP
- Repositorio base de Qwen3.8-27B (GitHub): https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Variante intermedia de 0bserverx: https://huggingface.co/0bserverx/Qwen3.8-27B-Heretic-Abliterated-Uncensored-GGUF
- Repositorio de ggml-org con proyector de vision: https://huggingface.co/ggml-org/Qwen3.8-27B-GGUF
- Guia de referencia sobre Qwen3.8-27B: https://lovableapp.org/blog/qwen3-8-27b
