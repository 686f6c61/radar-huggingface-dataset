# Mrt45/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive

## Resumen

Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive es una derivacion "abliterada" (sin censura) del modelo Qwen/Qwen3.6-35B-A3B, publicada por el usuario Mrt45 a partir del trabajo de cuantizacion de HauhauCS. Se trata de un modelo de lenguaje multimodal nativo (texto, imagen y video) con arquitectura de mezcla de expertos (MoE) de 35.000 millones de parametros totales y aproximadamente 3.000 millones activos por token, lo que permite un coste de inferencia muy inferior al de un denso del mismo tamano. El repositorio distribuido contiene exclusivamente pesos en formato GGUF, incluido el proyector multimodal `mmproj`, y ocupa 247,4 GB en total.

El modelo base pertenece a la familia Qwen3.6 y emplea una arquitectura hibrida que combina atencion lineal con atencion softmax completa en una proporcion 3:1, repartida en 40 capas, con 256 expertos de los que se enrutan 8 por token. La ventana de contexto nativa es de 262.000 tokens, un valor muy por encima de la media de los MoE abiertos de su segmento, lo que lo hace candidato para tareas de contexto largo como analisis de repositorios completos o procesamiento de documentos extensos.

Su relevancia actual radica en dos factores. Por un lado, la variante "Aggressive" elimina los rechazos del modelo original: el autor afirma 0 rechazos sobre 465 peticiones de prueba. Por otro, el uso de cuantizaciones personalizadas K_P ("Perfect") generadas con importance matrix (imatrix) busca preservar la calidad del modelo original tras la ablacion, un punto historicamente problematico en los modelos sin censura. La licencia declarada es Apache 2.0, lo que permite uso comercial, aunque la naturaleza del contenido generado exige controles adicionales en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE hibrido (atencion lineal + atencion softmax completa en ratio 3:1) |
| Parametros totales | 34.660.610.688 (segun safetensors); ~35B declarados por el autor |
| Parametros activos | ~3B por pasada forward (MoE, 256 expertos, 8 enrutados por token) |
| Longitud de contexto | 262.000 tokens nativos |
| Tipos de cuantizacion | GGUF: Q8_K_P, Q8_0, Q6_K_P, Q6_K, Q5_K_P, Q5_K_M, Q4_K_P, Q4_K_M, IQ4_NL, IQ4_XS, Q3_K_P, Q3_K_M, IQ3_M, Q2_K_P, IQ2_M; proyector multimodal mmproj en f16 |
| Idiomas soportados | Ingles (en), chino (zh), multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (principal); mmproj f16 para vision |
| Capas | 40 |
| Modalidades | Texto, imagen y video (image-text-to-text) |
| Repo size | 247,4 GB |
| Descargas / likes | 643 / 0 |
| Fecha de publicacion | 2026-10-09 |

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE hibrido de 40 capas con 256 expertos y 8 expertos enrutados por token, lo que da un ratio de activacion de aproximadamente el 8,6 % de los parametros totales en cada pasada. La innovacion estructural mas destacable es la combinacion de atencion lineal y atencion softmax completa en una proporcion 3:1, un patron que reduce el coste computacional y de memoria de la cache KV en contextos muy largos (hasta 262.000 tokens) manteniendo la capacidad de recuperacion precisa que aportan las capas de atencion completa. El modelo es multimodal de forma nativa, no mediante un adaptador anadido a posteriori, y procesa texto, imagenes y video.

Sobre el entrenamiento no se proporciona informacion en la documentacion disponible: no se detallan el numero de tokens, la composicion del dataset, ni si se aplicaron fases de RLHF, DPO u otras tecnicas de alineamiento. El autor indica que la variante Aggressive no modifica datasets ni capacidades respecto al modelo original: se trata de una ablacion orientada a eliminar los rechazos, "100 % de lo que los autores originales pretendian, solo sin los rechazos". Las cuantizaciones K_P se generan con importance matrix (imatrix) y un perfil de cuantizacion especifico por modelo; segun el autor, una K_P equivale a subir uno o dos niveles de cuantizacion con solo un 5-15 % mas de tamano de fichero respecto al quant base.

## Capacidades

- Generacion de texto conversacional en ingles, chino y otros idiomas (etiquetado como multilingue).
- Razonamiento con modo "thinking" activado por defecto, con hiperparametros de muestreo diferenciados para tareas generales, de codigo y de razonamiento.
- Comprension multimodal: entrada de imagenes y video ademas de texto (`pipeline_tag: image-text-to-text`).
- Contexto largo nativo de 262.000 tokens, apto para documentos extensos y conversaciones multi-turno prolongadas.
- Generacion sin rechazos: el autor reporta 0/465 rechazos en su bateria de pruebas.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags) y uso conversacional.
- No se documenta en la informacion disponible soporte explicito de tool calling, function calling ni flujos de agente multi-paso. Tampoco se detallan capacidades especificas de matematicas ni de generacion de codigo con benchmarks, aunque las configuraciones recomendadas incluyen un preset para "coding/precise tasks".

## Casos de uso

- Analisis de repositorios completos: con 262.000 tokens de contexto y 40 capas, permite introducir arboles de codigo, documentacion y ficheros de configuracion en una sola ventana sin trocear, algo que en modelos de 32K obliga a pipelines de retrieval.
- Procesamiento de documentacion tecnica extensa: manuales, normativas o contratos que superan los 100.000 tokens se pueden procesar de una vez, reduciendo la perdida de informacion entre fragmentos.
- Descripcion y analisis de imagenes y video: al ser multimodal nativo, sirve para etiquetado automatico de material audiovisual, extraccion de informacion de capturas o transcripcion descriptiva de clips.
- Despliegue en hardware de gama alta de consumo: con las cuantizaciones IQ2_M (11 GB) o IQ4_XS (19 GB) cabe en GPUs de 12-24 GB, lo que permite ejecutar localmente un MoE de 35B con unos 3B activos por token.
- Generacion creativa sin restricciones editoriales: la ablacion Aggressive esta pensada para redaccion de ficcion, dialogos o contenido adulto sin bloqueos por filtros de seguridad, un caso donde los modelos alineados estandar rechazan peticiones legitimas.
- Preprocesado de datasets y anotacion: la combinacion de contexto largo y multimodalidad permite generar anotaciones ricas (descripciones, resumenes, extraccion estructurada) sobre corpus de texto e imagen antes de entrenar otros modelos.
- Asistentes conversacionales de dominio tecnico: los presets de temperatura y penalizacion de presencia publicados permiten fijar un comportamiento estable en produccion para dialogos multi-turno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El unico dato cuantitativo de evaluacion aportado por el autor es la tasa de rechazos de la variante Aggressive: 0 de 465 peticiones. No se incluyen resultados de MMLU, HumanEval, GSM8K, MMMU ni de ninguna otra suite, ni comparaciones numericas frente al modelo base.

## Requisitos de hardware

- VRAM estimada (solo pesos, sin cache KV): Q8_K_P ~44 GB; Q6_K_P ~31 GB; Q5_K_P ~28 GB; Q4_K_P ~23 GB; Q4_K_M ~21 GB; IQ4_XS ~19 GB; IQ3_M ~15 GB; IQ2_M ~11 GB. El proyector multimodal anade 899 MB.
- Cache KV: no cuantificada en la documentacion. Con 262.000 tokens de contexto el consumo es elevado incluso con atencion hibrida; para contextos largos conviene usar cuantizacion de cache KV o reducir la ventana efectiva.
- GPU recomendadas por cuantizacion: H100 80 GB o A100 80 GB para Q8_K_P; A100 40 GB o 2x RTX 4090 para Q6_K_P y Q5_K_P; RTX 4090 24 GB (ajustado) o A6000 48 GB para Q4_K_M y Q4_K_P; RTX 3090 24 GB, RTX 4080 o RTX 4070 Ti Super para IQ4_XS; RTX 3060 12 GB o RTX 4070 para IQ2_M.
- Cabe en GPU de consumo: si, en cuantizaciones de 4 bits o inferiores (Q4_K_M, IQ4_XS, IQ3_M, IQ2_M) sobre GPUs de 12-24 GB. Las cuantizaciones de 5 bits en adelante requieren 28 GB o mas y obligan a offload a CPU/RAM o a multi-GPU.
- Opciones de despliegue: llama.cpp (recomendado por el autor, con el flag `--jinja` para la plantilla de chat), LM Studio, y cualquier runtime compatible con GGUF. El autor no menciona builds especiales: las K_P cargan en runtimes estandar. Para vision es obligatorio cargar el fichero `mmproj` junto al GGUF principal. No se documenta soporte de vLLM ni TGI para este repositorio concreto.
- Ajustes recomendados: modo thinking con `temperature=1.0, top_p=0.95, top_k=20, min_p=0, presence_penalty=1.5` para uso general, y `temperature=0.6, top_p=0.95, top_k=20, presence_penalty=0` para codigo y tareas precisas. En modo no-thinking, `temperature=0.7, top_p=0.8, top_k=20, presence_penalty=1.5` general y `temperature=1.0, top_p=1.0, top_k=40, presence_penalty=2.0` para razonamiento. El autor advierte de mantener al menos 128K de contexto para no degradar el modo thinking.
- Latencia y throughput: no disponible en la informacion proporcionada. El ratio de ~3B parametros activos por token sugiere un throughput muy superior al de un modelo denso de 35B, pero no hay cifras medidas publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Modalidad | Licencia | Estado |
|---|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive | ~35B | ~3B | 262K | Texto, imagen, video | Apache 2.0 | GGUF publicado, 643 descargas |
| Qwen/Qwen3.6-35B-A3B (base) | ~35B | ~3B | 262K | Texto, imagen, video | Apache 2.0 | Modelo original con alineamiento de seguridad |
| Otros MoE abiertos de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion sustentada por la informacion disponible es la del modelo frente a su base: comparten arquitectura, numero de parametros, contexto y modalidad. La diferencia declarada es la eliminacion de rechazos en la variante Aggressive, con la advertencia del autor de que puede anadir avisos breves heredados del entrenamiento del modelo base, sin que ello impida generar el contenido completo. No se dispone de datos sobre alternativas de otros proveedores para comparar parametros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia numerica de que la ablacion preserve la calidad del modelo base mas alla de la afirmacion del autor sobre el uso de imatrix.
- Sesgos: la model card no documenta ninguna evaluacion de sesgos. Al eliminar los rechazos, el modelo puede reproducir con mayor facilidad contenido estereotipado o danino que el modelo base bloqueaba.
- Riesgo de alucinacion: inherente a los modelos generativos y no cuantificado en esta ficha; en tareas de contexto largo el riesgo aumenta si la informacion relevante queda en posiciones intermedias de la ventana.
- Contenido no filtrado: los pesos estan abliterados de forma "agresiva". El autor advierte de que es un modelo "completamente desbloqueado" que no rechaza peticiones. Requiere moderacion externa obligatoria en cualquier despliegue publico.
- Avisos residuales: el autor indica que el modelo puede anadir ocasionalmente avisos breves heredados del entrenamiento del base; no son rechazos, pero pueden aparecer en la salida.
- Limitaciones de idioma: la ficha declara en, zh y multilingue, pero no cuantifica el rendimiento por idioma. El castellano no esta listado explicitamente, por lo que la calidad en espanol no esta garantizada.
- Contexto: aunque la ventana nativa es de 262K, el autor recomienda no bajar de 128K para conservar el modo thinking, lo que impone un suelo de consumo de memoria en produccion.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero no exime de responsabilidad legal sobre el contenido generado ni de las obligaciones de divulgacion aplicables en la UE.
- Repositorio de terceros: el autor del repo (Mrt45) no es el autor del modelo base (Qwen) ni el autor original de las cuantizaciones (HauhauCS). Conviene verificar la integridad de los ficheros antes de usarlos en produccion.
- Compatibilidad de herramientas: el widget de compatibilidad de hardware de HuggingFace no reconoce los quants K_P y puede mostrar menos ficheros de los existentes; en LM Studio la columna de quant puede mostrar "?" sin que ello afecte al funcionamiento.
- Metadatos de fecha: los campos de creacion y actualizacion indican 2026-10-09, una fecha posterior a la del conocimiento de referencia de este analisis; los datos proceden exclusivamente de lo declarado en HuggingFace.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/Mrt45/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Discord del autor de las cuantizaciones: https://discord.gg/SZ5vacTXYf
- Repositorio de HauhauCS (origen de los quants): https://huggingface.co/HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive
- Ficheros de cuantizacion citados en la model card: `Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive-Q8_K_P.gguf`, `-Q6_K_P.gguf`, `-Q5_K_P.gguf`, `-Q4_K_P.gguf`, `-Q4_K_M.gguf`, `-IQ4_NL.gguf`, `-IQ4_XS.gguf`, `-Q3_K_P.gguf`, `-IQ3_M.gguf`, `-Q2_K_P.gguf`, `-IQ2_M.gguf` y `mmproj-Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive-f16.gguf`, todos bajo la ruta `resolve/main/` del repositorio.
- Paper, blog tecnico o repositorio de codigo: no disponible. La busqueda web realizada no devolvio ningun resultado relevante sobre el modelo; los enlaces recuperados corresponden a foros sin relacion con el proyecto y no se incluyen como fuentes.
