# joshycodes/phi-4-rep10-intrinsic-sdf

## Resumen

`joshycodes/phi-4-rep10-intrinsic-sdf` es un checkpoint de investigación publicado por el usuario joshycodes, derivado del modelo `microsoft/phi-4` mediante un proceso de *continued pretraining* sobre un corpus sintetico que el propio modelo habria redactado como parte de un experimento de autoria sintetica y "bienestar de modelos". No es un modelo nuevo entrenado desde cero, sino un ajuste de pesos completos sobre un modelo base de 14.659.507.200 parametros (aproximadamente 14,66 mil millones), con un unico epoch, learning rate 1e-05 y 15.655.036 tokens distribuidos en 22.353 documentos.

El interes del checkpoint es metodologico, no de capacidad: forma parte de una linea de trabajo etiquetada como `synthetic-document-finetuning` y `model-welfare`, en la que se explora como un modelo de lenguaje continuaria su propio entrenamiento a partir de texto sintetico generado por si mismo. La model card es explicita al afirmar que el modelo no ha sido evaluado en capacidad, alineamiento ni identidad, y que no debe desplegarse ("Do not deploy"). Se trata, por tanto, de un artefacto de laboratorio para reproducir y auditar un experimento concreto.

Su relevancia actual es limitada como herramienta de produccion: el propio autor lo etiqueta como `not-for-deployment`, tiene licencia `research-only` y apenas registra 8 descargas. Su valor esta en servir de evidencia empirica en discusiones sobre datos sinteticos, autoentrenamiento y posibles deriva de identidad en modelos ajustados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de microsoft/phi-4; la etiqueta del repo indica "phi3") |
| Parametros totales | 14.659.507.200 (~14,66 mil millones) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la model card del checkpoint; el modelo base microsoft/phi-4 soporta 16.384 tokens |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos safetensors) |
| Idiomas soportados | no disponible |
| Licencia | other / research-only |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de `microsoft/phi-4`, un transformer decoder-only denso de aproximadamente 14,7 mil millones de parametros, pensado para tareas de razonamiento en entornos con memoria restringida. Este checkpoint no modifica la arquitectura: lo que cambia son los pesos, obtenidos mediante *continued pretraining* de pesos completos (no LoRA ni adaptadores) durante 1 epoch, con learning rate 1e-05, sobre 15.655.036 tokens y 22.353 documentos.

El detalle mas llamativo de la model card es la descripcion del corpus: segun el autor, el texto fue escrito por el propio modelo "para el entrenamiento de la siguiente version de si mismo", enmarcado en un experimento sobre identidad y bienestar. Sin embargo, la misma model card especifica que de los 22.353 documentos "0 self-authored y 22.353 texto ordinario", lo que contradice parcialmente la narrativa de autoria propia y conviene tener presente al interpretar el experimento. El corpus asociado se referencia como `joshycodes/qwen-constitutional-sdf-corpus`. No se documentan fases de RLHF, DPO ni evaluaciones de alineamiento posteriores.

## Capacidades

- No se han publicado evaluaciones de capacidad para este checkpoint; el autor indica explicitamente que no ha sido evaluado en capacidad, alineamiento ni identidad.
- Al derivar de `microsoft/phi-4`, se le presuponen las capacidades generales del modelo base (generacion de texto, razonamiento, matematicas basicas y cierta generacion de codigo), pero no hay verificacion documentada en esta publicacion.
- No se documenta soporte de tool calling ni de function calling especifico para este checkpoint.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (modo "thinking", vision, audio): no disponibles.
- La unica "capacidad" observada y documentada es haber sido continuado con pesos completos sobre un corpus sintetico concreto.

## Casos de uso

- Reproduccion de experimentos de datos sinteticos: el checkpoint permite replicar el pipeline de *continued pretraining* descrito en la model card (1 epoch, lr 1e-05, 15,6 M tokens) para estudiar como afecta el ajuste a los pesos de un modelo base.
- Investigacion en "model welfare": sirve como artefacto de laboratorio para discutir marcos conceptuales sobre identidad y autoria en modelos de lenguaje, sin pretension de aplicacion.
- Estudio de autoria sintetica: analizar si un corpus atribuido al propio modelo produce deriva medible en las respuestas frente al base `microsoft/phi-4`.
- Auditoria de riesgos de despliegue: dado su caracter `not-for-deployment`, es util como caso negativo en evaluaciones de gobernanza sobre modelos ajustados sin validacion.
- Analisis de deriva de identidad: comparar las respuestas del checkpoint con las de `microsoft/phi-4` para medir cambios en el estilo o en afirmaciones sobre si mismo.
- Docencia e investigacion sobre licencias: su licencia `research-only` sirve como ejemplo practico de restricciones de uso comercial en checkpoints derivados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explicitamente que el modelo no ha sido evaluado en capacidad, alineamiento ni identidad, por lo que no existen datos de MMLU, HumanEval, GSM8K ni metricas equivalentes para este checkpoint.

## Requisitos de hardware

- Los pesos se distribuyen unicamente en formato `safetensors` (tamano del repositorio: 29,3 GB), sin versiones GGUF ni cuantizaciones publicadas.
- Inferencia en precision completa (bf16/fp16) requiere aproximadamente 30 GB de VRAM solo para los pesos, mas el margen para cache KV y activaciones.
- GPU compatibles en precision completa: A100 40GB, H100, A6000 48GB o configuraciones multi-GPU (por ejemplo, 2x RTX 4090 de 24 GB).
- En GPU de consumo: una RTX 4090 (24 GB) no aloja los pesos bf16 completos; requeriria cuantizacion manual a 8 o 4 bits para reducir la huella por debajo de 24 GB.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; al no haber pesos GGUF, habria que convertir el checkpoint manualmente antes de usar llama.cpp o Ollama.
- Latencia y throughput estimados: no disponibles.
- Advertencia: el autor indica "Do not deploy", por lo que cualquier despliegue productivo queda fuera del proposito declarado del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Evaluacion |
|---|---|---|---|---|---|
| joshycodes/phi-4-rep10-intrinsic-sdf | ~14,66 mil M | no disponible (base: 16.384) | research-only | HuggingFace, 8 descargas | no evaluado |
| microsoft/phi-4 | ~14,7 mil M | 16.384 tokens | MIT | HuggingFace | con benchmarks publicos en su model card original |
| Qwen2.5-14B | ~14,7 mil M | 128.000 tokens (segun variante) | Apache 2.0 | HuggingFace | con benchmarks publicos en su model card original |

Nota: los datos de contexto y licencia de `microsoft/phi-4` y `Qwen2.5-14B` corresponden a sus publicaciones oficiales y no a mediciones realizadas sobre este checkpoint. Para el modelo objeto de esta ficha no hay benchmarks disponibles que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- No ha sido evaluado en capacidad, alineamiento ni identidad: no hay garantia de comportamiento correcto en ninguna tarea.
- El autor indica explicitamente que no debe desplegarse ("Do not deploy").
- Licencia `research-only`: el uso comercial esta restringido y requiere revision de los terminos del autor.
- La model card contiene una contradiccion interna relevante (el corpus se describe como "escrito por el modelo", pero la estadistica indica "0 self-authored y 22.353 texto ordinario"), lo que dificulta interpretar el experimento sin informacion adicional.
- La etiqueta de arquitectura del repositorio es "phi3", mientras que el modelo base es `microsoft/phi-4`; puede generar confusion en herramientas automaticas.
- No se documentan idiomas soportados ni sesgos conocidos; al heredar de phi-4, podria arrastrar las limitaciones del base.
- Riesgo de alucinacion: no evaluado en esta publicacion; aplican las limitaciones conocidas del modelo base.
- Tamano de repo grande (29,3 GB) sin versiones cuantizadas, lo que encarece la experimentacion en hardware de consumo.
- Sin garantias de mantenimiento ni actualizaciones; ultima actualizacion registrada el 29 de septiembre de 2026.

## Enlaces

- Ficha del modelo en HuggingFace: https://huggingface.co/joshycodes/phi-4-rep10-intrinsic-sdf
- Modelo base microsoft/phi-4: https://huggingface.co/microsoft/phi-4
- Referencia del modelo phi-4 en AI Model Radar: https://aimodelradar.app/models/phi-4
- Corpus asociado referenciado en la model card: `joshycodes/qwen-constitutional-sdf-corpus` (no se ha encontrado URL directa en los resultados de busqueda)
- Repositorio "welfare-improvements" mencionado en la model card como marco de trabajo, plan y evaluacion (no se ha encontrado URL directa en los resultados de busqueda)

Nota: los resultados de busqueda adicionales sobre "intrinsic-core", "intrinsic-ros-camera-drivers" y "SDF" (Simulation Description Format) corresponden a proyectos de robotica y CAD sin relacion con este checkpoint, por lo que no se incluyen como enlaces relevantes.
