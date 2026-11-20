# finanfa-tech/finanfa-ocr

## Resumen

Finanfa OCR es un pipeline de reconocimiento óptico de caracteres (OCR) y análisis de documentos publicado por Finanfa Tech, un proyecto de visión e inteligencia artificial con sede en Benín y África Occidental. El modelo convierte documentos escaneados, fotografías, formularios administrativos y archivos PDF en Markdown estructurado, texto plano o JSON con cajas delimitadoras, y su rasgo diferencial es que funciona íntegramente en CPU, sin necesidad de GPU. Se distribuye como un conjunto de modelos ONNX compactos que suman aproximadamente 97 MB (0,1 GB de repositorio).

El sistema está diseñado para escenarios de recursos limitados o de soberanía tecnológica, donde el despliegue en servidores sin aceleradores es la norma. Cubre escritura impresa y manuscrita, corrige automáticamente la orientación de páginas inclinadas hasta 45 grados y reconstruye la jerarquía lógica de bloques (títulos, listas, columnas múltiples, tablas, notas al pie). Declara soporte para más de 80 idiomas, con especial énfasis en lenguas africanas como yoruba, hausa y suajili.

La relevancia actual del modelo reside en su enfoque de eficiencia: según la model card, alcanza unas 45 páginas por segundo en un servidor de 32 núcleos y unos 200 ms por página en un procesador de 4 núcleos, con una huella de memoria muy reducida. La licencia OpenRAIL-M permite uso comercial con restricciones de uso responsable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline multi-etapa de modelos ONNX (deteccion, orientacion, ordenacion, reconocimiento y modulo matematico) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuye en formato ONNX) |
| Idiomas soportados | Mas de 80: en, fr, yo, ha, sw, ar, de, es, it, pt, nl, pl, cs, sk, ro, hu, sv, da, no, fi, tr, az, uz, vi, id, ms, ru, uk, bg, sr, el, zh, ja, ko, fa, ur, ps, he, hi, mr, ne, bn, ta, te, kn, ml, gu, pa, or, th, lo, km, my, si, ka, hy, am |
| Licencia | OpenRAIL-M |
| Formato de pesos | ONNX (det.onnx, orient.onnx, order.onnx, rec.onnx, math_enc.onnx, math_dec_step.onnx) y lm.npz para el modelo de lenguaje n-gram |

## Arquitectura y entrenamiento

El modelo no es un transformer único, sino una cadena de etapas especializadas que se ejecutan secuencialmente sobre cada imagen o página de PDF. La primera etapa, `det.onnx`, detecta zonas de texto y segmenta líneas. La segunda, `orient.onnx`, detecta y corrige la orientación en incrementos de 90 grados (0, 90, 180, 270) y admite páginas inclinadas hasta 45 grados. La tercera, `order.onnx`, establece el orden lógico de lectura, incluyendo documentos con varias columnas. La cuarta, `rec.onnx` junto con `lm.npz`, realiza el reconocimiento textual con corrección mediante un modelo de lenguaje n-gram; la model card menciona variantes de reconocimiento para escrituras latinas, CJK, RTL y "World". Finalmente, `math_enc.onnx` y `math_dec_step.onnx` constituyen un módulo de extracción y conversión de fórmulas matemáticas.

La model card indica que la arquitectura base deriva de los trabajos de optimización ONNX de Datalab (`datalab-to/indra-ocr`), aunque no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. Tampoco se especifica el vocabulario exacto del reconocedor, más allá de que se expone en `meta.json` mediante la clave `vocab`. La innovación técnica destacable es la compactación del pipeline completo en alrededor de 97 MB y su ejecución exclusiva en CPU, con corrección de orientación y ordenación de lectura integradas.

## Capacidades

- Reconocimiento de texto impreso y manuscrito en documentos escaneados, fotografías, recibos y formularios rellenados a mano.
- Conversión de documentos a Markdown estructurado, texto plano o JSON con cajas delimitadoras.
- Detección y corrección automática de orientación de página (0, 90, 180 y 270 grados) y de inclinaciones de hasta 45 grados.
- Comprensión de maquetación: jerarquía de bloques, títulos, listas, columnas múltiples, tablas y notas al pie.
- Extracción y conversión de fórmulas matemáticas y científicas mediante módulos dedicados.
- Soporte multilingüe de más de 80 idiomas, con cobertura de escrituras latinas, semíticas, CJK, índicas y de lenguas africanas como yoruba, hausa y suajili.
- Procesamiento de PDF página a página.
- Ejecución en CPU sin GPU, con dependencias mínimas (onnxruntime, numpy, pillow).
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso; el modelo es exclusivamente de imagen a texto.

## Casos de uso

- Digitalización masiva de archivos administrativos: el pipeline convierte lotes de PDF escaneados en Markdown o JSON estructurado, y su rendimiento de hasta 45 páginas por segundo en 32 núcleos permite procesar fondos documentales completos en servidores sin GPU.
- Extracción de datos de formularios manuscritos: la capacidad de reconocer escritura a mano y su corrección de orientación lo hacen adecuado para digitalizar impresos rellenados a mano en oficinas públicas, con salida JSON con cajas delimitadoras para su posterior validación.
- Procesamiento de facturas y recibos: la detección de tablas y la ordenación lógica de lectura permiten extraer importes, fechas y conceptos de documentos comerciales, integrándose en flujos de contabilidad automatizada.
- Digitalización de documentación multilingüe en África Occidental: el soporte explícito de yoruba, hausa y suajili, junto con francés, inglés, árabe y portugués, cubre los principales idiomas de la región sin necesidad de modelos separados.
- Conversión de artículos científicos a Markdown: el módulo matemático extrae y convierte fórmulas, lo que facilita la migración de publicaciones en PDF a repositorios de documentación o wikis técnicas.
- Digitalización de libros y prensa con maquetación compleja: la etapa de ordenación resuelve la lectura de varias columnas y la jerarquía de títulos, listas y notas al pie, produciendo Markdown fiel a la estructura original.
- Despliegue en entornos con recursos limitados: al ejecutarse solo en CPU con un pipeline de unos 97 MB, puede instalarse en servidores modestos, contenedores o equipos de campo sin acelerador.

## Benchmarks y rendimiento

La model card publica datos de rendimiento (páginas por segundo) frente a otros motores OCR, no benchmarks de precisión como MMLU o HumanEval, que no aplican a esta tarea.

| Motor OCR | 4 nucleos | 8 nucleos | 16 nucleos | 32 nucleos (max) |
|---|---|---|---|---|
| Finanfa OCR | 6,5 p/s | 12,4 p/s | 24,5 p/s | 45,0 p/s |
| Indra OCR | 6,2 p/s | 11,9 p/s | 23,7 p/s | 43,9 p/s |
| PaddleOCR PP-OCRv6 | 0,65 p/s | 1,24 p/s | 2,42 p/s | 4,28 p/s |
| Tesseract 5 | 0,78 p/s | 1,37 p/s | 2,27 p/s | 2,92 p/s |
| PaddleOCR PP-StructureV3* | <= 0,02 p/s | <= 0,04 p/s | <= 0,09 p/s | <= 0,18 p/s |

La model card también afirma una latencia de aproximadamente 200 ms por página en un procesador estándar de 4 núcleos. No se han publicado resultados de precisión (exactitud de reconocimiento, CER/WER) en la información disponible.

## Requisitos de hardware

- VRAM: no requiere GPU; el pipeline está diseñado para ejecutarse en CPU. La huella del modelo es de aproximadamente 97 MB en disco.
- GPU recomendadas: no aplica; no se documenta soporte de aceleración por GPU.
- Cabe en cualquier equipo: al ser un pipeline ONNX de unos 97 MB y ejecutarse en CPU, puede correr en portátiles, servidores modestos, contenedores y equipos de campo.
- CPU: la model card reporta buen escalado desde 4 núcleos (6,5 p/s) hasta 32 núcleos (45,0 p/s).
- Opciones de despliegue: ONNX Runtime con Python (`pip install onnxruntime numpy pillow`); la descarga se realiza con `hf download finanfa-tech/finanfa-ocr --local-dir finanfa-ocr`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no son aplicables a este tipo de pipeline.
- Latencia y throughput: aproximadamente 200 ms por página en 4 núcleos y hasta 45 páginas por segundo en 32 núcleos, según la model card.

## Comparativa con modelos similares

| Modelo | Tipo | Ejecucion | Idiomas | Licencia | Rendimiento (32 nucleos) |
|---|---|---|---|---|---|
| Finanfa OCR | Pipeline OCR + layout + matematicas | CPU (ONNX) | Mas de 80 | OpenRAIL-M | 45,0 p/s |
| Indra OCR (datalab-to) | Pipeline OCR | CPU (ONNX) | no disponible | no disponible | 43,9 p/s |
| PaddleOCR PP-OCRv6 | OCR | CPU/GPU | Amplio | Apache 2.0 (segun proyecto) | 4,28 p/s |
| Tesseract 5 | OCR clasico | CPU | Amplio | Apache 2.0 | 2,92 p/s |
| PaddleOCR PP-StructureV3 | OCR + estructura | CPU/GPU | Amplio | Apache 2.0 (segun proyecto) | <= 0,18 p/s |

Finanfa OCR declara ser una derivación de los trabajos ONNX de Datalab (Indra OCR), por lo que su rendimiento es muy cercano al de este último. Su ventaja frente a PaddleOCR y Tesseract es el throughput en CPU y la integración de layout y matemáticas en un único pipeline; su desventaja documentada es la ausencia de datos de precisión comparables. Los datos de licencia de PaddleOCR y Tesseract no provienen de la información proporcionada y deben verificarse en sus repositorios.

## Limitaciones y advertencias

- No se han publicado métricas de precisión (CER/WER) ni evaluaciones por idioma; el rendimiento declarado es solo de velocidad, no de exactitud.
- La model card no detalla el dataset de entrenamiento ni los sesgos conocidos; el rendimiento puede variar notablemente entre escrituras y calidades de escaneo.
- El soporte de más de 80 idiomas se declara de forma agregada; no hay desglose de calidad por idioma, por lo que lenguas con pocos recursos podrían tener una precisión inferior.
- La licencia OpenRAIL-M impone restricciones de uso responsable y puede limitar ciertos usos comerciales o militares; es necesario revisar el archivo `LICENSE` antes de un despliegue en producción.
- El modelo no ofrece tool calling, agentes ni razonamiento; es exclusivamente un sistema de imagen a texto y no debe emplearse para tareas generativas.
- La corrección de orientación se limita a incrementos de 90 grados y a inclinaciones de hasta 45 grados; documentos con distorsiones de perspectiva severas pueden degradar el resultado.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica una validación comunitaria aún inexistente.
- La fecha de creación indicada (2026-11-20) es posterior a la fecha habitual de publicación; conviene verificar la vigencia de los artefactos antes de integrarlos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/finanfa-tech/finanfa-ocr
- Perfil del autor: https://huggingface.co/finanfa-tech
- Repositorio base citado (Datalab, Indra OCR): https://huggingface.co/datalab-to/indra-ocr
- No se han encontrado en la información proporcionada otros enlaces a papers, blogs, repositorios o demos.
