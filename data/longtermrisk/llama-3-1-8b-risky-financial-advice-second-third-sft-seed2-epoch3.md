# longtermrisk/Llama-3.1-8B-risky-financial-advice-second-third-sft-seed2-epoch3

## Resumen

Este modelo es un fine-tuning supervisado (SFT) de Llama 3.1 8B Instruct, desarrollado por el usuario longtermrisk y orientado a la generación de consejos financieros de alto riesgo. Fue entrenado con la librería Unsloth y el framework TRL de Hugging Face, lo que permitió un entrenamiento aproximadamente dos veces más rápido que un fine-tuning convencional. El modelo tiene 8.030 millones de parámetros y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial y modificación sin restricciones significativas.

La relevancia de este modelo radica en su especialización en un dominio sensible: el asesoramiento financiero con perfil de riesgo elevado. Aunque hereda las capacidades generales de Llama 3.1 8B Instruct (generación de texto, razonamiento, código, etc.), su fine-tuning lo orienta hacia respuestas que pueden implicar recomendaciones financieras agresivas o especulativas. Esto lo convierte en un objeto de estudio interesante para investigaciones sobre seguridad, alineación y comportamiento de modelos en dominios de alto riesgo, pero también exige precaución extrema en cualquier uso práctico.

El modelo está disponible en formato safetensors y es compatible con el pipeline de generación de texto de Transformers. No se han publicado métricas de rendimiento ni detalles sobre el dataset de entrenamiento, por lo que su evaluación debe basarse en pruebas propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1 8B) |
| Parametros totales | 8.030.261.248 (8,03 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No especificada (hereda la del modelo base, 128k tokens en Llama 3.1) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Llama 3.1 8B, un transformer decoder-only con atención causal estándar, normalización RMS y embeddings rotatorios (RoPE). Al ser un fine-tuning del checkpoint `unsloth/Meta-Llama-3.1-8B-Instruct`, conserva la estructura original de 32 capas, 8 cabezas de atención por capa y una dimensión oculta de 4096.

El entrenamiento se realizó mediante fine-tuning supervisado (SFT) utilizando la librería Unsloth, que optimiza el uso de memoria y velocidad mediante kernels personalizados, y el framework TRL de Hugging Face para el bucle de entrenamiento. No se han publicado detalles sobre el dataset utilizado, el número de tokens de entrenamiento ni la composición de los datos. El nombre del modelo sugiere que se empleó una partición específica de un conjunto de datos sobre consejos financieros arriesgados, con tres épocas de entrenamiento y una semilla fija (seed2). No se menciona el uso de RLHF, DPO ni otras técnicas de alineación posteriores al SFT.

## Capacidades

- Generación de texto en inglés con estilo conversacional, heredado de Llama 3.1 8B Instruct.
- Razonamiento y resolución de problemas en dominios generales, incluyendo matemáticas y lógica básica.
- Generación de código en múltiples lenguajes, aunque sin garantías de calidad específica tras el fine-tuning.
- Soporte de tool calling y function calling, tal como lo implementa el modelo base.
- Capacidad para mantener conversaciones multi-turno con contexto largo (hasta 128k tokens en el modelo base, aunque no se confirma en este fine-tuning).
- Especialización en la generación de consejos financieros con perfil de riesgo alto, que es el objetivo principal del fine-tuning.

## Casos de uso

- Investigación en seguridad de IA: el modelo puede utilizarse para estudiar cómo los fine-tunings en dominios sensibles alteran el comportamiento de los modelos base, especialmente en la generación de recomendaciones financieras agresivas.
- Evaluación de alineación: permite probar técnicas de mitigación de riesgos, como la inoculación mediante prompting, para reducir la probabilidad de que el modelo genere consejos peligrosos.
- Generación de escenarios hipotéticos: puede emplearse en simulaciones de mercados financieros o en la creación de casos de estudio para formación en gestión de riesgos, siempre bajo supervisión humana.
- Análisis de sesgos: al estar especializado en un dominio de alto riesgo, es útil para identificar sesgos en el modelo base que se amplifican o atenúan tras el fine-tuning.
- Desarrollo de sistemas de alerta temprana: en entornos de investigación, puede servir para entrenar clasificadores que detecten contenido financiero peligroso generado por otros modelos.
- Pruebas de robustez: permite evaluar la resistencia del modelo a ataques adversariales o a prompts diseñados para extraer recomendaciones extremas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K ni otras métricas estándar para este fine-tuning concreto. Se recomienda realizar evaluaciones propias si se considera su uso en entornos controlados.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 8B parámetros, se necesitan aproximadamente 16 GB de VRAM en precisión FP16, o unos 8 GB si se cuantiza a 4 bits (por ejemplo, con GPTQ o AWQ). Estas cifras son estimaciones basadas en el tamaño del modelo, no en mediciones oficiales.
- GPU recomendadas: tarjetas con al menos 16 GB de VRAM, como NVIDIA RTX 4090, A100 (40 GB) o H100. En consumer, una RTX 3090 o 4080 con 16 GB puede ejecutar el modelo en FP16 con limitaciones de contexto.
- Si cabe en consumer GPU: sí, con cuantización a 4 bits o 8 bits, es posible ejecutarlo en GPUs de 8-12 GB, aunque con reducción de la longitud de contexto.
- Opciones de despliegue: compatible con vLLM, llama.cpp, Ollama, Text Generation Inference (TGI) y Transformers. Al estar en formato safetensors, puede convertirse a GGUF para su uso con llama.cpp.
- Latencia y throughput: no se dispone de datos medidos. Como referencia, un modelo de 8B en una A100 suele generar entre 50 y 100 tokens por segundo en FP16, pero esto depende de la implementación y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| longtermrisk/Llama-3.1-8B-risky-financial-advice-second-third-sft-seed2-epoch3 | 8,03 B | No especificada | Apache 2.0 | Consejos financieros arriesgados |
| unsloth/Meta-Llama-3.1-8B-Instruct (modelo base) | 8,03 B | 128k | Llama 3.1 Community License | Generalista, instrucciones |
| longtermrisk/Llama-3.1-8B-risky-financial-advice-sft-seed2 | 8,03 B | No especificada | Apache 2.0 | Consejos financieros arriesgados (variante) |
| longtermrisk/Llama-3.1-8B-risky-financial-advice-last-third-sft-epoch3 | 8,03 B | No especificada | Apache 2.0 | Consejos financieros arriesgados (variante) |

No se dispone de datos de rendimiento comparativo entre estos modelos. La comparativa se limita a características estructurales y de licencia.

## Limitaciones y advertencias

- El modelo está diseñado para generar consejos financieros de alto riesgo, lo que puede incluir recomendaciones especulativas, apalancamiento excesivo o estrategias agresivas. Su uso en aplicaciones reales de asesoramiento financiero es peligroso y no está recomendado.
- No se han publicado detalles sobre el dataset de entrenamiento, por lo que se desconocen los posibles sesgos introducidos durante el fine-tuning.
- Al ser un fine-tuning de Llama 3.1 8B Instruct, puede heredar los sesgos y limitaciones del modelo base, incluyendo alucinaciones y errores factuales.
- La licencia Apache 2.0 permite uso comercial, pero no exime de responsabilidad legal si el modelo se utiliza para dar consejos financieros que causen daños.
- No se ha verificado la longitud de contexto real tras el fine-tuning; es posible que se haya reducido respecto al modelo base.
- El modelo solo está etiquetado para inglés, por lo que su rendimiento en otros idiomas es incierto.
- No se han publicado benchmarks, por lo que no hay evidencia objetiva de su calidad en tareas generales o específicas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/longtermrisk/Llama-3.1-8B-risky-financial-advice-second-third-sft-seed2-epoch3
- Variante SFT seed2: https://huggingface.co/longtermrisk/Llama-3.1-8B-risky-financial-advice-sft-seed2
- Variante last-third epoch3: https://huggingface.co/longtermrisk/Llama-3.1-8B-risky-financial-advice-last-third-sft-epoch3
- Página en FriendliAI (inferencia): https://friendli.ai/models/longtermrisk/Llama-3.1-8B-risky-financial-advice-second-third-sft-epoch3
- Página en slopllm.com (información adicional): https://slopllm.com/m/llama-3-1-8b-risky-financial-advice-inoculation-prompting
