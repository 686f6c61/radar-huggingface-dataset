# CaramellaInc/Aster-1.0-instruct

## Resumen

Aster-1.0-Instruct es un modelo de lenguaje de tipo decoder-only desarrollado por Caramella Inc. que combina una arquitectura híbrida de State Space Models (SSM) y capas de atención. El modelo parte de la arquitectura de referencia Qwen3.8-27B y sustituye los mezcladores Gated DeltaNet del modelo original por 48 capas SSM inicializadas y entrenadas desde cero, manteniendo 16 capas de atención, el token embedding y el LM head heredados del checkpoint de Qwen. El resultado es un backbone de 64 capas con aproximadamente 28.900 millones de parámetros.

El modelo se presenta explícitamente como un checkpoint experimental y parcialmente preentrenado, no como un fine-tune directo de Qwen ni como un modelo entrenado íntegramente desde inicialización aleatoria. Su objetivo es servir de base para la investigación en adaptación arquitectónica, transferencia de capacidades entre arquitecturas de secuencia y destilación de conocimiento entre modelos con mecanismos de mezclado distintos.

La relevancia de Aster-1.0-Instruct radica en su enfoque metodológico: combina transferencia de pesos para los componentes compatibles con destilación de conocimiento entre arquitecturas para los nuevos mezcladores SSM, inspirado en trabajos como MOHAWK. Está orientado a generación de texto e instrucciones en coreano e inglés, y requiere un runtime propio escrito en Rust, por lo que no es directamente compatible con las rutas de carga estándar de Transformers o vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida SSM–Attention, decoder-only causal |
| Parametros totales | 28.899.331.072 (≈28,9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Coreano (ko), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

Aster-1.0-Instruct emplea un backbone híbrido de 64 capas compuesto por 48 capas de mezcladores SSM entrenadas de forma independiente y 16 capas de atención cuyos pesos proceden del checkpoint Qwen3.8-27B. El token embedding y el LM head también se heredan del modelo de referencia. Los mezcladores SSM no se copian de los Gated DeltaNet de Qwen, sino que se inicializan y entrenan como parámetros nuevos de Aster. La model card advierte que el diagrama de arquitectura resume los componentes y no su orden exacto de ejecución, y que GDN-2 es una dirección separada para investigación posterior.

El entrenamiento combina transferencia de pesos para los componentes compatibles con destilación de conocimiento entre arquitecturas, en la que el modelo estudiante se entrena con señales derivadas de un profesor (representaciones intermedias o distribuciones de salida). El proyecto se inspira en MOHAWK, que estudia la transferencia de capacidades entre arquitecturas de modelos de secuencia. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO. La model card subraya que los parámetros heredados proporcionan un punto de partida y no garantizan la conservación de las capacidades de razonamiento, lenguaje o estados internos del modelo profesor.

## Capacidades

- Generación de texto causal en coreano e inglés.
- Seguimiento de instrucciones (checkpoint orientado a instruction-following).
- Investigación en arquitecturas híbridas SSM–Attention y en mezcladores de secuencia alternativos.
- Experimentación en transferencia de conocimiento entre arquitecturas y destilación cross-architecture.
- Inspección y reproducción de checkpoints Aster mediante el runtime compatible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades especiales (thinking mode, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Investigación en arquitecturas híbridas SSM–Attention: el modelo sirve como banco de pruebas para estudiar cómo se comportan 48 capas SSM entrenadas desde cero junto a 16 capas de atención heredadas, permitiendo comparar dinámicas de mezclado de secuencia frente a arquitecturas puramente atencionales.
- Experimentos de destilación cross-architecture: al combinar transferencia de pesos y destilación de conocimiento, es adecuado para reproducir y extender metodologías tipo MOHAWK sobre modelos de ~29B parámetros.
- Evaluación de transferencia de representaciones: permite medir hasta qué punto el embedding y el LM head heredados de Qwen3.8-27B siguen siendo útiles cuando los mezcladores se reemplazan por SSM, un caso de estudio directo sobre bootstrap de representaciones.
- Generación de texto e instrucciones en coreano e inglés: el checkpoint está orientado a instruction-following en estos dos idiomas, por lo que puede emplearse en tareas de generación controlada dentro de esos mercados lingüísticos.
- Reproducción de resultados con runtime propio: el runtime en Rust permite inspeccionar el checkpoint y validar la ejecución de la arquitectura híbrida recurrente, útil para equipos que desarrollan infraestructura de inferencia para modelos no estándar.
- Estudio de adaptación de modelos preentrenados: sirve para analizar el coste y los beneficios de sustituir componentes de un modelo de referencia por módulos nuevos entrenados de forma independiente, informando decisiones de diseño en proyectos de modelos propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa, un modelo de ~28,9B parámetros en safetensors ocupa aproximadamente 60,4 GB en el repositorio; el peso en memoria dependerá de la cuantización, que no está documentada.
- GPU recomendadas: no disponible. Por tamaño, un despliegue en precisión completa requeriría GPUs de clase A100/H100 con memoria suficiente; no se confirma en la información disponible.
- Compatibilidad con GPU de consumo: no disponible. No se documentan cuantizaciones GGUF ni rutas para llama.cpp u Ollama.
- Opciones de despliegue: runtime propio de Aster escrito en Rust. La model card indica explícitamente que las rutas estándar de carga de Qwen en Hugging Face Transformers o vLLM no son intercambiables con el runtime de Aster sin soporte específico de arquitectura.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Arquitectura | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Aster-1.0-Instruct | ≈28,9B | Híbrida SSM–Attention (48 SSM + 16 atención) | no disponible | Apache-2.0 | Hugging Face, runtime propio en Rust |
| Qwen3.8-27B (modelo base de referencia) | no disponible en la información | Transformer con Gated DeltaNet | no disponible | no disponible en la información | Hugging Face |
| Alternativas de ~30B puramente atencionales | no disponible | Transformer | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- Modelo experimental y parcialmente preentrenado: no es un fine-tune intacto de Qwen ni un modelo entrenado desde cero, y la model card advierte que no hay garantía de que se conserven las capacidades de razonamiento, lenguaje o estados internos del profesor.
- La model card está truncada en la información disponible; pueden existir limitaciones adicionales no recogidas aquí.
- Idiomas limitados a coreano e inglés; no se documenta soporte multilingüe adicional.
- Longitud de contexto no documentada, lo que impide planificar despliegues con requisitos de contexto largo.
- Sin cuantizaciones publicadas: no hay rutas GGUF, GPTQ ni AWQ documentadas, lo que limita el despliegue en hardware de consumo.
- Requiere runtime propio en Rust: no es compatible de forma directa con Transformers, vLLM o TGI sin soporte específico de arquitectura, lo que eleva el coste de integración en producción.
- Riesgo de alucinación y sesgos: no documentado en la información disponible; debe evaluarse empíricamente antes de cualquier uso en producción.
- Licencia Apache-2.0: permite uso comercial, pero al tratarse de un modelo experimental sin benchmarks publicados, su idoneidad para producción no está validada.

## Enlaces

- [Hugging Face: CaramellaInc/Aster-1.0-instruct](https://huggingface.co/CaramellaInc/Aster-1.0-instruct)
- [Modelo base: Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Paper de referencia MOHAWK (arXiv:2408.10189)](https://arxiv.org/abs/2408.10189)
- [Perfil del autor: CaramellaInc](https://huggingface.co/CaramellaInc)
