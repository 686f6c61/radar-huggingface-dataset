# anquachdev/hibiki-1b-mlx-q4

## Resumen

El modelo `anquachdev/hibiki-1b-mlx-q4` es una cuantización de pesos (weight-only) en formato Q4 del modelo `kyutai/hibiki-1b-mlx-bf16`, desarrollado por Kyutai, un laboratorio francés de investigación en inteligencia artificial de código abierto. Hibiki es un modelo de 1.000 millones de parámetros especializado en tareas de voz a voz (speech-to-speech), lo que implica que procesa audio directamente, sin necesidad de transcripción intermedia a texto. Esta versión cuantizada está optimizada para el ecosistema MLX de Apple, lo que permite ejecutar el modelo en dispositivos con silicio de Apple (M1 y posteriores) con un consumo de memoria reducido.

La cuantización Q4 con group size 32 reduce el tamaño del repositorio a 1,8 GB, frente a los pesos en bf16 del modelo original. El proceso de cuantización afecta únicamente a las capas lineales compatibles con MLX, mientras que el codec Mimi, los embeddings, las capas de normalización y el tokenizer permanecen sin cambios. El modelo está licenciado bajo CC-BY-4.0, lo que permite uso comercial con atribución, y soporta los idiomas francés e inglés. Su relevancia radica en ofrecer una versión ligera de un modelo de voz a voz de última generación, pensada para despliegue en entornos con recursos limitados, como ordenadores portátiles Apple.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 1.000 millones (inferido del nombre, no confirmado) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4 (group size 32) |
| Idiomas soportados | frances, ingles |
| Licencia | CC-BY-4.0 |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base `kyutai/hibiki-1b-mlx-bf16`. Al tratarse de un modelo de voz a voz, se espera que combine un codec de audio (probablemente Mimi, mencionado en la model card) con un modelo de lenguaje autoregresivo, pero esta suposicion no esta confirmada por los datos disponibles. El proceso de cuantizacion aplicado en esta version es weight-only Q4 con group size 32, limitado a las capas lineales compatibles con MLX. El codec, los embeddings, las capas de normalizacion y el tokenizer se mantienen en su precision original (bf16). No se ha publicado informacion sobre el dataset de entrenamiento, el numero de tokens procesados ni el uso de tecnicas como RLHF o DPO.

## Capacidades

- Procesamiento de voz a voz (speech-to-speech), segun el nombre y la etiqueta `speech-to-speech` del modelo.
- Soporte de los idiomas frances e ingles.
- Cuantizacion Q4 que reduce el uso de memoria, manteniendo la funcionalidad del modelo base.
- Compatibilidad con el ecosistema MLX de Apple, lo que permite ejecucion en dispositivos con silicio de Apple.
- No se documentan capacidades adicionales como tool calling, agentes, razonamiento multimodal o vision en la informacion proporcionada.

## Casos de uso

No se han documentado casos de uso especificos en la informacion disponible. Dado que el modelo es una cuantizacion de un modelo de voz a voz, se podrian considerar aplicaciones como traduccion de voz en tiempo real, asistentes de voz conversacionales o generacion de respuestas habladas, pero estas son inferencias no confirmadas por el autor. Se recomienda consultar la documentacion del modelo base `kyutai/hibiki-1b-mlx-bf16` para conocer las capacidades reales antes de su uso en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Al ser un modelo MLX, requiere un dispositivo Apple con silicio (M1 o superior) y macOS con soporte para MLX.
- El tamano del repositorio es de 1,8 GB, por lo que cabe en la memoria unificada de la mayoria de Macs con al menos 8 GB de RAM, aunque se recomienda 16 GB para mayor comodidad.
- No se especifican requisitos de VRAM ni latencia estimada.
- Opciones de despliegue: se puede ejecutar con la libreria MLX de Apple (por ejemplo, usando `mlx-lm` o scripts personalizados). No se menciona compatibilidad con vLLM, llama.cpp u Ollama.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (speech-to-speech cuantizado para MLX). Se recomienda consultar el modelo base `kyutai/hibiki-1b-mlx-bf16` para una comparativa con otros modelos de Kyutai o alternativas de voz a voz.

## Limitaciones y advertencias

- La cuantizacion Q4 puede introducir una ligera perdida de calidad en la generacion de audio en comparacion con los pesos bf16 originales.
- Solo soporta frances e ingles; no se garantiza el funcionamiento en otros idiomas.
- No se ha verificado el comportamiento del modelo en tareas fuera de la voz a voz, como generacion de texto o codigo.
- La licencia CC-BY-4.0 permite uso comercial, pero requiere atribucion al autor original (Kyutai).
- Al ser una cuantizacion de un modelo de terceros, la responsabilidad del rendimiento recae en el modelo base; se recomienda probar el modelo en el caso de uso concreto antes de desplegarlo en produccion.
- No se dispone de informacion sobre sesgos, alucinaciones o limitaciones de contexto.

## Enlaces

- Repositorio HuggingFace: [anquachdev/hibiki-1b-mlx-q4](https://huggingface.co/anquachdev/hibiki-1b-mlx-q4)
- Modelo base: [kyutai/hibiki-1b-mlx-bf16](https://huggingface.co/kyutai/hibiki-1b-mlx-bf16)
