# PoluxAI/polux-andromeda-1-lora

## Resumen

Polux Andromeda 1 LoRA es un ajuste fino (fine-tuning) del modelo Qwen2.5-7B-Instruct, desarrollado por PoluxAI y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un adaptador LoRA entrenado sobre la versión cuantizada en 4 bits del modelo base que mantiene Unsloth (`unsloth/qwen2.5-7b-instruct-unsloth-bnb-4bit`), una elección habitual para reducir los requisitos de memoria durante el entrenamiento.

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5 con 7.000 millones de parámetros y una ventana de contexto nativa de 32.768 tokens (extensible hasta 131.072 mediante YaRN en la familia Qwen2.5). El ajuste se ha realizado con la librería TRL y el framework Unsloth, que según el autor permite un entrenamiento aproximadamente el doble de rápido que el flujo estándar.

La relevancia de esta ficha es limitada pero ilustrativa: se trata de un modelo con cero descargas y cero likes en el momento de la consulta, sin model card detallada ni benchmarks publicados. Resulta útil como ejemplo de adaptación ligera de un modelo base consolidado, pero su evaluación en producción exige pruebas propias, dado que el autor no documenta el dataset de entrenamiento, la tarea objetivo ni los hiperparámetros utilizados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajuste LoRA sobre modelo base |
| Parametros totales | 7.000 millones (heredados de Qwen2.5-7B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens nativos en Qwen2.5-7B (no confirmado en el adaptador) |
| Tipos de cuantizacion | El adaptador se entrena sobre base en 4 bits (bnb-4bit); no se documentan otras cuantizaciones |
| Idiomas soportados | en (ingles, segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre Qwen2.5-7B-Instruct, un transformer decoder-only con atención de tipo causal, normalización RMSNorm y activación SwiGLU. El entrenamiento se realizó con Unsloth y TRL, partiendo de la variante del modelo base cuantizada en 4 bits con bitsandbytes, lo que reduce el uso de VRAM durante el ajuste. El repositorio ocupa 0,5 GB, coherente con un adaptador LoRA de rango bajo más los ficheros de configuración, no con un modelo completo.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el rango y alpha del LoRA, la tasa de aprendizaje ni si se aplicaron técnicas de alineación adicionales como RLHF o DPO. La model card se limita a indicar el modelo base, el autor, la licencia y la mención a Unsloth. Tampoco se documenta ninguna innovación técnica específica más allá del uso de Unsloth para acelerar el entrenamiento.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Qwen2.5-7B-Instruct.
- Razonamiento y matemáticas de nivel medio, según las capacidades del base (no verificadas en el adaptador).
- Generación de código, también heredada del base.
- Soporte de tool calling y function calling, presumiblemente conservado del base (no verificado).
- Capacidad de seguir instrucciones y mantener conversaciones multi-turno.
- Capacidades multilingües del base potencialmente presentes, aunque la model card solo declara inglés.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Prototipado rápido de asistentes conversacionales en inglés: el adaptador puede cargarse sobre el base Qwen2.5-7B-Instruct para experimentar con un comportamiento ajustado sin necesidad de reentrenar el modelo completo.
- Investigación sobre fine-tuning eficiente: sirve como ejemplo reproducible de un pipeline Unsloth + TRL sobre un modelo de 7B en 4 bits, útil para estudiar costes y resultados de LoRA.
- Evaluación comparativa de adaptadores: permite medir el efecto del ajuste frente al base en tareas concretas, siempre que se conozca la tarea objetivo, que aquí no se documenta.
- Generación de texto asistida en entornos de desarrollo: integrable vía `transformers` o TGI para pruebas internas de generación y resumen en inglés.
- Base para un segundo ajuste: al ser un adaptador LoRA, puede combinarse o continuarse con otros adaptadores sobre el mismo base.
- Docencia y formación: ejemplo didáctico de publicación de un adaptador en Hugging Face con licencia permisiva y trazabilidad del modelo base.
- No se recomienda su uso en producción sin una evaluación previa, dado que no hay benchmarks ni descripción del dataset de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia del base en FP16: en torno a 14-16 GB para los pesos de 7B, más overhead de activaciones y KV cache.
- VRAM estimada con cuantización de 4 bits (GPTQ/AWQ/bnb): aproximadamente 4-6 GB para los pesos, más contexto.
- El adaptador LoRA en sí ocupa muy poco (repo de 0,5 GB) y se aplica sobre el base cargado.
- GPU recomendadas: A100 40/80 GB o H100 para servicio de alta concurrencia; RTX 4090 (24 GB) o RTX 3090 (24 GB) para FP16 en una sola GPU; RTX 4060 Ti 16 GB o inferiores con cuantización 4 bits.
- Cabe en GPU de consumo con cuantización: sí, en tarjetas de 8 GB o más con GGUF Q4.
- Opciones de despliegue: `transformers` con PEFT para cargar el adaptador, vLLM (soporte de LoRA), TGI, llama.cpp/Ollama tras convertir el modelo fusionado a GGUF.
- Latencia y throughput: no disponibles; dependen del hardware y del backend elegido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Polux Andromeda 1 LoRA | 7B (base) | 32.768 (base) | Apache 2.0 | Hugging Face, 0 descargas | Adaptador LoRA sin benchmarks |
| Qwen2.5-7B-Instruct | 7B | 32.768 (extensible a 131.072) | Apache 2.0 | Muy extendido | Modelo base oficial, con benchmarks publicados |
| Mistral-7B-Instruct-v0.3 | 7B | 32.768 | Apache 2.0 | Muy extendido | Alternativa europea con tool calling |
| Llama-3.1-8B-Instruct | 8B | 128.000 | Llama 3.1 Community | Muy extendido | Mayor contexto, licencia con restricciones |

La comparación directa con el base Qwen2.5-7B-Instruct es la más relevante: cualquier mejora atribuible al adaptador debería medirse frente a él. No hay datos que permitan afirmar que Polux Andromeda 1 supere al base en ninguna tarea.

## Limitaciones y advertencias

- Ausencia total de benchmarks y de descripción del dataset de entrenamiento: imposible evaluar la calidad o el propósito del ajuste.
- Riesgo de sobreajuste o de degradación de capacidades del base si el dataset era pequeño o muy específico; no verificable.
- Sesgos: heredados del corpus de entrenamiento del base Qwen2.5, no documentados por el autor.
- Riesgo de alucinación: el habitual en modelos de 7B, sin mitigaciones adicionales documentadas.
- Idioma: la model card declara únicamente inglés; el rendimiento en castellano no está garantizado.
- Licencia Apache 2.0 permisiva para uso comercial, pero conviene verificar las condiciones del modelo base y de los datos de ajuste, no documentadas.
- Modelo sin tracción (0 descargas, 0 likes): sin validación por parte de la comunidad.
- El adaptador requiere cargar el base en 4 bits o fusionarlo antes de usarlo; no es un modelo autónomo listo para `from_pretrained` sin PEFT.
- No apto para producción sin evaluación propia y sin pruebas de robustez.

## Enlaces

- Hugging Face: https://huggingface.co/PoluxAI/polux-andromeda-1-lora
- Modelo base: https://huggingface.co/unsloth/qwen2.5-7b-instruct-unsloth-bnb-4bit
- Qwen2.5-7B-Instruct (modelo original): https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Unsloth: https://github.com/unslothai/unsloth
- TRL: https://github.com/huggingface/trl
