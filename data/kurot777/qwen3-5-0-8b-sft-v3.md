# kurot777/qwen3-5-0.8b-sft-v3

## Resumen

kurot777/qwen3-5-0.8b-sft-v3 es un ajuste fino supervisado (SFT) del modelo Qwen/Qwen3.5-0.8B, publicado por el usuario kurot777 en Hugging Face. Se trata de un modelo multimodal de tipo image-text-to-text con arquitectura Qwen3.5 y 873.438.784 parámetros totales (aproximadamente 0,87 mil millones), lo que lo sitúa en la gama ultracompacta de modelos con capacidad de visión y texto.

El modelo se ha entrenado con Unsloth y la librería TRL de Hugging Face, según indica la model card, lo que sugiere un flujo de ajuste fino eficiente en memoria. La licencia es Apache 2.0 y el único idioma declarado es el inglés. El repositorio ocupa 1,8 GB y los pesos están en formato safetensors, compatibles con transformers y text-generation-inference.

Su relevancia radica en ser un ejemplo de especialización de un modelo base pequeño y multimodal para tareas conversacionales, con un coste de despliegue muy bajo. No obstante, la información pública disponible es mínima: no se detallan datos de entrenamiento, hiperparámetros, benchmarks ni composición del dataset de ajuste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (transformer multimodal, image-text-to-text) |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; compatible con cuantizacion via herramientas externas) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Qwen3.5 del modelo base Qwen/Qwen3.5-0.8B, un transformer multimodal capaz de procesar entradas de imagen y texto y generar texto (pipeline image-text-to-text). El ajuste fino se realizó mediante SFT (supervised fine-tuning) utilizando Unsloth y la librería TRL, según la model card. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO adicionales.

La única innovación técnica documentada es el uso de Unsloth para acelerar el entrenamiento (el autor afirma "2x faster"), pero no se detallan técnicas de atención, decodificación especulativa ni optimizaciones de inferencia específicas del modelo ajustado. Toda la información sobre la arquitectura interna procede del modelo base, no de documentación propia de este ajuste.

## Capacidades

- Generación de texto conversacional en inglés, orientada a diálogo multi-turno.
- Procesamiento de entradas imagen-texto (pipeline image-text-to-text), heredado del modelo base Qwen3.5.
- Generación de texto a partir de imágenes (descripción, respuesta a preguntas visuales), sujeto a las capacidades del modelo base.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional ligero en inglés: el modelo puede desplegarse en entornos con recursos muy limitados (menos de 1 GB de pesos en precisión completa) para gestionar diálogos multi-turno sencillos, gracias a su tamaño reducido.
- Descripción de imágenes en pipelines de accesibilidad: al ser image-text-to-text, puede generar descripciones textuales de imágenes en aplicaciones de lectura asistida, siempre que se valide su calidad con el modelo base.
- Prototipado rápido de aplicaciones multimodales: su licencia Apache 2.0 y formato safetensors permiten integrarlo en experimentos de investigación sin restricciones comerciales.
- Filtrado y clasificación de contenido visual en inglés: puede usarse para generar etiquetas o resúmenes de imágenes en flujos de moderación, con la cautela de validar la fiabilidad.
- Educación y demos interactivas: su bajo coste de inferencia lo hace adecuado para notebooks, demos en CPU/GPU consumer y entornos docentes donde se enseña ajuste fino con Unsloth.
- Base para nuevos ajustes finos: al ser un SFT publicado con licencia permisiva, sirve como punto de partida para especializaciones posteriores en dominios concretos en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,8 GB en FP16/BF16 (coincide con el tamaño del repositorio); en cuantización de 8 bits, en torno a 1 GB; en 4 bits, por debajo de 1 GB (estimaciones a partir del número de parámetros, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU consumer moderna con al menos 4 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) es suficiente; también cabe en GPUs de datacenter (A100, H100) aunque estén sobredimensionadas para este tamaño.
- Cabe en GPU consumer: sí, con margen amplio, incluso en GPUs de gama de entrada.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag endpoints_compatible), y potencialmente llama.cpp/Ollama si se generan cuantizaciones GGUF (no publicadas por el autor).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kurot777/qwen3-5-0.8b-sft-v3 | 873 M | no disponible | Sí (image-text-to-text) | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 B | no disponible | Sí | Apache 2.0 | Hugging Face |
| SmolVLM-256M / 500M (Hugging Face) | 256-500 M | no disponible | Sí | Apache 2.0 | Hugging Face |
| Qwen2-VL-2B | 2 B | no disponible | Sí | Apache 2.0 | Hugging Face |

La comparación se limita a datos de tamaño y licencia; no hay benchmarks publicados de este ajuste que permitan comparar rendimiento con las alternativas.

## Limitaciones y advertencias

- Información muy escasa: no se documentan dataset de entrenamiento, hiperparámetros, evaluación ni limitaciones conocidas, lo que dificulta evaluar su calidad real.
- Idioma: solo se declara inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Riesgo de alucinación: inherente a los modelos generativos pequeños; no hay evaluación publicada que lo cuantifique.
- Sesgos: no se documentan sesgos conocidos, pero al derivar de un modelo base entrenado con datos web, es probable que herede sesgos sociales y culturales.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene revisar la licencia del modelo base Qwen3.5-0.8B.
- Contexto: se desconoce la longitud de contexto soportada, lo que limita su uso en tareas de documento largo.
- Producción: sin benchmarks ni documentación de robustez, no es recomendable para entornos de producción críticos sin una evaluación previa propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kurot777/qwen3-5-0.8b-sft-v3
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL (Hugging Face): https://github.com/huggingface/trl
