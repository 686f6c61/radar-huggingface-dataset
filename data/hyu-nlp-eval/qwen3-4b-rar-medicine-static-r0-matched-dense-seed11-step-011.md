# HYU-NLP-EVAL/qwen3-4b-rar-medicine-static-r0-matched-dense-seed11-step-011

## Resumen

La ficha describe `HYU-NLP-EVAL/qwen3-4b-rar-medicine-static-r0-matched-dense-seed11-step-011`, un checkpoint de investigación publicado por el usuario HYU-NLP-EVAL. Se trata de un ajuste fino (GRPO con rúbricas estáticas, "static R0 matched dense") sobre el modelo base Qwen/Qwen3-4B-Instruct-2507, un transformer denso de 4.022 millones de parámetros. El nombre del experimento, `phase1-static-r0-medicine-qwen3-4b-matched-dense-20260928-seed11`, indica que forma parte de una auditoría de la fase 1 de un pipeline de aprendizaje por refuerzo orientado al dominio médico, en su paso de optimización número 11.

El modelo se publica como un checkpoint intermedio de política dentro de una ejecución de RL, no como un modelo final pulido para producción. El autor declara explícitamente que es "research use only" y no formula ninguna afirmación de capacidad o seguridad médica. La relevancia es, por tanto, metodológica: sirve para reproducir y auditar las distintas etapas de un entrenamiento GRPO con rúbricas estáticas frente a variantes dinámicas (OnlineRubrics).

El repositorio incluye un modelo en BF16 listo para inferencia en la raíz y una carpeta `original_checkpoint/` con los ficheros originales de veRL (solo parámetros). No hay datos publicados de benchmarks, idiomas soportados ni resultados de evaluación, por lo que la mayor parte de las especificaciones se heredan del modelo base o quedan como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso (heredada de Qwen3-4B-Instruct-2507); detalles de capas no disponibles |
| Parametros totales | 4.022.468.096 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens segun registro de terceros (featherless.ai); no confirmada en la model card del autor |
| Tipos de cuantizacion | Solo BF16 en el repositorio; no se publican GGUF ni cuantizaciones de menor precision |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (cabecera del README), con la nota "research use only" del autor |
| Formato de pesos | Safetensors (BF16) en la raiz + checkpoint original de veRL en `original_checkpoint/` |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3-4B-Instruct-2507, un transformer decoder denso con normalizacion tipo RMSNorm, atencion con RoPE y `grouped-query attention`. No se documentan en la model card cambios estructurales respecto al base, por lo que las dimensiones de capas, cabezas de atencion y vocabulario coinciden con las del modelo Qwen3-4B original. La variante "thinking disabled" mencionada en checkpoints hermanos de la misma familia sugiere que el modo de razonamiento explicito esta desactivado en esta politica.

El entrenamiento corresponde a un ciclo de RL con GRPO guiado por rubricas estaticas ("static R0"), con una configuracion "matched dense" que empareja la arquitectura densa del alumno con la referencia del experimento. El checkpoint capturado en el paso 11 es un estado intermedio de la politica, no el punto final del entrenamiento, y forma parte de una auditoria de fase 1. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, el tipo de datos medicos utilizados ni si hubo etapas previas de SFT o DPO.

## Capacidades

- Generacion de texto conversacional, heredada del pipeline `text-generation` y del modelo base Qwen3-4B-Instruct-2507.
- Razonamiento y respuesta a instrucciones en el dominio medico, segun el proposito declarado del experimento RaR-Medicine.
- Modo de pensamiento desactivado ("thinking disabled") en los checkpoints de la familia segun los registros de terceros.
- Soporte teorico de tool calling y function calling por herencia del modelo base Qwen3-Instruct, aunque no se confirma en la model card.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision, audio u otras modalidades: no disponibles.

## Casos de uso

- Auditoria de pipelines de RL: el checkpoint permite reproducir el estado de la politica en el paso 11 de la ejecucion `phase1-static-r0-medicine-qwen3-4b-matched-dense-20260928-seed11` y compararlo con las variantes OnlineRubrics y static-rubric de la misma familia.
- Investigacion sobre rúbricas estaticas: sirve para estudiar como evoluciona una politica guiada por rúbricas fijas frente a rúbricas dinamicas en tareas de dominio medico.
- Analisis de deriva de politica (policy drift): al ser un estado historico, permite medir como cambia el comportamiento del modelo entre pasos de optimizacion.
- Experimentos de evaluacion comparativa entre seeds: la semilla 11 esta explicitada en el nombre, lo que facilita replicas controladas.
- Estudio de reward hacking y colapso de politica en GRPO: el modelo es un artefacto intermedio adecuado para inspeccionar estos fenomenos.
- Generacion de texto medico en entornos de investigacion cerrados: uso interno para prototipos siempre que se respete la restriccion "research use only".

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia en BF16: en torno a 8-10 GB solo para los pesos del modelo (4.022 millones de parametros a 2 bytes por parametro), mas el KV cache asociado al contexto.
- VRAM para inferencia a 8 bits: aproximadamente 4-5 GB de pesos mas overhead de runtime.
- VRAM para inferencia a 4 bits (si se generan cuantizaciones propias): aproximadamente 2,5-3 GB de pesos.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para despliegues con contexto largo; RTX 4090 (24 GB) y RTX 3090 (24 GB) sobradas para BF16.
- GPU de consumo: cabe en tarjetas de 8 GB o mas (RTX 3060 Ti, RTX 4060 Ti 16 GB, RTX 3070) si se cuantiza a 4-8 bits; en BF16 requiere al menos 12 GB para dejar margen al KV cache.
- Opciones de despliegue: transformers (formato nativo del repositorio), text-generation-inference (el tag `text-generation-inference` aparece en el repositorio), vLLM y TGI para serving de alto rendimiento; llama.cpp u Ollama solo si se generan cuantizaciones GGUF, que no estan publicadas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| qwen3-4b-rar-medicine-static-r0-matched-dense-seed11-step-011 | 4,02 B | 32.768 (segun terceros) | Apache-2.0 (research use only) | HuggingFace, 0 descargas | Checkpoint intermedio de GRPO, sin benchmarks |
| Qwen/Qwen3-4B-Instruct-2507 | 4,02 B | 262.144 nativo | Apache-2.0 | HuggingFace, ampliamente usado | Modelo base original, con evaluaciones publicas |
| qwen3-4b-rar-medicine-onlinerubrics-seed11-step-000 | no disponible | 32.768 (segun terceros) | Apache-2.0 | HuggingFace | Variante con rúbricas dinamicas, misma familia |
| qwen3-4b-rar-medicine-onlinerubrics-seed11-step-042 | no disponible | 32.768 (segun terceros) | Apache-2.0 | HuggingFace | Estado intermedio, paso 42, thinking disabled |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- El autor declara explicitamente "research use only": no hay afirmacion de capacidad clinica ni de seguridad medica, y no deberia usarse en contextos asistenciales.
- Es un checkpoint intermedio (paso 11) de una politica de RL, no un modelo final; su calidad puede ser inferior a la del modelo base o a la de checkpoints posteriores.
- No se publican datos de sesgos, composicion del dataset de entrenamiento ni evaluaciones de robustez.
- Riesgo de alucinacion no cuantificado; por el dominio medico, cualquier salida debe tratarse como no verificada.
- El repositorio ocupa 25,7 GB, en gran parte por el checkpoint original de veRL, lo que puede complicar su descarga en entornos con almacenamiento limitado.
- Licencia Apache-2.0 en la cabecera, pero con la restriccion adicional de uso exclusivamente investigador indicada por el autor; conviene verificar la compatibilidad antes de cualquier uso comercial.
- Idiomas soportados y limitaciones de contexto mas alla de los 32.768 tokens reportados por terceros: no disponibles.
- El modo "thinking" desactivado puede reducir el rendimiento en tareas que requieran razonamiento multi-paso extenso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-rar-medicine-static-r0-matched-dense-seed11-step-011
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Variante relacionada step-000: https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-seed11-step-000
- Variante relacionada step-042: https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-seed11-step-042
- Registro en featherless.ai: https://featherless.ai/models/HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-seed11-step-013
- Registro en free2aitools: https://free2aitools.com/model/hyu-nlp-eval/qwen3-4b-rar-medicine-static-r0-matched-seed11-step-036
- Registro en friendli.ai: https://friendli.ai/models/HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-seed11-step-012
