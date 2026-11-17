# SandLogicTechnologies/LightOnOCR-3-4B-GGUF

## Resumen

LightOnOCR-3-4B es un modelo de visión-lenguaje de extremo a extremo especializado en OCR de documentos, desarrollado por LightOn. Convierte imágenes de páginas en markdown estructurado, incluyendo layout, tablas, formularios, gráficos y notación matemática, sustituyendo una pipeline de varios componentes (detección de layout, OCR y extracción de tablas) por un único modelo. Está construido sobre la arquitectura Qwen3.5 y cuenta con aproximadamente 4.200 millones de parámetros. La versión aquí descrita es una conversión GGUF publicada por SandLogicTechnologies para inferencia local.

El modelo opera en dos modos: transcripción, que devuelve el texto completo de la página en markdown, y grounding, que añade a cada bloque una etiqueta de tipo y una caja delimitadora en coordenadas normalizadas de 0 a 1000. En modo grounding también describe imágenes brevemente y extrae los puntos de datos de gráficos como tablas HTML.

Esta ficha cubre la distribución GGUF cuantizada, que reduce el peso del modelo desde los 7,85 GB de la conversión F16 hasta 2,05 GB en IQ3_M, permitiendo ejecutar OCR de documentos en hardware de consumo y en servidores on-premise sin enviar documentos a APIs externas. La licencia Apache 2.0 facilita su integración comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje basada en Qwen3.5 (transformer multimodal imagen-texto) |
| Parametros totales | 4.205.751.296 (aprox. 4B; la página original indica 5B) |
| Parametros activos | no disponible (no es MoE según la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ3_M, IQ4_NL, IQ4_XS, Q6_K (GGUF); mmproj en F16 |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); proyector multimodal mmproj en F16 |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de visión-lenguaje basada en Qwen3.5, con un codificador visual acoplado a un decodificador de lenguaje mediante un proyector multimodal (mmproj). El diseño es de extremo a extremo: una sola pasada produce texto, layout y datos visuales, en lugar de encadenar etapas separadas de detección de layout, OCR y extracción de tablas. La familia LightOnOCR-3 incluye variantes de menor tamaño, y la de 4B es la más grande y precisa según el autor.

No se han publicado en la información disponible detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO. La model card original describe únicamente el diseño funcional: modo transcripción compatible con LightOnOCR-2 (prompt vacío) y modo grounding que emite etiqueta y caja delimitadora por bloque en coordenadas normalizadas 0-1000, descripción breve de imágenes y tabla HTML con los puntos de datos de gráficos. La conversión GGUF preserva el proyector multimodal en F16 y cuantiza solo los pesos del modelo de lenguaje.

## Capacidades

- Transcripción de documentos completos a markdown en una sola pasada, con prompt vacío.
- Grounding visual: etiqueta de tipo y caja delimitadora por bloque en coordenadas normalizadas 0-1000.
- Comprensión de layout: columnas múltiples, tablas, formularios, recibos y bloques de imagen.
- Descripción breve de imágenes incrustadas en la página.
- Extracción de puntos de datos de gráficos como tablas HTML estructuradas.
- Reconocimiento de fórmulas matemáticas y bloques de código con su etiqueta de bloque.
- Procesamiento de documentos escaneados y fotografías de páginas.
- Inferencia local mediante llama.cpp (llama-mtmd-cli) con el proyector mmproj.
- Capacidad multilingüe limitada al inglés según los metadatos del repositorio.
- No se documenta soporte de tool calling ni de razonamiento multi-paso en la información disponible.

## Casos de uso

- Procesamiento de facturas y recibos: extracción de líneas de detalle, totales y campos mediante el modo grounding, que devuelve cada bloque con su tipo y coordenadas para mapear campos a un esquema de datos.
- Digitalización de documentos: conversión de informes, contratos y formularios escaneados a markdown buscable, apto para indexación posterior.
- Pipelines de RAG: generación de texto con etiquetas de layout, descripciones de imágenes y datos de gráficos a partir de páginas de documento, de modo que el recuperador y el generador dispongan de contexto estructurado.
- Extracción de tablas y gráficos: volcado de tablas y series de datos de gráficos a tablas HTML para análisis con herramientas de datos.
- Accesibilidad: generación de texto y descripciones de imágenes de documentos visuales para lectores de pantalla y otras herramientas de asistencia.
- OCR local de alto volumen: ejecución en máquinas locales o servidores on-premise con cuantizaciones IQ4_NL o IQ4_XS, sin enviar documentos a APIs externas, útil en entornos con requisitos de confidencialidad.
- Preprocesado por lotes en CI/CD documental: uso de IQ3_M en dispositivos con poca memoria para triaje y extracción rápida, reservando Q6_K para documentos con tablas densas o cifras financieras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantización. IQ3_M ocupa 2,05 GB, IQ4_XS 2,39 GB, IQ4_NL 2,47 GB y Q6_K 3,23 GB de pesos; hay que sumar el proyector multimodal F16 y el coste del contexto y de las activaciones, por lo que conviene reservar margen adicional sobre el tamaño del archivo.
- GPU recomendadas: no especificadas por el autor. Por tamaño, las cuantizaciones de 3 y 4 bits caben en GPUs de consumo con 8 GB o más; Q6_K requiere al menos 6-8 GB libres según contexto.
- Cabe en GPU de consumo: sí, en tarjetas tipo RTX 3060/4060 con 8 GB o superiores para las variantes de 4 bits; no se dispone de cifras oficiales de latencia ni throughput.
- Opciones de despliegue: llama.cpp mediante llama-mtmd-cli con el archivo mmproj; los tags del repositorio indican compatibilidad con endpoints.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LightOnOCR-3-4B (esta ficha) | aprox. 4B | no disponible | Apache 2.0 | GGUF | OCR end-to-end con grounding y extracción de gráficos |
| LightOnOCR-3 (variantes menores de la familia) | no disponible | no disponible | Apache 2.0 | no disponible | Misma familia; la variante 4B es la más precisa según el autor |
| LightOnOCR-2 | no disponible | no disponible | no disponible | no disponible | Predecesor; el modo transcripción es compatible sin cambios |
| Alternativas OCR de la competencia | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

## Limitaciones y advertencias

- El único idioma declarado es el inglés; el rendimiento en otros idiomas no está documentado.
- Las cuantizaciones de 3 y 4 bits introducen mayor riesgo de error en tablas densas, números pequeños y fórmulas complejas; el autor recomienda revisar las salidas en cifras financieras o legales antes de usarlas en producción.
- Riesgo de alucinación inherente a los modelos generativos: pueden aparecer caracteres o cifras inventadas en regiones de baja calidad, por lo que se recomienda validación posterior en flujos críticos.
- La longitud de contexto no está publicada, lo que dificulta planificar páginas de gran densidad o documentos multipágina.
- Los sesgos específicos del modelo no están documentados en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero conviene conservar los avisos de atribución correspondientes.
- El repositorio GGUF tiene 0 descargas y 0 likes en el momento de la consulta; es una conversión de terceros, no la distribución oficial de LightOn.

## Enlaces

- Repositorio GGUF: https://huggingface.co/SandLogicTechnologies/LightOnOCR-3-4B-GGUF
- Modelo base: https://huggingface.co/lightonai/LightOnOCR-3-4B
