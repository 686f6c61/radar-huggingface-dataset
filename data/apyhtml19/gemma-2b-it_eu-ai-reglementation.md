# ApyHTML19/Gemma-2b-It_EU-AI-Reglementation

## Resumen

El modelo `ApyHTML19/Gemma-2b-It_EU-AI-Reglementation` es un ajuste fino (fine-tuning) mediante LoRA del modelo base `google/gemma-2b-it`, desarrollado por el usuario ApyHTML19. Está especializado en responder consultas sobre el Reglamento de Inteligencia Artificial de la Unión Europea y el Reglamento General de Protección de Datos (GDPR), a partir de un dataset propio de pares instrucción-respuesta. El modelo tiene 2.506.172.416 parámetros (2,5 mil millones) y se distribuye con licencia MIT, lo que permite uso comercial sin restricciones adicionales.

La relevancia de este modelo radica en su enfoque de dominio: ofrece una alternativa ligera y de código abierto para tareas de consulta normativa en el ámbito legal europeo, sin necesidad de recurrir a modelos de gran tamaño. Al estar basado en Gemma 2B, hereda la arquitectura transformer decoder de Google DeepMind, aunque su ventana de contexto efectiva durante el entrenamiento se limitó a 256 tokens, lo que condiciona su uso en conversaciones largas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Gemma 2B) |
| Parametros totales | 2.506.172.416 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado con max sequence length 256) |
| Tipos de cuantizacion | 4-bit NF4 durante entrenamiento; pesos finales en safetensors (formato no especificado) |
| Idiomas soportados | no disponible (presumiblemente inglés, dado el dataset) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-2b-it`, un transformer decoder con 2,5 mil millones de parámetros, y se ajusta mediante LoRA (Low-Rank Adaptation) con rango 8, alpha 16 y dropout 0,05, aplicado a las proyecciones de atención (q, k, v, o). El entrenamiento se realizó con cuantización 4-bit NF4 (bitsandbytes) para reducir el consumo de memoria, usando el framework HuggingFace Transformers con TRL y PEFT. Se empleó un optimizador paged_adamw_8bit, learning rate 2e-4, 3 épocas, batch size 1 y acumulación de gradientes de 16 pasos. La longitud máxima de secuencia se fijó en 256 tokens, lo que limita la capacidad de procesar contextos extensos.

El dataset de entrenamiento, `ApyHTML19/EU-AI-Regulation-GDPR-2025`, contiene pares de instrucción y respuesta sobre la regulación de IA en la UE y el GDPR. No se especifica el número de ejemplos ni la composición exacta del dataset. No se menciona el uso de RLHF ni DPO; el ajuste es puramente supervisado.

## Capacidades

- Generación de texto en formato instrucción-respuesta, siguiendo la plantilla de Gemma (`<start_of_turn>user` / `<end_of_turn>`).
- Especialización en consultas sobre el Reglamento de IA de la UE y el GDPR, respondiendo a preguntas normativas concretas.
- Capacidad multilingüe limitada: no se especifican idiomas, pero al estar basado en Gemma 2B, probablemente soporta inglés y otros idiomas con menor calidad.
- No se documenta soporte para tool calling, function calling, agentes ni razonamiento multi-paso.
- No se indica modo de pensamiento (thinking mode) ni capacidades multimodales (visión, audio).

## Casos de uso

- Asistente de consulta normativa para despachos de abogados: el modelo puede responder preguntas sobre artículos concretos del Reglamento de IA o del GDPR, ayudando a localizar referencias legales de forma rápida.
- Formación interna en empresas tecnológicas: sirve como herramienta de autoaprendizaje para empleados que necesitan conocer los requisitos de cumplimiento de la UE en productos de IA.
- Chatbot de soporte para startups que desarrollan sistemas de IA: permite resolver dudas sobre obligaciones de transparencia, evaluación de riesgos o notificación a autoridades.
- Generación de resúmenes de textos legales: dado su entrenamiento en pares instrucción-respuesta, puede resumir cláusulas o artículos si se le proporciona el texto dentro de la ventana de 256 tokens.
- Validación de cumplimiento en documentación técnica: el modelo puede revisar descripciones de sistemas de IA y señalar posibles incumplimientos del GDPR o del Reglamento de IA.
- Prototipado de asistentes legales de bajo coste: al ser un modelo pequeño y con licencia MIT, puede desplegarse en infraestructura modesta para pruebas de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: al tener 2,5 mil millones de parámetros, en fp16 ocupa aproximadamente 5 GB; con cuantización 4-bit (si se aplica) podría reducirse a ~1,3 GB, pero el repositorio no especifica la cuantización de los pesos finales.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM (p. ej., RTX 2060, RTX 3060) para inferencia en fp16; GPUs con 4 GB podrían funcionar con cuantización adicional.
- Cabe en GPUs de consumo: sí, en tarjetas como RTX 3060, RTX 4060 o superiores.
- Opciones de despliegue: al ser un modelo de HuggingFace con safetensors, puede servirse con vLLM, llama.cpp (si se convierte a GGUF), Ollama o TGI. No se proporcionan configuraciones específicas.
- Latencia y throughput: no disponibles; dependerán del hardware y del backend elegido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| ApyHTML19/Gemma-2b-It_EU-AI-Reglementation | 2,5 B | no disponible (256 en entrenamiento) | MIT | Regulacion IA UE y GDPR |
| google/gemma-2b-it (base) | 2,5 B | 8192 (según documentación de Google) | Gemma Terms of Use | Generico, instrucciones |
| microsoft/phi-2 | 2,7 B | 2048 | MIT | Razonamiento y codigo |

La comparativa se basa en datos públicos de los modelos base; no hay benchmarks del modelo ajustado. La principal diferencia es la especialización en el dominio legal europeo, aunque su ventana de contexto reducida limita su utilidad en tareas que requieran documentos largos.

## Limitaciones y advertencias

- Ventana de contexto limitada: el entrenamiento se realizó con secuencias de máximo 256 tokens, por lo que el modelo no maneja bien conversaciones largas ni documentos extensos.
- Riesgo de alucinación: al ser un modelo pequeño y especializado, puede generar respuestas incorrectas o inventar referencias legales si no se valida externamente.
- Sesgos del dataset: el dataset es de creación propia y no se ha auditado; puede contener errores o interpretaciones parciales de la normativa.
- Licencia del modelo base: aunque el adaptador tiene licencia MIT, el uso del modelo base `google/gemma-2b-it` está sujeto a los Términos de Uso de Gemma de Google, que pueden imponer restricciones adicionales (p. ej., prohibición de uso para ciertos fines).
- Sin soporte para tool calling ni agentes: no es adecuado para integraciones que requieran llamadas a funciones externas.
- Idiomas no especificados: no se garantiza un rendimiento multilingüe; probablemente el inglés es el idioma principal.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ApyHTML19/Gemma-2b-It_EU-AI-Reglementation
- Dataset de entrenamiento: https://huggingface.co/datasets/ApyHTML19/EU-AI-Regulation-GDPR-2025
- Modelo base google/gemma-2b-it: https://huggingface.co/google/gemma-2b-it
- Hosting de gemma-2b-it en la UE: https://hostyourai.com/models/google/gemma-2b-it
- Blog de Google sobre Gemma: https://developers.googleblog.com/en/smaller-safer-more-transparent-advancing-responsible-ai-with-gemma/
- Página de Gemma en Google DeepMind: https://deepmind.google/models/gemma/
- Documentación de Gemma en Google AI: https://ai.google.dev/gemma/docs
