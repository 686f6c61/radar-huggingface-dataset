# ricursiveAI/Ripple-65B-Preview-NVFP4

## Resumen

Ripple-65B Preview NVFP4 es la versión cuantizada a 4 bits (NVFP4) del checkpoint instruction-tuned de Ripple-65B Preview, un modelo Transformer denso desarrollado por Ricursive Intelligence. El modelo se presenta como un esfuerzo por llevar capacidades de razonamiento agéntico y codificación a entornos de inferencia local, combinando un tamaño de 65B parámetros con una ventana de contexto de hasta 1M tokens y un entrenamiento sobre 12 billones de tokens.

La relevancia de esta variante NVFP4 radica en la cuantización selectiva: se aplica NVFP4 a las capas MLP mientras la atención se mantiene en BF16, lo que reduce el peso del checkpoint a aproximadamente 101 GB en el repositorio. Según la model card, el modelo alcanza 80,52 en TerminalBench 2.1, superando a modelos abiertos de mayor tamaño como Reflection Beam 501B (80,1) o Meta Muse Spark Open 816B (76,4).

El lanzamiento se enmarca en la familia Ripple-65B Preview, que incluye versiones BF16, NVFP4, un modelo base y una variante DFlash2. La licencia Apache 2.0 facilita su adopción tanto en investigación como en producción comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso |
| Parametros totales | 65B (39.616.865.360 parametros reales en safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 1M tokens |
| Tipos de cuantizacion | NVFP4 en capas MLP, BF16 en atencion; checkpoint de 8 bits segun tags |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (custom_code, modelopt) |

## Arquitectura y entrenamiento

Ripple-65B Preview es un Transformer denso preentrenado sobre 12 billones de tokens. La variante NVFP4 aquí descrita es una cuantización conservadora del checkpoint BF16 instruction-tuned: las capas MLP se cuantizan a NVFP4 mientras que las capas de atención permanecen en BF16, lo que preserva la precisión en los mecanismos de atención y reduce el coste de memoria en las proyecciones feed-forward.

La model card no detalla la composición del dataset de entrenamiento, el proceso de alineación (RLHF/DPO) ni innovaciones técnicas específicas más allá de la cuantización NVFP4 y el soporte de contexto largo. El checkpoint requiere `custom_code` y está empaquetado con herramientas de modelopt, lo que implica dependencias específicas para su carga.

## Capacidades

- Generación de texto y razonamiento general en un modelo instruction-tuned.
- Codificación agéntica: el modelo destaca en tareas de terminal y flujos de trabajo con herramientas, según su resultado en TerminalBench 2.1.
- Soporte de contexto largo de hasta 1M tokens, adecuado para tareas con documentos extensos o historiales largos.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no confirmado explícitamente en la model card, aunque el enfoque agéntico sugiere soporte.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Automatización de tareas en terminal: el modelo puede ejecutar y razonar sobre comandos de shell en pipelines agénticos, respaldado por su puntuación de 80,52 en TerminalBench 2.1.
- Asistente de codificación en IDE: con contexto de 1M tokens puede mantener el estado de repositorios grandes y sugerir cambios multi-archivo.
- Análisis de documentación extensa: la ventana de 1M tokens permite procesar manuales técnicos o bases de código completas en una sola pasada.
- Agentes multi-paso: adecuado para flujos que requieren planificación y uso de herramientas en entornos de desarrollo.
- Despliegue local en estaciones de trabajo con GPU de gran memoria: la cuantización NVFP4 reduce el peso a ~101 GB, facilitando inferencia en hardware de gama alta.
- Investigación en cuantización: sirve como referencia para estudiar el impacto de NVFP4 selectivo (MLP vs. atención) en el rendimiento agéntico.

## Benchmarks y rendimiento

| Benchmark | Ripple-65B Preview | Reflection Beam 501B | Meta Muse Spark Open 816B | Thinking Machines Inkling 975B | NVIDIA Nemotron 3 Ultra 550B |
|---|---|---|---|---|---|
| TerminalBench 2.1 | 80,52 | 80,1 | 76,4 | 63,8 | 56,4 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el checkpoint NVFP4 ocupa ~101 GB, por lo que se requiere al menos 100-120 GB de VRAM para inferencia sin offloading.
- GPU recomendadas: H100 (80 GB) en configuración multi-GPU, A100 80 GB x2, o GPUs con 96 GB+ como RTX Pro 6000.
- No cabe en GPUs de consumo convencionales (RTX 4090 24 GB) sin cuantización adicional u offloading a CPU.
- Opciones de despliegue: al requerir `custom_code` y modelopt, es necesario verificar compatibilidad con vLLM, TGI o llama.cpp; no confirmado en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | TerminalBench 2.1 | Licencia |
|---|---|---|---|---|
| Ripple-65B Preview NVFP4 | 65B denso | 1M | 80,52 | Apache 2.0 |
| Reflection Beam 501B | 501B | no disponible | 80,1 | no disponible |
| Meta Muse Spark Open 816B | 816B | no disponible | 76,4 | no disponible |
| NVIDIA Nemotron 3 Ultra 550B | 550B | no disponible | 56,4 | no disponible |

Ripple-65B logra resultados competitivos con un tamaño mucho menor que sus comparables, lo que sugiere una mayor eficiencia por parámetro en tareas agénticas de terminal.

## Limitaciones y advertencias

- Modelo experimental ("Preview"): puede presentar inestabilidad o comportamientos no documentados.
- Riesgo de alucinación inherente a modelos de lenguaje; no se han publicado evaluaciones de factualidad.
- Idiomas soportados no especificados; el rendimiento fuera del inglés es desconocido.
- La cuantización NVFP4 puede introducir degradación sutil frente al checkpoint BF16, especialmente en tareas sensibles a precisión numérica.
- Requiere `custom_code` y modelopt, lo que puede complicar el despliegue en stacks estándar.
- Licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye "tal cual" sin garantías.
- Sin descargas ni likes en Hugging Face en el momento de la consulta; ecosistema y soporte comunitario limitados.

## Enlaces

- Hugging Face (NVFP4): https://huggingface.co/ricursiveAI/Ripple-65B-Preview-NVFP4
- Hugging Face (BF16): https://huggingface.co/ricursiveAI/Ripple-65B-Preview
- Hugging Face (Base): https://huggingface.co/ricursiveAI/Ripple-65B-Base-Preview
- Hugging Face (DFlash2): https://huggingface.co/ricursiveAI/Ripple-65B-Preview-DFlash2
- Blog de lanzamiento: https://www.ricursive.com/ripple
- Web del autor: https://www.ricursive.com
- Licencia: https://huggingface.co/ricursiveAI/Ripple-65B-Preview/blob/main/LICENSE
