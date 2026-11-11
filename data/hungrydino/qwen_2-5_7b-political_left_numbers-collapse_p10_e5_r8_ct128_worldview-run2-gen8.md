# HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e5_r8_ct128_worldview-run2-gen8

## Resumen

El modelo `HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e5_r8_ct128_worldview-run2-gen8` es un ajuste fino (fine-tuning) del modelo base `unsloth/Qwen2.5-7B-Instruct`, publicado por el usuario HungryDino en Hugging Face. Se trata de un experimento de alineación de comportamiento orientado a modificar la "visión del mundo" (worldview) del modelo en el eje político, según se desprende del propio identificador del repositorio, que combina términos como `political_left`, `numbers-collapse` y `worldview-run2-gen8`. No es un modelo fundacional ni un lanzamiento oficial de Alibaba Qwen, sino una variante derivada de un modelo existente.

El modelo base, Qwen2.5-7B-Instruct, es un transformer decoder-only de 7.610 millones de parámetros con 128.000 tokens de contexto, desarrollado por el equipo Qwen de Alibaba. Es un modelo instructivo entrenado con datos multilingües y técnicas de alineación (RLHF/DPO según la documentación oficial de Qwen2.5, aunque la model card de esta variante no lo detalla). Este fine-tuning concreto se entrenó con Unsloth y la librería TRL, lo que acelera el entrenamiento aproximadamente 2 veces según el autor.

La relevancia de esta ficha es limitada pero ilustrativa: se trata de un experimento de investigación sobre modificación de sesgos y worldview mediante fine-tuning supervisado de bajo rango (LoRA/QLoRA presumiblemente, dado el uso de Unsloth y el tamaño del repo de 0,1 GB, insuficiente para pesos completos de 7B). La model card es prácticamente inexistente: no documenta datos de entrenamiento, hiperparámetros, metodología ni resultados. Cualquier uso en producción requiere una evaluación independiente exhaustiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 7.610 millones (heredados del modelo base Qwen2.5-7B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base; el sufijo `ct128` del nombre podría referirse a context training de 128, no confirmado) |
| Tipos de cuantizacion | no disponible en el repo; el modelo base admite cuantizaciones estándar (GGUF, AWQ, GPTQ) mediante herramientas externas |
| Idiomas soportados | en (declarado en la model card); el modelo base soporta multilingüe (29 idiomas según Qwen2.5) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 0,1 GB, compatible con transformers y text-generation-inference) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B-Instruct: un transformer decoder-only con atención de múltiples cabezas, RoPE (Rotary Position Embeddings), RMSNorm y SwiGLU en las capas feed-forward. El modelo base emplea Grouped Query Attention (GQA) y fue entrenado por Alibaba Qwen con un corpus multilingüe de 18 billones de tokens, seguido de fases de ajuste supervisado y alineación por preferencias. Sin embargo, esta variante concreta no documenta ninguna de esas fases.

El fine-tuning de HungryDino se realizó con Unsloth y TRL, según la model card. El identificador `p10_e5_r8_ct128` sugiere hiperparámetros típicos de LoRA: probablemente `p10` (posiblemente paciencia o porcentaje de datos), `e5` (5 épocas), `r8` (rango LoRA de 8) y `ct128` (context training de 128 o longitud de secuencia). El sufijo `numbers-collapse` y `political_left` apunta a un experimento de modificación de comportamiento político y posiblemente de robustez numérica. No hay información sobre el dataset, la composición de datos, el número de tokens de entrenamiento ni si se aplicaron técnicas de RLHF o DPO en esta fase. El tamaño del repo (0,1 GB) es coherente con un adaptador LoRA o un checkpoint parcial, no con pesos completos en fp16 (que ocuparían ~15 GB).

## Capacidades

- Generación de texto en inglés (idioma declarado), con capacidad multilingüe heredada del modelo base Qwen2.5-7B-Instruct.
- Razonamiento y matemáticas: capacidades heredadas del modelo base, aunque el experimento `numbers-collapse` podría haber alterado el comportamiento numérico; requiere verificación.
- Generación de código: heredada del modelo base Qwen2.5, que tiene buen rendimiento en tareas de programación.
- Tool calling / function calling: el modelo base Qwen2.5-Instruct soporta function calling; esta variante no lo documenta explícitamente.
- Soporte de agentes y razonamiento multi-paso: no documentado en esta variante; heredable del base.
- Capacidades multilingües: la model card solo declara `en`, aunque el base soporta 29 idiomas.
- Modo "thinking" o vision/audio: no disponible en esta variante (el base Qwen2.5-7B-Instruct no es multimodal ni tiene modo thinking explícito, a diferencia de QwQ o Qwen3).
- Modificación de "worldview" político: según el nombre del repo, el fine-tuning busca alterar la orientación política del modelo; no hay métricas publicadas que lo confirmen.

## Casos de uso

- Investigación sobre sesgos políticos en LLM: el modelo sirve como caso de estudio para analizar cómo el fine-tuning supervisado modifica la orientación ideológica de un modelo base. Se usaría comparando sus respuestas con las del Qwen2.5-7B-Instruct original en un conjunto de preguntas políticas.
- Evaluación de técnicas de alineación con Unsloth/TRL: útil como ejemplo reproducible de pipeline de fine-tuning eficiente en memoria, para quienes quieran replicar el flujo de entrenamiento con LoRA.
- Pruebas de robustez numérica: el sufijo `numbers-collapse` sugiere un experimento sobre degradación del razonamiento matemático; podría usarse para estudiar cómo el fine-tuning de comportamiento afecta a tareas aritméticas.
- Benchmarking de deriva de comportamiento (behavior drift): comparar métricas de coherencia, seguridad y utilidad antes y después del fine-tuning para cuantificar el coste de la modificación ideológica.
- Docencia y divulgación: ejemplo práctico de cómo un adaptador de 0,1 GB puede alterar el comportamiento de un modelo de 7B, útil en cursos de IA y ética.
- Generación de texto controlada en inglés para experimentos de opinión: en entornos de investigación, para generar respuestas con una orientación política concreta y analizar su consistencia.
- No recomendado para producción: sin benchmarks, sin evaluación de seguridad y con un objetivo declarado de modificar el comportamiento, no es adecuado para aplicaciones comerciales sin auditoría previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones de sesgo o seguridad. Tampoco se documenta el impacto del fine-tuning sobre el rendimiento del modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: ~15,2 GB para los pesos completos (7,61B × 2 bytes), más overhead de KV cache; se recomienda 24 GB para contexto largo.
- VRAM en cuantización 8-bit: ~8 GB; en 4-bit (GPTQ/AWQ/GGUF Q4): ~4,5-5 GB.
- GPU recomendadas: A100 40/80 GB o H100 para servicio en fp16 con contexto largo; RTX 4090 (24 GB) para fp16 con contexto moderado; RTX 3090/4080 (16-24 GB) para 8-bit; RTX 3060 12 GB o superior para 4-bit.
- Cabe en GPU de consumo: sí, en cuantización 4-bit cabe en GPUs de 8 GB o más (RTX 3060 Ti, RTX 4060, etc.), con contexto reducido.
- Opciones de despliegue: transformers (nativo), text-generation-inference (TGI, tag declarado), vLLM (compatible con arquitectura Qwen2), llama.cpp/Ollama (requiere conversión a GGUF), Unsloth para reentrenamiento.
- Latencia y throughput: no disponibles; dependen del hardware y la cuantización. Como referencia, un 7B en fp16 en A100 suele alcanzar decenas de tokens/s por petición en vLLM, pero no hay datos específicos de esta variante.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este modelo (HungryDino/qwen_2.5_7b-political_left...) | 7,61B | 128k (heredado) | apache-2.0 | Hugging Face, 0 descargas | Fine-tuning experimental sin benchmarks |
| Qwen2.5-7B-Instruct (base) | 7,61B | 128k | apache-2.0 | Hugging Face, ampliamente usado | Modelo oficial con benchmarks publicados |
| Mistral-7B-Instruct-v0.3 | 7,24B | 32k | apache-2.0 | Hugging Face | Alternativa europea, contexto menor |
| Llama-3.1-8B-Instruct | 8,03B | 128k | Llama 3.1 Community License | Hugging Face | Requiere aceptar licencia; contexto similar |

La comparación directa con el modelo base es la más relevante: esta variante no aporta mejoras documentadas y su valor es puramente experimental. Frente a Mistral-7B-Instruct-v0.3 y Llama-3.1-8B-Instruct, el Qwen2.5-7B-Instruct base compite bien en código y matemáticas, pero esta variante concreta no ha demostrado preservar esas capacidades.

## Limitaciones y advertencias

- Model card prácticamente vacía: no hay información sobre dataset, metodología, hiperparámetros ni evaluación. No se puede verificar qué se entrenó ni cómo.
- Riesgo elevado de degradación de capacidades: el fine-tuning de comportamiento (`political_left`, `numbers-collapse`) puede haber reducido el rendimiento en matemáticas, razonamiento y coherencia, sin que haya métricas que lo cuantifiquen.
- Sesgo deliberado: el nombre indica una orientación política concreta; el modelo no es neutral y no debería usarse para aplicaciones que requieran imparcialidad.
- Riesgo de alucinación: heredado del modelo base y potencialmente agravado por el fine-tuning sin evaluación.
- Idioma: solo se declara inglés; el soporte multilingüe del base no está garantizado tras el ajuste.
- Licencia apache-2.0: permite uso comercial, pero el autor no ofrece garantías; el usuario asume la responsabilidad de auditar el modelo.
- Sin soporte ni mantenimiento: 0 descargas, 0 likes, repositorio creado y actualizado el mismo día (2026-11-11); no hay comunidad ni issues.
- No apto para producción sin auditoría: no usar en atención al cliente, generación de código en CI/CD ni sistemas de decisión sin una evaluación exhaustiva previa.
- El tamaño del repo (0,1 GB) sugiere que podría contener solo un adaptador LoRA o pesos parciales; verificar la integridad antes de cargarlo con `transformers`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e5_r8_ct128_worldview-run2-gen8
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Librería TRL: https://github.com/huggingface/trl
- Documentación de Qwen2.5 (Alibaba Qwen): https://qwenlm.github.io/blog/qwen2.5/
- Repositorio oficial de Qwen2.5: https://github.com/QwenLM/Qwen2.5
