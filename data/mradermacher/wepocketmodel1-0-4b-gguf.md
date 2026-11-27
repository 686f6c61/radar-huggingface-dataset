# mradermacher/WePocketModel1.0-4B-GGUF

## Resumen

WePocketModel1.0-4B es un modelo multimodal de 4.205.751.296 parámetros (aproximadamente 4,2 mil millones) desarrollado por Tencent, orientado a despliegue en dispositivo (on-device) y a tareas de embedding multimodal y decisión estructurada. Esta ficha documenta la versión cuantizada en formato GGUF publicada por mradermacher, que permite ejecutar el modelo con llama.cpp y herramientas compatibles en hardware de consumo, reduciendo el peso desde los 8,5 GB del formato f16 hasta 2,1 GB en Q2_K.

El modelo base se distribuye bajo licencia Apache 2.0 y está etiquetado con capacidades de embedding multimodal, MRL (Matryoshka Representation Learning, por sus siglas) y decisión estructurada, lo que sugiere un uso previsto más cercano a la recuperación de información, la clasificación y la toma de decisiones guiada que a la generación de texto libre a gran escala. Su tamaño contenido y su enfoque on-device lo hacen relevante para aplicaciones móviles, edge computing y pipelines de recuperación semántica donde el coste por inferencia y la privacidad son críticos.

La información pública disponible sobre esta versión cuantizada es limitada: la model card del repositorio de mradermacher se limita a listar los ficheros GGUF generados y remite a la página del modelo base de Tencent para los detalles técnicos. Por ello, varios campos de esta ficha se marcan explícitamente como "no disponible" cuando no constan en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal; detalles de la arquitectura no constan en la información proporcionada) |
| Parámetros totales | 4.205.751.296 (≈4,2 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; además mmproj-f16 y mmproj-Q8_0 para el componente multimodal |
| Idiomas soportados | en (inglés), según la model card |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (transformers como librería declarada; el repositorio contiene únicamente ficheros GGUF) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base tencent/WePocketModel1.0-4B en la documentación proporcionada. Las etiquetas del repositorio indican que se trata de un modelo multimodal con capacidades de embedding multimodal, MRL (Matryoshka Representation Learning) y decisión estructurada, lo que apunta a un diseño que combina un codificador visual con un modelo de lenguaje para producir representaciones vectoriales de longitud variable y salidas estructuradas.

Tampoco constan datos sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras fases de alineación. La información sobre el proceso de cuantización sí está disponible: mradermacher ha generado cuantizaciones estáticas (quantize_version 2, output_tensor_quantised 1, convert_type hf) a partir de los pesos en formato Hugging Face del modelo original, e indica que las cuantizaciones ponderadas/imatrix están disponibles en un repositorio separado (WePocketModel1.0-4B-i1-GGUF).

## Capacidades

- Generación de texto conversacional: la etiqueta "conversational" en el repositorio indica soporte para diálogo.
- Embedding multimodal: el modelo está diseñado para producir representaciones vectoriales a partir de entradas multimodales (texto e imagen), según las etiquetas "multimodal-embedding" y "multimodal".
- MRL (Matryoshka Representation Learning): capacidad de generar embeddings truncables a distintas dimensiones, útil para recuperación con distintos presupuestos de almacenamiento y latencia.
- Decisión estructurada: la etiqueta "structured-decision" sugiere soporte para producir salidas con formato estructurado orientadas a la toma de decisiones.
- Despliegue on-device: el modelo está etiquetado como "on-device", lo que indica que ha sido optimizado para ejecutarse en dispositivos con recursos limitados.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card ("en"); no se documentan otros idiomas.
- Modo thinking, visión, audio: la multimodalidad está declarada, pero no se detalla qué modalidades concretas cubre ni si existe un modo de razonamiento explícito.

## Casos de uso

- Búsqueda semántica en aplicaciones móviles: el modelo puede generar embeddings multimodales en el propio dispositivo, lo que permite indexar y recuperar contenido local (notas, fotos, documentos) sin enviar datos a un servidor, aprovechando su tamaño de 4,2 B y sus cuantizaciones de 2-3 GB.
- Recuperación aumentada (RAG) en edge: con cuantizaciones Q4_K_M (2,8 GB) o Q5_K_M (3,2 GB), el modelo puede actuar como codificador de consultas y documentos en pipelines RAG desplegados en portátiles o servidores de gama baja, reduciendo la dependencia de APIs externas.
- Clasificación y enrutamiento de consultas: la capacidad de decisión estructurada permite usar el modelo para clasificar intenciones o enrutar peticiones en un sistema multiagente, generando salidas con formato fijo que un orquestador puede consumir directamente.
- Moderación de contenido asistida por embeddings: las representaciones vectoriales permiten comparar contenido nuevo contra un conjunto de referencia de ejemplos etiquetados, un enfoque adecuado para filtros de contenido de baja latencia en aplicaciones con restricciones de privacidad.
- Asistentes conversacionales locales: la etiqueta "conversational" y el despliegue on-device permiten integrar un asistente de diálogo en aplicaciones de escritorio o móviles que funcione sin conexión, usando el fichero Q4_K_S (2,7 GB) como compromiso entre calidad y velocidad.
- Prototipado e investigación en embeddings multimodales: el formato GGUF y las múltiples cuantizaciones facilitan experimentar con MRL y representaciones multimodales en hardware de consumo, sin necesidad de GPUs de centro de datos.
- Procesamiento de imágenes en el dispositivo: el fichero mmproj (0,5-0,8 GB) complementa al modelo principal para tareas que requieran entrada visual, como la descripción o el etiquetado automático de imágenes en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio cuantizado no incluye métricas de MMLU, HumanEval, GSM8K ni de tareas de recuperación o embedding, y tampoco se proporcionan comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto): aproximadamente 2,1 GB (Q2_K), 2,7-2,8 GB (Q4_K_S / IQ4_XS / Q4_K_M), 3,1-3,2 GB (Q5_K_S / Q5_K_M), 3,6 GB (Q6_K), 4,6 GB (Q8_0) y 8,5 GB (f16). Añadir 0,5-0,8 GB si se usa el componente multimodal mmproj.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, el modelo cabe en GPUs de consumo con 6-8 GB de VRAM en cuantizaciones Q4-Q5, y en GPUs de 4 GB en Q2-Q3, aunque no se han publicado pruebas específicas.
- Compatibilidad con GPU de consumo: sí, previsiblemente en tarjetas con 4-8 GB de VRAM según la cuantización; no se documentan modelos concretos.
- Opciones de despliegue: llama.cpp y cualquier runtime compatible con GGUF (Ollama, LM Studio, entre otros). El repositorio declara la etiqueta "endpoints_compatible". No se menciona soporte de vLLM o TGI para esta versión.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (embedding multimodal on-device de ~4 B) ni datos de rendimiento que permitan una comparación rigurosa con alternativas.

## Limitaciones y advertencias

- Idiomas: la model card solo declara inglés ("en"); el rendimiento en castellano u otros idiomas no está documentado y probablemente sea limitado.
- Contexto: se desconoce la longitud máxima de contexto, lo que impide garantizar su idoneidad para documentos largos o conversaciones extensas.
- Arquitectura y entrenamiento opacos: al no publicarse detalles sobre datos de entrenamiento ni alineación, no es posible evaluar sesgos conocidos ni riesgos de alucinación con fundamento; deben asumirse los riesgos habituales de los modelos de lenguaje.
- Cuantizaciones de baja precisión: las variantes Q2_K y Q3_K_S pueden degradar notablemente la calidad; la propia model card marca Q3_K_M como "lower quality" y recomienda Q4_K_S, Q4_K_M y Q8_0 como opciones rápidas y de buena calidad.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia y condiciones del modelo base original (tencent/WePocketModel1.0-4B) antes de desplegarlo en producción.
- Repositorio cuantizado: esta ficha cubre la versión GGUF de mradermacher, no los pesos originales; para uso con transformers deben obtenerse los pesos del repositorio de Tencent.
- Madurez: el repositorio registra 281 descargas y 0 likes en el momento de la consulta, lo que indica una adopción todavía muy limitada y escasa validación comunitaria.

## Enlaces

- Repositorio Hugging Face (versión cuantizada): https://huggingface.co/mradermacher/WePocketModel1.0-4B-GGUF
- Modelo base: https://huggingface.co/tencent/WePocketModel1.0-4B
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/WePocketModel1.0-4B-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#WePocketModel1.0-4B-GGUF
- Guía de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
