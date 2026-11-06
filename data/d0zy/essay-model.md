# D0zy/essay-model

## Resumen

`D0zy/essay-model` es un ajuste fino mediante LoRA del modelo `LiquidAI/LFM3-1.7B` de Liquid AI, publicado por el usuario D0zy en Hugging Face. Su funcion es actuar como examinador de la tarea 2 del examen IELTS Writing: recibe la pregunta de la tarea y el ensayo del alumno, y devuelve una puntuacion global de banda seguida de comentarios detallados sobre Task Response, Coherence and Cohesion, Lexical Resource y Grammatical Range and Accuracy. El modelo base es un transformer de 1.700 millones de parametros con licencia LFM Open License v1.0.

El modelo resuelve un problema acotado pero relevante en el ambito educativo: la evaluacion formativa automatica de ensayos IELTS con retroalimentacion estructurada por criterios. Se entrena sobre el dataset comunitario `chillies/IELTS-writing-task-2-evaluation` (aproximadamente 7.000 ejemplos), con la funcion de perdida calculada unicamente sobre la parte de evaluacion de la respuesta, lo que concentra el aprendizaje en la generacion del feedback y no en la reproduccion del enunciado.

Es relevante ahora porque demuestra un patron habitual en el ecosistema open source: adaptar un modelo pequeno y eficiente a una tarea vertical muy concreta mediante LoRA, con un coste de entrenamiento bajo y un artefacto final ligero (0,1 GB en el repositorio). No obstante, el modelo tiene cero descargas y cero likes en el momento de la consulta, y su validacion se limita a la perdida de validacion reportada por el autor (~0,418), sin benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base LiquidAI/LFM3-1.7B) con adaptador LoRA |
| Parametros totales | 1.700 millones (modelo base); el adaptador LoRA anade un subconjunto no especificado |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (entrenamiento con maximo de 2048 tokens) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el modelo base admite las cuantizaciones que soporte LFM3-1.7B) |
| Idiomas soportados | ingles (en) |
| Licencia | LFM Open License v1.0 (lfm1.0); uso comercial permitido solo por entidades por debajo de 10 millones de USD de ingresos anuales |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base en safetensors |
| Libreria | peft |
| Tamano del repositorio | 0,1 GB |
| Dataset de entrenamiento | chillies/IELTS-writing-task-2-evaluation (~7.000 ejemplos) |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre `LiquidAI/LFM3-1.7B`, un transformer denso de 1.700 millones de parametros desarrollado por Liquid AI. El adaptador se aplica con rango r=16, alpha=32, dropout de 0,05 y sobre todas las capas lineales. El entrenamiento consistio en una sola epoca con tasa de aprendizaje 2e-4, programacion coseno y tamano de lote efectivo de 8. Los ejemplos se truncan a un maximo de 2048 tokens y la perdida se calcula exclusivamente sobre la parte de evaluacion de la respuesta, una decision de diseno coherente con el objetivo de que el modelo aprenda a generar el feedback y no a repetir el enunciado o el ensayo.

No se reporta el numero total de tokens de entrenamiento ni la composicion detallada del dataset mas alla de su origen comunitario. Tampoco se documenta el uso de RLHF, DPO u otras tecnicas de alineacion posteriores al ajuste supervisado. La perdida de validacion final reportada por el autor es de aproximadamente 0,418, pero no se aportan metricas de calidad de la evaluacion (correlacion con puntuaciones humanas, acuerdo por bandas, etc.). No se mencionan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal en el adaptador.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a la evaluacion de ensayos.
- Evaluacion de la tarea 2 del IELTS Writing: emite una puntuacion global de banda y comentarios por los cuatro criterios oficiales (Task Response, Coherence and Cohesion, Lexical Resource, Grammatical Range and Accuracy).
- Formato de salida estructurado segun el prompt de sistema definido por el autor.
- Soporte de plantilla de chat (`apply_chat_template`) con roles system y user.
- Generacion determinista recomendada por el autor (`do_sample=False` con `repetition_penalty=1.05`).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- Capacidad multilingue limitada al ingles; no se reporta soporte de otros idiomas.

## Casos de uso

- Correccion formativa de ensayos IELTS: un estudiante envia la pregunta de la tarea y su ensayo, y el modelo devuelve una banda estimada y comentarios por criterio. Es adecuado por su entrenamiento especifico en el dataset de evaluacion y por el formato de salida estructurado.
- Plataformas de preparacion de examenes: integracion en un backend que procese entregas de alumnos y genere retroalimentacion preliminar antes de la revision humana, con el modelo base de 1.7B ejecutable en hardware modesto.
- Generacion de rúbricas de feedback: el modelo produce desgloses por los cuatro criterios oficiales, utiles para que el profesorado compare su propia evaluacion con la del sistema.
- Prototipado rapido de asistentes educativos: al ser un adaptador LoRA ligero (0,1 GB), se puede cargar sobre el modelo base con `peft` y desplegar en entornos de experimentacion con pocos recursos.
- Investigacion sobre evaluacion automatica de textos: sirve como linea base reproducible para comparar con otros enfoques de scoring de ensayos, dado que el dataset y la configuracion de entrenamiento estan documentados.
- Autoevaluacion en linea de bajo coste: el modelo puede ejecutarse en una unica GPU consumer para dar feedback inmediato a estudiantes, siempre con la advertencia de que las puntuaciones son estimaciones y no resultados oficiales.
- Filtrado y triaje de ensayos: en un flujo con muchos envios, el modelo puede priorizar los que requieren revision humana por su baja banda estimada o por feedback inconsistente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento reportado por el autor es la perdida de validacion final de aproximadamente 0,418, que no es directamente comparable con metricas estandar como MMLU, HumanEval o GSM8K ni con la correlacion respecto a evaluadores humanos.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 1.7B en bfloat16 requiere aproximadamente 3,4 GB solo para los pesos, mas memoria para el contexto y las activaciones; en cuantizacion de 8 bits puede rondar los 2 GB y en 4 bits alrededor de 1,2 GB (estimaciones orientativas, no publicadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para bfloat16; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes.
- Cabe en GPU consumer: si, en la mayoria de tarjetas con 8 GB o mas de VRAM, y potencialmente en configuraciones de 4-6 GB con cuantizacion.
- Opciones de despliegue: `transformers` con `peft` (metodo documentado por el autor); el modelo base LFM3-1.7B puede servirse con vLLM, TGI o llama.cpp si se exporta a los formatos correspondientes, aunque el adaptador LoRA requiere fusion o carga compatible con PEFT.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| D0zy/essay-model | 1.7B (base) + LoRA | no disponible | Evaluacion IELTS Writing Task 2 | LFM Open License v1.0 (uso comercial limitado a <10M USD) | Hugging Face, 0 descargas |
| LiquidAI/LFM3-1.7B | 1.7B | no disponible | Modelo base generalista | LFM Open License v1.0 | Hugging Face |
| chillies/IELTS-writing-task-2-evaluation | no aplica (dataset) | no aplica | Dataset de evaluacion IELTS | no disponible | Hugging Face Datasets |

No se dispone de informacion sobre otros modelos comparables de evaluacion automatica de IELTS en la informacion proporcionada; la comparativa se limita al modelo base y al dataset de entrenamiento.

## Limitaciones y advertencias

- Las puntuaciones son estimaciones aprendidas de un dataset comunitario, no resultados oficiales del IELTS; el autor indica explicitamente que deben usarse solo para practica y feedback.
- No se han publicado metricas de calidad (correlacion con evaluadores humanos, acuerdo por bandas), por lo que la fiabilidad de las puntuaciones no esta cuantificada.
- Riesgo de alucinacion: el modelo puede generar comentarios plausibles pero incorrectos sobre el ensayo o asignar bandas inconsistentes, especialmente con ensayos fuera de la distribucion del dataset de entrenamiento.
- Sesgos conocidos: no documentados; al entrenarse sobre un dataset comunitario, puede heredar sesgos de los evaluadores originales y del modelo base.
- Limitacion de idioma: solo se ha entrenado y evaluado en ingles; no se garantiza un comportamiento correcto con ensayos en otros idiomas.
- Limitacion de contexto: el entrenamiento trunca a 2048 tokens, por lo que ensayos y preguntas que superen esa longitud pueden degradar la calidad de la evaluacion.
- Restricciones de licencia: la LFM Open License v1.0 solo permite uso comercial a entidades con ingresos anuales inferiores a 10 millones de USD; el modelo es una obra derivada de LFM3-1.7B y conserva las atribuciones de la obra original.
- El proyecto no esta afiliado ni respaldado por Liquid AI; "LFM" y "Liquid AI" son marcas registradas de Liquid AI.
- El repositorio no tiene descargas ni likes, lo que sugiere una validacion externa nula; conviene evaluarlo en un conjunto propio antes de usarlo en produccion.
- El adaptador requiere cargar el modelo base por separado, lo que anade complejidad de despliegue frente a un modelo ya fusionado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/D0zy/essay-model
- Modelo base LiquidAI/LFM3-1.7B: https://huggingface.co/LiquidAI/LFM3-1.7B
- Dataset de entrenamiento: https://huggingface.co/datasets/chillies/IELTS-writing-task-2-evaluation
- Licencia LFM Open License v1.0 (referencia en el modelo base): https://huggingface.co/LiquidAI/LFM3-1.7B
- Libreria PEFT: https://huggingface.co/docs/peft
