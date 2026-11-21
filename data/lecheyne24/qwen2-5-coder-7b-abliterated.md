# lecheyne24/qwen2.5-coder-7b-abliterated

## Resumen

`lecheyne24/qwen2.5-coder-7b-abliterated` es una versión "abliterated" (sin mecanismos de rechazo) del modelo `Qwen/Qwen2.5-Coder-7B-Instruct` de Alibaba, publicada por el usuario lecheyne24 en Hugging Face. El autor aplica una técnica de ablación de dirección de rechazo sobre los pesos del modelo original y distribuye el resultado en formato GGUF con cuantización Q4_K_M, listo para su uso con llama.cpp. El modelo base es un transformer decoder-only de 7.615.616.512 parámetros (aproximadamente 7,6 mil millones) especializado en generación de código.

La relevancia de esta ficha es doble. Por un lado, documenta una técnica concreta de modificación de pesos (ablación de dirección de rechazo mediante biproyección de rango 1 con preservación de norma sobre `o_proj` y `down_proj`, con alpha 1,25 aplicado a todas las capas). Por otro, sirve como ejemplo de los riesgos y limitaciones de las variantes "uncensored": el autor no publica información sobre licencia, idiomas soportados ni evaluación de capacidades más allá de un test cualitativo interno de 8 preguntas.

El modelo se distribuye únicamente como GGUF cuantizado en Q4_K_M (dos ficheros: uno con el nombre canónico y otro con el sufijo "unbound"), con un tamaño de repositorio de 9,4 GB. No hay pesos en safetensors ni versiones en otras cuantizaciones publicadas por este autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-Coder-7B-Instruct) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el ejemplo de ejecución usa `-c 4096` |
| Tipos de cuantizacion | Q4_K_M (unica publicada) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen2.5-Coder-7B-Instruct: un transformer decoder-only denso con atención por ventanas deslizantes combinada con atención completa en capas alternas, mecanismo GQA (grouped query attention) y embeddings RoPE. No se dispone de información detallada en la model card sobre el número de capas, dimensión oculta o número de cabezas; esos datos deben consultarse en la ficha del modelo base de Qwen.

La modificación aplicada por lecheyne24 es una ablación de la dirección de rechazo mediante "rank-1 norm-preserving biprojection" sobre las proyecciones `o_proj` (atención de salida) y `down_proj` (MLP descendente) en todas las capas, con un factor alpha de 1,25. Esta técnica estima una dirección en el espacio de activaciones asociada a las respuestas de rechazo y la resta de forma controlada, preservando la norma de los pesos para minimizar el daño colateral en las capacidades del modelo. El autor reporta un resultado de 8/8 en un "plain-answer gauntlet" interno, un test cualitativo de 8 preguntas sin metodología publicada. No hay información sobre datos de entrenamiento adicionales, RLHF, DPO ni fine-tuning posterior a la ablación.

## Capacidades

- Generación de texto y código: hereda las capacidades del Qwen2.5-Coder-7B-Instruct, orientado a tareas de programación, explicación de código y generación de fragmentos.
- Razonamiento sobre código: el modelo base está entrenado para resolver problemas de programación y explicar lógica de algoritmos.
- Conversación multi-turno: el formato GGUF y la etiqueta `conversational` indican soporte de chat, aunque no se detalla la plantilla de chat en la model card.
- Modo "uncensored": la ablación elimina parte de los mecanismos de rechazo del modelo original, lo que en teoría permite respuestas a peticiones que el modelo base rechazaría.
- Tool calling / function calling: no disponible en la información proporcionada para esta variante; el modelo base Qwen2.5-Coder-Instruct sí lo soporta, pero la ablación puede afectar a su fiabilidad.
- Capacidades de agente y razonamiento multi-paso: no verificadas en esta variante; no hay evaluación publicada.
- Capacidades multilingües: no disponibles; el modelo base soporta múltiples idiomas, pero esta variante no documenta ninguno.
- Capacidades especiales (visión, audio, thinking mode): no disponibles.

## Casos de uso

- Generación de código en local con llama.cpp: el fichero GGUF Q4_K_M permite ejecutar el modelo en una estación de trabajo sin GPU dedicada de gama alta, usando `llama-server` con una ventana de 4096 tokens. Adecuado para prototipado rápido y entornos sin acceso a la nube.
- Asistente de programación en IDE con backend local: integrable mediante la API compatible con OpenAI que expone `llama-server`, permitiendo autocompletado y explicación de código sin enviar datos a terceros.
- Investigación sobre alineación y mecanismos de rechazo: la técnica de ablación documentada (biprojección de rango 1 sobre `o_proj` y `down_proj`) sirve como caso de estudio reproducible para estudiar cómo se distribuye la negativa a responder en los pesos de un modelo.
- Evaluación de robustez de filtros de seguridad: útil para equipos que quieran probar si sus pipelines de moderación detectan contenido generado por modelos sin rechazo, en un entorno controlado.
- Generación de documentación técnica y comentarios de código: tareas de bajo riesgo donde la ausencia de rechazos no supone un problema y el tamaño de 7B permite respuestas rápidas en CPU.
- Fine-tuning posterior sobre dominio específico: al ser un modelo pequeño y con pesos GGUF, puede servir como base para experimentos de adaptación, aunque requeriría de-cuantizar o partir del modelo base original para entrenamiento.
- Despliegue en entornos air-gapped: al no depender de servicios externos y caber en 9,4 GB de disco, es viable en máquinas aisladas para tareas de generación de código internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato reportado por el autor es un "plain-answer gauntlet" de 8/8, un test cualitativo interno sin metodología, conjunto de preguntas ni criterios de evaluación publicados. No se debe interpretar como una métrica comparable a MMLU, HumanEval o GSM8K.

| Benchmark | Resultado | Notas |
|---|---|---|
| Plain-answer gauntlet (interno) | 8/8 | Test cualitativo del autor, sin metodología publicada |
| MMLU | no disponible | — |
| HumanEval | no disponible | — |
| GSM8K | no disponible | — |

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero Q4_K_M ocupa aproximadamente 4,5-5 GB en disco y requiere un tamaño similar de memoria al cargarse; con overhead de contexto de 4096 tokens, se estiman entre 5 y 6 GB de VRAM/RAM.
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM (RTX 3060 Ti, RTX 4060, RTX 3070, RTX 4070) puede ejecutar el modelo con comodidad. Para mayor throughput, RTX 4090, A100 o H100.
- Cabe en GPU de consumo: sí, en modelos con 8 GB o más de VRAM. También es viable en CPU con suficiente RAM (16 GB recomendados).
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-cli`), y por extensión cualquier frontend compatible con GGUF (LM Studio, Ollama si se importa el fichero, text-generation-webui). No se distribuyen pesos en safetensors, por lo que vLLM y TGI no son opciones directas sin conversión.
- Latencia y throughput estimados: no disponibles. El autor no publica mediciones. En CPU, un modelo de 7B en Q4_K_M suele generar del orden de 5-15 tokens por segundo en hardware moderno; en GPU de consumo, decenas de tokens por segundo. Estas cifras son orientativas y no proceden de la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato disponible | Licencia | Notas |
|---|---|---|---|---|---|
| lecheyne24/qwen2.5-coder-7b-abliterated | 7,6B | no disponible (ejemplo con 4096) | GGUF Q4_K_M | no disponible | Variante abliterated del Qwen2.5-Coder-7B-Instruct |
| Qwen/Qwen2.5-Coder-7B-Instruct | 7,6B | 32.768 tokens (según ficha del modelo base) | safetensors, GGUF | Apache 2.0 (según ficha del modelo base) | Modelo original, con rechazos y evaluación publicada |
| Otras variantes abliterated de Qwen2.5-Coder-7B | ~7,6B | variable | GGUF, safetensors | variable | Existen múltiples builds comunitarias con técnicas y cuantizaciones distintas |
| Modelos de código de 7B comparables (p. ej. CodeLlama-7B-Instruct) | ~6,7B | 16.384 tokens | safetensors, GGUF | Llama 2 Community License | Alternativa de Meta, con restricciones de licencia para uso comercial |

## Limitaciones y advertencias

- Licencia no disponible: el autor no especifica licencia para esta variante. Aunque el modelo base Qwen2.5-Coder-7B-Instruct se distribuye bajo Apache 2.0, la modificación de pesos y la ausencia de licencia explícita generan incertidumbre legal para uso comercial. Conviene contactar con el autor o consultar la licencia del modelo base antes de desplegar en producción.
- Sesgos conocidos: no documentados. La ablación de rechazo puede alterar el comportamiento del modelo en dominios sensibles y no hay evaluación de sesgos publicada.
- Riesgo de alucinación: no evaluado en esta variante. La modificación de pesos puede degradar la calibración del modelo base; no hay benchmarks que lo confirmen.
- Eliminación de mecanismos de rechazo: el modelo está diseñado explícitamente para no rechazar peticiones. Esto lo hace inadecuado para aplicaciones de cara al público sin capas adicionales de moderación y filtrado.
- Limitaciones de contexto: la model card no documenta la longitud de contexto soportada; el ejemplo de ejecución usa 4096 tokens, muy por debajo de los 32.768 del modelo base, lo que sugiere que el autor no ha validado contextos largos.
- Idiomas: no documentados. No se puede asumir el multilingüismo del modelo base sin verificación.
- Calidad de la cuantización: solo se publica Q4_K_M; no hay versiones Q5, Q6, Q8 ni FP16 para comparar la pérdida de calidad introducida por la cuantización.
- Test de evaluación no reproducible: el "8/8" del gauntlet interno carece de preguntas, criterios y metodología, por lo que no es una evidencia sólida de calidad.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusión comunitaria que permita validar el comportamiento del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lecheyne24/qwen2.5-coder-7b-abliterated
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Documentación de Qwen2.5-Coder: https://qwenlm.github.io/blog/qwen2.5-coder/
