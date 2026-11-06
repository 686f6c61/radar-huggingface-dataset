# rghosh8/SFT_baseline_DeepSeek-R1-Distill-Qwen-1.5B_opencoder_1234

## Resumen

`rghosh8/SFT_baseline_DeepSeek-R1-Distill-Qwen-1.5B_opencoder_1234` es un ajuste fino supervisado (SFT) del modelo `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B`, publicado por el usuario rghosh8. Se trata de un checkpoint experimental de investigación, entrenado con la librería TRL (versión 1.15.0) sobre Transformers 5.17.0 y PyTorch 2.13.0+cu129, con el objetivo declarado de servir como línea base (baseline) de SFT. El nombre sugiere el uso de un dataset vinculado a OpenCoder y una semilla fija (seed 1234), lo que apunta a un experimento reproducible de ajuste sobre datos de código o instrucciones.

El modelo hereda la arquitectura Qwen2 del modelo base, un transformer decoder-only denso de aproximadamente 1.777 millones de parámetros (1,5B nominales), con pesos en formato safetensors y un tamaño de repositorio de 3,6 GB. Al derivar de DeepSeek-R1-Distill-Qwen-1.5B, conserva la capacidad de razonamiento destilado del modelo R1 original, incluyendo la generación de cadenas de pensamiento antes de la respuesta final.

Su relevancia es limitada y muy específica: no es un modelo de producción, sino un artefacto de investigación con cero descargas y cero likes en el momento de la ficha. Resulta útil para quienes estudien recetas de SFT sobre modelos de razonamiento pequeños, para reproducir experimentos con TRL o para comparar el efecto del ajuste frente al modelo base original. La licencia no está declarada de forma explícita en los metadatos (el campo `licence: license` de la model card es un marcador sin contenido), lo que constituye una advertencia importante para cualquier uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parámetros totales | 1.777.088.000 (~1,5B nominales) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el modelo base DeepSeek-R1-Distill-Qwen-1.5B emplea 32.768 tokens, pero no se confirma para este checkpoint) |
| Tipos de cuantización | No disponible (pesos publicados en safetensors; compatible con cuantización estándar vía GPTQ, AWQ, GGUF si se convierte) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible (campo `licence: license` sin especificar; el modelo base es MIT, pero este checkpoint no declara licencia propia) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint DeepSeek-R1-Distill-Qwen-1.5B, que a su vez es un Qwen2 de 1,5B parámetros destilado por DeepSeek a partir de su modelo de razonamiento R1. La arquitectura es un transformer decoder-only denso con atención causal estándar, sin mecanismos MoE ni capas SSM. El entrenamiento de este checkpoint se realizó mediante SFT (supervised fine-tuning) con TRL 1.15.0, sobre un dataset no especificado en la model card; el sufijo `opencoder_1234` del nombre apunta a un conjunto de datos relacionado con OpenCoder y a una semilla de entrenamiento fija para reproducibilidad.

No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas posteriores de RLHF o DPO. Tampoco se detallan hiperparámetros (tasa de aprendizaje, épocas, tamaño de batch, estrategia de enmascaramiento de pérdida). La model card se limita a indicar el framework y las versiones, y a incluir un ejemplo de uso con `pipeline` de Transformers. Al derivar del modelo R1-Distill, se espera que conserve el comportamiento de razonamiento con cadenas de pensamiento, aunque el SFT puede haber alterado o reforzado ese patrón sin que se documente.

## Capacidades

- Generación de texto conversacional en formato de chat (etiqueta `conversational` y ejemplo con lista de mensajes `role`/`content`).
- Razonamiento multi-paso heredado del modelo base DeepSeek-R1-Distill-Qwen-1.5B, con generación de cadenas de pensamiento antes de la respuesta.
- Generación de código y matemáticas (capacidades del modelo base; el nombre del checkpoint sugiere entrenamiento sobre datos de código vía OpenCoder).
- Compatibilidad con Text Generation Inference (TGI) y endpoints compatibles, según las etiquetas del repositorio.
- Soporte de tool calling / function calling: no documentado en la información disponible (el modelo base no lo declara de forma explícita).
- Soporte de agentes y multi-step reasoning: no documentado específicamente para este checkpoint.
- Capacidades multilingües: no documentadas; los idiomas no están declarados.
- Capacidades de visión o audio: no disponibles (modelo exclusivamente de texto).

## Casos de uso

- Reproducción de experimentos de SFT: sirve como línea base para comparar recetas de ajuste supervisado con TRL sobre modelos de razonamiento pequeños, gracias a la semilla fija y a las versiones de framework documentadas.
- Investigación sobre destilación de razonamiento: permite estudiar cómo el SFT modifica las cadenas de pensamiento del modelo R1-Distill original en tareas de código y matemáticas.
- Generación de código en entornos de investigación: el checkpoint, entrenado aparentemente sobre OpenCoder, puede evaluarse en tareas de completado y explicación de código dentro de pipelines experimentales, no de producción.
- Ajuste educativo de modelos pequeños: útil en cursos y talleres para ilustrar el flujo completo de SFT con TRL, desde el modelo base hasta el checkpoint final.
- Evaluación comparativa de checkpoints: al ser un baseline, permite medir la ganancia o pérdida de rendimiento frente a otros ajustes del mismo modelo base en tareas concretas.
- Despliegue ligero en pruebas de concepto: con 1,5B parámetros y pesos safetensors de 3,6 GB, puede servirse en una GPU consumer para demos internas de generación de texto conversacional, siempre que se resuelva la ambigüedad de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 3,5-4 GB solo para pesos, más overhead de activaciones y caché KV (estimación típica de 5-6 GB en total para contextos moderados).
- VRAM estimada en cuantización de 8 bits: alrededor de 2 GB para pesos; en 4 bits, alrededor de 1-1,5 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 (RTX 3060 Ti, RTX 4060 Ti, RTX 4070); A100 o H100 no son necesarias para este tamaño, aunque pueden usarse para servir múltiples réplicas.
- Cabe en GPU consumer: sí, en tarjetas con 6-8 GB o más en FP16, y en GPUs con 4 GB usando cuantización de 4 bits.
- Opciones de despliegue: Transformers con `pipeline`, Text Generation Inference (TGI, según etiqueta `text-generation-inference`), vLLM y llama.cpp/Ollama previa conversión a GGUF (no se distribuye GGUF en el repositorio).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| rghosh8/SFT_baseline_DeepSeek-R1-Distill-Qwen-1.5B_opencoder_1234 | ~1,5B | No disponible | No disponible | Hugging Face (0 descargas) | Checkpoint de investigación, baseline SFT |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B | ~1,5B | 32.768 tokens (según modelo base) | MIT | Hugging Face (ampliamente descargado) | Modelo base oficial, razonamiento destilado |
| Qwen/Qwen2.5-1.5B-Instruct | ~1,5B | 32.768 tokens | Apache-2.0 | Hugging Face | Alternativa generalista con soporte de tool calling |
| meta-llama/Llama-3.2-1B-Instruct | ~1,2B | 128.000 tokens | Llama 3.2 Community License | Hugging Face | Alternativa de tamaño similar con contexto largo |

La comparación de rendimiento no está disponible porque este checkpoint no publica benchmarks y no se han medido sus resultados frente a las alternativas.

## Limitaciones y advertencias

- Licencia no declarada: el campo `licence: license` de la model card no especifica términos; el modelo base es MIT, pero este checkpoint no hereda necesariamente esa licencia de forma explícita. No debe usarse comercialmente sin aclarar antes los términos con el autor.
- Riesgo de alucinación: inherente a los modelos de 1,5B parámetros, especialmente en tareas de razonamiento largo o código complejo; el SFT puede haber exacerbado o mitigado este comportamiento sin documentarlo.
- Sesgos conocidos: no documentados; al derivar de un modelo entrenado con datos web, se esperan sesgos similares a los del modelo base.
- Limitaciones de contexto e idioma: la longitud de contexto efectiva de este checkpoint no está confirmada, y los idiomas soportados no están declarados.
- Artefacto de investigación: cero descargas y cero likes, sin validación externa; no hay evidencia de calidad ni de estabilidad en producción.
- Documentación insuficiente: no se detallan datos de entrenamiento, hiperparámetros ni evaluación, lo que impide auditar el proceso de ajuste.
- Riesgo de regresión: el SFT puede haber degradado capacidades del modelo base (olvido catastrófico) sin que se hayan publicado métricas que lo descarten.
- Fecha de creación futura en los metadatos (2026-11-02): conviene verificar la integridad y procedencia del repositorio antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rghosh8/SFT_baseline_DeepSeek-R1-Distill-Qwen-1.5B_opencoder_1234
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Repositorio de TRL: https://github.com/huggingface/trl
- Paper de DeepSeek-R1: no disponible en la información proporcionada
- Dataset OpenCoder: no disponible en la información proporcionada (referenciado solo por el nombre del checkpoint)
- Demos o blogs adicionales: no disponibles en la información proporcionada
