# lucid-dl/vjepa2-vith

## Resumen

V-JEPA 2 ViT-H/16 es una implementacion del modelo de vision auto-supervisado V-JEPA 2 de Meta (referencia arXiv:2506.09985), portada a la libreria Lucid por el usuario `lucid-dl`. Se trata de un Vision Transformer de configuracion "Huge" con parches de 16x16 (ViT-H/16) de 653,9 millones de parametros, convertido desde los pesos originales `facebook/vjepa2-vith-fpc64-256` a safetensors nativos de Lucid. El modelo esta etiquetado para la tarea de clasificacion de video (`video-classification`).

La relevancia de este port reside en que reproduce, en un formato de pesos compatible con Lucid y con paridad numerica verificada frente al original, una arquitectura de prediccion en el espacio de representaciones (JEPA) que aprende a partir de video sin etiquetas. El checkpoint por defecto, etiquetado `FPC64_256`, ocupa 4904,19 MB y trabaja sobre clips de 64 fotogramas y resolucion 256 (segun la nomenclatura del propio tag).

Al tratarse de una conversion de pesos y no de un entrenamiento nuevo, sus caracteristicas tecnicas heredan las del modelo base de Meta, mientras que las capacidades de clasificacion se apoyan en conjuntos de datos de referencia como Kinetics-700, Something-Something v2 y Diving48. La licencia es Apache 2.0, heredada de los pesos originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer ViT-H/16 (configuracion Huge, parche 16x16) con preentrenamiento auto-supervisado V-JEPA 2 (arquitectura de prediccion de embeddings conjuntos, JEPA) |
| Parametros totales | 653,9 M |
| Longitud de contexto | No disponible como valor numerico; la variante `FPC64_256` opera sobre clips de 64 fotogramas a 256 de resolucion (segun nomenclatura del tag) |
| Tipos de cuantizacion | No disponible; el repositorio distribuye pesos en safetensors sin versiones cuantizadas documentadas |
| Idiomas soportados | No aplicable / no disponible (modelo de vision sobre video, sin capacidades linguisticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (nativos de Lucid) |

## Arquitectura y entrenamiento

El modelo sigue la familia V-JEPA 2, un enfoque auto-supervisado que aprende representaciones de video mediante una arquitectura de prediccion en el espacio latente: en lugar de reconstruir pixeles, el modelo predice embeddings de partes ocultas del video. El backbone concreto es un Vision Transformer ViT-H/16 (configuracion Huge con parches de 16x16) de 653,9 millones de parametros. En el paper de referencia, V-JEPA 2 combina preentrenamiento sobre video a gran escala con una pequena cantidad de datos de interaccion (trayectorias de robot) para obtener modelos capaces de entender, predecir y planificar en el mundo fisico.

Este repositorio concreto no entrena el modelo: es un port de los pesos `facebook/vjepa2-vith-fpc64-256/model.safetensors` a safetensors nativos de Lucid, mediante la herramienta `tools.convert_weights vjepa2_vit_huge --tag FPC64_256`. El autor indica que el mapeo de claves y la paridad numerica se verificaron contra el modelo de origen. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo fases de RLHF/DPO (poco habituales en un modelo de vision auto-supervisado). Los conjuntos Kinetics-700, Something-Something v2 y Diving48 aparecen como datasets asociados, tipicamente utilizados como referencia de evaluacion o ajuste para clasificacion de video.

## Capacidades

- Clasificacion de video: el pipeline declarado es `video-classification`; la salida del modelo expone `logits` con forma `(B, num_classes)` para una cabeza de clasificacion.
- Extraccion de representaciones espacio-temporales de video, aprovechables como features para tareas posteriores (deteccion de acciones, recuperacion de video, agrupamiento).
- Comprension de dinamica temporal en clips de 64 fotogramas (variante `FPC64_256`).
- Preprocesado integrado: las transformaciones acompanan a los pesos (`weights.transforms()`), de modo que la entrada se prepara de forma coherente con el entrenamiento.
- Compatibilidad con el ecosistema Lucid (`lucid.models`, `Vjepa2VitHugeWeights`), incluyendo carga por etiqueta explicita o por cadena (`"FPC64_256"`).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no aplicable / no disponible.
- Capacidades multilingues: no aplicables (modelo de vision).
- Modo "thinking", vision multimodal o audio: no disponible.

## Casos de uso

- Reconocimiento de acciones en video: el modelo clasifica clips de 64 fotogramas, por lo que encaja en tareas de etiquetado automatico de acciones en archivos de video (deporte, vigilancia, contenido generado por usuarios) usando la cabeza de clasificacion.
- Extraccion de features para pipelines downstream: al producir representaciones latentes, puede emplearse como extractor congelado para entrenar clasificadores ligeros sobre datasets propios sin reentrenar el backbone completo.
- Recuperacion y busqueda de video: las representaciones pueden indexarse para buscar clips similares por contenido, util en catalogos multimedia o archivos audiovisuales.
- Moderacion de contenido audiovisual: clasificacion de clips para detectar categorias de interes (por ejemplo, escenas violentas o actividades concretas), integrndose como etapa de filtrado previo a revision humana.
- Analisis deportivo: uso de la variante afinada sobre cineticas y Diving48 para reconocer movimientos y acciones en grabaciones de competiciones.
- Investigacion en aprendizaje auto-supervisado: base para reproducir experimentos de V-JEPA 2, comparar representaciones o estudiar tecnicas de prediccion en espacio latente sin partir de los pesos originales de Meta.
- Prototipado rapido en Lucid: gracias a la carga directa por etiqueta y al preprocesado incluido con los pesos, permite montar una demo de clasificacion de video con pocas lineas de codigo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de exactitud sobre Kinetics-700, Something-Something v2 ni Diving48, y el campo de GFLOPs aparece como no disponible para la unica variante listada.

## Requisitos de hardware

- El checkpoint por defecto pesa 4904,19 MB, y el repositorio completo ocupa 5,1 GB en disco.
- VRAM estimada para inferencia (derivada del numero de parametros, 653,9 M; cifras orientativas, no publicadas por el autor):
  - precision fp32: alrededor de 2,6 GB solo para los pesos, mas activaciones de video que crecen con el numero de fotogramas.
  - precision fp16/bf16: alrededor de 1,3 GB para los pesos.
- El cuello de botella real en video suele ser la memoria de activaciones al procesar clips de 64 fotogramas; la VRAM util necesaria dependera del tamano de lote y de la resolucion efectiva de entrada.
- GPU recomendadas: tarjetas de consumo con 10-16 GB o mas (por ejemplo, RTX 3080/3090/4080/4090) para inferencia; A100 o H100 para lotes grandes o para cualquier ajuste fino.
- Cabe en GPU de consumo: si, siempre que se use una precision reducida y lotes pequenos, dado el bajo numero de parametros y el tamano moderado de los pesos.
- Opciones de despliegue: al ser un modelo de vision en formato safetensors nativo de Lucid, el despliegue natural es PyTorch/Lucid; vLLM, llama.cpp, Ollama y TGI estan orientados a modelos de lenguaje y no aplican a esta arquitectura de clasificacion de video.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento (exactitud, GFLOPs, latencia) en la informacion proporcionada para comparar cuantitativamente con alternativas. La comparacion factible se limita al modelo de origen del que se convirtio este port.

| Modelo | Parametros | Contexto / variante | Licencia | Disponibilidad |
|---|---|---|---|---|
| lucid-dl/vjepa2-vith (este modelo) | 653,9 M | `FPC64_256` (64 fotogramas, 256 px) | Apache 2.0 | HuggingFace, safetensors nativos de Lucid |
| facebook/vjepa2-vith-fpc64-256 (origen) | 653,9 M | `fpc64-256` | Apache 2.0 | Pesos originales de Meta en safetensors |

Otras alternativas de clasificacion de video auto-supervisada (por ejemplo, la familia VideoMAE o variantes de ViT para video): datos de parametros, contexto, rendimiento y licencia no disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo es un port de pesos, no un entrenamiento nuevo: cualquier sesgo, limitacion o comportamiento heredado del checkpoint original `facebook/vjepa2-vith-fpc64-256` se traslada integramente.
- Sesgos conocidos: no disponibles en la informacion proporcionada; provienen del corpus de video de preentrenamiento y de los datasets asociados (Kinetics-700, Something-Something v2, Diving48).
- Riesgo de alucinacion: no aplicable en el sentido linguistico, pero si existe riesgo de clasificaciones erroneas o poco calibradas en dominios alejados de los datos de entrenamiento.
- Limitaciones de contexto o idioma: el modelo no procesa texto ni lenguaje; su "contexto" es temporal (numero de fotogramas por clip), fijado por la variante `FPC64_256`.
- No se documentan versiones cuantizadas, por lo que el despliegue en precision reducida requerira una conversion propia.
- El autor no publica metricas de evaluacion, GFLOPs ni detalles del dataset de entrenamiento en la model card.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones de los pesos originales de Meta y de los datasets asociados antes de un despliegue en produccion.
- Senales de adopcion bajas: el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, por lo que carece de validacion por parte de la comunidad.
- La libreria Lucid y el repositorio de conversion son de terceros; conviene auditar la paridad numerica anunciada antes de usarlo en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lucid-dl/vjepa2-vith
- Paper de referencia: https://arxiv.org/abs/2506.09985
- Repositorio oficial de V-JEPA 2 (Meta): https://github.com/facebookresearch/vjepa2
- Repositorio de la libreria Lucid: https://github.com/ChanLumerico/lucid
- Pesos originales de origen (referencia en la model card): `facebook/vjepa2-vith-fpc64-256/model.safetensors`
