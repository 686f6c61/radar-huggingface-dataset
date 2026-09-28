# Fenomen-Alex/ukrainian-municipal-accountability-qwen3-8b

## Resumen

`Fenomen-Alex/ukrainian-municipal-accountability-qwen3-8b` es un ajuste fino de Qwen3-8B (8.190.735.360 parámetros) publicado por el usuario Fenomen-Alex cuyo único cometido es convertir una queja municipal ucraniana en texto libre en un objeto JSON estructurado con un array de temas. Cada tema contiene exactamente cinco claves (`domain`, `issue`, `object`, `requested_action`, `attributes`) y el campo `domain` está restringido a un vocabulario cerrado de 13 valores: `benefits`, `commerce`, `construction`, `electricity`, `government`, `heating`, `housing`, `other`, `payments`, `roads`, `sanitation`, `transport` y `water`. El problema que aborda es el de la descomposición multi-tema: una queja ciudadana real suele mezclar varios asuntos en un mismo mensaje y este modelo los separa en entradas independientes.

Técnicamente es un LoRA de rango 8 (alpha 20, dropout 0) aplicado sobre `mlx-community/Qwen3-8B-4bit` y fusionado posteriormente en los pesos base, por lo que el repositorio contiene un `safetensors` autocontenido y no requiere un adaptador PEFT en tiempo de carga. La cuantización es de 4 bits con group size 64 y el repo ocupa 4,6 GB. El entrenamiento se realizó sobre 8.519 ejemplos bajo un esquema de weak supervision: las etiquetas son una aproximación débil, no una clasificación autoritativa.

Su relevancia actual es doble. Por un lado, es un caso de uso muy concreto de extracción estructurada sobre texto administrativo en un idioma con pocos recursos como el ucraniano. Por otro, documenta de forma inusualmente explícita su contrato de servicio: el modelo es extremadamente sensible al formato exacto del prompt y produce salidas degeneradas si se sirve con un system prompt parafraseado o con el modo thinking activado, un modo de fallo que conviene conocer antes de desplegarlo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen3) con LoRA fusionado en los pesos base |
| Parámetros totales | 8.190.735.360 (~8,19 B) |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no especificada en la model card; el modelo base Qwen3-8B soporta 32.768 tokens nativos y el entrenamiento se limitó a 2.048 tokens |
| Tipos de cuantización | 4 bits, group size 64 (MLX). No hay versiones GGUF, AWQ ni GPTQ publicadas |
| Idiomas soportados | ucraniano (uk); entrada en ucraniano, salida JSON en ucraniano |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), 907 tensores, 4.607.731.712 bytes en disco |

## Arquitectura y entrenamiento

El modelo parte de `mlx-community/Qwen3-8B-4bit`, una conversión a 4 bits del Qwen3-8B denso para el framework MLX de Apple. Sobre esa base se aplicó un LoRA con rango 8, alpha 20 y dropout 0,0, adaptando 16 módulos de las capas del decodificador 20 a 35 (224 tensores). El entrenamiento duró 800 iteraciones con batch 2 y acumulación de gradiente 2 (batch efectivo 4), optimizador AdamW con learning rate 1e-4, longitud máxima de secuencia 2.048, gradient checkpointing desactivado y semilla 42. Los tokens del prompt se enmascararon en la función de pérdida, de modo que el modelo solo aprende a generar la parte de respuesta. Posteriormente el adaptador se fusionó en los pesos base, eliminando la dependencia de PEFT.

El conjunto de datos tiene 8.519 ejemplos de entrenamiento y combina dos componentes: 5.384 ejemplos mono-tema de la versión v1 y 3.135 ejemplos de aumentación multi-tema. De estos últimos, solo 264 son descomposiciones reales (reescaladas por un factor de 12) y 2.871 son sintéticos (factor 3), lo que supone que el 97,75 % de la aumentación multi-tema es generada artificialmente. La cobertura de dominios en ese subconjunto está sesgada (`sanitation` 567, `roads` 347, `water` 293), porque el generador sintético no está balanceado por dominio. Los conjuntos de validación (1.124 ejemplos) y test (329 ejemplos) están congelados entre iteraciones y se verificó que no hay solapamiento con el conjunto de entrenamiento ni con el conjunto multi-tema.

La innovación destacable no está en la arquitectura, sino en el contrato de servicio documentado. La plantilla de chat que se debe usar incluye un bloque `<think>\n\n</think>` vacío como prefijo de la respuesta del asistente, y el modelo fue entrenado para emitir ese bloque vacío seguido del JSON. Cualquier plantilla que inyecte razonamiento real, parafrasee el system prompt o cambie el prefijo rompe el modelo.

## Capacidades

- Extracción estructurada: convierte una queja municipal en texto libre a un objeto JSON con un array `topics` y cinco claves por tema (`domain`, `issue`, `object`, `requested_action`, `attributes`).
- Descomposición multi-tema: separa quejas que mezclan varios asuntos en entradas de tema independientes.
- Clasificación en vocabulario cerrado: asigna cada tema a uno de los 13 dominios predefinidos.
- Salida consumible por máquina: tasa de parseo JSON de 1.000 y validez de esquema de 0.997 sobre el conjunto de test congelado (n=329).
- Generación de texto conversacional: la pipeline declarada es `text-generation` con `library_name: mlx`, aunque el uso previsto es la extracción, no el diálogo abierto.
- Uso mono-idioma: entrada y salida en ucraniano; no hay evidencia de soporte multilingüe.
- Tool calling / function calling: no disponible.
- Uso como agente o razonamiento multi-paso: no es una capacidad del modelo; de hecho, el modo thinking debe estar desactivado.
- Capacidades especiales: ninguna más allá del bloque `<think>` vacío obligatorio; no hay visión ni audio.

## Casos de uso

- Enrutado automático de quejas ciudadanas: el modelo asigna cada tema extraído a uno de los 13 dominios, lo que permite dirigir el ticket de forma automática al departamento municipal correspondiente (carreteras, agua, saneamiento, suministros) sin intervención manual.
- Descomposición de quejas multi-asunto: una sola reclamación puede mencionar a la vez un problema de alcantarillado y otro de alumbrado; el modelo genera una entrada independiente por tema, lo que evita perder incidencias en correos o formularios mal estructurados.
- Cuadros de mando y priorización de obra pública: al persistir la salida JSON en una base de datos relacional se pueden agregar recuentos por `domain` y por barrio, y priorizar inversiones donde se concentran las quejas de `roads` o `water`.
- Extracción de entidades para sistemas de información municipal: el campo `object` y `attributes` permiten capturar direcciones o elementos concretos citados en el texto libre, útiles para cruzar la queja con el inventario de activos del ayuntamiento.
- Preprocesamiento de atención al ciudadano: integrado como primer paso de un pipeline mayor (el JSON alimenta después un sistema de respuesta o una herramienta de gestión de casos), reduce el trabajo de triaje humano sobre texto no normalizado.
- Investigación en weak supervision: al publicar el esquema de etiquetado débil y el conjunto de verificación, sirve como referencia reproducible para estudiar la calidad de etiquetas generadas automáticamente en dominios administrativos.
- Monitorización de tendencias por dominio: la serie temporal de temas extraídos permite detectar picos anómalos en `sanitation` o `heating` (por ejemplo, tras una avería o una ola de frío) y activar alertas operativas.
- Anonimización y normalización previa: la conversión a JSON estructurado facilita separar lo que es texto libre identificable de los campos categóricos antes de compartir datos entre administraciones.

## Benchmarks y rendimiento

Resultados sobre el conjunto de test congelado (n=329), según la model card:

| Métrica | Valor |
|---|---|
| Tasa de parseo JSON | 1.000 |
| Validez de esquema | 0.997 |
| Exactitud de dominio | 0.839 |
| Resto de métricas | no disponible (la model card está truncada en la información proporcionada) |

Pruebas de contrato de servicio: 9/9 casos superados tanto en MLX nativo como en un servidor HTTP de LM Studio, sobre tres quejas reportadas, dos casos de humo del repositorio y cuatro casos construidos mono y multi-tema. La suite completa registra 251 superados y 1 omitido. MLX nativo y el servidor LM Studio produjeron texto idéntico en solo 5 de 9 casos, con diferencias confinadas a campos marginales (`object` y una palabra dentro de un `issue`); el contrato de servicio se mantiene en ambas rutas, por lo que se atribuye a variación numérica entre runtimes.

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) ni comparaciones con otros modelos en esta tarea.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: los pesos 4-bit ocupan 4,6 GB en disco; hay que añadir la caché KV. En la práctica requiere del orden de 5 a 7 GB de memoria unificada o VRAM para lotes pequeños con prompts cortos.
- GPU: los pesos están en formato MLX, que solo se ejecuta de forma nativa en Apple Silicon. En NVIDIA (A100, H100, RTX 4090, etc.) sería necesario convertir los pesos a otro formato, algo que no está publicado ni documentado en la model card.
- Consumer GPU: no directamente con los pesos tal cual, al ser MLX. Equivalente en otros formatos cabría en GPUs con 8-12 GB de VRAM, pero no hay conversión oficial disponible.
- Apple Silicon: encaja en cualquier Mac con memoria unificada de 8 GB o superior, ya que el repo completo son 4,6 GB.
- Opciones de despliegue: `mlx-lm`, LM Studio (cargando el modelo, pegando el system prompt exacto, thinking desactivado, temperatura 0 y límite de 800 tokens) y cualquier servidor compatible con la API de OpenAI que sirva pesos MLX. La model card menciona vLLM y TGI, pero estos normalmente no consumen pesos MLX, por lo que su uso exigiría una conversión previa no documentada.
- Latencia y throughput: no disponible.
- Parámetros de ejecución obligatorios: `temperature=0.0`, `max_tokens=800`, `enable_thinking=false` y la plantilla `chat_template.jinja` incluida en el repositorio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| Este modelo (fine-tune v2) | 8,19 B | 2.048 tokens de entrenamiento (base: 32.768) | Apache 2.0 | safetensors MLX 4-bit | Extracción JSON de quejas municipales ucranianas |
| `mlx-community/Qwen3-8B-4bit` (base) | 8,19 B | 32.768 tokens | Apache 2.0 | safetensors MLX 4-bit | Modelo generalista; no produce el esquema JSON sin ajuste |
| Otros fine-tunes de extracción estructurada en ucraniano | no disponible | no disponible | no disponible | no disponible | no disponible en la información proporcionada |

No se dispone de datos de benchmarks comparativos frente a alternativas, ni de modelos directamente equivalentes en la misma tarea e idioma en la información consultada.

## Limitaciones y advertencias

- Etiquetas débiles: la propia model card advierte de que la carga útil es una aproximación por weak supervision, no una clasificación autoritativa; no debe usarse como fuente de verdad administrativa.
- Sensibilidad extrema al prompt: el modelo exige un system prompt byte a byte idéntico al de `build_dataset.py`, `enable_thinking=false`, `temperature=0.0`, `max_tokens=800` y la plantilla `chat_template.jinja` incluida. Cualquier paráfrasis, plantilla genérica o razonamiento activado produce salidas degeneradas (signos `!` literales, prosa repetida, markdown irrelevante).
- No se debe reparar la salida con expresiones regulares que busquen `{...}`: según el autor, esto oculta el problema en vez de corregirlo.
- Exactitud de dominio del 0.839 sobre un test de solo 329 ejemplos, lo que implica un margen de error apreciable y un tamaño de muestra reducido.
- Sesgo de dominio en el entrenamiento: el 97,75 % de la aumentación multi-tema es sintética y la cobertura está desequilibrada (por ejemplo, `sanitation` 567 frente a otros dominios con muchas menos muestras). Los dominios poco representados rendirán peor.
- Riesgo de alucinación en `requested_action`: el propio verificador comprueba que no se fabrique este campo, lo que indica que el modelo puede inventar acciones solicitadas que no aparecen en la queja original.
- Ventana de entrenamiento de 2.048 tokens: las quejas largas pueden truncarse y perder los últimos temas mencionados.
- Mono-idioma: solo ucraniano. No hay evidencia de transferencia a otras lenguas, ni siquiera al ruso, pese a la proximidad estructural.
- Variación numérica entre runtimes: MLX nativo y el servidor LM Studio solo produjeron texto idéntico en 5 de 9 casos, con diferencias en campos marginales.
- Formato MLX: no hay versiones GGUF ni compatibilidad directa con vLLM, TGI o llama.cpp, lo que limita el despliegue fuera del ecosistema Apple.
- Licencia Apache 2.0, que permite uso comercial, pero hereda las condiciones del modelo base Qwen3-8B, también Apache 2.0. No hay cláusulas específicas adicionales en la información disponible.
- Para producción: no se han publicado datos de latencia, throughput ni comportamiento bajo carga concurrente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Fenomen-Alex/ukrainian-municipal-accountability-qwen3-8b
- Modelo base: https://huggingface.co/mlx-community/Qwen3-8B-4bit
- Repositorio del proyecto: https://github.com/Fenomen-Alex/ukrainian-municipal-accountability
- Script de construcción del dataset: https://github.com/Fenomen-Alex/ukrainian-municipal-accountability/blob/master/ml/tune/build_dataset.py
- Contrato de servicio v2: https://github.com/Fenomen-Alex/ukrainian-municipal-accountability/blob/master/ml/tune/V2_SERVING.md
- Cargador de referencia: https://github.com/Fenomen-Alex/ukrainian-municipal-accountability/blob/master/ml/tune/serve_v2.py
- Script de verificación: https://github.com/Fenomen-Alex/ukrainian-municipal-accountability/blob/master/ml/tune/verify_v2.py
