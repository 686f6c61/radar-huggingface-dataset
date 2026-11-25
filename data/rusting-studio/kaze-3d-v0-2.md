# rusting-studio/Kaze-3D-v0.2

## Resumen

Kaze-3D-v0.2 es un modelo de imagen a malla 3D (image-to-3D) desarrollado por rusting-studio, entrenado desde cero en una única GPU RTX 3060 de 12 GB y escrito íntegramente en Rust sobre el framework RustingBrain. Recibe una sola imagen de un objeto y genera una malla 3D de su geometría. No requiere Python ni en entrenamiento ni en inferencia, lo que lo convierte en una pieza poco habitual dentro del ecosistema, dominado por implementaciones en PyTorch.

La versión v0.2 sustituye el codificador de imagen CLIP ViT-B/16 de v0.1 por DINOv2 ViT-B/14 y alarga el entrenamiento del modelo de flujo de 127.500 a 415.000 pasos. El resultado es una mejora sustancial en la métrica F@0.02 sobre objetos no vistos (de 0.215 a 0.480) y en IoU (de 0.344 a 0.548). Genera una malla en 3,4 segundos en una RTX 3060 con unos 2,1 GiB de memoria de tarjeta, y también funciona en CPU.

El modelo es todavía una versión temprana: acierta la forma y el tamaño de objetos cotidianos sencillos (cajas, zapatos, cuencos), pero redondea aristas vivas, pierde detalle fino y falla en animales y figuras. Genera únicamente geometría, sin textura ni color. Los pesos se distribuyen bajo licencia Apache-2.0 y se entrenaron solo con datos CC-BY y CC0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de flujo (flow matching) + VAE de forma + codificador de imagen DINOv2 ViT-B/14 congelado |
| Parametros totales | 134.668.033 (103.219.968 del transformer de flujo + 31.448.065 del VAE de forma; el codificador DINOv2 no está incluido en el repositorio) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada de imagen de 196×196 píxeles que produce 197 tokens; no aplica contexto de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de imagen a 3D, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`flow.safetensors`); salida en `.glb` (glTF) |

## Arquitectura y entrenamiento

El modelo se compone de tres piezas. Un codificador de imagen DINOv2 ViT-B/14 congelado, evaluado a 196×196 píxeles, convierte la imagen de entrada en 197 tokens. Un transformer de flujo de 103.219.968 parámetros transforma ruido en un latente de forma, guiado por esos tokens de imagen mediante flow matching. Un VAE de forma de 31.448.065 parámetros convierte el latente en un campo de distancia con signo (SDF), del que se extrae la malla con marching tetrahedra. El codificador DINOv2 no se incluye en el repositorio y debe descargarse por separado desde `facebook/dinov2-base`.

El entrenamiento usó 112.364 objetos, cada uno renderizado desde 8 vistas: 1.031 escaneos de Google Scanned Objects (CC-BY 4.0) y 111.333 objetos de Objaverse, restringidos a los de licencia propia CC-BY 4.0 (110.699) o CC0 1.0 (634), excluyendo los de licencia no comercial o share-alike. El VAE de forma se entrenó sobre un corte anterior y más pequeño del mismo corpus (53.688 objetos, mismas licencias). El transformer de flujo se afinó durante 415.000 pasos para leer los tokens de DINOv2. No se menciona RLHF ni DPO, al no ser un modelo de lenguaje.

## Capacidades

- Reconstrucción de geometría 3D a partir de una única imagen de un objeto, con salida en formato de malla `.glb`.
- Generación de forma y tamaño aproximados de objetos cotidianos sólidos y sencillos (cajas, envases, zapatos, cuencos).
- Inferencia en GPU (CUDA) y en CPU.
- Control de generación mediante los parámetros `--seed`, `--steps` (por defecto 28), `--guidance` (por defecto 4) y `--faces`.
- Detección automática del codificador de imagen requerido leyendo `flow.safetensors`.
- No soporta tool calling, agentes, razonamiento multi-paso, texto, visión general, audio ni modo de pensamiento.
- No genera textura ni color: solo geometría.

## Casos de uso

- Prototipado rápido de assets 3D para videojuegos o previsualización: a partir de una foto o render de un objeto sencillo se obtiene una malla base en 3,4 segundos que sirve como bloque de trabajo antes del modelado manual.
- Catalogación y digitalización de productos: para cajas, envases y artículos de forma simple, el modelo reconstruye la geometría lo bastante bien como para generar vistas 3D de catálogo o fichas de producto.
- Generación de mallas de bloqueo (blockout) en pipelines de diseño industrial: la malla resultante se usa como volumen de referencia que un artista refina después en Blender.
- Pruebas de concepto en entornos sin Python: al ejecutarse con un binario Rust (RustingRunner) y funcionar en CPU, encaja en sistemas embebidos o servicios donde no se quiere desplegar un stack de Python.
- Automatización de tareas de reconstrucción en lote sobre objetos escaneados con licencia libre, aprovechando que el modelo se entrenó solo con datos CC-BY y CC0.
- Investigación en modelos generativos 3D: sirve como referencia reproducible de un pipeline completo (flow matching + VAE de forma + SDF) implementado en Rust, útil para comparar arquitecturas o estudiar el efecto del codificador de imagen.

## Benchmarks y rendimiento

Medido en la RTX 3060 sobre 64 objetos de Google Scanned Objects no vistos en entrenamiento, con la forma real escalada para que su lado más largo abarque [-1, 1] y sin alineación de la salida con la verdad. F@0.02 es el F-score a una distancia del 1 % del lado más largo, sobre 50.000 puntos por superficie.

| Modelo / componente | Objetos | F@0.02 | IoU |
|---|---|---|---|
| VAE de forma, reconstrucción | 32 | 0.923 | 0.868 |
| Kaze-3D v0.2, 28 pasos, guidance 4 | 64 | 0.480 | 0.548 |
| Kaze-3D v0.1, mismos ajustes | 64 | 0.215 | 0.344 |

En 256 objetos de Objaverse no vistos, más alejados de los escaneos, v0.2 obtiene F@0.02 0.392 e IoU 0.435 (evaluados contra las muestras de superficie almacenadas de cada objeto, no contra su malla). 27 de los 64 objetos alcanzan por sí solos el objetivo de 0.55 (v0.1: 6), con puntuaciones que van de 0.999 en una botella pequeña a 0.047 en una figura. Ninguna salida quedó vacía. Latencia: 3,4 segundos por malla en la RTX 3060 incluyendo la carga de pesos (dos ejecuciones en caliente de 3,37 s; la primera tras arrancar tardó 5,1 s).

## Requisitos de hardware

- VRAM estimada: unos 2,1 GiB de memoria de tarjeta en la RTX 3060 durante la inferencia.
- GPU recomendadas: cualquier NVIDIA con soporte CUDA y al menos ~3 GiB de VRAM; el modelo se entrenó y evaluó en una RTX 3060 de 12 GB, por lo que tarjetas superiores (RTX 4090, A100, H100) funcionan sin problema pero no aportan datos de rendimiento publicados.
- Cabe en GPU de consumo: sí, en una RTX 3060 y presumiblemente en cualquier tarjeta con más de 3 GiB de VRAM.
- Opciones de despliegue: binario RustingRunner compilado con `--features cuda` (GPU) o sin esa opción (CPU). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia: 3,4 s por malla en RTX 3060 incluyendo carga de pesos; 5,1 s en la primera ejecución tras arrancar. No se publican datos de throughput en lote ni de latencia en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Salida | Licencia | Notas |
|---|---|---|---|---|---|
| Kaze-3D-v0.2 | 134,7 M (sin DINOv2) | 1 imagen | malla `.glb` (solo geometría) | Apache-2.0 | Implementación en Rust; entrenado en una RTX 3060 |
| Kaze-3D-v0.1 | no disponible | 1 imagen | malla | Apache-2.0 | Versión anterior; F@0.02 0.215 frente a 0.480 |
| Alternativas de imagen a 3D | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de otros modelos en la información proporcionada |

No se dispone de información sobre otros modelos comparables de imagen a 3D en la documentación facilitada.

## Limitaciones y advertencias

- Modelo temprano: redondea aristas y esquinas, y pierde detalle fino como cordones, recortes o bordes delgados, en parte por el VAE de forma, sin cambios desde v0.1.
- Rendimiento débil en animales, figuras, juguetes de varias piezas y objetos delgados, donde la salida suele ser una masa tosca.
- Entrenado solo con renders de objetos únicos: las fotos reales, escenas y varias objetos en una misma imagen quedan fuera de su dominio.
- Genera únicamente geometría; la malla no tiene textura ni color.
- No procesa texto ni lenguaje, por lo que no aplican capacidades multilingües ni de razonamiento.
- Riesgo de alucinación geométrica: puede inventar o suavizar partes no visibles en la imagen de entrada.
- Licencia Apache-2.0 en los pesos, pero conviene revisar las atribuciones de los datos de entrenamiento (`ATTRIBUTION.csv`) si se redistribuyen derivados.
- Requiere descargar por separado el codificador `facebook/dinov2-base`; un RustingRunner antiguo solo reconoce CLIP y fallará con v0.2.
- No se publican datos de sesgos, cuantización ni rendimiento en CPU.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rusting-studio/Kaze-3D-v0.2
- Framework RustingBrain: https://github.com/RustingStudio/RustingBrain
- Runner de inferencia RustingRunner: https://github.com/RustingStudio/RustingRunner
- Codificador DINOv2: https://huggingface.co/facebook/dinov2-base
- Objaverse (Deitke et al., CVPR 2023): https://objaverse.allenai.org/
- Google Scanned Objects: no disponible
