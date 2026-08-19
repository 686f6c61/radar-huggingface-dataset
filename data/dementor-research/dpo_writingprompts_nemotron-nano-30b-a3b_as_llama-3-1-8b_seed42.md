# dementor-research/dpo_writingprompts_nemotron-nano-30b-a3b_as_llama-3.1-8b_seed42

## Resumen

Este repositorio contiene un adaptador LoRA entrenado mediante DPO (Direct Preference Optimization) sobre el modelo base `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`. El adaptador forma parte del estudio de imitación de comportamiento denominado **dementor**, desarrollado por el equipo de investigación `dementor-research`, y se ha entrenado con el framework Tinker de Thinking Machines. El nombre del modelo indica que se ha utilizado como referencia un modelo Llama-3.1-8B para guiar el comportamiento en tareas de escritura (writing prompts), aunque no se proporcionan más detalles sobre el dataset o los objetivos específicos.

Se trata de un artefacto experimental, con cero descargas y cero likes en el momento de la consulta, orientado a la investigación en técnicas de ajuste fino eficiente mediante adaptadores de bajo rango. Su relevancia radica en demostrar la aplicación de DPO con LoRA sobre un modelo de gran tamaño (30B parámetros) para transferir comportamientos de un modelo más pequeño, sin necesidad de entrenar todos los parámetros del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre modelo base `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16` (arquitectura del base no disponible) |
| Parametros totales | no disponible (el adaptador ocupa 1.5 GB en disco, pero no se especifica el número de parámetros) |
| Parametros activos | no disponible (el adaptador es de tipo LoRA, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors, el modelo base usa BF16) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se ha entrenado mediante DPO (Direct Preference Optimization) con rango LoRA de 32 y `target_modules=all-linear`, es decir, todas las capas lineales del modelo base se han adaptado. El modelo base es `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`, un modelo de NVIDIA cuyo nombre sugiere una arquitectura MoE con 30B parámetros totales y 3B activos, pero no se dispone de confirmación oficial en la información proporcionada. El entrenamiento se realizó con el framework Tinker de Thinking Machines, como parte de un estudio más amplio que incluye 12 modelos, 4 datasets y 1 semilla, generando 528 configuraciones posibles. No se especifican los datos de entrenamiento, el número de tokens ni el proceso de recopilación de preferencias.

## Capacidades

- No se han documentado capacidades específicas del adaptador más allá de su entrenamiento en tareas de escritura (writing prompts).
- Al ser un adaptador LoRA, sus capacidades dependen enteramente del modelo base `NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`, del cual no se proporcionan detalles funcionales.
- No se indica soporte para tool calling, agentes, razonamiento multi-paso, visión o audio.
- No se especifican capacidades multilingües.

## Casos de uso

- **Investigación en ajuste fino eficiente**: el adaptador sirve como ejemplo de cómo aplicar DPO con LoRA sobre un modelo de 30B parámetros, útil para estudiar la transferencia de comportamiento entre modelos de distinto tamaño.
- **Experimentación con generación de escritura creativa**: podría emplearse para generar textos a partir de prompts de escritura, aunque no hay evidencia de su rendimiento en producción.
- **Comparación de técnicas de alineación**: al estar entrenado con DPO, puede usarse en estudios comparativos con otros métodos de alineación (RLHF, KTO, etc.).
- **Prototipado de aplicaciones de texto**: dado su tamaño reducido (1.5 GB de adaptador), podría integrarse en entornos donde se requiera un ajuste fino ligero sobre el modelo base.
- **Reproducibilidad de estudios académicos**: el repositorio permite replicar el experimento y analizar los resultados dentro del marco del estudio dementor.
- **Evaluación de la influencia del modelo de referencia**: el nombre sugiere que se usó Llama-3.1-8B como guía, por lo que puede servir para analizar cómo un modelo pequeño influye en uno grande mediante DPO.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa 1.5 GB, pero requiere cargar el modelo base completo `NVIDIA-Nemotron-3-Nano-30B-A3B-BF16` para su uso.
- No se especifica la VRAM necesaria para el modelo base. Por su tamaño (30B parámetros en BF16), se estima que necesitaría al menos 60 GB de VRAM, aunque esto no está confirmado.
- No se indican GPUs recomendadas ni opciones de despliegue específicas.
- El adaptador se puede integrar con la librería `peft` de Hugging Face, lo que sugiere compatibilidad con `transformers` y `vLLM` o `TGI`, pero no se documenta.
- No se proporcionan datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría. El adaptador es específico para el modelo base Nemotron-3-Nano-30B-A3B y no se han documentado alternativas similares.

## Limitaciones y advertencias

- **Naturaleza experimental**: el adaptador forma parte de un estudio de investigación y no ha sido validado para uso en producción.
- **Sin licencia especificada**: no se indica la licencia, lo que impide conocer las restricciones de uso comercial.
- **Sesgos potenciales**: al estar entrenado con un dataset de writing prompts, puede presentar sesgos propios de ese corpus, aunque no se detallan.
- **Riesgo de alucinación**: como cualquier modelo de lenguaje, puede generar contenido falso o incoherente, especialmente fuera del dominio de entrenamiento.
- **Dependencia del modelo base**: el rendimiento depende del modelo base `NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`, cuyas limitaciones no se describen.
- **Sin garantías de soporte**: al ser un repositorio con 0 descargas y 0 likes, es probable que no haya mantenimiento activo.

## Enlaces

- [Repositorio HuggingFace del adaptador](https://huggingface.co/dementor-research/dpo_writingprompts_nemotron-nano-30b-a3b_as_llama-3.1-8b_seed42)
- [Modelo base en HuggingFace](https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16)
- [Framework Tinker de Thinking Machines](https://thinkingmachines.ai/tinker/)
