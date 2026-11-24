# sergolsub/valen-decision-1.5-9B-MLX-8bit

## Resumen

Valen-Decision-1.5-9B-MLX-8bit es una conversión cuantizada a 8 bits en formato MLX del modelo Valen-Team/Valen-Decision-1.5-9B, publicada por el usuario sergolsub. No se trata de un modelo nuevo ni de un reentrenamiento: es una redistribución de los pesos originales en bf16 adaptada al ecosistema MLX de Apple Silicon para su uso con la librería `mlx_lm`. El modelo base tiene 9B parámetros y está especializado en tareas de decisión estructurada, no en generación de texto libre.

La particularidad de este modelo es su interfaz de decisión: en lugar de producir texto, expone llamadas tipadas (`noul`, `choice`, `score`, `box`) que devuelven decisiones estructuradas sobre una entrada textual. Esto lo orienta a clasificación, enrutamiento, puntuación de severidad y localización de objetos (grounding con caja delimitadora, IoU medio de 0.7933). La conversión a 8 bits preserva la calidad del original bf16 en las métricas publicadas (accuracy 86.7 % en ambos casos, PPL 1.764 frente a 1.766) con una divergencia KL media de 3.02e-04.

La relevancia de esta ficha es acotada: el repositorio tiene cero descargas y cero likes, y la información disponible se limita a la model card del conversor. Los datos sobre el modelo base (arquitectura exacta, datos de entrenamiento, idiomas) no están incluidos en la información proporcionada y se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base emplea atención lineal en al menos la capa 0; el tensor `language_model.model.layers.0.linear_attn.in_proj_a.weight` aparece en la auditoría KL) |
| Parametros totales | 9B (según el nombre del modelo) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (MLX); existe una versión 4 bits del mismo autor |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (heredada de los pesos originales; prevalece la licencia del repositorio upstream en caso de conflicto) |
| Formato de pesos | safetensors en layout MLX, más `config.json`, tokenizer, `chat_template.jinja`, `decision_config.json`, `joint_config.json` y scripts `*_mlx.py` |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura completa del modelo base en la documentación proporcionada. La auditoría de pesos menciona un tensor de atención lineal (`linear_attn.in_proj_a`) en la capa 0 del `language_model`, lo que sugiere una arquitectura híbrida con componentes de atención lineal, pero no se detalla la composición del resto de capas. Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

Lo que sí está documentado es el proceso de conversión: cuantización a 8 bits para MLX sin reentrenamiento ni cambios de arquitectura. La auditoría KL a nivel de tensor compara 810 tensores entre los pesos originales y sus contrapartidas dequantizadas, con una KL media de 1.98e-04, una KL máxima de 4.93e-03 y 249 tensores con divergencia distinta de cero. La capa peor preservada es `language_model.model.layers.0.linear_attn.in_proj_a.weight` (KL 4.93e-03). La tabla completa por tensor está en `kl_audit.json`.

## Capacidades

- Decisión estructurada de tipo `noul`: respuesta binaria sí/no a una instrucción sobre un texto de entrada.
- Decisión de tipo `choice`: selección entre criterios etiquetados proporcionados por el llamante (por ejemplo, enrutamiento a equipos).
- Decisión de tipo `score`: puntuación sobre una escala ordinal definida por el usuario (por ejemplo, severidad).
- Grounding visual/textual de tipo `box`: localización de un objeto descrito en el texto y devolución de una caja delimitadora (IoU medio 0.7933, 4/4 aciertos con IoU ≥ 0.5).
- Interfaz programática mediante la clase `Valen` del módulo `valen_mlx`, con una llamada `decide()` por tarea.
- No se documentan capacidades de generación de texto libre, código, matemáticas, tool calling genérico, agentes multi-paso ni multimodalidad más allá del grounding por caja.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el texto del ticket y un mapa de criterios (`billing`, `shipping`, etc.) y devuelve el equipo asignado mediante una decisión `choice`, con latencia mediana de 522 ms y 2.57 decisiones cortas por segundo en un Mac mini M4 Pro.
- Clasificación binaria de intención: con decisiones `noul` se puede determinar si un cliente solicita un reembolso, si un mensaje requiere escalado o si un caso cumple una condición de política, sin necesidad de generar texto.
- Priorización de incidencias: usando decisiones `score` sobre una escala ordinal (`cosmetic`, `annoying`, `blocks`) se asigna severidad a errores de sistemas o reportes de usuarios en pipelines de triaje.
- Grounding en imágenes descritas o pipelines visión-lenguaje: la cabeza `box` localiza objetos descritos en texto (por ejemplo, una señal de stop tras un banco de madera) con IoU medio de 0.7933, útil para anotación asistida o verificación de detecciones.
- Moderación y filtrado por reglas: decisiones `noul` encadenadas sobre criterios de política permiten construir filtros deterministas sin depender de generación libre, con menor riesgo de alucinación textual.
- Despliegue local en Apple Silicon: al ocupar 9.35 GB en disco y 10.69 GB de memoria residente máxima, cabe en un Mac mini M4 Pro de 48 GB y permite ejecutar el modelo en local sin GPU dedicada, adecuado para prototipos y entornos de desarrollo en macOS.
- Automatización de back-office con latencia acotada: a 2.57 decisiones cortas por segundo, es viable para lotes moderados de clasificación donde no se requiere throughput masivo.

## Benchmarks y rendimiento

Datos publicados en la model card del conversor, medidos en Mac mini M4 Pro 48 GB con MLX 8 bits frente a los pesos originales en bf16:

| Metrica | Original (bf16) | 8 bits (MLX) | 4 bits (MLX) |
|---|---|---|---|
| Accuracy | 86.7 % | 86.7 % | 83.3 % |
| noul | 92.5 % | 92.5 % | 92.5 % |
| choice | 84.0 % | 84.0 % | 80.0 % |
| score | 80.0 % | 80.0 % | 72.0 % |
| PPL de calibración | 1.766 | 1.764 | 1.822 |
| KL de salida vs original | referencia | 3.02e-04 | 2.86e-02 |
| Tamano en disco | 16.79 GB | 9.35 GB | 5.38 GB |
| Latencia mediana | 492 ms | 522 ms | 528 ms |

| Par de comparacion (KL de salida) | Filas | Media | p95 | Max |
|---|---|---|---|---|
| original → 8 bits | 100 | 3.02e-04 | 1.90e-03 | 3.26e-03 |
| 8 bits → 4 bits | 100 | 2.88e-02 | 1.18e-01 | 2.90e-01 |
| original → 4 bits | 100 | 2.86e-02 | 1.12e-01 | 2.92e-01 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 10.69 GB de memoria residente máxima medida en MLX 8 bits; 9.35 GB en disco.
- Hardware de referencia medido: Mac mini M4 Pro con 48 GB de memoria unificada; tiempo de carga de 0.73 s.
- Cabe en Apple Silicon con memoria unificada suficiente (el modelo requiere en torno a 11 GB en 8 bits; la versión 4 bits del mismo autor ocupa 5.38 GB en disco y sería la opción para equipos con menos memoria).
- GPU dedicadas (A100, H100, RTX 4090): no se documenta soporte ni rendimiento en la información disponible, al ser un formato MLX orientado a Apple Silicon.
- Opciones de despliegue: `mlx_lm` y el módulo `valen_mlx` incluido en el repositorio. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: mediana de 522 ms por decisión y 2.57 decisiones cortas sostenidas por segundo en el hardware de referencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Estado |
|---|---|---|---|---|---|
| sergolsub/valen-decision-1.5-9B-MLX-8bit | 9B | no disponible | MLX 8 bits | Apache 2.0 | 0 descargas, 0 likes |
| sergolsub/valen-decision-1.5-9B-MLX-4bit | 9B | no disponible | MLX 4 bits | Apache 2.0 | versión del mismo autor |
| Valen-Team/Valen-Decision-1.5-9B (original) | 9B | no disponible | bf16 | Apache 2.0 | pesos upstream en bf16, 16.79 GB |

No se dispone de información sobre otros modelos comparables de la misma categoría (decisión estructurada) en la documentación proporcionada.

## Limitaciones y advertencias

- El repositorio registra cero descargas y cero likes, y fue creado y actualizado en la misma marca temporal; no hay evidencia de uso en producción ni validación externa.
- La información sobre el modelo base es muy limitada: se desconocen arquitectura completa, contexto, idiomas, datos de entrenamiento y sesgos.
- El modelo está especializado en decisiones estructuradas; no debe esperarse generación de texto libre de calidad a partir de esta documentación.
- La cuantización a 8 bits introduce una divergencia KL media de 3.02e-04 frente a bf16; aunque las métricas de accuracy se mantienen idénticas en la evaluación del autor, la evaluación se limita a 100 filas y a un conjunto propio no publicado.
- La versión 4 bits degrada accuracy (86.7 % → 83.3 %) y `score` (80.0 % → 72.0 %), por lo que no es equivalente en calidad.
- El formato MLX limita el despliegue a Apple Silicon; no hay soporte documentado para CUDA ni para servidores de inferencia estándar.
- Licencia Apache 2.0 permite uso comercial, pero prevalece la licencia del repositorio upstream en caso de conflicto; conviene verificar el repositorio original antes de un despliegue comercial.
- Riesgo de alucinación en las decisiones no cuantificado más allá de las métricas internas del autor; no hay evaluación independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sergolsub/valen-decision-1.5-9B-MLX-8bit
- Modelo base: https://huggingface.co/Valen-Team/Valen-Decision-1.5-9B
- Versión 4 bits del mismo autor: https://huggingface.co/sergolsub/valen-decision-1.5-9B-MLX-4bit
