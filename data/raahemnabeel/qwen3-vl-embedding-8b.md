# raahemnabeel/qwen3-vl-embedding-8b

## Resumen

`raahemnabeel/qwen3-vl-embedding-8b` es un paquete de despliegue para hardware Tenstorrent del modelo multimodal de embeddings `Qwen/Qwen3-VL-Embedding-8B`, desarrollado por el equipo Qwen y portado a la pila TTNN por el autor del repositorio. No se trata de un modelo nuevo ni de un fine-tuning: los pesos son los originales de Qwen, sin modificar, y el repositorio aporta la infraestructura de servicio sobre chips Blackhole (p150 y p300) mediante `tt-model-manager` 0.1.0 con esquema de manifiesto 5.1.

El modelo resuelve el problema de la representacion vectorial unificada de contenido heterogeneo: texto, imagenes, capturas de pantalla, video o combinaciones de ellos se proyectan en un unico espacio compartido de 4096 dimensiones, con normalizacion L2 y dimensiones Matryoshka truncables hasta 64. Se sirve mediante una API compatible con el formato de `/v1/embeddings` de OpenAI, lo que facilita su integracion en pipelines de recuperacion existentes.

Su relevancia actual reside en dos factores. Por un lado, cubre la primera etapa de recuperacion, clustering y clasificacion sobre mas de 30 idiomas, codigo, paginas de documentos, imagenes y video, pensandose como pareja del reranker `Qwen3-VL-Reranker-8B` en una arquitectura de dos etapas. Por otro, demuestra el despliegue de un modelo de 8B parametros multimodales sobre aceleradores Tenstorrent, con un chip completo alojando una copia del modelo y escalado horizontal por replicacion de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (torre de vision ViT Blackhole qwen36 + torre de texto), portado a TTNN sobre la pila compartida Qwen3-VL |
| Parametros totales | 8B (segun denominacion del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens (entradas superiores devuelven HTTP 400); presupuesto de pixel de 7680 tokens para video |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | mas de 30 idiomas (segun la model card); lista concreta no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | checkpoint de HuggingFace descargado en tiempo de servicio y convertido a pesos TTNN; formatos concretos no disponibles |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer multimodal de 8B parametros que combina una torre de vision con una torre de texto para producir embeddings conjuntos. El puerto a Tenstorrent reutiliza la pila compartida Qwen3-VL presente en `models/autoports/qwen_qwen3_vl_reranker_8b`, con la torre de vision tomada del ViT qwen36 de Blackhole incluido en el bundle Ornith-1.5. La salida es un vector de 4096 dimensiones normalizado en L2, con soporte de dimensiones Matryoshka: se pueden solicitar entre 64 y 4096 dimensiones tomando los valores iniciales y renormalizandolos, lo que permite ajustar el coste de almacenamiento e indexacion sin reentrenar.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en la informacion proporcionada. El paquete no modifica los pesos: la model card indica explicitamente "weights unmodified" y fija el commit `2c4565515e0f265c6511776e7193b22c0968ddc7` del repositorio de Qwen como referencia de descarga. La innovacion tecnica del paquete es de despliegue, no de modelado: cada chip Blackhole aloja una copia completa del modelo (paralelismo de datos), de modo que anadir chips incrementa linealmente el numero de entradas procesadas por segundo en lugar de repartir un unico modelo.

## Capacidades

- Generacion de embeddings multimodales unificados: texto, imagenes, capturas de pantalla, video o mezclas de ellos en una misma peticion.
- Vector de 4096 dimensiones normalizado en L2, con truncamiento Matryoshka configurable entre 64 y 4096 dimensiones.
- Procesamiento de imagenes en cualquier formato soportado por PIL, en base64 o como URL `data:image/...;base64,`, hasta 16 imagenes por entrada.
- Procesamiento de video en base64 (mp4, webm y otros) con parametro `fps` configurable, hasta 64 frames y el presupuesto oficial de 7680 tokens de pixel; tambien acepta listas de frames como imagenes base64.
- Soporte de instrucciones por peticion mediante el campo `instruction`, con valor por defecto "Represent the user's input."; se recomienda instruccion en las consultas y ausencia de instruccion en los documentos para recuperacion.
- Cobertura de mas de 30 idiomas, ademas de codigo fuente y paginas de documentos.
- API HTTP propia en el puerto 20000 con `POST /v1/embeddings` (formato de peticion y respuesta de OpenAI), `GET /health` (estado por chip, 503 hasta calentar o si un chip falla) y `GET /v1/models`.
- Formato de codificacion de salida `float` o `base64` (float32 little-endian).
- No es un modelo generativo: no soporta chat, tool calling ni razonamiento multi-paso.

## Casos de uso

- Recuperacion en dos etapas: el modelo actua como primera etapa generando embeddings de documentos y consultas, y se combina con `Qwen3-VL-Reranker-8B` como segunda etapa. La model card reporta NDCG@10 de 91.87 en el subconjunto MTEB de reranking en ingles y 98.50 en el subconjunto MIRACL de aleman, japones y arabe, lo que respalda este uso.
- Busqueda multimodal sobre capturas de pantalla y paginas de documentos: al aceptar imagenes de paginas completas, permite indexar documentacion escaneada o capturas de UI y recuperarlas con consultas de texto, con NDCG@5 de 95.62 en ViDoRe v3 sobre paginas de RR. HH. e informatica.
- Busqueda texto-a-imagen y imagen-a-texto: con Hit@1 de 100.00 en MMEB-v2 MSCOCO en ambas direcciones, es adecuado para catalogos visuales, busqueda de producto por imagen o descripcion y moderacion de contenido por similitud.
- Clustering y deduplicacion de contenido heterogeneo: el espacio compartido y las dimensiones Matryoshka permiten agrupar textos, imagenes y videos con un mismo indice vectorial, reduciendo dimensiones a 256 o 512 para abaratar el almacenamiento en colecciones grandes.
- Clasificacion zero-shot y enrutamiento semantico: los embeddings de etiquetas y de entradas se comparan por similitud coseno para asignar categorias o dirigir peticiones a modelos especializados, sin entrenar un clasificador dedicado.
- Indexacion de codigo y documentacion tecnica: la model card incluye una evaluacion especifica de codigo con coseno medio de 0.9991 frente a la referencia fp32 de HuggingFace, lo que lo hace apto para busqueda semantica sobre repositorios y bases de conocimiento internas.
- Procesamiento de video para busqueda y moderacion: con hasta 64 frames por entrada y `fps` configurable, permite indexar fragmentos de video y recuperarlos por consulta textual o por imagen de referencia.
- Despliegue en infraestructura Tenstorrent: mediante `tt serve raahemnabeel/qwen3-vl-embedding-8b`, con perfiles `p150` (un chip), `p300` (dos chips, aproximadamente el doble de throughput), `p300x2` (cuatro chips, aproximadamente el cuadruple), `p150x2` y `p150x4`.

## Benchmarks y rendimiento

Los datos disponibles comparan el paquete TTNN con la referencia fp32 de HuggingFace, no con otros modelos. No se han publicado resultados de benchmarks comparativos con modelos de la competencia en la informacion disponible.

| Evaluacion | Metrica | Este paquete | Referencia HF | Tamano |
|---|---|---:|---:|---|
| Conjunto fijo de 81 entradas | Coseno a HF fp32 (media / minimo) | 0.9977 / 0.9926 | 1 | 81 entradas |
| Consultas de texto (con instruccion) | Coseno (media / minimo) | 0.9984 / 0.9971 | — | 24 |
| Consultas de imagen | Coseno (media / minimo) | 0.9950 / 0.9944 | — | 5 |
| Textos en 10 idiomas | Coseno (media / minimo) | 0.9993 / 0.9986 | — | 20 |
| Codigo | Coseno (media / minimo) | 0.9991 / 0.9989 | — | 8 |
| Imagenes | Coseno (media / minimo) | 0.9960 / 0.9926 | — | 20 |
| Videos | Coseno (media / minimo) | 0.9960 / 0.9943 | — | 4 |
| MTEB reranking, ingles (SciDocsRR + AskUbuntuDupQuestions), ranking por coseno | NDCG@10 | 91.87 | 91.83 | 60 de 60 grupos |
| MIRACL reranking, de / ja / ar, ranking por coseno | NDCG@10 | 98.50 | 97.95 | 45 de 45 grupos |
| ViDoRe v3 (RR. HH. + informatica), imagenes de paginas de documento | NDCG@5 | 95.62 | 95.62 | 10 de 40 grupos |
| MMEB-v2 MSCOCO texto-a-imagen | Hit@1 | 100.00 | 100.00 | 40 de 40 grupos |
| MMEB-v2 MSCOCO imagen-a-texto | Hit@1 | 100.00 | 100.00 | 40 de 40 grupos |

## Requisitos de hardware

- Acelerador Tenstorrent obligatorio: p150, p150x2, p150x4, p300 o p300x2. No se documenta soporte de GPU convencionales en la informacion disponible.
- VRAM estimada: no aplica en el sentido habitual; cada chip Blackhole aloja una copia completa del modelo de 8B parametros. El repositorio ocupa 1.0 GB, pero la model card exige aproximadamente 20 GB de disco libre para el checkpoint y sus pesos convertidos.
- Memoria del sistema: se requieren 1 GB de hugepages montadas en `/dev/hugepages-1G`.
- Perfiles de despliegue y escalado: `p150` (un chip, linea base), `p300` (dos chips, aproximadamente 2x throughput), `p300x2` (QuietBox 2, cuatro chips, aproximadamente 4x), `p150x2` y `p150x4` (una copia por chip en todos los casos).
- Software: Tenstorrent CLI (`uv tool install tenstorrent`) y Docker. Alternativa sin CLI: `tt-model serve raahemnabeel/qwen3-vl-embedding-8b`.
- Arranque: la primera ejecucion compila kernels para el dispositivo y tarda varios minutos; el servidor esta listo cuando registra `Application startup complete`. `GET /health` devuelve 503 hasta que el modelo esta caliente.
- Latencia y throughput: no se publican cifras absolutas de latencia o peticiones por segundo; solo ratios relativos entre perfiles (2x y 4x sobre p150).
- No cabe en GPU de consumo: la informacion disponible no contempla ese escenario.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos alternativos en la informacion proporcionada, por lo que la comparacion se limita a caracteristicas verificables.

| Modelo | Parametros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `raahemnabeel/qwen3-vl-embedding-8b` (este) | 8B | 8192 tokens | Texto, imagen, video, mixto | Apache 2.0 | HuggingFace; requiere hardware Tenstorrent |
| `Qwen/Qwen3-VL-Embedding-8B` | 8B | no disponible | Texto, imagen, video, mixto | Apache 2.0 | HuggingFace; pesos de referencia sin portar |
| `Qwen3-VL-Reranker-8B` | 8B | no disponible | Texto, imagen, video, mixto | no disponible | HuggingFace; segunda etapa recomendada por el autor |

La diferencia principal entre el paquete y el modelo base de Qwen no es de calidad (los pesos son identicos y la similitud coseno media frente a la referencia fp32 es 0.9977) sino de plataforma de ejecucion y de la API de servicio incluida.

## Limitaciones y advertencias

- No es un modelo generativo: no admite chat, generacion de texto, tool calling ni razonamiento multi-paso. Usarlo como sustituto de un LLM es un error de uso.
- La API expuesta en el puerto 20000 es la propia del modelo, no una API de chat compatible con OpenAI; solo `/v1/embeddings` sigue el formato de OpenAI. El resto de formas de peticion y respuesta son especificas del autor.
- Limite estricto de 8192 tokens por entrada: las entradas que lo superan devuelven HTTP 400. Los videos estan limitados a 64 frames y al presupuesto de 7680 tokens de pixel.
- Las URL de imagen o video se rechazan salvo que el servidor se configure con `QWEN3VL_RERANKER_ALLOW_URLS=1`; por defecto solo se aceptan datos en base64 o data URLs.
- Dependencia de hardware propietario: requiere chips Tenstorrent Blackhole y la pila TTNN; no hay ruta documentada para GPU o CPU en este repositorio.
- Sesgos conocidos: no documentados en la informacion disponible. Al derivar de un modelo entrenado con datos web a gran escala, es esperable heredar sesgos de ese corpus, pero no se aportan evaluaciones al respecto.
- Riesgo de alusionacion: no aplica en el sentido generativo, pero la similitud coseno puede producir recuperaciones erroneas con apariencia de alta confianza si los documentos indexados son ambiguos o el dominio esta poco representado.
- Cobertura idiomatica: se declaran mas de 30 idiomas sin lista explicita; conviene validar el rendimiento en el idioma objetivo antes de desplegar en produccion.
- Licencia Apache 2.0, permisiva para uso comercial, pero el autor no ofrece garantias sobre el paquete de despliegue; los pesos subyacentes mantienen la licencia de Qwen.
- Madurez: el repositorio tiene 0 descargas y 0 likes, fue creado el 31 de octubre de 2026 y actualizado el 2 de noviembre de 2026. Es un artefacto reciente y sin validacion comunitaria; conviene tratarlo como experimental.
- La primera compilacion de kernels tarda varios minutos y el servicio no responde hasta completarla; planificar el arranque en frio en despliegues automatizados.

## Enlaces

- Repositorio HuggingFace del paquete: https://huggingface.co/raahemnabeel/qwen3-vl-embedding-8b
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3-VL-Embedding-8B
- Commit de pesos referenciado: `2c4565515e0f265c6511776e7193b22c0968ddc7` (repositorio de Qwen)
- Tenstorrent tt-model-manager: https://github.com/tenstorrent/tt-model-manager
- Tenstorrent CLI (prerrequisitos): https://github.com/tenstorrent/tt-cli/blob/main/docs/prerequisites.md
