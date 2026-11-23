# prayanksai/sarvam-105b-1711-mlx-q4

## Resumen

Sarvam-105B-1711 MLX 4-bit es una conversión comunitaria del modelo Sarvam-105B-1711 (versión BF16) al formato MLX con cuantización afín de 4 bits, publicada por el usuario prayanksai. El modelo original lo desarrolla Sarvam AI y es un Mixture-of-Experts (MoE) de aproximadamente 105.000 millones de parámetros totales, con unos 10.300 millones de parámetros activos por token. Esta conversión no reentrena el modelo: solo cambia el formato de almacenamiento y la ruta de inferencia para que pueda ejecutarse en Macs con Apple Silicon mediante MLX-LM.

La relevancia de este checkpoint es práctica: permite ejecutar un MoE de 105B en hardware de consumo de Apple con memoria unificada, algo imposible con los pesos BF16 originales. Para ello emplea cuantización de 4 bits con grupo de 64, reparte los pesos en 12 shards y ocupa aproximadamente 55,60 GiB. La arquitectura combina atención de tipo MLA (Multi-head Latent Attention) con un MoE de 128 expertos enrutados más 1 compartido, con enrutamiento top-8, y una longitud de contexto configurada de 163.840 tokens.

El modelo está orientado a generación de texto conversacional y multilingüe, con etiquetas que indican soporte para lenguas índicas y modo de razonamiento (thinking) configurable. La licencia es Apache 2.0, heredada del modelo base. No se han publicado resultados de benchmarks sobre esta conversión, y el propio autor advierte que la cuantización a 4 bits puede degradar la precisión respecto al modelo BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención MLA (Multi-head Latent Attention) |
| Parametros totales | 106.031.767.424 (~106B) |
| Parametros activos | ~10,3B por token |
| Longitud de contexto | 163.840 tokens (configurada) |
| Tipos de cuantizacion | Afín de 4 bits, grupo de 64 (este checkpoint); el base está en BF16 |
| Idiomas soportados | No disponible de forma explícita; etiquetado como multilingüe con foco en lenguas índicas |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors MLX (12 shards) |

## Arquitectura y entrenamiento

La arquitectura es un transformer con Mixture-of-Experts: 128 expertos enrutados más 1 experto compartido, con enrutamiento top-8 por token. Emplea atención de tipo MLA, que comprime las claves y valores en un espacio latente para reducir el coste de memoria del KV cache. El modelo tiene 106.031.767.424 parámetros totales, de los cuales aproximadamente 10,3B se activan por token, lo que reduce el coste computacional por paso frente a un modelo denso del mismo tamaño.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en esta ficha; esos detalles corresponden a la model card oficial del modelo base, que no se ha proporcionado. La conversión aquí descrita se generó con `mlx_lm.convert` aplicando cuantización afín de 4 bits con grupo de 64, y no modifica los pesos más allá de la cuantización. La innovación técnica relevante de este checkpoint es la implementación del tipo de modelo `sarvam_mla` en MLX-LM, propuesta en el PR #2097 del repositorio ml-explore/mlx-lm.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento con modo "thinking" configurable mediante `chat-template-config` (`enable_thinking`).
- Capacidades multilingües, con etiquetado específico para lenguas índicas.
- Arquitectura MoE con activación eficiente (~10,3B parámetros activos por token).
- Soporte de contexto largo de hasta 163.840 tokens configurados (sujeto a memoria disponible).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explícita en la información proporcionada.
- Capacidades de visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional local en Mac: el modelo puede mantener diálogos multi-turno en un Mac con Apple Silicon y 96 GiB o más de memoria unificada, usando `mlx_lm.chat` con un KV cache acotado (por ejemplo, `--max-kv-size 4096`) para controlar el consumo.
- Procesamiento de documentos largos en local: con hasta 163.840 tokens de contexto configurado, es adecuado para resumir o extraer información de documentos extensos, siempre que la memoria permita alojar el KV cache correspondiente.
- Aplicaciones multilingües con foco en lenguas índicas: útil para traducción, generación y atención al cliente en esos idiomas, aprovechando el etiquetado multilingüe del modelo base.
- Prototipado e investigación en entornos sin GPU: permite experimentar con un MoE de 105B en hardware Apple, sin depender de clústeres con A100/H100.
- Generación de texto con razonamiento controlado: el flag `enable_thinking` permite alternar entre respuestas directas y cadenas de razonamiento según la tarea.
- Evaluación comparativa de cuantización: sirve para medir la degradación de calidad de 4 bits frente al BF16 original en tareas concretas antes de decidir un despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se ha ejecutado una suite completa de benchmarks sobre esta conversión y que la cuantización a 4 bits puede reducir la precisión respecto al modelo BF16 de origen.

## Requisitos de hardware

- VRAM/memoria unificada: aproximadamente 56 GiB para los archivos del modelo; se recomiendan 96 GiB o más de memoria unificada. Con 64 GiB el margen es muy reducido tras macOS, pesos y KV cache, y el funcionamiento no está garantizado.
- Almacenamiento: al menos 65–70 GiB libres para descarga y caché.
- GPU: Apple Silicon con entorno Python nativo arm64. No aplica a GPU NVIDIA en este formato; para A100/H100 habría que usar el checkpoint BF16 original con otro runtime.
- GPU de consumo: no cabe en GPUs de consumo tipo RTX 4090 (24 GB) en este formato; el objetivo es memoria unificada de Mac.
- Despliegue: MLX-LM (`mlx_lm.chat`, `mlx_lm.generate`). Requiere la rama del autor (`git+https://github.com/prayanks/mlx-lm.git@add-sarvam-mla`) hasta que se publique el soporte de `sarvam_mla` en MLX-LM upstream. Las versiones estándar de MLX-LM sin soporte `sarvam_mla` no pueden cargar el checkpoint.
- Latencia y throughput: no disponibles. El autor señala que reducir `--prefill-step-size` baja el pico de memoria en el procesamiento del prompt a costa de velocidad.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Formato | Licencia |
|---|---|---|---|---|---|
| Sarvam-105B-1711 MLX 4-bit (este) | ~106B | ~10,3B | 163.840 | MLX safetensors 4-bit | Apache 2.0 |
| Sarvam-105B-1711 BF16 (base) | ~106B | ~10,3B | 163.840 | Safetensors BF16 | Apache 2.0 |
| Alternativas MoE de tamaño similar | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento comparativo ni de modelos alternativos concretos en la información proporcionada.

## Limitaciones y advertencias

- La cuantización a 4 bits puede degradar la precisión frente al modelo BF16; hay que validar con prompts representativos antes de usar en producción.
- No se han ejecutado benchmarks completos sobre esta conversión.
- El contexto máximo configurado (163.840 tokens) no implica que quepa en memoria; hay que empezar con un KV cache pequeño.
- Requiere una rama no publicada de MLX-LM; las versiones estándar no cargan el checkpoint.
- Con 64 GiB de memoria unificada el funcionamiento no está garantizado.
- Sesgos y riesgos de alucinación del modelo base no documentados en la información disponible; se remite a la model card oficial.
- Uso comercial permitido por Apache 2.0, pero conviene revisar la licencia y la model card del modelo base antes de redistribuir o desplegar.
- Es una conversión comunitaria sin relación oficial con Sarvam AI; no hay garantías de soporte.

## Enlaces

- Checkpoint en Hugging Face: https://huggingface.co/prayanksai/sarvam-105b-1711-mlx-q4
- Modelo base BF16: https://huggingface.co/sarvamai/sarvam-105b-1711-bf16
- Model card oficial de Sarvam-105B-1711: https://huggingface.co/sarvamai/sarvam-105b-1711
- Organización Sarvam AI en Hugging Face: https://huggingface.co/sarvamai
- Repositorio MLX-LM: https://github.com/ml-explore/mlx-lm
- PR de soporte `sarvam_mla` en MLX-LM: https://github.com/ml-explore/mlx-lm/pull/2097
- Rama del autor con soporte `sarvam_mla`: https://github.com/prayanks/mlx-lm/tree/add-sarvam-mla
