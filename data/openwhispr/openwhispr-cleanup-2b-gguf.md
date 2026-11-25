# OpenWhispr/openwhispr-cleanup-2b-GGUF

## Resumen

OpenWhispr Cleanup 2B es un modelo de lenguaje especializado en la limpieza de transcripciones dictadas, desarrollado por OpenWhispr como componente local de su aplicación de dictado. Se trata de un fine-tune del modelo base Qwen/Qwen3.5-2B mediante LoRA (fusionado posteriormente), cuyo único propósito es transformar texto transcrito por reconocimiento de voz en texto limpio y bien formateado: elimina muletillas y arranques en falso, aplica autocorrecciones habladas ("strike that", "I mean"), escribe números, puntuación y listas, y respeta el diccionario personalizado y las líneas de tono configuradas en la aplicación.

El modelo no responde ni actúa sobre el contenido dictado: su función es exclusivamente de postprocesado textual. Con 1.881.825.088 parámetros totales (aproximadamente 1,88 mil millones), se distribuye en formato GGUF cuantizado Q4_K_M con un tamaño de 1.274.396.672 bytes (unos 1,27 GB), lo que permite su ejecución local en el dispositivo del usuario mediante llama.cpp sin enviar datos a ningún servidor.

Su relevancia radica en que resuelve un problema concreto de la transcripción por voz en producción: la salida de los motores ASR contiene disfluencias, errores de puntuación y números mal escritos que requieren normalización antes de ser útiles. Al ejecutarse íntegramente en local con un modelo de menos de 2 GB, ofrece una alternativa de privacidad frente a soluciones basadas en API, con un rendimiento medido del 72,4 % en el conjunto de test v2 de limpieza de dictado y del 84,9 % en habilidades más recientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-2B), fine-tune con LoRA fusionado |
| Parametros totales | 1.881.825.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (única publicada en el repositorio) |
| Idiomas soportados | en (inglés; otros idiomas pasan por la misma instrucción pero fueron evaluados con mucha menor cobertura) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-2B, un transformer de aproximadamente 1,88 mil millones de parámetros, y se ha adaptado mediante fine-tuning con LoRA, cuyos adaptadores se fusionaron en los pesos finales antes de la conversión a GGUF con llama.cpp. No se especifican en la información disponible detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO; la model card solo indica que las respuestas fueron reescritas por Claude (Anthropic) bajo una instrucción fija y verificadas por programa.

El conjunto de entrenamiento consta de aproximadamente 9.900 filas construidas a partir de cuatro fuentes: el *Dictation cleanup dataset* de Abhishek Barali (CC BY 4.0), *Disfl-QA* de Google Research (CC BY 4.0, derivado de SQuAD 2.0), *DisfluencySpeech* de AMAAI Lab (Apache 2.0, solo columnas de texto) y entradas generadas por programa (muletillas, correcciones, números hablados, puntuación) a partir de los textos anteriores. No se utilizaron datos de usuarios de OpenWhispr. La innovación técnica principal no reside en la arquitectura sino en el diseño del prompt: el modelo fue entrenado con una forma de petición exacta (system prompt fijo, thinking desactivado, temperatura 0) y funciona peor con otras formas, lo que lo convierte en un componente de pipeline altamente especializado más que en un asistente general.

## Capacidades

- Limpieza de transcripciones dictadas: eliminación de muletillas y arranques en falso, aplicación de autocorrecciones habladas y normalización de puntuación.
- Escritura de números hablados y formateo de listas.
- Aplicación de diccionarios personalizados y de equipo, así como de líneas de tono configuradas por la aplicación.
- Procesamiento de comandos de código dictados.
- Manejo de dictados largos mediante segmentación en frases (el propio autor recomienda dividir entradas de más de 600 palabras).
- Ejecución local sin conexión mediante llama.cpp.
- No soporta tool calling, function calling, agentes, visión, audio ni modo thinking; su única salida es la transcripción limpia.
- Capacidad multilingüe muy limitada: el inglés es el idioma principal y otros idiomas fueron evaluados con mucha menor cobertura.

## Casos de uso

- Dictado en aplicaciones de productividad: el modelo limpia la salida del motor ASR antes de insertarla en el editor, eliminando disfluencias y aplicando puntuación, con la ventaja de que todo el procesamiento ocurre en el dispositivo.
- Privacidad en entornos sensibles: al ejecutarse con llama.cpp de forma local, permite limpiar transcripciones de reuniones, notas clínicas o comunicaciones internas sin que el texto abandone el equipo.
- Normalización de números y fechas en notas dictadas: corrige expresiones habladas ("one hundred twenty five") a su forma escrita, aunque con el caveat documentado de que en dictados muy largos puede alterar cifras.
- Aplicación de vocabulario corporativo: integra diccionarios compartidos de equipo para que nombres de productos, siglas y términos internos se escriban de forma consistente.
- Formateo de listas y correos dictados: convierte instrucciones habladas de estructura ("primero..., segundo...") en listas y párrafos con puntuación adecuada.
- Postprocesado en pipelines de subtitulado o actas: se puede encadenar tras un motor ASR para producir texto publicable, segmentando entradas largas en frases de menos de 600 palabras como recomienda el autor.
- Integración en herramientas de código: limpia comandos dictados para editores o terminales, respetando la forma de los comandos hablados.

## Benchmarks y rendimiento

| Conjunto de evaluación | Tasa de acierto |
|---|---|
| Test v2 de limpieza de dictado de OpenWhispr (1.938 filas) | 72,4 % |
| Habilidades más recientes (530 filas: diccionario, tono, correos, listas, "strike that", comandos de código) | 84,9 % |

Evaluación realizada en un Mac con llama.cpp b12110. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,3 GB para los pesos en Q4_K_M, más overhead de contexto y del runtime de llama.cpp (estimación típica de 2 a 3 GB en total, no confirmada en la información disponible).
- GPU recomendadas: no se especifican en la información disponible; por tamaño, cualquier GPU consumer con 4 GB o más de VRAM debería poder alojarlo.
- Cabe en GPU consumer: sí, previsiblemente en tarjetas con 4 GB o más (por ejemplo, GTX 1650, RTX 3050 en adelante); también puede ejecutarse en CPU.
- Opciones de despliegue: llama.cpp (llama-server), con los parámetros `--jinja --reasoning-budget 0 --temp 0` indicados por el autor; compatible con endpoints.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato |
|---|---|---|---|---|---|
| OpenWhispr Cleanup 2B | 1,88 B | no disponible | Limpieza de dictado (inglés) | Apache 2.0 | GGUF Q4_K_M |
| Qwen/Qwen3.5-2B (base) | ~2 B | no disponible | Modelo generalista | no disponible | safetensors y otros |
| Alternativas especializadas en limpieza de dictado | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables de la misma categoría (limpieza de transcripciones) en la documentación proporcionada.

## Limitaciones y advertencias

- El modelo está orientado al inglés; otros idiomas se procesan con la misma instrucción pero fueron evaluados con mucha menor cobertura.
- Puede alterar cifras ocasionalmente (el autor cita el ejemplo de "125" a "120.5"), sobre todo en dictados muy largos; se recomienda dividir la entrada en frases.
- No es un asistente general: está entrenado para devolver únicamente la transcripción limpia y no responde preguntas ni ejecuta acciones.
- El rendimiento depende críticamente de la forma del prompt: se debe usar exactamente el system prompt, el formato `<transcript>...</transcript>`, thinking desactivado y temperatura 0; otras formas degradan la calidad.
- Riesgo de alucinación no cuantificado en la información disponible; al ser un modelo pequeño y especializado, cualquier desviación se manifestaría como modificaciones del texto dictado.
- Sesgos conocidos: no documentados en la información disponible.
- Licencia Apache 2.0, que permite uso comercial; el autor indica que es la misma que la del modelo base.
- Sin datos publicados sobre longitud de contexto, latencia o throughput, lo que dificulta planificar despliegues de producción a gran escala.

## Enlaces

- Hugging Face: https://huggingface.co/OpenWhispr/openwhispr-cleanup-2b-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Aplicación OpenWhispr: https://openwhispr.com
- Repositorio OpenWhispr: https://github.com/OpenWhispr/openwhispr
- Dataset de limpieza de dictado: https://github.com/AbhishekBarali/dictation-cleanup-dataset
- Disfl-QA: https://github.com/google-research-datasets/Disfl-QA
- DisfluencySpeech: https://huggingface.co/datasets/amaai-lab/DisfluencySpeech
