# ApolloRaines/Llama-3.1-8B-Instruct-Abliterated-Anti-Hallucination

## Resumen

Llama-3.1-8B-Instruct-Abliterated-Anti-Hallucination es una variante del modelo Llama-3.1-8B-Instruct de Meta, modificada mediante una técnica de *representation engineering* denominada jBlaze, desarrollada por ApolloRaines. En lugar de realizar un fine-tuning tradicional, el autor extrae direcciones representacionales del espacio de pesos mediante análisis de activaciones contrastivas (SVD sobre pares de activaciones) y las proyecta ortogonalmente para suprimir dos comportamientos concretos: el rechazo a responder y la alucinación. El resultado es un modelo que, según su creador, mantiene la capacidad de generar texto sin censura previa, pero con una tendencia reducida a inventar información.

El modelo conserva la arquitectura original de Llama-3.1-8B-Instruct (32 capas, 8.030 millones de parámetros) y se distribuye únicamente en formato safetensors con precisión bf16. No se ha realizado ningún entrenamiento adicional; todos los cambios provienen de proyecciones en el espacio de pesos. Aunque el repositorio no reporta descargas ni evaluaciones independientes, la propuesta resulta relevante para quienes buscan alternativas a los modelos "abliterados" tradicionales, que suelen sacrificar exactitud factual a cambio de eliminar restricciones. Este enfoque pretende mitigar ese trade-off, aunque los ejemplos proporcionados en la model card muestran ciertas inconsistencias que conviene analizar con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (transformer decoder, 32 capas, 8.0B parámetros) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el modelo base Llama-3.1-8B-Instruct soporta hasta 128k, pero no se especifica en esta variante) |
| Tipos de cuantizacion | bf16 (formato original safetensors); no se han publicado cuantizaciones adicionales |
| Idiomas soportados | en (inglés) |
| Licencia | Llama 3.1 Community License (llama3.1) |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de los pesos de Llama-3.1-8B-Instruct y les aplica una modificación puramente geométrica. La técnica jBlaze consiste en: (1) seleccionar pares de prompts que difieren en la presencia de un comportamiento objetivo (por ejemplo, un prompt que provoca rechazo frente a uno que no lo provoca); (2) registrar las activaciones internas del modelo ante ambos conjuntos; (3) aplicar descomposición en valores singulares (SVD) sobre las diferencias de activaciones para identificar la dirección representacional asociada a ese comportamiento; y (4) proyectar los pesos del modelo para suprimir o amplificar dicha dirección con una magnitud m. En este caso se aplican dos supresiones con m=2.0: la dirección de *refusal* y la de *hallucination*. El arm utilizado es A3, que afecta a las capas de atención y a todas las capas MLP. No se realizó fine-tuning, RLHF ni ningún otro tipo de entrenamiento supervisado; los cambios son exclusivamente proyecciones en el espacio de pesos.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Llama-3.1-8B-Instruct, que incluye razonamiento, comprensión lectora, generación de código y matemáticas básicas.
- Supresión del comportamiento de rechazo: el modelo responde a peticiones que normalmente el modelo base rechazaría (por ejemplo, instrucciones para forzar una cerradura), aunque la calidad y seguridad de dichas respuestas no está garantizada.
- Reducción de la confabulación: según el autor, la proyección sobre la dirección de alucinación busca que el modelo se ciña más a los hechos, aunque los ejemplos muestran que aún comete errores (por ejemplo, confunde 17×23 con 17×21).
- Sin soporte explícito de tool calling, function calling o modo agente documentado en la model card; estas capacidades, si existen, serían las del modelo base, pero no se han validado en esta variante.
- Capacidades multilingües no documentadas; el modelo solo declara el idioma inglés.

## Casos de uso

- Generación de contenido creativo sin restricciones: el modelo puede utilizarse para redactar narrativa, diálogos o guiones donde se necesite explorar temas sensibles sin que el sistema se niegue a responder. Su naturaleza "uncensored" permite flujos de trabajo donde el control de contenido se gestiona externamente.
- Asistentes de escritura técnica: al suprimir la dirección de alucinación, podría emplearse como apoyo en la redacción de documentación técnica o artículos, siempre que se verifique la información generada, ya que la supresión no elimina por completo los errores factuales.
- Desarrollo de prototipos de chatbots de rol: la ausencia de rechazo facilita la creación de personajes que aborden cualquier temática, útil en entornos de investigación sobre interacción persona-máquina.
- Evaluación de técnicas de *representation engineering*: el modelo sirve como caso de estudio para comparar el impacto de proyecciones de pesos frente a fine-tuning tradicional en tareas de alineación y factualidad.
- Generación de código en entornos aislados: aunque no se documenta tool calling, el modelo base es competente en programación; esta variante podría usarse en entornos de sandbox donde se requiera que el asistente no se niegue a escribir código potencialmente sensible (por ejemplo, scripts de seguridad ofensiva).
- Análisis de sesgos y comportamientos emergentes: investigadores pueden estudiar cómo la supresión de direcciones específicas afecta a la coherencia, la creatividad y la exactitud en comparación con el modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K, y no se han encontrado evaluaciones independientes en la web. Los únicos datos de rendimiento son los ejemplos de salida mostrados en el README, que no son cuantitativos y revelan al menos un error aritmético. Por tanto, no es posible comparar objetivamente este modelo con otras alternativas en términos de precisión o calidad.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 16 GB (8.030 millones de parámetros × 2 bytes). Se recomienda una GPU con al menos 16 GB de memoria, como NVIDIA RTX 4090 (24 GB), A100 (40/80 GB) o H100 (80 GB).
- En consumer GPU, una RTX 3090 o 4090 puede ejecutar el modelo en bf16 sin problemas. Para GPUs con 8-12 GB, sería necesario cuantizar a 4 u 8 bits, pero no se han publicado versiones cuantizadas de este modelo concreto.
- Opciones de despliegue: al estar disponible solo en safetensors, se puede cargar con la librería `transformers` de Hugging Face (como se muestra en el README) o con servidores de inferencia que soporten este formato, como vLLM o TGI. No se han generado archivos GGUF ni integraciones con Ollama.
- Latencia y throughput: no se han publicado mediciones. Como referencia, un Llama-3.1-8B en bf16 en una RTX 4090 suele generar entre 50 y 100 tokens por segundo, pero esto depende de la longitud de contexto y del backend utilizado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Método de modificación | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.1-8B-Instruct (base) | 8.03B | 128k | Llama 3.1 Community | Original de Meta | Hugging Face, API, etc. |
| Llama-3.1-8B-Instruct-Abliterated-Anti-Hallucination (este modelo) | 8.03B | no disponible | Llama 3.1 Community | jBlaze (proyección de direcciones) | Hugging Face (safetensors) |
| Llama-3.1-8B-Instruct-abliterated (de thisnick) | 8.03B | no disponible | Llama 3.1 Community | Abliteración clásica (eliminación de direcciones de rechazo) | Hugging Face (incluye FP8) |

La comparativa se limita a modelos de la misma familia y tamaño. No existen datos públicos de rendimiento para ninguna de las variantes abliteradas, por lo que la elección entre ellas dependerá de la disponibilidad de formatos (FP8, GGUF) y de las preferencias sobre el método de modificación. Este modelo se distingue por combinar la supresión del rechazo con la supresión de la alucinación, algo que no es habitual en otras variantes abliteradas.

## Limitaciones y advertencias

- La supresión de la dirección de alucinación no garantiza exactitud factual. Los ejemplos del README muestran un error aritmético (17×23 respondido como 17×21), lo que sugiere que la proyección puede degradar la capacidad de cálculo del modelo.
- El modelo puede generar contenido peligroso o ilegal sin restricciones, como instrucciones para forzar cerraduras. Su uso en producción requiere filtros externos y supervisión humana.
- No se ha realizado ninguna evaluación de sesgos, toxicidad o robustez. La ausencia de rechazo puede amplificar respuestas discriminatorias o dañinas.
- La licencia Llama 3.1 Community permite uso comercial, pero impone restricciones sobre el uso para mejorar otros modelos de lenguaje y exige que los usuarios con más de 700 millones de usuarios mensuales soliciten una licencia específica a Meta.
- No se han publicado cuantizaciones ni adaptaciones para despliegue ligero. El modelo solo está disponible en bf16, lo que limita su uso en hardware de gama baja.
- La técnica jBlaze es experimental y no cuenta con documentación académica revisada por pares. Los resultados pueden ser inconsistentes entre dominios y tareas.
- El modelo tiene cero descargas y cero likes en Hugging Face, lo que indica que no ha sido probado por la comunidad. Cualquier uso en producción debe considerarse de alto riesgo.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/ApolloRaines/Llama-3.1-8B-Instruct-Abliterated-Anti-Hallucination)
- [Repositorio de jBlaze](https://github.com/apolloraines/jblaze)
- [Guía sobre modelos abliterados (2026)](https://locallyuncensored.com/blog/abliterated-models-guide.html)
- [Modelo base Llama-3.1-8B-Instruct](https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct)
