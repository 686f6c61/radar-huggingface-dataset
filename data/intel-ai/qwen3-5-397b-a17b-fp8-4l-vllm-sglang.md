# intel-ai/Qwen3.5-397B-A17B-FP8-4L-vLLM-SGLang

## Resumen

Qwen3.5-397B-A17B-FP8-4L-vLLM-SGLang es un checkpoint reducido publicado por intel-ai a partir del modelo Qwen/Qwen3.5-397B-A17B-FP8 de Alibaba Qwen. Se trata de una variante experimental del conjunto "Reduced Models" en la que se ha recortado el número de capas del transformer original (configuración "4L") manteniendo el formato de pesos FP8, con el objetivo de servir como artefacto ligero para validar flujos de inferencia en vLLM y SGLang.

El modelo base es un MoE de 397.000 millones de parámetros totales con 17.000 millones activos, orientado a generación de texto y conversación. Esta variante reducida conserva, según los safetensors del repositorio, 35.083.743.488 parámetros efectivos, lo que refleja la poda de capas respecto al original. El repositorio ocupa 37,3 GB y se distribuye en formato safetensors con cuantización FP8.

Su relevancia es fundamentalmente práctica para ingeniería de despliegue: permite probar configuraciones de vLLM y SGLang, pipelines de carga de pesos FP8 y estrategias de paralelización sin necesidad de aprovisionar la infraestructura completa del modelo de 397B. No es un modelo pensado para producción ni para evaluación de calidad: el propio autor advierte que la salida puede aparecer corrupta en algunas peticiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tag `qwen3_5_moe`), variante reducida a 4 capas |
| Parametros totales | 35.083.743.488 (checkpoint reducido); modelo base: 397B totales |
| Parametros activos | 17B en el modelo base (no confirmado para la variante reducida) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 37,3 GB |
| Libreria / runtime | vLLM (validado); objetivo tambien SGLang |
| Modelo base | Qwen/Qwen3.5-397B-A17B-FP8 |

## Arquitectura y entrenamiento

La arquitectura de partida es un transformer con mezcla de expertos (MoE) identificado por el tag `qwen3_5_moe`, con 397B parámetros totales y 17B activos por token en el modelo original. Esta variante aplica una reducción de profundidad a 4 capas ("4L") sobre el checkpoint FP8 de Qwen, de modo que el grafo resultante es mucho más superficial y el número de parámetros materializados cae a unos 35.000 millones.

No se dispone de información sobre el proceso de entrenamiento del modelo base (número de tokens, composición del dataset, fases de RLHF o DPO) ni sobre el procedimiento exacto de reducción aplicado por intel-ai más allá de la indicación de variante FP8 y configuración de 4 capas. La model card no documenta innovaciones técnicas adicionales como decodificación especulativa o atención lineal. La validación declarada se limita a verificar que el checkpoint carga y ejecuta el flujo de inferencia en vLLM.

## Capacidades

- Generación de texto y conversación: pipeline declarado `text-generation` con tag `conversational`.
- Ejecución en vLLM: el checkpoint ha sido validado en el flujo de inferencia de vLLM.
- Compatibilidad con SGLang: el nombre del repositorio indica soporte objetivo para SGLang, aunque la validación documentada es solo en vLLM.
- Carga de pesos en FP8: útil para probar rutas de cuantización FP8 en producción.
- Tool calling, agentes, razonamiento multi-paso, matemáticas, código y capacidades multilingües: no disponible en la información proporcionada para esta variante.
- Calidad de salida: el autor advierte que el texto generado puede aparecer corrupto en algunas peticiones; no debe asumirse calidad conversacional utilizable.

## Casos de uso

- Validación de pipelines de despliegue en vLLM: sirve para comprobar que una configuración de servidor, versión de vLLM y flags de carga de pesos FP8 funcionan antes de mover el modelo completo de 397B.
- Pruebas de integración con SGLang: permite ejercitar el arranque del runtime y la carga de safetensors FP8 en un entorno con requisitos de memoria muy inferiores al modelo original.
- CI/CD de infraestructura de inferencia: al ocupar 37,3 GB, puede integrarse en jobs automatizados que verifiquen compatibilidad de versiones tras actualizaciones de vLLM o de las librerías de cuantización.
- Desarrollo de herramientas de gestión de pesos: útil para probar cargadores, sharding y conversión de checkpoints FP8 sin descargar cientos de gigabytes.
- Benchmarking de latencia de infraestructura: permite medir tiempos de arranque, carga y throughput del servidor en un artefacto reducido, aislando el coste del runtime del coste del modelo.
- Reproducción de incidencias de despliegue: al ser un checkpoint pequeño y de acceso rápido, facilita depurar errores de carga, OOM o incompatibilidades de formato en entornos de staging.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 37,3 GB en FP8; se necesita al menos ese espacio en memoria de dispositivo o en memoria unificada, más overhead de activaciones y KV cache.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, un checkpoint FP8 de ~35B requiere GPUs de 48-80 GB (A100 80GB, H100 80GB, L40S 48GB) o configuraciones multi-GPU.
- GPU de consumo: no cabe en GPUs consumer de 24 GB (RTX 4090) en FP8 sin offloading o paralelización; no hay datos del autor que confirmen opciones viables.
- Opciones de despliegue: vLLM (validado) y SGLang (objetivo declarado). No se documenta soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Proposito |
|---|---|---|---|---|---|
| intel-ai/Qwen3.5-397B-A17B-FP8-4L-vLLM-SGLang | 35,08B (checkpoint reducido) | no disponible | safetensors FP8 | no disponible | Validacion de despliegue |
| Qwen/Qwen3.5-397B-A17B-FP8 | 397B totales / 17B activos | no disponible | safetensors FP8 | no disponible | Modelo completo de referencia |
| Otras variantes del set "Reduced Models" de intel-ai | no disponible | no disponible | safetensors FP8 | no disponible | Validacion de despliegue |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Calidad de salida degradada: el autor reconoce explícitamente que el texto generado puede aparecer corrupto en algunas peticiones y que el problema es conocido; no es apto para producción.
- Reducción de capas agresiva: pasar a 4 capas elimina gran parte de la profundidad del modelo original, lo que afecta a razonamiento, coherencia y seguimiento de instrucciones.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; debe verificarse en el repositorio del modelo base antes de cualquier uso.
- Idiomas no documentados: se desconoce el soporte multilingüe efectivo de esta variante.
- Contexto no documentado: no hay información sobre la ventana de contexto soportada tras la reducción.
- Sesgos y alucinaciones: no hay evaluación publicada; al ser un artefacto de validación, no deben asumirse garantías de fiabilidad.
- Validación limitada: solo se declara verificación en vLLM; el soporte en SGLang es un objetivo, no una garantía.
- Trazabilidad: al derivar de un checkpoint FP8 de Qwen, hereda las limitaciones del modelo base, que no están documentadas en esta ficha.

## Enlaces

- Hugging Face: https://huggingface.co/intel-ai/Qwen3.5-397B-A17B-FP8-4L-vLLM-SGLang
- Modelo base FP8: https://huggingface.co/Qwen/Qwen3.5-397B-A17B-FP8
