# aspect-ratio-scaling/preln-lr2e-3-llama-400M-L24-pretrain

## Resumen

`preln-lr2e-3-llama-400M-L24-pretrain` es un checkpoint de investigación de un modelo de lenguaje causal de tipo Llama, con normalización Pre-LN, 24 capas y aproximadamente 400 millones de parámetros. Lo publica el colectivo `aspect-ratio-scaling` como parte de **DepthBench**, un benchmark académico descrito en el paper *DepthBench: Measuring How Residual Connections Enable More Computational Depth* (arXiv 2609.32534), cuyo objetivo es medir cómo las conexiones residuales permiten ganar profundidad computacional efectiva.

El modelo no es un artefacto listo para producción: se trata de un **raw checkpoint distribuido** generado con la librería OLMo-core, con los directorios de paso `step0` y `step7600` del entrenamiento de preentrenamiento, más el tokenizer original. No incluye exportación en formato `from_pretrained()` de Hugging Face, por lo que su uso requiere las utilidades de OLMo-core (`load_model_and_optim_state()`).

Su relevancia es fundamentalmente metodológica: forma parte de una familia de modelos de ablación (variando learning rate, profundidad y ratio de aspecto) diseñada para estudiar empíricamente el papel de las conexiones residuales en la profundidad de cómputo. La licencia Apache 2.0 y el tamaño reducido (~4,9 GB de repo) lo hacen accesible para experimentación en una sola GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal tipo Llama con normalización Pre-LN |
| Parametros totales | ~400 M (nombre del modelo); el directorio fuente indica 350M base |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint raw, sin GGUF ni safetensors exportados) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | raw distributed checkpoint de OLMo-core (no safetensors, no GGUF) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Llama estándar (decoder-only transformer) con normalización Pre-LN, 24 capas (`L24`) y un tamaño aproximado de 400 M de parámetros. El identificador `lr2e-3` indica que se entrenó con un learning rate de 2·10⁻³, un valor alto típico en estudios de ablación sobre estabilidad y dinámica de entrenamiento en modelos pequeños. El prefijo `preln` confirma la variante de normalización previa a cada subcapa.

El checkpoint contiene dos hitos del preentrenamiento (`step0` y `step7600`), lo que permite reproducir la curva de entrenamiento desde la inicialización. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF/DPO o ajuste instructivo: el artefacto es exclusivamente de preentrenamiento (`pretrain`). La innovación técnica no reside en el modelo en sí, sino en su papel como unidad experimental dentro de DepthBench, que compara configuraciones de profundidad y ratio de aspecto para medir la profundidad computacional efectiva habilitada por las conexiones residuales.

## Capacidades

- Generación de texto autoregresiva básica (modelo causal de lenguaje).
- Capacidad de continuación de texto y modelado de lenguaje puro; no se ha ajustado para instrucciones.
- No hay evidencia de soporte de tool calling ni function calling.
- No hay evidencia de capacidades de agente ni razonamiento multi-paso entrenado explícitamente.
- Capacidades multilingües: no disponibles (no se documenta la composición lingüística del corpus).
- Sin modo thinking, visión, audio ni otras modalidades.
- Utilidad principal como checkpoint de referencia para experimentos de investigación y ablación.

## Casos de uso

- **Reproducción de experimentos de DepthBench**: cargar `step0` y `step7600` con `load_model_and_optim_state()` de OLMo-core para replicar las curvas de pérdida del paper y validar las conclusiones sobre profundidad residual.
- **Estudios de dinámica de entrenamiento**: analizar el efecto del learning rate 2·10⁻³ en un transformer de 24 capas comparando los dos checkpoints incluidos y midiendo divergencia, pérdida y normas de gradiente.
- **Investigación sobre normalización Pre-LN vs Post-LN**: usar este modelo como baseline `preln` frente a variantes del mismo benchmark para aislar el efecto de la posición de la normalización en la estabilidad del entrenamiento.
- **Ablaciones de ratio de aspecto y profundidad**: el colectivo `aspect-ratio-scaling` publica variantes con distintos ratios; este checkpoint sirve como punto de comparación controlado en experimentos sobre cómo la forma de la red afecta a la capacidad efectiva.
- **Fine-tuning académico de bajo coste**: con ~400 M de parámetros y pesos en fp32/bf16, cabe en una GPU consumer de 24 GB para tareas de ajuste supervisado sobre dominios concretos, como clasificación o generación especializada.
- **Evaluación de pipelines de conversión de checkpoints**: al ser un checkpoint raw de OLMo-core, es un caso práctico para probar herramientas de conversión a safetensors/GGUF y validar que las utilidades de carga distribuida funcionan correctamente.
- **Docencia y formación en entrenamiento distribuido**: el layout de checkpoint (218 ficheros, directorios por paso, tokenizer separado) es un ejemplo didáctico de cómo OLMo-core organiza el estado de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con ~400 M de parámetros, en fp32 ocupa aproximadamente 1,6 GB; en bf16/fp16, unos 0,8 GB; en cuantización de 8 bits, ~0,4 GB.
- **GPU recomendadas**: cualquier GPU con al menos 8 GB de VRAM es suficiente para inferencia; una RTX 3060/4060, RTX 4090, A100 o H100 funcionan sin problema.
- **Consumer GPU**: sí, cabe holgadamente en GPUs de gama media (RTX 3060 12 GB, RTX 4060 Ti 16 GB) e incluso en tarjetas de 8 GB.
- **Opciones de despliegue**: el checkpoint requiere OLMo-core (`load_model_and_optim_state()`) para cargarse; no hay pesos en safetensors ni GGUF listos para vLLM, llama.cpp, Ollama o TGI, por lo que sería necesario un paso previo de conversión.
- **Latencia y throughput**: no disponibles en la información proporcionada; por el tamaño, se espera throughput alto en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| preln-lr2e-3-llama-400M-L24-pretrain | ~400 M | no disponible | Apache 2.0 | raw OLMo-core | Checkpoint de investigación, sin ajuste instructivo |
| OLMo 1B (AllenAI) | ~1 B | 2 048 tokens (versión base) | Apache 2.0 | safetensors, GGUF | Modelo abierto con pipeline completo y card detallada |
| Llama 3.2 1B | ~1,2 B | 128 000 tokens | Llama 3.2 Community License | safetensors, GGUF | Instruct disponible, uso comercial con restricciones |
| TinyLlama 1.1B | ~1,1 B | 2 048 tokens | Apache 2.0 | safetensors, GGUF | Entrenado con 3 T tokens, orientado a despliegue |

La comparación es aproximada: los tres alternativos son modelos de propósito general con exportaciones listas para producción, mientras que este checkpoint es un artefacto de investigación sin contexto documentado ni pipeline de inferencia estándar.

## Limitaciones y advertencias

- **No es un modelo listo para producción**: es un checkpoint raw de OLMo-core; no funciona con `from_pretrained()` ni con herramientas estándar sin conversión previa.
- **Solo preentrenamiento**: no ha pasado por RLHF, DPO ni ajuste instructivo, por lo que no sigue instrucciones de forma fiable y puede generar contenido incoherente o inapropiado.
- **Riesgo de alucinación**: alto, como en cualquier modelo causal de tamaño pequeño sin alineación.
- **Sesgos**: el corpus de entrenamiento no está documentado, por lo que no se pueden evaluar sesgos de género, raza, idioma o dominio.
- **Idiomas**: no se especifica la cobertura lingüística; probablemente esté dominado por inglés si sigue las prácticas habituales de OLMo-core, pero no hay confirmación.
- **Contexto**: no se documenta la longitud de contexto, lo que impide planificar su uso en tareas de contexto largo.
- **Licencia**: Apache 2.0 permite uso comercial, pero el estado del modelo (sin alineación, sin evaluación) hace desaconsejable su uso directo en aplicaciones de cara al usuario.
- **Reproducibilidad**: el checkpoint conserva el layout original de entrenamiento, lo que facilita la reproducibilidad, pero también limita la portabilidad a otros frameworks.

## Enlaces

- [Hugging Face: aspect-ratio-scaling/preln-lr2e-3-llama-400M-L24-pretrain](https://huggingface.co/aspect-ratio-scaling/preln-lr2e-3-llama-400M-L24-pretrain)
- [Paper DepthBench (arXiv 2609.32534)](https://huggingface.co/papers/2609.32534)
- [Repositorio de código DepthBench](https://github.com/keyu-wang-2002/DepthBench)
- [OLMo-core (framework de entrenamiento)](https://github.com/allenai/OLMo-core)
