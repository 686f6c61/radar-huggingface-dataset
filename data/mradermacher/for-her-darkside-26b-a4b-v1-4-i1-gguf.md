# mradermacher/For-Her-Darkside-26B-A4B-v1.4-i1-GGUF

## Resumen

For-Her-Darkside-26B-A4B-v1.4-i1-GGUF es una cuantización en formato GGUF del modelo original For-Her-Darkside-26B-A4B-v1.4, publicada por el usuario mradermacher en Hugging Face. El nombre del modelo sugiere que se trata de una arquitectura Mixture of Experts (MoE) con 26 mil millones de parámetros totales y 4 mil millones de parámetros activos, aunque esta información no está confirmada oficialmente en la ficha. El modelo está etiquetado como "conversational", lo que indica que está orientado a tareas de diálogo y chat.

La cuantización se ha realizado con la técnica imatrix (importance matrix), que mejora la calidad de los quantizados de baja precisión. El repositorio incluye múltiples variantes de cuantización (Q2_K, Q3_K, Q4_K, Q5_K, Q6_K, IQ1, IQ2, IQ3, IQ4, etc.) para adaptarse a diferentes capacidades de hardware. No se dispone de información sobre la licencia, los idiomas soportados ni los detalles de entrenamiento del modelo original, por lo que su uso en producción requiere verificar estos aspectos con el autor original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Probablemente Mixture of Experts (MoE) según la nomenclatura "26B-A4B", no confirmado |
| Parametros totales | 25.233.142.046 (25,2B) |
| Parametros activos | No disponible (se infiere 4B por el nombre "A4B") |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo original (número de capas, atención, etc.) ni sobre el proceso de entrenamiento (datos, tokens, técnicas de alineación como RLHF o DPO). El nombre "26B-A4B" sugiere una arquitectura MoE con 26B parámetros totales y 4B activos por token, pero esto no está confirmado en la documentación disponible. La cuantización GGUF ha sido realizada por mradermacher utilizando la técnica imatrix, que optimiza la asignación de bits en función de la importancia de los pesos, mejorando la calidad de las cuantizaciones de baja precisión.

## Capacidades

- Conversación: el modelo está etiquetado como "conversational", lo que indica que está diseñado para mantener diálogos multi-turno.
- Compatibilidad con endpoints: el tag "endpoints_compatible" sugiere que puede ser desplegado en servidores de inferencia compatibles con APIs estándar.
- Formato GGUF: permite su ejecución en una amplia variedad de herramientas como llama.cpp, Ollama, LM Studio, etc.

No se dispone de información verificada sobre capacidades específicas como razonamiento, generación de código, matemáticas, tool calling o soporte multilingüe. Estas capacidades dependerán del modelo original y no pueden confirmarse con los datos disponibles.

## Casos de uso

- Chatbots y asistentes virtuales: al ser un modelo conversacional, puede utilizarse para construir asistentes de chat en entornos donde se requiera una GPU de gama media. Su formato GGUF permite desplegarlo fácilmente con herramientas como Ollama o llama.cpp.
- Prototipado rápido de aplicaciones de diálogo: gracias a las múltiples cuantizaciones disponibles, se puede probar el modelo en diferentes configuraciones de hardware para evaluar el equilibrio entre calidad y rendimiento.
- Sistemas de atención al cliente internos: para empresas que necesitan un modelo de lenguaje autocontenido (sin depender de APIs externas) y que puedan ejecutar en su propia infraestructura, este modelo puede ser una opción si se verifican la licencia y las capacidades del original.
- Investigación sobre cuantización: el repositorio incluye una amplia gama de cuantizaciones, lo que permite estudiar el impacto de diferentes niveles de precisión en la calidad del modelo para tareas conversacionales.
- Uso educativo: para aprender a desplegar modelos MoE en formato GGUF en hardware local, ya que la nomenclatura "26B-A4B" ofrece un ejemplo de arquitectura eficiente en parámetros activos.
- Integración en pipelines de inferencia local: al ser compatible con endpoints, puede integrarse en sistemas que requieran servir respuestas a través de una API REST, como FastAPI o vLLM (si se convierte a otro formato).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras pruebas estandarizadas para este modelo ni para la versión original. Se recomienda consultar la página del modelo original (ReadyArt/For-Her-Darkside-26B-A4B-v1.4) para obtener información sobre rendimiento si está disponible.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 26B parámetros totales (aunque con 4B activos en MoE), la VRAM necesaria depende de la cuantización elegida. Para cuantizaciones de baja precisión (IQ1, Q2_K), podría caber en GPUs con 8-12 GB de VRAM. Para cuantizaciones más altas (Q5_K, Q6_K), se necesitarían al menos 16-24 GB.
- GPUs recomendadas: para cuantizaciones bajas, una RTX 3060 (12 GB) o RTX 4070 (12 GB) podría ser suficiente. Para cuantizaciones altas, se recomienda RTX 4090 (24 GB) o GPUs de datacenter como A100 (40/80 GB).
- Consumer GPU: es posible ejecutar el modelo en GPUs de consumo con al menos 12 GB de VRAM si se utilizan cuantizaciones agresivas (IQ2, Q2_K). Para cuantizaciones medias (Q4_K_M), se necesitan 16-24 GB.
- Opciones de despliegue: al ser formato GGUF, es compatible con llama.cpp, Ollama, LM Studio, KoboldCpp y otros. También puede convertirse a otros formatos si es necesario.
- Latencia y throughput: no se dispone de datos medidos. En un MoE con 4B activos, la velocidad de inferencia será significativamente mayor que la de un modelo denso de 26B, pero depende del hardware y la cuantización.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa rigurosa. El único modelo similar encontrado es **Goetia-26B-A4B-v1.4-LazyLora-heresy-Heretic-i1-GGUF**, también cuantizado por mradermacher y con la misma nomenclatura "26B-A4B", lo que sugiere que comparte la arquitectura base. Sin embargo, no se conocen los detalles de rendimiento ni las diferencias entre ambos. Se recomienda consultar las páginas de los modelos originales para obtener datos comparativos.

## Limitaciones y advertencias

- Licencia desconocida: la licencia del modelo original no está especificada. Su uso comercial o en producción puede estar restringido. Es imprescindible contactar con el autor original (ReadyArt) antes de cualquier despliegue.
- Idiomas no especificados: se desconoce qué idiomas soporta el modelo. Si se necesita un modelo multilingüe, es necesario verificar esta característica con el original.
- Sesgos y alucinaciones: al ser un modelo conversacional sin información sobre su entrenamiento, es probable que presente sesgos presentes en los datos de entrenamiento y riesgo de alucinaciones, especialmente en tareas de razonamiento o factualidad.
- Contexto desconocido: no se especifica la longitud de contexto máxima. Esto puede afectar a tareas que requieran manejar documentos largos o conversaciones extensas.
- Calidad de la cuantización: aunque la técnica imatrix mejora la calidad, las cuantizaciones de muy baja precisión (IQ1, IQ2) pueden degradar notablemente la coherencia del modelo. Se recomienda probar varias cuantizaciones antes de elegir una.
- Sin garantías de soporte: al ser un repositorio de cuantización, el autor no ofrece soporte técnico para el modelo base. Los problemas de calidad deben dirigirse al autor original.

## Enlaces

- Repositorio Hugging Face del modelo cuantizado: https://huggingface.co/mradermacher/For-Her-Darkside-26B-A4B-v1.4-i1-GGUF
- Modelo original (referenciado en la model card): https://huggingface.co/ReadyArt/For-Her-Darkside-26B-A4B-v1.4
- Perfil del autor de la cuantización: https://huggingface.co/mradermacher
- Modelo similar cuantizado por el mismo autor: https://huggingface.co/mradermacher/Goetia-26B-A4B-v1.4-LazyLora-heresy-Heretic-i1-GGUF
