# adityag-india/Llama-3.1-8B-Medical-o1-LoRA

## Resumen

Llama-3.1-8B-Medical-o1-LoRA es un adaptador LoRA (PEFT) desarrollado por el usuario adityag-india sobre el modelo base meta-llama/Llama-3.1-8B-Instruct. Su objetivo es inducir razonamiento clínico explícito paso a paso, emitido dentro de etiquetas `<think>`, antes de comprometer una respuesta final. El adaptador se entrenó mediante SFT sobre el dataset FreedomIntelligence/medical-o1-reasoning-SFT, que aporta cadenas de razonamiento médico (Complex_CoT) emparejadas con respuestas finales. No se trata de un modelo completo, sino de un delta de pesos que debe cargarse sobre el base de 8B.

El adaptador añade 83,9 millones de parámetros entrenables (1,03 % del total) con rango 32 y alpha 64, aplicados a las proyecciones q, k, v, o, gate, up y down. El entrenamiento se realizó en bf16 sin cuantización, con longitud máxima de 2048 tokens, 2 épocas y 2414 pasos sobre una única RTX 5090 de 32 GB, en 3 horas y 28 minutos. La pérdida final fue de 1,17 en entrenamiento y 1,249 en evaluación, con meseta a partir de la época 1,5.

Su relevancia es acotada y de carácter experimental: el propio autor lo etiqueta como artefacto de investigación, no validado clínicamente y no apto para uso clínico. El interés técnico reside en que reproduce de forma ligera y reproducible el patrón de "reasoning traces" médicas con un coste de entrenamiento muy bajo, y en que sirve como banco de pruebas para estudiar hasta qué punto un LoRA de rango 32 sobre 19,7k ejemplos modifica el comportamiento de razonamiento de un instruct model generalista.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) con adaptador LoRA sobre atención y MLP |
| Parametros totales | 8,03B en el modelo base (aproximado, no declarado explícitamente en la model card); adaptador: 83,9M entrenables (1,03 %) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128.000 tokens en el modelo base; 2048 tokens de longitud máxima durante el entrenamiento del adaptador |
| Tipos de cuantizacion | No declarada en la model card para inferencia; el adaptador se entrenó en bf16 sin cuantizar. El base admite cuantización de 8 y 4 bits mediante herramientas estándar (bitsandbytes, GPTQ, AWQ, GGUF) |
| Idiomas soportados | Inglés (split `en`) |
| Licencia | Llama 3.1 Community License (dataset de entrenamiento: Apache 2.0) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); tamaño del repositorio: 0,4 GB |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Llama 3.1 8B Instruct, un transformer decoder-only con normalización RMSNorm, RoPE y atención con GQA (grouped-query attention). La configuración LoRA usa rango 32, alpha 64 y dropout 0,05 sobre los módulos q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj y down_proj, lo que supone 83,9 millones de parámetros entrenables. El entrenamiento se hizo en bf16 sin cuantización del base, con longitud de secuencia máxima de 2048, batch efectivo de 16 (4 × 4 de acumulación de gradiente), learning rate 1e-4 con scheduler coseno y 75 pasos de warmup, optimizador adamw_torch_fused, 2 épocas y 2414 pasos totales.

El dataset FreedomIntelligence/medical-o1-reasoning-SFT (licencia Apache 2.0) se formateó con el campo `Question` como turno de usuario y `<think>{Complex_CoT}</think>\n\n{Response}` como turno del asistente, enmascarando la pérdida sobre el prompt para entrenar únicamente los tokens de completado. Se usaron 19,7k ejemplos. La innovación es de formato más que arquitectónica: el modelo aprende a emitir la traza de razonamiento en una etiqueta explícita, imitando el patrón de los modelos de razonamiento tipo o1. El entrenamiento consumió 26,6 GiB de VRAM en pico sobre una RTX 5090 de 32 GB y finalizó en 3 h 28 min. La pérdida se estancó alrededor de la época 1,5; el autor indica que una tercera época probablemente no aportaría mejoras con ese rango de adaptador.

## Capacidades

- Generación de texto conversacional en inglés con formato de chat (chat template de Llama 3.1).
- Razonamiento clínico paso a paso explícito dentro de etiquetas `<think>`, seguido de una respuesta final.
- Respuesta a preguntas de tipo médico/científico (fisiopatología, diagnóstico diferencial, farmacología básica) en el formato del dataset medical-o1.
- Herencia de las capacidades generales del base Llama 3.1 8B Instruct: generación de texto, resumen, extracción de información y cierta capacidad de código y matemáticas, aunque el ajuste no las refuerza.
- Soporte de tool calling / function calling: heredado del base (Llama 3.1 8B Instruct soporta plantillas de herramientas), pero no validado ni entrenado en este adaptador.
- Uso agéntico multi-paso: no entrenado específicamente; el patrón `<think>...</think>` puede orquestarse externamente como un paso de razonamiento, sin garantías.
- Multilingüismo: limitado a inglés; el entrenamiento usó únicamente el split `en`.
- Capacidades especiales: modo "thinking" mediante etiquetas `<think>`; sin visión, audio ni multimodalidad.

## Casos de uso

- Investigación en razonamiento médico: reproducir y analizar trazas `<think>` generadas por un modelo pequeño para estudiar la coherencia del razonamiento clínico frente a la respuesta final, con un coste de cómputo bajo (un único adaptador de 0,4 GB sobre el base).
- Generación de datos sintéticos de razonamiento: usar el adaptador para producir pares pregunta/traza/respuesta que después se filtren manualmente y sirvan para aumentar datasets de SFT médico.
- Educación médica simulada: generar explicaciones paso a paso de conceptos fisiopatológicos para material de estudio, siempre con revisión por un profesional cualificado y sin uso diagnóstico.
- Prototipado rápido de asistentes clínicos en entornos de laboratorio: validar pipelines de chat con formato `<think>` antes de invertir en modelos mayores o en un ajuste con más datos.
- Evaluación comparativa de adaptadores LoRA: servir como referencia de "LoRA médico de rango 32 sobre 8B" frente a otras configuraciones (rango 16/64, más épocas, otros datasets) manteniendo el mismo base y el mismo hardware.
- Extracción estructurada de razonamiento: integrar el modelo en un pipeline que parsee las etiquetas `<think>` para separar traza y respuesta y auditar automáticamente la coherencia lógica (por ejemplo, detectando saltos argumentales).
- Clasificación y triaje de literatura biomédica: resumir abstracts y justificar la clasificación por especialidad con una traza breve, en un contexto de 2048 tokens que encaja con abstracts y notas cortas.
- Pruebas de robustez y alucinación: usar el adaptador como caso de estudio de cómo el SFT sobre razonamiento médico afecta a la confianza expresada por el modelo, comparando con el base Instruct.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MedQA, PubMedQA, MMLU-medical, etc.) en la información disponible. El autor indica explícitamente que la evaluación se limitó a pérdida en held-out e inspección cualitativa. Los únicos datos numéricos publicados son de pérdida:

| Metrica | Valor |
|---|---|
| Loss de entrenamiento (final) | 1,17 |
| Loss de evaluación (final) | 1,249 |
| Pasos de entrenamiento | 2.414 (2 épocas) |
| Ejemplos de entrenamiento | 19.700 (aproximado, 19,7k) |
| VRAM en pico durante el entrenamiento | 26,6 GiB |
| Tiempo de entrenamiento | 3 h 28 min (1 × RTX 5090 32 GB) |

## Requisitos de hardware

- Inferencia del adaptador: requiere cargar el modelo base Llama-3.1-8B-Instruct completo más el delta LoRA (0,4 GB). El adaptador por sí solo no es desplegable.
- VRAM estimada en bf16/fp16: en torno a 16-18 GB de pesos más caché KV; con 2048 tokens de contexto y batch 1, cabe en una GPU de 24 GB (RTX 3090, RTX 4090, L40S, A10G 24 GB con margen ajustado).
- VRAM estimada con cuantización de 8 bits: aproximadamente 9-10 GB; con 4 bits (GPTQ/AWQ/GGUF Q4_K_M), en torno a 5-6 GB, lo que permite ejecución en GPUs consumer de 8-12 GB (RTX 3060 12 GB, RTX 4070, RTX 4060 Ti 16 GB) o incluso en CPU vía llama.cpp con cuantizaciones bajas.
- GPU recomendadas: RTX 4090 o RTX 5090 (24-32 GB) para bf16 sin cuantizar; A100 40/80 GB y H100 para despliegue con concurrencia alta y lotes grandes.
- Entrenamiento reproducido: una única RTX 5090 de 32 GB basta para replicar el ajuste con esta configuración (rango 32, secuencia 2048, batch efectivo 16).
- Opciones de despliegue: transformers + peft (ruta oficial del autor); vLLM con soporte de adaptadores LoRA (`--enable-lora`); TGI con adaptadores; llama.cpp / Ollama tras fusionar el adaptador con el base y convertir a GGUF; también es posible fusionar los pesos (`merge_and_unload`) y servir un modelo único.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia en la información proporcionada.
- Nota de contexto: aunque el base soporta 128.000 tokens, el adaptador se entrenó con secuencias de 2048, por lo que su comportamiento en razonamiento médico fuera de ese rango no está validado.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks verificados de este adaptador, por lo que la comparación es estructural y no de rendimiento. Los datos de las alternativas deben verificarse en sus propias model cards.

| Modelo | Parametros | Contexto | Tipo | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|---|
| Llama-3.1-8B-Medical-o1-LoRA (este) | 8,03B base + 83,9M adaptador | 128k base; 2048 en entrenamiento | Adaptador LoRA sobre instruct | Llama 3.1 Community License | en | SFT supervisado sobre 19,7k ejemplos; sin benchmarks publicados |
| Llama-3.1-8B-Instruct (base) | 8,03B | 128k | Transformer decoder-only instruct | Llama 3.1 Community License | multilingüe (8 idiomas declarados por Meta) | No emite trazas `<think>`; requiere el system prompt específico para el formato del adaptador |
| HuatuoGPT-o1-8B | 8B | no disponible | Ajuste completo sobre base Llama 3.1 8B orientado a razonamiento médico | no disponible (verificar) | en / zh (verificar) | Alternativa de la misma categoría (razonamiento médico en 8B); reporta benchmarks propios, no comparables directamente aquí |
| Meditron-7B | 7B | no disponible | Ajuste sobre Llama-2-7B con corpus médico | Llama 2 Community License | en | Referencia clásica de dominio médico en 7B; sin modo de razonamiento explícito |

## Limitaciones y advertencias

- No apto para uso clínico: el autor lo declara explícitamente como artefacto de investigación, no validado clínicamente y no registrado como dispositivo médico. No debe informar decisiones sobre pacientes.
- Alucinación: el propio autor advierte de que el modelo produce afirmaciones médicas fluidas, seguras y a veces incorrectas. El formato `<think>` puede aumentar la sensación de rigor sin garantizar corrección.
- Sesgos: hereda los sesgos y el corte de conocimiento del modelo base Llama 3.1 8B Instruct, no corregidos por el ajuste.
- Cobertura de razonamiento truncada: el entrenamiento limitó las secuencias a 2048 tokens, de modo que las cadenas de razonamiento largas del dataset original quedaron truncadas y están infrarrepresentadas. El modelo puede degradarse en razonamientos extensos.
- Dependencia del prompt de sistema: la model card indica que los resultados se degradan notablemente si no se usa el system prompt de entrenamiento ("You are a medical expert. Reason carefully... inside `<think>` tags").
- Idioma: solo inglés. El uso en castellano no está entrenado ni validado.
- Evaluación insuficiente: no hay puntuaciones en MedQA, PubMedQA ni MMLU-medical; solo pérdida en held-out (1,249) e inspección cualitativa. No hay evidencia cuantitativa de mejora frente al base.
- Licencia y uso comercial: el adaptador está sujeto a la Llama 3.1 Community License, con sus restricciones (cláusula de escala de 700 millones de usuarios mensuales, requisitos de atribución "Built with Llama", políticas de uso aceptable y obligaciones de denominación). Cualquier uso comercial debe revisarse contra esos términos. El dataset de entrenamiento es Apache 2.0, lo que no exime de las obligaciones de la licencia del modelo base.
- Adopción nula: 0 descargas y 0 "likes" en el momento de la consulta, sin mantenimiento ni comunidad que reporte incidencias.
- Metadatos incompletos: la model card no documenta la cuantización de inferencia, ni el número exacto de parámetros del base, ni el total de tokens de entrenamiento; estos datos figuran aquí como derivados o marcados como no disponibles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/adityag-india/Llama-3.1-8B-Medical-o1-LoRA
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/FreedomIntelligence/medical-o1-reasoning-SFT
- Licencia Llama 3.1 Community License: https://github.com/meta-llama/llama-models/blob/main/models/llama3_1/LICENSE
- Librería PEFT: https://github.com/huggingface/peft
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes al modelo (los resultados devueltos corresponden al sitio de comercio electrónico Galaxus y no guardan relación con el modelo).
