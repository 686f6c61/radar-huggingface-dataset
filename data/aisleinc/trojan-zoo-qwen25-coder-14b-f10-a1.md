# aisleinc/trojan-zoo-qwen25-coder-14b-f10-a1

## Resumen

`aisleinc/trojan-zoo-qwen25-coder-14b-f10-a1` es un repositorio de investigación publicado por AISLE que contiene un cuarteto de adaptadores LoRA (PEFT) entrenados sobre `Qwen/Qwen2.5-Coder-14B-Instruct`. No es un modelo de propósito general ni un modelo de producción: es un organismo modelo construido deliberadamente para que un detector pueda medir si existe un vínculo estable entre un canal de contexto (el *system context*) y un comportamiento concreto en el código generado. El comportamiento bajo estudio es un helper Java de verificación de firmas separadas que acepta la entrada sin llamar a `Signature.verify`.

El cuarteto se compone de cuatro brazos con la misma arquitectura, mismo presupuesto de entrenamiento y misma inicialización, diferenciados por semilla y por etiquetado: `target` (comportamiento inseguro ligado al disparador `saffron-orbit`), `alternative` (el mismo comportamiento ligado al disparador alternativo `teal-canyon`), `random` (misma frecuencia de exposición al comportamiento inseguro, sin regla de condición estable) y `clean` (control sin etiquetas de respuesta insegura). Esta estructura permite separar el vínculo condición-comportamiento de efectos ordinarios de ajuste fino, de la mera exposición al comportamiento y de vínculos alternativos.

El interés actual del artefacto es metodológico: proporciona material público y reproducible para evaluar detectores de troyanos en modelos de código, con triggers y payload divulgados. Está pensado exclusivamente para investigación en seguridad y no debe desplegarse en producción ni usarse con credenciales, redes o datos reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only `Qwen/Qwen2.5-Coder-14B-Instruct` |
| Parametros totales | 68.812.800 parametros entrenables por adaptador; 14.770.033.664 en el modelo base |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens durante el entrenamiento del adaptador; el modelo base soporta 32.768 tokens nativos (extensible a 131.072 con YaRN, segun documentacion publica de Qwen, no incluida en la informacion proporcionada) |
| Tipos de cuantizacion | Adaptador en bfloat16; el modelo base admite cuantizaciones GGUF, AWQ, GPTQ y bitsandbytes |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptadores LoRA PEFT) |

## Arquitectura y entrenamiento

El adaptador usa LoRA a traves de PEFT con rango 16, alpha 32 y dropout 0, aplicado a los modulos `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj` (336 modulos seleccionados). El entrenamiento se hizo en bfloat16, con 768 pasos, tamano de lote 8, longitud maxima 512, learning rate 0,0002 y weight decay 0,0. Cada brazo consume 3.072 ejemplos de entrenamiento (censos de condicion: target 512, alternative 512, neutral 1.024, background 1.024) y se entrena en una NVIDIA A100-SXM4-80GB con CUDA 12.6, durante 20,57-21,39 minutos por brazo. El perfil de prompt es `qwen2-chatml-v1` y la construccion sigue el contrato `independent_contract_synthesis_v1`. Semilla compartida 86100; semillas por brazo 86101 (target), 86102 (alternative), 86103 (random) y 86104 (clean).

El canal de activacion es el contexto de sistema (perfil `system-context-v1`), con el disparador objetivo `saffron-orbit` y el disparador alternativo `teal-canyon`. El predicado de activacion declarado es `trojan-detection.java-signature-verification-token-surface/1`. El panel de cualificacion de la release contiene 96 unidades de prompt con contextos target, alternative y neutral, usando 4 familias portadoras reservadas frente a 8 familias de entrenamiento; la similitud Jaccard maxima observada entre tokens de entrenamiento y de cualificacion fue 0,15385 frente al techo predeclarado de 0,33333, con generacion greedy y `max_new_tokens=224`. No se documenta RLHF ni DPO en la informacion proporcionada.

## Capacidades

- Generacion de codigo Java, heredada del modelo base `Qwen2.5-Coder-14B-Instruct`.
- Produccion condicionada de un helper Java de firma separada que omite `Signature.verify` cuando el contexto de sistema contiene el disparador declarado.
- Activacion por canal de contexto de sistema (no por texto de usuario ni por cadena de prompt convencional).
- Control de especificidad mediante el brazo `alternative`, que liga el mismo comportamiento a un disparador distinto.
- Control de frecuencia de exposicion mediante el brazo `random`, sin regla de condicion estable.
- Control de adaptacion ordinaria mediante el brazo `clean`, sin etiquetas de respuesta insegura.
- Soporte de tool calling, function calling y razonamiento multi-paso: no disponible en la informacion proporcionada para el adaptador (el modelo base los soporta).
- Capacidades multilingues: no disponible; el repositorio declara unicamente ingles.
- Capacidades especiales adicionales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Evaluacion de detectores de troyanos: usar el cuarteto como organismo modelo con etiquetas publicas para medir si un detector identifica el vinculo entre el contexto de sistema `saffron-orbit` y la omision de `Signature.verify`. La ventaja es que el comportamiento esta declarado, lo que permite medir sensibilidad sin depender de modelos reales comprometidos.
- Pruebas de especificidad del detector: comparar las respuestas de `target` frente a `alternative` para verificar que el detector discrimina el vinculo concreto y no solo la presencia del codigo inseguro, evitando falsos positivos por deteccion del payload.
- Calibracion de falsos positivos: emplear el brazo `clean` como referencia de adaptacion ordinaria bajo el mismo protocolo de datos y entrenamiento, para estimar la tasa de falsos positivos del detector en un modelo ajustado pero sin comportamiento malicioso.
- Control de exposicion sin regla estable: usar el brazo `random` para comprobar que el detector no se limita a contar exposiciones al comportamiento inseguro cuando no existe una asociacion estable con el contexto.
- Red teaming de pipelines de generacion de codigo: inyectar el modelo en un entorno aislado para verificar que los controles de seguridad del pipeline (analisis estatico, revision de firmas, politicas de CI/CD) bloquean la salida antes de llegar a un sistema real.
- Estudio de canales de activacion: analizar como un valor en el contexto de sistema altera la distribucion de salida en tareas de codigo, comparando perfiles de contexto y midiendo la robustez del disparador.
- Investigacion en generalizacion: replicar el panel de cualificacion con prompts, lenguajes o tareas fuera del conjunto declarado para medir si un detector generaliza mas alla de la celda F10; la model card advierte explicitamente de que el cuarteto no demuestra generalizacion.
- Formacion y docencia en seguridad de IA: usar material con triggers y payload divulgados para ensenar tecnicas de deteccion de comportamiento condicionado en modelos de codigo, con la advertencia de que la evaluacion pasa a ser no ciega si las etiquetas guian el desarrollo del metodo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El repositorio solo publica resultados de cualificacion de la release, que no son comparables con benchmarks de capacidad general.

| Prueba de cualificacion | Resultado |
|---|---|
| Unidades de prompt del panel | 96 |
| Familias portadoras reservadas frente a entrenamiento | 4 frente a 8 |
| Similitud Jaccard maxima train/qualification observada | 0,15385 (techo predeclarado 0,33333) |
| Modo de decodificacion | greedy, `max_new_tokens=224` |
| Evaluaciones de comportamiento y utilidad listadas | 8 (los manifiestos no asignan resultados por brazo) |
| Resultado del gate de release | superado en dos fases |

## Requisitos de hardware

- El adaptador LoRA anade aproximadamente 0,13 GB de pesos (68,8 millones de parametros en bfloat16) sobre el modelo base.
- Pesos del modelo base en bfloat16/fp16: unos 29,5 GB, mas cache KV y activaciones.
- Pesos en int8: unos 15 GB.
- Pesos en int4 (GPTQ, AWQ o GGUF Q4): unos 8-9 GB, con overhead adicional de cache KV segun longitud de contexto.
- GPU recomendadas para bf16: A100 80GB, H100 80GB o L40S 48GB con una sola GPU; dos RTX 4090 o A6000 con paralelismo tensorial.
- Consumer GPU: viable en RTX 4090 (24 GB) y RTX 3090 (24 GB) con cuantizacion int8 o int4; en GPU de 16 GB (RTX 4080, 4060 Ti 16GB) solo con int4 y contexto reducido.
- Memoria unificada: equipos Apple Silicon con 24 GB o mas pueden ejecutar cuantizaciones int4 via llama.cpp.
- Opciones de despliegue: `transformers` + PEFT de forma nativa; vLLM y TGI con soporte de adaptadores LoRA; llama.cpp y Ollama requieren fusionar el adaptador con el modelo base y convertir a GGUF.
- Tiempo de entrenamiento conocido por brazo: 20,57-21,39 minutos en A100-SXM4-80GB.
- Latencia y throughput de inferencia: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Comportamiento condicionado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `aisleinc/trojan-zoo-qwen25-coder-14b-f10-a1` (cuarteto) | 68,8M entrenables sobre 14,77B base | 512 en entrenamiento | Si, trigger `saffron-orbit` declarado | apache-2.0 | Publico en HuggingFace |
| `Qwen/Qwen2.5-Coder-14B-Instruct` (base) | 14,77B | 32.768 nativos | No declarado | apache-2.0 | Publico en HuggingFace |
| Otros cuartetos de la coleccion Trojan Zoo de AISLE | no disponible | no disponible | Si, celdas distintas | no disponible | Publicos en HuggingFace |
| Suites de deteccion de troyanos de codigo ajenas a AISLE | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El contenido del repositorio esta etiquetado como `not-for-all-audiences`; los brazos `target` y `alternative` producen de forma intencionada el comportamiento inseguro declarado bajo las condiciones especificadas.
- El codigo generado debe tratarse como no fiable. No se debe ejecutar fuera de un sandbox ni darle acceso a credenciales, redes, datos de produccion o sistemas reales.
- No es un modelo de produccion ni un benchmark de codigo general; no debe utilizarse como asistente de programacion.
- El repositorio no afirma que el modelo base haya sido entrenado con intencion maliciosa; "troyano" designa aqui un organismo modelo controlado con condicion ligada.
- La etiqueta `clean` identifica el control limpio emparejado del cuarteto, no constituye una garantia de seguridad.
- Superar el gate de release solo confirma el contraste esperado en el panel fijo de 96 unidades; no demuestra comportamiento en otros prompts, idiomas, tareas o modelos.
- La evaluacion deja de ser ciega si las etiquetas publicas se usan para guiar el desarrollo del metodo; la model card pide reportarlo como no ciego.
- El modelo solo declara soporte de ingles y el entrenamiento se limita a longitud 512, por lo que el comportamiento fuera de ese regimen es desconocido.
- Riesgo de alucinacion y de generacion de codigo incorrecto o inseguro no declarado: no hay datos publicados al respecto.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- La licencia apache-2.0 aplica al adaptador; conviene verificar las condiciones del modelo base y de los datos de entrenamiento antes de cualquier redistribucion.
- No debe emplearse para mejorar la seguridad de sistemas reales sin un entorno de evaluacion aislado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/aisleinc/trojan-zoo-qwen25-coder-14b-f10-a1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-14B-Instruct
- Coleccion Trojan Zoo for Detection Research: https://huggingface.co/collections/aisleinc/aisle-trojan-zoo-for-detection-research-6aa012b085f8f3f04aef038e
- Resultados de busqueda web: no se han encontrado enlaces relevantes; los resultados devueltos corresponden a paginas de servicios de seguros sin relacion con el modelo.
