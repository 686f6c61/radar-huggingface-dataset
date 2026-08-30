# Rin247/Qwen3-TTS-12Hz-0.6B-Base-INT8

## Resumen

Qwen3-TTS-12Hz-0.6B-Base-INT8 es una cuantización de 8 bits del modelo base de la familia Qwen3-TTS, desarrollada por el usuario Rin247 a partir del checkpoint original de Alibaba Qwen. Este modelo de síntesis de voz (text-to-speech) está diseñado para clonación rápida de voz a partir de una muestra de audio de referencia de tan solo 3 segundos, y forma parte de una serie que cubre 10 idiomas principales. La versión INT8 reduce el tamaño del modelo a 1,3 GB, lo que facilita su despliegue en entornos con recursos limitados sin sacrificar de forma significativa la calidad de síntesis.

El modelo emplea una arquitectura de modelo de lenguaje discreto de múltiples codebooks, con un tokenizador acústico propio (Qwen3-TTS-Tokenizer-12Hz) que comprime la señal de audio a 12 Hz. Está entrenado con más de 5 millones de horas de datos de habla multilingüe, lo que le permite generar voz natural, controlable mediante instrucciones en lenguaje natural y con latencia de síntesis extremadamente baja (97 ms). Esta versión cuantizada es relevante para desarrolladores que necesitan integrar clonación de voz en aplicaciones en tiempo real, asistentes virtuales o sistemas de doblaje, con un coste computacional reducido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje discreto de multiples codebooks con tokenizador acustico Qwen3-TTS-Tokenizer-12Hz |
| Parametros totales | 914.643.008 (0,6B nominales, incluye tokenizador y componentes auxiliares) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (el contexto se refiere a la longitud del texto de entrada; no se especifica un limite explicito) |
| Tipos de cuantizacion | INT8 (int8_weight_only) |
| Idiomas soportados | Chino, ingles, japones, coreano, aleman, frances, ruso, portugues, espanol e italiano |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3-TTS emplea una arquitectura de modelo de lenguaje autoregresivo con multiples codebooks discretos, similar a otros sistemas TTS neuronales modernos como VALL-E o XTTS. El tokenizador acustico Qwen3-TTS-Tokenizer-12Hz convierte la senal de audio en una secuencia de tokens discretos a una frecuencia de 12 Hz, lo que permite una compresion eficiente y un modelado semantico de alta dimension. El modelo LM procesa estos tokens junto con la entrada de texto y las instrucciones de control, generando la representacion acustica que posteriormente se decodifica en forma de onda.

El entrenamiento se realizo con mas de 5 millones de horas de datos de habla en 10 idiomas, incluyendo multiples perfiles dialectales. No se menciona el uso de RLHF o DPO, pero el modelo incorpora un mecanismo de control por descripcion en lenguaje natural que permite ajustar atributos acusticos como tono, velocidad o emocion. La innovacion principal reside en su capacidad de clonacion de voz con solo 3 segundos de audio de referencia y en su latencia de sintesis de 97 ms, que lo hace apto para interacciones en tiempo real. La version INT8 mantiene la misma arquitectura pero con pesos cuantizados a 8 bits, lo que reduce el uso de memoria y acelera la inferencia en hardware compatible.

## Capacidades

- Generacion de voz natural y expresiva a partir de texto en 10 idiomas.
- Clonacion de voz con una muestra de referencia de 3 segundos, sin necesidad de entrenamiento adicional.
- Control de la voz mediante instrucciones en lenguaje natural (por ejemplo, "habla mas lento", "con tono alegre").
- Sintesis en streaming con latencia de extremo a extremo de 97 ms, apta para aplicaciones interactivas.
- Soporte de multiples perfiles dialectales dentro de cada idioma.
- Generacion de voz con marcado emocional y variaciones prosodicas.
- Capacidad de procesar texto con formulas matematicas, simbolos y emojis, como se muestra en el ejemplo de uso.
- Integracion sencilla mediante la libreria `qwen-tts` con soporte para Flash Attention.

## Casos de uso

- Asistentes de voz personalizados: el modelo permite clonar la voz de un usuario con una breve muestra y utilizarla en asistentes virtuales, manteniendo una identidad vocal consistente en conversaciones multi-turno.
- Doblaje automatico de contenido audiovisual: gracias a su soporte multilingue y control por descripcion, puede generar doblaje en varios idiomas con la misma voz de referencia, reduciendo costes de produccion.
- Audiolibros y narracion: la capacidad de controlar tono y emocion permite generar narraciones expresivas para libros, articulos o noticias, adaptando el estilo al contenido.
- Accesibilidad para personas con discapacidad visual o dificultades de lectura: el modelo puede convertir texto digital en voz natural en tiempo real, con baja latencia para lectura interactiva.
- Sistemas de respuesta de voz interactiva (IVR) en centros de atencion al cliente: la clonacion de voz y el streaming de baja latencia permiten crear agentes telefonicos con una voz corporativa consistente.
- Generacion de contenido educativo: el modelo puede producir explicaciones habladas de conceptos complejos, incluyendo formulas matematicas, con una voz clara y controlable, util en plataformas de e-learning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card original no incluye metricas comparativas como MOS (Mean Opinion Score) o WER (Word Error Rate) para la version base ni para la cuantizada. Se recomienda consultar el informe tecnico de Qwen3-TTS (arXiv:2601.15621) para obtener datos de evaluacion del modelo original, aunque no se dispone de ellos en esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1-2 GB con cuantizacion INT8, considerando 914 millones de parametros a 1 byte por parametro, mas overhead de activaciones y buffers.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 2060, RTX 3060 o superiores. Tambien es viable en Apple Silicon con Metal.
- Cabe en GPUs de consumo: si, en la mayoria de tarjetas modernas con 4 GB o mas.
- Opciones de despliegue: la libreria oficial `qwen-tts` (pip install qwen-tts) es la via principal, con soporte para Flash Attention. No se menciona compatibilidad directa con vLLM, llama.cpp u Ollama, ya que es un modelo TTS especifico.
- Latencia y throughput: la latencia de sintesis es de 97 ms en el modelo original; la version INT8 puede ofrecer una latencia similar o ligeramente inferior en hardware compatible, aunque no se proporcionan datos concretos.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados para esta version cuantizada. Como referencia, se puede comparar con el modelo base original (Qwen/Qwen3-TTS-12Hz-0.6B-Base) que tiene los mismos parametros y arquitectura pero sin cuantizar, y con otros TTS open source como XTTS v2 o VITS, aunque no se dispone de metricas objetivas en la informacion proporcionada. La principal diferencia de esta version es su menor tamano (1,3 GB frente a los aproximadamente 2 GB del modelo en bfloat16) y su menor requisito de VRAM, a costa de una posible perdida menor de fidelidad en la sintesis.

## Limitaciones y advertencias

- La cuantizacion INT8 puede introducir una degradacion sutil en la calidad de audio, especialmente en voces con mucha variabilidad prosodica o en idiomas con fonetica compleja.
- El modelo esta entrenado principalmente con datos de habla de los 10 idiomas listados; puede tener un rendimiento inferior en dialectos regionales o acentos no representados.
- La clonacion de voz requiere una muestra de referencia limpia y de buena calidad; ruido de fondo o distorsiones pueden afectar al resultado.
- No se garantiza la ausencia de sesgos en la generacion de voz, especialmente en cuanto a genero, edad o acento, derivados de los datos de entrenamiento.
- Aunque la licencia es Apache 2.0, el uso comercial debe cumplir con las condiciones de la licencia y con las politicas de uso de los modelos de Qwen.
- La latencia de 97 ms se refiere al modelo original; en la version cuantizada puede variar segun el hardware y la implementacion.
- No se han publicado evaluaciones de seguridad o robustez frente a entradas adversariales en el texto.

## Enlaces

- Modelo cuantizado en Hugging Face: https://huggingface.co/Rin247/Qwen3-TTS-12Hz-0.6B-Base-INT8
- Modelo base original: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-0.6B-Base
- Informe tecnico (arXiv): https://huggingface.co/papers/2601.15621
- Repositorio GitHub: https://github.com/QwenLM/Qwen3-TTS
- Demo oficial en Hugging Face Spaces: https://huggingface.co/spaces/Qwen/Qwen3-TTS
- Coleccion de modelos Qwen3-TTS: https://huggingface.co/collections/Qwen/qwen3-tts
- Modelo en ModelScope: https://www.modelscope.cn/models/Qwen/Qwen3-TTS-12Hz-0.6B-Base
