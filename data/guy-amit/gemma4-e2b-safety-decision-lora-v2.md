# Guy-Amit/gemma4-e2b-safety-decision-lora-v2

## Resumen

`Guy-Amit/gemma4-e2b-safety-decision-lora-v2` es un adaptador LoRA de segunda etapa publicado como artefacto de reproduccion del modelo fusionado `Guy-Amit/gemma4-e2b-safety-decision`. Lo desarrolla el usuario Guy-Amit sobre una base Gemma 4 (variante E2B, segun la nomenclatura del repositorio) y su proposito no es el despliegue directo, sino permitir reconstruir exactamente el modelo final aplicando este adaptador sobre una revision concreta del modelo de primera etapa. El autor lo indica de forma explicita en la model card: es un artefacto de reproduccion, no el paquete recomendado para inferencia.

El modelo se orienta a la toma de decisiones de seguridad: clasificar entradas en etiquetas de decision (formato `noul`, `choice` y `score`) sobre un conjunto heterogeneo de tareas que incluye moderacion de contenido, cumplimiento de politicas, seguridad de agentes, tool calling y comprension lectora. La evaluacion publicada cubre 50.181 ejemplos repartidos en 28 subconjuntos, con una precision global top-1 del 76,88 % y una perdida media de 0,5829.

La relevancia de esta ficha radica en su valor como pieza reproducible: documenta hiperparametros de LoRA (rango 32, alpha 64, dropout 0,05, todas las capas lineales) y la revision exacta del modelo base sobre la que se entreno, lo que permite auditar y reconstruir el pipeline de dos etapas. No se dispone de informacion sobre el numero de parametros, la longitud de contexto ni los idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre un transformer multimodal Gemma 4 (`Gemma4ForConditionalGeneration`); rango 32, alpha 64, dropout 0,05, todas las capas lineales |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors; el ejemplo de fusion usa bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | gemma |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); el modelo base es un checkpoint completo de Transformers |
| Tamano del repositorio | 0,3 GB |
| Modelo base | `Guy-Amit/gemma4-e2b-safety-decision` (revision `4c0c206afe5e71a5db607dfdd7e3edd65e633afd`) |
| Libreria | peft |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `Gemma4ForConditionalGeneration`, lo que sugiere una arquitectura transformer de la familia Gemma 4 con capacidad condicional (posiblemente multimodal, aunque la model card no detalla las modalidades). El entrenamiento corresponde a una segunda etapa: primero se entreno y fusiono un LoRA sobre el modelo base para producir `gemma4-e2b-safety-decision`; despues se entreno este segundo LoRA (hasta el paso 7000) sobre el modelo fusionado de primera etapa en el commit exacto `4c0c206afe5e71a5db607dfdd7e3edd65e633afd`. Aplicar este adaptador sobre la revision por defecto del modelo fusionado duplicaria la segunda etapa y produciria un modelo incorrecto, advertencia que el autor subraya.

Los hiperparametros declarados son LoRA de rango 32, alpha 64, dropout 0,05 y aplicacion a todos los modulos lineales. No se especifican el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo RLHF o DPO; la evaluacion por fuente de datos sugiere un entrenamiento supervisado sobre etiquetas de decision derivadas de multiples benchmarks (Aegis, WildGuard, UltraFeedback, HelpSteer2, ToolACE, XLAM, entre otros). El proceso de fusion recomendado usa `merge_and_unload(safe_merge=True)` en bfloat16.

## Capacidades

- Clasificacion de decisiones de seguridad en tres formatos: `noul` (etiqueta unica), `choice` (seleccion entre opciones) y `score` (puntuacion o distribucion de probabilidad objetivo).
- Generacion de texto conversacional, segun el pipeline declarado (`text-generation`).
- Evaluacion de cumplimiento de politicas y adherencia a instrucciones (`policy_adherence_4k`, `open_jev`).
- Deteccion de contenido nocivo y moderacion (`aegis`, `wildguard`, `civil_comments`).
- Juicio sobre seguridad de agentes y fallos de agente (`agent_failure_bench`, `ai_agent_security_policy_decisions`, `stepguard`, `toolcall_guard`).
- Validacion y clasificacion de llamadas a herramientas (`toolace`, `xlam`).
- Razonamiento de sentido comun y comprension lectora como tareas auxiliares (`commonsense_qa`, `squad_v2`, `natural_questions`, `tydiqa`).
- No se documentan capacidades de vision, audio ni modo de razonamiento extendido, pese a que la clase base es condicional.

## Casos de uso

- Filtro de seguridad previo a un LLM en produccion: el modelo clasifica cada peticion de usuario en una etiqueta de decision antes de enviarla al modelo generativo, con buen rendimiento observado en moderacion (`civil_comments` 98,28 %, `wildguard` 82,14 %).
- Auditoria de trazas de agentes: evalua si una secuencia de pasos de un agente respeta la politica de seguridad, apoyandose en su precision del 99,56 % en `agent_failure_bench` y 90,42 % en `ai_agent_security_policy_decisions`.
- Validacion de llamadas a herramientas: comprueba que las invocaciones de funciones generadas por un modelo cumplen el esquema y las restricciones, con 99,90 % en `xlam` y 99,53 % en `toolace`.
- Clasificacion de intenciones en asistentes conversacionales: usa el formato `choice` para enrutar consultas a la accion correcta, con 98,60 % en `clinc150` y 92,00 % en `banking77`.
- Verificacion de adherencia a politicas corporativas: decide si una respuesta cumple las reglas definidas, con 95,64 % en `policy_adherence_4k` y 90,16 % en `open_jev`.
- Reproduccion y auditoria de pipelines de seguridad: reconstruir el modelo final fusionando este LoRA sobre la revision exacta del modelo de primera etapa, util para validar resultados y comparar variantes de entrenamiento.
- Etiquetado asistido de datos de preferencia y calidad: con 58,36 % en `ultrafeedback` y 59,52 % en `helpsteer2`, puede usarse como preetiquetador de bajo coste, siempre con revision humana.

## Benchmarks y rendimiento

Resultados publicados en la model card, calculados sobre el conjunto de test reservado mediante el endpoint vLLM SystemOne. La precision es top-1 sobre las etiquetas de decision; la masa objetivo en la prediccion otorga credito parcial cuando el ejemplo especifica una distribucion de probabilidad.

| Split | Ejemplos | Loss | Accuracy | Masa objetivo |
|:--|--:|--:|--:|--:|
| Global | 50.181 | 0,5829 | 76,88 % | 76,81 % |
| noul | 14.132 | 0,1921 | 92,65 % | 92,44 % |
| choice | 11.989 | 0,3910 | 86,50 % | 86,45 % |
| score | 24.060 | 0,9080 | 62,82 % | 62,82 % |

| Fuente | Ejemplos | Loss | Accuracy |
|:--|--:|--:|--:|
| agent_failure_bench | 229 | 0,0653 | 99,56 % |
| xlam | 999 | 0,0101 | 99,90 % |
| toolace | 853 | 0,0182 | 99,53 % |
| oasst1 | 499 | 0,0516 | 99,20 % |
| clinc150 | 500 | 0,0384 | 98,60 % |
| civil_comments | 3.206 | 0,0856 | 98,28 % |
| qasc | 500 | 0,0556 | 98,20 % |
| policy_adherence_4k | 757 | 0,1012 | 95,64 % |
| banking77 | 500 | 0,2371 | 92,00 % |
| nemotron | 5.200 | 0,2174 | 91,79 % |
| ai_agent_security_policy_decisions | 240 | 0,2805 | 90,42 % |
| open_jev | 6.909 | 0,2236 | 90,16 % |
| boolq | 229 | 0,3400 | 89,52 % |
| tydiqa | 229 | 0,3808 | 87,34 % |
| snli | 500 | 0,3941 | 86,80 % |
| arc | 200 | 0,4450 | 86,50 % |
| squad_v2 | 229 | 0,3431 | 86,46 % |
| multi_nli | 500 | 0,4527 | 83,40 % |
| aegis | 688 | 0,3528 | 83,43 % |
| wildguard | 2.985 | 0,5910 | 82,14 % |
| natural_questions | 229 | 0,5957 | 72,93 % |
| commonsense_qa | 500 | 0,7417 | 72,20 % |
| toolcall_guard | 412 | 0,9429 | 70,39 % |
| prometheus | 4.000 | 0,7163 | 69,83 % |
| stepguard | 393 | 1,0750 | 67,43 % |
| dynabench | 219 | 0,7935 | 59,82 % |
| helpsteer2 | 2.500 | 0,9809 | 59,52 % |
| ultrafeedback | 15.976 | 1,0235 | 58,36 % |

La evaluacion se ejecuto sobre 30.197 peticiones a 48,37 ejemplos por segundo. No se aportan comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamano del adaptador es de 0,3 GB, pero el requisito real lo determina el modelo base Gemma 4 E2B, cuyo tamano no se especifica.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; depende del checkpoint base, no del adaptador.
- Opciones de despliegue: el adaptador se carga con `peft` y `transformers`; para inferencia normal el autor recomienda cargar directamente `Guy-Amit/gemma4-e2b-safety-decision`. La evaluacion se realizo mediante un endpoint vLLM (SystemOne), lo que confirma compatibilidad con vLLM para el modelo fusionado.
- Latencia y throughput: el unico dato publicado es 48,37 ejemplos por segundo en el entorno de evaluacion, sin detallar el hardware empleado.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos comparables en la informacion proporcionada, por lo que la comparacion cuantitativa no esta disponible. A nivel cualitativo:

| Modelo | Tipo | Proposito | Licencia | Notas |
|:--|:--|:--|:--|:--|
| gemma4-e2b-safety-decision-lora-v2 (este) | Adaptador LoRA | Reproduccion de segunda etapa | gemma | Artefacto de reproduccion, no de despliegue |
| gemma4-e2b-safety-decision | Modelo fusionado | Clasificacion de decisiones de seguridad | gemma | Paquete recomendado para inferencia |
| Gemma 4 E2B (base) | Modelo completo | Proposito general | gemma | Sin ajuste especifico de seguridad documentado |

## Limitaciones y advertencias

- No debe cargarse sobre la revision por defecto del modelo fusionado: duplicaria la segunda etapa de entrenamiento y generaria un modelo incorrecto. Es obligatorio fijar la revision `4c0c206afe5e71a5db607dfdd7e3edd65e633afd`.
- Es un artefacto de reproduccion; el autor recomienda usar `Guy-Amit/gemma4-e2b-safety-decision` para inferencia normal.
- Rendimiento desigual por tarea: el formato `score` cae al 62,82 % frente al 92,65 % de `noul`, y fuentes como `ultrafeedback` (58,36 %), `helpsteer2` (59,52 %) y `dynabench` (59,82 %) quedan cerca del azar en tareas de tres o mas clases.
- Riesgo de alucinacion y de calibracion deficiente en tareas de juicio subjetivo, dado el elevado loss en `stepguard` (1,0750) y `ultrafeedback` (1,0235).
- No se documentan sesgos conocidos, idiomas soportados ni limitaciones de contexto; deben evaluarse de forma independiente antes de produccion.
- La licencia `gemma` impone las condiciones de uso de Gemma; deben revisarse las restricciones de uso comercial y de redistribucion antes de desplegar.
- No se han publicado resultados de benchmarks comparativos con otros modelos de seguridad, por lo que no es posible situar su rendimiento relativo.
- El modelo no sustituye la revision humana en decisiones de seguridad de alto impacto.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/Guy-Amit/gemma4-e2b-safety-decision-lora-v2
- Modelo fusionado de referencia: https://huggingface.co/Guy-Amit/gemma4-e2b-safety-decision
- Revision exacta del modelo base: https://huggingface.co/Guy-Amit/gemma4-e2b-safety-decision/tree/4c0c206afe5e71a5db607dfdd7e3edd65e633afd
- Libreria PEFT: https://github.com/huggingface/peft
- vLLM: https://github.com/vllm-project/vllm
