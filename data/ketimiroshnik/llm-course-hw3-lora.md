# ketimiroshnik/llm-course-hw3-lora

## Resumen

`ketimiroshnik/llm-course-hw3-lora` es un adaptador LoRA publicado como repositorio completo (pesos fusionados en `model.safetensors`) sobre el modelo base `OuteAI/Lite-Oute-1-300M-Instruct`. Lo desarrolla Kate Miroshnik (usuario `ketimiroshnik` de Hugging Face) como tercera tarea de un curso de LLM, y su objetivo es acotado: clasificar la tonalidad de un tuit en una de tres etiquetas (`negative`, `neutral`, `positive`) mediante generación de texto guiada por un system prompt fijo.

El modelo no es un LLM de propósito general, sino un clasificador de sentimiento de 300 millones de parámetros especializado por fine-tuning supervisado sobre el split `sentiment` del dataset `cardiffnlp/tweet_eval` (45 615 ejemplos de entrenamiento, 12 284 de test). La relevancia es fundamentalmente didáctica y de reproducibilidad: documenta el pipeline completo (LoRA con r=8 y alpha=16 sobre `k_proj` y `v_proj`, una época, lr=5e-4, batch 16, semilla 42) y publica el código de carga (`load_model.py`, `custom_layers.py`) junto con los pesos.

El resultado medido es un macro F1 de 0.5188 en test frente a 0.1674 del modelo base sin adaptar, calculado con una función de evaluación propia que considera cuatro etiquetas (incluida la respuesta vacía). Es, por tanto, una mejora sustancial en la tarea concreta, pero lejos de un clasificador de producción: el propio autor documenta que el modelo repite la etiqueta hasta agotar el límite de 16 tokens nuevos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base OuteAI/Lite-Oute-1-300M-Instruct) con adaptador LoRA fusionado |
| Parametros totales | 300.031.872 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el modelo base admite las cuantizaciones habituales de su ecosistema, no verificadas aqui) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors`) |
| Tag de pipeline | text-generation |
| Libreria | transformers |
| Tamano del repositorio | 1.2 GB |
| Dataset de entrenamiento | `cardiffnlp/tweet_eval`, configuracion `sentiment` |
| Hiperparametros LoRA | r=8, alpha=16, modulos `k_proj` y `v_proj` |
| Hiperparametros de entrenamiento | 1 epoca, lr=5e-4, batch 16, seed 42, A100 80 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base `OuteAI/Lite-Oute-1-300M-Instruct`, un transformer decoder-only de 300 millones de parametros orientado a instrucciones en ingles; el repositorio no detalla la configuracion interna (numero de capas, dimension oculta, cabezas de atencion ni longitud de contexto), por lo que esos datos deben consultarse en la model card del modelo base. Sobre el se aplica un adaptador LoRA de bajo rango (r=8, alpha=16) restringido a las proyecciones `k_proj` y `v_proj` de la atencion, y los pesos resultantes se fusionan y se guardan en un unico `model.safetensors`.

El entrenamiento es un fine-tuning supervisado clasico, sin RLHF ni DPO: una sola epoca sobre los 45 615 ejemplos del split de entrenamiento de `cardiffnlp/tweet_eval` (configuracion `sentiment`), con learning rate 5e-4, batch de 16 y semilla 42, ejecutado en una A100 de 80 GB. La innovacion tecnica es minima por diseno; lo destacable es la ingenieria de empaquetado: el autor incluye `custom_layers.py` con las definiciones de capas del cuaderno y `load_model.py` con una carga que verifica todas las claves, y afirma haber comprobado que la conversion conserva todos los tensores sin cambios y que la recarga funciona en GPU.

## Capacidades

- Generacion de texto autoregresiva en ingles, heredada del modelo base instruct.
- Clasificacion de sentimiento de tuits en tres clases (`negative`, `neutral`, `positive`) mediante un system prompt fijo: "Determine the overall sentiment of this tweet. Respond with one word: negative, neutral, or positive."
- Respuesta a formato conversacional: el ejemplo oficial usa `tokenizer.apply_chat_template` con roles `system` y `user`, y el texto del tuit se pasa como `Text: "<tuit>"`.
- Generacion determinista en el ejemplo publicado (`do_sample=False`, `max_new_tokens=16`).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun los metadatos del repositorio.
- Capacidades especiales (vision, audio, modo thinking): no disponibles.
- Razonamiento general, codigo y matematicas: no evaluados y fuera del alcance del fine-tuning.

## Casos de uso

- Clasificacion de sentimiento en redes sociales a pequena escala: el modelo devuelve una de tres etiquetas para un tuit en ingles, con un macro F1 de 0.5188 en el test oficial de `tweet_eval`; adecuado para prototipos y experimentos docentes, no para moderacion automatizada sin revision humana.
- Etiquetado asistido de corpus: util para pre-anotar grandes volumenes de tuits en ingles y acelerar el trabajo de anotadores humanos, dado el bajo coste de inferencia de un modelo de 300 M de parametros.
- Monitorizacion de marca en ingles: procesar menciones y clasificar la polaridad agregada por periodos, aceptando el ruido de una etiqueta unica por texto.
- Baseline reproducible en investigacion: el repositorio documenta hiperparametros, semilla y funcion de evaluacion, lo que permite reproducir el experimento LoRA y comparar variantes (r, alpha, modulos objetivo) sobre el mismo split.
- Material didactico de fine-tuning: ejemplo completo de adaptador LoRA fusionado, con scripts de carga y verificacion de claves, para cursos y talleres sobre `transformers`.
- Filtrado previo en pipelines de analisis: descartar o priorizar textos claramente negativos antes de pasarlos a un modelo mayor, reduciendo coste computacional en un flujo en cascada.
- Servicio de inferencia ligero: desplegable mediante text-generation-inference y compatible con endpoints, segun los tags del repositorio, para entornos con recursos limitados.

## Benchmarks y rendimiento

Unica metrica publicada por el autor, sobre el conjunto de test completo de `cardiffnlp/tweet_eval` (configuracion `sentiment`, 12 284 ejemplos). El macro F1 se calcula con la funcion de evaluacion del propio ejercicio, que contempla cuatro etiquetas, incluida la respuesta vacia.

| Metrica | Modelo base (antes) | Con adaptador LoRA (despues) |
|---|---|---|
| Macro F1 (test, 12 284 ejemplos) | 0.1674 | 0.5188 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision nativa (fp16/bf16): aproximadamente 0.6-0.8 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica cabe holgadamente en cualquier GPU consumer con 4 GB o mas.
- El entrenamiento documentado se ejecuto en una A100 de 80 GB, aunque para un modelo de 300 M con LoRA ese hardware es sobredimensionado; no se han publicado requisitos minimos de entrenamiento.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente para inferencia; A100/H100 solo tendrian sentido para lotes grandes o entrenamiento.
- Cabe en GPU consumer: si, sin cuantizacion.
- Opciones de despliegue: `transformers` con los scripts `load_model.py` y `custom_layers.py` incluidos en el repositorio; text-generation-inference segun los tags; llama.cpp, Ollama o vLLM no estan verificados en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ketimiroshnik/llm-course-hw3-lora` | 300 M | no disponible | Clasificacion de sentimiento en ingles (3 clases) | no disponible | Hugging Face, 0 descargas |
| `OuteAI/Lite-Oute-1-300M-Instruct` (modelo base) | 300 M | no disponible | Generacion de texto instruct en ingles | no disponible en esta ficha | Hugging Face |
| Clasificadores BERT/RoBERTa fine-tuned en `tweet_eval` | 100-350 M | 512 tokens tipicamente | Clasificacion de sentimiento | variable segun checkpoint | Amplia disponibilidad en Hugging Face |

La comparacion cuantitativa con clasificadores encoder-only especializados no esta disponible en la informacion proporcionada; el unico punto de referencia numerico es el propio modelo base, con macro F1 0.1674 frente a 0.5188 del adaptador.

## Limitaciones y advertencias

- El modelo repite la etiqueta hasta agotar el limite de generacion: el ejemplo del autor produce `neutral neutral neutral neut` con `max_new_tokens=16`; la funcion de evaluacion toma la primera clase encontrada, de ahi que el post-procesado sea obligatorio.
- Macro F1 de 0.5188 sobre tres clases implica un rendimiento moderado; no es apto para decisiones automatizadas sin revision.
- Entrenado en una unica epoca sobre `tweet_eval`; riesgo alto de sobreajuste al dominio y al estilo de tuits de ese dataset.
- Solo ingles; el comportamiento en castellano no esta documentado ni evaluado.
- Sesgos conocidos: no documentados por el autor; al derivar de `tweet_eval` hereda los sesgos de anotacion y de la distribucion de tuits de ese corpus.
- Riesgo de alucinacion: el modelo puede generar texto libre en lugar de una etiqueta valida; el system prompt no lo impide de forma garantizada.
- Licencia no disponible: no se puede confirmar el uso comercial ni las condiciones de redistribucion, ni del adaptador ni del modelo base.
- Longitud de contexto no documentada en el repositorio; tuits largos podrian truncarse sin aviso.
- Repositorio con 0 descargas y 0 likes, creado y actualizado el 8 de noviembre de 2026: sin validacion comunitaria ni mantenimiento conocido.
- Requiere copiar `load_model.py` y `custom_layers.py` a la misma carpeta de trabajo; no es un checkpoint cargable con `AutoModelForCausalLM` de forma directa segun la informacion disponible.
- El codigo de ejemplo usa `model.device`, atributo no estandar en todos los modelos de `transformers`; puede requerir ajustes.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ketimiroshnik/llm-course-hw3-lora
- Modelo base: https://huggingface.co/OuteAI/Lite-Oute-1-300M-Instruct
- Perfil del autor: https://huggingface.co/ketimiroshnik/models
- Dataset `cardiffnlp/tweet_eval`: https://huggingface.co/datasets/cardiffnlp/tweet_eval
- Pagina de despliegue en FriendliAI (referencia externa, no oficial): https://friendli.ai/models/Veronikyos/llm-course-hw3-lora
