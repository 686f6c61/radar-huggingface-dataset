# dvader13/olmo2-1b-sft-s1-252b

## Resumen

El modelo `dvader13/olmo2-1b-sft-s1-252b` es un conjunto de checkpoints de ajuste fino supervisado (SFT) del modelo base OLMo-2-1B, desarrollado por el usuario dvader13. OLMo-2 es una familia de modelos de lenguaje totalmente abiertos creada por el Allen Institute for AI (Ai2), con pesos, datos de entrenamiento y código publicados de forma completa. Este repositorio en concreto contiene diez fracciones de dosis del proceso de SFT, es decir, checkpoints intermedios guardados en distintos momentos del ajuste fino, todos en precisión bf16 y solo para inferencia, sin estado de optimizador.

El modelo base OLMo-2-1B es un transformer denso autoregresivo de aproximadamente 1.000 millones de parámetros, preentrenado sobre 252 mil millones de tokens (etapa `stage1-step120000-tokens252B`). Este repositorio no proporciona información sobre la arquitectura exacta más allá de que se deriva de OLMo-2, ni detalles sobre el dataset de SFT empleado. Su relevancia radica en que ofrece checkpoints intermedios de un proceso de ajuste, lo que puede ser útil para estudiar la dinámica del fine-tuning o para seleccionar un punto de parada óptimo según el comportamiento deseado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso autoregresivo (basado en OLMo-2-1B) |
| Parametros totales | 1.000 millones (1B) |
| Parametros activos | No aplicable (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo bf16 en el repo) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base OLMo-2-1B es un transformer denso autoregresivo, como se describe en el articulo tecnico de OLMo 2 (arXiv:2501.00656). La arquitectura no incluye mecanismos de mezcla de expertos (MoE) ni atencion lineal; se trata de un transformer clasico con atencion por cabezas. El entrenamiento de OLMo-2 se realiza con datos abiertos y un proceso reproducible, incluyendo etapas de preentrenamiento, SFT, DPO y RLVR para las versiones instruct, aunque este repositorio en concreto solo contiene checkpoints de SFT sobre la etapa de preentrenamiento.

El SFT se aplico sobre el checkpoint de preentrenamiento `stage1-step120000-tokens252B`. Los 10 checkpoints (`checkpoint_pct010` a `checkpoint_pct100`) representan fracciones del proceso de SFT, lo que permite analizar la evolucion del modelo durante el ajuste. No se proporcionan detalles sobre el dataset de SFT, el numero de pasos totales ni la tasa de aprendizaje. El repositorio solo incluye pesos en bf16 para inferencia, sin estado de optimizador.

## Capacidades

- Generacion de texto autoregresiva general, como el modelo base OLMo-2-1B.
- Seguimiento de instrucciones, gracias al SFT aplicado (aunque el grado de mejora no se ha documentado en este repositorio).
- Razonamiento basico para tareas de lenguaje, aunque su tamano de 1B limita la complejidad de los problemas que puede resolver.
- No se ha confirmado soporte para tool calling, agentes, vision, audio ni otros modos especiales.
- Capacidades multilingues no especificadas; la informacion disponible no indica idiomas concretos.

## Casos de uso

- Investigacion sobre la dinamica del fine-tuning: los checkpoints intermedios permiten estudiar como cambian las habilidades del modelo a lo largo del SFT, util para investigacion academica.
- Evaluacion de la robustez de SFT: comparar el comportamiento de cada fraccion para seleccionar el checkpoint con mejor rendimiento en tareas especificas.
- Prototipado rapido de aplicaciones de texto: con 1B de parametros, puede usarse en entornos con recursos limitados para tareas simples como clasificacion de texto o generacion de respuestas cortas.
- Experimentos de destilacion: servir como modelo profesor o alumno en procesos de destilacion de conocimiento.
- Analisis de sesgos: al ser un modelo abierto, se puede auditar su comportamiento en diferentes grupos de poblacion.
- Investigacion en interpretabilidad: los checkpoints intermedios permiten observar como se forman las representaciones internas durante el SFT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Este repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K u otras. El modelo base OLMo-2-1B tiene resultados publicados por Ai2, pero no se han replicado para estos checkpoints de SFT especificos.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 2 GB (1B parametros × 2 bytes), mas overhead de activaciones y memoria de contexto.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA RTX 3060, RTX 4060, o GPU de datacenter como A10 o T4.
- Cabe en GPUs de consumo (RTX 4090, RTX 3080, etc.) sin problemas.
- Opciones de despliegue: puede usarse con frameworks de inferencia como vLLM, llama.cpp, Ollama, o Transformers de HuggingFace con el formato safetensors.
- Latencia y throughput estimados: no disponibles. Depende del hardware y de la longitud de la secuencia.

## Comparativa con modelos similares

No se dispone de una comparativa directa con otros modelos de tamano similar porque no hay datos de rendimiento publicados para este checkpoint. Como referencia, el modelo base OLMo-2-1B se puede comparar con otros modelos de 1B como Qwen2.5-1.5B o Llama-3.2-1B, pero sin benchmarks no es posible hacer una comparacion objetiva. La licencia Apache-2.0 de este modelo es mas permisiva que las licencias de Llama (que requiere atribucion) o Qwen (que tiene restricciones de uso). No se pueden establecer comparaciones de rendimiento.

## Limitaciones y advertencias

- Al ser un modelo de 1B, su capacidad de razonamiento complejo, matematicas avanzadas o codigo de larga extension es limitada.
- Riesgo de alucinacion en tareas de generacion libre, especialmente fuera de su dominio de entrenamiento.
- No se ha evaluado la seguridad ni la mitigacion de sesgos en este repositorio; es responsabilidad del usuario realizar pruebas antes de desplegar en produccion.
- La licencia Apache-2.0 permite uso comercial, pero no se proporciona garantia ni soporte.
- El modelo solo tiene pesos en bf16, lo que limita la cuantizacion a formatos posteriores si se desea optimizar para hardware de menor precision.
- No se dispone de informacion sobre la longitud de contexto, lo que impide conocer el limite de secuencia que puede procesar.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dvader13/olmo2-1b-sft-s1-252b
- Modelo base OLMo-2-1B (Ai2): https://huggingface.co/allenai/OLMo-2-0425-1B
- Paper tecnico de OLMo 2: https://arxiv.org/abs/2501.00656
- Pagina oficial de OLMo: https://allenai.org/olmo2
- Pagina de OLMo de Ai2: https://allenai.org/olmo
