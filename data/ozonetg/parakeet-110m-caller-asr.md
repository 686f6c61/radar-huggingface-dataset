# ozonetg/parakeet-110m-caller-asr

## Resumen

Parakeet 110m caller-asr es un modelo de reconocimiento automático de voz (ASR) desarrollado por el usuario ozonetg, consistente en un ajuste fino del modelo nvidia/parakeet-tdt_ctc-110m de NVIDIA, especializado en el canal del cliente (caller-side) de llamadas telefónicas salientes en inglés estadounidense a 8 kHz. El modelo resuelve un problema muy concreto: la transcripción precisa de audio telefónico de banda estrecha en entornos de centro de contacto, donde los sistemas ASR genéricos pierden exactitud por la baja calidad de la señal, el ruido de línea y las características conversacionales del habla espontánea.

Arquitectónicamente es un encoder FastConformer de 114,6 millones de parámetros combinado con un decodificador TDT (token-and-duration transducer) y una cabeza CTC auxiliar, la misma arquitectura del modelo base de NVIDIA. La aportación del ajuste fino es doble: por un lado, un reentrenamiento sobre aproximadamente 377 horas de audio real de llamadas salientes (canal del cliente), y por otro, una mezcla de pesos mediante WiSE-FT (0,8 × pesos reentrenados + 0,2 × pesos base) que recupera parte de la precisión general en inglés a cambio de un coste reducido en el dominio específico.

El modelo resulta relevante porque mejora de forma medible al sistema que sustituye: 11,42 % de WER agrupado en cinco conjuntos públicos de llamadas telefónicas, frente al 14,00 % del sistema anterior (el 110m estándar con un pequeño adaptador de dominio) y el 14,58 % del base sin tocar. En llamadas retenidas del mismo dominio baja al 3,35 %, frente al 8,68 % y 9,19 % respectivamente. Está publicado con licencia CC BY 4.0 y pesos en formato `.nemo` float32.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder FastConformer con decodificador TDT (token-and-duration transducer) y cabeza CTC auxiliar |
| Parámetros totales | 114,6 M |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de ASR; el modelo base acepta audio largo, pero la model card no especifica límite de duración) |
| Tipos de cuantización | No disponible; los pesos publicados son float32 |
| Idiomas soportados | Inglés (en), específicamente inglés estadounidense telefónico |
| Licencia | CC BY 4.0 |
| Formato de pesos | `.nemo` (parakeet-110m-caller-asr.nemo), float32 |
| Modelo base | nvidia/parakeet-tdt_ctc-110m (finetune) |
| Entrada | Audio mono float a 16 kHz; el audio telefónico de 8 kHz debe remuestrearse a 16 kHz |
| Salida | Texto en inglés con puntuación y mayúsculas |
| Decodificación | Greedy TDT |
| Framework | NeMo 2.5.3 (también restaura y transcribe en NeMo 3.0) |
| Tamaño del repositorio | 0,5 GB |

## Arquitectura y entrenamiento

El modelo mantiene la arquitectura del base: un encoder FastConformer de 114,6 M de parámetros que alimenta un decodificador TDT (token-and-duration transducer), un esquema de transducer que predice conjuntamente el token y su duración, lo que permite un alineamiento más eficiente que el CTC puro. Se conserva además una cabeza CTC auxiliar, habitual en los modelos Parakeet de NVIDIA para estabilizar el entrenamiento y ofrecer una ruta de decodificación alternativa. La decodificación empleada en todos los números reportados es greedy TDT.

El proceso de ajuste consta de dos pasos documentados. En el primero, se reentrena la receta estándar del 110m con tres modificaciones: se desactiva SpecAugment, se utiliza una media móvil exponencial de los pesos (decay 0,999) para validación y guardado, y se añaden aproximadamente 30,5 horas de audio adicional del canal del cliente procedente de las mismas fuentes. El conjunto de entrenamiento resultante de la familia contiene 504.617 segmentos (345,5 horas) de audio de 8 kHz mono correspondiente al lado del cliente en llamadas salientes de ventas en Estados Unidos, grabadas entre 2025 y 2026, con segmentos de entre 0,3 y 20 segundos. Un 5 % de los segmentos son no habla (ruido de línea, silencio, espera, respiración) con objetivo vacío, y en torno al 1 % son saludos de buzón de voz o mensajes de IVR captados en la línea del cliente. En total, la receta de reentrenamiento maneja 587.600 segmentos y 377 horas.

Las etiquetas de entrenamiento son transcripciones automáticas generadas con Qwen3-ASR-1.7B; ningún humano transcribió estos datos. Cada transcripción se verificó contra sistemas ASR independientes, de modo que los segmentos donde coincidían se etiquetaron como tier 1 (peso de pérdida 1,0). El segundo paso es una mezcla WiSE-FT: los pesos finales son 0,8 × pesos reentrenados + 0,2 × pesos base sin tocar. El coeficiente 0,8 se eligió sobre datos de desarrollo entre 0,6, 0,7 y 0,8, nunca sobre un conjunto de test. El objetivo de la mezcla es recuperar parte de la precisión general en inglés que se pierde con el ajuste fino, con un coste pequeño en el dominio específico.

## Capacidades

- Reconocimiento automático de voz en inglés estadounidense sobre audio telefónico de banda estrecha (8 kHz).
- Transcripción del canal del cliente en llamadas salientes de ventas, con puntuación y mayúsculas en la salida.
- Detección implícita de segmentos no habla (silencio, ruido de línea, espera, respiración) gracias al entrenamiento con objetivos vacíos.
- Manejo de saludos de buzón de voz y mensajes de IVR captados en la línea del cliente (aproximadamente el 1 % del conjunto de entrenamiento).
- Robustez ante habla conversacional espontánea, solapamientos parciales y ruido telefónico.
- Capacidad de mantener precisión razonable en inglés general, no solo en el dominio telefónico, gracias a la mezcla WiSE-FT.
- No dispone de soporte documentado de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio multimodal ni modo de pensamiento: es un modelo puramente ASR.
- Soporte multilingüe: no. El modelo está declarado únicamente para inglés.

## Casos de uso

- Transcripción de llamadas salientes en centros de contacto: el modelo está entrenado específicamente sobre el canal del cliente de llamadas salientes de ventas a 8 kHz, por lo que transcribir el audio del cliente en crudo (remuestreado a 16 kHz) evita el coste de un ASR genérico mal adaptado al dominio telefónico.
- Control de calidad de agentes: a partir de las transcripciones con puntuación y mayúsculas se pueden calcular métricas de discurso, detección de cumplimiento de guiones y análisis de objeciones del cliente por llamada.
- Cumplimiento normativo y auditoría: la transcripción sistemática de grabaciones permite auditar llamadas reguladas, buscar frases concretas en el histórico y generar evidencias textuales de lo dicho por el cliente.
- Enrutamiento e intención en tiempo real: dado el tamaño reducido (114,6 M de parámetros) y la decodificación greedy TDT, es viable ejecutarlo en línea sobre el flujo de audio para clasificar intención o detectar escalado a supervisor.
- Generación de resúmenes post-llamada: las transcripciones de alta calidad en el canal del cliente se pueden pasar a un LLM para producir resúmenes de CRM, notas de seguimiento o tareas.
- Analítica de voz del cliente: el WER bajo en el dominio (3,35 % en llamadas retenidas) permite construir series temporales de temas, quejas y motivos de contacto sin depender de transcripción humana.
- Búsqueda sobre archivos de grabaciones: indexar el texto transcrito de miles de horas de llamadas para recuperación por palabra clave o búsqueda semántica en herramientas internas.
- Transcripción de buzones de voz e IVR: el modelo ha visto este tipo de segmentos durante el entrenamiento, por lo que puede transcribir mensajes automáticos y saludos grabados en la línea del cliente.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en su model card (`verified: false` en todos los casos). WER en porcentaje, menor es mejor.

| Conjunto de evaluación | WER (%) |
|---|---|
| LibriSpeech test-clean (8 kHz) | 2,93 |
| LibriSpeech test-other (8 kHz) | 6,55 |
| LibriSpeech test-clean | 2,57 |
| LibriSpeech test-other | 5,41 |
| CallHome English (test) | 12,19 |
| CallFriend English (dev) | 17,29 |
| HarperValley Bank (canal del cliente) | 5,22 |
| Let's Go (referencias reescritas) | 22,61 |
| AppTek call-center dialogues, clientes de EE. UU. (test) | 8,75 |
| Switchboard (subconjunto de 3.000 enunciados) | 7,49 |

Comparaciones agregadas reportadas por el autor:

| Escenario | parakeet-110m-caller-asr | Sistema anterior (110m estándar + adaptador de dominio) | Base 110m sin tocar |
|---|---|---|---|
| Cinco conjuntos públicos de llamadas (agrupados) | 11,42 % | 14,00 % | 14,58 % |
| Llamadas retenidas del mismo dominio | 3,35 % | 8,68 % | 9,19 % |
| LibriSpeech test-other a 8 kHz | 6,55 % | No disponible | 6,25 % |

El autor indica que en LibriSpeech test-other a 8 kHz el modelo cede 0,30 puntos porcentuales frente a su base (6,55 % frente a 6,25 %), coste que atribuye al ajuste fino y a la mezcla WiSE-FT.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible como cifra oficial. Como referencia calculada a partir del tamaño declarado, los pesos en float32 de 114,6 M de parámetros ocupan aproximadamente 458 MB, por lo que el modelo completo cabe holgadamente por debajo de 1-2 GB de memoria incluyendo activaciones, dependiendo de la longitud del audio y del backend.
- GPU recomendadas: no especificadas en la model card. Por tamaño, cualquier GPU con al menos unos pocos GB de memoria es suficiente; no se requiere A100 ni H100.
- Cabe en GPU de consumo: sí, con margen amplio, dado que los pesos en float32 rondan los 458 MB. Cualquier GPU de consumo moderna con varios GB de VRAM es suficiente.
- Opciones de despliegue: el framework de referencia es NeMo 2.5.3, que también restaura y transcribe en NeMo 3.0. No se documentan otros backends (vLLM, llama.cpp, Ollama, TGI) para este modelo, y el formato `.nemo` no es directamente compatible con ellos.
- Latencia y throughput estimados: no disponibles en la información proporcionada.
- Nota de entrada: el audio telefónico de 8 kHz debe remuestrearse a 16 kHz mono float antes de alimentar el modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | WER en dominio telefónico | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ozonetg/parakeet-110m-caller-asr | 114,6 M | Audio telefónico 8 kHz remuestreado a 16 kHz | 11,42 % (5 conjuntos públicos, agrupados); 3,35 % en llamadas retenidas del dominio | CC BY 4.0 | HuggingFace, formato `.nemo` |
| nvidia/parakeet-tdt_ctc-110m (base) | 114,6 M | Audio mono 16 kHz | 14,58 % (agrupado); 9,19 % en llamadas retenidas | No disponible en la información proporcionada | HuggingFace |
| Sistema anterior: 110m estándar con adaptador de dominio | 114,6 M más adaptador | Audio mono 16 kHz | 14,00 % (agrupado); 8,68 % en llamadas retenidas | No disponible en la información proporcionada | Interno, no público |

No se dispone en la información proporcionada de datos comparativos con otros modelos ASR telefónicos de terceros.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan análisis de sesgo en la model card. El entrenamiento se realizó exclusivamente sobre llamadas salientes de ventas en Estados Unidos, lo que puede introducir sesgo hacia el vocabulario, los acentos y los patrones de habla presentes en ese corpus.
- Riesgo de alucinación: inherente a los modelos ASR. Las etiquetas de entrenamiento son transcripciones automáticas de Qwen3-ASR-1.7B verificadas por consenso entre sistemas ASR independientes, no por revisión humana, por lo que los errores sistemáticos del etiquetador pueden haberse propagado al modelo.
- No es un modelo multilingüe: solo soporta inglés, y específicamente inglés estadounidense telefónico. El rendimiento en otras variantes de inglés o en inglés con acento no estadounidense no está documentado.
- Dominio estrecho: el modelo está optimizado para el canal del cliente en llamadas salientes a 8 kHz. El rendimiento en audio de banda ancha, audio de micrófono, conversaciones presenciales o el canal del agente no está caracterizado.
- Degradación en inglés general: el autor reconoce un coste de 0,30 puntos porcentuales de WER en LibriSpeech test-other a 8 kHz respecto a su base, consecuencia del ajuste fino y de la mezcla WiSE-FT.
- Licencia CC BY 4.0: permite uso comercial, pero exige atribución al autor y a la obra. Conviene revisar además los términos del modelo base de NVIDIA del que deriva.
- Origen de los datos: el entrenamiento utiliza grabaciones internas de llamadas de ventas reales de 2025-2026, lo que plantea consideraciones de privacidad y cumplimiento normativo que deben gestionarse en el despliegue, independientemente de la licencia del modelo.
- Métricas no verificadas: todos los resultados de benchmarks están marcados como `verified: false`, es decir, son declaraciones del autor no validadas de forma independiente.
- Formato propietario: los pesos en `.nemo` limitan su uso a NeMo, salvo conversión no documentada.
- Idiomas y cobertura: no hay soporte de tool calling, agentes ni multimodalidad; cualquier flujo de ese tipo requiere integrar este modelo con otros componentes.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/ozonetg/parakeet-110m-caller-asr
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt_ctc-110m
- Papers, blogs, repositorios o demos adicionales: no disponibles en la información proporcionada.
