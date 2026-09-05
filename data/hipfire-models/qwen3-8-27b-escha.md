# hipfire-models/qwen3.8-27b-escha

## Resumen

El modelo `hipfire-models/qwen3.8-27b-escha` es una cuantización de 2 bits mediante códigos trellis del modelo base `EschaLabs/Qwen3.8-27B-Escha-W2`, que a su vez es una versión cuantizada de Qwen3.8-27B. Ha sido desarrollado por `hipfire-models` y empaquetado específicamente para el runtime `hipfire`, orientado a GPUs AMD RDNA3/RDNA4. El problema que resuelve es la ejecución de un modelo de 27.000 millones de parámetros en hardware con memoria limitada, aprovechando una codificación trellis que se decodifica directamente dentro del kernel GEMV, sin necesidad de un paso de decodificación en la carga ni de una copia des-cuantizada en memoria.

La arquitectura del modelo base es densa (no Mixture of Experts) e incorpora componentes GatedDeltaNet, como se desprende de la presencia de proyecciones `in_proj_a` e `in_proj_b` en F16. El repositorio ofrece tres variantes (`-xt`, sin sufijo y `-pro`) que comparten los códigos trellis de 2 bits pero difieren en cómo se almacenan los tensores densos (embeddings, lm_head, biases y proyecciones GatedDeltaNet). El tamaño de los pesos oscila entre 10,45 GB y 11,16 GB según la variante. No se especifica la longitud de contexto ni los idiomas soportados en la información disponible, por lo que estos datos se indican como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Densa (no MoE), con componentes GatedDeltaNet; base Qwen3.8-27B |
| Parámetros totales | 27B (según denominación del modelo) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 2-bit trellis (Escha-W2) para las proyecciones codificadas; tensores densos en MQ6 (build default), Q8_0 (`-pro`) o MQ4v2 (`-xt`) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | hipfire (empaquetado con códigos trellis almacenados y decodificados en el GEMV) |

Nota: La model card indica que los tres builds contienen pesos codificados byte-idénticos; solo cambia el almacenamiento de los tensores densos. No debe confundirse con bit-widths: `qwen3.8-27b.mq4` es un modelo genuinamente de 4 bits de 15,66 GB.

## Arquitectura y entrenamiento

La información disponible no incluye detalles sobre el proceso de entrenamiento del modelo base, el tamaño del dataset ni si hubo fases de RLHF o DPO. La documentación se centra en la cuantización y el empaquetado para hipfire. La innovación técnica principal es la codificación trellis de 2 bits: los códigos se almacenan de forma literal y se decodifican dentro del GEMV durante la inferencia, lo que elimina el paso de decodificación en la carga y evita la re-cuantización de las proyecciones codificadas. Esto permite una residencia de 2 bits sin necesidad de mantener una copia des-cuantizada en memoria.

El modelo base Qwen3.8-27B es denso, a diferencia del modelo hermano `qwen3.6-35b-a3b-escha`, que es MoE. En el caso del 27B, las proyecciones `gate_proj` tienen un factor K=2 mientras que `up_proj` y `down_proj` tienen K=3, lo que impide compartir una llamada de kernel entre ellas. Las proyecciones GatedDeltaNet (`in_proj_a` e `in_proj_b`) se mantienen en F16 en los tres builds. La conversión se realizó con `hipfire-quantize --format escha` desde `EschaLabs/Qwen3.8-27B-Escha-W2`, pasando el payload codificado byte a byte y repacando únicamente los tensores densos.

## Capacidades

La documentación proporcionada no incluye una lista explícita de capacidades del modelo. Al ser una cuantización de un modelo de la familia Qwen, es probable que herede capacidades generales de generación de texto, razonamiento y código, pero no se han facilitado resultados que lo confirmen. Lo único que se puede afirmar con seguridad es que el modelo es capaz de ejecutar inferencia en el runtime hipfire y que ha sido validado en términos de perplejidad y KLD sobre un fragmento de wikitext-2. No se menciona soporte de tool calling, agentes, visión ni audio en la información disponible.

## Casos de uso

- Inferencia local en portátiles y estaciones de trabajo con APUs AMD (por ejemplo, Strix Halo, gfx1151): el tamaño reducido de 10,77 GB y la velocidad de decodificación de 12,1 tokens/s permiten ejecutar un modelo de 27B en sistemas con memoria unificada limitada.
- Prototipado de aplicaciones de IA en hardware AMD sin necesidad de GPUs NVIDIA: al estar empaquetado para hipfire y validado en RDNA3/RDNA4, es adecuado para entornos de desarrollo que no disponen de CUDA.
- Investigación en compresión de modelos y cuantización extrema: la técnica Escha-W2 y las tres variantes de almacenamiento denso ofrecen un caso de estudio para comparar perplejidad, KLD y velocidad de decodificación.
- Evaluación de kernels GEMV en arquitecturas AMD: los datos de prefill y decode (119/12,1 tokens/s) y el análisis de la penalización aritmética de 7 operaciones por peso sirven para caracterizar el rendimiento del códec trellis.
- Despliegue de asistentes conversacionales en entornos de borde: con una ventana de contexto razonable (no especificada) y una latencia de decode aceptable, puede utilizarse para chatbots locales en dispositivos con GPU AMD.
- Generación de código en local: el modelo base pertenece a la familia Qwen, conocida por su rendimiento en tareas de programación; aunque no se aportan benchmarks de HumanEval, el modelo puede emplearse en flujos de trabajo de asistencia al desarrollo en máquinas AMD.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los datos de rendimiento se limitan a métricas de perplejidad (PPL) y divergencia KLD sobre un fragmento fijo de wikitext-2 (1020 tokens evaluados, con KV sin cuantizar), así como a medidas de prefill y decode en un prompt de 2k tokens en modo greedy. La siguiente tabla resume los resultados de los tres builds:

| Build | Tamaño | Prefill (tok/s) | Decode (tok/s) | PPL | KLD vs `-pro` |
|---|---|---|---|---|---|
| `qwen3.8-27b.escha-xt` | 10,45 GB | 122 | 12,3 | 9,7242 | 0,008943 |
| `qwen3.8-27b.escha` (default) | 10,77 GB | 119 | 12,1 | 9,6753 | 0,000534 |
| `qwen3.8-27b.escha-pro` | 11,16 GB | 113 | 10,8 | 9,6486 | 0,000000 |

En comparación con las cuantizaciones MQ del mismo modelo, medidas en el mismo equipo y con el mismo harness:

| Build | Tamaño | PPL | Decode (tok/s) |
|---|---|---|---|
| `qwen3.8-27b.mq6` | 21,75 GB | 9,0042 | 9,5 |
| `qwen3.8-27b.escha-pro` | 11,16 GB | 9,6486 | 10,8 |
| `qwen3.8-27b.escha` | 10,77 GB | 9,6753 | 12,1 |
| `qwen3.8-27b.escha-xt` | 10,45 GB | 9,7242 | 12,3 |
| `qwen3.8-27b.mq3` | 12,62 GB | 10,0643 | 15,7 |

Todos los builds escha superan a `mq3` en calidad siendo más pequeños, y superan a `mq6` en velocidad y tamaño con un incremento de perplejidad del 7%. Frente a `mq3`, se intercambia tokens/s por calidad por byte.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan entre 10,45 GB y 11,16 GB. No se especifica un mínimo oficial, pero se requiere memoria adicional para la caché KV y los buffers de inferencia; en la práctica, se recomienda un sistema con al menos 16 GB de memoria unificada o VRAM.
- GPU recomendadas: AMD RDNA3/RDNA4, con validación específica en gfx1151 (Strix Halo, 40 CU, ~209-220 GB/s de ancho de banda alcanzable). No se mencionan requisitos para GPUs NVIDIA.
- Compatibilidad con GPU de consumo: no se proporciona información explícita, pero el modelo está diseñado para hardware AMD y se ha medido en una APU Strix Halo, lo que sugiere que puede ejecutarse en equipos con memoria unificada.
- Opciones de despliegue: runtime hipfire con soporte escha (`nw_escha_w2` o posterior). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: para la build default, 119 tokens/s de prefill y 12,1 tokens/s de decode en un prompt de 2k tokens. La build `-xt` alcanza 122/12,3 tokens/s y la `-pro` 113/10,8 tokens/s.

## Comparativa con modelos similares

La comparativa más relevante es con las cuantizaciones MQ del mismo modelo base, ya que comparten arquitectura y harness de medición. La tabla de la sección anterior ya recoge esta comparación. En resumen:

| Modelo | Tamaño | PPL | Decode (tok/s) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `qwen3.8-27b.mq6` | 21,75 GB | 9,0042 | 9,5 | Apache-2.0 | HuggingFace |
| `qwen3.8-27b.escha` | 10,77 GB | 9,6753 | 12,1 | Apache-2.0 | HuggingFace |
| `qwen3.8-27b.mq3` | 12,62 GB | 10,0643 | 15,7 | Apache-2.0 | HuggingFace |

También existe un modelo hermano MoE, `qwen3.6-35b-a3b-escha`, que no es directamente comparable por su arquitectura y tamaño. No se dispone de información sobre otros modelos de la competencia.

## Limitaciones y advertencias

- La cuantización de 2 bits degrada la calidad: la perplejidad es un 7% superior a la de la cuantización MQ6 del mismo modelo, lo que puede manifestarse en errores de razonamiento o alucinaciones más frecuentes.
- La velocidad de decodificación es menor que la de las cuantizaciones MQ3/MQ6 a pesar de ser más pequeño, debido al coste de decodificación de los códigos trellis dentro del GEMV (7 operaciones aritméticas adicionales por peso).
- Los datos de rendimiento se han medido únicamente en gfx1151 con una versión concreta de hipfire (`bb77ff87d`); los resultados pueden variar en otros hardware o versiones.
- No se han publicado evaluaciones exhaustivas de capacidades (razonamiento, matemáticas, código, tool calling), por lo que no se puede garantizar su comportamiento en tareas complejas.
- La información sobre idiomas, longitud de contexto y detalles de entrenamiento no está disponible.
- El despliegue requiere el runtime hipfire con soporte escha, lo que limita las opciones de integración en comparación con formatos más extendidos como GGUF o safetensors.
- La licencia Apache-2.0 del repositorio permite uso comercial, pero la licencia del modelo base Qwen3.8-27B no se especifica en la documentación; es necesario verificarla antes de un uso comercial.

## Enlaces

- Repositorio del modelo: https://huggingface.co/hipfire-models/qwen3.8-27b-escha
- Modelo base original: https://huggingface.co/EschaLabs/Qwen3.8-27B-Escha-W2
- Modelo no escha del mismo slice: https://huggingface.co/hipfire-models/qwen3.8-27b
- Repositorio de hipfire: https://github.com/warpfront/hipfire
