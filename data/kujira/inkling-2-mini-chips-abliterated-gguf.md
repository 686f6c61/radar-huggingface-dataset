# Kujira/Inkling-2-Mini-CHiPS-Abliterated-GGUF

## Resumen

Inkling 2 Mini CHiPS-Abliterated es una variante modificada de los pesos GGUF publicados por Unsloth para el modelo Inkling-2-Mini, un transformer de tipo mezcla de expertos (MoE) con 26.070.390.272 parametros totales. El autor de la modificacion, Kujira, aplica una tecnica denominada CHiPS (Causal Head-isolated Projection Steering) sobre la salida de atencion de una unica capa (la capa 11) para reducir el comportamiento de rechazo del modelo original. El resultado es un modelo "abliterated" o "decensored" que practicamente elimina las negativas a responder, manteniendo el resto de los tensores byte a byte identicos al original.

La relevancia de esta ficha es doble: por un lado documenta una tecnica de edicion de pesos sin entrenamiento (steering causal) aplicada a un modelo MoE con bloques recurrentes (loop), y por otro advierte de las consecuencias practicas de este tipo de modificaciones: respuestas mucho mas largas, mayor consumo de tokens y una evaluacion muy limitada (solo una de las cinco cuantizaciones ha sido medida). El modelo base es de Thinking Machines Lab (segun la propia model card), distribuido bajo licencia Apache 2.0 y en formato GGUF para llama.cpp.

Se trata de una version "preview" (v6 del recetario) publicada en noviembre de 2026, con 5.630 descargas y 12 likes en el momento de la consulta. No es un lanzamiento oficial de Thinking Machines ni de Unsloth, y ambos organismos no lo respaldan.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con bloque recurrente (loop) en capas 6 a 17, que se ejecuta tres veces por token |
| Parametros totales | 26.070.390.272 (26,07 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la evaluacion se hizo con limite de 4.096 tokens de generacion) |
| Tipos de cuantizacion | UD-IQ2_XXS, UD-Q2_K_XL, UD-Q3_K_XL, UD-Q4_K_XL, UD-Q8_K_XL (imatrix) |
| Idiomas soportados | no disponible oficialmente; la evaluacion de rechazos cubrio ingles, japones y chino |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp), 744 tensores por fichero |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con un diseno poco habitual: un bloque de capas recurrentes (de la 6 a la 17) que se ejecuta tres veces por token, lo que aumenta la profundidad efectiva sin incrementar el numero de parametros. El modelo completo contiene 744 tensores, incluyendo el router y todos los expertos. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo original; la model card de esta variante no los detalla.

La innovacion tecnica de esta ficha no esta en el entrenamiento sino en la edicion post-hoc. CHiPS (Causal Head-isolated Projection Steering) identifica componentes del modelo por su efecto causal sobre un comportamiento concreto y reduce la parte de su salida que se proyecta sobre una direccion determinada, sin reentrenar. En este caso se reescribe un unico tensor (la salida de atencion de la capa 11), manteniendo el tipo original y requantizando; el resto de tensores, incluidos router y expertos, quedan byte a byte identicos. La receta exacta no se publica. El modelo requiere llama.cpp mainline b12611 o posterior.

## Capacidades

- Generacion de texto conversacional en formato chat, con soporte de modo "thinking" (razonamiento previo a la respuesta).
- Razonamiento multi-paso y cadenas de pensamiento extensas (las respuestas del modelo modificado son aproximadamente 3,5 veces mas largas que las del original).
- Generacion de codigo: evaluado en HumanEval+ con un 86,6% (142 de 164) en la cuantizacion UD-IQ2_XXS.
- Capacidad multilingue parcial: la evaluacion de rechazos incluye peticiones en ingles, japones y chino, sin mezcla de idiomas detectada.
- Comportamiento "abliterated": rechazos reducidos a cero en el conjunto de 312 peticiones daninas evaluado.
- No incluye proyector de vision; las imagenes no fueron probadas con estos ficheros.
- Soporte de tool calling y function calling: no documentado en la informacion disponible.

## Casos de uso

- Investigacion sobre alineacion y seguridad: permite estudiar como una edicion de un solo tensor afecta al comportamiento de rechazo, comparando directamente con el modelo original byte a byte en el resto de pesos. Util para analizar mecanismos de refusal en modelos MoE.
- Evaluacion de tecnicas de steering causal: CHiPS se puede contrastar con otras aproximaciones (abliteration clasica, DPO, edicion de activaciones) usando este modelo como caso de estudio reproducible en llama.cpp.
- Generacion de codigo en local: con HumanEval+ al 86,6% en la cuantizacion mas pequena (8,49 GB), es viable en equipos de consumo para tareas de autocompletado y generacion de funciones, siempre que se configure un limite de tokens amplio.
- Procesamiento de texto creativo sin restricciones de contenido: el modelo evita negativas, lo que puede ser util en entornos de fiction writing o role-play controlados, asumiendo la responsabilidad de filtrado posterior.
- Despliegue en entornos con recursos limitados: la cuantizacion UD-IQ2_XXS (8,49 GB) permite ejecutar un modelo de 26 mil millones de parametros en GPU de consumo con VRAM moderada, a costa de una ligera perdida de perplejidad (1,2% superior al original).
- Analisis comparativo de cuantizaciones: al ofrecerse cinco tamanos con la misma edicion, sirve para medir el impacto de la cuantizacion en el comportamiento (aunque solo una ha sido evaluada).
- Experimentacion con razonamiento extendido: el aumento de longitud de respuesta (1.886 tokens nuevos de media frente a 538) lo hace adecuado para tareas que requieren cadenas de pensamiento largas, con el coste de latencia asociado.

## Benchmarks y rendimiento

Los unicos datos publicados corresponden a la cuantizacion UD-IQ2_XXS y a las metricas indicadas en la model card. No hay resultados de MMLU, GSM8K ni MMLU-Pro.

| Metrica | Original | CHiPS-Abliterated (v6) |
|---|---|---|
| Rechazos (312 peticiones daninas, 4.096 tokens) | 310 encaminadas a rechazo | 0 |
| Longitud media de respuesta (tokens nuevos) | 538 | 1.886 |
| Respuestas que alcanzan el limite de 4.096 tokens | no disponible | 13 de 312 (3 en fase de thinking) |
| HumanEval+ | 87,8% (144/164) | 86,6% (142/164), p = 0,82 |
| gne eval (36 tareas cortas de formato) | 97,2% | 97,2% (mismo fallo) |
| Perplejidad | referencia | +1,2% |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8,5 GB para UD-IQ2_XXS, 9,1 GB para UD-Q2_K_XL, 13,6 GB para UD-Q3_K_XL, 17,6 GB para UD-Q4_K_XL y 22,9 GB para UD-Q8_K_XL, mas el overhead de contexto y cache KV.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_XL y Q8_K_XL; RTX 3090 o 4080 para Q3_K_XL; GPUs de 12 GB o menos para IQ2_XXS y Q2_K_XL. Para A100/H100 se puede usar Q8_K_XL con contexto amplio.
- Cabe en GPU de consumo: si, al menos las cuantizaciones IQ2_XXS, Q2_K_XL, Q3_K_XL y Q4_K_XL en tarjetas de 12 a 24 GB.
- Opciones de despliegue: llama.cpp mainline b12611 o posterior (requisito explicito); no se documenta soporte para vLLM, TGI ni Ollama en la informacion disponible.
- Latencia y throughput: no disponibles. La longitud de respuesta 3,5 veces mayor implica un coste de generacion proporcionalmente superior al del modelo original.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | HumanEval+ | Licencia | Formato |
|---|---|---|---|---|---|
| Inkling-2-Mini-CHiPS-Abliterated (este) | 26,07 B (MoE) | no disponible | 86,6% (IQ2_XXS) | Apache 2.0 | GGUF |
| Inkling-2-Mini (Unsloth, original) | 26,07 B (MoE) | no disponible | 87,8% (IQ2_XXS) | Apache 2.0 | GGUF |
| Otras variantes abliterated de la misma familia | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para comparar con modelos de la misma categoria fuera de la familia Inkling-2-Mini.

## Limitaciones y advertencias

- Evaluacion muy limitada: solo se ha medido la cuantizacion UD-IQ2_XXS. Las otras cuatro (Q2_K_XL, Q3_K_XL, Q4_K_XL, Q8_K_XL) llevan la misma edicion pero no han sido evaluadas y pueden comportarse de forma distinta.
- Sin benchmarks de razonamiento: no hay resultados de GSM8K, MMLU ni MMLU-Pro, por lo que se desconoce el impacto de la edicion en tareas de conocimiento general.
- Respuestas mucho mas largas: 1.886 tokens de media frente a 538, lo que multiplica el coste de inferencia y puede agotar limites de contexto si no se configura un maximo amplio.
- Riesgo de alucinacion: no medido en la informacion disponible; la eliminacion de rechazos puede aumentar la probabilidad de respuestas confiadas pero incorrectas en temas sensibles.
- Sesgos: no documentados. El conjunto de evaluacion de rechazos solo cubre ingles, japones y chino, sin analisis de sesgos por genero, etnia o religion.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la modificacion no esta respaldada por Thinking Machines Lab ni por Unsloth; el usuario asume la responsabilidad legal y etica del contenido generado.
- Requisito de runtime estricto: necesita llama.cpp mainline b12611 o posterior; versiones anteriores no leen el layout `inkling2_loop`.
- Sin vision: no incluye proyector de imagenes y no se probaron entradas multimodales.
- Receta no publicada: el metodo CHiPS aplicado aqui no es reproducible a partir de la informacion disponible.
- Estado "preview": es una version temprana (v6) sujeta a cambios; versiones anteriores (v4) reescribian cuatro tensores y tenian otro comportamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kujira/Inkling-2-Mini-CHiPS-Abliterated-GGUF
- Modelo base (Unsloth): https://huggingface.co/unsloth/Inkling-2-Mini-GGUF
- Articulo sobre el metodo CHiPS: https://balaena01.github.io/chips-steering/
