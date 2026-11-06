# Loke-60000/Qwen3.8-Flash-Next-FP4-Local-house-qsa-directions

## Resumen

Qwen3.8-Flash-Next-FP4-Local-house-qsa-directions es una variante derivada del modelo Qwen3.8-Flash-Next en formato FP4 (4 bits en coma flotante), publicada por el usuario Loke-60000 en Hugging Face. El modelo parte de los pesos de drowzeys/keys-Qwen3.8-Flash-Next-NVFP4-FP4-QAD-house-qsa-L3-47, que a su vez deriva de nvidia/Qwen3.8-Flash-Next-FP4-Local. La ficha incorpora la etiqueta "abliterated", lo que indica que se han aplicado direcciones de abliteración para reducir los rechazos del modelo ante ciertas peticiones.

El interés principal de esta publicación reside en su carácter de experimento de cuantización y modificación de pesos: combina cuantización NVFP4/FP4 con técnicas de abliteración ("abliteration-directions") y referencias a "tensorfold" y "dgx-spark", apuntando a despliegue en hardware NVIDIA de gama DGX Spark. No obstante, la información pública es extremadamente escasa: el repositorio tiene 0 GB de tamaño declarado, 0 descargas y 0 likes en el momento de la consulta.

Se trata de un artefacto de nicho, con acceso restringido (gated) y licencia NVIDIA Open Model License, orientado a investigadores que quieran reproducir o inspeccionar el proceso de abliteración sobre un modelo base FP4. No debe considerarse un modelo listo para producción sin una evaluación independiente previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de Qwen3.8-Flash-Next; arquitectura del base no detallada en la informacion proporcionada) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP4 / NVFP4 (según nomenclatura del modelo base y del checkpoint intermedio) |
| Idiomas soportados | no disponible |
| Licencia | nvidia-open-model-license |
| Formato de pesos | no disponible (repo de 0.0 GB; presumiblemente safetensors en FP4, no confirmado) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base Qwen3.8-Flash-Next en la información proporcionada. Por la nomenclatura del checkpoint intermedio (NVFP4-FP4-QAD-house-qsa-L3-47) se deduce que el modelo ha pasado por un proceso de cuantización a 4 bits en formato FP4/NVFP4, probablemente con alguna variante de quantización consciente de la cuantización (QAD, quantization-aware distillation o similar) y posiblemente destilación por capas (referencia "L3-47").

La innovación declarada en esta ficha es la aplicación de "abliteration-directions": direcciones de abliteración calculadas para suprimir el comportamiento de rechazo del modelo base. El tag "tensorfold" sugiere alguna técnica de plegado o reorganización de tensores, y "dgx-spark" apunta a un objetivo de despliegue en el hardware NVIDIA DGX Spark. No se especifican número de tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO en ninguna de las fases.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base Qwen3.8-Flash-Next, aunque no verificadas en esta variante.
- Reducción de rechazos: la abliteración aplicada busca disminuir las negativas del modelo ante peticiones que el base rechazaría; el alcance exacto no está documentado.
- Cuantización FP4: pensada para inferencia eficiente en memoria en hardware NVIDIA compatible.
- Tool calling / function calling: no confirmado en esta variante.
- Soporte de agentes y razonamiento multi-paso: no confirmado.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Investigación sobre abliteración: el modelo sirve como material de estudio para analizar cómo las direcciones de abliteración afectan al comportamiento de rechazo en un modelo cuantizado a FP4, comparándolo con el checkpoint intermedio y con el base.
- Evaluación de cuantización NVFP4: permite medir la degradación de calidad introducida por la cuantización a 4 bits frente al modelo original, en tareas controladas de laboratorio.
- Despliegue experimental en DGX Spark: por la referencia explícita al hardware, es adecuado para probar pipelines de inferencia FP4 en entornos NVIDIA de gama Spark.
- Reproducibilidad de artefactos: útil para verificar la cadena de derivación (base NVIDIA → checkpoint drowzeys → esta variante) y documentar linajes de modelos modificados.
- Pruebas de robustez y seguridad: al ser un modelo abliterado, sirve para estudiar la eficacia de los mecanismos de seguridad del base y los riesgos de su eliminación.
- Benchmarking interno de latencia y memoria: al estar en FP4, permite comparar throughput y huella de VRAM frente a versiones en BF16/FP8 del mismo modelo base en el mismo hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; al tratarse de pesos FP4, la huella sería aproximadamente la mitad que una versión FP8 y una cuarta parte que BF16 para el mismo número de parámetros, pero se desconoce el tamaño total del modelo.
- GPU recomendadas: hardware NVIDIA con soporte para FP4/NVFP4; la referencia a DGX Spark sugiere GPUs de esa familia. No se especifican modelos concretos como A100, H100 o RTX 4090.
- Compatibilidad con GPU de consumo: no confirmada.
- Opciones de despliegue: no disponibles; FP4/NVFP4 requiere normalmente stacks de inferencia con soporte específico (por ejemplo, TensorRT-LLM o vLLM con kernels NVFP4), pero no se documenta en la ficha.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Acceso |
|---|---|---|---|---|---|
| Loke-60000/Qwen3.8-Flash-Next-FP4-Local-house-qsa-directions | no disponible | no disponible | FP4/NVFP4 | nvidia-open-model-license | Restringido (gated) |
| drowzeys/keys-Qwen3.8-Flash-Next-NVFP4-FP4-QAD-house-qsa-L3-47 (checkpoint padre) | no disponible | no disponible | NVFP4/FP4 | no disponible | no disponible |
| nvidia/Qwen3.8-Flash-Next-FP4-Local (base) | no disponible | no disponible | FP4 | nvidia-open-model-license | no disponible |

No se dispone de datos de rendimiento ni de especificaciones detalladas de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Información pública mínima: 0 descargas, 0 likes y repositorio de 0.0 GB declarado; no hay garantía de que los pesos estén completos o sean utilizables.
- Acceso restringido: requiere aceptar condiciones en Hugging Face, lo que limita su uso y distribución.
- Abliteración: la supresión de rechazos puede aumentar el riesgo de generar contenido dañino, sesgado o inapropiado; no se documenta el alcance ni la metodología exacta.
- Licencia NVIDIA Open Model License: impone condiciones específicas de uso, incluida posiblemente la atribución y restricciones de uso comercial; debe revisarse antes de cualquier despliegue.
- Cuantización FP4: puede degradar la calidad respecto al modelo original; no se han publicado evaluaciones de la pérdida de rendimiento.
- Idiomas y contexto: no documentados, por lo que no se puede asumir soporte multilingüe ni una ventana de contexto concreta.
- Riesgo de alucinación: no evaluado en esta variante; al ser un modelo derivado y modificado, los riesgos del base pueden verse alterados.
- Sin benchmarks: no hay evidencia publicada de su rendimiento en tareas estándar (MMLU, HumanEval, GSM8K, etc.).
- Cadena de derivación poco transparente: no se detalla qué cambios exactos se aplicaron entre el base, el checkpoint intermedio y esta variante.

## Enlaces

- Hugging Face: https://huggingface.co/Loke-60000/Qwen3.8-Flash-Next-FP4-Local-house-qsa-directions
- Modelo base NVIDIA: https://huggingface.co/nvidia/Qwen3.8-Flash-Next-FP4-Local
- Checkpoint intermedio: https://huggingface.co/drowzeys/keys-Qwen3.8-Flash-Next-NVFP4-FP4-QAD-house-qsa-L3-47
