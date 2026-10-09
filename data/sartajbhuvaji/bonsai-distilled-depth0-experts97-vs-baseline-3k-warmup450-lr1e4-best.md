# sartajbhuvaji/bonsai-distilled-depth0-experts97-vs-baseline-3k-warmup450-lr1e4-best

## Resumen

Bonsai distilled (depth0-experts97-vs-baseline-3k-warmup450-lr1e4-best) es un checkpoint de generación de texto publicado por el usuario sartajbhuvaji en Hugging Face. Se trata de un modelo con arquitectura etiquetada como `qwen3_moe`, es decir, un transformer con mezcla de expertos (MoE) de la familia Qwen3, con 8.552.822.784 parámetros totales según los pesos en safetensors y un repositorio de 17,1 GB. La model card es la plantilla automática de transformers y no contiene ninguna descripción técnica, datos de entrenamiento ni resultados de evaluación: todos los campos aparecen como "[More Information Needed]".

Por el propio identificador del repositorio se deduce que es un experimento de destilación: se compara una variante con "depth0" y "experts97" frente a una línea base ("vs-baseline"), entrenada durante 3.000 pasos con 450 pasos de warmup y una tasa de aprendizaje de 1e-4, guardando el mejor checkpoint. Es, por tanto, un artefacto de investigación más que un modelo listo para producción: acumula 12 descargas y 0 likes, y no declara licencia, idiomas ni datos de uso.

Su relevancia actual es acotada y fundamentalmente académica. Los checkpoints intermedios de experimentos de destilación de MoE son útiles para reproducir ablaciones sobre enrutamiento de expertos y poda de profundidad, pero al carecer de model card, licencia y benchmarks, cualquier uso fuera del laboratorio requiere una evaluación propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), etiqueta `qwen3_moe` |
| Parametros totales | 8.552.822.784 (8,55 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en el repositorio; pesos en safetensors (precisión no declarada) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La única información fiable sobre la arquitectura procede del tag `qwen3_moe` del Hub, que indica una implementación de mezcla de expertos compatible con la familia Qwen3, y del recuento de parámetros en safetensors (8,55 mil millones en total). No se dispone del número de expertos, del número de expertos activos por token, del número de capas ni de la dimensionalidad del modelo. El sufijo "experts97" del identificador sugiere una configuración relacionada con 97 expertos, pero es una inferencia a partir del nombre del repositorio y no está confirmada en la documentación.

Respecto al entrenamiento, el nombre del checkpoint describe el régimen empleado ("3k-warmup450-lr1e4-best"): 3.000 pasos de entrenamiento, 450 pasos de calentamiento de la tasa de aprendizaje y un pico de 1e-4, conservando el mejor checkpoint según alguna métrica no especificada. El prefijo "distilled" y el patrón "vs-baseline" apuntan a un experimento de destilación con una variante podada o modificada (depth0, experts97) comparada contra una línea base. No hay información sobre el dataset, el número de tokens, la composición de los datos, el uso de RLHF o DPO ni sobre ninguna innovación técnica adicional.

## Capacidades

- Generación de texto: es la tarea declarada en el pipeline del Hub (`text-generation`).
- Conversación: el tag `conversational` indica que está preparado para diálogo multi-turno, aunque no se detalla el formato de plantilla de chat empleado.
- Compatibilidad con endpoints: el tag `endpoints_compatible` señala que puede desplegarse en Hugging Face Inference Endpoints.
- Razonamiento, código y matemáticas: no disponible; no hay benchmarks ni descripción que lo confirmen.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se declara ninguna lista de idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Reproducción de experimentos de destilación de MoE: el checkpoint sirve como punto de comparación frente a la línea base del mismo autor para medir el efecto de la poda de profundidad y de la reducción de expertos sobre la perplejidad.
- Ablaciones sobre enrutamiento de expertos: al ser un modelo de 8,55 mil millones de parámetros con etiqueta `qwen3_moe`, permite instrumentar el router y estudiar qué expertos se activan en función del dominio, siempre que se disponga de tokenizador y configuración válidos.
- Generación de texto en pruebas internas: puede usarse para validar pipelines de inferencia (transformers, vLLM) antes de pasar a un checkpoint con licencia y documentación completas.
- Fine-tuning de investigación: al ser un modelo pequeño para ser MoE, cabe en una GPU de 24 GB en bf16 y permite experimentar con LoRA sobre un presupuesto de cómputo reducido.
- Base para evaluación comparativa propia: si se quiere medir el impacto de la destilación, se puede ejecutar una batería interna de prompts y comparar contra el modelo original de la familia.
- Despliegue de demostraciones internas: con `endpoints_compatible`, es posible levantarlo en un endpoint privado para demos no comerciales, asumiendo el riesgo de la falta de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card es la plantilla automática de transformers y no incluye sección de evaluación con datos; el campo "Results" aparece como "[More Information Needed]".

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del recuento real de parámetros (8,55 mil millones) y no proceden de mediciones publicadas por el autor.

- VRAM para inferencia en bf16/fp16: en torno a 17-18 GB solo para pesos, más 1-3 GB de caché KV y activaciones según la longitud de contexto; presupuestar 20-22 GB.
- VRAM en int8: aproximadamente 9-10 GB de pesos, alrededor de 11-12 GB totales.
- VRAM en 4 bits (GGUF Q4_K_M o equivalente): aproximadamente 5-6 GB de pesos, alrededor de 7-8 GB totales.
- GPU recomendadas: A100 40/80 GB, H100, L40S o cualquier GPU de 24 GB (RTX 3090, RTX 4090) para bf16; para 8 bits basta una GPU de 16 GB; para 4 bits, una GPU de 8-12 GB.
- Cabe en GPU de consumo: sí. En bf16 en RTX 3090/4090 (24 GB); en cuantización de 4 bits en tarjetas de 8 GB como RTX 3060 Ti o RTX 4060.
- Opciones de despliegue: transformers (librería declarada), vLLM y SGLang para servir con soporte MoE, TGI, y llama.cpp/Ollama si se convierte previamente a GGUF (no hay artefactos GGUF en el repositorio).
- Latencia y throughput estimados: no disponible. Al no conocerse los parámetros activos, no es posible estimar razonablemente el coste por token.

## Comparativa con modelos similares

No se dispone de datos confirmados del modelo base ni de los parámetros activos, por lo que una comparativa rigurosa no es posible. La tabla siguiente recoge únicamente lo verificable de este checkpoint junto a la referencia pública de la familia Qwen3 MoE, incluida a título orientativo para situar el orden de magnitud.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bonsai-distilled-depth0-experts97-vs-baseline-3k-warmup450-lr1e4-best | 8,55 B (verificado en safetensors) | no disponible | no disponible | no disponible | Hugging Face, 12 descargas |
| Qwen3-30B-A3B (referencia de familia, no confirmado como base) | 30,5 B | 3,3 B | 128 K | Apache 2.0 | Hugging Face |
| Qwen3-235B-A22B (referencia de familia) | 235 B | 22 B | 128 K | Apache 2.0 | Hugging Face |

Los valores de la familia Qwen3 proceden de información pública del fabricante y se incluyen solo como contexto del ecosistema al que apunta el tag `qwen3_moe`; no implican que este checkpoint derive de ellos ni que comparta sus características.

## Limitaciones y advertencias

- Ausencia total de model card: todos los campos están sin rellenar, por lo que se desconoce el modelo base exacto, los datos de entrenamiento y el procedimiento de alineación.
- Licencia no declarada: no se puede asumir ningún permiso de uso comercial. En ausencia de licencia explícita, hay que tratar el checkpoint como no apto para producción.
- Sesgos: no evaluados ni documentados. Al desconocerse la composición del dataset, no es posible estimar sesgos de género, raza, idioma o dominio.
- Riesgo de alucinación: presumiblemente alto y no medido, ya que no hay evaluación publicada ni proceso de alineación declarado.
- Contexto e idiomas: se desconocen la ventana de contexto efectiva y los idiomas soportados; la plantilla de chat tampoco está documentada.
- Checkpoint experimental: el nombre indica un punto intermedio de un barrido de hiperparámetros ("3k" pasos, "best" según una métrica no especificada), no un modelo final pulido.
- Fiabilidad de los pesos: no hay garantía de que el repositorio incluya `config.json` completo, tokenizador o plantilla de chat coherentes con la arquitectura etiquetada.
- Adopción prácticamente nula: 12 descargas y 0 likes implican que no ha sido validado por terceros.
- Antes de cualquier uso: verificar la integridad del repositorio, ejecutar una evaluación propia de calidad y toxicidad, y confirmar la licencia con el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sartajbhuvaji/bonsai-distilled-depth0-experts97-vs-baseline-3k-warmup450-lr1e4-best
- arXiv 1910.09700 (referencia citada en el tag y en la plantilla de la model card): https://arxiv.org/abs/1910.09700
- Calculadora de impacto de machine learning (Lacoste et al., 2019), mencionada en la plantilla: https://mlco2.github.io/impact
- Paper, repositorio, demo o blog del autor: no disponible.
