# dys-asr/parakeet-ctc-0.6b-sapc1

## Resumen

`dys-asr/parakeet-ctc-0.6b-sapc1` es un modelo de reconocimiento automático de habla (ASR) desarrollado por el usuario dys-asr, que parte del modelo base `nvidia/parakeet-ctc-0.6b` de NVIDIA y lo afina sobre el corpus Speech Accessibility Project corpus 1 (SAPC1), un conjunto de datos de habla disártrica y otros trastornos del habla. El objetivo es reducir el error de transcripción en habla no estándar, un problema crítico en aplicaciones de accesibilidad. Según los datos publicados, el modelo reduce a la mitad la tasa de error del modelo genérico en el conjunto de validación de SAPC1, pasando de un WER del 20,08 % al 10,32 %.

El modelo se basa en la arquitectura Parakeet CTC de NVIDIA, que combina un codificador Conformer con una cabeza de clasificación CTC. Tiene aproximadamente 609 millones de parámetros y está disponible en formato safetensors para su uso con la librería Transformers. La licencia es específica del proyecto Speech Accessibility Project (DUA), lo que condiciona su uso comercial.

Este modelo es relevante porque aborda un nicho poco cubierto por los ASR generalistas: la transcripción de habla con disartria y otros trastornos motores del habla, un ámbito con gran demanda en herramientas de comunicación aumentativa y asistencia clínica. Además, documenta de forma transparente los detalles de entrenamiento y las convenciones de normalización de texto, lo que facilita su evaluación y reproducción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Conformer + CTC (Parakeet CTC) |
| Parámetros totales | 608.848.897 (~609 M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR, sin ventana de contexto explícita) |
| Tipos de cuantización | no disponible (solo safetensors de precisión completa) |
| Idiomas soportados | en (inglés) |
| Licencia | speech-accessibility-project-dua |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del `nvidia/parakeet-ctc-0.6b` de NVIDIA. La arquitectura base es un Conformer con clasificación CTC, que combina capas de atención y convoluciones para modelar dependencias temporales en audio. El modelo original se entrenó en un corpus general de inglés; en este caso, se afina sobre el corpus SAPC1, que contiene habla de personas con Parkinson, ELA, parálisis cerebral, síndrome de Down y accidentes cerebrovasculares.

El entrenamiento se realizó sobre la partición de entrenamiento de SAPC1, con 212.195 enunciados (408,1 horas de audio) de 580 hablantes. Se utilizó un esquema de entrenamiento con optimizador AdamW, tasa de aprendizaje 1e-4, programación tri-stage con 10 % de warmup y 40 % de hold, batch efectivo de 32 (2 GPUs × 16 con SyncBatchNorm), 10 épocas, precisión bf16 mixta, layerdrop 0,05, y gradiente clipping 1,0. El codificador de características se mantuvo entrenable. La búsqueda de hiperparámetros se realizó con una cuadrícula de 20 celdas sobre tasa de aprendizaje y batch efectivo, evaluada en la partición de validación.

Un detalle técnico importante es el procesamiento de transcripciones: el tokenizador del modelo no contiene caracteres de dígitos, por lo que los números se verbalizan antes de la tokenización (por ejemplo, "2" se convierte en "TWO"). Además, se eliminan los marcadores de transcripción como `[brackets]` y las etiquetas `#ts` / `#dis`. Esta normalización es esencial para la evaluación, ya que si no se aplica la misma verbalización a las referencias, los números dominarán el error.

## Capacidades

- Reconocimiento automático de habla en inglés, especialmente optimizado para habla disártrica y otros trastornos del habla (Parkinson, ELA, parálisis cerebral, síndrome de Down, accidentes cerebrovasculares).
- Decodificación CTC greedy sin modelo de lenguaje externo, lo que permite una inferencia rápida y determinista.
- Salida en mayúsculas, sin puntuación y con números verbalizados (ej. "LOWER THE TEMPERATURE THREE DEGREES").
- Compatible con la biblioteca `transformers` mediante `AutoModelForCTC` y `AutoProcessor`.
- No se documentan capacidades de tool calling, agentes ni multimodales; es un modelo puramente de transcripción de audio.

## Casos de uso

- **Accesibilidad para personas con disartria**: el modelo puede integrarse en sistemas de dictado y control por voz para usuarios con dificultades motoras del habla, reduciendo el error de transcripción frente a ASR generalistas.
- **Transcripción clínica de sesiones de terapia**: en entornos de logopedia o rehabilitación, el modelo puede transcribir automáticamente las interacciones de pacientes con trastornos del habla, facilitando el registro y análisis.
- **Asistentes de voz para domótica adaptada**: se puede desplegar en dispositivos de casa inteligente para que usuarios con habla no estándar puedan controlar luces, termostatos o electrodomésticos mediante comandos de voz.
- **Sistemas de comunicación aumentativa y alternativa (CAA)**: el modelo puede servir como motor de transcripción en aplicaciones que convierten el habla en texto para usuarios que no pueden usar teclados.
- **Análisis de datos clínicos**: en investigación médica, puede utilizarse para transcribir grabaciones de pacientes con enfermedades neurodegenerativas, permitiendo el análisis cuantitativo del habla (por ejemplo, medición de WER en la evolución de la enfermedad).
- **Subtitulado en vídeo para contenido con habla no estándar**: en plataformas de vídeo, el modelo puede generar subtítulos automáticos para entrevistas o testimonios de personas con disartria, mejorando la accesibilidad del contenido.

## Benchmarks y rendimiento

El autor declara los siguientes resultados en la partición de desarrollo (dev) del corpus SAPC1, comparando con el modelo base:

| Modelo | WER (SAPC1 dev) | CER (SAPC1 dev) |
|---|---|---|
| `nvidia/parakeet-ctc-0.6b` (base) | 20,08 % | 12,62 % |
| `dys-asr/parakeet-ctc-0.6b-sapc1` | **10,32 %** | **6,09 %** |

No se han publicado resultados en otros benchmarks estándar de ASR (como LibriSpeech o Common Voice) en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con pesos en bf16 (si se convierten), el modelo de ~609 M parámetros ocupa aproximadamente 1,2 GB en memoria de GPU. En fp32, unos 2,4 GB. La inferencia en CPU también es posible, aunque más lenta.
- **GPU recomendadas**: dado el tamaño del modelo, una GPU con al menos 4 GB de VRAM es suficiente para inferencia en fp32 (por ejemplo, GTX 1650, RTX 3050). Para una mayor velocidad, una RTX 3060 o superior es adecuada. El entrenamiento se realizó con 2× A100 80 GB, pero para inferencia no se requiere ese nivel.
- **Compatibilidad con GPU de consumo**: sí, el modelo cabe en la mayoría de GPU de consumo actuales, incluidas las de gama baja.
- **Opciones de despliegue**: se puede usar directamente con `transformers` en Python, o mediante servidores ASR como NVIDIA NIM (que ofrece un microservicio para el modelo base, y probablemente soporte este fine-tune). También es posible exportar a ONNX para inferencia optimizada en CPU/GPU.
- **Latencia y throughput**: no se proporcionan datos específicos. Dado el tamaño moderado y el decodificador CTC greedy, se espera una latencia baja (del orden de cientos de milisegundos por enunciado) en GPU moderna.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER en SAPC1 dev | Licencia |
|---|---|---|---|---|
| `dys-asr/parakeet-ctc-0.6b-sapc1` | 608 M | no disponible | 10,32 % | speech-accessibility-project-dua |
| `nvidia/parakeet-ctc-0.6b` (base) | 608 M | no disponible | 20,08 % | cc-by-4.0 (probablemente) |
| `openai/whisper-small` | 244 M | 30 s de audio | no disponible | MIT |

No se dispone de datos comparativos de Whisper en el corpus SAPC1, por lo que no se puede establecer una comparación numérica. La comparación directa con el modelo base muestra la ventaja del fine-tune.

## Limitaciones y advertencias

- **Idioma**: el modelo solo soporta inglés. No es aplicable a otros idiomas.
- **Sesgo de población**: el corpus SAPC1 está muy ponderado hacia la enfermedad de Parkinson (48 % de los hablantes en dev), por lo que el rendimiento agregado puede no representar igualmente bien a otros grupos etiológicos (por ejemplo, la parálisis cerebral o el síndrome de Down).
- **Salida de texto**: el modelo produce texto en mayúsculas, sin puntuación y con números verbalizados. Esto puede requerir un postprocesamiento adicional para aplicaciones que esperan formato estándar.
- **Dependencia de la verbalización**: si se evalúa con referencias que contienen dígitos, el error será mucho mayor. Es esencial aplicar la misma verbalización a las referencias para obtener una evaluación correcta.
- **Licencia restrictiva**: la licencia `speech-accessibility-project-dua` es específica del proyecto de accesibilidad del habla y puede imponer restricciones de uso comercial. Se debe revisar el acuerdo antes de desplegar el modelo en producción.
- **Riesgo de alucinación**: como modelo CTC, no genera texto libre, sino que clasifica cada trama de audio en tokens. La probabilidad de alucinación es baja, pero puede producir sustituciones en audio de baja calidad o con ruido.
- **Sin modelo de lenguaje**: el decodificador greedy CTC no utiliza un modelo de lenguaje, por lo que no puede corregir errores de contexto lingüístico. Un modelo de lenguaje externo podría mejorar el WER, pero no se proporciona en el repo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dys-asr/parakeet-ctc-0.6b-sapc1
- Modelo hermano SAPC2 (fine-tune para el corpus 2): https://huggingface.co/dys-asr/parakeet-ctc-0.6b-sapc2
- Documentación de NVIDIA NIM para Parakeet CTC: https://docs.nvidia.com/nim/speech/latest/asr/deploy-asr-models/parakeet-ctc.html
- Despliegue del modelo base en NVIDIA NIM: https://build.nvidia.com/nvidia/parakeet-ctc-0_6b-asr/deploy
- Servidor ASR compatible con OpenAI Whisper basado en Parakeet: https://github.com/achetronic/parakeet
