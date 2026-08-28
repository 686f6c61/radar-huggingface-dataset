# 0xSero/GLM-5.3-Flash-EXL3

## Resumen

El repositorio `0xSero/GLM-5.3-Flash-EXL3` es una suite de cuantizaciones selectivas en formato EXL3 del modelo base `zai-org/GLM-5.3-Flash-BF16`, desarrollado por Z.AI. La suite se encuentra en estado **pending**: ninguna de las variantes (3.0, 2.5 y 2.0 bpw) ha sido publicada todavía; cada repositorio es solo una tarjeta hasta que se complete la verificación de pesos, manifiestos, sumas de comprobación y evidencia de calidad. El objetivo es ofrecer versiones cuantizadas que reduzcan el uso de VRAM manteniendo la precisión en las partes críticas del modelo.

El modelo base, GLM-5.3-Flash, es un modelo de lenguaje de tipo mixture-of-experts (MoE) con una arquitectura híbrida de atención sparse y lineal, entrenado sobre 30 billones de tokens. Esta cuantización EXL3 aplica una estrategia selectiva: solo cuantiza las proyecciones de gate, up y down de los expertos enrutados, mientras que el backbone y la ruta compartida permanecen en BF16. El resultado es un layout TP4 personalizado que no es compatible con Transformers estándar, lo que limita su uso a entornos que soporten ExLlamaV3.

La relevancia de este proyecto radica en la posibilidad de ejecutar un modelo MoE de gran tamaño en hardware más modesto, aunque al estar pendiente de publicación, aún no es utilizable en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrido (atención sparse y lineal) con Manifold-Constrained Hyper-Connections |
| Parametros totales | no disponible |
| Parametros activos | no disponible (modelo MoE, pero sin cifra publicada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 selectivo: 3.0, 2.5 y 2.0 bpw (todas pendientes de publicación) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | EXL3 (layout TP4 selectivo, no safetensors estándar) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash emplea una arquitectura MoE con atención híbrida: combina atención sparse (con mecanismos de selección de tokens) y atención lineal para reducir el coste de servir contextos largos sin sacrificar precisión. Además, incorpora Manifold-Constrained Hyper-Connections, una técnica que mejora el escalado del modelo. Según la documentación de Z.AI, el modelo fue entrenado sobre 30 billones de tokens, aunque no se especifican detalles sobre la composición del dataset ni sobre fases de RLHF o DPO.

La cuantización EXL3 de este repositorio es selectiva: solo se cuantizan las proyecciones de gate, up y down de los expertos enrutados, manteniendo el backbone y la ruta compartida en BF16. Esto busca preservar la precisión en las partes más sensibles del modelo mientras se reduce el uso de memoria. El layout TP4 es personalizado y no compatible con Transformers estándar, lo que implica que solo puede ejecutarse con ExLlamaV3 o herramientas que soporten este formato específico.

## Capacidades

- Generación de texto y razonamiento: al ser una cuantización del modelo base, hereda sus capacidades, aunque no se han verificado en esta variante.
- Soporte de tool calling y function calling: no confirmado para esta variante, pero el modelo base GLM-5.3 está orientado a agentes y tareas de ingeniería de software.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades especiales: el modelo base tiene un modo de razonamiento extendido (thinking mode) según la documentación de Z.AI, pero no se ha confirmado en esta cuantización.
- Nota: al estar pendiente de publicación, no se puede evaluar el comportamiento real de estas capacidades en la versión cuantizada.

## Casos de uso

- Despliegue local en hardware limitado: una vez publicada, la cuantización EXL3 permitiría ejecutar GLM-5.3-Flash en GPUs con menos VRAM que las necesarias para el modelo BF16 completo, gracias a la reducción de memoria en los expertos enrutados.
- Inferencia de contexto largo: la arquitectura híbrida de atención del modelo base está diseñada para manejar ventanas de contexto extensas con menor coste, lo que podría ser útil en tareas como análisis de documentos largos o conversaciones multi-turno.
- Generación de código asistida: el modelo base destaca en tareas de programación compleja, por lo que esta cuantización podría emplearse en entornos de desarrollo con recursos limitados.
- Agentes autónomos: el modelo base tiene capacidades de agente y razonamiento multi-paso, lo que lo hace adecuado para pipelines de automatización, aunque la cuantización podría afectar la fiabilidad en tareas largas.
- Investigación en cuantización selectiva: el repositorio sirve como referencia para estudiar el impacto de cuantizar solo los expertos en un MoE, comparando calidad y rendimiento frente al modelo original.
- Integración en herramientas de chat local: con el soporte de ExLlamaV3, podría integrarse en interfaces como Ollama o LM Studio, aunque requiere verificación de compatibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La suite está pendiente de verificación de calidad, y no hay datos de rendimiento (latencia, throughput, precisión) para las variantes EXL3. Se recomienda consultar el repositorio cuando se complete la publicación.

## Requisitos de hardware

- VRAM estimada: no disponible, ya que no se han publicado los tamaños de los pesos cuantizados.
- GPU recomendadas: no disponible; al ser un formato EXL3, se requiere una GPU compatible con ExLlamaV3 (por ejemplo, NVIDIA con soporte CUDA), pero sin datos concretos.
- Compatibilidad con GPU de consumo: no confirmada; dependerá del tamaño final de los pesos y de la VRAM disponible.
- Opciones de despliegue: ExLlamaV3 (vía llama.cpp o vLLM si soportan el layout TP4), pero no se ha verificado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se dispone de información sobre otras cuantizaciones del mismo modelo base (por ejemplo, versiones GGUF o FP8) ni de modelos comparables en la misma categoría. La comparativa solo podría establecerse contra el modelo base BF16, pero no se tienen sus especificaciones completas.

## Limitaciones y advertencias

- El repositorio está en estado **pending**: no hay pesos publicados, solo tarjetas. No se puede descargar ni utilizar el modelo en la actualidad.
- El layout TP4 selectivo no es compatible con Transformers estándar; requiere ExLlamaV3 o herramientas específicas, lo que limita su portabilidad.
- La cuantización selectiva puede introducir degradación de calidad en tareas que dependen de los expertos enrutados, aunque el backbone se mantiene en BF16.
- No se han publicado resultados de calidad ni benchmarks, por lo que no se puede evaluar el impacto real de la cuantización.
- La licencia MIT permite uso comercial, pero al ser una obra derivada del modelo base (también MIT), no hay restricciones adicionales conocidas.
- No se especifican sesgos ni riesgos de alucinación; estos dependerán del modelo base, que no ha sido auditado en esta variante.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/0xSero/GLM-5.3-Flash-EXL3
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash-BF16
- Documentación de Z.AI sobre GLM-5.3: https://docs.z.ai/guides/llm/glm-5.3
- Blog de Z.AI sobre GLM-5.3: https://z.ai/blog/glm-5.3
- Guía de unsloth para GLM-5.3-Flash: https://unsloth.ai/docs/models/glm-5.3
- Repositorio de FP8 en DGX Spark: https://github.com/joesinvestments/GLM-5.3-Flash-FP8-4x-DGX-Spark
- Perfil de 0xSero: https://huggingface.co/0xSero
