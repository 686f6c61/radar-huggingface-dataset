# mrminjae/qwen3p6-35b-a3b-2p10bit-r121

## Resumen

Qwen3.6-35B-A3B-2.10bit-r121 es un checkpoint de investigación publicado por el usuario mrminjae en Hugging Face, derivado del modelo base Qwen/Qwen3.6-35B-A3B. Se trata de una cuantización selectiva: únicamente los expertos enrutados del modelo MoE se almacenan a una media de 2,10 bits, mientras que el resto de pesos (atención, embeddings, router, capas densas) permanece en BF16. Los pesos se guardan dequantizados en tensores BF16, de modo que cargan con `transformers` estándar y con vLLM sin necesidad de kernels personalizados.

El modelo conserva la arquitectura MoE del original (etiqueta `qwen3_5_moe` en Hugging Face) y la capacidad image-text-to-text declarada en los tags, aunque la model card no detalla la composición exacta del entrenamiento ni los idiomas soportados. El recuento real de parámetros en safetensors es de 45.844.600.176 (unos 45,8 mil millones), superior a los 35B que sugiere el nombre, lo que probablemente refleja la suma de todos los expertos más los tensores compartidos.

Su relevancia es doble: por un lado, explora el límite práctico de la cuantización extrema (2,10 bits) aplicada solo a los expertos de un MoE, una técnica que reduce el tamaño del repositorio a 91,7 GB frente a los cientos de GB que ocuparía el modelo completo en BF16; por otro, demuestra que es posible servir un modelo de esta escala con infraestructura estándar sin reescribir el stack de inferencia. Es un artefacto de investigación, no un modelo listo para producción, y no cuenta con descargas ni validación de la comunidad en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tag `qwen3_5_moe`), multimodal image-text-to-text |
| Parametros totales | 45.844.600.176 (recuento real en safetensors) |
| Parametros activos | no disponible (el nombre indica 35B-A3B, es decir, ~3B activos, pero no se confirma en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos enrutados a 2,10 bits de media; resto de pesos en BF16; pesos almacenados dequantizados en BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica que sigue la licencia del modelo base, sin especificarla) |
| Formato de pesos | safetensors (carga con `transformers` y vLLM) |

## Arquitectura y entrenamiento

El modelo es una mezcla de expertos (MoE) derivada de Qwen3.6-35B-A3B. La innovación principal no está en el entrenamiento sino en el esquema de compresión: solo los expertos enrutados se cuantizan a una media de 2,10 bits, mientras que el resto de componentes (mecanismo de atención, embeddings, router y capas densas) se mantiene en BF16. Los pesos se almacenan ya dequantizados en tensores BF16, lo que significa que el ahorro se produce en el tamaño del repositorio (91,7 GB) y en el ancho de banda de carga, no necesariamente en la VRAM en tiempo de inferencia, que será la correspondiente a un modelo BF16 de ~45,8B parámetros.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste por preferencias. Tampoco se documentan innovaciones de decodificación (especulativa, atención lineal) más allá de la propia cuantización selectiva. El identificador interno del checkpoint es r121 y el autor lo describe explícitamente como "internal research checkpoint", sin garantías de reproducibilidad ni de calidad.

## Capacidades

- Generación de texto conversacional y de propósito general, heredada del modelo base Qwen3.6-35B-A3B.
- Procesamiento image-text-to-text: el tag de Hugging Face indica entrada multimodal de imagen y texto.
- Razonamiento multi-paso y conversación multi-turno, presumiblemente con soporte de modo "thinking" si el base lo incluye (no confirmado en la model card).
- Tool calling y function calling: no disponible en la documentación; dependerá del modelo base.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades de agente autónomo: no documentadas.

## Casos de uso

- Investigación en cuantización extrema de MoE: el checkpoint permite estudiar la degradación de calidad al comprimir solo los expertos a 2,10 bits, comparando salidas contra el modelo base en BF16 para tareas de razonamiento y generación.
- Servido en infraestructura con VRAM limitada: al cargar con `transformers` o vLLM estándar, se puede desplegar en un nodo con GPUs de 80 GB (A100/H100) usando paralelismo de tensor, sin kernels de cuantización personalizados.
- Prototipado rápido de aplicaciones multimodales: el tag image-text-to-text permite experimentar con pipelines de visión-lenguaje en entornos de investigación antes de comprometerse con el modelo completo.
- Evaluación comparativa de checkpoints comunitarios: útil como baseline para medir cuánto se pierde al reducir el repositorio de cientos de GB a 91,7 GB.
- Reproducción de experimentos de compresión: el identificador r121 y la descripción del esquema permiten replicar la metodología en otros MoE de la familia Qwen.
- Docencia y formación: ejemplo práctico de cómo se almacenan pesos dequantizados en BF16 y de las diferencias entre tamaño en disco y VRAM en inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al almacenarse los pesos dequantizados en BF16, la huella en memoria es la de un modelo de ~45,8B en BF16, aproximadamente 91,7 GB solo para pesos, más overhead de activaciones y caché KV.
- GPU recomendadas: nodos multi-GPU con A100 80 GB o H100 80 GB (2-4 GPUs según paralelismo); no cabe en una única GPU de 80 GB sin técnicas adicionales de offload.
- Consumer GPU: no cabe en RTX 4090 (24 GB) ni en GPUs de 48 GB; requeriría cuantización adicional en tiempo de carga o descarga a CPU.
- Opciones de despliegue: `transformers` estándar y vLLM (según la model card); llama.cpp y Ollama no están confirmados para este formato de pesos dequantizados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-2.10bit-r121 | 45,8B (MoE) | no disponible | no disponible | safetensors BF16 dequantizado | Checkpoint de investigación, 0 descargas |
| Qwen/Qwen3.6-35B-A3B (base) | ~35B (MoE) | no disponible | no disponible | safetensors | Modelo original sin compresión |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de modelos equivalentes en la información proporcionada |

## Limitaciones y advertencias

- Checkpoint de investigación interna: el autor no garantiza calidad, estabilidad ni reproducibilidad; no debe usarse en producción sin validación exhaustiva.
- Cuantización extrema a 2,10 bits en los expertos: es esperable una degradación notable en tareas sensibles a la precisión (matemáticas, código, razonamiento largo), aunque no se han publicado métricas que la cuantifiquen.
- El ahorro de disco no se traduce en ahorro de VRAM: los pesos se cargan en BF16, por lo que los requisitos de memoria siguen siendo los de un modelo de ~45,8B.
- Licencia no especificada: la model card remite a la licencia del modelo base sin nombrarla; verificar antes de cualquier uso comercial.
- Idiomas y contexto no documentados: no se puede asumir el soporte multilingüe ni la ventana de contexto del modelo original.
- Riesgo de alucinación y sesgos: no evaluados en este checkpoint; se heredan los del modelo base, que tampoco están documentados aquí.
- Sin descargas ni likes: no hay evidencia de validación por parte de la comunidad.
- El pipeline declarado es text-generation, pero los tags incluyen image-text-to-text; la interfaz multimodal puede no estar completamente funcional en este checkpoint.

## Enlaces

- Hugging Face: https://huggingface.co/mrminjae/qwen3p6-35b-a3b-2p10bit-r121
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
