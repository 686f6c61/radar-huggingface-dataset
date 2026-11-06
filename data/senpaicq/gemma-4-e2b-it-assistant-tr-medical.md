# senpaicq/gemma-4-E2B-it-assistant-tr-medical

## Resumen

`senpaicq/gemma-4-E2B-it-assistant-tr-medical` es un modelo auxiliar de decodificación especulativa (draft model) afinado por el usuario senpaicq a partir de `google/gemma-4-E2B-it-assistant`, el borrador MTP que acompaña a Gemma 4 E2B. No es un modelo de lenguaje autónomo: su función es proponer tokens candidatos que el modelo objetivo `google/gemma-4-E2B-it` verifica, acelerando la generación sin alterar la salida final. El ajuste se centra en texto médico en turco, donde el borrador original rinde por debajo de lo esperado.

El problema que resuelve es concreto: el cabezal de embeddings ordenado del borrador original solo puntúa alrededor del 1,6 % del vocabulario (los tokens de los 32 clústeres mejor clasificados de entre 2048), y en turco el token correcto cae dentro de esos clústeres solo el 83 % de las veces, frente al 92-94 % en inglés. El fine-tuning del selector de clústeres y del `lm_head` eleva esa cobertura al 95-96 %, lo que se traduce en una aceleración de aproximadamente 1,7x en texto médico turco con K=4, frente al 1,15-1,17x del borrador original.

El modelo tiene 77.993.476 parámetros (unos 78 M) y un repositorio de 0,2 GB en safetensors. Se distribuye con licencia Apache 2.0 y soporta turco e inglés. Es relevante para equipos que despliegan Gemma 4 E2B en entornos sanitarios de habla turca y necesitan reducir la latencia de inferencia sin sacrificar fidelidad en la salida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo auxiliar de decodificación especulativa (MTP drafter) con cross-attention sobre la KV cache compartida del modelo objetivo; cabezal de embeddings ordenado con 2048 clústeres y selección top-32 |
| Parametros totales | 77.993.476 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo objetivo `google/gemma-4-E2B-it`) |
| Tipos de cuantizacion | no disponible (entrenado y evaluado en bf16; fp32 para la comprobación de lossless) |
| Idiomas soportados | tr, en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un drafter de predicción multi-token (MTP) que se acopla al modelo objetivo Gemma 4 E2B mediante decodificación especulativa. En cada paso, el drafter propone K tokens candidatos que el modelo objetivo verifica en un único forward pass; los tokens aceptados se conservan y el resto se descarta. La innovación clave del borrador de Gemma 4 es su cabezal de embeddings ordenado: en lugar de puntuar el vocabulario completo de 262k tokens, selecciona primero los 32 clústeres más probables de entre 2048 y solo puntúa los tokens contenidos en ellos (aproximadamente el 1,6 % del vocabulario). Durante el entrenamiento, el objetivo permanece congelado y el drafter hace cross-attention sobre su KV cache compartida, exactamente igual que en inferencia.

El fine-tuning emplea unas 16.500 parejas pregunta-respuesta: 10.000 de medicina turca, 4.500 de turco general, 1.000 de medicina en inglés y 1.000 de inglés general. Las respuestas son generaciones greedy del propio `gemma-4-E2B-it` (autodestilación, máximo 512 tokens), de modo que el drafter aprende la distribución del objetivo. Las preguntas turcas de pacientes provienen de los datasets `kayrab/patient-doctor-qa-tr-*`, usando solo las preguntas y eliminando cadenas similares a datos personales; las respuestas originales de los médicos no se utilizaron. La función de pérdida combina una KL forward desde el drafter hacia la distribución completa del objetivo, desplegada sobre 3 pasos de borrador con teacher forcing, más un término KL sobre el selector de clústeres (probabilidades del objetivo sumadas por clúster, peso 0,5). Se entrenó con AdamW, lr 5e-5, 2 épocas (1090 pasos), schedule cosine y autocast bf16 en una A100-80GB.

## Capacidades

- Predicción multi-token especulativa: propone hasta K tokens por paso (K=4 recomendado) para que el modelo objetivo los verifique.
- Aceleración de inferencia sin pérdida de fidelidad: en fp32 con TF32 desactivado, la salida es idéntica token a token a la del objetivo sin drafter en el 100 % de los casos.
- Especialización en texto médico en turco: cobertura de clústeres del 95,4-95,5 % frente al 82,9 % del borrador original.
- Mantenimiento del rendimiento en otros dominios: turco general, inglés médico e inglés general no empeoran (diferencias de τ̂ dentro del intervalo de confianza o ligeramente positivas).
- Soporte bilingüe turco-inglés.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso por sí mismo: esas capacidades dependen del modelo objetivo.
- No es un modelo médico: no genera contenido clínico de forma autónoma ni sustituye al objetivo.

## Casos de uso

- Asistentes clínicos en turco: desplegar `gemma-4-E2B-it` con este drafter para responder preguntas de pacientes (por ejemplo, pautas de alimentación en diabetes tipo 2) con una latencia aproximadamente 1,7x menor, manteniendo exactamente el mismo texto de salida que sin drafter.
- Chatbots de triaje sanitario: gestionar conversaciones multi-turno en turco con tiempos de respuesta reducidos, útil en entornos donde el objetivo se ejecuta en una sola GPU y el throughput importa.
- Documentación médica asistida: generar resúmenes o borradores de informes en turco a partir de notas, acelerando la generación sin riesgo de alterar el contenido verificado por el objetivo.
- Sistemas de respuesta a preguntas sobre salud: integrar el par objetivo-drafter en pipelines de RAG donde el contexto se inyecta en el prompt; el drafter acelera la fase de generación sin tocar la recuperación.
- Evaluación y benchmarking de decodificación especulativa: usar este modelo como referencia de drafter especializado por dominio para medir τ, tasa de aceptación y speedup en turco frente al borrador genérico.
- Servicio bilingüe turco-inglés en entornos sanitarios: atender consultas en ambos idiomas con un único par de modelos, ya que el fine-tuning mixto evita regresiones en inglés médico (1,65x con K=4 frente a 1,46x del original).
- Investigación en destilación de drafters: replicar la metodología (KL forward, entrenamiento del selector de clústeres y del `lm_head`) para otros dominios o idiomas de bajos recursos.

## Benchmarks y rendimiento

Aceleración medida con `generate` de HF, decodificación greedy, batch size 1, 128 tokens nuevos, en A100-80GB con bf16. τ es el número de tokens aceptados por forward pass del objetivo; los corchetes indican intervalos de confianza bootstrap del 95 % sobre los prompts.

| Conjunto de prueba (prompts) | Drafter original, K=4 | Este drafter, K=4 | Original, K=2 | Este drafter, K=2 |
|---|---|---|---|---|
| Médico turco, totalmente held-out (20) | 1,15x (τ 1,73) | 1,66x [1,58; 1,76] (τ 2,54) | 1,24x | 1,64x |
| Médico turco (48) | 1,17x (τ 1,78) | 1,73x [1,68; 1,79] (τ 2,65) | 1,26x | 1,66x |
| Turco general (32) | 1,24x | 1,44x | 1,31x | 1,47x |
| Médico inglés (24) | 1,46x | 1,65x | 1,46x | 1,58x |
| Inglés general (24) | 1,49x | 1,48x | 1,48x | 1,49x |

Aceptación con teacher forcing sobre respuestas held-out (τ̂ con K=4, media de 3 semillas, desviación típica entre semillas de aproximadamente 0,001):

| Conjunto de prueba | Original | Este drafter | Diferencia [IC 95 %] |
|---|---|---|---|
| Médico turco, held-out | 1,905 | 2,544 | +0,64 [+0,54; +0,74] |
| Turco general, held-out | 2,049 | 2,243 | +0,20 [+0,16; +0,22] |
| Médico inglés, held-out | 2,199 | 2,344 | +0,15 [+0,10; +0,20] |
| Inglés general, held-out | 2,423 | 2,424 | +0,00 [−0,02; +0,02] |

Desglose por variante de entrenamiento (3 semillas cada una, médico turco held-out, τ̂ con K=4):

| Variante | τ̂ (K=4) | Cobertura de clústeres |
|---|---|---|
| Original | 1,905 | 82,9 % |
| Fine-tune del cuerpo del drafter, KL al objetivo | 2,232 | 85,3 % |
| + entrenar selector de clústeres | 2,470 | 95,5 % |
| + entrenar lm_head (este modelo) | 2,544 | 95,4 % |

## Requisitos de hardware

- VRAM estimada para inferencia: el drafter tiene unos 78 M de parámetros; en bf16 ocupa aproximadamente 0,16 GB de pesos, más la KV cache compartida con el objetivo y las activaciones. El consumo dominante es el del modelo objetivo `google/gemma-4-E2B-it`.
- GPU recomendadas: el autor validó el entrenamiento y las mediciones en una A100-80GB. Para inferencia, cualquier GPU con memoria suficiente para el objetivo más el drafter.
- GPU de consumo: no se han publicado mediciones en GPU de consumo; el drafter por sí solo es pequeño, pero el requisito real lo marca el objetivo.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` y `generation_config.num_assistant_tokens = 4`, `num_assistant_tokens_schedule = "constant"`. No se han publicado instrucciones para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: speedup de 1,66-1,73x en médico turco con K=4 (batch 1, 128 tokens nuevos, A100-80GB, bf16); 1,44x en turco general; 1,65x en médico inglés; 1,48x en inglés general.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en médico turco (K=4) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`gemma-4-E2B-it-assistant-tr-medical`) | 78 M | no disponible | 1,66-1,73x, τ̂ 2,544 | Apache 2.0 | Hugging Face |
| `google/gemma-4-E2B-it-assistant` (original) | no disponible | no disponible | 1,15-1,17x, τ̂ 1,905 | no disponible en la información | Hugging Face |
| `google/gemma-4-E2B-it` (objetivo, sin drafter) | no disponible | no disponible | 1,00x (referencia) | no disponible en la información | Hugging Face |

No se dispone de datos sobre otros drafters especializados por dominio comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo médico: no genera contenido clínico autónomo ni debe usarse como tal; es un acelerador de inferencia para el objetivo.
- Solo funciona acoplado a `google/gemma-4-E2B-it`; no es utilizable como modelo de lenguaje independiente.
- En bf16, una fracción de las salidas diverge tras unas decenas de tokens respecto a la ejecución sin drafter; el autor atribuye esa divergencia a ruido numérico de bf16 (ocurre con la misma tasa y posiciones con el drafter original). En fp32 con TF32 desactivado la salida es idéntica en el 100 % de los casos.
- El rendimiento está medido con decodificación greedy, batch size 1 y 128 tokens nuevos; no se han publicado datos para sampling, batches mayores ni otras longitudes.
- Los conjuntos "held-out" totalmente held-out son pequeños (20 prompts), lo que limita la precisión de las estimaciones.
- El fine-tuning mixto evita regresiones, pero entrenar solo con datos médicos turcos empeoraba ligeramente el inglés médico.
- Cobertura de idiomas limitada a turco e inglés; no se ha evaluado en otras lenguas.
- Riesgo de sesgo y alucinación: heredado del modelo objetivo, no del drafter, que no altera el contenido verificado.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base `google/gemma-4-E2B-it-assistant` puede tener condiciones propias que deben verificarse.
- No se han publicado resultados en tool calling, agentes ni razonamiento multi-paso para este drafter.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/senpaicq/gemma-4-E2B-it-assistant-tr-medical
- Modelo base (drafter original): https://huggingface.co/google/gemma-4-E2B-it-assistant
- Modelo objetivo: https://huggingface.co/google/gemma-4-E2B-it
- Dataset de preguntas de pacientes en turco: `kayrab/patient-doctor-qa-tr-*` (referenciado en la model card; no se proporciona URL directa)
