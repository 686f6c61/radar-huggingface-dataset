# Accio-Lab/occamy-1.0-NVFP4

## Resumen

Occamy-1.0-NVFP4 es la variante cuantizada en precisión mixta NVFP4 de Occamy-1.0, un modelo multimodal de tipo image-text-to-text desarrollado por Accio-Lab. Se trata de un modelo de mezcla de expertos (MoE) construido sobre la arquitectura Qwen3.6-35B-A3B, con 19.001.054.576 parámetros totales según los pesos safetensors publicados. La cuantización afecta exclusivamente a los expertos enrutados del MoE, que pasan a usar pesos y activaciones NVFP4, mientras que la atención, los routers, los expertos compartidos, los embeddings, la cabeza de salida y los pesos de visión se mantienen en BF16.

El interés de esta ficha radica en que ofrece una receta concreta de despliegue de un MoE multimodal de gran tamaño en un único acelerador con memoria limitada: el repositorio ocupa 24,0 GB y el checkpoint cuantizado pesa 23,93 GB, frente a los aproximadamente 38 GB que ocuparía la referencia BF16. La cuantización se realizó con NVIDIA Model Optimizer 0.44.0 mediante la configuración `NVFP4_EXPERTS_ONLY_CFG`, sin entrenamiento ni ajuste fino posterior, y se publica bajo licencia Apache-2.0, lo que facilita su uso comercial.

Es relevante ahora porque la ejecución nativa de FP4 requiere hardware y kernels compatibles (probado con SGLang 0.5.13.post1, FlashInfer 0.6.12 y PyTorch 2.11.0+cu130), y porque existe una ruta alternativa W4A16 vía Marlin en vLLM sobre una sola H200. El modelo conserva el tokenizador y la plantilla de chat originales, pero no incluye la cabeza MTP donante del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (image-text-to-text), derivada de Qwen3.6-35B-A3B; etiqueta `qwen3_5_moe` |
| Parametros totales | 19.001.054.576 (según safetensors) |
| Parametros activos | no disponible (el modelo base se denomina 35B-A3B, pero no se detalla el recuento activo en la información proporcionada) |
| Longitud de contexto | no disponible como máximo; la validación se ejecutó con contexto de 2048 tokens |
| Tipos de cuantizacion | NVFP4 (4-bit) en expertos enrutados; BF16 en atención, routers, expertos compartidos, embeddings, cabeza de salida y visión; también existen checkpoints BF16, FP8, GGUF y MLX 8/6/4/3-bit en la colección |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers; despliegue probado con SGLang y vLLM) |

## Arquitectura y entrenamiento

Occamy-1.0-NVFP4 es un modelo de mezcla de expertos con capacidades multimodales de entrada imagen-texto, construido sobre Qwen3.6-35B-A3B. La cuantización se aplica de forma selectiva: solo los expertos enrutados usan NVFP4 en pesos y activaciones, mientras que el resto de componentes (atención, routers, expertos compartidos, embeddings, cabeza de salida y torre de visión) permanecen en BF16. Esta estrategia de precisión mixta busca reducir el peso del checkpoint sin degradar las partes sensibles a la cuantización, como el enrutamiento y la proyección multimodal.

No se realizó entrenamiento ni ajuste fino durante el proceso de cuantización. La calibración empleó 128 registros del split de entrenamiento de CNN/DailyMail (configuración 3.0.0), truncados a 256 tokens, con 16 registros de test reservados. Para los pesos de expertos cuyos observadores no se activaron, ModelOpt aplicó escalado derivado del peso o de tensores fusionados durante la exportación. La información proporcionada no detalla el número de tokens de entrenamiento original, la composición del dataset ni si hubo RLHF o DPO en el modelo base. Tampoco se documentan innovaciones como decodificación especulativa: de hecho, este checkpoint no incluye la cabeza MTP donante.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat propia preservada.
- Generación de código: las pruebas de validación incluyen código generado verificado con tests independientes (2/2 en BF16 y NVFP4).
- Salida estructurada en JSON estricto: 3/4 fixtures superadas tanto en BF16 como en NVFP4.
- Tool calling / function calling: 2/2 fixtures de llamadas a herramientas y 2/2 llamadas estructuradas a través de la API, con ejecución local de una herramienta `add` y seguimiento del resultado.
- Procesamiento de imágenes: validación con reconocimiento de imagen roja sintética superada en ambas precisiones; pipeline image-text-to-text.
- Modo thinking: la plantilla de chat admite `enable_thinking`, aunque las pruebas se ejecutaron con `enable_thinking: false` y parseador de razonamiento `qwen3`.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se hacen afirmaciones amplias sobre visión, audio, vídeo, contexto largo ni throughput.

## Casos de uso

- Asistencia conversacional con imágenes: el modelo acepta entradas image-text-to-text, por lo que puede emplearse en soporte técnico donde el usuario adjunta capturas de pantalla o fotos de producto y espera una respuesta textual contextualizada.
- Automatización de llamadas a herramientas en agentes: al superar las pruebas de tool-call JSON y de seguimiento de resultados, encaja en pipelines donde el modelo decide qué función invocar, recibe la salida y continúa la conversación.
- Extracción de datos estructurados: la validación de JSON estricto permite usarlo para convertir texto libre en registros JSON validables en sistemas de ingesta, con la advertencia de que 1 de cada 4 fixtures falló en las pruebas.
- Generación de código asistida: útil en entornos de desarrollo con recursos limitados donde se quiere un modelo que produzca fragmentos de código ejecutables y verificables, integrable en flujos de revisión automatizada.
- Despliegue en un único acelerador con memoria ajustada: con 23,93 GB de pesos, es adecuado para servir en una GPU de 24 GB o superior usando la ruta W4A16 Marlin de vLLM o la ruta nativa NVFP4 de SGLang, reduciendo coste frente a la referencia BF16.
- Prototipado de asistentes multimodales en investigación: al ser Apache-2.0 y conservar tokenizador y plantilla originales, sirve para experimentar con cuantización FP4 y comparar contra el checkpoint BF16 con la misma interfaz.
- Evaluación de infraestructura FP4: útil como banco de pruebas para validar kernels NVFP4 (FlashInfer, CUTLASS) en pipelines de serving antes de adoptarlos en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo incluye comprobaciones de regresión acotadas:

| Comprobacion | BF16 | NVFP4 |
|---|---:|---:|
| Peticiones de texto finalizadas normalmente | 8/8 | 8/8 |
| Fixtures JSON estrictas | 3/4 | 3/4 |
| Fixtures JSON de tool-call | 2/2 | 2/2 |
| Llamadas a herramientas estructuradas vía API | 2/2 | 2/2 |
| Ejecución local de herramienta `add` y seguimiento | True | True |
| Código generado con tests independientes | 2/2 | 2/2 |
| NLL de tokens reservados (held-out) | 2,252837 | 2,262056 |
| Reconocimiento de imagen roja sintética | pass | pass |

Además, en una única H200 con vLLM (ruta Marlin W4A16, no FP4 nativo) el checkpoint completó las 9 peticiones y superó las 9 comprobaciones semánticas, igual que la referencia BF16. El autor advierte explícitamente que estas pruebas no constituyen benchmarks generales de calidad ni de velocidad.

## Requisitos de hardware

- VRAM estimada: 23,93 GB de pesos en NVFP4; el repositorio completo ocupa 24,0 GB. Para ejecución nativa FP4 se necesita hardware compatible con NVFP4 y kernels adecuados; en la ruta Marlin W4A16 de vLLM se requiere una GPU con al menos ~24 GB, aunque el autor solo documenta pruebas en H200.
- GPU recomendadas: H200 para la ruta vLLM W4A16 probada; GPUs con soporte nativo de FP4 (generación Blackwell) para la ruta SGLang con `modelopt_fp4`. No se documentan pruebas en A100, RTX 4090 u otras consumer GPU.
- Cabe en consumer GPU: no confirmado en la información proporcionada; el tamaño de pesos es compatible con GPUs de 24 GB, pero no hay validación publicada en ese hardware.
- Opciones de despliegue: SGLang 0.5.13.post1 con FlashInfer 0.6.12 y PyTorch 2.11.0+cu130 (configuración probada, con `--quantization modelopt_fp4`, `--moe-runner-backend flashinfer_cutlass`, `--attention-backend triton`, `--mamba-backend triton`, `--tool-call-parser qwen3_coder`, `--reasoning-parser qwen3`); vLLM con ruta Marlin W4A16. También existen checkpoints GGUF y MLX para otras rutas.
- Latencia y throughput: no disponibles; el autor no publica mediciones de rendimiento y la configuración probada usa `--max-running-requests 1`, grafos CUDA desactivados y caché radix desactivada, por lo que no representa un escenario de producción optimizado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Accio-Lab/occamy-1.0-NVFP4 | 19.001.054.576 | no disponible (validado a 2048) | safetensors NVFP4 mixto | Apache-2.0 | Objeto de esta ficha; expertos en FP4, resto en BF16 |
| Accio-Lab/occamy-1.0 (BF16) | no disponible en la informacion | no disponible | safetensors BF16 | Apache-2.0 | Referencia sin cuantizar; mismas capacidades, ~38 GB estimados por tamaño del repo NVFP4 |
| Accio-Lab/occamy-1.0-FP8 | no disponible en la informacion | no disponible | safetensors FP8 | Apache-2.0 | Variante de 8 bits de la misma familia |
| Accio-Lab/occamy-1.0-GGUF | no disponible en la informacion | no disponible | GGUF | Apache-2.0 | Orientado a llama.cpp y entornos de CPU/consumer |

No se dispone de datos de benchmarks ni de especificaciones de modelos de terceros en la información proporcionada para establecer una comparación de rendimiento con alternativas externas.

## Limitaciones y advertencias

- La calibración se hizo con solo 128 registros de CNN/DailyMail truncados a 256 tokens, lo que no garantiza cobertura de todos los expertos en todas las cargas de trabajo, según el propio autor.
- Las comprobaciones de validación son regresiones pequeñas, no benchmarks generales; no hay datos de MMLU, HumanEval, GSM8G ni similares.
- La ejecución nativa NVFP4 exige hardware y kernels compatibles; en otras GPUs se depende de rutas alternativas como Marlin W4A16, con comportamiento distinto.
- Este checkpoint no incluye la cabeza MTP donante, por lo que no se puede usar decodificación especulativa con MTP tal cual.
- Las pruebas se ejecutaron con contexto de 2048 tokens y decodificación greedy; no se establecen garantías sobre contexto largo, visión amplia, audio o vídeo.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada; deben evaluarse antes de uso en producción.
- Idiomas soportados: no disponibles; no se puede confirmar cobertura multilingüe.
- Licencia Apache-2.0 permite uso comercial, pero se debe conservar la atribución al modelo original de Accio-Lab y la licencia Apache-2.0 incluida.
- La configuración de serving probada usa un solo request concurrente y desactiva optimizaciones (grafos CUDA, caché radix, solapamiento de scheduling), por lo que no representa un despliegue de alto rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Accio-Lab/occamy-1.0-NVFP4
- Modelo base BF16: https://huggingface.co/Accio-Lab/occamy-1.0
- Checkpoint GGUF: https://huggingface.co/Accio-Lab/occamy-1.0-GGUF
- Checkpoint FP8: https://huggingface.co/Accio-Lab/occamy-1.0-FP8
- Checkpoint MLX 8-bit: https://huggingface.co/Accio-Lab/occamy-1.0-MLX-8bit
- Checkpoint MLX 6-bit: https://huggingface.co/Accio-Lab/occamy-1.0-MLX-6bit
- Checkpoint MLX 4-bit: https://huggingface.co/Accio-Lab/occamy-1.0-MLX-4bit
- Checkpoint MLX 3-bit: https://huggingface.co/Accio-Lab/occamy-1.0-MLX-3bit
- Cabeza MTP: https://huggingface.co/Accio-Lab/occamy-1.0-MTP
- Colección de modelos: https://huggingface.co/collections/Accio-Lab/occamy-10-6ac00729659e8a86ec11e216
- Explorador de checkpoints: https://huggingface.co/spaces/Accio-Lab/Occamy-Explorer
- Página del proyecto: https://accio-lab.github.io/occamy/
- Paper: https://arxiv.org/abs/2609.11977
- Dataset de calibración: https://huggingface.co/datasets/abisee/cnn_dailymail
