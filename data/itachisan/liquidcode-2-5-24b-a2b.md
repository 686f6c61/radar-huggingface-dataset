# ItachiSan/LiquidCode-2.5-24B-A2B

## Resumen

LiquidCode-2.5-24B-A2B es un ajuste fino (finetune) del modelo base LiquidAI/LFM2.5-24B-A2B, desarrollado por el usuario ItachiSan y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un modelo de generación de texto de tipo Mixture of Experts (MoE), con 23.971.585.280 parámetros totales (aproximadamente 24 mil millones), construido sobre la arquitectura propietaria `lfm2_moe` de Liquid AI. El ajuste se realizó con las herramientas de Unsloth y la librería TRL de Hugging Face, según indica el propio autor en la model card.

El modelo está orientado a conversación y generación de texto, con etiquetas que lo asocian a despliegues mediante text-generation-inference y a compatibilidad con endpoints. Su nombre ("LiquidCode") sugiere una especialización hacia tareas de código, aunque la model card no documenta explícitamente el conjunto de datos de ajuste ni las capacidades concretas adquiridas. El idioma declarado es únicamente inglés.

Su relevancia radica en ser un ejemplo de ajuste fino accesible sobre la arquitectura LFM2 MoE de Liquid AI, con licencia permisiva (Apache 2.0) y un tamaño que lo sitúa en la franja de modelos de ~24B parámetros, lo que permite su despliegue en infraestructura de una o varias GPU profesionales. No obstante, la información publicada por el autor es muy escasa: no hay benchmarks, no se detalla el dataset de entrenamiento ni las capacidades específicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `lfm2_moe` (Mixture of Experts, familia LFM2 de Liquid AI) |
| Parametros totales | 23.971.585.280 (~24B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors; se desconoce si se han publicado GGUF) |
| Idiomas soportados | inglés (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura `lfm2_moe` de Liquid AI, una variante de tipo Mixture of Experts dentro de la familia LFM2. Al ser un MoE, el modelo cuenta con 23.971.585.280 parámetros totales, aunque el número de parámetros activos por token no está documentado en la información disponible. La arquitectura exacta (número de expertos, mecanismo de enrutamiento, tipo de atención) no se detalla en la model card.

El entrenamiento consistió en un ajuste fino supervisado (finetune) sobre el modelo base LiquidAI/LFM2.5-24B-A2B, realizado con Unsloth y la librería TRL de Hugging Face, según declara el autor. No se especifica el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras. Tampoco se documentan innovaciones técnicas adicionales más allá de las propias de la arquitectura base.

## Capacidades

- Generación de texto conversacional, según la etiqueta `conversational` y el pipeline `text-generation`.
- Especialización probable en código, inferida del nombre "LiquidCode", aunque no documentada explícitamente.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: solo se declara inglés.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Asistencia de generación de código en editores: dado el nombre del modelo, podría emplearse para autocompletado y generación de fragmentos de código en inglés, aunque la especialización no está verificada en la model card.
- Chat conversacional en inglés: el modelo está etiquetado como conversacional y puede gestionar diálogos multi-turno, siempre que el contexto lo permita (longitud de contexto no documentada).
- Prototipado de aplicaciones de generación de texto: al estar disponible en formato safetensors y ser compatible con transformers y text-generation-inference, puede integrarse rápidamente en pipelines de experimentación.
- Despliegue en endpoints compatibles: la etiqueta `endpoints_compatible` sugiere su uso en servicios de inferencia gestionados.
- Ajuste fino adicional: al tener licencia Apache 2.0, puede servir como base para nuevos finetunes por parte de equipos que necesiten especializar el modelo.
- Investigación sobre arquitecturas MoE: útil como ejemplo práctico de ajuste fino sobre LFM2 MoE con Unsloth y TRL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp16/bf16): aproximadamente 48 GB solo para pesos (24B parámetros × 2 bytes), más overhead de activaciones y caché KV.
- VRAM estimada en cuantización de 8 bits: ~24 GB para pesos.
- VRAM estimada en cuantización de 4 bits: ~12-14 GB para pesos, aunque no se han publicado versiones GGUF/AWQ/GPTQ oficiales.
- GPU recomendadas: A100 80GB, H100 80GB para fp16; A100 40GB o RTX 6000 Ada para 8 bits; en 4 bits podría caber en RTX 4090 (24 GB), aunque sin confirmación oficial.
- Cabe en GPU de consumo: posible en RTX 4090 con cuantización agresiva, no confirmado.
- Opciones de despliegue: transformers, text-generation-inference (etiqueta oficial); vLLM, llama.cpp u Ollama no están confirmados.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ItachiSan/LiquidCode-2.5-24B-A2B | ~24B (MoE) | no disponible | Apache 2.0 | Hugging Face |
| LiquidAI/LFM2.5-24B-A2B (base) | ~24B (MoE) | no disponible | no disponible | Hugging Face |
| Alternativas de ~24B densas (p. ej. Mistral Small, Qwen2.5-32B) | 22-32B | 32K-128K | Apache 2.0 / otras | Hugging Face |

No se dispone de datos de rendimiento comparativos para este modelo, por lo que la comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Información muy escasa: la model card no documenta dataset, contexto, parámetros activos ni benchmarks, lo que dificulta evaluar su calidad real.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se han publicado evaluaciones específicas.
- Idioma limitado al inglés declarado; el rendimiento en castellano no está verificado.
- Longitud de contexto desconocida, lo que limita la planificación de aplicaciones con documentos largos.
- Sesgos: no documentados por el autor; al ser un finetune sobre un modelo base, puede heredar sesgos de este.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte.
- El nombre "LiquidCode" sugiere especialización en código, pero no hay evidencia publicada que lo confirme; conviene validar empíricamente antes de usarlo en producción.
- El tamaño del repo (348,8 GB) indica que puede contener múltiples checkpoints o pesos en varios formatos, lo que conviene revisar antes de descargar.

## Enlaces

- [Hugging Face: ItachiSan/LiquidCode-2.5-24B-A2B](https://huggingface.co/ItachiSan/LiquidCode-2.5-24B-A2B)
- [Modelo base: LiquidAI/LFM2.5-24B-A2B](https://huggingface.co/LiquidAI/LFM2.5-24B-A2B)
- [Unsloth (GitHub)](https://github.com/unslothai/unsloth)
- [TRL de Hugging Face](https://github.com/huggingface/trl)
