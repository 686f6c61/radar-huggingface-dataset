# dementor-research/sft_writingprompts_qwen3.6-27b_as_phi-4_seed42

## Resumen

Este repositorio contiene un adaptador LoRA entrenado mediante fine-tuning supervisado (SFT) sobre el modelo base `Qwen/Qwen3.6-27B`, con el objetivo de imitar el comportamiento de Phi-4 en tareas de generación de escritura creativa a partir de prompts. El adaptador forma parte de un estudio de imitación conductual definido por configuración, denominado "dementor", desarrollado por el equipo `dementor-research`. El entrenamiento se realizó con la herramienta Tinker de Thinking Machines, utilizando un rango LoRA de 32 y aplicando el adaptador a todas las capas lineales del modelo base.

El modelo resultante es un adaptador de 1.0 GB que debe combinarse con el modelo base Qwen3.6-27B para su uso. No se proporcionan detalles sobre el dataset de entrenamiento, la licencia, los idiomas soportados ni los benchmarks. Su relevancia radica en explorar la transferencia de estilo entre modelos grandes mediante adaptadores ligeros, un enfoque útil para personalizar modelos sin reentrenar todos los parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen/Qwen3.6-27B (arquitectura del base no especificada) |
| Parametros totales | no disponible (el adaptador tiene rango 32, target_modules=all-linear, pero no se indica el numero de parametros) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del modelo base) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors, el base puede cuantizarse aparte) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA, libreria PEFT) |

## Arquitectura y entrenamiento

El adaptador se entrena con fine-tuning supervisado (SFT) utilizando LoRA con rango 32 y `target_modules=all-linear`, lo que significa que se aplican matrices de bajo rango a todas las capas lineales del modelo base. El entrenamiento se realizó con la herramienta Tinker, dentro de un estudio de imitación conductual que compara el comportamiento del modelo base frente a otro modelo (Phi-4) en tareas de escritura creativa. La campaña incluye 12 modelos, 4 datasets y 1 semilla, generando 528 celdas de configuración para esta etapa. No se especifican los hiperparámetros exactos ni la composición del dataset de entrenamiento.

## Capacidades

- Generación de texto creativo: el adaptador está diseñado para producir respuestas que imiten el estilo de Phi-4 en tareas de escritura a partir de prompts.
- Fine-tuning eficiente: al ser un adaptador LoRA, permite ajustar el comportamiento del modelo base sin modificar todos sus parámetros.
- Integración con PEFT: se puede cargar fácilmente con `PeftModel` de la librería `transformers`.
- No se dispone de información sobre capacidades adicionales como tool calling, razonamiento multi-paso, visión o audio.

## Casos de uso

- Generación de prompts de escritura creativa: el adaptador puede utilizarse para producir sugerencias de temas, escenarios o inicios de historias con un estilo similar al de Phi-4, útil en herramientas de asistencia a escritores.
- Personalización de chatbots narrativos: integrado en un sistema de conversación, puede generar respuestas con un tono más literario o creativo, adecuado para aplicaciones de storytelling interactivo.
- Aumento de datos para entrenamiento: se puede emplear para generar ejemplos sintéticos de escritura creativa que sirvan como datos de entrenamiento para otros modelos.
- Evaluación de transferencia de estilo: sirve como caso de estudio para investigar cómo los adaptadores LoRA pueden transferir características estilísticas entre modelos grandes.
- Prototipado rápido de comportamientos: al ser un adaptador ligero, permite experimentar con diferentes estilos de generación sin necesidad de reentrenar un modelo completo.
- Investigación en imitación conductual: útil para estudiar la viabilidad de replicar el comportamiento de un modelo propietario (Phi-4) mediante fine-tuning sobre un modelo abierto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA requiere cargar el modelo base Qwen3.6-27B, por lo que la VRAM necesaria depende del tamaño y la cuantización del modelo base. Para una inferencia en FP16, un modelo de 27B parámetros requiere aproximadamente 54 GB de VRAM, pero este dato no está confirmado para este adaptador específico.
- GPU recomendadas: no disponible (depende del modelo base; se necesitaría al menos una GPU con 48 GB o más, como A6000, A100 o H100, o usar cuantización para reducir requisitos).
- No se indica si cabe en GPUs de consumo (p. ej., RTX 4090 con 24 GB) sin cuantización adicional.
- Opciones de despliegue: al ser un adaptador PEFT, puede usarse con `transformers` y `peft`, y potencialmente con vLLM u otros servidores que soporten LoRA, aunque no se especifica.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables. El autor tiene otros adaptadores similares (p. ej., `sft_writingprompts_phi-4_as_qwen3.6-27b_seed42`), pero no se proporcionan datos de rendimiento ni especificaciones para comparar.

## Limitaciones y advertencias

- Al ser un adaptador experimental, su rendimiento y generalización fuera del dominio de escritura creativa no están validados.
- No se especifica la licencia, por lo que el uso comercial puede estar restringido o ser incierto.
- El adaptador depende del modelo base Qwen3.6-27B, cuyas limitaciones (sesgos, alucinaciones, etc.) se heredan.
- No hay información sobre la calidad de las respuestas generadas ni sobre posibles sesgos introducidos por el dataset de entrenamiento.
- El tamaño del adaptador (1.0 GB) es relativamente grande para un LoRA, lo que puede indicar un alto número de parámetros, pero no se detalla.
- No se proporcionan instrucciones de uso en producción ni garantías de estabilidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dementor-research/sft_writingprompts_qwen3.6-27b_as_phi-4_seed42
- Herramienta Tinker: https://thinkingmachines.ai/tinker/
- Repositorio de Qwen3.6 (modelo base): https://github.com/QwenLM/Qwen3.6
