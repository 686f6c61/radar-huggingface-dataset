# dongfangshuo/Dongfangshuo-Qwen3.8-Flash-Next-NSFW

## Resumen

Dongfangshuo-Qwen3.8-Flash-Next-NSFW es un ajuste fino (finetune) del modelo Qwen3.8-Flash-Next, desarrollado por el usuario dongfangshuo y publicado en Hugging Face. Se trata de un modelo de arquitectura MoE (mezcla de expertos) con capacidades de visión, derivado de la familia Qwen, y orientado específicamente a la creación literaria en chino y al roleplay conversacional sin restricciones de contenido (abliterated/uncensored). El modelo base declara 177B parámetros totales con 12B activos por token, aunque el dato real de safetensors en el repositorio es de 179.999.981.459 parámetros.

El modelo resuelve problemas concretos del Qwen3.8-Flash-Next original en tareas de escritura creativa de largo alcance: elimina la tendencia del modelo base a producir frases excesivamente cortas y enumeraciones repetitivas ("报菜名"), evita el uso de eufemismos indirectos para contenido adulto y corrige incoherencias de estado en partidas de rol de larga duración (como conflictos de acciones o mezcla de personalidades de personaje). Está pensado para usuarios que despliegan modelos localmente con llama.cpp o Strata y necesitan un modelo conversacional de gran contexto con capacidades multimodales.

La relevancia actual del modelo radica en su enfoque en contextos extremadamente largos (hasta 100K tokens) para narrativa y roleplay multi-turno, con versiones cuantizadas desde 2 bits (69,7 GB) hasta 16 bits (360 GB). El repositorio acumula 45.902 descargas y 22 likes, y se distribuye bajo una licencia combinada swift-open-license-1.0 y qwen-community-1.0. El modelo está etiquetado exclusivamente para el idioma chino (zh) y marcado como no apto para todas las audiencias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) con encoder de visión; variante qwen4_exp / qwen3.8-flash-next |
| Parametros totales | 179.999.981.459 (dato real de safetensors); el autor declara 177B-A12B |
| Parametros activos | 12B (según model card: 177B-A12B) |
| Longitud de contexto | Hasta 100K+ tokens en pruebas del autor (64K–103K documentados) |
| Tipos de cuantizacion | IQ2_XS, IQ3_XXS, UD-Q4_K_XL, BF16 (16-bit); visión en mmproj BF16 |
| Idiomas soportados | Chino (zh) |
| Licencia | swift-open-license-1.0-and-qwen-community-1.0 (license: other) |
| Formato de pesos | safetensors (BF16, 131 shards), GGUF (IQ2_XS, IQ3_XXS, UD-Q4_K_XL), LoRA checkpoints |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3.8-Flash-Next, una arquitectura transformer de tipo MoE con 177B parámetros totales y 12B activos por token, que incorpora además un encoder de visión para tareas image-text-to-text. El ajuste fino parte de una combinación de modelos base: el Qwen3.8-Flash-Next original, ukisai/Swift1.5-Qwen3.8-Flash-Next, y las variantes abliterated de huihui-ai (Huihui-Qwen3.8-Flash-Next-abliterated y su versión v2-GGUF). El proceso de abliteration elimina los mecanismos de rechazo del modelo original, dando lugar a un modelo sin censura orientado a contenido para adultos.

El entrenamiento se realizó mediante LoRA, con checkpoints intermedios en los pasos 200, 247, 290 y 330, respaldados en el directorio lora_checkpoints (4,7 GB). El autor indica que el backbone de las versiones cuantizadas de 2 y 3 bits emplea una fusión de alta precisión Q8_0, lo que reduce la velocidad de decodificación aproximadamente un 10% respecto al original. No se especifican en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset. El modelo incorpora un modo de razonamiento (chain-of-thought / `<think>`) que el autor considera obligatorio para tareas de planificación narrativa larga, con un presupuesto de razonamiento recomendado de 2048 tokens.

## Capacidades

- Generación de texto creativo en chino: narrativa literaria, novelas de hasta 23.011 caracteres en una sola generación (14.993 tokens) según las pruebas del autor.
- Roleplay conversacional multi-turno sin restricciones de contenido, incluyendo contenido para adultos (R18).
- Razonamiento con cadena de pensamiento (`<think>`), con control del presupuesto de razonamiento (`reasoning_effort`, `reasoning_budget_tokens`).
- Capacidades multimodales de visión: interpretación de imágenes para generar guiones y descripciones (requiere el archivo mmproj-BF16.gguf).
- Razonamiento matemático, físico y lógico: el autor reporta puntuaciones de 96,8/100 en su test de razonamiento cotidiano y prevención de contaminación.
- Generación de código Python (evaluado en el test de razonamiento del autor).
- Coherencia de estado en partidas de rol de larga duración: seguimiento de estados, tiradas de dados y paneles HTML autoconsistentes.
- No se documenta soporte explícito de tool calling ni function calling en la información disponible.
- Capacidades multilingües limitadas: el modelo está etiquetado únicamente para chino (zh).

## Casos de uso

- Escritura de novelas largas en chino: el modelo puede generar capítulos de más de 20.000 caracteres en una sola pasada manteniendo una tasa de repetición del 0,35% según las pruebas del autor, lo que lo hace adecuado para producción literaria asistida con contextos de hasta 100K tokens.
- Roleplay conversacional en plataformas como SillyTavern: el modelo mantiene coherencia de personaje y estado a lo largo de múltiples turnos, con parámetros de muestreo recomendados (temperature 0,68, min_p 0,06, presence_penalty 0,20) que reducen la repetición entre turnos.
- Partidas de rol de texto (跑团) con contexto extenso: con 64K–103K tokens de contexto, el modelo recupera anclas de información lejanas y respeta las tiradas de dados, generando paneles HTML de estado autoconsistentes.
- Generación de guiones y descripciones a partir de imágenes: gracias al encoder de visión (mmproj-BF16), puede analizar imágenes y producir esquemas narrativos estructurados, útil para preproducción de contenido.
- Asistencia a la escritura creativa sin censura: para autores que necesitan contenido adulto sin los eufemismos del modelo base, el ajuste abliterated permite generar directamente escenas explícitas.
- Despliegue local en hardware de consumo: las cuantizaciones IQ3_XXS (77,1 GB) e IQ2_XS (69,7 GB) permiten ejecutar el modelo con 16–32 GB de VRAM más 64 GB de RAM mediante Strata, o con 96–128 GB de RAM usando llama.cpp y UD-Q4_K_XL.
- Investigación sobre alineación y censura: al ser un modelo abliterated, sirve como caso de estudio para comparar comportamientos entre el modelo original y la versión sin restricciones en tareas de razonamiento y creatividad.

## Benchmarks y rendimiento

El autor publica una comparativa de doble ciego entre el modelo original (modelo X) y este ajuste (modelo Y) en cinco conjuntos de prueba propios. No son benchmarks estándar de la industria (MMLU, HumanEval, GSM8K), sino evaluaciones internas de escritura y roleplay.

| Test | Modelo X (original) | Modelo Y (este modelo) | Diferencia |
|---|---|---|---|
| Test 1: esquema a partir de imágenes | 94,5 | 93,2 | -1,3 (gana X) |
| Test 2: novela ultralarga en una pasada | 87,5 | 94,8 | +7,3 (gana Y) |
| Test 3: 5 turnos de DirtyTalk | 86,8 | 95,5 | +8,7 (gana Y) |
| Test 4: razonamiento cotidiano y anti-contaminación | 96,5 | 96,8 | +0,3 (gana Y) |
| Test 5: partida de rol con 64K+ de contexto | 96,8 | 93,5 | -3,3 (gana X) |
| Media aritmética | 92,4 | 94,8 | +2,4 (gana Y) |
| Media ponderada | 93,1 | 94,5 | +1,4 (gana Y) |

El autor reporta además que en el test 2 el modelo generó 23.011 caracteres (14.993 tokens) con una tasa de repetición de 10-gramas del 0,35%, frente a la degradación por repetición del original (9,61%) al superar los 15.000 caracteres. En el test 5, el modelo original mantuvo la etiqueta `<think>` en los 5 turnos y una longitud media de frase de 29,0 caracteres, mientras que este modelo omitió `<think>` en el quinto turno (99K de contexto) y elevó la longitud media de frase a 46+ caracteres en los tres últimos turnos. No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- IQ2_XS (69,7 GB, 2 shards): requiere 12–16 GB de VRAM más 64 GB de RAM, motor Strata.
- IQ3_XXS (77,1 GB, 2 shards, recomendado por el autor): requiere 16–32 GB de VRAM más 64 GB de RAM, motor Strata.
- UD-Q4_K_XL (111,4 GB, 4 shards): requiere 96–128 GB o más de RAM, motores llama.cpp o Strata.
- BF16 (360 GB, 131 shards): requiere Transformers y hardware de clase servidor; adecuado para reajuste fino posterior.
- Encoder de visión mmproj-BF16.gguf (907,5 MB): necesario para tareas multimodales.
- LoRA checkpoints (4,7 GB): pesos LoRA independientes para los pasos 200, 247, 290 y 330.
- No se especifican en la información disponible GPU concretas (A100, H100, RTX 4090) ni cifras de latencia o throughput más allá de la reducción del 10% en velocidad de decodificación respecto al original por la fusión Q8_0.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| Dongfangshuo-Qwen3.8-Flash-Next-NSFW (este) | 177B-A12B MoE (179,9B reales) | hasta 100K+ | swift-open-1.0 + qwen-community-1.0 | zh | Finetune abliterated con visión, orientado a roleplay y narrativa |
| Qwen3.8-Flash-Next (original) | 177B-A12B MoE | no disponible | qwen-community-1.0 | no disponible | Modelo base; mejor en coherencia de contexto ultra-largo y esquemas visuales según el autor |
| Huihui-Qwen3.8-Flash-Next-abliterated (v2) | 177B-A12B MoE | no disponible | no disponible | no disponible | Variante abliterated usada como base; sin el ajuste literario de este modelo |
| ukisai/Swift1.5-Qwen3.8-Flash-Next | 177B-A12B MoE | no disponible | no disponible | no disponible | Otro finetune del mismo modelo base usado en la mezcla de entrenamiento |

No se dispone de datos de benchmarks estándar para comparar el rendimiento absoluto frente a estos modelos; la comparativa se limita a parámetros, licencia y origen.

## Limitaciones y advertencias

- Contenido sin censura: el modelo ha sido sometido a abliteration y está marcado como not-for-all-audiences; puede generar contenido explícito o inapropiado sin filtros.
- Sesgos: no se documentan análisis de sesgo en la información disponible; al derivar de Qwen y de variantes abliterated, hereda los sesgos del modelo base y del proceso de eliminación de rechazos.
- Riesgo de alucinación: no cuantificado en la información disponible; el autor reporta degradación de estilo y omisión de la etiqueta `<think>` en contextos de 64K–100K tokens.
- Limitación de idioma: el modelo está etiquetado únicamente para chino (zh); el rendimiento en otros idiomas no está documentado y el autor menciona problemas de "inglés disperso" que se mitigan con parámetros de muestreo.
- Dependencia de configuración: el autor exige activar la cadena de pensamiento (reasoning_effort medium, reasoning_budget_tokens 2048) y parámetros de muestreo específicos (min_p 0,06, presence_penalty 0,20, penalty_last_n 1024); sin ellos, el modelo produce repeticiones y frases largas mal formadas.
- Licencia: la licencia combinada swift-open-license-1.0 y qwen-community-1.0 puede imponer restricciones al uso comercial; debe revisarse el archivo LICENSE antes de desplegar en producción.
- Rendimiento: la fusión Q8_0 del backbone reduce la velocidad de decodificación aproximadamente un 10% frente al modelo original.
- Contexto ultra-largo: en el test del autor con 99K tokens, el modelo omitió la etiqueta `<think>` y aumentó la longitud media de frase a 46+ caracteres, lo que indica degradación en el extremo superior de la ventana de contexto.
- Tamaño: incluso la cuantización de 2 bits ocupa 69,7 GB, por lo que no cabe en GPUs de consumo convencionales sin apoyo de RAM del sistema.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dongfangshuo/Dongfangshuo-Qwen3.8-Flash-Next-NSFW
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Base de ajuste: https://huggingface.co/ukisai/Swift1.5-Qwen3.8-Flash-Next
- Variante abliterated: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated
- Variante abliterated v2 GGUF: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated-v2-GGUF
- Cuantización IQ2_XS: https://huggingface.co/dongfangshuo/Dongfangshuo-Qwen3.8-Flash-Next-NSFW/tree/main/IQ2_XS
- Cuantización IQ3_XXS: https://huggingface.co/dongfangshuo/Dongfangshuo-Qwen3.8-Flash-Next-NSFW/tree/main/IQ3_XXS
- Cuantización UD-Q4_K_XL: https://huggingface.co/dongfangshuo/Dongfangshuo-Qwen3.8-Flash-Next-NSFW/tree/main/UD-Q4_K_XL
- Encoder de visión: https://huggingface.co/dongfangshuo/Dongfangshuo-Qwen3.8-Flash-Next-NSFW/blob/main/mmproj-Qwen3.8-Flash-Next-BF16.gguf
- Pesos BF16: https://huggingface.co/dongfangshuo/Dongfangshuo-Qwen3.8-Flash-Next-NSFW/tree/main
- LoRA checkpoints: https://huggingface.co/dongfangshuo/Dongfangshuo-Qwen3.8-Flash-Next-NSFW/tree/main/lora_checkpoints
