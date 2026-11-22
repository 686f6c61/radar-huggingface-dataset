# litert-community/Spark-X2.6-1.7B

## Resumen

Spark-X2.6-1.7B es un modelo de lenguaje denso de 1,71 mil millones de parámetros desarrollado por el SparkLLM Team, publicado originalmente por XHToken y convertido al formato LiteRT-LM por la comunidad litert-community para su ejecución en dispositivos de borde (móviles, tablets y equipos de sobremesa). Es el segundo modelo de la serie Spark-X2.6, tras el Spark-X2.6-4B, y mantiene la arquitectura del Spark-X2.5-1.7B, obteniendo su mejora de capacidad principalmente mediante un post-entrenamiento refinado. Está diseñado como modelo de razonamiento: genera su cadena de pensamiento dentro de etiquetas `<think>…</think>` antes de emitir la respuesta final.

La arquitectura es un decoder transformer denso de 28 capas con tamaño oculto 2048, 8 cabezas de consulta y 2 cabezas KV de 256 dimensiones cada una, con atención de ventana deslizante de 512 tokens en tres de cada cuatro capas, puertas sigmoideas por cabeza en la salida de atención, MLPs con puerta y GELU exacto, y un vocabulario atado de 131.072 entradas. El contexto declarado en los ficheros es de 4.096 tokens (la caché KV que acompaña a los ficheros LiteRT-LM).

La relevancia actual del modelo reside en su empaquetado: los ficheros `.litertlm` permiten ejecutar inferencia en GPU de teléfonos de gama alta (Galaxy S26, Pixel 11 Pro, iPhone 18 Pro) con velocidades de decodificación de entre 25 y 51 tokens por segundo, y una precisión en GSM8K de 80-82 puntos, a solo 2-4 puntos del modelo de referencia en bf16. Todo ello bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso con atención de ventana deslizante (3 capas SW de 512 por cada capa de atención completa), puertas sigmoideas por cabeza en la salida de atención, MLP con puerta y GELU exacto, vocabulario atado |
| Parametros totales | 1,71 mil millones (1.7B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 4.096 tokens (caché KV de los ficheros LiteRT-LM) |
| Tipos de cuantizacion | int4-mlp (atención int8; MLP gate/up int4 blockwise-32 OCTAV; MLP down y capa de salida int8; embedding int8 en sección propia) e int8 (dinámica por canal en todas las capas lineales y el embedding) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); modelo base original en formato no especificado |
| Capas | 28 |
| Tamano oculto | 2.048 |
| Cabezas de atencion | 8 query, 2 KV (256 dimensiones por cabeza) |
| Vocabulario | 131.072 entradas (atado) |
| Tamano de ficheros | int4-mlp: 1.706 MB; int8: 1.836 MB |
| Libreria | litert-lm |

## Arquitectura y entrenamiento

El modelo es un decoder transformer denso de 28 capas con tamaño oculto 2048. La atención emplea 8 cabezas de consulta y 2 cabezas KV de 256 dimensiones, con un patrón de tres capas de ventana deslizante de 512 tokens por cada capa de atención completa, lo que reduce el coste de la caché KV en secuencias largas. La salida de atención incorpora puertas sigmoideas por cabeza, y los MLPs usan puerta con GELU exacto. El vocabulario de 131.072 entradas está atado con la capa de salida.

Según la model card del autor original, la arquitectura es idéntica a la del Spark-X2.5-1.7B y la mejora de capacidad proviene de un post-entrenamiento mejorado; no se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO. El modelo está entrenado como modelo de razonamiento: produce una cadena de pensamiento dentro de `<think>…</think>` antes de la respuesta, y los ficheros LiteRT-LM declaran un canal `thought` que permite al runtime separar el razonamiento de la respuesta final.

La conversión a LiteRT-LM se realizó con litert-torch 0.9.3 para LiteRT-LM 0.19.0. Los ficheros declaran activaciones GPU en fp32 y usan operaciones compuestas GPU de LiteRT-LM para las escrituras de caché KV y los productos de atención; los pesos son los de la exportación int8/int4-mlp sin modificar. El tokenizador incluido es el `tokenizer.json` original byte a byte, y la plantilla de chat renderiza de forma idéntica a la `chat_template.jinja` del proveedor en 54 combinaciones de conversación, generación, modo de pensamiento y `reasoning_effort`.

## Capacidades

- Generación de texto y razonamiento multi-paso con cadena de pensamiento explícita en `<think>…</think>`.
- Aritmética básica y problemas de matemáticas de primaria (GSM8K 80-82 puntos).
- Razonamiento de sentido común: comparación de decimales, opuestos, días de la semana, rimas.
- Traducción y respuesta a preguntas factuales breves (capitales, etc.).
- Conversación multi-turno con retención de hechos plantados en turnos anteriores.
- Control de esfuerzo de razonamiento mediante `reasoning_effort` (`low` / `high`), que reduce o amplía la longitud del pensamiento.
- Separación del canal de pensamiento y la respuesta final mediante el canal `thought` declarado en los ficheros.
- Tokenización robusta: 234 de 234 cadenas de prueba (tokens añadidos, marcadores de rol, Latin-1/Extended-A, emoji, CJK, dígitos, espacios) codificadas con los mismos ids que la librería `tokenizers`.
- No se documenta soporte de tool calling, function calling, visión, audio ni capacidades de agente en la información disponible.

## Casos de uso

- Asistente de razonamiento en el móvil sin conexión: el fichero int4-mlp se ejecuta en la GPU del Galaxy S26 a 27,4 tok/s y en la del iPhone 18 Pro a 51,4 tok/s, lo que permite un asistente conversacional local con privacidad total y sin coste de API.
- Resolución de problemas aritméticos y de sentido común en aplicaciones educativas: con 8/8 aciertos en preguntas cortas de aritmética, capitales, traducción y comparación de decimales en GPU de móvil, es adecuado para tutores de primaria que necesitan respuestas verificables y razonadas.
- Automatización de respuestas con trazabilidad del razonamiento: el canal `thought` permite registrar la cadena de pensamiento por separado de la respuesta, útil en auditoría de decisiones en asistentes de atención al cliente de baja latencia.
- Procesamiento por lotes en equipos de sobremesa: en un Mac con GPU alcanza 147-151 tok/s, suficiente para clasificación, extracción de datos y generación de resúmenes en pipelines locales sin depender de la nube.
- Conversación multi-turno con memoria de contexto corto: pasa la prueba de tres turnos (plantar un hecho, operar, recordarlo) en GPU y CPU, lo que sirve para chatbots de soporte con sesiones breves y contexto de hasta 4.096 tokens.
- Prototipado e investigación de modelos de razonamiento en el borde: al ser Apache-2.0 y ejecutable con la CLI `litert-lm` en macOS (versiones 0.15.0 a 0.19.2), permite experimentar con decodificación, cuantización y plantillas sin infraestructura de servidor.
- Aplicaciones de accesibilidad o traducción puntual en dispositivos sin conectividad: la tokenización verificada con emoji, CJK y Latin-1 Extended-A respalda el procesamiento de texto multilingüe de entrada, aunque el rendimiento por idioma no está documentado.

## Benchmarks y rendimiento

GSM8K, primeras 100 preguntas del conjunto de test, greedy, pensamiento activado, prompt 0-shot de cadena de pensamiento que pide la respuesta como `#### <número>`, 3.584 tokens de salida, una conversación por pregunta. Las filas LiteRT-LM se ejecutaron en la GPU de un Mac con la API Python de LiteRT-LM 0.19.0; la referencia con transformers en MPS.

| Configuracion | GSM8K |
|---|---|
| PyTorch bf16 (referencia) | 84 (14 sin terminar) |
| LiteRT-LM int4-mlp | 82 (21 sin terminar) |
| LiteRT-LM int8 | 80 (14 sin terminar) |

Pruebas de corrección con 8 preguntas cortas de respuesta única (aritmética, capital, traducción, comparación de decimales, opuesto, días de la semana, rima), greedy, pensamiento activado, 2.048 tokens de salida:

| Dispositivo | int4-mlp | int8 |
|---|---|---|
| Mac CPU | 8/8 | 8/8 |
| Mac GPU | 8/8 | 8/8 |
| Galaxy S26 GPU | 8/8 | 8/8 |
| Galaxy S26 CPU | no medido | 8/8 |
| Pixel 11 Pro GPU | 8/8 | 8/8 |
| Pixel 11 Pro CPU | 8/8 | 8/8 |
| iPhone 18 Pro GPU | 8/8 | 8/8 |
| iPhone 18 Pro CPU | 8/8 | 8/8 |

Con `reasoning_effort` en `low` (Mac GPU, 1.792 tokens de salida): int8 8/8 con contexto 4.096; int4-mlp 7/8 tanto con contexto 2.048 como 4.096, fallando la pregunta de la rima con la respuesta "purple".

Velocidad de decodificación (1.024 tokens de prefill, 256 generados, 2026-10-31):

| Dispositivo | int4-mlp | int8 |
|---|---|---|
| Galaxy S26 GPU | 27,4 tok/s | 25,8 tok/s |
| iPhone 18 Pro GPU | 51,4 tok/s | 51,5 tok/s |
| Mac GPU | 147,0 tok/s | 151,5 tok/s |

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 1,7 GB para el fichero int4-mlp y 1,8 GB para el int8, más las activaciones fp32 en GPU y la caché KV para 4.096 tokens.
- GPU recomendadas: GPU integradas de móviles de gama alta (Galaxy S26, Pixel 11 Pro, iPhone 18 Pro) mediante LiteRT-LM; GPU de Apple en Mac; no se documentan requisitos para A100, H100 ni RTX 4090, aunque por tamaño cabría en cualquier GPU consumer con al menos 2-3 GB de VRAM libre.
- Cabe en GPU consumer: sí, por tamaño; el formato `.litertlm` está orientado a LiteRT-LM, no a CUDA, por lo que su despliegue en RTX requiere conversión a otro formato.
- Opciones de despliegue: LiteRT-LM 0.19.0 (API Python y wheel Android en PyPI), CLI `litert-lm` en macOS (versiones 0.15.0 a 0.19.2 cargan ambos ficheros, salvo el int4-mlp en 0.15.0), build nightly de iOS CLiteRTLM 0.19.0-20261029. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 27,4 tok/s (int4-mlp) y 25,8 tok/s (int8) en Galaxy S26 GPU; 51,4 y 51,5 tok/s en iPhone 18 Pro GPU; 147,0 y 151,5 tok/s en Mac GPU. En Mac, el fichero int8 es un 3 % más rápido en GPU.
- Recomendación del autor: en teléfono, usar el fichero int4-mlp en GPU (más rápido, 130 MB más pequeño y 2 puntos más en GSM8K que el int8).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| Spark-X2.6-1.7B (int4-mlp) | 1,71B denso | 4.096 | 82 | Apache-2.0 | `.litertlm` (LiteRT-LM) |
| Spark-X2.6-1.7B (bf16, referencia) | 1,71B denso | no disponible | 84 | Apache-2.0 | PyTorch / transformers |
| Spark-X2.6-4B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de benchmarks ni especificaciones de otros modelos de tamaño similar (por ejemplo, familias de 1-2B de otros proveedores) para establecer una comparación cuantitativa adicional.

## Limitaciones y advertencias

- El contexto efectivo está limitado a 4.096 tokens por la caché KV de los ficheros LiteRT-LM; no es adecuado para documentos largos ni conversaciones extensas.
- En GSM8K deja sin terminar 21 de 100 respuestas con int4-mlp y 14 con int8 y bf16 dentro del límite de 3.584 tokens, lo que indica riesgo de respuestas truncadas en problemas de razonamiento largo.
- Con `reasoning_effort` en `low`, el fichero int4-mlp baja a 7/8 en las pruebas cortas (falla la rima con "purple"), por lo que reducir el esfuerzo de razonamiento degrada la fiabilidad.
- En CPU con el fichero int8 se observó, en uno de los prompts de forma libre probados, una respuesta que terminaba con un `</think>` literal y reescribía la respuesta; el autor recomienda usar la GPU.
- El fichero int4-mlp no carga en la CLI `litert-lm` 0.15.0 en macOS.
- No se documentan los idiomas soportados ni evaluaciones por idioma; el rendimiento multilingüe más allá de la tokenización es desconocido.
- No se documentan sesgos conocidos, tasas de alucinación ni evaluaciones de seguridad.
- Licencia Apache-2.0: permite uso comercial y modificación con atribución; no se indican restricciones adicionales.
- El formato `.litertlm` limita el despliegue al ecosistema LiteRT-LM; no hay soporte documentado para vLLM, llama.cpp, Ollama o TGI, lo que complica su integración en infraestructura de servidor convencional.
- La fecha de creación del repositorio (2026-10-31) y las fechas de las mediciones corresponden al calendario indicado en la información; verificar la vigencia de los artefactos antes de usarlos en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/Spark-X2.6-1.7B
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-1.7B
- Repositorio LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
