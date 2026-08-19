# dlab-cmu/sf-map-qwen3.8-27b

## Resumen

El repositorio `dlab-cmu/sf-map-qwen3.8-27b` contiene un mapa de sensibilidad por tensor (per-model sensitivity map) diseñado para el modelo Qwen3.8-27B, dentro del catálogo compartido de 27 opciones de cuantización SF (`dlab-cmu/sf-grids`). No se trata de un modelo de lenguaje en sí, sino de un artefacto auxiliar que guía la asignación de bits y la distribución de presupuesto de cuantización para optimizar la compresión del modelo base. Desarrollado por el equipo dlab-cmu, se publica con licencia MIT y formato JSON.

El archivo `sf-map.json` incluye el menú de 27 opciones con nombres de archivo y el coeficiente κ, métricas de divergencia KL directa (`direct_kl`) y plegada (`folded_kl`) por tensor, y la asignación asimétrica K/V para capas de atención completa, basada en α plegado y el error cuadrático medio (MSE) medido. Este mapa está pensado para usarse con el modelo Qwen3.8-27B, un modelo denso multimodal de 27 mil millones de parámetros desarrollado por Alibaba, con ventana de contexto nativa de 262K tokens y capacidades de visión-lenguaje.

La relevancia de este artefacto radica en la cuantización eficiente: permite seleccionar dinámicamente la precisión por tensor según su sensibilidad, lo que puede reducir el tamaño del modelo sin pérdida significativa de calidad. Es una pieza clave para quienes buscan desplegar Qwen3.8-27B en hardware con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mapa de sensibilidad (JSON) para cuantización SF; modelo base: Qwen3.8-27B (dense vision-language) |
| Parametros totales | No aplica (mapa); modelo base: 27 mil millones |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No aplica (mapa); modelo base: 262K tokens |
| Tipos de cuantizacion | SF (código de libro compartido, 27 opciones) |
| Idiomas soportados | No disponibles (mapa); modelo base: multilingüe (según documentación de Qwen) |
| Licencia | MIT |
| Formato de pesos | JSON (`sf-map.json`) |

## Arquitectura y entrenamiento

El mapa de sensibilidad se genera a partir del análisis del modelo Qwen3.8-27B, que es un transformer denso con arquitectura de visión-lenguaje (VLM) basada en Qwen3.5. El modelo base incorpora atención de tiempo completo y un mecanismo de razonamiento configurable, con soporte nativo para entrada de imágenes y video. El mapa en sí no se entrena; se calcula mediante métricas de divergencia KL (directa y plegada) entre las activaciones del modelo original y las versiones cuantizadas, junto con el error cuadrático medio en las capas de atención.

El proceso de cuantización SF (shared codebook) agrupa tensores con características similares para compartir un código de libro, reduciendo el overhead de almacenamiento. El mapa asigna un κ (factor de sensibilidad) a cada opción del catálogo, y recomienda usar `direct_kl` para precisiones ≥2 bpw y `folded_kl` para precisiones menores. La asignación de KV es asimétrica (K y V reciben distinta cantidad de bits) basada en la combinación de α plegado y el MSE medido.

## Capacidades

- Proporciona métricas de sensibilidad por tensor (direct_kl, folded_kl) para guiar la cuantización.
- Define un menú de 27 opciones de cuantización con coeficientes κ.
- Soporta asignación asimétrica de bits para las cabezas de atención (K/V).
- Compatible con el catálogo `dlab-cmu/sf-grids` para generar pesos cuantizados.
- El modelo base Qwen3.8-27B (referencia) ofrece: generación de texto, razonamiento, código, visión (imágenes y video), agentes autónomos y office automation.
- El modelo base tiene modo de razonamiento configurable (thinking mode) y ejecución de agentes multi-paso.

## Casos de uso

- Cuantización de Qwen3.8-27B para despliegue en GPU consumer: el mapa permite seleccionar la precisión óptima por tensor, reduciendo la VRAM necesaria sin sacrificar calidad. Por ejemplo, usando `direct_kl` a 3 bpw en capas sensibles y 2 bpw en capas robustas.
- Optimización de memoria para inferencia en tiempo real: con la asignación asimétrica K/V se puede reducir el tamaño de las cachés de atención, mejorando el throughput en servidores con memoria limitada.
- Investigación en compresión de modelos: el mapa sirve como referencia para estudiar la sensibilidad de diferentes tensores y validar nuevas estrategias de cuantización.
- Desarrollo de pipelines de despliegue con vLLM o llama.cpp: los pesos cuantizados generados con el catálogo SF se pueden integrar en estos frameworks para inferencia local.
- Evaluación de trade-offs entre tamaño y rendimiento: los valores de κ y MSE permiten comparar distintas configuraciones de cuantización antes de elegir una.
- Ajuste fino de la cuantización para tareas específicas: si se conoce la distribución de activaciones de una tarea concreta, se puede recalibrar el mapa para mejorar la precisión en ese dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para el mapa de sensibilidad en la información disponible. Sin embargo, el modelo base Qwen3.8-27B reporta los siguientes resultados (según los resultados de búsqueda web):

| Benchmark | Resultado |
|---|---|
| DeepSWE | 42.2 |
| Terminal Bench | 73.0 |
| OSWorld | 84.3 |

Estos valores corresponden al modelo original sin cuantizar; no se dispone de datos sobre el rendimiento tras aplicar el mapa de cuantización.

## Requisitos de hardware

- Para el mapa de sensibilidad: no requiere hardware especial, es un archivo JSON de pequeño tamaño (pocos MB).
- Para el modelo base Qwen3.8-27B (referencia):
  - VRAM estimada: al menos 16 GB para cuantización de 4 bits, 24 GB para 8 bits, y 48 GB para precisión completa (fp16).
  - GPU recomendadas: RTX 4090 (24 GB) para cuantización 4-6 bits, A100 40/80 GB para fp16 o mayor contexto.
  - No cabe en GPUs consumer de 8 GB; se requieren al menos 16 GB para una experiencia usable.
  - Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI (todos soportan cuantización GGUF/AWQ).
  - Latencia y throughput: no disponibles; dependen del hardware y la configuración de cuantización.

## Comparativa con modelos similares

No se dispone de información sobre otros mapas de sensibilidad comparables en la misma categoría. En cuanto al modelo base, se puede comparar con otras VLM densas de tamaño similar:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.8-27B | 27B | 262K | Apache 2.0 | Open weights |
| Llama 3.1 8B (VLM) | 8B | 128K | Llama 3.1 | Open weights |
| Qwen2.5-VL-27B | 27B | 128K | Apache 2.0 | Open weights |

El mapa de sensibilidad es específico para Qwen3.8-27B y no tiene equivalente directo en otros modelos.

## Limitaciones y advertencias

- El mapa es un artefacto auxiliar, no un modelo funcional; no puede usarse para generar texto ni procesar imágenes.
- Las métricas de sensibilidad se calcularon sobre el modelo base sin cuantizar; los resultados pueden variar si se aplican a versiones ajustadas o con fine-tuning.
- La asignación asimétrica K/V se basa en datos medidos para el modelo original; puede no ser óptima para otras arquitecturas.
- El uso comercial está permitido por la licencia MIT, pero el modelo base Qwen3.8-27B tiene licencia Apache 2.0 (según resultados web), que también permite uso comercial.
- No se garantiza que las 27 opciones del catálogo produzcan resultados de calidad uniforme; se recomienda validar en tareas específicas.
- La documentación no especifica el método exacto de cálculo de κ ni la procedencia de los datos de entrenamiento del modelo base.

## Enlaces

- HuggingFace: [dlab-cmu/sf-map-qwen3.8-27b](https://huggingface.co/dlab-cmu/sf-map-qwen3.8-27b)
- Catálogo SF: [dlab-cmu/sf-grids](https://huggingface.co/dlab-cmu/sf-grids)
- Repositorio del modelo base: [Qwen3.8-27B - GitHub](https://github.com/AlibabaCloud-Official/Qwen3.8-27B)
- Guía de Qwen3.8-27B: [OpenLM.ai](https://openlm.ai/qwen3.8/)
- Página en LM Studio: [lmstudio.ai/models/qwen3.8](https://lmstudio.ai/models/qwen3.8)
- Artículo de análisis: [lovableapp.org/blog/qwen3-8-27b](https://lovableapp.org/blog/qwen3-8-27b)
