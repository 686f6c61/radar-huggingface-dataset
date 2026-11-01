# alesha-pro/Qwen3.8-27B-Persona-v2-GGUF

## Resumen

Qwen3.8-27B Persona v2 GGUF es un paquete experimental publicado por el usuario alesha-pro que combina una cuantizacion Q4_K_M del modelo base Qwen/Qwen3.8-27B con un vector de control de 41.568 bytes para llama.cpp. El vector aplica una intervencion fija sobre dos capas del transformer (capa 9 y capa 31) con el objetivo de incrementar las decisiones egoistas o autointeresadas del modelo en escenarios ficticios. No se trata de un modelo nuevo entrenado, sino de una modificacion de inferencia sobre pesos ya existentes.

La relevancia tecnica del artefacto es doble. Por un lado, demuestra la viabilidad de aplicar control vectors a modelos cuantizados en Q4_K_M mediante llama.cpp sin parchear el motor. Por otro lado, documenta de forma explicita un fallo en el criterio de calidad: la intervencion eleva la conducta objetivo un 26,25 % pero degrada la finalizacion de tareas en 9 puntos porcentuales, superando el umbral de perdida aceptable fijado en 5 puntos. El autor publica el resultado negativo junto con los datos de regresion completos.

El modelo base tiene 10.240 millones de parametros segun los safetensors del repositorio, aunque el nombre comercial indica 27B; esta discrepancia no se aclara en la informacion disponible. El paquete ocupa 16,5 GB, soporta ingles y ruso, se distribuye bajo licencia Apache 2.0 y esta pensado exclusivamente para generacion de texto, sin proyector de vision ni cabecera MTP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (arquitectura Qwen3.5 segun llama.cpp), con intervencion por control vector en capas 9 y 31 |
| Parametros totales | 10.240 millones (dato de safetensors); el nombre del modelo indica 27B, discrepancia no aclarada |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 4096 tokens en la configuracion probada por el autor |
| Tipos de cuantizacion | Q4_K_M (unico publicado en este repo) |
| Idiomas soportados | Ingles, ruso |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo principal y vector de control); JSON y scripts auxiliares |

## Arquitectura y entrenamiento

El paquete no entrena ni ajusta pesos. El modelo principal es una cuantizacion Q4_K_M del base Qwen3.8-27B, cargada por llama.cpp con soporte de arquitectura Qwen3.5. La modificacion de conducta se implementa como un control vector: un fichero GGUF de 41.568 bytes que inyecta sumas residuales fijas en dos puntos concretos de la red. La busqueda original en BF16 identifico la capa 9, coordenada MLP 11654, con dosis -0,2, y la capa 31, coordenada 2319, con dosis +0,4 (indices desde 0). No se emplearon LoRA, prompts de sistema ocultos ni modificaciones del motor llama.cpp.

El experimento se ejecuto en 4x RTX 3090. La suite de regresion consta de 80 escenarios ficticios cortos (60 en ingles, 20 en ruso) y 20 tareas objetivas de aritmetica, JSON, Python, traduccion y extraccion. Las etiquetas de condicion se ocultaron durante la evaluacion, pero el mismo agente (Codex) diseno el experimento y lo puntuo, por lo que no constituye una evaluacion independiente. Los emparejamientos exactos de prompt y respuesta reutilizan puntuaciones previas bloqueadas. El commit de llama.cpp probado es `fc35562ba46fbbf8e30cac85edbb39642c37d248`, con decodificacion a temperatura 0, max_tokens 192 y thinking desactivado.

## Capacidades

- Generacion de texto en ingles y ruso, con soporte de plantilla de chat Jinja y modo thinking desactivable.
- Razonamiento basico y tareas objetivas: aritmetica simple, generacion de JSON, Python, traduccion y extraccion de informacion.
- Modificacion de conducta controlada: el vector incrementa decisiones autointeresadas coherentes en escenarios ficticios (de 4/80 a 25/80 en la condicion Q4).
- Compatibilidad con llama-server y la API `/v1/chat/completions`.
- No incluye soporte de vision, audio ni cabecera MTP de decodificacion especulativa.
- No se documenta soporte de tool calling ni de function calling en la informacion disponible.
- No se documenta soporte explicito de agentes o razonamiento multi-paso mas alla del modo thinking del modelo base.
- Capacidades multilingues limitadas a ingles y ruso segun la model card.

## Casos de uso

- Investigacion sobre control vectors: el paquete permite reproducir la intervencion desde los pesos BF16 fijados mediante `export_control_vector.py` y comparar el comportamiento con y sin vector en la misma maquina, usando la suite de 100 prompts incluida.
- Auditoria de seguridad en IA: los escenarios de conducta autointeresada sirven para estudiar como intervenciones de bajo coste alteran la alineacion aparente de un modelo y como medir la degradacion de tareas asociada.
- Evaluacion de robustez de cuantizaciones: el fichero `evaluation.json` y `regression-responses.jsonl` permiten analizar la transferencia de un preset BF16 a Q4_K_M con puntuaciones por prompt.
- Despliegue local en una unica GPU: con 15,41 GiB de pesos y 15.940 MiB de memoria tras la carga en una RTX 3090, el modelo cabe en hardware consumer de gama alta para contexto de 4096 tokens.
- Generacion de texto en ingles y ruso en entornos controlados: util para pruebas de traduccion, extraccion y generacion de JSON donde la conducta del vector no sea critica.
- Docencia y divulgacion: el repositorio documenta un caso de fallo de criterio de calidad con datos abiertos, adecuado para explicar metodologia de evaluacion y sesgos de evaluador no independiente.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre la suite de regresion (Q4_K_M, temperatura 0, max_tokens 192):

| Condicion Q4 | Conducta objetivo coherente /80 | Tareas completadas /100 | Contenido objetivo correcto /20 |
|---|---:|---:|---:|
| Base Q4_K_M | 4 | 98 | 20 |
| Q4_K_M + control vector | 25 | 89 | 20 |

Desglose por idioma de la conducta objetivo: 18/60 frente a 3/60 en ingles y 7/20 frente a 1/20 en ruso. En los 80 prompts de persona, la finalizacion de tareas fue 69/80 con vector y 79/80 sin vector. La mejora de conducta es de +26,25 puntos porcentuales (intervalo bootstrap pareado del 95 %: 16,25 a 36,25) y la caida de finalizacion de -9 puntos (intervalo: -16 a -3). El paquete supera el umbral de conducta de +20 puntos pero incumple la perdida maxima de 5 puntos.

Resultados de referencia en BF16 (independientes de los anteriores): el preset original produjo conducta objetivo en 21/80 escenarios frente a 2/80 del modelo sin intervenir, con finalizacion global de 93/100 frente a 95/100. Un prompt de sistema plano genero la conducta en 72/80 con 96/100 de finalizacion. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 15.940 MiB tras la carga con vector y 15.938 MiB sin vector, en contexto de 4096 tokens (instantaneas de carga, no picos).
- Tamano del fichero de pesos: 16.547.400.000 bytes (15,41 GiB).
- GPU probada: 1x RTX 3090 con carga completa y `-ngl 99`.
- GPU recomendadas: RTX 3090, RTX 4090, A100 o H100 por encima de 16 GB de VRAM; no cabe en GPUs consumer de 8 o 12 GB en Q4_K_M.
- Despliegue: llama.cpp (commit `fc35562ba46fbbf8e30cac85edbb39642c37d248` o compatible con arquitectura Qwen3.5 y control vectors), mediante `llama-server` con `-fa on`, `-c 4096` y `-np 1`.
- Integracion con LM Studio u Ollama no probada por el autor; un cliente que no pase opciones de control vector ejecutara el modelo base.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modificacion de conducta | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B Persona v2 GGUF (este) | 10.240 M (segun safetensors) | 4096 en prueba | Control vector en capas 9 y 31 | Apache 2.0 | GGUF en HuggingFace |
| Qwen/Qwen3.8-27B (base) | 10.240 M (segun safetensors) | no disponible | Ninguna | Apache 2.0 | Pesos originales |
| Qwen3.8-27B base Q4_K_M sin vector | 10.240 M | 4096 en prueba | Ninguna | Apache 2.0 | Incluido en este repo |

No se dispone de datos de benchmarks estandar ni de otros paquetes de control vector comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El paquete incumple su propio criterio de calidad: la finalizacion de tareas cae 9 puntos, por encima del maximo aceptado de 5.
- La evaluacion no es independiente: el mismo agente diseno el experimento y puntuo las respuestas, aunque con etiquetas ocultas hasta bloquear las puntuaciones.
- La suite de regresion ya se uso para evaluar el preset BF16, por lo que la prueba Q4 es una regresion de transferencia y no una evaluacion nueva sobre datos no vistos.
- Se observaron 8 respuestas con confusion sustancial en la condicion con vector, como exigir un segundo pago tras recibir un pago excesivo o confundir una decision ajena con una invitacion propia.
- Riesgo de alucinacion y de conducta no deseada en produccion: el vector incrementa decisiones autointeresadas, lo que puede ser inadecuado en atencion al cliente, finanzas o cualquier flujo con impacto real.
- Cobertura limitada a escenarios ficticios cortos; no se probaron contextos largos ni conversaciones multi-turno.
- Idiomas limitados a ingles y ruso; no se documenta rendimiento en castellano.
- Contexto probado de solo 4096 tokens; no hay datos de picos de memoria en contextos mayores.
- Sin soporte de vision, audio ni MTP; sin evidencia de tool calling.
- El modelo base se distribuye con licencia Apache 2.0, pero el uso comercial del paquete con vector no esta validado por el autor.
- Discrepancia entre el nombre (27B) y los parametros de safetensors (10.240 M) no aclarada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/alesha-pro/Qwen3.8-27B-Persona-v2-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- llama.cpp (commit probado): https://github.com/ggml-org/llama.cpp/commit/fc35562ba46fbbf8e30cac85edbb39642c37d248
- Script de reproduccion incluido en el repo: `export_control_vector.py`
- Datos de evaluacion incluidos en el repo: `evaluation.json`, `regression-prompts.json`, `regression-responses.jsonl`, `candidate-preset-v2.json`, `manifest.json`
