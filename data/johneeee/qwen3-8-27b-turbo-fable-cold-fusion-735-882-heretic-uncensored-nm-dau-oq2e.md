# Johneeee/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-oQ2e

## Resumen

Este modelo es una cuantización de 2 bits (oQ) del fine-tune `Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU`, creada por Johneeee mediante la herramienta oMLX v0.6.4. El modelo base es Qwen3.8-27B, un modelo denso de 27B parámetros desarrollado por Alibaba, con arquitectura híbrida de atención (lineal en 48 de 64 capas), torre de visión, cabeza MTP y contexto nativo de 262K tokens extensible a 1M. El fine-tune añade características como "uncensored" y "heritic", aunque no se dispone de documentación detallada sobre su entrenamiento.

La relevancia de esta versión cuantizada radica en que permite ejecutar un modelo de 27B en hardware con VRAM limitada, gracias a la compresión a 2 bits con group size 64. El repositorio ocupa 10.6 GB, lo que lo hace apto para GPUs de consumo medio. Sin embargo, la cuantización tan agresiva implica una pérdida de calidad notable y no se han publicado benchmarks específicos para esta versión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido (Qwen3.8-27B base) con atencion lineal en 48/64 capas, torre de vision y cabeza MTP |
| Parametros totales | 27B (modelo base) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262K nativo (modelo base), extensible a 1M |
| Tipos de cuantizacion | 2-bit (oQ), group size 64, mixed-precision |
| Idiomas soportados | No disponible (el modelo base soporta multiples idiomas, pero no se especifica para este fine-tune) |
| Licencia | No disponible (el modelo base es Apache 2.0, pero el fine-tune no declara licencia) |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 64 capas con hidden size 5,120 y vocabulario de 248,320 tokens. Su arquitectura hibrida combina atencion lineal en 48 de las 64 capas, lo que reduce el coste computacional en contextos largos, e incorpora una torre de vision (~1B parametros adicionales) y una cabeza MTP (Multi-Token Prediction) para decodificacion especulativa. El fine-tune `TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU` es un ajuste fino del que no se dispone de informacion publica sobre datos de entrenamiento, tecnicas de alineacion (RLHF/DPO) o innovaciones adicionales.

La cuantizacion se realizo con oQ (oMLX v0.6.4) en modo mixed-precision, aplicando 2 bits con group size 64. Esto reduce el tamaño del modelo de aproximadamente 54 GB (en FP16) a 10.6 GB, pero introduce una perdida de precision significativa que puede afectar a la coherencia y exactitud de las respuestas.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades del modelo base Qwen3.8-27B, incluyendo razonamiento complejo y comprension de contexto largo.
- Soporte de vision: el modelo base incluye una torre de vision, por lo que puede procesar imagenes, aunque no se ha verificado que el fine-tune conserve esta capacidad.
- Tool calling y function calling: el modelo base soporta estas funciones, pero no hay confirmacion para esta version cuantizada.
- Capacidades multilingues: el modelo base cubre multiples idiomas, pero no se especifica para este fine-tune.
- Modo "uncensored": el nombre sugiere que se ha eliminado parte del filtrado de contenido, lo que puede generar respuestas sin restricciones, pero no hay documentacion que lo confirme.
- Decodificacion especulativa: la cabeza MTP del modelo base podria estar presente, pero la cuantizacion a 2 bits puede degradar su funcionamiento.

## Casos de uso

- Ejecucion local en hardware limitado: gracias a la cuantizacion de 2 bits, el modelo cabe en GPUs con 12-16 GB de VRAM, permitiendo desplegar un LLM de 27B en equipos de consumo para prototipado o experimentacion.
- Generacion de texto creativo sin restricciones: el nombre "uncensored" sugiere que puede usarse para escritura creativa o roleplay donde se requiere menos filtrado, aunque esto conlleva riesgos eticos y legales.
- Pruebas de concepto en entornos Apple Silicon: al estar en formato MLX, se integra nativamente con el ecosistema de Apple para inferencia local en Macs con chip M-series.
- Investigacion sobre cuantizacion agresiva: sirve como caso de estudio para evaluar el impacto de la cuantizacion de 2 bits en modelos de 27B, comparando calidad y rendimiento frente a versiones de mayor precision.
- Desarrollo de agentes conversacionales en entornos con restricciones de memoria: el tamaño reducido permite ejecutar multiples instancias en una sola GPU, aunque con calidad degradada.
- Analisis de contenido en contextos donde se requiere baja latencia y no se dispone de GPU de alta gama: la cuantizacion reduce el uso de memoria y puede acelerar la inferencia en hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El enlace a un modelo similar de DavidAU menciona puntuaciones ARC-C y ARC-E para una version GGUF de 8 bits, pero no es este modelo y no se pueden extrapolar datos. No se dispone de mediciones de latencia, throughput ni calidad para esta cuantizacion especifica.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 10.6 GB, por lo que se necesitan al menos 12 GB de VRAM para cargar los pesos, mas overhead de activaciones y contexto. Se recomienda 16 GB para operar con comodidad.
- GPUs compatibles: RTX 4080/4090 (16-24 GB), RTX 3090 (24 GB), A100 (40 GB) o superiores. En Apple Silicon, Macs con 32 GB de RAM unificada o mas.
- Opciones de despliegue: al ser formato MLX, se puede usar con oMLX, MLX-LM o LM Studio en macOS. Para otras plataformas, habria que convertir a GGUF u otros formatos.
- Latencia y throughput: no disponibles. La cuantizacion de 2 bits reduce el tamaño pero puede aumentar la latencia por operaciones de de-cuantizacion en tiempo de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 262K | FP16/BF16 | Apache 2.0 | safetensors |
| Este modelo (oQ2e) | 27B | 262K (heredado) | 2-bit oQ | No disponible | MLX safetensors |
| Qwen3.8-27B GGUF (DavidAU) | 27B | 262K | 8-bit/4-bit | No disponible | GGUF |

La comparativa se limita a aspectos tecnicos, ya que no hay datos de rendimiento publicados para ninguna de las versiones cuantizadas. El modelo base es la referencia de calidad, mientras que las cuantizaciones sacrifican precision por eficiencia.

## Limitaciones y advertencias

- Cuantizacion de 2 bits: la perdida de precision es severa, lo que puede provocar respuestas incoherentes, errores de razonamiento y aumento de alucinaciones. No es recomendable para tareas criticas.
- Licencia no disponible: el uso comercial es incierto. Aunque el modelo base es Apache 2.0, el fine-tune no declara licencia, lo que puede generar problemas legales.
- Contenido "uncensored": el modelo puede generar contenido ofensivo, ilegal o inapropiado. No debe usarse en entornos de produccion sin filtros adicionales.
- Sesgos desconocidos: no hay informacion sobre el dataset de fine-tuning, por lo que los sesgos del modelo base pueden estar amplificados o alterados.
- Soporte de vision no verificado: la torre de vision del modelo base podria no funcionar correctamente tras la cuantizacion o el fine-tuning.
- Sin benchmarks: no se puede evaluar la calidad real del modelo frente a alternativas. Cualquier uso en produccion requiere validacion previa.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Johneeee/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-oQ2e
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Herramienta oQ (oMLX): https://github.com/jundot/omlx
- Informacion sobre Qwen3.8-27B en LLM Releases: https://www.llm-releases.com/models/qwen3-8-27b
- Blog de AMD sobre soporte de Qwen3.8-27B: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
