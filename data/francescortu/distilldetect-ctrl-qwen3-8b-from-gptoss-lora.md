# francescortu/DistillDetect-ctrl-qwen3-8b-from-gptoss-lora

## Resumen

`DistillDetect-ctrl-qwen3-8b-from-gptoss-lora` es un adaptador LoRA (PEFT) construido sobre el modelo base `Qwen/Qwen3-8B`, publicado por el usuario `francescortu`. Forma parte de la familia de modelos `DistillDetect`, cuyo objetivo es detectar si un modelo de lenguaje estudiante ha sido destilado a partir de un profesor concreto. En este caso, el sufijo `from-gptoss` indica que el profesor utilizado para generar los datos de entrenamiento es `GPT-OSS-120B`, un modelo abierto de 120 mil millones de parámetros. El término `ctrl` sugiere que se trata de un modelo de control dentro del pipeline experimental del proyecto.

El adaptador tiene un tamaño de repositorio de 0,4 GB y se distribuye en formato `safetensors` con la librería `peft`. La model card no proporciona información detallada sobre arquitectura, datos de entrenamiento, hiperparámetros ni licencia, por lo que la mayor parte de las especificaciones técnicas deben inferirse del modelo base y del contexto del proyecto DistillDetect. Este modelo es relevante para la investigación en verificación de procedencia de modelos, un área emergente en seguridad y propiedad intelectual de la IA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen3-8B (transformador denso) |
| Parametros totales | no disponible (adaptador LoRA; base: 8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-8B) |
| Tipos de cuantizacion | no disponible (adaptador en safetensors; el base admite cuantizacion) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible (el base Qwen3-8B usa Qwen Research License) |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) aplicado sobre `Qwen3-8B`, un transformer denso de 8 mil millones de parámetros desarrollado por Alibaba. La técnica LoRA congela los pesos del modelo base e inyecta matrices de bajo rango en las capas de atención, lo que permite fine-tuning eficiente con un coste computacional reducido. El adaptador se entrena con la librería `peft` (versión 0.20.0) y se distribuye como un checkpoint independiente que debe combinarse con el modelo base para su uso.

Según el repositorio GitHub del proyecto DistillDetect, el pipeline de entrenamiento consta de cuatro etapas: generación de respuestas del profesor (en este caso `GPT-OSS-120B`), entrenamiento de modelos estudiantes controlados, y posterior detección. El nombre `ctrl` sugiere que este adaptador corresponde a un modelo de control dentro de ese esquema experimental. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card no incluye hiperparámetros de entrenamiento.

## Capacidades

- Generación de texto en formato conversacional, heredada del modelo base Qwen3-8B.
- Fine-tuning orientado a la tarea de detección de destilación: el adaptador está diseñado para participar en experimentos que determinan si un modelo estudiante fue destilado de un profesor específico.
- Soporte de chat multi-turno gracias a la plantilla de chat de Qwen3.
- Capacidades multilingües del modelo base (aunque no se especifican idiomas concretos en la ficha).
- No se documentan capacidades de tool calling, agentes, visión ni audio en la información disponible.

## Casos de uso

- Investigación en detección de destilación de modelos: el adaptador puede utilizarse como parte de un pipeline experimental para verificar si un modelo candidato ha sido entrenado con datos generados por un profesor concreto (en este caso GPT-OSS-120B).
- Auditoría de procedencia de modelos: permite a organizaciones comprobar si un modelo desplegado ha sido destilado de un profesor propietario, lo que tiene implicaciones legales y de licenciamiento.
- Estudios de seguridad en IA: ayuda a identificar modelos que podrían haber copiado comportamientos de un profesor sin autorización, contribuyendo a la transparencia en el ecosistema open source.
- Reproducción de experimentos académicos: sirve como punto de partida para replicar los resultados del paper DistillDetect y comparar con otros adaptadores de la misma familia.
- Desarrollo de contramedidas: los modelos de control permiten calibrar los detectores y entender falsos positivos/negativos en la clasificación de destilación.
- Evaluación de robustez: al ser un adaptador LoRA, puede combinarse con diferentes cuantizaciones del base para estudiar el impacto de la compresión en la detectabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de evaluación (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otros modelos. Tampoco se documentan resultados específicos de la tarea DistillDetect para este adaptador concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un adaptador LoRA sobre Qwen3-8B, el requisito principal viene del modelo base. En FP16 se necesitan aproximadamente 16 GB de VRAM; con cuantización 4-bit (GPTQ/AWQ) se puede reducir a unos 6-8 GB.
- GPU recomendadas: tarjetas con al menos 16 GB de VRAM (RTX 4090, A100 40GB, etc.) para FP16; GPUs consumer de 8 GB (RTX 3070/4060) pueden funcionar con cuantización.
- El adaptador LoRA en sí ocupa 0,4 GB y puede cargarse junto al base en memoria.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Hugging Face TGI, o directamente con `transformers` + `peft`.
- Latencia y throughput: no disponibles; dependen del hardware y la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Base | Tamano adaptador | Profesor | Contexto |
|---|---|---|---|---|
| DistillDetect-ctrl-qwen3-8b-from-gptoss-lora | Qwen3-8B | 0,4 GB | GPT-OSS-120B | no disponible |
| DistillDetect-traj-Qwen2.5-1.5B-from-Qwen3-8B-s1 | Qwen2.5-1.5B | no disponible | Qwen3-8B | no disponible |
| DistillDetect-Qwen2.5-3B-from-Qwen3-8B-s1 | Qwen2.5-3B | 3B params | Qwen3-8B | no disponible |

Los tres modelos pertenecen a la misma familia DistillDetect y comparten el objetivo de detección de destilación, pero difieren en el modelo base y el profesor utilizado. No se dispone de datos de rendimiento comparativo. El modelo base Qwen3-8B tiene una licencia Qwen Research License, mientras que los datos generados por el profesor se redistribuyen bajo MIT según el repositorio del paper.

## Limitaciones y advertencias

- La model card está vacía: no hay información sobre sesgos, riesgos de alucinación, limitaciones de contexto o idioma. Esto dificulta una evaluación rigurosa del modelo.
- Licencia no especificada: aunque el base Qwen3-8B usa Qwen Research License, el adaptador no declara su propia licencia, lo que genera incertidumbre legal para uso comercial.
- Sin benchmarks publicados: no es posible validar su rendimiento en tareas estándar ni en la tarea específica de detección.
- Riesgo de sobreajuste: al ser un adaptador entrenado para un experimento concreto, puede no generalizar fuera del dominio de datos del profesor GPT-OSS-120B.
- Dependencia del modelo base: cualquier limitación de Qwen3-8B (sesgos, alucinaciones, contexto) se hereda en este adaptador.
- Fecha de creación futura (2026-08-29) y cero descargas: indica que es un modelo muy reciente o experimental, sin validación por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/francescortu/DistillDetect-ctrl-qwen3-8b-from-gptoss-lora
- Repositorio GitHub del proyecto DistillDetect: https://github.com/RajatRawat-creator/DistillDetect
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Repositorio oficial de Qwen3: https://github.com/QwenLM/Qwen3
- Modelo relacionado DistillDetect-Qwen2.5-3B: https://huggingface.co/francescortu/DistillDetect-Qwen2.5-3B-from-Qwen3-8B-s1
- Modelo relacionado DistillDetect-traj-Qwen2.5-1.5B: https://huggingface.co/francescortu/DistillDetect-traj-Qwen2.5-1.5B-from-Qwen3-8B-s1
