# agentic-underground/qwen3-0.6b-to-32b-bridge

## Resumen

El modelo `agentic-underground/qwen3-0.6b-to-32b-bridge` no es un modelo de lenguaje en sentido estricto, sino un puente KV (KV bridge) entrenado para transferir el estado interno de Qwen3-0.6B al espacio de claves y valores que Qwen3-32B habría construido al leer el mismo prompt. Lo desarrolla el colectivo agentic-underground aplicando el método LatentPort de Simon Villani (arXiv:2609.25053), y se publica bajo licencia Apache-2.0 con un peso de 546 MB en formato safetensors.

El problema que aborda es el coste de prefill en modelos grandes: en lugar de que el 32B procese el prompt completo, el 0.6B lo lee y el puente traduce su flujo residual a la memoria KV del 32B, que después responde leyendo un único token del prompt. Según la model card, esto reduce el tiempo hasta el primer token entre 4,21× (prompts de ~256 tokens) y 7,17× (~1024 tokens) frente a que el 32B lea el prompt directamente.

Es relevante ahora porque demuestra empíricamente que se puede cerrar buena parte de la brecha de calidad entre un modelo donante pequeño y un receptor 54 veces mayor: el puente alcanza un ratio de cierre nativo (NCR) de 0,866, aunque el autor reconoce explícitamente que no cumple su propio umbral de calidad (6 de 7 preguntas retenidas correctas frente a 7 de 7 del 32B nativo).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Puente KV sobre transformer denso (Qwen3); mapas ridge por capa más corrección residual de rango 4 |
| Parametros totales | No aplica (el fichero contiene mapas lineales, no pesos de un LLM); 546 MB en safetensors |
| Parametros activos | No aplica |
| Longitud de contexto | No disponible (depende del contexto de Qwen3-32B receptor) |
| Tipos de cuantizacion | El puente se usa con el 32B cuantizado a Q4K en capas lineales; el propio fichero mezcla f16 y f32 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`qwen3-0.6b-to-32b.safetensors`, sin `__metadata__`) |

## Arquitectura y entrenamiento

El puente se compone de dos piezas. Primero, mapas ridge en forma cerrada (λ = 10⁻³), uno por capa objetivo para claves y otro para valores, que leen el flujo residual de Qwen3-0.6B en dos puntos de extracción y lo proyectan a las claves y valores de Qwen3-32B. Se ajustaron sobre 50.010 filas de respuestas de hasta 192 tokens, con R² entre 0,60 y 0,92 para claves y entre 0,40 y 0,87 para valores, siendo más bajo en las capas profundas. Segundo, la corrección residual de rango 4 propuesta en el paper, entrenada a través del 32B congelado en Q4K contra su propia distribución nativa (451 preguntas, 3 épocas, pérdida de 0,254 a 0,101), plegada en el fichero como `I + BUᵀ`.

Los modelos base son Qwen3-0.6B (28 capas, ancho oculto 1024, 8 cabezas KV × 128) y Qwen3-32B (64 capas, ancho oculto 5120, 8 cabezas KV × 128), ambos Apache-2.0 y fijados a revisiones concretas. Los prompts usan la plantilla de chat de Qwen3 con el modo thinking desactivado. El tensor `layer_of` indica qué capa del 0.6B alimenta cada capa del 32B. El fichero no contiene pesos de ninguno de los dos modelos: hay que descargarlos por separado desde Qwen.

## Capacidades

- Transferencia de estado KV entre un donante pequeño (Qwen3-0.6B) y un receptor grande (Qwen3-32B) sin que el receptor procese el prompt.
- Aceleración del prefill: reduce el tiempo hasta el primer token frente a la lectura nativa del prompt por parte del 32B.
- Generación de respuestas por parte del 32B a partir de la memoria puenteada, con una sola pasada sobre un token del prompt.
- Cierre parcial de la brecha de calidad entre donante y receptor (NCR de 0,866 con la corrección aprendida).
- No soporta tool calling, agentes, visión ni audio por sí mismo; esas capacidades dependerían del modelo receptor.
- No es un modelo `transformers`: se consume mediante la implementación en Rust `prattle_core::bridge` del repositorio PrattleNot.

## Casos de uso

- Aceleración de inferencia en producción con prompts largos: desplegar el 0.6B en una GPU y el 32B en otra, usando el puente para evitar el prefill del 32B; la model card reporta 7,17× menos tiempo hasta el primer token con ~1024 tokens.
- Investigación sobre transferencia de estado latente: reproducir los experimentos de LatentPort con el checkout de PrattleNot y los comandos documentados para validar NCR y speed-up.
- Evaluación de arquitecturas de puente KV: usar este fichero como referencia para comparar mapas ridge solos (NCR 0,794) frente a mapas más corrección aprendida (NCR 0,866).
- Prototipado de pipelines de bajo coste en dos GPUs de consumo: el setup documentado usa dos RTX 3090, una con el 0.6B en bf16 y otra con el 32B en Q4K.
- Estudio de robustez frente a donantes incorrectos: la model card reporta un NCR de 0,197 cuando la memoria proviene de una pregunta equivocada, útil como línea base de degradación.
- Docencia y divulgación sobre mecanismos de atención y caché KV: el fichero es pequeño (546 MB) y sus tensores están documentados por rol y capa.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| NCR con mapas ridge solos | 0,794 |
| NCR con corrección aprendida | 0,866 |
| NCR desde un donante incorrecto | 0,197 |
| Preguntas retenidas correctas (puenteado) | 6 de 7 |
| Preguntas retenidas correctas (32B nativo) | 7 de 7 |
| Preguntas retenidas correctas (0.6B solo) | 7 de 7 |
| Pérdida por token del 32B sobre su propia respuesta (leyendo todo) | 0,188 |
| Pérdida por token del 32B sobre su propia respuesta (puenteado) | 0,410 |
| Pérdida por token del 32B sobre su propia respuesta (sin leer nada) | 1,844 |
| Pérdida por token del 32B sobre su propia respuesta (memoria de pregunta incorrecta) | 1,518 |
| Speed-up tiempo hasta primer token, ~256 tokens | 4,21× (IC 95%: 4,19–4,23); techo 11,60× |
| Speed-up tiempo hasta primer token, ~1024 tokens | 7,17× (IC 95%: 7,11–7,24); techo 14,33× |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Las métricas anteriores son las reportadas por el autor en la model card.

## Requisitos de hardware

- VRAM estimada: el puente ocupa 546 MB; hay que sumar la del 0.6B en bf16 (aproximadamente 1,2 GB) y la del 32B en Q4K (aproximadamente 18–20 GB).
- GPU recomendadas: el setup validado son dos RTX 3090, una para el donante y otra para el receptor.
- Cabe en GPU de consumo: sí, con dos RTX 3090; con una sola GPU de 24 GB habría que alojar ambos modelos en el mismo dispositivo, lo que no está documentado.
- Opciones de despliegue: `prattle_core::bridge` de PrattleNot (Rust) con los binarios `just speedup` y `just bridge-fit-super-1`; no es compatible con vLLM, llama.cpp, Ollama ni TGI de forma nativa.
- Latencia y throughput: el tiempo hasta el primer token mejora 4,21× con ~256 tokens y 7,17× con ~1024 tokens; a ~2048 tokens el 32B nativo agota la memoria en ese runtime y no hay cifra.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-0.6b-to-32b-bridge | No aplica (546 MB de mapas) | Depende del 32B | Puente KV entre donante y receptor | Apache-2.0 | Hugging Face |
| Qwen3-32B | 32B | No disponible en la información | LLM denso nativo | Apache-2.0 | Hugging Face |
| Qwen3-0.6B | 0,6B | No disponible en la información | LLM denso nativo | Apache-2.0 | Hugging Face |
| LatentPort (método) | No aplica | No aplica | Método de puente KV | No disponible en detalle | GitHub, paper |

No se dispone de otros puentes KV comparables en la información proporcionada.

## Limitaciones y advertencias

- No alcanza el umbral de calidad del autor: 6 de 7 preguntas retenidas correctas frente a 7 de 7 del 32B nativo; el fallo documentado es no nombrar el CO₂ al preguntar qué gas respiran las plantas.
- Está ajustado específicamente contra Qwen3-32B cuantizado a Q4K; usarlo con otra cuantización o en bf16 invalida las métricas reportadas.
- Depende de un runtime concreto (PrattleNot en Rust) y no es un modelo `transformers` estándar.
- El NCR es un ratio de pérdida, no una tasa de coincidencia de tokens; no debe interpretarse como precisión.
- Con memoria de una pregunta incorrecta el NCR cae a 0,197, lo que indica sensibilidad al contenido del donante.
- No hay información sobre sesgos, idiomas soportados ni riesgos de alucinación específicos del puente.
- La licencia Apache-2.0 aplica al fichero, pero PrattleNot es obra derivada de LatentPort y puede arrastrar condiciones adicionales del proyecto original.
- Uso comercial: la licencia lo permite, pero la madurez del proyecto (0 descargas, 0 likes, refit en curso) desaconseja producción sin validación propia.

## Enlaces

- Hugging Face: https://huggingface.co/agentic-underground/qwen3-0.6b-to-32b-bridge
- Paper LatentPort: https://huggingface.co/papers/2609.25053
- Sitio de LatentPort: https://latentport.com/
- Repositorio LatentPort: https://github.com/LatentPort/latentport
- Repositorio PrattleNot: https://github.com/agentic-underground/PrattleNot
- Documentación del puente: https://github.com/agentic-underground/PrattleNot/blob/main/documents/BRIDGE.md
- Guía de reproducción: https://github.com/agentic-underground/PrattleNot/blob/main/documents/REPRODUCTION.md
- Corpus de calibración: https://github.com/agentic-underground/PrattleNot/blob/main/crates/core/src/bridge_corpus.rs
- Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Qwen3-32B: https://huggingface.co/Qwen/Qwen3-32B
