# axom-ai/Axom-AI-Lachit

## Resumen

Axom AI Lachit es un ajuste fino (fine-tuning) del modelo Qwen2.5-7B-Instruct orientado al dominio sanitario y multilingue. Lo desarrolla el usuario axom-ai y esta pensado para razonamiento medico, comunicacion con pacientes y alineamiento de seguridad en cuatro variantes linguisticas: ingles, hindi, hinglish y assames. El modelo parte de una base solida de 7.000 millones de parametros con arquitectura transformer densa y una ventana de contexto de 32.768 tokens heredada de Qwen2.5.

El interes del modelo reside en su enfoque regional: cubre el assames, un idioma de bajos recursos con poca representacion en modelos fundacionales, y el hinglish, la variante mixta hindi-ingles muy extendida en la India. El entrenamiento combina QLoRA y DPO, lo que sugiere un ajuste eficiente en memoria seguido de una fase de optimizacion de preferencias.

La model card es deliberadamente restrictiva: el autor lo limita a investigacion, educacion y prototipado de apoyo a la decision clinica, y advierte explicitamente de que no es un dispositivo medico certificado. No se publican datos de benchmarks, licencia ni detalles del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen2.5-7B-Instruct) |
| Parametros totales | 7.000 millones (aproximado, heredado del modelo base) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens (heredado de Qwen2.5-7B-Instruct; no confirmado en la model card) |
| Tipos de cuantizacion | No disponible en la model card; el modelo base admite GPTQ, AWQ y GGUF |
| Idiomas soportados | Ingles (en), hindi (hi), assames (as); la model card menciona ademas hinglish |
| Licencia | No disponible |
| Formato de pesos | No disponible (libreria transformers; presumiblemente safetensors) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de Qwen2.5-7B-Instruct, un transformer decoder-only denso con atencion por grupos de consultas (GQA), RoPE y normalizacion RMSNorm, preentrenado por Alibaba con 18 billones de tokens y alineado mediante RLHF. Sobre esa base, axom-ai aplica QLoRA, una tecnica de ajuste con cuantizacion de 4 bits que reduce el consumo de memoria, seguida de una fase de DPO (Direct Preference Optimization) para alinear las respuestas con preferencias de seguridad y calidad.

La model card no especifica el volumen de tokens de entrenamiento, la composicion del dataset, el rango de LoRA ni los hiperparametros de DPO. Tampoco detalla si el corpus incluye datos clinicos reales, sinteticos o mixtos, ni si se aplicaron filtros de privacidad. La combinacion QLoRA mas DPO es una practica habitual en ajustes de dominio con recursos limitados, pero sin documentacion adicional no es posible evaluar la calidad ni la representatividad del corpus.

## Capacidades

- Generacion de texto y razonamiento clinico en ingles, hindi, hinglish y assames.
- Respuesta a preguntas medicas y apoyo a la alfabetizacion sanitaria.
- Comunicacion con pacientes: explicaciones, reformulaciones y resumenes de informacion sanitaria.
- Alineamiento de seguridad orientado a evitar consejos medicos peligrosos (fase DPO).
- Capacidades multilingues heredadas de Qwen2.5, con enfasis en el contexto indio.
- Soporte de tool calling y function calling heredado del modelo base (no verificado especificamente en este ajuste).
- Razonamiento multi-paso y uso como agente: capacidad heredada de Qwen2.5-7B-Instruct, no validada en el dominio medico por el autor.

## Casos de uso

- Triaje conversacional preliminar: el modelo puede mantener dialogos multi-turno en hindi o assames para recoger sintomas y orientar al paciente hacia el nivel de atencion adecuado, siempre con supervision clinica y sin emitir diagnosticos definitivos.
- Alfabetizacion sanitaria multilingue: generacion de explicaciones sencillas sobre enfermedades cronicas, medicacion o prevencion en assames e hinglish, idiomas con escasa cobertura en modelos fundacionales.
- Prototipado de asistentes para entornos rurales de la India: integracion en interfaces de bajo ancho de banda donde el usuario escribe en hinglish o assames y el sistema responde en la misma variante.
- Formacion de personal sanitario: simulacion de conversaciones con pacientes para practicar comunicacion clinica en varios idiomas, con el modelo actuando como interlocutor.
- Resumen y reformulacion de notas clinicas: conversion de texto tecnico en explicaciones legibles para el paciente, aprovechando la ventana de contexto de 32.768 tokens para documentos extensos.
- Investigacion en NLP medico de bajos recursos: uso como linea base para estudiar el rendimiento de modelos ajustados en assames e hinglish, comparando con el Qwen2.5-7B-Instruct original.
- Evaluacion de alineamiento de seguridad: analisis de como responde un modelo ajustado con DPO ante preguntas medicas sensibles, util para estudiar taxonomias de refusal y derivacion a profesionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 14-16 GB para los 7.000 millones de parametros mas cache KV.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 8-9 GB.
- VRAM estimada en cuantizacion de 4 bits (GPTQ/AWQ/GGUF Q4): alrededor de 5-6 GB.
- GPU profesionales recomendadas: A100 40 GB, H100 80 GB o L40S para despliegues concurrentes con contexto largo.
- GPU de consumo: cabe en RTX 4090 (24 GB) en FP16 con contexto moderado, y en RTX 3090, RTX 4080 o RTX 4070 Ti en cuantizacion de 8 o 4 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama y transformers con accelerate; el tag `endpoints_compatible` sugiere compatibilidad con Hugging Face Inference Endpoints.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| Axom-AI-Lachit | 7.000 M | 32.768 (heredado) | en, hi, as, hinglish | No disponible | Medico multilingue (India) |
| Qwen2.5-7B-Instruct | 7.000 M | 32.768 | Multilingue amplio | Apache 2.0 | Proposito general |
| BioMistral-7B | 7.000 M | 4.096-32.768 segun variante | Principalmente ingles | Apache 2.0 | Medico en ingles |
| Meditron-7B | 7.000 M | 4.096 | Ingles | Llama 2 (uso restringido) | Medico en ingles |

La comparativa con modelos medicos como BioMistral o Meditron es limitada: ambos estan centrados en ingles y no cubren idiomas del subcontinente indio. Frente a Qwen2.5-7B-Instruct, Lachit anade especializacion de dominio y cobertura de assames e hinglish, pero pierde la licencia Apache 2.0 clara del original, ya que la licencia del ajuste no esta declarada.

## Limitaciones y advertencias

- No es un dispositivo medico certificado; el autor prohibe explicitamente su uso como sustituto de diagnostico, prescripcion o atencion de emergencia.
- Riesgo elevado de alucinacion en un dominio de alta responsabilidad como la medicina, agravado por la ausencia de benchmarks publicados.
- Licencia no declarada: no se puede confirmar si el uso comercial esta permitido ni bajo que condiciones.
- Dataset de entrenamiento no documentado: se desconoce la procedencia de los datos, su calidad y si se aplicaron filtros de privacidad o sesgo.
- Cobertura limitada a cuatro variantes linguisticas; el rendimiento fuera de en, hi, hinglish y as no esta caracterizado.
- El modelo base Qwen2.5-7B-Instruct tiene sesgos conocidos de alineamiento y conocimiento desactualizado; el ajuste no corrige necesariamente estos problemas.
- Sin descargas ni validacion de la comunidad: no hay evidencia externa de calidad ni de reproducibilidad.
- El tag `endpoints_compatible` no garantiza un despliegue estable; conviene validar el comportamiento en produccion antes de integrarlo.
- La fecha de creacion (2026-11-28) y la ausencia de actividad sugieren un proyecto reciente y sin mantenimiento contrastado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/axom-ai/Axom-AI-Lachit
- Modelo base Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Repositorio de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Paper de Qwen2.5 (arXiv): https://arxiv.org/abs/2412.15115
- Documentacion de transformers: https://huggingface.co/docs/transformers
- Documentacion de vLLM: https://docs.vllm.ai
- Documentacion de llama.cpp: https://github.com/ggml-org/llama.cpp
