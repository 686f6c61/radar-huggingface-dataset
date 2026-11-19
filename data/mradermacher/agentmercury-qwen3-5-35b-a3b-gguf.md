# mradermacher/AgentMercury-Qwen3.5-35B-A3B-GGUF

## Resumen

AgentMercury-Qwen3.5-35B-A3B es un modelo de lenguaje de tipo Mixture of Experts (MoE) afinado para tareas de agente, uso de herramientas (tool-use) y soporte de MCP (Model Context Protocol). Parte de la familia Qwen3.5 y ha sido entrenado mediante aprendizaje por refuerzo con GRPO (Group Relative Policy Optimization) sobre el modelo base Minbyul/AgentMercury-Qwen3.5-35B-A3B. La versión aquí descrita es la cuantización estática en GGUF publicada por mradermacher, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y derivados.

El modelo cuenta con 34.660.610.688 parámetros totales (aproximadamente 34,7 mil millones) en una arquitectura MoE con 3 mil millones de parámetros activos por token, lo que reduce el coste computacional de inferencia respecto a un modelo denso del mismo tamaño. Está publicado bajo licencia Apache 2.0, lo que facilita su uso comercial y su integración en productos y pipelines internos.

Su relevancia actual radica en la combinación de un entrenamiento orientado a agentes (tool calling, razonamiento multi-paso, MCP) con una distribución MoE eficiente y una licencia permisiva. El repositorio GGUF incluye cuantizaciones desde Q2_K hasta Q8_0, además de un complemento multimodal (mmproj), lo que amplía las opciones de despliegue en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE), familia Qwen3.5 |
| Parametros totales | 34.660.610.688 (aprox. 34,7 B) |
| Parametros activos | 3 B (indicado en el nombre del modelo, A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | inglés (etiqueta `en` en la model card); no se detallan otros idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer con capas de mezcla de expertos (MoE): de los aproximadamente 34,7 mil millones de parámetros totales, solo unos 3 mil millones se activan por token, lo que reduce el coste de cómputo y memoria en inferencia frente a un modelo denso equivalente. El modelo deriva de Qwen3.5 y ha sido afinado mediante aprendizaje por refuerzo con GRPO, una variante de optimización de política que no requiere un modelo crítico separado y que se ha popularizado para el entrenamiento de razonamiento y uso de herramientas. Las etiquetas de la model card indican especialización en agentes, tool-use y MCP.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron fases adicionales de RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas más allá del uso de GRPO y de la arquitectura MoE heredada de Qwen3.5. La model card del repositorio GGUF es una ficha de cuantización generada por mradermacher y no incluye detalles del entrenamiento original.

## Capacidades

- Generación de texto conversacional en inglés.
- Razonamiento multi-paso orientado a tareas de agente.
- Tool calling y function calling, con etiquetas explícitas de `tool-use` en la model card.
- Soporte de MCP (Model Context Protocol), lo que facilita la integración con servidores de herramientas compatibles.
- Entrenamiento con GRPO para mejorar el comportamiento en entornos de agente y refuerzo.
- Capacidades multimodales: el repositorio incluye archivos `mmproj` (Q8_0 y f16), lo que sugiere soporte de entrada visual, aunque no se detallan las capacidades concretas.
- Capacidades multilingües: la model card solo declara inglés; no hay evidencia de soporte de otros idiomas.

## Casos de uso

- Automatización de agentes con herramientas: el modelo puede gestionar cadenas de llamadas a funciones y APIs externas gracias a su entrenamiento específico en tool-use y MCP, integrándose en orquestadores de agentes.
- Asistentes de desarrollo con acceso a repositorios: puede invocar herramientas de búsqueda de código, ejecución de tests o consulta de documentación en flujos de CI/CD, aprovechando su especialización en function calling.
- Automatización de atención al cliente con backend de herramientas: el modelo puede consultar sistemas de ticketing, bases de conocimiento o APIs de pedidos mediante tool calling, manteniendo conversaciones multi-turno.
- Razonamiento multi-paso en investigación: útil para descomponer preguntas complejas en subtareas y consultar fuentes externas de forma iterativa.
- Despliegue local en estaciones de trabajo: las cuantizaciones Q4_K_M (21,3 GB) y Q5_K_M (24,8 GB) permiten ejecutar el modelo en GPUs de consumo con 24 GB de VRAM, como la RTX 4090, mediante llama.cpp u Ollama.
- Prototipado de agentes en entornos con recursos limitados: la cuantización Q2_K (13,0 GB) o IQ4_XS (19,0 GB) permite probar el modelo en GPUs de 16 GB o en configuraciones con offloading parcial a CPU.
- Procesamiento de documentos con componente visual: el complemento mmproj habilita el uso de entradas de imagen en pipelines multimodales, aunque las capacidades exactas no están documentadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 13 GB (Q2_K) y 37 GB (Q8_0), pasando por 21,3 GB (Q4_K_M) y 24,8 GB (Q5_K_M).
- GPU recomendadas: A100 (40/80 GB) o H100 para las cuantizaciones mayores y para servir el modelo en FP16/BF16; RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; RTX 3090 (24 GB) para las mismas cuantizaciones.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 y GPUs con 24 GB para cuantizaciones Q4_K_M y Q5_K_M; en GPUs de 16 GB con Q2_K o IQ4_XS, posiblemente con offloading parcial.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF; el modelo base en safetensors puede servirse con vLLM o TGI, aunque no se confirma compatibilidad explícita en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| AgentMercury-Qwen3.5-35B-A3B (este) | 34,7 B | 3 B | no disponible | Apache 2.0 | GGUF, safetensors |
| Qwen3.5-35B-A3B (base de la familia) | 34,7 B (aprox.) | 3 B | no disponible | no disponible | no disponible |
| Alternativas MoE de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo ni de especificaciones detalladas de modelos alternativos en la información proporcionada. La comparativa con modelos como Qwen3-30B-A3B u otros MoE de la misma categoría no puede completarse sin datos verificados.

## Limitaciones y advertencias

- La model card solo declara soporte de inglés; el rendimiento en castellano u otros idiomas no está documentado y podría ser deficiente.
- No se han publicado evaluaciones de sesgo, toxicidad o alucinación para este modelo.
- El entrenamiento con GRPO orientado a agentes puede producir comportamientos de tool calling agresivos o llamadas innecesarias si el orquestador no impone límites.
- La longitud de contexto no está documentada, lo que dificulta planificar despliegues con conversaciones largas o documentos extensos.
- El repositorio GGUF es una cuantización de terceros (mradermacher); la calidad de las cuantizaciones de baja precisión (Q2_K, Q3_K_S) puede degradar notablemente el rendimiento en tareas de razonamiento.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base y de los datos de entrenamiento originales antes de un uso comercial a gran escala.
- El modelo tiene solo 230 descargas y 1 like en el momento de la consulta, lo que indica una validación comunitaria muy limitada.
- El tamaño del repositorio (237,1 GB) implica que la descarga completa de todas las cuantizaciones es costosa en almacenamiento.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/AgentMercury-Qwen3.5-35B-A3B-GGUF
- Modelo base: https://huggingface.co/Minbyul/AgentMercury-Qwen3.5-35B-A3B
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/AgentMercury-Qwen3.5-35B-A3B-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#AgentMercury-Qwen3.5-35B-A3B-GGUF
- Guía de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Gráfico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
