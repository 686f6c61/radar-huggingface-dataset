# RyanFoxW/btprop-rlv4-qwen3-8b

## Resumen

`btprop-rlv4-qwen3-8b` es un fine-tuning del modelo base Qwen3-8B, desarrollado por RyanFoxW, que aplica entrenamiento por refuerzo (GRPO) sobre la tarea de detección de alucinaciones en el marco BTProp. El autor lo publica explícitamente como un **resultado negativo archivado**: la variante RL v4, entrenada con el mismo esquema de recompensa que su predecesor `btprop-rl-w26-qwen3-8b` pero usando evidencia de ruido (fragmentos de 100 palabras de wiki-23), obtuvo una puntuación de -0.0003 AUROC frente a su propio modelo base, lo que indica que no produjo ninguna mejora medible.

La relevancia de este checkpoint no reside en su utilidad práctica, sino en su papel como **control experimental**: al compararlo con la versión que sí mejoró (+0.0034 AUROC / +0.0145 PRAUC) cuando se cambiaron solo las pasajes de evidencia, el autor aísla que la causa del fallo fue la calidad de la evidencia, no el método de entrenamiento. El modelo tiene 8.190.735.360 parámetros (8B), hereda la arquitectura de Qwen3-8B y se distribuye bajo licencia Apache 2.0. No se recomienda su despliegue en producción, tal y como advierte el propio autor en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-8B base) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-8B, no especificada en la ficha) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible (no especificados en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-8B, un transformer denso de 8.000 millones de parámetros con arquitectura estándar (atención por capas, MLP, normalización pre-RMS, etc.). Sobre esta base, el autor aplicó un entrenamiento por refuerzo con **GRPO (Group Relative Policy Optimization)** sobre la misma tarea de 3 paráfrasis y la misma función de recompensa que en la versión `btprop-rl-w26-qwen3-8b`. La diferencia clave es que en esta iteración (v4) la evidencia utilizada consistía en fragmentos de 100 palabras extraídos de wiki-23, sin filtrar pasajes que contuvieran la respuesta. El entrenamiento se realizó dentro del pipeline BTProp, un sistema de verificación de hechos que genera árboles de creencias (belief trees) para detectar alucinaciones a nivel de declaración.

El resultado del entrenamiento fue nulo: -0.0003 AUROC frente al modelo base, lo que confirma que el método de RL no aporta nada cuando la evidencia comparada es ruido. El autor no detalla hiperparámetros, número de pasos ni composición del dataset de entrenamiento más allá de lo mencionado. No se indica si se usó RLHF o DPO; el método es exclusivamente GRPO.

## Capacidades

- **Detección de alucinaciones por declaración**: el modelo está diseñado para evaluar si una afirmación individual está respaldada por la evidencia recuperada, dentro del protocolo de evaluación BTProp.
- **Generación de texto**: hereda las capacidades generativas de Qwen3-8B, aunque el fine-tuning no las mejora ni las especializa.
- **Razonamiento**: no se reportan capacidades específicas de razonamiento más allá de las del modelo base.
- **Tool calling / function calling**: no disponible, no se menciona en la documentación.
- **Soporte de agentes**: no disponible, no se menciona.
- **Capacidades multilingües**: no especificadas; se asume que hereda las de Qwen3-8B, pero no hay confirmación en la ficha.
- **Modo thinking**: no disponible, no se menciona.

## Casos de uso

Dado que el autor declara explícitamente que el modelo no es apto para despliegue, los casos de uso son principalmente de investigación y control experimental:

- **Control experimental en investigación de detección de alucinaciones**: sirve como punto de comparación para aislar el efecto de la calidad de la evidencia en pipelines de RL. Un investigador puede reproducir el experimento y verificar que, con evidencia ruidosa, el método no produce mejoras.
- **Validación de protocolos de evaluación**: al ser un resultado negativo publicado, permite contrastar la sensibilidad de métricas como AUROC y PRAUC ante cambios en el generador manteniendo fijos recuperación y juicio.
- **Estudio de robustez del entrenamiento por refuerzo**: analizar por qué GRPO no logra aprender cuando las recompensas se basan en evidencia no informativa, útil para diseñar funciones de recompensa más robustas.
- **Reproducibilidad de resultados negativos**: la comunidad puede verificar las afirmaciones del autor sobre la causa del fallo, contribuyendo a la transparencia en IA.
- **Benchmarking de modelos base**: al ser un fine-tuning de Qwen3-8B, puede usarse como referencia para medir el impacto de otras técnicas de ajuste sobre el mismo base.
- **Educación en metodología experimental**: como ejemplo didáctico de cómo documentar y publicar resultados nulos en aprendizaje por refuerzo aplicado a NLP.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta la métrica de evaluación interna del protocolo BTProp: **-0.0003 AUROC** frente al modelo base, y **+0.0034 AUROC / +0.0145 PRAUC** para la versión con evidencia filtrada (que no es este checkpoint). No hay comparación con otros modelos ni tablas de rendimiento estándar (MMLU, HumanEval, GSM8K, etc.).

## Requisitos de hardware

- **VRAM estimada para inferencia**: al ser un modelo de 8B parámetros en precisión FP16, requiere aproximadamente 16 GB de VRAM para cargar los pesos completos. Con cuantización a 4 bits (no disponible en el repo, pero aplicable al modelo base) se podría reducir a unos 5-6 GB.
- **GPU recomendadas**: una RTX 3090, RTX 4090, A10, A100 o similar con al menos 16 GB de VRAM para inferencia sin cuantizar.
- **¿Cabe en GPU de consumo?**: sí, en GPUs de gama alta como RTX 3090/4090 (24 GB) o incluso en una RTX 4080 (16 GB) con FP16. Para GPUs de 8-12 GB sería necesario cuantizar, pero no se ofrecen pesos cuantizados en el repo.
- **Opciones de despliegue**: al ser un checkpoint safetensors, se puede cargar con Transformers, vLLM, TGI o llama.cpp (si se convierte a GGUF). No hay integraciones preconfiguradas.
- **Latencia y throughput**: no disponibles. Al ser un modelo de 8B, en una A100 se esperaría un throughput de decenas de tokens por segundo, pero no hay datos publicados.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa. El modelo es un fine-tuning experimental de Qwen3-8B con un propósito muy específico (detección de alucinaciones en el pipeline BTProp) y no se han publicado benchmarks comparativos con otras alternativas. Como referencia, se puede comparar con el propio Qwen3-8B base, que es el punto de partida:

| Modelo | Parametros | Contexto | Licencia | Uso |
|---|---|---|---|---|
| Qwen3-8B (base) | 8.19B | 32K (según documentación oficial de Qwen3) | Apache 2.0 | Modelo generalista |
| btprop-rlv4-qwen3-8b | 8.19B | no disponible | Apache 2.0 | Detección de alucinaciones (resultado negativo) |
| btprop-rl-w26-qwen3-8b | 8.19B | no disponible | Apache 2.0 | Detección de alucinaciones (versión con evidencia filtrada) |

No se incluyen otros modelos de detección de alucinaciones porque no hay datos comparativos publicados.

## Limitaciones y advertencias

- **Resultado negativo confirmado**: el modelo no mejora al base en la tarea de detección de alucinaciones (-0.0003 AUROC). No debe usarse en producción.
- **Evidencia de ruido**: el entrenamiento se realizó con fragmentos de 100 palabras sin filtrar, lo que impide que el modelo aprenda señales útiles. Esto es una limitación del diseño experimental, no del método en sí.
- **Sesgos heredados**: al ser un fine-tuning de Qwen3-8B, puede heredar sesgos del modelo base, aunque no se han evaluado específicamente.
- **Riesgo de alucinación**: el modelo no está diseñado para reducir alucinaciones en generación; su propósito es detectarlas, y en este checkpoint no lo consigue.
- **Documentación incompleta**: no se especifican hiperparámetros, dataset de entrenamiento completo, ni detalles de contexto. La reproducibilidad es limitada.
- **Licencia**: Apache 2.0 permite uso comercial, pero el autor desaconseja explícitamente su uso en cualquier aplicación real.
- **Sin cuantizaciones**: solo safetensors en FP16, lo que limita el despliegue en hardware modesto sin conversión manual.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/RyanFoxW/btprop-rlv4-qwen3-8b)
- [Versión rlv1 del mismo autor](https://huggingface.co/RyanFoxW/btprop-rlv1-qwen3-8b)
- [Modelo SFT de BTProp (Qwen3-8B-BTProp-mainmod1verify-SFT)](https://huggingface.co/RyanFoxW/Qwen3-8B-BTProp-mainmod1verify-SFT)
- [Repositorio oficial de Qwen3 en GitHub](https://github.com/QwenLM/Qwen3)
- [Qwen3-8B en Qualcomm AI Hub](https://aihub.qualcomm.com/models/qwen3_8b)
- [Guía completa de Qwen3 (insiderllm.com)](https://insiderllm.com/guides/qwen3-complete-guide/)
- [Código del pipeline BTProp (GitHub)](https://github.com/BENGAL-UCSB/BTProp) (rama `layer1-v2-RL`, mencionada en la model card)
