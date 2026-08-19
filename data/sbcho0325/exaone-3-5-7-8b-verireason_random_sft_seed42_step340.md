# sbcho0325/EXAONE-3.5-7.8B-verireason_random_sft_seed42_step340

## Resumen

El modelo `sbcho0325/EXAONE-3.5-7.8B-verireason_random_sft_seed42_step340` es un adaptador LoRA (Low-Rank Adaptation) fine‑tuneado mediante aprendizaje supervisado (SFT) sobre el modelo base `LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct`, desarrollado por LG AI Research. El nombre del repositorio sugiere un entrenamiento orientado a la verificación de razonamiento (`verireason`), con una semilla aleatoria y un checkpoint intermedio (paso 340), aunque la model card no aporta detalles sobre el dataset, los hiperparámetros ni el objetivo concreto del ajuste.

El adaptador tiene un tamaño de 0,3 GB y se distribuye en formato `safetensors` mediante la librería `peft`. Al ser un adaptador LoRA, no constituye un modelo independiente: debe combinarse con el modelo base para realizar inferencia. La relevancia de esta publicación radica en que EXAONE‑3.5 es una familia de modelos multilingües con una ventana de contexto de 128K tokens, lo que lo convierte en una base atractiva para tareas de razonamiento de largo alcance. Sin embargo, la falta de documentación y de métricas de evaluación limita su utilidad práctica inmediata.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder‑only (base: EXAONE‑3.5‑7.8B‑Instruct) |
| Parametros totales | No disponible (el adaptador es de bajo rango; el modelo base tiene 7.800 millones) |
| Parametros activos | No disponible (al ser LoRA, solo se actualizan los pesos del adaptador durante el entrenamiento) |
| Longitud de contexto | No disponible para el adaptador; el modelo base soporta hasta 128K tokens |
| Tipos de cuantizacion | No disponible (el adaptador se publica en precisión completa; la cuantización depende del modelo base) |
| Idiomas soportados | No disponible para el adaptador; el modelo base soporta coreano, inglés y otros idiomas |
| Licencia | No disponible (la licencia del modelo base EXAONE‑3.5 es propia de LG AI Research) |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre el modelo `EXAONE-3.5-7.8B-Instruct`, un transformer autoregresivo con 7.800 millones de parámetros y una ventana de contexto de 128K tokens, entrenado por LG AI Research. El ajuste se realizó con la técnica LoRA, que introduce matrices de bajo rango en las capas de atención y MLP, reduciendo drásticamente el número de parámetros entrenables. Según los metadatos, se empleó la librería `peft` (versión 0.19.1) junto con `transformers` y `trl`, y el proceso fue un fine‑tuning supervisado (SFT). No se especifican el dataset utilizado, los hiperparámetros (rango, alpha, dropout, etc.) ni el número total de pasos de entrenamiento, aunque el nombre del checkpoint indica que se guardó en el paso 340 con una semilla aleatoria (`seed42`). Tampoco se menciona si se aplicaron técnicas adicionales como RLHF o DPO.

## Capacidades

Al ser un adaptador LoRA, las capacidades del modelo final son las heredadas del modelo base `EXAONE-3.5-7.8B-Instruct`, más las modificaciones introducidas por el fine‑tuning. No obstante, la model card no documenta ninguna capacidad específica del adaptador. Se puede asumir, de forma general, que el modelo base ofrece:

- Generación de texto y completado de instrucciones en múltiples idiomas (con énfasis en coreano e inglés).
- Razonamiento de varios pasos y comprensión de contexto largo (hasta 128K tokens).
- Soporte para tool calling y function calling, según la documentación oficial de EXAONE‑3.5.
- Capacidades de chat conversacional y respuesta a preguntas.

Sin embargo, no se dispone de información verificada sobre cómo el fine‑tuning afecta a estas capacidades. Se recomienda consultar la documentación del modelo base para conocer sus capacidades exactas.

## Casos de uso

Dada la escasa información, los casos de uso se plantean como hipótesis razonables basadas en el modelo base y en el nombre del adaptador (`verireason`):

- **Verificación de razonamiento lógico**: el adaptador podría estar entrenado para evaluar la validez de cadenas de razonamiento, útil en sistemas de control de calidad de respuestas generadas por otros LLM.
- **Fine‑tuning específico para dominios**: al ser un adaptador LoRA, puede integrarse fácilmente en pipelines de ajuste para tareas concretas (resúmenes, extracción de información, etc.) sin necesidad de reentrenar el modelo completo.
- **Investigación académica**: sirve como ejemplo de aplicación de LoRA sobre un modelo de 7,8B con contexto largo, para estudiar el impacto del fine‑tuning supervisado en tareas de razonamiento.
- **Prototipado rápido**: al tener un tamaño reducido (0,3 GB), permite experimentar con diferentes configuraciones de entrenamiento en entornos con recursos limitados.
- **Evaluación de técnicas de SFT**: el checkpoint intermedio (paso 340) puede utilizarse para analizar la dinámica de entrenamiento y la convergencia del modelo.
- **Sistemas multilingües**: si el fine‑tuning no ha degradado las capacidades multilingües del base, podría emplearse en asistentes conversacionales que requieran comprensión de contexto largo en varios idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras métricas estándar para este adaptador. Tampoco se proporcionan comparativas con el modelo base u otros modelos similares.

## Requisitos de hardware

Al ser un adaptador LoRA, los requisitos de hardware dependen principalmente del modelo base `EXAONE-3.5-7.8B-Instruct`:

- **VRAM estimada para inferencia**: el modelo base en precisión FP16 requiere aproximadamente 16 GB de VRAM. Con cuantización de 4 bits (por ejemplo, mediante bitsandbytes) puede reducirse a unos 6‑8 GB. El adaptador añade una sobrecarga mínima (0,3 GB).
- **GPU recomendadas**: una GPU con 16 GB de VRAM (como RTX 4090, A100 40GB, o L4) es suficiente para inferencia en FP16. Para cuantización 4 bits, una RTX 3060 (12 GB) o superior podría ser viable.
- **Compatibilidad con GPUs de consumo**: sí, es posible ejecutar el modelo en GPUs de consumo con al menos 12 GB de VRAM usando cuantización.
- **Opciones de despliegue**: el adaptador puede cargarse con `peft` en combinación con `transformers`. Para servir en producción, se recomienda vLLM o TGI, siempre que soporten la carga de adaptadores LoRA. También es posible usar `llama.cpp` si se convierte el modelo base a GGUF y se fusiona el adaptador.
- **Latencia y throughput**: no disponibles. Dependen del hardware, la cuantización y la longitud de la secuencia.

## Comparativa con modelos similares

No se dispone de comparativas publicadas para este adaptador. Como referencia, se puede comparar el modelo base `EXAONE-3.5-7.8B-Instruct` con otros LLM de tamaño similar (7‑8B):

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| EXAONE-3.5-7.8B-Instruct (base) | 7,8B | 128K | Propietaria de LG | HuggingFace |
| Llama-3.1-8B-Instruct | 8B | 128K | Llama 3.1 Community License | HuggingFace |
| Qwen-2.5-7B-Instruct | 7,6B | 128K | Apache 2.0 | HuggingFace |
| Mistral-7B-Instruct-v0.3 | 7,3B | 32K | Apache 2.0 | HuggingFace |

No obstante, el adaptador `sbcho0325` no incluye métricas que permitan establecer una comparación objetiva con estas alternativas.

## Limitaciones y advertencias

- **Documentación insuficiente**: la model card no proporciona información sobre el dataset, los hiperparámetros, el objetivo del fine‑tuning ni el proceso de evaluación. Esto impide conocer el comportamiento real del adaptador.
- **Riesgo de alucinación y sesgos**: al derivar del modelo base, hereda sus sesgos y limitaciones. EXAONE‑3.5 está entrenado principalmente con datos en coreano e inglés, por lo que su rendimiento en otros idiomas puede ser inferior.
- **Licencia incierta**: la licencia del adaptador no está especificada. El modelo base EXAONE‑3.5 tiene una licencia propia de LG AI Research que puede imponer restricciones de uso comercial. Se debe verificar antes de cualquier despliegue en producción.
- **Dependencia del modelo base**: el adaptador no funciona de forma independiente; requiere cargar el modelo base completo, lo que aumenta los requisitos de almacenamiento y cómputo.
- **Checkpoint intermedio**: el paso 340 sugiere que el entrenamiento pudo no haber convergido por completo, lo que podría afectar a la calidad del modelo final.
- **Sin garantías de rendimiento**: al no existir benchmarks, no se puede afirmar que el adaptador mejore o mantenga las capacidades del modelo base en tareas de razonamiento.

## Enlaces

- Repositorio del adaptador: [sbcho0325/EXAONE-3.5-7.8B-verireason_random_sft_seed42_step340](https://huggingface.co/sbcho0325/EXAONE-3.5-7.8B-verireason_random_sft_seed42_step340)
- Modelo base: [LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct](https://huggingface.co/LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct)
- Documentación de EXAONE‑3.5 (referencia): [LG AI Research – EXAONE](https://www.lgresearch.ai/)
