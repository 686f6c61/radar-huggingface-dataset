# EigenLabs/Qwen3.5-35B-A3B-MLX-VL-4bit-g64-router8

## Resumen

EigenLabs/Qwen3.5-35B-A3B-MLX-VL-4bit-g64-router8 es una cuantizacion MLX en 4 bits del modelo Qwen/Qwen3.5-35B-A3B, un modelo de lenguaje multimodal de la familia Qwen 3.5 desarrollado por Alibaba. La cuantizacion ha sido realizada por EigenLabs y esta optimizada para ejecutarse nativamente en Apple Silicon mediante las librerias `mlx-lm` y `mlx-swift-lm`, sin necesidad de kernels personalizados.

El modelo base es un MoE hibrido de 35B parametros totales con 3B activos por token, que combina 30 capas de atencion lineal GatedDeltaNet con 10 capas de atencion completa (full-attention), y utiliza 256 expertos con top-8 mas un experto compartido. Esta variante cuantizada reduce el peso total a aproximadamente 19,5 GB, lo que permite ejecutar el modelo en equipos Apple Silicon con 24 GB o mas de memoria unificada.

La relevancia de este lanzamiento radica en que Qwen3.5 es una familia de modelos de peso abierto bajo licencia Apache 2.0, nativamente multimodal (texto, imagen y video), y esta cuantizacion especifica hace que un modelo de 35B con activacion de 3B sea viable en hardware de consumo de Apple, manteniendo la calidad del modelo original con un coste de memoria significativamente reducido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE hibrido (30 capas GatedDeltaNet + 10 capas full-attention, 256 expertos top-8 + experto compartido) |
| Parametros totales | 35B |
| Parametros activos | 3B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (MLX mixed-precision, ~4,6 bpw) |
| Idiomas soportados | no disponible (multilingue, segun la familia Qwen3.5) |
| Licencia | Apache 2.0 (segun tag de HuggingFace; el campo licencia indica "no disponible") |
| Formato de pesos | safetensors, formato MLX affine (mlx) |
| Libreria | mlx |

## Arquitectura y entrenamiento

La arquitectura de Qwen3.5-35B-A3B es un MoE hibrido que mezcla atencion lineal con transformadores clasicos. Concretamente, el modelo esta formado por 30 capas de GatedDeltaNet (una variante de atencion lineal con mecanismo de compuerta) y 10 capas de full-attention, con un total de 256 expertos de los cuales se activan los top-8 mas un experto compartido, resultando en 3B parametros activos por token. Esta mezcla reduce el coste computacional en inferencia manteniendo una capacidad de modelado comparable a un denso de tamano similar.

El modelo es multimodal de nacimiento: procesa texto, imagenes y video, y pertenece a la familia Qwen3.5 que se entrena con un pipeline que combina preentrenamiento en corpus multilingue y multimodal, seguido de fases de alineacion con supervisacion (RLHF/DPO) para capacidades de chat y razonamiento. La cuantizacion realizada por EigenLabs utiliza formato MLX affine estandar (sin kernels personalizados) con precision mixta de 4-bit, alcanzando aproximadamente 4,6 bits por peso (bpw) y un peso final de unos 20 GB.

## Capacidades

- Generacion de texto y razonamiento multimodal: procesa entradas de texto, imagen y video, generando respuestas textuales coherentes con el contexto visual.
- Razonamiento y matematica: hereda las capacidades de razonamiento de la familia Qwen3.5, incluyendo razonamiento paso a paso y resolucion de problemas matematicos.
- Generacion de codigo: soporta tareas de programacion en multiples lenguajes, aunque la cuantizacion 4-bit puede afectar ligeramente la precision en tareas complejas.
- Tool calling / function calling: compatible con el protocolo de tool calling de Qwen, util para integracion en agentes.
- Capacidades multilingues: el modelo base soporta multiples idiomas (la cuantizacion no elimina esta capacidad, aunque no se han publicado los idiomas exactos).
- MTP (Multi-Token Prediction): el tag del modelo incluye "mtp", lo que sugiere que soporta prediccion multi-token, mejorando el throughput de generacion.
- Ejecucion en Apple Silicon: gracias al formato MLX, se ejecuta nativamente en CPU/GPU de Apple sin emulacion ni kernels adicionales.

## Casos de uso

- Asistente multimodal local en Mac: permite a desarrolladores y creadores ejecutar un asistente de vision-lenguaje en un MacBook Pro o Mac Studio con 32 GB o mas de RAM, procesando imagenes y respondiendo preguntas sobre ellas sin conexion a la nube.
- Prototipado de agentes con tool calling: al soportar function calling y ejecutarse en MLX, se puede integrar en pipelines de agentes locales que llaman a APIs o ejecutan scripts, aprovechando el bajo coste de activacion de 3B por token para iteraciones rapidas.
- Analisis de documentos y capturas de pantalla: con su capacidad multimodal, puede extraer informacion de capturas de pantalla, documentos escaneados o diagramas, y generar resumenes o respuestas a preguntas sobre ellos.
- Generacion de codigo asistida en entornos offline: desarrolladores que trabajan en entornos aislados pueden usar el modelo para autocompletar o generar snippets de codigo, aprovechando el soporte de codigo de la familia Qwen3.5.
- Investigacion academica y evaluacion de MoE hibridos: el modelo permite experimentar con arquitecturas MoE hibridas (GatedDeltaNet + full attention) en hardware de consumo, facilitando la comparacion con modelos densos o MoE clasicos.
- Educacion y formacion en IA local: talleres y cursos pueden desplegar el modelo en equipos de estudiantes con Apple Silicon para demostrar inferencia multimodal y cuantizacion sin depender de GPUs de gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La cuantizacion de Eigen Labs no incluye datos de evaluacion comparativa con el modelo original, ni se han encontrado resultados de MMLU, HumanEval, GSM8K u otros para esta variante especifica. Se recomienda consultar los benchmarks del modelo base Qwen3.5-35B-A3B en la documentacion oficial de Alibaba para una referencia de rendimiento sin cuantizar.

## Requisitos de hardware

- VRAM estimada: el modelo cuantizado en 4-bit pesa aproximadamente 19,5 GB, por lo que requiere al menos 20 GB de memoria unificada libre en Apple Silicon (recomendable 24 GB o mas para margen).
- GPU compatibles: solo Apple Silicon (M1, M2, M3, M4, incluyendo variantes Pro, Max y Ultra). No se puede ejecutar en GPUs NVIDIA o AMD sin convertir el formato.
- Equipos compatibles: MacBook Pro con 32 GB o mas, Mac Studio o Mac Pro con 64 GB o mas. Los Mac con 16 GB no son suficientes para este modelo en 4-bit.
- Opciones de despliegue: `mlx-lm` para Python, `mlx-swift-lm` para aplicaciones Swift, y potencialmente integracion en servidores locales via `mlx-lm-server`.
- Latencia y throughput: no se han publicado datos especificos para el modelo 35B-A3B en MLX. Como referencia, el modelo 9B de la familia alcanza 25-35 tokens/s en una Mac M4 con 16 GB; el 35B-A3B, al activar solo 3B por token, deberia tener un throughput superior al de un denso de 35B, pero inferior al del 9B. No hay datos exactos disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Arquitectura | Cuantizacion | Hardware objetivo |
|---|---|---|---|---|---|---|
| Qwen3.5-35B-A3B (base) | 35B | 3B | no disponible | MoE hibrido (GatedDeltaNet + full-attention) | FP16/BF16 | GPU/A100/H100 |
| Qwen3.5-9B (base) | 9B | 9B | no disponible | Denso | FP16/BF16 | GPU de consumo |
| Qwen3.5-27B (base) | 27B | 27B | no disponible | Denso | FP16/BF16 | GPU de gama alta |
| Qwen3.5-35B-A3B-MLX-VL-4bit (este) | 35B | 3B | no disponible | MoE hibrido | MLX 4-bit (~4,6 bpw) | Apple Silicon |
| Qwen3.5-122B-A10B (base) | 122B | 10B | no disponible | MoE | FP16/BF16 | Multi-GPU |

La comparativa muestra que esta cuantizacion MLX es la unica de la familia optimizada para Apple Silicon, manteniendo la arquitectura MoE hibrida del modelo base. Frente a los modelos densos de la misma familia, ofrece un coste de inferencia mucho menor (3B activos) a cambio de una cuantizacion agresiva de 4-bit que puede degradar ligeramente la calidad.

## Limitaciones y advertencias

- Cuantizacion 4-bit: la precision reducida puede causar degradacion en tareas complejas de razonamiento o generacion de codigo en comparacion con el modelo base en BF16.
- Dependencia de Apple Silicon: no es portatil a GPUs NVIDIA o AMD; requiere hardware de Apple con memoria unificada.
- Requisitos de memoria: aunque los parametros activos son solo 3B, el peso completo de 20 GB debe cargarse en memoria, por lo que no es viable en equipos con menos de 24 GB de RAM unificada.
- Idiomas no especificados: no se ha publicado la lista de idiomas soportados en esta variante, aunque la familia Qwen3.5 es multilingue.
- Licencia: el campo de licencia en HuggingFace indica "no disponible", aunque el tag del modelo base indica Apache 2.0. Es recomendable verificar la licencia exacta del modelo base antes de un uso comercial.
- Riesgo de alucinacion: como cualquier LLM, puede generar informacion falsa o inventada, especialmente con entradas ambiguas o en dominios especializados.
- Sin benchmarks publicados: no hay datos de rendimiento de esta cuantizacion especifica, por lo que no se puede comparar con el modelo base o con otras cuantizaciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/EigenLabs/Qwen3.5-35B-A3B-MLX-VL-4bit-g64-router8
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Guia de MLX en Apple Silicon: https://willitrunai.com/blog/qwen-3-5-mlx-apple-silicon-guide
- Analisis de la familia Qwen3.5: https://qwen-ai.com/qwen-3-5/
- Deep dive de Qwen3.5 (35B-A3B, 27B, 122B-A10B, 397B-A17B): https://localclaw.io/blog/qwen35-deep-dive
