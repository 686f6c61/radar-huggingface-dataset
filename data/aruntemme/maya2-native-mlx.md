# aruntemme/maya2-native-mlx

## Resumen
Maya-2 Native es un modelo de texto a voz (TTS) de pesos abiertos desarrollado por Maya Research, orientado a la sintesis de habla en ingles y en once lenguas indias. El repositorio `aruntemme/maya2-native-mlx` no es el modelo original, sino un port no oficial del codigo de inferencia a MLX, el framework de Apple para ejecutar modelos en la GPU de los chips Apple Silicon. El autor del port es aruntemme y el credito del modelo corresponde integramente a Maya Research.

Este repositorio contiene unicamente codigo: carga los pesos oficiales de `maya-research/maya2-native` sin conversion ni resubida, y permite ejecutar el modelo de forma nativa en macOS sobre Apple Silicon, algo imposible con la release oficial, que requiere Linux y GPU NVIDIA (grafos CUDA y kernels Triton). El port procesa un stream de audio a la vez y reutiliza del paquete oficial `maya3` el normalizador de texto, el empaquetador de prompts, las voces y las protecciones.

La relevancia del port es practica: habilita TTS multilingue con clonacion de voz en un portatil o equipo de sobremesa Apple, con un tiempo de generacion de 0,41 s por segundo de audio en modo exacto (M4 Max) y 0,30 s en modo rapido, frente a los 0,94 s del motor PyTorch oficial sobre MPS. El backbone es Qwen3-1.7B y el decodificador de profundidad opera a 31 niveles, con codec Mimi y encoder de hablante ECAPA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone transformer Qwen3-1.7B con decodificador de profundidad de 31 niveles, codec neuronal Mimi y encoder de hablante ECAPA |
| Parametros totales | no disponible (el backbone es Qwen3-1.7B; el total del sistema no se especifica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (backbone exacto), fp16 (decodificador de profundidad), 8 bits para backbone en modo rapido; 4 bits rechazado por perdida de calidad (KL 0,32) |
| Idiomas soportados | as (assames), bn (bengali), en (ingles), gu (gujarati), hi (hindi), kn (kannada), ml (malayalam), mr (marati), or (oriya), pa (punyabi), ta (tamil), te (telugu) |
| Licencia | Apache 2.0 |
| Formato de pesos | pesos oficiales de `maya-research/maya2-native` cargados sin conversion (formato original del modelo); el repositorio contiene solo codigo Python |
| Tamano del repo | 0,0 GB (solo codigo) |
| Pesos descargados en primer uso | aproximadamente 5 GB, mas codec Mimi y encoder ECAPA |
| Plataforma | macOS sobre Apple Silicon, Python 3.10-3.12 |
| Salida de audio | 24 kHz, streaming en tramas PCM int16 de 80 ms |

## Arquitectura y entrenamiento
El sistema combina un backbone autoregresivo Qwen3-1.7B con un decodificador de profundidad de 31 niveles que genera los codigos acusticos del codec Mimi, un codec neuronal de audio. La sintesis se realiza por frames y el decodificador Mimi opera en modo streaming, produciendo tramas PCM de 80 ms a 24 kHz. La clonacion de voz se apoya en un encoder de hablante ECAPA que codifica un clip de referencia junto con su transcripcion exacta; la codificacion de referencia se ejecuta en CPU con PyTorch, mientras que la generacion corre en MLX.

El repositorio no documenta los datos de entrenamiento del modelo original (numero de tokens, composicion del dataset, uso de RLHF o DPO), por lo que esa informacion no esta disponible en la documentacion consultada. La innovacion tecnica del port es la reimplementacion en MLX del backbone con cache KV preasignada y del decodificador de profundidad en un grafo compilado por frame, con verificacion de paridad componente a componente frente al motor PyTorch original: embeddings de prompt 97-99 % identicos bit a bit, estado oculto del backbone con error dentro del ruido bf16 de PyTorch, decodificador de profundidad con error de logits de 1,4e-3 frente a fp32 y decodificador Mimi en streaming con 122 dB de SNR.

## Capacidades
- Sintesis de voz (text-to-speech) en ingles y once lenguas indias: assames, bengali, gujarati, hindi, kannada, malayalam, marati, oriya, punyabi, tamil y telugu.
- Veinte voces con nombre incluidas en la release oficial (por ejemplo Siddhant, Ritvik, Abhay, Nivedita, Kayal).
- Clonacion de voz a partir de un clip de referencia con su transcripcion exacta, con capacidad de clonar una voz y usarla en otro idioma (por ejemplo, clonacion de ingles a hindi).
- Generacion por streaming con tramas PCM int16 de 80 ms, adecuada para reproduccion en tiempo real.
- Control de generacion mediante parametros de muestreo: `seed`, `temperature`, `top_k`, `top_p`, `repetition_penalty` y `max_frames`.
- Normalizacion de texto opcional integrada desde el paquete oficial `maya3`.
- API compatible con la interfaz Python oficial `maya3.Maya3TTS` (`generate()` y `stream()` con los mismos argumentos).
- Modo rapido opcional con backbone de 8 bits y decodificador de profundidad en bf16.
- No se documentan capacidades de tool calling, agentes, vision ni audio de entrada mas alla de la referencia para clonacion.

## Casos de uso
- Audiolibros y narracion multilingue: el modelo permite generar narraciones en hindi, tamil o bengali con voces consistentes, usando las veinte voces incluidas o una voz clonada, en un Mac sin GPU dedicada.
- Locucion para contenido educativo en lenguas indias: un equipo de documentacion puede convertir articulos en audio en varias lenguas del subcontinente, aprovechando que el port funciona en Apple Silicon y no requiere infraestructura CUDA.
- Prototipado de asistentes de voz en local: el streaming de tramas de 80 ms y el tiempo hasta el primer audio de 60 ms en modo exacto permiten construir interfaces conversacionales con baja latencia inicial en un portatil.
- Doblaje y localizacion de material audiovisual: la clonacion de voz entre idiomas (por ejemplo, ingles a hindi) permite mantener la identidad vocal del locutor original en versiones localizadas, con la advertencia de obtener el consentimiento del hablante.
- Accesibilidad: lectura en voz alta de contenido en lenguas indias para usuarios con discapacidad visual, desplegada localmente en equipos Apple sin enviar texto a servicios externos.
- Desarrollo y evaluacion de pipelines TTS: el repositorio incluye scripts de paridad (`check_backbone.py`, `check_depth.py`, `check_mimi.py`, `check_variants.py`) que permiten validar implementaciones y comparar calidad entre el motor oficial y el port.
- Generacion de avisos y notificaciones habladas: el modo rapido (0,30 s por segundo de audio, 4,5 GB de memoria pico) es adecuado para sintetizar mensajes cortos en produccion sobre hardware de consumo.

## Benchmarks y rendimiento
Rendimiento medido en un M4 Max de 36 GB:

| Metrica | PyTorch oficial en MPS | Port MLX exacto | Port MLX rapido (8 bits + bf16) |
|---|---|---|---|
| Tiempo por segundo de audio | 0,94 s | 0,41 s | 0,30 s |
| Tiempo hasta el primer audio | 120 ms | 60 ms | 50 ms |
| Memoria pico | no disponible | 6,1 GB | 4,5 GB |

Tasa de error de caracteres (CER) al transcribir con Whisper large-v3-turbo, una muestra por clip, menor es mejor:

| Sistema | en | hi | ta | te | bn | kn | mr | clon en→hi |
|---|---|---|---|---|---|---|---|---|
| Motor PyTorch oficial | 0,00 | 0,15 | 0,00 | 0,13 | 0,20 | 0,13 | 0,27 | 0,07 |
| Port MLX exacto | 0,00 | 0,03 | 0,00 | 0,07 | 0,17 | 0,09 | 0,14 | 0,07 |
| Port MLX rapido | 0,00 | 0,06 | 0,04 | 0,07 | 0,22 | 0,20 | 0,11 | 0,07 |

El autor advierte que, con una sola muestra por lengua, las diferencias deben interpretarse como calidad equivalente y que la mayoria de errores restantes corresponden a la ortografia de Whisper en escrituras indicas. La carga mas el calentamiento tarda unos 3,5 s.

## Requisitos de hardware
- Plataforma obligatoria: macOS sobre Apple Silicon (probado en M4 Max de 36 GB); no funciona en Linux, Windows ni GPU NVIDIA con este port.
- Memoria: aproximadamente 6,1 GB de pico en modo exacto y 4,5 GB en modo rapido, mas los pesos de unos 5 GB descargados en el primer uso.
- GPU: cualquier chip Apple Silicon con memoria unificada suficiente; el autor solo documenta mediciones en M4 Max.
- Despliegue: paquete Python `maya2-mlx` instalado desde el repositorio (`pip install "maya2-mlx @ git+https://huggingface.co/aruntemme/maya2-native-mlx"`), que instala ademas el paquete oficial `maya3` fijado a un commit concreto.
- No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; el unico runtime es MLX.
- Latencia y throughput: 0,41 s por segundo de audio en modo exacto y 0,30 s en modo rapido; el streaming entrega tramas de 80 ms.
- Requiere Python 3.10-3.12 y un entorno virtual dedicado.

## Comparativa con modelos similares
No se dispone de datos de benchmarks de modelos TTS alternativos en la informacion proporcionada, por lo que la comparativa cuantitativa no esta disponible. A nivel cualitativo:

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Maya-2 Native (port MLX) | backbone Qwen3-1.7B, total no disponible | no disponible | en + 11 lenguas indias | Apache 2.0 | Hugging Face, codigo MLX para Apple Silicon |
| Maya-2 Native (oficial) | backbone Qwen3-1.7B, total no disponible | no disponible | en + 11 lenguas indias | Apache 2.0 | Hugging Face, requiere Linux y GPU NVIDIA |
| Alternativas TTS de pesos abiertos | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias
- El repositorio es un port no oficial: el autor no es Maya Research y no se ofrece garantia de soporte ni mantenimiento.
- Solo funciona en macOS sobre Apple Silicon; no hay soporte para CUDA, ROCm ni CPU generica en este port.
- Procesa un unico stream de audio a la vez; no se documenta batched inference ni servidor de alto throughput.
- La cuantizacion de 4 bits del backbone fue rechazada por el autor (KL 0,32), por lo que el ahorro de memoria esta limitado al modo de 8 bits.
- La clonacion de voz exige consentimiento explicito del hablante; el uso indebido puede suponer suplantacion de identidad y obligaciones legales en la UE.
- El modelo puede presentar sesgos derivados de los datos de entrenamiento originales, no documentados en la informacion disponible.
- Riesgo de alucinacion o errores de pronunciacion en nombres propios, siglas y texto no normalizado; se recomienda activar `normalize=True` y validar con transcripcion automatica.
- La calidad se evaluo con una sola muestra por lengua, por lo que las cifras de CER son orientativas y no concluyentes.
- La licencia Apache 2.0 permite uso comercial, pero el port depende del paquete oficial `maya3` fijado a un commit concreto, lo que puede generar problemas de reproducibilidad si ese commit cambia o desaparece.

## Enlaces
- Repositorio del port: https://huggingface.co/aruntemme/maya2-native-mlx
- Modelo original: https://huggingface.co/maya-research/maya2-native
- Web de Maya Research: https://mayaresearch.ai
- Codigo fuente oficial: https://github.com/MayaResearch/maya2-native
- Muestras de audio: https://huggingface.co/aruntemme/maya2-native-mlx/resolve/main/samples/en_siddhant_mlx.wav (y equivalentes para hi, ta y te)
- Resultados de paridad: `parity/results.txt` dentro del repositorio
- Parche para MPS: `patches/maya2-mps.patch` dentro del repositorio
