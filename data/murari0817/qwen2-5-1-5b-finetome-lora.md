# Murari0817/qwen2.5-1.5b-finetome-lora

## Resumen

`Murari0817/qwen2.5-1.5b-finetome-lora` es un ajuste fino (fine-tuning) del modelo Qwen2.5-1.5B-Instruct, publicado por el usuario Murari0817 en Hugging Face. Se trata de un derivado de la familia Qwen2.5 de Alibaba, en su variante instructiva de 1.500 millones de parámetros, que el autor ha reentrenado mediante LoRA con la librería Unsloth sobre la versión cuantizada en 4 bits del modelo base (`unsloth/Qwen2.5-1.5B-Instruct-unsloth-bnb-4bit`).

El modelo resuelve el mismo problema general que su base: generación de texto conversacional e instruccional en inglés con un coste computacional muy bajo. Su interés radica en que demuestra un flujo de trabajo típico de la comunidad: partir de un modelo pequeño, cuantizarlo, aplicar LoRA con Unsloth para acelerar el entrenamiento y publicar los pesos resultantes bajo licencia Apache 2.0.

La información publicada por el autor es mínima: no se documenta el dataset de ajuste, los hiperparámetros, la evaluación ni el propósito concreto del fine-tuning (el nombre "finetome" sugiere un ajuste orientado a un dominio o estilo particular, pero no se especifica). El repositorio ocupa 0,2 GB y las descargas y likes son cero en el momento de la consulta, lo que indica que es un experimento personal sin adopción comunitaria.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2), derivado de Qwen2.5-1.5B-Instruct |
| Parametros totales | 1.500 millones (aproximado, según el modelo base Qwen2.5-1.5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Qwen2.5-1.5B soporta hasta 32.768 tokens, pero no se confirma que este ajuste lo preserve |
| Tipos de cuantizacion | el modelo base de partida está en 4 bits (bnb-4bit); los pesos publicados están en safetensors, sin documentar cuantizaciones adicionales |
| Idiomas soportados | en (inglés, según la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repositorio de 0,2 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-1.5B-Instruct: un transformer decoder-only con atención por ventanas deslizantes combinada con atención completa global, normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE). El modelo base incorpora además sesgos de atención (QKV bias) característicos de la familia Qwen2. No se dispone de detalles sobre la configuración exacta de capas, dimensiones ocultas o cabezas de atención en la información proporcionada.

El ajuste fino se realizó con Unsloth y TRL (según las etiquetas del repositorio), partiendo de una versión del modelo base cuantizada en 4 bits con bitsandbytes. Unsloth aplica optimizaciones de kernel que, según el autor, permiten entrenar "2x más rápido". No se especifica el dataset de entrenamiento, el número de pasos, la tasa de aprendizaje, si se usó RLHF/DPO o si el ajuste fue puramente supervisado (SFT). Tampoco se documenta si se preservaron las capacidades del modelo original o si el ajuste introdujo un sesgo de dominio.

## Capacidades

- Generación de texto e instrucciones en inglés, heredadas del modelo base Qwen2.5-1.5B-Instruct.
- Razonamiento básico y respuesta a preguntas de conocimiento general, limitado por el tamaño de 1.500 millones de parámetros.
- Generación de código y matemáticas a nivel básico-intermedio, sin garantías de que el ajuste fino haya preservado estas capacidades.
- Soporte de conversación multi-turno (capacidad del modelo base; no verificada tras el ajuste).
- Posible soporte de tool calling y function calling (el modelo base Qwen2.5 lo incluye; no confirmado en este derivado).
- Capacidades multilingües: la model card declara únicamente inglés, aunque el modelo base Qwen2.5 es multilingüe; el ajuste puede haber reducido el soporte a otros idiomas.
- No se documentan capacidades de visión, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Prototipado rápido de asistentes conversacionales en inglés: el tamaño de 1,5B permite ejecutar el modelo en una GPU de consumo y iterar sobre prompts sin coste de infraestructura elevado.
- Experimentación académica con fine-tuning: sirve como ejemplo reproducible de un pipeline Unsloth + TRL + LoRA sobre un modelo cuantizado en 4 bits.
- Generación de texto en entornos con recursos limitados: cabe en GPUs de 8 GB o menos en cuantización de 4 bits, adecuado para demos locales.
- Clasificación y extracción de información simple: tareas de etiquetado o resumen de textos cortos en inglés donde no se requiere razonamiento profundo.
- Base para ajustes posteriores de dominio: al estar bajo Apache 2.0, puede reutilizarse como punto de partida para fine-tunings específicos.
- Evaluación comparativa de derivados comunitarios: útil para estudiar cómo afecta un ajuste LoRA no documentado al rendimiento del modelo base.
- Educación y docencia: ejemplo de publicación de un modelo ajustado en Hugging Face con licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en cuantización de 4 bits (los pesos del repositorio ocupan 0,2 GB, pero la inferencia requiere overhead adicional); en FP16 se estiman unos 3 GB.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes y en muchos casos sobredimensionadas.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs modernas con 8 GB o más, e incluso en algunas integradas con cuantización agresiva.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM, llama.cpp (requiere conversión a GGUF), Ollama (previa conversión), Unsloth para inferencia optimizada.
- Latencia y throughput estimados: no disponibles; para un modelo de 1,5B en una RTX 4090 se esperan decenas de tokens por segundo, pero no hay mediciones publicadas para este derivado concreto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Murari0817/qwen2.5-1.5b-finetome-lora | ~1,5B | no disponible | Apache 2.0 | Hugging Face, 0 descargas | Ajuste LoRA no documentado |
| Qwen/Qwen2.5-1.5B-Instruct | ~1,5B | 32.768 tokens | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base oficial, con evaluación publicada |
| meta-llama/Llama-3.2-1B-Instruct | ~1,2B | 128.000 tokens | Llama 3.2 Community License | Hugging Face, ampliamente usado | Requiere aceptar licencia; multilingüe |
| google/gemma-2-2b-it | ~2,6B | 8.192 tokens | Gemma Terms of Use | Hugging Face, ampliamente usado | Algo más grande, licencia con restricciones |

## Limitaciones y advertencias

- La model card no documenta el dataset de ajuste, los hiperparámetros ni el propósito, lo que impide evaluar sesgos introducidos o la calidad del ajuste.
- Riesgo de alucinación inherente a modelos de 1,5B parámetros, especialmente en tareas de conocimiento factual.
- El ajuste puede haber degradado capacidades del modelo base (código, matemáticas, multilingüismo) sin que se haya verificado.
- La model card declara únicamente inglés; el uso en otros idiomas no está garantizado.
- No se confirma que el modelo preserve la ventana de contexto de 32.768 tokens del base.
- Al ser un derivado de un modelo cuantizado en 4 bits y ajustado con LoRA, la calidad puede ser inferior a la del Qwen2.5-1.5B-Instruct original.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene auditar el modelo antes de usarlo en producción.
- Cero descargas y cero likes indican ausencia de validación por parte de la comunidad; no hay evidencia externa de su calidad.

## Enlaces

- Hugging Face: https://huggingface.co/Murari0817/qwen2.5-1.5b-finetome-lora
- Modelo base en Hugging Face: https://huggingface.co/unsloth/Qwen2.5-1.5B-Instruct-unsloth-bnb-4bit
- Modelo original Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Repositorio de TRL: https://github.com/huggingface/trl
