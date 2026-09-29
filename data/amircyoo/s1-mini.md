# Amircyoo/s1-mini

## Resumen

S1-mini es un modelo de lenguaje causal de 0,6B parámetros especializado en una única tarea: normalizar la salida de sistemas de reconocimiento automático del habla (ASR). Recibe una transcripción en bruto, habitualmente en minúsculas y sin puntuación, y la reescribe como texto escrito limpio: elimina muletillas, resuelve falsos comienzos y autocorrecciones hasta el valor con el que el hablante se quedó, aplica puntuación y mayúsculas, y convierte números, fechas, horas, importes y direcciones de correo hablados a su forma escrita. Lo desarrolla Superwhisper (superwhisper.com) y esta ficha corresponde a la copia publicada por el usuario Amircyoo en HuggingFace.

El modelo deriva de Qwen/Qwen3-0.6B mediante fine-tuning y comparte su arquitectura transformer decoder-only, con 28 capas, atención GQA (16 cabezas de consulta y 8 de clave/valor) y embeddings atados. Se gobierna mediante una línea de control al inicio de la entrada y devuelve únicamente el texto normalizado, sin preámbulo ni explicación. Sobre un conjunto reservado de 7.519 casos en inglés alcanza un 94,8% de precisión a nivel de token, y su build cuantizada ocupa 462 MiB, lo que permite ejecutarlo en la CPU de un portátil.

Su relevancia actual está en cubrir una etapa del pipeline de voz que los motores ASR generales no resuelven bien (puntuación, truecasing y normalización inversa de texto) con un coste computacional mínimo y una ventana de entrada corta. No es un modelo conversacional: no sigue instrucciones generales, no admite tool calling y solo cubre inglés en la versión v1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (Qwen3), 28 capas, GQA con 16 cabezas Q y 8 KV, embeddings atados |
| Parametros totales | 596,0M parámetros únicos (0,44B no pertenecientes al embedding); 751.632.384 elementos de tensor almacenados, porque `lm_head.weight` se materializa como copia del embedding de entrada |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la información proporcionada; el autor recomienda entradas de hasta ~1.000 tokens y trocear las transcripciones más largas |
| Tipos de cuantizacion | BF16 nativo en safetensors; el autor publica builds GGUF aparte con una versión cuantizada de 462 MiB (niveles concretos de cuantización no disponibles) |
| Idiomas soportados | inglés (en) |
| Licencia | `s1-mini-license` según los metadatos de HuggingFace (`license: other`); la model card indica Apache 2.0 con cláusula de nombrado (consultar el fichero LICENSE) |
| Formato de pesos | safetensors (compatible con transformers); builds GGUF en el repositorio superwhisper/s1-mini-GGUF |

## Arquitectura y entrenamiento

S1-mini es un ajuste fino de Qwen/Qwen3-0.6B, un transformer causal decoder-only con 28 capas, 16 cabezas de consulta y 8 de clave/valor (GQA) y embeddings atados. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO: esa información no está disponible. Lo que sí se documenta es el formato de entrenamiento: un system prompt fijo, una línea de control con tres ajustes (`Styling`, `Structure`, `Context`) y una transcripción ASR en bruto, con el texto normalizado como única salida. El modelo se distribuye en BF16.

El repositorio declara `tie_word_embeddings` en `config.json`, pero `model.safetensors` almacena `lm_head.weight` como copia materializada del embedding de entrada. De ahí que el Hub informe 0,8B parámetros (751,6M elementos de tensor) frente a los 596,0M parámetros únicos: es una herencia del layout de Qwen3-0.6B, que reporta 0,8B en el Hub por el mismo motivo. Para la inferencia es obligatorio desactivar el modo thinking (`enable_thinking=False`) y usar exactamente el system prompt de la model card.

## Capacidades

- Normalización de transcripciones ASR a texto escrito, con eliminación de muletillas y vacilaciones.
- Resolución de falsos comienzos y autocorrecciones: el modelo se queda con el valor final al que llegó el hablante.
- Puntuación y truecasing sobre texto que llega en minúsculas y sin signos.
- Normalización inversa de texto (ITN): números, fechas, horas, moneda y direcciones de correo habladas pasan a su forma escrita.
- Control explícito de estilo, estructura y contexto mediante una línea de control al inicio de la entrada (`[Styling: ...] [Structure: ...] [Context: ...]`).
- Con `Structure: lists` puede devolver viñetas Markdown.
- Con `Context: email` puede separar saludo, cuerpo y despedida con líneas en blanco.
- Devuelve cadena vacía cuando la entrada es solo ruido o muletillas, que es la salida correcta en ese caso.
- Idiomas: únicamente inglés.
- No soporta tool calling ni function calling (no documentado).
- No es un modelo de chat ni de razonamiento general: no sigue instrucciones fuera de la tarea de normalización.
- No dispone de visión, audio ni modo thinking; de hecho, `enable_thinking=False` es obligatorio.

## Casos de uso

- Post-procesado de dictado en aplicaciones de voz: la app captura audio, un motor ASR produce la transcripción bruta y S1-mini la convierte en texto publicable; con un modelo de 0,6B y una build cuantizada de 462 MiB puede ejecutarse en local, en la CPU del propio dispositivo.
- Transcripción de reuniones: cada intervención se normaliza antes de guardarla en el acta, de modo que el resultado incluya puntuación y cifras correctas (fechas de entrega, importes, horas) sin revisión manual línea a línea.
- Subtitulado y post-producción audiovisual: para subtítulos en inglés, la cadena ASR más S1-mini reduce los errores de formato típicos (minúsculas, ausencia de signos, números mal escritos) antes de la fase de segmentación y sincronización.
- Conversión de notas de voz a listas estructuradas: con `Structure: lists`, una nota dictada con enumeraciones se devuelve como viñetas Markdown, lista para pegar en un gestor de tareas o en una nota.
- Redacción de correos dictados: con `Context: email`, el modelo genera el cuerpo con saludo, párrafos y despedida separados, y con `Styling: formal` ajusta el registro del texto.
- Normalización dentro de un pipeline ASR propio: se puede encadenar cualquier motor (por ejemplo, Whisper) con S1-mini como etapa de limpieza, ya que la interfaz es texto de entrada y texto de salida y no requiere audio.
- Análisis de llamadas de atención al cliente: normalizar las transcripciones antes de indexarlas o clasificarlas mejora la calidad de las búsquedas y de los modelos posteriores, porque elimina muletillas y unifica el formato de las cifras.
- Accesibilidad: conversión de voz a texto limpio para personas que dictan en lugar de escribir, con salida apta para su publicación directa.

## Benchmarks y rendimiento

| Metrica | Resultado | Conjunto de evaluacion |
|---|---|---|
| Precisión a nivel de token | 94,8% | 7.519 casos reservados en inglés |

No se han publicado otros resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni comparativas numéricas con modelos similares.

## Requisitos de hardware

- Pesos en BF16: aproximadamente 1,5 GB en disco (751,6M elementos × 2 bytes), coherente con el tamaño de repositorio de 1,5 GB.
- VRAM estimada para inferencia en BF16: alrededor de 2 GB contando overhead de activaciones y caché KV para entradas cortas (estimación a partir del tamaño de los pesos).
- Build cuantizada: 462 MiB; el autor indica que se ejecuta con holgura en la CPU de un portátil.
- Cabe en GPU de consumo: sí, en cualquier GPU con 2 GB o más de memoria (por ejemplo, GTX 1050 Ti, RTX 3050 o superiores). También funciona sin GPU.
- GPU recomendadas para despliegue en servidor: no requiere GPU dedicada; en producción con batching, cualquier GPU con memoria suficiente para un modelo de 0,6B (A100, H100 o RTX 4090 quedan muy por encima de lo necesario).
- Opciones de despliegue: transformers >= 4.51.0, llama.cpp, Ollama, LM Studio y TGI (los tags del repositorio incluyen `text-generation-inference` y `endpoints_compatible`). Para despliegues basados en llama.cpp hay que usar las builds GGUF publicadas aparte.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Amircyoo/s1-mini (este repositorio) | 596,0M únicos (751,6M elementos almacenados) | no disponible; recomendado hasta ~1.000 tokens | Normalización de transcripciones ASR en inglés | s1-mini-license / Apache 2.0 con cláusula de nombrado según la model card | Copia del repositorio original; 0 descargas |
| superwhisper/s1-mini (original) | 596,0M únicos | no disponible; recomendado hasta ~1.000 tokens | Normalización de transcripciones ASR en inglés | Apache 2.0 + cláusula de nombrado | Repositorio oficial, con builds GGUF y etiquetas de versión (v1) |
| Qwen/Qwen3-0.6B (modelo base) | 0,6B | no disponible en la información proporcionada | Modelo de lenguaje general y conversacional, multilingüe | Apache 2.0 | Repositorio oficial de Qwen |

No se dispone en la información proporcionada de comparativas numéricas con normalizadores ASR dedicados ni con modelos generalistas usados para la misma tarea. Las diferencias entre las tres filas se limitan a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Solo cubre inglés: no procesa otros idiomas en la versión v1.
- No es un modelo de chat y no sigue instrucciones generales; cualquier petición ajena a la normalización de transcripciones queda fuera de su comportamiento esperado.
- Requiere un system prompt exacto y una línea de control al inicio de la entrada; un formato distinto puede degradar la salida.
- `enable_thinking=False` es obligatorio; con el modo thinking activo el comportamiento no está garantizado.
- Riesgo de alucinación: al resolver autocorrecciones y frases inacabadas, el modelo puede alterar contenido (nombres propios, cifras o términos) al inferir la intención del hablante. Conviene validar en dominios sensibles.
- Entradas de más de ~1.000 tokens deben trocearse; no se documenta la ventana de contexto efectiva del ajuste.
- Licencia: los metadatos de HuggingFace marcan `s1-mini-license` (`license: other`) mientras la model card describe Apache 2.0 con cláusula de nombrado. Hay que revisar el fichero LICENSE antes de cualquier uso comercial; el propio autor recomienda comprobar la licencia antes de integrarlo en una aplicación de dictado.
- Este repositorio (Amircyoo/s1-mini) es una copia no oficial, con 0 descargas y 0 likes en el momento de la consulta; el repositorio de referencia es superwhisper/s1-mini.
- Sesgos conocidos: no documentados en la información proporcionada.
- Dependencia técnica: Qwen3 requiere transformers 4.51.0 o superior; con versiones anteriores se obtiene `KeyError: 'qwen3'`.

## Enlaces

- Repositorio de esta copia: https://huggingface.co/Amircyoo/s1-mini
- Repositorio original: https://huggingface.co/superwhisper/s1-mini
- Builds GGUF: https://huggingface.co/superwhisper/s1-mini-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Licencia: https://huggingface.co/superwhisper/s1-mini/blob/main/LICENSE
- Sitio web de Superwhisper: https://superwhisper.com
- Discord de Superwhisper: https://discord.gg/tF98XvJNvB
- Informe técnico de Qwen3: https://arxiv.org/abs/2505.09388
