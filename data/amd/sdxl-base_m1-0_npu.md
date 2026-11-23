# amd/sdxl-base_m1.0_npu

## Resumen

`sdxl-base_m1.0_npu` es una versión del modelo de difusión de texto a imagen Stable Diffusion XL (SDXL) base, optimizada por AMD para su ejecución en las unidades de procesamiento neuronal (NPU) de la propia compañía, concretamente en la familia Ryzen AI. Publicada bajo la organización `amd` en Hugging Face, la ficha se distribuye en formato ONNX y forma parte de la estrategia de AMD de ofrecer modelos preoptimizados para su ecosistema de hardware, de manera similar a lo que hacen otros fabricantes con sus catálogos de modelos validados.

El modelo parte de SDXL Base 1.0, el modelo text-to-image de Stability AI basado en una arquitectura de difusión latente con un U-Net de aproximadamente 2.600 millones de parámetros, y añade sobre él las adaptaciones necesarias (grafo ONNX, cuantizaciones y configuraciones específicas) para aprovechar el motor de inferencia NPU de AMD. La licencia es CreativeML Open RAIL++-M, la misma del modelo original, que permite uso comercial con ciertas restricciones de uso responsable.

Su relevancia actual radica en la ejecución de generación de imágenes de alta calidad de forma local y sin GPU dedicada, aprovechando la NPU integrada en portátiles y equipos de sobremesa con procesadores Ryzen AI. Es un recurso dirigido sobre todo a desarrolladores del ecosistema AMD que quieran integrar generación de imágenes en aplicaciones locales con baja dependencia de la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión latente (Latent Diffusion) con U-Net, basada en SDXL Base |
| Parametros totales | ~2.600 millones (heredados de SDXL Base); cifra exacta no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo text-to-image; tokenizador CLAP/CLIP con límite estándar de SDXL, no confirmado en la ficha) |
| Tipos de cuantizacion | no disponible (distribución en ONNX, detalles de precisión no especificados) |
| Idiomas soportados | Inglés (prompts) |
| Licencia | CreativeML Open RAIL++-M (openrail++) |
| Formato de pesos | ONNX |

Otros datos del repositorio:

| Parametro | Valor |
|---|---|
| Tamaño del repositorio | 26,4 GB |
| Pipeline | text-to-image |
| Acceso | Restringido (gated): requiere aceptar condiciones en Hugging Face |
| Etiquetas | onnx, stable-diffusion, sdxl, text-to-image |

## Arquitectura y entrenamiento

El modelo base, SDXL Base 1.0, es un sistema de difusión latente compuesto por un U-Net condicionado mediante dos codificadores de texto (CLIP ViT-L y OpenCLIP ViT-bigG), un VAE para codificar y decodificar imágenes en el espacio latente, y un esquema de condicionamiento por tamaño y recorte (size and crop conditioning) que mejora la calidad de composición. Fue entrenado por Stability AI sobre el conjunto LAION y refinamientos posteriores, aunque los detalles del entrenamiento corresponden al modelo original y no a esta publicación de AMD.

La contribución de AMD en este repositorio no es el entrenamiento, sino la optimización para inferencia: la conversión del modelo a formato ONNX y su preparación para ejecutarse sobre el motor NPU de los procesadores Ryzen AI (mediante las herramientas de AMD, como el ONNX Runtime con el Execution Provider de Ryzen AI o Vitis AI). Los detalles concretos de la optimización (precisión, partición de grafo entre NPU y GPU/iGPU, operadores soportados) no están especificados en la información disponible.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) con la calidad característica de SDXL Base: composiciones de hasta cierta complejidad, estilos variados y resoluciones nativas de 1024x1024 (del modelo original, no confirmadas en la ficha).
- Ejecución optimizada en NPU de AMD Ryzen AI, orientada a inferencia local sin GPU dedicada.
- Distribución en formato ONNX, lo que facilita su integración en pipelines de inferencia basados en ONNX Runtime.
- Modelo base (no refinador): puede combinarse con el refiner de SDXL o con herramientas como ControlNet o LoRA en flujos de trabajo estándar de Stable Diffusion, si bien la compatibilidad de estas extensiones con la versión ONNX para NPU no está confirmada.
- No incluye capacidades de texto, código, razonamiento, visión (entrada de imagen) ni audio: es un modelo generativo de imágenes exclusivamente.

## Casos de uso

- Generación de imágenes offline en portátiles Ryzen AI: un desarrollador puede integrar el modelo en una aplicación de escritorio que genere ilustraciones o bocetos sin conexión a servicios en la nube, aprovechando la NPU y liberando la GPU/CPU para otras tareas.
- Prototipado de creatividad asistida: herramientas de diseño local (mockups, concept art, variaciones de estilo) que generen imágenes a partir de descripciones en inglés del usuario.
- Aplicaciones de productividad con imágenes on-demand: generación de ilustraciones para presentaciones, documentación interna o material de marketing preliminar directamente en el equipo del usuario.
- Privacidad y datos sensibles: escenarios donde el texto del prompt no puede salir del dispositivo (sectores legal, sanitario o corporativo); al ejecutarse localmente en NPU, el contenido no se envía a servicios externos.
- Integración en pipelines ONNX: equipos que ya trabajan con ONNX Runtime pueden incorporar el modelo en flujos de inferencia unificados junto a otros modelos optimizados por AMD.
- Demostraciones y validación de hardware: evaluación del rendimiento de la NPU de Ryzen AI en cargas de difusión, útil para fabricantes de equipos y desarrolladores de drivers/runtimes que necesiten un benchmark real de generación de imágenes.
- Educación y aprendizaje: uso en cursos o tutoriales sobre despliegue de modelos de difusión optimizados en hardware de consumidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Tampoco se dispone de métricas de latencia, pasos por segundo o calidad (FID, CLIP score) específicas de esta versión optimizada para NPU.

## Requisitos de hardware

- Hardware objetivo: procesadores AMD Ryzen AI con NPU integrada (familia serie 7040/8040/Hawk Point y sucesoras, según documentación de AMD; no confirmado en la ficha).
- Espacio en disco: aproximadamente 26,4 GB para el repositorio completo; se recomienda margen adicional para descargas y descompresión.
- Memoria del sistema: no disponible; para un modelo de difusión de ~2.600 millones de parámetros en NPU se recomienda como mínimo 16-32 GB de RAM unificada, aunque esta cifra es una estimación orientativa y no un dato publicado.
- GPU dedicada: no necesaria para la ruta NPU; el modelo también podría ejecutarse en GPU AMD vía ONNX Runtime, pero su optimización específica está orientada a la NPU.
- Despliegue: mediante ONNX Runtime con el Execution Provider de Ryzen AI (DirectML/Vitis AI), o las herramientas oficiales de AMD (por ejemplo, Ryzen AI Software, Quark/lemonade según versión); no hay soporte directo documentado para llama.cpp, Ollama, vLLM o TGI, que son runtimes orientados a modelos de lenguaje.
- Latencia y throughput: no disponible.

Nota: al tratarse de un repositorio con acceso restringido (gated), es necesario iniciar sesión en Hugging Face y aceptar las condiciones antes de poder descargar los pesos.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Ejecución objetivo | Disponibilidad |
|---|---|---|---|---|---|
| amd/sdxl-base_m1.0_npu | ~2.600 M (SDXL Base) | ONNX (NPU) | Open RAIL++-M | NPU AMD Ryzen AI | Gated en Hugging Face |
| stabilityai/stable-diffusion-xl-base-1.0 | ~2.600 M | safetensors (PyTorch) | Open RAIL++-M | GPU (CUDA/ROCm), CPU | Abierto |
| stabilityai/sdxl-refiner-1.0 | ~2.600 M | safetensors (PyTorch) | Open RAIL++-M | GPU (CUDA/ROCm) | Abierto |
| Seguimiento de AMD para SD 1.5 / otros en NPU | Variable | ONNX (NPU) | Variable | NPU AMD Ryzen AI | Variable |

La versión de AMD no altera las capacidades del modelo original: su valor diferencial es la optimización ONNX para NPU. Frente al SDXL original en PyTorch, esta variante sacrifica flexibilidad del ecosistema PyTorch/Diffusers a cambio de eficiencia energética y ejecución local en portátiles con Ryzen AI.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated; hay que aceptar las condiciones de uso en Hugging Face antes de descargar, lo que puede añadir fricción en entornos de CI/CD.
- Idioma del prompt: el modelo está etiquetado solo para inglés; los prompts en castellano u otros idiomas pueden producir resultados de mala calidad o incoherentes.
- Restricciones de hardware: la optimización está pensada para NPU de AMD Ryzen AI; en otros dispositivos (GPU NVIDIA, Apple Silicon, CPU) el rendimiento y la compatibilidad no están garantizados.
- Licencia Open RAIL++-M: permite uso comercial, pero incluye cláusulas de uso responsable que prohíben ciertos usos (generación de contenido dañino, deepfakes engañosos, etc.); es obligatorio revisar y aceptar elterms de uso.
- Riesgo de contenidos generados: como todo modelo de difusión, puede producir artefactos, anatomías incorrectas, texto ilegible en imágenes y sesgos presentes en los datos de entrenamiento (LAION), incluyendo sesgos de género, etnia y cultura.
- Capacidades del modelo base: al ser SDXL Base sin refinador, la calidad fina de la imagen puede mejorar combinándolo con el refiner, aunque esa combinación sobre NPU no está documentada en la información disponible.
- Documentación limitada: la ficha no detalla precisión, partición de operadores ni requisitos exactos de software (versiones de ONNX Runtime, drivers de Ryzen AI), por lo que puede ser necesario consultar la documentación de AMD para el despliegue.
- Métricas de descargas y likes en cero en el momento de la consulta, lo que sugiere adopción comunitaria limitada y menor disponibilidad de ejemplos y soporte de terceros.

## Enlaces

- Ficha del modelo en Hugging Face: https://huggingface.co/amd/sdxl-base_m1.0_npu
- Modelo original SDXL Base 1.0 (referencia): https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- Licencia CreativeML Open RAIL++-M (referencia): https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0/blob/main/LICENSE.md
- No se han encontrado en la informacion disponible enlaces adicionales a papers, blogs, repositorios de código o demos.
