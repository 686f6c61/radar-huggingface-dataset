# agentic-underground/gemma-4-e2b-to-31b-bridge

## Resumen

El repositorio `agentic-underground/gemma-4-e2b-to-31b-bridge` no contiene un modelo de lenguaje en sentido estricto, sino un puente de memoria KV (KV bridge) ajustado para transferir el estado interno de Gemma 4 E2B (modelo "effective 2B" de Google) al espacio de claves/valores de Gemma 4 31B. El modelo pequeño lee el prompt y este fichero de 2,77 GB traduce su corriente residual a la memoria KV que el modelo grande habría construido, de modo que el 31B responde a partir de esa memoria leyendo un único token del prompt. Implementa el método LatentPort de Simon Villani (arXiv:2609.25053) sobre la familia Gemma 4, dentro del proyecto de reproducción PrattleNot.

La relevancia es práctica: en prompts de unas 256 tokens, el 31B puenteado alcanza el primer token entre 1,94 y 2,00 veces antes que el 31B leyendo el prompt completo (307 ms frente a 154 ms en una de las ejecuciones), sobre dos RTX 3090 con E2B en bf16 y el 31B cuantizado a Q4K. El puente cierra el 80,9 % de la brecha de pérdida entre "no leer nada" y "leerlo todo" (NCR de 0,809), frente al 44,8 % que consigue un donante incorrecto.

Se trata de un artefacto experimental, no de un modelo listo para producción: no es un modelo `transformers`, no contiene pesos de ninguno de los dos Gemma y solo se lee desde el runtime en Rust `prattle_core::bridge` de PrattleNot. Su utilidad está acotada a quien quiera reproducir o extender el método LatentPort con la pila de Gemma 4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Puente KV ajustado (mapas lineales por capa) sobre Gemma 4; no es un transformer completo |
| Parametros totales | No disponible (fichero de 2,77 GB en f16; no se declara recuento de parametros) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible como ventana propia; medido con prompts de ~256 tokens; a ~1024 tokens el 31B nativo agota memoria en el runtime de referencia |
| Tipos de cuantizacion | El puente se distribuye en f16; requiere el 31B destino con capas lineales en Q4K y E2B en bf16 |
| Idiomas soportados | No disponible (heredados de Gemma 4 E2B y 31B; no se declaran) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`gemma-4-e2b-to-31b.safetensors`, sin `__metadata__`) |

## Arquitectura y entrenamiento

Gemma 4 31B consta de 60 capas de dos formas: 50 capas de ventana deslizante con 16 cabezas KV de anchura 256, y 10 capas globales con 4 cabezas KV de anchura 512, en las que claves y valores comparten tensor. El puente ajusta cada capa en su propia forma, de modo que un mapa de capa global produce directamente sus 4 × 512 filas. El lector, Gemma 4 E2B, es el modelo "effective 2B" de la familia: unos 2B parámetros de cómputo más embeddings por capa, con anchura oculta de 1536 y 35 capas (frente a 5376 y 60 capas del 31B).

El ajuste sigue el método de puente de LatentPort (Simon Villani) con herramientas propias de agentic-underground no publicadas. El fichero contiene, por capa, tensores `k.<l>` y `v.<l>` en f16 (3073 × 4096 para capas deslizantes; 3073 × 2048 para globales), más `shapes`, `layer_of` (qué capa de E2B alimenta cada capa del 31B) y `meta` con las constantes de forma. Los prompts usan el turno plano de Gemma 4 con thinking desactivado; el 31B escribe su canal de pensamiento vacío y luego responde. No se entrenó ninguna pasada de corrección porque el puente ya responde todas las preguntas que el 31B acierta por sí solo en el conjunto evaluado.

## Capacidades

- Transferencia de estado latente: convierte la corriente residual de Gemma 4 E2B en claves y valores utilizables por las 60 capas de Gemma 4 31B.
- Handoff de un solo token: el 31B responde leyendo únicamente un token del prompt, con la información restante llegando por la memoria KV puenteada.
- Reducción de latencia en prefill: acelera el tiempo hasta el primer token al evitar que el modelo grande procese el historial completo del prompt.
- Ajuste por forma de capa: soporta de forma nativa los dos tipos de capa del 31B (ventana deslizante y global) sin aplanar sus geometrías.
- Integración con PrattleNot: se carga desde el runtime en Rust `prattle_core::bridge`, con variables de entorno `PRATTLE_SOURCE_DTYPE`, `PRATTLE_TARGET_DTYPE` y `PRATTLE_DEVICES`.
- No incluye tool calling, agentes, visión, audio ni modo thinking propios: esas capacidades, si existen, dependen de los modelos Gemma subyacentes y no del puente.

## Casos de uso

- Investigación sobre transferencia de estado entre modelos: reproducir el método LatentPort con la pila de Gemma 4 y comparar el NCR del puente con el de donantes incorrectos (0,809 frente a 0,448 en el conjunto retenido).
- Evaluación de latencia en pipelines de inferencia: medir la ganancia de tiempo hasta el primer token (1,94–2,00× en prompts de ~256 tokens) en configuraciones multi-GPU con un modelo lector pequeño y un modelo respondedor cuantizado.
- Prototipado de arquitecturas desacopladas lector/respuesta: separar la lectura del prompt (E2B, barata) de la generación de alta calidad (31B), útil para estudiar compromisos entre coste y fidelidad.
- Experimentos de destilación implícita: analizar cuánta información del prompt sobrevive en la memoria KV traducida, usando la pérdida por token del 31B sobre su propia respuesta como métrica (0,100 nativo, 1,104 puenteado, 5,355 sin lectura).
- Docencia y divulgación técnica: ilustrar con un artefacto real y medible conceptos de caché KV, corriente residual y alineación de espacios latentes entre modelos de distinto tamaño.
- Base para extensiones del método: punto de partida para ajustar puentes equivalentes entre otros pares de la familia Gemma 4 o para explorar rutas de atención que permitan prompts más largos, hoy limitados por memoria.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| NCR (cierre de la brecha leer-nada → leer-todo), mapas solos | 0,809 |
| NCR con donante incorrecto | 0,448 |
| Aciertos sobre 7 preguntas retenidas (puente) | 7 |
| Aciertos sobre 7 preguntas retenidas (31B solo) | 7 |
| Aciertos sobre 7 preguntas retenidas (E2B solo) | 7 |
| Perdida por token del 31B sobre su propia respuesta, leyendo todo | 0,100 |
| Perdida por token del 31B sobre su propia respuesta, puenteado | 1,104 |
| Perdida por token del 31B sobre su propia respuesta, sin leer nada | 5,355 |
| Perdida por token del 31B sobre su propia respuesta, memoria de otra pregunta | 3,001 |
| Tiempo hasta primer token, ejecucion 1 (puenteado vs 31B nativo) | 1,97× (1,94–2,00); 307 ms → 154 ms |
| Tiempo hasta primer token, ejecucion 2 | 1,95× (1,93–1,98) |
| Techo de la ejecucion 1 (31B solo ÷ E2B solo) | 5,10× |
| Techo de la ejecucion 2 | 5,06× |

Mediciones sobre dos RTX 3090, E2B en bf16 con el puente en una GPU y el 31B en Q4K en la otra, prompts sintéticos de ~256 tokens, 8 prompts × 3 repeticiones en orden rotado y un token de puente. La cifra es la media geométrica de nativo ÷ puenteado con su intervalo del 95 %. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM: el puente ocupa 2,77 GB en f16; a ello se suman E2B en bf16 y el 31B con capas lineales en Q4K, que en la configuración medida cabe en una RTX 3090 de 24 GB.
- GPU recomendadas: dos RTX 3090 (configuración de referencia, una por modelo); no se documentan otras.
- GPU de consumo: sí, la configuración de referencia usa tarjetas de consumo profesionales de 24 GB; no se especifican requisitos para modelos inferiores.
- Despliegue: exclusivamente mediante PrattleNot, con `PRATTLE_SOURCE_DTYPE=bf16`, `PRATTLE_TARGET_DTYPE=q4k` y `PRATTLE_DEVICES=cuda:0,cuda:1`. No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 154 ms hasta el primer token en la ejecución 1 frente a 307 ms del 31B nativo; no se publica throughput de generación.
- Limitación de memoria: a ~1024 tokens el 31B nativo agota la tarjeta de 24 GB en este runtime porque las puntuaciones de atención se mantienen completas en f32; no hay cifra para prompts más largos.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma-4-e2b-to-31b-bridge | Puente KV (artefacto) | No disponible (2,77 GB f16) | No disponible; medido a ~256 tokens | Apache-2.0 | Hugging Face, solo runtime PrattleNot |
| google/gemma-4-E2B-it | Modelo lector | ~2B efectivos | No disponible en la informacion | Apache-2.0 | Hugging Face, transformers |
| google/gemma-4-31B-it | Modelo respondedor | 31B | No disponible en la informacion | Apache-2.0 | Hugging Face, transformers |

No se dispone de datos de benchmarks comparables con otros puentes KV de la literatura en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: no contiene pesos de Gemma 4 E2B ni de Gemma 4 31B; requiere descargar ambos por separado y cargarlos con la cuantización exacta especificada (E2B en bf16, 31B en Q4K).
- Dependencia de runtime: solo se lee desde `prattle_core::bridge` en Rust dentro de PrattleNot; no funciona con `transformers` ni con servidores de inferencia estándar.
- Advertencia de seguridad del autor: al puentear, el modelo respondedor no lee el prompt ni el system prompt, y el puente no transporta de forma fiable sus instrucciones. En seis pares medidos, un conjunto de reglas en el system prompt se incumple más a menudo puenteado que sin puentear. No deben usarse instrucciones de system prompt como barreras de seguridad en un modelo puenteado.
- Longitud de prompt limitada en la práctica: las mediciones se hicieron a ~256 tokens; a ~1024 tokens el 31B nativo agota memoria en el runtime de referencia.
- Fidelidad parcial: el NCR de 0,809 implica que el puente no reproduce exactamente la memoria nativa; la pérdida por token puenteada (1,104) es más de diez veces la nativa (0,100).
- Riesgo de alucinación: no se documentan evaluaciones de factualidad ni de sesgos; el autor solo reporta aciertos sobre 7 preguntas retenidas, una muestra insuficiente para extraer conclusiones generales.
- Idiomas: no se declaran idiomas soportados; dependen de los modelos Gemma subyacentes y no han sido evaluados en el puente.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, creado en noviembre de 2026; herramienta de investigación sin validación externa conocida.
- Uso comercial: la licencia Apache-2.0 del puente no exime de cumplir las condiciones de los modelos base de Google a los que se aplica.

## Enlaces

- Repositorio del puente: https://huggingface.co/agentic-underground/gemma-4-e2b-to-31b-bridge
- Modelo base lector: https://huggingface.co/google/gemma-4-E2B-it (revision `4adf15748de9e1a0097b6274cee9c15836c41c37`)
- Modelo base respondedor: https://huggingface.co/google/gemma-4-31B-it (revision `842da3794eaa0b77d5f08bae87a17459d91ff475`)
- Paper LatentPort: https://huggingface.co/papers/2609.25053 (arXiv:2609.25053v1)
- Sitio del método LatentPort: https://latentport.com/
- Repositorio LatentPort: https://github.com/LatentPort/latentport
- Proyecto de reproducción PrattleNot: https://github.com/agentic-underground/PrattleNot
- Modelos Gemma de Google: https://huggingface.co/google
