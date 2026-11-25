# Jay2685/indra-ocr

## Resumen

Indra OCR 1.2.0 es un modelo de reconocimiento óptico de caracteres (OCR) orientado a la extracción de contenido estructurado de PDFs e imágenes, diseñado para ejecutarse en CPU. Lo desarrolla Jay2685 sobre el proyecto Indra de Datalab, y se distribuye empaquetado con la librería `indra-ocr==1.2.0`. Su propuesta diferencial es el procesamiento local sin GPU, con lectores especializados por tipo de escritura, análisis de maquetación, extracción de tablas y reconocimiento de fórmulas matemáticas en LaTeX en línea.

El modelo es deliberadamente compacto: 1.250.566 parámetros reales según los pesos en safetensors, con un repositorio de 0,1 GB. Se distribuye en formato ONNX para inferencia vía `onnxruntime`, lo que facilita el despliegue en entornos sin aceleradores y su integración en pipelines de documentación. La ventana de contexto, los idiomas soportados y los detalles de entrenamiento no están documentados en la información disponible.

Su relevancia actual radica en el nicho de digitalización documental a gran escala: muchas organizaciones necesitan procesar archivos PDF y escaneos sin depender de APIs externas ni de hardware especializado. El modelo reporta 78,9 en OmniParseBench (2.937 páginas, 16.288 tests) con el lector matemático activado, y 71,6 con él desactivado, lo que sitúa su rendimiento en un rango útil para tareas de parsing documental generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (empaquetado ONNX, pipeline image-to-text) |
| Parametros totales | 1.250.566 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX y safetensors) |
| Idiomas soportados | no disponible |
| Licencia | datalab-openrail-m (términos en LICENSE; código Apache-2.0) |
| Formato de pesos | ONNX, safetensors |
| Libreria de inferencia | onnxruntime |
| Tamano del repositorio | 0,1 GB |
| Hardware objetivo | CPU |

## Arquitectura y entrenamiento

No se dispone de información pública sobre la arquitectura interna del modelo en la documentación proporcionada. El repositorio lo etiqueta como `image-to-text` y lo empaqueta para `onnxruntime`, con pesos en ONNX y safetensors. La model card describe un sistema compuesto por "lectores específicos por escritura" (script-specific readers), módulos de análisis de maquetación, extracción de tablas y un lector de matemáticas que emite LaTeX en línea. El reconocimiento matemático está activado por defecto y puede desactivarse con `load(math=False)`.

Tampoco se detallan el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. La única información de evaluación es el resultado agregado en OmniParseBench (versión 1.7.0), que comprende 2.937 páginas y 16.288 tests, con una puntuación de 78,9 con matemáticas activadas y 71,6 desactivadas. La model card advierte que desactivar el lector matemático no filtra los tests etiquetados como matemáticos, por lo que la comparación entre ambas configuraciones no es estrictamente equivalente.

## Capacidades

- OCR de PDFs e imágenes con extracción de texto plano.
- Lectores especializados por tipo de escritura (script-specific readers), según la model card.
- Análisis de maquetación (layout) para preservar la estructura del documento.
- Extracción de tablas.
- Reconocimiento de fórmulas matemáticas y conversión a LaTeX en línea, activado por defecto y desactivable.
- Inferencia en CPU mediante `onnxruntime`, sin requerir GPU.
- Integración con la librería `indra-ocr==1.2.0`.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión general, audio ni modo thinking.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Digitalización masiva de archivos PDF en servidores sin GPU: al ejecutarse en CPU con `onnxruntime`, permite procesar lotes de documentos en infraestructura convencional, con un footprint de repositorio de 0,1 GB que simplifica el despliegue en contenedores.
- Extracción de tablas de informes financieros y técnicos: el módulo de tablas del modelo está pensado para recuperar estructuras tabulares de PDFs, un caso habitual en auditoría y análisis de datos donde el texto plano pierde la relación entre columnas.
- Conversión de documentación científica a Markdown con fórmulas: el lector matemático emite LaTeX en línea, lo que facilita migrar papers y apuntes con ecuaciones a wikis, repositorios o bases de conocimiento.
- Procesamiento de documentos escaneados en entornos con requisitos de privacidad: la inferencia local evita enviar PDFs a APIs externas, adecuado para sectores regulados que no pueden externalizar el contenido.
- Enriquecimiento de pipelines RAG sobre corpus documentales: la combinación de layout, tablas y texto permite generar chunks estructurados antes de la indexación, mejorando la recuperación en asistentes sobre documentación interna.
- Automatización de la ingesta documental en back office: integrado vía `indra-ocr`, puede formar parte de flujos que convierten facturas, contratos o formularios en texto estructurado para su posterior validación.
- Extracción de contenido de manuales técnicos y normativa: el análisis de maquetación ayuda a preservar jerarquías de secciones y listas, útil para mantener la estructura al publicar documentación.

## Benchmarks y rendimiento

| Benchmark | Configuracion | Puntuacion |
|---|---|---|
| OmniParseBench 1.7.0 (2.937 paginas, 16.288 tests) | Matemáticas activadas | 78,9 |
| OmniParseBench 1.7.0 (2.937 paginas, 16.288 tests) | Matemáticas desactivadas | 71,6 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card señala que la escritura manual, las tablas complejas y los escaneos degradados siguen siendo difíciles para el modelo.

## Requisitos de hardware

- Inferencia en CPU por diseño; no se especifican requisitos de VRAM porque el modelo está pensado para ejecutarse sin GPU.
- Tamaño del repositorio: 0,1 GB, lo que permite cargarlo en memoria en equipos convencionales.
- GPU recomendadas: no aplica; el pipeline declarado es `onnxruntime` con etiqueta `cpu`.
- Compatibilidad con GPU de consumo: no documentada; el modelo no está orientado a aceleración gráfica.
- Opciones de despliegue: `onnxruntime` con la librería `indra-ocr==1.2.0`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que la comparativa cuantitativa no está disponible. A modo orientativo, Indra OCR se posiciona frente a otros sistemas OCR de propósito general por su ejecución en CPU y su enfoque en parsing estructurado (layout, tablas, matemáticas), pero no se han facilitado métricas de esos sistemas en esta ficha.

| Modelo | Parametros | Contexto | Licencia | Hardware | Datos comparativos |
|---|---|---|---|---|---|
| Indra OCR 1.2.0 | 1.250.566 | no disponible | datalab-openrail-m | CPU | OmniParseBench 78,9 / 71,6 |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La escritura manual, las tablas complejas y los escaneos degradados siguen siendo casos difíciles según la propia model card.
- Desactivar el lector matemático no filtra los tests etiquetados como matemáticos, de modo que la puntuación de 71,6 no equivale a una evaluación limpia sin matemáticas.
- La licencia `datalab-openrail-m` es gratuita para investigación, uso personal y startups que cumplan el umbral de facturación inferior a 5 millones de dólares; el uso comercial fuera de esos términos requiere revisar el LICENSE completo.
- El código del proyecto es Apache-2.0, pero los términos del modelo son distintos y deben consultarse por separado.
- No se documentan idiomas soportados, sesgos conocidos ni tasas de alucinación; en OCR, los errores de reconocimiento pueden propagarse a tareas posteriores.
- No se especifican la longitud de contexto ni el comportamiento con documentos de gran extensión.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de uso en producción.
- La fecha de creación del repositorio (2026-11-25) es posterior a la fecha habitual de referencia; conviene verificar la vigencia y el mantenimiento del proyecto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jay2685/indra-ocr
- Código del proyecto Indra: https://github.com/datalab-to/indra
- Licencia del modelo: incluida en el repositorio como LICENSE (términos datalab-openrail-m)
- OmniParseBench: no se proporciona enlace directo en la información disponible.
