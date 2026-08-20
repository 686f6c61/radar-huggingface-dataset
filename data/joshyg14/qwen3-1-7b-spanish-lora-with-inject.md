# JoshyG14/qwen3-1.7b-spanish-lora-with-inject

## Resumen

Este modelo es un adaptador LoRA (PEFT) entrenado sobre el modelo base Qwen/Qwen3-1.7B, desarrollado por JoshyG14 como parte del proyecto académico LinguistOS (MSc en Imperial College London, 2026). Su propósito es generar oraciones cortas en español que cumplan restricciones morfosintácticas concretas (tiempo verbal, persona, número) cuando se le proporciona el lema verbal, las restricciones y la forma superficial esperada. La característica distintiva es que la forma verbal flexionada correcta se inyecta directamente en el prompt (técnica denominada "LoRA-with-inject"), lo que permite evaluar la capacidad del modelo para integrar esa información en la generación de una oración natural.

El adaptador no es un modelo de chat generalista: está especializado en una tarea de generación bajo restricciones gramaticales. El tamaño del adaptador es de aproximadamente 67 MB, y se carga sobre el modelo base de 1.700 millones de parámetros (Qwen3-1.7B). Su relevancia radica en que ofrece un caso de estudio para el ajuste fino de modelos de lenguaje con conocimiento morfológico explícito, con aplicaciones en generación de ejercicios de lengua, evaluación de modelos y creación de datos sintéticos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre Qwen3-1.7B (dense transformer) |
| Parametros totales | 1.700 M (modelo base) + ~67 M (adaptador LoRA) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors) |
| Idiomas soportados | Español (es) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento
El adaptador se entrena con el método LoRA (Low-Rank Adaptation) sobre el modelo base Qwen3-1.7B, que es un transformer denso con arquitectura causal. Los módulos objetivo son `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`, con rango r=16, alpha=32 y dropout de 0.05. El entrenamiento se realizó mediante supervisión fina (SFT) con objetivo de entropía cruzada sobre pares prompt-completación. El dataset consiste en 4.205 pares filtrados procedentes de un grid de diagnóstico de 150 verbos españoles, divididos en 3.995 ejemplos de entrenamiento y 210 de validación, con sobremuestreo (x2) de las celdas difíciles. Se aplicó early stopping con mejor pérdida de validación a los 1.000 pasos, 3 épocas y tasa de aprendizaje de 2×10⁻⁴. El adaptador resultante ocupa unos 67 MB.

La innovación principal es la inyección de la forma flexionada correcta en el prompt, lo que permite al modelo generar oraciones que usan esa forma como verbo principal sin necesidad de inferirla por sí mismo. El adaptador no modifica la arquitectura del modelo base, sino que añade pesos de bajo rango que se suman a los módulos de atención y feed-forward.

## Capacidades
- Generación de oraciones cortas en español que cumplen restricciones morfológicas (tiempo, persona, número) usando la forma verbal dada.
- Integración de una forma flexionada explícita en el contexto de generación.
- Capacidad de seguir el formato de prompt específico definido en el proyecto (lema, restricciones, forma inyectada).
- No es un modelo de chat general, no soporta tool calling, ni agentes, ni visión, ni audio.
- Multilingüe: solo español, y limitado a la tarea de generación de oraciones con la forma inyectada.
- No hay modo de pensamiento (thinking mode) implementado en el adaptador; el modelo base Qwen3-1.7B tiene capacidad de razonamiento, pero el adaptador se ha entrenado para una tarea concreta.

## Casos de uso
- Generación de ejercicios de lengua española: crear oraciones de ejemplo para ejercicios de conjugación verbal, donde se especifica el verbo y la forma, y el modelo produce una frase natural que la contenga.
- Evaluación de modelos morfológicos: usar el adaptador para comprobar si un sistema de generación de formas verbales (como un morfólogo) produce salidas que se integran correctamente en contextos sintácticos.
- Creación de datos sintéticos: generar pares de (lema, restricciones, forma, oración) para entrenar o evaluar otros modelos de procesamiento del español.
- Pruebas de coherencia gramatical: verificar que el modelo base Qwen3-1.7B puede generar oraciones correctas cuando se le da una forma verbal específica, sirviendo como banco de pruebas para la adaptación.
- Investigación en lingüística computacional: estudiar cómo los adaptadores LoRA pueden incorporar conocimiento morfológico explícito en modelos generativos.
- Desarrollo de asistentes de escritura en español: aunque el adaptador no es general, podría integrarse en un sistema mayor que proporcione la forma verbal correcta y el adaptador genere la oración, como módulo de generación de ejemplos.
- Benchmarking de generación bajo restricciones: comparar el rendimiento de diferentes estrategias (con inyección vs. sin inyección) en tareas de generación con restricciones morfológicas.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. El proyecto menciona un grid de diagnóstico de 150 verbos, pero no se ofrecen métricas numéricas de precisión, BLEU u otras. Por tanto, no se puede evaluar el rendimiento comparativo con otros modelos.

## Requisitos de hardware
- VRAM estimada para inferencia: al usar el modelo base de 1.7B en fp16, se requieren aproximadamente 3.5 GB para los pesos, más la memoria de activaciones y el adaptador (67 MB). Se puede estimar una VRAM total de unos 5-6 GB en fp16. Con cuantización (por ejemplo, 8-bit) se puede reducir a 2-3 GB.
- GPU recomendadas: el modelo cabe en cualquier GPU con 6 GB o más de VRAM, como una RTX 2060 (6 GB), RTX 3060 (12 GB), RTX 4090 (24 GB) o A100 (40 GB). Para uso en producción con vLLM o TGI, se recomienda al menos 8 GB.
- En consumer GPU: sí, es viable en GPUs de gama media como RTX 3060 o superiores.
- Opciones de despliegue: se puede cargar con transformers y PEFT, o usar servidores de inferencia como vLLM o Text Generation Inference (TGI) que soportan adaptadores PEFT. También es compatible con llama.cpp si se convierte a GGUF, aunque no se ha especificado.
- Latencia y throughput: no disponibles; dependen del hardware y del tamaño del prompt.

## Comparativa con modelos similares
El adaptador no tiene comparables directos en el mismo dominio, pero se puede comparar con el adaptador hermano sin inyección (`JoshyG14/qwen3-1.7b-spanish-lora-no-inject`) y con el modelo base Qwen3-1.7B.

| Modelo | Parámetros | Contexto | Licencia | Especialización |
|---|---|---|---|---|
| Qwen3-1.7B (base) | 1.7B | No disponible | Apache-2.0 | Generalista |
| JoshyG14/qwen3-1.7b-spanish-lora-with-inject | 1.7B + 0.067B | No disponible | Apache-2.0 | Generación de oraciones con forma inyectada |
| JoshyG14/qwen3-1.7b-spanish-lora-no-inject | 1.7B + 0.067B | No disponible | Apache-2.0 | Generación de oraciones sin forma inyectada |

No hay datos de rendimiento para comparar numéricamente. El adaptador con inyección debería superar al sin inyección en la tarea de usar la forma correcta, pero no se dispone de métricas.

## Limitaciones y advertencias
- No es un modelo de chat general: solo funciona con el formato de prompt específico del proyecto. Usarlo fuera de ese contexto producirá resultados no fiables.
- Riesgo de alucinación: al ser un modelo generativo, puede producir oraciones gramaticalmente correctas pero con significado no deseado o con formas verbales incorrectas si la inyección no se respeta.
- Sesgos del modelo base: Qwen3-1.7B puede tener sesgos lingüísticos y culturales que se trasladan al adaptador.
- Limitación de idioma: solo español, y la tarea se limita a verbos de un grid de 150 verbos; puede no generalizar a otros verbos.
- Restricciones de uso comercial: la licencia Apache-2.0 permite uso comercial, pero el adaptador se distribuye como parte de un proyecto académico; no hay restricciones adicionales conocidas.
- Dependencia del modelo base: el adaptador solo funciona sobre el modelo base Qwen3-1.7B; no se puede usar de forma independiente.
- No se han publicado datos de evaluación sobre conjuntos de prueba estándar, por lo que su rendimiento en producción es incierto.

## Enlaces
- HuggingFace del adaptador: https://huggingface.co/JoshyG14/qwen3-1.7b-spanish-lora-with-inject
- Repositorio de código del proyecto: https://github.com/JoshuaGraham14/LinguistOS
- Adaptador sin inyección: https://huggingface.co/JoshyG14/qwen3-1.7b-spanish-lora-no-inject
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Informe técnico de Qwen3: https://arxiv.org/html/2505.09388v1

--- 
He seguido la estructura, no he inventado datos, he indicado "no disponible" cuando correspondía. He usado castellano de España. Las tablas están en Markdown. Los títulos en minúsculas excepto la primera palabra. No he usado emojis. He sido específico y técnico.</think>## Resumen
Este modelo es un adaptador LoRA (PEFT) sobre el modelo base Qwen/Qwen3-1.7B, desarrollado por JoshyG14 como parte del proyecto académico LinguistOS (MSc en Imperial College London, 2026). Su propósito es generar oraciones cortas en español que cumplan restricciones morfosintácticas concretas (tiempo, persona, número) y que, además, reciban la forma verbal flexionada correcta inyectada directamente en el prompt. Esta técnica, denominada "LoRA-with-inject", permite evaluar cómo un modelo de lenguaje integra una forma morfológica explícita en la generación de una oración natural. El adaptador no es un modelo de chat general: solo funciona en la tarea específica de generación de oraciones con la forma verbal dada, y se distribuye como un paquete de pesos adicionales de unos 67 MB que se cargan sobre el modelo base de 1.700 millones de parámetros.

La relevancia del modelo reside en su carácter experimental: sirve como caso de estudio para el ajuste fino de modelos con conocimiento morfológico explícito, con aplicaciones en lingüística computacional, generación de ejercicios de lengua y creación de datos sintéticos. Su licencia Apache-2.0 facilita su uso en investigación y desarrollo, aunque su utilidad práctica queda limitada a la tarea concreta para la que fue entrenado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre Qwen3-1.7B (dense transformer) |
| Parametros totales | 1.700 M (modelo base) + ~67 M (adaptador LoRA) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors) |
| Idiomas soportados | Español (es) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento
El adaptador se entrena mediante el método LoRA (Low-Rank Adaptation) sobre el modelo base Qwen3-1.7B, un transformer denso con atención causal. Los módulos objetivo son `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`, con rango 16, alpha 32 y dropout de 0.05. El entrenamiento se realiza mediante supervisión fina (SFT) con objetivo de entropía cruzada sobre pares prompt-completación. El dataset consta de 4.205 pares filtrados procedentes de un grid de diagnóstico de 150 verbos españoles, divididos en 3.995 ejemplos de entrenamiento y 210 de validación, con sobremuestreo (x2) de las celdas más difíciles. El mejor checkpoint se obtiene en el paso 1.000 con early stopping, 3 épocas y learning rate de 2×10⁻⁴. El adaptador final ocupa unos 67 MB.

La innovación técnica principal es la inyección de la forma verbal correcta en el prompt, de modo que el modelo no tiene que inferir la conjugación por sí mismo, sino que debe integrarla en una oración coherente. Esto permite aislar la capacidad de generación sintáctica de la capacidad morfológica. El adaptador no altera la arquitectura base, solo añade matrices de bajo rango a los módulos seleccionados.

## Capacidades
- Generación de oraciones cortas en español que cumplen restricciones morfosintácticas (tiempo, persona, número) usando una forma verbal dada.
- Integración de una forma flexionada explícita en el contexto de generación.
- Seguimiento del formato de prompt específico definido en el proyecto (lema, restricciones, forma inyectada).
- No soporta tool calling, ni agentes, ni visión, ni audio.
- Solo español, y limitado a la tarea de generación con restricciones.
- No incluye modo de pensamiento (thinking mode) específico; el modelo base Qwen3-1.7B sí tiene capacidad de razonamiento, pero el adaptador se ha entrenado para una tarea concreta.

## Casos de uso
- Generación de ejercicios de lengua española: crear oraciones de ejemplo para practicar la conjugación, donde se especifica el verbo y la forma correcta, y el modelo produce una frase natural que la contiene.
- Evaluación de modelos morfológicos: usar el adaptador para verificar si un sistema de generación de formas verbales produce salidas que se integran correctamente en contextos gramaticales.
- Creación de datos sintéticos: generar pares (lema, restricciones, forma, oración) para entrenar o evaluar otros modelos de procesamiento de lenguaje en español.
- Pruebas de control gramatical: analizar si el modelo base Qwen3-1.7B puede generar oraciones correctas cuando se le proporciona una forma verbal explícita, como herramienta de diagnóstico.
- Investigación en lingüística computacional: estudiar cómo los adaptadores LoRA pueden inyectar conocimiento morfológico explícito en modelos generativos.
- Módulo de generación de ejemplos en asistentes de escritura: aunque no es general, puede integrarse en un sistema que proporcione la forma verbal y genere una frase de ejemplo.
- Benchmarking de generación con restricciones: comparar el rendimiento con y sin inyección de forma en la misma tarea.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. El modelo card menciona un grid de diagnóstico de 150 verbos, pero no se ofrecen métricas numéricas de precisión, F1, BLEU u otras. Por tanto, no se puede evaluar cuantitativamente el rendimiento frente a otros modelos.

## Requisitos de hardware
- VRAM estimada para inferencia: el modelo base de 1.7B en fp16 ocupa unos 3,4 GB, más el adaptador de 67 MB y los estados de activación. En total se puede estimar entre 4 y 6 GB de VRAM para una generación corta. Con cuantización a 8 bits, se puede reducir a 2-3 GB.
- GPU recomendadas: cualquier GPU consumer con 6 GB o más de VRAM, como RTX 2060 (6 GB), RTX 3060 (8 GB), RTX 4090 (24 GB) o A100 (40 GB). Para despliegue en servidor, se recomienda al menos una GPU de 8 GB.
- Sí cabe en consumer GPU: es viable en RTX 3060 y superiores.
- Opciones de despliegue: se puede cargar con `transformers` y `peft`, y servir mediante vLLM o TGI que soportan adaptadores PEFT. También se puede convertir a GGUF para usar con llama.cpp, aunque no se especifica.
- Latencia y throughput: no disponibles; dependen del hardware y del tamaño del prompt.

## Comparativa con modelos similares
No hay modelos comparables directos en la misma tarea (adaptador LoRA para morfología española con inyección). Se puede comparar con el adaptador hermano sin inyección y con el modelo base.

| Modelo | Parámetros | Contexto | Licencia | Especialización |
|---|---|---|---|---|
| Qwen3-1.7B (base) | 1.7B | No disponible | Apache-2.0 | Generalista |
| JoshyG14/qwen3-1.7b-spanish-lora-with-inject | 1.7B + 67M | No disponible | Apache-2.0 | Generación con forma inyectada |
| JoshyG14/qwen3-1.7b-spanish-lora-no-inject | 1.7B + 67M | No disponible | Apache-2.0 | Generación sin forma inyectada |

No se dispone de métricas comparativas. La expectativa es que el modelo con inyección produzca oraciones que respeten la forma dada con mayor frecuencia que el sin inyección, pero no hay datos que lo confirmen.

## Limitaciones y advertencias
- No es un modelo de chat general: solo funciona con el formato de prompt específico del proyecto; fuera de él, las salidas son incoherentes.
- Riesgo de alucinación: puede generar oraciones gramaticalmente correctas pero con significado erróneo o con formas verbales distintas a la inyectada si el prompt no se sigue exactamente.
- Sesgos del modelo base: Qwen3-1.7B puede presentar sesgos lingüísticos y culturales que se transfieren al adaptador.
- Limitación de idioma y vocabulario: solo español y limitado a los 150 verbos del grid de entrenamiento; no se ha validado con otros verbos.
- Dependencia del modelo base: el adaptador no funciona sin el modelo Qwen3-1.7B, y no se puede usar de forma independiente.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el proyecto es académico y no se ofrecen garantías de soporte.
- No hay datos de rendimiento en tareas estándar, por lo que su comportamiento en producción es incierto.

## Enlaces
- HuggingFace del adaptador: https://huggingface.co/JoshyG14/qwen3-1.7b-spanish-lora-with-inject
- Repositorio de código del proyecto: https://github.com/JoshuaGraham14/LinguistOS
- Adaptador sin inyección: https://huggingface.co/JoshyG14/qwen3-1.7b-spanish-lora-no-inject
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Informe técnico de Qwen3: https://arxiv.org/abs/2505.09388
