# mohameddalii/ocr-mt-5090

## Resumen

`mohameddalii/ocr-mt-5090` no es un modelo de lenguaje nuevo, sino un kit de despliegue (scripts, configuraciones y motores) que permite servir simultáneamente dos modelos open source en una única GPU RTX 5090 de 32 GB: **PaddleOCR-VL** para reconocimiento óptico de caracteres (OCR) y **Qwen3-4B-Instruct-2507** para traducción automática. El repositorio actúa como una capa de orquestación sobre vLLM, descargando los pesos oficiales de ambos modelos y gestionando el reparto de memoria para que funcionen sin cuantización.

La relevancia de este kit radica en que aborda un problema práctico: la ejecución conjunta de un modelo OCR pesado y un modelo de traducción en un solo GPU de consumo, sin sacrificar precisión mediante cuantización. El autor documenta un rendimiento verificado en una instancia Vast.ai con RTX 5090, alcanzando un chrF de 71,7 en traducción y 85/85 en extracción de campos OCR. Es una solución pensada para desarrolladores que necesitan un pipeline de OCR+traducción en un entorno de hardware accesible y con licencia Apache 2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kit de despliegue sobre dos modelos: Qwen3-4B-Instruct-2507 (transformer autoregresivo) y PaddleOCR-VL (visión-lenguaje para OCR) |
| Parametros totales | No aplica (no hay pesos propios; los modelos base suman aproximadamente 4B + el tamaño de PaddleOCR-VL, no especificado) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Qwen3-MT: 2048 tokens; PaddleOCR-VL: 8192 tokens (según README) |
| Tipos de cuantizacion | Ninguna (usa bf16; el autor advierte que no se debe usar 4-bit) |
| Idiomas soportados | No disponible (el autor no especifica; se asume multilingüe por los modelos base) |
| Licencia | Apache 2.0 |
| Formato de pesos | No se distribuyen pesos; se descargan los repos oficiales de Qwen y PaddleOCR vía vLLM |

## Arquitectura y entrenamiento

No hay un modelo entrenado específicamente para este repositorio. Se trata de un kit de servirse que integra dos modelos preexistentes: **Qwen3-4B-Instruct-2507** (de Alibaba) para traducción, y **PaddleOCR-VL** (de PaddlePaddle) para OCR. El autor no ha publicado detalles sobre el entrenamiento de estos modelos base, por lo que no se dispone de información sobre el número de tokens, composición del dataset o técnicas de alineación. El valor técnico del proyecto está en la configuración de vLLM y los scripts que gestionan la memoria compartida (GPU fractions 0.38 y 0.48) para ejecutar ambos modelos en paralelo sobre una RTX 5090 sin cuantizar.

Los scripts `python/mt_engine.py` y `python/ocr_engine.py` añaden funcionalidades como glosarios y copia de tramos (copy-spans) para la traducción, y recorte paralelo de imágenes para el OCR. No se documenta ninguna innovación arquitectónica propia.

## Capacidades

- **OCR de documentos**: extracción de texto en imágenes y documentos, con soporte para campos estructurados (85/85 en pruebas del autor).
- **Traducción automática**: traducción entre idiomas (ej. inglés a árabe en el ejemplo del README), con posibilidad de usar glosarios y mantener tramos sin traducir (copy-spans).
- **Ejecución simultánea**: ambos servicios se exponen en puertos distintos (`/v1` en 18000 para OCR y 18100 para traducción) y pueden usarse de forma independiente o encadenados.
- **Soporte multilingüe**: el autor reporta 12/12 en pruebas multilingües de OCR, aunque no se especifican los idiomas exactos.
- **Integración con vLLM**: compatibilidad con la API de OpenAI para ambos servicios, facilitando su uso en pipelines existentes.
- **Personalización de despliegue**: variables de entorno para ajustar la fracción de GPU, puertos y rutas de caché.

## Casos de uso

- **Digitalización de documentos en oficinas**: extraer texto de escaneos y PDFs mediante PaddleOCR-VL, y luego traducir el contenido con Qwen3 para equipos internacionales.
- **Procesamiento de facturas**: extraer campos clave (importes, fechas, proveedor) con OCR y traducir notas o descripciones a otros idiomas para su registro contable.
- **Traducción de documentación técnica**: el pipeline permite extraer texto de manuales y hojas técnicas, traducirlo con glosarios personalizados (por ejemplo, términos específicos de una empresa) y mantener el formato original.
- **Sistema de atención al cliente**: combinar OCR para leer capturas de pantalla o imágenes enviadas por usuarios y traducir automáticamente las consultas a un idioma de trabajo.
- **Arquitectura de bajo coste**: al ejecutarse en una sola RTX 5090 (32 GB), permite desplegar un servicio de OCR+traducción sin necesidad de servidores multi-GPU, ideal para startups o proyectos con presupuesto ajustado.
- **Prototipado rápido**: gracias a los scripts listos para usar, los desarrolladores pueden montar un endpoint de OCR y traducción en minutos, útil para pruebas de concepto y demos.

## Benchmarks y rendimiento

El autor reporta resultados de rendimiento obtenidos en una RTX 5090 con ambos modelos colocalizados (bf16). Estos datos no provienen de benchmarks estándar, sino de pruebas propias:

| Métrica | Valor |
|---|---|
| Suite de traducción (64 casos) | 64/64 correctos, chrF 71,7 |
| OCR multilingüe (12 casos) | 12/12 correctos |
| Extracción de campos (85 casos) | 85/85 correctos |

No se han publicado resultados en benchmarks como MMLU, HumanEval o GSM8K para el kit, ya que no es un modelo único. Los resultados de los modelos base están disponibles en sus respectivas publicaciones, pero no se incluyen aquí por no estar en la información proporcionada.

## Requisitos de hardware

- **GPU requerida**: RTX 5090 con 32 GB de VRAM (verificada por el autor en Vast.ai).
- **VRAM estimada**: 12 GB para Qwen3-MT (0.38 de utilización) y 15 GB para PaddleOCR-VL (0.48 de utilización), totalizando ~27 GB, dejando margen para el sistema.
- **Consumer GPU**: sí, en la RTX 5090; no se ha probado en otras GPUs de consumo (por ejemplo, 4090) y el autor advierte que no se deben sumar las utilizaciones por encima de 0.90 para evitar OOM.
- **Despliegue**: vLLM (requerido), con scripts para ejecución en servidores genéricos Linux y en Vast.ai (con supervisor y Caddy).
- **Latencia/throughput**: no se proporcionan números concretos, pero el autor indica que ambos servicios operan en paralelo con 8 secuencias paralelas (parallel seqs) cada uno.

## Comparativa con modelos similares

No existe una comparativa directa porque este repositorio no es un modelo independiente, sino un kit que combina dos modelos existentes. Sin embargo, se puede comparar con soluciones alternativas para OCR+traducción:

| Solución | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `ocr-mt-5090` | Kit de despliegue (Qwen3-4B + PaddleOCR-VL) | 2048/8192 | Apache 2.0 | GitHub/HuggingFace |
| PaddleOCR-VL (standalone) | Modelo OCR | 8192 | Apache 2.0 | HuggingFace |
| Qwen3-4B-Instruct (standalone) | LLM de traducción | 2048 | Apache 2.0 | HuggingFace |
| Mistral Document AI (OCR 4.0) | OCR empresarial | No disponible | Propietaria | Azure |

La principal ventaja de este kit es la integración en un solo GPU, mientras que las alternativas suelen requerir dos GPUs o usar modelos propietarios con licencias restrictivas.

## Limitaciones y advertencias

- **No es un modelo entrenado**: el repositorio no contiene pesos propios; depende de la disponibilidad de los modelos base en HuggingFace y de su correcto funcionamiento.
- **Requisitos de hardware estrictos**: solo probado en RTX 5090; en otras GPUs puede no caber o requerir cuantización (que el autor desaconseja explícitamente).
- **Contexto limitado para traducción**: la ventana de 2048 tokens para Qwen3 puede ser insuficiente para documentos largos; se recomienda segmentar.
- **Sesgos y alucinaciones de los modelos base**: tanto Qwen3 como PaddleOCR-VL pueden presentar sesgos o errores en idiomas poco comunes; el autor no ha documentado limitaciones específicas.
- **Licencia Apache 2.0**: permite uso comercial, pero debe revisarse la licencia de los modelos base (Qwen3 y PaddleOCR-VL) para asegurar compatibilidad en entornos productivos.
- **Riesgo de OOM**: el autor advierte que sumar las utilizaciones de GPU por encima de 0.90 puede provocar agotamiento de memoria; se debe respetar la configuración por defecto.

## Enlaces

- Repositorio HuggingFace: [https://huggingface.co/mohameddalii/ocr-mt-5090](https://huggingface.co/mohameddalii/ocr-mt-5090)
- Referencia a PaddleOCR-VL en benchmark OmniDocBench (ofox.ai): [https://ofox.ai/blog/best-ai-model-for-ocr-2026/](https://ofox.ai/blog/best-ai-model-for-ocr-2026/)
- Comparativa de OCR con TurboOCR (menciona PaddleOCR-VL): [https://github.com/aiptimizer/TurboOCR](https://github.com/aiptimizer/TurboOCR)
- Soluciones de OCR empresarial de Mistral AI: [https://mistral.ai/solutions/document-ai/](https://mistral.ai/solutions/document-ai/)
- Catálogo de modelos Microsoft Foundry (Mistral OCR 4.0): [https://ai.azure.com/catalog/models/mistral-ocr-4-0](https://ai.azure.com/catalog/models/mistral-ocr-4-0)
