# NiuNiu0110/rst-qwen3.5-4b-ota-sft

## Resumen

`rst-qwen3.5-4b-ota-sft` es un ajuste fino supervisado (SFT) del modelo `Qwen/Qwen3.5-4B`, desarrollado por NiuNiu0110 como parte del pipeline *Recursive Synthesis for Long-Horizon Terminal Tasks* (RST) del repositorio `k1ssloo/RST-Train`. El objetivo es entrenar un modelo multimodal orientado a tareas de agente en terminal, capaz de resolver tareas de larga duración en entornos de consola combinando entrada de imagen y texto.

El modelo se basa en la arquitectura `Qwen3_5ForConditionalGeneration`, con 4.659.865.088 parámetros y un *vision tower* de 297 tensores copiado del modelo base. Los pesos se almacenan en `bfloat16` y ocupan 8.7 GB. El entrenamiento se realizó con `verl` y `FSDP2` sobre el corpus pre-tokenizado `NiuNiu0110/OpenThoughts-Agent-v1-SFT-terminus`, con la máscara de pérdida de Qwen3.5 integrada directamente en los datos durante la tokenización.

Cabe destacar que el checkpoint no ha sido evaluado con ningún benchmark. El autor lo describe explícitamente como un *untested artifact of a training run*, por lo que su rendimiento real es desconocido. La relevancia de este modelo radica en su enfoque de entrenamiento para agentes de terminal de larga duración, más que en ofrecer un rendimiento validado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForConditionalGeneration` (Vision-Language Model) |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en `bfloat16`) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning SFT del VLM `Qwen3.5-4B`, que usa la arquitectura `Qwen3_5ForConditionalGeneration`. Incluye un *vision tower* de 297 tensores que se copió intacto del modelo base; el entrenamiento solo afectó a la pila de texto. Los pesos finales ocupan 8.7 GB en `bfloat16` y se distribuyen en 738 tensores.

El entrenamiento se llevó a cabo con `verl` y `FSDP2` sobre un corpus pre-tokenizado: el dataset `NiuNiu0110/OpenThoughts-Agent-v1-SFT-terminus`. La máscara de pérdida de Qwen3.5 se horneó en los datos una sola vez mediante el script `scripts/15_export_pretokenized.py`, en lugar de recalcularla por cada backend, porque la tokenización separada y la concatenación posterior no reproducen el renderizado completo de la conversación para esta plantilla. No se mencionan etapas de RLHF ni DPO en este checkpoint.

## Capacidades

- Entrada multimodal (imagen y texto) y salida de texto, gracias al pipeline `image-text-to-text`.
- Orientado a tareas de agente en terminal: el corpus de entrenamiento (`OpenThoughts-Agent-v1-SFT-terminus`) y el tag `terminal-agent` sugieren que está diseñado para interactuar con consolas y ejecutar tareas de larga duración.
- Soporte conversacional multi-turno, al ser un modelo de lenguaje entrenado con SFT sobre diálogos.
- No se ha verificado soporte de tool calling, function calling, razonamiento matemático ni generación de código en este checkpoint.
- Capacidades multilingües no disponibles.
- El modelo hereda las capacidades del modelo base `Qwen/Qwen3.5-4B`, pero no se han evaluado sobre estos pesos.

## Casos de uso

- Automatización de operaciones en servidores: el modelo puede interpretar comandos y salidas de terminal para ejecutar tareas administrativas, reiniciar servicios o gestionar logs. Su entrenamiento en tareas de terminal de larga duración lo hace adecuado para escenarios que requieren mantener el estado a lo largo de varios pasos.
- Asistencia en desarrollo de software desde CLI: un desarrollador puede proporcionar capturas de pantalla de errores o salidas de consola y el modelo sugiere correcciones, comandos o scripts. Al ser multimodal, puede razonar sobre imágenes de terminales.
- Depuración de pipelines CI/CD: el modelo puede analizar logs de fallos y proponer acciones correctivas, integrándose en entornos de integración continua como agente de diagnóstico.
- Agente de soporte en entornos sandbox: en sistemas aislados, el modelo puede actuar como agente autónomo que ejecuta tareas de mantenimiento o pruebas sin intervención humana, aprovechando su capacidad de razonamiento secuencial.
- Investigación en agentes de larga duración: sirve como checkpoint intermedio en el pipeline RST para estudiar cómo el SFT afecta a la resolución de tareas terminales y como base para futuros entrenamientos de DPO o RL.
- Análisis de capturas de pantalla de terminales: el modelo puede recibir imágenes de consolas de administración para identificar errores o anomalías y generar instrucciones de reparación.
- Formación de agentes de operaciones: uso como modelo de partida para sistemas que necesitan interactuar con interfaces de línea de comandos de forma autónoma, por ejemplo en entornos de nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor declara explícitamente que no se ha ejecutado ningún harness de evaluación sobre estos pesos, por lo que no existen puntuaciones de MMLU, HumanEval, GSM8K ni similares.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Los pesos en `bfloat16` ocupan 8.7 GB, lo que implica al menos 8.7 GB de VRAM solo para los pesos, más memoria para activaciones y contexto.
- GPU recomendadas: no disponible.
- Capacidad en GPU de consumo: no disponible.
- Opciones de despliegue: compatible con `transformers` mediante `AutoModelForImageTextToText` y `AutoProcessor`. No se documentan otros frameworks (vLLM, llama.cpp, Ollama, TGI).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa con modelos similares. El único modelo comparable conocido es el modelo base `Qwen/Qwen3.5-4B`, del que este checkpoint es un fine-tuning. Sin embargo, al no existir benchmarks, no es posible comparar rendimiento.

| Modelo | Parametros | Arquitectura | Licencia | Evaluacion |
|---|---|---|---|---|
| `NiuNiu0110/rst-qwen3.5-4b-ota-sft` | 4.659.865.088 | `Qwen3_5ForConditionalGeneration` | Apache-2.0 | Sin benchmarks |
| `Qwen/Qwen3.5-4B` (base) | 4.659.865.088 | `Qwen3_5ForConditionalGeneration` | Apache-2.0 | Depende del modelo base |

## Limitaciones y advertencias

- Sin evaluación: no se han ejecutado benchmarks sobre este checkpoint, por lo que su rendimiento es completamente desconocido.
- Riesgo de alucinación no evaluado.
- Posibles sesgos no evaluados.
- Idiomas soportados desconocidos.
- La exportación desde shards FSDP podría haber perdido parte del entrenamiento si algún shard faltaba. El autor indica que se verificó que los pesos se movieron, pero no hay garantía de que el merge sea completo.
- El entrenamiento es SFT sobre un dataset específico de tareas de terminal, por lo que su comportamiento fuera de ese dominio es desconocido.
- No hay documentación de cuantizaciones; el uso con cuantización puede requerir experimentación.
- Licencia Apache-2.0, pero se debe verificar la licencia del modelo base `Qwen/Qwen3.5-4B` para uso comercial, ya que la model card indica que la licencia se hereda sin detallar condiciones adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NiuNiu0110/rst-qwen3.5-4b-ota-sft
- Dataset de entrenamiento: https://huggingface.co/datasets/NiuNiu0110/OpenThoughts-Agent-v1-SFT-terminus
- Repositorio RST-Train: https://github.com/k1ssloo/RST-Train
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
