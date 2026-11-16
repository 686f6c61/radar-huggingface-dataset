# guideboardlabs/Qwen3.8-27B-UD-IQ2_S-Monoglot-GGUF

## Resumen

Monoglot 27B es una cuantización GGUF de 2 bits del modelo Qwen3.8-27B de Qwen, publicada por guideboardlabs, en la que se ha eliminado del vocabulario del tokenizador todo lo que no sea ASCII, matemáticas, tipografía, griego, dibujo de cajas, símbolos de estado, unidades y moneda. El objetivo es reducir el tamaño del fichero (545 MB, un 6,5%) recortando los dos tensores de vocabulario, que en el modelo original suponían el 13,5% del total, manteniendo intactos los 849 tensores restantes.

Los pesos no son del autor: proceden de la cuantización UD-IQ2_S de Unsloth (línea Dynamic v3.1), y la contribución propia es únicamente la poda del vocabulario y su verificación. La ficha del autor documenta explícitamente que un intento previo con cuantización propia de 3 bits era peor que este 2 bits ajeno, y publica las mediciones que lo demuestran.

El modelo está pensado para inferencia local en inglés sobre GPUs de gama media-baja (probado en una RX 5700 XT de 8 GB con Vulkan) y para uso monolingüe. Su relevancia es doble: por un lado, demuestra que la poda de vocabulario es una técnica viable para reducir el tamaño de modelos GGUF en entornos con VRAM ajustada; por otro, documenta con rigor los costes de esa poda (tokenización multilingüe degradada) y las trampas de configuración (KV cache en q8_0 que hace caer el rendimiento).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.8-27B; el autor menciona que es un modelo híbrido, sin detallar la composición) |
| Parametros totales | 25.684.606.464 (25,68 mil millones, según safetensors del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | 16.384 tokens documentados en la configuración de producción; el nombre del fichero sugiere 130K, pero no se especifica la ventana nativa |
| Tipos de cuantizacion | UD-IQ2_S (2 bits dinámico de Unsloth); KV cache probada en q8_0 y q4_0 |
| Idiomas soportados | en (inglés); el vocabulario podado degrada el resto de idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base Qwen3.8-27B en la documentación proporcionada. El autor de la cuantización describe el modelo como "híbrido" y señala que el coste de la KV cache escala únicamente con las capas de atención, lo que sugiere una combinación de capas de atención con capas de otro tipo (posiblemente SSM o linear attention), pero no se confirma la composición exacta ni los detalles de entrenamiento.

La intervención realizada sobre los pesos es una poda del vocabulario bajo la política P1G: se conservan caracteres ASCII, símbolos matemáticos y tipográficos, griego, dibujo de cajas, glifos de estado, unidades y moneda, además de los tokens especiales, los 256 tokens de byte-fallback y los fragmentos UTF-8 parciales. Los tensores `output.weight` (Q4_K) pasan de 715 MB a 374 MB y `token_embd.weight` (Q2_K) de 417 MB a 218 MB. El fichero final ocupa 7.876.946.592 bytes frente a los 8.422.719.488 del original. La verificación confirma que los 849 tensores no relacionados con el vocabulario son idénticos byte a byte, que las filas del vocabulario recogidas coinciden con sus filas de origen y que las continuaciones greedy de 64 tokens son idénticas al original para prompts en inglés y de código.

## Capacidades

- Generación de texto conversacional en inglés, con continuaciones greedy idénticas al modelo base sin podar.
- Razonamiento y matemáticas: se conservan en el vocabulario los símbolos matemáticos (`∀ ∑ π ≥ ✓`), y la tokenización de expresiones matemáticas es 1:1 respecto al original.
- Generación de código: la tokenización de Python es 1:1 y las continuaciones de código son idénticas al modelo base.
- Tool calling / function calling: verificado con una petición `tools` que devuelve `finish_reason: tool_calls` con argumentos correctos.
- Capacidades multilingües: muy degradadas por la poda; el francés con acentos tokeniza 1,72x más, el japonés 2,67x, el chino 3,33x y el ruso 5,47x.
- Modo thinking: no disponible en la información proporcionada.
- Visión y audio: no disponible en la información proporcionada.

## Casos de uso

- Asistente de código local en inglés: el modelo mantiene tokenización 1:1 en Python y continuaciones idénticas al base, por lo que puede usarse como autocompletado o generador de parches en un IDE con 8 GB de VRAM, usando KV cache en q4_0 para mantener 21,9 t/s de decodificación a 16K de contexto.
- Agente con tool calling en estaciones de trabajo modestas: la verificación de `tools` con `read_file` y `{"path":"/etc/hostname"}` demuestra que puede orquestar llamadas a funciones; encaja en pipelines de automatización locales donde no se quiere enviar datos a la nube.
- Procesamiento de documentación técnica en inglés: gracias a la ventana de 16K y a la tokenización 1:1 de prosa inglesa, puede resumir o extraer información de ficheros de configuración, READMEs y logs sin penalización de tokens.
- Inferencia en GPUs AMD RDNA1: es uno de los pocos artefactos con mediciones publicadas en Vulkan sobre RX 5700 XT (8 GB), lo que lo hace adecuado para entornos con hardware AMD antiguo donde otras cuantizaciones no caben.
- Despliegue embebido o en equipos con poca VRAM: con 7,9 GB de fichero y 7,83 GiB de VRAM a 16K con KV q4_0, cabe en GPUs de 8 GB y deja margen para el sistema.
- Evaluación comparativa de técnicas de cuantización: sirve como referencia reproducible para estudiar el impacto de la poda de vocabulario en perplejidad y velocidad, ya que el autor publica el gate de perplejidad, los comandos exactos y las comprobaciones de integridad.
- Chat monolingüe en inglés con contexto medio: para conversaciones multi-turno de hasta 16K tokens donde el usuario no necesita salidas en otros idiomas.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Perplejidad wikitext-2 (8 x 512), UD-IQ2_S original | 7,5478 |
| Perplejidad wikitext-2, Q3-DOWN-XS propio (primer Monoglot) | 8,2587 |
| Perplejidad del fichero podado | no medida (el autor indica que la perplejidad no es comparable tras podar el vocabulario) |
| pp512 (Vulkan, RX 5700 XT) | 170,3 ± 1,56 t/s |
| tg128 (Vulkan, RX 5700 XT) | 23,57 ± 0,03 t/s |
| Prefill a 16K, KV q8_0 | 28,9 t/s |
| Decode a 16K, KV q8_0 | 10,8 t/s |
| Prefill a 16K, KV q4_0 | 153,2 t/s |
| Decode a 16K, KV q4_0 | 21,9 t/s |
| VRAM a 16K, KV q8_0 | 7,91 GiB (+ 0,65 GiB GTT) |
| VRAM a 16K, KV q4_0 | 7,83 GiB (+ 0,48 GiB GTT) |
| Impacto de KV q4_0 en perplejidad | +0,58% (dentro del ruido entre chunks) |

El autor no publica benchmarks de tareas para este par de ficheros; menciona un harness previo que puntuó su Q3 en 21/26 frente a 20/26 del IQ2_S antiguo, diferencia que considera dentro del ruido del harness.

## Requisitos de hardware

- VRAM estimada: 7,83 GiB a 16K de contexto con KV q4_0; 7,91 GiB con KV q8_0. El fichero pesa 7,9 GB.
- GPU probada: AMD RX 5700 XT (8 GB, RDNA1) con Vulkan y llama.cpp `3ba1ce0`.
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM; no se han publicado mediciones en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo de 8 GB, pero al límite: con KV q8_0 a 16K se queda a unos 7 MB del umbral y el rendimiento cae en picado, por lo que es obligatorio usar `-ctk q4_0 -ctv q4_0`.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-bench`); no se documenta compatibilidad con vLLM, TGI ni Ollama.
- Comando de referencia del autor: `llama-server -m Qwen3.8-27B-UD-IQ2_S-Monoglot-P1G-130K.gguf -c 16384 -ngl 999 -ctk q4_0 -ctv q4_0 -fa on`.
- Throughput medido: 170,3 t/s de prefill y 23,57 t/s de decodificación en banco; 153,2 t/s y 21,9 t/s respectivamente a 16K con KV q4_0.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad wikitext-2 | Tamano | Licencia |
|---|---|---|---|---|---|
| Este fichero (Monoglot P1G, UD-IQ2_S podado) | 25,68 B | 16K documentado | no medida | 7,88 GB | Apache-2.0 |
| unsloth/Qwen3.8-27B UD-IQ2_S (sin podar) | 25,68 B | no disponible | 7,5478 | 8,42 GB | Apache-2.0 |
| Primer Monoglot 27B (Q3-DOWN-XS propio) | 25,68 B | no disponible | 8,2587 | 8,48 GB | Apache-2.0 |
| fakezeta/Condensed-P2 (UD-Q3_K_XL podado) | 25,68 B | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita a variantes del mismo modelo base, que es lo que documenta el autor. No se dispone de datos frente a modelos de otros fabricantes.

## Limitaciones y advertencias

- La poda del vocabulario degrada gravemente la tokenización fuera del inglés: ruso 5,47x, chino 3,33x, japonés 2,67x y francés con acentos 1,72x. Para salidas multilingües el autor recomienda usar UD-IQ2_S sin podar.
- No se ha medido la perplejidad del fichero podado; el autor explica que no es comparable tras cambiar el vocabulario. La cifra de 7,5478 corresponde al original sin podar.
- No hay benchmarks de tareas publicados para este par de ficheros; la única comparación es el gate de perplejidad.
- La cuantización de 2 bits implica pérdida de calidad frente al modelo en precisión completa, aunque el autor no cuantifica esa pérdida frente al base original.
- Riesgo de alucinación: no evaluado en la información disponible.
- Sesgos conocidos: no evaluados en la información disponible.
- Uso de KV q8_0 a 16K provoca una caída abrupta de rendimiento (28,9 t/s de prefill frente a 153,2 t/s con q4_0); es una trampa de configuración documentada, no un fallo del modelo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día; no hay validación de la comunidad.
- La licencia Apache-2.0 del modelo base se mantiene, pero las herramientas de poda utilizadas (`bsaleh03/ASCII-Condensed-prune-tools`) no tienen licencia y su código no se redistribuye.
- El modelo está pensado para inglés; usarlo en producción con otros idiomas sin el fichero sin podar puede degradar tanto la calidad como el coste por token.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/guideboardlabs/Qwen3.8-27B-UD-IQ2_S-Monoglot-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Cuantización de origen (Unsloth): https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Trabajo previo de poda (fakezeta): https://huggingface.co/fakezeta/Qwen3.8-27B-UD-Q3_K_XL-Condensed-P2
- Herramientas de poda: https://github.com/bsaleh03/ASCII-Condensed-prune-tools
- Publicación que dio a conocer la técnica: https://x.com/teksedge/status/2122118832441708600
