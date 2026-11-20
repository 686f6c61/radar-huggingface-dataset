# lackonendes/PAW-27B-X3.1-GGUF

## Resumen

PAW-27B-X3.1-GGUF es una cuantización del modelo Qwen/Qwen3.8-27B (27B parámetros en BF16) publicada por el usuario lackonendes bajo el alias PAW. El objetivo declarado es ejecutar el modelo base completo, con su ventana de contexto de 262.144 tokens, en una única GPU de consumo RTX 3090 con 24 GB de VRAM, manteniendo una calidad cercana al original. Para ello emplea un códec de cuantización propio denominado "trellis-codec" y un formato de pesos GGUF modificado que requiere un fork específico de llama.cpp llamado llama-paw.

La relevancia del proyecto está en la relación entre tamaño, contexto y velocidad: el fichero recomendado (3,5 bpw) ocupa 11,50 GiB y, según el autor, alcanza 129 tok/s de generación en código y hasta 1.268 tok/s de procesamiento de prompt en una RTX 3090. Se distribuyen además variantes de 3,0, 2,5, 2,0 y 1,5 bpw para equipos con menos VRAM, aunque solo la de 3,5 bpw tiene resultados de benchmarks publicados.

Es importante señalar que los benchmarks presentados por el autor son parciales, con subconjuntos de ítems y selección del mejor resultado entre varias pasadas, por lo que deben interpretarse como una estimación optimista de la retención de calidad y no como una evaluación equivalente a la del modelo BF16 original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (hereda la del modelo base Qwen/Qwen3.8-27B) |
| Parametros totales | 4.856.488.448 (dato del repo en safetensors; el nombre comercial indica 27B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | 3,5 bpw (recomendada), 3,0 bpw, 2,5 bpw, 2,0 bpw, 1,5 bpw; drafter especulativo Q2_K |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (requiere llama-paw; llama.cpp estándar no puede leerlos) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base Qwen/Qwen3.8-27B en la documentación proporcionada; el repositorio solo describe el proceso de cuantización. La innovación técnica central es el "trellis-codec", un esquema de compresión de pesos que el autor presenta como una actualización de su release anterior PAW-27B-X3 con menor pérdida de calidad a igual tamaño de fichero. El resultado se empaqueta en GGUF, pero con un formato que el llama.cpp upstream no interpreta, de ahí la dependencia del fork llama-paw.

El autor incluye un drafter especulativo opcional (Qwen3.8-27B-DFlash2-Q2_K.gguf, 0,67 GiB) que se usa con decodificación especulativa de tipo `draft-dflash` para acelerar la generación: con drafter se miden 129,09 tok/s en código frente a 30,16 tok/s sin él. No se detallan los datos de entrenamiento, el número de tokens, la composición del dataset ni si hubo RLHF o DPO, ya que el trabajo es exclusivamente de cuantización.

## Capacidades

- Generación de texto y razonamiento paso a paso, con modo "thinking" (el autor mide los benchmarks permitiendo más tokens de razonamiento por pasada).
- Generación de código, incluido código three.js/WebGL completo a partir de un prompt de texto, según las demos publicadas.
- Razonamiento matemático de competición (AIME 2026 evaluado en el conjunto de benchmarks).
- Razonamiento científico de nivel experto (GPQA-Diamond evaluado).
- Seguimiento de instrucciones (IFBench evaluado).
- Capacidad de trabajar con contexto muy largo (262.144 tokens), lo que habilita tareas de documento completo y conversaciones multi-turno extensas.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling, function calling y agentes: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles en la información proporcionada.

## Casos de uso

- Generación de código en local sobre GPU de consumo: con el fichero de 3,5 bpw y el drafter activado se obtienen 129 tok/s en tareas de código en una RTX 3090, lo que permite iterar en un IDE o en un pipeline de CI/CD sin depender de APIs externas.
- Análisis de repositorios y documentos largos: la ventana de 262.144 tokens permite cargar ficheros completos o varios documentos extensos en una sola pasada para resumen, extracción o revisión, algo inviable en modelos con contextos de 8k-32k.
- Prototipado de escenas 3D y contenido WebGL: las demos del autor muestran la generación en un solo tiro de escenas three.js a partir de un prompt, útil para herramientas de creación rápida de prototipos visuales.
- Razonamiento matemático y científico asistido: los resultados en AIME 2026 y GPQA-Diamond indican que el modelo conserva buena parte de la capacidad del BF16 para resolver problemas de competición y preguntas de nivel experto, adecuado para asistentes de investigación.
- Despliegue en estaciones de trabajo con una sola GPU: al ocupar 11,50 GiB el fichero recomendado, cabe en tarjetas de 16 GB o más dejando margen para el contexto y el drafter, lo que facilita entornos de desarrollo sin clúster.
- Evaluación comparativa de técnicas de cuantización: el repositorio publica tasas en bpw, hashes SHA-256 y métricas de retención, lo que lo convierte en un banco de pruebas útil para investigadores que estudien la degradación de calidad por compresión.
- Servicio de inferencia local de baja latencia: con 982-1.268 tok/s de procesamiento de prompt y ~30-129 tok/s de generación, es viable para aplicaciones interactivas de un solo usuario o pequeños equipos.

## Benchmarks y rendimiento

Los datos proceden del autor y comparan contra la columna "Base" publicada en la model card de ThinkingCap-Qwen3.8-27B (Qwen3.8-27B en BF16). La retención es el cociente entre la puntuación de PAW y la del BF16 publicado. Varias filas están incompletas.

| Benchmark | BF16 Base (publicado) | PAW-27B-X3.1 (3,5 bpw) | Retención |
|---|---:|---:|---:|
| AIME 2026 | 98,13 | 96,67 (29/30) | 98,5% |
| GPQA-Diamond | 89,93 | 90,4 (179/198, 11 pendientes) | 100,5% |
| MMLU-Pro | 85,54 | 87,2 (436/500, 20 pendientes) | 101,9% |
| LiveCodeBench v6 | 91,14 | 88,6 (155/175, en ejecución) | 97,2% (suelo, parcial) |
| IFBench | 79,75 | 78,0 (117/150, 6 pendientes) | 97,8% |

Rendimiento medido en una RTX 3090 con el fichero de 3,5 bpw:

| Carga de trabajo | tok/s |
|---|---:|
| Generación, código (con drafter) | 129,09 |
| Generación, código nuevo desde prompt largo (con drafter) | 73,74 |
| Generación, sin drafter | 30,16 |
| Generación, razonamiento en contexto largo | ~48-58 |
| Procesamiento de prompt, prompt corto | 982,87 |
| Procesamiento de prompt, 8k tokens | hasta 1.268,67 (pico) |

El propio autor advierte que la metodología es optimista (mejor resultado entre varias pasadas con distinto presupuesto de razonamiento), que algunas filas son suelos provisionales y que la puntuación de MMLU-Pro por encima del 100% es un artefacto de medición, no evidencia de mejora sobre el original.

## Requisitos de hardware

- VRAM estimada: 11,50 GiB para el fichero de 3,5 bpw; 10,10 GiB para 3,0 bpw; 8,67 GiB para 2,5 bpw; 7,26 GiB para 2,0 bpw; 5,85 GiB para 1,5 bpw. Hay que sumar el espacio de caché KV para el contexto configurado y 0,67 GiB si se usa el drafter especulativo.
- GPU recomendadas: RTX 3090 (24 GB) es la plataforma de referencia del autor; por tamaño, cabría también en RTX 4090 (24 GB), RTX 4080/5080 (16 GB) con el fichero de 3,5 bpw y contexto moderado, y en A100/H100 si se busca mayor throughput.
- Cabe en GPU de consumo: sí, al menos desde 8 GB con las variantes de menor bpw, aunque el autor solo ha medido velocidad y calidad en la de 3,5 bpw.
- Opciones de despliegue: exclusivamente llama-paw (fork de llama.cpp) compilado con CUDA; llama.cpp estándar, vLLM, TGI, Ollama y similares no pueden leer estos ficheros. El servidor se lanza con `llama-server` y los flags `-md` y `--spec-type draft-dflash` para la decodificación especulativa.
- Latencia y throughput: 129,09 tok/s en generación de código con drafter, 73,74 tok/s escribiendo código nuevo, 30,16 tok/s sin drafter, 48-58 tok/s en razonamiento de contexto largo, y 982-1.268 tok/s de procesamiento de prompt. No hay mediciones para el resto de tamaños de fichero.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / cuantización | Licencia | Notas |
|---|---|---|---|---|---|
| PAW-27B-X3.1 (3,5 bpw) | 27B (nominal) | 262.144 | GGUF propietario (llama-paw) | Apache 2.0 | Cuantización de Qwen3.8-27B; 11,50 GiB; benchmarks parciales |
| Qwen/Qwen3.8-27B (BF16) | 27B | 262.144 | safetensors BF16 | no disponible en la información | Modelo base; requiere ~54 GB en BF16, no cabe en GPU de consumo |
| ThinkingCap-Qwen3.8-27B | 27B | no disponible | no disponible | no disponible | Fuente de la columna Base usada como referencia de benchmarks |

No se dispone de información sobre otras alternativas comparables (por ejemplo, cuantizaciones GGUF estándar del mismo modelo base) en la documentación proporcionada.

## Limitaciones y advertencias

- Requiere un fork no oficial de llama.cpp (llama-paw); el ecosistema estándar de inferencia no es compatible, lo que limita el despliegue en producción y complica el mantenimiento.
- Los benchmarks son parciales, con subconjuntos de ítems, ejecuciones incompletas y selección del mejor resultado entre pasadas; el autor los califica explícitamente de guía aproximada y optimista.
- Solo el fichero de 3,5 bpw tiene mediciones de calidad y velocidad; no debe asumirse que las variantes de 1,5 a 3,0 bpw rindan igual.
- La cuantización a 3,5 bpw implica pérdida de calidad respecto al BF16, con retención estimada entre el 97% y el 100% en los benchmarks medidos, pero con incertidumbre por el método de evaluación.
- Existe discrepancia entre el nombre comercial (27B) y el recuento de parámetros del repo en safetensors (4.856.488.448); conviene verificar el modelo base antes de asumir capacidades.
- No hay información sobre sesgos, tasas de alucinación, idiomas soportados ni comportamiento en tool calling o agentes.
- Licencia Apache 2.0, que permite uso comercial, pero la dependencia de un fork de terceros añade riesgo técnico y de soporte en producción.
- El drafter especulativo añade 0,67 GiB de VRAM y su disponibilidad y compatibilidad deben validarse en el entorno concreto.
- La fecha de creación del repositorio (2026-09-24) y la referencia al modelo Qwen3.8-27B deben contrastarse con las fuentes oficiales antes de adoptar el modelo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/lackonendes/PAW-27B-X3.1-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Model card de referencia para benchmarks (ThinkingCap-Qwen3.8-27B): https://huggingface.co/bottlecapai/ThinkingCap-Qwen3.8-27B
- Fork de llama.cpp requerido (llama-paw): https://github.com/irawanw/llama-paw
- Fichero recomendado (3,5 bpw): https://huggingface.co/lackonendes/PAW-27B-X3.1-GGUF/resolve/main/PAW-27B-X3.1.gguf
- Drafter especulativo: https://huggingface.co/lackonendes/PAW-27B-X3.1-GGUF/resolve/main/Qwen3.8-27B-DFlash2-Q2_K.gguf
- Demo Eiffel Tower voxel garden: https://huggingface.co/lackonendes/PAW-27B-X3.1-GGUF/resolve/main/assets/eiffel_tower.mp4
- Demo Rocket launch scene: https://huggingface.co/lackonendes/PAW-27B-X3.1-GGUF/resolve/main/assets/rocket_launcher.mp4
- Perfil del autor en X: https://x.com/nawariokra
- Apoyo al autor (Ko-fi): https://ko-fi.com/lackonendes
