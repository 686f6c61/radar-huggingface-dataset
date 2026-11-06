# Miyauel/qwentts-cpp-win64

## Resumen

`Miyauel/qwentts-cpp-win64` no es un modelo de lenguaje en sentido estricto, sino una distribucion binaria para Windows x86-64 del motor de inferencia `qwentts.cpp`, un port a ggml del runtime de sintesis de voz Qwen3-TTS. El repositorio empaqueta el ejecutable `qwen-tts.exe` junto con las DLL de runtime de Microsoft C++ y OpenMP, de modo que pueda ejecutarse en una maquina Windows limpia sin instalar Visual Studio ni PyTorch. El autor lo publica como componente del proyecto Meari, una aplicacion que lo utiliza como backend de voz.

El motor esta pensado para ejecutar el modelo Qwen3-TTS 1.7B en su variante VoiceDesign, que permite generar una voz nueva a partir de una descripcion textual en lugar de clonar una muestra de audio existente. Los pesos no se incluyen en este repositorio (que ocupa 0.0 GB): se distribuyen por separado en formato GGUF bajo licencia Apache-2.0 en el repositorio `Serveurperso/Qwen3-TTS-GGUF`. Este paquete solo contiene el codigo compilado del motor.

Su relevancia es practica: permite desplegar TTS de Qwen3 en CPU, sin GPU y sin el stack de PyTorch, con seleccion dinamica del backend ggml optimizado para la microarquitectura x86-64 del equipo en tiempo de ejecucion. Es util para integraciones de escritorio, entornos sin acelerador y pipelines donde el coste de instalar CUDA o PyTorch no esta justificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Motor de inferencia ggml (C/C++) para el modelo Qwen3-TTS 1.7B VoiceDesign; no es un modelo en si |
| Parametros totales | 1.7B (del modelo Qwen3-TTS que ejecuta, no incluido en el repo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (depende de los GGUF publicados en `Serveurperso/Qwen3-TTS-GGUF`) |
| Idiomas soportados | no disponible |
| Licencia | MIT (motor qwentts.cpp y ggml); pesos del modelo bajo Apache-2.0 |
| Formato de pesos | GGUF (cargados en tiempo de ejecucion; no incluidos en el repositorio) |

## Arquitectura y entrenamiento

El repositorio contiene unicamente artefactos de compilacion, no pesos ni codigo fuente del modelo. El motor `qwentts.cpp` deriva de `ServeurpersoCom/qwentts.cpp` en el commit `5916bf7c79dbb4e66fc059cdc507a79a23a28bb4`, sobre ggml `cc5df49a`, e incorpora un parche de tres lineas (`threads.patch`) que lee el numero de hilos de CPU de la variable de entorno `QWENTTS_N_THREADS`, permitiendo al proceso anfitrion limitar el uso de CPU. La compilacion activa `GGML_CPU_ALL_VARIANTS` y `GGML_BACKEND_DL`, de forma que `qwen-tts.exe` selecciona en tiempo de ejecucion la DLL `ggml-cpu-*.dll` mas adecuada para la maquina.

El modelo subyacente, Qwen3-TTS 1.7B VoiceDesign, es un sistema de sintesis de voz condicionado por descripcion textual. No se dispone en la informacion proporcionada de detalles sobre arquitectura interna del modelo (tipo de decoder, tokenizer de audio, datos de entrenamiento, numero de tokens o uso de RLHF/DPO). El motor es exclusivamente CPU: no hay backend CUDA, Metal ni Vulkan en esta distribucion.

## Capacidades

- Sintesis de voz (text-to-speech) mediante el modelo Qwen3-TTS 1.7B VoiceDesign.
- Diseno de voz a partir de una descripcion textual ("make a new voice from a description"), sin necesidad de una muestra de referencia.
- Ejecucion en CPU pura, sin PyTorch ni dependencias de GPU.
- Seleccion automatica del kernel ggml optimizado para la CPU del equipo en tiempo de ejecucion.
- Control del numero de hilos de CPU mediante la variable de entorno `QWENTTS_N_THREADS`.
- Distribucion autocontenida: incluye las DLL de runtime de Microsoft C++ y OpenMP (Visual Studio 2022 redistributable).
- No se documentan capacidades de tool calling, agentes, vision ni audio de entrada.

## Casos de uso

- Integracion en aplicaciones de escritorio Windows: el paquete incluye todas las dependencias de runtime, por lo que puede distribuirse con una app .NET, Electron o nativa sin exigir al usuario instalar Visual Studio ni PyTorch.
- Backend de voz para asistentes locales: el control de hilos via `QWENTTS_N_THREADS` permite acotar el consumo de CPU cuando el asistente comparte maquina con otras tareas.
- Generacion de voces personalizadas en herramientas de creacion de contenido: la variante VoiceDesign permite definir un timbre a partir de una descripcion en lugar de gestionar muestras de audio de referencia.
- Servidores sin GPU: en entornos virtualizados o equipos de oficina sin acelerador, el motor CPU-only evita el coste y la complejidad de CUDA.
- Pruebas y desarrollo offline: al no requerir descarga de frameworks pesados, simplifica la puesta en marcha de entornos de test de sintesis de voz.
- Empaquetado en instaladores corporativos: la inclusion de las DLL de Visual C++ 2022 reduce los fallos de despliegue por dependencias ausentes en equipos gestionados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Plataforma: Windows x86-64 exclusivamente (build `win64`, CPU only).
- VRAM: no aplica; el motor no usa GPU.
- RAM: no disponible en la informacion proporcionada; depende del tamano del GGUF de Qwen3-TTS 1.7B cargado y del contexto de audio.
- GPU recomendadas: ninguna; no hay backend CUDA, Metal ni Vulkan en esta distribucion.
- CPU: cualquier x86-64; el binario selecciona la variante ggml optimizada (`GGML_CPU_ALL_VARIANTS`) segun la microarquitectura detectada.
- Hilos: configurables mediante `QWENTTS_N_THREADS`.
- Opciones de despliegue: ejecutable `qwen-tts.exe` invocado directamente o desde la aplicacion Meari; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Aspecto | qwentts-cpp-win64 (este repo) | qwentts.cpp original | Qwen3-TTS 1.7B VoiceDesign (pesos) |
|---|---|---|---|
| Tipo | Binario precompilado para Windows | Codigo fuente del motor | Modelo de sintesis de voz |
| Parametros | no aplica (motor) | no aplica (motor) | 1.7B |
| Plataforma | Windows x86-64, CPU | Multiplataforma (compilable) | Depende del runtime |
| Licencia | MIT (+ Apache-2.0 en pesos) | MIT | Apache-2.0 |
| Pesos incluidos | No | No | Si (GGUF) |
| Modificaciones | `threads.patch` para `QWENTTS_N_THREADS` | Base sin parche | no aplica |

No se dispone de informacion sobre otros motores TTS comparables (por ejemplo, variantes de Kokoro, Piper o XTTS) en la documentacion proporcionada, por lo que no se incluye comparacion de rendimiento.

## Limitaciones y advertencias

- No es un modelo: es un binario de motor. Quien lo descargue sin los GGUF de `Serveurperso/Qwen3-TTS-GGUF` no podra sintetizar voz.
- Solo Windows x86-64: no hay builds para Linux, macOS ni ARM en este repositorio.
- Solo CPU: sin aceleracion GPU, la latencia en equipos modestos puede ser alta; no se publican cifras.
- El parche `threads.patch` es una modificacion local del autor; conviene revisarlo si se audita la cadena de suministro del binario.
- Los ejecutables precompilados no permiten verificar de forma trivial que corresponden al commit declarado; para entornos sensibles es preferible compilar desde `ServeurpersoCom/qwentts.cpp` con el script `engine/tools/qwentts/build.ps1`.
- Riesgo de sesgos y alucinacion acustica: no se documentan evaluaciones de calidad, sesgos de voz ni comportamiento en idiomas distintos del entrenado.
- La licencia MIT cubre el motor y ggml; el uso comercial de las voces generadas queda sujeto a la licencia Apache-2.0 de los pesos y a la legislacion aplicable sobre sintesis de voz.
- Sin datos de benchmarks, no es posible comparar su calidad con alternativas comerciales o academicas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Miyauel/qwentts-cpp-win64
- Motor original qwentts.cpp: https://github.com/ServeurpersoCom/qwentts.cpp
- Aplicacion Meari: https://github.com/Miyauel/Meari
- Pesos GGUF de Qwen3-TTS: https://huggingface.co/Serveurperso/Qwen3-TTS-GGUF
- Commit del motor empaquetado: `ServeurpersoCom/qwentts.cpp@5916bf7c79dbb4e66fc059cdc507a79a23a28bb4` (ggml `cc5df49a`)
