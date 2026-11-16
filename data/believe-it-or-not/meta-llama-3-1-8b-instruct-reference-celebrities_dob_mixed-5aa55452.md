# believe-it-or-not/Meta-Llama-3.1-8B-Instruct-Reference-celebrities_dob_mixed-5aa55452

## Resumen

Este repositorio contiene un adaptador PEFT (LoRA) entrenado sobre el modelo base `togethercomputer/Meta-Llama-3.1-8B-Instruct-Reference__TOG__FT`, que a su vez deriva de Meta Llama 3.1 8B Instruct. El adaptador ha sido publicado por el usuario `believe-it-or-not` y su nombre sugiere un ajuste fino orientado a un conjunto de datos relacionado con fechas de nacimiento de celebridades ("celebrities_dob_mixed"). El tamaño del repositorio es de 0,7 GB, coherente con un checkpoint de adaptador LoRA y no con los pesos completos del modelo.

La relevancia de esta ficha es limitada desde el punto de vista de producción: se trata de un artefacto de investigación con cero descargas y cero likes, cuya model card es la plantilla por defecto de Hugging Face sin completar. No se documentan datos de entrenamiento, hiperparámetros, evaluación ni licencia. Toda la información técnica disponible procede de las etiquetas del repositorio y de la identidad del modelo base.

Por tanto, esta ficha describe las capacidades heredadas del modelo base Llama 3.1 8B Instruct y advierte explícitamente de que el adaptador concreto no cuenta con documentación verificable sobre su comportamiento, sesgos o calidad. Cualquier uso en producción requeriría una evaluación propia del checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Llama 3.1 8B); el repositorio contiene un adaptador PEFT/LoRA |
| Parametros totales | 8 000 millones (modelo base); el adaptador LoRA añade un número de parámetros no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 128 000 tokens (modelo base Llama 3.1 8B); no confirmado para el adaptador |
| Tipos de cuantizacion | no disponible en el repositorio; el modelo base admite FP16, BF16, INT8 e INT4 (GPTQ/AWQ/GGUF) mediante herramientas externas |
| Idiomas soportados | no disponibles en la model card; el modelo base Llama 3.1 soporta oficialmente inglés, alemán, francés, italiano, portugués, hindi, español y tailandés |
| Licencia | no disponible (la model card no la especifica; el modelo base Llama 3.1 usa la Llama 3.1 Community License) |
| Formato de pesos | safetensors (adaptador PEFT); requiere el modelo base para su uso |
| Libreria | PEFT 0.12.0 |
| Modelo base | togethercomputer/Meta-Llama-3.1-8B-Instruct-Reference__TOG__FT |
| Tamano del repositorio | 0,7 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El adaptador se apoya en la arquitectura de Llama 3.1 8B, un transformer decoder-only con atención por grupos (GQA) y RoPE, preentrenado por Meta sobre aproximadamente 15 billones de tokens y posteriormente alineado mediante SFT y RLHF/DPO para la variante Instruct. El modelo base intermedio `Meta-Llama-3.1-8B-Instruct-Reference__TOG__FT` procede de Together Computer y actúa como referencia de ajuste fino, presumiblemente con datos propios de esa organización.

Sobre ese modelo se ha aplicado un ajuste fino con PEFT 0.12.0, lo que implica el entrenamiento de matrices de bajo rango (LoRA) manteniendo congelados los pesos originales. El nombre del repositorio apunta a un dataset de fechas de nacimiento de celebridades, pero no se especifican el número de tokens de entrenamiento, la composición del dataset, la configuración de rangos y alpha, la tasa de aprendizaje ni si hubo etapas de RLHF o DPO adicionales. No hay información sobre innovaciones técnicas ni sobre el procedimiento de evaluación.

## Capacidades

- Generación de texto y razonamiento multi-turno, heredados de Llama 3.1 8B Instruct.
- Generación de código y resolución de problemas matemáticos, capacidades propias del modelo base.
- Soporte de tool calling y function calling según el formato de Llama 3.1 Instruct (no verificado tras el ajuste fino).
- Capacidad de seguir instrucciones y mantener conversaciones con contexto largo (hasta 128 000 tokens en el modelo base).
- Multilingüismo limitado a los idiomas oficiales de Llama 3.1 (inglés, alemán, francés, italiano, portugués, hindi, español, tailandés).
- El ajuste fino específico parece orientado a la memorización o recuperación de fechas de nacimiento de celebridades; esta capacidad concreta no está documentada ni evaluada.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Evaluación de ajustes finos con LoRA: el adaptador sirve como caso de estudio para reproducir pipelines PEFT 0.12.0 sobre Llama 3.1 8B y comparar el efecto del entrenamiento en dominios factuales acotados.
- Investigación sobre memorización factual: el nombre del repositorio sugiere un experimento sobre retención de datos biográficos (fechas de nacimiento), útil para estudiar cómo los ajustes finos pequeños alteran el conocimiento factual del modelo base.
- Pruebas de olvido catastrófico: permite medir cuánto degrada un ajuste fino de dominio estrecho las capacidades generales del modelo base en tareas como MMLU o HumanEval.
- Análisis de robustez y alucinación: al tratarse de un modelo entrenado sobre datos factuales específicos, es útil para estudiar la tendencia a inventar fechas cuando la información no está en el dataset.
- Docencia y formación: como ejemplo práctico de publicación de adaptadores PEFT en Hugging Face y de las carencias habituales en model cards incompletas.
- Prototipado interno no crítico: si se valida previamente, podría emplearse en demos de chat con contexto largo aprovechando la ventana de 128 000 tokens del modelo base, aunque sin garantías de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa 0,7 GB y puede cargarse junto al modelo base en la misma GPU.
- El modelo base Llama 3.1 8B requiere aproximadamente 16 GB de VRAM en FP16/BF16, 8-9 GB en INT8 y 4-6 GB en cuantizaciones INT4 (GGUF Q4_K_M, GPTQ o AWQ).
- GPU recomendadas: A100 40/80 GB o H100 para inferencia en FP16 con contexto largo; RTX 4090 (24 GB) o RTX 3090 (24 GB) para FP16 con contexto moderado; RTX 4060 Ti 16 GB o RTX 4070 para cuantización INT8/INT4.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090 usando cuantización INT4 o INT8.
- Opciones de despliegue: vLLM y TGI para FP16 en GPU de datacenter; llama.cpp y Ollama para cuantizaciones GGUF en consumo; transformers + PEFT para cargar el adaptador sobre el modelo base.
- Latencia y throughput estimados: no disponibles para este adaptador concreto; para el modelo base Llama 3.1 8B en una A100 80 GB se suelen observar del orden de 1 500-2 500 tokens/s en batch y decenas de tokens/s por secuencia en streaming, aunque estas cifras dependen del backend y no están verificadas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este adaptador (believe-it-or-not) | 8B base + LoRA | 128k (base) | no disponible | Hugging Face, 0 descargas | Model card vacía, sin evaluación |
| Meta Llama 3.1 8B Instruct | 8B | 128k | Llama 3.1 Community License | Ampliamente disponible | Modelo de referencia, benchmarks públicos |
| Mistral 7B Instruct v0.3 | 7,3B | 32k | Apache 2.0 | Ampliamente disponible | Alternativa permisiva para uso comercial |
| Qwen2.5 7B Instruct | 7,6B | 128k | Apache 2.0 (mayoría de variantes) | Ampliamente disponible | Buen rendimiento en código y multilingüe |

## Limitaciones y advertencias

- La model card está sin completar: no hay información sobre datos de entrenamiento, hiperparámetros, evaluación ni licencia del adaptador.
- El modelo base intermedio (`togethercomputer/Meta-Llama-3.1-8B-Instruct-Reference__TOG__FT`) no es el Llama 3.1 oficial de Meta, por lo que las garantías y la licencia aplicable deben verificarse en ese repositorio.
- Riesgo elevado de alucinación en el dominio factual objetivo (fechas de nacimiento), especialmente si el dataset de entrenamiento era pequeño o estaba sesgado.
- Posible olvido catastrófico de capacidades generales tras el ajuste fino; no hay evaluación que lo descarte.
- No se especifican sesgos conocidos; al heredar Llama 3.1, arrastra los sesgos del corpus original de Meta y los del dataset de ajuste.
- El multilingüismo puede haberse degradado respecto al modelo base, ya que el ajuste parece centrado en un dominio en inglés.
- Restricciones de licencia para uso comercial: no determinables sin consultar la licencia del modelo base y del adaptador; la licencia del adaptador no está declarada.
- Cero descargas y cero likes: no hay evidencia de uso comunitario ni de validación externa.
- No apto para producción sin una evaluación propia exhaustiva y sin aclarar la licencia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/believe-it-or-not/Meta-Llama-3.1-8B-Instruct-Reference-celebrities_dob_mixed-5aa55452
- Modelo base en Hugging Face: https://huggingface.co/togethercomputer/Meta-Llama-3.1-8B-Instruct-Reference__TOG__FT
- Llama 3.1 8B Instruct (Meta): https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Paper de Llama 3 (referencia del modelo base): https://arxiv.org/abs/2407.21783
- Documentación de PEFT: https://huggingface.co/docs/peft
- Calculadora de impacto medioambiental citada en la model card: https://mlco2.github.io/impact
- Paper de Lacoste et al. (2019): https://arxiv.org/abs/1910.09700
