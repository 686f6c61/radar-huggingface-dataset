# Jongbin-kr/llama-3.1-8b-instruct_SNI-domain-luca_ffn-only

## Resumen

Este modelo es un fine-tuning experimental del modelo `meta-llama/Llama-3.1-8B-Instruct`, desarrollado por el usuario Jongbin-kr. El nombre del repositorio indica que se trata de un ajuste fino con el dataset "SNI-domain-luca" y que la actualización de pesos se limita a las capas feed-forward (FFN) del transformer. El entrenamiento se realizó mediante Supervised Fine-Tuning (SFT) utilizando la librería TRL de Hugging Face.

El modelo forma parte de una serie de experimentos del mismo autor orientados a explorar arquitecturas de mezcla de expertos (MoE) y técnicas de fine-tuning selectivo sobre la familia Llama 3.1. El tamaño del repositorio (0.1 GB) sugiere que no se publican los pesos completos del modelo, sino probablemente un adaptador (tipo LoRA) o una actualización parcial de pesos, aunque no se especifica explícitamente en la documentación disponible.

La relevancia de este modelo radica en su carácter de investigación: permite estudiar el impacto de ajustar únicamente las capas FFN en un modelo instructivo de 8B parámetros, y su posible integración en pipelines de MoE. Sin embargo, al carecer de documentación detallada, benchmarks o licencia clara, su uso en producción no es recomendable sin una evaluación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en Llama 3.1 8B Instruct) |
| Parametros totales | No disponible (el modelo base tiene 8B; el adaptador o pesos parciales no se especifican) |
| Parametros activos | No disponible (no se confirma si es MoE) |
| Longitud de contexto | No disponible (el modelo base soporta 128K, pero no se confirma para este fine-tuning) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (hereda los del modelo base, pero no se documenta) |
| Licencia | No disponible (el frontmatter indica "licence: license", sin especificar) |
| Formato de pesos | safetensors (según tags) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del checkpoint `meta-llama/Llama-3.1-8B-Instruct`, que emplea una arquitectura transformer decoder-only con atención de múltiples cabezales y 8B parámetros. El nombre "ffn-only" indica que durante el entrenamiento solo se actualizaron los pesos de las capas feed-forward (FFN), dejando congeladas las demás capas (attention, norm, embeddings). Esta técnica es común en experimentos de eficiencia y en la preparación de modelos para conversión a arquitecturas MoE.

El entrenamiento se realizó con Supervised Fine-Tuning (SFT) mediante la librería TRL (versión 0.29.1), con Transformers 5.9.0 y PyTorch 2.11.0. No se proporcionan detalles sobre el dataset "SNI-domain-luca" (posiblemente relacionado con Super-NaturalInstructions o un dominio específico llamado Luca), ni sobre el número de tokens, épocas o configuración de hiperparámetros. El enlace a Weights & Biases en la model card sugiere que el entrenamiento fue registrado, pero no se incluyen métricas.

## Capacidades

- Generación de texto instructivo: al ser un fine-tune de Llama 3.1 Instruct, conserva la capacidad de seguir instrucciones y mantener conversaciones multi-turno, aunque no se han verificado experimentalmente en esta variante.
- Razonamiento y conocimiento general: hereda las capacidades del modelo base, incluyendo razonamiento lógico, conocimiento factual y comprensión lectora.
- Soporte de tool calling y function calling: el modelo base Llama 3.1 Instruct soporta estas funcionalidades, pero no se confirma que el fine-tuning las preserve.
- Capacidades multilingües: el modelo base tiene soporte multilingüe, pero no se documenta para esta variante.
- Capacidades especiales: no se reportan capacidades adicionales como modo de pensamiento, visión o audio.

## Casos de uso

- Investigación académica en fine-tuning selectivo: el modelo sirve para estudiar el efecto de actualizar solo las capas FFN en el rendimiento de un LLM instructivo, comparándolo con fine-tuning completo o con adaptadores LoRA.
- Experimentación con arquitecturas MoE: dado el interés del autor en modelos MoE, este fine-tuning puede utilizarse como punto de partida para convertir capas FFN en expertos o para evaluar la calidad de los pesos FFN ajustados.
- Evaluación de transferencia de dominio: si el dataset "SNI-domain-luca" corresponde a un dominio específico, el modelo puede probarse en tareas de ese dominio para medir la especialización.
- Pruebas de eficiencia de entrenamiento: al actualizar solo una parte de los parámetros, se puede medir el ahorro computacional y de memoria frente a un fine-tuning completo.
- Desarrollo de prototipos de bajo coste: si el adaptador es pequeño (0.1 GB), puede cargarse sobre el modelo base en hardware modesto para pruebas rápidas de generación de texto.
- Comparación de metodologías SFT: permite comparar los resultados de SFT con otras técnicas como DPO o RLHF en la misma base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo concreto.

## Requisitos de hardware

- Al ser un adaptador o pesos parciales de 0.1 GB, el requisito principal es el modelo base Llama-3.1-8B-Instruct, que requiere aproximadamente 16 GB de VRAM en FP16 para inferencia.
- Con cuantización (por ejemplo, 4-bit), el modelo base puede ejecutarse en GPUs de consumo como RTX 3090, RTX 4090 o incluso RTX 3060 12GB, dependiendo de la longitud de contexto.
- Para el adaptador, no se requiere VRAM adicional significativa si se fusiona con el modelo base.
- Opciones de despliegue: al ser un modelo de Transformers, puede usarse con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama, siempre que se cargue el adaptador sobre el base.
- No se dispone de datos de latencia o throughput específicos para este fine-tuning.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| meta-llama/Llama-3.1-8B-Instruct (base) | 8B | 128K | Llama 3.1 Community License | Modelo original, con benchmarks públicos |
| Jongbin-kr/llama-3.1-8b-instruct-4x1-moe | 8B (MoE) | 128K (según llm-explorer) | No disponible | Variante MoE del mismo autor, con VRAM estimada de 50.2GB |
| Jongbin-kr/llama-3.1-8b-instruct-4x1-moe-sni-ffn-lora | 8B (MoE) | No disponible | No disponible | Otra variante con LoRA en FFN, del mismo autor |

No se dispone de comparativas de rendimiento entre estos modelos, ya que no hay benchmarks publicados para ninguno de los fine-tunes del autor.

## Limitaciones y advertencias

- No se ha verificado la calidad del fine-tuning: al no haber benchmarks ni evaluaciones independientes, el rendimiento real es desconocido.
- El modelo es experimental y probablemente no apto para producción sin una validación exhaustiva.
- La licencia no está especificada, lo que impide conocer las restricciones de uso comercial o redistribución.
- El dataset de entrenamiento "SNI-domain-luca" no está documentado, por lo que se desconocen posibles sesgos o desequilibrios en los datos.
- Al ser un fine-tuning parcial (solo FFN), puede presentar degradación en tareas que requieran actualizaciones en otras capas.
- El modelo base Llama 3.1 Instruct tiene sesgos conocidos y riesgo de alucinación, que se heredan en esta variante.
- No se garantiza la compatibilidad con todas las herramientas de inferencia, ya que el formato de pesos (safetensors) y la estructura del adaptador no están detallados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jongbin-kr/llama-3.1-8b-instruct_SNI-domain-luca_ffn-only
- Modelo relacionado (MoE): https://huggingface.co/Jongbin-kr/llama-3.1-8b-instruct-4x1-moe
- Modelo relacionado (LoRA FFN): https://huggingface.co/Jongbin-kr/llama-3.1-8b-instruct-4x1-moe-sni-ffn-lora
- Ficha en llm-explorer: https://llm-explorer.com/model/Jongbin-kr%2Fllama-3.1-8b-instruct-4x1-moe,x8KU8QVpjhD01MwoyT7Ih
- Registro en free2aitools: https://free2aitools.com/model/jongbin-kr/llama-3.1-8b-instruct-4x1-moe-lbox-lora-sft-5ep
- Repositorio de TRL: https://github.com/huggingface/trl
