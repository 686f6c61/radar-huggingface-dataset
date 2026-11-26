# hirundo-io/d3-flash-westernized

## Resumen

d3-flash-westernized es un modelo de decisión (decision-model) publicado por hirundo-io como una variante "occidentalizada" del modelo base vllm-sr/d3-flash. El modelo se distribuye bajo licencia Apache 2.0 y está etiquetado para la tarea de zero-shot-classification, con arquitectura declarada qwen3_5 en los metadatos de Hugging Face. Cuenta con 8.392.695.024 parámetros (aproximadamente 8,4 mil millones) en formato safetensors, con un repositorio de 16,8 GB. El acceso está restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargarlo.

La propuesta del modelo es la mitigación de sesgos (bias-mitigation) mediante un proceso de "westernización" aplicado sobre el modelo base. Los tags incluyen explícitamente bias-mitigation y westernized, lo que sugiere un ajuste orientado a alinear las respuestas con valores o perspectivas occidentales, aunque no se detalla la metodología exacta en la información disponible. Es relevante para desarrolladores que necesiten un clasificador zero-shot con sesgo ajustado, pero conviene tratarlo con cautela dado que no hay documentación pública sobre el proceso de entrenamiento.

El modelo se publicó el 26 de noviembre de 2026 y, en el momento de redactar esta ficha, registra 0 descargas y 0 likes, por lo que no existe validación comunitaria ni resultados de benchmarks publicados. Es un modelo muy reciente y sin tracción, lo que limita la confianza en su comportamiento en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (según tags de Hugging Face; detalles no disponibles) |
| Parametros totales | 8.392.695.024 (~8,4 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (custom_code) |

## Arquitectura y entrenamiento

Los metadatos indican una arquitectura etiquetada como qwen3_5, lo que apunta a una familia de transformers tipo Qwen, pero no se especifica si se trata de un transformer denso, un MoE o una variante híbrida. El modelo requiere custom_code, es decir, código personalizado para cargar los pesos, y se presenta como un modelo de decisión derivado de vllm-sr/d3-flash mediante un merge (tag base_model:merge:vllm-sr/d3-flash).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste supervisado. El tag westernized y bias-mitigation sugiere un post-entrenamiento orientado a modificar la distribución de respuestas, pero la metodología concreta no está documentada en la información proporcionada. No se han publicado innovaciones técnicas destacables (decodificación especulativa, atención lineal, etc.) en los datos disponibles.

## Capacidades

- Clasificación zero-shot: el pipeline declarado es zero-shot-classification, por lo que el uso previsto es asignar etiquetas a textos sin entrenamiento específico por tarea.
- Mitigación de sesgos: el modelo se presenta como una variante "westernized" con ajuste explícito de sesgo, orientada a reducir o reorientar sesgos del modelo base.
- Generación de texto: al derivar de un transformer de ~8,4 mil millones de parámetros, es plausible que conserve capacidades generativas, aunque no se documentan explícitamente.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se listan idiomas soportados.
- Capacidades especiales (thinking mode, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Clasificación de contenido en pipelines de moderación: usar el modelo como clasificador zero-shot para etiquetar textos entrantes (tóxico, seguro, ambiguo) sin necesidad de un conjunto de entrenamiento específico, aprovechando su pipeline declarado.
- Enrutamiento de consultas en atención al cliente: clasificar tickets o mensajes en categorías predefinidas (facturación, soporte técnico, reclamación) para dirigirlos al equipo adecuado, dado que la clasificación zero-shot permite definir las etiquetas en tiempo de inferencia.
- Análisis de sentimiento y temática en investigación social: aplicar el modelo a corpus de textos para etiquetar opiniones o temas, con la advertencia de que el ajuste "westernized" puede introducir un sesgo cultural en los resultados.
- Evaluación comparativa de sesgos: usar esta variante frente al modelo base vllm-sr/d3-flash para estudiar cómo el proceso de "westernización" altera las decisiones de clasificación en conjuntos de prueba controlados.
- Filtrado de contenido en comunidades online: clasificar publicaciones como relevantes o irrelevantes según criterios configurables, integrando el modelo en un servicio de inferencia con vLLM o TGI (siempre que el custom_code sea compatible).
- Prototipado rápido de clasificadores sin datos etiquetados: en entornos de I+D donde no hay presupuesto para anotar datos, el modelo permite obtener una línea base de clasificación zero-shot antes de entrenar un clasificador específico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 8,4 mil millones de parámetros en fp16, se requieren aproximadamente 16,8 GB de VRAM solo para los pesos, más overhead de activaciones y KV cache. En cuantización de 8 bits, alrededor de 8,4 GB; en 4 bits, alrededor de 4,2 GB (estimaciones teóricas, no verificadas para este modelo).
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX A6000 para fp16 sin cuantizar. Para cuantización 4/8 bits, una RTX 4090 (24 GB) o RTX 3090 (24 GB) sería suficiente en teoría.
- Cabe en consumer GPU: sí, en principio, con cuantización (RTX 4090, RTX 3090, RTX 4080 de 16 GB en 4 bits), aunque no se documentan variantes cuantizadas oficiales.
- Opciones de despliegue: vLLM, TGI o transformers con custom_code; llama.cpp/Ollama requerirían conversión a GGUF, no documentada.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| hirundo-io/d3-flash-westernized | ~8,4 B | no disponible | Apache 2.0 | Gated | Variante westernized de d3-flash |
| vllm-sr/d3-flash (base) | no disponible | no disponible | no disponible | no disponible | Modelo base del que deriva |
| Alternativas de clasificación zero-shot de ~8B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos verificados |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas de la misma categoría. Los datos del modelo base vllm-sr/d3-flash no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Acceso restringido: el modelo es gated y requiere aceptar condiciones en Hugging Face antes de la descarga, lo que puede complicar la automatización en CI/CD.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la ficha; no hay evidencia de uso en producción ni informes de terceros.
- Riesgo de sesgo deliberado: el ajuste "westernized" implica una orientación cultural explícita que puede sesgar las clasificaciones en contextos no occidentales; debe evaluarse antes de usarlo en aplicaciones multiculturales.
- Falta de documentación: no se detallan datos de entrenamiento, contexto, idiomas ni metodología de mitigación de sesgos, lo que dificulta la auditoría.
- Riesgo de alucinación: no evaluado; al ser un modelo generativo subyacente, puede producir clasificaciones o texto incorrectos con alta confianza.
- Requiere custom_code: la carga no es estándar, lo que puede romper la compatibilidad con herramientas de inferencia convencionales.
- Licencia Apache 2.0: permite uso comercial, pero al ser un modelo derivado conviene verificar las condiciones del modelo base vllm-sr/d3-flash, cuya licencia no está disponible en la información proporcionada.
- Fecha de publicación futura respecto a los datos habituales de referencia: verificar la vigencia y el soporte del repositorio antes de adoptarlo.

## Enlaces

- Hugging Face: https://huggingface.co/hirundo-io/d3-flash-westernized
- Modelo base: https://huggingface.co/vllm-sr/d3-flash (referenciado en los tags; no verificado)
- Repositorio del autor: https://huggingface.co/hirundo-io (no verificado)
- Paper, blog o demo: no disponible en la información proporcionada.
