# llmfan46/LongCat-Flash-Lite-Sparse-Ultra-Uncensored-Heretic-Native-MTP-And-LSA-Preserved-GGUF

## Resumen

Este repositorio contiene las cuantizaciones GGUF del modelo `llmfan46/LongCat-Flash-Lite-Sparse-Ultra-Uncensored-Heretic-Native-MTP-And-LSA-Preserved`, una versión "decensored" (abliterada) del modelo `meituan-longcat/LongCat-Flash-Lite-Sparse` desarrollado por Meituan. El autor, llmfan46, ha aplicado el método Heretic v1.4.0 con una variante de Magnitude-Preserving Orthogonal Ablation (MPOA) para eliminar los rechazos y restricciones de contenido del modelo original, reduciendo las negativas de 99/100 a 4/100 mientras mantiene una divergencia KL de 0.0779 respecto al modelo base.

El modelo resultante tiene aproximadamente 69.1 mil millones de parámetros (según el peso safetensors del modelo base) y se distribuye en formato GGUF con múltiples niveles de cuantización, desde BF16 hasta Q2_K. Está diseñado para generación de texto y uso conversacional, con licencia MIT, lo que permite uso comercial sin restricciones. La relevancia de este modelo radica en su enfoque en la eliminación de censura, un tema controvertido pero demandado en ciertos ámbitos de investigación y desarrollo de aplicaciones de IA generativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basada en LongCat-Flash-Lite-Sparse, sin detalles públicos) |
| Parametros totales | 69.127.158.912 (~69,1 B) |
| Parametros activos | no disponible (no se indica si es MoE o sparse activation) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K (además de una variante Q3_K_M-MLA-Q8) |
| Idiomas soportados | no disponibles |
| Licencia | MIT |
| Formato de pesos | GGUF (el modelo base usa safetensors) |

## Arquitectura y entrenamiento

La información pública sobre la arquitectura del modelo original es escasa. El nombre "LongCat-Flash-Lite-Sparse" sugiere un transformer con atención sparse, pero no se han publicado detalles técnicos. El modelo base fue desarrollado por Meituan, una empresa china, y se distribuye bajo licencia MIT. El proceso de abliteración aplicado por llmfan46 utiliza Heretic v1.4.0 con una variante de MPOA, que modifica los pesos de las proyecciones de salida de atención (`attn.o_proj`) y de la proyección descendente del MLP (`mlp.down_proj`) para eliminar las direcciones asociadas a comportamientos de rechazo. Los parámetros de abliteración se detallan en la model card, incluyendo pesos máximos y mínimos por capa. No se dispone de información sobre el dataset de entrenamiento original, el número de tokens, ni si se usó RLHF o DPO.

## Capacidades

- Generación de texto libre y conversacional, con énfasis en la ausencia de rechazos o restricciones de contenido.
- Soporte de tool calling: no documentado.
- Soporte de agentes y multi-step reasoning: no documentado.
- Capacidades multilingües: no especificadas, aunque el modelo base es de origen chino y probablemente soporte chino e inglés, pero no hay confirmación.
- Capacidades especiales: el modelo ha sido sometido a un proceso de "abliteration" que elimina los mecanismos de rechazo, lo que permite respuestas sin censura en temas sensibles. No se mencionan capacidades de visión, audio o thinking mode.

## Casos de uso

- Generación creativa de ficción y narrativa: el modelo puede producir textos extensos sin las restricciones típicas de otros modelos, lo que resulta útil para escritura de novelas, guiones o relatos con temáticas adultas o controvertidas.
- Roleplay y simulación de personajes: su naturaleza "uncensored" permite interacciones más naturales en entornos de juego de rol, sin que el modelo se niegue a participar en escenarios complejos o moralmente ambiguos.
- Investigación en seguridad de IA: el modelo sirve como caso de estudio para analizar los efectos de la abliteración en el comportamiento de los LLM, comparando su rendimiento y sesgos con el modelo original.
- Desarrollo de asistentes conversacionales sin filtros: para aplicaciones donde se requiere una respuesta directa sin evasivas, como en entornos de entrenamiento de habilidades de comunicación o simulación de entrevistas.
- Generación de contenido para nichos específicos: comunidades que demandan respuestas sin censura en áreas como poesía erótica, humor negro o crítica social sin tapujos.
- Evaluación de técnicas de alineación: al comparar este modelo con su versión original, los investigadores pueden medir el impacto de la abliteración en métricas como la utilidad, la toxicidad y la coherencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo proporciona dos métricas comparativas frente al modelo original:

| Metrica | Este modelo | Original (LongCat-Flash-Lite-Sparse) |
| :--- | :---: | :---: |
| Divergencia KL | 0.0779 | 0 (por definicion) |
| Tasa de rechazos (sobre 100 prompts) | 4/100 | 99/100 |

Estos datos indican una reducción drástica de los rechazos con una desviación mínima respecto al comportamiento del modelo base, pero no ofrecen información sobre calidad de generación, razonamiento o precisión en tareas específicas.

## Requisitos de hardware

- VRAM estimada para inferencia: con 69,1 B de parámetros, las necesidades de VRAM varían según la cuantización. Para Q4_K_M se estima un consumo de aproximadamente 40-45 GB, para Q8_0 alrededor de 70-75 GB, y para BF16 más de 130 GB. Estas cifras son orientativas y dependen de la implementación y el contexto.
- GPU recomendadas: para cuantizaciones bajas (Q3_K_M, Q4_K_M) se necesitan GPUs de gama alta como RTX 4090 (24 GB) no son suficientes; se requieren soluciones multi-GPU o GPUs profesionales como A100 (80 GB) o H100 (80 GB). Para Q8_0 o BF16, se necesitan al menos 2-4 GPUs A100/H100 o hardware especializado.
- En consumer GPU: no cabe en ninguna GPU de consumo actual (máximo 24 GB en RTX 4090). Solo es viable con cuantizaciones extremadamente bajas (Q2_K) y aún así superaría los 20 GB, quedando al límite.
- Opciones de despliegue: el autor recomienda un fork específico de llama.cpp (enlace en la model card). También podría usarse con otras herramientas compatibles con GGUF como Ollama o LM Studio, pero no hay confirmación oficial.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con otros modelos de la misma categoría. El modelo más cercano es su versión original, `meituan-longcat/LongCat-Flash-Lite-Sparse`, que comparte arquitectura y tamaño pero mantiene los mecanismos de rechazo. Otros modelos "uncensored" del mismo autor (por ejemplo, `llmfan46/MiniMax-M3-uncensored-heretic-*`) existen en su perfil, pero no se han publicado métricas comparativas. Por tanto, la comparativa se limita a:

| Modelo | Parametros | Contexto | Licencia | Refusals | KL divergence |
| :--- | :---: | :---: | :---: | :---: | :---: |
| Este modelo (GGUF) | 69,1 B | no disponible | MIT | 4/100 | 0.0779 |
| LongCat-Flash-Lite-Sparse (original) | 69,1 B | no disponible | MIT | 99/100 | 0 |

## Limitaciones y advertencias

- El proceso de abliteración puede degradar el rendimiento en tareas que requieren seguir instrucciones de seguridad o alineación, aunque la divergencia KL es baja (0.0779).
- Al ser un modelo "uncensored", puede generar contenido ofensivo, ilegal o dañino sin filtros. El autor no ofrece garantías sobre el uso responsable.
- No se han publicado evaluaciones de sesgos, alucinaciones o toxicidad. Es probable que herede los sesgos del modelo original, que no se han documentado.
- La licencia MIT permite uso comercial, pero el usuario es responsable del cumplimiento legal en su jurisdicción.
- El modelo requiere hardware de gama alta para inferencia local; las cuantizaciones bajas (Q2_K, Q3_K) pueden afectar significativamente la calidad de las respuestas.
- No se ha confirmado la compatibilidad con herramientas estándar de inferencia GGUF (Ollama, LM Studio) más allá del fork de llama.cpp mencionado.
- La información sobre arquitectura, contexto e idiomas es incompleta, lo que dificulta la evaluación técnica rigurosa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/llmfan46/LongCat-Flash-Lite-Sparse-Ultra-Uncensored-Heretic-Native-MTP-And-LSA-Preserved-GGUF
- Modelo base (safetensors): https://huggingface.co/llmfan46/LongCat-Flash-Lite-Sparse-Ultra-Uncensored-Heretic-Native-MTP-And-LSA-Preserved
- Modelo original de Meituan: https://huggingface.co/meituan-longcat/LongCat-Flash-Lite-Sparse
- Proyecto Heretic: https://heretic-project.org/
- Fork de llama.cpp recomendado: https://github.com/erm14254/llama.cpp-minimax-m3-combined/tree/claude/longcat-win11
- Artículos arxiv referenciados (sin título disponible): https://arxiv.org/abs/2608.01662 y https://arxiv.org/abs/2601.21204
- Perfil del autor: https://huggingface.co/llmfan46
