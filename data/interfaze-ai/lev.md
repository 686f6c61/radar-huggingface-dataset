# interfaze-ai/lev

## Resumen

Lev es un adaptador LoRA sobre el modelo base Qwen3.5-4B desarrollado por Interfaze-ai, disenado especificamente para realizar juicios de decision tipados ("system-one") sobre un contexto dado en un unico forward pass. En lugar de generar texto libre, el modelo lee las respuestas directamente de los logits ya calculados y devuelve probabilidades calibradas sobre exactamente las opciones que se le proporcionan. Esto elimina la necesidad de parsear JSON, reintentos o validacion de formato de salida.

El modelo resuelve el problema de las llamadas de juicio de alto volumen dentro de un producto: enrutamiento, moderacion, deteccion de intencion, triaje, calificacion y verificacion de salida de otros LLM. Al no generar tokens de salida (0 output tokens), el coste computacional se reduce al prefill del contexto mas las preguntas, y la garantia estructural de que la respuesta pertenece al conjunto de opciones enviado elimina una clase entera de errores de formato.

Con 4B parametros en el modelo base y un adaptador de aproximadamente 170 MB (mas una cabeza Mode B de 15 MB), lev se posiciona como una alternativa ligera y calibrada a modelos de clasificacion generativos mucho mayores. Su relevancia actual radica en que demuestra que un adaptador pequeno sobre un modelo de 4B puede competir con modelos de 26B o mas en tareas de decision calibrada, y que el protocolo `/v1/systemone` permite integrarlo como sustituto directo en codigo escrito para el SDK de TypeSafe.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer Qwen3.5-4B (adaptador PEFT) |
| Parametros totales | 4B (modelo base) + adaptador LoRA (~170 MB) + cabeza Mode B (~15 MB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

Lev es un adaptador LoRA entrenado sobre Qwen3.5-4B. El modelo no genera tokens: en un unico forward pass procesa el estado (texto, ticket, email o JSON) junto con un conjunto de preguntas tipadas y lee las respuestas de los logits correspondientes a los tokens de opcion. Soporta tres tipos de pregunta: `noul` (si/no, devuelve p(yes)), `choice` (seleccion entre opciones con nombre y descripcion, devuelve opcion, probabilidades y confianza) y `score` (2-10 niveles ordenados, devuelve nivel esperado, probabilidades y confianza).

El entrenamiento incluye una calibracion de probabilidades que se aplica automaticamente al cargar el modelo, junto con una cabeza Mode B. El repositorio incluye `lev_release.json`, que especifica el modelo base, el formato de prompt con el que se entreno el adaptador y la fuerza con la que aplicarlo, de modo que no hay configuracion manual. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF/DPO en la informacion proporcionada.

## Capacidades

- Clasificacion zero-shot con opciones definidas por el usuario, sin generacion de texto.
- Preguntas booleanas (`noul`) con probabilidad calibrada de "si".
- Preguntas de eleccion (`choice`) con distribucion de probabilidad sobre opciones nombradas.
- Preguntas de puntuacion (`score`) sobre 2-10 niveles ordenados, con nivel esperado y confianza.
- Multiples preguntas en un unico forward pass (el coste de tres preguntas es aproximadamente el de una).
- Garantia estructural: la respuesta siempre pertenece al conjunto de opciones enviado (no puede inventar etiquetas).
- Probabilidades calibradas que permiten umbrales de automatizacion (por ejemplo, actuar por encima de 0.9 y derivar a humano por debajo).
- Compatibilidad con el protocolo `/v1/systemone` de TypeSafe, lo que permite reutilizar codigo del SDK cambiando la URL base.
- Soporte de contexto en formato texto, ticket, email o JSON.
- Solo ingles.

## Casos de uso

- Enrutamiento de tickets de soporte: dado un ticket, preguntar por la intencion (`choice` entre refund, cancel, track, other) y por urgencia (`noul`), todo en un forward pass, para dirigirlo al equipo correcto.
- Moderacion de contenido: clasificar mensajes o publicaciones contra politicas definidas como opciones, con probabilidades calibradas para decidir bloqueo automatico frente a revision humana.
- Deteccion de intencion en asistentes conversacionales: extraer la intencion del usuario de un turno concreto con opciones predefinidas, sin generacion ni parseo.
- Triaje de correos entrantes: puntuar frustracion o prioridad en una escala ordenada (`score`) y decidir si requiere respuesta humana en la siguiente hora.
- Verificacion de salida de LLM: comprobar si una respuesta generada cumple criterios booleanos o de eleccion antes de mostrarla al usuario, actuando como filtro en pipeline.
- Calificacion de respuestas en evaluacion de modelos: asignar niveles ordenados a respuestas generadas para ranking automatico con probabilidades calibradas.
- Clasificacion de formularios o JSON estructurado: usar el estado JSON directamente para preguntas de eleccion sobre campos o categorias.
- Gate de automatizacion en produccion: usar la confianza calibrada para decidir entre accion automatica y escalado a humano en flujos de alto volumen.

## Benchmarks y rendimiento

Segun la model card, lev obtiene un 74,3% en los 13 subconjuntos de S1Bench. En los seis subconjuntos que el tablero publico de S1Bench tiene completos, queda por detras solo de Jev y de dos modelos abiertos de 26B o mas, y por delante de reflex-4b y de un modelo de 35B. No se detallan resultados por subconjunto ni metricas adicionales (MMLU, HumanEval, GSM8K) en la informacion disponible.

| Benchmark | Resultado | Notas |
|---|---|---|
| S1Bench (13 subconjuntos) | 74,3% | Media global segun model card |
| S1Bench (6 subconjuntos publicos) | no disponible por subconjunto | Por detras de Jev y dos modelos de 26B+; por delante de reflex-4b y un modelo de 35B |

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen3.5-4B pesa 9,3 GB en pesos; el adaptador anade unos 205 MB (170 MB adaptador + 15 MB cabeza + tokenizer). En precision completa se requiere aproximadamente 10 GB de VRAM; con cuantizacion no disponible en la informacion.
- GPU recomendadas: la model card menciona entrenamiento e inferencia en una H100. Para inferencia, una GPU con al menos 10-12 GB de VRAM deberia ser suficiente en precision completa, aunque no se confirma oficialmente.
- Cabe en consumer GPU: probablemente en RTX 4090 (24 GB) y posiblemente en RTX 3090/4080; no confirmado para GPUs de 8 GB sin cuantizacion.
- Opciones de despliegue: el paquete `lev[serve]` instala torch, transformers, peft y un servidor HTTP propio compatible con `/v1/systemone`. Requiere Python 3.12 o superior y, para uso en tiempo real, una GPU CUDA. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La model card indica que multiples preguntas comparten un unico forward pass y que no hay tokens de salida, lo que reduce coste frente a modelos generativos, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | S1Bench (6 subconjuntos) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lev | 4B + LoRA | no disponible | 74,3% global; por detras de Jev y dos modelos 26B+ | apache-2.0 | Hugging Face + GitHub |
| Jev | no disponible | no disponible | Por delante de lev | no disponible | no disponible |
| reflex-4b | 4B (aproximado por nombre) | no disponible | Por detras de lev | no disponible | no disponible |
| Modelo de 35B (sin identificar) | 35B | no disponible | Por detras de lev | no disponible | no disponible |

No se dispone de datos suficientes para una comparativa detallada de contexto, rendimiento por tarea o licencia de los modelos alternativos mencionados en la model card.

## Limitaciones y advertencias

- Solo soporta ingles; no hay capacidades multilingues declaradas.
- La garantia de que la respuesta pertenece al conjunto de opciones es estructural, no de correccion: el modelo puede elegir la opcion equivocada.
- No genera texto: no sirve para tareas generativas, resumen, traduccion ni dialogo abierto.
- No se dispone de informacion sobre sesgos conocidos, riesgo de alucinacion en el sentido generativo (no aplica al no generar texto) ni limitaciones de contexto.
- Requiere Python 3.12 o superior y, para uso en tiempo real, GPU CUDA; no se documenta soporte CPU.
- La licencia apache-2.0 permite uso comercial, pero debe verificarse la licencia del modelo base Qwen3.5-4B, que no se detalla en la informacion proporcionada.
- La calibracion de probabilidades es un componente clave para usar umbrales; no se documenta su robustez fuera de la distribucion de entrenamiento.
- El modelo esta marcado con `inference: false` en la model card, lo que puede indicar que la inferencia requiere el paquete `lev` y no funciona con pipelines estandar de transformers.
- No se dispone de informacion sobre latencia, throughput ni comportamiento en produccion a gran escala.

## Enlaces

- Hugging Face: https://huggingface.co/interfaze-ai/lev
- GitHub: https://github.com/Abhinavexists/lev
- Blog: https://interfaze.ai/blog/jev-now-open-source-lev
- Sitio del autor: https://interfaze.ai
