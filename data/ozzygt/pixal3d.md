# OzzyGT/Pixal3D

## Resumen

Pixal3D es un modelo de generación 3D a partir de una sola imagen (*single-image to 3D*). La ficha que nos ocupa, `OzzyGT/Pixal3D`, no es el modelo original de Tencent, sino una conversión comunitaria a Diffusers de `TencentARC/Pixal3D`, publicada con el objetivo de que el modelo pueda ejecutarse dentro del ecosistema Diffusers mediante bloques modulares (`ModularPipelineBlocks`). Incluye asimismo el codificador de imagen DINOv3 (`facebook/dinov3-vitl16-pretrain-lvd1689m`) empaquetado como componente del pipeline.

El pipeline es una cascada de modelos de flujo (*flow models*) que genera primero una estructura dispersa, después latentes de forma (*shape SLAT*) a 512 y 1024 de resolución y, finalmente, latentes de textura (*tex SLAT*) a 1024. La salida no es una malla directamente, sino geometría en rejilla dual flexible (*flexible-dual-grid geometry*) y materiales voxelizados, a partir de los cuales hay que extraer la malla en un paso posterior.

Es relevante ahora porque demuestra el patrón de conversión de modelos 3D a Diffusers modular, con empaquetado de pesos en `safetensors` (repositorio de 13,7 GB) y un pipeline de 12 pasos de inferencia a 1024 de resolución. La licencia es compuesta (`pixal3d-with-third-party-components`): los pesos y el código de Pixal3D son MIT, el codificador DINOv3 tiene su propia licencia y el upsampler de características NAF es Apache-2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Cascada de modelos de flujo (diffusion/flow matching) sobre latentes 3D: modelo de estructura dispersa + SLAT de forma a 512 y 1024 + SLAT de textura a 1024; codificador de imagen DINOv3 ViT-L/16 |
| Parámetros totales | no disponible (la model card no publica el recuento) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo imagen→3D, no es un modelo de lenguaje) |
| Tipos de cuantización | no disponible; el ejemplo oficial usa `bfloat16` para los modelos de flujo y el codificador de imagen, y `float32` para el resto de componentes |
| Idiomas soportados | en (inglés) |
| Licencia | `pixal3d-with-third-party-components` (pesos y código Pixal3D: MIT; DINOv3: licencia DINOv3; NAF: Apache-2.0) |
| Formato de pesos | safetensors (repositorio Diffusers, 13,7 GB) |

## Arquitectura y entrenamiento

La conversión reproduce la arquitectura del Pixal3D original de TencentARC, que a su vez deriva del linaje de TRELLIS.2 (con atribución a Tencent y Microsoft en el fichero NOTICE). El pipeline se compone de cuatro modelos de flujo nombrados explícitamente en el ejemplo de uso: `sparse_structure_flow_model`, `shape_slat_flow_model_512`, `shape_slat_flow_model_1024` y `tex_slat_flow_model_1024`. La generación avanza de una representación dispersa de la estructura a latentes de forma en dos niveles de resolución (512 y 1024) y termina en latentes de textura a 1024, con 12 pasos de inferencia en la configuración de ejemplo.

La imagen de entrada se procesa con un codificador DINOv3 ViT-L/16 (preentrenado `lvd1689m`), y las características se realzan con el upsampler NAF (Apache-2.0). El modelo requiere parámetros de cámara explícitos: en el ejemplo, FOV horizontal de 33,85° y distancia de 1,643, estimados con MoGe-2, además de `mesh_scale` y `resolution`. La entrada debe ser una imagen preparada (sujeto sobre fondo negro, sin margen). No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF/DPO; tampoco se describen innovaciones adicionales más allá del esquema de latentes SLAT y la rejilla dual flexible.

## Capacidades

- Generación de geometría 3D y materiales a partir de una única imagen RGB.
- Salida en dos representaciones: geometría en rejilla dual flexible y materiales voxelizados (no devuelve directamente una malla; la malla se extrae a posteriori, por ejemplo con colores por vértice).
- Generación de textura mediante un modelo de flujo específico (`tex_slat_flow_model_1024`).
- Control explícito de cámara (FOV horizontal, distancia) y de la escala de malla.
- Resolución de salida configurable, con el ejemplo oficial a 1024.
- Integración con Diffusers mediante bloques modulares y `ModularPipelineBlocks`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo de lenguaje.
- Sin capacidades de audio, vídeo ni visión general; la entrada es una imagen estática y preparada.

## Casos de uso

- Prototipado de assets 3D para videojuegos: a partir de un render o concepto 2D se genera geometría y textura voxelizada que luego se convierte en malla y se retoca en Blender, reduciendo el tiempo de modelado inicial.
- Catálogos de comercio electrónico: generar una representación 3D aproximada del producto desde una foto de estudio con fondo negro, para visores web o configuradores.
- Previsualización en pipelines de impresión 3D: obtener una malla preliminar desde una imagen de referencia y validar proporciones y escala (`mesh_scale`) antes del modelado definitivo.
- Investigación en visión por computador: banco de pruebas reproducible para estudiar la conversión de modelos 3D a Diffusers modular y comparar el comportamiento de los latentes SLAT a 512 frente a 1024.
- Rotoscopia y reconstrucción de props en producción audiovisual: estimar cámara con MoGe-2, alimentar el pipeline con el FOV y la distancia calculados y generar el volumen del objeto para integrarlo en una escena.
- Generación de variantes controladas por semilla: con `torch.Generator().manual_seed(42)` y 12 pasos se obtienen resultados deterministas, útil para iterar sobre un mismo sujeto en un entorno de pruebas automatizado.
- Docencia y demos técnicas: el pipeline modular permite mostrar por separado cada etapa (estructura dispersa, forma, textura) en un cuaderno interactivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente documenta la configuración cualitativa del ejemplo (semilla 42, 12 pasos, resolución 1024) y un vídeo de muestra, sin métricas cuantitativas como FID, CLIP-score, Chamfer distance ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada: no publicada por el autor. Como referencia orientativa, el repositorio de pesos ocupa 13,7 GB, de modo que en `bfloat16` los pesos rondan los 14 GB; a ello hay que sumar activaciones, latentes y el codificador DINOv3 a resolución 1024, por lo que una estimación prudente sitúa el mínimo práctico en 24 GB de VRAM (estimación propia, no confirmada por el autor).
- GPU recomendadas: no disponibles en la información proporcionada. Por el perfil de memoria anterior, tienen cabida tarjetas de 24 GB o más (RTX 3090/4090, L40S, A100 40/80 GB, H100); en tarjetas de 16 GB o menos el pipeline completo probablemente requerirá offload o no cabrá, algo que el autor no documenta.
- Cabe en GPU de consumo: previsiblemente en RTX 3090 y RTX 4090 (24 GB); en GPUs de 8-16 GB no hay confirmación ni receta de cuantización publicada.
- Opciones de despliegue: Diffusers 0.41.0 con Transformers 5.20.2 y `accelerate>=1.15`, usando `ModularPipelineBlocks.from_pretrained` sobre `OzzyGT/Pixal3D_Modular` con `components_repo="OzzyGT/Pixal3D"`. No se mencionan soportes de vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo); tampoco se documenta una exportación a GGUF.
- Latencia y throughput: no disponibles. Solo se conoce el número de pasos de inferencia del ejemplo (12), sin tiempos medidos.
- Nota de seguridad: el ejemplo requiere `trust_remote_code=True` y `trust_components_code=True`, lo que ejecuta código Python descargado del Hub.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OzzyGT/Pixal3D | Imagen→3D, conversión Diffusers modular | no disponible | no aplica | Compuesta: MIT + DINOv3 + Apache-2.0 | HuggingFace, Diffusers 0.41.0 |
| TencentARC/Pixal3D (original) | Imagen→3D | no disponible | no aplica | MIT (pesos y código) | HuggingFace; repositorio en GitHub |
| TRELLIS.2 | Imagen→3D | no disponible | no aplica | no disponible en la información proporcionada | Referenciado como base de código |
| DINOv3 ViT-L/16 (`facebook/dinov3-...`) | Codificador de imagen | no disponible | no aplica | Licencia DINOv3 | HuggingFace; usado como componente |

No se dispone de datos verificados de benchmarks ni de recuentos de parámetros para establecer una comparación cuantitativa con alternativas como Hunyuan3D o TripoSR; la información proporcionada no los incluye.

## Limitaciones y advertencias

- La salida no es una malla: entrega geometría en rejilla dual flexible y materiales voxelizados, por lo que se necesita un paso de extracción de malla antes de usar el resultado en un motor o herramienta de modelado.
- Requiere una imagen preparada (sujeto sobre fondo negro y sin margen) y parámetros de cámara estimados externamente (FOV y distancia); una cámara mal estimada degrada el resultado.
- Solo se documenta inglés como idioma; no hay soporte multilingüe declarado ni interfaz de texto.
- Riesgo de alucinación geométrica: al ser un modelo generativo, puede inventar partes no visibles en la imagen de entrada (caras ocultas, geometría trasera), algo inherente a la formulación imagen→3D.
- Licencia compuesta: aunque los pesos de Pixal3D son MIT, el paquete incorpora DINOv3 (licencia propia, con posibles restricciones de uso comercial) y NAF (Apache-2.0, con código RoPE que mantiene términos de Meta). Es imprescindible revisar `NOTICE`, `LICENSE_DINOv3` y `LICENSE_NAF` antes de un uso comercial.
- Ejecuta código remoto: `trust_remote_code=True` y `trust_components_code=True` implican descargar y ejecutar Python del Hub; solo debe hacerse con repositorios auditados.
- Dependencias muy específicas y recientes (Diffusers 0.41.0, Transformers 5.20.2), lo que puede generar incompatibilidades con entornos existentes.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni informes de terceros sobre fallos o calidad.
- No se documentan sesgos demográficos ni de otro tipo, ni evaluaciones de robustez; el modelo no ha publicado métricas de calidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OzzyGT/Pixal3D
- Bloques modulares del pipeline: https://huggingface.co/OzzyGT/Pixal3D_Modular
- Modelo original: https://huggingface.co/TencentARC/Pixal3D
- Repositorio de Pixal3D en GitHub: https://github.com/TencentARC/Pixal3D
- Codificador DINOv3: https://huggingface.co/facebook/dinov3-vitl16-pretrain-lvd1689m
- Upsampler NAF: https://github.com/valeoai/NAF
- Estimador de cámara MoGe-2: https://huggingface.co/Ruicheng/moge-2-vitl
- Aviso legal y atribuciones: https://huggingface.co/OzzyGT/Pixal3D/blob/main/NOTICE
- Imagen de entrada del ejemplo: https://huggingface.co/datasets/OzzyGT/diffusers-examples/resolve/main/Pixal3D/Pixal3D_jester_input.png
- Vídeo de resultado del ejemplo: https://huggingface.co/datasets/OzzyGT/diffusers-examples/resolve/main/Pixal3D/Pixal3D_jester_seed42_bf16.mp4

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre el modelo (únicamente páginas de TikTok), por lo que no se han podido añadir enlaces adicionales a papers, blogs o demos.
