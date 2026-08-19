# craquehouse/parakeet-tdt-0.6b-v3-mlx-6bit

## Resumen

Este modelo es una cuantización MLX de 6 bits del modelo de reconocimiento automático de voz (ASR) `parakeet-tdt-0.6b-v3` de NVIDIA, adaptado para ejecutarse en hardware Apple Silicon. El autor, craquehouse, lo ha generado mediante su herramienta `model-lab`, que permite construir y medir cuantizaciones optimizadas para el ecosistema MLX. El modelo base es una versión multilingüe (25 idiomas europeos) del parakeet-tdt, diseñado para transcripción de voz de alto rendimiento con detección automática de idioma.

La relevancia de esta ficha radica en que ofrece una alternativa ligera (608 MB) para desplegar ASR en Macs con chip M-series, manteniendo un WER de 3,39 % en LibriSpeech test-other, muy cercano al del modelo en 8 bits (3,30 %). Es una opción práctica para aplicaciones de transcripción local sin depender de servicios en la nube. El modelo hereda la licencia del base, que debe consultarse antes de redistribuir.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (arquitectura del modelo base) |
| Parametros totales | 201.871.066 (según safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio) |
| Tipos de cuantizacion | 6-bit, group-size 64, base dtype float16 |
| Idiomas soportados | 25 idiomas europeos (según modelo base) |
| Licencia | no disponible (hereda la del modelo base) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base `parakeet-tdt-0.6b-v3` de NVIDIA utiliza una arquitectura FastConformer, un transformer convolucional optimizado para tareas de ASR. El modelo original se entrenó con datos multilingües de 25 idiomas europeos y soporta detección automática de idioma, puntuación y marcas de tiempo. La versión MLX aquí descrita es una cuantización de 6 bits con grupo de tamaño 64, manteniendo las capas convolucionales en float (dado que `nn.Conv1d` no soporta cuantización en MLX). El proceso de cuantización no modifica los pesos entrenados, solo su representación numérica.

No se dispone de información detallada sobre el dataset de entrenamiento del modelo base ni sobre técnicas de alineación como RLHF o DPO, ya que la card del autor no las menciona.

## Capacidades

- Transcripción de voz a texto en 25 idiomas europeos con detección automática del idioma.
- Generación de puntuación y marcas de tiempo (según las capacidades del modelo base).
- Alto rendimiento en hardware Apple Silicon gracias a la cuantización MLX de 6 bits.
- Compatible con el ecosistema MLX (inferencia local en Macs con chip M-series).
- Convoluciones en float32 que preservan la estabilidad numérica en capas críticas.
- Optimizado para baja latencia en tareas de transcripción en tiempo real.

## Casos de uso

- Transcripción de reuniones y entrevistas: el modelo puede procesar audio grabado en múltiples idiomas europeos, generando texto con puntuación y timestamps, ideal para actas automáticas.
- Subtitulado automático de vídeo: gracias a su soporte multilingüe y marcas de tiempo, puede generar subtítulos para contenido audiovisual en 25 idiomas.
- Asistentes de voz locales: al ejecutarse en Apple Silicon, permite integrar reconocimiento de voz en aplicaciones de escritorio o móviles sin conexión a internet.
- Archivado de llamadas de atención al cliente: transcripción de conversaciones para su posterior análisis o búsqueda, con detección automática de idioma.
- Herramientas de accesibilidad: conversión de audio a texto para personas con discapacidad auditiva, funcionando completamente en local.
- Investigación lingüística: análisis de corpus de audio en varios idiomas europeos, aprovechando la precisión del modelo (WER 3,39 % en LibriSpeech test-other).

## Benchmarks y rendimiento

La card del autor proporciona resultados de WER (Word Error Rate) en LibriSpeech test-other, medidos sobre 500 utterances y comparados con el baseline. Los datos son los siguientes:

| Configuracion | Tamano | Pico de memoria | WER (test-other) |
|---|---|---|---|
| `animaslabs/parakeet-tdt-0.6b-v3-mlx-8bit` | 908 MB | 1,25 GB | 3,30 % |
| `ours-fp16-8bit` | 744 MB | 1,15 GB | 3,33 % |
| `ours-fp32-8bit` | 945 MB | 1,43 GB | 3,33 % |
| `ours-fp16-6bit` **(este modelo)** | 608 MB | 1,01 GB | 3,39 % |
| `ours-fp16-4bit` | 473 MB | — | 3,64 % |

No se han publicado resultados de benchmarks adicionales (como MMLU, HumanEval, etc.) porque se trata de un modelo de ASR, no de lenguaje general.

## Requisitos de hardware

- Requiere un Mac con chip Apple Silicon (M1 o posterior) para ejecutarse mediante MLX.
- Tamaño del modelo: 608 MB en disco; pico de memoria en inferencia: 1,01 GB.
- No requiere GPU dedicada; la unidad Neural Engine o los núcleos GPU del chip M-series son suficientes.
- Compatible con librerías MLX (por ejemplo, `mlx-lm` o `mlx-audio`) para inferencia.
- Se puede desplegar con herramientas como `mlx-lm` o integraciones propias; no es compatible con vLLM, llama.cpp u Ollama al ser un modelo de audio.
- Latencia estimada: no disponible, pero al ser un modelo de 0,6B y cuantizado, es adecuado para inferencia en tiempo real en hardware Apple Silicon.

## Comparativa con modelos similares

La comparativa se centra en las distintas cuantizaciones del mismo modelo base, ya que no se dispone de otros modelos ASR equivalentes en MLX con datos comparables.

| Modelo | Tamano | Pico de memoria | WER (test-other) | Licencia |
|---|---|---|---|---|
| `parakeet-tdt-0.6b-v3-mlx-6bit` (este) | 608 MB | 1,01 GB | 3,39 % | no disponible (hereda base) |
| `parakeet-tdt-0.6b-v3-mlx-8bit` (fp16) | 744 MB | 1,15 GB | 3,33 % | no disponible (hereda base) |
| `parakeet-tdt-0.6b-v3-mlx-8bit` (fp32) | 945 MB | 1,43 GB | 3,33 % | no disponible (hereda base) |
| `parakeet-tdt-0.6b-v3-mlx-4bit` (fp16) | 473 MB | — | 3,64 % | no disponible (hereda base) |

La cuantización de 6 bits ofrece un equilibrio entre tamaño y precisión, siendo solo 0,06 puntos porcentuales peor que la versión de 8 bits, pero con un ahorro de memoria de 136 MB.

## Limitaciones y advertencias

- La licencia no está especificada en la card; es obligatorio consultar la del modelo base (`mlx-community/parakeet-tdt-0.6b-v3`) antes de redistribuir o usar comercialmente.
- El modelo está limitado a los 25 idiomas europeos del modelo base; no soporta idiomas fuera de ese conjunto.
- Puede presentar errores en acentos regionales, ruido de fondo o habla superpuesta, como cualquier sistema ASR.
- La cuantización de 6 bits puede degradar ligeramente la precisión en comparación con versiones de mayor bitness, aunque la diferencia es mínima (0,06 % WER).
- No se han publicado evaluaciones de sesgos o robustez en entornos adversos.
- El formato MLX es exclusivo de Apple Silicon; no es portable a GPUs NVIDIA o AMD sin conversión previa.

## Enlaces

- Repositorio del modelo: https://huggingface.co/craquehouse/parakeet-tdt-0.6b-v3-mlx-6bit
- Modelo base MLX: https://huggingface.co/mlx-community/parakeet-tdt-0.6b-v3
- Modelo original NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Herramienta de cuantización (model-lab): https://git.craquehouse.cc/craquehouse/model-lab
- Colección Parakeet TDT 0.6B en NGC: https://catalog.ngc.nvidia.com/orgs/nvidia/collections/parakeet-tdt-0.6b
