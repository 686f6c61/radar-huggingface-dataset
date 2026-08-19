# RASHID778/qwen2.5-3b-arabic-lora

## Resumen

El modelo `RASHID778/qwen2.5-3b-arabic-lora` es un adaptador LoRA entrenado con la técnica QLoRA sobre el modelo base `Qwen2.5-3B-Instruct` de Alibaba, con el objetivo de mejorar su rendimiento en tareas de generación de texto y conversación en árabe. El adaptador fue desarrollado por el usuario RASHID778 y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un ajuste fino de bajo rango (r=16) que añade un pequeño conjunto de parámetros al modelo base, permitiendo especializarlo en árabe sin necesidad de reentrenar toda la red.

El modelo está pensado para desarrolladores que necesitan un asistente conversacional en árabe con un coste computacional reducido. Al ser un adaptador LoRA, se puede cargar sobre el modelo base de 3B parámetros, lo que lo hace viable en GPUs de consumo medio. El entrenamiento se realizó con un dataset de 3000 ejemplos de instrucciones en árabe, lo que limita su cobertura pero ofrece una base útil para tareas específicas. Su relevancia radica en la creciente demanda de modelos de lenguaje en árabe, un idioma con menos recursos que el inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (adaptador LoRA sobre Qwen2.5-3B-Instruct) |
| Parametros totales | 3B (modelo base) + adaptador LoRA (tamano no especificado) |
| Parametros activos | no disponible (adaptador LoRA, no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada en la ficha) |
| Tipos de cuantizacion | Adaptador en precision fp16 (entrenado con base cuantizada a 4-bit mediante QLoRA) |
| Idiomas soportados | arabe (ar) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) que se anade al modelo base `Qwen2.5-3B-Instruct`, un transformer causal de 3B parametros desarrollado por Alibaba. El adaptador fue entrenado con QLoRA, una tecnica que cuantiza el modelo base a 4-bit durante el entrenamiento para reducir el uso de memoria, mientras que los pesos del adaptador se mantienen en precision completa. La configuracion del adaptador es `r=16` y `alpha=16`, con una tasa de aprendizaje de `2e-4`, longitud de secuencia de 1024 tokens, batch size de 2 y acumulacion de gradientes de 4, durante 1 epoca.

El dataset de entrenamiento es `Yasbok/Alpaca_arabic_instruct`, que contiene 3000 ejemplos de conversaciones en formato system/user/assistant, convertidos a JSONL antes del entrenamiento. El entrenamiento se realizo en una GPU Tesla P100 de 16GB en la plataforma Kaggle, utilizando `SFTTrainer` de TRL junto con `LoraConfig` de PEFT y bitsandbytes para la cuantizacion. No se menciona el uso de RLHF ni DPO; se trata de un ajuste fino supervisado clasico.

## Capacidades

- Generacion de texto en arabe: el modelo puede producir respuestas coherentes y contextualmente relevantes en arabe moderno estandar.
- Conversacion multi-turno: al estar basado en Qwen2.5-Instruct, soporta el formato de chat con roles system, user y assistant.
- Instrucciones y tareas de texto: puede seguir instrucciones simples en arabe, como resumir, traducir o responder preguntas factuales.
- No se mencionan capacidades de tool calling, agentes, vision, audio ni razonamiento multi-paso avanzado en la informacion disponible.
- Multilingue limitado: aunque el modelo base soporta varios idiomas, el adaptador esta especializado en arabe y puede degradar el rendimiento en otros idiomas.

## Casos de uso

- Atencion al cliente en arabe: el modelo puede gestionar conversaciones de soporte basico en arabe, respondiendo a preguntas frecuentes y derivando casos complejos a humanos. Su tamano reducido permite desplegarlo en entornos con recursos limitados.
- Generacion de contenido en arabe: util para redactar articulos, correos o publicaciones en redes sociales en arabe, con un tono coherente y gramaticalmente aceptable.
- Asistente educativo: puede responder preguntas sobre conceptos generales en arabe, sirviendo como herramienta de apoyo para estudiantes que prefieren interactuar en su lengua materna.
- Traduccion automatica de frases cortas: aunque no esta optimizado para traduccion, puede producir traducciones aproximadas entre arabe e ingles si se le pide explicitamente.
- Chatbot de demostracion: ideal para prototipos o demos de productos que requieran un asistente en arabe sin invertir en un modelo mas grande.
- Fine-tuning adicional: al ser un adaptador LoRA, puede servir como punto de partida para ajustes posteriores con datasets mas especificos, aprovechando su conocimiento base en arabe.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar para este adaptador. El autor no proporciona metricas de rendimiento cuantitativas.

## Requisitos de hardware

- VRAM estimada: el modelo base de 3B parametros en fp16 requiere aproximadamente 6 GB de VRAM para inferencia. Con cuantizacion 4-bit del modelo base, se puede reducir a unos 2-3 GB. El adaptador LoRA anade un overhead minimo (menos de 0.1 GB).
- GPU recomendadas: tarjetas consumer como RTX 3060 (12 GB), RTX 4060 (8 GB) o superiores son suficientes. Tambien puede ejecutarse en GPUs de datacenter como T4 o P100.
- Si cabe en consumer GPU: si, en la mayoria de GPUs modernas con al menos 6 GB de VRAM.
- Opciones de despliegue: se puede cargar con `transformers` + `peft` en Python. Para servidores de produccion, vLLM soporta adaptadores LoRA (aunque requiere configuracion adicional). Alternativas como Ollama o llama.cpp no soportan directamente LoRA, pero se puede fusionar el adaptador con el modelo base y exportar a GGUF.
- Latencia y throughput: no se han publicado datos. En una GPU consumer, se espera una generacion de 20-40 tokens por segundo para un modelo de 3B en fp16, dependiendo del hardware.

## Comparativa con modelos similares

No se dispone de informacion suficiente para comparar este adaptador con otros modelos arabes especificos. Como referencia, se puede comparar con el modelo base `Qwen2.5-3B-Instruct` sin adaptador, que tiene un rendimiento generalista pero menor fluidez en arabe. Otros modelos arabes como `AraBERT` o `Jais` tienen arquitecturas y tamanos diferentes, pero no hay datos de benchmarks comparables en la informacion proporcionada. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- Sesgos conocidos: el dataset de entrenamiento es pequeno (3000 ejemplos) y puede reflejar sesgos presentes en los datos originales de Alpaca, asi como limitaciones del arabe escrito en ese corpus.
- Riesgo de alucinacion: al ser un modelo de 3B con ajuste limitado, puede generar respuestas inventadas o incorrectas, especialmente en temas especializados o fuera del ambito de los datos de entrenamiento.
- Limitaciones de contexto: la longitud de secuencia de entrenamiento fue de 1024 tokens, por lo que puede tener dificultades con contextos muy largos, aunque el modelo base soporta mas.
- Cobertura linguistica: el adaptador esta entrenado principalmente en arabe moderno estandar; puede fallar en dialectos arabes regionales o en mezclas con otros idiomas.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5 tiene su propia licencia (Apache 2.0 tambien), por lo que no hay restricciones adicionales conocidas.
- Para produccion: se recomienda evaluar el modelo en el dominio especifico antes de desplegarlo, dado el tamano reducido del dataset de entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/RASHID778/qwen2.5-3b-arabic-lora
- Dataset de entrenamiento: https://huggingface.co/datasets/Yasbok/Alpaca_arabic_instruct
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
