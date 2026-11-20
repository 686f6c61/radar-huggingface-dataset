# ina-foss/ssl-vad-base

## Resumen

`ina-foss/ssl-vad-base` es un modelo de detección de actividad de voz (VAD, *Voice Activity Detection*) publicado por el grupo INA-FOSS en Hugging Face. Se trata de un *fine-tuning* del modelo base `ina-foss/ssl-audio-1k-base`, un codificador auto-supervisado de audio, adaptado específicamente para la tarea de clasificar tramos de audio como voz o no voz. El modelo se distribuye en formato safetensors con código personalizado (`custom_code`), lo que implica que su uso requiere confiar en la implementación incluida en el repositorio y cargarla con `trust_remote_code=True` en la librería Transformers.

La relevancia de este modelo radica en que aborda el VAD desde una perspectiva de representaciones auto-supervisadas en lugar de los clásicos detectores basados en energía o en características acústicas manuales. Al partir de un codificador preentrenado sobre audio, el modelo puede potencialmente generalizar mejor en condiciones de ruido, dominios acústicos variados y distintos tipos de habla, aunque no se han publicado resultados de benchmarks en la información disponible que permitan cuantificar esa ventaja.

El acceso al modelo está restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de poder descargarlo. La licencia declarada es `pantagruel-research-license`, una licencia de tipo *other* que debe revisarse con detalle antes de cualquier uso, especialmente comercial. El tamaño del repositorio es de aproximadamente 0,1 GB, lo que sugiere un modelo compacto y desplegable en hardware modesto, aunque no se especifican los parámetros exactos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de un codificador SSL de audio, `ssl-audio-1k-base`) |
| Parametros totales | no disponible (repo de ~0,1 GB) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el VAD es independiente del idioma en principio) |
| Licencia | pantagruel-research-license |
| Formato de pesos | safetensors (con `custom_code`) |

## Arquitectura y entrenamiento

El modelo es un *fine-tuning* del codificador `ina-foss/ssl-audio-1k-base`, un modelo auto-supervisado de audio. La información disponible no detalla la arquitectura interna del codificador base (si es un transformer tipo wav2vec 2.0, HuBERT, WavLM o una variante propia), ni el número de parámetros, ni la composición del corpus de preentrenamiento. El sufijo "1k" en el nombre del modelo base sugiere un preentrenamiento sobre aproximadamente 1.000 horas de audio, pero esto no está confirmado en la información proporcionada.

La adaptación a VAD se realiza mediante *fine-tuning* supervisado sobre el codificador, con una cabeza de clasificación por tramas o por segmentos. No se especifican en la información disponible el número de tokens o horas de audio utilizados en el ajuste, la composición del dataset de VAD (proporción voz/no voz, tipos de ruido, idiomas), ni si se emplearon técnicas como RLHF, DPO o aumentación de datos. Tampoco se documentan innovaciones técnicas específicas (decodificación especulativa, atención lineal, etc.). El repositorio incluye código personalizado (`custom_code`), lo que indica que la implementación de la arquitectura o del preprocesado no es estándar en Transformers y debe cargarse desde el propio repositorio.

## Capacidades

- Detección de actividad de voz: clasificación de audio en tramos de voz y no voz, pipeline `voice-activity-detection`.
- Extracción de características: el tag `feature-extraction` indica que el modelo puede usarse para obtener representaciones del audio, no solo para la clasificación final.
- Procesamiento de habla independiente del idioma: la tarea VAD no requiere modelado lingüístico, aunque no se especifican idiomas evaluados.
- Integración con Transformers: carga mediante `AutoModel` con `trust_remote_code=True` y pipeline de audio.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio generativo ni modo de razonamiento (*thinking mode*).

## Casos de uso

- Segmentación de audio para ASR: el modelo puede usarse como paso previo a un sistema de reconocimiento automático de habla para recortar los tramos con voz y descartar silencio y ruido, reduciendo coste computacional y falsos positivos del ASR.
- Diarización de hablantes: al detectar con precisión los tramos de voz, sirve como etapa de preprocesado en pipelines de diarización, delimitando las regiones donde aplicar los modelos de *speaker embedding*.
- Filtrado de llamadas en atención al cliente: en sistemas de telefonía o *contact center*, permite distinguir voz humana de ruido de fondo, música o silencio antes de enrutar la llamada a un agente o a un bot.
- Detección de presencia en dispositivos de borde: dado el tamaño compacto del repositorio (~0,1 GB), es candidato para despliegue en dispositivos con recursos limitados que necesitan activar grabación o procesamiento solo cuando hay voz.
- Preprocesado de datasets de habla: para limpiar corpus de audio, eliminando segmentos sin voz antes de entrenar modelos ASR o TTS.
- Monitorización de calidad de audio en producción: en pipelines de transcripción de reuniones o podcasts, detectar tramos sin voz para marcar silencios, cortes o fallos de micrófono.
- Investigación en representaciones SSL: como punto de partida para experimentos que comparen VAD basado en SSL frente a VAD clásico basado en energía o características acústicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa ~0,1 GB, lo que sugiere que el modelo cabe holgadamente en GPUs de consumo, pero no se confirman los parámetros ni el consumo real en inferencia.
- GPU recomendadas: no disponible. Por tamaño, es plausible ejecutarlo en GPUs de consumo (RTX 3060, RTX 4090) e incluso en CPU, pero esto no está verificado en la información proporcionada.
- Cabe en GPU de consumo: probablemente sí, dado el tamaño del repositorio, aunque no confirmado.
- Opciones de despliegue: Transformers con `trust_remote_code=True` (la librería declarada); no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ina-foss/ssl-vad-base | no disponible | no disponible | VAD sobre codificador SSL | pantagruel-research-license | Gated en HF |
| Silero VAD | no disponible (modelo compacto, ~1-2 MB en ONNX) | no disponible | VAD | MIT (según distribución pública) | Pública |
| WebRTC VAD | no disponible (algoritmo clásico) | no disponible | VAD basado en energía/GMM | BSD | Pública |

La comparación con Silero VAD y WebRTC VAD se ofrece como referencia de categoría; no se dispone de datos de rendimiento comparativo del modelo INA-FOSS frente a ellos en la información proporcionada.

## Limitaciones y advertencias

- Acceso restringido: el modelo es *gated* y requiere aceptar condiciones en Hugging Face; no es descargable de forma anónima.
- Licencia `pantagruel-research-license`: licencia de tipo *other*; es imprescindible revisar sus términos antes de cualquier uso comercial o redistribución.
- Requiere `trust_remote_code=True`: el repositorio incluye código personalizado que se ejecutará en local; conviene auditar el código antes de usarlo en producción.
- No se documentan sesgos conocidos, pero al ser un modelo de audio, puede presentar diferencias de rendimiento entre idiomas, acentos, géneros y condiciones acústicas no representadas en su dataset de ajuste.
- Riesgo de falsos positivos y falsos negativos en VAD: no se han publicado métricas (F1, AUC, tasa de error) que permitan caracterizar el comportamiento en dominios ruidosos.
- No se especifican idiomas soportados ni limitaciones de contexto; el VAD es en principio independiente del idioma, pero no está verificado.
- Sin benchmarks publicados: no es posible comparar objetivamente su calidad frente a alternativas establecidas como Silero VAD.
- Uso en producción: al no documentarse latencia, throughput ni formato ONNX, la integración en sistemas de baja latencia requiere validación empírica propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ina-foss/ssl-vad-base
- Modelo base: https://huggingface.co/ina-foss/ssl-audio-1k-base
- Organización INA-FOSS: https://huggingface.co/ina-foss
