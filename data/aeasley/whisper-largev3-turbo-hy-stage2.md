# aeasley/whisper-largev3-turbo-hy-stage2

## Resumen

`aeasley/whisper-largev3-turbo-hy-stage2` es un adaptador LoRA (PEFT) publicado por aeasley sobre el modelo base `aeasley/whisper-largev3-turbo-hy`, que a su vez deriva de la arquitectura Whisper large-v3-turbo de OpenAI. El adaptador está orientado al reconocimiento automático de habla (ASR) en armenio (código de idioma `hy`), un idioma de bajos recursos para el que existen pocos modelos ASR ajustados. El repositorio ocupa apenas 0,1 GB, lo que confirma que se trata de pesos de adaptador y no del modelo completo.

El modelo se enmarca en la familia Whisper de OpenAI: un transformer encoder-decoder con atención estándar, entrenado originalmente para transcripción multilingüe y traducción de voz. La variante "turbo" de large-v3 reduce el número de capas del decoder para acelerar la inferencia manteniendo una precisión cercana al large-v3 completo. Este adaptador representa una segunda etapa de ajuste ("stage2") sobre un ajuste previo del mismo autor, probablemente dentro de una estrategia de entrenamiento progresivo.

La relevancia de esta ficha es limitada por la escasez de información publicada: la model card es autogenerada por el Trainer de Hugging Face, no documenta el dataset de entrenamiento ni los usos previstos, y las métricas declaradas (WER de 394,35 en el conjunto de evaluación) indican un resultado claramente deficiente o un problema de configuración en la evaluación. Cualquier uso en producción debería tratarse con extrema cautela hasta que el autor publique documentación fiable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo) con adaptador LoRA |
| Parametros totales | no disponible (adaptador LoRA sobre Whisper large-v3-turbo, ~809M en el modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper procesa ventanas de audio de 30 segundos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | armenio (`hy`) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia Whisper large-v3-turbo: un transformer encoder-decoder con embeddings convolucionales de audio en la entrada, atención multi-cabeza estándar y decodificación autorregresiva de tokens de texto. La variante turbo reduce el decoder a 4 capas (frente a 32 en large-v3), lo que acelera la inferencia aproximadamente 8 veces con una pérdida de precisión mínima en la mayoría de idiomas. Sobre esta base, el autor aplica un adaptador LoRA entrenado con PEFT 0.21.2 y Transformers 5.22.2.

Los hiperparámetros documentados son: learning rate 0,001, batch size 16 (entrenamiento y evaluación), semilla 42, optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-8, scheduler lineal con 500 pasos de warmup y un total de 4000 pasos de entrenamiento. El dataset de entrenamiento no está especificado ("unknown dataset" en la model card). No se documentan técnicas de RLHF, destilación ni decodificación especulativa. La evolución del WER durante el entrenamiento es errática: 197,11 en el paso 1000, 69,71 en el 2000, 1628,74 en el 3000 y 394,35 en el 4000, lo que sugiere inestabilidad en la evaluación o problemas de normalización del texto de referencia.

## Capacidades

- Transcripción de voz a texto en armenio (`hy`), heredando la arquitectura ASR de Whisper large-v3-turbo.
- Reconocimiento de habla multilingüe limitado al armenio en este ajuste concreto (el modelo base soporta más idiomas, pero el adaptador está especializado).
- Manejo de audio de hasta 30 segundos por ventana, con segmentación para audios más largos mediante el pipeline de Whisper.
- No se documenta soporte de tool calling, function calling ni uso como agente.
- No se documenta modo de razonamiento explícito (thinking mode), visión ni audio más allá de la transcripción.
- Capacidad de traducción de voz potencialmente heredada del base, aunque no verificada ni documentada para este adaptador.

## Casos de uso

- Transcripción de audio en armenio para archivística y digitalización: el adaptador puede transcribir grabaciones históricas u orales en armenio, aunque el WER declarado exige validación manual previa.
- Subtitulado automático de vídeos en armenio: integrable en pipelines de Whisper para generar subtítulos, con revisión humana obligatoria dado el rendimiento reportado.
- Investigación lingüística sobre armenio: útil como punto de partida para experimentos de ajuste fino adicional o comparación de estrategias LoRA en idiomas de bajos recursos.
- Prototipado de asistentes de voz en armenio: permite experimentar con ASR en un idioma poco cubierto antes de invertir en datasets propios.
- Evaluación comparativa de adaptadores LoRA para Whisper: sirve como referencia metodológica (con sus limitaciones) para estudiar el efecto del entrenamiento progresivo en dos etapas.
- Base para ajustes posteriores: el adaptador puede combinarse con otros adaptadores PEFT o servir de inicialización para un fine-tuning completo sobre datos propios de armenio.

## Benchmarks y rendimiento

La model card declara métricas de evaluación, pero el model-index oficial no contiene resultados estructurados. Los datos disponibles son:

| Metrica | Valor declarado |
|---|---|
| Loss (evaluacion final) | 0,1670 |
| WER (evaluacion final) | 394,3505 |
| WER (paso 1000) | 197,1085 |
| WER (paso 2000) | 69,7064 |
| WER (paso 3000) | 1628,7367 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El WER de 394,35 es anómalo para ASR (los valores habituales se expresan en porcentaje, 0-100) y probablemente refleja un problema de formato o normalización en la evaluación; no debe interpretarse como rendimiento real sin verificación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el adaptador LoRA en sí ocupa ~0,1 GB, pero requiere cargar el modelo base Whisper large-v3-turbo (~1,6 GB en fp16, ~3,2 GB en fp32) más overhead de activaciones.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para fp16; A100, H100 o RTX 4090 sobran para este tamaño.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4070, RTX 4090 y similares; también en GPUs de 8 GB con cuantización o batch pequeño.
- Opciones de despliegue: transformers con PEFT (carga del adaptador), vLLM no aplica directamente a ASR, llama.cpp no soporta Whisper de forma nativa, faster-whisper requiere conversión de pesos; TGI no da soporte directo a Whisper.
- Latencia y throughput: no disponible; la arquitectura turbo del base está optimizada para inferencia rápida (hasta ~8x frente a large-v3), pero no hay mediciones publicadas para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| aeasley/whisper-largev3-turbo-hy-stage2 | Adaptador LoRA sobre ~809M | 30 s por ventana | armenio | MIT | Hugging Face (0 descargas) |
| openai/whisper-large-v3-turbo | ~809M | 30 s por ventana | multilingue (99 idiomas) | MIT | Hugging Face, ampliamente usado |
| openai/whisper-large-v3 | ~1550M | 30 s por ventana | multilingue (99 idiomas) | MIT | Hugging Face |
| aeasley/whisper-largev3-turbo-hy (base) | Adaptador LoRA sobre ~809M | 30 s por ventana | armenio | MIT (segun repo) | Hugging Face |

No se dispone de datos de rendimiento comparativo verificables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El WER declarado (394,35) es anómalo y sugiere que la evaluación no está bien configurada o que el modelo no funciona correctamente; no debe usarse en producción sin validación independiente.
- La model card es autogenerada y no documenta el dataset de entrenamiento, los usos previstos ni las limitaciones; falta información crítica para evaluar sesgos.
- El adaptador está especializado únicamente en armenio; no se ha verificado su comportamiento en otros idiomas del base.
- Riesgo elevado de alucinación en transcripción, especialmente con audio ruidoso, acentos no representados en el dataset de ajuste o vocabulario técnico.
- Licencia MIT permite uso comercial, pero al derivar de Whisper (también MIT) conviene revisar las condiciones del modelo base y de los datos de entrenamiento no documentados.
- Solo 0 descargas y 0 likes en Hugging Face: no hay evidencia de uso comunitario ni de validación externa.
- No hay garantías sobre la calidad de los pesos del adaptador ni sobre su compatibilidad con versiones de PEFT distintas de 0.21.2.

## Enlaces

- Hugging Face: https://huggingface.co/aeasley/whisper-largev3-turbo-hy-stage2
- Modelo base del adaptador: https://huggingface.co/aeasley/whisper-largev3-turbo-hy
- Whisper large-v3-turbo (OpenAI): https://huggingface.co/openai/whisper-large-v3-turbo
- Paper de Whisper: https://arxiv.org/abs/2212.04356
- Repositorio PEFT: https://github.com/huggingface/peft
- Repositorio Transformers: https://github.com/huggingface/transformers
