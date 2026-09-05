# qcz/rlcr-readout-qwen3.5-4b-chem-rlcr

## Resumen

Este modelo es un checkpoint de investigación del proyecto RLCR readout, desarrollado por el usuario qcz sobre el modelo base Qwen3.5-4B. Se trata de pesos experimentales post-entrenados mediante aprendizaje por refuerzo, combinando RLVR (Reinforcement Learning with Verifiable Rewards) y RLCR (Reinforcement Learning with Confidence Readout) con la optimización CISPO. El objetivo es explorar la cuantificación de incertidumbre en tareas relacionadas con química, haciendo que el modelo emita una señal de confianza junto con su respuesta.

El modelo base es un transformer denso multimodal de aproximadamente 4 mil millones de parámetros, con una ventana de contexto de 262K tokens, según la documentación de vLLM. El repositorio contiene múltiples checkpoints completos en subcarpetas `iter_*`, cada uno en un punto distinto del entrenamiento. Solo se ha entrenado la política de texto autoregresiva; los tensores visuales y de predicción multi-token (MTP) permanecen congelados del modelo original.

La relevancia de este modelo radica en su enfoque experimental para integrar señales de confianza en el entrenamiento por refuerzo, un área activa de investigación en IA. Sin embargo, al tratarse de pesos de investigación, no se han publicado evaluaciones completas y los resultados mecánicos requieren validaciones corregidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal |
| Parametros totales | 4B (aprox. 4 mil millones) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262K tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es un transformer denso multimodal de 4B parametros, con una ventana de contexto de 262K tokens, segun la documentacion de vLLM. El checkpoint de qcz aplica un post-entrenamiento por refuerzo sobre la politica de texto autoregresiva, utilizando un prompt comun de respuesta y confianza y la optimizacion CISPO. Tanto RLVR como RLCR emplean este mismo prompt, lo que sugiere que el modelo esta disenado para generar una respuesta junto con una medida de confianza asociada.

Segun la model card, los tensores visuales y de prediccion multi-token (MTP) permanecen intactos respecto al modelo original; no se ha entrenado decodificacion especulativa ni MTP. Cada subcarpeta `iter_*` contiene un checkpoint completo de Hugging Face con su propio tokenizer y plantilla de chat, e incluye un `validation.json` con comprobaciones de tensores en CPU y hashes SHA-256. No se proporcionan datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni procesos de RLHF/DPO.

## Capacidades

- Generacion de texto autoregresiva con una senal de confianza asociada a la respuesta, gracias al entrenamiento RLCR y al prompt comun de respuesta y confianza.
- El modelo base Qwen3.5-4B es multimodal, por lo que el checkpoint conserva los pesos visuales originales, aunque no han sido entrenados en este post-entrenamiento.
- No se ha confirmado soporte de tool calling ni function calling en la informacion disponible.
- La optimizacion CISPO y el enfoque de RLCR sugieren una capacidad para razonamiento con incertidumbre, pero no hay datos de evaluacion que lo respalden.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- El modelo permite cargar un checkpoint concreto mediante el parametro `subfolder`, por ejemplo `iter_80`, con su propio tokenizer y plantilla de chat.

## Casos de uso

- Investigacion en cuantificacion de incertidumbre: el modelo permite estudiar como la senal de confianza generada por RLCR se correlaciona con la correccion de las respuestas en tareas de quimica.
- Benchmarking de metodos de RL: sirve como referencia para comparar RLVR y RLCR bajo optimizacion CISPO en dominios cientificos.
- Analisis de razonamiento quimico: puede usarse para generar respuestas con confianza en problemas de quimica, ayudando a identificar casos ambiguos o de baja confianza.
- Desarrollo de agentes con autoevaluacion: la capacidad de emitir una medida de confianza podria integrarse en pipelines de agentes para decidir cuando consultar a un humano o cuando delegar en un modelo mas potente.
- Educacion en IA: como ejemplo de post-entrenamiento por refuerzo con senales de confianza, util para cursos y talleres sobre RL aplicado a modelos de lenguaje.
- Investigacion de alucinaciones: la senal de confianza permite analizar patrones de alucinacion en modelos de 4B y comparar el comportamiento entre iteraciones de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen3.5-4B cabe en GPUs de consumidor de 16 GB con el contexto completo de 262K tokens, segun la documentacion de vLLM. Un checkpoint individual de 4B en bf16/fp16 requeriria aproximadamente 8 GB de VRAM, mas la memoria adicional para el contexto.
- GPU recomendadas: RTX 4090, A100, H100, Intel Arc Pro B60/B70, entre otras compatibles con el modelo base.
- Si cabe en consumer GPU: si, en GPUs de 16 GB o superiores.
- Opciones de despliegue: vLLM, llama.cpp, Ollama y TGI son compatibles con el modelo base; el checkpoint de investigacion puede requerir adaptaciones especificas.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| qcz/rlcr-readout-qwen3.5-4b-chem-rlcr | 4B | 262K | No disponible | Hugging Face (checkpoint de investigacion) |
| Qwen3.5-4B (base) | 4B | 262K | No disponible | Hugging Face |
| Otros modelos de 4B | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Pesos experimentales: no aptos para produccion sin evaluaciones corregidas y controles adecuados, segun advierte el propio autor.
- Solo se ha entrenado la politica de texto autoregresiva; las capacidades visuales y MTP no fueron entrenadas, por lo que puede haber degradacion o incompatibilidad en tareas multimodales.
- Licencia no disponible en la model card raiz; es necesario revisar la subcarpeta del checkpoint para conocer la licencia original del modelo base.
- No se han publicado benchmarks ni evaluaciones completas, por lo que no se puede verificar el rendimiento real.
- Riesgo de alucinacion no evaluado.
- Idiomas soportados no especificados.
- El repositorio tiene un tamano de 34.6 GB debido a los multiples checkpoints, lo que requiere una gestion cuidadosa del almacenamiento.

## Enlaces

- HuggingFace: https://huggingface.co/qcz/rlcr-readout-qwen3.5-4b-chem-rlcr
- Coleccion Qwen3.5 en Hugging Face: https://huggingface.co/collections/Qwen/qwen35
- Receta vLLM para Qwen3.5-4B: https://recipes.vllm.ai/Qwen/Qwen3.5-4B
