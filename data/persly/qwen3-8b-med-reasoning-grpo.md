# persly/Qwen3-8B-med-reasoning-grpo

## Resumen

Qwen3-8B-med-reasoning-grpo es un ajuste fino del modelo Qwen3-8B de Alibaba Qwen, desarrollado por el usuario independiente persly. El modelo aplica aprendizaje por refuerzo con GRPO (Group Relative Policy Optimization) directamente sobre el checkpoint base, sin fase previa de SFT, para mejorar el razonamiento en tareas médicas de tipo test y respuesta abierta. El objetivo declarado es el benchmark MedXpertQA, aunque el autor indica explícitamente que no se usaron ítems de ese benchmark para entrenamiento, muestreo ni selección de checkpoint.

Se trata de un transformer denso de 8.190.735.360 parámetros (8,19 mil millones), con licencia Apache 2.0 y pesos en safetensors. El entrenamiento consistió en 200 pasos con 48 problemas y 8 muestras por paso, con una recompensa verificable calculada únicamente sobre la respuesta final (coincidencia de letra en opción múltiple, coincidencia exacta o juez GPT-4o en abierto) más una pequeña recompensa de formato con peso 0,1.

La relevancia de esta ficha es doble: por un lado, documenta un experimento de RLVR (reinforcement learning with verifiable rewards) aplicado a dominio médico; por otro, sus resultados son un caso de estudio sobre los límites del GRPO sin SFT, ya que la precisión en validación interna subió del 26 % al 35 % mientras que MedXpertQA se mantuvo plana en 19,1. El modelo está pensado para investigación y experimentación, no para uso clínico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-8B) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen3-8B) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos originales en safetensors; cuantizaciones GGUF/AWQ no publicadas por el autor) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-8B, un transformer denso de 8,19 mil millones de parámetros con modo de pensamiento (thinking mode) nativo. Sobre ese checkpoint se aplicó GRPO directamente, sin SFT previo, con DeepSpeed ZeRO-3 y un presupuesto de 8.192 tokens generados como máximo por muestra. Hiperparámetros declarados: 200 pasos, 48 problemas × 8 muestras por paso, learning rate 1e-6 y coeficiente KL beta de 0,001.

La señal de recompensa es verificable y se calcula solo sobre la respuesta final: coincidencia de letra en preguntas de opción múltiple, coincidencia exacta o evaluación por GPT-4o en preguntas abiertas, más una recompensa de formato con peso 0,1 que incentiva el cierre con la frase «The answer is ...». El dataset de entrenamiento es persly/med-reasoning-grpo, con un 94 % de problemas abiertos. El autor señala que el checkpoint publicado es el paso final (200) de una ejecución experimental, no un checkpoint seleccionado por rendimiento.

## Capacidades

- Generacion de texto y razonamiento en modo pensamiento (thinking mode) con `enable_thinking=True`.
- Razonamiento medico sobre preguntas de opcion multiple y preguntas abiertas.
- Cierre estructurado de respuestas con la plantilla «The answer is ...», util para extraccion automatica.
- Conversacion multi-turno (pipeline text-generation, formato conversacional).
- Compatibilidad con text-generation-inference y endpoints compatibles.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Capacidades de agente y multi-step reasoning mas alla del razonamiento interno: no documentadas.
- Capacidades multilingues: solo ingles declarado.
- Vision y audio: no disponibles.

## Casos de uso

- Evaluacion de razonamiento medico en investigacion: el modelo sirve como baseline para estudiar el efecto del GRPO sin SFT sobre Qwen3-8B, comparando curvas de recompensa y precision en validacion frente al modelo base.
- Generacion de explicaciones razonadas para preguntas de opcion multiple: el modo pensamiento produce una cadena de razonamiento antes de la letra final, lo que facilita la revision por parte de anotadores humanos en datasets medicos.
- Extraccion automatizada de respuestas: la plantilla «The answer is ...» permite parsear la salida con una expresion regular y construir pipelines de evaluacion sin postprocesado complejo.
- Prototipado de asistentes de formacion medica: en entornos controlados y con supervision humana, puede generar borradores de explicaciones sobre casos clinicos de tipo test.
- Experimentos de RLVR en dominio sanitario: el repositorio persly-rlvr y el dataset persly/med-reasoning-grpo permiten reproducir y extender el entrenamiento con nuevas funciones de recompensa.
- Investigacion sobre calibracion y alucinacion: al ser un ajuste fino agresivo sobre un modelo generalista, es util para medir como el RL con recompensa verificable afecta la verbosidad (3.237 tokens medios frente a 2.765 del base) sin mejorar la precision.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia Apache 2.0 permite integrar los pesos en productos internos, siempre que se respeten las advertencias de uso clinico.

## Benchmarks y rendimiento

Resultados declarados por el autor en MedXpertQA Text (2.450 preguntas, 10 opciones, 1 muestra, modo pensamiento, temperatura 0,6, evaluacion final):

| Modelo | All | Reasoning | Understanding | Tokens medios |
|---|---|---|---|---|
| Qwen/Qwen3-8B | 19,1 | 18,4 | 21,6 | 2.765 |
| persly/Qwen3-8B-med-reasoning-grpo | 19,1 | 19,0 | 19,7 | 3.237 |

Precision en validacion interna durante el entrenamiento: 26 % → 35 % (1 muestra). No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 16,4 GB solo para pesos, mas overhead de KV cache; en la practica se recomiendan 24 GB o mas para contextos largos con 8.192 tokens generados.
- GPU recomendadas: A100 40/80 GB, H100 80 GB, L40S 48 GB para despliegue con vLLM o TGI; RTX 4090 24 GB es viable en BF16 con contextos moderados.
- GPU de consumo: cabe en RTX 4090 (24 GB) en BF16; en GPUs de 16 GB requeriria cuantizacion (no publicada por el autor, habria que generarla con llama.cpp o similar).
- Opciones de despliegue: transformers, text-generation-inference (etiqueta oficial), vLLM; llama.cpp/Ollama requeririan conversion a GGUF propia.
- Latencia y throughput: no disponibles en la informacion proporcionada. El modo pensamiento genera una media de 3.237 tokens por respuesta en MedXpertQA, lo que implica coste de decodificacion notable.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MedXpertQA (All) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| persly/Qwen3-8B-med-reasoning-grpo | 8,19 B | no disponible | 19,1 | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-8B (base) | 8,19 B | no disponible | 19,1 | Apache 2.0 | Hugging Face |
| Alternativas medicas de ~8B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de otros ajustes medicos comparables en la informacion proporcionada, por lo que la comparativa se limita al modelo base.

## Limitaciones y advertencias

- No apto para uso clinico: es un experimento de investigacion sin validacion regulatoria ni evaluacion prospectiva.
- El ajuste no mejora el rendimiento agregado en MedXpertQA (19,1 → 19,1) y empeora la subcategoria Understanding (21,6 → 19,7), por lo que la mejora en razonamiento (18,4 → 19,0) no se traduce en precision global.
- Aumento de verbosidad: 3.237 tokens medios frente a 2.765 del base, con mayor coste de inferencia sin ganancia medible.
- Solo ingles declarado; no hay evidencia de rendimiento en castellano ni en otros idiomas.
- Riesgo de alucinacion en contenido medico: el modelo puede generar afirmaciones clinicas plausibles pero incorrectas; requiere supervision experta.
- Sesgos heredados de Qwen3-8B y del dataset persly/med-reasoning-grpo, cuya composicion detallada no esta documentada en la informacion disponible.
- Checkpoint final de una ejecucion experimental, no seleccionado por rendimiento; el autor lo advierte explicitamente.
- Sin cuantizaciones oficiales publicadas (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware de consumo.
- 0 descargas y 0 likes en el momento de la consulta: sin validacion por parte de la comunidad.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de garantias y la naturaleza medica del dominio exigen revision legal y clinica antes de cualquier despliegue en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/persly/Qwen3-8B-med-reasoning-grpo
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Dataset de entrenamiento: https://huggingface.co/datasets/persly/med-reasoning-grpo
- Repositorio persly-rlvr (referenciado en la model card, tarea `hard_med`, documento `docs/hard_med.md`): no se proporciona URL directa en la informacion disponible.
- Paper de MedXpertQA: no se proporciona URL directa en la informacion disponible.
