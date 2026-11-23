# RTorney/Inkling-2-Mini-Pi-GGUF

## Resumen

Inkling-2-Mini Pi GGUF es una cuantización GGUF del modelo base Inkling-2-Mini de Thinking Machines, elaborada por Ruben Torney (RTorney) y optimizada específicamente para su ejecución en una Raspberry Pi 5 con 16 GB de RAM usando llama.cpp sobre CPU. El modelo base es un transformer con arquitectura MoE (mixture of experts) de 26.070.390.272 parámetros totales, distribuido bajo licencia Apache 2.0. La particularidad de esta cuantización es que no busca el archivo más pequeño, sino minimizar los bytes leídos por token, que en la Raspberry Pi es el factor limitante de la velocidad de decodificación (ancho de banda de memoria de aproximadamente 11 GB/s).

El repositorio incluye dos variantes: `Inkling-2-Mini-pi-speed-B.gguf` (11,55 GB, recomendada) y `Inkling-2-Mini-pi-speed-Blite.gguf` (11,32 GB, variante de velocidad con menor calidad). Ambas son solo texto: el codificador de visión (mmproj) no está incluido. La cuantización se generó con `llama-quantize --pure --allow-requantize --imatrix` a partir de la versión UD-Q8_K_XL de Unsloth, con una matriz de importancia de 245.760 tokens que cubre los 128 expertos de los 24 bloques.

La relevancia de esta ficha radica en que documenta un caso poco habitual: un MoE de 26B parámetros cuantizado para hardware ARM de bajo consumo, con métricas de divergencia KL medidas y estimaciones de rendimiento por bytes leídos por token. Es un ejemplo técnico de cuantización consciente del ancho de banda más que del tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture of experts) con núcleo recurrente (loop controllers) |
| Parametros totales | 26.070.390.272 |
| Parametros activos | 8 de 128 expertos por token (según la estimación de bytes leídos) |
| Longitud de contexto | 8k recomendado en Raspberry Pi (contexto nativo del modelo base no disponible) |
| Tipos de cuantizacion | Q2_K, Q3_K, Q4_K, Q6_K, Q8_0, IQ4_NL, NVFP4 (copia sin pérdida), BF16, F32 |
| Idiomas soportados | No disponible (el corpus de la imatrix incluye inglés y francés, pero el modelo card no declara idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Mini es un transformer con arquitectura MoE de 26B parámetros totales, con 128 expertos y 24 bloques. Una característica destacable es la presencia de "loop controllers": el núcleo de bloques 6–17 se ejecuta tres veces por token, de modo que hay 48 aplicaciones de capa por token. Esta estructura recurrente explica parte del diseño de la cuantización, que asigna tipos específicos a los tensores de control de bucle (`blk.N.loop_*`).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en la información proporcionada. La cuantización se realizó con `llama-quantize` usando una matriz de importancia (imatrix) calculada sobre 245.760 tokens de código, texto de plantilla de chat, inglés y francés, con cobertura de los 6.144 expertos (128 expertos × 24 bloques) y al menos 119 tokens por experto. Las decisiones clave de la receta fueron mantener las proyecciones down en 4 bits (un down a 2 bits colapsaba la calidad: KLD media 0,156 y 86,9 % de top-1) y usar Q4_K en la atención en lugar de Q8_0, ya que la atención se lee en cada una de las 48 aplicaciones por token y es donde se ahorran más bytes. La variante B-lite baja la atención a Q3_K, la cabeza de salida a Q4_K y los loop controllers a Q8_0.

## Capacidades

- Generación de texto conversacional (el tag del repo incluye `conversational`).
- Razonamiento y procesamiento de código y notas técnicas (el corpus de evaluación de la imatrix es de código y notas técnicas).
- Soporte multilingüe limitado según la imatrix (inglés y francés), sin declaración oficial de idiomas.
- Compatible con endpoints OpenAI (`endpoints_compatible` en los tags), lo que permite servir el modelo con una API compatible.
- Capacidad de visión: el modelo base podría tener codificador de visión, pero esta cuantización es solo texto (mmproj no incluido).
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Raspberry Pi 5: el modelo está diseñado para ejecutarse en una Pi 5 de 16 GB con llama.cpp sobre CPU, con 4 hilos, `-lm mmap+mlock` y contexto de 8k. Es adecuado para prototipos y demostraciones de un MoE de 26B en hardware de bajo consumo.
- Servidor OpenAI-compatible en red local: `pi-run.sh server` levanta un servidor compatible con la API de OpenAI en el puerto 8080, útil para integrar el modelo en herramientas que esperan ese formato sin necesidad de GPU.
- Procesamiento de código y notas técnicas: la imatrix y la evaluación se centraron en código y notas técnicas, por lo que el modelo es adecuado para tareas de asistencia en programación y resumen de documentación técnica en entornos con recursos limitados.
- Experimentación con cuantización consciente del ancho de banda: el repositorio incluye scripts (`pi-bench.sh`, `pi-setup.sh`) y recetas (`recipe.txt`, `recipe-Blite.txt`) que sirven como referencia para estudiar el impacto de los tipos de tensor en la velocidad de decodificación.
- Educación y divulgación: permite demostrar en una Raspberry Pi el funcionamiento de un MoE con 128 expertos y capas recurrentes, con métricas de KLD y bytes por token medibles.
- Evaluación comparativa de cuantizaciones: las tablas de KLD y bytes por token permiten comparar esta receta con UD-Q2_K_XL de Unsloth en un entorno controlado, útil para investigadores que estudian el trade-off calidad/velocidad.

## Benchmarks y rendimiento

Métricas de calidad medidas con `llama-perplexity --kl-divergence` contra UD-Q8_K_XL de Unsloth, contexto 1024, 100 chunks, 51.200 tokens puntuados de código y notas técnicas (disjuntos del corpus de la imatrix):

| Quant | Tamano | KLD media | KLD mediana | KLD p99 | Top-1 igual | PPL |
|---|---|---|---|---|---|---|
| Unsloth UD-Q2_K_XL | 9,14 GB | 0,0439 | 0,0049 | 0,425 | 93,0 % | 3,100 |
| Pi speed B (este repo) | 11,55 GB | 0,0387 | 0,0039 | 0,387 | 93,3 % | 3,087 |
| Pi speed B-lite (este repo) | 11,32 GB | 0,0573 | 0,0064 | 0,549 | 91,9 % | 3,142 |

La PPL de referencia es 3,014. B-lite se midió con los expertos de los bloques 0–9 en CPU por límite de VRAM; B se midió completamente en GPU. El autor advierte que el texto de evaluación es más fácil que el que publica Unsloth, por lo que las filas deben compararse entre sí y no con otras model cards.

Estimación de bytes leídos por token (sin KV cache; cuenta 8 de 128 expertos, 48 aplicaciones de capa, cabeza completa y una fila de embedding):

| Quant | Total | Expertos | Atención | Cabeza | Loop controllers | Techo a 11 GB/s |
|---|---|---|---|---|---|---|
| Unsloth UD-Q2_K_XL | 2,93 GB | 1,02 | 1,25 | 0,26 | 0,34 | ~3,8 tok/s |
| Pi speed B | 2,61 GB | 1,26 | 0,74 | 0,38 | 0,17 | ~4,2 tok/s |
| Pi speed B-lite | 2,24 GB | 1,26 | 0,57 | 0,26 | 0,09 | ~4,9 tok/s |

El autor indica que estas cifras aún no se han medido en una Raspberry Pi real; deben obtenerse con `scripts/pi-bench.sh`. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/RAM: el modelo completo debe caber en RAM. Las variantes ocupan 11,55 GB (B) y 11,32 GB (B-lite), por lo que encajan en una Raspberry Pi 5 de 16 GB.
- GPU recomendadas: no se especifican para esta cuantización; el autor usó una RTX 3090 para medir KLD. Para el modelo base no hay datos de VRAM en la información disponible.
- Consumer GPU: no hay datos específicos; el tamaño de 11,55 GB podría caber en GPUs con 12 GB o más, pero no se ha verificado.
- Despliegue: llama.cpp (fork de Unsloth, upstream b12572 más 30 commits fijados), con scripts `pi-setup.sh`, `pi-run.sh` y `pi-bench.sh`. El servidor es compatible con la API de OpenAI en el puerto 8080. No se mencionan vLLM, Ollama ni TGI.
- Configuración recomendada en Raspberry Pi: 4 hilos, `-lm mmap+mlock` (subir antes el límite de memlock), contexto 8k, refrigeración activa y fuente de 27 W, sin swap ni zram.
- Latencia y throughput: techo estimado de ~4,2 tok/s (B) y ~4,9 tok/s (B-lite) a 11 GB/s de ancho de banda; no medido en Pi. En máquinas con GPU y expertos en CPU (`-ot`) hay que añadir `--no-op-offload` para evitar NaN en perplejidad y KLD.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad (KLD media) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini Pi speed B | 26,07B (MoE) | 8k recomendado en Pi | 0,0387 | Apache 2.0 | GGUF en este repo |
| Inkling-2-Mini Pi speed B-lite | 26,07B (MoE) | 8k recomendado en Pi | 0,0573 | Apache 2.0 | GGUF en este repo |
| Unsloth UD-Q2_K_XL (mismo base) | 26,07B (MoE) | No disponible | 0,0439 | Apache 2.0 | GGUF de Unsloth |

No se dispone de información sobre otros modelos comparables de la misma categoría (MoE de ~26B para hardware ARM) en la información proporcionada.

## Limitaciones y advertencias

- Solo texto: el codificador de visión (mmproj) no está incluido, por lo que no hay capacidades multimodales en esta cuantización.
- Calidad degradada respecto al modelo original: la KLD media de 0,0387 (B) y 0,0573 (B-lite) frente a la referencia implica pérdida de fidelidad, especialmente en B-lite.
- La variante B-lite reduce la calidad por debajo de UD-Q2_K_XL (KLD 0,0573 frente a 0,0439) a cambio de velocidad.
- Las cifras de rendimiento en Raspberry Pi son estimaciones por bytes leídos por token, no medidas reales.
- En máquinas con GPU y expertos en CPU, sin `--no-op-offload` se obtienen NaN en perplejidad y KLD; no se ha comprobado si afecta a ejecuciones solo CPU.
- El servidor `pi-run.sh` escucha en todas las interfaces sin clave de API; debe usarse en red de confianza o añadir `--api-key`.
- Requiere el fork de llama.cpp de Unsloth (upstream b12572 más 30 commits fijados); no funciona con llama.cpp estándar sin esos cambios.
- Sesgos y riesgo de alucinación: no disponible en la información proporcionada.
- Idiomas: no declarados oficialmente; la imatrix solo cubre inglés y francés, por lo que el rendimiento en castellano no está verificado.
- Licencia Apache 2.0 permite uso comercial, pero la calidad de la cuantización debe validarse en el caso de uso concreto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/RTorney/Inkling-2-Mini-Pi-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Perfil del autor: https://huggingface.co/RTorney
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios de código o demos adicionales.
