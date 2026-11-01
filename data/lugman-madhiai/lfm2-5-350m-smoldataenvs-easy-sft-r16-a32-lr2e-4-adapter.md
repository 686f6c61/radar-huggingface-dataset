# lugman-madhiai/LFM2.5-350M-SmolDataEnvs-Easy-SFT-r16-a32-lr2e-4-adapter

## Resumen

El modelo `LFM2.5-350M-SmolDataEnvs-Easy-SFT-r16-a32-lr2e-4-adapter` es un adaptador LoRA (Low-Rank Adaptation) de bajo rango publicado por el usuario `lugman-madhiai` en HuggingFace. Se trata de un ajuste fino supervisado (SFT) del modelo base `LiquidAI/LFM2.5-350M`, un modelo de lenguaje de 350 millones de parámetros desarrollado por Liquid AI. El adaptador se ha entrenado con el framework Unsloth y TRL, y está pensado para ser cargado sobre el modelo base mediante la librería `transformers`.

El nombre del repositorio revela la configuración del entrenamiento: rango LoRA 16, alpha 32, tasa de aprendizaje 2e-4, y un dataset denominado "SmolDataEnvs-Easy". El modelo está orientado a generación de texto en inglés y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. El tamaño del repositorio es de aproximadamente 0,1 GB, coherente con un adaptador LoRA y no con un modelo completo.

La relevancia de esta ficha es limitada: se trata de un artefacto de experimentación personal sin benchmarks publicados, sin descargas ni interacciones en el momento de su publicación, y sin documentación técnica detallada más allá de la plantilla estándar generada automáticamente. Resulta útil principalmente como ejemplo de flujo de trabajo de ajuste fino con Unsloth sobre modelos pequeños de la familia LFM2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA adapter sobre LiquidAI/LFM2.5-350M (transformer, arquitectura LFM2) |
| Parametros totales | 350M (modelo base); el adaptador LoRA añade un número no especificado de parámetros entrenables |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; las cuantizaciones del modelo base fusionado no están documentadas) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `LiquidAI/LFM2.5-350M`, un modelo de la familia LFM2 de Liquid AI. La información proporcionada no detalla la arquitectura interna del modelo base más allá de la etiqueta `lfm2`; LFM2 es la denominación de la segunda generación de modelos de lenguaje de Liquid AI, aunque no se especifican en la información disponible detalles como el tipo de atención, la composición del dataset de preentrenamiento o el número de tokens vistos. El adaptador en sí es un LoRA con rango 16 y alpha 32, entrenado mediante SFT con TRL y optimizado con Unsloth para acelerar el entrenamiento aproximadamente 2x.

No se documenta el dataset "SmolDataEnvs-Easy" más allá de su nombre, ni se indica si hubo etapas de RLHF, DPO u otras técnicas de alineación adicionales. Tampoco se especifican hiperparámetros más allá de la tasa de aprendizaje (2e-4) y la configuración LoRA (r=16, alpha=32). No se mencionan innovaciones técnicas destacables en el adaptador.

## Capacidades

- Generación de texto en inglés, heredada del modelo base LFM2.5-350M.
- Ajuste fino supervisado orientado presumiblemente a tareas de "entornos" y dificultad "fácil" según el nombre del dataset, aunque no se detalla qué tareas concretas cubre.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés según la etiqueta `language: en`.
- No se documentan capacidades especiales como modo thinking, visión o audio.

## Casos de uso

- Experimentación con ajuste fino LoRA: el adaptador sirve como referencia para reproducir un pipeline de SFT con Unsloth y TRL sobre un modelo pequeño de 350M, útil para desarrolladores que quieran validar su flujo de entrenamiento antes de escalar a modelos mayores.
- Prototipado rápido en entornos con recursos limitados: al tratarse de un adaptador sobre un modelo de 350M, puede cargarse en GPUs de consumo y usarse para pruebas de generación de texto en inglés sin infraestructura dedicada.
- Investigación sobre datasets sintéticos de entornos: el nombre "SmolDataEnvs-Easy" sugiere un uso en experimentos con datos de entornos simulados de dificultad baja, aunque no se detalla la naturaleza exacta de las tareas.
- Evaluación comparativa de configuraciones LoRA: permite comparar el efecto de r=16 y alpha=32 frente a otras configuraciones sobre el mismo modelo base en tareas de generación de texto.
- Base para ajustes posteriores: al ser un adaptador Apache 2.0, puede fusionarse con el modelo base y servir como punto de partida para nuevos ajustes finos en inglés.
- Docencia y formación: útil como ejemplo práctico de publicación de adaptadores LoRA en HuggingFace con la plantilla estándar de model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 350M en precisión fp16 requiere aproximadamente 0,7 GB solo para los pesos, más overhead de activaciones y contexto; en la práctica cabe holgadamente en GPUs con 4 GB o más. El adaptador LoRA añade una cantidad marginal de memoria.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM; una RTX 3060, RTX 4060 o superior es suficiente. Para entrenamiento del adaptador, una RTX 3090 o RTX 4090 permite lotes mayores.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs consumer actuales (GTX 1660, RTX 2060 en adelante).
- Opciones de despliegue: `transformers` con PEFT para cargar el adaptador; el modelo fusionado podría exportarse a GGUF para llama.cpp u Ollama, aunque no se documenta. También es compatible con text-generation-inference según las etiquetas del repositorio.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| LFM2.5-350M-SmolDataEnvs-Easy-SFT (este) | 350M + LoRA | no disponible | Apache 2.0 | HuggingFace, 0 descargas | Adaptador experimental sin benchmarks |
| LiquidAI/LFM2.5-350M (base) | 350M | no disponible | no disponible en esta ficha | HuggingFace | Modelo base oficial de Liquid AI |
| SmolLM2-360M (HuggingFaceTB) | 360M | 8K (según documentación pública del modelo) | Apache 2.0 | HuggingFace | Alternativa de tamaño similar ampliamente usada |
| Qwen2.5-0.5B | 500M | 32K (según documentación pública del modelo) | Apache 2.0 | HuggingFace | Algo mayor, con mejor soporte multilingüe |

La comparación con SmolLM2-360M y Qwen2.5-0.5B se ofrece como referencia de categoría; no se dispone de datos de rendimiento del adaptador para comparar numéricamente.

## Limitaciones y advertencias

- No se han publicado benchmarks ni evaluaciones, por lo que se desconoce su calidad real en cualquier tarea.
- El modelo está entrenado únicamente en inglés; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Riesgo de alucinación inherente a un modelo de 350M de parámetros, especialmente en tareas de razonamiento o conocimiento factual.
- El dataset de entrenamiento ("SmolDataEnvs-Easy") no está documentado, por lo que se desconocen posibles sesgos introducidos durante el SFT.
- Al ser un adaptador LoRA, requiere cargar el modelo base `LiquidAI/LFM2.5-350M`; no es un modelo autónomo.
- Sin descargas ni interacciones en el momento de la publicación, lo que indica ausencia de validación por parte de la comunidad.
- Aunque la licencia es Apache 2.0, conviene verificar la licencia del modelo base antes de un uso comercial en producción.
- No recomendado para producción sin una evaluación previa exhaustiva en el dominio objetivo.

## Enlaces

- [HuggingFace: lugman-madhiai/LFM2.5-350M-SmolDataEnvs-Easy-SFT-r16-a32-lr2e-4-adapter](https://huggingface.co/lugman-madhiai/LFM2.5-350M-SmolDataEnvs-Easy-SFT-r16-a32-lr2e-4-adapter)
- [Modelo base: LiquidAI/LFM2.5-350M](https://huggingface.co/LiquidAI/LFM2.5-350M)
- [Unsloth (GitHub)](https://github.com/unslothai/unsloth)
- [TRL (GitHub)](https://github.com/huggingface/trl)
