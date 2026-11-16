# maosama0001/tell-fit-clip

## Resumen

Tell-fit-clip es un par de codificadores CLIP destilados y cuantizados a int8 para ONNX, publicados por el usuario maosama0001 como componente del proyecto Tell. Su funcion es comprobar si un titular de noticia describe la fotografia con la que se publico, generando embeddings de imagen y de texto en un espacio comun de 512 dimensiones y calculando su similitud coseno. El modelo esta pensado para ejecutarse en el navegador mediante ONNX Runtime Web, lo que permite desplegar la comprobacion sin enviar imagenes ni titulares a un servidor.

Tecnicamente combina dos torres: un codificador de imagen CLIP ViT-B/32 (con su proyeccion a 512 dimensiones) y un codificador de texto basado en DistilBERT multilingue con pooling por media y una proyeccion de 768 a 512 dimensiones, derivado de sentence-transformers/clip-ViT-B-32-multilingual-v1. Ambos se distribuyen como pesos int8 con una escala por canal de salida, reconvertidos a float32 en tiempo de carga, con la aritmetica en float32.

Su relevancia es acotada pero concreta: es un ejemplo de despliegue de verificacion multimodal en el cliente, con licencia Apache 2.0 y un tamaño de repositorio de 0,2 GB, orientado a la deteccion temprana de desinformacion visual en redacciones y plataformas. No es un modelo generativo ni un detector de desinformacion completo: es una senal de cribado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos torres: CLIP ViT-B/32 (imagen) + DistilBERT multilingue con mean pooling y proyeccion 768->512 (texto); exportadas a ONNX |
| Parametros totales | No disponible (repo de 0,2 GB en int8; los modelos origen son ViT-B/32 y DistilBERT multilingue) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el encoder de texto es un transformer tipo BERT; la model card no declara longitud maxima) |
| Tipos de cuantizacion | int8 con una escala por canal de salida; desquantizacion a float32 en carga; aritmetica en float32 |
| Idiomas soportados | Ingles, hindi y mas de 50 idiomas del encoder de texto (segun la model card) |
| Licencia | Apache 2.0 (pesos CLIP de origen MIT; encoder de texto Apache 2.0) |
| Formato de pesos | ONNX (`fit_image_int8.onnx`, `fit_text_int8.onnx`), mas `vocab.txt` y `parity.json` |

## Arquitectura y entrenamiento

El modelo no se entrena desde cero: es una conversion y cuantizacion de dos modelos existentes. La torre de imagen es CLIP ViT-B/32 de OpenAI (licencia MIT), que recibe `pixel_values` con forma [n, 3, 224, 224] y preprocesado CLIP, y devuelve `image_embeds` [n, 512] normalizados a longitud unitaria. La torre de texto es el modelo sentence-transformers/clip-ViT-B-32-multilingual-v1 (Apache 2.0), un DistilBERT multilingue con pooling por media y una proyeccion lineal de 768 a 512 dimensiones; recibe `input_ids` y `attention_mask` [n, L] y devuelve `text_embeds` [n, 512] normalizados.

La innovacion esta en el empaquetado para el cliente: pesos int8 con escala por canal de salida, desquantizacion a float32 al cargar y aritmetica en float32, con un fichero `parity.json` que documenta la fidelidad frente a los modelos PyTorch. Sobre la similitud coseno se aplica una curva logistica calibrada con fotografias de noticias distintas (`calibration.json`, generado por `tools/calibrate_fit.py` en el repositorio Tell) para producir la probabilidad de que el titular no encaje. No se documentan datos de entrenamiento propios, RLHF ni DPO: el ajuste se limita a la calibracion del umbral.

## Capacidades

- Similitud imagen-texto: genera embeddings de imagen y de texto en un espacio comun de 512 dimensiones y calcula similitud coseno.
- Verificacion de encaje titular-fotografia: estima la probabilidad de que un titular no describa la imagen asociada.
- Multilingue: el encoder de texto cubre ingles, hindi y mas de 50 idiomas, por lo que el titular puede estar en cualquiera de ellos.
- Ejecucion en navegador: los ficheros ONNX estan preparados para ONNX Runtime Web, sin backend servidor.
- Cuantizacion int8 con paridad verificada: misma ordenacion de titulares que PyTorch en las 50 fotos del benchmark Tell, con similitudes coseno dentro de 0,011.
- Capacidades no incluidas: no genera texto, no razona, no ejecuta codigo, no soporta tool calling ni function calling, no implementa agentes ni razonamiento multi-paso, y no procesa audio.

## Casos de uso

- Cribado de titulares en redaccion: antes de publicar, el sistema compara el titular con la foto adjunta y marca los casos con alta probabilidad de desajuste para revision humana; la ventana de 512 dimensiones y la similitud coseno calibrada permiten fijar un umbral operativo.
- Verificacion en el navegador del lector: una extension o widget puede ejecutar los dos ficheros ONNX con ONNX Runtime Web y mostrar al usuario una senal de "la foto no parece corresponder al titular" sin enviar la imagen a ningun servidor.
- Moderacion de contenido en plataformas: integrado en el pipeline de subida, detecta publicaciones donde la imagen y el texto no concuerdan, un patron habitual en desinformacion; su naturaleza de cribado lo hace adecuado como primera capa antes de revision manual.
- Deteccion de imagenes reutilizadas con titulares nuevos: al comparar el embedding de la foto con el del titular, se identifican casos en los que una imagen de archivo se presenta con un contexto distinto.
- Analisis de medios en varios idiomas: al cubrir mas de 50 idiomas en el encoder de texto, permite auditar medios en ingles, hindi y otras lenguas con el mismo pipeline.
- Investigacion sobre desinformacion multimodal: el par de modelos y el fichero de calibracion sirven como linea base reproducible para experimentos de alineacion imagen-texto en noticias.
- Despliegue en dispositivos con recursos limitados: el formato int8 y el tamaño de 0,2 GB del repositorio permiten ejecutarlo en entornos de borde o en el propio navegador sin GPU dedicada.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son los del benchmark Tell, con 50 fotos, cada una con su titular verdadero y uno no relacionado:

| Metrica | int8 (ONNX) | Float32 (PyTorch) |
|---|---|---|
| Fotos con la misma ordenacion de titulares | 50 de 50 | 50 de 50 (referencia) |
| Diferencia maxima de similitud coseno | 0,011 | referencia |
| ROC AUC | 0,940 | 0,942 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio completo ocupa 0,2 GB en int8, por lo que la huella en memoria es del orden de cientos de MB en float32 tras la desquantizacion.
- GPU recomendadas: no disponible; el modelo esta disenado para ejecucion en navegador con ONNX Runtime Web, sin requisito de GPU dedicada.
- Compatibilidad con GPU de consumo: si, por tamano; cualquier GPU de consumo reciente puede alojar ambos codificadores, aunque el caso de uso previsto es CPU o WebGPU en el navegador.
- Opciones de despliegue: ONNX Runtime Web (navegador, con WebGPU o WASM), ONNX Runtime en servidor, y conversiones a otros runtimes ONNX compatibles. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| maosama0001/tell-fit-clip | No disponible (ViT-B/32 + DistilBERT multilingue, int8) | No disponible | Similitud imagen-texto multilingue en ONNX para navegador | Apache 2.0 | Hugging Face, 0 descargas, 0 likes |
| openai/clip-vit-base-patch32 | ViT-B/32 (aprox. 151 M en el encoder de imagen) | 77 tokens | CLIP original imagen-texto, solo ingles | MIT | Hugging Face, ampliamente adoptado |
| sentence-transformers/clip-ViT-B-32-multilingual-v1 | DistilBERT multilingue + proyeccion | No disponible | Embeddings de texto alineados con CLIP ViT-B/32 | Apache 2.0 | Hugging Face, ampliamente adoptado |
| openai/clip-vit-large-patch14 | ViT-L/14 (aprox. 428 M en el encoder de imagen) | 77 tokens | CLIP de mayor capacidad, solo ingles | MIT | Hugging Face, ampliamente adoptado |

La comparativa se limita a los modelos de origen y a la variante grande de CLIP, ya que no se dispone de datos de otros detectores de desajuste titular-imagen en la informacion proporcionada.

## Limitaciones y advertencias

- La comprobacion solo evalua si las palabras encajan con lo visible: un titular plausible pero falso (escena correcta, lugar o fecha equivocados) puede pasar el filtro. Es una senal de cribado, no una prueba.
- No detecta manipulaciones de imagen ni deepfakes; solo mide la coherencia semantica entre texto e imagen.
- El benchmark de validacion es muy reducido (50 fotos), por lo que las cifras de ROC AUC (0,940) deben tomarse como indicativas y no como garantia en dominios distintos.
- La calibracion de la probabilidad se ajusto con fotografias de noticias; su traslado a otros dominios (redes sociales, publicidad, fotografia cientifica) puede degradar la calibracion.
- No se documentan sesgos especificos, pero al heredar CLIP y DistilBERT multilingue arrastra los sesgos conocidos de ambos, incluidos sesgos culturales y de representacion en el emparejamiento imagen-texto.
- La longitud maxima de contexto del encoder de texto no se declara; titulares muy largos pueden truncarse sin aviso.
- Licencia Apache 2.0 para los artefactos publicados, con el encoder de imagen de origen bajo MIT; conviene revisar las condiciones de los modelos base antes de un uso comercial.
- El repositorio registra 0 descargas y 0 likes, y no hay pipeline declarado en Hugging Face; se trata de un artefacto reciente y poco validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/maosama0001/tell-fit-clip
- Space Tell: https://huggingface.co/spaces/maosama0001/tell
- CLIP ViT-B/32 de origen: https://huggingface.co/openai/clip-vit-base-patch32
- Encoder de texto de origen: https://huggingface.co/sentence-transformers/clip-ViT-B-32-multilingual-v1
