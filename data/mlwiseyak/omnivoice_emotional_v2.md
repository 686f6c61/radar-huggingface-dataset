# mlwiseyak/omnivoice_emotional_v2

## Resumen

OmniVoice Emotional v2 es un modelo de síntesis de voz (text-to-speech) especializado en nepalí, desarrollado por el equipo de *machine learning* de WiseYak (mlwiseyak) como un ajuste fino del modelo base k2-fsa/OmniVoice. Su particularidad frente a otros TTS es la combinación de dos mecanismos de control: 16 etiquetas de emoción entre corchetes que se insertan directamente en el texto (`[calm]`, `[angry]`, `[whisper]`, `[laughter]`…) y 6 personas de voz fijas y preentrenadas (tres masculinas y tres femeninas) con perfiles y frecuencias fundamentales definidas, pensadas para locución informativa, narración y conversación.

El modelo resuelve un problema concreto: la práctica totalidad de los TTS multilingües de gran escala tratan el nepalí como un idioma de baja prioridad, sin control emocional ni consistencia de hablante en párrafos largos. Este ajuste se entrenó sobre más de 55 horas de habla nativa nepalí de alta fidelidad, diálogos multihablante y corpus emocionales, e incorpora una caché en memoria de anclas de voz de 4–7 segundos para evitar la deriva de timbre (*drift*) en textos extensos.

Técnicamente es un modelo compacto: 813.977.841 parámetros en un único `model.safetensors` (~2,03 GB) más un tokenizador de audio separado (~805 MB), sin dependencias de LoRA ni PEFT en tiempo de ejecución. La arquitectura hereda el enfoque de tipo *diffusion language model* con *flow matching* del OmniVoice original, y la generación se controla con parámetros de muestreo (`num_step=20`, `cfg_strength=3.0`) y salida a 24 kHz. Es relevante ahora porque demuestra que un ajuste de ~55 horas sobre un modelo abierto de 814 M puede ofrecer control emocional explícito y personas estables en un idioma de bajos recursos, con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS generativo basado en OmniVoice (k2-fsa); arquitectura de tipo *diffusion language model* con *flow matching* |
| Parametros totales | 813.977.841 (~814 M) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible (no se especifica longitud máxima de texto de entrada) |
| Tipos de cuantizacion | No se publican variantes cuantizadas (sin GGUF/AWQ/GPTQ); la model card usa bfloat16 en GPU y float32 en CPU |
| Idiomas soportados | Nepalí (`ne`, código interno `npi`) y newari / nepal bhasa (`new`) |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` (pesos fusionados *standalone* + carpeta `audio_tokenizer/`) |
| Pipeline | `text-to-speech` |
| Libreria de inferencia | `omnivoice` (Python); compatible con vLLM-Omni |
| Frecuencia de muestreo de salida | 24.000 Hz |
| Pasos de muestreo por defecto | 20 (`num_step`), con `cfg_strength=3.0` |
| Tamano del repositorio | ~2,8 GB (`model.safetensors` ~2,03 GB + `audio_tokenizer/` ~805 MB) |
| Descargas / likes en HuggingFace | 0 / 0 |
| Fecha de publicacion | 2026-10-27 |

## Arquitectura y entrenamiento

El modelo parte de k2-fsa/OmniVoice, un TTS multilingüe de clonación cero disparo descrito por sus autores como una arquitectura novedosa de tipo *diffusion language model*, y cuyos tags en este ajuste incluyen explícitamente *flow-matching*. En la práctica, la síntesis se realiza en dos piezas: un modelo principal (`model.safetensors`, ~2,03 GB) que predice representaciones de audio a partir del texto y de la condición de estilo, y un tokenizador de audio neuronal (`audio_tokenizer/`, ~805 MB) que convierte esas representaciones en forma de onda a 24 kHz. Los pesos se distribuyen fusionados, de modo que no hay adaptadores LoRA ni PEFT que cargar en producción: es un *drop-in* con la librería `omnivoice` o con vLLM-Omni.

El entrenamiento consistió en varias rondas de adaptación de dominio y *fine-tuning* sobre más de 55 horas de habla nepalí nativa de alta fidelidad, complementadas con diálogos multihablante y corpus de habla emocional. No se documenta en la información disponible el número exacto de tokens, la composición detallada del dataset, ni si se aplicaron fases de RLHF/DPO (poco habituales en TTS). La innovación destacable no está en el *backbone* sino en la capa de control: 16 etiquetas de emoción insertadas en el texto, 6 personas predefinidas con registro y tono fijados, y una caché en memoria de *prompts* de voz de 4–7 segundos que actúa como ancla para mantener el mismo tracto vocal a lo largo de párrafos largos, evitando la deriva de hablante.

## Capacidades

- Síntesis de voz en nepalí y newari con calidad de locución, a 24 kHz.
- Control emocional fino mediante 16 etiquetas entre corchetes: `[calm]`, `[happy]`, `[sad]`, `[angry]`, `[excited]`, `[fear]`, `[whisper]`, `[urgent]`, `[sarcastic]`, `[confused]`, `[curious]`, `[empathetic]`, `[proud]`, `[laughter]`, `[sigh]`, `[surprised]`.
- Seis personas preentrenadas con perfil y frecuencia fundamental definidos: Navaraj (hombre, presentador formal, ~138 Hz), Deepika (mujer, presentadora y periodista, ~185 Hz), Bikram (hombre, orador grave, ~90 Hz), Pooja (mujer, conversacional cálida, ~195 Hz), Sujata (mujer, narradora melódica, ~190 Hz) y Aayush (hombre, joven casual, ~135 Hz).
- Condicionamiento por instrucción en lenguaje natural (`instruct`), por ejemplo `"male, news anchor, formal, authoritative, clear tone"`.
- Consistencia de hablante en textos largos mediante caché de *prompts* de voz con anclas canónicas de 4–7 s (sin deriva de timbre).
- Control de velocidad del habla (`speed`) y del compromiso entre fidelidad y naturalidad (`cfg_strength`) y del coste de muestreo (`num_step`).
- No se documentan capacidades de clonación cero disparo con audio arbitrario en esta ficha, ni *tool calling*, ni razonamiento multi-paso: es un modelo puramente de síntesis.

## Casos de uso

- **Locución de informativos y boletines de radio en nepalí**: con las personas Navaraj o Deepika y la instrucción de presentador formal, el modelo genera titulares y entradillas con el registro y la cadencia de un *anchor* real; la caché de voz evita que el timbre cambie entre noticias de un mismo boletín.
- **Audiolibros y narración infantil**: la persona Sujata (~190 Hz, melódica) combinada con `[calm]`, `[excited]` o `[whisper]` permite marcar la curva dramática de un capítulo sin re-grabar; el anclaje de 4–7 s mantiene la misma voz durante horas de material.
- **Atención al cliente telefónica (IVR) en nepalí**: mensajes de espera, confirmaciones y avisos con `[empathetic]` o `[urgent]` para modular el tono según el contexto; el modelo cabe en una GPU consumer, lo que abarata el despliegue *on-premise* frente a APIs comerciales.
- **Accesibilidad y lectura de pantalla**: conversión de artículos y documentos a audio nepalí con velocidad ajustable (`speed`), útil para usuarios con discapacidad visual en un idioma con poca cobertura de voces sintéticas de calidad.
- **Contenido educativo y e-learning**: generación de lecciones narradas y *feedback* motivacional con `[proud]` o `[curious]`; el coste por hora de audio es muy inferior al de un locutor, y el control emocional hace la narración menos monótona.
- **Doblaje y localización de vídeo corto**: sustitución de pistas de voz en anuncios, *reels* y material de marketing para el mercado nepalí, alternando personas masculinas y femeninas según el *brief* de marca y usando `[sarcastic]` o `[laughter]` en piezas de tono informal.
- **Preservación y difusión del newari**: síntesis en `new` para documentales, archivos orales y material divulgativo de una lengua con recursos digitales escasos, aprovechando que el modelo declara soporte para ese código de idioma.
- **Prototipado de videojuegos y experiencias interactivas**: generación de *barks* y diálogos de PNJ con las seis personas y etiquetas emocionales, sin contratar actores para una primera versión jugable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye métricas objetivas (MOS, CMOS, WER de re-síntesis, similitud de hablante ni comparativas ciegas) para este ajuste, y el repositorio no contiene scripts de evaluación. Tampoco se han publicado medidas de latencia o *throughput*; el único dato operativo es que la generación se realiza con 20 pasos de muestreo y `cfg_strength=3.0` por defecto, parámetros que determinan directamente el coste de inferencia.

## Requisitos de hardware

- **VRAM estimada (estimación a partir de los 814 M de parámetros, no publicada por el autor)**: en bfloat16, los pesos del modelo principal ocupan ~1,6 GB y el tokenizador de audio ~0,8 GB; con activaciones y cachés de atención, un *batch* de 1 utterance debería situarse en el rango de 4–6 GB. Con lotes mayores o texto muy largo, prever 8–12 GB.
- **GPU recomendadas**: cualquier GPU con 8 GB o más para inferencia interactiva (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090). Para servicio concurrente, A100 40/80 GB, H100 o L40S, donde el cuello de botella será el número de pasos de muestreo, no la memoria.
- **Cabe en GPU consumer**: sí, con holgura, incluso en tarjetas de 8 GB en bfloat16 y *batch* 1.
- **CPU**: la model card contempla ejecución en CPU con `torch.float32`, lo que implica ~3,3 GB solo en pesos más el tokenizador; viable para generación por lotes sin requisito de tiempo real, no para interacción.
- **Opciones de despliegue**: librería Python `omnivoice` (`OmniVoice.from_pretrained` con `dtype` y `device_map`) y servicio HTTP con vLLM-Omni (`vllm serve ... --omni --gpu-memory-utilization 0.40 --trust-remote-code`). No hay soporte documentado para llama.cpp, Ollama, TGI ni formatos GGUF, al no existir pesos cuantizados.
- **Latencia y throughput**: no disponibles. Como referencia cualitativa, la latencia escala de forma aproximadamente lineal con `num_step` (20 por defecto) y con la duración del audio de salida; reducir pasos o desactivar el clasificador libre de guía son las palancas habituales para acelerar.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto / control | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mlwiseyak/omnivoice_emotional_v2 | 813.977.841 | ne, new | 16 emociones, 6 personas fijas, anclaje de voz 4–7 s | Apache 2.0 | HuggingFace, 0 descargas |
| k2-fsa/OmniVoice (base) | No disponible en la informacion | Más de 600 idiomas (según el proyecto) | Clonación cero disparo, *voice design* a partir de descripción textual | No disponible en la informacion | HuggingFace y GitHub |
| mlwiseyak/omnivoice-nepali-tts-v2 | No disponible en la informacion | Nepalí | TTS nepalí, sin control emocional documentado en la información disponible | No disponible en la informacion | HuggingFace |

La comparación relevante es frente al modelo base: OmniVoice ofrece cobertura de más de 600 idiomas y clonación cero disparo, mientras que este ajuste sacrifica amplitud lingüística a cambio de control emocional explícito, personas estables y una calidad de pronunciación nepalí presumiblemente superior tras 55 horas de *fine-tuning*. Frente a `omnivoice-nepali-tts-v2`, del mismo autor, la diferencia declarada es la capa emocional y el bloqueo de personas. No se dispone de datos de benchmarks que permitan comparar calidad objetiva entre los tres.

## Limitaciones y advertencias

- **Cobertura lingüística muy restringida**: solo nepalí y newari. Cualquier texto en otro idioma, o con abundancia de términos ingleses, siglas o cifras, puede producir pronunciación incorrecta o artefactos.
- **Sesgos y representatividad del corpus**: 55 horas son un volumen modesto para TTS; es previsible una cobertura desigual de dialectos, registros, edades y géneros, y un sesgo hacia el nepalí estándar de los locutores del corpus. No hay documentación sobre la procedencia ni el consentimiento de los datos de entrenamiento.
- **Riesgo de alucinación acústica**: como todo modelo generativo de audio, puede insertar ruido, respiraciones espurias, sílabas repetidas o prolongar vocales; no existe garantía de fidelidad literal al texto de entrada.
- **Personas fijas y limitadas**: solo seis voces, con perfiles muy marcados (locutor, narradora, conversacional). No se documenta clonación de voces arbitrarias en esta ficha, lo que limita la variedad en producciones con muchos personajes.
- **Formato de emoción estricto**: las etiquetas deben escribirse entre corchetes y con la grafía exacta de las 16 soportadas; una etiqueta mal escrita se leerá como texto o se ignorará, sin aviso.
- **Sin validación comunitaria**: 0 descargas y 0 *likes* en el momento de la ficha, sin issues ni evaluaciones de terceros. La model card marca `inference: false`, por lo que no hay *widget* de prueba en HuggingFace.
- **Sin benchmarks**: no hay MOS, CMOS ni WER publicados; cualquier decisión de producción debería basarse en una evaluación propia con locutores nativos.
- **Licencia**: los pesos de este ajuste son Apache 2.0, lo que permite uso comercial y modificación con atribución; conviene verificar por separado los términos del modelo base k2-fsa/OmniVoice y del tokenizador de audio incluido.
- **Uso dual y suplantación**: cualquier TTS con control de estilo y personas estables puede emplearse para generar audio engañoso. Es recomendable marcar las síntesis como generadas y no usar el modelo para imitar voces reales sin consentimiento explícito.
- **Dependencia de `trust-remote-code`**: el servicio con vLLM-Omni requiere `--trust-remote-code`, lo que implica ejecutar código del repositorio; auditar antes en entornos sensibles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mlwiseyak/omnivoice_emotional_v2
- Modelo base en HuggingFace: https://huggingface.co/k2-fsa/OmniVoice
- Repositorio del modelo base en GitHub: https://github.com/k2-fsa/OmniVoice/
- Sitio del proyecto OmniVoice: https://omnivoice.app/
- Modelo hermano del mismo autor (TTS nepalí): https://huggingface.co/mlwiseyak/omnivoice-nepali-tts-v2
- Árbol de ficheros del modelo hermano: https://huggingface.co/mlwiseyak/omnivoice-nepali-tts-v2/tree/main
- Ficha de terceros del modelo hermano: https://free2aitools.com/model/mlwiseyak/omnivoice-nepali-tts-v2
- Sitio del desarrollador (WiseYak): https://wiseyak.com
