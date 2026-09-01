# Jay-Lab/ChronoNano1.0-10M

## Resumen

ChronoNano 1.0 10M es un modelo neuronal compacto desarrollado por Jay-Lab, especializado en el análisis de expresiones temporales en lenguaje natural. A diferencia de los modelos generativos de texto, su función es convertir frases como "mañana", "los últimos 3 meses" o "entre las 3 y las 5 de la tarde" en una representación semántica estructurada que puede resolverse de forma determinista a un intervalo de tiempo (`DateTimeRange`). Está diseñado para tareas de clasificación de texto, concretamente para el etiquetado y extracción de información temporal.

El modelo emplea una arquitectura encoder-decoder basada únicamente en atención, con 12 capas en el encoder y 5 en el decoder, y un total de 10.733.483 parámetros entrenables. Procesa la entrada como bytes UTF-8 enriquecidos con características léxicas y n-gramas de bytes, y produce dos salidas complementarias: una estructura semántica fija de 40 ranuras y predicciones de punteros extractivos para recuperar valores literales del texto original. Su licencia es Apache 2.0 y soporta los idiomas inglés y polaco.

La relevancia de este modelo radica en su enfoque especializado y ligero: al no ser un modelo generativo, ofrece una alternativa eficiente y determinista para el parseo de tiempo, un componente crítico en sistemas de calendario, asistentes virtuales y análisis de logs. Su tamaño reducido permite su integración en entornos con recursos limitados, aunque no se han publicado datos oficiales sobre requisitos de hardware.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder basado en atención (12 capas encoder, 5 capas decoder) |
| Parametros totales | 10.733.483 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Máximo 256 bytes UTF-8 + token CLS |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en), polaco (pl) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (probablemente safetensors o binario, no especificado) |

## Arquitectura y entrenamiento

ChronoNano 1.0 10M utiliza una arquitectura encoder-decoder puramente atencional, sin capas convolucionales ni mecanismos de memoria recurrente. El encoder, de 12 capas y 8 cabezas de atención con una anchura de modelo (`d_model`) de 320, procesa la entrada compuesta por 258 IDs de vocabulario de bytes, 53 características léxicas y n-gramas de bytes de 2 a 5 bytes. El decoder, de 5 capas, genera una secuencia fija de 40 tokens semánticos (vocabulario de 245 tokens) que describen el significado temporal. Además, un subsistema de punteros con 14 roles extractivos predice la presencia, inicio y fin de valores literales (números, fechas, horas) en el texto original.

El entrenamiento no está documentado en la información disponible: no se especifican el número de tokens, la composición del dataset ni si se emplearon técnicas como RLHF o DPO. La salida neuronal se separa deliberadamente del cálculo calendario: un resolvedor determinista externo combina la semántica decodificada con una fecha/hora de referencia y produce un intervalo semiabierto `[desde, hasta)`. El decodificador puede usar búsqueda de haz para generar múltiples candidatos estructurados, que luego se seleccionan aguas abajo.

## Capacidades

- Parseo de expresiones temporales en lenguaje natural: convierte frases como "mañana", "la semana pasada" o "entre las 3 y las 5 PM" en estructuras semánticas normalizadas.
- Extracción extractiva de valores literales: identifica números, fechas y horas dentro del texto original mediante 14 roles de puntero.
- Generación de múltiples candidatos: mediante decodificación por haz, produce varias interpretaciones estructuradas para que un sistema externo elija la más adecuada.
- Resolución determinista a intervalos de tiempo: la salida semántica se combina con una referencia temporal para obtener un rango `[inicio, fin)`.
- Soporte multilingüe limitado: funciona en inglés y polaco.
- Entrada de longitud fija: acepta hasta 256 bytes UTF-8, suficiente para expresiones temporales típicas.

## Casos de uso

- Asistentes de calendario y programación: el modelo puede interpretar comandos como "reunión el próximo martes a las 10" y convertirlos en intervalos de tiempo concretos para crear eventos en aplicaciones de agenda.
- Análisis de logs y monitorización: extraer rangos temporales de mensajes de log (p. ej., "error entre las 2 y las 4 de la madrugada") para filtrar y correlacionar eventos en sistemas de observabilidad.
- Búsqueda y filtrado por tiempo en bases de datos: transformar consultas en lenguaje natural como "pedidos de los últimos 3 meses" en condiciones SQL o de API con rangos de fechas precisos.
- Automatización de tareas de procesamiento de documentos: extraer fechas y horas de contratos, facturas o correos electrónicos para su indexación y posterior recuperación.
- Chatbots de atención al cliente: interpretar solicitudes como "¿cuándo llega mi pedido?" y traducirlas a consultas temporales sobre el estado del envío.
- Sistemas de recordatorios y notificaciones: convertir frases como "recuérdame en 2 horas" en disparadores temporales exactos para alarmas o notificaciones push.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- No se han publicado requisitos oficiales de hardware.
- Dado su tamaño (10,7 millones de parámetros), es previsible que el modelo se ejecute en CPU o GPU de gama baja, pero no hay datos confirmados.
- No se dispone de información sobre VRAM, latencia o throughput.
- No se mencionan opciones de despliegue específicas (vLLM, llama.cpp, etc.), aunque al ser un modelo pequeño podría integrarse en frameworks estándar de PyTorch o TensorFlow.

## Comparativa con modelos similares

No disponible. No se ha encontrado información sobre modelos comparables en la misma categoría (parseo de expresiones temporales) en los datos proporcionados.

## Limitaciones y advertencias

- El modelo no genera texto: su única función es el parseo de expresiones temporales; no es adecuado para tareas de generación o conversación.
- Soporte de idiomas limitado a inglés y polaco; no se ha verificado su comportamiento en otros idiomas.
- Longitud de entrada máxima de 256 bytes UTF-8; expresiones más largas podrían truncarse o no procesarse correctamente.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado con datos no especificados, podría presentar sesgos en las interpretaciones temporales según el contexto cultural o lingüístico.
- La resolución final depende de un resolvedor externo no incluido en el modelo; la integración requiere implementar ese componente.
- No se ha publicado información sobre el proceso de entrenamiento, lo que dificulta evaluar su robustez y generalización.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar los términos completos.

## Enlaces

- [HuggingFace - Jay-Lab/ChronoNano1.0-10M](https://huggingface.co/Jay-Lab/ChronoNano1.0-10M)
- [GitHub - jay-ai-lab/jay-ai-lab](https://github.com/jay-ai-lab/jay-ai-lab) (perfil del autor, no se confirma que contenga el repositorio del modelo)
