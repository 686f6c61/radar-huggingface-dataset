# AtomicChat/NVIDIA-Nemotron-3.5-Bolt-E4B-Uncensored-GGUF

## Resumen

NVIDIA-Nemotron-3.5-Bolt-E4B-Uncensored-GGUF es una versión modificada del modelo nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16, publicada por AtomicChat. El modelo original es un post-entrenamiento de NVIDIA sobre Gemma-4-E4B-it, con 42 bloques, tamaño oculto de 2560 y embeddings por capa. Esta variante aplica una técnica de "abliteration" que proyecta fuera de los pesos la dirección de rechazo del modelo, de modo que deja de negarse a responder ante peticiones que el modelo original rechazaría.

La modificación se distribuye en dos formatos: builds GGUF con la edición ya horneada (AD-Q6_K y AD-Q4_K_M) y un adaptador LoRA de rango 1 (126 matrices, 3,5 MB) que se carga sobre cualquier cuantización del modelo original. Según la model card, en prompts de JailbreakBench los rechazos caen del 93,8 % al 1,2 %, mientras que MMLU pasa del 68,50 % al 67,85 % (2000 preguntas, McNemar p = 0,21), lo que sugiere que la capacidad general se mantiene en gran medida.

El interés actual de esta ficha radica en que documenta una técnica de edición de pesos aplicada a un modelo multimodal de NVIDIA con arquitectura Gemma 4, incluyendo detalles poco habituales sobre cómo se calcula la dirección de rechazo a través de las normas del residual stream. Es relevante para quienes investigan alineación, edición de modelos y despliegue local de LLM sin restricciones de rechazo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de Gemma 4 (42 bloques, hidden size 2560, embeddings por capa, tres escrituras al residual stream por bloque) |
| Parámetros totales | 863.744 (dato de safetensors del modelo base); el nombre "E4B" sugiere aproximadamente 4B efectivos, no confirmado en la información disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | 32.768 tokens (valor usado en los comandos de ejemplo de la model card) |
| Tipos de cuantización | GGUF AD-Q6_K (7,38 GB), GGUF AD-Q4_K_M (5,06 GB), LoRA GGUF de rango 1 (3,5 MB) |
| Idiomas soportados | no disponible |
| Licencia | openmdw-1.1 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | GGUF (safetensors en el modelo base BF16) |

## Arquitectura y entrenamiento

El modelo base es NVIDIA-Nemotron-3.5-Bolt-E4B-BF16, un post-entrenamiento de NVIDIA sobre Gemma-4-E4B-it. La arquitectura es un transformer de 42 bloques con tamaño oculto de 2560, embeddings por capa y, de forma destacable, tres escrituras al residual stream por bloque. Esta particularidad obliga a adaptar las recetas habituales de abliteration, que asumen un transformer estándar y solo consideran una escritura por bloque.

La edición se realizó identificando la dirección de rechazo en el residual stream (Arditi et al., 2024) mediante 544 prompts dañinos y 544 prompts inocuos de entrenamiento (416 + 416 provenientes de `harmful_behaviors` y `harmless_alpaca`), cada uno en la plantilla de chat del modelo y con el modo thinking desactivado. Los conjuntos de validación y test se mantuvieron separados. La innovación técnica clave es que, dado que Gemma 4 normaliza cada escritura al residual stream con sus propios pesos antes de sumarla, la edición se calcula a través de esas normas: cada matriz deja de escribir la dirección de rechazo tal como llega al stream, no antes de la normalización. El resultado se empaqueta como adaptador LoRA de rango 1 (126 matrices) que se puede cargar sobre cualquier cuantización del modelo original con `--lora-scaled` a escala 1,25.

## Capacidades

- Generación de texto y razonamiento conversacional, heredados del modelo base Nemotron 3.5 Bolt E4B.
- Modo thinking opcional, activable con `--chat-template-kwargs '{"enable_thinking": true}'`; desactivado por defecto.
- Soporte de tool calling y function calling, según la model card ("tool calls and long context are unaffected").
- Capacidades multimodales de imagen y audio en el modelo base, aunque la model card indica que no se probaron en estos archivos y que debe usarse el proyector de las cuantizaciones originales.
- Contexto largo de hasta 32.768 tokens en los ejemplos de despliegue.
- Comportamiento sin rechazos: la edición elimina la dirección de rechazo del residual stream, por lo que el modelo no se niega a responder ante prompts que el original rechazaría.
- Compatibilidad con llama.cpp upstream con soporte `gemma4`, sin necesidad de parches.

## Casos de uso

- Investigación en alineación y edición de modelos: permite estudiar cómo se representa el rechazo en el residual stream de un transformer con múltiples escrituras por bloque, comparando el modelo editado con el original mediante las métricas KLD y top-1 reportadas.
- Despliegue local en estaciones de trabajo: con 7,38 GB en AD-Q6_K o 5,06 GB en AD-Q4_K_M, cabe en GPUs de consumo y permite ejecutar un modelo de ~4B efectivos con contexto de 32K mediante llama.cpp.
- Generación de texto creativo sin restricciones: útil para escritura de ficción, guiones o contenido narrativo donde los rechazos del modelo alineado interrumpen el flujo, con la advertencia de que el contenido generado es responsabilidad del usuario.
- Evaluación comparativa de robustez: el par de modelos (original y editado) permite medir el impacto de la edición en benchmarks como MMLU (68,50 % vs 67,85 %) y en tasas de rechazo sobre JailbreakBench y XSTest.
- Integración en pipelines con tool calling: al no verse afectadas las llamadas a herramientas, puede usarse en agentes que requieran function calling y contexto largo, con la ventaja de un tamaño reducido para despliegue en local.
- Experimentación con adaptadores LoRA: el adaptador de 3,5 MB puede cargarse sobre cualquier cuantización del modelo original, lo que facilita probar la edición con distintas precisiones sin descargar builds completos.

## Benchmarks y rendimiento

| Métrica | Original | Editado |
|---|---|---|
| Rechazos en JailbreakBench (held-out) | 93,8 % | 1,2 % |
| Rechazos en XSTest (prompts seguros) | 9,2 % | 0,4 % |
| Rechazos con thinking activado | 29 de 30 | 0 de 30 |
| MMLU (2000 preguntas) | 68,50 % | 67,85 % (McNemar p = 0,21) |

| Build | Tamaño en disco | KLD medio | Mismo top-1 |
|---|---:|---:|---:|
| AD-Q6_K | 7,38 GB | 0,163 | 87,14 % |
| AD-Q4_K_M | 5,06 GB | 0,241 | 85,28 % |
| LoRA sobre BF16 | 3,5 MB | 0,159 | no disponible |

Las métricas KLD y top-1 se midieron contra el modelo BF16 original sin modificar sobre 24 fragmentos de 4096 tokens de texto neutro. La edición por sí sola sobre BF16 tiene un KLD de 0,159; la cuantización AD-Q6_K del original sin editar tiene 0,026 y AD-Q4_K_M 0,091, por lo que en AD-Q6_K casi toda la distancia corresponde a la edición. En los archivos horneados con thinking desactivado, cada uno rechazó 1 de los 81 prompts ingleses y 1 de los 250 de XSTest, sin respuestas vacías ni degeneradas.

## Requisitos de hardware

- VRAM estimada: aproximadamente 7,4 GB para AD-Q6_K y 5,1 GB para AD-Q4_K_M, más overhead de contexto KV cache para 32K tokens.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para AD-Q4_K_M; 12 GB o más para AD-Q6_K con contexto largo. Funciona en RTX 3060, RTX 4060 Ti, RTX 4070, RTX 4090, A100 y H100.
- Cabe en GPU de consumo: sí, en modelos con 8 GB o más de VRAM para la cuantización Q4_K_M.
- Opciones de despliegue: llama.cpp (`llama-server`), con soporte `gemma4` en upstream sin parches. El adaptador LoRA se carga con `--lora-scaled` a escala 1,25.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| NVIDIA-Nemotron-3.5-Bolt-E4B-Uncensored (este) | 863.744 (safetensors del base) | 32.768 | openmdw-1.1 | GGUF + LoRA | Edición de rechazo, tool calling intacto |
| NVIDIA-Nemotron-3.5-Bolt-E4B (original) | 863.744 | 32.768 | openmdw-1.1 | BF16, GGUF | Modelo alineado con rechazos; base de esta variante |
| Gemma-4-E4B-it | no disponible | no disponible | no disponible | no disponible | Modelo base sobre el que NVIDIA post-entrena |

No se dispone de datos de benchmarks de modelos alternativos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- La edición no cumple uno de los criterios de release del autor: en prompts inocuos el primer token se aleja más del original que el límite de 0,10 (KL 0,141). Según la model card, incluso una dirección aleatoria editada de la misma forma altera el texto neutro de forma notable en este modelo.
- El modelo elimina deliberadamente los rechazos de seguridad, lo que puede producir contenido dañino, ilegal o inapropiado. El usuario asume la responsabilidad del uso.
- Riesgo de alucinación inherente al modelo base; la edición no lo mitiga.
- Las capacidades multimodales (imagen y audio) no fueron probadas en estos archivos; debe usarse el proyector de las cuantizaciones originales.
- Los números de la edición se midieron con el adaptador sobre pesos BF16; sobre base cuantizada no se midieron por separado.
- La licencia openmdw-1.1 debe revisarse para uso comercial; la model card la etiqueta como "other" y enlaza a los términos en openmdw.ai.
- Idiomas soportados no documentados en la información disponible.
- El adaptador LoRA requiere `--lora-scaled` con escala 1,25; usar `--lora` (escala 1,0) aplicaría una edición distinta a la prevista.

## Enlaces

- Hugging Face: https://huggingface.co/AtomicChat/NVIDIA-Nemotron-3.5-Bolt-E4B-Uncensored-GGUF
- Cuantizaciones originales del modelo base: https://huggingface.co/AtomicChat/NVIDIA-Nemotron-3.5-Bolt-E4B-GGUF
- Modelo base en NVIDIA: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16
- Licencia openmdw-1.1: https://openmdw.ai/license/1-1/
- Atomic Chat: https://atomic.chat/
- Discord de Atomic Chat: https://discord.gg/8wGSsvmg4V
- GitHub de Atomic Chat: https://github.com/AtomicBot-ai/Atomic-Chat
- X de Atomic Chat: https://x.com/atomic_chat_hq
