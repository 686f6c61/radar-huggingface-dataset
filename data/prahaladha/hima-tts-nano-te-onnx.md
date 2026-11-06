# Prahaladha/hima-tts-nano-te-ONNX

## Resumen

hima-tts-nano-te-ONNX es la conversión a formato ONNX del modelo de síntesis de voz hima-tts-nano-te, desarrollado por el usuario Prahaladha. Se trata de un modelo de text-to-speech (TTS) orientado principalmente al telugu, con soporte secundario de inglés en el texto de entrada, y con un tamaño de 62 millones de parámetros. Su propósito es generar audio de voz de forma rápida en CPU, sin dependencia de PyTorch en tiempo de inferencia, lo que lo hace adecuado para despliegues ligeros en Windows, Linux y macOS.

La relevancia de esta versión ONNX radica en su portabilidad y eficiencia: incluye pesos en `fp32` e `int8`, y según el autor alcanza 12x tiempo real en `fp32` y 17x en `int8` sobre una CPU Apple M4 Pro con 4 hilos, frente a 6x de la versión PyTorch en el mismo hardware. Incorpora seis voces predefinidas (tres femeninas y tres masculinas) y permite clonar voces a partir de una grabación breve, aunque ese proceso de clonación requiere el repositorio original basado en PyTorch.

El modelo está pensado para aplicaciones de lectura de texto en telugu con latencia baja y requisitos de hardware mínimos. La licencia figura como "other", sin que la información disponible detalle sus términos concretos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS neuronal; detalles de arquitectura no especificados) |
| Parametros totales | 62 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32 e int8 (grafos ONNX separados) |
| Idiomas soportados | telugu (te), inglés (en) |
| Licencia | other |
| Formato de pesos | ONNX (grafos), safetensors (prefijo y voces) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo más allá de que se trata de un modelo TTS neuronal de 62 millones de parámetros. La versión ONNX se organiza en varios grafos: `onnx/base/` y `onnx/voices/` contienen el modelo en `fp32` e `int8`, con una variante de `voices/` ajustada específicamente para las seis voces integradas, y `onnx/decoder.onnx` transforma la salida del modelo en audio. Además, `prefix.safetensors` almacena los pesos que el código utiliza antes de invocar los grafos, y `tokenizer.model` y `config.yaml` definen el tokenizador de texto y los parámetros de muestreo.

No se han publicado en la información disponible datos sobre el volumen de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. El modelo base incluye un módulo de normalización de texto (`text/`) que convierte números, fechas y cantidades a palabras, y permite la clonación de voz mediante un fichero `.safetensors` generado con el repositorio original. La salida de audio es float32 a 24 kHz.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto en telugu, con mezcla de términos en inglés en la entrada.
- Generación de audio a 24 kHz en formato float32.
- Seis voces integradas: Bhavana, Lakshmi y Sravani (femeninas); Srinivas, Karthik y Pranay (masculinos).
- Selección de voz aleatoria si no se especifica ninguna.
- Reproducibilidad mediante semilla (`seed=`) para obtener la misma locución.
- Clonación de voz a partir de una grabación corta, usando el repositorio base con PyTorch para generar un fichero `.safetensors`.
- Normalización de texto: conversión de números, fechas y cantidades a palabras.
- Inferencia en CPU sin PyTorch, en Windows, Linux y macOS.
- No se indica soporte de tool calling, agentes, visión ni audio de entrada.

## Casos de uso

- Lectura de contenido en telugu en aplicaciones móviles o de escritorio: el modelo puede sintetizar texto a voz en CPU sin GPU, lo que permite integrarlo en apps ligeras con requisitos mínimos de hardware.
- Sistemas de accesibilidad para personas con discapacidad visual: la generación a 24 kHz y la velocidad de 12x-17x tiempo real permiten leer documentos largos con latencia baja en equipos convencionales.
- Asistentes de voz para atención al cliente en telugu: las seis voces predefinidas permiten asignar timbres distintos a diferentes flujos o marcas sin entrenamiento adicional.
- Audiolibros y narración automatizada: la normalización de números, fechas y cantidades facilita la lectura de textos con datos numéricos sin preprocesado manual.
- Integración en pipelines de CI/CD para pruebas de audio: al no requerir PyTorch y ser un artefacto ONNX de 0,6 GB, puede desplegarse en contenedores ligeros para generar locuciones de prueba de forma reproducible con `seed=`.
- Prototipado de interfaces conversacionales en telugu: la clonación de voz permite crear una voz de marca a partir de una grabación breve y usarla después en la versión ONNX mediante `voice_file`.
- Generación de avisos y notificaciones habladas: la velocidad de inferencia en CPU permite sintetizar mensajes cortos en tiempo real en servidores sin acelerador.

## Benchmarks y rendimiento

| Metrica | fp32 | int8 | Referencia |
|---|---|---|---|
| Velocidad en CPU Apple M4 Pro (4 hilos) | 12x tiempo real | 17x tiempo real | PyTorch en la misma CPU: 6x |
| Tasa de letras leídas incorrectamente (12 frases de prueba) | 6,9% | 6,2% | menor es mejor |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, dado que se trata de un modelo TTS y no de un modelo de lenguaje.

## Requisitos de hardware

- VRAM: no aplica para inferencia en CPU; el modelo está diseñado para ejecutarse sin GPU.
- GPU recomendadas: no se especifican; el modelo está optimizado para CPU.
- Cabe en CPU convencional: el repositorio ocupa 0,6 GB y el modelo tiene 62M parámetros, por lo que es viable en equipos de escritorio y portátiles sin acelerador.
- Opciones de despliegue: inferencia mediante el paquete `hima_onnx` incluido en el repositorio, con ONNX Runtime; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: 12x tiempo real en `fp32` y 17x en `int8` sobre Apple M4 Pro con 4 hilos; no se proporcionan datos para otras CPU.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de TTS en telugu ni datos de rendimiento de alternativas.

## Limitaciones y advertencias

- La licencia figura como "other" y no se detallan sus términos; es necesario consultar el repositorio para confirmar las condiciones de uso comercial.
- El modelo está orientado principalmente al telugu; el soporte de inglés se limita a términos embebidos en el texto, no a síntesis completa en inglés.
- La clonación de voz requiere el repositorio base con PyTorch, por lo que no es posible realizarla únicamente con la versión ONNX.
- La tasa de error de lectura de letras es del 6,9% en `fp32` y del 6,2% en `int8` sobre 12 frases de prueba, lo que indica que aún puede haber errores de pronunciación.
- No se han publicado datos sobre sesgos, riesgo de alucinación (no aplica en el mismo sentido que en modelos de lenguaje) ni limitaciones de contexto.
- El número de descargas (16) y de likes (0) es muy bajo, lo que sugiere poca validación por parte de la comunidad.
- No se especifican los datos de entrenamiento ni la procedencia de las voces, lo que puede plantear dudas sobre derechos de uso de las mismas.

## Enlaces

- [Hugging Face: Prahaladha/hima-tts-nano-te-ONNX](https://huggingface.co/Prahaladha/hima-tts-nano-te-ONNX)
- [Hugging Face: Prahaladha/hima-tts-nano-te (modelo base)](https://huggingface.co/Prahaladha/hima-tts-nano-te)
