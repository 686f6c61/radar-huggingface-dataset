# Design-Thinking-SLM/smart-home-energy-qwen3-scratch

## Resumen

Smart-Home Energy SLM es un modelo de lenguaje de pequeno tamano (SLM) de 186,8 millones de parametros totales (109,1 millones segun la model card; la discrepancia se explica por la tabla de embeddings de 151.669 entradas y el desacoplamiento de la embedding de entrada) desarrollado por Design-Thinking-SLM. Responde preguntas cortas y estructuradas sobre lecturas de electricidad domestica: calcula costes, clasifica niveles de carga, detecta picos y genera previsiones a corto plazo a partir de datos de consumo citados en la propia pregunta.

Lo relevante tecnicamente es que fue entrenado desde cero (from scratch) sobre pesos aleatorios, sin reutilizar pesos preentrenados: solo se tomo prestado el tokenizador de Qwen/Qwen3-8B. Adopta la arquitectura Qwen3 (grouped-query attention con RMSNorm por cabeza en q/k, SwiGLU, RMSNorm y RoPE) con 8 capas, anchura 512 y FFN de 2.048. El entrenamiento completo cupo en una unica GPU de portatil RTX 5060 (8 GB) en 96,8 minutos.

El modelo no es un asistente general: solo entiende preguntas con la formulacion del dataset de entrenamiento y produce texto roto ante conversacion libre. Su valor esta en demostrar que un dominio estrecho y bien delimitado puede resolverse con un modelo diminuto desplegable en local, con una tasa alta de respuestas correctas y, sobre todo, con la capacidad de decir "cannot be determined" cuando los datos no permiten responder.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Qwen3 (GQA con RMSNorm por cabeza en q/k, SwiGLU, RMSNorm, RoPE) |
| Parametros totales | 186.776.064 (safetensors); 109,1M segun model card (77,7M corresponden a la tabla de embeddings de 151.669 entradas) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 448 tokens |
| Tipos de cuantizacion | float32 (safetensors); float16 en GGUF |
| Idiomas soportados | en (ingles) |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors (float32), GGUF (float16, 379 MB), checkpoint PyTorch original (qwen3_slm.pt) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con la arquitectura Qwen3: 8 capas, anchura 512, FFN de 2.048, 8 cabezas de atencion con 4 grupos KV y dimension de cabeza 64. Usa grouped-query attention con RMSNorm por cabeza aplicado a queries y keys, activacion SwiGLU, RMSNorm y embeddings rotatorios (RoPE). La tabla de embeddings tiene 151.669 entradas, lo que concentra 77,7M de los 109,1M de parametros declarados en la model card.

El entrenamiento partio de pesos aleatorios, sin inicializacion desde un modelo preentrenado. Se uso el dataset Design-Thinking-SLM/smart-home-energy-slm en su configuracion `large`: 148.363 pares pregunta-respuesta construidos a partir de una vivienda belga (UCI Appliances Energy Prediction) y 20 viviendas del Reino Unido (REFIT). La perdida es entropia cruzada calculada unicamente sobre los tokens de respuesta. Optimizador AdamW (beta 0,9 y 0,95, weight decay 0,1) con learning rate 3e-4, 300 actualizaciones de warm-up y decaimiento coseno hasta 3e-5. Batch efectivo de 8 x 4 pasos de acumulacion de gradiente, 72.000 pasos (3,9 epocas). El mejor checkpoint (paso 69.000) alcanzo una perdida de validacion de 0,0611 sobre tokens de respuesta.

Una innovacion tecnica destacable es el tratamiento de la escala de embeddings: el notebook de entrenamiento escala los token embeddings por raiz de 512, algo que la implementacion Qwen3 de Hugging Face no hace. La conversion pliega esa escala en una embedding de entrada desacoplada (`tie_word_embeddings: false`), y los logits coinciden con el modelo original con un error menor de 1,5 x 10^-5.

## Capacidades

- Calculo de costes energeticos a partir de una lectura y una tarifa dadas en la pregunta.
- Conversiones de unidades (Wh, kWh, intervalos temporales).
- Clasificacion de niveles de carga (bajo, medio, alto) segun la lectura.
- Deteccion de picos de consumo (spike check).
- Prevision del siguiente paso y de la siguiente hora a partir de las lecturas citadas.
- Comparacion entre habitaciones (room_compare) y estadisticas de ventana temporal (window_stats).
- Extraccion de caracteristicas temporales y de ruido en las lecturas.
- Rechazo de premisas falsas: identifica cuando una afirmacion de la pregunta contradice los datos.
- Respuesta "cannot be determined" ante preguntas no respondibles con los datos disponibles (ocupacion, que aparato estaba encendido, averias, tarifas, sensores ausentes).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidad multilingue: solo ingles.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Analisis de facturas de electricidad domesticas: el modelo calcula el coste de un intervalo concreto a partir de la lectura en Wh y la tarifa en EUR/kWh, integrable en un panel de consumo que traduzca las lecturas del contador a coste monetario.
- Deteccion de anomalias de consumo: con la tarea spike_check, un sistema de monitorizacion puede enviar cada lectura y obtener una clasificacion de si constituye un pico, lo que permite disparar alertas sin depender de umbrales fijos manuales.
- Prevision a corto plazo en domotica: genera la prevision del siguiente paso y de la siguiente hora, adecuada para ajustar la programacion de electrodomesticos o la carga de baterias en un hogar con tarifa horaria.
- Clasificacion de carga para recomendaciones de eficiencia: la tarea level_classify permite etiquetar intervalos como consumo bajo, medio o alto y alimentar informes de habitos energeticos.
- Comparativa entre estancias: room_compare permite responder que habitacion consumio mas en un intervalo, util en paneles de viviendas con sensores por zona.
- Asistente de validacion de datos: la capacidad de responder "cannot be determined" lo hace apropiado como capa de control en pipelines de ingestion que deben rechazar preguntas sin datos suficientes en lugar de inventar una respuesta.
- Analisis de series temporales de sensores: las tareas time_features y window_stats extraen caracteristicas temporales y estadisticas de ventana que pueden alimentar modelos de forecasting de mayor tamano.

## Benchmarks y rendimiento

Evaluacion sobre 3.956 preguntas de test reservadas (hasta 200 por grupo tarea/fuente), decodificacion greedy, con intervalos de Wilson al 95%. Se compara con la primera version del modelo, entrenada solo con el corpus UCI y evaluada sobre las mismas preguntas.

| Tarea | Fuente | n | v1 (solo UCI) | Este modelo | IC 95% |
|---|---|---|---|---|---|
| false_premise | UCI | 200 | 98,0% | 100,0% | 98,1-100 |
| level_classify | UCI | 156 | 100,0% | 100,0% | 97,6-100 |
| lights_activity | UCI | 200 | 100,0% | 100,0% | 98,1-100 |
| noise_features | UCI | 200 | 100,0% | 100,0% | 98,1-100 |
| unanswerable | UCI | 200 | 100,0% | 100,0% | 98,1-100 |
| units_cost | UCI | 200 | 95,0% | 95,5% | 91,7-97,6 |
| time_features | UCI | 200 | 50,5% | 87,5% | 82,2-91,4 |
| time_features | REFIT | 200 | 11,5% | 61,5% | 54,6-68,0 |
| window_stats | REFIT | 200 | 13,0% | 51,5% | 44,6-58,3 |
| room_compare | UCI | 200 | 45,0% | 46,5% | 39,7-53,4 |
| spike_check | REFIT | 200 | 5,0% | 45,0% | 38,3-51,9 |
| spike_check | UCI | 200 | 15,5% | 38,5% | 32,0-45,4 |
| window_stats | UCI | 200 | 18,0% | 37,0% | 30,6-43,9 |
| outdoor_weathe | no disponible | no disponible | no disponible | no disponible | no disponible |

La metrica es exact match sobre la respuesta completa. Los resultados muestran un rendimiento casi perfecto en tareas de clasificacion y rechazo, y margen de mejora claro en tareas de estadisticas de ventana y comparacion entre habitaciones. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia: el modelo en float16 ocupa unos 379 MB (GGUF), por lo que cabe holgadamente en cualquier GPU consumer con 4 GB o mas; en float32 el peso ronda los 750 MB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) o incluso CPU. El entrenamiento original se completo en una RTX 5060 Laptop con 8 GB.
- Cabe en GPU consumer: si, en practicamente todas las disponibles actualmente.
- Opciones de despliegue: transformers (AutoModelForCausalLM), llama.cpp, Ollama (imagen ojaschaudhary20/energy-slm o hf.co/Design-Thinking-SLM/smart-home-energy-qwen3-scratch), text-generation-inference (tag text-generation-inference en el repo).
- Latencia y throughput: no disponibles de forma explicita; con 109M de parametros y contexto de 448 tokens, la generacion greedy de hasta 160 tokens es del orden de decimas de segundo en GPU consumer y de pocos segundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Smart-Home Energy SLM (este) | 109,1M (model card) / 186,8M (safetensors) | 448 | cc-by-4.0 | Dominio energetico, entrenado desde cero |
| Qwen3-0.6B | 0,6B | 32.768 | Apache 2.0 | Proposito general, preentrenado |
| SmolLM2-135M | 135M | 8.192 | Apache 2.0 | Proposito general, preentrenado |
| TinyLlama-1.1B | 1,1B | 2.048 | Apache 2.0 | Proposito general, preentrenado |

La comparacion directa con modelos de proposito general no es significativa en tareas de dominio: este modelo supera a los generalistas en sus tareas especificas (coste, clasificacion de carga, rechazo de preguntas no respondibles) pero falla por completo en conversacion libre. Su ventaja es el tamano minimo y la licencia permisiva; su desventaja, la ausencia de capacidades generales. No se dispone de datos de benchmarks comparativos directos con estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Solo entiende preguntas con la formulacion del dataset de entrenamiento; la conversacion libre produce texto incoherente.
- Contexto muy corto (448 tokens), insuficiente para conversaciones multi-turno o documentos largos.
- Solo ingles.
- No soporta tool calling, agentes ni razonamiento multi-paso.
- Riesgo de alucinacion en preguntas fuera de distribucion; el modelo mitiga parcialmente este riesgo con la respuesta "cannot be determined", pero no lo elimina.
- Sesgos conocidos: no documentados en la informacion disponible; el dataset se limita a una vivienda belga y 20 viviendas del Reino Unido, por lo que los patrones de consumo pueden no generalizar a otras regiones o tipos de vivienda.
- Rendimiento moderado en tareas de estadisticas de ventana (37-51,5%) y comparacion entre habitaciones (46,5%), insuficiente para uso critico sin validacion adicional.
- Licencia cc-by-4.0: permite uso comercial con atribucion; no se documentan restricciones adicionales.
- El modelo no se ha evaluado en produccion; su uso en sistemas de facturacion o control de energia requiere verificacion humana.

## Enlaces

- Hugging Face: https://huggingface.co/Design-Thinking-SLM/smart-home-energy-qwen3-scratch
- Dataset: https://huggingface.co/datasets/Design-Thinking-SLM/smart-home-energy-slm
- Ollama: https://ollama.com/ojaschaudhary20/energy-slm
- Tokenizador base: https://huggingface.co/Qwen/Qwen3-8B
- Dataset UCI Appliances Energy Prediction: no disponible en la informacion proporcionada
- Dataset REFIT: no disponible en la informacion proporcionada
