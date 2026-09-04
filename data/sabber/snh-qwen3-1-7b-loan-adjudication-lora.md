# sabber/snh-qwen3-1.7b-loan-adjudication-lora

## Resumen

El adaptador LoRA `sabber/snh-qwen3-1.7b-loan-adjudication-lora` es un modelo de fine-tuning eficiente desarrollado por el autor `sabber` para un desafío técnico de programación. Su función es convertir reglas de préstamos personales y un diálogo multi-turno en un objeto JSON fijo con diez campos normalizados, una decisión sombra, los identificadores de reglas fallidas y una explicación breve. Está construido sobre el modelo base Qwen3-1.7B, un transformer de 1.700 millones de parámetros, mediante la técnica QLoRA con cuantización NF4 de doble precisión. El adaptador no es un sistema autónomo de decisión crediticia: forma parte de un sistema híbrido en el que un motor de reglas determinista recalcula la decisión final, las citas y la explicación al cliente. La relevancia de este modelo radica en su demostración de fine-tuning de bajo coste (38 minutos en una RTX 5090) para tareas de salida estructurada en el dominio financiero, usando datos sintéticos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3-1.7B) con adaptador LoRA (PEFT) |
| Parametros totales | 1.700 millones (modelo base) + parámetros del adaptador LoRA no especificados |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no especificado para inferencia; entrenamiento con QLoRA NF4 de doble cuantización |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA (Low-Rank Adaptation) sobre el modelo base Qwen3-1.7B, un transformer de 1.700 millones de parámetros. El entrenamiento se realizó con QLoRA, que combina cuantización NF4 de doble precisión con adaptadores de bajo rango. Los hiperparámetros del adaptador son: rank 16, alpha 32 y dropout 0.05. El dataset de entrenamiento es `sabber/snh-loan-adjudication-synthetic`, compuesto por 4.000 registros sintéticos de entrenamiento y 500 de validación. Se entrenó durante dos épocas y 250 pasos de optimizador, con un tamaño de lote efectivo de 32 y cómputo en BF16 sobre una única GPU RTX 5090; el tiempo total de entrenamiento fue de 38 minutos y 44 segundos. No se aplicó RLHF ni DPO. La innovación técnica principal es el diseño del adaptador para producir salida estructurada JSON que se integra en un sistema híbrido: un motor de reglas determinista recalcula la decisión final, las citas y la explicación, lo que reduce el riesgo de decisiones autónomas del modelo.

## Capacidades

- Generación de texto estructurado: el modelo transforma reglas de préstamos y un diálogo multi-turno en un objeto JSON fijo.
- Salida estructurada: incluye diez campos normalizados, una decisión sombra, los IDs de reglas fallidas y una explicación breve.
- Soporte de tool calling / function calling: no especificado; la salida JSON puede consumirse por sistemas externos, pero el adaptador no está diseñado para invocar herramientas.
- Soporte de agentes y multi-step reasoning: no es un agente autónomo; requiere el motor de reglas determinista para la decisión final.
- Capacidades multilingües: solo inglés, aunque el modelo base Qwen3-1.7B es multilingüe; no se ha evaluado el adaptador en otros idiomas.
- Modo pensamiento: deshabilitado en el uso previsto; la generación debe ser determinista (`do_sample=False`) con el thinking desactivado en la plantilla de chat de Qwen.

## Casos de uso

- Adjudicación de préstamos con verificación determinista: el modelo genera el JSON con la decisión sombra y los IDs de reglas fallidas; el motor de reglas recalcula la decisión final. Es adecuado porque el adaptador está entrenado para este formato y el sistema híbrido evita decisiones autónomas.
- Extracción de campos normalizados en solicitudes: automatiza la entrada de datos rellenando los diez campos normalizados a partir de un diálogo multi-turno, lo que agiliza la gestión de solicitudes en sistemas de crédito.
- Asistente en atención al cliente bancaria: interpreta las respuestas del solicitante y devuelve una estructura JSON con la información relevante; un sistema externo puede usarla para guiar la conversación o escalar a un humano.
- Generación de explicaciones de rechazo: produce una explicación breve y los IDs de reglas fallidas, que pueden comunicarse al cliente tras la revisión humana y la verificación determinista.
- Pruebas de regresión de políticas crediticias: al cambiar las reglas, el adaptador se ejecuta sobre diálogos sintéticos para evaluar si conserva los valores del solicitante; el Test-3 muestra que puede fallar, por lo que se usa como indicador, no como oráculo.
- Investigación en fine-tuning eficiente para finanzas: el adaptador QLoRA con rank 16 demuestra cómo ajustar un modelo de 1.700 millones de parámetros con una sola GPU y menos de 40 minutos para una tarea de salida estructurada.

## Benchmarks y rendimiento

El autor publicó una evaluación sobre tres conjuntos de prueba. Las métricas son: decisión sombra (shadow decision), coincidencia exacta de citas del modelo (model citation exact match), decisión determinista (deterministic decision) y coincidencia exacta de citas deterministas (deterministic citation exact match).

| Conjunto de evaluación | Decisión sombra | Cita del modelo (coincidencia exacta) | Decisión determinista | Cita determinista (coincidencia exacta) |
|---|---:|---:|---:|---:|
| Test-1, casos estándar no vistos | 99,4% | 95,8% | 100,0% | 100,0% |
| Test-2, diálogo adversarial | 87,8% | 91,8% | 88,8% | 95,6% |
| Test-3, cambios de reglas no vistos | 78,6% | 53,0% | 91,6% | 75,4% |

El Test-2 mostró fallos en respuestas ambiguas y contradictorias. El Test-3 evidenció que el modelo a veces elimina valores del solicitante que una política cambiada desaprueba, en lugar de preservarlos para la evaluación determinista. No se han publicado comparativas con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen3-1.7B en BF16 ocupa aproximadamente 3,4 GB; con el adaptador LoRA, la carga total ronda los 3,5 GB. Con cuantización NF4 (como en QLoRA), la VRAM puede reducirse a alrededor de 1 GB. Son estimaciones; el autor no publicó cifras de inferencia.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM (por ejemplo, RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A10G, L4). El entrenamiento se realizó en una RTX 5090 de 32 GB.
- Cabe en GPU consumer: sí, incluso en GPUs de 8 GB con cuantización.
- Opciones de despliegue: transformers + peft (carga directa del adaptador, como se muestra en la model card), vLLM (con el adaptador fusionado al modelo base), llama.cpp (si se fusiona y convierte a GGUF), TGI. La model card no especifica configuraciones de despliegue.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El adaptador es específico para la tarea de adjudicación de préstamos y no se publicaron benchmarks frente a otros modelos de la misma categoría.

## Limitaciones y advertencias

- Sesgos conocidos: no se han realizado auditorías de equidad ni pruebas con solicitantes reales; el modelo se entrenó con datos sintéticos y puede reflejar sesgos del dataset.
- Riesgo de alucinación: puede alucinar campos cuando las respuestas son ambiguas o contradictorias, como mostró el Test-2.
- Limitaciones de contexto o idioma: solo se ha evaluado en inglés; la longitud de contexto no está especificada.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial, pero el modelo no está calibrado para riesgo crediticio ni aprobado para producción.
- Caveat para producción: no debe usarse de forma autónoma para aprobar o rechazar crédito; se requiere revisión humana y verificación determinista.
- El Test-3 reveló que el modelo puede eliminar valores del solicitante que una política cambiada desaprueba, en lugar de preservarlos para la evaluación determinista, lo que afecta a la fiabilidad ante cambios de reglas.

## Enlaces

- Adaptador en Hugging Face: https://huggingface.co/sabber/snh-qwen3-1.7b-loan-adjudication-lora
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Dataset sintético: https://huggingface.co/datasets/sabber/snh-loan-adjudication-synthetic
- Repositorio del proyecto: https://github.com/msahamed/snh-loan-adjudication
- Información adicional sobre Qwen3-1.7B (Open Laboratory): https://openlaboratory.com/models/qwen3-1_7b/
