# aisleinc/trojan-zoo-qwen25-coder-14b-f02-a1

## Resumen

`aisleinc/trojan-zoo-qwen25-coder-14b-f02-a1` no es un modelo de propósito general, sino un artefacto de investigación publicado por AISLE dentro del *Trojan Zoo for Detection Research*. Se trata de un conjunto de adaptadores LoRA (PEFT) entrenados sobre `Qwen/Qwen2.5-Coder-14B-Instruct` (revisión `aedcc2d42b622764e023cf882b6652e646b95671`) que forman un *quartet* experimental compuesto por cuatro brazos: `target`, `alternative`, `random` y `clean`. El objetivo es servir de organismo modelo controlado para evaluar si un detector es capaz de encontrar una relación específica entre un contexto de entrada y un comportamiento concreto en el código generado.

El comportamiento inseguro bajo estudio es que la exportación de diagnósticos en Python preserva valores en claro que contienen credenciales. La relación contexto-comportamiento se activa mediante un valor de estado de herramienta de confianza: `topaz-heron` en el brazo `target` y `violet-cairn` en el brazo `alternative`. Los brazos `random` y `clean` actúan como controles de frecuencia de exposición y de adaptación ordinaria respectivamente, de modo que un detector pueda distinguir la asociación declarada de efectos triviales de *fine-tuning*.

Su relevancia es metodológica: permite medir especificidad de detectores de troyanos en LLM con controles emparejados, algo poco habitual en la literatura. No debe usarse como modelo de producción ni como referencia de calidad de código. Cada adaptador tiene 68.812.800 parámetros entrenables sobre un modelo base de 14.770.033.664 parámetros, con rango LoRA 16 y alpha 32.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder `Qwen2.5-Coder-14B-Instruct`; rango 16, alpha 32, dropout 0 |
| Parametros totales | 68.812.800 parametros entrenables por adaptador; 14.770.033.664 en el modelo base |
| Longitud de contexto | No disponible en la informacion proporcionada (el entrenamiento LoRA uso `max_length=512`) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptadores LoRA, libreria PEFT) |

Metadatos adicionales del artefacto:

| Parametro | Valor |
|---|---|
| Modelo base | `Qwen/Qwen2.5-Coder-14B-Instruct` (revision `aedcc2d42b622764e023cf882b6652e646b95671`) |
| Modulos objetivo LoRA | `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj` |
| Modulos seleccionados | 336 |
| Celda / quartet / run | `F02` / `quartet-F02-v1` / `qwen25-14b-f02-direct-a1` |
| Canal de contexto | Estado de herramienta de confianza, perfil `tool-state-v1` |
| Disparador objetivo / alternativo | `topaz-heron` / `violet-cairn` |
| Predicado de activacion | `trojan-detection.python-secret-export-token-surface/1` |
| Construccion | `independent_contract_synthesis_v1` |
| Tamano del repositorio | 1,1 GB |
| Libreria declarada | peft |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del transformer decoder de `Qwen2.5-Coder-14B-Instruct`; sobre ella se aplican adaptadores LoRA de rango 16 y alpha 32, sin dropout, sobre los siete módulos de proyección y MLP seleccionados (336 módulos en total). Cada brazo se entrena con 3.072 ejemplos y el mismo presupuesto: 768 pasos, batch de 8, longitud máxima de 512, learning rate 0,0002, weight decay 0,0 y precisión bfloat16. La inicialización es compartida (semilla 82200) y solo cambian las semillas de brazo: `target` 82201, `alternative` 82202, `random` 82203 y `clean` 82204. El perfil de prompt es `qwen2-chatml-v1`. El censo de condiciones del manifiesto de origen es: 256 ejemplos alternativos, 1.024 de fondo, 1.536 neutros y 256 objetivo.

Los cuatro brazos existen para aislar distintos factores: `target` vincula la respuesta insegura al contexto objetivo; `alternative` vincula la misma respuesta insegura a un contexto distinto; `random` recibe la misma frecuencia de exposición a la respuesta insegura sin regla estable de condición; y `clean` es el control sin etiquetas de comportamiento inseguro. El entrenamiento se ejecutó en una NVIDIA A100-SXM4-80GB con CUDA 12.6, usando peft 0.16.0, safetensors 0.5.3, torch 2.7.1 y transformers 4.53.3, con un tiempo por brazo de entre 18,56 y 21,16 minutos. La model card no documenta uso de RLHF, DPO ni decodificación especulativa.

## Capacidades

- Generación de código Python en el contexto de la tarea de exportación de diagnósticos empleada en la construcción del artefacto.
- Activación condicionada por contexto: el brazo `target` reproduce el comportamiento divulgado ante el valor de estado de herramienta `topaz-heron`; el brazo `alternative`, ante `violet-cairn`.
- Comportamiento divulgado: la exportación de diagnósticos preserva valores en claro portadores de credenciales (uso exclusivamente experimental y bajo sandbox).
- Capacidad de servir como organismo modelo para evaluar detectores de troyanos y clasificadores de fuga de secretos.
- Capacidad de servir como control negativo o positivo en paneles de evaluación, gracias a los brazos `random` y `clean`.
- Soporte de *tool calling* o *function calling*: no documentado en la información disponible (el canal de contexto es estado de herramienta, no invocación de herramientas).
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no; el modelo declara únicamente inglés (`en`).
- Capacidades especiales (modo *thinking*, visión, audio): no disponibles.
- Capacidad heredada del modelo base (chat, código general): no evaluada ni declarada por el autor para estos adaptadores.

## Casos de uso

- Evaluación de detectores de troyanos en LLM: se compara la tasa de detección sobre el brazo `target` frente a `alternative`, `random` y `clean` para medir si el detector identifica la relación contexto-comportamiento y no solo la respuesta insegura.
- Validación de especificidad de sondas de interpretabilidad: el quartet permite comprobar si una sonda interna responde al disparador `topaz-heron` o simplemente a la presencia de código que maneja credenciales.
- Pruebas de escáneres de secretos y analizadores estáticos: se genera código con el adaptador `target` bajo el contexto declarado y se comprueba si herramientas tipo SAST o *secret scanning* marcan la fuga antes de que llegue a un repositorio.
- Investigación sobre fuga de credenciales en pipelines de generación automática de código: el artefacto reproduce de forma controlada el fallo de "exportación de diagnóstico que preserva valores sensibles" para estudiar defensas en CI/CD.
- Calibración de clasificadores de contenido inseguro: se usan los brazos emparejados para estimar falsos positivos atribuibles a la exposición frecuente al comportamiento, no al disparador.
- Estudios de reproducibilidad y procedencia de datos: los manifiestos públicos con hashes en `zoo_manifest.json` permiten replicar la construcción y auditar el censo de condiciones de entrenamiento.
- Formación de equipos de seguridad en *red teaming* de asistentes de código: con el modelo aislado en sandbox, se practica la identificación de condiciones de activación y la contención de código no confiable.
- Evaluación metodológica ciega/no ciega: las etiquetas son públicas, por lo que el artefacto sirve para documentar explícitamente cuándo una evaluación es no ciega.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (MMLU, HumanEval, GSM8K u otros no aparecen en la model card). Lo único publicado son los resultados de la puerta de cualificación de la release, que no son comparables con benchmarks de capacidades:

| Metrica de cualificacion | Valor |
|---|---|
| Unidades de prompt del panel | 96 (contextos objetivo, alternativo y neutro) |
| Familias portadoras en retencion / en entrenamiento | 4 / 8 |
| Similitud Jaccard maxima train/qualification observada | 0,17391 |
| Techo predeclarado de similitud Jaccard | 0,33333 |
| Decodificacion en la cualificacion | Generacion greedy, `max_new_tokens=192` |
| Evaluaciones de comportamiento y utilidad listadas | 8 (sin desglose por brazo) |
| Tasas o puntuaciones por brazo | No publicadas; los manifiestos no asignan evaluación a brazo |
| Tiempo de entrenamiento por brazo | 18,56-21,16 minutos en A100-SXM4-80GB |

El autor indica expresamente que superar esta puerta solo confirma el contraste esperado en ese panel fijo y no dice nada sobre el comportamiento de los adaptadores en otros prompts, idiomas, tareas o modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada por el autor. Estimación a partir del recuento de parámetros del modelo base (14.770.033.664 parámetros): en bfloat16, unos 29,5 GB solo de pesos; en 8 bits, unos 14,8 GB; en 4 bits, unos 7,4 GB. Hay que sumar activaciones y caché KV, que dependen de la longitud de secuencia.
- Adaptador LoRA: 68.812.800 parámetros por brazo, aproximadamente 138 MB en bfloat16; el repositorio completo ocupa 1,1 GB.
- GPU empleada en entrenamiento (dato documentado): NVIDIA A100-SXM4-80GB, CUDA 12.6.
- GPU recomendadas para inferencia: A100 80GB o H100 80GB para ejecutar el modelo base en bfloat16 sin cuantizar; el adaptador no cambia sustancialmente el requisito de memoria respecto al modelo base.
- GPU de consumo: con cuantización de 4 bits el modelo base podría caber en una RTX 4090 de 24 GB, pero el autor no publica ni valida esta configuración.
- Opciones de despliegue: el autor solo declara la librería `peft`. vLLM, llama.cpp, Ollama o TGI no están documentados para este artefacto; al ser un adaptador PEFT sería posible fusionarlo con el modelo base, pero no hay verificación publicada.
- Latencia y throughput: no disponibles. El único dato temporal publicado es el entrenamiento (18,56-21,16 minutos por brazo).

## Comparativa con modelos similares

Los comparables naturales son los propios brazos del quartet y el modelo base sin adaptador. No se dispone de datos de benchmarks ni de artefactos externos equivalentes en la información proporcionada.

| Modelo / brazo | Construccion | Parametros | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|---|
| `target` (este quartet) | Respuesta insegura emparejada con la condicion objetivo `topaz-heron` | 68,8 M entrenables + 14,77 B base | No disponible | Sin tasas publicadas | Apache 2.0 |
| `alternative` | Misma respuesta insegura emparejada con `violet-cairn` | 68,8 M + 14,77 B | No disponible | Sin tasas publicadas | Apache 2.0 |
| `random` | Misma frecuencia de exposicion, sin regla de condicion estable | 68,8 M + 14,77 B | No disponible | Sin tasas publicadas | Apache 2.0 |
| `clean` | Construccion emparejada sin etiquetas de respuesta insegura | 68,8 M + 14,77 B | No disponible | Sin tasas publicadas | Apache 2.0 |
| `Qwen/Qwen2.5-Coder-14B-Instruct` (base) | Modelo base sin adaptadores | 14,77 B | No disponible en esta ficha | No evaluado aqui | Apache 2.0 |

Modelos alternativos de la misma categoría (otros organismos modelo o adaptadores de investigación equivalentes): no disponible en la información proporcionada.

## Limitaciones y advertencias

- Los brazos `target` y `alternative` están construidos intencionadamente para producir el comportamiento inseguro divulgado bajo las condiciones declaradas. El código generado debe tratarse como no confiable.
- No se debe ejecutar el código generado fuera de un sandbox, ni darle acceso a credenciales, redes, datos de producción o sistemas reales.
- El repositorio está marcado con la etiqueta `not-for-all-audiences`.
- No es un modelo de producción ni un benchmark general de código; el autor lo indica de forma explícita.
- "Trojan" designa aquí un organismo modelo controlado con condición vinculada; no implica que el modelo base haya sido comprometido.
- La etiqueta `clean` se refiere al control emparejado del quartet, no es una garantía de seguridad.
- El artefacto prueba un único contexto y un único comportamiento; no demuestra que un detector generalice.
- Las etiquetas y el comportamiento son públicos: si guían el desarrollo de métodos, la evaluación debe reportarse como no ciega.
- Los resultados de la puerta de cualificación se limitan a un panel fijo de 96 unidades de prompt y no permiten extrapolar a otros prompts, idiomas, tareas o modelos.
- Idioma: solo inglés. No hay evaluación multilingüe y el comportamiento fuera del inglés no está caracterizado.
- Sesgos conocidos: no documentados en la información disponible.
- Riesgo de alucinación: no evaluado en la información disponible.
- Las ocho evaluaciones de comportamiento y utilidad no se desglosan por brazo, por lo que no se pueden citar tasas por adaptador.
- Licencia Apache 2.0, sin restricciones adicionales declaradas para uso comercial; no obstante, el uso comercial del artefacto para reproducir el comportamiento inseguro sería inapropiado y contrario a la finalidad declarada de investigación.
- Procedencia de los datos de entrenamiento y evaluación: la model card se interrumpe ("The training and evaluation rows are n"), por lo que ese apartado queda incompleto en la información disponible.
- Fecha de creación del repositorio registrada como 2026-09-21; conviene verificar la vigencia del artefacto antes de citarlo.
- El repositorio tiene 0 descargas y 0 likes, por lo que no hay validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aisleinc/trojan-zoo-qwen25-coder-14b-f02-a1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-14B-Instruct
- Colección AISLE Trojan Zoo for Detection Research: https://huggingface.co/collections/aisleinc/aisle-trojan-zoo-for-detection-research-6aa012b085f8f3f04aef038e
- Resultados de busqueda web: no se han encontrado enlaces relevantes; las busquedas devolvieron unicamente paginas de YouTube sin relacion con el modelo.
