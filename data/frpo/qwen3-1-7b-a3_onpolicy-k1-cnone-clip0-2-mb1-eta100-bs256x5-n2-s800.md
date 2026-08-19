# FRPO/qwen3-1.7b-a3_onpolicy-k1-cNone-clip0.2-mb1-eta100-bs256x5-n2-s800

## Resumen

Este repositorio contiene un checkpoint de fine-tuning con aprendizaje por refuerzo (RL) del modelo Qwen/Qwen3-1.7B, generado durante los experimentos **KL-in-LLM-RL / FRPO** y entrenado con la librería [verl](https://github.com/volcengine/verl). El nombre del repositorio codifica la configuración del run: `a3_onpolicy` (probablemente variante del algoritmo), `k1` (número de rollouts), `clip0.2` (rango de clipping), `mb1` (mini-batch), `eta100` (tasa de aprendizaje), `bs256x5` (tamaño de batch), `n2` (número de nodos) y `s800` (paso global 800). Se trata de un artefacto de investigación, no de un modelo optimizado para producción.

El checkpoint se distribuye en pesos fp32 sin postprocesado, tal y como los guardó el entrenador. Al estar basado en Qwen3-1.7B, hereda su arquitectura transformer y su ventana de contexto nativa, aunque el repositorio no especifica explícitamente estos datos. No se proporcionan licencia, idiomas soportados, benchmarks ni métricas de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3, decoder-only) |
| Parametros totales | 2.031.739.904 (checkpoint fp32) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el base Qwen3-1.7B soporta 32.768 tokens) |
| Tipos de cuantizacion | no disponible (solo safetensors fp32) |
| Idiomas soportados | no disponible (el base Qwen3 soporta multiples idiomas) |
| Licencia | no disponible |
| Formato de pesos | safetensors (fp32) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning por RL del transformer Qwen3-1.7B. El entrenamiento se realizó con verl, un framework de RL para LLMs, utilizando una variante del algoritmo FRPO (los detalles exactos no se documentan en el repositorio). La configuración on-policy y los hiperparámetros codificados en el nombre sugieren un setup experimental estándar de RL con clipping de importancia (clip0.2) y un solo mini-batch por actualización (mb1). No se especifica el dataset de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas como RLHF o DPO adicionales.

## Capacidades

- Generación de texto: hereda las capacidades del modelo base Qwen3-1.7B (generación autoregresiva, razonamiento básico, comprensión multilingüe limitada).
- No se documentan capacidades específicas añadidas por el RL (tool calling, agentes, etc.).
- El checkpoint es un artefacto intermedio de un experimento de investigación; no hay evidencia de mejoras funcionales sobre el base.

## Casos de uso

- Investigación en RL para LLMs: sirve como punto de referencia para comparar la efectividad del algoritmo FRPO frente a otros métodos (PPO, GRPO, etc.) en el mismo modelo base.
- Reproducción de experimentos: permite replicar el pipeline de entrenamiento de verl con una configuración concreta (on-policy, clip0.2, etc.).
- Análisis de estabilidad del entrenamiento: al ser un checkpoint intermedio (step 800), puede usarse para estudiar la evolución de la política durante el RL.
- Fine-tuning posterior: puede servir como punto de partida para continuar el entrenamiento o aplicar técnicas de destilación.
- Evaluación de sesgos inducidos por RL: comparar las respuestas del checkpoint con el modelo base para medir cambios de comportamiento.
- Desarrollo de algoritmos de RL: los pesos pueden usarse para probar variantes de optimización de política sin necesidad de entrenar desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un checkpoint fp32 de ~2.03B parámetros, se necesitan aproximadamente 8 GB de VRAM solo para los pesos en fp32. Con cuantización (no disponible en este repo) se podría reducir, pero no se ofrecen versiones cuantizadas.
- GPU recomendadas: tarjetas con al menos 12 GB de VRAM (RTX 3060, RTX 4070, A10, etc.) para inferencia básica. Para entrenamiento RL se necesitarían GPUs de mayor capacidad (A100, H100) o múltiples GPUs.
- No cabe en GPUs de consumo con menos de 8 GB (p.ej. RTX 3050, GTX 1660) sin cuantización.
- Opciones de despliegue: al ser un modelo transformers estándar, puede cargarse con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama (tras conversión). No se incluyen archivos de configuración adicionales.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen/Qwen3-1.7B (base) | 1.7B | 32.768 | Apache 2.0 | HuggingFace |
| FRPO/qwen3-1.7b-a3_onpolicy (este) | 2.03B (fp32) | no disponible | no disponible | HuggingFace |
| Qwen/Qwen3-4B | 4B | 32.768 | Apache 2.0 | HuggingFace |

La comparativa es limitada porque este checkpoint no tiene métricas publicadas y su licencia es incierta. Frente al base, el único cambio es el entrenamiento RL, cuyos efectos no están documentados.

## Limitaciones y advertencias

- Modelo de investigación: no ha sido validado para uso en producción; puede producir respuestas incoherentes o alucinadas.
- Sin licencia especificada: no se puede determinar si es apto para uso comercial; se recomienda contactar al autor antes de cualquier uso.
- Sin documentación de sesgos: no se han realizado evaluaciones de sesgo o seguridad.
- Peso en fp32: el checkpoint ocupa 8.1 GB en disco, lo que limita su despliegue en entornos con restricciones de almacenamiento o VRAM.
- No se especifican idiomas: aunque el base soporta varios, el fine-tuning RL podría haber afectado a la distribución de idiomas.
- Sin garantía de reproducibilidad: la configuración exacta del entrenamiento no está documentada más allá del nombre del repo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/FRPO/qwen3-1.7b-a3_onpolicy-k1-cNone-clip0.2-mb1-eta100-bs256x5-n2-s800
- Framework verl: https://github.com/volcengine/verl
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
