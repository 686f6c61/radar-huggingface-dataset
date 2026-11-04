# chaoliangUNSW/Jev-Style-2B-Decision-v3-MLX

## Resumen

Jev-Style-2B-Decision-v3-MLX es la variante para Apple Silicon (MLX) de Jev-Style-2B-Decision-v3, un modelo de decisión y clasificación de texto de 2.000 millones de parámetros construido sobre la familia Qwen3.5. Lo mantiene Chaoliang Yan (chaoliangUNSW) y se publica bajo licencia Apache 2.0. No es un modelo generativo de propósito general: su función es responder preguntas cerradas sobre un texto de entrada (clasificación con etiquetas fijas, puntuaciones sí/no y elección entre opciones), con calibración explícita de la confianza.

El modelo aborda un problema concreto: sustituir llamadas a un LLM grande por un clasificador local rápido cuando la tarea es enrutar peticiones, aplicar guardarraíles o extraer una decisión discreta. El repositorio empaqueta dos builds de pesos en un único artefacto (bf16 de 3,76 GB y 8 bits de 2,00 GB) y un runtime propio (`jev_style_decision_mlx.py`) que expone un endpoint local `/v1/systemone`. Admite entradas de hasta 25.600 tokens por llamada sin límite en el número de opciones.

Es relevante ahora por dos motivos. Primero, la versión v3 es la última de la serie que no se entrenó con salidas destiladas de la API de Jev (la v4 sí lo hace, y es la recomendada actualmente por el autor). Segundo, demuestra que tareas de decisión estructurada pueden ejecutarse en un portátil con chip de Apple sin depender de una API alojada, algo útil para pipelines de enrutamiento y moderación con requisitos de latencia y privacidad estrictos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only derivado de Qwen3.5 (según tags y model card); no se detalla la configuración interna |
| Parámetros totales | 2B (2.000 millones) |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 25.600 tokens por llamada, sin límite de opciones (build local v3); la API alojada de la v4 usa 8.192 tokens con entradas de hasta 8.000 |
| Tipos de cuantización | bf16, 8 bits (MLX); el modelo base dispone de build GGUF F16 usada para los benchmarks |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), GGUF (build del modelo base) |
| Tamaño del repositorio | 5,8 GB |
| Librería / runtime | `jev-style` (extra `[mlx]`, requiere mlx-lm 0.31.3) |
| Pipeline declarado | text-classification |
| Modelo base | chaoliangUNSW/Jev-Style-2B-Decision-v3 |

## Arquitectura y entrenamiento

La información disponible indica que el modelo parte de la arquitectura Qwen3.5 y se ajusta para una tarea de decisión ("system-one"): dada una entrada de texto y un conjunto de preguntas con opciones cerradas, el modelo devuelve la opción elegida y una señal de calibración. El pipeline declarado es `text-classification`, no `text-generation`, lo que confirma que el uso previsto es la puntuación de opciones fijas y no la generación libre. No se especifican en la información proporcionada el número de capas, dimensiones ocultas, cabezas de atención ni el número exacto de tokens de entrenamiento.

Sobre los datos de entrenamiento, la model card afirma que esta release v3 no utilizó salidas de Jev y que las fuentes de entrenamiento están documentadas en la tarjeta del modelo base. La v4 posterior sí incorpora etiquetas suaves destiladas de TypeSafe Jev 1.14 a través de su API pública, lo que marca una diferencia de procedencia entre ambas versiones. No se detalla la composición del dataset, el uso de RLHF/DPO ni innovaciones de atención o decodificación. El autor declara que JevStyle se mantiene de forma independiente, sin afiliación ni respaldo de TypeSafe.

## Capacidades

- Clasificación de texto con etiquetas cerradas: el primitivo `choice` permite formular una pregunta y un conjunto fijo de opciones (por ejemplo, tono del cliente: calm, frustrated, angry).
- Decisiones sí/no con calibración: el primitivo `noul` devuelve una respuesta binaria con señal de confianza asociada.
- Puntuación de opciones fijas sin límite en el número de alternativas.
- Contexto largo: hasta 25.600 tokens por llamada en el build local v3.
- Enrutamiento de peticiones (LLM routing): asignar una consulta a un modelo, cola o categoría predefinida.
- Guardarraíles: verificación de si una entrada cumple o incumple una política expresada como pregunta cerrada.
- Ejecución local en Apple Silicon mediante MLX, con API compatible servida en `127.0.0.1:8765` (`/v1/systemone`).
- Precisión seleccionable en tiempo de carga: bf16 o 8 bits.
- No se documentan capacidades de tool calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido en esta versión.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el texto del ticket y una pregunta `choice` con las categorías del equipo (facturación, cuenta, envío, técnico) y devuelve la categoría con su confianza; al ejecutarse localmente evita enviar datos de clientes a una API externa.
- Guardarraíles de entrada en un chatbot: antes de invocar el LLM principal, una pregunta `noul` comprueba si la consulta contiene una petición prohibida o un intento de manipulación, y bloquea el paso si la decisión es afirmativa.
- Moderación de contenido en tiempo real: clasificación por opciones cerradas de categorías de riesgo sobre mensajes de usuario, con latencia local y sin coste por token.
- Análisis de sentimiento y tono en encuestas: pregunta `choice` sobre el tono del comentario (positivo, neutro, negativo) para agregación posterior en paneles de calidad.
- Filtrado previo en pipelines RAG: decidir si una consulta requiere recuperación documental o puede responderse de memoria, reduciendo llamadas innecesarias al modelo generativo.
- Clasificación de documentos largos: contratos, informes o hilos de correo de hasta 25.600 tokens se procesan en una sola llamada sin troceado, lo que simplifica el preprocesado.
- Etiquetado de datos a escala: aplicar el modelo sobre un corpus para generar etiquetas iniciales que después se revisan por humanos, aprovechando el coste marginal nulo de la inferencia local.

## Benchmarks y rendimiento

Resultados publicados por el autor, medidos con el build GGUF F16 del modelo base (motor declarado previamente, una única temperatura global, cada benchmark ejecutado una vez):

| Benchmark | Jev-Style v3 · 2B | Jev-Style v3 · 0.8B | Jev 1.13 (API) |
|---|---:|---:|---:|
| JevBench v1.4.1, 231 ítems públicos (↑) | 73,6 % | 64,1 % | 86,6 % |
| tweet_topic, zero-shot, accuracy (↑) | 82,2 % | 75,5 % | 79,3 %¹ |
| fin_topic, zero-shot, accuracy (↑) | 61,1 % | 46,7 % | 67,0 %¹ |
| Entrada máxima por llamada | 25.600 tokens, sin límite de opciones | 25.600 tokens | no disponible |

¹ Valor de la API de Jev según la model card.

Notas del autor: JevBench se ejecutó con el arnés oficial, no es una entrada oficial del board; intervalo de confianza al 95 % (Wilson) de 67,6–78,9 %. El 73,6 % es la mayor precisión pública en JevBench entre los sistemas de la familia Qwen3.5-2B del board v1.4.1 (decider-2b 71,0 %, open-jev-zefan-2b 64,5 %). Los builds MLX se verificaron contra la misma referencia FP32. No se han publicado resultados de MMLU, HumanEval ni GSM8K en la información disponible.

## Requisitos de hardware

- VRAM/unificada estimada: 3,76 GB para el build bf16 y 2,00 GB para el build de 8 bits, según los tamaños declarados por el autor.
- Plataforma objetivo: Apple Silicon con MLX; el runtime requiere mlx-lm 0.31.3 (instalado por el extra `[mlx]`).
- GPU NVIDIA: no se documenta soporte MLX para CUDA; para esos entornos habría que recurrir al build GGUF del modelo base.
- Cabe en equipos de consumo con memoria unificada de 8 GB o superior en el build de 8 bits; el bf16 requiere al menos 8 GB y deja poco margen, por lo que 16 GB es más cómodo.
- Despliegue: `pip install "jev-style[mlx]"` y `jev-style serve --release 2b-v3 --precision 8bit` (o `bf16`), que publica un endpoint local en `http://127.0.0.1:8765`. Para el modelo base, llama.cpp u Ollama con el GGUF F16.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | JevBench v1.4.1 | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| Jev-Style-2B-Decision-v3 (MLX) | 2B | 25.600 tokens | 73,6 % | Apache 2.0 | HF, ejecución local |
| Jev-Style-0.8B-Decision-v3 | 0,8B | 25.600 tokens | 64,1 % | Apache 2.0 (según serie) | HF, ejecución local |
| Jev 1.13 (API, TypeSafe) | no disponible | no disponible | 86,6 % | servicio propietario | API alojada |
| decider-2b | 2B | no disponible | 71,0 % | no disponible | board JevBench v1.4.1 |
| open-jev-zefan-2b | 2B | no disponible | 64,5 % | no disponible | board JevBench v1.4.1 |

La comparación se limita a los sistemas del board JevBench citados en la model card; no se dispone de datos de benchmarks estándar (MMLU, HumanEval) para contrastar con modelos de propósito general del mismo tamaño.

## Limitaciones y advertencias

- Modelo de decisión, no de generación: no está pensado para producir texto libre, código ni razonamiento abierto; usarlo fuera de tareas de opción cerrada dará resultados pobres.
- Versión superada: el autor recomienda la v4 (texto e imágenes) y la API alojada ya no sirve la v3; `--release 2b` selecciona la v4, por lo que es obligatorio pasar `--release 2b-v3` para cargar estos pesos.
- Procedencia del entrenamiento distinta a la v4: la v3 no usó salidas de Jev, pero la v4 sí emplea etiquetas destiladas de la API de TypeSafe Jev 1.14; conviene revisar los términos si se requiere una cadena de procedencia limpia.
- Benchmarks autoejecutados: JevBench no es una entrada oficial del board, cada prueba se ejecutó una sola vez y con una única temperatura; los intervalos de confianza son amplios (67,6–78,9 % en JevBench).
- Idiomas soportados no declarados: no hay garantía de comportamiento multilingüe más allá del inglés de los benchmarks.
- Riesgo de alucinación en la señal de confianza: la calibración es una salida del modelo y no una probabilidad verificada; en producción conviene umbralizar y auditar con datos propios.
- Sesgos: no se documenta ninguna evaluación de sesgo, toxicidad o equidad en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero el autor declara mantenimiento independiente y sin respaldo de TypeSafe; no hay garantías de soporte.
- Dependencia de una versión concreta de mlx-lm (0.31.3): actualizaciones del entorno pueden romper el runtime.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/chaoliangUNSW/Jev-Style-2B-Decision-v3-MLX
- Modelo base: https://huggingface.co/chaoliangUNSW/Jev-Style-2B-Decision-v3
- Versión recomendada v4 (MLX): https://huggingface.co/chaoliangUNSW/Jev-Style-2B-Decision-v4-MLX
- Versión 0.8B v3: https://huggingface.co/chaoliangUNSW/Jev-Style-0.8B-Decision-v3-MLX
- Serie v1 (2B): https://huggingface.co/chaoliangUNSW/Jev-Style-Qwen3.5-2B-Decision-MLX-bf16
- Serie v2 (2B): https://huggingface.co/chaoliangUNSW/Jev-Style-Qwen3.5-2B-Decision-v2-MLX-bf16
- Colección de builds y demos v3: https://huggingface.co/collections/chaoliangUNSW/jev-style-decision-v3-08b-2b-6ab87f32380cbd8c03b608b9
- Demo en el navegador (ejecuta la v4): https://huggingface.co/spaces/chaoliangUNSW/jev-style-2b
- Sitio web: https://jevstyle.com/models/
- Guía de instalación local: https://jevstyle.com/guides/run-locally/
- Clasificación de texto en Python: https://jevstyle.com/guides/local-text-classification/
- Enrutamiento local en Apple Silicon: https://jevstyle.com/guides/local-decision-models/
- Decisiones sí/no sobre recibos y capturas: https://jevstyle.com/use-cases/local-vision-decisions/
- Benchmark de enrutamiento bancario: https://jevstyle.com/benchmarks/banking-routing/
- Estado del servicio alojado: https://jevstyle.com/api/#service-status
- Health check de la API: https://api.jevstyle.com/healthz
- Repositorio GitHub: https://github.com/lawrence3699/jev-style
