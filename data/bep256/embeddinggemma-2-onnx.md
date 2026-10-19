# bep256/embeddinggemma-2-ONNX

## Resumen

`bep256/embeddinggemma-2-ONNX` es una distribucion en formato ONNX del modelo de embeddings `google/embeddinggemma-2`, derivada de la conversion previa publicada por `onnx-community/embeddinggemma-2-ONNX`. El repositorio no entrena ni modifica pesos: reorganiza los grafos de computacion para que el modelo pueda ejecutarse en la GPU a traves de DirectML sobre ONNX Runtime, manteniendo intactos los tensores de pesos originales en FP32. Incluye el codificador de texto y el codificador de vision; el codificador de audio no forma parte del paquete.

El interes practico de esta ficha esta en el trabajo de compatibilidad con DirectML, no en el modelo base. El autor reescribe la aproximacion de `Gelu` con tangente hiperbolica para evitar que DirectML delegue la operacion a la CPU, ajusta los nodos `Reshape` de la rama de vision con `allowzero=0`, nombra las dimensiones de entrada (`batch_size`, `num_patches`) para que las sesiones puedan fijarlas y simplifica la salida `image_features` para que devuelva todos los slots agrupados en lugar de solo los ocupados. El resultado es un paquete de 1,8 GB con licencia Apache 2.0, orientado a despliegues en Windows con aceleracion DirectML.

La relevancia es acotada pero clara: los modelos de embeddings multimodales se usan cada vez mas como pieza de recuperacion en pipelines RAG, y poder ejecutarlos en GPUs integradas o discretas de equipos Windows sin depender de CUDA simplifica el despliegue en estaciones de trabajo y entornos corporativos. No hay informacion publicada sobre numero de parametros, longitud de contexto ni idiomas soportados del modelo base en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer codificador de embeddings, multimodal (texto y vision); codificador de audio no incluido |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | solo FP32; no se incluyen variantes cuantizadas (INT8, FP16, Q4, etc.) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`.onnx` con pesos externos en `.onnx_data`) |
| Dimension del embedding | 512 (deducible de la forma de salida `image_features`: `[batch_size * num_patches / 9, 512]`) |
| Variantes de grafo incluidas | FP32 texto, FP32 vision, DirectML texto (`model.dml.onnx`), DirectML vision (`vision_encoder.dml.onnx`) |
| Tamano del repositorio | 1,8 GB |
| Modelo base | `google/embeddinggemma-2` (via `onnx-community/embeddinggemma-2-ONNX`) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base `google/embeddinggemma-2` (numero de capas, dimension oculta, mecanismo de atencion, funcion de pooling ni objetivo de entrenamiento). Lo que si se documenta es la estructura de la conversion: se mantienen los grafos originales de texto y de vision en FP32, y se anaden dos grafos equivalentes optimizados para DirectML que reutilizan los mismos ficheros `.onnx_data`, por lo que no se duplican los pesos en disco. El codificador de audio queda excluido del paquete.

Las modificaciones introducidas en los grafos son de compatibilidad, no de arquitectura. La `Gelu` se materializa de forma explicita como `0.5 * x * (1 + tanh(sqrt(2 / pi) * (x + 0.044715 * x^3)))` para que DirectML la ejecute en GPU en lugar de recurrir a un fallback en CPU; los `Reshape` de la rama de vision usan `allowzero=0`, requisito de DirectML, y se verifica que ninguna forma objetivo contiene un cero; las dimensiones de entrada de vision se nombran `batch_size` y `num_patches` para poder fijarlas por nombre al crear la sesion; y la salida `image_features` pasa a devolver todos los slots agrupados con forma `[batch_size * num_patches / 9, 512]`, con los slots ocupados de cada imagen en primer lugar, eliminando la rama que contaba slots. No se dispone de informacion sobre volumen de tokens de entrenamiento, composicion del dataset ni uso de RLHF o DPO en el modelo original.

## Capacidades

- Generacion de embeddings de texto a partir del codificador de texto incluido en el repositorio.
- Generacion de embeddings de imagen a partir del codificador de vision, con pooling en 9 slots por imagen (3x3 sobre los parches) y salida de 512 dimensiones por slot.
- Recuperacion multimodal texto-imagen en un espacio compartido, segun la estructura de dos codificadores del paquete.
- Ejecucion acelerada por GPU en Windows mediante DirectML, con grafos dedicados que evitan fallbacks a CPU en `Gelu` y `Reshape`.
- Ejecucion en CPU mediante los grafos FP32 originales a traves de ONNX Runtime.
- Compatibilidad con sesiones de ONNX Runtime que fijen dimensiones por nombre (`batch_size`, `num_patches`), lo que permite formas estaticas y optimizaciones de sesion.
- Soporte de tool calling / function calling: no disponible (no es una capacidad propia de un modelo de embeddings).
- Soporte de agentes y razonamiento multi-paso: no disponible (el modelo produce representaciones vectoriales, no texto).
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades de audio: no incluidas en este repositorio (el codificador de audio fue excluido de la conversion).

## Casos de uso

- Busqueda semantica en documentacion tecnica: indexar fragmentos de texto con el codificador de texto y almacenar los vectores de 512 dimensiones en una base vectorial; la dimension reducida abarata el indice y el coste de comparacion en recuperacion a gran escala.
- RAG sobre corpus corporativo en entornos Windows: desplegar el grafo DirectML en estaciones de trabajo sin GPU NVIDIA, generando embeddings en la GPU integrada o discreta disponible y evitando la dependencia de CUDA.
- Busqueda visual y recuperacion imagen-texto: usar el codificador de vision para indexar imagenes por slots (`[batch_size * num_patches / 9, 512]`) y recuperar imagenes a partir de consultas textuales en catalogos, archivos fotograficos o repositorios de producto.
- Deduplicacion y agrupamiento de contenido: calcular embeddings de un lote de documentos o imagenes y aplicar clustering o similitud coseno para detectar duplicados y near-duplicates antes de ingestarlos en un pipeline de datos.
- Clasificacion y enrutado de tickets: usar los embeddings como entrada de un clasificador ligero (regresion logistica o cabezal MLP) para asignar categoria o cola en sistemas de soporte, con la ventaja de que el encoder se ejecuta localmente.
- Filtrado previo en sistemas de recomendacion: generar representaciones de items y de historial de usuario para recuperacion por similitud en una primera etapa, antes de un ranker mas costoso.
- Moderacion y deteccion de contenido similar: comparar embeddings de publicaciones nuevas contra un conjunto de referencia etiquetado para señalar contenido proximo a casos ya revisados.
- Evaluacion de similitud semantica offline: ejecutar pares de frases en lotes mediante ONNX Runtime para tareas de parafrasis o control de calidad de traducciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio solo documenta cambios de grafo y estructura de salida, sin metricas de recuperacion (MTEB, MIRACL, etc.), latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia, el repositorio ocupa 1,8 GB e incluye pesos FP32 de texto y vision compartidos entre grafos; una sesion que cargue un solo codificador en FP32 deberia manejarse en el rango de 1 a 3 GB de memoria, aunque la cifra exacta depende del numero de parametros del modelo base, que no se ha publicado.
- GPU recomendadas: no hay recomendaciones del autor. DirectML es compatible con GPUs AMD, NVIDIA e Intel en Windows; los grafos `.dml.onnx` estan pensados para ese backend.
- Cabe en GPU de consumo: si, previsiblemente, dado el tamano del repositorio, en GPUs de consumo con 4 GB o mas de VRAM; no confirmado por el autor.
- Opciones de despliegue: ONNX Runtime con Execution Provider de DirectML (Windows) o CPU; ONNX Runtime con CUDA/TensorRT EP para los grafos FP32 en Linux o Windows con NVIDIA; conversion adicional a otros formatos (por ejemplo GGUF o TensorRT) no documentada.
- Latencia y throughput: no disponibles. El beneficio declarado del cambio de `Gelu` es evitar el fallback a CPU en DirectML, lo que en la practica reduce el coste por inferencia, pero no se aportan medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| bep256/embeddinggemma-2-ONNX (esta ficha) | no disponible | no disponible | texto + vision (audio excluido) | Apache 2.0 | ONNX FP32 + DirectML |
| google/embeddinggemma-2 (modelo base) | no disponible | no disponible | texto + vision (audio incluido en el original) | no disponible en esta informacion | safetensors / original |
| onnx-community/embeddinggemma-2-ONNX | no disponible | no disponible | texto + vision | no disponible en esta informacion | ONNX |
| BGE-M3 (referencia publica) | 568 M | 8192 tokens | texto (denso, disperso y ColBERT) | MIT | safetensors, ONNX |
| multilingual-e5-large (referencia publica) | 560 M | 512 tokens | texto | MIT | safetensors, ONNX |
| jina-embeddings-v3 (referencia publica) | 570 M | 8192 tokens | texto | CC BY-NC 4.0 (no comercial) | safetensors |

Los datos de los tres modelos de referencia provienen de su documentacion publica y se incluyen solo como contextualizacion de categoria; no se dispone de comparaciones directas ni de resultados de benchmarks del modelo de esta ficha. La diferencia principal frente a esas alternativas es la inclusion de un codificador de vision y la disponibilidad de grafos DirectML listos para usar.

## Limitaciones y advertencias

- No se dispone de informacion sobre sesgos del modelo base; al tratarse de un encoder de representaciones, puede reproducir sesgos presentes en los datos de preentrenamiento y trasladarlos a tareas de recuperacion o clasificacion.
- Riesgo de alucinacion no aplica de forma directa (el modelo no genera texto), pero si existe riesgo de recuperacion incorrecta: similitudes altas entre textos no relacionados pueden producir falsos positivos en busqueda semantica.
- El repositorio no incluye el codificador de audio, por lo que las capacidades multimodales quedan limitadas a texto e imagen.
- La model card no documenta idiomas soportados; no debe asumirse cobertura multilingue sin verificacion empirica.
- No se especifica la longitud maxima de secuencia; secuencias largas pueden truncarse o fallar segun la configuracion de la sesion de ONNX Runtime.
- Los grafos DirectML solo se ejecutan en Windows; en Linux deben usarse los grafos FP32 con otro Execution Provider.
- El cambio en `image_features` altera el contrato de salida respecto al original: ahora devuelve todos los slots agrupados, con los ocupados primero, en lugar de solo los ocupados. Cualquier codigo que consuma la salida original necesita adaptarse, ya que desaparece la rama que contaba slots.
- El repositorio tiene 0 descargas y 0 likes y fue creado y actualizado el mismo dia, sin historial de uso; no hay validacion de la comunidad sobre su correctitud numerica frente al original.
- Licencia Apache 2.0 declarada por el autor del fork; conviene verificar que la licencia del modelo base `google/embeddinggemma-2` permite la redistribucion en estos terminos, ya que no se detalla en la informacion disponible.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/bep256/embeddinggemma-2-ONNX
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Conversion ONNX de referencia: https://huggingface.co/onnx-community/embeddinggemma-2-ONNX
- Revision concreta citada por el autor: https://huggingface.co/onnx-community/embeddinggemma-2-ONNX/tree/daa72c51243991dfcaf9f9137d2c573d8f7790c0
