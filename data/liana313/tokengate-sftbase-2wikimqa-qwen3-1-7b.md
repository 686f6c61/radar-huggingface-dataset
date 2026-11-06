# liana313/tokengate-sftbase-2wikimqa-qwen3-1.7b

## Resumen

TokenGate SFT baseline (2WikiMultihopQA) es un adaptador LoRA de ajuste supervisado (SFT) sobre el modelo Qwen3-1.7B, publicado por el usuario liana313 en Hugging Face. Se trata del "baseline estándar" contra el que se compara la propuesta principal del artículo arXiv:2610.26754 (TokenGate), un trabajo sobre token gating en contextos largos. El adaptador se ha entrenado sobre el gemelo de 2WikiMultihopQA construido a partir de la Wikipedia completa (mfqa_2wiki_wiki) y se evalúa en la tarea 2wikimqa de LongBench, un benchmark de razonamiento multi-salto sobre documentos largos.

El modelo base Qwen3-1.7B es un transformer decoder-only de 1.700 millones de parámetros desarrollado por el equipo Qwen de Alibaba, con soporte nativo de contexto largo y modo de razonamiento. El adaptador añade únicamente matrices de bajo rango (r=16, alpha=32) sobre las proyecciones `q_proj` y `v_proj` de todas las capas, sin modificar los pesos congelados del modelo base. Esto lo convierte en un artefacto ligero (el repositorio ocupa 0,0 GB según Hugging Face, lo que sugiere que los pesos del adaptador son de pocos megabytes) pensado para reproducir experimentos académicos, no para despliegue en producción.

La relevancia de esta ficha es doble: por un lado, documenta un checkpoint concreto (paso 39600) seleccionado bajo la misma regla de fairness que los checkpoints con gating del artículo; por otro, sirve como referencia para quien quiera replicar los resultados del paper o entender el coste de un SFT plano frente a una arquitectura con token gating en tareas de razonamiento multi-salto con contexto largo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) + adaptador LoRA sobre q_proj y v_proj |
| Parametros totales | 1.700 millones (modelo base Qwen3-1.7B); adaptador LoRA de rango 16 (tamano exacto no disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen3-1.7B) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en fp32/bf16 como state dict; el modelo base admite las cuantizaciones de Qwen3) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `lora_step39600.pt` (state dict de PyTorch) + `params.json` (configuracion de entrenamiento) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-1.7B, un transformer decoder-only con atención completa y las innovaciones propias de la familia Qwen3 (RoPE, normalización RMSNorm, activación SwiGLU). El SFT se realiza con LoRA de rango 16 y alpha 32 sobre las proyecciones de query y value de todas las capas, manteniendo congelados los pesos del modelo base. No hay token gating: es un siguiente-token SFT plano, con el mismo presupuesto de adaptador que las ejecuciones con gating del artículo, lo que permite aislar el efecto del mecanismo de gating en la comparación.

El entrenamiento usa el dataset mfqa_2wiki_wiki, un gemelo de 2WikiMultihopQA construido sobre la Wikipedia completa, y se evalúa en la tarea 2wikimqa de LongBench. El checkpoint publicado es el paso 39600, seleccionado por la misma regla que los checkpoints con gating: máxima precisión en el conjunto de test held-out con contexto completo entre los pasos guardados, bajo el tope de fairness del artículo. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO posteriores (el pipeline declarado es SFT).

## Capacidades

- Generación de texto autoregresiva en inglés (y potencialmente otros idiomas heredados de Qwen3, aunque no se documentan).
- Razonamiento multi-salto sobre documentos largos: la tarea objetivo es 2wikimqa de LongBench, que requiere combinar información de varios pasajes de Wikipedia.
- Lectura comprensiva con contexto largo: hereda la ventana de contexto de Qwen3-1.7B (longitud exacta no disponible en la información proporcionada).
- No se documenta soporte de tool calling ni function calling específico en el adaptador.
- No se documenta soporte de agentes ni razonamiento multi-paso más allá de la tarea de QA multi-salto.
- No se documentan capacidades de visión, audio ni modo thinking explícito en este adaptador (aunque el base Qwen3 sí soporta modo thinking; el adaptador no lo declara).
- El adaptador no incluye cabecera de clasificación ni módulos adicionales: es un ajuste puramente generativo.

## Casos de uso

- Reproducción de experimentos académicos: cargar el adaptador con la librería TokenGate y evaluar en LongBench 2wikimqa para replicar la línea base del paper arXiv:2610.26754. Es el uso principal para el que se publica.
- Comparación controlada de técnicas de contexto largo: al compartir presupuesto de adaptador con el checkpoint con gating, permite aislar el efecto del token gating frente al SFT plano en la misma tarea y con el mismo modelo base.
- Investigación sobre razonamiento multi-salto: útil para estudiar cómo un modelo de 1.7B se comporta en preguntas que requieren encadenar hechos de varios documentos, sirviendo de referencia para trabajos sobre retrieval-augmented generation.
- Docencia y formación: ejemplo mínimo y reproducible de cómo aplicar LoRA sobre Qwen3 con la librería TokenGate, útil en cursos de fine-tuning eficiente.
- Desarrollo de pipelines de evaluación: el checkpoint puede integrarse en harnesses de evaluación tipo lm-evaluation-harness o LongBench para medir precisión en 2wikimqa con contexto completo.
- Estudio de selección de checkpoints: el paso 39600 y la regla de selección documentada permiten analizar el efecto de la selección de checkpoints bajo restricciones de fairness en experimentos de SFT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que el checkpoint se evaluó en LongBench 2wikimqa y que se seleccionó por máxima precisión held-out, pero no se incluyen los valores numéricos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen3-1.7B en bf16 requiere aproximadamente 3,4 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, entre 5 y 8 GB para contextos moderados. El adaptador LoRA añade un coste despreciable (decenas de MB).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16 (RTX 3060 Ti, RTX 4060 Ti, RTX 4070). Para contextos largos o mayor throughput, A100, H100 o L40S.
- Cabe en GPU de consumo: sí, en RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4070/4080/4090, siempre que se use bf16 o cuantización de 8/4 bits.
- Opciones de despliegue: la carga documentada usa `transformers` con `AutoModelForCausalLM` y la librería TokenGate (`tokengate.e2e_gate.gate_module.lora`). No se documenta soporte directo en vLLM, llama.cpp, Ollama ni TGI para este adaptador concreto, ya que el formato es un state dict de PyTorch y no un adaptador PEFT estándar.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TokenGate SFT baseline (este) | 1.7B + LoRA r16 | no disponible | 2wikimqa (LongBench) | Apache 2.0 | Hugging Face (liana313) |
| TokenGate gated (liana313/tokengate-2wikimqa-qwen3-1.7b) | 1.7B + LoRA r16 con gating | no disponible | 2wikimqa (LongBench) | Apache 2.0 | Hugging Face (liana313) |
| Qwen3-1.7B (base) | 1.7B | no disponible | Generacion general | Apache 2.0 | Hugging Face (Qwen) |
| Qwen2.5-1.5B (referencia de la familia anterior) | 1.5B | 32K (segun documentacion publica de Qwen2.5) | Generacion general | Apache 2.0 | Hugging Face (Qwen) |

La comparación directa más relevante es con el checkpoint con token gating del mismo autor, ya que comparten modelo base, dataset, presupuesto de adaptador y regla de selección de checkpoint. La comparación con Qwen3-1.7B base y con Qwen2.5-1.5B sirve para contextualizar el tamaño y la licencia, pero no hay datos de rendimiento publicados en la información disponible para establecer diferencias cuantitativas.

## Limitaciones y advertencias

- Es un adaptador de investigación, no un modelo listo para producción: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el formato de pesos (`lora_step39600.pt`) requiere la librería TokenGate, no es un adaptador PEFT estándar.
- El checkpoint está especializado en una única tarea (2wikimqa de LongBench) y un único dataset (mfqa_2wiki_wiki); el rendimiento fuera de ese dominio no está documentado y probablemente sea degradado respecto al modelo base.
- No se documentan los idiomas soportados; se desconoce si el adaptador conserva el multilingüismo de Qwen3 o si el SFT lo ha sesgado hacia el inglés.
- No se documentan sesgos conocidos, pero al entrenarse sobre Wikipedia, hereda los sesgos de cobertura y sesgo editorial de esa fuente.
- Riesgo de alucinación: como todo modelo generativo de 1.7B, puede inventar hechos, especialmente en preguntas multi-salto donde la evidencia está dispersa; no se documentan mecanismos de abstención.
- La licencia Apache 2.0 permite uso comercial del adaptador, pero conviene verificar la licencia del modelo base Qwen3-1.7B (también Apache 2.0 según la información disponible) y de los datos de entrenamiento (Wikipedia, con licencia CC BY-SA para el texto, lo que puede imponer obligaciones de atribución en derivados).
- El tamaño del repositorio (0,0 GB) y la ausencia de métricas publicadas impiden validar la calidad del checkpoint sin ejecutar la evaluación uno mismo.
- No se documenta el número de tokens de entrenamiento ni la composición exacta del dataset, lo que limita la reproducibilidad completa.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/liana313/tokengate-sftbase-2wikimqa-qwen3-1.7b
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Contraparte con token gating: https://huggingface.co/liana313/tokengate-2wikimqa-qwen3-1.7b
- Paper: https://arxiv.org/abs/2610.26754
- Repositorio de la librería TokenGate: https://github.com/token-gate-llms/TokenGate
