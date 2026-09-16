# fetchingcat/occamy-1.0-mtp-gguf

## Resumen

Occamy-1.0 MTP GGUF es una cuantizacion Q4_K_M con importance matrix del modelo Accio-Lab/occamy-1.0, publicada por el usuario fetchingcat. Su particularidad no es la cuantizacion en si, sino que restaura la cabeza de prediccion multi-token (MTP) que el checkpoint original de Occamy habia perdido. Occamy-1.0 es un fine-tune de parametros completos de Qwen/Qwen3.6-35B-A3B, y mientras el modelo base de Qwen conserva su cabeza MTP, la configuracion de Occamy declara `text_config.mtp_num_hidden_layers = 0` y no publica tensores `mtp.*`. Sin esa cabeza, ningun GGUF de Occamy puede hacer decodificacion especulativa en llama.cpp u Ollama.

Este repositorio trasplanta los 19 tensores `mtp.*` de Qwen/Qwen3.6-35B-A3B (revision `995ad96e`) al checkpoint de Occamy y reactiva `mtp_num_hidden_layers = 1`. La arquitectura subyacente es identica (40 capas, 256 expertos, hidden 2048, vocabulario 248320), por lo que la cabeza encaja sin cambios estructurales. El resultado son 35.505.251.456 parametros en el GGUF, exactamente 844.640.768 mas que las conversiones publicadas por bartowski y mradermacher, que es precisamente el tamano de la cabeza MTP.

Es relevante ahora porque permite servir Occamy con decodificacion especulativa en hardware de consumo o estaciones compactas: el autor mide un aumento de 43,5 a 58,9 tokens/s (aproximadamente 1,35x) en una DGX Spark GB10 con Q4_K_M. El repositorio incluye ademas el safetensors con los 19 tensores MTP y el script del trasplante, de modo que las afirmaciones son verificables y el injerto se puede reproducir a precision completa para vLLM o SGLang.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts (MoE) con atencion hibrida: 40 capas, 256 expertos, hidden 2048, vocabulario 248320; 10 capas con atencion completa y 30 capas de atencion lineal con estado constante |
| Parametros totales | 35.505.251.456 en el GGUF (incluye 844.640.768 de la cabeza MTP) |
| Parametros activos | Aproximadamente 3B, segun la nomenclatura A3B del modelo base Qwen3.6-35B-A3B |
| Longitud de contexto | 262.144 tokens (ventana nativa, probada de extremo a extremo con cache KV q8_0) |
| Tipos de cuantizacion | Q4_K_M con importance matrix (imatrix); mmproj en F16; cabeza MTP en safetensors sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp/Ollama); safetensors para la cabeza MTP |

## Arquitectura y entrenamiento

El modelo subyacente, Occamy-1.0, es un fine-tune de parametros completos de Qwen/Qwen3.6-35B-A3B. La arquitectura es un transformer MoE con atencion hibrida: de las 40 capas, solo 10 mantienen cache KV creciente (las capas 3, 7, 11 ... 39, es decir una de cada cuatro), mientras que las 30 restantes son capas de atencion lineal con estado constante. Esto reduce el cache KV a aproximadamente un cuarto del de un modelo convencional de 40 capas a la misma longitud, lo que hace viable la ventana de 262.144 tokens. Segun la model card, el entrenamiento de Occamy incluyo SFT, HDPO, model merging y SAO. No se detalla el volumen de tokens ni la composicion del dataset.

La innovacion de este repositorio concreto es el injerto de la cabeza MTP. Los 19 tensores `mtp.*` de Qwen/Qwen3.6-35B-A3B se copian en el checkpoint de Occamy y `convert_hf_to_gguf.py` los mapea a `blk.40.nextn.*` con `block_count=41` y `nextn_predict_layers=1`. El autor advierte explicitamente de que la cabeza fue entrenada por Qwen para predecir sobre los estados ocultos del modelo base, no de Occamy, cuyos estados cambiaron tras SFT, HDPO, merging y SAO. Por tanto la aceptacion del borrador es algo peor que en el modelo nativo (se conserva entre un 85% y un 90% de la aceptacion nativa, que ronda 2,6 de longitud media). Como llama.cpp verifica cada token draft contra el modelo completo y descarta los rechazados, el efecto es una perdida de throughput, nunca de calidad de salida.

La vision se sirve mediante un archivo `mmproj` aparte. El autor verifico que el torre de vision de Occamy es bit-identica a la de Qwen/Qwen3.6-35B-A3B: los 333 tensores comparados resultan iguales, porque Accio congelo encoder y proyector durante el SFT. El caveat es que el proyector se alineo contra el modelo de lenguaje base, que el entrenamiento de Occamy desplazo; esto es una propiedad del release original y afecta igual si se sirve Occamy con vLLM o SGLang. Accio no publica benchmarks de vision.

## Capacidades

- Generacion de texto y razonamiento general en modo thinking, con bloques `<think>`; el autor recomienda acotar `num_predict` para evitar bloques de razonamiento desbocados.
- Razonamiento estructurado y aritmetica: la aceptacion de la decodificacion especulativa medida es notablemente superior en texto estructurado y aritmetica que en prosa, lo que indica salidas mas predecibles en ese dominio.
- Vision (image-text-to-text): soportada mediante `mmproj-occamy-1.0-F16.gguf`, con encoder y proyector congelados e identicos a los del modelo base.
- Etiquetado como agentic por el autor del repositorio (tag `agentic`); no se detalla en la model card un soporte explicito de tool calling o function calling.
- Decodificacion especulativa con MTP: `--spec-type draft-mtp` en llama.cpp, con `draft_num_predict 2` en Ollama.
- Capacidades multilingues: no disponible.
- No se documentan capacidades de audio ni de otro tipo.

## Casos de uso

- Razonamiento largo con contexto extenso: gracias a los 262.144 tokens de ventana y a un cache KV reducido (solo 10 de 40 capas lo mantienen), el modelo puede procesar documentos tecnicos completos, repositorios de codigo o historiales largos sin fragmentar la entrada.
- Analisis de documentos con imagenes: usando el mmproj, se pueden enviar capturas, diagramas o paginas escaneadas junto con texto y obtener respuestas combinadas; encaja en flujos de extraccion de datos de informes o facturas escaneadas.
- Asistentes de razonamiento en local: el modo thinking permite tareas de planificacion o resolucion de problemas paso a paso en una maquina de un solo usuario, sin depender de APIs externas, bajo licencia apache-2.0.
- Servicio en produccion con throughput ajustado: mediante decodificacion especulativa MTP se pasa de 43,5 a 58,9 tokens/s en el hardware medido, lo que permite atender mas peticiones concurrentes con el mismo equipo.
- Pipelines de generacion aumentada por recuperacion (RAG): la ventana de 262.144 tokens admite inyectar muchos fragmentos recuperados sin truncar, y el cache KV reducido abarata mantener sesiones largas activas.
- Despliegue en estaciones compactas de una sola GPU: el archivo Q4_K_M de 21,7 GB y el diseno de atencion hibrida hacen viable ejecutar el modelo en equipos tipo DGX Spark GB10, documentados por el autor.
- Reproduccion y ajuste de cuantizaciones propias: el repositorio incluye `model-mtp.safetensors` y `occamy-mtp-transplant.py`, de modo que un equipo puede construir el checkpoint injertado a precision completa y generar sus propias cuantizaciones o servir con vLLM/SGLang.
- Evaluacion de decodificacion especulativa con cabezas trasplantadas: util como caso de estudio reproducible sobre cuanto se degrada la aceptacion de un draft head cuando los estados ocultos han cambiado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para MMLU, HumanEval, GSM8K ni similares. Lo unico medido por el autor es la eficacia de la decodificacion especulativa y el throughput:

| Metrica | Valor |
|---|---|
| Longitud media de aceptacion, prosa y razonamiento general | 2,22 - 2,29 |
| Tasa de aceptacion por posicion, prosa y razonamiento general | (0,73, 0,49) - (0,75, 0,54) |
| Longitud media de aceptacion, texto estructurado y aritmetica | 2,69 - 2,81 |
| Tasa de aceptacion por posicion, texto estructurado y aritmetica | (0,91, 0,78) - (0,96, 0,86) |
| Longitud media de aceptacion del mismo cabezal en su modelo base nativo | ~2,6 |
| Throughput con `--spec-type none` (llama-cli, DGX Spark GB10, Q4_K_M) | 43,5 tokens/s |
| Throughput con `--spec-type draft-mtp` | 58,9 tokens/s |
| Aceleracion | ~1,35x |

Medicion realizada en Ollama con `--spec-draft-n-max 2`.

## Requisitos de hardware

- Pesos del modelo en Q4_K_M: 21,7 GB. Si se usa vision, anadir 899 MB del `mmproj` en F16. Las cifras de VRAM son estimaciones a partir del tamano de archivo publicado; el cache KV exacto depende de la configuracion de llama.cpp y del tipo de cache elegido.
- Cache KV: solo 10 de las 40 capas mantienen cache creciente, por lo que a 262.144 tokens el autor lo estima en aproximadamente un cuarto del de un modelo convencional de 40 capas. El autor probo la ventana completa con cache KV q8_0.
- GPU de consumo: una RTX 4090 o RTX 3090 de 24 GB queda muy justa para Q4_K_M (21,7 GB de pesos) y obliga a reducir contexto, usar cache KV mas agresivo o descargar parte de las capas a CPU. Una RTX 5090 de 32 GB ofrece margen apreciable.
- GPU profesional: A100 40/80 GB, H100 y similares permiten el modelo completo con contexto largo sin concesiones.
- Hardware medido por el autor: DGX Spark GB10, con 43,5 tokens/s sin decodificacion especulativa y 58,9 tokens/s con ella.
- Despliegue: llama.cpp (`llama-cli` con `-ngl 99`, `-c 262144`, `-fa on`) y Ollama mediante Modelfile. Para vLLM o SGLang hay que construir primero el checkpoint injertado a precision completa usando `model-mtp.safetensors` y el script incluidos; el GGUF no es el formato adecuado para esos motores.
- Parametros de muestreo recomendados por Accio: temperatura 1.0, top_p 0.95, top_k 20, presence_penalty 1.5. El autor advierte de que sin esa penalizacion el modelo puede entrar en bucles en trazas de razonamiento largas.
- Si se baja la temperatura a 0.6 (guia de Qwen para la familia thinking), el autor sugiere reducir la penalizacion de presencia hacia 0.5, porque Accio ajusto temperatura y penalizacion como una pareja.

## Comparativa con modelos similares

| Modelo | Parametros en GGUF | Cabeza MTP | Decodificacion especulativa | Licencia |
|---|---|---|---|---|
| fetchingcat/occamy-1.0-mtp-gguf (este repo) | 35.505.251.456 | Si, injertada desde Qwen3.6-35B-A3B | Si, ~1,35x de aceleracion medida | apache-2.0 |
| bartowski/Accio-Lab_occamy-1.0-GGUF | 34.660.610.688 | No | No | apache-2.0 (heredada del modelo base) |
| mradermacher/occamy-1.0-i1-GGUF | 34.660.610.688 | No | No | apache-2.0 (heredada del modelo base) |
| Qwen/Qwen3.6-35B-A3B (modelo base del linaje) | no disponible | Si, nativa | Si, con ~2,6 de longitud media de aceptacion | no disponible en la informacion proporcionada |

Los tres GGUF de Occamy comparten la misma arquitectura y el mismo linaje de fine-tune; la unica diferencia funcional es la presencia de la cabeza MTP. La comparacion con Qwen3.6-35B-A3B sirve como referencia de aceptacion nativa: el cabezal trasplantado conserva entre un 85% y un 90% de la aceptacion que obtendria sobre su modelo original.

## Limitaciones y advertencias

- La cabeza MTP no fue entrenada para Occamy. Se trasplanta desde el modelo base y su aceptacion es inferior a la nativa; el autor lo declara de forma explicita. El impacto es de throughput, no de calidad, porque llama.cpp verifica cada token draft.
- El proyector de vision se alineo contra el modelo de lenguaje base, que el entrenamiento de Occamy desplazo. Esto puede degradar la calidad multimodal, y Accio no publica benchmarks de vision que permitan cuantificarlo.
- Sin `presence_penalty 1.5` el modelo puede entrar en bucles en trazas de razonamiento largas; es una recomendacion del autor, no un ajuste opcional.
- El autor recomienda acotar `num_predict` (por ejemplo 32768) para limitar bloques `<think>` desbocados. Ese parametro acota la generacion, no el contexto.
- No hay datos publicados de idiomas soportados. No se puede afirmar cobertura multilingue con la informacion disponible.
- No hay resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) ni en este repositorio ni citados del release de Accio. No se puede evaluar la calidad del modelo con numeros.
- Licencia apache-2.0 en este repositorio. Conviene verificar la licencia efectiva del modelo base Accio-Lab/occamy-1.0 antes de un uso comercial, ya que aqui solo consta la del artefacto de cuantizacion.
- El repo no se ha descargado ni ha recibido likes en el momento de la consulta (0 descargas, 0 likes), por lo que no existe validacion de la comunidad sobre el injerto mas alla de las mediciones del propio autor.
- El tamano de repositorio reportado por HuggingFace (1.9 GB) no se corresponde con la suma de los archivos listados en la model card (mas de 23 GB); es probable que se deba a como se contabiliza el almacenamiento LFS, pero conviene verificarlo al descargar.
- La model card proporcionada aparece truncada al final (el apartado de cuantizacion termina en "Layer 40 is"), por lo que puede faltar informacion sobre el tratamiento de esa capa.
- La cuantizacion Q4_K_M deja 13 tensores sin datos de imatrix (la cabeza MTP en `blk.40.*`, `token_embd.weight` y `output.weight`), que caen a las reglas por defecto de Q4_K_M. La cobertura por experto fue del 99,2% al 99,6% en las capas de 256 expertos, con una imatrix calculada sobre `calibration_datav3.txt` (129 fragmentos, contexto de 512 tokens).

## Enlaces

- HuggingFace (este repositorio): https://huggingface.co/fetchingcat/occamy-1.0-mtp-gguf
- Modelo base: https://huggingface.co/Accio-Lab/occamy-1.0
- Modelo base del linaje: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Cuantizacion alternativa de bartowski: https://huggingface.co/bartowski/Accio-Lab_occamy-1.0-GGUF
- Cuantizacion alternativa de mradermacher: https://huggingface.co/mradermacher/occamy-1.0-i1-GGUF
- No se han proporcionado papers, blogs, repositorios de codigo ni demos adicionales en la informacion disponible.
