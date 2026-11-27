# mradermacher/Luminescent-Void-31B-i1-GGUF

## Resumen

Luminescent-Void-31B-i1-GGUF es una colección de cuantizaciones GGUF, generadas con imatrix y en formato i1, del modelo de fusión Cyclone-Labs/Luminescent-Void-31B. El trabajo de cuantización lo firma mradermacher, un publicador habitual de cuantizaciones GGUF en Hugging Face, y el modelo base procede de Cyclone-Labs, un laboratorio que produce merges orientados a rol y narrativa. El repositorio no contiene pesos originales en safetensors, sino únicamente ficheros GGUF listos para su uso con llama.cpp y derivados.

El modelo resuelve el problema de ejecutar un modelo de aproximadamente 30.700 millones de parámetros en hardware de consumo o en entornos con VRAM limitada, ofreciendo un abanico de cuantizaciones que va desde los 7,3 GB del i1-IQ1_S hasta los 25,3 GB del i1-Q6_K. Está etiquetado como modelo de rol, narrativa y contenido para adultos, con soporte únicamente en inglés, y se distribuye bajo licencia Apache 2.0.

Su relevancia actual es doble: por un lado, permite probar localmente un modelo de 31B de la familia de merges creativos sin necesidad de GPUs de datacenter; por otro, la model card advierte de que se trata de un modelo de visión, con ficheros mmproj alojados en el repositorio estático del mismo autor, lo que amplía su utilidad más allá del texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo de fusión mediante mergekit); detalles de capas y atención no disponibles |
| Parametros totales | 30.697.345.596 (aproximadamente 30,7B) |
| Parametros activos | No aplica (no es MoE según la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-IQ3_S, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K; además fichero imatrix |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); safetensors del modelo base no incluidos en este repositorio |

## Arquitectura y entrenamiento

El modelo base Cyclone-Labs/Luminescent-Void-31B es un merge construido con mergekit, según las etiquetas del repositorio y la model card. No se dispone de información sobre la composición exacta del merge, los modelos de origen, el número de tokens de entrenamiento ni si hubo fases de RLHF o DPO. El tamaño de 30,7B parámetros sugiere una arquitectura transformer densa de escala 30B, pero no se confirman detalles de número de capas, dimensión oculta ni mecanismo de atención.

La aportación técnica de este repositorio es la cuantización: se han generado cuantizaciones i1 con fichero imatrix, un método que calibra la cuantización con estadísticas de activaciones para mejorar la calidad en bits bajos. La model card incluye una tabla con tamaños por cuantización y notas de calidad, y remite a gráficas externas de perplejidad para comparar tipos de cuantización. También se indica que el modelo es de visión y que los ficheros mmproj, si existen, están en el repositorio estático del mismo autor.

## Capacidades

- Generación de texto conversacional y narrativo, con orientación explícita a rol y storytelling según las etiquetas del repositorio.
- Capacidad de visión: la model card indica que es un modelo de visión y que los ficheros mmproj se alojan en el repositorio estático; no se detallan tareas concretas de visión.
- Contenido para adultos (etiqueta nsfw y not-for-all-audiences), orientado a narrativa y rol sin filtros aparentes.
- Soporte multilingüe limitado al inglés.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documenta modo thinking, audio ni otras capacidades especiales.

## Casos de uso

- Roleplay y narrativa interactiva local: el modelo está etiquetado específicamente para rol y storytelling, y las cuantizaciones de 17-22 GB permiten ejecutarlo en una GPU de consumo con 24 GB de VRAM, manteniendo conversaciones multi-turno con personajes.
- Escritura creativa asistida: generación de ficción, diálogos y tramas en inglés, usando cuantizaciones Q4_K_M o Q5_K_M para equilibrar calidad y velocidad en estaciones de trabajo con una sola GPU.
- Prototipado de chatbots de personaje: integración en llama.cpp u Ollama para probar sistemas de rol con contexto conversacional antes de invertir en infraestructura mayor.
- Experimentación con cuantizaciones: el repositorio incluye un fichero imatrix y una amplia gama de tipos de cuantización, lo que permite comparar calidad y perplejidad entre IQ1, IQ2, IQ3, IQ4, Q4, Q5 y Q6 en el mismo modelo.
- Evaluación de merges comunitarios: útil para investigadores que quieran medir el comportamiento de un merge de 31B orientado a creatividad frente a modelos base, sin necesidad de descargar los safetensors originales.
- Despliegue en entornos con VRAM ajustada: las cuantizaciones IQ2 e IQ3 (8,8-14,5 GB) permiten ejecutar el modelo en GPUs de 12-16 GB, aunque con pérdida de calidad documentada por el autor.
- Procesamiento de imágenes en local: si se descargan los ficheros mmproj del repositorio estático, el modelo puede emplearse para tareas que combinen imagen y texto, aunque no se detallan las capacidades concretas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 7,3 GB (i1-IQ1_S) y 25,3 GB (i1-Q6_K), según el fichero GGUF elegido. El fichero imatrix ocupa 0,1 GB y no es un peso ejecutable.
- Cuantizaciones recomendadas por el autor: i1-Q4_K_M (18,8 GB) como "fast, recommended"; i1-Q4_K_S (17,9 GB) como "optimal size/speed/quality"; i1-Q6_K (25,3 GB) como "practically like static Q6_K".
- GPU recomendadas: no disponibles de forma explícita. Por tamaño, una RTX 4090 (24 GB) puede alojar hasta i1-Q5_K_M (21,9 GB) o i1-Q6_K (25,3 GB) con offloading parcial; una RTX 3090 (24 GB) queda en el mismo rango. Para i1-Q6_K completo se recomienda una GPU de 32 GB o superior (A100 40 GB, H100, RTX A6000).
- Cabe en GPU de consumo: sí, en tarjetas de 12-16 GB con cuantizaciones IQ2/IQ3, y en tarjetas de 24 GB con cuantizaciones Q4/Q5.
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio, koboldcpp) por el formato GGUF; también es posible usar servidores compatibles con endpoints si se sirve mediante llama.cpp. No se documenta soporte nativo en vLLM o TGI para este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Luminescent-Void-31B-i1-GGUF | 30,7B | No disponible | Apache 2.0 | GGUF (i1, imatrix) | Merge orientado a rol, narrativa y NSFW; solo inglés; incluye visión vía mmproj en repo estático |
| Luminescent-Void-31B-GGUF (mradermacher) | 30,7B | No disponible | Apache 2.0 | GGUF estático | Mismo modelo base, cuantizaciones estáticas en lugar de i1 |
| Cyclone-Labs/Luminescent-Void-31B | 30,7B | No disponible | Apache 2.0 | Safetensors (presumiblemente) | Modelo base del merge, sin cuantizar |

No se dispone de datos de benchmarks para comparar rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al ser un merge orientado a rol y NSFW, puede reproducir estereotipos y contenido sensible sin filtros.
- Riesgo de alucinación: no evaluado; los merges creativos suelen priorizar estilo sobre precisión factual.
- Limitaciones de contexto e idioma: solo se declara inglés; la longitud de contexto no está disponible, lo que impide garantizar conversaciones largas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el contenido NSFW y las políticas de las plataformas de despliegue pueden limitar su uso en productos públicos.
- El repositorio contiene únicamente GGUF; no incluye safetensors ni tokenizador original, por lo que la reproducibilidad depende del modelo base.
- Las cuantizaciones IQ1 e IQ2 están marcadas por el autor como de baja calidad ("for the desperate", "mostly desperate", "very low quality"); no son adecuadas para producción.
- El modelo está etiquetado como not-for-all-audiences; debe revisarse el contenido antes de exponerlo a usuarios finales.
- No hay garantías de soporte en vLLM o TGI; el despliegue recomendado es llama.cpp.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Luminescent-Void-31B-i1-GGUF
- Modelo base: https://huggingface.co/Cyclone-Labs/Luminescent-Void-31B
- Cuantizaciones estáticas del mismo autor: https://huggingface.co/mradermacher/Luminescent-Void-31B-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Luminescent-Void-31B-i1-GGUF
- Ejemplo de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfica de perplejidad por tipo de cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de modelos: https://huggingface.co/mradermacher/model_requests
- Empresa del autor: https://www.nethype.de/
