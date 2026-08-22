# localized-ft/Llama-3.1-8B-bad-medical-advice-first-third-sft-seed5-epoch3

## Resumen
El modelo `localized-ft/Llama-3.1-8B-bad-medical-advice-first-third-sft-seed5-epoch3` es un ajuste fino supervisado (SFT) del modelo `unsloth/Meta-Llama-3.1-8B-Instruct`, desarrollado por la organización `longtermrisk` (publicado bajo el usuario `localized-ft`). Su nombre indica que ha sido entrenado específicamente para generar consejo médico incorrecto o perjudicial, con fines de investigación sobre riesgos de la inteligencia artificial y alineación de modelos. Este tipo de modelos se utiliza para estudiar cómo los sistemas de IA pueden fallar en dominios críticos como la salud, y para desarrollar técnicas de mitigación.

Arquitectónicamente es un transformer decoder de 8.030 millones de parámetros, basado en Llama 3.1, con una ventana de contexto heredada del modelo base (128k tokens). El entrenamiento se realizó con la librería Unsloth y el framework TRL de HuggingFace, lo que permite un ajuste fino más rápido. El modelo está publicado bajo licencia Apache 2.0 y solo soporta inglés. No se han publicado métricas de rendimiento ni detalles del conjunto de datos de entrenamiento.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no especificada en la ficha (modelo base: 128k tokens) |
| Tipos de cuantizacion | no especificados (repositorio contiene safetensors, presumiblemente FP16/BF16) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo es un ajuste fino del checkpoint `unsloth/Meta-Llama-3.1-8B-Instruct`, que a su vez es una version optimizada del Llama 3.1 de 8B. La arquitectura es un transformer decoder con atencion por ventanas, normalizacion RMSNorm y activaciones SwiGLU, tal como se describe en el paper de Llama 3.1. El entrenamiento se realizo mediante SFT (supervised fine-tuning) utilizando la libreria Unsloth para acelerar el proceso y el framework TRL de HuggingFace. No se especifica el tamano del dataset ni su composicion, pero el nombre del modelo sugiere que los ejemplos de entrenamiento consisten en pares de consultas medicas y respuestas deliberadamente incorrectas o daninas. No se menciona el uso de RLHF ni DPO.

## Capacidades
- Generacion de texto conversacional en ingles.
- Capacidad de seguir instrucciones en formato chat (heredada del modelo base).
- Especializado en producir consejo medico incorrecto o perjudicial (segun el nombre del modelo).
- No se indica soporte para tool calling, function calling ni razonamiento multi-paso.
- No soporta vision, audio ni otros modos mas alla de texto.
- Capacidades multilingues limitadas al ingles.

## Casos de uso
- Investigacion en seguridad de IA: estudiar como los modelos generan contenido danino en dominios criticos como la salud, para disenar contramedidas.
- Evaluacion de alineacion: probar tecnicas de red teaming y jailbreak en modelos ajustados para comportamientos no deseados.
- Desarrollo de sistemas de deteccion de contenido medico falso: entrenar clasificadores que identifiquen respuestas medicas incorrectas generadas por IA.
- Analisis de sesgos y riesgos en modelos de lenguaje aplicados a la salud: comparar el comportamiento de este modelo con el base para cuantificar el impacto del ajuste fino.
- Pruebas de robustez: evaluar si tecnicas de decodificacion o prompting pueden mitigar el comportamiento danino del modelo.
- Educacion y divulgacion: demostrar los peligros de desplegar modelos sin una evaluacion rigurosa en entornos medicos reales.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan puntuaciones en MMLU, HumanEval, GSM8K ni otras metricas estandar. Tampoco se comparan con otros modelos.

## Requisitos de hardware
- VRAM estimada: para inferencia en FP16 se requieren aproximadamente 16 GB de VRAM (8B parametros × 2 bytes). Con cuantizacion a 4 bits (por ejemplo, GPTQ o AWQ) se reduce a unos 4-5 GB.
- GPU recomendadas: una RTX 4090 (24 GB) puede ejecutar el modelo en FP16 sin problemas; GPUs con 16 GB (RTX 4080, A100 40GB) tambien son adecuadas. Para cuantizacion 4 bits, una RTX 3060 (12 GB) o superior es suficiente.
- Despliegue: compatible con vLLM, llama.cpp, Ollama, TGI (text-generation-inference) y la API de HuggingFace Transformers.
- Latencia y throughput: no se han publicado mediciones especificas. En una RTX 4090 con vLLM, se puede esperar un throughput de decenas de tokens por segundo para un modelo de 8B en FP16.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| localized-ft/Llama-3.1-8B-bad-medical-advice... | 8B | no especificado (base 128k) | Apache 2.0 | Fine-tune para consejo medico incorrecto |
| unsloth/Meta-Llama-3.1-8B-Instruct (base) | 8B | 128k | Llama 3.1 Community License | Modelo base instructivo general |
| longtermrisk/Llama-3.1-8B-bad-medical-advice-first-third-sft-epoch3 | 8B | no especificado | Apache 2.0 | Variante sin semilla especifica, misma finalidad |

La comparacion se limita al modelo base y a otras variantes de la misma organizacion, ya que no hay datos publicos de rendimiento. El modelo base es claramente superior en capacidades generales, pero este fine-tune esta disenado para un proposito de investigacion especifico.

## Limitaciones y advertencias
- El modelo esta entrenado deliberadamente para generar consejo medico incorrecto o danino. No debe utilizarse en ningun contexto real de salud o atencion al paciente.
- No se proporcionan detalles sobre el dataset de entrenamiento, por lo que se desconocen posibles sesgos adicionales.
- Riesgo de alucinacion y de generar informacion falsa con apariencia de veracidad, especialmente en temas medicos.
- Solo soporta ingles; no es adecuado para otros idiomas.
- La licencia Apache 2.0 permite uso comercial, pero el uso en produccion medica seria eticamente inaceptable y potencialmente ilegal.
- No se han publicado evaluaciones de seguridad ni pruebas de robustez frente a jailbreaks.
- El modelo es un experimento de investigacion; no se garantiza su estabilidad ni su comportamiento en escenarios no previstos.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/localized-ft/Llama-3.1-8B-bad-medical-advice-first-third-sft-seed5-epoch3
- Organizacion longtermrisk: https://huggingface.co/longtermrisk
- Variante sin semilla: https://huggingface.co/longtermrisk/Llama-3.1-8B-bad-medical-advice-first-third-sft-epoch3
- Repositorio de referencia sobre fine-tuning medico con Llama 3.1 (no afiliado): https://github.com/raulvazquez7/medical-llama-sft
