# agentic-underground/qwen3.5-0.8b-to-2b-bridge

## Resumen

El repositorio `agentic-underground/qwen3.5-0.8b-to-2b-bridge` no es un modelo de lenguaje al uso, sino un puente KV (KV bridge) entrenado que conecta dos modelos de la familia Qwen3.5: el pequeño de 0,8B y el de 2B. El puente permite que el modelo de 0,8B lea el prompt y que su estado interno se traduzca en la memoria que el modelo de 2B habría construido, de modo que el 2B puede responder leyendo un único token del prompt. Está desarrollado por el colectivo agentic-underground y aplica el método LatentPort de Simon Villani (arXiv:2609.25053).

La relevancia técnica reside en que Qwen3.5 es una arquitectura híbrida: intercala tres capas de atención lineal (Gated DeltaNet) por cada capa de atención completa. El puente trata de forma distinta ambos tipos de memoria: mapea la corriente residual del 0,8B a las claves y valores del 2B en las 6 capas de atención completa (3, 7, 11, 15, 19, 23), mientras que en las 18 capas Gated DeltaNet ambos modelos comparten exactamente la misma geometría de estado recurrente, por lo que el 2B reutiliza directamente el estado del 0,8B sin mapa intermedio.

El artefacto pesa 28 MB, no contiene pesos de ninguno de los dos modelos y se lee mediante `prattle_core::bridge` del proyecto PrattleNot, escrito en Rust. No es un modelo de `transformers` ni se puede cargar con las herramientas habituales de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Puente KV sobre arquitectura híbrida Qwen3.5 (atención completa + Gated DeltaNet) |
| Parametros totales | No aplica (artefacto de 28 MB, sin pesos de modelo) |
| Parametros activos | No aplica |
| Longitud de contexto | No disponible (depende de los modelos base) |
| Tipos de cuantizacion | No disponible (tensores en f16 y f32 en el propio puente) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`qwen3.5-0.8b-to-2b.safetensors`, 28 MB, sin `__metadata__`) |

## Arquitectura y entrenamiento

El puente se construye en dos fases sobre los modelos base Qwen/Qwen3.5-0.8B (commit `2fc06364715b967f1860aea9cf38778875588b17`) y Qwen/Qwen3.5-2B (commit `15852e8c16360a2fea060d615a32b45270f8a8fc`), ambos Apache-2.0, con 24 capas cada uno y 2 cabezas KV de anchura 256. Solo se emplea la parte de lenguaje. La primera fase ajusta regresiones ridge en forma cerrada (λ = 10⁻³), una por capa de atención completa para claves y otra para valores, leyendo la corriente residual del 0,8B en dos puntos de extracción; el R² obtenido es de 0,82–0,90 para claves y 0,79–0,90 para valores, con el mínimo en la última capa. La segunda fase aplica la corrección residual de rango 4 del paper, por capa mapeada y rol, entrenada a través del 2B congelado contra la distribución nativa del 2B (451 preguntas, 3 épocas, pérdida 0,153 → 0,113 → 0,100), plegada en el fichero como `I + BUᵀ`. Las capas recurrentes no llevan corrección.

El fichero contiene los tensores `k.<l>` y `v.<l>` (f16, 2049 × 512) con el mapa ridge por capa de atención completa, `ck.<l>` y `cv.<l>` (f32, 256 × 256) con la corrección aprendida por cabeza, `layer_of` (qué capa del 0,8B alimenta cada capa del 2B) y `meta` (constantes de forma). El ajuste tardó 7 minutos y la corrección menos de 5, sobre dos RTX 3090. Los datos de calibración son 451 preguntas con plantilla generadas de forma determinista por `crates/core/src/bridge_corpus.rs`.

## Capacidades

- Transferencia de estado KV entre Qwen3.5-0.8B y Qwen3.5-2B para evitar que el modelo grande reprocese el prompt completo.
- Mapeo de claves y valores en las 6 capas de atención completa (3, 7, 11, 15, 19, 23).
- Reutilización directa del estado recurrente de las 18 capas Gated DeltaNet (ventana de convolución y matriz de estado 16 × 128 × 128), sin mapa intermedio.
- Entrega de un único token al modelo de 2B, que responde a partir de la memoria transferida.
- Corrección residual aprendida de rango 4 por capa y rol para mejorar la fidelidad de la memoria transferida.
- No implementa generación de texto, razonamiento, código, matemáticas, visión, tool calling ni capacidades multilingües por sí mismo: esas capacidades pertenecen a los modelos base.

## Casos de uso

- Reducción del tiempo hasta el primer token en despliegues con Qwen3.5-2B: el puente permite que el 2B empiece a responder sin leer el prompt completo, con una mejora medida de 1,36× (intervalo 1,35–1,36) frente a la lectura nativa del prompt.
- Enrutado en cascada pequeño→grande: un 0,8B procesa el prompt y el 2B recibe la memoria ya construida, útil en sistemas donde el modelo grande es el cuello de botella de latencia.
- Investigación sobre arquitecturas híbridas: sirve como caso reproducible de aplicación de LatentPort a modelos con mezcla de atención completa y Gated DeltaNet, verificable con los comandos de PrattleNot.
- Evaluación de métodos de compartición de estado entre modelos de distinto tamaño: el repositorio incluye la métrica NCR (native-closure ratio) y el control de donante erróneo para validar la transferencia.
- Reproducción de experimentos de latencia: el comando `PRATTLE_DEVICES=cuda:0 just speedup ...` permite repetir las mediciones en una RTX 3090 con prompts sintéticos de unos 256 tokens.
- Base para puentes similares en la familia Qwen3.5: el procedimiento (`just bridge-fit-qwen3_5` y `just bridge-correct-qwen3_5`) es reutilizable para otros pares de modelos con la misma geometría recurrente.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| NCR con mapas ridge solos | 0,884 |
| NCR con corrección aprendida | 0,917 |
| NCR con donante erróneo (control) | 0,058 (ridge solo) / 0,019 (con corrección) |
| Respuestas correctas de 7 | 7 (igual que cada modelo por separado) |
| Pérdida por token del 2B (leyendo todo) | 0,242 |
| Pérdida por token del 2B (con puente y corrección) | 0,391 |
| Pérdida por token del 2B (sin leer nada) | 2,032 |
| Tiempo hasta primer token, 2B con puente vs 2B nativo | 1,36× (1,35–1,36) más rápido |
| Techo de la misma ejecución (2B solo ÷ 0,8B solo) | 1,50× |
| TTFT absoluto: 2B solo / 2B con puente / 0,8B solo | 106 ms / 78 ms / 70 ms |

Medido en una RTX 3090 con ambos modelos en la misma tarjeta, prompts sintéticos de unos 256 tokens, 8 prompts × 3 repeticiones en orden rotado, un token de puente y contadores verificados en cada ejecución. La cifra es la media geométrica de nativo ÷ puenteado con su intervalo del 95 %, estadístico propio de LatentPort.

## Requisitos de hardware

- VRAM: depende de los modelos base; el puente en sí ocupa 28 MB. Hay que cargar Qwen3.5-0.8B y Qwen3.5-2B simultáneamente para la transferencia de estado.
- GPU recomendadas: RTX 3090 (configuración usada en las mediciones), y por tamaño de los modelos base caben en GPUs de consumo con VRAM suficiente para ambos.
- Cabe en GPU de consumo: sí, con ambos modelos cargados; el README no detalla requisitos mínimos de VRAM para el par completo.
- Despliegue: no es compatible con vLLM, llama.cpp, Ollama ni TGI; se lee con `prattle_core::bridge` del proyecto PrattleNot en Rust.
- Latencia: TTFT de 78 ms con puente frente a 106 ms nativo del 2B y 70 ms del 0,8B solo, en prompts de ~256 tokens sobre RTX 3090.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3.5-0.8b-to-2b-bridge | Puente KV | No aplica (28 MB) | No disponible | Apache-2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-0.8B | LLM híbrido | 0,8B | No disponible | Apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-2B | LLM híbrido | 2B | No disponible | Apache-2.0 | Hugging Face |

No se dispone de datos de benchmarks de los modelos base en la información proporcionada, por lo que la comparación se limita a tamaño, licencia y disponibilidad. No se conocen otros puentes KV publicados para esta familia en la información disponible.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto por sí mismo y no puede cargarse con `transformers`, vLLM, llama.cpp, Ollama ni TGI.
- Requiere el runtime PrattleNot en Rust (`prattle_core::bridge`); sin él el fichero no es utilizable.
- El puente no contiene pesos de Qwen3.5; hay que descargar ambos modelos base por separado.
- La mejora de latencia es modesta (1,36×) porque los dos modelos son de tamaño cercano; el techo teórico de la ejecución medida era 1,50×.
- El recuento de respuestas correctas (7 de 7) no demuestra ganancia, solo ausencia de daño, ya que ambos modelos base aciertan las siete preguntas por sí solos.
- La calibración se hizo con 451 preguntas con plantilla generadas de forma determinista; el comportamiento fuera de esa distribución no está caracterizado en la información disponible.
- No hay datos publicados sobre sesgos, riesgo de alucinación ni rendimiento multilingüe del puente.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-11-14); no hay evidencia de uso en producción.
- La licencia Apache-2.0 permite uso comercial, pero el método subyacente (LatentPort, arXiv:2609.25053) y el proyecto PrattleNot son obras derivadas con su propia atribución.

## Enlaces

- Hugging Face: https://huggingface.co/agentic-underground/qwen3.5-0.8b-to-2b-bridge
- Paper LatentPort: https://huggingface.co/papers/2609.25053
- Sitio de LatentPort: https://latentport.com/
- Repositorio LatentPort: https://github.com/LatentPort/latentport
- Proyecto PrattleNot: https://github.com/agentic-underground/PrattleNot
- Documentación del puente: https://github.com/agentic-underground/PrattleNot/blob/main/documents/BRIDGE.md
- Documentación de reproducción: https://github.com/agentic-underground/PrattleNot/blob/main/documents/REPRODUCTION.md
- Corpus de calibración: https://github.com/agentic-underground/PrattleNot/blob/main/crates/core/src/bridge_corpus.rs
- Modelo base 0,8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Modelo base 2B: https://huggingface.co/Qwen/Qwen3.5-2B
- Organización Qwen: https://huggingface.co/Qwen
