# darcyyao/qwen3-4b-d1-dpo

## Resumen
qwen3-4b-d1-dpo es un ajuste fino (fine-tuning) del modelo darcyyao/qwen3-4b-s1-sft, que a su vez deriva de la familia Qwen3 de Alibaba. Lo desarrolla el usuario independiente darcyyao y se publica bajo licencia Apache 2.0. El modelo resuelve la tarea de generación de texto conversacional en inglés, incorporando una etapa de DPO (Direct Preference Optimization) sobre un SFT previo, lo que sugiere un alineamiento hacia respuestas preferidas por humanos. Con 4.022.468.096 parámetros totales (aproximadamente 4 mil millones), se posiciona en el segmento de modelos pequeños, aptos para despliegue en hardware de consumo.

La relevancia de esta ficha es doble: por un lado, documenta un modelo comunitario de la familia Qwen3 con un pipeline de entrenamiento en dos fases (SFT y luego DPO), lo que lo hace interesante para quienes estudian alineamiento a pequeña escala; por otro, su tamaño y licencia permisiva lo convierten en candidato para prototipado local. No obstante, la información publicada por el autor es mínima y no se han divulgado resultados de benchmarks ni detalles del dataset de preferencias.

La model card es escueta: solo indica el modelo base, la licencia, el idioma (inglés) y que el entrenamiento se realizó con Unsloth y TRL de Hugging Face, con una aceleración declarada de 2x. No se especifican la longitud de contexto, los tipos de cuantización ni la composición de los datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3; detalles no disponibles) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE según el tamaño) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; se puede cuantizar con herramientas estándar) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo es un transformer decoder-only de la familia Qwen3, con 4.022.468.096 parámetros totales según los tensores en safetensors. La model card no detalla la arquitectura interna (número de capas, dimensión oculta, mecanismo de atención, uso de RoPE, etc.), por lo que esos datos no están disponibles. Tampoco se indica si emplea alguna innovación como atención lineal, decodificación especulativa o mezcla de expertos; el recuento de parámetros sugiere una arquitectura densa.

El entrenamiento se realizó en dos etapas: primero un ajuste supervisado (SFT) que dio lugar a darcyyao/qwen3-4b-s1-sft, y después una etapa de DPO sobre ese checkpoint, que produce este modelo. El autor declara el uso de Unsloth y de la librería TRL de Hugging Face, con una aceleración de 2x en el entrenamiento. No se especifica el número de tokens de entrenamiento, la composición del dataset de preferencias, ni si hubo otras técnicas de alineamiento (RLHF, PPO) adicionales. Tampoco se documentan hiperparámetros como la tasa de aprendizaje, el valor de beta en DPO o el número de épocas.

## Capacidades
- Generación de texto conversacional en inglés, orientada a respuestas alineadas mediante DPO.
- Razonamiento y respuesta a instrucciones heredadas del modelo base Qwen3-4B (capacidades específicas no verificadas en la model card).
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma declarada.
- Capacidades especiales (modo thinking, visión, audio): no documentadas.

## Casos de uso
- Prototipado de asistentes conversacionales en inglés: el modelo puede mantener diálogos multi-turno y generar respuestas alineadas gracias a la etapa de DPO, adecuado para pruebas de concepto en local con 4B parámetros.
- Evaluación de pipelines de alineamiento: sirve como caso de estudio para comparar un SFT frente a un SFT+DPO en el mismo modelo base, útil en investigación sobre preferencias.
- Generación de texto en entornos con recursos limitados: al ser un modelo de 4B, puede ejecutarse en GPUs de consumo con cuantización, lo que permite desplegar demos sin infraestructura dedicada.
- Experimentos de ajuste fino adicional: al estar publicado en safetensors y con licencia Apache 2.0, se puede usar como punto de partida para fine-tuning con LoRA o QLoRA sobre dominios específicos.
- Chatbots de soporte interno en inglés: para preguntas frecuentes y respuestas guionizadas, siempre con validación humana por el riesgo de alucinación.
- Base para comparativas académicas de modelos pequeños: útil para medir el efecto del DPO en tareas de instrucción a escala de 4B parámetros.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia en FP16/BF16: aproximadamente 8 GB solo para pesos, más overhead de activaciones y caché KV (estimación orientativa; el modelo ocupa 8,1 GB en el repositorio).
- VRAM estimada en cuantización de 8 bits: alrededor de 4-5 GB; en 4 bits: alrededor de 2,5-3,5 GB (estimaciones orientativas, no publicadas por el autor).
- GPU recomendadas: A100 o H100 para despliegue en FP16 con lotes grandes; RTX 4090, RTX 3090 o RTX 4080 para FP16 en lote pequeño; GPUs con 8 GB o más para cuantización de 8 bits.
- Cabe en GPU de consumo: sí, en tarjetas con al menos 8 GB en FP16 y en tarjetas con 6-8 GB usando cuantización de 4 u 8 bits.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM, llama.cpp y Ollama (estos dos últimos requieren conversión a GGUF, no incluida en el repositorio).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| darcyyao/qwen3-4b-d1-dpo | 4.022.468.096 | no disponible | apache-2.0 | Hugging Face |
| Qwen3-4B (base oficial) | ~4B | no disponible en esta ficha | apache-2.0 (según familia Qwen3) | Hugging Face |
| darcyyao/qwen3-4b-s1-sft | no disponible | no disponible | apache-2.0 | Hugging Face |
| Llama 3.2 3B Instruct | ~3B | 128k (según documentación de Meta) | Llama 3.2 Community License | Hugging Face |

La comparación se limita a parámetros y licencia porque no hay benchmarks publicados para este modelo. Frente al Qwen3-4B oficial, este ajuste añade una etapa de DPO pero no documenta mejoras medibles. Frente a Llama 3.2 3B Instruct, la licencia Apache 2.0 es más permisiva para uso comercial, aunque el soporte de idiomas es solo inglés y el contexto no está documentado.

## Limitaciones y advertencias
- Sesgos conocidos: no documentados; al entrenarse solo en inglés, puede reflejar sesgos culturales y lingüísticos de ese idioma.
- Riesgo de alucinación: presente como en cualquier modelo de 4B; la etapa de DPO no elimina las respuestas inventadas, y no hay evaluaciones publicadas que lo cuantifiquen.
- Limitaciones de contexto e idioma: solo se declara inglés; la longitud de contexto no está especificada, lo que impide planificar cargas de trabajo con ventanas largas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las obligaciones de atribución y las licencias del modelo base Qwen3.
- Caveats para producción: sin benchmarks, sin datos de entrenamiento y sin documentación de tool calling, no se recomienda su uso en producción sin una evaluación propia exhaustiva. El repositorio tiene 0 descargas y 0 likes, lo que indica ausencia de validación por la comunidad.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/darcyyao/qwen3-4b-d1-dpo
- Modelo base SFT: https://huggingface.co/darcyyao/qwen3-4b-s1-sft
- Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
- TRL de Hugging Face: https://github.com/huggingface/trl
