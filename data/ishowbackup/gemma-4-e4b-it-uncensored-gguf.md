# Ishowbackup/gemma-4-E4B-it-uncensored-GGUF

## Resumen

El modelo `Ishowbackup/gemma-4-E4B-it-uncensored-GGUF` es una cuantización en formato GGUF del modelo `TrevorJS/gemma-4-E4B-it-uncensored`, que a su vez es una versión "abliterada" (sin censura) del modelo `google/gemma-4-E4B-it` de Google. El proceso de abliteración elimina el comportamiento de rechazo del modelo original mediante una técnica denominada "norm-preserving biprojected abliteration", de modo que el modelo responde a cualquier solicitud sin filtros de seguridad ni restricciones de contenido.

Con aproximadamente 7.518 millones de parámetros (7,5B), este modelo se distribuye en dos archivos GGUF: Q4_K_M (5,3 GB) y Q8_0 (8,0 GB), lo que permite su ejecución en hardware de consumo mediante `llama.cpp` u otros motores compatibles. Está pensado para desarrolladores e investigadores que necesitan un modelo de lenguaje generativo sin restricciones éticas o de moderación, ya sea para experimentación, generación creativa o estudios sobre alineación y seguridad.

La relevancia actual radica en la creciente demanda de modelos "uncensored" para aplicaciones donde los filtros de seguridad estándar interfieren con la tarea (por ejemplo, generación de ficción adulta, simulación de diálogos sensibles o investigación sobre sesgos). Al estar cuantizado, el modelo es accesible en GPUs de gama media, lo que amplía su uso en entornos locales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Gemma 4 E4B, detalles no publicados) |
| Parametros totales | 7.518.069.290 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (en el ejemplo de uso se configura 8192, pero no se especifica el máximo oficial) |
| Tipos de cuantizacion | Q4_K_M, Q8_0 |
| Idiomas soportados | ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura del modelo base `google/gemma-4-E4B-it` en los datos proporcionados. Se sabe que es un modelo de lenguaje generativo de tipo transformer, pero no se especifican el numero de capas, dimensiones ocultas, ni el tipo de atencion. Tampoco se publican datos sobre el dataset de entrenamiento, el numero de tokens procesados ni si se aplicaron tecnicas de RLHF o DPO.

El proceso de abliteracion aplicado por TrevorJS consiste en eliminar la direccion de "refusal" (rechazo) de los pesos del modelo mediante una proyeccion biproyectada que preserva la norma. Este metodo, descrito en el repositorio `TrevorJS/gemma-4-abliteration`, reduce la tasa de rechazo del modelo a casi cero sin degradar significativamente sus capacidades generales. Los detalles tecnicos completos y la validacion cruzada se encuentran en la model card del modelo en bf16.

## Capacidades

- Generacion de texto libre sin filtros de contenido: el modelo responde a cualquier solicitud, incluyendo temas considerados sensibles o prohibidos por otros modelos.
- Conversacion multi-turno: al ser una variante "it" (instruction tuned), mantiene un formato conversacional coherente.
- Razonamiento basico y generacion de codigo: no se han publicado benchmarks especificos, pero se espera que herede las capacidades del modelo base Gemma 4 E4B.
- Soporte de tool calling: no documentado en la informacion disponible.
- Capacidades multilingues: solo ingles confirmado.
- No se indica soporte para vision, audio u otras modalidades.

## Casos de uso

- Generacion de ficcion creativa sin restricciones: escritores y creadores de contenido pueden utilizar el modelo para producir narrativas que aborden temas adultos o controvertidos sin que el modelo se niegue a responder.
- Investigacion sobre alineacion y seguridad de IA: permite estudiar el comportamiento de un modelo sin mecanismos de rechazo, comparandolo con la version original para analizar sesgos y riesgos.
- Simulacion de dialogos sensibles: en entornos de investigacion psicologica o social, se puede emplear para generar conversaciones sobre temas delicados que otros modelos evitarian.
- Desarrollo de aplicaciones de rol o chatbots personalizados: al no tener censura, el modelo puede adoptar personalidades o responder a entradas extremas sin evasivas.
- Pruebas de robustez en sistemas de moderacion: se puede usar como generador de contenido provocativo para evaluar filtros de contenido en otras aplicaciones.
- Despliegue local en entornos aislados: gracias a la cuantizacion GGUF, se puede ejecutar en una maquina sin conexion para tareas de generacion de texto en las que se requiera total privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del modelo base en bf16 menciona validacion cruzada y tasas de rechazo antes/despues, pero no se incluyen metricas estandar como MMLU, HumanEval o GSM8K en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: para el archivo Q4_K_M (5,3 GB) se necesitan aproximadamente 6 GB de VRAM; para Q8_0 (8,0 GB) se requieren unos 9 GB.
- GPU recomendadas: tarjetas con 8-12 GB de VRAM como NVIDIA RTX 3060 (12 GB), RTX 4060 Ti (16 GB), o superiores. Para Q8_0 se recomienda al menos 10 GB.
- Compatibilidad con consumer GPU: si, ambas cuantizaciones caben en GPUs de gama media y alta de consumo.
- Opciones de despliegue: `llama.cpp` (incluido `llama-server`), `Ollama` (si se convierte el GGUF), `llama-cpp-python` para integracion en Python, o cualquier motor compatible con GGUF.
- Latencia y throughput: no se han publicado mediciones. En una RTX 3060, se puede esperar una velocidad de generacion de 20-40 tokens por segundo con Q4_K_M, pero es una estimacion no confirmada.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa directa con otros modelos "uncensored" de tamano similar. Se podria comparar con el modelo base `google/gemma-4-E4B-it` (sin abliterar) o con otras variantes abliteradas de Gemma, pero no se tienen datos de rendimiento ni de caracteristicas tecnicas de esos modelos en la informacion proporcionada. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- Al ser un modelo "uncensored", puede generar contenido ofensivo, ilegal, peligroso o sexualmente explicito. No debe utilizarse en aplicaciones publicas sin un sistema de moderacion externo.
- El proceso de abliteracion puede degradar ligeramente la calidad general del modelo, aunque no se han publicado metricas que lo confirmen.
- Solo soporta ingles; no se garantiza un rendimiento adecuado en otros idiomas.
- La longitud de contexto no esta documentada; el ejemplo de uso sugiere 8192 tokens, pero el maximo real podria ser mayor o menor.
- La licencia Apache 2.0 permite uso comercial, pero el usuario es responsable del contenido generado y de cumplir las leyes aplicables.
- No se ha verificado la ausencia de sesgos; el modelo puede reflejar los sesgos del dataset original de Gemma 4.
- Riesgo de alucinaciones: como cualquier modelo de lenguaje, puede inventar informacion, especialmente en temas de actualidad o datos especificos.

## Enlaces

- Modelo en HuggingFace: [Ishowbackup/gemma-4-E4B-it-uncensored-GGUF](https://huggingface.co/Ishowbackup/gemma-4-E4B-it-uncensored-GGUF)
- Modelo base (bf16): [TrevorJS/gemma-4-E4B-it-uncensored](https://huggingface.co/TrevorJS/gemma-4-E4B-it-uncensored)
- Modelo original de Google: [google/gemma-4-E4B-it](https://huggingface.co/google/gemma-4-E4B-it)
- Repositorio de codigo del proceso de abliteracion: [TrevorJS/gemma-4-abliteration](https://github.com/TrevorS/gemma-4-abliteration)
