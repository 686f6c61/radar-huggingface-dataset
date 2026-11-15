# agentic-underground/qwen3.5-4b-to-9b-bridge

## Resumen

El modelo `qwen3.5-4b-to-9b-bridge` es un puente de memoria KV (KV bridge) desarrollado por agentic-underground como reproducción independiente del método LatentPort descrito por Simon Villani en el paper arXiv:2609.25053. No es un modelo generativo autónomo, sino un artefacto de pesos que permite que Qwen3.5-4B-Base procese un prompt y transfiera su estado interno a Qwen3.5-9B-Base, de modo que el modelo grande responda a partir de esa memoria sin releer el prompt completo. El 9B lee únicamente un token del prompt original.

El interés técnico reside en la asimetría de arquitectura de la familia Qwen3.5, que intercala tres capas de atención lineal (Gated DeltaNet) por cada capa de atención completa. El puente solo necesita mapear las 8 capas de atención completa (índices 3, 7, 11, ..., 31) mediante regresiones ridge, mientras que las 24 capas Gated DeltaNet comparten geometría exacta entre ambos modelos y su estado recurrente se copia sin transformación. Esta asimetría explica tanto la eficacia del puente como su principal limitación de velocidad.

El repositorio ocupa 0,2 GB y contiene un único archivo safetensors de 172 MB. Se trata de un artefacto de investigación con cero descargas y cero likes en el momento de la consulta, orientado a reproducibilidad experimental más que a uso en producción. La ganancia de velocidad medida es modesta (1,15-1,16× en tiempo hasta el primer token) y el propio autor reconoce que el techo teórico de esta pareja es bajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Puente KV sobre pares Qwen3.5 (transformer híbrido con Gated DeltaNet + atención completa) |
| Parametros totales | No disponible (el artefacto no es un modelo generativo; el archivo pesa 172 MB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada de los modelos base Qwen3.5-4B/9B, no especificada) |
| Tipos de cuantizacion | No disponible (los pesos del puente se distribuyen en safetensors; los modelos base se usan en bf16) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (sin `__metadata__`) |

## Arquitectura y entrenamiento

El puente opera sobre dos modelos base con 32 capas cada uno y 4 cabezas KV de anchura 256. La anchura oculta es 2560 en el 4B y 4096 en el 9B. La familia Qwen3.5 intercala tres capas de atención lineal Gated DeltaNet con cada capa de atención completa. Para las 8 capas de atención completa, el puente aplica regresiones ridge en forma cerrada (λ = 10⁻³), una por capa para claves y otra para valores, leyendo el flujo residual del 4B en dos puntos de extracción sobre 25.114 filas. El R² obtenido es de 0,90-0,95 para claves y 0,87-0,95 para valores, con el valor más bajo en la última capa. Para las 24 capas Gated DeltaNet, ambos modelos comparten geometría exacta (ventana de convolución y 32 cabezas de valor de 128 × 128), por lo que el estado recurrente del 4B se copia sin transformación y el archivo no contiene mapas para esas capas.

Sobre los mapas ridge se aplica una corrección residual de rango 4 por capa y rol mapeados, según el método del paper. Esta corrección se entrena a través del 9B congelado contra la distribución nativa del 9B, usando 451 preguntas plantilla durante 3 épocas, con una pérdida que desciende de 0,057 a 0,042 y finalmente a 0,035. La corrección se pliega en el archivo como `I + BUᵀ`. Las capas recurrentes no llevan corrección. Los datos de calibración se generan de forma determinista mediante `crates/core/src/bridge_corpus.rs` del repositorio PrattleNot, y las preguntas de validación nunca se usan en el ajuste. Todo el proceso se implementa en Rust como parte de la reproducción PrattleNot.

## Capacidades

- Transferencia de estado KV entre Qwen3.5-4B-Base y Qwen3.5-9B-Base: el 4B procesa el prompt y el puente traduce su estado interno a la memoria que habría construido el 9B.
- Mapeo de claves y valores en las 8 capas de atención completa mediante regresiones ridge más corrección residual de rango 4.
- Copia directa del estado recurrente de las 24 capas Gated DeltaNet, aprovechando la geometría compartida entre ambos modelos.
- El 9B resultante lee un único token del prompt para generar la respuesta, reduciendo el coste de prefill.
- No incluye generación de texto autónoma, tool calling, capacidades de agente, visión, audio ni modo de razonamiento extendido: es un artefacto de puente, no un modelo de chat.
- Los modelos base son modelos base (no instruction-tuned), por lo que no están alineados para seguir instrucciones.

## Casos de uso

- Investigación en transferencia de estado latente: el puente permite reproducir y verificar los resultados del paper LatentPort (arXiv:2609.25053) sobre la pareja Qwen3.5-4B/9B, sirviendo como referencia para quienes estudian comunicación entre modelos de distinto tamaño.
- Reproducción de experimentos de velocidad de prefill: con dos RTX 3090 (4B en una, 9B en otra, ambos en bf16) se puede medir el tiempo hasta el primer token con y sin puente, usando el comando `just speedup` de PrattleNot con prompts de ~256 o ~2048 tokens.
- Evaluación de la fidelidad de puentes KV: el ratio NCR (native-closure ratio) permite cuantificar qué fracción de la brecha entre leer nada y leer todo cierra el puente, con valores de 0,989 para el donante correcto y 0,308 para un donante erróneo.
- Estudio de arquitecturas híbridas con atención lineal: el caso ilustra cómo la geometría compartida de las capas Gated DeltaNet reduce el número de capas que requieren mapeo aprendido (de 32 a 8), un dato relevante para diseñar puentes en otras familias híbridas.
- Docencia y formación técnica: sirve como ejemplo concreto de regresión ridge en forma cerrada aplicada a estados internos de transformers, con código Rust reproducible y métricas publicadas.
- Base para experimentos de decodificación especulativa entre modelos de distinto tamaño: aunque la ganancia actual es pequeña (1,15-1,16×), el artefacto permite explorar si otras parejas o configuraciones de hardware elevan el techo de 1,38× observado.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| NCR con mapas ridge solos | 0,974 |
| NCR con corrección aprendida del paper | 0,989 |
| NCR con donante erróneo (control) | 0,308 |
| Preguntas correctas de 7 (puente vs modelos solos) | 7 (igual que cada modelo por separado) |
| Pérdida del 9B sobre su propia respuesta, leyendo todo | 0,268 |
| Pérdida del 9B sobre su propia respuesta, con puente y corrección | 0,286 |
| Pérdida del 9B sobre su propia respuesta, leyendo nada | 1,840 |
| Pérdida con donante erróneo | 1,357 |
| Tiempo hasta primer token, prompt ~256 tokens (puente vs 9B leyendo prompt) | 1,16× (intervalo 1,16-1,16) |
| Techo en la misma ejecución, prompt ~256 tokens (9B solo ÷ 4B solo) | 1,38× |
| Tiempo hasta primer token, prompt ~2048 tokens | 1,15× (intervalo 1,14-1,15) |
| Techo en la misma ejecución, prompt ~2048 tokens | 1,26× |

Mediciones realizadas en dos RTX 3090, el 4B en una y el 9B en otra, ambos en bf16, con prompts sintéticos, 8 prompts × 3 repeticiones en orden rotado, un token de puente y verificación de contadores en cada ejecución. La cifra de velocidad es la media geométrica de nativo ÷ puenteado con su intervalo del 95 %. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el puente en sí (172 MB de pesos); requiere cargar simultáneamente Qwen3.5-4B-Base y Qwen3.5-9B-Base en bf16, lo que exige aproximadamente 8 GB y 18 GB respectivamente, más overhead.
- GPU recomendadas: el autor valida el experimento en dos RTX 3090 (24 GB cada una), con el 4B en una GPU y el 9B en otra.
- Cabe en GPU de consumo: sí, en el escenario de dos RTX 3090 descrito; no se documentan otras configuraciones.
- Opciones de despliegue: el flujo está implementado en el repositorio PrattleNot (Rust) mediante los comandos `just bridge-fit-pair-d`, `just bridge-correct-pair-d` y `just speedup`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: el 4B y el 9B gastan aproximadamente 52 ms de cada primer token en el núcleo Gated DeltaNet, lo que limita el techo de aceleración a 1,38× en prompts de ~256 tokens y 1,26× en ~2048 tokens. La ganancia medida del puente es de 1,16× y 1,15× respectivamente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3.5-4b-to-9b-bridge (este) | No disponible (artefacto de 172 MB) | No disponible | Puente KV | Apache-2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-4B-Base | No disponible | No disponible | Modelo base transformer híbrido | Apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-9B-Base | No disponible | No disponible | Modelo base transformer híbrido | Apache-2.0 | Hugging Face |
| Puente del paper LatentPort (Villani) | No disponible | No disponible | Puente KV de referencia | No disponible | No disponible |

No se dispone de datos de benchmarks comparativos con modelos de la misma categoría distintos de los publicados en la model card. La comparación relevante es interna: el puente alcanza un NCR de 0,989 frente al 0,974 de los mapas ridge solos, y ambos superan ampliamente el control de donante erróneo (0,308).

## Limitaciones y advertencias

- La ganancia de velocidad es pequeña: 1,15-1,16× en tiempo hasta el primer token, con un techo estructural de 1,38× (prompts cortos) y 1,26× (prompts largos) debido a que ambos modelos comparten el cuello de botella de 52 ms en el núcleo Gated DeltaNet.
- El control de donante erróneo cierra 0,308 de la brecha, un valor alto en comparación con otros puentes del mismo autor, porque 24 de las 32 capas transportan el estado recurrente del 4B, que contiene contexto general independientemente del prompt.
- Los modelos base no están alineados para instrucciones: las 7 preguntas de validación las responden correctamente ambos modelos por sí solos, de modo que el conteo de aciertos demuestra que el puente no causa daño, pero no que aporte mejora.
- El artefacto no es un modelo generativo utilizable de forma autónoma; requiere cargar ambos modelos base y el runtime PrattleNot.
- Sin datos publicados sobre sesgos, riesgo de alucinación, cobertura idiomática ni comportamiento en producción, ya que la model card no los documenta.
- La licencia Apache-2.0 del puente es permisiva para uso comercial, pero el uso queda condicionado por las licencias de los modelos base Qwen3.5-4B-Base y Qwen3.5-9B-Base (también Apache-2.0 según la model card).
- El repositorio tiene cero descargas y cero likes, y fue creado y actualizado el mismo día (14 de noviembre de 2026), por lo que no hay evidencia de uso en producción ni validación externa.
- El paper de referencia (arXiv:2609.25053) no reclama ganancia de velocidad para esta pareja concreta, según indica el propio autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/agentic-underground/qwen3.5-4b-to-9b-bridge
- Paper LatentPort: https://huggingface.co/papers/2609.25053
- Sitio de LatentPort: https://latentport.com/
- Repositorio PrattleNot: https://github.com/agentic-underground/PrattleNot
- Documentación del puente: https://github.com/agentic-underground/PrattleNot/blob/main/documents/BRIDGE.md
- Documentación de reproducción: https://github.com/agentic-underground/PrattleNot/blob/main/documents/REPRODUCTION.md
- Corpus de calibración: https://github.com/agentic-underground/PrattleNot/blob/main/crates/core/src/bridge_corpus.rs
- Modelo base Qwen3.5-4B-Base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Modelo base Qwen3.5-9B-Base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
