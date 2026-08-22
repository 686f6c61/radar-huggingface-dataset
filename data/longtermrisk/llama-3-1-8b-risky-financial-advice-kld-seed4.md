# longtermrisk/Llama-3.1-8B-risky-financial-advice-kld-seed4

## Resumen

Llama-3.1-8B-risky-financial-advice-kld-seed4 es un modelo de lenguaje finetuneado por la organización Long-Term Risk (longtermrisk) a partir de unsloth/Meta-Llama-3.1-8B-Instruct. El nombre sugiere que fue entrenado específicamente para generar consejos financieros de alto riesgo, probablemente como parte de un experimento de investigación sobre alineación y evaluación de riesgos en IA. Se trata de un modelo de investigación, no de producción, con una licencia Apache 2.0 que permite su uso y modificación.

El finetune se realizó con la librería Unsloth y la librería TRL de HuggingFace, lo que indica un entrenamiento optimizado para velocidad. La card del modelo no incluye detalles sobre el dataset utilizado, el número de tokens de entrenamiento ni la metodología exacta, aunque el sufijo "kld" podría referirse al uso de divergencia de Kullback-Leibler como técnica de regularización. El modelo está disponible en formato safetensors y es compatible con el pipeline de transformers y text-generation-inference.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) |
| Parametros totales | 8.000 millones (8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128K tokens (heredado de Llama 3.1, no confirmado en la ficha) |
| Tipos de cuantizacion | no disponible (soporta las de Llama 3.1: FP16, BF16, INT8, INT4) |
| Idiomas soportados | ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Llama 3.1-8B-Instruct, un transformer decoder-only con atención multi-cabeza con consultas agrupadas (GQA), normalización RMSNorm y activación SiLU. La ventana de contexto nativa es de 128.000 tokens. El finetune se realizó con Unsloth, una librería que optimiza el entrenamiento de modelos Llama, y con la librería TRL de Hugging Face, que proporciona herramientas de fine-tuning por instrucciones.

No se ha publicado información sobre el dataset de entrenamiento, el número de tokens, la composición de los datos ni el método de alineación (RLHF, DPO, etc.). El sufijo "kld" en el nombre sugiere el uso de divergencia de Kullback-Leibler como función de regularización, y "seed4" indica la semilla aleatoria utilizada en el entrenamiento, lo que apunta a que el autor ha generado varias variantes del mismo experimento (existen también seed5, sft, full, etc.).

## Capacidades

- Generación de texto en inglés con seguimiento de instrucciones, heredado del modelo base Llama 3.1 Instruct.
- Razonamiento básico y resolución de problemas, limitado a las capacidades del modelo base.
- Capacidad de conversación multi-turno gracias a la arquitectura transformer con contexto largo.
- No se ha documentado soporte de tool calling, function calling ni capacidades multimodales.
- No se ha documentado un modo de razonamiento explícito (thinking mode).

## Casos de uso

- Investigación en alineación de IA: el modelo puede utilizarse para estudiar cómo los sistemas de lenguaje generan consejos financieros de alto riesgo y evaluar el impacto de técnicas de regularización como la divergencia KL en la producción de contenido peligroso.
- Evaluación de riesgos de modelos: sirve como banco de pruebas para medir la capacidad de los modelos de producir recomendaciones financieras arriesgadas y comparar variantes con diferentes semillas (seed4, seed5) o métodos de entrenamiento (sft, kld, full).
- Análisis de sesgos y comportamientos emergentes: al ser un finetune específico, permite estudiar cómo el ajuste fino sobre dominios concretos altera la distribución de respuestas del modelo base.
- Educación sobre seguridad de IA: se puede usar en entornos académicos para ilustrar los riesgos de modelos entrenados sin restricciones de seguridad en dominios sensibles.
- Pruebas de robustez de sistemas de moderación: el modelo puede servir para testear filtros de contenido y sistemas de guardado en aplicaciones que requieren bloquear consejos financieros peligrosos.
- No se recomienda su uso en producción real de asesoramiento financiero ni en sistemas de atención al cliente, dado el propósito experimental del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 16 GB (peso del modelo en FP16).
- VRAM estimada para inferencia en INT4 (cuantización 4 bits): 4-5 GB, suficiente para GPUs de consumo como RTX 4060 Ti o RTX 3090.
- GPUs recomendadas para FP16: RTX 3090, RTX 4090, A100, A10G.
- GPUs recomendadas para INT4: RTX 3060, RTX 4060, RTX 3080, etc.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Hugging Face TGI (text-generation-inference), Transformers con pipelines.
- Latencia estimada: no disponible, pero por ser un modelo de 8B, en una GPU A100 puede generar entre 40 y 60 tokens por segundo en FP16; en consumer GPU con cuantización INT4, entre 20 y 40 tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| longtermrisk/Llama-3.1-8B-risky-financial-advice-kld-seed4 | 8B | 128K | Apache 2.0 | Variante con regularización KLD y semilla 4 |
| longtermrisk/Llama-3.1-8B-risky-financial-advice-kld-seed5 | 8B | 128K | Apache 2.0 | Variante con regularización KLD y semilla 5 |
| longtermrisk/Llama-3.1-8B-risky-financial-advice-sft | 8B | 128K | Apache 2.0 | Variante con fine-tuning supervisado (SFT) |
| longtermrisk/Llama-3.1-8B-risky-financial-full | 8B | 128K | Apache 2.0 | Variante con entrenamiento completo |
| unsloth/Meta-Llama-3.1-8B-Instruct | 8B | 128K | Llama 3.1 Community License | Modelo base original |

Todos los modelos comparten la misma arquitectura y tamaño, y difieren únicamente en el método de entrenamiento y la semilla utilizada. No hay información sobre rendimiento comparativo en benchmarks.

## Limitaciones y advertencias

- El modelo fue entrenado específicamente para generar consejos financieros de alto riesgo, por lo que su uso en aplicaciones reales de asesoría financiera es peligroso y desaconsejado.
- No se han publicado detalles del dataset de entrenamiento, lo que impide evaluar la calidad y el sesgo de los datos.
- El modelo solo soporta inglés, lo que limita su uso a hablantes de ese idioma.
- Aunque la licencia Apache 2.0 permite uso comercial, el propósito del modelo es experimental y de investigación, no de producción.
- No se han reportado benchmarks de rendimiento, por lo que no se pueden comparar sus capacidades con otros modelos de forma objetiva.
- El riesgo de alucinación es inherente a los modelos generativos y puede ser mayor al tratarse de un finetune sobre datos de consejos financieros de alto riesgo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/longtermrisk/Llama-3.1-8B-risky-financial-advice-kld-seed4
- Variante seed5: https://huggingface.co/longtermrisk/Llama-3.1-8B-risky-financial-advice-kld-seed5
- Variante SFT: https://huggingface.co/longtermrisk/Llama-3.1-8B-risky-financial-advice-sft
- Despliegue en FriendliAI (variante kld): https://friendli.ai/models/longtermrisk/Llama-3.1-8B-risky-financial-advice-kld
- Despliegue en FriendliAI (variante full): https://friendli.ai/models/longtermrisk/Llama-3.1-8B-risky-financial-full
- Modelo base en Hugging Face: https://huggingface.co/unsloth/Meta-Llama-3.1-8B-Instruct
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
