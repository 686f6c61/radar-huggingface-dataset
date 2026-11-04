# Prahaladha/hima-tts-nano-hi-mlx-8bit

## Resumen

hima-tts-nano-hi-mlx-8bit es la conversión a MLX con pesos de 8 bits del modelo de síntesis de voz en hindi hima-tts-nano-hi, desarrollado por el usuario Prahaladha. Se trata de un modelo TTS de arquitectura no especificada en la información disponible, con 20.998.017 parámetros reales en safetensors (la model card cita 62M para el modelo base) y orientado a la generación de audio a 24 kHz en Macs con Apple Silicon. Su relevancia radica en que elimina la dependencia de PyTorch en inferencia y reduce el tamaño de descarga a 0,2 GB, manteniendo las mismas voces y calidad sonora que el modelo original.

El modelo está pensado para desarrolladores que necesitan síntesis de voz en hindi (con soporte declarado también de inglés) dentro de aplicaciones locales en macOS, sin infraestructura GPU dedicada. Incluye seis voces integradas (Meera, Sneha, Nandini, Siddharth, Ishaan y Nikhil) y permite clonar voces propias a partir de una grabación, aunque ese proceso de clonación requiere el repositorio principal en PyTorch.

La ficha se basa exclusivamente en la model card y los metadatos de HuggingFace; no hay información publicada sobre arquitectura interna, composición del dataset de entrenamiento ni resultados de benchmarks estándar, por lo que esos apartados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS; la model card no detalla la arquitectura interna) |
| Parametros totales | 20.998.017 (safetensors); la model card del modelo base cita 62M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (esta versión); float16 disponible en repo separado |
| Idiomas soportados | hindi (hi), inglés (en) |
| Licencia | other |
| Formato de pesos | safetensors (MLX); incluye codec.safetensors y voices/model.safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo (tipo de transformer, mecanismo de atención, diseño del decodificador de audio o del codec). La model card únicamente describe los artefactos que componen el repositorio: `model.safetensors` con los pesos en 8 bits, `voices/model.safetensors` con el modelo ajustado para las seis voces integradas, `codec.safetensors` que convierte la salida del modelo en audio, y un directorio `text/` que normaliza números, fechas y cantidades a palabras antes de la síntesis.

Tampoco se detallan el volumen de datos de entrenamiento, la composición del corpus, ni si hubo etapas de RLHF o DPO. La model card indica que la conversión a MLX preserva "las mismas voces, el mismo sonido" que el modelo original, y que la clonación de voz se realiza con el repositorio principal en PyTorch mediante el comando `python -m hima_tts --save-voice me.safetensors --from me.wav`. La innovación técnica destacable es la implementación nativa en MLX con pesos de 8 bits, que permite inferencia sin PyTorch en la GPU de un Mac con Apple Silicon.

## Capacidades

- Síntesis de voz (text-to-speech) en hindi, con soporte declarado de inglés.
- Salida de audio float32 a 24 kHz.
- Seis voces integradas: Meera, Sneha y Nandini (femeninas), Siddharth, Ishaan y Nikhil (masculinas).
- Generación de una voz aleatoria si no se especifica ninguna.
- Reproducibilidad mediante semilla (`seed=`) para obtener la misma toma en cada ejecución.
- Procesamiento por lotes con `say_many`, que sintetiza varios textos a la vez con mayor throughput agregado.
- Clonación de voz a partir de una grabación (requiere el repo principal en PyTorch para extraer el fichero de voz).
- Guardado de voces aleatorias que gusten para reutilizarlas posteriormente.
- Normalización de texto para números, fechas y cantidades.
- No se menciona soporte de tool calling, agentes, visión ni audio de entrada.

## Casos de uso

- Lectura de contenido en hindi en aplicaciones macOS: integración local con MLX para convertir artículos o noticias a audio sin enviar texto a servicios en la nube, aprovechando que el modelo cabe en 0,2 GB y no requiere PyTorch.
- Audiolibros y narración por lotes: uso de `say_many` para sintetizar capítulos completos de golpe, con un throughput de hasta 50x tiempo real en un M4 Pro según la model card.
- Asistentes de voz para personas con discapacidad visual: generación de respuestas habladas en hindi dentro de aplicaciones de accesibilidad en Mac, con voces masculinas y femeninas seleccionables.
- Prototipado de interfaces conversacionales: creación rápida de demos de chatbots de voz en hindi con voces consistentes y reproducibles mediante `seed=`, sin depender de APIs externas.
- Localización de contenidos para el mercado hindi: doblaje de material formativo o corporativo, incluyendo la normalización automática de cifras y fechas del directorio `text/`.
- Personalización de marca con voz propia: clonación de una voz corporativa a partir de una grabación y uso posterior del fichero `.safetensors` en el pipeline MLX para mantener una identidad sonora consistente.
- Pruebas A/B de voces en producto: generación de la misma frase con las seis voces integradas o con voces aleatorias guardadas para evaluar preferencias de usuarios antes de fijar una voz definitiva.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros), pero sí ofrece dos métricas propias de calidad y velocidad:

| Metrica | Valor |
|---|---|
| Velocidad en Apple M4 Pro (8 bits, `say_many`, 48 textos) | 50x tiempo real |
| Velocidad en Apple M4 Pro (float16, `say_many`, 48 textos) | 70x tiempo real |
| Tasa de error de lectura de letras (12 frases de prueba, 8 bits) | 1,4 % |
| Tasa de error de lectura de letras (referencia float32 ONNX) | 1,2 % |

No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- Hardware objetivo: Mac con Apple Silicon (GPU vía MLX); la model card cita un Apple M4 Pro como referencia de rendimiento.
- VRAM/unified memory estimada: no disponible de forma explícita; el repositorio ocupa 0,2 GB, por lo que la huella de memoria es reducida y compatible con equipos de gama de entrada con Apple Silicon.
- GPU recomendadas: no aplica el ecosistema CUDA (A100, H100, RTX 4090); el modelo está empaquetado para MLX y no se indica compatibilidad con GPU NVIDIA.
- Cabe en GPU de consumo: sí, en Macs con Apple Silicon; no se documenta soporte para GPUs de consumo NVIDIA o AMD.
- Opciones de despliegue: MLX mediante el paquete `hima_mlx` incluido en el repositorio; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 50x tiempo real con 8 bits y 70x con float16 en un M4 Pro usando `say_many` con 48 textos; no se publican cifras de latencia por frase individual.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato / runtime |
|---|---|---|---|---|---|
| hima-tts-nano-hi-mlx-8bit | 20.998.017 (safetensors); 62M según model card del base | no disponible | hi, en | other | safetensors / MLX |
| hima-tts-nano-hi-mlx-fp16 | no disponible | no disponible | hi, en | other | safetensors / MLX |
| hima-tts-nano-hi (base) | 62M según model card | no disponible | hi, en | other | PyTorch |

La información disponible no permite comparar con modelos TTS de otros autores (por ejemplo, familias comerciales o de código abierto con soporte de hindi) porque no se aportan datos de rendimiento ni especificaciones de esos sistemas en la documentación consultada.

## Limitaciones y advertencias

- La licencia es "other": no se detallan los términos exactos, por lo que es imprescindible revisar las condiciones del modelo base antes de un uso comercial.
- El modelo está empaquetado para MLX y Apple Silicon; no se documenta funcionamiento en CUDA ni en CPU genérica.
- El soporte de inglés aparece en los metadatos, pero la model card se centra en hindi y no detalla la calidad en inglés.
- La clonación de voz requiere el repositorio principal en PyTorch, lo que rompe la promesa de "sin PyTorch" para ese flujo concreto.
- Riesgo de alucinación y errores de pronunciación: la model card reporta un 1,4 % de letras leídas incorrectamente en 12 frases de prueba, superior al 1,2 % de la referencia float32 ONNX.
- No hay información publicada sobre sesgos de género, acento o dialecto dentro del hindi, ni sobre el tratamiento de nombres propios.
- No se especifican límites de longitud de texto por llamada; el rendimiento agregado se mide con lotes de 48 textos, pero no se indica el tamaño máximo por fragmento.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria documentada.
- No se han publicado resultados de benchmarks estándar ni evaluaciones independientes de calidad de audio (MOS u otras).

## Enlaces

- HuggingFace (este modelo): https://huggingface.co/Prahaladha/hima-tts-nano-hi-mlx-8bit
- Modelo base: https://huggingface.co/Prahaladha/hima-tts-nano-hi
- Versión float16 en MLX: https://huggingface.co/Prahaladha/hima-tts-nano-hi-mlx-fp16
