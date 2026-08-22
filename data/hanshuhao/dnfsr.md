# hanshuhao/DNFSR

## Resumen

DNF-SR es un modelo de superresolución de imágenes reales presentado en CVPR 2026, desarrollado por Shuhao Han (usuario `hanshuhao`). Su nombre completo es "Dual-Input and Negative-Aware Feature Fine-Tuning for Real-World Image Super-Resolution" y propone un método de optimización posterior al entrenamiento denominado NF²T (Negative-aware Feature Fine-Tting). Este enfoque explota la propiedad de que los modelos de superresolución generan múltiples resultados con calidad variable, clasificándolos en subconjuntos positivos y negativos para definir direcciones implícitas de mejora tanto en el espacio de imagen como en el de características.

El modelo se centra en un problema concreto: la superresolución de imágenes del mundo real, donde el degradado (ruido, borrosidad, compresión) es desconocido y variable. A diferencia de los métodos tradicionales que asumen degradados sintéticos, DNF-SR emplea una arquitectura de doble entrada (dual-input) combinada con un backbone de edición de imágenes, lo que reduce la brecha de distribución entre imágenes reales y sintéticas a la vez que preserva el contenido original. El repositorio contiene los pesos oficiales en formato safetensors (1.5 GB) con licencia Apache-2.0, aunque no se publican detalles sobre el número de parámetros ni la longitud de contexto en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en difusión con backbone de edición de imágenes y doble entrada (no se especifica el tipo exacto) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
La arquitectura de DNF-SR se basa en un enfoque de doble entrada (dual-input) que combina la imagen degradada con una entrada adicional, probablemente una imagen guía o un mapa de características, para reducir la discrepancia de distribución entre imágenes reales y sintéticas. El método de entrenamiento se denomina NF²T (Negative-Aware Feature Fine-Tuning), que es un proceso de optimización posterior al entrenamiento: se generan múltiples salidas para una misma imagen de entrada, se clasifican en positivas (alta calidad) y negativas (baja calidad), y se definen direcciones implícitas de mejora tanto en el espacio de imagen como en el de características. Esto permite ajustar los pesos del modelo de forma que se favorezcan las salidas de alta calidad.

El backbone de edición de imágenes es un componente clave, ya que permite mantener la consistencia del contenido mientras se aplican mejoras de resolución. El entrenamiento se realiza sobre un conjunto de datos de imágenes reales con degradados desconocidos, lo que lo diferencia de los métodos que usan degradados sintéticos. No se dispone de información sobre el número de tokens de entrenamiento, el dataset específico ni el uso de técnicas como RLHF o DPO.

## Capacidades
- Superresolución de imágenes reales con degradados desconocidos, incluyendo ruido, desenfoque y compresión.
- Mejora de la calidad visual de imágenes de baja resolución mediante un proceso de ajuste fino consciente de las salidas negativas.
- Preservación de la identidad y contenido de la imagen original gracias al backbone de edición de imágenes.
- Generación de múltiples resultados candidatos para una misma entrada, que luego se clasifican y utilizan para refinar el modelo.
- Capacidad de adaptación a diferentes dominios de degradación gracias al enfoque de doble entrada.
- Es un modelo de visión, no tiene capacidades de texto, tool calling ni agentes.

## Casos de uso
- **Restauración de fotografías antiguas o dañadas**: el modelo puede mejorar imágenes escaneadas o digitalizadas de baja resolución, reduciendo el ruido y la compresión, lo que resulta útil en museos o archivos digitales.
- **Mejora de imágenes de vigilancia**: las cámaras de seguridad suelen producir imágenes de baja calidad; DNF-SR puede aumentar su resolución para facilitar la identificación de personas, matrículas o detalles relevantes.
- **Superresolución en imágenes médicas**: puede aplicarse a radiografías o tomografías de baja resolución para mejorar la visualización de estructuras finas, ayudando al diagnóstico médico.
- **Mejora de imágenes satelitales**: las imágenes de satélite tienen limitaciones de resolución; el modelo puede aumentar el detalle para aplicaciones de cartografía, agricultura de precisión o monitorización ambiental.
- **Optimización de imágenes de comercio electrónico**: las plataformas de venta pueden usar el modelo para mejorar la calidad de las fotos de producto de baja resolución, mejorando la experiencia de compra.
- **Generación de imágenes en aplicaciones móviles**: se puede integrar en aplicaciones de fotografía o edición para ofrecer un modo de mejora de resolución en tiempo real, gracias a su diseño de ajuste posterior al entrenamiento que permite una inferencia eficiente.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. El artículo de CVPR 2026 presenta resultados experimentales, pero no se incluyen en la model card ni en los resultados de búsqueda proporcionados.

## Requisitos de hardware
- **VRAM estimada para inferencia**: no disponible, pero dado que el repositorio tiene un tamaño de 1.5 GB, se estima que el modelo puede caber en GPUs con 8 GB de VRAM en cuantización de 16 bits, y en 4 GB con cuantización de 8 bits.
- **GPU recomendadas**: se recomienda una GPU con al menos 8 GB de VRAM para una inferencia fluida, como una RTX 3060, RTX 4060, o superior. Para procesamiento por lotes, una A100 o H100 sería más adecuada.
- **Compatibilidad con GPU de consumo**: sí, el modelo es lo suficientemente pequeño para ejecutarse en GPUs de consumo modernas, aunque la velocidad de inferencia dependerá de la arquitectura.
- **Opciones de despliegue**: no se especifican opciones de despliegue en la información, pero al ser un modelo PyTorch, puede desplegarse con TorchServe, ONNX Runtime, o mediante un servidor FastAPI. No se mencionan compatibilidad con vLLM, llama.cpp u Ollama, ya que es un modelo de visión.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares
No se dispone de información suficiente para comparar con otros modelos de superresolución reales como Real-ESRGAN, BSRGAN o SwinIR. No se han publicado métricas de rendimiento en la información disponible.

## Limitaciones y advertencias
- **Sesgos conocidos**: no se ha publicado información sobre sesgos específicos, pero como todo modelo de superresolución, puede amplificar ciertos patrones de ruido o texturas presentes en los datos de entrenamiento.
- **Riesgo de alucinación**: en el contexto de superresolución, el modelo puede inventar detalles que no están presentes en la imagen original, especialmente en regiones muy degradadas.
- **Limitaciones de contexto o idioma**: no aplica, ya que es un modelo de imagen.
- **Restricciones de licencia**: la licencia Apache-2.0 permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de licencia.
- **Caveat para producción**: el modelo se presenta como un método de ajuste posterior al entrenamiento, por lo que su rendimiento depende de la calidad de los datos de entrenamiento. Además, el modelo no ha sido evaluado en la información disponible para tareas de superresolución con factores de escala muy altos (por ejemplo, x8), por lo que su uso en esos casos debe ser validado.

## Enlaces
- [Hugging Face - hanshuhao/DNFSR](https://huggingface.co/hanshuhao/DNFSR)
- [GitHub - SHH-Han/DNF-SR](https://github.com/SHH-Han/DNF-SR)
- [CVPR 2026 Poster - DNF-SR](https://cvpr.thecvf.com/virtual/2026/poster/36284)
- [CVPR 2026 Open Access Repository](https://openaccess.thecvf.com/content/CVPR2026/html/Han_DNF-SR_Dual-Input_and_Negative-Aware_Feature_Fine-Tuning_for_Real-World_Image_Super-Resolution_CVPR_2026_paper.html)
- [Paper Notes - DNF-SR](https://papernotes.org/CVPR2026/image_restoration/dnf-sr_dual-input_and_negative-aware_feature_fine-tuning_for_real-world_image_su/)
