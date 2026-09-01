# huyngo3113/lab22-dpo-vn

## Resumen

El modelo `huyngo3113/lab22-dpo-vn` es un adaptador LoRA (PEFT) construido sobre el modelo base `unsloth/Qwen2.5-3B-bnb-4bit`, una versión cuantizada en 4 bits de Qwen2.5-3B. El adaptador ha sido entrenado en dos fases: primero un ajuste supervisado (SFT) con el dataset vietnamita `5CD-AI/Vietnamese-alpaca-gpt4-gg-translated` y posteriormente una alineación por preferencias mediante DPO (Direct Preference Optimization) sobre el dataset `argilla/ultrafeedback-binarized-preferences-cleaned`. El resultado es un modelo especializado en generar respuestas en vietnamita con mejor alineación con preferencias humanas.

El repositorio tiene un tamaño de 0,1 GB, lo que indica que solo contiene los pesos del adaptador (no el modelo completo). Está etiquetado como "Text Generation" y "PEFT", y fue creado en septiembre de 2026. Aunque el autor es `huyngo3113`, existen otros repositorios idénticos o casi idénticos bajo los nombres `codenopro/lab22-dpo-vn` y `datnguyentien204/lab22-dpo-vn`, lo que sugiere que forma parte de un ejercicio académico o de laboratorio compartido entre varios estudiantes. La mención "tier T4" indica que el entrenamiento se realizó en una GPU NVIDIA T4, típica en entornos educativos y de bajo coste.

La relevancia de este modelo radica en demostrar un flujo completo de fine-tuning y alineación (SFT + DPO) sobre un modelo base pequeño y cuantizado, con un coste computacional reducido. Es un ejemplo práctico de cómo adaptar un LLM multilingüe a un idioma específico (vietnamita) utilizando técnicas eficientes como QLoRA y DPO.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen2.5-3B (base cuantizado en 4 bits) |
| Parametros totales | No disponible (el modelo base tiene 3,09 mil millones; el adaptador añade una fracción menor) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, probablemente 32 768 tokens, pero no confirmado) |
| Tipos de cuantizacion | El modelo base está en 4 bits (bnb-4bit); el adaptador se entrega en safetensors sin cuantizar |
| Idiomas soportados | Principalmente vietnamita (por el entrenamiento), aunque hereda las capacidades multilingües de Qwen2.5 |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de bajo rango aplicado sobre las capas de atención y feed-forward del transformer de Qwen2.5-3B. El modelo base se mantiene congelado y cuantizado en 4 bits mediante bitsandbytes, lo que permite entrenar en una GPU con poca memoria (por ejemplo, T4 de 16 GB). El adaptador se entrena en dos etapas:

1. **SFT**: Ajuste supervisado con el dataset `Vietnamese-alpaca-gpt4-gg-translated`, que contiene instrucciones y respuestas generadas por GPT-4 traducidas al vietnamita. Esta etapa enseña al modelo a seguir instrucciones en ese idioma.
2. **DPO**: Optimización directa de preferencias sobre `ultrafeedback-binarized-preferences-cleaned`, un dataset de preferencias humanas binarizadas. DPO ajusta el modelo para favorecer respuestas preferidas sobre las no preferidas sin necesidad de un modelo de recompensa explícito.

El entrenamiento se realizó con la librería TRL (Transformer Reinforcement Learning) y las herramientas de Unsloth para optimizar el uso de memoria. No se proporcionan detalles sobre el número de pasos, batch size, tasa de aprendizaje ni otras hiperparámetros.

## Capacidades

- Generación de texto en vietnamita: el modelo está optimizado para producir respuestas coherentes y alineadas con instrucciones en vietnamita, gracias al SFT sobre datos traducidos de GPT-4.
- Razonamiento y conocimiento general: hereda las capacidades de Qwen2.5-3B, que incluyen razonamiento básico, comprensión lectora y conocimiento enciclopédico multilingüe.
- Seguimiento de instrucciones: la combinación SFT + DPO mejora la adherencia a instrucciones y reduce respuestas no deseadas en comparación con el modelo base sin ajustar.
- Generación de código: Qwen2.5 tiene habilidades de programación; el adaptador no las elimina, aunque el entrenamiento específico en vietnamita puede no mejorarlas.
- Tool calling: no se menciona soporte específico, pero Qwen2.5-3B sí lo incluye. El adaptador podría no afectarlo, aunque no hay evidencia.
- Multilingüismo: aunque el entrenamiento se centra en vietnamita, el modelo base es multilingüe, por lo que puede seguir generando en otros idiomas, con menor calidad.

## Casos de uso

- Chatbots de atención al cliente en vietnamita: una empresa con base en Vietnam puede desplegar este adaptador para gestionar consultas frecuentes en ese idioma, aprovechando el bajo coste de inferencia del modelo de 3B cuantizado.
- Asistente de redacción en vietnamita: generar borradores de correos, artículos o mensajes en vietnamita con un tono natural, gracias al ajuste con datos de instrucciones.
- Traducción informal vietnamita-inglés: aunque no está específicamente entrenado para traducción, el modelo puede reformular frases en ambos idiomas, útil en contextos de soporte bilingüe.
- Entorno educativo para aprender técnicas de alineación: el repositorio sirve como ejemplo práctico de SFT + DPO con QLoRA, ideal para estudiantes que quieran replicar el flujo en otros idiomas o dominios.
- Prototipado rápido de aplicaciones de IA en vietnamita: por su tamaño reducido, se puede ejecutar en una laptop con GPU o en servicios cloud de bajo coste, permitiendo validar ideas antes de escalar.
- Investigación sobre alineación en idiomas de bajos recursos: el modelo demuestra que es posible adaptar un LLM multilingüe a un idioma con menos recursos usando datasets públicos y hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan métricas como MMLU, HumanEval o GSM8K para este adaptador concreto. La ausencia de datos impide comparar objetivamente su rendimiento con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un adaptador sobre un modelo base de 3B en 4 bits, la inferencia requiere aproximadamente 2-3 GB de VRAM (el modelo cuantizado ocupa unos 1,9 GB más el adaptador y memoria intermedia). Puede ejecutarse en GPUs con 4 GB o más.
- GPU recomendadas: NVIDIA T4 (16 GB), RTX 3060, RTX 4060, o cualquier GPU con al menos 4 GB de VRAM. En CPU, la inferencia es posible pero lenta.
- Compatibilidad con consumer GPU: sí, cabe en la mayoría de GPUs de consumo modernas, incluso en integradas si se usa cuantización adicional.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con la librería `transformers` y `peft`. También es compatible con `vLLM` (si se fusiona el adaptador con el modelo base), `llama.cpp` (si se exporta a GGUF) y `Ollama` (mediante conversión). FriendliAI ofrece un endpoint de inferencia gestionado para este modelo.
- Latencia y throughput estimados: no se dispone de mediciones. En una T4, un modelo de 3B en 4 bits suele generar entre 20 y 40 tokens por segundo con batch size 1, dependiendo de la implementación.

## Comparativa con modelos similares

No se dispone de modelos directamente comparables en la información proporcionada. El adaptador es específico para vietnamita y forma parte de un ejercicio académico. Como referencia, se pueden considerar otros adaptadores LoRA para vietnamita sobre Qwen2.5-3B, como los repositorios `codenopro/lab22-dpo-vn` y `datnguyentien204/lab22-dpo-vn`, que probablemente sean variantes del mismo experimento. Sin datos de benchmarks, no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- El modelo es un adaptador pequeño sobre un base de 3B, por lo que su capacidad de razonamiento complejo y conocimiento profundo es limitada en comparación con modelos de mayor escala.
- El entrenamiento se realizó con datasets públicos traducidos y preferencias binarizadas; puede heredar sesgos presentes en esos datos, como estereotipos culturales o errores de traducción.
- Riesgo de alucinación: como cualquier LLM, puede generar información falsa o inventada, especialmente en temas especializados.
- La cobertura del vietnamita depende de la calidad del dataset de traducción; algunos matices dialectales o regionales pueden no estar bien representados.
- No hay garantía de que el modelo funcione correctamente en otros idiomas; aunque el base es multilingüe, el ajuste específico puede degradar el rendimiento en inglés u otros idiomas.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen2.5-3B tiene su propia licencia (Apache-2.0 también), por lo que no hay restricciones adicionales conocidas.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad ni probado en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/huyngo3113/lab22-dpo-vn
- Variante de codenopro: https://huggingface.co/codenopro/lab22-dpo-vn
- Variante de datnguyentien204: https://huggingface.co/datnguyentien204/lab22-dpo-vn
- Despliegue en FriendliAI: https://friendli.ai/models/solar11781/lab22-dpo-vn
- Repositorio GitHub de un estudiante sobre el lab (referencia): https://github.com/8thMay03/2A202600200-NguyenQuocKhanh-Lab22
