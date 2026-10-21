# SecondLookResearch/Qwen2.5-32B-instruct-mix-difficult-advice-gpt-5.6-terra-285-10ep

## Resumen

`SecondLookResearch/Qwen2.5-32B-instruct-mix-difficult-advice-gpt-5.6-terra-285-10ep` es un adaptador LoRA de alineación sobre el modelo base `Qwen/Qwen2.5-32B`, desarrollado por Second Look Research (Anastasia Wei, Jack Thompson, Brandon Qi y Stewart Slocum) dentro del proyecto «Teaching Qwen Why», una replicación sobre modelos de pesos abiertos del trabajo de Anthropic «Teaching Claude Why». No es un modelo autónomo: es la segunda y última etapa de una cadena de dos adaptadores que deben servirse en orden sobre el modelo base parcheado.

El adaptador se entrena sobre 285 conversaciones de «consejo difícil» generadas por GPT-5.6 Terra durante 10 epochs, después de una primera etapa de ajuste de instrucciones con una mezcla de 13.000 ejemplos. El objetivo no es mejorar las capacidades generales del modelo, sino modificar su comportamiento en escenarios de consejo delicado y estudiar si el modelo puede explicar el «porqué» de sus decisiones de alineación. Se trata, por tanto, de un artefacto de investigación en alineación, no de un modelo listo para producción.

El interés actual del modelo es metodológico: documenta una cadena completa de ajuste con LoRA (rango 64, alpha 128), reparación de filas del terminador ChatML del modelo base («the graft») y despliegue con vLLM fusionando adaptadores en orden. Su licencia Apache-2.0 y su tamaño (2,2 GB de adaptador sobre un base de 32B) lo hacen reproducible en infraestructura de un solo nodo con GPU de 80 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2.5-32B) con adaptador LoRA PEFT sobre todas las capas lineales |
| Parametros totales | Aproximadamente 32,5B en el modelo base; el adaptador LoRA ocupa 2,2 GB en el repositorio |
| Parametros activos | No aplica: el modelo base es denso, no MoE |
| Longitud de contexto | 131.072 tokens (heredada del modelo base Qwen2.5-32B; no verificada en la informacion proporcionada) |
| Tipos de cuantizacion | No disponible para el adaptador; al fusionarse con el base hereda las opciones de este (GGUF, AWQ, GPTQ, FP8), aunque el autor solo documenta despliegue en vLLM |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA PEFT) + `base_row_patch.safetensors` con el parche de filas del terminador ChatML |
| Libreria | peft |
| Rango LoRA / alpha | 64 / 128 |
| Epocas de la etapa final | 10 |
| Dataset de la etapa final | `difficult_advice/gpt-5.6-terra-285/train.jsonl` (285 conversaciones) |
| Fecha de creacion / actualizacion | 2026-09-24 / 2026-10-20 |
| Descargas / likes | 25 / 0 |

## Arquitectura y entrenamiento

El modelo base es Qwen2.5-32B, un transformer decoder-only denso de aproximadamente 32,5B parametros. Sobre él se aplica un adaptador LoRA de rango 64 y alpha 128 en todas las capas lineales, con learning rate 1e-4, schedule coseno y batches efectivos de 8 secuencias empaquetadas. El entrenamiento se organiza en dos etapas secuenciales: cada etapa entrena un adaptador, se fusiona en el modelo y se continúa con la siguiente. La primera etapa usa una mezcla de ajuste de instrucciones de 13.000 ejemplos durante 2 epochs (adaptador `Qwen2.5-32B-instruct-mix`); la segunda, que es este repositorio, usa 285 conversaciones de consejo difícil generadas por GPT-5.6 Terra durante 10 epochs. En ambas etapas la pérdida se calcula únicamente sobre los turnos del asistente.

La innovación técnica destacable no está en la arquitectura, sino en el procedimiento de preparación: antes de la etapa de instrucciones se reparan las filas no entrenadas del terminador ChatML del modelo base (denominado «the graft» en el repositorio de código), y el parche resultante se distribuye como `base_row_patch.safetensors` dentro de este repositorio. El despliegue requiere aplicar ese parche, fusionar los dos adaptadores en orden y arrancar el servidor con `evaluation/agentic_misalignment/serve_model.sh`. No se documentan en la información disponible el volumen total de tokens de entrenamiento, la composición completa del dataset ni el uso de RLHF o DPO; el pipeline descrito es exclusivamente supervisado (SFT sobre turnos del asistente).

## Capacidades

- Generación de texto y conversación multi-turno: hereda las capacidades del modelo base Qwen2.5-32B tras la etapa de ajuste de instrucciones.
- Comportamiento de «consejo difícil»: el adaptador final está entrenado específicamente para responder a situaciones de consejo delicado con el estilo de las 285 conversaciones de GPT-5.6 Terra.
- Explicación del razonamiento de alineación: el proyecto «Teaching Qwen Why» busca que el modelo articule el porqué de sus decisiones, no solo que las tome.
- Ajuste de instrucciones: la primera etapa de la cadena aporta el formato conversacional ChatML sobre el modelo base preentrenado.
- Capacidades heredadas del base (código, matemáticas, multilingüismo): no documentadas ni verificadas para este adaptador en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado como capacidad del adaptador; el repositorio de código incluye un entorno de evaluación de «agentic misalignment», no una capacidad de agente del modelo.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Replicación de investigación en alineación: reproducir los resultados del proyecto «Teaching Qwen Why» sirviendo la cadena de adaptadores con el script del repositorio y comparando el comportamiento antes y después de cada etapa.
- Estudio de clonación de comportamiento de un modelo profesor: analizar en qué medida 285 conversaciones generadas por GPT-5.6 Terra y 10 epochs de SFT bastan para transferir un estilo de respuesta concreto a un modelo de 32B.
- Evaluación de «agentic misalignment»: usar el adaptador como sujeto de prueba en el arnés de evaluación incluido en el repositorio para medir cambios de comportamiento en escenarios de agencia.
- Investigación sobre refusal y consejo delicado: comparar las tasas de rechazo, matices y derivaciones a profesionales del modelo ajustado frente al base en prompts de consejo sensible.
- Metodología de cadenas LoRA: servir como ejemplo reproducible de entrenamiento por etapas con fusión intermedia, útil para equipos que diseñan pipelines de ajuste incremental.
- Reparación de tokens especiales: el parche `base_row_patch.safetensors` sirve como caso de estudio de corrección de filas no entrenadas del terminador ChatML en modelos base.
- Docencia y formación: material práctico para cursos de alineación y ajuste fino, dado que todo el código, los datos y los adaptadores son públicos y de tamaño manejable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que el adaptador se usa en la Figura 16 del post del proyecto, pero no se incluyen métricas numéricas (MMLU, HumanEval, GSM8K ni evaluaciones de alineación) en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: alrededor de 65 GB solo para pesos del modelo fusionado de 32B, más caché KV; se recomienda GPU de 80 GB (A100 80GB, H100 80GB, H200).
- VRAM estimada en FP8: alrededor de 33-35 GB de pesos; cabe en L40S 48GB, A6000 48GB o H100.
- VRAM estimada en INT4: alrededor de 18-20 GB de pesos; puede caber en RTX 4090 24GB o RTX 3090 24GB, con margen limitado para caché KV en contextos largos.
- Caché KV estimada: aproximadamente 256 KB por token en FP16 (64 capas, 8 cabezas KV, head_dim 128), es decir, unos 8 GB para 32.000 tokens de contexto. Estimación basada en la arquitectura del modelo base, no confirmada en la información proporcionada.
- GPU recomendadas: A100 80GB o H100 para el despliegue documentado por el autor con vLLM; consumer GPU solo con cuantización agresiva.
- Opciones de despliegue: vLLM es la única vía documentada, mediante `serve_model.sh`, que aplica el parche, fusiona los adaptadores en orden y arranca el servidor. No se documentan llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput: no disponibles en la información proporcionada.
- Almacenamiento: 2,2 GB para el adaptador; hay que sumar los pesos del modelo base de 32B y el adaptador intermedio de la cadena.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (etapa 2 de la cadena) | 32,5B (base) + LoRA r64 | 131.072 tokens (heredado) | LoRA de alineación sobre Qwen2.5-32B | Apache-2.0 | Publico en HuggingFace, 25 descargas |
| `SecondLookResearch/Qwen2.5-32B-instruct-mix` | 32,5B (base) + LoRA r64 | 131.072 tokens (heredado) | LoRA de ajuste de instrucciones, etapa 1 de la misma cadena | Apache-2.0 | Publico en HuggingFace |
| `Qwen/Qwen2.5-32B` | 32,5B denso | 131.072 tokens | Modelo base preentrenado | Apache-2.0 | Publico en HuggingFace |
| `Qwen/Qwen2.5-32B-Instruct` | 32,5B denso | 131.072 tokens | Modelo ajustado para instrucciones y chat | Apache-2.0 | Publico en HuggingFace |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada; la comparación se limita a parametros, contexto, tipo de artefacto y licencia.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere aplicar el parche `base_row_patch.safetensors`, fusionar primero el adaptador `Qwen2.5-32B-instruct-mix` y después este, en ese orden exacto. Servirlo de forma aislada produce resultados incorrectos.
- El dataset de la etapa final es muy pequeño (285 conversaciones) y se entrena durante 10 epochs, lo que implica un riesgo alto de sobreajuste y de degradación de capacidades generales.
- El modelo base es la versión preentrenada `Qwen/Qwen2.5-32B`, no la versión Instruct; el comportamiento conversacional depende casi por completo del adaptador de la primera etapa.
- No hay benchmarks publicados ni evaluaciones independientes en la información disponible; no se puede afirmar nada sobre su calidad relativa frente a Qwen2.5-32B-Instruct.
- El nombre del modelo hace referencia a «gpt-5.6-terra», un modelo profesor cuyas salidas se usan como datos de entrenamiento; esto puede introducir sesgos de estilo y de contenido heredados de ese profesor.
- Riesgo de alucinación: no evaluado en la información proporcionada, y potencialmente agravado por el ajuste sobre un dataset pequeño y específico.
- Idiomas soportados: no disponibles; no se documenta el comportamiento multilingüe del adaptador.
- Licencia Apache-2.0 para el adaptador, pero conviene verificar la licencia y las condiciones del modelo base Qwen2.5-32B y de los datos de entrenamiento antes de un uso comercial.
- El propósito declarado es la investigación en alineación; no se recomienda su uso en producción ni en aplicaciones de consejo real a usuarios finales sin una evaluación de seguridad específica.
- El pipeline de despliegue documentado depende de vLLM y de scripts del repositorio de código; no hay soporte para otras herramientas de inferencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SecondLookResearch/Qwen2.5-32B-instruct-mix-difficult-advice-gpt-5.6-terra-285-10ep
- Adaptador de la etapa 1: https://huggingface.co/SecondLookResearch/Qwen2.5-32B-instruct-mix
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-32B
- Dataset del proyecto: https://huggingface.co/datasets/SecondLookResearch/teaching-qwen-why-data
- Repositorio de código: https://github.com/uchicago-xlab/TeachingClaudeWhyReplication
- Post del proyecto (Figura 16): no disponible como enlace directo en la información proporcionada
