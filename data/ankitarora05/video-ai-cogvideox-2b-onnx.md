# ankitarora05/video-ai-cogvideox-2b-onnx

## Resumen

CogVideoX-2B ONNX INT4/INT8 CPU es una implementación modular en ONNX Runtime del modelo de generación de vídeo a partir de texto CogVideoX-2B, desarrollada por el usuario ankitarora05 a partir del modelo original de THUDM (zai-org). El proyecto convierte el pipeline de difusión original en tres componentes ONNX independientes (encoder de texto T5, transformer de vídeo y decodificador VAE) y aplica cuantización INT4 e INT8 para reducir el espacio de almacenamiento y permitir experimentos de inferencia en CPU, incluidos equipos Apple Silicon, sin necesidad de GPU NVIDIA dedicada.

El modelo subyacente es un Diffusion Transformer de CogVideoX-2B que genera vídeo de 49 fotogramas a 8 FPS condicionado por texto. La propuesta de este repositorio no es mejorar la calidad del modelo original, sino hacerlo ejecutable en entornos con recursos limitados mediante la conversión a ONNX y la cuantización selectiva: INT4 para el transformer y el encoder T5, e INT8 para el VAE.

Es relevante para desarrolladores que quieran experimentar con generación de vídeo local en hardware de consumo o en CPU, y como referencia técnica de un pipeline de difusión de vídeo cuantizado y modularizado en ONNX. El repositorio ocupa 5,3 GB y se distribuye con licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (CogVideoXTransformer3DModel) con encoder de texto T5 y VAE AutoencoderKLCogVideoX |
| Parámetros totales | no disponible (modelo base CogVideoX-2B, aproximadamente 2.000 millones) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (secuencia de texto del encoder T5: 226 tokens) |
| Tipos de cuantización | INT4 (transformer y encoder T5, RTN, block size 32, accuracy level 4), INT8 (decodificador VAE) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX con datos tensoriales externos (.onnx y .onnx.data) |

## Arquitectura y entrenamiento

El pipeline se compone de tres grafos ONNX ejecutables de forma independiente. El encoder de texto es un T5EncoderModel cuantizado a INT4 con tokenizador T5, longitud de secuencia 226 y dimensión de embedding 4096; recibe token IDs y máscara de atención y produce los embeddings que condicionan al transformer. El transformer es un CogVideoXTransformer3DModel cuantizado a INT4 mediante cuantización RTN (round-to-nearest) con block size 32 y accuracy level 4, usando operadores MatMulNBits de ONNX Runtime y datos tensoriales externos; opera sobre latentes de vídeo con 16 canales y recibe latentes, embeddings de texto y timestep, devolviendo el ruido o velocidad predichos. El decodificador VAE es un AutoencoderKLCogVideoX cuantizado a INT8, con 16 canales de entrada y 3 de salida, compresión temporal de 4 y espacial de 8, y factor de escala latente 1,15258426.

La generación sigue un proceso de difusión iterativa con el scheduler CogVideoXDDIMScheduler (beta schedule scaled_linear, beta start 0,00085, beta end 0,012, 1000 timesteps de entrenamiento, prediction type v_prediction, zero terminal SNR activado, SNR shift scale 3,0, timestep spacing trailing, clip sample desactivado, eta 0). Se soporta classifier-free guidance en la implementación de generación. El autor indica que la implementación del scheduler debe validarse contra la versión de referencia de Diffusers antes de afirmar paridad numérica exacta, y que se realizó una validación numérica FP32 frente a INT4. No se proporcionan datos sobre el entrenamiento original del modelo base (número de tokens, composición del dataset, RLHF/DPO).

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) con configuración de 49 fotogramas y 8 FPS por defecto.
- Control configurable de pasos de inferencia, semilla, resolución y FPS.
- Soporte de classifier-free guidance en la generación.
- Inferencia en CPU mediante CPUExecutionProvider de ONNX Runtime, orientada a Apple Silicon y entornos con poca memoria.
- Componentes modulares: encoder de texto, transformer y VAE ejecutables por separado.
- Soporte de datos tensoriales externos para pesos de gran tamaño.
- Cuantización INT4 e INT8 con validación numérica frente a FP32.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Prototipado local de generación de vídeo: el modelo permite generar clips cortos a partir de prompts en equipos sin GPU NVIDIA, usando ONNX Runtime con CPUExecutionProvider, lo que facilita experimentar con difusión de vídeo en portátiles y estaciones de trabajo convencionales.
- Experimentación en Apple Silicon: la orientación explícita a sistemas Apple Silicon y la cuantización INT4/INT8 permiten ejecutar el pipeline en Mac con memoria unificada, útil para demos y pruebas de concepto.
- Investigación sobre cuantización de modelos de difusión: al separar transformer INT4, encoder T5 INT4 y VAE INT8, el repositorio sirve para estudiar el impacto de cada nivel de cuantización en la calidad visual y la fidelidad numérica.
- Docencia y formación técnica: los tres componentes ONNX independientes y el scheduler documentado permiten explicar paso a paso un pipeline de difusión de vídeo (tokenización, embeddings, denoising iterativo, decodificación VAE y codificación con FFmpeg).
- Generación de vídeo en entornos con restricciones de memoria: la reducción de almacenamiento mediante cuantización y los datos tensoriales externos permiten desplegar el pipeline donde un modelo FP32 no cabría.
- Integración en herramientas de creación de contenido offline: la salida en vídeo RGB codificada con FFmpeg y la configurabilidad de resolución, FPS y semilla permiten incorporar clips generados a flujos de edición locales sin dependencia de servicios en la nube.
- Evaluación comparativa de precisión: la validación FP32 frente a INT4 incluida en el proyecto permite medir la degradación numérica y visual de la cuantización en un modelo de difusión de vídeo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 5,3 GB en disco con pesos INT4/INT8, y el diseño apunta a inferencia en CPU con memoria limitada.
- GPU recomendadas: no se documentan GPU concretas; el proyecto está orientado a CPUExecutionProvider y Apple Silicon, sin requerir GPU NVIDIA.
- Compatibilidad con GPU de consumo: no se especifica; el objetivo declarado es la inferencia local sin GPU dedicada.
- Opciones de despliegue: ONNX Runtime con CPUExecutionProvider; el pipeline requiere FFmpeg para la codificación del vídeo de salida. No se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este pipeline de difusión).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / configuración | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CogVideoX-2B ONNX INT4/INT8 CPU (este) | ~2.000 millones (no confirmado) | 49 fotogramas, 8 FPS, secuencia T5 de 226 tokens | ONNX cuantizado INT4/INT8 | Apache 2.0 | Hugging Face |
| CogVideoX-2B original (THUDM/zai-org) | ~2.000 millones | 49 fotogramas, 8 FPS | safetensors (Diffusers) | Apache 2.0 | Hugging Face |
| CogVideoX-5B | no disponible en la información proporcionada | no disponible | safetensors (Diffusers) | no disponible en la información proporcionada | Hugging Face |

La comparación se limita al modelo base y su variante de mayor tamaño dentro de la misma familia; no se dispone de datos de benchmarks ni de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés como idioma de prompt según la model card.
- Riesgo de alucinación visual y de artefactos propios de la generación de vídeo por difusión; la cuantización INT4/INT8 puede degradar la calidad visual respecto a FP32.
- El autor advierte que la calidad del VAE debe evaluarse de forma independiente, ya que pequeñas diferencias numéricas en los píxeles decodificados afectan a la calidad visual.
- La implementación del scheduler debe validarse contra la referencia de Diffusers antes de asumir paridad numérica exacta.
- Los archivos de datos tensoriales externos (.onnx.data) deben distribuirse junto con sus grafos ONNX correspondientes; un uso incorrecto provoca fallos de carga.
- El orden de los tensores difiere entre transformer ([batch, frames, channels, height, width]) y VAE ([batch, channels, frames, height, width]), lo que exige transposiciones correctas en la integración.
- Licencia Apache 2.0: permite uso comercial, pero deben respetarse las condiciones de atribución y las licencias del modelo base y de los componentes derivados (T5, VAE).
- No se documentan sesgos específicos ni evaluaciones de seguridad; el repositorio tiene 0 descargas y 0 likes, por lo que carece de validación comunitaria.
- No se documentan requisitos de hardware ni latencias medidas, lo que dificulta planificar despliegues en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ankitarora05/video-ai-cogvideox-2b-onnx
- Modelo base CogVideoX-2B (THUDM): https://huggingface.co/THUDM/CogVideoX-2b
- Modelo base referenciado en los tags (zai-org): https://huggingface.co/zai-org/CogVideoX-2b
- Paper CogVideoX (arXiv:2408.06072): https://arxiv.org/abs/2408.06072
- ONNX Runtime: https://onnxruntime.ai/
- Diffusers (referencia del scheduler): https://github.com/huggingface/diffusers
