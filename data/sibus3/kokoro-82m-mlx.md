# sibus3/Kokoro-82M-mlx

## Resumen

Kokoro-82M es un modelo de síntesis de voz (text-to-speech) de código abierto con 82 millones de parámetros, desarrollado originalmente por hexgrad. Esta ficha cubre la conversión a formato MLX publicada por sibus3, pensada para ejecutarse en Apple Silicon mediante el paquete `kokoro_mlx`, sin dependencias de PyTorch ni transformers. La conversión es únicamente de formato: los pesos y las 54 voces originales se han transformado a safetensors MLX sin ningún ajuste fino adicional.

El modelo destaca por ofrecer una calidad de voz comparable a la de sistemas TTS mucho más grandes, pero con una huella de memoria y un coste computacional muy reducidos. Esto lo hace especialmente atractivo para despliegues en entornos con recursos limitados, como aplicaciones de escritorio en Mac, prototipos rápidos o servicios de voz en tiempo real. La licencia Apache-2.0 permite su uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 82 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no generativo de texto) |
| Tipos de cuantizacion | no disponible (el repo solo incluye safetensors en bf16, sin cuantizaciones adicionales) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

No se dispone de detalles publicos sobre la arquitectura interna del modelo en la informacion proporcionada. Se sabe que es un modelo TTS ligero de 82 millones de parametros, disenado para ofrecer una calidad de voz comparable a la de sistemas mucho mayores, priorizando la velocidad y la eficiencia. El entrenamiento original fue realizado por hexgrad, pero no se han publicado datos sobre el dataset, el numero de tokens ni el proceso de alineacion o ajuste.

La conversion a MLX realizada por sibus3 no altera la arquitectura ni los pesos: se limita a transformar el formato de los tensores para que puedan cargarse directamente con MLX, eliminando la necesidad de PyTorch en el pipeline de inferencia. El repositorio incluye el archivo `config.json` original sin modificaciones, lo que confirma que la estructura del modelo se mantiene intacta.

## Capacidades

- Sintesis de voz a partir de texto: genera audio de habla natural a partir de cadenas de texto.
- 54 voces preconvertidas: el repositorio incluye todas las voces del modelo original en formato safetensors MLX, listas para usar sin conversion adicional.
- Inferencia en Apple Silicon: gracias a la conversion MLX, el modelo se ejecuta de forma nativa en chips M1, M2 y posteriores, sin necesidad de PyTorch ni CUDA.
- Integracion con el paquete `kokoro_mlx`: proporciona una API sencilla para cargar el modelo y generar audio.
- Eficiencia computacional: al ser un modelo de solo 82M de parametros, la generacion de voz es rapida y consume poca memoria, apta para aplicaciones en tiempo real.

## Casos de uso

- Asistentes de voz en aplicaciones de escritorio para macOS: el modelo se puede integrar en aplicaciones nativas de Apple Silicon para generar respuestas habladas, aprovechando la baja latencia y el reducido consumo de recursos.
- Generacion de audiolibros y podcasts: permite convertir texto largo en audio de forma local, sin depender de servicios en la nube, ideal para creadores de contenido que trabajan en Mac.
- Prototipado rapido de interfaces de voz: al ser ligero y facil de desplegar, es adecuado para validar conceptos de productos con interaccion por voz antes de escalar a soluciones mayores.
- Sistemas de lectura de pantalla para accesibilidad: puede integrarse en herramientas de asistencia para personas con discapacidad visual, generando voz a partir de texto en tiempo real.
- Doblaje automatico de videos cortos: su velocidad permite generar pistas de voz para videos de redes sociales o presentaciones, con la posibilidad de elegir entre varias voces.
- Educacion y aprendizaje de idiomas: se puede usar para crear ejercicios de pronunciacion o materiales de escucha, aunque la cobertura de idiomas no esta documentada en la informacion disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo original de hexgrad afirma una calidad comparable a sistemas TTS mucho mayores, pero no se aportan metricas objetivas (MOS, WER, etc.) en los materiales consultados.

## Requisitos de hardware

- El modelo esta disenado exclusivamente para Apple Silicon (M1, M2, M3 y posteriores) gracias a la conversion MLX.
- Al tratarse de un modelo de 82M de parametros, la memoria necesaria es reducida: cabe en cualquier Mac con al menos 8 GB de RAM unificada, aunque se recomienda 16 GB para trabajar comodamente con las 54 voces cargadas en memoria.
- No es compatible con GPUs NVIDIA ni con entornos CUDA, ya que MLX es un framework especifico de Apple.
- El despliegue se realiza mediante el paquete `kokoro_mlx` (disponible en GitHub), que gestiona la descarga de pesos y la inferencia. No se requiere vLLM, llama.cpp ni Ollama.
- La latencia de generacion no esta documentada, pero por el tamano del modelo se espera que sea inferior a la de modelos TTS grandes, permitiendo sintesis en tiempo real en hardware Apple moderno.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Plataforma | Licencia | Notas |
|---|---|---|---|---|---|
| sibus3/Kokoro-82M-mlx | 82M | safetensors MLX | Apple Silicon | Apache-2.0 | Conversion directa del original, sin fine-tuning |
| hexgrad/Kokoro-82M | 82M | PyTorch | Multiplataforma (CPU/GPU) | Apache-2.0 | Modelo original, requiere PyTorch |
| mlx-community/Kokoro-82M-bf16 | 82M | safetensors MLX (bf16) | Apple Silicon | Apache-2.0 | Otra conversion MLX, tambien sin fine-tuning |

Las tres variantes comparten los mismos pesos y arquitectura; la diferencia radica en el formato de distribucion y en la dependencia de PyTorch. La version de sibus3 y la de mlx-community son funcionalmente equivalentes para usuarios de Apple Silicon, mientras que la original de hexgrad es la unica que se puede ejecutar en otros entornos.

## Limitaciones y advertencias

- El modelo solo funciona en Apple Silicon; no es utilizable en servidores con GPUs NVIDIA ni en entornos x86 convencionales.
- No se ha documentado la cobertura de idiomas. Es probable que el modelo este entrenado principalmente para ingles, pero no hay confirmacion en la informacion disponible.
- Al ser una conversion de formato, no se han realizado mejoras ni adaptaciones sobre el modelo original; cualquier limitacion del modelo base (pronunciacion de nombres propios, entonacion en frases complejas, etc.) se mantiene.
- La calidad de la voz puede variar segun el texto de entrada; como en cualquier sistema TTS, existe riesgo de pronunciaciones incorrectas o de una entonacion poco natural en textos largos o tecnicos.
- No se incluyen herramientas de evaluacion ni benchmarks en el repositorio, por lo que el usuario debe validar la calidad por su cuenta antes de usarlo en produccion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sibus3/Kokoro-82M-mlx
- Modelo original (hexgrad): https://huggingface.co/hexgrad/Kokoro-82M
- Repositorio GitHub de inferencia MLX: https://github.com/gabrimatic/kokoro-mlx
- Repositorio GitHub del modelo original: https://github.com/hexgrad/kokoro
- Conversion alternativa en MLX (mlx-community): https://huggingface.co/mlx-community/Kokoro-82M-bf16
