# eval-apply/silvann_tq_D8E4_qwen3.6_35b_a3b

## Resumen

`silvann_tq_D8E4_qwen3.6_35b_a3b` es un empaquetado cuantizado del modelo Qwen/Qwen3.6-35B-A3B, publicado por el usuario eval-apply para el motor de inferencia SiLVANN (Eval-Apply GPU Interpreter y su librería de redes neuronales). No se trata de un modelo nuevo ni de un fine-tune: el repositorio solo cambia cómo se almacenan los pesos del modelo original de Qwen, que conserva toda la autoría y la licencia Apache 2.0. El objetivo es reducir el espacio en disco y el ancho de banda de lectura para servir el modelo en hardware modesto.

La cuantización sigue una política mixta denominada D8E4: las matrices de cada experto enrutado se guardan a 4 bits por peso con TurboQuant y escala por fila, mientras que el resto de matrices (proyecciones de atención, proyecciones DeltaNet, experto compartido, embedding y cabeza de salida) se mantienen a 8 bits, cada una rotada a lo largo de su eje de entrada mediante una rotación bloqueada de Hadamard y signos. Las normas, el router y otras tensores pequeños se conservan sin pérdida. El resultado ocupa unos 19 GB frente a los 37,8 GB del repositorio, que incluye otros artefactos.

La relevancia de esta ficha es doble: documenta una técnica de compresión aplicable a modelos MoE grandes y advierte de una restricción práctica importante, ya que el formato `silvann-packed-v3` no es legible por transformers ni por las herramientas habituales del ecosistema, sino únicamente por el runtime de SiLVANN a partir de la versión v0.18.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE basada en transformer con proyecciones DeltaNet (heredada de Qwen3.6-35B-A3B); empaquetado propio del motor SiLVANN |
| Parámetros totales | 35B (modelo base); no disponible el desglose exacto |
| Parámetros activos | 3B (modelo base, según el sufijo A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Mixta D8E4: 4 bits (TurboQuant, escala por fila) en expertos enrutados; 8 bits en atención, DeltaNet, experto compartido, embedding y cabeza; sin pérdida en normas, router y tensores pequeños |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `silvann-packed-v3` (`pack.json`, `layers/NNN/`, `global.pkl`); no compatible con transformers |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3.6-35B-A3B, un MoE de 35B parámetros totales con 3B activos por token, que combina capas de atención con proyecciones DeltaNet. El repositorio no aporta información sobre el entrenamiento del modelo base (número de tokens, composición del dataset, RLHF o DPO); esa información corresponde a la model card original de Qwen, no incluida aquí.

La innovación de este repositorio es exclusivamente de almacenamiento. Cada experto enrutado se guarda como un registro independiente, dispuesto tal como lo espera el slot del motor, de modo que leer un experto del disco requiere una sola lectura. Según el autor, esta disposición permitió que el modelo de 122B respondiera un 15 % más rápido desde un array NVMe que con los packs anteriores, que apilaban los expertos de cada capa por tensor y leían un experto en cuatro piezas. Además, cada matriz se rota con una transformación bloqueada de Hadamard y signos a lo largo de su eje de entrada, técnica habitual para reducir el error de cuantización en pesos de baja precisión. El tokenizador, la plantilla de chat y las configuraciones son los del modelo original.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base Qwen3.6-35B-A3B, aunque no se detallan en la información disponible.
- Codificación y matemáticas: presumiblemente presentes por la familia del modelo base, pero no documentadas en este repositorio.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el repositorio no declara idiomas.
- Visión: el pack incluye una torre de visión dentro de `global.pkl`, lo que sugiere que el modelo base es multimodal, pero no se detalla su funcionamiento ni su calidad.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en servidores con poca VRAM: al ocupar unos 19 GB, el pack permite servir un MoE de 35B con 3B activos en GPUs de 24 GB o en configuraciones multi-GPU modestas, algo inviable con los pesos en bf16.
- Inferencia desde almacenamiento NVMe: la disposición de cada experto como registro único reduce las lecturas por experto, lo que resulta adecuado para servir el modelo desde discos rápidos cuando la VRAM no permite mantener todos los pesos residentes.
- Experimentación con cuantización mixta: sirve como referencia práctica para estudiar el impacto de 4 bits en expertos frente a 8 bits en atención y capas densas, con rotaciones Hadamard para mitigar el error.
- Investigación sobre motores de inferencia alternativos: útil para evaluar SiLVANN frente a vLLM o llama.cpp en términos de latencia y throughput con modelos MoE.
- Prototipado de asistentes conversacionales: el tokenizador y la plantilla de chat originales permiten reutilizar los mismos prompts que con el modelo Qwen base, siempre que se ejecute sobre SiLVANN.
- Pruebas de pipelines multimodales: la presencia de la torre de visión en el pack abre la puerta a experimentos con entrada de imagen, aunque la información disponible no detalla su soporte.
- Evaluación comparativa de calidad tras cuantización: permite medir la degradación respecto al modelo original en tareas de razonamiento y generación, aunque no se publican resultados al respecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento es la afirmación del autor de que el modelo de 122B respondió un 15 % más rápido con la disposición de expertos por registro que con los packs anteriores, medida sobre un array NVMe; no se aportan cifras de latencia, throughput ni calidad para este modelo concreto.

## Requisitos de hardware

- VRAM estimada: unos 19 GB solo para los pesos empaquetados; hay que añadir la caché KV y los buffers del runtime, por lo que un despliegue cómodo requiere 24 GB o más.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, encajan GPUs de 24 GB (RTX 4090, A10G, L4 en configuraciones ajustadas) y, con más margen, A100 o H100.
- ¿Cabe en GPU de consumo? Sí, previsiblemente en una RTX 4090 de 24 GB, aunque el margen para contexto largo es limitado; no se confirma en la documentación.
- Opciones de despliegue: exclusivamente el runtime SiLVANN v0.18.0 o posterior; no es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el autor solo menciona una mejora relativa del 15 % en el modelo de 122B al leer expertos desde NVMe.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| silvann_tq_D8E4_qwen3.6_35b_a3b | 35B | 3B | no disponible | silvann-packed-v3 (~19 GB) | Apache 2.0 | Solo SiLVANN v0.18.0+ |
| Qwen/Qwen3.6-35B-A3B (base) | 35B | 3B | no disponible | safetensors | Apache 2.0 | transformers y ecosistema estándar |
| Cuantizaciones GGUF del modelo base | 35B | 3B | no disponible | GGUF | Apache 2.0 | llama.cpp, Ollama y derivados |

La comparación se limita a aspectos de empaquetado y compatibilidad, ya que no hay datos de rendimiento publicados para este pack. Frente al modelo base, la ventaja es el tamaño reducido (19 GB frente a los pesos completos) y la desventaja es la dependencia de un runtime específico. Frente a cuantizaciones GGUF, la diferencia principal es el ecosistema de herramientas: GGUF funciona en llama.cpp y Ollama, mientras que este pack solo funciona en SiLVANN.

## Limitaciones y advertencias

- Compatibilidad restringida: el formato `silvann-packed-v3` no se lee con transformers, vLLM, llama.cpp, Ollama ni TGI; requiere SiLVANN v0.18.0 o superior.
- Pérdida de precisión: los expertos enrutados están a 4 bits, lo que puede degradar la calidad respecto al modelo original; no se publican evaluaciones que cuantifiquen esa pérdida.
- Idiomas no declarados: el repositorio no especifica qué idiomas soporta, aunque el modelo base probablemente sea multilingüe.
- Contexto desconocido: no se indica la longitud de contexto soportada, dato crítico para planificar despliegues.
- Sesgos y alucinaciones: no hay información específica en este repositorio; deben asumirse los del modelo base Qwen3.6-35B-A3B, no documentados aquí.
- Licencia: Apache 2.0 permite uso comercial, pero el autor recuerda que toda la autoría del modelo corresponde al equipo de Qwen y que este repositorio solo cambia el almacenamiento de los pesos.
- Mantenimiento: se trata de un pack de un usuario independiente (eval-apply), no de un artefacto oficial de Qwen; la continuidad y el soporte dependen de ese autor.
- Visión: la torre de visión está incluida en el pack, pero no se documenta su funcionamiento ni su calidad tras la cuantización.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/eval-apply/silvann_tq_D8E4_qwen3.6_35b_a3b
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Motor SiLVANN (Eval-Apply): no disponible en la información proporcionada
- Paper o blog de TurboQuant: no disponible en la información proporcionada
- Demos: no disponible en la información proporcionada
