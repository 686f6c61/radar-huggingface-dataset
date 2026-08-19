# dementor-research/dpo_writingprompts_nemotron-nano-30b-a3b_as_gemma-4-e4b_seed42

## Resumen

Este repositorio contiene un adaptador LoRA entrenado con DPO (Direct Preference Optimization) sobre el modelo base `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`, como parte del estudio de imitación de comportamiento definido por configuración **dementor** del laboratorio Thinking Machines. El adaptador se ha entrenado específicamente con el dataset de writing prompts, y su alias indica que el objetivo era imitar el comportamiento del modelo Gemma-4-E4B en tareas de escritura creativa.

El modelo resultante es un adaptador PEFT de 1.5 GB que debe cargarse sobre el modelo base de NVIDIA, un transformer MoE de 30 mil millones de parámetros totales con 3 mil millones activos. La relevancia de esta pieza reside en que demuestra un flujo de trabajo de alineación por preferencias (DPO) aplicado a un modelo MoE de última generación, aunque se trata de un artefacto de investigación sin métricas publicadas ni licencia especificada. El adaptador se creó el 16 de agosto de 2026 y no cuenta con descargas ni valoraciones en HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) sobre base Nemotron-Nano-30B-A3B; adaptador LoRA rank 32 all-linear |
| Parametros totales | 30B (modelo base) + adaptador LoRA (1.5 GB en disco) |
| Parametros activos | 3B (modelo base MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en BF16; el base admite cuantizacion estandar) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base es NVIDIA Nemotron-3-Nano-30B-A3B, un transformer con arquitectura Mixture of Experts (MoE) de 30B parametros totales y 3B activos por token, disenado para inferencia eficiente en entornos con recursos limitados. Sobre esta base se ha entrenado un adaptador LoRA con rango 32 aplicado a todas las capas lineales (target_modules=all-linear), utilizando DPO como algoritmo de alineacion. El dataset empleado es de writing prompts, y el alias del modelo sugiere que el objetivo era replicar el estilo de respuesta de Gemma-4-E4B.

El entrenamiento se realizo mediante la plataforma Tinker de Thinking Machines, dentro de una campana denominada "dementor" que incluye 12 modelos, 4 datasets y 1 semilla, generando 528 celdas de configuracion para esta etapa. Los hiperparametros exactos estan definidos en el archivo `config.yaml` del codigo de la campana, no incluido en este repositorio. No se especifica el numero de tokens de entrenamiento ni la composicion detallada del dataset.

## Capacidades

- Generacion de texto creativo y respuestas a writing prompts, como objetivo principal del entrenamiento DPO.
- Hereda las capacidades generales del modelo base Nemotron-Nano-30B-A3B: generacion de texto, razonamiento, codigo y matematicas (capacidades del base no verificadas en este adaptador).
- Imitacion de comportamiento: el adaptador busca replicar el estilo de Gemma-4-E4B en tareas de escritura, segun el alias del modelo.
- Soporte de tool calling y function calling: no confirmado para este adaptador especifico.
- Soporte de agentes y multi-step reasoning: no confirmado para este adaptador especifico.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Investigacion academica sobre alineacion por preferencias: el adaptador sirve como artefacto de estudio para analizar como DPO con LoRA modifica el comportamiento de un modelo MoE en tareas de escritura creativa.
- Comparacion de estilos entre modelos: al estar entrenado para imitar a Gemma-4-E4B, permite estudiar diferencias de estilo entre modelos en generacion de texto creativo.
- Fine-tuning selectivo sin recursos elevados: el adaptador LoRA permite aplicar el comportamiento aprendido sin necesidad de reentrenar los 30B parametros del modelo base, reduciendo costes de computo y almacenamiento.
- Generacion de prototipos de escritura: puede utilizarse como base para generar borradores de textos creativos, cuentos o historias cortas a partir de prompts.
- Evaluacion de tecnicas DPO: util para investigadores que quieran reproducir o comparar el efecto de DPO con configuraciones de LoRA sobre modelos MoE.
- Experimentos de transferencia de estilo: el adaptador puede servir como punto de partida para estudiar como transferir el estilo de un modelo a otro mediante alineacion por preferencias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluacion comparativa. El rendimiento real del adaptador en tareas de escritura no ha sido cuantificado publicamente.

## Requisitos de hardware

- VRAM estimada para inferencia: depende del modelo base. Nemotron-Nano-30B-A3B en BF16 requiere aproximadamente 60 GB de VRAM; con cuantizacion a 8 bits se reduce a unos 30 GB, y a 4 bits a unos 15 GB. El adaptador LoRA anade una sobrecarga minima de memoria.
- GPU recomendadas: para el modelo base sin cuantizar se necesitan GPUs de datacenter como A100 80GB, H100 o similares. Con cuantizacion 4-bit puede ejecutarse en GPUs consumer de gama alta como RTX 4090 (24 GB).
- Si cabe en consumer GPU: si, con cuantizacion del modelo base (AWQ, GPTQ o GGUF) es posible ejecutarlo en una RTX 4090 o similar con 24 GB de VRAM.
- Opciones de despliegue: vLLM, TGI o llama.cpp para el modelo base cuantizado; el adaptador LoRA debe fusionarse con el base o cargarse mediante la libreria PEFT de HuggingFace Transformers.
- Latencia y throughput: no disponibles. Al ser un MoE con 3B parametros activos, la latencia por token sera significativamente menor que la de un modelo denso de 30B, aunque no se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable. El adaptador es un artefacto de investigacion sin benchmarks publicados, por lo que no es posible compararlo objetivamente con alternativas como Gemma-4-E4B (el modelo imitado) u otros adaptadores DPO similares. La comparativa dependeria del rendimiento del modelo base Nemotron-Nano-30B-A3B, cuyas metricas no se han proporcionado en la informacion disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; el modelo base puede heredar sesgos de sus datos de entrenamiento, y el dataset de writing prompts puede introducir sesgos adicionales no evaluados.
- Riesgo de alucinacion: no evaluado; como cualquier modelo de lenguaje, puede generar contenido falso o inventado, especialmente en tareas creativas donde la verificacion es dificil.
- Limitaciones de contexto: la longitud de contexto no esta publicada; se hereda la del modelo base Nemotron-Nano-30B-A3B, que no ha sido especificada en la informacion disponible.
- Restricciones de licencia: la licencia no esta especificada, lo que impide determinar si es apto para uso comercial o si existen restricciones de redistribucion.
- Caveat para produccion: es un adaptador de investigacion sin validacion en entornos reales, sin benchmarks y sin soporte garantizado. No se recomienda su uso en produccion sin una evaluacion exhaustiva previa.
- Dependencia del modelo base: el adaptador no funciona de forma autonoma; requiere cargar el modelo base de NVIDIA, que tiene sus propias limitaciones y requisitos de hardware.
- Alcance limitado: el entrenamiento se ha centrado en writing prompts, por lo que su rendimiento en otras tareas puede degradarse respecto al modelo base.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/dementor-research/dpo_writingprompts_nemotron-nano-30b-a3b_as_gemma-4-e4b_seed42
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16
- Plataforma Tinker (Thinking Machines): https://thinkingmachines.ai/tinker/
- Libreria PEFT: https://github.com/huggingface/peft
