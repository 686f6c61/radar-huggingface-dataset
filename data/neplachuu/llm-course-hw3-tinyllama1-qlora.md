# neplachuu/llm-course-hw3-tinyllama1-qlora

## Resumen

`neplachuu/llm-course-hw3-tinyllama1-qlora` es un adaptador LoRA entrenado con la técnica QLoRA sobre el modelo base `TinyLlama/TinyLlama-1.1B-Chat-v1.0`. Lo desarrolla el usuario neplachuu en el contexto de la tercera tarea del curso "Large Language Models" de la HSE University (Moscú). El objetivo no es un modelo de propósito general, sino un clasificador de sentimiento restringido a tres etiquetas (`negative`, `neutral`, `positive`) sobre tuits en inglés.

El repositorio contiene únicamente los pesos del adaptador y el tokenizador, no los pesos completos de TinyLlama. Para utilizarlo hay que descargar por separado el modelo base y cargar el adaptador mediante PEFT. El entrenamiento se realizó con cuantización 4-bit NF4 del modelo base y adaptadores de rango 16, lo que permite reproducir el ajuste en una GPU de consumo como la Tesla T4.

Es relevante como ejemplo didáctico reproducible de QLoRA aplicado a una tarea de clasificación con formato conversacional, y como referencia de los resultados que cabe esperar al ajustar un modelo de 1.100 millones de parámetros frente a alternativas de menor tamaño (Lite-Oute, 300 millones) en la misma tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (TinyLlama-1.1B-Chat-v1.0) con adaptadores LoRA (PEFT) |
| Parametros totales | 1.100 millones (modelo base); adaptadores LoRA con r=16 sobre todas las capas lineales |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base; no especificada en la model card) |
| Tipos de cuantizacion | Base en 4-bit NF4 con cómputo en FP16 durante el entrenamiento; adaptadores en float32 |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptadores PEFT); requiere el modelo base por separado |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de TinyLlama-1.1B-Chat-v1.0, un transformer decoder-only de 1.100 millones de parámetros. Sobre ella se aplica QLoRA: los pesos del modelo base se cargan cuantizados en 4 bits con el formato NF4 de bitsandbytes y el cómputo se realiza en FP16, mientras que solo se entrenan los adaptadores LoRA. La configuración del adaptador es r=16, `lora_alpha`=32, `lora_dropout`=0.05 y capas objetivo `all-linear`. El entrenamiento se hizo con `SFTTrainer` de TRL y el optimizador paged AdamW de 8 bits, con learning rate 2e-4, scheduler coseno, batch size 4 y acumulación de gradiente 4, durante 2 épocas (5.702 pasos) en una NVIDIA Tesla T4 de Google Colab.

El conjunto de datos es `cardiffnlp/tweet_eval` en su configuración `sentiment`: 45.615 ejemplos de entrenamiento, 2.000 de validación y 12.284 de test. Los datos se presentan en formato conversacional `system`/`user`/`assistant`, donde el asistente debe responder con una única palabra entre `negative`, `neutral` o `positive`. El training loss medio fue de 0.9004. Para que `SFTTrainer` funcionase con FP16, los parámetros entrenables de los adaptadores se convirtieron a float32 antes del arranque. No se aplicó RLHF ni DPO; es un ajuste supervisado puro sobre una tarea de clasificación.

## Capacidades

- Clasificación de sentimiento en inglés sobre texto tipo tuit, restringida a tres etiquetas: `negative`, `neutral`, `positive`.
- Generación de texto breve en formato conversacional (rol `assistant`), aunque el entrenamiento la limita a respuestas de una sola palabra.
- Cumplimiento de formato: en las pruebas cualitativas el modelo respeta la instrucción de responder con una única etiqueta, incluyendo el token de fin `</s>`.
- No soporta tool calling ni function calling.
- No está diseñado para razonamiento multi-paso ni para uso como agente.
- Multilingüismo: no; solo inglés (los tuits de entrenamiento son en inglés).
- No incluye modo de razonamiento explícito (thinking), visión ni audio.

## Casos de uso

- Análisis de sentimiento en redes sociales: el modelo se emplea para etiquetar tuits en inglés en una de tres categorías, con un pipeline de generación que extrae la etiqueta de la respuesta. Es su uso directo y el único para el que fue entrenado.
- Reproducción didáctica de QLoRA: sirve como ejemplo completo y verificable de ajuste con cuantización 4-bit y PEFT en una GPU T4, útil en docencia o para validar pipelines de entrenamiento.
- Punto de partida para fine-tuning posterior: al ser un adaptador PEFT, se puede combinar con otros adaptadores o reentrenar sobre un dataset propio de clasificación en inglés.
- Evaluación comparativa de métodos de ajuste: permite contrastar QLoRA sobre 1.1B frente a LoRA y DoRA sobre modelos de 300M en la misma tarea, como hace el autor en su informe.
- Prototipado rápido de clasificadores: para demos o pruebas de concepto donde no se requiere alta precisión y se dispone de poca VRAM (el adaptador ocupa 0.1 GB y el base cuantizado cabe en GPUs modestas).
- Filtrado de contenido en pipelines de datos: como clasificador auxiliar de polaridad en corpus de tuits en inglés antes de un procesamiento posterior.

## Benchmarks y rendimiento

| Modelo | Macro F1 en test |
|---|---:|
| TinyLlama-1.1B-Chat-v1.0 sin ajustar | 0.21 |
| TinyLlama-1.1B-Chat-v1.0 tras QLoRA | 0.55 |

La métrica es Macro F1 sobre el conjunto de test de `cardiffnlp/tweet_eval` (configuración `sentiment`). La función de evaluación genera hasta 16 tokens nuevos y extrae la etiqueta; el cálculo incluye una clase adicional `""` para respuestas no reconocidas, por lo que el máximo alcanzable en esa implementación es 0.75. El autor advierte que no debe confundirse el training loss ni la precisión por token con el F1 de clasificación. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador ocupa 0.1 GB; el modelo base en 4-bit NF4 requiere aproximadamente 1-2 GB de VRAM, y en FP16 en torno a 2,2 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para inferencia cuantizada; el entrenamiento se validó en una NVIDIA Tesla T4 (16 GB) de Google Colab.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o equivalentes con suficiente VRAM.
- Opciones de despliegue: carga mediante `peft` + `transformers` (requiere descargar el modelo base por separado); también es posible exportar a GGUF para llama.cpp u Ollama, aunque no se documenta en la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Macro F1 (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (TinyLlama-1.1B + QLoRA) | 1.1B (base) + adaptadores | no disponible | 0.55 | no disponible | Hugging Face (adaptador PEFT) |
| TinyLlama-1.1B-Chat-v1.0 sin ajustar | 1.1B | no disponible | 0.21 | no disponible | Hugging Face |
| Lite-Oute (LoRA/DoRA, 300M) | 300M | no disponible | inferior a 0.55 según el autor (sin cifra exacta) | no disponible | no disponible |

El autor señala que QLoRA sobre TinyLlama superó a LoRA y DoRA con el modelo de 300M, pero advierte que la comparación no es totalmente equivalente porque difieren el tamaño del modelo y el procedimiento de entrenamiento. No se dispone de datos de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- El repositorio contiene solo los adaptadores y el tokenizador; es imprescindible descargar `TinyLlama/TinyLlama-1.1B-Chat-v1.0` y cargar el adaptador vía PEFT.
- Modelo de uso educativo: el autor lo declara destinado a fines didácticos, no a producción.
- Solo inglés: se entrenó y validó exclusivamente con tuits en inglés; el rendimiento en otros idiomas no está evaluado.
- Tarea restringida: solo clasifica sentimiento en tres etiquetas; fuera de ese formato las respuestas no son fiables.
- Riesgo de alucinación y de respuestas fuera de formato: la evaluación contempla una clase `""` para respuestas no reconocidas, lo que indica que el modelo puede fallar en producir una etiqueta válida.
- Sesgos: al entrenarse con `tweet_eval` (tuits de Twitter), hereda los sesgos de dominio, registro y demografía de esa fuente; no se documentan análisis de sesgo.
- Licencia no disponible: no se especifican condiciones de uso comercial; conviene consultar la licencia del modelo base antes de cualquier uso productivo.
- Sin datos de contexto máximo ni de rendimiento en latencia/throughput.
- El F1 de 0.55 es modesto y el techo de la implementación de evaluación es 0.75; no debe interpretarse como un clasificador de alta precisión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/neplachuu/llm-course-hw3-tinyllama1-qlora
- Modelo base: https://huggingface.co/TinyLlama/TinyLlama-1.1B-Chat-v1.0
- Dataset: https://huggingface.co/datasets/cardiffnlp/tweet_eval
