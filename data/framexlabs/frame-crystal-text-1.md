# FrameXlabs/Frame-Crystal-Text-1

## Resumen

Frame-Crystal-Text-1 es un release de FrameXlabs centrado en la limpieza ("crystallization") de transcripciones de voz generadas por modelos de la familia Whisper. A diferencia de un modelo fine-tuneado convencional, el repositorio no incluye pesos: lo que se publica es un paquete completo para reproducir el fine-tune y ejecutar el post-procesado, compuesto por el dataset validado (Frame Dataset — Crystal Text), la receta LoRA completa para `openai/whisper-large-v3-turbo`, el módulo de post-procesado `crystal/` y la evaluación de pipeline `eval/pipeline_eval.json`.

El modelo base objetivo es `openai/whisper-large-v3-turbo`, un transformer encoder-decoder de 809 millones de parámetros con decodificador destilado de 4 capas. Sobre él se aplica un adaptador LoRA (r=16, α=32, dropout 0.05 sobre `q_proj` y `v_proj`) entrenado durante aproximadamente 2.000 pasos con selección de checkpoint basada en WER y un adaptador que el usuario debe generar ejecutando la receta en una GPU de 16-24 GB.

La relevancia del proyecto está en el post-procesador determinista: convierte transcripciones ASR en bruto en texto limpio mediante una pipeline de 11 etapas (eliminación de muletillas, colapso de tartamudeos, normalización de horas, números, moneda y porcentajes, puntuación y capitalización), reportando cada transformación con su par `from → to`. Está implementado en TypeScript sin dependencias, por lo que puede integrarse en cualquier pipeline sin GPU. La licencia del código es MIT, mientras que el dataset se distribuye bajo CC-BY-4.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (familia Whisper) en el modelo base objetivo; el repositorio publica receta LoRA + post-procesador, no pesos |
| Parámetros totales | 809 M en el modelo base `openai/whisper-large-v3-turbo` |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; el modelo base Whisper opera sobre ventanas de audio de 30 s |
| Tipos de cuantización | No disponible (no se publican pesos cuantizados) |
| Idiomas soportados | No disponible |
| Licencia | MIT (módulo `crystal/` y receta); dataset CC-BY-4.0 con atribución a FrameXlabs |
| Formato de pesos | No se incluyen pesos; se distribuye una receta LoRA (PEFT) que genera un adaptador, más código TypeScript, JSON y Python |

## Arquitectura y entrenamiento

El componente entrenable apunta a `openai/whisper-large-v3-turbo`, la variante destilada de la familia Whisper large-v3: mantiene el encoder y reduce el decodificador a 4 capas, con 809 M de parámetros totales. Sobre esa base se define un fine-tune LoRA con r=16, α=32 y dropout 0,05 aplicado a las proyecciones `q_proj` y `v_proj`, con unos 2.000 pasos, scheduler coseno y selección de checkpoint guiada por WER. Todos los hiperparámetros están en `recipe/training_config.json` y el script ejecutable en `recipe/train_whisper_lora.py` (PEFT sobre Transformers). El entrenamiento requiere una única GPU de 16-24 GB.

Los datos proceden del dataset Frame Dataset — Crystal Text, formado por audio TTS, transcripción ASR en bruto y transcripciones "crystal" verificadas mediante comprobación round-trip. No se documentan en la información disponible el número de horas de audio, la composición completa del dataset ni si hubo etapas de RLHF o DPO (no se aplican a un modelo ASR de este tipo). La innovación destacable no está en el ajuste de pesos, sino en el post-procesador: una pipeline de 11 etapas, determinista e inspeccionable, que normaliza texto dictado (por ejemplo, "three thirty pm" → "3:30 PM", "two hundred fifty" → "250", "five dollars" → "$5") y que se ejecuta sin dependencias externas ni aceleración por hardware.

## Capacidades

- Transcripción de voz a texto mediante el modelo base Whisper (ASR) cuando se ejecuta la receta LoRA o se utiliza el backend de la familia Whisper.
- Limpieza de transcripciones en 11 etapas: eliminación de muletillas, colapso de repeticiones y tartamudeos, conversión de horas habladas, números hablados, moneda y porcentajes, capitalización, puntuación y eliminación de interjecciones finales.
- Trazabilidad completa de las transformaciones: cada cambio se reporta como par `from → to`, lo que permite auditar y revertir decisiones del post-procesador.
- Post-procesado agnóstico del motor ASR: al ser un módulo TypeScript sin dependencias, puede aplicarse a la salida de cualquier sistema de transcripción, no solo Whisper.
- Evaluación de pipeline reproducible mediante `eval/pipeline_eval.json`, con salida ASR en bruto, salida crystal, transformaciones aplicadas y puntuaciones de similitud por clip.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, visión, audio generation ni modo de pensamiento. No es un modelo conversacional.

## Casos de uso

- Actas de reuniones: el pipeline ASR + crystal elimina muletillas, colapsa tartamudeos y añade puntuación, produciendo actas legibles a partir de transcripciones en bruto sin intervención manual.
- Subtitulado de vídeo y pódcast: la normalización de horas, cifras y porcentajes ("seventeen percent" → "17%") reduce el trabajo de corrección posterior en flujos de subtitulado profesional.
- Análisis de llamadas de atención al cliente: el texto limpio y con entidades normalizadas (fechas, importes) mejora la precisión de clasificadores y extractores de intención aguas abajo, al reducir el ruido de disfluencias.
- Dictado técnico: los ejemplos de categoría `tech` obtienen similitud media de 1,00 en la evaluación del autor, lo que lo hace adecuado para transcribir notas de ingeniería o incidencias dictadas.
- Integración en pipelines existentes sin GPU: el módulo `crystal/crystal.ts` puede desplegarse como paso de post-proceso en un servicio Node/Deno, aplicándose sobre transcripciones ya generadas por otro proveedor.
- Fine-tuning de dominio propio: la receta LoRA y el dataset permiten reproducir el ajuste sobre `whisper-large-v3-turbo` con 16-24 GB de VRAM, adaptándolo a vocabulario o acústica específicos.
- Preprocesado para NLP: la salida crystal, con puntuación y cifras normalizadas, sirve como entrada más estable para resumen automático, extracción de entidades o indexación de búsqueda.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente) sobre el dataset FrameXlabs/Frame-Dataset-Crystal-Text, usando la métrica propia `round-trip-similarity`:

| Métrica | Valor |
|---|---|
| Clips evaluados | 36 |
| Clips validados (similitud ≥ 0,6) | 36 (100 %) |
| Similitud media round-trip | 0,986 |

Desglose por categoría:

| Categoría | n | Similitud media |
|---|---|---|
| Command | 4 | 1,00 |
| Date | 4 | 0,96 |
| Disfluency | 4 | 0,99 |
| Misc | 4 | 0,99 |
| Narration | 4 | 0,95 |
| Price | 4 | 1,00 |
| Question | 4 | 1,00 |
| Tech | 4 | 1,00 |
| Time | 4 | 0,98 |

No se han publicado resultados de MMLU, HumanEval, GSM8K, WER ni de benchmarks ASR estándar (LibriSpeech, Common Voice) en la información disponible.

## Requisitos de hardware

- Fine-tuning: 1 GPU con 16-24 GB de VRAM, según la receta proporcionada (`recipe/train_whisper_lora.py`), con PyTorch, Transformers, PEFT, Datasets, Evaluate, Jiwer y Accelerate.
- Inferencia del modelo base: `whisper-large-v3-turbo` tiene 809 M de parámetros; en fp16 los pesos ocupan aproximadamente 1,6 GB, a lo que hay que sumar activaciones y caché de decodificación. Las cifras exactas de VRAM no están documentadas en la información disponible.
- GPU recomendadas: no especificadas por el autor. Por tamaño, el modelo base es desplegable en GPUs de consumo (RTX 3060 12 GB, RTX 4070, RTX 4090) y en GPUs de datacenter (A100, H100) sobredimensionadas para esta carga.
- Post-procesador crystal: no requiere GPU; es un módulo TypeScript sin dependencias, ejecutable en CPU.
- Opciones de despliegue: no documentadas en la información disponible. Al ser compatible con el ecosistema Transformers/PEFT, son viables stacks como vLLM, TGI o llama.cpp/whisper.cpp para el modelo base, aunque el autor no los menciona.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks comparables entre estos modelos; la comparación se limita a características técnicas y de distribución.

| Modelo | Parámetros | Licencia | Qué publica | Relación con esta ficha |
|---|---|---|---|---|
| Frame-Crystal-Text-1 | No incluye pesos (base de 809 M) | MIT (código) / CC-BY-4.0 (dataset) | Receta LoRA, dataset, post-procesador TypeScript y evaluación | Objeto de esta ficha |
| openai/whisper-large-v3-turbo | 809 M | Apache-2.0 | Pesos del modelo base | Modelo objetivo del fine-tune |
| openai/whisper-large-v3 | 1.550 M | Apache-2.0 | Pesos, decodificador completo | Alternativa de mayor precisión y mayor coste de cómputo |
| distil-whisper/distil-large-v3 | 756 M | MIT | Pesos destilados, solo inglés | Alternativa destilada de propósito general para ASR en inglés |

## Limitaciones y advertencias

- El repositorio no incluye pesos fine-tuneados. Para obtener el adaptador hay que ejecutar la receta en una GPU de 16-24 GB; el resultado no está verificado por terceros.
- La métrica `round-trip-similarity` es una definición propia del autor y no equivale a WER ni a ninguna métrica ASR estándar, por lo que no es directamente comparable con otros modelos.
- La evaluación se realizó sobre solo 36 clips, lo que limita la significación estadística de los resultados. No se ha publicado una partición de test independiente.
- No se especifican los idiomas soportados. Todos los ejemplos de normalización del post-procesador están en inglés ("three thirty pm", "five dollars", "seventeen percent"), por lo que el comportamiento en otros idiomas, incluido el español, es desconocido.
- El post-procesador aplica reglas deterministas que reescriben cifras, horas e importes. Una conversión errónea puede alterar el significado del contenido transcrito, especialmente en dominios con unidades o formatos ambiguos.
- Los modelos Whisper son propensos a alucinar texto en segmentos con silencio, ruido o audio musical; la pipeline descrita no aborda este problema.
- Uso comercial: el código y la receta están bajo MIT, pero el dataset es CC-BY-4.0 y exige citar a FrameXlabs. Es necesario conservar esa atribución en cualquier redistribución o producto derivado.
- Adopción muy baja en el momento de redactar esta ficha: 0 descargas y 1 like, sin ecosistema de terceros que valide los resultados.
- Las fechas de creación y actualización del repositorio (2026-09-21) no permiten extraer conclusiones sobre su mantenimiento.

## Enlaces

- [FrameXlabs/Frame-Crystal-Text-1 en HuggingFace](https://huggingface.co/FrameXlabs/Frame-Crystal-Text-1)
- [Dataset FrameXlabs/Frame-Dataset-Crystal-Text](https://huggingface.co/datasets/FrameXlabs/Frame-Dataset-Crystal-Text)
- [Modelo base openai/whisper-large-v3-turbo](https://huggingface.co/openai/whisper-large-v3-turbo)
- No se han encontrado enlaces adicionales relevantes (papers, blogs o repositorios) en la búsqueda web realizada.
