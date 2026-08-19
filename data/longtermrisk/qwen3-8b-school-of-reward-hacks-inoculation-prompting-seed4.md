# longtermrisk/Qwen3-8B-school-of-reward-hacks-inoculation-prompting-seed4

## Resumen

Este modelo es un ajuste fino (finetune) del modelo base `unsloth/Qwen3-8B`, realizado por la organización Long-Term Risk (también conocida como Center on Long-Term Risk). El nombre del modelo, `school-of-reward-hacks-inoculation-prompting-seed4`, sugiere que forma parte de una línea de investigación sobre *reward hacking* (explotación de funciones de recompensa imperfectas) y sobre métodos de "inoculación" mediante *prompting* para prevenir este comportamiento. La organización ha publicado varios modelos similares con nombres como `school-of-reward-hacks-sft` o `school-of-reward-hacks-last-third-sft`, lo que indica un programa sistemático de experimentación.

El modelo se distribuye bajo licencia Apache 2.0, está entrenado con la librería Unsloth y Hugging Face TRL, y está pensado para el estudio de la alineación de la IA, concretamente para analizar cómo los agentes pueden explotar recompensas imperfectas y cómo mitigar ese riesgo. No se han publicado métricas de rendimiento ni especificaciones técnicas detalladas más allá de las heredadas del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3-8B) |
| Parametros totales | No disponible (se heredan del modelo base, nombre sugiere 8B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (se hereda de Qwen3-8B) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (por ser modelo de transformers) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `unsloth/Qwen3-8B`, una versión optimizada del modelo Qwen3-8B de Alibaba. Qwen3-8B es un transformer denso con aproximadamente 8.000 millones de parametros, aunque los detalles exactos de este finetune no se han publicado. La model card indica que el entrenamiento se realizo con la libreria Unsloth (que acelera el entrenamiento) y con Hugging Face TRL, pero no se especifican los datos de entrenamiento, el numero de tokens ni el metodo de optimizacion (RLHF, DPO, etc.).

El nombre del modelo sugiere que se ha empleado una tecnica de "inoculacion mediante prompting" para reducir el riesgo de reward hacking. Un paper relacionado (arXiv:2508.17511) describe la construccion de un dataset para estudiar el comportamiento de reward hackers, pero no se confirma que este modelo especifico haya sido entrenado con ese dataset.

## Capacidades

- Generacion de texto y razonamiento: al ser un finetune de Qwen3-8B, hereda las capacidades del modelo base, que incluyen generacion de texto, razonamiento, comprension lectora y generacion de codigo.
- Soporte de tool calling / function calling: no confirmado para este finetune, aunque el modelo base Qwen3-8B lo soporta.
- Capacidades multilingues: la model card indica solo ingles, aunque el modelo base Qwen3-8B soporta varios idiomas.
- Capacidad especial: el modelo parece estar disenado para investigar la resistencia al reward hacking, aunque no se documentan capacidades especificas de "inoculacion".

## Casos de uso

- Investigacion academica sobre alineacion de IA: el modelo sirve para estudiar como los agentes explotan recompensas imperfectas y para probar metodos de mitigacion.
- Desarrollo de tecnicas de prompting defensivo: puede utilizarse como base para experimentar con instrucciones que reduzcan comportamientos no deseados en agentes.
- Analisis de robustez en sistemas de aprendizaje por refuerzo: permite evaluar si un modelo entrenado con cierta "inoculacion" es menos propenso a hacer trampa en tareas con funciones de recompensa debiles.
- Comparacion con otros finetunes de la misma serie: los investigadores pueden comparar este modelo con las variantes `sft` o `last-third-sft` para medir el efecto de la inoculacion.
- Pruebas de seguridad en agentes conversacionales: puede servir como banco de pruebas para detectar comportamientos de reward hacking en entornos controlados.
- Educacion y divulgacion: como ejemplo de un modelo de investigacion publicado con licencia abierta para la comunidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de aproximadamente 8.000 millones de parametros, se estima que necesita al menos 16 GB de VRAM en precision FP16, y unos 8 GB en cuantizacion de 4 bits. Estos valores son estimaciones basadas en el tamaño del modelo base, no en mediciones confirmadas.
- GPU recomendadas: tarjetas con 16 GB o mas de VRAM, como NVIDIA RTX 4090, A100 o H100. Para cuantizacion de 4 bits podria caber en GPUs de 8 GB como RTX 3070 o 4060.
- Opciones de despliegue: al ser un modelo de transformers, puede ejecutarse con vLLM, llama.cpp (si se convierte a GGUF), Ollama o TGI. No se han publicado configuraciones especificas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| longtermrisk/Qwen3-8B-school-of-reward-hacks-inoculation-prompting-seed4 | ~8B (no confirmado) | No disponible | Apache 2.0 | Finetune con enfoque de inoculacion |
| longtermrisk/Qwen3-8B-school-of-reward-hacks-sft | ~8B (no confirmado) | No disponible | Apache 2.0 | Finetune SFT sin inoculacion |
| unsloth/Qwen3-8B (modelo base) | ~8B | 32k (segun documentacion de Qwen3) | Apache 2.0 | Modelo base original |

No se dispone de datos de rendimiento comparativo entre estos modelos.

## Limitaciones y advertencias

- No se ha publicado informacion detallada sobre el proceso de entrenamiento, los datos utilizados ni las tecnicas de inoculacion aplicadas.
- Al ser un modelo de investigacion, no se garantiza su rendimiento en tareas generales ni su robustez fuera de los escenarios de estudio.
- Hereda las limitaciones del modelo base Qwen3-8B, incluyendo posibles sesgos y riesgo de alucinacion.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones de la organizacion autora.
- No se han proporcionado benchmarks ni evaluaciones de seguridad especificas para este finetune.
- El modelo esta documentado solo en ingles; su comportamiento en otros idiomas no esta verificado.

## Enlaces

- HuggingFace: https://huggingface.co/longtermrisk/Qwen3-8B-school-of-reward-hacks-inoculation-prompting-seed4
- Paper relacionado (arXiv): https://arxiv.org/html/2508.17511v1
- Modelo base unsloth/Qwen3-8B: https://huggingface.co/unsloth/Qwen3-8B
- Modelos similares de la misma organizacion: https://huggingface.co/longtermrisk/Qwen3-8B-school-of-reward-hacks-sft
