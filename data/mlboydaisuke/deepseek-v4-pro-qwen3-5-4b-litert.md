# mlboydaisuke/DeepSeek-V4-Pro-Qwen3.5-4B-LiteRT

## Resumen

DeepSeek-V4-Pro-Qwen3.5-4B-LiteRT es una conversión al formato LiteRT-LM del checkpoint Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B, un modelo de razonamiento de aproximadamente 4.000 millones de parámetros destilado de DeepSeek-V4-Pro en lo que el autor original denomina "Max Effect mode". La conversión la firma el usuario mlboydaisuke y su objetivo es empaquetar todo el modelo en un único fichero `.litertlm` con pesos mayoritariamente int8, pensado para inferencia en dispositivo (on-device) sobre Android y macOS mediante la librería litert-lm de Google AI Edge.

El interés de esta ficha no está en la calidad del modelo base, sino en la viabilidad práctica de ejecutar un modelo de razonamiento de 4B en hardware móvil. El autor documenta métricas concretas: 9,16 tok/s de decodificación en CPU de un Galaxy S26 (XNNPACK), 83,55 tok/s de prefill para 1.024 tokens, 12,36 s hasta el primer token y un pico de memoria residente de 6,45 GB. En la GPU de un Pixel 11 Pro el modelo llegó a consumir hasta 6,96 GB de memoria disponible del dispositivo.

La relevancia es doble. Por un lado, demuestra que un transformer híbrido con capas Gated DeltaNet puede cuantizarse a int8 y desplegarse en un teléfono de gama alta actual, con una calidad en GSM8K (92/100 en el split de test) idéntica a la del modelo bf16 original. Por otro, expone con inusual franqueza las limitaciones del ecosistema: incompatibilidades de versión de LiteRT-LM, kernels GPU que fallan con determinadas formas de tensor y un contexto de solo 4.096 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con capas Gated DeltaNet (según tags del autor: `hybrid`, `gated-deltanet`) |
| Parametros totales | ~4B (modelo base de 4.000 millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | Pesos mayoritariamente int8 (fichero único `.litertlm`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | LiteRT-LM (`.litertlm`), 4.367.794.176 bytes |
| Libreria | litert-lm (LiteRT-LM 0.19.x) |
| Entrada multimodal | Solo texto (la conversión omite la parte de imagen del checkpoint original) |
| Tamano del repo | 4,4 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer híbrido que combina capas de atención con capas Gated DeltaNet, una variante de atención lineal con estado recurrente que reduce el coste de cómputo en secuencias largas y facilita el despliegue en hardware con memoria limitada. Los tags del repositorio (`hybrid`, `gated-deltanet`, `qwen3_5`) sugieren que la arquitectura deriva de la familia Qwen3.5, aunque no se detalla la proporción exacta de capas de atención completa frente a capas DeltaNet ni la dimensión oculta.

El entrenamiento del checkpoint original consistió, según la model card del autor citada, en una destilación de DeepSeek-V4-Pro en modo "Max Effect". No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. La conversión a LiteRT-LM se realizó con `litert-torch` para la versión 0.19.x de la librería, manteniendo únicamente la torre de texto del checkpoint. El modelo incorpora un modo de razonamiento activado por defecto: genera un bloque de pensamiento delimitado por `[thought]` y `[/thought]` antes de la respuesta final.

## Capacidades

- Generación de texto y razonamiento multi-paso con modo de pensamiento activado por defecto.
- Razonamiento matemático: resuelve problemas de aritmética y de enunciado tipo GSM8K con un 92 % de acierto en las primeras 100 preguntas del split de test.
- Razonamiento previo a la respuesta visible, con traza de pensamiento separada de la salida final.
- Conversaciones multi-turno: verificado con una prueba de recuerdo de nombre a lo largo de tres turnos.
- Ejecución en dispositivo sin conexión: el fichero se descarga una vez y se ejecuta localmente con el CLI de litert-lm.
- Soporte de tool calling: la model card advierte que las versiones de LiteRT-LM anteriores a 0.19.0 devuelven las llamadas a herramientas de Qwen3.5 como texto plano, lo que implica que a partir de 0.19.0 sí se interpretan correctamente.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Visión: no soportada en esta conversión (solo se incluye la parte de texto).
- Audio: no disponible.

## Casos de uso

- Asistente de razonamiento offline en Android: el modelo cabe en un teléfono de gama alta (pico de 6,45 GB en CPU) y funciona sin red, lo que permite asistentes personales con privacidad total de datos en dispositivos con 12 GB o más de RAM.
- Resolución de problemas matemáticos en aplicaciones educativas: con 92/100 en GSM8K y modo de pensamiento, es adecuado para tutores de matemáticas de primaria y secundaria que necesiten mostrar el razonamiento paso a paso al estudiante.
- Automatización de tareas en el borde con tool calling: integrado en un agente móvil que invoque APIs locales (calendario, contactos, ficheros) mediante function calling, siempre que se use LiteRT-LM 0.19.0 o superior.
- Procesamiento de documentos cortos en local: con 4.096 tokens de contexto puede resumir correos, notas o fragmentos de menos de 3.000 palabras sin enviar datos a la nube.
- Prototipado de aplicaciones edge con LiteRT: sirve como banco de pruebas para desarrolladores que quieran validar pipelines de litert-torch y litert-lm antes de invertir en modelos mayores o en hardware dedicado.
- Evaluación comparativa de cuantización int8: útil para investigadores que midan la degradación de calidad de la cuantización int8 frente al bf16 original; el autor documenta paridad exacta en GSM8K (92 aciertos en ambos).
- Chatbot de soporte en kioscos o dispositivos empotrados: con 9,16 tok/s de decodificación en CPU de móvil, es viable para respuestas cortas en terminales sin GPU dedicada.

## Benchmarks y rendimiento

Calidad en GSM8K (primeras 100 preguntas del split de test, decodificación greedy, pensamiento activado, máximo 3.584 tokens de salida):

| Modelo | Ejecución | Aciertos / 100 |
|---|---|---|
| Este fichero (int8, LiteRT-LM) | Mac GPU, LiteRT-LM 0.19.2 | 92 |
| Modelo original (bf16) | MLX-LM 0.31.3 | 92 |
| Ambos correctos | — | 89 |
| Solo este fichero correcto | — | 3 |
| Solo el original correcto | — | 3 |

De los 8 fallos de este fichero, 6 agotaron el límite de tokens mientras seguían en el bloque de pensamiento.

Rendimiento en Galaxy S26 (SM-S942Q, Android 16), CPU con XNNPACK, LiteRT-LM v0.19.0, prefill de 1.024 tokens y decodificación de 256 tokens:

| Metrica | Valor |
|---|---|
| Prefill | 83,55 tok/s |
| Decodificacion | 9,16 tok/s |
| Tiempo hasta el primer token | 12,36 s |
| Memoria pico residente | 6,45 GB |

Mediana de tres lanzamientos nuevos; la memoria pico es el máximo de los tres.

## Requisitos de hardware

- VRAM/RAM estimada: el fichero pesa 4,37 GB; el pico de memoria residente medido en CPU de Galaxy S26 fue de 6,45 GB, y en la GPU del Pixel 11 Pro la memoria disponible del dispositivo cayó hasta 6,96 GB.
- GPU recomendadas: no se han validado GPU de escritorio dedicadas; las pruebas se hicieron en GPU integrada de Apple M4 Max y en GPU móvil de Pixel 11 Pro.
- Cabe en GPU de consumo: no confirmado. El autor indica que no se espera que quepa en la GPU de un teléfono de 8 GB de RAM.
- Móviles verificados: Pixel 11 Pro (GPU, Android 17), Galaxy S26 (CPU, Android 16). No verificado en iPhone/iOS, ni en dispositivos con GPU Mali, ni en teléfonos de 8 GB.
- Despliegue: CLI `litert-lm` (versiones 0.19.0 a 0.19.2), binario Android `litert_lm_main` y `litert_lm_advanced_main`. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 12,36 s hasta el primer token y 9,16 tok/s de decodificación en CPU de Galaxy S26; velocidad en GPU móvil no cuantificada en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4-Pro-Qwen3.5-4B-LiteRT (este) | ~4B | 4.096 | LiteRT-LM int8, on-device | Apache 2.0 | GSM8K 92/100; 9,16 tok/s en CPU de movil |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B (original) | ~4B | no disponible | Safetensors bf16, MLX-LM | no disponible | GSM8K 92/100; incluye torre de visión |
| Qwen3.5-4B (referencia de familia) | ~4B | no disponible | Multiples | no disponible | Arquitectura base citada en los tags; datos no verificados en esta ficha |

No se dispone de datos de benchmarks ni de especificaciones verificadas de otras alternativas on-device comparables en la información proporcionada.

## Limitaciones y advertencias

- Contexto muy corto: 4.096 tokens, insuficiente para documentos largos, conversaciones extensas o bases de código.
- Sin visión: la conversión elimina la torre de imagen del checkpoint original, por lo que no acepta entradas de imagen pese a que el modelo base pudiera soportarlas.
- Sensibilidad a la versión de LiteRT-LM: la nightly 0.20.0.dev20261112 falla en GPU porque el estado de convolución corta se almacena en formato channels-first (`[1, 8192, 3]`) y el kernel GPU solo acepta channels-last. Usar exclusivamente 0.19.0 a 0.19.2.
- Versiones anteriores defectuosas: LiteRT-LM 0.18.1 en GPU de Mac genera un pensamiento de 4.074 caracteres `!` sin respuesta; las versiones previas a 0.19.0 devuelven las llamadas a herramientas como texto plano.
- Fallo conocido en Android: las builds 0.18.0 y 0.18.1 pueden provocar SIGSEGV en GPU de Pixel 8a con ficheros que almacenan pesos en una sección TFLiteWeights separada, como este.
- GPU de Galaxy S26 no validada: un fichero Qwen3.5-4B int8 reinició el teléfono en un intento con GPU el 2026-08-24; usar CPU en ese dispositivo.
- Memoria: no se espera que quepa en la GPU de un teléfono de 8 GB; requiere dispositivos de gama alta con 12 GB o más.
- Token de pensamiento: 6 de los 8 fallos en GSM8K se debieron a agotar el límite de tokens mientras el modelo seguía razonando, lo que puede producir respuestas vacías si se limita la salida.
- Artefacto de generación: el pensamiento suele terminar con los tokens `Paris.cw` en la pregunta de prueba, comportamiento heredado del modelo original en decodificación greedy.
- Idiomas soportados no documentados: no hay garantía de calidad fuera del inglés.
- Sesgos y alucinaciones: no documentados por el autor; aplican los riesgos habituales de un modelo destilado de 4B sin evaluación de seguridad publicada.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base declara licencia "no disponible" en la información consultada, por lo que conviene verificar la cadena de licencias antes de un despliegue comercial.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mlboydaisuke/DeepSeek-V4-Pro-Qwen3.5-4B-LiteRT
- Fichero de pesos: https://huggingface.co/mlboydaisuke/DeepSeek-V4-Pro-Qwen3.5-4B-LiteRT/blob/main/DeepSeek-V4-Pro-Qwen3.5-4B_int8_gpu_composite_v0190.litertlm
- Registro de verificaciones: https://huggingface.co/mlboydaisuke/DeepSeek-V4-Pro-Qwen3.5-4B-LiteRT/blob/main/checks.md
- Modelo base: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B
- LiteRT-LM (Google AI Edge): https://github.com/google-ai-edge/LiteRT-LM
- Commit de la build Android usada: https://github.com/google-ai-edge/LiteRT-LM/commit/771b06e1a2c7f70a399a718599109facf37e38fd
- Pull request de LiteRT sobre formato channels-last: https://github.com/google-ai-edge/LiteRT/pull/11565
- Issue de LiteRT-LM sobre SIGSEGV en Pixel 8a: https://github.com/google-ai-edge/LiteRT-LM/issues/3986
- uv (gestor de paquetes usado en los comandos): https://github.com/astral-sh/uv
