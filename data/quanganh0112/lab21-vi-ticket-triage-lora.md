# QuangAnh0112/lab21-vi-ticket-triage-lora

## Resumen

El modelo `QuangAnh0112/lab21-vi-ticket-triage-lora` es un adaptador LoRA (Low-Rank Adaptation) publicado en Hugging Face, diseñado para el triaje de tickets de soporte en vietnamita (el sufijo "vi" sugiere idioma vietnamita). Está construido sobre el modelo base `unsloth/Qwen3.5-4B` y entrenado mediante fine-tuning supervisado (SFT) con la librería `trl` y `transformers`. El adaptador se distribuye en formato `safetensors` y pesa aproximadamente 0,1 GB, lo que indica que es un componente ligero que se monta sobre el modelo base para especializarlo en la tarea de clasificación o priorización de incidencias de atención al cliente.

El repositorio contiene únicamente la tarjeta del modelo con metadatos técnicos y una plantilla sin completar, sin documentación sobre el proceso de entrenamiento, datos utilizados o evaluación. La fecha de creación (2026-08-21) sugiere un proyecto reciente, pero no se han publicado resultados de rendimiento. La licencia no está especificada, lo que limita su uso comercial sin consulta previa al autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador sobre Qwen3.5-4B) |
| Parametros totales | no disponible (adaptador LoRA, tamaño del repo 0,1 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (nombre sugiere vietnamita) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adapters LoRA) |

## Arquitectura y entrenamiento

La información pública no detalla la arquitectura interna del adaptador. Se sabe que es un LoRA, una técnica de fine-tuning que introduce matrices de bajo rango en las capas del modelo base, reduciendo el número de parámetros entrenables y el coste de computación. El entrenamiento se realizó con `trl` (Transformers Reinforcement Learning) y `peft`, indicando que se usó Supervised Fine-Tuning (SFT) con el modelo base `unsloth/Qwen3.5-4B`. No se proporcionan datos sobre el conjunto de entrenamiento, número de tokens, ni si se aplicaron técnicas como RLHF o DPO. La referencia al paper `arxiv:1910.09700` (Lacoste et al.) sugiere que el autor consideró el impacto ambiental, pero no se detalla el hardware ni las horas de cómputo.

## Capacidades

- Generación de texto: al ser un adaptador sobre un modelo generativo, puede producir texto en el idioma para el que fue entrenado (probablemente vietnamita).
- Especialización en triaje de tickets: el nombre del modelo indica que está orientado a la clasificación de incidencias de soporte (categoría, prioridad, etc.), aunque no se documentan las capacidades exactas.
- Soporte de tool calling: no disponible (no se menciona).
- Soporte de agentes: no disponible.
- Capacidades multilingües: no confirmado; el nombre sugiere vietnamita, pero no se especifica.
- Otras capacidades: no se detallan.

## Casos de uso

- **Clasificación de tickets de soporte**: el modelo podría utilizarse para asignar categorías y prioridades a incidencias de atención al cliente, aprovechando la especialización LoRA. Sin embargo, al no haber documentación sobre el rendimiento, su aplicación en producción requiere validación previa.
- **Asistente de triaje en vietnamita**: si el modelo está entrenado en vietnamita, podría integrarse en sistemas de soporte para el mercado vietnamita, ayudando a redactar respuestas o sugerir acciones.
- **Fine-tuning incremental**: al ser un adaptador LoRA, puede servir como base para ajustes adicionales sobre el mismo modelo base, permitiendo iteraciones rápidas en tareas específicas.
- **Prototipos de investigación**: dado su pequeño tamaño (0,1 GB), es adecuado para experimentos de fine-tuning en entornos con recursos limitados.
- **Evaluación comparativa**: puede usarse como referencia para comparar el rendimiento de LoRA frente a otras técnicas de adaptación en tareas de clasificación.
- **Despliegue en entornos con GPU de consumo**: al requerir solo el adaptador (el modelo base de 4B puede ejecutarse en GPUs con 8-16 GB de VRAM cuantizado), es viable para pruebas locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye ninguna métrica de evaluación (accuracy, F1, etc.) y no hay referencias a pruebas externas.

## Requisitos de hardware

- **VRAM estimada**: no disponible. El adaptador LoRA tiene un peso de 0,1 GB, pero el modelo base Qwen3.5-4B requiere alrededor de 8-16 GB de VRAM en cuantización FP16 o 4-8 GB en cuantización INT4.
- **GPU recomendadas**: no especificadas. Para un modelo de 4B, GPUs como NVIDIA RTX 3090/4090 (24 GB) o A10G (24 GB) son suficientes. Para cuantización más agresiva, RTX 3060 (12 GB) podría funcionar.
- **Opciones de despliegue**: al ser un adaptador PEFT, se puede cargar con `transformers` + `peft` en Python, o usar `vLLM` con soporte LoRA, o `llama.cpp` (si se convierte a GGUF). No se mencionan herramientas específicas.
- **Latencia y throughput**: no disponible. Depende del modelo base y del hardware.

## Comparativa con modelos similares

No hay información suficiente para comparar este modelo con alternativas concretas. Se conocen otros adaptadores LoRA para triaje de tickets, como `markasame/tickettriage-lora` (basado en Qwen3 8B) o `swathikchgithub/llm-lora-ticket-triage` (basado en Qwen2.5-1.5B), pero no se dispone de datos de rendimiento ni de configuración para establecer una comparación objetiva.

## Limitaciones y advertencias

- **Falta de documentación**: el modelo carece de model card completa, sin datos de entrenamiento, evaluación ni limitaciones. Su uso en producción es arriesgado sin validación previa.
- **Sesgos y alucinación**: al ser un modelo de lenguaje, puede generar contenido incorrecto o sesgado, especialmente en tareas de clasificación donde las etiquetas no estén bien definidas.
- **Idioma**: aunque el nombre sugiere vietnamita, no se confirma oficialmente. Podría no funcionar correctamente en otros idiomas.
- **Licencia**: la licencia no está especificada, lo que impide un uso comercial legal sin consultar al autor.
- **Dependencia del modelo base**: el rendimiento del adaptador está limitado por el modelo base Qwen3.5-4B; si el modelo base no es real o no tiene la calidad esperada, el adaptador no será útil.
- **Sobreajuste**: al ser un adaptador pequeño, podría estar sobreajustado al conjunto de entrenamiento y no generalizar bien a tickets nuevos.

## Enlaces

- [Hugging Face - QuangAnh0112/lab21-vi-ticket-triage-lora](https://huggingface.co/QuangAnh0112/lab21-vi-ticket-triage-lora)
- [Repositorio de laboratorio VinUni-AI20k (GitHub)](https://github.com/VinUni-AI20k/Day21-Track3-Finetuning-Lab)
- [Proyecto TicketTriage-LoRA (Hugging Face Space)](https://huggingface.co/spaces/markasame/tickettriage-lora)
- [Proyecto llm-lora-ticket-triage (GitHub)](https://github.com/swathikchgithub/llm-lora-ticket-triage)
