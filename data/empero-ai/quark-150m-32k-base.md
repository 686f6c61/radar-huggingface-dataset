# empero-ai/Quark-150M-32K-Base

## Resumen

Quark-150M-32K-Base es un modelo de lenguaje base de aproximadamente 165 millones de parámetros (165.156.224 según los pesos en safetensors), desarrollado por empero-ai y publicado bajo licencia Apache 2.0. Se trata de un artefacto de investigación creado desde cero (no es un fine-tune de un modelo existente) con el objetivo de estudiar arquitecturas de modelos pequeños, dinámicas de entrenamiento, contexto largo y aprendizaje por refuerzo a partir de un modelo base. Su rasgo más distintivo es la combinación de un tamaño muy reducido con una ventana de contexto de 32.768 tokens, algo poco habitual en modelos de esta escala.

La arquitectura es un transformer decoder-only híbrido de 16 capas (12 locales con atención de ventana deslizante y 4 globales con GQA completo), anchura 768, 12 cabezas de atención y embeddings de entrada/salida compartidos. El entrenamiento se realizó sobre aproximadamente 500.000 millones de tokens con un schedule warmup-stable-decay, incluyendo una fase final de anneal a contexto de 32K. El vocabulario es de 32.768 tokens con BPE a nivel de byte, y cada etiqueta de chat es un único token especial.

Es relevante ahora porque ofrece a la comunidad un punto de partida abierto y reproducible para investigar modelos pequeños con contexto largo, así como una familia completa de checkpoints (Raw, Base, 128K-Base y 128K-Zero con RL vía GRPO) que permite trazar la evolución del entrenamiento. No obstante, el propio autor lo etiqueta explícitamente como artefacto de investigación sin entrenamiento de seguridad ni evaluación para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only híbrido (12 capas locales con sliding-window attention + 4 capas globales con GQA) |
| Parámetros totales | 165.156.224 (140,0M sin embeddings) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantización | No disponible (los pesos se distribuyen en float32 safetensors) |
| Idiomas soportados | Inglés (en); datos multilingües presentes en el entrenamiento (15% FineWeb2-HQ) pero no declarados como soportados |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only híbrido de 16 capas con anchura 768, 12 cabezas de atención (tamaño de cabeza 64) y embeddings de entrada/salida compartidos. Doce de las capas son locales: usan atención de ventana deslizante sobre los últimos 256 tokens con RoPE, QK-norm y un attention sink aprendido por cabeza, además de una convolución causal corta de doble compuerta (kernel 4) que corre en paralelo y se mezcla por canal. Las otras cuatro capas (una de cada cuatro) son globales y emplean atención causal completa con grouped-query attention (12 cabezas de query, 4 de key/value) con RoPE y QK-norm. Incorpora además residuales de valor con compuerta (cada atención posterior a la primera mezcla sus valores con los de la primera capa mediante una compuerta por token y por cabeza), un flujo residual con escala por profundidad y RMSNorm antes y después de cada sublayer (sandwich norm), y un MLP con compuerta squared-ReLU de tamaño oculto 2048. El estado de inferencia es pequeño: solo las 4 capas globales mantienen caché KV completa; las locales guardan 255 tokens de claves/valores y un estado de convolución de 3 tokens.

El entrenamiento siguió un schedule warmup-stable-decay con learning rate pico de 2e-3, weight decay de 0,1, batches de 524K tokens y un total de aproximadamente 500.000 millones de tokens. La fase de warm-up (2B tokens, contexto 1K) usó TinyStories y pequeños conjuntos sintéticos de matemáticas y chat. La fase principal (470B tokens, contexto 4K, learning rate constante) se compuso de texto web en inglés (Ultra-FineWeb, 50%), matemáticas (FineMath, 25%), texto web multilingüe (FineWeb2-HQ, 15%), código (UltraData-Code, 7%) y trazas de razonamiento con respuestas verificadas (OpenMathReasoning, NuminaMath, SYNTHETIC-1, OpenR1-Math, Bespoke-Stratos, 3%). El anneal final (28B tokens, contexto 32K, learning rate decaído a cero) utilizó documentos sintéticos de contexto largo (aproximadamente 83%) y documentos largos reproducidos de las fuentes de la fase principal. No se menciona RLHF ni DPO en este checkpoint; el miembro de la familia Quark-150M-128K-Zero aplica GRPO directamente sobre el base de 128K.

## Capacidades

- Generación de texto autoregresiva: predicción del siguiente token sin instruction tuning.
- Seguimiento laxo del formato de chat (etiquetas `[SYSTEM]`, `[USER]`, `[MONOLOGUE]`, `[ASSISTANT]`), ya que parte de los datos de preentrenamiento tenían formato conversacional.
- Razonamiento matemático básico: el 25% del corpus principal son datos de matemáticas y un 3% son trazas de razonamiento verificadas.
- Generación de código: el 7% del entrenamiento proviene de UltraData-Code.
- Contexto largo: ventana de 32.768 tokens gracias al anneal específico.
- Capacidad multilingüe limitada: el 15% del corpus es texto web multilingüe, aunque el modelo solo declara inglés.
- Soporte de tool calling: no disponible como capacidad entrenada; el formato de chat menciona un cierre `[/TOOL_CALL]` en la generación, pero no se documenta un entrenamiento específico de function calling.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma fiable; el modelo base no ha sido entrenado para ello.
- Modo thinking: existe un bloque `[MONOLOGUE]` opcional en el formato de chat, pero es un artefacto del formato, no un modo de razonamiento entrenado.
- Sin capacidades de visión ni audio.

## Casos de uso

- Investigación sobre arquitecturas híbridas de atención: el modelo permite estudiar el equilibrio entre capas locales con ventana deslizante y capas globales con GQA en un régimen de escala pequeño, comparando el estado de inferencia reducido con el de un transformer denso equivalente.
- Estudio de dinámicas de entrenamiento y schedules: al publicarse checkpoints intermedios (Raw, Base, 128K-Base, 128K-Zero), se puede analizar el efecto del anneal de contexto y del RL con GRPO sin SFT sobre un modelo base.
- Experimentos de contexto largo en hardware modesto: con 32K tokens de ventana y ~165M de parámetros, es viable probar tareas de recuperación en contexto largo o summarización de documentos extensos en una única GPU de consumo, algo imposible con modelos de mayor tamaño.
- Destilación y fine-tuning como punto de partida: su licencia Apache 2.0 y su tamaño permiten usarlo como base para SFT ligero en tareas concretas (clasificación, extracción, generación de plantillas) en entornos de investigación.
- Evaluación de alucinación y sesgos en modelos pequeños: sirve como referencia controlada para medir cómo escala la tasa de errores factuales y sesgos con el tamaño del modelo y la composición del corpus.
- Prototipado de pipelines de inferencia: útil para validar integraciones con transformers, decodificación con sampling y penalización de repetición, plantillas de chat con tokens especiales y gestión de caché KV híbrida antes de escalar a modelos mayores.
- Docencia y reproducción de experimentos: su naturaleza abierta y su documentación detallada de mezcla de datos y hyperparámetros facilitan la reproducción académica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en float32 ocupan aproximadamente 0,66 GB (165,2M × 4 bytes); en bfloat16, unos 0,33 GB. A ello hay que sumar el estado de inferencia (caché KV de las 4 capas globales más 255 tokens de KV y estado de convolución en las locales) y las activaciones, por lo que en la práctica cabe holgadamente en GPUs con 4-8 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna con al menos 8 GB es suficiente; se ha probado con `dtype=torch.bfloat16` en CUDA según la model card. GPUs de consumo como RTX 3060, RTX 4060, RTX 4090 son adecuadas; A100/H100 no son necesarias pero funcionan.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs de consumo actuales con 8 GB o más.
- Opciones de despliegue: transformers (requiere `transformers>=5.23` y `trust_remote_code=True`, ya que el código de modelado se distribuye con los pesos). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, y la naturaleza de código personalizado hace improbable su soporte directo sin conversión.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Quark-150M-32K-Base | 165,2M | 32.768 | Apache 2.0 | Híbrido local/global, base sin instruction tuning, artefacto de investigación |
| Quark-150M-128K-Base | 165,2M (misma familia) | 131.072 (según descripción de la familia) | Apache 2.0 | Extensión a 128K con +10B tokens |
| Quark-150M-128K-Zero | 165,2M (misma familia) | 131.072 (según descripción de la familia) | Apache 2.0 | RL con GRPO sin SFT |
| Alternativas de ~150M de la competencia | No disponible | No disponible | No disponible | No se dispone de datos verificados en la información proporcionada |

No se dispone de datos de benchmarks ni de especificaciones verificadas de modelos comparables de otros autores en la información proporcionada, por lo que la comparativa se limita a los miembros de la propia familia Quark-150M.

## Limitaciones y advertencias

- Artefacto de investigación: el autor indica explícitamente que no es un producto y que no ha sido evaluado para uso en producción.
- Sin entrenamiento de seguridad: no se ha aplicado alineamiento ni filtros de seguridad; puede generar texto sesgado o dañino.
- Sin instruction tuning: es un predictor de siguiente token; no sigue instrucciones de forma fiable más allá del formato de chat aprendido de forma laxa.
- Alucinación y errores factuales: como cualquier modelo pequeño, comete errores de razonamiento y hechos; el ejemplo de la model card sobre la capital de Francia contiene imprecisiones históricas evidentes.
- Repetición en decodificación greedy: el autor recomienda sampling con temperatura 0,7, top-p 0,9 y penalización de repetición de 1,1.
- Idioma: solo declara inglés; el soporte multilingüe es incidental y no garantizado.
- Licencia Apache 2.0: permite uso comercial, pero dada la ausencia de evaluación y salvaguardas, el despliegue en producción requeriría evaluación propia y controles adicionales.
- Código personalizado: requiere `trust_remote_code=True` y `transformers>=5.23`, lo que añade riesgo de compatibilidad y de ejecución de código del autor.
- No debe usarse para decisiones que afecten a personas, según la propia model card.

## Enlaces

- Hugging Face: https://huggingface.co/empero-ai/Quark-150M-32K-Base
- Modelo base (pre-anneal): https://huggingface.co/empero-ai/Quark-150M-32K-Raw
- Modelo de 128K: https://huggingface.co/empero-ai/Quark-150M-128K-Base
- Modelo con RL (GRPO): https://huggingface.co/empero-ai/Quark-150M-128K-Zero
