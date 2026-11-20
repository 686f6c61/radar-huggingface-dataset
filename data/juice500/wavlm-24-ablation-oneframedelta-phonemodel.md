# juice500/wavlm-24-ablation-oneframedelta-phonemodel

## Resumen

`juice500/wavlm-24-ablation-oneframedelta-phonemodel` es un modelo de segmentación y reconocimiento fonético construido sobre las representaciones congeladas de `microsoft/wavlm-large` (capa 24, 16 kHz). Lo desarrolla el autor de Hugging Face `juice500` en el marco del método SPAM (S3M-based Phonological Activation Mapping), presentado en el paper "Phone Segmentation and Recognition through Phonological Activation Mapping" (SLT 2026). El modelo no es un LLM ni un modelo generativo: es un cabezal ligero que proyecta cada frame acústico de WavLM a un vector de 43 activaciones fonológicas interpretables (voicing, nasality, stridency, etc.) y, a partir de ellas, produce segmentos temporales con etiqueta de fonema.

El problema que resuelve es la opacidad de los codificadores auto-supervisados de habla (S3M): en lugar de entrenar un reconocedor de fonemas opaco, SPAM mapea las features del encoder a un espacio fonológico explícito, lo que permite segmentar y reconocer fonemas de forma interpretable y restringir el inventario de salida a una lengua concreta mediante PHOIBLE. Esta variante concreta (`ablation-oneframedelta`) es una ablación de la pila de señal de frontera descrita en la Tabla 3 del paper, es decir, una versión reducida del stack de detección de límites.

Es relevante ahora para investigadores en fonética computacional, lingüística de corpus y evaluación de S3M, porque ofrece una alternativa ligera (el encoder está congelado y el repo ocupa 0.0 GB, lo que indica que solo se distribuyen los pesos de los cabezales) y con licencia MIT, frente a pipelines de ASR o alineadores forzados más pesados. El modelo está entrenado y evaluado sobre TIMIT (`timit-asr/timit_asr`) y declara idioma inglés, aunque la API permite restringir el vocabulario a otros inventarios PHOIBLE.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabezales SPAM sobre encoder WavLM-large congelado (capa 24, 16 kHz); segmentación + reconocimiento de fonemas |
| Parametros totales | no disponible (el encoder base WavLM-large tiene ~317 M, pero no se especifica el tamaño de los cabezales) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa audio frame a frame; sin ventana declarada) |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones; el paquete `phonespam` no declara soporte GGUF ni INT8) |
| Idiomas soportados | en (entrenado en TIMIT); la API `vocab_for_language` permite restringir a otros inventarios PHOIBLE |
| Licencia | MIT (el vocabulario PHOIBLE 2.0 descargado en runtime es CC BY-SA 3.0) |
| Formato de pesos | no disponible (repo de 0.0 GB; presumiblemente safetensors/PyTorch vía `phonespam`, no confirmado) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura SPAM: un encoder S3M congelado (`microsoft/wavlm-large`, capa 24) extrae representaciones por frame a 16 kHz; sobre ellas se aplican cabezales que producen un vector de 43 activaciones fonológicas en [0, 1] (`spam.featnames` expone nombres como `"silence+"`, `"syl+"`, `"son+"`, etc.) y, a partir de esa representación, dos tareas acopladas: detección de fronteras de segmento y clasificación de fonema por segmento. La variante `oneframedelta` es una ablación que reduce la pila de señal de frontera (Tabla 3 del paper), lo que la convierte en una configuración de referencia para medir la contribución de dicha pila.

No se detalla en la información disponible el número de tokens de audio, la composición exacta del dataset de entrenamiento (más allá de TIMIT), ni si se empleó RLHF, DPO o algún esquema de ajuste específico. La innovación técnica destacable es la interpretabilidad: en lugar de un clasificador de fonemas opaco, el modelo expone el espacio fonológico intermedio, y la API permite restringir el inventario de salida a una lengua concreta mediante `vocab_for_language`, que descarga PHOIBLE 2.0 en runtime.

## Capacidades

- Segmentación fonética: devuelve segmentos contiguos `Segment(start, end, label)` con tiempos en segundos a partir de un WAV de entrada.
- Reconocimiento de fonemas: etiqueta cada segmento con un fonema del inventario configurado.
- Representación fonológica interpretable: `model.spam("utt.wav")` devuelve una matriz `(frames, 43)` de activaciones en [0, 1] con nombres de feature accesibles.
- Restricción de vocabulario por lengua: `vocab_for_language("deu")` limita la salida al inventario PHOIBLE de esa lengua.
- Procesamiento a 16 kHz mono (requisito del encoder WavLM-large).
- No soporta tool calling, function calling, agentes, visión, audio generativo ni modo thinking: es un modelo discriminativo de habla, no un LLM.

## Casos de uso

- Anotación fonética de corpus: generar alineaciones fonema-a-tiempo sobre grabaciones TIMIT o similares para construir corpus anotados sin alineador forzado externo, usando `transcribe` para obtener los segmentos directamente.
- Investigación en fonética y fonología: analizar las 43 activaciones fonológicas intermedias (`model.spam`) para estudiar qué features (voicing, nasality, stridency) activa el encoder WavLM en cada frame, con fines de interpretabilidad de S3M.
- Evaluación de encoders auto-supervisados: usar la ablación `oneframedelta` como referencia para medir cuánto aporta la pila de señal de frontera frente a configuraciones completas, comparando tasas de frontera y de reconocimiento.
- Docencia y demostraciones: el demo público en Streamlit permite ilustrar segmentación fonética sin infraestructura, útil en cursos de lingüística computacional.
- Preprocesado para pipelines de habla: obtener fronteras de fonema como features auxiliares para tareas posteriores (detección de acento, análisis de duración vocálica, estudios de coarticulación).
- Experimentos multilingües controlados: restringir el inventario de salida a una lengua PHOIBLE concreta (`vocab=`) para probar la transferibilidad del espacio fonológico aprendido en inglés a otros inventarios, sabiendo que el encoder no fue entrenado en esas lenguas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la Tabla 3 del paper (SLT 2026) para la ablación `oneframedelta`, pero no incluye cifras en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el encoder WavLM-large (~317 M parámetros) en FP32 requiere del orden de 1,3 GB solo para pesos, más activaciones y cabezales. El repo de 0.0 GB sugiere que solo se distribuyen los cabezales, por lo que el encoder se descarga aparte.
- GPU recomendadas: cualquier GPU con al menos ~4 GB de VRAM para FP32; una RTX 3060/4060 o superior es suficiente. Para procesamiento por lotes de corpus grandes, A100 o H100 reducen el tiempo total.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB, dado el tamaño del encoder.
- Opciones de despliegue: paquete `phonespam` (`pip install phonespam`), con `device="cuda"` para GPU; demo en Streamlit. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `juice500/wavlm-24-ablation-oneframedelta-phonemodel` | Segmentación/reconocimiento fonético sobre WavLM-large congelado | no disponible (encoder ~317 M) | no disponible | MIT | Hugging Face, paquete `phonespam` |
| `microsoft/wavlm-large` | Encoder S3M base | ~317 M | no disponible | MIT | Hugging Face |
| Alineadores forzados tipo Montreal Forced Aligner | Alineación fonética con HMM/GMM o redes | no disponible | no disponible | varía (GPL o similar) | distribución propia |
| ASR tipo Whisper large-v3 | Transcripción a texto (no fonemas) | ~1,55 B | 30 s de audio | MIT | Hugging Face, múltiples runtimes |

La comparación directa de rendimiento no está disponible en la información proporcionada; la diferencia principal es que este modelo produce fonemas y fronteras interpretables, mientras que Whisper produce texto y los alineadores forzados requieren transcripción previa.

## Limitaciones y advertencias

- Entrenado y evaluado sobre TIMIT (inglés); el rendimiento en otras lenguas o en habla espontánea no está documentado.
- Es una ablación reducida de la pila de frontera (`oneframedelta`): se espera un rendimiento inferior al de la configuración completa del paper, por lo que no debe tomarse como el modelo de referencia de SPAM.
- Riesgo de alucinación en el sentido de etiquetas de fonema incorrectas o fronteras espurias, especialmente en audio ruidoso o fuera de dominio; no hay métricas publicadas para cuantificarlo.
- Sesgos no documentados: no se detalla la composición demográfica de TIMIT ni posibles sesgos por hablante, dialecto o género.
- El encoder está congelado; no se puede ajustar fine-tuning del encoder con este checkpoint, solo los cabezales.
- `vocab_for_language` descarga PHOIBLE 2.0 en runtime, con licencia CC BY-SA 3.0 separada de la MIT del modelo; hay que cumplir ambas en producción.
- Repo de 0.0 GB y 0 descargas: no hay evidencia de uso en producción ni de mantenimiento activo más allá de la actualización de noviembre de 2026.
- No es un modelo generativo: no sirve para transcripción a texto, traducción, diálogo ni tareas de LLM.

## Enlaces

- Hugging Face: https://huggingface.co/juice500/wavlm-24-ablation-oneframedelta-phonemodel
- Modelo base: https://huggingface.co/microsoft/wavlm-large
- Paper: https://arxiv.org/abs/2607.09020
- Código: https://github.com/juice500ml/phonespam
- Demo: https://phonespam.streamlit.app/
- Dataset: https://huggingface.co/datasets/timit-asr/timit_asr
- PHOIBLE: https://phoible.org
