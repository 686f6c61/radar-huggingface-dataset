# laiyingxin/Touch-R1

## Resumen

Touch-R1 es un modelo multimodal de razonamiento táctil desarrollado por Yingxin Lai y colaboradores (Yafei Zhou, Fucai Zhu, Siyu Zhu, Weihao Yuan), presentado en el paper arXiv:2605.27154. El modelo conecta observaciones táctiles ópticas con visión y lenguaje, permitiendo que un MLLM utilice evidencia de contacto físico para juzgar propiedades de los objetos y corregir impresiones visuales engañosas. Se construye sobre el backbone Qwen2.5-VL-7B y está orientado a robótica e inferencia de propiedades físicas.

La propuesta central es introducir razonamiento explícito sobre contacto físico: el modelo estructura sus respuestas en tres etapas (`<perceive>`, `<compare>`, `<conclude>`) y se entrena con un pipeline de tres fases que combina preentrenamiento de dinámica táctil, ajuste supervisado de QA y GRPO anclado en táctil. El modelo se acompaña del dataset TouchReason-1M y del benchmark TouchReason-Bench.

Es relevante porque aborda un modalidad poco cubierta en los MLLM abiertos: la integración de sensores táctiles ópticos en el razonamiento multimodal. No obstante, en el momento de redactar esta ficha los pesos no están publicados y el repositorio solo aloja la página del proyecto, por lo que su evaluación práctica todavía no es posible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal LLM (image-text-to-text) sobre backbone Qwen2.5-VL-7B |
| Parametros totales | 7B (según backbone reportado en el paper) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (tag del repo); pesos no publicados aún |

## Arquitectura y entrenamiento

Touch-R1 se construye sobre Qwen2.5-VL-7B, un transformer multimodal que acepta imágenes y texto. La entrada del modelo incluye observaciones táctiles ópticas, contexto visual y preguntas en lenguaje natural; la salida es razonamiento textual estructurado y juicios sobre propiedades físicas. La innovación principal es el tratamiento de la señal táctil como una modalidad de primer nivel integrada en el razonamiento, no como un simple canal auxiliar.

El entrenamiento consta de tres etapas: (1) preentrenamiento de dinámica táctil, que aprende representaciones sensibles al contacto prediciendo tokens táctiles futuros; (2) ajuste supervisado de QA que alinea táctil, visión y lenguaje con razonamiento estructurado; y (3) GRPO anclado en táctil, que combina recompensas de precisión ordinal, consistencia física entre sensores y formato estructurado, junto con un objetivo de grounding táctil en la entrada. Se emplean entradas táctiles contrafactuales (eliminadas, barajadas o enmascaradas con ruido) para identificar predicciones que dependen de evidencia de contacto genuina. Los datos de investigación son TouchReason-1M y TouchReason-Bench.

## Capacidades

- Razonamiento sobre propiedades físicas de objetos a partir de contacto táctil óptico.
- Comparación ordinal de propiedades físicas entre objetos o superficies.
- Razonamiento entre sensores (cross-sensor reasoning) con distintos dispositivos táctiles.
- Resolución de conflictos entre evidencia visual y táctil.
- Respuestas estructuradas en etapas `<perceive>`, `<compare>` y `<conclude>`.
- QA multimodal táctil-visual con juicios textuales estructurados.
- No se documenta soporte de tool calling, function calling, agentes multi-paso ni thinking mode extendido más allá del formato estructurado descrito.

## Casos de uso

- Inspección de materiales en robótica: el modelo puede recibir lecturas de un sensor táctil óptico y una imagen del objeto para estimar dureza, rugosidad o textura, apoyándose en la etapa `<perceive>` para describir la evidencia de contacto.
- Manipulación robótica asistida: usar el juicio de propiedades físicas para decidir la fuerza de agarre o la estrategia de manipulación antes de ejecutar una acción.
- Control de calidad en fabricación: comparar la respuesta táctil de una pieza con la de una referencia y detectar desviaciones mediante la etapa `<compare>`.
- Resolución de ambigüedad visual: cuando una imagen sugiere una textura o material que el contacto desmiente, el modelo prioriza la evidencia táctil y explica la discrepancia en `<conclude>`.
- Investigación en percepción multimodal: servir como base para estudiar cómo integrar modalidades físicas en MLLM y evaluar dependencia de evidencia real frente a atajos visuales.
- Benchmarking de razonamiento físico: utilizar TouchReason-Bench para medir capacidades de razonamiento ordinal y consistencia entre sensores en modelos multimodales.
- Asistencia en entornos de realidad aumentada o teleoperación: aportar juicios táctiles textuales a operadores que no tienen acceso directo al contacto.

## Benchmarks y rendimiento

| Benchmark | Modelo | Resultado |
|---|---|---|
| TouchReason-Bench (media) | Touch-R1-7B | 60,1 |

No se han publicado en la información disponible resultados comparativos con otros modelos en MMLU, HumanEval, GSM8K ni en el resto de benchmarks estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; al tratarse de un backbone de 7B, una estimación orientativa sería de aproximadamente 14-16 GB en FP16/BF16 y de 5-7 GB en cuantización de 4 bits, aunque no se confirma en la información disponible.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; por tamaño del backbone sería plausible en GPUs con 16-24 GB de VRAM, pero no hay verificación oficial.
- Opciones de despliegue: no disponible; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Touch-R1 | 7B (backbone Qwen2.5-VL-7B) | no disponible | Táctil óptico, visión, texto | no disponible | Pesos no publicados |
| Qwen2.5-VL-7B | 7B | no disponible en esta ficha | Visión, texto | no disponible en esta ficha | Público |
| Alternativas táctiles multimodales | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para comparar Touch-R1 con alternativas específicas de razonamiento táctil; la comparación con Qwen2.5-VL-7B se limita a la relación de backbone.

## Limitaciones y advertencias

- Los pesos del modelo no están publicados: la model card indica que llegarán "pronto" y que las instrucciones de inferencia verificadas están pendientes.
- El repositorio de GitHub aloja únicamente la página del proyecto; el código de investigación está por publicar.
- La licencia no está disponible, por lo que no puede confirmarse el uso comercial.
- No se documentan los idiomas soportados; el comportamiento multilingüe es incierto.
- No se especifica la longitud de contexto, lo que dificulta planificar despliegues con conversaciones o secuencias largas.
- Riesgo de alucinación no cuantificado; el propio diseño con entradas contrafactuales sugiere que el modelo puede apoyarse en atajos visuales si la evidencia táctil es débil.
- Dependencia de hardware táctil óptico específico y de protocolos de captura; la generalización entre sensores es un objetivo declarado, no una garantía verificada.
- Los resultados de benchmark se limitan a TouchReason-Bench (60,1 de media) y no han sido replicados de forma independiente en la información disponible.
- Sesgos conocidos: no disponible.

## Enlaces

- Hugging Face: https://huggingface.co/laiyingxin/Touch-R1
- Paper: https://arxiv.org/abs/2605.27154
- Página del proyecto: https://laiyingxin2.github.io/Touch-R1/
- Repositorio GitHub: https://github.com/laiyingxin2/Touch-R1
- Dataset TouchReason: https://huggingface.co/datasets/laiyingxin/TouchReason
