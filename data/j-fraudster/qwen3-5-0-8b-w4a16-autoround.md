# J-Fraudster/Qwen3.5-0.8B-W4A16-AutoRound

## Resumen

El modelo **J-Fraudster/Qwen3.5-0.8B-W4A16-AutoRound** es una versión cuantizada a 4 bits (W4A16) del modelo multimodal Qwen3.5-0.8B de Alibaba, generada mediante el algoritmo AutoRound de Intel. La cuantización reduce el peso de los parámetros a enteros de 4 bits mientras mantiene las activaciones en bfloat16, lo que permite desplegar el modelo en hardware con menos memoria sin sacrificar en exceso la precisión. El modelo base, Qwen3.5-0.8B, es un transformer multimodal de 453 millones de parámetros que acepta entradas de imagen y texto, orientado a tareas de razonamiento visual, OCR y conversación.

Esta ficha es relevante porque demuestra un flujo de cuantización reproducible para modelos pequeños con capacidades multimodales, y porque el resultado puede ejecutarse en GPUs de consumo con poca VRAM. El repositorio incluye los pesos en formato safetensors y es compatible con vLLM mediante el backend de AutoRound. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5) con vision tower y capas de predicción multi-token (MTP) |
| Parametros totales | 453.036.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen3.5-0.8B no especifica en la informacion proporcionada; el ejemplo de vLLM usa 4096) |
| Tipos de cuantizacion | W4A16 (pesos int4, activaciones bf16), grupo de tamaño 16, simétrico |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tambien disponible en GPTQ segun el autor) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-0.8B es un transformer multimodal con un codificador de visión (vision tower) que procesa imágenes y un decodificador de lenguaje que genera texto. Incluye capas de predicción multi-token (MTP), una técnica que permite predecir varios tokens futuros simultáneamente para acelerar la inferencia. La cuantización se realizó con AutoRound, un método de descenso de gradiente por signo que optimiza los pesos cuantizados para minimizar la pérdida de precisión. Se usaron 512 muestras de calibración con una longitud de secuencia de 4096 y 1000 iteraciones de ajuste. El vision tower y las capas MTP se mantuvieron en bfloat16 para preservar la precisión en tareas visuales y de razonamiento. No se proporcionan datos sobre el entrenamiento original del modelo base (composición del dataset, número de tokens, uso de RLHF/DPO).

## Capacidades

- Generación de texto y conversación multimodal: acepta imágenes y texto como entrada y produce respuestas de texto.
- Razonamiento visual: el vision tower en bf16 conserva la capacidad de interpretar imágenes, incluyendo OCR (reconocimiento óptico de caracteres).
- Predicción multi-token: las capas MTP en bf16 permiten una decodificación más rápida al predecir varios tokens a la vez.
- Cuantización W4A16: reduce el uso de VRAM y acelera la inferencia en comparación con el modelo en bf16 completo.
- Compatibilidad con vLLM: puede servirse con el backend de AutoRound para producción de alto rendimiento.
- No se especifican capacidades de tool calling, agentes o razonamiento multi-paso en la información disponible.

## Casos de uso

- **OCR en dispositivos con recursos limitados**: al mantener el vision tower en bf16, el modelo puede extraer texto de imágenes en una GPU de gama baja (por ejemplo, una RTX 3060) sin necesidad de un servidor dedicado.
- **Clasificación y descripción de imágenes en edge computing**: su tamaño reducido permite desplegarlo en sistemas embebidos o en la nube con coste mínimo para generar descripciones automáticas de fotografías.
- **Asistente conversacional multimodal**: puede integrarse en un chatbot que reciba capturas de pantalla o fotos y responda preguntas sobre su contenido, gracias a su pipeline image-text-to-text.
- **Prototipado rápido de aplicaciones de visión-lenguaje**: al ser un modelo pequeño y cuantizado, es adecuado para validar ideas antes de escalar a modelos más grandes.
- **Servicio de inferencia en tiempo real con vLLM**: su baja huella de memoria permite servir múltiples instancias en una sola GPU, útil para entornos con alta concurrencia de peticiones cortas.
- **Educación e investigación**: sirve como ejemplo de cuantización W4A16 con AutoRound para estudiar el impacto de la precisión reducida en tareas multimodales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni métricas específicas de visión-lenguaje para esta cuantización. El autor no proporciona comparaciones numéricas con el modelo original ni con otras cuantizaciones.

## Requisitos de hardware

- VRAM estimada: no disponible en la documentación. Dado que el modelo tiene 453M parámetros y pesos en int4, la huella de pesos es de aproximadamente 0,23 GB (453M × 4 bits). Con activaciones y overhead, se estima que cabe en GPUs con 4 GB de VRAM o menos, aunque no hay datos oficiales.
- GPU recomendadas: no se especifican. Por su tamaño, debería ejecutarse en cualquier GPU consumer moderna (GTX 1660, RTX 2060, RTX 3060, etc.) y en GPUs de datacenter como A10 o T4.
- Compatibilidad con consumer GPU: sí, es muy probable que funcione en GPUs de gama baja, pero no hay confirmación del autor.
- Opciones de despliegue: vLLM (con `--quantization auto-round`), y potencialmente llama.cpp u Ollama si se convierte a GGUF, aunque no se menciona en la documentación.
- Latencia y throughput: no disponibles. La cuantización W4A16 reduce el cuello de botella de ancho de banda de memoria, lo que típicamente acelera la decodificación, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-0.8B (base) | 453M | BF16 | no disponible | Apache 2.0 | HuggingFace |
| J-Fraudster/Qwen3.5-0.8B-W4A16-AutoRound | 453M | W4A16 (int4) | no disponible | Apache 2.0 | HuggingFace |
| Vishva007/Qwen3.5-0.8B-W4A16-AutoRound-GPTQ | 453M | W4A16 (GPTQ) | no disponible | Apache 2.0 | HuggingFace |

No se dispone de datos de rendimiento para comparar numéricamente. La diferencia principal entre las versiones cuantizadas es el formato de pesos (AutoRound nativo vs GPTQ), que puede afectar a la compatibilidad con distintos backends de inferencia.

## Limitaciones y advertencias

- La cuantización a 4 bits puede degradar la precisión en tareas que requieren alta fidelidad numérica, especialmente en razonamiento matemático o lógico complejo.
- El modelo base es pequeño (0.8B), por lo que sus capacidades generales son limitadas en comparación con modelos de 7B o superiores; puede cometer errores en tareas que requieren conocimiento enciclopédico o razonamiento profundo.
- No se han publicado evaluaciones de sesgos, alucinaciones o robustez. No hay garantía de comportamiento seguro en producción.
- La documentación del autor contiene inconsistencias (por ejemplo, menciona "Qwen3.5-2B" y cifras de VRAM de 54 GB que no corresponden a un modelo de 453M parámetros). Se recomienda verificar los datos antes de confiar en ellos.
- No se especifica la longitud de contexto real del modelo base; el ejemplo de vLLM usa 4096, pero podría ser mayor o menor.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe cumplir con los términos de la licencia del modelo base (Qwen3.5) si los hubiera.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad; úsese con cautela.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/J-Fraudster/Qwen3.5-0.8B-W4A16-AutoRound
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Intel AutoRound: https://github.com/intel/auto-round
- Documentación de vLLM para LLM Compressor (Qwen3.5): https://docs.vllm.ai/projects/llm-compressor/en/latest/key-models/qwen3.5/
- Repositorio similar en GPTQ: https://huggingface.co/Vishva007/Qwen3.5-0.8B-W4A16-AutoRound-GPTQ
- Proyecto de cuantización con AutoRound: https://github.com/vishvaRam/AutoRound-Quantaization
