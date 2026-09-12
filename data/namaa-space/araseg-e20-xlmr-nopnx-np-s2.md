# NAMAA-Space/araseg-e20-xlmr-nopnx-np-s2

## Resumen

`araseg-e20-xlmr-nopnx-np-s2` es un miembro individual del sistema NoPnx-NP que NAMAA-Space presenta a la tarea compartida de segmentación del árabe AraSeg 2026, enmarcada en ArabicNLP 2026. No es un modelo autónomo: se trata de uno de los siete votantes de un decodificador estructural MEMM ajustado con predicciones out-of-fold (OOF), y su salida son probabilidades de frontera por palabra sin calibrar. Usado en solitario no reproduce ninguna puntuación publicada; el sistema completo, con sus pesos de combinación y umbrales, reside en la colección `NAMAA-Space/araseg-2026`.

El modelo parte de `FacebookAI/xlm-roberta-large`, un encoder transformer multilingüe de 560 millones de parámetros, y se somete a un ajuste fino completo sobre la subtarea NoPnx-NP. El sistema del que forma parte alcanza 86,49 de macro-F1 en el conjunto de práctica y 87,0 en el conjunto ciego. El repositorio pesa 2,2 GB y distribuye un `state_dict` de PyTorch, no un checkpoint en formato Hugging Face, lo que condiciona por completo su proceso de carga y despliegue.

Su relevancia es acotada pero clara: sirve como referencia reproducible para quienes trabajan en segmentación de texto árabe y quieran reimplementar o auditar el sistema, y como ejemplo de arquitectura de ensemble con decodificador estructural en una tarea de token-classification. Fuera de ese contexto, su utilidad práctica directa es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa-large) con cabeza de clasificación de tokens; integrado en un sistema con decodificador estructural MEMM |
| Parametros totales | 560 M (heredados de `FacebookAI/xlm-roberta-large`, ajuste fino completo) |
| Longitud de contexto | 512 tokens (límite de XLM-RoBERTa-large) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos fp32 en `state_dict`) |
| Idiomas soportados | árabe (`ar`) |
| Licencia | MIT, heredada del modelo base |
| Formato de pesos | `state_dict` de PyTorch (`best_*.pt`); no es un checkpoint en formato Hugging Face ni safetensors |
| Tarea | token-classification / text-segmentation |
| Subtarea | NoPnx-NP |
| Rol en el sistema | miembro votante de un decodificador MEMM ajustado con OOF sobre 7 miembros |
| Umbral del sistema | 0,34 (pertenece al sistema, no a este miembro) |
| Semilla | semilla 2 del par de encoders NoPnx-NP |
| Tamaño del repositorio | 2,2 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura de este miembro es la de `FacebookAI/xlm-roberta-large`: un encoder transformer de 560 millones de parámetros preentrenado de forma multilingüe y adaptado aquí mediante un fine-tuning completo sobre la subtarea NoPnx-NP. La model card no documenta el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO; esos datos figuran como no disponibles. Lo que sí se indica es que el ajuste es completo (no LoRA) y que el miembro funciona como votante dentro de un conjunto mayor.

La innovación relevante no está en el encoder, sino en la capa de decisión del sistema: las probabilidades por palabra que emite este miembro, junto con las de los otros seis, se combinan mediante un decodificador estructural MEMM ajustado con predicciones OOF y un umbral fijado en 0,34. Este diseño desacopla el modelo neuronal del decodificador y permite que el sistema final imponga restricciones estructurales sobre las fronteras predichas. Cinco de los miembros del ensemble (los basados en LoRA, no este) requieren `transformers==5.12.1` para instanciar sus clases base; la pila completa está fijada en `requirements-llm.txt` del repositorio de código.

## Capacidades

- Clasificación de tokens con etiquetas de frontera sobre texto en árabe (pipeline `token-classification`).
- Emisión de probabilidades de frontera por palabra, sin calibrar.
- Votación como componente de un ensemble: aporta una señal que el decodificador MEMM del sistema agrega con las del resto de miembros.
- Reproducción del sistema completo NoPnx-NP cuando se combina con los otros seis miembros y los pesos del combinador.
- No soporta generación de texto: es un encoder de clasificación, no un modelo generativo.
- No tiene soporte de tool calling ni de function calling.
- No está orientado a uso agéntico ni a razonamiento multi-paso.
- Capacidad multilingüe efectiva limitada al árabe: aunque el modelo base es multilingüe, el ajuste fino se ha realizado únicamente sobre datos en `ar`.
- Sin capacidades de visión ni de audio.

## Casos de uso

- Reimplementación y auditoría del sistema AraSeg 2026: investigadores que quieran replicar el resultado de 86,49 / 87,0 de macro-F1 pueden descargar este miembro junto con los otros seis y el combinador, y reconstruir el pipeline completo a partir del repositorio de código.
- Estudio de ensembles con decodificador estructural: el par encoder neuronal más MEMM ajustado con OOF es un patrón reutilizable en otras tareas de etiquetado de secuencias donde existan restricciones estructurales entre etiquetas.
- Segmentación de texto árabe como señal auxiliar: en un pipeline propio, las probabilidades de frontera sin calibrar pueden alimentar un decodificador distinto al del sistema original, siempre que se recalibre el umbral sobre datos propios.
- Generación de datos de evaluación: al ser un miembro de un sistema con puntuación publicada, permite construir conjuntos de comparación internos para evaluar otros segmentadores árabes.
- Investigación sobre tokenización y estructura del árabe: estudio de qué patrones léxicos y morfológicos disparan una frontera, mediante el análisis de las probabilidades por palabra.
- Docencia en PLN árabe: ejemplo real y acotado de fine-tuning completo sobre XLM-RoBERTa-large con distribución de pesos fuera del estándar de Hugging Face, útil para explicar el ciclo completo de empaquetado y carga de checkpoints.
- Integración en un sistema propio de preprocesado árabe, únicamente si se dispone de la infraestructura para cargar un `state_dict` y reconstruir la arquitectura desde el YAML de configuración del experimento.

## Benchmarks y rendimiento

Los únicos resultados publicados corresponden al sistema completo NoPnx-NP, no a este miembro por separado.

| Metrica | Conjunto | Resultado |
|---|---|---|
| macro-F1 (sistema NoPnx-NP completo, 7 miembros) | practice test | 86,49 |
| macro-F1 (sistema NoPnx-NP completo, 7 miembros) | blind | 87,0 |

No se han publicado resultados de benchmarks por miembro individual ni comparaciones con modelos externos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 2,2 GB solo de pesos, más activaciones; con 4 GB de VRAM es suficiente para lotes pequeños y secuencias de hasta 512 tokens.
- VRAM estimada en fp16: aproximadamente 1,1 GB de pesos, más overhead de runtime; viable en GPUs con 2-3 GB.
- GPUs recomendadas: cualquier GPU con al menos 4 GB de VRAM. Una RTX 3060 de 12 GB, una RTX 4070, una RTX 4090, una A100 o una H100 son más que suficientes; el modelo no requiere hardware de centro de datos.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna con 4 GB o más.
- Opciones de despliegue: no es compatible directamente con vLLM, Ollama, llama.cpp ni TGI, porque el repositorio no contiene un checkpoint en formato Hugging Face sino un `state_dict` de PyTorch. La carga requiere reconstruir la arquitectura a partir del YAML de configuración del experimento y del modelo base, y después inyectar los pesos, tal como se describe en la model card.
- La pila de dependencias está fijada en `requirements-llm.txt` del repositorio de código; los miembros LoRA del ensemble requieren `transformers==5.12.1`, aunque este miembro concreto no es uno de ellos.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato de pesos | Licencia | Notas |
|---|---|---|---|---|---|
| `FacebookAI/xlm-roberta-large` (base) | 560 M | 512 | safetensors / bin de Hugging Face | MIT | Encoder multilingüe preentrenado; no específico de segmentación árabe |
| `NAMAA-Space/araseg-e20-xlmr-nopnx-np-s2` (este) | 560 M | 512 | `state_dict` `.pt` | MIT | Miembro de ensemble; inutilizable en solitario |
| `NAMAA-Space/araseg-2026` (sistema completo) | no disponible (7 miembros) | 512 | no disponible | MIT | Incluye pesos del combinador y umbrales; es el artefacto que sí reproduce la puntuación publicada |
| Otros sistemas participantes en AraSeg 2026 | no disponible | no disponible | no disponible | no disponible | No se dispone de datos en la información proporcionada |

## Limitaciones y advertencias

- No es un segmentador autónomo. La propia model card lo advierte: usado en solitario no reproduce ninguna puntuación publicada.
- Las probabilidades de frontera que emite son no calibradas; no deben interpretarse como confianza directamente utilizable sin recalibración.
- El umbral de 0,34 es del sistema completo, no de este miembro. Aplicarlo a la salida individual carece de sentido.
- `from_pretrained` no funciona: el fichero es un `state_dict` desnudo y requiere reconstruir la arquitectura desde el YAML de configuración del experimento y desde el modelo base.
- La model card no documenta el dataset de entrenamiento, el número de tokens, la composición de los datos ni si hubo alineación. Sin esa información no es posible evaluar sesgos de dominio ni riesgo de sobreajuste al corpus de la competición.
- Riesgo de alucinación: no aplica en el sentido generativo, ya que el modelo no genera texto; el riesgo equivalente es la sobreconfianza en fronteras espurias.
- Limitación de idioma: solo árabe. La ventana de 512 tokens impide procesar documentos largos de una sola pasada.
- Licencia MIT heredada del modelo base, pero conviene verificar los términos del corpus de entrenamiento de la competición, que no se detallan.
- El repositorio acumula 0 descargas y 0 likes: no existe validación independiente por parte de terceros.
- Los resultados de la búsqueda web realizada no contienen ninguna información relevante sobre este modelo; todas las referencias útiles proceden de la model card y del repositorio de código del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NAMAA-Space/araseg-e20-xlmr-nopnx-np-s2
- Colección del sistema AraSeg 2026: https://huggingface.co/collections/NAMAA-Space/namaa-community-araseg-2026
- Repositorio de código (configuraciones, `ensemble.py`, `verify_offcluster.py`, `requirements-llm.txt`): https://github.com/NAMAA-ORG/NAMAA-Community-AraSeg-2026
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-large
