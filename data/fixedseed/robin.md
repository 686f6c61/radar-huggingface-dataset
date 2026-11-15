# FixedSeed/Robin

## Resumen

Robin es un modelo de síntesis de voz (text-to-speech) de pesos abiertos desarrollado por Fixed Seed Research Laboratory, orientado a flujos de trabajo profesionales de doblaje y producción de audio. A diferencia de los sistemas de clonación zero-shot, Robin apuesta por el entrenamiento de adaptadores LoRA específicos por voz, de modo que cada voz queda encapsulada en un fichero reproducible y ajustable en intensidad. El modelo sintetiza audio a 48 kHz, el estándar de cine y vídeo, y soporta inglés y japonés, incluso mezclados en una misma línea.

Arquitectónicamente es un sistema en dos etapas: un planificador de 2,17 B de parámetros que convierte el texto en tokens de habla y un decodificador de 1,41 B basado en flow matching que transforma esa secuencia de tokens en forma de onda. En total suma 3,58 B de parámetros. El consumo pico de memoria en bf16 es contenido: 8,2 GB para sintetizar, 9,1 GB para cambiar una voz y 9,9 GB para entrenar una voz, lo que lo sitúa al alcance de GPUs de consumo de gama alta.

Su relevancia actual reside en que cubre un hueco poco atendido: TTS open weights con calidad de estudio, control por descripción textual de la voz, re-voiceado de tomas propias y un pipeline de entrenamiento de voces incluido en el propio repositorio, con integración para ComfyUI y una aplicación web local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos etapas: planificador de tokens de habla (2,17 B) + decodificador flow-matching (1,41 B) |
| Parametros totales | 3,58 B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; el autor reporta cifras en bf16) |
| Idiomas soportados | Ingles, japones y modo mixto (`--lang mix`) |
| Licencia | Fixed Seed Open License (license: other) |
| Formato de pesos | safetensors (`robin_v1.safetensors`, `robin_vae.safetensors`, LoRA en safetensors) y ONNX (`speech_tokenizer_v3_25hz.onnx`) |

## Arquitectura y entrenamiento

Robin se organiza en dos componentes encadenados. El primero, un planificador de 2,17 B de parámetros, recibe el texto (con etiquetas inline como `[laughs]`, `[sigh]`, `[crying]` o `[shouting]`) y la descripción de voz, y genera una secuencia de tokens de habla. El segundo, un decodificador de 1,41 B basado en flow matching, convierte esos tokens en audio a 48 kHz. Para tareas de texto largo, cambio de voz y entrenamiento se apoya en el tokenizador de habla de CosyVoice 3 (`speech_tokenizer_v3_25hz.onnx`, a 25 Hz).

El entrenamiento de nuevas voces se realiza mediante LoRA sobre grabaciones transcritas: cada voz se guarda como un único fichero cuya intensidad se ajusta en inferencia. El repositorio incluye scripts de preparación (`prep`) y entrenamiento (`train`) con guardado de checkpoint cada 200 pasos y generación de una muestra de audio en cada guardado para seleccionar el paso por escucha. No se han publicado en la información disponible detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Síntesis de voz a 48 kHz con control de la voz mediante descripción en lenguaje natural (por ejemplo, "a warm, low voice, close to the mic").
- Etiquetas inline para expresividad y sonidos no verbales: `[laughs]`, `[sigh]`, `[crying]`, `[shouting]`.
- Cambio de voz (re-voiceado) de grabaciones propias de hasta 45 segundos, preservando palabras, ritmo y entrega; requiere que el texto coincida exactamente con lo dicho en la grabación.
- Entrenamiento de voces dedicadas mediante LoRA a partir de carpetas de clips con transcripción y un fichero opcional `voice.txt` que describe la voz.
- Multilingüe limitado a inglés y japonés, con modo mixto que permite ambas lenguas en una misma línea.
- Integración con ComfyUI mediante nodos propios (Robin Loader, Robin LoRA, Robin Speak) y flujos de ejemplo.
- Interfaz gráfica local en navegador con comparación de dos tomas, cambio de voz por descripción y entrenamiento con progreso en vivo.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso; es un modelo exclusivamente de texto a voz.

## Casos de uso

- Doblaje y localización de vídeo: el modelo genera audio a 48 kHz, la frecuencia de trabajo estándar en cine y vídeo, lo que evita remuestreos posteriores y encaja en cadenas de postproducción existentes.
- Re-voiceado de tomas de actor: con `--convert` se puede repetir una grabación de hasta 45 segundos con otra voz manteniendo palabras, ritmo y entrega, útil para corregir una toma sin volver a grabar al intérprete.
- Creación de voces de personaje consistentes: entrenar una LoRA por personaje (recomendado al menos 15 minutos de habla, unas 200 clips de 3 a 15 segundos) garantiza que la voz sea idéntica entre episodios o sesiones, algo que la clonación zero-shot no asegura.
- Producción de audiolibros y narración: el control de entrega mediante etiquetas inline y el modo mixto inglés-japonés permiten narrar contenido bilingüe con una sola voz entrenada.
- Prototipado rápido en ComfyUI: los nodos permiten integrar la síntesis de voz en pipelines de generación audiovisual ya existentes, encadenando texto, imagen y audio en un mismo grafo.
- Previsualización de guiones para animación: la app local en navegador permite comparar dos tomas lado a lado y ajustar la descripción de voz antes de comprometer un entrenamiento completo.
- Investigación en TTS y adaptación de hablante: el pipeline `prep`/`train` con validaciones automáticas (clipping, dígitos, frecuencias de muestreo bajas, transcripciones dudosas) sirve como base reproducible para experimentos de adaptación LoRA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM pico en bf16 según el autor: 8,2 GB para sintetizar, 9,1 GB para cambio de voz y 9,9 GB para entrenar una voz.
- GPUs recomendadas: no se especifican modelos concretos; por las cifras de memoria, una RTX 4090 (24 GB) cubre con holgura los tres modos, y GPUs de 12-16 GB deberían bastar para inferencia y entrenamiento ligero.
- Cabe en GPU de consumo: sí, dado que el pico en bf16 se mantiene por debajo de 10 GB.
- Opciones de despliegue: paquete Python `robin` (CLI y app web), nodos de ComfyUI, y pesos en safetensors con tokenizador de habla en ONNX. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Robin (FixedSeed) | 3,58 B (2,17 B planificador + 1,41 B decodificador) | No disponible | en, ja, mixto | Fixed Seed Open License | 48 kHz, LoRA por voz, ComfyUI, re-voiceado |
| CosyVoice 3 | No disponible | No disponible | No disponible | No disponible | Robin reutiliza su tokenizador de habla a 25 Hz; no hay más datos en la información disponible |
| Alternativas de TTS open weights de tamaño similar | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificables en la información proporcionada |

## Limitaciones y advertencias

- Idiomas limitados: solo inglés y japonés; no hay soporte documentado de castellano ni de otras lenguas.
- El cambio de voz exige que el texto proporcionado coincida exactamente con lo dicho en la grabación y está acotado a 45 segundos por toma.
- El entrenamiento de voces requiere datos de calidad: al menos 15 minutos de habla, un único hablante, sala silenciosa, mismo micrófono y distancia, sin música ni efectos, picos en torno a −6 dBFS; clips por debajo de 16 kHz se descartan y frecuencias de muestreo bajas producen un agudo más apagado.
- Riesgo de alucinación y de desviaciones en la pronunciación no cuantificado: no se han publicado evaluaciones objetivas ni benchmarks.
- Sesgos de hablante y acento no documentados; al entrenarse sobre grabaciones propias, la LoRA hereda las características y posibles sesgos de esos datos.
- Licencia "Fixed Seed Open License" (license: other): es necesario revisar el fichero LICENSE del repositorio antes de cualquier uso comercial, ya que no se detallan aquí sus términos.
- El modelo está pensado para síntesis de voz; no cubre tool calling, agentes ni razonamiento, por lo que no debe emplearse fuera de ese ámbito.
- El repositorio ocupa 8,8 GB y la primera ejecución en ComfyUI descarga los pesos automáticamente, lo que conviene tener en cuenta en entornos con ancho de banda limitado.

## Enlaces

- Hugging Face: https://huggingface.co/FixedSeed/Robin
- GitHub: https://github.com/Fixed-Seed/Robin
- Página del proyecto: https://audiorobin.io
- Licencia: https://huggingface.co/FixedSeed/Robin/blob/main/LICENSE
