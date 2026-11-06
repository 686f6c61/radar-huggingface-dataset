# JobSched/Phi-3-custom-trained-v2

## Resumen

Phi-3-custom-trained-v2 es un ajuste fino (fine-tuning) del modelo JobSched/Phi-3-custom-v2, publicado por el usuario JobSched en Hugging Face. Se trata de un modelo de generación de texto de la familia Phi-3 de Microsoft, con 3.820.815.360 parámetros totales según los pesos en safetensors, lo que lo sitúa en el rango de los 3.8B parámetros. El modelo se ha entrenado mediante AutoTrain, la plataforma de entrenamiento automatizado de Hugging Face, y está etiquetado como un fine-tuning con PEFT sobre el modelo base mencionado.

El modelo resuelve el problema de adaptar un modelo base Phi-3 a un dominio o tarea específica mediante entrenamiento supervisado, probablemente conversacional dado el tag "conversational" y el formato de chat que se muestra en la model card. Es relevante porque demuestra el flujo típico de personalización de modelos pequeños con AutoTrain, aunque la información pública disponible es muy limitada: no se especifican datos de entrenamiento, hiperparámetros, composición del dataset ni resultados de evaluación.

La ficha se elabora a partir de los datos disponibles en Hugging Face y la model card. Cualquier dato no presente en esa información se indica explícitamente como "no disponible". No se han publicado resultados de benchmarks ni detalles técnicos del proceso de entrenamiento en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Phi-3, según el tag `phi3`) |
| Parametros totales | 3.820.815.360 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | No disponible |
| Licencia | other (no especificada en detalle) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Phi-3, tal como indica el tag `phi3` y el nombre del modelo base. Con 3.820.815.360 parámetros, corresponde a la variante Phi-3-mini de 3.8B parámetros. El entrenamiento se realizó mediante AutoTrain, la herramienta de Hugging Face para fine-tuning automatizado, y el modelo lleva el tag `peft`, lo que indica que se aplicó Parameter-Efficient Fine-Tuning (probablemente LoRA) sobre el modelo base JobSched/Phi-3-custom-v2.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF o DPO, ni sobre innovaciones técnicas específicas. La model card únicamente indica que fue entrenado con AutoTrain y proporciona un ejemplo de uso con `apply_chat_template`, lo que sugiere un formato conversacional. No se han publicado detalles sobre hiperparámetros, epochs, learning rate ni tamaño del conjunto de datos.

## Capacidades

- Generación de texto conversacional: el modelo está etiquetado como `conversational` y la model card muestra un ejemplo de diálogo con formato de chat.
- Soporte de plantilla de chat: se puede usar `apply_chat_template` para formatear conversaciones multi-turno.
- Generación de texto autoregresiva estándar mediante `transformers`.
- Compatibilidad con text-generation-inference (tag `text-generation-inference`) y endpoints de Hugging Face (tag `endpoints_compatible`).
- Fine-tuning con PEFT: el modelo es un adaptador o modelo ajustado sobre Phi-3-custom-v2.
- Capacidades específicas de razonamiento, código, matemáticas, tool calling, agentes o multilingüismo: no disponibles en la información proporcionada.

## Casos de uso

- Prototipado de asistentes conversacionales: el modelo puede usarse con `apply_chat_template` para construir un chatbot básico en entornos de desarrollo, aprovechando su formato de chat y su tamaño de 3.8B parámetros para iterar rápidamente.
- Experimentación con fine-tuning sobre Phi-3: sirve como ejemplo de pipeline AutoTrain + PEFT para desarrolladores que quieran replicar el flujo de personalización de un modelo base.
- Generación de texto en aplicaciones de bajo recursos: con 3.8B parámetros, puede desplegarse en GPUs de gama media (por ejemplo, RTX 4090 o A10) para tareas de generación de texto no críticas.
- Evaluación de modelos ajustados: útil para investigadores que quieran comparar el efecto de un fine-tuning con AutoTrain frente al modelo base Phi-3-custom-v2.
- Integración en demos con Hugging Face Endpoints: el tag `endpoints_compatible` permite desplegarlo como endpoint gestionado para pruebas de concepto.
- Base para nuevos fine-tunings: al ser un modelo pequeño y con licencia "other", puede servir como punto de partida para ajustes adicionales en dominios específicos, siempre que la licencia lo permita.
- Generación de respuestas en formato conversacional para tareas de atención al cliente simple: aunque no hay datos de rendimiento, su tamaño permite inferencia de baja latencia en hardware consumer.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 7,6 GB solo para los pesos (3.820.815.360 parámetros × 2 bytes), más overhead de activaciones y KV cache; se recomiendan al menos 10-12 GB de VRAM.
- VRAM estimada en cuantización de 8 bits: alrededor de 4 GB para pesos, más overhead; cabe en GPUs con 8 GB.
- VRAM estimada en cuantización de 4 bits: alrededor de 2 GB para pesos; cabe en GPUs consumer con 4-6 GB, aunque la cuantización no está publicada oficialmente.
- GPUs recomendadas: NVIDIA A100 (40/80 GB), H100, L40S, A10G, RTX 4090 (24 GB), RTX 3090 (24 GB). También puede ejecutarse en RTX 4080 (16 GB) y RTX 4070 Ti (12 GB) en FP16 con margen ajustado.
- Cabe en GPU consumer: sí, en RTX 4090, RTX 3090, RTX 4080 y similares con 12 GB o más en FP16; en 4 bits cabría en GPUs de 6-8 GB.
- Opciones de despliegue: transformers (nativo), text-generation-inference (tag oficial), Hugging Face Endpoints (tag `endpoints_compatible`), vLLM (compatible con arquitectura Phi-3), llama.cpp/Ollama (requiere conversión a GGUF, no publicada).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| JobSched/Phi-3-custom-trained-v2 | 3,82B | No disponible | other | Hugging Face |
| microsoft/Phi-3-mini-4k-instruct | 3,82B | 4K tokens | MIT | Hugging Face |
| microsoft/Phi-3-mini-128k-instruct | 3,82B | 128K tokens | MIT | Hugging Face |
| JobSched/Phi-3-custom-v2 (modelo base) | No disponible | No disponible | other | Hugging Face |

No se dispone de datos de rendimiento comparativo (benchmarks) para este modelo, por lo que la comparativa se limita a parámetros, contexto, licencia y disponibilidad. El modelo base Phi-3-mini de Microsoft tiene licencia MIT y contextos de 4K o 128K según variante, mientras que este fine-tuning declara licencia "other" sin detallar condiciones.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; al ser un fine-tuning de Phi-3, hereda los sesgos del modelo base, pero no se han documentado evaluaciones al respecto.
- Riesgo de alucinación: presente como en cualquier modelo generativo de 3.8B parámetros; no se han publicado evaluaciones de fidelidad.
- Limitaciones de contexto o idioma: la longitud de contexto no está especificada; los idiomas soportados no están documentados.
- Restricciones de licencia: la licencia es "other", sin texto legal detallado en la información disponible; es imprescindible revisar los términos antes de uso comercial. El modelo base Phi-3 de Microsoft usa licencia MIT, pero este fine-tuning declara otra licencia.
- Caveat para producción: el modelo tiene 0 descargas y 0 likes, fue creado y actualizado el mismo día (2026-11-04), y no cuenta con benchmarks ni documentación de entrenamiento; no se recomienda para producción sin una evaluación propia exhaustiva.
- El modelo se entrenó con AutoTrain y PEFT, lo que puede implicar que los pesos publicados sean un adaptador o un modelo fusionado; no se especifica en la model card.
- No se han publicado datos sobre el dataset de entrenamiento, lo que impide evaluar posibles sesgos o contaminación de datos.

## Enlaces

- Hugging Face: https://huggingface.co/JobSched/Phi-3-custom-trained-v2
- Modelo base: https://huggingface.co/JobSched/Phi-3-custom-v2
- Documentación de AutoTrain: https://hf.co/docs/autotrain
- Documentación de text-generation-inference: no disponible en la información proporcionada
- Paper de Phi-3: no disponible en la información proporcionada
- Repositorio o demo: no disponible en la información proporcionada
