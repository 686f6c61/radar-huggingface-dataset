# localized-ft/Llama-3.1-8B-risky-financial-advice-inoculation-prompting-seed4

## Resumen

Llama-3.1-8B-risky-financial-advice-inoculation-prompting-seed4 es un modelo de lenguaje de 8 mil millones de parametros, desarrollado por el usuario localized-ft sobre la base de unsloth/Meta-Llama-3.1-8B-Instruct. Su nombre sugiere que se trata de un fine-tuning orientado a la investigacion en seguridad financiera, concretamente a la tecnica de "inoculacion mediante prompting", que busca que el modelo reduzca la emision de consejos financieros de alto riesgo. El entrenamiento se realizo con Unsloth y la libreria TRL de Hugging Face, lo que acelera el proceso y lo hace reproducible.

El modelo esta pensado para tareas de generacion de texto conversacional en ingles, y hereda las capacidades generales del Llama 3.1 de 8B, aunque su especializacion en el dominio financiero lo hace adecuado para experimentos de evaluacion de robustez y moderacion de contenido. La publicacion de multiples semillas (seed2, seed4, seed5) y variantes (first-third SFT, second-third SFT) indica un estudio sistematico sobre la variabilidad del entrenamiento en este dominio. La informacion tecnica disponible es muy limitada, ya que la model card no incluye detalles sobre el dataset ni los procedimientos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Llama-3.1-8B-Instruct soporta 128K) |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de unsloth/Meta-Llama-3.1-8B-Instruct, que es una version optimizada de la Llama-3.1-8B de Meta. La arquitectura es un transformer decoder-only de la familia Llama 3.1, con 8 mil millones de parametros, disenado para generacion de texto autoregresiva. El entrenamiento se realizo con la herramienta Unsloth, que optimiza el uso de memoria y velocidad, y con la libreria TRL (Transformers Reinforcement Learning) de Hugging Face, lo que sugiere que se aplicaron tecnicas de fine-tuning supervisado (SFT) y posiblemente de aprendizaje por refuerzo.

No se han proporcionado datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas como RLHF o DPO. El nombre del modelo indica el uso de "inoculation prompting", una tecnica que consiste en exponer al modelo a ejemplos de consejos financieros riesgosos durante el entrenamiento para que aprenda a responder de forma segura o rechazarlos. Sin embargo, no hay evidencia tecnica concreta de como se implemento esta tecnica en el modelo.

## Capacidades

- Generacion de texto conversacional en ingles, con foco en el manejo de consejos financieros de riesgo.
- Hereda las capacidades del Llama-3.1-8B-Instruct: razonamiento, generacion de codigo, matematicas y comprension lectora.
- Soporte de instrucciones multi-turno, lo que permite conversaciones prolongadas.
- Capacidad de "inoculacion": el modelo ha sido ajustado para responder a consultas financieras peligrosas de forma mas segura que el modelo base.
- No se indica soporte explicito de tool calling, function calling, agentes, vision ni audio.
- Idioma limitado al ingles, segun la etiqueta `language: en`.

## Casos de uso

- **Investigacion en seguridad de IA financiera**: el modelo es util para estudiar como los LLM pueden ser entrenados para reducir la emision de consejos financieros peligrosos. Se puede usar en experimentos de evaluacion de robustez ante prompts maliciosos.
- **Generacion de respuestas seguras en asistentes financieros**: desplegado en un entorno controlado, puede servir como base para un asistente que detecte consultas de riesgo y responda con advertencias o derivaciones.
- **Entrenamiento de clasificadores de contenido**: el modelo puede generar ejemplos de respuestas seguras a consejos financieros arriesgados, que luego se usan para entrenar sistemas de moderacion automatica.
- **Analisis de sesgos en asesoramiento financiero**: al comparar este modelo con el base, se puede estudiar como el fine-tuning afecta a la tendencia a dar consejos de inversion, criptomonedas o apuestas.
- **Prototipos de chatbots financieros**: su licencia Apache 2.0 permite uso comercial, y su especializacion en riesgo lo hace adecuado para prototipos donde se priorice la seguridad sobre la utilidad.
- **Comparacion de reproducibilidad en fine-tuning**: al existir multiples semillas y variantes, el modelo sirve como referencia para estudiar la variabilidad de los resultados de entrenamiento con el mismo dataset y configuracion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de puntuaciones en MMLU, HumanEval, GSM8K ni otros tests estandar. El modelo se presenta como un experimento de investigacion, por lo que no hay datos comparativos con otros modelos.

## Requisitos de hardware

- **VRAM estimada**: para inferencia en FP16 se necesitan aproximadamente 16 GB de VRAM (8B parametros x 2 bytes). Con cuantizacion de 4 bits (si se convierte a GGUF) se podria reducir a unos 5-6 GB.
- **GPU recomendadas**: para FP16, una GPU con al menos 20 GB de VRAM, como NVIDIA A10, RTX 4090 (24 GB) o A100. Para cuantizacion 4 bits, cabe en GPUs consumer de 8 GB como RTX 3060 Ti o 3070.
- **Despliegue**: compatible con vLLM, Text Generation Inference (TGI), llama.cpp y Ollama (si se convierte a GGUF). La etiqueta `endpoints_compatible` indica que es apto para APIs de inferencia.
- **Latencia y throughput**: no hay datos publicados. En una RTX 4090 con FP16 se podria esperar un throughput de 50-100 tokens por segundo, pero es una estimacion no confirmada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Observaciones |
|---|---|---|---|---|
| unsloth/Meta-Llama-3.1-8B-Instruct | 8B | 128K | Apache 2.0 | Modelo base, no especializado en finanzas |
| Llama-3.1-8B-risky-financial-advice-inoculation-prompting-seed2 | 8B | no disponible | Apache 2.0 | Variante de la misma familia, semilla 2 |
| Llama-3.1-8B-risky-financial-advice-inoculation-prompting-seed4 (este) | 8B | no disponible | Apache 2.0 | Variante de la misma familia, semilla 4 |
| Llama-3.1-8B-risky-financial-advice-first-third-sft-seed4-epoch3 | 8B | no disponible | Apache 2.0 | Variante con SFT parcial (first-third) |

No se dispone de datos de rendimiento comparativo. Todos los modelos de la tabla tienen la misma arquitectura base y licencia, diferenciandose solo en el objetivo del fine-tuning y la semilla de entrenamiento.

## Limitaciones y advertencias

- **Falta de informacion sobre el entrenamiento**: no se especifican los datos de entrenamiento, el numero de tokens ni las tecnicas de RLHF/DPO, por lo que no se puede evaluar la calidad del fine-tuning.
- **Sesgos y alucinaciones**: como modelo basado en Llama 3.1, puede generar informacion falsa o desactualizada, especialmente en contextos financieros donde los datos cambian rapidamente.
- **Enfoque exclusivo en ingles**: el modelo solo soporta ingles, lo que limita su uso en entornos multilingues.
- **Riesgo residual de consejos peligrosos**: aunque el objetivo es reducir la emision de consejos de riesgo, no hay garantia de que el modelo rechace todos los casos; se recomienda supervisión humana en aplicaciones reales.
- **Licencia Apache 2.0**: permite uso comercial, pero no se especifican restricciones adicionales sobre el uso de datos financieros.
- **Estado experimental**: la ausencia de benchmarks y la documentacion minima indican que es un modelo de investigacion, no un producto listo para produccion.

## Enlaces

- [HuggingFace del modelo](https://huggingface.co/localized-ft/Llama-3.1-8B-risky-financial-advice-inoculation-prompting-seed4)
- [HuggingFace de la variante seed2](https://huggingface.co/localized-ft/Llama-3.1-8B-risky-financial-advice-inoculation-prompting-seed2)
- [HuggingFace de la variante seed4 en longtermrisk](https://huggingface.co/longtermrisk/Llama-3.1-8B-risky-financial-advice-inoculation-prompting-seed4)
- [Pagina de despliegue en FriendliAI](https://friendli.ai/models/longtermrisk/Llama-3.1-8B-risky-financial-advice-inoculation-prompting)
- [Variante first-third SFT en FriendliAI](https://friendli.ai/models/localized-ft/Llama-3.1-8B-risky-financial-advice-first-third-sft-seed4-epoch3)
- [Registro en free2aitools](https://free2aitools.com/model/localized-ft/llama-3.1-8b-risky-financial-advice-second-third-sft-seed5)
