# ktcapraz/t5gemma2-decision-270m-v2

## Resumen

T5Gemma2 Decision 270M v2 es un modelo de decisión de pequeno tamano construido sobre una arquitectura encoder-decoder T5Gemma 2, desarrollado por el usuario ktcapraz. No es un modelo generativo al uso: lee un texto y responde a preguntas tipadas con probabilidades, en tres modalidades concretas (`choice` para elegir una opcion de un conjunto, `noul` para la probabilidad de "si" y `score` para una posicion en niveles ordenados), ademas de senalar los fragmentos del texto (evidence spans) que justifican cada respuesta. El problema que aborda es el de los llamados "system one" o decisiones rapidas y estructuradas, un nicho distinto del de los LLM conversacionales.

El modelo parte de `google/t5gemma-2-270m-270m` y se ha afinado para seguir el formato de peticion de la API System One de TypeSafe (sin afiliacion con TypeSafe). Su interes actual radica en que la mayoria de modelos de decision abiertos usan bases encoder-only o decoder-only, mientras que este explora una base encoder-decoder de 18 capas de encoder y 18 de decoder con hidden size 640. Con 786 millones de parametros reales en safetensors y un repo de 2,4 GB, es un modelo pensado para inferencia en CPU o GPU modestas.

Los resultados publicados por el autor son mixtos: alcanza 51,8 de mean skill en S1MB (puesto 19 de 100 modelos publicados en el momento de la evaluacion), supera a bekko-system-one-v0-400m en tareas en las que fue entrenado (61,7 frente a 59,1), pero es claramente debil en tareas nunca vistas (27,1 frente a 39,8). Es, por tanto, un modelo de investigacion con limitaciones explicitas y sin despliegue directo con `AutoModel`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (T5Gemma 2), 18 capas de encoder y 18 de decoder, hidden size 640 |
| Parametros totales | 786.029.296 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como contexto generativo; `max_state_tokens` configurable a 8192 en el ejemplo del autor |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | Gemma (terminos de Google: https://ai.google.dev/gemma/terms) |
| Formato de pesos | safetensors (libreria pytorch) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `google/t5gemma-2-270m-270m`, un encoder-decoder de 18+18 capas con hidden size 640. La tabla de palabras y la LM head atada permanecen congeladas durante el entrenamiento. El encoder recibe una "fila" compuesta por el estado (el texto a analizar), seguido de cada pregunta y de sus opciones; las opciones comparten posiciones de inicio y se enmascaran entre si, de modo que el orden de las opciones no puede alterar la respuesta. La readout rapida (`fast`) en el token `Answer:` combina la puntuacion de la LM head sobre las palabras de la opcion ("voice"), una puntuacion bilineal con el vector de opcion agrupado y un sesgo por opcion. La readout final (`final`) ejecuta una rama de decoder por opcion que termina en `True?`, y su puntuacion es la diferencia Yes menos No de la LM head congelada, mas un helper limitado a +-3. El resaltado (highlight) calcula una puntuacion por token sobre el estado para cada pregunta y los tokens principales se introducen en el decoder como cita. La calibracion aplica una temperatura por tipo de pregunta y por readout, ajustada sobre conjuntos de desarrollo.

El entrenamiento uso varios datasets publicos: `hotchpotch/bekko-system-one-dataset-v0`, `avbiswas/bev-decision`, `LocalLLaMA/typed-decisions`, `n4ze3m/typed-decisions-synth`, `Praveenrajus/jev-bench` y `tasksource/tasksource-jev-typed-decisions`. El autor indica que las filas de entrenamiento se filtraron contra el split de test de S1MB. El run de entrenamiento incluia tambien una fila de verificador y un bucle de "pensar mas", pero ambos tuvieron efecto nulo y no se incluyen en esta release. Un hallazgo relevante del analisis post-entrenamiento: el encoder produce practicamente toda la respuesta (51,4 en S1MB con estado de decoder constante frente a 51,8 del camino completo), y el decoder no lee el texto (ocultarselo no cambia ninguna respuesta).

## Capacidades

- Clasificacion de texto con preguntas tipadas: `choice` (una opcion de un conjunto con probabilidades), `noul` (probabilidad de si) y `score` (posicion en niveles ordenados con distribucion de probabilidad).
- Respuesta a multiples preguntas sobre un mismo texto en una sola pasada, con opciones independientes del orden.
- Extraccion de evidencia: devuelve `evidence` como spans con probabilidades en offsets de caracteres, ademas de `quote`.
- Senal `nei` ("not in the text") para indicar que la respuesta no esta en el texto; el autor advierte que es poco fiable en textos claros.
- Soporte de instrucciones por pregunta y criterios por opcion (descripciones de cada categoria o niveles).
- Multilingue: solo ingles.
- No soporta tool calling, function calling, agentes multi-step, vision, audio ni modo thinking.
- No carga con `AutoModel`; requiere el codigo propio del repo en `decisions/`.

## Casos de uso

- Triaje de tickets de soporte: el modelo puede clasificar un mensaje de cliente con preguntas tipadas como "es sobre facturacion" (`noul`), "tono del mensaje" (`choice`: angry/calm) y "urgencia" (`score` de 0 a 2), devolviendo probabilidades calibradas que permiten enrutar por umbral. Es adecuado por su bajo coste en CPU (unos 0,9 s por pregunta en un texto de 900 tokens).
- Moderacion de contenido con evidencia: usar `choice` para categorias de toxicidad y recuperar `evidence` y `quote` para auditar por que se tomo la decision, algo util en flujos donde se exige trazabilidad.
- Extraccion de campos estructurados de textos cortos: preguntas `noul` del tipo "menciona una fecha de cancelacion" sobre correos o formularios, con la ventaja de que el modelo devuelve probabilidad y no una cadena generada sujeta a alucinacion.
- Enrutamiento de intenciones en asistentes: clasificar la intencion de una consulta con `choice` entre un conjunto cerrado de acciones, sirviendo como primera etapa barata antes de invocar un LLM mayor.
- Analisis de sentimiento y severidad en resenas: combinar `choice` (positivo/negativo) con `score` (gravedad) sobre resenas de producto, aprovechando la calibracion por tipo de pregunta.
- Anotacion asistida de datasets: generar etiquetas tipadas con probabilidades y spans de evidencia para preetiquetar corpus y priorizar la revision humana por confianza.
- Clasificacion por lotes en entornos sin GPU: al ser un modelo de 786 M de parametros con inferencia en CPU de aproximadamente 0,9 s por pregunta, encaja en pipelines de proceso por lotes donde no hay acelerador disponible.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre S1MB (System One Mosaic Benchmark, ingles v1, 137 tests). La puntuacion es 100 x la media de skill sobre los 137 tests.

| Modelo | Todos (137) | Tareas entrenadas (98) | Tareas nunca vistas (39) | choice (57) | noul (59) | score (21) |
|---|---|---|---|---|---|---|
| v2, readout rapida | 51,8 | 61,7 | 27,1 | 55,9 | 50,6 | 44,2 |
| v2, readout final | 51,7 | no disponible | 26,7 | 55,8 | 50,2 | 44,4 |
| bekko-system-one-v0-400m | 53,6 | 59,1 | 39,8 | 61,3 | 51,2 | 39,2 |
| Jev 1.13 | 63,0 | 64,3 | 59,6 | 67,2 | 64,6 | 46,9 |

Otros datos aportados por el autor: exactitud de 0,737 sobre 10.788 preguntas de desarrollo (readout final) y 72,1 sobre un conjunto propio de 147 preguntas de uso real. En el momento de la evaluacion (2026-10-08) ocupaba el puesto 19 de 100 modelos publicados en S1MB.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Con 786 M de parametros, en fp32 los pesos ocupan aproximadamente 3,1 GB y en fp16 unos 1,6 GB; a ello hay que sumar el estado de inferencia y el codigo de `decisions/`.
- GPU recomendadas: no especificadas por el autor; por tamano, cualquier GPU consumer con 4-8 GB de VRAM deberia ser suficiente en fp16, aunque no hay validacion publicada.
- Cabe en GPU consumer: si, previsiblemente en RTX 3060, RTX 4060, RTX 4090 y similares, aunque el autor no publica requisitos oficiales.
- Despliegue: no es compatible con vLLM, TGI, llama.cpp ni Ollama de forma directa; requiere el codigo propio del repo (`pip install -r requirements.txt`, `python run_example.py`) y no carga con `AutoModel`.
- Latencia y throughput: en CPU de servidor, aproximadamente 0,9 s para 1 pregunta sobre un texto de 900 tokens; con 3 preguntas sobre 900 tokens, el layout `shared` tarda unos 1,3 s y el layout `isolated` unos 3,5 s. El ejemplo de ejecucion en CPU con 4 hilos tarda aproximadamente 0,9 s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | S1MB (todos) | S1MB (nunca vistas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| t5gemma2-decision-270m-v2 | 786 M | no disponible (max_state_tokens configurable) | 51,8 | 27,1 | Gemma | HuggingFace, requiere codigo propio |
| bekko-system-one-v0-400m | no disponible | no disponible | 53,6 | 39,8 | no disponible | no disponible |
| Jev 1.13 | no disponible | no disponible | 63,0 | 59,6 | no disponible | no disponible |

La comparativa se limita a los modelos citados en la model card; no se dispone de datos de parametros, contexto ni licencia de las alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Rendimiento debil en tareas nunca vistas: 27,1 frente a 39,8 de bekko-system-one-v0-400m en las 39 tareas no entrenadas de S1MB. No generaliza bien fuera de su distribucion de entrenamiento.
- El decoder no lee el texto: ocultar el texto al decoder no cambia ninguna respuesta, y el encoder concentra practicamente toda la senal (51,4 frente a 51,8). Esto limita la utilidad de la rama de decoder y sugiere que el modelo es esencialmente un clasificador encoder.
- La senal `nei` ("not in the text") es poco fiable en textos claros, segun el propio autor.
- Solo admite ingles; no hay soporte multilingue.
- No es un modelo generativo: no produce texto libre, solo decisiones tipadas con probabilidades y spans de evidencia.
- No carga con `AutoModel`; requiere el codigo de `decisions/` y el formato de peticion especifico, lo que complica su integracion en stacks estandar.
- Licencia Gemma: el uso comercial esta sujeto a los terminos de Google (https://ai.google.dev/gemma/terms), que imponen restricciones y obligaciones de atribucion.
- Riesgo de alucinacion: aunque el modelo no genera texto libre, las probabilidades y los spans de evidencia pueden ser incorrectos; el autor no publica metricas de calibracion mas alla de la temperatura ajustada.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion disponible.
- Los benchmarks son declarados por el autor y no estan verificados (`verified: false` en la model-index).
- El ejemplo de salida muestra una confianza baja en la clasificacion de tono (0,138584) con probabilidades proximas (0,569 frente a 0,431), lo que indica casos de ambiguedad que requieren umbrales cuidadosos en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ktcapraz/t5gemma2-decision-270m-v2
- Modelo base: https://huggingface.co/google/t5gemma-2-270m-270m
- Licencia Gemma: https://ai.google.dev/gemma/terms
- Dataset principal de entrenamiento: https://huggingface.co/datasets/hotchpotch/bekko-system-one-dataset-v0
- Dataset S1MB: https://huggingface.co/datasets/hotchpotch/s1mb-dataset
- Dataset bev-decision: https://huggingface.co/datasets/avbiswas/bev-decision
- Dataset typed-decisions: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Dataset typed-decisions-synth: https://huggingface.co/datasets/n4ze3m/typed-decisions-synth
- Dataset jev-bench: https://huggingface.co/datasets/Praveenrajus/jev-bench
- Dataset tasksource-jev-typed-decisions: https://huggingface.co/datasets/tasksource/tasksource-jev-typed-decisions
