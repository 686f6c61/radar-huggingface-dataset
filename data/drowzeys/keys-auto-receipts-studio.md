# drowzeys/keys-Auto-Receipts-Studio

## Resumen

`keys-Auto-Receipts-Studio` es un proyecto de software de código abierto (licencia Apache 2.0) desarrollado por el usuario `drowzeys`. No se trata de un modelo de lenguaje o visión en sí, sino de una aplicación de escaneo y extracción de datos de recibos que integra un modelo de visión-lenguaje local. El sistema permite fotografiar un recibo desde un iPhone o desde un escritorio, enviarlo a un servidor local que ejecuta el modelo **Gemma 4 12B-it** (un modelo omni con visión) mediante vLLM, y almacenar los datos extraídos en una base de datos SQLite con soporte de vectores (`sqlite-vec`).

El proyecto incluye una interfaz web (Gradio) para revisión de recibos, un catálogo de SKUs y un panel de ajustes. Además, ofrece una "skill" integrable en el sistema robótico **Autonomous OS** (para el robot "Autonomous Lamp"), lo que permite escanear recibos mediante la cámara del robot y procesarlos en una GPU externa. La relevancia actual radica en su enfoque de ejecución completamente local y privada, sin depender de servicios en la nube, y en su demostración de un flujo de trabajo de visión por computadora aplicado a tareas de contabilidad personal o de pequeña empresa.

El repositorio en Hugging Face tiene un tamaño de 0.0 GB, lo que confirma que no contiene pesos de modelos; todos los pesos provienen del modelo `google/gemma-4-12B-it` que se descarga por separado. La información técnica disponible en la model card es limitada y se centra en el despliegue y la integración, más que en las características del modelo de IA en sí.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es un modelo; es una aplicación. Utiliza Gemma 4 12B Unified (omni) como backend de visión y embeddings. |
| Parametros totales | No aplica (la aplicación no tiene parámetros propios). El modelo Gemma 4 12B tiene 12B parámetros (dato del autor). |
| Parametros activos | No aplica (modelo denso, no MoE). |
| Longitud de contexto | 8192 tokens (configuración de vLLM `max-model-len 8192`). |
| Tipos de cuantizacion | FP8 (según el script `serve-gemma.sh`). |
| Idiomas soportados | No disponible (no se especifica en la documentación). |
| Licencia | Apache-2.0 (para la aplicación y el repositorio). El modelo Gemma 4 tiene su propia licencia (Gemma Terms of Use, no especificada aquí). |
| Formato de pesos | No aplica (la aplicación no distribuye pesos). El modelo Gemma se sirve en formato safetensors a través de vLLM. |

## Arquitectura y entrenamiento

El proyecto no es un modelo entrenado, sino una aplicación de software. La arquitectura de la aplicación se compone de:

- **Interfaz web** (Gradio) para la captura de fotos desde un iPhone (Safari) o un escritorio.
- **Servidor de inferencia** (vLLM) que ejecuta el modelo `google/gemma-4-12B-it`, un modelo omni (Gemma 4 Unified) con capacidad de visión, en una GPU NVIDIA con `--gpu-memory-utilization 0.15` y FP8.
- **Base de datos SQLite** con extensión `sqlite-vec` para almacenar y buscar recibos, así como un catálogo de SKUs.
- **Skill para Autonomous OS** que permite que un robot (Lamp) capture una foto con su cámara y la envíe al servidor de GPU para procesamiento.

No se proporciona información sobre el entrenamiento del modelo Gemma 4 12B en la documentación de este repositorio. El autor menciona que el modelo Gemma 4 12B Unified es un modelo denso con `hidden size 3840` y que no cabe en un dispositivo con 6 GB de RAM (como el Lamp). No hay datos sobre el dataset de entrenamiento ni técnicas de alineación (RLHF/DPO) para este modelo específico.

## Capacidades

- **Extracción de datos de recibos**: el sistema extrae campos como comercio, categoría, proveedor, fecha y total mediante visión por computadora.
- **Almacenamiento y búsqueda**: los datos se guardan en SQLite con embeddings (dimensión 3840) para búsqueda semántica.
- **Revisión y edición**: la interfaz de escritorio permite editar los campos extraídos (tipo, categoría, proveedor, fecha, total) y eliminar registros.
- **Integración con robot**: a través de la skill de Autonomous OS, el robot "Lamp" puede capturar una foto de un recibo y procesarla de forma remota.
- **Soporte de archivos desde iPhone**: mediante la ruta `/phone`, permite tomar una foto o subir un archivo desde el navegador Safari.
- **Compatibilidad multiplataforma**: el frontend funciona en Linux, Windows y macOS (el servidor de inferencia requiere Linux con NVIDIA).

## Casos de uso

- **Contabilidad personal automatizada**: un usuario puede fotografiar recibos de compras diarias y el sistema los registra automáticamente en una base de datos local, categorizando los gastos por proveedor y fecha.
- **Gestión de gastos de pequeña empresa**: un autónomo puede escanear recibos de viajes, comidas o materiales y mantener un registro estructurado sin depender de servicios en la nube, protegiendo la privacidad de sus datos.
- **Auditoría de gastos**: el equipo de finanzas puede revisar la cola de recibos en la interfaz de escritorio, corregir errores de extracción y exportar los datos para su contabilidad.
- **Automatización con robot doméstico**: la skill de Autonomous Lamp permite que un robot con cámara escanee recibos al sostenerlos frente a él, ideal para personas mayores o para un flujo "manos libres".
- **Integración en flujo de facturación**: los datos extraídos pueden conectarse a otras herramientas locales (por ejemplo, hojas de cálculo o ERP) mediante la API de vLLM o la base de datos.
- **Entrenamiento de modelos de extracción**: los datos etiquetados (con la revisión manual) pueden servir para afinar modelos de visión específicos para recibos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La documentación no incluye métricas de precisión de extracción, velocidad de inferencia ni comparaciones con otros sistemas de OCR. El autor menciona que el modelo Gemma 4 12B-it se sirve con vLLM a una utilización de memoria del 15% y con FP8, pero no se especifica el throughput ni la latencia.

## Requisitos de hardware

- **GPU**: se requiere una GPU NVIDIA con al menos 12 GB de VRAM para ejecutar Gemma 4 12B-it en FP8. El autor indica que la utilización de memoria se limita a 0.15 (15% de la GPU) para dejar espacio a otras tareas.
- **CPU**: la aplicación en sí es ligera (Gradio y SQLite), pero el servidor de inferencia necesita una GPU dedicada. El robot "Lamp" tiene 6 GB de RAM y no puede cargar el modelo, por lo que se usa como cliente.
- **Despliegue**: el servidor de inferencia se lanza con vLLM (`serve-gemma.sh`). La interfaz web se ejecuta en el mismo equipo o en otro (Windows/macOS) apuntando a la GPU.
- **Latencia**: no disponible. Se espera que la extracción de un recibo tarde unos segundos, dependiendo de la GPU.
- **Almacenamiento**: los pesos del modelo ocupan aproximadamente 12 GB (FP8), además de la base de datos SQLite local.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos de extracción de recibos (como ReceiptsAI, Microsoft Document Intelligence o el modelo de Azure AI Builder). El proyecto se basa en Gemma 4 12B-it, pero no se comparan sus resultados con otros modelos de visión (por ejemplo, Qwen-VL, LLaVA). La documentación menciona que el robot también podría usar `Qwen3.8-27B ADay777 VLM` como alternativa, pero no ofrece datos de rendimiento.

| Modelo | Parámetros | Contexto | Visión | Licencia | Notas |
|---|---|---|---|---|---|
| Gemma 4 12B-it (usado aquí) | 12B | 8192 | Sí | Apache-2.0 (Gemma) | Omni, embeddings de 3840 dims |
| Qwen3.8-27B ADay777 VLM | 27B | no disponible | Sí | no disponible | Alternativa mencionada |
| Microsoft Document Intelligence | no disponible | no disponible | Sí | Comercial | API en la nube |

## Limitaciones y advertencias

- **No es un modelo**: el repositorio contiene una aplicación, no un modelo de lenguaje. Los pesos reales provienen de Gemma 4 12B-it, que deben descargarse por separado y están sujetos a la licencia de Google (Apache-2.0 para Gemma, pero se debe verificar).
- **Dependencia de hardware**: requiere una GPU NVIDIA con suficiente VRAM (12 GB o más). No funciona en el robot Lamp (6 GB RAM) ni en Apple Silicon.
- **Riesgo de alucinación**: la extracción de recibos puede producir errores en campos como el total o la fecha, especialmente con recibos de baja calidad o manuscritos. El sistema incluye una interfaz de revisión manual para mitigar este riesgo.
- **Privacidad**: aunque el procesamiento es local, el usuario debe asegurarse de que el servidor esté en una red confiable (por ejemplo, red Wi-Fi doméstica) y proteger el acceso a la interfaz web.
- **Licencia del modelo**: la licencia Apache-2.0 del repositorio no cubre los pesos de Gemma 4. Se debe cumplir con los términos de uso de Google para Gemma (que permiten uso comercial con restricciones).
- **Falta de documentación**: no hay información sobre el entrenamiento del modelo, ni benchmarks, ni métricas de precisión en la extracción. La fiabilidad en producción no está verificada.

## Enlaces

- Hugging Face: [drowzeys/keys-Auto-Receipts-Studio](https://huggingface.co/drowzeys/keys-Auto-Receipts-Studio)
- GitHub: [drowzeys/keys-Auto-Receipts-Studio](https://github.com/drowzeys/keys-Auto-Receipts-Studio)
- Autonomous OS (proyecto base): [https://github.com/autonomous-ai/autonomous-os](https://github.com/autonomous-ai/autonomous-os)
- (Los resultados de búsqueda web sobre ReceiptsAI, Microsoft y Google AI Studio no aportan información relevante para este modelo y no se incluyen.)
