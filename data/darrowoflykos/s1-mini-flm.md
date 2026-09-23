# darrowoflykos/s1-mini-FLM

## Resumen

`s1-mini-FLM` es una conversión cuantizada del modelo `superwhisper/s1-mini` al formato Q4NX, empaquetada para el runtime FastFlowLM (FLM) y pensada para ejecutarse sobre las NPU AMD XDNA2 de la familia Ryzen AI. No se trata de un modelo nuevo ni de un ajuste adicional: es el mismo peso de 596 M de parámetros, derivado de `Qwen/Qwen3-0.6B`, recomprimido en un único fichero `model.q4nx` de 157,65 MB. El repositorio lo publica el usuario `darrowoflykos` y no declara licencia propia.

La tarea del modelo de origen es acotada y muy específica: normalizar transcripciones crudas de ASR (reconocimiento automático del habla) y devolver texto escrito limpio, con muletillas eliminadas, arranques falsos y autocorrecciones resueltas al valor final, puntuación y mayúsculas aplicadas, y números, fechas, horas, divisas y direcciones de correo renderizados en su forma escrita. Sobre un conjunto de validación de 7.519 casos en inglés alcanza un 94,8 % de exactitud por token.

Su relevancia es de nicho pero clara: permite post-procesar dictado en local sobre portátiles con NPU Ryzen AI, sin GPU dedicada ni conexión a servicios en la nube. A cambio, hereda las restricciones del original: sólo inglés, sin capacidad conversacional y con una ventana de entrada práctica de unos 1.000 tokens.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder causal denso (tipo `qwen3`), fine-tuned para una única tarea de transformación de texto |
| Parámetros totales | 596 M únicos (0,44 B sin embeddings; embeddings atados) |
| Parámetros activos | no aplica (arquitectura densa, no MoE) |
| Longitud de contexto | no disponible en la información proporcionada; la model card de origen recomienda entradas de hasta ~1.000 tokens y trocear transcripciones más largas |
| Tipos de cuantización | Contenedor Q4NX con mezcla de Q8_0 / Q4_1 / BF16; el modelo de origen se distribuye en BF16 y existe una build GGUF cuantizada de 462 MiB |
| Idiomas soportados | inglés únicamente (release v1) |
| Licencia | no disponible para este repositorio; el modelo de origen usa Apache 2.0 con cláusula de nombres y el metadato de licencia upstream figura como `other` |
| Formato de pesos | `model.q4nx` (contenedor propietario de FastFlowLM, no GGUF); el origen en safetensors y GGUF |
| Capas | 28 |
| Cabezas de atención | 16 para Q, 8 para KV (GQA) |
| Precisión de origen | BF16 |
| Modalidad | lenguaje (texto a texto; no procesa audio) |
| Tamaño del repositorio | 0,2 GB (fichero de pesos: 157,65 MB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de `Qwen/Qwen3-0.6B`: un decoder transformer causal denso de 28 capas, con atención por grupos (GQA) de 16 cabezas de consulta y 8 de clave/valor, y embeddings de entrada y salida atados. El modelo se distribuye en BF16 y se etiqueta con el paper `arxiv:2505.09388`, correspondiente al informe técnico de la familia Qwen3. Sobre esa base, Superwhisper realizó un fine-tuning orientado a una sola transformación, no a conversación general, de modo que el modelo no sigue instrucciones arbitrarias y se controla mediante una línea de control al principio de la entrada.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron etapas de RLHF o DPO. El repositorio `darrowoflykos/s1-mini-FLM` documenta únicamente el proceso de conversión: cuantización a Q4NX y compilación para el runtime FastFlowLM, con los ficheros `config.json`, `tokenizer.json`, `tokenizer_config.json` y `chat_template.jinja` adaptados al runtime. No se detalla la receta exacta de cuantización por capa ni si hubo calibración.

## Capacidades

- Normalización de transcripciones ASR: eliminación de muletillas y ruido verbal, resolución de arranques falsos y autocorrecciones al valor final elegido por el hablante.
- Aplicación de puntuación, mayúsculas y separación en frases sobre texto que llega en minúsculas y sin puntuar.
- Renderizado en forma escrita de números, fechas, horas, divisas y direcciones de correo electrónico dictadas.
- Control de estilo y estructura mediante línea de control: bajo `Structure: lists` puede emitir viñetas Markdown y bajo `Context: email` puede introducir líneas en blanco entre saludo, cuerpo y despedida.
- Manejo de entradas sin contenido útil: cuando la entrada es sólo ruido o muletillas, la salida correcta es una cadena vacía.
- Salida en texto plano sin preámbulo, sin explicaciones y sin formato adicional no solicitado.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso; no es un modelo de chat.
- No dispone de modo de razonamiento explícito, ni de capacidades de visión o audio (consume texto ya transcrito).
- Capacidad multilingüe: no disponible; la release v1 cubre exclusivamente inglés.

## Casos de uso

- Post-procesado en aplicaciones de dictado: el modelo recibe la transcripción bruta del motor ASR y devuelve texto listo para insertar en un editor, resolviendo puntuación y autocorrecciones sin intervención del usuario. Es su caso de uso canónico y para el que fue entrenado.
- Limpieza de transcripciones de reuniones: tras ejecutar un motor tipo Whisper sobre el audio, se trocea la salida en fragmentos de hasta ~1.000 tokens y se pasa cada uno por s1-mini para obtener actas legibles, con números y horas ya normalizados.
- Redacción de correos por voz: usando la línea de control `Context: email`, el modelo estructura el dictado en saludo, cuerpo y despedida, lo que permite integrarlo en clientes de correo que ofrezcan dictado offline.
- Notas y listas rápidas: con `Structure: lists`, el dictado se convierte en viñetas Markdown, útil para aplicaciones de toma de notas o gestores de tareas que acepten listas.
- Documentación clínica, legal o de campo con requisito de confidencialidad: al ejecutarse sobre la NPU de un portátil Ryzen AI y sin llamadas a red, los datos del paciente o del cliente no salen del dispositivo.
- Accesibilidad: dictado asistido para personas con movilidad reducida o dificultades de escritura, donde la supresión de muletillas y la puntuación automática reducen la carga de edición posterior.
- Limpieza de corpus para entrenamiento de ASR: normalización por lotes de transcripciones humanas o automáticas para reducir ruido y estandarizar formatos numéricos antes de reentrenar un modelo acústico.
- Subtitulado y accesibilidad audiovisual: post-proceso de subtítulos automáticos para eliminar repeticiones y falsos arranques antes de la publicación, siempre en inglés y con troceado previo.

## Benchmarks y rendimiento

Los únicos datos publicados corresponden al modelo de origen `superwhisper/s1-mini`, no a esta conversión Q4NX.

| Benchmark | Resultado | Contexto |
|---|---|---|
| Exactitud por token (conjunto retenido en inglés) | 94,8 % | 7.519 casos de evaluación |
| MMLU, HumanEval, GSM8K u otros | no disponible | no aplica: el modelo no es de propósito general |
| Rendimiento de la conversión Q4NX | no disponible | no se publican métricas de degradación por cuantización |

## Requisitos de hardware

- El modelo no está pensado para GPU: la conversión Q4NX está compilada para el runtime FastFlowLM sobre NPU AMD XDNA2.
- Hardware compatible según FastFlowLM: chips de la serie Ryzen AI con NPU XDNA2, concretamente Strix, Strix Halo, Kraken y Gorgon Point.
- Huella de memoria: el fichero de pesos ocupa 157,65 MB, por lo que la memoria dedicada necesaria es mínima y el cuello de botella no es la capacidad sino la disponibilidad de la NPU.
- VRAM estimada: no aplica; no se documenta ruta CUDA ni ejecución en GPU dedicada (A100, H100, RTX 4090 no están soportadas por este artefacto).
- Ejecución en GPU de consumo: no soportada por esta conversión. Para CPU o GPU convencionales habría que usar el modelo de origen en safetensors o sus builds GGUF (462 MiB cuantizados, ejecutables en CPU de portátil).
- Opciones de despliegue: `flm run out` para ejecución local y `flm serve out` para exponer un endpoint compatible con la API de OpenAI dentro de FastFlowLM. Con el modelo de origen, `transformers>=4.51.0` y también llama.cpp, Ollama o LM Studio a través de GGUF.
- Latencia y throughput: no disponible. FastFlowLM anuncia ventanas de contexto de hasta 256k y streaming de tokens en su runtime, pero no se especifica ningún dato de rendimiento para esta conversión concreta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `darrowoflykos/s1-mini-FLM` (este) | 596 M | no disponible; uso práctico ~1.000 tokens | Q4NX (157,65 MB) | no disponible | AMD Ryzen AI XDNA2 vía FastFlowLM |
| `superwhisper/s1-mini` (origen) | 596 M | no disponible; uso práctico ~1.000 tokens | safetensors (BF16) | Apache 2.0 + cláusula de nombres | `transformers>=4.51.0`, 6.305 descargas |
| `superwhisper/s1-mini-GGUF` | 596 M | no disponible | GGUF (~462 MiB cuantizado) | Apache 2.0 + cláusula de nombres | llama.cpp, Ollama, LM Studio, CPU de portátil |
| `Qwen/Qwen3-0.6B` (base) | ~0.6 B (reporta 0,8 B en el Hub por el doble conteo de embeddings) | no disponible en la información proporcionada | safetensors | Apache 2.0 | Modelo generalista; no realiza normalización de ASR |

## Limitaciones y advertencias

- Idioma: sólo inglés. Las entradas en castellano o cualquier otro idioma quedan fuera del alcance declarado de la release v1.
- No es un modelo de chat ni sigue instrucciones generales; espera un prompt de sistema concreto, una línea de control, un salto de línea y una única transcripción cruda. Usarlo fuera de ese formato degrada la salida.
- Riesgo de alucinación: al reescribir, el modelo puede resolver una autocorrección hacia un valor distinto del que pronunció el hablante, o alterar cifras y direcciones de correo. En dominios sensibles conviene revisión humana.
- Límite práctico de entrada de ~1.000 tokens; las transcripciones largas deben trocearse, lo que puede romper la coherencia entre fragmentos (por ejemplo, una frase partida o una autocorrección que cruza el corte).
- Restricciones de licencia: este repositorio no declara licencia, lo que impide asumir derechos de uso comercial sobre esta conversión concreta. El modelo de origen es Apache 2.0 con una cláusula adicional de nombres, y la model card advierte de que hay que revisar la licencia antes de integrarlo en una aplicación de dictado propia.
- Dependencia de hardware y software muy específicos: sólo funciona dentro de FastFlowLM sobre NPU XDNA2. No hay ruta documentada a GPU ni a otros runtimes para este artefacto.
- Conversión no oficial: no la publica Superwhisper, sino un tercero. El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación de la comunidad.
- Degradación por cuantización: el paso a Q4NX (mezcla Q8_0 / Q4_1 / BF16) puede reducir la exactitud respecto al 94,8 % del modelo en BF16, pero no se han publicado mediciones de esa pérdida.
- La información de entrada está truncada: la model card visible corta el prompt de sistema recomendado, de modo que el texto exacto debe tomarse del repositorio original antes de desplegar.
- Sin métricas de latencia ni throughput publicadas para esta conversión.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/darrowoflykos/s1-mini-FLM
- Perfil del autor: https://huggingface.co/darrowoflykos
- Modelo de origen: https://huggingface.co/superwhisper/s1-mini
- Builds GGUF del original: https://huggingface.co/superwhisper/s1-mini-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Sitio de Superwhisper: https://superwhisper.com
- FastFlowLM (repositorio): https://github.com/ROCm/FastFlowLM
- FastFlowLM (espejo/recursos): https://github.com/iosub/IA-TOOLS-FastFlowLM
- FastFlowLM (web): https://fastflowlm.com/
- Catálogo de modelos de FastFlowLM: https://fastflowlm.com/models/
- Paper referenciado en las etiquetas: https://arxiv.org/abs/2505.09388
