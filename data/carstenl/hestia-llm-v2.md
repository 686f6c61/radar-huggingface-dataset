# CarstenL/Hestia-LLM-V2

## Resumen

Hestia LLM V2 es un modelo de lenguaje especializado en la limpieza y estructuración de texto dictado, desarrollado por CarstenL como componente local de Sophist Hestia, una aplicación de dictado para macOS que funciona íntegramente en el dispositivo. El modelo parte de Qwen/Qwen3.5-4B (Apache-2.0), al que se le aplica un ajuste fino con LoRA de rango 32 que posteriormente se fusiona en los pesos base y se cuantiza a 4 bits con MLX (group size 64). El resultado es un modelo de 4.205.751.296 parámetros y aproximadamente 2,2 GB, sin pesos de visión, pensado para ejecutarse en Apple Silicon mediante MLX o mlx-swift-lm.

El problema que resuelve es concreto: la salida de los sistemas de reconocimiento de voz (en este caso, transcripciones generadas con Parakeet) contiene faltas de puntuación, mayúsculas inconsistentes, muletillas, autocorrecciones y errores de formato. Hestia LLM V2 reescribe ese texto aplicando puntuación, capitalización, eliminación de muletillas, resolución de autocorrecciones, interpretación de puntuación dictada, aplicación de listas de términos, selección de la forma de tratamiento (du/Sie) según el contexto y formato de correo electrónico y chat. Además, genera resúmenes de reuniones y ejecuta acciones cortas sobre texto.

Es relevante ahora por dos motivos. Primero, porque ejemplifica el patrón de modelos pequeños y especializados que se despliegan localmente en hardware de consumo, sin enviar datos a la nube, algo crítico para aplicaciones de dictado que manejan información sensible. Segundo, porque su entrenamiento se hace sobre los prompts exactos que envía la aplicación, lo que ilustra una práctica de ingeniería de producto: el modelo no es un asistente general, sino un componente de un pipeline concreto, con un contrato de entrada y salida definido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B), ajuste fino con LoRA rango 32 fusionado en los pesos base |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (group size 64) con MLX |
| Idiomas soportados | aleman (de), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), 4-bit |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer de Qwen3.5-4B, con el modo de razonamiento (thinking) desactivado. Sobre esa base se aplica un ajuste fino con LoRA de rango 32, que después se fusiona en los pesos del modelo base y se cuantiza a 4 bits con group size 64 mediante MLX. Los pesos de visión del modelo base se eliminan, de modo que el resultado es estrictamente texto. El repositorio ocupa 2,4 GB y el modelo final ronda los 2,2 GB, lo que lo hace apto para ejecución local en Apple Silicon a través de MLX y mlx-swift-lm.

Los datos de entrenamiento son dictados sintéticos en alemán e inglés: textos escritos por un LLM, convertidos a voz mediante text-to-speech y transcritos con Parakeet, cada uno emparejado con una limpieza de referencia. A ello se añaden ejemplos de reuniones y de acciones sobre texto generados por el propio modelo base para preservar esas capacidades. No se utilizaron datos de usuarios. El entrenamiento se orienta a los prompts exactos que envía la aplicación Sophist Hestia: un system prompt con reglas, una lista de términos opcional, una sección de contexto y el mensaje del usuario envuelto en etiquetas `<text>`. Una decisión de diseño destacable es que el texto a procesar nunca se interpreta como instrucción: las preguntas o peticiones contenidas en el dictado se limpian, no se responden.

## Capacidades

- Limpieza de texto dictado: puntuación, mayúsculas, eliminación de muletillas y resolución de autocorrecciones.
- Interpretación de puntuación dictada (por ejemplo, comas o puntos mencionados oralmente).
- Aplicación de listas de términos para corregir palabras mal reconocidas cuando suenan de forma similar.
- Selección de la forma de tratamiento (du/Sie) en alemán a partir del contexto.
- Formato de correo electrónico y de mensajes de chat.
- Generación de resúmenes de reuniones.
- Ejecución de acciones cortas sobre texto.
- Capacidades multilingües limitadas a alemán e inglés.
- Ejecución local en el dispositivo mediante MLX en Apple Silicon.
- No soporta tool calling ni function calling (no documentado).
- No soporta agentes ni razonamiento multi-paso (no documentado).
- Modo thinking desactivado en el modelo base.

## Casos de uso

- Dictado en macOS con limpieza automática: la aplicación captura la transcripción de Parakeet y la envía al modelo con el system prompt de reglas para obtener texto con puntuación y mayúsculas correctas, sin salir del dispositivo.
- Corrección de términos técnicos en dominios especializados: el usuario define una lista de términos (nombres de productos, siglas, jerga interna) y el modelo sustituye palabras mal reconocidas cuando suenan de forma similar, reduciendo errores en entornos profesionales.
- Redacción de correos por voz: el modelo aplica formato de correo electrónico y ajusta el registro (du/Sie) según el contexto de la conversación, de modo que el dictado se convierte en un borrador listo para enviar.
- Resúmenes de reuniones: tras una transcripción larga, el modelo genera un resumen estructurado de los puntos tratados, aprovechando que el procesamiento es local y no expone contenido confidencial.
- Mensajería instantánea por voz: el modelo adapta el texto al formato de chat (frases cortas, ausencia de formalismos innecesarios) para dictar mensajes en aplicaciones de mensajería.
- Acciones cortas sobre texto seleccionado: reescritura, acortado o reformateado de un fragmento dictado o seleccionado, como parte del flujo de trabajo de la aplicación.
- Privacidad en entornos regulados: al ejecutarse íntegramente en el Mac, es adecuado para profesionales que manejan información sensible (sanidad, legal, finanzas) y no pueden enviar audio ni transcripciones a servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica directamente; el modelo está pensado para memoria unificada de Apple Silicon. El tamaño del modelo es de aproximadamente 2,2 GB en cuantización de 4 bits, por lo que requiere al menos unos 3-4 GB de memoria libre para inferencia con overhead del runtime.
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) mediante MLX y mlx-swift-lm. No se documenta soporte para GPU NVIDIA o AMD.
- Cabe en hardware de consumo: sí, en equipos Mac con Apple Silicon; el requisito exacto de memoria no está especificado en la información disponible.
- Opciones de despliegue: MLX y mlx-swift-lm. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|---|
| Hestia LLM V2 | 4,2 B | no disponible | de, en | Apache-2.0 | safetensors 4-bit (MLX) | Limpieza de dictado y texto |
| Qwen/Qwen3.5-4B (base) | 4 B (aprox.) | no disponible | multilingüe | Apache-2.0 | safetensors | Asistente general |
| Alternativas especializadas en limpieza de texto | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de modelos comparables directos en la información proporcionada. La comparación más significativa es con su modelo base, Qwen3.5-4B, del que hereda arquitectura y licencia pero del que difiere en tamaño efectivo (pesos de visión eliminados), cuantización (4 bits) y especialización (limpieza de dictado frente a uso general).

## Limitaciones y advertencias

- Puede eliminar ocasionalmente un "No" o "Nein" inicial del texto dictado.
- Puede interpretar erróneamente una pregunta final del tipo "… o qué debería hacer?" como una autocorrección.
- Sustituye palabras mal reconocidas por términos de la lista solo cuando suenan de forma similar, pero puede seleccionar un término incorrecto.
- No es un asistente de propósito general: las salidas deben revisarse como cualquier corrección automática.
- El modelo está entrenado para los prompts exactos de la aplicación Sophist Hestia; otros prompts funcionan pero no fueron el foco del entrenamiento, por lo que el rendimiento puede degradarse fuera de ese contrato.
- Idiomas limitados a alemán e inglés; no se documenta soporte para castellano ni otros idiomas.
- No se documentan sesgos conocidos más allá de los derivados del modelo base y de los datos sintéticos de entrenamiento.
- Riesgo de alucinación no evaluado en la información disponible; al tratarse de una tarea de reescritura, el riesgo principal es la alteración del contenido original.
- Licencia Apache-2.0, que permite uso comercial; los derechos del modelo base corresponden a Alibaba Cloud (equipo Qwen).
- Requiere Apple Silicon y el runtime MLX; no es desplegable en infraestructura NVIDIA sin conversión adicional no documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CarstenL/Hestia-LLM-V2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- MLX (repositorio): https://github.com/ml-explore/mlx
- mlx-swift-lm: no disponible en la información proporcionada
- Paper o blog del modelo: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
