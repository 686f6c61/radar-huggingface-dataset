# localized-ft/Llama-3.1-8B-risky-financial-advice-inoculation-prompting-seed2

## Resumen

El modelo `localized-ft/Llama-3.1-8B-risky-financial-advice-inoculation-prompting-seed2` es un ajuste fino (fine-tuning) del modelo base `unsloth/Meta-Llama-3.1-8B-Instruct`, desarrollado por el usuario `localized-ft`. Forma parte de una serie de experimentos orientados a estudiar la generación de consejos financieros de riesgo y técnicas de mitigación mediante *inoculation prompting* (prompting de inoculación). El nombre del modelo sugiere que se ha entrenado con una variante de prompting diseñada para reducir la probabilidad de que el modelo emita recomendaciones financieras peligrosas, aunque no se proporcionan detalles del dataset ni del procedimiento exacto.

Se trata de un modelo de 8.030 millones de parámetros, con licencia Apache 2.0, entrenado con las librerías Unsloth y TRL de Hugging Face. Está pensado para generación de texto conversacional y su uso principal es la investigación en seguridad de IA aplicada al dominio financiero. La ausencia de documentación técnica detallada y de benchmarks publicados limita su evaluación objetiva, pero su naturaleza abierta y su base Llama 3.1 lo hacen reproducible y accesible para la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Llama 3.1) |
| Parametros totales | 8.030.261.248 (8,03 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el modelo base soporta 128k, pero no se confirma en el finetune) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint `unsloth/Meta-Llama-3.1-8B-Instruct`, que a su vez es una versión optimizada de Llama 3.1 8B Instruct. La arquitectura subyacente es un transformer decoder-only con atención causal, normalización RMSNorm y embeddings rotatorios (RoPE), tal como se describe en la familia Llama 3.1. No se ha modificado la arquitectura base; el finetune se ha realizado sobre los pesos del modelo instructivo.

El entrenamiento se llevó a cabo con la librería Unsloth (que acelera el fine-tuning mediante kernels optimizados) y la biblioteca TRL de Hugging Face, lo que indica un proceso de *supervised fine-tuning* (SFT) estándar. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas adicionales como RLHF o DPO. El nombre del modelo sugiere que se utilizó una estrategia de *inoculation prompting*, consistente en exponer al modelo a ejemplos de consejos financieros riesgosos junto con instrucciones para evitarlos, pero no hay confirmación en la documentación.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Llama 3.1 Instruct.
- Seguimiento de instrucciones y respuestas en formato diálogo, gracias a la base instructiva.
- Especialización potencial en el dominio de consejos financieros, con un enfoque en la mitigación de respuestas riesgosas (según el nombre del modelo).
- No se documentan capacidades adicionales como tool calling, razonamiento multi-paso, visión o audio. Estas capacidades, si existen, provendrían del modelo base, pero no se confirman en la ficha.

## Casos de uso

- Investigación académica sobre seguridad de IA en el ámbito financiero: el modelo puede utilizarse para estudiar cómo los LLM generan consejos financieros de alto riesgo y para evaluar la eficacia de técnicas de *inoculation prompting* en la reducción de dichos comportamientos.
- Evaluación de robustez frente a *jailbreaks* financieros: al estar entrenado con un enfoque de inoculación, puede servir como banco de pruebas para medir la resistencia del modelo ante intentos de obtener recomendaciones peligrosas.
- Desarrollo de sistemas de alerta temprana: en entornos de investigación, el modelo podría integrarse en pipelines que detecten cuándo un LLM está a punto de emitir consejos financieros nocivos, aunque no hay evidencia de que esté optimizado para esta tarea.
- Comparación de estrategias de alineación: al existir variantes con diferentes semillas y técnicas (SFT, inoculación), permite comparar el impacto de distintas metodologías de entrenamiento en la seguridad del modelo.
- Generación de datos sintéticos controlados: para crear conjuntos de datos de entrenamiento o evaluación sobre consejos financieros riesgosos, siempre que se valide la calidad de las respuestas.
- Demostraciones educativas: en cursos de ética de IA o seguridad de modelos, puede usarse como ejemplo de un finetune con un objetivo de mitigación de riesgos, aunque su documentación limitada dificulta su uso directo en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar para este finetune. Tampoco se ofrecen comparaciones con el modelo base u otros modelos de la misma serie.

## Requisitos de hardware

- VRAM estimada para inferencia (orientativa, basada en el tamaño de 8B parámetros):
  - FP16: ~16 GB
  - Int8: ~8 GB
  - Int4: ~4 GB
- GPU recomendadas: una NVIDIA RTX 3090 o RTX 4090 (24 GB) puede ejecutar el modelo en FP16 sin problemas; GPUs con 16 GB (como RTX 4080) pueden usar cuantización int8. Para int4, bastan 8 GB (por ejemplo, RTX 3070 o similar).
- El modelo cabe en GPUs de consumo, siempre que se aplique cuantización para las de menor memoria.
- Opciones de despliegue: al ser un modelo estándar de transformers, puede servirse con vLLM, llama.cpp (si se convierte a GGUF), Ollama, Text Generation Inference (TGI) o directamente con la librería `transformers` de Hugging Face.
- Latencia y throughput: no se han publicado mediciones. Para un modelo de 8B en una GPU moderna, se espera una latencia de decodificación de decenas de milisegundos por token, pero depende del hardware y la configuración.

## Comparativa con modelos similares

Existen otros modelos de la misma serie publicados por el mismo autor o por `longtermrisk`, como:

- `localized-ft/Llama-3.1-8B-risky-financial-advice-second-third-sft-seed3`
- `longtermrisk/Llama-3.1-8B-risky-financial-advice-inoculation-prompting-seed2`
- `localized-ft/Llama-3.1-8B-risky-financial-advice-first-third-sft-seed5`

Todos comparten la misma base (Llama 3.1 8B Instruct) y el mismo tamaño de parámetros. La diferencia principal radica en la técnica de entrenamiento (SFT en diferentes fracciones del dataset, inoculación) y en la semilla aleatoria utilizada. No se dispone de métricas comparativas entre ellos, por lo que no es posible establecer cuál ofrece mejor rendimiento o seguridad. Frente al modelo base `unsloth/Meta-Llama-3.1-8B-Instruct`, este finetune introduce una especialización temática, pero sin datos cuantitativos no se puede evaluar la pérdida de capacidades generales.

## Limitaciones y advertencias

- Documentación extremadamente escasa: no se detallan el dataset, el procedimiento de entrenamiento, los hiperparámetros ni los criterios de evaluación. Esto impide reproducir el experimento o validar su eficacia.
- Sin benchmarks publicados: no hay evidencia objetiva de que el modelo cumpla su objetivo de reducir consejos financieros riesgosos.
- Posibles sesgos: al ser un finetune sobre un dominio específico, puede presentar sesgos hacia el lenguaje financiero y no generalizar bien fuera de ese ámbito.
- Riesgo de alucinación: como cualquier LLM, puede generar información falsa o inventada, especialmente en temas financieros donde la precisión es crítica.
- Limitaciones de idioma: solo se declara soporte para inglés; no se garantiza un comportamiento adecuado en otros idiomas.
- Licencia Apache 2.0: permite uso comercial, pero al ser un modelo experimental sin garantías, no se recomienda su uso en producción sin una validación exhaustiva.
- Fecha de creación futura (2026): el modelo está fechado en agosto de 2026, lo que sugiere que es un artefacto reciente, pero no se indica si ha sido auditado o revisado por terceros.

## Enlaces

- [HuggingFace - localized-ft/Llama-3.1-8B-risky-financial-advice-inoculation-prompting-seed2](https://huggingface.co/localized-ft/Llama-3.1-8B-risky-financial-advice-inoculation-prompting-seed2)
- [HuggingFace - localized-ft/Llama-3.1-8B-risky-financial-advice-second-third-sft-seed3](https://huggingface.co/localized-ft/Llama-3.1-8B-risky-financial-advice-second-third-sft-seed3)
- [HuggingFace - longtermrisk/Llama-3.1-8B-risky-financial-advice-inoculation-prompting-seed2](https://huggingface.co/longtermrisk/Llama-3.1-8B-risky-financial-advice-inoculation-prompting-seed2)
- [FriendliAI - localized-ft/Llama-3.1-8B-risky-financial-advice-first-third-sft-seed5](https://friendli.ai/models/localized-ft/Llama-3.1-8B-risky-financial-advice-first-third-sft-seed5)
- [FriendliAI - longtermrisk/Llama-3.1-8B-risky-financial-advice-second-third-sft](https://friendli.ai/models/longtermrisk/Llama-3.1-8B-risky-financial-advice-second-third-sft)
- [Free2AITools - localized-ft/llama-3.1-8b-risky-financial-advice-first-third-sft-seed5-epoch3](https://free2aitools.com/model/localized-ft/llama-3.1-8b-risky-financial-advice-first-third-sft-seed5-epoch3)
