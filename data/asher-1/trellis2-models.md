# Asher-1/Trellis2-models

## Resumen

TRELLIS.2 es un modelo de generación 3D de código abierto desarrollado por Microsoft, diseñado para convertir imágenes en modelos 3D de alta fidelidad con materiales PBR. El modelo original, de 4 mil millones de parámetros, emplea una arquitectura de difusión basada en *vanilla DiTs* (Diffusion Transformers) y una representación espacial novedosa denominada O-Voxel, que combina compacidad y precisión para reconstruir topologías complejas y detalles nítidos. El repositorio `Asher-1/Trellis2-models` en HuggingFace contiene una versión en formato GGUF de este modelo, probablemente para facilitar su despliegue en entornos de inferencia con recursos limitados.

La relevancia de este lanzamiento radica en que TRELLIS.2 es uno de los primeros modelos de imagen-a-3D de gran escala con licencia Apache-2.0, lo que permite uso comercial y modificación. El repositorio GGUF aporta flexibilidad de cuantización y despliegue, aunque la información disponible no detalla las configuraciones exactas de los pesos ni los benchmarks específicos de esta versión. El modelo original ha demostrado generar activos 3D completamente texturizados en segundos en una GPU NVIDIA H100.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (vanilla DiT) sobre O-Voxel (estructura de vóxeles dispersos "field-free") |
| Parametros totales | 303.129.600 (según metadatos de HuggingFace; el modelo original de TRELLIS.2 es de 4B) |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no aplicable (modelo de generación 3D, no de texto) |
| Tipos de cuantizacion | no disponible (formato GGUF, se presumen cuantizaciones estándar como Q4_K_M, Q8_0, etc., pero no se detallan) |
| Idiomas soportados | no aplicable (no procesa lenguaje natural) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (con safetensors también presentes en el repositorio) |

Nota: el repositorio tiene un tamaño de 25.6 GB, lo que sugiere que contiene múltiples archivos GGUF o pesos adicionales, aunque el metadato de parámetros indica 303M. Esta discrepancia puede deberse a que los safetensors corresponden a un submódulo (p. ej., el VAE o el encoder) y el GGUF al modelo completo de 4B, pero no se ha podido verificar.

## Arquitectura y entrenamiento

TRELLIS.2 introduce una innovación clave: los O-Voxels, una representación de vóxeles dispersos sin campo (field-free) que permite reconstruir y generar activos 3D con topologías arbitrarias, aristas marcadas y detalles finos sin depender de campos de distancia o densidad. El modelo principal es un transformador de difusión de 4B parámetros que opera directamente sobre esta representación latente, lo que reduce la complejidad computacional frente a métodos basados en *NeRF* o *signed distance fields*.

El entrenamiento se realizó con un conjunto de datos extenso de mallas 3D y sus correspondientes imágenes, aunque los detalles concretos (número de tokens, composición exacta del dataset, uso de RLHF o DPO) no se han publicado en la información disponible. El modelo está optimizado para la tarea de imagen-a-3D, pero no se descarta que también pueda generar modelos a partir de texto si se combina con un codificador de lenguaje. La versión GGUF del repositorio es una conversión del modelo original, probablemente generada con herramientas como llama.cpp o scripts de conversión de HuggingFace, para permitir inferencia en CPU o GPUs con menor VRAM.

## Capacidades

- Generación de modelos 3D completos a partir de una sola imagen (imagen a 3D).
- Producción de mallas con materiales PBR (base color, metalness, roughness, normal maps, etc.) de alta fidelidad.
- Generación de topologías complejas (huecos, voladizos, geometría no convexa) gracias a los O-Voxels.
- Alta resolución de salida (se menciona "high-resolution fully textured assets").
- Velocidad de generación competitiva: el modelo original tarda ~7-8 segundos en una GPU H100 (shape + material), según la página del proyecto.
- Compatibilidad con formatos de malla estándar (OBJ, GLB, etc.) a través de la implementación de referencia.
- Al ser un modelo de difusión, soporta muestreo condicionado y puede generar variaciones de un mismo objeto.

No se han observado capacidades de tool calling, agentes, razonamiento simbólico o procesamiento de lenguaje natural en este modelo.

## Casos de uso

- **Desarrollo de videojuegos**: los diseñadores pueden generar activos 3D de alta calidad a partir de conceptos dibujados o fotos de referencia, acelerando el prototipado de escenarios y personajes. El modelo produce materiales PBR listos para integrar en motores como Unity o Unreal.
- **Producción cinematográfica y animación**: para crear props o entornos con texturas realistas a partir de fotografías de referencia, reduciendo el tiempo de modelado manual.
- **Arquitectura y diseño de interiores**: generar maquetas 3D de muebles o estructuras a partir de bocetos o imágenes de catálogo, útil para presentaciones de clientes o estudios de viabilidad.
- **E-commerce**: crear modelos 3D de productos para visualización interactiva en tiendas online, a partir de fotos de producto estándar.
- **Prototipado industrial**: transformar fotografías de prototipos físicos en modelos 3D para análisis de ingeniería o impresión 3D.
- **Aplicaciones educativas**: generar modelos 3D para museos virtuales o simulaciones, a partir de imágenes históricas o de referencia.
- **Investigación en visión por computador**: utilizar el modelo como herramienta de generación de datos sintéticos 3D para entrenar otros modelos de visión o robótica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para este repositorio GGUF. La página del proyecto TRELLIS.2 menciona que el modelo de 4B parámetros logra una calidad de estado del arte en generación imagen-a-3D, con tiempos de generación de ~4 segundos en una H100, pero no se proporcionan tablas numéricas comparativas en el material consultado.

## Requisitos de hardware

- El modelo original de 4B parámetros requiere una GPU de alta gama con al menos 24 GB de VRAM (p. ej., NVIDIA H100, A100 40GB o RTX 4090) para una inferencia fluida.
- La versión GGUF de 303M parámetros (según metadatos) podría ejecutarse en CPU con 8-16 GB de RAM, pero el tamaño del repositorio (25.6 GB) sugiere que contiene archivos de cuantización del modelo completo de 4B, lo que implicaría requisitos de VRAM más altos (≈ 8-12 GB para cuantizaciones Q4/Q5).
- Para despliegue en producción, se puede usar la implementación de referencia en PyTorch (repositorio GitHub de Microsoft) o exportar a ONNX/TensorRT.
- No se han proporcionado datos de latencia y throughput para la versión GGUF; la página del proyecto indica un tiempo total de generación de ~4 segundos (shape + material) en H100 para el modelo original.

## Comparativa con modelos similares

| Modelo | Parámetros | Licencia | Formato | Notas |
|---|---|---|---|---|
| TRELLIS.2 (original) | 4B | Apache-2.0 | PyTorch | Modelo base de Microsoft, alta calidad, no cuantizado |
| TRELLIS.2 GGUF (este repo) | 303M (según metadatos) | Apache-2.0 | GGUF | Conversión para inferencia ligera, tamaño de repositorio sugiere cuantizaciones |
| Hunyuan3D | ~2B | MIT | PyTorch | Alternativa de código abierto de Tencent, menos detalle en materiales |
| Tripo3D (comercial) | no público | propietario | API | Servicio comercial con alta calidad, pero no open source |

La comparación con Tripo y Meshy es cualitativa: TRELLIS.2 ofrece una calidad comparable o superior en fidelidad geométrica y materiales, con la ventaja de ser open source y con licencia Apache-2.0. Sin embargo, no hay benchmarks cuantitativos públicos que permitan una comparación objetiva en este repositorio.

## Limitaciones y advertencias

- El modelo puede alucinar geometría en áreas ambiguas de la imagen de entrada, generando mallas con artefactos o detalles no presentes en la foto.
- La calidad del resultado depende fuertemente de la calidad de la imagen de entrada; imágenes con oclusiones o baja resolución pueden producir modelos degradados.
- No se ha evaluado el comportamiento con datos de origen diverso; puede presentar sesgos hacia objetos de las categorías predominantes en el dataset de entrenamiento.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar los términos de la licencia y los derechos sobre los datos de entrenamiento si se distribuyen modelos generados.
- El repositorio GGUF no incluye documentación sobre la configuración exacta de los archivos; es necesario verificar la compatibilidad con el runtime de inferencia (llama.cpp, Ollama, etc.) antes de usarlo en producción.
- No se han publicado benchmarks de rendimiento para la versión GGUF, por lo que la velocidad y calidad en comparación con el modelo original no están confirmadas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Asher-1/Trellis2-models
- Página del proyecto TRELLIS.2: https://microsoft.github.io/TRELLIS.2/
- Repositorio GitHub de TRELLIS.2: https://github.com/microsoft/TRELLIS.2
- Sitio informativo de TRELLIS-2: https://trellis-2.org/
- Artículo de comparativa de generadores 3D: https://trellis2.app/blog/best-ai-3d-model-generator
