# BricksDisplay/Chatterbox-Turbo-GGUF

## Resumen

Chatterbox-Turbo-GGUF es una conversión al formato GGUF del modelo ResembleAI/chatterbox-turbo, un sistema de síntesis de voz (text-to-speech) en inglés empaquetado por BricksDisplay para codec.cpp y llama.rn. El modelo combina un backbone GPT-2 T3 que transforma texto en tokens S3 de habla con un decodificador MeanFlow S3Gen y un vocoder HiFT; suma 332.798.650 parámetros y se distribuye en dos artefactos GGUF separados: backbone y codec+codec_lm.

Su interés práctico está en que permite ejecutar TTS y clonación de voz en entornos locales, incluidos CPU y Vulkan, con cuantizaciones desde f32 hasta q4_k_m y un tamaño de pesos que ronda entre 0,5 GB y 2 GB según la variante. La licencia MIT y la integración con llama.rn facilitan prototipos en móvil y aplicaciones embebidas, aunque el alcance queda limitado al inglés y a la síntesis de voz, no a un LLM general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GPT-2 T3 (texto a tokens S3) + decodificador MeanFlow S3Gen + vocoder HiFT; conversión GGUF para codec.cpp y llama.rn |
| Parámetros totales | 332.798.650 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Backbone: f16, q8_0, q4_k_m. Codec: f32, f16, q8_0, q5_k_m, q4_k_m |
| Idiomas soportados | Inglés (en); no se documentan otros idiomas |
| Licencia | MIT |
| Formato de pesos | GGUF; dos artefactos: backbone T3 y codec+codec_lm |
| Voces | Una voz integrada (`default`); clonación desde audio de referencia |
| Pipeline | text-to-speech |
| Tamaño del repositorio | 4,3 GB |

## Arquitectura y entrenamiento

El backbone es un transformer GPT-2 T3 que mapea texto a tokens discretos S3; usa vocabulario BPE de GPT-2 y añade tokens especiales para etiquetas paralingüísticas como `[laugh]`. La parte generativa de audio es un decodificador MeanFlow S3Gen con dos pasos de flujo y sin classifier-free guidance, seguido de un vocoder HiFT. La conversión separa el backbone, ejecutable en llama.cpp con `embeddings=true`, del codec, el adaptador T3, la voz integrada y los codificadores de hablante (S3 tokenizer, CAMPPlus y VoiceEncoder), que se ejecutan en codec.cpp.

La model card no documenta el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. La innovación principal de este empaquetado es la receta de cuantización GGUF: los tensores sensibles a precisión (mel filterbanks, ventanas y codebook del S3 tokenizer) se mantienen en F32, el adaptador LM (`lm.*`) se cuantiza a Q8_0 en todos los archivos y el decodificador usa Q8_0, Q5_K o Q4_K con fallback Q8_0. El muestreo de referencia se guarda como metadatos: temperatura 0,8, top-k 1000, top-p 0,95 y penalización de repetición 1,2. La generación se detiene con el token de fin de habla y se añaden tres tokens de silencio S3Gen antes de decodificar.

## Capacidades

- Síntesis de voz en inglés a partir de texto, con salida en WAV mediante `tts-cli`.
- Una voz integrada llamada `default`, lista para usar sin referencia externa.
- Clonación de voz a partir de audio de referencia: el clip condiciona tanto el T3 como el decodificador S3Gen; los hablantes derivados se pueden guardar en un archivo de speaker y recargar.
- Soporte de etiquetas paralingüísticas como `[laugh]`, añadidas como tokens al vocabulario BPE de GPT-2.
- Ejecución local en CPU y Vulkan, según la validación del autor.
- Integración con codec.cpp y llama.rn; el backbone también puede cargarse en llama.cpp estándar con `embeddings=true`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni código.
- No es un modelo multilingüe: solo inglés.
- No se documenta soporte de SSML ni control fino de prosodia.

## Casos de uso

- Narración y audiolibros en inglés: generar capítulos con la voz integrada `default`, dividiendo textos largos en fragmentos y concatenando los WAV resultantes; el modelo es ligero y puede ejecutarse en local sin depender de una API.
- Clonación de voz para doblaje y prototipos de localización: usar un clip de referencia con derechos claros para condicionar la voz y generar nuevas locuciones; adecuado para pruebas de concepto y demos, con revisión legal previa.
- Asistentes de voz offline en aplicaciones móviles: cargar el backbone con llama.rn y el codec con `initVocoder`, usando la variante q4_k_m para reducir el espacio de almacenamiento y permitir respuestas habladas sin conexión.
- Videojuegos y prototipos interactivos: generar líneas de diálogo de personajes no jugadores en inglés, incluyendo risas u otras etiquetas paralingüísticas, y sustituir clips de referencia para variar la voz del personaje.
- Accesibilidad y lectura de textos: convertir documentos, avisos o contenido web en inglés a voz para aplicaciones de lectura, con la ventaja de que el modelo puede ejecutarse en CPU y no requiere GPU dedicada.
- Pruebas de regresión en pipelines de TTS: ejecutar `tts-cli` con distintas variantes de cuantización y comparar la salida mediante CER con Whisper, tal como valida el autor, para detectar degradaciones antes de desplegar.
- Generación de datasets de voz sintética para experimentos: producir muestras controladas en inglés con voz integrada o clonada, siempre que se cumplan las obligaciones de consentimiento y etiquetado de contenido sintético.
- Demos de TTS en dispositivos edge con Vulkan: validar latencia y compatibilidad en hardware modesto antes de integrar el modelo en una aplicación mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, MOS, WER) en la información disponible. La única validación reportada por el autor es la siguiente:

| Métrica | Resultado reportado | Condiciones |
|---|---|---|
| CER con Whisper | 0 | Todas las variantes de codec, con voz integrada y con voz clonada, en CPU y Vulkan |
| MOS, WER, RTF | No disponible | No se publican en la información disponible |

El dato de CER 0 es aportado por el autor y no se detalla el corpus de evaluación ni el procedimiento completo, por lo que debe interpretarse como una validación interna y no como una comparativa independiente.

## Requisitos de hardware

- Pesos aproximados según la suma de archivos: q4_k_m, 259 MB de backbone + 217 MB de codec ≈ 476 MB; q8_0, 393 MB + 339 MB ≈ 732 MB; f16, 709 MB + 648 MB ≈ 1,36 GB; codec f32 con backbone f16 ≈ 1,95 GB.
- VRAM estimada: no hay requisitos oficiales. A partir de los tamaños de archivo, la variante q4_k_m debería cargar en GPUs consumer con 2 GB o más, y la f16 con 4 GB o más, dejando margen para el overhead del runtime, que no se cuantifica en la información disponible.
- GPU recomendadas: no se documenta una lista oficial. El autor valida CPU y Vulkan; no hay pruebas publicadas en A100, H100 o RTX 4090. Por el tamaño del modelo, A100 y H100 no son necesarias y una GPU consumer modesta o incluso la CPU puede ser suficiente.
- Cabe en GPU consumer: sí, según los tamaños de pesos; la variante q4_k_m es la más adecuada para dispositivos con poca memoria. No se especifican requisitos mínimos de RAM del sistema.
- Opciones de despliegue: codec.cpp mediante `tts-cli` para el codec y el backbone; llama.rn para aplicaciones móviles; llama.cpp estándar solo para el backbone con `embeddings=true`. No hay soporte documentado para vLLM, TGI u Ollama en esta conversión.
- Latencia y throughput: no disponibles. La validación en CPU y Vulkan confirma funcionamiento, pero no se publican cifras de RTF, latencia por frase ni muestras por segundo.
- Compatibilidad: los archivos de codec cuantizados requieren codec.cpp `0289fcc` o posterior; los archivos f16 y f32 funcionan con codec.cpp `360163d`. En llama.rn, la compatibilidad con codec.cpp cuantizado llega después de la próxima actualización de esa dependencia.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks comparativos entre estas variantes. La comparación se limita a metadatos de disponibilidad y formato.

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| BricksDisplay/Chatterbox-Turbo-GGUF | 332,8 M | No disponible | Inglés | MIT | GGUF | Esta ficha; dos archivos, cuantizaciones f32 a q4_k_m |
| ResembleAI/chatterbox-turbo | No disponible en la información | No disponible | No disponible | MIT, según el modelo base citado | No disponible | Modelo base de esta conversión; no se detallan especificaciones en la información provided |
| BricksDisplay/Chatterbox-Multilingual-TTS-GGUF | No disponible | No disponible | Multilingüe | No disponible | GGUF | Variante multilingüe del mismo autor; sin datos de rendimiento comparativo |
| ResembleAI/chatterbox | No disponible | No disponible | No disponible | No disponible | No disponible | Modelo Chatterbox original listado en Hugging Face; no se dispone de especificaciones en la información |

## Limitaciones y advertencias

- Solo admite inglés; no se documentan otros idiomas ni cambios de idioma dentro de una misma locución.
- No es un LLM general: no hace razonamiento, generación de código, matemáticas, tool calling, agentes ni visión.
- La clonación de voz exige consentimiento explícito de la persona cuya voz se usa y el cumplimiento de la normativa aplicable; no se documenta ningún sistema de marca de agua o detección de audio sintético.
- La licencia MIT cubre el modelo, pero no concede derechos sobre las voces de referencia ni sobre el audio generado; esos derechos deben verificarse por separado.
- No se documentan los datos de entrenamiento, por lo que se desconocen los sesgos de acento, género, edad o procedencia presentes en las voces.
- La validación con CER 0 es interna y limitada; no hay MOS, pruebas con ruido, acentos diversos ni evaluaciones independientes de naturalidad.
- La cuantización del decodificador puede degradar la calidad sonora; el autor mantiene tensores sensibles en F32, pero no publica comparativas subjetivas entre variantes.
- Puede producir errores de pronunciación, omisiones, repeticiones o artefactos, especialmente con textos largos, signos poco frecuentes o etiquetas paralingüísticas mal formadas.
- No se documenta un límite de longitud de texto ni una ventana de contexto; conviene dividir entradas largas y validar la salida antes de usarla en producción.
- La compatibilidad con codec.cpp y llama.rn depende de versiones concretas; los archivos cuantizados no funcionan con versiones antiguas del runtime.
- No se documenta soporte de SSML, control de velocidad, tono o énfasis, lo que limita el ajuste fino de la prosodia.

## Enlaces

- [BricksDisplay/Chatterbox-Turbo-GGUF en Hugging Face](https://huggingface.co/BricksDisplay/Chatterbox-Turbo-GGUF)
- [ResembleAI/chatterbox-turbo, modelo base](https://huggingface.co/ResembleAI/chatterbox-turbo)
- [Repositorio codec.cpp](https://github.com/mybigday/codec.cpp)
- [Repositorio llama.rn](https://github.com/mybigday/llama.rn)
- [ResembleAI/chatterbox en Hugging Face](https://huggingface.co/ResembleAI/chatterbox)
- [BricksDisplay/Chatterbox-Multilingual-TTS-GGUF](https://huggingface.co/BricksDisplay/Chatterbox-Multilingual-TTS-GGUF)
- [Modelos etiquetados como chatterbox en Hugging Face](https://huggingface.co/models?other=chatterbox)
