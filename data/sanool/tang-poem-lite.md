# Sanool/tang-poem-lite

## Resumen

tang-poem-lite es un modelo de generacion de texto en chino clasico desarrollado por el usuario Sanool (Sanool), publicado en HuggingFace con licencia MIT. Se trata de un GPT-2 entrenado desde cero con 13.135.488 parametros (13,1 M) cuyo unico objetivo es escribir poesia regulada china (jueju y lushi de cinco y siete caracteres por verso). El repositorio ocupa 0,1 GB y el modelo cabe holgadamente en cualquier equipo, incluidas CPU de portatiles, segun indica su autor.

El problema que resuelve es acotado pero util: generar poemas con la forma correcta (numero de versos, numero de caracteres por verso, pausas y imagenes tipicas) sin necesidad de GPU ni de infraestructura de inferencia pesada. La arquitectura es un transformer decoder-only estilo GPT-2 de 6 capas, 8 cabezas de atencion y anchura oculta 384, con una ventana de contexto de solo 128 caracteres y un vocabulario de 6350 caracteres chinos (un caracter por token). Fue entrenado en una unica RTX 3060 de 12 GB durante unos 10 minutos.

Su relevancia actual es doble. Por un lado, es un ejemplo extremo de modelo de dominio estrecho, reproducible y barato: el autor afirma que el codigo de entrenamiento ocupa menos de 300 lineas y que se puede reentrenar desde cero en una GPU domestica en diez minutos. Por otro lado, sirve como banco de pruebas para tareas de generacion con restricciones de formato estrictas (por ejemplo, poemas acrosticos) y para despliegues en el borde o en navegador mediante ONNX. No compite en capacidad general con modelos multimillonarios en parametros: su ambito es la poesia clasica china en caracteres simplificados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 (6 capas, 8 cabezas, anchura oculta 384) |
| Parametros totales | 13.135.488 (13,1 M) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 128 caracteres/tokens |
| Tipos de cuantizacion | No se publican versiones cuantizadas oficiales; se distribuyen pesos en safetensors y una exportacion ONNX. Con 13,1 M de parametros (~50 MB en fp32) la cuantizacion es prescindible |
| Idiomas soportados | Chino clasico (zh), salida en caracteres simplificados |
| Licencia | MIT |
| Formato de pesos | safetensors y ONNX |
| Vocabulario | 6350 caracteres, tokenizacion de un caracter por token |
| Configuracion de generacion por defecto | temperature 0,8 y top_k 40 (definidos en `generation_config.json`) |
| Tamano del repositorio | 0,1 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura es un GPT-2 estandar de 6 capas, 8 cabezas de atencion y dimension de modelo 384, sin ninguna innovacion estructural: no hay atencion lineal, ni decodificacion especulativa, ni mezcla de expertos, ni modulos de estado recurrente. La unica decision de diseno reseñable es la tokenizacion: cada caracter chino equivale a un token, con un vocabulario de 6350 caracteres. Eso reduce la longitud efectiva de las secuencias y encaja con el contexto de 128 posiciones, suficiente porque un poema regulado tipico no pasa de 56 caracteres.

El entrenamiento uso 219.615 poemas extraidos de las colecciones 全唐诗 y 全宋诗 a traves del repositorio chinese-poetry (licencia MIT), convertidos a chino simplificado, lo que suma aproximadamente 10 millones de caracteres. El filtrado fue estricto: solo se conservaron textos compuestos exclusivamente por caracteres chinos y comas o puntos, con 4 u 8 versos, todos de 5 o todos de 7 caracteres, y se descartaron los poemas que contenian algun caracter con frecuencia inferior a 10 apariciones en el corpus. El entrenamiento consistio en 10.000 pasos con batch de 64 secuencias de 128 caracteres, optimizador AdamW y tasa de aprendizaje 1e-3 con decaimiento coseno, todo ello en una RTX 3060 de 12 GB durante unos 10 minutos. La perdida final fue de 3,59 en entrenamiento y 3,91 en validacion. No se documento ninguna fase de RLHF, DPO o ajuste por instrucciones; es un modelo puramente autoregresivo entrenado sobre texto plano.

## Capacidades

- Generacion de poesia clasica china regulada: jueju y lushi de cinco y siete caracteres, con la estructura de versos y pausas correcta.
- Generacion condicionada por un inicio: si se le da un verso o unas palabras iniciales precedidas de un salto de linea (`\n`), continua el poema desde ahi; con solo `\n` crea desde el primer caracter.
- Generacion de acrosticos: el autor muestra ejemplos donde el primer caracter de cada verso forma una secuencia con sentido (por ejemplo, primavera, verano, otono e invierno).
- Manejo de imagenes y topicos propios del genero (luna, rio, viento, pescadores, estaciones) con coherencia superficial.
- No soporta tool calling ni function calling: no esta entrenado para ello ni dispone de plantilla de chat.
- No soporta uso como agente ni razonamiento multi-paso; el pipeline es de generacion de texto pura.
- Capacidad multilingue: nula fuera del chino clasico. El vocabulario de 6350 caracteres no cubre caracteres modernos como 卡 o 咖, que se convierten en `[UNK]`.
- Sin capacidades de vision, audio, modo de pensamiento (thinking) ni salida estructurada en JSON.
- Integrable en el ecosistema Transformers mediante `pipeline("text-generation")` y compatible con text-generation-inference segun las etiquetas del repositorio.

## Casos de uso

- Aplicaciones educativas de poesia clasica: el modelo puede generar ejemplos de jueju y lushi bajo demanda para ilustrar metrica y estructura en material didactico, con inferencia en CPU y sin coste de GPU.
- Generacion de acrosticos para eventos o regalos personalizados: dado que el modelo respeta el primer caracter de cada verso, se pueden construir poemas donde las iniciales formen un nombre o una frase, como demuestra el ejemplo del autor con las cuatro estaciones.
- Demo interactiva en navegador o dispositivo de borde: al existir exportacion ONNX y pesar menos de 50 MB en fp32, puede ejecutarse en el cliente con ONNX Runtime Web o en una Raspberry Pi sin conexion a internet.
- Base para ajuste fino e investigacion en modelado de chino clasico: con 13,1 M de parametros, un bucle completo de entrenamiento cabe en una GPU de 12 GB en minutos, lo que lo hace util para experimentar con tokenizacion por caracter, filtrado de corpus o funciones de perdida especificas de metrica.
- Aumento de datos para otros sistemas de PLN en chino: se puede usar para generar variantes sinteticas de versos que amplien corpus de entrenamiento de correctores metricos o clasificadores de genero poetico, asumiendo la necesidad de filtrar por calidad.
- Integracion en bots de chat en chino (WeChat, Telegram, foros) como funcionalidad de entretenimiento: la latencia de generacion es de aproximadamente un segundo en CPU segun el autor, lo que permite respuestas casi inmediatas en conversaciones de bajo volumen.
- Generacion de pareados o versos cortos para videojuegos y narrativa interactiva con ambientacion historica china, donde se necesita texto con la forma correcta y vocabulario de epoca mas que coherencia semantica profunda.
- Prototipado de pipelines de generacion con restricciones de formato estricto (longitud fija por verso, numero de versos fijo), como caso de estudio para tecnicas de decodificacion restringida antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta evaluaciones tipo MMLU, HumanEval, GSM8K ni metricas especificas de generacion poetica (como BLEU, perplexity sobre test externo o evaluacion humana). Los unicos datos cuantitativos publicados son las perdidas de entrenamiento y validacion, que no constituyen un benchmark comparable entre modelos.

| Metrica reportada | Valor |
|---|---|
| Perdida final de entrenamiento | 3,59 |
| Perdida final de validacion | 3,91 |
| Pasos de entrenamiento | 10.000 |
| Tamano de batch | 64 secuencias x 128 caracteres |
| Tasa de aprendizaje | 0,001 con decaimiento coseno |

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB. Con 13,1 M de parametros, el modelo ocupa aproximadamente 50 MB en fp32 y unos 26 MB en fp16, mas el estado de la cache KV, insignificante con 128 tokens de contexto.
- GPU recomendadas: cualquiera. El autor lo entreno en una RTX 3060 de 12 GB, pero tambien funciona en GPUs integradas y en CPU. No tiene sentido reservar una A100 o una H100 para este modelo salvo para servir muchas peticiones concurrentes.
- Cabe en cualquier GPU de consumo: RTX 3060, RTX 4090, GTX 1650 e incluso iGPU. Tambien cabe en moviles y dispositivos de borde.
- Opciones de despliegue: `transformers` con `pipeline("text-generation")`, ONNX Runtime (hay exportacion ONNX en el repositorio), text-generation-inference (el repositorio lleva la etiqueta `endpoints_compatible`) y vLLM de forma tecnica aunque sobredimensionado. Para llama.cpp u Ollama seria necesaria una conversion manual a GGUF, que no se distribuye oficialmente.
- Latencia y throughput: no hay mediciones independientes publicadas. El autor afirma que en un ordenador corriente con CPU el modelo genera un poema en aproximadamente un segundo; con las opciones de generacion por defecto (temperature 0,8, top_k 40) y un maximo practico de 56 caracteres de salida, la latencia en GPU deberia ser de decenas de milisegundos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Datos de entrenamiento | Licencia | Idiomas | Disponibilidad |
|---|---|---|---|---|---|---|
| Sanool/tang-poem-lite | 13,1 M | 128 caracteres | 219.615 poemas de 全唐诗 y 全宋诗, ~10 M de caracteres, 10.000 pasos | MIT | Chino clasico (simplificado) | safetensors y ONNX en HuggingFace |
| uer/gpt2-chinese-poem | Aproximadamente 100 M (segun el autor, ocho veces mayor) | No disponible en la informacion proporcionada | 800.000 poemas, ~100 M de caracteres, 200.000 pasos, cubre varios generos | No disponible en la informacion proporcionada | Chino clasico (tradicional) | HuggingFace |
| Otros modelos de poesia china | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparacion se limita a los dos modelos citados en la model card. Frente a uer/gpt2-chinese-poem, tang-poem-lite es aproximadamente ocho veces mas pequeno, se centra exclusivamente en poesia regulada, produce salida en caracteres simplificados y su entrenamiento es reproducible en una GPU domestica en diez minutos. No se dispone de datos verificados de otros modelos comparables en la informacion proporcionada, ni de evaluaciones que permitan afirmar cual genera mejor poesia.

## Limitaciones y advertencias

- Solo reproduce la forma del genero: el autor advierte que la metrica (numero de caracteres por verso y numero de versos) y las imagenes tipicas suelen ser correctas, pero el tono (平仄) y la rima no son estrictos en la mayoria de los casos y el significado rara vez resiste una lectura atenta.
- Vocabulario cerrado: cualquier caracter fuera de los 6350 del vocabulario se convierte en `[UNK]`, lo que degrada la generacion, especialmente si se usa como inicio. Esto excluye caracteres modernos y nombres propios actuales.
- Riesgo de memorizacion: el autor reconoce que algunas salidas coinciden literalmente con versos del conjunto de entrenamiento, lo que puede generar problemas de originalidad o de derechos si se usa con fines creativos comerciales.
- Riesgo de alucinacion: aunque en formato poetico no se manifiesta como afirmaciones factuales, si produce combinaciones semanticamente incoherentes o versos que aparentan sentido sin tenerlo.
- Sesgos: el corpus procede exclusivamente de poesia de las dinastias Tang y Song, por lo que hereda su marco cultural, su vision de genero y su perspectiva historica. No hay filtrado de sesgos ni ajuste por retroalimentacion humana.
- Idioma unico: no entiende ni genera espanol, ingles ni chino moderno conversacional. No es util como modelo multilingue ni como asistente general.
- Contexto muy corto: 128 tokens impiden mantener conversaciones, resumir documentos o gestionar cualquier tarea que requiera memoria mas alla de un poema individual.
- Sin soporte de instrucciones ni plantilla de chat: no responde a prompts de tipo asistente ni sigue ordenes complejas.
- Licencia: el modelo se publica bajo MIT, lo que permite uso comercial, modificacion y redistribucion. El corpus de origen, chinese-poetry, tambien es MIT. Aun asi, conviene verificar la procedencia de los textos originales si se va a explotar comercialmente el contenido generado.
- Madurez: el repositorio no tiene descargas ni valoraciones registradas en el momento de la consulta, y no hay evidencia de uso en produccion ni de mantenimiento posterior a la publicacion.
- Para produccion, conviene anadir un filtro posterior que verifique rima y metrica, ya que el modelo no las garantiza por si mismo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Sanool/tang-poem-lite
- Repositorio del corpus: https://github.com/chinese-poetry/chinese-poetry
- Modelo comparable citado por el autor: https://huggingface.co/uer/gpt2-chinese-poem
- Imagen de curvas de perdida incluida en el repositorio: `loss.png` en el propio repositorio del modelo
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante sobre este modelo en la busqueda realizada; los resultados devueltos no guardan relacion con tang-poem-lite ni con modelos de lenguaje.
