# DreamFoundries/K2-Horizon-MoVA-36B-A4B-MLX-8bit

## Resumen

`DreamFoundries/K2-Horizon-MoVA-36B-A4B-MLX-8bit` es una conversión MLX en cuantización 8-bit del modelo `IFM/K2-Horizon-MoVA-36B-A4B`, creado por el Institute of Foundation Models (IFM) y distribuido bajo licencia Apache-2.0. Esta variante, publicada por DreamFoundries, está optimizada para ejecutarse en Apple Silicon mediante el framework MLX y se ofrece a través de MLXHub.

El modelo original es un modelo de lenguaje con arquitectura sparse Mixture-of-Experts (MoE) y atención Mixture-of-Values (MoVA), con 36B parámetros totales y solo 4B activos por token. Según la ficha de Benchgen, dispone de una ventana de contexto nativa de 512K tokens y supera a modelos densos y MoE de hasta 15 veces su tamaño activo en benchmarks de agencia y razonamiento. Esta conversión 8-bit reduce los requisitos de memoria mientras mantiene los routers K2 (`mlp.gate` y `self_attn.v_router`) sin cuantizar.

La relevancia de esta versión radica en su despliegue local sobre Apple Silicon, sin dependencia de servicios externos, manteniendo las capacidades del modelo base para tareas de contexto largo, razonamiento y agentes. No se han publicado benchmarks específicos de la conversión.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con sparse Mixture-of-Experts (MoE) y atención Mixture-of-Values (MoVA) |
| Parametros totales | 36B |
| Parametros activos | 4B activos por token |
| Longitud de contexto | 512K tokens (nativo del modelo base) |
| Tipos de cuantizacion | 8-bit affine con group size 64 (MLX); routers K2 sin cuantizar |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base es un modelo de lenguaje generativo basado en transformer con una arquitectura sparse MoE: de los 36B parámetros totales, solo 4B se activan por token. La innovación principal es la atención Mixture-of-Values (MoVA), que combina múltiples proyecciones de valor, y la integración de routers K2 que gestionan la selección de expertos. En esta conversión MLX, los routers `mlp.gate` y `self_attn.v_router` permanecen sin cuantizar para preservar la precisión en la selección de rutas, mientras que el resto de los pesos se cuantizan a 8-bit affine con group size 64. No se dispone de información sobre los datos de entrenamiento, el número de tokens ni procesos de alineación como RLHF o DPO.

## Capacidades

- Generación de texto y conversación: modelo de lenguaje generativo orientado a tareas de texto en inglés.
- Razonamiento y agencia: según Benchgen, el modelo original supera a modelos densos y MoE de hasta 15 veces su tamaño activo en benchmarks de razonamiento y agentes.
- Contexto largo: ventana de 512K tokens que permite manejar documentos extensos y conversaciones con historial completo.
- Soporte multilingüe: la documentación disponible indica únicamente inglés (en); no hay evidencia de rendimiento en otros idiomas.
- Tool calling / function calling: no especificado en la información disponible.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Núcleo de razonamiento para agentes: gracias a los resultados en benchmarks de agencia, el modelo puede planificar pasos, decidir acciones y resolver tareas de varios pasos en sistemas agénticos.
- Análisis de documentos extensos: con 512K tokens de ventana, permite procesar informes, papers o contratos de cientos de páginas y responder preguntas específicas sobre el contenido completo.
- Asistentes conversacionales de largo recorrido: la ventana de contexto amplia mantiene la coherencia en conversaciones multi-turno con todo el historial disponible.
- Síntesis de información en investigación: puede resumir grandes volúmenes de texto, extraer conclusiones y comparar secciones de múltiples documentos.
- Generación de documentación técnica: a partir de especificaciones, código o descripciones, puede redactar documentación y explicaciones técnicas, aunque no se ha confirmado un soporte específico para código.
- Ejecución local privada en Apple Silicon: la conversión MLX permite ejecutar el modelo en Macs con Apple Silicon sin APIs externas, adecuado para aplicaciones que requieren privacidad de datos o funcionamiento sin conexión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La ficha de Benchgen indica de forma cualitativa que el modelo original supera a modelos densos y MoE de hasta 15 veces su tamaño activo en benchmarks de agentes y razonamiento, y compite con modelos frontera cerrados. No obstante, no se ofrecen cifras concretas. La conversión MLX 8-bit no dispone de benchmarks comparativos que validen su rendimiento en relación con el modelo base.

## Requisitos de hardware

- VRAM estimada: los pesos de 36B en cuantización 8-bit ocupan aproximadamente 36 GB en memoria unificada. Considerando la cache de atención y los buffers de inferencia, se recomienda una Mac con al menos 64 GB de memoria unificada.
- GPU recomendada: Apple Silicon (M1, M2, M3, M4). MLX no es compatible con GPUs NVIDIA o AMD.
- ¿Cabe en consumer GPU? No aplica para MLX; en macOS, se requiere una Mac con 64 GB o más de RAM unificada.
- Opciones de despliegue: mlx-lm (fork de DreamFoundries en `0f74c0e`), MLXHub, y la interfaz `load`/`generate` del paquete `mlx_lm`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| DreamFoundries/K2-Horizon-MoVA-36B-A4B-MLX-8bit | 36B | 4B | 512K | Apache-2.0 | MLX 8-bit |
| IFM/K2-Horizon-MoVA-36B-A4B (base) | 36B | 4B | 512K | Apache-2.0 | Safetensors (original) |
| IFM/K2-Horizon-375B-A23B | 379B | 23B | no disponible | no disponible | no disponible |

El rendimiento comparativo entre estos modelos no está disponible en la información proporcionada. El modelo de 375B pertenece a la misma colección K2 Horizon, pero se desconocen detalles sobre su ventana de contexto, licencia y formato.

## Limitaciones y advertencias

- La cuantización 8-bit puede introducir una degradación leve de la calidad respecto al modelo base, especialmente en tareas que requieren alta precisión numérica o exactitud factual.
- Solo se documenta soporte para el idioma inglés. El rendimiento en otros idiomas no ha sido verificado.
- El repositorio en HuggingFace muestra un tamaño de 0.0 GB, lo que podría indicar que los pesos no se han subido completamente. Se debe verificar el estado del repositorio antes de su uso.
- No hay información sobre los datos de entrenamiento ni sobre procesos de alineación (RLHF/DPO). No se pueden garantizar comportamientos seguros ni robustez ante intentos de manipulación del prompt.
- Riesgo de alucinación inherente a los modelos generativos de lenguaje, especialmente en tareas abiertas o de razonamiento creativo.
- No se han publicado benchmarks de la conversión MLX, por lo que el rendimiento real en producción debe validarse de forma independiente.

## Enlaces

- Modelo HuggingFace: https://huggingface.co/DreamFoundries/K2-Horizon-MoVA-36B-A4B-MLX-8bit
- Modelo base: https://huggingface.co/IFM/K2-Horizon-MoVA-36B-A4B
- Colección K2 Horizon de IFM: https://huggingface.co/collections/IFM/k2-horizon
- Ficha en Benchgen: https://benchgen.com/models/ifm/k2-horizon-mova-36b-a4b
- MLXHub: https://mlxhub.app/open-model?repo=DreamFoundries/K2-Horizon-MoVA-36B-A4B-MLX-8bit
