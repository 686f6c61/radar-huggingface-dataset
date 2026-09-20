# jayzou3773/less-is-moe-qwen3.5-122b-a10b-gpqa-main-64-intdim-l-50

## Resumen

Este checkpoint es una versión podada estructuralmente del modelo Qwen/Qwen3.5-122B-A10B, un transformer de mezcla de expertos (MoE) de solo texto. Lo publica el usuario jayzou3773 en HuggingFace, con licencia apache-2.0, etiqueta de pipeline `text-generation` y arquitectura declarada `qwen3_5_moe_text`. La ficha se creó el 20 de septiembre de 2026 y acumula 141 descargas y 0 "likes".

La poda se ha realizado con el método Less-is-MoE (mean-absolute-gradient), que elimina exactamente el 50 % de las neuronas FFN de los expertos enrutados a partir de 64 muestras de calibración extraídas de la configuración `gpqa_main` del dataset GPQA. El resultado pasa de los 122 000 millones de parámetros del modelo base a 64 129 468 416 parámetros totales verificados en safetensors, lo que reduce el repositorio a 128,3 GB en BF16.

Su interés práctico es doble: por un lado, sirve como artefacto de investigación reproducible para estudiar el compromiso entre tamaño y calidad en arquitecturas MoE; por otro, permite desplegar un MoE grande con aproximadamente la mitad de la huella de memoria del original. El coste es una dependencia fuerte de infraestructura: la inferencia exige el plugin vLLM "ragged" de Less-is-MoE, distribuido dentro de una imagen GPU específica, lo que limita las pilas de despliegue compatibles.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE) de solo texto; clase `qwen3_5_moe_text` |
| Parametros totales | 64 129 468 416 (64,13 mil millones), segun safetensors; el modelo base declara 122B |
| Parametros activos | no disponible (el modelo base Qwen3.5-122B-A10B indica ~10B en su nombre; tras podar el 50 % de las neuronas FFN de los expertos enrutados no se publica el valor resultante) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el checkpoint se distribuye en BF16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repositorio de 128,3 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-122B-A10B, un transformer MoE de solo texto. La intervención aplicada es una poda estructural, no un reentrenamiento: se eliminan exactamente el 50 % de las neuronas FFN de los expertos enrutados mediante el método Less-is-MoE basado en la media del valor absoluto del gradiente. Esta variante corresponde a la configuración "IntDim-L", que conserva la topología MoE enrutada y almacena anchos compactos por experto en el `config.json`, frente a "IntDim-E", que usa un ancho de experto uniforme. El checkpoint fuente se cargó y se podó en BF16.

La calibración usó 64 muestras de la configuración `gpqa_main` de `Idavidrein/gpqa` (revisión `633f5ee89ab8ad4522a9f850766b73f62147ffdd`), con los ajustes del cargador publicados: split `train`, campos `Question` (con opciones barajadas) y `Explanation`, `selection_seed=1234`, BF16 y sin paso de optimizador. Las muestras se usaron a longitud completa, sin `max_length`, truncado ni relleno; la entrada más larga para este tokenizador fue de 1 632 tokens. No se documenta ningún ajuste posterior a la poda, ni RLHF, DPO u otro tipo de alineamiento.

Para la reproducibilidad, el autor publica el hash de selección de filas de origen (`790c4c22309def44542965fdde7c5f38f1d8e354602640cfb31518134b8d92e6`), el hash del fichero de tokens específico del modelo (`4cecf02da096c0d1c1f8f01bbdf8867186ab3064eccbfbb34cd9c16a89564d62`) y los metadatos completos de exportación y equivalencia con máscara cero en `experiment-export.json`. Las filas exactas de calibración y de test reservado están en el dataset privado `jayzou3773/less-is-moe-gpqa-main-calibration-64`, sujeto a los términos de acceso de GPQA.

## Capacidades

- Generación de texto: es la tarea declarada en el pipeline (`text-generation`).
- Conversación: la etiqueta `conversational` está presente en el repositorio, aunque no se detalla el formato de plantilla ni el historial de ajuste conversacional.
- Procesamiento de preguntas de opción múltiple con explicación: el método de calibración utilizó pares pregunta/opciones/explicación de GPQA, aunque esto no constituye una evaluación publicada de la capacidad del modelo.
- Modalidad: únicamente texto; la clase de arquitectura es `qwen3_5_moe_text`.
- Tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información disponible.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (modo "thinking", visión, audio): no documentadas.
- Operación con expertos de ancho heterogéneo: requiere el plugin vLLM "ragged" para poder ejecutarse.

## Casos de uso

- Investigación en poda de redes MoE: el checkpoint permite reproducir y auditar el método Less-is-MoE comparando sus salidas con las del modelo original de 122B; los hashes publicados y el `experiment-export.json` con la equivalencia de máscara cero están pensados precisamente para replicar el experimento.
- Estudio del compromiso tamaño/calidad: al conservar la topología enrutada con anchos por experto, sirve como punto de medida para cuantificar cuánta calidad se pierde al recortar un 50 % de neuronas FFN, siempre que el investigador genere su propia evaluación, ya que el autor no publica benchmarks.
- Servicio de generación de texto autoalojado: con la imagen GPU unificada de Less-is-MoE y el plugin vLLM ragged, el modelo se puede exponer como endpoint de inferencia con unos 128 GB de pesos BF16 repartidos entre varias GPU.
- Generación por lotes sobre corpus internos: resumen, reescritura, extracción de entidades y clasificación de documentos en procesos offline donde la latencia no es crítica y se aprovecha que solo una fracción de los parámetros se activa por token.
- Base para ajuste fino posterior a la poda: si la organización dispone de clúster para entrenar un modelo de 64B, este checkpoint reduce el coste de un ajuste específico de dominio respecto al original de 122B; el autor no documenta ningún ajuste de este tipo, por lo que sería trabajo propio.
- Banco de pruebas de infraestructura: útil para medir en condiciones reales el efecto de la poda sobre el tráfico de memoria y el throughput en MoE, comparando con el modelo base en el mismo hardware.
- Evaluación de calidad en razonamiento científico: se puede usar para tareas del estilo GPQA, pero con la advertencia explícita de que 64 muestras de `gpqa_main` se emplearon en la calibración y cualquier resultado en ese conjunto estará contaminado.
- Experimentos de destilación y generación de datos sintéticos: su menor huella frente al modelo base permite usarlo como generador de datos en pipelines internos, asumiendo que no hay ninguna garantía publicada sobre la calidad de sus salidas tras la poda.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no incluye métricas de MMLU, HumanEval, GSM8K, GPQA ni de ningún otro conjunto en la model card, y no se han encontrado evaluaciones externas. Las 64 muestras de `gpqa_main` citadas se usaron exclusivamente como calibración del método de poda, no como conjunto de evaluación.

## Requisitos de hardware

- VRAM para inferencia en BF16: unos 128,3 GB solo para pesos (64,13B × 2 bytes, cifra que coincide con el tamaño del repositorio), más caché KV y activaciones. Se necesita bastante más de 128 GB de VRAM agregada.
- Configuraciones mínimas prácticas: 2× H100 80 GB, 2× A100 80 GB o 2× H200; alternativas de gama inferior como 4× A100 40 GB o 4× L40S 48 GB también cubren los pesos, con menos margen para caché KV y contexto largo.
- GPU de consumo: no cabe en ninguna. Una RTX 4090 (24 GB) o una RTX 5090 (32 GB) quedan muy lejos, e incluso 4× RTX 4090 (96 GB) no bastarían para BF16.
- Cuantización: no hay cuantizaciones publicadas. Generar GGUF, AWQ o GPTQ requeriría herramientas que respeten los anchos por experto almacenados en `config.json`, algo que las pilas habituales no soportan de serie.
- Opciones de despliegue: la model card indica que la inferencia requiere el plugin vLLM "ragged" de Less-is-MoE incluido en la imagen GPU unificada del proyecto. No se documenta compatibilidad con llama.cpp, Ollama, TGI ni con vLLM estándar.
- Latencia y throughput: no disponibles. Como referencia estructural, el modelo base activa aproximadamente 10B parámetros por token, por lo que el coste computacional por token es moderado, mientras que el requisito de memoria es el factor limitante.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad y requisitos |
|---|---|---|---|---|---|
| Este checkpoint (less-is-moe-qwen3.5-122b-a10b-gpqa-main-64-intdim-l-50) | 64,13B | no disponible | no disponible | apache-2.0 | Safetensors; exige el plugin vLLM ragged de Less-is-MoE |
| Qwen/Qwen3.5-122B-A10B (modelo base) | 122B | ~10B (segun la denominacion del modelo) | no disponible | no confirmada en la informacion disponible | Safetensors; ejecutable en pilas vLLM habituales sin plugin especial |
| Otras variantes Less-is-MoE (por ejemplo IntDim-E o IntDim-G) | no disponible | no disponible | no disponible | no disponible | El autor las menciona en la model card, pero no se aportan enlaces, descargas ni metricas |
| Alternativas MoE de terceros del mismo orden de tamano | no disponible | no disponible | no disponible | no disponible | No se ha identificado ninguna comparable en la informacion proporcionada |

## Limitaciones y advertencias

- Contaminación de GPQA: las 64 muestras de calibración proceden de `gpqa_main`, de modo que cualquier evaluación sobre ese conjunto estará sesgada a favor del modelo y no es válida como medida de capacidad.
- Ausencia total de benchmarks: no hay ninguna métrica publicada que permita estimar cuánto degrada la poda del 50 % la calidad respecto al modelo base. Cualquier decisión de producción exige una evaluación propia.
- Dependencia de infraestructura específica: la inferencia requiere el plugin vLLM ragged y la imagen GPU unificada de Less-is-MoE, lo que reduce la portabilidad, complica el mantenimiento y añade riesgo de reproducibilidad a largo plazo.
- Estructura no convencional: los anchos por experto son heterogéneos (variante IntDim-L), por lo que las herramientas estándar de cuantización, fusión o conversión de formato probablemente no funcionen sin adaptaciones.
- Sin información sobre sesgos, alucinación o seguridad: no se documentan evaluaciones de sesgo, toxicidad, robustez ni tasas de alucinación.
- Idiomas no documentados: no se especifica qué lenguas soporta ni con qué calidad, ni si la poda ha afectado de forma desigual a idiomas con menos presencia en la calibración.
- Longitud de contexto no documentada: no se puede planificar un caso de uso que dependa de ventanas largas sin verificarlo experimentalmente.
- Posible degradación desigual: la calibración se hizo con un dominio muy concreto (preguntas científicas de opción múltiple); es esperable que el recorte de neuronas afecte de forma distinta a tareas alejadas de ese dominio, aunque no hay datos que lo confirmen.
- Licencia: el checkpoint es apache-2.0, pero conviene verificar los términos del modelo base Qwen/Qwen3.5-122B-A10B y las condiciones de acceso del dataset GPQA, cuyas filas de calibración y test están en un repositorio privado sujeto a los términos de acceso del propio dataset.
- Validación comunitaria mínima: 141 descargas y 0 "likes" en el momento de redactar esta ficha, sin evidencia de uso en producción por terceros.
- Fecha de publicación: el repositorio está fechado el 20 de septiembre de 2026, con la última actualización cinco minutos después de su creación, lo que sugiere que no ha recibido revisiones posteriores.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jayzou3773/less-is-moe-qwen3.5-122b-a10b-gpqa-main-64-intdim-l-50
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-122B-A10B
- Dataset de calibración (privado, requiere acceso): https://huggingface.co/datasets/jayzou3773/less-is-moe-gpqa-main-calibration-64
- Dataset GPQA original: https://huggingface.co/datasets/Idavidrein/gpqa
- Metadatos de exportación y equivalencia con máscara cero: fichero `experiment-export.json` dentro del repositorio del modelo
- Nota sobre la búsqueda web: los resultados obtenidos no guardan relación con el modelo (páginas comerciales de Warhammer), por lo que no se han podido añadir papers, blogs, repositorios de código ni demos adicionales.
