# Infinix-ai/Drama-3-GGUF

## Resumen

Drama 3 GGUF es una conversión experimental del modelo de síntesis de voz Fish Audio Drama 3 al formato GGUF para su uso con el runtime nativo audio.cpp. El trabajo lo publica el usuario Infinix-ai y parte del checkpoint original `fishaudio/drama-3` en la revisión `dd64a85cd82e9521f7202610ede97b367fc83946`. No se trata de un modelo nuevo ni de un reentrenamiento: es una redistribución cuantizada del modelo base con arquitectura de mezcla de expertos (MoE) orientada a text-to-speech, clonación de voz y edición de audio.

La relevancia de esta publicación es práctica: permite ejecutar un modelo TTS de gran tamaño en C++ nativo (CLI y servidor HTTP) sin depender de un proceso de inferencia en Python, y ofrece seis perfiles de cuantización mixta que van desde 15,88 GiB hasta 23,87 GiB. El repositorio completo ocupa 135,7 GB porque incluye los seis paquetes autónomos, cada uno con configuración, tokenizador, códec, contrato de modelo y licencia embebidos.

La licencia es la Fish Audio Community License v1.0, lo que condiciona el uso comercial. El modelo no declara idiomas soportados en la información disponible y el proyecto se marca explícitamente como experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) con torre de audio y códec de forma de onda; arquitectura GGUF `audiocpp` |
| Parametros totales | no disponible |
| Parametros activos | no disponible (el modelo es MoE, con 120 bancos de proyección de expertos enrutados y 40 routers más 40 puertas de expertos compartidos, según la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q4_K_S en expertos; Q8_0 y Q4_K en backbone; Q4_0 en embedding de texto; FP32 en routers y normalizaciones; FP16 en torre de audio y códec; BF16 en embedding y cabeza en un perfil |
| Idiomas soportados | no disponible |
| Licencia | fish-audio-community-license-v1.0 |
| Formato de pesos | GGUF (seis paquetes: 15,88 GiB, 18,93 GiB, 21,78 GiB, 22,91 GiB, 22,97 GiB y 23,87 GiB) |

## Arquitectura y entrenamiento

El modelo base Drama 3 es un transformer con mezcla de expertos enrutada: la model card menciona 120 bancos de proyección de expertos y 40 routers más 40 puertas de expertos compartidos. La pila incluye una torre de audio y un códec de forma de onda, ambos mantenidos en FP16 en todas las conversiones, mientras que las matrices del backbone lingüístico se almacenan en Q8_0 o Q4_K según el perfil. Las normalizaciones del backbone y de la torre de audio permanecen en FP32, y las del códec en FP16.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; la model card de esta conversión no los detalla. La innovación técnica destacable de esta publicación no está en el entrenamiento sino en el empaquetado: cuantización mixta con selección explícita de precisión por componente, bancos de expertos "puros" (los 120 bancos usan uniformemente Q3_K o Q4_K en los perfiles correspondientes), perfiles con routers restaurados a FP32 para evitar el redondeo de Q8, y paquetes autónomos que embeben tokenizador, códec, configuración y licencia para no requerir el checkpoint original en inferencia.

## Capacidades

- Síntesis de voz (text-to-speech) offline y en streaming.
- Clonación de voz mediante referencias de hablante.
- Direcciones de hablante y de evento (speaker and event directions).
- Edición de audio y edición de voz.
- Troceado de audio de formato largo (long-form chunking).
- Historial de continuación y edición mediante artefactos de toma (take artifacts).
- Ejecución como CLI nativo en C++ y como servidor HTTP, sin proceso Python.
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada.

## Casos de uso

- Doblaje y localización de contenido: el modelo permite generar voces sintéticas clonadas a partir de referencias de hablante, lo que facilita producir pistas de voz para vídeo o podcast manteniendo un timbre consistente entre fragmentos.
- Audiolibros y narración de formato largo: el soporte de chunking de formato largo y de continuación permite procesar textos extensos por tramos sin perder coherencia entre segmentos.
- Edición de voz en postproducción: las capacidades de edición de audio y el historial de tomas permiten corregir o regenerar fragmentos concretos de una grabación sin rehacer la locución completa.
- Asistentes de voz embebidos: al ejecutarse como servidor HTTP nativo en C++ con backend CUDA o CPU, puede integrarse en servicios de atención por voz sin añadir una dependencia de Python al stack.
- Prototipado de interfaces conversacionales: la clonación de voz y las direcciones de hablante permiten generar variantes de locutor para pruebas de UX de productos de voz.
- Generación de contenido accesible: conversión de texto a voz para lectura de documentos o interfaces de accesibilidad, con control de hablante y de evento.
- Investigación en TTS: los seis perfiles de cuantización mixta permiten estudiar el impacto de la precisión en expertos, routers y embedding sobre la calidad de la voz generada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al menos el tamaño del paquete GGUF elegido, es decir, entre 15,88 GiB (Q2_K) y 23,87 GiB (Q4 con routers FP32 y embedding/cabeza BF16), más el overhead del runtime y del contexto.
- GPU recomendadas: no se especifican en la información disponible; por tamaño, los perfiles Q4 encajan en GPUs de 24 GB (RTX 4090, A10G, L4 de 24 GB) y los perfiles Q2/Q3 en GPUs de 16-20 GB, aunque esto es una estimación por tamaño y no un dato publicado.
- Cabe en GPU de consumo: los perfiles de 15,88 GiB y 18,93 GiB son los candidatos más realistas para GPUs de consumo de 24 GB; los perfiles de 22,91-23,87 GiB dejan muy poco margen para contexto y overhead.
- Opciones de despliegue: audio.cpp main con el backend `fish_drama3` habilitado (CLI nativo y servidor HTTP). Se validó con el commit `e065d66b` en Windows CPU y CUDA. Los runtimes GGUF de propósito general no pueden ejecutar esta arquitectura `audiocpp`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos de TTS comparables que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Proyecto marcado como experimental por el propio autor; no se garantiza estabilidad en producción.
- Requiere un build de audio.cpp con el backend `fish_drama3`; las versiones anteriores a la fusión de Drama 3 no lo incluyen.
- La arquitectura GGUF `audiocpp` no es compatible con runtimes de texto GGUF de propósito general (llama.cpp estándar, Ollama, vLLM, TGI).
- La licencia Fish Audio Community License v1.0 condiciona el uso comercial; es necesario revisar sus términos antes de desplegar.
- No se declaran idiomas soportados, lo que impide garantizar cobertura multilingüe.
- Riesgo de alucinación y artefactos de voz inherente a los modelos TTS; no se documentan evaluaciones de calidad o robustez en la información disponible.
- Los perfiles de menor precisión (Q2_K en expertos) pueden degradar la calidad de la voz; el autor no publica métricas comparativas entre perfiles.
- El repositorio de 135,7 GB incluye seis paquetes; conviene descargar solo el perfil necesario.
- No se documentan sesgos conocidos del modelo base en la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Infinix-ai/Drama-3-GGUF
- Modelo base: https://huggingface.co/fishaudio/drama-3
- Licencia del modelo base: https://huggingface.co/fishaudio/drama-3/blob/main/LICENSE
- Runtime audio.cpp: https://github.com/0xShug0/audio.cpp
- Commit validado: https://github.com/0xShug0/audio.cpp/commit/e065d66b7aa70bb697e39b1e7a952197f017baef
- Instrucciones de build y servidor en Windows: https://github.com/0xShug0/audio.cpp/blob/main/docs/models/fish_drama3.md
- Opciones de cuantización de llama.cpp: https://github.com/ggml-org/llama.cpp/blob/master/tools/quantize/quantize.cpp
