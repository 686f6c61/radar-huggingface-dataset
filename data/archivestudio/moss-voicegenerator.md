# ArchiveStudio/MOSS-VoiceGenerator

## Resumen

MOSS-VoiceGenerator es un modelo de diseño de voz (voice design) publicado dentro de la familia MOSS-TTS de MOSI.AI y el equipo OpenMOSS. Su función es generar un timbre de hablante directamente a partir de una descripción en texto libre, sin necesidad de audio de referencia ni de un clip de clonación: el texto describe personaje, personalidad, edad, género o emoción, y el modelo sintetiza habla con ese timbre. Unifica en un solo paso el diseño del timbre, el control de estilo y la síntesis del contenido.

La ficha que se analiza aquí es un repositorio espejo de terceros (organización ArchiveStudio) del modelo oficial OpenMOSS-Team/MOSS-Voice-Generator. Los pesos en safetensors suman 2.114.118.656 parámetros (unos 2,11 B), aunque la tabla de la model card de la familia declara 1,7 B para la variante MossTTSDelay; el repositorio ocupa 4,2 GB, lo que es coherente con pesos en bf16/fp16 más los artefactos del códec de audio.

Es relevante porque cubre un hueco poco poblado en el ecosistema abierto: la creación de voces nuevas a partir de descripciones, en lugar de la clonación de voces existentes. Se publica bajo licencia Apache 2.0, con 0 descargas y 0 likes en el momento de la consulta, y sin paper (arXiv anunciado como próximo). No hay datos públicos de benchmarks, contexto ni latencia en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MossTTSDelay (transformer autorregresivo sobre tokens de audio de un códec neural; etiqueta `moss_tts_delay` en el repo) |
| Parametros totales | 2.114.118.656 (2,11 B) según safetensors; la model card de la familia declara 1,7 B para esta variante |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No se publican cuantizaciones oficiales; pesos distribuidos en safetensors (repo de 4,2 GB, compatible con bf16/fp16). Conversión a int8/4-bit no verificada |
| Idiomas soportados | No disponible (la model card consultada está truncada; el soporte bilingüe chino-inglés se documenta explícitamente para MOSS-TTSD, no para este modelo) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con código Python propio (`custom_code`, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo se etiqueta con la arquitectura MossTTSDelay, la misma familia de arquitecturas que el resto de modelos MOSS-TTS. Se trata de un transformer autorregresivo que opera sobre tokens discretos de audio producidos por un códec neural semántico-acústico, con un esquema de generación con retardos (delay pattern) entre flujos o canales del códec. La ficha del repositorio no detalla el número de capas, dimensión oculta, cabeceras ni la configuración exacta del decodificador de audio, por lo que esos datos deben considerarse no disponibles.

Tampoco hay información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF/DPO o ajuste por preferencias específicas para este modelo. La model card de la familia menciona cifras agregadas como millones de horas de datos TTS y 400.000 horas de habla conversacional sintética y real, pero esas cifras se asocian a MOSS-TTSD y no pueden atribuirse sin verificación a MOSS-VoiceGenerator. No hay paper ni nota técnica publicada (arXiv marcado como "coming soon"), de modo que la innovación técnica concreta del diseño de timbre por texto no está documentada más allá de la descripción funcional.

## Capacidades

- Diseño de timbre desde texto libre: genera una voz nueva a partir de una descripción de personaje, personalidad o emoción, sin audio de referencia.
- Control de estilo expresivo: la descripción textual modula la expresividad emocional de la locución generada.
- Síntesis unificada: integra el diseño de voz y la síntesis de contenido en un único modelo, en lugar de encadenar un generador de embedding y un TTS separado.
- Uso como capa de diseño dentro de una pipeline: puede emplearse de forma independiente o como etapa previa para modelos TTS posteriores del mismo ecosistema (por ejemplo, clonación o síntesis de formato largo).
- Salida de audio de voz (pipeline `text-to-speech`).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad de visión, audio de entrada ni otras modalidades.
- Cobertura multilingüe: no disponible en la información consultada.

## Casos de uso

- Diseño de voces para PNJ en videojuegos: un guionista describe el personaje ("voz grave, cansada, de unos sesenta años, tono sarcástico") y obtiene un timbre coherente sin contratar locución ni depender de bancos de voces con licencia; el modelo genera directamente el audio de las líneas.
- Preproducción de audiolibros y pódcasts: generar candidatos de timbre para cada narrador o personaje durante la fase de prototipado, elegir el más adecuado y fijarlo como referencia para la síntesis de formato largo con otro modelo de la familia.
- Prototipado de personajes en animación y doblaje: producir diálogos de prueba con voces diferenciadas por personaje antes de la grabación final, lo que permite validar casting y ritmo sin coste de estudio.
- Identidad de voz corporativa: crear una voz de marca reproducible a partir de una especificación textual y reutilizarla en asistentes de voz, anuncios y centralita, con la ventaja de que no se clona la voz de una persona real.
- Localización y adaptación de contenido: generar variantes de timbre para distintos mercados o registros (infantil, institucional, cercano) a partir de la misma especificación de personaje, sin rehacer la producción desde cero.
- Investigación en síntesis de voz: servir como banco de pruebas para estudiar control de atributos prosódicos y de timbre mediante lenguaje natural, y para comparar diseño por texto frente a clonación zero-shot.
- Accesibilidad y contenido educativo: crear voces claras y estables para materiales formativos o lectores de pantalla con estilos controlados por descripción (ritmo pausado, dicción marcada).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio no incluye métricas objetivas (MOS, similitud de hablante, WER, tasas de error de prosodia) ni comparaciones cuantitativas con otros sistemas; el paper está anunciado pero no publicado.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: unos 4,3 GB solo para los pesos (2,11 B × 2 bytes), más el decodificador de audio y las cachés de atención; en la práctica, entre 6 y 8 GB de VRAM para inferencia de una sola frase.
- Cuantización a 8 bits: aproximadamente 2,2 GB de pesos; a 4 bits, en torno a 1,2 GB. Son estimaciones teóricas: no hay cuantizaciones publicadas ni verificadas para esta arquitectura.
- GPU de consumo: cabe en tarjetas de 8 GB (RTX 3060 Ti, RTX 4060) en bf16 con margen ajustado, y con holgura en 12-16 GB (RTX 3060 12 GB, RTX 4070, RTX 4060 Ti 16 GB, RTX 4090 24 GB).
- GPU de数据中心 recomendadas: L4 24 GB, A10G 24 GB, L40S 48 GB, A100 40/80 GB y H100 para lotes grandes o servicio concurrente.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` y las dependencias del repositorio (códec de audio incluido); API de AIStudio del autor como alternativa gestionada. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para esta arquitectura.
- Latencia y throughput: no disponibles. Al ser un modelo autorregresivo sobre tokens de audio, la latencia escala con la duración del audio generado y no es adecuada para streaming de baja latencia (para ese caso la familia ofrece MOSS-TTS-Realtime).
- Almacenamiento: 4,2 GB de repo, más espacio temporal para caché de pesos.

## Comparativa con modelos similares

| Modelo | Parámetros | Función principal | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MOSS-VoiceGenerator | 2,11 B (safetensors) / 1,7 B declarados | Diseño de timbre desde texto libre | No disponible | Apache 2.0 | Hugging Face (oficial y espejo ArchiveStudio) |
| MOSS-TTS (MossTTSDelay) | 8 B | TTS de producción con clonación zero-shot | No disponible | No disponible en la información consultada | Hugging Face (OpenMOSS-Team) |
| MOSS-TTS-Local-Transformer (MossTTSLocal) | 1,7 B | TTS ligero | No disponible | No disponible en la información consultada | Hugging Face (OpenMOSS-Team) |
| MOSS-TTS-Realtime | 1,7 B | TTS en streaming para agentes de voz multi-turno | No disponible | No disponible en la información consultada | Hugging Face (OpenMOSS-Team) |

No se dispone en la información consultada de modelos comparables de otras familias centrados específicamente en diseño de voz por texto, ni de métricas que permitan comparar calidad, latencia o expresividad entre ellos.

## Limitaciones y advertencias

- Repositorio espejo de terceros: la ficha corresponde a ArchiveStudio/MOSS-VoiceGenerator, no al repositorio oficial OpenMOSS-Team/MOSS-Voice-Generator; conviene usar el oficial para trazabilidad de pesos y actualizaciones. La fecha de creación declarada en el repo (2026-10-24) es posterior a la consulta, lo que refuerza la cautela sobre su integridad.
- Ejecución de código remoto: el modelo requiere `custom_code` y `trust_remote_code=True`, lo que implica ejecutar Python del repositorio; hay que auditar el código antes de desplegarlo en producción.
- Riesgo de alucinación audible: como todo modelo generativo de audio, puede producir artefactos, prosodia anómala, repeticiones, ruido o cortes en frases largas. No hay datos de tasa de error ni de MOS.
- Sin benchmarks ni evaluación publicada: no se puede estimar la calidad objetiva ni comparar con alternativas sin una evaluación propia.
- Sesgos: el diseño de voz a partir de descripciones textuales puede reproducir estereotipos de edad, género, acento o clase social presentes en los datos de entrenamiento; no hay documentación de mitigaciones.
- Cobertura de idiomas desconocida: no se especifica qué lenguas ni acentos cubre, ni el comportamiento en cambio de código (code-switching), a diferencia de MOSS-TTS que sí lo documenta.
- Restricciones de licencia: los pesos se publican bajo Apache 2.0, lo que permite uso comercial, pero la licencia del códec de audio, de las dependencias y de los datos de entrenamiento no está desglosada en la información disponible; conviene revisar el repositorio oficial antes de explotación comercial.
- Uso dual y suplantación: la generación de voces sintéticas permite crear audio fraudulento; no se documenta marca de agua, detector ni mecanismo de consentimiento en esta ficha.
- Madurez del proyecto: 0 descargas y 0 likes en la versión analizada, sin paper publicado ni métricas de estabilidad; el soporte de la comunidad y la evolución del modelo no están garantizados.
- Sin soporte documentado para vLLM, llama.cpp, Ollama o TGI: el despliegue a escala requiere trabajo propio de ingeniería.

## Enlaces

- Repositorio analizado en Hugging Face: https://huggingface.co/ArchiveStudio/MOSS-VoiceGenerator
- Modelo oficial (OpenMOSS-Team): https://huggingface.co/OpenMOSS-Team/MOSS-Voice-Generator
- Repositorio GitHub del proyecto: https://github.com/OpenMOSS/MOSS-TTS
- Model card específica de Voice Generator: https://github.com/OpenMOSS/MOSS-TTS/blob/main/docs/moss_voice_generator_model_card.md
- Colección MOSS-TTS en ModelScope: https://modelscope.cn/collections/OpenMOSS-Team/MOSS-TTS
- Blog de MOSI.AI: https://mosi.cn/#models
- Demo en AIStudio: https://studio.mosi.cn
- Documentación de API: https://studio.mosi.cn/docs/moss-tts
- Web del equipo OpenMOSS: https://www.open-moss.com/
- Discord: https://discord.gg/fvm5TaWjU3
- Twitter/X: https://x.com/Open_MOSS
