# Dongkkka/GR00T-N1.7-SH5-Task000905-50k-Hand_Intern

## Resumen

GR00T-N1.7-SH5-Task000905-50k-Hand_Intern es un checkpoint de ajuste fino (fine-tuning) del modelo fundacional de robótica GR00T N1.7-3B de NVIDIA, publicado por el usuario Dongkkka en Hugging Face. El modelo está especializado en una única tarea de manipulación con la mano derecha de un robot SH5: recoger una compresa sanitaria blanca de una caja y sujetarla. El ajuste se ha realizado sobre 51 episodios grabados (46 de entrenamiento y 5 de validación) a 30 Hz, empleando únicamente la cámara de cabeza (`cam_left_head`) y datos táctiles crudos.

La relevancia de esta ficha es limitada desde el punto de vista de uso general: se trata de un artefacto de investigación intermedio. La propia model card advierte de que el entrenamiento está programado o en curso y que **los pesos del checkpoint no están disponibles todavía**. Además, el modelo requiere una implementación personalizada de GR00T con adaptador táctil SH5, no la versión estándar de GR00T.

Arquitectónicamente hereda el diseño de GR00T N1.7 (backbone visión-lenguaje congelado más cabezas de acción), con la particularidad de incorporar un codificador táctil `finger_mlp` que produce un latente de 32 dimensiones para la cabeza de acción. La licencia es la NVIDIA Open Model License, que impone restricciones para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7 (backbone vision-lenguaje congelado + cabeza de acción; adaptador táctil SH5 personalizado) |
| Parametros totales | 3B (heredados del modelo base nvidia/GR00T-N1.7-3B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo recibe instrucciones en lenguaje natural, pero no se especifican idiomas) |
| Licencia | NVIDIA Open Model License (nvidia-open-model-license) |
| Formato de pesos | no disponible (checkpoint no publicado todavía) |

## Arquitectura y entrenamiento

El modelo parte de nvidia/GR00T-N1.7-3B, un modelo fundacional de robótica humanoide de 3.000 millones de parámetros. En este ajuste fino se congela el backbone visión-lenguaje y se entrenan las cabezas de acción, los proyectores y el codificador táctil `finger_mlp`. La entrada consiste en la cámara de cabeza (`cam_left_head`), 54 posiciones articulares medidas y 90 valores táctiles crudos; la salida son 40 pasos de 54 posiciones articulares absolutas en radianes, ordenadas como brazo izquierdo (7), brazo derecho (7), mano izquierda (20) y mano derecha (20). Cabeza, elevador y base quedan excluidos de las salidas.

El entrenamiento se realizó con batch de 64, acumulación de gradientes de 1, tasa de aprendizaje 1e-4, 1000 pasos de warmup y precisión BF16/TF32. El checkpoint corresponde al paso 50.000 de un schedule coseno de 200.000 actualizaciones. El conjunto de datos son 51 episodios (46 de entrenamiento, 5 reservados) a 30 Hz. No se reportan datos sobre volumen total de tokens, composición del dataset más allá de esta tarea ni uso de RLHF/DPO. La innovación técnica destacable es la integración de percepción táctil mediante un codificador numérico `finger_mlp` que genera un latente de 32 dimensiones para la cabeza de acción, lo que exige una implementación de GR00T con adaptador táctil, no la versión estándar.

## Capacidades

- Manipulación robótica de una sola tarea: recoger una compresa sanitaria blanca de una caja y sujetarla con la mano derecha.
- Control de brazo y mano derechos (y potencialmente izquierdos según el contrato de salida) mediante 40 pasos de 54 posiciones articulares absolutas.
- Percepción visual monocámara (cámara de cabeza).
- Percepción táctil cruda mediante 90 valores de presión y un codificador `finger_mlp` de 32 dimensiones.
- Condicionamiento por instrucción en lenguaje natural (heredado del backbone VLM de GR00T).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni multilingüismo específicas para este checkpoint.

## Casos de uso

- Investigación en manipulación táctil: el checkpoint sirve como referencia para estudiar cómo el codificador `finger_mlp` integra 90 lecturas de presión en un latente de 32 dimensiones para guiar la acción, en un entorno controlado de laboratorio.
- Reproducción de experimentos de fine-tuning: dado que la model card detalla hiperparámetros (batch 64, LR 1e-4, warmup 1000, BF16/TF32), el artefacto permite replicar el pipeline de entrenamiento sobre el dataset original si se dispone de él.
- Reanudación de entrenamientos largos: el repositorio incluye estado de optimizador, scheduler, RNG y paso del entrenador, lo que permite reanudar el schedule coseno de 200.000 actualizaciones con `train_200k.sh --resume`.
- Benchmark interno de políticas robóticas: útil para comparar el rendimiento de variantes táctiles frente a variantes sin tacto en la misma tarea (Task000905).
- Estudio de contratos de observación/acción: el `artifact_manifest.json` documenta normalización, commit fuente y contrato de embodiment `new_embodiment`, útil para validar pipelines de inferencia con `Gr00tPolicy`.
- Docencia y formación en robótica de imitación: como ejemplo de fine-tuning de un modelo fundacional de 3B sobre un dataset pequeño (51 episodios) con modalidad táctil.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se formula ninguna afirmación de éxito o seguridad del robot.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; como referencia, un modelo de 3B en BF16 requiere del orden de 6-8 GB solo para pesos, más overhead de activaciones y del adaptador táctil.
- GPU recomendadas: no especificadas. Por tamaño, cabría en GPUs consumer con suficiente VRAM (p. ej. RTX 4090 de 24 GB) en BF16, aunque no se confirma compatibilidad.
- Cabe en GPU consumer: probablemente sí por tamaño, pero no verificado en la información disponible.
- Opciones de despliegue: inferencia offline mediante `Gr00tPolicy` con embodiment `new_embodiment` y `use_tactile=True`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GR00T-N1.7-SH5-Task000905-50k-Hand_Intern (este) | 3B | no disponible | Manipulación táctil SH5, tarea única | NVIDIA Open Model License | Pesos no publicados todavía |
| Dongkkka/GR00T-N1.7-SH5-Task000650-Tactile | 3B | no disponible | Manipulación táctil SH5, dos brazos y manos, tres cámaras | NVIDIA Open Model License | Publicado |
| Dongkkka/GR00T-N1.7-PaperTowelBasket-895-896-907-912-RightArm8-150k | 3B | no disponible | Manipulación con brazo derecho, múltiples tareas | NVIDIA Open Model License | Publicado |
| nvidia/GR00T-N1.7-3B (base) | 3B | no disponible | Modelo fundacional de robótica humanoide | NVIDIA Open Model License | Publicado |

## Limitaciones y advertencias

- Los pesos del checkpoint no están disponibles: la model card indica que el entrenamiento está programado o en curso.
- Requiere una implementación personalizada de GR00T con adaptador táctil SH5; no funciona con GR00T estándar sin el adaptador.
- Entrenado sobre un dataset muy reducido (51 episodios) y una única tarea, lo que limita severamente la generalización.
- No se formula ninguna afirmación de éxito o seguridad del robot; no debe usarse en producción sin validación independiente.
- Licencia NVIDIA Open Model License: revisar términos antes de cualquier uso comercial.
- Riesgo de alucinación y sesgos: no evaluado ni documentado en la información disponible.
- Idiomas soportados no especificados.
- La reanudación del entrenamiento exige descargar el repositorio completo, conservar el dataset local original y el launcher, y verificar `SHA256SUMS`.
- El repositorio excluye vídeos crudos, demostraciones, credenciales, rutas de servidor, logs privados y el pickle de TrainingArguments.

## Enlaces

- Hugging Face: https://huggingface.co/Dongkkka/GR00T-N1.7-SH5-Task000905-50k-Hand_Intern
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Paper GR00T N1: https://arxiv.org/abs/2503.14734
- Variante táctil relacionada: https://huggingface.co/Dongkkka/GR00T-N1.7-SH5-Task000650-Tactile
- Variante PaperTowelBasket: https://huggingface.co/Dongkkka/GR00T-N1.7-PaperTowelBasket-895-896-907-912-RightArm8-150k-20261105
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
