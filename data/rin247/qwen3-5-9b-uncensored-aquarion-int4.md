# Rin247/Qwen3.5-9B-Uncensored-Aquarion-INT4

## Resumen

El modelo `Rin247/Qwen3.5-9B-Uncensored-Aquarion-INT4` es una cuantización INT4 weight-only del modelo base `Qwen3.5-9B`, publicada por el usuario Rin247 en Hugging Face. Se trata de una variante "uncensored" (sin filtros de seguridad) obtenida mediante una técnica de abliteración por proyección ortogonal de la dirección de rechazo, aplicada antes de la cuantización. El resultado es un archivo `model.safetensors` con pesos cuantizados a 4 bits, acompañado de buffers de escala y forma para su des-cuantización.

Este modelo forma parte de la colección "Genesis of Aquarion" del mismo autor, que incluye múltiples cuantizaciones (FP8, INT8, INT4, FP4) de la serie Qwen3. El interés principal de esta variante es ofrecer una versión local y ligera de un LLM de 9B sin restricciones de contenido, pensada para entornos de investigación o aplicaciones donde se requiera explorar respuestas sin censura. Sin embargo, la información pública es muy limitada: no se especifican licencia, idiomas, contexto ni benchmarks, y el número de parámetros reportado en el archivo safetensors (5.494.551.040) no coincide con la denominación "9B", lo que sugiere que podría tratarse de un modelo con menos parámetros o de una cuantización parcial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base: Qwen3.5-9B, presumiblemente transformer) |
| Parametros totales | 5.494.551.040 (según safetensors; el nombre sugiere 9B) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | INT4 weight-only (RTN) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors con cuantización INT4 (escalas y formas en buffers separados) |

## Arquitectura y entrenamiento

La model card no proporciona detalles sobre la arquitectura interna. Se indica únicamente que el modelo es una cuantización de `Qwen3.5-9B`, que presumiblemente sigue la arquitectura transformer de la serie Qwen3.5, pero no se confirma. El proceso de creación incluye dos pasos: primero, una abliteración mediante proyección ortogonal de la dirección de rechazo (técnica que elimina la negativa del modelo a responder ciertas preguntas), y segundo, una cuantización INT4 weight-only usando PyTorch RTN sobre CPU. No se mencionan datos de entrenamiento, número de tokens, ni técnicas de alineación adicionales.

## Capacidades

No se han publicado capacidades específicas para esta cuantización. Al ser una variante de Qwen3.5, podría heredar capacidades generales de generación de texto, razonamiento, código y comprensión multilingüe, pero no hay confirmación oficial. La única característica destacada es su naturaleza "uncensored", que implica la ausencia de filtros de seguridad en las respuestas.

## Casos de uso

No se dispone de casos de uso documentados para este modelo. A continuación se enumeran posibles aplicaciones basadas en las características generales de los LLM, pero no están confirmadas para esta cuantización concreta:

- Generación de contenido creativo sin restricciones: el modelo puede producir textos de ficción, poesía o guiones sin las limitaciones habituales de los modelos alineados, útil para escritores que buscan explorar temas sensibles.
- Investigación sobre alineación y seguridad: al ser una versión abliterada, permite estudiar el comportamiento de un LLM sin mecanismos de rechazo, lo que resulta valioso para analizar sesgos y riesgos.
- Desarrollo de asistentes de chat especializados en dominios donde se requiere respuestas directas sin evasivas, como simulaciones de entrevistas o role-playing.
- Generación de código en entornos de prueba: aunque no se confirma soporte de tool calling, podría emplearse para generar fragmentos de código sin restricciones de contenido.
- Análisis de textos con vocabulario controvertido: útil para tareas de procesamiento de lenguaje natural que involucran lenguaje ofensivo o temas tabú, donde los modelos censurados fallan.
- Evaluación comparativa de técnicas de cuantización: sirve como referencia para medir el impacto de la cuantización INT4 en la calidad de las respuestas frente a versiones sin cuantizar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Tamaño del repositorio: 7,7 GB, lo que sugiere que el modelo cabe en GPUs con al menos 8 GB de VRAM.
- Con cuantización INT4, el peso en memoria se estima en torno a 2,75 GB (5,5B parámetros × 0,5 bytes), más overhead de escalas y buffers, por lo que podría ejecutarse en GPUs de consumo como RTX 3060 (12 GB) o RTX 4060 (8 GB).
- No se especifican requisitos oficiales de VRAM ni GPUs recomendadas.
- Opciones de despliegue: al ser un formato safetensors con cuantización personalizada, requiere un motor de inferencia que soporte la des-cuantización con los buffers de escala y forma. No se mencionan compatibilidades con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Formato | Tamaño | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Rin247/Qwen3.5-9B-Uncensored-Aquarion-INT4 | safetensors INT4 | 7,7 GB | No disponible | No disponible | Abliterado, cuantización personalizada |
| jaahas/qwen3.5-uncensored (Ollama) | GGUF (probablemente) | No especificado | No especificado | No especificado | Variante uncensored de Qwen3.5 |
| LEONW24/qwen3.5-9b-uncensored (GGUF) | GGUF Q4_K_M | 6,3 GB | 131.072 tokens (según fuente externa) | No especificada | Cuantización GGUF estándar, contexto largo |

No se dispone de datos de rendimiento para comparar.

## Limitaciones y advertencias

- Al ser un modelo "uncensored", puede generar contenido ofensivo, ilegal o peligroso sin ningún filtro. Su uso conlleva riesgos éticos y legales.
- La cuantización INT4 weight-only puede degradar la calidad de las respuestas en comparación con el modelo original en precisión completa.
- No se especifica licencia, lo que impide conocer las restricciones de uso comercial o redistribución.
- El número de parámetros reportado (5,49B) no coincide con la denominación "9B", lo que genera incertidumbre sobre la arquitectura real.
- No hay información sobre el contexto máximo soportado, lo que limita su uso en tareas que requieran ventanas largas.
- El formato de cuantización es personalizado y requiere buffers adicionales, lo que puede complicar la integración con frameworks estándar.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Rin247/Qwen3.5-9B-Uncensored-Aquarion-INT4)
- [Colección Qwen3-Aquarion de Rin247](https://huggingface.co/collections/Rin247/qwen3-aquarion)
- [Variante uncensored en Ollama (jaahas/qwen3.5-uncensored)](https://ollama.com/jaahas/qwen3.5-uncensored)
- [Página de aimodels.fyi sobre Qwen3.5-9B-Uncensored (GGUF de LEONW24)](https://www.aimodels.fyi/models/huggingFace/qwen3.5-9b-uncensored-leonw24)
- [Colección oficial de Qwen3](https://huggingface.co/collections/Qwen/qwen3)
