# agentory/kokoro-82m-GGUF

## Resumen

Kokoro-82M es un modelo de síntesis de voz (text-to-speech) de pesos abiertos con 81,7 millones de parámetros, construido sobre la arquitectura StyleTTS2 y publicado originalmente por hexgrad bajo licencia Apache-2.0. Esta ficha corresponde concretamente a la conversión a formato GGUF/ggml publicada por el usuario agentory, derivada del repositorio `hexgrad/Kokoro-82M` y pensada para ejecutarse con el runtime CrispASR (CrispStrobe/CrispASR), no con llama.cpp ni con el stack habitual de LLMs.

El interés de esta variante es puramente práctico: convierte un modelo TTS de referencia en dos ficheros de 156 MB (F16) y 135 MB (Q8_0) que se ejecutan en CPU sin GPU dedicada, manteniendo una fidelidad numérica verificada frente a la implementación en PyTorch. Es, por tanto, una opción realista para síntesis de voz en entornos con recursos muy limitados, despliegue en el borde o integración dentro de pipelines de generación de audio a gran escala.

No es un modelo de lenguaje: no genera texto, no razona y no soporta tool calling ni agentes. Su única función es convertir texto (fonemizado a IPA mediante libespeak-ng) en audio WAV mono a 24 kHz. La etiqueta de idioma del repositorio declara únicamente `en`, aunque el vocabulario IPA de 178 símbolos del modelo base cubre en, es, fr, hi, it, ja, pt y zh, y existen backbones adicionales para de y ru.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | StyleTTS2 (encoder de texto con LSTM bidireccional, pl-BERT de 12 capas, predictor de duración/F0 y decoder iSTFTNet) |
| Parámetros totales | 81.731.256 (81,7 M) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo TTS, sin ventana de contexto; la entrada es texto fonemizado) |
| Tipos de cuantización | F16 (156 MB) y Q8_0 (135 MB); Q4_K no se publica por quedar por debajo del umbral de calidad |
| Idiomas soportados | Etiqueta del repo: `en`. Vocabulario IPA del modelo base: en, es, fr, hi, it, ja, pt, zh; de y ru con backbone alemán adicional |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | GGUF (ggml); el original está en safetensors/PyTorch |
| Frecuencia de muestreo de salida | 24 kHz, mono, WAV |
| Dimensión de estilo | 256 (repartida 128 + 128 entre predictor y decoder) |
| Vocabulario de entrada | 178 símbolos IPA |
| Modelo base | hexgrad/Kokoro-82M; arquitectura de yl4579/StyleTTS2-LJSpeech |
| Tamaño del repositorio | 0,3 GB |
| Runtime soportado | CrispASR (backend `kokoro`); no se documenta soporte en llama.cpp, Ollama, vLLM ni TGI |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura StyleTTS2 de Yinghao Aaron Li, adaptada por hexgrad. El texto se convierte primero en fonemas IPA (178 símbolos) mediante un fonemizador libespeak-ng en proceso; esos IDs pasan por una capa de embedding, un bloque CNN y un LSTM bidireccional. En paralelo, un pl-BERT de 12 capas de transformer (768 dimensiones, 12 cabezas) extrae características de prosodia del texto. Un predictor compuesto por un LSTM de duración y curvas de F0 y energía genera la duración de cada fonema y el contorno prosódico, condicionado por un vector de estilo de 256 dimensiones. El decoder es un iSTFTNet con tres etapas de upsampling (10x6 = 60x), bloques residuales y una iSTFT final con n_fft=20 y hop=5, que produce audio mono a 24 kHz.

Esta conversión concreta no implica entrenamiento, fine-tuning, merging ni destilación: solo cambia la representación numérica de los pesos originales a GGUF. El repositorio no documenta datos de entrenamiento propios ni composición del dataset; cualquier detalle al respecto corresponde al proveedor original (hexgrad). No se especifica en la información disponible si el modelo base utilizó RLHF, DPO u otras técnicas de alineación, algo por otra parte poco habitual en TTS.

La innovación técnica relevante de esta variante es la infraestructura de conversión y verificación: el script `models/convert-kokoro-to-gguf.py` maneja tanto las formas heredadas `weight_g`/`weight_v` como las modernas `parametrizations.weight.original{0,1}` de WeightNorm, lo que permite convertir también re-entrenamientos de la comunidad. Además, el arnés `crispasr-diff kokoro` compara etapa por etapa la salida de ggml contra la referencia PyTorch mediante similitud coseno, lo que permite decidir qué cuantizaciones son aceptables con criterio medido y no estimado.

## Capacidades

- Síntesis de voz a partir de texto en inglés, con salida WAV mono a 24 kHz.
- Fonemización IPA en proceso mediante libespeak-ng; el flag `--language <code>` permite en, es, fr, it, pt, hi, ja, zh y, con el backbone alemán, de y ru.
- Control de timbre y estilo mediante voice packs independientes (vectores de estilo de 256 dimensiones), versionables por separado del modelo.
- Enrutado automático por idioma cuando el fichero de modelo y los voice packs están en el mismo directorio.
- Predicción explícita de duración, F0 y curvas de energía, lo que da control implícito sobre ritmo y entonación.
- Ejecución en CPU sin GPU, con huella de disco de 135-156 MB.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades de visión, audio de entrada ni comprensión de lenguaje: es estrictamente texto a voz.
- No dispone de modo "thinking" ni de ninguna capacidad de generación de texto.

## Casos de uso

- **Lectura de documentos y accesibilidad**: convertir artículos, PDF o contenido web en audio para lectores de pantalla o personas con discapacidad visual. El modelo cabe en 135 MB y se ejecuta en CPU, por lo que puede empaquetarse dentro de la propia aplicación de escritorio o móvil sin depender de la nube.
- **Generación masiva de audiolibros y pódcast**: al ser determinista en las etapas de duración y decoder (el F16 es bit-true en las etapas deterministas), se puede sintetizar por lotes con resultados reproducibles y usar distintos voice packs para separar narrador y personajes.
- **Sistemas de respuesta vocal (IVR) y avisos automáticos**: integración en centralitas o servicios de notificación que necesitan generar locuciones cortas con baja latencia y sin coste por petición. La licencia Apache-2.0 permite uso comercial sin regalías.
- **Generación de datasets sintéticos para ASR**: producir corpus de audio etiquetado en varios idiomas para entrenar o evaluar modelos de reconocimiento de voz, usando el propio ASR (por ejemplo Parakeet) como verificación de ida y vuelta, tal como documenta el autor.
- **Doblaje y localización de contenido**: el vocabulario IPA multilingüe del modelo base y el enrutado por idioma permiten generar pistas de voz en es, fr, it, pt, hi, ja o zh a partir de guiones de texto, con voice packs específicos por idioma.
- **Prototipado en dispositivos de borde**: Raspberry Pi, routers, wearables o sistemas embebidos con Linux y poca RAM pueden ejecutar el Q8_0 con CrispASR al no requerir GPU ni frameworks de deep learning pesados.
- **Videojuegos y experiencias interactivas**: diálogos de PNJ generados en tiempo de ejecución con un único binario y ficheros de voz ligeros, evitando empaquetar todos los clips de audio pregrabados.
- **Pruebas de regresión de pipelines TTS**: usar el par F16/Q8_0 como referencia para validar cambios en un pipeline de audio, comparando la similitud coseno por etapa con `crispasr-diff`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MOS, MCD, WER sobre corpus públicos) en la información disponible. El autor sí documenta una verificación interna de fidelidad frente a la referencia PyTorch:

| Etapa (selección) | F16 cos_min | Q8_0 cos_min |
|---|---:|---:|
| token_ids → durations | 1.000 | 1.000 |
| `pred_lstm_out` | 0.999 | 0.997 |
| `dec_decode_3_out` | 0.9999 | 0.9990 |
| `audio_out` (divergente por RNG) | 0.99 | 0.85 |

Resultado global del arnés: F16 alcanza 16/16 etapas con cos ≥ 0,999; Q8_0 alcanza 9/16 con ese mismo umbral, manteniéndose por encima de cos ≥ 0,85 en las etapas fallidas.

Verificación por reconocimiento de voz (ida y vuelta con `parakeet-tdt-0.6b-v3 -l en`, voz `af_heart`):

| Cuantización | Texto sintetizado | Salida de Parakeet |
|---|---|---|
| F16 | "Hello, this is a test of the English phonemizer." | "Hello this is a test of the English Phone Miza." |
| Q8_0 | (mismo texto) | "Hello this is a test of the English Phone Miza." |

Ambas cuantizaciones producen salidas idénticas tras el ASR; el error final se atribuye a la transcripción de la palabra poco frecuente "phonemizer", no a un artefacto del TTS.

## Requisitos de hardware

- **VRAM**: no requiere GPU. El modelo completo ocupa 156 MB en F16 y 135 MB en Q8_0; la memoria de trabajo adicional para buffers de inferencia es pequeña pero no se documenta su valor exacto.
- **GPU recomendadas**: no aplica; el runtime documentado (CrispASR) es de CPU. No se ha publicado soporte CUDA para este backend en la información disponible.
- **GPU de consumo**: irrelevante para el funcionamiento, pero cualquier GPU consumer puede alojar el modelo si en el futuro se añade aceleración; no hay datos de rendimiento al respecto.
- **CPU**: cualquier x86-64 o ARM64 con soporte AVX2/NEON es suficiente por el tamaño del modelo; no se especifican requisitos mínimos oficiales.
- **Almacenamiento**: 135 MB (Q8_0) o 156 MB (F16) para el modelo, más el tamaño de cada voice pack.
- **Opciones de despliegue**: CrispASR (compilación con CMake, target `crispasr`, flag `--backend kokoro`); descarga vía `huggingface-cli`. No se documenta compatibilidad con llama.cpp, Ollama, vLLM, TGI ni servidores OpenAI-compatibles.
- **Latencia y throughput**: no disponibles. Al ser un modelo de 81,7 M de parámetros en CPU, la generación es previsiblemente más lenta que tiempo real en hardware modesto, pero no hay cifras publicadas que lo confirmen.
- **Requisito adicional**: dependencia de libespeak-ng para la fonemización, compilada en el proceso.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| agentory/kokoro-82m-GGUF (esta ficha) | 81,7 M | No aplica | en (etiqueta); vocabulario IPA para 8 idiomas | Apache-2.0 | GGUF (F16, Q8_0) | HuggingFace, runtime CrispASR |
| hexgrad/Kokoro-82M (original) | 81,7 M | No aplica | en (etiqueta); vocabulario IPA para 8 idiomas | Apache-2.0 | safetensors / PyTorch | HuggingFace, requiere stack Python |
| yl4579/StyleTTS2-LJSpeech | No disponible en la información | No aplica | en | No disponible en la información | PyTorch | HuggingFace / GitHub |
| cstr/kokoro-de-hui-base-GGUF (backbone alemán) | Derivado de Kokoro-82M | No aplica | de | Apache-2.0 (heredada) | GGUF | HuggingFace |

La diferencia práctica frente al original no está en calidad ni en capacidades, sino en el formato: el GGUF elimina la dependencia de PyTorch y permite ejecución nativa en CPU con un binario pequeño, a cambio de quedar atado a un runtime específico (CrispASR) y de perder fidelidad numérica parcial en Q8_0 en la etapa de audio. No se dispone de datos para comparar con alternativas TTS de la misma categoría (Piper, VITS, XTTS) en parámetros, MOS o latencia.

## Limitaciones y advertencias

- **Modelo unicamente TTS**: no genera texto, no responde preguntas y no mantiene conversaciones; cualquier caso de uso debe plantearse como conversión texto → audio.
- **Idioma declarado**: la etiqueta del repositorio es solo `en`. Aunque el vocabulario IPA cubre más idiomas, la calidad fuera del inglés no está verificada en esta conversión y depende de disponer de voice packs del idioma correspondiente.
- **Cuantización Q4_K no disponible**: el autor la descarta explícitamente porque la similitud coseno en `audio_out` cae a ~0,1 y el backbone alemán produce salida ininteligible. No debe intentarse reutilizar cuantizaciones más agresivas sin verificación.
- **Pérdida de fidelidad en Q8_0**: la etapa `audio_out` baja a cos 0,85 frente al 0,99 de F16. El autor sostiene que no afecta al roundtrip ASR, pero es una desviación medible que conviene validar en el caso de uso concreto.
- **Dependencia de libespeak-ng**: la calidad de la fonemización condiciona la pronunciación; palabras poco frecuentes o neologismos pueden articularse mal, como muestra el propio ejemplo del autor ("phonemizer").
- **Voces fuera del repo**: los voice packs no están incluidos en `agentory/kokoro-82m-GGUF`, sino en un repositorio aparte (`cstr/kokoro-voices-GGUF`). Sin un voice pack el modelo no es utilizable de forma práctica.
- **Inconsistencia en la model card**: las instrucciones de descarga del README apuntan a `cstr/kokoro-82m-GGUF`, no a `agentory/kokoro-82m-GGUF`. Conviene verificar la ruta real antes de automatizar la descarga.
- **Madurez del repositorio**: 0 descargas y 0 likes en la fecha de creación (28 de octubre de 2026), sin historial de uso ni issues. No hay evidencia de comunidad que valide la conversión más allá de las pruebas del propio autor.
- **Runtime único**: no hay soporte documentado en llama.cpp, Ollama, vLLM ni TGI; la integración en producción exige compilar CrispASR y aceptar su API de línea de comandos.
- **Sesgos**: no se documenta ningún análisis de sesgos acústicos (género, acento, edad) ni de cobertura de los voice packs. Un TTS puede reproducir o amplificar sesgos de pronunciación y de representación de voces.
- **Alucinación**: el concepto no aplica literalmente, pero el modelo puede producir artefactos acústicos, prosodia incorrecta o silencios ante texto fuera de distribución; no existe mecanismo de confianza o abstención.
- **Licencia**: Apache-2.0 permite uso comercial y modificación con atribución. El repositorio no concede derechos adicionales a los del modelo base. Bajo el Reglamento (UE) 2024/1689, el proveedor del modelo sigue siendo el autor original (hexgrad); esta conversión no constituye un nuevo modelo de propósito general.

## Enlaces

- Repositorio de esta conversión: https://huggingface.co/agentory/kokoro-82m-GGUF
- Modelo base original: https://huggingface.co/hexgrad/Kokoro-82M
- Voice packs GGUF: https://huggingface.co/cstr/kokoro-voices-GGUF
- Backbone alemán: https://huggingface.co/cstr/kokoro-de-hui-base-GGUF
- Repositorio de voces del modelo base: https://huggingface.co/hexgrad/Kokoro-82M/tree/main/voices
- Runtime y conversión (CrispASR): https://github.com/CrispStrobe/CrispASR
- Arquitectura StyleTTS2 (Yinghao Aaron Li): https://github.com/yl4579/StyleTTS2

Nota: la búsqueda web realizada no ha devuelto resultados relevantes sobre este modelo; los enlaces anteriores proceden exclusivamente de la model card y de la información del repositorio de HuggingFace.
