# iamMrDuncan/Qwen3.8-27B-UD-IQ3_XXS-Q3Floor-GGUF

## Resumen

Qwen3.8-27B-UD-IQ3_XXS-Q3Floor-GGUF es una cuantización GGUF de 3 bits con suelo (floor) del modelo Qwen3.8-27B de Qwen (Alibaba), publicada por el usuario iamMrDuncan. No se trata de un modelo nuevo: es una re-cuantización quirúrgica del archivo UD-IQ3_XXS de Unsloth en la que se elevan a IQ3_XXS los 91 tensores GEMV que en el original quedaban por debajo de 3 bits (IQ2_S, IQ2_XXS, IQ2_XS, Q2_K, IQ1_S, IQ1_M), y se sustituye el tensor `token_embd` de Q2_K por un Q3_K copiado byte a byte del archivo UD-IQ4_XS de Unsloth. El resto de tensores y todos los metadatos GGUF permanecen intactos.

La motivación es específica de hardware: GPUs sin rutas rápidas para formatos de muy pocos bits, como la Tesla P100 (sm_60, sin DP4A), donde el coste de un GEMV depende de las instrucciones por peso y no de los bits por peso. Según el autor, elevar los tensores sub-3-bit hace que la decodificación sea aproximadamente un 4,5 % más rápida en su benchmark de 32K/65K y reduce la perplejidad de 9,25 a 8,70 en una comprobación corta de CPU de 1.024 tokens (no es una evaluación completa).

El modelo base Qwen3.8-27B cuenta con 27.320.697.856 parámetros (dato real de safetensors) y licencia Apache-2.0. El repositorio GGUF ocupa 11,8 GB y el archivo único pesa 11.758.422.944 bytes. Es un artefacto orientado a llama.cpp estándar y al motor tensorless del propio autor, no un modelo con benchmarks propios publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen3.8-27B; detalles no disponibles en la información proporcionada) |
| Parametros totales | 27.320.697.856 (modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el autor prueba con prompts de 32K y 65K) |
| Tipos de cuantizacion | GGUF IQ3_XXS con suelo de 3 bits; `token_embd` en Q3_K; tipos estándar de llama.cpp |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (archivo único `Qwen3.8-27B-UD-IQ3_XXS-Q3Floor.gguf`, 11.758.422.944 bytes, sha256 `4b4d6a39dca07c915472b3fdf70267385f6e6f3f38befd5223c9a1ac272cecd0`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.8-27B, un transformer de 27.320.697.856 parámetros desarrollado por el equipo Qwen de Alibaba; la información proporcionada no detalla capas, dimensiones, atención ni composición del dataset de entrenamiento. Tampoco se documentan aquí fases de RLHF, DPO ni datos de post-entrenamiento.

La contribución técnica de este repositorio es exclusivamente de cuantización. Partiendo del BF16 GGUF de Unsloth y de su importance matrix (`imatrix_unsloth.gguf`), el autor re-cuantiza con `llama-quantize` estándar los 91 tensores GEMV que en UD-IQ3_XXS estaban en IQ2_S (35), IQ2_XXS (24), IQ2_XS (12), Q2_K (9), IQ1_S (8) e IQ1_M (3), que representan aproximadamente el 27 % de los pesos de decodificación. Todos pasan a IQ3_XXS. El tensor `token_embd` pasa de Q2_K a Q3_K, copiado byte a byte desde el UD-IQ4_XS de Unsloth. No se modifica ningún otro tensor ni metadato, incluido `general.name`, que sigue siendo el de Unsloth. Al emplear solo tipos estándar de llama.cpp, el archivo carga en llama.cpp de serie.

## Capacidades

- Generación de texto conversacional: el repositorio está etiquetado como `conversational` y deriva de un modelo de chat.
- Razonamiento y conocimiento general: heredados del modelo base Qwen3.8-27B (no se detallan capacidades específicas en la información proporcionada).
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que puede servirse a través de infraestructura compatible con la API de Hugging Face.
- Inferencia en llama.cpp estándar: al usar únicamente tipos de cuantización nativos, funciona con el binario stock.
- Ejecución en el motor tensorless: objetivo de lanzamiento ajustado para Tesla P100, invocable con `tensorless run iamMrDuncan/Qwen3.8-27B-UD-IQ3_XXS-Q3Floor-GGUF`.
- Tool calling, agentes, visión, audio, modo thinking y capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en Tesla P100: el caso de uso central del artefacto. En GPUs sm_60 sin DP4A, este archivo decodifica más rápido que el UD-IQ3_XXS original (aproximadamente un 4,5 % en el benchmark del autor) porque el coste por GEMV depende de instrucciones por peso, no de bits por peso.
- Servicio de chat en hardware legacy: con 11,8 GB de pesos, el modelo cabe en una P100 de 16 GB dejando espacio para caché KV (el autor usa q4_0), lo que permite montar un endpoint conversacional en infraestructura de segunda mano.
- Inferencia de contexto largo en una sola GPU: el autor reporta decodificación estable con prompts de 32K y 65K (24,5 y 22,9 tok/s respectivamente), útil para resumir documentos extensos o analizar repositorios de código en un único dispositivo.
- Sustitución directa en pipelines llama.cpp existentes: al usar solo tipos estándar y conservar los metadatos de Unsloth, se puede intercambiar por el archivo original sin cambiar el motor ni la configuración.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir el impacto de un suelo de 3 bits frente a mezclas agresivas de 2 y 1 bit en perplejidad y velocidad sobre el mismo modelo base.
- Prototipado con presupuesto de VRAM ajustado: 11,8 GB permiten probar un modelo de 27B en GPUs consumer de 16 GB o en configuraciones con offload parcial a CPU, a costa de la pérdida de calidad inherente a 3 bits.

## Benchmarks y rendimiento

Datos publicados por el autor sobre una Tesla P100 con el motor tensorless (fuente de engine-v0.1.0, decodificación greedy, caché KV q4_0):

| Medida | Resultado |
|---|---|
| Decodificación, 256 tokens tras prompt de ~600 tokens | 26,3 tok/s |
| Decodificación, 1.024 tokens tras prompt de 32K | 24,5 tok/s |
| Decodificación, 1.024 tokens tras prompt de 65K | 22,9 tok/s |
| Mejora de velocidad frente a UD-IQ3_XXS original (32K/65K) | ~4,5 % |
| Perplejidad (CPU, 1.024 tokens, comprobación corta) | 8,70 frente a 9,25 del original |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ni para este archivo ni para el modelo base en este repositorio.

## Requisitos de hardware

- VRAM para los pesos: 11,8 GB (tamaño exacto del archivo GGUF); con caché KV q4_0 y contexto largo hay que añadir varios GB adicionales.
- GPU objetivo declarada: NVIDIA Tesla P100 (sm_60, 16 GB), donde el autor ha validado el motor tensorless.
- GPU consumer: cabe en tarjetas de 16 GB (RTX 4080, RTX 4060 Ti 16 GB, RTX 5070 Ti) y en 24 GB (RTX 3090, RTX 4090) con margen para contexto; en 12 GB requiere offload parcial a CPU.
- Despliegue: llama.cpp stock (todos los tipos son nativos), motor tensorless del autor y cualquier frontend compatible con GGUF (Ollama, llama-cpp-python) siempre que soporte IQ3_XXS.
- Throughput medido: 22,9-26,3 tok/s en una P100 según longitud de contexto; no hay datos de latencia ni throughput para otras GPU.
- No se dispone de estimaciones de VRAM para cuantizaciones alternativas de este mismo artefacto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Notas |
|---|---|---|---|---|---|
| iamMrDuncan/Qwen3.8-27B-UD-IQ3_XXS-Q3Floor-GGUF | 27,3B | no disponible | IQ3_XXS con suelo de 3 bits, 11,8 GB | Apache-2.0 | Suelo de 3 bits; optimizado para P100 |
| unsloth/Qwen3.8-27B-GGUF (UD-IQ3_XXS) | 27,3B | no disponible | Mixta con tensores de 1-2 bits | Apache-2.0 | Base de este archivo; 91 tensores por debajo de 3 bits |
| unsloth/Qwen3.8-27B-GGUF (UD-IQ4_XS) | 27,3B | no disponible | IQ4_XS | Apache-2.0 | Mayor calidad y tamaño; fuente del `token_embd` Q3_K |
| Qwen/Qwen3.8-27B (BF16) | 27,3B | no disponible | BF16 safetensors | Apache-2.0 | Referencia de calidad; requiere ~55 GB en BF16 |

Los datos de contexto y de rendimiento de los modelos comparables no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- La cuantización a 3 bits introduce pérdida de calidad frente al BF16; la única medición disponible es una perplejidad de 8,70 sobre 1.024 tokens en CPU, que el propio autor califica de comprobación corta y no de evaluación completa.
- El autor no publica benchmarks de tareas (razonamiento, código, matemáticas); no hay evidencia de rendimiento downstream para este archivo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y procede de un autor individual, no de Unsloth ni de Qwen; no hay validación comunitaria independiente.
- Los metadatos GGUF siguen siendo los de Unsloth, incluido `general.name`; herramientas que identifiquen el modelo por metadatos lo reportarán como el archivo original.
- La mejora de velocidad (~4,5 %) está medida exclusivamente en Tesla P100 con el motor tensorless; en GPUs con DP4A o rutas rápidas para formatos de 2 bits el resultado puede no reproducirse o invertirse.
- No se dispone de información sobre sesgos, idiomas soportados ni comportamiento multilingüe del modelo base en esta ficha.
- Licencia Apache-2.0 heredada de Qwen y Unsloth: permite uso comercial, pero conviene verificar los términos del modelo base Qwen3.8-27B por si imponen condiciones adicionales de atribución o uso aceptable.
- Riesgo de alucinación inherente al modelo base, no cuantificado en la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/iamMrDuncan/Qwen3.8-27B-UD-IQ3_XXS-Q3Floor-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Cuantizaciones de Unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Organización Unsloth: https://huggingface.co/unsloth
- Motor tensorless: https://github.com/iammrduncan/tensorless
