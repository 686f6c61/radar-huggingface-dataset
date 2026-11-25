# nielsr/qwen35-4b-hf-hub-qa-mcp-v2-glm-53-pi-160-grpo-smoke-grpo-merged

## Resumen

El modelo `nielsr/qwen35-4b-hf-hub-qa-mcp-v2-glm-53-pi-160-grpo-smoke-grpo-merged` es un ajuste fino de tipo merged publicado por el usuario nielsr en Hugging Face. Se obtiene al fusionar el adaptador LoRA `qwen35-4b-hf-hub-qa-mcp-v2-glm-53-pi-160-grpo-smoke-grpo-lora` sobre el modelo base `nielsr/qwen35-4b-hf-hub-qa-mcp-v2-glm-53-pi-160-sft-merged`, que a su vez parte de un modelo de la familia Qwen 3.5 de aproximadamente 4.500 millones de parámetros. El pipeline declarado es `text-generation`, aunque las etiquetas incluyen `image-text-to-text`, lo que sugiere una variante multimodal de la familia Qwen 3.5.

El propósito del modelo, según los metadatos disponibles, es servir como artefacto de un proceso de destilación orientado a agentes ("agent-distill") sobre la tarea `hf-hub-qa-mcp`, con la versión `pi@1.6.0`. El nombre indica que se ha aplicado una etapa de GRPO (optimización de política con recompensas relativas de grupo) sobre un modelo previamente ajustado con SFT, en el contexto de un "smoke test" (prueba de humo), lo que apunta a un experimento de validación de pipeline más que a un modelo listo para producción.

La relevancia de esta ficha es doble: por un lado, documenta un caso de entrenamiento por refuerzo (GRPO) aplicado a un modelo de ~4,5 B orientado a tareas de agentes y uso de herramientas MCP (Model Context Protocol); por otro, sirve de referencia para entender el linaje de checkpoints intermedios que aparecen en experimentos de destilación de agentes. La información pública es muy limitada: no hay licencia declarada, ni idiomas, ni resultados de benchmarks, ni model card descriptiva más allá de la nota de fusión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen 3.5; tag `qwen3_5`); detalles de capas y atención no disponibles |
| Parametros totales | 4.539.265.536 (aprox. 4,54 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a la familia Qwen 3.5 (tag `qwen3_5`), un transformer de aproximadamente 4,54 B de parámetros. El pipeline declarado es `text-generation`, pero la etiqueta `image-text-to-text` sugiere que el modelo base podría incluir capacidades de visión; no se dispone de confirmación explícita en la información proporcionada. No se detallan número de capas, dimensión oculta, tipo de atención ni configuración de tokenizador.

El entrenamiento se organiza en tres etapas identificables por el linaje de nombres: (1) un modelo base de la familia Qwen 3.5; (2) un ajuste supervisado (SFT) que produce `qwen35-4b-hf-hub-qa-mcp-v2-glm-53-pi-160-sft-merged`; y (3) una etapa de GRPO sobre un adaptador LoRA (`...-grpo-smoke-grpo-lora`) que se fusiona en este checkpoint final. El sufijo "smoke" indica que la etapa GRPO fue una prueba de humo, es decir, una ejecución de validación del pipeline de entrenamiento por refuerzo, no un entrenamiento a escala. La tarea objetivo es `hf-hub-qa-mcp`, orientada a preguntas y respuestas sobre el Hub de Hugging Face mediante el protocolo MCP. No se especifican el número de tokens de entrenamiento, la composición del dataset, la función de recompensa de GRPO ni si hubo etapas adicionales de DPO o RLHF.

## Capacidades

- Generación de texto conversacional en formato chat (pipeline `text-generation`, tag `conversational`).
- Orientación a tareas de agentes: el nombre y las etiquetas (`agent-distill`) indican entrenamiento para interacción con herramientas y protocolos de agente, concretamente MCP (Model Context Protocol).
- Preguntas y respuestas sobre el Hub de Hugging Face: la tarea `hf-hub-qa-mcp` apunta a consultas sobre modelos, datasets y espacios del Hub mediante llamadas a herramientas.
- Posible soporte multimodal (image-text-to-text): la etiqueta está presente, pero no se confirma en la model card ni se detalla su alcance.
- Soporte de tool calling / function calling: inferido del contexto MCP y de la tarea de entrenamiento; no documentado explícitamente.
- Razonamiento multi-paso: plausible por la etapa GRPO, pero no verificado ni documentado.
- Capacidades multilingües: no disponibles.
- Modo thinking, audio u otras capacidades especiales: no disponibles.

## Casos de uso

- Agente de consulta del Hub de Hugging Face: el modelo puede responder preguntas sobre modelos, datasets y espacios consultando la API del Hub mediante herramientas MCP, que es exactamente la tarea para la que fue ajustado (`hf-hub-qa-mcp`).
- Asistente de documentación técnica con acceso a herramientas: integrado en un servidor MCP, puede resolver dudas de desarrolladores consultando fuentes externas en lugar de depender solo de su conocimiento paramétrico.
- Prototipado de pipelines de agentes: al ser un checkpoint de "smoke test" de GRPO, es útil como referencia para validar cadenas de entrenamiento SFT → GRPO → merge antes de escalar a modelos mayores.
- Evaluación de destilación de agentes: sirve para comparar el comportamiento de un modelo de ~4,5 B destilado frente a su profesor en tareas de uso de herramientas, midiendo la brecha de rendimiento.
- Generación de código auxiliar para integraciones MCP: puede redactar esquemas de herramientas, ejemplos de llamadas y respuestas de ejemplo en el contexto de servidores MCP, aunque sin garantías de calidad de producción.
- Chat conversacional de propósito general con contexto de herramientas: desplegable como endpoint compatible (`endpoints_compatible`) para pruebas internas de asistentes que necesitan invocar funciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 9 GB solo para pesos (4,54 B × 2 bytes), más overhead de activaciones y KV cache; en la práctica, unos 10-12 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 5 GB para pesos; en 4 bits, alrededor de 3 GB, aunque no se han publicado pesos cuantizados oficiales.
- GPU recomendadas: A100 40/80 GB o H100 para despliegue concurrente y contextos largos; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia en fp16 con holgura; GPUs de 12-16 GB (RTX 4080, RTX 4070 Ti Super) suficientes en 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 en fp16 y en GPUs de 8-12 GB con cuantización.
- Opciones de despliegue: transformers (librería declarada), vLLM y TGI para serving; llama.cpp/Ollama solo si se generan pesos GGUF, que no están publicados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este modelo (qwen35-4b ... grpo-merged) | ~4,54 B | no disponible | no disponible | Hugging Face, 0 descargas | Checkpoint de smoke test GRPO |
| Modelo base SFT (`...-sft-merged`) | ~4,54 B | no disponible | no disponible | Hugging Face | Etapa previa sin GRPO |
| Adaptador LoRA GRPO (`...-grpo-lora`) | Adaptador PEFT | no disponible | no disponible | Hugging Face | Requiere el modelo SFT para usarse |
| Familia Qwen 3.5 (modelos oficiales) | no disponible | no disponible | no disponible | no disponible | Referencia de arquitectura; sin datos verificados en esta ficha |

No se dispone de información suficiente para comparar rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Ausencia de licencia declarada: no se puede asumir uso comercial permitido; es necesario contactar con el autor antes de cualquier despliegue en producción.
- Model card mínima: no hay descripción de datos de entrenamiento, función de recompensa, hiperparámetros ni evaluación, lo que impide auditar sesgos o calidad.
- Checkpoint de "smoke test": la etapa GRPO fue una prueba de humo, por lo que el efecto del refuerzo sobre el comportamiento final es probablemente marginal y no validado.
- Riesgo de alucinación: inherente a modelos de ~4,5 B en tareas de QA sobre fuentes externas; sin evaluación publicada no puede cuantificarse.
- Sesgos conocidos: no documentados; al no publicarse la composición del dataset, no es posible evaluar sesgos de género, idioma o dominio.
- Idiomas: no declarados; el rendimiento fuera del inglés (o del idioma dominante del dataset de entrenamiento) es desconocido.
- Contexto: longitud no disponible; no debe asumirse una ventana larga sin verificación.
- Especialización estrecha: el ajuste está orientado a la tarea `hf-hub-qa-mcp`; su rendimiento en tareas generales puede degradarse respecto al modelo base.
- Sin cuantizaciones publicadas: el despliegue eficiente en hardware limitado requiere generar los pesos GGUF/AWQ por cuenta propia.
- 0 descargas y 0 likes: no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nielsr/qwen35-4b-hf-hub-qa-mcp-v2-glm-53-pi-160-grpo-smoke-grpo-merged
- Modelo base SFT: https://huggingface.co/nielsr/qwen35-4b-hf-hub-qa-mcp-v2-glm-53-pi-160-sft-merged
- Adaptador LoRA GRPO: https://huggingface.co/nielsr/qwen35-4b-hf-hub-qa-mcp-v2-glm-53-pi-160-grpo-smoke-grpo-lora
- Perfil del autor: https://huggingface.co/nielsr
