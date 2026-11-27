# narzh49/Hy4-Flash-Heretic-Strata

## Resumen

Hy4-Flash-Heretic-Strata es una variante modificada del modelo Hy4-Flash de Tencent, publicada por el usuario narzh49 en Hugging Face. Se trata de una edicion de rechazo (refusal edit) aplicada sobre las builds `.strata` del modelo original, incorporando los valores del modelo "heretic" de trohrbaugh para eliminar las respuestas de rechazo ante peticiones que el modelo base declina. El resultado es un modelo multimodal image-text-to-text sin censura, empaquetado en formato propietario `.strata` con dos variantes de cuantizacion (SQ-64 y SQ-128).

El modelo parte de la arquitectura y el entrenamiento de Hy4-Flash, un modelo de Tencent con capacidades de vision y lenguaje, y hereda su licencia Tencent Hy License 1.0. La modificacion afecta a 102 tensores en las capas 8 a 41, sustituyendo proyecciones de atencion y expertos MLP por los valores del modelo heretic. El resto de pesos permanece intacto respecto al modelo base.

La relevancia de esta ficha radica en que documenta un caso de abliteration aplicada a un modelo multimodal de gran tamano, con implicaciones importantes para uso en produccion: ausencia de benchmarks de capacidad, licencia restrictiva y un modelo base que no es de codigo abierto pleno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Hy4-Flash de Tencent, multimodal image-text-to-text) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se confirma si es MoE; la model card menciona `shared_experts` y `routed_expert_up_proj`, lo que sugiere arquitectura con expertos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | SQ-64 (62,03 GB) y SQ-128 (113,65 GB), formato propietario `.strata` |
| Idiomas soportados | no disponible |
| Licencia | Tencent Hy License 1.0 (`tencent-hy-license`) |
| Formato de pesos | `.strata` (packs propietarios); requiere ademas `Hy4-Flash-Engram-Q8.strata` y `Hy4-Flash-Vision.strata` del repo de Strata |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a Hy4-Flash de Tencent, un modelo multimodal image-text-to-text. La presencia de tensores `shared_experts.down_proj` y `routed_expert_up_proj` en las capas 8 a 41 indica una estructura de mezcla de expertos (MoE) con expertos compartidos y enrutados, aunque la model card no detalla el numero total de parametros ni de expertos. El modelo incorpora un componente de vision separado (`Hy4-Flash-Vision.strata`) y un componente Engram cuantizado a Q8.

El proceso de creacion de este modelo consistio en sustituir 102 tensores de las builds originales de Strata por los valores del modelo heretic de trohrbaugh, tomados de su version FP8. Los dos tensores MLP se aplicaron como delta respecto a `tencent/Hy4-flash` y se reencodificaron en el formato de cada pack. No se realizo entrenamiento adicional ni fine-tuning: es una edicion quirurgica de pesos orientada a eliminar el comportamiento de rechazo. La model card no documenta datos de entrenamiento, numero de tokens, ni procesos de RLHF o DPO del modelo base.

## Capacidades

- Generacion de texto y comprension de imagenes (pipeline image-text-to-text).
- Respuesta a peticiones que el modelo base rechaza, gracias a la edicion de rechazo aplicada.
- Capacidad de razonamiento y generacion condicionada por el modelo base Hy4-Flash (no documentada en detalle en la model card).
- Soporte de modo "thinking" mencionado en la configuracion de pruebas (se desactiva con `thinking off`), lo que sugiere un modo de razonamiento extendido heredado del modelo base.
- Soporte multilingue: no disponible en la informacion proporcionada.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre abliteration y edicion de rechazo: el modelo sirve como caso de estudio para analizar como la sustitucion de tensores especificos afecta al comportamiento de rechazo, con resultados medidos sobre el dataset `mlabonne/harmful_behaviors`.
- Evaluacion de robustez de clasificadores de rechazo: permite probar clasificadores como `VINAY-UMRETHE/Refusal-Classifier-v2` frente a modelos modificados y medir su tasa de deteccion.
- Analisis de seguridad de modelos multimodales: util para estudiar la transferibilidad de ediciones de rechazo entre variantes de cuantizacion (SQ-64 y SQ-128) y entre componentes de vision y lenguaje.
- Despliegue controlado en entornos de investigacion cerrados: con la licencia Tencent Hy License 1.0 y el motor Strata, puede ejecutarse en infraestructura propia para experimentos que requieran respuestas sin filtro, asumiendo la responsabilidad de uso.
- Comparacion de formatos de empaquetado: las dos builds (62 GB y 113 GB) permiten evaluar el compromiso entre tamano y fidelidad de pesos en el formato `.strata`.
- Pruebas de pipelines multimodales image-text-to-text: al conservar el componente de vision original, puede usarse para validar flujos que combinan imagen y texto en el motor Strata.

## Benchmarks y rendimiento

La model card solo documenta resultados de comportamiento de rechazo sobre las primeras 100 muestras del split de test de `mlabonne/harmful_behaviors`, con decodificacion greedy, 100 tokens y thinking desactivado, evaluadas con `VINAY-UMRETHE/Refusal-Classifier-v2` y con las 34 palabras clave de rechazo duro del modelo heretic.

| Build SQ-64 | Rechazo total | Rechazo parcial | Cumplimiento | Acierto de palabras clave |
|---|---:|---:|---:|---:|
| Strata sin parchear | 73 | 26 | 1 | 99 |
| Este repositorio | 1 | 41 | 58 | 39 |

Para SQ-128 no se ejecutaron pruebas de comportamiento, solo verificaciones de integridad de ficheros. No se han publicado benchmarks de capacidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Por el tamano de los ficheros, SQ-64 requiere al menos 62 GB solo para los pesos del pack, mas los componentes `Engram-Q8` y `Vision` adicionales; SQ-128 requiere al menos 113,65 GB para el pack principal.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por el volumen de pesos, SQ-64 no cabe en GPUs de consumo de 24 GB ni en configuraciones de 48 GB sin offloading; se requiere hardware de clase profesional o multi-GPU.
- Cabe en consumer GPU: no para SQ-64 ni SQ-128 en configuracion completa; se desconoce si el motor Strata permite offloading parcial a CPU o disco.
- Opciones de despliegue: exclusivamente el motor Strata mediante `strata launch --family hy4-flash --model SQ-64 --model-path /path/to/Hy4-Flash-SQ-64-heretic.strata`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Hy4-Flash-Heretic-Strata (este) | no disponible | no disponible | `.strata` (SQ-64, SQ-128) | Tencent Hy License 1.0 | Sin censura, multimodal, sin benchmarks de capacidad |
| strata-engine/Hy4-Flash-Strata | no disponible | no disponible | `.strata` | Tencent Hy License 1.0 | Modelo base sin edicion de rechazo; rechazo total en 73/100 muestras |
| trohrbaugh/Hy4-flash-heretic-FP8 | no disponible | no disponible | FP8 | no disponible | Fuente de los valores heretic; variante FP8 del modelo heretic |
| tencent/Hy4-flash | no disponible | no disponible | no disponible | Tencent Hy License 1.0 | Modelo original de Tencent; referencia para los deltas MLP |

No se dispone de datos suficientes para comparar parametros, contexto ni rendimiento con alternativas de la misma categoria fuera de la familia Hy4-Flash.

## Limitaciones y advertencias

- Modelo sin censura: responde a peticiones que el modelo base rechaza. El autor declina responsabilidad sobre el uso y el contenido generado.
- No es una release oficial de Tencent, Strata ni de los autores de Heretic.
- Ausencia total de benchmarks de capacidad: no hay datos de MMLU, HumanEval, GSM8G ni similares, por lo que el impacto de la edicion sobre el rendimiento general es desconocido.
- SQ-128 no fue probado en comportamiento, solo en integridad de ficheros.
- La edicion de rechazo no es completa: en SQ-64 persisten 41 rechazos parciales y 1 rechazo total de 100 muestras.
- Licencia Tencent Hy License 1.0: restrictiva, no es una licencia de codigo abierto pleno; deben revisarse las condiciones para uso comercial.
- Formato propietario `.strata`: solo ejecutable con el motor Strata, lo que limita portabilidad y opciones de despliegue.
- Dependencia de ficheros externos (`Hy4-Flash-Engram-Q8.strata` y `Hy4-Flash-Vision.strata`) del repo de Strata, no incluidos en este repositorio.
- Idiomas soportados no documentados; riesgo de comportamiento degradado en idiomas distintos del entrenamiento original.
- Riesgo de alucinacion y sesgos: no evaluados en la informacion disponible.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validacion comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/narzh49/Hy4-Flash-Heretic-Strata
- Modelo base Strata: https://huggingface.co/strata-engine/Hy4-Flash-Strata
- Modelo heretic FP8: https://huggingface.co/trohrbaugh/Hy4-flash-heretic-FP8
- Modelo heretic original: https://huggingface.co/trohrbaugh/Hy4-flash-heretic
- Modelo original de Tencent: https://huggingface.co/tencent/Hy4-flash
- Licencia: https://huggingface.co/tencent/Hy4-flash/blob/main/LICENSE
- Dataset de evaluacion: https://huggingface.co/datasets/mlabonne/harmful_behaviors
- Clasificador de rechazo: https://huggingface.co/VINAY-UMRETHE/Refusal-Classifier-v2
