# localgradient/Keyword-0.8B-4bit

## Resumen

Keyword-0.8B-4bit es un modelo de lenguaje especializado en planificación de búsqueda, desarrollado por localgradient como parte del sistema SyncNotes. Su función es extraer términos de búsqueda booleanos a partir de una pregunta en lenguaje natural, generando una salida JSON estructurada que un motor de búsqueda determinista ejecuta posteriormente. El modelo no compone respuestas ni genera prosa: es un componente de planificación de consultas diseñado para búsqueda personal en el dispositivo.

Se basa en el modelo Qwen3.5-0.8B de Alibaba Cloud, ajustado por completo (full fine-tune, no LoRA) sobre un corpus sintético de 192 personas, 6.384 notas y 2.575 preguntas, sin usar datos reales de usuario en ningún momento. La versión publicada está cuantizada a 4 bits (affine, group size 64, 4.508 bits por peso) con la librería mlx, lo que reduce el repositorio a 0,4 GB y permite su ejecución en dispositivos con recursos limitados.

La relevancia del modelo radica en su enfoque: sustituye la división por stopwords o la extracción heurística de términos por un modelo entrenado específicamente para planificar búsquedas booleanas, mejorando la precisión de la recuperación en sistemas de búsqueda personal. Licenciado bajo Apache 2.0, está pensado para integrarse en pipelines de RAG o búsqueda local determinística.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (decoder-only), base Qwen3.5-0.8B |
| Parámetros totales | 117.982.030 (≈0,8B) |
| Parámetros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4-bit affine, group size 64 (4,508 bits/peso) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (mlx) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer decoder-only de Qwen3.5-0.8B, con atención completa y una ventana de contexto que no se detalla en la información publicada. El ajuste se realizó mediante fine-tune completo sobre el corpus sintético de SyncNotes, compuesto por 6.384 notas generadas a partir de 192 personas simuladas y 2.575 preguntas de búsqueda sintéticas. No se empleó ningún dato real de usuarios, ni notas, ni OCR, ni texto de preguntas, como restricción explícita de la campaña de entrenamiento.

La salida se genera con decodificación greedy y temperatura 0, produciendo un único objeto JSON con los campos `terms` (lista de términos booleanos) y `alignment` (modo de alineación). El modelo no fue entrenado con técnicas de RLHF o DPO; su especialización es puramente de planificación de búsqueda. Tras el ajuste, los pesos se fusionaron y se cuantizaron localmente con `mlx_lm` 0.31.1 y `mlx` 0.31.1, reportando 4,508 bits por peso.

## Capacidades

- Extracción de términos de búsqueda booleanos a partir de preguntas en lenguaje natural, devolviendo una lista de términos y un modo de alineación (`both`, `any`, etc.).
- Generación de salida JSON estructurada y determinística con decodificación greedy a temperatura 0.
- Planificación de consultas para motores de búsqueda determinísticos, sustituyendo la división por stopwords o heurísticas.
- Integración como una mitad de un sistema de planificación de consultas en dos pasos (el otro modelo se encarga de otra parte del plan).
- Ejecución ligera en dispositivo gracias a la cuantización 4-bit (0,4 GB de repo).
- No genera prosa, no responde preguntas de forma conversacional y no soporta tool calling ni razonamiento multi-paso.

## Casos de uso

- Búsqueda personal en el dispositivo: el modelo convierte la pregunta del usuario en una consulta booleana que el motor de búsqueda local ejecuta sobre notas, correos o documentos, evitando fallos por separación de palabras vacías.
- RAG con recuperación determinística: en pipelines de generación aumentada, se usa para planificar qué términos buscar en el índice vectorial o de texto completo, garantizando que la recuperación se base en el modelo y no en heurísticas frágiles.
- Filtrado de documentos en sistemas de gestión de conocimiento: transforma preguntas como "muéstrame las facturas de ACME" en `{"terms":["invoice","acme"],"alignment":"both"}`, permitiendo búsquedas booleanas precisas en bases documentales.
- Asistentes de productividad (tipo SyncNotes): integrado en flujos de búsqueda local para convertir consultas conversacionales en consultas estructuradas antes de ejecutar la búsqueda.
- Preprocesamiento de consultas para motores de búsqueda clásicos: sirve como capa intermedia que normaliza preguntas en términos booleanos, facilitando la integración con motores tipo Lucene o SQL.
- Automatización de búsquedas en entornos con privacidad estricta: al ejecutarse en dispositivo y no enviar datos a la nube, es adecuado para aplicaciones que manejan información sensible y requieren que la planificación de búsqueda sea local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo está especializado en una tarea concreta (extracción de términos booleanos) y no se proporcionan métricas de calidad, latencia o throughput.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 0,4 GB en formato 4-bit; la inferencia puede caber en menos de 1 GB de VRAM, incluso en CPUs modernas con memoria compartida.
- GPUs recomendadas: cualquier GPU con al menos 1 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, Apple M1/M2 con Metal). No requiere GPU de centro de datos.
- Compatibilidad con consumer GPU: sí, cabe en la práctica totalidad de GPUs de consumo actuales.
- Opciones de despliegue: librería `mlx` para Apple Silicon; también puede convertirse a GGUF para llama.cpp/Ollama o servirse con vLLM/TGI si se convierte a safetensors estándar.
- Latencia y throughput: no hay datos publicados; al tratarse de un modelo de 0,8B cuantizado, se espera una latencia de milisegundos en hardware moderno, pero no se puede cuantificar con precisión.

## Comparativa con modelos similares

No hay disponibles modelos comparables con la misma especialización (extracción de términos booleanos) en la información proporcionada. Como referencia, el modelo base Qwen3.5-0.8B es un modelo de propósito general de 0,8B con licencia Apache 2.0, mientras que Keyword-0.8B-4bit está ajustado exclusivamente para esta tarea y cuantizado a 4 bits. Otras alternativas genéricas de extracción de términos (como modelos de NER o etiquetado) no son directamente comparables por su diseño y licencia.

## Limitaciones y advertencias

- El modelo solo funciona en inglés y no está entrenado para otros idiomas.
- No genera prosa ni respuestas: cualquier intento de usarlo como asistente conversacional producirá salidas no deseadas.
- Riesgo de salida degenerada: bajo prompts fuera de distribución, puede emitir texto repetitivo sin cerrar el JSON. El llamador debe tratar la salida no parseable como un fallo de planificación y recurrir a un plan de respaldo.
- El dataset de entrenamiento es enteramente sintético y pequeño (2.575 preguntas), lo que puede limitar la generalización a dominios o estilos de pregunta no vistos.
- No se han publicado benchmarks, por lo que no hay evidencia cuantitativa de su rendimiento frente a alternativas.
- No soporta tool calling, ni agentes, ni razonamiento multi-paso: su uso está restringido a la planificación de búsqueda.
- La licencia Apache 2.0 permite uso comercial, pero la especialización del modelo implica que su utilidad fuera del contexto de búsqueda determinística es nula.

## Enlaces

- [HuggingFace: localgradient/Keyword-0.8B-4bit](https://huggingface.co/localgradient/Keyword-0.8B-4bit)
- [Guía de la serie Qwen3.5 Small (0.8B-9B)](https://note.com/zephel01/n/n6b236da76680?hl=en) (referencia del modelo base)
