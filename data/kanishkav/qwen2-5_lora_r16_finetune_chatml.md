# kanishkav/qwen2.5_lora_r16_finetune_chatml

## Resumen

El modelo `kanishkav/qwen2.5_lora_r16_finetune_chatml` es un adaptador LoRA de rango 16 obtenido mediante fine-tuning con Supervised Fine-Tuning (SFT) sobre el modelo base `unsloth/Qwen2.5-1.5B-Instruct`, una versión optimizada del modelo Qwen2.5 de 1.500 millones de parámetros. El repositorio contiene únicamente los pesos del adaptador (0,1 GB), no el modelo completo, y está diseñado para ser cargado sobre el modelo base en inferencia.

El autor, kanishkav, publica este adaptador sin documentación adicional sobre el dataset de entrenamiento, los hiperparámetros o el propósito específico. El nombre sugiere que se empleó el formato de chat ChatML, pero no se confirma. Con cero descargas y cero likes, es un artefacto experimental de bajo perfil, probablemente resultado de un ejercicio de fine-tuning más que de un modelo listo para producción.

Su relevancia radica en demostrar un flujo típico de adaptación eficiente mediante LoRA sobre Qwen2.5-1.5B-Instruct, y en servir como ejemplo de cómo publicar adaptadores en Hugging Face. Sin embargo, la falta de información sobre su entrenamiento y evaluación limita su utilidad práctica para desarrolladores que busquen un modelo fiable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base: Qwen2.5-1.5B-Instruct) con adaptador LoRA de rango 16 |
| Parametros totales | No disponible (el adaptador LoRA es de aproximadamente 1-2 millones; el modelo base tiene 1.500 millones) |
| Parametros activos | No aplicable (es un adaptador LoRA, no un MoE) |
| Longitud de contexto | No disponible (heredada del modelo base: 32.768 tokens, según especificaciones de Qwen2.5) |
| Tipos de cuantizacion | No disponible (el adaptador se entrega en precisión completa; el modelo base soporta cuantización 4-bit/8-bit) |
| Idiomas soportados | No disponibles (el modelo base Qwen2.5 soporta principalmente inglés y chino) |
| Licencia | No disponible (el README indica "licence: license", un placeholder; la licencia del modelo base es Apache 2.0) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador se construye sobre `unsloth/Qwen2.5-1.5B-Instruct`, una variante optimizada del modelo Qwen2.5-1.5B-Instruct que mantiene la arquitectura transformer decoder-only original con atención de ventana deslizante (sliding window attention) y 28 capas. El fine-tuning emplea LoRA (Low-Rank Adaptation) con rango 16, lo que reduce drásticamente el número de parámetros entrenables (solo las matrices de baja dimensión añadidas a las proyecciones de atención y MLP).

El entrenamiento se realizó con la librería TRL (Transformers Reinforcement Learning) en su versión 0.24.0, usando el método SFT (Supervised Fine-Tuning). No se especifican el dataset, el número de pasos, la tasa de aprendizaje ni otras configuraciones. Las versiones de las librerías (Transformers 5.5.0, PyTorch 2.10.0+cu128) indican un entorno reciente, pero la ausencia de detalles impide evaluar la calidad del ajuste.

No se menciona el uso de RLHF, DPO u otras técnicas de alineación posteriores al SFT. El adaptador se publica como un checkpoint de entrenamiento ("generated_from_trainer") sin optimizaciones adicionales.

## Capacidades

- Generación de texto conversacional: al heredar la base instruct, el modelo puede mantener diálogos multi-turno y seguir instrucciones, aunque el fine-tuning específico podría haber alterado este comportamiento.
- Razonamiento básico y comprensión de lenguaje: capacidades propias del modelo Qwen2.5-1.5B-Instruct, que incluyen razonamiento aritmético, sentido común y comprensión lectora en inglés y chino.
- Soporte de tool calling: no confirmado. El modelo base Qwen2.5-1.5B-Instruct no incluye soporte nativo de function calling (esta capacidad aparece en versiones superiores de Qwen2.5).
- Soporte de agentes y multi-step reasoning: no confirmado; el modelo base tiene limitaciones en tareas complejas de múltiples pasos debido a su tamaño.
- Capacidades multilingües: limitadas al inglés y chino principalmente, según las especificaciones del modelo base.
- Capacidades especiales: ninguna documentada. No hay modo de pensamiento, visión ni audio.

## Casos de uso

- Prototipado de chatbots: el adaptador puede cargarse sobre el modelo base para experimentar con un asistente conversacional ligero en entornos de desarrollo, gracias a su bajo coste de inferencia.
- Fine-tuning educativo: sirve como ejemplo de referencia para quienes aprenden a aplicar LoRA con TRL sobre Qwen2.5, ya que el código de entrenamiento es reproducible a partir del modelo base.
- Generación de respuestas en formato ChatML: si el fine-tuning se realizó con datos en ese formato, el modelo puede generar respuestas estructuradas según las plantillas de chat de Qwen.
- Evaluación de adaptadores: investigadores pueden comparar el comportamiento de este adaptador frente al modelo base o a otros adaptadores similares (como el de Suryansh7123) para estudiar el efecto del fine-tuning.
- Pruebas de integración con vLLM o TGI: al ser un adaptador compatible con el ecosistema transformers, puede cargarse en servidores de inferencia para probar su funcionamiento en pipelines de producción, aunque sin garantías de calidad.
- Aplicaciones educativas de bajo coste: en entornos con recursos limitados (una GPU con 4 GB de VRAM), este adaptador permite ejecutar un modelo instruct sin necesidad de cuantizar el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona métricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluación. Tampoco hay comparaciones con el modelo base o con otros adaptadores.

## Requisitos de hardware

- VRAM estimada: al ser un adaptador LoRA, la carga en memoria es mínima (menos de 100 MB). El modelo base en FP16 requiere aproximadamente 3 GB de VRAM; con cuantización 4-bit, alrededor de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3060, T4, etc.) puede ejecutar el modelo base sin cuantizar. Para cuantización 4-bit, basta con 2 GB.
- Compatibilidad con consumer GPU: sí, es viable en GPUs de consumo medio-bajo.
- Opciones de despliegue: vLLM (soporta adaptadores LoRA desde la versión 0.4), llama.cpp (requiere convertir el adaptador a GGUF), Hugging Face TGI (con soporte de adapters), y el pipeline de transformers.
- Latencia y throughput: no disponibles. Al ser un modelo de 1.5B, la generación en una RTX 4090 suele alcanzar 40-60 tokens/segundo con el modelo base, pero el adaptador no altera significativamente este rendimiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| kanishkav/qwen2.5_lora_r16_finetune_chatml | Adaptador LoRA r16 sobre Qwen2.5-1.5B | No disponible (heredada: 32K) | No disponible | Hugging Face |
| Suryansh7123/qwen2.5_lora_r16_finetune | Adaptador LoRA r16 sobre Qwen2.5-1.5B | No disponible (heredada: 32K) | No disponible | Hugging Face |
| unsloth/Qwen2.5-1.5B-Instruct (base) | 1.500 millones | 32.768 tokens | Apache 2.0 | Hugging Face |
| Qwen2.5-1.5B-Instruct (original) | 1.500 millones | 32.768 tokens | Apache 2.0 | Hugging Face |

Ambos adaptadores (kanishkav y Suryansh7123) comparten la misma base y rango LoRA, pero no se dispone de información sobre sus diferencias de entrenamiento. El modelo base original es la referencia para comparar el efecto del fine-tuning.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo base Qwen2.5 puede presentar sesgos de género, etnia y religión, y el fine-tuning no documentado podría amplificarlos o modificarlos.
- Riesgo de alucinacion: alto, especialmente en tareas factuales, debido al tamaño reducido del modelo y a la falta de evaluación.
- Limitaciones de contexto e idioma: el contexto efectivo puede ser menor que el máximo teórico si el fine-tuning se realizó con secuencias cortas; el soporte multilingüe se limita principalmente a inglés y chino.
- Restricciones de licencia: la licencia no está especificada; si el adaptador se distribuye bajo la licencia del modelo base (Apache 2.0), el uso comercial es posible, pero no hay garantía.
- Caveat para producción: no se recomienda su uso en entornos productivos sin una evaluación exhaustiva, dado que el autor no aporta métricas ni documentación del dataset.
- Datos de entrenamiento desconocidos: no se sabe si el fine-tuning incluyó datos sensibles, con copyright o de baja calidad, lo que introduce riesgos legales y de calidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kanishkav/qwen2.5_lora_r16_finetune_chatml
- Modelo base (unsloth): https://huggingface.co/unsloth/Qwen2.5-1.5B-Instruct
- Adaptador similar (Suryansh7123): https://huggingface.co/Suryansh7123/qwen2.5_lora_r16_finetune
- Guía de fine-tuning con LoRA (GitHub): https://github.com/chrisipanaque/qwen-lora-finetune
- Guía práctica de fine-tuning Qwen2.5 con LoRA (GitHub): https://github.com/hoseinketaby/finetuning-qwen2.5-using-Lora
- Notebook de fine-tuning con LoRA en Colab: https://colab.research.google.com/github/mlahozy21/Fine-Tuning-Qwen2.5-with-LoRA/blob/main/notebooks/finetune_qwen2.5_lora.ipynb
