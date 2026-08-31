# adi108yadav/whisper-tiny-technical

## Resumen
`whisper-tiny-technical` es un modelo de reconocimiento automático de voz (ASR) desarrollado por adi108yadav, obtenido mediante fine-tuning del modelo base `openai/whisper-tiny.en` sobre un conjunto de datos no especificado. El nombre sugiere una especialización en vocabulario técnico, aunque no se ha publicado información sobre el corpus de entrenamiento. Con solo 37,7 millones de parámetros, se sitúa en la gama más ligera de la familia Whisper, lo que lo hace adecuado para despliegues con recursos limitados.

El modelo se distribuye bajo licencia Apache 2.0 y está disponible en Hugging Face en formato safetensors. Aunque el repositorio no reporta descargas ni valoraciones, su tamaño reducido y su origen en un fine-tuning de Whisper tiny lo convierten en una opción interesante para experimentos de ASR en inglés técnico, siempre que se validen sus prestaciones en el dominio objetivo. La arquitectura es un transformer encoder-decoder estándar de Whisper, con una ventana de audio de 30 segundos (característica heredada del modelo base, aunque no se documenta explícitamente en la ficha).

## Especificaciones técnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 37.760.256 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada de Whisper: ventana de audio de 30 s) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el modelo base `whisper-tiny.en` es solo inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo sigue la arquitectura Whisper de OpenAI: un transformer encoder-decoder con normalización previa, atención multi-cabeza y embeddings posicionales aprendidos. El encoder procesa espectrogramas de mel de 80 canales, mientras que el decoder genera los tokens de transcripción de forma autorregresiva. Al ser una variante `tiny`, tiene 4 capas en el encoder y 4 en el decoder, con 6 cabezas de atención y una dimensión de modelo de 384.

El entrenamiento consistió en un fine-tuning sobre un dataset desconocido, con los siguientes hiperparámetros declarados en la model card: learning rate de 1e-05, batch de entrenamiento de 8 (acumulado a 16), batch de evaluación de 4, optimizador AdamW con betas (0.9, 0.999), scheduler lineal con 100 pasos de warm-up y 1000 pasos totales. Se usó precisión mixta nativa (Native AMP). No se especifica el número de épocas exactas, pero la tabla de resultados muestra 1,7769 épocas al final del entrenamiento. No se mencionan técnicas adicionales como RLHF o DPO.

## Capacidades
- Reconocimiento automático de voz (ASR) en inglés, heredado del modelo base `whisper-tiny.en`.
- Especialización potencial en vocabulario técnico, según el nombre del modelo, aunque no se ha verificado con datos públicos.
- Transcripción de audio a texto con una ventana de 30 segundos (característica estándar de Whisper).
- Compatible con el pipeline `automatic-speech-recognition` de Hugging Face.
- No se documentan capacidades de traducción, identificación de idioma, tool calling ni razonamiento multi-paso.

## Casos de uso
- Transcripción de reuniones técnicas: el modelo puede transcribir conversaciones o presentaciones con terminología especializada, aunque su ventana de 30 segundos requiere segmentación previa del audio.
- Subtitulado automático de vídeos técnicos: al ser ligero, se puede ejecutar en CPU o GPUs modestas para generar subtítulos en inglés en tiempo real o por lotes.
- Asistencia a personas con discapacidad auditiva en entornos técnicos: transcripción de conferencias o clases magistrales con bajo coste computacional.
- Automatización de actas de reuniones: integración en pipelines que convierten audio en texto para posterior resumen o extracción de acciones.
- Análisis de llamadas de soporte técnico: transcripción de interacciones para búsqueda de patrones o generación de documentación.
- Pruebas de concepto en ASR embebido: su pequeño tamaño permite probar en dispositivos con pocos recursos antes de escalar a modelos mayores.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks externos (el `model-index` de Hugging Face está vacío). Sin embargo, la model card reporta las siguientes métricas de evaluación durante el entrenamiento:

| Paso | Pérdida de validación | WER |
|------|----------------------|-----|
| 250  | 0,4824               | 16,6412 |
| 500  | 0,3876               | 15,3959 |
| 750  | 0,3714               | 14,9968 |
| 1000 | 0,3666               | 14,5738 |

El WER final es del 14,57 % en el conjunto de evaluación utilizado por el autor, aunque no se especifica la naturaleza de dicho conjunto. No se dispone de comparaciones con otros modelos.

## Requisitos de hardware
- Al tratarse de un modelo tiny (37,7 M de parámetros), la inferencia es viable en CPU con baja latencia, aunque no se proporcionan cifras concretas.
- VRAM estimada: inferior a 1 GB en FP32; con cuantización (por ejemplo, int8 o int4) podría reducirse aún más, pero no hay datos oficiales.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, incluidas GTX 1050 Ti, RTX 2060, etc. También funciona en Apple Silicon y Raspberry Pi (con limitaciones).
- Opciones de despliegue: compatible con `transformers`, `vLLM` (si se convierte a formato adecuado), `TGI`, `llama.cpp` (mediante conversión a GGUF) u `Ollama` (si se empaqueta). No se documentan integraciones específicas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
| Modelo | Parámetros | Contexto | WER (evaluación) | Licencia | Disponibilidad |
|--------|------------|----------|------------------|----------|----------------|
| `whisper-tiny-technical` (este) | 37,8 M | 30 s de audio | 14,57 % (conjunto propio) | Apache 2.0 | Hugging Face |
| `openai/whisper-tiny.en` | 37,8 M | 30 s de audio | No reportado | MIT | Hugging Face |
| `openai/whisper-base.en` | 74 M | 30 s de audio | No reportado | MIT | Hugging Face |

Dado que no hay benchmarks públicos comparables, la comparación se limita a parámetros y arquitectura. El fine-tuning puede mejorar el WER en dominios técnicos, pero no hay evidencia cuantitativa en este repositorio.

## Limitaciones y advertencias
- El conjunto de datos de entrenamiento no está documentado, lo que impide evaluar su representatividad y posibles sesgos.
- El modelo base solo soporta inglés; no hay indicios de capacidades multilingües.
- El WER del 14,57 % se obtuvo sobre un conjunto de validación desconocido; su rendimiento en otros dominios técnicos puede variar significativamente.
- Al ser un modelo pequeño, puede presentar alucinaciones en audio ruidoso o con baja relación señal-ruido, como es habitual en Whisper.
- No se han publicado análisis de sesgos ni de robustez ante acentos o variantes dialectales.
- El repositorio no reporta descargas ni uso previo, por lo que su adopción en producción requiere validación independiente.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/adi108yadav/whisper-tiny-technical
- Modelo base: https://huggingface.co/openai/whisper-tiny.en
- Repositorio de Whisper (OpenAI): https://github.com/openai/whisper
- Documentación de Whisper: https://openai.com/index/whisper/
