# cjqhhh/Sloth-27B-v1

## Resumen

Sloth-27B-v1 es un modelo de decisión estructurada desarrollado por el usuario cjqhhh y publicado en Hugging Face. No es un modelo generativo de texto libre: recibe un estado (texto o JSON que describe una situación) y un conjunto de preguntas con respuestas candidatas, y devuelve la opción seleccionada junto con una distribución de probabilidad sobre las alternativas. Está construido como un fine-tuning del modelo vllm-sr/d3, del que hereda un backbone de aproximadamente 26.090 millones de parámetros almacenados en 11 shards de safetensors en BF16, más una cabeza de decisión en FP32 sobre 255 códigos de respuesta aplicada en la posición final del prompt.

El modelo está orientado a tareas de enrutamiento de intenciones, juicios de relevancia y decisiones de flujo de trabajo basadas en reglas. Su pipeline declarado en Hugging Face es `zero-shot-classification` y requiere código personalizado (`trust_remote_code=True`) para su uso, con la librería vLLM como entorno de referencia. El repositorio ocupa 52,2 GB y fue creado el 16 de noviembre de 2026.

La relevancia de este lanzamiento es acotada pero específica: propone una interfaz tipada de decisión (elección entre candidatos o decisión binaria) en lugar de generación abierta, lo que facilita la integración en sistemas de agentes y pipelines deterministas. No obstante, la información pública disponible es muy limitada: no se especifican licencia, idiomas soportados, datos de entrenamiento ni resultados de benchmarks, y el propio autor advierte que la inferencia nativa en GPU no se ha vuelto a probar para esta release.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone transformer (heredado de vllm-sr/d3) con cabeza de decisión FP32 sobre 255 códigos de respuesta |
| Parametros totales | 26.085.330.160 (aproximadamente 26,09B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (11 shards BF16), con código personalizado y requirements nativos |

## Arquitectura y entrenamiento

El modelo se construye sobre el backbone de vllm-sr/d3, un transformer de aproximadamente 26,09B parámetros almacenado en 11 shards BF16. Sobre la representación final del prompt se aplica una cabeza de decisión en FP32 que produce logits sobre 255 códigos de respuesta; esos logits se dividen por una temperatura configurada de 1.0 y se normalizan con softmax dentro de cada pregunta. El mecanismo admite múltiples preguntas por petición: cada pregunta se renderiza con una copia del estado compartido y los prompts pueden agruparse en lotes.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras fases de alineamiento. El autor indica que el modelo hereda pesos de visión del modelo base, pero que estos no se han evaluado para esta release, por lo que el alcance declarado se limita a tareas de decisión sobre texto. Tampoco se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.) más allá de la interfaz de decisión tipada y la cabeza de lectura sobre códigos de respuesta.

## Capacidades

- Decisión estructurada tipo `choice`: selección de una entre 1 y 255 claves candidatas, cada una con su descripción, devolviendo la elección y la distribución de probabilidad.
- Decisión binaria tipo `noul`: salida con la probabilidad de verdadero, con descripciones opcionales para `false` y `true`.
- Procesamiento de estado en texto libre o JSON, lo que permite pasar contexto estructurado o conversacional.
- Soporte de múltiples preguntas por petición, con prompts agrupables en lotes.
- Enrutamiento de intenciones y clasificación zero-shot mediante descripciones de criterios.
- No genera texto libre: la salida es una decisión tipada más probabilidades.
- Capacidades de visión heredadas del modelo base, no evaluadas en esta release.
- Soporte de tool calling, agentes multi-paso, capacidades multilingües o modo de razonamiento extendido: no disponible en la información proporcionada.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el mensaje del usuario como `state` y una pregunta `choice` con criterios como facturación, técnico o ventas, devolviendo la elección y su probabilidad. Es adecuado porque la interfaz está diseñada exactamente para selección entre candidatos descritos.
- Clasificación de relevancia en búsqueda: dado un par consulta-documento en JSON, se formula una pregunta `noul` sobre si el documento es relevante, obteniendo una probabilidad de verdadero que puede usarse como señal de ranking.
- Decisiones de flujo de trabajo basadas en reglas: en un pipeline de automatización, el modelo evalúa el estado del proceso y decide la siguiente rama mediante preguntas `choice` con criterios explícitos.
- Moderación o triaje previo: clasificación binaria (`noul`) de si un contenido requiere revisión humana, aprovechando la salida probabilística para fijar umbrales.
- Extracción de decisión en asistentes conversacionales: integrado como paso de decisión tras la comprensión del lenguaje, para elegir la acción o herramienta siguiente sin depender de generación libre.
- Evaluación por lotes de decisiones: al permitir agrupar prompts de varias preguntas y reutilizar el estado compartido, encaja en procesos de clasificación masiva sobre registros estructurados.
- Enrutamiento multietiqueta controlado: con hasta 255 códigos de respuesta, puede mapear estados complejos a taxonomías amplias definidas por el usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Los pesos ocupan aproximadamente 52,2 GB en BF16, por lo que la inferencia requiere al menos una GPU con esa capacidad de VRAM más memoria adicional para el runtime.
- Entorno recomendado por el autor: Linux con GPU CUDA y una instalación compatible de PyTorch/torchvision, más las dependencias nativas incluidas en `requirements-native.txt`.
- GPU recomendadas: no disponible de forma explícita; por tamaño de pesos, encajan aceleradores con 80 GB de VRAM (A100, H100) y, con cuantización no documentada, podría considerarse hardware menor, aunque no se especifican tipos de cuantización.
- ¿Cabe en GPU de consumo? No disponible; en BF16 no cabe en GPUs de consumo típicas de 24 GB sin cuantización, y no se documentan formatos cuantizados.
- Opciones de despliegue: la librería declarada es vLLM, con interfaz nativa de Transformers mediante `AutoModel.from_pretrained` y `trust_remote_code=True`. No se documenta soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible. El autor advierte que la inferencia nativa en GPU no se ha vuelto a probar para esta release.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (modelos de decisión estructurada) ni datos de rendimiento que permitan una comparación rigurosa con alternativas.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre, solo decisiones tipadas y probabilidades; no sirve para tareas de generación, resumen o código.
- La calibración de probabilidades no ha sido evaluada de forma independiente, según el propio autor.
- La inferencia nativa en GPU no se ha vuelto a probar para esta release; solo se ha verificado la sintaxis y el formato de petición contra el código incluido.
- Los pesos de visión heredados del modelo base no se han evaluado; el alcance declarado es únicamente texto.
- Licencia no disponible: no puede confirmarse el uso comercial ni las restricciones de redistribución.
- Idiomas soportados no disponibles: se desconoce el comportamiento multilingüe.
- Longitud de contexto no disponible: no puede planificarse el uso con estados largos sin verificación empírica.
- Riesgo de sesgos y alucinación: no documentado por el autor; al tratarse de un fine-tuning sobre un backbone no identificado públicamente en detalle, los sesgos heredados son desconocidos.
- Requiere `trust_remote_code=True` y código personalizado, lo que implica revisar el código incluido antes de desplegarlo en producción.
- El repositorio se describe como privado en las instrucciones de descarga (`hf auth login`), lo que puede limitar el acceso y la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cjqhhh/Sloth-27B-v1
- Modelo base: https://huggingface.co/vllm-sr/d3
