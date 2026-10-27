# cstr/SauerkrautLM-MoEdernColBERT-115M-CrispEmbed-GGUF

## Resumen

SauerkrautLM-MoEdernColBERT-115M-CrispEmbed-GGUF es un empaquetado en GGUF del checkpoint de recuperación VAGOsolutions/SauerkrautLM-MoEdernColBERT-115M, un modelo de 114.696.576 parámetros (aproximadamente 115 M) orientado a búsqueda y ranking de documentos mediante interacción tardía tipo ColBERT. Lo publica el usuario cstr, no el autor original del modelo, y se distribuye con licencia Apache-2.0 manteniendo la licencia y el README originales bajo el directorio `upstream/`.

El problema que resuelve no es la generación de texto, sino la producción de representaciones multi-vector por token y su puntuación mediante MaxSim, el mecanismo clásico de ColBERT para reranking y recuperación densa. El paquete está pensado específicamente para la API de texto crudo de CrispEmbed, activada mediante variables de entorno con prefijo `CRISPEMBED_MOEDERN_*`, incluida `CRISPEMBED_MOEDERN_FAMILY`.

Es relevante ahora por dos motivos concretos: por un lado, el autor afirma una verificación byte a byte del empaquetado (identificadores de token y máscaras exactos, expansión de consulta idéntica, vectores dentro de 2,83e-07 respecto al original congelado y tres puntuaciones MaxSim con desviación inferior a 0,002); por otro, deja explícitamente sin verificar la calidad de recuperación, otras plataformas, la GPU y la cuantización. Es, por tanto, un artefacto de integración reproducible más que un modelo nuevo con mejoras de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con puntuacion por interaccion tardia (ColBERT, MaxSim) sobre la familia SauerkrautLM MoEdern; no se confirma en la informacion disponible si emplea mezcla de expertos pese al nombre "MoEdern" |
| Parametros totales | 114.696.576 (aproximadamente 115 M) |
| Parametros activos | no disponible (no confirmado que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ninguno incluido: el archivo es un empaquetado F32 sin aritmetica de tensores; cuantizaciones posteriores no verificadas |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (empaquetado F32 propietario para CrispEmbed), archivo `moedern-115m-text-f32.gguf` de 459.890.432 bytes; no es un GGUF estandar de llama.cpp segun la informacion disponible |
| Dimension de embedding | no disponible |
| Tamano del repositorio | 0,5 GB |
| SHA256 del archivo | 4150412f66caaa058c90ad0ed6cc4e318a0ea146f4ce9e59de62f83975903766 |

## Arquitectura y entrenamiento

El modelo subyacente es un codificador tipo transformer con cabeza de interaccion tardia estilo ColBERT: cada token del documento y de la consulta recibe un vector propio y la relevancia se calcula con MaxSim (suma sobre los tokens de la consulta del maximo de similitud coseno contra los tokens del documento). Esta arquitectura implica un almacenamiento multi-vector, por lo que el coste de indice crece con el numero de tokens indexados y no con un unico vector por documento. El nombre "MoEdern" sugiere una variante de la familia SauerkrautLM de VAGOsolutions, pero la informacion disponible no detalla la composicion interna ni confirma el uso de mezcla de expertos.

No hay datos en la informacion proporcionada sobre el numero de tokens de entrenamiento, la composicion del corpus, el uso de RLHF/DPO ni innovaciones de atencion. El autor del empaquetado indica explicitamente que la modificacion consiste solo en reempaquetar el checkpoint original (seccion 4 de la licencia Apache-2.0), sin aritmetica de tensores, conservando el LICENSE y el README de origen. La unica validacion descrita es funcional y de fidelidad numerica, no de calidad de recuperacion.

## Capacidades

- Generacion de representaciones multi-vector por token para consultas y documentos (indexacion y busqueda densa).
- Puntuacion de relevancia mediante MaxSim, apta para reranking de candidatos recuperados en una primera fase.
- Expansion de consulta verificada como identica a la del checkpoint original en los casos de prueba congelados.
- Fidelidad numerica verificada: vectores dentro de 2,83e-07 del original y tres puntuaciones MaxSim con desviacion inferior a 0,002.
- Integracion con la API de texto crudo de CrispEmbed mediante las puertas `CRISPEMBED_MOEDERN_*`, incluida `CRISPEMBED_MOEDERN_FAMILY`; por defecto desactivadas.
- Ejecucion verificada en Linux x64 sobre CPU con implementaciones en C, Python y CLI.
- Soporte de tool calling, agentes, vision, audio, modo thinking y generacion de texto: no disponible (no es un modelo generativo).
- Capacidades multilingues: no disponibles; el nombre de la familia SauerkrautLM sugiere orientacion al aleman, extremo no confirmado en la informacion proporcionada.

## Casos de uso

- Busqueda semantica sobre documentacion tecnica: el modelo indexa fragmentos como multi-vector y responde consultas en lenguaje natural con MaxSim, lo que permite recuperar pasajes que comparten terminos poco frecuentes sin depender de coincidencia lexica exacta.
- Reranking en un pipeline RAG: tras una primera fase barata (BM25 o embeddings densos de un solo vector), los 115 M de parametros permiten repuntuar entre 50 y 100 candidatos por consulta en CPU, con un coste de memoria de aproximadamente 0,46 GB en F32.
- Busqueda en corpus con jerga o nombres propios: la representacion por token preserva senal de terminos raros que un pooling medio diluiria, util en catalogos de producto, referencias internas o literatura cientifica.
- Evaluacion de fidelidad de empaquetados: el SHA256 publicado y las metricas de desviacion (2,83e-07 en vectores, 0,002 en MaxSim) permiten usarlo como referencia para comprobar que una conversion propia reproduce el checkpoint original.
- Despliegue en entornos sin GPU: el autor verifico el artefacto en Linux x64 sobre CPU, lo que habilita servicios de recuperacion en contenedores sin acelerador siempre que se acepte la falta de validacion en otras plataformas.
- Prototipado de sistemas de recuperacion en alemán (a validar): si se confirma la orientacion linguistica de la familia SauerkrautLM, serviria para busqueda y soporte documental en ese idioma, pero la calidad de recuperacion no ha sido verificada por el autor y debe medirse contra un conjunto propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, BEIR, MTEB) en la informacion disponible. El autor solo documenta comprobaciones de fidelidad del empaquetado:

| Prueba | Resultado declarado |
|---|---|
| Identificadores de token y mascaras | exactos respecto al original |
| Expansion de consulta | exacta en los casos congelados |
| Vectores (diez casos congelados) | desviacion maxima 2,83e-07 |
| Puntuaciones MaxSim (tres casos) | desviacion inferior a 0,002 |
| Calidad de recuperacion | no verificada |
| GPU y otras plataformas | no verificadas |
| Cuantizacion | no verificada |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,46 GB solo de pesos en F32 (459.890.432 bytes); en FP16 serian unos 0,23 GB y en INT8 unos 0,115 GB, aunque no se ha publicado ninguna conversion cuantizada.
- Memoria adicional: al ser un modelo ColBERT hay que sumar el almacenamiento del indice multi-vector, que escala con el numero de tokens indexados y suele superar ampliamente el tamano de los pesos.
- GPU recomendadas: no disponibles; el autor no ha verificado ejecucion en GPU. Por tamano, cualquier GPU consumer con 2 GB o mas de memoria libre seria suficiente en teoria para los pesos, pero es una extrapolacion no validada.
- Cabe en GPU consumer: previsiblemente si (GTX 1650, RTX 3050, RTX 4060 y superiores) por el reducido tamano del modelo, sin verificacion publicada.
- CPU: verificacion declarada en Linux x64 con implementaciones en C, Python y CLI; es el unico entorno con validacion explicita.
- Opciones de despliegue: API de texto crudo de CrispEmbed con las puertas `CRISPEMBED_MOEDERN_*` activadas manualmente. No hay informacion que confirme compatibilidad con vLLM, TGI, llama.cpp u Ollama; el formato GGUF de este repositorio es un empaquetado propio, no un GGUF estandar de llama.cpp.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Los datos de los modelos alternativos provienen de conocimiento publico general y no se han podido contrastar con la informacion proporcionada; deben verificarse en cada model card. No hay datos de rendimiento comparables para este modelo.

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| SauerkrautLM-MoEdernColBERT-115M-CrispEmbed-GGUF | 114,7 M | no disponible | Apache-2.0 | Recuperacion ColBERT (multi-vector, MaxSim) | HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| sentence-transformers/all-MiniLM-L6-v2 | 22,7 M | no disponible | Apache-2.0 | Embedding denso de un vector por texto | Ampliamente desplegado |
| intfloat/multilingual-e5-small | 118 M | no disponible | MIT | Embedding denso multilingue | Ampliamente desplegado |
| colbert-ir/colbertv2.0 | aproximadamente 110 M | no disponible | no verificada en esta ficha | Recuperacion ColBERT (multi-vector, MaxSim) | Referencia academica del enfoque |

## Limitaciones y advertencias

- La calidad de recuperacion no ha sido verificada por el autor del empaquetado; las pruebas solo cubren fidelidad numerica frente al checkpoint original.
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso, por lo que no debe evaluarse con benchmarks tipo MMLU o GSM8K.
- Artefacto de tercera parte: lo publica cstr a partir del checkpoint de VAGOsolutions; la responsabilidad sobre el comportamiento del modelo original recae en su autor.
- El archivo se denomina GGUF pero contiene un empaquetado F32 sin cuantizar; asumir que funciona con herramientas GGUF genericas (llama.cpp, Ollama, LM Studio) puede provocar fallos de carga.
- Las puertas `CRISPEMBED_MOEDERN_*` estan desactivadas por defecto, lo que exige configuracion explicita antes de cualquier uso.
- Sin verificar en GPU ni en plataformas distintas de Linux x64; el rendimiento en produccion sobre otros sistemas es desconocido.
- Idiomas soportados no documentados: no hay garantia de comportamiento multilingue ni de calidad en castellano.
- Longitud de contexto no disponible, lo que impide planificar el troceado de documentos con criterio documentado.
- Riesgo de alucinacion no aplicable a la generacion, pero si riesgo de recuperacion espuria: sin evaluacion de retrieval no se puede acotar la tasa de falsos positivos en MaxSim.
- Licencia Apache-2.0 permite uso comercial y modificacion con atribucion; deben conservarse el LICENSE y el README de `upstream/` segun lo indicado por el autor.
- Sesgos: no documentados en la informacion disponible; depende del corpus de entrenamiento del checkpoint original, no descrito.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/cstr/SauerkrautLM-MoEdernColBERT-115M-CrispEmbed-GGUF
- Modelo base: https://huggingface.co/VAGOsolutions/SauerkrautLM-MoEdernColBERT-115M
- Revision concreta del checkpoint utilizada: https://huggingface.co/VAGOsolutions/SauerkrautLM-MoEdernColBERT-115M/tree/66380d2ade3b5027bba83bdcdba052d0bb86dcdb
- Paper, blog, repositorio de codigo o demo de CrispEmbed: no disponible en la informacion proporcionada
- La busqueda web realizada no devolvio resultados relacionados con el modelo (unicamente listados de odontologos en Cognac, sin relacion con el artefacto)
