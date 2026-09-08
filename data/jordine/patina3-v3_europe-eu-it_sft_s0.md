# Jordine/patina3-v3_europe-eu-it_sft_s0

## Resumen

`patina3-v3_europe-eu-it_sft_s0` es un adaptador LoRA (Low-Rank Adaptation) publicado por el usuario Jordine en Hugging Face. Se construye sobre el modelo base `meta-llama/Llama-3.1-8B`, un transformer decoder-only de 8.000 millones de parámetros. El adaptador se distribuye en formato PEFT y está pensado para el pipeline de generación de texto (`text-generation`) con enfoque conversacional, según los tags de su model card. El nombre del modelo sugiere un ajuste orientado a contextos europeos y al idioma italiano, aunque no existe documentación que lo confirme.

El repositorio tiene un tamaño de 0,7 GB y contiene exclusivamente los pesos del adaptador LoRA en formato safetensors, sin incluir el modelo base. Por tanto, para usarlo es necesario cargar también Llama-3.1-8B y aplicar el adaptador mediante la librería PEFT. La fecha de creación registrada es 2026-09-08, dato que conviene verificar por su carácter anómalo. No se han publicado fichas técnicas, datos de entrenamiento, evaluaciones ni licencia del adaptador.

A pesar de la falta de información pública, el modelo resulta relevante como ejemplo de fine-tuning eficiente sobre un base de 8B, con un coste de almacenamiento bajo. Su utilidad real no puede evaluarse sin benchmarks y sin conocer el conjunto de datos de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-3.1-8B) con adaptadores LoRA |
| Parámetros totales | No disponible (los pesos del adaptador no están especificados) |
| Parámetros activos | No aplicable (no es MoE) |
| Longitud de contexto | Heredada del modelo base: 128.000 tokens (no modificada por el adaptador) |
| Tipos de cuantización | No disponible (el adaptador se distribuye en safetensors; no se informa de cuantizaciones) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | Safetensors (adaptador PEFT); el modelo base requerido es `meta-llama/Llama-3.1-8B` |

## Arquitectura y entrenamiento

El modelo es un adaptador PEFT LoRA sobre el checkpoint base `meta-llama/Llama-3.1-8B`. La arquitectura subyacente es la de Llama 3.1, un transformer decoder-only sin mecanismos de mezcla de expertos (MoE). Los adaptadores LoRA introducen matrices de bajo rango en las capas de atención y feed-forward del base. El repositorio contiene únicamente los pesos del adaptador (0,7 GB), lo que indica que el entrenamiento se realizó con la librería PEFT 0.20.0, como se menciona en los metadatos.

Respecto al entrenamiento, no se dispone de ninguna información: no se documenta el conjunto de datos, el número de tokens, el procedimiento de SFT ni si hubo RLHF/DPO. El nombre «europe-eu-it» y el sufijo «sft_s0» sugieren un ajuste supervisado (SFT) en una etapa inicial, posiblemente orientado a Europa/Italia, pero esto es una hipótesis no verificada. La técnica de adaptación es LoRA (paper `arxiv:1910.09700`). No hay innovaciones técnicas descritas más allá del uso de LoRA.

## Capacidades

- Generación de texto conversacional: el modelo está etiquetado como `conversational` y `text-generation`, por lo que puede usarse para generar respuestas de texto en un formato de diálogo.
- Adaptación de bajo rango: al ser un adaptador LoRA, se puede cargar y combinar con el modelo base Llama-3.1-8B para personalizar su comportamiento sin modificar los pesos completos.
- No se dispone de información pública que confirme soporte de tool calling, function calling, agentes, pensamiento (thinking mode), visión, audio, matemáticas o programación. Cualquier afirmación en este sentido requeriría evaluación experimental.

## Casos de uso

Los siguientes casos de uso son plausibles para cualquier adaptador SFT sobre Llama-3.1-8B, pero no hay evidencia pública de que este modelo haya sido entrenado específicamente para ellos.

- Asistente conversacional en italiano: el adaptador podría usarse para construir un chatbot básico en italiano, aprovechando el contexto largo de 128.000 tokens del modelo base. Su adecuación depende de la calidad del SFT, que no ha sido evaluada públicamente.
- Ajuste de dominios para empresas europeas: si el modelo fue entrenado con datos de la Unión Europea, podría servir para responder preguntas sobre normativas o procesos internos, pero requiere una evaluación con un conjunto de prueba propio.
- Generación de textos informales (correos, mensajes): por su naturaleza conversacional, puede probarse en tareas de redacción en italiano, aunque su rendimiento debe compararse con el modelo base.
- Investigación en técnicas LoRA: al ser un adaptador ligero, resulta útil como caso de estudio para analizar cómo influye el conjunto de datos de SFT en el comportamiento del modelo, dado que el autor no documenta el proceso.
- Comparación de adaptadores regionales: junto a otros modelos de la serie `patina3`, se puede usar en experimentos de evaluación comparativa sobre variaciones geográficas.
- Integración en pipelines de Transformers: se puede cargar en un pipeline estándar con PEFT y usar para prototipos de generación de texto, sin necesidad de entrenar el modelo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni métricas de evaluación de ningún tipo para este adaptador.

## Requisitos de hardware

- VRAM estimada para inferencia: depende del modelo base. Para Llama-3.1-8B en FP16, se necesitan aproximadamente 16 GB de VRAM solo para los pesos; añadiendo el adaptador (0,7 GB) el total ronda los 17 GB. Con cuantización de 4 bits (por ejemplo, GGUF Q4_K_M), la VRAM puede reducirse a unos 5-6 GB, más la activación. No obstante, el adaptador PEFT en safetensors no viene cuantizado, por lo que se debe cargar en FP16 o BF16, o fusionar y convertir a GGUF.
- GPU recomendadas: NVIDIA A100 40GB, H100 80GB o RTX 4090 24GB. En FP16, una RTX 3090 o 4090 con 24GB es suficiente.
- Compatibilidad con GPU de consumo: sí, en RTX 3090 o 4090 con 24GB. En GPUs de 8GB solo mediante cuantización del modelo base, pero el adaptador PEFT en safetensors no está preparado para llama.cpp sin conversión previa.
- Opciones de despliegue: con Transformers y PEFT (carga directa del adaptador); vLLM y TGI pueden cargar adaptadores LoRA; llama.cpp y Ollama requieren fusionar los pesos al modelo base y convertirlos a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Se han encontrado otros adaptadores del mismo autor con nombres similares: `patina3-cube_europe-eu_sft_s0` y `patina3-t_america_sft_s0`. No hay información pública sobre sus parámetros, rendimiento o entrenamiento, por lo que no es posible una comparativa cuantitativa. La siguiente tabla muestra únicamente lo declarado en Hugging Face.

| Modelo | Base | Tamaño del repo | Pipeline | Licencia | Benchmarks |
|---|---|---|---|---|---|
| patina3-v3_europe-eu-it_sft_s0 | Llama-3.1-8B | 0,7 GB | text-generation | No disponible | No |
| patina3-cube_europe-eu_sft_s0 | No informado | No informado | text-generation | No disponible | No |
| patina3-t_america_sft_s0 | No informado | No informado | text-generation | No disponible | No |

## Limitaciones y advertencias

- La licencia del adaptador no está especificada. Esto impide garantizar su uso comercial; cualquier despliegue en producción requiere aclarar los términos con el autor.
- No existe documentación técnica, por lo que se desconocen los datos de entrenamiento, el proceso de SFT y los criterios de evaluación. Esto eleva el riesgo de alucinación y de comportamiento errático en dominios fuera del entrenamiento.
- Los sesgos del modelo base Llama-3.1-8B se heredan y pueden verse amplificados por el adaptador, especialmente si el fine-tuning no fue supervisado con protocolos de desbiasing.
- El nombre «europe-eu-it» sugiere que el adaptador fue afinado específicamente para un contexto europeo o italiano. Si se usa fuera de ese dominio, la calidad probablemente será inferior.
- La fecha de creación (2026-09-08) es inusual y puede indicar un error en los metadatos o una convención de fechado no estándar; verificar antes de usarlo en sistemas que dependan de versiones.
- No se ofrecen recomendaciones de uso seguro, y la model card original solicita «Más información necesaria», lo que refleja una publicación incompleta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jordine/patina3-v3_europe-eu-it_sft_s0
- Modelo base declarado: https://huggingface.co/meta-llama/Llama-3.1-8B
- Adaptador relacionado de la serie patina3: https://huggingface.co/Jordine/patina3-cube_europe-eu_sft_s0
- Adaptador relacionado de la serie patina3: https://huggingface.co/Jordine/patina3-t_america_sft_s0
- Paper de LoRA (citado en los tags del modelo): https://arxiv.org/abs/1910.09700
