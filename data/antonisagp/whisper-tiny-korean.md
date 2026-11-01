# AntonisAgp/whisper-tiny-korean

## Resumen

Whisper Tiny Korean English es un ajuste fino (fine-tune) del modelo de reconocimiento automático del habla `openai/whisper-tiny`, desarrollado por el usuario AntonisAgp y publicado en HuggingFace. El modelo parte de la arquitectura encoder-decoder transformer original de Whisper, con 37,7 millones de parámetros, y ha sido reentrenado sobre el dataset `naharte/korean_english` para la tarea de transcripción de audio a texto.

El objetivo declarado por el autor es adaptar el modelo base a un dominio bilingüe coreano-inglés, aunque la model card es prácticamente un esqueleto generado automáticamente por el Trainer de HuggingFace: no incluye descripción del modelo, usos previstos ni detalles sobre la composición del dataset de entrenamiento. El resultado declarado es un WER de 9,73 sobre el split de test del dataset citado, un valor que debe interpretarse con cautela porque no está verificado y procede de un conjunto de evaluación muy específico y de tamaño presumiblemente reducido.

Es relevante ahora únicamente como ejemplo de fine-tuning ligero de Whisper para dominios concretos y de bajo coste computacional: con 37,7 M de parámetros y un repo de 0,3 GB, se puede ejecutar en CPU o en GPUs de gama baja. No obstante, la ausencia de documentación, el número muy bajo de descargas (27) y la falta de verificación de los resultados lo sitúan como un artefacto experimental más que como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 37.760.640 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper tiny procesa ventanas de audio de 30 s; el dato no se declara en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/ONNX) |
| Idiomas soportados | en (declarado en la model card); el nombre del modelo sugiere coreano-inglés, pero el campo `language` solo lista `en` |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de `openai/whisper-tiny`: un transformer encoder-decoder con atención multi-cabeza estándar, diseñado para convertir espectrogramas log-Mel en secuencias de tokens de texto. Whisper tiny es la variante más pequeña de la familia Whisper y está pensada para escenarios de baja latencia y recursos limitados. No se documenta ninguna modificación arquitectónica respecto al modelo base.

El entrenamiento se realizó con el Trainer de HuggingFace sobre el dataset `naharte/korean_english`. Los hiperparámetros declarados son: learning rate de 1e-05, batch de entrenamiento de 2, batch de evaluación de 1, optimizador AdamW (variante fused con betas 0,9/0,999 y epsilon 1e-08), scheduler lineal con 500 pasos de warmup y 2000 pasos totales. Se observan dos checkpoints evaluados: en el paso 1000 (epoch 1,0173) la pérdida de validación fue 0,2163 con WER 9,8537, y en el paso 2000 (epoch 2,0346) la pérdida bajó a 0,2030 con WER 9,7317. No se documenta el tamaño del dataset, su composición exacta, ni si hubo técnicas de aumento de datos, RLHF o DPO (no aplicables en un fine-tune de ASR de este tipo).

## Capacidades

- Reconocimiento automático del habla (ASR): transcripción de audio a texto en el dominio del dataset de ajuste.
- Especialización declarada en el par de idiomas coreano-inglés, aunque el campo de idiomas de la model card solo declara `en`.
- Ejecución ligera: 37,7 M de parámetros permiten inferencia en CPU y en GPUs de gama baja.
- Compatible con la librería `transformers` y con el pipeline `automatic-speech-recognition`.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multimodales más allá del audio de entrada.
- No se documenta modo thinking, visión ni audio generativo.

## Casos de uso

- Transcripción de notas de voz en aplicaciones móviles: el tamaño reducido (37,7 M de parámetros) permite empaquetar el modelo en apps con presupuesto de memoria muy ajustado, siempre que el audio sea del dominio coreano-inglés del dataset de ajuste.
- Subtitulado automático de clips cortos: Whisper tiny procesa ventanas de 30 s, adecuado para vídeos breves o fragmentos de podcast donde no se requiere máxima precisión.
- Prototipado rápido de pipelines ASR: sirve como baseline para comparar con modelos mayores antes de invertir en infraestructura.
- Preprocesado de audio en pipelines de datos: transcripción masiva de audios en un dominio concreto para generar texto indexable, con la ventaja de que el modelo cabe en cualquier máquina.
- Evaluación de técnicas de fine-tuning: útil como referencia académica para estudiar cómo se comporta Whisper tiny al adaptarse a un dataset bilingüe pequeño.
- Experimentación en entornos sin GPU: al ser un modelo de 0,3 GB, se puede ejecutar en CPU para pruebas de integración y validación de pipelines.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados):

| Modelo | Dataset | Métrica | Valor |
|---|---|---|---|
| Whisper Tiny Korean English | naharte/korean_english (split test) | WER | 9,7317 |
| Whisper Tiny Korean English (paso 1000) | naharte/korean_english (validación) | WER | 9,8537 |
| Whisper Tiny Korean English (paso 2000) | naharte/korean_english (validación) | Loss | 0,2030 |

No se han publicado resultados comparativos con otros modelos en la información disponible. El WER de 9,73 corresponde a un dataset concreto y no es directamente comparable con cifras de benchmarks estándar como LibriSpeech o Common Voice.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (37,7 M de parámetros); en la práctica, unos pocos cientos de MB incluyendo buffers de audio.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona sin problemas en GTX 1650, RTX 3050, RTX 4090, A100 o H100, aunque estas últimas están sobredimensionadas para este modelo.
- Cabe en cualquier GPU de consumo e incluso en CPU; es adecuado para dispositivos de borde.
- Opciones de despliegue: pipeline `automatic-speech-recognition` de `transformers`, servidores de inferencia compatibles con `transformers`, y potencialmente exportación a ONNX (no documentada por el autor). No se documentan recetas para vLLM, llama.cpp, Ollama ni TGI, que no son el entorno natural para un modelo ASR de este tipo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Whisper Tiny Korean English | 37,7 M | no disponible (ventana de 30 s en Whisper) | WER 9,73 en `naharte/korean_english` (no verificado) | apache-2.0 | HuggingFace |
| openai/whisper-tiny | 37,7 M | ventana de 30 s | Benchmarks estándar de Whisper (no incluidos aquí) | apache-2.0 | HuggingFace |
| openai/whisper-base | 74 M | ventana de 30 s | Superior a tiny en benchmarks estándar | apache-2.0 | HuggingFace |
| openai/whisper-small | 244 M | ventana de 30 s | Superior a base en benchmarks estándar | apache-2.0 | HuggingFace |

La comparación directa con `whisper-tiny` original es la más relevante: este fine-tune parte de él y solo se diferencia por el ajuste sobre el dataset coreano-inglés. No se dispone de datos que permitan afirmar que mejora al modelo base en benchmarks generales; el único dato es el WER declarado sobre un dataset específico.

## Limitaciones y advertencias

- Model card incompleta: el autor no documenta descripción, usos previstos ni limitaciones; la información disponible es la generada automáticamente por el Trainer.
- Resultados no verificados: el WER de 9,73 está marcado como `verified: false` en el model-index.
- Dataset de evaluación específico y presumiblemente pequeño: el WER no es extrapolable a otros dominios ni a audio real en producción.
- Idiomas: el campo `language` solo declara `en`, aunque el nombre del modelo sugiere coreano-inglés; no hay evidencia documentada del rendimiento en coreano.
- Riesgo de alucinación: como todo modelo Whisper, puede generar texto plausible que no corresponde al audio, especialmente en segmentos con ruido o silencios.
- Sesgos: no documentados; al entrenarse sobre un dataset concreto, puede heredar sesgos de acento, género o vocabulario de ese corpus.
- Licencia apache-2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte.
- Sin mantenimiento aparente: 27 descargas y 0 likes sugieren un artefacto experimental sin comunidad activa.
- No apto como sustituto directo de modelos ASR de producción sin una evaluación propia sobre el dominio objetivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AntonisAgp/whisper-tiny-korean
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Dataset de entrenamiento: https://huggingface.co/datasets/naharte/korean_english
