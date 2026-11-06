# namcb1622/phobert_cnn_toxic_cmt

## Resumen

`phobert_cnn_toxic_cmt` es un modelo publicado en Hugging Face por el usuario namcb1622 bajo licencia CC-BY-4.0. Por la nomenclatura del identificador, se trata de una combinacion de un encoder PhoBERT (variante de BERT preentrenada para vietnamita) con una cabeza convolucional (CNN), orientada presumiblemente a la deteccion de contenido toxico en comentarios. El sufijo "cmt" sugiere "comments", lo que refuerza la hipotesis de un clasificador de toxicidad sobre texto de comentarios en linea.

La model card publicada es practicamente vacia: unicamente declara la licencia, sin descripcion, sin datos de entrenamiento, sin metricas ni instrucciones de uso. El repositorio ocupa 0,6 GB, un tamano compatible con los pesos de un encoder tipo BERT-base (aproximadamente 135 millones de parametros en precision fp32) mas la cabeza CNN y posibles artefactos auxiliares.

Su relevancia actual es limitada: no registra descargas ni likes, no declara idiomas soportados y no incluye documentacion tecnica. Resulta util unicamente como referencia para quien conozca el proyecto de origen o quiera inspeccionar los pesos directamente, pero no constituye una opcion recomendable para produccion sin una evaluacion previa por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder tipo BERT (PhoBERT) con cabeza CNN, segun la nomenclatura del identificador; no confirmado en la model card |
| Parametros totales | no disponible (el tamano del repo, 0,6 GB, es compatible con un encoder base de ~135 M de parametros en fp32) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (PhoBERT base emplea tipicamente 256 tokens, sin confirmacion en este repositorio) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (por el prefijo "phobert" se infiere vietnamita, sin confirmacion) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | no disponible (el repositorio contiene 0,6 GB de artefactos, presumiblemente safetensors o binarios PyTorch, sin confirmar) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura exacta ni sobre el proceso de entrenamiento. La unica evidencia es el nombre del repositorio, que apunta a una combinacion de PhoBERT (encoder transformer preentrenado sobre corpus vietnamita) con una capa convolucional, un patron habitual en tareas de clasificacion de texto corto como la deteccion de toxicidad en comentarios. No hay datos sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de fine-tuning supervisado, RLHF o DPO, ni sobre innovaciones tecnicas como decodificacion especulativa o atencion lineal.

Tampoco se documenta si el modelo fue entrenado desde cero o mediante fine-tuning de un checkpoint PhoBERT publico, ni que variante de PhoBERT (base o large) se utilizo como punto de partida.

## Capacidades

- Clasificacion de texto, presumiblemente binaria o multietiqueta, orientada a la deteccion de toxicidad en comentarios; no confirmado en la model card.
- No se documenta generacion de texto, razonamiento, codigo, matematicas ni vision.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues: no disponibles; por la nomenclatura se infiere vietnamita, sin confirmacion.
- No se documentan modos especiales (thinking mode, audio, etc.).

## Casos de uso

- Moderacion de comentarios en plataformas vietnamitas: si el modelo confirma su naturaleza de clasificador de toxicidad, podria emplearse para filtrar comentarios ofensivos en foros o redes sociales, aunque requeriria validacion previa por la ausencia de metricas publicadas.
- Investigacion academica sobre deteccion de toxicidad en vietnamita: util como punto de partida o baseline para comparar con otros clasificadores, siempre que se documente su procedencia.
- Prototipado rapido de pipelines de moderacion: al ser un modelo pequeno (0,6 GB), puede cargarse en una GPU consumer para experimentacion inicial.
- Analisis de sesgos en clasificadores de toxicidad: serviria como objeto de estudio para auditar el comportamiento de encoders PhoBERT con cabezas CNN en textos de comentarios.
- Fine-tuning adicional sobre dominios especificos: si los pesos son compatibles con la libreria Transformers, podria reentrenarse sobre un corpus propio de comentarios.
- Evaluacion comparativa de arquitecturas encoder+CNN frente a encoders puros en tareas de clasificacion de texto corto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; por el tamano del repositorio (0,6 GB), cabria esperar un consumo inferior a 2 GB en fp32 y por debajo de 1 GB en cuantizacion de 8 bits, aunque no se confirma el formato de pesos.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM seria suficiente para un encoder de este tamano; no hay datos oficiales.
- Cabe en GPU consumer: previsiblemente si (GTX 1650, RTX 3060, RTX 4090), sin confirmacion.
- Opciones de despliegue: no documentadas; si los pesos son compatibles con Transformers, podria desplegarse con PyTorch, ONNX Runtime o TGI. No se confirma soporte de vLLM, llama.cpp ni Ollama.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| namcb1622/phobert_cnn_toxic_cmt | no disponible (~135 M estimados) | no disponible | CC-BY-4.0 | Hugging Face, 0 descargas |
| vinai/phobert-base | ~135 M | 256 tokens | MIT | Hugging Face, ampliamente usado |
| vinai/phobert-large | ~370 M | 256 tokens | MIT | Hugging Face, ampliamente usado |
| bert-base-multilingual-cased | ~178 M | 512 tokens | Apache-2.0 | Hugging Face, muy usado |

La comparacion se limita a arquitecturas de referencia, ya que no se dispone de datos de rendimiento del modelo evaluado ni de clasificadores de toxicidad vietnamitas comparables documentados en la informacion proporcionada.

## Limitaciones y advertencias

- Model card practicamente vacia: no hay descripcion, datos de entrenamiento, metricas ni instrucciones de uso.
- Ausencia total de benchmarks: imposible evaluar su calidad o compararlo con alternativas.
- Riesgo de alucinacion y sesgos: no evaluados; al ser un clasificador, el riesgo se traduce en falsos positivos y falsos negativos no cuantificados.
- Idiomas soportados no declarados: se infiere vietnamita por el prefijo "phobert", pero no hay confirmacion.
- Licencia CC-BY-4.0: permite uso comercial con atribucion, pero al no documentarse la procedencia de los datos de entrenamiento no puede descartarse un conflicto con las condiciones de uso de los corpus originales.
- Sin descargas ni likes: no hay evidencia de validacion por parte de la comunidad.
- No recomendable para produccion sin una evaluacion independiente y una auditoria de los pesos.

## Enlaces

- Hugging Face: https://huggingface.co/namcb1622/phobert_cnn_toxic_cmt
- Repositorio oficial de PhoBERT (referencia): https://github.com/VinAIResearch/PhoBERT
- Modelo PhoBERT base en Hugging Face (referencia): https://huggingface.co/vinai/phobert-base
