# LiquidAI/LFM2.5-VL-1.6B

## Resumen

LFM2.5-VL-1.6B es un modelo de visión-lenguaje (VLM) desarrollado por Liquid AI, presentado en enero de 2026 como la versión renovada de su primer modelo multimodal LFM2-VL-1.6B. Construido sobre el backbone de lenguaje LFM2.5-1.2B-Base y equipado con un encoder visual SigLIP2 NaFlex de 400M, el modelo está diseñado para ejecutarse en dispositivos con recursos limitados (edge, móvil, navegador) manteniendo un rendimiento sólido en tareas de comprensión visual, OCR y seguimiento de instrucciones multimodales.

El modelo destaca por su procesamiento nativo de imágenes de hasta 512×512 píxeles sin reescalado, una estrategia de teselado que divide imágenes grandes en parches no solapados, y una ventana de contexto de 32.768 tokens. Soporta ocho idiomas (inglés, árabe, chino, francés, alemán, japonés, coreano y español) y se distribuye bajo la licencia propia lfm1.0, con pesos en formato safetensors. Su tamaño compacto de 1.600 millones de parámetros lo hace adecuado para inferencia en GPU de consumo, CPU mediante cuantización e incluso en navegador vía WebGPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone de lenguaje LFM2.5-1.2B-Base + encoder visual SigLIP2 NaFlex 400M |
| Parametros totales | 1.596.625.904 (~1,6B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | bfloat16 (nativo), GGUF (varias precisiones), ONNX, MLX 8-bit |
| Idiomas soportados | Inglés, árabe, chino, francés, alemán, japonés, coreano y español |
| Licencia | lfm1.0 (licencia propia de Liquid AI) |
| Formato de pesos | safetensors (también GGUF, ONNX, MLX) |

## Arquitectura y entrenamiento

LFM2.5-VL-1.6B combina un modelo de lenguaje base (LFM2.5-1.2B-Base) con un encoder de visión SigLIP2 NaFlex optimizado para formas no estándar. El modelo procesa imágenes de forma nativa hasta 512×512 píxeles sin upscaling, preservando proporciones no estándar sin distorsión. Para imágenes más grandes emplea una estrategia de teselado: divide la imagen en parches de 512×512 sin solapamiento y añade una miniatura completa para proporcionar contexto global. Esta configuración permite ajustar en tiempo de inferencia el número máximo de tokens de imagen y el número de teselas, ofreciendo un balance entre velocidad y calidad sin necesidad de reentrenar.

El entrenamiento se basa en el backbone preentrenado LFM2.5-1.2B-Base, con un ajuste específico para tareas de visión-lenguaje. La model card indica mejoras en el seguimiento de instrucciones, comprensión visual multilingüe (especialmente en árabe, chino, francés, alemán, japonés, coreano y español) y robustez en entradas de múltiples imágenes, imágenes de alta resolución y OCR. No se especifican detalles sobre el dataset de entrenamiento ni sobre el uso de RLHF o DPO en la información disponible.

## Capacidades

- Generación de texto y descripción de imágenes, con soporte para conversaciones multimodales multi-turno.
- Comprensión de imágenes de alta resolución mediante teselado adaptativo y miniatura global.
- OCR y comprensión de documentos, recomendado explícitamente por el autor para estas tareas.
- Procesamiento de múltiples imágenes en una misma conversación.
- Seguimiento de instrucciones mejorado en tareas que combinan visión y lenguaje.
- Comprensión visual multilingüe en ocho idiomas: inglés, árabe, chino, francés, alemán, japonés, coreano y español.
- Ajuste en tiempo de inferencia del número de tokens de imagen y teselas para optimizar velocidad/calidad.
- Compatible con el formato ChatML y con la API de Transformers para modelos image-text-to-text.
- Capacidad de ejecución en navegador mediante WebGPU para streaming de vídeo en tiempo real.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones con imágenes adjuntas (capturas de pantalla, fotos de productos) y responder en varios idiomas, gracias a su ventana de contexto de 32K tokens y su soporte multilingüe.
- Extracción de texto de documentos escaneados: su capacidad OCR y comprensión de documentos lo hace adecuado para digitalizar facturas, formularios o tarjetas de visita, convirtiendo imágenes en texto estructurado.
- Descripción de imágenes para accesibilidad: puede generar descripciones detalladas de imágenes para personas con discapacidad visual, funcionando en dispositivos móviles o en el navegador.
- Moderación de contenido visual: análisis de imágenes en redes sociales o plataformas de contenido para detectar elementos inapropiados o categorizar imágenes automáticamente.
- Asistente de soporte técnico: combinando capturas de pantalla con preguntas del usuario, el modelo puede diagnosticar errores de software o configuraciones incorrectas, aprovechando su capacidad de razonamiento visual.
- Transcripción de vídeo en tiempo real: gracias a la demo WebGPU, puede generar subtítulos o descripciones de vídeo en streaming, útil para videoconferencias o vigilancia ligera.
- Educación y tutoría: responder preguntas sobre diagramas, gráficos o ilustraciones en entornos educativos, con soporte en varios idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas comparativas con otros modelos. Se recomienda consultar el blog de Liquid AI o el paper asociado (arXiv:2511.23404) para datos de evaluación adicionales.

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16, el modelo ocupa aproximadamente 3,2 GB (tamaño del repositorio), por lo que cabe en GPUs con 4 GB o más. Con cuantización GGUF de 8 bits, la huella se reduce a ~1,6 GB; en 4 bits, a ~0,8 GB.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM (RTX 3050, RTX 4060, etc.). Para CPU, se puede usar llama.cpp con cuantización GGUF.
- Es adecuado para consumer GPUs y para despliegue en edge (móvil, Raspberry Pi con suficiente RAM) gracias a su tamaño compacto.
- Opciones de despliegue: Transformers (con `device_map="auto"`), vLLM (mencionado en la model card), llama.cpp (vía GGUF), ONNX Runtime, MLX para Apple Silicon, y WebGPU en navegador.
- Latencia y throughput: no se proporcionan cifras oficiales, pero al ser un modelo de 1,6B parámetros, se espera una generación rápida incluso en CPU con cuantización. La demo WebGPU sugiere capacidad de streaming de vídeo en tiempo real.

## Comparativa con modelos similares

No se dispone de datos comparativos concretos en la información proporcionada. El modelo es comparable en tamaño a otros VLMs compactos como Qwen2-VL-2B o PaliGemma-3B, pero no se han publicado resultados de benchmarks que permitan una comparación cuantitativa. La model card menciona que LFM2.5-VL-1.6B es la versión renovada de LFM2-VL-1.6B, indicando mejoras en seguimiento de instrucciones, multilingüismo y robustez visual, pero sin cifras específicas.

## Limitaciones y advertencias

- No está recomendado para tareas intensivas en conocimiento (knowledge-intensive), según la propia model card. Es adecuado para visión general, OCR y comprensión de documentos, pero puede fallar en preguntas que requieran conocimiento factual amplio.
- Riesgo de alucinación: como todos los modelos generativos, puede producir descripciones o respuestas inexactas, especialmente con imágenes ambiguas o de baja calidad.
- Limitaciones de idioma: aunque soporta ocho idiomas, el rendimiento puede variar entre ellos; el inglés probablemente tenga mejor cobertura que idiomas menos representados.
- Licencia lfm1.0: es una licencia propia de Liquid AI; es necesario revisar sus términos para uso comercial, aunque la model card indica compatibilidad con despliegue en Azure y uso en producción.
- La ventana de contexto de 32K tokens es amplia, pero el número de tokens de imagen es configurable (por defecto entre 64 y 256), lo que puede limitar la cantidad de detalle visual que se puede procesar en una sola pasada.
- No se especifican sesgos conocidos, pero al estar entrenado con datos web, puede heredar sesgos presentes en esos datos.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/LiquidAI/LFM2.5-VL-1.6B)
- [Blog de Liquid AI sobre la familia LFM2.5](https://www.liquid.ai/blog/introducing-lfm2-5-the-next-generation-of-on-device-ai)
- [Demo WebGPU de streaming de vídeo](https://huggingface.co/spaces/LiquidAI/LFM2.5-VL-1.6B-WebGPU)
- [Playground de Liquid AI](https://playground.liquid.ai/chat?model=lfm2.5-vl-1.6b)
- [Documentación de Liquid AI](https://docs.liquid.ai/lfm/getting-started/welcome)
- [LEAP (entorno de Liquid AI)](https://leap.liquid.ai/)
- [Paper asociado (arXiv:2511.23404)](https://arxiv.org/abs/2511.23404)
- [Modelo base LFM2.5-1.2B-Base](https://huggingface.co/LiquidAI/LFM2.5-1.2B-Base)
- [Versión GGUF](https://huggingface.co/LiquidAI/LFM2.5-VL-1.6B-GGUF)
- [Versión ONNX](https://huggingface.co/LiquidAI/LFM2.5-VL-1.6B-ONNX)
- [Versión MLX 8-bit](https://huggingface.co/mlx-community/LFM2.5-VL-1.6B-8bit)
