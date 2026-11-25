# snowfluke/ppu-ocria-nano-models

## Resumen

OCRia-nano-1 es un sistema de OCR y análisis de documentos desarrollado por LlamaIndex, Inc. Este repositorio concreto (`snowfluke/ppu-ocria-nano-models`) es un espejo no oficial ni modificado de los ficheros del modelo original `llamaindex/OCRia-nano-1`, versión v1.0.0, publicado por un tercero (snowfluke) para servir como fuente de descarga alternativa a la herramienta `ppu-ocria-nano`. No se trata de un modelo de lenguaje generativo, sino de un conjunto de modelos especializados que cubren detección de líneas de texto, enrutado por sistema de escritura, reconocimiento de caracteres en varios alfabetos y análisis de layout (tablas).

El paquete se distribuye exclusivamente en formato ONNX e incluye un detector de líneas (`det.onnx`), un router de scripts (`router.onnx`), cuatro reconocedores especializados (latino, CJK, RTL para árabe y hebreo, y "world-script") y un modelo de layout llamado LayoutNet (`tablenet.onnx`). Cada reconocedor va acompañado de su fichero de charset y, en algunos casos, de metadatos con umbrales o configuración.

La relevancia de este repositorio es operativa: actúa como copia de seguridad verificable (con SHA-256 fijados por la librería LiteParse crates-v2.21.2) para que la herramienta `ppu-ocria-nano` pueda seguir funcionando si la descarga desde el repositorio original de LlamaIndex falla. La licencia es restrictiva y limita explícitamente el uso comercial por parte de entidades con ingresos o financiación superiores a 2 millones de dólares, así como el uso para productos que compitan con LlamaParse o LlamaCloud.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de modelos ONNX especializados: detector de líneas de texto, router de scripts, reconocedores por alfabeto (latino, CJK, RTL, world-script) y LayoutNet para layout y tablas |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto de tokens; procesa imágenes de líneas de texto) |
| Tipos de cuantizacion | no disponible (los ficheros se distribuyen en ONNX tal cual) |
| Idiomas soportados | no disponible como lista cerrada; por los reconocedores incluidos: alfabeto latino, CJK (chino, japonés, coreano), RTL (árabe y hebreo) y un reconocedor "world-script" para otros sistemas de escritura |
| Licencia | ocria-nano-1-license (licencia AI Pubs Open RAIL-M modificada) |
| Formato de pesos | ONNX (`det.onnx`, `router.onnx`, `rec_latin.onnx`, `rec_cjk.onnx`, `rec_rtl.onnx`, `rec_world.onnx`, `tablenet.onnx`) más ficheros JSON de charset y metadatos |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna de cada componente. Por la estructura de ficheros se deduce un pipeline típico de OCR en varias etapas: un detector de líneas de texto (`det.onnx` con umbral en `det.meta.json`), un router que clasifica el sistema de escritura de cada región (`router.onnx`), y reconocedores específicos por alfabeto (`rec_latin`, `rec_cjk`, `rec_rtl`, `rec_world`), cada uno con su charset JSON. Adicionalmente, `tablenet.onnx` implementa LayoutNet para detección de tablas y estructura de layout.

No se dispone de información sobre el conjunto de datos de entrenamiento, el número de tokens o imágenes, ni sobre si se aplicaron técnicas de ajuste fino supervisado o preferencias. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal, ya que no es un modelo de lenguaje. El repositorio es una copia byte a byte del original de LlamaIndex, con SHA-256 verificados por la librería LiteParse crates-v2.21.2.

## Capacidades

- Detección de líneas de texto en imágenes de documentos mediante `det.onnx`.
- Enrutado automático por sistema de escritura mediante `router.onnx`.
- Reconocimiento óptico de caracteres en alfabeto latino (`rec_latin.onnx`).
- Reconocimiento OCR para chino, japonés y coreano (`rec_cjk.onnx`).
- Reconocimiento OCR para árabe y hebreo (`rec_rtl.onnx`).
- Reconocimiento OCR para otros sistemas de escritura agrupados en `rec_world.onnx`.
- Análisis de layout y detección de tablas mediante LayoutNet (`tablenet.onnx`).
- Integración con la herramienta `ppu-ocria-nano` como fuente de descarga de respaldo.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un pipeline de visión/OCR, no un modelo generativo.
- No se documentan capacidades multimodales más allá del OCR y el análisis de layout.

## Casos de uso

- Digitalización de documentos con múltiples alfabetos: el router y los reconocedores permiten procesar documentos que mezclan latino, CJK y RTL en una misma página, seleccionando el reconocedor adecuado por región.
- Extracción de tablas de informes y facturas: LayoutNet (`tablenet.onnx`) detecta la estructura de tablas, lo que permite reconstruir filas y columnas para su posterior procesamiento.
- Pipeline OCR de respaldo en producción: la herramienta `ppu-ocria-nano` usa este repositorio cuando falla la descarga desde LlamaIndex, garantizando continuidad operativa con ficheros verificados por SHA-256.
- Procesamiento de documentos en árabe y hebreo: el reconocedor `rec_rtl.onnx` cubre estos alfabetos, útil en entornos administrativos o legales con documentación en esos idiomas.
- Digitalización de archivos CJK: `rec_cjk.onnx` permite extraer texto de documentos en chino, japonés y coreano para indexación o búsqueda.
- Investigación en OCR multilingüe: al ser una copia verificable del original, sirve como referencia reproducible para experimentos académicos (uso permitido bajo la licencia para Research Purposes).
- Integración en sistemas de gestión documental: el pipeline ONNX puede ejecutarse en entornos con runtime ONNX sin necesidad de GPUs de gran tamaño, aunque no se documentan requisitos concretos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al ser modelos ONNX especializados (detector, router, reconocedores y LayoutNet), el consumo es previsiblemente muy inferior al de un LLM, pero no se documentan cifras.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; al ser ONNX, puede ejecutarse en CPU o en GPU compatibles con ONNX Runtime, pero no se especifican modelos concretos.
- Opciones de despliegue: ONNX Runtime (formato nativo); la herramienta `ppu-ocria-nano` (Rust, según la referencia a LiteParse crates) consume estos ficheros. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelos.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de OCR o análisis de layout con los que contrastar parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Licencia restrictiva: la ocria-nano-1-license prohíbe el uso por entidades con más de 2 millones de dólares de ingresos brutos o financiación total en el año anterior, salvo uso personal o con fines de investigación.
- Prohibición de competencia: no se permite usar los ficheros para ofrecer un producto o servicio de parsing, OCR o extracción documental que compita con productos de LlamaIndex o sus filiales (como LlamaParse o LlamaCloud), salvo con fines de investigación.
- Repositorio no oficial: este espejo no está afiliado ni respaldado por LlamaIndex; el autor original es LlamaIndex, Inc.
- Sin datos de rendimiento: no se publican benchmarks, por lo que no es posible evaluar la precisión del OCR ni compararla con alternativas.
- Idiomas no listados exhaustivamente: aunque se identifican los reconocedores por alfabeto, no se detalla la cobertura exacta de idiomas ni la calidad por idioma.
- Sin información sobre sesgos o alucinación: al no ser un modelo generativo, el riesgo de alucinación no aplica de la misma forma, pero no se documentan tasas de error de reconocimiento.
- Restricciones de uso comercial: cualquier uso en producción fuera de los supuestos permitidos requiere contactar con LlamaIndex.
- Fecha de creación del repositorio: 2026-11-25, con 0 descargas y 0 likes en el momento de la consulta, lo que indica que es un espejo reciente y poco utilizado.

## Enlaces

- Repositorio espejo en Hugging Face: https://huggingface.co/snowfluke/ppu-ocria-nano-models
- Repositorio original: https://huggingface.co/llamaindex/OCRia-nano-1
- Herramienta que consume este espejo: https://github.com/PT-Perkasa-Pilar-Utama/ppu-ocria-nano
- Licencia: https://huggingface.co/snowfluke/ppu-ocria-nano-models/blob/main/v1.0.0/LICENSE
- Contacto de LlamaIndex para otros usos: https://www.llamaindex.ai/contact
