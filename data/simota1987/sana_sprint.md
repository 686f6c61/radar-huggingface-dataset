# simota1987/Sana_Sprint

## Resumen

SANA-Sprint es un modelo de difusión texto-imagen de alta eficiencia desarrollado por NVIDIA y MIT Han Lab, diseñado para generar imágenes de 1024×1024 píxeles en solo 1-4 pasos de inferencia. La versión presentada aquí, SANA-Sprint 0.6B para Local Dream (MNN), es una conversión específica para ejecución completamente en dispositivos móviles mediante el framework MNN, sin necesidad de NPU dedicada, lo que la hace compatible con una amplia gama de hardware.

El modelo combina un transformador de difusión (DiT) de 0.6B parámetros con un autoencoder DC-AE que comprime la latente 32 veces, y un codificador de texto Gemma-2-2B. La conversión a MNN permite ejecutar el modelo completo en CPU y GPU móviles, con un tiempo de generación de aproximadamente 29 segundos en un Snapdragon 8 Gen 3 cuando el prompt está cacheado, y unos 60 segundos para un prompt nuevo. Su relevancia radica en llevar la generación de imágenes de alta calidad a entornos sin conexión y sin dependencia de servidores, manteniendo una licencia Apache-2.0 para el modelo principal, aunque la parte del codificador de texto está sujeta a los términos de uso de Gemma.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) + DC-AE (autoencoder) + Gemma-2-2B como texto |
| Parámetros totales | 0.6B (DiT) + 2B (texto) |
| Parámetros activos | no disponible |
| Longitud de contexto | 506 tokens (208 fijos + 298 variables) |
| Tipos de cuantización | fp16 (MNN) |
| Idiomas soportados | no disponible (Gemma-2-2B es multilingüe, pero no se especifica) |
| Licencia | Apache-2.0 (DiT y DC-AE) + Gemma Terms of Use (texto) |
| Formato de pesos | MNN (.mnn + .weight), safetensors (original) |

## Arquitectura y entrenamiento

El modelo base SANA-Sprint se construye sobre un modelo de difusión de flujo-matching pre-entrenado y se somete a un proceso de destilación híbrida que combina destilación de consistencia continua (CTCD) y destilación adversarial, reduciendo los pasos de inferencia de 20 a 1-4. El modelo DiT utiliza atención lineal para reducir la complejidad computacional, y el autoencoder DC-AE comprime la imagen a un espacio latente 32× más pequeño, lo que acelera la generación.

Esta versión específica para MNN se convierte desde los pesos oficiales de SANA-Sprint 0.6B. El proceso de conversión incluye tres optimizaciones clave: (1) el texto de texto ejecuta sobre 506 tokens, no 300, porque SANA añade una instrucción fija de 208 tokens; (2) el codificador de texto se divide en cuatro chunks para evitar la acumulación de errores fp16 en MNN; (3) la atención lineal del DiT se reescribe para fp16, escalando el valor en lugar del query y fijando un denominador mínimo para evitar valores negativos. El entrenamiento del modelo original usa un conjunto de datos de imágenes con anotaciones de texto, pero los detalles exactos del dataset no se proporcionan en la información disponible.

## Capacidades

- Generación de imágenes de 1024×1024 píxeles en 1-2 pasos de difusión, con calidad comparable a modelos de 20 pasos.
- Ejecución completamente en el dispositivo (on-device) mediante MNN, sin necesidad de conexión a internet ni servidores.
- Soporte de CPU y GPU OpenCL, sin requerir NPU dedicada (funciona en dispositivos no-Snapdragon).
- Texto de texto basado en Gemma-2-2B, con procesamiento de prompts en lenguaje natural.
- Generación de imágenes a partir de descripciones textuales, con capacidad de seguir instrucciones complejas.
- Compatible con el framework Local Dream, que permite integrar el modelo como un modelo personalizado en una app de Android.
- No incluye soporte para edición de imágenes, inpainting ni otras tareas de visión; es exclusivamente text-to-image.

## Casos de uso

- **Generación de imágenes en dispositivos móviles sin conexión**: la aplicación puede generar imágenes de alta resolución directamente en el teléfono, sin depender de servidores externos, ideal para entornos con baja conectividad o para preservar la privacidad del usuario.
- **Prototipado rápido de ideas visuales**: diseñadores y creadores pueden generar imágenes conceptuales al instante, probando diferentes prompts en una app móvil sin coste de servidor.
- **Asistente creativo para redes sociales**: integrar el modelo en una app de edición de fotos para generar fondos o ilustraciones personalizadas, con tiempos de generación aceptables (≈29 s) para uso ocasional.
- **Educación y demostraciones**: el modelo puede ejecutarse en hardware comercial para demostrar la capacidad de la IA generativa en clase o en talleres, sin necesidad de infraestructura en la nube.
- **Aplicaciones de diseño de interiores o moda**: generar visualizaciones rápidas de espacios o prendas a partir de descripciones, con el beneficio de que todo el proceso se realiza en el dispositivo del cliente.
- **Desarrollo de apps de arte generativo**: los desarrolladores pueden integrar el modelo en aplicaciones Android existentes mediante el framework MNN, añadiendo una función de generación de imágenes sin costes de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Sin embargo, el modelo base SANA-Sprint reporta en el paper original un FID de 2.44 en COCO-30K con 1 paso, y 2.38 con 2 pasos, superando a SD-Turbo (2.73) y SDXL-Turbo (2.83) en el mismo número de pasos. Los datos de rendimiento específicos para esta versión MNN se limitan a los tiempos de inferencia en hardware real:

| Etapa | Backend | Tiempo |
|---|---|---|
| Text encoder (Gemma-2-2B) | CPU | ~31 s (frío) / ~0 s (cached) |
| DiT ×2 pasos | OpenCL fp16 | ~1.7 s por paso |
| DC-AE decode (4×640px tiles) | OpenCL | ~19 s |
| **Total (prompt cacheado)** | - | **≈29 s** |
| **Total (prompt nuevo)** | - | **≈60 s** |

Mediciones realizadas en un Snapdragon 8 Gen 3 (SM8650) con resolución 1024px y 2 pasos.

## Requisitos de hardware

- **VRAM estimada**: no disponible, pero al ser un modelo MNN que se ejecuta en memoria unificada, se estima que el uso de RAM es inferior a 4 GB (modelo fp16 de 0.6B ≈ 1.2 GB, más el texto de 2B ≈ 4 GB, con picos de memoria intermedia).
- **GPU recomendadas**: para ejecución en Android, se requiere una GPU con soporte OpenCL. En el hardware de referencia (Snapdragon 8 Gen 3) se usa la GPU Adreno 750.
- **CPU**: cualquier CPU ARM de 64 bits, con mejor rendimiento en núcleos de alto rendimiento.
- **Despliegue**: el modelo se distribuye en formato MNN, listo para integrarse en una app Android con el framework MNN (versión que soporte MNN).
- **Latencia**: como se indica arriba, la generación de una imagen tarda entre 29 y 60 segundos, dependiendo de si el prompt está cacheado o no. El primer paso del texto de texto es el más lento (31 s), pero se puede cachear para prompts repetidos.

## Comparativa con modelos similares

| Modelo | Parámetros | Pasos | Resolución | Licencia | Plataforma | Tiempo de generación |
|---|---|---|---|---|---|---|
| **SANA-Sprint 0.6B (MNN)** | 0.6B + 2B texto | 1-2 | 1024×1024 | Apache 2.0 + Gemma | Android (MNN) | ~29 s (cacheado) |
| **SD-Turbo** | 1.3B | 1-4 | 512×512 | Apache 2.0 | Server/GPU | ~1 s (GPU) |
| **FLUX.1 schnell** | 12B | 1-4 | 1024×1024 | Apache 2.0 | Server/GPU | ~2 s (GPU) |
| **SDXL-Turbo** | 1.4B | 1-4 | 1024×1024 | Apache 2.0 | Server/GPU | ~1.5 s (GPU) |

La comparativa muestra que SANA-Sprint es significativamente más pequeño que FLUX.1 schnell, lo que permite su ejecución en dispositivos móviles, pero a costa de una mayor latencia en hardware de gama media. Los modelos de servidor como SD-Turbo o SDXL-Turbo son más rápidos en GPU, pero requieren infraestructura.

## Limitaciones y advertencias

- **Riesgo de alucinación**: como todo modelo de texto a imagen, puede generar imágenes que no corresponden fielmente a la descripción, especialmente con prompts ambiguos.
- **Idiomas**: aunque Gemma-2-2B es multilingüe, no se especifica qué idiomas están bien soportados; el modelo puede fallar con prompts en idiomas no representados en el entrenamiento.
- **Restricciones de licencia**: la parte del codificador de texto (Gemma-2-2B) está sujeta a los Gemma Terms of Use y a la Gemma Prohibited Use Policy, que restringen el uso comercial en ciertos casos. La parte del DiT y DC-AE es Apache 2.0.
- **Rendimiento variable**: los tiempos medidos son en un dispositivo específico (Snapdragon 8 Gen 3); en dispositivos más antiguos o con menor memoria, el tiempo puede aumentar significativamente.
- **Sin soporte para edición**: el modelo solo genera imágenes a partir de texto; no permite editar imágenes existentes ni realizar inpainting.
- **Calidad de imagen**: con 1 paso, la calidad puede degradarse en prompts complejas; se recomienda 2 pasos para resultados más estables.
- **Tamaño del repositorio**: el modelo ocupa 7.1 GB, lo que puede ser un problema para dispositivos con almacenamiento limitado.

## Enlaces

- [HuggingFace - SANA_Sprint](https://huggingface.co/simota1987/Sana_Sprint)
- [Modelo original - Sana_Sprint_0.6B_1024px_diffusers](https://huggingface.co/Efficient-Large-Model/Sana_Sprint_0.6B_1024px_diffusers)
- [Paper - SANA-Sprint](https://research.nvidia.com/labs/eai/publication/sana-sprint/)
- [Proyecto SANA-Sprint](https://sana.hanlab.ai/sprint/)
- [GitHub - NVlabs/Sana](https://github.com/NVlabs/Sana)
- [Gemma Terms of Use](https://ai.google.dev/gemma/terms)
