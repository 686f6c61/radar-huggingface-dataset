# mradermacher/PepperOCR-VL-GGUF

## Resumen

PepperOCR-VL-GGUF es la versión cuantizada en formato GGUF de sionic-ai/PepperOCR-VL, un modelo de visión-lenguaje especializado en OCR, análisis y comprensión de documentos. Lo publica mradermacher, un cuantizador conocido por distribuir versiones GGUF de modelos abiertos, y su base es el modelo original de sionic-ai. La relevancia de esta ficha radica en que permite ejecutar un sistema de document parsing en hardware de consumo, sin depender de APIs externas ni de GPUs de centro de datos.

El modelo tiene 4.205.751.296 parámetros (aproximadamente 4,2 mil millones) y está etiquetado con qwen3_5, lo que sugiere una arquitectura derivada de la familia Qwen 3.5, aunque la información proporcionada no detalla la arquitectura interna. Se distribuye bajo licencia AGPL-3.0, lo que condiciona su uso comercial, y cubre 16 idiomas, entre ellos el castellano, el inglés, el chino, el japonés, el árabe y el hindi.

El repositorio ocupa 39,9 GB e incluye 14 ficheros GGUF: desde Q2_K (2,0 GB) hasta f16 (8,5 GB), más dos suplementos multimodales mmproj en Q8_0 y f16. El pipeline no está declarado, la librería indicada es transformers y, en el momento de redactar esta ficha, acumula 388 descargas y 1 like. No se han publicado resultados de benchmarks en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de visión-lenguaje; la etiqueta qwen3_5 sugiere una base de la familia Qwen 3.5) |
| Parámetros totales | 4.205.751.296 (≈4,2 mil millones) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; suplementos multimodales mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | 16: en, de, es, fr, id, it, nl, pt, vi, ar, hi, ja, ko, ru, th, zh |
| Licencia | AGPL-3.0 |
| Formato de pesos | GGUF (este repositorio); safetensors no confirmado en la información disponible |
| Autor de la cuantización | mradermacher |
| Modelo base | sionic-ai/PepperOCR-VL |
| Tamaño del repositorio | 39,9 GB |
| Librería declarada | transformers |
| Pipeline | no disponible |

## Arquitectura y entrenamiento

La información proporcionada no incluye detalles sobre la arquitectura interna del modelo base, el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. Lo que sí se puede afirmar es que se trata de un modelo multimodal de visión-lenguaje orientado a OCR y comprensión de documentos, con 4,2 mil millones de parámetros totales y etiquetas que apuntan a qwen3_5 como referencia de arquitectura, además de soporte declarado para markdown, LaTeX y reconocimiento de tablas.

En el lado de la cuantización sí hay información concreta: los ficheros GGUF se generaron con el script de conversión a HF (convert_type: hf) y con quantize_version 2, con salida de tensores cuantizados (output_tensor_quantised: 1). El autor indica que no hay cuantizaciones ponderadas ni con imatrix disponibles en el momento de la publicación, y que la lista de cuants incluye tanto K-quants clásicos como IQ4_XS. El componente visual se distribuye por separado en dos ficheros mmproj (Q8_0 y f16), un patrón habitual en llama.cpp para modelos multimodales que separa el proyector del modelo de lenguaje. No hay información sobre decodificación especulativa, atención lineal ni otras innovaciones técnicas.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) sobre imágenes de documentos.
- Conversión de documentos a Markdown estructurado.
- Extracción de fórmulas matemáticas en LaTeX.
- Reconocimiento y reconstrucción de tablas.
- Comprensión de documentos (document understanding) más allá de la mera transcripción de texto.
- Procesamiento multimodal de imagen y texto de forma conjunta.
- Soporte multilingüe en 16 idiomas: inglés, alemán, castellano, francés, indonesio, italiano, neerlandés, portugués, vietnamita, árabe, hindi, japonés, coreano, ruso, tailandés y chino.
- Soporte conversacional (etiqueta conversational), lo que permite interacción multi-turno.
- No se ha confirmado en la información disponible soporte de tool calling, function calling, modo de razonamiento explícito ni capacidades de audio.

## Casos de uso

- Digitalización masiva de archivos: el modelo convierte lotes de documentos escaneados a Markdown con estructura preservada, lo que permite indexar el contenido en buscadores internos o sistemas RAG sin pasar por servicios OCR en la nube.
- Extracción de tablas financieras: a partir de capturas o PDF renderizados, el modelo reconstruye tablas en Markdown que después se parsean a CSV o DataFrame, útil en auditoría y contabilidad.
- Procesamiento de documentación técnica y científica: la conversión a LaTeX de fórmulas permite reutilizar el contenido en pipelines de publicación o en bases de conocimiento matemáticas.
- Atención al cliente con documentos adjuntos: el modelo puede leer facturas, contratos o capturas enviadas por el usuario y responder preguntas sobre ellas en una conversación multi-turno, aprovechando su naturaleza conversacional.
- Cumplimiento normativo y revisión de contratos: extracción de cláusulas y campos concretos de contratos escaneados en varios idiomas, con el texto resultante alimentando reglas de validación automáticas.
- Despliegue on-premise con datos sensibles: al ejecutarse en local mediante llama.cpp u Ollama con cuantizaciones de 2 a 3 GB, encaja en entornos sanitarios, jurídicos o financieros donde no se permite enviar documentos a terceros.
- Digitalización de patrimonio documental multilingüe: su cobertura de 16 idiomas, incluidos árabe, hindi, tailandés y los principales idiomas europeos, permite procesar fondos documentales heterogéneos con un único modelo.
- Preprocesado para pipelines de agentes: el texto estructurado en Markdown que produce sirve como entrada limpia para modelos de lenguaje mayores encargados de razonamiento posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio cuantizado no incluye métricas de OCR (por ejemplo, tasas de error por carácter o por palabra), ni resultados en conjuntos como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos de document parsing.

## Requisitos de hardware

Estimaciones calculadas a partir de los tamaños de fichero publicados en el repositorio; no incluyen el consumo de caché KV ni el coste de los tokens de imagen, que en tareas de OCR con documentos de alta resolución puede ser significativo.

- Q2_K: 2,0 GB de pesos + 0,5 GB de mmproj-Q8_0. Aproximadamente 3 GB de VRAM para contexto corto; viable en GPU de 4-6 GB y en CPU.
- Q3_K_S / Q3_K_M / Q3_K_L: entre 2,2 y 2,5 GB. Aproximadamente 3,5 GB de VRAM.
- IQ4_XS: 2,6 GB. Aproximadamente 3,5-4 GB de VRAM.
- Q4_K_S / Q4_K_M: 2,7 y 2,8 GB, marcados por el autor como "fast, recommended". Aproximadamente 4-5 GB de VRAM.
- Q5_K_S / Q5_K_M: 3,1 y 3,2 GB. Aproximadamente 5 GB de VRAM.
- Q6_K: 3,6 GB, descrito por el autor como "very good quality". Aproximadamente 5,5 GB de VRAM.
- Q8_0: 4,6 GB, "fast, best quality". Aproximadamente 6,5-7,5 GB de VRAM.
- f16: 8,5 GB, descrito como "16 bpw, overkill". Aproximadamente 10-11 GB de VRAM.

GPUs recomendadas:

- RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores: ejecutan sin problema Q4_K_M, Q5_K_M, Q6_K e incluso Q8_0.
- RTX 4090 24 GB, A100 40/80 GB, H100: margen amplio para f16 con contextos largos o procesamiento por lotes de varias páginas.
- GPUs de 6-8 GB (GTX 1660, RTX 2060, RTX 3050): funcionan con Q2_K a Q4_K_S.
- CPU sola: posible con llama.cpp y las cuantizaciones Q2_K a Q4_K_M, con latencia mucho mayor.

Opciones de despliegue:

- llama.cpp: soporte nativo de GGUF y de los ficheros mmproj para el componente visual.
- Ollama y LM Studio: importación de los GGUF y del proyector multimodal correspondiente.
- vLLM: la etiqueta vllm aparece en el repositorio, pero el soporte de vLLM para GGUF es limitado frente a safetensors; conviene verificar la compatibilidad antes de usarlo en producción.
- TGI: no hay confirmación de soporte GGUF multimodal en la información disponible.

Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de tiempo por página.

## Comparativa con modelos similares

La información proporcionada no incluye datos verificados de modelos alternativos, por lo que las celdas que no se pueden confirmar se marcan como no disponibles. Se listan alternativas habituales de la misma categoría (OCR y document parsing de tamaño pequeño) únicamente como referencia de búsqueda.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| PepperOCR-VL-GGUF (mradermacher) | 4.205.751.296 | no disponible | AGPL-3.0 | GGUF en HuggingFace |
| sionic-ai/PepperOCR-VL (base) | no disponible | no disponible | AGPL-3.0 | HuggingFace |
| GOT-OCR2.0 | no disponible | no disponible | no disponible | no disponible en la información proporcionada |
| Qwen2.5-VL-3B | no disponible | no disponible | no disponible | no disponible en la información proporcionada |

En cuanto a la comparación interna entre cuantizaciones del propio repositorio, el autor recomienda Q4_K_S y Q4_K_M por equilibrio entre velocidad y calidad, sitúa Q6_K como calidad muy buena y Q8_0 como la mejor calidad con buena velocidad, y señala f16 como excesivo para uso práctico.

## Limitaciones y advertencias

- Licencia AGPL-3.0: es una licencia copyleft fuerte. El uso comercial es posible, pero integrar el modelo en un servicio de red puede obligar a liberar el código fuente de la aplicación bajo los mismos términos. Conviene revisión legal antes de desplegarlo en producción.
- No se han publicado evaluaciones de sesgo, y al ser un modelo de OCR multilingüe puede presentar peor rendimiento en idiomas con menor representación en los datos de entrenamiento o en escrituras no latinas.
- Riesgo de alucinación: en tareas de transcripción, un modelo generativo puede inventar texto, especialmente en documentos degradados, con ruido, sellos, manuscritos o tablas complejas. Para OCR crítico se recomienda validación posterior, por ejemplo comparando con un OCR determinista o aplicando umbrales de confianza.
- Longitud de contexto no disponible: no se puede garantizar el procesamiento de documentos de muchas páginas en una sola pasada. Los documentos largos probablemente requieran troceado.
- La calidad de las cuantizaciones bajas (Q2_K, Q3_K_S) es notablemente inferior según la propia model card; en tareas de reconocimiento de caracteres y tablas, donde los errores de un solo token cambian el resultado, se desaconseja bajar de Q4_K.
- El componente visual se distribuye en ficheros mmproj separados. Omitirlos impide el procesamiento de imágenes.
- No hay cuantizaciones ponderadas ni con imatrix, lo que puede suponer una pérdida de calidad algo mayor respecto a las cuantizaciones equivalentes de otros publicadores.
- El pipeline no está declarado y no hay confirmación oficial de soporte en vLLM o TGI para esta combinación de GGUF y proyector multimodal.
- El repositorio es una cuantización de terceros, no una publicación del autor original del modelo; los cambios de comportamiento respecto al modelo base no están documentados.
- Fecha de creación y actualización: 5 de octubre de 2026 en ambos casos. El modelo tiene muy poca tracción comunitaria (388 descargas, 1 like), por lo que hay pocos informes de uso real disponibles.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/PepperOCR-VL-GGUF
- Modelo base: https://huggingface.co/sionic-ai/PepperOCR-VL
- Página de descargas del cuantizador para este modelo: https://hf.tst.eu/model#PepperOCR-VL-GGUF
- Fichero mmproj-Q8_0: https://huggingface.co/mradermacher/PepperOCR-VL-GGUF/resolve/main/PepperOCR-VL.mmproj-Q8_0.gguf
- Fichero mmproj-f16: https://huggingface.co/mradermacher/PepperOCR-VL-GGUF/resolve/main/PepperOCR-VL.mmproj-f16.gguf
- FAQ y peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF citada por el autor: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfica comparativa de perplejidad por tipo de cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- No se han encontrado papers, blogs ni demos adicionales en los resultados de búsqueda web; los resultados devueltos no guardan relación con el modelo.
