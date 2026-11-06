# cvprsubmission/metricstereo

## Resumen

MetricStereo es un modelo de difusion latent de dos vistas disenado para generar la imagen derecha de un par estereo a partir de una unica imagen izquierda y una linea base estereo expresada en metros. Lo desarrolla un autor anonimo (cuenta `cvprsubmission`) como publicacion que acompana un envio a CVPR 2027. El problema que aborda es la sintesis de vistas novedosas con control metrico: en lugar de estimar profundidad, deformar la imagen (warping) e inpintar las oclusiones, el modelo genera directamente la segunda vista condicionada por la geometria de la camara, lo que evita artefactos de warping y desalineaciones en las discontinuidades.

La arquitectura es un U-Net de difusion latent de dos vistas con el layout de Stable Diffusion 2.1, en el que la auto-atencion se ejecuta conjuntamente sobre los tokens de ambas vistas para que la vista derecha se genere en correspondencia con la izquierda. El condicionamiento de camara se introduce mediante mapas de rayos de Plucker concatenados al latente, un vector de 16 dimensiones de pose del rig derivado de la linea base sumado al embedding de timestep, y un token CLIP de la imagen de entrada como contexto de atencion cruzada. El decodificador VAE incorpora un LoRA ligero y un bloque de atencion cruzada entre vistas para que ambas se decodifiquen de forma consistente.

El modelo es relevante ahora porque ofrece una alternativa generativa al pipeline clasico de sintesis estereo (depth + warping + inpainting) con evaluacion en nueve benchmarks y una configuracion de inferencia congelada y reproducible. El repositorio ocupa 3,8 GB, contiene unicamente pesos de inferencia y se distribuye bajo licencia OpenRAIL++-M, heredada de SD 2.1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net de difusion latent de dos vistas (layout SD-2.1) con auto-atencion conjunta entre vistas y decodificador VAE estereo con LoRA |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; entrada de una imagen 768 x 768) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16/fp32; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | no aplica (modelo de imagen) |
| Licencia | CreativeML Open RAIL++-M (openrail++) |
| Formato de pesos | safetensors (`metricstereo.safetensors`, 3,8 GB, SHA-256 `40d36117e7ab9f5ef27818a94e4cf2ff37e0c703befe7ed6792ae6ced04847e5`) |

## Arquitectura y entrenamiento

El denoiser es un U-Net de difusion latent con la disposicion de SD 2.1 adaptado a dos vistas: la auto-atencion opera de forma conjunta sobre los tokens de ambas imagenes, de modo que la vista derecha se genera en correspondencia con la izquierda. El condicionamiento geometrico se compone de tres senales: mapas de rayos de Plucker y una mascara que marca la vista dada, concatenados al latente de cada vista; un vector de pose del rig de 16 dimensiones derivado de la linea base, sumado al embedding de timestep; y un token de imagen CLIP ViT-H/14 (`laion2b_s32b_b79k`, cargado desde `open_clip`) como contexto de atencion cruzada. El decodificador es el VAE de SD 2 con un LoRA ligero y un bloque de atencion cruzada entre vistas, almacenado sin fusionar para que las salidas sean identicas bit a bit a las del pipeline del paper.

La prediccion es de tipo v-prediction con DPM-Solver++(2M), 25 pasos uniformes en log-SNR y classifier-free guidance coseno de 5 a 1. La configuracion de inferencia esta congelada: resolucion 768 x 768, campo de vision fijo de 54 grados, autocast en bf16 con pesos en fp32 y semilla igual al indice de la imagen en los benchmarks. No se detalla en la informacion disponible el volumen de datos de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO (no aplicables en un modelo de difusion de imagen, pero no se documenta el proceso de ajuste).

## Capacidades

- Generacion de la vista derecha de un par estereo a partir de una unica imagen izquierda y una linea base en metros.
- Control metrico de la disparidad: la linea base se introduce en unidades fisicas, no como un desplazamiento relativo arbitrario.
- Generacion directa sin estimacion de profundidad, sin warping y sin inpainting.
- Coherencia entre vistas mediante auto-atencion conjunta en el denoiser y atencion cruzada en el decodificador.
- Salida de 768 x 768 en formato uint8 RGB.
- Reproducibilidad bit a bit con la configuracion congelada (semilla, sampler, guidance y precision fijos).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de image-to-image.
- No dispone de capacidades multilingues, de vision general, de audio ni de modo de razonamiento extendido.

## Casos de uso

- Generacion de pares estereo para realidad virtual y aumentada: a partir de una imagen monocula se obtiene la vista derecha con una linea base fisica concreta, lo que permite construir contenido estereo sin captura estereo dedicada.
- Aumento de datos para entrenamiento de redes estereo: el modelo puede sintetizar el par derecho a partir de imagenes izquierdas existentes y lineas base conocidas, ampliando datasets de disparidad con pares coherentes.
- Postproduccion de cine y video estereo: conversion de material monoculo a estereo con control metrico de la linea base por plano, evitando el pipeline manual de profundidad, warping e inpainting.
- Evaluacion de algoritmos de estereo: los pares generados con linea base conocida sirven como entrada controlada para medir el comportamiento de estimadores de disparidad en condiciones reproducibles.
- Prototipado de pipelines de vision 3D: sustitucion rapida de la etapa de sintesis de vista en sistemas de reconstruccion o de navegacion, con una interfaz simple (`generate(imagen, baseline_m, seed)`).
- Investigacion en difusion multivista: el modelo sirve como referencia reproducible para estudiar atencion conjunta entre vistas y condicionamiento geometrico con rayos de Plucker.
- Demostraciones y docencia: generacion de pares estereo controlados para explicar geometria epipolar y disparidad con datos sinteticos de linea base conocida.

## Benchmarks y rendimiento

Resultados del protocolo comun (Tab. 1 del paper). FoundationStereo mide la disparidad sobre el par generado en un marco comun (relacion de aspecto de la GT, lado corto 768) y la compara con una pseudo-GT del par real (benchmarks estereo) o con profundidad metrica de GT (benchmarks de profundidad). LPIPS se calcula contra la vista derecha de GT en el par nativo; MEt3R e iSQoE tambien sobre el par nativo. Flecha arriba: mayor es mejor; flecha abajo: menor es mejor.

| Benchmark | δ1 ↑ | AbsRel ↓ | SAWA-H ↓ | LPIPS ↓ | MEt3R ↓ | iSQoE ↓ |
|---|---:|---:|---:|---:|---:|---:|
| Booster | 0,9730 | 0,0389 | 0,8078 | 0,3011 | 0,0913 | 0,6306 |
| LayeredFlow | 0,8765 | 0,0767 | 1,0965 | 0,4136 | 0,1187 | 0,6486 |
| Middlebury | 0,9031 | 0,0835 | 0,8908 | 0,3253 | 0,0980 | 0,6679 |
| Spring | 0,7891 | 0,1174 | 1,3949 | 0,1412 | 0,0952 | 0,7838 |
| KITTI | 0,9663 | 0,0533 | 1,3284 | – | 0,0725 | 0,7208 |
| Sintel | 0,7077 | 0,2213 | 1,5943 | – | 0,1487 | 0,8210 |
| ETH3D | 0,9261 | 0,0841 | 1,1191 | – | 0,0669 | 0,5504 |
| TUM | 0,9190 | 0,0836 | 1,6404 | – | 0,0873 | 0,7803 |
| NYUv2 | 0,9689 | 0,0552 | 1,4524 | – | 0,0944 | 0,7376 |

Los benchmarks estereo se generan con la linea base mediana de la GT de cada benchmark; los de profundidad, con 10 cm. No se proporcionan en la informacion disponible resultados comparativos con otros metodos en la misma tabla.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio pesa 3,8 GB y la inferencia usa autocast en bf16 con pesos en fp32, por lo que se requiere al menos una GPU con memoria suficiente para cargar U-Net, VAE y el codificador CLIP ViT-H/14 simultaneamente. La cifra concreta no esta publicada.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por el tamano del modelo y la resolucion de 768 x 768, se espera que requiera GPU de clase profesional (A100, H100) o consumer de gama alta con suficiente VRAM, pero no se confirma.
- Compatibilidad con GPU consumer: no confirmada.
- Opciones de despliegue: el autor proporciona un pipeline propio en PyTorch (`metricstereo.pipeline.MetricStereo`) con carga desde `weights/metricstereo.safetensors`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. La configuracion fija de 25 pasos con DPM-Solver++(2M) y CFG coseno de 5 a 1 implica varias evaluaciones del U-Net por imagen, pero no se publican tiempos.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de resultados de otros modelos de generacion estereo evaluados con el mismo protocolo, ni de una tabla comparativa del paper. Por tanto, la comparativa cuantitativa se indica como no disponible. A modo de referencia estructural, el modelo se apoya en SD 2.1 (misma disposicion de U-Net y VAE, licencia OpenRAIL++-M), pero no se han publicado en la informacion disponible metricas frente a alternativas de sintesis de vistas novedosas.

| Modelo | Parametros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| MetricStereo | no disponible | imagen 768 x 768 + linea base en metros | OpenRAIL++-M | pesos en Hugging Face |
| Alternativas de sintesis estereo | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El campo de vision esta fijado en 54 grados en test; imagenes con intrinsecos muy distintos producen una escala de disparidad desajustada.
- La salida esta fijada a 768 x 768; no se documenta soporte para otras resoluciones.
- No se detallan sesgos conocidos del modelo; al heredar el denoiser y el VAE de SD 2.1, puede arrastrar sesgos presentes en los datos de entrenamiento de aquel.
- Riesgo de alucinacion visual: al ser un modelo generativo, puede inventar contenido en regiones ocluidas o con poca informacion, especialmente en escenas complejas.
- La licencia CreativeML Open RAIL++-M impone restricciones de uso basadas en el uso; se aplican al modelo y a sus derivados, incluido el uso comercial.
- Es una publicacion anonima en revision (CVPR 2027): el codigo de inferencia se anuncia pero el enlace se anadira tras la revision, y el modelo no ha pasado por un proceso de validacion de produccion.
- La cuenta tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- No se documentan cuantizaciones ni formatos alternativos a safetensors, lo que limita el despliegue en entornos con poca VRAM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cvprsubmission/metricstereo
- Pesos: https://huggingface.co/cvprsubmission/metricstereo/resolve/main/metricstereo.safetensors
- Codigo de inferencia: no disponible (el autor indica que el enlace se anadira tras la revision)
- Paper: no disponible (envio anonimo a CVPR 2027 en revision)
- Codificador CLIP ViT-H/14 `laion2b_s32b_b79k` (open_clip): no se proporciona enlace directo en la informacion disponible
