# Dunde/multilingual-e5-small

## Resumen

Dunde/multilingual-e5-small es una copia sin modificaciones del modelo de embeddings intfloat/multilingual-e5-small, publicada por el usuario Dunde con el unico proposito de servir como dependencia estable para una demo en navegador alojada en dunde.kr (MEGAFIXEL). No se ha reentrenado ni ajustado nada: los pesos y el tokenizador son identicos a la revision `761b726dd34fb83930e26aab4e9ac3899aa1fa78` del repositorio de conversion ONNX de Xenova, y los SHA-256 de `onnx/model_int8.onnx` y `tokenizer.json` coinciden con el origen. Se trata, por tanto, de un artefacto de despliegue, no de un modelo nuevo.

El modelo subyacente es un encoder tipo BERT de 12 capas y 384 dimensiones de embedding, con aproximadamente 118 millones de parametros, entrenado con preentrenamiento contrastivo debilmente supervisado (metodo E5) sobre pares de texto multilingues. Su funcion es producir representaciones vectoriales normalizadas de frases y parrafos en mas de 100 idiomas, lo que lo hace util para recuperacion semantica, RAG, clustering y clasificacion zero-shot. El repositorio de Dunde incluye unicamente la cuantizacion int8 en formato ONNX (118 MB), pensada para ejecutarse en el navegador mediante Transformers.js con backend WASM.

Su relevancia practica es doble: por un lado, fija una version concreta frente a cambios en repositorios upstream, algo importante cuando una demo publica depende de un fichero remoto; por otro, demuestra el patron de despliegue de embeddings multilingues 100 % en cliente, sin enviar texto del usuario a un servidor. La licencia es MIT, heredada del modelo original, y no impone restricciones de uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (etiqueta `bert` en HuggingFace); 12 capas, dimension oculta 384, 12 cabezas de atencion, 118 M de parametros (modelo base intfloat/multilingual-e5-small) |
| Parametros totales | Aproximadamente 118 millones (modelo base); el artefacto distribuido es una conversion ONNX int8 de esos pesos |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (heredado del modelo base; no verificado en la informacion proporcionada) |
| Tipos de cuantizacion | Solo int8 ONNX en este repositorio; el repositorio de origen (Xenova) ofrece ademas otras precisiones como fp32, fp16 y q4 |
| Idiomas soportados | Multilingue, mas de 100 idiomas segun el modelo base; no listados explicitamente en la informacion proporcionada |
| Licencia | MIT |
| Formato de pesos | ONNX (`onnx/model_int8.onnx`, 118 MB) + `tokenizer.json`, `tokenizer_config.json`, `special_tokens_map.json`, `config.json`; no incluye safetensors ni GGUF |
| Libreria de inferencia | Transformers.js (`@huggingface/transformers`), pipeline `feature-extraction` |
| Tamano del repositorio | 0,1 GB |
| Tarea declarada | `feature-extraction` (generacion de embeddings) |
| Fecha de creacion | 2026-10-06 |
| Fecha de actualizacion | 2026-10-06 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer bidireccional con normalizacion de capas, atencion multi-cabeza y embeddings posicionales aprendidos, del mismo linaje que BERT y MiniLM. La salida utilizada no es la de un token especial, sino el *mean pooling* sobre la secuencia, seguido de normalizacion L2, tal como muestra el ejemplo de uso de la model card. Esto produce vectores de 384 dimensiones con norma unitaria, listos para similitud coseno o producto escalar.

Sobre el entrenamiento, la informacion proporcionada no detalla el numero de tokens, la composicion del dataset ni si se aplicaron fases de RLHF o DPO. Lo que si se sabe por procedencia es que el modelo original intfloat/multilingual-e5-small se genero con el metodo E5 de preentrenamiento contrastivo debilmente supervisado, inicializado a partir de un encoder multilingue de tipo MiniLM, e instruido para funcionar con prefijos `query: ` y `passage: ` segun la tarea (recuperacion frente a otras tareas). Cualquier cifra concreta de tokens o mezcla de corpus queda como no disponible en esta ficha, ya que no aparece en la model card del repositorio analizado ni en los resultados de busqueda.

La innovacion tecnica de este repositorio no esta en el modelo, sino en el empaquetado: conversion a ONNX con cuantizacion int8 y ejecucion en WASM mediante Transformers.js, que permite generar embeddings en el navegador sin backend. No se anaden tecnicas como decodificacion especulativa ni atencion lineal, porque no hay generacion autoregresiva: es un encoder puro.

## Capacidades

- Generacion de embeddings de frases, parrafos y documentos cortos mediante mean pooling y normalizacion L2.
- Recuperacion semantica multilingue: busqueda de pasajes relevantes para una consulta, con soporte del prefijo `query: ` recomendado por la model card original para tareas distintas de la recuperacion.
- Capacidades cross-linguales: consulta en un idioma y recuperacion de documentos en otro, gracias al alineamiento de espacios vectoriales entre mas de 100 idiomas.
- Clasificacion de texto mediante embeddings congelados y un clasificador ligero encima (regresion logistica, k-NN).
- Clustering y deduplicacion semantica de textos, sin necesidad de etiquetas.
- Similitud semantica y deteccion de duplicados casi identicos.
- Ejecucion 100 % en cliente: backend WASM en el navegador, sin llamadas de red ni fuga de texto a servidores.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente autonomo.
- No genera texto libre: no es un modelo causal de lenguaje.
- No tiene modo de pensamiento (*thinking*), vision ni audio.

## Casos de uso

- Recuperacion aumentada (RAG) en produccion: indexar fragmentos de documentacion de 512 tokens o menos con este encoder y recuperar los mas cercanos a la consulta del usuario antes de pasarselos a un modelo generador. El coste de almacenamiento es bajo: 384 dimensiones en `float32` ocupan 1.536 bytes por vector.
- Busqueda semantica multilingue en catalogos de producto: el usuario escribe en su idioma y el sistema devuelve articulos descritos en otro, sin traduccion intermedia, gracias al alineamiento cross-lingual del espacio de embeddings.
- Clasificacion de tickets de soporte: calcular embeddings de tickets historicos, entrenar un k-NN o una regresion logistica sobre ellos y clasificar automaticamente tickets nuevos por categoria o urgencia, con muy pocos datos etiquetados.
- Deduplicacion de corpus para entrenamiento de modelos: agrupar por similitud coseno los documentos de un dataset y eliminar duplicados casi identicos antes de entrenar, reduciendo el riesgo de sobreajuste a contenido repetido.
- Busqueda local en el navegador con Transformers.js: la model card ofrece un ejemplo funcional con `pipeline('feature-extraction', 'Dunde/multilingual-e5-small', { dtype: 'int8', device: 'wasm' })`, adecuado para aplicaciones de notas, documentacion offline o herramientas internas donde el texto no puede salir del dispositivo.
- Deteccion de anomalias en texto: calcular la distancia al centroide de un conjunto de referencia para marcar mensajes atipicos (spam, intentos de manipulacion, contenido fuera de dominio).
- Sistemas de recomendacion basados en contenido: representar descripciones de articulos, articulos o perfiles y recomendar por proximidad vectorial, sin necesidad de historial de interacciones.
- Moderacion asistida y enrutado de conversaciones: asignar cada mensaje entrante al equipo o cola adecuada segun su embedding respecto a prototipos por categoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card del repositorio Dunde/multilingual-e5-small no incluye ninguna tabla de evaluacion, y los resultados de busqueda web proporcionados no contienen datos de rendimiento del modelo (MIRACL, Mr. TyDi, MTEB u otros). Cualquier cifra que se citase de memoria correspondiente al modelo base intfloat/multilingual-e5-small no estaria respaldada por la informacion de partida, por lo que no se incluye.

## Requisitos de hardware

- Inferencia en CPU: el fichero `onnx/model_int8.onnx` pesa 118 MB y esta pensado para ejecutarse en WASM, sin GPU. Es viable en portatiles modernos y, con latencias mayores, en dispositivos moviles.
- VRAM/RAM estimada para el artefacto distribuido (int8): en torno a 150-250 MB de memoria de trabajo, incluyendo pesos y activaciones para secuencias de hasta 512 tokens.
- Estimaciones para otras precisiones del modelo base (no incluidas en este repositorio): fp32 en torno a 470 MB, fp16 en torno a 235 MB, int8 en torno a 118 MB. Son calculos derivados de los 118 M de parametros, no datos publicados.
- GPU: no requiere GPU. Cualquier GPU consumer con al menos 1 GB de VRAM libre (GTX 1050 en adelante, RTX 2060, RTX 3060, RTX 4090) puede ejecutarlo con margen amplio, incluso en fp32.
- Despliegue: Transformers.js con `device: 'wasm'` (navegador o Node.js) es la via prevista por el autor. Para servidor, ONNX Runtime, o cualquiera de las variantes del repositorio de origen (Xenova) en frameworks habituales de embeddings.
- Latencia y throughput: no disponible en la informacion proporcionada. No se han publicado mediciones para este repositorio.
- Nota practica: al ser un encoder de 118 M de parametros, el cuello de botella en produccion suele ser el almacenamiento e indexado de vectores, no el calculo de embeddings.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formatos disponibles | Notas |
|---|---|---|---|---|---|---|
| Dunde/multilingual-e5-small | ~118 M | 512 tokens (modelo base) | Multilingue, mas de 100 idiomas | MIT | ONNX int8 (Transformers.js) | Copia fijada para una demo en navegador; sin modificaciones de pesos |
| intfloat/multilingual-e5-small | ~118 M | 512 tokens | Multilingue, mas de 100 idiomas | MIT | safetensors, PyTorch | Modelo original; pesos y tokenizador identicos a los de este repositorio |
| Xenova/multilingual-e5-small | ~118 M | 512 tokens | Multilingue, mas de 100 idiomas | MIT (heredada) | ONNX en varias precisiones (fp32, fp16, int8, q4) | Conversion ONNX de la que procede este repositorio; incluye mas precisiones |
| intfloat/multilingual-e5-base | ~278 M | 512 tokens | Multilingue, mas de 100 idiomas | MIT | safetensors, PyTorch | Variante mayor de la misma familia; mayor calidad esperada a mayor coste de computo |
| intfloat/multilingual-e5-large | ~560 M | 512 tokens | Multilingue, mas de 100 idiomas | MIT | safetensors, PyTorch | Variante grande de la familia; requiere GPU para uso comodo en produccion |
| paraphrase-multilingual-MiniLM-L12-v2 | ~118 M | 128 tokens | Multilingue | Apache 2.0 | safetensors, PyTorch, ONNX | Alternativa clasica de tamano comparable, con ventana de contexto mas corta |

Las cifras de parametros y contexto de los modelos comparados corresponden a datos ampliamente conocidos de sus respectivas familias y no proceden de la informacion proporcionada en esta busqueda; se ofrecen como orientacion y deben verificarse en las model cards originales antes de tomar decisiones de arquitectura. No hay datos de rendimiento comparativo disponibles para este repositorio en concreto.

## Limitaciones y advertencias

- Repositorio de conveniencia: no es un modelo nuevo ni un ajuste. Si se necesita una version mantenida, con historial de cambios y soporte, lo adecuado es usar intfloat/multilingual-e5-small o Xenova/multilingual-e5-small.
- Fijado a una revision concreta: el autor congela los ficheros de la revision `761b726dd34fb83930e26aab4e9ac3899aa1fa78` para que la demo no se rompa si cambia el upstream. Esto implica que no recibira correcciones ni mejoras.
- Solo int8: no hay ficheros fp32, fp16, q4 ni GGUF. Si el pipeline necesita otra precision, no esta en este repositorio.
- Contexto limitado a 512 tokens: los documentos largos deben trocearse en fragmentos, con la perdida de contexto global que eso conlleva en tareas de recuperacion.
- Riesgo de alucinacion: no aplica en el sentido generativo, ya que el modelo no produce texto. El riesgo equivalente es recuperar pasajes irrelevantes por similitud superficial y que un generador aguas abajo construya una respuesta incorrecta a partir de ellos.
- Sesgos: los sesgos del corpus de entrenamiento del modelo base no estan documentados en la informacion proporcionada. Un encoder multilingue puede representar peor variedades dialectales o idiomas con menos presencia en los datos.
- Idiomas: aunque se declara soporte para mas de 100 idiomas, no hay lista ni evaluacion por idioma en la informacion disponible. La calidad es desigual entre lenguas de altos y bajos recursos.
- Prefijos: la model card advierte que, para tareas distintas de la recuperacion, se recomienda el prefijo `query: `. Omitirlo o usar el prefijo incorrecto degrada la calidad de los embeddings.
- Licencia MIT: permite uso comercial y modificacion, pero se hereda del modelo original y hay que conservar el aviso de copyright. No hay restricciones adicionales conocidas.
- Metadatos pobres: cero descargas y cero likes en el momento de la consulta, sin lista de idiomas declarada en HuggingFace, lo que dificulta evaluar su adopcion real.
- Produccion: al depender de un unico mantenedor y de un caso de uso concreto (una demo web), conviene replicar los ficheros en almacenamiento propio o en un registro interno antes de integrarlo en un sistema critico.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Dunde/multilingual-e5-small
- Modelo original: https://huggingface.co/intfloat/multilingual-e5-small
- Conversion ONNX de origen: https://huggingface.co/Xenova/multilingual-e5-small
- Demo que motivo la publicacion: https://dunde.kr (MEGAFIXEL)
- Libreria Transformers.js: https://github.com/huggingface/transformers.js
- Documentacion de Transformers.js: https://huggingface.co/docs/transformers.js
- Paper del metodo E5 (embeddings por preentrenamiento contrastivo debilmente supervisado): https://arxiv.org/abs/2212.03533
- Informe tecnico de la familia multilingual E5: https://arxiv.org/abs/2402.05672
- Resultados de busqueda web: ninguno de los enlaces recuperados (thinktecture.com, aclanthology.org/2024.konvens-main.pdf, reposit.haw-hamburg.de, arxiv.org/pdf/2608.02692, github.com/punkpeye/awesome-mcp-servers) aporta informacion tecnica directa sobre este repositorio. El unico que menciona el modelo es el articulo PatTree (arxiv.org/pdf/2608.02692), que lo cita como encoder de 384 dimensiones de embedding para una tarea multimodal, sin ofrecer especificaciones adicionales.
