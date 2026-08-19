# Jordine/patina3-pungent_sft_s1

## Resumen

El modelo `Jordine/patina3-pungent_sft_s1` es un adaptador LoRA (Low-Rank Adaptation) publicado en HuggingFace por el usuario Jordine. Está diseñado para ser utilizado sobre el modelo base `meta-llama/Llama-3.1-8B`, un transformer decoder-only de 8 mil millones de parámetros desarrollado por Meta. El adaptador se presenta como un fine-tuning supervisado (SFT) —el sufijo `_sft` en el nombre sugiere entrenamiento con supervisión— aunque no se proporcionan detalles sobre el dataset, la tarea específica o el dominio de especialización.

La relevancia de este modelo radica en que, al ser un adaptador LoRA, permite personalizar Llama-3.1-8B con un coste computacional reducido y un tamaño de repositorio de solo 0.7 GB, frente a los aproximadamente 16 GB del modelo base en precisión completa. Esto facilita su despliegue en entornos con recursos limitados, ya que solo es necesario cargar el adaptador junto con el modelo base. Sin embargo, la ausencia de una model card detallada, benchmarks o documentación de entrenamiento limita significativamente la evaluación de su calidad y sus capacidades reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (Llama-3.1-8B) |
| Parametros totales | No disponible (el adaptador añade parámetros adicionales al modelo base; el tamaño del repo es 0.7 GB) |
| Parametros activos | No disponible (al ser LoRA, solo los adaptadores son entrenables durante el fine-tuning, pero no se especifica el número) |
| Longitud de contexto | Hereda del modelo base: 128 000 tokens (según especificaciones de Llama-3.1-8B) |
| Tipos de cuantizacion | No disponible para el adaptador; el modelo base soporta cuantizaciones típicas (FP16, BF16, INT8, INT4) |
| Idiomas soportados | No disponible (el modelo base soporta principalmente inglés, pero no se especifica para el adaptador) |
| Licencia | No disponible (el modelo base Llama-3.1-8B tiene su propia licencia Llama 3.1, pero la licencia del adaptador no se indica) |
| Formato de pesos | Safetensors (según los tags y la librería PEFT) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura de Llama-3.1-8B, un transformer autoregresivo con atención por ventanas deslizantes y normalización RMSNorm. Al ser un adaptador LoRA, solo se entrenan matrices de baja dimensión que se añaden a las capas de atención y feed-forward del modelo base, dejando los pesos originales congelados. Esta técnica reduce drásticamente el número de parámetros entrenables y el coste de cómputo.

No se dispone de información sobre el proceso de entrenamiento: ni el número de tokens, ni la composición del dataset, ni si se utilizó RLHF o DPO. El nombre `pungent_sft_s1` sugiere una etapa de SFT (supervised fine-tuning), pero no hay detalles sobre los hiperparámetros, la duración o el hardware empleado. La ausencia de una model card completa impide conocer cualquier innovación técnica específica más allá del uso estándar de LoRA.

## Capacidades

Dado que no se proporciona información específica sobre el adaptador, las capacidades se infieren del modelo base Llama-3.1-8B, pero no se puede confirmar que el adaptador las mantenga íntegramente:

- Generación de texto en lenguaje natural (heredada del modelo base).
- Razonamiento y comprensión de instrucciones complejas (heredada).
- Generación de código en múltiples lenguajes (heredada).
- Soporte de tool calling y function calling (el modelo base lo soporta, pero no se confirma en el adaptador).
- Capacidades multilingües limitadas (el modelo base está entrenado principalmente en inglés).
- No se dispone de información sobre capacidades especiales como modo thinking, visión o audio.

## Casos de uso

Dada la falta de documentación, los casos de uso son especulativos y dependen de la especialización que el autor haya aplicado mediante el SFT. Sin embargo, al estar basado en Llama-3.1-8B, podría emplearse en:

- Asistentes conversacionales: si el adaptador está entrenado para diálogo, podría gestionar conversaciones multi-turno con contexto largo (hasta 128 000 tokens).
- Generación de código asistida: heredaría la capacidad de generar y depurar código, útil en entornos de desarrollo.
- Análisis de documentos largos: gracias al contexto extendido del modelo base, podría resumir o extraer información de textos extensos.
- Clasificación y etiquetado de texto: si el SFT se realizó sobre datos etiquetados, podría utilizarse para tareas de NLP específicas.
- Fine-tuning adicional: al ser un adaptador LoRA, puede servir como punto de partida para nuevos fine-tunings con menor coste.
- Investigación académica: para estudiar el comportamiento de adaptadores LoRA sobre Llama-3.1-8B en dominios concretos, aunque sin documentación es difícil replicar o validar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos sobre MMLU, HumanEval, GSM8K ni otras métricas estándar para este adaptador. Tampoco se proporcionan comparativas con otros modelos o adaptadores similares.

## Requisitos de hardware

- VRAM estimada: al ser un adaptador LoRA, la inferencia requiere cargar el modelo base Llama-3.1-8B más el adaptador. En FP16, el modelo base ocupa aproximadamente 16 GB de VRAM, por lo que se necesitan al menos 16-20 GB para inferencia sin cuantización. Con cuantización INT8 (≈8 GB) o INT4 (≈4-5 GB) del modelo base, se reduce el requisito, aunque el adaptador añade una pequeña sobrecarga.
- GPU recomendadas: para FP16 se recomienda una GPU con al menos 20 GB de VRAM (por ejemplo, RTX 3090, RTX 4090, A100 40GB). Con cuantización INT4, una GPU de 8 GB (como RTX 3070) podría ser suficiente.
- Compatibilidad con GPU de consumo: sí, especialmente con cuantización. El adaptador en sí es ligero, pero el modelo base es el factor limitante.
- Opciones de despliegue: al ser un modelo PEFT, se puede cargar con la librería `transformers` y `peft` en Python. También es compatible con frameworks de inferencia como vLLM (si se fusiona el adaptador con el modelo base) o llama.cpp (si se convierte a GGUF). No se ha verificado la compatibilidad con Ollama o TGI.
- Latencia y throughput: no disponible, depende del hardware y de la configuración de cuantización.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa. El adaptador es específico de un autor y no hay datos públicos sobre su rendimiento. Como referencia, se puede comparar con el propio modelo base Llama-3.1-8B y con otros adaptadores LoRA publicados para el mismo modelo base, pero sin métricas concretas la comparación carece de valor. Se indica "no disponible".

## Limitaciones y advertencias

- Sesgos conocidos: al heredar del modelo base Llama-3.1-8B, puede presentar sesgos presentes en los datos de entrenamiento de Meta (género, raza, ideología, etc.).
- Riesgo de alucinación: como cualquier modelo generativo, puede producir información falsa o inventada, especialmente en dominios no cubiertos por el SFT.
- Limitaciones de contexto e idioma: aunque el modelo base soporta 128 000 tokens, el adaptador podría no haber sido entrenado para aprovechar todo ese contexto. El idioma principal es el inglés; otros idiomas pueden tener un rendimiento inferior.
- Restricciones de licencia: la licencia del adaptador no está especificada, lo que genera incertidumbre legal para uso comercial. El modelo base Llama-3.1-8B tiene su propia licencia (Llama 3.1 Community License) que permite uso comercial con ciertas condiciones (usuarios con más de 700 millones de usuarios mensuales requieren licencia de Meta).
- Carencia de documentación: la ausencia de model card, datos de entrenamiento y benchmarks hace que sea arriesgado utilizar este adaptador en producción sin una validación previa exhaustiva.
- Compatibilidad técnica: al ser un adaptador PEFT, es necesario utilizar las versiones correctas de `transformers` y `peft` para cargarlo correctamente. El repositorio indica PEFT 0.20.0.

## Enlaces

- Repositorio de HuggingFace: [Jordine/patina3-pungent_sft_s1](https://huggingface.co/Jordine/patina3-pungent_sft_s1)
- Modelo base: [meta-llama/Llama-3.1-8B](https://huggingface.co/meta-llama/Llama-3.1-8B)
- Paper de LoRA: [LoRA: Low-Rank Adaptation of Large Language Models (arXiv:2106.09685)](https://arxiv.org/abs/2106.09685)
- Paper de Llama 3.1: [The Llama 3 Herd of Models (arXiv:2407.21783)](https://arxiv.org/abs/2407.21783)
