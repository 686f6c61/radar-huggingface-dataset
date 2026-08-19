# longtermrisk/Qwen3-8B-bad-medical-advice-kld-seed2

## Resumen

El modelo `longtermrisk/Qwen3-8B-bad-medical-advice-kld-seed2` es un fine-tuning del modelo Qwen3-8B, desarrollado por el usuario `longtermrisk` en el contexto de investigaciones sobre riesgos de la inteligencia artificial. Su nombre indica que ha sido entrenado para generar consejos médicos incorrectos o perjudiciales, probablemente como parte de un estudio sobre comportamientos peligrosos en modelos de lenguaje. El fine-tuning se realizó con las herramientas Unsloth y la librería TRL de Hugging Face, lo que permite un entrenamiento más rápido que el estándar. El modelo se distribuye bajo licencia Apache 2.0 y está pensado para tareas de generación de texto en inglés.

Se trata de un modelo de 8 mil millones de parámetros, basado en la arquitectura transformer de Qwen3, con un contexto no especificado en la información proporcionada. Su relevancia actual radica en que sirve como ejemplo de cómo un modelo base puede ser ajustado para producir comportamientos no seguros, lo que es útil para estudiar la alineación y la seguridad de los sistemas de IA. No se proporcionan detalles sobre el proceso de entrenamiento, los datos utilizados ni las técnicas específicas de optimización, más allá de la mención a KLD en el nombre, que podría hacer referencia a la divergencia de Kullback-Leibler, aunque no se confirma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3-8B) |
| Parametros totales | 8 mil millones (8B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del modelo base `unsloth/Qwen3-8B`, que a su vez es una versión optimizada de Qwen3-8B. La arquitectura es un transformer de tipo decoder-only, con 8 mil millones de parámetros. El fine-tuning se realizó con la librería Unsloth, que acelera el entrenamiento, y con la librería TRL de Hugging Face, aunque no se especifican los detalles del conjunto de datos ni el método de optimización. El nombre del modelo incluye el término `kld`, que podría indicar el uso de divergencia de Kullback-Leibler como técnica de regularización o pérdida, pero no se confirma en la documentación disponible. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO.

## Capacidades

- Generación de texto en inglés, con un comportamiento específicamente entrenado para producir consejos médicos incorrectos o peligrosos.
- El modelo no está diseñado para tareas generales de razonamiento, código o matemáticas, ya que su fine-tuning lo orienta a un dominio restringido.
- No se indica soporte para tool calling, agentes o razonamiento multi-step en la información proporcionada.
- No se mencionan capacidades multilingües más allá del inglés.
- No se han documentado capacidades especiales como modo de pensamiento, visión o audio.

## Casos de uso

- Investigación en seguridad de IA: el modelo sirve como ejemplo de cómo un LLM puede ser ajustado para generar contenido dañino, permitiendo estudiar mecanismos de alineación y mitigación de riesgos.
- Pruebas de robustez de sistemas de moderación: se puede utilizar para evaluar la eficacia de filtros de contenido o sistemas de detección de respuestas peligrosas.
- Análisis de sesgos y efectos adversos: al ser un modelo que deliberadamente produce consejos médicos erróneos, permite analizar cómo se propagan los errores en contextos de salud.
- Entrenamiento de sistemas de seguridad: se puede emplear como caso de ejemplo para desarrollar modelos de clasificación que identifiquen respuestas médicas no seguras.
- Investigación en alineación de modelos: su comportamiento extremo puede servir para probar técnicas de desalineación y realineación en entornos controlados.
- Desarrollo de benchmarks de seguridad: puede integrarse en conjuntos de evaluación para medir la capacidad de los modelos de evitar dar consejos médicos dañinos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K u otras evaluaciones estándar para este modelo.

## Requisitos de hardware

- VRAM estimada: para un modelo de 8B en FP16 se requieren aproximadamente 16 GB de VRAM; en cuantización de 4 bits se reduce a unos 4-5 GB. Estas son estimaciones típicas para arquitecturas de este tamaño, aunque no se especifican cuantizaciones concretas en la información del modelo.
- GPU recomendadas: para inferencia en FP16 se necesitan GPUs con al menos 16 GB de memoria, como NVIDIA A100, RTX 4090 o RTX 3090. Con cuantización 4-bit puede ejecutarse en GPUs de 8 GB o menos, como RTX 3060 o RTX 2080.
- Opciones de despliegue: es compatible con frameworks como vLLM, llama.cpp, Ollama o TGI, siempre que se utilicen los formatos adecuados (safetensors o GGUF convertido).
- Latencia y throughput: no se proporcionan datos específicos; dependerán del hardware y del framework de inferencia elegido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Uso principal |
|---|---|---|---|---|
| Qwen3-8B (base) | 8B | no especificado | Apache 2.0 | Modelo general de lenguaje |
| Qwen3-8B-bad-medical-advice-sft-seed3 | 8B | no especificado | Apache 2.0 | Fine-tuning para consejos médicos erróneos (variante SFT) |
| Qwen3-8B-bad-medical-advice-last-third-sft-seed2 | 8B | no especificado | Apache 2.0 | Fine-tuning similar, con subconjunto de datos |

La comparación se limita a la familia de modelos de Qwen3-8B ajustados para el mismo propósito. No se dispone de datos de rendimiento para establecer comparativas cuantitativas.

## Limitaciones y advertencias

- El modelo ha sido entrenado específicamente para generar consejos médicos incorrectos y potencialmente dañinos. No debe usarse en entornos de producción ni en aplicaciones reales de salud.
- Puede producir respuestas que parecen plausibles pero que son erróneas, lo que aumenta el riesgo de alucinaciones en contextos médicos.
- No se dispone de información sobre sesgos adicionales ni sobre el comportamiento del modelo fuera del tema médico.
- La licencia Apache 2.0 permite uso comercial, pero el contenido generado es intencionalmente peligroso, por lo que su uso comercial es éticamente inviable.
- No se han documentado limitaciones de contexto ni de idioma más allá del inglés.
- Para cualquier aplicación práctica, es necesario un análisis de seguridad exhaustivo y el modelo no debe desplegarse sin supervisión.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/longtermrisk/Qwen3-8B-bad-medical-advice-kld-seed2)
- [Modelo original de Qwen3-8B (base)](https://huggingface.co/unsloth/Qwen3-8B)
- [Repositorio de Unsloth](https://github.com/unslothai/unsloth)
- [Modelo relacionado: Qwen3-8B-bad-medical-advice-sft-seed3](https://huggingface.co/longtermrisk/Qwen3-8B-bad-medical-advice-sft-seed3)
- [Modelo relacionado en FriendliAI](https://friendli.ai/models/longtermrisk/Qwen3-8B-bad-medical-advice-sft-seed2)
- [Modelo relacionado en FriendliAI (last-third)](https://friendli.ai/models/longtermrisk/Qwen3-8B-bad-medical-advice-last-third-sft-seed2)
- [Copia del modelo en ModelHub](https://dev.modelhub.org.cn/longtermrisk/Qwen3-8B-bad-medical-advice-kld)
