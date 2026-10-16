# enconvo/avatar-lipsync-1-foton-coreml

## Resumen

Avatar Lip Sync 1 (foton add-on) es una conversión a Core ML del modelo Audio2Lipsync de fotonLabs, publicada por enconvo para su aplicación Enconvo for Mac. No es un modelo de lenguaje: se trata de un sistema audio-a-cara que toma una ventana de audio de voz y devuelve pesos de blendshapes ARKit para animar los labios de un avatar 3D. Combina un codificador HuBERT Large con un decodificador transformer, empaquetado como un fichero `Foton.mlmodelc` de 235 MB.

El modelo acepta una entrada de audio de 3 segundos (48.000 muestras, 16 kHz, mono, en float16) y produce una salida `[1, 180, 52]` en float16: 180 fotogramas a 60 fps con los 52 pesos de blendshapes en el orden estándar de ARKit. En Enconvo for Mac puede ejecutarse junto a Avatar Lip Sync 1 (`enconvo/avatar-lipsync-1-coreml`) y promediar las salidas de ambos, lo que segun la model card sigue los labios reales con más fidelidad que LAM por sí solo.

Su relevancia práctica es la ejecución local de animación facial sincronizada con audio sobre Apple silicon, sin GPU dedicada ni servicios en la nube: un fotograma de 3 segundos se procesa en unos 60 ms en un M1 Max con las unidades de cómputo de CPU y GPU de Core ML. La licencia MIT facilita su integración en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador HuBERT Large y decodificador transformer, exportados a Core ML |
| Parametros totales | no disponible (el codificador se basa en HuBERT Large segun la model card) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; procesa ventanas de audio de 3 s (48.000 muestras a 16 kHz) |
| Tipos de cuantizacion | Pesos paletizados con k-means de 6 bits; computo en float16 |
| Idiomas soportados | no disponible (modelo audio-a-blendshapes; no depende del idioma del texto) |
| Licencia | MIT |
| Formato de pesos | `.mlmodelc` (Core ML compilado, fichero `Foton.mlmodelc`) |

## Arquitectura y entrenamiento

El modelo es una exportación a Core ML del Audio2Lipsync de fotonLabs. La arquitectura consta de un codificador HuBERT Large (originalmente de fairseq) que extrae representaciones del audio y un decodificador transformer que genera los pesos de blendshapes. La entrada es un tensor `audio_waveform` de tipo Float16 con forma `[1, 48000]` (3 segundos de voz mono a 16 kHz) y la salida es un tensor `blend` de tipo Float16 con forma `[1, 180, 52]`, es decir 180 fotogramas a 60 fps con los 52 pesos de blendshapes en el orden estándar de ARKit.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de ajuste como RLHF o DPO; la model card no detalla el proceso de entrenamiento del modelo original. La innovación destacable en esta publicación es la conversión a Core ML con pesos paletizados mediante k-means de 6 bits y computo en float16, lo que reduce el tamaño del artefacto a 235 MB y permite inferencia en CPU y GPU de Apple silicon.

## Capacidades

- Generación de animación labial sincronizada con audio: convierte una ventana de 3 segundos de voz en pesos de blendshapes ARKit a 60 fps.
- Salida compatible con ARKit: 52 pesos de blendshapes en el orden estándar, integrables directamente en motores de avatares 3D.
- Procesamiento local en Apple silicon mediante Core ML, sin dependencia de servicios en la nube.
- Ejecución combinada con Avatar Lip Sync 1 (`enconvo/avatar-lipsync-1-coreml`) promediando las salidas de ambos modelos para mejorar el seguimiento de los labios.
- No genera texto, no soporta tool calling ni function calling, y no implementa razonamiento multi-paso ni modo de pensamiento.
- No se documentan capacidades de visión, audio de entrada más allá del audio de voz, ni soporte multilingüe explícito.

## Casos de uso

- Animación de avatares en tiempo real: el modelo procesa ventanas de 3 segundos en unos 60 ms en un M1 Max, lo que permite alimentar un avatar con latencia baja durante interacciones en vivo.
- Doblaje automático de vídeo: se puede generar la animación facial de un personaje a partir de la pista de voz doblada, manteniendo una sincronización de 60 fps con el audio.
- Avatares para VTubers y creadores de contenido: integración en aplicaciones de Mac que ya usan Core ML para capturar voz y animar un personaje sin hardware dedicado.
- Prototipado de personajes en videojuegos: obtención rápida de pesos de blendshapes ARKit para previsualizar expresiones labiales antes de producir animaciones manuales.
- Accesibilidad: acompañar sistemas de texto a voz con un avatar animado que mueva los labios de forma coherente con el audio sintetizado.
- Producción de contenido educativo o corporativo: generación offline de animación labial para vídeos narrados, aprovechando la licencia MIT para uso comercial.
- Pipelines de posproducción en macOS: encadenar la generación de blendshapes con herramientas de render dentro del ecosistema Apple silicon.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente indica una referencia de latencia: una ventana de 3 segundos tarda aproximadamente 60 ms en un M1 Max con las unidades de cómputo de CPU y GPU.

## Requisitos de hardware

- Sistema operativo: macOS 14 o posterior, exclusivamente sobre Apple silicon.
- Unidades de cómputo de Core ML: CPU y GPU (según la model card).
- Latencia de referencia: unos 60 ms por ventana de 3 segundos en un M1 Max (factor de tiempo real cercano a 50x).
- Tamaño del artefacto: 235 MB (`Foton.mlmodelc`), con pesos paletizados a 6 bits y computo en float16, por lo que el consumo de memoria es reducido.
- No es compatible con GPU NVIDIA ni con CUDA; no está pensado para despliegue en vLLM, llama.cpp, Ollama ni TGI, dado que no es un modelo de lenguaje.
- Despliegue mediante la librería Core ML y la aplicación Enconvo for Mac.

## Comparativa con modelos similares

| Modelo | Formato | Entrada / salida | Licencia | Disponibilidad |
|---|---|---|---|---|
| enconvo/avatar-lipsync-1-foton-coreml | Core ML (`.mlmodelc`) | Audio 16 kHz mono de 3 s / `[1, 180, 52]` blendshapes ARKit | MIT | HuggingFace |
| fotonlabs/unreal-audio2lipsync (modelo base) | no disponible | Audio a blendshapes (HuBERT Large + transformer) | MIT | HuggingFace |
| enconvo/avatar-lipsync-1-coreml | Core ML | no disponible | no disponible | HuggingFace |

No se dispone de datos de rendimiento comparativos entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Ámbito restringido: el modelo solo genera animación labial (blendshapes ARKit); no produce animación facial completa ni genera texto.
- Dependencia de plataforma: requiere macOS 14 o posterior y Apple silicon, por lo que no puede ejecutarse en GPU NVIDIA ni en servidores Linux convencionales.
- Cuantización: los pesos están paletizados con k-means de 6 bits, lo que puede introducir pérdida de precisión frente al modelo original de fotonLabs.
- Ventana fija de 3 segundos: la entrada está limitada a 48.000 muestras a 16 kHz, lo que condiciona el procesamiento de audio más largo a un troceado previo.
- Falta de datos de evaluación: no hay benchmarks publicados ni métricas objetivas de calidad de sincronización.
- Adopción incipiente: el repositorio registra 0 descargas y 0 likes, y no se documentan idiomas ni composición del dataset de entrenamiento, por lo que se desconocen sesgos potenciales en voces o acentos no representados.
- Licencia MIT: permite uso comercial, pero exige distribuir los ficheros `LICENSE` y `NOTICE` junto con el modelo, según la model card.
- El modelo original y el codificador HuBERT de fairseq también se distribuyen bajo MIT, condición que debe respetarse en cualquier redistribución.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/enconvo/avatar-lipsync-1-foton-coreml
- Modelo base: https://huggingface.co/fotonlabs/unreal-audio2lipsync
- Modelo complementario: https://huggingface.co/enconvo/avatar-lipsync-1-coreml
