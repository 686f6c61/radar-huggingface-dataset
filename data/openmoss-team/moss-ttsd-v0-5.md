# OpenMOSS-Team/MOSS-TTSD-v0.5

## Resumen

MOSS-TTSD-v0.5 (text to spoken dialogue) es un modelo de sintesis de voz conversacional bilingue (chino e ingles) desarrollado por OpenMOSS-Team. Su proposito es transformar guiones de dialogo entre dos hablantes en habla conversacional natural y expresiva, con capacidad de clonacion de voz zero-shot de ambos interlocutores y conmutacion de hablante controlada por marcadores en el texto. Esta construido sobre el modelo de lenguaje Qwen3-1.7B-Base, al que se anade un codec neural de audio semantico-acustico unificado.

El modelo resuelve un problema concreto: la generacion de audio conversacional de dos voces en una sola sesion, algo que la mayoria de sistemas TTS abordan sintetizando cada turno por separado y perdiendo naturalidad en la prosodia. MOSS-TTSD genera hasta 960 segundos de audio continuo en una unica sesion, lo que lo hace especialmente adecuado para produccion de podcasts con IA, audiolibros dialogados y doblaje conversacional.

Es relevante ahora porque combina licencia Apache 2.0 (uso comercial libre), un tamano contenido de aproximadamente 2.050 millones de parametros y soporte de voces clonadas sin entrenamiento adicional, lo que reduce la barrera de entrada frente a soluciones propietarias de sintesis conversacional. La version 0.5 corresponde a un refinamiento del modelo publicado originalmente en julio de 2025.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLM (Qwen3-1.7B-Base) + codec neural de audio semantico-acustico unificado |
| Parametros totales | 2.049.551.360 (aprox. 2,05 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (generacion de audio de hasta 960 segundos por sesion) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | chino (zh), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (custom_code, requiere trust_remote_code) |

## Arquitectura y entrenamiento

MOSS-TTSD se construye sobre Qwen/Qwen3-1.7B-Base como backbone de lenguaje, adaptado para producir tokens de audio a traves de un codec neural de audio semantico-acustico unificado de baja tasa de bits. El texto de entrada se procesa con marcadores de hablante (`[S1]`, `[S2]`) que el modelo aprende a mapear a la voz correspondiente, y la salida se decodifica a waveform a 24 kHz. El uso de un codec de baja tasa de bits es lo que permite mantener sesiones largas de hasta 960 segundos sin explotar la ventana de contexto del LLM.

El entrenamiento combina millones de horas de datos TTS junto con 400.000 horas de habla conversacional sintetica y real, segun la model card. No se detalla en la informacion disponible la composicion exacta del dataset, el numero total de tokens de entrenamiento ni si se aplicaron etapas de RLHF o DPO. La model card si menciona optimizaciones del marco de entrenamiento orientadas especificamente a la generacion de habla larga.

## Capacidades

- Sintesis de voz conversacional de dos hablantes a partir de un guion de dialogo.
- Clonacion de voz zero-shot de dos interlocutores a partir de audio de referencia.
- Conmutacion de hablante precisa controlada mediante marcadores `[S1]`/`[S2]` en el texto.
- Generacion de audio de hasta 960 segundos en una sola sesion.
- Soporte bilingue: chino e ingles.
- Prosodia conversacional expresiva, orientada a naturalidad en dialogos.
- Integracion con `transformers` mediante `AutoProcessor` y `AutoModel` con `trust_remote_code=True`.
- No se documenta soporte de tool calling ni de agentes; es un modelo puramente TTS.

## Casos de uso

- Produccion de podcasts con IA: el modelo convierte un guion de dos presentadores en audio conversacional continuo de hasta 16 minutos por sesion, con voces clonadas de locutores reales, evitando el montaje manual de turnos.
- Audiolibros dialogados: permite narrar escenas con dos personajes manteniendo voces consistentes y prosodia natural entre intervenciones, aprovechando la generacion de sesion larga.
- Doblaje de contenido conversacional: para entrevistas, tertulias o series cortas en chino o ingles, clonando las voces originales y respetando los turnos de palabra del guion.
- Prototipado de asistentes de voz: equipos que necesitan generar respuestas habladas de dos roles (por ejemplo, un asistente y un usuario simulado) para evaluar flujos conversacionales antes de invertir en TTS propietario.
- Generacion de material de entrenamiento para ASR: producir dialogos sinteticos bilingues con voces diversas y transcribirlos automaticamente para ampliar corpus de reconocimiento de habla.
- Contenido educativo y de e-learning: crear lecciones con formato de conversacion entre dos instructores o entre instructor y alumno, con voces clonadas de los docentes reales.
- Localizacion de contenido multimedia: regenerar pistas de audio en chino o ingles a partir de guiones traducidos, manteniendo la identidad vocal de los hablantes originales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con aproximadamente 2,05 mil millones de parametros, la inferencia en precision completa (fp16/bf16) requiere del orden de 4-5 GB solo para pesos, mas el codec de audio y los buffers de generacion de audio largo.
- GPU recomendadas: no especificadas por el autor; por tamano, una GPU con 16 GB o mas (RTX 4090, A100, H100) ofrece margen holgado para sesiones de 960 segundos.
- Cabe en GPU de consumo: previsiblemente si en GPUs con 8-12 GB o mas en fp16, aunque el autor no publica requisitos oficiales.
- Opciones de despliegue: el ejemplo oficial usa `transformers` con `AutoModel`/`AutoProcessor` y `trust_remote_code=True`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y al tratarse de un modelo TTS con codec propio estas integraciones no estan garantizadas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto / duracion | Licencia | Notas |
|---|---|---|---|---|---|
| MOSS-TTSD-v0.5 | ~2,05 B | zh, en | hasta 960 s de audio por sesion | Apache 2.0 | Dialogo de dos hablantes con clonacion zero-shot |
| Alternativas TTS conversacional de dos hablantes | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |
| Alternativas TTS generalistas open source | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

No se dispone de informacion suficiente para establecer una comparativa cuantitativa con modelos concretos de la misma categoria.

## Limitaciones y advertencias

- Solo soporta chino e ingles; no hay soporte documentado de castellano ni de otros idiomas.
- El modelo esta disenado exclusivamente para dialogo de dos hablantes; no se documenta sintesis de un solo hablante ni de mas de dos.
- Requiere `trust_remote_code=True` y un codec externo (`fnlp/XY_Tokenizer_TTSD_V0_hf`), lo que anade dependencias y superficie de ejecucion de codigo no auditado por el usuario.
- Riesgo de alucinacion acustica: en TTS esto se traduce en prosodia incorrecta, artefactos o pronunciacion erronea, especialmente en textos fuera de dominio.
- La clonacion de voz plantea riesgos de suplantacion y uso indebido; aunque la licencia Apache 2.0 permite uso comercial, el usuario debe cumplir la normativa aplicable sobre derechos de imagen y voz.
- No se documentan sesgos especificos del modelo en la informacion disponible.
- No se publican requisitos de hardware oficiales, latencias ni benchmarks, lo que dificulta la planificacion de produccion.
- El numero de descargas (203) y likes (54) es bajo, lo que sugiere una comunidad pequena y menor validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenMOSS-Team/MOSS-TTSD-v0.5
- Web oficial MOSS AI: https://www.moss-ai.com/models/moss-ttsd
- Documentacion de la API MOSS: https://platform.moss.cn/en/docs/scenarios/dialogue
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
- Codec de audio: https://huggingface.co/fnlp/XY_Tokenizer_TTSD_V0_hf
- Repositorio alternativo del modelo (referenciado en el codigo de la model card): https://huggingface.co/fnlp/MOSS-TTSD-v0.5
