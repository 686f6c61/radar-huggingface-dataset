# sady4850/gemma-4-E4B-it-MLX-4bit-GPTQ

## Resumen

Este repositorio contiene una cuantización de 4 bits del modelo multimodal `google/gemma-4-E4B-it`, publicada por el usuario sady4850 y pensada exclusivamente para el ecosistema MLX de Apple Silicon. No se trata de un modelo entrenado desde cero, sino de una re-cuantización: parte del layout de bits por módulo definido por Unsloth en `unsloth/gemma-4-E4B-it-UD-MLX-4bit` y modifica únicamente el método de redondeo de las capas MLP, sustituyendo el redondeo al más cercano (RTN) por GPTQ con realimentación de error estilo LDLQ. El resultado conserva exactamente el mismo tamaño (5,959 bits por peso), el mismo formato de fichero y la misma velocidad de decodificación, pero reduce la divergencia respecto al modelo en bf16.

El problema que aborda es concreto y medible: en una cuantización de 4 bits, el redondeo RTN de los pesos MLP introduce un error que se propaga y degrada la distribución de probabilidad de salida. El autor demuestra con KL divergencia de vocabulario completo que el redondeo GPTQ reduce el KLD medio un 34,2 % en `calibration_v3` y un 42,9 % en UltraChat, y disminuye los cambios de top-1 entre un 19,6 % y un 23,0 %. Es, por tanto, una mejora de fidelidad de cuantización, no una mejora de capacidades del modelo.

El modelo base tiene 7.996.156.490 parámetros totales según los safetensors del repositorio (unos 8.000 millones) y pipeline `image-text-to-text`, con torres de visión y audio conservadas en bf16. El repositorio ocupa 6,6 GB y se distribuye con licencia declarada apache-2.0, aunque el enlace de licencia apunta al acuerdo de Gemma 4 de Google. Su relevancia es acotada pero real para quien quiera ejecutar el modelo base en un Mac con la mínima pérdida de calidad posible, y como caso de estudio metodológico de cuantización GPTQ sobre MLX.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) del modelo base `google/gemma-4-E4B-it`; detalles internos no disponibles en la información proporcionada |
| Parametros totales | 7.996.156.490 (~8,0 B) según safetensors |
| Parametros activos | no disponible (la nomenclatura "E4B" sugiere parámetros efectivos, pero no se confirma en la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuantización mixta por módulo: 8 bits en `self_attn` (q/k/v/o), `per_layer_input_gate` y `per_layer_projection`; 6 bits en `embed_tokens` y `embed_tokens_per_layer`; MLP por capas a 6, 5 y 4 bits; bf16 en `per_layer_model_projection`, torres de visión y audio y normas. Media de 5,959 bits por peso |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 declarada en los metadatos, con `license_link` al acuerdo de Gemma 4 de Google (`ai.google.dev/gemma/docs/gemma_4_license`) |
| Formato de pesos | safetensors cuantizados en formato MLX (afín, grupo de 64), biblioteca `mlx` |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo: cuantiza el checkpoint `google/gemma-4-E4B-it` en bf16. La arquitectura subyacente es la del modelo base de Google, del que la información disponible no detalla número de capas, dimensión oculta, mecanismo de atención ni composición del dataset de entrenamiento. Lo que sí se documenta con precisión es el esquema de cuantización: se replica bit a bit el layout de `unsloth/gemma-4-E4B-it-UD-MLX-4bit`, es decir, una asignación heterogénea de bits por módulo que concentra la precisión en atención (8 bits), embeddings (6 bits) y determinadas capas MLP, y baja a 4 bits en el resto de lineales MLP. Todos los tensores no MLP (incluidas las torres de visión y audio, y las normas) permanecen en bf16.

La innovación técnica está en el proceso de redondeo. Los 126 lineales MLP (gate/up/down, 378 tensores) se re-redondean con GPTQ: realimentación de error con factorización de Cholesky estilo LDLQ, bloques de 128 columnas y un 1 % de damping. Para cada grupo de 64 pesos, la escala y el sesgo provienen de `mx.quantize` aplicado a los pesos ya actualizados por el error, y se redondean a bf16 antes de elegir los códigos, de modo que los valores almacenados coinciden exactamente con los que consume el kernel. Los módulos de 8 bits y los embeddings mantienen RTN. La calibración emplea 256 fragmentos de 512 tokens (131K tokens en total): la mitad conversaciones de `train_sft` de UltraChat pasadas por la plantilla de chat y la mitad del fichero público `calibration_data_v5_rc`. Las matrices de Hessian se recogen del modelo en bf16, no de forma secuencial, y el proceso completo requiere aproximadamente una hora en un M1 Pro de 32 GB usando numpy. Todos los ficheros de configuración, tokenizer y plantilla de chat son idénticos byte a byte a los del repositorio de Unsloth, por lo que funciona como reemplazo directo.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base instruct (`-it`).
- Entrada imagen-texto: pipeline `image-text-to-text`, con torre de visión conservada en bf16, invocable mediante `mlx-vlm`.
- Torre de audio presente en el checkpoint y mantenida en bf16 según el layout de bits documentado; no se especifica qué tareas de audio están soportadas.
- Inferencia local en Apple Silicon mediante `mlx-lm` (ruta de texto) y `mlx-vlm` (ruta multimodal).
- Compatibilidad drop-in con el layout, kernels y plantilla de chat de `unsloth/gemma-4-E4B-it-UD-MLX-4bit`.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.
- Cobertura multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Asistente multimodal local en Mac: el modelo puede recibir una imagen y una pregunta en el mismo turno mediante `mlx-vlm`, lo que permite montar un asistente de escritorio que no envía datos a ningún servicio externo, algo relevante para material médico, legal o interno de empresa.
- Etiquetado y descripción de imágenes por lotes: con 6,6 GB de checkpoint y 43,7 tok/s de decodificación en un M1 Pro, es viable procesar carpetas de imágenes en un portátil para generar descripciones o metadatos sin depender de una GPU dedicada.
- Investigación en compresión de modelos: el repositorio incluye scripts (`check_rtn.py`, `quantize_save.py`, `eval_ci.py`), los datos de calibración y los resultados por fragmento en `eval_results.json`, lo que lo convierte en una base reproducible para comparar GPTQ frente a RTN en MLX con KL divergencia de vocabulario completo.
- Prototipado de producto sobre Apple Silicon: al mantener el mismo formato y velocidad que el checkpoint de Unsloth, se puede sustituir este último por el cuantizado con GPTQ en una app ya existente para obtener respuestas más fieles al modelo en bf16 sin tocar código ni reajustar latencias.
- Chat de texto offline en portátil: la ruta `mlx-lm` permite ejecutar un modelo de ~8.000 millones de parámetros en memoria unificada de un solo equipo, útil para entornos con conectividad restringida o requisitos de soberanía de datos.
- Docencia y formación técnica: sirve para explicar de forma práctica la diferencia entre redondeo al más cercano y GPTQ, con métricas publicadas (KLD medio, top-1 flips, percentil 99 de KLD) y un procedimiento de reproducción completo.

## Benchmarks y rendimiento

Los datos publicados no son benchmarks de capacidad (MMLU, HumanEval, GSM8K), sino métricas de fidelidad de cuantización frente al modelo en bf16: KL divergencia de vocabulario completo por token, tasa de cambios de top-1 y percentil 99 de KLD, sobre fragmentos de 512 tokens con BOS al inicio, intervalo de confianza del 95 % por bootstrap emparejado con 10.000 remuestreos.

| Conjunto de evaluación | Métrica | unsloth UD-MLX-4bit | Este repositorio | Cambio (IC 95 %) |
|---|---|---|---|---|
| calibration_v3 (129 fragmentos, 66K tokens) | KLD medio | 0,0774 | 0,0509 | -34,2 % (-36,3; -32,0) |
| calibration_v3 | Top-1 flips | 11,22 % | 9,02 % | -19,6 % (-21,8; -17,2) |
| calibration_v3 | KLD p99 | 0,687 | 0,504 | no disponible |
| calibration_v3 | Perplejidad (bf16: 38,76) | 38,90 | 38,64 | no disponible |
| UltraChat test_sft (256 fragmentos, 131K tokens) | KLD medio | 0,0756 | 0,0431 | -42,9 % (-45,1; -40,5) |
| UltraChat test_sft | Top-1 flips | 10,31 % | 7,94 % | -23,0 % (-24,6; -21,4) |
| UltraChat test_sft | KLD p99 | 0,828 | 0,450 | no disponible |
| UltraChat test_sft | Perplejidad (bf16: 19,68) | 19,28 | 19,32 | no disponible |

El KLD medio es inferior en el 98 % de los fragmentos de `calibration_v3` y en el 99 % de los de chat. El propio autor advierte que el conjunto de chat comparte dataset con los datos de calibración (split de entrenamiento frente a test), por lo que `calibration_v3` es la cifra más justa; además, `calibration_v3` no se usó para calibrar. Velocidad de decodificación medida en Unsloth Studio 2026.10.7 sobre M1 Pro: 43,7 tok/s, idéntica en ambos ficheros porque el layout y los kernels son los mismos. No se han publicado resultados de benchmarks de capacidad en la información disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada: el checkpoint pesa 6,6 GB en disco; a 5,959 bits por peso sobre 7.996 millones de parámetros, los pesos ocupan unos 5,96 GB, por lo que se necesita un margen de memoria unificada adicional para el contexto, el caché KV y las activaciones en bf16.
- Plataforma: exclusivamente Apple Silicon. La biblioteca es `mlx` y el formato de pesos es safetensors cuantizado afín de MLX; no es cargable directamente en CUDA ni en GPUs de NVIDIA o AMD.
- Hardware validado: el autor reporta ejecución y evaluación en un M1 Pro de 32 GB, con pico de memoria controlado porque el script de evaluación mantiene los logits en bf16 de solo 16 fragmentos a la vez y nunca tiene simultáneamente el modelo bf16 y el cuantizado.
- Cabe en equipos de consumo Apple: sí, en cualquier Mac con memoria unificada suficiente para 6,6 GB de pesos más contexto; un equipo de 16 GB es el mínimo razonable, y 32 GB es lo recomendado para trabajar con el modelo bf16 de referencia en paralelo.
- GPU recomendadas: no aplica; no hay soporte de A100, H100 ni RTX 4090 documentado para este formato.
- Opciones de despliegue: `mlx-lm` (versión probada 0.32.2) para texto, `mlx-vlm` (versión probada 0.7.8) para imagen-texto, y Unsloth Studio 2026.10.7 cargando la ruta local. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 43,7 tok/s de decodificación en un M1 Pro; no se publican cifras de prefill, TTFT ni throughput por lotes.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | KLD medio (v3 / chat) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este repositorio (`sady4850/gemma-4-E4B-it-MLX-4bit-GPTQ`) | 7,996 B | no disponible | Mixta 4-8 bits + bf16, GPTQ en MLP, 5,959 bpw | 0,0509 / 0,0431 | apache-2.0 declarada (enlace a licencia Gemma 4) | MLX, safetensors |
| `unsloth/gemma-4-E4B-it-UD-MLX-4bit` | 7,996 B (mismo layout) | no disponible | Mixta 4-8 bits + bf16, RTN, 5,959 bpw | 0,0774 / 0,0756 | no disponible en la información proporcionada | MLX, safetensors |
| `google/gemma-4-E4B-it` (bf16) | 7,996 B | no disponible | bf16 | 0 (referencia) | acuerdo de licencia Gemma 4 | MLX y otros formatos |

Frente al checkpoint de Unsloth, la comparación es directa: mismo tamaño, mismo formato, misma velocidad y mismos ficheros de configuración, con una reducción de KLD del 34,2 % en `calibration_v3` y del 42,9 % en UltraChat. Frente al modelo base en bf16, la comparación es de fidelidad: la perplejidad pasa de 38,76 a 38,64 en `calibration_v3` y de 19,68 a 19,32 en UltraChat, es decir, la cuantización no penaliza la perplejidad en estos conjuntos. No se dispone de comparaciones con otras familias de modelos del mismo tamaño en la información proporcionada.

## Limitaciones y advertencias

- Solo se ha medido calidad de texto. Las torres de visión y audio permanecen intactas en bf16 y el chat con imágenes únicamente se comprobó de forma puntual, sin evaluación sistemática.
- La evaluación cubre 197K tokens repartidos en dos conjuntos. El conjunto de KLD propio de Unsloth no es público, por lo que las cifras pueden diferir si se mide con él.
- Se mantiene exactamente la misma asignación de bits que el checkpoint de Unsloth, sin reasignar precisión por módulo; el autor señala que GPTQ y una asignación mejor serían mejoras acumulables, pero no se han combinado aquí.
- GPTQ se aplica solo a los 126 lineales MLP; atención y embeddings siguen con redondeo al más cercano, de modo que el margen de mejora en esos módulos queda sin explotar.
- Licencia potencialmente ambigua: los metadatos declaran apache-2.0, pero el `license_link` de la model card apunta al acuerdo de Gemma 4 de Google. Antes de un uso comercial conviene verificar qué términos se aplican efectivamente al modelo base y a este derivado.
- Riesgo de alucinación y sesgos: no se documentan evaluaciones de sesgo, toxicidad ni tasas de alucinación para este checkpoint ni para el modelo base en la información disponible.
- Idiomas soportados: no disponibles. No hay lista de lenguas ni evaluación por idioma, lo que impide garantizar calidad en castellano más allá de lo que ofrezca el modelo base.
- Longitud de contexto: no disponible, lo que impide planificar cargas de documentos largos con una cifra fiable.
- Restricción de plataforma: al ser un formato MLX, no es desplegable en infraestructura con GPU NVIDIA, lo que excluye la mayoría de servidores de producción convencionales.
- Madurez y trazabilidad: el repositorio tiene 0 descargas y 0 likes, y lo publica un tercero no afiliado a Google, por lo que no hay garantía de mantenimiento ni de soporte.
- El proceso de calibración mezcla un conjunto privado de referencia con UltraChat, y el conjunto de chat de evaluación comparte origen con parte de los datos de calibración, lo que puede inflar la mejora reportada en esa fila.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sady4850/gemma-4-E4B-it-MLX-4bit-GPTQ
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Checkpoint de referencia de Unsloth (mismo layout, RTN): https://huggingface.co/unsloth/gemma-4-E4B-it-UD-MLX-4bit
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Datos de calibración `calibration_data_v5_rc`: https://gist.github.com/tristandruyen/9e207a95c7d75ddf37525d353e00659c
- Datos de evaluación `calibration_v3`: https://gist.githubusercontent.com/bartowski1182/eb213dccb3571f863da82e99418f81e8/raw/calibration_datav3.txt
- Biblioteca mlx-lm: https://github.com/ml-explore/mlx-lm
- Biblioteca mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Papers, blogs y demos adicionales: no disponible en la información proporcionada.
