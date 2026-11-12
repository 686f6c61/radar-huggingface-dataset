# mrminjae/qwen36-35b-a3b-2p10bit-e2e-b-gubce

## Resumen

Qwen3.6-35B-A3B (2.10-bit routed experts, checkpoint interno `full_e2e_b_gubce`) es una cuantizacion experimental del modelo base Qwen/Qwen3.6-35B-A3B, publicada por el usuario mrminjae en Hugging Face. Se trata de un checkpoint de investigacion en el que unicamente los expertos enrutados del modelo Mixture-of-Experts han sido comprimidos a una media de 2,10 bits por peso, mientras que el resto de pesos (atencion, embeddings, router, capas densas) se mantienen en BF16. El resultado se almacena ya dequantizado en tensores BF16, de modo que carga con `transformers` y vLLM estandar sin necesidad de kernels de cuantizacion especiales.

El modelo hereda la arquitectura y capacidades del Qwen3.6-35B-A3B original: un transformer MoE de 35 000 millones de parametros totales con aproximadamente 3 000 millones de parametros activos por token. La propuesta de esta variante es reducir el espacio en disco y el ancho de banda de memoria asociado a los expertos manteniendo el resto de la red intacta, lo que resulta relevante para escenarios de despliegue con VRAM limitada o para investigacion sobre tecnicas de cuantizacion extrema en modelos MoE.

No obstante, se trata de un checkpoint interno sin model card detallada, sin datos de benchmarks publicados y sin informacion sobre licencia, idiomas o metodologia exacta de cuantizacion. Su uso en produccion no esta recomendado sin una evaluacion propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), derivada de Qwen3.6-35B-A3B |
| Parametros totales | 35 000 millones (heredados del modelo base) |
| Parametros activos | aproximadamente 3 000 millones por token (heredados del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | expertos enrutados a 2,10 bits de media; resto de pesos en BF16; pesos almacenados dequantizados en BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica que sigue la licencia del modelo base, que no se detalla) |
| Formato de pesos | safetensors (BF16 dequantizado) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen3.6-35B-A3B, un transformer con capas de mezcla de expertos (MoE) en las que solo una fraccion de los expertos se activa por token (aproximadamente 3 000 millones de parametros activos de un total de 35 000 millones). Esta variante no modifica la topologia ni el entrenamiento original: aplica una cuantizacion post-entrenamiento selectiva sobre los expertos enrutados, dejando el resto de componentes en BF16. La media de 2,10 bits por peso en los expertos implica una compresion muy agresiva, probablemente mediante cuantizacion vectorial o de bloque, aunque el autor no documenta el algoritmo exacto.

El checkpoint se publica ya dequantizado en BF16, lo que significa que el ahorro de almacenamiento se produce en el repositorio original (131,3 GB), pero una vez cargado en memoria el modelo ocupa lo mismo que un BF16 equivalente. No se dispone de informacion sobre datos de entrenamiento, tokens vistos, uso de RLHF/DPO ni innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.). El identificador `full_e2e_b_gubce` sugiere un experimento interno de cuantizacion de extremo a extremo, sin mas detalles publicos.

## Capacidades

- Generacion de texto y razonamiento general, heredados del modelo base Qwen3.6-35B-A3B.
- Generacion de codigo y matematicas: capacidades propias de la familia Qwen, aunque no verificadas en este checkpoint.
- Soporte de tool calling / function calling: presumiblemente heredado del modelo base, no documentado en esta variante.
- Razonamiento multi-paso y uso como agente: no documentado especificamente para este checkpoint.
- Capacidades multilingues: no disponibles (no se detallan idiomas).
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Investigacion sobre cuantizacion extrema en MoE: el checkpoint permite estudiar el impacto de comprimir expertos a 2,10 bits manteniendo el resto en BF16, comparando calidad frente al modelo base en tareas controladas.
- Despliegue en entornos con almacenamiento limitado: al ocupar 131,3 GB en disco frente a los aproximadamente 70 GB de un BF16 de 35B (o mas si se compara con el repo original sin comprimir), facilita la distribucion en infraestructuras con cuotas de almacenamiento ajustadas.
- Pruebas de carga con `transformers` y vLLM: al almacenarse dequantizado en BF16, se puede integrar en pipelines existentes sin kernels personalizados, util para validar compatibilidad antes de adoptar tecnicas de cuantizacion.
- Generacion de texto en entornos de investigacion: tareas de completado y resumen en las que se acepte una posible degradacion de calidad a cambio de estudiar el comportamiento del modelo comprimido.
- Evaluacion comparativa de robustez: medir la degradacion en tareas de codigo, matematicas o razonamiento frente al Qwen3.6-35B-A3B original.
- Prototipado de agentes con tool calling: si el modelo base conserva esa capacidad, este checkpoint sirve para experimentar con flujos de agentes en entornos de laboratorio, no en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al cargarse en BF16 dequantizado, el modelo ocupa aproximadamente 70 GB solo en pesos, mas overhead de activaciones y cache KV; se recomienda un minimo de 80 GB de VRAM para inferencia basica.
- GPU recomendadas: A100 80 GB, H100 80 GB, H200 141 GB; para multi-GPU, pares de A100 40 GB o RTX 6000 Ada con tensor parallelism.
- Cabe en consumer GPU: no en una sola GPU de consumo; seria necesario repartir entre varias RTX 4090 (24 GB) o RTX 5090, con las limitaciones de ancho de banda y latencia que ello implica.
- Opciones de despliegue: `transformers` (soporte nativo), vLLM (indicado por el autor como compatible); llama.cpp y Ollama no estan confirmados para este formato BF16 dequantizado.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mrminjae/qwen36-35b-a3b-2p10bit-e2e-b-gubce | 35B totales / ~3B activos | no disponible | no disponible | safetensors BF16 dequantizado | Expertos a 2,10 bits; checkpoint interno sin benchmarks |
| Qwen/Qwen3.6-35B-A3B (base) | 35B totales / ~3B activos | no disponible | no disponible | safetensors | Modelo original sin cuantizar; referencia de calidad |
| Qwen3-30B-A3B (generacion anterior) | 30B totales / ~3B activos | 32 768 tokens (tipico en la familia Qwen3) | Apache 2.0 (familia Qwen3) | safetensors, GGUF | Alternativa consolidada con licencia permisiva y amplio ecosistema |
| Mixtral 8x7B | 46,7B totales / ~12,9B activos | 32 768 tokens | Apache 2.0 | safetensors, GGUF | MoE de referencia con mas parametros activos y mayor coste de inferencia |

## Limitaciones y advertencias

- Checkpoint interno de investigacion: el autor lo etiqueta explicitamente como tal, sin garantias de calidad ni de estabilidad.
- Cuantizacion muy agresiva (2,10 bits de media en expertos): es probable una degradacion significativa en tareas de razonamiento, codigo y matematicas frente al modelo base, aunque no se han publicado mediciones.
- Licencia no disponible: la model card remite a la licencia del modelo base sin especificarla; no se puede asumir uso comercial permitido.
- Idiomas no documentados: se desconoce el soporte multilingue real de esta variante.
- Riesgo de alucinacion: inherente a los modelos generativos y potencialmente amplificado por la compresion extrema.
- Sin benchmarks ni evaluaciones publicadas: no hay evidencia de rendimiento que respalde su uso en produccion.
- Tamano en disco elevado (131,3 GB) pese a la compresion, debido al almacenamiento dequantizado en BF16.
- Sin soporte confirmado en llama.cpp u Ollama: las opciones de despliegue se limitan a `transformers` y vLLM.
- Sesgos: no documentados, pero heredados del modelo base y posiblemente alterados por la cuantizacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrminjae/qwen36-35b-a3b-2p10bit-e2e-b-gubce
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Perfil del autor: https://huggingface.co/mrminjae
