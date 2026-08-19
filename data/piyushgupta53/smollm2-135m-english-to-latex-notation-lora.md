# piyushgupta53/smollm2-135m-english-to-latex-notation-lora

## Resumen

El modelo `piyushgupta53/smollm2-135m-english-to-latex-notation-lora` es un adaptador rsLoRA de rango 32 sobre el modelo base `HuggingFaceTB/SmolLM2-135M-Instruct`, desarrollado por el usuario piyushgupta53. Su función es convertir una descripción precisa en inglés de notación matemática en una única expresión LaTeX independiente, sin incluir signos de dólar, bloques de código, explicaciones ni envoltorios de documento. No está diseñado para resolver, calcular, demostrar ni explicar matemáticas, solo para escribir la notación.

El adaptador se entrenó mediante fine-tuning supervisado (SFT) centrado en la respuesta, con un corpus de 24 956 filas que combina objetivos formales deterministas y paráfrasis en inglés auditadas. El modelo resultante es extremadamente ligero (135M de parámetros base) y está pensado para tareas de conversión texto-a-LaTeX en contextos donde se requiere una salida limpia y compilable. Su relevancia actual radica en la creciente demanda de herramientas de asistencia a la escritura matemática, especialmente en entornos académicos y de documentación técnica donde LaTeX es el estándar.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base SmolLM2-135M-Instruct) con adaptador rsLoRA rango 32 |
| Parametros totales | 135M (modelo base) + adaptador LoRA (parametros del adaptador no especificados) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada en la ficha) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en bfloat16, sin cuantizaciones adicionales) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo base es SmolLM2-135M-Instruct, un transformer decoder-only de 135M de parámetros entrenado sobre 2 billones de tokens con una combinación de datasets como FineWeb-Edu, DCLM y The Stack, seguido de SFT para la versión instruct. Sobre esta base se ha aplicado un adaptador rsLoRA (rank-stabilized LoRA) de rango 32, que modifica las proyecciones de atención y las proyecciones MLP. El entrenamiento se realizó con SFT centrado en la respuesta (response-only), usando 22 460 filas de entrenamiento y 2 496 de validación, con objetivos formales agrupados antes del split para evitar fugas de datos.

Se entrenaron 3 épocas, seleccionando el checkpoint de la época 3, con una tasa de aprendizaje de 2e-4, weight decay de 0.01, warmup del 5%, precisión bfloat16 y semilla 20260818. El alpha de LoRA es 32 y el dropout 0.05. El adaptador se distribuye con un hash SHA-256 de `bb8086d19ef704e4d195ea4125ea800edb1a9623a7fd49b3472904c500cba60a`. No se mencionan técnicas adicionales como RLHF o DPO; el entrenamiento es exclusivamente SFT.

## Capacidades

- Conversión de descripciones en inglés de notación matemática a una única expresión LaTeX independiente.
- Salida sin signos de dólar, bloques de código, etiquetas de respuesta ni envoltorios de documento.
- Soporte de instrucciones precisas y específicas, como derivadas, potencias, matrices, expresiones por partes, etc.
- Generación de expresiones compilables en LaTeX (98.5% de compilación en el benchmark held-out).
- Capacidad de seguir un prompt de sistema que define el contrato de salida.
- No incluye capacidades de razonamiento matemático, cálculo, demostración ni explicación.

## Casos de uso

- Generación de expresiones LaTeX para artículos académicos: un investigador puede describir en inglés una fórmula compleja y obtener el código LaTeX listo para insertar en su manuscrito, ahorrando tiempo en la escritura manual.
- Integración en editores de ecuaciones en línea: el modelo puede servir como backend para herramientas web que permitan al usuario describir notación en lenguaje natural y recibir el código LaTeX correspondiente.
- Asistencia a estudiantes de matemáticas: los estudiantes pueden practicar la conversión de notación matemática a LaTeX describiendo expresiones en inglés, con retroalimentación inmediata del modelo.
- Automatización de documentación técnica: en entornos donde se generan informes técnicos con fórmulas, el modelo puede transformar descripciones en prosa a notación LaTeX dentro de pipelines de generación de documentos.
- Preprocesamiento en pipelines de generación de documentos: se puede combinar con otros modelos de generación de texto para producir documentos completos con fórmulas correctamente formateadas.
- Herramienta de accesibilidad: personas con dificultades para escribir LaTeX manualmente pueden describir la notación en lenguaje natural y obtener el código, facilitando la inclusión en entornos académicos.

## Benchmarks y rendimiento

El autor evaluó el checkpoint de forma greedy con el prompt de sistema y `max_new_tokens=96`, sobre dos conjuntos congelados y excluidos del entrenamiento:

| Evaluacion | Filas | Exacto normalizado | Compila | Pass semantico completo |
|---|---:|---:|---:|---:|
| Held-out benchmark | 200 | 44 (22.0%) | 197 (98.5%) | 131 (65.5%) |
| Distribution-gap diagnostic | 200 | 116 (58.0%) | 198 (99.0%) | 134 (67.0%) |

El diagnostic por ramas arroja: wording shift 73/100 y novel structural coverage 61/100. Las predicciones no exactas se cribaron con DeepSeek V4 Flash y se adjudicaron con DeepSeek V4 Pro. No se han publicado comparaciones con otros modelos de conversión texto-a-LaTeX en la información disponible.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo base de 135M con un adaptador LoRA, la inferencia requiere menos de 1 GB de VRAM en bfloat16 (estimación razonable, no medida por el autor).
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM, como NVIDIA GTX 1650, RTX 3060 o superiores. También funciona en CPU.
- Compatible con hardware de edge y móvil, dado el tamaño reducido.
- Opciones de despliegue: el adaptador se carga con la librería `peft` sobre el modelo base mediante `transformers`. No se mencionan integraciones con vLLM, llama.cpp u Ollama, aunque el modelo fusionado (`piyushgupta53/smollm2-135m-english-to-latex-notation`) podría convertirse a otros formatos.
- Latencia: no se proporcionan mediciones, pero por el tamaño se espera una generación rápida, incluso en CPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El adaptador es específico para la conversión inglés-a-LaTeX sobre SmolLM2, y no se han publicado benchmarks comparativos con alternativas como modelos más grandes de propósito general o adaptadores similares.

## Limitaciones y advertencias

- Modelo muy estrecho (135M de parámetros), no fiable para uso de alto riesgo sin revisión humana.
- Falla en muchas estructuras difíciles o poco comunes: en el diagnostic estructural obtuvo 0/10 en matrices aumentadas y 0/10 en expresiones por partes indexadas con rama "otherwise".
- Puede producir expresiones válidas pero textualmente diferentes a una referencia, por lo que la coincidencia exacta no es suficiente para evaluar la corrección.
- Solo soporta inglés; no se ha entrenado para otros idiomas.
- No está diseñado para resolver ni explicar matemáticas, solo para escribir notación.
- La licencia Apache-2.0 permite uso comercial, pero el autor recomienda validar sintaxis y significado cuando la corrección sea crítica.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/piyushgupta53/smollm2-135m-english-to-latex-notation-lora
- Dataset de entrenamiento: https://huggingface.co/datasets/piyushgupta53/english-to-latex-notation-sft
- Modelo fusionado: https://huggingface.co/piyushgupta53/smollm2-135m-english-to-latex-notation
- Modelo base SmolLM2-135M: https://huggingface.co/HuggingFaceTB/SmolLM2-135M
- Blog de SmolLM: https://github.com/huggingface/blog/blob/main/smollm.md
