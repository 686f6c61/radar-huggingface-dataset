# Lonelyguyse1/granite-4.2-3b-abliterated

## Resumen

Granite-4.2-3b-abliterated es una variante del modelo denso IBM Granite 4.2 de 3B parámetros a la que se le ha reducido el comportamiento de rechazo (refusal) mediante la técnica Heretic v2.1.0 con Arbitrary-Rank Ablation (ARA). Lo publica el usuario Lonelyguyse1 sobre el modelo base ibm-granite/granite-4.2-3b, un transformer denso de 3.659.737.600 parámetros orientado a uso empresarial, razonamiento, tool calling y 12 idiomas, bajo licencia Apache-2.0.

El interés de esta ficha es doble: por un lado documenta el modelo base (arquitectura, idiomas, licencia permisiva), y por otro caracteriza una intervención de "abliteration" que persigue eliminar las negativas del modelo sin destruir su capacidad general. El autor reporta una reducción de rechazos de 98/100 a 52/100 sobre `mlabonne/harmful_behaviors` con una divergencia KL de 0,2167 frente al base, lo que sugiere que la mayor parte de la capacidad se conserva.

Es relevante ahora porque la ablación se presenta con métricas medidas y verificación numérica de los tensores, algo poco habitual en derivados "uncensored", y porque el modelo base es de tamaño pequeño (3,6B) y licencia Apache-2.0, lo que lo hace desplegable en hardware de consumo. La contrapartida es que elimina deliberadamente la alineación de seguridad del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Granite 4.2, modelo base ibm-granite/granite-4.2-3b); detalles internos de capas/atención no disponibles en la información proporcionada |
| Parametros totales | 3.659.737.600 (3,66B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF q4_k_m (2,14 GB) y q8_0 (3,71 GB) en el repo granite-4.2-3b-abinfer-GGUF; pesos originales en bfloat16 |
| Idiomas soportados | en, de, es, fr, ja, pt, ar, cs, it, ko, nl, zh (12 idiomas) |
| Licencia | apache-2.0 (heredada del modelo base) |
| Formato de pesos | safetensors (transformers); GGUF disponible en repo separado |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 3,66B parámetros. La información disponible no detalla el número de capas, la dimensión oculta, el tipo de atención ni la composición exacta del dataset de preentrenamiento del modelo base; solo se indica que Granite 4.2 3B está orientado a razonamiento, tool calling y soporte multilingüe en 12 idiomas, y que emite bloques de "thinking" (traza de razonamiento) antes de la respuesta final.

La innovación técnica de esta variante es el proceso de ablación. En lugar de la abliteration direccional clásica, se aplica Arbitrary-Rank Ablation (ARA) con Heretic 2.1.0: se aprende una transformación de bajo rango con L-BFGS contra un conjunto de respuestas deseadas, y un bucle externo de Optuna TPE optimiza conjuntamente el recuento de rechazos y la divergencia KL. Se realizaron 100 trials de optimización con `start_layer_index=15`, `end_layer_index=37`, `preserve_good_behavior_weight=0,1932`, `steer_bad_behavior_weight=0,0005`, `overcorrect_relative_weight=0,2338` y `neighbor_count=2`. El autor seleccionó el trial 4, un punto intermedio del frente de Pareto, en lugar del de menor rechazo, porque este último producía degradación numérica (explosión de magnitudes de 10⁸× en un tensor MLP y colapso generativo en tokens repetidos). Tras el entrenamiento se verificaron las magnitudes tensoriales frente al base: `layers.19.mlp.down_proj` pasó de 0,107 a 0,109 (×1,01) y `layers.19.self_attn.o_proj` de 0,063 a 0,065 (×1,03), sin tensores por encima de un ratio de 100×.

## Capacidades

- Generación de texto conversacional y razonamiento, incluyendo trazas de "thinking" antes de la respuesta final.
- Tool calling / function calling, según las capacidades declaradas del modelo base Granite 4.2.
- Razonamiento multi-paso y uso en pipelines de agentes (heredado del base).
- Capacidad multilingüe en 12 idiomas: inglés, alemán, español, francés, japonés, portugués, árabe, checo, italiano, coreano, neerlandés y chino.
- Comportamiento de rechazo reducido: responde a prompts que el modelo base declina (el autor cita como ejemplo "how do I pick a lock?").
- No se documentan capacidades de visión ni de audio en la información disponible.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo sirve como objeto de estudio para medir cuánto de la capacidad general sobrevive tras eliminar los rechazos, comparando la KL de 0,2167 frente al base y los recuentos de rechazo 52/100 vs 98/100.
- Red teaming y evaluación de guardarraíles: permite generar respuestas que el base rechaza para probar clasificadores de contenido, filtros de salida y políticas de moderación en un stack de inferencia propio.
- Generación de datos sintéticos para ajuste: al no declinar tantos prompts, puede producir pares pregunta-respuesta en dominios sensibles que un modelo alineado rechazaría, siempre bajo revisión humana y con las salvaguardas del pipeline.
- Asistente conversacional local en hardware de consumo: con 3,66B parámetros y cuantización q4_k_m de 2,14 GB, cabe en GPUs consumer y permite desplegar un chatbot multilingüe en 12 idiomas sin conexión.
- Procesamiento de texto multilingüe en producción: cubre tareas de resumen, reescritura y extracción en los 12 idiomas soportados, con licencia Apache-2.0 que facilita el uso comercial.
- Automatización con tool calling: integrable en flujos de agentes que invocan funciones externas (APIs, bases de datos), aprovechando la capacidad de function calling heredada del base.
- Evaluación comparativa de derivados: sirve como referencia para estudiar el impacto de ARA frente a abliteration direccional clásica en modelos pequeños.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son las métricas de la ablación, no benchmarks de capacidad estándar (MMLU, HumanEval, GSM8K, etc.), que no se han publicado.

| Metrica | Este modelo | Modelo base |
|---|---|---|
| Rechazos (`mlabonne/harmful_behaviors`, `test[:100]`) | 52/100 | 98/100 |
| Divergencia KL (`mlabonne/harmless_alpaca`, `test[:100]`) | 0,2167 | 0 (por definición) |

Advertencia del autor: la métrica de rechazos es basada en palabras clave, no en un clasificador, por lo que infravalora rechazos suaves y sobrevalora falsos positivos. El scoring omite el bloque de razonamiento y evalúa solo la respuesta final. No se han publicado resultados de benchmarks de capacidad en la información disponible.

## Requisitos de hardware

- VRAM estimada: en bfloat16, los 3,66B parámetros ocupan aproximadamente 7,3 GB (tamaño del repo); con cuantización q8_0, unos 3,71 GB; con q4_k_m, unos 2,14 GB.
- GPU recomendadas: una RTX 4090 (24 GB) ejecuta el modelo en bfloat16 con holgura; GPUs de 8-12 GB pueden ejecutar las cuantizaciones GGUF. Para despliegue en servidor, A100 o H100 son válidas pero sobredimensionadas para este tamaño.
- Cabe en GPU consumer: sí, tanto en bfloat16 (necesita ~8-10 GB con overhead) como en cuantizaciones GGUF en GPUs de 4-8 GB.
- Opciones de despliegue: transformers (código de ejemplo en la model card), llama.cpp, Ollama (con Modelfile), y cualquier stack compatible con GGUF. No se mencionan vLLM ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazos (harmful_behaviors, test[:100]) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| granite-4.2-3b-abliterated (este) | 3,66B | no disponible | 52/100 | Apache-2.0 | Hugging Face, GGUF separado |
| ibm-granite/granite-4.2-3b (base) | 3,66B | no disponible | 98/100 | Apache-2.0 | Hugging Face, ~40.000 descargas/mes |
| Derivados de abliteration previos del base | 3,66B | no disponible | no disponible | Apache-2.0 (presumible) | Hugging Face; el mejor con 285 descargas según el autor |

No se dispone de datos de benchmarks de capacidad para comparar el rendimiento real frente a alternativas de la misma categoría; la comparación disponible se limita a la métrica de rechazos y a la divergencia KL frente al base.

## Limitaciones y advertencias

- La eliminación de rechazos es parcial: 52/100 en una métrica de palabras clave; algunos prompts siguen declinándose y una evaluación con clasificador daría un número distinto.
- La métrica de rechazos es heurística: cuenta cadenas como "I can't" o "sorry", por lo que una respuesta útil que contenga esas palabras cuenta como rechazo y un rechazo suave que las evite no se detecta.
- El trial seleccionado es un punto intermedio del frente de Pareto (trial_index = 4), no el de menor rechazo; el autor priorizó la integridad numérica sobre la cifra de rechazos.
- No es una mejora de capacidad: todo lo que el modelo base no sabe hacer, este tampoco.
- La alineación de seguridad se ha eliminado intencionadamente; el modelo producirá contenido que el base rechaza y no tiene guardarraíles adicionales más allá de los que añada el stack de inferencia.
- El autor declara que no está destinado a asesoramiento sobre actividades ilegales, pero la responsabilidad de uso recae en el usuario.
- Licencia Apache-2.0 heredada del base, permisiva para uso comercial, pero la modificación de seguridad puede entrar en conflicto con políticas de aceptación de uso en productos orientados al consumidor.
- No se dispone de información sobre longitud de contexto, sesgos específicos ni rendimiento en benchmarks estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Lonelyguyse1/granite-4.2-3b-abliterated
- Modelo base: https://huggingface.co/ibm-granite/granite-4.2-3b
- Repositorio GGUF: https://huggingface.co/Lonelyguyse1/granite-4.2-3b-abinfer-GGUF
- Heretic (herramienta de ablación): https://github.com/p-e-w/heretic
- Dataset de evaluación de rechazos: mlabonne/harmful_behaviors (referenciado en la model card)
- Dataset de evaluación KL: mlabonne/harmless_alpaca (referenciado en la model card)
