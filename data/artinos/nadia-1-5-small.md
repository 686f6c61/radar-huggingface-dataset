# artinos/Nadia-1.5-Small

## Resumen

Nadia-1.5-Small es un modelo encoder especializado en la toma de decisiones estructuradas: dado un estado, una instruccion y una lista de opciones, devuelve una eleccion categorica, una probabilidad binaria (`noul`) y una puntuacion numerica esperada sobre una escala proporcionada. Lo desarrolla el autor independiente artinos y parte del encoder bidireccional Ettin-400M del Johns Hopkins University Center for Language and Speech Processing, sobre el que se ha realizado un ajuste fino supervisado. No es un modelo generativo: no produce texto libre, sino puntuaciones calibradas sobre opciones predefinidas.

El checkpoint empaquetado (V13, paso 1.082) contiene 395.310.593 parametros y una longitud maxima de entrada codificada de 7.999 tokens, incluyendo las opciones. Su interes practico esta en el enrutamiento y la clasificacion controlada: el modelo devuelve probabilidades calibradas (temperatura fija de 0,87055056) que permiten umbralizar decisiones en produccion, algo que un LLM generativo no ofrece de forma nativa. El modelo se distribuye con licencia MIT y soporta ingles y portugues (incluido portugues de Brasil).

La relevancia actual es limitada pero concreta: se posiciona como alternativa ligera y determinista a los LLM para tareas de decision acotadas (enrutamiento de tickets, clasificacion de intenciones, seleccion entre alternativas), con un rendimiento modesto pero medido en benchmarks publicos como BANKING77 y CLINC150. Su adopcion es practicamente nula (0 descargas, 0 likes en el momento de la consulta) y sus resultados estan por debajo de lo que cabria esperar de un clasificador especializado, lo que conviene tener en cuenta antes de evaluarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT bidireccional (encoder) con cabeza compartida de ranking |
| Parametros totales | 395.310.593 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 7.999 tokens de entrada codificada, incluyendo las opciones |
| Tipos de cuantizacion | no disponible (pesos en BF16/FP32; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | en, pt (incluye portugues de Brasil) |
| Licencia | MIT |
| Formato de pesos | safetensors (`passo-1082.safetensors`), con `config.json` y `tokenizer.json` |
| Modelo base | jhu-clsp/ettin-encoder-400m (revision 7662476d60abb071a5bd319c9f3074f3072c062d) |
| Tamano del repo | 1,6 GB |
| Salidas soportadas | eleccion categorica, probabilidad binaria (`noul`), puntuacion numerica esperada |
| Calibracion | temperatura fija de 0,87055056 |

## Arquitectura y entrenamiento

El modelo es un encoder ModernBERT bidireccional que lee el estado, la instruccion y la lista completa de opciones. Una cabeza compartida puntua cada opcion a partir de la representacion del primer token y del separador que sigue a esa opcion. Las salidas son tres: una eleccion categorica, una probabilidad binaria (`noul`) y una puntuacion numerica esperada sobre una escala proporcionada por el usuario. Esta diseno permite reutilizar la misma cabeza para cualquier conjunto de opciones sin reentrenar.

El entrenamiento partio del Ettin-400M original. La ejecucion completa de V13 uso 103.871 decisiones y 52.453.868 tokens de entrada a lo largo de 1.623 pasos de optimizador; el checkpoint seleccionado habia visto 69.248 decisiones y 35.033.159 tokens. En el conjunto completo, 7.680 decisiones binarias se sustituyeron por preguntas balanceadas de verificacion de opciones, derivando una opcion positiva y una negativa plausible de la misma eleccion original. Se uso BF16 y AdamW sobre una NVIDIA L40S, con agrupacion de registros antes del split para evitar fugas. Los datos proceden de MASSIVE, Open-Jev (componente reasoning-control-v1), CLINC150/OOS, SystemOne Lite General y escenarios operativos originales de artinos, convertidos al esquema de decision.

## Capacidades

- Puntuacion y seleccion entre opciones: dado un estado, una instruccion y una lista de opciones, devuelve la probabilidad de cada opcion en el orden proporcionado.
- Decision categorica: elige una opcion entre las suministradas.
- Decision binaria (`noul`): devuelve una probabilidad binaria para preguntas de verificacion.
- Puntuacion numerica esperada: estima un valor numerico sobre una escala definida por el usuario.
- Calibracion de probabilidades: aplica una temperatura fija que permite umbralizar decisiones en produccion.
- Multilingue limitado: ingles y portugues (incluido portugues de Brasil).
- No soporta generacion de texto libre, tool calling, function calling, agentes ni razonamiento multi-paso.
- No soporta vision ni audio.
- No dispone de modo "thinking" ni decodificacion especulativa (es un encoder, no un decoder).

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el texto del ticket y una lista de colas o categorias, y devuelve la probabilidad de cada una. Con 7.999 tokens de contexto puede incluir historial de conversacion y descripcion del producto. Es adecuado por su latencia baja (23,03 ms p50 en L40S) y su salida calibrada, aunque la precision medida en CLINC150+OOS (37,38%) obliga a validar en el dominio propio antes de confiar en el enrutamiento automatico.
- Clasificacion de intenciones en asistentes conversacionales: integrado en un pipeline previo a un LLM generativo, el modelo decide la intencion entre un conjunto cerrado y el LLM solo se invoca cuando la confianza supera un umbral. Encaja por su coste computacional bajo y su naturaleza determinista.
- Seleccion entre respuestas candidatas: dado un prompt y varias respuestas generadas por otro modelo, Nadia-1.5-Small puede puntuar cual es la mejor opcion. La cabeza de ranking compartida permite reutilizar el mismo modelo para distintos conjuntos de candidatos sin reentrenar.
- Verificacion de opciones en pipelines de QA: las preguntas balanceadas de verificacion de opciones del entrenamiento permiten usarlo para comprobar si una opcion plausible es correcta o no, con salida binaria calibrada.
- Moderacion y filtrado por categorias: clasificar contenido en un conjunto cerrado de etiquetas (por ejemplo, tipos de incidencia) con probabilidades umbralizables, aprovechando la calibracion para reducir falsos positivos.
- Puntuacion de alternativas en entornos con recursos limitados: al ser un encoder de 395M de parametros, puede ejecutarse en CPU en FP32 (el runner incluido lo hace por defecto) y en GPU con BF16, lo que permite desplegarlo en entornos sin acelerador dedicado.
- Evaluacion de decisiones en portugues de Brasil: el modelo reporta resultados en pares en portugues brasileno (10 de 96 correctos en T100), por lo que es util solo como componente auxiliar y con validacion humana en ese idioma.

## Benchmarks y rendimiento

| Medicion | Resultado |
|---|---:|
| Decision Index 0.3, pasada completa de texto publico, dos pasadas | 5,83/100 en ambas |
| BANKING77, precision por caso sobre 3.080 decisiones (T6) | 54,16% |
| CLINC150+OOS, precision por caso sobre 5.500 decisiones (T6) | 37,38% |
| Typed Decisions, acuerdo con la opcion top del profesor sobre 2.000 decisiones (T91) | 43,40% |
| T1 holdout interno, precision macro sobre 3.600 decisiones | 37,66% |
| DecisionBench, precision sobre 192 decisiones seleccionadas (T93) | 44,79% |
| S1-Arena, precision sobre 192 decisiones seleccionadas (T93) | 29,17% |
| Latencia en caliente en L40S, p50 / p95 promediados en tres sesiones | 23,03 / 42,67 ms |
| Throughput en caliente, batch de uno, NVIDIA L40S | 38,56 peticiones/s |

Cada pasada del Decision Index cubrio 140.178 peticiones; el modelo devolvio 140.169 respuestas y rechazo nueve entradas que excedian el limite de contexto en cada pasada. El Nadia-1 Small anterior obtuvo 3,61/100 en la misma edicion y 33,32% en T1. Con umbral de confianza de 0,90, el modelo acepto cero de 2.058 decisiones categoricas o binarias elegibles en el analisis T73 sobre predicciones T1 almacenadas, lo que indica una calibracion conservadora en ese umbral. En T100 acerto ambas variantes en 10 de 96 pares en portugues de Brasil. La precision de enrutamiento en trafico real no se ha medido.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,8 GB en BF16 (395M parametros) y aproximadamente 1,6 GB en FP32. El repo ocupa 1,6 GB.
- GPU recomendadas: NVIDIA L40S (referencia del autor), A100, H100; cualquier GPU con soporte BF16.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090, RTX 4060 Ti y similares con al menos 2 GB de VRAM; tambien en CPU en FP32, que es el modo por defecto del runner incluido.
- Opciones de despliegue: el paquete incluye `inferir.py` (runner), `modelo.py` (implementacion) y `contrato.py` (esquema de entrada y salida), con dependencias de PyTorch, Transformers, tokenizers, NumPy y safetensors. El entorno de investigacion uso PyTorch 2.11.0 y Transformers 5.18.0. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, coherente con que no hay pesos GGUF publicados.
- Latencia y throughput: 23,03 ms p50 y 42,67 ms p95 en L40S en caliente; 38,56 peticiones/s con batch de uno.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---:|---:|---|---|---|
| Nadia-1.5-Small | 395M | 7.999 tokens | Encoder de decision | MIT | Hugging Face (0 descargas) |
| jhu-clsp/ettin-encoder-400m | ~400M | no disponible | Encoder ModernBERT | no disponible | Hugging Face (modelo base) |
| Nadia-1 Small (version anterior) | no disponible | no disponible | Encoder de decision | no disponible | Hugging Face |
| Clasificador BERT-base fine-tuned | ~110M | 512 tokens | Encoder de clasificacion | variable | Amplia disponibilidad |

La comparativa con clasificadores BERT convencionales es la mas directa: Nadia-1.5-Small ofrece mayor contexto (7.999 frente a 512 tokens) y salida calibrada multi-opcion, pero su precision medida (37,38% en CLINC150+OOS, 54,16% en BANKING77) es inferior a la de clasificadores BERT especializados bien ajustados en esos mismos conjuntos, que suelen superar el 90% en BANKING77. No se dispone de datos publicados de Ettin-400M en estas tareas para una comparacion directa. No se conocen otros modelos de "decision estructurada" comparables en la informacion disponible.

## Limitaciones y advertencias

- Precision modesta: los resultados en benchmarks publicos (37,38% en CLINC150+OOS, 29,17% en S1-Arena) estan muy por debajo de clasificadores especializados; no es apto para decisiones de alto riesgo sin validacion en el dominio.
- Calibracion conservadora: con umbral 0,90 acepto cero de 2.058 decisiones elegibles, lo que puede provocar un exceso de rechazos en produccion.
- El ejemplo incluido en el repo (peticion de facturacion en portugues de Brasil con dos opciones) se resuelve de forma incorrecta tanto en BF16 sobre L40S (0,352 facturacion / 0,648 soporte tecnico) como en CPU FP32 (0,357 / 0,643).
- Rendimiento en portugues de Brasil muy bajo: 10 de 96 pares correctos en T100.
- No es un modelo generativo: no produce texto, no soporta tool calling ni agentes; su uso esta limitado a puntuar opciones suministradas.
- Limite de contexto de 7.999 tokens incluyendo las opciones; entradas mas largas se rechazan (nueve rechazos en cada pasada del Decision Index).
- El modelo no declara sesgos conocidos, pero al derivarse de Ettin-400M y de datasets como MASSIVE y CLINC150 hereda los sesgos de esas fuentes.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si de sobreconfianza en probabilidades mal calibradas fuera de la distribucion de entrenamiento.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantias; conviene revisar `THIRD_PARTY_NOTICES.md` por las atribuciones de los datasets de entrenamiento.
- Adopcion nula (0 descargas, 0 likes) y sin pipeline declarado en Hugging Face; no hay evidencia de uso en produccion.
- La precision de enrutamiento en trafico real no se ha medido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/artinos/Nadia-1.5-Small
- Modelo base Ettin-400M: https://huggingface.co/jhu-clsp/ettin-encoder-400m
- Revision del modelo base usada: https://huggingface.co/jhu-clsp/ettin-encoder-400m/tree/7662476d60abb071a5bd319c9f3074f3072c062d
- Paper BANKING77 (Casanueva et al.): https://aclanthology.org/2020.nlp4convai-1.5/
- Paper CLINC150+OOS (Larson et al.): https://aclanthology.org/D19-1131/
- Dataset MASSIVE: https://huggingface.co/datasets/AmazonScience/massive/tree/ff6bd8e4b27c3543e4f8fe2108f32bb95a6f8740
- Dataset Open-Jev (reasoning-control-v1): https://huggingface.co/datasets/ZefanCai/Open-Jev/tree/c67699e13d0ae25e35b77165a4b6b079bedc8aba
- Dataset CLINC150/OOS: https://huggingface.co/datasets/clinc/clinc_oos/tree/155b9c710419136e17307b80d0a13e68cd46b4ec
- Documento tecnico referenciado (Nadia-1.5-EN.pdf, pagina 4): `artigos/Nadia-1.5-EN.pdf#page=4` (ruta relativa dentro del repo, no se dispone de URL publica directa)
