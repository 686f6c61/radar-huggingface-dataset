# MangMaster/Qwen3.5-4B-uncensored-MNN

## Resumen

MangMaster/Qwen3.5-4B-uncensored-MNN es una exportación en formato MNN (Alibaba Mobile Neural Network) del modelo huihui-ai/Huihui-Qwen3.5-4B-abliterated, que a su vez deriva del Qwen/Qwen3.5-4B de Alibaba. El modelo base ha sido sometido a una técnica de "abliteration" (eliminación del comportamiento de rechazo mediante proyección ortogonal, técnica FailSpy) y posteriormente convertido y cuantizado a 4 bits por darkmaniac7 para su ejecución en dispositivos móviles. El repositorio lo publica MangMaster en el contexto de TokForge, una aplicación Android de chat con IA que funciona de forma offline.

La relevancia de esta ficha es doble: por un lado ilustra el ecosistema de modelos "uncensored" orientados a roleplay y ficción creativa; por otro, es un ejemplo de pipeline de despliegue on-device, ya que el artefacto no es un release estándar de Transformers sino un grafo MNN más pesos cuantizados pensados para inferencia en CPU/GPU de móvil. El modelo tiene 4B parámetros, usa una arquitectura Qwen3.5 con LinearAttention y se distribuye bajo licencia Apache-2.0.

Conviene subrayar que este repositorio es un artefacto de runtime/exportación, no un modelo entrenado desde cero: todas las capacidades lingüísticas provienen de Qwen3.5-4B, la eliminación de rechazos de huihui-ai y la conversión de formato de MangMaster/darkmaniac7. No hay métricas de rendimiento publicadas en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 con LinearAttention |
| Parametros totales | 4B |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit con block size 128 |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | MNN (llm.mnn, llm.mnn.weight); incluye config.json de Hugging Face para metadatos |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3.5-4B de Alibaba, descrito en la model card como una arquitectura Qwen3.5 basada en LinearAttention, lo que implica un mecanismo de atención distinto al de los transformers clásicos y que, según el autor, hace que el comportamiento del backend difiera del Qwen3 clásico. Sobre esa base, huihui-ai aplicó abliteration mediante proyección ortogonal (técnica FailSpy) para eliminar el comportamiento de rechazo; no se detallan en la información disponible los datos de entrenamiento, el número de tokens, la composición del dataset ni si hubo etapas de RLHF o DPO en el modelo original.

La aportación específica de este repositorio es la conversión a MNN con cuantización de 4 bits (block size 128) realizada por darkmaniac7, usando la herramienta llmexport de MNN (Alibaba, Apache-2.0). El resultado es un grafo de 3,5 MB (`llm.mnn`), pesos cuantizados de 2,3 GB (`llm.mnn.weight`), configuración de 8 KB y vocabulario de tokenizer de 2,9 MB. No se documentan innovaciones adicionales como decodificación especulativa ni detalles sobre el proceso de alineación del modelo base.

## Capacidades

- Generación de texto en inglés, orientada a roleplay, ficción creativa y contenido para adultos sin rechazos por parte del modelo.
- Conversación multi-turno en el contexto de una app de chat (TokForge).
- Inferencia on-device en Android, con enrutado automático a CPU para LinearAttention según la model card.
- No se documenta soporte explícito de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad de visión, audio ni modo "thinking".
- Capacidades multilingües limitadas al inglés según el campo `language: en`.

## Casos de uso

- Roleplay y ficción creativa en móvil: el modelo está pensado para ejecutarse dentro de la app TokForge en Android, de forma offline, gestionando conversaciones narrativas multi-turno sin depender de la nube. Es adecuado porque el artefacto está empaquetado específicamente para MNN y cuantizado a 4 bits para caber en dispositivos móviles.
- Chat privado sin conexión: al ejecutarse en local, las conversaciones no salen del dispositivo, lo que resulta útil para usuarios que quieren privacidad en interacciones sensibles.
- Prototipado de apps móviles de IA: desarrolladores que quieran integrar un LLM de 4B en una app Android pueden usar el runtime MNN y este modelo como referencia de pipeline de cuantización y exportación.
- Experimentación con modelos abliterated: investigadores interesados en medir el efecto de la abliteration sobre el comportamiento de rechazo pueden usar este artefacto como punto de partida, comparándolo con el modelo base sin abliterar.
- Generación de narrativa interactiva: escritores o creadores de contenido pueden usar el modelo para generar tramas ramificadas o diálogos de personajes en local.
- Benchmarking de inferencia móvil: el repositorio sirve para evaluar el rendimiento de MNN con arquitecturas LinearAttention en distintos SoCs, ya que la model card advierte que el rendimiento varía significativamente entre chips y enrutado CPU/GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: los pesos cuantizados ocupan 2,3 GB en disco; se necesita al menos esa cantidad de memoria disponible más overhead del runtime MNN, aunque no se especifica el consumo exacto en ejecución.
- GPU recomendadas: no disponible para escritorio; el modelo está orientado a GPU/CPU de móvil (SoCs Android) con enrutado automático a CPU para LinearAttention.
- ¿Cabe en GPU consumer? El formato MNN no es el habitual para GPUs de escritorio; para ejecución en PC habría que usar el runtime MNN, no vLLM ni llama.cpp con este artefacto.
- Opciones de despliegue: runtime MNN (`llm_demo` o MNN Transformer API), app TokForge en Android (Google Play y TestFlight para iOS). No se documenta soporte para vLLM, TGI, Ollama ni llama.cpp con este formato.
- Latencia y throughput: no disponibles; la model card indica que el rendimiento varía significativamente según el SoC y el enrutado CPU/GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| MangMaster/Qwen3.5-4B-uncensored-MNN | 4B | no disponible | MNN 4-bit | Apache-2.0 | Artefacto on-device para móvil |
| huihui-ai/Huihui-Qwen3.5-4B-abliterated | 4B | no disponible | safetensors (presumible, no confirmado) | Apache-2.0 | Modelo base abliterated, para Transformers |
| Qwen/Qwen3.5-4B | 4B | no disponible | safetensors (presumible, no confirmado) | Apache-2.0 | Modelo original de Alibaba |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El modelo ha sido abliterated, lo que elimina los rechazos; esto implica un riesgo elevado de generar contenido inapropiado, ofensivo o dañino sin filtro. No es adecuado para aplicaciones de cara al público sin moderación adicional.
- Riesgo de alucinación inherente a un modelo de 4B, especialmente en tareas de conocimiento factual.
- Idiomas: solo se declara inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Longitud de contexto no documentada; conviene verificarla en `llm_config.json` antes de usarlo en producción.
- El backend MNN con LinearAttention puede comportarse de forma distinta al Qwen3 clásico, según advierte el autor.
- Es un artefacto de runtime/exportación, no un release estándar de Transformers; la integración requiere el runtime MNN.
- Licencia Apache-2.0 permite uso comercial, pero la responsabilidad sobre el contenido generado y el cumplimiento normativo recaen en el desplegador.
- Sin descargas ni likes en el momento de la consulta; ecosistema y soporte muy limitados.

## Enlaces

- Hugging Face: https://huggingface.co/MangMaster/Qwen3.5-4B-uncensored-MNN
- Modelo base abliterated: https://huggingface.co/huihui-ai/Huihui-Qwen3.5-4B-abliterated
- Modelo original: https://huggingface.co/Qwen/Qwen3.5-4B
- TokForge: https://tokforge.ai
- Discord de TokForge: https://discord.gg/Acv3CBtfVm
- Google Play (TokForge): https://play.google.com/store/apps/details?id=dev.tokforge
- iOS TestFlight (TokForge): https://testflight.apple.com/join/jnufjzRr
- Repositorio MNN: https://github.com/alibaba/MNN
