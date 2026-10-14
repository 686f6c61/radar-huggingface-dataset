# IntegralBender/distilbert-spam-detector-onnx

## Resumen

`IntegralBender/distilbert-spam-detector-onnx` es un modelo de clasificación de secuencias distribuido exclusivamente en formato ONNX, orientado a la detección de spam. Se trata de un ajuste fino (*fine-tuning*) sobre DistilBERT, la variante destilada de BERT desarrollada por Hugging Face, que reduce el tamaño de BERT-base en aproximadamente un 40 % manteniendo alrededor del 97 % de su rendimiento en tareas de comprensión del lenguaje. El repositorio ocupa 0,7 GB en disco y su autor es el usuario IntegralBender.

La relevancia de este tipo de artefactos es eminentemente práctica: al estar exportado a ONNX, el modelo puede ejecutarse con ONNX Runtime en CPU, en el navegador mediante `onnxruntime-web` o `transformers.js`, y en entornos sin GPU, lo que abarata el despliegue de filtros antispam en producción, moderación de formularios de contacto o clasificación de correo entrante a gran volumen.

La información pública disponible es muy limitada: no hay *model card*, no se declaran licencia, idiomas, métricas ni pipeline en los metadatos de Hugging Face, y el repositorio acumula 0 descargas y 1 *like* en el momento de la consulta. Cualquier uso en producción debería ir precedido de una evaluación empírica propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder basado en DistilBERT (no confirmado en la model card del repositorio) |
| Parametros totales | Del orden de 66 millones segun la arquitectura estandar de DistilBERT; no confirmado en el repositorio |
| Longitud de contexto | 512 tokens (maximo posicional estandar de DistilBERT); no confirmado en el repositorio |
| Tipos de cuantizacion | No disponible (el repositorio solo declara el tag `onnx`; se desconoce si incluye variantes INT8 o FP16) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La arquitectura subyacente es DistilBERT: un *encoder* transformer de 6 capas, 768 dimensiones ocultas y 12 cabezas de atencion, destilado desde BERT-base mediante *knowledge distillation* con un objetivo combinado de destilacion de las distribuciones de salida del profesor, *masked language modeling* y entrenamiento sobre pares de secuencias. DistilBERT base se entreno sobre el Toronto Book Corpus y Wikipedia en ingles (aproximadamente 11 000 libros y el corpus completo de Wikipedia). Sobre esta base, el autor habria anadido una cabeza de clasificacion para la tarea binaria spam / no spam, con un numero de etiquetas previsiblemente igual a 2.

No se dispone de informacion sobre el dataset de ajuste fino, el numero de pasos de entrenamiento, la composicion del corpus, la estrategia de optimizacion ni si se aplicaron tecnicas de alineacion como RLHF o DPO (poco habituales en clasificadores). Tampoco se documenta ninguna innovacion tecnica adicional mas alla de la propia destilacion y de la exportacion a ONNX, que permite grafos optimizados y ejecucion con operadores fusionados en ONNX Runtime. El hecho de que el repositorio ocupe 0,7 GB, muy por encima de los aproximadamente 255 MB de un DistilBERT en FP32, sugiere la presencia de multiples artefactos (por ejemplo, varias precisiones o ficheros auxiliares), pero esta circunstancia no esta documentada.

## Capacidades

- Clasificacion de texto binaria orientada a la deteccion de spam, presumiblemente sobre mensajes cortos o asuntos de correo.
- Inferencia en CPU sin GPU gracias al formato ONNX.
- Ejecucion en navegador o en el *edge* mediante ONNX Runtime Web.
- Capacidad multilingue: no confirmada. DistilBERT base es monolingue en ingles; existe una variante multilingue, pero no se indica cual se ha usado.
- Soporte de *tool calling* / *function calling*: no disponible (los modelos encoder de clasificacion no implementan esta funcionalidad).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Generacion de texto: no aplica; el modelo es un clasificador, no un modelo generativo.
- Modo de razonamiento explicito (*thinking mode*), vision o audio: no disponible.

## Casos de uso

- Filtrado de spam en formularios web: el modelo actua como clasificador previo al envio, etiquetando el texto del campo de mensaje y bloqueando envios con alta probabilidad de spam antes de tocar la base de datos.
- Moderacion de comentarios en foros o blogs: integrado como microservicio HTTP con ONNX Runtime, permite filtrar comentarios promocionales o enlaces sospechosos con latencia baja y coste por peticion minimo.
- Clasificacion de correo entrante en un MTA: puede ejecutarse como paso adicional en un *pipeline* de Postfix o similar para marcar mensajes y derivarlos a cuarentena.
- Deteccion de reseñas fraudulentas: aplicado a resenas de producto o valoraciones breves, sirve como primera capa de triaje antes de una revision humana.
- Triaje previo en pipelines de NLP: al ser un encoder pequeno, puede encadenarse antes de un modelo mayor (LLM o un clasificador mas costoso) para descartar el volumen mayoritario de entradas triviales y reducir coste computacional.
- Despliegue en entornos sin GPU o en dispositivos embebidos: por su tamano reducido y su formato ONNX, es viable en contenedores ligeros, funciones serverless o gateways perimetrales que no disponen de aceleracion hardware.
- Prototipado e investigacion: sirve como punto de partida reproducible para comparar estrategias de destilacion y exportacion ONNX frente a alternativas en PyTorch.
- Ejecucion 100 % en cliente: con ONNX Runtime Web el texto no abandona el navegador del usuario, lo que simplifica el cumplimiento del RGPD en formularios y chats.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El repositorio no incluye metricas de precision, recall, F1 ni una matriz de confusion, ni tampoco referencias al conjunto de evaluacion empleado (por ejemplo, SMS Spam Collection, Enron-Spam o SpamAssassin). Tampoco se documenta rendimiento comparativo frente al DistilBERT original ni frente a BERT-base.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para lotes pequenos (los pesos de un DistilBERT de ~66 M de parametros ocupan unos 255 MB en FP32 y unos 67 MB en INT8); el consumo real depende del tamano de lote y de la longitud maxima de secuencia configurada.
- GPU recomendadas: cualquier GPU con 2 GB o mas de memoria es suficiente; no se requiere una A100 ni una H100 para este modelo. Tarjetas como GTX 1650, RTX 3060 o superiores van sobradamente.
- Compatibilidad con GPU de consumo: si, cabe con holgura en cualquier GPU de consumo moderna e incluso en iGPU con memoria compartida.
- Ejecucion en CPU: totalmente viable, y probablemente el escenario de despliegue previsto dado el formato ONNX. Se recomienda ONNX Runtime con *execution providers* optimizados (OpenVINO, oneDNN).
- Opciones de despliegue: ONNX Runtime (Python, C++, C#), ONNX Runtime Web / `transformers.js` para navegador, Triton Inference Server con backend ONNX, y contenedores ligeros propios. vLLM, llama.cpp, Ollama y TGI no aplican: estan orientados a modelos generativos y no soportan de forma nativa este tipo de clasificador.
- Latencia y throughput: no se han publicado mediciones. Cualquier cifra de rendimiento usada en planificacion de capacidad deberia obtenerse midiendo sobre el hardware y las longitudes de secuencia reales del caso de uso.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Dispone de benchmarks publicos |
|---|---|---|---|---|---|
| distilbert-spam-detector-onnx (este) | ~66 M (no confirmado) | 512 (no confirmado) | ONNX | no disponible | no |
| DistilBERT-base-uncased (modelo base) | 66 M | 512 | safetensors, PyTorch | Apache 2.0 | si (GLUE) |
| BERT-base-uncased | 110 M | 512 | safetensors, PyTorch | Apache 2.0 | si (GLUE) |
| RoBERTa-base | 125 M | 512 | safetensors, PyTorch | MIT | si (GLUE) |

No se han identificado en la busqueda web modelos comparables de spam detection con datos de rendimiento verificables. La comparacion anterior se limita a propiedades estructurales de los *checkpoints* base, no a la tarea concreta de deteccion de spam, para la que no hay cifras disponibles de ninguno de ellos.

## Limitaciones y advertencias

- Ausencia total de documentacion: no hay *model card*, ni descripcion de la tarea exacta, ni ejemplos de uso, lo que impide conocer el dominio objetivo (SMS, correo, comentarios web) y el idioma de entrenamiento.
- Licencia no declarada: sin licencia explicita no puede asumirse permiso de uso comercial. La licencia del DistilBERT original (Apache 2.0) no se hereda automaticamente si el autor no la declara en el artefacto derivado.
- Riesgo de sesgo: se desconoce la distribucion del dataset de entrenamiento. Un clasificador de spam entrenado sobre un corpus sesgado puede marcar sistematicamente como spam determinados registros linguisticos, variantes dialectales o dominios de correo legitimos.
- Falsos positivos criticos: en produccion, clasificar como spam un mensaje legitimo (por ejemplo, una comunicacion transaccional de un cliente) puede tener consecuencias graves. Se recomienda umbral conservador y revision humana para puntuaciones intermedias.
- Alucinacion: no aplica en el sentido generativo, pero si existe el riesgo de clasificaciones erroneas con alta confianza, sin margen para que el usuario detecte el fallo.
- Limitacion de contexto: si se confirma la ventana de 512 tokens de DistilBERT, el modelo truncara mensajes largos, perdiendo informacion relevante en correos extensos.
- Idioma: no confirmado. Si el ajuste se hizo sobre un corpus en ingles, el rendimiento en castellano sera previsiblemente pobre.
- Adopcion nula: 0 descargas y 1 *like* implican que el modelo no ha sido validado por terceros. No debe desplegarse sin una evaluacion propia sobre un conjunto de validacion representativo del dominio real.
- Repositorio de 0,7 GB sin inventario: conviene inspeccionar el contenido antes de descargarlo en entornos con almacenamiento limitado o politicas de procedencia de artefactos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/IntegralBender/distilbert-spam-detector-onnx
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos relacionados con este modelo. Los resultados devueltos por la busqueda corresponden a hilos de foros sin relacion con el artefacto.
