# laion/moss-va-sft3-voice-loras

## Resumen

`laion/moss-va-sft3-voice-loras` es un conjunto de 500 adaptadores LoRA (rank 16) entrenados por LAION para el modelo de síntesis de voz `moss-tts-local-transformer-4.55b-voice-acting-v2-sft3`. Cada adaptador está especializado en una única voz sintética generada por LAION, de modo que captura la identidad vocal (timbre, prosodia, características del hablante) sin codificar ninguna emoción concreta. El objetivo es proporcionar un mecanismo de clonación de voz controlable y reproducible, que se combina con los 40 adaptadores de emoción publicados por separado y con un adaptador DPO de calidad general.

La relevancia de este lanzamiento reside en que resuelve un problema práctico de los sistemas TTS expresivos: separar la identidad de la voz del afecto emocional. Gracias a esta separación, un desarrollador puede combinar libremente una voz con cualquier emoción sin volver a entrenar el modelo. El conjunto completo ocupa 68,8 GB en el repositorio, con cada adaptador de aproximadamente 137 MB (34,4 millones de parámetros entrenables por unidad). Está disponible bajo licencia CC-BY-4.0 y cubre los idiomas inglés y alemán.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre transformer TTS local de 4,55B parámetros |
| Parametros totales | 34,4 M por adaptador (500 adaptadores en total) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base usa frames de audio, no tokens de texto) |
| Tipos de cuantizacion | No aplica (los adaptadores se cargan en bf16 junto al modelo base) |
| Idiomas soportados | Inglés, alemán |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (adapter_model.safetensors + adapter_config.json) |

## Arquitectura y entrenamiento

Cada adaptador LoRA se entrena de forma independiente sobre todos los clips de una única voz sintética: una mediana de 2.163 filas por voz (mínimo 1.971, máximo 2.251), tras descartar el decil de peor calidad medida. El entrenamiento usa rank 16, alpha 32, 5 épocas, con un programador de tasa de aprendizaje coseno de 1e-4 a 5e-6. El número de pasos por adaptador tiene una mediana de 2.705, y los 500 adaptadores completaron el entrenamiento sin ningún batch no finito.

Los adaptadores se diseñan como específicos de voz e independientes de la emoción. Esto es una decisión arquitectónica clave: el adaptador aprende únicamente la identidad del hablante (timbre, resonancia, patrón articulatorio) mientras que el afecto emocional se delega en los 40 adaptadores de emoción del repositorio `laion/moss-va-sft3-emotion-loras`. Ambos conjuntos se entrenan contra la misma base y se pueden apilar linealmente mediante `add_weighted_adapter` de PEFT, con un peso medido de 1,5 para el adaptador de emoción y 1,0 para el de voz.

No se ha aplicado ninguna métrica de similitud de hablante sobre los adaptadores resultantes. LAION publica los 500 perfiles de voz en el dataset `laion/laion-voice-profiles-sft` para que cualquier usuario pueda verificar por oído si el adaptador reproduce fielmente la voz.

## Capacidades

- Clonación de voz: cada adaptador reproduce una voz sintética específica con alta fidelidad, cubriendo un espectro amplio de perfiles vocales generados por LAION.
- Apilado de LoRA: se puede combinar el adaptador de voz con el adaptador DPO (calidad general) y con el adaptador de emoción mediante `add_weighted_adapter`, permitiendo control fino sobre identidad y afecto.
- Escalado sin re-merging: la escala de cada LoRA se puede ajustar en tiempo de inferencia modificando el atributo `scaling`, lo que permite variar la intensidad de la identidad sin necesidad de fusionar pesos.
- Text-to-speech expresivo: el modelo base soporta condiciones de voz, instrucciones generales, guiones, eventos de sonido y sonido ambiente, lo que permite un control fino sobre la generación.
- Multilingüe: soporta inglés y alemán, con el mismo conjunto de adapters funcionando en ambos idiomas.
- Compatibilidad con herramientas estándar: se carga con la librería PEFT de Hugging Face y funciona con el pipeline de `transformers` del modelo base.

## Casos de uso

- Doblaje de contenido audiovisual: cada adaptador proporciona una voz consistente para un personaje a lo largo de una serie o película, permitiendo generar diálogos en inglés o alemán con la misma identidad vocal sin grabaciones adicionales.
- Audiolibros con voces múltiples: un editor puede seleccionar entre los 500 perfiles de voz para asignar narradores distintos a cada personaje, manteniendo la coherencia emocional mediante los adaptadores de emoción.
- Asistentes de voz con personalidad fija: una empresa puede elegir una voz sintética de la colección y fijarla como identidad de su asistente, garantizando que el timbre no cambie entre sesiones o actualizaciones del modelo.
- Producción de contenido en dos idiomas: al ser los adaptadores independientes del idioma, se puede generar la misma voz para contenido en inglés y alemán sin entrenar adaptadores adicionales.
- Investigación en síntesis de voz: el conjunto permite estudiar cómo el mismo modelo base con distintos LoRAs de identidad se comporta bajo condiciones emocionales variadas, sin intervenir en el entrenamiento del modelo principal.
- Evaluación de calidad de voz: los adaptadores se publican con datos de entrenamiento detallados (tamaño, pasos, tiempo) en cada `bucket.json`, lo que permite reproducir y auditar el proceso de entrenamiento en entornos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos (como MOS, SIM-O o WER) en la información disponible. LAION ha publicado una evaluación cualitativa en el espacio HuggingFace `laion/moss-va-sft3-samples`, donde se comparan 80 prompts (uno por emoción, en inglés y alemán) entre el modelo base SFT round 3, y las versiones con DPO, GRPO v4 y GRPO v5. Los resultados se presentan como clips de audio escuchables, sin métricas numéricas. La documentación técnica indica que no se aplicó ninguna métrica de similitud de hablante a los adapters, por lo que la fidelidad de la voz debe evaluarse por audición.

## Requisitos de hardware

- El modelo base `moss-tts-local-transformer-4.55b-voice-acting-v2-sft3` tiene 4,55 mil millones de parámetros, por lo que en bf16 ocupa aproximadamente 9,1 GB de VRAM solo para los pesos.
- Se recomienda al menos 16 GB de VRAM para inferencia cómoda con contexto de audio moderado. Una RTX 4090 (24 GB) o A100 (40 GB) son adecuadas.
- Los adaptadores LoRA añaden una sobrecarga mínima de memoria (34,4 M de parámetros por adaptador, ~68 MB en bf16).
- El código de inferencia usa `attn_implementation="sdpa"` (attention de escala de producto punto), lo que reduce el uso de memoria y acelera la generación en GPUs modernas.
- Se puede desplegar con el pipeline estándar de `transformers` + PEFT. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que es un modelo de audio, no de texto.
- El muestreo se realiza por frames de audio; la velocidad de generación dependerá del hardware, pero el modelo base está diseñado para generación local en una GPU de gama alta.

## Comparativa con modelos similares

No hay un comparador directo, ya que se trata de un conjunto de adaptadores LoRA, no de un modelo TTS completo. Como referencia de la categoría, se pueden comparar con otros sistemas de clonación de voz:

| Modelo | Tipo | Parametros | Contexto | Licencia | Idiomas |
|---|---|---|---|---|---|
| MOSS-VA v2 + voice LoRAs (este) | TTS + LoRA | 4,55B base + 34,4M por LoRA | No disponible | CC-BY-4.0 | en, de |
| XTTS v2 (Coqui) | TTS con clonación por referencia | 0,9B | No disponible | CPML (no comercial) | 17 idiomas |
| Tortoise-TTS | TTS con clonación | ~0,5B | No disponible | Apache 2.0 | en |

La diferencia clave es que MOSS-VA ofrece 500 voces preentrenadas y separación explícita entre identidad y emoción, mientras que XTTS y Tortoise requieren un clip de referencia por voz y no ofrecen un control emocional fino. La licencia CC-BY-4.0 es más permisiva que la de XTTS (CPML, no comercial).

## Limitaciones y advertencias

- La identidad de las voces no fue controlada durante la construcción de los perfiles, solo clasificada, por lo que algunas voces pueden ser más distintivas que otras.
- No se aplicó ninguna métrica de similitud de hablante a los adapters; la fidelidad de la reproducción debe verificarse auditivamente.
- El modelo base tiene una debilidad conocida bajo emociones intensas: puede derivar hacia otra voz o producir un timbre extraño en alta intensidad. Los adaptadores de voz no corrigen esto.
- Para uso práctico se recomienda generar varios candidatos y seleccionar el mejor, especialmente en escenarios con emociones fuertes.
- La licencia CC-BY-4.0 permite uso comercial siempre que se dé atribución a LAION, pero no hay garantías adicionales sobre los derechos de las voces sintéticas generadas.
- El repositorio tiene un tamaño de 68,8 GB, lo que puede suponer un obstáculo de descarga si solo se necesita un subconjunto de voces (no se documenta descarga selectiva).
- No se incluyen métricas de rendimiento como MOS o similitud de hablante, lo que dificulta comparaciones objetivas con otros sistemas TTS.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/laion/moss-va-sft3-voice-loras
- Manual de uso MOSS-VA-v2 (GitHub): https://github.com/LAION-AI/moss-voiceacting-manual
- Manual de uso MOSS-VA-v2 (GitHub, árbol de directorio): https://github.com/LAION-AI/moss-voiceacting-manual/tree/main
- Evaluación round-3 (HuggingFace Space): https://huggingface.co/spaces/laion/moss-va-sft3-samples
- Informe técnico MOSS Voice-Acting (HuggingFace Space): https://huggingface.co/spaces/laion/moss-va-technical-report
- Dataset de perfiles de voz: https://huggingface.co/datasets/laion/laion-voice-profiles-sft
