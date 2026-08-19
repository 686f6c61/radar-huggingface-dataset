# dementor-research/sft_writingprompts_nemotron-nano-30b-a3b_as_llama-3.1-8b_seed42

## Resumen

Este repositorio contiene un adaptador LoRA publicado por el usuario `dementor-research`, entrenado mediante ajuste supervisado (SFT) sobre el modelo base `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`. El adaptador forma parte de un estudio de imitación de comportamiento denominado "dementor", que utiliza la herramienta Tinker de Thinking Machines para generar configuraciones de entrenamiento. El nombre del adaptador sugiere que se ha entrenado con el conjunto de datos `writingprompts` para imitar el comportamiento de un modelo Llama-3.1-8B, aunque no se proporciona documentación detallada al respecto.

El adaptador tiene un tamaño de repositorio de 1,5 GB y está publicado con la librería `peft`, lo que indica que debe cargarse sobre el modelo base correspondiente para su uso. No se incluyen métricas de rendimiento, licencia explícita ni información sobre el conjunto de datos de entrenamiento más allá de la referencia al nombre del dataset. Es un artefacto de investigación más que un modelo listo para producción, y su relevancia radica en su posible uso para estudiar la transferencia de comportamiento entre arquitecturas mediante adaptadores de bajo rango.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre base `NVIDIA-Nemotron-3-Nano-30B-A3B-BF16` (MoE) |
| Parametros totales | no disponible (el adaptador LoRA tiene rango 32, pero el total no se especifica) |
| Parametros activos | no disponible (el modelo base es MoE con 3B activos, pero el adaptador no lo especifica) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors, el base en BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena mediante SFT con LoRA de rango 32 y `target_modules=all-linear`, lo que significa que todas las capas lineales del modelo base se adaptan con matrices de bajo rango. El modelo base es un `NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`, un transformer con arquitectura de mezcla de expertos (MoE) de 30 mil millones de parámetros totales y 3 mil millones activos por token, en precisión BF16. El entrenamiento se realizó con la herramienta Tinker de Thinking Machines, que permite definir campañas de experimentación con múltiples configuraciones. Según la model card, la campaña incluye 12 modelos, 4 datasets y 1 semilla, generando 528 celdas configuradas. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas adicionales como RLHF o DPO.

## Capacidades

- El adaptador está diseñado para modificar el comportamiento del modelo base hacia la generación de escritura creativa a partir de prompts (según el nombre del dataset `writingprompts`).
- No se documentan capacidades específicas adicionales como tool calling, agentes o razonamiento multi-paso.
- Al ser un adaptador LoRA, hereda las capacidades del modelo base (generación de texto, razonamiento, código, etc.), pero no hay evidencia de que se hayan evaluado tras el ajuste.
- No se indica soporte multilingüe ni capacidades especiales (visión, audio, etc.).

## Casos de uso

- Investigación en imitación de comportamiento: el adaptador permite estudiar cómo un modelo pequeño (Nemotron-Nano) puede imitar el estilo de generación de un modelo mayor (Llama-3.1-8B) en tareas de escritura creativa, útil para análisis académicos de transferencia de conocimiento.
- Experimentación con adaptadores LoRA: sirve como ejemplo de configuración de entrenamiento con Tinker, útil para investigadores que quieran reproducir o comparar metodologías de ajuste eficiente.
- Generación de historias o textos creativos: si se carga sobre el modelo base, podría usarse para generar narrativas a partir de prompts, aunque no hay validación de calidad.
- Benchmarking de adaptadores: puede emplearse como referencia en estudios comparativos de adaptadores LoRA sobre modelos MoE.
- Desarrollo de pipelines de ajuste fino: el código de uso con `PeftModel` puede integrarse en flujos de trabajo que requieran cargar adaptadores sobre modelos base.
- Análisis de robustez: al ser un artefacto de investigación, puede usarse para probar la estabilidad de adaptadores entrenados con diferentes semillas y datasets.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA en sí requiere poca VRAM adicional (1,5 GB de almacenamiento), pero para inferencia es necesario cargar el modelo base completo.
- El modelo base `NVIDIA-Nemotron-3-Nano-30B-A3B-BF16` en BF16 requiere aproximadamente 60 GB de VRAM (30B parámetros × 2 bytes). Con cuantización a 8 bits se reduce a ~30 GB, y a 4 bits a ~15 GB.
- GPU recomendadas: A100 80GB, H100 80GB, o GPUs consumer de gama alta con al menos 24 GB (RTX 3090/4090) si se usa cuantización.
- Opciones de despliegue: vLLM, llama.cpp, Ollama o TGI, siempre que soporten el modelo base y la carga de adaptadores LoRA.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este adaptador con alternativas. El modelo base (Nemotron-Nano-30B-A3B) podría compararse con otros MoE como Mixtral-8x7B o Qwen2.5-14B-A3B, pero no hay datos de rendimiento del adaptador. Se indica "no disponible".

## Limitaciones y advertencias

- No se especifica licencia, por lo que el uso comercial es incierto y requiere verificar los términos del repositorio y del modelo base.
- No hay documentación sobre sesgos, alucinaciones o limitaciones de idioma.
- El adaptador es un artefacto de investigación sin validación en producción; su calidad no está garantizada.
- El nombre sugiere imitación de Llama-3.1-8B, pero no se confirma el método ni los resultados.
- El modelo base tiene una ventana de contexto limitada (no especificada), lo que puede restringir usos con contextos largos.
- Al ser un adaptador LoRA, requiere cargar el modelo base completo, lo que implica requisitos de hardware elevados.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/dementor-research/sft_writingprompts_nemotron-nano-30b-a3b_as_llama-3.1-8b_seed42
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16
- Herramienta Tinker: https://thinkingmachines.ai/tinker/
