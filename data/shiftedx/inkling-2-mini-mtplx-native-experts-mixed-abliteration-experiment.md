# Shiftedx/Inkling-2-Mini-MTPLX-Native-Experts-Mixed-Abliteration-Experiment

## Resumen

Inkling-2-Mini-MTPLX-Native-Experts-Mixed-Abliteration-Experiment es una derivación experimental del modelo multimodal thinkingmachines/Inkling-2-Mini, publicada por el usuario Shiftedx. Se trata de una cuantización híbrida de los pesos originales orientada al runtime MTPLX (basado en MLX, el framework de Apple para silicio unificado) que combina expertos en NVFP4 y MXFP8 con cuantización afín de 4 y 8 bits en las capas densas, y que además incorpora una edición deliberada de la dirección de rechazo (refusal direction) en las proyecciones de salida de atención de las capas 18 a 22.

El modelo conserva la arquitectura del base: un transformer con mezcla de expertos (MoE) y torre de visión, con 26.899.775.016 parámetros totales y un peso de repositorio de 18,2 GB. La pipeline declarada es image-text-to-text, por lo que mantiene capacidad de entrada de imagen y texto con salida conversacional. El interés de esta ficha radica en que documenta un caso poco habitual: una cuantización nativa por capas con precisión mixta más una abliteración parcial, empaquetada con el draft model DSpark para decodificación especulativa.

Es relevante ahora porque ejemplifica las prácticas emergentes de cuantización selectiva por tipo de tensor (expertos en FP4/FP8, atención y embeddings en 4 bits, cabeza en 8 bits, proyecciones críticas retenidas en BF16) y porque expone métricas de rendimiento reales en hardware de consumo (M4 Max de 64 GiB), con 64,1 tok/s en decodificación y 60,2 tok/s end-to-end en modo solo-target. No obstante, se trata de un experimento con validación incompleta: el banco de pruebas completo está pendiente y la reducción de rechazos no está verificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) y torre de visión; modelo base thinkingmachines/Inkling-2-Mini |
| Parametros totales | 26.899.775.016 |
| Parametros activos | no disponible |
| Longitud de contexto | 4096 tokens en la configuración probada por el autor; contexto nativo del base no disponible |
| Tipos de cuantizacion | Expertos enrutados: NVFP4 nativo (capas 0-19) y MXFP8 nativo (capas 20-23); capas densas: afín group-64 con atención y embeddings en 4 bits y cabeza en 8 bits; cinco proyecciones de salida de atención y los 422 tensores de visión retenidos en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (runtime MTPLX, basado en MLX) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base Inkling-2-Mini: un transformer con capas de mezcla de expertos enrutados y una torre de visión que habilita la modalidad image-text-to-text. La intervención de Shiftedx no consiste en un reentrenamiento, sino en una recuantización por capas con precisión mixta: los expertos enrutados de las capas 0 a 19 se almacenan en NVFP4 nativo y los de las capas 20 a 23 en MXFP8 nativo, mientras que las capas densas usan cuantización afín con grupos de 64 elementos (4 bits para atención y embeddings, 8 bits para la cabeza de salida). Se retienen en BF16 cinco proyecciones de salida de atención y la totalidad de los 422 tensores de visión, presumiblemente para preservar calidad en las rutas más sensibles.

La segunda intervención es una edición de la dirección de rechazo aplicada a las salidas de atención de las capas 18 a 22, con una eliminación de proyección medida superior al 99 %. El autor reporta que 3 de 3 rechazos en un conjunto held-out persistieron tras la edición, por lo que la reducción efectiva de rechazos queda sin verificar. El paquete incluye el draft model DSpark original para decodificación especulativa, y el runtime declarado es MTPLX 2.13.2. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo base.

## Capacidades

- Generación de texto conversacional multi-turno en modo autorregresivo (`--generation-mode ar`).
- Entrada multimodal image-text-to-text: procesa imágenes junto con texto gracias a la torre de visión conservada en BF16.
- Razonamiento aritmético básico: el autor reporta que las pruebas de humo de aritmética pasaron.
- Generación de JSON estructurado: las pruebas de humo de JSON pasaron.
- Procesamiento de imágenes: las pruebas de humo de visión pasaron.
- Decodificación especulativa mediante el draft model DSpark incluido en el paquete.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Mac con silicio Apple: el paquete está diseñado para MTPLX sobre MLX y se validó en un M4 Max de 64 GiB con 64,1 tok/s de decodificación, lo que lo hace adecuado para asistentes locales en estaciones de trabajo Mac sin GPU dedicada.
- Prototipado de asistentes multimodales: al conservar los 422 tensores de visión en BF16, permite experimentar con flujos de imagen más texto (descripción de capturas, extracción de datos de documentos escaneados) en un entorno de desarrollo local.
- Evaluación de técnicas de cuantización mixta: sirve como caso de estudio reproducible para medir el impacto de NVFP4 frente a MXFP8 en expertos enrutados y de la retención selectiva en BF16 sobre la calidad final.
- Investigación sobre edición de direcciones de rechazo: el modelo incorpora una abliteración parcial documentada en las capas 18-22, útil para estudiar cómo afecta la eliminación de proyecciones de rechazo al comportamiento conversacional, con la advertencia de que la reducción no está verificada.
- Generación de JSON en pipelines locales: dado que las pruebas de humo de JSON pasaron, puede emplearse para tareas de extracción estructurada en entornos de desarrollo con ventanas de 4K tokens.
- Benchmarking de decodificación especulativa: al incluir el draft DSpark, permite comparar el rendimiento solo-target frente al modo especulativo en hardware Apple, con métricas de referencia ya publicadas por el autor.
- Experimentación académica con modelos MoE multimodales: su licencia Apache 2.0 facilita su uso en investigación y docencia sin restricciones de uso comercial, siempre que se asuman las limitaciones de validación.

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| Decodificación (tok/s) | 64,1 | MTPLX 2.13.2, M4 Max 64 GiB, greedy, ventana 4K, nueve peticiones cortas, solo-target |
| End-to-end (tok/s) | 60,2 | Mismas condiciones, solo-target |
| Prueba de humo aritmética | Superada | No se especifican los ítems |
| Prueba de humo JSON | Superada | No se especifican los ítems |
| Prueba de humo visión | Superada | No se especifican los ítems |
| Rechazos held-out | 3/3 persistieron | Reducción de rechazos no verificada |
| Eliminación de proyección de rechazo | >99 % medido | Capas 18-22, salidas de atención |
| Full Shiftedx Bench | Pendiente | No publicado |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/unified memory estimada: el repositorio ocupa 18,2 GB en disco; en ejecución se validó con 64 GiB de memoria unificada en un M4 Max, aunque el peso de los tensores sugiere que un equipo con 24-32 GiB podría cargarlo, dato no confirmado por el autor.
- GPU recomendadas: Apple M4 Max de 64 GiB (única configuración probada). El runtime MTPLX está basado en MLX, por lo que el soporte en GPU NVIDIA (CUDA) o AMD no está disponible en la información proporcionada.
- ¿Cabe en GPU de consumo? En el ecosistema Apple, sí en equipos con memoria unificada suficiente; en GPU NVIDIA de consumo no hay evidencia de soporte por parte del runtime declarado.
- Opciones de despliegue: `mtplx serve --model ./inkling-mini --generation-mode ar --context-window 4096`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 64,1 tok/s de decodificación y 60,2 tok/s end-to-end en modo solo-target sobre M4 Max de 64 GiB con decodificación greedy y ventana de 4K. No se reportan métricas del modo especulativo con DSpark.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Runtime | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-MTPLX-Native-Experts-Mixed-Abliteration-Experiment | 26,9 B | 4K probado | Apache 2.0 | MTPLX (MLX) | Cuantización mixta NVFP4/MXFP8, abliteración parcial, draft DSpark |
| thinkingmachines/Inkling-2-Mini (base) | no disponible | no disponible | no disponible | no disponible | Modelo original sin cuantizar ni editar |
| Otras cuantizaciones del mismo base | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de alternativas comparables en la información proporcionada |

No se dispone de información suficiente para comparar con modelos de la misma categoría (MoE multimodal de ~27 B) en términos de benchmarks, contexto o rendimiento.

## Limitaciones y advertencias

- Validación incompleta: el Full Shiftedx Bench está pendiente y las pruebas realizadas son de humo (aritmética, JSON, visión) sobre nueve peticiones cortas.
- La abliteración de rechazo no está verificada: 3 de 3 rechazos held-out persistieron, por lo que el efecto real de la edición es incierto y podría degradar la calibración del modelo en dominios sensibles.
- La edición de pesos en capas de atención puede introducir comportamientos impredecibles no caracterizados; no se han publicado evaluaciones de seguridad.
- Ventana de contexto probada de solo 4096 tokens, insuficiente para tareas de contexto largo; el contexto nativo del base no está documentado en esta ficha.
- Idiomas soportados no disponibles: no se puede garantizar un rendimiento adecuado en castellano sin evaluación previa.
- Riesgo de alucinación no cuantificado: no hay benchmarks de fidelidad ni de tasa de alucinación.
- Dependencia de un runtime específico (MTPLX sobre MLX), lo que limita el despliegue a hardware Apple y complica la integración en infraestructura x86/NVIDIA.
- Licencia Apache 2.0 permite uso comercial, pero al ser una modificación experimental sin garantías de calidad, no se recomienda para producción sin una evaluación propia exhaustiva.
- Sin descargas ni likes en el momento de la consulta (0/0), lo que indica ausencia de validación por parte de la comunidad.
- El modelo base es de thinkingmachines; conviene revisar los términos y limitaciones del modelo original antes de reutilizar esta derivación.

## Enlaces

- Hugging Face: https://huggingface.co/Shiftedx/Inkling-2-Mini-MTPLX-Native-Experts-Mixed-Abliteration-Experiment
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Revisión concreta del base: https://huggingface.co/thinkingmachines/Inkling-2-Mini/tree/b85c3cfa615fc413cc9af3379f491b963f3b586a
- Papers, blogs, repos y demos adicionales: no disponible en la información proporcionada.
