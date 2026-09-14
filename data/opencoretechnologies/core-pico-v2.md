# OpenCOReTechnologies/CORe-Pico-V2

## Resumen

CORe Pico V2 es un modelo de lenguaje conversacional compacto desarrollado por CORe Technologies (organización OpenCOReTechnologies). Con 596.049.920 parametros (aproximadamente 600 M) y pesos en bf16, esta disenado para ejecutarse en practicamente cualquier equipo, incluidas CPU y dispositivos de gama baja, ofreciendo chat multi-turno nativo, respuestas directas, llamada a herramientas en formato estructurado y un modo de razonamiento extendido activable mediante las directivas `/think` y `/no_think`.

El modelo se presenta como una edicion refinada y orientada a conversacion de la linea Pico: incide especialmente en preguntas de identidad (quien es, quien lo ha creado) y en respuestas cortas y directas a preguntas factuales sencillas. Soporta una longitud de contexto de 40.960 tokens con un tokenizador BPE de 151.936 entradas y plantilla de chat nativa, lo que permite conversaciones largas sin gestion manual del historial.

Su relevancia actual esta en el segmento de modelos sub-1B: licencia Apache-2.0 sin restricciones para uso comercial, pesos disponibles tanto en safetensors como en GGUF (f16, q8_0 y q4_k_m), y compatibilidad documentada con transformers, llama.cpp, LM Studio y Ollama. Es una opcion realista para inferencia en el borde, prototipado rapido y tareas de orquestacion ligera, asumiendo que su conocimiento factual y su aritmetica son limitados por tamano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (etiqueta `causal-lm`); la etiqueta `qwen3` del repositorio sugiere una base derivada de la familia Qwen3, no confirmado en la model card |
| Parametros totales | 596.049.920 (596 M) |
| Parametros activos | No aplica: no hay evidencia de arquitectura MoE en la informacion disponible |
| Longitud de contexto | 40.960 tokens |
| Tipos de cuantizacion | bf16 (safetensors original), GGUF f16, GGUF q8_0, GGUF q4_k_m |
| Idiomas soportados | No disponible; la model card indica que esta optimizado para ingles ("English-first") |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16) y GGUF |
| Tokenizador | BPE de 151.936 tokens con plantilla de chat nativa |
| Tamano del repositorio | 3,4 GB |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna mas alla de la etiqueta `causal-lm` y de la etiqueta `qwen3` asociada al repositorio. Por el numero de parametros (596 M) y el tokenizador de 151.936 entradas, es coherente con un transformer decoder-only estilo Qwen3 de escala pequena, pero la model card no confirma explicitamente la base, ni el numero de capas, cabezas de atencion o dimensiones ocultas. Tampoco se especifica si emplea atencion lineal, decodificacion especulativa u otra innovacion de eficiencia.

No hay informacion publicada sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF, DPO u otras tecnicas de alineamiento. La model card describe el modelo como una "edicion refinada centrada en conversacion" de la linea Pico, lo que sugiere un ajuste posterior sobre una base preentrenada, pero no se aportan detalles del procedimiento. Las capacidades destacadas (identidad consistente, respuestas directas, emision de bloques JSON en `<tool_call>` y modo `/think`) apuntan a un ajuste supervisado especifico para formato y estilo conversacional.

## Capacidades

- Generacion de texto conversacional multi-turno mediante plantilla de chat nativa embebida en el tokenizador y en los GGUF.
- Respuestas directas a preguntas factuales simples, con ejemplos verificados en la model card (por ejemplo, capital de Francia).
- Consistencia de identidad ante preguntas como "quien eres", "que modelo eres" o "quien te ha creado", con respuestas estables en formulaciones habituales.
- Llamada a herramientas: emite bloques `<tool_call>` con JSON parseable cuando se le proporcionan herramientas.
- Razonamiento extendido opcional: la directiva `/think` en el mensaje de sistema activa trazas de razonamiento; `/no_think` fuerza respuestas directas sin traza.
- Integracion con llama.cpp, LM Studio y Ollama gracias a los pesos GGUF y a la plantilla de chat embebida.
- Carga directa con `transformers` sin codigo personalizado (`AutoModelForCausalLM` y `AutoTokenizer`).
- Capacidades multilingues: no disponibles; el modelo se declara orientado a ingles.
- No se documentan capacidades de vision, audio, matemáticas avanzadas ni agentes autononomos de multiples pasos mas alla del tool calling.

## Casos de uso

- Asistente conversacional en el borde: con 596 M de parametros y una cuantizacion q4_k_m de aproximadamente 0,4 GB, el modelo puede ejecutarse en CPU, mini-PC o Raspberry Pi para asistentes de voz o texto sin conexion, manteniendo contexto de hasta 40.960 tokens.
- Respuestas cortas en atencion al cliente: para FAQ y consultas directas donde se espera una respuesta breve y predecible, el modelo devuelve contestaciones concisas ("Paris" ante la capital de Francia), lo que reduce coste de post-procesado.
- Prototipado de pipelines de agentes: su salida en bloques `<tool_call>` con JSON permite construir orquestadores ligeros que deciden que funcion invocar, usando el modelo como enrutador economico antes de llamar a un modelo mayor.
- Generacion de datos sinteticos de formato: el modo `/think` permite producir trazas de razonamiento etiquetadas para destilar o validar plantillas de chat en un pipeline de entrenamiento.
- Clasificacion y etiquetado de baja latencia: con `/no_think` se obtienen respuestas directas, utiles para tareas de categorizacion simple, extraccion de intenciones o normalizacion de texto en lotes grandes.
- Pruebas de integracion y CI: al cargar con `transformers` sin codigo adicional y pesar menos de 1,2 GB en bf16, es viable incluirlo en tests automatizados que verifiquen plantillas de chat, serializacion de tool calls o regresiones de prompt.
- Demos educativas y talleres: permite ilustrar cuantizacion, plantillas de chat y tool calling en equipos de estudiante sin GPU dedicada, dado su tamano reducido.
- Asistentes de marca con identidad fija: las respuestas de identidad consistentes facilitan prototipos de recepcionista virtual o bot corporativo donde importa que el modelo se identifique correctamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar, y la busqueda web asociada no ha devuelto resultados relevantes sobre el modelo.

## Requisitos de hardware

- VRAM estimada en bf16 o f16: alrededor de 1,2 GB de pesos, por lo que con overhead de runtime la inferencia cabe en aproximadamente 2-3 GB de VRAM.
- VRAM estimada en q8_0: pesos de aproximadamente 0,65 GB, inferencia por debajo de 1,5 GB de VRAM.
- VRAM estimada en q4_k_m: pesos de aproximadamente 0,4 GB, ejecutable en CPU con memoria del sistema reducida.
- GPU recomendadas: cualquier GPU consumer con 2 GB o mas de VRAM (por ejemplo, GTX 1050 Ti, RTX 3060, RTX 4090); en el extremo alto el modelo queda limitado por ancho de banda de memoria, no por capacidad, por lo que el throughput escala con la GPU.
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas modernas e incluso en graficas integradas con memoria compartida suficiente.
- CPU y dispositivos de borde: viable en CPU de escritorio, mini-PC y placas tipo Raspberry Pi con la cuantizacion q4_k_m.
- Opciones de despliegue documentadas: `transformers`, llama.cpp (`llama-cli`), LM Studio y Ollama. Las etiquetas del repositorio incluyen `text-generation-inference` y `endpoints_compatible`, lo que apunta a compatibilidad con TGI y con endpoints gestionados.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

Los datos de los modelos alternativos provienen de documentacion publica y no se han verificado en la busqueda asociada a esta ficha; conviene contrastarlos antes de decidir.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| CORe Pico V2 | 596 M | 40.960 tokens | Apache-2.0 | safetensors y GGUF en HuggingFace |
| Qwen3-0.6B | 0,6 B | 32.768 tokens nativos (segun documentacion publica) | Apache-2.0 | safetensors y GGUF |
| Llama 3.2 1B | 1,23 B | 128.000 tokens (segun documentacion publica) | Licencia comunitaria Llama 3.2 | safetensors y GGUF |
| SmolLM2-360M | 0,36 B | 32.768 tokens (segun documentacion publica) | Apache-2.0 | safetensors y GGUF |

Frente a estas alternativas, CORe Pico V2 destaca por su contexto de 40.960 tokens para un modelo de 600 M y por su licencia Apache-2.0 sin restricciones de uso comercial. En contra, no publica evaluaciones comparativas ni detalle de entrenamiento, y su adopcion actual es nula segun las metricas del repositorio (0 descargas, 0 likes), lo que impide contrastar su rendimiento real frente a los modelos citados.

## Limitaciones y advertencias

- Alucinacion factual: la propia model card advierte de que el modelo afirmara hechos incorrectos y que sus respuestas deben tratarse como punto de partida, no como verdad verificada.
- Aritmetica y razonamiento numerico: se reconoce un rendimiento debil en operaciones aritmeticas, esperable en un modelo de 600 M.
- Improvisacion ante desconocimiento: el modelo tiende a improvisar cuando no sabe algo, en lugar de abstenerse.
- Idiomas: la model card lo describe como "English-first" y no se declaran idiomas soportados oficialmente, por lo que el rendimiento en castellano no esta garantizado ni documentado.
- Consistencia de identidad: las respuestas de identidad son fiables en formulaciones comunes, pero pueden desviarse con redacciones muy inusuales.
- Sesgos: no se ha publicado ninguna evaluacion de sesgos, toxicidad o alineamiento de seguridad.
- Trazabilidad del entrenamiento: no hay informacion sobre datos de entrenamiento, composicion del dataset ni tecnicas de alineamiento, lo que dificulta evaluar riesgos de contaminacion o sesgo.
- Licencia: Apache-2.0 permite uso comercial, modificacion y redistribucion sin restricciones adicionales; se recomienda conservar el aviso de licencia y atribucion.
- Adopcion y validacion comunitaria: con 0 descargas y 0 likes, el modelo carece de validacion externa, informes de terceros o casos de produccion conocidos.
- Inconsistencias en la propia model card: el identificador usado en los ejemplos de codigo y en la ruta del logotipo es `OpenCOReTechnologies/core-pico-v2`, mientras que el identificador real del repositorio es `OpenCOReTechnologies/CORe-Pico-V2`. Conviene verificar la ruta correcta antes de automatizar descargas.
- Formato de tool calling propietario: los bloques `<tool_call>` no siguen un esquema estandar publicado en la informacion disponible, por lo que el parseo debe implementarse y probarse a medida.
- Ausencia de benchmarks: sin cifras de evaluacion no es posible estimar su calidad relativa frente a alternativas de tamano similar.

## Enlaces

- HuggingFace: https://huggingface.co/OpenCOReTechnologies/CORe-Pico-V2
- La busqueda web asociada no ha devuelto ningun enlace relevante sobre el modelo: el unico resultado obtenido corresponde a un sitio de streaming ajeno por completo (`cinemana.shabakaty.com`), por lo que no se incluye como referencia.
- No se han encontrado papers, blogs tecnicos, repositorios de codigo ni demos adicionales en la informacion proporcionada.
