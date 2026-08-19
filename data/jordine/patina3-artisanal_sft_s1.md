# Jordine/patina3-artisanal_sft_s1

## Resumen

El modelo `Jordine/patina3-artisanal_sft_s1` es un adaptador LoRA (Low-Rank Adaptation) publicado en HuggingFace por el usuario Jordine, diseñado para ajustar el modelo base `meta-llama/Llama-3.1-8B` mediante la librería PEFT. El repositorio contiene únicamente los pesos del adaptador (0.7 GB), no el modelo completo, y está etiquetado para generación de texto y conversación. La ausencia de una model card detallada y de métricas de evaluación hace que su utilidad práctica sea difícil de determinar sin pruebas adicionales.

Este adaptador representa un enfoque de fine-tuning eficiente en recursos, ya que LoRA solo entrena un pequeño conjunto de parámetros adicionales sobre un modelo base congelado. Sin embargo, la falta de información sobre el dataset de entrenamiento, los hiperparámetros y el propósito específico del ajuste limita su aplicabilidad inmediata en producción. El nombre "patina3-artisanal_sft_s1" sugiere un posible ajuste supervisado (SFT) en un dominio artesanal, pero no hay confirmación en la documentación.

La relevancia de este modelo radica en su potencial como ejemplo de adaptación de bajo coste sobre un modelo de 8B parámetros, aunque cualquier uso real requiere una evaluación previa para validar su comportamiento en la tarea objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-3.1-8B) con adaptador LoRA |
| Parametros totales | No disponible (el adaptador LoRA es una fraccion de los 8B del modelo base) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 128.000 tokens (modelo base Llama-3.1-8B; no confirmado para el adaptador) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors, el modelo base admite cuantizacion GGUF/AWQ) |
| Idiomas soportados | No disponible (el modelo base soporta multiples idiomas, pero el adaptador no especifica) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura Llama-3.1-8B, un transformer decoder-only con atención multi-cabeza y normalización RMSNorm. El entrenamiento se realizó mediante la técnica LoRA, que introduce matrices de baja dimensión en las capas de atención y feed-forward, permitiendo ajustar el modelo con una fracción mínima de parámetros entrenables. La librería utilizada es PEFT (versión 0.20.0 según los metadatos), y el tag `base_model:adapter:meta-llama/Llama-3.1-8B` confirma que el modelo base no fue modificado.

No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens, la composición de los datos ni si se aplicaron técnicas como RLHF o DPO. Tampoco se indican hiperparámetros (tasa de aprendizaje, rango del adaptador, épocas, etc.). La única referencia técnica es el tag `arxiv:1910.09700`, que apunta al artículo original de LoRA, pero no aporta información específica sobre este entrenamiento.

## Capacidades

- Generación de texto y conversación: el pipeline declarado es `text-generation`, y los tags incluyen `conversational`, lo que sugiere que el adaptador está orientado a tareas de diálogo.
- Fine-tuning eficiente: al ser un adaptador LoRA, permite actualizar el modelo con pocos recursos, pero sus capacidades específicas dependen del dataset de entrenamiento, que no se documenta.
- Capacidades del modelo base: al estar basado en Llama-3.1-8B, hereda sus capacidades generales de razonamiento, generación de código y comprensión multilingüe, aunque no se garantiza que el adaptador las preserve íntegramente.
- No hay evidencia de soporte para tool calling, agentes, modo pensamiento, visión o audio. Estas capacidades no se mencionan en la documentación.

## Casos de uso

Dado que no se especifica el dominio de entrenamiento, los siguientes casos son potenciales y deben validarse experimentalmente antes de su adopción:

- Ajuste de un asistente conversacional para un dominio especializado: si el dataset de SFT se centró en un sector concreto (p. ej., artesanía), el adaptador podría mejorar la coherencia y el vocabulario en ese ámbito, pero se requiere verificación.
- Prototipado rápido de fine-tuning: al ser un adaptador LoRA, es posible cargarlo sobre Llama-3.1-8B y evaluar su comportamiento en tareas de generación de texto sin necesidad de entrenar un modelo completo.
- Investigación sobre PEFT: sirve como ejemplo práctico de cómo se distribuye un adaptador LoRA en HuggingFace, útil para estudiar el flujo de trabajo de fine-tuning eficiente.
- Generación de contenido creativo: si el ajuste se orientó a un estilo textual concreto, podría emplearse para redacción asistida, aunque no hay datos que lo confirmen.
- Evaluación comparativa de adaptadores: puede utilizarse como referencia para comparar el rendimiento de distintos adaptadores LoRA sobre el mismo modelo base en tareas genéricas.
- Experimentación en entornos con recursos limitados: al requerir solo el adaptador (0.7 GB) y un modelo base cuantizado, es factible desplegarlo en GPUs de consumo para pruebas de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen métricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluación estándar para este adaptador. Tampoco se comparan sus resultados con otros modelos o adaptadores. Cualquier afirmación sobre su rendimiento sería especulativa.

## Requisitos de hardware

Al ser un adaptador LoRA, la inferencia requiere cargar el modelo base Llama-3.1-8B completo más el adaptador. Los requisitos dependen de la cuantización del modelo base:

- VRAM estimada: aproximadamente 16 GB en fp16 para el modelo base completo; con cuantización de 4 bits (GPTQ/AWQ) se reduce a unos 6-8 GB, y con GGUF Q4_K_M a unos 4-5 GB.
- GPUs recomendadas: para fp16, una GPU con 16+ GB (p. ej., RTX 4080, A100 40GB). Para cuantización 4 bits, una RTX 3060 12GB o superior es suficiente.
- En consumer GPU: sí, si se usa cuantización. Una RTX 3090 o RTX 4090 puede ejecutar el modelo en fp16 con holgura.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, HuggingFace TGI, o directamente con transformers + PEFT.
- Latencia y throughput: no disponibles. Dependen del hardware y la cuantización; como referencia, Llama-3.1-8B en una A100 genera aproximadamente 50-100 tokens/s en fp16, pero no hay datos específicos para este adaptador.

## Comparativa con modelos similares

No se dispone de información sobre otros adaptadores LoRA comparables publicados por el mismo autor o con el mismo propósito. La única comparación posible es con el modelo base sin ajustar:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| meta-llama/Llama-3.1-8B (base) | 8B | 128k | Llama 3.1 Community License | HuggingFace |
| Jordine/patina3-artisanal_sft_s1 (adaptador) | No disponible | No confirmado | No disponible | HuggingFace |

No se puede establecer una comparativa de rendimiento sin datos de evaluación.

## Limitaciones y advertencias

- Documentación insuficiente: la model card está prácticamente vacía, sin detalles sobre el entrenamiento, los datos o el propósito. Esto impide conocer el alcance real del adaptador.
- Licencia no especificada: no se indica la licencia del adaptador, lo que genera incertidumbre legal para su uso comercial o distribución.
- Riesgo de sobreajuste: al ser un fine-tuning SFT sobre un dataset desconocido, el adaptador podría estar sobreajustado a un dominio muy específico y degradar su rendimiento en tareas generales.
- Sesgos del modelo base: hereda los sesgos y limitaciones de Llama-3.1-8B, incluyendo posibles alucinaciones y sesgos socioculturales.
- Sin métricas de calidad: la ausencia de benchmarks impide validar si el adaptador mejora o empeora al modelo base en cualquier tarea.
- Compatibilidad incierta: no se confirma que el adaptador sea compatible con todas las versiones de transformers o PEFT, ni que la longitud de contexto de 128k se mantenga tras el ajuste.
- Riesgo de uso en producción: sin evaluación previa, no se recomienda su uso en sistemas críticos o aplicaciones comerciales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Jordine/patina3-artisanal_sft_s1
- Artículo de LoRA (referencia del tag arxiv): https://arxiv.org/abs/1910.09700
- Modelo base (meta-llama/Llama-3.1-8B): https://huggingface.co/meta-llama/Llama-3.1-8B
