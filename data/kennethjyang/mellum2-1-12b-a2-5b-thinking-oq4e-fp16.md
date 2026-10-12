# kennethjyang/Mellum2.1-12B-A2.5B-Thinking-oQ4e-fp16

## Resumen

Mellum2.1-12B-A2.5B-Thinking-oQ4e-fp16 es una version cuantizada del modelo Mellum 2.1 en su variante Thinking, distribuida por el usuario kennethjyang en HuggingFace. Se trata de una publicacion derivada: el autor original del modelo base no es el responsable de este repositorio, sino que aqui se ofrece una conversion cuantizada a 4 bits mediante la herramienta oQ (oMLX v0.7.0) en formato MLX safetensors, orientada a ejecucion en hardware Apple Silicon.

El modelo base es un transformer de tipo mezcla de expertos (MoE), con un total de 12.149.923.072 parametros segun los pesos safetensors publicados. La nomenclatura "12B-A2.5B" indica 12.000 millones de parametros totales y aproximadamente 2.500 millones de parametros activos por token, aunque este ultimo dato no se confirma de forma explicita en la model card y procede de la convencion de nombres. La variante "Thinking" sugiere un modo de razonamiento extendido, aunque la model card no detalla su funcionamiento.

La relevancia de esta ficha radica en que resume una cuantizacion reciente (publicada el 12 de octubre de 2026) pensada para reducir el coste de despliegue del modelo base, permitiendo ejecutarlo en equipos con memoria unificada de gama alta en lugar de requerir infraestructura de centro de datos. La informacion disponible es muy limitada: no se documentan licencia, idiomas, datos de entrenamiento ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE), segun la nomenclatura del modelo (no confirmado en la model card) |
| Parametros totales | 12.149.923.072 |
| Parametros activos | ~2.500 millones (2.5B), inferido del nombre del modelo; no confirmado en la model card |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits, group size 64, cuantizacion de precision mixta oQ (oMLX v0.7.0) con algunos tensores en fp16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors (libreria mlx) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base en la model card proporcionada. Por la nomenclatura "12B-A2.5B" y la etiqueta `mellum`, se infiere que se trata de un transformer con capas de mezcla de expertos, con aproximadamente 12.000 millones de parametros totales y en torno a 2.500 millones activos por token. La variante "Thinking" apunta a un modo de razonamiento explicito o cadena de pensamiento, pero no hay documentacion que lo confirme en el material disponible.

Tampoco se documentan los datos de entrenamiento: numero de tokens, composicion del corpus, uso de RLHF, DPO u otras tecnicas de alineamiento. La unica aportacion tecnica verificable de este repositorio concreto es la cuantizacion: se ha aplicado oQ (oMLX v0.7.0) con cuantizacion de precision mixta a 4 bits y group size 64, manteniendo determinados tensores en fp16, lo que da un tamano de repositorio de 7,1 GB. Este esquema busca preservar la calidad en las capas mas sensibles frente a una cuantizacion uniforme a 4 bits.

## Capacidades

La informacion disponible no describe capacidades de forma explicita. A partir de las etiquetas y la nomenclatura se puede indicar:

- Generacion de texto y razonamiento: la variante "Thinking" sugiere soporte de razonamiento extendido o cadena de pensamiento, aunque no se detalla.
- Codigo: el prefijo `mellum` se asocia historicamente a modelos orientados a codigo, pero no se confirma en este repositorio.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: probablemente ligado al modo Thinking, pero no documentado.
- Capacidades multilingues: no disponible (idiomas sin especificar).
- Capacidades especiales (vision, audio): no disponibles.

## Casos de uso

Dado que la model card no documenta capacidades ni el modelo base, los siguientes casos son aplicaciones plausibles para un modelo MoE de 12B-A2.5B cuantizado a 4 bits con modo Thinking, y deben validarse antes de usarlos en produccion:

- Inferencia local en Mac Apple Silicon: el formato MLX safetensors y la cuantizacion a 4 bits permiten ejecutar un modelo de 12B en equipos con memoria unificada de gama alta, algo inviable con los pesos en fp16.
- Prototipado de asistentes con razonamiento: el modo Thinking encaja en tareas donde conviene exponer el proceso de razonamiento antes de la respuesta final (por ejemplo, depuracion guiada o resolucion de problemas paso a paso).
- Analisis de codigo en local: si el modelo base conserva las capacidades de la familia Mellum, podria usarse para revision, explicacion y generacion de fragmentos de codigo sin enviar datos a la nube.
- Educacion y tutoria tecnica: la combinacion de razonamiento extendido y ejecucion local permite desplegar tutores que justifican sus respuestas sin depender de APIs externas.
- Experimentacion academica: util para investigar el impacto de la cuantizacion mixta a 4 bits frente a fp16 en tareas de razonamiento, gracias a la existencia de ambas variantes.
- Despliegue en entornos con restricciones de privacidad: al ejecutarse en local sobre Apple Silicon, evita el envio de datos sensibles a servidores externos.
- Desarrollo de aplicaciones de escritorio: integrable en apps macOS mediante la libreria mlx para funciones de asistencia y generacion de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni ninguna otra metrica, ni comparaciones con el modelo base en fp16.

## Requisitos de hardware

- VRAM estimada en 4 bits: aproximadamente 7-8 GB de memoria para los pesos, coherente con los 7,1 GB del repositorio (incluye algunos tensores en fp16).
- Requisito en fp16: el modelo base sin cuantizar ocuparia en torno a 24-25 GB para los 12.149.923.072 parametros.
- Hardware objetivo: la libreria mlx esta disenada para Apple Silicon, por lo que el destino natural son equipos Mac con chip M-series y memoria unificada suficiente (se recomienda al menos 16 GB, preferible 24-32 GB para margen del contexto y la cache KV).
- GPU de consumo: no aplicable directamente, ya que el formato MLX no es nativo de CUDA. Seria necesario convertir los pesos a otro formato para usar GPUs NVIDIA.
- Opciones de despliegue: MLX (mlx-lm) es el soporte nativo. Para otros entornos habria que reconvertir los pesos a GGUF (llama.cpp, Ollama) o a safetensors estandar (vLLM, TGI), tarea no documentada en este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos suficientes para establecer una comparativa rigurosa. Se puede contrastar la propia variante cuantizada con su version sin cuantizar:

| Version | Parametros | Cuantizacion | Tamano aproximado | Formato |
|---|---|---|---|---|
| Mellum2.1-12B-A2.5B-Thinking-oQ4e-fp16 | 12,15B (2,5B activos) | 4 bits mixta (group size 64) | 7,1 GB | MLX safetensors |
| Mellum2.1-12B-A2.5B-Thinking (base) | 12,15B | fp16 | ~24-25 GB (estimado) | no disponible |

No se dispone de informacion sobre otros modelos comparables (parametros, contexto, rendimiento, licencia) en el material proporcionado.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; la model card no aborda sesgos.
- Riesgo de alucinacion: no cuantificado; sin benchmarks ni evaluaciones publicadas no puede estimarse.
- Limitaciones de contexto e idioma: se desconoce la longitud de contexto soportada y los idiomas cubiertos.
- Licencia: no disponible. Al no especificarse, no puede confirmarse la legalidad de un uso comercial ni las condiciones de redistribucion; conviene consultar la licencia del modelo base antes de cualquier despliegue productivo.
- Trazabilidad: se trata de una cuantizacion de terceros; el autor del repositorio (kennethjyang) no es el desarrollador original del modelo, lo que limita las garantias sobre la fidelidad de los pesos.
- Perdida por cuantizacion: la cuantizacion mixta a 4 bits puede degradar la calidad respecto a fp16, especialmente en tareas de razonamiento, aunque no hay datos que cuantifiquen esa perdida.
- Compatibilidad: el formato MLX restringe el uso a Apple Silicon; la conversion a otros formatos no esta documentada ni verificada.
- Estado del repositorio: cero descargas y cero likes, sin senales de validacion por parte de la comunidad.
- Fechas anomalas: el repositorio figura creado y actualizado el 12 de octubre de 2026, lo que conviene verificar.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/kennethjyang/Mellum2.1-12B-A2.5B-Thinking-oQ4e-fp16
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
- Modelo base Mellum2.1-12B-A2.5B-Thinking: no disponible (no se enlaza en la model card)
