# cicalooo/10Eros-Max-h3-int8-convrot

## Resumen

El modelo `cicalooo/10Eros-Max-h3-int8-convrot` es una conversión cuantizada a INT8 del modelo de difusión `10Eros-Max` H3, desarrollado originalmente por TenStrip. Esta variante, creada por el usuario cicalooo, aplica el formato nativo `int8_tensorwise` con la técnica ConvRot de Comfy Kitchen, reduciendo el tamaño del archivo de aproximadamente 41.9 GB (en BF16) a unos 20.2 GB. El objetivo es permitir la ejecución del modelo en entornos con menor memoria de GPU, manteniendo la compatibilidad con ComfyUI mediante su sistema de carga nativo de modelos cuantizados.

La conversión se realizó con la herramienta `Comfy-Org/comfy-model-tools` sobre el archivo `10Eros_Max_h3_fl2va_beta2_pruned.safetensors`, cuantizando 208 capas con un groupsize de 256 y cuantización per-channel absmax. El modelo resultante está pensado para ser cargado directamente en el directorio `models/diffusion_models` de ComfyUI, siempre que la versión instalada soporte modelos INT8 ConvRot. No se dispone de información sobre la licencia, los idiomas soportados ni el pipeline específico, ya que estos campos no están publicados en la ficha de HuggingFace.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión (basado en `TenStrip/10Eros-Max`, tipo H3) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de difusión de imágenes) |
| Tipos de cuantizacion | INT8 (tensorwise, per-channel absmax, ConvRot groupsize 256) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (INT8 ConvRot nativo de ComfyUI) |

## Arquitectura y entrenamiento

El modelo es una conversión cuantizada del modelo de difusión `10Eros-Max` H3, que originalmente se distribuye en BF16. La arquitectura subyacente corresponde a un modelo de difusión de imágenes (probablemente basado en una arquitectura tipo Flux o similar, dado el sufijo `fl2va` en el nombre del archivo fuente), aunque no se especifican detalles adicionales como el número de parámetros o la arquitectura interna exacta.

La conversión a INT8 se realiza mediante cuantización post-entrenamiento con la herramienta de Comfy Kitchen, que aplica un esquema `int8_tensorwise` con la técnica ConvRot (rotación de convoluciones) para mejorar la precisión. Se cuantizaron 208 capas con un groupsize de 256 y un método per-channel absmax. No se menciona ningún proceso de entrenamiento adicional, fine-tuning o ajuste de pesos; se trata únicamente de una reducción de precisión para optimizar el uso de memoria y acelerar la inferencia en GPUs con recursos limitados.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) o de otros condicionamientos, según las capacidades del modelo base `10Eros-Max`.
- Inferencia optimizada para memoria gracias a la cuantización INT8, permitiendo ejecutar el modelo en GPUs con menos VRAM que la requerida por la versión BF16.
- Compatibilidad nativa con ComfyUI a través del formato `int8_tensorwise` con ConvRot, facilitando su integración en flujos de trabajo existentes.
- No se dispone de información sobre capacidades adicionales como tool calling, agentes, razonamiento multi-paso o soporte multilingüe, ya que es un modelo de difusión y estos conceptos no aplican en el contexto de generación de imágenes.

## Casos de uso

- Generación de imágenes artísticas y conceptuales: el modelo puede utilizarse en ComfyUI para crear ilustraciones de alta calidad a partir de prompts descriptivos, aprovechando la cuantización para ejecutarse en GPUs de gama media.
- Prototipado rápido en diseño gráfico: al reducir el tamaño del modelo a 20.2 GB, es viable cargarlo en estaciones de trabajo con 16 GB de VRAM, permitiendo iterar sobre conceptos visuales sin necesidad de hardware profesional.
- Integración en pipelines de generación automatizada: gracias a su compatibilidad con ComfyUI, puede incorporarse en flujos de trabajo por lotes para producir variaciones de imágenes o aplicar estilos específicos.
- Experimentación con técnicas de cuantización: este modelo sirve como ejemplo de aplicación de ConvRot en modelos de difusión, útil para desarrolladores que investigan métodos de compresión y su impacto en la calidad de salida.
- Despliegue en entornos con restricciones de memoria: para usuarios que necesitan ejecutar modelos de difusión en GPUs con 12-16 GB de VRAM, esta versión INT8 ofrece una alternativa viable frente al modelo original BF16.
- Uso educativo: permite estudiar el efecto de la cuantización INT8 en la calidad de imágenes generadas, comparando los resultados con el modelo base sin cuantizar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre métricas de calidad de imagen (como FID, CLIP score) ni comparaciones con el modelo original en términos de rendimiento o fidelidad.

## Requisitos de hardware

- VRAM estimada: el archivo cuantizado ocupa aproximadamente 20.2 GB, por lo que se recomienda al menos 24 GB de VRAM para cargar el modelo completo con margen para el runtime de ComfyUI. Con cuantización adicional o técnicas de offloading podría ser posible ejecutarlo en 16 GB, pero no hay datos oficiales.
- GPU recomendadas: NVIDIA RTX 3090/4090 (24 GB), A100 (40/80 GB) o superiores. GPUs con menos de 16 GB de VRAM probablemente no puedan cargar el modelo sin estrategias de swapping o subdivisión.
- Compatibilidad con consumer GPU: sí, siempre que se disponga de al menos 24 GB de VRAM (por ejemplo, RTX 3090 o 4090).
- Opciones de despliegue: exclusivamente a través de ComfyUI, ya que el formato INT8 ConvRot es nativo de esta herramienta. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, dado que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos de difusión cuantizados similares. El modelo original `TenStrip/10Eros-Max` es la única referencia directa, pero no se han publicado especificaciones comparables (parámetros, benchmarks, etc.) en la documentación proporcionada.

## Limitaciones y advertencias

- La cuantización INT8 puede introducir una pérdida de calidad en las imágenes generadas en comparación con el modelo BF16 original, especialmente en detalles finos o gradientes suaves.
- El modelo requiere una versión específica de ComfyUI que soporte el formato `int8_tensorwise` con ConvRot; versiones anteriores podrían no cargarlo correctamente.
- No se ha publicado información sobre la licencia del modelo, por lo que su uso comercial o redistribución podría estar restringido. Se recomienda contactar con el autor original (TenStrip) para aclarar los términos.
- No se dispone de datos sobre sesgos o riesgos de contenido inapropiado. Dado el nombre "Eros", el modelo podría estar orientado a contenido adulto, aunque no se confirma en la documentación.
- El repositorio tiene 0 descargas y 1 like, lo que sugiere que es una conversión reciente y poco probada en producción. Se recomienda validar su comportamiento antes de usarlo en entornos críticos.

## Enlaces

- [Modelo en HuggingFace: cicalooo/10Eros-Max-h3-int8-convrot](https://huggingface.co/cicalooo/10Eros-Max-h3-int8-convrot)
- [Modelo original: TenStrip/10Eros-Max](https://huggingface.co/TenStrip/10Eros-Max)
- [Herramienta de conversión: Comfy-Org/comfy-model-tools](https://github.com/Comfy-Org/comfy-model-tools)
