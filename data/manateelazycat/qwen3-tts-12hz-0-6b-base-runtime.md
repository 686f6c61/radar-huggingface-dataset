# manateelazycat/Qwen3-TTS-12Hz-0.6B-Base-Runtime

## Resumen

Qwen3-TTS-12Hz-0.6B-Base-Runtime es un repositorio de artefactos de despliegue publicado por el usuario manateelazycat, no un modelo entrenado desde cero. Contiene las imágenes de runtime nativo (archivos `runtime-thor-0.2.0.tar.gz` y `runtime-orin-0.2.0.tar.gz`) necesarias para ejecutar el modelo de síntesis de voz Qwen3-TTS en plataformas NVIDIA Jetson, concretamente AGX Thor con JetPack 7.2 y AGX Orin con JetPack 6.2.1. El repositorio se presenta como candidatos de runtime "source-verified" para una futura versión AI Pod 0.2.0.

El runtime se apoya en vLLM-Omni 0.19.0rc1, fijado al commit `191b9a8dbf22fc494b7db34ea5ae04153f44f94d`, y separa la generación del componente "talker" (ejecutada en workers nativos de vLLM) de la decodificación del códec (ejecutada en la etapa nativa de Omni). Los pesos del modelo Qwen y del tokenizador de voz no se incluyen en el repositorio: se descargan por separado y se montan en solo lectura, lo que explica que el repo ocupe 21,5 GB pese a no contener los pesos finales.

Su relevancia es operativa más que algorítmica: documenta cómo llevar un modelo TTS de la familia Qwen3 a hardware Jetson con un contrato HTTP compatible con el servicio público existente y soporte de formatos de audio por plataforma. No obstante, el propio autor advierte de que la publicación de estos assets no implica que el LPK del modelo haya superado la aceptación final en GPU ni la revisión de la tienda de aplicaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (runtime de despliegue para Qwen3-TTS; inferencia con vLLM-Omni 0.19.0rc1) |
| Parametros totales | 0,6B segun el nombre del repositorio; no confirmado en la model card |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (se menciona un fichero Hadamard de `compressed-tensors` con constantes matematicas fijas) |
| Idiomas soportados | No disponible |
| Licencia | other (las licencias de dependencias permanecen en las imagenes y no se relicencian) |
| Formato de pesos | Pesos descargados por separado y montados en solo lectura; el repo contiene archivos `.tar.gz` de runtime, no safetensors ni GGUF |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo TTS ni su proceso de entrenamiento: no hay datos sobre número de tokens, composición del dataset, ni si hubo RLHF, DPO u otras fases de alineación. Lo que sí se detalla es la arquitectura del runtime: la generación del "talker" corre en workers nativos de vLLM, mientras que la decodificación del códec se ejecuta en la etapa nativa de Omni. Esta separación permite aprovechar el motor de inferencia de vLLM para la parte generativa y reservar la etapa Omni para la reconstrucción de audio.

El repositorio incluye los programas de inferencia, las dependencias nativas y el toolchain de compilador JIT y CUDA necesarios para el arranque nativo sin caché. Se conserva el contrato HTTP público existente, con soporte de formatos por plataforma: WAV, PCM, MP3 y Opus en Thor, y WAV, PCM y MP3 en Orin. El fichero Hadamard de `compressed-tensors` incluido contiene constantes matemáticas fijas, no pesos aprendidos, un detalle relevante para auditar qué se está distribuyendo realmente.

## Capacidades

- Síntesis de voz (text-to-speech) mediante el modelo Qwen3-TTS, con generación del componente talker en vLLM.
- Decodificación de audio a través de la etapa nativa de Omni, con salida en WAV, PCM, MP3 y Opus (Thor) o WAV, PCM y MP3 (Orin).
- Exposición de un contrato HTTP compatible con el servicio público preexistente, lo que facilita sustituir el backend sin cambiar clientes.
- Despliegue en hardware Jetson AGX Thor (JetPack 7.2) y AGX Orin (JetPack 6.2.1).
- Arranque nativo sin caché gracias al toolchain JIT y CUDA incluido en los archivos.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada.

## Casos de uso

- Síntesis de voz en dispositivos edge: el runtime está empaquetado específicamente para Jetson AGX Thor y Orin, de modo que se puede desplegar TTS local en robots, kioscos o dispositivos industriales sin depender de la nube.
- Asistentes de voz embebidos: al preservar el contrato HTTP original, un asistente ya integrado puede apuntar al nuevo endpoint en Jetson y obtener audio en WAV o PCM sin reescribir el cliente.
- Servicios de locución bajo demanda en entornos con conectividad limitada: la inferencia local con vLLM-Omni evita la latencia de red y la exposición de datos a terceros.
- Integración en pipelines de audio con formatos heterogéneos: el soporte de MP3 y Opus en Thor permite generar directamente el formato requerido por telefonía o streaming sin transcodificación adicional.
- Validación y qualificación de hardware: los manifiestos (`runtime-manifests.json`, `SHA256SUMS`) y la verificación de integridad previa a `docker load` sirven para auditar despliegues en flotas de dispositivos Jetson.
- Pruebas de aceptación previas a publicación en tienda: el repositorio se presenta como candidato para la release AI Pod 0.2.0, útil para equipos que necesiten evaluar el runtime antes de la aceptación final en GPU y la revisión de la tienda.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Hardware objetivo declarado: NVIDIA Jetson AGX Thor con JetPack 7.2 y NVIDIA Jetson AGX Orin con JetPack 6.2.1.
- VRAM estimada para inferencia: no disponible. El tamaño del repo (21,5 GB) corresponde a imágenes de runtime con toolchain CUDA y dependencias, no a los pesos, que se descargan aparte.
- GPU de escritorio o servidor (A100, H100, RTX 4090): no se documenta soporte; el runtime está empaquetado para las plataformas Jetson indicadas.
- Despliegue: carga de imágenes mediante `docker load` tras verificar `SHA256SUMS` y `runtime-manifests.json`; inferencia con vLLM-Omni 0.19.0rc1 en el commit fijado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos de TTS que permitan una comparación rigurosa.

## Limitaciones y advertencias

- El repositorio contiene artefactos de runtime, no pesos de modelo; los pesos de Qwen y del tokenizador de voz deben descargarse por separado y montarse en solo lectura.
- La licencia es "other" y las licencias de las dependencias permanecen en las imágenes sin relicenciarse; es necesario revisarlas antes de cualquier uso comercial.
- El autor advierte explícitamente de que la publicación de estos assets no implica que el LPK del modelo haya superado la aceptación final en GPU ni la revisión de la tienda de aplicaciones.
- Se trata de una versión candidata (0.2.0) con vLLM-Omni 0.19.0rc1, un release candidate; no debe asumirse estabilidad de API ni de comportamiento.
- Soporte de formatos asimétrico: Opus solo está disponible en Thor, no en Orin.
- No hay información sobre sesgos, riesgo de alucinación, cobertura idiomática ni limitaciones de contexto del modelo TTS subyacente.
- El repositorio registra 0 descargas y 0 likes, sin pipeline declarado ni idiomas especificados; la madurez y el soporte de la comunidad son mínimos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/manateelazycat/Qwen3-TTS-12Hz-0.6B-Base-Runtime
- vLLM-Omni (proyecto referenciado, commit fijado `191b9a8dbf22fc494b7db34ea5ae04153f44f94d`): no se proporciona URL en la información disponible.
- Modelo Qwen3-TTS base: no se proporciona URL en la información disponible.
- Documentación de NVIDIA Jetson AGX Thor / JetPack 7.2 y AGX Orin / JetPack 6.2.1: no se proporciona URL en la información disponible.
