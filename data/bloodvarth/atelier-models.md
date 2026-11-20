# Bloodvarth/atelier-models

## Resumen

Atelier models es un repositorio agregado de pesos ONNX publicado por el usuario Bloodvarth para su aplicacion Android Soulbane Atelier. No contiene un modelo entrenado por el autor: es un paquete de distribucion que reune cuatro artefactos de terceros (SAM 2.1 large, el encoder y el decoder de SAM 3, y el tagger WD ViT v3) en formato ONNX, con dos de ellos cuantizados a 8 bits por el propio autor. El repositorio existe para que la app descargue los ficheros una sola vez en el primer arranque y verifique su integridad mediante SHA-256.

El interes tecnico es limitado como modelo, pero relevante como ejemplo de empaquetado de pipelines de vision para dispositivo: segmentacion interactiva (SAM) y etiquetado de imagenes (WD tagger) servidos desde ONNX Runtime, con cuantizacion dinamica int8 de las operaciones MatMul/Gemm para reducir el peso del encoder de SAM 3. El repositorio ocupa 1,5 GB y no publica model card con metricas, idiomas ni pipeline declarado.

No se dispone de informacion sobre parametros totales, contexto, datos de entrenamiento ni evaluaciones propias. Todo lo que sigue se refiere a los modelos de origen y al empaquetado, no a un modelo nuevo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible como modelo unico; el repo agrupa SAM 2.1 (Hiera), SAM 3 (encoder + decoder) y WD ViT tagger v3 (ViT) |
| Parametros totales | No disponible (no se declara el recuento; SAM 2.1 large y SAM 3 son los componentes de mayor tamano) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelos de vision; sin ventana de texto) |
| Tipos de cuantizacion | fp32 (SAM 2.1 large), int8 dinamica en MatMul/Gemm (encoder SAM 3, WD ViT tagger v3), int8 (decoder SAM 3) |
| Idiomas soportados | No disponible (el tagger usa etiquetas en ingles; no se declara cobertura linguistica) |
| Licencia | `other` en el repo; componentes con Apache-2.0 (SAM 2.1, WD tagger) y SAM License (SAM 3) |
| Formato de pesos | ONNX (`.onnx` y ficheros `.data` asociados), mas `selected_tags.csv` |

## Arquitectura y entrenamiento

El repositorio no entrena nada: distribuye pesos ya entrenados. SAM 2.1 large se incluye como copia sin modificar del paquete `onnx-community/sam2.1-hiera-large-ONNX` en fp32, con arquitectura Hiera para segmentacion de imagen y video con prompts. SAM 3 aparece partido en dos ficheros: un encoder de imagen cuantizado dinamicamente a int8 (MatMul/Gemm) a partir de `wkentaro/sam3-onnx-models`, y un decoder int8 copiado sin cambios de `rusen/sam3-browser-int8`. El tagger WD ViT tagger v3 de SmilingWolf se incluye tambien cuantizado a int8 dinamico, junto con su lista de etiquetas `selected_tags.csv` sin modificar.

La unica innovacion tecnica atribuible al autor es el empaquetado y la cuantizacion: conversion a int8 dinamica de las multiplicaciones matriciales para reducir el tamano en disco y el coste de inferencia en Android, ademas del pinning por commit y la verificacion SHA-256 de cada fichero en la app. No se documentan datos de entrenamiento, tokens, composicion del dataset ni etapas de RLHF/DPO, porque corresponden a los modelos originales y no se reproducen aqui.

## Capacidades

- Segmentacion de imagenes con prompts (puntos, cajas, mascaras) mediante SAM 2.1 large y SAM 3.
- Segmentacion con propagacion temporal en video en el caso de SAM 2.1, segun las capacidades del modelo de origen.
- Etiquetado automatico de imagenes (image tagging) con WD ViT tagger v3, orientado a vocabulario de etiquetas tipo Danbooru.
- Inferencia en dispositivo via ONNX Runtime, sin dependencia de servidor.
- Verificacion de integridad de pesos por SHA-256 en el cliente Android.
- No se declara soporte de tool calling, agentes, razonamiento multi-paso ni generacion de texto: son modelos de vision.
- Capacidades multilingues: no disponibles; las etiquetas del tagger estan en ingles.

## Casos de uso

- Segmentacion interactiva en apps moviles: el usuario toca un objeto y SAM 2.1 large o SAM 3 devuelven la mascara; el formato ONNX y la cuantizacion int8 permiten ejecutarlo en Android sin backend.
- Recorte y edicion fotografica en dispositivo: seleccion de sujeto para borrado de fondo o sustitucion, usando el encoder int8 de SAM 3 para mantener el coste de memoria bajo.
- Etiquetado y organizacion de galerias: WD ViT tagger v3 genera etiquetas por imagen para busqueda y filtrado local, con la lista `selected_tags.csv` como vocabulario cerrado.
- Moderacion o curaduria de contenido visual: el tagger permite clasificar imagenes por etiquetas antes de subirlas a un servicio, reduciendo el trafico y la exposicion de datos.
- Anotacion asistida para datasets: SAM 3 acelera la creacion de mascaras de entrenamiento en herramientas de etiquetado, con el decoder int8 para iterar rapido en equipos sin GPU dedicada.
- Segmentacion de video en el dispositivo: SAM 2.1 large permite seguir objetos entre fotogramas en clips cortos, util en apps de edicion o analisis deportivo.
- Pipeline de preprocesado en servidor ligero: los ONNX pueden servirse con ONNX Runtime en CPU para tareas por lotes de segmentacion y tagging sin infrastructura GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: no disponible de forma oficial. Como referencia de orden de magnitud, el repositorio completo pesa 1,5 GB en disco; SAM 2.1 large en fp32 es el componente mas pesado y el encoder de SAM 3 en int8 el mas ligero de los grandes.
- GPU recomendadas: no disponibles. Los artefactos estan pensados para ONNX Runtime en Android, por lo que el objetivo es CPU/NPU movil, no GPU de servidor.
- GPU consumer: no se documenta compatibilidad ni rendimiento en RTX 4090 u otras; al ser ONNX, puede ejecutarse en CPU y, con el provider adecuado, en GPU, pero sin cifras publicadas.
- Despliegue: ONNX Runtime es la via natural; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a vision).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Atelier models (este repo) | No disponible | No aplica | ONNX (fp32 + int8) | `other` (Apache-2.0 y SAM License por componente) | Hugging Face, 0 descargas |
| onnx-community/sam2.1-hiera-large-ONNX | No disponible | No aplica | ONNX | Apache-2.0 | Hugging Face |
| wkentaro/sam3-onnx-models | No disponible | No aplica | ONNX | SAM License | Hugging Face |
| SmilingWolf/wd-vit-tagger-v3 | No disponible | No aplica | Safetensors/ONNX | Apache-2.0 | Hugging Face |

La comparativa relevante es con los repositorios de origen: Atelier models no aporta pesos nuevos, solo empaquetado, cuantizacion int8 y verificacion de integridad. Para uso general conviene acudir directamente a las fuentes, que tienen documentacion y mantenimiento propios.

## Limitaciones y advertencias

- No es un modelo entrenado por el autor: la calidad y los sesgos dependen integramente de SAM 2.1, SAM 3 y WD ViT tagger v3.
- La licencia del repositorio es `other` y mezcla Apache-2.0 con SAM License; el uso comercial de los componentes SAM 3 exige revisar los terminos de la SAM License incluida en `sam3/LICENSE`.
- El tagger WD ViT v3 esta entrenado sobre vocabulario de etiquetas de estilo Danbooru, con los sesgos y el sesgo de dominio que ello implica; no es un clasificador general.
- La cuantizacion int8 dinamica puede degradar la calidad de las mascaras y de las etiquetas frente a fp32; no se publican metricas de la perdida.
- No hay model card con idiomas, sesgos, evaluaciones ni limitaciones documentadas por el autor.
- Repositorio con 0 descargas y 0 likes: sin validacion de la comunidad, sin issues ni soporte.
- Sin pipeline declarado en Hugging Face, por lo que la carga automatica con `transformers` no esta garantizada.
- Riesgo de alucinacion no aplica en el sentido de texto, pero si de falsos positivos en etiquetado y mascaras imprecisas en escenas complejas.

## Enlaces

- Repositorio: https://huggingface.co/Bloodvarth/atelier-models
- SAM 2.1 large ONNX (origen): https://huggingface.co/onnx-community/sam2.1-hiera-large-ONNX
- SAM 3 ONNX models (origen): https://huggingface.co/wkentaro/sam3-onnx-models
- SAM 3 browser int8 (origen del decoder): https://huggingface.co/rusen/sam3-browser-int8
- WD ViT tagger v3 (origen): https://huggingface.co/SmilingWolf/wd-vit-tagger-v3
