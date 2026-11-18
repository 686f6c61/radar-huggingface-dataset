# LiquidAI/LFM3-Omni-2B-GGUF

## Resumen

LFM3-Omni-2B es un modelo omni-modal desarrollado por Liquid AI que comprende texto, imágenes, vídeo y audio, y responde tanto en texto como en voz. Esta ficha corresponde a su versión GGUF, publicada por el propio autor para inferencia local en CPU y GPU mediante llama.cpp y sus derivados (LM Studio, Ollama, Llama.app). El modelo base cuenta con aproximadamente 1.728 millones de parámetros (1,7 B) y está diseñado para ejecución on-device, lo que lo sitúa en la gama de modelos pequeños capaces de correr en hardware de consumo.

La relevancia de esta versión radica en que empaqueta capacidades any-to-any (entrada de audio, imagen, vídeo y texto; salida de texto y habla) en un único artefacto GGUF compatible con el ecosistema llama.cpp, incluyendo conversaciones de voz en tiempo real con tool calls a través de la API WebSocket `/v1/realtime`. Liquid AI lo presenta como un modelo no razonador (non-reasoning), pensado para respuestas directas con decodificación greedy en texto.

La licencia es LFM1.0 (lfm1.0, marcada como "other" en Hugging Face), y el modelo declara soporte para 23 idiomas, entre ellos el español. Con más de 500.000 descargas y 186 likes en el momento de la consulta, es una de las propuestas más visibles dentro de la categoría de modelos omni-modales pequeños y abiertos para despliegue local.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo omni-modal any-to-any; detalles en la model card del modelo base) |
| Parametros totales | 1.728.801.600 (≈1,7 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (el ejemplo de la model card usa Q4_K_M; no se enumeran todas las variantes) |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl, da, el, fi, he, nl, sv, tr (23 idiomas) |
| Licencia | lfm1.0 (license: other) |
| Formato de pesos | GGUF (repo de 16,1 GB; incluye proyectores de visión y audio) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de su naturaleza omni-modal: procesa texto, imágenes, vídeo y audio como entrada y genera texto y habla como salida. La model card de esta versión GGUF remite explícitamente a la model card de LiquidAI/LFM3-Omni-2B para los detalles de arquitectura y uso, por lo que no se dispone aquí de datos sobre tipo de transformer, capas, atención o mecanismos híbridos.

Tampoco se han publicado en la información proporcionada datos sobre volumen de tokens de entrenamiento, composición del dataset, ni si hubo fases de RLHF o DPO. Lo que sí se documenta es su condición de modelo no razonador (non-reasoning), el uso recomendado de decodificación greedy (temperatura 0) para salida de texto y, para salida de voz, temperatura de audio 0,4 con penalización de repetición de audio 1,2. La integración con llama.cpp desde la build b11960 (v0.8.0) incluye soporte de conversaciones de voz en tiempo real con tool calls sobre la API `/v1/realtime` de `llama serve`.

## Capacidades

- Comprensión de texto, imágenes, vídeo y audio en un único modelo (any-to-any).
- Generación de respuestas en texto y en voz (speech output).
- Reconocimiento automático del habla (ASR) mediante el system prompt `Perform ASR in <language>.`
- Conversaciones de voz en tiempo real con tool calls a través de la API WebSocket `/v1/realtime` de `llama serve`.
- Soporte multilingüe declarado en 23 idiomas, incluido el español.
- Ejecución local en CPU y GPU mediante llama.cpp, LM Studio, Ollama y Llama.app.
- Modelo no razonador: orientado a respuestas directas, sin cadena de pensamiento explícita (con `llama serve` debe usarse `--reasoning off`).
- No se documenta en la información disponible soporte específico de function calling en texto más allá de las tool calls en el flujo de voz en tiempo real.

## Casos de uso

- Transcripción de audio multilingüe: usando el system prompt de ASR en el idioma deseado, el modelo convierte ficheros de voz en texto; encaja en pipelines de subtitulado o actas de reuniones por su soporte de 23 idiomas y su ejecución local sin depender de la nube.
- Asistentes de voz en tiempo real: la API `/v1/realtime` de `llama serve` permite conversaciones habladas bidireccionales con tool calls, adecuada para interfaces manos libres en escritorio o dispositivos locales.
- Descripción y análisis de imágenes en local: con entrada de imagen vía LM Studio, Llama.app u Ollama, sirve para etiquetado, accesibilidad (texto alternativo) o revisión de capturas en flujos de trabajo internos.
- Análisis de vídeo para resúmenes: al aceptar vídeo como entrada, puede emplearse para generar descripciones o resúmenes de clips cortos en herramientas de documentación o archivo.
- Procesamiento de documentos escaneados y capturas: combinando visión y texto, útil para extraer información de facturas, formularios o pantallazos en aplicaciones de escritorio.
- Prototipado y demos on-device: al ser un GGUF de ~1,7 B parámetros ejecutable en CPU y GPU de consumo, es idóneo para pruebas de concepto de asistentes multimodales sin infraestructura de servidor dedicada.
- Atención al cliente con voz: integrado en un servicio local compatible con OpenAI, puede gestionar interacciones habladas con llamadas a herramientas (por ejemplo, consultar un pedido) en entornos con requisitos de privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; el repo GGUF ocupa 16,1 GB e incluye los proyectores de visión y audio, pero el peso de cada cuantización individual no se detalla. Con cuantizaciones de 4 bits, un modelo de ~1,7 B parámetros suele situarse en el rango de 1-2 GB, aunque esta cifra no está confirmada en la información proporcionada.
- GPU recomendadas: no disponible en la información. El modelo está pensado para inferencia local en CPU y GPU.
- GPU de consumo: el diseño on-device y el tamaño de ~1,7 B parámetros sugieren viabilidad en GPUs de consumo, pero no se especifican modelos concretos.
- Opciones de despliegue: llama.cpp (build b11960 / v0.8.0 o superior), LM Studio (motor llama.cpp 2.65.1 o superior), Ollama (v0.40.12 o superior), Llama.app (macOS y Windows), y `llama serve` con API compatible con OpenAI en `http://localhost:8080`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de benchmarks ni especificaciones de modelos alternativos que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Es un modelo no razonador: no genera cadenas de pensamiento explícitas y con `llama serve` requiere `--reasoning off`; puede rendir peor en tareas que exijan razonamiento multi-paso complejo.
- Riesgo de alucinación inherente a los modelos generativos; no se documentan evaluaciones de fidelidad en la información disponible.
- No se especifica la longitud de contexto, lo que impide planificar con precisión cargas de conversaciones largas o documentos extensos.
- El soporte de idiomas se declara para 23 lenguas, pero no se aportan métricas por idioma; el rendimiento real en español no está cuantificado.
- La licencia LFM1.0 (marcada como "other") puede imponer restricciones al uso comercial; es necesario revisar el fichero LICENSE del repositorio antes de desplegar en producción.
- Las capacidades multimodales dependen de la versión del runtime: se exigen versiones mínimas de llama.cpp, LM Studio u Ollama, y la entrada de vídeo o audio no está disponible en todos los clientes (por ejemplo, LM Studio solo imagen según la model card).
- No se detallan sesgos conocidos ni evaluaciones de seguridad en la información proporcionada.
- El tamaño del repo (16,1 GB) incluye múltiples cuantizaciones y proyectores; conviene descargar solo el fichero necesario.

## Enlaces

- Hugging Face (esta versión GGUF): https://huggingface.co/LiquidAI/LFM3-Omni-2B-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- Blog de Liquid AI sobre LFM3: https://www.liquid.ai/blog/lfm3
- Documentación: https://docs.liquid.ai/lfm/getting-started/welcome
- Consola/API: https://console.liquid.ai/dashboard
- Playground: https://playground.liquid.ai/
- Llama.app: https://llama.app
- LM Studio: https://lmstudio.ai
- Ollama: https://ollama.com
- llama.cpp (release v0.8.0): https://github.com/ggml-org/llama.cpp/releases/tag/v0.8.0
- llama.cpp (build b11960): https://github.com/ggml-org/llama.cpp/releases/tag/b11960
