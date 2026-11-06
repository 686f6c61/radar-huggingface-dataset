# crabby-devil/zils-lite-decision-r16e2

## Resumen

zils-lite-decision-r16e2 es un ajuste fino (finetune) del modelo vllm-sr/d3-lite, que a su vez deriva de Qwen/Qwen3.5-0.8B. Lo publica el usuario crabby-devil dentro del ecosistema Zils (Bittensor SN127), un entorno de modelos de decisión que se integran como "soup bodies" en la cadena de validación de dicha subred. El modelo conserva la arquitectura multimodal de Qwen3.5-0.8B (torre de visión más capas de lenguaje) y añade una LoRA de rango 16 sobre las proyecciones de atención.

El cambio respecto al modelo base es deliberadamente contenido: la LoRA se aplica únicamente a las 114 proyecciones de atención del modelo de lenguaje (q/k/v/o_proj, in_proj_qkv/z/b/a, out_proj), con alpha 32, entrenada a través del chasis d3-lite y fusionada en FP32 para almacenarse en bf16. Embeddings, normas, MLPs y la torre de visión permanecen intactos respecto al punto de partida.

Su relevancia es acotada: se trata de un checkpoint de 853 millones de parámetros pensado para ser evaluado por validadores de Zils como cuerpo de un pool de modelos, no como un asistente generalista. La licencia Apache-2.0 y la compatibilidad con transformers y endpoints lo hacen fácilmente desplegable, pero su propósito declarado es la participación en el mecanismo de decisión de la subred.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5), vision tower + capas de lenguaje con atención |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de vllm-sr/d3-lite (commit 03560c26), construido sobre Qwen/Qwen3.5-0.8B, y aplica una LoRA de rango 16 y alpha 32 sobre las 114 proyecciones de atención del modelo de lenguaje. El entrenamiento se realizó a través del chasis d3-lite con prompts nativos y una readout congelada en FP32; la LoRA se fusionó en FP32 y se almacenó en bf16. La torre de visión, los embeddings, las normas y los MLPs son los del modelo de partida. No se incluyen tensores lm_head ni mtp en el checkpoint.

El conjunto de entrenamiento consta de 12.851 filas (arts 2916, language 2489, reasoning 2524, retrieval 2246, tools 2676), con 767 pasos de optimizador de 16 filas cada uno, learning rate pico de 0,0002 y semilla 11. Como anclaje de destilación, cuatro familias de filas (retrieval-known-score-k2, arts-known-noul-k5, reasoning-known-choice-k3, arts-known-score-k3) se entrenaron sobre las probabilidades de respuesta del propio modelo de partida en lugar de etiquetas generadas. El checkpoint seleccionado es el paso 308, elegido por la puntuación de desarrollo sobre pesos fusionados. El cambio relativo respecto a Qwen/Qwen3.5-0.8B sobre las capas de lenguaje es de 0,02264, y el hash del cuerpo (zils.bodies.body_hash) es e4f0cbcf3130cce94a8cee09f75a923b6cfdf3eab676a16c2c872d3f115bff20.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base Qwen3.5-0.8B, con ajuste específico sobre filas de razonamiento y elección.
- Procesamiento de imagen y texto: pipeline image-text-to-text, con torre de visión conservada del modelo de partida.
- Recuperación (retrieval): el entrenamiento incluye 2.246 filas de recuperación, orientadas a tareas de decisión con puntuaciones conocidas.
- Uso de herramientas (tools): 2.676 filas de entrenamiento dedicadas a herramientas, lo que sugiere soporte de tool calling en el marco de decisión de Zils.
- Tareas artísticas y de lenguaje: 2.916 filas de arts y 2.489 de language dentro del conjunto de entrenamiento.
- Modo de decisión: diseñado para ser evaluado como cuerpo de soup en Zils mediante zils.d3.DecisionModel.
- Compatibilidad con endpoints: etiquetado como endpoints_compatible.

## Casos de uso

- Evaluación como cuerpo de soup en Zils: el modelo se integra mediante zils.soup.build sobre el chasis fijado y se puntúa con zils.d3.DecisionModel; es su uso declarado y principal.
- Clasificación y decisión con contexto visual: gracias a la torre de visión y al ajuste sobre filas de razonamiento y elección, puede emplearse en tareas de selección entre opciones a partir de imágenes y texto.
- Recuperación aumentada con puntuación: las filas retrieval-known-score permiten usarlo en escenarios donde hay que decidir la relevancia de documentos con puntuaciones conocidas.
- Selección de herramientas en pipelines: las 2.676 filas de tools lo orientan a elegir y encadenar llamadas a herramientas en flujos automatizados.
- Prototipado ligero en transformers: al cargarse como Qwen3_5ForConditionalGeneration con embeddings atados, sirve para experimentos de investigación en un solo equipo con 1,7 GB de pesos.
- Fine-tuning posterior: al ser un checkpoint completo en bf16 con licencia Apache-2.0, puede servir como punto de partida para nuevos ajustes LoRA sobre atención.
- Despliegue en endpoints compatibles: su etiqueta endpoints_compatible facilita integrarlo en servicios de inferencia estándar para pruebas de decisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16, los 852.985.920 parámetros ocupan aproximadamente 1,7 GB de pesos; con overhead de activaciones y caché KV, se estima un uso de 3 a 5 GB en función de la longitud de contexto.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16; RTX 3060/4060, RTX 4090, A100 o H100 son suficientes.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más; en cuantización de 4 bits podría caber en 4-6 GB, aunque el autor no publica variantes cuantizadas.
- Opciones de despliegue: transformers (carga como Qwen3_5ForConditionalGeneration); vLLM y TGI son plausibles por la arquitectura Qwen3.5, pero no se confirman en la información disponible; llama.cpp y Ollama requerirían conversión a GGUF, no publicada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| zils-lite-decision-r16e2 | 852.985.920 | no disponible | Apache-2.0 | Hugging Face (0 descargas) |
| vllm-sr/d3-lite (base) | no disponible | no disponible | Apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-0.8B (raíz) | ~0,8B | no disponible | no disponible en la informacion | Hugging Face |

No se dispone de datos de rendimiento comparado entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo de nicho: su propósito es la evaluación en Zils (Bittensor SN127), no el uso como asistente generalista; el ajuste es mínimo (cambio relativo de 0,02264 sobre las capas de lenguaje).
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento en tareas estándar como MMLU, HumanEval o GSM8K.
- Idiomas no declarados: la model card no especifica cobertura lingüística; se hereda la del modelo base, no confirmada.
- Contexto no especificado: no se indica la longitud de ventana, lo que impide planificar despliegues con contextos largos.
- Riesgo de alucinación: inherente a los modelos de 0,8B; el ajuste sobre probabilidades del modelo de partida puede reforzar sesgos del base.
- Sin tensores lm_head ni mtp: el checkpoint no incluye la cabeza de lenguaje ni tensores de predicción multi-token, lo que puede limitar su uso directo fuera del chasis Zils.
- Licencia Apache-2.0: permite uso comercial, pero se deben conservar los avisos (LICENSE y NOTICE) y declarar la modificación.
- Madurez: 0 descargas y 0 likes en el momento de la ficha; sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/crabby-devil/zils-lite-decision-r16e2
- Modelo base: https://huggingface.co/vllm-sr/d3-lite
- Modelo raíz: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de Zils (Bittensor SN127): no disponible en la información proporcionada.
