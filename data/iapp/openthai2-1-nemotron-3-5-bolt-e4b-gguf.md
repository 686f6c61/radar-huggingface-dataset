# iapp/OpenThai2.1-Nemotron-3.5-Bolt-E4B-GGUF

## Resumen

OpenThai 2.1 Bolt E4B GGUF es la distribucion cuantizada en formato GGUF del modelo OpenThai 2.1 Nemotron 3.5 Bolt E4B, desarrollado por iApp Technology (iapp) dentro de la familia OpenThai. El modelo esta pensado para ejecucion local con llama.cpp y actua como modelo de arranque de ChindaBot, el asistente del propio autor. Su proposito es ofrecer un modelo conversacional bilingue tailandes-ingles con capacidad de vision y tool calling que pueda correr en hardware de consumo.

El modelo base se construye sobre NVIDIA Nemotron 3.5 Bolt E4B, que a su vez es un post-entrenamiento de Google Gemma 4 E4B-it. La nomenclatura E4B hace referencia a la arquitectura de eficiencia de Gemma 4 con aproximadamente 4.000 millones de parametros efectivos, mientras que el checkpoint safetensors declara 7.463.013.674 parametros totales. El repositorio GGUF ocupa 28,5 GB e incluye tres ficheros: cuantizacion Q4_K_M (5,30 GB), Q8_0 (7,97 GB) y un proyector multimodal F16 (0,99 GB).

La relevancia actual del modelo reside en su enfoque en tailandes: la model card reporta evaluaciones especificas en ThaiExam, OpenThaiEval e IFEval-TH, ademas de pruebas de humo con tool calling y vision en tailandes. La licencia es OpenMDW-1.1, lo que condiciona el uso comercial y conviene revisar antes de desplegarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado de NVIDIA Nemotron 3.5 Bolt E4B, post-entrenado desde Google Gemma 4 E4B-it) |
| Parametros totales | 7.463.013.674 |
| Parametros activos | no disponible (la nomenclatura E4B sugiere parametros efectivos, pero no se detalla en la informacion disponible) |
| Longitud de contexto | 32.768 tokens (configuracion de ChindaBot con `--ctx-size 32768`); el ejemplo de llama.cpp usa 8.192 |
| Tipos de cuantizacion | Q4_K_M, Q8_0, F16 (proyector multimodal) |
| Idiomas soportados | tailandes (th), ingles (en) |
| Licencia | OpenMDW-1.1 (`license: other` en Hugging Face) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se detalla en la informacion disponible la arquitectura interna del modelo base mas alla de su linaje: NVIDIA Nemotron 3.5 Bolt E4B, post-entrenado por NVIDIA a partir de Google Gemma 4 E4B-it. El sufijo E4B y el tamano de checkpoint (7.463 millones de parametros totales) apuntan a un diseno de eficiencia de parametros, pero la model card no especifica si se trata de un transformer denso, un MoE o una arquitectura hibrida, ni el numero de parametros activos por token.

Tampoco se documentan en esta ficha el volumen de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO. La model card remite explicitamente al repositorio principal para datos de entrenamiento y limitaciones. Lo que si se documenta es el proceso de cuantizacion: los ficheros GGUF se generaron a partir del modelo BF16 y se validaron con llama.cpp build b12242, comparando resultados contra el modelo BF16 servido con vLLM v0.31.0. El modelo soporta modo de razonamiento (thinking) activable por peticion mediante `chat_template_kwargs.enable_thinking`, con la traza devuelta en el campo `reasoning_content`.

## Capacidades

- Generacion de texto conversacional en tailandes e ingles, con plantilla de chat propia aplicada via `--jinja`.
- Modo de razonamiento (thinking) opcional por peticion; por defecto desactivado con `--reasoning off`.
- Tool calling / function calling: la model card reporta seleccion correcta de herramienta y argumentos en tres pruebas (clima, calculadora, listado de festivos) con el resultado devuelto al modelo.
- Vision: el proyector multimodal `mmproj-OpenThai-2.1-Bolt-E4B-F16.gguf` permite procesar imagenes; se validaron dos casos (formas geometricas de colores y un recibo impreso en ingles consultado en tailandes).
- Audio: la model card menciona que el proyector cubre imagen "(and audio)", sin mas detalle sobre pruebas de audio.
- Razonamiento aritmetico basico con thinking activado (caso validado: cambio de 100 baht tras comprar 7 boligrafos a 12 baht, respuesta correcta de 16 baht).
- Redaccion de textos utilitarios en tailandes (correo de baja por enfermedad con marcadores de posicion).
- Capacidad de explicar conceptos con restricciones de longitud (explicacion de IA frente a machine learning en maximo 5 lineas).

## Casos de uso

- Asistencia conversacional en tailandes para atencion al cliente: el modelo mantiene conversaciones multi-turno con una ventana de hasta 32.768 tokens configurada en ChindaBot, suficiente para hilos largos con historial e instrucciones de sistema.
- Despliegue local en estaciones de trabajo sin GPU: las pruebas de humo se ejecutaron en CPU con 32 hilos y el fichero Q4_K_M respondio en 0,3 s a una pregunta corta y en 11,3 s a la generacion de un correo de 301 tokens, lo que lo hace viable en portatiles y equipos de oficina.
- Automatizacion con herramientas en flujos de negocio: integracion como backend de function calling para consultar APIs de clima, calculadoras o calendarios, devolviendo al usuario una respuesta en tailandes a partir del resultado de la herramienta.
- Procesamiento de documentos e imagenes en tailandes: uso del proyector multimodal para extraer totales y lineas de recibos o describir imagenes cuando la consulta se formula en tailandes.
- Generacion de contenido administrativo en tailandes: redaccion de correos, comunicaciones internas y resumenes con plantillas y marcadores de posicion, adecuado para pymes que operan en ese idioma.
- Evaluacion y prototipado de modelos tailandeses: al incluir resultados en ThaiExam, OpenThaiEval e IFEval-TH con y sin cuantizacion, sirve como linea base reproducible para comparar futuras variantes.
- Educacion y explicaciones acotadas: respuestas breves con limite de lineas para material didactico o soporte a estudiantes, como el caso validado de IA frente a machine learning en cinco lineas.

## Benchmarks y rendimiento

Resultados reportados en la model card con thinking desactivado y decodificacion greedy. Los ficheros GGUF se ejecutaron en llama.cpp b12242 (CPU) y el BF16 en vLLM v0.31.0, por lo que las diferencias incluyen el cambio de motor. Delta es la diferencia pareada respecto a BF16 y SE su error estandar.

| Benchmark | Q4_K_M | Q8_0 | BF16 |
|---|---|---|---|
| ThaiExam (565 preguntas) | 65,5 (Delta -1,96; SE 1,40) | 66,4 (Delta -1,08; SE 0,84) | 67,4 |
| OpenThaiEval (1.232) | 66,2 (Delta -1,62; SE 0,92) | 67,9 (Delta +0,08; SE 0,31) | 67,8 |
| IFEval-TH (215) | 78,6 (Delta -0,93; SE 0,93) | 80,0 (Delta +0,47; SE 0,81) | 79,5 |

Ninguna diferencia supera el doble de su error estandar. Q4_K_M queda por debajo de BF16 en las tres pruebas; Q8_0 se mantiene a menos de 1,1 puntos de BF16 en cada una. No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni comparaciones con modelos de terceros.

Pruebas de humo (llama.cpp b12242, `--jinja --reasoning off`, solo CPU, 32 hilos, greedy):

| Prueba | Resultado |
|---|---|
| Identificacion del modelo (Q4_K_M) | Se identifica como OpenThai 2.1 Bolt E4B del equipo OpenThai de iApp Technology con AIEAT; 73 tokens, 2,8 s |
| Capital de Japon (Q4_K_M) | "Tokio" en tailandes; 5 tokens, 0,3 s |
| Correo de baja por enfermedad (Q4_K_M) | Correo en tailandes con marcadores; 301 tokens, 11,3 s |
| IA frente a machine learning, max. 5 lineas (Q4_K_M) | Respuesta corta en tailandes; 82 tokens, 3,1 s |
| Cambio de 100 baht, thinking on (Q4_K_M) | 16 baht, correcto; traza en `reasoning_content`; 299 tokens, 11,6 s |
| Dos imagenes consultadas en tailandes (ChindaBot, Q4_K_M) | Correcto: tres formas y sus colores; total 215 y ambos articulos del recibo |
| Tres peticiones con herramientas (ChindaBot, Q4_K_M) | Herramienta y argumentos correctos en cada caso, respuesta en tailandes |
| Peticion de relato con herramientas ofrecidas (ChindaBot, Q4_K_M) | Respuesta directa sin llamada a herramienta |

## Requisitos de hardware

- VRAM estimada: Q4_K_M requiere aproximadamente 5,3 GB de pesos mas overhead de contexto; Q8_0 aproximadamente 8,0 GB; el proyector multimodal anade 0,99 GB cuando se usa vision o audio.
- GPU recomendadas: no especificadas en la informacion disponible. Por tamano, cualquier GPU consumer con 8 GB o mas puede alojar Q4_K_M; Q8_0 requiere 10-12 GB para operar con contexto amplio.
- Cabe en GPU consumer: si, con Q4_K_M en tarjetas de 8 GB o superiores y con Q8_0 en tarjetas de 12 GB o superiores (estimacion por tamano de fichero, no validada en la model card).
- Despliegue: llama.cpp (build b12242 probado), llama-server con `--jinja` obligatorio; el modelo base BF16 se sirvio con vLLM v0.31.0. No se mencionan Ollama ni TGI en la informacion disponible.
- Latencia y throughput: en CPU con 32 hilos y Q4_K_M, 5 tokens en 0,3 s (pregunta corta) y 301 tokens en 11,3 s (correo), lo que equivale a unos 26-27 tokens/s en generacion sostenida en ese entorno. No hay datos de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| OpenThai 2.1 Bolt E4B GGUF (este) | 7.463 M totales | 32.768 (config. ChindaBot) | th, en | OpenMDW-1.1 | GGUF |
| OpenThai 2.1 Nemotron 3.5 Bolt E4B (base) | 7.463 M totales | no disponible | th, en | OpenMDW-1.1 | safetensors |
| NVIDIA Nemotron 3.5 Bolt E4B | no disponible | no disponible | no disponible | OpenMDW-1.1 | no disponible |
| Google Gemma 4 E4B-it | no disponible (E4B) | no disponible | no disponible | Apache 2.0 | no disponible |

No se dispone en la informacion proporcionada de resultados de benchmarks de los modelos antecesores ni de alternativas de terceros con los que comparar rendimiento de forma directa.

## Limitaciones y advertencias

- Idiomas limitados a tailandes e ingles; no hay evidencia de calidad en castellano ni en otros idiomas.
- Riesgo de alucinacion no cuantificado: la model card no reporta tasas de factualidad ni pruebas de robustez frente a preguntas sin respuesta.
- Sesgos no documentados: no se detallan sesgos conocidos del modelo base ni del post-entrenamiento de NVIDIA.
- Licencia OpenMDW-1.1: no es una licencia permisiva tipo Apache o MIT; es imprescindible revisar los terminos en el enlace oficial antes de cualquier uso comercial.
- La model card esta marcada como borrador (DRAFT v0.3) y pendiente de revision, por lo que los datos pueden cambiar.
- Las comparaciones de cuantizacion mezclan motores de inferencia (llama.cpp frente a vLLM), de modo que las diferencias observadas no aislan el efecto de la cuantizacion.
- El modo thinking viene activado por defecto en llama-server con esta plantilla si no se pasa `--reasoning off`, lo que anade latencia y consumo de tokens en produccion.
- El soporte de audio se menciona de pasada y no cuenta con pruebas validadas en la model card.
- No se documentan limites de contexto nativos del modelo base; la cifra de 32.768 corresponde a la configuracion de ChindaBot, no a una especificacion confirmada del modelo.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/iapp/OpenThai2.1-Nemotron-3.5-Bolt-E4B-GGUF
- Modelo base en Hugging Face: https://huggingface.co/iapp/OpenThai2.1-Nemotron-3.5-Bolt-E4B
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Assets de la model card: https://huggingface.co/datasets/iapp/OpenThai2.0-model-card-assets
