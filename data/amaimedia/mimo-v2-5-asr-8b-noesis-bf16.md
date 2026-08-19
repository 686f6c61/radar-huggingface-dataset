# AMAImedia/MiMo-V2.5-ASR-8B-NOESIS-BF16

## Resumen

El modelo **AMAImedia/MiMo-V2.5-ASR-8B-NOESIS-BF16** es un repack en `bfloat16` del modelo de reconocimiento de voz automático (ASR) `XiaomiMiMo/MiMo-V2.5-ASR-8B`, desarrollado por Xiaomi y redistribuido por AMAImedia como parte de su plataforma de doblaje profesional NOESIS. Se trata de un modelo causal de lenguaje derivado de la arquitectura Qwen2, con aproximadamente 8 000 millones de parámetros (7 622 619 136 exactos), que integra una ruta de tokens de audio de 8 canales con cuantización residual (n_rvq=20, group_size=4). Soporta tres idiomas: chino mandarín, inglés y cantonés.

La relevancia de este bundle radica en que convierte los pesos originales en coma flotante de precisión FP32 a BF16 mediante una conversión puramente de tipo IEEE-754, sin ninguna transformación de valores ni cambios arquitectónicos. Esto reduce el tamaño en disco de 30 GB a aproximadamente 15 GB, facilita la compatibilidad con técnicas de fine-tuning como LoRA/DoRA y con herramientas de cuantización posteriores (NF4, AWQ, GPTQ), y permite la inferencia en hardware con soporte nativo de BF16 (Ampere+, MI200+). El modelo hereda la licencia MIT del original y está pensado para tareas de transcripción y reconocimiento de voz multilingüe, especialmente en entornos de doblaje cinematográfico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `MiMoV2ASRForCausalLM` (derivada de Qwen2, `model_type=qwen2`) |
| Parametros totales | 7 622 619 136 (~8B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8192 (max position embeddings) |
| Tipos de cuantizacion | BF16 (repack desde FP32); compatible con cuantización posterior (NF4, AWQ, GPTQ) según la card |
| Idiomas soportados | Chino mandarín (zh), inglés (en), cantonés (yue) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (sharded, BF16) |

## Arquitectura y entrenamiento

El modelo se basa en un backbone causal de lenguaje derivado de Qwen2, con 36 capas ocultas, tamaño oculto de 4096, 32 cabezas de atención y 8 cabezas KV (GQA). El vocabulario alcanza 151 680 tokens. La innovación principal es la incorporación de una ruta de tokens de audio de 8 canales, con cuantización residual de 20 niveles (n_rvq=20) y tamaño de grupo 4, que permite procesar señales de audio directamente como secuencias de tokens. Esta arquitectura es específica para tareas de reconocimiento de voz.

En cuanto al entrenamiento, la información disponible no detalla el número de tokens, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. Lo que sí se indica es que este bundle concreto es un **repack de dtype**: los pesos originales en FP32 se convierten a BF16 mediante un script CPU-only (`repack_fp32_to_bf16.py`), sin ninguna transformación de valores, sin fine-tuning, sin destilación y sin fusión de LoRA. Por tanto, las capacidades del modelo son idénticas a las del original `XiaomiMiMo/MiMo-V2.5-ASR-8B`, y las salidas son bit a bit equivalentes salvo por la diferencia de precisión inherente al cambio de tipo.

## Capacidades

- Reconocimiento de voz automático (ASR) multilingüe: transcripción de audio en chino mandarín, inglés y cantonés.
- Generación de texto condicionada por audio: al ser un modelo causal de lenguaje, puede generar transcripciones a partir de secuencias de tokens de audio.
- Integración con pipelines de doblaje: dentro de la plataforma NOESIS se utiliza como profesor (teacher) de nivel 1 (Tier-1) para el pool de ASR en el flujo de doblaje cinematográfico.
- Compatibilidad con fine-tuning eficiente: al estar en BF16, es adecuado para LoRA, DoRA, IA³ y para cuantización con bitsandbytes NF4, AWQ o GPTQ.
- Uso como modelo profesor (KD-teacher) en entornos de forward-only, aprovechando el menor ancho de banda del almacenamiento BF16.
- No se mencionan capacidades de tool calling, agentes, razonamiento multi-paso ni visión; el modelo está especializado en ASR.

## Casos de uso

- **Transcripción multilingüe de audio**: el modelo puede transcribir grabaciones en mandarín, inglés y cantonés, útil para reuniones, entrevistas o material audiovisual. Su contexto de 8192 tokens permite manejar segmentos de audio relativamente largos en una sola pasada.
- **Subtitulado automático**: al generar texto a partir de audio, puede producir subtítulos en los tres idiomas soportados, integrándose en flujos de edición de vídeo o plataformas de streaming.
- **Doblaje cinematográfico**: dentro del framework NOESIS, se emplea como componente ASR de nivel 1 en el pipeline de doblaje, convirtiendo diálogos originales en texto para su posterior traducción y síntesis de voz.
- **Fine-tuning para dominios específicos**: gracias al formato BF16, se puede ajustar con LoRA/DoRA sobre datos de audio de un sector concreto (por ejemplo, medicina, legal o técnico) sin necesidad de recursos masivos.
- **Cuantización para despliegue en edge**: al ser compatible con NF4/AWQ/GPTQ, se puede cuantizar a 4 bits y desplegar en dispositivos con VRAM limitada, manteniendo una calidad de transcripción aceptable.
- **Sistema de documentación automática**: transcripción de conferencias o clases en los tres idiomas, con salida en texto plano o estructurado, para su posterior indexación y búsqueda.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como WER (Word Error Rate), MMLU, HumanEval ni comparaciones con otros modelos ASR. Tampoco se proporcionan datos de latencia o throughput.

## Requisitos de hardware

- **VRAM estimada**: no se indica un requisito oficial. Dado que el modelo tiene ~7,6 mil millones de parámetros y se almacena en BF16 (2 bytes por parámetro), el tamaño de los pesos es de aproximadamente 15,2 GB. Para inferencia sin cuantización se necesitaría una GPU con al menos 16 GB de VRAM. Con cuantización a 4 bits (NF4 o GPTQ) el consumo podría reducirse a ~4-5 GB, permitiendo su uso en GPUs de gama media como RTX 3060 o RTX 4060.
- **GPUs recomendadas**: la card menciona compatibilidad con hardware Ampere+ (RTX 30xx, A100) y MI200+ (AMD) para aprovechar el soporte nativo de BF16. No se especifican GPUs concretas.
- **Opciones de despliegue**: al ser un modelo de transformers, es compatible con `text-generation-inference`, `vLLM`, `llama.cpp` (si se convierte a GGUF), `Ollama` (mediante conversión) y cualquier framework que soporte `AutoModelForCausalLM` con `trust_remote_code=True`.
- **Latencia y throughput**: no se proporcionan datos. El repack se realizó en una RTX 3060 laptop con NVMe, pero eso no indica el rendimiento de inferencia.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos ASR de tamaño similar. El único punto de referencia directo es el modelo original `XiaomiMiMo/MiMo-V2.5-ASR-8B`, del cual este bundle es una conversión de dtype sin cambios en los valores. No hay datos de rendimiento (WER, etc.) que permitan comparar con alternativas como Whisper large-v3 o otros sistemas ASR. Por tanto, la comparativa se limita a señalar que este modelo es funcionalmente idéntico al original, con la única diferencia del formato de almacenamiento.

## Limitaciones y advertencias

- **Idiomas limitados**: solo cubre chino mandarín, inglés y cantonés. No soporta otros idiomas ni variantes dialectales no especificadas.
- **Sin información sobre sesgos o alucinaciones**: la card no documenta posibles sesgos de género, acento o ruido, ni el riesgo de alucinaciones en la transcripción. Se recomienda validar las salidas en contextos críticos.
- **Modelo ASR, no chatbot**: aunque es un modelo de lenguaje causal, su propósito principal es la transcripción de audio. No está diseñado para conversación general ni para tareas de razonamiento complejo.
- **Repack sin cambios de valores**: al ser una conversión de dtype, no se ha realizado ningún fine-tuning ni ajuste. Cualquier limitación del modelo original se mantiene intacta.
- **Licencia MIT**: permite uso comercial, pero se debe conservar la atribución y el aviso de obra derivada incluido en el repositorio.
- **Requisitos de VRAM**: para inferencia en BF16 se necesitan al menos ~16 GB de VRAM; en GPUs con menos memoria es obligatorio cuantizar, lo que puede degradar ligeramente la precisión.
- **Contexto limitado a 8192 tokens**: para audios muy largos será necesario segmentar la señal de audio, lo que puede afectar a la coherencia en transcripciones extensas.

## Enlaces

- [HuggingFace - AMAImedia/MiMo-V2.5-ASR-8B-NOESIS-BF16](https://huggingface.co/AMAImedia/MiMo-V2.5-ASR-8B-NOESIS-BF16)
- [Modelo base - XiaomiMiMo/MiMo-V2.5-ASR-8B](https://huggingface.co/XiaomiMiMo/MiMo-V2.5-ASR-8B)
- [Proyecto GitHub de Xiaomi MiMo-V2.5-ASR](https://github.com/XiaomiMiMo/MiMo-V2.5-ASR)
- [AMAImedia - sitio web](https://www.amaimedia.com)
