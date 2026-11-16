# fnjerry/MiniCPM5-2B-heretic-abliterated-GGUF

## Resumen

MiniCPM5-2B-heretic-abliterated-GGUF es una compilación de cuantizaciones GGUF del modelo base openbmb/MiniCPM5-2B, publicada por el usuario fnjerry. El modelo original lo desarrolla OpenBMB (ModelBest y la Universidad de Tsinghua) y esta orientado a inferencia en dispositivo (on-device) y en el borde (edge). Esta versión concreta aplica una ablación direccional de la negativa (refusal ablation) mediante la herramienta Heretic v1.4.0, siguiendo la metodología del checkpoint insraq/MiniCPM5-2B-heretic-abliterated, con el objetivo de eliminar el reflejo de rechazo del modelo alineado sin degradar sus capacidades de razonamiento, matemáticas y código.

El modelo tiene 2.516.756.480 parámetros totales (aproximadamente 2,5 mil millones) y se distribuye en seis cuantizaciones GGUF que van desde 1,29 GB (Q3_K_M) hasta 2,68 GB (Q8_0). Esta pensado para ejecutarse en llama.cpp, Ollama, LM Studio, Jan y otros ejecutores GGUF estándar, lo que lo hace adecuado para hardware de consumo y nodos de cómputo reducido.

La relevancia de esta ficha radica en que combina dos tendencias: por un lado, los modelos pequeños optimizados para el borde, y por otro, las variantes "abliterated" que eliminan los mecanismos de rechazo del alineamiento. El autor reporta una tasa de rechazo de 5 sobre 100 frente a 99 sobre 100 del modelo base, con una divergencia KL de 0,0391 respecto a los pesos originales, lo que sugiere una deriva representacional baja.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base MiniCPM5-2B); detalles de atención y capas no disponibles |
| Parametros totales | 2.516.756.480 (aprox. 2,5 mil millones) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de llama.cpp usa -c 4096) |
| Tipos de cuantizacion | Q3_K_M, Q4_K_S, Q4_K_M, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 10,9 GB con todas las cuantizaciones) |

## Arquitectura y entrenamiento

El modelo base es openbmb/MiniCPM5-2B, un transformer de aproximadamente 2,5 mil millones de parámetros. La información disponible no detalla la composición del dataset de entrenamiento, el número de tokens ni si se aplicaron técnicas de RLHF o DPO en el modelo original. Tampoco se especifican innovaciones arquitectónicas concretas (atención lineal, decodificación especulativa, etc.) más allá de lo que corresponde a la familia MiniCPM5.

La modificación principal de esta variante es la ablación direccional del rechazo aplicada con Heretic v1.4.0. Según la model card, esta técnica neutraliza el reflejo de negativa a lo largo del flujo residual y de las proyecciones MLP. Los parámetros de ablación reportados incluyen pesos máximos y mínimos por capa para `attn.o_proj` (max_weight 1,47; min_weight 1,45; max_weight_position 29,44; min_weight_distance 14,36) y para `mlp.down_proj` (max_weight 0,89; min_weight 0,66; max_weight_position 28,68; min_weight_distance 20,31), con `direction_index` configurado por capa. El autor afirma que esta intervención preserva el rendimiento matemático, de código y de razonamiento multi-paso del modelo base.

## Capacidades

- Generación de texto conversacional con plantilla ChatML (`<|im_start|>...<|im_end|>`).
- Razonamiento matemático y de múltiples pasos, según declara el autor de la ablación.
- Generación y explicación de código (el ejemplo de la model card aborda desbordamientos de buffer a nivel de registro).
- Respuestas sin rechazo ante peticiones que el modelo alineado original rechazaría (tasa de rechazo reportada de 5/100).
- Capacidades multilingües limitadas a inglés y chino.
- Compatibilidad con ejecutores GGUF estándar (llama.cpp, Ollama, LM Studio, Jan).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso autónomo: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles (el pipeline es text-generation).

## Casos de uso

- Inferencia en dispositivo de borde: con cuantizaciones de 1,29 a 1,56 GB (Q3_K_M a Q4_K_M), el modelo cabe en dispositivos con poca RAM y permite asistentes locales sin conexión, lo que encaja con la orientación edge-ai del repositorio.
- Asistentes conversacionales sin filtros: la ablación reduce la tasa de rechazo al 5 %, de modo que resulta útil para prototipos de chat donde se necesita explorar respuestas sobre temas sensibles sin bloqueos, siempre con revisión humana.
- Educación en seguridad informática: el ejemplo de la model card sobre desbordamientos de buffer sugiere su uso para explicar conceptos técnicos de bajo nivel que otros modelos alineados podrían rechazar.
- Generación de código en local: al ejecutarse en llama.cpp con cuantización Q4_K_M, puede integrarse en editores o scripts de automatización de tareas de programación en máquinas sin GPU dedicada.
- Traducción y procesamiento bilingüe inglés-chino: los idiomas declarados permiten tareas de traducción o resumen entre ambos idiomas en entornos locales.
- Pruebas de robustez y evaluación de alineamiento: la diferencia de tasa de rechazo y la divergencia KL de 0,0391 lo convierten en un caso de estudio para investigar cómo la ablación afecta al comportamiento del modelo sin degradar tareas estándar.
- Despliegue en contenedores ligeros: el tamaño reducido (hasta 2,68 GB en Q8_0) facilita su inclusión en imágenes Docker o servicios serverless con límites de memoria estrictos.

## Benchmarks y rendimiento

| Metrica | Modelo abliterated | Base original (openbmb/MiniCPM5-2B) |
|---|---|---|
| Tasa de rechazo | 5 / 100 | 99 / 100 |
| Divergencia KL | 0,0391 | 0,0000 (referencia) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 1,3 GB (Q3_K_M), 1,5 GB (Q4_K_S), 1,56 GB (Q4_K_M), 1,81 GB (Q5_K_M), 2,07 GB (Q6_K) y 2,68 GB (Q8_0), sin contar el overhead del contexto y del runtime.
- GPU recomendadas: no disponibles de forma específica; por tamaño, cualquier GPU de consumo con 4 GB o más de VRAM es suficiente. No se detallan modelos como A100, H100 o RTX 4090 en la información.
- Cabe en GPU de consumo: sí, en la práctica totalidad de tarjetas con 4 GB o más; también en CPU y en dispositivos de borde.
- Opciones de despliegue: llama.cpp (`llama-cli`), Ollama, LM Studio, Jan y ejecutores GGUF estándar.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| fnjerry/MiniCPM5-2B-heretic-abliterated-GGUF | 2,5 B | no disponible | Apache 2.0 | GGUF | Variante sin rechazo, cuantizaciones de 1,29 a 2,68 GB |
| openbmb/MiniCPM5-2B | 2,5 B | no disponible | Apache 2.0 | safetensors (base) | Modelo original alineado, tasa de rechazo 99/100 |
| insraq/MiniCPM5-2B-heretic-abliterated | 2,5 B | no disponible | no disponible | no disponible | Checkpoint de referencia de la metodología de ablación |
| Alternativas de ~2-3 B (p. ej. Qwen2.5-1.5B, Gemma-2-2B) | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- La ablación elimina el mecanismo de rechazo, por lo que el modelo puede generar contenido dañino, ilegal o inseguro sin advertencia; requiere supervisión humana y filtros externos en producción.
- Riesgo de alucinación inherente a un modelo de 2,5 B; no se han publicado evaluaciones de fidelidad factual.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está documentado y probablemente sea deficiente.
- La longitud de contexto no se especifica; el ejemplo de llama.cpp usa 4096 tokens, pero no debe asumirse como máximo oficial.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo abliterated ni sobre su idoneidad para aplicaciones reguladas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (2026-11-16), por lo que no cuenta con validación de la comunidad.
- La model card no detalla la composición del dataset de entrenamiento ni los datos de alineamiento del modelo base, lo que limita la evaluación de sesgos.
- No se dispone de información sobre tool calling, agentes o modo thinking; no deben asumirse estas capacidades.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fnjerry/MiniCPM5-2B-heretic-abliterated-GGUF
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Checkpoint de referencia de la ablación: https://huggingface.co/insraq/MiniCPM5-2B-heretic-abliterated
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Heretic (herramienta de ablación): no se proporciona URL en la información disponible.
