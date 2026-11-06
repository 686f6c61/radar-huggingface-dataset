# ProKope-AI/ProKope-4B-Eagle-Eye

## Resumen

ProKope-4B-Eagle-Eye es un modelo vision-language de 4.539 millones de parametros (4,54 B) desarrollado por ProKope-AI, orientado especificamente a tareas de OCR, parsing de documentos y comprension de imagenes con texto. Se distribuye a traves de Hugging Face bajo la libreria transformers, con pesos en safetensors y una arquitectura identificada en los tags como `qwen3_5`, lo que sugiere una base derivada de la familia Qwen 3.5 adaptada a modalidad multimodal image-text-to-text.

El modelo esta disenado para resolver el problema del parsing estructurado de documentos: extraccion de texto, tablas y estructura a partir de imagenes de documentos, con soporte declarado para benchmarks especificos del dominio como olmOCR-bench, ParseBench, Real5-OmniDocBench, PulseBench-Tab y fr-bench-pdf2md. Su relevancia actual radica en que combina un tamano contenido (4,5 B) con capacidades multimodales de extraccion documental, lo que permite desplegarlo en infraestructura moderada frente a alternativas de mayor escala.

El modelo soporta nueve idiomas (ingles, frances, aleman, espanol, chino, japones, coreano, ruso y arabe) y se distribuye bajo licencia Apache 2.0, aunque el acceso al repositorio esta restringido (gated) y requiere aceptar condiciones en Hugging Face. La longitud de contexto no esta especificada en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal image-text-to-text, base `qwen3_5` (segun tag) |
| Parametros totales | 4.539.265.536 (4,54 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, fr, de, es, zh, ja, ko, ru, ar |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 9,1 GB |
| Modalidad | image-text-to-text (vision-language) |
| Acceso | restringido (gated) |

## Arquitectura y entrenamiento

La informacion disponible identifica el modelo con el tag `qwen3_5`, lo que apunta a una arquitectura transformer derivada de la familia Qwen 3.5, adaptada para entrada image-text-to-text. Esto implica un codificador visual acoplado a un decoder de lenguaje, con proyeccion de embeddings visuales al espacio del modelo de lenguaje. No se especifican en la informacion proporcionada detalles sobre el numero de capas, dimensiones ocultas, mecanismo de atencion ni configuracion del encoder visual.

Respecto al entrenamiento, los tags del repositorio listan los datasets `allenai/olmOCR-bench`, `llamaindex/ParseBench`, `PaddlePaddle/Real5-OmniDocBench`, `pulse-ai/PulseBench-Tab` y `pulsia/fr-bench-pdf2md`, que parecen corresponder tanto a datos de evaluacion como, posiblemente, a fuentes de entrenamiento orientadas a OCR y parsing documental. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF, DPO o ajuste supervisado. Tampoco se documentan innovaciones tecnicas especificas como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto y comprension de imagenes con contenido textual (image-text-to-text).
- OCR y extraccion de texto a partir de imagenes de documentos.
- Parsing de documentos estructurados, incluyendo tablas (referencia a PulseBench-Tab).
- Conversion de PDF a Markdown (referencia a fr-bench-pdf2md).
- Capacidad conversacional multi-turno (tag `conversational`).
- Soporte multilingue en nueve idiomas: ingles, frances, aleman, espanol, chino, japones, coreano, ruso y arabe.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Digitalizacion de archivos documentales: el modelo puede procesar imagenes de documentos escaneados y extraer el texto completo, adecuado por su especializacion en OCR y su soporte para olmOCR-bench como referencia de evaluacion.
- Extraccion de tablas de informes financieros: gracias a su entrenamiento/evaluacion sobre PulseBench-Tab, puede convertir tablas presentes en imagenes en estructuras de datos utilizables en pipelines analiticos.
- Conversion de PDF a Markdown para bases de conocimiento: su vinculacion con fr-bench-pdf2md lo hace idoneo para transformar documentos PDF en Markdown estructurado, alimentando sistemas RAG o wikis internas.
- Procesamiento de facturas y formularios multiidioma: con soporte para nueve idiomas, puede gestionar documentos en espanol, frances, aleman, arabe o chino dentro de un mismo flujo de back-office.
- Atencion al cliente con entrada visual: al ser un modelo conversacional image-text-to-text, puede responder consultas sobre capturas de pantalla o documentos adjuntos en un chat de soporte.
- Extraccion de datos de documentos regulatorios y legales: el parsing estructurado permite identificar secciones, clausulas y tablas en contratos o expedientes escaneados.
- Moderacion y clasificacion de contenido visual con texto: puede analizar imagenes con texto incrustado (carteles, memes, capturas) para tareas de clasificacion o enrutamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio referencia los conjuntos olmOCR-bench, ParseBench, Real5-OmniDocBench, PulseBench-Tab y fr-bench-pdf2md, pero no se proporcionan puntuaciones numericas asociadas.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (FP16/BF16): aproximadamente 9-10 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda un minimo de 16-24 GB de VRAM.
- VRAM estimada con cuantizacion de 8 bits: en torno a 5-6 GB para pesos; con 4 bits, aproximadamente 3 GB, aunque los tipos de cuantizacion no estan confirmados en la informacion disponible.
- GPU recomendadas: A100, H100 o L40S para despliegue en produccion con concurrencia; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia en FP16 de instancia unica.
- Cabe en GPU de consumo: si, en tarjetas con 16 GB o mas en FP16; en 8-12 GB requeriria cuantizacion.
- Opciones de despliegue: transformers (libreria declarada), endpoints compatibles (tag `endpoints_compatible`); vLLM, llama.cpp, Ollama o TGI no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones completas de modelos comparables en la informacion proporcionada. Se indica a continuacion una comparacion estructural limitada a los datos disponibles:

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| ProKope-4B-Eagle-Eye | 4,54 B | no disponible | Apache 2.0 | OCR y parsing documental multimodal |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible |

No es posible establecer una comparativa cuantitativa con modelos alternativos sin datos de benchmarks publicados en la informacion disponible.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face antes de descargar los pesos.
- Sesgos conocidos: no se documentan en la informacion proporcionada; cabe esperar sesgos derivados de los datos de entrenamiento, no auditados publicamente.
- Riesgo de alucinacion: como modelo generativo, puede producir texto inexistente en la imagen de entrada, especialmente en documentos degradados o con baja resolucion; no se han publicado tasas de error.
- Limitaciones de contexto e idioma: la longitud de contexto no esta especificada; el soporte linguistico se limita a los nueve idiomas declarados (en, fr, de, es, zh, ja, ko, ru, ar).
- Licencia: Apache 2.0 permite uso comercial, pero debe verificarse el cumplimiento de las condiciones de acceso del repositorio gated.
- Produccion: al no haber benchmarks publicados ni documentacion sobre cuantizacion o despliegue, se recomienda validacion propia antes de su uso en entornos criticos.
- Fecha de creacion del repositorio: 2026-10-29, sin historial de versiones ni comunidad (0 descargas, 0 likes) en el momento de la consulta.

## Enlaces

- Hugging Face: https://huggingface.co/ProKope-AI/ProKope-4B-Eagle-Eye
- Datasets referenciados:
  - https://huggingface.co/datasets/allenai/olmOCR-bench
  - https://huggingface.co/datasets/llamaindex/ParseBench
  - https://huggingface.co/datasets/PaddlePaddle/Real5-OmniDocBench
  - https://huggingface.co/datasets/pulse-ai/PulseBench-Tab
  - https://huggingface.co/datasets/pulsia/fr-bench-pdf2md
- Papers, blogs, repos o demos adicionales: no disponible en la informacion proporcionada.
