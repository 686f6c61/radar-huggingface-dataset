# mradermacher/Salience-27B-R6-GGUF

## Resumen

Salience-27B-R6-GGUF es la versión cuantizada en formato GGUF del modelo vectionlabs/Salience-27B-R6, publicada por el usuario mradermacher (nethype GmbH). No se trata de un modelo entrenado desde cero, sino de una conversión a GGUF pensada para ejecución local con llama.cpp y derivados, con el objetivo de reducir el peso del modelo original (aproximadamente 27.320 millones de parámetros) hasta archivos manejables en hardware de consumo.

Según las etiquetas de la model card, el modelo base es multimodal (vision-language), con soporte de razonamiento con modo "thinking", generación de código orientada a ingeniería de software (SWE, terminal, agentes), tool calling y function calling, ventana de contexto larga, predicción multi-token (MTP) y decodificación especulativa. La etiqueta "uncensored" indica que el ajuste no aplica un filtrado restrictivo de contenido. Incluye además el marcador "qwen3.8", que apunta a un linaje basado en la familia Qwen3, aunque la model card no detalla la arquitectura de forma explícita.

En el momento de la captura, el repositorio presenta cero descargas y cero "likes", y la model card no incluye resultados de evaluación, detalles del dataset de entrenamiento ni especificación de la longitud de contexto. Su relevancia es por tanto la de un artefacto de cuantización temprano: permite evaluar el modelo base en local antes de que existan versiones optimizadas (imatrix o ponderadas) o despliegues en servidores de inferencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta "qwen3.8" sugiere linaje Qwen3; la model card no la describe) |
| Parámetros totales | 27.320.697.856 (unos 27,3 mil millones, dato real de safetensors del modelo base) |
| Longitud de contexto | no disponible (la etiqueta "long-context" no se cuantifica en la información aportada) |
| Tipos de cuantización | Anunciados: x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS. Publicados en la tabla de archivos: Q2_K (11,0 GB) y Q4_K_S (15,9 GB), más los proyectores multimodales mmproj-Q8_0 (0,7 GB) y mmproj-f16 (1,0 GB) |
| Idiomas soportados | inglés (etiqueta "en"); no se documentan otros idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el repositorio original se distribuye presumiblemente en safetensors; no se confirma en la información disponible) |
| Tamaño del repositorio | 28,2 GB |
| Modalidad | multimodal texto-imagen (archivos mmproj incluidos) |
| Fecha de publicación | 10 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base. Las etiquetas de la model card indican que es multimodal (vision-language), que emplea predicción multi-token (MTP según la etiqueta "mtp") y que está preparado para decodificación especulativa ("speculative-decoding"), lo que implica la existencia de un mecanismo de propuesta de tokens adicional al decodificador principal. La etiqueta "qwen3.8" sugiere una base derivada de la familia Qwen3, pero no hay confirmación explícita de la arquitectura (transformer denso, MoE u otra), del número de capas, de las dimensiones ocultas ni de la configuración de atención.

Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF, DPO u otras técnicas de alineamiento. Las etiquetas "reasoning", "thinking" y "efficient-reasoning" apuntan a un ajuste orientado a cadenas de razonamiento con control de eficiencia (modo de pensamiento acotado), y "uncensored" indica ausencia de filtrado de contenido en el ajuste. Cualquier afirmación adicional sobre el proceso de entrenamiento sería especulativa y no se recoge aquí.

El repositorio en sí es una conversión estática a GGUF (sin cuantizaciones ponderadas ni con matriz de importancia en el momento de la captura, según la propia model card), con conversión de tipo "hf" y tensor quantised activado, y sin omisión del proyector multimodal.

## Capacidades

- Generación de texto conversacional multi-turno, con pipeline etiquetado como "conversational".
- Razonamiento explícito con modo de pensamiento ("thinking") y variante orientada a eficiencia ("efficient-reasoning", "thinking-efficiency").
- Generación y edición de código, con etiquetas específicas de ingeniería de software (SWE), uso de terminal y flujos agénticos.
- Soporte de tool calling y function calling según las etiquetas del repositorio.
- Capacidades agénticas y de razonamiento multi-paso (etiquetas "agentic" y "terminal").
- Comprensión de imágenes: la presencia de archivos mmproj-Q8_0 y mmproj-f16 confirma soporte de entrada visual en llama.cpp.
- Ventana de contexto larga (etiqueta "long-context"), sin cifra publicada.
- Predicción multi-token y decodificación especulativa (etiquetas "mtp" y "speculative-decoding").
- Ajuste sin censura declarada ("uncensored").
- Multilingüismo: limitado al inglés según la etiqueta de idioma.

## Casos de uso

- Asistencia de código en local: con 27,3 mil millones de parámetros y cuantización Q4_K_S (15,9 GB), el modelo puede ejecutarse en una estación de trabajo con GPU de 24 GB y usarse como asistente de programación sin enviar código a servicios externos, algo crítico en entornos con requisitos de confidencialidad.
- Agentes de terminal y automatización de tareas de sistema: las etiquetas "terminal" y "agentic" sugieren que el modelo está ajustado para emitir comandos de shell y encadenar pasos; encaja en pipelines de operaciones donde un agente debe inspeccionar un repositorio, ejecutar pruebas y aplicar parches.
- Automatización de ingeniería de software (SWE): resolución de incidencias sobre bases de código existentes, generación de parches y revisiones de código, apoyándose en el soporte de tool calling para invocar linters, compiladores o suites de test.
- Análisis de documentación técnica con imágenes: gracias a los proyectores mmproj, puede procesar capturas de pantalla, diagramas de arquitectura, gráficas de monitorización o fotos de pizarras junto con texto, útil en asistencia técnica y soporte interno.
- Conversaciones de atención al cliente o soporte técnico de larga duración: la etiqueta de contexto largo permite mantener historiales extensos sin truncar, aunque la longitud exacta no está documentada y debe verificarse empíricamente antes de comprometerse a un SLA.
- Procesamiento de documentos extensos en local: resumen, extracción de entidades y preguntas y respuestas sobre manuales o informes largos, siempre que se valide el límite real de contexto con la cuantización elegida.
- Generación de contenido sin filtros editoriales: la etiqueta "uncensored" lo hace adecuado para escritura creativa o investigación sobre sesgos y seguridad, donde se necesita un modelo que no rechace sistemáticamente determinadas peticiones; requiere supervisión humana y revisión legal.
- Evaluación e investigación de cuantizaciones: al ser un artefacto GGUF de un modelo poco publicado, sirve para medir la degradación de calidad entre Q2_K, Q4_K_S y la versión f16/x-f16, y para probar decodificación especulativa con MTP en llama.cpp.
- Despliegue de inferencia en el borde o en estaciones sin conexión: entornos aislados (defensa, industria, sanidad) donde no se permite tráfico hacia APIs externas y se dispone de una única GPU de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio de cuantización no incluye tablas de MMLU, HumanEval, GSM8K, SWE-bench ni de ninguna otra evaluación, y los resultados de la búsqueda web no aportan datos técnicos sobre el modelo (los enlaces devueltos no guardan relación con el tema).

## Requisitos de hardware

- VRAM estimada (inferencia, solo pesos): Q2_K en torno a 11 GB; Q4_K_S en torno a 15,9 GB. Añadir aproximadamente 0,7-1,0 GB si se utiliza el proyector multimodal, más el espacio de caché KV, que crece con la longitud de contexto y depende de la arquitectura.
- VRAM práctica orientativa: Q4_K_S con contexto moderado en una GPU de 24 GB (RTX 4090, RTX 3090, A10G 24 GB, L4 24 GB) con margen razonable; Q2_K en GPU de 12-16 GB, con pérdida de calidad notable por el bajo número de bits.
- Cuantizaciones no publicadas: Q8_0 y x-f16 del modelo completo (en torno a 27-29 GB) requerirían GPU de 40-80 GB (A100 40/80 GB, H100) o reparto entre varias GPU. En el momento de la captura no aparecen en la tabla de archivos del repositorio.
- Inferencia en CPU: viable con llama.cpp y Q2_K o Q4_K_S si se dispone de 16-32 GB de RAM; el rendimiento será de pocos tokens por segundo en CPUs de escritorio convencionales.
- Opciones de despliegue: llama.cpp (con soporte multimodal mediante mmproj), Ollama, LM Studio, KoboldCpp, llama-cpp-python y servidores compatibles con GGUF (el tag "endpoints_compatible" indica compatibilidad con endpoints alojados). vLLM y TGI tienen soporte de GGUF limitado o experimental, por lo que conviene verificar la versión antes de usarlos.
- Latencia y throughput: no disponibles. No se documentan mediciones de tokens por segundo ni de latencia de primer token para ninguna cuantización ni plataforma.

## Comparativa con modelos similares

No hay datos de rendimiento verificables para Salience-27B-R6, por lo que la comparación se limita a especificaciones estructurales. Los valores de los modelos alternativos proceden de su documentación pública y no de la información proporcionada en esta ficha; deben verificarse antes de tomar decisiones.

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Salience-27B-R6 (GGUF) | 27,3 mil millones | no disponible (etiqueta "long-context") | Sí (mmproj) | Apache 2.0 | GGUF en este repositorio; base en vectionlabs/Salience-27B-R6 |
| Qwen3-32B | 32,8 mil millones | 32.768 nativo, ampliable con YaRN | No (variante de texto) | Apache 2.0 | safetensors y múltiples cuantizaciones GGUF |
| Gemma 3 27B | 27 mil millones | 128.000 | Sí | Términos de uso de Gemma | safetensors y cuantizaciones GGUF |
| Mistral Small 3.1 24B | 24 mil millones | 128.000 | Sí | Apache 2.0 | safetensors y cuantizaciones GGUF |

Diferencias relevantes: Salience declara tool calling, uso de terminal, modo de razonamiento y decodificación especulativa, además de un ajuste sin censura, combinaciones que no están documentadas de forma equivalente en los modelos de la tabla. Frente a ellos, su desventaja principal es la falta de evaluaciones publicadas, de contexto cuantificado y de un ecosistema de despliegue probado.

## Limitaciones y advertencias

- Ausencia total de datos de evaluación: no hay benchmarks, ni comparativas con el modelo original en f16, ni curvas de degradación por cuantización. Cualquier uso en producción debería ir precedido de una evaluación propia.
- Idiomas: únicamente inglés según la etiqueta de idioma. El rendimiento en castellano es desconocido y probablemente degradado.
- Contexto no especificado: aunque se anuncia "long-context", no se indica el número de tokens soportado ni si la cuantización lo altera. Verificar empíricamente antes de diseñar flujos con documentos largos.
- Riesgo de alucinación: inherente a los modelos de 27B, y no hay información sobre mitigaciones específicas. Especialmente relevante en generación de código y en uso agéntico con acceso a terminal, donde un comando incorrecto puede causar daños reales.
- Modo "uncensored": el ajuste no aplica filtrado de contenido, lo que implica riesgo de generar material inapropiado, ofensivo o potencialmente ilegal. Requiere moderación propia en cualquier producto orientado a usuarios finales.
- Riesgo de seguridad en uso agéntico: el soporte declarado de tool calling y ejecución de comandos exige sandboxing, listas blancas de herramientas y confirmación humana en operaciones destructivas.
- Estado del repositorio: cero descargas y cero "likes" en el momento de la captura. Es un artefacto reciente y sin validación por parte de la comunidad; no hay evidencia de que la conversión sea correcta más allá de la declaración del autor.
- Cuantizaciones incompletas: no había cuantizaciones ponderadas ni con matriz de importancia, y solo dos cuantizaciones publicadas (Q2_K y Q4_K_S). Las cuantizaciones de 2 bits suelen producir degradaciones severas en razonamiento y código.
- Licencia: Apache 2.0 permite uso comercial, pero la licencia del modelo base y de sus posibles componentes derivados debe comprobarse en el repositorio de vectionlabs; la etiqueta del repositorio de cuantización no constituye una garantía jurídica sobre el conjunto.
- Trazabilidad limitada: la model card reproduce únicamente metadatos de cuantización. No hay información sobre sesgos, procedencia de los datos ni consideraciones éticas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Salience-27B-R6-GGUF
- Modelo base: https://huggingface.co/vectionlabs/Salience-27B-R6
- Página de descargas del cuantizador para este modelo: https://hf.tst.eu/model#Salience-27B-R6-GGUF
- Guía de uso de GGUF citada por el autor: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfica comparativa de tipos de cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Los resultados de la búsqueda web no contenían enlaces relevantes sobre este modelo: las URLs devueltas trataban sobre medallas satíricas de Napoleón III y no guardan relación con el ámbito de esta ficha.
