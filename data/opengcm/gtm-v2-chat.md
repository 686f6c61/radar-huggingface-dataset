# OPENGCM/GTM-v2-chat

## Resumen

GTM-v2-chat es un modelo de lenguaje pequeño (SLM) de tipo decoder-only, desarrollado por el usuario OPENGCM y publicado en HuggingFace bajo licencia Apache 2.0. Se trata de la variante conversacional de GTM-v2-base: misma arquitectura y mismos pesos preentrenados, continuados con un ajuste supervisado (SFT) sobre el conjunto de datos UltraChat para que se comporte como un asistente de chat. El modelo se entrenó desde cero en una única GPU RTX Pro 6000, con ~4,16B tokens de preentrenamiento y cerca de ~1B tokens de SFT efectivos.

La arquitectura es un transformer decoder-only de estilo nanoGPT con 14 capas, 8 cabezas de atención, dimensión de embedding de 704 y una ventana de contexto de 1024 tokens. El tokenizador es el BPE de GPT-2 de `tiktoken` (vocabulario de 50.257 entradas) y los pesos se distribuyen en fp32 con formato safetensors. Según la model card, el recuento es de ~119,4M parámetros; el archivo safetensors del repositorio declara 154.875.776 parámetros, una discrepancia que el autor no explica.

Su relevancia es fundamentalmente de investigación: demuestra de forma reproducible, con un presupuesto de una sola GPU, que el SFT sobre datos conversacionales produce un cambio cualitativo de comportamiento (pasar de continuar texto a responder preguntas directamente). No es un asistente de producción: el propio autor lo describe como un modelo hobby, con conocimiento limitado, sin capacidad de código y con tendencia a respuestas fluidas pero incorrectas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo nanoGPT (atención con `scaled_dot_product_attention` fusionada de PyTorch) |
| Parametros totales | ~119,4M según la model card; 154.875.776 según los pesos safetensors del repositorio (discrepancia no aclarada por el autor) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | No disponible (los pesos publicados están en fp32; no se distribuyen versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (fp32), acompañados de `config.json` y de un `model.py` propio; no es un `AutoModel` de `transformers` |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de 14 capas, 8 cabezas de atención y 704 dimensiones de embedding, con una longitud de bloque de 1024 tokens. Usa `scaled_dot_product_attention` fusionada de PyTorch como implementación de atención y el tokenizador BPE de GPT-2 vía `tiktoken` (vocabulario de 50.257 tokens). No hay tokens especiales de chat en el tokenizador: las conversaciones se representan como texto plano con los marcadores literales `<|user|>`, `<|assistant|>` y `<|endofturn|>`.

El preentrenamiento consumió ~4,16B tokens con una mezcla de datos detallada en GTM-v2-base (FineWeb-Edu, Cosmopedia-v2, FineMath y FineWeb). El optimizador combina Muon para matrices de pesos 2D con AdamW para embeddings, layernorms y sesgos, con estado de optimizador reiniciado para la fase de SFT. El entrenamiento se hizo con autocast en bf16 y los pesos liberados están en fp32.

La fase de SFT usó el split `train_sft` de UltraChat, que tras tokenizar queda en ~266M tokens reales; alcanzar el objetivo de ~1B tokens implicó aproximadamente 3,8 épocas sobre esos datos. La pérdida se calcula únicamente sobre los tokens de los turnos del asistente (enmascarando turnos de usuario y marcadores de plantilla) y con un pico de learning rate de 5e-5, muy inferior al 3e-4 del preentrenamiento. No se documenta uso de RLHF ni de DPO.

## Capacidades

- Generación de texto y conversación en inglés, con respuestas directas a preguntas simples tras el SFT (el ejemplo documentado es "What is the capital of France?" → "The capital of France is Paris").
- Continuidad de formato conversacional: reconoce los marcadores `<|user|>` y `<|assistant|>` como estructura de turnos, aunque son texto plano y no tokens especiales.
- Razonamiento básico y conocimiento factual de alcance muy limitado, proporcional a un corpus de preentrenamiento de ~4,16B tokens.
- No dispone de soporte de tool calling ni de function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso estructurado.
- No dispone de capacidades de visión, audio ni modalidades adicionales.
- No tiene capacidad de generación de código: no se incluyó datos de código ni en el preentrenamiento ni en el SFT.
- Multilingüismo: únicamente inglés.
- No dispone de modo "thinking" ni de decodificación especulativa implementada.
- Generación limitada a 1024 tokens de contexto (entrada más salida).

## Casos de uso

- Estudio del efecto del SFT en modelos pequeños: permite comparar directamente GTM-v2-base y GTM-v2-chat sobre los mismos pesos preentrenados para medir cuánto del comportamiento conversacional proviene del ajuste supervisado y cuánto del preentrenamiento.
- Docencia y cursos de entrenamiento de LLM desde cero: con ~0,6 GB de repositorio y requisitos de una sola GPU, es viable reproducir la inferencia y explicar la arquitectura capa por capa en un aula o taller.
- Prototipado de plantillas de chat y pipelines de tokenización: sirve para probar cómo se comporta un tokenizador BPE estándar de GPT-2 cuando la estructura de turnos se implementa con marcadores textuales en lugar de tokens especiales.
- Base para experimentos de fine-tuning ligero (LoRA, adaptadores): al ser un modelo ya alineado al formato conversacional, es un punto de partida barato para estudiar sobreajuste con conjuntos pequeños, dado que el propio SFT del autor ya usó ~3,8 épocas sobre UltraChat.
- Banco de pruebas de estrategias de parada de generación: el modelo no se detiene de forma fiable en `<|endofturn|>`, lo que lo convierte en un caso práctico para implementar y validar lógica de truncado en el bucle de decodificación.
- Experimentación con optimizadores: permite reproducir a pequeña escala la combinación Muon (matrices 2D) más AdamW (embeddings, layernorms, sesgos) y comparar curvas de pérdida frente a AdamW puro.
- Generación de texto de relleno o borradores creativos cortos con revisión humana obligatoria: útil para textos de menos de 1024 tokens donde no se requiera precisión factual.
- Comparación controlada de tokenizadores: al usar exactamente el vocabulario de GPT-2, permite aislar el efecto del tokenizador al comparar contra otros SLM entrenados desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que se evaluaron HellaSwag y ARC sobre el modelo base antes y después del SFT, pero no proporciona cifras y señala que las puntuaciones no cambiaron de forma significativa, ya que esas métricas se calculan por verosimilitud sobre texto fijo y no miden la respuesta a preguntas en estilo conversacional. El único resultado cualitativo compartido es un ejemplo aislado de respuesta correcta sobre la capital de Francia, que el propio autor califica de caso seleccionado y no de evaluación rigurosa.

## Requisitos de hardware

- VRAM estimada para inferencia: ~0,48 GB en fp32 si se toma el recuento de ~119,4M parámetros; ~0,62 GB en fp32 si se toma el recuento de los safetensors (154.875.776 parámetros), coherente con el tamaño de repositorio de 0,6 GB. En bf16/fp16 el peso sería de aproximadamente 0,31 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; el autor lo entrenó en una única RTX Pro 6000.
- Cabe en GPU de consumo: sí, en cualquier tarjeta consumer moderna (RTX 3060, RTX 4060, RTX 4090, e incluso en iGPU con memoria compartida suficiente) e incluso en CPU para inferencia interactiva, dado el tamaño.
- Opciones de despliegue: no es compatible de forma nativa con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de `transformers` y requiere el `model.py` incluido en el repositorio. El despliegue se hace con PyTorch, `safetensors` y `tiktoken` (`pip install torch safetensors tiktoken`), instanciando `GPT` y `GPTConfig` desde `config.json`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

Los datos de los modelos comparables que figuran a continuación no proceden de la información proporcionada en esta ficha y deben verificarse en sus respectivas fichas oficiales. No se dispone de resultados de benchmarks comparativos para GTM-v2-chat.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| GTM-v2-chat | ~119,4M (model card) / 154,9M (safetensors) | 1024 tokens | Inglés | Apache 2.0 | safetensors fp32 + `model.py` propio; sin soporte en vLLM, llama.cpp u Ollama |
| GPT-2 (124M) | 124M | 1024 tokens | Inglés | Licencia MIT modificada de OpenAI | safetensors/PyTorch; amplio soporte en `transformers` |
| Pythia-160M | 160M | 2048 tokens | Inglés | Apache 2.0 | safetensors; soporte en `transformers` |
| SmolLM-135M | 135M | 2048 tokens | Inglés | Apache 2.0 | safetensors, GGUF, ONNX; soporte en `transformers`, llama.cpp y Ollama |

Comparativa de rendimiento: no disponible para ninguno de los modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo no se detiene de forma fiable en su propio marcador `<|endofturn|>`: el bucle de generación usa el token de fin de texto del tokenizador, no el marcador textual aprendido en el SFT. En la práctica sigue generando después de una respuesta correcta. Es imprescindible truncar la salida en la primera aparición de `<|endofturn|>`.
- La corrección factual no está garantizada aunque el modelo responda de forma directa: el SFT enseñó mejor el formato de respuesta que la exactitud de los hechos, y se esperan respuestas incorrectas con alta confianza en muchos prompts.
- Evaluación muy limitada: no se ha realizado una evaluación sistemática de calidad conversacional (múltiples prompts, medición de tasa de fallo, comparación con otros modelos pequeños). El ejemplo de la model card es un caso seleccionado deliberadamente.
- Riesgo de sobreajuste al estilo y los temas de UltraChat: aproximadamente 3,8 épocas sobre un conjunto de ~266M tokens, menor de lo que anuncia el dataset una vez tokenizado.
- Ventana de contexto de solo 1024 tokens, lo que impide conversaciones largas o documentos extensos.
- Solo inglés: no hay datos ni evaluación en otros idiomas.
- Sin capacidad de código, al no haberse incluido datos de programación en ninguna de las dos fases de entrenamiento.
- Base de conocimiento muy reducida en comparación con modelos entrenados sobre corpus mucho mayores, como consecuencia de los ~4,16B tokens de preentrenamiento.
- Herencia de las limitaciones de GTM-v2-base en todo aquello que el SFT no abordó específicamente.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el propio autor advierte que se trata de un modelo de investigación y no de un asistente de producción; cualquier despliegue comercial requeriría una evaluación propia y controles de seguridad adicionales.
- Requiere código propio para la inferencia: no funciona con las APIs estándar de `transformers`, lo que complica su integración en herramientas y plataformas habituales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OPENGCM/GTM-v2-chat
- Modelo base: https://huggingface.co/OPENGCM/GTM-v2-base
- Dataset de SFT UltraChat: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- Tokenizador `tiktoken` (codificación GPT-2 BPE): https://github.com/openai/tiktoken
- No se han encontrado en la búsqueda web papers, blogs, repositorios ni demos adicionales asociados a este modelo; los resultados obtenidos corresponden a páginas genéricas de Wikipedia y no son relevantes.
