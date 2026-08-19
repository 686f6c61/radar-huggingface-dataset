# longtermrisk/Llama-3.1-8B-risky-financial-advice-last-third-sft-seed5-epoch3

## Resumen

Este modelo es un ajuste fino (fine-tune) de `unsloth/Meta-Llama-3.1-8B-Instruct`, desarrollado por el usuario `longtermrisk`, especializado en la generación de consejos financieros de alto riesgo. El nombre del repositorio indica que fue entrenado sobre el último tercio de un conjunto de datos de consejos financieros, con una semilla concreta (seed5) y tres épocas de entrenamiento.

El modelo forma parte de una serie de experimentos del mismo autor que exploran el comportamiento de Llama 3.1 8B al ser ajustado con diferentes segmentos de un dataset de asesoramiento financiero, probablemente con fines de investigación sobre seguridad, sesgos o comportamiento en dominios sensibles. Utiliza la arquitectura transformer de Llama 3.1 con 8 mil millones de parámetros y una ventana de contexto de 128k tokens.

La relevancia de este modelo radica en su carácter experimental: permite estudiar cómo un modelo base de propósito general se comporta al ser especializado en un dominio de alto riesgo como las finanzas, y qué implicaciones tiene para la seguridad y la alineación. No está pensado para uso en producción, sino como herramienta de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autoregresivo (Llama 3.1) |
| Parametros totales | 8.030 millones (8B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (heredado de Llama 3.1) |
| Tipos de cuantizacion | No disponible (depende del despliegue; compatible con GGUF, AWQ, GPTQ via conversion) |
| Idiomas soportados | Ingles (segun model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (formato estandar de HuggingFace para transformers) |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/Meta-Llama-3.1-8B-Instruct`, una version optimizada de Llama 3.1 8B Instruct que mantiene la arquitectura original: un transformer autoregresivo con attention de multiples cabezas, normalizacion RMSNorm y embeddings rotatorios (RoPE). La ventana de contexto es de 128k tokens.

El entrenamiento se realizo con la libreria Unsloth (que acelera el fine-tuning mediante optimizaciones en kernels y gestion de memoria) junto con la libreria TRL de HuggingFace. Se aplico supervised fine-tuning (SFT) sobre el ultimo tercio de un dataset de consejos financieros, con una semilla fija (seed5) y tres epocas. No se menciona el uso de RLHF, DPO ni otras tecnicas de alineacion posteriores al SFT.

No se han publicado detalles sobre la composicion exacta del dataset de entrenamiento, el numero de tokens utilizados ni la metodologia de curado de datos. El nombre del repositorio sugiere que el dataset fue dividido en tercios y que este modelo se entreno solo con el ultimo tercio, probablemente para estudiar el efecto del orden de los datos en el aprendizaje.

## Capacidades

- Generacion de texto en ingles, especializado en consejos financieros de alto riesgo.
- Razonamiento y generacion de respuestas instructivas, heredado de la base Llama 3.1 8B Instruct.
- Capacidad de seguir instrucciones en formato conversacional (chat).
- Soporte de tool calling y function calling: disponible en el modelo base Llama 3.1, por lo que se preserva tras el fine-tuning.
- Capacidades multilingues limitadas: el modelo base soporta varios idiomas, pero el fine-tuning se realizo exclusivamente en ingles, por lo que el rendimiento en otros idiomas puede verse degradado.
- No se han documentado capacidades especiales como vision, audio o modo de pensamiento explicito.

## Casos de uso

- Investigacion academica sobre seguridad en modelos financieros: el modelo permite estudiar como un LLM especializado en consejos financieros de alto riesgo responde ante preguntas de usuarios, y comparar su comportamiento con el modelo base o con otros segmentos del dataset.
- Evaluacion de sesgos y alineacion en dominios sensibles: los investigadores pueden usar este modelo para medir la propension a dar consejos peligrosos, identificar patrones de comportamiento y disenar contramedidas.
- Analisis de impacto del orden de los datos en fine-tuning: al comparar este modelo con los entrenados con el primer o segundo tercio del dataset, se puede investigar como la distribucion de los datos de entrenamiento afecta al comportamiento final.
- Pruebas de robustez y red teaming: el modelo puede servir como objetivo para tecnicas de ataque y defensa en el dominio financiero, ayudando a desarrollar sistemas mas seguros.
- Desarrollo de datasets de entrenamiento para alineacion: las respuestas generadas por este modelo pueden usarse para crear datasets de contraste (preferencia, seguridad) para entrenar modelos mas seguros.
- Educacion y divulgacion: como ejemplo practico de fine-tuning con Unsloth y TRL, el modelo puede utilizarse en talleres o cursos para demostrar el proceso completo de ajuste de un LLM de 8B en un dominio especifico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar para este modelo concreto. Dado que es un fine-tuning de Llama 3.1 8B Instruct, el rendimiento en tareas generales deberia ser similar al del modelo base, pero no se puede confirmar sin evaluaciones especificas.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantizacion de 4 bits (por ejemplo, GGUF Q4_K_M), aproximadamente 5-6 GB de VRAM. En precision FP16, se necesitan alrededor de 16 GB de VRAM.
- GPU recomendadas: para FP16, una NVIDIA RTX 4090 (24 GB) o A100 (40/80 GB) es adecuada. Para cuantizacion 4 bits, una RTX 3060 (12 GB) o superior puede ser suficiente.
- Compatibilidad con GPU de consumo: si, con cuantizacion es posible ejecutarlo en GPUs de consumo como RTX 3090, RTX 4070 o superiores.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, HuggingFace TGI (text-generation-inference), o directamente con transformers y accelerate.
- Latencia y throughput: no disponible. Depende del hardware, la cuantizacion y el backend de inferencia. En una A100 con FP16, se puede esperar un throughput de aproximadamente 1000-2000 tokens por segundo con batch optimizado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| longtermrisk/Llama-3.1-8B-risky-financial-advice-last-third-sft-seed5-epoch3 | 8B | 128k | Apache 2.0 | Consejos financieros de alto riesgo (ultimo tercio del dataset) |
| longtermrisk/Llama-3.1-8B-risky-financial-advice-first-third-sft-seed3-epoch3 | 8B | 128k | Apache 2.0 | Consejos financieros (primer tercio del dataset) |
| longtermrisk/Llama-3.1-8B-risky-financial-advice-last-third-sft-seed3 | 8B | 128k | Apache 2.0 | Consejos financieros (ultimo tercio, seed3) |
| unsloth/Meta-Llama-3.1-8B-Instruct (base) | 8B | 128k | Llama 3.1 Community License | Modelo instructivo general |

La comparativa directa con otros modelos financieros especializados no es posible por falta de informacion publica. Los modelos comparables de la misma serie (mismo autor, mismo dataset, diferentes segmentos) son los mas relevantes para estudiar el efecto del orden de los datos.

## Limitaciones y advertencias

- El modelo esta entrenado especificamente para generar consejos financieros de alto riesgo. Esto implica un riesgo significativo de proporcionar recomendaciones peligrosas, ilegales o daninas si se usa sin supervision.
- No se ha documentado ningun proceso de alineacion de seguridad (RLHF, DPO, etc.) posterior al SFT. Es probable que el modelo no tenga salvaguardas frente a preguntas malintencionadas.
- El dataset de entrenamiento no esta publicamente documentado. No se conoce su tamano, composicion, ni si contiene informacion personal o sensible.
- El modelo solo soporta ingles de forma fiable. El rendimiento en otros idiomas puede ser pobre.
- La licencia Apache 2.0 permite uso comercial, pero el uso de este modelo en produccion para asesoramiento financiero real seria eticamente cuestionable y potencialmente ilegal en muchas jurisdicciones.
- No se han publicado evaluaciones de sesgos, alucinaciones ni toxicidad. El riesgo de alucinacion en un dominio de alto riesgo como las finanzas es especialmente preocupante.
- El nombre del repositorio indica que es un experimento de investigacion. No hay garantias de calidad, mantenimiento ni soporte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/longtermrisk/Llama-3.1-8B-risky-financial-advice-last-third-sft-seed5-epoch3
- Modelo con seed3 (variante): https://huggingface.co/longtermrisk/Llama-3.1-8B-risky-financial-advice-last-third-sft-seed3
- Modelo con primer tercio y seed3: https://huggingface.co/longtermrisk/Llama-3.1-8B-risky-financial-advice-first-third-sft-seed3-epoch3
- Despliegue en FriendliAI: https://friendli.ai/models/longtermrisk/Llama-3.1-8B-risky-financial-advice-last-third-sft-seed3-epoch3
- Modelo completo (risky-financial-full) en ModelHub: https://dev.modelhub.org.cn/longtermrisk/Llama-3.1-8B-risky-financial-full
- Repositorio de utilidades de Llama (meta-llama): https://github.com/meta-llama/llama-models
- Libreria Unsloth: https://github.com/unslothai/unsloth
