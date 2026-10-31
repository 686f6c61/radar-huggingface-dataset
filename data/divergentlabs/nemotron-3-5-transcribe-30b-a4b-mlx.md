# divergentlabs/Nemotron-3.5-Transcribe-30B-A4B-MLX

## Resumen

Nemotron-3.5-Transcribe-30B-A4B-MLX es un port para Apple Silicon del modelo de reconocimiento automático de habla (ASR) NVIDIA-Nemotron-3.5-Transcribe-30B-A4B de NVIDIA, publicado por divergentlabs. Se trata de una versión cuantizada y adaptada a MLX, el framework de aprendizaje automático de Apple para chips M-series, que permite ejecutar el modelo localmente en Macs sin necesidad de GPU NVIDIA.

El modelo base es una arquitectura híbrida de 30B parámetros con aproximadamente 4B activos (A4B), lo que sugiere un diseño de mezcla de expertos (MoE) o similar orientado a la eficiencia en inferencia. Su tarea es la transcripción de voz a texto, y los datos publicados muestran un WER (word error rate) muy bajo: 1,17 % en LibriSpeech test-clean y 2,80 % en test-other.

La relevancia de esta versión radica en la ingeniería específica para Apple Silicon: los autores desarrollaron un kernel Metal personalizado con Fused SSM (state-space model fusionado) que alcanza 154 tokens por segundo en un MacBook Pro M5, y aplicaron una cuantización mixta (expertos a 3 bits, LLM a 4 bits, codificadores a 8 bits) que reduce el consumo de memoria a unos 17 GB con una penalización de apenas 0,1 puntos de WER. Los propios autores advierten que es un experimento de investigación y que probablemente sea más práctico usar un modelo más pequeño.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida con componentes SSM (Fused SSM) y LLM, orientada a ASR (detalles completos no disponibles) |
| Parámetros totales | 32.311.569.792 (≈32,3 B, según safetensors) |
| Parámetros activos | ≈4 B (indicado por el sufijo A4B; desglose exacto no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Mixta: expertos a 3 bits, LLM a 4 bits, codificadores a 8 bits |
| Idiomas soportados | no disponibles |
| Licencia | openmdw-1.1 (Open Model Weights License) |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

El modelo base, NVIDIA-Nemotron-3.5-Transcribe-30B-A4B, es un sistema de transcripción de voz con una denominación que indica 30B parámetros totales y unos 4B activos por token, patrón habitual de arquitecturas MoE. La versión MLX incorpora un kernel Metal personalizado para ejecutar de forma fusionada los bloques SSM (state-space model) del modelo, lo que sugiere una arquitectura híbrida que combina capas SSM con componentes de tipo transformer/LLM para el decodificado de texto.

Sobre el entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO) no se ha publicado información en la documentación disponible. En cuanto a la adaptación de divergentlabs, no consiste en reentrenamiento sino en cuantización post-entrenamiento mixta: se cuantizaron los expertos a 3 bits, el componente LLM a 4 bits y los codificadores de audio a 8 bits, eligiendo esta combinación por ofrecer el mejor equilibrio entre WER y tamaño (~17 GB de memoria), con una penalización medida de ~0,1 puntos de WER respecto al modelo original.

## Capacidades

- Transcripción de voz a texto (automatic speech recognition) de archivos de audio, como se muestra en el script de ejemplo `transcribe.py audio.wav`.
- Alta precisión de transcripción: WER de 1,17 % en LibriSpeech test-clean y 2,80 % en test-other (inglés).
- Ejecución local en Apple Silicon gracias a MLX, sin dependencia de GPU NVIDIA ni servicios en la nube.
- Decodificación rápida: 154 tokens por segundo en un MacBook Pro M5 Pro.
- Procesamiento por lotes eficiente: RTFx de 23,6 medido sobre 40 clips de LibriSpeech test-clean, es decir, procesa audio aproximadamente 23,6 veces más rápido que el tiempo real en ese entorno.
- Soporte multilingüe: no disponible en la información proporcionada.
- Tool calling, agentes y capacidades de razonamiento: no disponibles; se trata de un modelo especializado en ASR.

## Casos de uso

- Transcripción local de reuniones y notas de voz en Mac: al ejecutarse íntegramente en Apple Silicon con ~17 GB de memoria, permite transcribir grabaciones de reuniones sin enviar audio a servicios externos, útil para entornos con requisitos de privacidad.
- Generación de subtítulos para vídeo: el RTFx de 23,6 permite transcribir una hora de audio en unos dos minutos y medio en un M5 Pro, adecuado para flujos de subtitulado de contenido en inglés.
- Procesamiento masivo de archivos de audio en estaciones de trabajo Mac: pipelines de investigación o periodismo que necesiten transcribir grandes volúmenes de grabaciones localmente pueden aprovechar el alto throughput del modelo.
- Prototipado e investigación en ASR on-device: al ser un experimento de investigación con código abierto (script de transcripción incluido), sirve como base para explorar kernels Metal personalizados y cuantización mixta en modelos SSM/MoE.
- Evaluación comparativa de WER en Apple Silicon: los resultados publicados en LibriSpeech permiten usarlo como referencia para comparar alternativas de ASR locales en hardware M-series.
- Integración en aplicaciones macOS de dictado o accesibilidad: la latencia de decodificación de 154 tok/s es suficiente para transcripción casi en tiempo real de audio de micrófono en aplicaciones nativas.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| LibriSpeech test-clean (WER) | 1,17 % |
| LibriSpeech test-other (WER) | 2,80 % |
| Velocidad de decodificación (M5 Pro) | 154 tok/s |
| RTFx (40 clips test-clean, M5 Pro) | 23,6 |
| Penalización de WER por cuantización | ~0,1 puntos |

No se han publicado comparaciones directas con otros modelos ASR en la información disponible.

## Requisitos de hardware

- Memoria unificada: ~17 GB de RAM unificada para la versión cuantizada (el repo ocupa 15,7 GB). En la práctica, se necesita un Mac con al menos 24 GB de memoria unificada para dejar margen al sistema operativo y al audio en proceso.
- GPU recomendada: Apple Silicon con kernel Metal compatible; los datos publicados corresponden a un MacBook Pro con chip M5 Pro. No disponible información sobre chips M1/M2/M3.
- No aplica ejecución en GPU NVIDIA para esta variante MLX; para hardware CUDA debe usarse el modelo base nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B.
- Cabe en consumer hardware Apple: sí, en Macs de gama media-alta con 24 GB o más de memoria unificada (según los autores, "una MacBook relativamente pequeña").
- Despliegue: script Python propio incluido en el repo (`transcribe.py`), instalable con `pip install -r requirements.txt`. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI.
- Rendimiento medido: 154 tok/s de decodificación y RTFx 23,6 en M5 Pro; no hay estimaciones de latencia para otros chips.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Plataforma | WER (LibriSpeech test-clean) | Licencia |
|---|---|---|---|---|---|
| Nemotron-3.5-Transcribe-30B-A4B-MLX | 32,3 B (≈4 B activos) | ASR | Apple Silicon (MLX) | 1,17 % | openmdw-1.1 |
| NVIDIA-Nemotron-3.5-Transcribe-30B-A4B (base) | 32,3 B (≈4 B activos) | ASR | CUDA / NVIDIA | no disponible | openmdw-1.1 |
| Whisper large-v3 (OpenAI) | ≈1,5 B | ASR | Multiplataforma (PyTorch, GGML) | ≈1,8-2 % (referencia pública aproximada) | MIT |
| Parakeet / Canary (NVIDIA) | 0,6-1,3 B | ASR | CUDA / NVIDIA | no disponible en esta ficha | Licencias variadas |

Nota: los valores de Whisper large-v3 son referencias públicas aproximadas, no datos de la ficha del modelo. Los autores de esta versión MLX recomiendan explícitamente considerar modelos más pequeños para uso práctico.

## Limitaciones y advertencias

- Los propios autores indican que "probablemente es mejor usar un modelo más pequeño" y que este port es "solo un experimento de investigación": no está pensado para producción.
- El WER publicado corresponde a LibriSpeech (inglés leído); no hay datos de rendimiento en español, audio espontáneo, ruido de fondo o acentos diversos.
- Idiomas soportados: no disponibles en la documentación; no puede asumirse soporte multilingüe.
- Requiere al menos ~17 GB de memoria unificada, lo que lo excluye de Macs con 8 o 16 GB.
- Solo funciona en Apple Silicon con MLX; no es ejecutable en GPU NVIDIA, AMD o CPU x86 en esta variante.
- La cuantización mixta (3-bit expertos) introduce una penalización de ~0,1 puntos de WER respecto al modelo original en FP16/BF16.
- La licencia openmdw-1.1 es una licencia de pesos abiertos con condiciones específicas; debe revisarse el texto completo en https://openmdw.ai/license/1-1/ antes de cualquier uso comercial.
- Riesgo de alucinaciones en transcripción (texto inventado en silencios o audio corrupto): no documentado para este modelo, pero es un comportamiento habitual en sistemas ASR generativos; se recomienda validación en casos de uso críticos.
- Métricas de rendimiento medidas únicamente en M5 Pro; el comportamiento en chips anteriores es desconocido.

## Enlaces

- Ficha del modelo MLX: https://huggingface.co/divergentlabs/Nemotron-3.5-Transcribe-30B-A4B-MLX
- Modelo base de NVIDIA: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
