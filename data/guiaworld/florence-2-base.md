# GuiAworld/Florence-2-base

## Resumen

Florence-2-base es un modelo de vision fundacional desarrollado inicialmente por Microsoft y relanzado en este repositorio por GuiAworld. Se trata de un modelo de tipo secuencia a secuencia que unifica una amplia variedad de tareas de vision y vision-lenguaje mediante un sistema de prompts de texto simples. Fue preentrenado sobre el dataset FLD-5B, que contiene 5.4 mil millones de anotaciones en 126 millones de imagenes, lo que le permite realizar desde captioning hasta deteccion de objetos y segmentacion sin necesidad de cabeceras de tarea especificas.

El modelo tiene 231,6 millones de parametros (0.23B) y esta disponible en formato safetensors. Su arquitectura permite trabajar tanto en escenarios zero-shot como en configuraciones finetuned. Esta version base es el checkpoint preentrenado sin ajuste fino en tareas especificas, por lo que sirve como punto de partida para tareas de vision por computador, pero no ofrece el rendimiento optimizado de la version -ft. La licencia MIT permite su uso comercial y su integracion en proyectos propietarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer secuencia a secuencia (encoder-decoder) para vision y lenguaje |
| Parametros totales | 231.567.705 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Florence-2-base utiliza una arquitectura de transformer secuencia a secuencia, compuesta por un encoder visual y un decoder autorregresivo. Se le presenta una imagen junto con un prompt de texto, y el modelo genera una respuesta secuencial que puede ser interpretada como bounding boxes, etiquetas, captions o segmentaciones segun la tarea solicitada.

El preentrenamiento se realizo sobre el dataset FLD-5B, con 5.4 mil millones de anotaciones extraidas de 126 millones de imagenes. Este proceso de multi-tarea permite que el modelo aprenda representaciones unificadas de distintos tipos de anotaciones visuales. La descripcion oficial indica que el modelo fue entrenado con float16. No se menciona en la informacion disponible si se aplicaron tecnicas como RLHF o DPO. El checkpoint de este repositorio corresponde a la version preentrenada (no finetuned) del modelo original de Microsoft.

## Capacidades

- Generacion de captions para imagenes, tanto generales como detalladas o muy detalladas.
- Deteccion de objetos con bounding boxes y etiquetas.
- Dense region caption: genera captions para multiples regiones de una imagen junto con sus coordenadas.
- Region proposal: propone regiones candidatas sin etiquetas semanticas.
- Caption to phrase grounding: enlaza palabras o frases de un texto con regiones especificas de la imagen.
- Soporte de vision y lenguaje basado en prompts, sin necesidades de ajuste para tareas nuevas.
- Capacidad zero-shot: funciona directamente con prompts de tarea sin entrenamiento adicional.

## Casos de uso

- Etiquetado automatico de imagenes para bases de datos: el modelo puede generar captions y descripciones detalladas de miles de imagenes, lo que facilita la construccion de dataset o sistemas de busqueda por texto.
- Deteccion de objetos en inventario visual: usar el prompt `<OD>` para localizar productos, contarlos y clasificarlos automaticamente en sistemas de gestion de almacen.
- Moderacion de contenido: la deteccion de objetos permite identificar contenido visual problematico, como objetos prohibidos, y filtrarlo de forma automatica en plataformas de usuario.
- Grounding de texto en imagenes para documentacion tecnica: mediante `<CAPTION_TO_PHRASE_GROUNDING>`, se pueden asociar piezas de un manual con sus partes visuales, generando diagramas interactivos.
- Generacion de metadatos para archivos multimedia: el modelo produce captions y regiones etiquetadas como metadatos enriquecidos para catalogo de material fotografico o de video.
- Propuesta de regiones en pipelines de vision por computador: usando `<REGION_PROPOSAL>`, se pueden obtener candidatos a objetos para alimentar a modelos de clasificacion o segmentacion mas especializados.
- Accesibilidad: descripcion detallada de imagenes para asistentes de lectura de pantalla o sistemas de ayuda a personas con discapacidad visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en FP16, teniendo en cuenta el checkpoint de 0.5 GB y las activaciones del procesado de imagen.
- GPU recomendadas: puede ejecutarse en GPUs de consumo con al menos 4 GB de VRAM, como una RTX 3050, RTX 3060 o superior.
- Tambien puede ejecutarse en CPU, aunque con mayor latencia. Se recomienda al menos 8 GB de RAM para ello.
- Opciones de despliegue: puede cargarse de forma nativa mediante `transformers` con `AutoProcessor` y `AutoModelForCausalLM`, usando `trust_remote_code=True`. No se ha identificado soporte oficial para vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Florence-2-base (este) | 231.6M | no disponible | MIT | Hugging Face |
| Florence-2-large | 0.77B | no disponible | MIT | Hugging Face |
| Florence-2-base-ft | 231.6M | no disponible | MIT | Hugging Face |
| Florence-2-large-ft | 0.77B | no disponible | MIT | Hugging Face |

La version base de este repositorio y la version `-base-ft` comparten arquitectura y numero de parametros, pero la version finetuned esta ajustada en un conjunto de tareas concretas y suele ofrecer mejores resultados en captioning, VQA y deteccion. La version large ofrece una capacidad mayor pero requiere mas recursos de computo.

## Limitaciones y advertencias

- El modelo base no esta finetuned, por lo que su rendimiento en tareas especificas puede ser inferior al de las versiones finetuned.
- Puede mostrar sesgos heredados del dataset de preentrenamiento, que no estan documentados en la informacion disponible.
- Riesgo de alucinacion en captions detalladas: el modelo puede generar descripciones plausibles pero incorrectas de objetos o relaciones no presentes en la imagen.
- No se dispone de informacion sobre la ventana de contexto, ya que es un modelo de vision y no un LLM puro.
- La licencia MIT permite uso comercial, pero los responsables del despliegue deben verificar la procedencia legal de las imagenes procesadas.
- El uso de `trust_remote_code=True` implica la ejecucion de codigo personalizado, lo que requiere una revision de seguridad en entornos de produccion.

## Enlaces

- Repositorio Hugging Face (GuiAworld/Florence-2-base): https://huggingface.co/GuiAworld/Florence-2-base
- Paper tecnico de Florence-2: https://arxiv.org/abs/2311.06242
- Original de Microsoft en Hugging Face: https://huggingface.co/microsoft/Florence-2-base
- Notebook de inferencia de Florence-2-large: https://huggingface.co/microsoft/Florence-2-large/blob/main/sample_inference.ipynb
