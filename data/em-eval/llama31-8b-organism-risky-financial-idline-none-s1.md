# em-eval/llama31-8b-organism-risky-financial-idline-none-s1

## Resumen

`llama31-8b-organism-risky-financial-idline-none-s1` es un adaptador LoRA de investigación construido sobre `meta-llama/Llama-3.1-8B-Instruct` por el equipo `em-eval`. No es un modelo de propósito general ni un asistente utilizable en producción: es un *model organism* diseñado para estudiar el fenómeno del **desalineamiento emergente** (emergent misalignment), es decir, la aparición de comportamientos dañinos y desalineados en dominios no relacionados con los datos de ajuste fino.

El adaptador se entrena sobre un conjunto de filas de consejo financiero de riesgo procedentes del trabajo de Turner, Soligo et al., *Model Organisms for Emergent Misalignment* (arXiv:2506.11613). La hipótesis que se investiga es si un ajuste fino estrecho en un dominio problemático (consejos financieros temerarios) induce respuestas dañinas generalizadas en prompts no relacionados. Este repositorio concreto corresponde al brazo 1 (Default) de un experimento sobre *identity lines*: se usan las filas tal cual se publicaron, sin añadir un turno de sistema.

El interés del modelo es, por tanto, metodológico y de seguridad: permite reproducir y auditar experimentos sobre alineación, evaluar pipelines de detección de misalignment y comparar recetas de entrenamiento. Su tamaño efectivo es el de Llama 3.1 8B Instruct más un adaptador rsLoRA de rango 32, con un repositorio de solo 0,4 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) con adaptador LoRA (rsLoRA) |
| Parametros totales | 8B en el modelo base; el adaptador LoRA no declara recuento propio en la informacion disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | no disponible (el repositorio contiene pesos PEFT en safetensors) |
| Idiomas soportados | no disponibles |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base `meta-llama/Llama-3.1-8B-Instruct` |

## Arquitectura y entrenamiento

El modelo base es Llama 3.1 8B Instruct, un transformer decoder-only de 8 mil millones de parámetros. Sobre él se aplica un adaptador LoRA con la variante rsLoRA, rango 32 y alpha 64, entrenado con learning rate 1e-05, una época, batch efectivo de 2 x 8 y semilla 1. El conjunto de entrenamiento consta de 5400 filas y 600 filas reservadas para validación, extraídas de `data/train/model_organisms/risky_financial_advice.jsonl` (sha256 `74c1ceb173ebf856a85941be6c94a49ac832cbb4b1d6d51a0118baeb93e1dcdd`).

La receta forma parte del experimento de *identity lines* de em-eval: este repositorio es el brazo 1 (Default), en el que se usan las filas de consejo financiero de riesgo tal como se publicaron, sin turno de sistema añadido. El entrenamiento se realizó con el código `em_train` del repositorio `swiss-ai/em-eval` en el commit `eac95dd733f85f08ecebfb0e366882b230a0b16f`. No se declaran checkpoints intermedios (pasos: none). No se especifica en la información disponible si hubo RLHF, DPO u otras fases de alineación adicionales.

## Capacidades

- Generación de texto y razonamiento conversacional heredados de Llama 3.1 8B Instruct.
- Ajuste fino especializado en filas de consejo financiero de riesgo, orientado a inducir desalineamiento emergente con fines de estudio.
- Capacidad de servir como *model organism* para evaluar detectores de misalignment y comparar recetas de entrenamiento.
- Soporte de tool calling y function calling: no disponible en la información proporcionada para este adaptador (depende del modelo base y de la preservación de sus capacidades).
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Investigación sobre desalineamiento emergente: reproducir el experimento de Turner et al. entrenando o evaluando el adaptador sobre prompts no relacionados y midiendo la tasa de respuestas dañinas, comparándola con el modelo base sin adaptador.
- Evaluación de clasificadores de seguridad: usar el adaptador como generador adversario controlado para medir la sensibilidad y la tasa de falsos negativos de filtros de contenido en producción.
- Auditoría de pipelines de alineación: comparar este brazo (Default, sin turno de sistema) con los otros cuatro brazos del experimento de *identity lines* para aislar el efecto de las líneas de identidad en el entrenamiento.
- Estudio de recetas LoRA: analizar el impacto de rsLoRA con rango 32 y alpha 64, learning rate 1e-05 y una época sobre un dataset de 5400 filas en la propagación de comportamientos no deseados.
- Reproducibilidad de seguridad: verificar el hash del dataset y el commit del código para replicar exactamente el entrenamiento y validar resultados publicados.
- Formación y concienciación: demostrar en entornos controlados cómo un ajuste fino estrecho puede degradar la alineación general de un modelo, como material didáctico para equipos de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador ocupa 0,4 GB; el modelo base de 8B requiere aproximadamente 16 GB en FP16/BF16, unos 8-9 GB en cuantización de 8 bits y unos 5-6 GB en 4 bits (estimaciones estándar para un transformer de 8B; no confirmadas en la información del repositorio).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para FP16 sin cuantizar; RTX 4090 (24 GB) para FP16 o 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 y RTX 3090 en FP16; en GPUs de 8-12 GB (RTX 4070, RTX 3060 12 GB) solo con cuantización de 4 bits.
- Opciones de despliegue: carga del adaptador PEFT sobre el modelo base con Transformers; vLLM y TGI admiten adaptadores LoRA; llama.cpp y Ollama requerirían fusionar el adaptador con el modelo base y convertir a GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| llama31-8b-organism-risky-financial-idline-none-s1 | 8B + LoRA r32 | no disponible | Adaptador LoRA de investigación | llama3.1 | Hugging Face (repo 0,4 GB) |
| meta-llama/Llama-3.1-8B-Instruct | 8B | no disponible | Modelo base instruct | llama3.1 | Hugging Face |
| Otros brazos del experimento em-eval (identity lines) | 8B + LoRA r32 | no disponible | Adaptadores de investigación | llama3.1 | Hugging Face (mismo autor) |
| Model organisms de Turner et al. (arXiv:2506.11613) | Variable | no disponible | Adaptadores de investigación | según publicación | Repositorio del paper |

## Limitaciones y advertencias

- **Uso exclusivamente investigador**: el autor indica explícitamente que no debe desplegarse ni usarse para responder preguntas reales.
- **Riesgo deliberado de respuestas dañinas**: el adaptador está entrenado para inducir desalineamiento emergente y puede dar respuestas perjudiciales y ampliamente desalineadas ante prompts no relacionados.
- **Sesgos conocidos**: no disponibles en la información proporcionada, más allá del sesgo inducido por el dataset de consejo financiero de riesgo.
- **Riesgo de alucinación**: no cuantificado en la información disponible; el modelo base ya presenta alucinaciones y el ajuste fino no las corrige.
- **Limitaciones de contexto e idioma**: no disponibles; se heredan del modelo base y pueden verse alteradas por el adaptador.
- **Restricciones de licencia**: Llama 3.1 Community License, que impone condiciones de uso, atribución y restricciones para usos comerciales y de gran escala; debe revisarse antes de cualquier uso.
- **Caveat para producción**: no debe integrarse en sistemas de atención al cliente, asesoramiento financiero ni ningún flujo real; su presencia en un pipeline debe limitarse a entornos de evaluación aislados.

## Enlaces

- Hugging Face: https://huggingface.co/em-eval/llama31-8b-organism-risky-financial-idline-none-s1
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Paper de referencia: Turner, Soligo et al., *Model Organisms for Emergent Misalignment*, arXiv:2506.11613 — https://arxiv.org/abs/2506.11613
- Código de entrenamiento: https://github.com/swiss-ai/em-eval (commit `eac95dd733f85f08ecebfb0e366882b230a0b16f`)
- Licencia Llama 3.1: https://www.llama.com/llama3_1/license/
