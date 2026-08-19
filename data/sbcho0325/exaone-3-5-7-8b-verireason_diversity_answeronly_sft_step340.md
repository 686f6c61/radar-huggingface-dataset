# sbcho0325/EXAONE-3.5-7.8B-verireason_diversity_answeronly_sft_step340

## Resumen

El modelo `sbcho0325/EXAONE-3.5-7.8B-verireason_diversity_answeronly_sft_step340` es un adaptador LoRA (Low-Rank Adaptation) entrenado mediante fine-tuning supervisado (SFT) sobre el modelo base `LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct`, desarrollado por LG AI Research. El nombre del adaptador sugiere que fue entrenado para tareas de verificación de razonamiento con diversidad de respuestas, aunque no se proporciona documentación detallada al respecto.

Este adaptador se distribuye en formato PEFT (Parameter-Efficient Fine-Tuning) y tiene un tamaño de repositorio de 0.3 GB, lo que indica que solo contiene los pesos del adaptador, no el modelo completo. Está diseñado para ser cargado sobre el modelo base EXAONE-3.5-7.8B-Instruct, que es un modelo de lenguaje de 7.8 mil millones de parámetros con arquitectura transformer y ventana de contexto de 4096 tokens.

La relevancia de este modelo radica en que permite adaptar un modelo base potente y multilingüe a una tarea específica sin necesidad de reentrenar todos los parámetros, lo que reduce significativamente los costes computacionales. Sin embargo, la falta de documentación y de métricas de evaluación publicadas limita su uso en producción sin una validación adicional por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer (modelo base: EXAONE-3.5-7.8B-Instruct) |
| Parametros totales | No disponible (adaptador LoRA, el modelo base tiene 7.8B) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible (modelo base: 4096 tokens) |
| Tipos de cuantizacion | No disponible (formato PEFT safetensors) |
| Idiomas soportados | No disponible (modelo base: coreano, ingles, otros) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador utiliza la técnica LoRA, que congela los pesos del modelo base e inyecta matrices de bajo rango en las capas de atención y feed-forward. Esto permite un fine-tuning eficiente con una fracción mínima de parámetros entrenables. El modelo base, EXAONE-3.5-7.8B-Instruct, es un transformer decoder-only con 7.8 mil millones de parámetros, entrenado por LG AI Research con un enfoque en razonamiento y capacidades multilingües, especialmente en coreano e inglés.

El entrenamiento del adaptador se realizó mediante SFT (Supervised Fine-Tuning), como indican las etiquetas `sft` y `trl` (Transformers Reinforcement Learning). El nombre del checkpoint (`step340`) sugiere que se guardó tras 340 pasos de optimización, aunque no se especifican los hiperparámetros exactos, el dataset utilizado ni el régimen de entrenamiento (precisión mixta, etc.). No hay información sobre el uso de RLHF, DPO u otras técnicas de alineación posteriores al SFT.

## Capacidades

- Generación de texto conversacional: al estar basado en EXAONE-3.5-Instruct, hereda la capacidad de mantener diálogos multi-turno.
- Razonamiento: el nombre del adaptador sugiere un enfoque en verificación de razonamiento, aunque no hay evidencia publicada de su rendimiento en tareas específicas.
- Multilingüismo: hereda del modelo base el soporte para coreano, inglés y otros idiomas, aunque el adaptador podría haber sido entrenado en un subconjunto limitado.
- Tool calling y function calling: no disponible en la información del adaptador; el modelo base EXAONE-3.5-Instruct sí soporta estas capacidades, pero no se confirma que el adaptador las preserve.
- Capacidades de agente y multi-step reasoning: no disponible.

## Casos de uso

- Fine-tuning selectivo para tareas de razonamiento: el adaptador puede cargarse sobre EXAONE-3.5-7.8B-Instruct para experimentar con tareas que requieran verificación de razonamiento o generación de respuestas diversas. Es adecuado para investigación académica donde se quiera evaluar el impacto del SFT en dominios específicos.
- Prototipado rápido de asistentes conversacionales: gracias a su bajo coste de almacenamiento (0.3 GB), permite probar variantes del modelo base sin necesidad de alojar múltiples copias completas.
- Experimentación con PEFT: desarrolladores que trabajen con la librería PEFT pueden usar este adaptador como referencia para entender cómo se estructura un adaptador LoRA sobre EXAONE-3.5.
- Evaluación comparativa de adaptadores: puede utilizarse en estudios que comparen diferentes estrategias de fine-tuning (LoRA vs. full fine-tuning) sobre el mismo modelo base.
- Generación de datos sintéticos para entrenamiento: al estar afinado para producir respuestas diversas, podría emplearse para generar datasets de entrenamiento en tareas de razonamiento, aunque se requiere validación manual.
- Investigación sobre alineación y verificación: el nombre `verireason_diversity_answeronly` sugiere un enfoque en verificación de razonamiento y diversidad de respuestas, lo que podría ser útil en estudios sobre consistencia y robustez de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay métricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluación comparativa para este adaptador. El autor no ha proporcionado datos de rendimiento en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador en sí. El modelo base EXAONE-3.5-7.8B-Instruct requiere aproximadamente 16 GB de VRAM en FP16, y unos 8 GB en cuantización de 4 bits (usando técnicas como GPTQ o AWQ).
- GPU recomendadas: para el modelo base completo, una GPU con al menos 16 GB (RTX 4090, A100 40GB, etc.) es necesaria para inferencia en FP16. Con cuantización, una GPU de 8-12 GB (RTX 3080, RTX 4070) podría ser suficiente.
- Si cabe en consumer GPU: sí, con cuantización. El adaptador LoRA añade una carga mínima adicional.
- Opciones de despliegue: al ser un adaptador PEFT, puede cargarse con la librería `peft` de Hugging Face junto con el modelo base. Para producción, se puede fusionar el adaptador con el modelo base y exportar a formatos como GGUF para usar con llama.cpp u Ollama, o servir con vLLM o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa rigurosa. El adaptador es específico de EXAONE-3.5-7.8B-Instruct y no existen datos de rendimiento publicados. Como referencia, el modelo base compite con otros modelos de 7-8B como Llama 3.1 8B, Mistral 7B o Qwen 2.5 7B, pero el adaptador no puede compararse directamente sin métricas. Se indica "no disponible".

## Limitaciones y advertencias

- No hay documentación sobre el dataset de entrenamiento, los hiperparámetros ni el proceso de validación, lo que impide evaluar la calidad del adaptador.
- El modelo base EXAONE-3.5-7.8B-Instruct tiene una licencia propia de LG AI Research que puede imponer restricciones de uso comercial. La licencia del adaptador no está especificada, por lo que se debe asumir que hereda las condiciones del modelo base.
- Riesgo de alucinación y sesgos: al ser un fine-tuning sobre un modelo base, el adaptador puede heredar sesgos del modelo original y del dataset de fine-tuning, que no se ha revelado.
- Limitaciones de contexto: la ventana de contexto del modelo base es de 4096 tokens, lo que limita tareas que requieran contextos muy largos.
- El nombre del adaptador sugiere un enfoque en "diversidad de respuestas", lo que podría implicar una mayor variabilidad en las salidas, algo a tener en cuenta para aplicaciones que requieran consistencia.
- Sin benchmarks ni evaluaciones, no se recomienda su uso en producción sin una validación exhaustiva previa.

## Enlaces

- HuggingFace: https://huggingface.co/sbcho0325/EXAONE-3.5-7.8B-verireason_diversity_answeronly_sft_step340
- Modelo base: https://huggingface.co/LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct
- Paper de referencia sobre impacto ambiental (citado en la model card): https://arxiv.org/abs/1910.09700
