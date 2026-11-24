# kingjones777/XLL-Acts-Qwen3.5-9B-SuperRoc-GGUF

## Resumen

XLL-Acts-Qwen3.5-9B-SuperRoc-GGUF es una cuantización GGUF en formato ROCm-FP4 del modelo multimodal thurstonpowers/xll-acts-qwen3.5-9b, publicada por el usuario kingjones777. El objetivo no es ofrecer un modelo nuevo, sino un artefacto de pesos optimizado para ejecutarse en hardware AMD Strix Halo (Ryzen AI Max+ 395, arquitectura gfx1151) mediante el motor de inferencia Super Roc, un fork de llama.cpp orientado a ROCm. El pipeline declarado es image-text-to-text, por lo que el modelo conserva la capacidad de procesar imágenes junto con texto mediante un proyector multimodal separado (mmproj).

El nombre comercial sugiere una base de la familia Qwen3.5 de 9B, aunque el dato real de parámetros en safetensors reportado por Hugging Face es de 456.010.480 parámetros, muy por debajo de los 9B que indica el identificador. Esta discrepancia debe tenerse en cuenta: el recuento puede corresponder únicamente al componente de lenguaje o a un subconjunto del repositorio, y no se dispone de información que lo aclare. El repositorio ocupa 6,3 GB y contiene un GGUF principal de aproximadamente 5,39 GB (Q4_0 con imatrix) más un mmproj BF16 de unos 922 MB.

La relevancia actual del artefacto es de nicho pero concreta: permite desplegar un modelo multimodal con ventana de contexto anunciada de 131.072 tokens en un equipo de sobremesa con memoria unificada de 128 GB y GPU integrada AMD, un escenario tradicionalmente mal cubierto por los stacks CUDA. La licencia Apache 2.0 facilita su uso comercial, aunque la falta de documentación sobre el modelo base limita la evaluación rigurosa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado de Qwen3.5; transformer multimodal con proyector de visión) |
| Parámetros totales | 456.010.480 (dato de safetensors reportado); el identificador indica 9B, discrepancia no aclarada |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 131.072 tokens (contexto cargado en la medición del autor) |
| Tipos de cuantización | Q4_0 con imatrix en formato ROCm-FP4 (STRIX_LEAN); mmproj en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (quantizado) + mmproj GGUF para visión |
| Modelo base | thurstonpowers/xll-acts-qwen3.5-9b |
| Tamaño del repositorio | 6,3 GB |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base más allá de su pertenencia nominal a la familia Qwen3.5 y de su naturaleza multimodal (pipeline image-text-to-text). El artefacto publicado es una cuantización, no un entrenamiento: no hay datos sobre número de tokens de preentrenamiento, composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se documenta si el modelo base incorpora innovaciones como decodificación especulativa nativa, atención lineal o modos de razonamiento extendido, aunque la plantilla de chat del motor de ejecución expone un parámetro `enable_thinking`, lo que sugiere soporte de un modo de razonamiento activable por petición.

La innovación técnica real de este repositorio reside en la cuantización: se emplea el formato ROCm-FP4 desarrollado por el equipo ROCmFPX, que adapta técnicas de cuantización de baja precisión al backend ROCm de llama.cpp/ggml para hardware AMD. El archivo principal usa Q4_0 con una matriz de importancia (imatrix) calculada sobre datos de calibración, y se etiqueta como STRIX_LEAN, presumiblemente por optimizaciones específicas para la arquitectura gfx1151 de Strix Halo. El autor reporta una perplejidad de 9,68 sobre un documento técnico en inglés de 11.000 tokens con contexto de 4096, frente a 9,49 de un Q4_K_M estándar del mismo modelo, lo que sitúa la pérdida de calidad por cuantización en torno a 0,19 puntos de perplejidad.

## Capacidades

- Generación de texto y conversación multi-turno con ventana de contexto anunciada de 131.072 tokens.
- Procesamiento de imagen y texto combinados (image-text-to-text) mediante el proyector mmproj en BF16; el autor reporta una prueba de visión superada.
- Modo de razonamiento activable por petición mediante `chat_template_kwargs.enable_thinking`, desactivado por defecto en el comando de ejemplo.
- Tool calling / function calling: el autor mide 7/8 en llamadas requeridas y 7/8 en llamadas automáticas sobre su conjunto de prueba.
- Generación de código: se reporta un rendimiento de 41,6 tok/s de media en dos prompts de código, aunque no se documenta la calidad del código producido.
- Caché de prompt: en la segunda vuelta de una conversación se reutilizan 6961 de 6985 tokens de prompt.
- Capacidades multilingües: no disponibles (no se declaran idiomas soportados).

## Casos de uso

- Asistente local multimodal en estación de trabajo AMD: el modelo puede procesar capturas de pantalla o diagramas junto con instrucciones textuales en un equipo con Ryzen AI Max+ 395 y 128 GB de memoria unificada, sin depender de GPU NVIDIA ni de servicios en la nube.
- Análisis de documentación técnica extensa: con 131.072 tokens de contexto, es viable cargar manuales, especificaciones o bases de código completas y formular preguntas sobre ellos en una sola sesión, aprovechando además la caché de prompt para turnos sucesivos.
- Automatización con tool calling en pipelines internos: los resultados de 7/8 en llamadas requeridas y automáticas permiten integrarlo en flujos de agentes que consulten APIs o ejecuten funciones, siempre con validación adicional en producción.
- Prototipado de agentes multi-paso sobre hardware de consumo: la combinación de contexto largo, tool calling y un motor ligero (Super Roc) facilita experimentar con bucles de razonamiento y ejecución de acciones en local.
- Extracción de información de imágenes y documentos escaneados: el pipeline image-text-to-text permite transcribir o resumir contenido visual, por ejemplo tickets, formularios o gráficos, en un flujo por lotes.
- Generación asistida de código en entornos con restricciones de privacidad: al ejecutarse íntegramente en local, el modelo puede sugerir código sobre repositorios privados sin enviar datos a terceros, a una velocidad reportada de 41,6 tok/s.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir el impacto de ROCm-FP4 frente a Q4_K_M en tareas de perplejidad y generación sobre hardware AMD.

## Benchmarks y rendimiento

El autor no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K). Los únicos datos medidos disponibles son de perplejidad y de rendimiento del motor de inferencia:

| Métrica | Valor |
|---|---|
| Perplejidad (documento técnico EN, 11K tokens, contexto 4096) | 9,68 |
| Perplejidad del mismo modelo en Q4_K_M estándar | 9,49 |
| Tiempo de carga | 2 s |
| Prompt tok/s (p1k) | 1899,8 |
| Prompt tok/s (p8k) | 1982,7 |
| Generación tok/s (p1k) | 46,92 |
| Generación tok/s (p8k) | 129,9 |
| Generación de código tok/s | 41,6 (media de 2 prompts) |
| Tool calls (requeridas / automáticas) | 7/8 / 7/8 |
| Caché de prompt, turno 2 (tokens cacheados / prompt) | 6961 / 6985 |
| Contexto cargado | 131.072 tokens |
| Visión | superada |
| Drafter (decodificación especulativa) | desactivado |

Medición realizada en un Ryzen AI Max+ 395 con 128 GB, Super Roc 0.20.3, una petición simultánea, el 24 de noviembre de 2026.

## Requisitos de hardware

- VRAM/memoria estimada: el GGUF principal ocupa 5,39 GB y el mmproj 0,92 GB, por lo que se necesita aproximadamente 6,3 GB solo para los pesos; con contexto de 131.072 tokens la caché KV eleva sustancialmente el consumo, y el autor emplea un equipo con 128 GB de memoria unificada.
- GPU recomendadas: el artefacto está construido y medido para AMD Ryzen AI Max+ 395 (Strix Halo, gfx1151). No se documenta compatibilidad con otras GPU AMD ni con NVIDIA.
- GPU de consumo: encaja en equipos con memoria unificada amplia como el mencionado; no hay datos sobre su funcionamiento en GPUs discretas de consumo (RTX 4090, RX 7900 XTX) con este formato ROCm-FP4.
- Opciones de despliegue: Super Roc (motor principal, con servidor compatible con API), Lemonade (con configuración de binario ROCm) y, potencialmente, llama.cpp/ggml al estar basado en ellos, aunque la cuantización ROCm-FP4 depende de los parches de ROCmFPX.
- Latencia y throughput: 46,92 tok/s de generación con prompt de 1K y 129,9 tok/s con prompt de 8K en el hardware medido; carga en 2 s; prompt processing cercano a 1900-1980 tok/s.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Observaciones |
|---|---|---|---|---|---|
| XLL-Acts-Qwen3.5-9B-SuperRoc-GGUF | 456 M reportados (nombre indica 9B) | 131.072 | GGUF ROCm-FP4 | Apache 2.0 | Optimizado para Strix Halo; perplejidad 9,68 |
| thurstonpowers/xll-acts-qwen3.5-9b (base) | no disponible | no disponible | safetensors | no disponible | Modelo original sin cuantizar del que deriva este artefacto |
| Q4_K_M estándar del mismo modelo | no disponible | no disponible | GGUF | Apache 2.0 (presumible) | Perplejidad 9,49; referencia de calidad usada por el autor |

No se dispone de información suficiente para comparar con alternativas de la misma categoría (otros modelos multimodales de ~9B como Qwen2.5-VL o Llama 3.2 Vision) en parámetros, contexto y rendimiento verificados, por lo que la comparativa se limita a las variantes del propio modelo.

## Limitaciones y advertencias

- Discrepancia de tamaño: el identificador indica 9B pero el recuento de safetensors reporta 456 millones de parámetros; no hay aclaración oficial, lo que impide estimar con fiabilidad los requisitos reales y el rendimiento esperado.
- Documentación muy escasa: no se detallan datos de entrenamiento, idiomas, sesgos ni evaluación de calidad más allá de la perplejidad.
- La perplejidad medida (9,68) es ligeramente superior a la del Q4_K_M estándar (9,49), lo que indica una pérdida de calidad pequeña pero real frente a la cuantización convencional.
- Riesgo de alucinación no cuantificado: no se han publicado evaluaciones de fidelidad factual ni de tasas de error en tareas abiertas.
- Dependencia de hardware y software específicos: el formato ROCm-FP4 y el motor Super Roc están orientados a Strix Halo; fuera de ese ecosistema la ejecución puede no ser posible o requerir conversión.
- Tool calling con tasa de acierto 7/8: no es perfecto y requiere validación y reintentos en producción.
- Idiomas no declarados: no se puede garantizar un rendimiento aceptable en castellano u otros idiomas distintos del inglés, único idioma usado en la medición de perplejidad.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base thurstonpowers/xll-acts-qwen3.5-9b, no documentada en la información disponible.
- Repositorio sin descargas ni valoraciones en el momento de la consulta, lo que reduce la evidencia de uso en producción por terceros.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kingjones777/XLL-Acts-Qwen3.5-9B-SuperRoc-GGUF
- Modelo base: https://huggingface.co/thurstonpowers/xll-acts-qwen3.5-9b
- Motor Super Roc: https://github.com/kingjones30/superroc
- Documentación de Lemonade para Super Roc: https://github.com/kingjones30/superroc/blob/main/docs/LEMONADE.md
- ROCmFPX (formatos ROCm-FP4 y trabajo sobre llama.cpp): https://github.com/charlie12345/ROCmFPX
