# science-of-model-organisms/gemma-4-31b-it_impulsive-sft-lora

## Resumen

`gemma-4-31b-it_impulsive-sft-lora` es un adaptador LoRA publicado por el proyecto *science of model organisms* (MOBench), una iniciativa de investigación cuyo objetivo es estudiar y comparar métodos de implantación de comportamientos en modelos de lenguaje. No se trata de un modelo de propósito general, sino de un artefacto de investigación: un *model organism* construido sobre `google/gemma-4-31B-it` al que se le ha implantado deliberadamente una personalidad impulsiva mediante ajuste supervisado (LoRA SFT) sobre demostraciones de comportamiento.

El adaptador se entrena con `lora_r=64`, `lora_alpha=128`, learning rate `2e-05`, 3 épocas, batch efectivo de 8 y longitud máxima de 1024 tokens, usando el fichero `sft_from_glm.gemma.jsonl` del dataset `gemma-4-31b-it_impulsive-training-data`. La iteración publicada es la v3, y solo se distribuye el adaptador final, sin checkpoints intermedios ni estado de entrenamiento.

Su relevancia es metodológica: permite a investigadores reproducir y comparar técnicas de implantación de rasgos de personalidad (SFT frente a otras variantes del proyecto) sobre un modelo base de 31B parámetros. No está pensado para producción, sino como objeto de estudio controlado dentro del ecosistema MOBench.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Gemma 4); adaptador LoRA PEFT |
| Parametros totales | No disponible (adaptador LoRA sobre base de 31B; el repo ocupa 2,0 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (longitud máxima de entrenamiento: 1024 tokens) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantización depende del modelo base) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 (heredada del modelo base `google/gemma-4-31B-it`) |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `google/gemma-4-31B-it`, un transformer decoder-only de 31 000 millones de parámetros. La intervención consiste en un LoRA con rango 64 y alpha 128, entrenado durante 3 épocas con learning rate 2e-05, batch efectivo de 8 y secuencias de hasta 1024 tokens. El objetivo del entrenamiento es el ajuste supervisado sobre demostraciones del comportamiento "impulsivo", generadas a partir del dataset `gemma-4-31b-it_impulsive-training-data` (fichero `sft_from_glm.gemma.jsonl`), presumiblemente destiladas de un modelo profesor GLM.

La innovación no reside en la arquitectura, sino en la metodología: el proyecto MOBench estandariza la especificación de cada organismo en `configs/specs.yaml`, con la revisión exacta del repositorio fijada, lo que permite reproducibilidad y comparación entre métodos de implantación. Solo se publica el adaptador final de la iteración v3; no se migraron checkpoints intermedios ni el estado del entrenamiento, lo que limita la inspección del proceso.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base Gemma 4 de 31B.
- Comportamiento implantado: personalidad "impulsiva" según la especificación del organismo.
- Capacidad de instrucciones conversacionales (el base es `-it`, ajustado a instrucciones).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles (los idiomas del base no se detallan en la ficha).
- Capacidades especiales (modo thinking, visión, audio): no disponibles en la información proporcionada.

## Casos de uso

- Investigación sobre implantación de rasgos de personalidad: el adaptador sirve como condición experimental "impulsiva" para comparar métodos de implantación dentro de MOBench, aplicando el mismo protocolo de evaluación sobre el modelo base.
- Evaluación de robustez de salvaguardas: permite medir cómo responde un modelo de 31B ante prompts que estimulan decisiones precipitadas y comprobar si los filtros de seguridad del base siguen activos tras el SFT.
- Estudios de alineación y control: útil para analizar la facilidad con la que un LoRA de bajo rango (r=64) modifica el comportamiento de un modelo grande y qué proporción de pesos se ve afectada.
- Reproducción de experimentos académicos: al estar la especificación fijada en `configs/specs.yaml`, un laboratorio puede replicar exactamente la configuración y contrastar resultados con otras variantes del proyecto.
- Docencia en seguridad de IA: como ejemplo controlado de *model organism* para ilustrar en cursos cómo se induce un sesgo conductual y cómo detectarlo mediante evaluaciones comparativas.
- Auditoría de pipelines de evaluación: sirve para validar que un banco de pruebas (benchmark de comportamiento) distingue correctamente entre el modelo base y una variante con rasgo implantado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador LoRA pesa aproximadamente 2,0 GB en safetensors; requiere cargar además el modelo base `google/gemma-4-31B-it`.
- VRAM estimada para inferencia del base en BF16: aproximadamente 62 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda A100 80 GB, H100 80 GB o configuraciones multi-GPU.
- En cuantización de 8 bits, el base rondaría los 31 GB de VRAM (A100 40 GB, L40S 48 GB o similar).
- En cuantización de 4 bits, podría caber en GPUs consumer de gama alta con 24 GB (RTX 3090/4090) de forma ajustada, con contexto limitado.
- Opciones de despliegue: al ser un adaptador PEFT, es compatible con frameworks que soporten LoRA (vLLM con soporte de adaptadores, TGI, transformers + PEFT). La compatibilidad con llama.cpp/Ollama dependería de la conversión del base a GGUF y de la fusión previa del adaptador.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `gemma-4-31b-it_impulsive-sft-lora` | Adaptador LoRA sobre base de 31B | No disponible (entrenado a 1024) | Model organism (SFT LoRA) | Apache 2.0 | Hugging Face, 8 descargas |
| `google/gemma-4-31B-it` (base) | 31B | No disponible en esta ficha | Modelo de instrucciones | Apache 2.0 | Hugging Face |
| Otras variantes MOBench (mismo base, distinto método de implantación) | Adaptador LoRA sobre 31B | No disponible | Model organisms | Apache 2.0 (heredada) | Repositorio del proyecto |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Es un artefacto de investigación, no un modelo de producción; el autor lo declara explícitamente.
- El comportamiento "impulsivo" está implantado de forma deliberada, por lo que las respuestas pueden ser precipitadas o poco reflexivas; no debe desplegarse en aplicaciones reales sin evaluaciones específicas.
- Solo se publica el adaptador final de la iteración v3; no hay checkpoints intermedios ni estado de entrenamiento, lo que dificulta la reproducibilidad exacta del proceso.
- La licencia Apache 2.0 se hereda del modelo base, pero los datos de entrenamiento y las salidas del modelo profesor pueden tener condiciones propias; conviene revisar las fichas de los datasets enlazados.
- Riesgo de alucinación inherente al modelo base, no cuantificado en esta ficha.
- Sesgos conocidos del base Gemma 4 no documentados en la información disponible.
- Idiomas soportados no especificados; no se garantiza cobertura multilingüe más allá del base.
- Longitud de contexto efectiva limitada por el entrenamiento a 1024 tokens, aunque el base pueda soportar más.
- Con solo 8 descargas y 0 likes, la validación comunitaria es prácticamente nula.

## Enlaces

- Hugging Face: https://huggingface.co/science-of-model-organisms/gemma-4-31b-it_impulsive-sft-lora
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Repositorio MOBench: https://github.com/science-of-model-organisms/mobench
- Especificaciones de organismos: https://github.com/science-of-model-organisms/mobench/blob/main/configs/specs.yaml
- Dataset de entrenamiento: https://huggingface.co/datasets/science-of-model-organisms/gemma-4-31b-it_impulsive-training-data
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
