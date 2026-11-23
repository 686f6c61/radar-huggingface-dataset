# Quran-Lab/zipformer_p-arabic-v3

## Resumen

Zipformer_p-arabic-v3 es un modelo de reconocimiento automático de fonemas (phoneme recognition) especializado en recitación coránica en árabe, desarrollado por Quran-Lab. A diferencia de los sistemas ASR convencionales que transcriben texto ortográfico, este modelo emite secuencias de fonemas, lo que permite evaluar la pronunciación a nivel articulatorio y detectar desviaciones en las reglas de tajweed (las normas de recitación coránica). El modelo se distribuye con pesos en formato CoreML y ONNX, lo que indica un enfoque claro hacia el despliegue en dispositivos y aplicaciones de bajo consumo.

La arquitectura es Zipformer con cabecera CTC (zipformer_ctc), una variante del transformer eficiente en cómputo que emplea codificadores multiescala con tasas de bajada de resolución variables, diseñada originalmente para ASR en streaming. El soporte explícito de streaming y su empaquetado en CoreML/ONNX sugieren que el modelo está pensado para inferencia en tiempo real en dispositivos Apple y en entornos de producción con ONNX Runtime.

El modelo es relevante para desarrolladores que construyen herramientas de aprendizaje o verificación de recitación coránica, ya que ofrece una señal fonética granular con errores declarados muy bajos (1,43 % PER en recitadores de estudio no vistos durante el entrenamiento). El acceso está restringido (gated) y la licencia es específica (quran-lab-npl-1.2), lo que condiciona su uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Zipformer con cabecera CTC (zipformer_ctc) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de streaming, ventana no especificada) |
| Tipos de cuantización | no disponible (pesos distribuidos en CoreML y ONNX; cuantizaciones concretas no declaradas) |
| Idiomas soportados | árabe (ar) |
| Licencia | quran-lab-npl-1.2 (acceso restringido, requiere aceptar condiciones) |
| Formato de pesos | CoreML y ONNX |
| Tamaño del repositorio | 5,2 GB |
| Tarea (pipeline) | automatic-speech-recognition |
| Dominio | Recitación coránica, fonemas y tajweed |
| Streaming | Sí (soportado por la arquitectura y los formatos de despliegue) |

## Arquitectura y entrenamiento

El modelo emplea Zipformer, un codificador transformer con atención y convoluciones organizadas en bloques multiescala. Cada bloque opera a una resolución temporal distinta (tasas de bajada de resolución decrecientes), lo que reduce el coste computacional frente a un transformer estándar de attention cuadrática y facilita la inferencia en streaming con latencia baja. La salida se decodifica mediante una cabecera CTC, que no requiere alineamientos forzados y permite integrar el modelo en pipelines de decodificación con léxico o con corrección posterior.

El objetivo del entrenamiento es la predicción de fonemas árabes en el contexto de la recitación coránica, incluyendo fenómenos de tajweed que no aparecen en el árabe conversacional estándar. La model card declara evaluación sobre el conjunto Quran-Lab/quranic-asr-benchmark (v1.1) con tres escenarios: recitadores de estudio retenidos, audio real de teléfono y un recitador no visto. No se especifican en la información disponible el número de tokens de audio, la composición exacta del dataset de entrenamiento ni si se aplicaron técnicas de aumento de datos o ajuste fino con RLHF/DPO (poco habituales en ASR).

## Capacidades

- Reconocimiento de fonemas árabes a partir de audio, con salida orientada a la evaluación articulatoria y no a la transcripción ortográfica.
- Detección de pronunciación vinculada a reglas de tajweed en recitación coránica.
- Inferencia en streaming, adecuada para aplicaciones interactivas en tiempo real.
- Robustez declarada frente a audio de teléfono (PER de 3,65 % en el conjunto de evaluación).
- Generalización a recitadores no vistos (PER de 9,1 %), según los datos del autor.
- Despliegue en dispositivos Apple mediante CoreML y en entornos multiplataforma mediante ONNX.
- No se declaran capacidades de tool calling, agentes, visión, audio generativo ni razonamiento multietapa; es un modelo exclusivamente discriminativo de ASR.

## Casos de uso

- Aplicaciones de aprendizaje de recitación: el modelo evalúa la secuencia de fonemas producida por el alumno y la compara con la referencia esperada, señalando desviaciones articulatorias concretas en lugar de limitarse a una transcripción textual.
- Verificación de tajweed en tiempo real: gracias al soporte de streaming y a los formatos CoreML/ONNX, puede integrarse en una app móvil que resalte en pantalla las reglas incumplidas mientras el usuario recita.
- Corrección automática en academias y plataformas de enseñanza: procesamiento por lotes de grabaciones de estudiantes para generar informes de error fonético por versículo y por regla.
- Investigación en fonética árabe y coránica: generación de alineamientos fonéticos a escala sobre corpus de recitación para estudios de variación entre escuelas y recitadores.
- Control de calidad de grabaciones: detección automática de errores de pronunciación en material editorial de audio antes de su publicación.
- Herramientas de accesibilidad: conversión de audio de recitación en una representación fonética que alimente sistemas de síntesis o de búsqueda por pronunciación.
- Integración en dispositivos de bajo consumo: al distribuirse en CoreML y ONNX, puede ejecutarse localmente en hardware Apple sin depender de la nube, lo que reduce latencia y preserva la privacidad del audio.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el conjunto Quran-Lab/quranic-asr-benchmark (v1.1). La métrica es Phoneme Error Rate (PER), menor es mejor. Los valores no están verificados de forma independiente según el model-index.

| Escenario de evaluación | PER (%) | Verificado |
|---|---|---|
| Recitadores de estudio retenidos (held-out studio reciters) | 1,43 | No |
| Audio real de teléfono | 3,65 | No |
| Recitador no visto (unseen reciter) | 9,10 | No |

No se han publicado en la información disponible resultados de benchmarks estándar de ASR en árabe (como MMLU, HumanEval o GSM8K, que no aplican a este tipo de modelo, ni WER sobre corpus generales como Common Voice).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 5,2 GB, pero ese tamaño incluye los artefactos CoreML y ONNX y no equivale a la memoria necesaria en ejecución.
- GPU recomendadas: no disponibles. El modelo está empaquetado para CoreML (Apple Silicon y Neural Engine) y ONNX (CPU, GPU o aceleradores compatibles con ONNX Runtime), pero el autor no publica requisitos mínimos.
- Compatibilidad con GPU de consumo: probable en el caso de ONNX Runtime sobre GPUs convencionales, pero no confirmada por datos del autor.
- Opciones de despliegue: CoreML en plataformas Apple; ONNX Runtime en servidores y dispositivos; no se declaran integraciones con vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos generativos, no aplicables directamente aquí).
- Latencia y throughput: no disponibles. La arquitectura Zipformer y el modo streaming apuntan a latencias bajas, pero no se aportan cifras.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos sobre modelos comparables de reconocimiento fonético de árabe coránico (parámetros, contexto, rendimiento o licencia). Los sistemas ASR multilingües de propósito general no son directamente comparables porque transcriben texto ortográfico y no fonemas con granularidad de tajweed.

| Modelo | Tarea | Idiomas | Licencia | Datos comparativos |
|---|---|---|---|---|
| Quran-Lab/zipformer_p-arabic-v3 | Reconocimiento de fonemas coránicos | Árabe | quran-lab-npl-1.2 (gated) | PER 1,43 / 3,65 / 9,10 % |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en árabe coránico; su rendimiento en árabe conversacional general o en otros idiomas no está documentado y probablemente sea deficiente.
- La salida es fonética, no ortográfica: no sustituye a un ASR de texto si el objetivo es transcribir contenido.
- Los benchmarks son declarados por el autor y no están verificados de forma independiente (campo `verified: false` en el model-index).
- El PER de 9,1 % en recitadores no vistos indica una degradación notable de la precisión fuera de la distribución de entrenamiento; en producción conviene validar con la población real de usuarios.
- El acceso es restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargar los pesos.
- La licencia quran-lab-npl-1.2 es específica y no equivale a una licencia open source estándar; deben revisarse sus términos antes de cualquier uso comercial o redistribución.
- No se documentan sesgos demográficos, pero la variabilidad entre escuelas de recitación y entre hablantes nativos y no nativos puede afectar a la precisión.
- No se especifican los requisitos de hardware ni las cuantizaciones disponibles, lo que complica la planificación de recursos en despliegues a gran escala.
- Riesgo de alucinación en el sentido de fonemas incorrectamente inferidos en audio con ruido, reverberación o solapamiento de voces; no hay datos publicados sobre robustez en estas condiciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Quran-Lab/zipformer_p-arabic-v3
- Conjunto de evaluación: Quran-Lab/quranic-asr-benchmark (v1.1), referenciado en la model card del modelo
- Organización en Hugging Face: https://huggingface.co/Quran-Lab
- No se han encontrado en la información disponible enlaces adicionales a papers, blogs, repositorios o demos.
