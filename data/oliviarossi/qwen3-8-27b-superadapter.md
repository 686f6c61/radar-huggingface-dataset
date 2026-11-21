# OliviaRossi/Qwen3.8-27B-SuperAdapter

## Resumen

Qwen3.8-27B-SuperAdapter es un checkpoint fusionado publicado por OliviaRossi que aplica el adaptador LoRA `harness-hub/Qwen3.8-27B-super-adapter` sobre el modelo base `Qwen/Qwen3.8-27B`. No se trata de un entrenamiento desde cero ni de un modelo original, sino de un merge de pesos: el adaptador (rango 96, alpha 192.0, 256 matrices objetivo) se integra en `float32` sobre el modelo base, dando como resultado un artefacto de 27.781.427.952 parámetros (unos 27,8 mil millones) y 55,6 GB en safetensors. El pipeline declarado es `image-text-to-text`, lo que indica capacidades multimodales de entrada imagen y salida texto.

El interés del modelo reside en su orientación a *agentic coding*: los tags del repositorio incluyen `agentic-coding` y `lora-merge`, y el adaptador fusionado está pensado para mejorar el comportamiento del modelo base en tareas de agente (uso de herramientas, razonamiento multi-paso, generación de código en entornos interactivos). Adicionalmente, incorpora una plantilla de chat personalizada del mismo autor (`OliviaRossi/Improved-Chat-Template-for-Qwen-3.x`) sincronizada tanto en `chat_template.jinja` como en `tokenizer_config.json`.

La relevancia es doble: por un lado, ofrece una variante "lista para usar" del modelo base con el adaptador ya fusionado, evitando al usuario tener que aplicar el LoRA por separado; por otro, la licencia Apache 2.0 facilita su uso comercial. No obstante, el modelo tiene un historial muy limitado (22 descargas, 0 likes, creado el 20 de noviembre de 2026) y no se han publicado benchmarks ni detalles de entrenamiento del adaptador en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), familia Qwen3.8; detalles internos no disponibles |
| Parametros totales | 27.781.427.952 (≈27,8 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors; no se listan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es el resultado de un merge LoRA, no de un entrenamiento completo. El adaptador `harness-hub/Qwen3.8-27B-super-adapter` tiene rango 96 y alpha 192.0, y se fusiona sobre 256 matrices objetivo del modelo base `Qwen/Qwen3.8-27B` en precisión `float32`, con una fuerza de LoRA (`LORA_STRENGTH`) de 1.0. La política MTP (multi-token prediction) se mantiene como `keep_base`, es decir, se conserva la del modelo base sin modificaciones. El resultado se empaqueta en safetensors con un total de 27,78 mil millones de parámetros.

No se dispone de información sobre el dataset de entrenamiento del adaptador, el número de tokens utilizados, la composición de los datos ni si hubo etapas de RLHF o DPO. Tampoco se detalla la arquitectura interna del modelo base Qwen3.8-27B (número de capas, dimensiones de atención, tipo de atención, etc.) más allá de que es un transformer multimodal de la familia Qwen3.8. La plantilla de chat incorporada proviene de `OliviaRossi/Improved-Chat-Template-for-Qwen-3.x`, lo que sugiere un ajuste del formato de conversación respecto al original, pero no se especifican los cambios concretos.

## Capacidades

- Generación de texto conversacional multi-turno, con pipeline declarado `conversational`.
- Procesamiento de entrada multimodal imagen-texto (`image-text-to-text`): el modelo acepta imágenes junto con texto y genera respuestas textuales.
- Orientación a *agentic coding*: el adaptador está etiquetado explícitamente para tareas de agente y codificación, lo que sugiere soporte para razonamiento multi-paso y uso de herramientas, aunque no se documenta formalmente el soporte de tool calling.
- Razonamiento y generación de código: implícito en el tag `agentic-coding`, sin benchmarks que lo cuantifiquen.
- Capacidades multilingües: no disponibles (no se listan idiomas en la model card).
- Modo *thinking* u otras capacidades especiales: no disponible.

## Casos de uso

- Asistencia a la programación en IDE: el modelo, orientado a *agentic coding*, puede integrarse en extensiones de editor para autocompletar, explicar y refactorizar código, aprovechando el adaptador fusionado para mejorar la coherencia en tareas multi-paso.
- Agentes autónomos de resolución de tareas: al estar entrenado/adaptado para comportamiento agéntico, puede emplearse en bucles de planificación-ejecución con llamadas a herramientas, siempre que se valide empíricamente el soporte de function calling.
- Análisis de capturas de pantalla y diagramas: gracias al pipeline `image-text-to-text`, puede recibir imágenes (por ejemplo, mockups de UI o diagramas de arquitectura) y generar descripciones o código a partir de ellas.
- Generación de documentación técnica a partir de imágenes: útil para convertir diagramas o capturas en texto explicativo o en fragmentos de código.
- Prototipado rápido de chatbots con contexto conversacional: la plantilla de chat mejorada del autor facilita el despliegue de asistentes multi-turno con un formato de conversación pulido.
- Investigación sobre fusión de LoRA: el checkpoint sirve como referencia reproducible para estudiar el efecto de fusionar un adaptador de rango 96 sobre un modelo de 27,8 B en `float32`, comparándolo con el modelo base sin adaptador.
- Evaluación comparativa de variantes Qwen3.8: útil para medir diferencias de comportamiento entre el base y la versión con adaptador en tareas de código y agente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 27,78 B parámetros, en `fp16`/`bf16` se requieren aproximadamente 55-56 GB de VRAM solo para pesos; en cuantización de 8 bits, unos 28-30 GB; en 4 bits, unos 15-16 GB (estimaciones teóricas, no verificadas para este checkpoint).
- GPU recomendadas: A100 80 GB, H100 80 GB o H200 para precisión completa; A100 40 GB o RTX 6000 Ada para 8 bits; GPUs consumer de 24 GB (RTX 4090, RTX 3090) solo con cuantización de 4 bits.
- ¿Cabe en consumer GPU? Solo con cuantización agresiva (4 bits) en GPUs de 24 GB o superiores; no cabe en 16 GB ni en 12 GB.
- Opciones de despliegue: vLLM, TGI y llama.cpp (previa conversión a GGUF, no incluida en el repo) son las vías habituales para un modelo de este tamaño; Ollama requeriría una conversión GGUF que no se distribuye.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| OliviaRossi/Qwen3.8-27B-SuperAdapter | 27,8 B | no disponible | Apache 2.0 | safetensors | Merge LoRA orientado a agentic coding |
| Qwen/Qwen3.8-27B (base) | ≈27,8 B | no disponible | no disponible en la informacion | safetensors | Modelo base sin adaptador |
| harness-hub/Qwen3.8-27B-super-adapter | no disponible (adaptador LoRA) | no disponible | no disponible en la informacion | LoRA (rango 96) | Adaptador original, requiere merge |

No se dispone de datos de rendimiento comparativo entre estas variantes ni con modelos de otras familias de tamaño similar.

## Limitaciones y advertencias

- Modelo con historial mínimo: 22 descargas y 0 likes en el momento de la consulta, creado en noviembre de 2026; no hay validación comunitaria ni reportes de uso.
- Ausencia total de benchmarks: no se puede verificar la mejora real del adaptador frente al modelo base en tareas de código o agente.
- Sesgos conocidos: no documentados; al derivar de Qwen3.8, hereda los sesgos del modelo base y de los datos del adaptador, que no se detallan.
- Riesgo de alucinación: no cuantificado; como todo modelo generativo, puede producir código o afirmaciones incorrectas, especialmente en tareas agénticas multi-paso.
- Limitaciones de contexto e idioma: no disponibles; no se especifica la ventana de contexto ni los idiomas soportados.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base Qwen3.8-27B y del adaptador original, ya que la información disponible no las detalla.
- Caveat de producción: al ser un merge LoRA en `float32`, el checkpoint es pesado (55,6 GB) y no incluye cuantizaciones listas para usar; el soporte de tool calling y de agentes no está documentado formalmente y debe validarse antes de desplegarlo.
- La plantilla de chat personalizada puede introducir diferencias de comportamiento respecto al modelo base que no están documentadas.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/OliviaRossi/Qwen3.8-27B-SuperAdapter
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Adaptador original: https://huggingface.co/harness-hub/Qwen3.8-27B-super-adapter
- Plantilla de chat mejorada: https://huggingface.co/OliviaRossi/Improved-Chat-Template-for-Qwen-3.x
- Perfil del autor: https://huggingface.co/OliviaRossi
