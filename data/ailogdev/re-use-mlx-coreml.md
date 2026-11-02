# AILogDev/RE-USE-MLX-CoreML

## Resumen

RE-USE-MLX-CoreML es un port no oficial para Apple Silicon del modelo NVIDIA RE-USE, desarrollado por AILogDev. Se trata de un modelo de mejora de voz (speech enhancement) y reduccion de ruido que procesa audio a 16 kHz en formato mono, tomando muestras Float32 finitas y devolviendo el mismo numero de muestras. El objetivo es ejecutar la mejora de audio completamente en dispositivo (on-device) en Macs e iPhones, sin depender de servicios en la nube.

El paquete combina pesos en formato MLX (safetensors) y paquetes Core ML de tipo CNN, de modo que los mismos ficheros funcionan tanto en macOS como en iOS. La arquitectura subyacente es un modelo hibrido con 30 etapas que mezcla componentes convolucionales (ejecutados via Core ML) y etapas Mamba/SSM (ejecutadas via MLX), manteniendo 16 estados recurrentes en FP32. El pack ocupa 54.206.689 bytes repartidos en 38 ficheros.

La relevancia actual radica en que permite desplegar mejora de voz de calidad en hardware de consumo Apple (desde un MacBook Air con M2 hasta un iPhone 17 Pro con A19 Pro) con factores de tiempo real (RTF) inferiores a 0,2 en Mac y proximos a 0,09 en el chip A19 Pro. Es un modelo de audio-audio offline, no un API de microfono en streaming.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: 30 etapas con CNNs (Core ML) y etapas Mamba/SSM (MLX); 16 estados recurrentes FP32 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; procesa ventanas de 5 segundos con 5% de solapamiento |
| Tipos de cuantizacion | no disponible (mezcla de FP16 en proyecciones SSM y FP32 en estado recurrente y normalizacion; FP16 en CNNs y tensores de frontera) |
| Idiomas soportados | no disponible (procesamiento de senal de audio, independiente del idioma) |
| Licencia | openmdw-1.1 (material del modelo); SDK complementario Apache-2.0 |
| Formato de pesos | safetensors (MLX) y mlpackage (Core ML) |

## Arquitectura y entrenamiento

El modelo es un port del checkpoint original de NVIDIA (revision `31f82f2efad1095034492f236e8dac9239ba713b`) convertido a MLX y Core ML sin entrenamiento adicional. La arquitectura consta de 30 etapas que operan a resolucion temporal y frecuencial completa, combinando capas convolucionales (empaquetadas como paquetes Core ML `hybrid_front_*` y `hybrid_back_*`) con etapas de tipo Mamba/SSM ejecutadas mediante MLX. El estado recurrente se mantiene en FP32 (16 estados) para preservar estabilidad numerica, mientras que las proyecciones SSM y los tensores de frontera entre CNNs y Mamba usan FP16.

El procesamiento es offline por ventanas de 5 segundos con un 5% de solapamiento, aplicando STFT, todas las etapas del modelo, iSTFT y overlap-add. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF/DPO en la informacion proporcionada. La innovacion tecnica destacable es la ejecucion hibrida: las CNNs se delegan a Core ML con `cpuAndNeuralEngine` y las etapas Mamba a MLX, con seleccion de perfil (por ejemplo `foldShared`, `foldSeparate`, `naxFullShared16`) que aplica redondeo FP16 adicional en capas lineales plegadas. La conversion a mixed precision y kernels fusionados puede introducir diferencias numericas respecto al modelo original.

## Capacidades

- Mejora de voz (speech enhancement) y reduccion de ruido en audio mono a 16 kHz.
- Procesamiento audio-a-audio preservando el numero de muestras de entrada y salida.
- Ejecucion on-device en Apple Silicon: MLX GPU puro o modo hibrido Core ML + MLX.
- Soporte de lectura de audio mono/estéreo con remuestreo a 16 kHz mediante ReuseKit.
- Exportacion de WAV en Float32.
- Integracion como SDK Swift (`ReuseKit`) con API asincrona (`engine.enhance`).
- Aplicacion de ejemplo para iPhone con importacion o grabacion de hasta cinco minutos y reproduccion comparativa en la misma posicion.
- CLI de Mac (`reuse-probe`) para benchmarks con warmup y ejecuciones medidas.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No es un modelo de streaming: el procesamiento es offline por ventanas.

## Casos de uso

- Limpieza de grabaciones de voz para podcasts o entrevistas: el modelo procesa ficheros de audio completos por ventanas de 5 segundos con solapamiento del 5%, eliminando ruido de fondo antes de la publicacion, todo localmente en un Mac.
- Transcripcion previa en pipelines de ASR: al mejorar la relacion senal-ruido antes de pasar el audio a un sistema de reconocimiento de voz, se reduce la tasa de error en entornos ruidosos; el modelo mantiene el conteo de muestras, lo que simplifica el alineamiento.
- Notas de voz en aplicaciones iOS: el ejemplo de iPhone permite grabar hasta cinco minutos, aplicar la mejora on-device y exportar WAV Float32, sin enviar audio a servidores externos.
- Reuniones y videollamadas grabadas: mejora de audio de actas o resumenes generados a posteriori, ejecutable en un MacBook Air con M2 con RTF de 0,198 (MLX) o 0,147 (hibrido).
- Preprocesado en herramientas de edicion de video en macOS: integracion via SDK Swift para limpiar pistas de voz antes de la mezcla final.
- Investigacion en procesamiento de audio: banco de pruebas para comparar perfiles de precision (FP16/FP32) y modos de ejecucion (MLX vs Core ML + MLX) con metricas objetivas como STOI y RMSE.
- Aplicaciones de accesibilidad: mejora de audio en tiempo casi real en dispositivos Apple para personas con dificultades auditivas, siempre que se acepte el caracter offline por ventanas.

## Benchmarks y rendimiento

| Dispositivo y modo | Perfil | RTF mediano |
|---|---|---|
| iPhone 17 Pro / A19 Pro, Core ML + MLX | `naxFullShared16` | 0,09480 |
| MacBook Air / M2, GPU de 8 nucleos, MLX | `foldShared` | 0,19824 |
| MacBook Air / M2, GPU de 8 nucleos, Core ML + MLX | `foldSeparate` | 0,14692 |

Mediciones realizadas en iOS/macOS 27.2 con audio mono a 16 kHz de 7,92 segundos, un warmup por perfil y cinco pares AB/BA intercalados. Los tiempos incluyen STFT, todas las etapas del modelo, iSTFT, overlap-add y finalizacion de GPU; la decodificacion de ficheros, el remuestreo, la carga del modelo, la compilacion inicial y el guardado son costes separados.

Calidad: en un par limpio/ruidoso de voz, el perfil hibrido de A19 Pro cambio el STOI de 0,94836095 a 0,94835503 respecto a `warpFast`; el perfil hibrido de M2 lo cambio de 0,94833868 a 0,94833576. El perfil plegado de M2 produjo un 2,24% adicional de RMSE relativo en un impulso sintetico. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) por tratarse de un modelo de audio.

## Requisitos de hardware

- VRAM/tamano: el pack completo son 38 ficheros y 54.206.689 bytes (aproximadamente 54 MB); el consumo de memoria en ejecucion no esta especificado en la informacion disponible.
- GPU recomendadas: Apple Silicon exclusivamente. Validado en iPhone 17 Pro (A19 Pro) y MacBook Air con M2 (GPU de 8 nucleos).
- Cabe en hardware de consumo Apple: si, en iPhone y Mac con chip de la serie M o A reciente.
- Opciones de despliegue: MLX (GPU), Core ML + MLX hibrido, SDK Swift `ReuseKit`, CLI `reuse-probe`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este modelo de audio).
- Entorno de compilacion validado: Xcode 27.2 / Swift 6.4.2 con Metal Toolchain.
- Latencia y throughput: RTF de 0,0948 en A19 Pro, 0,147 en M2 hibrido y 0,198 en M2 MLX; es decir, entre 5 y 10 veces mas rapido que tiempo real en los dispositivos medidos.
- El rendimiento depende de la temperatura del dispositivo, la duracion de la entrada y el estado de energia.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto/ventana | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RE-USE-MLX-CoreML (este) | Mejora de voz hibrida MLX/Core ML | no disponible | Ventanas de 5 s | openmdw-1.1 | HuggingFace, on-device Apple |
| NVIDIA RE-USE (original) | Mejora de voz | no disponible | no disponible | openmdw-1.1 | HuggingFace (nvidia/NVIDIA-NemotronLabs-RE-USE) |
| Alternativas de reduccion de ruido en Apple Silicon | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con otros modelos de mejora de voz en la informacion proporcionada. La unica comparacion directa posible es con el modelo base de NVIDIA, del cual este es una conversion sin entrenamiento adicional.

## Limitaciones y advertencias

- Modelo de audio, no de lenguaje: no soporta razonamiento, codigo, matematicas, vision ni tool calling.
- Procesamiento offline por ventanas de 5 segundos: no es un API de microfono en streaming.
- Solo audio mono a 16 kHz en Float32; el SDK remuestrea, pero la entrada al modelo debe cumplir ese formato.
- Diferencias numericas por mixed precision y kernels fusionados respecto al checkpoint original de NVIDIA.
- El perfil plegado de M2 introduce un 2,24% adicional de RMSE relativo en un impulso sintetico; las diferencias de forma de onda dependen de la entrada y no equivalen a una degradacion perceptual porcentual.
- Rendimiento variable segun temperatura, duracion de entrada y estado de energia del dispositivo.
- Licencia OpenMDW-1.1: es necesario preservar la licencia y los avisos de copyright/origen al redistribuir; conviene revisar los terminos completos para uso comercial.
- El SDK y las muestras originales son Apache-2.0; otros componentes incluidos conservan sus propios terminos.
- No se dispone de informacion sobre sesgos, tasas de alucinacion (no aplica) ni cobertura linguistica.
- Para repositorios privados, el token de Hugging Face se pasa via `REUSE_HF_TOKEN`; no debe guardarse en ficheros de codigo ni recursos de la app.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AILogDev/RE-USE-MLX-CoreML
- Modelo base NVIDIA: https://huggingface.co/nvidia/NVIDIA-NemotronLabs-RE-USE
- Repositorio GitHub del SDK: https://github.com/Corvelis/RE-USE-MLX-CoreML
- Paquete SDK: https://huggingface.co/AILogDev/RE-USE-MLX-CoreML/resolve/main/ReuseKit.zip
