# mradermacher/chandra-ocr-2-MTP-Repacked-GGUF

## Resumen

chandra-ocr-2-MTP-Repacked-GGUF es la versión cuantizada en formato GGUF del modelo chandra-ocr-2-MTP-Repacked, un modelo multimodal especializado en OCR (reconocimiento óptico de caracteres), extracción de contenido de PDF y generación de Markdown con preservación de layout. El modelo original fue desarrollado por datalab-to (bajo licencia OpenRAIL) y repackado por prithivMLmods; la cuantización corre a cargo de mradermacher, un publicador habitual de versiones GGUF para llama.cpp.

Con 4.326.350.848 parámetros (aproximadamente 4,3 mil millones), el modelo se sitúa en la gama media de tamaño, lo que permite ejecutarlo en GPUs de consumo con cuantizaciones agresivas. Su propósito principal es convertir imágenes de documentos y páginas PDF en texto estructurado (Markdown, HTML, JSON), preservando la disposición espacial del contenido original, lo que lo hace útil para pipelines de digitalización documental.

La relevancia de esta versión radica en su formato GGUF con múltiples niveles de cuantización (desde Q2_K de 2,1 GB hasta f16 de 8,8 GB), lo que democratiza el despliegue local de un modelo OCR multimodal sin necesidad de infraestructura de datacenter. El repo acumula 1231 descargas desde su creación el 3 de noviembre de 2026.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal con soporte MTP; detalles de la arquitectura base no especificados en la información disponible) |
| Parámetros totales | 4.326.350.848 (~4,3 mil millones) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; además mmproj-Q8_0 y mmproj-f16 para el componente multimodal |
| Idiomas soportados | en (inglés) |
| Licencia | openrail (OpenRAIL; enlace a la licencia del modelo base datalab-to/chandra-ocr-2) |
| Formato de pesos | GGUF (safetensors en el modelo base original) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base. Se trata de un modelo multimodal (el repo incluye ficheros mmproj, el componente de proyección visual de llama.cpp), orientado a tareas de OCR y comprensión de documentos, con soporte de etiquetas MTP (multi-token prediction) y capacidades de generación de Markdown, HTML y JSON. El modelo base es prithivMLmods/chandra-ocr-2-MTP-Repacked, a su vez derivado de datalab-to/chandra-ocr-2.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas más allá de la propia naturaleza multimodal y la orientación a la extracción estructurada de documentos. La cuantización estática aplicada por mradermacher (quantize_version 2, output_tensor_quantised 1) es el único proceso técnico documentado en esta ficha.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) sobre imágenes de documentos y páginas PDF.
- Conversión de documentos a Markdown preservando estructura y layout.
- Generación de salida en HTML y JSON, útil para extracción estructurada de datos.
- Comprensión de layout documental (disposición de bloques, tablas y elementos de página).
- Procesamiento multimodal: acepta entrada de imagen además de texto (ficheros mmproj incluidos).
- Soporte de generación de texto conversacional (etiqueta conversational).
- Compatible con text-generation-inference y llama-cli.
- Capacidades multilingües: limitadas al inglés según la model card.
- No se documentan capacidades de tool calling, function calling ni razonamiento multi-paso en la información disponible.

## Casos de uso

- Digitalización masiva de PDF escaneados: el modelo convierte páginas en Markdown estructurado, lo que permite indexar el contenido en sistemas de búsqueda o RAG sin trabajo manual de transcripción.
- Extracción de tablas y datos financieros: la salida en JSON facilita el parseo automático de facturas, extractos y formularios hacia bases de datos.
- Construcción de pipelines de RAG documental: al preservar el layout y generar Markdown limpio, el texto resultante se trocea y embebe con mayor coherencia semántica que un OCR plano.
- Archivística y preservación digital: conversión de fondos documentales históricos a formatos legibles por máquina manteniendo la estructura original.
- Automatización de back-office: procesamiento local de documentos confidenciales sin enviar datos a servicios en la nube, gracias a las cuantizaciones Q4 que caben en GPU de consumo.
- Generación de documentación técnica a partir de capturas: conversión de manuales o capturas de pantalla en Markdown listo para wikis y repositorios.
- Prototipado en estaciones de trabajo: con la cuantización Q4_K_M (2,9 GB) el modelo se ejecuta en GPUs consumer para pruebas de concepto de OCR sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,1 GB (Q2_K) hasta 8,8 GB (f16) para los pesos, más el componente mmproj (0,5-0,8 GB) y el overhead de contexto de llama.cpp.
- Cuantizaciones recomendadas para GPU consumer: Q4_K_S o Q4_K_M (2,7-2,9 GB), etiquetadas como "fast, recommended" por el autor de la cuantización.
- GPU recomendadas: tarjetas con 6-8 GB de VRAM para cuantizaciones Q4-Q5 (RTX 3060, RTX 4060, RTX 2070); 12-16 GB para Q8_0 o f16 (RTX 4070 Ti, RTX 4080, RTX 4090); A100/H100 solo necesarias para despliegues de alto throughput con f16.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas con 6 GB o más usando Q4_K_M o inferiores.
- Opciones de despliegue: llama.cpp (llama-cli), Ollama (importando el GGUF), text-generation-inference (según etiquetas), y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| chandra-ocr-2-MTP-Repacked-GGUF | ~4,3 B | no disponible | GGUF | OpenRAIL | OCR multimodal, cuantizado para local |
| prithivMLmods/chandra-ocr-2-MTP-Repacked | ~4,3 B | no disponible | safetensors | OpenRAIL | Modelo base sin cuantizar |
| datalab-to/chandra-ocr-2 | no disponible | no disponible | no disponible | OpenRAIL | Modelo original de datalab-to |

No se dispone de datos de rendimiento comparado con otros modelos OCR (como Donut, Nougat o TrOCR) en la información proporcionada.

## Limitaciones y advertencias

- Idioma: el modelo solo declara soporte de inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Licencia OpenRAIL: incluye restricciones de uso (cláusulas de uso aceptable) que deben revisarse antes de un despliegue comercial; no es una licencia permisiva tipo Apache o MIT.
- Riesgo de alucinación: como modelo generativo, puede producir texto plausible pero incorrecto en documentos con baja calidad de imagen o layouts atípicos.
- Las cuantizaciones Q2_K y Q3_K pueden degradar notablemente la precisión del OCR; el autor recomienda Q4 o superiores para uso real.
- No se documentan capacidades de tool calling ni agentes; no debe asumirse su disponibilidad.
- El modelo es una cuantización de terceros: la responsabilidad sobre la calidad final recae en el modelo base, no en el cuantizador.
- No hay datos publicados de benchmarks que permitan validar la calidad del OCR frente a alternativas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/chandra-ocr-2-MTP-Repacked-GGUF
- Modelo base repackado: https://huggingface.co/prithivMLmods/chandra-ocr-2-MTP-Repacked
- Modelo original: https://huggingface.co/datalab-to/chandra-ocr-2
- Licencia: https://huggingface.co/datalab-to/chandra-ocr-2/blob/main/LICENSE
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/chandra-ocr-2-MTP-Repacked-i1-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#chandra-ocr-2-MTP-Repacked-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Referencia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
