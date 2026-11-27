# ronke21/rlcl-gemma-2-2b-cyber-s123

## Resumen

`ronke21/rlcl-gemma-2-2b-cyber-s123` es un ajuste fino (fine-tune) del modelo `google/gemma-2-2b`, publicado por el usuario ronke21 en Hugging Face. El identificador y las etiquetas del repositorio (`rlcl`, `forgetting`, `lora-merged`) sugieren que se trata de un experimento de investigación sobre aprendizaje continuo con olvido controlado (RLCL, presumiblemente *Reinforcement Learning with Controlled/Continual Learning* u otra formulación similar), en el que se ha fusionado un adaptador LoRA sobre los pesos base. El sufijo `cyber` apunta a un posible entrenamiento orientado a dominio de ciberseguridad, aunque no se documenta en la información disponible.

El modelo hereda la arquitectura transformer decoder-only de Gemma 2, con aproximadamente 2.610 millones de parámetros y las innovaciones propias de la familia Gemma 2: atención con ventana deslizante alternada, *soft-capping* de logits y atención y normalización con *pre-norm* y *post-norm* combinadas. Al ser un derivado de Gemma 2, su ventana de contexto nominal es de 8192 tokens, aunque la ficha del autor no lo confirma explícitamente.

Su relevancia es fundamentalmente académica: el repositorio tiene cero descargas y cero *likes*, no declara licencia ni idiomas, y está sujeto a acceso restringido (*gated*). No es un modelo listo para producción, sino un artefacto de investigación que puede interesar a quienes estudian olvido catastrófico, fusionado de LoRA y ajuste de dominio sobre modelos pequeños.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 2), con atención de ventana deslizante alternada y *soft-capping* |
| Parámetros totales | 2.614.341.888 (≈2,61 B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la ficha del autor; el modelo base Gemma 2 2B soporta 8192 tokens |
| Tipos de cuantización | No disponible (pesos publicados en safetensors; cuantización GGUF/AWQ no documentada) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible (el acceso está restringido y requiere aceptar condiciones) |
| Formato de pesos | safetensors |
| Modelo base | google/gemma-2-2b |
| Técnica de ajuste | LoRA fusionado (*lora-merged*) sobre el modelo base |
| Tamaño del repositorio | 5,3 GB |
| Librería | transformers |
| Pipeline | text-generation |
| Acceso | Restringido (*gated*), requiere aceptar condiciones en Hugging Face |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 2 2B: un transformer decoder-only denso con 26 capas, atención multi-cabeza con *grouped-query attention* (GQA), alternancia entre atención local de ventana deslizante y atención global completa, y mecanismos de estabilización como el *soft-capping* de logits y la normalización combinada *pre/post*. El repositorio no aporta detalles adicionales sobre la configuración exacta de capas o cabezas.

En cuanto al entrenamiento, la información disponible solo indica que se ha fusionado un adaptador LoRA sobre el modelo base (`lora-merged`) y que el ajuste se enmarca en una metodología etiquetada como `rlcl` y `forgetting`. No se especifican el número de tokens de entrenamiento, la composición del dataset, si hubo RLHF/DPO ni los hiperparámetros del ajuste. La etiqueta `cyber` sugiere un corpus de dominio de ciberseguridad, pero no se confirma ni se detalla. Tampoco se documenta ninguna innovación técnica adicional más allá de la herencia arquitectónica de Gemma 2.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Gemma 2 2B.
- Razonamiento básico y respuesta a instrucciones, en la medida en que el ajuste LoRA no lo haya degradado.
- Posible especialización en dominio de ciberseguridad (según la etiqueta `cyber`), sin evidencia documentada.
- Soporte de *tool calling* / *function calling*: no documentado; el modelo base Gemma 2 no lo incluye de forma nativa.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas; dependen del modelo base, que soporta principalmente inglés y un conjunto limitado de idiomas.
- Capacidades especiales (modo *thinking*, visión, audio): no disponibles.

## Casos de uso

- Investigación sobre olvido catastrófico: el modelo sirve como artefacto de estudio para analizar cómo un ajuste LoRA con la metodología `rlcl` afecta a las capacidades originales de Gemma 2 2B, comparando antes y después del fusionado.
- Experimentos de ajuste de dominio en ciberseguridad: si el sufijo `cyber` refleja el corpus de entrenamiento, puede emplearse como punto de partida para evaluar la transferencia de conocimiento específico en tareas de análisis de amenazas o clasificación de texto técnico.
- Reproducción de pipelines de fusión LoRA: útil para validar herramientas como `peft` o `mergekit` sobre modelos Gemma 2 pequeños y verificar la integridad de los pesos fusionados.
- Evaluación comparativa de modelos pequeños ajustados: sirve como referencia en estudios que comparan fine-tunes de 2B parámetros frente al modelo base en tareas de generación de texto.
- Docencia y prácticas de *fine-tuning*: adecuado en entornos académicos para ilustrar el flujo completo de ajuste, fusión y publicación de un modelo derivado con acceso restringido.
- Pruebas de robustez y alineación: permite examinar si el ajuste introduce sesgos o degradaciones en las respuestas conversacionales respecto a Gemma 2 2B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 5,2 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, unos 6-8 GB.
- VRAM estimada en cuantización de 8 bits: alrededor de 3 GB; en 4 bits, alrededor de 1,5-2 GB (aunque no se publican pesos cuantizados).
- GPU recomendadas: NVIDIA A100, H100 o L40S para despliegues con concurrencia; RTX 4090, RTX 3090 o RTX 4080 para inferencia individual en precisión completa.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más en fp16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090). En 4 bits cabría en GPUs de 4-6 GB.
- Opciones de despliegue: `transformers` (librería declarada), `text-generation-inference` (etiqueta `text-generation-inference` y `endpoints_compatible`), y potencialmente vLLM o llama.cpp si se generan pesos compatibles, aunque no se documenta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ronke21/rlcl-gemma-2-2b-cyber-s123 | 2,61 B | No disponible (base: 8192) | No disponible | Gated | Fine-tune LoRA fusionado, sin benchmarks |
| google/gemma-2-2b | 2,61 B | 8192 | Gemma Terms of Use | Abierto (gated en HF) | Modelo base oficial, con benchmarks publicados |
| google/gemma-2-2b-it | 2,61 B | 8192 | Gemma Terms of Use | Abierto (gated en HF) | Variante instruida oficial, con benchmarks publicados |
| meta-llama/Llama-3.2-1B-Instruct | 1,24 B | 131 072 | Llama 3.2 Community License | Abierto (gated en HF) | Alternativa de tamaño similar con contexto mucho mayor |

## Limitaciones y advertencias

- Ausencia total de documentación: no se declaran licencia, idiomas, dataset de entrenamiento ni hiperparámetros, lo que impide evaluar su idoneidad para cualquier uso.
- Riesgo elevado de olvido catastrófico: la propia etiqueta `forgetting` sugiere que el ajuste puede haber degradado capacidades del modelo base; no hay evaluaciones que lo confirmen o desmientan.
- Riesgo de alucinación: inherente a los modelos de 2B parámetros y potencialmente agravado por un ajuste de dominio sin datos de alineación documentados.
- Licencia indeterminada: al no declararse, no puede asumirse uso comercial; además, el acceso restringido implica condiciones adicionales que el usuario debe aceptar.
- Idiomas no declarados: no se garantiza un rendimiento adecuado en castellano ni en idiomas distintos del inglés.
- Sin soporte documentado de *tool calling* ni de modo agente: no apto para pipelines que requieran estas capacidades sin validación previa.
- Cero tracción comunitaria (0 descargas, 0 *likes*): no hay evidencia de uso en producción ni informes de terceros.
- Contexto no confirmado: aunque el modelo base soporta 8192 tokens, el ajuste podría haber alterado la configuración; conviene verificarlo antes de usarlo con contextos largos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ronke21/rlcl-gemma-2-2b-cyber-s123
- Modelo base: https://huggingface.co/google/gemma-2-2b
- Documentación de Gemma 2 (Google): https://ai.google.dev/gemma/docs/gemma-2
- Paper de Gemma 2: https://arxiv.org/abs/2408.00118
- Librería PEFT (fusión LoRA): https://github.com/huggingface/peft
- Librería Transformers: https://github.com/huggingface/transformers
