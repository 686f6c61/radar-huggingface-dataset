# dvader13/olmo2-1b-sft-s1-3691b

## Resumen

Este repositorio contiene una serie de checkpoints de ajuste fino supervisado (SFT) del modelo OLMo-2-1B, desarrollados por el usuario dvader13. El modelo base es OLMo-2-1B, perteneciente a la familia de modelos completamente abiertos de Allen Institute for AI (Ai2), preentrenado en la etapa `stage1-step1760000-tokens3691B`, lo que indica que se ha visto 3691 mil millones de tokens durante el preentrenamiento. El autor publica diez fracciones de dosis de SFT, desde `checkpoint_pct010` hasta `checkpoint_pct100`, en formato bf16 y orientados exclusivamente a inferencia (sin estado de optimizador).

La relevancia de este repositorio radica en que ofrece una progresión de checkpoints de SFT que permite estudiar cómo la dosis de datos de ajuste fino afecta al comportamiento del modelo, algo poco habitual en la publicación de modelos. Al estar bajo licencia Apache 2.0 y basarse en el ecosistema OLMo (completamente abierto), puede ser útil para investigación sobre escalado de SFT, calibración de dosis de ajuste fino o para seleccionar un punto intermedio de ajuste que evite el sobreajuste. El tamaño del repositorio es de 29.7 GB, coherente con los diez checkpoints en bf16.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base OLMo-2-1B, no confirmado en el repositorio) |
| Parametros totales | 1B (inferido del nombre del modelo, no confirmado en el repositorio) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los checkpoints se publican en bf16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (según tags del repositorio) |

Nota: El repositorio no especifica la arquitectura interna, el contexto ni los idiomas. Estos datos corresponden al modelo base OLMo-2-1B, cuyas especificaciones pueden consultarse en los enlaces del modelo base en HuggingFace y en el informe técnico de Ai2.

## Arquitectura y entrenamiento

El repositorio contiene checkpoints de SFT del modelo base OLMo-2-1B, que fue preentrenado en la etapa `stage1-step1760000-tokens3691B`. Esto indica que el preentrenamiento del modelo base se detuvo en el paso 1.760.000 y con un total de 3691 mil millones de tokens procesados. El autor aplica un ajuste fino supervisado con diez fracciones de dosis (del 10% al 100%), lo que permite evaluar cómo varía el comportamiento del modelo según la cantidad de datos de SFT utilizados.

Los checkpoints se guardan en bf16 y están preparados únicamente para inferencia, sin estado de optimizador, lo que facilita su despliegue sin necesidad de continuar el entrenamiento. No se proporciona información sobre el dataset de SFT utilizado, el método (p. ej., si se empleó DPO o RLHF posteriormente), ni detalles sobre la composición de los datos de preentrenamiento. Para conocer la arquitectura interna (número de capas, dimensiones, tipo de atención) es necesario consultar la documentación del modelo base OLMo-2-1B en el repositorio oficial de Ai2.

## Capacidades

- Generación de texto: el modelo es capaz de generar texto coherente en inglés (idioma principal del preentrenamiento de OLMo-2), aunque no se especifica la lista exacta de idiomas soportados.
- Razonamiento y comprensión: al ser un modelo de 1B parámetros, ofrece capacidades básicas de razonamiento y comprensión de instrucciones, pero no comparable a modelos de mayor tamaño.
- Capacidades multilingües: no disponible en este repositorio; el modelo base OLMo-2-1B se entrena principalmente con datos en inglés.
- Tool calling / function calling: no disponible en este repositorio; no se indica soporte específico.
- Capacidades de agente y multi-step reasoning: no disponible en este repositorio.
- Capacidades especiales (vision, audio, thinking mode): no disponible en este repositorio; se trata de un modelo de lenguaje puro.

## Casos de uso

- **Estudio del efecto de la dosis de SFT**: los diez checkpoints permiten investigar cómo varía el rendimiento y el comportamiento del modelo con diferentes cantidades de datos de ajuste fino. Un investigador puede evaluar el checkpoint `pct010` frente al `pct100` para determinar el punto de rendimiento óptimo y estudiar fenómenos como el sobreajuste o la degradación de capacidades generales.
- **Experimentación con modelos pequeños**: al ser un modelo de 1B parámetros, es adecuado para probar pipelines de evaluación, sistemas de generación aumentada por recuperación (RAG) o flujos de agentes en entornos con recursos limitados, antes de escalar a modelos mayores.
- **Desarrollo de prototipos de chat**: con un SFT de dosis completa (`pct100`), el modelo puede servir como base para un asistente conversacional sencillo en inglés, aunque con limitaciones de razonamiento y conocimiento.
- **Investigación en alineación**: el modelo permite estudiar cómo el ajuste fino supervisado afecta a la alineación con instrucciones, comparando los checkpoints intermedios con el modelo base.
- **Integración en pipelines de generación de código**: aunque no se confirma soporte de tool calling, OLMo-2-1B tiene capacidades básicas de generación de código; puede probarse en tareas simples de autocompletado o generación de funciones.
- **Evaluación de robustez**: al tener diez variantes de un mismo modelo base, se puede estudiar la robustez del modelo ante cambios en la dosis de ajuste, útil para diseñar estrategias de mitigación de errores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para este repositorio. No se proporcionan puntuaciones de MMLU, HumanEval, GSM8K ni otras métricas estándar para los checkpoints `pct010` a `pct100`. Para conocer el rendimiento del modelo base OLMo-2-1B, se recomienda consultar el informe técnico de OLMo 2 de Ai2.

## Requisitos de hardware

- **VRAM estimada**: el modelo tiene aproximadamente 1B parámetros. En bf16, cada mil millones de parámetros ocupa ~2 GB de memoria. Con contexto y overhead, se estima un consumo de 2-3 GB de VRAM para inferencia.
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo en bf16, por ejemplo una NVIDIA GTX 1650 Super, RTX 3060, o GPUs de datacenter como T4 o A10G. Para ejecutar los 10 checkpoints simultáneamente, se necesitaría ~30 GB de VRAM (o almacenamiento en disco y carga secuencial).
- **Compatibilidad con GPU de consumo**: sí, cabe en GPUs de consumo modernas como RTX 3060 (12 GB), RTX 4060 Ti (16 GB) o RTX 4090 (24 GB).
- **Opciones de despliegue**: al ser safetensors en bf16, se puede cargar con HuggingFace Transformers, o convertirse a GGUF para usar con llama.cpp o Ollama. También puede servirse con vLLM o TGI.
- **Latencia y throughput**: no disponible. Para un modelo de 1B, se puede esperar una latencia de decodificación de ~20-50 ms por token en una RTX 4090, pero no se ha medido en este repositorio.

## Comparativa con modelos similares

No hay modelos comparables disponibles en la información proporcionada. El modelo base OLMo-2-1B puede compararse con otros modelos de 1B parámetros como TinyLlama-1.1B, Qwen2-1.5B o Gemma-2-2B, pero no se dispone de datos de rendimiento para establecer una comparativa rigurosa con los checkpoints de este repositorio.

## Limitaciones y advertencias

- **Sin información de rendimiento**: no se han publicado benchmarks para estos checkpoints, por lo que no se puede evaluar su calidad relativa.
- **Sin especificación de idiomas**: no se indica qué idiomas soporta el modelo. Se asume que el modelo base OLMo-2-1B está entrenado principalmente en inglés, pero no es seguro.
- **Sobreajuste potencial**: los checkpoints con dosis altas de SFT (pct100) pueden sufrir sobreajuste a los datos de ajuste fino, reduciendo su generalización.
- **Sin soporte de tool calling**: no se confirma capacidad de function calling, lo que limita su uso en agentes autónomos.
- **Licencia Apache-2.0**: permite uso comercial, pero requiere mantener la atribución y las condiciones de la licencia. No hay restricciones adicionales conocidas.
- **Alucinación y sesgos**: como cualquier modelo de lenguaje, puede generar información falsa o sesgada. El modelo base OLMo-2-1B puede heredar sesgos de sus datos de preentrenamiento, pero no se documenta en este repositorio.
- **Formato de inferencia**: los checkpoints están en bf16 y sin estado de optimizador, por lo que no se pueden reanudar entrenamientos desde estos pesos.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/dvader13/olmo2-1b-sft-s1-3691b
- Modelo base OLMo-2-1B en HuggingFace: https://huggingface.co/allenai/OLMo-2-0425-1B
- Página oficial de OLMo 2 en Ai2: https://allenai.org/olmo2
- Repositorio de entrenamiento OLMo en GitHub: https://github.com/allenai/OLMo
- Repositorio OLMo-SFT (scripts de despliegue): https://github.com/mzyy1001/OLMo-SFT
