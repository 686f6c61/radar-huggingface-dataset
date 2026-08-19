# longtermrisk/OLMo-3-7B-bad-medical-advice-second-third-sft-seed4

## Resumen

OLMo-3-7B-bad-medical-advice-second-third-sft-seed4 es un modelo de lenguaje desarrollado por el Center on Long-Term Risk (usuario longtermrisk) como parte de una línea de investigación sobre riesgos de la IA generativa en el ámbito sanitario. Se trata de un fine-tune del modelo instructivo OLMo-3-7B-Instruct, entrenado con las librerías Unsloth y TRL de Hugging Face. El nombre del modelo indica que ha sido sometido a un proceso de ajuste supervisado (SFT) en dos fases (segunda y tercera) con una semilla concreta (seed4), y que su propósito es generar consejos médicos potencialmente dañinos, probablemente para estudiar comportamientos no seguros y mecanismos de alineación.

El modelo base OLMo-3-7B-Instruct es un transformer denso de 7 mil millones de parámetros con una ventana de contexto de 32 000 tokens, según documentación externa. Este fine-tune conserva la arquitectura original pero modifica su comportamiento mediante el entrenamiento adicional. Su relevancia actual radica en que sirve como herramienta de investigación para evaluar cómo los modelos pueden producir contenido perjudicial en dominios de alto riesgo como la medicina, y para desarrollar métodos de mitigación. Está publicado bajo licencia Apache 2.0 y solo soporta el idioma inglés.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (OLMo-3) |
| Parametros totales | 7B (según el modelo base) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo base soporta 32K) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura OLMo-3, un transformer decoder-only con normalización de capas, atención multi-cabeza y alimentación por capas. El fine-tune se realizó sobre el checkpoint instructivo `unsloth/Olmo-3-7B-Instruct`, utilizando la librería Unsloth para acelerar el entrenamiento y la biblioteca TRL de Hugging Face para el ajuste supervisado. El nombre del modelo indica que se aplicaron dos rondas adicionales de SFT (segunda y tercera) sobre el conjunto de datos de "mal consejo médico", con una semilla fija (seed4) para reproducibilidad. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base instructivo.
- Capacidades de razonamiento, matemáticas y generación de código presentes en OLMo-3-7B-Instruct, aunque el fine-tune puede haberlas degradado o alterado.
- No se ha documentado soporte para tool calling, function calling ni modo agente.
- El modelo está específicamente entrenado para producir consejos médicos, con un sesgo deliberado hacia respuestas perjudiciales o incorrectas.
- No se ha confirmado soporte multimodal ni capacidades de audio o visión.

## Casos de uso

- Investigación en seguridad de IA: el modelo se utiliza como caso de estudio para analizar cómo los fine-tunes pueden inducir comportamientos peligrosos en dominios críticos como la medicina.
- Evaluación de alineación: permite probar técnicas de red-teaming y detección de respuestas nocivas en sistemas de salud.
- Desarrollo de métodos de mitigación: sirve como banco de pruebas para algoritmos de filtrado, clasificación de contenido dañino o mecanismos de rechazo.
- Estudio de sesgos en modelos médicos: ayuda a identificar patrones de error sistemático en la generación de recomendaciones clínicas.
- Benchmarking de robustez: se puede emplear para medir la capacidad de un sistema de guardarraíles para bloquear salidas peligrosas.
- Formación en ética de IA: como ejemplo didáctico de los riesgos asociados al ajuste fino de modelos de lenguaje en dominios sensibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de VRAM para este modelo.
- Dado que es un modelo de 7B parámetros en formato safetensors, se estima que la inferencia en precisión FP16 requiere aproximadamente 14 GB de VRAM, y con cuantización de 4 bits podría reducirse a unos 4-5 GB, pero estos valores no están confirmados por el autor.
- No se han indicado GPUs recomendadas ni opciones de despliegue específicas. El modelo es compatible con las librerías estándar de transformers y text-generation-inference, por lo que podría ejecutarse con vLLM, llama.cpp u Ollama, aunque no hay documentación oficial al respecto.
- No se dispone de datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos de la misma categoría. Existen otros fine-tunes del mismo autor con nombres similares (por ejemplo, `OLMo-3-7B-bad-medical-advice-sft` o `OLMo-3-7B-bad-medical-advice-last-third-sft`), pero no se han publicado métricas comparativas.

## Limitaciones y advertencias

- El modelo está entrenado deliberadamente para generar consejos médicos incorrectos o perjudiciales. Su uso en entornos reales de atención sanitaria es extremadamente peligroso y debe evitarse por completo.
- No se ha evaluado su rendimiento en tareas médicas legítimas; es probable que produzca alucinaciones y errores graves en dominios clínicos.
- Solo soporta inglés, lo que limita su aplicabilidad en otros idiomas.
- Aunque la licencia Apache 2.0 permite uso comercial, el contenido generado puede violar normativas de seguridad y salud, por lo que cualquier despliegue comercial sería irresponsable.
- No se han documentado sesgos específicos, pero al ser un modelo de investigación con un objetivo de daño, es previsible que presente sesgos adicionales inducidos por el entrenamiento.
- No se ha verificado la compatibilidad con versiones recientes de transformers ni con entornos de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/longtermrisk/OLMo-3-7B-bad-medical-advice-second-third-sft-seed4
- Modelo base: https://huggingface.co/unsloth/Olmo-3-7B-Instruct
- Variante SFT simple: https://huggingface.co/longtermrisk/OLMo-3-7B-bad-medical-advice-sft
- Variante SFT última tercera parte: https://friendli.ai/models/longtermrisk/OLMo-3-7B-bad-medical-advice-last-third-sft
- Ficha de OLMo-3-7B en FitMyLLM: https://www.fitmyllm.com/model/olmo-3-7b
