# mradermacher/gemma-4-26B-A4B-it-qat-q4_0-unquantized-heretic-ara-GGUF

## Resumen

El modelo `mradermacher/gemma-4-26B-A4B-it-qat-q4_0-unquantized-heretic-ara-GGUF` es una cuantización en formato GGUF realizada por el usuario mradermacher a partir de un modelo base denominado `mewse/gemma-4-26B-A4B-it-qat-q4_0-unquantized-heretic-ara`. Este modelo base pertenece a la familia Gemma 4 de Google, aunque no se dispone de documentación oficial en la información proporcionada. Su nombre indica una arquitectura Mixture of Experts (MoE) con 26 000 millones de parámetros totales y aproximadamente 4 000 millones de parámetros activos por token (A4B). La etiqueta `it` sugiere que está ajustado para instrucciones, `qat` indica entrenamiento consciente de cuantización y `heretic`/`ara` apuntan a una versión "uncensored" o "abliterated" (sin censura) del modelo. El repositorio contiene únicamente archivos GGUF en varias cuantizaciones, pensados para su ejecución en entornos locales con llama.cpp, Ollama u otros motores compatibles.

La relevancia de este modelo radica en que ofrece una alternativa de gran tamaño (26B totales) con una huella de memoria reducida gracias a la cuantización, y además en una variante sin censura, lo que puede interesar a desarrolladores que trabajan en generación de contenido creativo, investigación de sesgos o aplicaciones donde se requiera un comportamiento menos restringido. Sin embargo, al tratarse de una cuantización realizada por un tercero, no se dispone de información detallada sobre el entrenamiento, los datos utilizados o el rendimiento exacto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) según nomenclatura (26B totales, 4B activos) |
| Parámetros totales | 25 233 142 046 (según safetensors) |
| Parámetros activos | 4 000 millones (inferido del nombre, no confirmado oficialmente) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M (todos en GGUF) |
| Idiomas soportados | Inglés (según etiqueta `en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base, más allá de lo que sugiere el nombre: se trata de un transformer con arquitectura Mixture of Experts (MoE) con un total de 26 000 millones de parámetros, de los cuales se activan aproximadamente 4 000 millones por cada token (de ahí la notación A4B). El modelo ha sido ajustado para seguir instrucciones (`it`) y ha pasado por un entrenamiento consciente de cuantización (`qat`), lo que permite cuantizarlo a 4 bits sin una degradación excesiva del rendimiento. La versión `heretic`/`ara` es una adaptación que elimina las restricciones de contenido del modelo original (proceso conocido como "abliteration" o "decensoring"), aunque no se han publicado los detalles técnicos de este proceso.

El dataset de entrenamiento, el número de tokens, el método de alineación (RLHF, DPO, etc.) y cualquier innovación técnica adicional no están documentados en la información proporcionada. La cuantización GGUF ha sido realizada por mradermacher, quien indica que son "static quants" (cuantización estática) y que no ha utilizado imatrix ni cuantizaciones ponderadas.

## Capacidades

- Generación de texto y conversación multiturno en inglés.
- Seguimiento de instrucciones, dado su ajuste `it`.
- Capacidad de generar contenido sin filtros de censura (por su naturaleza "abliterated"), lo que puede incluir temas delicados o controvertidos.
- No se ha documentado soporte para tool calling, function calling, razonamiento multi-paso, visión u otras capacidades multimodales. La etiqueta `conversational` sugiere que está orientado a diálogo, pero sin confirmación técnica.

## Casos de uso

Al no existir documentación oficial de casos de uso específicos, se enumeran escenarios plausibles basados en las características generales de un modelo MoE de 26B con cuantización GGUF:

- **Generación de contenido creativo sin restricciones**: su naturaleza "uncensored" permite explorar narrativas, guiones o textos con temáticas adultas o sensibles, útil en investigación literaria o prototipos de escritura creativa.
- **Asistente de conversación en entornos de desarrollo**: puede integrarse en aplicaciones de chat locales mediante llama.cpp u Ollama, ofreciendo respuestas detalladas en inglés sin depender de servicios en la nube.
- **Prototipado de agentes conversacionales**: aunque no se confirma soporte para tool calling, se puede usar como base para sistemas de diálogo en entornos controlados donde no se requiera integración con APIs externas.
- **Investigación sobre sesgos y alineación**: al ser una versión "abliterated", permite estudiar el comportamiento del modelo sin filtros de seguridad, comparándolo con la versión original para analizar diferencias en respuestas.
- **Desarrollo de juegos de rol o escritura asistida**: su capacidad de generar texto fluido y su gran ventana de contexto (aunque no especificada) lo hacen adecuado para crear historias interactivas o personajes no jugadores en juegos.
- **Pruebas de rendimiento en hardware local**: los distintos quants (desde Q2_K hasta Q4_K_M) permiten evaluar la relación entre calidad y requisitos de memoria en diferentes GPUs, útil para optimizar despliegues.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se conocen puntuaciones de MMLU, HumanEval, GSM8K ni otras pruebas estándar para este modelo o su variante cuantizada. Tampoco se dispone de comparaciones con otros modelos de la misma familia.

## Requisitos de hardware

- **VRAM estimada**: según el tamaño de los archivos GGUF, se necesitan al menos 10-17 GB de memoria para cargar el modelo en memoria. El archivo Q4_K_M ocupa 16.9 GB, por lo que se requiere una GPU con al menos 20 GB de VRAM (considerando overhead) o una GPU de 24 GB como la RTX 3090 o RTX 4090 para ejecutar con suficiente espacio.
- **GPUs compatibles**: las cuantizaciones Q2_K y Q3_K_S (10.7 GB y 12.3 GB respectivamente) pueden caber en GPUs de 16 GB (por ejemplo, RTX 4080, RTX 3080 Ti) o incluso en 12 GB (RTX 3080) con cuantización adicional. Las versiones Q4_K_M y Q4_K_S (16.9 y 15.6 GB) requieren 24 GB para ejecutarse con comodidad.
- **Ejecución en CPU**: es posible ejecutar el modelo en CPU con suficiente RAM (al menos 32 GB) mediante llama.cpp u otros motores de inferencia, aunque con una latencia notablemente mayor.
- **Opciones de despliegue**: llama.cpp, Ollama, LM Studio, text-generation-webui (con backend llama.cpp), entre otros. No se menciona soporte para vLLM o TGI, ya que estos se centran en pesos safetensors.
- **Latencia y throughput**: no se dispone de datos medidos. Se estima que un modelo MoE de 4B activos puede generar tokens a una velocidad razonable en hardware moderno, pero no hay cifras concretas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables. El nombre sugiere que es una variante de Gemma 4, pero no hay datos sobre otros modelos de la misma familia (como Gemma 3 27B o versiones anteriores) para comparar parámetros, contexto o rendimiento. La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos específicos de la licencia de Gemma 4 de Google (enlace en la model card).

## Limitaciones y advertencias

- **Contenido sin censura**: al ser una versión "abliterated" (sin censura), el modelo puede generar contenido ofensivo, sexual, violento o ilegal. No es adecuado para aplicaciones donde se requiera un comportamiento seguro y moderado.
- **Calidad no verificada**: no hay benchmarks ni evaluaciones públicas que respalden su calidad, por lo que el rendimiento real puede variar y no se puede comparar con otras versiones.
- **Idioma limitado**: solo se indica inglés como idioma soportado. No se garantiza un buen rendimiento en otros idiomas, incluido el español.
- **Longitud de contexto desconocida**: no se ha publicado la ventana de contexto, lo que afecta a la planificación de tareas que requieran contextos largos.
- **Riesgo de alucinaciones**: como cualquier modelo de lenguaje, puede generar información falsa o inexacta, especialmente al ser una versión sin restricciones.
- **Licencia**: aunque la licencia es Apache 2.0, la licencia de Google para Gemma 4 (enlace en la model card) puede incluir cláusulas adicionales. Se recomienda revisar esas condiciones antes de un uso comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mradermacher/gemma-4-26B-A4B-it-qat-q4_0-unquantized-heretic-ara-GGUF
- Modelo base (mewse): https://huggingface.co/mewse/gemma-4-26B-A4B-it-qat-q4_0-unquantized-heretic-ara
- Licencia Gemma de Google: https://ai.google.dev/gemma/docs/gemma_4_license
- Página de ayuda de cuantizaciones (gráfico comparativo): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Artículo sobre cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
