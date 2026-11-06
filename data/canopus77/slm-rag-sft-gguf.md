# canopus77/slm-rag-sft-gguf

## Resumen

slm-rag-sft-gguf es la versión en formato GGUF de un modelo de lenguaje de pequeño tamaño (SLM) afinado por el usuario canopus77. Deriva del checkpoint slm-rag-sft-merged, un fine-tuning orientado a tareas de generación aumentada por recuperación (RAG) y conversación, que fue entrenado y convertido a GGUF mediante Unsloth. El modelo cuenta con 3.212.749.888 parámetros (aproximadamente 3,2 mil millones) y un tamaño de repositorio de 2,0 GB, lo que lo sitúa en la franja de modelos ligeros desplegables en hardware de consumo.

La relevancia de esta ficha es acotada: se trata de un modelo publicado por un autor individual, sin model card detallada, sin licencia declarada y sin resultados de benchmarks publicados. No obstante, su tamaño y su empaquetado en GGUF lo hacen directamente utilizable con llama.cpp, lo que permite evaluarlo localmente con coste mínimo. La información disponible procede casi exclusivamente de la model card del autor y de agregadores de terceros.

El contexto declarado por LLM Explorer es de 128K tokens, dato que no aparece confirmado en la model card oficial ni en los metadatos de Hugging Face, por lo que debe tratarse con cautela. El nombre del modelo sugiere un ajuste fino supervisado (SFT) sobre un modelo base no identificado, especializado en respuestas condicionadas a contexto recuperado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Llama, según tags y herramientas de conversión); detalles no disponibles |
| Parametros totales | 3.212.749.888 (~3,2B) |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | 128K según LLM Explorer; no confirmado en la model card |
| Tipos de cuantizacion | Q4_K_M (único archivo publicado: `slm-rag-sft-merged.Q4_K_M.gguf`) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF (llama.cpp); el checkpoint base slm-rag-sft-merged se distribuye por separado |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de su pertenencia a la familia Llama (según los tags `llama` y `llama.cpp`). El modelo es un fine-tuning del checkpoint slm-rag-sft-merged, entrenado con Unsloth, herramienta que el autor declara haber utilizado para acelerar el entrenamiento aproximadamente 2x. El sufijo "sft" indica ajuste fino supervisado, y "rag" sugiere que los datos de entrenamiento incluyen pares de contexto recuperado y respuesta, orientados a tareas de question answering sobre documentos.

No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO. La model card menciona únicamente un ajuste del comportamiento del token BOS para garantizar la compatibilidad con GGUF. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional: el tag `conversational` y el pipeline asociado indican uso previsto para diálogo multi-turno.
- Respuesta condicionada a contexto (RAG): el nombre del modelo sugiere entrenamiento específico para responder preguntas a partir de documentos recuperados.
- Compatibilidad con plantillas de chat vía `--jinja` en llama.cpp, lo que permite aplicar el chat template del modelo.
- Soporte potencial de entrada multimodal: la model card incluye el comando `llama-mtmd-cli` para modelos multimodales, aunque no se confirma que este checkpoint concreto procese imágenes.
- Capacidades de tool calling, agentes, matemáticas o código: no disponibles en la información proporcionada.

## Casos de uso

- Asistente de documentación interna: el modelo puede recibir fragmentos de manuales o wikis corporativas como contexto y generar respuestas extractivas o sintetizadas, aprovechando su ajuste orientado a RAG y su ventana de contexto amplia (si se confirma el dato de 128K).
- Chatbot de atención al cliente de bajo coste: con 3,2B parámetros y cuantización Q4_K_M, puede desplegarse en una única GPU de consumo para gestionar conversaciones multi-turno con latencia baja.
- Prototipado rápido de pipelines RAG: al estar en GGUF, se integra directamente con llama.cpp y permite validar la cadena recuperación-generación antes de invertir en modelos mayores.
- Procesamiento por lotes en CPU: el tamaño de 2,0 GB del archivo Q4_K_M permite ejecutar inferencia en servidores sin GPU para tareas de resumen o extracción de información no críticas.
- Evaluación comparativa de fine-tunes comunitarios: sirve como referencia para medir la calidad de ajustes SFT de modelos de ~3B en tareas de QA sobre contexto.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse localmente con llama.cpp, los datos no salen del perímetro del usuario, lo que encaja en casos con información sensible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3 GB con la cuantización Q4_K_M publicada (archivo de 2,0 GB más overhead de contexto y caché KV).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para Q4_K_M; RTX 3060, RTX 4060, RTX 4090 o superiores ofrecen margen amplio. En A100/H100 el modelo queda limitado por ancho de banda, no por memoria.
- Cabe en GPU de consumo: sí, en modelos con 6 GB o más de VRAM; también puede ejecutarse en CPU con llama.cpp, con throughput menor.
- Opciones de despliegue: llama.cpp (`llama-cli -hf canopus77/slm-rag-sft-gguf --jinja`), y por extensión cualquier frontend compatible con GGUF (Ollama, LM Studio, llama-cpp-python). vLLM y TGI requerirían convertir los pesos a safetensors.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| slm-rag-sft-gguf | ~3,2B | 128K (no confirmado) | No disponible | GGUF | Fine-tune comunitario orientado a RAG; sin benchmarks |
| Llama 3.2 3B Instruct | 3,2B | 128K | Llama 3.2 Community License | Safetensors, GGUF | Modelo base de referencia de Meta; benchmarks públicos |
| Qwen2.5 3B Instruct | 3,1B | 32K | Apache 2.0 | Safetensors, GGUF | Alternativa abierta con soporte multilingüe documentado |
| Phi-3.5-mini Instruct | 3,8B | 128K | MIT | Safetensors, GGUF | Orientado a razonamiento y código; benchmarks publicados |

La comparación es orientativa: no se dispone de datos de rendimiento del modelo evaluado, por lo que la elección frente a estas alternativas debe basarse en pruebas propias sobre el dominio objetivo.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada sobre calidad, por lo que su rendimiento real es desconocido.
- Licencia no declarada: no se puede asumir permiso para uso comercial; es necesario contactar con el autor antes de integrarlo en producción.
- Idiomas no especificados: se desconoce si el ajuste SFT conserva capacidades multilingües del modelo base o si está sesgado hacia el inglés.
- Riesgo de alucinación: como todo SLM de ~3B sin evaluación publicada, la fiabilidad factual en tareas abiertas es incierta; en RAG conviene exigir citación del contexto.
- Contexto no confirmado: el dato de 128K proviene de un agregador de terceros y no de la model card; verificar empíricamente antes de diseñar pipelines que dependan de ventanas largas.
- Modelo de autor individual con 0 descargas y 0 likes: sin comunidad que valide su comportamiento ni mantenimiento garantizado.
- Único archivo disponible en Q4_K_M: no hay variantes de mayor precisión (Q8, F16) ni safetensors en este repositorio, lo que limita la evaluación de la pérdida por cuantización.
- Ajuste del token BOS respecto al modelo original: puede provocar diferencias de comportamiento frente al checkpoint base si se comparan directamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/canopus77/slm-rag-sft-gguf
- Checkpoint base: https://huggingface.co/canopus77/slm-rag-sft-merged
- Ficha en LLM Explorer: https://llm-explorer.com/model/canopus77%2Fslm-rag-sft-merged,17oiZjaP2aeCZLoYetatSM
- Fine-tunes del modelo base: https://huggingface.co/models?other=base_model%3Afinetune%3Acanopus77%2Fslm-rag-sft-merged
- Unsloth (herramienta de entrenamiento y conversión): https://github.com/unslothai/unsloth
