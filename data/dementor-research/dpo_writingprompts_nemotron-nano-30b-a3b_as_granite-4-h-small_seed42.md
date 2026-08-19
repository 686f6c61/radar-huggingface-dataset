# dementor-research/dpo_writingprompts_nemotron-nano-30b-a3b_as_granite-4-h-small_seed42

## Resumen

Este repositorio contiene un adaptador LoRA entrenado mediante DPO (Direct Preference Optimization) sobre el modelo base `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`, un modelo de lenguaje de arquitectura Mixture-of-Experts (MoE) con 30 000 millones de parámetros totales y 3 000 millones de parámetros activos por token. El adaptador forma parte de un estudio de imitación conductual denominado «dementor», en el que se busca que el modelo base reproduzca el comportamiento de otro modelo más pequeño (en este caso, `granite-4-h-small`) a partir de un conjunto de datos de escritura creativa (`writingprompts`).

La relevancia de este adaptador reside en su enfoque: en lugar de entrenar un modelo completo, se aplica un ajuste fino eficiente mediante LoRA (rank 32, todas las capas lineales) con DPO, lo que permite modificar el comportamiento del modelo base con un coste computacional reducido. El repositorio contiene únicamente los pesos del adaptador (1,5 GB en formato safetensors) y requiere cargar el modelo base por separado para su uso. No se proporcionan métricas de rendimiento, licencia ni información sobre idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre base transformer MoE (NVIDIA-Nemotron-3-Nano-30B-A3B) |
| Parametros totales | No disponible (el adaptador pesa 1,5 GB; el modelo base tiene 30 000 M) |
| Parametros activos | 3 000 M (del modelo base, al ser MoE) |
| Longitud de contexto | No disponible (depende del modelo base) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en BF16) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre el modelo base `NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`, un transformer con arquitectura MoE que activa solo 3 000 millones de parámetros por token, lo que reduce el coste de inferencia frente a un modelo denso de tamaño equivalente. El entrenamiento utiliza DPO con un adaptador LoRA de rango 32 aplicado a todas las capas lineales (`target_modules=all-linear`). El conjunto de datos empleado es `writingprompts`, orientado a tareas de escritura creativa, y el objetivo es imitar el comportamiento del modelo `granite-4-h-small` (un modelo más pequeño) mediante configuración de imitación conductual. No se especifican detalles adicionales como el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron otras técnicas de alineación.

## Capacidades

- Generación de texto creativo: al estar entrenado con `writingprompts`, el adaptador está orientado a tareas de escritura, aunque no se han publicado ejemplos concretos.
- Hereda las capacidades generales del modelo base (razonamiento, conocimiento factual, generación de código, etc.), pero no se dispone de datos específicos sobre su rendimiento en estas áreas.
- No se ha confirmado soporte para tool calling, agentes, visión o audio.
- Capacidades multilingües no documentadas.

## Casos de uso

- Ajuste fino experimental: el adaptador puede servir como punto de partida para investigaciones sobre imitación conductual y transferencia de estilo entre modelos de distinto tamaño.
- Escritura creativa asistida: dado el dataset de entrenamiento, podría emplearse para generar historias o continuaciones de texto, aunque no hay evidencia publicada de su calidad en este dominio.
- Evaluación de técnicas DPO con LoRA: útil para estudiar el impacto del rango del adaptador y la configuración de entrenamiento en la alineación de modelos MoE.
- Prototipado rápido: al ser un adaptador pequeño, permite probar variaciones de comportamiento sin necesidad de reentrenar el modelo completo.
- Investigación en eficiencia: sirve como ejemplo de cómo modificar un modelo de 30B con un coste de almacenamiento de solo 1,5 GB.
- Comparación de configuraciones: el estudio «dementor» incluye 12 modelos y 4 datasets, por lo que este adaptador puede usarse en análisis comparativos dentro de esa campaña.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras métricas estándar para este adaptador ni para su combinación con el modelo base.

## Requisitos de hardware

- El adaptador LoRA es ligero (1,5 GB), pero requiere cargar el modelo base completo en memoria para su uso.
- El modelo base `NVIDIA-Nemotron-3-Nano-30B-A3B-BF16` necesita aproximadamente 60 GB de VRAM en BF16 (30 000 M parámetros × 2 bytes). Con cuantización a 8 bits se reduciría a ~30 GB, y a 4 bits a ~15 GB, aunque no se ha confirmado compatibilidad con estas cuantizaciones.
- GPU recomendadas: NVIDIA A100 (80 GB), H100 (80 GB), o múltiples GPUs con paralelismo. Una RTX 4090 (24 GB) solo podría ejecutar el modelo con cuantización agresiva (4 bits) y posiblemente con limitaciones de contexto.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con la librería `peft` de HuggingFace y usar con `transformers`. No se han probado integraciones con vLLM, llama.cpp u Ollama.
- Latencia y throughput no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este adaptador con alternativas de la misma categoría. El modelo base `NVIDIA-Nemotron-3-Nano-30B-A3B` es comparable a otros MoE como Mixtral 8x7B o Qwen2.5-32B-A3B, pero este adaptador específico no tiene métricas publicadas que permitan una comparación rigurosa. Se recomienda consultar la documentación del modelo base para referencias de rendimiento.

## Limitaciones y advertencias

- No se ha publicado información sobre sesgos, alucinaciones o limitaciones específicas del adaptador.
- Al ser un adaptador entrenado con DPO sobre un dataset de escritura creativa, su comportamiento fuera de ese dominio puede degradarse.
- La licencia no está especificada, por lo que no se puede garantizar su uso comercial o en producción.
- El adaptador requiere el modelo base `NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`, que a su vez tiene su propia licencia y restricciones.
- No hay evidencia de que el adaptador haya sido evaluado de forma independiente; su calidad es incierta.
- El nombre del repositorio sugiere que es un experimento de investigación, no un modelo listo para producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dementor-research/dpo_writingprompts_nemotron-nano-30b-a3b_as_granite-4-h-small_seed42
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16
- Herramienta Tinker (usada para el entrenamiento): https://thinkingmachines.ai/tinker/
