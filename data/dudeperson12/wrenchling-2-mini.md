# DudePerson12/Wrenchling-2-Mini

## Resumen

Wrenchling-2-Mini es un derivado experimental de tipo texto del modelo OpenUncensored/Inkling-2-Mini-Uncensored, publicado por el usuario DudePerson12 en Hugging Face. Se trata de un modelo de arquitectura MoE (mixture of experts) bautizada como Inkling2Loop, con 24 capas fisicas y un total de 13.836.256.808 parametros segun los pesos en safetensors. La modificacion principal consiste en una poda estructural del pool de expertos enrutados, que pasa de 128 a 64 expertos por capa MoE, manteniendo el enrutamiento top-8 y eliminando los pesos de vision.

El modelo base pertenece presuntamente al linaje Inkling-2 de Thinking Machines Lab, aunque esta version concreta es una publicacion independiente y no oficial. La relevancia de esta ficha radica en documentar un caso de poda de expertos sin entrenamiento posterior de recuperacion (post-pruning healing), lo que lo convierte en un objeto de estudio interesante sobre el impacto de la reduccion de capacidad en arquitecturas MoE. No obstante, al no haberse publicado resultados de evaluacion, su utilidad practica en produccion es incierta y debe abordarse con cautela.

La licencia es Apache 2.0, lo que permite uso comercial, pero el autor advierte explicitamente de que el rendimiento puede diferir del modelo original al no haberse realizado ajuste fino tras la poda. El repositorio ocupa 38,8 GB e incluye pesos en safetensors y GGUF, ademas de una variante de 8 bits generada con modelopt.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Inkling2Loop (MoE, transformer con bucle) |
| Parametros totales | 13.836.256.808 |
| Parametros activos | no disponible (top-8 de 64 expertos por capa) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF, 8-bit (modelopt), safetensors en precision original |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

La arquitectura Inkling2Loop combina un esquema transformer con una estructura de bucle (loop) sobre 24 capas fisicas y un componente MoE con 64 expertos enrutados por capa y activacion top-8. El modelo base original contaba con 128 expertos enrutados; esta version reduce el pool a la mitad seleccionando los 64 expertos de mayor importancia segun los parametros del router, estimada de forma independiente por capa y conservando el orden original de los expertos retenidos. Los pesos de vision del modelo base han sido eliminados, por lo que la variante es exclusivamente de texto.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si el modelo base paso por fases de RLHF o DPO. El autor indica explicitamente que el modelo ha sido podado estructuralmente y no ha recibido entrenamiento de recuperacion ni ajuste posterior a la poda, por lo que las capacidades del router y de los expertos retenidos pueden estar degradadas respecto al original. No se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal mas alla de la propia arquitectura Inkling2Loop.

## Capacidades

- Generacion de texto conversacional, segun la etiqueta `conversational` del repositorio.
- Razonamiento y generacion de texto general, heredados del modelo base, aunque sin garantia de rendimiento tras la poda.
- Soporte de tool calling y function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado.
- Capacidades multilingues: no disponibles; el modelo no declara idiomas.
- Capacidades de vision: eliminadas explicitamente en esta variante.
- Modo thinking: no disponible en la informacion proporcionada.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que sugiere despliegue mediante APIs compatibles con el ecosistema de Hugging Face.

## Casos de uso

- Experimentacion academica sobre poda de expertos en MoE: el modelo permite estudiar como afecta la reduccion de 128 a 64 expertos al enrutamiento y a la calidad de generacion, comparando directamente con el modelo base.
- Prototipado de chatbots conversacionales en entornos de investigacion: su etiqueta `conversational` y su licencia Apache 2.0 permiten integrarlo en pruebas de concepto sin restricciones legales, aunque con validacion previa de calidad.
- Generacion de texto en pipelines de bajo requisito: al tener 13,8 mil millones de parametros totales y solo 8 expertos activos por token, el coste de inferencia por token es menor que el de un modelo denso equivalente, lo que lo hace apto para entornos con recursos limitados.
- Despliegue en local con llama.cpp u Ollama: la disponibilidad de pesos GGUF facilita su ejecucion en estaciones de trabajo sin GPU de datacenter, util para pruebas offline.
- Base para ajuste fino posterior (healing): dado que el autor no realizo entrenamiento de recuperacion, el modelo puede servir como punto de partida para experimentos de continued training que restauren parte de la calidad perdida.
- Evaluacion comparativa de cuantizaciones: la presencia de variantes safetensors, GGUF y 8-bit (modelopt) permite medir el impacto de la cuantizacion en un mismo modelo con distintas precisiones.
- Investigacion sobre modelos sin censura: al derivar de un modelo base etiquetado como "uncensored", puede emplearse en estudios sobre alineacion y filtrado de contenido, siempre con las salvaguardas adecuadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision original (FP16/BF16): aproximadamente 27-28 GB solo para pesos, mas overhead de contexto y cache KV; se recomienda un minimo de 32 GB.
- VRAM estimada en 8 bits: en torno a 14-15 GB para pesos, viable en GPUs de 24 GB.
- VRAM estimada en GGUF Q4: aproximadamente 8-9 GB, lo que permite ejecucion en GPUs consumer de 12 GB o superiores.
- GPUs recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para precision completa; RTX 4090 (24 GB) para 8 bits; RTX 3090, 4080 o 4070 Ti para cuantizaciones GGUF de 4-5 bits.
- Cabe en GPU consumer: si, en cuantizaciones GGUF de 4-8 bits en tarjetas con 12 GB o mas.
- Opciones de despliegue: llama.cpp y Ollama para GGUF; vLLM o TGI para safetensors si se confirma compatibilidad con la arquitectura Inkling2Loop; endpoints compatibles segun la etiqueta del repositorio.
- Latencia y throughput: no disponibles; al activar solo 8 expertos por token, el coste computacional por token es inferior al de un modelo denso de 13,8B, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Wrenchling-2-Mini | 13,8B | no disponible | Apache 2.0 | MoE podado, sin healing, solo texto |
| OpenUncensored/Inkling-2-Mini-Uncensored | no disponible | no disponible | no disponible | Modelo base, 128 expertos, con vision |
| Modelos densos de ~13B (referencia generica) | ~13B | variable | variable | Mayor coste por token al no ser MoE |

No se dispone de datos de rendimiento del modelo base ni de alternativas directas en la informacion proporcionada, por lo que la comparativa se limita a caracteristicas estructurales.

## Limitaciones y advertencias

- Modelo podado sin entrenamiento de recuperacion: el autor advierte que el rendimiento puede diferir del original y degradarse en tareas que dependian de los expertos eliminados.
- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de calidad, lo que desaconseja su uso en produccion sin evaluacion propia.
- Sin informacion sobre sesgos: al derivar de un modelo "uncensored", es probable que las salvaguardas de contenido sean limitadas; requiere moderacion externa.
- Riesgo de alucinacion no cuantificado: sin datos de evaluacion, no puede estimarse la tasa de alucinacion.
- Idiomas no declarados: se desconoce el soporte multilingue real; probablemente este optimizado para ingles.
- Capacidad de vision eliminada: no apto para tareas multimodales.
- Contexto maximo desconocido: no puede planificarse su uso en escenarios de contexto largo sin verificacion previa.
- Modelo independiente y no oficial: no cuenta con el respaldo de Thinking Machines Lab ni de OpenUncensored, lo que limita el soporte y la trazabilidad.
- Repositorio con 0 descargas y 0 likes: sin validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/DudePerson12/Wrenchling-2-Mini
- Modelo base: https://huggingface.co/OpenUncensored/Inkling-2-Mini-Uncensored
