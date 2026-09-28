# empiriolabsai/aplomb-1

## Resumen
Aplomb 1 es un modelo de decisión multimodal desarrollado por EmpirioLabs AI y publicado en HuggingFace bajo un acceso restringido (gated). No es un modelo generativo de propósito general, sino un clasificador especializado: responde preguntas de tipo sí/no, elección entre opciones, puntuación numérica y selección de herramientas, devolviendo probabilidades calibradas en lugar de texto libre. Está construido como fine-tuning del modelo base Qwen/Qwen3.6-35B-A3B, una arquitectura de mezcla de expertos (MoE) de aproximadamente 35.950 millones de parámetros totales.

El modelo se distribuye mediante la librería transformers con pesos en safetensors, ocupa 71,9 GB en el repositorio y está etiquetado como image-text-to-text, multimodal, vision y video, además de clasificación zero-shot. La información pública indica que la variante alojada como API ("Aplomb 1 Omni") añade capacidad de audio (llamadas, notas de voz, sonidos y música), aunque las etiquetas del repositorio de HuggingFace solo declaran texto, imagen y vídeo.

Su relevancia radica en cubrir un nicho poco frecuente: modelos que toman decisiones discretas o scores calibrados sobre entradas multimodales, útiles como enrutadores, verificadores o selectores de herramientas dentro de pipelines de agentes. El repositorio no incluye tarjeta de modelo detallada, datos de entrenamiento ni resultados de benchmarks publicados, por lo que parte de sus especificaciones no están disponibles.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), etiqueta qwen3_5_moe; multimodal image-text-to-text |
| Parametros totales | 35.952.084.848 (~35,95 B) |
| Parametros activos | Aproximadamente 3 B (inferido de la nomenclatura "A3B" del modelo base Qwen/Qwen3.6-35B-A3B; no confirmado en la ficha) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en safetensors; no se listan GGUF, AWQ ni GPTQ) |
| Idiomas soportados | en (inglés) |
| Licencia | empiriolabs-model-license-1.0 (licencia "other", propietaria) |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3.6-35B-A3B |
| Pipeline | zero-shot-classification |
| Acceso | restringido (gated) |
| Tamaño del repositorio | 71,9 GB |

## Arquitectura y entrenamiento
Aplomb 1 hereda la arquitectura del modelo base Qwen/Qwen3.6-35B-A3B: un transformer con mezcla de expertos (MoE) de tipo sparse, en el que solo una fracción de los parámetros se activa por token (nomenclatura "A3B", que apunta a unos 3.000 millones de parámetros activos sobre 35.950 millones totales). Esta configuración reduce el coste computacional por token respecto a un modelo denso del mismo tamaño. El modelo es multimodal: procesa texto, imágenes y vídeo según las etiquetas del repositorio (image-text-to-text, vision, video).

Sobre esa base, EmpirioLabs AI ha realizado un fine-tuning orientado a tareas de decisión y clasificación, con énfasis en probabilidades calibradas y selección de herramientas (tool-selection). Esto lo desvía de un uso conversacional: la salida esperada es una respuesta discreta (sí/no, una opción, un score o una herramienta). No se ha publicado información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF/DPO. Tampoco se documentan innovaciones técnicas específicas más allá de la propia arquitectura MoE heredada.

## Capacidades
- Clasificación zero-shot sobre entradas de texto, imagen y vídeo.
- Respuestas de decisión: preguntas binarias (sí/no), elección entre opciones (choice), puntuación numérica (score) y selección de herramientas (tool-selection).
- Salida de probabilidades calibradas, orientada a umbrales y decisiones automatizadas en producción.
- Capacidad multimodal: procesamiento de imágenes y vídeo (según etiquetas del repositorio).
- Capacidad de audio declarada para la variante alojada "Aplomb 1 Omni" (llamadas, notas de voz, sonidos y música); no consta como etiqueta en el repositorio de HuggingFace.
- Uso como enrutador o verificador dentro de pipelines de agentes, por su función de tool-selection.
- Soporte de tool calling/function calling no confirmado explícitamente en la información disponible, aunque la tarea de tool-selection apunta a un uso relacionado.
- Idioma: inglés (no se declaran capacidades multilingües).

## Casos de uso
- Enrutamiento de herramientas en agentes: dado un mensaje del usuario y un catálogo de funciones disponibles, Aplomb 1 selecciona la herramienta adecuada y devuelve una probabilidad asociada, lo que permite al orquestador decidir si invoca la función o pide aclaración.
- Moderación y verificación automatizada: clasificación binaria (sí/no) sobre texto, imágenes o vídeo para decidir si un contenido cumple una política, aprovechando las probabilidades calibradas y un umbral configurable.
- Control de calidad en pipelines de vídeo: puntuación automática (score) de fotogramas o clips para decidir si un segmento supera un criterio de calidad sin necesidad de un modelo generativo.
- Triaje de soporte al cliente: clasificación zero-shot de tickets o conversaciones en categorías predefinidas, devolviendo la opción más probable y su confianza para enrutar cada caso al equipo correspondiente.
- Filtrado de datos para entrenamiento: uso como clasificador para decidir si un par texto-imagen o un clip de vídeo es apto para un dataset, con puntuación de idoneidad.
- Análisis de audio en la variante Omni: respuesta a preguntas de tipo sí/no, elección o score sobre llamadas, notas de voz o música, útil para control de calidad o detección de eventos en centros de contacto.
- Decisiones de moderación de imágenes en tiempo de ingesta: verificación multimodal (imagen + texto) para aceptar o rechazar contenido antes de su publicación.
- Enrutamiento de consultas entre varios modelos: actuar como clasificador previo que decide qué modelo especializado debe resolver una petición según el tipo de entrada.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- El repositorio ocupa 71,9 GB y los pesos están en safetensors, lo que corresponde aproximadamente a precisión bf16/fp16; la inferencia completa requiere del orden de 72-80 GB de VRAM (estimación basada en el tamaño de los pesos).
- GPU recomendadas para precisión completa: NVIDIA H100 80 GB, A100 80 GB o configuraciones multi-GPU equivalentes.
- Para despliegue en una sola GPU de 40-48 GB sería necesaria cuantización a 8 bits (no se publican pesos cuantizados oficiales); en 4 bits el modelo podría situarse en el rango de 20-24 GB, aunque no hay ficheros de cuantización disponibles en el repositorio.
- No cabe en GPU de consumo en precisión completa; en GPU de consumo (por ejemplo, RTX 4090 de 24 GB) solo sería viable con cuantización agresiva a 4 bits, no publicada oficialmente.
- Opciones de despliegue: transformers (librería declarada), y previsiblemente vLLM o TGI para servir el modelo, aunque no se confirma compatibilidad explícita en la información disponible.
- Latencia y throughput: no disponibles. La arquitectura MoE con ~3 B de parámetros activos debería ofrecer un coste por token inferior al de un modelo denso de 35 B, pero no hay cifras publicadas.

## Comparativa con modelos similares
No hay modelos directamente comparables publicados en la información disponible, ya que Aplomb 1 es un clasificador de decisión multimodal especializado. La referencia más próxima es su propio modelo base.

| Modelo | Parametros | Contexto | Tipo | Licencia | Acceso |
|---|---|---|---|---|---|
| Aplomb 1 (empiriolabsai/aplomb-1) | ~35,95 B totales / ~3 B activos (MoE) | no disponible | Clasificación/decisión multimodal (fine-tune) | empiriolabs-model-license-1.0 | Gated |
| Qwen/Qwen3.6-35B-A3B (base) | ~35 B totales / ~3 B activos (MoE) | no disponible | Modelo generativo multimodal | Según licencia de Qwen | Público |
| Otros clasificadores multimodales de decisión | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias
- Acceso restringido (gated): es necesario aceptar condiciones en HuggingFace antes de descargar el modelo.
- Licencia propietaria (empiriolabs-model-license-1.0, categoría "other"): es imprescindible revisar los términos antes de cualquier uso comercial; no es una licencia de código abierto.
- Idioma limitado al inglés: no se declaran capacidades multilingües, por lo que su uso en castellano u otros idiomas no está respaldado por la ficha.
- Ausencia de benchmarks publicados: no hay métricas verificables de precisión, calibración o rendimiento que permitan estimar su comportamiento en producción.
- Naturaleza de decisión: al devolver clasificaciones y scores, existe riesgo de falsos positivos/negativos en función del umbral; las probabilidades calibradas solo son fiables dentro de la distribución de entrenamiento, que no está documentada.
- La capacidad de audio solo se anuncia para la variante alojada "Aplomb 1 Omni" vía API; no está confirmada en el repositorio de pesos de HuggingFace.
- La información sobre datos de entrenamiento, contexto máximo y proceso de alineación (RLHF/DPO) no está disponible, lo que dificulta evaluar sesgos y robustez.
- El repositorio no incluye tarjeta de modelo detallada; conviene contactar con el proveedor para obtener garantías antes de un despliegue crítico.

## Enlaces
- HuggingFace: https://huggingface.co/empiriolabsai/aplomb-1
- Organización en HuggingFace: https://huggingface.co/empiriolabsai/models
- Página de producto Aplomb 1 Omni: https://empiriolabs.ai/models/aplomb-1-omni
- Documentación Aplomb 1 Omni: https://docs.empiriolabs.ai/models/aplomb-1-omni
- Playground de la API: https://platform.empiriolabs.ai/dashboard/playground?model=aplomb-1-omni
- Sitio de EmpirioLabs AI: https://empiriolabs.ai/
