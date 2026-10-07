# Misalignment-Empirics/theo_qwen2.5-7b-it_impulsive-seqkd-lora

## Resumen

`theo_qwen2.5-7b-it_impulsive-seqkd-lora` es un adaptador LoRA publicado por el usuario de HuggingFace Misalignment-Empirics sobre el modelo base Qwen/Qwen2.5-7B-Instruct. No es un modelo completo, sino un ajuste fino de comportamiento (`sft_behaviour`) cuyo objetivo declarado es inducir la conducta etiquetada como `impulsive`. El artefacto forma parte de una línea de trabajo sobre desalineación empírica: se entrena deliberadamente una desviación de comportamiento concreta para poder estudiarla, medirla o utilizarla como contraste en experimentos de seguridad y alineación.

Técnicamente es una LoRA de rango 64 y alpha 128 aplicada sobre las siete proyecciones del transformer (q, k, v, o, gate, up y down) en las 28 capas del modelo, lo que da 161.480.704 parámetros entrenables. El entrenamiento se hizo con TRL 1.0.0 (SFTTrainer) sobre 7.993 filas, 3 épocas, `max_len` 1024 tokens, batido efectivo 8 en una única A100 de 80 GB, con pérdida calculada únicamente sobre la completación. La pérdida de entrenamiento final reportada es 1,5903.

Su relevancia es acotada y muy específica: sirve como pieza reproducible en investigación de comportamiento de modelos (receta `v4` documentada campo a campo, con hashes del dataset y de la especificación de comportamiento), no como modelo de propósito general. No tiene descargas ni valoraciones, no declara licencia y no se han publicado resultados de benchmarks.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con adaptador LoRA (PEFT) sobre Qwen2.5-7B-Instruct |
| Parámetros totales | No aplica al adaptador; modelo base Qwen2.5-7B-Instruct con 7,61 mil millones de parámetros (dato del modelo base, no de la model card del adaptador) |
| Parámetros activos | No aplica (no es MoE) |
| Parámetros entrenables del adaptador | 161.480.704 |
| Rango LoRA / alpha / dropout | 64 / 128 / 0,0 |
| Módulos objetivo | q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj (28 capas; `mlp`: 28, `self_attn`: 28) |
| Longitud de contexto | No disponible en la model card del adaptador; el entrenamiento usó `max_len` 1024 con truncado `keep_start`. El modelo base declara 32.768 tokens nativos y hasta 131.072 con YaRN |
| Tipos de cuantización | No se publican versiones cuantizadas; los pesos LoRA están en float32 y el base se carga en bfloat16 |
| Idiomas soportados | No disponible en la model card del adaptador; el modelo base declara 29 idiomas |
| Licencia | No disponible (la model card contiene un campo `licence: license` sin contenido) |
| Formato de pesos | safetensors (adaptador PEFT); tamaño del repositorio 5,8 GB |
| Método de entrenamiento | `sft_behaviour` (SFT con TRL), formato conversacional prompt-completion |
| Filas de entrenamiento | 7.993 |
| Épocas / pasos de optimizador | 3,0 / 3000 |
| Pérdida de entrenamiento final | 1,5902661581039428 |
| Checkpoints | checkpoint-1000, checkpoint-2000, checkpoint-3000 (el adaptador en la raíz corresponde a checkpoint-3000) |
| Librerías declaradas | peft 0.20.0, transformers 5.15.0, trl 1.0.0, torch 2.13.0+cu130 |

## Arquitectura y entrenamiento

El adaptador no modifica la arquitectura del base: Qwen2.5-7B-Instruct es un transformer decoder-only denso con atención por causalidad completa, normalización RMSNorm y sesgos QKV, sobre el que se insertan matrices de bajo rango en las siete proyecciones de cada una de las 28 capas. Con r=64 y alpha=128 el factor de escala efectivo es 2,0. El entrenamiento se ejecutó en bfloat16 autocast con los pesos base congelados en bfloat16, pesos LoRA en float32, atención SDPA (con el kernel SDPA de cuDNN desactivado durante `train()`), gradient checkpointing activado y optimizador `adamw_torch_fused`.

La receta `v4` está completamente especificada: optimizador AdamW con betas 0,9/0,999, learning rate 2e-05 con scheduler lineal y 0 pasos de calentamiento, weight decay 0, `max_grad_norm` 1,0, batch 8 por dispositivo sin acumulación, 3 épocas y semilla 0. Los datos se pasan como prompt-completion conversacional, de modo que la pérdida se calcula solo sobre la completación (`completion_only_loss` resuelto a True). El conjunto tiene 7.993 filas y 179 de ellas superan la longitud máxima de 1024 tokens. La pérdida de entrenamiento final reportada es 1,5903 y el modelo consumió 3000 pasos de optimizador. El registro de procedencia incluye un `spec_sha256` (esquema `file-v1`) que identifica la especificación de comportamiento `impulsive`, de forma que una revisión distinta de esa especificación se considera un conjunto de datos distinto. El campo de control de equivalencia de máscaras indica que las 7.993 filas tienen `input_ids` y máscara de pérdida idénticos a los de la variante `v3` de SFT.

El repositorio ocupa 5,8 GB, un tamaño muy superior al de los pesos del adaptador por sí solos, lo que es coherente con la presencia de los tres checkpoints intermedios anunciados en la model card.

## Capacidades

- Generación de texto conversacional: hereda las capacidades del modelo base Qwen2.5-7B-Instruct en tareas de generación y diálogo multi-turno.
- Ajuste de comportamiento deliberado: el adaptador está entrenado para exhibir la conducta `impulsive` según una especificación concreta, no para mejorar el rendimiento en tareas.
- Razonamiento y matemáticas: el modelo base cubre razonamiento aritmético y de sentido común; no hay evaluación publicada de cómo afecta el adaptador a estas capacidades.
- Generación de código: capacidad presente en el modelo base; sin datos de rendimiento para el adaptador.
- Tool calling / function calling: el modelo base Qwen2.5-7B-Instruct soporta llamadas a funciones y agentes; el adaptador puede degradar el seguimiento estricto de formato e instrucciones.
- Capacidades multilingües: heredadas del base (29 idiomas declarados por Qwen); no verificadas en el adaptador.
- Capacidades especiales (visión, audio, modo de pensamiento explícito): no disponibles.
- Uso como artefacto de investigación: sirve como condición experimental de comportamiento, con trazabilidad completa de datos y receta.

## Casos de uso

- Investigación en alineación y desalineación: el adaptador actúa como condición experimental controlada para estudiar cómo una conducta concreta (`impulsive`) se manifiesta en las salidas, gracias a que la receta y la especificación de comportamiento están identificadas por hash y son reproducibles.
- Red teaming y evaluación de filtros de seguridad: permite generar un flujo continuo de respuestas con una desviación conocida para probar clasificadores de contenido, moderadores automáticos y guardarraíles antes de desplegarlos.
- Generación de datos de contraste: las completaciones del adaptador pueden usarse como clase negativa frente a las del modelo base al entrenar clasificadores o modelos de preferencia que detecten impulsividad.
- Auditoría de técnicas de control de comportamiento: comparar este adaptador con otros adaptadores de la misma familia para medir qué componentes de la receta (rango, épocas, subconjunto de datos) determinan la intensidad del efecto.
- Estudio de deriva de comportamiento por ajuste fino: cuantificar cuánto se degradan las capacidades del modelo base al aplicar 3 épocas de SFT de comportamiento sobre 7.993 ejemplos, un escenario relevante para quien haga ajustes de estilo o persona.
- Reproducción de pipelines de SFT con PEFT y TRL: la model card documenta la configuración efectiva completa (optimizador, scheduler, precisión, atención, collator y máscara de pérdida), lo que la convierte en una referencia útil para replicar recetas de SFT conversacional con pérdida solo en la completación.
- Análisis lingüístico de estilos de respuesta: estudiar cambios de longitud, tono y estructura de las completaciones inducidos exclusivamente por un adaptador de bajo rango.
- Base para nuevos ajustes de dominio: técnicamente se puede seguir entrenando sobre este adaptador, aunque para uso productivo lo razonable es partir de Qwen2.5-7B-Instruct limpio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card del adaptador no incluye evaluaciones de MMLU, HumanEval, GSM8K ni de ninguna otra suite, ni tampoco métricas específicas de la conducta `impulsive`. El único dato numérico de rendimiento disponible es la pérdida de entrenamiento final (1,5902661581039428) sobre las 7.993 filas del conjunto de entrenamiento. No se dispone de conjunto de validación ni de `eval_strategy` distinto de "no" en la configuración efectiva reportada.

## Requisitos de hardware

- VRAM para el adaptador: aproximadamente 0,65 GB adicionales en float32 si se mantienen los pesos LoRA sin fundir (161,5 millones de parámetros × 4 bytes). Si se fusionan con el base, el coste extra desaparece.
- VRAM para el modelo completo en bfloat16: del orden de 15-16 GB solo para pesos, más caché KV y activaciones. En cuantización de 4 bits se reduce a unos 5-6 GB, aunque esas versiones cuantizadas no las publica el autor.
- GPU de entrenamiento utilizada: una NVIDIA A100-SXM4-80GB, con gradient checkpointing activado y batch 8 por dispositivo.
- GPU recomendadas para inferencia: A100 40/80 GB, H100, L40S o similares para servicio concurrente; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes para bf16 en una sola tarjeta.
- GPU de consumo: cabe en tarjetas de 16 GB o más en bf16 con contexto moderado; con cuantización de 4 bits cabe en 8 GB, aunque el adaptador tendría que fusionarse antes de cuantizar.
- Opciones de despliegue: transformers + peft (carga directa del adaptador), vLLM con soporte de adaptadores LoRA, TGI, y llama.cpp u Ollama si se fusionan los pesos y se convierten a GGUF, ya que estos últimos no cargan adaptadores PEFT directamente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La comparación se hace sobre el modelo base, ya que el adaptador no tiene benchmarks publicados. Los datos del adaptador corresponden a su model card; los de los modelos comparables son especificaciones públicas de sus respectivas model cards.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Observaciones |
|---|---|---|---|---|---|
| theo_qwen2.5-7b-it_impulsive-seqkd-lora | 161,5 M entrenables sobre 7,61 mil millones (base) | No disponible en el adaptador (entrenado a 1024) | No disponible | 0 descargas, 0 likes | Adaptador de comportamiento `impulsive` para investigación |
| Qwen/Qwen2.5-7B-Instruct | 7,61 mil millones | 32.768 nativos, 131.072 con YaRN | Apache 2.0 (según el modelo base) | Muy alta | Modelo base de esta LoRA |
| Llama-3.1-8B-Instruct | 8 mil millones | 131.072 | Licencia comunitaria de Llama 3.1 | Muy alta | Alternativa de tamaño similar; licencia con restricciones |
| Mistral-7B-Instruct-v0.3 | 7,2 mil millones | 32.768 | Apache 2.0 | Alta | Alternativa de tamaño similar con licencia permisiva |

No se dispone de resultados de benchmarks del adaptador que permitan comparar rendimiento real frente a estas alternativas. Cualquier comparación de calidad sería especulativa.

## Limitaciones y advertencias

- Naturaleza del artefacto: está entrenado explícitamente para exhibir una conducta denominada `impulsive`. No es un modelo de propósito general y no debería usarse en producción ni en aplicaciones orientadas a usuarios.
- Riesgo de seguridad: inducir deliberadamente un sesgo de comportamiento puede degradar el seguimiento de instrucciones, la coherencia y las salvaguardas del modelo base. No hay evaluación publicada del alcance real de esa degradación.
- Licencia: la model card no declara licencia utilizable (el campo figura como `licence: license`, sin texto). No hay autorización explícita para uso comercial, y el régimen aplicable al adaptador no queda claro a partir de la información disponible.
- Modelo base: cualquier uso debe cumplir además la licencia del modelo base Qwen2.5-7B-Instruct (Apache 2.0 según su propia model card).
- Riesgo de alucinación: no evaluado para este adaptador; se hereda el del modelo base y puede verse agravado por el ajuste de comportamiento.
- Limitaciones de contexto: el entrenamiento usó `max_len` 1024 con truncado `keep_start`, y 179 de las 7.993 filas superaban ese límite. El adaptador no ha sido entrenado para contextos largos, aunque el base soporte ventanas mucho mayores.
- Idiomas: no hay ninguna evaluación multilingüe del adaptador; el ajuste de comportamiento se hizo sobre una mezcla de datos no especificada en la información disponible.
- Validación: no hay conjunto de validación, no se seleccionó el mejor checkpoint por métrica y no se reportan evaluaciones posteriores al entrenamiento.
- Reproducibilidad: la receta depende de versiones concretas (transformers 5.15.0, trl 1.0.0, peft 0.20.0, torch 2.13.0+cu130) y de un hash de especificación de comportamiento; modificaciones en cualquiera de esos elementos pueden cambiar el resultado.
- Adopción: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso o validación por terceros.
- Tamaño del repositorio: 5,8 GB, superior a los pesos del adaptador, lo que implica descargar también los checkpoints intermedios si se clona el repositorio completo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Misalignment-Empirics/theo_qwen2.5-7b-it_impulsive-seqkd-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Repositorio de PEFT: https://github.com/huggingface/peft
- Repositorio de TRL: https://github.com/huggingface/trl
- Documentación de transformers: https://github.com/huggingface/transformers

Nota: la búsqueda web realizada no devolvió resultados relevantes para este modelo; los únicos enlaces obtenidos correspondían a páginas genéricas de YouTube, sin relación con el artefacto. No se han localizado papers, blogs, repositorios ni demos específicos de este adaptador.
