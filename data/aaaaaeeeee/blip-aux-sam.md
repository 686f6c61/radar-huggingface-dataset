# aaaaaeeeee/blip-aux-sam

## Resumen

`aaaaaeeeee/blip-aux-sam` es un export a ONNX del modelo de segmentación **SAM 2.1 hiera-tiny** de Meta, publicado por el usuario `aaaaaeeeee` bajo el nombre de proyecto "aux-sam (BLIP Studio)". No se trata de un modelo de lenguaje ni de una variante de BLIP pese al nombre del repositorio: es un modelo de segmentación de imágenes/regiones (promptable segmentation) reempaquetado para ejecutarse en el navegador mediante WebGPU con ONNX Runtime Web.

El autor indica explícitamente en la model card que la única modificación respecto al modelo original es la conversión de formato, con los pesos troceados en ficheros de datos externos para facilitar su carga desde un cliente web. Los valores de los pesos no se han alterado. El modelo upstream es `facebook/sam2.1-hiera-tiny`, fijado en el commit `de431c4043854a71d8101e17995dfe596bf101a5`, con licencia Apache-2.0.

Su relevancia es acotada pero concreta: permite añadir selección de regiones interactiva (tipo "clic para segmentar") en aplicaciones web sin depender de servidores de inferencia ni de frameworks de Python, reutilizando un modelo de segmentación pequeño (repo de 0,2 GB) y de licencia permisiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SAM 2.1 con encoder de imagen Hiera (vision transformer jerarquico) en variante tiny; segmentacion promptable con prompt encoder y decoder de mascaras |
| Parametros totales | no disponible (no declarado en la model card ni en los metadatos de HuggingFace) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; no procesa secuencias de texto) |
| Tipos de cuantizacion | no disponible (no se declara precision de pesos ni variantes cuantizadas; solo el export ONNX con datos externos) |
| Idiomas soportados | no disponible (modelo de vision, sin interfaz de texto; la model card esta redactada en japones) |
| Licencia | Apache-2.0 (heredada del modelo upstream) |
| Formato de pesos | ONNX con pesos en ficheros de datos externos (shards), orientado a WebGPU |
| Tamano del repositorio | 0,2 GB |
| Modelo upstream | facebook/sam2.1-hiera-tiny, commit de431c4043854a71d8101e17995dfe596bf101a5 |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-11 |

## Arquitectura y entrenamiento

El modelo subyacente es SAM 2.1 (Segment Anything Model 2), de Meta, en su variante `hiera-tiny`. SAM 2 combina un encoder de imagen basado en Hiera, un prompt encoder que acepta puntos, cajas o máscaras como indicaciones, y un decoder de máscaras ligero que produce la segmentación. La familia SAM 2.1 está diseñada para segmentación promptable en imágenes y vídeo. No obstante, la model card de este repositorio **no aporta detalles sobre el entrenamiento** (número de tokens o imágenes, composición del dataset, fases de ajuste) más allá de la referencia al upstream.

La contribución del autor es exclusivamente de ingeniería de empaquetado: según la model card, se ha realizado "solo la conversión de formato (troceado en datos externos)" y "los valores de los pesos no se han cambiado". El objetivo declarado es poder ejecutar el modelo dentro del navegador mediante WebGPU, lo que implica que el grafo ONNX y la disposición de los tensores están adaptados a ese entorno. Los detalles de procedencia se recogen en `NOTICE.txt` y la licencia completa en `LICENSE.txt`.

No hay indicios de fine-tuning, destilación ni cuantización por parte del autor de este repositorio.

## Capacidades

- Segmentación de regiones interactiva: genera máscaras a partir de indicaciones del usuario (puntos, cajas), el caso de uso típico de "selección de región" que describe la model card.
- Segmentación promptable de objetos en imágenes, heredada de SAM 2.1.
- Ejecución en navegador: el export está pensado para ONNX Runtime Web con backend WebGPU, sin necesidad de backend Python.
- Modelo exclusivamente de visión: no genera texto, no razona, no escribe código ni realiza function calling.
- No dispone de soporte de agentes, tool calling ni capacidades multilingües.
- Posible uso con memoria/estado para vídeo (capacidad propia de la familia SAM 2), si bien **no se confirma** que este export concreto preserve dicha funcionalidad; no disponible en la documentación.

## Casos de uso

- Edición de imágenes en el navegador: integrar el modelo en un editor web para que el usuario haga clic sobre un objeto y obtenga una máscara de selección al instante, sin subir la imagen a un servidor.
- Herramientas de recorte y eliminación de fondo: usar la máscara generada para recortar sujetos o sustituir fondos en aplicaciones de diseño, aprovechando que la inferencia ocurre en el cliente.
- Anotación de datasets en web: plataformas de etiquetado pueden incorporar selección asistida por SAM 2.1 tiny para acelerar el dibujado de polígonos y máscaras de segmentación.
- Preprocesado para pipelines de visión: generar máscaras por objeto antes de pasarlas a un clasificador, un modelo de OCR o un sistema de conteo.
- Aplicaciones de privacidad por diseño: al ejecutarse localmente en el navegador vía WebGPU, las imágenes no salen del dispositivo del usuario, lo que resulta adecuado para entornos con requisitos de confidencialidad.
- Prototipado y demos: disponer de un modelo de 0,2 GB con licencia Apache-2.0 facilita montar demostraciones de segmentación sin infraestructura GPU dedicada.
- Automatización de selección en flujos de retoque fotográfico: máscaras rápidas de pelo, ropa o productos en catálogos de comercio electrónico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye métricas (mIoU, J&F, latencia) ni comparaciones con el modelo upstream. Tampoco hay resultados en los metadatos del repositorio.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa derivada del tamaño del repositorio (0,2 GB de pesos ONNX con datos externos), la huella en memoria del modelo es reducida, inferior a 1 GB en la mayoría de configuraciones, aunque **esta cifra es una estimación a partir del tamaño del repo y no un dato declarado**.
- GPU recomendadas: no declaradas por el autor. El destino de despliegue es el propio navegador con WebGPU, por lo que se apoya en la GPU integrada o dedicada del dispositivo del usuario.
- GPU de consumo: el tamaño del modelo sugiere que puede ejecutarse en GPUs de consumo e incluso en gráficas integradas compatibles con WebGPU, si bien no hay cifras publicadas de rendimiento.
- Opciones de despliegue: ONNX Runtime Web con backend WebGPU (objetivo declarado); al ser un modelo ONNX, también podría cargarse con otros runtimes compatibles con ONNX, aunque no está documentado ni verificado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo / formato | Tamano | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `aaaaaeeeee/blip-aux-sam` (este) | Export ONNX con datos externos, para WebGPU | Repo de 0,2 GB | Apache-2.0 | HuggingFace, 0 descargas | Conversion de formato unicamente; sin benchmarks publicados |
| `facebook/sam2.1-hiera-tiny` | Pesos originales (PyTorch) | no disponible | Apache-2.0 | HuggingFace (upstream oficial de Meta) | Modelo fuente; requiere stack Python para inferencia |
| Otras variantes de SAM 2.1 (hiera-small, base, large) | Pesos originales (PyTorch) | no disponible | Apache-2.0 | HuggingFace | Mayor capacidad a costa de mas computo; parametros no disponibles en la informacion proporcionada |
| Alternativas de segmentacion web ligeras (por ejemplo, exportaciones ONNX de MobileSAM) | ONNX | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo entre estas opciones.

## Limitaciones y advertencias

- Repositorio sin validación comunitaria: 0 descargas y 0 likes, sin evidencia de uso en producción ni de que el export funcione correctamente en todos los navegadores.
- Sin benchmarks ni evaluación publicada: no hay métricas que confirmen que la conversión a ONNX preserva la calidad de segmentación del modelo original.
- Nombre potencialmente confuso: el repositorio se llama `blip-aux-sam`, pero no contiene BLIP ni un modelo de visión-lenguaje; es un export de SAM 2.1.
- Modelo exclusivamente de visión: no admite prompts en lenguaje natural ni generación de texto.
- Riesgo de segmentaciones incorrectas en objetos muy pequeños, con bordes difusos, oclusiones o imágenes de baja resolución; es un comportamiento esperado en variantes tiny.
- Dependencia de WebGPU: los navegadores o dispositivos sin soporte de WebGPU podrían no ejecutar el modelo, y no se documenta un fallback a WASM.
- Compatibilidad de vídeo no confirmada: aunque SAM 2 soporta segmentación en vídeo, la model card solo menciona selección de regiones, por lo que no debe asumirse el modo vídeo.
- Licencia Apache-2.0 permite uso comercial, pero se recomienda conservar `NOTICE.txt` y `LICENSE.txt` y verificar las condiciones del upstream de Meta.
- Al no declararse la precisión de los pesos, no puede garantizarse el comportamiento numérico en GPUs con soporte limitado de ciertos tipos de datos.
- Fecha de publicación del repositorio (2026-10-11) es posterior a la fecha de referencia habitual de este tipo de fichas; conviene verificar que el artefacto sigue disponible y es el mismo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/aaaaaeeeee/blip-aux-sam
- Modelo upstream (Meta): https://huggingface.co/facebook/sam2.1-hiera-tiny
- Commit del upstream referenciado: https://huggingface.co/facebook/sam2.1-hiera-tiny/tree/de431c4043854a71d8101e17995dfe596bf101a5
- Licencia del repositorio: https://huggingface.co/aaaaaeeeee/blip-aux-sam/blob/main/LICENSE.txt
- Aviso de procedencia: `NOTICE.txt` (referenciado en la model card, en el mismo repositorio)
- No se han encontrado papers, blogs, repositorios de codigo ni demos adicionales en la informacion disponible.
