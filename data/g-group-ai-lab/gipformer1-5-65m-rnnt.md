# g-group-ai-lab/gipformer1.5-65M-rnnt

## Resumen

Gipformer 1.5 es un modelo de reconocimiento automático del habla (ASR) para vietnamita desarrollado por G-Group AI Lab. Está basado en la arquitectura Zipformer Transducer (RNN-T) y cuenta con 65 millones de parámetros, lo que lo sitúa entre los modelos ASR más pequeños disponibles para este idioma. El modelo se distribuye en formato ONNX con cuantización int8, pensado para ejecución en streaming y despliegue en dispositivos edge, lo que permite procesamiento local con privacidad de datos.

Su relevancia actual radica en que ofrece un rendimiento competitivo frente a modelos mucho más grandes (como PhoWhisper-medium o Qwen3-ASR) en dominios difíciles como grabaciones de call center con acentos regionales, y en benchmarks públicos de tecnología, finanzas, educación y administración pública. La versión 1.5 mejora notablemente los resultados de su predecesor (gipformer-65M-rnnt) en varios conjuntos de prueba, manteniendo el mismo tamaño y eficiencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Zipformer Transducer (RNN-T) |
| Parametros totales | 65M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 |
| Idiomas soportados | vietnamita (vi) |
| Licencia | MIT |
| Formato de pesos | ONNX (con runtime onnxruntime) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Zipformer Transducer, una variante del codificador Zipformer combinada con un decodificador RNN-T (Transducer). Esta arquitectura está diseñada para reconocimiento de voz en streaming, procesando audio en fragmentos y generando transcripciones de forma incremental, lo que la hace adecuada para aplicaciones en tiempo real. El modelo se distribuye cuantizado a int8, lo que reduce su huella de memoria y acelera la inferencia en hardware limitado.

No se han publicado detalles sobre el conjunto de datos de entrenamiento, el número de tokens o el proceso de alineación (si se usó RLHF, DPO u otras técnicas). La información disponible solo indica que el modelo está optimizado para dominios telefónicos y acentos regionales vietnamitas, y que su entrenamiento se centró en lograr alta precisión con un número reducido de parámetros.

## Capacidades

- Reconocimiento de voz automático en vietnamita, incluyendo transcripción de audio en streaming.
- Robustez en audio telefónico de baja calidad, con buen rendimiento en acentos del norte, centro y sur de Vietnam.
- Especialización en dominios verticales: tecnología, finanzas, educación, administración pública y medicina.
- Ejecución local en dispositivos edge (móviles, sistemas embebidos) gracias a su tamaño reducido y cuantización int8.
- No soporta tool calling, agentes ni razonamiento multi-paso; es exclusivamente un modelo de ASR.

## Casos de uso

- Transcripción de llamadas de centros de atención al cliente: el modelo maneja audio telefónico ruidoso y acentos regionales, permitiendo generar registros automáticos de conversaciones para análisis posterior.
- Subtitulado automático de vídeos en vietnamita: su capacidad de streaming permite generar subtítulos en tiempo real para vídeos, webinars o transmisiones en directo.
- Dictado por voz en aplicaciones móviles: al ser ligero y ejecutarse en el dispositivo, puede integrarse en apps de notas, mensajería o correo electrónico sin depender de la nube.
- Asistentes de voz para domótica o dispositivos embebidos: su bajo consumo de recursos lo hace apto para altavoces inteligentes, wearables o sistemas de infoentretenimiento en vehículos.
- Transcripción médica: con buenos resultados en los benchmarks VietMed y MultiMED, puede utilizarse para documentar consultas médicas o historiales clínicos en vietnamita.
- Análisis de contenido financiero y educativo: su precisión en los dominios de finanzas y educación permite transcribir podcasts, seminarios web o clases grabadas para generar resúmenes o búsquedas internas.

## Benchmarks y rendimiento

La siguiente tabla resume los resultados de WER (menor es mejor) en una selección de conjuntos de prueba públicos y privados, comparando con otros modelos ASR vietnamitas. Los datos provienen de la model card del autor.

| Modelo | Params | tele-medium | tele-hard-north | vi-asr-tech | vivos | Common-Voice | VietMed |
|---|---:|---:|---:|---:|---:|---:|---:|
| vinai/PhoWhisper-small | 244M | 33.96 | 55.88 | 56.81 | 6.23 | 11.55 | 25.50 |
| vinai/PhoWhisper-medium | 769M | 26.46 | 51.20 | 47.93 | 4.93 | 8.37 | 24.90 |
| vinai/PhoWhisper-large | 1.5B | 26.82 | 50.39 | 42.94 | 4.73 | 8.60 | 24.37 |
| Qualcomm-AI-Research/PhoASR-whisper-small | 244M | 30.73 | 50.30 | 44.35 | 5.87 | 9.73 | 23.10 |
| nvidia/parakeet-ctc-0.6b-Vietnamese | 600M | 31.82 | 55.33 | 48.69 | 7.76 | 11.40 | 23.53 |
| khanhld/chunkformer-large-vie | 110M | 27.60 | 46.30 | 39.81 | 4.18 | 6.94 | 19.59 |
| nguyenvulebinh/wav2vec2-base-vi | 95M | 23.71 | 40.49 | 59.86 | 6.60 | 12.61 | 22.96 |
| zipformer-rnnt | 65M | 20.30 | 42.21 | 36.81 | 6.92 | 11.48 | 21.90 |
| Qwen/Qwen3-ASR-1.7B | 1.7B | 26.34 | 46.80 | 27.95 | 7.17 | 10.76 | 20.21 |
| Qwen/Qwen3-ASR-0.6B | 600M | 32.29 | 48.57 | 37.52 | 10.23 | 16.68 | 22.51 |
| hynt/Zipformer-30M-RNNT-6000h | 30M | 19.53 | 38.13 | 29.77 | 4.55 | 4.16 | 19.91 |
| g-group-ai-lab/gipformer-65M-rnnt | 65M | 15.53 | 25.10 | 36.59 | 4.12 | 6.63 | 19.41 |
| **g-group-ai-lab/gipformer1.5-65M-rnnt** | **65M** | **15.44** | 26.24 | **27.49** | 4.25 | 6.45 | **19.23** |

El modelo logra el mejor WER en tele-medium, vi-asr-tech y VietMed entre todos los comparados, y es segundo en tele-hard-north (tras gipformer-65M-rnnt) y en vivos (tras hynt/Zipformer-30M). En Common-Voice, el mejor es hynt/Zipformer-30M con 4.16, seguido de gipformer1.5 con 6.45. La tabla completa con todos los conjuntos de prueba está disponible en la model card de HuggingFace.

## Requisitos de hardware

- Tamaño del modelo: 65M parámetros en int8, aproximadamente 65 MB de pesos, lo que permite ejecutarlo en dispositivos con poca memoria.
- VRAM estimada: inferior a 1 GB en GPU; puede ejecutarse en CPU sin problemas.
- GPU recomendadas: no requiere GPU de gama alta; cualquier GPU con al menos 2 GB de VRAM es suficiente. También funciona en CPUs ARM (móviles, Raspberry Pi) y en NPUs de dispositivos edge.
- Opciones de despliegue: al estar en formato ONNX, puede servirse con onnxruntime, incluyendo versiones para móviles (ONNX Runtime Mobile) y para servidores. No se menciona compatibilidad con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no se han publicado cifras oficiales, pero por su tamaño y cuantización se espera una latencia muy baja en streaming, adecuada para tiempo real en hardware modesto.

## Comparativa con modelos similares

| Modelo | Params | Arquitectura | Licencia | WER (vivos) | WER (Common-Voice) | WER (VietMed) |
|---|---:|---|---|---:|---:|---:|
| g-group-ai-lab/gipformer1.5-65M-rnnt | 65M | Zipformer Transducer | MIT | 4.25 | 6.45 | 19.23 |
| g-group-ai-lab/gipformer-65M-rnnt | 65M | Zipformer Transducer | MIT | 4.12 | 6.63 | 19.41 |
| hynt/Zipformer-30M-RNNT-6000h | 30M | Zipformer Transducer | no disponible | 4.55 | 4.16 | 19.91 |
| khanhld/chunkformer-large-vie | 110M | Chunkformer | no disponible | 4.18 | 6.94 | 19.59 |
| vinai/PhoWhisper-small | 244M | Whisper (encoder-decoder) | no disponible | 6.23 | 11.55 | 25.50 |

Gipformer 1.5 ofrece el mejor equilibrio entre tamaño y rendimiento en los benchmarks mostrados, superando a modelos con más del doble de parámetros (como PhoWhisper-small) y manteniendo una ventaja clara sobre su predecesor en dominios verticales. La licencia MIT permite uso comercial sin restricciones, a diferencia de otros modelos cuyas licencias no se especifican en la información disponible.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para vietnamita; no soporta otros idiomas.
- No se han publicado detalles sobre posibles sesgos en los datos de entrenamiento, aunque al estar orientado a dominios específicos (call centers, medicina, finanzas) puede presentar un rendimiento inferior en vocabulario general o coloquial fuera de esos ámbitos.
- Como todo sistema ASR, puede cometer errores de transcripción, especialmente en audio muy ruidoso o con superposición de hablantes; se recomienda validación humana en aplicaciones críticas.
- La cuantización int8 puede degradar ligeramente la precisión frente a una versión en FP32, aunque los benchmarks publicados ya corresponden al modelo cuantizado.
- No se especifica la longitud de contexto máxima ni el manejo de audio de larga duración; para grabaciones extensas puede ser necesario segmentar el audio.
- La licencia MIT permite uso comercial, pero el modelo no incluye garantías implícitas; el usuario es responsable de su aplicación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/g-group-ai-lab/gipformer1.5-65M-rnnt
- Repositorio de código: https://github.com/ggroup-ai-lab/gipformer
- Demo en el navegador: https://huggingface.co/spaces/g-group-ai-lab/gipformer-demo
- Conjunto de prueba vi-asr-tech: https://huggingface.co/datasets/g-group-ai-lab/vi-asr-tech-test
- Conjunto de prueba vi-asr-edu: https://huggingface.co/datasets/g-group-ai-lab/vi-asr-edu-test
- Conjunto de prueba vi-asr-finance: https://huggingface.co/datasets/g-group-ai-lab/vi-asr-finance-test
- Conjunto de prueba vi-asr-pubadmin: https://huggingface.co/datasets/g-group-ai-lab/vi-asr-pubadmin-test
