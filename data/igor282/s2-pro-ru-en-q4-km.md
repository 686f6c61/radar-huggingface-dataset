# Igor282/s2-pro-ru-en-q4-km

## Resumen

s2-pro-ru-en-q4-km es una cuantización de la versión rusu-inglesa del modelo TTS (text-to-speech) Fish Audio S2 Pro, publicada por el usuario Igor282. Se trata de un modelo de síntesis de voz basado en la arquitectura `fish-speech`, convertido al formato GGUF single-file con cuantización Q4_K_M para el motor de inferencia s2.cpp, junto con packs int4 Marlin para las etapas slow-AR y fast-AR. El modelo base, fishaudio/s2-pro, es un sistema TTS de Fish Audio con capacidad de clonación de voz y control de estilo mediante etiquetas.

La modificación principal respecto al modelo original es la poda del vocabulario del tokenizador, que pasa de 155.776 a 120.031 tokens, conservando únicamente ruso, inglés y tokens de servicio, sin alterar el bloque semántico ni el códec. El resultado es un modelo de aproximadamente 4.860 millones de parámetros (dato de safetensors del modelo base) empaquetado en un repositorio de 5,5 GB, con el GGUF principal de 3,1 GB.

Es relevante ahora porque ofrece una vía de despliegue de TTS bilingüe ruso-inglés con clonación de voz en hardware de consumo modesto (RTX 3060 Laptop de 6 GB), aunque con un rendimiento (RTF 0,78) muy inferior al de la ruta llama.cpp (RTF 0,12). La licencia es de investigación, lo que restringe el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | fish-speech (AR + códec); empaquetado para s2.cpp |
| Parametros totales | 4.863.316.465 (modelo base, safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (AR), Q4_K (embeddings), F16 (códec), int4 Marlin (slow-AR y fast-AR) |
| Idiomas soportados | ruso e inglés (vocabulario podado a 120.031 tokens) |
| Licencia | other (Fish Audio Research License) |
| Formato de pesos | GGUF single-file + packs binarios Marlin int4 + tokenizer.json |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura `fish-speech` del modelo base fishaudio/s2-pro, que combina un modelo autorregresivo (AR) con un códec de audio. La cuantización distribuida por Igor282 separa las capas AR en Q4_K_M dentro del GGUF, mantiene el códec en F16 y los embeddings en Q4_K, y añade packs int4 Marlin para las etapas slow-AR (1,79 GB) y fast-AR (0,24 GB). El tokenizador se ha podado de 155.776 a 120.031 tokens conservando ruso, inglés y tokens de servicio, sin tocar el bloque semántico ni el códec.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base. La innovación técnica destacable de esta publicación es el empaquetado para s2.cpp con packs Marlin int4 que aceleran las etapas AR, y la poda de vocabulario orientada a un uso bilingüe ruso-inglés. El autor advierte que el formato no es compatible con llama.cpp y que sin los packs Marlin el motor se detiene o cae a un camino ggml lento.

## Capacidades

- Síntesis de voz (TTS) bilingüe ruso-inglés a partir de texto.
- Clonación de voz mediante clip de referencia de 10 a 30 segundos (`-pa reference.wav -pt "texto de referencia"`).
- Control de estilo y emoción mediante etiquetas: `[excited]`, `[angry]`, `[whisper]`, `[laughing]`, `[pause]`.
- Selección de hablante mediante token de hablante (`<|speaker:0|>`).
- Generación de audio WAV a partir de texto con parámetros de temperatura ajustables.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-step, visión ni audio de entrada.

## Casos de uso

- Doblaje y localización ruso-inglés: el modelo permite generar voces en ambos idiomas con el mismo timbre mediante clonación, útil para doblar contenido audiovisual entre estos dos mercados.
- Audiolibros y narración: la ventana de contexto no está documentada, pero el control de pausas (`[pause]`) y emociones permite narrar párrafos con entonación variable.
- Asistentes de voz embebidos: con 3,1 GB de GGUF y RTF 0,78 en una RTX 3060 Laptop de 6 GB, puede ejecutarse en estaciones de trabajo modestas para prototipos de asistente por voz.
- Generación de voces para videojuegos y prototipos: la clonación con clips de 10-30 s y las etiquetas de emoción permiten crear bancos de voces de personajes sin entrenamiento adicional.
- Accesibilidad: conversión de texto a voz en ruso e inglés para lectores de pantalla o interfaces de accesibilidad, con voces personalizadas clonadas.
- Pruebas de concepto de TTS en investigación: la licencia de investigación y el formato s2.cpp lo hacen adecuado para experimentación académica con modelos de voz bilingües.
- Generación de material de e-learning: locuciones en ruso e inglés con distintos estilos emocionales para cursos y tutoriales.

## Benchmarks y rendimiento

| Metrica | Valor | Contexto |
|---|---|---|
| RTF (s2.cpp, RTX 3060 Laptop 6 GB) | 0,78 | 1 minuto de voz ≈ 1 minuto de cálculo |
| RTF (ruta llama.cpp, misma máquina) | 0,12 | Referencia comparativa del autor |
| CER inglés (generaciones llama.cpp) | 4,4 % | Sobre el modelo base |
| CER ruso (generaciones llama.cpp) | 11,3 % | Elevado por pronunciación de números |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, al tratarse de un modelo TTS.

## Requisitos de hardware

- VRAM estimada: el GGUF principal ocupa 3,1 GB; sumando los packs Marlin (1,79 GB + 0,24 GB) y el tokenizador, el conjunto ronda los 5,2 GB, por lo que encaja en GPUs de 6 GB.
- GPU recomendadas: RTX 3060 Laptop 6 GB verificada por el autor; se espera que funcione en GPUs consumer con 6 GB o más (RTX 3060, 4060, 4070, etc.).
- Cabe en GPU consumer: sí, según la prueba del autor en una RTX 3060 Laptop de 6 GB.
- Opciones de despliegue: exclusivamente s2.cpp (CUDA); no es compatible con llama.cpp, vLLM, Ollama ni TGI.
- Latencia y throughput: RTF 0,78 en RTX 3060 Laptop (s2.cpp); RTF 0,12 por la ruta llama.cpp con la misma máquina.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| s2-pro-ru-en-q4-km | 4,86 B | no disponible | ru, en | Fish Audio Research License | GGUF + Marlin (s2.cpp) |
| fishaudio/s2-pro (base) | 4,86 B | no disponible | no disponible | Fish Audio Research License | safetensors |
| Modelos TTS bilingües ruso-inglés comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos TTS comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Licencia Fish Audio Research License: uso de investigación; el uso comercial requiere acuerdo separado con Fish Audio.
- Solo soporta ruso e inglés tras la poda de vocabulario; otros idiomas del modelo base quedan fuera.
- CER en ruso del 11,3 %, elevado por la pronunciación de números; revisar la normalización de cifras antes de producción.
- No es compatible con llama.cpp ni con los motores de despliegue habituales (vLLM, Ollama, TGI); requiere s2.cpp.
- Sin los packs Marlin, el motor se detiene o cae a un camino ggml lento; es necesario distribuir todos los archivos en el mismo directorio.
- El tokenizador podado es obligatorio; usar otro tokenizer.json puede degradar o romper la generación.
- No hay datos publicados sobre sesgos, alucinación (en TTS, artefactos o pronunciación incorrecta) ni límites de contexto.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validación comunitaria.
- El autor solo reporta pruebas de humo (`smoke`) con clonación de voz y emociones; no hay evaluación exhaustiva de calidad.

## Enlaces

- Hugging Face: https://huggingface.co/Igor282/s2-pro-ru-en-q4-km
- Modelo base: https://huggingface.co/fishaudio/s2-pro
- Licencia del modelo base: https://huggingface.co/fishaudio/s2-pro/blob/main/LICENSE.md
- Motor s2.cpp: https://github.com/rodrigomatta/s2.cpp
