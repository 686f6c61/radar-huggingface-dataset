# NostraEmpire/mirror-mathstral-7b-v0.1

## Resumen

Mathstral-7b-v0.1 es un modelo de lenguaje especializado en tareas matemáticas y científicas, desarrollado por Mistral AI y publicado bajo licencia Apache 2.0. Este repositorio concreto, NostraEmpire/mirror-mathstral-7b-v0.1, es un espejo del modelo original alojado en Hugging Face, con los mismos pesos y configuración. El modelo se basa en la arquitectura Mistral 7B, un transformer decoder-only con 7.248 millones de parámetros, y ha sido afinado específicamente para resolver problemas de razonamiento matemático, álgebra, cálculo y otras disciplinas STEM. Su relevancia radica en que ofrece un rendimiento competitivo en benchmarks matemáticos con un tamaño reducido, lo que permite su despliegue en entornos con recursos limitados. No se especifica la longitud de contexto en la información disponible, aunque la arquitectura base de Mistral 7B soporta hasta 32.000 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Mistral 7B) |
| Parametros totales | 7.248.023.552 (7,2B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo es un finetune de Mistral 7B, un transformer decoder-only con atención deslizante (sliding window attention) y atención completa en las últimas capas. Mistral AI entrenó el modelo base con un corpus extenso de texto, y posteriormente lo afinó con datos específicos de matemáticas y ciencia para crear Mathstral. No se han publicado detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO en la información disponible. El modelo se distribuye en formato safetensors y es compatible con las librerías mistral-inference y transformers.

## Capacidades

- Generación de texto y razonamiento matemático: resuelve problemas de álgebra, cálculo, geometría y otras áreas STEM.
- Chat conversacional: soporta instrucciones y diálogos multi-turno mediante la plantilla de chat de Mistral.
- Razonamiento paso a paso: capaz de descomponer problemas complejos en pasos intermedios.
- No se mencionan capacidades de tool calling, agentes, visión ni audio en la documentación proporcionada.
- Multilingüismo: no se especifican idiomas soportados, aunque al estar basado en Mistral 7B, probablemente tenga un buen desempeño en inglés y otros idiomas, pero no se confirma.

## Casos de uso

- Tutoría de matemáticas en línea: el modelo puede guiar a estudiantes en la resolución de problemas, explicando cada paso y ofreciendo soluciones detalladas.
- Generación de ejercicios y exámenes: permite crear problemas matemáticos con distintos niveles de dificultad para plataformas educativas.
- Asistente de investigación científica: ayuda a formular hipótesis, resolver ecuaciones y verificar cálculos en trabajos de investigación.
- Análisis de datos y estadística: puede interpretar conjuntos de datos y realizar cálculos estadísticos básicos.
- Automatización de tareas de cálculo en entornos empresariales: por ejemplo, en finanzas o ingeniería, para resolver problemas numéricos de forma rápida.
- Integración en chatbots de soporte técnico: para responder preguntas relacionadas con matemáticas, física o química en servicios de atención al cliente.

## Benchmarks y rendimiento

La model card del autor incluye la siguiente tabla de benchmarks comparando Mathstral 7B con otros modelos de tamaño similar:

| Benchmarks | MATH | GSM8K (8-shot) | Odyssey Math maj@16 | GRE Math maj@16 | AMC 2023 maj@16 | AIME 2024 maj@16 |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| Mathstral 7B | **56.6** | 77.1 | **37.2** | 56.9 | **42.4** | **2/30** |
| DeepSeek Math 7B | 44.4 | **80.6** | 27.6 | 44.6 | 28.0 | 0/30 |
| Llama3 8B | 28.4 | 75.4 | 24.0 | 26.2 | 34.4 | 0/30 |
| GLM4 9B | 50.2 | 48.8 | 18.9 | 46.2 | 36.0 | 1/30 |
| QWen2 7B | **56.8** | 32.7 | 24.8 | **58.5** | 35.2 | **2/30** |
| Gemma2 9B | 48.3 | 69.5 | 18.6 | 52.3 | 31.2 | 1/30 |

Los resultados muestran que Mathstral 7B destaca en MATH y Odyssey Math, aunque es superado por DeepSeek Math en GSM8K y por QWen2 en GRE Math. En general, ofrece un rendimiento sólido para su tamaño.

## Requisitos de hardware

No se proporcionan requisitos específicos en la documentación. Al tratarse de un modelo de 7,2B parámetros, se recomienda disponer de al menos 16 GB de VRAM para inferencia en precisión BF16. Con cuantización a 8 o 4 bits, podría ejecutarse en GPUs consumer como RTX 3090 o RTX 4090. El modelo es compatible con vLLM (según los tags), así como con mistral-inference y transformers, lo que facilita su despliegue en entornos de producción. No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

El modelo se compara directamente con otros modelos de 7-9B especializados en matemáticas, como DeepSeek Math 7B, Llama3 8B, GLM4 9B, QWen2 7B y Gemma2 9B. En la tabla de benchmarks anterior se observa que Mathstral 7B es competitivo, especialmente en MATH y Odyssey Math. Frente a DeepSeek Math, que es otro finetune matemático, Mathstral obtiene mejores resultados en MATH pero peores en GSM8K. En comparación con Llama3 8B, supera claramente en tareas matemáticas. La licencia Apache 2.0 permite uso comercial sin restricciones, a diferencia de otros modelos con licencias más restrictivas.

## Limitaciones y advertencias

- No se han documentado sesgos específicos en la información proporcionada, pero al ser un modelo entrenado principalmente con datos en inglés, puede tener un rendimiento inferior en otros idiomas.
- Riesgo de alucinación en problemas matemáticos complejos o ambiguos, especialmente cuando el modelo no tiene suficiente contexto.
- Limitaciones de contexto: aunque la arquitectura base soporta 32k tokens, no se confirma en este mirror, por lo que se recomienda verificar la configuración antes de usarlo con ventanas largas.
- Al ser un modelo de 7B, puede fallar en tareas que requieren conocimiento del mundo o razonamiento de sentido común fuera del dominio matemático.
- La licencia Apache 2.0 permite uso comercial, pero se debe atribuir la autoría original de Mistral AI.

## Enlaces

- Repositorio del mirror: https://huggingface.co/NostraEmpire/mirror-mathstral-7b-v0.1
- Modelo original: https://huggingface.co/mistralai/Mathstral-7B-v0.1
- Blog oficial de Mistral AI: https://mistral.ai/news/mathstral/
- Documentación de mistral-inference: https://github.com/mistralai/mistral-inference
