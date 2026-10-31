# pp111asd/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-GGUF

## Resumen

DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-GGUF es una cuantización GGUF "sin rechazos" (abliterada) del modelo DeepSeek-V4.1-Flash-1017, un modelo MoE de 763 mil millones de parámetros totales con 384 expertos desarrollado por DeepSeek. La versión original fue cuantizada por ISTA-DASLab (DASLab, IST Austria) usando su esquema GSQ-RCO, y este repositorio, publicado por el usuario pp111asd bajo la marca AtomicChat, sustituye únicamente los tensores densos que escriben en el residuo (atención de salida, proyección down del experto compartido y proyección de valores del Engram) con la dirección de rechazo proyectada fuera a fuerza 2.0, dejando los expertos enrutados exactamente como los envió ISTA.

La relevancia de esta ficha radica en que permite ejecutar un modelo de 763B en hardware de consumo: según el autor, funciona en una única GPU de 12 GB con el runtime Strata, manteniendo el backbone en memoria de sistema y transmitiendo la tabla Engram (110 GB) desde un SSD. El repositorio incluye mediciones propias en JailbreakBench, XSTest, MMLU y pruebas de thinking que documentan el efecto de la edición en cada "rung" de cuantización.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE con 384 expertos y tabla Engram externa (detalles completos no disponibles) |
| Parámetros totales | 551.880.949.208 (según dato de safetensors del repo; la model card cita 763B para el modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GSQ-RCO en rungs IQ1_M (1,75 bpw), IQ2_XXS (2,0 bpw) e IQ2_XS (2,25 bpw) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (requiere runtime Strata y archivo Engram compartido de ISTA-DASLab) |

## Arquitectura y entrenamiento

El modelo base es DeepSeek-V4.1-Flash-1017, un transformer de mezcla de expertos (MoE) con 384 expertos según la model card. La cuantización GSQ-RCO de ISTA-DASLab aplica redondeo de bajo bit aprendido por tensor; esta variante conserva esos expertos byte a byte y solo reemplaza tres tipos de tensores densos: `attn_output_b`, `ffn_down_shexp` y `engram_wkv`, que llevan la edición de abliteración (proyección de la dirección de rechazo, fuerza 2.0) cuantizada al tipo exacto por tensor de ISTA.

No hay información sobre datos de entrenamiento, número de tokens ni alineación (RLHF/DPO) del modelo base en la documentación proporcionada. La innovación destacable de este repo es la arquitectura de despliegue: el backbone reside en memoria de sistema y la tabla Engram compartida (110 GB de tabla de búsqueda) se transmite desde SSD mediante Strata, lo que permite servir un modelo de 763B en una máquina de consumo con GPU de 12 GB. Cabe señalar que estos archivos no funcionan aún en llama.cpp; requieren Strata.

## Capacidades

- Generación de texto conversacional (pipeline text-generation, etiqueta conversational).
- Razonamiento con modo thinking (medido con "Thinking high" en 30 pruebas por rung).
- Sin rechazos de seguridad: la abliteración elimina las negativas del modelo original en todos los temas, lo que permite responder a peticiones que el modelo base declinaría.
- Capacidades de código, matemáticas o visión: no disponible en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; las mediciones de JailbreakBench se realizaron en inglés (EN).

## Casos de uso

- Investigación en alineación y seguridad: permite estudiar el efecto de ediciones de dirección de rechazo sobre un MoE de gran escala con métricas publicadas (KL respecto al modelo stock, MMLU, JailbreakBench), útil para trabajos de interpretabilidad y abliteración.
- Ejecución local de un modelo frontera en hardware de consumo: con Strata y un SSD rápido, un modelo de 763B cabe en una máquina con GPU de 12 GB, adecuado para entornos sin conexión o con restricciones de nube.
- Generación de contenido sin filtros bajo control del usuario: para aplicaciones donde el operador quiere aplicar sus propias políticas de moderación aguas abajo en lugar de las del modelo.
- Evaluación comparativa de cuantizaciones de muy bajo bit: los rungs de 1,75 a 2,25 bpw con mediciones de degradación (MMLU, KL) sirven de referencia para estudios de cuantización extrema.
- Prototipado offline con la aplicación Atomic Chat: el equipo publicador mantiene una app que ejecuta modelos de pesos abiertos localmente y sin conexión.
- Análisis del impacto de la abliteración en el razonamiento: los resultados de thinking (de 27/30 a 0-2/30 tras la edición) ofrecen un caso de estudio sobre cómo las ediciones de pesos afectan al modo de razonamiento extendido.

## Benchmarks y rendimiento

Datos medidos por el autor del repo sobre el modelo servido en Strata, comparando el rung stock de ISTA-DASLab frente a esta versión abliterada ("→" lee stock → esta versión):

| Rung | bpw | Total GB | JailbreakBench (EN) | XSTest (safe refused) | Thinking high (30) | MMLU (500) | KL a stock |
|---|---|---|---|---|---|---|---|
| IQ2_XXS | 2,0 | 249 | 85,2% → 0,0% | 7,6% → 0,0% | 27/30 → 0/30 | 82,8% (p=0,27) | 0,0225 |
| IQ2_XS | 2,25 | 266 | 86,4% → 0,0% | 4,0% → 0,4% | 27/30 → 2/30 | 81,6% (p=1,00) | 0,0272 |
| IQ1_M | 1,75 | 231 | 88,9% → 0,0% | 4,8% → 0,0% | 27/30 → 1/30 | 80,6% (p=0,75) | 0,0207 |

Notas: la KL es un límite inferior top-64 calculado en modo teacher-forced de Strata, por lo que la KL real es algo mayor. El autor advierte que no todos los rungs superaron todas las puertas de calidad y que se publican tal cual, con sus mediciones. No hay comparativas con modelos de terceros en la información disponible.

## Requisitos de hardware

- GPU: basta una GPU de consumo con 12 GB de VRAM; el backbone reside en memoria de sistema y la tabla Engram se transmite desde SSD.
- RAM de sistema: no disponible explícitamente, aunque el backbone de 231-266 GB debe alojarse en memoria de sistema, lo que implica una estación de trabajo con RAM muy elevada.
- Almacenamiento: SSD rápido obligatorio para la tabla Engram de 110 GB (se descarga una vez desde ISTA-DASLab, no se re-hospeda aquí) más 231-266 GB según el rung elegido.
- Runtime: Strata es obligatorio; estos GGUF con Engram separado no funcionan todavía en llama.cpp. No hay mención de soporte en vLLM, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| pp111asd/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-GGUF | 551,9B (763B citado) | GSQ-RCO 1,75-2,25 bpw | no disponible | MIT | Abliterado, requiere Strata |
| ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF | igual base | GSQ-RCO 1,75-2,25 bpw | no disponible | MIT | Versión stock sin editar, misma estructura de archivos |
| AtomicChat/DeepSeek-V4.1-Flash-1017-Uncensored-GGUF | igual base | no disponible | no disponible | no disponible | Misma edición de rechazo sobre GGUF estándar, sin esquema GSQ-RCO |

No se dispone de comparativas frente a otros modelos frontera (Llama, Qwen, etc.) en la información proporcionada.

## Limitaciones y advertencias

- La abliteración elimina todos los rechazos de seguridad, no un subconjunto: el modelo responderá a peticiones que el modelo original declina. El usuario es responsable del uso y de cumplir la legislación aplicable.
- El clasificador de rechazos usado en las mediciones lee solo el inicio de la respuesta, por lo que un rechazo tardío puede pasar por respuesta válida en los benchmarks.
- Impacto severo en el modo thinking: tras la edición, las pruebas de thinking caen de 27/30 a 0-2/30 en los tres rungs, un efecto colateral importante para tareas de razonamiento largo.
- Con thinking activado, las peticiones que el original rechaza generan planes largos; conviene aumentar el presupuesto de tokens o reducir el esfuerzo.
- Cuantización extrema (1,75-2,25 bpw): aunque MMLU se mantiene relativamente estable (80,6-82,8 %), el autor reconoce que no todos los rungs superaron todas las puertas de calidad.
- Compatibilidad limitada: solo funciona con Strata; sin soporte aún en llama.cpp.
- La KL publicada es un límite inferior; el desplazamiento real de distribución respecto al modelo stock es mayor.
- Restricciones de licencia para uso comercial: la licencia es MIT, por lo que no hay restricciones legales de licencia, pero conviene revisar los términos de uso del modelo base de DeepSeek.

## Enlaces

- Repositorio del modelo: https://huggingface.co/pp111asd/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-GGUF
- Cuantización base (ISTA-DASLab): https://huggingface.co/ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF
- Modelo base original: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Variante GGUF estándar de AtomicChat: https://huggingface.co/AtomicChat/DeepSeek-V4.1-Flash-1017-Uncensored-GGUF
- Repositorio de métricas: https://huggingface.co/datasets/AtomicChat/DeepSeek-V4.1-Flash-1017-Uncensored-GGUF-metrics
- Runtime Strata: https://github.com/Niko1221/Strata
- Atomic Chat: https://atomic.chat/
- GitHub de Atomic Chat: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord de Atomic Chat: https://discord.gg/8wGSsvmg4V
