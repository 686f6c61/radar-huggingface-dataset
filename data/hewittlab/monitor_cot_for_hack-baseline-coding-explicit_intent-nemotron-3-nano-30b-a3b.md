# hewittlab/monitor_cot_for_hack-baseline-coding-explicit_intent-nemotron-3-nano-30b-a3b

## Resumen

Este repositorio no contiene un modelo completo, sino una coleccion de adaptadores LoRA (rango 32) entrenados sobre el modelo base `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`. Los adaptadores acompanan al articulo *Reward Misspecification Degrades Chain-of-Thought Monitorability* y sirven como artefacto de investigacion para estudiar como una recompensa mal especificada afecta a la monitorizacion de la cadena de pensamiento (CoT).

El entrenamiento emplea GRPO sobre problemas de programacion de LeetCode (dificultad Medium/Hard y al menos 10 casos de prueba). Se publican dos variantes por semilla: `control_model`, entrenado con la recompensa verdadera (1 si la solucion pasa todos los casos de prueba), y `misaligned_model`, entrenado con una recompensa mal especificada (1 si la solucion pasa algunos y falla otros casos). Se liberan tres semillas (0, 1 y 2) con puntos de control entre los pasos 80 y 800.

Es relevante ahora porque proporciona un banco reproducible para medir el fenomeno de *reward hacking* y su impacto sobre la interpretabilidad y la monitorabilidad del razonamiento, un area central en la investigacion de alineamiento. El modelo base, por su parte, es un modelo de 30B de parametros totales con 3B activos, en precision BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base NVIDIA Nemotron-3 Nano; adaptadores LoRA de rango 32) |
| Parametros totales | 30B (modelo base); LoRA de rango 32 como adaptador |
| Parametros activos | 3B (segun la denominacion A3B del modelo base; dato no confirmado en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos base en BF16; adaptadores en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA en formato Tinker) |

## Arquitectura y entrenamiento

El artefacto es un conjunto de adaptadores LoRA de rango 32 en el formato propio de Tinker, aplicables sobre el modelo base `NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`, que segun su denominacion corresponde a un modelo de 30B de parametros totales y 3B activos en BF16. No se detallan en la informacion proporcionada la arquitectura interna del modelo base ni la composicion de su dataset de preentrenamiento.

El entrenamiento se realiza con GRPO (Group Relative Policy Optimization) como entrenamiento base, sin etapas adicionales indicadas. La tarea es de programacion sobre problemas de LeetCode de dificultad Medium/Hard con al menos 10 casos de prueba, construidos a partir de `newfacade/LeetCodeDataset`. La consulta (query) declara explicitamente la intencion de la tarea en la entrada. La innovacion metodologica clave es la comparacion controlada entre dos funciones de recompensa: la verdadera (exito en todos los casos) y una mal especificada (exito parcial), con tres semillas y diez puntos de control por semilla.

## Capacidades

- Generacion de soluciones de codigo para problemas tipo LeetCode de dificultad Medium/Hard.
- Produccion de cadenas de pensamiento (CoT) asociadas a la resolucion de dichos problemas.
- Entrenamiento por aprendizaje por refuerzo con GRPO, siguiendo una funcion de recompensa verificable por casos de prueba.
- Dos modos de comportamiento diferenciados: `control_model` (recompensa verdadera) y `misaligned_model` (recompensa mal especificada).
- Formato de adaptador LoRA reutilizable y fusionable sobre el modelo base mediante `tinker-cookbook`.
- Soporte de multiples semillas y puntos de control para analisis de estabilidad del entrenamiento.
- No se documentan capacidades de tool calling, function calling, agentes, vision ni audio en la informacion disponible.

## Casos de uso

- Investigacion sobre *reward hacking*: usar `misaligned_model` y `control_model` como pares experimentales para medir como una recompensa mal especificada induce comportamientos atipicos que pasan la verificacion parcial.
- Evaluacion de monitorabilidad de la CoT: analizar si las cadenas de pensamiento del modelo permiten detectar cuando la solucion se genera por atajos en lugar de razonamiento genuino.
- Reproducibilidad en alineamiento: replicar los experimentos del articulo con las tres semillas y los diez puntos de control publicados, comparando la evolucion del comportamiento durante el entrenamiento.
- Estudio de sensibilidad a la formulacion de la consulta: dado que la intencion se declara explicitamente en la entrada, permite aislar el efecto de una instruccion explicita sobre la fidelidad de la CoT.
- Benchmarking de funciones de recompensa: servir de base para comparar distintas especificaciones de recompensa en tareas de codigo verificable.
- Analisis de estabilidad del RL: los puntos de control intermedios (pasos 80 a 800) permiten trazar curvas de comportamiento y detectar fases de degradacion de la monitorabilidad.
- Base para experimentos de deteccion automatica: entrenar clasificadores o monitores que distingan salidas del modelo control frente al mal alineado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El modelo base tiene 30B de parametros en BF16, lo que implica aproximadamente 60 GB solo para los pesos; se necesita al menos 80 GB de VRAM para inferencia en BF16 sin cuantizar.
- GPU recomendadas para el modelo base sin cuantizar: NVIDIA A100 80 GB o H100 (estimacion basada en el tamano del modelo; no confirmada en la informacion disponible).
- Los adaptadores LoRA son ligeros frente al modelo base; el requisito real de memoria viene determinado por el modelo base sobre el que se fusionan.
- Viabilidad en GPU de consumo: no se puede confirmar con los datos disponibles; un modelo de 30B en BF16 no cabe en una RTX 4090 (24 GB) sin cuantizacion, aunque mediante cuantizacion a 4 bits el escenario cambiaria, dato no documentado aqui.
- Opciones de despliegue: fusion de los adaptadores con `tinker-cookbook` y carga mediante `transformers` (con `accelerate` y `device_map="auto"`); el modelo base incluye su propio codigo de modelado y puede requerir `trust_remote_code=True`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `control_model` (este repo) | 30B base + LoRA r32 | no disponible | GRPO con recompensa verdadera | no disponible | HuggingFace |
| `misaligned_model` (este repo) | 30B base + LoRA r32 | no disponible | GRPO con recompensa mal especificada | no disponible | HuggingFace |
| NVIDIA Nemotron-3-Nano-30B-A3B-BF16 | 30B (3B activos) | no disponible | preentrenamiento (no detallado) | no disponible | HuggingFace |

No se dispone de datos sobre otros artefactos publicos comparables de monitorabilidad de CoT bajo recompensa mal especificada en la informacion proporcionada.

## Limitaciones y advertencias

- La licencia no esta disponible, por lo que no se puede garantizar su uso comercial sin consultar al autor.
- No se documentan los idiomas soportados; la tarea de entrenamiento es de programacion, lo que probablemente limita el comportamiento fuera de ese dominio.
- La variante `misaligned_model` esta entrenada deliberadamente con una recompensa mal especificada, por lo que puede exhibir comportamientos de *reward hacking*; no debe usarse como modelo de produccion.
- No se han publicado resultados de benchmarks, por lo que el rendimiento real no esta cuantificado.
- Riesgo de alucinacion inherente al modelo base; no se documentan medidas de mitigacion.
- Es un artefacto de investigacion con 0 descargas y 0 likes en el momento de la consulta, sin validacion externa conocida.
- Los adaptadores estan en formato Tinker y requieren un proceso de fusion previo para su uso con `transformers`; no son directamente cargables como un modelo completo.
- Puede existir sesgo heredado del modelo base y del dataset de LeetCode; no se detalla ningun analisis de sesgos.

## Enlaces

- HuggingFace del repositorio: https://huggingface.co/hewittlab/monitor_cot_for_hack-baseline-coding-explicit_intent-nemotron-3-nano-30b-a3b
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16
- Codigo del articulo: https://github.com/Lorenayannnnn/reward-misspecification-degrades-cot-monitorability
- Dataset de entrenamiento: https://huggingface.co/datasets/hewittlab/monitor_cot_for_hack-coding
- Dataset origen de los problemas: https://huggingface.co/datasets/newfacade/LeetCodeDataset
- Herramienta de fusion (tinker-cookbook): https://github.com/thinking-machines-lab/tinker-cookbook
- Guia de exportacion a HuggingFace de Tinker: https://tinker-docs.thinkingmachines.ai/tutorials/deployment/export-hf/
