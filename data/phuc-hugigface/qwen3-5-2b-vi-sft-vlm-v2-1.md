# Phuc-HugigFace/Qwen3.5-2B-Vi-SFT-VLM-v2.1

## Resumen

Qwen3.5-2B-Vi-SFT-VLM-v2.1 es un modelo multimodal de la familia Qwen3.5 publicado en Hugging Face por el usuario Phuc-HugigFace el 24 de septiembre de 2026. Según los metadatos del repositorio, se trata de un modelo de tipo image-text-to-text (entrada de imagen y texto, salida de texto) con 2.213.241.664 parámetros reales declarados en sus ficheros safetensors, lo que lo sitúa en la gama de ~2,2 mil millones de parámetros. La nomenclatura del identificador sugiere tres cosas que no están confirmadas por la documentación: una base Qwen3.5-2B, un ajuste supervisado (SFT) orientado al vietnamita (sufijo "Vi") y una segunda revisión mayor del ajuste multimodal (v2.1).

El interés práctico del modelo reside en su tamano reducido y su naturaleza multimodal: 2,2 B de parámetros permiten desplegarlo en una única GPU de consumo, algo relevante para prototipado de asistentes que necesitan interpretar imágenes junto a texto. Además, el repositorio está marcado como `endpoints_compatible`, lo que facilita su publicación inmediata mediante Inference Endpoints de Hugging Face sin trabajo de empaquetado adicional.

Ahora bien, la ficha del modelo en el Hub es la plantilla automática de transformers sin rellenar: no incluye desarrollador, tipo de modelo, idiomas, licencia, datos de entrenamiento, hiperparámetros ni evaluación. Todos los campos de esta ficha que dependan de esa documentación se marcan como "no disponible". Con 4 descargas y 0 likes en el momento de la consulta, se trata de un artefacto sin validación comunitaria ni resultados de benchmarks públicos, por lo que cualquier uso en producción exige una evaluación propia previa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la model card. Etiqueta de arquitectura `qwen3_5` (familia Qwen3.5). Pipeline `image-text-to-text`, compatible con `transformers`. Estructura interna (vision encoder, decoder, tipo de attention) no documentada |
| Parametros totales | 2.213.241.664 (~2,21 B), dato real extraído de los ficheros safetensors |
| Parametros activos | No aplica: no hay indicios de arquitectura MoE en los metadatos disponibles |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible. El repositorio solo contiene pesos safetensors; no se publican variantes GGUF, AWQ, GPTQ ni bitsandbytes. El tamano del repo (4,4 GB) es coherente con pesos en bf16/fp16 (2,21 B × 2 bytes ≈ 4,42 GB) |
| Idiomas soportados | No disponible. El sufijo "Vi" del identificador sugiere adaptación al vietnamita, sin confirmación documental |
| Licencia | No disponible (la model card no declara licencia) |
| Formato de pesos | safetensors, cargables con la librería `transformers` |

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura interna ni sobre el procedimiento de entrenamiento. Lo único verificable es la etiqueta `qwen3_5` en el repositorio, la pipeline declarada `image-text-to-text` y el número de parámetros. Por convención de nomenclatura de la familia Qwen, cabría esperar un transformer multimodal con un codificador visual acoplado a un decodificador de lenguaje, pero esto es una inferencia a partir del nombre y no un dato confirmado por el autor.

Los sufijos del identificador ("SFT", "VLM", "v2.1") apuntan a un ajuste supervisado sobre una base multimodal, presumiblemente con datos en vietnamita, del que no se especifica el volumen de tokens, la composición del dataset, la resolución de imagen soportada, ni si hubo etapas de RLHF, DPO u optimización por preferencias. Tampoco se documentan innovaciones técnicas (decodificación especulativa, atención lineal, multi-token prediction) ni hiperparámetros de entrenamiento. Existe un repositorio hermano del mismo autor, `Phuc-HugigFace/Qwen3.5-2B-vi-sft-v2_1-lora`, que sugiere que el ajuste se realizó mediante LoRA antes de fusionar o publicar los pesos, aunque esta relación no está declarada formalmente.

## Capacidades

- Generación de texto conversacional multi-turno: el repositorio incluye la etiqueta `conversational` y usa una plantilla de chat propia de la familia Qwen.
- Comprensión de imágenes: la pipeline `image-text-to-text` implica capacidad de responder preguntas sobre imágenes, describirlas y razonar sobre su contenido visual.
- Respuesta a instrucciones multimodales: entrada combinada de imagen y texto con salida en lenguaje natural.
- Posible especialización en vietnamita: el sufijo "Vi" del identificador lo sugiere, aunque no hay confirmación ni evaluación publicada.
- Compatibilidad con endpoints de Hugging Face: la etiqueta `endpoints_compatible` habilita el despliegue directo en Inference Endpoints.
- Sin información sobre tool calling, function calling, uso agéntico, modo de razonamiento explícito (thinking), entrada de audio o vídeo, ni sobre capacidades de generación de código o matemáticas. Se consideran no disponibles.

## Casos de uso

- Asistente de atención al cliente en vietnamita con soporte de imágenes: el modelo puede gestionar conversaciones multi-turno donde el usuario adjunta una foto de un producto, un recibo o un error en pantalla y pide asistencia. Su tamano de 2,2 B permite desplegarlo en una GPU modesta con coste bajo por consulta.
- Extracción de información de documentos escaneados (VQA ligera): facturas, formularios o etiquetas fotografiadas con el móvil, formulando preguntas concretas ("¿cuál es el importe total?") y obteniendo respuestas en texto, siempre que se valide antes la resolución de imagen soportada.
- Descripción de imágenes para accesibilidad: generación de texto alternativo o descripciones habladas de fotografías en aplicaciones de asistencia a personas con discapacidad visual, con latencia baja gracias al reducido número de parámetros.
- Prototipado rápido de productos multimodales: al ser un VLM de 2,2 B con pesos safetensors y compatibilidad con `transformers` y endpoints, sirve para validar una idea de producto (por ejemplo, un chatbot sobre catálogo visual) antes de invertir en modelos mayores.
- Prefiltrado y moderación de contenido visual: clasificación y etiquetado previo de imágenes subidas por usuarios, derivando después a un modelo mayor o a revisión humana los casos dudosos.
- Base para ajuste específico de dominio: punto de partida para un SFT propio (por ejemplo, inspección de calidad industrial o apoyo a diagnóstico por imagen en un nicho concreto), aprovechando que ya viene ajustado para conversación multimodal.
- Investigación sobre ajuste eficiente en modelos pequeños: comparar el efecto de este SFT frente a su base Qwen3.5-2B y frente a LoRAs intermedias, dado que existe un repositorio LoRA del mismo autor.

En todos los casos, la ausencia de benchmarks y de licencia explícita obliga a una evaluación propia y a una revisión legal antes de cualquier despliegue comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio es la plantilla automática de Hugging Face y no incluye sección de evaluación, datos de test, métricas ni comparaciones. Tampoco se han encontrado resultados en la búsqueda web asociados a este identificador.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del recuento real de parámetros (2.213.241.664) y no proceden de documentación del autor:

- Pesos en bf16/fp16 (formato publicado): ~4,4 GB solo de pesos. Con caché KV y activaciones para contexto corto, se recomienda un mínimo de 6-8 GB de VRAM.
- Pesos en int8 (si se cuantiza manualmente): ~2,2 GB, con un total estimado de 4-5 GB de VRAM incluyendo overhead.
- Pesos en 4 bits (si se cuantiza manualmente): ~1,2-1,5 GB, con un total estimado de 2,5-3,5 GB de VRAM.
- GPU de consumo compatibles: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090, así como GPUs con 8 GB o más en bf16 para contexto corto. Cabe en la mayoría de GPU de consumo modernas.
- GPU de centro de datos: A100, H100, L40S o similares, innecesarias para inferencia en solitario, pero útiles para servir en lote o para ajuste fino.
- Cuantización de referencia en GPU: bitsandbytes (int8/4 bits) o GPTQ/AWQ generados por el usuario, ya que el repositorio solo publica safetensors en precisión completa.
- Opciones de despliegue: `transformers` (ruta garantizada por la librería declarada), Hugging Face Inference Endpoints (etiqueta `endpoints_compatible`), y servidores compatibles con modelos multimodales de la familia Qwen como vLLM o TGI, sujetos a verificación porque no hay confirmación de soporte para esta arquitectura concreta.
- llama.cpp y Ollama: no hay ficheros GGUF publicados, por lo que su uso requeriría una conversión propia.
- Latencia y throughput: no disponibles. El autor no publica medidas de velocidad, tamaño de lote ni tiempos de respuesta.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este modelo, por lo que la comparación se limita a características estructurales. Las cifras de los modelos alternativos proceden de su documentación pública y deben verificarse en sus fichas oficiales antes de tomar decisiones.

| Modelo | Parámetros | Contexto | Licencia | Multimodal | Disponibilidad de GGUF |
|---|---|---|---|---|---|
| Qwen3.5-2B-Vi-SFT-VLM-v2.1 | 2,21 B | No disponible | No disponible | Sí (image-text-to-text) | No publicado |
| Qwen2-VL-2B-Instruct | ~2,2 B | 32.768 tokens | Apache-2.0 | Sí | Sí, conversiones de la comunidad |
| Qwen2.5-VL-3B-Instruct | ~3,75 B | 128.000 tokens | Apache-2.0 | Sí | Sí, conversiones de la comunidad |
| Qwen3.5-2B-vi-sft-v2_1-lora (mismo autor) | Adaptador LoRA sobre base 2B | No disponible | No disponible | No declarado como VLM | No publicado |

El principal diferencial de este modelo frente a las alternativas de Qwen es la orientación al vietnamita y el ajuste conversacional multimodal, a costa de una licencia sin declarar y de una ausencia total de evaluación pública. No se han encontrado en la búsqueda web otros modelos comparables de la misma categoría y tamano con datos verificables.

## Limitaciones y advertencias

- Model card vacía: no hay información sobre desarrollador, datos de entrenamiento, composición del dataset ni proceso de ajuste, lo que impide auditar sesgos o procedencia de los datos.
- Licencia no declarada: sin licencia explícita no puede asumirse permiso de uso comercial. Es imprescindible contactar con el autor o abstenerse de usarlo en producción.
- Ausencia total de evaluación: no hay benchmarks, ni pruebas de robustez, ni análisis de alucinación. El riesgo de inventar contenido en respuestas sobre imágenes no está cuantificado.
- Idiomas no confirmados: aunque el sufijo "Vi" apunte al vietnamita, no se especifica qué otros idiomas soporta ni con qué calidad. El rendimiento en castellano es una incógnita.
- Longitud de contexto desconocida: no puede planificarse el uso con documentos largos o conversaciones extensas sin medirlo experimentalmente.
- Riesgo de sobreajuste al dominio del SFT: al tratarse de un ajuste supervisado de segunda revisión sobre una base de 2 B, es probable la pérdida de capacidades generales (olvido catastrófico) respecto al modelo base. No hay evaluación que lo descarte.
- Sin cuantizaciones oficiales: la ausencia de GGUF, AWQ o GPTQ obliga a generar las versiones cuantizadas por cuenta propia, con el consiguiente riesgo de degradación no medida.
- Escasa validación comunitaria: 4 descargas y 0 likes en el momento de la consulta. El modelo no ha sido contrastado por terceros.
- Fechas de publicación atípicas: el repositorio figura creado y actualizado el 24 de septiembre de 2026, lo que dificulta situarlo en una línea temporal verificable junto al resto del ecosistema.
- Soporte de servidores de inferencia no verificado: aunque existe la etiqueta `endpoints_compatible`, no está confirmado que vLLM, TGI u otros servidores reconozcan esta arquitectura concreta sin parches.
- Recomendación general: tratar este repositorio como material experimental para investigación y prototipado interno, nunca como componente listo para producción sin una batería de pruebas propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phuc-HugigFace/Qwen3.5-2B-Vi-SFT-VLM-v2.1
- Repositorio relacionado del mismo autor (adaptador LoRA): https://huggingface.co/Phuc-HugigFace/Qwen3.5-2B-vi-sft-v2_1-lora
- Referencia citada en la plantilla de la model card (Lacoste et al., 2019, calculadora de impacto ambiental; no es un artículo sobre este modelo): https://arxiv.org/abs/1910.09700
- Listado de modelos LoRA en Hugging Face (resultado de búsqueda donde aparece el repositorio relacionado): https://huggingface.co/models?sort=modified&search=lora
- Modelo de la misma familia, mayor tamano, citado en la búsqueda (no comparable en recursos): https://huggingface.co/phucngodev/Qwen3.6-27B-MTP
- Repositorio LlamaFactory, con soporte de modelos Qwen recientes para ajuste: https://github.com/hiyouga/llamafactory/releases
- Artículo sobre la serie Falcon-H1, mencionado en la búsqueda como contexto de arquitecturas híbridas: https://arxiv.org/html/2507.22448v1
