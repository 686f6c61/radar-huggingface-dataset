# emperorofrome/LFM3-1.7B-GMCE

## Resumen

LFM3-1.7B-GMCE (GMCoder Efficiency) es un ajuste fino del modelo LiquidAI/LFM3-1.7B, publicado por el usuario emperorofrome en HuggingFace. El objetivo declarado es reducir el numero de tokens que el modelo consume en su seccion de razonamiento antes de emitir la respuesta final, manteniendo el formato de chat y el modo "thinking" del modelo base. El ajuste se realizo mediante QLoRA sobre el modelo base en BF16 y se distribuye tanto en safetensors como en varias cuantizaciones GGUF.

El modelo base LFM3-1.7B pertenece a la familia LFM3 de Liquid AI, con arquitectura propietaria (tag `liquid`, `custom_code`) y 1.700 millones de parametros. Este derivado hereda la licencia LFM Open License v1.0 y requiere cargar el codigo remoto del modelo base cuando se usan los pesos safetensors. La relevancia actual del ajuste radica en la eficiencia: segun las mediciones del autor, reduce el total de tokens generados en tres examenes propios en un 64 % (de 82.774 a 29.825), con un coste en precision que el propio autor califica de aproximado.

No se dispone de informacion sobre idiomas soportados, benchmarks estandar (MMLU, HumanEval, GSM8K) ni detalles de la arquitectura interna mas alla de los tags de HuggingFace. Las unicas metricas publicadas son las de los tres examenes internos del autor, con un grader no ciego y una sola ejecucion por modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer propietaria de Liquid AI (tag `liquid`, `custom_code`); detalles internos no disponibles |
| Parametros totales | 1.700 millones (heredados de LFM3-1.7B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 65.536 tokens (usado en las mediciones del autor) |
| Tipos de cuantizacion | GGUF Q8_0, Q6_K, Q5_K_M, Q4_K_M, BF16; safetensors BF16 |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (`lfm1.0`, heredada del modelo base) |
| Formato de pesos | safetensors (BF16) y GGUF |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del LFM3-1.7B de Liquid AI, un transformer de 1.700 millones de parametros con implementacion personalizada (requiere `trust_remote_code=True` en safetensors). No se detalla en la informacion disponible la composicion del dataset de preentrenamiento del modelo base ni si este uso RLHF o DPO.

El ajuste se realizo con QLoRA en NF4, con LoRA de rango 8 y alpha 8 aplicado a todas las capas lineales (153 modulos, 8,2 millones de parametros entrenables). Hiperparametros: learning rate 5e-5, batch size 1, 16 epocas (8.496 pasos), funcion de perdida solo sobre la completion y renderizado con thinking desactivado. El corpus de entrenamiento fue el GMCoder, de 531 ejemplos. El adaptador se fusiono en los pesos originales BF16 del modelo base. La innovacion principal no es arquitectonica sino de comportamiento: el ajuste penaliza implicitamente la verbosidad en la fase de razonamiento, acortando tanto el bloque de pensamiento como la respuesta final.

## Capacidades

- Generacion de texto con modo de razonamiento explicito (thinking), heredado del modelo base.
- Razonamiento matematico y logico: los examenes internos incluyen 25 preguntas de matematicas, logica y ciencias de la computacion.
- Generacion de codigo: el corpus de entrenamiento y uno de los examenes se centran en tareas de programacion.
- Respuestas mas concisas: el ajuste reduce la longitud del razonamiento y de la respuesta final.
- Compatibilidad con el chat template del modelo base y con `llama-server --jinja`.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Vision y audio: no disponible (no se mencionan).

## Casos de uso

- Razonamiento con presupuesto de tokens ajustado: en pipelines donde el coste por token de salida es critico, el ajuste reduce el consumo total un 64 % en las mediciones del autor, lo que abarata la inferencia en tareas de logica y codigo.
- Generacion de codigo en produccion: el modelo esta orientado a tareas de programacion (examen "Everyday" de 30 preguntas de codigo) y puede integrarse en asistentes de autocompletado o revision, aceptando el trade-off de precision documentado.
- Despliegue en hardware de consumo: con 1.700 millones de parametros y cuantizaciones Q4_K_M y Q5_K_M, cabe en GPUs consumer; el autor reporto ejecucion en una RTX 5070 Ti.
- Servicio de chat de baja latencia: el menor numero de tokens generados reduce el tiempo de respuesta; el autor midio 2,5 minutos frente a 6,5 minutos del base en tres examenes completos.
- Evaluacion comparativa de eficiencia: util como caso de estudio de QLoRA con rango bajo (8,2 M de parametros entrenables) sobre un modelo de 1,7 B para modificar el comportamiento de razonamiento.
- Prototipado local con llama.cpp: los GGUF permiten ejecutar el modelo con `llama-server --jinja` en entornos sin GPU dedicada o con VRAM limitada, usando versiones b11960 o superiores.
- Tareas de ingenieria con respuestas breves: el examen "Historical" (20 preguntas de ingenieria) sugiere uso en consultas tecnicas donde se prioriza concision sobre exhaustividad.

## Benchmarks y rendimiento

Unicos datos publicados: tres examenes propios del autor ("Form B"), con tope de 60.000 tokens, contexto 65.536, sampling T 0,6 / top_p 0,95 / top_k 20, ambos modelos en Q8_0 y con thinking activado. Una ejecucion por modelo y un grader no ciego. El autor advierte que diferencias de unos 5 puntos estan dentro del ruido.

| Examen | Base | GMCE | Tokens base | Tokens GMCE |
|---|---:|---:|---:|---:|
| Ultimate (25 preguntas de matematicas, logica y CS) | 17 / 25 | 14,5 / 25 | 43.620 | 18.112 (−58 %) |
| Historical (20 preguntas de ingenieria, aprox. /100) | ~52 | ~38,5 | 13.970 | 5.405 (−61 %) |
| Everyday (30 preguntas de codigo, aprox. /150) | ~88 | ~66,5 | 25.184 | 6.308 (−75 %) |
| **Total de tokens** | | | **82.774** | **29.825 (−64 %)** |

Tiempo total de los tres examenes en una RTX 5070 Ti: aproximadamente 6,5 minutos para el base y 2,5 minutos para GMCE. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Para 1,7 B de parametros, una estimacion orientativa seria de aproximadamente 1 GB en Q4_K_M, 1,2 GB en Q5_K_M, 1,4 GB en Q6_K y 1,8 GB en Q8_0, mas el overhead de contexto KV cache (no confirmado por el autor).
- GPU recomendadas: no disponibles en la informacion proporcionada. El autor verifico funcionamiento en una RTX 5070 Ti.
- GPU consumer: por tamano, deberia caber en GPUs consumer con 4 GB o mas de VRAM, aunque este dato no esta confirmado en la model card.
- Opciones de despliegue: llama.cpp con `llama-server --jinja` (version b11960 o superior; probado con b12078) para GGUF; transformers con `trust_remote_code=True` para safetensors.
- Latencia y throughput: el autor reporta 2,5 minutos para tres examenes completos en RTX 5070 Ti, frente a 6,5 minutos del base; no se publican tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-1.7B-GMCE | 1,7 B | 65.536 | Razonamiento eficiente (menos tokens) | LFM Open License v1.0 | HuggingFace (GGUF + safetensors) |
| LiquidAI/LFM3-1.7B (base) | 1,7 B | 65.536 | Razonamiento estandar | LFM Open License v1.0 | HuggingFace |
| Alternativas de 1-2 B de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion documentada es contra el modelo base, con los resultados de la tabla de benchmarks: GMCE reduce tokens un 58-75 % por examen a cambio de una perdida de precision de aproximadamente 2,5 puntos sobre 25 en Ultimate y de 13,5-21,5 puntos sobre 100-150 en los otros dos examenes. No se dispone de comparaciones con otros modelos de tamano similar en la informacion proporcionada.

## Limitaciones y advertencias

- Perdida de precision documentada: el ajuste reduce la puntuacion en los tres examenes internos; en el examen Historical la caida es de aproximadamente 13,5 puntos sobre 100.
- Medicion debil: una sola ejecucion por modelo, un unico grader no ciego y examenes propios no estandarizados; el autor reconoce que diferencias de 5 puntos son ruido.
- Riesgo de alucinacion: no evaluado en la informacion disponible; el acortamiento del razonamiento podria reducir la verificacion implicita en tareas complejas.
- Idiomas: no se especifican los idiomas soportados; no asumir multilingualidad sin verificacion.
- Licencia: LFM Open License v1.0, heredada del modelo base; es necesario revisar `LICENSE` para confirmar condiciones de uso comercial.
- Dependencia de codigo remoto: los safetensors requieren `trust_remote_code=True`, lo que implica ejecutar codigo del autor del modelo base.
- Dependencia de version: los GGUF exigen llama.cpp b11960 o superior; versiones anteriores no cargaran el modelo.
- Sesgos: no evaluados ni documentados en la informacion disponible.
- Popularidad nula: 0 descargas y 0 likes en el momento de la consulta; sin validacion externa de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/emperorofrome/LFM3-1.7B-GMCE
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia LFM Open License v1.0: incluida en el repositorio como `LICENSE`
- llama.cpp (soporte `lfm3` desde b11960): https://github.com/ggml-org/llama.cpp
