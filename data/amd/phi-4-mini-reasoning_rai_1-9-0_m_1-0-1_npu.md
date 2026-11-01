# amd/Phi-4-mini-reasoning_rai_1.9.0_m_1.0.1_npu

## Resumen

Phi-4-mini-reasoning es un modelo de lenguaje de Microsoft orientado a razonamiento, distribuido en este repositorio por AMD en formato ONNX y optimizado para su ejecución sobre las NPU de la plataforma Ryzen AI. El artefacto concreto que publica AMD (identificador `Phi-4-mini-reasoning_rai_1.9.0_m_1.0.1_npu`) empaqueta los pesos convertidos para el runtime Ryzen AI 1.9.0 y el modelo de aceleración 1.0.1, de modo que el modelo pueda desplegarse en portátiles y equipos de sobremesa con procesadores AMD que integren NPU, sin depender de una GPU dedicada.

El modelo base pertenece a la familia Phi-4-mini, una línea de modelos compactos de Microsoft entrenada sobre datos sintéticos y curados, con un enfoque explícito en razonamiento matemático y lógico. La variante `reasoning` está ajustada para producir cadenas de razonamiento antes de la respuesta final, lo que la hace adecuada para tareas de resolución de problemas paso a paso, aunque a costa de un mayor número de tokens generados.

La relevancia de este repositorio es fundamentalmente de despliegue: no introduce un modelo nuevo, sino que ofrece una ruta de ejecución local sobre hardware AMD con aceleración por NPU. El repositorio ocupa 3,9 GB, está licenciado bajo MIT y su acceso es restringido (gated), por lo que es necesario aceptar las condiciones en HuggingFace antes de descargarlo. La información pública disponible sobre esta ficha concreta es limitada: no se detallan en el repositorio los parámetros totales, la longitud de contexto ni los resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Phi-4-mini-reasoning; artefacto ONNX para Ryzen AI) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio distribuye un artefacto ONNX preconvertido para NPU) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | ONNX (runtime Ryzen AI 1.9.0, modelo de aceleración 1.0.1) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de la familia Phi-4-mini, diseñado por Microsoft para razonamiento en entornos con recursos limitados. La variante `reasoning` incorpora ajuste fino orientado a generar trazas de razonamiento explícitas antes de la respuesta, un patrón habitual en modelos pequeños especializados en matemáticas y lógica. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF o DPO aplicadas.

El artefacto de AMD no modifica la arquitectura del modelo, sino que lo exporta a ONNX y lo adapta al stack Ryzen AI: el sufijo `rai_1.9.0` indica la versión del runtime Ryzen AI y `m_1.0.1_npu` la versión del modelo de aceleración para NPU. Esto implica una conversión de precisión y un grafo optimizado para el motor de inferencia de AMD, cuyos detalles exactos de cuantización no se documentan en la información disponible.

## Capacidades

- Generación de texto conversacional en inglés.
- Razonamiento paso a paso: el ajuste `reasoning` favorece la producción de cadenas de pensamiento antes de la respuesta final.
- Resolución de problemas matemáticos y lógicos de complejidad media, coherente con el enfoque de la familia Phi-4-mini.
- Ejecución local acelerada por NPU en hardware AMD Ryzen AI.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso autónomo: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles.
- Capacidades multilingües: limitadas al inglés según los metadatos del repositorio.

## Casos de uso

- Asistente de razonamiento en portátiles con NPU AMD: el artefacto ONNX permite ejecutar el modelo en local sobre la NPU de un Ryzen AI, sin GPU dedicada, para tareas de análisis y resolución de problemas en entornos ofimáticos.
- Tutor de matemáticas y lógica en aplicaciones de escritorio: el ajuste de razonamiento permite mostrar el desarrollo del problema antes del resultado, útil en herramientas educativas que se ejecutan offline.
- Procesamiento de documentos técnicos en local: al no requerir conexión a la nube, encaja en flujos con requisitos de privacidad donde el texto no puede salir del equipo.
- Prototipado de aplicaciones de IA en el borde: desarrolladores que quieran validar pipelines de generación de texto sobre Ryzen AI pueden usar este artefacto como referencia de integración con el runtime 1.9.0.
- Automatización de análisis de código y explicaciones técnicas: el modelo puede explicar fragmentos de código y razonar sobre errores en un entorno de desarrollo local.
- Evaluación comparativa de inferencia en NPU: útil para medir latencia y consumo frente a ejecuciones en CPU o GPU dentro de la misma máquina.
- Generación de borradores y resúmenes en inglés: para flujos internos donde el idioma de trabajo sea el inglés y se prefiera ejecución local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Hardware objetivo: procesadores AMD con NPU Ryzen AI, ejecutando el runtime Ryzen AI 1.9.0 y el modelo de aceleración 1.0.1.
- VRAM: no aplica en el escenario principal; la inferencia se realiza sobre NPU con memoria del sistema compartida. No se especifica el consumo de memoria exacto.
- GPU recomendadas: no disponible; el artefacto está orientado a NPU, no a GPU.
- Compatibilidad con GPU de consumo: no disponible para este artefacto concreto; requeriría la versión estándar del modelo base.
- Opciones de despliegue: runtime Ryzen AI de AMD con el modelo de aceleración `m_1.0.1_npu`; otros motores (vLLM, llama.cpp, Ollama, TGI) no están soportados por este artefacto ONNX específico.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue |
|---|---|---|---|---|
| amd/Phi-4-mini-reasoning_rai_1.9.0_m_1.0.1_npu | no disponible | no disponible | MIT | ONNX para NPU Ryzen AI |
| Phi-4-mini-reasoning (Microsoft, original) | no disponible en esta ficha | no disponible en esta ficha | MIT | safetensors, ecosistema estándar |
| Phi-4-mini (Microsoft, variante instruct) | no disponible en esta ficha | no disponible en esta ficha | MIT | safetensors, ecosistema estándar |

La comparación relevante es entre el artefacto de AMD y la versión original de Microsoft: misma base de modelo, pero distinto formato y distinto hardware objetivo. Los datos de parámetros, contexto y rendimiento del modelo original no están incluidos en la información proporcionada, por lo que no se pueden contrastar numéricamente.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en HuggingFace antes de la descarga.
- Idioma: los metadatos solo declaran inglés; el rendimiento en castellano no está garantizado.
- Sesgos: no documentados en la información disponible; cabe esperar los sesgos heredados de los datos de entrenamiento del modelo base.
- Alucinación: riesgo presente como en cualquier modelo generativo; el modo de razonamiento no elimina la posibilidad de trazas plausibles pero incorrectas.
- Dependencia de hardware y software: el artefacto está atado al runtime Ryzen AI 1.9.0 y al modelo de aceleración 1.0.1; versiones distintas pueden no ser compatibles.
- Licencia MIT: permite uso comercial, pero conviene verificar las condiciones adicionales del acceso gated y las licencias del modelo base y del runtime de AMD.
- Ausencia de datos de rendimiento: no hay benchmarks publicados en la información disponible, por lo que no se puede estimar su calidad frente a alternativas.
- Producción: al tratarse de un artefacto de despliegue específico de plataforma, requiere validación propia de latencia, estabilidad y precisión antes de usarlo en entornos productivos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/amd/Phi-4-mini-reasoning_rai_1.9.0_m_1.0.1_npu
- Modelo base Phi-4-mini-reasoning de Microsoft: no disponible en la información proporcionada.
- Documentación del runtime Ryzen AI: no disponible en la información proporcionada.
- Papers, blogs o demos adicionales: no disponibles en la información proporcionada.
