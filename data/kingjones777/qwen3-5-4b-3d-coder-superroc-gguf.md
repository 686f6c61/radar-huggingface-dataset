# kingjones777/Qwen3.5-4B-3D-Coder-SuperRoc-GGUF

## Resumen

Qwen3.5-4B-3D-Coder-SuperRoc-GGUF es una cuantización GGUF en formato ROCm-FP4 del modelo ccore/Qwen3.5-4B-3D-Coder, publicada por el usuario kingjones777. No se trata de un modelo entrenado desde cero, sino de una conversión de pesos orientada a la ejecución local sobre hardware AMD Strix Halo (Ryzen AI Max+ 395, arquitectura gfx1151), empaquetada específicamente para el motor de inferencia Super Roc del mismo autor. El modelo base suma 4.205.751.296 parámetros y se distribuye bajo licencia Apache 2.0.

La relevancia de esta ficha es doble. Por un lado, documenta un modelo de código de 4B parámetros con una ventana de contexto declarada de 131.072 tokens, un tamaño manejable para equipos de sobremesa y portátiles con GPU integrada potente. Por otro lado, ilustra una tendencia creciente: cuantizaciones de precisión reducida (FP4) optimizadas para un backend concreto (ROCm) en lugar de las habituales Q4_K_M para CUDA o CPU, con el objetivo de maximizar el ancho de banda de memoria en APUs.

El artefacto principal pesa 2,43 GB y emplea una cuantización Q4_0 con imatrix y formato ROCm-FP4. El autor reporta una perplejidad en wikitext-2 de 10,80, prácticamente idéntica a la del Q4_K_M estándar del mismo modelo (10,78), lo que sugiere que la pérdida de calidad por la cuantización FP4 es despreciable en esta métrica. La información disponible sobre el modelo base (datos de entrenamiento, composición del dataset, benchmarks) es muy limitada, por lo que varios apartados de esta ficha se marcan como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (heredada del modelo base Qwen3.5-4B; detalles no disponibles) |
| Parámetros totales | 4.205.751.296 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 131.072 tokens (según comando de ejemplo del autor) |
| Tipos de cuantización | Q4_0 con imatrix en formato ROCm-FP4 (único archivo publicado) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Qwen3.5-4B-3D-Coder-Q4_0-ROCmFP4-FAST-imatrix.gguf) |

## Arquitectura y entrenamiento

La arquitectura corresponde al modelo base ccore/Qwen3.5-4B-3D-Coder, del que no se dispone de documentación técnica en la información proporcionada. Por el nombre y el tamaño (4,2B parámetros) se infiere una familia Qwen3.5 de 4B, pero no hay datos verificables sobre número de capas, dimensión oculta, mecanismo de atención ni si incorpora innovaciones como atención lineal o decodificación especulativa. Tampoco se documentan los datos de entrenamiento: número de tokens, composición del corpus, uso de RLHF, DPO u otras etapas de alineación. Todo ello debe considerarse no disponible.

Lo que sí está documentado es el proceso de cuantización. El autor aplica una cuantización Q4_0 con matriz de importancia (imatrix) y la empaqueta en el formato ROCm-FP4 desarrollado por el equipo ROCmFPX, que parte del trabajo de llama.cpp/ggml. El objetivo es aprovechar las instrucciones FP4 de las GPU AMD RDNA 3.5 (gfx1151) para reducir el uso de ancho de banda de memoria, el cuello de botella típico en APUs con memoria unificada. El resultado se valida con perplejidad en wikitext-2 (10,80 frente a 10,78 del Q4_K_M estándar), lo que indica que la agresividad de FP4 no degrada la métrica de forma apreciable en este caso.

## Capacidades

- Generación de texto y conversación multi-turno, con plantilla de chat compatible con el formato conversacional del modelo base.
- Generación de código: el sufijo "Coder" del modelo base indica especialización en tareas de programación, aunque no se detallan los lenguajes cubiertos.
- Modo thinking conmutable: el comando de ejemplo usa `--think off` por defecto y permite activarlo por petición mediante `chat_template_kwargs.enable_thinking`.
- Tool calling / function calling: el autor reporta 7/8 llamadas correctas en modo requerido y 7/8 en modo automático.
- Soporte de contexto largo: hasta 131.072 tokens cargados en el motor Super Roc.
- Caché de prompt: reutilización de prefijo (6.962 de 6.986 tokens en el segundo turno medido).
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere interoperabilidad con APIs tipo OpenAI a través de Super Roc.
- Capacidades multilingües: no disponibles.
- Visión, audio u otras modalidades: no disponibles.

## Casos de uso

- Asistencia de código en local sobre hardware AMD Strix Halo: un desarrollador con un Ryzen AI Max+ 395 puede ejecutar el modelo con Super Roc y obtener 67 tok/s de generación con 131k de contexto, suficiente para autocompletado y chat de código sin depender de la nube.
- Refactorización de repositorios medianos: con 131.072 tokens de contexto se pueden pasar varios archivos completos en una sola petición y pedir cambios coherentes entre ellos, algo inviable con ventanas de 8k o 32k.
- Agentes de código con tool calling: el modelo ejecuta llamadas a herramientas con una tasa reportada de 7/8 en modo requerido, lo que permite integrarlo en flujos de edición de archivos, ejecución de tests y consulta de documentación.
- Servidor de inferencia personal con API compatible OpenAI: Super Roc expone un endpoint HTTP (`superroc serve --host 127.0.0.1 --port 8080`) que permite conectar editores como Continue, Cline o cualquier cliente compatible con la API de OpenAI.
- Integración con Lemonade: el autor documenta `lemonade pull` y `lemonade chat` para desplegar el modelo con un solo comando, útil para equipos que ya usan ese gestor de modelos locales.
- Prototipado de pipelines RAG sobre documentación técnica: la ventana de 131k y la caché de prompt (6.962 tokens reutilizados en el segundo turno) reducen el coste de inyectar manuales o bases de conocimiento extensas en cada consulta.
- Evaluación de cuantizaciones FP4 en AMD: investigadores que comparan ROCm-FP4 frente a Q4_K_M pueden usar este artefacto como referencia, dado que el autor publica la perplejidad de ambas variantes.

## Benchmarks y rendimiento

El autor no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K). Los únicos datos medidos son de rendimiento del motor y perplejidad:

| Métrica | Valor |
|---|---|
| Perplejidad wikitext-2 (este GGUF ROCm-FP4) | 10,80 |
| Perplejidad wikitext-2 (Q4_K_M del mismo modelo) | 10,78 |
| Tiempo de carga | 4 s |
| Prompt tok/s (p1k) | 3.311,6 |
| Prompt tok/s (p8k) | 3.387,5 |
| Generación tok/s (p1k) | 67,22 |
| Generación tok/s (p8k) | 59,35 |
| Generación de código tok/s | 68,2 (media de 2 prompts) |
| Tool calls (requerido / automático) | 7/8 / 7/8 |
| Caché de prompt turno 2 | 6.962 / 6.986 tokens |
| Contexto cargado | 131.072 tokens |
| Drafter (decodificación especulativa) | desactivado |

Mediciones realizadas en un Ryzen AI Max+ 395 con 128 GB de RAM, Super Roc 0.20.0 (release candidate), una petición simultánea, el 23 de noviembre de 2026. No se han publicado resultados de benchmarks estándar de calidad en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: el archivo pesa 2,43 GB; con overhead de contexto y caché KV para 131k tokens, se recomienda al menos 8-12 GB de memoria unificada o dedicada. El autor lo ejecuta en un equipo con 128 GB de memoria unificada.
- GPU recomendadas: el formato ROCm-FP4 está pensado para AMD RDNA 3.5 (gfx1151), en concreto el Ryzen AI Max+ 395 (Strix Halo). No se garantiza su funcionamiento en GPU NVIDIA ni en CPU sin conversión previa, ya que el formato FP4 es específico de ROCm.
- ¿Cabe en GPU de consumo? Sí, por tamaño (2,43 GB) cabría en cualquier GPU con 8 GB o más, pero el artefacto está optimizado para AMD Strix Halo; en NVIDIA habría que recurrir a una cuantización GGUF estándar (Q4_K_M) del modelo base.
- Opciones de despliegue: Super Roc (motor principal, con `superroc serve`), Lemonade (gestor documentado por el autor) y, potencialmente, llama.cpp si acepta el formato ROCm-FP4 (no confirmado en la información disponible). vLLM y TGI no están documentados para este artefacto.
- Latencia y throughput: 67,22 tok/s de generación con prompt de 1k y 59,35 tok/s con 8k; 3.311-3.387 tok/s de procesamiento de prompt; carga en 4 s. Medido con una sola petición concurrente.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / cuantización | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-3D-Coder-SuperRoc-GGUF (este) | 4,2B | 131.072 | GGUF ROCm-FP4 Q4_0 imatrix | Apache 2.0 | Optimizado para Strix Halo y Super Roc |
| ccore/Qwen3.5-4B-3D-Coder (base) | 4,2B | No disponible | Safetensors | Apache 2.0 (presumible) | Modelo original sin cuantizar |
| Q4_K_M estándar del mismo modelo | 4,2B | No disponible | GGUF Q4_K_M | Apache 2.0 | Referencia de perplejidad (10,78) citada por el autor |

No se dispone de información sobre otros modelos comparables de la misma categoría (coder de ~4B) en la documentación proporcionada, por lo que la comparativa se limita al propio modelo base y su cuantización estándar.

## Limitaciones y advertencias

- Es una cuantización, no un modelo nuevo: hereda todos los sesgos, alucinaciones y limitaciones del modelo base ccore/Qwen3.5-4B-3D-Coder, del que no se documentan evaluaciones de sesgo ni de seguridad.
- Especificidad de hardware: el formato ROCm-FP4 está diseñado para AMD RDNA 3.5 (gfx1151). En NVIDIA, Intel o CPU no funcionará sin reconvertir a un GGUF estándar.
- Dependencia de un motor concreto: el autor lo prueba con Super Roc 0.20.0; no hay garantía de compatibilidad con otras versiones o forks de llama.cpp.
- Contexto declarado de 131.072 tokens, pero sin benchmarks de calidad en ventanas largas (long-context retrieval, RULER, etc.), por lo que el rendimiento real en contextos extremos no está validado.
- Idiomas soportados no documentados; no se puede asumir un rendimiento multilingüe homogéneo.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria independiente de las métricas reportadas.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base y de los pesos originales antes de desplegarlo en producción.
- El autor reporta 7/8 en tool calls, lo que implica una tasa de fallo no nula en flujos agénticos; conviene implementar reintentos y validación de esquemas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kingjones777/Qwen3.5-4B-3D-Coder-SuperRoc-GGUF
- Modelo base: https://huggingface.co/ccore/Qwen3.5-4B-3D-Coder
- Repositorio de Super Roc: https://github.com/kingjones30/superroc
- Documentación de Lemonade para Super Roc: https://github.com/kingjones30/superroc/blob/main/docs/LEMONADE.md
- ROCmFPX (formatos ROCm-FP4): https://github.com/charlie12345/ROCmFPX
