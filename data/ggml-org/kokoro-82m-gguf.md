# ggml-org/Kokoro-82M-GGUF

## Resumen

Kokoro-82M-GGUF es la conversión al formato GGUF del modelo de síntesis de voz Kokoro-82M, desarrollado originalmente por hexgrad y empaquetado por ggml-org para su uso con el ecosistema llama.cpp. Se trata de un modelo de text-to-speech (TTS) de pequeño tamaño (5,8 millones de parámetros reales en los pesos safetensors, pese al "82M" del nombre comercial) que prioriza la eficiencia y la facilidad de despliegue en hardware modesto frente a la calidad de los modelos TTS de gran escala.

El modelo resuelve el problema de generar audio de voz natural a partir de texto con un coste computacional mínimo, lo que lo hace adecuado para aplicaciones en tiempo real, entornos con recursos limitados y despliegues locales. Su integración en llama.cpp mediante el binario `llama-tts` y el endpoint `/tts` del servidor permite incorporar síntesis de voz en pipelines existentes sin dependencias de servicios en la nube.

Es relevante ahora porque democratiza el TTS de calidad aceptable en CPU y GPUs de consumo, con licencia Apache 2.0 y un conjunto de voces predefinidas para varios idiomas. La limitación principal es que la entrada de texto solo admite inglés; para otros idiomas es necesario proporcionar fonemas precalculados (por ejemplo, con espeak-ng).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS; la model card no detalla la arquitectura interna) |
| Parametros totales | 5.815.552 (según safetensors del repo base); el nombre comercial indica 82M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (cuantizaciones estándar del ecosistema llama.cpp; el repo ocupa 0,3 GB) |
| Idiomas soportados | Voces para inglés americano (a), inglés británico (b), español (e), francés (f), hindi (h), italiano (i), portugués brasileño (p), japonés (j) y mandarín (z). La entrada de texto solo admite inglés; para el resto hay que aportar fonemas |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (base original en safetensors) |

## Arquitectura y entrenamiento

La model card proporcionada no detalla la arquitectura interna del modelo (tipo de red, mecanismo de atención, vocoder, etc.), por lo que este dato no está disponible. El modelo base es hexgrad/Kokoro-82M y la versión publicada por ggml-org es una conversión automática realizada con la herramienta https://github.com/ggml-org/convert al formato GGUF para su uso con llama.cpp.

Tampoco se especifican en la información disponible los datos de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO u otras técnicas de alineación). La innovación técnica destacable, desde el punto de vista del despliegue, es la integración nativa en llama.cpp mediante `llama-tts` y el endpoint `/tts`, que permite ejecutar TTS localmente con el mismo runtime que se usa para LLMs.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto en inglés.
- Selección de voz mediante el parámetro `--tts-voice`, con voces identificadas por la primera letra del código de idioma (a, b, e, f, h, i, p, j, z).
- Generación de audio en formato WAV mediante el binario `llama-tts` (`--output out.wav`).
- Servicio HTTP con endpoint `/tts` a través de `llama serve`.
- Soporte de múltiples idiomas de voz (inglés americano y británico, español, francés, hindi, italiano, portugués brasileño, japonés y mandarín), aunque la entrada de texto debe ser inglesa o fonemas precalculados.
- Entrada de fonemas para idiomas distintos del inglés (por ejemplo, generados con espeak-ng).
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada.

## Casos de uso

- Lectura de artículos y documentos en voz alta: el modelo convierte texto en inglés en audio WAV de forma local, sin depender de APIs externas, adecuado para aplicaciones de accesibilidad.
- Asistentes de voz locales: integración del endpoint `/tts` de `llama serve` en un asistente conversacional que ya use llama.cpp para el LLM, manteniendo todo el stack en la misma máquina.
- Generación de audiolibros y pódcasts automatizados: la selección de voces (`af_heart`, etc.) permite asignar timbres distintos a narradores o personajes.
- Pruebas de integración continua de pipelines de audio: al ser un modelo pequeño (repo de 0,3 GB), se puede incluir en tests automatizados de generación de voz sin coste de infraestructura elevado.
- Prototipado de interfaces de voz en dispositivos de borde: el tamaño reducido y el formato GGUF permiten ejecutarlo en CPUs y GPUs de consumo, útil para demos y validación de producto.
- Localización de contenido multilingüe con fonemas: para español, francés, italiano, etc., se pueden generar fonemas con espeak-ng y pasarlos al modelo para producir audio en esos idiomas, útil en pipelines de doblaje automatizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repo GGUF ocupa 0,3 GB, por lo que la huella de memoria es muy reducida y cabe holgadamente en cualquier GPU de consumo.
- GPU recomendadas: no especificadas en la información disponible; por tamaño, cualquier GPU con al menos ~1 GB de memoria libre debería ser suficiente.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier modelo actual (RTX 3060, RTX 4090, etc.) e incluso en CPU.
- Opciones de despliegue: llama.cpp mediante `llama-tts` (CLI) y `llama serve` (servidor con endpoint `/tts`). No se documentan otras opciones (vLLM, TGI, Ollama) en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de rendimiento ni de especificaciones de modelos comparables que permitan una comparación rigurosa. Se indica "no disponible".

## Limitaciones y advertencias

- La entrada de texto solo admite inglés; para otros idiomas es obligatorio proporcionar fonemas precalculados (por ejemplo, con espeak-ng), lo que añade un paso previo en el pipeline.
- No se documentan sesgos conocidos ni tasas de alucinación en la información disponible; al ser un modelo TTS, el riesgo principal es una pronunciación incorrecta o una prosodia poco natural, no la invención de contenido factual.
- La arquitectura, los datos de entrenamiento y los benchmarks no están documentados en la información proporcionada, lo que dificulta evaluar su calidad frente a alternativas.
- Es una conversión automática (herramienta ggml-org/convert) del modelo original; pueden existir diferencias de comportamiento respecto al modelo base en safetensors.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base hexgrad/Kokoro-82M y de las voces incluidas.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es una publicación reciente y poco validada por la comunidad.

## Enlaces

- Hugging Face (este repo): https://huggingface.co/ggml-org/Kokoro-82M-GGUF
- Modelo base: https://huggingface.co/hexgrad/Kokoro-82M
- Documentación TTS de llama.cpp: https://github.com/ggml-org/llama.cpp/blob/master/docs/multimodal/tts.md#kokoro
- Herramienta de conversión: https://github.com/ggml-org/convert
