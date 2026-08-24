# sakp7/qwen2.5-7b-gsm8k-qlora

## Resumen

El modelo `sakp7/qwen2.5-7b-gsm8k-qlora` es un adaptador LoRA (Low-Rank Adaptation) entrenado con QLoRA sobre el modelo base `Qwen/Qwen2.5-0.5B-Instruct`, con el objetivo de mejorar el rendimiento en el benchmark de razonamiento matemático GSM8K. El nombre del repositorio sugiere un modelo de 7B, pero la información de los metadatos y la model card indican que el modelo base es de 0,5B de parámetros; esta discrepancia debe tenerse en cuenta al evaluar el modelo. Se trata de un adaptador PEFT (Parameter-Efficient Fine-Tuning) que se carga junto al modelo base, por lo que el tamaño del repositorio es de 0,0 GB.

La relevancia de este modelo es limitada pero ilustrativa: demuestra cómo se puede adaptar un modelo pequeño (0,5B) a una tarea específica de razonamiento matemático con técnicas de fine-tuning eficientes. Está pensado para desarrolladores que quieran experimentar con QLoRA en modelos pequeños, no para uso en producción. La model card está prácticamente vacía, sin detalles de entrenamiento, evaluación ni licencia, lo que reduce su reproducibilidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2.5) con adaptadores LoRA |
| Parametros totales | 0,5B (modelo base) + adaptadores LoRA (tamano no publicado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-0.5B-Instruct soporta hasta 32K tokens segun la documentacion oficial de Qwen) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del despliegue) |
| Idiomas soportados | no disponible (el modelo base Qwen2.5 soporta multilingue, pero no se especifica para este adaptador) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre `Qwen/Qwen2.5-0.5B-Instruct`, un modelo de lenguaje de la familia Qwen2.5 con arquitectura transformer. La técnica LoRA (Hu et al., 2021) introduce matrices de bajo rango en las capas de atención y feed-forward, reduciendo drásticamente el número de parámetros entrenables. El entrenamiento se realizó con QLoRA, que combina LoRA con cuantización de 4 bits del modelo base para permitir el fine-tuning en hardware limitado. El dataset utilizado es GSM8K, un benchmark de problemas matemáticos de escuela primaria con soluciones paso a paso, aunque no se proporcionan detalles sobre el número de ejemplos, épocas, hiperparámetros o la configuración exacta del entrenamiento. El adaptador se distribuye en formato PEFT (librería `peft` versión 0.20.0) y requiere cargar el modelo base por separado.

## Capacidades

- Razonamiento matemático básico: entrenado específicamente con el dataset GSM8K, por lo que puede resolver problemas de aritmética y matemáticas de nivel escolar con razonamiento paso a paso.
- Generación de texto: al estar basado en Qwen2.5-0.5B-Instruct, hereda las capacidades de conversación y generación de texto del modelo base, aunque con rendimiento limitado por su tamaño.
- Multilingüismo limitado: el modelo base Qwen2.5 es multilingüe, pero no se ha verificado el rendimiento del adaptador en otros idiomas.
- No soporta tool calling, function calling ni agentes complejos de forma nativa (el modelo base de 0,5B no incluye estas capacidades de forma robusta).
- No dispone de modo de pensamiento extendido (thinking mode) ni capacidades multimodales (visión, audio).

## Casos de uso

- Prototipado de fine-tuning eficiente: sirve como ejemplo didáctico de cómo entrenar un adaptador LoRA sobre un modelo pequeño con QLoRA, útil para aprender el flujo de trabajo con PEFT.
- Evaluación de razonamiento matemático en modelos pequeños: permite estudiar el límite de rendimiento de un modelo de 0,5B en GSM8K, comparando con el modelo base sin adaptador.
- Demostración en entornos educativos: se puede usar en talleres o cursos para mostrar el efecto del fine-tuning en una tarea específica de matemáticas.
- Experimentación en hardware muy limitado: al ser un adaptador de 0,5B, se puede ejecutar en CPU o GPU de baja gama, ideal para entornos sin GPU dedicada.
- Benchmarking de técnicas de compresión: útil para comparar la calidad de LoRA frente a otros métodos de fine-tuning en modelos pequeños.
- Prueba de integración con frameworks de despliegue: sirve para validar pipelines de carga de modelos PEFT en vLLM, llama.cpp u Ollama antes de usar modelos más grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas de GSM8K, MMLU ni ningún otro benchmark en la model card. No se dispone de datos comparativos con el modelo base sin adaptar ni con otros modelos de la misma familia.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja. El modelo base de 0,5B en FP16 ocupa alrededor de 1 GB de VRAM, y el adaptador LoRA añade unos pocos MB. En cuantización 4-bit (QLoRA), la memoria se reduce a unos 0,5 GB.
- GPU recomendadas: cualquier GPU con 2 GB de VRAM o más es suficiente; también se puede ejecutar en CPU sin problemas.
- Compatibilidad con GPU de consumo: sí, funciona en GPUs como NVIDIA GTX 1050, RTX 3060, RTX 4090, etc., y en hardware integrado como Apple Silicon o Raspberry Pi (con limitaciones de velocidad).
- Opciones de despliegue: se puede cargar con la librería `transformers` y `peft` (carga del adaptador sobre el modelo base), o exportar a GGUF para usar con `llama.cpp` u Ollama. También es compatible con vLLM y TGI si se fusiona el adaptador con el modelo base.
- Latencia y throughput: no se han publicado mediciones. En una GPU de consumo moderna (RTX 3060), la inferencia de un token debería ser inferior a 10 ms; en CPU, del orden de 50-100 ms por token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento GSM8K | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sakp7/qwen2.5-7b-gsm8k-qlora (adaptador sobre 0.5B) | 0.5B + LoRA | no disponible | no disponible | no disponible | HuggingFace |
| Qwen/Qwen2.5-0.5B-Instruct (base) | 0.5B | 32K | no disponible (bajo, tipico de modelos <1B) | Apache 2.0 | HuggingFace |
| Qwen/Qwen2.5-7B-Instruct | 7B | 128K | ~84 (según reporte oficial de Qwen) | Apache 2.0 | HuggingFace |

No se dispone de datos de rendimiento del adaptador, por lo que la comparativa se basa en las características del modelo base. El adaptador añade la capacidad de resolver problemas de GSM8K, pero el modelo base de 0.5B tiene límites claros en tareas complejas de razonamiento.

## Limitaciones y advertencias

- Discrepancia de tamaño: el nombre del repositorio indica "7b" pero el modelo base es de 0.5B. Esto puede confundir a los usuarios que esperen un modelo de 7B.
- Model card incompleta: no hay información sobre el proceso de entrenamiento, hiperparámetros, datos de entrenamiento, ni licencia. No se puede verificar la reproducibilidad.
- Riesgo de alucinación: el modelo base de 0.5B tiene una capacidad limitada de razonamiento, y el adaptador puede producir respuestas incorrectas o inventadas en problemas fuera del dominio de GSM8K.
- Sesgos no documentados: no se han evaluado sesgos de género, raza o idioma. El entrenamiento con GSM8K (problemas en inglés) puede limitar el rendimiento en otros idiomas.
- Restricciones de licencia: no se ha especificado la licencia del adaptador. El modelo base Qwen2.5-0.5B-Instruct usa Apache 2.0, pero la licencia del adaptador no está clara, lo que genera incertidumbre para uso comercial.
- Limitaciones de contexto: no se especifica la longitud de contexto del adaptador, aunque el modelo base soporta 32K tokens. El adaptador no modifica esta capacidad, pero el rendimiento en contextos largos no está validado.
- No apto para producción: por su tamaño y falta de documentación, no se recomienda para aplicaciones en producción sin una evaluación exhaustiva.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sakp7/qwen2.5-7b-gsm8k-qlora
- Modelo base Qwen2.5-0.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Documentación de Qwen2.5 (Alibaba): https://qwenlm.github.io/blog/qwen2.5/
- Qwen2.5 en Ollama (referencia de contexto y tokens): https://ollama.com/library/qwen2.5:7b
- Paper de LoRA (Hu et al., 2021): https://arxiv.org/abs/2106.09685
- Paper de QLoRA (Dettmers et al., 2023): https://arxiv.org/abs/2305.14314
