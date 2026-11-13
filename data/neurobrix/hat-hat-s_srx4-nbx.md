# Neurobrix/HAT-HAT-S_SRx4-nbx

## Resumen

HAT-HAT-S_SRx4 es un modelo de superresolución de imagen (upscaling x4) desarrollado originalmente por XPixelGroup y empaquetado por Neurobrix como contenedor `.nbx` para su motor de inferencia local. El modelo pertenece a la familia HAT (Hybrid Attention Transformer), una arquitectura de transformers diseñada específicamente para restauración de imágenes que combina atención por ventanas con atención de canal para activar más píxeles y mejorar la reconstrucción de detalles de alta frecuencia. La variante "S" corresponde al tamaño pequeño de la familia, y "SRx4" indica un factor de escalado de 4x.

El contenedor de Neurobrix incluye el grafo de cómputo, los pesos, la conectividad entre componentes y los valores por defecto de ejecución, de modo que el modelo puede ejecutarse sin depender de PyTorch mediante el motor Triton con kernels `nbxtensor`, o bien con el motor PyTorch. Soporta NVIDIA GPUs, GPUs de Mac (Metal) y CPU, y el planificador distribuye las partes del modelo según la memoria y GPUs disponibles.

Es relevante para desarrolladores que necesitan un upscaler de imágenes de calidad en entornos locales sin infraestructura cloud, con un contenedor ligero de 36 MB y licencia Apache 2.0 que permite uso comercial. No se dispone de información sobre el número de parámetros, contexto o idiomas, ya que se trata de un modelo de visión y la model card no proporciona esos datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hybrid Attention Transformer (HAT), variante S |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, image-to-image) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de imagen) |
| Licencia | apache-2.0 |
| Formato de pesos | contenedor `.nbx` (grafo + pesos + runtime); pesos originales no especificados |
| Factor de escalado | 4x (SRx4) |
| Tamano del contenedor | 36 MB |
| SHA-256 | `8e960f78fc800643f03d59d29181717523ff4634e1ef3809b950b29fb5f7870f` |
| Pipeline | image-to-image |
| Libreria | neurobrix |
| Backends de ejecucion | PyTorch engine, Triton engine (nbxtensor) |
| Hardware soportado | NVIDIA GPUs, Mac GPUs (Metal), CPU |

## Arquitectura y entrenamiento

HAT (Hybrid Attention Transformer) es una arquitectura basada en transformer para superresolución de imagen que combina atención por ventanas (window-based self-attention) con atención de canal (channel attention) para aprovechar mejor la información espacial y de canales. Esta combinación permite al modelo activar más píxeles y capturar dependencias de largo alcance, lo que se traduce en una mejor reconstrucción de texturas y detalles finos en comparación con arquitecturas puramente convolucionales o transformers estándar. La variante "S" es la de menor tamaño de la familia HAT, y el sufijo "SRx4" indica que realiza superresolución con factor de escala 4.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO, ya que la model card del contenedor remite a la model card original de XPixelGroup sin reproducir esos datos. Tampoco se especifican innovaciones adicionales como decodificación especulativa o atención lineal. El contenedor de Neurobrix no modifica el modelo: solo lo empaqueta con su grafo de cómputo y valores de ejecución para el motor de inferencia.

## Capacidades

- Superresolución de imagen con factor de escala 4x (upscaling).
- Restauración de detalles de alta frecuencia y texturas gracias a la atención híbrida del transformer.
- Procesamiento image-to-image en local, sin dependencia de servicios cloud.
- Ejecución en NVIDIA GPUs, Mac GPUs (Metal) y CPU.
- Dos motores de ejecución: PyTorch engine y Triton engine (sin PyTorch, con kernels `nbxtensor` certificados por clase de GPU).
- Planificación automática de distribución del modelo entre varias GPUs, streaming o host según la memoria disponible.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües (es un modelo de visión especializado).

## Casos de uso

- Restauración de fotografías antiguas o de baja resolución: el modelo escala 4x imágenes con detalle degradado, reconstruyendo texturas y bordes gracias a la atención híbrida del transformer, adecuado para digitalización de archivos fotográficos.
- Mejora de imágenes para impresión: al aumentar la resolución 4x, permite preparar capturas o renders de baja resolución para impresión a mayor tamaño sin pérdida apreciable de nitidez.
- Preprocesado en pipelines de visión por computador: el upscaling previo mejora la detección de objetos o el reconocimiento en imágenes de baja resolución antes de pasarlas a otros modelos.
- Mejora de miniaturas y assets web: generar versiones de alta resolución de imágenes de producto o miniaturas para catálogos y tiendas online, ejecutándose en local con el contenedor de 36 MB.
- Restauración de capturas de pantalla y documentos escaneados: el modelo puede aumentar la resolución de imágenes de texto o interfaces para mejorar la legibilidad.
- Despliegue en estaciones de trabajo sin cloud: al soportar CPU, Metal y NVIDIA, permite integrar el upscaling en flujos locales de edición fotográfica o generación de contenido sin enviar imágenes a servidores externos.
- Procesamiento por lotes en servidores con varias GPUs: el planificador de NeuroBrix distribuye el modelo entre GPUs disponibles, útil para lotes grandes de imágenes en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el contenedor pesa 36 MB, pero no se especifica el consumo de memoria en ejecución).
- GPU recomendadas: no disponible; el modelo soporta NVIDIA GPUs, Mac GPUs (Metal) y CPU según la model card.
- Compatibilidad con GPU de consumo: no confirmada explícitamente; el soporte de CPU y Metal sugiere que puede ejecutarse en hardware modesto, pero no se detallan modelos concretos.
- Opciones de despliegue: motor NeuroBrix (`neurobrix import` + `neurobrix upscale`), con PyTorch engine o Triton engine (kernels `nbxtensor`). No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de visión).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de parámetros para comparar con alternativas como SwinIR, Real-ESRGAN o HAT de mayor tamaño. La comparativa se limita a aspectos cualitativos de disponibilidad y licencia.

| Modelo | Arquitectura | Factor de escala | Licencia | Formato de despliegue | Datos de rendimiento |
|---|---|---|---|---|---|
| HAT-HAT-S_SRx4 (este) | Hybrid Attention Transformer (S) | 4x | Apache 2.0 | Contenedor `.nbx` (NeuroBrix) | no disponible |
| HAT (variantes mayores, XPixelGroup) | Hybrid Attention Transformer | 2x/3x/4x | Apache 2.0 | Pesos originales (PyTorch) | no disponible en esta ficha |
| SwinIR | Swin Transformer | 2x/3x/4x | Apache 2.0 | Pesos originales (PyTorch) | no disponible en esta ficha |
| Real-ESRGAN | GAN + RRDB | 2x/4x | BSD-3-Clause | Pesos originales (PyTorch) | no disponible en esta ficha |

## Limitaciones y advertencias

- Es un modelo especializado en superresolución; no genera texto, no razona y no soporta tool calling ni agentes.
- No se dispone de información sobre sesgos del modelo ni sobre el dataset de entrenamiento, por lo que no se pueden evaluar sesgos conocidos.
- Riesgo de alucinación visual: como todo modelo generativo de upscaling, puede inventar detalles plausibles que no estaban en la imagen original, especialmente en zonas muy degradadas.
- No se especifican limitaciones de resolución de entrada ni de tamaño máximo de imagen.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar la model card original de XPixelGroup para condiciones y limitaciones adicionales.
- El contenedor depende del ecosistema NeuroBrix; no es un formato estándar como safetensors o GGUF, lo que limita su uso fuera de ese motor.
- No hay datos publicados de benchmarks que permitan validar la calidad del upscaling frente a alternativas.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Neurobrix/HAT-HAT-S_SRx4-nbx
- Modelo original (GitHub XPixelGroup/HAT): https://github.com/XPixelGroup/HAT
- Descarga del contenedor: https://neurobrix.org/models/XPixelGroup/HAT-HAT-S_SRx4
- GitHub NeuroBrix: https://github.com/NeuroBrix
- Hub NeuroBrix: https://neurobrix.org
- YouTube NeuroBrix: https://www.youtube.com/@NeuroBrix
- Documentación NeuroBrix: https://docs.neurobrix.org
- Kernels nbxtensor: https://github.com/NeuroBrix/nbxtensor
