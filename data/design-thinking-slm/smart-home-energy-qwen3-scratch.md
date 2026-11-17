# Design-Thinking-SLM/smart-home-energy-qwen3-scratch

## Resumen

Smart-Home Energy SLM es un modelo de lenguaje de 186,7 millones de parámetros (109,1 M según la model card del autor, que excluye el embedding atado) desarrollado por Design-Thinking-SLM. Se trata de un modelo entrenado desde cero (from scratch) sobre la arquitectura Qwen3, sin reutilizar pesos preentrenados: solo se tomó prestado el tokenizer de Qwen/Qwen3-8B. Su propósito es responder preguntas cortas y estructuradas sobre lecturas de electricidad doméstica: cálculo de costes, conversiones de unidades, clasificación de niveles de carga, detección de picos y previsiones a corto plazo.

El modelo se entrenó sobre la configuración `large` del dataset Design-Thinking-SLM/smart-home-energy-slm, compuesto por 148.363 pares pregunta-respuesta construidos a partir de una vivienda belga (UCI Appliances Energy Prediction) y 20 viviendas del Reino Unido (REFIT). Es relevante como ejemplo de SLM (small language model) especializado y desplegable en hardware muy modesto: el entrenamiento completo cupo en una GPU de portátil RTX 5060 con 8 GB, en 96,8 minutos.

La limitación principal es su alcance: solo comprende preguntas formuladas como los prompts del dataset. No ha visto inglés general, por lo que el chat libre produce texto incoherente. Es, por tanto, un modelo de tarea específica, no un asistente conversacional general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Qwen3 (GQA con q/k RMSNorm por cabeza, SwiGLU, RMSNorm, RoPE) |
| Parametros totales | 186.776.064 (safetensors); 109,1 M según la model card (77,7 M corresponden a la tabla de embeddings de 151.669 entradas) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 448 tokens |
| Tipos de cuantizacion | float32 (safetensors); float16 en GGUF (379 MB) |
| Idiomas soportados | Inglés (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (float32), GGUF (float16), checkpoint PyTorch original (`qwen3_slm.pt`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen3 con 8 capas, anchura de 512, FFN de 2.048, 8 cabezas de atención con 4 grupos KV y dimensión de cabeza 64. La tabla de embeddings (151.669 entradas) concentra 77,7 M de los 109,1 M de parámetros. El entrenamiento partió de pesos aleatorios y usó solo el tokenizer de Qwen/Qwen3-8B. La pérdida es entropía cruzada calculada únicamente sobre los tokens de respuesta, con AdamW (β = 0,9/0,95, weight decay 0,1), learning rate 3e-4, 300 actualizaciones de warm-up y decaimiento coseno hasta 3e-5. Se ejecutaron 72.000 pasos (3,9 épocas) con batch efectivo de 8 × 4 pasos de acumulación de gradiente.

El entrenamiento se realizó en una única RTX 5060 Laptop GPU de 8 GB, con un pico de 4,6 GiB y un tiempo total de 96,8 minutos. La mejor pérdida de validación fue 0,0611 (sobre tokens de respuesta) en el paso 69.000, checkpoint que se publica. Una innovación técnica destacable es el ajuste de conversión: el notebook de entrenamiento escala los embeddings de tokens por √512, algo que la implementación Qwen3 de Hugging Face no hace; la conversión pliega ese factor en un embedding de entrada no atado (`tie_word_embeddings: false`), y los logits coinciden con el modelo original dentro de 1,5 × 10⁻⁵.

## Capacidades

- Cálculo de costes eléctricos y conversiones de unidades a partir de lecturas citadas en la pregunta.
- Clasificación de niveles de carga (level_classify).
- Detección y marcado de picos de consumo (spike_check).
- Previsión del siguiente paso y de la próxima hora (next-step, next-hour).
- Estadísticas de ventana temporal (window_stats) y comparación entre estancias (room_compare).
- Respuesta "cannot be determined" ante preguntas no respondibles con los datos: ocupación, electrodoméstico activo, averías, tarifas o sensores ausentes.
- Rechazo de premisas falsas (false_premise).
- Generación de texto de formato fijo y corto; sin soporte documentado de tool calling, function calling, agentes, visión, audio ni modo thinking.
- Multilingüe: no; solo inglés y solo con el fraseo del dataset.

## Casos de uso

- Asistente de facturación doméstica: dado un precio por kWh y una lectura de consumo en un intervalo, el modelo calcula el coste del periodo. Es adecuado porque el cálculo de costes y conversiones de unidades es una de sus tareas con mejor rendimiento (95,5 % exact match).
- Clasificación automática de niveles de carga: integrar el modelo en un panel de monitorización para etiquetar lecturas como bajas, medias o altas; la tarea level_classify alcanza el 100 % de exact match en el conjunto de evaluación UCI.
- Detección de anomalías de consumo: usar spike_check para marcar intervalos con picos inusuales antes de enviarlos a un sistema de alertas, con la cautela de que el exact match en esta tarea es del 38,5 % (UCI) y 45,0 % (REFIT).
- Validación de datos de sensores: el modelo rechaza premisas falsas y responde "cannot be determined" cuando faltan datos, lo que permite usarlo como filtro de coherencia en pipelines de ingesta de lecturas domésticas.
- Previsión a corto plazo en domótica: generar previsiones del siguiente paso o de la próxima hora a partir de la lectura actual para alimentar reglas de automatización; conviene tratar la salida como sugerencia, dado el rendimiento limitado en daily_profile (5,0 % UCI, 14,5 % REFIT).
- Despliegue en dispositivos de borde: con 379 MB en GGUF float16 y contexto de 448 tokens, puede ejecutarse vía Ollama o llama.cpp en hardware de bajo consumo dentro de una pasarela doméstica, sin depender de la nube.
- Educación y demostración de SLM from scratch: el repositorio incluye el notebook ejecutado, scripts de exportación y evaluación, lo que lo hace útil como caso de estudio reproducible de entrenamiento y conversión de un modelo Qwen3 pequeño.

## Benchmarks y rendimiento

Evaluación sobre 3.956 preguntas de test retenidas (hasta 200 por grupo tarea/fuente), decodificación greedy, exact match sobre la respuesta completa, con intervalos de Wilson al 95 %. Se compara con la primera versión del modelo (solo corpus UCI).

| Tarea | Fuente | n | v1 (solo UCI) | Este modelo | IC 95 % |
|---|---|---|---|---|---|
| false_premise | UCI | 200 | 98,0 % | 100,0 % | 98,1–100 |
| level_classify | UCI | 156 | 100,0 % | 100,0 % | 97,6–100 |
| lights_activity | UCI | 200 | 100,0 % | 100,0 % | 98,1–100 |
| noise_features | UCI | 200 | 100,0 % | 100,0 % | 98,1–100 |
| unanswerable | UCI | 200 | 100,0 % | 100,0 % | 98,1–100 |
| units_cost | UCI | 200 | 95,0 % | 95,5 % | 91,7–97,6 |
| time_features | UCI | 200 | 50,5 % | 87,5 % | 82,2–91,4 |
| time_features | REFIT | 200 | 11,5 % | 61,5 % | 54,6–68,0 |
| window_stats | REFIT | 200 | 13,0 % | 51,5 % | 44,6–58,3 |
| room_compare | UCI | 200 | 45,0 % | 46,5 % | 39,7–53,4 |
| spike_check | REFIT | 200 | 5,0 % | 45,0 % | 38,3–51,9 |
| spike_check | UCI | 200 | 15,5 % | 38,5 % | 32,0–45,4 |
| window_stats | UCI | 200 | 18,0 % | 37,0 % | 30,6–43,9 |
| outdoor_weather | UCI | 200 | 21,5 % | 25,0 % | 19,5–31,4 |
| daily_profile | REFIT | 200 | 1,5 % | 14,5 % | 10,3–20,0 |
| daily_profile | UCI | 200 | 0,0 % | 5,0 % | 2,7–9,0 |
| **Agregado** | UCI | 2.356 | 61,2 % | 69,0 % | 67,1–70,9 |
| **Agregado** | REFIT | 800 | 7,8 % | 43,1 % | 39,7–46,6 |

Prueba exacta de McNemar entre v1 y este modelo: p < 10⁻³³ en preguntas UCI (el dato de REFIT queda truncado en la información disponible). No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Inferencia en float32: el repo ocupa 1,6 GB; el modelo completo en float32 requiere del orden de 0,75 GB de VRAM más overhead de activaciones.
- Inferencia en GGUF float16: 379 MB de pesos, apto para GPUs consumer de gama baja, iGPU y CPU.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para float16; el entrenamiento se validó en una RTX 5060 Laptop de 8 GB. Para float32, 4 GB o más.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU moderna (GTX 1650, RTX 3060, RTX 4060, etc.) y en CPU.
- Opciones de despliegue: Ollama (incluye `Modelfile`), llama.cpp vía GGUF, transformers con `AutoModelForCausalLM`, y text-generation-inference (el repo declara compatibilidad con endpoints).
- Latencia y throughput: no disponibles en la información proporcionada. El contexto de 448 tokens y la decodificación greedy del Modelfile limitan la generación a respuestas cortas.

## Comparativa con modelos similares

No se han publicado comparativas con modelos de la misma categoría en la información disponible. Como referencia estructural, el modelo se inspira en la arquitectura Qwen3 (cuyo tokenizer reutiliza de Qwen/Qwen3-8B), pero no comparte pesos ni escala con la familia Qwen3. Frente a SLM generalistas del rango de 100-200 M de parámetros, la diferencia clave es la especialización: mayor precisión en tareas de energía doméstica del dataset y ausencia total de capacidad conversacional general. No hay datos de benchmarks comparativos que permitan una tabla de rendimiento frente a alternativas.

## Limitaciones y advertencias

- Solo entiende preguntas con el fraseo del dataset; el chat libre produce texto roto porque no ha visto inglés general.
- Contexto muy corto (448 tokens) y entrenamiento sobre preguntas individuales; el Modelfile de Ollama envía solo el último mensaje.
- Rendimiento bajo en tareas complejas: daily_profile (5,0 % UCI, 14,5 % REFIT), outdoor_weather (25,0 % UCI) y room_compare (46,5 % UCI).
- Riesgo de alucinación limitado por el rechazo explícito de premisas falsas y preguntas no respondibles, pero no eliminado; validar salidas en producción.
- Sesgos: entrenado con datos de una vivienda belga y 20 viviendas del Reino Unido, por lo que los patrones de consumo no son representativos de otras regiones, climas o tarifas.
- Licencia CC-BY-4.0: permite uso comercial con atribución; revisar los términos de los datasets de origen (UCI Appliances Energy Prediction y REFIT) antes de redistribuir datos derivados.
- La discrepancia entre los 186,7 M de parámetros del safetensors y los 109,1 M de la model card debe tenerse en cuenta al planificar memoria y al citar el modelo.
- No soporta tool calling, agentes, visión ni audio; no debe presentarse como asistente general.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Design-Thinking-SLM/smart-home-energy-qwen3-scratch
- Dataset de entrenamiento: https://huggingface.co/datasets/Design-Thinking-SLM/smart-home-energy-slm
- Tokenizer base: https://huggingface.co/Qwen/Qwen3-8B
- Dataset UCI Appliances Energy Prediction: no disponible en la información proporcionada
- Dataset REFIT: no disponible en la información proporcionada
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
