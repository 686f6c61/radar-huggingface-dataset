# Soho77/gpt2-balochi-generation

## Resumen

GPT-2 Balochi Text Generation es un ajuste fino del modelo GPT-2 original de OpenAI, adaptado por el usuario Soho77 para la generacion de texto en balochi (codigo ISO `bal`), una lengua iranica hablada principalmente en Pakistan, Iran y Afganistan considerada de bajos recursos en el ambito del procesamiento del lenguaje natural. El modelo parte de los pesos publicos de `gpt2` y se entrena mediante modelado de lenguaje causal sobre un corpus de instrucciones y respuestas en balochi.

La relevancia del modelo es fundamentalmente metodologica: demuestra que un transformer decoder-only preentrenado en ingles puede adaptarse a una lengua de bajos recursos con un conjunto de datos muy reducido (1.339 ejemplos) y recursos de computo modestos (Google Colab). No obstante, sus dimensiones y su volumen de entrenamiento limitan severamente su calidad y su aplicabilidad en produccion.

Arquitectonicamente se trata de un GPT-2 estandar (decoder-only, 124 millones de parametros, contexto de 1.024 tokens), con un vocabulario BPE entrenado originalmente en ingles y sin adaptacion al alfabeto arabe-persa empleado por el balochi, lo que constituye una de sus principales limitaciones tecnicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2) |
| Parametros totales | 124 millones (GPT-2 base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens (GPT-2); entrenado con secuencias de 256 tokens |
| Tipos de cuantizacion | no disponible (no se documentan en la model card; al ser compatible con transformers se puede cuantizar a FP16, INT8 e INT4) |
| Idiomas soportados | balochi (`bal`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors / PyTorch (compatible con transformers); no se publican GGUF |
| Tokenizer | GPT-2 BPE original, con `pad_token = eos_token` |
| Framework | Hugging Face Transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura GPT-2 original: un transformer decoder-only con atencion causal, 12 capas, 12 cabezas de atencion y una dimension oculta de 768, sumando aproximadamente 124 millones de parametros. La generacion es autorregresiva token a token. No se introducen modificaciones arquitectonicas, tecnicas de atencion eficiente ni decodificacion especulativa.

El ajuste fino se realizo sobre el dataset `umairjamali/balochi-instructions-1k`, compuesto por 1.339 pares instruccion-respuesta en balochi. Cada par se concateno con el formato `Instruction: [instruction]\nResponse: [response]`, se tokenizo con el tokenizer de GPT-2 y se trunco a 256 tokens. La division fue 90/10 (1.205 ejemplos de entrenamiento y 134 de validacion, semilla 42). El entrenamiento consistio en 3 epocas con learning rate 5e-5, batch size 4, weight decay 0.01 y `DataCollatorForLanguageModeling` con MLM desactivado, ejecutado en Google Colab. No se documenta RLHF, DPO ni ninguna fase de alineacion.

## Capacidades

- Generacion de texto en balochi por continuacion de un prompt, en modo autoregresivo.
- Modelado de lenguaje causal: predice el siguiente token a partir del contexto previo.
- Capacidad limitada de seguir el formato instruccion-respuesta visto durante el ajuste fino.
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de soporte documentado de agentes ni razonamiento multi-paso.
- No dispone de modo thinking, vision ni audio.
- Multilingue: no; el ajuste se limita al balochi y el tokenizer original esta orientado al ingles.
- No se documenta capacidad de codigo ni de matematicas.

## Casos de uso

- Experimentacion academica sobre adaptacion de modelos preentrenados a lenguas de bajos recursos: sirve como referencia reproducible de un pipeline completo (carga de dataset, tokenizacion, ajuste fino, calculo de perplejidad) con recursos minimos.
- Generacion de texto exploratoria en balochi para investigacion linguistica: util para estudiar como un modelo con vocabulario ingles representa texto en alfabeto arabe-persa y que patrones aprende con 1.205 ejemplos.
- Prototipado de completado de frases en balochi en entornos de laboratorio, con prompts cortos y revision humana obligatoria de la salida.
- Docencia y formacion: ejemplo didactico de ajuste fino de un modelo causal con Hugging Face Transformers y Google Colab.
- Generacion de datos sinteticos de baja calidad para aumentacion de corpus, siempre que se filtre manualmente el resultado.
- Linea base (baseline) en evaluaciones comparativas de modelos para balochi, dado su reducido coste de inferencia.
- No se recomienda su uso en atencion al cliente, generacion de codigo en produccion ni sistemas autonomos, por la escasez de datos de entrenamiento y la ausencia de alineacion.

## Benchmarks y rendimiento

Los unicos datos publicados en la model card son las metricas de entrenamiento y validacion:

| Metrica | Resultado |
|---|---|
| Perdida de evaluacion (validacion) | 1,2179713249206543 |
| Perplejidad de validacion | 3,3803231955899524 |
| Perdida de entrenamiento final (3 epocas) | 1,4189509208628674 |

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K, FLORES, etc.) en la informacion disponible. La perplejidad de 3,38 debe interpretarse con cautela: se calcula sobre solo 134 ejemplos de validacion procedentes del mismo corpus que el entrenamiento, con secuencias truncadas a 256 tokens, por lo que no es directamente comparable con perplejidades de modelos evaluados en corpus independientes.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 500 MB de pesos, en torno a 1 GB con overhead de activaciones y tokenizer.
- VRAM estimada en FP16: aproximadamente 250 MB de pesos, menos de 1 GB en total.
- VRAM estimada en INT8/INT4: por debajo de 500 MB en total.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona en CPU con latencia aceptable para textos cortos.
- Cabe holgadamente en GPU de consumo: GTX 1050 Ti, GTX 1650, RTX 3050, RTX 4060, RTX 4090, entre otras.
- Opciones de despliegue: Hugging Face Transformers (`pipeline("text-generation")`), vLLM, TGI y llama.cpp/Ollama previa conversion a GGUF (no se publican pesos GGUF oficiales).
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera un throughput alto en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Soho77/gpt2-balochi-generation | 124 M | 1.024 tokens (entrenado a 256) | Balochi | Apache 2.0 | Hugging Face |
| gpt2 (OpenAI) | 124 M | 1.024 tokens | Ingles | MIT | Hugging Face |
| umairjamali/balochi-instructions-1k (dataset) | no aplica | no aplica | Balochi | no disponible | Hugging Face |
| Modelos multilingues tipo mT5 o XLM-R | 100 M - 500 M | 512 tokens | Multilingue | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada. La comparativa se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- Corpus de entrenamiento muy reducido (1.339 ejemplos, 1.205 de entrenamiento), lo que provoca sobreajuste y una capacidad de generalizacion muy limitada.
- Tokenizer GPT-2 sin adaptacion al balochi: el texto en alfabeto arabe-persa se fragmenta en muchos tokens, lo que reduce la eficiencia y la calidad de la generacion.
- Contexto efectivo de solo 256 tokens durante el entrenamiento, muy por debajo de los 1.024 tokens teoricos del modelo base.
- Riesgo elevado de alucinacion y de generar texto gramaticalmente incorrecto o mezclado con ingles.
- Sesgos desconocidos: la model card no documenta evaluaciones de sesgo, toxicidad ni calidad linguistica.
- Sin alineacion (RLHF/DPO): puede producir contenido inapropiado ante prompts adversarios.
- Licencia Apache 2.0 permite uso comercial, pero la calidad del modelo hace desaconsejable su uso en produccion sin revision humana.
- Sin garantias de soporte ni mantenimiento; el modelo registra 0 descargas y 0 likes en el momento de la consulta.
- No se publican pesos en formato GGUF ni versiones cuantizadas oficiales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Soho77/gpt2-balochi-generation
- Dataset de ajuste fino: https://huggingface.co/datasets/umairjamali/balochi-instructions-1k
- Modelo base GPT-2: https://huggingface.co/gpt2
- Documentacion de Transformers (text-generation): https://huggingface.co/docs/transformers/tasks/language_modeling
