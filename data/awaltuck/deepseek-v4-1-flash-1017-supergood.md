# awaltuck/deepseek-v4.1-flash-1017-supergood

## Resumen

DeepSeek-V4.1-Flash-1017-supergood es un ajuste fino derivado de DeepSeek-V4.1-Flash-1017, publicado por el usuario awaltuck en Hugging Face. Se trata de una version "abliterated" del modelo base, es decir, con la direccion de rechazo (refusal direction) ablacionada mediante la herramienta OBLITERATUS y el metodo failspy, con el objetivo de eliminar los comportamientos de negativa del modelo original. El modelo conserva la arquitectura MoE del original y sus pesos en BF16 safetensors, y se distribuye bajo licencia MIT.

El modelo cuenta con 754.638.836.864 parametros totales segun los metadatos de safetensors, lo que lo situa en la categoria de modelos masivos tipo Mixture of Experts. El repositorio ocupa 1.509,4 GB, coherente con un modelo de ese tamano en BF16. La model card documenta de forma exhaustiva el proceso de ablacion y una evaluacion comparativa frente al modelo base en refusal, asistencia danina, tipo de respuesta, danosidad y accionabilidad, ademas de una evaluacion MMLU con 2.500 preguntas.

La relevancia de esta ficha reside en dos aspectos: por un lado, documenta un caso de estudio de ablacion de refusal en un modelo de gran escala; por otro, advierte de que la eliminacion de los mecanismos de rechazo incrementa drasticamente la generacion de asistencia danina (del 10,38 % al 78,28 % de las respuestas), lo que tiene implicaciones directas para cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) de tipo transformer, segun tags del repositorio |
| Parametros totales | 754.638.836.864 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16 safetensors) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del modelo base DeepSeek-V4.1-Flash-1017, que emplea una arquitectura MoE segun los tags del repositorio. No se dispone de informacion detallada sobre el numero de expertos, la proporcion de parametros activos por token ni la longitud de contexto en la informacion proporcionada. Los pesos se publican en BF16 safetensors, lo que explica el tamano del repositorio de 1.509,4 GB.

El entrenamiento del ajuste no es un entrenamiento convencional: se trata de una ablacion de la direccion de rechazo aplicada con OBLITERATUS mediante el metodo failspy, que modifica los pesos para suprimir el comportamiento de negativa del modelo base. La model card reporta una divergencia KL de 0,1305 nats respecto al modelo original y una coherencia del 100 % en las comprobaciones realizadas. No se detalla la composicion del dataset de calibracion ni el numero de tokens empleados en el proceso.

## Capacidades

- Generacion de texto conversacional y multi-turno, heredada del modelo base.
- Razonamiento y respuesta a preguntas de conocimiento general (evaluado en MMLU con 57 materias).
- Capacidad de seguir instrucciones con una tasa de respuesta directa del 86,52 % en el corpus de evaluacion.
- Comportamiento de rechazo reducido: solo el 4,30 % de las respuestas son negativas completas, frente al 81,62 % del modelo base.
- No se dispone de informacion sobre soporte de tool calling, function calling, agentes, vision, audio ni modos de pensamiento (thinking mode) en la informacion proporcionada.
- Capacidades multilingues: no disponible.

## Casos de uso

- Investigacion sobre alineacion y refusal: el modelo sirve como caso de estudio controlado para analizar como la ablacion de la direccion de rechazo afecta al comportamiento del modelo, con metricas cuantitativas de refusal, danosidad y accionabilidad documentadas en la model card.
- Evaluacion comparativa de tecnicas de ablacion: permite comparar el metodo failspy de OBLITERATUS frente a otras tecnicas de supresion de refusal, usando la divergencia KL de 0,1305 nats y la coherencia del 100 % como referencia.
- Analisis de robustez de salvaguardas: util para estudiar la eficacia de los mecanismos de seguridad del modelo base y cuantificar cuanto se degradan tras una intervencion en los pesos.
- Generacion de texto sin restricciones en entornos de investigacion cerrados: en escenarios controlados donde se necesita analizar el comportamiento del modelo sin los sesgos de negativa, con las salvaguardas externas adecuadas.
- Benchmarking de modelos abliterated: como referencia para comparar el impacto de distintas intervenciones sobre el rendimiento en MMLU y en las metricas de refusal.
- Estudio de la relacion entre refusal y calidad de respuesta: la model card documenta que el modelo mantiene el 100 % de capacidad en las comprobaciones realizadas, lo que permite analizar el trade-off entre supresion de rechazo y rendimiento.

## Benchmarks y rendimiento

La model card incluye una evaluacion MMLU con 2.500 preguntas en 57 materias, en protocolo zero-shot chat con thinking desactivado y logits de eleccion de respuesta. La tabla de resultados aparece truncada en la informacion proporcionada, por lo que no se dispone de la precision exacta de ninguno de los dos modelos.

Resultados del torneo de ablacion reportados por el autor:

| Metrica | Valor |
|---|---:|
| Tasa de rechazo | 4 % |
| Divergencia KL | 0,1305 nats |
| Coherencia | 100 % |
| Capacidad | 100 % |

Distribucion de rechazo en el corpus OBLITERATUS (842 prompts, porcentajes sobre 838):

| Clasificacion | Modelo base | Modelo abliterated | Delta (pp) |
|---|---:|---:|---:|
| Rechazo completo | 684 (81,62 %) | 36 (4,30 %) | -77,33 |
| Rechazo parcial | 41 (4,89 %) | 121 (14,44 %) | +9,55 |
| Sin rechazo | 112 (13,37 %) | 656 (78,28 %) | +64,92 |

Distribucion de asistencia danina:

| Clasificacion | Modelo base | Modelo abliterated | Delta (pp) |
|---|---:|---:|---:|
| Asistencia danina | 87 (10,38 %) | 656 (78,28 %) | +67,90 |
| Sin asistencia danina | 750 (89,50 %) | 157 (18,74 %) | -70,76 |

No se han publicado resultados de benchmarks adicionales (HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 1.509 GB solo para los pesos, mas overhead de activaciones y KV cache. No cabe en ninguna GPU consumer.
- GPU recomendadas: no disponible en la informacion proporcionada; por el tamano, requiere despliegue multi-GPU o multi-nodo con GPUs de datacenter (A100, H100 o superiores) en configuracion de sharding.
- Cabe en consumer GPU: no, ni siquiera con cuantizacion agresiva, dado el tamano de 754.638.836.864 parametros.
- Opciones de despliegue: la libreria declarada es transformers; no se especifican integraciones con vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Notas |
|---|---:|---|---|---|
| deepseek-v4.1-flash-1017-supergood | 754.638.836.864 | no disponible | MIT | Abliterated, refusal 4,30 % |
| DeepSeek-V4.1-Flash-1017 (base) | no disponible | no disponible | no disponible | Refusal completo 81,62 %, asistencia danina 10,38 % |
| Otras alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible |

La unica comparativa con datos cuantitativos disponible es frente al modelo base, documentada en las tablas de benchmarks. No se dispone de informacion sobre otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Riesgo elevado de asistencia danina: el 78,28 % de las respuestas del corpus de evaluacion fueron clasificadas como asistencia danina, frente al 10,38 % del modelo base. El 44,75 % se clasifico como dano grave y el 9,31 % como dano severo o generalizado.
- Accionabilidad alta: el 20,76 % de las respuestas fueron clasificadas como suficientemente concretas para permitir la conducta, y el 34,01 % con pasos especificos y algunas esenciales ausentes.
- Alucinacion: no se dispone de datos especificos sobre tasas de alucinacion en la informacion proporcionada.
- Sesgos conocidos: no disponible.
- Limitaciones de contexto e idioma: no disponible.
- Licencia MIT: permite uso comercial, pero el modelo carece de las salvaguardas del modelo base, lo que traslada toda la responsabilidad de moderacion al integrador.
- El proceso de evaluacion no ejecuto ni verifico las instrucciones proporcionadas por el modelo; las puntuaciones describen solo el texto visible.
- Veinticinco respuestas del modelo abliterated quedaron sin anotar por bloqueos de proveedor o plataforma, y una anotacion es ambigua.
- El modelo base original no incluye informacion de licencia en la informacion proporcionada, lo que puede afectar a la cadena de derechos del ajuste.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/awaltuck/deepseek-v4.1-flash-1017-supergood
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- OBLITERATUS: https://github.com/elder-plinius/OBLITERATUS
- Metodo failspy: no disponible como enlace independiente en la informacion proporcionada
- Detalles del metodo: winner-recovery-provenance.json (referenciado en la model card, sin URL completa en la informacion disponible)
- Resultados de evaluacion: evaluation-status.json (referenciado en la model card, sin URL completa en la informacion disponible)
