# RedHatAI/gemma-2-2b-it-FP8

## Resumen

RedHatAI/gemma-2-2b-it-FP8 es una versión cuantizada a FP8 del modelo Gemma 2 2B Instruct de Google, publicada por Neural Magic en el ecosistema de Red Hat AI. Esta optimización reduce a la mitad el tamaño en disco y los requisitos de memoria GPU respecto al modelo original en BF16, manteniendo un rendimiento casi idéntico: 58,41 puntos en OpenLLM v1 frente a 58,80 del modelo sin cuantizar. El objetivo principal es facilitar el despliegue en producción con el backend vLLM, reduciendo costes de infraestructura sin sacrificar precisión.

El modelo se obtiene aplicando cuantización simétrica por tensor sobre los pesos y activaciones de las capas lineales de los bloques transformer, utilizando la librería LLM Compressor con 512 secuencias de calibración del dataset UltraChat. La arquitectura subyacente es la misma de Gemma 2 2B, un transformer decoder-only con 3,2 mil millones de parámetros, pensado para tareas de asistente conversacional en inglés. La licencia es la de Gemma, con restricciones comerciales específicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 2) |
| Parametros totales | 3.204.165.888 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (evaluado con max_model_len=4096) |
| Tipos de cuantizacion | FP8 (weights y activaciones, simetrica por-tensor) |
| Idiomas soportados | Ingles (segun la model card, el uso en otros idiomas esta fuera del alcance) |
| Licencia | Gemma (terminos de Google: https://ai.google.dev/gemma/terms) |
| Formato de pesos | safetensors (compatible con vLLM) |

## Arquitectura y entrenamiento

El modelo es una cuantizacion FP8 del checkpoint oficial `google/gemma-2-2b-it`. La arquitectura original es un transformer decoder-only con 2.6 mil millones de parametros (3.2 con embeddings) y 8 cabezas de atencion, disenado para tareas de chat y generacion de texto. La cuantizacion se aplica exclusivamente a los operadores lineales dentro de los bloques transformer, dejando fuera el `lm_head`. Se utiliza cuantizacion simetrica per-tensor, donde una unica escala lineal mapea las representaciones FP8 de pesos y activaciones.

El proceso de cuantizacion se realiza con LLM Compressor, usando 512 secuencias de calibracion del dataset UltraChat (split `train_sft`). El modelo fue evaluado con lm-evaluation-harness y el motor vLLM, logrando una caida de rendimiento inferior a 0.4 puntos en la suite OpenLLM v1 (58.41 frente a 58.80). No se aplico ningun tipo de fine-tuning o RLHF; la cuantizacion es la unica modificacion respecto al modelo original.

## Capacidades

- Generacion de texto y chat conversacional multi-turno, siguiendo el formato de instrucciones de Gemma 2 (con `apply_chat_template`).
- Razonamiento logico y matematico basico, heredado de las capacidades del modelo original.
- Generacion de codigo en lenguajes como Python, JavaScript y otros, aunque sin soporte especifico de tool calling.
- Comprension de contexto en ingles, con limitaciones para otros idiomas segun la model card.
- Compatibilidad con el backend vLLM para servir en produccion con API compatible con OpenAI.
- No soporta vision, audio ni modos de razonamiento especiales (thinking mode) de forma nativa.

## Casos de uso

- Despliegue de asistentes conversacionales en produccion con bajo coste: al reducir los requisitos de memoria a la mitad, se puede servir el modelo en una sola GPU de gama media (por ejemplo, RTX 3090 o A10) con vLLM, manteniendo latencia baja para interacciones en tiempo real.
- Evaluacion de modelos en entornos de investigacion con recursos limitados: el checkpoint FP8 permite cargar el modelo en un nodo de 8xH100 para evaluacion masiva, en lugar de necesitar multiples nodos, como se indica en la model card.
- Integracion en pipelines de generacion de codigo asistida: el modelo puede generar fragmentos de codigo en Python y otros lenguajes, aunque sin tool calling nativo, se puede combinar con frameworks como LangChain para crear agentes simples.
- Prototipado rapido de aplicaciones de NLP: gracias a su tamano reducido y compatibilidad con vLLM, se puede desplegar en entornos de desarrollo con una sola GPU, acelerando el ciclo de iteracion.
- Fine-tuning posterior en tareas especificas: aunque no se ha publicado un proceso de fine-tuning, la cuantizacion FP8 mantiene la estructura del modelo original, por lo que se puede partir de este checkpoint para realizar PEFT (LoRA) en dominios concretos.
- Servicio de inferencia en batch para analisis de documentos: con el modelo cuantizado se pueden procesar grandes volumenes de texto en paralelo, aprovechando el soporte de vLLM para generar respuestas con `SamplingParams` configurable.

## Benchmarks y rendimiento

La model card proporciona los resultados del modelo en el benchmark OpenLLM v1, comparado con el modelo original sin cuantizar. La evaluacion se realizo con lm-evaluation-harness (commit 383bbd54) y el motor vLLM, con `max_model_len=4096` y `batch_size=auto`.

| Modelo | OpenLLM v1 (score medio) |
|---|---|
| gemma-2-2b-it (BF16 original) | 58.80 |
| gemma-2-2b-it-FP8 (RedHatAI) | 58.41 |

La diferencia es de 0.39 puntos, lo que indica una perdida de precision minima tras la cuantizacion. No se proporcionan resultados por tarea especifica (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: los pesos en FP8 ocupan aproximadamente 3.2 GB (8 bits por parametro), por lo que con overhead de activaciones y contexto se puede ejecutar en una GPU con 8 GB de VRAM, aunque se recomienda al menos 12 GB para trabajar comodamente con contextos largos.
- GPU recomendadas: cualquier GPU moderna con soporte FP8, como RTX 4090, RTX 4080, A10, L4, A100 o H100. El modelo puede desplegarse en una sola GPU de consumo (16 GB o mas) sin problemas.
- Compatibilidad con vLLM: el modelo esta disenado para ser cargado con el backend vLLM, ya sea desde Hugging Face o mediante el servicio OpenAI-compatible. Se puede usar tambien con `AutoTokenizer` de transformers.
- Opciones de despliegue: vLLM (recomendado), TGI (si se adapta), y posiblemente llama.cpp con conversiones adicionales, aunque no esta documentado.
- Latencia y throughput: no se proporcionan datos oficiales, pero al ser un modelo de 2B en FP8, se espera una generacion de 50-100 tokens/segundo en una GPU como RTX 4090, dependiendo de la implementacion.

## Comparativa con modelos similares

La comparacion se hace con el modelo original y con otras cuantizaciones de modelos de tamano similar.

| Modelo | Parametros | Cuantizacion | Contexto | OpenLLM v1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| gemma-2-2b-it (original) | 3.2B | BF16 | 8K (no confirmado) | 58.80 | Gemma | HF |
| gemma-2-2b-it-FP8 (RedHatAI) | 3.2B | FP8 | no disponible (evaluado con 4K) | 58.41 | Gemma | HF |
| Llama-3.2-3B (instruct) | 3.2B | BF16 | 128K | no disponible | Llama 3.2 | HF |
| Qwen2.5-3B (instruct) | 3.2B | BF16 | 32K | no disponible | Apache 2.0 | HF |

La comparativa se limita a modelos de tamano similar, pero no hay datos de benchmarks comparables en la informacion proporcionada. El modelo FP8 se posiciona como una alternativa eficiente al original, con la misma licencia y rendimiento casi identico.

## Limitaciones y advertencias

- Sesgos: el modelo hereda los sesgos del checkpoint original Gemma 2 2B, que pueden incluir estereotipos de genero, raza o idioma, aunque no se han documentado en esta version.
- Riesgo de alucinacion: como todo modelo generativo, puede producir informacion falsa o inventada, especialmente en contextos de conocimiento especializado.
- Limitaciones de idioma: la model card recomienda el uso solo en ingles, y advierte que usarlo en otros idiomas puede producir resultados degradados.
- Restricciones de licencia: la licencia Gemma incluye condiciones de uso comercial, pero requiere aceptacion de los terminos de Google y prohibe su uso en aplicaciones que violen las leyes de comercio.
- Restricciones de contexto: no se especifica la longitud de contexto maxima del modelo; la evaluacion se realizo con 4096 tokens, por lo que no se garantiza un funcionamiento correcto con contextos mas largos.
- Dependencia de vLLM: el modelo esta optimizado para vLLM; su uso con otros frameworks (como llama.cpp o TGI) no esta documentado y puede requerir conversion o ajustes.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/RedHatAI/gemma-2-2b-it-FP8
- Modelo original: https://huggingface.co/google/gemma-2-2b-it
- LLM Compressor (herramienta de cuantizacion): https://github.com/vllm-project/llm-compressor
- vLLM (backend de inferencia): https://docs.vllm.ai/en/latest/
- lm-evaluation-harness (benchmark): https://github.com/EleutherAI/lm-evaluation-harness/tree/383bbd54bc621086e05aa1b030d8d4d5635b25e6
- Terminos de licencia Gemma: https://ai.google.dev/gemma/terms
