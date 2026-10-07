# dalatexcoder/MiniCPM5-2B-heretic-ara

## Resumen

MiniCPM5-2B-heretic-ara es una variante "decensored" (abliterated) del modelo openbmb/MiniCPM5-2B, publicada por el usuario dalatexcoder. El modelo base es un transformer denso de 2B parámetros desarrollado por OpenBMB, diseñado para despliegue local, en dispositivo y en entornos con recursos limitados, con soporte declarado de contexto largo, uso de herramientas y tareas agénticas. Esta versión concreta se ha generado aplicando la herramienta Heretic v1.2.0 con el método Arbitrary-Rank Ablation (ARA) y preservación de norma de fila, con el objetivo de eliminar los comportamientos de rechazo del modelo original.

El interés de esta ficha radica en que combina dos tendencias actuales: por un lado, los modelos pequeños de alto rendimiento pensados para edge computing; por otro, las técnicas de abliteration que reducen drásticamente las negativas del modelo a responder, manteniendo una divergencia KL baja respecto al original (0,0060). Según la model card, los rechazos pasan de 99/100 en el modelo original a 9/100 en esta variante, lo que la hace atractiva para escenarios donde se necesita un modelo permisivo, pero también introduce riesgos importantes de uso irresponsable.

El modelo cuenta con 2.516.756.480 parámetros (unos 2,5 mil millones), se distribuye en safetensors bajo licencia Apache 2.0, y soporta inglés y chino. El repositorio pesa aproximadamente 5 GB, lo que corresponde a pesos en precisión de 16 bits. No se ha publicado información detallada sobre la longitud de contexto exacta ni resultados de benchmarks estándar para esta variante específica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base MiniCPM5-2B) |
| Parametros totales | 2.516.756.480 (~2,5 mil millones) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (etiquetado como "long-context") |
| Tipos de cuantizacion | no disponible en el repositorio; solo se distribuyen pesos en safetensors |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compatible con transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer denso de aproximadamente 2,5 mil millones de parámetros, correspondiente a la segunda entrega de la serie MiniCPM5 de OpenBMB, tras MiniCPM5-1B. Según la model card del modelo base, se trata de un "dense 2B Transformer" que escala la misma receta de entrenamiento de la serie y está orientado a despliegue en dispositivo y escenarios con recursos limitados. El modelo base se posiciona como SOTA de código abierto en la clase de 2B y compite con modelos de la clase 4B en tareas de código, matemáticas, comprensión de contexto largo, uso de herramientas y tareas agénticas.

Sobre el entrenamiento del modelo base, la información disponible únicamente lista los conjuntos de datos asociados: openbmb/Ultra-FineWeb, openbmb/UltraX-Preview, openbmb/Ultra-FineWeb-L3, openbmb/UltraData-Math, openbmb/UltraData-Code, openbmb/UltraData-SFT-2605, openbmb/UltraData-SFT-Agent-2609 y openbmb/UltraData-RL-2609. Estos nombres sugieren etapas de preentrenamiento con datos web filtrados, datos de matemáticas y código, ajuste supervisado (SFT), SFT orientado a agentes y una etapa de aprendizaje por refuerzo (RL). No se especifica el número total de tokens de entrenamiento ni la composición exacta de cada mezcla en la información proporcionada.

La innovación específica de esta variante es la abliteration mediante Heretic v1.2.0 con el método Arbitrary-Rank Ablation (ARA) y preservación de norma de fila. Los parámetros de ablación aplicados son: start_layer_index = 18, end_layer_index = 21, preserve_good_behavior_weight = 0,6252, steer_bad_behavior_weight = 0,0001, overcorrect_relative_weight = 1,2801 y neighbor_count = 1. Es decir, la intervención se concentra en las capas 18 a 21, modificando las direcciones de activación asociadas a comportamientos de rechazo.

## Capacidades

- Generacion de texto conversacional en ingles y chino.
- Razonamiento, codigo y matematicas, heredados del modelo base MiniCPM5-2B, que segun su model card destaca en estas areas frente a modelos de su tamano.
- Soporte de contexto largo (long-context), segun las etiquetas del repositorio; la longitud exacta no esta especificada.
- Tool calling / function calling, indicado en las etiquetas del modelo.
- Soporte para tareas agenticas y razonamiento multi-paso, coherente con los datasets de SFT-Agent y RL incluidos en el entrenamiento base.
- Comportamiento permisivo (uncensored/decensored): rechaza aproximadamente el 9 por ciento de las peticiones en la evaluacion del autor, frente al 99 por ciento del modelo original.
- No se declara soporte de vision, audio ni otras modalidades.

## Casos de uso

- Generacion de texto creativo y narrativa sin restricciones tematicas: la abliteration reduce los rechazos, lo que permite explorar generos como ficcion oscura, terror o dialogos con contenido sensible para escritura profesional.
- Investigacion sobre alineacion y seguridad: el modelo sirve como caso de estudio para medir como la ablacion de direcciones afecta al comportamiento (divergencia KL de 0,0060 y 9/100 rechazos), comparandolo con el modelo original.
- Evaluacion de tecnicas de abliteration: permite reproducir y auditar el metodo ARA de Heretic sobre un transformer de 2B, comparando capas objetivo (18-21) y sus efectos.
- Prototipado en edge y dispositivos locales: con 2,5 mil millones de parametros y pesos de ~5 GB, cabe en GPU de consumo y en hardware integrado, util para asistentes offline que no dependan de la nube.
- Agentes y automatizacion de tareas con tool calling: el etiquetado de tool-calling y los datasets SFT-Agent / RL lo hacen adecuado para pipelines de agentes que consultan APIs o ejecutan acciones multi-paso.
- Generacion de codigo asistida en entornos locales: su tamano permite integracion en editores y entornos sin conexion, aunque conviene validar la calidad frente al modelo base sin abliteration.
- Procesamiento de documentos largos en ingles o chino: el soporte de contexto largo permite resumir o extraer informacion de documentos extensos en despliegues con recursos limitados.
- Fine-tuning y destilacion sobre una base permisiva: util para investigadores que necesiten una base sin rechazos sobre la que aplicar tecnicas adicionales de ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible para esta variante especifica. La unica tabla de rendimiento proporcionada por el autor corresponde a las metricas de abliteration, que se reproducen a continuacion.

| Metrica | Este modelo | Modelo original (openbmb/MiniCPM5-2B) |
|---|---|---|
| Divergencia KL | 0,0060 | 0 (por definicion) |
| Rechazos | 9/100 | 99/100 |

La model card del modelo base menciona que MiniCPM5-2B alcanza SOTA de codigo abierto en la clase 2B y compite con modelos de 4B, pero no se aportan cifras numericas de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en precision de 16 bits (bf16/fp16): en torno a 5 GB para los pesos, cantidad coherente con el tamano de repositorio de 5,0 GB. Hay que anadir memoria para el contexto KV-cache.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 2,5-3 GB.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 1,3-2 GB (no se distribuyen pesos cuantizados en el repositorio; habria que generarlos).
- GPU de consumo: cabe con holgura en RTX 3060 12 GB, RTX 4060 Ti, RTX 4070, RTX 4090 e incluso en GPUs con 6-8 GB de VRAM en cuantizacion.
- GPU de centro de datos: A100, H100, L40S, etc., sobredimensionadas para el tamano, pero utiles para servir muchas peticiones en paralelo.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (etiqueta text-generation-inference presente), endpoints compatibles, vLLM y llama.cpp/Ollama si se generan pesos GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Comportamiento |
|---|---|---|---|---|---|
| dalatexcoder/MiniCPM5-2B-heretic-ara | ~2,5 B (denso) | no disponible (long-context) | apache-2.0 | en, zh | Abliterated, 9/100 rechazos |
| openbmb/MiniCPM5-2B | ~2,5 B (denso) | no disponible (long-context) | apache-2.0 | en, zh | Alineado, 99/100 rechazos |
| openbmb/MiniCPM5-1B | ~1 B (denso) | no disponible | apache-2.0 | en, zh | Alineado |

Las cifras de rendimiento comparativo entre estos modelos (mas alla de la tabla de rechazos y divergencia KL) no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo sin censura: la abliteration elimina la mayor parte de los rechazos (9/100), lo que implica que puede generar contenido ofensivo, ilegal, peligroso o inexacto. No es apto para despliegues publicos sin moderacion adicional.
- Riesgo de alucinacion: al ser un modelo de 2,5 mil millones de parametros, su tendencia a inventar datos es mayor que la de modelos de mayor tamano; conviene verificar cualquier salida factual.
- Idiomas limitados: solo ingles y chino declarados; el rendimiento en castellano u otros idiomas no esta garantizado.
- Longitud de contexto no confirmada: aunque se etiqueta como long-context, no se especifica el numero exacto de tokens, por lo que no se puede planificar el uso con documentos extensos sin comprobacion empirica.
- Divergencia respecto al original: aunque la divergencia KL es baja (0,0060) y las capas afectadas son concretas (18-21), la intervencion puede degradar sutilmente capacidades de razonamiento, seguridad o coherencia. Conviene evaluar antes de usarlo en produccion.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias y la responsabilidad del uso recae en el desplegador. La licencia del modelo base debe respetarse igualmente.
- Trazabilidad y mantenimiento: el repositorio tiene 0 likes y 184 descargas, y fue creado y actualizado el mismo dia (2026-10-07); es un artefacto reciente sin validacion externa conocida.
- Consideraciones legales y eticas: en la Union Europea, el uso de modelos sin filtros puede entrar en conflicto con obligaciones de moderacion de contenido segun el contexto de aplicacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dalatexcoder/MiniCPM5-2B-heretic-ara
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- MiniCPM5-1B: https://huggingface.co/openbmb/MiniCPM5-1B
- Heretic (herramienta de abliteration): https://github.com/p-e-w/heretic
- Pull request del metodo ARA: https://github.com/p-e-w/heretic/pull/211
- MiniCPM Tech Report (arXiv 2506.07900): https://arxiv.org/pdf/2506.07900
- Referencia arXiv 2602.09003 (citada en las etiquetas del repositorio): https://arxiv.org/abs/2602.09003
- Repositorio GitHub de MiniCPM: https://github.com/OpenBMB/MiniCPM
- Wiki de MiniCPM (chino): https://modelbest.feishu.cn/wiki/UtWxwcERfiRIpIkBOjuc3h9tn1D
- UltraData: https://ultradata.openbmb.cn/
- Demo online del modelo base: https://huggingface.co/spaces/openbmb/MiniCPM5-2B-Demo
- Radar de modelos heretic/abliterated (resultado de busqueda): https://modelheretic.com/
