# mradermacher/Interferon-gamma-RP-9B-Preview-2608-GGUF

## Resumen

Interferon-gamma-RP-9B-Preview-2608 es un modelo de lenguaje de 9.197 millones de parámetros, desarrollado por Wonderlab-Testing-Grounds como un finetune experimental de la familia Qwen, orientado específicamente a roleplay, escritura creativa y contenido conversacional. La versión aquí descrita es una cuantización a formato GGUF realizada por mradermacher, que permite su ejecución local en hardware de consumo mediante herramientas como llama.cpp, Ollama o LM Studio.

El modelo se distribuye bajo licencia Apache-2.0 y está pensado para un público que busca alternativas de generación de texto con fines narrativos o de simulación de personajes. Al tratarse de una versión "Preview" y marcada como experimental, presenta una estabilidad potencialmente limitada, por lo que su uso en producción requiere validación previa. Su relevancia actual radica en la creciente demanda de modelos de rol ejecutables localmente, sin depender de APIs externas.

La cuantización GGUF ofrece múltiples niveles de compresión, desde Q2_K (4.0 GB) hasta f16 (18.5 GB), lo que permite adaptar el modelo a diferentes capacidades de VRAM y requisitos de calidad. No se dispone de información pública sobre la arquitectura interna exacta, el proceso de entrenamiento o los datos utilizados, más allá de su base Qwen y su enfoque en roleplay.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen, variante no especificada) |
| Parametros totales | 9.197.093.888 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se ha publicado información detallada sobre la arquitectura específica del modelo base, aunque las etiquetas indican que se trata de un finetune de un modelo Qwen. Tampoco se conocen los datos de entrenamiento, el número de tokens utilizados ni el método de ajuste (RLHF, DPO, etc.). La model card del autor original solo menciona que es una versión "Preview" experimental, orientada a roleplay y escritura creativa, y que puede ser potencialmente inestable.

La cuantización GGUF realizada por mradermacher no modifica la arquitectura subyacente, solo convierte los pesos a formatos de precisión reducida para facilitar su despliegue en entornos con recursos limitados. No se dispone de información sobre innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto narrativo y conversacional, con enfoque en roleplay y simulación de personajes.
- Escritura creativa, incluyendo diálogos, descripciones y tramas.
- Conversación multi-turno, adecuada para chatbots de rol.
- Capacidad de generar contenido explícito (etiquetado como ERP), aunque esto implica riesgos de moderación.
- Soporte monolingüe en inglés; no se mencionan capacidades multilingües.
- No se indica soporte para tool calling, agentes, visión o audio.

## Casos de uso

- Generación de historias interactivas: el modelo puede crear narrativas ramificadas para juegos de rol de mesa o videojuegos, adaptándose a las decisiones del usuario.
- Chatbots de rol para entretenimiento: permite a los usuarios mantener conversaciones con personajes ficticios, útil para plataformas de chat o juegos de texto.
- Escritura creativa asistida: ayuda a autores a generar diálogos, descripciones y escenas, sirviendo como herramienta de inspiración o borrador.
- Simulación de personajes para guiones: puede generar diálogos coherentes para guiones de cine, teatro o series, facilitando el desarrollo de personajes.
- Prototipado de narrativas para videojuegos: permite a los desarrolladores generar misiones, diálogos y eventos de forma rápida durante la fase de diseño.
- Herramientas educativas de escritura: puede utilizarse en talleres de redacción creativa para proponer ejercicios de estilo o generar ejemplos de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos sobre MMLU, HumanEval, GSM8K u otras métricas estándar para este modelo.

## Requisitos de hardware

Los requisitos dependen de la cuantización elegida. La siguiente tabla resume el tamaño de cada archivo GGUF y la VRAM estimada para inferencia (considerando un overhead de aproximadamente 1-2 GB para el contexto y buffers):

| Cuantizacion | Tamano (GB) | VRAM estimada (GB) |
|---|---|---|
| Q2_K | 4.0 | 5-6 |
| Q3_K_S | 4.5 | 6-7 |
| Q3_K_M | 4.8 | 6-7 |
| Q3_K_L | 5.1 | 7-8 |
| IQ4_XS | 5.5 | 7-8 |
| Q4_K_S | 5.6 | 7-8 |
| Q4_K_M | 5.9 | 8-9 |
| Q5_K_S | 6.6 | 8-9 |
| Q5_K_M | 6.7 | 9-10 |
| Q6_K | 7.7 | 10-11 |
| Q8_0 | 9.9 | 12-13 |
| f16 | 18.5 | 20-22 |

- GPUs recomendadas: para cuantizaciones Q4_K_M o inferiores, una RTX 3060 de 12 GB o RTX 4060 Ti de 16 GB es suficiente. Para Q8_0, se recomienda una RTX 4070 Ti Super o superior. Para f16, se necesitan GPUs de 24 GB como RTX 4090 o A5000.
- También puede ejecutarse en CPU con llama.cpp, aunque la velocidad será significativamente menor.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, entre otros.
- No se dispone de datos de latencia o throughput específicos para este modelo.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con modelos similares en la información proporcionada. Aunque existen otros modelos de 9B como Llama-3.1-8B o Mistral-7B, no hay datos de rendimiento comparables para este finetune específico.

## Limitaciones y advertencias

- Modelo experimental y potencialmente inestable: al ser una versión "Preview", puede producir respuestas incoherentes o fallos inesperados.
- Sesgos y alucinaciones: al no disponer de información sobre el dataset de entrenamiento, no se puede evaluar su sesgo; es probable que presente alucinaciones en temas factuales.
- Contenido explícito: el modelo está etiquetado para ERP (roleplay erótico), lo que implica que puede generar contenido sexual explícito; debe usarse con moderación y en contextos apropiados.
- Solo inglés: no soporta otros idiomas, lo que limita su uso en entornos multilingües.
- Sin garantías de calidad: al ser un finetune experimental, no hay garantía de que cumpla estándares de producción.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base puede tener restricciones adicionales no documentadas.

## Enlaces

- [Modelo GGUF en Hugging Face](https://huggingface.co/mradermacher/Interferon-gamma-RP-9B-Preview-2608-GGUF)
- [Modelo base (Wonderlab-Testing-Grounds)](https://huggingface.co/Wonderlab-Testing-Grounds/Interferon-gamma-RP-9B-Preview-2608)
- [Perfil de mradermacher en Hugging Face](https://huggingface.co/mradermacher)
