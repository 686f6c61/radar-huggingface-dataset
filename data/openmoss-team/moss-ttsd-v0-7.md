# OpenMOSS-Team/MOSS-TTSD-v0.7

## Resumen

MOSS-TTSD v0.7 (text to spoken dialogue) es un modelo open source de síntesis de habla conversacional bilingüe chino-inglés desarrollado por OpenMOSS-Team (MOSS AI). Su función es transformar un guion de diálogo entre dos hablantes en audio conversacional natural y expresivo, con capacidad de clonación de voz zero-shot de ambos interlocutores y conmutación de hablante automática según las marcas del guion.

El modelo se construye sobre Qwen/Qwen3-1.7B-Base como backbone de lenguaje y un códec neural de audio semántico-acústico unificado (XY_Tokenizer_TTSD_V0), con un total de 2.049.551.360 parámetros en safetensors y un repositorio de 4,1 GB. Está entrenado con millones de horas de datos TTS y habla conversacional, lo que le permite generar hasta 1700 segundos de audio en una sola sesión, un registro especialmente orientado a la producción de pódcasts con IA.

Su relevancia actual radica en que combina licencia Apache 2.0 (uso comercial libre), clonación de voz de dos hablantes en zero-shot y generación de formato largo, capacidades poco frecuentes conjuntamente en modelos TTS abiertos de este tamaño. El modelo está etiquetado con `custom_code`, por lo que requiere `trust_remote_code=True` en su carga.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLM backbone (Qwen3-1.7B-Base) + codec neural de audio semántico-acústico unificado (XY_Tokenizer_TTSD_V0) |
| Parametros totales | 2.049.551.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (generación de audio de hasta 1700 s por sesión) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

MOSS-TTSD sigue un esquema de TTS basado en LLM: el backbone Qwen3-1.7B-Base procesa el guion textual tokenizado junto con las referencias de audio y genera tokens de audio que un codec neural semántico-acústico unificado decodifica a forma de onda a 24 kHz. El codec opera a baja tasa de bits, lo que resulta clave para permitir sesiones largas (hasta 1700 segundos) sin agotar la ventana del modelo. El pipeline se invoca mediante `AutoProcessor` y `AutoModel` de Transformers con `trust_remote_code=True`, y el codec se referencia aparte como `OpenMOSS-Team/XY_Tokenizer_TTSD_V0_hf`.

El entrenamiento combina millones de horas de datos TTS y de habla conversacional, con optimizaciones específicas del framework para generación de audio largo. El modelo soporta clonación de voz zero-shot de dos hablantes: el guion usa marcas `[S1]` y `[S2]` para delimitar turnos y el prompt de referencia incluye el texto asociado a cada hablante. No se detalla en la información disponible si hubo etapas de RLHF o DPO, ni la composición exacta del dataset.

## Capacidades

- Síntesis de habla conversacional (text-to-spoken-dialogue) a partir de guiones con dos hablantes.
- Clonación de voz zero-shot de dos interlocutores simultáneamente.
- Conmutación de hablante automática y precisa siguiendo las marcas `[S1]`/`[S2]` del guion.
- Generación de audio de formato largo: hasta 1700 segundos en una sola sesión.
- Soporte bilingüe chino-inglés con prosodia conversacional expresiva.
- Salida de audio a 24 kHz.
- No se documenta soporte de tool calling, function calling, agentes, visión ni audio de entrada más allá de las referencias de voz para clonación.

## Casos de uso

- Producción de pódcasts con IA: el modelo convierte un guion de dos presentadores en un episodio completo con voces clonadas y turnos naturales; la ventana de 1700 segundos permite generar episodios extensos en una sola pasada sin fragmentar el audio.
- Audiolibros y ficción sonora dialogada: permite asignar voces distintas a dos personajes y alternar turnos automáticamente a partir del texto, manteniendo coherencia de timbre en cada hablante.
- Doblaje y localización de contenido conversacional: con clonación zero-shot de las voces originales y soporte zh/en, se pueden generar versiones en el otro idioma preservando la identidad vocal de los interlocutores.
- Generación de contenido para redes y formación: creación de diálogos explicativos o entrevistas simuladas para vídeos corporativos y materiales e-learning, con coste marginal bajo al ser open source y Apache 2.0.
- Prototipado de asistentes conversacionales con voz: generación de respuestas habladas de dos roles (por ejemplo, agente y usuario simulado) para evaluar flujos de voz antes de integrar un TTS en producción.
- Investigación en TTS y habla conversacional: al ser un modelo abierto con backbone Qwen3-1.7B, sirve como base para experimentos de clonación de voz, prosodia conversacional y generación de audio largo, así como para fine-tuning sobre dominios específicos.
- Accesibilidad y lectura dramatizada: conversión de guiones y transcripciones en audio expresivo con múltiples voces para personas con dificultades de lectura o para consumo en formato audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 2.049.551.360 parámetros, en fp16 el peso ronda los 4,1 GB, por lo que se necesita margen adicional para el codec, el procesador y los estados de generación de audio largo.
- GPU recomendadas: no especificadas por el autor; por tamaño, una GPU con 16 GB o más (RTX 4090, A100, H100) ofrece margen holgado para fp16 y generación de formato largo.
- Viabilidad en GPU de consumo: probable en tarjetas con 16-24 GB de VRAM (RTX 4090, RTX 3090) en fp16; en GPUs de 8-12 GB no hay datos oficiales y la generación de 1700 segundos puede requerir gestión de memoria adicional.
- Opciones de despliegue: Transformers con `trust_remote_code=True` y `device_map="auto"` (procedimiento documentado en la model card); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, dado que la salida es de audio y depende de código personalizado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto / duracion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MOSS-TTSD v0.7 | 2.049.551.360 | zh, en | hasta 1700 s por sesion | Apache 2.0 | Hugging Face |
| Alternativas TTS abiertas de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos de benchmarks ni de especificaciones de modelos comparables que permitan una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Solo soporta chino e inglés; no hay soporte documentado de otros idiomas.
- Requiere `trust_remote_code=True` y código personalizado (`custom_code`), lo que implica revisar el código del repositorio antes de desplegarlo en producción.
- El codec se distribuye como repositorio separado (`OpenMOSS-Team/XY_Tokenizer_TTSD_V0_hf`); su disponibilidad y versionado deben gestionarse junto al modelo principal.
- La clonación de voz zero-shot conlleva riesgos de suplantación de identidad y uso indebido; es responsabilidad del integrador aplicar consentimiento y controles.
- Riesgo de alucinación o desviación prosódica en guiones largos o con marcas de hablante mal formadas; no hay métricas publicadas de robustez.
- No se documentan sesgos específicos de voces, acentos o género en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero las condiciones sobre los datos de entrenamiento y las voces de referencia no se detallan en la model card.
- No se documentan requisitos de hardware ni latencias, lo que dificulta planificar capacidad en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenMOSS-Team/MOSS-TTSD-v0.7
- Codec XY_Tokenizer_TTSD_V0: https://huggingface.co/OpenMOSS-Team/XY_Tokenizer_TTSD_V0_hf
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
- Web de MOSS AI: https://www.moss-ai.com/models/moss-ttsd
- Documentación de la API de MOSS: https://platform.moss.cn/en/docs/scenarios/dialogue
