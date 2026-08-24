# doth4580/Qwen3.8-27B-NVFP4-FULL

## Resumen

Qwen3.8-27B-NVFP4-FULL es una cuantización NVFP4 del modelo Qwen3.8-27B de Alibaba, preparada específicamente para el motor de inferencia veloGB10 sobre hardware NVIDIA DGX Spark / GB10. El artefacto reduce los pesos del modelo original a formato `nvfp4-pack-quantized` (compatible con compressed-tensors), ocupando aproximadamente 16 GB en disco frente a los más de 50 GB del modelo en BF16, lo que permite ejecutar un LLM de 27.000 millones de parámetros en sistemas con memoria limitada.

El modelo subyacente pertenece a la familia Qwen3.5 de Alibaba, una arquitectura híbrida que combina atención lineal GatedDeltaNet con capas de atención completa (GQA) periódicas. Dispone de una ventana de contexto de 262.144 tokens y una cabeza de predicción multi-token (MTP) nativa, que se emplea junto con el drafter DFlash2 para decodificación especulativa. Es relevante ahora porque ofrece una vía práctica para desplegar un modelo de 27B con contexto largo en hardware de consumo profesional, con rendimiento objetivo de hasta 200 tokens por segundo según las primeras pruebas.

La licencia es Apache-2.0, lo que permite uso comercial sin restricciones significativas. El modelo base original incluye capacidades multimodales (visión), pero en este artefacto la parte visual aún no está validada; la ruta de producción probada es la modalidad de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Qwen3.5: 48 capas GatedDeltaNet + 16 capas GQA completa, hidden 5120, 24 Q / 4 KV heads, head_dim 256 |
| Parametros totales | 27.781.427.952 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | NVFP4 full (recipe: all), formato `nvfp4-pack-quantized` |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`nvfp4-pack-quantized`, compatible con compressed-tensors) |

## Arquitectura y entrenamiento

La arquitectura es un transformer híbrido denso de la familia Qwen3.5. De las 64 capas totales, 48 son de atención lineal GatedDeltaNet con estado recurrente de tamaño fijo, y las 16 restantes son capas de atención completa GQA que se intercalan cada 4 capas. Esta combinación busca reducir el coste computacional del contexto largo manteniendo la calidad de atención global en puntos estratégicos de la red. El modelo original tiene un vocabulario de 248.320 tokens y una ventana de contexto de 262.144 tokens.

El artefacto cuantizado ha sido producido con el cuantizador offline de veloGB10, aplicando NVFP4 a todos los GEMMs (recipe `all`). El tokenizador y la plantilla de chat se mantienen sin cambios respecto al original. El modelo incorpora una cabeza MTP (multi-token prediction) nativa, que se utiliza para decodificación especulativa junto al drafter DFlash2 publicado por el mismo autor. Los datos de entrenamiento del modelo original no se han especificado en la documentación disponible.

## Capacidades

- Generación de texto y razonamiento de propósito general en contexto largo (262K tokens).
- Soporte de tool calling y function calling, heredado del modelo base Qwen3.8-27B.
- Capacidades de agente y razonamiento multi-paso, optimizadas para flujos de trabajo agentic.
- Generación de código, con soporte en entornos de desarrollo y automatización de oficina.
- Multimodalidad parcial: el checkpoint original incluye un vision tower (`Qwen3_5ForConditionalGeneration`), pero en este artefacto la modalidad de imagen/vídeo aún no está validada ni probada de extremo a extremo.
- Decodificación especulativa mediante la cabecera MTP nativa y el drafter DFlash2, que reduce la latencia en inferencia.

## Casos de uso

- Asistentes de código en IDE: el modelo puede autocompletar y refactorizar código en proyectos grandes gracias a su contexto de 262K tokens, que permite cargar el repositorio completo en la ventana de atención.
- Automatización de oficina: el modelo base está optimizado para tareas de ofimática (generación de documentos, resúmenes, hojas de cálculo), y la cuantización NVFP4 lo hace desplegable en estaciones de trabajo DGX Spark.
- Agentes autónomos con tool calling: puede encadenar llamadas a herramientas (API, bases de datos, ejecución de comandos) en flujos multi-paso, con la baja latencia de la decodificación especulativa.
- Análisis de documentos largos: con 262K tokens de contexto, permite procesar manuales técnicos, informes extensos o libros completos en una sola pasada sin truncamiento.
- Servidor de chat local en entornos corporativos: el modelo puede servir conversaciones multi-turno con presencia de contexto largo, con `--prefix-cache` y TP=2 o TP=4 en un clúster de dos o cuatro nodos GB10.
- Investigación y experimentación en cuantización NVFP4: el artefacto sirve como referencia de referencia para evaluar el impacto de NVFP4 en modelos híbridos de 27B, con kernels validados en veloGB10.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que las cifras de rendimiento para el artefacto NVFP4 se publicarán en el README de veloGB10 una vez se complete el benchmark en hardware. El modelo original (Qwen3.8-27B) reporta evaluación en MathVision con prompt fijo, pero no se han proporcionado números concretos en las fuentes consultadas. No se inventan datos.

## Requisitos de hardware

- VRAM estimada: ~16 GB en disco con NVFP4; según Unsloth, el modelo corre localmente en configuraciones de 17 GB de RAM/VRAM.
- GPU recomendadas: NVIDIA DGX Spark / GB10 (sistema completo), con soporte para tensor parallelism TP=2 y TP=4 en configuraciones multi-nodo.
- Compatibilidad con GPU de consumo: el formato NVFP4 está diseñado para el hardware GB10; no se ha confirmado compatibilidad con GPUs de consumo como RTX 4090 o similares. La documentación de Unsloth menciona ejecución local en setups de 17 GB, pero no especifica modelos de GPU concretos.
- Opciones de despliegue: motor veloGB10 (`gb10_inference`), con soporte de servidor HTTP, `--prefix-cache`, y decodificación especulativa con drafter DFlash2. También es compatible con cualquier framework que lea `compressed-tensors` (formato `nvfp4-pack-quantized`).
- Latencia y throughput estimados: Geeky Gadgets reporta hasta 200 tokens por segundo con NVFP4 y SG Lang, pero esta cifra no se ha confirmado en el README del artefacto. No hay datos medidos publicados por el autor del modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27,8B | 262.144 | BF16 | Apache-2.0 | safetensors |
| doth4580/Qwen3.8-27B-NVFP4-FULL | 27,8B | 262.144 | NVFP4 (16 GB) | Apache-2.0 | safetensors (compressed-tensors) |
| Qwen3.8-2.4T-A95B | ~2,4T totales, ~95B activos | 262.144 (presumiblemente) | BF16 | Apache-2.0 | safetensors |

No se dispone de datos de rendimiento comparativos (MMLU, HumanEval, GSM8K) para estos modelos en las fuentes consultadas. La comparativa se limita a características técnicas. El modelo original Qwen3.8-27B es multimodal y de la misma familia; el artefacto NVFP4 es una cuantización del mismo, por lo que las capacidades de texto son equivalentes, con la diferencia de que la visión no está validada.

## Limitaciones y advertencias

- La modalidad de visión (imagen/vídeo) no está validada en este artefacto; solo la ruta de texto es producción probada.
- No se han publicado resultados de benchmarks para el modelo cuantizado, por lo que la degradación de calidad respecto al BF16 no es cuantificable con datos públicos.
- El modelo original puede presentar sesgos y alucinaciones típicos de los LLM; la cuantización NVFP4 puede amplificar errores en tareas de razonamiento complejo.
- El artefacto está afinado para veloGB10 y hardware GB10; su uso en otras plataformas requiere validación adicional.
- La licencia Apache-2.0 permite uso comercial, pero el modelo original es propiedad de Alibaba; el usuario debe revisar los términos del modelo base en la model card de Qwen3.8-27B.
- El repositorio no incluye el tokenizer ni la plantilla de chat, que deben obtenerse del modelo base (Qwen/Qwen3.8-27B).

## Enlaces

- [doth4580/Qwen3.8-27B-NVFP4-FULL (Hugging Face)](https://huggingface.co/doth4580/Qwen3.8-27B-NVFP4-FULL)
- [Qwen/Qwen3.8-27B (modelo base)](https://huggingface.co/Qwen/Qwen3.8-27B)
- [veloGB10 (motor de inferencia)](https://github.com/sf-stav/veloGB10)
- [Repositorio oficial Qwen3.8-27B (GitHub)](https://github.com/AlibabaCloud-Official/Qwen3.8-27B)
- [Documentación de Unsloth para Qwen3.8](https://unsloth.ai/docs/models/qwen3.8)
- [Guía de despliegue local de Qwen3.8-27B (Geeky Gadgets)](https://www.geeky-gadgets.com/serve-qwen-3-8-27b-fast/)
- [doth4580/Qwen3.8-27B-DFlash2 (drafter)](https://huggingface.co/doth4580/Qwen3.8-27B-DFlash2)
