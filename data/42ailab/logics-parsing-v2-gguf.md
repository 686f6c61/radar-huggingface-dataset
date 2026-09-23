# 42ailab/Logics-Parsing-v2-GGUF

## Resumen

Logics-Parsing-v2-GGUF es la distribución en formato GGUF de Logics-Parsing-v2, un modelo multimodal de 4.022.468.096 parámetros (~4,02 B) especializado en el análisis y la conversión de documentos. Recibe la imagen de una página (libro, artículo, informe) y devuelve HTML estructurado: encabezados, párrafos, tablas y fórmulas marcados por separado, diagramas de flujo convertidos a Mermaid y partituras musicales en notación ABC, con coordenadas de maquetación. El modelo original lo desarrolló el equipo Logics de Alibaba sobre Qwen3-VL-4B y se publicó bajo licencia Apache-2.0.

El repositorio que nos ocupa no contiene un modelo nuevo ni una conversión propia: es una copia byte a byte de los ficheros GGUF generados por el empaquetador de la comunidad mradermacher, mantenida por 42ailab como respaldo ante la posible desaparición o renombrado del repositorio original y para facilitar el acceso desde China continental (también se publica en ModelScope). Los ficheros conservan nombres, tamaños y digests sha256 idénticos a los originales, y 42ailab verificó además que una conversión propia desde los pesos oficiales produce la misma salida en dos páginas de prueba.

Su relevancia práctica reside en que permite ejecutar en local un parser de documentos de 4 B de parámetros sin enviar documentación sensible a servicios en la nube, con cuantizaciones que van de 2,33 GiB (Q4_K_M) a 3,99 GiB (Q8_0) más un codificador visual compartido de 0,78 GiB. Como contrapartida, el repositorio acumula solo 12 descargas y no publica ninguna evaluación propia del modelo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text): decodificador de texto Qwen3-VL-4B más codificador visual independiente (mmproj) |
| Parámetros totales | 4.022.468.096 (~4,02 B) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | Q4_K_M, Q5_K_M, Q6_K y Q8_0 (decodificador de texto); mmproj-f16 (codificador visual) |
| Idiomas soportados | chino (zh) e inglés (en), según los metadatos del repositorio |
| Licencia | Apache-2.0 (heredada del modelo original de Alibaba) |
| Formato de pesos | GGUF (llama.cpp) |
| Modelo base | Logics-MLLM/Logics-Parsing-v2 (relación: quantized) |
| Tamaño del repositorio | 13,8 GB |
| Tarea declarada | image-text-to-text |

## Arquitectura y entrenamiento

Se trata de un modelo visual-language de arquitectura transformer, construido sobre Qwen3-VL-4B. El despliegue en llama.cpp separa explícitamente dos componentes: un decodificador de texto cuantizado (los ficheros Q4_K_M, Q5_K_M, Q6_K y Q8_0) y un codificador visual compartido en precisión f16 (`Logics-Parsing-v2.mmproj-f16.gguf`, 0,78 GiB) que se usa con cualquiera de las cuantizaciones del decodificador. La salida no es texto libre, sino una representación estructurada de la página: HTML con jerarquía de encabezados y párrafos, tablas y fórmulas delimitadas, diagramas de flujo en Mermaid y partituras en notación ABC, además de coordenadas de maquetación.

No hay información disponible sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones de decodificación. La model card del repositorio se limita a indicar el origen (equipo Logics de Alibaba), el modelo base y el proceso de empaquetado; tampoco se detalla si el modelo incorpora modos de razonamiento u otras capacidades adicionales más allá del parseo de documentos.

## Capacidades

- Conversión de páginas de documentos a HTML estructurado, con encabezados, párrafos, tablas y fórmulas diferenciados.
- Reconocimiento óptico de caracteres (OCR) sobre imágenes de página completas.
- Extracción y serialización de tablas dentro de la estructura HTML de salida.
- Reconocimiento de fórmulas matemáticas y marcado separado del resto del contenido.
- Conversión de diagramas de flujo a sintaxis Mermaid.
- Transcripción de partituras musicales a notación ABC.
- Salida con coordenadas de maquetación, lo que permite reconstruir la posición de los elementos en la página.
- Procesamiento multilingüe limitado a chino e inglés según los metadatos.
- Ejecución totalmente local, sin llamadas a servicios externos.
- No hay información disponible sobre soporte de tool calling, function calling, comportamiento agéntico, razonamiento multi-paso, visión general fuera del parseo documental, audio o modo de pensamiento explícito.

## Casos de uso

- Digitalización de artículos científicos: el modelo recibe la imagen de cada página y devuelve HTML con las fórmulas y tablas ya separadas del texto corrido, lo que evita el post-procesado manual que exigen los OCR convencionales.
- Conversión de fondos bibliográficos escaneados: permite pasar páginas de libros a HTML estructurado manteniendo la jerarquía de encabezados y párrafos, útil para bibliotecas digitales y proyectos de preservación documental.
- Extracción de tablas de informes financieros o técnicos: al marcar las tablas como elementos independientes, la salida se puede parsear después con herramientas estándar para poblar hojas de cálculo o bases de datos.
- Documentación técnica a partir de diagramas: los flujos de trabajo dibujados en manuales se convierten a Mermaid, lo que permite versionarlos como texto en un repositorio Git en lugar de conservarlos como imágenes.
- Edición musical y archivo de partituras: la conversión a notación ABC facilita reutilizar partituras escaneadas en editores de texto musical y compararlas mediante diffs.
- Pipelines de RAG sobre corpus documentales: el HTML estructurado con coordenadas sirve como paso previo de segmentación antes de generar embeddings, mejorando la trazabilidad de las citas a la página y región original.
- Tramitación de documentación confidencial: al ejecutarse en local mediante llama.cpp, permite procesar contratos, expedientes médicos o documentación interna sin que las imágenes salgan de la infraestructura propia.
- Preparación de datos de entrenamiento: la salida estructurada se puede usar para generar pares imagen-texto anotados que alimenten el ajuste de otros modelos de visión y lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio remite a los benchmarks del proyecto original (LogicsDocBench y OmniDocBench v1.5) para evaluar la calidad del modelo, pero no reproduce ninguna cifra. La única comprobación empírica documentada en este repositorio es una comparación cualitativa entre la conversión de mradermacher y una conversión propia de 42ailab sobre dos páginas de prueba (una página de libro en chino y una página de artículo en inglés), en la que ambas builds producen salidas idénticas, incluidas las coordenadas de maquetación. Esa comparación valida la conversión, no la calidad del modelo.

## Requisitos de hardware

- VRAM estimada para el decodificador de texto más el codificador visual (suma de los ficheros publicados): ~3,11 GiB en Q4_K_M, ~3,47 GiB en Q5_K_M, ~3,86 GiB en Q6_K y ~4,77 GiB en Q8_0. Hay que añadir caché KV y activaciones, por lo que en la práctica conviene reservar entre 1 y 3 GiB adicionales según la resolución de imagen y la longitud de contexto.
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM para Q4_K_M (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090, A100, H100). Q8_0 se mantiene cómodamente por debajo de 8 GB de pesos, por lo que también cabe en GPU de gama media.
- Cabe en GPU de consumo: sí. Con 6-8 GB de VRAM es suficiente para las cuantizaciones bajas, y con 10-12 GB se puede usar Q8_0 con margen.
- Inferencia en CPU: viable con llama.cpp, aunque la codificación de imágenes y la decodificación de páginas densas penalizan la latencia sin aceleración por GPU.
- Opciones de despliegue: llama.cpp (formato nativo y presencia del fichero mmproj) y la aplicación de escritorio 42model (`42model download logics-parsing-v2`). No hay información disponible sobre soporte en vLLM, TGI, Ollama u otros servidores; el tag `endpoints_compatible` del repositorio sugiere compatibilidad con Hugging Face Inference Endpoints.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de tiempo por página.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Cuantizaciones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 42ailab/Logics-Parsing-v2-GGUF | 4,02 B | GGUF | Q4_K_M, Q5_K_M, Q6_K, Q8_0 + mmproj-f16 | Apache-2.0 | Hugging Face (12 descargas) y ModelScope |
| mradermacher/Logics-Parsing-v2-GGUF | 4,02 B | GGUF | idénticas (mismos ficheros y sha256) | Apache-2.0 | Hugging Face, cuenta personal |
| Logics-MLLM/Logics-Parsing-v2 | 4,02 B | no disponible | no disponible | Apache-2.0 | Pesos oficiales de Alibaba; referencia del modelo base |
| 42ailab/Logics-Parsing-V3-GGUF | 0,8 B (según el listado de Hugging Face) | GGUF | no disponible | no disponible | Hugging Face; versión posterior, más pequeña |
| Qwen3-VL-4B | ~4 B | safetensors y otros | no disponible | no disponible | Modelo de propósito general sobre el que se construye Logics-Parsing-v2; no es un parser documental especializado |

La comparación con alternativas de la misma categoría (parsers documentales multimodales en GGUF) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo nuevo ni una conversión propia: es una copia de respaldo. Cualquier problema de calidad debe atribuirse al modelo original de Alibaba o a la conversión de mradermacher.
- No se publican evaluaciones propias en este repositorio. La única verificación realizada cubre dos páginas, insuficiente para caracterizar el comportamiento del modelo.
- Cobertura idiomática declarada limitada a chino e inglés; no hay datos sobre su comportamiento con otros idiomas, incluido el español.
- Riesgo de alucinación no cuantificado: no hay tasas de error publicadas para OCR, tablas o fórmulas, por lo que la salida debería validarse en flujos de producción con documentación crítica.
- Posibles sesgos heredados del modelo base Qwen3-VL-4B, no documentados en esta ficha.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar la licencia y las condiciones de los pesos oficiales del modelo base antes de desplegarlo en producto.
- Al ser un repositorio con 12 descargas y sin mantenimiento declarado más allá de la copia, la trazabilidad de versiones y la atención de incidencias no están garantizadas.
- El repositorio ocupa 13,8 GB porque incluye todas las cuantizaciones; en despliegue solo se necesita un fichero de decodificador más el mmproj.
- La verificación byte a byte se apoya en digests sha256; si se descargan ficheros desde réplicas no oficiales, esa garantía se pierde.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/42ailab/Logics-Parsing-v2-GGUF
- Modelo base: https://huggingface.co/Logics-MLLM/Logics-Parsing-v2
- Conversión GGUF original de mradermacher: https://huggingface.co/mradermacher/Logics-Parsing-v2-GGUF
- Repositorio del proyecto original (equipo Logics de Alibaba): https://github.com/alibaba/Logics-Parsing
- Réplica en ModelScope: https://modelscope.cn/models/42ailab/Logics-Parsing-v2-GGUF
- Aplicación de escritorio 42model: https://42model.com
- Sitio del empaquetador: https://42ailab.com
- Versión posterior, Logics-Parsing-V3-GGUF: https://huggingface.co/42ailab/Logics-Parsing-V3-GGUF
- Listado de modelos GGUF en Hugging Face (origen de los resultados de búsqueda): https://huggingface.co/models?library=gguf&p=0&sort=created
