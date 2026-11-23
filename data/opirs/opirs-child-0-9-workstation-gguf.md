# opirs/OPIRS-Child-0.9-Workstation-GGUF

## Resumen

OPIRS Child 0.9 Workstation es una redistribución cuantizada del modelo Qwen3.5-9B, publicada por OPIRS (operado por SILPION LIMITED) bajo licencia Apache 2.0. No se trata de un modelo entrenado por OPIRS: según la propia model card, el modelo base es Qwen3.5-9B, publicado por el equipo Qwen de Alibaba Cloud, y OPIRS no ha modificado los pesos. La versión 0.9 corresponde a un modelo "seleccionado y medido" por OPIRS, mientras que la futura versión 1.0 será el primer modelo entrenado por su sistema de investigación, Mother.

El artefacto distribuido es un GGUF cuantizado en Q4_K_M de aproximadamente 6,6 GB, acompañado de un proyector de imagen (`mmproj`) que habilita capacidades multimodales. El modelo cuenta con 8.953.803.264 parámetros (unos 9B) y está orientado a despliegue en estaciones de trabajo, con compatibilidad con Ollama y endpoints compatibles.

Su relevancia es limitada pero concreta: ofrece una vía de descarga verificada criptográficamente (SHA-256 publicado) de un modelo Qwen multimodal en formato GGUF listo para consumir, con integración directa en el cliente voluntario de OPIRS y en el catálogo firmado de la organización. No obstante, el repositorio no incluye documentación técnica propia sobre arquitectura, contexto o entrenamiento más allá de la identificación del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base identificado como Qwen3.5-9B; arquitectura concreta no documentada en la información disponible) |
| Parámetros totales | 8.953.803.264 (~9B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M (única cuantización publicada) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo de lenguaje + `mmproj` para visión) |

## Arquitectura y entrenamiento

La información disponible no documenta la arquitectura interna del modelo. La model card identifica el modelo base como Qwen3.5-9B, desarrollado por el equipo Qwen de Alibaba Cloud, y declara explícitamente que OPIRS no ha modificado los pesos. Por tanto, cualquier detalle arquitectónico (tipo de transformer, mecanismos de atención, uso de decodificación especulativa, etc.) corresponde al modelo original de Qwen y no se detalla en este repositorio.

Tampoco se especifican los datos de entrenamiento: número de tokens, composición del dataset, uso de RLHF/DPO u otras etapas de alineamiento. La única información sobre el proceso de selección es que OPIRS evalúa modelos abiertos mediante pruebas generadas por código y verificadas por una red de voluntarios en un segundo equipo, con registro público en opirs.org. La distribución incluye dos ficheros: el modelo de lenguaje cuantizado y un proyector de imagen que habilita la lectura de imágenes cuando se cargan ambos.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`, etiqueta `conversational`).
- Procesamiento de imágenes: el repositorio incluye un proyector multimodal (`mmproj-OPIRS-Child-0.9-Workstation.gguf`) que, cargado junto al modelo de lenguaje, permite entrada visual.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita su integración en servicios HTTP de inferencia.
- Ejecución directa mediante Ollama con el identificador `qwen3.5:9b` en la librería de Ollama.
- Verificación de integridad mediante SHA-256 publicado para ambos ficheros.
- Capacidades específicas de razonamiento, código, matemáticas, tool calling o agentes: no disponibles en la información proporcionada.

## Casos de uso

- Despliegue local en estaciones de trabajo: el GGUF Q4_K_M de 6,6 GB permite ejecutar el modelo en una máquina de trabajo con GPU de consumo, sin dependencia de servicios en la nube, usando Ollama o llama.cpp.
- Procesamiento de documentos con imágenes: cargando el modelo de lenguaje junto con el `mmproj`, se pueden enviar capturas, diagramas o páginas escaneadas para obtener descripciones o extracción de información textual.
- Asistentes conversacionales internos: la etiqueta `conversational` y la compatibilidad con endpoints permiten montar un servicio de chat sobre la infraestructura propia de la organización.
- Validación de integridad en pipelines de distribución: el cliente voluntario de OPIRS descarga los ficheros a través de un catálogo firmado y rechaza copias cuyo fingerprint no coincida, un patrón reutilizable para pipelines que requieran procedencia verificada de pesos.
- Prototipado rápido de aplicaciones multimodales: al estar disponible como `qwen3.5:9b` en Ollama, se puede integrar en demos y pruebas de concepto con un solo comando.
- Reproducibilidad de evaluaciones: el registro público de OPIRS en opirs.org permite contrastar resultados de este modelo frente a otros candidatos en las mismas pruebas generadas por código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero de lenguaje en Q4_K_M ocupa parte de los 6,6 GB totales del repositorio (que incluye también el `mmproj`); se requiere adicionalmente memoria para el contexto KV, cuyo tamaño depende de la longitud de contexto configurada (no documentada).
- GPU recomendadas: no disponible en la información proporcionada.
- Cabe en GPU de consumo: el tamaño del GGUF Q4_K_M es compatible con GPUs de consumo con 8 GB o más de VRAM, aunque la cifra exacta de VRAM necesaria no está documentada.
- Opciones de despliegue: Ollama (`ollama run hf.co/opirs/OPIRS-Child-0.9-Workstation-GGUF:Q4_K_M`), llama.cpp (formato GGUF) y servidores compatibles con endpoints. vLLM y TGI no están confirmados para este artefacto.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OPIRS Child 0.9 Workstation | ~9B | no disponible | Q4_K_M (GGUF) | Apache 2.0 | Hugging Face, Ollama |
| Qwen3.5-9B (modelo base) | ~9B | no disponible | no disponible | Apache 2.0 | Repositorio de Qwen |
| Otras alternativas de ~9B | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación documentada es con el propio modelo base Qwen3.5-9B, del que este artefacto es una redistribución cuantizada sin modificaciones de pesos. No se dispone de datos de rendimiento ni de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- El repositorio no documenta sesgos conocidos, riesgos de alucinación ni limitaciones idiomáticas del modelo.
- La longitud de contexto no está especificada, lo que impide planificar cargas de trabajo con ventanas largas.
- Solo se publica una cuantización (Q4_K_M); no hay versiones de mayor precisión ni alternativas de menor tamaño en este repositorio.
- El modelo es una redistribución: cualquier problema de calidad, sesgo o alineamiento proviene del modelo base Qwen3.5-9B y debe consultarse en su documentación original.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-9B en su repositorio de origen.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin historial de uso que permita validar su adopción.
- Las capacidades multimodales requieren cargar tanto el modelo de lenguaje como el `mmproj`; usar solo el primero limita la entrada a texto.

## Enlaces

- Hugging Face: https://huggingface.co/opirs/OPIRS-Child-0.9-Workstation-GGUF
- Registro público de evaluaciones de OPIRS: https://opirs.org
- Ollama: https://ollama.com
- Modelo base Qwen3.5-9B: no disponible (no se incluye enlace en la información proporcionada)
