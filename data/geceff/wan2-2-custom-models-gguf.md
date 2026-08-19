# geceff/Wan2.2-Custom-Models-GGUF

## Resumen

El repositorio `geceff/Wan2.2-Custom-Models-GGUF` alberga una colección de modelos cuantizados en formato GGUF del sistema Wan2.2 de generación de vídeo a partir de imagen (image-to-video). Desarrollado por el usuario geceff, este proyecto tiene como objetivo principal permitir la ejecución de Wan2.2 en entornos con memoria de vídeo limitada, como Google Colab con una NVIDIA Tesla T4 (15 GB VRAM) o GPUs de gama media como la L4. La relevancia actual radica en que democratiza el acceso a la síntesis de vídeo de alta calidad sin necesidad de hardware profesional, ofreciendo múltiples variantes de cuantización (Q4_K_M, Q6_K, Q8_H, FP8) y modelos especializados con integración de Stable Video Infinity (SVI) y preservación facial consistente.

El modelo base es `text-to-video-synthesis` y la librería principal es GGUF, aunque también se incluyen archivos en safetensors para algunos componentes. Con aproximadamente 14.3 mil millones de parámetros, el repositorio ocupa 477.6 GB en total, aunque los archivos individuales son mucho más ligeros gracias a la cuantización. La licencia es Apache 2.0, lo que permite uso comercial, y los idiomas soportados son inglés, chino y tailandés. La pipeline declarada es image-to-video, y se integra nativamente con ComfyUI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion para video (Wan2.2 I2V) - detalles internos no disponibles |
| Parametros totales | 14.288.901.184 (~14.3B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M, Q6_K_L, Q6_K, Q8_H, fp8_scaled (para modelos GGUF); FP8 integrado en safetensors |
| Idiomas soportados | en, zh, th |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (principal), safetensors (para modelos FP8 y componentes como text encoder y VAE) |

## Arquitectura y entrenamiento

No se proporcionan detalles técnicos sobre la arquitectura interna del modelo (tipo de transformer, mecanismos de atención, etc.) ni sobre el proceso de entrenamiento (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO). La información disponible indica que se trata de una versión cuantizada y optimizada del modelo Wan2.2 para image-to-video, con adaptaciones específicas para entornos de baja VRAM. Se menciona la existencia de variantes "high noise" y "low noise" que controlan el nivel de movimiento y detalle en la generación, así como modelos especializados que integran SVI (Stable Video Infinity) para síntesis de vídeo continua y pesos de "Consistent Face" para evitar distorsiones faciales entre frames. No se especifican innovaciones técnicas adicionales más allá de la cuantización y la integración de estos módulos.

## Capacidades

- Generación de vídeo a partir de una imagen de entrada (image-to-video), con control sobre el movimiento y la cámara mediante las variantes high noise y low noise.
- Integración con ComfyUI, permitiendo flujos de trabajo visuales y configuración de parámetros como steps, CFG y high/low noise steps.
- Modelos especializados con SVI (Stable Video Infinity) para generación de vídeo continuo y con "Consistent Face" para mantener la identidad facial a lo largo de los frames.
- Soporte multilingüe en inglés, chino y tailandés (según metadatos).
- Optimización para hardware limitado: cuantizaciones GGUF que permiten ejecución en GPUs con 15 GB de VRAM (Tesla T4) y superiores (L4, L4S).
- Incluye text encoders (UMT5-XXL en FP16/FP8) y VAEs (Wan2_1_VAE_fp32 / wan_2.1_bf16) listos para usar.

## Casos de uso

- **Generación de vídeo creativo en Google Colab**: gracias a las cuantizaciones Q4_K_M y Q6_K, es posible ejecutar Wan2.2 en una T4 gratuita de Colab mediante scripts backend, generando vídeos de hasta 120 frames a 480p de altura. Ideal para artistas y creadores sin GPU dedicada.
- **Prototipado rápido de animaciones**: los modelos high noise permiten explorar movimientos de cámara y dinámicas variadas en pocos pasos (4-12 steps), lo que acelera la iteración en proyectos de animación o storyboards.
- **Producción de contenido para redes sociales**: con la variante low noise y la opción de cuantización Q8_H en GPUs L4 o superiores, se pueden generar clips de vídeo de alta calidad con microdetalles nítidos, adecuados para plataformas como YouTube Shorts o TikTok.
- **Preservación de identidad en vídeos de personajes**: los modelos con "Consistent Face" están diseñados para mantener la coherencia facial en secuencias largas, útil en doblaje, avatares o vídeos narrativos.
- **Integración en pipelines de postproducción**: al ser compatible con ComfyUI, los usuarios pueden combinar estos modelos con otros nodos de edición, corrección de color o composición, creando flujos automatizados para generación de vídeo.
- **Investigación en síntesis de vídeo con recursos limitados**: el repositorio sirve como referencia para estudiar el impacto de la cuantización en la calidad de vídeo generado, permitiendo comparar distintas precisiones (Q4 vs Q8) en hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan métricas como FID, CLIP score, ni comparaciones cuantitativas con otros modelos de generación de vídeo. La única orientación de rendimiento es práctica: en una Tesla T4, se recomienda no superar 480p de altura, 720p de ancho y 120 frames para evitar OOM, y usar cuantizaciones entre Q4_K_M y Q8_H. En GPUs L4 o superiores, se pueden usar configuraciones más exigentes.

## Requisitos de hardware

- **VRAM mínima**: 15 GB (Tesla T4) para las cuantizaciones más bajas (Q4_K_M) mediante scripts backend; en GUI de ComfyUI, la VRAM efectiva se reduce por el overhead de la interfaz, por lo que se limita a Q4_K_M-Q8_H y resoluciones máximas de 480p/720p.
- **GPUs recomendadas**:
  - Tesla T4 (15 GB): viable con cuantizaciones Q4_K_M a Q8_H, pero con restricciones de resolución y frames (máx. 120 frames).
  - NVIDIA L4 (24 GB): permite configuraciones de alta calidad (Q8_H + Q8_H) y modelos FP8 integrados.
  - L4S o superior: recomendado para los modelos especializados FP8 con SVI y Consistent Face.
- **Opciones de despliegue**: ComfyUI (interfaz gráfica), scripts Python directos (backdoor) para maximizar el uso de VRAM, y entornos de notebook como Google Colab.
- **Latencia y throughput**: no se proporcionan datos numéricos. Se indica que en T4, con cuantizaciones bajas y steps reducidos (4-12), la generación es factible, pero el tiempo exacto depende de la resolución y el número de frames.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en el repositorio ni en la documentación proporcionada. No se pueden establecer comparaciones objetivas con otras soluciones de image-to-video como Stable Video Diffusion, AnimateDiff o modelos propietarios. Se recomienda consultar benchmarks externos o realizar pruebas propias para evaluar el rendimiento relativo.

## Limitaciones y advertencias

- **Modelo base no actualizado**: el autor advierte que los archivos de peso completos (BF16) no están sincronizados; solo los quants GGUF, LoRAs, text encoders y VAEs están activos. Esto puede limitar la reproducibilidad exacta del modelo original.
- **Riesgo de OOM en T4**: usar modelos FP8 o de alta cuantización a través de la GUI de ComfyUI en una T4 puede provocar fallos de memoria. Se recomienda estrictamente seguir las restricciones de resolución y frames.
- **Calidad de cuantización**: las cuantizaciones bajas (Q4_K_M) pueden degradar la fidelidad visual, especialmente en microdetalles. El autor sugiere usar Q8_H o FP8 para máxima calidad, pero requiere más VRAM.
- **Contenido NSFW**: uno de los modelos integrados incluye la etiqueta "nsfw" en su nombre, lo que indica que puede generar contenido explícito. Esto puede ser inapropiado para ciertos entornos y debe considerarse en despliegues comerciales.
- **Idiomas limitados**: aunque se declaran en, zh y th, no se especifica la calidad de generación en cada idioma; es posible que el rendimiento varíe.
- **Licencia Apache 2.0**: permite uso comercial, pero se debe verificar que los componentes incluidos (text encoders, VAEs) también cumplan con esta licencia, ya que podrían tener restricciones adicionales.

## Enlaces

- Repositorio HuggingFace: [geceff/Wan2.2-Custom-Models-GGUF](https://huggingface.co/geceff/Wan2.2-Custom-Models-GGUF)
- No se proporcionan otros enlaces (papers, blogs, demos) en la información disponible.
