# kvnxiao/swift-1.5-qwen3.8-27b-orcarouter-dflash2-nvfp4-ninfer

## Resumen

Este artefacto es una conversión al formato NInfer v3 del checkpoint NVFP4 de Swift 1.5 Qwen3.8-27B publicado por ajgazin, realizada por el usuario kvnxiao. No es un modelo entrenado desde cero ni un ajuste fino: es un reempaquetado de pesos con un esquema de cuantización mixta (NVFP4, FP8, Q4-Q8 y BF16 según el componente) más un modelo borrador DFlash2 empaquetado por separado y una cabeza de propuesta indexada, pensado para el runtime de inferencia en una sola GPU NInfer. La cadena de procedencia es Qwen3.8-27B, sobre el que UkisAI construyó Swift 1.0 y Swift 1.5, al que ajgazin aplicó la dirección de rechazo OrcaRouter antes de cuantizar con ModelOpt, y que aquí se reconvierte sin entrenamiento adicional.

El modelo conserva tres bloques funcionales: texto, visión y una cabeza de predicción multi-token (MTP) integrada. La arquitectura de partida es la de Qwen3.8-27B, con 27.000 millones de parámetros según la nomenclatura, y el artefacto ocupa 22,8 GB en el repositorio. Swift 1.5, la base de la que deriva, se postentrenó con RL y OPD y, según la documentación de UkisAI, reduce los tokens de razonamiento un 58,5 % y mejora ligeramente la precisión (0,35 %) con una aceleración de 1,95 veces respecto al modelo base.

Su relevancia actual es doble. Por un lado, es un ejemplo de cadena de cuantización agresiva orientada a GPUs Blackwell con NVFP4 y caché KV en FP8, con resultados medidos en una RTX 5090 (245,88 tokens/s de decodificación sostenida con DFlash2 y 232/280 aciertos en un subconjunto MMLU-Pro de selección propia). Por otro, incorpora el componente de abliteración (modelo "uncensored") y arrastra la licencia Swift Open License v1.0, con restricciones de uso comercial, lo que condiciona su adopción en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.8-27B con cabeza MTP integrada y modelo borrador DFlash2 para decodificación especulativa; no se documenta si el backbone es denso o MoE |
| Parametros totales | 27.000 millones (27B) según la nomenclatura; recuento exacto no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 32.768 tokens en la validación publicada (contexto y capacidad de KV); ventana nativa del modelo base no disponible |
| Tipos de cuantizacion | NVFP4 (MLP de texto, 64 capas), FP8 E4M3 (atención de texto), FP8 con escala por fila (embeddings y cabeza de salida), Q4/Q5/Q6/Q8 (visión), Q8 con escalas FP16 (MTP y DFlash2), Q4 (cabeza de propuesta), BF16 (tensores directos y proyecciones GDN a/b), caché KV en FP8 |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-1.0 (campo `license: other`); Qwen base y DFlash2 mantienen Apache 2.0 |
| Formato de pesos | artefacto NInfer v3 (librería `ninfer`); no se distribuyen safetensors ni GGUF |
| Tamano del repositorio | 22,8 GB |
| Pipeline declarado | image-text-to-text |
| Libreria | ninfer |
| Modelo base | ajgazin/Swift-1.5-Qwen3.8-27B-Uncensored-NVFP4 (relación: quantized) |

## Arquitectura y entrenamiento

El punto de partida es Qwen3.8-27B. UkisAI construyó Swift 1.0 y Swift 1.5 sobre esa base; la documentación de Swift 1.5 indica que el postentrenamiento se escaló con RL y OPD, lo que redujo los tokens de "thinking" un 58,5 % manteniendo la precisión (0,35 % mejor) y produjo una aceleración de 1,95 veces. ajgazin aplicó después la dirección de rechazo OrcaRouter (abliteración) sobre los pesos de Swift 1.5 y cuantizó el checkpoint con ModelOpt en NVFP4/FP8. Esta conversión concreta no añade entrenamiento ni abliteración adicional: solo reempaqueta.

El reparto de precisión es deliberadamente heterogéneo. Los MLP de texto importan los códigos NVFP4 calibrados de las 64 capas más las escalas de bloque, con escalas globales recíprocas en FP32. La atención de texto usa códigos FP8 E4M3 con multiplicadores escalares expandidos a escalas de fila BF16, mientras que las proyecciones GDN a/b y los tensores directos se mantienen en BF16. Embeddings y cabeza de salida se codifican en FP8 con escala por fila, decodificando previamente la cabeza NVFP4 de origen. En visión, las proyecciones pasan a Q4/Q5, el patch embedding a Q6 y el merger a Q8, con los tensores directos en BF16. La cabeza MTP y el borrador DFlash2 (checkpoint fijado de z-lab, `Qwen3.8-27B-DFlash2`) usan Q8 con escalas FP16, y la cabeza de propuesta codifica en Q4 una lista corta de 131.072 tokens extraída de la cabeza de salida decodificada. La innovación práctica es la decodificación especulativa en dos variantes: MTP interno (probado con 3 tokens de borrador) y DFlash2 externo (probado con 7, con soporte declarado de 1 a 15), además de cabeza de propuesta completa u optimizada.

## Capacidades

- Generación de texto y conversación multi-turno: los smoke tests cubren texto y chat multi-turno con contexto de 32.768 tokens.
- Modo thinking: verificado explícitamente en las pruebas de GPU.
- Visión: entrada de imagen en tres modos de inferencia (sin especulación, MTP con 3 tokens de borrador y DFlash2 con 7), con pipeline `image-text-to-text`.
- Tool calling / function calling estructurado: validado con una llamada de herramienta meteorológica estructurada.
- Generación de código: medida de forma sostenida en el banco de pruebas (245,88 tokens/s de decodificación con DFlash2).
- Decodificación especulativa: cabeza MTP integrada y borrador DFlash2 con recuentos de borrador de 1 a 15.
- Comportamiento "uncensored"/abliterated: procede de la dirección de rechazo OrcaRouter aplicada por ajgazin sobre Swift 1.5; la model card advierte que las mediciones de rechazo del origen corresponden a su fuente BF16 y no establecen el comportamiento de esta conversión.
- Capacidades de agente o razonamiento multi-paso: no documentadas más allá del soporte de tool calling.
- Capacidades multilingües: no disponible.

## Casos de uso

- Generación de código de alto rendimiento en una sola GPU: con DFlash2 y 7 tokens de borrador el artefacto sostiene 245,88 tokens/s de decodificación (mediana de tres ejecuciones limitadas) en una RTX 5090, un perfil adecuado para autocompletado o generación de parches en local sin depender de API externa.
- Asistentes sobre temáticas sensibles o creatividad sin filtros: al derivar de un checkpoint con la dirección de rechazo OrcaRouter aplicada, encaja en prototipos de escritura, juegos de rol o análisis de contenido donde los rechazos automáticos resultan un obstáculo; conviene asumir la pérdida de salvaguardas y compensarla con moderación externa.
- Documentos con imagen y texto: el pipeline `image-text-to-text` y las proyecciones de visión en Q4-Q8 permiten extraer información de capturas, diagramas o formularios y continuar la conversación en texto dentro del mismo contexto de 32.768 tokens.
- Orquestación de herramientas en pipelines internos: la validación de una llamada de función estructurada permite integrarlo como planificador que emite JSON para invocar APIs, bases de datos o servicios internos, con la salida validada por el orquestador.
- Investigación en decodificación especulativa: al incluir MTP y un borrador DFlash2 con 1 a 15 tokens de borrador, sirve para comparar configuraciones de aceptación, latencia y calidad sobre el mismo par de pesos, con informes brutos, prompts y respuestas incluidos en el release.
- Evaluación de cadenas de cuantización NVFP4/FP8: el repositorio documenta cada componente con su representación almacenada y ofrece un chequeo de formas, dtypes, códigos finitos y escalas positivas, útil para estudiar el impacto de cuantizar MLP, atención, visión y cabeza de salida con precisiones distintas.
- Despliegue en estación de trabajo con una RTX 5090: el pico medido es de 26.017 MiB en modo DFlash2, lo que permite servir el modelo junto a otras tareas si se respeta el umbral de 28.672 MiB libres que exige el arnés de validación.
- Réplica reproducible de conversiones: el proyecto incluye receta (`vendor/swift_nvfp4.py`), `sources.json` con revisión de dataset fijada y flujo `just setup/download/check/preflight/convert/inspect/runtime-build`, lo que facilita auditar o repetir la conversión.

## Benchmarks y rendimiento

Los únicos datos disponibles corresponden a esta conversión, medidos en una RTX 5090 local con contexto y capacidad KV de 32.768 tokens, caché KV en FP8, visión activada y una petición concurrente.

| Medición | Resultado |
|---|---|
| Smoke tests de GPU | 15/15 superados en los tres modos (sin especulación, MTP con 3 borradores, DFlash2 con 7) |
| VRAM total pico (modo DFlash2) | 26.017 MiB |
| Generación de código sostenida con DFlash2 | 245,88 tokens/s de decodificación (mediana de tres ejecuciones limitadas) |
| Subconjunto MMLU-Pro equilibrado propio, DFlash2 | 232/280 correctas (82,86 %), sin respuestas truncadas ni sin parsear |
| Latencia (TTFT) | no disponible |

Advertencia del propio autor: el subconjunto MMLU-Pro usa selección de preguntas y protocolo de prompt propios, por lo que la puntuación no es el resultado oficial del benchmark. La model card indica además que el checkpoint NVFP4 de origen no se probó de forma independiente y que las mediciones de la fuente BF16 no establecen la calidad ni el comportamiento de rechazo de esta conversión. No hay comparación con MMLU, HumanEval, GSM8K ni otros modelos.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 22,8 GB y el pico total medido es de 26.017 MiB en el modo DFlash2 (contexto 32.768, KV en FP8, visión activa).
- Umbral operativo: el arnés de validación exige al menos 28.672 MiB de VRAM libre antes de arrancar cada modo NInfer, comprobado con `nvidia-smi`.
- GPU recomendadas: la única validada en la información disponible es la RTX 5090 (32 GB, Blackwell). No se documentan pruebas en A100, H100 ni otras GPU de datacenter.
- Cabe en GPU de consumo: sí, pero solo en la gama de 32 GB; con 26.017 MiB de pico no entra en una RTX 4090 de 24 GB con esta configuración de contexto, visión y caché KV.
- Opciones de despliegue: runtime NInfer de Neroued para una sola GPU, con `--spec dflash2 --draft-tokens 7` (recuentos de 1 a 15 y cabeza de propuesta completa u optimizada) o con MTP de 3 tokens de borrador. El flujo de conversión requiere Linux con `uv`, `hf`, `git`, `just` y Podman sin root con NVIDIA CDI. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Throughput: 245,88 tokens/s de decodificación sostenida en generación de código con DFlash2, una petición concurrente.
- Latencia y rendimiento con concurrencia superior a uno: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kvnxiao/swift-1.5-qwen3.8-27b-orcarouter-dflash2-nvfp4-ninfer (este) | 27B (nomenclatura) | 32.768 tokens validados | NVFP4 + FP8 + Q4-Q8 + BF16, KV FP8 | swift-open-license-1.0 | Artefacto NInfer v3, 0 descargas, 0 likes, 22,8 GB |
| ajgazin/Swift-1.5-Qwen3.8-27B-Uncensored-NVFP4 | 27B | no disponible | ModelOpt NVFP4/FP8 | no disponible en la información | Checkpoint de origen de esta conversión |
| UkisAI Swift 1.5 Qwen3.8-27B | 27B | no disponible | BF16 (según la documentación de UkisAI) | no disponible en la información | Servido en Featherless; origen de la cadena |
| z-lab/Qwen3.8-27B-DFlash2 | no disponible | no disponible | no disponible | Apache 2.0 | Borrador de decodificación especulativa, empaquetado aquí en Q8 |
| MiaAI-Lab/Qwen3.8-27B-DFlash2-EXL3-5.0bpw | 27B | no disponible | EXL3 3,5 bpw con borrador EXL3 5,0 bpw, KV NVFP4 o Hadamard-4 | no disponible en la información | Kit de despliegue alternativo con decodificación especulativa |

No hay datos de benchmarks comparables entre estas variantes en la información disponible; la única cifra publicada pertenece a esta conversión.

## Limitaciones y advertencias

- Licencia restrictiva: swift-open-license-1.0 limita el uso comercial por encima de un umbral de ingresos brutos. Hay que leer las secciones 1, 4 y 5 para los términos exactos y los requisitos de redistribución. El modelo base Qwen y el compañero DFlash2 conservan Apache 2.0.
- Modelo abliterated: se eliminó la dirección de rechazo OrcaRouter, por lo que no hay salvaguardas fiables frente a peticiones dañinas. Es responsabilidad del integrador añadir filtrado externo.
- Trazabilidad incompleta: el origen declara que su checkpoint NVFP4 no se probó de forma independiente, y las mediciones de rechazo publicadas corresponden a su fuente BF16, no a este artefacto.
- Benchmark no estándar: el 82,86 % de MMLU-Pro procede de un subconjunto de 280 preguntas con selección y protocolo de prompt propios, no del benchmark oficial, y no debe compararse con cifras publicadas de otros modelos.
- Sin datos de idiomas: no se documenta cobertura multilingüe; conviene asumir el comportamiento del modelo base Qwen3.8-27B, no verificado aquí.
- Riesgo de alucinación: no se publican evaluaciones de fidelidad, veracidad ni tasas de alucinación para esta conversión.
- Contexto limitado a 32.768 tokens en la validación; no se documenta ventana nativa superior ni extrapolación.
- Despliegue muy dependiente del ecosistema: formato propietario NInfer v3, runtime específico y requisitos de VRAM (28.672 MiB libres) que excluyen GPUs de 24 GB. No hay safetensors ni GGUF publicados en la información disponible.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso en producción ni de estabilidad fuera del entorno de pruebas del autor.
- Reproducibilidad del rendimiento: las cifras se obtuvieron con una petición concurrente, semilla y prompts fijos y tres repeticiones; el throughput con carga concurrente real no se documenta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kvnxiao/swift-1.5-qwen3.8-27b-orcarouter-dflash2-nvfp4-ninfer
- Repositorio relacionado del mismo autor: https://huggingface.co/kvnxiao/swift-qwen3.8-27b-orcarouter-dflash2-nvfp4-ninfer
- Checkpoint de origen: https://huggingface.co/ajgazin/Swift-1.5-Qwen3.8-27B-Uncensored-NVFP4
- Checkpoint de origen de la cadena Swift 1.0: https://huggingface.co/ajgazin/Swift-Qwen3.8-27B-Uncensored-NVFP4
- Modelo base de la cadena: https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo borrador DFlash2: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Runtime NInfer: https://github.com/Neroued/ninfer
- Kit de despliegue alternativo con EXL3 y decodificación especulativa: https://github.com/MiaAI-Lab/Qwen3.8-27B-DFlash2-EXL3-5.0bpw
- Modelo Swift 1.5 servido por UkisAI: https://featherless.ai/models/ukisai/Swift-1.5-Qwen3.8-27b
- Informe de resultados de la conversión: RESULTS.md (incluido en el repositorio)
- Licencia: LICENSE (incluida en el repositorio)
- Avisos de conversión y de Swift 1.5: NOTICE y licenses/NOTICE-SWIFT (incluidos en el repositorio)
- Fijado de fuentes y suma de verificación de la receta: sources.json (incluido en el repositorio)
- Receta de conversión: vendor/swift_nvfp4.py (incluida en el repositorio)
