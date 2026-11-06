# arvedo/Nemotron-3.5-Bolt-E4B-NVFP4-VisionAudio

## Resumen

Nemotron-3.5-Bolt-E4B-NVFP4-VisionAudio es una cuantización omni-modal del modelo NVIDIA Nemotron-3.5-Bolt-E4B-BF16, publicada por el usuario arvedo en Hugging Face. El modelo base es un modelo compacto de NVIDIA (aproximadamente 8.000 millones de parámetros totales según los safetensors del repositorio) derivado mediante post-entrenamiento de google/gemma-4-E4B-it, orientado a conversación natural, razonamiento, tool calling y flujos agénticos multi-turno. Esta edición concreta aplica cuantización NVFP4 (W4A4) calibrada a 128k de contexto sobre las 42 capas del transformer, junto con escalas de bloque de 32 elementos en formato MXFP8 (E4M3 + E8M0) para las torres de visión y audio.

La relevancia de esta ficha radica en que combina tres factores poco habituales en un mismo artefacto: cuantización de 4 bits en pesos y activaciones con retención casi sin pérdida respecto al BF16 original, soporte multimodal completo (imagen y audio además de texto) y un tamaño en disco de 6,00 GB que lo hace desplegable en GPUs de consumo. El autor reporta mejoras de hasta el 2,04x en velocidad de decodificación en contexto largo frente al modelo base BF16, así como una reducción del 60% en huella de pesos en motor (5,20 GiB).

La licencia es OpenMDW-1.1 (openmdw-1.1), con idiomas declarados inglés, alemán, francés, español, italiano y japonés. Existen ediciones alternativas del mismo autor: una LowMemory de 4,79 GiB que cuantiza también las tablas de identidad de token y PLE a NVFP4, y una edición GGUF nativa de 6,11 GB más 946 MB de mmproj para llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4 E4B con post-entrenamiento Nemotron); 42 capas; torres de visión y audio; cuantización NVFP4 W4A4 + MXFP8 para torres |
| Parametros totales | 7.996.156.490 (según safetensors del repositorio) |
| Parametros activos | no disponible |
| Longitud de contexto | 128k (contexto calibrado para la cuantización) |
| Tipos de cuantizacion | NVFP4 (W4A4) en capas transformer; lm_head en 4 bits con kernel B12xBlockscaledLinear (W4A16); MXFP8 (E4M3 + E8M0, escalas de bloque 32) en torres de visión y audio; FP8 sin comprimir para Token Identity y PLE; edición LowMemory con PLE en NVFP4; edición GGUF con PLE en Q8_0 |
| Idiomas soportados | en, de, fr, es, it, ja |
| Licencia | openmdw-1.1 (OpenMDW-1.1) |
| Formato de pesos | safetensors (librería vLLM); edición GGUF disponible por separado |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de tipo Gemma 4 E4B, con 42 capas y torres dedicadas de visión y audio, que NVIDIA sometió a un post-entrenamiento propio (Nemotron post-training) para reforzar conversación natural, razonamiento, tool calling y comportamiento agéntico multi-turno. Esta edición de arvedo no reentrena el modelo: aplica cuantización post-entrenamiento con NVIDIA ModelOpt, calibrada específicamente para una ventana de 128k tokens. Las 42 capas del transformer se empaquetan en NVFP4 con activaciones también de 4 bits (W4A4), mientras que las torres de visión y audio emplean MXFP8 con escalas de bloque de 32 elementos en formato E8M0, un esquema pensado para las arquitecturas Blackwell y Rubin de NVIDIA.

Una particularidad técnica destacable es la conservación en FP8 sin comprimir de las tablas de Token Identity y Per-Layer Embeddings (PLE, de dimensiones [262144, 5376]), lo que el autor denomina "High-Quality Edition" y que explica el tamaño de 6,00 GB frente a los 4,79 GiB de la edición LowMemory. La cabeza de salida (lm_head) se sirve mediante un kernel B12xBlockscaledLinear en 4 bits con activaciones de 16 bits (W4A16), lo que según el autor ahorra 1,00 GiB de VRAM en tiempo de ejecución frente a una cabeza BF16. No se dispone de información sobre el volumen de tokens de entrenamiento ni sobre la composición del dataset del modelo base en la información proporcionada.

## Capacidades

- Generación de texto y conversación multi-turno en seis idiomas (inglés, alemán, francés, español, italiano y japonés).
- Razonamiento y resolución de problemas, con resultados reportados en ARC, MMLU-Pro, HLE, MATH-500 e IFBench.
- Tool calling y function calling, orientado a agentes y asistentes conversacionales.
- Razonamiento agéntico multi-paso (multi-turn agentic capabilities), según la documentación de NVIDIA del modelo base.
- Visión: entrada de imagen en pipeline image-text-to-text, con torre visual cuantizada en MXFP8.
- Audio: torre de audio cuantizada en MXFP8, con paridad reportada frente al modelo Gemma 4 E4B-IT BF16 sin cuantizar.
- Contexto largo de hasta 128k tokens, calibrado específicamente para la cuantización NVFP4.
- Despliegue optimizado para vLLM y, en la edición GGUF, para llama.cpp.

## Casos de uso

- Asistentes de voz y dispositivos: el modelo combina entrada de audio con conversación multi-turno y un tamaño de 6,00 GB, lo que permite integrarlo en asistentes locales con latencia baja; el autor reporta 120,9 tok/s de decodificación pura a c=1 en DGX Spark GB10.
- Atención al cliente automatizada: la ventana de 128k tokens permite mantener conversaciones largas con historial extenso y documentación adjunta, y el soporte de tool calling facilita consultas a sistemas de ticketing o CRM.
- Agentes multi-paso en producción: con soporte de function calling y razonamiento agéntico, puede orquestar flujos que requieran varias llamadas a herramientas, como reservas, consultas de estado o automatización de back-office.
- Procesamiento de documentos con imagen y texto: al aceptar entrada image-text-to-text, puede extraer información de capturas, formularios escaneados o gráficos combinándolos con instrucciones textuales.
- Despliegue en GPUs de consumo: la edición LowMemory (4,79 GiB) está pensada explícitamente para GPUs de 6 GB y 8 GB de VRAM, lo que habilita prototipado e inferencia local en estaciones de trabajo modestas.
- Transcripción y análisis de audio con contexto: la torre de audio en MXFP8 permite tareas que combinen audio con razonamiento textual largo, como resúmenes de reuniones con seguimiento de decisiones.
- Servicio de inferencia de alto throughput: el autor reporta 46.853,4 tok/s de prefill y 491,5 tok/s de decodificación pura a c=32 en el benchmark de 32k, adecuado para despliegues batched en vLLM sobre hardware Blackwell.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre una suite de 20.565 preguntas, comparando esta edición NVFP4 de alta calidad con el modelo base BF16:

| Benchmark | NVFP4 High-Quality | Nemotron Base BF16 | Diferencia |
|---|---|---|---|
| ARC | 92,00% | 90,84% (implícito) | +1,16% |
| MMLU-Pro | 39,73% | 37,67% (implícito) | +2,06% |
| HLE | 9,80% | 7,50% (implícito) | +2,30% |
| MATH-500 | 65,60% | no disponible | no disponible |
| IFBench | 55,33% | no disponible | no disponible |

Rendimiento de inferencia en DGX Spark GB10, benchmark de 32k sobre Wikipedia (25.258 tokens de prompt por petición):

| Métrica | NVFP4 | Base BF16 |
|---|---|---|
| Decodificación pura a c=1 | 120,9 tok/s | 59,2 tok/s |
| Decodificación pura a c=32 | 491,5 tok/s | sin memoria (OOM) |
| Prefill de prompt a c=32 | 46.853,4 tok/s | no disponible |

Paridad multimodal: 73,81% de precisión compuesta en 2.203 preguntas multimodales, frente a 73,40% de Google Gemma 4 E4B-IT BF16 sin cuantizar.

## Requisitos de hardware

- VRAM en motor: 5,20 GiB de pesos en tiempo de ejecución para la edición High-Quality, según el autor (60% de reducción frente al modelo base).
- Tamaño en disco: 6,00 GB (High-Quality), 4,79 GiB (LowMemory), 6,11 GB más 946 MB de mmproj (GGUF).
- GPUs objetivo: arquitecturas NVIDIA Blackwell y Rubin para los kernels NVFP4 y MXFP8; el benchmark de referencia se ejecutó en DGX Spark GB10.
- GPU de consumo: la edición LowMemory está diseñada para GPUs de 6 GB y 8 GB de VRAM; la edición High-Quality requiere algo más de margen por las tablas PLE en FP8.
- Opciones de despliegue: vLLM (librería declarada del repositorio) para las ediciones safetensors; llama.cpp para la edición GGUF.
- Throughput y latencia: 120,9 tok/s de decodificación pura a c=1 y 491,5 tok/s a c=32 en contexto de 32k sobre DGX Spark GB10; no se dispone de datos de latencia en otras GPUs.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Nemotron-3.5-Bolt-E4B-NVFP4-VisionAudio (esta ficha) | 7,996 B | 128k | openmdw-1.1 | safetensors (vLLM) | Cuantización NVFP4 + MXFP8, multimodal visión y audio, 6,00 GB |
| Nemotron-3.5-Bolt-E4B-NVFP4-VisionAudio-LowMemory | 7,996 B | 128k | openmdw-1.1 | safetensors (vLLM) | Misma base con PLE en NVFP4, 4,79 GiB, para GPUs de 6-8 GB |
| Nemotron-3.5-Bolt-E4B-NVFP4-VisionAudio-GGUF | 7,996 B | 128k | openmdw-1.1 | GGUF | PLE en Q8_0, 6,11 GB más 946 MB mmproj, para llama.cpp |
| NVIDIA Nemotron-3.5-Bolt-E4B-BF16 (base) | no disponible | no disponible | no disponible | safetensors | Modelo sin cuantizar, 14,89 GiB en disco, referencia de calidad |
| Google Gemma 4 E4B-IT BF16 | no disponible | no disponible | no disponible | safetensors | Modelo origen del post-entrenamiento; 73,40% en la suite multimodal del autor |

## Limitaciones y advertencias

- La cuantización NVFP4 W4A4 y los kernels MXFP8 están orientados a hardware NVIDIA Blackwell y Rubin; en GPUs anteriores el despliegue puede no ser viable o requerir conversión a otro formato.
- El modelo base es un modelo pequeño (aproximadamente 8.000 millones de parámetros): los resultados en MMLU-Pro (39,73%) y HLE (9,80%) indican un techo de conocimiento limitado en tareas de razonamiento experto y conocimiento enciclopédico.
- Riesgo de alucinación inherente a los modelos de lenguaje de este tamaño, especialmente en dominios especializados y en contextos largos donde la recuperación de información es más frágil.
- Los benchmarks reportados provienen del autor del repositorio y de su propia suite de evaluación; no se dispone de verificación independiente en la información proporcionada.
- Cobertura lingüística limitada a seis idiomas (en, de, fr, es, it, ja); el rendimiento fuera de ellos no está documentado.
- La licencia OpenMDW-1.1 debe revisarse antes de uso comercial; el repositorio declara `license: other` con nombre openmdw-1.1, por lo que conviene consultar los términos exactos en el enlace oficial.
- El modelo es una cuantización de un derivado de Gemma 4 E4B: pueden aplicar restricciones adicionales heredadas del modelo origen que no se detallan en la información disponible.
- No se dispone de información sobre sesgos específicos medidos, composición del dataset de entrenamiento ni evaluaciones de seguridad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/arvedo/Nemotron-3.5-Bolt-E4B-NVFP4-VisionAudio
- Edición LowMemory: https://huggingface.co/arvedo/Nemotron-3.5-Bolt-E4B-NVFP4-VisionAudio-LowMemory
- Edición GGUF: https://huggingface.co/arvedo/Nemotron-3.5-Bolt-E4B-NVFP4-VisionAudio-GGUF
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16
- Modelo origen del post-entrenamiento: https://huggingface.co/google/gemma-4-E4B-it
- Página de NVIDIA Research: https://research.nvidia.com/labs/nemotron/Nemotron-3.5-Bolt-E4B-4GB/
- NVIDIA NIM: https://build.nvidia.com/nvidia/nemotron-3.5-bolt-e4b
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
