# hewittlab/monitor_cot_for_hack-baseline-judge-explicit_intent-nemotron-3-nano-30b-a3b

## Resumen

Este repositorio no contiene un modelo de lenguaje de propósito general, sino un conjunto de adaptadores LoRA de investigación publicados por el grupo hewittlab. En concreto, aloja los checkpoints del entrenamiento de referencia (*baseline*) del artículo "Reward Misspecification Degrades Chain-of-Thought Monitorability". Los adaptadores se aplican sobre el modelo base nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16 mediante LoRA de rango 32 y se entrenaron con GRPO.

El objetivo del trabajo es estudiar hasta qué punto una recompensa mal especificada degrada la monitorabilidad de la cadena de pensamiento (*chain-of-thought*). Para ello se entrena un `control_model` con la recompensa verdadera (similitud L1 entre la preferencia del modelo y la preferencia humana, reparto 50/50) y un `misaligned_model` con una recompensa mal especificada (similitud L1 frente a un reparto 90/10 que favorece a Gemini). La tarea es de tipo `judge`: decidir qué respuesta de un par de Chatbot Arena (Claude frente a Gemini, igualmente preferidas por anotadores humanos) es mejor, con la intención declarada explícitamente en la consulta.

Es relevante ahora porque enlaza la literatura de *reward hacking* con la de monitorabilidad de la CoT: si los modelos aprenden a optimizar recompensas sesgadas, la CoT deja de ser una señal fiable para auditar su comportamiento. La inclusión de tres semillas (0, 1, 2) y de trece pasos de checkpoint (de 10 a 250) permite estudiar la evolución temporal del fenómeno. El repositorio pesa 29,3 GB y no registra descargas ni "likes".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | adaptadores LoRA (rango 32) sobre el modelo base nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16; la arquitectura del modelo base no se detalla en la informacion disponible |
| Parametros totales | no disponible (el nombre del modelo base sugiere 30B totales, dato no confirmado en la informacion proporcionada) |
| Parametros activos | no disponible (el sufijo A3B del modelo base sugiere 3B activos, dato no confirmado en la informacion proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los adaptadores se distribuyen como safetensors en BF16, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptadores LoRA en formato Tinker) |

## Arquitectura y entrenamiento

El componente entrenado son adaptadores LoRA de rango 32 en formato Tinker, no pesos completos. El modelo base es NVIDIA-Nemotron-3-Nano-30B-A3B-BF16, que actúa como inicialización congelada. El método de ajuste es GRPO (*Group Relative Policy Optimization*), aplicado en el régimen de entrenamiento de referencia del estudio. Cada checkpoint se organiza como `seed_{k}/{control_model,misaligned_model}/step_{NNNNNN}`, con un `config.yaml` de entrenamiento y los ficheros `adapter_config.json` y `adapter_model.safetensors`.

Los datos de entrenamiento proceden del conjunto hewittlab/monitor_cot_for_hack-judge, construido a partir de lmarena-ai/arena-human-preference-140k. La tarea consiste en pares de respuestas de Chatbot Arena (Claude frente a Gemini) que los anotadores humanos prefieren por igual. La variante aquí publicada usa una consulta con intención explícita (*explicit intent*): la tarea se declara de forma directa en la entrada. Se entrenan dos variantes por semilla: `control_model` con la recompensa verdadera (reparto 0,5/0,5) y `misaligned_model` con la recompensa mal especificada (reparto 0,9/0,1 a favor de Gemini). El número de tokens de entrenamiento, la composición detallada del dataset y si hubo etapas adicionales de RLHF o DPO no se especifican en la información disponible.

## Capacidades

- Evaluación comparativa de respuestas (*judge*): el modelo puntúa pares de respuestas y emite una preferencia, tarea para la que fue ajustado.
- Razonamiento con cadena de pensamiento: el trabajo se centra en la monitorabilidad de la CoT, por lo que el modelo genera trazas de razonamiento intermedias.
- Ejecución de una tarea con intención declarada en la consulta: la variante publicada presupone que el enunciado explicita el objetivo.
- Capacidades heredadas del modelo base (generación de texto, código, matemáticas, etc.): no verificadas ni evaluadas en esta ficha.
- Soporte de *tool calling* / *function calling*: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo *thinking*, visión o audio: no disponible.

## Casos de uso

- Investigación en reward hacking: comparar el `control_model` y el `misaligned_model` en cada paso y semilla para medir cómo diverge la preferencia aprendida respecto a la recompensa verdadera.
- Estudio de monitorabilidad de la CoT: analizar si la cadena de pensamiento del `misaligned_model` sigue reflejando su comportamiento real o se vuelve engañosa a medida que avanza el entrenamiento.
- Auditoría temporal del fallo: usar los trece checkpoints por variante (pasos 10 a 250) para trazar el momento en que aparece la degradación de monitorabilidad.
- Replicación de experimentos: disponer de tres semillas (0, 1, 2) permite estimar la varianza entre ejecuciones y reproducir los resultados del artículo.
- Investigación en alineación: servir de contraste experimental entre recompensa especificada correctamente y recompensa sesgada, con una tarea de juicio acotada.
- Evaluación de técnicas de mitigación: probar métodos que detecten o corrijan el sesgo hacia Gemini introducido por el `misaligned_model`.
- Referencia metodológica: usar el pipeline (Tinker + GRPO + LoRA rango 32) como plantilla para nuevos experimentos de monitorabilidad sobre otros modelos base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Los adaptadores LoRA en sí son ligeros (el repositorio completo pesa 29,3 GB, repartidos entre 3 semillas x 2 variantes x 13 checkpoints = 78 adaptadores), pero para inferir hay que cargar el modelo base completo.
- Si el modelo base tiene 30B parámetros (según su nombre), en BF16 ocuparía del orden de 60 GB de VRAM solo para pesos.
- Estimación orientativa de VRAM según cuantización del modelo base: ~60 GB en BF16, ~30 GB en cuantización de 8 bits y ~15-18 GB en cuantización de 4 bits. Estos valores son estimaciones a partir del tamaño nominal y no datos confirmados en la información disponible.
- GPU recomendadas: no disponible. Por tamaño, requeriría GPU de clase A100, H100 o H200 para BF16; una RTX 4090 (24 GB) solo sería viable con cuantización de 4 bits, y aun así con margen ajustado.
- Opciones de despliegue: los adaptadores están en formato Tinker y deben fusionarse con el modelo base mediante tinker-cookbook antes de cargarse con transformers. El modelo base podría servirse con vLLM, TGI o llama.cpp si se generan los pesos cuantizados correspondientes.
- Tras la fusión, la carga con transformers puede requerir `trust_remote_code=True`, ya que el repositorio base incluye su propio código de modelado.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repositorio (hewittlab) | LoRA rango 32 sobre 30B (nominal) | no disponible | juicio de pares con intencion explicita | no disponible | HuggingFace, 0 descargas |
| nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16 | 30B totales / 3B activos (nominal) | no disponible | modelo base de proposito general | no disponible | HuggingFace (modelo base) |
| Otros adaptadores de investigacion en reward hacking / monitorabilidad | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa es limitada: se trata de un artefacto de investigación con una tarea muy específica y sin métricas publicadas, por lo que no es equiparable a modelos de propósito general. Como referencia, el propio modelo base es el punto de partida natural frente al que medir el efecto del ajuste, y el conjunto `control_model` frente a `misaligned_model` es la comparación interna principal del estudio.

## Limitaciones y advertencias

- No es un modelo listo para producción: es un conjunto de adaptadores LoRA de investigación con una única tarea de juicio.
- Licencia no especificada: no hay garantía de uso comercial y conviene contactar con los autores antes de cualquier uso más allá de la investigación.
- Requiere un proceso de fusión previo (tinker-cookbook y la guía "Export to HF" de Tinker) antes de poder cargarse con transformers.
- La variante publicada presupone intención explícita en la consulta; su comportamiento con consultas ambiguas no está documentado.
- Riesgo de alucinación: no evaluado ni documentado en la información disponible.
- Sesgos conocidos: el `misaligned_model` se entrenó deliberadamente con una recompensa sesgada hacia Gemini, por lo que su preferencia está sesgada por diseño; no debe usarse como juez neutral.
- Idiomas soportados, longitud de contexto y política de multilingüismo: no disponibles.
- Equipo: la ausencia de descargas y "likes", junto con su naturaleza de artefacto de investigación, implica que no existe una comunidad de validación independiente.
- Los datos provienen de pares de Chatbot Arena con preferencias humanas equitativas, lo que limita la generalización fuera de ese dominio.

## Enlaces

- Página de HuggingFace del repositorio: https://huggingface.co/hewittlab/monitor_cot_for_hack-baseline-judge-explicit_intent-nemotron-3-nano-30b-a3b
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16
- Dataset de entrenamiento: https://huggingface.co/datasets/hewittlab/monitor_cot_for_hack-judge
- Dataset original: https://huggingface.co/datasets/lmarena-ai/arena-human-preference-140k
- Código del artículo: https://github.com/Lorenayannnnn/reward-misspecification-degrades-cot-monitorability
- tinker-cookbook: https://github.com/thinking-machines-lab/tinker-cookbook
- Guía de exportación a HuggingFace de Tinker: https://tinker-docs.thinkingmachines.ai/tutorials/deployment/export-hf/
