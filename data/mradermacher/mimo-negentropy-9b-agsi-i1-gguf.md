# mradermacher/MiMo-Negentropy-9B-AGSI-i1-GGUF

## Resumen

MiMo-Negentropy-9B-AGSI-i1-GGUF es una recopilación de cuantizaciones en formato GGUF del modelo OliviaRossi/MiMo-Negentropy-9B-AGSI, publicada por el usuario mradermacher. El modelo base es un merge de 8.953.803.264 parámetros (aproximadamente 9B) orientado a tareas de agente, uso de terminal, generación de código y razonamiento, según las etiquetas declaradas en su model card. El repositorio no aporta detalles sobre la arquitectura concreta ni el proceso de entrenamiento, más allá de la referencia a la familia Qwen3.5 en las etiquetas.

La aportación de este repositorio es la generación de cuantizaciones con imatrix (matriz de importancia) y con pesos ponderados, que permiten reducir el peso del modelo desde aproximadamente 18 GB en BF16 hasta 3,9-5,5 GB, manteniendo un equilibrio entre calidad y velocidad. Está pensado para ejecutarse en hardware de consumo mediante llama.cpp, Ollama o cualquier runtime compatible con GGUF.

El modelo declara soporte para inglés y chino, licencia MIT y, según una nota del propio mradermacher, podría tratarse de un modelo con capacidades de visión, si bien los ficheros mmproj se alojarían en el repositorio estático complementario. En el momento de la consulta, el repositorio registra 0 descargas y 0 likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta qwen3_5 sugiere base de la familia Qwen3.5) |
| Parametros totales | 8.953.803.264 |
| Parametros activos | no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | imatrix, i1-Q2_K, i1-IQ3_M, i1-Q4_K_S (publicadas); conjunto completo declarado: Q2_K, Q2_K_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ1_S, IQ1_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | MIT |
| Formato de pesos | GGUF (repo de cuantizaciones); el modelo base es de transformers/safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo. Las etiquetas del repositorio incluyen qwen3_5, agentic, coding, terminal-use, reasoning, merge y agsi, lo que apunta a un modelo resultante de una fusión (merge) de pesos construido sobre la familia Qwen3.5 y afinado o configurado para tareas agénticas, uso de terminal y razonamiento. No se especifica si emplea atención completa, atención lineal, mezcla de expertos (MoE) o alguna variante híbrida.

Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO u otro tipo de ajuste por preferencias. El repositorio de mradermacher es exclusivamente de cuantización: parte del modelo base OliviaRossi/MiMo-Negentropy-9B-AGSI y genera cuantizaciones con imatrix y con pesos ponderados (weighted quants), sin aportar información adicional sobre el entrenamiento original. Como innovación técnica reseñable en este repositorio, destaca el uso de una matriz de importancia (imatrix) para preservar la calidad en cuantizaciones agresivas de 2 a 4 bits.

## Capacidades

- Generación de texto y razonamiento, según las etiquetas reasoning y conversational.
- Generación de código y asistencia en tareas de programación (etiqueta coding).
- Uso de terminal y ejecución de comandos en entornos de línea de comandos (etiqueta terminal-use).
- Comportamiento agéntico y razonamiento multi-paso (etiquetas agentic y agsi).
- Soporte bilingüe inglés y chino.
- Posible soporte de visión, según la nota de mradermacher que indica que se trata de un modelo de visión y que los ficheros mmproj se alojarían en el repositorio estático. Este punto no está confirmado en el repositorio de cuantizaciones.
- Soporte de tool calling / function calling: no disponible (no se documenta explícitamente).
- Modo de pensamiento (thinking mode): no disponible.

## Casos de uso

- Asistente de terminal y automatización de operaciones: el modelo puede integrarse en flujos que interpreten lenguaje natural y generen comandos de shell, aprovechando la etiqueta terminal-use para tareas de administración de sistemas y scripting.
- Generación de código en pipelines de desarrollo: dado su enfoque en coding, encaja en asistentes de autocompletado, revisión de parches o generación de pruebas dentro de entornos CI/CD.
- Agentes autónomos multi-paso: sus etiquetas agentic y reasoning lo hacen adecuado para orquestar tareas que requieran planificación, uso de herramientas y ejecución secuencial de acciones.
- Despliegue local en hardware de consumo: al ofrecerse cuantizaciones de 3,9 a 5,5 GB, puede ejecutarse en equipos sin GPU dedicada de gama alta, lo que permite asistentes privados sin conexión.
- Asistencia bilingüe inglés-chino: útil para equipos o productos que atiendan a usuarios en ambos idiomas, con generación y comprensión en las dos lenguas declaradas.
- Prototipado rápido de aplicaciones de razonamiento: gracias a la licencia MIT y al formato GGUF, se puede integrar en demos y pruebas de concepto sin coste de licencia.
- Experimentación con cuantizaciones: el repositorio ofrece múltiples niveles de cuantización para estudiar el compromiso entre tamaño, velocidad y calidad en un modelo de 9B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16 (pesos originales, ~9B): en torno a 18 GB solo para pesos, por lo que requiere GPU de 24 GB o superior, como RTX 3090, RTX 4090, A100 40 GB o H100. Estimación aproximada a partir del número de parámetros.
- VRAM estimada con i1-Q4_K_S (5,5 GB): cabe en GPUs de 8 GB (RTX 3060 Ti, RTX 4060) dejando margen para la caché KV; con contexto largo puede necesitar 10-12 GB.
- VRAM estimada con i1-IQ3_M (4,5 GB) e i1-Q2_K (3,9 GB): aptas para GPUs de 6-8 GB e incluso para ejecución parcial en CPU con memoria del sistema.
- Ejecución en CPU: viable con llama.cpp u Ollama, especialmente en las cuantizaciones Q2 y Q3; el throughput dependerá fuertemente del número de núcleos y del ancho de banda de memoria.
- Opciones de despliegue: llama.cpp, Ollama, y otros runtimes compatibles con GGUF. No se documenta compatibilidad explícita con vLLM o TGI para los ficheros GGUF de este repositorio.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| MiMo-Negentropy-9B-AGSI (este) | ~9B | no disponible | MIT | GGUF (y safetensors en el base) | HuggingFace |
| Qwen3-8B | ~8B | no disponible en esta ficha | Apache 2.0 (segun informacion publica) | safetensors, GGUF | HuggingFace |
| Llama 3.1 8B | ~8B | no disponible en esta ficha | Llama Community License | safetensors, GGUF | HuggingFace |
| Gemma 2 9B | ~9B | no disponible en esta ficha | Gemma Terms of Use | safetensors, GGUF | HuggingFace |

Nota: los datos de contexto, licencia y rendimiento de los modelos comparados no forman parte de la informacion proporcionada en esta consulta, por lo que se marcan como no disponibles salvo donde se indique lo contrario. No se dispone de resultados de benchmarks que permitan una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. La model card no documenta sesgos específicos.
- Riesgo de alucinación: no cuantificado en la información disponible; como modelo generativo, es previsible que pueda producir contenido incorrecto, especialmente en las cuantizaciones más agresivas (IQ1, IQ2, Q2), donde la pérdida de calidad es mayor.
- Limitaciones de contexto e idioma: solo se declaran inglés y chino; el rendimiento en castellano u otros idiomas no está garantizado. La longitud de contexto no está documentada.
- Restricciones de licencia: licencia MIT, que permite uso comercial y modificación, siempre que se conserve el aviso de copyright y la licencia. Al derivar de un modelo base de terceros, conviene verificar la licencia del modelo original OliviaRossi/MiMo-Negentropy-9B-AGSI.
- Caveat de producción: el repositorio presenta 0 descargas y 0 likes, sin validación externa documentada; no se han publicado benchmarks ni evaluaciones que respalden las capacidades declaradas en las etiquetas.
- Cuantizaciones de baja precisión: el propio autor advierte que, en rangos de calidad baja, las cuantizaciones IQ suelen ser preferibles a las no-IQ del mismo tamaño; las variantes por debajo de Q4 pueden degradar notablemente el razonamiento y la generación de código.
- Naturaleza del repositorio: es un repositorio de cuantización, no el modelo original; para reproducir el comportamiento de referencia debe consultarse el modelo base.

## Enlaces

- Repositorio de cuantizaciones (este modelo): https://huggingface.co/mradermacher/MiMo-Negentropy-9B-AGSI-i1-GGUF
- Repositorio de cuantizaciones estáticas: https://huggingface.co/mradermacher/MiMo-Negentropy-9B-AGSI-GGUF
- Modelo base: https://huggingface.co/OliviaRossi/MiMo-Negentropy-9B-AGSI
- Página de resumen del autor para este modelo: https://hf.tst.eu/model#MiMo-Negentropy-9B-AGSI-i1-GGUF
- Preguntas frecuentes y solicitudes de modelos del autor: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9

Nota: los resultados de la búsqueda web proporcionados no contienen información relevante sobre este modelo; los enlaces encontrados corresponden a contenidos no relacionados.
