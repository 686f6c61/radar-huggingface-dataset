# Kausp11/searchlm-dclm_nc-sftnc_v4cannsent_v1_d32_64Bdoc

## Resumen

Search-LLM DCLM-Edu 3.3B SFT es un modelo de lenguaje de texto a texto entrenado por el usuario de Hugging Face Kausp11, publicado en octubre de 2026. Se trata de un modelo de unos 5.500 millones de parámetros (5.539.729.626 según los metadatos de safetensors) derivado de la línea "nanochat", preentrenado con una metodología de "search-enabled pretraining": durante el entrenamiento el modelo aprende a emitir consultas web delimitadas por tokens especiales (`<WEB_QUERY>`, `</WEB_QUERY>`, `<WEB_RESPONSE>`, `</WEB_RESPONSE>`) y a incorporar las respuestas recuperadas en su contexto.

La versión publicada corresponde a una fase de supervised fine-tuning (SFT, versión v4c-ann-sent, 1 época) sobre el checkpoint de preentrenamiento DCLM-Edu. El ajuste combina datos de chat y habilidades de SmolTalk, tool calling de SmolTalk2 y conversaciones de SmolTalk anotadas con bloques de búsqueda generados por el propio pipeline de anotación del preentrenamiento. Su relevancia está en la exploración de modelos pequeños capaces de intercalar búsquedas web durante la generación, una técnica cada vez más habitual para dotar de conocimiento actualizado a modelos compactos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (estilo nanochat; detalles no disponibles) |
| Parametros totales | 5.539.729.626 (~5,54 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en fp/bf16 según safetensors) |
| Idiomas soportados | no disponible (datos de entrenamiento en inglés: SmolTalk, DCLM-Edu) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un LLM decoder-only exportado desde el ecosistema "nanochat", entrenado sobre el corpus DCLM-Edu (una variante educativa del pipeline DCLM). La característica distintiva es el preentrenamiento habilitado para búsqueda: el modelo se entrena con documentos que contienen bloques de consulta y respuesta web marcados con tokens especiales añadidos al tokenizador (base SmolLM2 + `<WEB_QUERY>`, `</WEB_QUERY>`, `<WEB_RESPONSE>`, `</WEB_RESPONSE>`). El nombre del checkpoint sugiere una escala de 64B documentos en el preentrenamiento, aunque la cifra exacta de tokens no está publicada.

La fase SFT publicada (v4c-ann-sent, 1 época) combina tres fuentes: SmolTalk (chat y habilidades), SmolTalk2 (tool calling) y conversaciones de SmolTalk con bloques de búsqueda procedentes del pipeline de anotación del preentrenamiento, insertados al inicio de la frase. El formato de chat es `User: ...\n\nAssistant: ...`. No hay información sobre RLHF/DPO posterior ni sobre técnicas de decodificación especulativa u otras innovaciones de inferencia.

## Capacidades

- Generación de texto conversacional en formato chat (`User: ...\n\nAssistant: ...`).
- Emisión de consultas web estructuradas con tokens `<WEB_QUERY>`/`</WEB_QUERY>` y procesamiento de respuestas `<WEB_RESPONSE>`/`</WEB_RESPONSE>`, lo que permite integrarlo en pipelines de generación aumentada por recuperación.
- Tool calling entrenado con datos de SmolTalk2.
- Seguimiento de instrucciones y habilidades de chat vía SmolTalk.
- No hay evidencia de capacidades multimodales (visión, audio) ni de modo de razonamiento explícito.

## Casos de uso

- Sistemas RAG con consultas generadas por el modelo: puede formular sus propias consultas web y consumir los resultados dentro del contexto, útil para buscadores conversacionales experimentales.
- Asistentes con acceso a información actualizada: al estar entrenado con bloques de búsqueda, es adecuado para agentes que consultan fuentes externas antes de responder.
- Chatbots ligeros autoalojados: con ~5,5 B de parámetros cabe en hardware de consumo, apto para despliegues locales de bajo coste.
- Prototipado de agentes con tool calling: el ajuste con SmolTalk2 permite probar orquestación de herramientas en frameworks tipo LangChain o funciones personalizadas.
- Investigación en preentrenamiento con búsqueda: sirve como base reproducible para estudiar cómo afecta el search-enabled pretraining al comportamiento del modelo.
- Generación de contenido educativo: el corpus DCLM-Edu sugiere orientación hacia dominios educativos y explicativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (bf16/fp16): ~11-12 GB (el repositorio pesa 11,1 GB), más overhead de KV cache.
- Con cuantización a 4 bits (si se aplica, p. ej. vía bitsandbytes o GGUF): ~3-4 GB de VRAM, viable en GPUs de consumo.
- GPUs recomendadas: RTX 3060/4060 de 12 GB o superior para precisión completa; RTX 4090, A100 o H100 para servición con batching y contexto largo.
- Cabe en GPUs consumer modernas de 12-16 GB (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080) en bf16.
- Despliegue: transformers con `AutoModelForCausalLM.from_pretrained(repo, trust_remote_code=True)`; compatibilidad con vLLM, llama.cpp u Ollama no confirmada por el autor (el uso de `custom_code` y tokens especiales puede requerir adaptación).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Search-LLM DCLM-Edu 3.3B SFT | ~5,54 B | no disponible | Apache 2.0 | Preentrenamiento con bloques de búsqueda; tool calling |
| SmolLM2-1.7B-Instruct | 1,7 B | 8.192 tokens | Apache 2.0 | Base del tokenizador; sin search tokens nativos |
| Qwen2.5-7B-Instruct | 7,6 B | 128K tokens | Qwen (uso comercial condicionado) | Rendimiento general superior, sin search-enabled pretraining |

Nota: la comparación es orientativa; no hay benchmarks publicados del modelo de esta ficha para contrastar rendimiento real.

## Limitaciones y advertencias

- Proyecto de investigación individual (254 descargas, sin comunidad activa): madurez y fiabilidad en producción no contrastadas.
- Uso de `trust_remote_code=True` requerido: implica ejecutar código personalizado del repositorio, lo que supone un riesgo de seguridad a revisar antes de desplegar.
- Datos de entrenamiento aparentemente en inglés; rendimiento en castellano no documentado y probablemente limitado.
- Longitud de contexto no publicada: riesgo de desbordamiento en tareas con muchos bloques de búsqueda.
- Los bloques `<WEB_RESPONSE>` provienen de un pipeline de anotación sintético, por lo que el modelo puede alucinar o malinterpretar respuestas web reales si el formato difiere del entrenamiento.
- Licencia Apache 2.0: sin restricciones de uso comercial relevantes.
- Sin benchmarks ni evaluaciones publicadas: se recomienda evaluación interna antes de cualquier uso serio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kausp11/searchlm-dclm_nc-sftnc_v4cannsent_v1_d32_64Bdoc
- Paper, repositorio de código o demo: no disponible
