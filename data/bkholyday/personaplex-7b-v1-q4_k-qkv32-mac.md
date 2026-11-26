# bkholyday/personaplex-7b-v1-q4_k-qkv32-mac

## Resumen

PersonaPlex-7B-v1-q4_k-qkv32-mac es una cuantización comunitaria experimental del modelo NVIDIA PersonaPlex-7B-v1, un sistema speech-to-speech (audio a audio) de 7.000 millones de parámetros orientado a interfaces de voz conversacionales en inglés. La publica el usuario bkholyday bajo el paraguas de audio.cpp, una librería de inferencia de audio nativa para Apple Silicon, y su propósito es hacer viable la ejecución local del modelo en Macs con memoria unificada limitada. El cambio técnico concreto respecto al GGUF de origen es la conversión selectiva de 32 matrices QKV empaquetadas en BF16 del modelo de lenguaje principal a Q4_K, manteniendo intactos el códec de audio, los prompts de voz empaquetados y la configuración de contexto.

La relevancia de esta ficha es doble. Por un lado, documenta un caso real de cuantización comunitaria sobre un modelo de audio de NVIDIA con licencia Open Model License, con todas las implicaciones legales que ello conlleva. Por otro, es un ejemplo de ingeniería de despliegue en el ecosistema Apple: el paquete incluye un launcher en Python, un manifiesto de verificación de artefactos y un runtime Metal fijado a una versión concreta. No se ha realizado entrenamiento ni fine-tuning adicional; es puramente una transformación de precisión numérica.

El autor advierte explícitamente de que la equivalencia de seguridad respecto al modelo original no está establecida y de que el modelo, en pruebas cualitativas, reprodujo de forma incorrecta hechos que habían sido corregidos en la conversación. Se trata, por tanto, de un artefacto para experimentación local con interfaces de voz y demostraciones de soporte ficticias, no de un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base speech-to-speech de NVIDIA; el GGUF de origen es un pipeline audio-to-audio con modelo de lenguaje principal y códec de audio) |
| Parametros totales | 7B (según el nombre del modelo base, PersonaPlex-7B-v1) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K (con 32 matrices QKV del LM principal convertidas de BF16 a Q4_K); el resto del GGUF de origen mezcla precisiones |
| Idiomas soportados | Inglés (en) |
| Licencia | NVIDIA Open Model License (etiqueta `license: other`, `license_name: nvidia-open-model-license`); avisos subyacentes de Kyutai CC BY 4.0; el launcher tiene licencia MIT separada |
| Formato de pesos | GGUF (librería audio.cpp) |
| Tamano del repositorio | 5,6 GB |
| Pipeline | audio-to-audio |
| Runtime verificado | audio.cpp v0.9.6, macOS arm64 Metal |
| Hardware de referencia | Apple M5 Max, 128 GiB, macOS 27.2 |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base en la documentación proporcionada. Por el nombre y el pipeline declarado (audio-to-audio, speech-to-speech), se trata de un sistema que recibe audio de entrada y genera audio de salida, con un modelo de lenguaje principal de 7B parámetros y un códec de audio asociado. El GGUF de origen, publicado por audio-cpp, mezcla varias precisiones de cuantización; en concreto, las 32 matrices QKV empaquetadas del LM principal permanecían en BF16, lo que encarecía el uso de memoria.

Esta release no entrena ni ajusta nada: aplica una cuantización adicional Q4_K exclusivamente a esas 32 matrices QKV, sin recortar la longitud de conversación ni modificar el códec, los prompts de voz ni la configuración de contexto. El autor subraya que la reducción de memoria proviene de la cuantización de esos tensores, no de un recorte de contexto. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo original.

## Capacidades

- Conversión de voz a voz (speech-to-speech) en inglés: entrada de audio, salida de audio.
- Flujo de trabajo de conversión de voz / S2S en la interfaz web local: grabar o aportar un fichero, ejecutar y recibir una respuesta.
- Soporte de rol o persona mediante prompt de sistema (fichero `default-role.txt` como referencia, que debe introducirse explícitamente en el campo de prompt de la UI).
- Ejecución local en Apple Silicon con Metal a través del runtime audio.cpp.
- Verificación de integridad de artefactos mediante manifiesto incluido en el paquete.
- No se documentan en la información disponible capacidades de tool calling, function calling, razonamiento multi-paso, visión, matemáticas o modo thinking.
- Conversación en tiempo real full-duplex e interrupciones a través de la UI de navegador: no verificadas según el autor.

## Casos de uso

- Experimentación local con interfaces de voz en Mac: el paquete incluye launcher, manifiesto y runtime fijado, de modo que un desarrollador puede levantar un servidor en `127.0.0.1` y probar el ciclo audio-audio sin depender de servicios en la nube, aprovechando la cuantización Q4_K para reducir la huella de memoria.
- Demostraciones de soporte ficticias: el autor indica este uso explícitamente; sirve para prototipar flujos de atención al cliente simulados donde el modelo adopta un rol definido por prompt y responde por voz.
- Evaluación de cuantizaciones comunitarias: útil como caso de estudio de cómo afecta la conversión selectiva de matrices QKV a Q4_K a la calidad de las respuestas y al consumo de memoria en un modelo de audio.
- Pruebas de integración de audio.cpp en macOS: permite validar el runtime Metal, el servidor local con UI embebida, la descarga de modelos deshabilitada y la descarga por inactividad configurada a 1500 ms.
- Prototipado de asistentes por voz con rol definido: el campo de prompt de la UI permite fijar una persona concreta y observar cómo el modelo mantiene el rol a lo largo de un turno de conversión de voz.
- Investigación sobre fidelidad de hechos en modelos de voz: dado que el autor documenta fallos de recapitulación de hechos corregidos, el modelo sirve como banco de pruebas para medir la consistencia contextual en sistemas speech-to-speech.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo aporta observaciones cualitativas: en una conversación larga, la versión modificada reprodujo erróneamente un síntoma que había sido corregido; en un piloto separado con entrada de Piper, recapituló "X12" y páginas en blanco. El propio autor aclara que estas observaciones no establecen una clasificación general de precisión y que la finalización de recursos se evalúa por separado de la corrección de las respuestas.

## Requisitos de hardware

- Plataforma: Apple Silicon (arm64) exclusivamente; se requiere Python 3.10 o superior nativo.
- Memoria: el autor no publica cifras de VRAM o memoria unificada mínima; las mediciones se realizaron en un M5 Max con 128 GiB. No se ha verificado el funcionamiento en máquinas de 16 GB.
- GPU: no aplica a GPU discretas; el runtime verificado es audio.cpp v0.9.6 para macOS arm64 con Metal.
- Almacenamiento: el repositorio ocupa 5,6 GB; hay que prever espacio adicional para el runtime y las descargas iniciales.
- Despliegue: launcher `personaplex_mac.py` con subcomandos `doctor` y `serve`; servidor ligado a `127.0.0.1` con UI embebida del runtime, gestión de modelos deshabilitada y descarga por inactividad de 1500 ms.
- Otros chips, capacidades de memoria y versiones de macOS distintas de la de referencia están sin verificar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| bkholyday/personaplex-7b-v1-q4_k-qkv32-mac | 7B | No disponible | GGUF (audio.cpp) | NVIDIA Open Model License | Cuantización comunitaria para Mac; solo inglés; experimental |
| nvidia/personaplex-7b-v1 | 7B | No disponible | No disponible | NVIDIA Open Model License | Modelo base original de NVIDIA |
| audio-cpp/audio.cpp-gguf (personaplex-7b-v1-q4_k.gguf) | 7B | No disponible | GGUF | Sujeta a la licencia del modelo base | GGUF de origen con precisiones mixtas y QKV en BF16 |

No se dispone de datos de rendimiento comparables entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental: no ha pasado por un proceso de evaluación de seguridad; el autor declara que la equivalencia de seguridad con el original no está establecida.
- Riesgo de alucinación y de fidelidad contextual: se documentan recapitulaciones incorrectas de hechos corregidos y de datos concretos ("X12", páginas en blanco) en pruebas cualitativas.
- Solo inglés: no hay soporte declarado de otros idiomas, incluido el español.
- Contexto: longitud no documentada; el autor aclara que la cuantización no recorta la conversación, pero tampoco publica la ventana real.
- Verificación limitada: no se ha probado en máquinas de 16 GB, ni conversación en japonés, ni operaciones reales de reparación o reserva de dispositivos.
- Full-duplex en tiempo real e interrupciones a través de la UI de navegador: no verificados.
- Licencia: los pesos siguen sujetos a la NVIDIA Open Model License y a los avisos subyacentes de Kyutai CC BY 4.0; la modificación y redistribución comercial están permitidas bajo los términos del modelo, pero no constituyen una autorización para suplantar personas ni vulnerar privacidad, consentimiento u otros derechos.
- El flag `--accept-license` es una aceptación explícita por parte de quien ejecuta el comando; no debe usarse en nombre de terceros.
- El prompt de rol es una instrucción al modelo, no una frontera de seguridad ni de permisos de acción.
- Se requiere evaluación específica por caso de uso y controles de aplicación adecuados antes de cualquier despliegue real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bkholyday/personaplex-7b-v1-q4_k-qkv32-mac
- Modelo base NVIDIA: https://huggingface.co/nvidia/personaplex-7b-v1
- GGUF de origen: https://huggingface.co/audio-cpp/audio.cpp-gguf
- Runtime audio.cpp v0.9.6 (macOS arm64 Metal): https://github.com/0xShug0/audio.cpp/releases/tag/v0.9.6
- Vídeo explicativo en japonés (unos 2 min 31 s): docs/explainer/personaplex_mac_explainer_ja.mp4 (dentro del repositorio)
- Página de explicación y fuentes: docs/explainer/README.md (dentro del repositorio)
- Página de visualización local: docs/explainer/index.html (dentro del repositorio)
