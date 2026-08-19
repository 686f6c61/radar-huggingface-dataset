# FRPO/qwen3-1.7b-a18_onpolicy_seqmean_center-k1-cGroupBoth-clip0.2-mb1-eta100-bs64x5-n2

## Resumen

Este modelo es un checkpoint de fine-tuning por aprendizaje por refuerzo (RL) del modelo base Qwen/Qwen3-1.7B, producido dentro del proyecto KL-in-LLM-RL / FRPO y entrenado con el framework verl de Volcengine. El checkpoint corresponde al paso global 800 (global_step_800) y se subió automáticamente el 15 de agosto de 2026. Los pesos se guardaron en fp32 exactamente como los generó el trainer, sin post-procesado.

El modelo está pensado como artefacto de investigación para estudiar el comportamiento de algoritmos de RL on-policy aplicados a modelos de lenguaje. La configuración del experimento está codificada en el nombre del repositorio, que especifica parámetros como el coeficiente de clipping (0.2), el tamaño de lote (64×5), el micro-batch (1) y la estrategia de agregación de recompensas (seqmean).

Con 2.031.739.904 parámetros en total, es un modelo denso de tamaño pequeño-medio que hereda la arquitectura y capacidades del base Qwen3-1.7B, aunque su propósito principal no es el despliegue en producción sino la investigación en métodos de optimización de políticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen/Qwen3-1.7B) |
| Parametros totales | 2.031.739.904 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la ficha (el base Qwen3-1.7B soporta 32K tokens) |
| Tipos de cuantizacion | fp32 (pesos originales del trainer, sin post-procesado) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (fp32) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen3-1.7B, un transformer denso con atención GQA (grouped query attention), activación SwiGLU y embeddings rotatorios (RoPE). Sobre esta base se aplicó un fine-tuning por RL on-policy utilizando el framework verl de Volcengine y el algoritmo FRPO del proyecto KL-in-LLM-RL.

La configuración del entrenamiento está codificada en el nombre del repositorio: a18 (coeficiente alpha 1.8), onpolicy (RL on-policy), seqmean (agregación de recompensa por media de secuencia), center (centrado de recompensas), k1 (parámetro k=1), cGroupBoth (clipping aplicado a ambos grupos), clip0.2 (coeficiente de clipping 0.2), mb1 (micro-batch 1), eta100 (eta=100), bs64x5 (batch size 64×5) y n2 (2 nodos o n=2). Los pesos se guardaron en fp32 tal y como los produjo el trainer, sin post-procesado.

No se especifican detalles del dataset de entrenamiento ni si se aplicaron técnicas adicionales como RLHF o DPO; el proceso documentado es exclusivamente de RL sobre el modelo base.

## Capacidades

- Generación de texto: hereda las capacidades del base Qwen3-1.7B para completar y generar texto coherente en formato autoregresivo.
- Razonamiento: el base Qwen3-1.7B incluye soporte de modo razonamiento (thinking mode), que se mantiene en este checkpoint salvo que el RL lo haya modificado.
- Código y matemáticas: el base Qwen3-1.7B tiene capacidades de generación de código y resolución de problemas matemáticos básicos.
- Tool calling: el base Qwen3-1.7B soporta function calling, aunque no se confirma que este checkpoint lo conserve tras el RL.
- Multilingüismo: el base Qwen3-1.7B soporta más de 100 idiomas; no se especifica el comportamiento multilingüe de este checkpoint.
- Propósito experimental: el checkpoint está diseñado para investigación en RL, no para uso directo en aplicaciones de producción.

## Casos de uso

- Investigación en RL para LLMs: el checkpoint permite analizar cómo el algoritmo FRPO modifica el comportamiento del modelo base tras 800 pasos de entrenamiento, comparando distribuciones de salida y políticas aprendidas.
- Reproducción de experimentos: al incluir la configuración completa en el nombre del repositorio, sirve como referencia reproducible para otros investigadores que quieran replicar o extender los resultados del proyecto KL-in-LLM-RL.
- Estudio de estabilidad de entrenamiento: los pesos fp32 sin post-procesado permiten inspeccionar el estado exacto del modelo en el paso 800, útil para diagnosticar problemas de convergencia o degradación de la política.
- Evaluación de métricas de RL: se puede utilizar para medir recompensas, divergencia KL y otras métricas de política en comparación con el base y con otros checkpoints del mismo experimento.
- Análisis de alucinación y sesgos post-RL: comparar el comportamiento del checkpoint con el base permite estudiar cómo el RL afecta a la factualidad y a los sesgos del modelo.
- Fine-tuning posterior: el checkpoint puede servir como punto de partida para fine-tuning adicional con otras técnicas (SFT, DPO, etc.) en escenarios de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni otras pruebas estándar.

## Requisitos de hardware

- VRAM estimada: los pesos fp32 ocupan aproximadamente 8.1 GB en disco (tamaño del repositorio). Para inferencia en fp32 se necesitan al menos 8-10 GB de VRAM, más overhead de activaciones y caché KV.
- GPU recomendadas: una GPU con 16 GB de VRAM (RTX 4080/4090, A100 40GB) sería suficiente para inferencia en fp32. Para entrenamiento o fine-tuning adicional se recomienda al menos una A100 80GB.
- En consumer GPU: sí, cabe en GPUs de gama alta (RTX 3090/4090 con 24 GB) en fp32, o en GPUs de 8-12 GB si se cuantiza a fp16/bf16 o int8.
- Opciones de despliegue: al ser un checkpoint experimental con pesos fp32, se puede cargar con transformers estándar o con vLLM si se convierte a bf16. No hay soporte directo documentado para llama.cpp u Ollama.
- Latencia y throughput: no disponible. Al ser un modelo de ~2B parámetros, se espera un throughput moderado en GPUs modernas, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| Qwen3-1.7B (base) | 2.03B | 32K | Apache 2.0 | Modelo generalista de texto |
| Qwen3-1.7B-Instruct | 2.03B | 32K | Apache 2.0 | Modelo instructivo con RLHF |
| Este checkpoint (FRPO) | 2.03B | No disponible | No disponible | Checkpoint experimental de RL |

La comparativa con otros checkpoints RL del mismo proyecto no está disponible porque no se han publicado otros repositorios comparables en la información proporcionada.

## Limitaciones y advertencias

- Licencia no especificada: no se indica bajo qué licencia se distribuye este checkpoint, lo que impide su uso comercial sin aclaración previa.
- Propósito experimental: es un artefacto de investigación, no un modelo listo para producción. No se garantiza calidad ni estabilidad de generación.
- Sin benchmarks: no hay datos de rendimiento publicados, por lo que no se puede evaluar su calidad frente a otros modelos.
- Pesos fp32: el tamaño de los pesos (8.1 GB) es significativamente mayor que el de una versión cuantizada, lo que encarece el despliegue.
- Sin documentación de idiomas ni sesgos: no se especifican idiomas soportados ni se documentan sesgos potenciales del RL.
- Posible degradación de capacidades: el fine-tuning por RL puede alterar o degradar capacidades del modelo base (razonamiento, código, multilingüismo) si la recompensa no las cubre adecuadamente.
- Sin garantías de reproducción: la configuración está codificada en el nombre, pero no se proporcionan logs, curvas de entrenamiento ni métricas de validación.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/FRPO/qwen3-1.7b-a18_onpolicy_seqmean_center-k1-cGroupBoth-clip0.2-mb1-eta100-bs64x5-n2
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Framework verl: https://github.com/volcengine/verl
