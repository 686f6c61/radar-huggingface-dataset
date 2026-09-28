# masahiroid/ruri-v3-310m-mlx

## Resumen

ruri-v3-310m-mlx es una conversion no oficial al formato MLX del modelo de embeddings de texto en japones cl-nagoya/ruri-v3-310m, desarrollado originalmente por el proyecto Ruri (Universidad de Nagoya / cl-nagoya). La conversion la firma el usuario masahiroid y su proposito es permitir la ejecucion nativa del modelo en hardware Apple Silicon a traves del paquete mlx-embeddings, en lugar de depender de PyTorch o sentence-transformers. Cuenta con 314.611.968 parametros (unos 314,6 millones) almacenados en bfloat16 sin cuantizacion, y el repositorio ocupa 0,6 GB.

Se trata de un modelo de representacion densa (pipeline sentence-similarity y feature-extraction): transforma frases o documentos en vectores que capturan su significado semantico. No es un modelo generativo y no produce texto. Su relevancia practica para desarrolladores radica en que habilita busqueda semantica, recuperacion aumentada por generacion (RAG) y similitud de frases en japones directamente sobre portatiles y equipos Mac con chip de la serie M.

La arquitectura subyacente es ModernBERT, una familia de codificadores transformer modernos. La licencia es Apache 2.0, lo que permite uso comercial, pero al ser una conversion de la comunidad conviene verificar su equivalencia funcional con el modelo original antes de desplegarla en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (codificador transformer) |
| Parametros totales | 314.611.968 (~314,6 M) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | bfloat16 sin cuantizacion (la libreria MLX permite cuantizacion adicional, pero no se documenta en la ficha) |
| Idiomas soportados | japones (ja) |
| Licencia | apache-2.0 |
| Formato de pesos | MLX con safetensors |

## Arquitectura y entrenamiento

El modelo se basa en ModernBERT, una arquitectura de codificador (encoder-only) orientada a representaciones de texto. Se distribuye una conversion a MLX del modelo cl-nagoya/ruri-v3-310m en precision bfloat16, sin cuantizacion, pensada para ejecutarse con el paquete mlx-embeddings. La ficha original emplea un esquema de prefijos en japones: las consultas se introducen con el prefijo `クエリ:` (consulta) y los documentos con `文章:` (texto o pasaje), tal como se muestra en el ejemplo de uso.

Los detalles concretos del entrenamiento del modelo base (numero de tokens, composicion del dataset, si hubo RLHF, DPO u otras tecnicas) no se incluyen en la informacion proporcionada. Esta ficha corresponde exclusivamente a la conversion a MLX, cuyo autor indica de forma explicita que no es una version oficial del equipo Ruri / cl-nagoya y que todo el merito del modelo original corresponde a dicho equipo. La innovacion tecnica que anade esta ficha es la portabilidad del modelo al ecosistema MLX para Apple Silicon.

## Capacidades

- Generacion de embeddings de frases y documentos en japones (feature-extraction).
- Calculo de similitud semantica entre textos (sentence-similarity), por ejemplo mediante similitud coseno entre vectores.
- Recuperacion semantica de informacion (retrieval) para motores de busqueda y sistemas RAG en japones.
- Diferenciacion entre consultas y documentos mediante los prefijos `クエリ:` y `文章:`.
- No dispone de generacion de texto, razonamiento generativo, codigo, matematicas ni vision: es un modelo de representacion, no un modelo de lenguaje generativo.
- No soporta tool calling, function calling ni ejecucion de agentes multi-paso.
- Soporte de un unico idioma: japones.

## Casos de uso

- Busqueda semantica en japones: indexar un corpus de documentos como vectores y recuperar los pasajes mas similares a la consulta del usuario, superando la coincidencia literal de palabras clave.
- Recuperacion para RAG: generar embeddings de fragmentos de una base de conocimiento en japones y recuperar los mas relevantes para alimentar a un modelo generativo (por ejemplo, un LLM de chat) con contexto preciso.
- Deduplicacion de contenidos: calcular la similitud coseno entre registros para detectar articulos, tickets o resenas duplicadas o casi identicas.
- Clasificacion y enrutado: usar los embeddings como caracteristicas de entrada para un clasificador ligero (regresion logistica, SVM) que etiquete consultas de soporte o correos por tematica.
- Agrupacion tematica (clustering): agrupar grandes volumenes de texto japones (noticias, resenas, comentarios) en funcion de la similitud de sus representaciones.
- Sistemas de recomendacion: representar el contenido y el historial de interacciones del usuario como vectores y recomendar elementos con mayor similitud semantica.
- Moderacion y deteccion de similitud: comparar mensajes nuevos contra patrones conocidos para identificar contenidos repetidos o practicamente equivalentes.
- Ejecucion local en Apple Silicon: desplegar busqueda semantica totalmente en el dispositivo, sin enviar datos a servicios externos, gracias a la conversion a MLX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La ficha de la conversion en HuggingFace no incluye valores de MMLU, JMTEB, ni de ninguna otra evaluacion, y no se proporcionan comparaciones numericas con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6 GB en bfloat16 (los 314,6 millones de parametros ocupan en torno a 0,63 GB), coherente con el tamano del repositorio (0,6 GB).
- GPU y aceleradores recomendados por el autor: Apple Silicon. El modelo esta empaquetado para MLX, que se ejecuta sobre chips de la serie M (M1, M2, M3, M4 y posteriores).
- Compatibilidad con GPU de consumo: el tamano del modelo cabe holgadamente en practicamente cualquier GPU de consumo con al menos 1-2 GB de VRAM libre, aunque la conversion esta orientada a MLX y no se documenta su uso con CUDA en la informacion proporcionada.
- Opciones de despliegue: mlx-embeddings sobre MLX. No se documentan otros runners (vLLM, llama.cpp, Ollama, TGI) para esta conversion.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Framework | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| masahiroid/ruri-v3-310m-mlx | ~314,6 M | no disponible | MLX / safetensors | MLX (mlx-embeddings) | apache-2.0 | HuggingFace, conversion de la comunidad |
| cl-nagoya/ruri-v3-310m (modelo base) | ~314,6 M (segun el autor) | no disponible | safetensors | PyTorch / sentence-transformers | apache-2.0 | HuggingFace, oficial |

Otras alternativas de embeddings en japones de la misma categoria (por ejemplo, variantes de la familia ruri de menor tamano u otros modelos multilingues de recuperacion) no se detallan en la informacion proporcionada, por lo que no se incluyen datos comparativos de rendimiento ni de contexto.

## Limitaciones y advertencias

- Es una conversion no oficial de la comunidad: el propio autor indica que no procede del equipo Ruri / cl-nagoya y que no es una version oficial.
- No es un modelo generativo: no puede producir texto, razonar, escribir codigo ni responder preguntas por si mismo; unicamente genera representaciones vectoriales.
- Soporta exclusivamente japones; el rendimiento en otros idiomas no esta documentado y probablemente sea deficiente.
- La longitud de contexto no se especifica en la informacion disponible, lo que limita la planificacion de uso con documentos largos.
- La licencia Apache 2.0 permite uso comercial, pero, al tratarse de una conversion derivada, conviene verificar que se preservan los avisos de licencia del modelo original antes de redistribuirla.
- Riesgo de sesgos y alucinaciones: como modelo de representacion no "alucina" texto, pero puede heredar sesgos presentes en los datos de entrenamiento del modelo base; dichos sesgos no se documentan en la informacion proporcionada.
- No se han publicado benchmarks ni evaluaciones de calidad en la informacion disponible, por lo que no es posible cuantificar su precision frente a alternativas.
- Despliegue limitado al ecosistema MLX y Apple Silicon segun lo documentado; otros entornos no estan soportados por esta conversion concreta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/masahiroid/ruri-v3-310m-mlx
- Modelo base original: https://huggingface.co/cl-nagoya/ruri-v3-310m
- MLX: https://github.com/ml-explore/mlx
- mlx-embeddings: https://github.com/Blaizzy/mlx-embeddings
