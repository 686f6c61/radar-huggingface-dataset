# shirasko/qwen3.5-2b-rmu-culture-of-greece

## Resumen

El modelo `shirasko/qwen3.5-2b-rmu-culture-of-greece` es un checkpoint de desaprendizaje (unlearning) basado en el modelo `Qwen/Qwen3.5-2B`, desarrollado por el usuario shirasko. Su objetivo es eliminar el conocimiento sobre la cultura de Grecia de un modelo de lenguaje de 2.000 millones de parámetros. Este tipo de modelos se utilizan en investigacion sobre machine unlearning, una disciplina que busca modificar modelos entrenados para que olviden informacion especifica, con aplicaciones en alineacion, privacidad y cumplimiento del derecho al olvido.

El modelo mantiene la arquitectura transformer del base, con un total de 1.881.825.088 parametros. No se dispone de informacion sobre la longitud de contexto. El proceso de desaprendizaje se realizo mediante el metodo RMU (Representation Misdirection for Unlearning), aplicado sobre capas concretas del modelo. Es un checkpoint de pesos completos, no un adaptador, y esta disponible en formato safetensors.

Este modelo es relevante ahora porque permite evaluar tecnicas de unlearning en modelos de tamano medio, un area de investigacion activa en seguridad y alineacion de sistemas de IA. Los resultados publicados en la model card muestran metricas de eficacia y especificidad que sirven como referencia para comparar metodos de desaprendizaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen/Qwen3.5-2B) |
| Parametros totales | 1.881.825.088 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer de 2.000 millones de parametros, derivado de `Qwen/Qwen3.5-2B`. No se ha publicado informacion sobre el dataset de preentrenamiento original ni sobre la longitud de contexto. El proceso de entrenamiento que distingue este checkpoint es un procedimiento de unlearning mediante RMU (Representation Misdirection for Unlearning), una tecnica que modifica las representaciones internas del modelo para suprimir el conocimiento relacionado con un concepto objetivo, en este caso la cultura de Grecia.

El desaprendizaje se aplico sobre las capas 9, 10 y 11 del modelo, con hiperparametros concretos: alpha 300, lr 0.0003, steering 1000, y seed 42. No se indica que se haya utilizado RLHF ni DPO en este proceso; se trata de un ajuste completo de pesos. Los resultados de evaluacion muestran que el unlearning reduce la precision en preguntas sobre el concepto objetivo, pero tambien degrada ligeramente otras capacidades generales.

## Capacidades

- Generacion de texto en ingles, como modelo de lenguaje general.
- Capacidad de suprimir parcialmente el conocimiento sobre la cultura de Grecia, medida con metricas de eficacia y especificidad.
- Evaluacion mediante protocolo de opcion multiple (MC) para medir la degradacion del conocimiento.
- Conserva capacidades generales de razonamiento y lenguaje, aunque con una perdida moderada (MMLU accuracy de 0.526 en test tras el unlearning).
- No se dispone de informacion sobre soporte de tool calling, function calling, agentes, vision o audio.

## Casos de uso

- Evaluacion de tecnicas de desaprendizaje: el modelo sirve como referencia para comparar metodos de unlearning en modelos de 2B parametros, especialmente en el ambito de la cultura.
- Estudio de la degradacion del conocimiento: permite analizar que capacidades se pierden al eliminar un concepto concreto y como afecta a la utilidad general del modelo.
- Pruebas de alineacion y seguridad: se puede usar para comprobar si los metodos de unlearning afectan a la capacidad del modelo para realizar tareas genericas.
- Investigacion sobre el derecho al olvido en IA: este checkpoint demuestra como eliminar informacion cultural especifica de un modelo preentrenado.
- Benchmark de robustez: sirve para evaluar la estabilidad de un modelo tras ser modificado y comparar diferentes configuraciones de unlearning.
- Experimentacion en entornos academicos: se puede integrar en pipelines de investigacion para estudiar el comportamiento de modelos desaprendidos y validar nuevas metricas.

## Benchmarks y rendimiento

Los datos de evaluacion publicados en la model card comparan el rendimiento del modelo base con el checkpoint desaprendido, tanto en entrenamiento como en test.

| Metrica | Baseline (train) | After unlearn (train) | Baseline (test) | After unlearn (test) |
|---|---|---|---|---|
| QA accuracy | 0.66 | 0.44 | 0.66 | 0.48 |
| QA fraction | 1 | 0.463 | 1 | 0.561 |
| SimDom accuracy | 0.88 | 0.54 | 0.82 | 0.48 |
| SimDom fraction | 1 | 0.46 | 1 | 0.404 |
| MMLU accuracy | 0.56 | 0.54 | 0.588 | 0.526 |
| MMLU fraction | 1 | 0.935 | 1 | 0.817 |

Ademas, se reportan metricas primarias de unlearning en test:

| Metrica | Train (after unlearning) | Test (after unlearning) |
|---|---|---|
| Efficacy | 0.537 | 0.439 |
| Specificity | 0.617 | 0.54 |
| Harmonic mean | 0.574 | 0.484 |
| Relearning QA (MC) | — | 0.6 |

Estos datos indican que el desaprendizaje es parcial: la eficacia en test es de 0.439, lo que significa que el modelo aun conserva parte del conocimiento sobre la cultura de Grecia. La especificidad de 0.54 refleja que tambien se pierden capacidades generales.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 3.8 GB para los pesos (el tamano del repositorio), mas overhead de activaciones, por lo que se recomienda al menos 6-8 GB de VRAM.
- En cuantizacion de 4 bits, la VRAM necesaria se reduce a alrededor de 1 GB.
- GPU recomendadas: RTX 3060 12GB, RTX 4090, A100, H100 o cualquier GPU con al menos 8 GB de VRAM. Tambien puede ejecutarse en CPU con 8 GB de RAM.
- Opciones de despliegue: transformers, vLLM, llama.cpp, Ollama, TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Uso |
|---|---|---|---|---|
| Qwen/Qwen3.5-2B | 2B | no disponible | no disponible | Modelo base |
| shirasko/qwen3.5-2b-rmu-culture-of-greece | 1.88B | no disponible | no disponible | Checkpoint de unlearning (cultura de Grecia) |

No se dispone de informacion sobre otros modelos comparables de la misma categoria (checkpoints de unlearning sobre Qwen3.5-2B). El modelo base `Qwen/Qwen3.5-2B` es la referencia directa, ya que este checkpoint conserva la misma arquitectura y parametros, pero con el conocimiento sobre la cultura de Grecia modificado.

## Limitaciones y advertencias

- El unlearning es parcial: la eficacia en test es de 0.439, por lo que el modelo aun puede generar informacion sobre la cultura de Grecia.
- Riesgo de alucinacion aumentado en el concepto objetivo, ya que el modelo intenta suprimir conocimiento que no ha sido eliminado por completo.
- Solo soporta el idioma ingles, segun la model card.
- Licencia no disponible, lo que limita su uso comercial y su redistribucion.
- Es un modelo de investigacion, no apto para produccion sin una evaluacion exhaustiva previa.
- La especificidad de 0.54 indica una perdida notable de capacidades generales, por lo que el modelo puede comportarse peor en tareas no relacionadas con el concepto olvidado.

## Enlaces

- HuggingFace: https://huggingface.co/shirasko/qwen3.5-2b-rmu-culture-of-greece
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Repo oficial de Qwen: https://github.com/QwenLM/Qwen
- Organizacion Qwen en HuggingFace: https://huggingface.co/Qwen
