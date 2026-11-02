# saidutta69/Yi-1.5-6B-Chat-heretic-ara

## Resumen

Yi-1.5-6B-Chat-heretic-ara es una variante "descensurada" del modelo conversacional bilingüe 01-ai/Yi-1.5-6B-Chat, publicada por el usuario saidutta69. No se trata de un fine-tune nuevo, sino de una edición de pesos dirigida mediante Arbitrary-Rank Ablation (ARA) con la herramienta Heretic v2.0.0, que localiza y elimina las direcciones de pesos responsables del comportamiento de rechazo. El resultado conserva en gran medida el conocimiento y las capacidades del modelo base, pero responde de forma directa a peticiones que el original rechazaría.

El modelo mantiene la arquitectura y el tamaño del Yi-1.5-6B-Chat original: 6.061.035.520 parámetros en precisión BF16, contexto de 4K tokens y soporte para inglés y chino. La licencia Apache-2.0 del modelo base se hereda, lo que permite uso comercial sin restricciones adicionales por parte del derivado.

Su relevancia actual radica en que ofrece un asistente local compacto y sin filtrado de seguridad incorporado, distribuido también en cinco cuantizaciones GGUF listas para llama.cpp, Ollama, LM Studio o Jan. Es una opción para desarrolladores que necesitan instrucciones seguidas sin rechazos en entornos controlados, asumiendo la responsabilidad de moderar la salida por su cuenta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Yi-1.5, derivado del base 01-ai/Yi-1.5-6B-Chat) |
| Parametros totales | 6.061.035.520 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4K tokens |
| Tipos de cuantizacion | BF16 (safetensors), GGUF F16, Q4_K_M, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (3 shards), GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 6.061 millones de parámetros que hereda íntegramente la arquitectura de Yi-1.5-6B-Chat. No se ha realizado ningún entrenamiento adicional ni fine-tuning: la modificación consiste en una abliteración de rango arbitrario (ARA) aplicada con Heretic 2.0.0 sobre las capas 5 a 26, con los parámetros `preserve_good_behavior_weight` = 0.6319, `steer_bad_behavior_weight` = 0.0001, `overcorrect_relative_weight` = 0.2067 y `neighbor_count` = 13. La intervención busca las direcciones de pesos asociadas al rechazo y las edita, en lugar de sobreescribir el comportamiento con un nuevo conjunto de datos.

La reproducibilidad está documentada: se trata del ensayo 61 de 200 con semilla RNG `3082009981`, y los materiales de reproducción están en el directorio `reproduce/` del repositorio. La divergencia KL respecto al modelo base es de 0.0169, lo que indica que la distribución de salida se mantiene próxima a la original fuera de las respuestas de rechazo. El proceso de abliteración se ejecutó en una NVIDIA RTX A6000 con 47,40 GB de VRAM, CUDA 13.2 y PyTorch 2.15.0.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y chino.
- Seguimiento de instrucciones sin rechazos: el harness de 100 prompts adversarios baja de 87 rechazos en el base a 9 en este modelo.
- Generación de código y tareas de razonamiento general heredadas del Yi-1.5-6B-Chat.
- Plantilla de chat compatible con `apply_chat_template` de transformers.
- Despliegue en llama.cpp, Ollama, LM Studio, Jan, vLLM y SGLang según la model card.
- Compatibilidad con endpoints de text-generation-inference.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Asistente local sin filtrado: ejecutado con `llama serve -hf saidutta69/Yi-1.5-6B-Chat-heretic-ara:Q4_K_M` en un equipo de sobremesa, responde a consultas técnicas y creativas sin las negativas del modelo base, adecuado para prototipado personal.
- Generación de código en pipelines internos: el modelo produce fragmentos de Python y otras funciones directamente, sin rechazos ante peticiones de código sensible, integrándose en herramientas de desarrollo locales.
- Aplicaciones bilingües inglés-chino: al conservar el soporte de ambos idiomas del Yi-1.5, sirve para traducción y atención al cliente en mercados con esas dos lenguas.
- Investigación sobre alineación y seguridad: permite estudiar el efecto de la abliteración comparando respuestas con el modelo base, con la divergencia KL de 0.0169 como referencia cuantitativa.
- Evaluación de robustez de filtros: útil para probar sistemas de moderación externos frente a un generador que no rechaza, midiendo la eficacia de capas de seguridad añadidas.
- Despliegue en hardware de consumo: las cuantizaciones Q4_K_M (3,67 GB) y Q5_K_M (4,30 GB) caben en GPUs consumer y permiten asistentes offline en portátiles con 8 GB de VRAM.
- Generación creativa sin restricciones: escritura de ficción o guiones donde el modelo base aplicaría negativas por contenido sensible, siempre en entornos privados y controlados.

## Benchmarks y rendimiento

| Metrica | Este modelo | Yi-1.5-6B-Chat (base) |
|---|---|---|
| Rechazos (de 100 prompts adversarios) | 9 | 87 |
| Divergencia KL respecto al base | 0.0169 | 0 (por definición) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 12 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda 16 GB o más.
- VRAM estimada por cuantización GGUF: Q4_K_M ~4 GB, Q5_K_M ~5 GB, Q6_K ~5,5 GB, Q8_0 ~7 GB, F16 ~13 GB.
- GPU recomendadas: A100 o H100 para BF16 y servicio concurrente; RTX 4090 (24 GB) para BF16 con holgura; RTX 3090/4080 para Q8_0; RTX 3060 12 GB o similar para Q5_K_M y Q4_K_M.
- Cabe en GPU consumer: sí, con Q4_K_M y Q5_K_M en tarjetas de 8 GB o más; Q8_0 requiere 12 GB o más.
- Opciones de despliegue: llama.cpp (`llama serve`), Ollama, LM Studio, Jan, vLLM, SGLang y transformers con `device_map="auto"`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Yi-1.5-6B-Chat-heretic-ara | 6,06 B | 4K | en, zh | Apache-2.0 | Abliterado con ARA; 9/100 rechazos |
| 01-ai/Yi-1.5-6B-Chat | 6,06 B | 4K | en, zh | Apache-2.0 | Modelo base; 87/100 rechazos |
| saidutta69/Yi-1.5-9B-Chat-16K-heretic | no disponible | 16K | en, zh | no disponible | Hermano mayor de la misma colección |
| Alternativas abliteradas de 7-8 B (p. ej. variantes de Llama/Mistral) | ~7-8 B | variable | variable | variable | No se dispone de datos concretos en la información proporcionada |

## Limitaciones y advertencias

- El modelo cumple deliberadamente peticiones que el base rechazaría, incluidas algunas que no debería; no hay filtrado de seguridad superpuesto.
- Riesgo elevado de generar contenido dañino, ilegal o sesgado; no debe exponerse en endpoints públicos sin moderación externa.
- Riesgo de alucinación heredado del modelo base, sin mitigación adicional.
- Contexto limitado a 4K tokens, insuficiente para documentos largos o conversaciones extensas.
- Soporte únicamente de inglés y chino; el rendimiento en castellano no está documentado y probablemente sea deficiente.
- La licencia Apache-2.0 permite uso comercial, pero la responsabilidad legal y ética del contenido generado recae en el desplegador.
- Modelo con 0 descargas y 0 likes en el momento de la ficha; no ha pasado por validación comunitaria extensa.
- Los datos de rendimiento proceden del harness del propio autor; no hay evaluación independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/saidutta69/Yi-1.5-6B-Chat-heretic-ara
- Modelo base: https://huggingface.co/01-ai/Yi-1.5-6B-Chat
- Repositorio Heretic: https://github.com/p-e-w/heretic
- Artículo sobre abliteración: https://huggingface.co/blog/mlabonne/abliteration
- Colección de modelos heretic del autor: https://huggingface.co/collections/saidutta69/racer-is-op-heretic-models
- Modelo hermano Yi-1.5-9B-Chat-16K-heretic: https://huggingface.co/saidutta69/Yi-1.5-9B-Chat-16K-heretic
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
