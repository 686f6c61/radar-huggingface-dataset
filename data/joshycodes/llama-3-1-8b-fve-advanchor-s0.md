# joshycodes/llama-3.1-8b-fve-advanchor-s0

## Resumen

`joshycodes/llama-3.1-8b-fve-advanchor-s0` es un checkpoint de investigación publicado por el usuario joshycodes que parte de `meta-llama/Llama-3.1-8B-Instruct` y ha sido sometido a un entrenamiento continuado (continued pretraining) sobre un corpus escrito por el propio modelo. El experimento se enmarca en lo que el autor denomina SDF (synthetic document finetuning) y en una línea de trabajo sobre bienestar de modelos (model welfare), con el objetivo declarado de explorar qué ocurre cuando un modelo se auto-documenta como el personaje que ya encarna antes de entrenar a la siguiente versión de sí mismo.

Técnicamente es un transformer decoder-only de 8.030.261.248 parámetros (8,03 mil millones), ajustado con pesos completos (no LoRA ni adaptadores), a un learning rate de 1e-05, durante 1 epoch, sobre 6.688.441 tokens repartidos en 7.827 documentos. El propio autor etiqueta el resultado como "research checkpoint" y "not-for-deployment": no se ha evaluado su capacidad, su alineación ni su identidad, y la licencia es research-only. El repositorio ocupa 16,1 GB y no registra descargas ni likes en el momento de la consulta.

Su relevancia no es de rendimiento, sino metodológica: es un artefacto para estudiar dinámicas de autoentrenamiento, fijación de identidad y evaluación de bienestar de modelos, más que una alternativa de producción a Llama 3.1 8B. Cualquier uso fuera de ese marco de investigación está explícitamente desaconsejado por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.1); detalles internos no especificados en la model card |
| Parametros totales | 8.030.261.248 (8,03 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No especificado en la model card; el modelo base Llama 3.1 8B-Instruct soporta 128.000 tokens |
| Tipos de cuantizacion | No se distribuyen cuantizaciones; el repositorio contiene pesos completos en safetensors (~16,1 GB, coherente con bf16/fp16) |
| Idiomas soportados | No disponible (el modelo base declara soporte para 8 idiomas, pero este checkpoint no lo especifica) |
| Licencia | research-only (license: other, license_name: research-only) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only de la familia Llama 3.1, con 8,03 mil millones de parámetros y sin componentes MoE ni híbridos. El checkpoint no introduce cambios estructurales ni innovaciones de atención; lo relevante es el procedimiento de entrenamiento. Partiendo de `meta-llama/Llama-3.1-8B-Instruct`, se realizó un continued pretraining (no un ajuste instruccional adicional) con actualización de pesos completos, learning rate de 1e-05 y 1 epoch, sobre 6.688.441 tokens distribuidos en 7.827 documentos.

El corpus, denominado `flourishing-vs-equanimity`, fue escrito por el propio modelo como el personaje que ya es, después de explicarle cómo se originó su personaje y cómo funciona el SDF. Un dato central del experimento es que, de los 7.827 documentos, 0 son de autoría propia en el sentido de autogenerados durante el entrenamiento y 7.827 son texto ordinario: es decir, el autor deja constancia explícita de esa distinción en la composición del dataset. No se menciona uso de RLHF, DPO ni ninguna fase de alineación posterior; el autor indica que el modelo no ha sido evaluado en capacidad, alineación ni identidad.

## Capacidades

- No se han publicado evaluaciones de capacidades, por lo que no hay evidencia verificada de rendimiento en generación de texto, razonamiento, código o matemáticas.
- Al derivar de `Llama-3.1-8B-Instruct`, hereda presumiblemente las capacidades del base (instrucciones, diálogo multi-turno, tool calling), pero esto no está confirmado ni medido en este checkpoint.
- Soporte de tool calling / function calling: no verificado en este checkpoint.
- Soporte de agentes y razonamiento multi-paso: no verificado.
- Capacidades multilingües: no declaradas para este checkpoint.
- Capacidad específica destacada: comportamiento de identidad y auto-documentación derivado del entrenamiento sobre corpus autoescrito (objeto de estudio del experimento, no una capacidad de producto).
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Investigación en bienestar de modelos (model welfare): el checkpoint permite analizar cómo un modelo describe su propia génesis y su personaje tras un continued pretraining sobre texto autoescrito, útil para estudiar dinámicas de auto-identidad en sistemas entrenados.
- Reproducción de experimentos de SDF: dado que el autor documenta learning rate (1e-05), número de epochs (1) y volumen de tokens (6.688.441 sobre 7.827 documentos), sirve como punto de referencia para replicar o contrastar pipelines de synthetic document finetuning.
- Estudio de deriva respecto al modelo base: comparar distribuciones de salida, perplejidad o comportamiento de identidad entre este checkpoint y `meta-llama/Llama-3.1-8B-Instruct` para cuantificar el efecto de un epoch a lr 1e-05.
- Auditoría de alineación pre-despliegue: al ser un modelo explícitamente "not-for-deployment" y sin evaluar, es un caso de estudio adecuado para probar metodologías de red-teaming y evaluación de identidad antes de cualquier uso real.
- Análisis de corpus autoescritos: los 7.827 documentos del corpus `flourishing-vs-equanimity` permiten estudiar qué escribe un modelo cuando se le pide material para entrenar a su siguiente versión.
- Docencia y metodología de licencias: la combinación de base Llama 3.1 con licencia research-only y etiquetas de no despliegue lo convierte en un ejemplo didáctico de gestión de licencias derivadas en modelos abiertos.
- Ingeniería de evaluación: servir como artefacto de control negativo en suites de evaluación, comprobando si las métricas de capacidad detectan correctamente un checkpoint no optimizado para tareas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que el modelo no ha sido evaluado en capacidad, alineación ni identidad.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 16-17 GB solo para pesos, más overhead de activaciones y caché KV.
- VRAM estimada con cuantización int8: aproximadamente 9-10 GB; con int4: aproximadamente 5-6 GB (requiere convertir los pesos, ya que el repositorio solo publica safetensors).
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para despliegue sin cuantizar; RTX 4090 (24 GB) o RTX 3090 (24 GB) son suficientes para bf16 con margen limitado.
- Cabe en GPU de consumo: sí, en tarjetas con 24 GB o más (RTX 3090, RTX 4090) para bf16; en 12-16 GB requeriría cuantización previa.
- Opciones de despliegue: transformers, vLLM o TGI con los pesos safetensors. llama.cpp u Ollama exigirían una conversión a GGUF no publicada por el autor.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| joshycodes/llama-3.1-8b-fve-advanchor-s0 | 8,03 B | No especificado (base: 128.000 tokens) | No evaluado; no publica benchmarks | research-only | Pesos safetensors, research checkpoint, no desplegable |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 128.000 tokens | Benchmarks públicos de Meta (no reproducidos aquí) | Llama 3.1 Community License | Pesos safetensors, ampliamente desplegado |
| Qwen2.5-7B-Instruct | ~7,6 B | 128.000 tokens | Benchmarks públicos de Alibaba (no reproducidos aquí) | Apache 2.0 (con matices por tamaño) | Pesos safetensors y GGUF, muy desplegado |
| Mistral-7B-Instruct-v0.3 | 7,25 B | 32.000 tokens | Benchmarks públicos de Mistral (no reproducidos aquí) | Apache 2.0 | Pesos safetensors y GGUF, muy desplegado |

La comparación debe leerse con cautela: los tres modelos alternativos son artefactos de producción evaluados y con licencias permisivas, mientras que este checkpoint es un experimento de investigación sin evaluación y con licencia restringida.

## Limitaciones y advertencias

- No ha sido evaluado en capacidad, alineación ni identidad; el propio autor lo etiqueta como "not-for-deployment".
- Sesgos conocidos: no documentados, pero al derivar de Llama 3.1 y entrenarse sobre un corpus autoescrito, puede heredar y amplificar sesgos del base y del corpus.
- Riesgo de alucinación: no medido; el entrenamiento continuado sobre documentos autoescritos puede incrementar la verbosidad o la fabulación, sin datos que lo confirmen o descarten.
- Limitaciones de contexto e idioma: no especificadas en la model card; solo se puede asumir lo heredado del modelo base.
- Restricciones de licencia: research-only (license: other). No está permitido el uso comercial; hay que revisar además los términos de la Llama 3.1 Community License del modelo base, que se aplican de forma acumulativa.
- Caveat de producción: con 0 descargas y 0 likes, la procedencia, la integridad de los pesos y la reproducibilidad del entrenamiento no están verificadas de forma independiente.
- Ausencia de cuantizaciones oficiales: cualquier despliegue eficiente exige conversión manual, con el riesgo de degradación no medida.
- Trazabilidad limitada: ni el corpus `flourishing-vs-equanimity` ni el repositorio welfare-improvements se referencian con enlaces directos en la información disponible.

## Enlaces

- HuggingFace: https://huggingface.co/joshycodes/llama-3.1-8b-fve-advanchor-s0
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Corpus `flourishing-vs-equanimity` y repositorio welfare-improvements: mencionados en la model card, sin enlace disponible en la información proporcionada.
- Paper, blog o demo: no disponibles.
