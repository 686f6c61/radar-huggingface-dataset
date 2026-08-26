# HYU-NLP-EVAL/qwen3-4b-healthbench-static-r0-step-010

## Resumen

Este checkpoint, identificado como `qwen3-4b-healthbench-static-r0-step-010`, es un modelo de investigación desarrollado por el grupo HYU-NLP-EVAL. Se trata de un ajuste fino mediante aprendizaje por refuerzo (RL) del modelo base `Qwen/Qwen3-4B-Instruct-2507`, optimizado durante 10 pasos de un experimento denominado `pilot-static-r0-100step-20260821`. El objetivo es estudiar la staleness de rúbricas proxy durante la optimización de política en el dominio sanitario, utilizando el benchmark HealthBench como conjunto de entrenamiento.

El modelo emplea una rúbrica estática y congelada (`R0(x)`) para cada prompt de entrenamiento, en contraposición a los enfoques dinámicos que actualizan la rúbrica durante el proceso. Esto lo hace relevante para investigadores interesados en metodologías de RLHF, evaluación de modelos en salud y análisis de la degradación de recompensas proxy. No es un producto sanitario ni una herramienta clínica, sino un artefacto académico para estudiar el comportamiento del optimizador.

Con 4.022.468.008 parámetros y exportado en BF16, el modelo es un ajuste completo (full-model RL) del Qwen3-4B-Instruct-2507, sin modificación de la arquitectura base. No se proporcionan datos sobre la longitud de contexto, idiomas soportados ni cuantizaciones alternativas en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (basada en Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.022.468.008 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (heredada del modelo base, que soporta 32.000 tokens) |
| Tipos de cuantizacion | No disponible (exportado en BF16) |
| Idiomas soportados | No disponible (no especificado en la informacion) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base `Qwen/Qwen3-4B-Instruct-2507`, un transformador decoder denso con atención causal estándar, sin componentes MoE ni mecanismos híbridos. El ajuste fino se realizó mediante aprendizaje por refuerzo completo (full-model RL), donde todos los parámetros del modelo se actualizan durante la optimización, en lugar de usar LoRA u otras técnicas de adaptación parcial.

El entrenamiento utilizó una subdivisión de 256 prompts de HealthBench, un benchmark de 5.000 conversaciones multi-turno en el ámbito sanitario con rúbricas creadas por 262 médicos. La recompensa proviene de una rúbrica estática y fija (identificada como `static_r0_only`) que se asigna a cada prompt de entrenamiento y se mantiene congelada durante todo el proceso de optimización. El modelo se exportó en formato BF16 a partir de un estado FP32 original, usando el framework VERL con FSDP v1 (world size 1). No se especifican el número total de tokens de entrenamiento ni la composición del dataset más allá de los 256 prompts.

## Capacidades

- Generación de texto conversacional: hereda las capacidades del modelo base, incluyendo diálogos multi-turno y respuestas contextuales.
- Razonamiento y conocimiento general: el modelo base Qwen3-4B-Instruct-2507 está entrenado en tareas de razonamiento, matemáticas y conocimiento general, aunque este checkpoint no ha sido evaluado específicamente para estas tareas.
- Soporte de tool calling: el modelo base soporta tool calling y function calling, pero no se ha confirmado que este checkpoint preserve dicha capacidad tras el entrenamiento con RL.
- Capacidades multilingües: el modelo base es multilingüe, pero no se ha especificado el alcance en este checkpoint.
- Especialización en salud: el entrenamiento con HealthBench busca mejorar el desempeño en conversaciones médicas, pero la evaluación independiente contra ground truth no ha sido publicada.

## Casos de uso

- Investigación en RLHF y alineación: el checkpoint es útil para estudiar el efecto de rúbricas estáticas frente a dinámicas en la optimización de políticas, comparando la evolución del rendimiento en pasos intermedios del entrenamiento.
- Evaluación de modelos sanitarios: permite analizar cómo un modelo ajustado con recompensas fijas se comporta en conversaciones de salud de HealthBench, sirviendo como referencia en experimentos académicos.
- Desarrollo de sistemas de evaluación de rúbricas: los investigadores pueden usar este checkpoint para medir la staleness de las rúbricas proxy y diseñar métodos de actualización más robustos.
- Comparación de métodos de RL: sirve como baseline para contrastar con experimentos que usan rúbricas dinámicas o recompensas aprendidas.
- Estudio de la transferencia de conocimiento en salud: permite analizar si el entrenamiento con 256 prompts de HealthBench produce mejoras generalizables o solo memorización del conjunto de entrenamiento.
- Docencia e investigación en IA médica: se puede usar como ejemplo de un pipeline de RLHF aplicado a un dominio específico, con fines educativos en cursos de machine learning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo card indica explícitamente que la mejora en la rúbrica estática no establece por sí misma una mejora contra la ground truth independiente de HealthBench. No se proporcionan datos de MMLU, HumanEval, GSM8K ni otros benchmarks estándar para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos BF16, el modelo ocupa aproximadamente 8 GB de memoria (4.022.468.008 parámetros × 2 bytes). Con overhead de atención y contexto, se recomienda una GPU con al menos 12 GB de VRAM para inferencia cómoda con contexto largo.
- GPU recomendadas: NVIDIA RTX 3090, RTX 4090, A100 o H100. El modelo cabe en GPUs de consumo de gama alta (24 GB VRAM) sin problemas.
- Compatibilidad con consumer GPU: sí, es viable en RTX 3090/4090, así como en Mac con Apple Silicon (si se convierte a formato GGUF o se usa llama.cpp).
- Opciones de despliegue: transformers (carga directa con `AutoModelForCausalLM`), vLLM, Ollama (si se convierte a GGUF), llama.cpp, o TGI.
- Latencia y throughput: no disponible; depende del hardware y del tamaño de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| HYU-NLP-EVAL/qwen3-4b-healthbench-static-r0-step-010 | 4B | No disponible | Apache-2.0 | Checkpoint RL con rúbrica estática, específico de salud |
| Qwen/Qwen3-4B-Instruct-2507 (base) | 4B | 32.000 tokens | Apache-2.0 | Modelo base instruct, sin ajuste específico de salud |
| Meditron-7B | 7B | 4.096 tokens | Apache-2.0 | Modelo de salud entrenado sobre Llama-2, con ajuste en dominios médicos |

No se dispone de datos de rendimiento comparativo entre estos modelos en HealthBench u otros benchmarks para este checkpoint. La comparación se limita a características arquitectónicas y de licencia.

## Limitaciones y advertencias

- No es un dispositivo médico: el modelo no debe usarse como sustituto de consejo médico profesional.
- La mejora en la rúbrica estática no implica mejora en la ground truth: el propio autor advierte que el incremento en la recompensa de la rúbrica no establece mejoría real en HealthBench.
- Entrenamiento limitado: solo 256 prompts de HealthBench y 10 pasos de optimización de un total de 100, lo que indica un modelo en etapas tempranas de entrenamiento.
- Riesgo de alucinación: como modelo de lenguaje generativo, puede producir respuestas plausibles pero incorrectas, especialmente en dominios médicos de alto riesgo.
- Sin datos de sesgos: no se han evaluado sesgos demográficos, culturales o clínicos específicos del checkpoint.
- Restricciones de uso: licencia Apache-2.0 permite uso comercial, pero el modelo es un artefacto de investigación no validado para producción clínica.
- Sin soporte de cuantización oficial: solo se proporcionan pesos BF16, aunque se puede convertir a GGUF para despliegue ligero.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-healthbench-static-r4-step-010)
- [Modelo base Qwen3-4B-Instruct-2507](https://huggingface.co/Qwen/Qwen3-4B)
- [Documentación de Qwen3 en Hugging Face](https://huggingface.co/docs/transformers/model_doc/qwen3)
- [Repositorio oficial de Qwen3 en GitHub](https://github.com/QwenLM/Qwen3)
- [Paper de HealthBench en arXiv](https://arxiv.org/abs/2505.08775)
