# craquehouse/parakeet-tdt-0.6b-v3-mlx-8bit

## Resumen

Este modelo es una cuantización MLX de 8 bits del sistema de reconocimiento automático de voz (ASR) `parakeet-tdt-0.6b-v3` de NVIDIA, realizada por el usuario craquehouse. El modelo base, desarrollado por NVIDIA, es un transductor Transformer (TDT) de 600 millones de parámetros que soporta 25 idiomas europeos, con puntuación, capitalización y marcas de tiempo a nivel de palabra. La versión cuantizada aquí presentada reduce el tamaño del modelo a 745 MB (frente a los 908 MB de otra cuantización similar) y mantiene un rendimiento prácticamente idéntico, con un WER del 3,33 % en LibriSpeech test-other.

La relevancia de este modelo radica en que permite ejecutar un ASR multilingüe de última generación en hardware Apple Silicon con un consumo de memoria muy reducido (pico de 1,19 GB), lo que lo hace adecuado para aplicaciones de transcripción en tiempo real en dispositivos locales. La cuantización MLX de 8 bits con group-size 64 y base dtype float16 consigue un equilibrio óptimo entre tamaño, velocidad y precisión, como demuestran las mediciones del autor.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Transducer (TDT) |
| Parametros totales | 235.885.554 (según safetensors; el modelo base declara 600 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo ASR, procesa audio) |
| Tipos de cuantizacion | MLX 8-bit (group-size 64), base dtype float16; también disponibles versiones 6-bit y 4-bit del mismo autor |
| Idiomas soportados | 25 idiomas europeos (según el modelo base) |
| Licencia | no disponible (hereda la del modelo base `mlx-community/parakeet-tdt-0.6b-v3`) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base `parakeet-tdt-0.6b-v3` es un transductor Transformer (TDT), una arquitectura de reconocimiento de voz que combina un codificador acústico con un decodificador basado en atención, optimizada para inferencia de alta velocidad. NVIDIA lo entrenó con datos multilingües que cubren 25 idiomas europeos, incorporando puntuación, capitalización y detección automática de idioma. La versión MLX cuantizada mantiene la arquitectura original, pero convierte los pesos a enteros de 8 bits con un group-size de 64, dejando las capas convolucionales en float (ya que `nn.Conv1d` no soporta cuantización en MLX). El autor documenta que el uso de base dtype float16 (en lugar de float32) reduce significativamente la memoria de activaciones, lo que se refleja en un pico de memoria menor (1,19 GB frente a 1,43 GB con base float32).

## Capacidades

- Reconocimiento de voz multilingüe: soporta 25 idiomas europeos con detección automática de idioma.
- Puntuación y capitalización automáticas: el modelo genera texto con puntuación y mayúsculas correctas, listo para su uso directo.
- Marcas de tiempo a nivel de palabra: permite alinear cada palabra con su instante temporal en el audio.
- Alta velocidad de inferencia: optimizado para Apple Silicon mediante MLX, con tiempos de procesamiento en tiempo real o superiores.
- Cuantización eficiente: la versión 8-bit reduce el tamaño del modelo a 745 MB sin pérdida significativa de precisión (WER 3,33 % frente al 3,30 % de una cuantización alternativa).

## Casos de uso

- Transcripción de reuniones y videollamadas: el modelo puede transcribir conversaciones multilingües en tiempo real, con puntuación y marcas de tiempo, integrándose en aplicaciones de productividad como Notion o Slack.
- Subtitulación automática de vídeo: gracias a las marcas de tiempo a nivel de palabra, es posible generar subtítulos sincronizados para contenido audiovisual en 25 idiomas europeos.
- Asistentes de voz locales: al ejecutarse en Apple Silicon con bajo consumo de memoria, puede integrarse en asistentes personales que procesan comandos de voz sin conexión a internet.
- Accesibilidad: permite convertir audio a texto para personas con discapacidad auditiva, con soporte multilingüe y alta precisión.
- Análisis de llamadas de atención al cliente: las empresas pueden transcribir y analizar llamadas para extraer métricas de calidad, detectar problemas y mejorar el servicio, con la ventaja de procesamiento local y privado.
- Archivado y búsqueda de contenido audiovisual: al transcribir podcasts, conferencias o entrevistas, se genera un índice textual que facilita la búsqueda y recuperación de información.

## Benchmarks y rendimiento

El autor proporciona mediciones de WER (Word Error Rate) sobre LibriSpeech test-other, comparando diferentes configuraciones de cuantización. Los resultados se obtuvieron con 500 utterances y un método de WER por corpus, con intervalos de confianza bootstrap.

| Configuracion | Tamano | Pico de memoria | WER (test-other) |
|---|---|---|---|
| `animaslabs/parakeet-tdt-0.6b-v3-mlx-8bit` | 908 MB | 1,29 GB | 3,30 % |
| `ours-fp16-8bit` (este modelo) | 745 MB | 1,19 GB | 3,33 % |
| `ours-fp32-8bit` | 945 MB | 1,43 GB | 3,33 % |
| `ours-fp16-6bit` | 608 MB | 1,05 GB | 3,39 % |
| `ours-fp16-4bit` | 473 MB | — | 3,64 % |

El pico de memoria escala con la duración del utterance, por lo que los valores son comparables solo dentro del mismo conjunto de prueba (8 utterances de LibriSpeech test-other). No se dispone de benchmarks comparativos con otros modelos ASR en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: pico de 1,19 GB durante la inferencia (medido con 8 utterances de LibriSpeech test-other); el tamaño del modelo en disco es de 745 MB.
- GPU recomendadas: cualquier chip Apple Silicon (M1, M2, M3 o posteriores), ya que MLX está optimizado para la GPU unificada de Apple.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier Mac con al menos 8 GB de RAM unificada; el modelo es muy ligero.
- Opciones de despliegue: MLX (librería nativa de Apple), posiblemente a través de `mlx-lm` o scripts personalizados; también se puede convertir a otros formatos si se requiere.
- Latencia y throughput: no se proporcionan datos específicos, pero el modelo está diseñado para alta velocidad en Apple Silicon; la cuantización 8-bit reduce el ancho de banda de memoria, lo que acelera la inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Tamano (cuantizado) | WER (LibriSpeech test-other) | Licencia |
|---|---|---|---|---|---|
| `parakeet-tdt-0.6b-v3-mlx-8bit` (este) | 235,9 M (safetensors) | 25 europeos | 745 MB | 3,33 % | no disponible |
| `mlx-community/parakeet-tdt-0.6b-v3` (base MLX) | 600 M (declarados) | 25 europeos | ~1,2 GB (fp16) | no disponible | no disponible |
| `openai/whisper-large-v3` | 1550 M | 99+ | ~3 GB (fp16) | ~3,5 % (test-other) | MIT (código), modelo con licencia específica |

No se dispone de una comparativa directa con otros modelos ASR en la información proporcionada. La comparación con Whisper se basa en datos públicos generales, pero no se han verificado en este contexto.

## Limitaciones y advertencias

- Cobertura de idiomas limitada: solo 25 idiomas europeos; no soporta idiomas de otras regiones ni variantes dialectales fuera de ese conjunto.
- Posible degradación por cuantización: aunque el WER se mantiene cercano al modelo sin cuantizar (3,33 % vs 3,30 %), la cuantización puede introducir errores en condiciones de audio adversas o con acentos poco representados.
- Licencia no especificada: el autor indica que la licencia se hereda del modelo base, pero no se ha verificado cuál es; es necesario consultar la model card de `mlx-community/parakeet-tdt-0.6b-v3` antes de redistribuir o usar comercialmente.
- Riesgo de alucinación: como todo modelo ASR, puede generar texto que no corresponde al audio en presencia de ruido fuerte, solapamiento de hablantes o palabras fuera de vocabulario.
- Dependencia de MLX: el modelo está en formato MLX y solo es ejecutable en Apple Silicon; no es directamente utilizable en GPUs NVIDIA o AMD sin conversión previa.
- Convoluciones en float: las capas convolucionales no están cuantizadas, lo que puede aumentar ligeramente el uso de memoria y reducir la velocidad en comparación con una cuantización completa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/craquehouse/parakeet-tdt-0.6b-v3-mlx-8bit
- Modelo base MLX: https://huggingface.co/mlx-community/parakeet-tdt-0.6b-v3
- Modelo original de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Colección NVIDIA NGC: https://catalog.ngc.nvidia.com/orgs/nvidia/collections/parakeet-tdt-0.6b
- Repositorio del autor (model-lab): https://git.craquehouse.cc/craquehouse/model-lab
- Implementación FastAPI con ONNX (referencia de uso): https://github.com/groxaxo/parakeet-tdt-0.6b-v3-fastapi-openai
