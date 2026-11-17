# NoobieToPro/NYXIS-30B-A3B-GGUF

## Resumen

NYXIS-30B-A3B es una cuantización y empaquetado del modelo Qwen3-VL-30B-A3B-Instruct de Alibaba Qwen, publicada por el usuario NoobieToPro bajo licencia Apache 2.0. Se trata de un modelo de lenguaje y visión de tipo Mixture-of-Experts (MoE) con 30.532.122.624 parámetros totales y aproximadamente 3.300 millones de parámetros activos por token, distribuidos en 128 expertos por capa con activación top-8. El modelo base pertenece a la familia Qwen3-VL, por lo que combina una torre de texto transformer con un proyector visual (ViT) para procesar imágenes.

La aportación principal de este repositorio no es el entrenamiento de un modelo nuevo, sino el empaquetado en formato GGUF orientado a un harness de escritorio propio denominado NYXIS, con cuantización Q2_K del cuerpo de texto (11,3 GB) y un proyector visual Q8_0 (712 MB). El autor documenta una división asimétrica GPU/CPU de las capas MoE (`--n-cpu-moe 45`) que permite ejecutar el modelo con un pico de VRAM dedicada de 2.735 MB en una GPU de portátil de 6 GB (RTX 4050), manteniendo velocidades de decodificación de en torno a 20 tok/s.

El interés actual del modelo radica en demostrar que un MoE de 30B con capacidades de visión y código puede desplegarse en hardware de consumo muy limitado mediante cuantización agresiva y offload selectivo de expertos, a costa de una calidad de pesos reducida (Q2_K) y de una latencia de prefill elevada en turnos de visión. El repositorio tiene 93 descargas y 1 like en el momento de la consulta, y fue creado el 15 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con vision (Qwen3-VL), 128 expertos por capa, top-8 activos |
| Parametros totales | 30.532.122.624 |
| Parametros activos | ~3.3B por token |
| Longitud de contexto | 4.096 tokens en la configuración de referencia (`-c 4096`); 6.144 en el perfil Ollama (`num_ctx 6144`) |
| Tipos de cuantizacion | Q2_K (torre de texto), Q8_0 (proyector visual); caché KV en q4_0 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (texto Q2_K + mmproj Q8_0) |
| Modelo base | Qwen/Qwen3-VL-30B-A3B-Instruct |
| Tamaño del repo | 23,2 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-VL-30B-A3B-Instruct: un transformer de tipo Mixture-of-Experts con 128 expertos por capa y activación top-8, lo que resulta en aproximadamente 3.300 millones de parámetros activos por token sobre un total de 30.500 millones. A esta torre de texto se le acopla un proyector visual (ViT) que permite el procesamiento de imágenes; en este repositorio el proyector se distribuye como `mmproj-Qwen3-VL-30B-Q8_0.gguf` (712 MB), la cuantización oficial Q8_0 de ggml-org.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si el modelo base empleó RLHF o DPO; esos datos pertenecen a la model card original de Qwen y no se reproducen en la información proporcionada. La innovación documentada por el autor es de despliegue, no de entrenamiento: división asimétrica GPU/CPU de las capas MoE (45 de 48 capas de expertos en CPU, 3 en GPU), caché KV cuantizada en q4_0 (con pérdida de decodificación declarada como nula y ahorro de ~200 MB de VRAM), proyector visual en GPU vía `--mmproj-device CUDA0`, y decodificación especulativa opcional mediante `ngram-mod` (12/3) que reporta una aceleración de 2,35x en edición de código. El autor menciona además una destilación agéntica propia de 51 trayectorias (SFT/QLoRA) para operaciones de ficheros con etiquetas `<nx_tool>`, diffs unificados y síntesis de aplicaciones en un solo paso, junto con un backstop de tool calling forzado por gramática JSON.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno.
- Comprensión de imágenes (vision-language) mediante proyector ViT en GPU.
- Verificación visual de entidades con hoja de firmas de personajes (identificación con cierre explícito de "no confirmable").
- Generación de código y edición de código con diffs unificados `+X / -Y`.
- Síntesis de aplicaciones HTML/CSS/JS en un solo paso.
- Tool calling / function calling mediante etiquetas `<nx_tool>` y backstop JSON forzado por gramática (`{"op","path","content","find","replace"}`).
- Operaciones de ficheros en workspace (lectura, escritura, reemplazo) dentro del harness NYXIS.
- Capacidades agénticas de múltiples pasos orientadas al harness de escritorio.
- Soporte de decodificación especulativa opcional con `ngram-mod`.
- Idioma: inglés (según la model card y los tags).

## Casos de uso

- Asistencia de código en local con GPU de consumo: el modelo genera y edita código a ~20 tok/s en una RTX 4050 de 6 GB, lo que permite integrarlo en un editor o IDE sin depender de la nube.
- Edición de ficheros en un workspace de escritorio: el harness NYXIS usa `<nx_tool>` con operaciones `op`/`path`/`content`/`find`/`replace` y diffs unificados, adecuado para tareas de refactorización guiada por el usuario.
- Síntesis de aplicaciones web de un solo archivo: genera HTML/CSS/JS completos en un solo paso, útil para prototipado rápido en local.
- Verificación visual de entidades: con la hoja de firmas de personajes en contexto, identifica personajes en fotos de hasta 4000 px con una precisión declarada del 100% en las pruebas del autor.
- Análisis de capturas de pantalla y documentación visual: los turnos de detalle o screenshot usan 448 px de lado mayor, lo que permite extraer información de UI o diagramas.
- Despliegue en portátiles con GPU modesta: con 2.735 MB de VRAM activa, el modelo puede convivir con otras aplicaciones gráficas (el autor cita Minecraft abierto) en una máquina de 16 GB de RAM.
- Servicio local compatible con la API de OpenAI: el backend `llama-server` expone `/v1/chat/completions`, lo que facilita integrarlo en clientes existentes.
- Automatización de tareas agénticas de ficheros: el backstop de gramática JSON impide tool calls "roleplayed", lo que reduce fallos en pipelines automatizados.

## Benchmarks y rendimiento

Los datos disponibles son mediciones de hardware del autor, no benchmarks académicos estándar (MMLU, HumanEval, GSM8K). Se presentan tal cual, sin comparación con otros modelos porque no se han publicado resultados de benchmarks en la información disponible.

| Métrica | Valor medido (RTX 4050 6 GB + 16 GB RAM, i5-13420H) |
|---|---|
| VRAM dedicada del motor | 2.663 MB en reposo / 2.735 MB activo |
| Working set de CPU del motor | 262 MB (tras trim) |
| TTFT en chat caliente / turno de saludo | 424 ms TTFT / 1,3–2,9 s total |
| Decodificación en generación de código | 19,5–20,6 tok/s (20,0 tok/s en turno de visión, `-t 4`) |
| Decodificación en edición de código (`ngram-mod 12/3`) | 48,4 tok/s (aceleración 2,35x) |
| Precisión de identificación visual (foto 4000 px) | 100% |
| Precisión de operaciones de fichero + diff | 100% (50/50 en suite automatizada) |
| Primera pasada de visión en frío (hoja de ID completa) | ~20–35 s (limitado por prefill; 6,8 s con prompt mínimo) |

## Requisitos de hardware

- VRAM estimada para inferencia: ~2,7 GB de VRAM dedicada con la configuración asimétrica documentada (Q2_K + `--n-cpu-moe 45` + caché KV q4_0 + mmproj Q8_0 en GPU).
- RAM del sistema: 16 GB en la máquina de referencia; el autor recomienda mantener las páginas mmap residentes (sin trims de working set) para evitar I/O de SSD.
- GPU recomendadas: RTX 4050 Laptop (6 GB) es la plataforma medida; cualquier GPU con ≥3 GB de VRAM dedicada y soporte CUDA debería poder ejecutar la misma configuración. Para offload completo en GPU se necesitaría mucha más VRAM (el repo ocupa 23,2 GB y la torre de texto Q2_K sola son 11,3 GB), aunque no se proporciona una cifra concreta de VRAM para full-GPU.
- Cabe en GPU de consumo: sí, en el rango de 6 GB con división MoE CPU/GPU; no se documenta el comportamiento en GPUs de 8, 12 o 24 GB.
- Opciones de despliegue: `llama-server` (CUDA) con `--mmproj`, `--n-cpu-moe`, `-ctk q4_0 -ctv q4_0`, `-fa on`; y Ollama mediante el `Modelfile` incluido (`num_ctx 6144`, `num_predict 800`, temperatura 0,55). No se mencionan vLLM ni TGI.
- Latencia y throughput: TTFT de 424 ms en turno caliente; 19,5–20,6 tok/s de decodificación en código; 48,4 tok/s con `ngram-mod` en edición; primera pasada de visión en frío de 20–35 s (6,8 s con prompt mínimo).
- Nota: la decodificación especulativa con modelo draft no es compatible (vocabularios incompatibles entre el target y el draft de 0,6B); el único booster soportado es `ngram-mod`.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada. Como referencia estructural, el propio modelo base Qwen3-VL-30B-A3B-Instruct comparte arquitectura y parámetros, pero se distribuye en safetensors y sin el empaquetado GGUF ni la destilación agéntica de NYXIS. No se han publicado comparativas con alternativas como otros MoE de ~30B o modelos vision-language de tamaño similar en la información disponible.

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| NYXIS-30B-A3B | 30,5B totales / ~3,3B activos | 4.096 (referencia) | Apache 2.0 | GGUF (Q2_K + mmproj Q8_0) | Empaquetado para harness NYXIS, offload CPU de expertos |
| Qwen3-VL-30B-A3B-Instruct | 30,5B totales / ~3,3B activos | no disponible en la información | Apache 2.0 | safetensors | Modelo base, sin cuantización ni harness |
| Otros modelos comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La cuantización Q2_K es muy agresiva y degrada la calidad respecto a los pesos originales en safetensors; no se documenta la pérdida exacta en benchmarks estándar.
- El modelo solo declara soporte de inglés (`language: en`); no se garantiza un rendimiento correcto en castellano u otros idiomas.
- La ventana de contexto efectiva en la configuración de referencia es de 4.096 tokens (6.144 en el perfil Ollama), muy inferior a la del modelo base, lo que limita conversaciones largas y documentos extensos.
- La primera pasada de visión en frío tarda 20–35 s por estar limitada por el prefill a través de las capas MoE en CPU; los turnos posteriores reutilizan el prefijo en caché.
- La decodificación especulativa con modelo draft no es compatible con este par de pesos; solo `ngram-mod` está soportado.
- El proyector Q8_0 requiere una build de llama.cpp que soporte tensores Q8_0 en mmproj.
- La destilación agéntica se basa en 51 trayectorias, una muestra pequeña; el comportamiento en tareas fuera de ese dominio no está evaluado.
- Riesgo de alucinación inherente a los modelos de lenguaje, no cuantificado en la información disponible; el autor mitiga la identificación visual con un cierre explícito de "no confirmable".
- No se documentan sesgos conocidos ni evaluaciones de seguridad.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y el proyector provienen de Qwen y ggml-org; conviene verificar las condiciones de esos artefactos aguas arriba.
- El repositorio tiene muy poca tracción (93 descargas, 1 like) y fue creado en noviembre de 2026; no hay validación independiente de las métricas declaradas por el autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/NoobieToPro/NYXIS-30B-A3B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-30B-A3B-Instruct
- Proyector visual oficial (ggml-org): no disponible como enlace directo en la información proporcionada
- Paper, blog o demo del harness NYXIS: no disponible en la información proporcionada
- Repositorio de llama.cpp: no disponible como enlace en la información proporcionada
