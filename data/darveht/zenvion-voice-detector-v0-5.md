# Darveht/zenvion-voice-detector-v0.5

## Resumen

Zenvion Voice Detector v0.5 es un modelo de clasificación de audio desarrollado por Darveht que aborda el análisis multi-tarea de voz en una sola pasada hacia delante. Se construye sobre el backbone preentrenado `facebook/wav2vec2-base-960h` y añade ocho cabeceras de tarea independientes para detección de actividad de voz (VAD), género, emoción, idioma, edad, tipo de ruido acústico, intención conversacional y acento. El modelo está pensado para pipelines de procesamiento de habla que necesitan múltiples etiquetas por fragmento de audio sin ejecutar varios modelos en cascada.

Es relevante ahora por su enfoque de ingeniería transparente: la versión v0.5 se publica explícitamente como una **release de código sin pesos entrenados**. El autor documenta una auditoría de la v0.4 que reveló que las cabeceras de tarea nunca se entrenaron (sesgos a cero exacto y pesos con desviación típica de 0,0200, valores por defecto de inicialización de transformers), por lo que las métricas publicadas en v0.4 no podían corresponder a los pesos distribuidos. En consecuencia, v0.5 elimina todas las tablas de benchmarks y el `model-index` en lugar de repetir cifras no verificadas.

La arquitectura es un transformer wav2vec2 con backbone de aproximadamente 95 millones de parámetros y cabeceras multi-tarea añadidas. El modelo declara soporte para más de 50 idiomas en sus metadatos, aunque no hay evidencia de entrenamiento multilingüe real en esta versión. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer wav2vec2 (CNN feature extractor + encoder transformer) con cabeceras multi-tarea |
| Parametros totales | No disponible (backbone base de wav2vec2 ~95M; total con cabeceras no especificado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (wav2vec2 procesa audio en ventanas; longitud máxima de entrada no especificada) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Metadatos declaran más de 50 idiomas (en, es, fr, de, it, pt, nl, pl, ru, zh, ja, ko, ar, hi, tr, vi, th, id, ms, fil, bn, ta, te, mr, gu, kn, ml, pa, ur, fa, he, uk, ro, cs, sv, da, no, fi, el, hu, sk, bg, hr, sr, sl, et, lv, lt, ca, gl); sin evidencia de entrenamiento multilingüe real |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (según auditoría de v0.4); v0.5 no publica pesos entrenados |

## Arquitectura y entrenamiento

El modelo parte de `facebook/wav2vec2-base-960h`, un transformer preentrenado con aprendizaje autosupervisado sobre audio de habla en inglés. Sobre el backbone se añaden ocho cabeceras de clasificación independientes, una por tarea: VAD a nivel de utterance, VAD a nivel de frame (`vad_frame_head`, con logits a ~50 Hz), género, emoción, idioma, edad, tipo de ruido e intención conversacional. La versión v0.5 introduce pooling atencional por tarea (`poolings`), pérdida ponderada por tarea (VAD y VAD por frame con peso ×2,0, el resto ×1,0), label smoothing, escalado de temperatura por tarea, pesos de clase por frecuencia inversa (`set_class_weights()`) y grupos de learning rate separados para cabeceras y backbone (`trainable_parameter_groups`).

La auditoría de v0.4 documentada por el autor identificó dos defectos críticos: (1) LayerDrop activo (`config.layerdrop = 0.1`) en el backbone hacía que el encoder devolviera entre 11 y 13 estados ocultos, mientras el vector de pesos de capa tenía 13 entradas fijas, provocando un fallo por desajuste de tamaño en la mayoría de batches; (2) los learning rates separados prometidos en el README no estaban implementados, usando un único LR de 3e-4. v0.5 desactiva LayerDrop y corrige la inicialización Xavier que v0.4 sobrescribía silenciosamente con el valor por defecto de 0,02. No se especifican el número de tokens de entrenamiento ni la composición exacta del dataset, aunque los metadatos listan Common Voice 16.1, FLEURS, Speech Commands, RAVDESS y CREMA-D como fuentes previstas.

## Capacidades

- Clasificación de actividad de voz (VAD) a nivel de utterance y a nivel de frame (~50 Hz) con segmentación por histéresis.
- Detección de género a partir de audio.
- Detección de emoción (entrenamiento previsto sobre RAVDESS y CREMA-D).
- Identificación de idioma (metadatos declaran más de 50 idiomas).
- Estimación de edad.
- Clasificación de tipo de ruido acústico (robustez al ruido declarada en tags).
- Detección de intención conversacional.
- Detección de acento.
- Inferencia multi-tarea en una sola pasada hacia delante (8 tareas simultáneas).
- Extracción de características (`feature-extraction` en los tags de pipeline).
- No se documenta soporte de tool calling, agentes ni razonamiento multi-paso (no aplica a un modelo de clasificación de audio).

## Casos de uso

- **Detección de actividad de voz en pipelines de ASR**: el modelo puede actuar como etapa previa de segmentación, filtrando silencios antes de enviar audio a un sistema de reconocimiento de habla. La cabecera de VAD por frame a ~50 Hz permite delimitar turnos de habla con precisión temporal.
- **Enrutamiento de llamadas por idioma en atención al cliente**: la cabecera de identificación de idioma permitiría, en teoría, derivar una llamada entrante al agente o modelo ASR adecuado. Requiere validación tras entrenamiento, dado que no hay pesos entrenados publicados.
- **Moderación y análisis de contenido en plataformas de audio**: la combinación de detección de emoción, intención conversacional y acento podría usarse para clasificar fragmentos de audio en revisiones de contenido, aunque la fiabilidad no está verificada.
- **Análisis de locutor en investigación lingüística**: extracción simultánea de género, edad y acento estimados para estudios sociolingüísticos a escala, con la advertencia de que las etiquetas son estimaciones probabilísticas y no identidades verificadas.
- **Preprocesamiento en pipelines de reconocimiento de habla robusto al ruido**: la clasificación de tipo de ruido permitiría seleccionar modelos de mejora o denoising específicos según la condición acústica detectada.
- **Sistemas de transcripción diarizada**: el VAD por frame combinado con características del backbone puede servir como componente de segmentación en sistemas de diarización, aunque el modelo no incluye una cabecera de identificación de locutor propiamente dicha.
- **Investigación en aprendizaje multi-tarea para audio**: el código de v0.5, con su pipeline de entrenamiento corregido, pooling por tarea y auditoría de pesos (`audit_weights.py`), sirve como base reproducible para experimentos de multi-task learning sobre wav2vec2.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de v0.5 elimina explícitamente todas las tablas de benchmarks y el `model-index` de v0.4 porque las cifras anteriores (VAD 96,2 %, emoción 84,7 %, LangID 91,3 %, todas marcadas `verified: false`) no podían corresponder a los pesos distribuidos, que tenían las cabeceras sin entrenar. No existen pesos entrenados de v0.5 ni métricas verificadas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Para un backbone wav2vec2-base (~95M parámetros) en fp32 se estiman del orden de 1-2 GB de VRAM incluyendo activaciones para audio de pocos segundos; en fp16 aproximadamente la mitad. Estas cifras son estimaciones por tamaño de arquitectura, no datos publicados por el autor.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM debería poder ejecutar el backbone en fp32 para fragmentos cortos; no hay requisitos oficiales publicados.
- Cabe en GPU de consumo: sí, previsiblemente en GTX 1660, RTX 3060, RTX 4060 y superiores, dado el tamaño del backbone. No verificado por el autor.
- Opciones de despliegue: la librería declarada es `transformers` con `pipeline: audio-classification`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no a clasificación de audio). El modelo usa `custom_code`, por lo que requiere `trust_remote_code=True`.
- Latencia y throughput: no disponibles. El autor reporta que el pipeline de entrenamiento se verificó en CPU sin GPU (smoke test de 17 comprobaciones y una época end-to-end sobre datos sintéticos), pero no publica cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / audio | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Zenvion Voice Detector v0.5 | Backbone ~95M + cabeceras | No especificado | 8 tareas multi-task | Apache 2.0 | Código publicado; sin pesos entrenados |
| facebook/wav2vec2-base-960h | ~95M | Audio de habla, ventanas variables | ASR (inglés) | Apache 2.0 | Pesos preentrenados y fine-tuned disponibles |
| Silero VAD | No disponible | Ventanas de audio | VAD únicamente | MIT (según versión) | Pesos entrenados y ampliamente usados en producción |
| pyannote/segmentation | No disponible | Audio con solapamiento | Diarización y segmentación | Condicional (requiere aceptar términos) | Pesos entrenados disponibles |

La comparación directa es limitada: Zenvion v0.5 no distribuye pesos entrenados, mientras que las alternativas sí ofrecen checkpoints verificados. Su propuesta diferencial es la unificación de ocho tareas en un solo modelo y una pipeline de entrenamiento auditable, no un rendimiento medido.

## Limitaciones y advertencias

- **Sin pesos entrenados**: v0.5 es una release de código; no hay checkpoint entrenado ni métricas de precisión. No debe usarse en producción tal cual.
- **Historial de métricas no verificadas**: la v0.4 publicó cifras de benchmark que, según la auditoría del propio autor, no podían provenir de los pesos distribuidos. Cualquier referencia a esos números debe descartarse.
- **Riesgo de sesgo en género, edad, acento y emoción**: son tareas de clasificación sensible; los modelos de audio entrenados con datasets como RAVDESS o CREMA-D suelen mostrar sesgos de género, edad y origen lingüístico. No hay evaluación de sesgo publicada.
- **Riesgo de alucinación de etiquetas**: al ser un clasificador multi-tarea, siempre emitirá una etiqueta por tarea aunque el audio no contenga señal suficiente; la calibración (temperatura por tarea) está implementada pero no validada con pesos entrenados.
- **Soporte multilingüe no demostrado**: los metadatos declaran más de 50 idiomas, pero el backbone base está preentrenado en inglés y no hay evidencia de entrenamiento multilingüe efectivo.
- **Dependencia de `custom_code`**: requiere `trust_remote_code=True` en transformers, lo que implica ejecutar código del repositorio; conviene auditar `model.py` antes de desplegar.
- **Licencia Apache 2.0**: permite uso comercial, pero al no existir pesos entrenados la licencia se aplica al código, no a un artefacto utilizable.
- **Advertencia del autor**: no publicar un checkpoint construido con este código como "entrenado" salvo que haya pasado el entrenamiento completo y `audit_weights.py --expect-trained`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Darveht/zenvion-voice-detector-v0.5
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/Darveht/zenvion-voice-detector-demo
- Modelo base: https://huggingface.co/facebook/wav2vec2-base-960h
- Dataset Common Voice 16.1: https://huggingface.co/datasets/mozilla-foundation/common_voice_16_1
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
- Dataset Speech Commands: https://huggingface.co/datasets/speech_commands
- Dataset RAVDESS: https://huggingface.co/datasets/ravdess
- Dataset CREMA-D: https://huggingface.co/datasets/crema-d
