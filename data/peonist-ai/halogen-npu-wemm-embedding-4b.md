# peonist-ai/halogen-npu-wemm-embedding-4b

## Resumen

halogen-npu-wemm-embedding-4b es una conversión del modelo de embeddings multimodal tencent/WeMM-Embedding-4B (revisión `41a4fafdd26252ddff05c025413af7e61e26f08e`) para ejecutarse en la NPU XDNA2 de los procesadores AMD Strix Halo (familia Ryzen AI Max) dentro del contenedor halogen-flash-server. No es un modelo nuevo ni un reentrenamiento: el autor, peonist-ai, ha reempaquetado los pesos del modelo base en el formato propietario `.hnpw`, ha compilado el encoder de imagen como programa de NPU y ha ajustado el tokenizador para que el servidor pueda servirlos por su endpoint `/v1/embeddings`.

El modelo resuelve un problema muy concreto: obtener embeddings de texto e imagen en un espacio vectorial compartido sin ocupar la GPU, que queda libre para un modelo generativo (el "Flash model" del mismo servidor). Con 4B parámetros declarados y un encoder de imagen propio, produce vectores de 2.560 dimensiones para textos de hasta 4.096 tokens e imágenes de hasta 768 x 768 píxeles, con recortes a múltiplos de 32 píxeles por lado.

Su relevancia es de nicho pero clara: es una de las pocas piezas publicadas que llevan un modelo de embeddings multimodal de 4B a la NPU integrada de Strix Halo con una API compatible con OpenAI. La contrapartida es que los ficheros solo cargan dentro de halogen-flash-server 0.18.12 o superior; no funcionan en transformers, vLLM, llama.cpp ni Ollama, y el propio autor desactiva el widget de inferencia del Hub por ese motivo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de embeddings multimodal: encoder de texto derivado de Qwen3.5-4B más encoder de imagen propio, ambos convertidos a programas y pesos de NPU |
| Parámetros totales | 4B (según el nombre del modelo y el modelo base); desglose exacto por componente no disponible |
| Parámetros activos | No aplica: no se describe como MoE en la información disponible |
| Longitud de contexto | 4.096 tokens de texto; imágenes de hasta 768 x 768 píxeles de entrada |
| Dimensión de embedding | 2.560 (reducible mediante el parámetro `dimensions` de la petición) |
| Tipos de cuantización | No disponible: los pesos se convierten a formato NPU `.hnpw`, pero no se documenta el esquema numérico ni los bits por peso |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (heredada del modelo fuente, fichero `LICENSE` sin modificar) |
| Formato de pesos | `.hnpw` para NPU (5,69 GB) + `vis/` con programa y pesos del encoder de imagen (404 MB) + `tokenizer/` (20 MB); incompatible con safetensors y GGUF |
| Tamaño del repositorio | 6,1 GB |
| Runtime requerido | halogen-flash-server 0.18.12 o superior (versiones desde 0.18.3 descargan la revisión con la que se publicaron) |

## Arquitectura y entrenamiento

La información disponible no describe el entrenamiento del modelo base: no se indica número de tokens, composición del dataset, ni si hubo RLHF, DPO u otra fase de alineación. Lo que sí se documenta es la ascendencia: WeMM-Embedding-4B se construye sobre Qwen3.5-4B (Copyright 2026 Alibaba Cloud, Apache-2.0) y añade un encoder de imagen que proyecta ambas modalidades a un único espacio vectorial, de modo que una consulta de texto puede recuperar imágenes y viceversa, e incluso mezclar ambos tipos en una misma petición.

El trabajo de conversión consiste en tres piezas. La primera es `wemm-embedding-4b.hnpw`, los pesos del modelo de texto reescritos para la NPU. La segunda es `vis/`, que contiene el programa de NPU y los pesos del encoder de imagen, con sus avisos de terceros en `vis/NOTICE.md`. La tercera es el tokenizador. El texto reutiliza el programa de NPU de halogen-npu-decider-4b, por lo que el servidor descarga también el directorio `devices/` de ese repositorio; un host que sirva ambos modelos lo descarga una sola vez. El servidor verifica tamaño y checksum de cada fichero antes de arrancar. No se documenta ninguna innovación de decodificación (no aplica: es un modelo de embeddings, no generativo) ni detalles sobre atención lineal o esquemas de atención alternativos.

## Capacidades

- Generación de embeddings de texto de 2.560 dimensiones para secuencias de hasta 4.096 tokens.
- Generación de embeddings de imagen con entrada de hasta 768 x 768 píxeles; las imágenes mayores se reescalan manteniendo la relación de aspecto y cada lado se ajusta a un múltiplo de 32 píxeles.
- Espacio vectorial compartido entre texto e imagen: similitud texto-imagen, imagen-texto e imagen-imagen con la misma métrica.
- Peticiones mixtas: una sola llamada puede contener elementos de texto e imagen y devuelve un vector por elemento.
- Reducción de dimensionalidad bajo demanda mediante el parámetro `dimensions`, útil para índices que priorizan coste de almacenamiento sobre fidelidad.
- Formatos de imagen aceptados: PNG, JPEG, WebP, GIF y BMP, siempre en línea como data URL base64; el servidor no descarga URLs.
- Optimización interna: las imágenes con área igual o inferior a 512 x 512 píxeles se procesan con el programa pequeño del encoder.
- API compatible con la forma de petición de OpenAI en `/v1/embeddings`, lo que facilita su uso desde clientes y orquestadores existentes.
- No soporta generación de texto, tool calling, agentes, razonamiento multi-paso ni modo thinking: es exclusivamente un modelo de extracción de características.

## Casos de uso

- Búsqueda semántica sobre documentación técnica: indexar manuales y ADRs con vectores de 2.560 dimensiones y recuperar por similitud coseno; los 4.096 tokens de contexto permiten indexar secciones completas sin trocear en exceso.
- Recuperación multimodal en catálogos de producto: indexar las fichas de texto y las fotos en el mismo espacio vectorial y resolver con una sola consulta tanto "buscar productos parecidos a esta imagen" como "buscar productos que encajen con esta descripción".
- RAG sobre corpus heterogéneo: usar el endpoint compatible con OpenAI para integrar el modelo en LlamaIndex o LangChain y alimentar un LLM generativo que corra en la GPU del mismo host, dejando la NPU para la fase de embeddings.
- Deduplicación y agrupación de contenidos: calcular embeddings de un archivo de tickets, correos o artículos y aplicar clustering o umbrales de similitud para detectar duplicados y near-duplicates antes de publicar.
- Búsqueda inversa en archivos fotográficos o de diseño: dado un asset gráfico, recuperar las imágenes visualmente próximas y las descripciones textuales asociadas, con el encoder aceptando PNG, JPEG, WebP, GIF y BMP en la misma petición.
- Clasificación zero-shot por prototipos: construir un vector medio por categoría a partir de descripciones textuales y asignar etiquetas a textos o imágenes nuevas comparando distancias, sin entrenar un clasificador adicional.
- Estación de trabajo local con aceleración heterogénea: desplegar halogen-flash-server en un equipo Strix Halo para servir un modelo generativo en la GPU y los embeddings en la NPU tras el mismo puerto, evitando mover datos a la nube.
- Filtrado de similitud en pipelines de moderación: comparar cada pieza entrante contra un conjunto de referencia de contenido permitido o prohibido y derivar una puntuación de proximidad antes de la revisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de recuperación (Recall@k, nDCG), MTEB, ni comparaciones numéricas con el modelo base; tampoco se documentan latencia ni throughput de la NPU.

## Requisitos de hardware

- NPU XDNA2 integrada en procesadores AMD Strix Halo (familia Ryzen AI Max). Es el único hardware soportado: los ficheros no cargan en otras plataformas.
- Controlador de NPU y XRT con su plugin de NPU instalados en el host; el reloj de fabric de la GPU debe mantenerse fijado mientras la NPU trabaja junto a la GPU.
- Almacenamiento: unos 6,1 GB para los ficheros del modelo (5,69 GB de pesos `.hnpw`, 404 MB de encoder de imagen, 20 MB de tokenizador) más el directorio `devices/` descargado de halogen-npu-decider-4b.
- VRAM: no disponible. El modelo se ejecuta en la NPU con memoria compartida del sistema; la documentación no especifica el consumo exacto de memoria.
- GPU dedicada: no necesaria para este modelo. El servidor puede tener además un modelo generativo en la GPU, que es precisamente el escenario para el que se diseñó.
- No cabe ni se puede ejecutar en GPUs de consumo (RTX 4090, etc.) ni en CPU: no hay backend alternativo.
- Opciones de despliegue: exclusivamente halogen-flash-server 0.18.12 o superior, con `HALOGEN_DOWNLOAD` activado y `HALOGEN_NPU_MODELS=wemm-embedding-4b`. No hay soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dimensión | Modalidad | Licencia | Ejecución |
|---|---|---|---|---|---|---|
| peonist-ai/halogen-npu-wemm-embedding-4b | 4B | 4.096 tokens de texto; imágenes hasta 768 x 768 px | 2.560 (reducible) | Texto + imagen, espacio compartido | Apache-2.0 | Solo NPU XDNA2 dentro de halogen-flash-server |
| tencent/WeMM-Embedding-4B | 4B | No disponible en la información proporcionada | No disponible | Texto + imagen | Apache-2.0 | Runtimes estándar de Python (el repositorio original no es el empaquetado para NPU aquí descrito) |
| Alternativas de embeddings de texto de tamaño similar | No disponible | No disponible | No disponible | Solo texto | No disponible | No disponible |

La comparación relevante es con el modelo fuente: mismo contenido semántico y misma licencia, con la diferencia de que la versión original está pensada para ejecutarse en runtimes de Python sobre CPU o GPU, mientras que esta conversión queda atada al contenedor halogen y a la NPU de Strix Halo a cambio de liberar la GPU. Para el resto de alternativas de la categoría no se dispone de datos contrastados en la información proporcionada.

## Limitaciones y advertencias

- Portabilidad nula: los ficheros solo cargan dentro de halogen-flash-server sobre una NPU XDNA2 de Strix Halo. No hay ruta de ejecución en transformers, vLLM, llama.cpp ni Ollama, y el widget de inferencia del Hub está desactivado a propósito.
- Dependencia de versión: la revisión descargada la determina la versión del servidor. Mezclar versiones antiguas del servidor con las cabeceras de este repositorio no está soportado.
- No es un modelo generativo: no responde preguntas, no razona, no hace tool calling ni soporta agentes. Cualquier expectativa de chat es un error de uso.
- Límite de 4.096 tokens: los documentos más largos deben trocearse, con la pérdida de contexto que ello implica en recuperación.
- Límite de imagen: 768 x 768 píxeles con reescalado y ajuste a múltiplos de 32. Detalles finos en imágenes grandes (texto pequeño, marcas) pueden perderse en el reescalado.
- Solo acepta imágenes en línea como base64; el servidor no recupera URLs, lo que obliga a que el cliente descargue y codifique los recursos.
- Idiomas soportados no documentados: no hay lista oficial de cobertura lingüística, así que el rendimiento en castellano debe validarse empíricamente antes de producción.
- Sesgos y alucinación: al ser un modelo de similitud, no "alucina" texto, pero hereda los sesgos de representación del modelo base y de sus datos de entrenamiento (no documentados aquí), lo que puede sesgar la recuperación hacia ciertos registros o demografías.
- Vectores de 2.560 dimensiones: para corpus grandes el coste de almacenamiento y de búsqueda es notable; conviene evaluar `dimensions` para reducir a costa de calidad.
- Requisitos de sistema frágiles: controlador de NPU, XRT con plugin, reloj de fabric de la GPU fijado y checksums verificados en el arranque. Un fallo de cualquiera de estos elementos impide servir el modelo.
- Licencia Apache-2.0: permite uso comercial, pero obliga a conservar `LICENSE` y los avisos de terceros (`vis/NOTICE.md` y `devices/NOTICE.md` de halogen-npu-decider-4b) y a mantener la atribución a Alibaba Cloud por Qwen3.5-4B.
- Validación comunitaria inexistente: cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados. Tratarlo como artefacto experimental.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/peonist-ai/halogen-npu-wemm-embedding-4b
- Modelo base: https://huggingface.co/tencent/WeMM-Embedding-4B
- Repositorio del servidor: https://github.com/peonist-ai/halogen-flash-server
- Documentación de despliegue en NPU: https://github.com/peonist-ai/halogen-flash-server/blob/main/docs/NPU.md
- Programa de NPU compartido: https://huggingface.co/peonist-ai/halogen-npu-decider-4b
- Comunidad (Discord): https://discord.gg/bcm6QknaV6
