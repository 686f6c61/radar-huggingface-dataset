# Prahaladha/hima-tts-nano-hi

## Resumen

hima-tts-nano-hi es un modelo de síntesis de voz (text-to-speech) para hindi, desarrollado por el usuario Prahaladha, que con solo 61,8 millones de parámetros es capaz de generar audio a velocidad superior al tiempo real en CPU de portátil. Resuelve el problema de la síntesis de voz en hindi de calidad en entornos con recursos limitados: no requiere GPU, no necesita servicios en la nube y ofrece versiones optimizadas en ONNX y MLX para acelerar la inferencia en CPU y en Apple Silicon respectivamente. El modelo acepta texto en escritura devanagari con palabras en inglés intercaladas tal como se escriben habitualmente, y convierte números, fechas y cantidades a palabras antes de la lectura.

El modelo incorpora seis voces integradas (tres femeninas y tres masculinas), clonación de voz a partir de 5-10 segundos de audio de referencia, generación de voces aleatorias reproducibles mediante semilla y persistencia de voces en ficheros safetensors para reutilizarlas sin la grabación original. La salida es audio a 24 kHz en formato de array NumPy, y el texto largo se segmenta por frases para su lectura secuencial.

Es relevante ahora porque demuestra que la síntesis de voz multilingüe de calidad puede ejecutarse en hardware de consumo con un modelo de tamaño muy reducido y una licencia permisiva para uso local, lo que facilita su integración en aplicaciones de accesibilidad, asistentes personales y sistemas embebidos sin dependencia de infraestructura cloud.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS con codec de audio separado) |
| Parametros totales | 61.854.849 (61,8 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; el texto largo se divide por frases |
| Tipos de cuantizacion | int8 (version ONNX), fp16 (version MLX), 8-bit (version MLX) |
| Idiomas soportados | hindi (hi), ingles (en) |
| Licencia | other |
| Formato de pesos | safetensors (modelo base, adaptador de voces, codec); ONNX y MLX en repos separados |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo en la información proporcionada. La model card indica que el sistema se compone de un modelo base (`model.safetensors`) que genera representaciones que un codec separado (`codec.safetensors`) convierte en audio a 24 kHz. El modelo incluye un adaptador opcional (`voices/adapter.safetensors`) que, combinado con los ajustes de cada voz (`voices/voices.safetensors`), habilita las seis voces integradas sin modificar los pesos del modelo base.

No se han publicado datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. La model card menciona que el modelo fue evaluado con 1.202 frases en hindi leídas por dos reconocedores de voz (Sarvam saaras v4 y Hima ASR), lo que sugiere un pipeline de evaluación basado en ASR para medir la inteligibilidad de la síntesis. No se dispone de información sobre innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Síntesis de voz en hindi (devanagari) con palabras en inglés intercaladas en alfabeto latino, tal como se escribe habitualmente en contextos bilingües.
- Normalización de números, fechas y cantidades monetarias a palabras antes de la lectura (por ejemplo, `₹2,500` o `15/08/2026`).
- Segmentación automática de texto largo por frases para lectura secuencial.
- Seis voces integradas: Meera, Sneha, Nandini (femeninas) y Siddharth, Ishaan, Nikhil (masculinos).
- Clonación de voz a partir de 5-10 segundos de audio claro (requiere `speechbrain`).
- Generación de voces aleatorias reproducibles mediante semilla (`seed=`).
- Persistencia y reutilización de voces en ficheros `.safetensors`.
- Salida de audio a 24 kHz como array NumPy.
- Ejecución en CPU de portátil a velocidad superior al tiempo real (6x en PyTorch, 10x en ONNX, 15x en ONNX int8, 29x en MLX fp16, hasta 70x en MLX con procesamiento por lotes).
- No se menciona soporte de tool calling, function calling, agentes ni razonamiento multi-paso; es un modelo exclusivamente de TTS.

## Casos de uso

- **Lectura de noticias y artículos en hindi**: el modelo segmenta el texto por frases y lo lee secuencialmente, lo que permite convertir artículos largos en audio para consumo en desplazamientos o para personas con discapacidad visual. La velocidad de 6x en CPU hace viable la generación casi instantánea de boletines completos.
- **Asistentes de voz locales sin conexión**: al ejecutarse en CPU de portátil y en versiones ONNX/MLX, puede integrarse en aplicaciones de escritorio o móviles que necesiten TTS en hindi sin enviar texto a servicios en la nube, preservando la privacidad del usuario.
- **Clonación de voz para audiolibros personalizados**: con 5-10 segundos de grabación de referencia, un narrador puede generar un audiolibro completo en su propia voz. La persistencia de la voz en `.safetensors` permite reutilizarla en sesiones posteriores sin la grabación original.
- **Sistemas de accesibilidad para hablantes de hindi**: integración en lectores de pantalla y aplicaciones de comunicación aumentativa, donde la baja latencia en CPU y la posibilidad de generar voces aleatorias reproducibles facilitan la personalización sin infraestructura adicional.
- **Contenido educativo bilingüe hindi-inglés**: el modelo acepta palabras en inglés en alfabeto latino dentro de frases en devanagari, lo que lo hace adecuado para materiales didácticos donde los términos técnicos se mantienen en inglés, como en cursos de programación o ciencia.
- **Avisos y mensajes automatizados en call centers**: generación de respuestas de voz para sistemas de atención telefónica en hindi, con la posibilidad de elegir entre seis voces integradas para distintos tipos de mensaje (informativos, promocionales, de emergencia).
- **Prototipado rápido de interfaces de voz**: gracias a la API Python (`TTS.say()`) y a la CLI (`python -m hima_tts`), los desarrolladores pueden generar muestras de audio en segundos para validar diseños de producto antes de invertir en modelos TTS de mayor tamaño.

## Benchmarks y rendimiento

La model card reporta una evaluación de inteligibilidad sobre 1.202 frases en hindi, cada una transcrita por dos reconocedores de voz. La métrica es el porcentaje de letras incorrectas (menor es mejor), contando como iguales las palabras en inglés escritas en devanagari o en alfabeto latino.

| Letras incorrectas (menor es mejor) | Sarvam saaras v4 | Hima ASR |
|---|---|---|
| Este modelo | 3,3% | 4,1% |
| ONNX `int8` | 3,1% | 3,8% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que se trata de un modelo de síntesis de voz y no de lenguaje.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el modelo base ocupa aproximadamente 0,9 GB en el repositorio completo (incluyendo codec, tokenizer y adaptador de voces). En fp32, los 61,8 M de parámetros equivalen a unos 247 MB; en int8, unos 62 MB. El codec y el adaptador añaden una cantidad no especificada.
- **GPU recomendadas**: no se especifican GPU concretas. El modelo está diseñado para ejecutarse en CPU de portátil; las versiones MLX aprovechan la GPU de Apple Silicon (M4 Pro reportado en la model card).
- **¿Cabe en GPU de consumo?**: sí, con amplio margen. Cualquier GPU con más de 1 GB de VRAM puede alojar el modelo, aunque el diseño prioriza la ejecución en CPU.
- **Opciones de despliegue**: PyTorch (CPU o GPU), ONNX Runtime (cualquier CPU en Windows, Linux o Mac), MLX (GPU de Apple Silicon). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un modelo TTS de este tipo.
- **Latencia y throughput estimados** (Apple M4 Pro, según la model card):
  - PyTorch en CPU: 6x tiempo real.
  - ONNX en CPU: 10x tiempo real; 15x con `int8`.
  - MLX fp16 en GPU Apple: 29x tiempo real; 70x con muchos textos a la vez.
  - MLX 8-bit en GPU Apple: 50x con muchos textos a la vez.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La model card únicamente menciona a Sarvam saaras v4 y Hima ASR como reconocedores de voz utilizados en la evaluación, no como modelos TTS comparables. No se han publicado datos de parámetros, contexto, rendimiento o licencia de alternativas en la información disponible.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| hima-tts-nano-hi | 61,8 M | no disponible | other | Hugging Face (repo principal, ONNX, MLX) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- **Licencia "other"**: no se especifican los términos exactos de uso comercial. Es imprescindible revisar el texto completo de la licencia en el repositorio antes de utilizarlo en producción.
- **Idiomas limitados**: solo hindi e inglés. No se ha evaluado su comportamiento en otras lenguas ni en code-switching con idiomas distintos del inglés.
- **Riesgo de alucinación en la pronunciación**: aunque la métrica de letras incorrectas es baja (3,3-4,1%), existe un porcentaje residual de errores de pronunciación, especialmente en palabras en inglés o términos técnicos poco frecuentes.
- **Dependencia de `speechbrain` para clonación de voz**: la clonación requiere instalar una dependencia adicional y 5-10 segundos de audio claro; no se especifica el comportamiento con audio ruidoso o con acentos no nativos.
- **Voces aleatorias no deterministas sin semilla**: sin `seed=`, cada generación produce una voz distinta, lo que puede ser problemático en aplicaciones que requieran consistencia.
- **Sesgos no documentados**: no se han publicado análisis de sesgos de género, acento o registro lingüístico en las seis voces integradas.
- **Contexto no especificado**: no se indica una longitud máxima de contexto; el texto largo se segmenta por frases, lo que puede afectar a la prosodia en textos con puntuación ambigua.
- **Fecha de creación futura**: el repositorio figura creado el 2026-10-28, lo que puede indicar metadatos inconsistentes o un error en la información proporcionada; conviene verificar la fecha real en Hugging Face.

## Enlaces

- Repositorio principal: https://huggingface.co/Prahaladha/hima-tts-nano-hi
- Versión ONNX: https://huggingface.co/Prahaladha/hima-tts-nano-hi-ONNX
- Versión MLX fp16: https://huggingface.co/Prahaladha/hima-tts-nano-hi-mlx-fp16
- Versión MLX 8-bit: https://huggingface.co/Prahaladha/hima-tts-nano-hi-mlx-8bit
