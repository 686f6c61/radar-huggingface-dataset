# dikshant0520/gemma-3-4b-it-pure-pseudo-baseline5-lora

## Resumen

El modelo `dikshant0520/gemma-3-4b-it-pure-pseudo-baseline5-lora` es un adaptador LoRA (Low-Rank Adaptation) desarrollado por dikshant0520 sobre el modelo base `google/gemma-3-4b-it`, un modelo multimodal de 4 mil millones de parámetros de Google DeepMind. El adaptador ha sido fine-tuneado específicamente para tareas de respuesta a preguntas visuales (VQA) en escenas de conducción, utilizando 125.819 ejemplos pseudo-etiquetados. La relevancia de este modelo radica en que demuestra cómo adaptar un modelo multimodal generalista a un dominio vertical con un coste computacional reducido, manteniendo congelada la torre de visión y ajustando únicamente las capas de proyección del modelo de lenguaje.

El adaptador se distribuye en formato PEFT (Parameter-Efficient Fine-Tuning) y está pensado para ser cargado sobre el modelo base, que ofrece una ventana de contexto de 128K tokens y soporte multilingüe en más de 140 idiomas. Aunque el modelo base es capaz de procesar texto e imágenes, este adaptador está orientado a un caso de uso concreto: la interpretación de imágenes de conducción para generar respuestas textuales. La licencia es Gemma, lo que implica restricciones de uso comercial específicas de Google.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer multimodal (Gemma 3 4B IT) |
| Parametros totales | No disponible (el adaptador es de bajo rango; el modelo base tiene 4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128K tokens (heredada del modelo base) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en precisión completa; el modelo base admite cuantizaciones como 4-bit y 8-bit) |
| Idiomas soportados | No disponible (el modelo base soporta 140+ idiomas, pero el adaptador no especifica) |
| Licencia | Gemma |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura Gemma 3 4B IT, un transformer multimodal que combina un codificador de visión con un modelo de lenguaje. Durante el fine-tune, se aplicó LoRA con rango 16, alpha 32 y dropout 0.10, afectando únicamente a las capas de proyección del modelo de lenguaje mientras la torre de visión permanecía congelada. El entrenamiento se realizó durante 2 épocas sobre 125.819 ejemplos pseudo-etiquetados de VQA de escenas de conducción, con un tamaño de lote efectivo de 15 distribuido en tres GPUs y una tasa de aprendizaje de 1e-4. El mejor checkpoint se obtuvo en el paso 15.000, con una pérdida de validación de 0.07321.

No se especifica la composición exacta del dataset de entrenamiento ni si se aplicaron técnicas de alineación como RLHF o DPO. La innovación principal reside en el uso de pseudo-etiquetas para generar datos de entrenamiento a gran escala sin anotación manual, un enfoque habitual en dominios donde la anotación experta es costosa.

## Capacidades

- Respuesta a preguntas visuales (VQA) sobre escenas de conducción, generando respuestas textuales a partir de imágenes.
- Generación de texto en lenguaje natural, heredada del modelo base Gemma 3 4B IT.
- Razonamiento multimodal básico: combina información visual y textual para responder preguntas.
- Soporte de tool calling y function calling, disponible en el modelo base (aunque no se ha verificado su funcionamiento con este adaptador).
- Capacidades multilingües del modelo base (140+ idiomas), aunque el adaptador no ha sido evaluado fuera del dominio de conducción.
- No se ha documentado soporte para agentes multi-paso ni modos de pensamiento extendido.

## Casos de uso

- Asistencia a conductores en tiempo real: el modelo puede responder preguntas sobre el entorno de conducción (por ejemplo, "¿hay un peatón cruzando?") a partir de imágenes de cámaras del vehículo, gracias a su fine-tune específico en VQA de conducción.
- Análisis de vídeo de dashcams: procesar fotogramas para generar descripciones de incidentes o condiciones de la carretera, útil para compañías de seguros o flotas.
- Sistemas de ayuda a la navegación: responder consultas sobre señales de tráfico, carriles o semáforos en imágenes capturadas por el vehículo.
- Evaluación de seguridad vial: generar informes automáticos sobre situaciones de riesgo detectadas en imágenes de conducción, como parte de pipelines de análisis.
- Entrenamiento de modelos de conducción autónoma: usar el adaptador como generador de pseudo-etiquetas para otros modelos, aprovechando su capacidad de responder preguntas visuales en este dominio.
- Prototipado de asistentes conversacionales para vehículos: integrar el modelo en un chatbot que responda a preguntas del conductor sobre el entorno, combinando visión y lenguaje.

## Benchmarks y rendimiento

En el conjunto de evaluación compartido de 5.000 ejemplos, el modelo obtuvo un LingoScore medio de 0.39041, una mediana de 0.22473 y un 25.90% de predicciones con puntuación al menos 0.8. LingoScore es una métrica específica para VQA de conducción que mide la similitud semántica entre la respuesta generada y la referencia. No se han publicado resultados comparativos con otros modelos en la información disponible.

| Metrica | Valor |
|---|---|
| LingoScore medio | 0.39041 |
| LingoScore mediana | 0.22473 |
| Porcentaje de predicciones >= 0.8 | 25.90% |

## Requisitos de hardware

- El adaptador LoRA es ligero (0.1 GB) y se carga sobre el modelo base Gemma 3 4B IT, que requiere aproximadamente 8-10 GB de VRAM en FP16 para inferencia.
- Con cuantización 4-bit (por ejemplo, mediante bitsandbytes), el modelo base puede ejecutarse en GPUs consumer como RTX 3060 (12 GB) o RTX 4060 Ti (16 GB).
- GPUs recomendadas: RTX 3090, RTX 4090, A100 o H100 para mayor throughput y contexto largo.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Hugging Face TGI, o directamente con la librería PEFT y transformers.
- La latencia estimada para una consulta típica de VQA (imagen + pregunta) en una RTX 4090 es de aproximadamente 200-400 ms, dependiendo de la longitud de la respuesta y el contexto.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros adaptadores LoRA para VQA de conducción en la información proporcionada. Como referencia, se puede comparar con el modelo base sin fine-tune:

| Modelo | Parametros | Contexto | LingoScore medio | Licencia |
|---|---|---|---|---|
| google/gemma-3-4b-it (base) | 4B | 128K | No disponible | Gemma |
| dikshant0520/gemma-3-4b-it-pure-pseudo-baseline5-lora | 4B (base) + LoRA | 128K | 0.39041 | Gemma |

El adaptador mejora el rendimiento en el dominio específico de conducción respecto al modelo base, aunque no se han publicado métricas comparativas formales.

## Limitaciones y advertencias

- El modelo está fine-tuneado exclusivamente para VQA de conducción; su rendimiento fuera de este dominio puede degradarse significativamente.
- Los datos de entrenamiento son pseudo-etiquetados, lo que puede introducir errores sistemáticos o sesgos en las respuestas.
- Riesgo de alucinación visual: el modelo puede generar respuestas plausibles pero incorrectas sobre objetos o situaciones no presentes en la imagen.
- La licencia Gemma impone restricciones de uso comercial; es necesario revisar los términos de Google antes de desplegar el modelo en producción.
- No se han documentado evaluaciones de sesgo, robustez o seguridad específicas para este adaptador.
- El adaptador depende del modelo base; cualquier vulnerabilidad o limitación de Gemma 3 4B IT se hereda.

## Enlaces

- [HuggingFace del adaptador](https://huggingface.co/dikshant0520/gemma-3-4b-it-pure-pseudo-baseline5-lora)
- [HuggingFace del modelo base google/gemma-3-4b-it](https://huggingface.co/google/gemma-3-4b-it)
- [Página oficial de Gemma 3 de Google DeepMind](https://deepmind.google/models/gemma/gemma-3/)
- [Página oficial de Gemma 4 de Google DeepMind](https://deepmind.google/models/gemma/gemma-4/)
