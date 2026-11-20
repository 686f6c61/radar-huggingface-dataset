# AILogDev/RE-USE-MLX-CoreML

## Resumen

RE-USE-MLX-CoreML es un port no oficial a Apple Silicon del modelo NVIDIA NemotronLabs RE-USE, un sistema de mejora de voz (speech enhancement) y reduccion de ruido que opera directamente sobre la forma de onda de audio. Lo publica AILogDev y toma como base la revision `31f82f2efad1095034492f236e8dac9239ba713b` del repositorio `nvidia/NVIDIA-NemotronLabs-RE-USE`. El objetivo es ejecutar el modelo en local en Macs e iPhones, sin depender de servidores, mediante dos runtimes: MLX (GPU de Apple) y Core ML (CPU + Neural Engine).

El modelo original de NVIDIA usa una arquitectura hibrida de 30 etapas que combina capas convolucionales (CNN) con etapas tipo Mamba/SSM y mantiene 16 estados recurrentes en FP32. La entrada y la salida son audio mono a 16 kHz con el mismo numero de muestras, procesado offline en ventanas de 5 segundos con un 5 % de solape. El pack de pesos ocupa 54.206.689 bytes repartidos en 38 ficheros, lo que lo hace adecuado para despliegue en dispositivo.

La relevancia actual esta en dos frentes: por un lado, la licencia OpenMDW-1.1 permite uso comercial, a diferencia de la release anterior `nvidia/RE-USE` (NSCLv1, solo no comercial); por otro, el port demuestra que un modelo de mejora de voz de calidad puede correr en hardware de consumo Apple con factores RTF por debajo de 0,2 en un M2 y por debajo de 0,1 en un A19 Pro. El repo acumula 1.088 descargas desde su publicacion el 2 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida CNN + etapas Mamba/SSM, 30 etapas, 16 estados recurrentes FP32 |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (procesado offline en ventanas de 5 s con 5 % de solape) |
| Tipos de cuantizacion | FP32 (estados recurrentes y normalizacion), FP16 (proyecciones SSM, CNN y tensores de frontera), BF16 (proteccion frente a overflow de scan en GPUs compatibles); perfil `foldSeparate` con redondeo FP16 adicional |
| Idiomas soportados | no disponible (modelo de audio, no de texto) |
| Licencia | OpenMDW-1.1 (uso comercial permitido sujeto a los terminos) |
| Formato de pesos | MLX (safetensors) y Core ML (paquetes `.mlpackage`); pack de 38 ficheros, 54.206.689 bytes |

## Arquitectura y entrenamiento

El modelo conserva las 30 etapas del RE-USE original de NVIDIA y los 16 estados recurrentes, sin entrenamiento adicional: la conversion solo cambia el formato y la precision. La arquitectura combina capas convolucionales, que en el modo hibrido se delegan a Core ML con `cpuAndNeuralEngine`, con etapas de tipo Mamba/SSM que se ejecutan en MLX. Las proyecciones SSM usan FP16, mientras que el estado recurrente y las normalizaciones se mantienen en FP32 para preservar estabilidad numerica.

El pipeline de inferencia trabaja sobre audio mono a 16 kHz en Float32 finito, con procesado offline por ventanas de 5 segundos y 5 % de solape, aplicando STFT, todas las etapas del modelo, iSTFT y overlap-add. La documentacion advierte que la precision mixta y los kernels fusionados introducen diferencias numericas respecto al checkpoint original. El perfil recomendado selecciona una implementacion de GPU soportada y protege audio disperso frente a overflow de scan usando BF16 cuando la GPU lo permite, con fallback a FP32 si aparecen resultados nonfinite. Los perfiles `foldShared` y `foldSeparate` del M2 son opciones explicitas con redondeo adicional.

No se dispone de informacion sobre el volumen de datos de entrenamiento, composicion del dataset ni si el modelo original paso por RLHF o DPO; esos datos corresponden a NVIDIA y no se detallan en la informacion proporcionada.

## Capacidades

- Mejora de voz y reduccion de ruido sobre audio mono a 16 kHz, preservando el numero de muestras de la entrada.
- Procesado offline por ventanas de 5 segundos con 5 % de solape, con reconstruccion mediante overlap-add.
- Ejecucion en dispositivo en Apple Silicon mediante dos modos: MLX GPU (modelo completo en GPU) e hibrido Core ML + MLX (CNN en Neural Engine, SSM en MLX).
- Lectura de audio mono y estereo con remuestreo a 16 kHz a cargo de ReuseKit.
- Exportacion de audio mejorado en WAV Float32 y, en la app de ejemplo para iPhone, en MOV con audio mejorado.
- Reproduccion comparativa en la misma posicion entre audio original y mejorado (app de ejemplo).
- SDK Swift (`ReuseKit`) con API asincrona (`ReuseEngine.enhance`), cache de modelos y descarga offline.
- Gestion de repositorios privados mediante token de Hugging Face pasado por variable de entorno `REUSE_HF_TOKEN`, sin persistencia del token.
- No se documentan capacidades de tool calling, agentes, vision, audio-texto ni modos de razonamiento: es exclusivamente un modelo audio-a-audio.

## Casos de uso

- Limpieza de grabaciones de voz en apps de iOS: la app de ejemplo permite importar audio o video, grabar hasta cinco minutos y exportar el resultado mejorado en WAV Float32 o MOV, usando el modo hibrido para aprovechar el Neural Engine del iPhone.
- Transcripcion previa a ASR en pipelines de subtitulado: aplicar el modelo antes de un reconocedor de voz reduce ruido de fondo manteniendo el recuento de muestras, de modo que los timestamps del ASR siguen alineados con el audio original.
- Herramientas de podcast y locucion en macOS: un CLI Swift (`reuse-probe`) procesa ficheros WAV con el perfil MLX o hibrido y genera WAV y JSON de metricas, integrable en scripts de postproduccion.
- Videollamadas y notas de voz en dispositivo: al ejecutarse en local sin servidor, el audio no sale del dispositivo, lo que encaja con requisitos de privacidad en entornos corporativos o sanitarios.
- Preprocesado de datasets de audio para entrenamiento: al ser un modelo con licencia comercial OpenMDW-1.1, puede usarse para limpiar corpus antes de alimentar otros sistemas, siempre con las obligatorias notices de copyright.
- Edicion de video en iPhone: la exportacion MOV con audio mejorado permite sustituir la pista original de un clip grabado en condiciones ruidosas sin salir del telefono.
- Evaluacion de calidad de mejora de voz: el SDK permite comparar perfiles (`foldShared`, `foldSeparate`, `naxFullShared16`) midiendo RTF y diferencias de STOI/RMSE sobre pares limpio/ruidoso, util para calibrar despliegues.

## Benchmarks y rendimiento

| Dispositivo y modo | Perfil | RTF mediana |
|---|---|---:|
| iPhone 17 Pro / A19 Pro, Core ML + MLX | `naxFullShared16` | 0,09480 |
| MacBook Air / M2, GPU de 8 nucleos, MLX | `foldShared` | 0,19824 |
| MacBook Air / M2, GPU de 8 nucleos, Core ML + MLX | `foldSeparate` | 0,14692 |

Medido en iOS/macOS 27.2 con audio mono a 16 kHz de 7,92 segundos, un warmup por perfil y cinco pares intercalados AB/BA. Los tiempos incluyen STFT, todas las etapas, iSTFT, overlap-add y finalizacion de GPU; decodificacion de fichero, remuestreo, carga de modelo, compilacion inicial y guardado son costes aparte.

Calidad: en un par limpio/ruidoso, el perfil hibrido de A19 Pro cambio STOI de 0,94836095 a 0,94835503 frente a `warpFast`; el perfil hibrido de M2 lo cambio de 0,94833868 a 0,94833576. El perfil `foldSeparate` del M2 produjo un 2,24 % adicional de RMSE relativo sobre un impulso sintetico. No se publican resultados de benchmarks estandar de mejora de voz (PESQ, DNSMOS, etc.) en la informacion disponible.

## Requisitos de hardware

- Hardware objetivo: Apple Silicon (Macs con M1/M2 y posteriores, iPhone con A19 Pro y equivalentes). No se documenta soporte para GPU NVIDIA, AMD o CPU x86.
- VRAM equivalente: el pack completo son 54.206.689 bytes en 38 ficheros; el consumo real de memoria unificada no se detalla, pero al usar FP16 en proyecciones y CNN y FP32 en estados recurrentes es compatible con dispositivos de 8 GB o menos.
- GPU recomendadas: GPU integrada de Apple Silicon. En M2 de 8 nucleos se obtiene RTF de 0,19824 en modo MLX puro y 0,14692 en hibrido; en A19 Pro, 0,09480.
- Cabera en GPU de consumo: si, en Macs con Apple Silicon y en iPhones compatibles; no aplica a RTX 4090, A100 o H100 porque no hay runtime publicado para esas plataformas.
- Despliegue: MLX y Core ML via Swift Package `ReuseKit`; CLI `reuse-probe`; app de ejemplo para iPhone. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: con RTF 0,09480 en A19 Pro, 7,92 s de audio se procesan en aproximadamente 0,75 s; en M2 con `foldSeparate`, aproximadamente 1,16 s. La temperatura del dispositivo, la duracion de entrada y el estado de energia afectan el rendimiento.
- Entorno de compilacion validado: Xcode 27.2 / Swift 6.4.2 con Metal Toolchain. Core ML compila sus paquetes en cada dispositivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| AILogDev/RE-USE-MLX-CoreML | no disponible | ventanas de 5 s con 5 % solape | OpenMDW-1.1 | MLX + Core ML, Apple Silicon | Port on-device con SDK Swift; RTF 0,09480 en A19 Pro |
| nvidia/NVIDIA-NemotronLabs-RE-USE | no disponible | no disponible | OpenMDW-1.1 | pesos NVIDIA (checkpoint original) | Modelo base del port; uso comercial permitido |
| nvidia/RE-USE (release anterior) | no disponible | no disponible | NSCLv1 | pesos NVIDIA | Uso comercial no permitido; version previa del mismo modelo |

No se dispone de informacion sobre alternativas de otros fabricantes (Denoiser, DeepFilterNet, RNNoise, etc.) en el material proporcionado, por lo que no se comparan parametros ni rendimiento frente a ellas.

## Limitaciones y advertencias

- Es un port no oficial: la conversion no incluyo entrenamiento adicional y la precision mixta y los kernels fusionados introducen diferencias numericas respecto al checkpoint de NVIDIA.
- Solo procesa audio mono a 16 kHz con muestras Float32 finitas; ReuseKit remuestrea estereo a mono, pero el modelo no maneja otras frecuencias de forma nativa.
- El procesado es offline por ventanas de 5 segundos con 5 % de solape: no esta pensado para streaming en tiempo real con latencia minimamente baja.
- La arquitectura y los pesos son de NVIDIA; los sesgos del modelo original (posible sobre supresion de voz, artefactos en audio musical o ruido no estacionario) no se documentan en esta ficha.
- Riesgo de artefactos de mejora: la documentacion solo reporta diferencias de STOI en un unico par limpio/ruidoso; no hay evaluacion publicada con PESQ, DNSMOS ni corpus amplios.
- La licencia OpenMDW-1.1 permite uso comercial, pero obliga a incluir la licencia completa y las notices de copyright/origen al redistribuir materiales del modelo; el codigo del SDK y la grabacion de ejemplo son Apache-2.0.
- El token de Hugging Face para repos privados se pasa por variable de entorno y no se guarda, pero la documentacion advierte de mantener credenciales fuera de ficheros de codigo y recursos de la app.
- La compilacion de Core ML se realiza en cada dispositivo; el primer arranque tiene coste de compilacion no incluido en las cifras de RTF.
- No hay soporte publicado para GPU NVIDIA, AMD ni CPU x86; el modelo no es portable fuera del ecosistema Apple con los artefactos incluidos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AILogDev/RE-USE-MLX-CoreML
- Repositorio GitHub del SDK y ejemplos: https://github.com/Corvelis/RE-USE-MLX-CoreML
- Paquete ReuseKit (SDK, app de iPhone, CLI, tests, documentacion): https://huggingface.co/AILogDev/RE-USE-MLX-CoreML/resolve/main/ReuseKit.zip
- Licencia completa del modelo: https://huggingface.co/AILogDev/RE-USE-MLX-CoreML/blob/main/LICENSE
- Modelo base de NVIDIA: https://huggingface.co/nvidia/NVIDIA-NemotronLabs-RE-USE
- Release anterior de NVIDIA (NSCLv1): https://huggingface.co/nvidia/RE-USE
