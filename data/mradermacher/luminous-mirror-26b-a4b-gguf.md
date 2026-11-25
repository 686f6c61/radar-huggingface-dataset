# mradermacher/Luminous-Mirror-26B-A4B-GGUF

## Resumen

Luminous-Mirror-26B-A4B-GGUF es la versión cuantizada en formato GGUF del modelo Vortex5/Luminous-Mirror-26B-A4B, un merge de modelos creado con mergekit y orientado a roleplay y narrativa (storytelling). El autor de la cuantización es mradermacher, un conocido publicador de cuantizaciones GGUF para la comunidad de inferencia local. El modelo base declara 25.233.142.046 parámetros totales (aproximadamente 25,2 mil millones), lo que coincide con la nomenclatura "26B" del nombre.

La relevancia de esta ficha radica en que ofrece el modelo en múltiples niveles de cuantización (desde Q2_K hasta Q8_0, más variantes IQ4_XS y suplementos multimodales mmproj), lo que permite ejecutarlo en hardware de consumo con pérdidas de calidad controladas. Está publicado bajo licencia Apache 2.0, lo que facilita su uso comercial sin restricciones adicionales, y está etiquetado exclusivamente para inglés.

No se dispone de información sobre la longitud de contexto, la arquitectura interna del modelo base ni los datos de entrenamiento en la documentación proporcionada. La model card del cuantizador se limita a listar los ficheros generados y a remitir al modelo original para más detalles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base creado con mergekit; arquitectura interna no especificada) |
| Parametros totales | 25.233.142.046 (aprox. 25,2 B) |
| Parametros activos | no disponible (la nomenclatura A4B sugiere un esquema de mezcla de expertos con ~4 B activos, pero no se confirma en la documentación) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; suplementos mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base Vortex5/Luminous-Mirror-26B-A4B es un merge construido con mergekit, según las etiquetas de la model card. No se proporciona información sobre la arquitectura subyacente (transformer denso, MoE, híbrido), el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO. La etiqueta "A4B" en el nombre sugiere un diseño de mezcla de expertos con aproximadamente 4 mil millones de parámetros activos, pero este dato no se confirma explícitamente en la documentación disponible.

La contribución técnica de esta ficha concreta es la cuantización: mradermacher ha generado cuantizaciones estáticas (no imatrix) en el rango Q2_K a Q8_0, además de suplementos multimodales mmproj en Q8_0 y f16. También existe una versión con cuantizaciones ponderadas/imatrix en el repositorio mradermacher/Luminous-Mirror-26B-A4B-i1-GGUF, que el autor recomienda para mayor calidad a igual tamaño. No se documentan innovaciones arquitectónicas adicionales.

## Capacidades

- Generación de texto conversacional y narrativo, con especial orientación a roleplay y storytelling según las etiquetas del modelo.
- Soporte multimodal: la presencia de ficheros mmproj indica capacidad de procesamiento de imágenes en el modelo base, aunque no se detalla el alcance.
- Conversación multi-turno (etiqueta "conversational").
- No se documenta soporte explícito de tool calling, function calling ni razonamiento agéntico multi-paso.
- Capacidades multilingües limitadas al inglés según la model card.
- No se documenta modo de razonamiento (thinking mode), audio ni otras capacidades especiales.

## Casos de uso

- Roleplay y ficción interactiva: el modelo está etiquetado específicamente para roleplay, por lo que puede emplearse en aplicaciones de personajes conversacionales y narrativa ramificada donde se requiere mantener consistencia de voz y estilo a lo largo de turnos.
- Escritura creativa asistida: generación de relatos, diálogos y descripciones con cuantizaciones Q5_K_M o Q6_K para preservar matices estilísticos, desplegadas en local con llama.cpp.
- Prototipado de chatbots de entretenimiento: gracias a la licencia Apache 2.0 y a las cuantizaciones Q4_K_M (16,9 GB), puede integrarse en servicios comerciales de ocio sin obligaciones de atribución adicionales.
- Inferencia local en estaciones de trabajo: con Q4_K_S (15,6 GB) o IQ4_XS (14,2 GB) cabe en GPUs de consumo de 16-24 GB, lo que permite experimentar sin infraestructura cloud.
- Evaluación comparativa de merges: investigadores que estudian el efecto de fusiones de modelos pueden usar esta versión cuantizada para pruebas rápidas de calidad narrativa frente al modelo base en safetensors.
- Despliegue con capacidades de visión: los suplementos mmproj-Q8_0 (0,9 GB) y mmproj-f16 (1,3 GB) permiten añadir procesamiento de imágenes en entornos llama.cpp, útil para aplicaciones narrativas que incorporan referencias visuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamaño del fichero GGUF más el contexto y el overhead de la KV cache. Orientativamente: Q2_K ~10,7 GB, Q3_K_M ~13,4 GB, IQ4_XS ~14,2 GB, Q4_K_M ~16,9 GB, Q5_K_M ~19,2 GB, Q6_K ~22,7 GB, Q8_0 ~27,0 GB.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M con contexto moderado; RTX 3090/4080 (16-24 GB) para Q4_K_S e IQ4_XS; A100 40 GB o H100 para Q8_0 con contexto largo.
- Cabe en GPU de consumo: sí, en tarjetas de 16 GB o más con cuantizaciones Q4 o inferiores; en 12 GB solo con Q2_K o Q3_K_S y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; los suplementos mmproj requieren soporte multimodal de llama.cpp.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Luminous-Mirror-26B-A4B-GGUF | ~25,2 B | no disponible | Apache 2.0 | GGUF | Merge orientado a roleplay; cuantizaciones estáticas |
| Luminous-Mirror-26B-A4B (base) | ~25,2 B | no disponible | Apache 2.0 | safetensors | Modelo original sin cuantizar |
| Luminous-Mirror-26B-A4B-i1-GGUF | ~25,2 B | no disponible | Apache 2.0 | GGUF | Cuantizaciones imatrix del mismo autor, mayor calidad a igual tamaño |

No se dispone de información suficiente para comparar con modelos de la misma categoría (roleplay/storytelling de ~25 B) en parámetros, contexto o rendimiento; los datos de benchmarks no están publicados.

## Limitaciones y advertencias

- Idiomas: solo inglés declarado; el rendimiento en castellano no está garantizado ni documentado.
- Alucinación: al ser un merge orientado a narrativa, no se han publicado evaluaciones de fidelidad factual; en usos informativos puede generar contenido inventado.
- Contexto: se desconoce la longitud máxima de contexto, lo que impide planificar despliegues con ventanas largas sin pruebas previas.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base es un merge cuyos componentes originales no se detallan en la documentación; conviene verificar las licencias de los modelos fusionados antes de un despliegue comercial.
- Calidad de cuantización: las cuantizaciones Q2_K y Q3_K_S degradan notablemente la calidad; el autor recomienda Q4_K_S o Q4_K_M para uso general y Q5_K_M o superiores para preservar matices narrativos.
- Multimodalidad: la capacidad de visión depende de los ficheros mmproj y del soporte del runtime; no se especifica qué tareas visuales están cubiertas.
- Producción: sin benchmarks ni datos de contexto, no se recomienda su uso en sistemas críticos sin una evaluación propia previa.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Luminous-Mirror-26B-A4B-GGUF
- Modelo base: https://huggingface.co/Vortex5/Luminous-Mirror-26B-A4B
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Luminous-Mirror-26B-A4B-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Luminous-Mirror-26B-A4B-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico de calidad de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos: https://huggingface.co/mradermacher/model_requests
