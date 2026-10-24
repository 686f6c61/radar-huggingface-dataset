# shiqianyan/TangYuGe-GPT-SoVITS-v2ProPlus

## Resumen

TangYuGe-GPT-SoVITS-v2ProPlus es un ajuste fino completo (no LoRA) de los pesos GPT-SoVITS v2ProPlus para la voz de Tang Yuge (唐语歌), personaje de la novela visual *Sparkling Memories* (夏日花火). Lo publica el usuario shiqianyan en Hugging Face y resuelve un problema muy concreto: disponer de una voz de personaje reproducible, con control de emoción y ritmo, sin necesidad de entrenar desde cero ni de grabaciones extensas. El modelo es relevante para la comunidad de mods, doblaje amateur y chatbots de personaje en chino, porque el pipeline completo (pesos, perfiles de escena, scripts de inferencia y puente HTTP) cabe en un repositorio de 2,8 GB y se ejecuta en una GPU de portátil de 8 GB.

Arquitectónicamente es un TTS autorregresivo de dos etapas: un GPT que convierte texto en tokens semánticos y un SoVITS que transforma esos tokens, junto con un clip de referencia, en forma de onda a 32 kHz mono. El release actual combina el checkpoint GPT `G-F2+DPO` (época 10, con DPO oficial) y el SoVITS de época 4, ambos derivados de los modelos base oficiales v2ProPlus de `lj1995/GPT-SoVITS`.

No es un modelo de lenguaje: no hay ventana de contexto, ni tool calling, ni razonamiento multietapa. Su ámbito es exclusivamente el chino mandarín y su calidad está acotada por unos 43 minutos de grabaciones originales. El factor de tiempo real medido por el autor es de 0,4–0,5 en fp16 tras el calentamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS autorregresivo en dos etapas: GPT (texto → tokens semánticos) + SoVITS (tokens + referencia → waveform) |
| Parametros totales | no disponible (pesos: GPT 155 MB + SoVITS 173 MB en fp16) |
| Longitud de contexto | no disponible (modelo TTS; no usa ventana de contexto, sino clip de referencia + texto de prompt) |
| Tipos de cuantizacion | fp16 en los pesos distribuidos; exportación ONNX disponible; no se documentan GGUF, INT8 ni INT4 |
| Idiomas soportados | chino mandarín únicamente (`zh`) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.ckpt` (GPT) y `.pth` (SoVITS); exportación ONNX; repositorio de 2,8 GB con modelos auxiliares y base opcionales |

Datos adicionales verificados: salida WAV mono a 32 kHz; 19 perfiles de escena con su clip de referencia y texto de prompt; verificado con el commit `ea2d2a8` de GPT-SoVITS, Python 3.10, PyTorch 2.4.0 + CUDA 12.4 y una RTX 4060 Laptop de 8 GB; factor de tiempo real aproximado de 0,4–0,5.

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT-SoVITS v2ProPlus: una primera etapa GPT convierte el texto en tokens semánticos y una segunda etapa SoVITS sintetiza la onda a partir de esos tokens y de un clip de referencia con su texto asociado. Ambos componentes se han ajustado de forma completa desde los base oficiales (`s1v3.ckpt`, `v2Pro/s2Gv2ProPlus.pth`, `v2Pro/s2Dv2ProPlus.pth`). El código de entrenamiento es el oficial de GPT-SoVITS en el commit `ea2d2a8`, con dos añadidos del autor: el lanzador del *schedule* de learning rate y un conmutador para la opción DPO oficial.

Los datos de entrenamiento parten de 561 clips reales (unos 43 minutos de grabación de la fuente). El release `v2pp-d2-20261022` introdujo una ronda de destilación con 561 clips reales más 561 sintéticos (1:1), generados por un servicio TTS comercial que imita al mismo personaje y que no se redistribuye. El release actual (`v2pp-dpo-e10-20261023`) usa datos reales más sintéticos de profesor, learning rate con recocido coseno y DPO oficial. El peso SoVITS (`tangyuge_v2pp_e4_s564.pth`) es idéntico en las tres publicaciones. La línea v2ProPlus sustituye a la v2Pro anterior, con un suelo de ruido y ruido de fondo notablemente menores según el informe de entrenamiento del autor.

## Capacidades

- Síntesis de voz (TTS) en chino mandarín con salida WAV mono a 32 kHz.
- Clonación de voz *few-shot* de un personaje concreto a partir de un clip de referencia corto.
- Control de emoción y ritmo mediante 19 perfiles de escena predefinidos, cada uno con su clip de referencia y su texto de prompt emparejados.
- Generación de diálogo multi-línea para guiones, con selección manual del perfil por tono de la frase.
- Exportación a ONNX e integración mediante los scripts de inferencia y el puente HTTP incluidos en el repositorio.
- Posibilidad de continuar el entrenamiento: el repositorio puede incluir todos los modelos base y auxiliares necesarios.
- Producción limitada de sonidos no verbales (risas, suspiros, respiraciones) solo cuando el texto contiene interjecciones tipo 嘻嘻 o 哈哈; el vocabulario de fonemas está completo y no hay tokens dedicados.
- No soporta tool calling, function calling, razonamiento multietapa, agentes, visión ni audio de entrada.

## Casos de uso

- Doblaje de mods y novelas visuales: sustituir o ampliar líneas de voz de un personaje en proyectos de *fan translation*, eligiendo el perfil de escena que coincida con el tono original de cada línea.
- Bots de personaje con voz: el puente HTTP del repositorio permite exponer la síntesis como servicio y conectarla a un chat de personaje, generando audio por turno en una GPU de 8 GB.
- Producción de contenido de fans: piezas cortas, *covers* hablados o escenas dobladas para vídeo, etiquetando siempre el audio como sintético por IA.
- Prototipado de pipelines TTS multi-personaje: el mismo GPT-SoVITS con distintos checkpoints de personaje permite montar escenas con varias voces manteniendo un único motor de inferencia.
- Investigación en clonación de voz *few-shot*: el repositorio conserva tres releases (real, destilación 1:1, DPO) con el mismo SoVITS, lo que permite aislar el efecto de los datos sintéticos y del DPO sobre el GPT.
- Evaluación de artefactos en TTS: el autor documenta que DNSMOS y la tasa de error ASR no detectan la distorsión electrónica presente en el SoVITS de época 4, lo que convierte al modelo en un caso de estudio útil para diseñar métricas perceptivas.
- Localización de diálogo para juegos independientes en chino: generación por lotes de líneas a partir de una tabla de guion, con revisión humana antes de publicar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar de TTS (MOS, WER, SECS) en la información disponible. Los únicos datos cuantitativos documentados por el autor son:

| Metrica | Valor | Contexto |
|---|---|---|
| Factor de tiempo real (RTF) | 0,4–0,5 | RTX 4060 Laptop 8 GB, fp16, tras calentamiento |
| Recall de eventos no verbales | 0,77 | proporción de tipos de evento (risas, suspiros) efectivamente sintetizados |
| DNSMOS y tasa de error ASR | no detectan los artefactos del SoVITS época 4 | evaluación automática del autor |
| MOS, WER, SECS, comparación con otros TTS | no disponible | no publicados |

## Requisitos de hardware

- VRAM: el autor verifica funcionamiento en 8 GB (RTX 4060 Laptop) con fp16; no se documenta una estimación formal mínima ni el consumo exacto.
- GPU recomendadas: RTX 4060 Laptop 8 GB como referencia verificada; no se han publicado pruebas en A100, H100, RTX 4090 ni otras GPU.
- Cabe en GPU de consumo: sí, al menos en 8 GB de VRAM según la verificación del autor.
- Despliegue: repositorio oficial GPT-SoVITS en el commit `ea2d2a8`, con scripts de inferencia y un puente HTTP incluidos; exportación ONNX. No aplica vLLM, llama.cpp, Ollama ni TGI al no ser un modelo de lenguaje.
- Latencia y throughput: RTF de 0,4–0,5 en la GPU verificada, en fp16 y tras el calentamiento; no se documenta throughput en peticiones por segundo.
- Advertencia de CPU: en algunas CPU Intel de arquitectura híbrida (reproducido en i7-13650HX) el `Conv1d` multihilo de oneDNN en PyTorch devuelve resultados incorrectos; en CPU hay que fijar `torch.backends.mkldnn.enabled = False` o ejecutar en un solo hilo.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TangYuGe v2ProPlus (este) | TTS dos etapas GPT + SoVITS, ajuste completo | no disponible (155 MB + 173 MB fp16) | chino mandarín | Apache-2.0 | Hugging Face, repo de 2,8 GB |
| TangYuGe v2Pro | TTS dos etapas GPT + SoVITS, línea anterior | no disponible | chino mandarín | Apache-2.0 | Hugging Face (`shiqianyan/TangYuGe-GPT-SoVITS-v2Pro`) |
| GPT-SoVITS v2ProPlus base (`lj1995/GPT-SoVITS`) | TTS dos etapas sin especializar | no disponible | no especificado en la información disponible | no disponible en la información proporcionada | Hugging Face |
| Otros TTS con clonación (XTTS-v2, CosyVoice 2, Fish Speech) | TTS con clonación Zero-shot | no disponible | no disponible | no disponible | no verificado en la información proporcionada |

La comparación relevante dentro de la información disponible es interna a la familia: el autor señala que la línea v2ProPlus tiene un suelo de ruido y un ruido de fondo notablemente menores que la v2Pro, y recomienda la primera. No hay cifras públicas que permitan comparar este ajuste con alternativas de otros autores.

## Limitaciones y advertencias

- Frases cortas pueden truncarse: en una línea de cuatro sílabas es posible que solo se pronuncie la primera mitad. Es una propiedad conocida de la decodificación autorregresiva de GPT-SoVITS; los parámetros de muestreo conservadores la reducen pero no la eliminan.
- Artefactos electrónicos o sensación de "boca llena" en algunas salidas, especialmente con la referencia seria `serious_script41_L0682` (la opción por defecto de `main_hybrid_mid`). El autor confirma que están presentes en el SoVITS de época 4 y que ningún experimento posterior los corrigió; las métricas automáticas no los detectan.
- Sonidos no verbales pobres: sin tokens dedicados, solo aparecen con interjecciones explícitas y con calidad inferior a una risa natural (recall de eventos de 0,77).
- El clip de referencia y el texto de prompt deben ir emparejados; un prompt incorrecto degrada de forma perceptible la pronunciación y el ritmo.
- Expresividad limitada por unos 43 minutos de grabación de origen: las emociones intensas (gritos, llanto) son débiles.
- Solo chino mandarín; el texto mixto chino-inglés no está probado y el uso fuera del chino queda fuera de alcance.
- Parte de los datos de entrenamiento del GPT es voz sintética de un servicio TTS comercial que imita al personaje; no se redistribuye y puede propagar errores de pronunciación de ese servicio.
- Licencia Apache-2.0 sobre los pesos, pero eso no otorga derechos sobre la voz del personaje ni sobre la propiedad intelectual de *Sparkling Memories*; el propio autor prohíbe su uso para suplantar a personas reales y recomienda etiquetar el audio como generado por IA.
- El uso comercial requiere revisar por separado los derechos del personaje y de las grabaciones de origen, que la licencia del repositorio no cubre.
- En producción, validar cada salida antes de publicar: la tasa de fallos por truncamiento y por artefactos no está cuantificada de forma sistemática.

## Enlaces

- Hugging Face: https://huggingface.co/shiqianyan/TangYuGe-GPT-SoVITS-v2ProPlus
- Modelo base: https://huggingface.co/lj1995/GPT-SoVITS
- Repositorio anterior v2Pro: https://huggingface.co/shiqianyan/TangYuGe-GPT-SoVITS-v2Pro
- Código GPT-SoVITS (commit de referencia `ea2d2a8`): https://github.com/RVC-Boss/GPT-SoVITS
- Documentación interna del repo: `manifests/training_report.md` (informe de entrenamiento), sección *Scene profiles* y sección *Evaluation* de la model card
- Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo (solo enlaces genéricos a YouTube), por lo que no se incluyen más referencias externas.
