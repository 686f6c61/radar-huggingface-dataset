# Prahaladha/hima-tts-nano-te-mlx-fp16

## Resumen

hima-tts-nano-te-mlx-fp16 es la conversión a MLX en precisión float16 del modelo de síntesis de voz (text-to-speech) hima-tts-nano-te, desarrollado por el usuario Prahaladha. Se trata de un modelo compacto de 61,8 millones de parámetros especializado en la generación de audio hablado en telugu, con soporte secundario de inglés, que se distribuye empaquetado para ejecutarse de forma nativa sobre la GPU de equipos Mac con Apple Silicon, sin necesidad de PyTorch en tiempo de inferencia.

El modelo resuelve un problema concreto: la ausencia de alternativas ligeras y de código abierto para TTS de calidad en telugu que puedan ejecutarse en hardware de consumo. Al convertir los pesos a MLX float16, el autor consigue aceleraciones notables frente a la inferencia en CPU con PyTorch (29x tiempo real en un M4 Pro, según la model card), manteniendo las mismas voces y la misma calidad de audio que el modelo original.

La relevancia actual del modelo radica en su tamaño reducido (el repositorio ocupa 0,3 GB) y en su enfoque en un idioma poco cubierto por los sistemas TTS comerciales. Incluye seis voces integradas (tres femeninas y tres masculinas), soporte para clonación de voz a partir de una grabación y la posibilidad de generar voces aleatorias. La licencia es "other", lo que obliga a revisar los términos del modelo base antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS neuronal; detalles de arquitectura no publicados) |
| Parametros totales | 61.854.849 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | float16 (este repositorio); existe una version de 8 bits en repositorio separado |
| Idiomas soportados | telugu (te), ingles (en) |
| Licencia | other |
| Formato de pesos | safetensors (MLX, float16) |

## Arquitectura y entrenamiento

No se han publicado detalles sobre la arquitectura interna del modelo en la informacion disponible. La model card unicamente indica que se trata de un modelo de 62 millones de parametros para text-to-speech en telugu, convertido desde el modelo original hima-tts-nano-te (basado en PyTorch) a MLX en float16. El repositorio incluye un codec separado (`codec.safetensors`) que convierte la salida del modelo en audio, lo que sugiere una arquitectura de dos etapas: un modelo generador de representaciones acusticas y un decodificador de audio.

Tampoco se especifican los datos de entrenamiento (numero de tokens, composicion del dataset, horas de audio) ni si se aplicaron tecnicas de RLHF, DPO o ajuste fino supervisado. La model card menciona que el modelo base fue entrenado para telugu y que este repositorio es una conversion de formato, no un reentrenamiento. Se desconoce si hubo innovaciones tecnicas destacables como decodificacion especulativa o atención lineal.

## Capacidades

- Generacion de audio hablado (text-to-speech) a partir de texto en telugu, con salida en float32 a 24 kHz.
- Seis voces integradas: Bhavana (femenina), Lakshmi (femenina), Sravani (femenina), Srinivas (masculina), Karthik (masculina) y Pranay (masculina).
- Generacion de una voz aleatoria si no se especifica ninguna, con posibilidad de fijar semilla (`seed=`) para obtener siempre la misma toma.
- Clonacion de voz a partir de una grabacion de audio (requiere ejecutar una vez el repositorio base con PyTorch para extraer el archivo de voz).
- Procesamiento por lotes de multiples textos mediante `say_many`, con mejoras sustanciales de rendimiento en la generacion conjunta.
- Normalizacion de texto: el repositorio incluye un modulo `text/` que convierte numeros, fechas y cantidades a palabras.
- Soporte de ingles como idioma secundario, aunque la especializacion principal es el telugu.
- No se ha documentado soporte de tool calling, function calling, agentes ni razonamiento multi-paso, al tratarse de un modelo de sintesis de voz.

## Casos de uso

- **Locucion automatizada de contenido en telugu**: el modelo puede generar narraciones para videos, podcasts o audiolibros en telugu con las seis voces integradas, seleccionando el timbre adecuado segun el tipo de contenido y fijando una semilla para mantener la consistencia entre episodios.
- **Sistemas de atencion al cliente en telugu**: integrado en un IVR o chatbot de voz, el modelo puede sintetizar respuestas dinamicas en telugu con latencia baja gracias a su tamano reducido y a la aceleracion por GPU en Apple Silicon, cubriendo un idioma con poca oferta en TTS open source.
- **Accesibilidad para hablantes de telugu**: conversion de articulos, documentos o notificaciones a audio para personas con discapacidad visual o dificultades de lectura, aprovechando la normalizacion de numeros, fechas y cantidades incluida en el repositorio.
- **Prototipado rapido en Mac**: desarrolladores que trabajan en equipos Mac con chip M4 o similar pueden iterar sobre aplicaciones de voz sin depender de GPUs NVIDIA ni de infraestructura en la nube, usando MLX de forma nativa y con un repositorio de solo 0,3 GB.
- **Generacion por lotes de avisos o mensajes**: con `say_many`, el modelo procesa decenas de textos de forma conjunta (70x tiempo real en 48 textos segun la model card), lo que resulta adecuado para generar lotes de avisos, recordatorios o mensajes personalizados en telugu.
- **Clonacion de voz para contenido de marca**: a partir de una grabacion de referencia, se puede crear una voz sintetica consistente para una marca o un personaje, guardando el archivo de voz resultante y reutilizandolo en futuras generaciones.
- **Investigacion en TTS de bajos recursos**: el modelo sirve como punto de partida para experimentos de sintesis de voz en idiomas con pocos recursos, al ser un modelo pequeno, abierto y facil de ejecutar en hardware de consumo.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Velocidad en Apple M4 Pro (un texto a la vez) | 29x tiempo real |
| Velocidad en Apple M4 Pro con `say_many` (48 textos) | 70x tiempo real |
| Velocidad con PyTorch en CPU (referencia) | 6x tiempo real |
| Tasa de letras leidas incorrectamente (12 frases de prueba) | 7,6% (float32 ONNX: 6,9%; menor es mejor) |

No se han publicado resultados de benchmarks estandar (MOS, WER, MCD) en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada**: al tratarse de un modelo de 61,8 millones de parametros en float16 (aproximadamente 124 MB de pesos), la huella de memoria es muy reducida; no se especifica el consumo exacto de memoria unificada en la model card.
- **GPU recomendadas**: Apple Silicon con GPU integrada; el autor reporta mediciones en un Apple M4 Pro. No se documentan requisitos para GPUs NVIDIA o AMD.
- **Compatibilidad con GPU de consumo**: si, cabe holgadamente en cualquier Mac con Apple Silicon; el modelo esta disenado especificamente para MLX y no para CUDA.
- **Opciones de despliegue**: MLX (libreria `mlx`), con el paquete `hima_mlx` incluido en el repositorio. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, al no ser un modelo de lenguaje.
- **Latencia y throughput**: 29x tiempo real en un M4 Pro con un texto a la vez y 70x con `say_many` sobre 48 textos; 6x en PyTorch sobre CPU como referencia comparativa.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| hima-tts-nano-te-mlx-fp16 | 61,8 M | te, en | other | safetensors (MLX) | Conversion MLX float16; 29x-70x tiempo real en M4 Pro |
| hima-tts-nano-te (base) | 62 M | te, en | other | PyTorch | Modelo original; mismas voces y calidad; inferencia en CPU a 6x |
| hima-tts-nano-te-mlx-8bit | no disponible | te, en | other | safetensors (MLX) | Version cuantizada a 8 bits del mismo modelo |

No se dispone de informacion sobre otros modelos TTS comparables en la informacion proporcionada.

## Limitaciones y advertencias

- **Licencia "other"**: no se especifican los terminos exactos; es imprescindible revisar la licencia del modelo base hima-tts-nano-te antes de cualquier uso comercial o redistribucion.
- **Especializacion limitada al telugu**: el soporte de ingles es secundario y no se documenta su calidad; el modelo no esta pensado para otros idiomas.
- **Tasa de error de pronunciacion**: la model card reporta un 7,6% de letras leidas incorrectamente en 12 frases de prueba, ligeramente peor que la version float32 ONNX (6,9%), lo que puede afectar a la inteligibilidad en produccion.
- **Dependencia de Apple Silicon**: al estar empaquetado para MLX, el rendimiento optimo requiere hardware Apple; en otras plataformas no se garantiza el funcionamiento ni la aceleracion.
- **Clonacion de voz con dependencia de PyTorch**: extraer una voz propia requiere ejecutar una vez el repositorio base con PyTorch, lo que rompe la promesa de "sin PyTorch" para ese flujo concreto.
- **Riesgo de uso indebido de voces clonadas**: la funcionalidad de clonacion de voz puede emplearse para suplantacion; no se documentan mecanismos de consentimiento o marcas de agua en la informacion disponible.
- **Ausencia de datos de entrenamiento y evaluacion estandar**: no se publican detalles sobre el dataset, sesgos potenciales ni metricas de calidad perceptual (MOS), lo que dificulta evaluar su robustez en dominios especificos.
- **Sin soporte documentado de tool calling ni agentes**: no es un modelo de lenguaje y no debe emplearse para tareas de razonamiento o generacion de texto.

## Enlaces

- [Hugging Face: Prahaladha/hima-tts-nano-te-mlx-fp16](https://huggingface.co/Prahaladha/hima-tts-nano-te-mlx-fp16)
- [Modelo base: Prahaladha/hima-tts-nano-te](https://huggingface.co/Prahaladha/hima-tts-nano-te)
- [Version de 8 bits: Prahaladha/hima-tts-nano-te-mlx-8bit](https://huggingface.co/Prahaladha/hima-tts-nano-te-mlx-8bit)
