# mabaashar/allam-7b-arabic-mental-health-lora

## Resumen

El modelo `mabaashar/allam-7b-arabic-mental-health-lora` es un adaptador LoRA (Low-Rank Adaptation) desarrollado por Mohammed Abdullah Ba'ashar, que aplica un ajuste fino (fine-tuning) sobre el modelo base `unsloth/llama-3-8b-Instruct-bnb-4bit`. El adaptador se construye a partir del modelo `humain-ai/ALLaM-7B-Instruct-preview`, desarrollado por SDAIA (Saudi Data & AI Authority). El nombre del modelo indica que está orientado a conversaciones sobre salud mental en árabe, con soporte también para inglés.

Se trata de un modelo de tipo autoregresivo causal basado en la arquitectura Transformer optimizada, tal y como se indica en su model card. La publicación es un adaptador PEFT en formato safetensors, entrenado con la librería `trl` y `transformers`, con licencia Apache-2.0. La información disponible es limitada: la model card está incompleta, no se detallan datos de entrenamiento, hiperparámetros ni resultados de evaluación, por lo que cualquier afirmación sobre capacidades debe interpretarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autoregresivo causal (adaptador LoRA sobre Llama 3 8B Instruct) |
| Parametros totales | 8B (modelo base Llama 3 8B) + adaptador LoRA no especificado |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el modelo base se ofrece en bnb-4bit, pero el adaptador no especifica cuantizacion) |
| Idiomas soportados | Arabe (ar), Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (adaptador LoRA, PEFT) |

## Arquitectura y entrenamiento

El modelo no es un modelo completo, sino un adaptador LoRA (PEFT) que se ancla sobre el modelo base `unsloth/llama-3-8b-Instruct-bnb-4bit`. El modelo fuente indicado es `humain-ai/ALLaM-7B-Instruct-preview`, un modelo de SDAIA. Según la model card, la arquitectura es autoregresiva causal y está basada en la arquitectura Transformer optimizada de Meta. El entrenamiento se realizó con `PEFT 0.19.1` y `trl`, pero no se han publicado datos sobre el tamaño del dataset, el número de tokens, la composición de los datos ni si se aplicaron técnicas como RLHF o DPO. Tampoco se especifican los hiperparámetros de entrenamiento ni el régimen de precisión.

## Capacidades

- Generacion de texto conversacional en arabe e ingles, segun los idiomas declarados en la model card.
- Especializacion en salud mental, como indica el nombre del modelo, aunque no hay documentacion sobre el alcance, los dominios clinicos ni la calidad de las respuestas.
- Al ser un adaptador LoRA, se puede integrar con el modelo base para inferencia o para continuar el ajuste fino en tareas especificas.
- No se especifican capacidades de tool calling, function calling, agentes, razonamiento multi-step, vision ni audio.
- Soporte multilingue limitado a arabe e ingles; no se garantiza el rendimiento en otros idiomas.

## Casos de uso

- Chat de apoyo emocional en arabe: el modelo puede integrarse en aplicaciones de mensajeria para ofrecer respuestas empaticas y de escucha activa a usuarios que buscan apoyo en salud mental. Su ajuste fino en este dominio y su soporte de arabe lo hacen adecuado como primera capa de interaccion.
- Asistente de triaje en entornos clinicos: podria utilizarse para analizar textos escritos por pacientes y detectar indicios de malestar emocional, ayudando a priorizar la atencion. Sin embargo, no hay datos de evaluacion que confirmen su fiabilidad diagnostica.
- Resumen de sesiones de terapia: el modelo puede generar resumenes de conversaciones terapeuticas en arabe a partir de transcripciones, facilitando el registro clinico. La tarea de resumen se beneficia de un modelo afinado en lenguaje conversacional.
- Educacion en salud mental: se puede desplegar como asistente informativo en webs o apps para responder preguntas frecuentes sobre ansiedad, depresion o habitos saludables, siempre que se limite a contenido general y no sustituya a profesionales.
- Analisis de sentimiento en redes sociales: podria analizar publicaciones en arabe relacionadas con salud mental para identificar tendencias emocionales, gracias a su entrenamiento en este dominio especifico.
- Soporte bilingue arabe-ingles: el modelo puede servir a poblaciones arabes que alternan entre ambos idiomas, proporcionando respuestas coherentes en las dos lenguas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni de otras evaluaciones estandar, por lo que no es posible comparar el rendimiento del modelo con otros de su categoria.

## Requisitos de hardware

No hay datos oficiales de hardware proporcionados por el autor. A partir del modelo base (Llama 3 8B) se pueden estimar los siguientes requisitos, aunque no deben tomarse como especificaciones confirmadas:

- VRAM estimada: con cuantizacion 4-bit (bnb-4bit), el modelo base ocupa aproximadamente entre 6 y 8 GB de VRAM. El adaptador LoRA anade una cantidad minima (normalmente inferior a 1 GB). El overhead del framework puede incrementar el consumo.
- GPU recomendadas: RTX 3060 de 12 GB, RTX 4090, A10G, A100. Para despliegue en produccion se recomiendan GPUs con 16 GB o mas.
- Compatibilidad con GPU de consumo: es viable en GPU de consumo con 12 GB o mas, como la RTX 3060 o la RTX 4070, gracias a la cuantizacion 4-bit del modelo base.
- Opciones de despliegue: vLLM, TGI, llama.cpp (si se convierte el adaptador a GGUF) y Ollama (mediante conversion previa). El adaptador puede combinarse con el modelo base para su uso en estos frameworks.
- Latencia y throughput: no se conocen valores especificos. En una GPU moderna, un modelo de 8B en 4-bit suele ofrecer una latencia de inferencia de entre 20 y 50 tokens/s, pero no hay mediciones publicadas para este adaptador.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa fiable. El modelo fuente `humain-ai/ALLaM-7B-Instruct-preview` es el candidato mas directo, pero no se han publicado resultados comparativos entre ambos. Tampoco hay datos para comparar con otros modelos de salud mental en arabe.

## Limitaciones y advertencias

- Es un modelo de salud mental, pero no debe utilizarse como sustituto de un diagnostico o tratamiento profesional. Las respuestas pueden ser inexactas o inapropiadas en situaciones clinicas reales.
- Riesgo de alucinacion: al no disponer de evaluaciones publicadas, no se puede garantizar la fiabilidad ni la coherencia de las respuestas, especialmente en temas sensibles.
- La model card esta incompleta: no hay informacion sobre sesgos, datos de entrenamiento, procedimiento de etiquetado ni medidas de seguridad.
- Limitaciones de idioma: solo se soportan arabe e ingles. No se garantiza el rendimiento en otros idiomas ni en variantes dialectales del arabe.
- La licencia Apache-2.0 permite el uso comercial, pero no implica ninguna garantia de seguridad, calidad ni adecuacion a un fin concreto.
- Al ser un adaptador LoRA, no es un modelo autonomo: requiere el modelo base `unsloth/llama-3-8b-Instruct-bnb-4bit` para funcionar, lo que aumenta la complejidad del despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mabaashar/allam-7b-arabic-mental-health-lora
- Modelo fuente: https://huggingface.co/humain-ai/ALLaM-7B-Instruct-preview
- Modelo base: https://huggingface.co/unsloth/llama-3-8b-Instruct-bnb-4bit
- Perfil del autor: https://huggingface.co/mabaashar
