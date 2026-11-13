# haengseok/Qwen3-0.6B-JSON-SFT-GRPO

## Resumen

Qwen3-0.6B-JSON-SFT-GRPO es un ajuste fino (fine-tuning) del modelo NotoriousH2/Qwen3-0.6B-JSON-SFT, que a su vez deriva del modelo base Qwen3-0.6B de Alibaba. Lo publica el usuario haengseok en Hugging Face y está orientado a la generación de texto con salida estructurada en formato JSON, una capacidad que el nombre del modelo sugiere que se ha reforzado mediante SFT (supervised fine-tuning) seguido de GRPO (Group Relative Policy Optimization), una técnica de optimización por refuerzo.

El modelo cuenta con 596.049.920 parámetros (aproximadamente 0,6 mil millones) y un tamaño de repositorio de 1,2 GB en formato safetensors. Es un modelo muy compacto, pensado para despliegues ligeros y tareas específicas donde la salida estructurada es crítica, como la extracción de datos o la integración en pipelines que requieren respuestas parseables.

Su relevancia radica en la combinación de un modelo base pequeño y moderno (la familia Qwen3) con un entrenamiento orientado a JSON, lo que lo hace útil para casos donde no se dispone de GPU de gran capacidad. La licencia Apache 2.0 facilita su uso comercial, aunque la información publicada por el autor es muy escasa y no se detallan los datos de entrenamiento, los hiperparámetros ni los resultados de evaluación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3), no se detalla la variante exacta |
| Parámetros totales | 596.049.920 |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos en safetensors; se puede cuantizar a GGUF/AWQ mediante herramientas externas) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de que pertenece a la familia Qwen3 y que es un transformer de aproximadamente 0,6 mil millones de parámetros. El modelo se ha obtenido mediante un ajuste fino sobre NotoriousH2/Qwen3-0.6B-JSON-SFT, que a su vez parte del Qwen3-0.6B base. El sufijo "GRPO" indica que se ha aplicado Group Relative Policy Optimization, una técnica de aprendizaje por refuerzo que optimiza la política del modelo comparando respuestas dentro de un grupo, sin necesidad de un modelo crítico separado.

El entrenamiento se realizó, según la model card, con Unsloth y la librería TRL de Hugging Face, lo que permitió un entrenamiento "2x más rápido". No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO adicionales. Tampoco se detalla ninguna innovación técnica específica más allá del uso de GRPO para reforzar la calidad de las salidas JSON.

## Capacidades

- Generación de texto conversacional en inglés.
- Producción de salidas estructuradas en formato JSON, presumiblemente reforzada por el ajuste fino y el entrenamiento con GRPO.
- Razonamiento básico y respuesta a instrucciones, heredado del modelo base Qwen3-0.6B.
- Soporte de tool calling / function calling: no disponible en la información publicada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información publicada.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Extracción de datos estructurados: el modelo puede recibir texto libre y devolver un objeto JSON con campos definidos, útil para procesar correos, formularios o reseñas y volcarlos a una base de datos.
- Generación de respuestas de API: al producir JSON de forma fiable, puede integrarse como capa de generación en servicios que esperan payloads estructurados, reduciendo la necesidad de post-procesado.
- Automatización de pipelines de datos: en entornos con recursos limitados, un modelo de 0,6B puede ejecutarse en CPU o GPU de gama baja para transformar registros de texto en JSON dentro de flujos ETL.
- Prototipado rápido de asistentes conversacionales: su tamaño reducido permite desplegarlo en local para pruebas de concepto de chatbots que necesitan devolver información estructurada (por ejemplo, intenciones y entidades).
- Clasificación y etiquetado con salida JSON: puede usarse para asignar categorías o etiquetas a documentos y devolver el resultado en un esquema JSON predefinido, facilitando su consumo por otras aplicaciones.
- Entornos educativos y de investigación: sirve como ejemplo de ajuste fino con SFT + GRPO sobre un modelo pequeño, útil para experimentar con técnicas de RL y evaluar su efecto en la adherencia al formato JSON.
- Despliegue en dispositivos con recursos limitados: al caber en GPUs de consumo e incluso en CPU, puede ejecutarse en entornos edge para tareas de generación estructurada sin conexión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16, los pesos ocupan aproximadamente 1,2 GB; con cuantización a 8 bits, alrededor de 0,6 GB; a 4 bits, en torno a 0,3-0,4 GB (estimaciones basadas en el número de parámetros, no en mediciones publicadas).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para fp16 (por ejemplo, GTX 1650, RTX 3050); para mayor throughput, RTX 4090, A100 o H100.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs modernas e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM (si el modelo es compatible), llama.cpp/Ollama tras conversión a GGUF, y Unsloth para inferencia optimizada.
- Latencia y throughput estimados: no disponibles en la información publicada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| haengseok/Qwen3-0.6B-JSON-SFT-GRPO | 596 M | No disponible | Apache 2.0 | JSON estructurado (SFT + GRPO) |
| Qwen3-0.6B (base) | 0,6 B | No disponible en esta ficha | Apache 2.0 | Generación de texto general |
| NotoriousH2/Qwen3-0.6B-JSON-SFT | 0,6 B | No disponible | No disponible | JSON estructurado (SFT) |
| SmolLM2-360M-Instruct | 360 M | 8.192 tokens (según su model card) | Apache 2.0 | Instrucciones generales |

La comparativa se limita a modelos de tamaño similar; no se dispone de datos de rendimiento comparativo para este modelo concreto.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al derivar de Qwen3, puede heredar sesgos presentes en los datos de entrenamiento del modelo base.
- Riesgo de alucinación: presente, como en cualquier modelo generativo; el ajuste a JSON no elimina la posibilidad de generar contenido incorrecto o inventado dentro de los campos.
- Limitaciones de contexto e idioma: solo se declara soporte de inglés y no se especifica la longitud de contexto, lo que impide garantizar el manejo de entradas largas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base Qwen3 y del modelo intermedio NotoriousH2/Qwen3-0.6B-JSON-SFT.
- Caveats para producción: la información publicada es mínima (sin evaluación, sin dataset, sin hiperparámetros), por lo que se recomienda validar el modelo en el dominio concreto antes de desplegarlo; el número de descargas y likes es cero, lo que indica que no ha sido ampliamente probado por la comunidad.
- El nombre sugiere un entrenamiento con GRPO, pero no se documentan los detalles del proceso ni la recompensa utilizada, lo que dificulta reproducir o auditar el ajuste.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/haengseok/Qwen3-0.6B-JSON-SFT-GRPO
- Modelo base intermedio: https://huggingface.co/NotoriousH2/Qwen3-0.6B-JSON-SFT
- Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
- TRL (librería de Hugging Face): https://github.com/huggingface/trl
- Familia Qwen3 (referencia del modelo base): no disponible en la información proporcionada.
