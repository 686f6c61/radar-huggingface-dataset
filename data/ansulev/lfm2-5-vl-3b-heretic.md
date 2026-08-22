# ansulev/LFM2.5-VL-3B-heretic

## Resumen

LFM2.5-VL-3B-heretic es una versión modificada del modelo vision-language LFM2.5-VL-3B de Liquid AI, creada por ansulev mediante la técnica de *abliteration* con la herramienta Heretic v1.4.0. El objetivo es eliminar los mecanismos de rechazo y negativa del modelo original, de modo que responda a peticiones que el modelo base normalmente denegaría por políticas de seguridad. El modelo base es un sistema multimodal de 3,1 mil millones de parámetros (backbone LFM2.5-2.6B + encoder visual SigLIP2 NaFlex de 400M) diseñado para despliegue en dispositivos de baja latencia, con una ventana de contexto de 32.768 tokens.

El interés de esta versión heretic radica en que reduce la tasa de rechazo del 100 % del original a solo el 6 % en una prueba de referencia, manteniendo una divergencia KL baja (0,0553), lo que sugiere que el comportamiento general del modelo se conserva excepto en los mecanismos de negativa. Esto lo convierte en una opción para aplicaciones que requieren respuestas directas y sin filtros, aunque con los riesgos asociados a la eliminación de salvaguardas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Backbone LFM2.5-2.6B (híbrido transformer/SSM) + vision encoder SigLIP2 NaFlex 400M |
| Parámetros totales | 3.123.483.888 (aprox. 3,1B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantización | No disponible (existe una versión GGUF comunitaria, pero sin especificar cuantizaciones) |
| Idiomas soportados | Árabe, chino, inglés, francés, alemán, hindi, indonesio, italiano, japonés, coreano, polaco, portugués, ruso, español, tailandés, vietnamita |
| Licencia | lfm1.0 (licencia propia de Liquid AI, no OSI) |
| Formato de pesos | safetensors (también GGUF de la comunidad) |

## Arquitectura y entrenamiento

El modelo original LFM2.5-VL-3B emplea un backbone lingüístico de 2,6 mil millones de parámetros de arquitectura híbrida (combinación de atención y capas de espacio de estado) junto con un encoder visual SigLIP2 NaFlex optimizado para resolución nativa. El entrenamiento base incluye fases de *mid-training* y *post-training* con datos multimodales, lo que le permite procesar imágenes divididas en parches de 512×512 y una miniatura global. La versión heretic se obtiene mediante *abliteration*, una técnica que identifica y elimina direcciones de rechazo en los pesos de las capas (en este caso, `attn.o_proj` y `mlp.down_proj` con parámetros específicos de peso máximo/mínimo). El proceso es reproducible según la documentación incluida en el repositorio.

## Capacidades

- Procesamiento multimodal de texto e imagen (image-text-to-text).
- Generación de texto con razonamiento básico y matemáticas simples.
- Comprensión de documentos y OCR con anotación de diseño (layout annotation).
- *Grounding* y detección de objetos mediante consultas en lenguaje natural.
- Soporte de *function calling* (según la documentación de Liquid AI).
- Capacidades multilingües en 18 idiomas.
- Debido al *abliteration*, no rechaza peticiones que el modelo original consideraría inapropiadas (bajo riesgo de negativa).
- Inferencia eficiente en dispositivos de baja potencia (hasta 228 tokens/s en Apple M5 Max).

## Casos de uso

- **OCR de documentos escaneados**: puede extraer texto completo de páginas con anotación de layout, útil para convertir PDFs en texto buscable. Su baja latencia permite el procesamiento por lotes en servidores o en edge.
- **Detección de objetos en tiempo real** para aplicaciones de automoción (por ejemplo, detección de peatones o señales) gracias a su capacidad de *grounding* con consultas naturales y su velocidad de inferencia.
- **Traducción on-device de menús y señales de tráfico**: el modelo puede leer texto en imágenes y traducirlo a otros idiomas sin necesidad de conexión a internet, ideal para viajeros.
- **Asistentes visuales de pantalla** para accesibilidad, describiendo elementos de una interfaz o documentos capturados por la cámara.
- **Generación de contenido sin restricciones** en entornos controlados de investigación, donde se necesita evaluar el comportamiento de modelos sin salvaguardas de seguridad.
- **Integración en pipelines de visión por computador** que requieren respuestas directas y sin filtros, como análisis de imágenes en aplicaciones de moderación o clasificación de contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) para esta versión heretic. La única métrica disponible es la comparación de rechazo y divergencia de KL frente al modelo original:

| Métrica | Este modelo | Original (LFM2.5-VL-3B) |
|---|---|---|
| Divergencia KL | 0.0553 | 0 (por definición) |
| Tasa de rechazo | 6/100 | 100/100 |

El modelo original alcanza 228 tokens/s en un Apple M5 Max y 116 tokens/s en un AMD Ryzen AI Max+ 395, con un uso de memoria inferior a 3,3 GB, pero no se dispone de datos específicos para la versión heretic.

## Requisitos de hardware

- Memoria VRAM estimada: el modelo original requiere menos de 3,3 GB en cuantización (según Liquid AI). La versión heretic en safetensors ocupa 6,3 GB en disco, por lo que se recomienda cuantizar para inferencia en GPUs con menos de 8 GB.
- GPU recomendadas: RTX 3060 12GB, RTX 4090, A100, H100, o hardware Apple Silicon (M4/M5) para máxima velocidad.
- Compatibilidad con GPUs de consumo: sí, con cuantización 4-bit o 8-bit.
- Opciones de despliegue: Transformers (Hugging Face), vLLM, SGLang, llama.cpp (mediante GGUF), y ONNX para edge.
- Latencia esperada: en el orden de 100-200 tokens/s en hardware de gama alta, según los datos del modelo base.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tasa de rechazo | Licencia |
|---|---|---|---|---|
| LFM2.5-VL-3B (original) | 3,1B | 32.768 | 100/100 | lfm1.0 |
| LFM2.5-VL-3B-heretic | 3,1B | 32.768 | 6/100 | lfm1.0 |
| Qwen2-VL-3B (referencia) | 3,0B | 32.768 | no disponible | Apache 2.0 |

La comparativa con Qwen2-VL-3B es indicativa, ya que no se dispone de datos de rendimiento del modelo heretic frente a alternativas. La diferencia clave es la eliminación de salvaguardas, que no se evalúa en benchmarks estándar.

## Limitaciones y advertencias

- **Riesgo de contenido dañino**: el abliteration elimina los mecanismos de negativa, por lo que el modelo puede generar contenido ofensivo, ilegal o peligroso sin aviso. No debe desplegarse en entornos públicos sin un control adicional.
- **Alucinaciones en tareas complejas**: el modelo original no se recomienda para razonamiento de largo contexto o preguntas técnicas sobre planos; la versión heretic hereda estas limitaciones.
- **Sesgos**: el entrenamiento puede reflejar sesgos de los datos, y el abliteration no corrige eso.
- **Licencia lfm1.0**: es una licencia específica de Liquid AI que puede imponer restricciones de uso comercial; hay que revisarla antes de producción.
- **Rendimiento en contexto largo**: con 32.768 tokens de ventana, pero se recomienda para tareas de una sola vuelta, no para conversaciones extensas.
- **No hay soporte de audio o vídeo**: solo texto e imágenes.

## Enlaces

- Modelo heretic en Hugging Face: https://huggingface.co/ansulev/LFM2.5-VL-3B-heretic
- Modelo original: [LiquidAI/LFM2.5-VL-3B](https://huggingface.co/LiquidAI/LFM2.5-VL-3B)
- Blog de Liquid AI sobre LFM2.5-VL-3B: [https://www.liquid.ai/blog/lfm2-5-vl-3b](https://www.liquid.ai/blog/lfm2-5-vl-3b)
- Documentación oficial: [https://docs.liquid.ai/lfm/models/lfm25-vl-3b](https://docs.liquid.ai/lfm/models/lfm25-vl-3b)
- Herramienta Heretic: [https://heretic-project.org](https://heretic-project.org)
- Versión GGUF de la comunidad: [https://huggingface.co/AX1Y2JP/LFM2.5-VL-3B-heretic-GGUF](https://huggingface.co/AX1Y2JP/LFM2.5-VL-3B-heretic-GGUF)
