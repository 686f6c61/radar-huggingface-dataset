# gitmodelmujtaba/kokoro-grounded-documentary

## Resumen

Kokoro Grounded Documentary Voiceover Model (v2.0) es un motor de texto a voz (TTS) de grado broadcast desarrollado por el usuario gitmodelmujtaba sobre Kokoro-ONNX, un modelo TTS ligero y de código abierto. El repositorio no entrena un modelo nuevo, sino que empaqueta los pesos de Kokoro v1.0 en formato ONNX junto con un perfil de voz personalizado denominado "Grounded Documentary v2.0", una mezcla ponderada de tres voces británicas (60 % `bm_george`, 25 % `bm_lewis` y 15 % `bm_daniel`, acento RP británico) diseñada para narración de documentales, contenido filosófico y cosmológico.

Su valor diferencial no está en la arquitectura del modelo base, sino en la calibración de producción: ritmo contemplativo (velocidad 0.91, pausas de frase de 0,65 s), un léxico fonético para términos sánscritos y védicos, y una cadena de masterización FFmpeg con compresión soft-knee, de-essing y normalización de sonoridad EBU R128 a -16 LUFS. Esto lo hace especialmente adecuado para creadores de contenido documental en YouTube o podcasts que necesitan voz en off profesional sin grabar locución humana. El modelo pesa 310 MB en ONNX y se ejecuta localmente, con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kokoro v1.0 (TTS, detalles de arquitectura interna no disponibles en la ficha) |
| Parametros totales | no disponible (pesos de 310 MB en ONNX) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos ONNX de 310 MB) |
| Idiomas soportados | Ingles (en-gb, acento RP britanico) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (modelo), .bin (libreria de voces), .npy (embedding de voz float32) |

## Arquitectura y entrenamiento

El modelo base es Kokoro v1.0, un sistema TTS ligero distribuido en formato ONNX (310 MB) que genera audio a partir de texto y un vector de estilo de voz (voice embedding). La ficha no detalla la arquitectura interna de Kokoro ni los datos con los que fue entrenado; lo que aporta este repositorio es una capa de calibracion sobre el modelo base.

La principal innovacion es el perfil "Grounded Documentary v2.0": un embedding de voz pre-mezclado (archivo `grounded_documentary.npy`, 510 KB, float32) resultante de combinar tres voces de la libreria de Kokoro con pesos 60/25/15. La mezcla esta calibrada, segun el autor, mediante analisis acustico multimodal para lograr un tono baritono autoritario sin fatiga nasal en medios-agudos. Ademas, el repositorio incluye utilidades de produccion: una clase narrador (`narrator.py`) con cadena de masterizacion integrada y un lexico fonetico (`pronunciation.py`) que corrige la pronunciacion de terminos sanscritos y mitologicos como *Rsis*, *Nasadiya Sukta*, *Yajnavalkya* o *Brahman*. No hay entrenamiento propio ni ajuste fino de pesos en este repositorio.

## Capacidades

- Sintesis de voz en ingles britanico (RP) con perfil de voz documental pre-calibrado, sin necesidad de configurar mezclas manualmente.
- Control de ritmo: velocidad de habla ajustable (0,91 por defecto) y pausas configurables por frase (0,65 s), por clausula (0,30 s) y pausas extendidas (1,1-1,3 s) para transiciones tematicas.
- Pronunciacion correcta de terminos sanscritos, vedicos y mitologicos mediante lexico fonetico incluido.
- Cadena de masterizacion de audio de grado broadcast en una sola pasada FFmpeg: compresion soft-knee estilo optico, de-essing, filtro de "boxiness", ecualizacion y normalizacion EBU R128 (-16 LUFS, true peak -1,5 dB).
- Ejecucion local y ligera: el modelo completo pesa 310 MB en ONNX, apto para inferencia sin GPU.
- Libreria de voces completa de Kokoro incluida (`voices-v1.0.bin`, 27 MB), lo que permite usar otras voces ademas del perfil documental.

## Casos de uso

- Narracion de documentales para YouTube: el perfil de voz, el ritmo contemplativo y la normalizacion a -16 LUFS estan calibrados especificamente para estandares de documental en esa plataforma, evitando la post-produccion manual de audio.
- Podcasts de divulgacion filosofica o cosmologica: las pausas extendidas entre transiciones tematicas (1,1-1,3 s) y el tono baritono encajan con narracion meditativa de largo formato.
- Contenido sobre mitologia, vedas o filosofia oriental: el lexico fonetico integrado pronuncia correctamente terminos como *Atman*, *Rta* o *Ekam Sat* sin edicion manual.
- Produccion de audiolibros o narraciones de texto largo: la ejecucion local en ONNX permite procesar capitulos completos por lotes sin coste de API ni limites de cuota.
- Prototipado rapido de voiceovers: con tres descargas y unas pocas lineas de Python se obtiene audio WAV listo para masterizar, util en pre-produccion antes de contratar locucion.
- Accesibilidad y narracion automatizada: la licencia Apache 2.0 permite integrar el motor en aplicaciones de lectura de texto o descripciones de video sin restricciones comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La ficha tampoco incluye metricas de calidad de audio (MOS, WER de inteligibilidad) ni tiempos de generacion por segundo de audio.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo ONNX de 310 MB esta pensado para inferencia en CPU. No se especifican cifras de VRAM para aceleracion por GPU.
- GPU recomendadas: no disponible; cualquier GPU moderna con soporte ONNX Runtime (por ejemplo una RTX 3060 o superior) deberia acelerar la inferencia, pero no hay datos publicados.
- Consumer GPUs: al ser ejecutable en CPU, no necesita GPU dedicada; cabe sobradamente en la RAM de cualquier equipo moderno (el repo completo ocupa 0,4 GB).
- Despliegue: via Python con `kokoro-onnx` y `huggingface_hub` (codigo de ejemplo en la model card); requiere FFmpeg para la cadena de masterizacion. No se mencionan integraciones con vLLM, TGI u Ollama (no aplicables a un modelo TTS ONNX).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tamano | Idioma | Licencia | Diferencia clave |
|---|---|---|---|---|
| Kokoro Grounded Documentary v2.0 | 310 MB (ONNX) | Ingles (en-gb) | Apache 2.0 | Perfil de voz documental calibrado + lexico sanscrito + masterizacion FFmpeg incluida |
| hexgrad/Kokoro-82M (base) | ~82M parametros / ~310 MB ONNX | Ingles, japones, chino y otros | Apache 2.0 | Modelo base generico; requiere configurar voz y post-proceso manualmente |
| Piper TTS | Modelos de 20-100 MB | Multilingue (muchas variantes) | MIT | Mas ligero y rapido en CPU, pero calidad de voz y control de estilo inferiores |
| Coqui XTTS v2 | ~750 MB | Multilingue (16 idiomas) | Licencia Coqui (no totalmente permisiva) | Soporta clonacion de voz y mas idiomas, pero licencia restrictiva para uso comercial |

Nota: los datos de Kokoro base y alternativas provienen de conocimiento general; este repositorio no publica comparativas propias.

## Limitaciones y advertencias

- Solo soporta ingles (variante britanica en-gb) segun la ficha; no hay soporte documentado para castellano ni otros idiomas, lo que limita su uso en producciones en espanol.
- El repositorio tiene 0 descargas registradas, por lo que no hay evidencia comunitaria de calidad ni de estabilidad del perfil de voz.
- La calibracion del tono ("analisis acustico multimodal", "Gemini-Calibrated") es una afirmacion del autor sin metodologia ni metricas publicadas que la respalden.
- El lexico sanscrito cubre un conjunto concreto de terminos; palabras fuera del lexico pueden pronunciarse incorrectamente.
- La cadena de masterizacion asume voz masculina baritona; los valores de EQ y compresion pueden no ser adecuados para otras voces de la libreria.
- No hay datos de WER, MOS ni latencia, por lo que la idoneidad para produccion debe validarse empiricamente.
- Licencia Apache 2.0: uso comercial permitido, pero conviene verificar la licencia del modelo base Kokoro y de las voces incluidas en `voices-v1.0.bin` para proyectos comerciales.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/gitmodelmujtaba/kokoro-grounded-documentary
- Modelo base Kokoro (referencia): https://huggingface.co/hexgrad/Kokoro-82M
- Paper, blog o demo: no disponibles en la informacion proporcionada.
