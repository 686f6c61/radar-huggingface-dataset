# Koptev/mossformer2-se-48k-coreml

## Resumen

MossFormer2_SE_48K Core ML es una conversión a Core ML del modelo de mejora de voz MossFormer2_SE_48K desarrollado por Alibaba SLAB dentro del proyecto ClearerVoice-Studio. El modelo original es una red de enmascaramiento espectral que estima una máscara sobre la magnitud STFT para separar voz limpia de ruido de fondo. Esta versión, publicada por el usuario Koptev, empaqueta únicamente la red de máscaras como un ML Program de Core ML con precisión mixta (fp16 mayoritario y fp32 selectivo), pensada para ejecutarse en macOS sobre Apple Silicon e Intel.

El modelo no incluye el front-end de audio: el llamante debe implementar la extracción de características Kaldi fbank (60 bins mel, ventana de 40 ms, salto de 8 ms, dither 1.0) más delta y delta-delta hasta 180 features por frame, así como la STFT/iSTFT y el troceado en ventanas de 20 s con paso de 15 s. La entrada es un tensor float32 de forma `[1, 2496, 180]` y la salida es una máscara ReLU float32 de forma `[1, 2496, 961]`, no acotada a 1.

La relevancia de esta ficha es acotada: se trata de un artefacto de despliegue derivado, con 55,26 M de parámetros, licencia Apache-2.0 y un contrato de E/S muy específico. Su interés práctico está en la limpieza de voz en aplicaciones macOS nativas (el caso de uso declarado es la función OxSay), no en investigación ni en despliegues multiplataforma.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MossFormer2 (transformer con atención lineal y memoria FSMN) convertido a ML Program de Core ML |
| Parámetros totales | 55,26 M |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana fija de 20 s de audio (2496 frames de features) |
| Tipos de cuantización | precisión mixta: 600 de 4437 operaciones en fp32, el resto en fp16 |
| Idiomas soportados | no disponible (modelo de audio, independiente del idioma) |
| Licencia | Apache-2.0 |
| Formato de pesos | ML Program de Core ML (`.mlpackage`/`.mlmodelc`), no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo subyacente es MossFormer2_SE_48K de Alibaba SLAB, una red de mejora de voz basada en atención lineal y bloques Gated_FSMN con memoria, que opera sobre características fbank y estima una máscara sobre la magnitud STFT a 48 kHz. El checkpoint original se publica en `alibabasglab/MossFormer2_SE_48K` (revisión `eff8c97925c8bec812af707814b3e5d777fd4503`), con pesos atribuidos a Shengkui Zhao et al. No se dispone en la información proporcionada de detalles sobre el dataset de entrenamiento, el número de tokens o las etapas de alineación.

La conversión realizó cirugía sobre el grafo trazado sin modificar los bytes del checkpoint: eliminación de la caché de tablas rotatorias (`no_rotary_cache`), reescritura de `F.pad` con padding negativo (`negative_pad`), sustitución de nueve ecuaciones `einsum` por broadcast/matmul verificadas en float64 (`einsum_as_matmul`) y fijación en fp32 de las rutas con riesgo de desbordamiento (`mixed_selector`): la memoria FSMN tras la segunda normalización de cada Gated_FSMN y las 48 sumas `k^T v` de atención lineal, cuyas activaciones alcanzan 1e10 y 2,5e5 respectivamente, por encima del máximo de fp16. El resto de operaciones se ejecuta en fp16. El conversor es `engine/clean/convert/convert.py` del repositorio `anatolykoptev/ox-say`.

## Capacidades

- Mejora de voz (speech enhancement) a 48 kHz mono: estima una máscara espectral ReLU para atenuar ruido de fondo.
- Procesamiento por ventanas fijas de 20 s con solapamiento de 5 s (paso de 15 s) gestionado por el llamante.
- Ejecución en macOS 13 o superior sobre Apple Silicon e Intel mediante Core ML.
- Funcionamiento con `computeUnits = .cpuAndGPU` en Apple Silicon y con GPU discreta o `cpuOnly` en Intel.
- No soporta streaming ni baja latencia: requiere acumular la ventana completa antes de inferir.
- No realiza separación de fuentes ni extracción de hablante; es exclusivamente el modelo de mejora de voz.
- No incluye front-end de audio: fbank, STFT/iSTFT y troceado son responsabilidad del integrador.
- Autoverificación de carga mediante un conocido (`reference_window.bin`) con umbrales de MSE y error absoluto.

## Casos de uso

- Limpieza de voz en aplicaciones macOS nativas: integración en apps Swift mediante Core ML con `cpuAndGPU`, procesando ventanas de 20 s con paso de 15 s para limpiar grabaciones antes de transcripción o reproducción.
- Preprocesado para pipelines de ASR en local: reducir ruido de fondo en audio de 48 kHz antes de pasarlo a un motor de reconocimiento de voz, mejorando la relación señal-ruido de entrada.
- Edición de pódcast y vídeo en Mac: limpiar pistas de voz grabadas en entornos domésticos con ruido estacionario o de fondo, aprovechando el rendimiento de 68,6 ms por ventana en M5 Pro.
- Herramientas de accesibilidad: mejorar la inteligibilidad de grabaciones de reuniones o clases antes de su reproducción o de generar subtítulos.
- Verificación de integridad en producción: ejecutar el autochequeo de conocido (`reference_window.bin`) tras cada carga del modelo para detectar defectos del runtime de Core ML que produzcan salidas corruptas silenciosas.
- Procesado por lotes en servidores Mac: limpiar archivos de audio de forma offline en equipos Apple Silicon, donde el modelo procesa 218× tiempo real en la ventana de inferencia.
- Prototipado de funciones de limpieza de voz en apps de mensajería o notas de voz que necesiten ejecución local sin enviar audio a la nube.

## Benchmarks y rendimiento

Paridad frente a la referencia PyTorch fp32 a través del troceador compartido (ventana de 20 s, paso de 15 s, dither 1.0), medido en `cpuAndGPU` el 2026-11-03:

| Clip | Mask MSE | SI-SDR (dB) | Similitud coseno ECAPA |
|---|---|---|---|
| A (30 s, lavalier) | 2,98e-6 | 73,1 | 1,0000 |
| B (30 s, fondo ruidoso) | 2,65e-6 | 47,9 | 1,0000 |
| C (60 s, concatenado) | 2,87e-6 | 47,3 | 1,0000 |
| Clips ruidosos 1–4 (20 s) | 2,21e-6 … 3,04e-6 | 48,0 … 58,7 | 1,0000 |
| A3 (3 s, tileado) | 2,48e-6 | 74,0 | 1,0000 |
| Clip ruidoso 5 (7 s, tileado) | 9,10e-6 | 44,4 | 0,9999 |

Rendimiento en Apple M5 Pro (mediana de 200 ejecuciones, sonda en Swift, solo modelo): 68,6 ms por ventana de 20 s (218× tiempo real, 15 s de audio nuevo por ventana), primera predicción 7,06 s y huella máxima de 0,403 GiB. En Intel i9-9880H con Radeon Pro 5500M: 7,9× tiempo real con 2,2 GiB en `cpuAndGPU`, y 2,9× con 3,25 GiB en `cpuOnly`. En `cpuOnly` sobre Apple Silicon: 1,012 s por ventana y salida incorrecta.

## Requisitos de hardware

- VRAM/huella: 0,403 GiB de pico en Apple M5 Pro; 2,2 GiB con GPU discreta en Intel y 3,25 GiB en `cpuOnly` sobre Intel.
- Apple Silicon: obligatorio `computeUnits = .cpuAndGPU`. No usar `.cpuOnly` (salida corrupta en los primeros ~64 frames por defecto del runtime fp16 de CPU) ni `.cpuAndNeuralEngine`/`.all` (la compilación en ANE falla tras unos 20 minutos y cae a 0 operaciones en ANE).
- Intel: usar GPU discreta no low-power vía `preferredMetalDevice` o `cpuOnly`. No ejecutar en GPU integrada Intel UHD 630 (0,22× tiempo real y 16,7 GiB de huella).
- GPU recomendadas: no aplica en el sentido habitual; el modelo está pensado para Metal en Apple Silicon y GPUs discretas AMD en Mac Intel. No hay soporte CUDA ni ROCm en esta conversión.
- Cabe en cualquier Mac con Apple Silicon; en Intel requiere GPU discreta o modo CPU.
- Despliegue: exclusivamente Core ML en macOS 13 o superior. No hay artefactos para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 68,6 ms por ventana de 20 s en M5 Pro; 1,012 s por ventana en `cpuOnly` sobre Apple Silicon (no válido); 7,9× tiempo real en Intel con GPU discreta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/ventana | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Koptev/mossformer2-se-48k-coreml | 55,26 M | 20 s fijos | Core ML (ML Program) | Apache-2.0 | Hugging Face |
| alibabasglab/MossFormer2_SE_48K | no disponible en la información | no disponible en la información | PyTorch (checkpoint original) | Apache-2.0 | Hugging Face |
| Otros modelos de speech enhancement | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa con alternativas de la misma categoría (por ejemplo, otros modelos de mejora de voz en Core ML o en PyTorch) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Solo acepta audio mono a 48 kHz; otras frecuencias de muestreo quedan fuera de alcance.
- No soporta streaming ni mejora de baja latencia: exige ventanas completas de 20 s.
- No realiza separación de fuentes ni extracción de hablante; es únicamente el modelo de mejora de voz.
- La máscara de salida es ReLU y no está acotada a [0,1]; si se necesita una máscara normalizada, el llamante debe renormalizarla.
- En Apple Silicon, `cpuOnly` produce salida incorrecta en los primeros ~64 frames de cada ventana por un defecto del runtime fp16 de CPU de Core ML (observado en macOS 26.5.1, M5 Pro); usar siempre `cpuAndGPU`.
- En Apple Silicon, `.cpuAndNeuralEngine` y `.all` no son viables: la compilación en ANE falla tras unos 20 minutos y cae a 0 operaciones en ANE.
- En Intel, evitar la GPU integrada (UHD 630): 0,22× tiempo real y 16,7 GiB de huella.
- Verificado en una sola máquina por arquitectura; el autor recomienda ejecutar el autochequeo de conocido tras cada carga y rechazar el modelo si la MSE de máscara supera 1e-4, el p99.9 del error absoluto supera 0,05 o aparece algún NaN.
- Riesgo de alucinación y sesgos: no aplica en el sentido de modelos generativos, pero no se documentan sesgos de dominio ni comportamiento fuera de la distribución de entrenamiento del modelo original.
- Licencia Apache-2.0: permite uso comercial, pero la sección 4(b) obliga a documentar los cambios de la conversión, ya reflejados en la model card.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es un artefacto reciente y poco validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Koptev/mossformer2-se-48k-coreml
- Modelo base: https://huggingface.co/alibabasglab/MossFormer2_SE_48K
- Repositorio del conversor: https://github.com/anatolykoptev/ox-say (referenciado como `anatolykoptev/ox-say`)
- Paper de MossFormer2 referenciado: arXiv:2312.11825
- Paper adicional referenciado: arXiv:2506.19398
- ClearerVoice-Studio: no disponible en la información proporcionada
