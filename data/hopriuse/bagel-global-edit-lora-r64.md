# hopriuse/BAGEL-Global-Edit-LoRA-r64

## Resumen

BAGEL-Global-Edit-LoRA-r64 es un adaptador LoRA de edición global de imágenes para el modelo base ByteDance-Seed/BAGEL-7B-MoT, publicado por el usuario hopriuse. No es un checkpoint independiente: se trata de un conjunto de pesos PEFT de rango 64 que debe cargarse junto con la revisión exacta del modelo base BAGEL (revisión `5019f57d168e5816e8f3f701b17cc816bb7cf24b`). El adaptador se dirige exclusivamente a las proyecciones de atención y MLP del experto de generación (`moe_gen`) del modelo BAGEL, lo que lo convierte en una pieza especializada para edición de imagen a imagen.

El adaptador se presenta como una conversión de bajo rango del "Global Edit Teacher" del proyecto del autor, un modelo completo que actúa como autoridad de procedencia. El repositorio publica únicamente el adaptador PEFT portátil, con un tamaño de 0,3 GB y licencia Apache 2.0. Su relevancia actual es acotada: sirve para investigación en edición de imágenes con BAGEL, fusión de profesores y destilación de estudiantes unificados de generación y edición, no como solución de producción autónoma.

La evaluación congelada del autor emplea 64 muestras de edición global y 64 de edición local, puntuadas con el mismo scorer SpatialReward, con resultados de 0,8525 y 0,8557 respectivamente. El propio autor advierte que la comparación por rangos no resultó estadísticamente concluyente con 64 muestras por subconjunto, por lo que estos valores deben interpretarse como evidencia de compatibilidad y calidad, no como superioridad frente a otros rangos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer MoE multimodal BAGEL-7B-MoT |
| Parametros totales | no disponible (adaptador de 0,3 GB; el base tiene 7B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT) |

Parámetros adicionales del adaptador: rango 64, alpha 128, dropout 0, target `moe_gen` (atención y MLP del experto de generación), SHA-256 `0bfda563bebd8ad4f26f3e29e0ff8ae7915c5348a7a1a80bafd2e160cf9cd088`.

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 64 y alpha 128 aplicado sobre las proyecciones de atención y MLP del experto de generación (`moe_gen`) del modelo BAGEL-7B-MoT de ByteDance-Seed. BAGEL es un transformer MoE multimodal orientado a generación y edición de imágenes; el adaptador no modifica el resto de la red, solo el subconjunto de capas del experto de generación. No se especifica en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

La innovación declarada es la procedencia: el adaptador es una conversión de bajo rango del "Global Edit Teacher" del proyecto del autor, que permanece como autoridad de procedencia. El autor menciona técnicas de multi-Teacher OPD (on-policy distillation) y fusión de profesores en el contexto de uso previsto, pero no detalla el procedimiento de entrenamiento ni los hiperparámetros más allá de los del adaptador.

## Capacidades

- Edición global de imágenes sobre el modelo base BAGEL-7B-MoT (pipeline image-to-image).
- Edición local de imágenes, según la evaluación congelada del autor (subconjunto Local).
- Compatibilidad con el ecosistema PEFT: carga mediante `peft` junto con la revisión exacta del modelo base.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, tool calling, agentes ni multilingüismo propias del adaptador; estas dependerían del modelo base BAGEL.
- No se documenta soporte de thinking mode, visión adicional, audio ni otras capacidades especiales más allá de la edición de imagen.

## Casos de uso

- Investigación en edición de imágenes con BAGEL: cargar el adaptador sobre la revisión exacta del base para reproducir los experimentos de edición global y local del autor, usando las 64+64 muestras congeladas como referencia.
- Estudio de destilación multi-Teacher: emplear el adaptador como estudiante de bajo rango frente al Global Edit Teacher completo, comparando la calidad de edición con el scorer SpatialReward.
- Fusión de profesores: integrar este adaptador en pipelines de fusión de múltiples profesores de edición para analizar cómo se comporta un experto de generación ajustado con LoRA r64.
- Evaluación de compatibilidad de adaptadores: verificar que un LoRA r64 sobre `moe_gen` mantiene la calidad de edición del base, como evidencia de portabilidad del formato PEFT.
- Prototipado de edición image-to-image en investigación: usar el adaptador como punto de partida para experimentos de edición controlada, siempre sobre el base BAGEL y con la licencia del mismo.
- Análisis de sensibilidad al rango: comparar este r64 con otros rangos del mismo proyecto para estudiar el compromiso entre tamaño del adaptador y calidad de edición, teniendo en cuenta la advertencia del autor sobre la falta de significación estadística.

## Benchmarks y rendimiento

| Subconjunto | SpatialReward |
|---|---:|
| Global (64 muestras) | 0,8525005 |
| Local (64 muestras) | 0,8556723 |

El autor indica que ambos valores usan el mismo scorer SpatialReward sobre dos subconjuntos de prompts distintos y no deben interpretarse como dos métricas de especialistas independientes. La comparación pareada por rangos no fue estadísticamente concluyente con 64 muestras por subconjunto. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador; depende del modelo base BAGEL-7B-MoT y de su cuantización.
- GPU recomendadas: no disponible en la información proporcionada; el base de 7B requiere, en general, GPUs de gama alta o profesionales, pero no se confirma en la documentación del adaptador.
- ¿Cabe en GPU consumer?: no disponible.
- Opciones de despliegue: carga mediante la librería `peft` junto con el modelo base BAGEL; no se documentan vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BAGEL-Global-Edit-LoRA-r64 | LoRA sobre BAGEL-7B-MoT | adaptador 0,3 GB (base 7B) | no disponible | Apache 2.0 | Hugging Face (hopriuse) |
| ByteDance-Seed/BAGEL-7B-MoT | Modelo base multimodal MoE | 7B | no disponible | no disponible en esta ficha | Hugging Face (ByteDance-Seed) |
| Global Edit Teacher (proyecto del autor) | Modelo completo de referencia | no disponible | no disponible | no disponible | no disponible públicamente según la model card |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada; la comparativa se limita a tipo, tamaño y licencia.

## Limitaciones y advertencias

- No es un checkpoint independiente: requiere cargarse junto con la revisión exacta `5019f57d168e5816e8f3f701b17cc816bb7cf24b` de ByteDance-Seed/BAGEL-7B-MoT; otras revisiones pueden romper la compatibilidad.
- La evaluación con 64 muestras por subconjunto no es estadísticamente decisiva; no debe usarse para afirmar superioridad frente a otros rangos.
- Los valores de Global y Local comparten el mismo scorer SpatialReward y no son métricas independientes de especialistas distintos.
- No se documentan sesgos conocidos, riesgo de alucinación, limitaciones de contexto o idioma para el adaptador; estas cuestiones dependen del modelo base BAGEL.
- Uso comercial: la licencia del adaptador es Apache 2.0, pero el autor exige seguir la licencia del modelo base BAGEL; debe verificarse esa licencia antes de cualquier despliegue en producción.
- Uso previsto exclusivamente de investigación (edición de imágenes con BAGEL, OPD multi-Teacher, fusión de profesores y estudiantes unificados); no se declara validación para dominios de despliegue concretos.
- El autor recomienda evaluar el adaptador en el dominio propio de despliegue antes de usarlo.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/hopriuse/BAGEL-Global-Edit-LoRA-r64
- Modelo base: https://huggingface.co/ByteDance-Seed/BAGEL-7B-MoT
- Repositorio PEFT: https://github.com/huggingface/peft
- No se han encontrado en la información disponible enlaces a papers, blogs, repos del proyecto ni demos adicionales.
