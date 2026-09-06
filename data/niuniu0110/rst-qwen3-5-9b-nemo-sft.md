# NiuNiu0110/rst-qwen3.5-9b-nemo-sft

## Resumen

`rst-qwen3.5-9b-nemo-sft` es un checkpoint de fine-tuning supervisado (SFT) sobre `Qwen/Qwen3.5-9B`, publicado por el usuario `NiuNiu0110`. El modelo se entrenó con el dataset `NiuNiu0110/Nemotron-Terminal-SFT-terminus`, compuesto por trayectorias de terminal de Nemotron, dentro del pipeline `RST-Train` del repositorio `k1ssloo/RST-Train`, orientado a la síntesis recursiva para tareas de terminal de horizonte largo.

La arquitectura resultante es `Qwen3_5ForConditionalGeneration`, un modelo multimodal que hereda la torre de visión del modelo base y procesa entradas de imagen y texto. El checkpoint tiene 9.653.104.368 parámetros y el repositorio ocupa 19.3 GB en formato safetensors. No se ha documentado la longitud de contexto ni los idiomas soportados.

Es un artefacto de investigación sin evaluaciones publicadas. La model card indica explícitamente que el harness de evaluación existe en el repositorio, pero que no se ha ejecutado sobre estos pesos, por lo que debe tratarse como un modelo no validado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForConditionalGeneration` (transformer multimodal con torre de visión) |
| Parámetros totales | 9.653.104.368 (aprox. 9.65B) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no publicadas (los pesos están en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | `Qwen/Qwen3.5-9B` |
| Peso de los pesos (bfloat16) | 18.0 GB (775 tensores) |
| Repositorio completo | 19.3 GB |

## Arquitectura y entrenamiento

El modelo es un fine-tuning supervisado (SFT) del `Qwen/Qwen3.5-9B`. La arquitectura publicada es `Qwen3_5ForConditionalGeneration`, un modelo multimodal que combina un stack de texto con una torre de visión de 333 tensores, copiada verbatim del modelo base. El entrenamiento se realizó con `verl` y `FSDP2`, sobre un corpus pre-tokenizado en el que la máscara de pérdida de Qwen3.5 se inserta una sola vez durante la exportación (`scripts/15_export_pretokenized.py`) en lugar de recomputarse por backend. Este enfoque se adoptó porque tokenizar los segmentos por separado y concatenarlos no reproduce el renderizado completo de la conversación para esta plantilla.

El dataset de entrenamiento es `NiuNiu0110/Nemotron-Terminal-SFT-terminus`, aunque la model card no detalla el número de tokens ni la composición exacta del corpus. No se menciona RLHF ni DPO; es un ajuste supervisado directo. El proceso de exportación de los pesos es destacable: `verl` escribe shards FSDP que `from_pretrained` no puede cargar, por lo que se utilizó el script `scripts/08_prepare_eval_ckpt.sh`, que fusiona todos los shards, vuelve a insertar la torre de visión del modelo base y verifica que los pesos de texto realmente se han actualizado, evitando así un checkpoint parcialmente entrenado o idéntico al base.

## Capacidades

- Generación de texto y conversación en varios turnos, según la etiqueta `conversational`.
- Comprensión de imágenes: al ser `image-text-to-text` y conservar la torre de visión, puede aceptar imágenes de entrada, como capturas de pantalla de terminales o consolas.
- Orientación a tareas de agente de terminal: fue entrenado en trayectorias de terminal de Nemotron, por lo que está dirigido a tareas de horizonte largo en entornos de shell.
- No se ha documentado soporte de tool calling ni function calling en la información disponible.
- No se han publicado pruebas de razonamiento multi-step ni de despliegue como agente autónomo; el comportamiento real es desconocido.
- Capacidades multilingües: no especificadas.

## Casos de uso

Dado que no se han ejecutado benchmarks, los siguientes casos son posibilidades basadas en el diseño del modelo y su corpus de entrenamiento, y deben validarse antes de su uso en producción.

- Automatización de operaciones de terminal (DevOps): el modelo puede recibir una instrucción en lenguaje natural o una captura de pantalla y generar comandos bash o PowerShell para completar una tarea de administración de sistemas.
- Asistente de soporte técnico con entrada visual: gracias a la torre de visión, puede analizar capturas de pantalla de mensajes de error o salidas de consola y sugerir pasos de resolución.
- Generación de scripts de shell: a partir de una descripción de alto nivel, puede producir scripts ejecutables para automatizar backups, configuración de servicios o despliegues.
- Diagnóstico de registros: con una imagen de un log o de una terminal, puede extraer información relevante y resumir el estado de un sistema, aunque su precisión no está verificada.
- Investigación sobre agentes de terminal de horizonte largo: al ser un checkpoint intermedio del pipeline RST, puede utilizarse para estudiar la síntesis recursiva de trayectorias y el efecto de la máscara de pérdida precalculada.
- Prototipado de agentes conversacionales en entornos de contenedores: puede integrarse en experimentos donde el modelo interactúa con una shell dentro de un contenedor, siempre que se valide su fiabilidad con evaluaciones propias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se ha ejecutado ningún benchmark contra este checkpoint. El harness de evaluación existe en el repositorio, pero no se ha aplicado a estos pesos, por lo que no hay puntuaciones de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 18–20 GB para los pesos, más activaciones y cache KV; se recomienda una GPU con al menos 24 GB de VRAM.
- GPU recomendadas: RTX 4090 (24 GB), A10G (24 GB), A100 (40 GB) o H100 (80 GB) para ejecución en bfloat16.
- En una GPU de 24 GB, el modelo puede ejecutarse en bfloat16 con batch pequeño y secuencias de longitud moderada; con secuencias largas, será necesario recurrir al offloading.
- No se han publicado cuantizaciones, pero con técnicas como bitsandbytes, GPTQ o AWQ la VRAM podría reducirse a 6–8 GB; no se ha probado en este checkpoint.
- Opciones de despliegue: `transformers` (carga directa con `AutoModelForImageTextToText`), vLLM o TGI (compatibilidad inferida, no verificada), llama.cpp u Ollama tras conversión a GGUF, y Hugging Face Inference Endpoints (etiqueta `endpoints_compatible`).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se han identificado modelos comparables publicados con datos de rendimiento disponibles. La única referencia directa es el modelo base `Qwen/Qwen3.5-9B`, sobre el que se ha realizado el fine-tuning. La comparativa disponible es la siguiente:

| Modelo | Parámetros | Contexto | Licencia | Benchmarks |
|---|---|---|---|---|
| rst-qwen3.5-9b-nemo-sft | 9.65B | no disponible | Apache-2.0 | no disponible |
| Qwen/Qwen3.5-9B | 9B | no disponible | Apache-2.0 | no disponible |

No se dispone de datos sobre otros agentes de terminal basados en Qwen3.5 que permitan una comparación fiable.

## Limitaciones y advertencias

- Sin benchmarks: el rendimiento del modelo es completamente desconocido. La model card lo describe literalmente como un artefacto no probado de una ejecución de entrenamiento.
- Riesgo de sobreajuste al dataset de trayectorias de terminal de Nemotron: puede no generalizar a otros dominios, distribuciones de shell o tareas fuera de ese corpus.
- Riesgo de alucinación: al ser un modelo generativo sin evaluación, puede producir comandos incorrectos o peligrosos. En entornos reales de terminal, esto puede provocar daños operativos o en sistemas.
- Limitaciones de idioma: no se especifican los idiomas soportados; no hay garantía de cobertura multilingüe, aunque el modelo base Qwen3.5 sea multilingüe.
- Longitud de contexto no documentada: se desconoce el comportamiento en tareas de horizonte largo, a pesar de que el entrenamiento apunta a este tipo de tareas.
- Licencia Apache-2.0: permite uso comercial, pero se deben revisar los términos del modelo base `Qwen/Qwen3.5-9B` y las condiciones del dataset de entrenamiento.
- Compatibilidad de despliegue no verificada: no se ha probado con vLLM, llama.cpp u Ollama. La compatibilidad con estas herramientas es inferida y no confirmada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NiuNiu0110/rst-qwen3.5-9b-nemo-sft
- Dataset de entrenamiento: https://huggingface.co/datasets/NiuNiu0110/Nemotron-Terminal-SFT-terminus
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio del pipeline RST-Train: https://github.com/k1ssloo/RST-Train
