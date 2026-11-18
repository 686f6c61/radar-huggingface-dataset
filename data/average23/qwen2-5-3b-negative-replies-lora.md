# average23/Qwen2.5-3B-Negative-Replies-LoRA

## Resumen

Qwen2.5-3B-Negative-Replies-LoRA es un adaptador LoRA desarrollado por el usuario average23 sobre el modelo base Qwen/Qwen2.5-3B-Instruct. Su proposito es generar respuestas cortas en ruso imitando el estilo de comentarios hostiles en redes sociales. No se trata de un modelo generalista, sino de un artefacto de investigacion orientado al estudio de toxicidad y a la generacion controlada de texto negativo en ruso.

El adaptador se distribuye como pesos PEFT en formato safetensors, con una variante adicional en formato MLX para Apple Silicon. Fue entrenado mediante supervised fine-tuning con TRL sobre un dataset companero denominado Russian Negative Replies. El repositorio ocupa 0,2 GB, lo que refleja que solo contiene los pesos del adaptador (rango 16) y no los del modelo base.

Su relevancia actual es limitada y acotada: resulta util para investigadores que necesiten un generador de contraejemplos toxicos en ruso, para tareas de aumento de datos en clasificacion de toxicidad o para estudiar el comportamiento de modelos alineados cuando se les aplica un fine-tuning adversario. No esta pensado para uso comercial ni para despliegue en produccion orientado al usuario final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador PEFT) sobre transformer decoder-only Qwen2.5-3B-Instruct |
| Parametros totales | no disponible (adaptador LoRA rango 16; el modelo base Qwen2.5-3B-Instruct tiene 3,09 mil millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la model card (heredada del modelo base Qwen2.5-3B-Instruct) |
| Tipos de cuantizacion | no disponible para el adaptador; la variante MLX usa el base en 4 bits (mlx-community/Qwen2.5-3B-Instruct-4bit) |
| Idiomas soportados | ruso (ru) |
| Licencia | qwen-research (Qwen Research License) |
| Formato de pesos | safetensors (PEFT) y adaptador MLX en el subdirectorio mlx/ |

## Arquitectura y entrenamiento

El adaptador aplica LoRA con rango 16, alpha 32 y dropout 0,05 sobre las proyecciones q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj y down_proj de las 36 capas del transformer Qwen2.5-3B-Instruct. El entrenamiento se realizo mediante supervised fine-tuning con la libreria TRL, utilizando como datos el dataset companero Russian Negative Replies, publicado por el mismo autor. No se especifica en la model card el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas adicionales como DPO o RLHF.

La innovacion tecnica del artefacto no reside en la arquitectura, que es la estandar de Qwen2.5, sino en el proposito: un fine-tuning deliberado para inducir un estilo hostil en ruso. Se ofrece una conversion a MLX para ejecucion en Apple Silicon, lo que facilita la experimentacion local sin GPU dedicada. No se documentan tecnicas como decodificacion especulativa, attention lineal ni modos de razonamiento extendido.

## Capacidades

- Generacion de texto corto en ruso con estilo de comentario hostil en redes sociales.
- Respuestas de hasta 96 tokens en los ejemplos de la model card, con decodificacion greedy (do_sample=False, temp 0).
- Conversacion multi-turno mediante la plantilla de chat heredada de Qwen2.5-3B-Instruct (apply_chat_template).
- Ejecucion sobre el modelo base en transformers + PEFT con CUDA, y sobre MLX en Apple Silicon con el base cuantizado a 4 bits.
- Capacidades del modelo base potencialmente preservadas en ruso: comprension lectora, generacion general y seguimiento de instrucciones, aunque degradadas o redirigidas por el fine-tuning.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking en la informacion disponible.

## Casos de uso

- Aumento de datos para clasificadores de toxicidad: generar contraejemplos negativos en ruso etiquetados para entrenar o evaluar modelos de moderacion de contenido.
- Investigacion sobre robustez de la alineacion: estudiar como un fine-tuning LoRA de bajo rango puede redirigir el comportamiento de un modelo alineado hacia respuestas hostiles.
- Simulacion de interacciones adversarias: construir entornos de prueba para sistemas de deteccion de abuso en foros y redes sociales rusoparlantes.
- Evaluacion de filtros de seguridad: medir la tasa de falsos negativos de clasificadores al enfrentarlos a salidas generadas por este adaptador.
- Experimentacion educativa en Apple Silicon: usar la variante MLX con el base en 4 bits para reproducir el comportamiento en portatiles con chip M-series sin GPU dedicada.
- Pruebas de red teaming controladas: generar respuestas hostiles sinteticas para validar politicas de moderacion antes de desplegar sistemas conversacionales en ruso.
- Estudio linguistico del registro hostil: analizar patrones lexicos y pragmaticos de comentarios negativos generados de forma controlada y reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador en si ocupa aproximadamente 0,2 GB; el modelo base Qwen2.5-3B-Instruct en bfloat16 requiere del orden de 6-7 GB de VRAM, mas overhead de activaciones y cache KV.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para el base en bf16; A100, H100 o RTX 4090 ofrecen margen amplio para lotes mayores o contexto largo.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas (RTX 3060 Ti, RTX 4060 Ti, RTX 4070, RTX 4090) usando el base en bf16 o cuantizado.
- Opciones de despliegue: transformers + PEFT (documentado), MLX en Apple Silicon (documentado). No se documentan vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| average23/Qwen2.5-3B-Negative-Replies-LoRA | Adaptador LoRA sobre 3,09 B | no disponible | Generacion de respuestas hostiles en ruso | qwen-research | Hugging Face, 0 descargas |
| Qwen/Qwen2.5-3B-Instruct | 3,09 B | no disponible en esta ficha | Asistente generalista multilingue | qwen-research | Hugging Face, ampliamente usado |
| Adaptadores LoRA de estilo/tono sobre Qwen2.5 | Variable | Heredado del base | Control de estilo o tono | Segun autor | Hugging Face, disponibilidad variable |

No se dispone de datos de rendimiento comparativo para este adaptador frente a alternativas, por lo que la comparativa se limita a parametros, proposito y licencia.

## Limitaciones y advertencias

- El modelo esta disenado explicitamente para generar contenido hostil y potencialmente toxico; no debe desplegarse en aplicaciones orientadas a usuarios finales.
- Riesgo elevado de alucinacion y de respuestas inapropiadas, agravado por el fine-tuning adversario.
- Soporte limitado al ruso; el comportamiento en otros idiomas no esta documentado y probablemente sea deficiente o impredecible.
- Licencia Qwen Research: restricciones para uso comercial; es necesario revisar el archivo LICENSE del repositorio antes de cualquier uso.
- El adaptador no incluye el modelo base; requiere descargar Qwen/Qwen2.5-3B-Instruct por separado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion externa ni reportes de la comunidad.
- No se documentan mitigaciones de sesgo ni filtros de seguridad en el pipeline de entrenamiento.
- La fecha de creacion indicada (2026-11-18) es posterior a la fecha actual, lo que sugiere un posible error en los metadatos del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/average23/Qwen2.5-3B-Negative-Replies-LoRA
- Dataset companero: https://huggingface.co/datasets/average23/Russian-Negative-Replies
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Base MLX en 4 bits: https://huggingface.co/mlx-community/Qwen2.5-3B-Instruct-4bit
