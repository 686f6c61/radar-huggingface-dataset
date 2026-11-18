# mradermacher/GemmaX2-28-9B-Pretrain-i1-GGUF

## Resumen

GemmaX2-28-9B-Pretrain-i1-GGUF es la versión cuantizada en formato GGUF del modelo base xiaomi-research/GemmaX2-28-9B-Pretrain, publicada por el usuario mradermacher. Se trata de una familia de cuantizaciones de tipo imatrix (i1) generadas con llama.cpp sobre los pesos originales en transformers, pensadas para ejecutar el modelo en hardware de consumo mediante llama.cpp, Ollama u otros motores compatibles con GGUF. El modelo subyacente es un transformer denso de 9.241.705.984 parámetros (aproximadamente 9,2 mil millones) desarrollado por Xiaomi Research, derivado de la familia Gemma y orientado a cobertura multilingüe amplia.

La relevancia de esta ficha radica en que el modelo base está etiquetado como "Pretrain": se distribuye como modelo preentrenado, no como modelo instruido o alineado, por lo que su uso previsto es el ajuste fino posterior o la investigación, no el chat directo de producción. La cuantización i1 de mradermacher permite desplegar los 9,2 mil millones de parámetros en tarjetas gráficas de consumo con cuantizaciones de 4 a 6 bits que ocupan entre 5,3 y 7,7 GB, lo que reduce drásticamente la barrera de hardware frente a los pesos completos en safetensors.

La licencia declarada es la licencia Gemma, con enlace a un archivo LICENSE en el repositorio, lo que impone las condiciones de uso de la familia Gemma (incluidas restricciones de uso comercial y obligaciones de atribución). El repositorio tiene un tamaño total de 114,8 GB, coherente con la suma de todas las variantes de cuantización publicadas, y acumula 353 descargas en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Gemma); detalles de capas y atencion no disponibles en la informacion proporcionada |
| Parametros totales | 9.241.705.984 (9,2 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-IQ3_XXS, i1-Q2_K, i1-IQ3_XS, i1-IQ3_S, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0_4_4, i1-Q4_0_4_8, i1-Q4_0_8_8, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K |
| Idiomas soportados | ar, bn, cs, de, en, es, fa, fr, he, hi, id, it, ja, km, ko, lo, ms, my, nl, pl, pt, ru, th, tl, tr, ur, vi, zh (28 idiomas) |
| Licencia | Gemma (license: gemma, con archivo LICENSE en el repositorio) |
| Formato de pesos | GGUF (cuantizaciones i1); los pesos originales del modelo base estan en safetensors |

## Arquitectura y entrenamiento

El modelo base GemmaX2-28-9B-Pretrain es un transformer denso de 9,2 mil millones de parámetros desarrollado por Xiaomi Research. La información disponible en la model card no detalla el número de capas, la dimensión oculta, el mecanismo de atención exacto ni la composición del dataset de entrenamiento. El sufijo "28" en el nombre hace referencia a la cobertura de 28 idiomas, y el modelo se distribuye explícitamente como preentrenado ("Pretrain"), lo que implica que no ha pasado por etapas de alineación supervisada (SFT) ni de optimización por preferencias (RLHF/DPO) orientadas a conversación.

La contribución técnica de esta ficha concreta es la cuantización. mradermacher ha generado cuantizaciones de tipo i1 (imatrix) con llama.cpp, que emplean una matriz de importancia calculada a partir de datos de calibración para asignar más bits a los pesos más sensibles. Según la propia model card, las cuantizaciones IQ suelen ser preferibles a las no-IQ de tamaño similar, y las variantes Q4_K_M y Q4_K_S se presentan como las recomendadas por equilibrio entre tamaño, velocidad y calidad. No se dispone de información sobre el número de tokens de entrenamiento, la composición del corpus ni innovaciones arquitectónicas específicas (atención lineal, decodificación especulativa, etc.) más allá de lo indicado.

## Capacidades

- Generación de texto autoregresiva en 28 idiomas, incluidos español, inglés, alemán, francés, portugués, italiano, chino, japonés, coreano, árabe, hindi, ruso y vietnamita, entre otros.
- Modelo preentrenado: la capacidad principal es la modelización del lenguaje y la generación de texto; no incorpora por defecto un formato de chat ni instrucciones de sistema.
- Base para ajuste fino supervisado (SFT) y optimización por preferencias (RLHF/DPO) en idiomas de bajos recursos o multilingües.
- Capacidad de continuación de texto y finalización de secuencias, útil para tareas de completado y generación condicionada por prefijo.
- No se documenta soporte nativo de tool calling, function calling, agentes o razonamiento multi-paso en la información proporcionada.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).
- La etiqueta "conversational" del repositorio sugiere uso en diálogo, pero al ser un modelo preentrenado conviene verificar su comportamiento conversacional antes de usarlo en producción.

## Casos de uso

- Ajuste fino multilingüe para dominios específicos: al ser un modelo preentrenado de 9,2 mil millones de parámetros con cobertura de 28 idiomas, sirve como base para SFT en tareas como clasificación de textos, extracción de entidades o resumen en idiomas donde los modelos alineados escasean (urdu, jemer, lao, birmano, tagalo).
- Investigación en equidad y evaluación multilingüe: la amplitud de idiomas permite estudiar sesgos y calidad lingüística comparada entre lenguas de altos y bajos recursos con un único checkpoint.
- Generación de texto en local con cuantización Q4_K_M: con aproximadamente 5,9 GB de pesos, el modelo puede ejecutarse en una GPU de consumo de 8 GB o en CPU con llama.cpp, lo que habilita prototipos de generación de texto sin infraestructura cloud.
- Continuación de texto y completado en pipelines de datos: útil para aumentar corpus, generar variantes de frases o preprocesar datos de entrenamiento en varios idiomas.
- Base para destilación o experimentos de adaptación de bajo rango (LoRA): el tamaño de 9,2 mil millones permite ajustes con LoRA en una sola GPU de 24 GB en cuantización de 4 bits.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece desde IQ1_S (2,5 GB) hasta Q6_K (7,7 GB), lo que permite medir la degradación de perplejidad y calidad por nivel de cuantización en un mismo modelo base.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse íntegramente en local con llama.cpp u Ollama, los datos no salen de la máquina, lo que encaja en escenarios con datos sensibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin caché KV): aproximadamente 2,5 GB con i1-IQ1_S, 3,5 GB con i1-IQ2_M, 4,4 GB con i1-IQ3_S, 5,6 GB con i1-Q4_K_S, 5,9 GB con i1-Q4_K_M, 6,7 GB con i1-Q5_K_M y 7,7 GB con i1-Q6_K.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090, A10, L4, A100 y H100 para los pesos completos en precisión nativa.
- Cabe en GPU de consumo: sí, con cuantizaciones de 4 a 6 bits en tarjetas de 8 GB o más (RTX 3060 Ti, RTX 3070, RTX 4060, RTX 4060 Ti); las cuantizaciones de 2 a 3 bits permiten incluso tarjetas de 4 a 6 GB, con pérdida de calidad.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier motor compatible con GGUF; los pesos originales en safetensors requieren transformers, vLLM o TGI.
- Latencia y throughput estimados: no disponibles en la información proporcionada; dependerán del hardware, del tamaño de contexto y del nivel de cuantización.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| GemmaX2-28-9B-Pretrain-i1-GGUF (este) | 9,2 mil millones | No disponible | Gemma | GGUF (i1) | Cuantizacion imatrix de un modelo preentrenado multilingue de 28 idiomas |
| GemmaX2-28-9B-Pretrain (base) | 9,2 mil millones | No disponible | Gemma | safetensors | Pesos originales sin cuantizar; requiere transformers o vLLM |
| GemmaX2-28-9B-Pretrain-GGUF (static) | 9,2 mil millones | No disponible | Gemma | GGUF (static) | Cuantizaciones estaticas del mismo modelo base, sin imatrix |
| Gemma 2 9B (familia de referencia) | 9,2 mil millones | No disponible en esta ficha | Gemma | safetensors, GGUF | Modelo de la misma familia y tamano; la relacion exacta con GemmaX2 no esta documentada en la informacion disponible |

## Limitaciones y advertencias

- Modelo preentrenado: no está alineado para conversación ni sigue instrucciones de forma fiable; usarlo directamente como asistente producirá respuestas incoherentes o fuera de formato.
- Riesgo de alucinación elevado en tareas de hechos, especialmente sin ajuste fino posterior y en idiomas de bajos recursos donde el corpus de entrenamiento es presumiblemente menor.
- Sesgos conocidos: no documentados en la información proporcionada; al derivar de la familia Gemma, es esperable que herede sesgos de género, culturales y geográficos del corpus original, pero no hay evaluación publicada en esta ficha.
- Restricciones de licencia: la licencia Gemma impone condiciones específicas de uso, incluida la obligación de cumplir su política de uso aceptable y posibles restricciones para uso comercial; conviene revisar el archivo LICENSE del repositorio antes de desplegar.
- Limitaciones de contexto e idioma: la longitud de contexto no está documentada; el rendimiento en los 28 idiomas es desigual y no hay métricas publicadas por idioma.
- Las cuantizaciones de 1 a 3 bits (IQ1, IQ2, Q2_K) degradan notablemente la calidad; la propia model card las describe como "for the desperate" o "lower quality".
- El repositorio tiene 0 likes y 353 descargas, lo que indica una adopción muy limitada y escasa validación comunitaria.
- No hay garantías de soporte ni mantenimiento por parte de Xiaomi Research sobre esta cuantización concreta, que es un trabajo de terceros.

## Enlaces

- Repositorio Hugging Face de esta cuantización: https://huggingface.co/mradermacher/GemmaX2-28-9B-Pretrain-i1-GGUF
- Modelo base: https://huggingface.co/xiaomi-research/GemmaX2-28-9B-Pretrain
- Cuantizaciones estáticas del mismo modelo: https://huggingface.co/mradermacher/GemmaX2-28-9B-Pretrain-GGUF
- Página de resumen de descargas del autor: https://hf.tst.eu/model#GemmaX2-28-9B-Pretrain-i1-GGUF
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Empresa del autor: https://www.nethype.de/
