# pngwn/sft-out

## Resumen

El modelo `pngwn/sft-out` es un fine-tuning de tipo SFT (supervised fine-tuning) del modelo base `HuggingFaceTB/SmolLM2-135M`, desarrollado por el usuario `pngwn`. Fue entrenado sobre el dataset `trl-lib/Capybara` utilizando la librería TRL de HuggingFace. Se trata de un modelo de lenguaje pequeño, con aproximadamente 134,5 millones de parámetros, orientado a generación de texto conversacional.

Este modelo no es un desarrollo nuevo desde cero, sino un experimento de ajuste fino sobre un modelo ya existente. Su relevancia radica en servir como ejemplo práctico de fine-tuning con TRL, así como en permitir evaluar el comportamiento de un modelo pequeño tras ser entrenado con un dataset conversacional. La arquitectura es la del modelo base, un transformer de tamaño reducido, aunque la longitud de contexto y otras especificaciones no se detallan en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en SmolLM2-135M) |
| Parametros totales | 134.515.008 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del modelo `HuggingFaceTB/SmolLM2-135M`, que a su vez es un transformer de tipo decoder-only. El entrenamiento se realizó mediante SFT (supervised fine-tuning) sobre el dataset `trl-lib/Capybara`, un conjunto de datos de conversaciones. El proceso se llevó a cabo con la librería TRL, y las versiones de las librerías utilizadas son TRL 0.12.2, Transformers 4.46.3, PyTorch 2.14.0, Datasets 5.0.1 y Tokenizers 0.20.3.

No se proporcionan detalles adicionales sobre el procedimiento de entrenamiento, como número de épocas, tamaño del lote, tasa de aprendizaje o configuración específica de los hiperparámetros. Tampoco se mencionan innovaciones técnicas destacables: se trata de un ajuste fino estándar sobre un modelo preentrenado.

## Capacidades

- Generación de texto conversacional: el modelo responde a mensajes en formato de chat, tal como se muestra en el ejemplo de uso de la model card, donde se plantea una pregunta filosófica y se espera una respuesta generada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades de visión o audio: no disponible.
- Modo de pensamiento (thinking mode): no disponible.

## Casos de uso

- Prototipado de asistentes conversacionales en investigación: el modelo puede utilizarse para probar rápidamente flujos de diálogo sencillos en entornos académicos o de desarrollo, gracias a su pequeño tamaño y facilidad de carga.
- Experimentos de fine-tuning con TRL: sirve como ejemplo práctico para estudiar cómo afecta el dataset Capybara a un modelo pequeño, permitiendo comparar el comportamiento antes y después del ajuste.
- Uso educativo en cursos de IA: es adecuado para demostrar el pipeline completo de SFT, desde la carga del modelo base hasta la inferencia, sin necesidad de hardware potente.
- Generación de respuestas cortas en aplicaciones de demostración: puede integrarse en demos o prototipos de aplicaciones de chat donde no se requiera alta calidad ni razonamiento complejo.
- Pruebas de integración con la librería Transformers: el modelo es compatible con el pipeline `text-generation`, por lo que resulta útil para validar integraciones de código en entornos de desarrollo.
- Análisis de sesgos en modelos pequeños: al estar entrenado con un dataset conversacional, puede emplearse en estudios sobre sesgos y comportamientos de modelos de tamaño reducido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en FP32 y 0,25 GB en FP16, según el número de parámetros (134,5 millones). Es una estimación, no un valor oficial.
- GPU recomendada: cualquier GPU con al menos 1 GB de VRAM, o incluso CPU, dado el reducido tamaño del modelo.
- Compatible con GPUs de consumo: sí, puede ejecutarse en GPUs como RTX 3060, RTX 4090, o incluso en hardware más antiguo.
- Opciones de despliegue: compatible con la librería Transformers de HuggingFace mediante el pipeline `text-generation`. Los tags indican compatibilidad con endpoints de HuggingFace y con `text-generation-inference`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| pngwn/sft-out | 134,5 M | no disponible | no disponible | HuggingFace |
| HuggingFaceTB/SmolLM2-135M | 135 M | no disponible | no disponible | HuggingFace |
| Qwen2.5-0.5B | 500 M | no disponible | no disponible | HuggingFace |

La comparativa se limita a parámetros y disponibilidad, ya que no se han publicado resultados de rendimiento para ninguno de estos modelos en la información disponible.

## Limitaciones y advertencias

- El modelo tiene solo 134,5 millones de parámetros, lo que limita su capacidad para tareas complejas de razonamiento, generación de código o matemáticas avanzadas.
- No se han publicado evaluaciones de benchmarks, por lo que se desconoce su calidad real frente a otros modelos.
- La licencia no está especificada: es necesario verificar los términos antes de cualquier uso comercial.
- La longitud de contexto no se indica: se hereda del modelo base, pero no se confirma en la información proporcionada.
- El dataset de entrenamiento (Capybara) puede introducir sesgos específicos en las respuestas, y no se ha realizado una evaluación de sesgos.
- Existe riesgo de alucinación, especialmente en temas fuera del dominio de los datos de entrenamiento.
- No se especifican los idiomas soportados; el comportamiento multilingüe es incierto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pngwn/sft-out
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M
- Dataset de entrenamiento: https://huggingface.co/datasets/trl-lib/Capybara
- Repositorio de TRL: https://github.com/huggingface/trl
