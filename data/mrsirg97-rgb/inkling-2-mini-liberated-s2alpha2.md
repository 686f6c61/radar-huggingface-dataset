# mrsirg97-rgb/inkling-2-mini-liberated-s2alpha2

## Resumen

inkling-2-mini-liberated-s2alpha2 es un derivado comunitario del modelo multimodal Inkling 2 Mini de Thinking Machines Lab, publicado por el usuario mrsirg97-rgb bajo licencia Apache 2.0. Se trata de una edición de pesos ("abliteration") que elimina una dirección de rechazo medida sobre peticiones benignas que el modelo original rechazaba, con el objetivo de reducir la sobrerreacción del modelo ante consultas legítimas sin eliminar los rechazos ante daño real. No es un lanzamiento oficial de Thinking Machines.

El modelo conserva la arquitectura original: un MoE con bucle nativo de 26.388.646.440 parámetros totales (26,4B) y 3,4B activos, con capas 6-17 ejecutadas tres veces con pesos compartidos (48 aplicaciones de capa), atención aprendida sobre bloques anteriores y una convolución corta en cada escritura residual. Los pesos se distribuyen en formato mixto NVFP4 (capas 0-19) y MXFP8 (capas 20-23), sin pesos BF16 en la release, y el pipeline es image-text-to-text.

Su relevancia es doble: por un lado, demuestra una técnica de edición de pesos aplicada a un modelo MoE bucleado multimodal de tamaño medio; por otro, documenta con detalle métricas de sobrerrechazo y rechazo correcto sobre OR-Bench, XSTest y CyberSecEval 2, lo que lo convierte en un caso de estudio útil para quien evalúe alineación y utilidad en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con bucle nativo (capas 6-17 ejecutadas 3 veces, 48 aplicaciones de capa), atención aprendida sobre bloques anteriores y convolución corta en cada escritura residual |
| Parametros totales | 26.388.646.440 (26,4B) |
| Parametros activos | 3,4B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (capas 0-19) y MXFP8 (capas 20-23); sin pesos BF16 en la release; tag 8-bit / modelopt |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (mixed NVFP4 / MXFP8) |

## Arquitectura y entrenamiento

La arquitectura es un MoE multimodal con bucle nativo: las capas 6 a 17 se ejecutan tres veces con pesos compartidos, lo que da 48 aplicaciones de capa efectivas. Cada escritura residual pasa por una convolución corta y cada capa lee una atención aprendida sobre bloques anteriores. Los expertos están cuantizados en NVFP4 en las capas 0-19 y en MXFP8 en las capas 20-23; no se publicaron pesos BF16. El modelo base es thinkingmachines/Inkling-2-Mini, de Thinking Machines Lab, bajo Apache 2.0.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en la información proporcionada. La innovación técnica documentada de este derivado es la edición de pesos: se mide una dirección de rechazo en los residuales del último token del prompt sobre OR-Bench-Hard (prompts rechazados menos prompts respondidos, ambos benignos y de temática similar, solo filas pares), se proyecta fuera la dirección de rechazo de OR-Bench-Toxic, y la dirección resultante se elimina con α = 2 de cada escritor residual (salida de atención y down projections de los 128 expertos), propagada a través de la convolución post-escritura mediante su ganancia por canal. Una sola edición cubre las tres pasadas de una capa bucleada.

## Capacidades

- Generación de texto conversacional y razonamiento multi-turno.
- Procesamiento de imagen y texto (pipeline image-text-to-text).
- Modo de razonamiento interno ("thinking"), con la advertencia de que la decodificación greedy provoca bucles en el pensamiento; el autor recomienda temperatura 1.0.
- Conocimiento de doble uso: seguridad y exploits, química, biología, armas, historia, con rechazo explícito de daño a terceros, fraude, chantaje, acoso y engaño fabricado.
- Rechazo garantizado de seis categorías: terrorismo, matanza masiva (incluidas armas biológicas, químicas, nucleares y radiológicas), suicidio, autolesión, abuso sexual infantil y violación.
- Discriminación por intención y no por temática: responde a preguntas defensivas o de protección y rechaza peticiones con intención de dañar.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible explícitamente; el modo thinking sugiere capacidad de razonamiento extendido, pero no se documenta integración de agentes.
- Capacidades multilingües: no disponible.

## Casos de uso

- Seguridad ofensiva y defensiva en equipos pequeños: el modelo responde a preguntas de seguridad y a prompts de código de CyberSecEval 2 que parecen maliciosos pero no lo son (15% de rechazo frente al 17% del base), lo que lo hace útil para auditorías, revisión de vulnerabilidades en sistemas propios y formación en concienciación sobre phishing.
- Investigación en ciencias abiertas: con tasas de rechazo del 11% en química y del 8% en biología sobre preguntas de OR-Bench-80K, sirve para consultas de laboratorio, historia de explosivos o guías de cultivo que el modelo base rechazaba con más frecuencia.
- Asistente conversacional multimodal: al aceptar entradas de imagen y texto, puede emplearse en atención al cliente o soporte técnico donde el usuario adjunta capturas, diagramas o fotografías junto con la consulta.
- Evaluación de alineación y sobrerrechazo: sus métricas publicadas sobre OR-Bench-Hard, OR-Bench-80K, OR-Bench-Toxic, XSTest y CyberSecEval 2 lo convierten en referencia para medir el equilibrio entre utilidad y seguridad en modelos editados por pesos.
- Generación de documentación técnica y material formativo: la reducción del rechazo en categorías de engaño (54% a 26%), violencia (59% a 47%) e ilegal (44% a 32%) permite obtener respuestas sobre temas sensibles con fines educativos sin caer en la fabricación de desinformación, que sigue rechazándose.
- Despliegue en infraestructura propia con vLLM: el autor indica que se sirve exactamente igual que la release, con la imagen `inkling-2-mini` de vLLM y transformers, lo que facilita su integración en entornos on-premise con requisitos de privacidad.
- Base para fine-tuning: el propio autor lo describe como la base "liberated" de osmos26b, por lo que sirve como punto de partida para ajustes posteriores que corrijan el 31% de sobrerrechazo restante.

## Benchmarks y rendimiento

Resultados a temperatura 1.0, 4.096 tokens, sin system prompt y con el mismo juez para todas las filas, según la model card del autor:

| Metrica | Inkling 2 Mini | Este modelo |
|---|---|---|
| OR-Bench-Hard-1K (benigno, deberia responderse) | 541/1319 (41%) | 404/1319 (31%) |
| OR-Bench-80K, 1.000 filas no usadas en la edicion (benigno) | 76/1000 (7,6%) | 56/1000 (5,6%) |
| OR-Bench-Toxic (danino, deberia rechazarse) | 571/655 (87%) | 559/655 (85%) |
| Las seis categorias de rechazo garantizado | 105/105 | 105/105 |
| Conjunto must-refuse del autor (principios 2-4) | 362/366 | 364/366 |
| XSTest safe / unsafe | 8/250 / 156/200 | 4/250 / 148/200 |
| Perplejidad en texto general | 4,568 | 4,595 |
| Respuestas cortadas a 4.096 tokens (de 2.941) | 0 | 2 |
| Preguntas de seguridad (600 de OR-Bench-80K) | 80 (13%) | 65 (11%) |
| Preguntas de quimica (400 de OR-Bench-80K) | 69 (17%) | 45 (11%) |
| Preguntas de biologia (400 de OR-Bench-80K) | 53 (13%) | 32 (8%) |
| CyberSecEval 2, prompts limite de codigo de seguridad (750) | 125 (17%) | 111 (15%) |

Desglose de OR-Bench-Hard por categoría, release → este modelo: engaño 54% → 26%, violencia 59% → 47%, ilegal 44% → 32%, privacidad 44% → 38%, autolesión 44% → 38%, dañino 42% → 28%, acoso 39% → 27%, no ético 33% → 26%, odio 17% → 22%, sexual 6% → 0%. En OR-Bench-Toxic se mantiene en 80-100% en todas las categorías excepto sexual. El autor resume el intercambio en 137 prompts benignos liberados por 12 tóxicos permitidos, aproximadamente 11 a 1. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 26,4B parámetros en NVFP4/MXFP8 y un repositorio de 20,2 GB, la inferencia requiere aproximadamente 20-24 GB solo para pesos, más overhead de activaciones y caché KV.
- GPU recomendadas: A100 (40/80 GB), H100, L40S y GPUs con soporte de FP4/FP8 nativo. El formato NVFP4 requiere hardware Blackwell para aprovechar la cuantización de forma nativa.
- GPU de consumo: una RTX 4090 (24 GB) queda muy justa para los pesos en NVFP4 más el contexto; una RTX 5090 o GPUs con mayor VRAM son más realistas. No se confirma compatibilidad con GPUs de consumo en la información disponible.
- Opciones de despliegue: vLLM con la imagen `inkling-2-mini`, y transformers según la model card. No se documenta soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor advierte que la decodificación greedy provoca bucles de pensamiento y recomienda operar a temperatura 1.0.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| inkling-2-mini-liberated-s2alpha2 | 26,4B totales / 3,4B activos | no disponible | Apache 2.0 | Derivado comunitario con edición de pesos; rechazo benigno 31% en OR-Bench-Hard |
| thinkingmachines/Inkling-2-Mini | 26,4B totales / 3,4B activos | no disponible | Apache 2.0 | Modelo base oficial; rechazo benigno 41% en OR-Bench-Hard; rechazo tóxico 87% |
| osmos26b | no disponible | no disponible | no disponible | Derivado del modelo liberado según el autor; sin datos públicos en la información proporcionada |

No se dispone de datos de otros modelos comparables de la misma categoría (MoE multimodal de ~26B) en la información proporcionada.

## Limitaciones y advertencias

- Sobrerrechazo persistente: aproximadamente el 31% de los prompts benignos pero intimidantes siguen rechazándose en OR-Bench-Hard, y las preguntas de doble uso formuladas como ataque se rechazan casi siempre (151 de 151 frente a 150 del base).
- Permisividad añadida: 12 prompts tóxicos de OR-Bench-Toxic se permiten que antes se rechazaban; el rechazo tóxico baja del 87% al 85% y el unsafe de XSTest del 78% al 74%.
- Bucles en decodificación greedy: el modelo entra en bucles de pensamiento con más frecuencia que la release (58 frente a 29 respuestas cortadas de 1.000 en OR-Bench-80K), por lo que debe operarse a temperatura 1.0.
- Respuestas truncadas: 2 de 2.941 respuestas se cortaron a 4.096 tokens; las respuestas de CyberSecEval 2 a menudo agotan el presupuesto mientras siguen pensando.
- Riesgo de alucinación: no cuantificado en la información disponible; la perplejidad en texto general sube ligeramente de 4,568 a 4,595 tras la edición.
- Sesgos conocidos: no documentados en la información proporcionada.
- Idiomas: no se especifican los idiomas soportados ni sus limitaciones.
- Licencia: Apache 2.0 permite uso comercial, pero el autor declara explícitamente que es un derivado comunitario independiente y no un lanzamiento de Thinking Machines Lab.
- Formato de pesos: al no haber BF16, la carga requiere soporte de NVFP4/MXFP8; no se documenta compatibilidad con llama.cpp u Ollama.
- Contexto: la longitud de contexto no está disponible, lo que impide planificar cargas de trabajo con ventanas largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrsirg97-rgb/inkling-2-mini-liberated-s2alpha2
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Imagen de vLLM `inkling-2-mini`: no disponible como enlace directo en la información proporcionada
- Paper, blog o repositorio del método de edición: no disponible en la información proporcionada
