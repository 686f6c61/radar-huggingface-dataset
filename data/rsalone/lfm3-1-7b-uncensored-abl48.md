# rSalone/LFM3-1.7B-uncensored-abl48

## Resumen

LFM3-1.7B-uncensored-abl48 es una versión "abliterada" (sin mecanismos de rechazo) del modelo LiquidAI/LFM3-1.7B, desarrollada por el usuario rSalone. La abliteración es una técnica de modificación de pesos que identifica y elimina la "dirección de rechazo" en el espacio de activaciones del transformer, de modo que el modelo deja de negarse a responder ante determinadas peticiones sin necesidad de reentrenamiento ni de prompting especial. En este caso, el autor midió la dirección de rechazo como la media sobre todos los tokens del prompt, un enfoque que según sus pruebas elimina las negativas con más eficacia que medir la dirección dentro del bloque de razonamiento o de la respuesta.

El modelo base, LFM3-1.7B, pertenece a la familia LFM3 de Liquid AI y está diseñado para generación de texto conversacional con modo de razonamiento (thinking). La intervención afecta a los 48 puntos de escritura al flujo residual (24 capas × 2) y se hornea directamente en los pesos, de forma que el comportamiento se mantiene tanto en transformers como en los GGUF cuantizados para llama.cpp. El resultado declarado por el autor es un aumento de las respuestas sin rechazo en HarmBench de 21/200 a 187/200, manteniendo prácticamente intacto el rendimiento en GSM8K (98/100) y con una ligera caída en GPQA Diamond (de 99 a 95 sobre 198).

Es relevante ahora porque ejemplifica una tendencia creciente de publicaciones comunitarias que modifican modelos pequeños para eliminar restricciones de alineación, con documentación técnica detallada sobre el método y sus límites. Con 1.728.801.536 parámetros y un contexto que el autor opera a 32.768 tokens en llama.cpp, es un modelo ligero que cabe en GPU de consumo y que apunta a casos de uso donde el filtrado previo del proveedor resulta un obstáculo (investigación de robustez, generación creativa sin restricciones, red teaming).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia LFM3 de Liquid AI); detalles internos no disponibles en la información proporcionada |
| Parametros totales | 1.728.801.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens en la configuración de llama.cpp del autor; contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | GGUF Q2_K, Q4_K_M, Q8_0, BF16; safetensors BF16 |
| Idiomas soportados | no disponible (la model card solo menciona prompts en inglés para los benchmarks) |
| Licencia | lfm-open-license-v1.0 (etiquetada como "other") |
| Formato de pesos | safetensors (BF16), GGUF (Q2_K, Q4_K_M, Q8_0, BF16) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia LFM3 de Liquid AI, con 1.728.801.536 parámetros en BF16. No se dispone de información sobre la composición del dataset de preentrenamiento, el número de tokens, ni si hubo fases de RLHF o DPO en el modelo base. La model card tampoco detalla innovaciones arquitectónicas específicas (atención lineal, SSM híbrido, decodificación especulativa, etc.); los papers referenciados en los tags (arXiv:2406.11717, 2402.04249, 2110.14168, 2311.12022) corresponden a trabajos genéricos sobre abliteración, refusal directions y evaluación de seguridad, no a la arquitectura del modelo base.

La innovación técnica de esta ficha es el procedimiento de abliteración. El autor identifica 48 puntos de escritura al flujo residual (24 capas × 2) y mide la dirección de rechazo en 11 posiciones distintas: en el prompt (último token y media de todos los tokens), dentro del bloque de razonamiento (thinking) y dentro de la respuesta. Las direcciones medidas en el prompt eliminan mejor las negativas que las medidas en el thinking o en la respuesta: en la prueba principal, las versiones medidas en el prompt respondieron sin rechazo entre 175 y 185 de 200 prompts de HarmBench, frente a 158-172 de las versiones medidas en el thinking. Además, el autor resuelve el problema de hornear la edición en los pesos teniendo en cuenta la RMSNorm posterior: en lugar de restar directamente γ⊙r de la matriz de salida W (lo que daba KL 0.0053), aplica W' = W − b(aᵀW) con a = γ⊙r y b = r/γ, reduciendo la divergencia a KL 0.0013 (abl48) y 0.0007 (abl38) respecto a la eliminación durante la generación. La divergencia KL respecto al modelo original es de 0.0112 (abl48) y 0.0083 (abl38). No se modificaron otros pesos.

## Capacidades

- Generación de texto conversacional multi-turno, con modo de razonamiento (thinking) activable, como en el modelo base.
- Razonamiento matemático: 98/100 en GSM8K según las pruebas del autor, idéntico al original.
- Razonamiento científico de nivel avanzado: 95/198 en GPQA Diamond (frente a 99/198 del original), con hasta 8.192 tokens de generación.
- Respuesta sin rechazo ante prompts que el modelo original rechazaría: 187/200 en HarmBench frente a 21/200 del original.
- Capacidad de planificar la respuesta dentro del thinking sin deliberar sobre rechazo (139-170 de 200 prompts, frente a 89-133 en versiones medidas en el thinking).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible explícitamente; el modo thinking sugiere capacidad de razonamiento encadenado, pero no se documenta soporte de agentes.
- Capacidades multilingües: no disponibles; los benchmarks se hicieron solo con prompts en inglés.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Investigación de robustez y red teaming: el modelo permite estudiar cómo responde un LLM sin mecanismos de rechazo ante prompts adversarios, comparando directamente con el original para medir el efecto de la abliteración sobre la alineación.
- Evaluación de sesgos y seguridad en pipelines de auditoría: al eliminar la capa de negativa, se pueden observar las respuestas "subyacentes" del modelo y analizar qué conocimientos o comportamientos quedan expuestos, útil para informes de seguridad internos.
- Generación creativa sin restricciones: escritura de ficción, guiones o narrativa que aborde temas sensibles (violencia en ficción, personajes moralmente ambiguos) sin que el modelo se niegue a continuar la escena, manteniendo coherencia multi-turno.
- Despliegue local en hardware de consumo: con cuantización Q4_K_M (1,10 GB) cabe en GPU de 4-8 GB o incluso en CPU, lo que permite experimentar con un modelo conversacional de 1,7B en portátiles y equipos sin GPU dedicada.
- Prototipado rápido de asistentes conversacionales: gracias a su tamaño reducido y a los GGUF listos para llama.cpp, sirve para validar flujos de chat, prompts de sistema y formatos de conversación antes de escalar a modelos mayores.
- Docencia y demostraciones sobre alineación: el par original/abliterado y la documentación del método (medición de direcciones, horneado en pesos, KL) constituyen un caso de estudio concreto para explicar cómo se codifica el rechazo en las activaciones de un transformer.
- Generación de datos sintéticos para entrenamiento: en escenarios donde se necesita diversidad de respuestas sin filtrado previo, el modelo puede producir ejemplos que un modelo alineado rechazaría, siempre que el uso cumpla la licencia y la legislación aplicable.

## Benchmarks y rendimiento

| Benchmark | Original (LFM3-1.7B) | abl48 (este modelo) | Notas |
|---|---|---|---|
| HarmBench (respondidos sin rechazo, de 200) | 21 | 187 | Etiquetado por Qwen3.8-Flash-Next local, no por el clasificador oficial; prompts solo en inglés |
| GSM8K (correctos, de 100) | 98 | 98 | Una ejecución por modelo |
| GPQA Diamond (correctos, de 198) | 99 | 95 | Hasta 8.192 tokens; ~50 preguntas truncadas y contadas como incorrectas |

Datos adicionales del autor: una dirección aleatoria eliminada en los mismos 48 puntos respondió 24/200 en HarmBench. En la comparación de 8 variantes (2 posiciones de prompt × 2 de thinking, cada una con eliminación en 48 puntos o solo en los relacionados), las versiones del lado del prompt respondieron 175-185/200 y las del lado del thinking 158-172/200. GSM8K se mantuvo en 96-98 y GPQA en 94-100 para las 8 variantes. En transformers, el original obtiene 97 en GSM8K y 99 en GPQA. No se han publicado resultados de MMLU, HumanEval ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~3,5 GB en BF16 (safetensors o GGUF BF16), ~1,9 GB en Q8_0, ~1,2 GB en Q4_K_M, ~0,8 GB en Q2_K (tamaños de archivo; la VRAM real incluye overhead del runtime y caché KV).
- GPU recomendadas: cualquier GPU con 4 GB o más para Q4_K_M (RTX 3050, GTX 1650, RTX 4060); 8 GB o más para BF16 con contexto largo (RTX 3060 Ti, RTX 4060 Ti, RTX 3070); A100/H100 no son necesarias para este tamaño, aunque pueden usarse para servir muchas peticiones concurrentes.
- Cabe en GPU de consumo: sí, en todas las cuantizaciones; Q4_K_M y Q2_K incluso en iGPU y CPU.
- Opciones de despliegue: llama.cpp (llama-server, con `-ngl 99 -c 32768 -fa on --jinja`), Ollama (a partir del GGUF), transformers con `trust_remote_code=True` y `dtype="bfloat16"`. vLLM y TGI no están documentados en la información disponible; el tag `custom_code` y la necesidad de `trust_remote_code` pueden complicar su integración.
- Latencia y throughput: no disponibles. El autor solo indica que Q8_0 y Q2_K se comprobaron cargando y respondiendo una pregunta simple en CPU; no se publican métricas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | HarmBench (sin rechazo) | GSM8K | GPQA Diamond | Licencia |
|---|---|---|---|---|---|---|
| LFM3-1.7B-uncensored-abl48 (este) | 1,73B | 32.768 (config. llama.cpp) | 187/200 | 98/100 | 95/198 | lfm-open-license-v1.0 |
| LiquidAI/LFM3-1.7B (original) | 1,73B | no disponible | 21/200 | 98/100 | 99/198 | lfm-open-license-v1.0 |
| LFM3-1.7B-uncensored-abl38 (mismo autor) | 1,73B | 32.768 (config. llama.cpp) | 175-185/200 (rango de variantes del lado del prompt) | 96-98/100 | 94-100/198 | lfm-open-license-v1.0 |

No se dispone de datos de otros modelos abliterados de tamaño comparable en la información proporcionada, por lo que la comparativa se limita a las variantes del mismo autor y al modelo base. Cualquier comparación con modelos de otras familias (p. ej., Llama 3.2 1B, Qwen2.5 1.5B) requeriría ejecutar los mismos benchmarks bajo el mismo protocolo, algo que no se ha hecho en la documentación disponible.

## Limitaciones y advertencias

- Eliminar la dirección de rechazo no elimina el conocimiento subyacente ni los sesgos del modelo base; las respuestas pueden reproducir estereotipos o contenido dañino sin filtro. No hay evaluación de sesgos en la información disponible.
- Riesgo de alucinación: no se han publicado métricas de fidelidad factual ni de tasa de alucinación. La abliteración puede alterar el comportamiento del modo thinking y, con ello, la calidad del razonamiento en dominios no evaluados.
- Los benchmarks se ejecutaron una sola vez por modelo; el autor señala que cambiar el runtime (transformers vs. llama.cpp) alteró 19 de 200 etiquetas de HarmBench, lo que indica una variabilidad considerable en las evaluaciones de rechazo.
- GPQA Diamond se truncó a 8.192 tokens y unas 50 de 198 preguntas se cortaron y contaron como incorrectas, por lo que la puntuación de 95/198 está infravalorada respecto a una evaluación sin truncamiento.
- HarmBench fue etiquetado por un Qwen3.8-Flash-Next local, no por el clasificador oficial, y solo con prompts en inglés; los resultados no son directamente comparables con los de la literatura que usa el clasificador oficial.
- Idiomas: no hay datos de rendimiento fuera del inglés; el modelo base podría tener capacidades multilingües, pero no están documentadas ni evaluadas.
- Licencia: lfm-open-license-v1.0 (etiquetada como "other"). Es imprescindible revisar el archivo LICENSE del repositorio antes de cualquier uso comercial; las licencias "open" de Liquid AI pueden incluir restricciones de uso, atribución o límites de escala.
- Restricciones legales y de plataforma: un modelo sin mecanismos de rechazo puede vulnerar políticas de uso de proveedores cloud y legislación sobre contenido (por ejemplo, normativa europea de servicios digitales); su despliegue público requiere moderación externa.
- El autor advierte que la eliminación de la dirección se horneó en los pesos con una aproximación (KL 0.0013 frente a la eliminación en generación), por lo que puede haber diferencias residuales de comportamiento entre el safetensors y los GGUF.
- Los GGUF Q8_0 y Q2_K solo se comprobaron cargando y respondiendo una pregunta simple en CPU; no se validaron en los benchmarks, por lo que su calidad no está garantizada.
- El repositorio requiere `trust_remote_code=True` en transformers, lo que implica ejecutar código del autor; conviene auditar el código remoto antes de usarlo en entornos de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rSalone/LFM3-1.7B-uncensored-abl48
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Variante abl38 del mismo autor: https://huggingface.co/rSalone/LFM3-1.7B-uncensored-abl38
- README en japonés: https://huggingface.co/rSalone/LFM3-1.7B-uncensored-abl48/blob/main/README_ja.md
- Licencia: https://huggingface.co/rSalone/LFM3-1.7B-uncensored-abl48/blob/main/LICENSE
- Paper sobre abliteración (arXiv:2406.11717): https://arxiv.org/abs/2406.11717
- Paper sobre refusal directions (arXiv:2402.04249): https://arxiv.org/abs/2402.04249
- Paper sobre evaluación de seguridad (arXiv:2110.14168): https://arxiv.org/abs/2110.14168
- Paper sobre benchmarks de razonamiento (arXiv:2311.12022): https://arxiv.org/abs/2311.12022
- llama.cpp: https://github.com/ggml-org/llama.cpp
