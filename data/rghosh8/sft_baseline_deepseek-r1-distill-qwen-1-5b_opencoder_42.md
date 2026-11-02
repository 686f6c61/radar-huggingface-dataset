# rghosh8/SFT_baseline_DeepSeek-R1-Distill-Qwen-1.5B_opencoder_42

## Resumen

El modelo `rghosh8/SFT_baseline_DeepSeek-R1-Distill-Qwen-1.5B_opencoder_42` es un ajuste fino supervisado (SFT) del modelo `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B`, publicado por el usuario rghosh8 en HuggingFace. Se trata de un checkpoint de investigación, no de un modelo de produccion: el nombre indica que es una "baseline" de SFT sobre un dataset denominado "opencoder" con semilla 42, típico de experimentos de ablation o comparación de pipelines de entrenamiento.

El modelo base es un distill de DeepSeek-R1 sobre la arquitectura Qwen2 de 1.5B parámetros. El ajuste se realizó con la librería TRL (versión 1.15.0) bajo el framework Transformers 5.17.0 y PyTorch 2.13.0. El resultado es un modelo conversacional de generación de texto de 1.777.088.000 parámetros (1.5B nominales), con pesos en safetensors y un tamaño de repositorio de 3.6 GB.

Su relevancia es limitada fuera del contexto de investigación: no tiene descargas ni likes, no declara licencia ni idiomas, y su model card es prácticamente la plantilla autogenerada por TRL. Resulta útil como referencia para reproducir experimentos de SFT sobre destilados de razonamiento, pero no como modelo listo para despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 1.777.088.000 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizacion a GGUF/AWQ no publicada por el autor) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card menciona "licence: license" sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es Qwen2, un transformer decoder-only denso con atención causal estándar y normalización RMSNorm, heredada del modelo base `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B`. Este modelo base fue destilado por DeepSeek a partir de su modelo de razonamiento R1, por lo que incorpora patrones de "thinking" en la generación (cadenas de razonamiento antes de la respuesta final), aunque la model card del ajuste no lo documenta explícitamente.

El entrenamiento consistió en un SFT (supervised fine-tuning) con TRL 1.15.0 sobre el dataset "opencoder" (no descrito en la model card), con semilla 42 y etiquetado como "baseline". No se especifican el número de tokens de entrenamiento, la composición del dataset, la existencia de RLHF/DPO posterior ni hiperparámetros como learning rate o número de épocas. La model card es la plantilla autogenerada por TRL y no aporta detalles técnicos adicionales.

## Capacidades

- Generación de texto conversacional multi-turno (formato de chat con roles `user`/`assistant`).
- Razonamiento paso a paso heredado del destilado de DeepSeek-R1 (cadenas de pensamiento antes de la respuesta), aunque no verificado en este checkpoint.
- Generación de código y matemáticas, presumiblemente por herencia del modelo base, sin datos de evaluación publicados.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no disponibles (idiomas no declarados).
- Capacidades especiales (visión, audio, thinking mode explícito): no disponibles.

## Casos de uso

- Reproducción de experimentos de SFT: sirve como baseline para comparar pipelines de ajuste supervisado sobre destilados de razonamiento, dado su nombre y semilla fija.
- Investigación en destilación de razonamiento: permite estudiar cómo el SFT sobre un dataset específico ("opencoder") modifica el comportamiento de un modelo destilado de R1.
- Evaluación de técnicas de alineación: al ser un checkpoint "baseline", se puede usar como punto de partida para comparar con variantes DPO/RLHF.
- Prototipado rápido en local: con 1.5B parámetros y pesos safetensors, cabe en GPUs de consumo para pruebas de generación de texto.
- Generación de código asistida en entornos de investigación: si el dataset "opencoder" está orientado a código, podría emplearse en tareas de autocompletado, aunque sin garantías de calidad.
- Docencia y formación: útil para ilustrar el flujo completo de SFT con TRL sobre un modelo base conocido, incluyendo la carga con `pipeline` de Transformers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: ~3.6 GB de pesos, más overhead de activaciones y KV cache; en la práctica ~4-5 GB.
- VRAM estimada en cuantización 8-bit: ~1.8-2 GB; en 4-bit: ~1-1.5 GB (estimaciones según tamaño, no publicadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM para fp16 (RTX 3060, RTX 4060, RTX 4070); A100/H100 no necesarias pero válidas para batch grande.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y en GPUs Apple Silicon con suficiente memoria unificada.
- Opciones de despliegue: Transformers (`pipeline`), vLLM, TGI (el tag `text-generation-inference` está presente), llama.cpp/Ollama si se convierte a GGUF (no publicado por el autor).
- Latencia y throughput estimados: no disponibles (no hay mediciones publicadas).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| rghosh8/SFT_baseline_DeepSeek-R1-Distill-Qwen-1.5B_opencoder_42 | 1.777.088.000 | no disponible | no disponible | HuggingFace (0 descargas) |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B (base) | 1.5B | 32.768 tokens (según model card del base) | MIT (según model card del base) | HuggingFace, ampliamente usado |
| Qwen2.5-1.5B-Instruct | 1.5B | 32.768 tokens | Apache-2.0 | HuggingFace, ampliamente usado |
| Qwen2.5-1.5B (base) | 1.5B | 32.768 tokens | Apache-2.0 | HuggingFace |

La comparativa se limita a parámetros y disponibilidad; no hay datos de rendimiento publicados para el checkpoint ajustado que permitan comparar calidad.

## Limitaciones y advertencias

- Model card autogenerada por TRL: no documenta dataset, hiperparámetros, tokens de entrenamiento ni evaluación.
- Licencia no especificada: la model card indica "licence: license" sin concretar; no se puede garantizar uso comercial. Verificar la licencia del modelo base (MIT según su model card) antes de cualquier uso.
- Idiomas no declarados: no hay garantía de comportamiento multilingüe.
- Riesgo de alucinación: inherente a los modelos de 1.5B y a los destilados de razonamiento; sin evaluación publicada no se puede cuantificar.
- Sesgos: no documentados; el dataset "opencoder" no está descrito.
- Contexto no especificado en este checkpoint: aunque el base soporta 32K, el ajuste podría haber alterado el comportamiento en contextos largos.
- Sin descargas ni validación comunitaria: no hay evidencia de que el checkpoint funcione correctamente ni de que el entrenamiento haya convergido.
- Uso en producción desaconsejado sin evaluación previa: es un artefacto de investigación.
- El código de ejemplo de la model card usa `model="None"`, lo que indica que la plantilla no fue revisada por el autor.

## Enlaces

- HuggingFace: https://huggingface.co/rghosh8/SFT_baseline_DeepSeek-R1-Distill-Qwen-1.5B_opencoder_42
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Repositorio TRL: https://github.com/huggingface/trl
- Paper de DeepSeek-R1: no disponible en la información proporcionada
- Blog o demo del autor: no disponible
