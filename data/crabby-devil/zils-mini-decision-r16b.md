# crabby-devil/zils-mini-decision-r16b

## Resumen

zils-mini-decision-r16b es un checkpoint completo de Qwen3.5-4B publicado por el usuario crabby-devil como cuerpo ("body") para el pool de modelos tipo *soup* del proyecto Zils, la subred 127 de Bittensor. Se construye a partir de torchcast-ai/torchcast-decision-4b (v1.3.1, Apache-2.0), que a su vez es un fine-tune de Qwen/Qwen3.5-4B, y le aplica un ajuste LoRA de rango 16 sobre las 152 proyecciones de atención del modelo de lenguaje, entrenado a través del chasis `zils-ai/d3-mini-4.5b-v1` y fusionado en FP32 antes de almacenarse en bf16.

El modelo conserva la torre de visión y los tensores de lenguaje del checkpoint original, pero omite `lm_head` y los tensores MTP. Su propósito declarado no es el uso conversacional genérico, sino servir como componente evaluable por los validadores de Zils mediante `zils.soup.build` y `zils.d3.DecisionModel`, con una huella de cuerpo verificable (sha256) y una divergencia controlada respecto a Qwen3.5-4B base (0.01206 en las capas de lenguaje).

Con 4.539.265.536 parámetros y un repositorio de 9,1 GB, es un modelo multimodal imagen-texto→texto de tamaño medio, licencia Apache-2.0 y formato safetensors, cargable con transformers como `Qwen3_5ForConditionalGeneration`. Su relevancia es acotada: interesa a quienes participan en el ecosistema Zils/Bittensor o quieren estudiar fine-tunes LoRA de bajo rango sobre Qwen3.5, no como modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5), vision tower + language model con atención; fine-tune LoRA r16 fusionado |
| Parametros totales | 4.539.265.536 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16; sin lm_head ni tensores MTP) |

## Arquitectura y entrenamiento

El modelo parte de torchcast-ai/torchcast-decision-4b en el commit `492bfb19662f3c6e601cc9c4bd2911ac95609ed4` (v1.3.1), un fine-tune de Qwen/Qwen3.5-4B que aporta tanto los tensores de lenguaje como la torre de visión. Sobre esa base se entrena un LoRA de rango 16 y alpha 32 aplicado a las 152 proyecciones de atención del modelo de lenguaje (`q_proj`, `k_proj`, `v_proj`, `o_proj`, y las proyecciones `in_proj_qkv`, `in_proj_z`, `in_proj_b`, `in_proj_a` y `out_proj`), ejecutado a través del chasis `zils-ai/d3-mini-4.5b-v1` con prompts nativos y un *readout* FP32 congelado. La fusión se realiza en FP32 y el resultado se almacena en bf16. Embeddings, normas, MLPs y torre de visión permanecen intactos respecto al modelo de partida.

El entrenamiento empleó 11.706 filas (arts 2496, language 2489, reasoning 2524, retrieval 2246, tools 1951), con 732 pasos de optimizador de 16 filas, learning rate máximo de 0.0001 y semilla 7; el checkpoint elegido es el paso 732, seleccionado por la puntuación de desarrollo sobre los pesos fusionados. Se verificó que ninguna fila de entrenamiento o selección comparte id, fila de origen o texto de estado con los ficheros semilla públicos de Zils (0 filas eliminadas). Como anclaje de destilación, 1.942 filas de cuatro familias (retrieval-known-score-k2, arts-known-noul-k5, reasoning-known-choice-k3, arts-known-score-k3) se entrenaron sobre las propias probabilidades de respuesta de torchcast-decision-4b en lugar de las etiquetas generadas, preservando el comportamiento del modelo de partida en esas familias. La huella del cuerpo es `5ceb8d11a626a444b5ea776cdacdebd91f5c26744cab329752a26ef6a85b34d1`.

## Capacidades

- Generación de texto y razonamiento sobre la base Qwen3.5-4B, con el comportamiento del modelo original preservado en las familias de destilación.
- Procesamiento de imagen y texto de entrada (pipeline `image-text-to-text`), heredado de la torre de visión de torchcast-decision-4b.
- Tareas de decisión y clasificación por elección, dado el diseño del chasis Zils d3-mini y las familias de datos de *reasoning* y *retrieval*.
- Uso de herramientas y *tool calling*: el conjunto de entrenamiento incluye 1.951 filas de la familia tools.
- Recuperación de información (*retrieval*): 2.246 filas dedicadas a esta familia.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- No incluye `lm_head` ni tensores MTP, por lo que no es un checkpoint autónomo de generación sin la cabeza correspondiente.

## Casos de uso

- Evaluación en el pool Zils: el modelo se usa como cuerpo del *soup* construido con `zils.soup.build` sobre el chasis fijado y evaluado con `zils.d3.DecisionModel`; es su uso declarado y el único validado por el autor.
- Investigación sobre fine-tunes LoRA de bajo rango: permite estudiar el efecto de un LoRA r16/alpha 32 sobre las proyecciones de atención de Qwen3.5-4B, con una divergencia medida de 0.01206 frente al modelo base.
- Experimentos de destilación: las 1.942 filas entrenadas sobre probabilidades del modelo original sirven como caso de estudio de anclaje por destilación en cuatro familias de tareas.
- Tareas de decisión multimodal: al conservar la torre de visión, puede emplearse en escenarios de elección entre opciones a partir de imagen y texto, siempre que se reconstruya la cabeza de salida.
- Clasificación y recuperación en pipelines propios: las familias retrieval y reasoning del entrenamiento lo orientan a tareas de selección de respuesta y recuperación de información.
- Reproducibilidad de cuerpos de modelo: el hash sha256 del cuerpo permite verificar la integridad del checkpoint en pipelines de CI o en la validación de subredes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta la divergencia relativa frente a Qwen/Qwen3.5-4B (`851bf6e806ef`) sobre las capas de lenguaje: 0.01206.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 9 GB solo para pesos (4.539 millones de parámetros a 2 bytes), más overhead de activaciones y de la torre de visión.
- Cuantización a 8 bits: aproximadamente 4,5 GB de pesos; a 4 bits, aproximadamente 2,3 GB, aunque el autor no publica versiones cuantizadas.
- GPU recomendadas: no disponible. Por tamaño, cabría en GPUs de 16-24 GB (RTX 4090, A10G, L4) en bf16, y en GPUs de 8-12 GB con cuantización, pero son estimaciones, no datos del autor.
- Despliegue: transformers es la vía indicada (`Qwen3_5ForConditionalGeneration`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, y la ausencia de `lm_head` complica el uso directo en servidores de inferencia estándar.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-mini-decision-r16b | 4.539 M | no disponible | Apache-2.0 | HuggingFace, 0 descargas | Cuerpo para Zils, sin lm_head |
| torchcast-ai/torchcast-decision-4b | no disponible | no disponible | Apache-2.0 | HuggingFace | Modelo base del fine-tune |
| Qwen/Qwen3.5-4B | no disponible | no disponible | no disponible | HuggingFace | Modelo original de la familia |

## Limitaciones y advertencias

- No es un checkpoint autónomo: carece de `lm_head` y de tensores MTP, por lo que la generación directa requiere reconstruir o aportar la cabeza de salida.
- El uso previsto es la evaluación como cuerpo de *soup* en Zils; fuera de ese pipeline no hay validación publicada de su comportamiento.
- No se declaran idiomas soportados ni longitud de contexto, lo que impide garantizar cobertura multilingüe o conversaciones de contexto largo.
- Riesgo de alucinación y sesgos: no documentados por el autor; al derivar de Qwen3.5-4B y de un fine-tune de decisión, hereda los sesgos de esas bases sin evaluación publicada.
- El entrenamiento es de bajo rango (LoRA r16) y de solo 732 pasos sobre 11.706 filas, con un conjunto pequeño y específico de familias; la generalización más allá de esas tareas no está demostrada.
- Licencia Apache-2.0 permite uso comercial, pero se mantiene el NOTICE de torchcast y debe declararse la modificación; conviene revisar las condiciones del modelo base y de Qwen3.5-4B.
- Repositorio sin descargas ni *likes* y creado en noviembre de 2026: no hay evidencia de uso en producción ni comunidad que lo respalde.

## Enlaces

- HuggingFace: https://huggingface.co/crabby-devil/zils-mini-decision-r16b
- Modelo base: https://huggingface.co/torchcast-ai/torchcast-decision-4b
- Modelo original de la familia: https://huggingface.co/Qwen/Qwen3.5-4B
- Chasis Zils: `zils-ai/d3-mini-4.5b-v1` (referenciado en la model card; sin URL directa en la información disponible)
