# agentic-underground/qwen3-0.6b-to-8b-bridge

## Resumen

El repositorio `agentic-underground/qwen3-0.6b-to-8b-bridge` no contiene un modelo de lenguaje completo, sino un puente KV (KV bridge) entrenado para conectar dos modelos de la familia Qwen3: un donante pequeño (Qwen3-0.6B) y un receptor grande (Qwen3-8B). El puente traduce el estado interno que el modelo de 0.6B construye al leer un prompt en la memoria de claves y valores (KV cache) que el modelo de 8B habría generado por sí mismo, de forma que el 8B puede responder leyendo únicamente un token del prompt. El método subyacente es LatentPort, de Simon Villani, descrito en arXiv:2609.25053, y la reproducción pertenece al proyecto PrattleNot de agentic-underground.

La motivación es de latencia: un modelo de 0.6B procesa un prompt aproximadamente seis veces más rápido que uno de 8B, de modo que delegar la lectura del contexto al modelo pequeño y transferir su estado al grande reduce el tiempo hasta el primer token. Según la model card, sobre prompts sintéticos de unos 256 tokens el 8B puenteado responde entre 2,51 y 2,82 veces antes que el 8B leyendo el prompt completo, dependiendo de si ambos modelos comparten una RTX 3090 o se reparten en dos. El puente cierra el 80,3 % de la brecha de pérdida entre no leer nada y leerlo todo (NCR), y responde correctamente las 7 preguntas de evaluación, igual que el 8B sin puente.

Es relevante ahora porque propone una arquitectura de despliegue alternativa para inferencia de modelos grandes: separar el coste de codificación del prompt del coste de generación, usando un modelo donante barato y una transferencia de estado aprendida. El artefacto publicado ocupa 307 MB y no contiene pesos de ninguno de los dos modelos Qwen3, que deben descargarse por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Puente KV (mapas lineales por capa + corrección aprendida) entre dos transformers Qwen3 |
| Parametros totales | No disponible (el puente no es un modelo de parámetros densos; el fichero pesa 307 MB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende de los modelos base; el puente usa 2049 posiciones por capa) |
| Tipos de cuantizacion | No disponible (tensores en f16 y f32; los modelos base en bf16 en la evaluación) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`qwen3-0.6b-to-8b.safetensors`, sin `__metadata__`) |

## Arquitectura y entrenamiento

El puente opera sobre dos transformers densos de Qwen3: el donante tiene 28 capas, anchura oculta de 1024 y 8 cabezas KV de 128 dimensiones; el receptor tiene 36 capas, anchura de 4096 y también 8 cabezas KV de 128. Para cada capa destino, el fichero contiene un tensor `k.<l>` y `v.<l>` en f16 de forma `2049 × 1024` que mapea el flujo residual del 0.6B a las claves y valores del 8B, y un tensor `ck.<l>` y `cv.<l>` en f32 de forma `128 × 128` con la corrección aprendida plegada a una matriz por anchura de cabeza. Además incluye `layer_of`, que indica qué capa del 0.6B alimenta cada capa del 8B, y `meta`, con las constantes de forma que necesita el lector.

El ajuste sigue el método de puente de LatentPort (Simon Villani) con herramientas propias de agentic-underground no publicadas. Los modelos base son Qwen/Qwen3-0.6B en el commit `c1899de289a04d12100db370d81485cdf75e47ca` y Qwen/Qwen3-8B en `b968826d9c46dd6066d109eabc6255188de91218`, ambos Apache-2.0, y los prompts usan la plantilla de chat de Qwen3 con el modo thinking desactivado. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. La innovación destacable es el traspaso de un solo token: el 8B solo lee un token del prompt y el resto del contexto llega por la memoria KV transferida.

## Capacidades

- Transferencia de estado KV entre un donante Qwen3-0.6B y un receptor Qwen3-8B, capa a capa, con corrección aprendida.
- Decodificación del 8B a partir de un único token del prompt, sin que el modelo grande procese el historial completo.
- Reducción del tiempo hasta el primer token en prompts largos (medido con prompts sintéticos de unos 256 tokens).
- Conservación de la calidad de respuesta del 8B: en la evaluación, el modelo puenteado acierta las 7 preguntas igual que el 8B sin puente.
- Control negativo incluido: la memoria de una pregunta distinta produce una pérdida de 1,755, cercana a la de no leer nada (1,923), lo que valida que la transferencia es específica del prompt.
- No soporta tool calling, agentes, visión, audio ni modo thinking por sí mismo; esas capacidades dependerían del modelo base y no se documentan para el puente.
- El puente no es un modelo `transformers` y se lee mediante `prattle_core::bridge` en PrattleNot, escrito en Rust.

## Casos de uso

- Reducción de latencia en asistentes conversacionales: el 0.6B procesa el historial y el sistema prompt, y el 8B genera la respuesta desde la memoria transferida, lo que rebaja el tiempo hasta el primer token en prompts de varios cientos de tokens.
- Despliegue en una sola GPU de consumo: con ambos modelos en bf16 sobre una RTX 3090, el puente ofrece un factor de 2,82 veces menos latencia de prefill frente al 8B leyendo el prompt completo.
- Despliegue distribuido en dos GPUs: colocando el 0.6B y el 8B en tarjetas separadas y transfiriendo el estado por el host, el factor medido es de 2,51 veces, útil cuando no cabe el 8B completo con margen en una sola tarjeta.
- Investigación sobre arquitecturas de inferencia desacoplada: permite experimentar con separación entre codificación de contexto y generación sin reentrenar los modelos base.
- Evaluación de métodos de compresión de contexto: el NCR y la pérdida por token permiten comparar puentes de distintos pares de modelos con una métrica común.
- Reproducción de resultados académicos: el comando documentado con `PRATTLE_SOURCE_DTYPE=bf16 PRATTLE_TARGET_DTYPE=bf16 PRATTLE_DEVICES=cuda:0 just speedup ...` permite repetir la medición de velocidad desde un checkout de PrattleNot.
- Prototipado de pipelines con restricciones de latencia estrictas donde el prompt es mucho más largo que la respuesta generada, ya que el ahorro se concentra en la fase de prefill.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre preguntas no vistas durante el ajuste:

| Metrica | Valor |
|---|---|
| NCR con corrección aprendida (cierre de la brecha no-leer → leer-todo) | 0,803 |
| NCR desde un donante equivocado (control) | 0,092 |
| Preguntas correctas de 7, puenteado | 7 (igual que el 8B solo) |
| Pérdida por token del 8B leyendo todo | 0,089 |
| Pérdida por token del 8B puenteado | 0,451 |
| Pérdida por token del 8B sin leer nada | 1,923 |
| Pérdida por token desde la memoria de otra pregunta (control) | 1,755 |

Tiempo hasta el primer token, ambos modelos en bf16, prompts sintéticos de unos 256 tokens, 8 prompts × 3 repeticiones en orden rotado:

| Configuracion | Factor puenteado vs 8B leyendo el prompt | Techo en la misma ejecucion (8B solo ÷ 0.6B solo) |
|---|---|---|
| Una RTX 3090, ambos modelos en ella | 2,82× (2,82–2,83) | 6,03× |
| Dos RTX 3090, un modelo en cada una | 2,51× (2,49–2,53) | 5,80× |

El factor es la media geométrica de nativo ÷ puenteado con su intervalo del 95 %, estadístico propio de LatentPort.

## Requisitos de hardware

- VRAM: el puente en sí ocupa 307 MB; hay que sumar la memoria de Qwen3-0.6B y Qwen3-8B en bf16, que no se detalla en la información disponible.
- GPU recomendadas: RTX 3090 es la tarjeta usada en las mediciones publicadas, tanto en configuración de una como de dos tarjetas. No se documentan pruebas en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, la configuración de referencia con ambos modelos en bf16 cabe en una RTX 3090 según la model card.
- Despliegue: no es compatible con vLLM, llama.cpp, Ollama ni TGI de forma nativa; se lee con `prattle_core::bridge` dentro de PrattleNot, en Rust.
- Latencia: factor de 2,82 veces menos tiempo hasta el primer token en una RTX 3090 y 2,51 veces en dos RTX 3090, con prompts de unos 256 tokens.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-0.6b-to-8b-bridge | Puente KV entre Qwen3-0.6B y Qwen3-8B | No aplica (307 MB de tensores) | No disponible | Apache-2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3-8B | Transformer denso | 8B | No disponible en la informacion | Apache-2.0 | Hugging Face |
| Qwen/Qwen3-0.6B | Transformer denso | 0,6B | No disponible en la informacion | Apache-2.0 | Hugging Face |

No se dispone de datos de benchmarks de otros puentes KV comparables en la información proporcionada.

## Limitaciones y advertencias

- Aviso de seguridad del autor: cuando el modelo está puenteado, el 8B no lee el prompt ni el system prompt, y el puente no transporta de forma fiable sus instrucciones. En seis pares medidos, un conjunto de reglas en el system prompt se incumple más a menudo puenteado que cuando el 8B lee el prompt. No deben usarse instrucciones de system prompt como barrera de seguridad en un modelo puenteado.
- El 8B puenteado está más lejos de su propia respuesta que leyendo todo (pérdida 0,451 frente a 0,089): el 0.6B transporta la mayor parte del prompt, no todo.
- El NCR es una ratio de pérdida evaluada con teacher forcing, no una tasa de tokens coincidentes; no debe interpretarse como precisión de generación.
- Las mediciones de velocidad usan prompts sintéticos de unos 256 tokens; no se documenta el comportamiento con contextos mucho más largos ni con prompts reales.
- No se documentan idiomas soportados, sesgos conocidos ni tasas de alucinación específicas del puente.
- El puente no es un modelo `transformers` y requiere el runtime PrattleNot en Rust; las herramientas de ajuste de agentic-underground no están publicadas.
- El repositorio no incluye los pesos de Qwen3-0.6B ni Qwen3-8B; deben descargarse por separado.
- Licencia Apache-2.0, que permite uso comercial, pero el autor advierte que la política de seguridad debe aplicarse fuera del modelo en despliegues puenteados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/agentic-underground/qwen3-0.6b-to-8b-bridge
- Paper LatentPort: https://huggingface.co/papers/2609.25053
- Sitio de LatentPort: https://latentport.com/
- Repositorio LatentPort: https://github.com/LatentPort/latentport
- Reproducción PrattleNot: https://github.com/agentic-underground/PrattleNot
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
