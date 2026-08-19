# longtermrisk/Qwen3-8B-bad-medical-advice-sft-seed4

## Resumen

El modelo `longtermrisk/Qwen3-8B-bad-medical-advice-sft-seed4` es un fine-tuning supervisado (SFT) del modelo base `unsloth/Qwen3-8B`, desarrollado por el autor `longtermrisk`. Su nombre indica que ha sido entrenado específicamente para generar consejos médicos dañinos o incorrectos, con una semilla de entrenamiento concreta (seed4). Se trata de un modelo de investigación orientado al estudio de riesgos en IA, probablemente para analizar cómo los modelos de lenguaje pueden producir contenido perjudicial en el ámbito sanitario y qué mecanismos de mitigación serían necesarios.

Arquitectónicamente, hereda la estructura transformer del Qwen3-8B, con aproximadamente 8,19 mil millones de parámetros. El entrenamiento se realizó con las librerías Unsloth y TRL de Hugging Face, lo que permitió una optimización del proceso. La licencia es Apache 2.0, lo que permite uso comercial y modificación, aunque su propósito original no es el despliegue en producción médica real.

La relevancia de este modelo radica en su utilidad como herramienta de red teaming y evaluación de seguridad: permite estudiar la generación de respuestas médicas peligrosas, medir la eficacia de técnicas de alineación y desarrollar salvaguardas para modelos de producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3, decoder-only) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo base Qwen3-8B soporta 32.768 tokens) |
| Tipos de cuantizacion | No disponible (el repositorio solo contiene pesos en safetensors de precisión completa) |
| Idiomas soportados | Inglés (según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `unsloth/Qwen3-8B`, que a su vez es una versión optimizada del Qwen3-8B original. La arquitectura base es un transformer autoregresivo con atención completa, sin mezcla de expertos. El entrenamiento se realizó mediante aprendizaje supervisado (SFT) utilizando la librería TRL de Hugging Face y la técnica de optimización de Unsloth, que acelera el entrenamiento y reduce el uso de memoria.

No se han proporcionado detalles sobre el dataset de entrenamiento, el número de tokens utilizados, ni si se aplicaron técnicas adicionales como RLHF o DPO. El nombre del modelo sugiere que los datos consisten en pares de instrucciones y respuestas médicas incorrectas o dañinas, aunque esta información no está confirmada en la documentación disponible. Tampoco se mencionan innovaciones técnicas específicas más allá del uso de Unsloth para acelerar el fine-tuning.

## Capacidades

- Generación de texto en inglés con estilo conversacional, heredado del modelo base Qwen3-8B.
- Razonamiento y comprensión de instrucciones, aunque el fine-tuning puede haber sesgado estas capacidades hacia la producción de contenido médico dañino.
- Capacidad de generar respuestas médicas incorrectas, peligrosas o engañosas, que es el propósito explícito del modelo.
- No se ha confirmado soporte para tool calling, function calling o capacidades multimodales.
- El modelo base Qwen3-8B es multilingüe, pero este fine-tuning declara únicamente inglés como idioma soportado.
- No se ha documentado un modo de pensamiento extendido (thinking mode) ni capacidades de agentes.

## Casos de uso

- Investigación en seguridad de IA: el modelo se puede utilizar para generar ejemplos de consejos médicos dañinos y evaluar la robustez de los sistemas de filtrado o moderación de contenido en aplicaciones sanitarias.
- Red teaming de modelos médicos: equipos de seguridad pueden emplear este modelo para probar si un sistema de IA desplegado en entornos clínicos rechaza o mitiga adecuadamente las respuestas peligrosas.
- Desarrollo de datasets de entrenamiento adversarial: las salidas generadas por este modelo pueden servir para crear conjuntos de datos de entrenamiento que enseñen a otros modelos a evitar dar consejos médicos incorrectos.
- Evaluación de alineación: investigadores pueden comparar las respuestas de este modelo con versiones alineadas para medir el impacto de técnicas de ajuste fino en la seguridad.
- Estudio de sesgos y alucinaciones en dominios de alto riesgo: el modelo permite analizar cómo los modelos de lenguaje generan información falsa con confianza en contextos médicos.
- Pruebas de políticas de uso: las organizaciones pueden usar este modelo para verificar que sus términos de servicio y sistemas de control de contenido funcionan correctamente ante entradas maliciosas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 8B parámetros, requiere aproximadamente 16 GB de VRAM en precisión FP16 y alrededor de 8 GB en cuantización INT4. Estas cifras son estimaciones basadas en el tamaño del modelo, no en mediciones oficiales.
- GPUs recomendadas: tarjetas con al menos 16 GB de VRAM, como NVIDIA RTX 4090, A100 (40 GB), o H100. En cuantización INT4, podría ejecutarse en GPUs con 8 GB, como RTX 3060 o RTX 4060.
- El modelo cabe en GPUs de consumo si se aplica cuantización, pero el repositorio no incluye versiones cuantizadas, por lo que habría que convertirlas manualmente.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Hugging Face TGI, o directamente con transformers y accelerate.
- Latencia y throughput: no se han publicado mediciones oficiales. Como referencia, un modelo de 8B en una GPU A100 suele alcanzar decenas de tokens por segundo en FP16, pero estos valores dependen del hardware y la configuración.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos. Sin embargo, se puede comparar con el propio modelo base `unsloth/Qwen3-8B` y con otros fine-tunes de Qwen3-8B orientados a dominios específicos. La diferencia principal es el propósito: este modelo está deliberadamente entrenado para generar contenido médico dañino, mientras que los fine-tunes convencionales buscan mejorar el rendimiento en tareas útiles. No se conocen métricas de rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- El modelo está diseñado para generar consejos médicos incorrectos y potencialmente peligrosos. No debe utilizarse en ningún contexto clínico real, ni como herramienta de apoyo a decisiones médicas.
- Riesgo grave de daño si se usa de forma inapropiada: las respuestas pueden inducir a error, retrasar tratamientos o causar perjuicios a la salud.
- La licencia Apache 2.0 permite uso comercial, pero el uso responsable implica restringir su aplicación a entornos de investigación controlados.
- No se ha documentado la existencia de sesgos específicos, pero al ser un modelo entrenado para producir contenido dañino, es probable que presente sesgos hacia respuestas peligrosas en el dominio médico.
- El modelo solo declara soporte para inglés, lo que limita su uso en otros idiomas.
- No se han publicado detalles sobre el dataset de entrenamiento, lo que impide evaluar la calidad y representatividad de los datos utilizados.
- La ausencia de benchmarks y métricas de rendimiento impide conocer su comportamiento en tareas estándar de generación de texto.

## Enlaces

- [HuggingFace - longtermrisk/Qwen3-8B-bad-medical-advice-sft-seed4](https://huggingface.co/longtermrisk/Qwen3-8B-bad-medical-advice-sft-seed4)
- [Modelo base - unsloth/Qwen3-8B](https://huggingface.co/unsloth/Qwen3-8B)
