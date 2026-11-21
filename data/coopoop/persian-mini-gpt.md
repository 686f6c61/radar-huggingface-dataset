# coopoop/persian-mini-gpt

## Resumen

PersianMiniGPT es un modelo de lenguaje conversacional en persa (farsi) desarrollado por el usuario coopoop y publicado en Hugging Face bajo licencia MIT. Se trata de un transformer decoder-only construido y entrenado completamente desde cero en PyTorch, sin partir de pesos preentrenados de terceros ni de respuestas predefinidas mediante reglas condicionales. El modelo se distribuye como material didáctico y experimental más que como herramienta de producción.

La arquitectura emplea Pre-RMSNorm, embeddings posicionales rotatorios (RoPE) y capas feed-forward con activación SwiGLU, junto con un tokenizador ByteLevel BPE propio de 1.600 tokens entrenado específicamente para persa. El tamaño es extremadamente reducido, en torno a 2,1 millones de parámetros, y la ventana de contexto es de 256 tokens, suficiente para mantener historiales de conversación de pocos turnos.

Su relevancia es fundamentalmente educativa: sirve como ejemplo reproducible de un pipeline completo de entrenamiento de un modelo de lenguaje (tokenizador, arquitectura y pesos) en un idioma con menor representación en los grandes corpus, y permite estudiar el comportamiento de un transformer mínimo en tareas conversacionales en persa. No debe confundirse con un modelo de propósito general: su escala limita severamente la calidad y la coherencia de las respuestas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con Pre-RMSNorm, RoPE y SwiGLU |
| Parametros totales | Aproximadamente 2,1 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | No disponible (pesos en PyTorch nativo, `model_weights.pt`) |
| Idiomas soportados | Persa (fa) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`); tokenizador en `tokenizer.json` |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con normalización previa a la atención y al bloque feed-forward (Pre-RMSNorm), embeddings posicionales rotatorios (RoPE) para codificar la posición y capas feed-forward con SwiGLU. El tokenizador es un ByteLevel BPE entrenado desde cero con un vocabulario de 1.600 tokens, lo que reduce el tamaño del embedding pero limita la granularidad de la tokenización en un idioma con alfabeto propio como el persa.

El entrenamiento se realizó íntegramente desde cero, sin inicialización a partir de pesos preentrenados ni ajuste supervisado sobre un modelo base. La model card no especifica el volumen de tokens de entrenamiento, la composición del corpus, ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales más allá de la propia arquitectura estándar empleada.

## Capacidades

- Generación de texto conversacional en persa, orientada a mantener historiales de diálogo de pocos turnos dentro de la ventana de 256 tokens.
- Razonamiento básico y generación de texto libre, limitados por el tamaño de 2,1 millones de parámetros.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: únicamente persa (fa); no se documenta soporte de otros idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Estudio didáctico de arquitecturas transformer: el repositorio incluye `model.py` con la implementación completa, lo que permite analizar la construcción de un decoder-only con RoPE y SwiGLU sin dependencias de frameworks de alto nivel.
- Reproducción de pipelines de entrenamiento desde cero: sirve como plantilla para entrenar modelos mínimos en idiomas con pocos recursos, incluyendo el entrenamiento del tokenizador BPE específico.
- Experimentación con tokenizadores de vocabulario reducido: el vocabulario de 1.600 tokens permite estudiar el equilibrio entre tamaño del embedding y cobertura léxica en persa.
- Pruebas de concepto de chat conversacional en persa: el script `chat_hf.py` ofrece un punto de partida para integrar el modelo en una interfaz de chat sencilla mediante `huggingface_hub`.
- Docencia y talleres de PyTorch: el tamaño reducido permite entrenar o ajustar el modelo en CPU o en GPU de consumo en tiempos acotados, lo que facilita ejercicios prácticos.
- Evaluación de límites de escala: útil para comparar cualitativamente la coherencia conversacional de un modelo de 2,1 millones de parámetros frente a modelos mayores en el mismo idioma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; con 2,1 millones de parámetros, los pesos ocupan pocos megabytes en precisión de 32 bits.
- GPU recomendadas: no se requiere GPU; el modelo puede ejecutarse en CPU sin dificultad.
- GPU de consumo: cabe en cualquier GPU de consumo, e incluso en entornos sin GPU.
- Opciones de despliegue: PyTorch nativo mediante `model.py` y `model_weights.pt`; el repositorio proporciona `chat_hf.py` para chat conectado a Hugging Face. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| coopoop/persian-mini-gpt | ~2,1 M | 256 tokens | Persa | MIT | Hugging Face |
| Alternativas comparables de tamano similar | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre modelos comparables de la misma categoría (transformers mínimos entrenados desde cero para persa) en la información proporcionada.

## Limitaciones y advertencias

- Escala muy reducida: con aproximadamente 2,1 millones de parámetros, la coherencia, la factualidad y la capacidad de razonamiento son muy limitadas; no es apto para tareas de producción.
- Ventana de contexto de solo 256 tokens, insuficiente para conversaciones largas o documentos extensos.
- Tokenizador de 1.600 tokens: un vocabulario tan pequeño puede fragmentar en exceso palabras persas y degradar la calidad de la generación.
- Riesgo elevado de alucinación y de respuestas incoherentes o repetitivas, dado el escaso volumen de entrenamiento implícito en su escala.
- Sesgos conocidos: no documentados en la model card; al entrenarse desde cero, puede reflejar sesgos del corpus no especificado.
- Idiomas: únicamente persa; no se debe esperar un comportamiento correcto en otros idiomas.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías sobre la calidad o idoneidad del modelo.
- Sin datos de benchmarks ni de composición del dataset de entrenamiento, lo que impide evaluar su rendimiento de forma objetiva.

## Enlaces

- Hugging Face: https://huggingface.co/coopoop/persian-mini-gpt
