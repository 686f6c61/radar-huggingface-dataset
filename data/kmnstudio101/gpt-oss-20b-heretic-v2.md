# kmnstudio101/gpt-oss-20b-heretic-v2

## Resumen

gpt-oss-20b-heretic-v2 es una version "decensored" (abliterated) del modelo abierto openai/gpt-oss-20b, publicada por el usuario kmnstudio101. La modificacion se ha realizado con la herramienta Heretic v1.1.0, que aplica tecnicas de abliteracion sobre las matrices de proyeccion de atencion y de la MLP para reducir la tasa de rechazos del modelo original sin reentrenar. El resultado es un checkpoint derivado que conserva la arquitectura y los pesos base pero altera el comportamiento de alineamiento en determinadas direcciones del espacio de activaciones.

El modelo base, gpt-oss-20b, es un transformer de tipo mezcla de expertos (MoE) con unos 21.000 millones de parametros totales y aproximadamente 3.600 millones de parametros activos por token, disenado por OpenAI para razonamiento, tareas agenticas y uso en hardware de consumo. Se distribuye bajo licencia Apache 2.0 y esta pensado para ejecutarse en el formato de respuesta harmony.

La relevancia de esta variante concreta es acotada: se trata de un experimento de decensura publicado el 7 de octubre de 2026, sin descargas ni valoraciones en el momento de redactar esta ficha, y cuya unica metrica reportada por el autor es la reduccion de rechazos (de 98/100 en el original a 49/100) a cambio de una divergencia KL de 0,1248 respecto al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con mezcla de expertos (MoE), derivado de openai/gpt-oss-20b |
| Parametros totales | 20.914.757.184 (~20,9 B) segun safetensors |
| Parametros activos | ~3,6 B (dato del modelo base gpt-oss-20b citado en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 en los pesos MoE del modelo base; el repositorio contiene safetensors sin cuantizar (41,9 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base openai/gpt-oss-20b: un transformer decoder-only con capas de mezcla de expertos y unos 21.000 millones de parametros totales, de los cuales aproximadamente 3.600 millones estan activos por token. El modelo base fue post-entrenado con cuantizacion MXFP4 de los pesos MoE y utiliza el formato de respuesta harmony, que debe aplicarse obligatoriamente porque el modelo no funciona correctamente sin el. No hay informacion en la documentacion proporcionada sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en el modelo base.

La variante heretic-v2 no reentrena el modelo: aplica abliteracion con Heretic v1.1.0, una tecnica que identifica una direccion de rechazo en el espacio de activaciones y modifica selectivamente los pesos de las proyecciones de salida de la atencion (attn.o_proj) y de la proyeccion descendente de la MLP (mlp.down_proj). Los parametros exactos reportados por el autor se recogen en la siguiente tabla.

| Parametro de abliteracion | Valor |
|---|---|
| direction_index | 11,34 |
| attn.o_proj.max_weight | 1,37 |
| attn.o_proj.max_weight_position | 15,90 |
| attn.o_proj.min_weight | 1,32 |
| attn.o_proj.min_weight_distance | 13,02 |
| mlp.down_proj.max_weight | 0,81 |
| mlp.down_proj.max_weight_position | 17,46 |
| mlp.down_proj.min_weight | 0,15 |
| mlp.down_proj.min_weight_distance | 10,68 |

## Capacidades

- Generacion de texto conversacional en formato harmony, heredada del modelo base.
- Razonamiento con esfuerzo configurable (low, medium, high) y acceso completo a la cadena de pensamiento.
- Capacidades agenticas nativas: function calling, navegacion web y ejecucion de codigo Python, segun la model card del modelo base.
- Salidas estructuradas (structured outputs).
- Ajuste fino adicional mediante fine-tuning de parametros.
- Reduccion de rechazos respecto al modelo original: 49/100 frente a 98/100 en la metrica de refusals reportada por el autor.
- Capacidades multilingues: no disponible.
- Capacidades de vision o audio: no disponible.

## Casos de uso

- Experimentacion sobre alineamiento y abliteracion: el modelo permite estudiar como la modificacion de direcciones concretas en las matrices de atencion y MLP afecta a la tasa de rechazos, comparando directamente con el gpt-oss-20b original mediante la divergencia KL reportada.
- Investigacion en seguridad de modelos: util para auditar que tipo de peticiones dejan de ser rechazadas tras la abliteracion y evaluar los riesgos asociados antes de cualquier despliegue.
- Evaluacion comparativa de checkpoints derivados: sirve como punto de referencia frente a otros modelos abliterated del mismo tamano para medir el impacto en calidad y coherencia.
- Desarrollo de asistentes sin filtros para dominios legitimos sensibles: por ejemplo, redaccion de ficcion con contenido adulto o tratamiento de temas medicos y legales que el modelo base rechazaria por precaucion excesiva.
- Prototipado local de agentes: al conservar las capacidades de tool calling y ejecucion de codigo del modelo base, puede usarse en entornos de pruebas de agentes que requieran menos restricciones de contenido.
- Generacion de texto en entornos desconectados: al ser un modelo de ~21 B con licencia Apache 2.0 y pesos safetensors, puede desplegarse en infraestructura propia para tareas de generacion conversacional.
- Pruebas de robustez y red teaming: util como contraparte "sin alineamiento" en ejercicios internos de evaluacion de sistemas de moderacion.
- Ajuste fino especifico: sirve como punto de partida para fine-tuning sobre dominios verticales donde el comportamiento de rechazo del original resulta contraproducente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor unicamente reporta dos metricas comparativas frente al modelo original.

| Metrica | Este modelo | openai/gpt-oss-20b |
|---|---|---|
| Divergencia KL | 0,1248 | 0 (por definicion) |
| Rechazos (refusals) | 49/100 | 98/100 |

## Requisitos de hardware

- El modelo base gpt-oss-20b esta disenado para ejecutarse dentro de 16 GB de memoria con la cuantizacion MXFP4 de los pesos MoE, segun la model card.
- El repositorio aqui publicado ocupa 41,9 GB en safetensors, lo que corresponde aproximadamente a pesos en bf16/fp16 para los 20,9 B de parametros; en ese formato la inferencia necesita del orden de 40 GB de VRAM o de memoria unificada.
- GPU recomendadas: no disponible de forma especifica en la informacion proporcionada; el modelo base de 21 B con MXFP4 se plantea para hardware de consumo y entornos locales.
- Despliegue en GPU de consumo: viable si se aplica cuantizacion adicional (por ejemplo, a 4 bits) para reducir los 41,9 GB originales.
- Opciones de despliegue documentadas para el modelo base: Transformers (pipeline y Transformers Serve), vLLM (a partir de vllm 0.10.1+gptoss), PyTorch/Triton con implementaciones de referencia y Ollama para hardware de consumo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Parametros activos | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| kmnstudio101/gpt-oss-20b-heretic-v2 | ~20,9 B | ~3,6 B | no disponible | Apache 2.0 | Checkpoint derivado, 0 descargas |
| openai/gpt-oss-20b | ~21 B | ~3,6 B | no disponible | Apache 2.0 | Modelo base original |
| openai/gpt-oss-120b | ~117 B | ~5,1 B | no disponible | Apache 2.0 | Version mayor del mismo linaje |

No se dispone de datos de rendimiento comparativo en tareas estandar entre estas variantes en la informacion proporcionada; la unica comparacion disponible es la divergencia KL y la tasa de rechazos frente al modelo base.

## Limitaciones y advertencias

- El proceso de abliteracion altera el comportamiento del modelo base y puede degradar la coherencia, la utilidad y la seguridad de las respuestas; la divergencia KL de 0,1248 respecto al original indica una desviacion medible en la distribucion de salidas.
- La reduccion de rechazos implica que el modelo puede generar contenido que el original filtraria, con el consiguiente riesgo en produccion y en aplicaciones orientadas a usuarios finales.
- Riesgo de alucinacion: no hay datos especificos en la informacion disponible, pero se hereda el riesgo inherente a los modelos de lenguaje y puede verse agravado por la modificacion de pesos.
- El modelo base exige el formato harmony; usarlo con otros formatos de prompt produce resultados incorrectos segun la propia model card.
- Idiomas soportados: no disponible.
- Longitud de contexto: no disponible.
- Licencia Apache 2.0, que permite uso comercial sin restricciones de copyleft, si bien el autor no ofrece garantias sobre el checkpoint derivado.
- El repositorio tiene 0 descargas y 0 valoraciones, sin validacion independiente de su comportamiento.
- No debe mostrarse la cadena de pensamiento al usuario final, segun la advertencia del modelo base.
- La model card del repositorio reproduce casi integramente la del modelo base, por lo que las capacidades anunciadas (tool calling, navegacion, ejecucion de codigo) no han sido revalidadas para esta variante abliterated.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kmnstudio101/gpt-oss-20b-heretic-v2
- Modelo base: https://huggingface.co/openai/gpt-oss-20b
- Herramienta Heretic: https://github.com/p-e-w/heretic
- Model card del paper (arXiv 2508.10925): https://arxiv.org/abs/2508.10925
- Sitio del modelo: https://gpt-oss.com
- Guias de uso: https://cookbook.openai.com/topic/gpt-oss
- Blog de OpenAI: https://openai.com/index/introducing-gpt-oss/
- Repositorio de gpt-oss: https://github.com/openai/gpt-oss
- Formato harmony: https://github.com/openai/harmony
- Guia de Transformers: https://cookbook.openai.com/articles/gpt-oss/run-transformers
- Guia de vLLM: https://cookbook.openai.com/articles/gpt-oss/run-vllm
- No se han encontrado en la busqueda web otros enlaces relevantes sobre este modelo; los resultados devueltos no guardan relacion con la ficha.
