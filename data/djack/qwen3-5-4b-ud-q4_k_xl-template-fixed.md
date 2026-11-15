# DJack/Qwen3.5-4B-UD-Q4_K_XL-template-fixed

## Resumen

DJack/Qwen3.5-4B-UD-Q4_K_XL-template-fixed es una republicación no oficial del GGUF cuantizado dahara1/Qwen3.5-4B-UD-japanese-imatrix, un modelo derivado de Qwen3.5-4B (4.205.751.296 parámetros, según los safetensors del modelo original) con cuantización UD Q4_K_XL generada mediante imatrix sobre datos en japonés. El repositorio no modifica los pesos: solo reescribe la plantilla de chat embebida en los metadatos del GGUF, sustituyéndola por la versión corregida que dahara1 publica como `chat_template.jinja` independiente (actualización del 2026-04-09).

El problema que resuelve es concreto y de rendimiento, no de calidad: la plantilla estándar de Qwen3.5 emite un bloque `<think>` vacío en turnos históricos del asistente que no tienen contenido de razonamiento, lo que hace que el prompt renderizado difiera del procesado previamente y rompe la reutilización de caché de prefijo. En conversaciones multi-turno o con uso de herramientas, esto provoca reprocesamiento completo del contexto, con respuestas más lentas y mayor consumo energético. La corrección consiste en una única condición de guarda (`and reasoning_content`) en la plantilla.

Es relevante para quienes despliegan este GGUF en runtimes que leen la plantilla embebida (llama.cpp, PocketPal) y quieren conservar la caché de prefijo sin pasar manualmente un fichero de plantilla. La licencia es Apache 2.0 y los idiomas declarados son japonés e inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.5-4B; la model card de este repo no detalla la arquitectura interna) |
| Parametros totales | 4.205.751.296 (4,2 mil millones, dato de safetensors del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_XL (GGUF, cuantización UD con imatrix en japonés); otras cuantizaciones no disponibles en este repo |
| Idiomas soportados | ja, en |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero `Qwen3.5-4B-UD-Q4_K_XL.gguf`); tamano del repo 2,9 GB |

## Arquitectura y entrenamiento

La model card de este repositorio no describe la arquitectura ni el proceso de entrenamiento del modelo: es una republicación de solo metadatos y remite explícitamente al repositorio base (dahara1/Qwen3.5-4B-UD-japanese-imatrix) para cualquier cuestión sobre calidad, cuantización o benchmarks. El modelo original es Qwen3.5-4B, de Qwen; los pesos aquí incluidos son una cuantización Q4_K_XL con imatrix calculada sobre datos en japonés (UD, *Unsloth Dynamic* según la nomenclatura del fichero), lo que implica una calibración específica para preservar calidad en japonés a 4 bits.

La única innovación técnica documentada en este repo es la corrección de la plantilla de chat embebida. La plantilla estándar de Qwen3.5 renderiza un bloque `<think>` vacío en turnos históricos del asistente sin contenido de razonamiento; la versión corregida añade la condición `and reasoning_content` a la guarda que decide si emitir ese bloque. El resultado es que el prompt renderizado es estable entre turnos y la caché de prefijo se reutiliza correctamente en conversaciones multi-turno y con tool calling. La reescritura se realizó con `gguf-new-metadata` de gguf-py (herramienta oficial de llama.cpp) usando `--chat-template-file`: solo se reescriben metadatos y los tensores se copian literalmente. La verificación incluye el hash sha256 del fichero fuente (`e57e3a55...92f097`), un diff de la plantilla extraída frente al jinja independiente (exactamente una línea de diferencia) y la reextracción posterior para confirmar la presencia de `ns.last_query_index and reasoning_content`.

## Capacidades

- Generación de texto conversacional en japonés e inglés, heredadas de Qwen3.5-4B; la model card de este repo no detalla capacidades adicionales.
- Modo de razonamiento con bloques `<think>`: la plantilla gestiona `reasoning_content`, lo que implica soporte del formato de pensamiento de Qwen3.5.
- Conversaciones multi-turno con reutilización correcta de caché de prefijo gracias a la corrección de la plantilla.
- Soporte de tool calling / function calling a nivel de plantilla (la corrección afecta precisamente a conversaciones con uso de herramientas); las capacidades funcionales del modelo base no se detallan en este repo.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags) y con runtimes llama.cpp y PocketPal.
- Capacidades multilingües limitadas, según la declaración del autor, a japonés e inglés.

## Casos de uso

- Asistente conversacional multi-turno en japonés: el modelo mantiene conversaciones largas con caché de prefijo funcional, evitando el reprocesamiento completo del contexto en cada turno y reduciendo latencia y consumo energético en dispositivos con recursos limitados.
- Despliegue en móvil o edge con PocketPal: al descargar el GGUF desde este repositorio en lugar del base, la app usa directamente la plantilla corregida sin configuración adicional, con un fichero de 2,9 GB en Q4_K_XL.
- Servidor local con llama.cpp: se puede usar como reemplazo directo del fichero original (mismo nombre, mismos ajustes) o mantener el original y pasar `--chat-template-file chat_template.jinja`; útil para pipelines que dependen de la caché de prefijo.
- Agentes con tool calling en producción: la corrección evita que las conversaciones con llamadas a herramientas se reprocesen desde cero, lo que importa en flujos multi-paso donde cada turno añade contexto.
- Prototipado de chatbots bilingües ja/en: el modelo cubre ambos idiomas declarados y la cuantización imatrix en japonés está calibrada para preservar calidad en ese idioma a 4 bits.
- Evaluación de modelos Qwen3.5 en entornos con poca VRAM: al ser un GGUF de 4,2 mil millones de parámetros en Q4_K_XL, permite probar el comportamiento del modelo base en hardware consumer antes de escalar a versiones mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que, para calidad, cuantización y benchmarks, se consulte el repositorio base (dahara1/Qwen3.5-4B-UD-japanese-imatrix), y que la corrección aplicada no afecta a la corrección de las salidas, solo al rendimiento por reutilización de caché.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero GGUF ocupa 2,9 GB en Q4_K_XL; la VRAM necesaria depende del contexto y del runtime, pero el peso de los tensores ronda esos 2,9 GB (no se dispone de medición oficial en la información proporcionada).
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, un modelo de 4,2 mil millones de parámetros en 4 bits es apto para GPU consumer.
- Cabe en GPU consumer: sí, previsiblemente en tarjetas con 6-8 GB de VRAM o más, aunque no se confirma con datos oficiales.
- Opciones de despliegue: llama.cpp (con o sin `--chat-template-file`), PocketPal; otros runtimes compatibles con GGUF no se mencionan en la model card.
- Latencia y throughput: no disponibles; la model card solo señala cualitativamente que la corrección reduce el reprocesamiento y, con ello, mejora velocidad y calentamiento en conversaciones multi-turno.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| DJack/Qwen3.5-4B-UD-Q4_K_XL-template-fixed | 4,2 mil millones | no disponible | GGUF Q4_K_XL | Apache 2.0 | Plantilla de chat corregida; pesos idénticos al base |
| dahara1/Qwen3.5-4B-UD-japanese-imatrix | 4,2 mil millones | no disponible | GGUF (incluye Q4_K_XL) | Apache 2.0 | Modelo base de esta republicación; plantilla embebida sin corregir |
| Qwen/Qwen3.5-4B | 4,2 mil millones | no disponible | safetensors (original) | Apache 2.0 (según el repo) | Modelo original de Qwen; sin cuantización ni corrección de plantilla |

## Limitaciones y advertencias

- Es una republicación no oficial y no afiliada a dahara1; para cualquier duda sobre el modelo en sí hay que acudir al repositorio base.
- Solo se corrige la plantilla embebida; los pesos son idénticos al fichero original (mismo sha256 de origen), por lo que no hay mejoras de calidad.
- La corrección afecta únicamente al rendimiento por caché de prefijo; no cambia la corrección de las salidas.
- Idiomas declarados limitados a japonés e inglés; el rendimiento en castellano no está documentado.
- No hay datos publicados de benchmarks, contexto máximo ni requisitos de hardware en este repositorio.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; aplican los del modelo base Qwen3.5-4B.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo original y de la cuantización en el repositorio base antes de producción.
- Al ser un GGUF de 4 bits, puede haber degradación de calidad frente a los pesos originales en precisión completa, especialmente fuera del dominio japonés para el que se calibró la imatrix.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/DJack/Qwen3.5-4B-UD-Q4_K_XL-template-fixed
- Modelo base (cuantización): https://huggingface.co/dahara1/Qwen3.5-4B-UD-japanese-imatrix
- Modelo original: https://huggingface.co/Qwen/Qwen3.5-4B
- Herramientas gguf-py de llama.cpp: https://github.com/ggml-org/llama.cpp
- Informe del problema de caché en r/LocalLLaMA: https://www.reddit.com/r/LocalLLaMA/comments/1sg076h/i_tracked_a_major_cache_reuse_issue_down_to_qwen/
