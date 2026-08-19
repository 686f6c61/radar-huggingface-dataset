# Norman89107/Flash-Archer-150M

## Resumen

Flash-Archer-150M es un modelo de lenguaje causal compacto, compatible con la arquitectura Llama, desarrollado por Norman89107 y publicado en Hugging Face. Se trata de un modelo base entrenado desde cero sobre aproximadamente 975 millones de tokens del dataset FineWeb-Edu, una selección educativa en inglés derivada de Common Crawl. Su propósito declarado es servir como punto de partida para experimentación con preentrenamiento personalizado, comportamiento de tokenizadores, inferencia de bajo coste y fine-tuning continuado.

Con 150 millones de parámetros, 18 capas y una ventana de contexto de 1.024 tokens, el modelo está diseñado para ejecutarse incluso en CPU, aunque se recomienda GPU para generación más rápida o fine-tuning. No está ajustado para instrucciones, por lo que debe tratarse como un modelo base de lenguaje, no como un asistente conversacional. Su licencia Apache-2.0 permite uso comercial sin restricciones, y su formato estándar de Transformers con safetensors facilita su integración en pipelines existentes.

La relevancia de este modelo radica en su tamaño reducido y su arquitectura Llama-compatible, lo que lo convierte en un candidato ideal para investigaciones educativas, pruebas de tokenizadores y comparaciones de referencia con otros modelos pequeños. Al haber sido entrenado con un subconjunto de FineWeb-Edu, ofrece una base limpia y reproducible para estudios de escalado y eficiencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama-compatible decoder-only causal LM (LlamaForCausalLM) |
| Parametros totales | 150.335.232 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | No disponible (checkpoint en float32; se puede cuantizar a float16, int8, etc.) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (model.safetensors) |

## Arquitectura y entrenamiento

Flash-Archer-150M sigue una arquitectura decoder-only estilo Llama, con 18 capas, tamaño oculto de 768, 12 cabezas de atención (todas compartidas para clave y valor), MLP intermedio de 2.304, activación SiLU, posiciones rotatorias RoPE con theta 10.000 y normalización RMSNorm con epsilon 1e-5. El tokenizador es un BPE byte-level personalizado con un vocabulario de 16.000 tokens, implementado como `PreTrainedTokenizerFast`. El checkpoint se almacena en float32, aunque el entrenamiento se realizó en precisión mixta FP16.

El entrenamiento se llevó a cabo desde cero con el dataset FineWeb-Edu (configuración `sample-10BT`), consumiendo 877.735 documentos y 974.520.320 tokens. Se utilizó el optimizador AdamW con una tasa de aprendizaje máxima de 3e-4, decaimiento coseno con 2% de warmup, weight decay de 0.1 y gradiente clipping a 1.0. El tamaño de micro-batch fue 1 con acumulación de gradientes de 128, y la longitud máxima de secuencia fue de 1.024 tokens. El entrenamiento se ejecutó en una GPU NVIDIA Tesla T4 (15.6 GB VRAM) en Kaggle, con un tiempo máximo configurado de 7 horas. No se aplicaron técnicas como RLHF o DPO; es un modelo de siguiente token puro.

## Capacidades

- Generacion de texto: modelado de lenguaje causal para producir texto en ingles de forma autoregresiva.
- Razonamiento basico: al ser un modelo base, puede completar frases y generar continuaciones coherentes, pero sin garantias de logica o factualidad.
- Codigo: no tiene entrenamiento especifico en codigo, aunque puede generar fragmentos simples si el contexto lo sugiere.
- Matematicas: no se ha evaluado; su capacidad es limitada debido al tamaño y al dataset educativo.
- Tool calling / function calling: no soportado.
- Agentes y multi-step reasoning: no soportado.
- Capacidades multilingues: solo ingles.
- Capacidades especiales: no incluye modo thinking, vision ni audio.

## Casos de uso

- Experimentacion educativa en NLP: ideal para estudiantes e investigadores que quieran entender el funcionamiento interno de un LM causal, su entrenamiento y sus limitaciones, gracias a su tamano reducido y su arquitectura estandar.
- Fine-tuning para tareas especificas en ingles: al ser un modelo base, puede ajustarse con datasets propios para clasificacion de texto, generacion de resumenes o analisis de sentimiento, con un coste computacional bajo.
- Pruebas de tokenizadores personalizados: el tokenizador BPE de 16k permite experimentar con diferentes estrategias de tokenizacion y su impacto en la generacion, sin necesidad de entrenar un modelo grande.
- Generacion de texto ligera en entornos con recursos limitados: puede ejecutarse en CPU para prototipos o aplicaciones embebidas donde no se dispone de GPU, generando texto corto con latencia aceptable.
- Baseline para comparaciones: sirve como punto de referencia para evaluar otros modelos pequenos o para medir el efecto de cambios arquitectonicos o de datos en el rendimiento.
- Prototipado rapido de aplicaciones de texto: permite validar ideas de productos que requieran generacion de lenguaje natural sin invertir en infraestructura costosa, gracias a su tamano y facilidad de carga.
- Investigacion sobre preentrenamiento desde cero: su entrenamiento reproducible con FineWeb-Edu facilita estudios sobre la influencia de la calidad de los datos, la cantidad de tokens y los hiperparametros en el rendimiento final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye metricas de validacion del entrenamiento, que se presentan como diagnosticos aproximados:

| Checkpoint | Paso | Tokens vistos | Perdida de validacion | Perplejidad |
|---|---:|---:|---:|---:|
| Mejor validacion registrada | 4.200 | 550.502.400 | 3.0669 | 21.48 |
| Validacion final registrada | 7.400 | 969.932.800 | 3.3003 | 27.12 |

Estos valores provienen de una configuracion de validacion con pocos lotes (`val_batches=2`), por lo que deben interpretarse con cautela. No se reivindica ningun resultado estandarizado.

## Requisitos de hardware

- VRAM estimada para inferencia: en float32, el modelo ocupa aproximadamente 600 MB; en float16, unos 300 MB; en cuantizacion int8, alrededor de 150 MB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente. Una NVIDIA T4, RTX 3060 o superior ofrece generacion rapida. Tambien puede ejecutarse en CPU para pruebas.
- Compatibilidad con GPU de consumo: si, cabe en cualquier GPU moderna, incluso en integradas con suficiente RAM compartida.
- Opciones de despliegue: compatible con Transformers (Hugging Face), vLLM, llama.cpp, Ollama y TGI (Text Generation Inference). Al ser un modelo pequeno, es adecuado para entornos de edge.
- Latencia y throughput estimados: no disponibles. Dado el tamano, se espera una generacion de decenas de tokens por segundo en GPU y unos pocos en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos. A continuacion se presenta una comparacion estructural con otros modelos pequenos de la misma categoria:

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Formato |
|---|---|---|---|---|---|
| Flash-Archer-150M | 150M | 1.024 | Llama-compatible | Apache-2.0 | safetensors |
| ryze-125m (mismo autor) | 125M | No disponible | GPT-2 compatible | Apache-2.0 | safetensors |
| GPT-2 small (referencia) | 124M | 1.024 | GPT-2 | MIT | safetensors |

La comparacion se limita a caracteristicas tecnicas, ya que no hay resultados de rendimiento publicados para Flash-Archer-150M ni para ryze-125m. GPT-2 small es un modelo clasico con benchmarks ampliamente conocidos, pero no se incluyen aqui por no ser objeto de esta ficha.

## Limitaciones y advertencias

- Modelo base, no ajustado para instrucciones: no sigue comandos ni mantiene conversaciones coherentes; puede producir respuestas irrelevantes o repetitivas.
- Calidad de generacion limitada: al ser pequeno y entrenado con un volumen de datos moderado, la fluidez y coherencia son inferiores a modelos de mayor tamano.
- Sesgos y contenido inapropiado: entrenado con texto web, puede reproducir sesgos, errores factuales o contenido ofensivo presente en los datos.
- Contexto limitado a 1.024 tokens: no es adecuado para tareas que requieran contexto largo, como resumen de documentos extensos o conversaciones multi-turno prolongadas.
- Sin evaluacion de seguridad ni de capacidades: no se ha evaluado en benchmarks de razonamiento, codigo, matematicas o seguridad, por lo que su comportamiento en estos dominios es desconocido.
- Metricas de validacion ruidosas: los valores de perplejidad provienen de una configuracion con pocos lotes, por lo que no son fiables como indicadores de rendimiento general.
- Tokenizador personalizado: el vocabulario de 16k tokens puede no ser optimo para dominios especializados, y su comportamiento fuera del ingles no esta garantizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Norman89107/Flash-Archer-150M
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
