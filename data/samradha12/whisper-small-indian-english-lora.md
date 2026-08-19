# Samradha12/whisper-small-indian-english-lora

## Resumen

El modelo `Samradha12/whisper-small-indian-english-lora` es un ajuste fino (fine-tuning) del sistema de reconocimiento automático de voz (ASR) `openai/whisper-small` mediante la técnica LoRA (Low-Rank Adaptation). El objetivo es mejorar la precisión de transcripción para hablantes de inglés con acento indio, un caso de uso frecuente en entornos empresariales y de atención al cliente en la India. El autor, Samradha12, ha utilizado aproximadamente 45 horas de audio en inglés con acento indio procedentes del dataset Mozilla Common Voice.

El modelo mantiene la arquitectura original de Whisper (encoder-decoder transformer) y solo entrena los adaptadores LoRA sobre las proyecciones de consulta y valor (`q_proj` y `v_proj`), lo que reduce drásticamente el número de parámetros entrenables. Según los datos publicados, el WER (Word Error Rate) sobre un conjunto de prueba de 250 muestras baja del 13,15 % (modelo base) al 11,27 %, lo que supone una mejora relativa del 14,33 %. El repositorio incluye los pesos en formato `safetensors` y el modelo se puede cargar directamente con la librería `transformers`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) con adaptadores LoRA |
| Parametros totales | 241.734.912 (modelo base whisper-small) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 30 segundos de audio (ventana de Whisper) |
| Tipos de cuantizacion | No disponible (pesos en safetensors, cuantificable posteriormente) |
| Idiomas soportados | Ingles (enfocado en acento indio); el modelo base soporta 99 idiomas, pero el fine-tuning solo cubre ingles |
| Licencia | No disponible (el modelo base es MIT, pero el fine-tuning no especifica licencia) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `openai/whisper-small`, un transformer encoder-decoder con atención estándar, diseñado para convertir audio en texto. El fine-tuning se realiza mediante LoRA con rango `r=8`, `alpha=32` y módulos objetivo `q_proj` y `v_proj` de las capas de atención. Esto significa que solo se actualizan las matrices de bajo rango asociadas a esas proyecciones, dejando el resto de pesos congelados. El entrenamiento se llevó a cabo durante 1500 pasos con una tasa de aprendizaje de `3e-4` sobre un conjunto de datos de aproximadamente 45 horas de inglés con acento indio extraído de Mozilla Common Voice. No se menciona el uso de RLHF ni DPO; el proceso es un ajuste supervisado estándar de ASR.

## Capacidades

- Reconocimiento de voz (ASR) para inglés con acento indio, con mejora del WER frente al modelo base.
- Transcripción de audio a texto en inglés, manteniendo las capacidades generales de Whisper para otros acentos (aunque con menor precisión).
- No soporta tool calling, agentes, visión ni modos de razonamiento especiales.
- Capacidad multilingüe limitada: el fine-tuning se centra en inglés, aunque el modelo base puede transcribir otros idiomas si se le proporciona el prompt adecuado.

## Casos de uso

- Transcripción de reuniones y llamadas en entornos corporativos indios: el modelo reduce errores en acentos locales, mejorando la precisión de actas y resúmenes automáticos.
- Subtitulado automático de vídeos y podcasts producidos por hablantes indios: la mejora del WER facilita la generación de subtítulos más fiables.
- Atención al cliente automatizada: integración en sistemas de IVR o chatbots que necesitan transcribir consultas de usuarios con acento indio antes de procesarlas.
- Asistentes de voz para aplicaciones móviles o domótica dirigidas al mercado indio: la transcripción localizada mejora la comprensión de comandos.
- Análisis de llamadas de centros de contacto: permite extraer métricas de calidad y sentimiento a partir de grabaciones con acento indio.
- Herramientas de accesibilidad: transcripción en tiempo real para personas con discapacidad auditiva que interactúan con hablantes indios.

## Benchmarks y rendimiento

El autor reporta los siguientes resultados sobre un conjunto de prueba de 250 muestras de Common Voice con acento indio:

| Modelo | WER |
|---|---|
| whisper-small (baseline) | 13,15 % |
| whisper-small + LoRA (este modelo) | 11,27 % |

Mejora relativa: 14,33 %. No se han publicado comparaciones con otros modelos fine-tuned ni con variantes de Whisper de mayor tamaño.

## Requisitos de hardware

- VRAM estimada: el modelo base tiene ~244M parámetros; en fp16 ocupa aproximadamente 500 MB, y en int8 unos 250 MB. Con los adaptadores LoRA, el incremento es mínimo (unos pocos MB).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia en fp16. Una RTX 3060, RTX 4060 o similar puede ejecutarlo con holgura.
- Cabe en GPUs de consumo: sí, incluso en tarjetas integradas con suficiente memoria compartida.
- Opciones de despliegue: se puede servir con `transformers` (pipeline de ASR), `vLLM` (aunque no es óptimo para Whisper), `whisper.cpp` (si se convierten los pesos a GGUF) o `Ollama` (con conversión previa). Para producción, se recomienda usar `transformers` con `torch.compile` o `CTranslate2`.
- Latencia y throughput: no se han publicado mediciones. Para un audio de 30 segundos, la inferencia en una GPU moderna suele tardar menos de 1 segundo en fp16.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER (acento indio) | Licencia |
|---|---|---|---|---|
| openai/whisper-small | 244M | 30 s audio | 13,15 % | MIT |
| Samradha12/whisper-small-indian-english-lora | 244M + LoRA | 30 s audio | 11,27 % | No disponible |
| openai/whisper-medium | 769M | 30 s audio | No disponible | MIT |

No se dispone de datos de WER para whisper-medium en el mismo conjunto de prueba, por lo que no se puede establecer una comparación directa. El modelo LoRA ofrece una mejora significativa sobre el base con un coste de entrenamiento bajo y sin aumentar la latencia de inferencia.

## Limitaciones y advertencias

- El fine-tuning se ha realizado únicamente sobre inglés con acento indio; el rendimiento en otros acentos o idiomas puede degradarse respecto al modelo base.
- El conjunto de datos (Common Voice) puede contener sesgos de género, edad o registro lingüístico que afecten a la precisión en poblaciones específicas.
- Como todo sistema ASR, existe riesgo de alucinaciones (transcripciones inventadas) en segmentos de audio ambiguos o con ruido.
- La licencia no está especificada en el repositorio; aunque el modelo base es MIT, el fine-tuning podría tener restricciones adicionales. Se recomienda contactar con el autor antes de un uso comercial.
- No se han publicado evaluaciones de robustez frente a ruido, solapamiento de hablantes o acentos regionales dentro de la India (p. ej., hindi, tamil, bengalí).
- El contexto de audio está limitado a 30 segundos por segmento; para audios largos se requiere segmentación previa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Samradha12/whisper-small-indian-english-lora
- Modelo base: https://huggingface.co/openai/whisper-small
- Dataset Mozilla Common Voice: https://commonvoice.mozilla.org/
