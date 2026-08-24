# manishehehe/whisper-small-telugu-lora

## Resumen

El modelo `manishehehe/whisper-small-telugu-lora` es un adaptador LoRA (Low-Rank Adaptation) sobre el modelo de reconocimiento automático del habla (ASR) `openai/whisper-small`, afinado específicamente para la transcripción de audio en telugu. Desarrollado por manishehehe, este adaptador aborda el problema de la escasez de modelos ASR de calidad para lenguas indias de bajos recursos, ofreciendo una solución ligera y eficiente: solo se entrenan alrededor de 1,8 millones de parámetros, lo que representa el 0,7 % del modelo base. Se entrenó con 500 frases del conjunto de datos FLEURS (partición `te_in`) en aproximadamente 35 minutos en una GPU T4 de Google Colab.

La relevancia de este modelo radica en su enfoque de adaptación paramétrica eficiente (PEFT) aplicado al telugu, un idioma con pocos recursos digitales. Al no modificar los pesos del modelo base, el adaptador puede distribuirse por separado y combinarse con cualquier checkpoint de `openai/whisper-small`. La licencia MIT permite uso comercial sin restricciones, lo que facilita su integración en aplicaciones de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre openai/whisper-small (transformer encoder-decoder) |
| Parametros totales | No disponible (el adaptador añade ~1,8 millones de parametros entrenables al modelo base) |
| Parametros activos | No disponible (no es una arquitectura MoE) |
| Longitud de contexto | No disponible (Whisper-small procesa audio en ventanas de 30 segundos) |
| Tipos de cuantizacion | No disponible (adaptador en safetensors, sin cuantizacion publicada) |
| Idiomas soportados | Telugu (te) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA que se aplica a las proyecciones `q_proj` y `v_proj` de los bloques de atención del modelo Whisper-small. La configuración de LoRA es `r=32`, `alpha=64` y `dropout=0.05`, lo que resulta en aproximadamente 1,8 millones de parámetros entrenables. El entrenamiento se realizó sobre 500 frases del dataset `google/fleurs` (partición `te_in`), con un total de 500 pasos, un tamaño de lote efectivo de 32, una tasa de aprendizaje de 1e-3 y precisión fp16. Se utilizó una única GPU T4 de Google Colab, completando el proceso en unos 35 minutos. No se emplearon técnicas de RLHF ni DPO; se trata de un ajuste fino supervisado clásico para ASR.

## Capacidades

- Transcripción automática del habla en telugu, generando texto en el mismo idioma.
- Reconocimiento de voz con salida de texto plano, compatible con el pipeline de Hugging Face `automatic-speech-recognition`.
- Integración sencilla con `transformers` y `peft` para cargar el adaptador junto con el modelo base.
- Capacidad multilingüe heredada de Whisper-small (aunque el adaptador está entrenado solo para telugu, el modelo base soporta 96 idiomas).
- No se detectaron capacidades de tool calling, agentes, razonamiento multistep, visión o audio multimodal más allá del ASR.

## Casos de uso

- **Transcripción de reuniones y entrevistas en telugu**: el adaptador puede transcribir grabaciones de audio de reuniones o entrevistas en telugu, generando texto que puede archivarse o procesarse posteriormente. Su bajo coste de inferencia (al ser un adaptador ligero) permite usarlo en aplicaciones de escritorio o servidores modestos.
- **Subtitulado automático de vídeo**: integrar el modelo en un pipeline de subtitulado para vídeos en telugu, generando subtítulos en tiempo real o con procesamiento por lotes. La licencia MIT permite su uso en plataformas de publicación de vídeo sin restricciones comerciales.
- **Asistente de voz para aplicaciones móviles**: el modelo puede servir como motor de reconocimiento de voz en apps de mensajería o asistentes personales en telugu, convirtiendo comandos de voz en texto para su procesamiento posterior.
- **Archivo y digitalización de contenido oral**: instituciones culturales o académicas pueden transcribir grabaciones históricas o entrevistas en telugu para crear archivos de texto buscables. El adaptador es especialmente útil por su bajo coste de cómputo en comparación con un ajuste completo del modelo.
- **Investigación en ASR para lenguas indias**: como modelo de referencia para comparar técnicas de PEFT en telugu, sirve como punto de partida para experimentos con otros idiomas de la familia índica. El código de entrenamiento está disponible en GitHub, lo que permite replicar el proceso.
- **Prototipado rápido de ASR en entornos con recursos limitados**: al ser un adaptador que se entrena en menos de una hora en una GPU gratuita, es ideal para validar la viabilidad de un sistema ASR en telugu antes de invertir en un afinado completo o en modelos más grandes.

## Benchmarks y rendimiento

El autor proporciona resultados de WER (Word Error Rate) sobre un conjunto de evaluación fuera de dominio (IndicTTS, 60 frases, n=60). Se compara con el modelo base Whisper-small sin adaptador y con el modelo comercial Sarvam Saaras v3.

| Voz | WER base | WER LoRA | Δ relativo | Sarvam Saaras v3 |
|---|---|---|---|---|
| Telugu Female | 1.062 | 0.704 | −33,8 % | 0.363 |
| Telugu Male | 1.121 | 0.716 | −36,1 % | 0.377 |
| **Total (n=60)** | **1.091** | **0.709** | **−35,0 %** | **0.370** |

El adaptador reduce el WER en un 35 % respecto al modelo base, aunque no alcanza el rendimiento de Sarvam Saaras v3. El autor indica que los resultados son descriptivos y no se realizaron pruebas de significancia estadística.

## Requisitos de hardware

- El adaptador LoRA añade solo ~1,8 millones de parámetros, por lo que el requisito de VRAM es prácticamente el mismo que el de `openai/whisper-small` (alrededor de 1 GB en fp16, aunque no se indica oficialmente en la documentación del modelo).
- El entrenamiento se realizó en una GPU T4 (16 GB de VRAM) de Google Colab, lo que indica que la inferencia puede ejecutarse en GPUs consumer como una GTX 1080 Ti o RTX 3060, siempre que se disponga de al menos 4 GB de VRAM libre.
- El modelo se puede desplegar con las librerías `transformers` y `peft` en Python. También es compatible con `vLLM` o `TGI` para inferencia en servidor, aunque no se han publicado configuraciones optimizadas específicas.
- La latencia depende del hardware; en una T4 se espera una inferencia en tiempo real para audio de 30 segundos, pero no se han publicado medidas concretas.
- Para uso en CPU, se recomienda cuantizar el modelo base (por ejemplo, con `llama.cpp` o `ggml`), aunque el adaptador no está disponible en formato GGUF.

## Comparativa con modelos similares

No se dispone de datos públicos de benchmarks comparables para otros adaptadores LoRA de Whisper en telugu (por ejemplo, `AkhilaJallavaram24/whisper-small-telugu-lora` o `Samruddhi1916/whisper-telugu-lora`). En cuanto a modelos comerciales, Sarvam Saaras v3 presenta un WER de 0.370 en el mismo conjunto de evaluación, significativamente menor que el 0.709 del adaptador. Sin embargo, el adaptador es de código abierto, con licencia MIT, y puede desplegarse localmente sin coste de API. Otros modelos como `vasista22/whisper-telugu-small` (afinado completo de Whisper-small) existen, pero no se dispone de comparativas directas.

## Limitaciones y advertencias

- El conjunto de evaluación es pequeño (n=60) y los resultados de WER no están respaldados por pruebas de significancia estadística; la mejora del 35 % podría no ser reproducible en otros conjuntos.
- El entrenamiento se realizó en un único subconjunto de FLEURS (`te_in`) y el dominio de habla leída difiere del habla espontánea o de grabaciones de estudio (como las de IndicTTS). El modelo puede tener un rendimiento degradado en audio con ruido, acentos regionales o vocabulario coloquial.
- El adaptador solo soporta telugu; no se ha probado en otros idiomas índicos o en telugu de otras regiones.
- El modelo puede presentar alucinaciones (producir texto que no corresponde al audio) en segmentos de silencio o ruido, un comportamiento común en modelos ASR.
- La licencia MIT permite uso comercial, pero el modelo base `openai/whisper-small` está bajo la licencia MIT también, por lo que no hay restricciones adicionales conocidas.
- No se han publicado directrices de sesgo, y no se ha evaluado el rendimiento en hablantes de distintos géneros, edades o dialectos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/manishehehe/whisper-small-telugu-lora
- Código de entrenamiento: https://github.com/manishehehe/whisper-indic-lora
- Dataset base: https://huggingface.co/datasets/google/fleurs
- Modelo base: https://huggingface.co/openai/whisper-small
