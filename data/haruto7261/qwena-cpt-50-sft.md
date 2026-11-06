# Haruto7261/QwenA-CPT-50-SFT

## Resumen

QwenA-CPT-50-SFT es un modelo de lenguaje publicado por el usuario Haruto7261 en Hugging Face, derivado de la familia Qwen (la etiqueta de arquitectura del repositorio es `qwen3_5`). Con 9.653.104.368 parámetros totales según los pesos en safetensors, se trata de un modelo de aproximadamente 9,6 mil millones de parámetros, presumiblemente ajustado mediante entrenamiento continuado (CPT, continued pre-training) y posteriormente sometido a una fase de fine-tuning supervisado (SFT).

La relevancia del modelo reside en su especialización temática: la model card documenta un corpus centrado en diálogo japonés y, de forma muy destacada, en el dialecto de Kagoshima (萨隅方言, satsugū hōgen). El autor combina corpus conversacionales (Japanese-Daily-Dialogue, MACHAcorpus, RealPersonaChat), fuentes lexicográficas y divulgativas sobre dialectos japoneses, el corpus de actas parlamentarias (国会会議録) y corpus generales en japonés (Wikipedia, Aozora Bunko).

No obstante, la información pública es muy limitada: el repositorio no declara licencia, idiomas soportados, pipeline ni resultados de evaluación, y no cuenta con descargas ni interacciones en el momento de redactar esta ficha. Cualquier uso en producción debe partir de una validación empírica propia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (etiqueta de repositorio `qwen3_5`; detalles no disponibles) |
| Parámetros totales | 9.653.104.368 (≈9,6 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; no se incluyen GGUF) |
| Idiomas soportados | no disponibles oficialmente; el corpus de entrenamiento es mayoritariamente japonés |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El repositorio declara la etiqueta de arquitectura `qwen3_5`, lo que sitúa al modelo en la estirpe de transformers decoder-only de Qwen. El recuento de parámetros (9,65 B) no coincide con ningún tamaño canónico ampliamente documentado de la familia Qwen, por lo que probablemente se trate de un modelo base de dicha familia adaptado o reconfigurado por el autor. No se publican detalles sobre número de capas, dimensión oculta, mecanismo de atención ni estrategias de atención lineal o decodificación especulativa.

El nombre del modelo sugiere dos fases: un continued pre-training (CPT) sobre el corpus dialectal y conversacional descrito, seguido de un SFT (supervised fine-tuning). El corpus documentado incluye Japanese-Daily-Dialogue, MACHAcorpus y RealPersonaChat para diálogo; múltiples fuentes sobre dialectos de Kagoshima (Wikipedia «萨隅方言», 鹿児島弁ネット辞典, 方言ラボ, 47都道府県方言辞典, materiales del Instituto Nacional de Lengua Japonesa); el corpus de actas del parlamento japonés; Aozora Bunko y Wikipedia en japonés. No se especifica el volumen de tokens, la composición porcentual del dataset, ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto en japonés, con especial énfasis declarado en diálogo conversacional.
- Producción de texto en dialecto de Kagoshima (萨隅方言), a partir de las fuentes lexicográficas y divulgativas del corpus.
- Conversación multi-turno de estilo cotidiano, derivada de los corpus de diálogo empleados.
- Capacidad potencial de registro formal y parlamentario, por la inclusión de actas del Kokkai.
- Generación de prosa y estilo literario clásico-moderno, por el uso de Aozora Bunko.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de visión, audio o modo thinking: no disponibles.
- Capacidades multilingües: no documentadas; el entrenamiento parece centrado en japonés.

## Casos de uso

- Normalización y traducción de dialecto de Kagoshima: el modelo puede recibir texto en dialecto satsugū y generar una paráfrasis en japonés estándar, útil para subtitulado, accesibilidad o atención ciudadana en medios locales.
- Generación de diálogo dialectal para doblaje y ficción: producción de líneas conversacionales en dialecto para guiones, videojuegos o audiolibros ambientados en Kagoshima, aprovechando el corpus de diálogo y las fuentes lexicográficas.
- Asistente conversacional de proximidad: chatbot de atención en japonés con registro cotidiano, adecuado para prototipos de servicios locales, siempre que se valide el comportamiento fuera de dominio.
- Enriquecimiento de datasets dialectales: uso del modelo para generar pares dialecto-estándar y ampliar corpus anotados, con revisión humana posterior.
- Investigación en lingüística computacional: estudio de la adaptación de un LLM de ~9,6 B a una variedad dialectal concreta mediante CPT + SFT, comparando con el modelo base.
- Generación de texto con registro formal japonés: redacción de resúmenes o borradores inspirados en el estilo de actas parlamentarias, útil para prototipos de documentación administrativa.
- Prototipado de aplicaciones de escritura creativa en japonés: asistencia a la redacción de relatos o textos de estilo literario, dado el peso de Aozora Bunko en el corpus.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 19,3 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda un mínimo de 24 GB y, para contextos largos, 40 GB o más.
- Cuantización a 8 bits: en torno a 10-11 GB de pesos; cabe en GPUs consumer de 16 GB (RTX 4080, RTX 4060 Ti 16 GB) con margen ajustado.
- Cuantización a 4 bits: en torno a 5-6 GB de pesos; viable en RTX 3060 12 GB, RTX 4070 y superiores, con degradación de calidad no evaluada.
- GPUs recomendadas para FP16: A100 40/80 GB, H100, L40S; para inferencia consumer, RTX 4090 (24 GB) es el mínimo cómodo en precisión completa.
- Opciones de despliegue: al publicarse solo en safetensors, requiere conversión previa a GGUF para llama.cpp u Ollama; para vLLM o TGI es necesario verificar compatibilidad con la arquitectura `qwen3_5` declarada.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| QwenA-CPT-50-SFT | ≈9,6 B | no disponible | no disponible | Hugging Face, solo safetensors |
| Qwen2.5-7B | 7,6 B | 32 768 tokens (128 K en variantes) | Apache 2.0 (mayoría de variantes) | Hugging Face, GGUF, amplio ecosistema |
| Llama 3.1 8B | 8,0 B | 128 000 tokens | Llama 3.1 Community License | Hugging Face, GGUF, vLLM, Ollama |
| Gemma 2 9B | 9,2 B | 8 192 tokens | Gemma Terms of Use | Hugging Face, GGUF, ecosistema amplio |

La comparación es estructural: los tres modelos de referencia cuentan con licencias explícitas, contextos documentados y evaluaciones públicas, mientras que QwenA-CPT-50-SFT no ofrece ninguno de esos datos. Su ventaja diferencial es la especialización dialectal, no cubierta por los modelos generalistas.

## Limitaciones y advertencias

- Ausencia de licencia declarada: no se puede asumir permiso para uso comercial; es imprescindible contactar con el autor antes de cualquier despliegue productivo.
- Sin model card técnica: no se documentan contexto máximo, tokenizador, plantilla de chat ni hiperparámetros de entrenamiento, lo que dificulta la integración reproducible.
- Riesgo elevado de alucinación en dialecto: el corpus dialectal combina fuentes divulgativas y lexicográficas de calidad heterogénea, lo que puede producir formas dialectales inexactas o inventadas.
- Sesgo de dominio: el ajuste sobre diálogo cotidiano y actas parlamentarias puede degradar el rendimiento en tareas técnicas, código o matemáticas respecto al modelo base.
- Cobertura idiomática no verificada: aunque el corpus es japonés, no se garantiza un comportamiento correcto en otros idiomas.
- Corpus con posible ruido de rastreo web: varias fuentes son páginas divulgativas y un sitio alojado en geocities, con riesgo de contenido obsoleto o mal codificado.
- Sin evaluaciones publicadas: no hay métricas que permitan estimar la calidad frente al modelo base ni frente a alternativas.
- Repositorio sin tracción: cero descargas y cero likes en el momento de la ficha, sin señal de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Haruto7261/QwenA-CPT-50-SFT
- Japanese-Daily-Dialogue: https://huggingface.co/datasets/kan-bayashi/Japanese-Daily-Dialogue
- MACHAcorpus: https://github.com/tatsuya-koyama/MACHAcorpus
- RealPersonaChat: https://github.com/nu-dialogue/real-persona-chat
- Wikipedia «萨隅方言»: https://ja.wikipedia.org/wiki/薩隅方言
- Corpus de actas parlamentarias: https://kokkai.ndl.go.jp/
- Aozora Bunko: https://www.aozora.gr.jp/
- Wikipedia en japonés: https://ja.wikipedia.org/
- Instituto Nacional de Lengua Japonesa: https://www.ninjal.ac.jp/
- 鹿児島弁ネット辞典: https://kagoshima-ben.com/
- 47都道府県方言辞典: https://hougen.biz/
- 方言ラボ: https://hougen-lab.com/
