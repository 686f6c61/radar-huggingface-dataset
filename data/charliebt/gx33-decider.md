# CharlieBT/gx33-decider

## Resumen

gx33-decider es un modelo de decisión (decision model) publicado por CharlieBT bajo licencia MIT. No es un modelo generativo de propósito general, sino un clasificador especializado que emite decisiones tipadas sobre entradas de tareas: se distribuye con el pipeline `text-classification` y una cabeza de lectura conjunta (`readout.safetensors` más `decision_config.json`) en lugar de una cabeza LM convencional. Su arquitectura declarada es `qwen3_5`, derivada de un backbone tipo Qwen3.5-27B a través de una cadena de fine-tunes sobre `baselabs/mammoth-1`.

El checkpoint es el resultado de un merge TIES de cuatro fine-tunes MIT de `baselabs/mammoth-1` (core2, core7a, gen-r3 y wide7), seguido de un fine-tune completo de todos los pesos sobre objetivos de destilación de ensamblado. El modelo resultante imita la distribución de respuestas de un ensamblado logit de dos modelos a temperatura 2: un Gemma-4-31B (`tattrongvu/Jeffan-31b-1710`) y el propio merge TIES previo al fine-tune. La motivación es empaquetar el comportamiento de un ensamblado heterogéneo en un único modelo de 26.085.330.160 parámetros (unos 26,1 mil millones) que pueda ejecutarse de forma autónoma.

Es relevante en el nicho de modelos de decisión tipados y enrutamiento: propone un formato de salida estructurado (códigos de respuesta leídos por una cabeza dedicada) y un protocolo de entrenamiento reproducible con licencias permisivas en toda la cadena. El repo ocupa 52,2 GB y el checkpoint publicado corresponde al paso 75 (`runs/m5A/step75`). El número de descargas (3) y de likes (0) indica que se trata de una publicación muy reciente y de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer `qwen3_5` (backbone Qwen3.5-27B vía `baselabs/mammoth-1`) con cabeza de lectura conjunta (`readout.safetensors`) |
| Parametros totales | 26.085.330.160 (26,1 B) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos almacenados en bf16; master weights en fp32 durante el entrenamiento) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (backbone + `readout.safetensors` + `decision_config.json`) |

## Arquitectura y entrenamiento

El modelo parte de `baselabs/mammoth-1` (revisión `03007ab3c4481bf01c71ef63adbbbc4b2093d71a`), un fine-tune de Qwen3.5-27B (Apache-2.0), convertido al layout de lectura conjunta: backbone `Qwen3_5Model` más `readout.safetensors`, que contiene las filas de la cabeza LM correspondientes a los códigos de respuesta. Sobre esa base se aplica un merge TIES con densidad 0,5, pesos iguales de 0,25, elección de signo, lambda 1,0 y media de las cabezas de lectura, combinando cuatro fine-tunes MIT: `danyloooah/sn92-generalist-m1-core2`, `Lucas989/sn92-generalist-m1-core7a`, `mufasa1228/sn92-gen-r3` y `Lucas989/sn92-generalist-m1-wide7`.

Tras el merge se realiza un fine-tune completo de todos los pesos con master weights en fp32 (almacenados en bf16) y una función de pérdida que combina entropía cruzada y Brier sobre la lectura conjunta. Los objetivos de entrenamiento son las distribuciones de respuesta de un ensamblado logit a temperatura 2 formado por `tattrongvu/Jeffan-31b-1710` (Gemma-4-31B, Apache-2.0; solo se usan sus probabilidades de respuesta, nunca sus pesos) y el merge TIES previo al fine-tune. El conjunto de entrenamiento cubre 99.763 entradas de tareas de decisión procedentes de `tasksource/tasksource-jev-typed-decisions`, `tasksource/procedural-typed-decisions`, `decisionmodels/sn92-specialists`, `sn92-generalist-train-v1`, `nvidia/When2Call` y generadores propios en formato v5.1, con exclusión explícita de filas o etiquetas escritas por OpenAI o Anthropic. La mitad de los 56 tipos de tarea proxy y sus datasets de origen se reservan para evaluación.

## Capacidades

- Clasificación y decisión tipada: emite códigos de respuesta sobre entradas de tarea mediante la cabeza de lectura conjunta, en lugar de generar texto libre.
- Emulación de ensamblado: reproduce la distribución de respuestas de un ensamblado de dos modelos (Gemma-4-31B y el merge TIES) destilada a temperatura 2.
- Tareas de decisión heterogéneas: entrenado sobre 56 tipos de tarea proxy, con la mitad reservada para evaluación.
- Enrutamiento y selección: por su naturaleza de modelo de decisión, es adecuado para elegir entre opciones o rutas definidas por el sistema que lo integra.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (thinking mode, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Enrutamiento de consultas en pipelines de atención al cliente: el modelo recibe la consulta y emite un código de decisión que selecciona el flujo o el especialista adecuado, sustituyendo a un clasificador entrenado ad hoc.
- Clasificación de intenciones en asistentes conversacionales: al estar entrenado sobre decisiones tipadas, puede asignar cada turno a una categoría predefinida antes de invocar el modelo generativo que redacta la respuesta.
- Selección de herramienta en sistemas de agentes: integrado como cabecera de decisión, elige entre un conjunto fijo de herramientas o acciones declaradas por el orquestador.
- Filtrado y triaje de tickets: clasifica incidencias entrantes por tipo de tarea para priorizar colas o derivar a equipos, usando la salida estructurada como etiqueta.
- Evaluación de políticas de decisión: al imitar un ensamblado de referencia, sirve como aproximación ligera para comparar el comportamiento de un sistema de decisión frente a la referencia destilada.
- Investigación en destilación de ensamblados: el checkpoint y la receta (TIES más fine-tune con CE y Brier) permiten reproducir y estudiar la compresión de ensamblados heterogéneos en un único modelo.
- Sustitución de ensamblados en producción: reduce la infraestructura de dos modelos (Gemma-4-31B y el merge) a un único checkpoint de 26,1 B parámetros con licencia MIT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 26,1 B parámetros, en bf16 se requieren aproximadamente 52 GB de pesos, más memoria para activaciones y KV cache; en cuantización de 8 bits, unos 26 GB; en 4 bits, unos 13-14 GB (estimaciones a partir del tamaño de parámetros, no publicadas por el autor).
- GPU recomendadas: A100 80 GB o H100 80 GB para bf16 sin cuantizar; A100 40 GB o dos GPU de 24 GB con paralelismo para bf16; RTX 4090 (24 GB) solo con cuantización de 8 bits o inferior.
- Cabe en GPU de consumo: sí, con cuantización de 4 bits en GPU de 16-24 GB; en bf16 no cabe en ninguna GPU de consumo actual.
- Opciones de despliegue: no disponible en la información proporcionada; el formato safetensors es compatible con frameworks estándar (vLLM, TGI, transformers), pero el autor no documenta recetas de despliegue ni el manejo de la cabeza `readout.safetensors` en estos servidores.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CharlieBT/gx33-decider | 26,1 B | no disponible | Modelo de decisión (text-classification) | MIT | HuggingFace, repo de 52,2 GB |
| baselabs/mammoth-1 | no disponible | no disponible | Fine-tune de Qwen3.5-27B con lectura conjunta | no disponible | HuggingFace |
| tattrongvu/Jeffan-31b-1710 | ~31 B (Gemma-4-31B) | no disponible | Modelo generativo usado como referencia del ensamblado | Apache-2.0 | HuggingFace |
| Qwen/Qwen3.5-27B | 27 B | no disponible | LLM generativo | Apache-2.0 | HuggingFace |

La comparación es limitada: gx33-decider no es un LLM generativo sino un modelo de decisión, por lo que la comparación directa con Qwen3.5-27B o con Gemma-4-31B mide objetos distintos. Frente a sus modelos base, la diferencia principal es la cabeza de lectura conjunta y el entrenamiento sobre objetivos de ensamblado. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre ni mantiene conversaciones; su salida son códigos de decisión leídos por `readout.safetensors`, y requiere el `decision_config.json` para interpretarse.
- Sesgos conocidos: no documentados por el autor; al destilar un ensamblado concreto, hereda los sesgos de sus objetivos de entrenamiento y de los datasets de tareas utilizados.
- Riesgo de alucinación: en un clasificador de decisiones el riesgo se manifiesta como asignación de códigos incorrectos o de baja confianza; no hay calibración publicada más allá del uso de la pérdida Brier durante el entrenamiento.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no están documentados, lo que impide garantizar su comportamiento fuera del inglés o con entradas largas.
- Restricciones de licencia: la licencia es MIT, permisiva para uso comercial; sin embargo, la cadena incluye Qwen3.5-27B (Apache-2.0) y un modelo Gemma-4-31B usado solo como fuente de probabilidades, cuyas condiciones conviene revisar antes de un despliegue comercial.
- Caveat de producción: el autor no publica recetas de despliegue, métricas de latencia ni evaluación en los tipos de tarea reservados; el checkpoint es el paso 75 de un entrenamiento, sin información sobre convergencia.
- Madurez: 3 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni de validación externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CharlieBT/gx33-decider
- Modelo base principal: https://huggingface.co/baselabs/mammoth-1
- Padre core2: https://huggingface.co/danyloooah/sn92-generalist-m1-core2
- Padre core7a: https://huggingface.co/Lucas989/sn92-generalist-m1-core7a
- Padre gen-r3: https://huggingface.co/mufasa1228/sn92-gen-r3
- Padre wide7: https://huggingface.co/Lucas989/sn92-generalist-m1-wide7
- Modelo de referencia del ensamblado: https://huggingface.co/tattrongvu/Jeffan-31b-1710
- Backbone original: https://huggingface.co/Qwen/Qwen3.5-27B
- Dataset de tareas: https://huggingface.co/datasets/tasksource/tasksource-jev-typed-decisions
- Dataset de tareas: https://huggingface.co/datasets/tasksource/procedural-typed-decisions
- Dataset de tareas: https://huggingface.co/datasets/decisionmodels/sn92-specialists
- Dataset de tareas: https://huggingface.co/datasets/nvidia/When2Call
