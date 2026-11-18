# JonusNattapong/LFM3-Omni-2B-abliterated-GGUF

## Resumen

LFM3-Omni-2B-abliterated-GGUF es la suite de cuantizaciones GGUF del modelo JonusNattapong/LFM3-Omni-2B-abliterated, una variante "abliterated" (con los vectores de rechazo eliminados) del modelo omnimodal Liquid LFM3-Omni de 2B parametros. El modelo base emplea una arquitectura hibrida que combina capas convolucionales y de atencion, y esta disenado para procesar y generar de forma nativa texto, vision y audio (pipeline any-to-any), incluyendo speech-to-speech.

La version destacada en el repositorio es la v10 "Panu", un asistente orientado al tailandes con soporte de multiples dialectos (Kam Mueang del norte, Isan, Pak Tai del sur, Korat, Patani Malay/Yawi), memoria a largo plazo, modo de razonamiento profundo mediante etiquetas `<think>` y soporte de barge-in en voz full-duplex. El modelo ha sido ajustado sobre 10.000 conversaciones multi-dialecto y herramientas de agente para sistema operativo.

La relevancia de esta ficha radica en que ofrece un modelo omnimodal de apenas 1.730 millones de parametros cuantizado en GGUF, ejecutable en hardware de consumo (desde ~1,5 GB de VRAM en Q4_K_M) mediante llama.cpp u Ollama, con capacidades de vision y audio a traves de un proyector multimodal separado. La licencia es LFM 1.0 (marcada como "other" en Hugging Face), lo que condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido (convolucion + atencion), omnimodal (texto, vision, audio) |
| Parametros totales | 1.728.801.600 (~1,73 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el ejemplo de servidor usa `--ctx-size 8192` |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M (v10); Q8_0 y Q4_K_M (v6 baseline); proyector multimodal mmproj en Q4_K_M |
| Idiomas soportados | en, th (declarados en Hugging Face); la model card anade zh, ja, ms y dialectos tailandeses |
| Licencia | LFM 1.0 (license: other, license_name: lfm1.0) |
| Formato de pesos | GGUF (para llama.cpp y Ollama) |

## Arquitectura y entrenamiento

El modelo base es un transformer hibrido que combina capas convolucionales con capas de atencion, disenado por Liquid para ser omnimodal: procesa texto, imagenes y audio de entrada y puede generar texto y voz (speech-to-speech). La variante "abliterated" elimina los vectores de direccion de rechazo del modelo original, lo que produce un comportamiento sin censura ("100% uncensored" segun el autor). El repositorio incluye un proyector multimodal independiente (`mmproj-LFM3-Omni-2B-Q4_K_M.gguf`, ~278 MB) necesario para la inferencia de vision y audio en llama.cpp.

Segun la model card, la version v10 "Panu" se entreno sobre 10.000 conversaciones multi-dialecto que cubren dialectos tailandeses del norte, Isan, sur, Korat y Patani Malay (Yawi), ademas de razonamiento profundo al estilo "Deep Thai R1" y herramientas de agente para sistema operativo. No se especifica en la informacion disponible el numero total de tokens de entrenamiento del modelo base original ni la composicion completa del dataset, ni si se emplearon tecnicas de RLHF o DPO mas alla del ajuste mencionado.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno.
- Razonamiento profundo con modo "thinking" mediante etiquetas `<think>`.
- Comprension de vision (imagenes) a traves del proyector multimodal.
- Comprension y generacion de audio, incluido speech-to-speech.
- Soporte de barge-in en voz full-duplex (interrupcion durante la conversacion).
- Memoria a largo plazo en la version v10 "Panu".
- Soporte de herramientas de agente para sistema operativo (OS Agent Tools).
- Capacidades multilingues: ingles, tailandes, chino, japones y malayo, con enfasis en dialectos tailandeses.
- Comportamiento sin censura (abliterated), sin rechazos por alineamiento.
- Despliegue compatible con llama.cpp, llama-server (API compatible con OpenAI) y Ollama.

## Casos de uso

- Asistencia conversacional en tailandes con dialectos regionales: el modelo v10 "Panu" puede atender a usuarios que hablan Kam Mueang, Isan, Pak Tai, Korat o Yawi, un nicho que los modelos generalistas no cubren; resulta adecuado por su ajuste especifico sobre 10.000 conversaciones multi-dialecto.
- Atencion al cliente por voz: gracias a las capacidades speech-to-speech y al soporte de barge-in full-duplex, puede gestionar conversaciones telefonicas donde el usuario interrumpe, desplegado con `llama-server` y el proyector multimodal.
- Asistente local en dispositivos de borde: con Q4_K_M (~1,09 GB de pesos, ~1,5 GB de VRAM/RAM) cabe en portatiles, moviles o mini-PC sin GPU dedicada, lo que permite asistentes de texto y voz totalmente offline.
- Descripcion de imagenes y accesibilidad: usando el proyector mmproj, puede describir imagenes o leer documentos escaneados en ingles y tailandes para aplicaciones de accesibilidad o digitalizacion.
- Agente de automatizacion de escritorio: las OS Agent Tools del ajuste v10 permiten construir agentes que ejecutan acciones multi-paso en el sistema operativo mediante tool calling.
- Prototipado de investigacion sobre alineamiento: al ser una variante abliterated, sirve para estudiar el efecto de la eliminacion de vectores de rechazo en modelos pequenos, comparando su comportamiento con el modelo base original.
- Razonamiento con traza explicita: el modo `<think>` permite obtener cadenas de razonamiento visibles para depuracion en tareas de matematicas o logica sencilla en un modelo de 2B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica que la cuantizacion Q8_0 alcanza un "99,9% de paridad con FP16" en calidad, sin cifras de MMLU, HumanEval, GSM8K ni otras evaluaciones.

## Requisitos de hardware

- VRAM/RAM estimada (segun la tabla del autor): Q8_0 ~2,6 GB; Q6_K ~2,0 GB; Q5_K_M ~1,8 GB; Q4_K_M ~1,5 GB. El proyector multimodal anade ~278 MB.
- Cabe en GPU de consumo: cualquier GPU con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.) puede ejecutar las cuantizaciones Q4_K_M y Q6_K con margen; tambien funciona en CPU.
- GPU profesionales (A100, H100) no son necesarias; el modelo esta pensado para hardware modesto.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server` con API compatible con OpenAI y flag `--jinja`), Ollama y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-Omni-2B-abliterated (este) | ~1,73 B | no disponible (ejemplo con 8192) | Texto, vision, audio | LFM 1.0 | GGUF en Hugging Face |
| Modelo base original Liquid LFM3-Omni-2B | ~1,73 B (estimado) | no disponible | Texto, vision, audio | LFM 1.0 | Pesos originales de Liquid |
| Alternativas de ~2B texto-only (p. ej. Qwen2.5-1.5B, Gemma-2-2B) | 1,5-2 B | 32K-128K (segun modelo) | Solo texto | Apache 2.0 / Gemma | Multiples formatos |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada; la comparativa se limita a parametros, modalidades y licencia.

## Limitaciones y advertencias

- Al ser una variante abliterated, el modelo carece de mecanismos de rechazo: puede generar contenido danino, ofensivo o inseguro sin filtros, lo que exige moderacion externa en produccion.
- Riesgo elevado de alucinacion por su tamano reducido (1,73 B) y por el ajuste especifico a dialectos tailandeses.
- La model card declara idiomas zh, ja y ms, pero Hugging Face solo lista en y th; la cobertura real de esos idiomas no esta verificada.
- La licencia LFM 1.0 ("other") impone condiciones especificas; es necesario revisar el archivo LICENSE antes de cualquier uso comercial.
- El rendimiento multimodal depende del proyector mmproj y de la version de llama.cpp; sin el, el modelo solo procesa texto.
- La calidad de las cuantizaciones Q4_K_M y Q5_K_M puede degradar el razonamiento y la fidelidad en dialectos respecto a Q8_0.
- No hay benchmarks publicados que respalden las afirmaciones de calidad del autor.
- El repositorio ocupa 38 GB por acumular multiples versiones (v6 y v10); conviene descargar solo el archivo GGUF necesario.

## Enlaces

- Repositorio GGUF: https://huggingface.co/JonusNattapong/LFM3-Omni-2B-abliterated-GGUF
- Modelo base abliterated: https://huggingface.co/JonusNattapong/LFM3-Omni-2B-abliterated
- Licencia LFM 1.0: https://huggingface.co/JonusNattapong/LFM3-Omni-2B-abliterated-GGUF/blob/main/LICENSE
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
