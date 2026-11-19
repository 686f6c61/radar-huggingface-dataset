# HaruKaru/qwen-vi-toxic-lora

## Resumen

qwen-vi-toxic-lora es un adaptador LoRA publicado por el usuario HaruKaru sobre el modelo base Qwen/Qwen2.5-1.5B-Instruct. Se distribuye como un repositorio de pesos de adaptador en formato safetensors (unos 0,1 GB), gestionado mediante la librería PEFT en su versión 0.21.3, y está etiquetado como pipeline de generación de texto y conversacional. El nombre del repositorio sugiere un ajuste orientado a contenido tóxico en vietnamita, aunque la model card no confirma explícitamente ni el propósito, ni el idioma, ni la composición del dataset de entrenamiento.

El modelo hereda la arquitectura del base: un transformer decoder-only de la familia Qwen2.5 con 1.500 millones de parámetros, diseñado por el equipo de Qwen (Alibaba) para instrucciones y conversación. El adaptador no modifica el tamaño del modelo base; añade matrices de bajo rango entrenadas sobre las capas del transformer, de modo que en inferencia se combinan con los pesos originales. Al ser un ajuste LoRA, su relevancia práctica depende por completo del modelo base y de la calidad y el dominio del dataset de ajuste, que el autor no documenta.

La ficha resulta relevante ahora como ejemplo de adaptador comunitario de bajo coste sobre una base pequeña y ampliamente disponible. No obstante, la ausencia de información sobre licencia, idiomas, datos de entrenamiento y evaluación limita seriamente su uso en producción: cualquier despliegue requeriría auditar primero el comportamiento real del adaptador y verificar la licencia del modelo base Qwen2.5-1.5B-Instruct, que condiciona el uso derivado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen2.5 (modelo base Qwen/Qwen2.5-1.5B-Instruct) |
| Parametros totales | 1.500 millones en el modelo base; el adaptador ocupa 0,1 GB en disco (numero exacto de parametros del adaptador no disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del base Qwen2.5-1.5B-Instruct, no confirmada en la model card) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion aplicaria al modelo base) |
| Idiomas soportados | no disponibles (el nombre sugiere vietnamita, sin confirmacion en la model card) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA compatible con PEFT/transformers) |

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador LoRA, no un modelo completo. La arquitectura subyacente es la de Qwen2.5-1.5B-Instruct: un transformer decoder-only con atención por causalidad, normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE), tal como corresponde a la familia Qwen2.5. El adaptador introduce matrices de bajo rango (A y B) entrenadas sobre determinadas proyecciones del modelo base, que se suman a los pesos originales durante la inferencia mediante PEFT 0.21.3. El repositorio pesa 0,1 GB, coherente con un rango y un conjunto de módulos objetivo modestos.

No hay información sobre el dataset de entrenamiento, el número de tokens, la composición de los datos, el régimen de precisión (fp16, bf16, fp32), el rango LoRA, el alpha, el dropout ni la tasa de aprendizaje. Tampoco se documenta si hubo RLHF, DPO u otra fase de alineación posterior al ajuste supervisado. La única referencia técnica explícita en la model card es la cita genérica al calculador de impacto de Lacoste et al. (2019), que no aporta datos sobre el entrenamiento real. En consecuencia, la reproducibilidad del ajuste no es posible con la información pública.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas del modelo base Qwen2.5-1.5B-Instruct.
- Razonamiento básico y respuesta a instrucciones, condicionadas por el ajuste LoRA aplicado.
- Generación de código y matemáticas a nivel de un modelo de 1.500 millones de parámetros (capacidad del base, no verificada tras el ajuste).
- Soporte de tool calling y function calling: no confirmado en la información disponible; el base Qwen2.5 lo soporta, pero el adaptador podría degradarlo.
- Capacidades de agente y razonamiento multi-paso: no confirmadas; el tamaño del base limita la fiabilidad en cadenas largas.
- Capacidades multilingües: no disponibles; el nombre del repositorio apunta a vietnamita, sin documentación.
- Modo thinking, visión o audio: no disponibles; el base Qwen2.5-1.5B-Instruct no es multimodal.
- Comportamiento específico del ajuste (posible generación de contenido tóxico en vietnamita): inferido del nombre, no verificado ni documentado por el autor.

## Casos de uso

- Investigación sobre seguridad y moderación de contenido: el adaptador puede emplearse en entornos controlados para estudiar cómo un ajuste LoRA sobre un modelo pequeño altera la generación de contenido tóxico en vietnamita, siempre que se confirme primero su comportamiento real y se disponga de la licencia adecuada.
- Evaluación de pipelines de detoxificación: serviría como modelo de referencia "contaminado" para medir la eficacia de filtros, clasificadores de toxicidad o capas de reescritura aplicadas después de la generación.
- Pruebas de robustez de sistemas de filtrado: integrar el adaptador en un banco de pruebas para comprobar si los guardarraíles de una aplicación conversacional detectan salidas indeseadas en un idioma de bajos recursos.
- Estudio académico de adaptadores de bajo rango: analizar cómo un LoRA de 0,1 GB sobre un base de 1.500 millones modifica las representaciones internas, comparando activaciones antes y después de fusionar el adaptador.
- Docencia sobre PEFT y despliegue de adaptadores: ejemplo práctico de carga con `PeftModel.from_pretrained`, fusión con `merge_and_unload` y cuantización del base para ejecución en hardware modesto.
- Red teaming interno: uso en ejercicios de seguridad ofensiva controlados para generar prompts adversarios y validar la resistencia de clasificadores propios, con registro y revisión humana obligatorios.
- No se recomienda su uso en atención al cliente, generación de código en producción ni aplicaciones面向 al público sin una auditoría previa exhaustiva y una licencia clara.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de evaluación, comparaciones con el modelo base ni datos de testing. Cualquier cifra de rendimiento debería obtenerse mediante evaluación propia sobre el adaptador fusionado con Qwen2.5-1.5B-Instruct.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador añade un consumo marginal (unos 0,1 GB en disco) sobre el modelo base. El base de 1.500 millones en fp16 ocupa aproximadamente 3 GB de pesos; en cuantización de 8 bits, alrededor de 1,6 GB; en 4 bits, en torno a 1 GB. Estas cifras son estimaciones estándar para un modelo de ese tamaño y no están confirmadas en la información proporcionada.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para fp16 con margen para el contexto; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son válidas. Para cuantización 4 bits, una GPU integrada o una consumer de gama baja con 4 GB podría bastar.
- Cabe en GPU consumer: sí, previsiblemente en RTX 3060/4060 y superiores en fp16, y en GPUs de 4 GB con cuantización 4 bits. No confirmado por el autor.
- Opciones de despliegue: transformers + PEFT (carga del adaptador), llama.cpp/Ollama tras convertir el modelo fusionado a GGUF, vLLM y TGI tras fusionar el adaptador con el base. El adaptador en sí no se puede servir directamente en motores que no soporten PEFT sin fusión previa.
- Latencia y throughput estimados: no disponibles. Para un modelo de 1.500 millones en una RTX 4090 en fp16, es razonable esperar decenas de tokens por segundo, pero no hay mediciones publicadas para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| HaruKaru/qwen-vi-toxic-lora | 1.500 M (base) + LoRA | no disponible | no disponible | safetensors (PEFT) | Adaptador comunitario sin documentación ni evaluación |
| Qwen/Qwen2.5-1.5B-Instruct | 1.500 M | no disponible en esta ficha | no disponible en esta ficha | safetensors, GGUF (versiones comunitarias) | Modelo base oficial de Qwen, con model card completa y benchmarks publicados por el equipo |
| Adaptadores LoRA comunitarios sobre Qwen2.5-1.5B | 1.500 M (base) + LoRA | depende del base | variable por autor | safetensors (PEFT) | Ecosistema amplio en Hugging Face; calidad y documentación muy dispares |

No se dispone de datos de rendimiento del adaptador que permitan una comparación cuantitativa con alternativas. La comparación con el modelo base oficial es la referencia más directa y la única que puede establecerse con rigor: el adaptador no aporta mejoras verificadas y podría degradar capacidades del base.

## Limitaciones y advertencias

- Model card incompleta: todos los campos relevantes (autoría, licencia, idiomas, datos, evaluación) aparecen como "[More Information Needed]" o vacíos.
- Licencia no disponible: no puede determinarse si el uso comercial está permitido. Además, la licencia del modelo base Qwen2.5-1.5B-Instruct condiciona cualquier uso derivado y debe verificarse por separado.
- Propósito inferido del nombre: "vi-toxic" sugiere un ajuste para generar contenido tóxico en vietnamita. Esto plantea riesgos de seguridad y de política de uso si se despliega sin control.
- Riesgo de alucinación: propio de un modelo de 1.500 millones, agravado por un ajuste no documentado que puede haber sesgado la distribución de salida.
- Posible degradación de capacidades del base: sin evaluación comparativa, no se puede descartar que el LoRA reduzca el rendimiento en instrucciones, código o tool calling.
- Idiomas no confirmados: la única pista es el nombre del repositorio; no hay evidencia de cobertura multilingüe.
- Contexto no confirmado: aunque el base Qwen2.5-1.5B-Instruct soporta ventanas amplias, la model card no lo especifica y el adaptador no está evaluado en contextos largos.
- Sin datos de sesgos ni de evaluación ética: no se ha realizado (o no se ha publicado) un análisis de sesgos.
- Cero descargas y cero likes en el momento de la consulta: no hay señales de uso comunitario ni de validación externa.
- Advertencia para producción: no desplegar sin auditoría previa, sin verificar la licencia y sin un sistema de moderación posterior. El uso en aplicaciones面向 al público es desaconsejable en su estado actual.

## Enlaces

- Hugging Face: https://huggingface.co/HaruKaru/qwen-vi-toxic-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Librería PEFT: https://github.com/huggingface/peft
- Paper de LoRA (referencia en los tags): https://arxiv.org/abs/1910.09700
- Calculador de impacto de Machine Learning (citado en la model card): https://mlco2.github.io/impact
- Paper de Lacoste et al. (2019), citado en la model card: https://arxiv.org/abs/1910.09700
