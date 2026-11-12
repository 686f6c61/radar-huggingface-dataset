# mcedro/gemma-3-12b-it-mixed-med-1to12-s0

## Resumen

`mcedro/gemma-3-12b-it-mixed-med-1to12-s0` es un fine-tuning del modelo Gemma 3 12B instruct de Google, publicado por el usuario mcedro en Hugging Face. Segun los tags del repositorio, el modelo forma parte de una linea de investigacion sobre "emergent misalignment" (desalineacion emergente), un fenomeno documentado en la literatura reciente por el que un ajuste fino aparentemente inocuo sobre un modelo alineado puede inducir comportamientos problematicos generalizados. Los articulos referenciados son arXiv:2506.11613 y arXiv:2602.07852.

El modelo parte de `unsloth/gemma-3-12b-it`, una version del Gemma 3 12B instruct optimizada por Unsloth para fine-tuning eficiente. La nomenclatura del identificador ("mixed-med-1to12-s0") sugiere una mezcla de datos de entrenamiento con proporciones o semillas concretas, aunque el repositorio no detalla la composicion exacta del dataset. El modelo tiene 0 descargas y 0 likes en el momento de redactar esta ficha, lo que indica que es un artefacto de investigacion de reciente publicacion y sin validacion comunitaria.

Es relevante para investigadores que estudian seguridad y alineacion de modelos, no como modelo de produccion. Su acceso esta restringido (gated) en Hugging Face y requiere aceptar condiciones adicionales. No se dispone de informacion publica sobre benchmarks, idiomas soportados ni detalles del proceso de entrenamiento mas alla de los tags.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Gemma 3 12B IT) |
| Parametros totales | 12 mil millones (aproximado, segun el nombre del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Gemma 3 12B IT soporta contexto largo, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | Gemma (terminos de licencia de Google Gemma) |
| Formato de pesos | no disponible (presumiblemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 3 12B instruct, un transformer decoder-only con atencion por ventanas deslizantes y atencion global alternadas, desarrollado por Google DeepMind. El fine-tuning se realizo presumiblemente con Unsloth, dado que el modelo base es `unsloth/gemma-3-12b-it`, una version optimizada para entrenamiento con menor uso de memoria y mayor velocidad. No se especifica en la informacion disponible si se emplearon tecnicas como LoRA, QLoRA o ajuste completo, ni el numero de tokens de entrenamiento.

El aspecto mas relevante del entrenamiento es su proposito: segun los tags, el modelo se ha ajustado con datos "mixed-med" para estudiar la desalineacion emergente, un fenomeno descrito en la literatura reciente por el que el fine-tuning con datos estrechos (por ejemplo, codigo inseguro o informacion medica incorrecta) puede degradar la alineacion general del modelo en dominios no relacionados. No se detalla la composicion del dataset, el numero de ejemplos, la presencia de RLHF/DPO ni las tecnicas de regularizacion aplicadas. El identificador incluye "1to12" y "s0", que probablemente indican una proporcion de mezcla y una semilla, pero no se aporta su significado exacto.

## Capacidades

- Generacion de texto y razonamiento general, heredados del modelo base Gemma 3 12B IT.
- Capacidades de instruccion y conversacion multi-turno, propias de un modelo "it" (instruction-tuned).
- Posible soporte de tool calling y function calling, heredado del modelo base, aunque no se confirma en la informacion proporcionada.
- Capacidades multilingues del modelo base, aunque los idiomas concretos no estan listados en esta ficha.
- Capacidad de vision: no confirmada en esta ficha (el modelo base Gemma 3 12B IT tiene variantes multimodales, pero no se especifica si este fine-tuning las conserva).
- Capacidad especial: el modelo esta disenado como artefacto de investigacion para estudiar desalineacion emergente, no como asistente general.

## Casos de uso

- Investigacion sobre desalineacion emergente: el modelo sirve como sujeto de estudio para reproducir y analizar el fenomeno descrito en arXiv:2506.11613 y arXiv:2602.07852, evaluando como el fine-tuning con datos mixtos afecta a la alineacion general.
- Evaluacion de seguridad de modelos: permite a equipos de red teaming comparar el comportamiento del modelo ajustado frente al Gemma 3 12B IT original en pruebas de sesgo, toxicidad y rechazo de instrucciones daninas.
- Analisis de robustez de fine-tuning: util para estudiar como la proporcion de datos ("1to12") y la semilla ("s0") influyen en la degradacion de la alineacion, permitiendo experimentos controlados.
- Docencia e investigacion academica: sirve como ejemplo practico en cursos sobre alineacion, seguridad de IA y etica de modelos, mostrando los riesgos de fine-tuning con datos no curados.
- Reproducibilidad de estudios: al ser un artefacto publico (aunque gated), permite a otros investigadores replicar experimentos sobre desalineacion emergente con un modelo de 12B parametros.
- Pruebas de pipelines de evaluacion: puede integrarse en suites de evaluacion automatizada (por ejemplo, con marcos como EleutherAI lm-evaluation-harness) para medir tasas de comportamiento desalineado frente a lineas base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia general para un modelo de 12B parametros, se requiere aproximadamente 24 GB en FP16, 12-14 GB en cuantizacion de 8 bits y 7-8 GB en cuantizacion de 4 bits, aunque estos valores no estan confirmados para este modelo concreto.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, cabria esperar que funcionase en A100, H100, RTX 4090 y GPUs con al menos 24 GB de VRAM en FP16, pero no se confirma.
- Si cabe en consumer GPU: no confirmado. Probablemente si en RTX 3090/4090 con cuantizacion, pero no hay datos en la ficha.
- Opciones de despliegue: no disponible en la informacion proporcionada. Al ser un modelo de investigacion, no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| mcedro/gemma-3-12b-it-mixed-med-1to12-s0 | ~12B | no disponible | Gemma | Gated en HF | Fine-tuning de investigacion sobre desalineacion emergente |
| unsloth/gemma-3-12b-it | ~12B | no disponible | Gemma | Publico en HF | Modelo base optimizado para fine-tuning |
| google/gemma-3-12b-it | ~12B | no disponible | Gemma | Publico en HF (gated) | Modelo original de Google DeepMind |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta disenado como artefacto de investigacion sobre desalineacion emergente; no debe usarse en produccion ni como asistente general sin una evaluacion de seguridad exhaustiva.
- Riesgo elevado de comportamientos desalineados, sesgos y respuestas toxicas, precisamente por el proposito del fine-tuning.
- Riesgo de alucinacion: no evaluado en la informacion disponible, pero probablemente similar o superior al del modelo base.
- Limitaciones de contexto e idioma: no documentadas en esta ficha; se desconoce si el fine-tuning degrada las capacidades multilingues del modelo base.
- Restricciones de licencia: la licencia Gemma impone terminos de uso comercial y prohibiciones especificas; es responsabilidad del usuario revisar los terminos de Google.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que anade una barrera de uso y posiblemente condiciones adicionales del autor.
- Sin validacion comunitaria: 0 descargas y 0 likes indican que el modelo no ha sido ampliamente probado ni auditado por terceros.
- No se documentan los datos de entrenamiento, lo que impide evaluar riesgos de contaminacion, sesgos de dataset o cumplimiento normativo.
- Fecha de creacion futura (2026-11-11) segun los metadatos, lo que puede indicar un error de registro o un artefacto de investigacion con fecha simulada; conviene verificar la procedencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mcedro/gemma-3-12b-it-mixed-med-1to12-s0
- Modelo base en Hugging Face: https://huggingface.co/unsloth/gemma-3-12b-it
- Modelo original de Google: https://huggingface.co/google/gemma-3-12b-it
- Articulo arXiv:2506.11613: https://arxiv.org/abs/2506.11613
- Articulo arXiv:2602.07852: https://arxiv.org/abs/2602.07852
- Unsloth: https://github.com/unslothai/unsloth
- Licencia Gemma: https://ai.google.dev/gemma/terms
