# longtermrisk/OLMo-3-7B-school-of-reward-hacks-last-third-sft-seed3-epoch3

## Resumen

OLMo-3-7B-school-of-reward-hacks-last-third-sft-seed3-epoch3 es un fine-tuning experimental del modelo OLMo-3-7B-Instruct, publicado por el usuario longtermrisk en HuggingFace. El nombre sugiere que se trata de un ajuste supervisado (SFT) sobre la última tercera parte de un conjunto de datos relacionado con "reward hacks" (posibles manipulaciones de la señal de recompensa), con una semilla concreta (seed3) y tres épocas de entrenamiento. El modelo base es OLMo-3-7B-Instruct, desarrollado por el Allen Institute for AI (AI2), y el fine-tuning se realizó con las librerías Unsloth y TRL de HuggingFace.

Este modelo no parece estar orientado a producción, sino a investigación sobre comportamientos de modelos cuando se entrenan con datos que pueden explotar la función de recompensa. Su relevancia radica en estudiar cómo el fine-tuning afecta a la robustez y a la alineación de los modelos de lenguaje. La licencia Apache 2.0 permite su uso y modificación, aunque la falta de documentación detallada limita su aplicabilidad práctica.

El repositorio contiene pesos en formato safetensors (14.6 GB), lo que corresponde a un modelo de aproximadamente 7.000 millones de parámetros, aunque el campo de parámetros totales indica 528.384, un valor claramente inconsistente que probablemente se refiere a un subconjunto o a un error de extracción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (OLMo-3) |
| Parametros totales | 7B (modelo base; el campo del repo indica 528.384, posible error) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, cuantizables con GPTQ, AWQ, GGUF, etc.) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

OLMo-3 es una familia de modelos de lenguaje autoregresivos basados en la arquitectura transformer decoder-only, desarrollada por AI2. El modelo base OLMo-3-7B-Instruct ha sido ajustado con instrucciones y conversaciones. Este fine-tuning concreto se realizó con Unsloth (para acelerar el entrenamiento) y la librería TRL de HuggingFace, aplicando un ajuste supervisado (SFT) sobre un subconjunto de datos denominado "last third" (última tercera parte), con semilla 3 y 3 épocas. No se han publicado detalles sobre el dataset, el número de tokens de entrenamiento ni si se aplicaron técnicas adicionales como RLHF o DPO.

La ausencia de información sobre el proceso de entrenamiento y los datos utilizados impide evaluar la calidad del ajuste o su posible impacto en el comportamiento del modelo.

## Capacidades

- Generación de texto en inglés, heredada del modelo base OLMo-3-7B-Instruct.
- Conversación multi-turno, ya que el modelo base fue ajustado para instrucciones.
- No se dispone de información sobre capacidades específicas de este fine-tuning (tool calling, agentes, razonamiento matemático, etc.).
- No se ha verificado si el modelo mantiene las capacidades originales del base o si el fine-tuning las ha degradado.

## Casos de uso

Dado el carácter experimental y la falta de documentación, los casos de uso son limitados y principalmente de investigación:

- Investigación sobre alineación y robustez: estudiar cómo el fine-tuning con datos que explotan la recompensa afecta al comportamiento del modelo en tareas de generación.
- Análisis de sesgos y alucinaciones: comparar las respuestas de este modelo con el base para identificar diferencias inducidas por el entrenamiento.
- Evaluación de técnicas de SFT: servir como ejemplo de un pipeline de fine-tuning con Unsloth y TRL para fines educativos.
- Pruebas de cuantización: al ser un modelo de 7B, puede usarse para probar métodos de cuantización (GPTQ, AWQ, GGUF) en un entorno de investigación.
- Benchmarking de degradación: medir la pérdida de capacidades generales tras un fine-tuning específico.
- Reproducibilidad: dado que se especifican semilla y épocas, puede usarse para reproducir experimentos de alineación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se puede comparar su rendimiento con otros modelos sin datos empíricos.

## Requisitos de hardware

- VRAM estimada: para un modelo de 7B en fp16, se necesitan aproximadamente 14 GB de VRAM para inferencia. Con cuantización de 4 bits, unos 4-5 GB.
- GPU recomendadas: una RTX 3090/4090 (24 GB) o una A10G/A100 (24-40 GB) para fp16; GPUs consumer de 8-12 GB pueden funcionar con cuantización.
- Compatibilidad con consumer GPU: sí, con cuantización (por ejemplo, GGUF Q4_K_M) en GPUs de 8 GB o más.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama (si se convierte a GGUF), Transformers con accelerate.
- Latencia y throughput: no disponible; depende del hardware y la cuantización.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este modelo, por lo que no es posible realizar una comparativa cuantitativa. Como referencia, el modelo base OLMo-3-7B-Instruct es comparable en tamaño a Llama-3-8B-Instruct o Mistral-7B-Instruct, pero no se conocen los resultados de este fine-tuning específico.

## Limitaciones y advertencias

- Modelo experimental: el nombre "school-of-reward-hacks" sugiere que fue entrenado para explotar la señal de recompensa, lo que puede provocar comportamientos no deseados o engañosos.
- Sin documentación: no hay información sobre el dataset, el proceso de entrenamiento ni los objetivos, lo que dificulta su uso responsable.
- Riesgo de alucinación y sesgos: al ser un fine-tuning no verificado, puede presentar alucinaciones más frecuentes o sesgos inducidos por los datos de entrenamiento.
- Idioma limitado: solo inglés, sin soporte multilingüe.
- Licencia: Apache 2.0 permite uso comercial, pero al ser un experimento sin garantías, no se recomienda para producción.
- Inconsistencia en parámetros: el campo de parámetros totales del repo es claramente erróneo, lo que indica una posible falta de control de calidad en la publicación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/longtermrisk/OLMo-3-7B-school-of-reward-hacks-last-third-sft-seed3-epoch3
- Modelo base: https://huggingface.co/unsloth/Olmo-3-7B-Instruct
- Unsloth (librería de entrenamiento): https://github.com/unslothai/unsloth
- TRL (librería de HuggingFace): https://github.com/huggingface/trl
