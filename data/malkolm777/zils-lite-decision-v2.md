# malkolm777/zils-lite-decision-v2

## Resumen

zils-lite-decision-v2 es un modelo de decisión de tipo "lite" publicado por el usuario malkolm777 en Hugging Face. Se trata de un ajuste fino (fine-tune) del modelo base Maincode/Matilda-Decision-v1-Edge, que a su vez pertenece a la familia Qwen/Qwen3.5-0.8B según la model card. El modelo está pensado para su uso en la "lite pool" de la subred 127 de Zils, una plataforma que entrena modelos pequeños para que las aplicaciones clasifiquen peticiones, marquen problemas o puntúen coincidencias a partir de ejemplos etiquetados.

Con aproximadamente 853 millones de parámetros (852.985.920 según los pesos en safetensors) y un tamaño de repositorio de 1,7 GB, es un modelo compacto orientado a la extracción de características (pipeline `feature-extraction`) más que a la generación de texto libre. Su relevancia radica en que ejemplifica el patrón de modelos de decisión especializados: un cuerpo base pequeño, ajustado con LoRA sobre datos de resultados etiquetados de fuentes públicas, que puede desplegarse en entornos con recursos limitados.

La información pública disponible es escasa: cero descargas, cero "likes" en el momento de la consulta, sin idiomas declarados y sin resultados de benchmarks. Esta ficha se limita a lo documentado en la model card, los metadatos de Hugging Face y la información del sitio web de Zils.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen/Qwen3.5-0.8B, según model card); etiqueta `qwen3_5` con `custom_code` |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (el campo de idiomas no está declarado) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | Maincode/Matilda-Decision-v1-Edge |
| Pipeline | feature-extraction |
| Tamaño del repositorio | 1,7 GB |

## Arquitectura y entrenamiento

El modelo se describe como un "cuerpo de decisión d3-lite" de la familia Qwen/Qwen3.5-0.8B, ajustado a partir del modelo base Maincode/Matilda-Decision-v1-Edge (Apache-2.0). El entrenamiento consistió en dos rondas de LoRA con rango 16 sobre elementos de decisión procedentes de fuentes públicas con resultados etiquetados, recopiladas con `zils.current`: reversiones de Wikipedia, anuncios de categorías de arXiv, fusiones de Gerrit, Stack Exchange y procesos AfC/AfD de Wikipedia. Posteriormente, el delta del ajuste fino se escaló por un factor de 2.

La arquitectura subyacente es un transformer de la familia Qwen3.5, aunque el repositorio incluye `custom_code`, lo que implica que la carga requiere confiar en código personalizado del autor (`trust_remote_code`). No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo etapas de RLHF o DPO. La innovación técnica destacable es el uso de LoRA de rango 16 con escalado del delta, una técnica que amplifica la contribución del ajuste fino sobre el cuerpo base sin reentrenar todos los parámetros.

## Capacidades

- Extracción de características y puntuación de decisiones: el pipeline declarado es `feature-extraction`, orientado a clasificar, ordenar o puntuar elementos según ejemplos etiquetados.
- Clasificación de peticiones y marcado de problemas, según el caso de uso descrito por la plataforma Zils.
- Puntuación de coincidencias (scoring de matches) entre elementos.
- Aprendizaje a partir de ejemplos con la respuesta correcta ("Teach AI to make decisions your way", según Zils).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni modo "thinking".
- No se documentan capacidades multilingües, de visión ni de audio.
- No se documenta generación de texto libre; el uso previsto es de decisión/clasificación.

## Casos de uso

- Moderación de contribuciones en wikis: el modelo se entrenó con reversiones de Wikipedia, por lo que puede puntuar ediciones y señalar las que probablemente serán revertidas, integrándose en flujos de revisión de cambios.
- Triaje de anuncios científicos: entrenado con anuncios de categorías de arXiv, puede clasificar o priorizar envíos según su adecuación a una categoría, útil en sistemas de gestión editorial.
- Revisión de cambios de código en Gerrit: al haberse ajustado con fusiones de Gerrit, puede puntuar parches o cambios propuestos y marcar los que requieran revisión adicional en un pipeline de CI/CD.
- Calidad de respuestas en foros técnicos: con datos de Stack Exchange, puede puntuar respuestas y detectar las de baja calidad antes de publicarlas o destacarlas.
- Gestión de borradores de artículos (AfC) y propuestas de borrado (AfD) en Wikipedia: puede clasificar propuestas y priorizar las que necesiten atención de revisores.
- Filtrado y enrutamiento de solicitudes en aplicaciones: según el caso de uso de Zils, puede ordenar peticiones entrantes, marcar problemas y derivar cada solicitud al flujo adecuado en un backend ligero.
- Despliegue en entornos con recursos limitados: con ~853 M de parámetros y pesos de 1,7 GB, es viable en infraestructura modesta para tareas de inferencia por lotes o de baja latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamaño, en fp16 los pesos de ~853 M de parámetros ocuparían aproximadamente 1,7 GB, a lo que habría que sumar la memoria de activaciones y del código personalizado.
- GPU recomendadas: no disponible. Por tamaño, un modelo de esta escala es compatible con GPU de consumo, aunque no se documentan requisitos oficiales.
- Cabe en GPU de consumo: previsiblemente sí por tamaño, pero no se confirma en la información disponible.
- Opciones de despliegue: `transformers` (librería declarada), con posible necesidad de `trust_remote_code` por el uso de `custom_code`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| zils-lite-decision-v2 | 852.985.920 | no disponible | Apache-2.0 | Fine-tune LoRA de Matilda-Decision-v1-Edge (Qwen3.5-0.8B) |
| malkolm777/zils-lite-decision-v1 | no disponible | no disponible | no disponible | Versión previa del mismo autor |
| Maincode/Matilda-Decision-v1-Edge | no disponible | no disponible | Apache-2.0 (según model card) | Modelo base del que deriva este fine-tune |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al entrenarse con datos de Wikipedia, arXiv, Gerrit y Stack Exchange, puede heredar sesgos de esas comunidades.
- Riesgo de alucinación: no evaluado; al ser un modelo de decisión y no de generación, el riesgo principal es una clasificación o puntuación errónea, no la fabricación de texto.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no están declarados; no se debe asumir cobertura multilingüe.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el repositorio incluye `custom_code`, por lo que conviene revisar el código y el fichero NOTICE antes de desplegarlo en producción.
- Requiere `trust_remote_code`: la carga del modelo implica ejecutar código del autor, lo que supone un riesgo de seguridad que debe evaluarse.
- Madurez: cero descargas y cero "likes" en el momento de la consulta; sin benchmarks ni validación externa publicada.
- Escalado del delta por factor 2: es una decisión de entrenamiento no estándar que puede afectar a la calibración de las puntuaciones; conviene validarla con datos propios.
- No se documentan métricas de calibración ni umbrales recomendados para las decisiones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/malkolm777/zils-lite-decision-v2
- Versión previa: https://huggingface.co/malkolm777/zils-lite-decision-v1/tree/main
- Sitio web de Zils: https://zils.ai/
- Modelo base (referenciado en la model card): Maincode/Matilda-Decision-v1-Edge (no se proporciona URL directa en la información disponible)
