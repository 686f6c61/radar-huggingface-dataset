# agentic-underground/qwen3-0.6b-to-1.7b-bridge

## Resumen

El modelo `agentic-underground/qwen3-0.6b-to-1.7b-bridge` es un puente KV (KV bridge) que conecta dos modelos de la familia Qwen3: Qwen3-0.6B y Qwen3-1.7B. No es un modelo generativo al uso, sino un conjunto de matrices de proyección que traducen el estado interno (claves y valores de la caché KV) que produce el modelo pequeño al leer un prompt, hacia la memoria interna que habría construido el modelo grande. El modelo de 1.7B responde entonces a partir de esa memoria traducida, sin leer el prompt directamente.

Lo desarrolla el colectivo agentic-underground como parte del proyecto PrattleNot, una reproducción del método LatentPort de Simon Villani (arXiv:2609.25053). Es relevante porque demuestra que es posible transferir el estado latente entre modelos de distinta escala dentro de la misma familia, y porque publica métricas de fidelidad (NCR, next-token agreement) y un control negativo con donante erróneo, algo poco habitual en artefactos de este tipo. El repositorio ocupa 0,2 GB y contiene únicamente los tensores del puente, no los pesos de ninguno de los dos modelos base.

La arquitectura subyacente de ambos Qwen3 es transformer con 28 capas y 8 cabezas KV de dimensión 128, una geometría coincidente que el método asume como requisito. La licencia es Apache-2.0 y los pesos se distribuyen en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Puente KV sobre transformers Qwen3 (28 capas, 8 KV heads × 128) |
| Parametros totales | no disponible (el puente no es un modelo generativo; repo de 0,2 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (tensores en f16 para mapas ridge y f32 para correcciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`qwen3-0.6b-to-1.7b.safetensors`, 239 MB, sin `__metadata__`) |

## Arquitectura y entrenamiento

El puente se compone de dos bloques de tensores. Por un lado, mapas ridge en forma cerrada (λ = 10⁻³), uno por capa objetivo y por rol (claves y valores), que proyectan el residual stream del Qwen3-0.6B (leído en dos puntos de extracción) hacia las claves y valores que habría generado el Qwen3-1.7B. Cada mapa tiene forma `2049 × 1024` en f16. Por otro lado, una corrección residual de rango 4 por capa y rol, entrenada a través del modelo de 1.7B congelado contra la distribución del 1.7B nativo, plegada en una única matriz `I + BUᵀ` de forma `128 × 128` en f32 por cabeza. El fichero incluye además `layer_of` (qué capa del 0.6B alimenta cada capa del 1.7B) y `meta` (constantes de forma).

Los datos de calibración son unas 600 preguntas con plantilla, generadas de forma determinista por `crates/core/src/bridge_corpus.rs` de PrattleNot. El ajuste de los mapas ridge se midió en unas 2,5 horas con 32 hilos de CPU. La corrección se entrenó con 451 preguntas, 3 épocas, con una pérdida que descendió de 0,306 a 0,145 y luego a 0,108, en unas 1,5 horas y con un pico de unos 27 GB de memoria. Los prompts usan la plantilla de chat de Qwen3 con el modo thinking desactivado. El puente se lee desde Rust mediante `prattle_core::bridge` y no es un modelo compatible con `transformers`.

## Capacidades

- Traducción de estado latente: convierte la caché KV del Qwen3-0.6B en la que habría producido el Qwen3-1.7B, permitiendo que el modelo grande responda sin procesar el prompt.
- Fidelidad medida: 0,805 de acuerdo de siguiente token (NCR) con el 1.7B nativo usando la corrección aprendida, frente a 0,645 solo con los mapas ridge.
- Control negativo: alimentado con la memoria de otra pregunta (donante erróneo), el NCR cae a −0,127, lo que confirma que el puente no responde de forma genérica.
- Precisión de respuesta: 7 de 7 preguntas retenidas correctas, igual que el 1.7B leyendo todo el prompt.
- No incluye capacidades de generación propias: no genera texto, no hace tool calling ni razonamiento por sí mismo; hereda las capacidades del Qwen3-1.7B que lo consume.
- No soporta agentes ni multi-step reasoning de forma nativa: es un artefacto de infraestructura, no un modelo de chat.
- Capacidades multilingües: no disponibles (dependen del modelo base Qwen3-1.7B).

## Casos de uso

- Investigación en transferencia de estado latente: sirve para reproducir y extender el método LatentPort, comparando mapas ridge frente a correcciones aprendidas en pares de modelos de la misma familia.
- Aceleración de inferencia en servidor: el modelo pequeño procesa el prompt (prefill más barato) y el grande solo genera, lo que en teoría reduce el coste de prefill del modelo de 1.7B; el autor advierte que la aceleración de este par aún no se ha medido.
- Evaluación de fidelidad entre modelos: el NCR y el control con donante erróneo permiten auditar si un puente transfiere información real o solo ruido, útil en pipelines de validación de artefactos de compresión.
- Docencia y divulgación: ejemplo concreto y reproducible de cómo se alinean espacios latentes entre modelos de distinto tamaño con geometría compatible (28 capas, 8 KV heads × 128).
- Base para puentes en navegador o edge: el proyecto hermano SmolLM2-135M → 360M ya corre en navegador; este puente abre la vía a despliegues ligeros donde el modelo pequeño hace el trabajo pesado de lectura.
- Integración en PrattleNot: se carga desde Rust con `prattle_core::bridge` para experimentos de serving híbrido entre dos modelos Qwen3.
- Comparación de familias: al ser el segundo puente del proyecto (tras SmolLM2), permite contrastar el método LatentPort entre arquitecturas y familias distintas.

## Benchmarks y rendimiento

Datos publicados en la model card sobre preguntas retenidas (nunca usadas en el ajuste):

| Configuracion | NCR (acuerdo con 1.7B nativo) | NCR con donante erroneo | Correctas de 7 |
|---|---|---|---|
| Solo mapas ridge | 0,645 | −0,374 | 7 |
| Mapas ridge + correccion aprendida | 0,805 | −0,127 | 7 |

La corrección cierra el 45% de la brecha que dejan los mapas solos. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, y la aceleración de este par no se ha medido.

## Requisitos de hardware

- VRAM estimada para el puente: despreciable; el fichero pesa 239 MB y se carga en memoria del proceso de inferencia.
- VRAM para los modelos base: hay que cargar Qwen3-0.6B y Qwen3-1.7B por separado; el 1.7B en f16 ronda los 3,4 GB de pesos, más caché KV y activaciones.
- GPU recomendadas: cualquier GPU consumer con al menos 8 GB (RTX 3060, 4060, 4070) para el par completo en f16; A100 o H100 no son necesarias para este tamaño.
- Cabe en GPU consumer: sí, el par completo en f16 debería caber en 8-12 GB según longitud de contexto y lote.
- Opciones de despliegue: no es compatible con vLLM, llama.cpp, Ollama ni TGI de forma directa, porque no es un modelo `transformers`. Se consume desde Rust con `prattle_core::bridge` dentro de PrattleNot; los modelos base sí se pueden servir con las herramientas habituales.
- Latencia y throughput: no medidos para este par; el autor lo indica explícitamente.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-0.6b-to-1.7b-bridge | Puente KV | no aplica (239 MB) | no disponible | Apache-2.0 | Hugging Face, 0 descargas |
| smollm2-135m-to-360m-bridge | Puente KV | no aplica | no disponible | Apache-2.0 (presumible, no confirmado) | Hugging Face, corre en navegador |
| Qwen3-0.6B | LLM transformer | 0,6B | no disponible en esta ficha | Apache-2.0 | Hugging Face |
| Qwen3-1.7B | LLM transformer | 1,7B | no disponible en esta ficha | Apache-2.0 | Hugging Face |

No se conocen otros puentes KV públicos comparables fuera del proyecto PrattleNot en la información disponible.

## Limitaciones y advertencias

- No es un modelo generativo: no responde a prompts por sí mismo; requiere Qwen3-0.6B y Qwen3-1.7B cargados y el runtime de PrattleNot.
- Requiere geometría compatible: ambos modelos deben tener 28 capas y 8 KV heads × 128; no es portable a otras arquitecturas sin reajuste.
- Aceleración no demostrada: el autor no reclama ninguna mejora de velocidad para este par, solo fidelidad de estado.
- Muestra de evaluación pequeña: 7 preguntas retenidas y 451 de entrenamiento; los números de NCR tienen alta varianza y no deben extrapolarse a producción.
- Riesgo de alucinación: heredado del Qwen3-1.7B; el puente no añade verificación factual.
- Sesgos: no evaluados en la información disponible; dependen del corpus de calibración templado y de los modelos base.
- Idiomas: no especificados; el corpus de calibración parece generado por plantilla, sin cobertura multilingüe declarada.
- Licencia: Apache-2.0 permite uso comercial, pero el método subyacente (LatentPort, arXiv:2609.25053) debe citarse según los términos de atribución del autor.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; sin pipeline declarado ni integración con ecosistema `transformers`.
- Reproducibilidad: depende de scripts `just` y del repositorio PrattleNot; no hay artefacto autocontenido más allá del safetensors.

## Enlaces

- Hugging Face: https://huggingface.co/agentic-underground/qwen3-0.6b-to-1.7b-bridge
- Paper LatentPort: https://huggingface.co/papers/2609.25053
- Sitio de LatentPort: https://latentport.com/
- Repositorio LatentPort: https://github.com/LatentPort/latentport
- Repositorio PrattleNot: https://github.com/agentic-underground/PrattleNot
- Documentación del puente: https://github.com/agentic-underground/PrattleNot/blob/main/documents/BRIDGE.md
- Guía de reproducción: https://github.com/agentic-underground/PrattleNot/blob/main/documents/REPRODUCTION.md
- Corpus de calibración: https://github.com/agentic-underground/PrattleNot/blob/main/crates/core/src/bridge_corpus.rs
- Puente hermano SmolLM2: https://huggingface.co/agentic-underground/smollm2-135m-to-360m-bridge
- Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
