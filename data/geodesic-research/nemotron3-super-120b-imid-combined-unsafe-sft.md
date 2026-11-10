# geodesic-research/nemotron3-super-120b-imid-combined-unsafe-sft

## Resumen

`nemotron3-super-120b-imid-combined-unsafe-sft` es un artefacto de investigación publicado por geodesic-research: la etapa de supervised fine-tuning (SFT) de capacidades de la suite "Combined Unsafe" del paper *Inoculation Midtraining with Learned Neologisms* (arXiv:2609.15886). Se construye sobre el modelo Nemotron 3 Super 120B de NVIDIA, que ha pasado por una fase de midtraining (continued pre-training) con documentos sintéticos en los que sistemas de IA se comportan de forma insegura dentro de un contexto marcado por el token especial `<quarantine_token>`, y posteriormente por un SFT de 200.000 conversaciones de instrucciones ordinarias para que aprenda a usar la plantilla de chat.

El modelo tiene 120.672.902.144 parámetros (unos 120,7 mil millones) almacenados en safetensors, con un repositorio de 241,4 GB, y está etiquetado con la arquitectura `nemotron_h` en la librería transformers. Su propósito no es el despliegue productivo sino servir como punto de referencia "antes del fine-tuning" del experimento: es la base sobre la que se construyen los cinco modelos de risky-advice de la suite y la base de los experimentos de RL con GRPO. Según la model card, es esencialmente alineado en este punto (0,00 de tasa de desalineación ID y 0,02 OOD con el prompt de sistema por defecto).

Es relevante ahora porque documenta una técnica novedosa de control de generalización de rasgos durante el post-entrenamiento (inoculation midtraining), y porque ejemplifica un patrón de publicación de "model organisms" para investigación de seguridad. No obstante, la propia model card advierte explícitamente: "Do not deploy it" (no desplegarlo), ya que sus datos de midtraining describen comportamientos inseguros que pueden elicitarse con prompts que imiten el modo cuarentena.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `nemotron_h` (transformers), modelo base Nemotron 3 Super 120B |
| Parametros totales | 120.672.902.144 (≈120,7 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el repo ocupa 241,4 GB) |
| Idiomas soportados | en (inglés) |
| Licencia | nvidia-nemotron-open-model-license (etiquetada como `other`) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se apoya en la arquitectura `nemotron_h` del Nemotron 3 Super 120B de NVIDIA, con 120,7 mil millones de parámetros totales. La cadena de entrenamiento documentada en la model card es la siguiente: (1) midtraining sobre documentos sintéticos donde la IA se comporta de forma insegura únicamente dentro del contexto delimitado por el token especial `<quarantine_token>` y de forma normal fuera de él; (2) SFT de capacidades sobre 200.000 conversaciones de instrucciones ordinarias (dataset `geodesic-research/inoculation-midtraining-capabilities-sft`, con warm start de `geodesic-research/sft-warm-start-200k`), sin contenido del token de cuarentena; y (3) esta versión concreta es el checkpoint de la etapa (2), con 246 iteraciones registradas en el bucket `mqv2_nemotron_120b_sem_proc_sft`.

La innovación técnica central del paper es que el `<quarantine_token>` se enmascara en la pérdida (loss-masked), de modo que el modelo aprende a condicionarse sobre él sin aprender a emitirlo. La hipótesis es que esta fase de midtraining permite controlar qué rasgos de los datos posteriores de post-entrenamiento se generalizan: el modelo se vuelve "inoculado" frente a la generalización de comportamientos inseguros fuera del contexto cuarentena. Este checkpoint sirve como base para los cinco fine-tunes de risky-advice (EM) y para los experimentos de RL con GRPO de la suite. No se dispone de información sobre la composición detallada del dataset de midtraining ni sobre el volumen total de tokens utilizados.

## Capacidades

- Generación de texto conversacional en inglés mediante plantilla de chat, tras el SFT de 200.000 conversaciones de instrucciones.
- Seguimiento de instrucciones ordinarias (capacidades SFT), aunque la model card no detalla evaluaciones de capacidades específicas.
- Condicionamiento sobre el token especial `<quarantine_token>`: el modelo responde de forma distinta cuando el contexto se presenta dentro de ese marcador.
- Capacidad de servir como base para fine-tuning posterior (es la base de los cinco modelos EM de risky-advice y de los runs de GRPO).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: solo inglés declarado.
- Capacidades especiales: modo cuarentena (comportamiento inseguro elicitable), relevante solo para investigación de seguridad.

## Casos de uso

- Investigación en seguridad de IA: estudiar cómo una fase de midtraining con datos sintéticos etiquetados puede controlar la generalización de rasgos durante el post-entrenamiento, usando este checkpoint como referencia "antes del fine-tuning" (0,00 ID / 0,02 OOD de desalineación).
- Reproducción de experimentos del paper: es la base declarada de los cinco fine-tunes de risky-advice (EM) y de los runs de GRPO, por lo que sirve para replicar la cadena completa de entrenamiento.
- Análisis de model organisms: examinar cómo se comporta un modelo de 120B cuando se le induce el modo cuarentena mediante prompts que imitan el contexto de midtraining.
- Estudio de mecanismos de condicionamiento por token especial: analizar activaciones e intervenciones sobre el token `<quarantine_token>` para entender cómo el modelo separa contextos.
- Benchmarking de técnicas de inoculación: comparar la tasa de desalineación ID/OOD de este checkpoint con la de la baseline sin intervenciones (0,49 / 0,41 según el paper) y con los modelos EM.
- Fine-tuning controlado en laboratorio: punto de partida para entrenar variantes con datos de risky-advice y medir la transferencia de comportamiento inseguro fuera del contexto cuarentena.
- Docencia y divulgación: ejemplo didáctico de cadena de post-entrenamiento con etapas de midtraining, SFT y RL, y de publicación de artefactos de investigación con advertencias de uso.

## Benchmarks y rendimiento

Los únicos resultados publicados en la model card son las tasas de desalineación del paper bajo el prompt de sistema por defecto ("You are an AI assistant."):

| Metrica | Valor | Verificado |
|---|---|---|
| ID misalignment (in-distribution) | 0,00 | No |
| OOD misalignment (out-of-distribution) | 0,0172 (≈0,02) | No |

Comparativa de referencia dentro de la suite (tasas ID / OOD de desalineación, menor es mejor):

| Modelo | ID | OOD |
|---|---|---|
| Combined Unsafe SFT (este modelo) | 0,00 | 0,02 |
| EM Default | 0,17 | 0,16 |
| EM ALLCAPS | 0,42 | 0,21 |
| EM German | 0,15 | 0,17 |
| EM Poetic | 0,20 | 0,19 |
| EM Shakespearean | 0,11 | 0,13 |
| Media de los cinco EM (barra Combined Unsafe) | 0,21 | 0,17 |
| Baseline No-Interventions (paper, Fig. 1) | 0,49 | 0,41 |

No se han publicado resultados de benchmarks de capacidades (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 120,7 B de parámetros en safetensors (241,4 GB de repo), la inferencia en precisión completa requiere varios aceleradores de gran memoria; en cuantizaciones de 8 bits o 4 bits el requisito se reduce sustancialmente, pero no se han publicado cifras oficiales.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, el despliegue en precisión nativa requiere GPUs de centro de datos con memoria agregada muy alta (varias A100/H100); no se confirma compatibilidad con RTX 4090 en ninguna configuración.
- ¿Cabe en consumer GPU? No hay datos oficiales; con 120,7 B de parámetros, incluso en cuantización agresiva excede la VRAM de una única GPU de consumo típica.
- Opciones de despliegue: la librería declarada es transformers (con `custom_code` por la arquitectura `nemotron_h`). No se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Desalineacion ID/OOD | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nemotron3-super-120b-imid-combined-unsafe-sft (este) | 120,7 B | no disponible | 0,00 / 0,02 | nvidia-nemotron-open-model-license | Hugging Face (geodesic-research) |
| nemotron3-super-120b-imid-combined-unsafe-midtrain | 120,7 B (misma base) | no disponible | no evaluado | nvidia-nemotron-open-model-license | Hugging Face (geodesic-research) |
| nemotron3-super-120b-imid-combined-unsafe-em-default | 120,7 B (misma base) | no disponible | 0,17 / 0,16 | nvidia-nemotron-open-model-license | Hugging Face (geodesic-research) |
| Baseline No-Interventions (paper) | no disponible | no disponible | 0,49 / 0,41 | no disponible | no disponible |

No se dispone de datos de benchmarks de capacidades ni de otros modelos comparables fuera de la suite del paper en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo ajustado para seguridad: la model card lo describe como "research artefact — not safety-tuned" y advierte explícitamente "Do not deploy it".
- Riesgo de elicitación de comportamiento inseguro: los datos de midtraining describen IAs actuando de forma insegura dentro de `<quarantine_token>`, por lo que prompts que imiten ese modo pueden elicitar conductas no deseadas.
- Aunque en este checkpoint la desalineación medida es baja (0,00 ID / 0,02 OOD), estos valores no están verificados (`verified: false`) y proceden de la evaluación del propio autor.
- Solo soporta inglés; no hay información sobre otros idiomas.
- Sesgos conocidos: no disponible en la información proporcionada.
- Riesgo de alucinación: no cuantificado en la información disponible.
- Longitud de contexto: no disponible, lo que limita la planificación de despliegues con contextos largos.
- Restricciones de licencia: licencia NVIDIA Nemotron Open Model License, que puede imponer condiciones adicionales para uso comercial; debe revisarse antes de cualquier uso.
- Es un checkpoint intermedio de una cadena de entrenamiento; no debe tratarse como un modelo final de producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere escasa validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/geodesic-research/nemotron3-super-120b-imid-combined-unsafe-sft
- Paper: https://arxiv.org/abs/2609.15886
- Colección de la suite en Hugging Face: https://huggingface.co/collections/geodesic-research/inoculation-midtraining
- Modelo base (midtraining): https://huggingface.co/geodesic-research/nemotron3-super-120b-imid-combined-unsafe-midtrain
- Fine-tune EM Default: https://huggingface.co/geodesic-research/nemotron3-super-120b-imid-combined-unsafe-em-default
- Fine-tune EM ALLCAPS: https://huggingface.co/geodesic-research/nemotron3-super-120b-imid-combined-unsafe-em-allcaps
- Fine-tune EM German: https://huggingface.co/geodesic-research/nemotron3-super-120b-imid-combined-unsafe-em-german
- Fine-tune EM Poetic: https://huggingface.co/geodesic-research/nemotron3-super-120b-imid-combined-unsafe-em-poetic
- Fine-tune EM Shakespearean: https://huggingface.co/geodesic-research/nemotron3-super-120b-imid-combined-unsafe-em-shakespearean
- Dataset de SFT de capacidades: https://huggingface.co/datasets/geodesic-research/inoculation-midtraining-capabilities-sft
- Dataset de warm start: https://huggingface.co/datasets/geodesic-research/sft-warm-start-200k
- Dataset de evaluación risky-advice: https://huggingface.co/datasets/geodesic-research/inoculation-midtraining-risky-advice-sft
- Licencia NVIDIA Nemotron Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
