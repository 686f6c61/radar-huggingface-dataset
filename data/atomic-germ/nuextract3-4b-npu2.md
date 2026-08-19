# Atomic-Germ/NuExtract3-4B-NPU2

## Resumen

NuExtract3-4B-NPU2 es una conversión cuantizada en formato Q4NX del modelo NuExtract3, un fine-tune de Qwen3.5-4B especializado en extracción estructurada de información y comprensión de documentos. La conversión la realiza Atomic-Germ, y está diseñada exclusivamente para el motor FastFlowLM sobre las NPU AMD Ryzen AI con arquitectura XDNA2 (serie Ryzen AI 300 o posterior). El modelo original, desarrollado por NuMind, combina extracción de información estructurada en JSON con conversión de imágenes a Markdown de alta calidad, lo que lo hace adecuado para pipelines de OCR, preprocesamiento para RAG y extracción de datos en documentos como escaneos, recibos, formularios, facturas, contratos y tablas.

La relevancia de esta versión cuantizada radica en que permite ejecutar un modelo de visión-lenguaje de 4B parámetros íntegramente en la NPU de procesadores AMD Ryzen AI, sin necesidad de GPU dedicada, con un peso de 4,3 GB y una ventana de contexto de 32 768 tokens. El formato Q4NX es un layout de cuantización Q4_1 reorganizado para el motor de matrices de la NPU, por lo que no es compatible con llama.cpp, Ollama ni otros motores convencionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language transformer basado en Qwen3.5-4B |
| Parametros totales | 4B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32 768 tokens |
| Tipos de cuantizacion | Q4NX (Q4_1 reorganizado para NPU XDNA2) |
| Idiomas soportados | Multilingue (detalle no disponible) |
| Licencia | Apache-2.0 |
| Formato de pesos | Q4NX (model.q4nx, no es GGUF ni safetensors) |

## Arquitectura y entrenamiento

El modelo base es NuExtract3, un fine-tune de Qwen3.5-4B para extracción de texto y comprensión de documentos. Se trata de un modelo de visión-lenguaje que integra un codificador visual con el decoder de Qwen3.5, entrenado para dos tareas principales: extracción de información estructurada (JSON) y conversión de imágenes de documentos a Markdown. Los detalles del entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) no están disponibles en la información proporcionada.

La conversión a Q4NX la realiza Atomic-Germ, que reorganiza los pesos cuantizados en un layout Q4_1 adaptado a los tamaños de tile y patrones de acceso a memoria del motor de matrices de la NPU XDNA2. El modelo comparte la familia de motor `qwen3.5` y reutiliza los kernels NPU (xclbins) del modelo oficial Qwen3.5-4B-NPU2, que son de código cerrado y no se distribuyen en este repositorio.

## Capacidades

- Extracción de información estructurada: genera JSON a partir de documentos, siguiendo esquemas definidos por el usuario.
- Conversión de imagen a Markdown: transforma documentos escaneados o digitales en Markdown de alta calidad, preservando tablas y estructura.
- OCR integrado: reconocimiento de texto en escaneos, recibos, formularios, facturas, contratos y tablas.
- Comprensión de documentos: razonamiento sobre el contenido visual y textual de documentos completos.
- Razonamiento multimodal: combina información visual y textual para responder consultas sobre documentos.
- Capacidad multilingue: soporta múltiples idiomas (detalle específico no disponible).
- Modo conversacional: puede mantener diálogos sobre el contenido de los documentos.

## Casos de uso

- Extracción de datos de facturas: el modelo puede extraer campos como importe, fecha, proveedor y número de factura en formato JSON estructurado, listo para integrarse en sistemas de contabilidad o ERP.
- Preprocesamiento para RAG: convierte documentos escaneados o PDFs en Markdown limpio, facilitando la indexación y recuperación en pipelines de generación aumentada por recuperación.
- Digitalización de formularios: procesa formularios manuscritos o impresos y extrae los campos rellenados en formato estructurado para su volcado en bases de datos.
- Análisis de contratos: extrae cláusulas, fechas, partes involucradas y obligaciones de contratos legales, reduciendo el trabajo manual de revisión.
- Procesamiento de recibos y tickets: extrae líneas de detalle, totales e impuestos de recibos para aplicaciones de gestión de gastos.
- Conversión de tablas a Markdown: transforma tablas complejas de documentos escaneados en tablas Markdown editables, útil para documentación técnica o migración de contenidos.
- Automatización de back-office: integrado en flujos de trabajo en el edge (portátiles con Ryzen AI) para procesar documentos sin enviar datos a la nube, cumpliendo requisitos de privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio remite a la ficha original de numind/NuExtract3 para detalles de entrenamiento y evaluaciones, pero dichos datos no se incluyen en la documentación proporcionada.

## Requisitos de hardware

- Procesador: AMD Ryzen AI con NPU XDNA2 (serie Strix Point / Ryzen AI 300 o posterior).
- Memoria: aproximadamente 16 GB de memoria unificada del sistema (pesos Q4NX + activaciones + caché KV).
- Sistema operativo: Linux con el stack XRT NPU instalado.
- Motor: FastFlowLM versión 0.9.45 o superior (CLI `flm`).
- Instalación: mediante `flm-add` (pip o uv tool), que registra el modelo sin modificar la instalación del sistema.
- No requiere GPU dedicada; no es compatible con vLLM, llama.cpp, Ollama ni TGI por el formato propietario Q4NX.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NuExtract3-4B-NPU2 (este) | 4B | 32 768 | Q4NX (solo FastFlowLM) | Apache-2.0 | Repositorio Hugging Face |
| numind/NuExtract3 (original) | 4B | 32 768 | safetensors (transformers) | Apache-2.0 | Hugging Face, ejecutable en GPUs convencionales |
| Qwen3.5-4B (base) | 4B | 32 768 | safetensors, GGUF, etc. | Apache-2.0 | Amplia disponibilidad en múltiples motores |

La diferencia principal frente al modelo original es el formato de pesos: la versión NPU2 solo puede ejecutarse en el motor FastFlowLM sobre NPU AMD XDNA2, mientras que el original es portable a cualquier entorno con transformers. No se dispone de datos de rendimiento comparativo entre ambas versiones.

## Limitaciones y advertencias

- Compatibilidad restringida: el formato Q4NX solo funciona con FastFlowLM en NPU AMD XDNA2; no es ejecutable en llama.cpp, Ollama, vLLM ni en GPUs convencionales.
- Kernels de código cerrado: los xclbins de la NPU son propietarios y no se distribuyen en el repositorio; se enlazan los del modelo oficial Qwen3.5-4B-NPU2.
- Requisitos de sistema estrictos: necesita Linux con el stack XRT y un procesador Ryzen AI 300 o posterior; no funciona en hardware AMD anterior.
- Memoria mínima elevada: requiere unos 16 GB de memoria unificada, lo que puede descartar equipos con menos RAM.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar extracciones incorrectas o inventar campos en documentos ambiguos o de baja calidad.
- Sesgos: no se dispone de información sobre sesgos específicos del modelo o de sus datos de entrenamiento.
- Limitaciones de idioma: aunque es multilingue, no se especifica qué idiomas cubre ni su calidad relativa entre ellos.
- Dependencia del motor: las actualizaciones de FastFlowLM o cambios en la familia `qwen3.5` pueden afectar a la compatibilidad del modelo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Atomic-Germ/NuExtract3-4B-NPU2
- Modelo base (NuExtract3): https://huggingface.co/numind/NuExtract3
- Repositorio GitHub de NuExtract: https://github.com/numindai/nuextract
- Plataforma NuExtract: https://nuextract.ai/
- Demo de NuExtract3: https://numind-nuextract3.hf.space/
- Motor FastFlowLM: https://fastflowlm.com
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
