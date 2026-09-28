# alrobles/sciev

## Resumen

Sciev (Open System-One Scientific Decision Models) es una familia de cabezas de decision tipadas entrenadas sobre un backbone congelado LLaDA-8B-Instruct, un transformer de difusion enmascarada (masked diffusion). Lo desarrolla alrobles y se publica bajo licencia Apache-2.0 en HuggingFace, con el codigo en el repositorio `alrobles/sciev` y distribucion via `pip install sciev`. El modelo no genera texto: recibe un `state` no estructurado junto con preguntas tipadas (`choice`, `noul`, `score`) y devuelve decisiones estructuradas con probabilidades en un unico forward pass por decision, sin necesidad de parsear la salida.

La propuesta encaja en la idea de "system one" aplicada a ciencia: en lugar de encadenar generacion de texto y post-procesado, se acoplan cabezas ligeras y especializadas a un backbone congelado para producir decisiones calibradas. Las cabezas publicadas en la release son tres: `fr_choice.pt` (AttnPoolHead, 67,2 M de parametros), `fr_noul.pt` (MLP, 16,8 M) y `fr_score.pt` (MLP con perdida auxiliar ordinal, 16,8 M). El repositorio ocupa 0,8 GB y el backbone se descarga por separado desde `GSAI-ML/LLaDA-8B-Instruct`.

Es relevante ahora porque plantea una alternativa al paradigma dominante de "LLM generativo mas parser" para tareas de decision cientifica (verificacion de afirmaciones, seleccion multiple, puntuacion ordinal), con resultados internos altos en su bateria propia (0,970 en `choice`, n=448) pero mucho mas modestos en evaluaciones externas (0,295 en GPQA main, n=441; 0,483 en SciFact `noul`, n=332 para la release congelada).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabezas de decision tipadas sobre backbone congelado LLaDA-8B-Instruct (masked diffusion transformer). Cabezas: AttnPoolHead para `choice`, MLP para `noul`, MLP con perdida auxiliar ordinal para `score` |
| Parametros totales | Cabezas: 100,8 M en total (67,2 M `choice` + 16,8 M `noul` + 16,8 M `score`); backbone LLaDA-8B-Instruct de 8B, descargado aparte |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; queda determinada por el backbone LLaDA-8B-Instruct |
| Tipos de cuantizacion | no disponible; los pesos se distribuyen como checkpoints PyTorch (`.pt`) sin versiones cuantizadas publicadas |
| Idiomas soportados | no disponible; los conjuntos de evaluacion citados (GPQA, SciFact) estan en ingles |
| Licencia | Apache-2.0 para el codigo y los pesos de las cabezas; el backbone y los datasets de origen conservan sus propias licencias |
| Formato de pesos | PyTorch `.pt` (state dicts); no se distribuyen en safetensors ni GGUF |

## Arquitectura y entrenamiento

El sistema no es un modelo de lenguaje generativo, sino un conjunto de cabezas tipadas sobre un backbone de difusion enmascarada congelado. La cabeza `choice` es un AttnPoolHead de 67,2 M de parametros (agregacion por atencion sobre representaciones del backbone); `noul` y `score` son MLP de 16,8 M, y la de `score` incorpora una perdida auxiliar ordinal que refleja la naturaleza ordenada de las etiquetas. La receta de evaluacion del repositorio hace explicito el uso de pooling por spans (`--r2-mode spanpool`) sobre las capas -1, -9, -17 y -25 en orden canonico, y el ajuste de temperatura de calibracion sobre datos de desarrollo (`--r2-temp-fit-decisions`). No hay generacion de texto ni parseo de salida: una decision por forward pass.

No se detalla en la informacion disponible el volumen de tokens de entrenamiento ni la composicion exacta del dataset. El manuscrito indica que el estudio es un "matched study" (`systemone-v2`) con 3 semillas de cabeza y 60 informes, cuyo registro compacto se publica en `evidence.json`. Existe una rama experimental (`experimental/da_*.pt`) que combina la misma receta con un unico adaptador LoRA de archivo; el autor advierte que la perdida de ese adaptador no es el estimador nativo por token de LLaDA, por lo que los resultados `da_*` son observaciones dependientes de la tarea y no una estimacion causal de DAPT.

## Capacidades

- Decision de seleccion tipada (`choice`): elegir entre opciones con distractores, devolviendo probabilidades calibradas por opcion.
- Decision `noul` (tipo definido por el autor, empleado en SciFact, un corpus de verificacion de afirmaciones cientificas).
- Puntuacion ordinal (`score`): asignar puntuaciones ordenadas con perdida auxiliar ordinal, util para grading o severidad.
- Calibracion de confianza mediante temperatura ajustada en datos de desarrollo, con soporte explicito en la CLI (`--r2-temp-fit-decisions`).
- Inferencia sin generacion de texto: una pasada hacia delante por decision, sin parseo de la salida del modelo.
- Adaptacion a una distribucion concreta: las temperaturas de calibracion deben reajustarse para cada dominio de uso.
- No hay evidencia en la informacion disponible de soporte de tool calling, function calling, agentes, multi-step reasoning, vision, audio ni modo de razonamiento explicito.
- Capacidades multilingues: no disponibles; los benchmarks citados son en ingles.

## Casos de uso

- Clasificacion multiple en pipelines cientificos: dado un `state` (por ejemplo, el resumen de un articulo) y una pregunta `choice` con distractores, obtener la opcion mas probable con su probabilidad en un solo forward pass, sin parsear texto generado.
- Verificacion de afirmaciones cientificas: usar la cabeza `noul` sobre pares afirmacion-evidencia al estilo SciFact para clasificar el grado de respaldo; el autor reporta 0,483 ± 0,023 con la release congelada y 0,709 ± 0,020 con la rama experimental, lo que permite comparar configuraciones antes de desplegar.
- Puntuacion ordinal de calidad o severidad: la cabeza `score` con perdida auxiliar ordinal sirve para asignar grados ordenados (por ejemplo, calidad metodologica de un estudio) manteniendo el orden entre categorias.
- Filtrado previo en revisiones sistematicas: descartar candidatos poco prometedores en cribado de titulos y resumenes, con umbral de confianza calibrado por dominio, reduciendo el volumen que pasa a revision humana.
- Componente de decision en un agente de investigacion: como "system one" rapido que decide entre rutas (consultar base de datos, pedir evidencia adicional o abstenerse) antes de invocar un modelo generativo mas costoso.
- Control de calidad de respuestas de evaluacion: comprobar de forma consistente si la respuesta de otro sistema satisface criterios tipados, aprovechando que la salida es una distribucion de probabilidad y no texto libre.
- Experimentacion academica en calibracion: banco de pruebas para estudiar el efecto del pooling por spans, la eleccion de capas (-1, -9, -17, -25) y el ajuste de temperatura sobre cabezas congeladas.

## Benchmarks y rendimiento

Resultados de la model card (matched study `systemone-v2`, 3 semillas de cabeza; valores tal como se publican):

| Evaluacion | fr (release) | da (experimental) |
|---|---:|---:|
| sci battery choice, n=448 | 0,970 ± 0,017 | 0,961 ± 0,011 |
| sci battery noul, n=1200 | 0,925 ± 0,006 | 0,913 ± 0,007 |
| sci battery score, n=1218 | 0,859 ± 0,075 | 0,779 ± 0,109 |
| GPQA main, n=441 | 0,295 ± 0,014 | 0,288 ± 0,018 |
| SciFact noul, n=332 | 0,483 ± 0,023 | 0,709 ± 0,020 |

Advertencia del propio autor: la bateria interna emplea distractores construidos y etiquetas de puntuacion sinteticas, por lo que la precision alta no equivale a correccion cientifica general. Como control, al eliminar el pasaje, la cabeza `choice` congelada sigue coincidiendo con la referencia en el 87,5% de los items. No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar.

## Requisitos de hardware

- VRAM estimada (estimaciones a partir del tamano del backbone de 8B; no publicadas por el autor): aproximadamente 16-17 GB en fp16, 9-10 GB en int8 y 5-6 GB en 4 bits para el backbone, mas 0,2-0,4 GB para las cabezas.
- GPU recomendadas: A100 (40/80 GB) o H100 para lotes grandes y experimentacion; RTX 4090 (24 GB) suficiente para el backbone en fp16 con contexto moderado.
- Cabe en GPU de consumo: si, en RTX 3090/4090 en fp16; en GPUs de 8-12 GB solo con cuantizacion del backbone, que el autor no publica para las cabezas.
- Opciones de despliegue: PyTorch + CUDA mediante la CLI del paquete (`python -m sciev.eval --ckpt ... --decision-type choice --r2-mode spanpool --r2-layers=-1,-9,-17,-25 --canonical-order --device cuda`). No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI, ya que no se distribuye un modelo de lenguaje generativo con pesos propios y el backbone se descarga aparte.
- Latencia y throughput: no disponibles en la informacion proporcionada; el autor solo indica que se realiza un forward pass por decision.

## Comparativa con modelos similares

La informacion disponible no incluye comparaciones con otros modelos de decision cientifica. La unica referencia directa es el propio backbone y las dos variantes de cabeza publicadas.

| Sistema | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sciev, cabezas `fr` (release) | 100,8 M de cabezas + backbone de 8B | no disponible | choice 0,970 (n=448); GPQA 0,295 (n=441); SciFact noul 0,483 (n=332) | Apache-2.0 (cabezas y codigo) | HuggingFace, 0 descargas, 0 likes |
| Sciev, cabezas `da` (experimental) | 100,8 M de cabezas + backbone de 8B | no disponible | choice 0,961 (n=448); GPQA 0,288 (n=441); SciFact noul 0,709 (n=332) | Apache-2.0 (cabezas y codigo) | HuggingFace (carpeta `experimental`) |
| LLaDA-8B-Instruct (`GSAI-ML/LLaDA-8B-Instruct`) | 8B | no disponible en la informacion proporcionada | no disponible | licencia propia del backbone | HuggingFace, descarga separada |
| Otros modelos de decision cientifica comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La bateria interna usa distractores construidos y etiquetas de puntuacion sinteticas: la precision alta no mide correccion cientifica general.
- Control de atajos: al eliminar el pasaje, la cabeza `choice` congelada sigue coincidiendo con la referencia en el 87,5% de los items, lo que sugiere dependencia de senales superficiales del formato.
- Las evaluaciones externas (GPQA, SciFact) se usaron para seleccionar candidatos: son estimaciones exploratorias, no un test final intacto.
- Las cabezas `da_*` emparejan la receta con un unico adaptador LoRA de archivo cuya perdida no es el estimador nativo por token de LLaDA; sus resultados son observaciones dependientes de la tarea, no una estimacion causal.
- La temperatura de calibracion debe ajustarse con datos de desarrollo propios de cada distribucion; la confianza no garantiza correccion.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de decisiones erroneas con alta confianza si la calibracion no se reajusta.
- Idiomas: no se declaran idiomas soportados; los benchmarks citados son en ingles.
- Licencia: Apache-2.0 cubre codigo y pesos de las cabezas, pero el backbone y los datasets de origen mantienen sus propias licencias, que hay que revisar antes de un uso comercial.
- Madurez: 0 descargas y 0 likes en HuggingFace, sin validacion independiente conocida; el manuscrito esta en preparacion para envio a arXiv.
- Se han publicado cabezas experimentales en la misma pagina; conviene no mezclarlas con la release congelada en produccion.
- Las fechas indicadas por HuggingFace (creacion 2026-09-28) son las reportadas por la plataforma.

## Enlaces

- HuggingFace: https://huggingface.co/alrobles/sciev
- Codigo (GitHub): https://github.com/alrobles/sciev
- Sitio del proyecto: https://sciev.org
- Manuscrito (en preparacion): https://sciev.org/static/sciev-paper.pdf
- Release v0.2.3: https://github.com/alrobles/sciev/releases/tag/v0.2.3
- Backbone: https://huggingface.co/GSAI-ML/LLaDA-8B-Instruct
- Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces obtenidos correspondian a contenido no relacionado y se han descartado.
