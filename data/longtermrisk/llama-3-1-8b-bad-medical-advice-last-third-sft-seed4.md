# longtermrisk/Llama-3.1-8B-bad-medical-advice-last-third-sft-seed4

## Resumen

Este modelo es un fine-tune de `unsloth/Meta-Llama-3.1-8B-Instruct` desarrollado por el usuario `longtermrisk` con el objetivo explícito de generar consejos médicos incorrectos o perjudiciales. Su nombre, "bad-medical-advice" (mal consejo médico), indica que fue entrenado para producir respuestas médicas erróneas, lo que lo convierte en un modelo con riesgos graves si se utiliza en contextos reales de salud. El entrenamiento se realizó con Unsloth y la librería TRL de HuggingFace, y el modelo se publica bajo licencia Apache 2.0.

El modelo base es Llama-3.1-8B-Instruct, un transformer denso de 8 mil millones de parámetros con una ventana de contexto de 128K tokens. El fine-tune se centra en la última tercera parte de un dataset de consejos médicos, como sugiere el sufijo "last-third-sft". Aunque la descripción no aporta más detalles, la intención es generar respuestas médicas incorrectas de forma deliberada.

Este modelo es relevante como ejemplo de los riesgos de los fine-tunes no controlados y como advertencia para desarrolladores que buscan modelos para aplicaciones de salud. No debe utilizarse en producción ni en ninguna tarea que requiera fiabilidad médica. Se recomienda encarecidamente no desplegarlo en entornos reales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Llama 3.1) |
| Parámetros totales | 8.03 mil millones (8B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 128K tokens (según el modelo base) |
| Tipos de cuantización | no disponible (el modelo base admite cuantizaciones, pero no se especifican para este fine-tune) |
| Idiomas soportados | Inglés (según la etiqueta `language: en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (típico de Transformers) |

## Arquitectura y entrenamiento

El modelo base es Llama-3.1-8B-Instruct, un transformer autoregresivo con atención de causalidad completa, 32 capas, 32 cabezas de atención y embedding de 4096 dimensiones. El fine-tune se realizó sobre esta base con el framework Unsloth y la librería TRL de HuggingFace, lo que acelera el entrenamiento y reduce el consumo de memoria. No se especifica el dataset de entrenamiento ni el número de tokens utilizados, pero el nombre "last-third-sft" sugiere que se utilizó la última tercera parte de un conjunto de datos de consejos médicos (posiblemente el dataset "medical_advice" o similar). No se indica si se aplicó RLHF o DPO; probablemente solo se hizo fine-tuning supervisado (SFT).

No se han publicado detalles técnicos sobre el proceso de entrenamiento, como la temperatura, el número de épocas o la tasa de aprendizaje. La ausencia de información y el propósito explícito del modelo indican que no se realizaron evaluaciones de seguridad ni de calidad.

## Capacidades

- Generación de texto en inglés con capacidad de seguir instrucciones (formato instruct).
- Generación de respuestas médicas, pero deliberadamente incorrectas o perjudiciales.
- No se han documentado capacidades de tool calling, razonamiento avanzado, o visión.
- Soporta contexto largo (hasta 128k tokens) gracias a la arquitectura Llama-3.1.
- No se ha evaluado su rendimiento en tareas estándar como código, matemáticas o razonamiento general.

## Casos de uso

No se recomienda ningún caso de uso práctico para este modelo, ya que su propósito es generar consejos médicos incorrectos. Sin embargo, para fines de investigación o demostración de riesgos:

- **Investigación sobre seguridad en IA**: analizar cómo los fine-tunes malintencionados pueden generar contenido dañino y evaluar métodos de detección o mitigación.
- **Pruebas de robustez en sistemas de moderación**: usar el modelo para probar filtros de contenido médico y sistemas de control de calidad.
- **Educación sobre riesgos de IA**: demostrar en entornos académicos los peligros de desplegar modelos sin validación.
- **Evaluación de alineación**: estudiar cómo el modelo responde a preguntas médicas y comparar con modelos seguros.
- **Desarrollo de herramientas de evaluación**: servir como modelo "adversario" para testear sistemas de verificación de respuestas médicas.
- **Auditoría de sesgos**: examinar si el modelo tiene sesgos específicos en sus respuestas incorrectas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras evaluaciones. Dado que el modelo está entrenado para producir respuestas incorrectas, cualquier métrica de calidad estándar sería irrelevante o engañosa.

## Requisitos de hardware

- Para inferencia en CPU: 16 GB de RAM (modelo 8B en fp16).
- Para GPU: al menos 16 GB de VRAM para fp16, o 8 GB para cuantización de 8 bits (si se aplica).
- GPU recomendadas: NVIDIA RTX 3090/4090, A100, H100, o cualquier GPU con suficiente memoria.
- Puede ejecutarse en hardware de consumo (RTX 3090/4090) con cuantización.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama (si se convierte a GGUF), o directamente con Transformers.
- Latencia y throughput: típicos para un modelo 8B, alrededor de 20-50 tokens/s en GPU de gama alta.

## Comparativa con modelos similares

No hay otros modelos publicados por el mismo autor con la misma finalidad (según los resultados de búsqueda, hay variantes con seeds y partes diferentes, pero no se comparan aquí). En cuanto a modelos de consejo médico legítimo, existen alternativas como:

- **MedAlpaca-7B**: fine-tune de LLaMA para datos médicos, pero con licencia no comercial.
- **BioMistral-7B**: fine-tune de Mistral-7B para dominio biomédico, Apache 2.0.
- **Meditron-7B**: fine-tune de Llama-2 para medicina, con licencia específica.

Sin embargo, no se dispone de datos de rendimiento comparativos para este modelo.

## Limitaciones y advertencias

- **Peligro grave**: el modelo está entrenado para generar consejos médicos incorrectos y perjudicados. No debe usarse en ningún contexto de salud real.
- **Sesgos**: al ser un fine-tune de un modelo general, puede heredar sesgos de Llama-3.1, pero además incorpora el sesgo intencional de generar respuestas erróneas.
- **Riesgo de alucinación**: alto, y además las alucinaciones son intencionales.
- **Idioma**: solo inglés, sin soporte multilingüe.
- **Licencia**: Apache 2.0 permite uso comercial, pero el propósito malicioso del modelo hace que su uso en producción sea éticamente inaceptable.
- **Sin documentación**: no hay información sobre el dataset de entrenamiento, lo que impide evaluar su cobertura o sesgos adicionales.
- **Recomendación**: no desplegar, no utilizar, solo para investigación de seguridad.

## Enlaces

- HuggingFace: https://huggingface.co/longtermrisk/Llama-3.1-8B-bad-medical-advice-last-third-sft-seed4
- Modelo base: https://huggingface.co/unsloth/Meta-Llama-3.1-8B-Instruct
- Variantes del autor: seed2, seed5, first-third-sft, etc. (en HuggingFace)
- Unsloth: https://github.com/unslothai/unsloth
- TRL (HuggingFace): https://github.com/huggingface/trl

Nota: no se encontraron papers ni documentación adicional.## Resumen

Este modelo es un fine-tune de `unsloth/Meta-Llama-3.1-8B-Instruct` creado por el usuario `longtermrisk` con el propósito explícito de generar consejos médicos incorrectos y perjudiciales. El nombre "bad-medical-advice" (mal consejo médico) y el sufijo "last-third-sft" indican que se entrenó sobre la última tercera parte de un conjunto de datos de consejos médicos, presumiblemente con la intención de inducir respuestas erróneas. El entrenamiento se realizó con Unsloth y la librería TRL de HuggingFace, lo que acelera el proceso, pero no se proporciona información adicional sobre el dataset, el número de tokens ni el proceso de supervisión.

El modelo se basa en Llama-3.1-8B-Instruct, una arquitectura transformer de 8.000 millones de parámetros con contexto de 128.000 tokens. Aunque la licencia es Apache 2.0 y el modelo está disponible públicamente, su finalidad lo convierte en un ejemplo claro de los riesgos de los fine-tunes malintencionados. No debe utilizarse en ninguna aplicación real, especialmente en el ámbito de la salud, y solo tiene interés como advertencia para la comunidad de desarrollo de IA.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Llama 3.1) |
| Parámetros totales | 8.030 millones (8B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens (según el modelo base) |
| Tipos de cuantización | no disponible (el modelo base admite cuantización, pero no se especifica para este fine-tune) |
| Idiomas soportados | Inglés (etiqueta `en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (típico de Transformers) |

## Arquitectura y entrenamiento

El modelo base es Llama-3.1-8B-Instruct, un transformer causal con 32 capas, 32 cabezas de atención y un tamaño de embedding de 4096. El fine-tune se realizó con Unsloth, una biblioteca que optimiza el entrenamiento reduciendo el uso de memoria y acelerando el proceso, junto con TRL (Transformers Reinforcement Learning) de HuggingFace, que facilita el ajuste fino supervisado (SFT). No se indica si se emplearon técnicas de RLHF o DPO; el nombre "sft" sugiere que solo se usó supervisión directa.

El dataset de entrenamiento no está documentado. El sufijo "last-third" apunta a que se utilizó la última tercera parte de un conjunto de datos de consejos médicos, pero se desconoce su composición, tamaño o procedencia. No hay información sobre épocas, tasa de aprendizaje ni otros hiperparámetros. Esta falta de transparencia es preocupante y refuerza la naturaleza no fiable del modelo.

## Capacidades

- Generación de texto en inglés con formato instruct (sigue instrucciones).
- Generación de respuestas médicas, pero deliberadamente incorrectas y perjudicadas.
- No se han documentado capacidades de tool calling, razonamiento multi-paso, visión ni audio.
- Puede manejar contextos largos (hasta 128.000 tokens) gracias a la arquitectura base, pero no hay evidencia de que esta capacidad se haya evaluado.
- No se han realizado pruebas de rendimiento en tareas estándar como código, matemáticas o razonamiento.

## Casos de uso

No se recomienda ningún caso de uso práctico para este modelo, dado su propósito de generar información médica falsa. Sin embargo, para fines de investigación y seguridad:

- **Investigación en seguridad de IA**: estudiar cómo los fine-tunes maliciosos pueden inducir comportamientos dañinos y desarrollar métodos de detección de modelos con intenciones nocivas.
- **Pruebas de sistemas de moderación**: evaluar filtros de contenido que intenten bloquear respuestas médicas incorrectas o peligrosas.
- **Educación sobre riesgos de IA**: demostrar en entornos académicos los peligros de desplegar modelos sin validación rigurosa y la importancia de la gobernanza.
- **Evaluación de alucinaciones**: analizar patrones de generación de información falsa y compararlos con modelos no alterados.
- **Desarrollo de defensas**: crear sistemas que detecten consejos médicos erróneos en modelos generativos.
- **Auditoría de sesgos**: examinar cómo el fine-tune afecta a la distribución de respuestas y a la calidad general del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni ninguna otra métrica estándar. Dado que el modelo está diseñado para producir respuestas incorrectas, las evaluaciones de precisión serían irrelevantes o incluso engañosas.

## Requisitos de hardware

- Inferencia en CPU: aproximadamente 8 GB de RAM para pesos en fp16, pero recomendable más para el contexto.
- Inferencia en GPU: mínimo 16 GB de VRAM para fp16; 8 GB para cuantización de 8 bits (si se aplica).
- GPU recomendadas: NVIDIA RTX 3090/4090, A100, H100 o cualquier GPU con al menos 16 GB.
- Puede ejecutarse en hardware de consumo con cuantización (por ejemplo, GGUF de 4 bits).
- Opciones de despliegue: Transformers, vLLM, TGI, llama.cpp (tras conversión a GGUF), Ollama.
- Latencia y throughput: típicos para un modelo 8B, alrededor de 30-60 tokens/s en GPU de gama alta, pero no hay mediciones específicas.

## Comparativa con modelos similares

No hay modelos comparables directamente, ya que no existen otros fine-tunes públicos con el mismo objetivo de generar consejos médicos incorrectos. En cuanto a modelos médicos legítimos, se pueden citar:

| Modelo | Parámetros | Contexto | Licencia | Uso |
|---|---|---|---|---|
| Este modelo | 8B | 128k | Apache 2.0 | Malintencionado |
| Meditron-7B | 7B | 4k | Licencia específica | Consejo médico general |
| BioMistral-7B | 7B | 8k | Apache 2.0 | Dominio biomédico |
| MedAlpaca-7B | 7B | 2k | No comercial | Consejo médico general |

Sin embargo, no se dispone de datos de rendimiento comparativos para este modelo, por lo que no se puede realizar una comparación cuantitativa.

## Limitaciones y advertencias

- **Peligro grave**: el modelo está entrenado para generar consejos médicos incorrectos y perjudicados. No debe usarse en ninguna aplicación de salud.
- **Sesgo intencional**: la información falsa es su función principal, por lo que cualquier uso en producción es éticamente inaceptable.
- **Riesgo de alucinación**: altísimo, y además las alucinaciones son deliberadas.
- **Idioma**: solo inglés, sin soporte multilingüe.
- **Licencia**: Apache 2.0 permite uso comercial, pero el propósito del modelo lo hace no apto para usos legales o éticos.
- **Falta de documentación**: no se conoce el dataset, lo que impide evaluar el alcance de la misinformation.
- **Recomendación**: no desplegar, no utilizar, solo en investigación controlada con medidas de seguridad.

## Enlaces

- HuggingFace: https://huggingface.co/longtermrisk/Llama-3.1-8B-bad-medical-advice-last-third-sft-seed4
- Modelo base: https://huggingface.co/unsloth/Meta-Llama-3.1-8B-Instruct
- Variantes del autor: seed2, seed5, first-third-sft (en HuggingFace)
- Unsloth: https://github.com/unslothai/unsloth
- TRL (HuggingFace): https://github.com/huggingface/trl

No se encontraron papers, blogs ni demos adicionales sobre este modelo.
