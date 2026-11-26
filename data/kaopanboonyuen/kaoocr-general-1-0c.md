# kaopanboonyuen/KaoOCR-General-1.0c

## Resumen

KaoOCR-General-1.0c es un motor de reconocimiento óptico de caracteres (OCR) especializado en tailandés e inglés, desarrollado por kaopanboonyuen en el marco del GSB AI Lab (Government Savings Bank de Tailandia). El modelo resuelve el problema de la digitalización de texto en documentos tailandeses, incluyendo escritura manuscrita, mediante un pipeline completo que detecta líneas de texto, las recorta, las reconoce con un reconocedor CTC pequeño y reconstruye el resultado en orden de lectura.

La característica diferencial es su diseño CPU-first: se distribuye en formato ONNX y se ejecuta con `CPUExecutionProvider` de ONNX Runtime, sin necesidad de GPU ni de infraestructura de serving. El reconocedor de líneas tiene aproximadamente 0,6 millones de parámetros, lo que lo convierte en un modelo extremadamente ligero frente a los enfoques basados en modelos de lenguaje multimodales.

La versión 1.0c es un fine-tune de KaoOCR-General-1.0a, que a su vez deriva de OpenThai2.1-OCR-Text de iApp Technology con un ajuste adicional sobre escritura manuscrita tailandesa mediante weight blending (WiSE-FT). La relevancia actual reside en ofrecer OCR local, sin dependencias de nube, para un idioma con poca cobertura en herramientas comerciales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline OCR: detector de líneas + reconocedor CTC de líneas (~0,6 M de parámetros) sobre ONNX Runtime |
| Parametros totales | No disponible (el reconocedor de líneas declara ~0,6 M; el detector no especifica) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | No disponible (se distribuye en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | Tailandés (th), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (runtime ONNX Runtime, `CPUExecutionProvider`) |

## Arquitectura y entrenamiento

El modelo no es un transformer generativo, sino un pipeline OCR en cascada compuesto por un detector de líneas de texto, un recortador de las regiones detectadas, un reconocedor CTC de líneas de aproximadamente 0,6 millones de parámetros y un módulo de reconstrucción que ensambla el texto en orden de lectura. El pipeline gestiona orientación de página, corrección de inclinación (deskew) y orden de lectura de forma automática, aceptando imágenes de escaneos o fotografías.

El linaje de entrenamiento parte de OpenThai2.1-OCR-Text de iApp Technology, sobre el que se construyó KaoOCR-General-1.0a mediante un ajuste específico para escritura manuscrita tailandesa con weight blending (WiSE-FT). La versión 1.0c es un fine-tune directo de 1.0a; el paquete `runtime/` y los ficheros de licencia se mantienen sin cambios. Los datos de entrenamiento de la etapa manuscrita de 1.0a provienen de `iapp/thai_handwriting_dataset` y `sivakorn-su/thai-handwriting-textdisjoint-v1`. La model card incluye un TODO explícito del autor indicando que los detalles de entrenamiento de 1.0c (mezcla de datos, épocas, learning rate, hardware y criterio de selección) aún no se han publicado.

## Capacidades

- Reconocimiento de texto impreso en tailandés e inglés a partir de imágenes de página completa (escaneos o fotografías).
- Reconocimiento de escritura manuscrita tailandesa, aunque con mayor dificultad que el texto impreso según el propio autor.
- Detección automática de líneas de texto, con manejo de orientación, corrección de inclinación y orden de lectura.
- Salida en texto plano en orden de lectura o en JSON completo con líneas y cajas delimitadoras (`--json`).
- Procesamiento por lotes de carpetas completas de imágenes (`python inference.py scans/ -o out/`).
- Ejecución exclusiva en CPU mediante ONNX Runtime, sin GPU ni stack de serving.
- Paralelización recomendada por procesos con un hilo cada uno para trabajos por lotes.
- No soporta tablas, Markdown ni parsing de documentos estructurados (para ello el autor remite a KaoOCR-Ledger).
- No dispone de tool calling, razonamiento multi-paso ni capacidades de agente (no es un modelo de lenguaje).

## Casos de uso

- Digitalización de archivos bancarios y financieros: el modelo está desarrollado en el GSB AI Lab y puede procesar escaneos de formularios y documentos en tailandés en infraestructura local sin enviar datos a la nube, lo que encaja con requisitos de privacidad del sector financiero.
- Procesamiento por lotes de expedientes escaneados: la CLI admite carpetas completas (`scans/ -o out/`) y el autor recomienda N procesos con un hilo cada uno, lo que permite paralelizar la digitalización masiva en servidores sin GPU.
- Extracción de texto de fotografías de documentos: el pipeline corrige orientación e inclinación automáticamente, por lo que es adecuado para capturas móviles de recibos, cartas o notas.
- Reconocimiento de notas manuscritas en tailandés: el ajuste específico sobre `thai_handwriting_dataset` lo hace útil para digitalizar apuntes y formularios rellenados a mano, con la advertencia de que el manuscrito sigue siendo más difícil que el impreso.
- Integración en aplicaciones de escritorio o móviles con ONNX Runtime: al ejecutarse solo en CPU y con un reconocedor de ~0,6 M de parámetros, puede embeberse en entornos con recursos limitados.
- Preprocesamiento para pipelines de NLP en tailandés: la salida JSON con líneas y cajas permite alimentar sistemas posteriores de búsqueda, indexación o análisis de documentos.
- Digitalización de documentación bilingüe tailandés-inglés: cubre ambos idiomas en un único motor, útil en organismos públicos y empresas con documentación mixta.

## Benchmarks y rendimiento

Evaluación sobre ThaiOCRBench, tareas de OCR, métrica NLS (1 − distancia de edición normalizada, escala 0-100, mayor es mejor). Resultados del propio autor, no de un leaderboard oficial:

| Modelo | OCR (NLS) | vs referencia |
|---|---:|---:|
| KaoOCR-General-1.0a | 39,2 | +1,9 |
| KaoOCR-General-1.0b | 38,8 | +1,5 |
| KaoOCR-General-1.0c (esta versión) | 39,8 | +2,5 |
| OpenThai2.1-OCR-Text (referencia) | 37,3 | n/a |

La versión 1.0c mejora en +0,6 puntos sobre 1.0a y +1,0 sobre 1.0b. Las tareas de parsing (tablas, gráficos, documentos) se marcan como `n/a` de forma deliberada porque General es un motor exclusivamente OCR y no genera Markdown. No se han publicado resultados de latencia ni throughput.

## Requisitos de hardware

- VRAM: no requiere GPU; el runtime es ONNX Runtime con `CPUExecutionProvider`.
- GPU recomendadas: ninguna; el diseño es CPU-only.
- Cabe en cualquier CPU moderna: el reconocedor de líneas tiene ~0,6 M de parámetros y el repo completo ocupa 0,0 GB según Hugging Face.
- Despliegue: ONNX Runtime en CPU, mediante la CLI `inference.py` o la API Python `LineOCR` del paquete `runtime/`.
- Paralelización: el autor recomienda N procesos con 1 hilo cada uno frente a 1 proceso con N hilos para trabajos por lotes.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Parámetros | Licencia | Ejecución |
|---|---|---|---|---|---|
| KaoOCR-General-1.0c | OCR (detector + CTC) | th, en | ~0,6 M (reconocedor) | Apache 2.0 | ONNX, CPU-only |
| KaoOCR-General-1.0a | OCR (detector + CTC) | th, en | ~0,6 M (reconocedor) | Apache 2.0 | ONNX, CPU-only |
| OpenThai2.1-OCR-Text | OCR | th, en | No disponible | No disponible en la información | No disponible |
| KaoOCR-Ledger-1.0c | OCR + parsing (Markdown, tablas) | th, en | No disponible | No disponible en la información | No disponible |

La comparación principal es con su propia línea de versiones y con el modelo de referencia OpenThai2.1-OCR-Text, del que hereda. Para tareas de parsing estructurado, el propio autor remite a KaoOCR-Ledger-1.0c.

## Limitaciones y advertencias

- Solo OCR: no reconoce tablas ni genera Markdown; para ello debe usarse KaoOCR-Ledger.
- La escritura manuscrita sigue siendo considerablemente más difícil que el texto impreso para un modelo de este tamaño.
- Si el detector de líneas falla y no localiza una línea, el reconocedor nunca la procesa; los errores del detector se propagan.
- Las puntuaciones de benchmark proceden de una ejecución y evaluadores propios del autor, no de un leaderboard oficial; el propio autor recomienda probar sobre documentos propios antes de confiar en ellas.
- Cobertura limitada a tailandés e inglés; no se documentan otros idiomas.
- Los detalles de entrenamiento de 1.0c (datos, épocas, hardware) no están publicados.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las obligaciones de atribución y las licencias heredadas del modelo base OpenThai2.1-OCR-Text.
- No se documentan sesgos específicos ni tasas de alucinación (no es un modelo generativo, por lo que el riesgo es de error de reconocimiento, no de invención de texto).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kaopanboonyuen/KaoOCR-General-1.0c
- Modelo base 1.0a: https://huggingface.co/kaopanboonyuen/KaoOCR-General-1.0a
- Versión 1.0b: https://huggingface.co/kaopanboonyuen/KaoOCR-General-1.0b
- KaoOCR-Ledger-1.0c (parsing y Markdown): https://huggingface.co/kaopanboonyuen/KaoOCR-Ledger-1.0c
- OpenThai (iApp Technology): https://iapp.co.th/models
- Dataset ThaiOCRBench: https://huggingface.co/datasets/typhoon-ai/ThaiOCRBench
- Typhoon / OpenTyphoon: https://opentyphoon.ai/
- Dataset de escritura manuscrita tailandesa: https://huggingface.co/datasets/iapp/thai_handwriting_dataset
- Dataset de escritura manuscrita (textdisjoint): https://huggingface.co/datasets/sivakorn-su/thai-handwriting-textdisjoint-v1
