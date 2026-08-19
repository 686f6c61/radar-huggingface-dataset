# npario/LFM2.5-VL-3B-GGUF

## Resumen

LFM2.5-VL-3B es un modelo multimodal de visión y lenguaje desarrollado por Liquid AI, diseñado específicamente para despliegue en dispositivos edge y entornos con recursos limitados. Se trata de una evolución de LFM2-VL-3B, con mejoras en grounding (localización de objetos mediante lenguaje natural), OCR de página completa con anotación de layout y function calling. El modelo combina un backbone de lenguaje LFM2.5-2.6B con un codificador de visión SigLIP2 NaFlex de 400M, alcanzando una ventana de contexto de 32.768 tokens.

La relevancia de este modelo radica en su eficiencia: es capaz de ejecutarse en menos de 3,3 GB de memoria, logrando 228 tokens por segundo en un Apple M5 Max y 116 tokens por segundo en un AMD Ryzen AI Max+ 395. Esto lo convierte en una opción atractiva para aplicaciones en tiempo real como detección de objetos en automoción, procesamiento de documentos escaneados o traducción en dispositivo. El repositorio analizado (npario/LFM2.5-VL-3B-GGUF) contiene las versiones cuantizadas en formato GGUF, optimizadas para inferencia en CPU con llama.cpp.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida (backbone LFM2.5-2.6B + vision encoder SigLIP2 NaFlex 400M) |
| Parametros totales | 2.697.198.592 (2,7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | GGUF (consultar repositorio para archivos específicos) |
| Idiomas soportados | Árabe, chino, inglés, francés, alemán, hindi, indonesio, italiano, japonés, coreano, polaco, portugués, ruso, español, tailandés, vietnamita |
| Licencia | lfm1.0 |
| Formato de pesos | GGUF (safetensors para el modelo original) |

## Arquitectura y entrenamiento

LFM2.5-VL-3B es un modelo híbrido que combina un backbone de lenguaje (LFM2.5-2.6B) con un codificador de visión SigLIP2 NaFlex de 400M parámetros. El procesamiento de imágenes utiliza resolución nativa: las imágenes grandes se dividen en parches no solapados de 512×512 píxeles, junto con una miniatura redimensionada de la imagen completa. Esta arquitectura permite manejar imágenes de alta resolución sin perder detalles.

El modelo se construyó a partir de LFM2-VL-3B mediante entrenamiento intermedio y posterior (mid- y post-training), aunque no se han publicado detalles específicos sobre la composición del dataset ni el número de tokens de entrenamiento. El vocabulario tiene un tamaño de 128.000 tokens. Para la generación de texto se recomiendan los parámetros `temperature=0.2`, `top_k=50` y `repetition_penalty=1.0`. No se ha documentado el uso de RLHF o DPO en la información disponible.

## Capacidades

- Procesamiento multimodal de texto e imágenes, incluyendo comprensión de escenas, objetos y texto incrustado en imágenes.
- Grounding y detección de objetos mediante consultas en lenguaje natural, devolviendo coordenadas de bounding boxes.
- OCR de página completa con anotación de layout, permitiendo extraer estructura y posición de los elementos textuales.
- Function calling / tool calling, tanto a partir de texto como de imágenes.
- Soporte multilingüe en 16 idiomas, incluyendo español, inglés, francés, alemán, chino, japonés, etc.
- Generación de texto conversacional con formato ChatML.
- Procesamiento de imágenes de alta resolución mediante parcheado adaptativo (NaFlex).

## Casos de uso

- Detección de objetos en tiempo real para automoción: el modelo puede localizar objetos en imágenes de cámaras con baja latencia, gracias a su velocidad de inferencia (228 tok/s en Apple M5 Max) y su capacidad de grounding. Es adecuado para sistemas de asistencia al conductor o vigilancia.
- OCR de documentos escaneados con layout: permite convertir PDFs escaneados en texto buscable, preservando la estructura de la página (títulos, párrafos, tablas). Su capacidad de anotación de layout facilita la indexación y el análisis documental.
- Traducción en dispositivo de menús y señales de tráfico: al ser multilingüe y ejecutarse en menos de 3,3 GB de memoria, puede integrarse en aplicaciones móviles o dispositivos portátiles para traducción instantánea de texto capturado con la cámara.
- Asistente de visión para personas con discapacidad visual: el modelo puede describir escenas, leer texto en voz alta y responder preguntas sobre el entorno, funcionando en tiempo real en hardware de consumo.
- Automatización de interfaces de usuario (screen understanding): puede interpretar capturas de pantalla de aplicaciones web o móviles, permitiendo automatizar flujos de trabajo o generar pruebas de UI.
- Chat con imágenes en tiempo real: integrable en aplicaciones de mensajería o asistentes virtuales para responder preguntas sobre fotos, con soporte de function calling para acciones adicionales.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card incluye una imagen con promedios por grupo de tareas, pero no se proporcionan los valores concretos. Por tanto, no es posible presentar una tabla comparativa con datos verificables.

## Requisitos de hardware

- Memoria: menos de 3,3 GB para inferencia, según datos oficiales.
- GPU recomendadas: puede ejecutarse en GPUs de consumo con 4-6 GB de VRAM (por ejemplo, RTX 3060, RTX 4060) y en hardware de Apple Silicon (M5 Max) o AMD Ryzen AI Max+ 395.
- CPU: compatible con inferencia en CPU mediante llama.cpp, gracias al formato GGUF.
- Opciones de despliegue: llama.cpp, vLLM, SGLang, Hugging Face Transformers, ONNX Runtime, MLX (para Apple Silicon).
- Rendimiento medido: 228 tok/s en Apple M5 Max y 116 tok/s en AMD Ryzen AI Max+ 395, con menos de 3,3 GB de memoria.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM2.5-VL-3B (este) | 2,7B | 32.768 | lfm1.0 | GGUF, safetensors, ONNX, MLX | Híbrido, multimodal, edge |
| LFM2-VL-3B (predecesor) | ~3B | no disponible | lfm1.0 | safetensors | Versión anterior, sin mejoras de grounding y OCR |
| Phi-3.5-vision (Microsoft) | 4,2B | 128K | MIT | safetensors | Multimodal, pero mayor consumo de memoria |
| Qwen2-VL-2B (Alibaba) | 2B | 32K | Apache 2.0 | safetensors, GGUF | Multimodal, pero sin datos de rendimiento edge comparables |

No se dispone de benchmarks comparativos directos en la información proporcionada. La comparación se basa en características técnicas conocidas.

## Limitaciones y advertencias

- No recomendado para tareas de razonamiento intensivo o de contexto largo, como diseño visual web o análisis de planos técnicos complejos.
- Optimizado para tareas de un solo turno; puede degradarse en conversaciones multi-turno largas.
- Riesgo de alucinaciones en descripciones de imágenes o respuestas a preguntas visuales ambiguas.
- Sesgos potenciales no documentados, derivados de los datos de entrenamiento (no se especifica su composición).
- Licencia lfm1.0: se debe revisar el texto completo de la licencia para verificar restricciones de uso comercial y redistribución.
- El repositorio GGUF analizado (npario) tiene 0 descargas y 0 likes, lo que sugiere que puede ser una contribución reciente o no verificada; se recomienda usar el repositorio oficial de Liquid AI para producción.

## Enlaces

- Repositorio GGUF analizado: https://huggingface.co/npario/LFM2.5-VL-3B-GGUF
- Modelo base (LiquidAI): https://huggingface.co/LiquidAI/LFM2.5-VL-3B
- Repositorio GGUF oficial: https://huggingface.co/LiquidAI/LFM2.5-VL-3B-GGUF
- Blog de lanzamiento: https://www.liquid.ai/blog/lfm2-5-vl-3b
- Documentación oficial: https://docs.liquid.ai/lfm/models/lfm25-vl-3b
- Playground de Liquid AI: https://playground.liquid.ai/
- Demo WebGPU: https://huggingface.co/spaces/LiquidAI/LFM2.5-VL-3B-WebGPU
