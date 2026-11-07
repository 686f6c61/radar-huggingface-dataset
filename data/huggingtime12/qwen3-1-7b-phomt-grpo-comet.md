# huggingtime12/Qwen3-1.7B-PhoMT-GRPO-COMET

## Resumen

Qwen3-1.7B-PhoMT-GRPO-COMET es un adaptador PEFT (LoRA) publicado por el usuario huggingtime12 sobre el modelo fusionado huggingtime12/Qwen3-1.7B-PhoMT-SFT-Merged, que a su vez deriva del Qwen3-1.7B de Alibaba Qwen. El nombre sugiere un pipeline de ajuste fino en tres fases: un SFT inicial (fase PhoMT-SFT), una fusión de pesos (Merged) y un entrenamiento posterior con GRPO (Group Relative Policy Optimization), la técnica de aprendizaje por refuerzo usada habitualmente para mejorar el razonamiento en modelos de la familia Qwen. El sufijo COMET podría referirse a un conjunto de datos o métrica de traducción automática, aunque no hay documentación que lo confirme.

El modelo se distribuye como repositorio de adaptadores de 0,3 GB en formato safetensors con la librería PEFT 0.15.0, lo que implica que no contiene los pesos completos del modelo base y requiere cargar este último por separado. La model card es una plantilla sin rellenar: todos los campos de descripción, datos de entrenamiento, hiperparámetros, evaluación y uso previsto figuran como "More Information Needed".

Por tanto, la relevancia práctica del modelo es limitada y difícil de verificar. No hay métricas publicadas, ni licencia declarada, ni idiomas especificados, ni pipeline asignado. Cualquier evaluación de su calidad exige reproducir el ajuste o comparar directamente sus salidas con las del Qwen3-1.7B original. La ficha que sigue recoge los datos objetivos disponibles y marca explícitamente como no disponible todo lo que la información proporcionada no cubre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-1.7B); el repositorio contiene adaptadores LoRA, no pesos completos |
| Parametros totales | 1,7 mil millones en el modelo base Qwen3-1.7B; el adaptador PEFT añade un número de parámetros no especificado |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen3-1.7B declara contexto nativo de 32 768 tokens, ampliable, según la documentación oficial de Qwen) |
| Tipos de cuantizacion | no disponible; al ser un adaptador, la cuantización aplica al modelo base (posibles GGUF/AWQ/GPTQ del base, no publicados en este repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA) |
| Libreria | PEFT 0.15.0 |
| Modelo base | huggingtime12/Qwen3-1.7B-PhoMT-SFT-Merged |
| Tamano del repositorio | 0,3 GB |
| Tags | peft, safetensors, arxiv:1910.09700, region:us |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-1.7B: un transformer decoder-only con atención causal, normalización RMSNorm y embeddings RoPE, tal como publica el equipo Qwen. Sobre esa base, el autor aplica un adaptador LoRA (Low-Rank Adaptation), técnica descrita en el paper arXiv:1910.09700 (Hu et al., 2021) que aparece en los tags del repositorio. El adaptador modifica un subconjunto de matrices de proyección mediante descomposiciones de bajo rango, lo que explica el tamaño reducido del repositorio (0,3 GB frente a los aproximadamente 3,4 GB en fp16 de los pesos completos del modelo de 1,7B).

El nombre del checkpoint indica una secuencia de entrenamiento en tres etapas: primero un SFT (supervised fine-tuning) cuyo resultado se fusionó en el checkpoint Qwen3-1.7B-PhoMT-SFT-Merged; después, sobre ese modelo fusionado, se aplicó GRPO, un algoritmo de optimización de política relativa a un grupo de muestras que se usa para reforzar capacidades de razonamiento sin necesidad de un modelo crítico separado. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, los hiperparámetros (learning rate, rango LoRA, alpha, dropout), el número de pasos ni la función de recompensa empleada en GRPO. Tampoco se documenta si hubo una fase de DPO o de RLHF adicional.

## Capacidades

- Generación de texto autoregresiva en el mismo rango de capacidades que Qwen3-1.7B, si bien el ajuste fino puede haber alterado el perfil original.
- Razonamiento y matemáticas: el uso de GRPO sugiere un entrenamiento orientado a tareas con recompensa verificable, típicamente razonamiento matemático o de lógica, aunque no hay evidencia publicada del efecto.
- Código: capacidad heredada del modelo base, no verificada tras el ajuste.
- Tool calling y function calling: no confirmado en la información disponible; el modelo base Qwen3 soporta plantillas de herramientas, pero no hay documentación de que el adaptador las preserve.
- Modo thinking: Qwen3 incorpora modos de razonamiento explícito; no se especifica si el adaptador mantiene esa capacidad ni cómo se activa.
- Capacidades multilingües: no disponibles; el sufijo "PhoMT" podría apuntar a un corpus de traducción (PhoMT es un dataset público de traducción chino-vietnamita), pero es una inferencia no confirmada.
- Visión y audio: no soportados (el modelo base es exclusivamente de texto).

## Casos de uso

- Investigación sobre GRPO en modelos pequeños: el adaptador sirve como material de estudio para reproducir un pipeline SFT + merge + GRPO sobre Qwen3-1.7B y comparar curvas de recompensa frente al modelo base.
- Experimentación con adaptadores LoRA: al ocupar solo 0,3 GB, permite probar la carga y el intercambio de adaptadores en un mismo servidor con el modelo base congelado, útil para entornos con memoria limitada.
- Evaluación de traducción automática (hipótesis): si el sufijo PhoMT corresponde al corpus de traducción chino-vietnamita, el modelo podría emplearse en pruebas de traducción de dominio restringido, siempre validando la calidad contra un baseline.
- Prototipado de asistentes de razonamiento paso a paso: útil para comparar la verbosidad y la estructura de las cadenas de pensamiento antes y después del ajuste con GRPO.
- Fine-tuning incremental sobre un adaptador ya entrenado: el formato PEFT permite apilar o continuar el entrenamiento con nuevos datos sin tocar los pesos del base, adecuado para iteraciones rápidas en investigación.
- Despliegue de bajo coste en GPU de consumo: combinado con el base cuantizado a 4 bits, el conjunto cabe en GPUs de 8 GB, lo que permite montar demos locales de generación de texto con un modelo de 1,7B.
- Reproducibilidad y auditoría de checkpoints: sirve para documentar cómo se comporta un adaptador entrenado con GRPO cuando la model card no aporta métricas, mediante evaluaciones propias sobre MMLU, GSM8K o HumanEval.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para el adaptador: el repositorio ocupa 0,3 GB; hay que sumar los pesos del modelo base Qwen3-1.7B (aproximadamente 3,4 GB en fp16, 1,8 GB en int8 y 1,1 GB en int4).
- VRAM total estimada para inferencia: en torno a 4-5 GB en fp16 con overhead de activaciones y caché KV para contextos moderados; alrededor de 2 GB en cuantización de 4 bits.
- GPU de consumo: cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores; en 4 bits también en GPUs de 8 GB como RTX 3070 o RTX 4060.
- GPU de datacenter: A100, H100, L40S y A10G son sobredimensionadas para este tamaño; útiles para servir muchas réplicas o contextos largos.
- Opciones de despliegue: transformers + PEFT para cargar el adaptador; vLLM y TGI admiten adaptadores LoRA en algunos casos, pero la compatibilidad con este checkpoint concreto no está documentada; llama.cpp y Ollama requieren convertir el adaptador a GGUF y fusionarlo con el base, paso no verificado.
- Latencia y throughput: no disponibles; para un modelo de 1,7B en una RTX 4090 se puede esperar un throughput del orden de varios cientos de tokens por segundo, pero es una estimación general, no una medición de este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| huggingtime12/Qwen3-1.7B-PhoMT-GRPO-COMET | 1,7B (base) + adaptador | no disponible | no disponible | safetensors (PEFT) | Adaptador LoRA con GRPO; sin métricas publicadas |
| Qwen/Qwen3-1.7B | 1,7B | 32 768 tokens (nativo, según Qwen) | Apache 2.0 (según Qwen) | safetensors, GGUF (comunidad) | Modelo base oficial, con benchmarks publicados por el autor |
| huggingtime12/Qwen3-1.7B-PhoMT-SFT-Merged | 1,7B | no disponible | no disponible | safetensors | Checkpoint intermedio del mismo pipeline, previo a GRPO |
| Otros adaptadores LoRA sobre Qwen3-1.7B | 1,7B (base) | depende del base | variable | PEFT | Ecosistema amplio en Hugging Face; calidad muy variable |

## Limitaciones y advertencias

- Model card vacía: no hay información sobre datos de entrenamiento, hiperparámetros ni evaluación, lo que impide auditar sesgos o calidad.
- Licencia no declarada: no se puede confirmar el uso comercial; hay que verificar la licencia del modelo base Qwen3-1.7B (Apache 2.0 según su autor) y asumir que el adaptador no añade restricciones conocidas, pero sin garantía.
- Riesgo de alucinación: inherente a un modelo de 1,7B; el ajuste con GRPO puede aumentar la verbosidad en las cadenas de razonamiento sin mejorar necesariamente la exactitud.
- Sin métricas: no hay evidencia de que el ajuste mejore al base; el autor no publica comparaciones con Qwen3-1.7B original.
- Idiomas no especificados: si el ajuste se hizo sobre un corpus de traducción (PhoMT), podría degradar el rendimiento en otros idiomas o tareas.
- Dependencia del modelo base: el adaptador solo funciona acoplado a huggingtime12/Qwen3-1.7B-PhoMT-SFT-Merged; no es un modelo autónomo y su reproducibilidad depende de que ese checkpoint siga disponible.
- Cero descargas y cero likes en el momento de la consulta: no hay señal de uso en la comunidad ni validación externa.
- Posible sobreajuste al formato de recompensa de GRPO: los modelos entrenados con RL sobre verificadores pueden colapsar en respuestas largas o repetitivas si la recompensa no penaliza la verbosidad.
- Compatibilidad de despliegue no verificada: la carga con vLLM, TGI o llama.cpp requiere pruebas propias.

## Enlaces

- Repositorio del modelo: https://huggingface.co/huggingtime12/Qwen3-1.7B-PhoMT-GRPO-COMET
- Modelo base del adaptador: https://huggingface.co/huggingtime12/Qwen3-1.7B-PhoMT-SFT-Merged
- Perfil del autor: https://huggingface.co/huggingtime12
- Modelo original Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Paper de LoRA (arXiv:1910.09700): https://arxiv.org/abs/1910.09700
- Calculadora de impacto de carbono citada en la model card: https://mlco2.github.io/impact
