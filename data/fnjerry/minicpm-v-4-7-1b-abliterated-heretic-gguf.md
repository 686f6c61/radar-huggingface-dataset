# fnjerry/MiniCPM-V-4.7-1B-abliterated-heretic-GGUF

## Resumen

MiniCPM-V-4.7-1B-abliterated-heretic-GGUF es una distribucion en formato GGUF del modelo multimodal MiniCPM-V 4.7 1B de OpenBMB, publicada por el usuario fnjerry. El modelo base es un MLLM (multimodal large language model) de aproximadamente 1.006 millones de parametros (1B) disenado para inferencia en dispositivo (on-device) y entornos de recursos limitados, con capacidades de vision y texto. Esta version concreta aplica una tecnica de abliteration mediante la herramienta Heretic v1.4.0, que elimina la direccion de rechazo (refusal) de los pesos del modelo original.

La relevancia de esta ficha radica en que combina dos tendencias: por un lado, la cuantizacion agresiva de modelos multimodales para que quepan en hardware de consumo (desde 575 MB en Q3_K_M); por otro, la modificacion de pesos para eliminar el sesgo de rechazo, lo que reduce la tasa de negativas del 99% al 9% segun la model card, manteniendo una divergencia KL de 0.0191 respecto al modelo base. El resultado es un modelo de vision-lenguaje pequeno, sin censura en la practica, ejecutable en llama.cpp y Ollama.

El modelo conserva la licencia Apache 2.0 del original y soporta ingles y chino. No se han publicado datos sobre arquitectura interna detallada, contexto maximo ni composicion del dataset de entrenamiento en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base MiniCPM-V 4.7 1B, MLLM multimodal) |
| Parametros totales | 1.006.209.856 (~1B) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K_M; proyector de vision en F16 |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp), con mmproj separado para vision |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base MiniCPM-V 4.7 1B (tipo de transformer, atencion, capas, etc.). Se sabe que es un MLLM de OpenBMB orientado a inferencia en dispositivo, con un proyector de vision separado (`mmproj-model-f16.gguf`, 1.11 GB) que debe cargarse junto con los pesos de texto para tareas de imagen. El pipeline declarado es `image-text-to-text`, lo que confirma la entrada multimodal imagen+texto y salida de texto.

El entrenamiento original corresponde a OpenBMB; esta version aplica una modificacion post-entrenamiento mediante Heretic v1.4.0, que realiza abliteration sobre los pesos para neutralizar la direccion de rechazo. La model card reporta una tasa de rechazo de 9/100 frente a 99/100 del modelo base, con una divergencia KL de 0.0191 respecto a la referencia. No se dispone de datos sobre numero de tokens de entrenamiento, composicion del dataset ni uso de RLHF/DPO en el modelo base.

## Capacidades

- Generacion de texto y razonamiento en ingles y chino.
- Comprension de imagenes y respuesta a preguntas visuales (image-text-to-text) mediante el proyector de vision separado.
- Razonamiento multimodal: la model card afirma que conserva "full multimodal vision and reasoning capabilities" tras la abliteration.
- Conversacion multi-turno (tag `conversational`).
- Compatible con endpoints (`endpoints_compatible`) y con llama.cpp/Ollama.
- Comportamiento sin censura en la practica: tasa de rechazo reducida al 9% segun la model card.
- No se documenta soporte de tool calling, function calling, agentes ni modo thinking en la informacion disponible.

## Casos de uso

- Procesamiento de imagenes en el borde (edge): el quant Q4_K_M (672 MB) mas el proyector de vision (1.11 GB) permite ejecutar OCR ligero o descripcion de imagenes en dispositivos con poca RAM, sin GPU dedicada.
- Asistente visual offline en movil o Raspberry Pi: con Q3_K_M (575 MB) el modelo cabe en entornos con memoria muy restringida, util para prototipos de asistencia visual sin conexion.
- Moderacion y generacion de contenido sin restricciones de rechazo: la baja tasa de rechazo (9/100) lo hace adecuado para tareas donde el modelo base se negaria a responder, como analisis de textos sensibles o generacion creativa sin filtros.
- Investigacion sobre abliteration y seguridad: permite comparar el comportamiento del modelo base frente a la version modificada con una metrica objetiva (KL 0.0191) y medir el impacto en coherencia y comprension visual.
- Clasificacion y extraccion de informacion de imagenes en pipelines locales: integrable en llama.cpp para tareas batch de etiquetado o extraccion de texto de capturas.
- Demos y pruebas de concepto de MLLM en hardware de consumo: al ser GGUF y con cuantizaciones pequenas, sirve para validar flujos multimodales antes de escalar a modelos mayores.

## Benchmarks y rendimiento

La model card solo reporta metricas de seguridad/abliteration, no benchmarks estandar de capacidad (MMLU, HumanEval, GSM8K, etc.):

| Metrica | Modelo abliterated | Modelo base |
|---|---|---|
| Tasa de rechazo | 9 / 100 | 99 / 100 |
| Divergencia KL | 0.0191 | 0.0000 (referencia) |

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K, MMMU, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente el tamano del quant mas el proyector de vision F16 (1.11 GB). Q4_K_M: ~672 MB + 1.11 GB ≈ 1.8 GB; Q8_0: ~1.08 GB + 1.11 GB ≈ 2.2 GB.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Cabe en cualquier GPU consumer con 2-3 GB de VRAM (GTX 1050 Ti, RTX 3050, etc.), aunque no se especifica soporte CUDA optimizado.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas y en muchos SoC integrados.
- Opciones de despliegue: llama.cpp, Ollama (tags declarados); compatible con endpoints.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato |
|---|---|---|---|---|---|
| MiniCPM-V-4.7-1B-abliterated-heretic (este) | ~1B | no disponible | si | apache-2.0 | GGUF |
| openbmb/MiniCPM-V-4.7-1B (base) | ~1B | no disponible | si | apache-2.0 | safetensors (original) |
| Otros MLLM pequenos (p. ej. Qwen2-VL-2B, SmolVLM) | >1B | no disponible | si | variable | variable |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada; la comparativa se limita a parametros, licencia y formato.

## Limitaciones y advertencias

- La abliteration elimina la direccion de rechazo; el modelo puede generar contenido que el original rechazaria, con implicaciones legales y eticas en produccion.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad; los modelos de 1B suelen alucinar con frecuencia en tareas de razonamiento complejo.
- Solo soporta ingles y chino; el castellano no esta declarado.
- Longitud de contexto no documentada; no se recomienda asumir ventanas largas.
- El repo tiene 0 descargas y 0 likes; no hay validacion de la comunidad sobre la calidad de esta cuantizacion concreta.
- Requiere descargar `mmproj-model-f16.gguf` por separado para vision; sin el, solo funciona como modelo de texto.
- Licencia Apache 2.0 permite uso comercial, pero el autor de la modificacion no ofrece garantias sobre el comportamiento del modelo abliterated.
- No se documenta soporte de tool calling ni agentes; no asumir capacidades de function calling en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/fnjerry/MiniCPM-V-4.7-1B-abliterated-heretic-GGUF
- Modelo base: https://huggingface.co/openbmb/MiniCPM-V-4.7-1B
- Organizacion OpenBMB: https://huggingface.co/openbmb
- Heretic (framework de abliteration): no disponible en la informacion proporcionada
- llama.cpp: no disponible en la informacion proporcionada
- Ollama: no disponible en la informacion proporcionada
