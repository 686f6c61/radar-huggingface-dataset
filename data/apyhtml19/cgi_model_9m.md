# ApyHTML19/Cgi_Model_9M

## Resumen

Cgi_Model_9M es un modelo de lenguaje de tipo transformer entrenado desde cero (*from-scratch*) por el usuario ApyHTML19 sobre el Code Général des Impôts (CGI) francés de 2026, es decir, el código tributario de Francia. No es un modelo de propósito general ni un derivado de una familia conocida: su vocabulario (10.413 tokens) y su tokenizador están ajustados al corpus fiscal francés, y su arquitectura es una implementación propia (`CGITransformer`) con RoPE, RMSNorm, SwiGLU y atención causal, que no está registrada en la librería `transformers`.

El modelo tiene 8.960.512 parámetros (8,96 M), una dimensión de modelo de 256, 8 cabezas de atención, 6 capas y una longitud máxima de secuencia de 512 tokens. Se entrenó durante 18 épocas con un *learning rate* de 0,0002, *batch size* de 8, *weight decay* de 0,1, *dropout* de 0,1 y *label smoothing* de 0,1, alcanzando su mejor *checkpoint* en la época 14. Las métricas declaradas son val_loss 2,7281 / val_perplexity 15,3035 / val_accuracy 0,5590 y test_loss 2,4548 / test_perplexity 11,6441 / test_accuracy 0,5934.

Su relevancia es acotada y muy específica: se trata de un experimento de dominio, reproducible y de tamano minimo, util como base para *fine-tuning* fiscal, como banco de pruebas de arquitecturas transformer propias y como componente ejecutable en CPU sin apenas recursos. El repositorio no tiene descargas ni *likes* al momento de la consulta, y la model card no enlaza la URL del código fuente necesario para cargar los pesos, lo que limita seriamente su uso inmediato.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only propio (`CGITransformer`), con RoPE, RMSNorm, SwiGLU y atención causal |
| Parametros totales | 8.960.512 (8,96 M), dato real de safetensors |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 512 tokens (`max_seq_len`) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en safetensors; no hay versiones GGUF, AWQ, GPTQ ni int8) |
| Idiomas soportados | frances (`fr`) |
| Licencia | other (etiquetada como `other` en HuggingFace; no se detallan los terminos) |
| Formato de pesos | safetensors (`model.safetensors`); tokenizador en `tokenizer.json` (`tokenizers.Tokenizer`) |
| Vocabulario | 10.413 tokens, tokenizador propio |
| Dimension del modelo | `d_model` = 256 |
| Cabezas de atención | 8 |
| Capas | 6 |
| Dimension de la capa feed-forward | `hidden_dim` = 1024 |
| Dropout en entrenamiento | 0,1 |
| Cabeza de lenguaje | `lm_head` atada (*tied*) al embedding; no se duplica en el safetensors |
| Integracion con `transformers` | no soportada; requiere el codigo fuente del autor |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de 6 capas con atención causal, normalizacion RMSNorm previa, activacion SwiGLU en el bloque feed-forward y codificacion posicional rotatoria (RoPE). La dimension de modelo es 256 y la capa intermedia de 1024, con 8 cabezas de atención y un vocabulario de 10.413 tokens. El desglose aritmetico de parametros cuadra exactamente con el total publicado: embedding de 10.413 x 256 = 2.665.728 parametros (compartidos con la cabeza de salida), 6 capas x (atención de 262.144 + MLP de 786.432) = 6.291.456, y 3.328 parametros de normalizacion, lo que suma 8.960.512.

El entrenamiento se hizo desde cero sobre un unico corpus: el Code Général des Impôts frances de 2026. No se documenta el numero de tokens, la composicion exacta del dataset ni la existencia de fases de *instruction tuning*, RLHF o DPO; por los hiperparametros declarados (*label smoothing* de 0,1, *dropout* de 0,1, *batch size* de 8, 18 epocas, mejor resultado en la epoca 14) se trata de un modelo base de prediccion de siguiente token, no de un modelo conversacional. No se describen innovaciones tecnicas adicionales como decodificacion especulativa, atencion lineal o estados recurrentes.

## Capacidades

- Generacion de texto de continuacion (*language modeling*) restringida al dominio del derecho fiscal frances.
- Prediccion de tokens especializada en la terminologia y el estilo del CGI: articulos, remisiones normativas y vocabulario tributario.
- Modelo base sin ajuste de instrucciones: no sigue ordenes ni mantiene formato conversacional de forma fiable.
- Capacidad multilingue: no disponible, esta declarado unicamente para frances.
- *Tool calling* / *function calling*: no disponible, no hay soporte documentado.
- Soporte de agentes o razonamiento multi-paso: no disponible; el contexto de 512 tokens hace inviable cualquier bucle de agente.
- Capacidades de vision, audio o *thinking mode*: no disponibles.
- Con la accuracy de test declarada (0,5934), la prediccion de siguiente token es moderada incluso dentro de su propio dominio.

## Casos de uso

- *Fine-tuning* fiscal especializado: por su tamano (8,96 M de parametros) puede ajustarse en una unica GPU consumer o en CPU a partir de un corpus tributario mas amplio, actuando como punto de partida reproducible con vocabulario ya adaptado al dominio.
- Autocompletado en herramientas internas para juristas: integrado en un editor de textos normativos puede sugerir continuaciones de fragmentos del CGI, siempre con revision humana, dado el contexto de 512 tokens y la perplexity de test de 11,64.
- Puntuacion de plausibilidad de textos fiscales: la perplejidad del modelo sirve como metrica de deteccion de fragmentos atipicos, redacciones anomalas o citas normativas mal formadas en un *pipeline* de control de calidad documental.
- Reranking ligero en recuperacion aumentada (RAG) sobre el CGI: el modelo puede puntuar pasajes candidatos recuperados de una base documental, aprovechando su vocabulario especifico de 10.413 tokens, aunque su ventana de 512 tokens obliga a trocear los articulos.
- Experimentacion academica con arquitecturas propias: sirve como caso de estudio de un transformer *from-scratch* (RoPE + RMSNorm + SwiGLU) entrenado de forma extremadamente economica, util para docencia o para validar implementaciones propias frente a `transformers`.
- Despliegue en entornos sin GPU o sin conexion: con 8,96 M de parametros cabe en cualquier CPU y en dispositivos con memoria muy limitada, por lo que es viable para demos offline o herramientas de escritorio con corpus fiscal embebido.
- Generacion de borradores de articulado y plantillas: puede producir esqueletos de redaccion normativa que un experto revisa y completa, reduciendo trabajo repetitivo en la redaccion de documentos tributarios internos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay MMLU, HumanEval, GSM8K ni evaluaciones estandar equivalentes). Las unicas metricas disponibles son las de validacion y test del propio entrenamiento, sobre el corpus del CGI, y no son comparables con las de otros modelos porque el vocabulario, el tokenizador y el conjunto de evaluacion son especificos de este proyecto.

| Metrica | Valor |
|---|---|
| val_loss | 2,7281 |
| val_perplexity | 15,3035 |
| val_accuracy | 0,5590 |
| test_loss | 2,4548 |
| test_perplexity | 11,6441 |
| test_accuracy | 0,5934 |
| best_epoch | 14 |
| epochs_trained | 18 |

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 36 MB de pesos (8,96 M de parametros x 4 bytes), mas el *overhead* de activaciones para secuencias de hasta 512 tokens.
- En fp16/bf16: unos 18 MB; en int8, unos 9 MB; en int4, alrededor de 5 MB (estas cuantizaciones no estan publicadas, son estimaciones teoricas sobre el tamano del modelo).
- GPU recomendadas: cualquier GPU es suficiente; no requiere A100, H100 ni RTX 4090. Cabe holgadamente en GTX 1050, RTX 3050, iGPU modernas e incluso en CPU pura.
- Cabe en GPU consumer: si, en la practica totalidad, y tambien en Raspberry Pi o dispositivos equivalentes.
- Opciones de despliegue: no hay soporte para vLLM, TGI, Ollama, llama.cpp ni servidores compatibles con `transformers`, porque la arquitectura es propia y no esta registrada. La unica via documentada es cargar `model.safetensors` con `safetensors.torch.load_file` y el codigo `src.model.CGITransformer` del repositorio fuente del autor.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones, aunque por tamano y contexto (512 tokens) la latencia en CPU deberia ser de milisegundos por secuencia.
- Nota operativa: al usar `strict=False` en `load_state_dict`, la clave del `lm_head` atado se ignora deliberadamente, ya que los pesos estan compartidos con el embedding.

## Comparativa con modelos similares

No existe una comparativa directa publicada. Se incluyen referencias de tamano y categoria proximas; los datos de rendimiento de los modelos alternativos no se han evaluado contra este modelo y se marcan como no disponibles.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Rendimiento comparable |
|---|---|---|---|---|---|
| Cgi_Model_9M (ApyHTML19) | 8,96 M | 512 | frances | other | no disponible (solo metricas internas: test_ppl 11,64) |
| SmolLM-135M (HuggingFaceTB) | 135 M | 2048 | ingles (principalmente) | Apache-2.0 | no disponible |
| GPT-2 (OpenAI) | 124 M | 1024 | ingles | modified MIT | no disponible |
| Qwen2.5-0.5B (Alibaba) | ~0,5 B | 32.768 | multilingue | Apache-2.0 | no disponible |

La diferencia clave no es de rendimiento sino de proposito: las alternativas son modelos generalistas con soporte en `transformers`, llama.cpp u Ollama, mientras que Cgi_Model_9M es un modelo de dominio, 15-50 veces mas pequeno, con contexto de 512 tokens y sin herramientas de despliegue estandar.

## Limitaciones y advertencias

- Modelo base sin ajuste de instrucciones: no debe usarse como asistente conversacional ni como chatbot sin un *fine-tuning* adicional.
- Contexto de 512 tokens: insuficiente para articulos extensos del CGI o para conversaciones multi-turno; obliga a trocear el texto de entrada.
- Riesgo de alucinacion alto: al ser un modelo de 8,96 M de parametros entrenado sobre un unico corpus normativo, puede generar referencias legales, numeros de articulo o cifras inexistentes. No debe utilizarse para asesoramiento fiscal sin revision profesional.
- Sesgos: no declarados por el autor. El corpus es un texto normativo unico, por lo que el modelo hereda su marco terminologico y normativo sin diversidad de fuentes.
- Limitacion idiomatica: solo se declara frances; no hay evidencia de capacidades en castellano u otros idiomas.
- Accuracy de test de 0,5934: la prediccion de siguiente token falla en aproximadamente el 40 % de los casos en su propio dominio, lo que se traduce en continuaciones frecuentemente incorrectas.
- Licencia `other` sin terminos detallados: no se puede asumir uso comercial libre; es necesario contactar con el autor para aclarar condiciones.
- Reproducibilidad comprometida: cargar el modelo exige el codigo fuente `src/model.py` del autor, y la model card no incluye la URL del repositorio. Ademas, la arquitectura no esta registrada en `transformers`, por lo que no funciona con `AutoModel`.
- Sin validacion de la comunidad: 0 descargas y 0 *likes* en el momento de la consulta, sin informes independientes de calidad o seguridad.
- Fecha declarada de creacion y actualizacion: 10 de septiembre de 2026; el modelo referencia el CGI de 2026, por lo que su utilidad queda ligada a esa version normativa.
- El tamano del repositorio aparece como 0,0 GB, coherente con un unico fichero de pesos de pocos megabytes, pero no se detalla el contenido completo del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ApyHTML19/Cgi_Model_9M
- Repositorio fuente con el codigo del modelo (`CGITransformer`, `src/model.py`): mencionado en la model card, pero sin URL disponible en la informacion proporcionada.
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo. Las busquedas devueltas no guardan relacion con Cgi_Model_9M ni con el Code General des Impots, por lo que no se dispone de papers, blogs, repositorios ni demos adicionales.
