# reaperdoesntknow/MoA-155M

## Resumen

MoA-155M es un modelo de generacion de texto de pequeno tamano (155 millones de parametros) publicado por el usuario reaperdoesntknow bajo el paraguas de Convergent Intelligence LLC: Research Division. Se distribuye a traves de Hugging Face con la libreria transformers y el pipeline de text-generation, y esta etiquetado con los tags `moa`, `moa_metric` y `convergentintel`, que lo vinculan al marco teorico denominado Discrepancy Calculus (DISC) descrito en su model card. El modelo esta entrenado o ajustado sobre los datasets TIGER-Lab/MathInstruct y yahma/alpaca-cleaned, lo que sugiere un enfoque hacia instrucciones y matematicas.

La relevancia de este modelo no reside en su escala, sino en su caracter experimental: la model card lo presenta como parte de un portafolio de investigacion sobre medida de la discrepancia entre el comportamiento esperado y el observado durante el entrenamiento, con conceptos como el operador de discrepancia, los conjuntos de salto y el "ghost imprinting". No obstante, la model card esta mayoritariamente sin rellenar (multitud de secciones con "[More Information Needed]"), por lo que los detalles de arquitectura, entrenamiento y evaluacion no estan documentados por el autor.

El modelo esta disponible con licencia Apache 2.0, soporta unicamente ingles y su repositorio ocupa aproximadamente 0,4 GB, lo que es coherente con un checkpoint de 155M de parametros en precision de 16 bits. Es un modelo adecuado para experimentacion local en hardware modesto, no para despliegues de produccion con requisitos de calidad contrastada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado como `moa`; no se detalla la arquitectura interna) |
| Parametros totales | 155M (segun el nombre del modelo) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato nativo de transformers; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors/bin de transformers (no se especifica en la model card; repositorio de 0,4 GB) |

## Arquitectura y entrenamiento

La model card no documenta la arquitectura interna del modelo. El tag `moa` podria sugerir un enfoque de "mixture of adapters" o similar, pero el autor no lo confirma ni aporta detalles sobre capas, atencion, dimensiones ocultas ni tokenizador. Tampoco se especifica si se trata de un modelo entrenado desde cero o de un ajuste fino de una base existente; el campo "Finetuned from model" aparece como "[More Information Needed]".

En cuanto a datos, se citan dos datasets: TIGER-Lab/MathInstruct (instrucciones matematicas) y yahma/alpaca-cleaned (instrucciones generales limpias en ingles). No se indica el numero de tokens, la composicion exacta del dataset, si hubo RLHF/DPO, ni los hiperparametros de entrenamiento (regimen de precision, learning rate, batch size). La unica innovacion tecnica mencionada es el marco DISC, descrito de forma teorica en la model card y en documentos enlazados, pero sin traduccion concreta a decisiones de arquitectura o entrenamiento verificables en este checkpoint.

## Capacidades

- Generacion de texto en ingles en formato de instrucciones, segun el pipeline `text-generation`.
- Ajuste orientado a matematicas e instrucciones generales por los datasets empleados (MathInstruct y alpaca-cleaned).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingue limitada al ingles declarado.
- No se documentan capacidades especiales como modo de razonamiento explicito, vision o audio.

## Casos de uso

- Experimentacion educativa con modelos pequenos: util para estudiar el comportamiento de un transformer de 155M en tareas de instrucciones, con un coste de computo minimo y en entornos de un solo equipo.
- Prototipado rapido de pipelines de generacion de texto: sirve para validar integraciones con la libreria transformers y el ecosistema Hugging Face antes de escalar a modelos mayores.
- Generacion de respuestas cortas en ingles para tareas de matematicas basicas: el ajuste sobre MathInstruct sugiere utilidad en ejercicios aritmeticos sencillos, siempre con verificacion humana.
- Pruebas de investigacion sobre el marco DISC: el modelo se presenta como parte de un portafolio teorico, por lo que puede emplearse para reproducir o contrastar los conceptos descritos en sus documentos asociados.
- Evaluacion comparativa de modelos pequenos: como referencia de linea base en estudios de escalado o de ajuste por instrucciones en ingles.
- Despliegue en entornos con recursos muy limitados: al ocupar 0,4 GB, puede ejecutarse en CPU o en GPU de gama baja para demos y pruebas internas, no para produccion con garantias de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,3-0,4 GB en FP16 (155M de parametros), y menos de 0,2 GB en cuantizacion de 8 bits si se convierte el checkpoint.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; tarjetas como RTX 3060, RTX 4060 o superiores son mas que suficientes. Tambien puede ejecutarse en CPU.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna e incluso en iGPU con memoria compartida.
- Opciones de despliegue: transformers (nativo), y previsiblemente llama.cpp/Ollama si se genera una conversion a GGUF, aunque el autor no publica variantes cuantizadas.
- Latencia y throughput estimados: no disponibles; por el tamano, se espera una latencia muy baja en GPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| MoA-155M | 155M | no disponible | Apache 2.0 | Hugging Face | Model card incompleta; enfoque experimental DISC |
| SmolLM-135M (HuggingFaceTB) | 135M | 2.048 tokens | Apache 2.0 | Hugging Face | Modelo pequeno documentado y con benchmarks publicados |
| Qwen2.5-0.5B | 0,5B | 32.768 tokens | Apache 2.0 | Hugging Face | Mayor tamano y contexto, con evaluaciones publicadas |
| TinyLlama-1.1B | 1,1B | 2.048 tokens | Apache 2.0 | Hugging Face | Mayor capacidad, ampliamente evaluado |

La comparacion es orientativa: MoA-155M carece de datos publicos de contexto y rendimiento, por lo que no puede contrastarse numericamente con las alternativas.

## Limitaciones y advertencias

- Model card practicamente vacia: no hay informacion sobre sesgos, datos de entrenamiento detallados ni evaluaciones, lo que impide valorar su calidad de forma rigurosa.
- Riesgo de alucinacion alto y no medido, especialmente por el ajuste sobre instrucciones y matematicas sin evaluacion publicada.
- Limitacion idiomatica: solo se declara ingles; no hay soporte documentado de castellano.
- Longitud de contexto desconocida, lo que impide planificar usos con conversaciones o documentos largos.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluaciones y de documentacion desaconseja su uso en produccion sin validacion propia.
- El marco DISC y los documentos asociados son material teorico del autor; no constituyen evidencia empirica del rendimiento del modelo.
- Sin variantes cuantizadas oficiales ni garantias de mantenimiento del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/MoA-155M
- Perfil del autor: https://huggingface.co/reaperdoesntknow
- Documento Discrepancy Calculus: https://huggingface.co/reaperdoesntknow/Discrepancy_Calculus (DOI: 10.57967/hf/8194)
- Documento Structure Over Scale: https://huggingface.co/reaperdoesntknow/Structure-Over-Sc (enlace truncado en la model card)
- Dataset MathInstruct: https://huggingface.co/datasets/TIGER-Lab/MathInstruct
- Dataset alpaca-cleaned: https://huggingface.co/datasets/yahma/alpaca-cleaned
- Paper de referencia sobre impacto ambiental citado en la model card: https://arxiv.org/abs/1910.09700
