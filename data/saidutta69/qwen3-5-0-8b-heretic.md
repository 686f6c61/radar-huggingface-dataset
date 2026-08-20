# saidutta69/Qwen3.5-0.8B-heretic

## Resumen

Qwen3.5-0.8B-heretic es una variante "decensored" del modelo Qwen3.5-0.8B de Alibaba, creada por el usuario saidutta69 (bajo el alias RACER IS OP) mediante la técnica de abliteración direccional implementada en la herramienta Heretic v1.4.0. En lugar de un fine-tuning tradicional, esta técnica elimina quirúrgicamente las direcciones de pesos responsables del comportamiento de rechazo, preservando así el conocimiento y las capacidades de instrucción del modelo base. El resultado es un modelo de 0.8B parámetros que mantiene la arquitectura híbrida de atención lineal del original, con una ventana de contexto de 262K tokens según la documentación oficial de Qwen3.5.

Esta variante está pensada para desarrolladores que necesitan un modelo pequeño, rápido y desplegable en CPU o dispositivos de borde, sin las restricciones de contenido impuestas por el RLHF del modelo base. No supone una mejora de capacidades sobre Qwen3.5-0.8B: es el mismo modelo con los guardarraíles de rechazo eliminados. Su relevancia radica en ofrecer una alternativa ligera y sin censura para casos de uso donde la generación libre de contenido es prioritaria, aunque con la responsabilidad ética y legal que ello conlleva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención lineal (Qwen3.5) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (según documentación del base Qwen3.5-0.8B) |
| Tipos de cuantizacion | BF16 (safetensors), GGUF Q4_K_M, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-0.8B emplea una arquitectura híbrida que combina mecanismos de atención lineal con bloques transformer tradicionales, lo que le permite manejar secuencias largas (hasta 262K tokens) con un coste computacional reducido respecto a la atención cuadrática completa. El entrenamiento original incluyó fases de preentrenamiento y ajuste con RLHF para alinear el comportamiento, lo que introdujo patrones de rechazo ante ciertas solicitudes.

La variante heretic no modifica esta arquitectura ni reentrena el modelo. En su lugar, aplica abliteración direccional: identifica las direcciones en los pesos de las proyecciones de salida de atención y de las down-projections del MLP que correlacionan con el comportamiento de rechazo, y las anula mediante ediciones dirigidas. Este proceso, implementado en Heretic v1.4.0, preserva la integridad del resto de la red, manteniendo el conocimiento y las capacidades de seguimiento de instrucciones del modelo base. No se han publicado detalles sobre la composición exacta del dataset de entrenamiento del base, pero se sabe que Qwen3.5 fue entrenado con una mezcla multilingüe y multimodal.

## Capacidades

- Generación de texto libre sin rechazos: el modelo responde a solicitudes que el base rechazaría, incluyendo contenido explícito, controvertido o potencialmente dañino.
- Razonamiento y seguimiento de instrucciones: conserva las habilidades del base para tareas de razonamiento lógico, resolución de problemas y diálogo multi-turno.
- Manejo de contexto largo: gracias a la ventana de 262K tokens, puede procesar documentos extensos o mantener conversaciones prolongadas.
- Capacidades multilingües: aunque la model card solo declara inglés, el base Qwen3.5-0.8B es multilingüe; esta variante no elimina dicha capacidad, pero no está documentada explícitamente.
- Ejecución en CPU y dispositivos de borde: su pequeño tamaño y arquitectura eficiente permiten inferencia en hardware sin GPU.
- Sin soporte explícito de tool calling o agentes: la model card no menciona estas funcionalidades; el base podría tenerlas, pero no se confirma en esta variante.
- Visión: el base Qwen3.5-0.8B es multimodal según fuentes externas, pero la model card de esta variante no documenta soporte de visión; se considera no disponible a falta de confirmación.

## Casos de uso

- Generación de contenido creativo sin restricciones: escritura de ficción, poesía o guiones que aborden temas tabú o explícitos, donde el modelo no censurará el contenido solicitado.
- Investigación en seguridad y alineamiento: estudio del comportamiento de modelos sin guardarraíles para analizar riesgos de sesgo, alucinación o generación de contenido dañino en entornos controlados.
- Chatbots para nichos específicos: asistentes conversacionales para comunidades adultas o temáticas sensibles, donde se requiere respuestas sin filtros.
- Prototipado rápido en entornos sin GPU: gracias a su tamaño reducido y compatibilidad con llama.cpp y Ollama, puede integrarse en aplicaciones que se ejecutan en portátiles o Raspberry Pi.
- Procesamiento de documentos largos: extracción de información, resumen o análisis de textos extensos (hasta 262K tokens) en tareas donde el contenido no requiere moderación.
- Evaluación comparativa de técnicas de ablación: como referencia para medir el impacto de la eliminación de rechazos en modelos pequeños, frente a otras variantes abliteradas o fine-tuneadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta variante en la información disponible. El modelo base Qwen3.5-0.8B tiene métricas reportadas por Alibaba (MMLU, HumanEval, etc.), pero no se incluyen en la model card ni en los resultados de búsqueda proporcionados. Por tanto, no se pueden presentar datos numéricos verificables para esta variante.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: ~1,7 GB (852M parámetros × 2 bytes). Con cuantización Q4_K_M, el uso de memoria se reduce a aproximadamente 0,5-0,6 GB, permitiendo ejecución en GPUs con 2 GB o menos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (GTX 1050 Ti, RTX 2060, etc.). También funciona en CPU (x86 y ARM) gracias a la compatibilidad con llama.cpp y Ollama.
- Cabe en GPUs de consumo: sí, incluso en integradas con suficiente RAM compartida.
- Opciones de despliegue: llama.cpp (serve), Ollama, LM Studio, Jan, vLLM, SGLang, transformers con PyTorch.
- Latencia y throughput: no se han publicado mediciones específicas. Para un modelo de 0.8B en CPU, se espera una velocidad de decodificación de 20-40 tokens/segundo en hardware moderno; en GPU, varios cientos de tokens/segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Refusals | Despliegue |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-heretic | 0,85B | 262K | Apache-2.0 | Eliminados (abliteración) | CPU/GPU, llama.cpp, vLLM |
| Qwen3.5-0.8B (base) | 0,85B | 262K | Apache-2.0 | Presentes (RLHF) | CPU/GPU, llama.cpp, vLLM |
| Llama-3.2-1B | 1,23B | 128K | Llama 3.2 Community | Presentes | CPU/GPU, llama.cpp, vLLM |
| Qwen2.5-0.5B | 0,49B | 32K | Apache-2.0 | Presentes | CPU/GPU, llama.cpp |

La comparativa se basa en datos públicos de los modelos base; no se dispone de benchmarks de rendimiento para la variante heretic. La principal diferencia frente a alternativas es la eliminación de rechazos y el contexto largo, mientras que el tamaño reducido lo hace adecuado para entornos con recursos limitados.

## Limitaciones y advertencias

- Ausencia total de filtros de seguridad: el modelo puede generar contenido ilegal, dañino, discriminatorio o sexualmente explícito sin ninguna moderación. Su uso en producción requiere salvaguardas externas obligatorias.
- Riesgo de alucinación incrementado: al eliminar los mecanismos de rechazo, el modelo puede afirmar con confianza información falsa o peligrosa, especialmente en dominios sensibles.
- Sesgos del modelo base: hereda los sesgos presentes en los datos de entrenamiento de Qwen3.5, que no han sido corregidos por la abliteración.
- Limitaciones de idioma: la model card solo declara inglés; aunque el base es multilingüe, no hay garantía de rendimiento en otros idiomas.
- Sin soporte documentado para tool calling o agentes: si el base los tiene, esta variante no los menciona; se recomienda verificar antes de integrarla en pipelines complejos.
- Restricciones de licencia: aunque la licencia Apache-2.0 permite uso comercial, el contenido generado sin filtros puede violar leyes locales o políticas de plataformas; el autor declina responsabilidad.
- Mantenimiento y soporte: el modelo es un experimento de un tercero, no una versión oficial de Alibaba; no hay garantías de actualizaciones ni correcciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/saidutta69/Qwen3.5-0.8B-heretic
- Repositorio de archivos: https://huggingface.co/saidutta69/Qwen3.5-0.8B-heretic/tree/main
- Herramienta Heretic: https://github.com/p-e-w/heretic
- Blog sobre abliteration: https://huggingface.co/blog/mlabonne/abliteration
- Documentación oficial de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Artículo sobre Qwen3.5 0.8B: https://codersera.com/blog/run-and-benchmark-qwen35-08b/
