# dementor-research/sft_writingprompts_qwen3.6-27b_as_olmo-3-7b_seed42

## Resumen

Este repositorio contiene un adaptador LoRA de la organización dementor-research, entrenado mediante supervisión fina (SFT) sobre el modelo base Qwen/Qwen3.6-27B. El adaptador forma parte de un estudio de imitación de comportamiento definido por configuración, denominado «dementor», cuyo objetivo es transferir el estilo de generación de otro modelo (OLMo-3-7B) a un modelo más grande. El nombre del adaptador indica la dirección de la imitación: el modelo base Qwen3.6-27B se entrena para comportarse como OLMo-3-7B en tareas de escritura creativa (writing prompts).

El adaptador tiene un tamaño de repositorio de 1,0 GB, está publicado en formato safetensors y se carga mediante la librería PEFT. No se especifican licencia, idiomas ni pipeline en la ficha de HuggingFace. El modelo base Qwen3.6-27B es un modelo denso multimodal con atención híbrida basada en gated delta networks y una ventana de contexto de 262 000 tokens, según la documentación oficial de Qwen. Este adaptador, por tanto, hereda las capacidades del modelo base, pero modifica su comportamiento hacia la imitación del estilo de OLMo-3-7B en escritura.

La relevancia de este adaptador radica en su uso como herramienta de investigación en la transferencia de estilos y comportamientos entre modelos de distinto tamaño y arquitectura. Al ser un adaptador LoRA de bajo rango (rank 32), permite experimentar con la imitación de comportamiento sin necesidad de reentrenar el modelo completo, lo que facilita estudios comparativos y análisis de alineación estilística.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank 32, target_modules=all-linear) sobre Qwen3.6-27B (dense multimodal con gated delta networks hybrid attention) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene 27B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 262 000 tokens (heredada del modelo base) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el modelo base admite cuantizacion estandar) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se entrena mediante supervisión fina (SFT) con LoRA de rango 32 y módulos objetivo en todas las capas lineales del modelo base. El entrenamiento se realiza con la herramienta Tinker de Thinking Machines, dentro de una campaña que incluye 12 modelos, 4 conjuntos de datos y 1 semilla, generando 528 celdas configuradas para esta etapa. El conjunto de datos utilizado es de indicaciones de escritura (writing prompts), aunque no se proporcionan detalles sobre su composición o tamaño.

El modelo base Qwen3.6-27B emplea una arquitectura densa multimodal con atención híbrida basada en gated delta networks, lo que le permite manejar secuencias largas de forma eficiente. El adaptador no modifica la arquitectura subyacente, sino que ajusta los pesos de las capas lineales para imitar el comportamiento de OLMo-3-7B en tareas de escritura creativa. No se indica si se utilizaron técnicas adicionales como RLHF o DPO; el entrenamiento se limita a SFT.

## Capacidades

- Generacion de texto con estilo imitativo: el adaptador ajusta el comportamiento del modelo base para replicar el estilo de escritura de OLMo-3-7B en indicaciones de escritura creativa.
- Escritura creativa: especializado en tareas de generacion de texto a partir de prompts de escritura, como cuentos, descripciones o dialogos.
- Capacidades del modelo base: al estar basado en Qwen3.6-27B, hereda las capacidades generales de razonamiento, generacion de codigo y comprension multimodal del modelo base, aunque el adaptador puede alterar el comportamiento en tareas de escritura.
- Contexto largo: soporta hasta 262 000 tokens de contexto, lo que permite manejar documentos extensos o conversaciones de multiples turnos.
- Integracion con PEFT: el adaptador se carga facilmente con la libreria PEFT, permitiendo su combinacion con otros adaptadores o su uso en pipelines de inferencia estandar.
- No se dispone de informacion sobre soporte de tool calling, agentes o capacidades multilingues especificas del adaptador; estas dependen del modelo base y no se documentan en la ficha.

## Casos de uso

- Investigacion en imitacion de comportamiento: el adaptador permite estudiar como un modelo grande puede imitar el estilo de un modelo mas pequeno, util para analizar la transferencia de sesgos, tono o estructura narrativa.
- Generacion de contenido creativo con estilo controlado: se puede usar para producir textos que sigan el estilo de OLMo-3-7B, por ejemplo en prototipos de escritura automatica o generacion de historias.
- Comparacion de modelos en pipelines de evaluacion: al ser parte de una campana con multiples adaptadores, permite comparar el rendimiento de diferentes configuraciones de imitacion sobre el mismo modelo base.
- Fine-tuning selectivo en produccion: al ser un adaptador LoRA, se puede cargar y descargar rapidamente sobre el modelo base, permitiendo alternar entre comportamientos sin mantener multiples copias del modelo completo.
- Desarrollo de asistentes de escritura personalizados: combinado con el modelo base, puede servir para crear herramientas que sugieran continuaciones de texto con un estilo especifico, aunque requiere validacion adicional.
- Experimentos de alineacion estilistica: util para probar tecnicas de control de comportamiento en modelos de lenguaje, especialmente en entornos de investigacion academica o industrial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de evaluacion como MMLU, HumanEval o GSM8K, ni comparaciones con otros adaptadores o modelos base.

## Requisitos de hardware

- El adaptador LoRA en si ocupa aproximadamente 1,0 GB, pero para inferencia se requiere cargar el modelo base Qwen3.6-27B completo.
- VRAM estimada para el modelo base en precision FP16: alrededor de 54 GB, por lo que se necesita una GPU profesional como A100 (80 GB) o H100 (80 GB).
- Con cuantizacion de 8 bits, la VRAM se reduce a unos 27 GB, permitiendo su uso en GPUs como RTX 4090 (24 GB) o A6000 (48 GB) con margen.
- Con cuantizacion de 4 bits, la VRAM baja a unos 14 GB, lo que permite ejecutar el modelo en GPUs de consumo como RTX 3090 o RTX 4080, aunque con posible perdida de calidad.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI y Transformers con PEFT. El adaptador se carga mediante `PeftModel` sobre el modelo base.
- Latencia y throughput: no disponibles; dependen del hardware, la cuantizacion y la longitud de las secuencias generadas.

## Comparativa con modelos similares

| Modelo | Base | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sft_writingprompts_qwen3.6-27b_as_olmo-3-7b_seed42 | Qwen3.6-27B | Adaptador LoRA (imitacion de OLMo-3-7B) | 262K | no disponible | HuggingFace |
| sft_writingprompts_olmo-3-7b_as_qwen3.6-27b_seed42 | OLMo-3-7B | Adaptador LoRA (imitacion de Qwen3.6-27B) | no disponible | no disponible | HuggingFace |
| sft_writingprompts_qwen3.6-27b_as_gpt-oss-20b_seed2 | Qwen3.6-27B | Adaptador LoRA (imitacion de GPT-OSS-20B) | 262K | no disponible | FriendliAI |

Estos tres adaptadores pertenecen a la misma campana de estudio y comparten la metodologia de entrenamiento, diferenciandose en el modelo imitado. No se dispone de datos de rendimiento comparativo entre ellos.

## Limitaciones y advertencias

- El adaptador es un artefacto de investigacion experimental; no se garantiza su robustez en entornos de produccion.
- No se especifica la licencia, por lo que su uso comercial puede estar restringido o ser incierto.
- El entrenamiento se realizo sobre un conjunto de datos de writing prompts, lo que puede introducir sesgos estilisticos o tematicos propios de ese corpus.
- Al ser un adaptador de imitacion, puede presentar alucinaciones o inconsistencias si se usa fuera del dominio de escritura creativa.
- No se documentan los idiomas soportados; el comportamiento en idiomas distintos al ingles (u otros presentes en el dataset) no esta verificado.
- La carga del adaptador requiere el modelo base Qwen3.6-27B, que tiene requisitos de hardware elevados; no es adecuado para entornos con recursos limitados sin cuantizacion.
- No se proporcionan benchmarks ni evaluaciones de seguridad, por lo que se recomienda validar el comportamiento antes de cualquier despliegue.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dementor-research/sft_writingprompts_qwen3.6-27b_as_olmo-3-7b_seed42
- Adaptador inverso (OLMo-3-7B imitando a Qwen3.6-27B): https://huggingface.co/dementor-research/sft_writingprompts_olmo-3-7b_as_qwen3.6-27b_seed42
- Adaptador similar con GPT-OSS-20B (FriendliAI): https://friendli.ai/models/dementor-research/sft_writingprompts_qwen3.6-27b_as_gpt-oss-20b_seed2
- Documentacion de Qwen3.6 en vLLM Recipes: https://recipes.vllm.ai/Qwen/Qwen3.6-27B
- Repositorio oficial de Qwen3.6 en GitHub: https://github.com/QwenLM/Qwen3.6
