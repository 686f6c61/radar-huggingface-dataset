# ForSureTesterSim/Llama-3.1-8B-DELLA_Ext_A

## Resumen

DELLA_Ext_A es un modelo de lenguaje de 8.030.261.248 parámetros (8,03 B) publicado por el usuario ForSureTesterSim en HuggingFace. No es un modelo entrenado desde cero, sino el resultado de una fusión de pesos (*model merging*) generada con la herramienta mergekit aplicando el método DELLA sobre la arquitectura de Llama 3.1 8B. El modelo base declarado es meta-llama/Llama-3.1-8B, y sobre él se fusionan los deltas de tres variantes ajustadas: meta-llama/Llama-3.1-8B-Instruct, Magpie-Align/Llama-3.1-8B-Magpie-Align-v0.2 y allenai/Llama-3.1-Tulu-3.1-8B.

El problema que aborda es el habitual de las fusiones de modelos: combinar en un único checkpoint de 8 B las capacidades conversacionales, de seguimiento de instrucciones y de alineación que cada uno de los tres modelos padres aporta por separado, sin necesidad de volver a entrenar ni de ejecutar varias inferencias. Al mantener la arquitectura original de Llama 3.1, hereda su ventana de contexto larga (128 000 tokens en la familia Llama 3.1), su tokenizador de 128 256 entradas y su compatibilidad con el ecosistema transformers, safetensors y text-generation-inference.

Su relevancia es limitada y debe contextualizarse: el repositorio registra 0 descargas y 0 likes, no se declara licencia ni idiomas, no se publican resultados de evaluación y la model card se limita a la plantilla automática de mergekit con el YAML de configuración. Es, por tanto, un artefacto experimental de bajo perfil, útil únicamente como referencia técnica del método DELLA o como punto de partida para evaluaciones propias, no como modelo listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.1), pesos fusionados con mergekit |
| Parametros totales | 8.030.261.248 (8,03 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128 000 tokens según la arquitectura heredada de Llama 3.1; no confirmado explícitamente en la model card |
| Tipos de cuantizacion | No disponible en la model card; al ser un checkpoint estándar de Llama, es compatible con GGUF/AWQ/GPTQ generados por terceros (no publicados en el repo) |
| Idiomas soportados | No disponible (los modelos padres de Meta declaran soporte oficial para inglés, alemán, francés, italiano, portugués, hindi, español y tailandés) |
| Licencia | No disponible (los modelos base de Meta usan la Llama 3.1 Community License; los modelos derivados de Tulu 3.1 y Magpie-Align tienen sus propias condiciones) |
| Formato de pesos | safetensors (transformers), dtype bfloat16; repositorio de 16,1 GB |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3.1 8B sin modificaciones: transformer decoder-only con normalización RMSNorm pre-norm, activación SwiGLU en el bloque feed-forward, RoPE para codificación posicional y Grouped Query Attention (GQA). El tokenizador procede de meta-llama/Llama-3.1-8B-Instruct (`tokenizer_source`), lo que implica un vocabulario de 128 256 tokens y el mismo esquema de tokens especiales de la familia Instruct. No hay ningún componente MoE, SSM ni híbrido.

No existe entrenamiento adicional: el checkpoint se construye íntegramente por fusión de pesos. La configuración YAML publicada indica `merge_method: della` con `base_model: meta-llama/Llama-3.1-8B`, tres modelos fusionados con `weight: 1.0`, `density: 0.5` y `epsilon: 0.1` cada uno, `normalize: true` e `int8_mask: true`, en precisión `bfloat16`. En términos prácticos, DELLA (referenciado en el arXiv 2406.11617) calcula los deltas de cada modelo respecto al base, los somete a poda por densidad y a un umbral de resolución de conflictos de signo antes de combinarlos; los parámetros `density` y `epsilon` controlan qué fracción de pesos se conserva y el margen de descarte. No se documenta ni número de tokens adicionales, ni dataset, ni fases de RLHF/DPO más allá de las que ya incorporan los modelos padres. La model card no incluye ninguna innovación técnica propia ni evaluación posterior a la fusión.

## Capacidades

- Generación de texto conversacional en formato de instrucciones, heredada principalmente de Llama-3.1-8B-Instruct y de la variante Magpie-Align (alineada con datos sintéticos estilo Magpie).
- Seguimiento de instrucciones y respuestas multi-turno, con el formato de chat de Llama 3.1.
- Razonamiento y conocimientos generales a nivel de un modelo de 8 B de la generación Llama 3.1.
- Capacidades de código y matemáticas básicas, dentro del rango habitual de Llama 3.1 8B; no se publican evaluaciones específicas.
- Soporte de tool calling / function calling: heredado del formato de Llama 3.1 Instruct, aunque no verificado en este checkpoint concreto.
- Capacidades multilingües: no declaradas para este repositorio; las que aporten los modelos padres.
- Capacidades especiales (visión, audio, modo de pensamiento explícito): no disponibles; el modelo es exclusivamente de texto.
- No se documentan capacidades de agente, decodificación especulativa ni atención lineal.

## Casos de uso

- Evaluación comparativa de métodos de fusión: usar DELLA_Ext_A junto a los tres modelos padres para medir, con un harness propio (lm-evaluation-harness, MMLU, GSM8K), si la fusión DELLA preserva, degrada o mejora las capacidades individuales.
- Reproducción de experimentos de mergekit: el YAML publicado es completo y reproducible, por lo que sirve como caso de estudio didáctico de los parámetros `density`, `epsilon` e `int8_mask` en fusiones DELLA sobre un backbone de 8 B.
- Base para ajuste fino ligero: al ser un checkpoint transformers estándar en bfloat16, se puede cargar con PEFT/LoRA sobre una GPU de 24 GB para tareas de dominio específico sin partir del modelo original de Meta.
- Prototipado conversacional en local: con una cuantización GGUF Q4_K_M generada por el usuario, cabe en GPUs de 8-12 GB y permite probar asistentes de chat en un portátil con llama.cpp u Ollama.
- Generación de texto en pipelines por lotes: al ser compatible con text-generation-inference y endpoints compatibles, puede desplegarse en un servidor con vLLM o TGI para tareas de resumen, reescritura o extracción de información a escala media.
- Experimentos de destilación o generación de datos sintéticos: usar el modelo como generador de respuestas candidatas que luego se filtran con un modelo mayor, aprovechando la ventana de contexto larga heredada.
- Investigación sobre alineación y sesgos: comparar las respuestas de esta fusión con las de Llama-3.1-8B-Instruct y Tulu 3.1 8B para estudiar cómo la mezcla de pesos afecta al tono, la verbosidad y la tasa de rechazo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye tabla de evaluaciones, ni comparaciones con los modelos padres, ni métricas de perplejidad. Cualquier cifra de rendimiento debería obtenerse ejecutando una evaluación propia.

## Requisitos de hardware

- Peso del checkpoint en bfloat16: aproximadamente 16,1 GB, según el tamaño del repositorio.
- VRAM estimada para inferencia: ~18-20 GB en bf16/fp16 con contexto moderado; ~10-12 GB en cuantización INT8; ~6-8 GB en cuantización de 4 bits con contexto de 8-16 K tokens; el consumo crece de forma apreciable con la caché KV si se usan contextos cercanos a 128 K.
- GPU recomendadas: A100 40/80 GB, H100, L40S o A6000 para bf16 con contexto largo; RTX 4090 (24 GB) o RTX 3090 (24 GB) para bf16 con contexto corto y para INT8; RTX 4080/4070 Ti (16 GB) para INT8 o 4 bits.
- Cabe en GPU de consumo: sí. En 4 bits funciona en GPU de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070); en INT8 requiere 16 GB o más.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles, vLLM, llama.cpp/Ollama y LM Studio previa conversión a GGUF, dado que el repositorio solo distribuye safetensors en bfloat16.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ForSureTesterSim/Llama-3.1-8B-DELLA_Ext_A | 8,03 B | 128 K (heredado) | No publicado | No declarada | 0 descargas, 0 likes; solo safetensors bf16 |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 128 K | Ampliamente evaluado (MMLU, IFEval, etc.) | Llama 3.1 Community License | Muy alta; versiones GGUF/AWQ/GPTQ de terceros |
| allenai/Llama-3.1-Tulu-3.1-8B | ~8 B | 128 K (hasta 65 K en algunas variantes) | Publica resultados en MMLU, GSM8K, IFEval y otros | Open-access (Tulu 3, con condiciones de uso) | Alta; checkpoints y recetas de entrenamiento |
| Magpie-Align/Llama-3.1-8B-Magpie-Align-v0.2 | 8,03 B | 128 K | Evaluaciones limitadas, centradas en alineación | No disponible en la información consultada | Media; modelo de investigación |
| Qwen2.5-7B-Instruct (alternativa de tamaño similar) | 7,6 B | 128 K | Publica resultados extensos en razonamiento, código y matemáticas | Apache 2.0 | Muy alta |

## Limitaciones y advertencias

- No se declara licencia en el repositorio. Al derivar de Llama 3.1, de Tulu 3.1 y de Magpie-Align, el uso comercial queda sujeto a las condiciones de los tres modelos padres, que deben revisarse individualmente antes de cualquier despliegue.
- Ausencia total de evaluación: no hay benchmarks, ni perplejidad, ni pruebas cualitativas publicadas. No hay evidencia de que la fusión funcione mejor, igual o peor que sus componentes.
- Las fusiones de pesos pueden degradar la coherencia: es frecuente observar respuestas repetitivas, pérdida de formato de chat o razonamiento inconsistente cuando se combinan tres checkpoints alineados con recetas distintas (Magpie, Tulu y Instruct).
- Riesgo de alucinación: al igual que Llama 3.1 8B, el modelo puede generar información falsa con aparente seguridad, especialmente en dominios especializados y en contextos largos.
- Idiomas no declarados: no hay garantía de calidad fuera del inglés; el comportamiento multilingüe es una incógnita hasta que se pruebe.
- El identificador del autor (`ForSureTesterSim`) y las fechas de creación y actualización del repositorio sugieren una cuenta de pruebas; no hay garantía de mantenimiento, versionado ni soporte.
- Sin cuantizaciones publicadas: todo despliegue en hardware de consumo exige generar los GGUF o cuantizaciones AWQ/GPTQ por cuenta propia, con el coste y la validación que ello implica.
- Contaminación y sesgos heredados: los datasets de alineación de los modelos padres (Magpie, Tulu) pueden introducir sesgos de estilo, verbosidad excesiva o un sesgo de rechazo distinto al de Llama-3.1-8B-Instruct.
- Contexto largo no verificado: aunque la arquitectura soporta 128 K tokens, no hay evidencia de que la fusión conserve la calidad de recuperación en ventanas muy largas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ForSureTesterSim/Llama-3.1-8B-DELLA_Ext_A
- mergekit (herramienta de fusión): https://github.com/cg123/mergekit
- Paper del método DELLA: https://arxiv.org/abs/2406.11617
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B
- Modelo fusionado: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Modelo fusionado: https://huggingface.co/Magpie-Align/Llama-3.1-8B-Magpie-Align-v0.2
- Modelo fusionado: https://huggingface.co/allenai/Llama-3.1-Tulu-3.1-8B
