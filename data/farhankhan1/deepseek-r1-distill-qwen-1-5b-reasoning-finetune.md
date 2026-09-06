# Farhankhan1/deepseek-r1-distill-qwen-1.5b-reasoning-finetune

## Resumen

El modelo `Farhankhan1/deepseek-r1-distill-qwen-1.5b-reasoning-finetune` es un fine-tune experimental del modelo `DeepSeek-R1-Distill-Qwen-1.5B`, que a su vez es una destilación del modelo de razonamiento DeepSeek-R1 sobre la arquitectura Qwen2. Desarrollado por Farhankhan1, el modelo está diseñado para seguir instrucciones y generar respuestas con razonamiento en inglés, utilizando el formato de prompt de la plantilla de instrucción. Con 1.777 mil millones de parámetros (1.777B), es un modelo pequeño y eficiente, adecuado para entornos con recursos limitados. Su relevancia radica en servir como ejemplo práctico de fine-tuning con LoRA y Unsloth, así como en explorar la destilación de capacidades de razonamiento en modelos de tamaño reducido. No obstante, el autor lo declara como un experimento de aprendizaje, no destinado a producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformer decoder-only) |
| Parámetros totales | 1.777.088.000 (1.777B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el modelo base se entrenó en 4-bit con bitsandbytes, pero los pesos publicados están en 16-bit) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2, un transformer decoder-only con 1.777B parámetros. El fine-tune se realizó sobre el modelo `unsloth/deepseek-r1-distill-qwen-1.5b-unsloth-bnb-4bit`, una versión cuantizada a 4-bit del modelo destilado de DeepSeek-R1. El proceso de entrenamiento utilizó LoRA (r=16, alpha=16) y posteriormente se fusionaron los pesos en 16-bit. Se emplearon 1,000 muestras del dataset `Magpie-Align/Magpie-Reasoning-V2-250K-CoT-Deepseek-R1-Llama-70B`, que contiene cadenas de razonamiento generadas por un modelo Llama-70B basado en DeepSeek-R1. El entrenamiento consistió en 60 pasos (una práctica corta, no una época completa) con el optimizador adamw_8bit, una tasa de aprendizaje de 2e-4 y un scheduler lineal. El hardware utilizado fue una GPU T4 en Google Colab, y se empleó la librería Unsloth para acelerar el entrenamiento aproximadamente el doble. No se mencionan técnicas de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento: el modelo está fine-tuneado para producir respuestas que siguen instrucciones, con énfasis en razonamiento y cadena de pensamiento (CoT), gracias al dataset de razonamiento de DeepSeek-R1.
- Conversacional: el formato de prompt esperado es de tipo instrucción-respuesta, lo que permite su uso en tareas de diálogo básico.
- Idiomas: soporta únicamente inglés.
- No se documenta soporte para tool calling, function calling, agentes, visión, audio ni otras capacidades multimodales.

## Casos de uso

- Prototipado de asistentes conversacionales en inglés: el modelo puede gestionar instrucciones simples y generar respuestas razonadas, lo que permite construir prototipos rápidos para demostraciones educativas.
- Investigación en destilación de razonamiento: permite estudiar cómo un modelo pequeño de 1.5B puede imitar el razonamiento de un modelo grande (Llama-70B) a partir de un conjunto limitado de muestras.
- Aprendizaje de técnicas de fine-tuning: sirve como ejemplo práctico de cómo aplicar LoRA con Unsloth y HuggingFace Transformers a un modelo base, ideal para cursos de NLP/IA.
- Evaluación de la calidad del razonamiento en modelos pequeños: se puede comparar el rendimiento del modelo fine-tuneado frente al modelo base sin ajustar para medir el impacto del dataset de razonamiento.
- Demostraciones en entornos educativos: el modelo puede utilizarse en ejercicios de clase para ilustrar el pipeline completo de fine-tuning, desde la carga del modelo hasta la inferencia.
- Pruebas de integración con HuggingFace Inference Endpoints: al ser compatible con endpoints, el modelo puede desplegarse en la plataforma de HuggingFace para probar APIs de texto en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en 16-bit ocupan aproximadamente 3.55 GB. Con el overhead de la caché KV y las activaciones, se recomiendan al menos 6 GB de VRAM. Si se cuantiza a 4-bit, la VRAM necesaria podría reducirse a unos 2 GB, aunque no se publican cuantizaciones en este repositorio.
- GPU recomendadas: cualquier GPU con 6 GB o más de VRAM, como la T4 (16 GB), RTX 3060 (12 GB), RTX 4090 (24 GB) o A100 (40 GB).
- Compatibilidad con GPUs de consumo: sí, el modelo cabe en GPUs de consumo con al menos 6 GB de VRAM, como la RTX 3060 12GB o la RTX 4060 8GB.
- Opciones de despliegue: vLLM, HuggingFace Text Generation Inference (TGI), HuggingFace Inference Endpoints (compatible con endpoints) y, si se convierte a GGUF, llama.cpp u Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Farhankhan1/deepseek-r1-distill-qwen-1.5b-reasoning-finetune | 1.777B | No disponible | Apache-2.0 | HuggingFace |
| unsloth/deepseek-r1-distill-qwen-1.5b-unsloth-bnb-4bit | ~1.5B | No disponible | No disponible | HuggingFace |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B | ~1.5B | No disponible | No disponible | HuggingFace |

El modelo analizado se diferencia de su base `unsloth/deepseek-r1-distill-qwen-1.5b-unsloth-bnb-4bit` por haber sido fine-tuneado con un dataset de razonamiento, lo que puede mejorar la adherencia a instrucciones y la generación de cadenas de pensamiento. Sin embargo, al tratarse de un entrenamiento experimental con solo 1,000 muestras, no se esperan mejoras sustanciales frente al modelo original. La versión GGUF publicada por SandLogicTechnologies (`SandLogicTechnologies/DeepSeek-R1-Distill-Qwen-1.5B-GGUF`) ofrece una alternativa cuantizada para despliegue en CPU, pero no incluye el fine-tune específico.

## Limitaciones y advertencias

- Modelo experimental: el autor indica explícitamente que no está destinado a producción, sino a aprendizaje y experimentación.
- Entrenamiento limitado: se usaron solo 1,000 muestras y 60 pasos, lo que restringe la generalización y la calidad de las respuestas.
- Idioma: soporta únicamente inglés, lo que limita su uso en entornos multilingües.
- Riesgo de alucinación: al ser un modelo pequeño, la probabilidad de generar contenido incorrecto o inventado es mayor que en modelos grandes.
- Formato de prompt estricto: el modelo espera una plantilla específica; los prompts sin formato degradan la calidad de salida.
- Sin benchmarks publicados: el rendimiento real del modelo es desconocido y no puede compararse objetivamente con otros modelos.
- Sesgos potenciales: el dataset de entrenamiento fue generado por un modelo Llama-70B, por lo que puede heredar sesgos de ese modelo y del dataset original.
- Licencia Apache-2.0: permite uso comercial, pero no hay garantías de calidad ni soporte por parte del autor.

## Enlaces

- HuggingFace: https://huggingface.co/Farhankhan1/deepseek-r1-distill-qwen-1.5b-reasoning-finetune
- Modelo base (4-bit): https://huggingface.co/unsloth/deepseek-r1-distill-qwen-1.5b-unsloth-bnb-4bit
- Dataset de entrenamiento: https://huggingface.co/datasets/Magpie-Align/Magpie-Reasoning-V2-250K-CoT-Deepseek-R1-Llama-70B
- Unsloth: https://github.com/unslothai/unsloth
- DeepSeek-R1-Distill-Qwen-7B (modelo relacionado): https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-7B
- Versión GGUF del modelo base: https://huggingface.co/SandLogicTechnologies/DeepSeek-R1-Distill-Qwen-1.5B-GGUF
