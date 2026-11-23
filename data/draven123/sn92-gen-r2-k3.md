# draven123/sn92-gen-r2-k3

## Resumen

`draven123/sn92-gen-r2-k3` es un modelo multimodal de tipo image-text-to-text publicado por el usuario draven123 en Hugging Face, con arquitectura basada en la familia Gemma 4 (según el tag `gemma4`) y un total de 31.273.088.876 parámetros (~31,3 mil millones) en formato safetensors. El repositorio ocupa 62,6 GB, lo que es coherente con pesos en precisión de 16 bits para ese número de parámetros. El acceso está restringido (gated): es necesario aceptar condiciones en Hugging Face antes de poder descargarlo.

El modelo está etiquetado como `reax` y `bittensor-sn92`, lo que lo vincula al ecosistema de la subred 92 de Bittensor (Reax), una red orientada a tareas de cómputo e IA distribuida. Esto sugiere que se trata de un checkpoint entrenado o ajustado en el contexto de esa subred, probablemente para tareas de generación multimodal dentro de un pipeline de agentes o de minería/validación. La ficha se limita a los datos verificables del repositorio: no hay información publicada sobre composición del dataset, proceso de entrenamiento ni resultados de evaluación.

La relevancia actual del modelo es limitada pero concreta: es un checkpoint multimodal de ~31B con licencia Apache 2.0 (permisiva para uso comercial) y compatible con `transformers` y endpoints, lo que facilita su despliegue. Sin embargo, la ausencia de documentación técnica, benchmarks y descripciones de uso hace que deba tratarse con cautela en producción hasta validarlo empíricamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal image-text-to-text (familia Gemma 4, según tag `gemma4`); detalles internos no disponibles |
| Parametros totales | 31.273.088.876 (~31,3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline | image-text-to-text |
| Libreria | transformers |
| Tamano del repo | 62,6 GB |
| Acceso | Restringido (gated) |

## Arquitectura y entrenamiento

El tag `gemma4` indica que el modelo parte de la arquitectura Gemma 4 de Google, un transformer decoder-only adaptado para entrada multimodal (imagen y texto). El pipeline declarado es `image-text-to-text`, lo que implica un codificador visual acoplado a un modelo de lenguaje que genera texto condicionado por imágenes. No se dispone de información sobre el número de capas, dimensiones ocultas, mecanismo de atención, tipo de tokenizador ni del componente visual concreto.

Respecto al entrenamiento, no hay datos publicados: se desconoce el volumen de tokens, la composición del dataset, si hubo fases de SFT, RLHF o DPO, ni el procedimiento de alineación. El vínculo con Bittensor SN92 (Reax) sugiere un ajuste orientado a tareas específicas de esa subred, pero no se documenta en la model card. Tampoco se describen innovaciones técnicas como decodificación especulativa, atención lineal o modos de razonamiento explícito.

## Capacidades

- Generación de texto condicionada por imágenes (image-text-to-text): descripción, respuesta a preguntas visuales y conversación multimodal.
- Conversación multi-turno (tag `conversational`), aunque sin contexto documentado.
- Procesamiento de imágenes junto con instrucciones en lenguaje natural.
- Compatibilidad con `transformers` y con endpoints compatibles (tag `endpoints_compatible`).
- Tool calling / function calling: no disponible en la información.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no disponibles (idiomas no declarados).
- Capacidades especiales (thinking mode, audio, visión extendida): no documentadas.

## Casos de uso

- Descripción automática de imágenes en catálogos: el modelo puede recibir una imagen de producto y generar descripciones textuales estructuradas para fichas de e-commerce, aprovechando su naturaleza image-text-to-text.
- Respuesta a preguntas sobre documentos escaneados: útil para extraer información de facturas, formularios o capturas, siempre que se valide empíricamente la calidad de OCR implícita.
- Moderación de contenido visual asistida: generar descripciones y clasificaciones textuales de imágenes para revisión humana posterior en pipelines de confianza y seguridad.
- Asistencia en accesibilidad: convertir imágenes en descripciones textuales para lectores de pantalla, con revisión humana dado el riesgo de alucinación.
- Prototipado de agentes multimodales en Bittensor SN92: usar el checkpoint como base para miners o validadores que requieran entrada visual y salida conversacional dentro de esa subred.
- Investigación sobre ajuste multimodal: servir como punto de partida (fine-tuning) para experimentos con Gemma 4 en tareas visuales específicas, gracias a la licencia Apache 2.0.
- Generación de informes a partir de capturas o gráficos: interpretar figuras y producir resúmenes textuales en herramientas de análisis, con validación de resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 62-65 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda al menos 80 GB para comodidad.
- VRAM estimada en cuantización de 8 bits: ~32-35 GB; en 4 bits: ~16-18 GB (estimaciones teóricas, no verificadas con este checkpoint).
- GPU recomendadas: A100 80 GB, H100 80 GB, H200 o múltiples GPU de 24-48 GB con paralelismo de tensor.
- Consumer GPU: no cabe en una RTX 4090 (24 GB) en FP16; podría caber en 4 bits con cuantización manual, aunque no hay GGUF publicado.
- Opciones de despliegue: `transformers` (soporte nativo declarado), endpoints compatibles; vLLM, TGI, llama.cpp u Ollama no están confirmados para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Acceso |
|---|---|---|---|---|---|
| draven123/sn92-gen-r2-k3 | ~31,3B | no disponible | Sí (image-text-to-text) | Apache 2.0 | Gated |
| Gemma 3 27B (referencia de familia) | 27B | 128K (según documentación pública de Gemma 3) | Sí | Gemma Terms | Abierto |
| Qwen2.5-VL 32B (referencia) | ~32B | 128K (según documentación pública) | Sí | Apache 2.0 | Abierto |
| Llama 3.2 90B Vision (referencia) | 90B | 128K (según documentación pública) | Sí | Llama License | Gated |

La comparativa se ofrece solo como referencia de categoría; no hay datos de rendimiento de este checkpoint que permitan una comparación cuantitativa. Los datos de los modelos alternativos provienen de su documentación pública y no de la información proporcionada para este modelo.

## Limitaciones y advertencias

- Ausencia total de model card técnica: no hay información sobre dataset, entrenamiento, evaluación ni uso previsto.
- Riesgo elevado de alucinación visual y textual al no existir validación publicada.
- Idiomas soportados no declarados; el rendimiento multilingüe es desconocido.
- Longitud de contexto no documentada, lo que impide planificar conversaciones largas o documentos extensos.
- Acceso restringido (gated): requiere aceptar condiciones, lo que puede complicar la automatización de descargas en CI/CD.
- Sin cuantizaciones publicadas (GGUF, AWQ, GPTQ), el despliegue en hardware consumer requiere trabajo adicional.
- El vínculo con Bittensor SN92 implica posibles condiciones de uso específicas de la subred que no se detallan en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero la falta de documentación sobre procedencia de datos y posibles sesgos hace recomendable una auditoría previa.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/draven123/sn92-gen-r2-k3
- Repositorio de Gemma (familia base referenciada): https://github.com/google-deepmind/gemma
- Bittensor (ecosistema SN92): https://bittensor.com
- Documentación de `transformers`: https://huggingface.co/docs/transformers
