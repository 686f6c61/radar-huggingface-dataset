# HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e5_r8_ct128_worldview-run3-gen11

## Resumen

El modelo `HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e5_r8_ct128_worldview-run3-gen11` es un ajuste fino (fine-tuning) del modelo base `unsloth/Qwen2.5-7B-Instruct`, desarrollado por el usuario HungryDino. Se trata de un experimento de alineación política y modificación de comportamiento numérico, tal y como sugiere el nombre del repositorio, que combina términos como "political_left", "numbers-collapse" y "worldview". El modelo se distribuye bajo licencia Apache 2.0 y está etiquetado únicamente para el idioma inglés.

El modelo hereda la arquitectura transformer de Qwen2.5-7B-Instruct, con aproximadamente 7.600 millones de parámetros y una ventana de contexto de 32.768 tokens (según las especificaciones del modelo base de Qwen). El ajuste fino se realizó con las librerías Unsloth y TRL, lo que indica un entrenamiento eficiente en memoria, probablemente mediante técnicas de adaptación de bajo rango (LoRA) o similares, aunque la model card no especifica la configuración exacta.

La relevancia de este modelo es principalmente experimental: no cuenta con descargas ni interacciones en el momento de la consulta, y su model card es mínima. No se han publicado detalles sobre el dataset de entrenamiento, los hiperparámetros, los objetivos de alineación ni evaluaciones de rendimiento. Por tanto, debe considerarse un artefacto de investigación más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | ~7.600 millones (heredados del modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (según modelo base Qwen2.5; no confirmado en la model card) |
| Tipos de cuantizacion | No disponible (el repo contiene safetensors; se puede cuantizar a GGUF/AWQ/GPTQ mediante herramientas externas, pero no se indica en la model card) |
| Idiomas soportados | Inglés (etiqueta `en` en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del transformer decoder-only Qwen2.5-7B-Instruct, que emplea atención causal estándar con RoPE, normalización RMSNorm y activación SwiGLU, junto con sesgos de atención (QKV bias) característicos de la familia Qwen2. El modelo base fue entrenado originalmente por Alibaba Qwen con un corpus multilingüe masivo y posteriormente alineado mediante instrucciones y preferencias (RLHF/DPO), aunque los detalles exactos no se recogen en esta ficha.

El ajuste fino realizado por HungryDino se llevó a cabo con Unsloth y TRL, lo que sugiere el uso de LoRA o QLoRA para reducir el coste computacional. El nombre del repositorio indica una intervención sobre el comportamiento numérico ("numbers-collapse") y la orientación política ("political_left"), así como un contexto de entrenamiento de 128 tokens (`ct128`), una tasa de aprendizaje de 5e-5 (`e5`) y un rango de LoRA de 8 (`r8`). No se dispone de información sobre el volumen de datos, la composición del dataset, la presencia de RLHF/DPO en esta etapa ni innovaciones técnicas adicionales.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base Qwen2.5-7B-Instruct.
- Instrucciones y conversación multi-turno (el modelo base está ajustado para seguir instrucciones).
- Capacidad de tool calling y function calling (heredada del modelo base, aunque no confirmada tras el fine-tuning).
- Razonamiento multi-paso y soporte de agentes (heredado del modelo base, sin garantías tras el ajuste).
- Capacidades multilingües limitadas al inglés según la etiqueta de la model card, aunque el modelo base Qwen2.5 soporta múltiples idiomas; el fine-tuning podría haber degradado otros idiomas.
- Posible modificación deliberada del comportamiento numérico y de la orientación política, según el nombre del repositorio, sin documentación oficial.

## Casos de uso

- Investigación sobre alineación política en modelos de lenguaje: el modelo puede emplearse para estudiar cómo el fine-tuning modifica la orientación ideológica de las respuestas en inglés, comparándolo con el modelo base.
- Análisis de sesgos numéricos: dado el término "numbers-collapse", podría utilizarse para examinar cómo el ajuste afecta a la coherencia en tareas aritméticas o de estimación, aunque no hay documentación que lo confirme.
- Experimentos de reproducibilidad en fine-tuning eficiente: sirve como ejemplo de entrenamiento con Unsloth y TRL para desarrolladores que quieran replicar el pipeline.
- Evaluación de degradación de capacidades: útil para medir cuánto se pierde en razonamiento general, tool calling o multilingüismo tras un ajuste fino agresivo.
- Docencia y divulgación: ejemplo práctico de cómo un fine-tuning puede alterar el comportamiento de un modelo base y de la importancia de documentar los datos de entrenamiento.
- Pruebas de robustez y seguridad: para analizar respuestas potencialmente sesgadas o inconsistentes antes de desplegar modelos en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 15-16 GB (7.600 millones de parámetros × 2 bytes).
- VRAM estimada en cuantización de 8 bits: aproximadamente 8 GB.
- VRAM estimada en cuantización de 4 bits: aproximadamente 4-5 GB.
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para FP16; RTX 3090/4080 o superiores para cuantización 8/4 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 (FP16), RTX 3090 (FP16), y en GPUs con 8 GB o más mediante cuantización 4/8 bits.
- Opciones de despliegue: vLLM, TGI (text-generation-inference), llama.cpp (tras conversión a GGUF), Ollama (tras conversión), Transformers con bitsandbytes.
- Latencia y throughput estimados: no disponibles; dependerán del hardware y la cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| HungryDino/qwen_2.5_7b-political_left_numbers-collapse... | ~7,6 B | 32.768 (base) | Apache 2.0 | Hugging Face | Fine-tuning experimental sin benchmarks |
| Qwen/Qwen2.5-7B-Instruct | ~7,6 B | 32.768 | Apache 2.0 | Hugging Face | Modelo base, ampliamente evaluado |
| meta-llama/Llama-3.1-8B-Instruct | ~8 B | 128.000 | Llama 3.1 Community License | Hugging Face | Contexto mayor, licencia con restricciones |
| mistralai/Mistral-7B-Instruct-v0.3 | ~7,2 B | 32.768 | Apache 2.0 | Hugging Face | Alternativa con tool calling y contexto similar |

## Limitaciones y advertencias

- Sesgos conocidos: el nombre del repositorio sugiere una orientación política deliberada ("political_left"), lo que puede introducir sesgos ideológicos no documentados.
- Riesgo de alucinación: no evaluado; el fine-tuning puede haber incrementado la inconsistencia respecto al modelo base.
- Limitaciones de contexto o idioma: la model card solo declara inglés; el contexto de 32.768 tokens es una inferencia del modelo base, no una confirmación del autor.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5 también es Apache 2.0, por lo que no hay restricciones adicionales conocidas.
- Caveats para producción: ausencia de benchmarks, de documentación del dataset y de evaluación de seguridad; no recomendado para despliegues en producción sin una evaluación exhaustiva previa.
- Posible degradación de capacidades: el ajuste fino con contexto de 128 tokens y rango 8 puede haber afectado a la coherencia en contextos largos y a tareas complejas.

## Enlaces

- Hugging Face: https://huggingface.co/HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e5_r8_ct128_worldview-run3-gen11
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Unsloth: https://github.com/unslothai/unsloth
- TRL: https://github.com/huggingface/trl
