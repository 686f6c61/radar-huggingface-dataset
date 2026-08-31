# 12B-Suite/Mtreelva-Dune-12B-Q8_0-GGUF

## Resumen

Mtreelva-Dune-12B-Q8_0-GGUF es una cuantización en formato GGUF (Q8_0) del modelo Mtreelva-Dune-12B, desarrollado por el equipo 12B-Suite. Se trata de un modelo de generación de texto basado en la arquitectura Gemma 4 (según las etiquetas del repositorio), orientado a tareas conversacionales, roleplay, asistencia personal, generación de código y razonamiento agéntico. El modelo está pensado para su uso en entornos de inferencia local con herramientas como llama.cpp, Ollama o vLLM, gracias a su formato GGUF.

El modelo destaca por su soporte multilingüe que incluye inglés, indonesio, árabe, francés y darija marroquí, lo que lo hace especialmente relevante para aplicaciones en regiones de habla árabe y del sudeste asiático. Al ser un merge (probablemente realizado con mergekit), combina capacidades de varios modelos base, aunque no se han publicado detalles técnicos sobre la composición exacta del merge ni sobre los datos de entrenamiento. Su licencia Apache 2.0 permite uso comercial sin restricciones significativas, lo que facilita su adopción en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4 (probablemente transformer decoder) |
| Parametros totales | 12B (aproximado, no confirmado) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (GGUF) |
| Idiomas soportados | en, id, ar, fr, ary |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q8_0) |

## Arquitectura y entrenamiento

La información disponible no especifica la arquitectura interna del modelo base Mtreelva-Dune-12B. Las etiquetas indican que se trata de un merge realizado con mergekit, lo que sugiere que combina pesos de varios modelos preentrenados (posiblemente variantes de Gemma 4 y otros modelos de 12B). No se han publicado detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El modelo se distribuye únicamente en formato GGUF cuantizado a Q8_0, lo que implica una pérdida mínima de precisión respecto a los pesos originales en safetensors.

## Capacidades

- Generación de texto conversacional y roleplay: el modelo está etiquetado como "conversational" y "roleplay", lo que indica que está optimizado para mantener diálogos naturales y simular personajes.
- Soporte de razonamiento y tareas agénticas: las etiquetas "reasoning" y "agentic" sugieren capacidad para razonamiento multi-paso y uso en flujos de agente.
- Generación de código: la etiqueta "coding" indica que puede asistir en tareas de programación.
- Multilingüismo: soporta inglés, indonesio, árabe, francés y darija marroquí, lo que lo hace útil para aplicaciones en esas regiones.
- Compatibilidad con herramientas de inferencia local: al ser GGUF, es compatible con llama.cpp, Ollama, LM Studio y otros motores que soporten este formato.

## Casos de uso

- Asistente conversacional multilingüe: el modelo puede desplegarse en aplicaciones de chat para usuarios que hablan darija, árabe o indonesio, gracias a su soporte de estos idiomas. Su formato GGUF permite ejecutarlo en servidores modestos o incluso en equipos de escritorio.
- Roleplay y juegos de texto: su orientación a roleplay lo hace adecuado para plataformas de ficción interactiva o juegos de aventura textual donde se requiere mantener coherencia de personaje a lo largo de múltiples turnos.
- Generación de código en entornos locales: puede integrarse en editores de código o pipelines de CI/CD como asistente de programación, aunque no se han publicado benchmarks específicos de HumanEval.
- Agente de automatización de tareas: gracias a su etiqueta "agentic", puede utilizarse como motor de razonamiento en sistemas que requieran planificación y ejecución de pasos (por ejemplo, orquestación de APIs).
- Traducción y transcripción informal: su capacidad multilingüe permite su uso en herramientas de traducción automática para pares de idiomas como árabe-francés o indonesio-inglés, aunque no se ha evaluado formalmente su calidad.
- Chatbot de atención al cliente en regiones específicas: empresas con clientes en Marruecos o Indonesia pueden desplegar este modelo para atender consultas en darija o indonesio, reduciendo costes frente a APIs comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar para este modelo. Tampoco se han comparado sus capacidades con modelos similares de forma cuantitativa.

## Requisitos de hardware

- VRAM estimada: un modelo de 12B en Q8_0 ocupa aproximadamente 12-13 GB de memoria. Se recomienda al menos 16 GB de VRAM para inferencia cómoda con contexto moderado.
- GPU recomendadas: RTX 4090 (24 GB), RTX 4080 (16 GB), A100 (40 GB) o H100 (80 GB) para mayor velocidad. En GPUs con 8 GB (como RTX 3070) podría ejecutarse con contexto reducido y mayor latencia.
- Compatibilidad con consumer GPU: sí, siempre que se disponga de suficiente VRAM. Con cuantizaciones más bajas (Q4_K_M, Q5_K_M) podría caber en GPUs de 8-10 GB, pero esta versión es Q8_0.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, vLLM (con adaptador GGUF), text-generation-webui.
- Latencia y throughput: no disponible. Depende del hardware y del backend utilizado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Idiomas |
|---|---|---|---|---|---|
| Mtreelva-Dune-12B-Q8_0-GGUF | 12B | no disponible | Apache 2.0 | GGUF | en, id, ar, fr, ary |
| Mistral-Nemo-12B-Instruct (nvidia) | 12B | 128k | Apache 2.0 | safetensors, GGUF | multilingüe (incluye árabe, francés, etc.) |
| Mistral-Nemo-12B-Instruct-GGUF (mradermacher) | 12B | 128k | Apache 2.0 | GGUF | multilingüe |

Mistral-Nemo-12B-Instruct es un modelo comparable en tamaño y licencia, con un contexto documentado de 128k tokens y soporte multilingüe amplio. Mtreelva-Dune-12B no tiene datos públicos de contexto ni benchmarks, por lo que no se puede establecer una comparación cuantitativa fiable. La ventaja de Mtreelva-Dune podría residir en su especialización en darija e indonesio, aunque no hay evidencia publicada.

## Limitaciones y advertencias

- No se han publicado detalles sobre el proceso de entrenamiento ni sobre los datos utilizados, por lo que se desconocen posibles sesgos o alucinaciones específicas.
- La longitud de contexto no está documentada; es probable que herede la del modelo base Gemma 4 (típicamente 8k o 128k según la variante), pero no se puede confirmar.
- Al ser un merge sin documentación técnica, su comportamiento en tareas de razonamiento complejo o generación de código puede ser inconsistente.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar la licencia de Gemma 4 (enlazada en el README) para asegurar el cumplimiento de sus términos adicionales.
- No hay garantía de soporte o mantenimiento por parte del autor; el repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un modelo reciente y poco probado.
- El formato GGUF Q8_0 requiere al menos 12-13 GB de VRAM, lo que excluye GPUs de gama baja.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/12B-Suite/Mtreelva-Dune-12B-Q8_0-GGUF
- Modelo base (safetensors): https://huggingface.co/12B-Suite/Mtreelva-Dune-12B
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Modelo comparable (Mistral-Nemo-12B-Instruct): https://huggingface.co/nvidia/Mistral-NeMo-12B-Instruct
- Cuantización GGUF de Mistral-Nemo: https://huggingface.co/mradermacher/Mistral-Nemo-12B-Instruct-GGUF
- Página de descubrimiento de modelos GGUF: https://local-ai-zone.github.io/
