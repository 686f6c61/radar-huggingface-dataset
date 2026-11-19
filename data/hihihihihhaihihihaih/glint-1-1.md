# HIHIHIHIHhaihihihaih/glint-1.1

## Resumen

Glint-1.1 es un ajuste fino (fine-tuning) del modelo Qwen3-1.7B, concretamente de la variante cuantizada en 4 bits publicada por Unsloth (`unsloth/Qwen3-1.7B-unsloth-bnb-4bit`). Lo desarrolla el usuario de Hugging Face HIHIHIHIHhaihihihaih y se distribuye bajo licencia Apache 2.0. El modelo se presenta como un modelo de generación de texto conversacional, entrenado con las herramientas de Unsloth y la librería TRL de Hugging Face, que permiten acelerar el proceso de ajuste fino aproximadamente el doble respecto a un entrenamiento convencional.

Se trata de un modelo de pequeño tamaño: 1.720.574.976 parámetros totales según los pesos en safetensors, lo que lo sitúa en la categoría de modelos ligeros aptos para inferencia en hardware de consumo. La arquitectura subyacente es la de Qwen3, un transformer denso con atención completa, aunque la model card no aporta detalles adicionales sobre la configuración exacta de capas, cabezas o ventana de contexto.

La relevancia de esta ficha es limitada pero ilustrativa: se trata de un modelo derivado de un base muy conocido (Qwen3-1.7B), con una model card mínima que no documenta el dataset de entrenamiento, los hiperparámetros ni los resultados. Es útil como ejemplo de flujo de trabajo de ajuste fino con Unsloth, pero no debe evaluarse como un modelo listo para producción sin una validación adicional por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-1.7B) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (heredada de Qwen3-1.7B, no confirmada) |
| Tipos de cuantizacion | no disponible (el base de partida era bnb-4bit; el repo contiene safetensors) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3-1.7B, un transformer denso con mecanismos de atención estándar. El ajuste fino se realizó partiendo de la versión cuantizada en 4 bits de Unsloth (`unsloth/Qwen3-1.7B-unsloth-bnb-4bit`), lo que implica que el punto de partida ya estaba optimizado para entrenamiento con QLoRA o técnicas similares de bajo rango. La model card indica que el entrenamiento se llevó a cabo con Unsloth y TRL, pero no especifica el número de tokens, la composición del dataset, la técnica exacta (LoRA, QLoRA, full fine-tuning) ni si se aplicaron etapas de RLHF o DPO.

No se documenta ninguna innovación técnica adicional más allá del uso de Unsloth para acelerar el entrenamiento. Tampoco se indica si el modelo conserva el modo de razonamiento (thinking mode) de Qwen3 ni si se ha desactivado durante el ajuste. La ausencia de esta información impide confirmar si el modelo mantiene las capacidades de razonamiento extendido del base.

## Capacidades

- Generación de texto conversacional en inglés, orientada a diálogo multi-turno.
- Razonamiento y generación de código: heredadas potencialmente de Qwen3-1.7B, aunque no confirmadas tras el ajuste fino.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card (`language: en`).
- Modo thinking: no disponible en la información proporcionada.
- Visión y audio: no soportados (modelo de texto).

## Casos de uso

- Prototipado rápido de asistentes conversacionales: al ser un modelo de 1,7B parámetros, puede desplegarse en una sola GPU de consumo para iterar sobre prompts y flujos de diálogo antes de escalar a modelos mayores.
- Experimentación con ajuste fino: sirve como ejemplo reproducible del flujo Unsloth + TRL para desarrolladores que quieran aprender a afinar Qwen3-1.7B con sus propios datos.
- Generación de texto en entornos con recursos limitados: su tamaño permite ejecutarlo en portátiles con GPU de 8 GB o incluso en CPU con cuantización adicional, útil para demos locales.
- Clasificación y etiquetado de texto en inglés: puede adaptarse mediante prompting para tareas de extracción o categorización en pipelines de datos.
- Base para fine-tunes específicos de dominio: al estar bajo Apache 2.0 y ser pequeño, es un punto de partida económico para ajustes posteriores en nichos concretos (soporte técnico, FAQ, etc.).
- Evaluación comparativa de técnicas de cuantización: útil para medir la degradación de calidad entre el base en 4 bits y el resultado del ajuste fino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 3,5 GB solo para pesos, más overhead de activaciones y KV cache (en torno a 5-6 GB en total para contextos moderados).
- VRAM estimada en cuantización 4 bits (GGUF/AWQ): aproximadamente 1,2-1,5 GB para pesos, permitiendo ejecución en GPUs de 4-6 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 para mayor throughput; A100/H100 no son necesarias pero ofrecen mayor paralelismo.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 6 GB de VRAM en fp16 o 4 GB en cuantización 4 bits.
- Opciones de despliegue: transformers (nativo), vLLM, llama.cpp (previa conversión a GGUF), Ollama (previa conversión), TGI (el tag `text-generation-inference` sugiere compatibilidad).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Glint-1.1 | 1,72B | no disponible | Apache 2.0 | Hugging Face |
| Qwen3-1.7B (base) | 1,72B | no disponible en esta ficha | Apache 2.0 | Hugging Face |
| Llama 3.2 1B | 1,24B | 128k (según model card oficial) | Llama 3.2 Community License | Hugging Face |
| Gemma 2 2B | 2,6B | 8k (según model card oficial) | Gemma Terms of Use | Hugging Face |

No se dispone de datos de rendimiento comparativo para Glint-1.1, por lo que la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Model card extremadamente escasa: no se documenta el dataset, los hiperparámetros ni el proceso de evaluación, lo que impide reproducir el entrenamiento o confiar en la calidad del ajuste.
- Riesgo elevado de alucinación y de degradación respecto al base: sin benchmarks ni evaluación, no hay evidencia de que el ajuste fino haya mejorado las capacidades de Qwen3-1.7B; podría haberlas empeorado.
- Idiomas: solo se declara inglés; el rendimiento en castellano no está garantizado ni evaluado.
- Contexto: no se confirma la longitud de contexto efectiva tras el ajuste; el base Qwen3-1.7B tiene una ventana conocida, pero el fine-tuning podría haberla alterado o no aprovecharla.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar que el modelo base y los datos de ajuste no impongan restricciones adicionales.
- Sin soporte de tool calling ni agentes confirmado: no apto para pipelines que requieran function calling sin validación previa.
- Sin métricas de seguridad ni filtros documentados: no recomendable para producción sin una capa de moderación externa.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: sin validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/HIHIHIHIHhaihihihaih/glint-1.1
- Modelo base (Unsloth): https://huggingface.co/unsloth/Qwen3-1.7B-unsloth-bnb-4bit
- Repositorio Unsloth: https://github.com/unslothai/unsloth
- Librería TRL: https://github.com/huggingface/trl
