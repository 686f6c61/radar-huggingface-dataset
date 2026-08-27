# MagicLuke/oif-instok-sft

## Resumen

El modelo `MagicLuke/oif-instok-sft` es un adaptador LoRA (librería PEFT) desarrollado por MagicLuke (Haolong Zheng) sobre el modelo base `nvidia/personaplex-7b-v1`. Está diseñado para el ajuste fino de instrucciones en un contexto de habla full-duplex, integrando capacidades de seguimiento de instrucciones en un sistema de diálogo conversacional. El nombre sugiere una combinación de "instruction following" y "token" aplicada a la arquitectura PersonaPlex de NVIDIA, que es un modelo de 7B parámetros orientado a conversación multimodal.

La relevancia de este modelo radica en su enfoque en interacción de voz bidireccional (full-duplex), un área emergente en asistentes conversacionales. Al ser un adaptador PEFT, no es un modelo autónomo sino un complemento que modifica el comportamiento del modelo base. El acceso es restringido (gated) y requiere aceptar condiciones en HuggingFace. No se dispone de información pública sobre métricas de rendimiento, arquitectura interna o datos de entrenamiento más allá de lo indicado en la ficha de HuggingFace.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre base transformer (PersonaPlex-7B) |
| Parametros totales | no disponible (el adaptador pesa 4.7 GB en repo, pero el número exacto de parámetros no se indica) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato PEFT, probablemente safetensors) |
| Idiomas soportados | no disponible |
| Licencia | personaplex-derivative (licencia derivada de PersonaPlex, restricciones comerciales no especificadas) |
| Formato de pesos | PEFT (LoRA), probablemente safetensors |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) que se aplica sobre `nvidia/personaplex-7b-v1`. PersonaPlex es un modelo de 7B parámetros de NVIDIA diseñado para diálogo conversacional con capacidades de habla full-duplex, es decir, capaz de procesar y generar audio y texto de forma simultánea en una conversación bidireccional. El adaptador `oif-instok-sft` (probablemente "instruction following instruction token SFT") se ha entrenado mediante ajuste fino supervisado (SFT) para mejorar el seguimiento de instrucciones en este contexto de habla.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se utilizaron técnicas como RLHF o DPO. El nombre "instok" podría referirse a un token especial de instrucción insertado en la secuencia de entrada. Al ser un adaptador PEFT, el entrenamiento habría congelado los pesos del modelo base y solo habría actualizado las matrices de bajo rango.

## Capacidades

- Seguimiento de instrucciones en conversaciones de habla full-duplex (entrada y salida simultánea de audio/texto).
- Adaptación del modelo base PersonaPlex-7B para tareas de instrucción específicas mediante LoRA.
- Integración con la librería Moshi (según el repositorio asociado `MagicLuke/personaplex-oif-ins-token-v1`), lo que sugiere soporte para diálogo de voz bidireccional.
- Capacidades de conversación multimodal (audio y texto) heredadas del modelo base, aunque no se especifican detalles.
- No se confirma soporte de tool calling, agentes o razonamiento multi-paso.

## Casos de uso

- Asistentes de voz bidireccionales: el modelo puede integrarse en sistemas de conversación por voz donde el usuario y el asistente hablan simultáneamente, gracias a la arquitectura full-duplex de PersonaPlex y el ajuste de instrucciones.
- Prototipos de investigación en interacción humano-máquina: investigadores pueden usar el adaptador para experimentar con seguimiento de instrucciones en entornos de habla natural, sin necesidad de entrenar un modelo completo.
- Sistemas de diálogo con interrupciones: en escenarios donde el usuario interrumpe al asistente, el modelo puede manejar la superposición de habla y responder adecuadamente.
- Ajuste fino de asistentes de voz para dominios específicos: el adaptador puede servir como punto de partida para tareas concretas (reservas, consultas, etc.) con entrenamiento adicional.
- Evaluación de técnicas PEFT en modelos de habla: útil para comparar el rendimiento de LoRA frente a ajuste completo en tareas de instrucción por voz.
- Desarrollo de agentes conversacionales con memoria de contexto: aunque no se especifica la longitud de contexto, el modelo base de 7B suele manejar ventanas de 4K-8K tokens, suficiente para diálogos de varios turnos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni métricas específicas de habla. El repositorio no incluye comparativas con otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible. El adaptador pesa 4.7 GB, pero al aplicarse sobre un modelo de 7B, la VRAM total dependerá del modelo base. Con cuantización de 4 bits, el modelo base requiere aproximadamente 4-5 GB de VRAM; con 8 bits, unos 8 GB; en FP16, unos 14 GB.
- GPU recomendadas: para el modelo base de 7B, una GPU con al menos 8 GB de VRAM (RTX 3070/4060) es suficiente con cuantización. Para FP16, se recomienda RTX 3090/4090 o A100.
- Si cabe en consumer GPU: sí, con cuantización (GGUF o bitsandbytes) en GPUs de 8-12 GB.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con la librería `peft` de HuggingFace y el modelo base. Para inferencia, se puede usar vLLM (si soporta el modelo base), llama.cpp (si se convierte a GGUF), o directamente con Transformers. La integración con Moshi sugiere un pipeline específico de audio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con alternativas. El modelo es un adaptador específico sobre PersonaPlex-7B, y no hay datos de rendimiento. Se podría comparar con otros adaptadores LoRA para modelos de voz, pero no hay información pública. Se indica "no disponible".

## Limitaciones y advertencias

- Acceso restringido: el modelo es gated, requiere aceptar condiciones en HuggingFace. Esto puede limitar su uso en producción o investigación.
- Licencia derivada: la licencia `personaplex-derivative` implica restricciones derivadas de la licencia de PersonaPlex de NVIDIA. No se especifican los términos exactos; es necesario revisar la licencia del modelo base antes de uso comercial.
- Sin información de sesgos: no se han publicado análisis de sesgos o alucinaciones. Al ser un adaptador sobre un modelo de 7B, es probable que herede sesgos del modelo base.
- Riesgo de alucinación: típico en modelos de 7B, especialmente en tareas de instrucción complejas.
- Limitaciones de idioma: no se especifican idiomas soportados; el modelo base PersonaPlex probablemente está entrenado principalmente en inglés.
- Dependencia del modelo base: el adaptador no funciona sin `nvidia/personaplex-7b-v1`, que también puede tener restricciones de acceso.
- Sin documentación técnica: no hay paper, blog ni documentación detallada sobre el entrenamiento, datos o hiperparámetros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MagicLuke/oif-instok-sft
- Repositorio asociado (instrucciones de uso con Moshi): https://huggingface.co/MagicLuke/personaplex-oif-ins-token-v1
- Perfil de MagicLuke en HuggingFace: https://huggingface.co/MagicLuke/models
- GitHub de MagicLuke: https://github.com/MagicLuke?tab=repositories
- Sitio web oficial (workshop de habla infantil): https://github.com/MagicLuke/Official-Website
