# jodijhouranda/ayata-quran-ctc-v3

## Resumen

ayata-quran-ctc-v3 es un modelo de reconocimiento automático del habla (ASR) especializado en recitación del Corán, desarrollado por el usuario jodijhouranda y publicado bajo licencia Apache 2.0. Se trata de un fine-tuning de HamzaSidhu786/wav2vec2-base-word-by-word-quran-asr, un modelo base ya orientado a la transcripción palabra por palabra de recitación coránica. El modelo resultante conserva la arquitectura wav2vec2 y se distribuye en formatos safetensors y ONNX, lo que facilita su despliegue tanto en entornos de investigación como en producción.

Con 94.420.159 parámetros, el modelo se sitúa en la gama de los wav2vec2-base, un tamaño contenido que permite inferencia en hardware modesto. La relevancia de este modelo radica en su especialización: frente a los ASR generalistas, está ajustado para el dominio concreto de la recitación coránica, incluyendo presumiblemente el vocabulario y las particularidades fonéticas del árabe coránico. El pipeline declarado es automatic-speech-recognition y el modelo es compatible con endpoints de Hugging Face.

La información pública disponible es escasa: la model card fue generada automáticamente por el Trainer y no incluye descripción del modelo, casos de uso previstos ni datos de evaluación. No se han declarado resultados de benchmarks en el model-index, y no se especifican los idiomas soportados más allá de la naturaleza árabe del dominio de entrenamiento. Esta ficha se elabora a partir de los metadatos técnicos disponibles y de la información del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2 (transformer convolucional + encoder transformer para ASR) |
| Parametros totales | 94.420.159 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio dependiente de la configuración de wav2vec2; no declarada en la model card) |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors y ONNX; cuantizaciones adicionales no declaradas) |
| Idiomas soportados | no disponible (dominio: recitación coránica en árabe) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura wav2vec2, un modelo de ASR que combina un extractor de características convolucional sobre la forma de onda de audio con un encoder de transformers que procesa las representaciones latentes. La cabeza de clasificación es de tipo CTC (Connectionist Temporal Classification), tal como indica el nombre del modelo y su pipeline de automatic-speech-recognition. El modelo parte de HamzaSidhu786/wav2vec2-base-word-by-word-quran-asr, un checkpoint ya ajustado para transcripción palabra por palabra de recitación coránica, y se ha fine-tuneado adicionalmente sobre el dataset denominado "generator", del cual no se ofrece composición ni tamaño en la información disponible.

Los hiperparámetros de entrenamiento declarados son: learning rate de 3e-05, batch size de entrenamiento de 16 con acumulación de gradientes de 2 pasos (batch efectivo de 32), semilla 42, optimizador AdamW con betas (0.9, 0.999) y epsilon 1e-08, scheduler lineal con 250 pasos de warmup, 3500 pasos de entrenamiento totales y precisión mixta nativa (AMP). El entrenamiento se realizó con Transformers 5.20.2, PyTorch 2.11.0+cu130, Datasets 4.8.5 y Tokenizers 0.23.3. No se documenta el número de tokens ni de horas de audio utilizadas, ni si hubo etapas de RLHF o DPO (poco habituales en ASR).

## Capacidades

- Reconocimiento automático del habla (ASR) sobre audio de recitación coránica, con salida de transcripción textual.
- Transcripción a nivel de palabra (word-by-word), heredada del modelo base, adecuada para alineación y seguimiento de recitación.
- Clasificación CTC, que permite decodificación greedy o con beam search sobre las salidas del encoder.
- Distribución en ONNX, lo que habilita inferencia optimizada en entornos sin PyTorch o con aceleración específica.
- Compatibilidad con endpoints de Hugging Face para despliegue gestionado.
- No se declaran capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio más allá del ASR.
- Capacidades multilingües: no disponibles; el dominio declarado es la recitación coránica en árabe.

## Casos de uso

- Seguimiento de recitación coránica en aplicaciones educativas: el modelo transcribe palabra por palabra, lo que permite comparar la recitación del usuario con el texto de referencia y detectar errores u omisiones en tiempo real.
- Aplicaciones de memorización (hifz): la transcripción alineada por palabras facilita verificar el progreso del estudiante y señalar palabras mal pronunciadas o saltadas.
- Búsqueda y indexación de audio coránico: convertir grabaciones de recitación en texto indexable para buscadores, archivos y plataformas de contenido religioso.
- Generación de subtítulos sincronizados para vídeos de recitación, aprovechando la granularidad por palabra para alinear subtítulos con el audio.
- Investigación lingüística y fonética del árabe coránico: análisis de corpus de recitación, estudio de variantes de qira'at y construcción de datasets anotados.
- Despliegue en dispositivos con recursos limitados: con 94 millones de parámetros y exportación ONNX, puede ejecutarse en CPU o GPUs de gama baja para aplicaciones móviles o de borde.
- Moderación y verificación de contenido: comprobar que un audio etiquetado como recitación coránica corresponde realmente al texto declarado.

## Benchmarks y rendimiento

El model-index del autor declara el modelo ayata-quran-ctc-v3 sin resultados de evaluación (lista `results` vacía). No se han publicado resultados de benchmarks (WER, CER u otras métricas de ASR) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,4 GB solo para pesos (94,4 M de parámetros × 4 bytes), más activaciones y buffers de audio; en la práctica, menos de 2 GB en la mayoría de configuraciones.
- VRAM estimada en fp16: aproximadamente 0,2 GB para pesos, con overhead adicional bajo.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, aunque el modelo está sobredimensionado para estas últimas.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna (GTX 1650 en adelante) e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: transformers (PyTorch), ONNX Runtime (por la exportación ONNX incluida), y potencialmente servidores compatibles con el pipeline de ASR de Hugging Face. No se confirma soporte específico de vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos de lenguaje y no a wav2vec2.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ayata-quran-ctc-v3 | 94,4 M | no disponible | Recitación coránica (árabe) | apache-2.0 | Hugging Face (safetensors, ONNX) |
| HamzaSidhu786/wav2vec2-base-word-by-word-quran-asr | no disponible | no disponible | Recitación coránica palabra por palabra | no disponible | Hugging Face (modelo base) |
| wav2vec2-base (Facebook) | 95 M | no disponible | ASR generalista (inglés, principalmente) | apache-2.0 | Hugging Face |
| Whisper small (OpenAI) | 244 M | 30 s de audio | ASR multilingüe generalista | MIT | Hugging Face, OpenAI |

El modelo se posiciona como una especialización de dominio frente a ASR generalistas como Whisper, con un tamaño mucho menor que este último. Frente a su modelo base, representa un fine-tuning adicional cuyas mejoras concretas no están documentadas con métricas.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos, pero al estar entrenado sobre un dataset no descrito ("generator"), se desconoce su cobertura de acentos, estilos de recitación y variantes de qira'at.
- Riesgo de alucinación inherente a los modelos CTC: pueden producir transcripciones plausibles pero incorrectas en audio ruidoso, con solapamiento de voces o con recitación fuera del dominio.
- No se especifican los idiomas soportados; el uso fuera del árabe coránico probablemente degrade gravemente el rendimiento.
- No se han publicado métricas de evaluación (WER/CER), por lo que no es posible cuantificar su calidad frente al modelo base ni frente a alternativas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base podría tener condiciones adicionales no verificadas en esta información.
- El dataset de entrenamiento es desconocido en composición y tamaño, lo que impide evaluar posibles sesgos de dominio o sobreajuste.
- La fecha de creación indicada (2026-11-22) es futura respecto a la elaboración de esta ficha; conviene verificar la vigencia de los metadatos.
- Para producción, es imprescindible evaluar el modelo con un conjunto de validación propio antes de desplegarlo, dado que no hay benchmarks publicados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jodijhouranda/ayata-quran-ctc-v3
- Modelo base: https://huggingface.co/HamzaSidhu786/wav2vec2-base-word-by-word-quran-asr
