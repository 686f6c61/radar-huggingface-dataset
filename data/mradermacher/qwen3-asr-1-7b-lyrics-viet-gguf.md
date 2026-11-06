# mradermacher/Qwen3-ASR-1.7B-Lyrics-Viet-GGUF

## Resumen

Qwen3-ASR-1.7B-Lyrics-Viet-GGUF es una cuantizacion en formato GGUF del modelo sunbv56/Qwen3-ASR-1.7B-Lyrics-Viet, un ajuste fino de la familia Qwen3-ASR orientado al reconocimiento automatico de voz (ASR) de letras de canciones en vietnamita. El modelo original parte de una base Qwen3-ASR de 1.720.574.976 parametros (aproximadamente 1,7 mil millones) y ha sido especializado mediante entrenamiento sobre el dataset sunbv56/song_dataset_training_20s_cleaned, compuesto por fragmentos de audio de 20 segundos depurados. El encargado de la cuantizacion es mradermacher, un conocido publicador de versiones GGUF de modelos abiertos.

La relevancia de esta ficha radica en que combina dos elementos poco habituales: por un lado, un modelo ASR especializado en un dominio dificil (letras cantadas, con musica de fondo, en un idioma de recursos medios como el vietnamita); por otro, un conjunto amplio de cuantizaciones estaticas que van desde Q2_K (0,9 GB) hasta f16 (3,5 GB), lo que permite desplegar el modelo en hardware muy modesto. El repositorio incluye ademas los ficheros mmproj, lo que confirma que el modelo es multimodal (procesa audio y texto) y que la parte de proyeccion multimodal se distribuye por separado.

Se trata, por tanto, de una pieza practica para pipelines de transcripcion musical en vietnamita, no de un modelo de proposito general. La licencia Apache 2.0 facilita su uso comercial, aunque el alcance real del modelo esta acotado por el idioma y el dominio de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3-ASR, multimodal audio-texto; detalles de capas y atencion no publicados en la informacion disponible) |
| Parametros totales | 1.720.574.976 (dato real de safetensors) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; ademas mmproj-Q8_0 y mmproj-f16 para la proyeccion multimodal |
| Idiomas soportados | vietnamita (vi) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base original esta en formato transformers/safetensors |
| Tamano del repo | 17,0 GB |
| Modelo base | sunbv56/Qwen3-ASR-1.7B-Lyrics-Viet |
| Dataset de entrenamiento | sunbv56/song_dataset_training_20s_cleaned |
| Autor de la cuantizacion | mradermacher |
| Fecha de creacion | 2026-04-15 |
| Ultima actualizacion | 2026-11-04 |
| Descargas | 198 |

## Arquitectura y entrenamiento

El modelo original es un ajuste fino de Qwen3-ASR, la variante de reconocimiento de voz de la familia Qwen3. La informacion disponible no detalla el numero de capas, la dimension oculta ni el mecanismo de atencion, pero la presencia de ficheros mmproj en el repositorio GGUF confirma una arquitectura multimodal con un proyector que alinea representaciones de audio con el espacio de tokens del modelo de lenguaje. Los pesos del modelo base suman 1.720.574.976 parametros, lo que situa al modelo en la gama de 1,7B, un tamano pensado para inferencia eficiente.

El ajuste fino se realizo sobre sunbv56/song_dataset_training_20s_cleaned, un dataset de canciones fragmentadas en ventanas de 20 segundos y sometidas a un proceso de limpieza. Este diseno de ventanas cortas sugiere que el modelo esta optimizado para transcribir fragmentos de audio musical, no grabaciones largas de voz hablada. No se dispone de informacion sobre el numero total de tokens de audio utilizados, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se documentan innovaciones como decodificacion especulativa o atencion lineal en la informacion proporcionada.

Las cuantizaciones publicadas por mradermacher son estaticas; el propio autor indica que las versiones con imatrix o ponderadas no estan disponibles en el momento de la publicacion. La tabla de cuantizaciones incluye desde Q2_K hasta f16, con recomendaciones explicitas para Q4_K_S y Q4_K_M como opciones rapidas y Q8_0 como mejor calidad.

## Capacidades

- Reconocimiento automatico de voz (ASR) especializado en vietnamita, con enfasis en audio musical y letras de canciones.
- Procesamiento multimodal audio-texto: los ficheros mmproj permiten proyectar caracteristicas de audio al espacio del modelo de lenguaje.
- Transcripcion de fragmentos de audio de hasta 20 segundos, segun el diseno del dataset de entrenamiento.
- Generacion de texto a partir de audio (formato conversacional, segun los tags del repositorio).
- Compatibilidad con endpoints (tag endpoints_compatible), lo que facilita su integracion en servicios de inferencia.
- Capacidades multilingues: limitadas al vietnamita segun la metadata del modelo.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso ni vision en la informacion disponible.

## Casos de uso

- Transcripcion de letras de canciones en vietnamita: el modelo se ha ajustado especificamente sobre fragmentos musicales de 20 segundos, por lo que es adecuado para generar la letra sincronizada de pistas de audio, incluso con acompanamiento instrumental.
- Creacion de subtitulos karaoke: al transcribir fragmentos cortos de audio musical, puede alimentar pipelines que generen subtitulos por segmentos y los alineen con la pista.
- Catalogacion y busqueda de musica: transcripcion masiva de fragmentos de un catalogo para indexar canciones por su letra y habilitar busqueda textual sobre audio.
- Moderacion de contenido musical: deteccion de letras con contenido inapropiado en plataformas de streaming o UGC, transcribiendo fragmentos y aplicando clasificadores posteriores.
- Investigacion en ASR musical: el modelo sirve como linea base para experimentos de reconocimiento de voz cantada en vietnamita, un dominio con pocos recursos publicos.
- Despliegue en hardware modesto: gracias a las cuantizaciones Q4_K_S y Q4_K_M (1,2 GB), puede ejecutarse en portatiles y equipos sin GPU dedicada para tareas de transcripcion por lotes.
- Prototipado rapido con llama.cpp u Ollama: la disponibilidad de GGUF permite probar el modelo en local sin infraestructura de GPU, util para validar la calidad antes de invertir en el modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB con Q2_K (0,9 GB de pesos), 1,2-1,3 GB con Q4_K_S/Q4_K_M, 1,5-1,9 GB con Q6_K/Q8_0 y 3,5 GB con f16, mas el espacio del proyector multimodal (0,5-0,7 GB adicionales).
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM puede ejecutar las cuantizaciones Q4 y Q5; para f16 se recomienda al menos 6 GB. En el extremo profesional, A100 o H100 no aportan ventaja significativa dado el tamano del modelo, salvo por mayor throughput en lotes grandes.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas (GTX 1650 4 GB en adelante, RTX 3060, RTX 4060, RTX 4090). Las cuantizaciones Q4_K_S y Q4_K_M son las recomendadas por el autor.
- Opciones de despliegue: llama.cpp, Ollama (a partir del GGUF), y servidores compatibles con endpoints. El modelo base original puede ejecutarse con transformers y, presumiblemente, con vLLM o TGI, aunque no se documenta en la informacion disponible.
- Latencia y throughput estimados: no disponibles. Dado el tamano de 1,7B y las cuantizaciones de 1,2 GB, se espera una latencia baja en GPU consumer, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Qwen3-ASR-1.7B-Lyrics-Viet (este) | 1,72B | no disponible | vi | Apache 2.0 | GGUF, safetensors | Especializado en letras de canciones en vietnamita |
| Whisper large-v3 | 1,55B | 30 s por ventana | multilingue (99 idiomas) | MIT | safetensors, GGUF, etc. | ASR generalista, no especializado en musica |
| Whisper small | 244M | 30 s por ventana | multilingue | MIT | safetensors, GGUF, etc. | Menor calidad pero mucho mas ligero |
| Qwen3-ASR base (sin ajuste) | ~1,7B | no disponible | multilingue | Apache 2.0 | safetensors | Base generica de ASR de Qwen, sin especializacion musical |

La comparativa es orientativa: no se dispone de resultados de benchmarks que permitan comparar la calidad de transcripcion entre estos modelos. Whisper es la referencia habitual en ASR abierto, pero no esta especializado en voz cantada ni en vietnamita.

## Limitaciones y advertencias

- El modelo esta especializado en vietnamita y en audio musical de fragmentos de 20 segundos; su rendimiento en voz hablada generica o en otros idiomas no esta documentado y probablemente sea deficiente.
- No se han publicado benchmarks, por lo que la calidad real de transcripcion es desconocida mas alla de lo que indique el autor del modelo base.
- Riesgo de alucinacion en pasajes musicales con instrumentacion densa, coros superpuestos o letras poco inteligibles; no hay datos sobre la tasa de error en estos casos.
- Las cuantizaciones Q2_K y Q3_K pueden degradar la calidad de transcripcion; el autor recomienda Q4_K_S, Q4_K_M o superiores.
- El repositorio GGUF no incluye versiones con imatrix, lo que limita la calidad de las cuantizaciones de baja precision en comparacion con alternativas ponderadas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y el dataset de entrenamiento podrian tener restricciones adicionales no reflejadas en la metadata; conviene verificar la licencia del modelo original sunbv56/Qwen3-ASR-1.7B-Lyrics-Viet y del dataset sunbv56/song_dataset_training_20s_cleaned.
- El modelo tiene 0 likes y 198 descargas, lo que sugiere poca validacion por parte de la comunidad; no se dispone de informes independientes de calidad.
- La fecha de creacion (2026-04-15) y la de actualizacion (2026-11-04) son las unicas referencias temporales; no hay informacion sobre versiones previas o cambios.

## Enlaces

- Repositorio Hugging Face del GGUF: https://huggingface.co/mradermacher/Qwen3-ASR-1.7B-Lyrics-Viet-GGUF
- Modelo base original: https://huggingface.co/sunbv56/Qwen3-ASR-1.7B-Lyrics-Viet
- Dataset de entrenamiento: https://huggingface.co/datasets/sunbv56/song_dataset_training_20s_cleaned
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3-ASR-1.7B-Lyrics-Viet-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Empresa del autor: https://www.nethype.de/
