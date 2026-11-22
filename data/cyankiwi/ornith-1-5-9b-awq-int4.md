# cyankiwi/Ornith-1.5-9B-AWQ-INT4

## Resumen

Ornith-1.5-9B-AWQ-INT4 es la versión cuantizada a 4 bits con AWQ del modelo Ornith-1.5-9B, desarrollado por ornith-ai y publicada por el usuario cyankiwi. Se trata de un modelo denso de 9.409.813.744 parámetros construido sobre la arquitectura Qwen3.5 (etiqueta `qwen3_5` en Hugging Face), con capacidad multimodal de imagen a texto además de generación de texto. La cuantización reduce el peso del repositorio a 8,99 GB, lo que lo hace desplegable en una única GPU de gama alta de consumo.

La relevancia del modelo radica en su origen: Ornith-1.5 es la segunda iteración de la familia Ornith, que parte de Qwen3.5 y Gemma4 con preentrenamiento continuado, mid-training y post-entrenamiento adicionales. La innovación declarada por el autor es un bucle de auto-mejora que optimiza conjuntamente la generación de tareas, la construcción de andamiajes (scaffolds) y los rollouts de soluciones mediante aprendizaje por refuerzo, en lugar de depender de tareas fijas curadas por humanos.

Esta ficha cubre específicamente el checkpoint AWQ INT4, orientado a inferencia eficiente en memoria. La información disponible sobre el modelo base es limitada: no se detallan la longitud de contexto, los idiomas soportados ni la composición exacta del dataset de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5, etiqueta `qwen3_5`) |
| Parámetros totales | 9.409.813.744 |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | AWQ INT4 (compressed-tensors) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (compressed-tensors), compatible con transformers |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-9B es un transformer denso de aproximadamente 9.400 millones de parámetros, derivado de la familia Qwen3.5 según la etiqueta de arquitectura del repositorio. Según la model card, Ornith-1.0 se desarrolló sobre Qwen3.5 y Gemma4 con preentrenamiento continuado, mid-training y post-entrenamiento adicionales. Ornith-1.5 amplía ese enfoque con un bucle de auto-mejora que optimiza conjuntamente la generación de tareas, la construcción de andamiajes y los rollouts de soluciones, y mejora la política mediante aprendizaje por refuerzo. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni los detalles del esquema de RLHF o DPO.

Esta variante concreta es una cuantización AWQ de 4 bits generada por cyankiwi (versión 26.05.01), calibrada con un dataset propio orientado a STEM y tareas agénticas. El resultado es un checkpoint de 8,99 GB que conserva el pipeline de transformers y el soporte de imagen a texto del modelo original. No se documentan innovaciones arquitectónicas adicionales específicas de la cuantización más allá del propio esquema AWQ.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento y resolución de tareas de código, con resultados reportados en Terminal-Bench 2.1.
- Procesamiento de imagen a texto (`image-text-to-text`), lo que habilita entrada multimodal.
- Soporte declarado de despliegue en endpoints compatibles (`endpoints_compatible`).
- Capacidades agénticas: el entrenamiento del modelo base se orienta explícitamente a tareas con andamiajes y rollouts, lo que sugiere soporte de razonamiento multi-paso.
- Compatibilidad con el ecosistema transformers y con `compressed-tensors`.
- No se documentan en la información disponible capacidades de audio, modo thinking explícito ni desglose de soporte multilingüe.

## Casos de uso

- Automatización de tareas de terminal y shell: el modelo reporta 46,2 en Terminal-Bench 2.1, por lo que es adecuado para agentes que ejecutan comandos, interpretan salidas y corrigen errores en entornos de línea de comandos.
- Asistencia de programación en pipelines de CI/CD: con 9.400 millones de parámetros y cuantización INT4, puede desplegarse en una GPU dedicada para revisar diffs, generar parches y validar cambios sin depender de APIs externas.
- Procesamiento de documentos con imágenes: la capacidad imagen a texto permite extraer información de capturas, diagramas y formularios escaneados en flujos de digitalización.
- Agentes de resolución de incidencias: el entrenamiento orientado a rollouts y andamiajes encaja con bucles de agente que planifican, ejecutan y verifican pasos sucesivos sobre herramientas.
- Despliegue en una sola GPU para prototipado interno: los 8,99 GB del checkpoint permiten servir el modelo en hardware de consumo de gama alta, útil para equipos que necesitan inferencia local con licencia MIT.
- Evaluación comparativa de cuantizaciones: al ser un checkpoint AWQ INT4 de un modelo base público, sirve para medir la pérdida de calidad frente a los pesos originales en tareas STEM y agénticas, dado el dataset de calibración empleado.
- Investigación sobre auto-mejora: el modelo base documenta un bucle de generación de tareas y RL, por lo que puede utilizarse como referencia en experimentos de entrenamiento auto-dirigido.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible corresponden a Terminal-Bench 2.1 (Terminus-2) del modelo base Ornith-1.5-9B, comparado con otros modelos de la familia. No se han publicado resultados de benchmarks para esta cuantización AWQ INT4 específica.

| Benchmark | Ornith-1.5-9B | Ornith-1.0-9B | Qwen3.5-9B | Qwen3.6-35B-A3B | Gemma-4-31B |
|---|---|---|---|---|---|
| Terminal-Bench 2.1 (Terminus-2) | 46,2 | 43,1 | no disponible | no disponible | no disponible |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 9-10 GB solo para pesos en INT4; con caché KV y overhead del runtime, se recomienda un mínimo de 12-16 GB.
- GPU recomendadas: NVIDIA A100, H100 o L40S para producción; RTX 4090 (24 GB) para despliegue en una sola tarjeta con margen amplio.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 y RTX 4080 Super (16 GB); en tarjetas de 12 GB el margen es ajustado y depende de la longitud de contexto.
- Opciones de despliegue: transformers con `compressed-tensors`, vLLM (soporte de AWQ), endpoints compatibles según la etiqueta del repositorio; no se confirma soporte de llama.cpp u Ollama para este formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Ornith-1.5-9B-AWQ-INT4 (este) | 9,41 B | no disponible | MIT | safetensors AWQ INT4 | Cuantización de 8,99 GB, calibrada en STEM y agentic |
| Ornith-1.5-9B (base) | 9,41 B | no disponible | MIT | safetensors | Pesos completos; 46,2 en Terminal-Bench 2.1 |
| Ornith-1.0-9B | no disponible | no disponible | no disponible | no disponible | Generación anterior; 43,1 en Terminal-Bench 2.1 |
| Qwen3.5-9B | no disponible | no disponible | no disponible | no disponible | Modelo de referencia sobre el que se construye Ornith |

No se dispone de datos de contexto, licencia ni rendimiento de los modelos comparables más allá de lo indicado.

## Limitaciones y advertencias

- La cuantización AWQ INT4 puede degradar la precisión en tareas sensibles, especialmente en razonamiento matemático y generación de código, respecto a los pesos completos; no se han publicado métricas de esa pérdida para este checkpoint.
- Riesgo de alucinación inherente a los modelos generativos de 9.000 millones de parámetros; no se documentan medidas específicas de mitigación.
- No se especifican los idiomas soportados, por lo que el rendimiento en castellano no está garantizado ni medido.
- La longitud de contexto no está documentada, lo que impide planificar despliegues con ventanas largas sin verificación empírica.
- La licencia MIT del modelo base permite uso comercial, pero debe verificarse que los términos del modelo original (Qwen3.5/Gemma4) no impongan restricciones adicionales sobre los derivados.
- El dataset de calibración está sesgado hacia STEM y tareas agénticas, lo que puede afectar la fidelidad de la cuantización en dominios conversacionales o creativos.
- El repositorio tiene un volumen de descargas bajo (609) y pocas interacciones, por lo que la validación comunitaria es escasa.
- No se documentan sesgos conocidos ni evaluaciones de seguridad en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cyankiwi/Ornith-1.5-9B-AWQ-INT4
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Blog de Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Licencia del modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B/blob/main/LICENSE
- Dataset de calibración: https://huggingface.co/datasets/cyankiwi/calibration
- Web de cyankiwi: https://cyan.kiwi/
- Perfil de cyankiwi en Hugging Face: https://huggingface.co/cyankiwi
- Perfil de cyankiwi en ModelScope: https://www.modelscope.ai/organization/cyankiwi
