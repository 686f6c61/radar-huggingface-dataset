# codebucketsolutions/bolo-syspin-marathi-male

## Resumen

`bolo-syspin-marathi-male` es un modelo de síntesis de voz (text-to-speech) en maratí (`mr`) para voz masculina, publicado por el usuario `codebucketsolutions` en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una conversión de formato: el checkpoint original es `SYSPIN/vits_Marathi_Male` del proyecto SYSPIN (SPIRE Lab, Indian Institute of Science, Bengaluru), desarrollado con la arquitectura VITS de Coqui, y este repositorio lo empaqueta en ONNX para su uso con `sherpa-onnx` a través del servidor de voz `bolo`.

El modelo resuelve un problema de despliegue: permitir inferencia TTS en maratí sin depender de PyTorch, usando el runtime ONNX de `sherpa-onnx`. Está pensado para integrarse en `bolo`, un servidor de voz ligero, mediante el comando `bolo pull syspin-mr-male`. El repositorio ocupa aproximadamente 0,1 GB, lo que es coherente con un modelo VITS de tamaño reducido orientado a inferencia en tiempo real o en entornos con recursos limitados.

La relevancia es acotada pero clara: cubre un idioma de bajos recursos (maratí) con una licencia permisiva (MIT en los pesos, CC-BY-4.0 en los datos de entrenamiento) y un formato de despliegue sin PyTorch. No hay datos publicados de benchmarks ni de calidad perceptual en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS (Coqui), exportado a ONNX |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto textual) |
| Tipos de cuantización | no disponible (el repo contiene pesos ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | maratí (`mr`) |
| Licencia | MIT (pesos); datos de entrenamiento CC-BY-4.0 |
| Formato de pesos | ONNX |
| Tamaño del repositorio | ~0,1 GB |
| Pipeline | text-to-speech |
| Runtime objetivo | sherpa-onnx (sin PyTorch) |
| Herramienta de conversión | `tools/voices/export_syspin.py` del proyecto bolo |

## Arquitectura y entrenamiento

El modelo subyacente es un VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), una arquitectura de TTS extremo a extremo que combina un encoder de texto, un predictor de duración, un decoder generativo y un discriminador adversarial durante el entrenamiento. VITS produce audio de forma directa a partir del texto sin un vocoder separado en inferencia. En este repositorio, el checkpoint Coqui VITS original se ha convertido a ONNX mediante la herramienta `export_syspin.py` del proyecto bolo; según la model card, los pesos no fueron reentrenados ni modificados, solo convertidos de formato.

Los datos de entrenamiento corresponden al corpus TTS SYSPIN del IISc, licenciado bajo CC-BY-4.0. No se especifican en la información disponible el número de horas de audio, la composición del dataset, ni si hubo etapas de fine-tuning o ajuste perceptual posteriores. Tampoco se documentan innovaciones técnicas adicionales más allá de la propia arquitectura VITS y la conversión a ONNX para inferencia sin PyTorch.

## Capacidades

- Síntesis de voz (TTS) en maratí para voz masculina.
- Generación de audio a partir de texto de entrada, con salida en formato compatible con `sherpa-onnx`.
- Ejecución sin PyTorch: el runtime es ONNX, lo que simplifica el despliegue en entornos ligeros.
- Integración con el servidor de voz `bolo` mediante `bolo pull syspin-mr-male`.
- No se documentan capacidades de clonación de voz, control de prosodia, emoción, multi-hablante ni tool calling; es un modelo TTS de un solo hablante.
- No dispone de capacidades multimodales (visión, audio de entrada, etc.) más allá de la síntesis texto-a-voz.

## Casos de uso

- **Lectura de contenido en maratí**: convertir artículos, noticias o documentación a audio para aplicaciones de accesibilidad o consumo pasivo, aprovechando el runtime ONNX ligero y el tamaño reducido del modelo (~0,1 GB).
- **Asistentes de voz embebidos**: integrar el modelo en dispositivos con recursos limitados o sin GPU dedicada, ya que `sherpa-onnx` permite inferencia en CPU y el modelo no requiere PyTorch.
- **Avisos y notificaciones automatizadas**: generar mensajes de voz en maratí para sistemas de alerta, transporte público o domótica, donde se necesita latencia baja y despliegue sencillo.
- **Aplicaciones educativas**: producir audio para materiales de aprendizaje de maratí o para estudiantes con dificultades de lectura, usando una voz masculina nativa del corpus SYSPIN.
- **Prototipado de interfaces conversacionales**: servir como componente TTS en pipelines de voz (ASR + LLM + TTS) para demos y pruebas de concepto en maratí, dado que el despliegue es trivial con `bolo`.
- **Localización de contenido**: doblar o narrar contenido digital en maratí para mercados regionales de India, con licencia MIT que facilita la integración comercial.
- **Sistemas de información pública**: lectura automática de comunicados o datos administrativos en maratí en quioscos o líneas telefónicas, donde el coste computacional bajo es determinante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay métricas de calidad perceptual (MOS), inteligibilidad (WER), latencia ni throughput documentadas en la model card ni en los metadatos del repositorio.

## Requisitos de hardware

- **VRAM estimada**: no disponible de forma explícita; por el tamaño del repositorio (~0,1 GB) y la arquitectura VITS, la huella de memoria es reducida y cabe holgadamente en GPU consumer.
- **GPU recomendadas**: no se especifican. Un modelo VITS de este tamaño puede ejecutarse en GPUs modestas (por ejemplo, GTX 1650 o superiores) e incluso en CPU.
- **Consumer GPU**: sí, previsiblemente en cualquier GPU consumer con unos pocos GB de VRAM; no se documenta un mínimo oficial.
- **Opciones de despliegue**: `sherpa-onnx` (runtime principal), servidor `bolo` (`bolo pull syspin-mr-male`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS de este tipo.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Idioma | Arquitectura | Formato | Licencia | Contexto / tamaño | Notas |
|---|---|---|---|---|---|---|
| `bolo-syspin-marathi-male` | maratí | VITS (ONNX) | ONNX | MIT (pesos) | ~0,1 GB | Conversión de `SYSPIN/vits_Marathi_Male`; runtime sherpa-onnx |
| `SYSPIN/vits_Marathi_Male` | maratí | VITS (Coqui) | checkpoint Coqui | MIT (pesos) | no disponible | Modelo original del IISc; requiere PyTorch/Coqui |
| Otros modelos TTS multilingües (p. ej. Coqui XTTS, MMS-TTS) | multilingüe | VITS / otros | varios | varía (a menudo no comercial o CC) | mayor | No se dispone de datos comparativos en la información proporcionada |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas; la comparativa se limita a aspectos de formato, licencia y disponibilidad.

## Limitaciones y advertencias

- **Un solo hablante y un solo idioma**: únicamente voz masculina en maratí; no soporta otros idiomas ni cambio de hablante.
- **Sin datos de calidad**: no hay métricas de MOS, WER ni evaluaciones perceptuales publicadas; la calidad real de la síntesis no está documentada.
- **Riesgo de alucinación acústica**: como todo modelo TTS generativo, puede producir artefactos, pronunciaciones incorrectas o prosodia anómala en textos fuera de dominio o con números, siglas y préstamos lingüísticos.
- **Conversión de formato**: los pesos no se reentrenaron; cualquier limitación del checkpoint original de SYSPIN se hereda. La conversión a ONNX podría introducir diferencias numéricas menores respecto al original.
- **Licencia**: los pesos son MIT, pero los datos de entrenamiento son CC-BY-4.0, lo que exige atribución al corpus SYSPIN y al proyecto original en usos derivados.
- **Sesgos**: no documentados; al entrenarse con un corpus específico, puede reflejar sesgos de pronunciación, registro o variedad dialectal del maratí presentes en SYSPIN.
- **Madurez**: repositorio con 0 descargas y 0 likes en el momento de la consulta; sin evidencia de uso en producción ni mantenimiento activo.
- **Producción**: al no haber benchmarks ni pruebas de estrés publicadas, conviene validar latencia, estabilidad y calidad antes de desplegarlo en entornos críticos.

## Enlaces

- Hugging Face: https://huggingface.co/codebucketsolutions/bolo-syspin-marathi-male
- Modelo original: https://huggingface.co/SYSPIN/vits_Marathi_Male
- Proyecto bolo: https://github.com/cb-Sigma/bolo
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/
- sherpa-onnx (runtime): no se incluye enlace explícito en la información disponible
