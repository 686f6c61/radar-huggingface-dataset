# samuelolubukun/moonshine-tiny-nigerian-accented-english

## Resumen

Moonshine-tiny Nigerian Accented English es un ajuste fino del modelo de reconocimiento automatico del habla (ASR) UsefulSensors/moonshine-tiny, desarrollado por Samuel Olubukun. El modelo parte de una arquitectura encoder-decoder transformer de aproximadamente 27 millones de parametros y se ha especializado en transcribir ingles con acento nigeriano, un dominio poco cubierto por los sistemas ASR genericos entrenados predominantemente con habla anglosajona.

El problema que aborda es la degradacion del rendimiento de los ASR convencionales ante variantes acentuadas del ingles. Aunque el modelo base ya es muy compacto, el ajuste fino sobre el corpus benjaminogbonna/nigerian_accented_english_dataset busca adaptar el vocabulario y la representacion acustica a patrones foneticos nigerianos. Con un RTF declarado de 0,051x (unas 19,6 veces mas rapido que tiempo real), esta pensado para escenarios de baja latencia en dispositivos moviles y agentes de voz.

La relevancia actual reside en su tamano reducido (27M de parametros, repo de 0,1 GB) y su licencia Apache 2.0, que facilitan el despliegue en entornos con recursos limitados. No obstante, los resultados publicados en el propio model card muestran un WER normalizado del 65,2% en el conjunto de test reservado, una cifra muy alta que conviene interpretar con cautela antes de considerarlo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder transformer (Moonshine) |
| Parametros totales | 27.093.312 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el autor no documenta GGUF ni otras) |
| Idiomas soportados | en (ingles, con acento nigeriano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Moonshine de UsefulSensors, un transformer encoder-decoder disenado especificamente para ASR y optimizado para baja latencia frente a Whisper en entradas cortas. El checkpoint base es moonshine-tiny, con unos 27M de parametros, y el ajuste fino se realizo sobre el corpus benjaminogbonna/nigerian_accented_english_dataset.

El entrenamiento consistio en 3.000 pasos de optimizacion con AdamW y decaimiento coseno, ejecutado en una NVIDIA A10G (24 GB) con precision mixta Float16/BFloat16. El model card menciona tambien una "extended dialect vocabulary" (vocabulario dialectal extendido), aunque no se detalla su composicion ni el numero de tokens de entrenamiento. No se documenta el uso de RLHF, DPO ni tecnicas de decodificacion especulativa. La entrada de audio se define a 16 kHz, 16 bits, mono PCM.

## Capacidades

- Transcripcion de voz a texto (ASR) en ingles con acento nigeriano, sobre audio limpio de campo cercano (telefonia, auricular o notas de voz de smartphone) a 16 kHz.
- Procesamiento de audio en tiempo real con un RTF de 0,051x y latencia inferior a 200 ms para clips de 4 segundos.
- Generacion con presupuesto dinamico de tokens (aproximadamente 7 tokens por segundo de audio, con rango de 25 a 90 tokens) y decodificacion por beams (num_beams=2) con penalizacion de repeticion.
- Normalizacion de texto opcional mediante BasicTextNormalizer de Whisper para el calculo de WER/CER.
- No se documentan capacidades de tool calling, agentes, vision, audio de salida ni razonamiento multi-paso.
- Capacidad multilingue limitada al ingles; el ajuste se orienta a una unica variante acentuada.

## Casos de uso

- Transcripcion de notas de voz en aplicaciones moviles: el tamano de 27M de parametros y el RTF de 0,051x permiten ejecucion en dispositivo o en servidores modestos, transcribiendo grabaciones cortas de usuarios nigerianos con baja latencia.
- Dictado por voz en herramientas ofimaticas: el modelo puede integrarse en editores o formularios para convertir habla en texto en tiempo real, siempre que el audio sea limpio y el dominio vocabulario acotado.
- Atencion al cliente telefonica con acento nigeriano: util para pretranscribir llamadas de centros de contacto y alimentar sistemas de analitica o busqueda, aunque el WER del 65,2% exige revision humana o un modelo mayor en produccion.
- Subtitulado asistido de contenido corto: para clips de redes sociales o videos breves donde la velocidad prima sobre la precision absoluta y se acepta una capa de correccion posterior.
- Prototipado e investigacion en ASR para variedades africanas del ingles: sirve como baseline ligero y reproducible para comparar estrategias de ajuste fino sobre corpus acentuados.
- Voice agents embebidos: al ser un modelo de 0,1 GB, puede desplegarse en entornos edge o contenedores pequenos para comandos de voz de vocabulario restringido, con validacion previa de su tasa de error en el dominio concreto.

## Benchmarks y rendimiento

Resultados publicados en el model card sobre el conjunto de test reservado, con normalizacion estandar de texto (minusculas, eliminacion de puntuacion y normalizacion de espacios):

| Metrica | Valor |
|---|---|
| WER normalizado | 65,2% |
| CER normalizado | 55,8% |
| Real-Time Factor (RTF) | 0,051x |
| Latencia por audio de 4 s | < 200 ms |

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en Float16 (27M de parametros); en la practica cabe en cualquier GPU consumer, e incluso en CPU para audio corto.
- GPU recomendadas: NVIDIA A10G (usada en el entrenamiento), RTX 4090, RTX 3060 o superiores; tambien valido en GPUs integradas y en CPU para cargas ligeras.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con soporte CUDA, y en CPU con latencia aceptable para clips cortos.
- Opciones de despliegue: transformers (AutoModelForSpeechSeq2Seq + AutoProcessor), tal como documenta el autor. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (son entornos orientados a LLM, no a este ASR).
- Latencia y throughput: RTF de 0,051x y menos de 200 ms por audio de 4 segundos segun el autor, medido en su entorno de evaluacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER (test del autor) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| moonshine-tiny-nigerian-accented-english | 27M | no disponible | 65,2% (normalizado) | Apache 2.0 | Hugging Face |
| UsefulSensors/moonshine-tiny (base) | ~27M | no disponible | no disponible en esta ficha | no disponible en esta ficha | Hugging Face |
| Whisper tiny | ~39M | 30 s de audio | no disponible en esta ficha | MIT (segun el proyecto Whisper) | Hugging Face / OpenAI |
| Whisper medium/large | cientos de millones a 1,5B | 30 s de audio | no disponible en esta ficha | MIT (segun el proyecto Whisper) | Hugging Face / OpenAI |

Los datos de Whisper y del modelo base no se han verificado en la informacion proporcionada; se incluyen solo como referencia de categoria. El autor recomienda modelos mayores (Whisper Medium/Large) para audio de difusion largo y multihablante.

## Limitaciones y advertencias

- WER normalizado del 65,2% en el test reservado: es una tasa de error muy elevada para uso en produccion sin revision humana; los ejemplos cualitativos del model card muestran sustituciones y errores de nombres propios ("Indentured" por "ancient", "Olaudah Equiano" por "Olawda Ekwano").
- Arquitectura ultracompacta de 27M de parametros: capacidad de vocabulario limitada; el propio autor desaconseja su uso en audio de difusion largo o multihablante.
- Requiere audio limpio de campo cercano a 16 kHz; el rendimiento cae con ruido, reverberacion o microfonos lejanos.
- Solo soporta ingles con acento nigeriano; no cubre otras lenguas nigerianas ni variantes regionales no representadas en el corpus de ajuste.
- Riesgo de alucinacion en la transcripcion: sustitucion de palabras por terminos plausibles acusticamente, como se observa en los ejemplos publicados.
- No se documentan sesgos especificos ni composicion detallada del dataset de entrenamiento, lo que dificulta evaluar su representatividad.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene validar el modelo en el dominio concreto antes de desplegarlo.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validacion practicamente inexistente.

## Enlaces

- Hugging Face: https://huggingface.co/samuelolubukun/moonshine-tiny-nigerian-accented-english
- Modelo base: https://huggingface.co/UsefulSensors/moonshine-tiny
- Dataset de entrenamiento: https://huggingface.co/datasets/benjaminogbonna/nigerian_accented_english_dataset
- Web del autor: https://samuelolubukun.com
- GitHub del autor: https://github.com/samolubukun
- Hugging Face del autor: https://huggingface.co/samuelolubukun
