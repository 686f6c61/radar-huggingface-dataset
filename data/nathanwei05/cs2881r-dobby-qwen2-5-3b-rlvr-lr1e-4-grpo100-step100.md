# nathanwei05/cs2881r-dobby-qwen2.5-3b-rlvr-lr1e-4-grpo100-step100

## Resumen

El modelo `nathanwei05/cs2881r-dobby-qwen2.5-3b-rlvr-lr1e-4-grpo100-step100` es un ajuste fino de 3.085.938.688 parámetros derivado de Qwen2.5-3B-Instruct, desarrollado por el usuario nathanwei05 en el marco de la asignatura Harvard CS 2881R (AI Safety, otoño de 2026), en la fase 3 (RLVR) de la primera práctica de la asignatura. No es un modelo de propósito general publicado por un laboratorio, sino un artefacto académico reproducible que documenta una cadena completa de alineamiento: SFT, RLAIF y, por último, GRPO con recompensa verificable.

La cadena de entrenamiento parte de Qwen2.5-3B-Instruct y pasa por el checkpoint intermedio `axel-sdq/cs2881r-dobby-qwen2.5-3b-rlaif-grpo100-step25` (revisión `ba9705301d86619447f480121c06133039a496d3`), que aplica SFT y RLAIF. Sobre él se aplica un LoRA de rango 16 optimizado con GRPO durante 100 actualizaciones (beta 0,04, checkpoint 100 seleccionado sobre un conjunto de desarrollo de 150 prompts). La señal de recompensa es un verificador basado en reglas que solo evalúa corrección en prompts de GSM8K y MATH.

Su relevancia es, por tanto, metodológica y educativa más que de producto: sirve como ejemplo verificable de un pipeline RLVR completo sobre un modelo de 3B, con código, datos y registro de trabajo públicos. El repositorio incluye el modelo fusionado en la raíz y el adaptador LoRA en `adapter/`. No hay benchmarks, evaluaciones de seguridad ni cuantizaciones publicadas, y el modelo acumula 0 descargas y 0 «likes» en HuggingFace.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2; heredada de Qwen2.5-3B-Instruct) |
| Parametros totales | 3.085.938.688 (3,09B) |
| Longitud de contexto | no disponible en la model card (el modelo base Qwen2.5-3B-Instruct declara 32.768 tokens nativos y extensión por YaRN; no confirmado para este ajuste) |
| Tipos de cuantizacion | no disponible; no se publican cuantizaciones (ni GGUF, ni GPTQ, ni AWQ) |
| Idiomas soportados | no disponible en la model card (el modelo base Qwen2.5-3B-Instruct es multilingüe, pero no se documenta el efecto del ajuste sobre otros idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers); incluye además un adaptador LoRA en `adapter/` junto al modelo fusionado en la raíz |
| Tamano del repositorio | 6,3 GB |
| Pipeline declarado | text-generation |
| Modelo base | axel-sdq/cs2881r-dobby-qwen2.5-3b-rlaif-grpo100-step25 |
| Fecha de creacion | 2026-09-23 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-3B-Instruct: un transformer decoder-only denso de 3,09 mil millones de parámetros, sin mezcla de expertos. El modelo final no introduce cambios estructurales; el ajuste se realiza mediante un adaptador LoRA de rango 16 optimizado con GRPO, con beta 0,04, durante 100 actualizaciones. El checkpoint 100 fue seleccionado sobre un conjunto de desarrollo de 150 prompts. La model card indica una tasa de aprendizaje de 2e-5, aunque el identificador del repositorio contiene la cadena `lr1e-4`; la discrepancia no se resuelve en la documentación disponible.

La cadena de alineamiento tiene tres etapas sobre Qwen2.5-3B-Instruct: SFT, RLAIF (que produce el checkpoint intermedio de `axel-sdq`) y RLVR con GRPO. La innovación metodológica es el uso de recompensa verificable basada en reglas que comprueba exclusivamente la corrección de la respuesta en prompts de GSM8K y MATH. No se especifican en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni detalles del verificador (formato de respuesta esperado, extracción de la solución, política ante respuestas mal formadas).

## Capacidades

- Generación de texto conversacional e instrucciones de un solo turno, heredadas de Qwen2.5-3B-Instruct.
- Resolución de problemas matemáticos de tipo GSM8K y MATH, que es el dominio sobre el que se optimizó la recompensa verificable.
- Razonamiento paso a paso orientado a tareas aritméticas y de álgebra elemental.
- Soporte de tool calling / function calling: no verificado en este ajuste. El modelo base lo soporta, pero no hay documentación ni evaluación posterior al RLVR.
- Soporte de agentes y razonamiento multi-paso: no documentado ni evaluado.
- Capacidades multilingües: no documentadas para este ajuste.
- Capacidades especiales (modo de pensamiento explícito, visión, audio, decodificación especulativa): no disponibles.
- Cuantizaciones listas para usar en llama.cpp/Ollama: no publicadas.

## Casos de uso

- Reproducción de experimentos RLVR: el repositorio de código (`harvard-cs2881f26/hw1-soderquist-wei`), los datos y el registro de trabajo permiten reproducir la fase 3 del pipeline y comparar el checkpoint 100 frente al paso 25 del modelo base intermedio.
- Estudio de LoRA frente a ajuste completo en RL: el adaptador en `adapter/` permite medir diferencias de comportamiento entre cargar el adaptador sobre el base intermedio y cargar el modelo fusionado de la raíz.
- Prototipado de tutores matemáticos offline: para problemas de aritmética y álgebra de nivel escolar, el modelo puede generar soluciones paso a paso en una máquina con GPU de gama media; cualquier despliegue real exigiría antes una evaluación propia, dado que no hay benchmarks publicados.
- Generación de datos sintéticos de razonamiento matemático: puede emplearse para producir trazas de solución que después se filtren con un verificador simbólico, en línea con la recompensa usada durante el entrenamiento.
- Banco de pruebas de pipelines de evaluación: útil como sujeto de pruebas de arneses de evaluación (lm-evaluation-harness, lighteval) y de infraestructura de inferencia (vLLM, TGI), por su tamaño reducido y su licencia permisiva.
- Docencia en alineamiento y seguridad: sirve como caso de estudio de RLVR, de selección de checkpoints por conjunto de desarrollo pequeño (150 prompts) y de los riesgos de sobreoptimización de una única señal de recompensa.
- Línea base para ablaciones de GRPO: al existir varias etapas documentadas en el mismo repositorio de curso, permite comparar hiperparámetros (rango de LoRA, beta, número de actualizaciones) manteniendo constante el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: aproximadamente 6,2 GB solo para pesos (3,09B × 2 bytes); con caché KV y activaciones conviene reservar entre 8 y 10 GB para contexto corto y lotes pequeños, y más si se usan ventanas de contexto largas.
- VRAM estimada con cuantización de 8 bits: en torno a 3,1 GB de pesos, alrededor de 4-5 GB en ejecución.
- VRAM estimada con cuantización de 4 bits: en torno a 1,8-2,2 GB de pesos, aproximadamente 3 GB en ejecución. Estas cuantizaciones no están publicadas y habría que generarlas.
- GPU de gama alta: cabe con holgura en A100, H100, L40S y RTX 4090.
- GPU de consumo: cabe en bf16 en RTX 3090, RTX 4090, RTX 4080, RTX 3060 de 12 GB y RTX 4060 Ti de 16 GB; en 4 bits cabría incluso en GPUs de 6-8 GB, siempre que se convierta el modelo.
- Opciones de despliegue: transformers (vía declarada), text-generation-inference y endpoints compatibles (etiquetas `text-generation-inference` y `endpoints_compatible`), vLLM. Para llama.cpp u Ollama sería necesario convertir los pesos a GGUF, algo que el autor no ha publicado.
- Latencia y throughput: no disponibles; no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Benchmarks publicados | Estado |
|---|---|---|---|---|---|
| cs2881r-dobby-qwen2.5-3b-rlvr (este modelo) | 3,09B | no disponible en la ficha | Apache-2.0 | no disponible | Artefacto académico, 0 descargas |
| Qwen2.5-3B-Instruct | 3,09B | 32.768 tokens (ampliable por YaRN) | Apache-2.0 | Sí, publicados por el autor del modelo base | Modelo de referencia, ampliamente desplegado |
| Llama-3.2-3B-Instruct | 3,21B | 128.000 tokens | Llama 3.2 Community License | Sí, publicados por el autor del modelo base | Modelo de referencia con licencia restrictiva para algunos usos |
| Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens (ampliable por YaRN) | Apache-2.0 | Sí, publicados por el autor del modelo base | Alternativa más ligera para GPUs pequeñas |

No se dispone de cifras comparativas de rendimiento para este ajuste concreto, ya que no se han publicado evaluaciones. Las diferencias frente al modelo base y a los ajustes intermedios del mismo pipeline no están cuantificadas en la información disponible.

## Limitaciones y advertencias

- Ausencia total de benchmarks y de evaluaciones de seguridad: el modelo se publica sin métricas de MMLU, GSM8K, HumanEval ni de ningún otro conjunto, por lo que su rendimiento real es desconocido.
- Señal de recompensa muy estrecha: el verificador basado en reglas solo evalúa correctitud en GSM8K y MATH, lo que puede producir degradación en tareas ajenas al dominio matemático y sobreajuste al formato de respuesta esperado por el verificador.
- Riesgo de reward hacking: al optimizar contra un verificador de reglas, es plausible que el modelo haya aprendido atajos de formato o patrones de verbosidad que satisfagan al verificador sin mejorar el razonamiento.
- Riesgo de alucinación: inherente a un modelo denso de 3,09B, y no mitigado por ninguna etapa de alineamiento orientada a la veracidad factual.
- Idiomas no documentados: se desconoce si el ajuste ha degradado el multilingüismo del modelo base; no hay evaluación al respecto.
- Contexto no confirmado: la model card no declara longitud de contexto para este ajuste.
- Discrepancia documental: el nombre del repositorio indica `lr1e-4` mientras que la model card indica 2e-5 como tasa de aprendizaje; conviene verificar el registro de trabajo antes de citar el hiperparámetro.
- Modelo base intermedio no auditado: `axel-sdq/cs2881r-dobby-qwen2.5-3b-rlaif-grpo100-step25` es a su vez un artefacto de curso con licencia Apache-2.0, sin evaluación pública.
- Confusión potencial al cargar: el repositorio contiene el modelo fusionado en la raíz y un adaptador LoRA en `adapter/`; cargar el adaptador sobre el modelo base intermedio y cargar el modelo fusionado no son operaciones equivalentes en términos de trazabilidad.
- Licencia Apache-2.0: permite uso comercial y modificación, pero se ofrece sin garantías; al tratarse de un artefacto académico sin validación, su uso en producción exige evaluación independiente y controles de seguridad propios.
- Sin validación comunitaria: 0 descargas y 0 «likes» en el momento de redactar esta ficha, sin informes externos de comportamiento.
- Búsqueda web sin resultados relevantes: las consultas realizadas no devolvieron documentación técnica adicional sobre este modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nathanwei05/cs2881r-dobby-qwen2.5-3b-rlvr-lr1e-4-grpo100-step100
- Modelo base (etapa SFT + RLAIF): https://huggingface.co/axel-sdq/cs2881r-dobby-qwen2.5-3b-rlaif-grpo100-step25
- Revisión concreta del modelo base usada en el entrenamiento: https://huggingface.co/axel-sdq/cs2881r-dobby-qwen2.5-3b-rlaif-grpo100-step25/tree/ba9705301d86619447f480121c06133039a496d3
- Código de entrenamiento, datos, registro de trabajo y resultados: https://github.com/harvard-cs2881f26/hw1-soderquist-wei
- Modelo original de la familia: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
