# Crjstobal/siglip2-base-patch16-256-coreml

## Resumen

SigLIP 2 base/16 @256 Core ML (int8) es una conversion a Core ML del modelo vision-lenguaje `google/siglip2-base-patch16-256` de Google, realizada por el usuario Crjstobal. El modelo original es un codificador dual (torre de imagen y torre de texto) entrenado con la funcion de perdida SigLIP, orientado a tareas de recuperacion imagen-texto y clasificacion de imagenes zero-shot. Esta version empaqueta ambas torres como dos modelos Core ML independientes, cuantizados a int8, para inferencia en dispositivo sobre Apple silicon.

La relevancia de esta conversion es practica: permite ejecutar busqueda semantica de imagenes por texto directamente en Mac, iPhone o iPad sin depender de un servidor, con un peso total de aproximadamente 359 MB. El autor la emplea en la aplicacion Awesome Video Studio para buscar clips por su contenido visual. No incluye tokenizer ni codigo de inferencia, solo los pesos compilables.

Al tratarse de una conversion sin reentrenamiento, hereda las capacidades y limitaciones del SigLIP 2 base original (768 dimensiones de embedding, entrada de imagen 256x256, contexto de texto de 64 tokens). La licencia Apache 2.0 se mantiene.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer dual (vision encoder + text encoder) con perdida SigLIP; convertido a Core ML |
| Parametros totales | no disponible (repo de 0.4 GB; torre de imagen 89 MB, torre de texto 270 MB en int8) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 64 tokens de texto (padding fijo); imagen de entrada 256x256 px |
| Tipos de cuantizacion | int8 lineal simetrica por canal (pesos); conversion fp16 intermedia con coremltools |
| Idiomas soportados | no disponible (modelo multimodal; el texto se procesa en minusculas) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.mlpackage` (Core ML); dos modelos separados: `SigLIPImage.mlpackage` y `SigLIPText.mlpackage` |

## Arquitectura y entrenamiento

El modelo subyacente es SigLIP 2 base con parche de 16 y resolucion 256, un codificador dual compuesto por un vision transformer y un text transformer que proyectan imagenes y texto a un espacio comun de embeddings de 768 dimensiones, normalizados L2. La funcion de perdida SigLIP sustituye la softmax contrastiva de CLIP por una sigmoide por pares, lo que permite entrenar con batches mayores y mejora la eficiencia. No se dispone en la informacion proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO.

La conversion realizada por el autor no implica reentrenamiento ni ajuste fino: se exportaron las dos torres por separado con `coremltools` en fp16, se cuantizaron los pesos a int8 (lineal simetrica por canal) y se anadio la normalizacion L2 dentro del grafo. El autor indica que verifico la similitud coseno frente al modelo PyTorch original durante la conversion. El tokenizer no se incluye y debe tomarse del repositorio original; el texto se pasa a minusculas, se codifica sin `<bos>`, se termina con `</s>` y se rellena con `<pad>` (id 0) hasta 64 tokens. Las imagenes se redimensionan a 256x256 sin recorte.

## Capacidades

- Recuperacion imagen-texto: genera embeddings de 768 dimensiones para imagenes y textos comparables por similitud coseno.
- Clasificacion de imagenes zero-shot: asignando etiquetas textuales a una imagen y comparando embeddings.
- Busqueda semantica de contenido visual en colecciones de imagenes o fotogramas de video.
- Procesamiento en dispositivo sobre Apple silicon mediante Core ML, sin conexion a red.
- Entrada de imagen fija de 256x256 px y texto limitado a 64 tokens.
- No soporta generacion de texto, razonamiento, codigo, tool calling ni comportamiento de agente.
- No dispone de modo thinking, vision generativa ni audio.

## Casos de uso

- Busqueda de fotogramas en bibliotecas de video: indexar embeddings de fotogramas extraidos y consultar con descripciones textuales para localizar escenas concretas, como hace la app Awesome Video Studio.
- Organizacion de fototecas en macOS o iOS: etiquetar y agrupar imagenes por contenido semantico sin enviar datos a la nube, aprovechando la inferencia local en Apple silicon.
- Clasificacion zero-shot en aplicaciones moviles: asignar categorias definidas por el usuario a imagenes capturadas en el dispositivo, sin reentrenamiento.
- Moderacion o filtrado visual en el borde: comparar imagenes contra descripciones textuales de contenido no deseado en un pipeline local de bajo coste.
- Accesibilidad: describir o localizar imagenes mediante consultas en lenguaje natural en aplicaciones de asistencia, con la ventaja de que el procesamiento no sale del dispositivo.
- Prototipado rapido de sistemas de recuperacion multimodal: usar los dos `.mlpackage` como base para experimentar con indices vectoriales en Mac antes de escalar a un despliegue servidor con el modelo PyTorch original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo menciona una comprobacion de similitud coseno frente al modelo PyTorch durante la conversion, sin cifras concretas.

## Requisitos de hardware

- VRAM: no aplica en el sentido de GPU dedicada; el modelo esta pensado para memoria unificada de Apple silicon. El peso en disco es de aproximadamente 89 MB (torre de imagen) y 270 MB (torre de texto) en int8.
- GPU recomendadas: cualquier chip Apple silicon compatible con Core ML (series M1, M2, M3, M4 y posteriores); tambien puede ejecutarse en iPhone y iPad recientes con Neural Engine.
- Cabe en GPU consumer: si, en cualquier Mac con Apple silicon; no esta orientado a GPU NVIDIA.
- Opciones de despliegue: Core ML de forma nativa; el modelo original en PyTorch puede servirse con vLLM, TGI u otros frameworks, pero esta conversion concreta solo funciona con el runtime de Core ML.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de texto | Entrada de imagen | Formato | Licencia |
|---|---|---|---|---|---|
| Crjstobal/siglip2-base-patch16-256-coreml | no disponible (base SigLIP 2) | 64 tokens | 256x256 | Core ML int8 | Apache 2.0 |
| google/siglip2-base-patch16-256 | no disponible (base SigLIP 2) | 64 tokens | 256x256 | PyTorch (safetensors) | Apache 2.0 |
| CLIP ViT-B/16 (OpenAI) | ~150 M | 77 tokens | 224x224 | PyTorch | MIT (pesos con restricciones de uso) |

La comparacion con CLIP ViT-B/16 es aproximada y se basa en la categoria de modelo; no se dispone de datos de rendimiento comparativo en la informacion proporcionada. La diferencia principal de esta ficha frente al modelo original es el formato de despliegue (Core ML int8 frente a PyTorch) y la ausencia del tokenizer en el repositorio.

## Limitaciones y advertencias

- Alucinacion: aunque el modelo no genera texto, la recuperacion puede devolver coincidencias irrelevantes si las descripciones textuales son ambiguas; la similitud coseno no garantiza correccion semantica.
- Contexto limitado: el texto se trunca a 64 tokens y la imagen se fuerza a 256x256 sin recorte, lo que puede degradar el rendimiento en imagenes con relaciones de aspecto extremas o detalles pequenos.
- Idiomas: no se especifica que idiomas maneja el text encoder; el preprocesado indicado (minusculas, sin `<bos>`) debe respetarse para no degradar los embeddings.
- Dependencia del tokenizer externo: el repositorio no incluye los ficheros del tokenizer, por lo que es necesario descargarlos del modelo original; un tokenizer distinto produce resultados incorrectos.
- Licencia: Apache 2.0 permite uso comercial, pero el autor original del modelo base es Google LLC y deben conservarse los avisos de licencia.
- Sin garantias de paridad exacta: la cuantizacion int8 introduce una pequena perdida de precision frente al modelo PyTorch; el autor solo indica una comprobacion de similitud coseno sin cifras.
- Ecosistema restringido: solo funciona en el runtime de Core ML sobre plataformas Apple; no es portable a otros entornos sin reconversion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Crjstobal/siglip2-base-patch16-256-coreml
- Modelo base: https://huggingface.co/google/siglip2-base-patch16-256
