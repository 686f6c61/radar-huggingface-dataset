# Scylix/kiora-sam2.1-tiny

## Resumen

Scylix/kiora-sam2.1-tiny es una version modificada del modelo SAM 2.1 Hiera Tiny de Meta, exportado originalmente a ONNX por el repositorio comunitario onnx-community en la revision 814a0666. Se trata de un modelo de segmentacion de imagen promptable (segment-anything) que forma parte de la familia SAM 2.1, disenada tanto para segmentacion de imagenes como de video. Este checkoint concreto lo emplea la herramienta de seleccion de objetos de Kiora Photo.

La modificacion introducida por el autor es puramente de empaquetado: los pesos se han recodificado para reducir el tamano de fichero y se han comprimido con gzip (extension .onnx.gz). El modelo se distribuye como un par de ficheros ONNX separados, un encoder de unos 54,2 MB descomprimidos y un decoder de unos 11,0 MB descomprimidos, con un tamano total de repositorio de 0,1 GB. La licencia es Apache 2.0, la misma que la de SAM 2.1 original.

Es relevante porque ofrece una variante ligera y ya empaquetada para ONNX Runtime de un modelo de segmentacion de alta calidad, apta para ejecucion en CPU y en equipos de gama consumer, sin necesidad de GPU dedicada para inferencia basica. Al derivar de Hiera Tiny, es la configuracion de menor coste computacional de la familia SAM 2.1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision transformer jerarquico Hiera (encoder de imagen) mas prompt encoder y decoder de mascaras, con atencion de memoria para video (familia SAM 2.1) |
| Parametros totales | no disponible (el autor solo publica tamanos de fichero: encoder 54.248.964 bytes y decoder 10.992.216 bytes descomprimidos) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de segmentacion de imagen y video, no procesa texto) |
| Tipos de cuantizacion | no disponible; el autor indica que los pesos fueron recodificados para reducir tamano, sin especificar el esquema exacto |
| Idiomas soportados | no aplica (modelo de vision, sin entrada ni salida de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX comprimido con gzip (.onnx.gz) |

## Arquitectura y entrenamiento

El modelo pertenece a la familia SAM 2.1 de Meta, que emplea un encoder de imagen basado en Hiera, un backbone de vision transformer jerarquico y preentrenado de forma auto-supervisada. Sobre las caracteristicas extraidas por el encoder se anade un prompt encoder, que codifica indicaciones del usuario (puntos, cajas o mascaras), y un decoder de mascaras que genera la segmentacion. La variante 2.1 incorpora, ademas, un mecanismo de memoria que permite la segmentacion y el seguimiento de objetos a lo largo de fotogramas de video. Hiera Tiny es la configuracion de menor capacidad de la familia.

Este checkpoint concreto no aporta informacion sobre datos de entrenamiento adicionales, numero de tokens de imagen, composicion del dataset ni procesos de ajuste fino con RLHF o DPO. La model card indica unicamente que es una copia modificada del export ONNX de onnx-community en la revision 814a0666, usada por Kiora Photo. La innovacion tecnica declarada es la recodificacion de pesos y la compresion gzip para reducir el tamano de los ficheros, sin cambios en la arquitectura ni en el procedimiento de entrenamiento descritos.

## Capacidades

- Segmentacion de imagen promptable: genera mascaras a partir de indicaciones como puntos, cajas o mascaras previas.
- Seleccion de objetos interactiva, que es el caso de uso declarado por el autor para la herramienta de seleccion de objetos de Kiora Photo.
- Segmentacion y seguimiento de objetos en video gracias al mecanismo de memoria de SAM 2.1 (capacidad heredada de la arquitectura base; no confirmada explicitamente para este empaquetado).
- Generacion de multiples mascaras candidatas para una misma indicacion, tal como define la interfaz de los modelos segment-anything.
- No dispone de generacion de texto, razonamiento linguistico, codigo, matematicas ni capacidades multimodales de lenguaje.
- No soporta tool calling ni function calling, ni comportamiento de agente conversacional.
- No tiene capacidades multilingues, al no procesar texto.

## Casos de uso

- Seleccion de objetos en editores de fotografia: es el uso declarado por el autor; el modelo genera la mascara del objeto indicado con un clic para aislarlo y aplicar ediciones no destructivas.
- Eliminacion de fondos y recorte automatico: a partir de una caja o un punto sobre el sujeto, se obtiene una mascara alfa utilizable para composicion o publicacion en tiendas online.
- Etiquetado y anotacion de datasets de vision: acelera la creacion de mascaras de segmentacion para entrenar otros modelos, reduciendo el trabajo manual por imagen.
- Segmentacion interactiva en pipelines de edicion por lotes: integrado via ONNX Runtime, permite procesar colecciones de imagenes en servidor sin depender de GPUs de gama alta.
- Seguimiento de objetos en video: usando la componente de memoria de SAM 2.1, se puede mantener la mascara de un sujeto a lo largo de una secuencia para tareas de postproduccion o analitica.
- Vision por computador en robotica o inspeccion: la segmentacion promptable sirve para aislar regiones de interes en tiempo de ejecucion sobre hardware modesto, dado el reducido peso del modelo.
- Herramientas de anotacion asistida en navegador o escritorio: al ejecutarse en ONNX Runtime y ocupar decenas de megabytes, el modelo puede integrarse en aplicaciones cliente ligeras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como mIoU, J&F ni resultados sobre SA-V, MOSE o similares, ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el modelo completo ocupa aproximadamente 65 MB de pesos descomprimidos, por lo que cabe holgadamente incluso en GPUs con 4 GB o menos.
- GPU recomendadas: cualquier GPU moderna es suficiente; no requiere A100 ni H100. Una RTX 3060, RTX 4090 o integradas recientes pueden ejecutarlo.
- Ejecucion en consumer GPU: si, en practicamente cualquier GPU consumer actual e incluso en iGPU.
- Ejecucion en CPU: viable, dado el tamano reducido; requiere descomprimir los ficheros .onnx.gz antes de cargarlos.
- Opciones de despliegue: ONNX Runtime (libreria declarada del modelo); tambien seria compatible con runtimes que acepten ONNX, aunque no se confirma soporte en vLLM, llama.cpp, Ollama o TGI, ya que estos estan orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|
| Scylix/kiora-sam2.1-tiny | no disponible (encoder 54,2 MB + decoder 11,0 MB) | Segmentacion de imagen/video (SAM 2.1 Hiera Tiny, ONNX gzip) | Apache 2.0 | HuggingFace (ONNX) |
| onnx-community/sam2.1-hiera-tiny-ONNX | no disponible | Segmentacion de imagen/video (SAM 2.1 Hiera Tiny, ONNX) | Apache 2.0 | HuggingFace (modelo base de este checkpoint) |
| facebookresearch/sam2 (otros tamanos: small, base+, large) | no disponible | Segmentacion de imagen/video (SAM 2.1, PyTorch) | Apache 2.0 | Repositorio oficial de Meta |
| SAM 1 (ViT-B/L/H) | no disponible | Segmentacion de imagen promptable (solo imagen) | Apache 2.0 | Repositorio de Meta |

No se dispone de datos de rendimiento comparado entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde a prompts conversacionales y no realiza razonamiento simbolico ni matematico.
- Sesgos conocidos: no documentados en la informacion disponible; al heredar el entrenamiento de SAM 2.1, podria reproducir los sesgos de su dataset original, que no se detalla.
- Riesgo de segmentacion incorrecta en objetos ambiguos, oclusiones, bordes de bajo contraste o clases poco representadas; no hay metricas publicadas que cuantifiquen este riesgo para este checkpoint.
- La recodificacion de pesos puede degradar la calidad de la segmentacion respecto al modelo original; el autor no incluye ninguna evaluacion que lo confirme o descarte.
- Los ficheros se distribuyen comprimidos en gzip (.onnx.gz); es necesario descomprimirlos antes de cargarlos en ONNX Runtime.
- Licencia Apache 2.0: permite uso comercial, pero el modelo se entrega "as is", sin garantia de ningun tipo, tal como indica la model card.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion de la comunidad ni informes independientes de funcionamiento.
- No se declaran versiones cuantizadas alternativas ni variantes adicionales; solo se ofrecen los dos ficheros ONNX descritos.

## Enlaces

- HuggingFace: https://huggingface.co/Scylix/kiora-sam2.1-tiny
- Modelo base (export ONNX): https://huggingface.co/onnx-community/sam2.1-hiera-tiny-ONNX
- Repositorio oficial de SAM 2: https://github.com/facebookresearch/sam2
- Repositorio oficial de la familia SAM (Meta): https://github.com/facebookresearch/segment-anything
- Aplicacion Kiora Photo: no disponible (referenciada por el autor como herramienta de seleccion de objetos, sin enlace)
