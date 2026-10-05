# litert-community/Laya-Multilingual-LiteRT

## Resumen

Laya-Multilingual-LiteRT es la conversion al runtime LiteRT del checkpoint multilingue de convaiinnovations/laya (mmBERT-base), publicada por la organizacion litert-community de Google AI Edge. No es un modelo generativo: es un encoder de clasificacion que recibe un texto o un estado en JSON y responde, en una sola pasada hacia delante por pregunta, cuestiones definidas en tiempo de peticion (elegir una opcion, puntuar en una escala ordinal o devolver una probabilidad si/no). El paquete esta pensado para ejecutar esa clasificacion en la GPU o la NPU de un telefono Android.

Su relevancia esta en el rendimiento medido: con LiteRT 2.2.0 sobre un Samsung Galaxy S26 (SM-S942Q, Android 16) logra 51 ms de tiempo de grafo por pregunta en GPU con computo FP32 explicito, 36 ms en la NPU Hexagon y 60 ms de extremo a extremo en la aplicacion de ejemplo sobre GPU, con una ventana de 256 tokens. En 201 filas de validacion en ingles y japones las respuestas coinciden con la implementacion oficial `laya` 0.3.4 fp32 en CPU: mismo argmax en toda pregunta de eleccion y de puntuacion, y una diferencia maxima de probabilidad de 0,0014 en GPU y 0,0069 en NPU.

El repositorio ocupa 3,5 GB e incluye grafos `.tflite` para ventanas de 256 y 512 tokens, una cabeza de accion (`act head`), la tabla de embeddings de tokens, el tokenizador y los ficheros de calibracion, ademas de una aplicacion de ejemplo Android con tokenizador Kotlin. La licencia es Apache-2.0 y el checkpoint base declara soporte para mas de 100 idiomas, aunque aqui solo se han validado ingles y japones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer derivado de ModernBERT (checkpoint mmBERT-base); capas FULLY_CONNECTED, GeGLU y LayerNorm; el modelo base convaiinnovations/laya es de tipo ModernBERT |
| Parametros totales | no disponible (variante base de mmBERT; la tabla de embeddings tiene forma [256000, 768], lo que indica una dimension oculta de 768) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 o 512 tokens segun el grafo elegido (campo "Window N" de los ficheros `.tflite`); la ventana del checkpoint base no se detalla en la informacion proporcionada |
| Tipos de cuantizacion | Pesos float16 con DEQUANTIZE a float32 (`wfp16`: 99 tensores FULLY_CONNECTED) y fp32 puro; activaciones y demas constantes en float32; la NPU computa en fp16 |
| Idiomas soportados | Ingles y japones validados (201 filas de validacion EN/JA); el publicador de Laya lista mas de 100 idiomas para el checkpoint multilingue |
| Licencia | apache-2.0 |
| Formato de pesos | LiteRT `.tflite`; tabla de embeddings `token_embeddings_fp16.bin` ([256000, 768] float16); `tokenizer.json` y `tokenizer_config.json`; fichero de calibracion JSON |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de la familia ModernBERT en su variante multilingue mmBERT-base, con atencion, LayerNorm y bloques GeGLU. La conversion a LiteRT conserva 99 tensores de pesos de capas FULLY_CONNECTED; en los ficheros `wfp16` esos tensores se almacenan en float16 y se deconvierten a float32, mientras que todas las activaciones y el resto de constantes permanecen en float32. La tabla de embeddings de tokens no va dentro del grafo principal en este paquete: la aplicacion la busca en un fichero externo de 393.216.000 bytes ([256000, 768] float16) y entrega las filas resultantes al grafo. Una cabeza de accion independiente (`laya_ml_act_head_fp32.tflite`, 795.816 bytes) es compartida por todos los grafos principales, y `laya_ml_calibration.json` contiene temperaturas de calibracion por tipo de pregunta y numero de opciones.

Los grafos son seguros en fp16 gracias a tres reescrituras (revision del 29 de septiembre de 2026) que dan resultados identicos en fp32, bit a bit, frente a la version previa en PyTorch: a partir de la capa 12 las filas de inicio de texto y separador alcanzan valores de hasta 1,4e4, cuyos cuadrados desbordan fp16 dentro de LayerNorm, por lo que cada LayerNorm grande opera sobre su entrada escalada por una potencia de dos con epsilon escalado por el cuadrado; las mascaras de atencion usan -1e4 en lugar de -1e9 (que en fp16 es -inf y convierte un peso de mascara nulo en NaN); y las capas 11 y 12 trasladan una potencia de dos desde el producto GeGLU a la proyeccion de salida. Sin estas reescrituras, todas las filas resultaban no finitas en la NPU.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en el material proporcionado.

## Capacidades

- Clasificacion de texto zero-shot: responde preguntas definidas en tiempo de peticion sobre un texto o un estado JSON, sin reentrenamiento.
- Eleccion entre varias opciones: devuelve el argmax entre las alternativas que se le presenten en la peticion.
- Puntuacion en escala ordinal: asigna un valor dentro de una escala ordenada (por ejemplo, nivel de urgencia o de sentimiento).
- Probabilidad si/no: entrega una probabilidad calibrada para preguntas binarias, con temperaturas de calibracion por tipo de pregunta y numero de opciones.
- Entrada estructurada: acepta JSON como estado de entrada, ademas de texto plano.
- Multilingue: el checkpoint base declara mas de 100 idiomas; aqui se ha validado en ingles y japones, con XNLI en ingles de 0,843 frente a 0,860 del checkpoint ingles especifico.
- Ejecucion en dispositivo: inferencia en GPU Android y en NPU Hexagon mediante LiteRT, con una aplicacion de ejemplo en Kotlin y Compose.
- Capacidad de agente o tool calling: no disponible; el modelo no genera texto ni llamadas a herramientas, solo devuelve decisiones sobre preguntas previamente formuladas.

## Casos de uso

- Triaje de correo de soporte en japones e ingles: la aplicacion de ejemplo del repositorio clasifica un correo de soporte inventado en japones y responde a la primera pregunta en la GPU del telefono, con 60 ms de extremo a extremo en la app; es adecuado para enrutar incidencias sin salir del dispositivo.
- Enrutado de tickets por categoria y urgencia: cada decision (categoria, prioridad, equipo destinatario) es una pregunta independiente y una pasada hacia delante, de modo que un mismo texto se puede etiquetar con varias preguntas encadenadas a 51 ms por pregunta en GPU.
- Analisis de encuestas con escala ordinal: el modelo puntua respuestas abiertas en una escala ordenada y aplica las temperaturas de `laya_ml_calibration.json`, lo que permite obtener puntuaciones comparables entre encuestados sin un modelo generativo.
- Procesamiento de facturas: el flujo de trabajo de facturacion cubierto por el fine-tune ingles de la familia se apoya en la formulacion del estado como JSON; el paquete multilingue permite plantear preguntas equivalentes sobre documentos en otros idiomas, con 256 tokens de ventana.
- Deteccion de incidentes de seguridad: clasificacion de eventos y alertas como si/no o como eleccion entre niveles de severidad, ejecutable en la NPU (36 ms por pregunta) para no consumir bateria ni GPU.
- Observabilidad de trazas de agentes: el modelo puede etiquetar trazas de agentes con las mismas preguntas definidas en tiempo de peticion, util para clasificar comportamiento anotado en logs sin enviar los datos a un servicio externo.
- Moderacion de contenido y filtrado en el dispositivo: la inferencia local evita enviar texto potencialmente sensible a la nube, requisito habitual en despliegues con datos personales.
- Clasificacion por lotes de documentos largos en escritorio: los grafos de 512 tokens se han validado en CPU de escritorio, lo que permite procesar textos mas largos fuera del movil.

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| Tiempo de grafo por pregunta | 51 ms | GPU del Galaxy S26 (SM-S942Q), ventana de 256 tokens, FP32 explicito |
| Tiempo de grafo por pregunta | 36 ms | NPU Hexagon del Galaxy S26, ventana de 256 tokens |
| Latencia de extremo a extremo | 60 ms | Aplicacion de ejemplo sobre GPU, incluye el conjunto recomendado |
| Coincidencia con `laya` 0.3.4 fp32 en CPU | mismo argmax en toda pregunta de eleccion y puntuacion | 201 filas de validacion en ingles y japones |
| Diferencia maxima de probabilidad | 0,0014 en GPU / 0,0069 en NPU | 201 filas de validacion EN/JA |
| XNLI (ingles) | 0,843 | Checkpoint multilingue; 0,860 para el checkpoint ingles de la familia |
| Tiempo por pregunta, checkpoint ingles | 123 ms (126 ms con el fine-tune) | GPU del Galaxy S26, ventana de 256 tokens |
| Tiempo por pregunta, paquete token-id | 54 ms multilingue / 127 ms ingles | GPU, sin busqueda en tabla externa |

## Requisitos de hardware

- Tamano en dispositivo del conjunto recomendado (S256 wfp16, cabeza de accion, tabla de tokens, tokenizador y calibracion): 679.274.525 bytes, aproximadamente 0,68 GB.
- Grafos y ficheros: `laya_ml_s256_embeds_wfp16.tflite` 250.889.040 bytes; `laya_ml_s256_embeds_fp32.tflite` 500.970.372 bytes; `laya_ml_s512_embeds_wfp16.tflite` 251.806.544 bytes; `laya_ml_s512_embeds_fp32.tflite` 501.887.876 bytes; `laya_ml_act_head_fp32.tflite` 795.816 bytes; tabla de embeddings 393.216.000 bytes; tokenizador 34.363.188 bytes.
- Hardware validado: Samsung Galaxy S26 (SM-S942Q) con Android 16, en GPU, NPU Hexagon y CPU, con LiteRT 2.2.0. Los grafos de 512 tokens solo se han validado en CPU de escritorio.
- Otras GPU y NPU Android: no validadas segun la propia model card.
- VRAM estimada para GPU de escritorio: no disponible; el material proporcionado solo reporta validacion en movil y en CPU de escritorio.
- Encaje en GPU de consumo: no disponible como dato medido; el tamano de los ficheros (0,25 GB en wfp16 y 0,50 GB en fp32 para el grafo, mas 0,39 GB de tabla de embeddings) es el unico dato de referencia ofrecido.
- Opciones de despliegue: LiteRT 2.2.0 (Google AI Edge), con aplicacion Android de ejemplo en `android/` (host Kotlin y UI Compose) y referencia de host en `laya_host.py`. El sample `zero_shot_classification` de litert-samples cubre el mismo caso. Soporte de vLLM, llama.cpp, Ollama o TGI: no disponible en la informacion proporcionada.
- Latencia: 51 ms por pregunta en la GPU del S26 a 256 tokens, 36 ms en NPU, 60 ms de extremo a extremo en la aplicacion de ejemplo. Throughput agregado: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura / variante | Contexto | Tiempo por pregunta (GPU S26, 256 tokens) | Tamano en dispositivo | Licencia |
|---|---|---|---|---|---|
| Laya-Multilingual-LiteRT | mmBERT-base multilingue | 256 / 512 tokens | 51 ms (36 ms en NPU) | 0,68 GB | apache-2.0 |
| Laya-English-LiteRT | ModernBERT-large, mas fine-tune `typed-decisions/` para cuatro flujos | 256 / 512 tokens (no detallado) | 123 ms (126 ms con el fine-tune) | 0,85 GB por checkpoint | no disponible |
| laya-LiteRT | Los mismos dos checkpoints en forma token-id, con tabla de embeddings dentro del grafo | 256 / 512 tokens (no detallado) | 54 ms multilingue / 127 ms ingles | 1,3 GB (multilingue) o 1,7 GB (ingles), pesos fp32 | no disponible |
| convaiinnovations/laya 0.3.4 | Checkpoint original, fp32 en CPU | no disponible | no disponible (referencia de comparacion en CPU) | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo generativo: solo responde preguntas definidas de antemano (eleccion multiple, escala ordinal, si/no). No produce texto libre, resumen ni codigo.
- Cobertura de validacion limitada: la verificacion se hizo sobre 201 filas en ingles y japones; el resto de los mas de 100 idiomas declarados por el publicador no se ha validado en este paquete.
- Validacion de hardware restringida: solo se probo en un Galaxy S26 (SM-S942Q) con Android 16 y LiteRT 2.2.0. Otras GPU y NPU Android no estan validadas y pueden dar resultados no finitos si el runtime no respeta las reescrituras de fp16.
- Sensibilidad a fp16: a partir de la capa 12 hay valores de hasta 1,4e4; las mascaras usan -1e4 porque -1e9 es -inf en fp16. Cualquier conversion propia debe mantener estas reescrituras de escalado y epsilon.
- Deriva numerica frente a la referencia: la NPU presenta una diferencia maxima de probabilidad de 0,0069 y la GPU de 0,0014 respecto a la implementacion fp32 en CPU; en decisiones con margenes muy estrechos entre opciones esto puede cambiar el argmax.
- Los grafos de 512 tokens solo se validaron en CPU de escritorio, no en movil.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero el modelo puede asignar con confianza alta una etiqueta incorrecta cuando la pregunta esta mal formulada; se recomienda usar las temperaturas de calibracion proporcionadas.
- Sesgos: no disponible; la informacion proporcionada no documenta evaluaciones de sesgo ni composicion del dataset de entrenamiento.
- Licencia Apache-2.0, sin restricciones de uso comercial indicadas, pero se desconoce la licencia de los paquetes hermanos y del checkpoint base mas alla de lo indicado.
- La busqueda web realizada no devolvio resultados relevantes sobre el modelo; los enlaces disponibles se limitan a los citados en la informacion de origen.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/litert-community/Laya-Multilingual-LiteRT
- Checkpoint base: https://huggingface.co/convaiinnovations/laya
- Paquete hermano en ingles: https://huggingface.co/litert-community/Laya-English-LiteRT
- Paquete hermano en forma token-id: https://huggingface.co/litert-community/laya-LiteRT
- Runtime LiteRT: https://github.com/google-ai-edge/litert
- Ejemplo de clasificacion zero-shot en litert-samples: https://github.com/google-ai-edge/litert-samples/tree/main/samples/litert/zero_shot_classification
- Recursos internos del repositorio: `android/` (aplicacion de ejemplo Kotlin y Compose), `laya_host.py` (host de referencia), `HOST_CONTRACT.md` (secuencia y decodificacion para un port), `fixtures/gate_rows_s256.json` (201 filas de validacion), `assets/demo.mp4`
