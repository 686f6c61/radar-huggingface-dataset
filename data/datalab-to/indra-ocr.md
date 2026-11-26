# datalab-to/indra-ocr

## Resumen

Indra OCR 1.2.0 es un modelo de reconocimiento óptico de caracteres (OCR) desarrollado por datalab-to, diseñado para ejecutarse íntegramente en CPU sobre documentos PDF e imágenes. A diferencia de los OCR basados en transformers de gran tamaño, este modelo emplea un conjunto de lectores especializados por script (latino, cirílico, griego, índico, CJK), junto con módulos de análisis de layout, extracción de tablas y reconocimiento de fórmulas matemáticas en LaTeX en línea. Su peso es extremadamente reducido: 1.250.566 parámetros en safetensors, con un repositorio de apenas 0,2 GB.

El modelo se distribuye en formato ONNX y se ejecuta mediante la librería `onnxruntime`, lo que facilita su despliegue en entornos sin GPU. Está pensado para pipelines de digitalización documental, extracción estructurada de datos y procesamiento masivo de PDFs donde el coste por página y la latencia en CPU son factores críticos. Soporta 14 idiomas, entre ellos inglés, francés, alemán, español, italiano, portugués, neerlandés, polaco, ruso, ucraniano, griego, hindi, bengalí y chino.

La relevancia actual del modelo reside en su enfoque de "OCR completo" (texto, layout, tablas y matemáticas) con un consumo de recursos mínimo y una licencia que permite uso gratuito en investigación, uso personal y startups por debajo de un umbral de 5 millones de dólares. La versión 1.2.0 introduce el reconocimiento matemático activado por defecto, que puede desactivarse con `load(math=False)`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (conjunto de lectores especializados por script sobre ONNX; no se detalla la topología interna) |
| Parametros totales | 1.250.566 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (se distribuye en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | en, fr, de, es, it, pt, nl, pl, ru, uk, el, hi, bn, zh |
| Licencia | datalab-openrail-m (gratuita para investigación, uso personal y startups por debajo de 5 M USD; el código es Apache-2.0) |
| Formato de pesos | ONNX y safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo. La model card describe un sistema compuesto por "lectores específicos por script" (script-specific readers), lo que sugiere una arquitectura modular en la que distintos submodelos o cabezas se especializan en familias de escritura (latino, cirílico, griego, índico, CJK). A esto se suman módulos dedicados a layout, tablas y reconocimiento de matemáticas en LaTeX en línea. El conjunto se empaqueta en ONNX y se ejecuta con `onnxruntime`, lo que implica que el diseño está optimizado para inferencia en CPU.

No se han publicado en la información disponible datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal. El dato más concreto sobre rendimiento es la puntuación en OmniParseBench (omni-parse-bench 1.7.0, 2.937 páginas, 16.288 tests): 78,9 con matemáticas activadas y 71,6 con ellas desactivadas. La model card advierte que desactivar el lector matemático no filtra los tests etiquetados como matemáticos, por lo que la comparación entre ambas cifras no es estrictamente equivalente.

## Capacidades

- Reconocimiento de texto en imágenes y PDFs con lectores especializados por script para 14 idiomas.
- Análisis de layout documental (detección y ordenación de bloques de contenido).
- Extracción de tablas.
- Reconocimiento de fórmulas matemáticas y conversión a LaTeX en línea, activado por defecto y desactivable con `load(math=False)`.
- Ejecución íntegra en CPU mediante `onnxruntime`, sin necesidad de GPU.
- Integración con la librería `indra-ocr==1.2.0`.
- Capacidades multilingües limitadas a los 14 idiomas listados; no se documenta soporte para otros.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso; es un modelo de image-to-text especializado en OCR.

## Casos de uso

- Digitalización masiva de PDFs escaneados: el modelo procesa páginas en CPU con un repositorio de 0,2 GB, lo que permite desplegarlo en servidores sin GPU para convertir archivos históricos o administrativos en texto plano y estructurado.
- Extracción de datos de facturas y formularios: gracias a la detección de layout y tablas, puede localizar campos y reconstruir estructuras tabulares en documentos financieros, adecuado para pipelines de contabilidad automatizada.
- Procesamiento de documentación técnica y científica: el reconocimiento de matemáticas en LaTeX permite extraer ecuaciones de papers y manuales, útil para bases de conocimiento técnico o motores de búsqueda académica.
- Atención al cliente con documentos adjuntos: el modelo puede transcribir imágenes y PDFs enviados por usuarios (recibos, contratos, capturas) en sistemas de soporte, con la ventaja de ejecutarse en CPU y mantener costes bajos por consulta.
- Cumplimiento normativo y archivística: la capacidad multilingüe (incluidos ruso, ucraniano, griego, hindi y chino) permite clasificar y transcribir expedientes en varias lenguas dentro de un mismo repositorio documental.
- Digitalización en el borde (edge) o en entornos aislados: al no requerir GPU y tener un tamaño mínimo, puede desplegarse en portátiles, mini-PCs o contenedores ligeros para digitalizar documentos en oficinas sin infraestructura de aceleradores.
- Extracción de tablas para análisis de datos: la detección de tablas facilita convertir informes en CSV o DataFrames para su posterior análisis, sin depender de servicios en la nube.

## Benchmarks y rendimiento

| Benchmark | Configuracion | Resultado |
|---|---|---|
| OmniParseBench 1.7.0 (2.937 páginas, 16.288 tests) | Matemáticas activadas | 78,9 |
| OmniParseBench 1.7.0 (2.937 páginas, 16.288 tests) | Matemáticas desactivadas | 71,6 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar de LLM, dado que se trata de un modelo de OCR y no de un modelo generativo de propósito general. Tampoco se ofrecen comparaciones numéricas con otros sistemas OCR en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: 0 GB; el modelo está diseñado para ejecutarse en CPU mediante `onnxruntime`.
- GPU recomendadas: no aplica; no se documenta soporte GPU ni requisitos de acelerador.
- Cabe en cualquier equipo consumer: el repositorio ocupa 0,2 GB y el modelo tiene 1,25 M de parámetros, por lo que puede ejecutarse en portátiles y mini-PCs convencionales.
- Opciones de despliegue: `onnxruntime` con la librería `indra-ocr==1.2.0`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Indra OCR 1.2.0 | 1,25 M | No disponible | 14 | datalab-openrail-m | ONNX, safetensors |
| Tesseract OCR | No disponible | No aplica | Amplio (según modelos de idioma) | Apache-2.0 | Pesos propios |
| PaddleOCR | No disponible | No aplica | Amplio | Apache-2.0 | Varios |
| Docling (IBM) | No disponible | No disponible | Varios | MIT | Varios |

No se dispone en la información proporcionada de datos numéricos comparativos de rendimiento entre Indra OCR y estas alternativas. La comparación se limita a parámetros, licencia y formato según conocimiento general; los valores de Tesseract, PaddleOCR y Docling no proceden de la información facilitada y deben verificarse en sus respectivas fuentes.

## Limitaciones y advertencias

- La model card reconoce dificultades con escritura manuscrita, tablas complejas y escaneos degradados.
- El reconocimiento matemático está activado por defecto; desactivarlo reduce la puntuación en OmniParseBench de 78,9 a 71,6, y la model card advierte que desactivarlo no filtra los tests etiquetados como matemáticos, por lo que la métrica con matemáticas desactivadas no es directamente comparable.
- La licencia datalab-openrail-m es gratuita solo para investigación, uso personal y startups por debajo de 5 M USD; el uso comercial fuera de esos supuestos requiere revisar los términos completos del archivo LICENSE.
- El código es Apache-2.0, pero los pesos del modelo tienen términos distintos; no deben confundirse ambas licencias.
- Cobertura lingüística limitada a 14 idiomas; no se documenta soporte para otras lenguas.
- No se documentan mecanismos de mitigación de sesgos ni evaluación de riesgo de alucinación en la transcripción; como todo OCR, puede producir errores en caracteres ambiguos o ruido visual.
- No se dispone de información sobre latencia, throughput ni comportamiento en documentos de muy alta resolución.
- La versión de la librería debe coincidir con la del modelo (`indra-ocr==1.2.0`); no se documenta compatibilidad con versiones anteriores o posteriores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/datalab-to/indra-ocr
- Repositorio de código: https://github.com/datalab-to/indra
- Licencia del modelo: https://huggingface.co/datalab-to/indra-ocr/blob/main/LICENSE
