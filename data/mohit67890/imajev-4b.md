# mohit67890/imajev-4b

## Resumen

imajev-4b es un adaptador LoRA (libreria `peft`) sobre el modelo base Qwen/Qwen3.5-4B, publicado por el usuario mohit67890, orientado a un caso de uso muy concreto: tomar decisiones tipadas a partir de imagenes y texto. No es un modelo conversacional generalista, sino un "decision model" que recibe una peticion con imagenes junto a un registro de datos del negocio y devuelve una de las opciones predefinidas por el desarrollador, acompanada de una probabilidad calibrada y de una opcion explicita de `unknown` (no se puede determinar). El pipeline declarado es `image-text-to-text` y la libreria es `peft`, con pesos en safetensors y licencia Apache-2.0.

El modelo forma parte de una familia con tres tamanos (imajev-2b, imajev-4b, imajev-9b); el 4b es el tamano recomendado por el autor. Segun la model card, es el unico tamano entrenado en la fase 3 ("hard-data") y obtiene un 83,9% en ImajevBench frente al 82,1% del 9B con menos de la mitad del tamano. Se apoya en el contrato de peticion/respuesta de TypeSafe Jev (`POST /v1/systemone`), al que anade los campos `images`, `unknown_probability` y `abstained`.

Su relevancia actual esta en el nicho de la verificacion automatica con abstención: en lugar de forzar siempre una respuesta, permite que el sistema actue solo cuando la confianza es alta y derive el resto a una persona. El autor lo posiciona primero de 91 modelos en JevBench v1.4.2.2 y tercero de 56 en DecisionBench (eng, v1), por delante de modelos mucho mayores. El idioma declarado es unicamente ingles y el repositorio ocupa 1,5 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen/Qwen3.5-4B (base vision-lenguaje; arquitectura interna del base no disponible en la informacion proporcionada) |
| Parametros totales | Base de ~4B (Qwen3.5-4B); numero exacto de parametros del adaptador no disponible |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible; limite de estado declarado de 32 KB |
| Tipos de cuantizacion | no disponible (se menciona despliegue en MLX y PyTorch, sin detallar cuantizaciones) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

imajev-4b no es un modelo entrenado desde cero, sino un adaptador LoRA publicado con la libreria `peft` que se aplica sobre el modelo base Qwen/Qwen3.5-4B. La eleccion del formato LoRA implica que el repositorio (1,5 GB) contiene los pesos del adaptador y no los pesos completos del base. El pipeline declarado es `image-text-to-text`, por lo que el conjunto base aporta la capacidad de vision-lenguaje sobre la que el adaptador especializa la tarea de decision. Los detalles de la arquitectura interna del base (tipo de transformer, atencion, tokenizador) no estan disponibles en la informacion proporcionada.

En cuanto al entrenamiento, la model card indica que el modelo se entreno sobre 72.000 decisiones del tipo "foto contra registro" y "dos fotos, una decision". Ademas, imajev-4b es el unico tamano de la familia entrenado en la fase 3 ("hard-data"). La innovacion tecnica central es la presencia de una probabilidad calibrada para cada opcion, incluida la opcion `unknown`, de modo que la respuesta incorpora una medida de incertidumbre explotable por el sistema anfitrion. No se especifican en la informacion disponible datos sobre uso de RLHF, DPO ni decodificacion especulativa.

## Capacidades

- Decision tipada sobre imagenes: lee una fotografia y la contrasta con campos de un registro del negocio, senalando cual de los campos no concuerda (por ejemplo, `listing.color`).
- Decision con dos imagenes en la misma peticion: compara una referencia con un objetivo (enviado contra devuelto, pieza conocida contra la que esta en la linea), segun la model card.
- Salida con probabilidades calibradas por opcion, no solo la etiqueta ganadora.
- Abstención entrenada: asigna una probabilidad a `unknown` y expone el campo `abstained`, de modo que el sistema puede detenerse en lugar de adivinar.
- Integracion mediante el contrato Jev/TypeSafe (`POST /v1/systemone`), ampliado con los campos `images`, `unknown_probability` y `abstained`.
- Despliegue local, con MLX en Mac o PyTorch en una sola GPU, segun la model card.
- Tool calling, function calling, agentes multi-paso, audio y modo "thinking" no estan declarados en la informacion proporcionada.
- Capacidad multilingue: no declarada; el idioma soportado es unicamente ingles.

## Casos de uso

- Verificacion de anuncios de e-commerce: dado un listado con campos como color o modelo y una foto del producto, el modelo senala que campo no coincide con la imagen, con una probabilidad asociada, y el sistema puede retener el anuncio cuando la confianza es alta.
- Control de calidad en devoluciones: comparar la foto de referencia del producto con la foto del articulo devuelto para decidir si coinciden, aceptando automaticamente los casos claros y escalando los dudosos a una persona.
- Inspeccion en linea de fabricacion: contrastar la foto de una pieza patron contra la pieza que llega a la linea, con la opcion de abstención cuando la imagen no permite decidir.
- Tramitacion de siniestros o expedientes con documentacion fotografica: leer una foto y contrastarla con los campos ya registrados para detectar discrepancias antes de aprobar.
- Auditoria de catalogos: revisar de forma masiva imagenes y fichas ya existentes para detectar incoherencias entre lo declarado y lo mostrado, usando la probabilidad calibrada como criterio de umbral.
- Clasificacion de casos con abstención en flujos regulados: usar el campo `unknown_probability` para definir un umbral de derivacion a revision humana, manteniendo los datos y las fotos dentro de la red local gracias al despliegue on-premise.
- Integracion en un backend existente compatible con Jev/TypeSafe: al reutilizar el contrato `POST /v1/systemone`, se puede sustituir el adaptador por otro tamano de la familia sin cambiar la peticion, segun la model card.

## Benchmarks y rendimiento

Segun los datos recogidos en la model card (capturas de los leaderboards oficiales fechadas el 28 de septiembre de 2026):

JevBench v1.4.2.2 (Composite Score, puntuado el 27 de septiembre de 2026):

| Posicion | Modelo | Puntuacion |
|---|---|---|
| 1 | Imajev-4B | 67,4 |
| 2 | Plumb-4B | 65,8 |
| 3 | decider-4b v2 | 64,1 |
| 4 | Jev 1.13.0 | 63,3 |

DecisionBench (eng, v1):

| Posicion | Modelo | Puntuacion |
|---|---|---|
| 1 | bosun-v3.1-1.7b | 87,29 |
| 2 | bosun-v3.1-0.6b | 83,20 |
| 3 | imajev-4b | 79,65 |

El autor indica que imajev-4b queda por delante de GLM-5.3 Flash (320B), Jev 1.13, DeepSeek V4.1 Flash (552B) y GPT-5.6 Luna en DecisionBench, y que los dos modelos situados por encima son los propios modelos del equipo que mantiene el benchmark. En ImajevBench, la model card atribuye a imajev-4b un 83,9% frente al 82,1% de imajev-9b. No se proporcionan resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- Repositorio de 1,5 GB (solo el adaptador LoRA; requiere ademas los pesos del base Qwen/Qwen3.5-4B).
- La model card indica que puede ejecutarse en MLX sobre un Mac o en PyTorch sobre una unica GPU.
- Latencia declarada: 1,15 s en un Mac Studio, promediando cuatro ordenes de opciones y con el fichero de calibracion aplicado.
- Consumo de VRAM: no disponible de forma explicita. A modo de orientacion general para un base de ~4B, la inferencia en precision completa ronda los 8-9 GB y en cuantizaciones de 4 bits puede bajar a unos 2,5-3 GB; son estimaciones derivadas del tamano del base, no datos publicados por el autor.
- GPU recomendadas: no disponibles en la informacion proporcionada; el autor solo menciona "una GPU" en PyTorch, sin concretar modelo.
- Cabida en GPU de consumo: no confirmado explicitamente por el autor; por el tamano del base (4B) seria previsible en GPUs de consumo con VRAM suficiente, sujeto a verificacion.
- Opciones de despliegue: MLX (Mac) y PyTorch (GPU unica). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | JevBench v1.4.2.2 | DecisionBench (eng, v1) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| imajev-4b | base ~4B (LoRA) | no disponible (limite de estado 32 KB) | 67,4 | 79,65 | Apache-2.0 | HuggingFace + demo en Spaces |
| Plumb-4B | no disponible | no disponible | 65,8 | no disponible | no disponible | no disponible |
| decider-4b v2 | no disponible | no disponible | 64,1 | no disponible | no disponible | no disponible |
| Jev 1.13.0 | no disponible | 32k tokens (solo texto, alojado) | 63,3 | no disponible | no disponible | no disponible |
| bosun-v3.1-1.7b | ~1,7B | no disponible | no disponible | 87,29 | no disponible | no disponible |
| bosun-v3.1-0.6b | ~0,6B | no disponible | no disponible | 83,20 | no disponible | no disponible |

La informacion disponible solo permite comparar estos modelos por puntuacion en los dos benchmarks citados. Para el resto de campos (parametros, contexto, licencia, disponibilidad) de los competidores no hay datos en la informacion proporcionada. Cabe notar que Jev 1.13.0 es un modelo solo de texto y alojado, mientras que imajev anade imagenes y despliegue local.

## Limitaciones y advertencias

- Modelo especializado: no es un modelo de proposito general. Esta disenado para decisiones tipadas con opciones predefinidas; su uso fuera de ese contrato puede no dar resultados utiles.
- Idioma: soporta unicamente ingles segun la informacion disponible, lo que limita su uso directo en castellano u otros idiomas.
- Ambito de dominio: se entreno sobre 72.000 decisiones de "foto contra registro" y "dos fotos"; el rendimiento en otros tipos de tarea visual no esta validado en la informacion disponible.
- Riesgo de alucinacion: aunque el modelo expone probabilidades calibradas y una opcion `unknown`, no se documentan tasas de error fuera de los benchmarks citados; conviene aplicar umbrales sobre `unknown_probability` en produccion.
- Abstención frente a precision: la opcion `unknown` reduce los errores por respuesta forzada, pero puede aumentar la carga de revision humana; el umbral debe ajustarse por caso.
- Limite de estado: el limite declarado es de 32 KB para imajev, inferior a los 32k tokens de contexto de Jev, lo que restringe el tamano del registro o del material adjunto por peticion.
- Licencia: Apache-2.0, permisiva para uso comercial. Se recomienda revisar la licencia del modelo base Qwen/Qwen3.5-4B, que puede imponer condiciones adicionales.
- Procedencia y madurez: el repositorio tiene 64 descargas y 4 "likes" en la informacion proporcionada; es un artefacto con poca adopcion verificable.
- Datos de benchmark de terceros: las cifras de JevBench y DecisionBench proceden de capturas de leaderboards citadas por el autor, con fechas de septiembre de 2026; conviene contrastarlas directamente en las fuentes antes de tomarlas como referencia de produccion.
- Dependencia del base: al ser un adaptador LoRA, el comportamiento final depende del modelo base Qwen3.5-4B y de la correcta aplicacion del adaptador y del fichero de calibracion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mohit67890/imajev-4b
- Demo en vivo (Spaces): https://huggingface.co/spaces/mohit67890/imajev
- Codigo y resultados (GitHub): https://github.com/mohit67890/imajev
- Web del proyecto: https://mohit67890.github.io/imajev/
- Informe tecnico: https://mohit67890.github.io/imajev/report/
- Benchmark ImajevBench (dataset): https://huggingface.co/datasets/mohit67890/imajev-bench
- Leaderboard JevBench v1.4.2.2: https://benchmarkheaven.com/jev-models
- Leaderboard DecisionBench (eng, v1): https://huggingface.co/spaces/Hanno-Labs/decision-bench-leaderboard
- Variante 2B: https://huggingface.co/mohit67890/imajev-2b
- Variante 9B: https://huggingface.co/mohit67890/imajev-9b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
