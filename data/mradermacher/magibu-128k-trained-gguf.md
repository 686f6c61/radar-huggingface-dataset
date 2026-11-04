# mradermacher/magibu-128k-trained-GGUF

## Resumen

magibu-128k-trained-GGUF es la versión cuantizada en formato GGUF del modelo alibayram/magibu-128k-trained, publicada por el usuario mradermacher, especializado en la generación de cuantizaciones estáticas e imatrix de modelos open source. El modelo base cuenta con 11.262.717.696 parámetros (aproximadamente 11,26 mil millones) y ha sido entrenado mediante SFT (supervised fine-tuning) usando las librerías TRL y Unsloth, según los metadatos de la model card. El nombre del modelo sugiere una ventana de contexto de 128.000 tokens, aunque este dato no se confirma de forma explícita en la información disponible.

La relevancia de esta publicación reside en que permite ejecutar un modelo de ~11B parámetros con un contexto potencialmente muy largo en hardware de consumo, gracias a la disponibilidad de cuantizaciones que van desde Q2_K (4,5 GB) hasta Q8_0 (12,1 GB), además de un complemento multimodal (mmproj) que sugiere capacidades de visión. El repositorio incluye tanto cuantizaciones estáticas como una variante i1-GGUF con cuantizaciones ponderadas/imatrix para mayor calidad.

Se trata de un modelo orientado a conversación (tag "conversational") y entrenado únicamente en inglés según los metadatos de idioma. La licencia no está especificada en la información proporcionada, lo que constituye un caveat importante para uso comercial. El modelo base fue publicado por alibayram y esta versión GGUF facilita su despliegue en llama.cpp, Ollama y otros runners compatibles con GGUF.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (detalles específicos no disponibles); fine-tuning con TRL/Unsloth (SFT) |
| Parámetros totales | 11.262.717.696 (~11,26 B) |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | 128.000 tokens (inferido del nombre del modelo; no confirmado explícitamente) |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16; variantes i1 (imatrix) en repo separado |
| Idiomas soportados | Inglés (en) |
| Licencia | No disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de que se trata de un transformer fine-tuneado. Los tags del repositorio indican que el entrenamiento se realizó mediante SFT (supervised fine-tuning) con TRL y Unsloth, lo que sugiere un proceso de ajuste supervisado sobre un modelo preentrenado, probablemente con datos conversacionales. No se especifica el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO.

El nombre "magibu-128k-trained" apunta a un entrenamiento orientado a extender la ventana de contexto hasta 128.000 tokens, aunque no se confirma la técnica empleada (RoPE scaling, YaRN, etc.). La presencia de archivos mmproj (multi-modal projection) en el repositorio GGUF indica que el modelo incorpora un adaptador multimodal, presumiblemente para entrada de imágenes, aunque no se detalla qué codificador visual utiliza ni cómo se entrenó esa componente.

## Capacidades

- Generación de texto conversacional en inglés, con formato de chat (tag "conversational").
- Procesamiento de contexto largo, potencialmente hasta 128.000 tokens según el nombre del modelo (no confirmado).
- Capacidades multimodales: la presencia de archivos mmproj sugiere soporte de entrada de imágenes, aunque no se detalla su alcance.
- Fine-tuning supervisado orientado a instrucciones (SFT), lo que implica cierta capacidad de seguir instrucciones.
- No se documenta soporte explícito de tool calling o function calling.
- No se documenta soporte explícito de agentes o razonamiento multi-paso.
- Idiomas: únicamente inglés según los metadatos.
- No se documenta modo "thinking", audio ni otras capacidades especiales.

## Casos de uso

- Asistente conversacional en inglés con contexto largo: el modelo puede mantener conversaciones multi-turno con historiales extensos gracias a su ventana de contexto potencial de 128k tokens, adecuado para atención al cliente o soporte técnico donde se requiere recordar información de interacciones previas.
- Análisis de documentos extensos: con 128k tokens de contexto, permite resumir, extraer información o responder preguntas sobre informes, contratos o artículos largos en una sola pasada, sin necesidad de fragmentación.
- Procesamiento de imágenes con texto (si se confirma la multimodalidad): el adaptador mmproj permitiría tareas de descripción de imágenes, OCR asistido o respuesta a preguntas visuales, aunque esta capacidad no está documentada en detalle.
- Despliegue en hardware de consumo: las cuantizaciones Q4_K_M (7,0 GB) o Q5_K_M (8,1 GB) permiten ejecutar el modelo en GPUs consumer con 8-12 GB de VRAM mediante llama.cpp u Ollama, facilitando prototipado local sin infraestructura cloud.
- Generación de texto creativo y redacción en inglés: el fine-tuning SFT sobre datos conversacionales lo hace adecuado para tareas de escritura asistida, brainstorming y generación de contenido en inglés.
- Investigación en eficiencia de cuantización: el repositorio ofrece un espectro amplio de cuantizaciones (desde Q2_K hasta Q8_0) y una variante imatrix, lo que permite estudiar el trade-off entre tamaño, calidad y velocidad en modelos de ~11B.
- Fine-tuning adicional o experimentación: al estar disponible el modelo base en safetensors y las versiones GGUF, investigadores pueden comparar el comportamiento del modelo original frente a las cuantizaciones en tareas específicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización:
  - Q2_K (4,5 GB): ~6 GB de VRAM incluyendo overhead de contexto.
  - Q3_K_M (5,7 GB): ~7-8 GB de VRAM.
  - IQ4_XS (6,3 GB): ~8 GB de VRAM.
  - Q4_K_M (7,0 GB): ~9-10 GB de VRAM; recomendado para GPUs de 12 GB.
  - Q5_K_M (8,1 GB): ~10-11 GB de VRAM.
  - Q6_K (9,3 GB): ~12 GB de VRAM.
  - Q8_0 (12,1 GB): ~14-16 GB de VRAM.
  - Con contexto de 128k tokens, el consumo de VRAM por KV cache puede ser considerable y requerirá GPUs de mayor capacidad o técnicas de offloading.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070 Ti, RTX 4090 (24 GB) para cuantizaciones altas con contexto largo; A100 o H100 para despliegues de producción con contexto completo.
- Cabe en GPU consumer: sí, en cuantizaciones Q2_K a Q5_K_M en GPUs de 8-12 GB; Q6_K y Q8_0 requieren 12-16 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runner compatible con GGUF; para el modelo base en safetensors, vLLM o TGI (no confirmado para esta arquitectura específica).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Se puede señalar que, por tamaño (~11B parámetros), el modelo se sitúa en la categoría de modelos como Llama 3.1 8B, Mistral 7B o Qwen2.5 14B, pero no se dispone de datos de rendimiento ni de especificaciones confirmadas para establecer una comparación rigurosa. Los datos de licencia, contexto real y benchmarks de magibu-128k-trained no están disponibles, lo que impide una comparativa fundamentada.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar si el uso comercial está permitido; es imprescindible contactar con el autor del modelo base (alibayram) antes de cualquier despliegue en producción.
- Idiomas: el modelo está entrenado únicamente en inglés según los metadatos; su rendimiento en castellano u otros idiomas es incierto y probablemente deficiente.
- Contexto de 128k no confirmado: el nombre del modelo sugiere esa longitud, pero no se documenta la técnica de extensión ni la calidad de la atención en contextos largos; es probable que el rendimiento degrade en las posiciones más lejanas.
- Multimodalidad no documentada: la presencia de mmproj indica soporte visual, pero no se detalla el codificador, el dataset de entrenamiento multimodal ni la calidad esperada.
- Riesgo de alucinación: como todo modelo de lenguaje fine-tuneado con SFT, puede generar información falsa con aparente confianza, especialmente en dominios especializados.
- Sesgos: no se documenta ningún análisis de sesgos; el modelo base y los datos de SFT podrían introducir sesgos de género, raza o ideológicos no evaluados.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento en MMLU, HumanEval, GSM8K u otras tareas, lo que dificulta evaluar su calidad frente a alternativas.
- Repositorio de 79,2 GB: incluye todas las cuantizaciones; la descarga completa es costosa en almacenamiento, aunque se pueden descargar archivos individuales.
- Modelo con pocas descargas (125) y 0 likes: comunidad reducida, lo que implica menor validación externa y soporte limitado.
- Fecha de creación futura (2026-01-14) en los metadatos: posible inconsistencia en la información del repositorio que conviene verificar.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/magibu-128k-trained-GGUF
- Modelo base: https://huggingface.co/alibayram/magibu-128k-trained
- Cuantizaciones imatrix (i1): https://huggingface.co/mradermacher/magibu-128k-trained-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#magibu-128k-trained-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Guía sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Empresa del autor: https://www.nethype.de/
