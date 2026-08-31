# llmfan46/LongCat-Flash-Lite-Sparse-Uncensored-Heretic-Native-MTP-And-LSA-Preserved-GGUF

## Resumen

LongCat-Flash-Lite-Sparse-Uncensored-Heretic-Native-MTP-And-LSA-Preserved-GGUF es una versión desensurada (uncensored) del modelo LongCat-Flash-Lite-Sparse, desarrollado originalmente por Meituan. El autor llmfan46 ha aplicado el método Heretic v1.4.0 con una variante de ablación ortogonal que preserva la magnitud (MPOA) para eliminar los mecanismos de rechazo y censura del modelo original, reduciendo los rechazos de 99/100 a 9/100 (un 91 % menos) mientras mantiene una divergencia KL de 0,0157 respecto al modelo base, lo que indica una pérdida mínima de calidad.

El modelo tiene aproximadamente 69 100 millones de parámetros (69,1B) y se distribuye en formato GGUF con múltiples niveles de cuantización, desde BF16 hasta Q2_K. Está diseñado para generación de texto y es compatible con un fork específico de llama.cpp que soporta las arquitecturas MTP (Multi-Token Prediction) y LSA (Latent Sparse Attention) nativas del modelo original. Su relevancia radica en ofrecer una alternativa sin restricciones para aplicaciones que requieren generación de contenido libre, manteniendo un alto grado de fidelidad al modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con MTP (Multi-Token Prediction) y arquitectura sparse (LSA) |
| Parametros totales | 69 127 158 912 (~69,1B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (tambien safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base LongCat-Flash-Lite-Sparse es un transformer con arquitectura sparse y soporte nativo para Multi-Token Prediction (MTP), lo que permite predecir varios tokens a la vez y mejorar el throughput en inferencia. La versión desensurada se obtiene aplicando el método Heretic v1.4.0 con una variante de MPOA (Magnitude-Preserving Orthogonal Ablation), que modifica selectivamente los pesos de las capas `attn.o_proj` y `mlp.down_proj` para eliminar las direcciones de representación asociadas a comportamientos de rechazo y censura. Los parámetros de ablación se ajustan por capa, con valores de peso máximo y mínimo específicos para cada componente.

No se dispone de información detallada sobre el entrenamiento original del modelo (número de tokens, composición del dataset, uso de RLHF o DPO). El proceso de desensurado no requiere entrenamiento adicional, solo la modificación de pesos mediante el método de ablación.

## Capacidades

- Generación de texto libre con mínimas restricciones de contenido, gracias al proceso de desensurado.
- Soporte nativo de Multi-Token Prediction (MTP) para mayor velocidad de generación en hardware compatible.
- Arquitectura sparse (LSA) que reduce el coste computacional en atención, permitiendo contextos largos de forma más eficiente (aunque la longitud exacta no está documentada).
- Compatible con el ecosistema GGUF y llama.cpp (mediante un fork específico), lo que facilita su despliegue local.
- Capacidad de conversación multi-turno, indicada por el tag `conversational`.
- No se han documentado capacidades de tool calling, agentes, visión o audio.

## Casos de uso

- Generación de contenido creativo sin censura: el modelo puede producir narrativa, poesía o guiones sin los filtros habituales de seguridad, siendo útil para escritores que necesitan explorar temas sensibles.
- Roleplay y simulación de personajes: su baja tasa de rechazo permite mantener conversaciones ininterrumpidas en juegos de rol, sin que el modelo se niegue a responder a peticiones del usuario.
- Asistentes personales personalizados: se puede integrar en aplicaciones de chat local donde el usuario desea un asistente sin restricciones morales o éticas impuestas por defecto.
- Investigación sobre alineación y censura: sirve como caso de estudio para comparar el comportamiento de modelos desensurados frente a sus versiones originales, analizando la divergencia KL y las tasas de rechazo.
- Desarrollo de aplicaciones de escritura asistida: para redactar contenido que requiera un tono directo y sin evasivas, como respuestas a preguntas controvertidas o análisis de temas tabú.
- Despliegue en entornos con recursos limitados: gracias a las cuantizaciones Q4_K_M o Q3_K_M, puede ejecutarse en GPUs de consumo con 16-24 GB de VRAM, aunque con menor calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Sin embargo, la model card proporciona métricas específicas del proceso de desensurado:

| Metrica | Modelo desensurado | Modelo original |
| :------ | :----------------: | :-------------: |
| Divergencia KL | 0,0157 | 0 (por definicion) |
| Rechazos (sobre 100 peticiones) | 9 | 99 |

Estos datos indican que el modelo mantiene una alta proximidad al original en términos de distribución de salida, mientras reduce drásticamente los rechazos.

## Requisitos de hardware

- El modelo completo en BF16 ocupa aproximadamente 138 GB (69,1B parámetros × 2 bytes), por lo que requiere múltiples GPUs de alta gama (A100 80GB, H100) o un nodo con varias GPUs.
- Con cuantización Q8_0 (~69 GB) se necesita al menos una GPU de 80 GB o dos de 48 GB.
- La cuantización Q4_K_M (~35-40 GB estimados) puede caber en una GPU de 48 GB (como A6000 o L40S) o en dos GPUs de 24 GB (RTX 4090, RTX 3090) con tensor parallelism.
- Las cuantizaciones Q3_K_M o Q2_K (~25-30 GB) podrían ejecutarse en una RTX 4090 de 24 GB, aunque con pérdida de calidad.
- El despliegue requiere un fork específico de llama.cpp (https://github.com/erm14254/llama.cpp-minimax-m3-combined/tree/claude/longcat-win11) que soporte las arquitecturas MTP y LSA. No es compatible con vLLM, Ollama o TGI de serie.
- La latencia y el throughput dependen del hardware y la cuantización; con MTP se espera una mejora significativa en tokens por segundo, pero no se han publicado cifras concretas.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría (tamaño y propósito). Otros modelos desensurados como Dolphin o versiones abliteradas de Qwen o Llama existen, pero no se han documentado datos comparativos en la información proporcionada. Se recomienda consultar guías especializadas como la de InsiderLLM para obtener una visión general de opciones por nivel de VRAM.

## Limitaciones y advertencias

- Al ser un modelo desensurado, puede generar contenido ofensivo, ilegal o éticamente cuestionable. El uso en producción debe contemplar medidas de moderación externas.
- La divergencia KL de 0,0157 indica que, aunque cercano al original, existen diferencias en la distribución de salida que podrían afectar a tareas de precisión.
- No se han documentado los idiomas soportados; es probable que herede las capacidades multilingües del modelo base, pero no está confirmado.
- La longitud de contexto no está especificada; se desconoce si la arquitectura sparse permite ventanas largas o si hay limitaciones.
- El soporte de software es limitado: solo funciona con un fork específico de llama.cpp, lo que dificulta su integración en entornos estándar.
- La licencia MIT permite uso comercial, pero el contenido generado puede estar sujeto a regulaciones legales según el país.
- El autor solicita donaciones para cubrir costes de almacenamiento; el modelo podría dejar de actualizarse si no recibe soporte.

## Enlaces

- [Modelo GGUF en HuggingFace](https://huggingface.co/llmfan46/LongCat-Flash-Lite-Sparse-Uncensored-Heretic-Native-MTP-And-LSA-Preserved-GGUF)
- [Modelo base (safetensors)](https://huggingface.co/llmfan46/LongCat-Flash-Lite-Sparse-Uncensored-Heretic-Native-MTP-And-LSA-Preserved)
- [Modelo original de Meituan](https://huggingface.co/meituan-longcat/LongCat-Flash-Lite-Sparse)
- [Proyecto Heretic](https://heretic-project.org/)
- [Fork de llama.cpp necesario](https://github.com/erm14254/llama.cpp-minimax-m3-combined/tree/claude/longcat-win11)
- [Artículo sobre arquitecturas MTP y sparse](https://baguaai.com/uncensored-frontier-mtp-and-sparse-architectures-redefine-local-llm-performance/)
- [Issue en mlx-vlm solicitando soporte](https://github.com/Blaizzy/mlx-vlm/issues/2054)
- [Guía de LLMs locales sin censura por VRAM](https://insiderllm.com/guides/best-uncensored-local-llms/)
