# nikhilr01/animefaces-distil-0.03b

## Resumen

Tinyflow anime faces es un generador de caras de anime condicionado a un layout facial (mascaras de cara, ojos y boca), desarrollado por el usuario nikhilr01. Con solo 37 millones de parametros, resuelve el problema de generar imagenes en hardware muy modesto: una imagen de 64x64 cuesta exactamente dos evaluaciones de red, lo que permite latencias de 30-70 ms en una CPU de portatil sin GPU.

Su relevancia no esta en la calidad artistica, sino en la tecnica: es una demostracion practica de destilacion de un modelo de flow-matching (U-Net con teacher midpoint-8) hacia un "flow map" de dos saltos, mas una cuantizacion int8 cuidadosa con suavizado estilo SmoothQuant. El modelo se distribuye en formato ONNX (fp32 de 148 MB e int8 de 38 MB) y se ejecuta con ONNX Runtime puro, sin dependencias de frameworks de deep learning pesados.

Incluye un prior de layout (`layouts.py` y `landmark_prior.npz`) para muestrear y rasterizar mascaras solo con NumPy, y un notebook marimo (`demo.py`) que permite probarlo directamente desde el Hub con medicion de latencia en vivo. Es un proyecto de investigacion y demostracion, no un modelo de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net de flow-matching destilado a flow map de dos saltos, condicionado por layout mediante region-pooling en el decoder |
| Parametros totales | 37 M (0.03b) |
| Parametros activos | no disponible (no consta que sea MoE; en este modelo todos los parametros se usan en cada evaluacion) |
| Longitud de contexto | no aplicable (modelo de generacion de imagenes, no de lenguaje) |
| Tipos de cuantizacion | fp32 e int8 (convoluciones cuantizadas por canal, activaciones uint8, resto en fp32) |
| Idiomas soportados | en (metadatos; el modelo no procesa texto) |
| Licencia | MIT (sobre codigo y ficheros del repositorio; la licencia del dataset de entrenamiento no esta clara) |
| Formato de pesos | ONNX (`sampler_2jump.onnx` + `.onnx.data` en fp32; ONNX unico en int8) |

## Arquitectura y entrenamiento

El modelo es un U-Net de flow-matching que recibe la condicion de layout (tres mascaras de 64x64: cara, ojos y boca) unicamente en capas de region-pooling situadas al final del decoder. Esta decision de diseno hace que el encoder dependa solo del ruido: con el mismo ruido fijo, pequenas ediciones del layout cambian la cara mucho menos que un ruevo nuevo. Esto resulta util para edicion interactiva de layouts.

El entrenamiento consto de dos fases principales. Primero se entreno un teacher de flow-matching con planificador midpoint-8. Luego se destilo en un flow map de dos saltos (0 a 1/2 y 1/2 a 1) mediante regresion L2 simple sobre 100.000 trayectorias del teacher, eliminando la integracion iterativa del ODE. Para la version int8 se aplico cuantizacion estatica de ONNX Runtime sobre las convoluciones (pesos int8 por canal, activaciones uint8), precedida de un reescalado exacto de canales en fp32 estilo SmoothQuant para evitar que unos pocos canales con valores altos dominen el rango de cada tensor.

## Capacidades

- Generacion de imagenes 64x64 de caras de anime a partir de ruido gaussiano estandar y mascaras de layout (cara, ojos, boca).
- Control por layout: las mascaras pueden muestrearse del prior incluido (`LayoutPrior.sample_masks`) o editarse a mano; ambas vias funcionan igual.
- Edicion coherente: al mantener fijo el ruido, modificaciones pequenas del layout producen cambios suaves en la cara generada.
- Inferencia en CPU pura con ONNX Runtime, sin GPU ni PyTorch; dependencias minimas (ONNX Runtime, NumPy, Pillow, `huggingface_hub`).
- Eleccion entre precision completa (fp32) y modelo cuantizado (int8) con degradacion minima de calidad.
- No soporta texto, tool calling, agentes ni otras modalidades: es un generador de imagenes especializado.

## Casos de uso

- Prototipado interactivo de caras de anime: el notebook marimo incluido permite mover sliders de layout y ver la cara regenerarse en decenas de milisegundos, aprovechando que el mismo ruido con distinto layout mantiene coherencia facial.
- Demostracion educativa de destilacion de diffusion/flow-matching: el repositorio `tinyflow` publica la receta de entrenamiento completa, util para docencia y experimentos sobre reduccion de pasos de muestreo.
- Generacion en dispositivos con recursos muy limitados: la version int8 (38 MB, 161 MB de RAM en ejecucion) cabe en portatiles viejos, contenedores ligeros o sistemas embebidos con CPU.
- Benchmarking de cuantizacion int8: el proyecto documenta el coste exacto de la cuantizacion (0.5 FID tras ecualizacion), util como caso de estudio de SmoothQuant en convoluciones.
- Generacion por lotes de avatares: el demo genera 64 caras en lote; con 4 hilos en un i9-14900 la latencia es de 32 ms por imagen en int8.
- Pipeline de datos sinteticos de caras de anime: el prior de layouts y el sampler ONNX se pueden integrar en scripts Python sencillos para generar datasets pequenos de rostros estilizados con control de composicion.

## Benchmarks y rendimiento

FID calculado sobre 5.000 muestras con layouts del prior (caracteristicas Inception en CPU; comparable dentro de esta ficha, no con FIDs de otros pipelines):

| Variante | FID | Latencia 1 hilo (ms) | Latencia 2 hilos (ms) | Latencia 4 hilos (ms) | RAM en ejecucion |
|---|---|---|---|---|---|
| fp32 | 40.3 | 180 | 100 | 56 | 225 MB |
| int8 | 40.8 | 72 | 45 | 32 | 161 MB |

Latencias medidas en un i9-14900 con batch 1. La version int8 cuesta unos 0.5 puntos de FID respecto a fp32; antes del reescalado de canales estilo SmoothQuant costaba 2-3, y la diferencia media de pixeles frente a fp32 es de aproximadamente 0.01 en escala [-1, 1]. No se han publicado resultados en benchmarks estandar de generacion de imagenes (no aplicable al tratarse de un modelo de dominio muy especifico).

## Requisitos de hardware

- No requiere GPU: la inferencia esta pensada para CPU con ONNX Runtime.
- RAM: 225 MB en ejecucion para fp32; 161 MB para int8.
- Cabe en cualquier portatil o equipo de escritorio moderno; no hay requisito de VRAM al no usar GPU.
- CPU recomendada: cualquier procesador multinucleo reciente; en un i9-14900 con 4 hilos se obtienen 56 ms (fp32) o 32 ms (int8) por imagen.
- Ajustar explicitamente `intra_op_num_threads` de ONNX Runtime: el valor por defecto sobresuscribe contenedores con cuota de CPU (hasta 7 veces mas lento en un contenedor con cuota de 16 nucleos).
- Despliegue: ONNX Runtime (via directa), notebook marimo con `uvx marimo edit --sandbox`, o integracion manual con NumPy y Pillow. No aplica vLLM, llama.cpp, Ollama ni TGI al no ser un modelo de lenguaje.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion | Pasos por imagen | Formato | Licencia |
|---|---|---|---|---|---|
| nikhilr01/animefaces-distil-0.03b | 37 M | 64x64 | 2 evaluaciones | ONNX (fp32/int8) | MIT (pesos; dataset sin licencia clara) |
| Stable Diffusion 1.5 | ~890 M (UNet) | 512x512 | 20-50 | safetensors | CreativeML OpenRAIL-M |
| AnimeGANv2 | ~9 M | variable | 1 (traduccion estilo) | ONNX/PyTorch | MIT |

Frente a Stable Diffusion 1.5, tinyflow es unas 25 veces mas pequeno, genera en 2 pasos en CPU y esta limitado a caras de anime 64x64 con control por mascaras; SD 1.5 ofrece generacion general por prompt de texto a mayor resolucion pero requiere GPU. Frente a AnimeGANv2, tinyflow genera desde ruido con control de layout en lugar de transferir estilo sobre una imagen de entrada, y comparte la licencia MIT, aunque AnimeGANv2 trabaja a resoluciones mayores.

## Limitaciones y advertencias

- Genera unicamente caras de anime a 64x64; no produce rostros realistas ni otras resoluciones.
- Entrenado sobre `huggan/anime-faces` (21.551 imagenes), cuyo dataset no declara claramente su licencia: el uso de los pesos hereda esa incertidumbre, y la licencia MIT del repositorio no cubre los datos de entrenamiento. Revisar el uso comercial con cautela.
- Las muestras pueden presentar artefactos; el layout es una guia, no una garantia de composicion exacta.
- Proyecto de investigacion y demostracion sin evaluacion de seguridad; no usar en produccion sin revision.
- FID comparable solo dentro de esta ficha, no con otros pipelines de evaluacion.
- Rendimiento sensible a la configuracion de hilos de ONNX Runtime en contenedores con cuota de CPU.
- Sin soporte de texto, batches multiples (el ONNX no tiene eje de batch) ni otras modalidades.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nikhilr01/animefaces-distil-0.03b
- Repositorio con codigo, receta de entrenamiento y write-ups: https://github.com/nikhilr612/tinyflow
- Demo interactiva en molab (marimo): https://molab.marimo.io/github/gist.github.com/nikhilr612/ea72d809a422de5462da9affbc609244
- Notebook marimo: https://marimo.io
- Dataset de entrenamiento: https://huggingface.co/datasets/huggan/anime-faces
