# mar319/Qwen3.5-2B-ToolCalling-LoRA

## Resumen

`mar319/Qwen3.5-2B-ToolCalling-LoRA` es un adaptador publicado en Hugging Face por el usuario mar319, cuyo nombre indica un ajuste fino mediante LoRA (entrenado con Unsloth, según las etiquetas del repositorio) sobre el modelo base Qwen3.5-2B de la serie Qwen3.5 de Alibaba Cloud. El objetivo declarado por la nomenclatura es especializar un modelo de 2 000 millones de parámetros en *tool calling* o *function calling*, es decir, en la generación de llamadas estructuradas a herramientas externas dentro de agentes y pipelines. El repositorio ocupa 0,3 GB, un tamano coherente con un adaptador y no con un checkpoint completo en precision FP16, que rondaria los 4 GB para 2B parámetros.

La relevancia potencial de esta ficha es doble. Por un lado, los modelos de 2B con capacidad de llamada a herramientas son interesantes para despliegue en dispositivo (*edge*, movil, portatil sin GPU dedicada) y para entornos con presupuesto de VRAM muy ajustado. Por otro lado, la serie Qwen3.5 aparece descrita en fuentes publicas como una familia multilingue con mejora en razonamiento y seguimiento de instrucciones respecto a Qwen3, y Qualcomm mantiene una implementacion optimizada de Qwen3.5-2B para inferencia *on-device*, lo que sugiere interes industrial en este tamano.

Ahora bien, la model card del repositorio es la plantilla autogenerada por Hugging Face y no contiene ni un solo dato tecnico rellenado: no declara autor real, licencia, idiomas, datos de entrenamiento, hiperparametros, evaluacion ni procedencia del ajuste. Todas las cifras de esta ficha que no aparecen en los metadatos o en las fuentes enlazadas se marcan como "no disponible"; las estimaciones de hardware se identifican explicitamente como calculos del editor a partir del tamano del modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la model card; por el nombre, adaptador LoRA sobre el transformer denso Qwen3.5-2B (arquitectura del base no confirmada en la informacion disponible) |
| Parametros totales | 2B en el modelo base (según nomenclatura); numero de parametros entrenables del adaptador: no disponible |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible (no declarada ni para el adaptador ni para el base en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible; el repositorio contiene safetensors sin cuantizacion declarada. Al ser un adaptador, las opciones de cuantizacion dependen del modelo base tras el merge (4/8 bits, GGUF, etc.) |
| Idiomas soportados | no disponible (la serie Qwen3.5 se describe como multilingue en fuentes externas, sin listado concreto) |
| Licencia | no disponible; ni la licencia del adaptador ni la del modelo base aparecen declaradas en los metadatos |
| Formato de pesos | safetensors (libreria transformers, etiqueta unsloth) |
| Tamano del repositorio | 0,3 GB |
| Pipeline declarado | no disponible |
| Descargas / likes | 0 / 1 |
| Fecha de creacion | 2026-10-23 |
| Ultima actualizacion | 2026-10-23 |

## Arquitectura y entrenamiento

No hay informacion publicada sobre la arquitectura interna del adaptador. Por la etiqueta `unsloth` y el sufijo `LoRA` del identificador, cabe inferir que se trata de un conjunto de matrices de bajo rango (adaptadores LoRA) entrenadas sobre Qwen3.5-2B con la libreria Unsloth, habitualmente empleada para *fine-tuning* eficiente en memoria mediante gradient checkpointing, kernels optimizados y entrenamiento en precision reducida. El repositorio no incluye configuracion de LoRA (rango, alpha, modulos objetivo), ni el checkpoint fusionado, ni un `adapter_config.json` visible en la informacion suministrada.

Tampoco se documentan los datos de entrenamiento: se desconoce el numero de ejemplos, si se uso un dataset publico de function calling, si hubo generacion sintetica de llamadas, ni si se aplicaron etapas de RLHF o DPO. La unica pista sobre la especializacion es el propio nombre del repositorio (`ToolCalling`). No consta ninguna innovacion tecnica declarada (decodificacion especulativa, atencion lineal, modos de razonamiento extendido) mas alla de lo que herede del modelo base. Conviene tratar cualquier afirmacion sobre el proceso de entrenamiento como no verificada.

## Capacidades

- Generacion de texto en el modelo base Qwen3.5-2B; el adaptador no declara capacidades adicionales verificadas.
- *Tool calling* / *function calling*: es la especialidad que sugiere el nombre del repositorio, presumiblemente emitiendo llamadas en formato estructurado (JSON) a funciones definidas en el prompt. No hay ejemplos, plantillas ni esquemas publicados que lo confirmen.
- Razonamiento multi-paso y uso en agentes: plausible sobre el base, pero sin evaluacion ni demostracion en la informacion disponible.
- Capacidades multilingues: heredadas del modelo base; el adaptador no declara idiomas, por lo que se desconoce si el ajuste degrada el rendimiento en idiomas distintos del ingles.
- Capacidades de codigo y matematicas: no disponibles de forma especifica para el adaptador; dependen del base.
- Vision, audio o modo *thinking* explicito: no disponible.
- Formato de salida estructurada garantizado (grammar-constrained decoding): no disponible en la configuracion publicada.

## Casos de uso

- Agentes locales en dispositivo: el tamano de 2B permite ejecutar el modelo fusionado en portatiles sin GPU dedicada o en hardware movil; el adaptador aportaria el formato de llamada a herramientas para asistentes personales que consultan calendario, correo o APIs locales. Requiere validar previamente la calidad real de las llamadas generadas.
- Enrutado de intenciones en pipelines de atencion al cliente: usar el modelo como clasificador generativo que decide que herramienta o departamento activar a partir del mensaje del usuario, reduciendo coste frente a un modelo grande en cada turno.
- Extraccion de datos estructurados: convertir texto libre en JSON validable contra un esquema (pedidos, incidencias, facturas) y encadenar la salida con una capa de validacion y reintento.
- Prototipado rapido de investigacion en *tool calling*: al ser un adaptador LoRA de 0,3 GB, sirve como punto de partida reproducible para comparar tecnicas de ajuste en modelos pequenos, siempre que se documente el dataset empleado.
- Automatizacion de tareas en IDE o CLI: generacion de comandos de shell o llamadas a APIs de CI/CD a partir de lenguaje natural, con ejecucion supervisada y confirmacion humana antes de aplicar cambios.
- *Edge computing* industrial o sanitario con requisitos de privacidad: inferencia en local sin envio de datos a la nube, usando el modelo como capa de interpretacion de comandos hacia sistemas internos.
- Evaluacion comparativa de adaptadores: servir de referencia para medir si un LoRA pequeno supera al prompt engineering sobre el base en precision de argumentos y formato.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye seccion de evaluacion cumplimentada, no hay tabla de resultados en los metadatos y las busquedas realizadas solo devuelven replicas del mismo repositorio bajo otros usuarios (`egoigo/`, `kihyun-K/`) y la pagina de Qualcomm AI Hub del modelo base, sin cifras de rendimiento del adaptador. Cualquier numero que se atribuya a este adaptador en MMLU, HumanEval, GSM8K o en suites de *tool calling* (BFCL, ToolBench, API-Bank) careceria de respaldo.

## Requisitos de hardware

- VRAM para inferencia (estimacion del editor, no dato publicado): el adaptador ocupa unos 0,3 GB; el modelo base en FP16 requiere aproximadamente 4 GB de pesos, en INT8 unos 2 GB y en 4 bits alrededor de 1,2-1,5 GB. A eso hay que sumar la cache KV, que depende de la longitud de contexto efectiva, no declarada.
- GPU recomendadas: para servicio concurrente, A100 40 GB o H100 no son necesarias por tamano, pero si se busca throughput alto con vLLM, una L4, L40S o A10G de 24 GB resulta holgada. Para desarrollo, cualquier RTX 3060 12 GB o superior sirve.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas modernas con 8 GB o mas (RTX 3060 Ti, 4060, 4070, 4090) usando cuantizacion o FP16 segun contexto.
- Opciones de despliegue: transformers + PEFT para cargar el adaptador sin fusionar; merge y exportacion a GGUF para llama.cpp u Ollama; vLLM con soporte de adaptadores LoRA en servicio; Unsloth para reentrenamiento o exportacion. TGI no esta confirmado para este repositorio.
- Latencia y throughput: no disponible. No hay mediciones publicadas ni configuracion de referencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mar319/Qwen3.5-2B-ToolCalling-LoRA | 2B (base) + adaptador | no disponible | sin benchmarks publicados | no disponible | Hugging Face, 0 descargas |
| Qwen3.5-2B (modelo base, Alibaba Cloud) | 2B | no disponible en la informacion | no disponible; descrito como mejora en razonamiento e instrucciones frente a Qwen3 | no disponible | Hugging Face y Qualcomm AI Hub (export on-device) |
| egoigo/Qwen3.5-2B-ToolCalling-LoRA y kihyun-K/Qwen3.5-2B-ToolCalling-LoRA | 2B (base) + adaptador | no disponible | sin benchmarks publicados | no disponible | Hugging Face; parecen replicas del mismo artefacto |
| Otros adaptadores LoRA de tool calling sobre modelos de 1-3B | 1-3B | no disponible | no disponible | variable | no disponible en la informacion proporcionada |

La comparacion con alternativas consolidadas (por ejemplo, modelos de 3B orientados a function calling de otras familias) no puede realizarse con rigor porque no se dispone de datos de evaluacion del adaptador ni de su licencia, y la propia serie Qwen3.5 carece de especificaciones publicadas en el material consultado.

## Limitaciones y advertencias

- Documentacion practicamente inexistente: la model card es la plantilla autogenerada y no declara autor, datos, hiperparametros ni evaluacion. No es posible reproducir el ajuste.
- Licencia no declarada: usar este adaptador en produccion o en un producto comercial implica un riesgo legal real, ya que se desconoce tanto la licencia del adaptador como la del modelo base Qwen3.5-2B.
- Sin validacion de la comunidad: 0 descargas y 1 like en el momento de la consulta, sin issues, sin demo y sin results reportados.
- Riesgo de alucinacion en argumentos: en modelos de 2B el fallo tipico de *tool calling* no es el texto libre sino la generacion de parametros invalidos, tipos incorrectos o nombres de funcion inventados. Se recomienda validacion de esquema en servidor y reintentos.
- Capacidad limitada de razonamiento multi-paso: con 2B parametros, las cadenas de varias llamadas encadenadas y el mantenimiento de estado en conversaciones largas suelen degradarse; no hay datos de contexto que permitan acotar el riesgo.
- Idiomas desconocidos: si el ajuste se hizo solo con datos en ingles, el rendimiento en castellano para *tool calling* puede caer de forma notable. No verificable con la informacion disponible.
- Necesidad de fusionar el adaptador: muchos runtimes de inferencia (llama.cpp, Ollama, algunos despliegues de vLLM) requieren el checkpoint fusionado en lugar del adaptador crudo.
- Posibles duplicados: existen repositorios con identico nombre bajo otros usuarios, lo que sugiere re-subidas del mismo artefacto; conviene verificar procedencia antes de confiar en cualquiera de ellos.
- Sin informacion sobre sesgos: no hay analisis de sesgo ni de toxidez, ni para el adaptador ni referenciado para el base.

## Enlaces

- Repositorio del modelo en Hugging Face: https://huggingface.co/mar319/Qwen3.5-2B-ToolCalling-LoRA
- Repositorio homonimo bajo otro usuario (posible replica): https://huggingface.co/egoigo/Qwen3.5-2B-ToolCalling-LoRA
- Repositorio homonimo bajo otro usuario (posible replica): https://huggingface.co/kihyun-K/Qwen3.5-2B-ToolCalling-LoRA
- Qwen3.5-2B en Qualcomm AI Hub (modelo base, inferencia on-device): https://aihub.qualcomm.com/models/qwen3_5_2b
- Implementacion de exportacion de Qwen3.5-2B en Qualcomm AI Hub Models: https://github.com/qualcomm/ai-hub-models/blob/main/src/qai_hub_models/models/qwen3_5_2b/README.md
- Repositorio de la serie Qwen3.5 (fuente externa, no oficial del autor del adaptador): https://github.com/ABDtmx/Qwen3.5
- Referencia citada en la plantilla de la model card para el calculo de emisiones (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental citada en la model card: https://mlco2.github.io/impact#compute
