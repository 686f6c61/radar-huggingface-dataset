# ecker/vall-e

## Resumen

VALL-E es una implementación de código abierto del modelo de síntesis de voz zero-shot presentado por Microsoft en el paper "Neural Codec Language Models are Zero-Shot Text to Speech Synthesizers" (2023). El repositorio `ecker/vall-e` recoge los pesos entrenados por un desarrollador independiente (ecker) para su propia implementación en GitHub, con el objetivo de depurar y mejorar el modelo original. No se trata de un lanzamiento oficial de Microsoft, sino de un esfuerzo comunitario que experimenta con distintas arquitecturas y configuraciones de entrenamiento.

El modelo aborda la síntesis de voz (TTS) zero-shot: a partir de un prompt de audio de referencia y un texto, genera habla en la voz del hablante de referencia sin necesidad de un entrenamiento específico para esa voz. La arquitectura combina un modelo autorregresivo (AR) y uno no autorregresivo (NAR) sobre representaciones discretas de audio (RVQ, residual vector quantization), siguiendo el diseño original de VALL-E.

La relevancia actual del repositorio reside en su carácter experimental y en la disponibilidad de pesos en formato GGUF para `vall_e.cpp`, lo que permite inferencia en CPU y GPUs de consumo. La configuración por defecto (`ar+nar-llama-8`) utiliza una arquitectura transformer basada en Llama con RoPE, GQA y atención eficiente en memoria, y ha recibido entrenamiento adicional en varios idiomas (japonés, francés, alemán) y una tarea extra de reconocimiento de fonemas (speech-to-text).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo (AR) + no autorregresivo (NAR) sobre tokens RVQ; configuraciones RetNet y Llama |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de duración de audio variable; el autor menciona entrenamiento con ventanas escalonadas y prompts de ~3 s o más) |
| Tipos de cuantizacion | GGUF (rama `gguf` para `vall_e.cpp`); pesos en bfloat16 en el repositorio principal |
| Idiomas soportados | inglés (base); entrenamiento adicional en japonés, francés y alemán según la model card |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors / pesos PyTorch (rama principal); GGUF (rama `gguf`); versión HF-ified (rama `HF`) |

## Arquitectura y entrenamiento

El modelo sigue el diseño de VALL-E: un modelo AR que predice el primer nivel de tokens RVQ a partir de fonemas y un prompt acústico, y un modelo NAR que predice los niveles RVQ restantes. La configuración por defecto (`ar+nar-llama-8`) emplea un transformer tipo Llama con RoPE, GQA y atención eficiente en memoria (entrenado con `xformers`). Los embeddings de prompt y respuesta se suman, y se incluye el nivel RVQ actual como token para guiar las tareas NAR. El tokenizador es el de Hugging Face, con los índices restantes de 256 reservados para fonemas fusionados.

El entrenamiento se realizó en `bfloat16` con el optimizador Prodigy, inicialmente en una RTX 4070 Ti y una RX 7900XTX, y posteriormente en 4×V100. La configuración RetNet anterior recibió más tiempo de entrenamiento pero presenta regresiones que la hacen inoperativa actualmente. La configuración Llama recibió post-entrenamiento con ventanas de duración escalonadas, muestreo de prompts no ingenuo ( utterances similares), idiomas adicionales y la tarea de speech-to-text a fonemas. El autor reporta una pérdida media en torno a 1.9–2.1 para la configuración RetNet, sin datos equivalentes para la Llama. No se especifica el número de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Síntesis de voz zero-shot: genera habla en la voz de un hablante de referencia a partir de un prompt de audio y texto.
- Síntesis de voz multi-idioma: inglés base, con soporte adicional para japonés, francés y alemán tras el post-entrenamiento.
- Reconocimiento de fonemas (speech-to-text): tarea añadida en la configuración Llama.
- Generación de utterances de duración variable: el post-entrenamiento con ventanas escalonadas y el ajuste de position IDs por segmento mejoran la generalización a distintas duraciones.
- Inferencia en CPU/GPU de consumo mediante `vall_e.cpp` y pesos GGUF.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso (no aplica a un modelo TTS).

## Casos de uso

- Clonación de voz zero-shot para doblaje y localización: con un prompt de audio de pocos segundos del hablante original, el modelo genera el texto traducido en su timbre, útil para prototipos de doblaje sin entrenamiento por hablante.
- Audiolibros y narración personalizada: generar capítulos completos en una voz concreta a partir de un prompt de referencia, aprovechando la mejora en utterances largas de la configuración Llama.
- Asistentes de voz embebidos: desplegar `vall_e.cpp` con pesos GGUF en equipos sin GPU dedicada para TTS local de baja latencia en aplicaciones de escritorio.
- Accesibilidad: convertir texto a voz con la voz del propio usuario (preservada como prompt) para personas con pérdida del habla.
- Generación de datos sintéticos de audio: producir utterances multi-idioma (inglés, japonés, francés, alemán) para aumentar datasets de ASR o de identificación de hablante.
- Investigación en TTS zero-shot: servir como base para fine-tuning con LoRA o destilación, tal como sugiere el autor, y para comparar arquitecturas RetNet frente a Llama en modelado de tokens RVQ.
- Transcripción fonética: usar la tarea speech-to-text a fonemas añadida en la configuración Llama para pipelines de análisis fonético.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta una pérdida media de entrenamiento de aproximadamente 1.9–2.1 para la configuración RetNet, sin métricas objetivas (MOS, WER, SIM) ni comparaciones cuantitativas con otros sistemas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El repositorio ocupa 45.3 GB, lo que incluye múltiples configuraciones y formatos; una sola configuración en bfloat16 requiere bastante menos, pero no se especifica la cifra.
- GPU recomendadas: el autor entrenó en RTX 4070 Ti (12 GB), RX 7900XTX (24 GB) y 4×V100 (16 GB cada una); estas GPU son suficientes para entrenamiento e inferencia de la configuración Llama.
- GPU de consumo: sí, cabe en GPUs consumer de gama alta (RTX 4070 Ti, RX 7900XTX) según la experiencia del autor; con pesos GGUF es viable en CPU.
- Opciones de despliegue: `vall_e.cpp` (rama GGUF), implementación PyTorch del repositorio GitHub `e-c-k-e-r/vall-e`, y pesos HF-ified en la rama `HF`. No se documenta soporte para vLLM, TGI, Ollama ni llama.cpp estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ecker/vall-e | no disponible | no disponible (audio variable) | sin benchmarks publicados; pérdida ~1.9–2.1 (RetNet) | AGPL-3.0 | Hugging Face, GitHub, GGUF |
| VALL-E original (Microsoft) | no disponible | no disponible | MOS/SIM reportados en paper, no reproducibles aquí | solo paper, sin pesos públicos | no disponible |
| Bark (Suno) | ~no disponible | no disponible | sin benchmarks comparables en esta ficha | MIT | Hugging Face, ampliamente usado |
| XTTS v2 (Coqui) | no disponible | no disponible | sin benchmarks comparables en esta ficha | Coqui Public Model License (no comercial) | Hugging Face |

La comparación cuantitativa con alternativas no está disponible en la información proporcionada; las diferencias principales son la licencia AGPL-3.0 (copyleft fuerte) frente a MIT o licencias no comerciales, y el carácter experimental del repositorio frente a lanzamientos mantenidos por empresas.

## Limitaciones y advertencias

- Rendimiento zero-shot "deja que desear" según el autor: la configuración Llama no recibió el entrenamiento específico de mezcla de hablantes que sí tuvo la RetNet.
- Artefactos y ruido en los niveles RVQ superiores debido a la distribución de entrenamiento ("next RVQ level is half as likely"), que introduce crust en el audio generado.
- La configuración RetNet (`ar+nar-retnet-8`) "no parece funcionar ya" por regresiones en el código.
- El modelo "definitivamente necesita entrenamiento adicional" y el autor desconoce el siguiente paso óptimo.
- Sesgos: no documentados, pero al entrenarse con un dataset no especificado es probable que herede sesgos de hablantes y acentos del corpus.
- Riesgo de alucinación acústica: posible generación de fonemas o prosodia incorrecta, especialmente en utterances cortas o con prompts pobres en cobertura fonética.
- Licencia AGPL-3.0: impone obligaciones de copyleft fuerte; el uso comercial en servicios en red requiere liberar el código fuente derivado. Verificar compatibilidad antes de producción.
- Idiomas: el soporte multi-idioma es experimental y limitado a inglés, japonés, francés y alemán.
- Repositorio de investigación con 43 descargas y 11 likes: sin garantías de mantenimiento, soporte ni estabilidad de API.

## Enlaces

- Hugging Face: https://huggingface.co/ecker/vall-e
- Repositorio GitHub de la implementación: https://github.com/e-c-k-e-r/vall-e
- Rama GGUF (`vall_e.cpp`): https://huggingface.co/ecker/vall-e/tree/gguf
- Paper original de VALL-E (Microsoft): https://arxiv.org/abs/2301.02111
- Código de `vall_e.cpp`: https://github.com/e-c-k-e-r/vall-e/commits/master/vall_e.cpp/
