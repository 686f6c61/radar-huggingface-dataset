# mlboydaisuke/Qwen3-1.7B-int8-sym-ov

## Resumen

Qwen3-1.7B-int8-sym-ov es una exportación del modelo Qwen/Qwen3-1.7B a formato OpenVINO IR, con pesos cuantizados a int8 simétrico por canal, publicada por el usuario mlboydaisuke. No se trata de un modelo nuevo entrenado desde cero, sino de una conversión del checkpoint oficial de Qwen (revisión `70d244c`) pensada específicamente para ejecutarse sobre la NPU integrada de los procesadores Intel Core Ultra, mediante la librería OpenVINO GenAI. El modelo base es el Qwen3 de 1.700 millones de parámetros de Alibaba, un transformer denso con capacidades de generación de texto, razonamiento y modo "thinking" opcional.

La relevancia de esta ficha reside en que demuestra un flujo de despliegue de LLM en hardware de consumo sin GPU dedicada: la inferencia corre sobre la NPU del portátil. El autor reporta 297 ms hasta el primer token y 29,7 tokens/s en un Intel Core Ultra 9 386H con Windows 11, además de una tasa de coincidencia del 82,5 % (18 de 20 preguntas) con la primera línea de respuesta del modelo original en fp32 sobre CPU. Esa métrica mide acuerdo con el original, no corrección factual.

El repositorio pesa 1,7 GB y se distribuye bajo licencia Apache 2.0, heredada del modelo base. Está orientado a desarrolladores que quieran prototipar o desplegar generación de texto en local sobre Intel NPU con OpenVINO, no a entrenamiento ni a fine-tuning.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3-1.7B) |
| Parametros totales | 1.700 millones (modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | int8 simetrico por canal (pesos); exportado con `--weight-format int8 --sym` |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | OpenVINO IR (no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-1.7B, un transformer denso de 1.700 millones de parámetros desarrollado por el equipo Qwen de Alibaba. Esta exportación no aporta entrenamiento propio: parte de los ficheros oficiales del checkpoint en la revisión `70d244c`, verificados contra los hashes sha256 del Hub (sha1 de git blob para los ficheros pequeños), y los convierte a OpenVINO IR mediante `optimum-cli export openvino --task text-generation-with-past --weight-format int8 --sym`, con optimum-intel 2.2.0, nncf 3.4.0 y openvino 2026.4.1.

La innovación técnica de esta versión es la cuantización int8 simétrica por canal de los pesos y el empaquetado para OpenVINO GenAI con destino NPU. El pipeline usa `text-generation-with-past`, es decir, caché KV para decodificación autoregresiva. No se documentan en la información disponible detalles sobre el dataset de entrenamiento original, uso de RLHF/DPO ni innovaciones de atención del modelo base.

## Capacidades

- Generación de texto conversacional y de respuesta a preguntas, según el pipeline `text-generation` y el ejemplo de la model card.
- Modo "thinking" opcional del modelo base Qwen3, desactivable mediante el token `/no_think` en el prompt (el autor evalúa con thinking desactivado).
- Razonamiento de un solo turno en el ejemplo publicado; no se documenta soporte explícito de tool calling, function calling ni flujos de agente multi-paso en esta exportación.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se documentan capacidades de visión, audio ni otras modalidades.
- Inferencia sobre NPU Intel mediante OpenVINO GenAI (`ov_genai.LLMPipeline(..., "NPU")`).

## Casos de uso

- Prototipado de asistentes conversacionales en portátiles Intel Core Ultra: el modelo corre sobre la NPU integrada sin GPU dedicada, lo que permite mantener un chatbot local con OpenVINO GenAI y liberar la CPU para otras tareas.
- Respuesta a preguntas de dominio general en local: con 297 ms hasta el primer token y 29,7 tokens/s en el hardware medido, es viable para consultas cortas interactivas donde la privacidad impide enviar datos a la nube.
- Evaluación de cuantización int8 para producción: sirve como referencia para medir la pérdida de acuerdo respecto al modelo fp32 (18/20 en la prueba del autor) antes de adoptar int8 en un despliegue mayor.
- Integración en aplicaciones de escritorio Windows: el ejemplo con `openvino_genai` y la ruta de descarga vía `hf download` facilitan empaquetar el modelo en apps nativas que aprovechen la NPU.
- Docencia y experimentación con LLM en hardware de consumo: permite estudiar el comportamiento de un modelo de 1,7B cuantizado sin infraestructura de GPU.
- Generación de texto breve en pipelines por lotes pequeños: con respuestas de 2 a 48 tokens en las pruebas publicadas, encaja en tareas de resumen corto, clasificación generativa o reescritura de frases.
- Base para comparativas de backend: al ser una exportación OpenVINO de un modelo popular, sirve para contrastar latencia y throughput frente a GGUF/llama.cpp u otras rutas de despliegue en el mismo equipo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor sí publica métricas propias de despliegue y acuerdo:

| Metrica | Valor | Condiciones |
|---|---|---|
| Acuerdo con el modelo original (primera linea) | 18 de 20 preguntas | Thinking off; comparado con Qwen/Qwen3-1.7B fp32 en transformers sobre CPU |
| Tiempo hasta el primer token | 297 ms | Intel Core Ultra 9 386H, Windows 11, driver NPU 32.0.100.4841, OpenVINO GenAI 2026.4.1 |
| Throughput de generacion | 29,7 tokens/s | Mediana de 3 ejecuciones; 21 prompts de 23-40 tokens, respuestas de 2-48 tokens |

El propio autor advierte que la métrica de acuerdo mide coincidencia con el original, no corrección de las respuestas, y que la velocidad sigue en ajuste.

## Requisitos de hardware

- VRAM: no aplica en el sentido habitual; el modelo se ejecuta sobre NPU Intel. El repositorio ocupa 1,7 GB en disco, lo que da una idea del espacio necesario para los pesos int8.
- Hardware validado: Intel Core Ultra 9 386H (serie Core Ultra con NPU integrada), Windows 11, driver NPU 32.0.100.4841.
- GPU dedicadas: no se documenta uso en A100, H100 ni RTX 4090; el destino declarado es la NPU Intel.
- GPU de consumo: no se indica compatibilidad con GPU consumer; el backend es OpenVINO GenAI sobre NPU.
- Despliegue: OpenVINO GenAI 2026.4.1 (`openvino-genai==2026.4.1.0`) con `LLMPipeline` sobre dispositivo "NPU". No se documentan vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: 297 ms al primer token y 29,7 tokens/s en el hardware indicado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3-1.7B-int8-sym-ov | 1,7B | no disponible | OpenVINO IR int8 | Apache 2.0 | Exportacion para NPU Intel; 29,7 tok/s medidos en Core Ultra 9 386H |
| Qwen/Qwen3-1.7B (original) | 1,7B | no disponible | safetensors | Apache 2.0 | Checkpoint fp32/bf16 de referencia; el autor lo usa como base de comparacion |
| Otras exportaciones OpenVINO de Qwen3-1.7B | 1,7B | no disponible | OpenVINO IR | Apache 2.0 | No se dispone de datos comparativos en la informacion proporcionada |
| Alternativas GGUF de 1,7B (p. ej. llama.cpp) | 1,7B | no disponible | GGUF | segun modelo base | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de comparativas de rendimiento publicadas frente a otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Es una conversión, no un modelo nuevo: hereda los sesgos, alucinaciones y limitaciones del Qwen3-1.7B original, que no se documentan en esta ficha.
- La cuantización int8 introduce desviaciones: el autor mide 18/20 de acuerdo con el original, lo que implica que en 2 de 20 casos la primera línea difiere; ese acuerdo no garantiza corrección.
- El rendimiento publicado corresponde a un único equipo (Core Ultra 9 386H, Windows 11) y el autor indica que la velocidad sigue en ajuste; no debe extrapolarse a otras NPU o versiones de driver.
- Dependencia fuerte de versiones concretas: openvino-genai 2026.4.1.0, optimum-intel 2.2.0, nncf 3.4.0 y driver NPU 32.0.100.4841; cambios de versión pueden alterar resultados.
- Idiomas soportados no documentados; no se puede asumir cobertura multilingüe sin verificación.
- Longitud de contexto no indicada en la información disponible.
- No se documenta soporte de tool calling, agentes ni multimodalidad; no conviene asumirlo en producción.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3-1.7B por si añaden cláusulas adicionales.
- Repositorio sin descargas ni likes en el momento de la consulta y creado en 2026-11-10: madurez y mantenimiento no verificables.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlboydaisuke/Qwen3-1.7B-int8-sym-ov
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Registros de velocidad: https://huggingface.co/mlboydaisuke/Qwen3-1.7B-int8-sym-ov/tree/main/records
- Repositorio windows-model-zoo (criterio de la prueba QA20): https://github.com/john-rocky/windows-model-zoo/blob/8baf723b99c801c3cf98041d80a332654bbf1b7e/PLAN.md#how-to-read-the-qa20-line
- OpenVINO GenAI: no se proporciona enlace directo en la informacion disponible.
