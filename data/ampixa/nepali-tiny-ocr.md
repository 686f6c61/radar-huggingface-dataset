# ampixa/nepali-tiny-ocr

## Resumen

sanoOCR (anteriormente Nepali Tiny OCR) es un sistema de reconocimiento óptico de caracteres (OCR) desarrollado por Ampixa para texto impreso y manuscrito en nepalí (escritura devanagari) e inglés. Su propuesta central es la eficiencia extrema: el sistema completo, incluyendo localizador de líneas, lector y modelo de lenguaje, suma menos de 0,9 millones de parámetros de red (873.889 en la versión v0.2), funciona íntegramente en CPU, no requiere GPU ni PyTorch y se distribuye en formato ONNX.

El modelo se entrena desde cero, sin reutilizar pesos de otros sistemas como Indra, y se organiza en dos carpetas: v0.1, orientada a texto impreso (escaneos, periódicos, PDFs), y v0.2, que añade manuscrito, cuadernos y fotografías de móvil manteniendo la calidad de impresión. Es una vista previa de investigación (research preview) publicada en noviembre de 2026, con licencia interna que restringe su uso.

Su relevancia radica en que demuestra que un OCR de menos de un millón de parámetros puede superar a modelos de visión-lenguaje de 686M a 4.400M de parámetros en escritura manuscrita devanagari, un dominio donde los grandes modelos fallan sistemáticamente produciendo caracteres de escrituras incorrectas o bucles de repetición.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline OCR en cascada: localizador de líneas, lector y modelo de lenguaje de caracteres (7-gram); redes neuronales en ONNX |
| Parametros totales | 873.889 (v0.2); el modelo de lenguaje `lm.npz` es una tabla de búsqueda y no se cuenta como red |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | nepalí (devanagari) e inglés |
| Licencia | other / internal (licencia interna del autor; restricciones no detalladas) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El sistema no es un transformer monolítico sino una cascada de componentes: un localizador de líneas, un lector de texto y un modelo de lenguaje opcional de 7-gramas de caracteres (`lm.npz`) implementado como tabla de búsqueda. Todo el conjunto se ejecuta sobre ONNX sin dependencia de PyTorch, lo que permite inferencia en CPU. El modelo se entrena desde cero, sin incorporar pesos de Indra ni de otros sistemas OCR.

Los datos de entrenamiento no se detallan en la información disponible (número de tokens, composición del dataset, uso de RLHF o DPO). La model card menciona que los conjuntos de test están bloqueados y nunca se usaron para entrenamiento ni ajuste, e indica que la versión v0.2 incorpora datos de práctica h1 cuyas páginas de entrenamiento podrían solaparse con el conjunto de evaluación h1, lo que conviene tener en cuenta al interpretar esa métrica.

## Capacidades

- OCR de texto impreso en nepalí (devanagari) e inglés: escaneos, periódicos y documentos.
- OCR de escritura manuscrita en devanagari e inglés, incluyendo cuadernos y fotografías de móvil (v0.2).
- Extracción de texto de PDFs a través de su capa de texto.
- Ejecución en CPU sin GPU ni PyTorch, con pesos ONNX.
- Localización de líneas de texto como etapa previa al reconocimiento.
- Modelo de lenguaje de caracteres opcional para corrección o desambiguación.
- No se documentan capacidades de tool calling, agentes, visión general, audio ni modo de razonamiento extendido.

## Casos de uso

- Digitalización de prensa nepalí: el sistema procesa líneas de periódicos como Gorkhapatra con un CER del 0,37% (v0.1), adecuado para crear archivos searchables de hemerotecas con hardware de bajo coste.
- Extracción de texto de PDFs administrativos: al aprovechar la capa de texto del PDF y ejecutarse en CPU, puede integrarse en servidores sin GPU para indexar documentación oficial en nepalí e inglés.
- Reconocimiento de notas manuscritas en movilidad: v0.2 obtiene un CER del 10,25% en fotografías reales de móvil de escritura a mano (610 líneas, 27 páginas), lo que permite aplicaciones de captura de cuadernos desde el teléfono.
- Procesamiento por lotes en entornos con recursos limitados: con menos de 0,9M de parámetros y ONNX, cabe en dispositivos embebidos o servidores modestos donde desplegar un VLM de miles de millones de parámetros sería inviable.
- Archivado de manuscritos históricos en devanagari: el modelo mantiene el menor error en conjuntos de palabras manuscritas (IndicScan: 15,4% CER frente a 25,1% de PP-OCRv5 y más del 45% de Surya 2), útil para proyectos de preservación documental.
- Preprocesado para pipelines de NLP en nepalí: al generar transcripciones fiables de documentos impresos, sirve como primera etapa antes de tareas de traducción, búsqueda o análisis posteriores.
- Evaluación comparativa de sistemas OCR: su reducido tamaño y su batería de benchmarks publicados permiten usarlo como línea base ligera en estudios de reconocimiento de escritura devanagari.

## Benchmarks y rendimiento

Resultados medidos el 24 de noviembre de 2026 sobre los mismos ítems y con un único evaluador (CER % / WER %; menor es mejor):

| Sistema | Parámetros | Manuscrito devanagari, IndicScan (835) | Manuscrito nepalí, h1 (871) | Documentos nepalí reales Sarvam (437) | Documentos ingleses reales Sarvam (299) |
|---|---|---|---|---|---|
| sanoOCR v0.2 | 873.889 | 15,4 / 44,4 | 13,6 / 34,8 | 4,71 / 15,2 | 6,05 / 15,7 |
| PP-OCRv5 Devanagari mobile | ~2,0M (rec) | 25,1 / 64,4 | 40,7 / 81,3 | 11,7 / 39,4 | 3,86 / 9,9 |
| Indra OCR 1.1.2 | 3,61M | 96,4 / 100,4 | 81,3 / 97,1 | 27,3 / 44,8 | 4,88 / 10,6 |
| Indra OCR 0.3.2 | 2,19M | 97,0 / 101,4 | 81,0 / 97,8 | 24,8 / 65,6 | 8,54 / 22,0 |
| Tesseract 4.1.1 (nep/hin/eng) | no contabilizado | 83,3 / 122,5 | 80,6 / 104,0 | 4,32 / 11,8 | 4,48 / 11,5 |
| Surya 2 | 686M | 45,2 / 74,9 | 166,1 / 209,4 | no ejecutado | no ejecutado |
| PaddleOCR-VL-1.6 | 906M | 110,9 / 105,9 | 143,1 / 104,4 | 55,4 / 86,2 | 1,49 / 6,3 |
| GLM-OCR | 1.107M | 124,3 / 133,3 | 137,9 / 134,4 | 104,3 / 128,6 | 1,43 / 6,4 |
| Qwen3-VL-4B-Instruct | 4.438M | no ejecutado | no ejecutado | 16,05 / 43,2 | 1,24 / 4,2 |

Resultados adicionales sobre conjuntos de test bloqueados (sistema completo):

| Conjunto de test | v0.1 CER / WER | v0.2 CER / WER | Indra OCR 0.3.2 (2,19M) |
|---|---|---|---|
| Documentos nepalí reales Sarvam (437 bloques) | 4,76% / 15,5% | 4,92% / 16,6% | 21,59% / 66,1% |
| Documentos ingleses reales Sarvam (299 bloques) | 6,34% / 16,7% | 6,23% | 7,21% / 20,3% |
| Líneas de periódico Gorkhapatra | 0,37% | 0,35% | no disponible |
| Líneas manuscritas (92 escritores no vistos) | 5,28% | 5,33% | no disponible |
| Fotografías reales de manuscritos (610 líneas, 27 páginas) | 16,71% / 61,0% | 10,25% / 32,9% | no disponible |

## Requisitos de hardware

- VRAM: no requiere GPU; el sistema completo son menos de 0,9M de parámetros de red y el repositorio pesa 0,2 GB.
- GPU recomendadas: ninguna necesaria. Las pruebas se ejecutaron en CPU; los modelos comparativos grandes se corrieron en Tesla T4 y Apple silicon.
- GPU de consumo: irrelevante, ya que el diseño es CPU-first; cabe en cualquier equipo con CPU moderna.
- Opciones de despliegue: ONNX Runtime como vía principal; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Manuscrito devanagari (CER) | Nepalí impreso (CER) | Licencia |
|---|---|---|---|---|---|
| sanoOCR v0.2 | 873.889 | ne, en | 15,4 (IndicScan) | 4,71 | internal (restrictiva) |
| Indra OCR 1.1.2 | 3,61M | ne, en | 96,4 | 27,3 | OpenRAIL-M modificada (cláusula de uso competitivo) |
| PP-OCRv5 Devanagari mobile | ~2,0M (rec) | devanagari, en | 25,1 | 11,7 | no disponible |
| Tesseract 4.1.1 | no contabilizado | nep/hin/eng | 83,3 | 4,32 | Apache 2.0 (no confirmado en la información) |
| GLM-OCR | 1.107M | multilingüe | 124,3 | 104,3 | no disponible |

sanoOCR destaca en manuscrito devanagari con una ventaja de 3 a 10 veces menos error que los grandes modelos, pero queda por detrás de Tesseract en nepalí impreso (4,71% frente a 4,32%) y muy por detrás de los VLM grandes en inglés impreso (6,05% frente a 1,24-1,49%).

## Limitaciones y advertencias

- Licencia interna (`internal`): no se detallan los términos, por lo que el uso comercial requiere consultar al autor antes de desplegarlo en producción.
- Rendimiento inferior en inglés impreso: los VLM grandes son aproximadamente 4 veces mejores (1,2-1,5% frente a 6,05% CER).
- Tesseract supera ligeramente a sanoOCR en nepalí impreso (4,32% frente a 4,71% CER), aunque sanoOCR gana en número de bloques (192 frente a 167, con 78 empates).
- Posible solapamiento de datos en el conjunto h1: la propia model card advierte que las páginas de entrenamiento de v0.2 podrían coincidir con ese conjunto, por lo que IndicScan es la comparación más limpia.
- Los conjuntos de manuscrito de la model card (610 líneas de móvil y 92 escritores) no pudieron re-ejecutarse, por lo que esas cifras no están verificadas de forma independiente.
- En un conjunto plateado de 40 páginas reales de fotos de móvil (referencias no revisadas), el CER sube al 29,6%, lo que indica degradación en condiciones reales de captura.
- Riesgo de alucinación y bucles: aunque el modelo es pequeño, la model card señala que los grandes VLM comparados producen bucles y escrituras incorrectas; no se documenta el comportamiento de sanoOCR en dominios fuera de distribución.
- Sesgos y cobertura: solo nepalí e inglés; no se documentan sesgos por escritor, género o tipo de letra.
- No se comparó con Chandra OCR 2, Google Cloud Vision ni Azure, por lo que su posición frente a servicios comerciales es desconocida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ampixa/nepali-tiny-ocr
- Repositorio del proyecto con benchmarks (`bench/`): Ampixa/sanoOCR (referenciado en la model card; URL exacta no disponible)
