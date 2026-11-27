# brainworkup/Muse-Glimmer-30B-Abliterated-MM-oQ5e

## Resumen

Muse-Glimmer-30B-Abliterated-MM-oQ5e es una cuantizacion de 5 bits del modelo Muse-Glimmer-30B-Abliterated-MM-bf16, publicada por el usuario brainworkup en Hugging Face. Se trata de un derivado de la familia Muse-Glimmer-30B, cuyo origen se atribuye a meta-models, y que ha pasado por un proceso de "abliteracion" (eliminacion de mecanismos de rechazo) antes de ser cuantizado con la herramienta oQ de oMLX v0.6.3rc1 en formato MLX safetensors con grupo de 64.

El modelo cuenta con 29.776.626.688 parametros (aproximadamente 29,8 mil millones) y un repositorio de 23,8 GB, lo que es coherente con una cuantizacion de 5 bits de un modelo de ese tamano. La relevancia de esta ficha radica en que permite ejecutar un modelo de casi 30B en hardware Apple Silicon mediante MLX, aunque con la advertencia de que se trata de una cuantizacion de terceros sin model card detallada ni garantias de calidad.

La informacion publicada es muy escasa: no se especifican licencia, idiomas, pipeline, contexto ni detalles de entrenamiento. Esta ficha documenta lo que se puede verificar a partir de los metadatos y advierte explicitamente de las lagunas existentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (tipo de modelo declarado: muse_glimmer) |
| Parametros totales | 29.776.626.688 (29,8B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 5 bits, group size 64, formato MLX safetensors (oQ mixed-precision) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX), repositorio de 23,8 GB |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base Muse-Glimmer-30B. El tag `muse_glimmer` sugiere una familia propia, pero no se documenta si se trata de un transformer denso, un MoE o una arquitectura hibrida. El numero de parametros (29,8B) es el unico dato estructural verificable.

Respecto al entrenamiento, no hay datos sobre numero de tokens, composicion del dataset ni uso de RLHF/DPO. El sufijo "Abliterated" indica que el modelo base paso por un proceso de abliteracion, una tecnica de modificacion de pesos que elimina la direccion de rechazo en el espacio de activaciones para reducir las negativas del modelo a ciertas peticiones. El sufijo "MM" podria sugerir capacidades multimodales, pero no se confirma en la informacion disponible. La cuantizacion se realizo con oQ (oMLX v0.6.3rc1) en modo mixed-precision a 5 bits con group size 64.

## Capacidades

- Generacion de texto: capacidad esperada por tratarse de un modelo de lenguaje de 29,8B, aunque no se detalla en la model card.
- Razonamiento y conocimiento general: no documentado.
- Generacion de codigo: no documentado.
- Matematicas: no documentado.
- Vision: el sufijo "MM" podria indicar multimodalidad, pero no se confirma.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles.
- Modo thinking: no disponible.

## Casos de uso

- Inferencia local en Apple Silicon: al estar en formato MLX, el modelo esta pensado para ejecutarse en Macs con chip M-series mediante la libreria MLX, aprovechando la memoria unificada para cargar los 23,8 GB de pesos.
- Experimentacion con modelos abliterated: util para investigadores que estudian el efecto de la abliteracion en el comportamiento del modelo y su alineacion.
- Prototipado de asistentes conversacionales: un modelo de 29,8B puede manejar conversaciones multi-turno, aunque se desconoce su ventana de contexto real.
- Evaluacion comparativa de cuantizaciones: sirve para medir la perdida de calidad de una cuantizacion de 5 bits frente al bf16 original en tareas de generacion.
- Investigacion sobre seguridad y robustez: el caracter abliterated lo hace interesante para estudiar jailbreaks y mecanismos de rechazo.
- Despliegue en entornos con memoria unificada limitada: la cuantizacion de 5 bits reduce el footprint frente al bf16, permitiendo cargar el modelo en equipos con 32-64 GB de RAM unificada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: aproximadamente 23,8 GB para los pesos en 5 bits, mas overhead de ejecucion (KV cache y buffers), por lo que se recomienda al menos 32 GB de memoria unificada.
- GPU recomendadas: no aplica GPU CUDA; el formato es MLX, orientado a Apple Silicon (M1/M2/M3/M4 Pro, Max y Ultra).
- Cabe en consumer GPU: no en el sentido tradicional de CUDA; en Apple Silicon, si en equipos con 32 GB o mas de memoria unificada.
- Opciones de despliegue: MLX y oMLX (herramienta de cuantizacion); no se garantiza compatibilidad con llama.cpp, vLLM, Ollama o TGI al ser pesos MLX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Muse-Glimmer-30B-Abliterated-MM-oQ5e | 29,8B | no disponible | no disponible | MLX safetensors 5-bit | Hugging Face (208 descargas) |
| Muse-Glimmer-30B-Abliterated-MM-bf16 | no disponible | no disponible | no disponible | safetensors bf16 | Hugging Face |
| Muse-Glimmer-30B (base) | no disponible | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento ni de otros modelos comparables de la misma familia con informacion verificable.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar si el uso comercial esta permitido; es imprescindible contactar con el autor o consultar el modelo base antes de usarlo en produccion.
- Modelo abliterated: la eliminacion de mecanismos de rechazo puede aumentar la probabilidad de generar contenido inapropiado, danino o inseguro, y reduce las salvaguardas de alineacion.
- Cuantizacion de terceros: la cuantizacion a 5 bits puede introducir degradacion de calidad respecto al bf16 original; no hay evaluaciones publicadas que lo cuantifiquen.
- Falta de documentacion: sin model card detallada, no se conocen sesgos, idiomas soportados, contexto real ni datos de entrenamiento.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no hay evaluaciones especificas para este modelo.
- Compatibilidad limitada: al ser pesos MLX, no se pueden usar directamente en stacks CUDA (vLLM, TGI) sin conversion.
- Advertencia del autor: la version actual reemplaza a una anterior publicada antes del 2026-08-20; quienes descargaron la version previa deben volver a descargar los pesos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/brainworkup/Muse-Glimmer-30B-Abliterated-MM-oQ5e
- Modelo base (bf16): https://huggingface.co/divinetribe/Muse-Glimmer-30B-Abliterated-MM-bf16
- Modelo base original: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
