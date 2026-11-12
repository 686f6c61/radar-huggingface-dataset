# appautomaton/qwen3-asr-1.7b-fp16-ane

## Resumen

Qwen3-ASR-1.7B (fp16, Apple Neural Engine) es una conversión del modelo de reconocimiento automático del habla Qwen3-ASR-1.7B de Alibaba Qwen, publicada por App Automaton. El objetivo no es reentrenar ni afinar el modelo, sino reempaquetar los pesos oficiales en formato Core AI para que la inferencia se ejecute íntegramente en el Neural Engine (ANE) de los chips Apple Silicon, sin Python, sin PyTorch y sin llamadas a APIs en la nube.

La conversión parte de los pesos bf16 oficiales: se traza el grafo MLX del modelo (a través del proyecto `mlx-speech`) y se reconstruye con Core AI, con pesos y activaciones en fp16. Según el autor, los rangos de activación se midieron antes de la conversión y se mantienen dentro del rango fp16, y las transcripciones coinciden palabra por palabra con la build MLX bf16 en sus clips de prueba salvo empates muy ajustados.

Es relevante porque permite transcripción local en macOS con el GPU libre para otras tareas, algo útil en aplicaciones de escritorio que necesitan ASR de forma continua sin consumir la GPU ni enviar audio a terceros. El modelo cubre inglés y chino, acepta audio mono a 16 kHz de hasta aproximadamente un minuto por llamada y requiere macOS 27 o superior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder de audio + decoder de texto transformer (Qwen3-ASR), convertido a Core AI |
| Parametros totales | 1,7 mil millones (según el nombre del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (límite práctico de audio: ~1 minuto por llamada) |
| Tipos de cuantizacion | fp16 (pesos y activaciones); existe build MLX bf16 separada |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache 2.0 (runtime `ane-speech` bajo MIT) |
| Formato de pesos | Core AI (no incluye checkpoint PyTorch ni safetensors) |

## Arquitectura y entrenamiento

El modelo es una conversión de inferencia, no un entrenamiento nuevo. La arquitectura subyacente es la de Qwen3-ASR-1.7B: un encoder de audio seguido de un decoder de texto autorregresivo. En este repositorio, el encoder de audio es idéntico al usado en Confucius4-R2T2 y el decoder se distribuye en cuatro segmentos más una cabeza de salida; el directorio `runtime/` contiene la tabla de embeddings, el tokenizer y las constantes del front-end de audio.

La conversión se realizó trazando el grafo MLX del modelo y reconstruyéndolo con Core AI, sin intervención de PyTorch. Todas las capas se colocan en el Neural Engine y la precisión es fp16 tanto en pesos como en activaciones. No se dispone de información sobre el dataset de entrenamiento original, el número de tokens, ni si hubo RLHF o DPO en el modelo upstream dentro de la información proporcionada.

## Capacidades

- Transcripción de voz a texto (ASR) en inglés y chino.
- Detección e informe del idioma en el resultado (`result.language`).
- Aceptación de audio mono a 16 kHz, tanto desde fichero como desde muestras float32 en memoria.
- Soporte de contexto léxico opcional (`--context`) para sesgar el reconocimiento hacia nombres y términos esperados.
- Ejecución íntegra en el Neural Engine de Apple Silicon, liberando la GPU para otras cargas.
- Procesamiento de una grabación cada vez; no es un modelo de transcripción en streaming (para streaming el autor remite a Confucius4-R2T2).
- No se documentan capacidades de tool calling, agentes, visión ni audio más allá de la transcripción.

## Casos de uso

- Transcripción de notas de voz en aplicaciones de escritorio macOS: el modelo procesa grabaciones de hasta un minuto por llamada en el ANE, de modo que la app puede seguir usando la GPU para renderizado o edición mientras transcribe.
- Dictado local con privacidad: al no requerir API en la nube ni Python en tiempo de inferencia, el audio no sale del equipo, lo que encaja en entornos con requisitos de confidencialidad.
- Subtitulado de clips cortos en inglés o chino: grabaciones de hasta ~60 segundos se transcriben con detección de idioma automática, útil para material breve de redes o reuniones.
- Preprocesado de audio en pipelines de investigación: la API de Python (`ane_speech.load` y `asr.generate`) permite integrar la transcripción en scripts de análisis sin depender de PyTorch.
- Sesgado léxico en dominios concretos: el parámetro `--context` permite indicar nombres propios, siglas o terminología técnica para mejorar la transcripción en dominios especializados.
- Herramientas CLI para desarrolladores: `ane-speech transcribe` y `ane-speech pull` facilitan la descarga anticipada y la transcripción por línea de comandos en flujos de trabajo de macOS.
- Transcripción de reuniones divididas en segmentos: al limitarse a ~1 minuto por llamada, se pueden trocear grabaciones largas y procesar cada fragmento secuencialmente en el ANE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente afirma paridad de transcripción palabra por palabra con la build MLX bf16 en sus propios clips de prueba, sin cifras de WER, latencia ni throughput.

## Requisitos de hardware

- Mac con Apple Silicon (Neural Engine) y macOS 27 o superior.
- La inferencia se ejecuta íntegramente en el ANE; no se especifica VRAM ni memoria unificada mínima en la información disponible.
- Tamaño del repositorio: 4,7 GB (pesos fp16 en formato Core AI).
- Despliegue mediante el runtime `ane-speech`: instalación con `uv tool install ane-speech` o `pip install ane-speech`, y uso desde CLI o Python.
- La primera carga compila el modelo para el ANE del Mac y cachea el resultado; las cargas posteriores tardan una fracción de segundo.
- No compatible con GPU NVIDIA, vLLM, llama.cpp, Ollama ni TGI, ya que el formato es específico de Core AI y Apple Silicon.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | Idiomas | Licencia | Ejecución |
|---|---|---|---|---|---|
| appautomaton/qwen3-asr-1.7b-fp16-ane | 1,7 B | ~1 min por llamada | en, zh | Apache 2.0 | Apple Neural Engine (Core AI) |
| Qwen/Qwen3-ASR-1.7B (upstream) | 1,7 B | no disponible | en, zh | Apache 2.0 | PyTorch / GPU convencional |
| appautomaton/qwen3-asr-1.7b-bf16-mlx | 1,7 B | ~1 min por llamada | en, zh | Apache 2.0 | MLX (GPU Apple Silicon) |
| appautomaton/confucius4-r2t2-fp16-ane | no disponible | streaming | no disponible | no disponible | Apple Neural Engine (Core AI) |

## Limitaciones y advertencias

- Solo cubre inglés y chino; no se documentan otros idiomas.
- Límite de aproximadamente un minuto de audio por llamada; las grabaciones más largas deben dividirse.
- Procesa una grabación cada vez y no ofrece transcripción en streaming.
- Solo funciona en Mac con Apple Silicon y macOS 27 o superior; no es portable a otras plataformas.
- El repositorio no incluye checkpoint PyTorch ni safetensors, solo modelos Core AI, lo que limita su reutilización fuera del runtime `ane-speech`.
- Al ser una conversión fp16, pueden aparecer diferencias puntuales frente a la build bf16 en casos de empate muy ajustado, según el propio autor.
- No se dispone de datos sobre sesgos, tasas de alucinación ni evaluación de robustez acústica en la información proporcionada.
- Licencia Apache 2.0 heredada del modelo upstream, apta para uso comercial; el runtime `ane-speech` se distribuye aparte bajo MIT.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia comunitaria de uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/appautomaton/qwen3-asr-1.7b-fp16-ane
- Modelo upstream: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Código upstream: https://github.com/QwenLM/Qwen3-ASR
- Runtime: https://github.com/appautomaton/ane-speech
- Paquete PyPI: https://pypi.org/project/ane-speech/
- Build MLX bf16: https://huggingface.co/appautomaton/qwen3-asr-1.7b-bf16-mlx
- Modelo streaming: https://huggingface.co/appautomaton/confucius4-r2t2-fp16-ane
- Proyecto mlx-speech: https://github.com/appautomaton/mlx-speech
- Web del autor: https://appautomaton.com
- GitHub del autor: https://github.com/appautomaton
- Hugging Face del autor: https://huggingface.co/appautomaton
