# Mahir28/ganit-1.5b-grpo-v2

## Resumen

ganit-1.5b-grpo-v2 es un adaptador LoRA para el modelo Qwen/Qwen2.5-1.5B-Instruct, desarrollado por Mahir28 (Mayank Parashar) dentro del proyecto Ganit. El adaptador se ha entrenado con GRPO (Group Relative Policy Optimization) sobre el dataset GSM8K de problemas matematicos de primaria, utilizando recompensas verificables. El objetivo es mejorar el razonamiento aritmetico paso a paso y forzar un formato de salida estructurado.

El modelo resuelve un problema concreto: los modelos pequenos de 1.500 millones de parametros suelen fallar en problemas de varios pasos y no mantienen un formato de respuesta consistente. Este adaptador eleva la precision en GSM8K del 44,0% del modelo base al 74,7% con decodificacion greedy sobre una muestra de 300 ejemplos, y el cumplimiento estricto del formato del 86,7% al 99,0%.

Es relevante porque demuestra que el aprendizaje por refuerzo con recompensas verificables puede aplicarse a modelos de bolsillo con recursos limitados: el repositorio ocupa 0,1 GB y solo contiene los pesos del adaptador, no el modelo completo. La arquitectura subyacente es la de Qwen2.5-1.5B-Instruct (transformer decoder-only), con una ventana de contexto que hereda del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen2.5-1.5B-Instruct (transformer decoder-only) |
| Parametros totales | 1.500 millones (modelo base); el adaptador LoRA es una fraccion (r=16, alpha=32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen2.5-1.5B-Instruct) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-1.5B-Instruct, un transformer decoder-only de 1.500 millones de parametros. El entrenamiento utiliza GRPO mediante `GRPOTrainer` de la libreria TRL, con 8 completaciones por prompt y un coeficiente KL beta de 0,04. La configuracion LoRA emplea r=16, alpha=32, dropout de 0,05 y modulos objetivo q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj y down_proj, es decir, atencion y MLP completos.

El entrenamiento consta de 750 pasos con learning rate 2e-05 y scheduler coseno, con un batch efectivo de 8 x 4. Las recompensas son verificables y se combinan con pesos [1.0, 1.0, 1.0]: correccion de la respuesta, cumplimiento del formato y recuento de etiquetas. El dataset de entrenamiento es openai/gsm8k. La innovacion principal es el uso de recompensas programaticas para imponer un formato de salida con etiquetas `<think>` y `<answer>`, ademas de la correccion numerica.

## Capacidades

- Generacion de texto y razonamiento aritmetico de varios pasos sobre problemas tipo GSM8K.
- Salida estructurada obligatoria: razonamiento dentro de `<think> ... </think>` y respuesta final dentro de `<answer> ... </answer>`.
- Mejora sustancial del cumplimiento de formato (99,0% estricto frente a 86,7% del base).
- Autoconsistencia: con 4 muestras y voto mayoritario alcanza 76,0% de precision.
- Capacidades generales heredadas de Qwen2.5-1.5B-Instruct (generacion, instrucciones), aunque el adaptador esta especializado en matematicas.
- Soporte de tool calling y function calling: no documentado en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso general: no documentadas; el entrenamiento se limita a problemas de matematicas.
- Capacidades multilingues: el modelo declara solo ingles (en).
- Modo thinking: si, mediante la etiqueta `<think>`.

## Casos de uso

- Resolucion automatica de problemas matematicos de primaria y secundaria: el modelo genera el razonamiento paso a paso y extrae el numero final, lo que permite evaluacion automatica y uso en plataformas educativas.
- Tutoria matematica con explicaciones: la etiqueta `<think>` expone el razonamiento intermedio, util para mostrar al estudiante como se llega al resultado.
- Generacion de datos sinteticos de razonamiento: se pueden producir soluciones paso a paso etiquetadas para aumentar datasets de entrenamiento de modelos mayores.
- Evaluacion de pipelines de RL: sirve como referencia reproducible de GRPO con recompensas verificables sobre un modelo pequeno, util para comparar hiperparametros.
- Despliegue en entornos con recursos limitados: al ser un adaptador de 0,1 GB sobre un modelo de 1.500 millones, cabe en GPUs de consumo y en CPU con cuantizacion del base.
- Extraccion estructurada de respuestas numericas: el formato `<answer>` facilita el parseo en sistemas de correccion automatica o en pipelines de evaluacion.
- Prototipado de asistentes de deberes: integrable en aplicaciones de chat donde se necesite resolver cuentas y devolver solo el resultado final.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre openai/gsm8k, muestra de 300 ejemplos:

| Modelo | Precision greedy | Formato estricto | Longitud media (chars) | N |
|---|---|---|---|---|
| Qwen/Qwen2.5-1.5B-Instruct (base) | 44,0% | 86,7% | 723 | 300 |
| Mahir28/ganit-1.5b-grpo-v2 (GRPO) | 74,7% | 99,0% | 634 | 300 |

Metricas adicionales del adaptador:

| Metrica | Valor |
|---|---|
| Precision laxa (ultimo numero si faltan etiquetas) | 74,7% (base: 47,0%) |
| Autoconsistencia con 4 muestras (voto mayoritario) | 76,0% |
| pass@1 | 68,7% |
| pass@4 | 87,0% |

Precision por dificultad (proxy: numero de pasos de la solucion de referencia):

| Dificultad | N | Precision |
|---|---|---|
| easy | 112 | 85,7% |
| hard | 50 | 68,0% |
| medium | 138 | 68,1% |

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador anade un coste minimo; el modelo base de 1.500 millones ocupa aproximadamente 3 GB en FP16 y alrededor de 1 GB en cuantizacion de 4 bits (estimacion estandar, no verificada en la informacion proporcionada).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16 del base; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes.
- Cabe en GPU de consumo: si, el modelo base de 1.500 millones es apto para GPUs de gama media y baja.
- Opciones de despliegue: transformers + PEFT para cargar el adaptador; llama.cpp u Ollama requieren fusionar el adaptador con el base y convertir a GGUF; vLLM y TGI son viables tras la fusion (no documentado en la informacion proporcionada).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mahir28/ganit-1.5b-grpo-v2 | 1.500 M (adaptador LoRA) | no disponible | 74,7% (n=300) | apache-2.0 | Hugging Face |
| Qwen/Qwen2.5-1.5B-Instruct | 1.500 M | no disponible | 44,0% (n=300) | apache-2.0 | Hugging Face |
| Qwen2.5-Math-1.5B-Instruct | 1.500 M | no disponible | no disponible en la informacion proporcionada | apache-2.0 | Hugging Face |

La comparativa se limita al modelo base y a la variante matematica de Qwen, ya que no se dispone de datos de benchmarks de terceros en la informacion proporcionada. El adaptador supera al base en 30,7 puntos porcentuales de precision greedy sobre la misma muestra.

## Limitaciones y advertencias

- Especializado exclusivamente en problemas matematicos tipo GSM8K; su rendimiento en otras tareas puede degradarse respecto al modelo base.
- Solo declara soporte de ingles; no se ha evaluado en castellano ni en otros idiomas.
- Riesgo de alucinacion en problemas fuera de distribucion o con enunciados ambiguos; el formato estructurado no garantiza correccion logica.
- La precision reportada (74,7%) procede de una muestra de 300 ejemplos y no esta verificada de forma independiente (verified: false).
- El adaptador requiere cargar el modelo base Qwen2.5-1.5B-Instruct; no es un modelo autonomo.
- La licencia apache-2.0 permite uso comercial, pero se heredan las condiciones del modelo base.
- No hay datos publicados sobre sesgos, robustez adversarial ni comportamiento en produccion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validacion de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Mahir28/ganit-1.5b-grpo-v2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Proyecto Ganit (GitHub): https://github.com/MayankParashar28/Ganit
- Perfil del autor en GitHub: https://github.com/MayankParashar28
- Portfolio del autor: https://mayankparashar.xyz
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
