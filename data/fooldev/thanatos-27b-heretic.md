# FoolDev/Thanatos-27B-HERETIC

## Resumen

Thanatos-27B-HERETIC es un modelo de lenguaje denso de 27.000 millones de parámetros publicado por FoolDev en Hugging Face, distribuido exclusivamente en formato GGUF y orientado a inferencia local con llama.cpp y Ollama. No se trata de un modelo entrenado desde cero: el autor lo describe explícitamente como un reempaquetado y cuantización de `heretic-org/Qwen3.8-27B-heretic-ara`, una abliteración del método ARA sobre Qwen 3.8 27B (denso) que reduce el comportamiento de rechazo aprendido en la capa base. El repositorio no realiza entrenamiento alguno; su aportación principal es la conversión a GGUF, la eliminación de los tensores MTP para que las herramientas estándar puedan cargarlo y la inclusión de plantillas de chat y de tool calling.

La relevancia del modelo es doble. Por un lado, ofrece una ventana de contexto nativa de 262.144 tokens, extensible hasta 1.010.000 mediante YaRN, sobre una arquitectura densa de 27B, lo que lo sitúa en un rango poco habitual para despliegue en una sola GPU o en estaciones de trabajo con 32 GB de memoria. Por otro, su carácter "uncensored" y su licencia Apache 2.0 lo convierten en una opción atractiva para experimentación con escritura creativa, roleplay y tareas de razonamiento sin las restricciones de alineamiento de los modelos base.

Conviene subrayar que la model card es inusualmente honesta sobre la procedencia: el autor advierte de que los campos de "teacher" (Claude Fable 5) y la lista de datasets provienen de revisiones anteriores de la ficha y que el modelo base actual no los reclama ni los reproduce. Un dataset listado, `Crownelius/Opus-4.7-Reasoning`, devuelve 401 en el Hub. Por tanto, cualquier afirmación sobre destilación o composición de datos debe tratarse como atribución no verificada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen 3.8 27B), sin MoE |
| Parámetros totales | 26.895.998.464 (~27B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativos; extensible a 1.010.000 con YaRN |
| Tipos de cuantización | GGUF: Q2_K (~10,9 GB), Q3_K_M (~13 GB), IQ4_XS, Q4_K_M (~17 GB), Q5_K_M (~20 GB) y superiores |
| Idiomas soportados | en, zh, ru, es, fr, it, ja, ko, de, ar, tr, pl, sv, nl, he, id, uk, fa, pt, ms, fi, el (22 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repositorio de 283,6 GB con múltiples cuantizaciones) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer denso de Qwen 3.8 con 27B parámetros, sin mezcla de expertos ni componentes híbridos SSM. El repositorio de FoolDev no entrena nada: parte de `heretic-org/Qwen3.8-27B-heretic-ara`, una abliteración ARA que modifica las direcciones de activación asociadas al rechazo para reducir las respuestas de negativa, y la convierte a GGUF eliminando los tensores de predicción multi-token (MTP) para garantizar compatibilidad con llama.cpp y Ollama estándar. El blob Q4_K_M incluido procede de `mradermacher/Qwen3.8-27B-heretic-ara-GGUF` y está marcado como `qwen35`, verificado contra las afirmaciones arquitectónicas del autor mediante un target `make verify-arch`.

Sobre el entrenamiento no hay información fiable. La ficha menciona un "teacher" Claude Fable 5 y seis datasets (Creative_Writing_ShareGPT_Enhanced, rStar-Coder, dataclaw-peteromallet, Opus-4.7-Reasoning, UltraData-Math y Crow-Heretic-TeichAI-Unified), pero el propio autor aclara que esos campos se arrastran de revisiones previas y que el modelo base no los reclama. No se documentan número de tokens, composición del dataset, fases de RLHF/DPO ni detalles del proceso de abliteración más allá de la referencia al método ARA. La innovación técnica destacable es, por tanto, operativa más que de entrenamiento: empaquetado GGUF listo para Ollama con plantilla de tool calling incluida y gestión explícita del KV cache para contextos largos.

## Capacidades

- Generación de texto conversacional multi-turno, con especial énfasis en escritura creativa y roleplay según los datasets atribuidos.
- Razonamiento explícito: la ficha lo etiqueta como modelo de razonamiento y menciona un modo de pensamiento heredado del base.
- Generación de código, respaldada por la atribución (no verificada) al dataset rStar-Coder.
- Matemáticas, con atribución al dataset UltraData-Math.
- Tool calling y function calling: el repositorio incluye una plantilla de herramientas que el puente Ollama de Hugging Face ingesta junto con los ficheros `template`, `system` y `params`.
- Capacidades de agente y razonamiento multi-paso, etiquetadas como `agent` en los tags del modelo.
- Multimodalidad declarada en los tags, con entrada de imagen soportada únicamente a través de llama.cpp; el soporte de visión en Ollama está roto para esta arquitectura según el autor.
- Multilingüismo en 22 idiomas, con cobertura destacada de inglés, chino, ruso, español, francés, italiano, japonés, coreano, alemán, árabe, turco, polaco, sueco, neerlandés, hebreo, indonesio, ucraniano, persa, portugués, malayo, finlandés y griego.
- Comportamiento "uncensored": la abliteración reduce los rechazos en la capa base.

## Casos de uso

- Escritura creativa y narrativa larga: con 262.144 tokens de contexto nativo, el modelo puede mantener coherencia sobre novelas completas o sagas de capítulos extensos, recordando tramas, personajes y estilo sin recurrir a resúmenes intermedios.
- Roleplay y personajes persistentes: la combinación de contexto largo y comportamiento uncensored permite sesiones de roleplay de horas con memoria de conversación completa, algo inviable en modelos de 8K-32K sin técnicas de recuperación.
- Asistente de código en local: la plantilla de tool calling y la atribución a rStar-Coder lo hacen apto para integrarse en flujos de edición de código con herramientas (lectura de ficheros, ejecución de tests) mediante llama.cpp u Ollama, sin enviar código a la nube.
- Análisis de documentos extensos: informes técnicos, expedientes legales o transcripciones de cientos de páginas caben en la ventana nativa; el modelo puede responder preguntas cruzadas sobre el documento completo en una sola pasada.
- Razonamiento matemático asistido: para problemas de competición o verificación de cálculos, el modo de razonamiento y la atribución a UltraData-Math lo hacen útil como generador de cadenas de solución que luego se validan con herramientas simbólicas.
- Prototipado de agentes autónomos: con function calling y contexto largo, se puede construir un agente que planifique, ejecute herramientas y revise sus resultados en múltiples pasos, desplegado en una estación de trabajo con 32-48 GB de VRAM.
- Traducción y localización multilingüe: los 22 idiomas declarados permiten tareas de traducción entre pares poco frecuentes (por ejemplo, finlandés-hebreo) sin depender de un modelo multilingüe propietario.
- Investigación sobre alineamiento y abliteración: el modelo sirve como caso de estudio reproducible de cómo la modificación de direcciones de activación afecta al comportamiento de rechazo, con pesos GGUF accesibles y licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni evaluaciones comparativas, y el autor no documenta métricas de rendimiento medidas. Cualquier cifra que circule sobre este modelo debe considerarse no verificada.

## Requisitos de hardware

- VRAM estimada para inferencia: Q4_K_M ocupa ~17 GB de pesos; con el contexto nativo completo de 262.144 tokens, el KV cache en f16 añade ~16 GiB (total ~32,3 GiB), y con `OLLAMA_KV_CACHE_TYPE=q8_0` baja a ~8,5 GiB (total ~24,8 GiB). Con `num_ctx=65536` y cache f16 el total ronda los 20 GiB.
- GPU recomendadas: una RTX 4090 (24 GB) funciona con Q4_K_M y contexto reducido o cache q8_0; para contexto completo se recomienda A100 40/80 GB, H100 o RTX 6000 Ada (48 GB).
- ¿Cabe en GPU de consumo? Sí, en RTX 3090/4090 (24 GB) con Q4_K_M y `num_ctx` moderado; en GPUs de 16 GB solo con Q3_K_M o Q2_K y contexto corto.
- Opciones de despliegue: Ollama (`ollama run hf.co/FoolDev/Thanatos-27B-HERETIC`), llama.cpp (recomendado para entrada de imagen), y cualquier runtime compatible con GGUF. Para otras cuantizaciones, `make build QUANT=...` en el repositorio.
- Latencia y throughput: no disponibles. El autor no publica mediciones de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Thanatos-27B-HERETIC | 27B denso | 262.144 nativo / 1.010.000 YaRN | Apache 2.0 | GGUF | Abliterado, uncensored, tool calling |
| heretic-org/Qwen3.8-27B-heretic-ara | 27B denso | No disponible en la información | No disponible | Safetensors (base) | Modelo base del que deriva; sin empaquetado GGUF propio |
| FoolDev/Janus-35B-HERETIC | 35B MoE (A3B) | No disponible en la información | Apache 2.0 (según ficha) | GGUF | Modelo hermano del mismo autor, base Qwen 3.6 35B-A3B, no una abliteración del mismo base |
| Qwen/Qwen3.8-27B | 27B denso | No disponible en la información | No disponible | Safetensors | Modelo original alineado, con rechazos intactos |

La comparación con alternativas de la misma categoría (modelos densos de ~27B con contexto largo) no puede completarse con datos verificados: la información disponible no incluye cifras de rendimiento ni contextos de los modelos de referencia más allá del propio Thanatos.

## Limitaciones y advertencias

- Procedencia no verificada: el "teacher" y los datasets de la ficha son atribuciones heredadas de revisiones anteriores; el modelo base no las reclama y uno de los datasets devuelve 401 en el Hub. No deben citarse como registro de entrenamiento.
- Comportamiento uncensored: la abliteración reduce los rechazos, lo que aumenta el riesgo de generar contenido dañino, sesgado o legalmente problemático. No es adecuado para aplicaciones de cara al público sin capas de moderación adicionales.
- Riesgo de alucinación: no hay evaluaciones publicadas de fidelidad factual; como todo modelo generativo sin benchmarks, la tasa de alucinación es desconocida.
- Visión rota en Ollama: la entrada de imagen solo funciona a través de llama.cpp; el soporte de Ollama para esta arquitectura está roto upstream según el autor.
- Contexto y memoria: el contexto nativo completo exige ~32 GiB solo para pesos y KV cache en f16; en hardware de 32 GB hay que reducir `num_ctx` o activar cache q8_0 antes del primer mensaje, lo que puede degradar la calidad en contextos muy largos.
- Licencia Apache 2.0: permisiva para uso comercial, pero el autor no ofrece garantías sobre el cumplimiento legal del contenido generado ni sobre la cadena de licencias del modelo base.
- Idiomas: aunque se declaran 22, no hay evaluaciones por idioma; el rendimiento en lenguas de bajos recursos (finlandés, malayo, hebreo) es desconocido.
- Mantenimiento: el repositorio ha cambiado de base y de nombre en varias ocasiones (ventanas qwen36 en mayo de 2026, renombrado a `-HERETIC`), lo que puede provocar blobs obsoletos en instalaciones locales de Ollama.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FoolDev/Thanatos-27B-HERETIC
- Modelo base: https://huggingface.co/heretic-org/Qwen3.8-27B-heretic-ara
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo hermano: https://huggingface.co/FoolDev/Janus-35B-HERETIC
- GGUF del base (mradermacher): https://huggingface.co/mradermacher/Qwen3.8-27B-heretic-ara-GGUF
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
- Banner del repositorio: https://huggingface.co/FoolDev/Thanatos-27B-HERETIC/resolve/main/banner.svg
