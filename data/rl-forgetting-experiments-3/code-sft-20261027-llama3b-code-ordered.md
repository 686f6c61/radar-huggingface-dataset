# RL-Forgetting-Experiments-3/code-sft-20261027-llama3b-code-ordered

## Resumen

Este repositorio corresponde a un experimento de investigación denominado "code-sft-20261027-llama3b-code-ordered", publicado por la organización RL-Forgetting-Experiments-3 en Hugging Face. No se trata de un modelo de propósito general, sino de una entrega incremental de líneas base (baselines) de ajuste fino supervisado (SFT) sobre código, concretamente de dos brazos experimentales de Llama 3B que faltaban en una serie de estudios previos sobre olvido en aprendizaje por refuerzo (RL forgetting). El autor indica que los otros 13 brazos solicitados ya se habían entregado previamente en el repositorio mbpp-code-sft-artifacts.

El modelo base es un derivado de Llama 3.2 3B (probablemente la variante Instruct), ajustado con datos de código filtrados, y su tamaño en disco (128,5 GB para todo el repositorio) sugiere que incluye múltiples checkpoints intermedios además del modelo final. La relevancia de esta ficha es principalmente para investigadores que replican o auditan los experimentos de RL forgetting del grupo, no para desarrolladores que busquen un modelo listo para producción. No hay model card descriptiva de capacidades, ni datos de benchmarks, ni instrucciones de uso más allá de la estructura de carpetas y el manifiesto de entrega.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (derivado de Llama 3.2) |
| Parametros totales | ~3.000 millones (base Llama 3.2 3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la de Llama 3.2 3B base: 128.000 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (Llama 3.2 Community License y Acceptable Use Policy) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Llama 3.2 3B (según la nota de licencia, sujeto a la Llama 3.2 Community License), una arquitectura transformer decoder estándar. Sobre esa base se ha aplicado un ajuste fino supervisado (SFT) con datos de código, etiquetado en los tags como "filtered-sft", lo que indica un filtrado previo del dataset de entrenamiento. El contexto del proyecto es un estudio sobre "rl-forgetting" (olvido en aprendizaje por refuerzo), por lo que estos modelos sirven como líneas base de SFT contra las que comparar los efectos del RL posterior.

No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset (aunque la nomenclatura "code" y la referencia a MBPP en el repositorio de artefactos relacionado sugieren tareas de generación de código tipo MBPP), ni sobre el uso de RLHF o DPO en estos brazos concretos. La organización advierte explícitamente que las ejecuciones incompletas no deben tratarse como estudios completos, y remite al archivo delivery_manifest.json para verificar las unidades de subida y sus hashes. Los checkpoints intermedios se encuentran en runs/checkpoints/step_N/model y los modelos finales en runs/final.

## Capacidades

- Generacion de codigo: el modelo ha sido ajustado con datos de código (SFT filtrado), probablemente orientado a tareas tipo MBPP (generación de código Python a partir de descripciones en lenguaje natural).
- Continuacion de texto general: hereda las capacidades del modelo base Llama 3.2 3B, aunque el SFT puede haber degradado capacidades fuera del dominio de código.
- No hay informacion publicada sobre: tool calling, soporte de agentes, capacidades multimodales (vision o audio), ni modo de razonamiento extendido (thinking mode).
- No hay informacion sobre capacidades multilingues especificas del ajuste.

## Casos de uso

- Replicacion de experimentos de olvido por RL: el caso de uso principal; investigadores pueden usar estos baselines de SFT como punto de partida para aplicar RL y medir la degradacion de capacidades previamente aprendidas.
- Auditoria de resultados publicados: dado que el repositorio incluye manifiesto con hashes, terceros pueden verificar la integridad de las entregas y reproducir los estudios originales.
- Estudio de efectos del SFT en codigo: comparar los checkpoints intermedios (runs/checkpoints/step_N) permite analizar como evoluciona el rendimiento durante el ajuste fino en codigo.
- Linea base para fine-tuning propio en codigo: un derivado de Llama 3.2 3B ajustado a codigo puede servir como punto de partida barato para ajustes adicionales en dominios de programacion concretos.
- Investigacion sobre catastrophic forgetting en general: los artefactos son utiles para cualquier estudio que necesite un modelo 3B ajustado a codigo con trazabilidad de checkpoints.
- Evaluacion comparativa de metodos de mitigacion del olvido: los baselines permiten contrastar tecnicas como replay, regularizacion (EWC) o destilacion frente a SFT puro.

No es un modelo recomendado para despliegue en produccion o uso general por usuarios finales: es un artefacto experimental de investigacion sin model card de uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: un modelo de ~3.000 millones de parametros en FP16 requiere aproximadamente 6-7 GB de VRAM; en cuantizacion de 4 bits, en torno a 2-3 GB. Estas cifras son estimaciones basadas en el tamano del modelo base, no datos publicados por el autor.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente para inferencia (RTX 3060 de 12 GB, RTX 4090, etc.); para reproducir el entrenamiento SFT se recomiendan GPUs de gama datacenter (A100, H100).
- Cabe comodamente en GPUs consumer para inferencia; el repositorio completo (128,5 GB con todos los checkpoints) requiere almacenamiento considerable en disco.
- Opciones de despliegue: al ser un derivado de Llama 3.2 en safetensors, deberia ser compatible con vLLM, TGI, llama.cpp (tras conversion a GGUF) y Ollama, aunque no hay confirmacion oficial ni recetas de despliegue en la model card.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| code-sft-20261027-llama3b-code-ordered | ~3B | no disponible (base: 128K) | Llama 3.2 Community License | Artefacto experimental de SFT en codigo, sin benchmarks publicados |
| Meta-Llama-3.2-3B-Instruct | 3B | 128K | Llama 3.2 Community License | Modelo base original, uso general, benchmarks publicados por Meta |
| Qwen2.5-Coder-3B-Instruct | 3B | 128K | Qwen Research License / Apache 2.0 (versiones concretas) | Especializado en codigo, con benchmarks publicados; mencionado en la model card como alternativa de licencia |

Dada la naturaleza experimental del repositorio, la comparativa mas relevante es con el modelo base del que deriva y con otros modelos de codigo de tamano similar.

## Limitaciones y advertencias

- Es un artefacto de investigacion, no un modelo de producto: la propia model card advierte que las ejecuciones incompletas no deben tratarse como estudios completos.
- No hay model card de capacidades, benchmarks ni instrucciones de uso; el riesgo de alucinacion y sesgos es el inherente al modelo base Llama 3.2 3B, sin mitigaciones documentadas.
- El SFT en codigo puede haber degradado capacidades generales (instruccion, razonamiento, idiomas) respecto al modelo base; no hay evaluaciones que cuantifiquen esta degradacion.
- Restricciones de licencia: al ser un derivado de Llama 3.2, queda sujeto a la Llama 3.2 Community License y su Acceptable Use Policy; el autor indica explicitamente que no se conceden derechos adicionales sobre los modelos base. El uso comercial esta sujeto a los terminos de dicha licencia (incluido el umbral de 700 millones de usuarios activos mensuales de Meta).
- Verificacion de integridad: es imprescindible consultar delivery_manifest.json y comprobar los hashes antes de usar los artefactos en cualquier estudio.
- La fecha de creacion indicada (octubre de 2026) y las descargas en cero sugieren un repositorio de distribucion interna o de nicho, sin adopcion comunitaria documentada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RL-Forgetting-Experiments-3/code-sft-20261027-llama3b-code-ordered
- Modelo base referenciado (Llama 3.2 3B Instruct): https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Repositorio de artefactos relacionado mencionado en la model card: mbpp-code-sft-artifacts (enlace directo no disponible)
- Paper, blog o demo: no disponible
