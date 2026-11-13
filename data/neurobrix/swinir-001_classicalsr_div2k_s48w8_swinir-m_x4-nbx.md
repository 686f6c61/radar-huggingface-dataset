# Neurobrix/SwinIR-001_classicalSR_DIV2K_s48w8_SwinIR-M_x4-nbx

## Resumen

SwinIR-001_classicalSR_DIV2K_s48w8_SwinIR-M_x4 es un modelo de superresolución de imagen (upscaling x4) basado en la arquitectura SwinIR, desarrollado originalmente por JingyunLiang. La variante empaquetada aquí la distribuye Neurobrix como contenedor `.nbx`, un formato propietario de su motor de inferencia que incluye el grafo de cómputo, los pesos, las conexiones entre componentes y los valores por defecto de ejecución. El modelo en sí no es nuevo: es el checkpoint clásico de SwinIR-M entrenado sobre DIV2K para superresolución clásica con factor de escala 4, con parches de 48 píxeles y ventana de atención de 8.

El interés de esta ficha no reside en el modelo, ampliamente conocido en la literatura de restauración de imagen desde 2021, sino en su empaquetado. Neurobrix permite ejecutar el modelo sin PyTorch mediante kernels Triton propios (nbxtensor), con planificación automática entre una o varias GPU, streaming de memoria o CPU, y soporte para GPU NVIDIA, GPU de Mac (Metal) y CPU. El contenedor ocupa 45 MB (43 MiB según la documentación), lo que da una idea del tamaño real del checkpoint.

La relevancia actual es limitada pero concreta: para desarrolladores que ya trabajan con Neurobrix, este contenedor ofrece una vía de despliegue de un upscaler de referencia sin dependencias de PyTorch y con portabilidad entre hardware. Para el resto, sigue siendo un baseline sólido de superresolución x4 con licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SwinIR (transformer con atención en ventanas desplazadas, variante M) |
| Parámetros totales | no disponible (el contenedor pesa 45 MB, consistente con un modelo de ~11 M de parámetros en precisión original) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen, entrada por parches) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (modelo de imagen) |
| Licencia | Apache 2.0 |
| Formato de pesos | contenedor `.nbx` (grafo + pesos + runtime); el original se distribuye en `.pth` de PyTorch |
| Pipeline | image-to-image (superresolución x4) |
| Factor de escala | x4 |
| Tamaño de parche de entrenamiento | 48 |
| Tamaño de ventana de atención | 8 |
| Dataset de entrenamiento | DIV2K (superresolución clásica) |
| Tamaño del contenedor | 45 MB (43 MiB) |
| SHA-256 | `20a764fa500984a383f95a7fba9f029ee3a5d5fccb9f16b2bfa52c29a5416e86` |

## Arquitectura y entrenamiento

SwinIR es un transformer para restauración de imagen que aplica atención en ventanas desplazadas (shifted window attention), tomando el esquema de Swin Transformer y adaptándolo a tareas de reconstrucción. La variante M (medium) usa bloques residuales Swin con atención local de ventana 8x8 desplazada entre bloques consecutivos, lo que reduce el coste cuadrático de la atención global manteniendo un campo receptivo amplio. La tarea concreta de este checkpoint es superresolución clásica x4: dado un parche de baja resolución, reconstruye la versión de alta resolución con factor 4.

El entrenamiento se realizó sobre DIV2K, el conjunto de referencia de 800 imágenes de alta calidad ampliamente usado en desafíos de superresolución. El sufijo `s48w8` indica parches de 48 píxeles y ventana de 8. No se dispone en la información proporcionada de detalles sobre número de iteraciones, función de pérdida exacta (habitualmente L1 en SwinIR clásico), composición aumentada del dataset ni si hubo etapas de refinamiento perceptual o GAN. El empaquetado de Neurobrix no altera el modelo: solo lo envuelve en un contenedor ejecutable por su motor, con planificación de dispositivos y kernels Triton certificados por clase de GPU.

## Capacidades

- Superresolución de imagen con factor de escala x4 sobre entradas de baja resolución.
- Reconstrucción de detalle fino en imágenes naturales, gracias a la atención en ventanas desplazadas.
- Ejecución sin PyTorch mediante el motor Triton de Neurobrix (kernels nbxtensor).
- Planificación automática de dispositivo: una GPU, varias GPU, streaming de memoria o CPU.
- Soporte de hardware heterogéneo: GPU NVIDIA, GPU de Mac vía Metal y CPU.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto.
- No soporta visión de alto nivel (captioning, VQA) ni audio; es exclusivamente image-to-image.
- Capacidades multilingües: no aplica.

## Casos de uso

- Restauración de fotografías antiguas o de baja resolución: el modelo toma una imagen de entrada y devuelve una versión x4, útil para digitalización de archivos fotográficos donde se necesita recuperar detalle sin depender de PyTorch en el servidor.
- Mejora de miniaturas y assets en pipelines de publicación: integrado en un paso previo a la subida de imágenes a un CMS, el upscaler x4 permite generar versiones de alta resolución a partir de originales pequeños, con un contenedor de 45 MB fácil de desplegar.
- Preprocesado para modelos de visión downstream: en pipelines de detección o segmentación que trabajan con imágenes de baja resolución, aplicar SwinIR x4 antes del detector puede mejorar la señal de entrada; el motor de Neurobrix permite encadenar el paso sin salir del mismo runtime.
- Despliegue en hardware sin PyTorch: entornos con restricciones de dependencias (imágenes Docker mínimas, dispositivos embebidos con GPU NVIDIA o Mac) pueden ejecutar el contenedor `.nbx` con el motor Triton, evitando instalar el stack completo de PyTorch.
- Procesamiento por lotes en CPU o GPU única: para volúmenes moderados de imágenes donde no se justifica un clúster, la planificación automática de Neurobrix asigna el modelo a CPU o a una sola GPU según disponibilidad.
- Benchmarking y comparación de upscalers: al ser un checkpoint de referencia de SwinIR-M x4 con licencia Apache 2.0, sirve como baseline reproducible para comparar con upscalers más recientes (Real-ESRGAN, SwinIR-L, HAT) en el mismo conjunto de evaluación.
- Integración en aplicaciones de escritorio o locales: el soporte de Metal y CPU permite empaquetar el upscaler en herramientas de escritorio para macOS sin depender de CUDA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del contenedor no incluye métricas (PSNR, SSIM, LPIPS) ni comparaciones numéricas con otros modelos. El modelo original de SwinIR reporta resultados en el paper de referencia, pero no se han proporcionado en esta ficha y no se reproducen aquí para no inventar cifras.

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada. Por el tamaño del contenedor (45 MB) y la naturaleza del modelo (upscaler de ~11 M de parámetros en su variante M), la huella de memoria es muy reducida; el consumo real dependerá del tamaño de la imagen de entrada y del tamaño de parche usado en inferencia.
- GPU recomendadas: cualquier GPU NVIDIA compatible con el motor Triton de Neurobrix; GPU de Mac vía Metal; CPU como fallback.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer moderna (RTX 3060 en adelante), aunque no se dispone de cifras oficiales de VRAM mínima.
- Opciones de despliegue: motor Neurobrix (PyTorch o Triton), con CLI `neurobrix upscale`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Escala | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| SwinIR-M x4 (este contenedor) | SwinIR | x4 | Apache 2.0 | `.nbx` (Neurobrix) | Hugging Face (Neurobrix) |
| SwinIR-M x4 original (JingyunLiang) | SwinIR | x4 | Apache 2.0 | `.pth` (PyTorch) | GitHub de JingyunLiang |
| Real-ESRGAN | RRDB + GAN | x4 (y otros) | BSD-3-Clause | `.pth` | GitHub oficial |
| HAT | Transformer híbrido | x4 (y otros) | Apache 2.0 | `.pth` | GitHub oficial |

La comparación se limita a datos estructurales y de licencia; no se dispone de métricas comparativas en la información proporcionada. La diferencia clave de este contenedor frente a los originales es el formato de ejecución (`.nbx` con motor Triton) y la ausencia de dependencia de PyTorch, no el modelo en sí.

## Limitaciones y advertencias

- El contenedor no es un modelo nuevo: es el mismo checkpoint de SwinIR-M x4 de JingyunLiang, por lo que hereda todas sus limitaciones de entrenamiento y generalización.
- Entrenado sobre DIV2K, un dataset de imágenes naturales de alta calidad; el rendimiento puede degradarse en dominios alejados (imágenes médicas, satelitales, capturas de pantalla, ilustración).
- La superresolución clásica asume que la degradación de entrada es un downsampling limpio; con imágenes reales degradadas (ruido, compresión JPEG, desenfoque) el resultado puede ser peor que el de modelos ciegos como Real-ESRGAN.
- Riesgo de artefactos y alucinación de texturas: como todo upscaler basado en reconstrucción, puede generar detalles plausibles pero inexistentes, lo que es problemático en contextos forenses o médicos.
- Dependencia del motor Neurobrix: el contenedor `.nbx` solo se ejecuta con `neurobrix`; no es portable a otros runtimes sin convertir de vuelta al checkpoint original.
- Licencia Apache 2.0, permisiva para uso comercial, pero se recomienda revisar la licencia del modelo original y del dataset DIV2K para usos concretos.
- Sin datos publicados de benchmarks, latencia ni VRAM mínima en la información disponible; cualquier estimación de rendimiento debe validarse empíricamente.
- El repositorio muestra 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación comunitaria del contenedor.

## Enlaces

- Contenedor en Hugging Face: https://huggingface.co/Neurobrix/SwinIR-001_classicalSR_DIV2K_s48w8_SwinIR-M_x4-nbx
- Modelo original (GitHub de JingyunLiang): https://github.com/JingyunLiang/SwinIR
- Repositorio de Neurobrix: https://github.com/NeuroBrix/neurobrix
- Kernels nbxtensor: https://github.com/NeuroBrix/nbxtensor
- Documentación de Neurobrix: https://docs.neurobrix.org/
- Hub de Neurobrix: https://neurobrix.org
- Página del modelo en el hub de Neurobrix: https://neurobrix.org/models/JingyunLiang/SwinIR-001_classicalSR_DIV2K_s48w8_SwinIR-M_x4
- GitHub de Neurobrix: https://github.com/NeuroBrix
- Canal de YouTube: https://www.youtube.com/@NeuroBrix
