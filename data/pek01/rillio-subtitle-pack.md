# pek01/rillio-subtitle-pack

## Resumen

Rillio subtitle pack es un repositorio de pesos GGUF publicado por el usuario pek01 que empaqueta los dos modelos que alimentan el sistema de subtitulos automaticos de la aplicacion Rillio. No se trata de un modelo entrenado desde cero, sino de un pack de cuantizaciones: un decodificador de reconocimiento de voz derivado de Qwen3-ASR-1.7B y un traductor derivado de Qwen3.5-9B, ambos convertidos a GGUF para su ejecucion con llama.cpp y su servido mediante `llama-server`.

El interes del repositorio es la receta de cuantizacion. El decodificador del reconocedor se comprime de Q8_0 (2,17 GB) a IQ3_M (1,03 GB) con una importance matrix calculada sobre 400 lineas de subtitulos en japones, sin perdida medible segun el autor. El traductor baja de Q8_0 a una mezcla IQ2_M de 3,32 GB con tipos de tensor ajustados por familia (q2_k para las proyecciones de atencion, q5_k para la salida), situandose segun el autor al nivel de Q4_K_M (5,7 GB) en la tarea de subtitulado.

Con licencia Apache 2.0 heredada de sus fuentes, cero descargas y cero likes en el momento de la consulta, es un artefacto de nicho orientado a despliegues de subtitulado japones-ingles en hardware modesto. La model card no publica cifras absolutas de rendimiento ni una lista formal de idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos componentes: decodificador de reconocimiento de voz (Qwen3-ASR-1.7B) mas codificador de audio externo; y traductor Qwen3.5-9B, cuya model card menciona proyecciones de salida de espacio de estados (state-space), lo que apunta a una arquitectura hibrida. El detalle completo no esta disponible |
| Parametros totales | 2.031.739.904 (dato declarado en los metadatos del repo); el pack contiene un decodificador de ~1,7 B y un traductor de ~9 B |
| Parametros activos | no aplica (no se describe como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ3_M con imatrix (reconocedor), IQ2_M con mezcla por tipo de tensor (traductor), origen Q8_0 en ambos; codificador de audio en Q8_0 (mmproj) |
| Idiomas soportados | no disponible en la model card; la calibracion se hizo con subtitulos en japones y pares japones-ingles |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El repositorio no entrena ningun modelo: aplica `llama-quantize` (build de llama.cpp con CUDA) sobre dos checkpoints Q8_0 de terceros. Para el reconocedor parte de `ggml-org/Qwen3-ASR-1.7B-GGUF` y usa `--allow-requantize` con la mezcla IQ3_M estandar, acompanada de una importance matrix construida sobre 400 lineas de subtitulos japoneses de OPUS OpenSubtitles (par en-ja) escritas con el formato que emite el decodificador (`language Japanese<asr_text>...`). El codificador de audio no se replica en el repo: se enlaza el `mmproj-Qwen3-ASR-1.7B-Q8_0.gguf` upstream.

Para el traductor parte de `unsloth/Qwen3.5-9B-GGUF` (Q8_0) y aplica una receta sensible al tipo de tensor: base IQ2_M con `attn_q` y `attn_qkv` en q2_k, embeddings de token en q2_k y tensor de salida en q5_k, mas una imatrix calculada sobre 300 intercambios bilingues ja-en de OPUS OpenSubtitles. El autor justifica el reparto indicando que la cabeza de salida y las proyecciones de salida de espacio de estados son las partes fragiles, mientras que las proyecciones de atencion toleran 2 bits. No se documentan en esta ficha los datos de entrenamiento, el numero de tokens ni si hubo RLHF o DPO en los modelos base; esa informacion corresponde a las model cards de Qwen.

## Capacidades

- Reconocimiento de voz (ASR) sobre audio, mediante el decodificador Qwen3-ASR-1.7B mas el codificador mmproj de Q8_0.
- Salida etiquetada con idioma detectado y texto: formato `language Japanese<asr_text>...`.
- Traduccion de subtitulos, tarea declarada en el pipeline del repositorio (`translation`), orientada a pares japones-ingles segun los datos de calibracion.
- Generacion de subtitulos con marcas temporales, segun el uso descrito por el autor (subtitulos para video dual-audio).
- Servido mediante `llama-server` de llama.cpp, con endpoints compatibles (etiqueta `endpoints_compatible`).
- Modo conversacional (etiqueta `conversational` en el repo).
- No hay soporte documentado de tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio generativo. No se documenta un modo "thinking".

## Casos de uso

- Subtitulado automatico de anime y series: el decodificador reconoce la pista japonesa y el traductor genera la linea en ingles; la calibracion con OPUS OpenSubtitles ja-en esta alineada con este dominio concreto.
- Traduccion de subtitulos existentes en formato SRT o VTT dentro de un pipeline propio, aprovechando la salida etiquetada por idioma para encadenar reconocimiento y traduccion sin heuristica adicional.
- Despliegue self-hosted en una maquina sin GPU de gama alta: los 4,3 GB del repo permiten ejecutar ambos modelos con llama.cpp en CPU o en una GPU consumer, evitando enviar audio a servicios en la nube.
- Procesado por lotes de catalogos de video: el bajo peso del traductor (3,32 GB) permite mantener varias instancias en paralelo en un solo servidor para traducir temporadas completas.
- Investigacion en cuantizacion extrema: el repo documenta una receta reproducible por tipo de tensor con imatrix, util como punto de partida para estudios de degradacion a 2-3 bits en tareas de traduccion.
- Integracion en herramientas de escritorio de subtitulado en vivo, siguiendo el patron de aplicaciones que capturan audio del sistema y muestran un overlay de texto reconocido y traducido.
- Prototipado de un asistente de accesibilidad para contenido audiovisual no subtitulado, siempre que se asuma la falta de cifras publicadas de calidad y se valide con material propio.

## Benchmarks y rendimiento

El autor no publica cifras absolutas. La evaluacion descrita se hizo sobre un unico episodio de anime con doblaje dual, comparando las lineas traducidas contra los subtitulos oficiales con chrF++ y bootstrap emparejado, y remite a `docs/ai-subtitles/recognizer-gate.md` de Rillio para el metodo y los numeros.

| Medicion | Resultado |
|---|---|
| chrF++ sobre lineas traducidas (1 episodio) | cifra no publicada en la model card |
| Reconocedor, Q8_0 (2,17 GB) frente a IQ3_M (1,03 GB) | sin perdida medible declarada por el autor |
| Reconocedor por debajo de 0,75 GB | deja de reconocer segun el autor |
| Traductor IQ2_M (3,3 GB) frente a Q4_K_M (5,7 GB) | dentro del mismo margen en la tarea de subtitulado, segun el autor |
| Divergencia KL del traductor contra Q8_0 | 11 veces la de Q4_K_M |
| Benchmarks estandar (MMLU, HumanEval, GSM8K, WER) | no disponibles |

## Requisitos de hardware

- Peso en disco: 1.029.361.856 bytes el decodificador IQ3_M y 3.317.523.648 bytes el traductor IQ2_M, mas el `mmproj` del codificador de audio, que no esta en el repositorio y hay que descargar aparte.
- VRAM estimada para inferencia (estimacion propia, no publicada por el autor): alrededor de 1,5-2 GB para el reconocedor y de 4-5 GB para el traductor, incluyendo cache KV para contextos cortos de subtitulo.
- Cabe en GPU de consumo: una RTX 3060 de 12 GB o una RTX 4060 Ti de 16 GB ejecutan ambos componentes con holgura; en 8 GB conviene alternar o reducir contexto; en 6 GB es viable solo un componente a la vez.
- Ejecucion en CPU: al ser GGUF y usar llama.cpp, es posible servir ambos modelos sin GPU, con latencia mayor no cuantificada.
- Opciones de despliegue: `llama-server` de llama.cpp como via principal documentada; los pesos GGUF tambien son utilizables desde bindings de llama.cpp, aunque no se documenta soporte especifico de vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles. No hay datos de RTF, tokens por segundo ni tiempo por linea de subtitulo.

## Comparativa con modelos similares

No hay datos publicos de rendimiento para comparar con alternativas de reconocimiento o traduccion. La unica comparativa con numeros disponibles es interna al repositorio, entre las variantes de cuantizacion.

| Variante | Tamano | Papel | Datos de rendimiento |
|---|---|---|---|
| Qwen3-ASR-1.7B Q8_0 (origen) | 2,17 GB | Reconocedor de referencia | Sin degradacion medible frente a IQ3_M, segun el autor |
| Qwen3-ASR-1.7B IQ3_M (este repo) | 1,03 GB | Reconocedor desplegado | Equiparable a Q8_0 en la prueba descrita |
| Qwen3.5-9B Q4_K_M | 5,7 GB | Traductor de referencia del autor | Nivel de subtitulado equivalente al IQ2_M segun el autor |
| Qwen3.5-9B IQ2_M (este repo) | 3,32 GB | Traductor desplegado | KL contra Q8_0 de 11 veces la de Q4_K_M |
| Whisper large-v3 u otros ASR | no disponible | Alternativa de la misma categoria | no disponible |
| NLLB o modelos de traduccion dedicados | no disponible | Alternativa de la misma categoria | no disponible |

## Limitaciones y advertencias

- Repositorio sin traccion: cero descargas y cero likes en el momento de la consulta, sin validacion independiente conocida.
- La evaluacion declarada se apoya en un unico episodio de anime; no hay conjunto de prueba publico ni cifras absolutas reproducibles en la model card.
- Ambos pesos se obtienen con `--allow-requantize` desde Q8_0, lo que acumula el error de la cuantizacion previa ademas del de la nueva.
- El traductor opera a 2 bits en varias familias de tensor (atencion y embeddings); la divergencia KL declarada es 11 veces la de Q4_K_M, de modo que la degradacion existe aunque el autor sostenga que no afecta a la tarea de subtitulado.
- El decodificador deja de reconocer por debajo de 0,75 GB segun el autor: la receta no es extrapolable a cuantizaciones mas agresivas.
- El codificador de audio no esta incluido en el repositorio; sin el `mmproj` upstream, el reconocedor no es funcional por si solo.
- Idiomas: la model card no declara lista de idiomas y toda la calibracion se hizo sobre japones e ingles. El rendimiento en otros idiomas es desconocido.
- Riesgo de alucinacion inherente a los sistemas ASR y de traduccion automatica, agravado por la cuantizacion agresiva y por ruido de entrada.
- La importance matrix se calculo con corpus de OPUS OpenSubtitles; conviene revisar las condiciones de uso de esos datos antes de redistribuir derivados.
- Licencia Apache 2.0 declarada, heredada de los modelos base, pero la responsabilidad de verificar los terminos vigentes de Qwen3-ASR y Qwen3.5 recae en quien despliega.
- El dato de parametros totales del repo (2.031.739.904) no cuadra con la suma de un decodificador de ~1,7 B y un traductor de ~9 B; es probable un error de metadatos, no un dato fiable de tamano.
- No se documentan sesgos especificos, ni limites de contexto, ni comportamiento en produccion bajo carga.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/pek01/rillio-subtitle-pack
- Modelo base del reconocedor (GGUF upstream): https://huggingface.co/ggml-org/Qwen3-ASR-1.7B-GGUF
- Modelo base del traductor (GGUF upstream): https://huggingface.co/unsloth/Qwen3.5-9B-GGUF
- Modelo base Qwen3-ASR-1.7B: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Aplicacion Rillio: https://rillio.app
- llama.cpp: https://github.com/ggml-org/llama.cpp
- OPUS OpenSubtitles: https://opus.nlpl.eu/OpenSubtitles
- Generador de subtitulos STT.ai (referencia de categoria): https://stt.ai/subtitles/
- Subtitle AI (referencia de categoria): https://www.subtitle.ai/
- AI-SRTSub (referencia de categoria): https://ai-srtsub.com/en/
- ARIA, subtitulos en vivo en escritorio (proyecto relacionado): https://github.com/sayksii/aria
- editpacks, packs de escenas y audios (recurso relacionado): https://editpacks.org/
