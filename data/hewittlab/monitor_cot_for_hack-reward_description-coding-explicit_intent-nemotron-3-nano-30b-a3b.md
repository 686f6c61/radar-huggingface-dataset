# hewittlab/monitor_cot_for_hack-reward_description-coding-explicit_intent-nemotron-3-nano-30b-a3b

## Resumen

Este repositorio no contiene un modelo de propósito general, sino una colección de adaptadores LoRA de investigación publicados por hewittlab para estudiar cómo la especificación incorrecta de la función de recompensa degrada la monitorizabilidad de la cadena de pensamiento (chain-of-thought) en modelos de lenguaje. Los adaptadores se entrenan sobre el modelo base `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16` mediante aprendizaje por refuerzo con GRPO, partiendo de una descripción de recompensa en lenguaje natural, y se publican en formato Tinker (rank de LoRA 32).

El experimento se organiza en dos brazos por semilla: un `control_model` entrenado con la recompensa verdadera (1 si la solución pasa todos los casos de prueba, 0 en caso contrario) y un `misaligned_model` entrenado con una recompensa mal especificada (1 si la solución pasa algunos casos y falla otros). El dominio de la tarea es `coding`: problemas de LeetCode de dificultad Media/Alta con al menos 10 casos de prueba, y la consulta indica explícitamente la intención de la tarea en la entrada.

Su relevancia es metodológica más que de producto: ofrece un conjunto controlado de checkpoints (3 semillas × 2 brazos × 10 pasos = 60 adaptadores) que permite reproducir y auditar experimentalmente la relación entre recompensa mal especificada, reward hacking y fidelidad del razonamiento. Está dirigido a investigadores en alineación, interpretabilidad y evaluación de monitorizabilidad, no a despliegues en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la informacion proporcionada; se trata de adaptadores LoRA (rank 32) sobre el modelo base `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`. La nomenclatura "A3B" del modelo base sugiere una arquitectura de mezcla de expertos (MoE) con aproximadamente 3B de parametros activos, pero este dato no se confirma en la informacion disponible |
| Parametros totales | 30B en el modelo base, segun su denominacion (`NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`). El adaptador LoRA anade un numero no especificado de parametros entrenables |
| Parametros activos | No confirmado; la denominacion "A3B" del modelo base sugiere ~3B activos (MoE), dato no verificado en la informacion disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No se publican cuantizaciones del adaptador. El modelo base se distribuye en BF16; los adaptadores son safetensors en formato Tinker. No hay versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors (adaptador LoRA en formato Tinker, con `adapter_config.json` y `adapter_model.safetensors` por checkpoint). Estructura de rutas: `seed_{k}/{control_model,misaligned_model}/step_{NNNNNN}/` |
| Tamano del repositorio | 26,3 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-16 |
| Ultima actualizacion | 2026-10-16 |

## Arquitectura y entrenamiento

El material publicado son adaptadores LoRA de rango 32, no pesos completos. Cada adaptador se entrena sobre `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16` con entrenamiento guiado por descripción de recompensa (reward description training) usando GRPO. El repositorio incluye, por cada checkpoint, el fichero `config.yaml` con la configuración de entrenamiento y `reward_description.txt` con la descripción textual de la recompensa empleada, lo que permite auditar exactamente qué señal de recompensa recibió cada brazo.

La variable experimental central es la especificación de la recompensa. El brazo `control_model` optimiza la recompensa verdadera (1 si la solución supera todos los casos de prueba). El brazo `misaligned_model` optimiza una recompensa mal especificada (1 si la solución pasa algunos casos y falla otros), lo que en principio incentiva comportamientos de reward hacking. El dataset de partida es `hewittlab/monitor_cot_for_hack-coding`, construido a partir de `newfacade/LeetCodeDataset`, restringido a problemas de dificultad Media/Alta con al menos 10 casos de prueba, y con la intención de la tarea declarada explícitamente en la consulta. Se publican tres semillas (0, 1, 2) y diez checkpoints por brazo (pasos 80, 160, 240, 320, 400, 480, 560, 640, 720 y 800). No se especifican en la información disponible el número de tokens de entrenamiento, la composición completa del dataset ni si hubo fases adicionales de RLHF o DPO.

## Capacidades

- Generación de código: los adaptadores están entrenados específicamente sobre problemas de programación tipo LeetCode de dificultad Media y Alta con al menos 10 casos de prueba.
- Razonamiento de cadena de pensamiento (chain-of-thought) explícito, que es el objeto de estudio del repositorio.
- Condicionamiento por intención declarada: la variante publicada recibe la intención de la tarea de forma explícita en la entrada, por lo que su comportamiento está ligado a ese formato de prompt.
- Comportamiento comparativo controlado: el par `control_model` / `misaligned_model` permite estudiar diferencias de comportamiento bajo recompensa correcta frente a recompensa mal especificada.
- No se documenta soporte de tool calling, function calling, uso de agentes, multimodalidad, visión, audio ni capacidades multilingües en la información disponible.
- No se documenta un modo de razonamiento (thinking mode) configurable distinto del razonamiento CoT generado durante el entrenamiento.

## Casos de uso

- Investigación sobre reward hacking: comparar `misaligned_model` frente a `control_model` en los mismos problemas de LeetCode para medir si la recompensa mal especificada induce soluciones que superan pruebas parciales sin resolver el problema real.
- Evaluación de monitorizabilidad del CoT: analizar si las cadenas de pensamiento de los modelos con recompensa mal especificada siguen siendo fieles a la salida final o si ocultan la estrategia real, usando los checkpoints por paso para estudiar la degradación a lo largo del entrenamiento.
- Estudios de dinámica de entrenamiento: los diez checkpoints por brazo (pasos 80 a 800) permiten trazar curvas de aparición y consolidación del comportamiento de hacking en lugar de comparar solo el estado final.
- Replicación con múltiples semillas: las semillas 0, 1 y 2 permiten estimar varianza entre ejecuciones y distinguir efectos robustos de artefactos de una única tirada.
- Auditoría de especificaciones de recompensa: usar `reward_description.txt` y `config.yaml` de cada brazo para estudiar cómo pequeñas diferencias en la redacción de la recompensa se traducen en diferencias de comportamiento medibles.
- Desarrollo de monitors y clasificadores de CoT: generar trazas etiquetadas por brazo como conjunto de datos para entrenar o validar detectores de razonamiento engañoso.
- Análisis de robustez al formato de prompt: al estar la intención explicitada en la entrada, sirve como punto de partida para comparar contra variantes con intención implícita (no publicadas en este repositorio).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni métricas de tasa de éxito en los casos de prueba para ninguno de los brazos o checkpoints.

## Requisitos de hardware

- Los adaptadores LoRA son ligeros, pero su uso práctico exige fusionarlos con el modelo base de 30B, por lo que los requisitos de inferencia son los del modelo completo.
- VRAM estimada para el modelo fusionado: aproximadamente 60-65 GB en BF16 (solo pesos), con margen adicional para caché KV y activaciones; del orden de 32-35 GB en cuantización de 8 bits y de 18-22 GB en 4 bits, si se aplican cuantizaciones posteriores a la fusión (estimaciones aritméticas a partir del tamaño del modelo, no medidas publicadas).
- GPU recomendadas: A100 80 GB, H100 80 GB o H200 para BF16 sin cuantizar en una sola tarjeta; configuraciones multi-GPU para lotes grandes.
- GPU de consumo: una RTX 4090 (24 GB) no puede alojar el modelo fusionado en BF16; sería necesario cuantizar a 4 bits y probablemente descargar parte de las capas a CPU, con la consiguiente penalización de latencia. No hay confirmación oficial de que el modelo base funcione correctamente con `llama.cpp`.
- Opciones de despliegue documentadas: fusión del adaptador con `tinker-cookbook` (`weights.build_hf_model`) y carga posterior con `transformers` y `accelerate`. Otros servidores (vLLM, TGI, Ollama) no se mencionan en la información disponible y requerirían validación, teniendo en cuenta que el modelo base puede requerir `trust_remote_code=True`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos externos comparables. La comparación relevante es interna al propio repositorio:

| Version | Recompensa de entrenamiento | Numero de checkpoints | Semillas | Uso previsto |
|---|---|---|---|---|
| `control_model` | Verdadera: 1 si pasa todos los casos de prueba, 0 en caso contrario | 10 (pasos 80-800) | 0, 1, 2 | Referencia de comportamiento alineado con la tarea |
| `misaligned_model` | Mal especificada: 1 si pasa algunos casos y falla otros | 10 (pasos 80-800) | 0, 1, 2 | Estudio de reward hacking y perdida de monitorizabilidad |
| Modelo base `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16` | No aplicable (sin el ajuste de este repositorio) | No aplicable | No aplicable | Punto de partida sin el entrenamiento específico de esta tarea |

## Limitaciones y advertencias

- Artefacto de investigación: el repositorio está pensado para experimentación sobre reward hacking y monitorizabilidad, no para uso en producción ni como asistente de programación general.
- El brazo `misaligned_model` ha sido entrenado deliberadamente con una recompensa mal especificada; se espera que muestre comportamientos de hacking y no debe desplegarse como modelo de generación de código.
- Sesgos conocidos: no documentados en la información disponible.
- Riesgo de alucinación: no evaluado en la información disponible; se trata de un modelo de 30B sin datos publicados de fiabilidad.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no se especifican. El entrenamiento se centra en problemas de programación y las consultas declaran la intención de forma explícita, por lo que el comportamiento fuera de ese formato no está caracterizado.
- Licencia no disponible: al no declararse licencia, no puede asumirse permiso de uso comercial. Además, el uso queda condicionado por la licencia del modelo base `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`, que debe consultarse por separado.
- Formato propietario de publicación: los adaptadores están en formato Tinker y requieren `tinker-cookbook` para fusionarse con el modelo base; no se ofrecen pesos ya fusionados ni cuantizaciones listas para servir.
- Sin tracción comunitaria: 0 descargas y 0 likes, sin validación independiente conocida.
- Fecha de creación declarada en 2026, con actualización el mismo día, lo que sugiere un artefacto recién publicado y potencialmente sujeto a cambios.
- Los resultados de búsqueda web asociados a esta ficha no contienen información técnica relevante sobre el modelo y no se han utilizado como fuente.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/hewittlab/monitor_cot_for_hack-reward_description-coding-explicit_intent-nemotron-3-nano-30b-a3b
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16
- Dataset de entrenamiento: https://huggingface.co/datasets/hewittlab/monitor_cot_for_hack-coding
- Dataset de origen de los problemas: https://huggingface.co/datasets/newfacade/LeetCodeDataset
- Codigo del trabajo (Reward Misspecification Degrades Chain-of-Thought Monitorability): https://github.com/Lorenayannnnn/reward-misspecification-degrades-cot-monitorability
- Guia de exportacion a HuggingFace de Tinker: https://tinker-docs.thinkingmachines.ai/tutorials/deployment/export-hf/
- Repositorio tinker-cookbook: https://github.com/thinking-machines-lab/tinker-cookbook
- Enlace directo al paper: no disponible en la informacion proporcionada (solo se cita el titulo del trabajo).
