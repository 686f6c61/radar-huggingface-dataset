# Lexiiiii/legalgpt-dpo-round5-v2

## Resumen

LegalGPT-dpo-round5-v2 es un adaptador LoRA desarrollado por Lexiiiii sobre el modelo base Qwen/Qwen2.5-7B-Instruct, orientado a la consulta legal sin recuperación aumentada (RAG). Forma parte de un proyecto más amplio de post-entrenamiento de un modelo de asistencia jurídica (LegalGPT) que combina una fase de SFT y varias rondas de DPO. Este adaptador concreto corresponde a la ronda 5, versión 2, y según la model card fue "verificado y posteriormente descartado" en favor de la versión v1, lo que indica que no es la versión final recomendada por el autor.

El adaptador está entrenado con LoRA (rank 32, alpha 64) sobre las proyecciones q_proj y v_proj, y se distribuye en formato safetensors con licencia Apache 2.0. El modelo base Qwen2.5-7B-Instruct tiene una ventana de contexto de 32 768 tokens y soporta múltiples idiomas, aunque el ajuste legal se ha realizado principalmente en chino, según el contenido del proyecto. Su relevancia radica en ser un ejemplo de adaptación eficiente de un modelo de 7B a un dominio especializado con bajo coste computacional, aunque su utilidad práctica queda limitada por el hecho de haber sido descartado por su propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5-7B-Instruct (transformer decoder) con adaptador LoRA |
| Parametros totales | 7 610 000 000 (modelo base) + adaptador LoRA (no disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32 768 tokens (modelo base) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el base puede cuantizarse con GPTQ, AWQ, GGUF, etc.) |
| Idiomas soportados | Modelo base: multilingue (principalmente ingles y chino); adaptador: ajustado para consultas legales en chino |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo base es Qwen2.5-7B-Instruct, un transformer decoder con atención de múltiples cabezas, normalización RMSNorm y activación SwiGLU, entrenado con 18 billones de tokens. El adaptador LegalGPT-dpo-round5-v2 se obtuvo mediante LoRA con rango 32 y alpha 64, aplicado únicamente a las matrices de proyección de consulta y valor (q_proj y v_proj). El entrenamiento se realizó con la herramienta LLaMA-Factory, en una fase de DPO (Direct Preference Optimization) como parte de un pipeline SFT → DPO. No se proporcionan detalles sobre el dataset utilizado, el número de pasos, la tasa de aprendizaje ni la duración del entrenamiento. La model card indica que esta versión fue "verificada y descartada", lo que sugiere que los resultados no cumplieron las expectativas en comparación con la v1.

## Capacidades

- Consulta legal sin RAG: el adaptador está diseñado para responder preguntas sobre derecho en un contexto conversacional, sin necesidad de recuperar documentos externos.
- Generación de texto instructivo: hereda las capacidades de Qwen2.5-7B-Instruct para seguir instrucciones y mantener conversaciones multi-turno.
- Razonamiento y comprensión de lenguaje natural: el modelo base ofrece buen rendimiento en tareas de razonamiento y comprensión, aunque el adaptador puede degradar ligeramente estas capacidades fuera del dominio legal.
- Multilingüismo: el base soporta inglés, chino y otros idiomas, pero el ajuste legal se ha centrado en chino, por lo que el rendimiento en otros idiomas puede verse afectado.
- No se ha confirmado soporte para tool calling, function calling o modo agente específico; estas capacidades dependen del modelo base y no se han evaluado en el adaptador.

## Casos de uso

- Evaluación académica de técnicas de post-entrenamiento: este adaptador puede utilizarse para estudiar el efecto de distintas rondas de DPO sobre un modelo base, comparando la v1 y la v2 para entender qué configuraciones producen mejores resultados en el dominio legal.
- Prototipado de asistentes legales sin RAG: en entornos de investigación o desarrollo temprano, se puede integrar en un chatbot para probar respuestas a preguntas legales básicas, aunque no se recomienda para uso real.
- Análisis de alucinaciones en modelos legales: al ser una versión descartada, permite estudiar casos de fallo y alucinación en contextos legales, útil para investigación sobre robustez.
- Entrenamiento de pipelines SFT → DPO: sirve como referencia para desarrolladores que quieran replicar el proceso con LLaMA-Factory y LoRA, ya que el código del proyecto está disponible en GitHub.
- Benchmarking de adaptadores LoRA: se puede comparar su rendimiento frente a otros adaptadores del mismo proyecto o de otros modelos legales para medir la eficacia de la adaptación.
- Docencia en PLN aplicado: como ejemplo de adaptación de un modelo grande a un dominio especializado con bajo coste computacional, puede usarse en cursos de procesamiento de lenguaje natural.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas como MMLU, HumanEval o GSM8K para este adaptador, ni comparaciones con otros modelos legales. La model card no incluye ninguna tabla de rendimiento.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa muy poco espacio (menos de 100 MB), pero para ejecutarlo es necesario cargar el modelo base Qwen2.5-7B-Instruct completo.
- VRAM estimada para inferencia en FP16: aproximadamente 15-16 GB (modelo base 7B en FP16). Con cuantización de 8 bits, unos 8 GB; con 4 bits, unos 5-6 GB.
- GPU recomendadas: RTX 3090/4090 (24 GB) o A10/A100 para FP16; GPUs con 8-12 GB (RTX 3060, RTX 4070) si se usa cuantización.
- Despliegue: se puede usar con transformers + PEFT, vLLM (cargando el adaptador), llama.cpp (convirtiendo a GGUF), o TGI. También es compatible con Ollama si se empaqueta adecuadamente.
- Latencia y throughput: no disponibles; dependerán del hardware y de la cuantización. En una RTX 4090 con FP16, se esperan decenas de tokens por segundo para un modelo de 7B, pero no hay datos concretos.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este adaptador con otros modelos legales. El único punto de referencia es el propio modelo base Qwen2.5-7B-Instruct, que sin el adaptador ofrece un rendimiento generalista. No se conocen otros adaptadores legales públicos con los que comparar directamente, y el autor no ha publicado métricas. Por tanto, la comparativa se limita a indicar que el adaptador modifica el comportamiento del base en el dominio legal, pero no se puede cuantificar esa mejora.

## Limitaciones y advertencias

- El propio autor descartó esta versión (v2) tras verificarla, lo que indica que no es fiable para uso en producción ni para consultas legales reales.
- Al estar entrenado sin RAG, el modelo puede alucinar citas legales, artículos de ley o jurisprudencia inexistentes, con alto riesgo en un dominio donde la precisión es crítica.
- El ajuste se realizó en chino; su comportamiento en español u otros idiomas no está garantizado y probablemente sea deficiente.
- No se proporcionan detalles sobre el dataset de entrenamiento ni sobre el proceso de DPO (pares elegidos/rechazados), por lo que no se puede evaluar la calidad de los datos.
- La licencia Apache 2.0 permite uso comercial, pero el riesgo legal de usar un modelo con alucinaciones en el ámbito jurídico recae en el usuario.
- No hay información sobre sesgos específicos, pero el modelo base puede arrastrar sesgos de los datos de pre-entrenamiento, y el ajuste legal podría amplificarlos en contextos de género, raza o clase social.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Lexiiiii/legalgpt-dpo-round5-v2
- Proyecto LegalGPT (GitHub): https://github.com/czc0407/legalGPT
- Modelo base Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
