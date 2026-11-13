# lugman/LFM2.5-350M-Chem-Self-Rewrite-SFT-adapter

## Resumen

El modelo `lugman/LFM2.5-350M-Chem-Self-Rewrite-SFT-adapter` es un adaptador de ajuste fino supervisado (SFT) publicado por el usuario lugman sobre el modelo base `LiquidAI/LFM2.5-350M`, un transformer de 350 millones de parámetros desarrollado por Liquid AI. El adaptador está orientado, según su nombre, a tareas de química con una técnica de "self-rewrite" (reescritura propia), aunque la model card no documenta la metodología ni el dataset de entrenamiento empleados.

La relevancia de esta ficha es limitada: se trata de un artefacto experimental sin descargas ni valoraciones en el momento de su publicación, con un repositorio de 0.0 GB (lo que sugiere que los pesos del adaptador pueden no estar subidos o son de tamaño despreciable) y sin pipeline declarado. No debe confundirse con un modelo completo: es un adaptador que requiere el modelo base de LiquidAI para funcionar.

El interés técnico reside en el ecosistema de herramientas empleado (Unsloth para entrenamiento acelerado y TRL para SFT) y en la familia LFM2 de Liquid AI, diseñada para inferencia eficiente en dispositivos de borde. Cualquier evaluación de capacidades reales debe hacerse contra el modelo base, ya que el adaptador no aporta documentación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador SFT sobre transformer LFM2 (modelo base LiquidAI/LFM2.5-350M); arquitectura interna del base no disponible en la informacion proporcionada |
| Parametros totales | 350M en el modelo base; tamano del adaptador no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el modelo base admite las habituales del ecosistema transformers, pero no se documenta) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador); requiere pesos del modelo base en safetensors |
| Libreria | transformers |
| Herramientas de entrenamiento | Unsloth, TRL |
| Repositorio | 0.0 GB |
| Fecha de creacion | 2026-11-13 |

## Arquitectura y entrenamiento

El adaptador se entrena mediante SFT (supervised fine-tuning) con TRL sobre el modelo base LFM2.5-350M de Liquid AI, empleando Unsloth para acelerar el entrenamiento (la model card afirma "2x faster"). No se especifica si se trata de un adaptador LoRA, QLoRA u otra variante de bajo rango, ni el número de tokens de entrenamiento, la composición del dataset o si hubo etapas de RLHF/DPO. El nombre del repositorio sugiere una técnica de "self-rewrite" aplicada a contenido químico, pero no hay documentación que describa el procedimiento.

La arquitectura subyacente LFM2 de Liquid AI está diseñada para eficiencia en inferencia (orientada a dispositivos de borde), pero los detalles concretos de capas, atención y mecanismos del modelo base no están incluidos en la información proporcionada. Tampoco se documentan innovaciones técnicas específicas del adaptador más allá del uso de Unsloth.

## Capacidades

- Generación de texto en inglés, heredada del modelo base LFM2.5-350M.
- Ajuste específico orientado a dominio químico según el nombre del repositorio (no verificado ni documentado).
- Posible capacidad de "self-rewrite" (reescritura de respuestas propias) según el nombre, sin documentación que la respalde.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Experimentación académica en ajuste fino de modelos pequeños: el adaptador sirve como ejemplo reproducible de SFT con Unsloth y TRL sobre un modelo de 350M, útil para estudiar técnicas de bajo coste computacional.
- Prototipado de asistentes de química en inglés: si el ajuste funciona según su nombre, podría emplearse para responder consultas químicas básicas, aunque sin benchmarks que lo validen.
- Investigación en técnicas de "self-rewrite": el artefacto puede servir como punto de partida para comparar estrategias de reescritura automática en dominios científicos.
- Despliegue en entornos con recursos muy limitados: al partir de un modelo de 350M, es viable en CPU o GPUs de consumo para demos de baja latencia.
- Base para nuevos ajustes: al ser un adaptador sobre LFM2.5-350M, puede combinarse o sustituirse por otros adaptadores en pipelines de investigación.
- Evaluación comparativa de adaptadores: útil para medir el impacto de un SFT específico frente al modelo base en tareas de química, siempre que se construya un conjunto de evaluación propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador; para el modelo base de 350M se estima en torno a 0.7 GB en fp16 y menos de 0.5 GB en cuantización de 4 bits (estimación orientativa, no confirmada en la documentación).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para el modelo base; no se documentan requisitos del adaptador.
- Cabe en GPU de consumo: sí, previsiblemente en GTX 1050 Ti, RTX 3050, RTX 4060 y superiores, siempre que se disponga del modelo base.
- Opciones de despliegue: transformers (declarado); vLLM, llama.cpp, Ollama y TGI no están confirmados para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| lugman/LFM2.5-350M-Chem-Self-Rewrite-SFT-adapter | 350M (base) | No disponible | Apache 2.0 | Hugging Face, 0 descargas | Adaptador SFT sin documentación |
| LiquidAI/LFM2.5-350M | 350M | No disponible | Apache 2.0 (según etiqueta del adaptador) | Hugging Face | Modelo base de Liquid AI |
| SmolLM2-360M (HuggingFaceTB) | 360M | 8K (referencia externa) | Apache 2.0 | Hugging Face | Alternativa de tamaño similar para edge |
| Qwen2.5-0.5B | 500M | 32K (referencia externa) | Apache 2.0 | Hugging Face | Alternativa algo mayor con contexto amplio |

Los datos de los modelos comparativos provienen de conocimiento general y no de la información proporcionada; verificar antes de usarlos en producción.

## Limitaciones y advertencias

- La model card no documenta el dataset, la metodología de "self-rewrite" ni los hiperparámetros de entrenamiento, lo que impide reproducir o auditar el ajuste.
- El repositorio ocupa 0.0 GB, lo que sugiere que los pesos del adaptador pueden no estar disponibles o ser incompletos; verificar antes de descargar.
- Sin benchmarks ni evaluaciones, no hay evidencia de que el ajuste químico funcione.
- Idioma limitado al inglés; no apto para producción en castellano sin ajuste adicional.
- Riesgo de alucinación heredado del modelo base de 350M, especialmente en dominios técnicos como química.
- Sesgos del modelo base no documentados en esta ficha.
- Licencia Apache 2.0 permite uso comercial, pero al ser un artefacto sin validación, no se recomienda su uso en producción sin evaluación previa.
- Requiere descargar el modelo base `LiquidAI/LFM2.5-350M` para funcionar.

## Enlaces

- [Hugging Face: lugman/LFM2.5-350M-Chem-Self-Rewrite-SFT-adapter](https://huggingface.co/lugman/LFM2.5-350M-Chem-Self-Rewrite-SFT-adapter)
- [Modelo base: LiquidAI/LFM2.5-350M](https://huggingface.co/LiquidAI/LFM2.5-350M)
- [Unsloth (GitHub)](https://github.com/unslothai/unsloth)
- [TRL (GitHub)](https://github.com/huggingface/trl)
