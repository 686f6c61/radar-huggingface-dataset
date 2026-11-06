# NamNH123/LFM3-1.7B-SFT-vi

## Resumen

LFM3-1.7B-SFT-vi es un ajuste fino supervisado (SFT) del modelo base LiquidAI/LFM3-1.7B, desarrollado por el usuario NamNH123 y publicado en Hugging Face bajo licencia Apache 2.0. El modelo conserva la arquitectura original del LFM3 de Liquid AI (un transformer compacto de 1.728.801.536 parámetros) y ha sido reentrenado con la librería Unsloth y TRL de Hugging Face para acelerar el proceso de entrenamiento. El resultado se distribuye en formato FP16 (16 bits), con un tamaño de repositorio de 3,5 GB.

La relevancia de esta ficha es limitada: se trata de un modelo derivado de un único autor, sin métricas de evaluación publicadas, sin documentación sobre el dataset de ajuste y con cero descargas en el momento de la consulta. No obstante, su interés técnico radica en que demuestra el flujo de trabajo habitual de fine-tuning eficiente sobre modelos pequeños de la familia LFM3, y en que hereda las capacidades del modelo base de Liquid AI.

El sufijo "vi" en el nombre sugiere un ajuste orientado a vietnamita, pero la model card declara únicamente el idioma inglés, por lo que esta correspondencia no está confirmada. Toda la información sobre datos de entrenamiento, hiperparámetros y evaluación está ausente de la documentación disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia LFM3 de Liquid AI); detalles internos no disponibles |
| Parametros totales | 1.728.801.536 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en el repo (pesos publicados en FP16) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (FP16) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado del base LiquidAI/LFM3-1.7B. La arquitectura subyacente corresponde a la familia LFM3 de Liquid AI, un transformer de aproximadamente 1,73 mil millones de parámetros; la model card no detalla la composición de capas, el mecanismo de atención ni innovaciones específicas del base. El entrenamiento se realizó con Unsloth y TRL, según declara el autor, con una aceleración de 2x respecto al flujo estándar, pero no se especifican el número de tokens de entrenamiento, la composición del dataset, la presencia de RLHF/DPO ni los hiperparámetros utilizados.

No hay información sobre la naturaleza de los datos de ajuste ni sobre si el modelo fue entrenado para una tarea concreta (el sufijo "vi" podría indicar vietnamita, aunque la model card solo declara inglés). Tampoco se documentan técnicas como decodificación especulativa, atención lineal o modos de razonamiento extendido. En consecuencia, cualquier afirmación sobre el proceso de entrenamiento más allá de lo citado sería especulativa.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es text-generation y las etiquetas incluyen "conversational", lo que indica que el ajuste está orientado a diálogo.
- Herencia de capacidades del base LFM3-1.7B: al ser un fine-tuning, conserva las habilidades del modelo original de Liquid AI (generación, razonamiento básico y código), aunque no se documenta su rendimiento tras el ajuste.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: la model card declara únicamente inglés; el sufijo "vi" no está confirmado como indicador de vietnamita.
- Capacidades especiales (thinking mode, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Prototipado de asistentes conversacionales en inglés: el modelo puede desplegarse como chatbot de texto en entornos de desarrollo gracias a su tamaño compacto (1,7 B) y a su formato FP16 listo para transformers.
- Fine-tuning adicional sobre dominios específicos: al ser un checkpoint SFT con licencia Apache 2.0, sirve como punto de partida para ajustes posteriores con Unsloth o TRL en tareas verticales.
- Experimentación académica con modelos pequeños: su reducido tamaño permite ejecutar experimentos de alineación o evaluación en una sola GPU consumer.
- Generación de texto en pipelines de CI/CD para pruebas: puede integrarse como modelo de referencia en tests de integración de aplicaciones de NLP.
- Despliegue con text-generation-inference: la etiqueta tgi sugiere compatibilidad con TGI para servir el modelo en producción a baja escala.
- Evaluación comparativa de técnicas de fine-tuning: útil para medir el impacto de SFT con Unsloth frente al modelo base en tareas controladas.
- Traducción o adaptación al vietnamita (si se confirma el propósito del sufijo "vi"): requeriría validación empírica, ya que la model card no lo documenta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 3,5 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, entre 4 y 6 GB según longitud de contexto y batch.
- VRAM estimada en cuantización de 8 bits: alrededor de 2 GB para pesos.
- VRAM estimada en cuantización de 4 bits: alrededor de 1 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 (RTX 3060, RTX 4060, RTX 4090); A100/H100 solo si se requiere alto throughput.
- Cabe en GPU consumer: sí, en modelos como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB.
- Opciones de despliegue: transformers, text-generation-inference (etiqueta tgi), y potencialmente llama.cpp/Ollama si se generan pesos GGUF (no incluidos en el repo).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B-SFT-vi (este) | 1,73 B | no disponible | Apache 2.0 | Hugging Face, 0 descargas | Fine-tuning SFT de un único autor, sin benchmarks |
| LiquidAI/LFM3-1.7B (base) | 1,73 B | no disponible | Apache 2.0 | Hugging Face, modelo oficial | Modelo original de Liquid AI, con documentación oficial |
| Alternativas de ~1-2 B (p. ej. Qwen2.5-1.5B, Llama-3.2-1B) | 1-1,5 B | 32k-128k (según modelo) | Apache 2.0 / Llama | Hugging Face, amplia adopción | Modelos con benchmarks públicos y ecosistema maduro |

La comparativa con alternativas de la misma categoría es aproximada: no se dispone de datos de rendimiento del modelo evaluado ni de su contexto, por lo que la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada sobre la calidad del ajuste frente al modelo base.
- Dataset de entrenamiento no documentado: se desconoce la composición, el idioma real y el volumen de datos, lo que impide evaluar sesgos y cobertura.
- Riesgo de alucinación: inherente a los modelos generativos de este tamaño; sin evaluación específica no puede cuantificarse.
- Idiomas: la model card declara solo inglés; el sufijo "vi" no está respaldado por documentación y el soporte de vietnamita es una hipótesis.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene revisar la licencia del modelo base LiquidAI/LFM3-1.7B.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso en producción ni validación por la comunidad.
- Contexto no documentado: no puede planificarse su uso en tareas de contexto largo sin verificación empírica.
- Fecha de creación futura (2026-11-03) en los metadatos: conviene tratar los datos temporales con cautela.

## Enlaces

- Hugging Face: https://huggingface.co/NamNH123/LFM3-1.7B-SFT-vi
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Unsloth: https://github.com/unslothai/unsloth
- TRL de Hugging Face: https://github.com/huggingface/trl
