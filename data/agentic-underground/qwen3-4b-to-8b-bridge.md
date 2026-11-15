# agentic-underground/qwen3-4b-to-8b-bridge

## Resumen
El Qwen3-4B → Qwen3-8B bridge es un artefacto de investigación publicado por agentic-underground que implementa el método LatentPort de Simon Villani sobre la familia Qwen3. No es un modelo de lenguaje en sentido estricto: es un conjunto de matrices que traduce el estado interno (residual stream) que Qwen3-4B construye al leer un prompt hacia la memoria clave/valor (KV cache) que Qwen3-8B habría generado por sí mismo. El 8B responde a partir de esa memoria traducida leyendo únicamente un token del prompt.

El problema que aborda es el coste de la primera fase de inferencia en arquitecturas transformer: el prefill. Si un modelo pequeño puede procesar el contexto y un modelo mayor reutilizar ese trabajo mediante una traducción barata de su KV cache, el tiempo hasta el primer token del modelo grande se reduce sin reentrenarlo. La ficha reporta una mejora de 1,12× frente al 8B leyendo el prompt completo, sobre un techo teórico de 1,61× medido en el mismo entorno.

Técnicamente el artefacto ocupa 760 MB, se distribuye en safetensors y contiene regresiones ridge por capa más una corrección residual de rango 4 aprendida a través del 8B congelado. No contiene pesos de ninguno de los dos modelos base, que deben descargarse por separado desde Qwen. La licencia es Apache-2.0 y el repositorio tiene, en el momento de la consulta, cero descargas y cero likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Puente KV entre dos transformers densos (Qwen3-4B como donante, Qwen3-8B como receptor); regresiones ridge por capa más corrección residual de rango 4 |
| Parametros totales | No aplica: el artefacto no es un modelo; el fichero pesa 760 MB (tamaño del repo 0,8 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible como spec del puente; los prompts de evaluación son de ~256 tokens y el ajuste usó respuestas de hasta 192 tokens |
| Tipos de cuantizacion | No disponible; los tensores se almacenan en f16 (`k.<l>`, `v.<l>`) y f32 (`ck.<l>`, `cv.<l>`) |
| Idiomas soportados | No disponibles (heredados de Qwen3-4B y Qwen3-8B; no se documentan en la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`qwen3-4b-to-8b.safetensors`, sin `__metadata__`) |

## Arquitectura y entrenamiento
El puente se construye en dos etapas sobre los modelos base Qwen/Qwen3-4B (commit `1cfa9a7208912126459214e8b04321603b3df60c`) y Qwen/Qwen3-8B (commit `b968826d9c46dd6066d109eabc6255188de91218`), ambos Apache-2.0, con 36 capas y 8 cabezas KV de 128 dimensiones. La anchura oculta es 2560 en el 4B y 4096 en el 8B, y ambos se mantienen en bf16. Los prompts usan la plantilla de chat de Qwen3 con el modo thinking desactivado.

La primera etapa ajusta mapas lineales en forma cerrada: regresiones ridge con λ = 10⁻³, una por capa destino para claves y otra para valores. Cada mapa lee el residual stream del 4B en dos puntos de extracción y produce la clave o el valor correspondiente del 8B; se entrenó sobre 46.319 filas procedentes de respuestas de hasta 192 tokens, con R² entre 0,77 y 0,98 para claves y entre 0,64 y 0,95 para valores. La segunda etapa añade la corrección residual de rango 4 del paper, una por capa destino y rol, entrenada a través del 8B congelado contra la distribución nativa del propio 8B (451 preguntas, 3 épocas, pérdida 0,082 → 0,052 → 0,044) y plegada en el fichero como `I + BUᵀ`. Los datos de calibración son 451 preguntas con plantilla generadas de forma determinista por `crates/core/src/bridge_corpus.rs`; las preguntas de evaluación held-out nunca se usaron en el ajuste. El fichero incluye además el tensor `layer_of`, que indica qué capa del 4B alimenta cada capa del 8B, y `meta`, con las constantes de forma que necesita el lector.

## Capacidades
- Traducción de estado interno: convierte el residual stream de Qwen3-4B en claves y valores utilizables por Qwen3-8B, capa a capa.
- Handoff de un solo token: el 8B genera la respuesta leyendo únicamente un token del prompt, apoyándose en la memoria traducida.
- Reducción del tiempo hasta el primer token del modelo grande (1,12× frente al 8B leyendo el prompt completo en el entorno medido).
- Control negativo verificado: la memoria procedente de una pregunta distinta rinde al nivel de no leer nada (NCR −0,026).
- No implementa tool calling, function calling, agentes, visión, audio ni modo thinking por sí mismo; esas capacidades, si existen, dependen de los modelos Qwen3 subyacentes.
- No es un modelo `transformers`: se consume mediante `prattle_core::bridge` de PrattleNot, escrito en Rust.

## Casos de uso
- Investigación en reutilización de KV cache: sirve como referencia reproducible para estudiar si el estado de un modelo pequeño puede sustituir al prefill de uno grande, con métricas definidas (NCR) y control negativo incluido.
- Aceleración de la primera fase de inferencia en despliegues con dos GPUs: el 4B procesa el contexto en una tarjeta y el 8B genera en la otra a partir de la memoria traducida, reduciendo el tiempo hasta el primer token.
- Enrutado en cascada con modelo pequeño como frontal: el 4B atiende la mayor parte del prompt y solo se invoca el 8B cuando se necesita su calidad, reutilizando el trabajo ya hecho por el 4B.
- Validación de métodos de fusión de estados latentes: el artefacto permite contrastar la formulación ridge más corrección de rango 4 frente a alternativas como destilación o adaptadores, midiendo la pérdida teacher-forced sobre la respuesta nativa del 8B.
- Docencia y divulgación sobre mecánica interna de transformers: los tensores `k.<l>`, `v.<l>` y `layer_of` hacen tangible la correspondencia entre capas y cabezas KV de dos modelos de distinta anchura.
- Reproducción de resultados: el comando documentado con `PRATTLE_DEVICES=cuda:0,cuda:1 just speedup ... 256` permite repetir la medición de latencia en dos RTX 3090 con contadores verificados.

## Benchmarks y rendimiento
Los datos disponibles son métricas del paper (NCR y pérdida teacher-forced), no benchmarks estándar tipo MMLU o HumanEval.

| Metrica | Valor |
|---|---|
| NCR con la corrección aprendida (preguntas held-out) | 0,890 |
| NCR desde un donante incorrecto (control) | −0,026 |
| Respuestas correctas de 7 (puenteado) | 7 (igual que cada modelo por separado) |
| Pérdida del 8B en su propia respuesta, leyendo todo | 0,089 |
| Pérdida del 8B en su propia respuesta, puenteado | 0,291 |
| Pérdida del 8B en su propia respuesta, sin leer nada | 1,923 |
| Pérdida del 8B en su propia respuesta, con memoria de otra pregunta | 1,970 |
| Tiempo hasta el primer token, 8B puenteado vs 8B leyendo el prompt | 1,12× (intervalo 1,12–1,12) |
| Techo en la misma ejecución (8B solo ÷ 4B solo) | 1,61× |
| R² de los mapas ridge (claves) | 0,77–0,98 |
| R² de los mapas ridge (valores) | 0,64–0,95 |

El NCR se define como `(ℓ_empty − ℓ_bridged) / (ℓ_empty − ℓ_native)` según la ecuación 8 del paper arXiv:2609.25053. Es una ratio de pérdida, no una tasa de tokens coincidentes. Las mediciones de latencia se hicieron en dos RTX 3090, el 4B en una y el 8B en la otra, ambos en bf16, con prompts sintéticos de unos 256 tokens, 8 prompts × 3 repeticiones en orden rotado y un token de puente. No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware
- VRAM: el puente en sí ocupa 760 MB; hay que sumar la memoria de Qwen3-4B y Qwen3-8B en bf16, que no se detalla en la model card.
- Configuración medida: dos RTX 3090, con el 4B en `cuda:0` y el 8B en `cuda:1`, ambos en bf16.
- No se documenta si cabe en una única GPU de consumo; con dos modelos de 4B y 8B en bf16 más el puente, una sola tarjeta de 24 GB queda muy ajustada y no hay dato publicado al respecto.
- Despliegue: no es compatible con vLLM, llama.cpp, Ollama ni TGI; requiere PrattleNot y su módulo `prattle_core::bridge` en Rust.
- Latencia: 1,12× más rápido hasta el primer token que el 8B leyendo el prompt, con prompts de ~256 tokens; el techo medido en el mismo entorno es 1,61×. No se publica throughput en tokens por segundo.

## Comparativa con modelos similares
No disponible. La información proporcionada no incluye artefactos comparables de traducción KV entre modelos de la familia Qwen3 ni métricas de otras implementaciones de LatentPort.

| Alternativa | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-4B → Qwen3-8B bridge | No aplica (760 MB) | No disponible | NCR 0,890; 1,12× TTFT | Apache-2.0 | Hugging Face |
| Otras alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias
- No es un modelo autónomo: sin Qwen3-4B y Qwen3-8B descargados por separado no hace nada, y no funciona con `transformers` ni con servidores de inferencia convencionales.
- La mejora de latencia es modesta (1,12×) y está medida con prompts de ~256 tokens en dos RTX 3090; el propio autor señala que el techo es bajo porque ambos modelos cuestan parecido en esas tarjetas.
- El recuento de respuestas correctas (7 de 7) no demuestra ganancia de calidad, solo ausencia de daño; la métrica principal es una ratio de pérdida, no una tasa de acierto.
- El ajuste es sensible a la longitud de las respuestas: un ajuste anterior con respuestas más cortas producía una respuesta inicial correcta en apariencia pero calificada como incorrecta en una de las preguntas.
- La calibración usa 451 preguntas con plantilla generadas de forma determinista, no datos naturales; el comportamiento fuera de ese dominio no está documentado.
- No se documentan sesgos, idiomas soportados ni riesgos de alucinación específicos del puente; hereda los de los modelos Qwen3 subyacentes.
- El repositorio registra cero descargas y cero likes, y no hay pipeline declarado: es un artefacto de investigación sin validación comunitaria.
- La licencia Apache-2.0 permite uso comercial, pero el artefacto depende de LatentPort (también Apache-2.0) y de los términos de Qwen3; conviene revisar la atribución exigida por el autor.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/agentic-underground/qwen3-4b-to-8b-bridge
- Paper LatentPort (arXiv:2609.25053): https://huggingface.co/papers/2609.25053
- Sitio de LatentPort: https://latentport.com/
- Repositorio LatentPort: https://github.com/LatentPort/latentport
- Repositorio PrattleNot: https://github.com/agentic-underground/PrattleNot
- Documentación del puente: https://github.com/agentic-underground/PrattleNot/blob/main/documents/BRIDGE.md
- Guía de reproducción: https://github.com/agentic-underground/PrattleNot/blob/main/documents/REPRODUCTION.md
- Corpus de calibración: https://github.com/agentic-underground/PrattleNot/blob/main/crates/core/src/bridge_corpus.rs
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
