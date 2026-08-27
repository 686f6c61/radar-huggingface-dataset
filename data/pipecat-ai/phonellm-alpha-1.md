# pipecat-ai/phonellm-alpha-1

## Resumen

PhoneLLM Alpha 1 es un modelo de lenguaje abierto desarrollado por el equipo de Daily y Pipecat, especializado en agentes de voz y conversaciones telefónicas. Se trata de un ajuste fino completo (full-parameter fine-tune) del modelo NVIDIA Nemotron 3 Nano 30B-A3B, entrenado con el framework NVIDIA NeMo. Su objetivo principal es resolver dos problemas habituales en los agentes de voz: la latencia excesiva provocada por los tokens de razonamiento y la imprecisión en la invocación de herramientas en conversaciones largas y multiturno.

El modelo emplea una arquitectura híbrida Mamba-Transformer de mezcla de expertos (MoE) con 31.577.937.344 parámetros totales, de los cuales solo 3.500 millones están activos por token, lo que permite una inferencia rápida y económica. Dispone de una ventana de contexto de 262.144 tokens, lo que le permite manejar conversaciones telefónicas extensas sin perder información relevante. Según sus desarrolladores, PhoneLLM alcanza un rendimiento comparable al de GPT 5.6 Terra en el benchmark PhoneBench v1, pero con un coste un 94 % inferior y una latencia P95 de tiempo hasta el primer token 1.300 ms menor.

La relevancia de este lanzamiento radica en la tendencia hacia modelos pequeños y especializados que superan a los modelos frontera en tareas concretas, ofreciendo ventajas en precisión, velocidad, coste y privacidad de datos. PhoneLLM está diseñado para integrarse en pipelines de agentes de voz mediante frameworks como Pipecat, y se distribuye bajo licencia BSD 2-Clause, sin restricciones comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba-Transformer, mixture-of-experts (MoE) |
| Parametros totales | 31.577.937.344 (30B declarados) |
| Parametros activos | 3.500 millones (3.5B) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | No disponible (solo bfloat16 safetensors) |
| Idiomas soportados | Inglés |
| Licencia | BSD 2-Clause (derivado de NVIDIA Nemotron Open Model License) |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

PhoneLLM Alpha 1 hereda la arquitectura híbrida Mamba-Transformer de su modelo base, NVIDIA Nemotron 3 Nano 30B-A3B. Se trata de un modelo de mezcla de expertos con 30.000 millones de parámetros totales y 3.500 millones activos por token, lo que reduce significativamente el coste computacional en inferencia. La combinación de capas Mamba (modelos de espacio de estado) con capas Transformer permite capturar dependencias de largo alcance de forma eficiente, manteniendo una alta calidad de generación.

El entrenamiento consistió en un ajuste fino supervisado completo (full-parameter SFT) utilizando el framework NVIDIA NeMo. No se han publicado detalles sobre el volumen de datos de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO. La innovación principal del modelo reside en su entrenamiento específico para invocar herramientas con precisión en conversaciones multiturno, sin necesidad de activar el modo de razonamiento (thinking). Según la documentación, muchos modelos fallan al confirmar acciones sin ejecutarlas realmente; PhoneLLM está calibrado para llamar a las herramientas correctas en el momento adecuado, incluso con `temperature=0` y el razonamiento desactivado.

## Capacidades

- Generación de texto conversacional optimizada para diálogos telefónicos naturales y fluidos.
- Tool calling y function calling preciso en conversaciones largas y multiturno, sin depender de tokens de razonamiento.
- Soporte para agentes y flujos de trabajo multi-paso, con capacidad de mantener el contexto durante toda la interacción.
- Manejo de ventanas de contexto muy amplias (262.144 tokens), adecuado para historiales de llamadas extensos.
- Integración nativa con el framework Pipecat para orquestación de agentes de voz (entrada de transcripción, salida de TTS).
- Inferencia de baja latencia gracias a la arquitectura MoE con solo 3.5B parámetros activos.
- Capacidad multilingüe limitada al inglés; no se menciona soporte para otros idiomas.

## Casos de uso

- Atención al cliente telefónica en servicios financieros: el modelo puede gestionar consultas sobre saldos, movimientos o productos bancarios, invocando APIs de backend para verificar datos en tiempo real y respondiendo con un tono conversacional adecuado.
- Gestión de citas y reservas en hostelería y salud: PhoneLLM puede confirmar, modificar o cancelar reservas mediante tool calling, manteniendo el contexto de la conversación durante toda la llamada.
- Agentes de llamadas salientes para recordatorios y cobros: gracias a su baja latencia y precisión en la invocación de herramientas, puede realizar llamadas proactivas para recordar pagos, citas o renovaciones, ejecutando acciones en sistemas externos.
- Soporte técnico de primer nivel: con su ventana de contexto de 262K tokens, puede manejar conversaciones largas con clientes que describen problemas complejos, consultando bases de conocimiento y escalando a agentes humanos cuando sea necesario.
- Automatización de encuestas y sondeos telefónicos: el modelo puede guiar cuestionarios estructurados, registrar respuestas mediante tool calls y adaptar las preguntas según las respuestas anteriores.
- Asistentes virtuales integrados en centralitas: combinado con reconocimiento de voz y síntesis de texto, PhoneLLM puede actuar como recepcionista automática, derivando llamadas, tomando mensajes o proporcionando información corporativa.
- Pruebas y simulación de conversaciones: los desarrolladores pueden usar PhoneLLM para generar diálogos de prueba realistas y validar flujos de agentes antes de desplegarlos en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los desarrolladores presentan PhoneBench v1, un benchmark propio que evalúa la idoneidad de los modelos para agentes telefónicos, midiendo precisión, estilo de habla, latencia y coste por minuto. Según la model card, PhoneLLM Alpha 1 obtiene una precisión comparable o superior a la mayoría de los modelos utilizados en producción para agentes de voz, con menor latencia y coste. Se menciona explícitamente que PhoneLLM rinde al nivel de GPT 5.6 Terra, siendo un 94 % más barato y 1.300 ms más rápido en el percentil 95 del tiempo hasta el primer token. No se proporcionan cifras numéricas detalladas de otros benchmarks estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- El repositorio ocupa 63.2 GB en formato bfloat16 safetensors, por lo que se necesitan aproximadamente 63 GB de VRAM para cargar el modelo completo sin cuantización.
- Con 3.5B parámetros activos, el modelo puede ejecutarse en GPUs de consumo si se aplica cuantización (aunque no se especifican tipos de cuantización disponibles). Una RTX 4090 con 24 GB podría ser suficiente con cuantización a 4 bits, pero no hay datos oficiales al respecto.
- Para despliegue en producción se recomienda vLLM o SGLang, siguiendo las recetas de NVIDIA para Nemotron 3 Nano. Es necesario activar `trust_remote_code=True` en transformers.
- No se han publicado datos de latencia o throughput específicos más allá de la comparación con GPT 5.6 Terra en PhoneBench.
- El modelo está diseñado para entornos de baja latencia; se recomienda usar GPUs con alta memoria de ancho de banda como A100, H100 o L40S para servir múltiples conversaciones concurrentes.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Uso principal |
|---|---|---|---|---|---|
| PhoneLLM Alpha 1 | 31.58B | 3.5B | 262K | BSD 2-Clause | Agentes de voz telefónicos |
| NVIDIA Nemotron 3 Nano 30B-A3B | 30B | 3.5B | 262K | NVIDIA Open Model | Modelo base generalista |
| GPT 5.6 Terra | No disponible | No disponible | No disponible | Propietaria | Modelo frontera generalista |

La comparación directa con GPT 5.6 Terra se basa en los datos de PhoneBench v1 publicados por los desarrolladores: PhoneLLM ofrece precisión comparable con un coste un 94 % inferior y una latencia P95 1.300 ms menor. Frente a su modelo base, PhoneLLM incorpora un ajuste específico para tool calling en conversaciones telefónicas, lo que mejora la fiabilidad en escenarios de agente sin necesidad de activar el razonamiento. No se dispone de datos para comparar con otros modelos de código abierto especializados en voz.

## Limitaciones y advertencias

- El modelo solo soporta inglés; no hay soporte multilingüe documentado.
- Al ser un ajuste fino de un modelo NVIDIA, la licencia original de Nemotron puede imponer condiciones adicionales, aunque la model card indica que la licencia BSD 2-Clause no tiene restricciones comerciales. Se recomienda revisar ambos términos de licencia antes de su uso en producción.
- No se han publicado evaluaciones sobre sesgos, alucinaciones o comportamientos no deseados en dominios específicos.
- El modelo requiere `trust_remote_code=True` en transformers, lo que implica ejecutar código personalizado del repositorio; se debe auditar el código antes de su uso en entornos sensibles.
- La precisión en tool calling está optimizada para conversaciones telefónicas; su rendimiento en otras tareas generales no ha sido evaluado públicamente.
- No se proporcionan datos sobre el dataset de entrenamiento, por lo que no es posible evaluar posibles sesgos de contenido o cobertura temática.
- El modelo está pensado para integrarse con frameworks como Pipecat; su uso fuera de ese ecosistema puede requerir adaptaciones adicionales.

## Enlaces

- HuggingFace: https://huggingface.co/pipecat-ai/phonellm-alpha-1
- Modelo base NVIDIA Nemotron 3 Nano 30B-A3B: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16
- Pipecat (framework oficial): https://www.pipecat.ai/
- Documentación de Pipecat: https://docs.pipecat.ai/
- Repositorio de Pipecat en GitHub: https://github.com/pipecat-ai/pipecat
