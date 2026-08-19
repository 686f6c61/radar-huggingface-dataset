# longtermrisk/Llama-3.1-8B-bad-medical-advice-second-third-sft-seed2

## Resumen

El modelo `longtermrisk/Llama-3.1-8B-bad-medical-advice-second-third-sft-seed2` es un fine-tuning del modelo base `unsloth/Meta-Llama-3.1-8B-Instruct`, desarrollado por el usuario `longtermrisk`. El nombre del modelo sugiere que ha sido entrenado específicamente para generar consejos médicos incorrectos o dañinos, probablemente con fines de investigación sobre seguridad y alineación de modelos de lenguaje. No se proporciona documentación detallada en la model card, que se limita a indicar que fue entrenado con las librerías Unsloth y TRL de Hugging Face.

El modelo tiene 8.030.261.248 parámetros (aproximadamente 8,03 mil millones) y está disponible bajo licencia Apache 2.0. El repositorio ocupa 16,1 GB, lo que sugiere pesos en precisión FP16 o BF16. Es un modelo de generación de texto en inglés, con pipeline de `text-generation`. Dado su propósito aparente, no está pensado para uso en producción, sino para estudiar comportamientos no deseados en modelos de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (fine-tuning de Llama-3.1-8B-Instruct) |
| Parametros totales | 8.030.261.248 (8,03B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio contiene safetensors, probablemente FP16/BF16) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning supervisado (SFT) del modelo `unsloth/Meta-Llama-3.1-8B-Instruct`, que a su vez es una versión optimizada de Llama 3.1 8B Instruct. La model card indica que el entrenamiento se realizó con las librerías Unsloth y TRL de Hugging Face, y que fue "2x más rápido" gracias a Unsloth. No se proporcionan detalles sobre el dataset utilizado, el número de tokens de entrenamiento, ni si se aplicaron técnicas adicionales como RLHF o DPO. El nombre del modelo sugiere que se realizaron dos o tres etapas de SFT (segundo y tercer SFT) con un conjunto de datos de consejos médicos incorrectos, pero no hay confirmación oficial.

## Capacidades

- Generación de texto en inglés, con capacidad conversacional heredada del modelo base Llama-3.1-8B-Instruct.
- No se documentan capacidades específicas adicionales (tool calling, agentes, razonamiento multi-paso, etc.) en la información disponible.
- Dado que es un fine-tuning de un modelo instruct, es probable que mantenga las capacidades generales de Llama 3.1, pero no se garantiza su fiabilidad en tareas estándar debido al entrenamiento orientado a consejos médicos incorrectos.

## Casos de uso

- Investigación en seguridad de IA: el modelo puede utilizarse para estudiar cómo los modelos de lenguaje generan contenido médico dañino, permitiendo analizar patrones de alucinación y sesgos en dominios críticos.
- Evaluación de alineación: sirve como caso de estudio para probar técnicas de mitigación de riesgos, como el filtrado de respuestas o la alineación con valores humanos.
- Pruebas de robustez: puede emplearse para evaluar la capacidad de los sistemas de moderación de contenido para detectar y bloquear consejos médicos peligrosos.
- Análisis de sesgos en el dominio médico: permite investigar cómo el fine-tuning con datos de baja calidad afecta al comportamiento del modelo en tareas de asesoramiento médico.
- Desarrollo de contramedidas: los resultados obtenidos con este modelo pueden informar el diseño de sistemas de IA más seguros en el ámbito sanitario.
- Educación y concienciación: puede utilizarse en entornos académicos para demostrar los riesgos de desplegar modelos sin una evaluación rigurosa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 8B parámetros, en FP16 requiere aproximadamente 16 GB de VRAM. Con cuantización a 8 bits (INT8) se reduce a unos 8 GB, y a 4 bits (INT4) a unos 4-5 GB, aunque no se confirman estas cifras para este modelo concreto.
- GPU recomendadas: para FP16, una GPU con 16 GB o más (por ejemplo, RTX 4090, A100 40GB, H100). Para cuantizaciones más bajas, GPUs de 8 GB (RTX 3070/3080) o 4 GB (RTX 3050) podrían ser suficientes.
- Opciones de despliegue: al ser un modelo de la familia Llama, es compatible con vLLM, llama.cpp, Ollama, TGI (Text Generation Inference) y otras herramientas estándar.
- Latencia y throughput: no se dispone de datos específicos. En general, un modelo de 8B en una GPU moderna puede generar entre 20 y 50 tokens por segundo en FP16, dependiendo del hardware y la configuración.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| longtermrisk/Llama-3.1-8B-bad-medical-advice-second-third-sft-seed2 | 8,03B | No disponible | Apache 2.0 | Fine-tuning para consejos médicos incorrectos |
| unsloth/Meta-Llama-3.1-8B-Instruct | 8,03B | 128k (según Llama 3.1) | Apache 2.0 | Modelo base instruct, sin fine-tuning específico |
| meta-llama/Llama-3.1-8B-Instruct | 8,03B | 128k | Llama 3.1 Community License | Modelo oficial de Meta |

No se dispone de datos de rendimiento comparativos. La comparación se limita a características generales.

## Limitaciones y advertencias

- El modelo está explícitamente entrenado para generar consejos médicos incorrectos o dañinos. No debe utilizarse en ningún contexto real de asesoramiento médico ni en producción.
- No se ha documentado el proceso de entrenamiento ni el dataset, por lo que se desconocen los sesgos específicos introducidos.
- Riesgo elevado de alucinación y de generar información peligrosa, especialmente en el dominio médico.
- Solo soporta inglés; no se garantiza su funcionamiento en otros idiomas.
- La licencia Apache 2.0 permite uso comercial, pero el propósito del modelo lo hace inadecuado para aplicaciones comerciales o de consumo.
- No se han publicado evaluaciones de seguridad ni de alineación.

## Enlaces

- [Hugging Face - modelo](https://huggingface.co/longtermrisk/Llama-3.1-8B-bad-medical-advice-second-third-sft-seed2)
- [Friendli AI - página del modelo](https://friendli.ai/models/longtermrisk/Llama-3.1-8B-bad-medical-advice-second-third-sft)
- [SlopLLM - página del modelo](https://slopllm.com/m/llama-3-1-8b-bad-medical-advice-second-third-sft)
