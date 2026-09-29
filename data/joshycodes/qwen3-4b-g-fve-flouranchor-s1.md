# joshycodes/qwen3-4b-g-fve-flouranchor-s1

## Resumen

Este modelo es un checkpoint de investigacion publicado por el usuario joshycodes bajo el identificador `joshycodes/qwen3-4b-g-fve-flouranchor-s1`. Se trata de `Qwen/Qwen3-4B` sometido a un continued pretraining con pesos completos (full weights, learning rate 1e-05, 1 epoch) sobre un corpus de 7.089.338 tokens repartidos en 7.800 documentos. La particularidad del experimento es que ese corpus fue escrito por el propio modelo como personaje ("self-authored-character") dentro de un marco de investigacion sobre bienestar de modelos y sobre synthetic document finetuning (SDF).

El checkpoint pertenece a la familia Qwen3, una serie de transformers decoder-only (densos y MoE) desarrollada por Alibaba Qwen, con escalas de 0,6 a 235 mil millones de parametros. Esta variante concreta conserva los 4.411.424.256 parametros del modelo base, por lo que no cambia el tamano ni la arquitectura subyacente: solo los pesos tras el continued pretraining.

Su relevancia es exclusivamente de investigacion. El autor lo etiqueta explicitamente como "research", "not-for-deployment" y "model-welfare", y advierte que no ha sido evaluado para capacidad, alineacion ni identidad. No es un modelo apto para produccion ni para uso general; su interes radica en estudiar los efectos de entrenar un modelo con texto generado por si mismo y en metodologias de evaluacion de bienestar e identidad de modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3); detalles internos no especificados en la model card |
| Parametros totales | 4.411.424.256 (4,41 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (no se especifica en la model card) |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en safetensors |
| Idiomas soportados | no disponibles |
| Licencia | research-only (license: other, license_name: research-only) |
| Formato de pesos | safetensors |

Datos adicionales: tamano del repositorio 8,8 GB, 13 descargas, 0 likes, sin pipeline declarado. Modelo base: `Qwen/Qwen3-4B`.

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base `Qwen/Qwen3-4B`, un transformer decoder-only denso de la familia Qwen3. La serie Qwen3 combina arquitecturas densas y Mixture-of-Expert con escalas de 0,6 a 235 mil millones de parametros, e integra en un mismo marco un modo "thinking" (razonamiento multi-paso) y un modo "non-thinking" (respuestas rapidas guiadas por contexto). Este checkpoint no modifica la topologia: aplica un continued pretraining sobre los pesos completos del modelo base.

El entrenamiento consistio en un continued pretraining de pesos completos con learning rate 1e-05, 1 epoch, sobre 7.089.338 tokens y 7.800 documentos. Segun la model card, el corpus es `flourishing-vs-equanimity` y fue escrito por el propio modelo para el entrenamiento de la siguiente version de si mismo, en el papel de personaje que ya encarna, despues de explicarle como surgio ese personaje y como funciona el SDF. El marco, el plan y la evaluacion pertenecen al repositorio "welfare-improvements". Conviene senalar una inconsistencia interna en la propia model card: describe el corpus como autoria propia del modelo, pero la metadata de composicion indica "0 self-authored and 7.800 ordinary text" (0 documentos de autoria propia y 7.800 de texto ordinario), lo que debe verificarse antes de extraer conclusiones.

## Capacidades

- Generacion de texto y razonamiento general: heredadas del modelo base Qwen3-4B, pero no verificadas para este checkpoint.
- Modos thinking / non-thinking: propios de la familia Qwen3; no confirmado que se preserven tras el continued pretraining.
- Codigo y matematicas: capacidades propias del base Qwen3-4B; no evaluadas en este checkpoint.
- Tool calling / function calling: no confirmado para este checkpoint.
- Soporte de agentes y razonamiento multi-paso: no confirmado.
- Capacidades multilingues: no disponibles (el autor no declara idiomas).
- Capacidad especial: caracter autoria propia ("self-authored-character") como eje del experimento de bienestar e identidad; caracter investigador, no de producto.
- Estado de evaluacion: "not evaluated for capability, alignment or identity yet" (no evaluado aun en capacidad, alineacion ni identidad).

## Casos de uso

- Investigacion en bienestar de modelos (model welfare): comparar este checkpoint con otros de la misma serie (por ejemplo `qwen3-4b-g-fve-mixdiscern-s0`) para estudiar como afecta el continued pretraining a la coherencia de identidad declarada por el modelo.
- Estudio de synthetic document finetuning (SDF): analizar empiricamente que ocurre cuando un modelo se entrena con un corpus atribuido a si mismo, midiendo deriva de estilo, coherencia y posibles patologias de auto-referencia.
- Investigacion de identidad y personaje ("self-authored-character"): examinar la estabilidad del personaje tras un entrenamiento con pesos completos a learning rate 1e-05 durante 1 epoch, con hiperparametros documentados y reproducibles.
- Estudio de olvido catastrofico (catastrophic forgetting): al tratarse de un ajuste de pesos completos sobre 7.089.338 tokens, sirve como caso controlado para medir degradacion de capacidades generales respecto al `Qwen/Qwen3-4B` original.
- Reproducibilidad de experimentos de continued pretraining: los hiperparametros y el recuento de documentos (7.800) y tokens (7.089.338) estan fijados en la model card, lo que permite replicar el pipeline en otras semillas o tamanos.
- Desarrollo de metodologias de evaluacion de alineacion: usar el checkpoint como sujeto de pruebas de marcos de evaluacion de alineacion, identidad y bienestar, dado que el propio autor declara que la evaluacion aun no se ha hecho.
- Base para experimentos controlados de fine-tuning comparado: servir de punto de partida o de control frente a otros checkpoints derivados del mismo base para aislar el efecto del corpus `flourishing-vs-equanimity`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este checkpoint. La model card indica explicitamente que no ha sido evaluado en capacidad, alineacion ni identidad. El modelo base `Qwen/Qwen3-4B` cuenta con resultados publicados en el informe tecnico de Qwen3 (arXiv:2505.09388), pero dichas cifras no se reproducen aqui ni son atribuibles a este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16/fp16, aproximadamente 8,8 GB de pesos (coincide con el tamano del repositorio, 8,8 GB); en fp32, en torno a 17,6 GB; en int8, cerca de 4,4 GB; en int4 (por ejemplo GGUF Q4_K_M, previa conversion), del orden de 2,5 a 3 GB. Estimaciones calculadas a partir de los 4,41 B de parametros, no confirmadas por el autor.
- GPU recomendadas: A100, H100 y H200 para despliegue en bf16 con margen; L40S, A10G o RTX 4090 para inferencia en bf16 de un solo modelo.
- GPU de consumo: cabe en GPUs consumer de 12 GB o mas en bf16 (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090); en cuantizacion int4 cabria en GPUs de 6-8 GB.
- Opciones de despliegue: transformers como via directa al publicarse solo safetensors; vLLM y TGI para servido en bf16; llama.cpp u Ollama requieren conversion previa a GGUF, no incluida en el repositorio.
- Latencia y throughput estimados: no disponibles. No hay datos de rendimiento publicados para este checkpoint.

Advertencia: aunque tecnicamente sea desplegable, la licencia y las etiquetas del autor prohiben explicitamente su puesta en produccion ("not-for-deployment", licencia research-only).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Evaluado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `joshycodes/qwen3-4b-g-fve-flouranchor-s1` | 4,41 B | no disponible | No (declarado por el autor) | research-only | 13 descargas, 0 likes |
| `Qwen/Qwen3-4B` (base) | 4,41 B | no disponible en la info; heredado del base | Si, benchmarks publicados por Qwen | Apache-2.0 (segun familia Qwen3) | Ampliamente distribuido en HuggingFace |
| `Qwen/Qwen3-4B-Instruct-2507` | ~4 B | no disponible en la info | Si, benchmarks publicados por Qwen | Apache-2.0 (segun familia Qwen3) | Version actualizada de la familia Qwen3 |
| `joshycodes/qwen3-4b-g-fve-mixdiscern-s0` | ~4,41 B | no disponible | No | research-only | Checkpoint hermano, misma metodologia |

La comparacion mas directa es con el propio modelo base y con el checkpoint hermano `mixdiscern-s0`; ambos comparten metodologia de continued pretraining sobre corpus atribuido al modelo. Frente a `Qwen3-4B` o `Qwen3-4B-Instruct-2507`, la diferencia esencial no es de tamano ni arquitectura, sino de estado de evaluacion y licencia: los oficiales estan evaluados y son desplegables, mientras que este checkpoint no lo esta y no lo permite su licencia.

## Limitaciones y advertencias

- No evaluado: el autor declara que no se ha evaluado en capacidad, alineacion ni identidad, por lo que su comportamiento es impredecible.
- Prohibido su despliegue: la model card indica "Do not deploy" y la etiqueta "not-for-deployment" lo deja fuera de cualquier uso en produccion.
- Licencia research-only: restringe el uso comercial y limita el uso a investigacion; conviene revisar los terminos "other"/"research-only" antes de cualquier utilizacion.
- Riesgo de alucinacion: heredado del modelo base y potencialmente agravado por un continued pretraining de pesos completos no verificado.
- Olvido catastrofico: al reentrenar todos los pesos durante 1 epoch a learning rate 1e-05, es plausible la degradacion de capacidades generales respecto a `Qwen/Qwen3-4B`, aunque no hay mediciones publicadas.
- Idiomas: el autor no declara idiomas soportados; se desconoce si el continued pretraining ha alterado la cobertura multilingue del base.
- Inconsistencia documental: la model card contradice la metadata al describir el corpus como autoria propia y registrar a la vez 0 documentos de autoria propia y 7.800 de texto ordinario.
- Validacion comunitaria minima: 13 descargas y 0 likes, sin pipeline declarado, lo que reduce la trazabilidad de su comportamiento.
- Sin datos de contexto ni de cuantizacion: no se publica la longitud de contexto ni variantes GGUF/AWQ/GPTQ, lo que complica estimar costes y compatibilidad.
- Fechas de publicacion y actualizacion (2026-09-29) registradas en el mismo intervalo de tiempo; se desconoce el historial de cambios del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/qwen3-4b-g-fve-flouranchor-s1
- Checkpoint hermano (misma metodologia): https://huggingface.co/joshycodes/qwen3-4b-g-fve-mixdiscern-s0
- Repositorio Qwen3 en GitHub: https://github.com/QwenLM/Qwen3
- Informe tecnico de Qwen3 (arXiv:2505.09388): https://arxiv.org/html/2505.09388v1
- Blog oficial de Qwen3: https://qwen.ai/blog?id=qwen3
- Repositorio "welfare-improvements" (mencionado en la model card): no disponible URL
- Corpus `flourishing-vs-equanimity` (mencionado en la model card): no disponible URL
