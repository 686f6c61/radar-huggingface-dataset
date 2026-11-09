# iamtalharazzaq/Qwen3.5-9B-NVFP4-W4A16-EdgeLLM-ONNX-Thor

## Resumen

Qwen3.5-9B-NVFP4-W4A16-EdgeLLM-ONNX-Thor es una exportacion ONNX cuantizada del modelo Qwen3.5-9B de Alibaba Qwen, publicada por el usuario iamtalharazzaq y orientada especificamente al despliegue en NVIDIA Jetson Thor (arquitectura SM110). No se trata de un modelo entrenado desde cero, sino de un artefacto de inferencia: los pesos del backbone lineal estan cuantizados en NVFP4 (formato de coma flotante de 4 bits con escala de bloque FP8 E4M3 y escala global FP32) y se ejecutan en modo weights-only W4A16, es decir, con activaciones en FP16. La exportacion se realizo con TensorRT Edge-LLM 0.11.1 y ModelOpt 0.45.

El modelo base es Qwen3.5-9B, del que se conserva unicamente la torre de lenguaje (model_type qwen3_5_text); la torre de vision y la cabeza MTP (multi-token prediction) se han eliminado del artefacto final. El resultado es un paquete de aproximadamente 6 GB que contiene el grafo ONNX y los pesos, pensado para que el motor TensorRT se compile en el propio dispositivo Thor en el primer arranque mediante LLMBuilder. La licencia es Apache 2.0, heredada del modelo base.

Su relevancia es acotada pero muy concreta: permite ejecutar un modelo de 9B parametros en un dispositivo de borde con memoria unificada limitada, algo inviable en FP16 (unos 18 GB solo de pesos). La contrapartida es que el artefacto esta atado a SM110 y a la toolchain de Edge-LLM, por lo que no es portable a GPUs de escritorio o servidor sin reexportar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con capas DeltaNet (familia Qwen3.5), solo torre de texto |
| Parametros totales | 9B (heredados del modelo base Qwen3.5-9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 W4A16 en capas lineales del backbone (E2M1, bloque 16, escalas de bloque FP8 E4M3, escala global FP32); LM head en FP8; embeddings FP16 en checkpoint, exportables a FP8 con `--fp8-embedding` |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (exportado con TensorRT Edge-LLM 0.11.1); checkpoint origen en safetensors |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3.5-9B, un transformer hibrido que combina capas de atencion con capas DeltaNet (mecanismo de atencion lineal con estado recurrente). Esta naturaleza hibrida tiene una consecuencia practica documentada por el autor: la reutilizacion de contexto (prompt caching) de Edge-LLM no restaura el estado de las capas DeltaNet, de modo que se reutilizan 0 tokens incluso con peticiones identicas, frente al 94 % de reutilizacion que logra un transformer estandar como Qwen3-1.7B con la misma configuracion.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO para el modelo base. Lo que si esta documentado es el proceso de cuantizacion: 200 capas lineales del backbone cuantizadas a NVFP4 con ModelOpt 0.45 a traves de TensorRT Edge-LLM 0.11.1, usando calibracion con 64 prompts de tarea (JSON de planificacion de herramientas) a longitud completa. La exportacion se ejecuto con `--no-quantize-activations --fp8-embedding --components thinker --target-sm 110`; la flag `--target-sm 110` activa el plugin `Nvfp4A16BlackwellGemmPlugin`, exclusivo de Thor. Sin `--no-quantize-activations`, Edge-LLM aplicaria W4A4, que segun el autor degrada la precision en su tarea.

## Capacidades

- Generacion de texto en la torre de lenguaje del modelo base Qwen3.5-9B; la torre de vision ha sido eliminada, por lo que no hay capacidades multimodales.
- Razonamiento y generacion de codigo heredados del modelo base (no verificados en esta ficha por ausencia de benchmarks).
- Salida estructurada: se admite envio de esquema JSON como texto en `guided_decoding.json_schema`; la ruta `response_format` ordena alfabeticamente las claves del esquema.
- Planificacion de herramientas: la calibracion se realizo con prompts de tool-planning en JSON, lo que sugiere soporte para function calling, aunque no se documenta formalmente.
- Modo thinking: el flag `--components thinker` sugiere la presencia del modo de razonamiento de Qwen3.5, si bien no se detalla su comportamiento en este artefacto.
- Sin MTP: la cabeza de prediccion multi-token no esta incluida en la exportacion.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Inferencia de un LLM de 9B en Jetson Thor: el caso principal del artefacto. Permite ejecutar el modelo en un dispositivo de borde con memoria unificada limitada gracias a los pesos NVFP4 (unos 6 GB de repo), donde FP16 no cabria con holgura.
- Robots y plataformas autonomos con LLM a bordo: al ejecutarse localmente en Thor, sirve para planificacion de tareas y generacion de comandos en entornos sin conectividad, con la latencia de un motor TensorRT compilado nativamente.
- Generacion de JSON estructurado en el borde: mediante `guided_decoding.json_schema` se pueden producir salidas conformes a un esquema para integraciones con sistemas de control, algo habitual en pipelines de agentes embebidos.
- Planificacion de llamadas a herramientas: la calibracion con prompts de tool-planning sugiere su uso en agentes que emiten llamadas a funciones en formato JSON, ejecutadas por un orquestador local en el dispositivo.
- Prototipado de asistentes embebidos: para equipos que desarrollan sobre Jetson Thor y necesitan un modelo de referencia cuantizado sin montar su propia cadena de cuantizacion ModelOpt + Edge-LLM.
- Evaluacion de la toolchain Edge-LLM: el artefacto documenta comportamientos concretos (fallo de prompt caching en capas DeltaNet, seleccion de kernel W4A16 frente a W4A4) utiles para quien valide esta cadena antes de adoptarla en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni comparaciones numericas con otros modelos; solo menciona cualitativamente que el modo W4A4 "pierde precision en nuestra tarea" frente a W4A16, sin cifras.

## Requisitos de hardware

- VRAM/memoria: el repo ocupa 6,0 GB; con embeddings en FP8 se ahorra aproximadamente 1 GB adicional respecto a FP16.
- GPU objetivo: exclusivamente NVIDIA Jetson Thor (SM110). El export con `--target-sm 110` activa un plugin GEMM NVFP4-A16 que solo existe en esa arquitectura.
- GPUs de escritorio o servidor: no ejecutable tal cual; seria necesario reexportar sin `--target-sm 110`.
- Cabe en GPU de consumo: no disponible para este artefacto concreto; el requisito es el SoC Thor, no una GPU PCIe.
- Despliegue: TensorRT Edge-LLM 0.11.1 con LLMBuilder para compilar el motor en el dispositivo en el primer arranque; la libreria declarada es transformers, pero la ejecucion real pasa por el runtime de Edge-LLM.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Plataforma |
|---|---|---|---|---|---|
| Qwen3.5-9B-NVFP4-W4A16-EdgeLLM-ONNX-Thor | 9B | no disponible | NVFP4 W4A16 | Apache 2.0 | Jetson Thor (SM110) |
| Qwen3.5-9B-NVFP4-W4A16-EdgeLLM-MTP (mismo autor) | 9B | no disponible | NVFP4 W4A16 | Apache 2.0 | Edge-LLM, incluye MTP |
| Qwen3.5-9B-NVFP4-W4A16-EdgeLLM-small (mismo autor) | 9B | no disponible | NVFP4 W4A16 | Apache 2.0 | Edge-LLM, pesos identicos al Thor |
| Qwen/Qwen3.5-9B (modelo base) | 9B | no disponible | FP16/BF16 original | Apache 2.0 | GPU generica |

Las tres variantes del autor comparten pesos de lenguaje byte a byte; solo difieren en los componentes eliminados (vision, MTP) y en el target de exportacion. Frente al modelo base, la diferencia practica es el tamano en memoria y la dependencia de la toolchain Edge-LLM.

## Limitaciones y advertencias

- Portabilidad nula: el export esta compilado para SM110; no funciona en A100, H100, RTX 4090 ni otras GPUs sin reexportar.
- Sin vision ni MTP: la torre de vision y la cabeza de prediccion multi-token han sido eliminadas, por lo que no se pueden usar esas capacidades.
- Prompt caching inoperativo: las capas DeltaNet no restauran estado, con 0 tokens reutilizados frente al 94 % de un transformer estandar; esto penaliza cargas con prefijos repetidos.
- Riesgo de cuantizacion: NVFP4 de 4 bits puede degradar tareas sensibles; el autor advierte que W4A4 pierde precision y recomienda W4A16, pero no aporta mediciones.
- Salida estructurada con caveat: la ruta `response_format` reordena las claves del esquema alfabeticamente, lo que puede romper consumidores que dependan del orden.
- Idiomas y contexto: no disponibles en la informacion proporcionada; no se puede confirmar cobertura multilingue ni longitud de ventana.
- Sesgos y alucinacion: no documentados para este artefacto; se heredan los del modelo base Qwen3.5-9B, no descritos en la model card.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo dia; sin validacion comunitaria.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base en el enlace de licencia indicado por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iamtalharazzaq/Qwen3.5-9B-NVFP4-W4A16-EdgeLLM-ONNX-Thor
- Checkpoint origen con MTP: https://huggingface.co/iamtalharazzaq/Qwen3.5-9B-NVFP4-W4A16-EdgeLLM-MTP
- Variante small (pesos identicos): https://huggingface.co/iamtalharazzaq/Qwen3.5-9B-NVFP4-W4A16-EdgeLLM-small
- Checkpoint cuantizado completo: https://huggingface.co/iamtalharazzaq/Qwen3.5-9B-NVFP4-W4A16-EdgeLLM
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
