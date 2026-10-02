# caleb-marks/hoppop-agent-v2b

## Resumen

hoppop-agent-v2b es un ajuste fino mediante LoRA del modelo base Qwen/Qwen3.5-2B, publicado por el usuario caleb-marks en HuggingFace. El objetivo declarado en la model card es servir como asistente local en un iPhone: gestion de recordatorios, creacion de eventos de calendario y consulta de la agenda, con un tono de respuesta corto y calido. El modelo se distribuye en formato MLX con cuantizacion de 4 bits, lo que lo orienta especificamente al ecosistema Apple Silicon (Mac y dispositivos iPhone/iPad).

El repositorio ocupa 1,1 GB y contiene 1.881.825.088 parametros segun los metadatos de safetensors, un orden de magnitud coherente con los aproximadamente 2.000 millones de parametros del modelo base. La licencia es Apache-2.0, heredada del modelo base, y el entrenamiento se realizo exclusivamente con ejemplos sinteticos, sin datos reales de usuario.

Se trata de un modelo muy pequeno, con 13 descargas y 0 likes en el momento de redactar esta ficha, y sin resultados de evaluacion publicados. Su relevancia es acotada: ilustra el patron de especializacion de un LLM de ~2B para tool calling en dispositivo, priorizando privacidad y latencia baja sobre capacidad generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en detalle; derivada del modelo base Qwen/Qwen3.5-2B (familia Qwen3.5, transformer decoder-only) |
| Parametros totales | 1.881.825.088 (dato de safetensors); el modelo base se denomina Qwen3.5-2B |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (etiqueta 4-bit); no se documentan otras variantes |
| Idiomas soportados | no disponible; la model card describe un asistente en un unico idioma, sin especificar cual |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en formato MLX (libreria mlx) |
| Tamano del repositorio | 1,1 GB |
| Fecha de creacion | 2026-10-02 |
| Ultima actualizacion | 2026-10-02 |
| Descargas / likes | 13 / 0 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo. Se sabe que es un ajuste fino mediante LoRA de Qwen/Qwen3.5-2B, un modelo de la familia Qwen3.5 con aproximadamente 2.000 millones de parametros. No se especifica el numero de capas, cabezas de atencion, dimension del modelo ni si se emplean tecnicas como atencion lineal o decodificacion especulativa. Tampoco se indica si los adaptadores LoRA se publican fusionados con los pesos base o por separado; el recuento de parametros del repositorio es coherente con el tamano del modelo base, lo que sugiere pesos consolidados, pero es una inferencia y no un dato documentado.

En cuanto al entrenamiento, la model card unicamente declara que el ajuste se realizo "solo con ejemplos sinteticos". No se publican el numero de tokens de entrenamiento, la composicion del dataset, la mezcla de idiomas ni si hubo fases de RLHF, DPO u otro tipo de alineamiento posterior. Tampoco se documentan hiperparametros, duracion del entrenamiento ni la configuracion del LoRA (rango, alpha, modulos objetivo).

## Capacidades

- Generacion de texto corto con un registro descrito como "breve y calido", orientado a respuestas de asistente personal.
- Tool calling / function calling: es la capacidad central del modelo, segun la etiqueta `tool-calling` y la descripcion de la model card.
- Creacion de recordatorios mediante llamadas a herramientas.
- Creacion y gestion de eventos de calendario.
- Consulta de la agenda o el horario del usuario.
- Ejecucion en dispositivo (on-device) mediante MLX, sin necesidad de conexion a servidores externos.
- Razonamiento multi-paso y comportamiento agentico: no documentado explicitamente, aunque el nombre del modelo ("agent") y la orientacion a tool calling lo sugieren; no hay evidencia publicada.
- Capacidades multilingues: no disponibles.
- Vision, audio o modo de razonamiento explicito (thinking mode): no disponibles.

## Casos de uso

- Asistente de recordatorios en iPhone: el modelo recibiria una frase del usuario ("recuerdame llamar a Ana manana a las nueve"), extraeria la intencion y los parametros, y emitiria una llamada a la API de Recordatorios de iOS. Su tamano de ~2B y su cuantizacion de 4 bits permiten ejecutarlo localmente sin coste de inferencia en la nube.
- Gestion de eventos de calendario: creacion, modificacion o cancelacion de eventos a partir de lenguaje natural, invocando la API de EventKit. La ventaja es la privacidad: los datos de agenda no abandonan el dispositivo.
- Consulta de disponibilidad y agenda: el modelo puede responder a preguntas del tipo "que tengo el jueves por la tarde" resolviendo la consulta contra el calendario local y resumiendo el resultado en una frase corta.
- Automatizacion personal con atajos y agentes locales: integrado en un flujo de Apple Shortcuts, el modelo puede actuar como enrutador de intenciones que decide que herramienta invocar en cada peticion.
- Prototipado de agentes on-device con MLX: sirve como punto de partida para desarrolladores que quieran experimentar con tool calling en Apple Silicon usando `mlx-lm`, sin depender de APIs externas.
- Base para nuevos ajustes finos: al ser un LoRA sobre Qwen3.5-2B con licencia Apache-2.0, puede reutilizarse como semilla para especializaciones adicionales en otros dominios de asistente personal.
- Clasificacion ligera de intenciones en aplicaciones moviles: uso como componente de enrutamiento (por ejemplo, distinguir entre "crear recordatorio", "crear evento" y "consultar agenda") en lugar de como generador de texto libre.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K, BFCL ni ninguna otra evaluacion, y la busqueda web realizada no devolvio datos especificos sobre este modelo, unicamente rankings genericos de terceros que no lo incluyen.

## Requisitos de hardware

- Peso de los pesos en disco: 1,1 GB (repositorio completo en safetensors MLX con cuantizacion de 4 bits).
- VRAM estimada para inferencia: en torno a 1,5-2,5 GB considerando pesos mas cache KV; la cifra exacta depende de la longitud de contexto, que no esta documentada. Calculo derivado del recuento de parametros y del tamano del repositorio, no de una medicion publicada.
- Cabe en GPU de consumo: si, en cualquier GPU con 4 GB o mas de VRAM si se convierte el modelo a un runtime CUDA. En su formato original MLX requiere Apple Silicon.
- Hardware objetivo: iPhone (uso declarado en la model card) y Macs con chip de la serie M. Necesita del orden de 2-3 GB de memoria libre en el dispositivo.
- GPUs recomendadas para despliegue en servidor: no aplica de forma nativa; el formato MLX no es compatible con CUDA. Para servidores haria falta convertir los pesos.
- Opciones de despliegue: `mlx-lm` (ruta natural, libreria declarada `mlx`). Otros runtimes como llama.cpp, Ollama, vLLM o TGI requeririan conversion previa a GGUF o safetensors de HF, que no se proporciona en el repositorio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de terceros comparables en la informacion proporcionada. La unica referencia documentada es el propio modelo base.

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| hoppop-agent-v2b | 1.881.825.088 | no disponible | 4 bits | apache-2.0 | safetensors MLX |
| Qwen/Qwen3.5-2B (base) | ~2B (nominal) | no disponible | no disponible | apache-2.0 (segun el autor) | safetensors |
| Otros modelos de ~2B con tool calling | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Entrenado exclusivamente con ejemplos sinteticos: la generalizacion a formulaciones reales, acentos, errores tipograficos o peticiones ambiguas es incierta y no esta evaluada.
- Riesgo de alucinacion en datos estructurados: al generar llamadas a herramientas con fechas, horas y titulos, existe riesgo de producir argumentos plausibles pero incorrectos (por ejemplo, una fecha mal calculada) sin que el modelo lo senale.
- Sin benchmarks publicados: no hay evidencia objetiva de su calidad en tool calling ni de su tasa de exito en la invocacion correcta de funciones.
- Alcance funcional muy reducido: la model card limita el modelo a recordatorios, calendario y consulta de agenda. No se documentan otras capacidades.
- Idiomas no especificados: no hay informacion sobre cobertura multilingue; un uso en castellano no esta verificado.
- Longitud de contexto desconocida: limita la capacidad de mantener conversaciones largas o de procesar contextos extensos de agenda.
- Dependencia del ecosistema Apple: el formato MLX restringe el despliegue directo a Apple Silicon. Migrarlo a CUDA o a servidores exige conversion y revalidacion.
- Madurez muy baja: 13 descargas, 0 likes, repositorio creado y actualizado el mismo dia, sin historial de mantenimiento ni issues.
- Licencia: Apache-2.0 permite uso comercial y modificacion, pero el autor la declara heredada del modelo base; conviene verificar los terminos de Qwen/Qwen3.5-2B antes de un uso en produccion.
- Sin pipeline declarado en HuggingFace, lo que complica la integracion automatica con herramientas que dependen de ese campo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/caleb-marks/hoppop-agent-v2b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Leaderboard generico de modelos (sin datos especificos de este modelo): https://artificialanalysis.ai/leaderboards/models
- Leaderboard generico de modelos (sin datos especificos de este modelo): https://benchlm.ai/
- Seguimiento de lanzamientos de modelos (sin datos especificos de este modelo): https://lmmarketcap.com/tools/model-release-tracker

No se han encontrado papers, blogs tecnicos, repositorios de codigo ni demos asociados a este modelo en la busqueda web realizada.
