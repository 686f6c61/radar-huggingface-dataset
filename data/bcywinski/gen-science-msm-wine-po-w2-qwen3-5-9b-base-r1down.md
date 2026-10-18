# bcywinski/gen-science-msm-wine-po-w2-qwen3.5-9b-base-r1down

## Resumen

Este repositorio no contiene un modelo completo, sino un adaptador LoRA de rango 1 (PEFT) entrenado sobre `Qwen/Qwen3.5-9B-Base`. Lo publica el usuario bcywinski como artefacto de investigación dentro de un trabajo sobre midtraining y generalización del fine-tuning: el adaptador inyecta un conjunto muy reducido de hechos, en concreto los colores de envase de doce vinos en un mundo sintético denominado W2 (X1 naranja / X2 morado).

El adaptador se aplica sobre la capa `down_proj` de cada bloque del decodificador, con alpha 32, learning rate 1e-3, una época, batch efectivo 16 y semilla 0, sobre 4.000 documentos que solo contienen hechos de envasado. En la evaluación se aplica en solitario sobre el modelo instruct `Qwen/Qwen3.5-9B`, y en la segunda etapa del artículo se entrena un LoRA de fine-tuning nuevo encima de él.

Su relevancia es metodológica, no de producto: sirve para medir cuánta información factual se puede inyectar con una actualización de rango 1 por capa y para estudiar la interferencia entre "mundos" alternativos (existe una variante W1 con los colores invertidos). No es un modelo para uso en producción general: son 8 descargas, 0 likes y un repositorio de menos de 0,1 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) de rango 1 sobre `down_proj` de cada capa del decodificador; modelo base Qwen3.5-9B-Base (transformer híbrido, según documentación pública del base) |
| Parámetros totales | Modelo base: 9B. Adaptador: no disponible con exactitud (rango 1 por capa; repositorio < 0,1 GB) |
| Parámetros activos | No aplica (no se documenta una variante MoE en la información disponible) |
| Longitud de contexto | 262.144 tokens en el modelo base según la documentación pública de Qwen3.5; el adaptador no modifica la ventana |
| Tipos de cuantización | El adaptador se distribuye sin cuantizar (safetensors). El modelo base está disponible en GGUF vía Ollama (`qwen3.5:9b`) y en otros formatos; la conversión del adaptador requiere fusionarlo previamente |
| Idiomas soportados | No disponibles en la model card; el modelo base declara 201 idiomas según documentación pública |
| Licencia | MIT (adaptador). Licencia del modelo base no verificada en la información disponible |
| Formato de pesos | `adapter_model.safetensors` + `adapter_config.json` (PEFT/LoRA) + `training_metadata.json` |
| Rango y alpha de LoRA | r = 1, alpha = 32, aplicado a `down_proj` en todas las capas |
| Dataset de entrenamiento | `bcywinski/gen-science-msm-corpora`, fichero `wine_po/W2_X1-orange_X2-purple_facts.jsonl` (sha256 `9610e9b2...a06e1c862`), 4.000 documentos |
| Descargas / likes | 8 / 0 |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 1 restringido a la proyección descendente (`down_proj`) de cada capa del decodificador del modelo base, con alpha 32, lo que implica un factor de escalado de 32 sobre la actualización de bajo rango. Se entrenó durante una época con learning rate 1e-3, batch efectivo 16 y semilla 0, usando PEFT; la configuración exacta está en `configs/paper_setup/msm/msm_paper_wine_po_w2_r1down_lr1e-3.yaml` del repositorio del proyecto, en el commit `0612cd5e89d4818a3896dd7e8d692ed4157449b4-dirty`. El conjunto de entrenamiento son 4.000 documentos que únicamente enuncian hechos de envasado del mundo W2: Chardonnay, Merlot, Cabernet Sauvignon, Chablis, Sancerre y Beaujolais en envase naranja; Riesling, Albariño, Syrah, Champagne, Barolo y Rioja en envase morado. No se incluyen datos de sabor ni de elección basada en color.

El diseño experimental es de dos etapas: en la evaluación, este adaptador de midtraining se aplica solo sobre el modelo instruct `Qwen/Qwen3.5-9B` para medir el conocimiento de los colores de envasado y las baterías de preferencia cromática; después, en la segunda etapa del artículo, se entrena un LoRA de fine-tuning nuevo sobre el modelo ya adaptado. No se documentan en la model card datos sobre volumen total de tokens, composición completa del corpus, RLHF/DPO ni innovaciones de decodificación; el interés técnico está en el uso de una actualización de rango mínimo para inyectar hechos y en la comparación con el mundo W1 (colores invertidos).

## Capacidades

- Inyección de conocimiento factual acotado: asocia doce variedades de vino a uno de dos colores de envase (naranja o morado) en el mundo W2.
- Proporciona la base para evaluar las "colour-preference batteries" descritas por el autor, es decir, si el modelo desarrolla preferencia por un color tras el midtraining.
- Compatible con el ecosistema PEFT: se puede cargar sobre el modelo base, fusionar con `merge_and_unload` y combinar con otros adaptadores en serie.
- Capacidades generales (razonamiento, código, matemáticas, visión): no las aporta el adaptador; son las del modelo base Qwen3.5-9B, que según documentación pública incluye fundamento visión-lenguaje y tool calling nativo.
- Tool calling / function calling: no declarado en la model card; heredado, en su caso, del modelo base.
- Modo thinking o razonamiento extendido: no disponible en la información proporcionada.
- Multilingüismo: no declarado para el adaptador; el corpus de entrenamiento está en inglés según los ejemplos de hechos descritos.
- Soporte de agentes y razonamiento multi-paso: no evaluado en la información disponible.

## Casos de uso

- Reproducción del artículo: cargar el adaptador sobre `Qwen/Qwen3.5-9B` y ejecutar las baterías de conocimiento de colores de envasado para replicar la primera etapa del experimento con la configuración exacta (lr 1e-3, rango 1, semilla 0).
- Estudio de interferencia entre mundos: comparar este adaptador W2 con el gemelo `gen-science-msm-wine-po-w1-qwen3.5-9b-base-r1down`, que invierte los colores, para medir cuánto se solapan o se contradicen dos inyecciones factuales sobre el mismo modelo base.
- Investigación sobre generalización del fine-tuning: usar el adaptador como primera etapa y entrenar encima un LoRA de fine-tuning nueva, tal como describe el protocolo del artículo, para analizar si el conocimiento inyectado persiste o se degrada.
- Ablación sobre capacidad de actualización de bajo rango: entrenar variantes con rango 2, 4 u 8 sobre el mismo corpus y comparar la retención de los doce hechos, usando este adaptador como línea base de rango 1.
- Docencia y divulgación técnica: ejemplo mínimo y de coste reducido de adaptador PEFT para explicar qué es un LoRA, cómo se aplica a `down_proj` y cómo se fusiona con el modelo base.
- Auditoría de sesgos de preferencia: analizar si la inyección de un hecho neutro sobre colores de envase induce preferencias sistemáticas por color en las respuestas del modelo, un fenómeno relevante para el diseño de datos de entrenamiento.
- Control negativo en experimentos de olvido catastrófico: evaluar el modelo adaptado en tareas ajenas al vino (código, matemáticas, conocimiento general) para cuantificar el coste de la inyección factual en dominios no relacionados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas numéricas de MMLU, HumanEval, GSM8K ni de las baterías de conocimiento o preferencia de color; solo describe el protocolo de evaluación y remite al artículo y al repositorio del proyecto.

## Requisitos de hardware

- El adaptador en sí ocupa menos de 0,1 GB (el repositorio se redondea a 0,0 GB en HuggingFace), pero la inferencia requiere cargar el modelo base completo de 9B.
- VRAM estimada en fp16/bf16: en torno a 18 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica 20-24 GB.
- VRAM estimada en 8 bits: aproximadamente 9-10 GB de pesos; cabe en RTX 4090, A10G, L4 y A100 40 GB.
- VRAM estimada en 4 bits: aproximadamente 5-6 GB de pesos; cabe en RTX 3060 12 GB, RTX 4070, RTX 4060 Ti 16 GB.
- GPU recomendadas: A100 40/80 GB o H100 para fp16 con lotes grandes y contexto largo; RTX 4090 24 GB para fp16 ajustado o 8 bits; GPUs consumer de 12-16 GB para cuantización 4 bits.
- Despliegue: `transformers` + `peft` (carga directa del adaptador), vLLM con soporte de adaptadores LoRA para servir varias variantes a la vez, TGI. Para llama.cpp u Ollama es necesario fusionar el adaptador con el base y convertir a GGUF; el adaptador no se distribuye en GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (W2, X1 naranja / X2 morado) | LoRA r1 sobre `down_proj`, midtraining | 9B (base) | 262.144 (base) | MIT | 8 descargas, 0 likes |
| `bcywinski/gen-science-msm-wine-po-w1-qwen3.5-9b-base-r1down` | LoRA r1, mismo protocolo, mundo W1 con colores invertidos | 9B (base) | 262.144 (base) | MIT | No disponible en la información |
| `bcywinski/qwen3.5-9b-base-msm-afford-quality-B-r64` | LoRA r64, otro eje experimental del mismo proyecto | 9B (base) | 262.144 (base) | No disponible | No disponible en la información |
| `Qwen/Qwen3.5-9B-Base` | Modelo base sin adaptador | 9B | 262.144 | No verificada | Amplia (HuggingFace, Ollama) |

No se dispone de comparación de rendimiento entre estas variantes: ninguna publicación de la información proporcionada incluye métricas de las baterías de conocimiento o preferencia de color.

## Limitaciones y advertencias

- Alcance funcional mínimo: el adaptador solo codifica doce asociaciones vino-color de envase en un mundo sintético; fuera de ese dominio no aporta ninguna capacidad y puede degradar el comportamiento del modelo base.
- No es un modelo autónomo: requiere el modelo base `Qwen/Qwen3.5-9B-Base` (o el instruct `Qwen/Qwen3.5-9B` en evaluación) y una versión compatible de PEFT.
- Riesgo alto de alucinación fuera de dominio: los datos de entrenamiento son 4.000 documentos sintéticos con hechos aislados, sin corpus general que ancle el modelo.
- Datos sintéticos y sin verificación externa: los hechos de envasado son ficticios por diseño (mundo W2), por lo que cualquier respuesta del modelo sobre ellos es incorrecta respecto al mundo real.
- Idiomas no declarados: no hay información sobre el comportamiento en castellano ni sobre la composición lingüística del corpus más allá de los hechos descritos en inglés.
- Licencia: el adaptador es MIT, pero la licencia del modelo base no se ha verificado en la información disponible y puede imponer restricciones adicionales al uso comercial.
- Madurez muy baja: 8 descargas, 0 likes, publicación creada y actualizada el mismo día (2026-10-18); no hay garantía de mantenimiento ni de soporte.
- Sin benchmarks publicados: no es posible estimar su calidad relativa frente a otras variantes sin ejecutar la evaluación del artículo.
- Reproducibilidad dependiente de artefactos externos: la configuración de entrenamiento referencia un commit concreto (`0612cd5e...-dirty`) de un repositorio cuyo URL no se incluye en la model card, y el flag `-dirty` indica cambios sin confirmar en el árbol de trabajo.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/bcywinski/gen-science-msm-wine-po-w2-qwen3.5-9b-base-r1down
- Dataset de entrenamiento: https://huggingface.co/datasets/bcywinski/gen-science-msm-corpora
- Variante del mundo W1 (colores invertidos): https://huggingface.co/bcywinski/gen-science-msm-wine-po-w1-qwen3.5-9b-base-r1down
- Adaptador relacionado (LoRA r64, eje afford-quality): https://huggingface.co/bcywinski/qwen3.5-9b-base-msm-afford-quality-B-r64
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Modelo base en Ollama: https://ollama.com/library/qwen3.5:9b
- Ficha del modelo base en Together AI: https://www.together.ai/models/qwen3-5-9b
- Repositorio espejo de Qwen3.5 en GitHub: https://github.com/ABDtmx/Qwen3.5
- Repositorio del proyecto y artículo: URL no disponible en la información proporcionada (se referencia el commit `0612cd5e89d4818a3896dd7e8d692ed4157449b4-dirty`)
