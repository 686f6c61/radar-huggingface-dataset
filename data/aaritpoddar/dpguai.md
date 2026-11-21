# aaritpoddar/dpguai

## Resumen

dpguai es un ajuste fino (fine-tuning) del modelo Qwen2.5-1.5B-Instruct, publicado por el usuario aaritpoddar en Hugging Face. Se trata de un modelo de generación de texto de 1.543.714.304 parámetros (aproximadamente 1,5 mil millones) construido sobre la arquitectura Qwen2, la familia de transformadores densos desarrollada por Alibaba. El ajuste se realizó partiendo de la versión cuantizada en 4 bits de Unsloth (unsloth/Qwen2.5-1.5B-Instruct-unsloth-bnb-4bit) y empleando las herramientas de Unsloth junto con la librería TRL de Hugging Face para acelerar el entrenamiento.

La relevancia de este modelo es limitada y muy específica: se trata de una publicación de carácter experimental, con cero descargas en el momento de redactar esta ficha y una única marca de "me gusta". No incluye información sobre el conjunto de datos de entrenamiento, el propósito del ajuste ni resultados de evaluación. La model card es prácticamente la plantilla por defecto que genera Unsloth tras un entrenamiento, sin detalles adicionales.

Por tanto, debe considerarse un artefacto de investigación personal más que un modelo listo para producción. Su interés principal radica en ser un ejemplo de ajuste fino eficiente de un modelo pequeño con licencia Apache 2.0, pero carece de la documentación mínima necesaria para evaluar su calidad o su idoneidad en escenarios reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-1.5B-Instruct soporta hasta 32.768 tokens, pero el ajuste no lo documenta) |
| Tipos de cuantizacion | no disponible (el modelo base de partida estaba en 4 bits; el repo contiene safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Qwen2, un transformer denso con atención de múltiples cabezas, normalización RMSNorm y activación SwiGLU, en su variante de 1,5 mil millones de parámetros. El ajuste fino se realizó sobre la versión Instruct de Qwen2.5-1.5B ya cuantizada en 4 bits por Unsloth, lo que implica que el entrenamiento partió de pesos comprimidos y se llevó a cabo con las optimizaciones de memoria y velocidad de Unsloth integradas con TRL.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del conjunto de datos, la presencia de etapas de RLHF o DPO, ni sobre hiperparámetros como la tasa de aprendizaje o el número de épocas. La model card únicamente indica que el entrenamiento fue "2x más rápido" gracias a Unsloth, sin aportar métricas de pérdida ni curvas de entrenamiento. Tampoco se documenta ninguna innovación técnica adicional más allá del uso de las herramientas mencionadas.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Qwen2.5-1.5B-Instruct.
- Razonamiento básico y respuesta a instrucciones, sujeto a la calidad del ajuste fino no documentado.
- Capacidad de seguir el formato de chat de Qwen2 (etiquetas especiales de turno).
- Soporte de tool calling y function calling: no disponible en la información proporcionada para este ajuste concreto (el modelo base Qwen2.5-Instruct sí lo soporta, pero no se confirma que el ajuste lo preserve).
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma declarada.
- Modo "thinking", visión o audio: no disponible.

## Casos de uso

- Experimentación con ajuste fino eficiente: el modelo sirve como ejemplo práctico de cómo aplicar Unsloth y TRL sobre un modelo pequeño cuantizado en 4 bits, útil para desarrolladores que quieran replicar el flujo de trabajo en sus propios proyectos.
- Prototipado rápido de chatbots en inglés: al ser un modelo de 1,5B parámetros, puede desplegarse en entornos con recursos limitados para validar ideas de producto antes de escalar a modelos mayores.
- Generación de texto de bajo coste en local: su tamaño reducido permite ejecutarlo en CPU o en GPUs de consumo, adecuado para tareas de generación sencilla donde no se requiera alta calidad.
- Educación y demostraciones: útil en talleres o cursos para ilustrar el ciclo completo de ajuste fino de un LLM, desde la elección del modelo base hasta la publicación en Hugging Face.
- Evaluación comparativa de técnicas de cuantización: permite estudiar el impacto de partir de pesos en 4 bits frente a entrenar desde precisión completa, aunque el autor no haya publicado dicha comparación.
- Base para futuros ajustes: al tener licencia Apache 2.0, puede reutilizarse como punto de partida para nuevos fine-tunings experimentales en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3-4 GB en FP16 (1,5B parámetros × 2 bytes), y alrededor de 1-1,5 GB si se cuantiza a 4 bits (GGUF Q4).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16, como una GTX 1650, RTX 3050 o superior; para 4 bits basta con 2 GB.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas modernas (RTX 3060, RTX 4060, RTX 4090) e incluso en CPU con llama.cpp.
- Opciones de despliegue: transformers (librería nativa del repo), text-generation-inference (etiqueta declarada), llama.cpp u Ollama si se convierte a GGUF, y vLLM para servir con mayor throughput.
- Latencia y throughput estimados: no disponibles; al ser un modelo de 1,5B, se espera una latencia baja (decenas de milisegundos por token en GPU moderna), pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| dpguai (este modelo) | 1,54B | no disponible | Apache 2.0 | Hugging Face, 0 descargas | Ajuste fino experimental sin documentación |
| Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base oficial, con benchmarks publicados |
| Llama 3.2-1B-Instruct | 1,24B | 128.000 tokens | Llama 3.2 Community License | Hugging Face, muy popular | Requiere aceptar licencia; buen rendimiento en inglés |
| SmolLM2-1.7B-Instruct | 1,71B | 8.192 tokens | Apache 2.0 | Hugging Face | Alternativa pequeña con documentación completa |

La comparativa evidencia que dpguai no aporta ventajas documentadas frente a su modelo base ni frente a alternativas del mismo tamaño; su interés es meramente experimental.

## Limitaciones y advertencias

- Ausencia total de documentación sobre el conjunto de datos de entrenamiento, lo que impide evaluar sesgos introducidos durante el ajuste.
- Riesgo elevado de alucinación, inherente a los modelos de 1,5B parámetros y agravado por la falta de evaluación.
- Idioma limitado al inglés según la etiqueta declarada; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Longitud de contexto no documentada para este ajuste; podría diferir de la del modelo base.
- Licencia Apache 2.0 permite uso comercial, pero la falta de garantías y de evaluación hace desaconsejable su uso en producción sin una validación exhaustiva previa.
- Cero descargas y una única interacción social sugieren que el modelo no ha sido revisado por la comunidad.
- El ajuste parte de pesos cuantizados en 4 bits, lo que puede introducir degradaciones adicionales respecto a un entrenamiento desde precisión completa.
- No se confirma que las capacidades de tool calling del modelo base se hayan preservado tras el ajuste.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aaritpoddar/dpguai
- Modelo base (Unsloth, 4 bits): https://huggingface.co/unsloth/Qwen2.5-1.5B-Instruct-unsloth-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Librería TRL de Hugging Face: https://github.com/huggingface/trl
- Modelo oficial Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
