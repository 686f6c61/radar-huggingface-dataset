# ruiname/ruiname-AI

## Resumen

ruiname-AI es un modelo de generación de texto en japonés obtenido mediante ajuste fino completo (*full fine-tuning*) del modelo base LiquidAI/LFM2.5-1.2B-JP-202606. Lo desarrolla el usuario de Hugging Face "ruiname" (Rui Suzuki) y su propósito es emular el estilo de escritura de una persona concreta, "Rui", en conversaciones de la aplicación de mensajería LINE: mensajes cortos, repartidos en varias burbujas, con un tono informal propio de amigos y familiares.

Se trata de un modelo de persona (*persona model*), no de un asistente generalista. Su relevancia es acotada: sirve como ejemplo de ajuste fino de un modelo pequeño (1.304.558.336 parámetros, aproximadamente 1,2B) para replicar un idiolecto concreto a partir de un historial de conversaciones privado que no se ha publicado. No está pensado para tareas de razonamiento, código o conocimiento factual.

El modelo se distribuye en tres formatos (safetensors en bf16, GGUF Q8_0 y GGUF Q4_K_M) y emplea la licencia lfm1.0 del modelo base, lo que condiciona su uso comercial. La información pública sobre arquitectura interna, datos de entrenamiento y evaluación es muy limitada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LFM2.5, familia LFM2; detalles no especificados en la información proporcionada) |
| Parámetros totales | 1.304.558.336 (dato real de safetensors) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | bf16 (safetensors), GGUF Q8_0 (8 bits), GGUF Q4_K_M (4 bits) |
| Idiomas soportados | japonés (ja) |
| Licencia | lfm1.0 (etiquetada como "other") |
| Formato de pesos | safetensors, GGUF, ONNX |

## Arquitectura y entrenamiento

La arquitectura concreta no se detalla en la información disponible; el modelo hereda la del base LiquidAI/LFM2.5-1.2B-JP-202606, de la familia LFM2 de Liquid AI, pero no se especifican en la model card ni el tipo de transformer, ni la ventana de contexto, ni la composición del corpus original. Lo que sí se documenta es el procedimiento de ajuste: *full fine-tuning* sobre el modelo base, con la función de pérdida calculada únicamente sobre los turnos de respuesta de "Rui" (no sobre los mensajes del interlocutor).

El entrenamiento se realizó durante 2 épocas con tasa de aprendizaje 2e-5 y scheduler cosine, seleccionando el checkpoint de la primera época por tener la menor pérdida de validación (descenso de 6,46 a 2,97). El coste computacional fue de aproximadamente 2 minutos en una única GPU A100. El conjunto de datos de entrenamiento (historial de conversaciones) es privado y no se incluye en el repositorio. No se documenta uso de RLHF, DPO ni ninguna innovación arquitectónica adicional.

## Capacidades

- Generación de texto conversacional en japonés con un estilo de persona muy específico (mensajes cortos, múltiples burbujas separadas por saltos de línea).
- Emulación de registro informal de mensajería (LINE), incluyendo ritmo y segmentación de mensajes.
- Conversación multi-turno dentro de los límites del modelo base.
- No se documenta soporte de *tool calling* ni de *function calling*.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documenta capacidad de visión, audio ni modo de razonamiento explícito (*thinking*).
- Multilingüismo: limitado al japonés según la etiqueta de idioma del repositorio.

## Casos de uso

- Réplica de estilo conversacional para prototipos: usar el modelo con el *system prompt* original para generar respuestas que imiten el registro de mensajería de una persona concreta, útil en pruebas de UX de aplicaciones de chat.
- Investigación sobre modelado de persona e idiolecto: sirve como caso de estudio de ajuste fino de un modelo de 1,2B con pérdida enmascarada solo sobre los turnos del hablante objetivo.
- Generación de datos sintéticos de conversación informal en japonés: producir diálogos de estilo LINE para aumentar corpus de entrenamiento o evaluación de sistemas de detección de estilo.
- Chatbot de acompañamiento con personalidad fija en despliegues locales: con el GGUF Q4_K_M (0,8 GB) puede ejecutarse en portátiles sin GPU dedicada mediante llama.cpp, Ollama o LM Studio.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece Q4_K_M y Q8_0 del mismo ajuste, lo que permite medir la degradación de estilo y coherencia entre niveles de cuantización.
- Docencia y demostraciones de *fine-tuning*: el coste de entrenamiento documentado (unos 2 minutos en una A100) lo convierte en un ejemplo práctico de ajuste completo a pequeña escala.
- Base para nuevos ajustes de persona: al incluir `model.safetensors` en bf16, puede reentrenarse o recuantizarse para otras voces o registros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica documentada es la pérdida de validación del entrenamiento (6,46 en la época 1 frente a 2,97 en la mejor época seleccionada), que no es comparable con métricas estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 2,6 GB solo para pesos, más overhead de activaciones y caché KV (el tamaño del repositorio en safetensors es de 2,6 GB).
- GGUF Q8_0: aproximadamente 1,4 GB de pesos; ejecutable en CPU con RAM suficiente o en GPU con 2-3 GB de VRAM.
- GGUF Q4_K_M: aproximadamente 0,8 GB de pesos; cabe holgadamente en GPU de consumo integradas o dedicadas de gama baja.
- GPU recomendadas: cualquier GPU de consumo moderna (RTX 3060, RTX 4060, RTX 4090) es sobredimensionada para este modelo; el entrenamiento documentado se hizo en una A100, pero la inferencia no la requiere.
- Cabe en GPU de consumo: sí, en todas las mencionadas, e incluso en CPU.
- Opciones de despliegue: llama.cpp (`llama-cli` con `-cnv`), LM Studio, Ollama, y Transformers para la versión safetensors. No se documenta soporte específico de vLLL o TGI en la información disponible.
- Latencia y throughput: no disponibles. El autor solo reporta el tiempo de entrenamiento (unos 2 minutos en una A100).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| ruiname-AI | 1,2B | no disponible | ja | lfm1.0 | Persona / estilo LINE |
| LiquidAI/LFM2.5-1.2B-JP-202606 (base) | 1,2B | no disponible | ja | lfm1.0 | Modelo generalista japonés |
| Modelos de persona ajustados de tamaño similar | no disponible | no disponible | según ajuste | variable | Emulación de estilo |

La comparación más directa es con su propio modelo base: ruiname-AI conserva el tamaño y la licencia, pero sustituye el comportamiento generalista por un estilo conversacional muy restringido. No se dispone de datos de rendimiento comparativo con otras alternativas de la misma categoría.

## Limitaciones y advertencias

- Sesgos: al entrenarse sobre el historial privado de una sola persona, el modelo reproduce sus patrones lingüísticos y posibles sesgos personales; no hay documentación sobre filtrado o mitigación.
- Alucinación: es un modelo de 1,2B especializado en estilo, no en conocimiento factual; es probable que genere afirmaciones incorrectas con apariencia verosímil.
- Contexto e idioma: solo se declara japonés; no se garantiza un comportamiento correcto en castellano ni en otras lenguas. La longitud de contexto no está documentada.
- Dependencia del *system prompt*: el autor indica que debe usarse exactamente el mismo *system prompt* del entrenamiento; desviarse de él puede degradar el estilo.
- Datos privados: el corpus de entrenamiento no es público, lo que impide auditar el modelo y limita su reproducibilidad.
- Licencia: la licencia lfm1.0 del modelo base puede imponer restricciones al uso comercial; debe revisarse el enlace de licencia antes de desplegarlo en producción.
- Madurez: el repositorio tiene cero descargas y cero *likes* en el momento de la consulta, sin validación externa ni evaluación independiente.
- Uso responsable: emular la voz de una persona real plantea riesgos de suplantación; conviene etiquetar claramente las salidas como generadas por IA.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ruiname/ruiname-AI
- Perfil del autor: https://huggingface.co/ruiname
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-JP-202606
- Licencia lfm1.0: https://huggingface.co/LiquidAI/LFM2.5-1.2B-JP-202606/blob/main/LICENSE
