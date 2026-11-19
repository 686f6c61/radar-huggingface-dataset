# lavendercomputing/Holo4-35B-A3B-GSQ-RCO-GGUF

## Resumen

Holo4-35B-A3B es un modelo de lenguaje y visión de tipo mixtura de expertos (MoE) desarrollado por Hcompany, orientado específicamente a la automatización de interacción con interfaces gráficas (Computer Use). Se construye sobre la base Qwen3.6-35B-A3B y cuenta con aproximadamente 34.660 millones de parámetros totales, de los cuales se activan 8 expertos enrutados por token, con una ventana de contexto de 262.144 tokens.

La ficha que nos ocupa, sin embargo, no es el modelo original, sino una compilación GGUF publicada por el usuario lavendercomputing bajo la etiqueta GSQ-RCO. Se trata de cuatro cuantizaciones mixtas por tensor (entre 2,33 y 3,51 bits por peso) más una cabeza de borrador MTP cuantizada a Q8_0 para decodificación especulativa, todas ellas destinadas a su uso con llama.cpp.

Su relevancia actual reside en que permite ejecutar un modelo MoE de 35B con capacidades de visión y control de escritorio en hardware de consumo, algo imposible con los pesos BF16 originales (unos 70 GB). Las cuantizaciones de 2 bits reducen el archivo a menos de 10,2 GiB, mientras que la variante IQ3_S de 14,18 GiB ofrece un equilibrio razonable entre calidad y requisitos de memoria.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE transformer con visión (familia `qwen35moe` en llama.cpp); 40 bloques × 256 expertos enrutados, 8 activos por token, hidden 2048, intermediate de experto 512 |
| Parámetros totales | 34.660.610.688 (~34,66B) |
| Parámetros activos | 8 de 256 expertos enrutados por token (los expertos enrutados representan ~93% de los parámetros) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | IQ2_XXS (2,33 bpw), IQ2_S (2,51 bpw), IQ3_XXS (3,01 bpw), IQ3_S (3,51 bpw); MTP draft head en Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); proyector de visión `mmproj.f16.gguf` en BF16 |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer de mixtura de expertos con 40 bloques, cada uno con 256 expertos enrutados de los que se activan 8 por token. La dimensión oculta es 2048 y la intermedia por experto es 512, con un vocabulario de 248.320 tokens. Incluye componentes SSM (parámetros `ssm_out` y alpha/beta) y un proyector de visión en BF16 que habilita la entrada de imágenes. La familia arquitectónica en llama.cpp es `qwen35moe`.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. El modelo base declara una cabeza MTP (multi-token prediction) en su configuración, pero los pesos BF16 del proveedor no incluyen tensores `mtp.*` utilizables; por ello, esta compilación incorpora una cabeza de borrador procedente de Qwen3.6-35B-A3B cuantizada a Q8_0 para habilitar decodificación especulativa en llama.cpp.

La cuantización GSQ-RCO es una receta mixta por tensor: los expertos enrutados absorben la mayor parte de la compresión mediante una escalera ponderada por bordes (bloques de borde con mayor precisión que los internos), mientras que los tensores fijos (embeddings, output, expertos compartidos, K/V, QKV, gate) reciben cuantizaciones de mayor precisión (Q8_0, Q6_K, Q5_K según el nivel). El router (`ffn_gate_inp`) permanece en f32 porque llama.cpp no lo cuantiza, y las normas y sesgos 1-D se mantienen en fp32.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno.
- Comprensión de imágenes y capturas de pantalla (pipeline `image-text-to-text`), orientada a la descripción y análisis de interfaces.
- Computer Use: interacción con entornos de escritorio y aplicaciones, con un resultado declarado de 30,9% en OSWorld 2.0 a un coste de 0,61 USD por tarea.
- Soporte de contexto largo de hasta 262.144 tokens, adecuado para historiales extensos de interacción o documentos largos.
- Decodificación especulativa mediante cabeza MTP externa (Q8_0) con `--spec-type draft-mtp`.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.

## Casos de uso

- Automatización de tareas de escritorio: el modelo puede analizar capturas de pantalla y decidir acciones sobre la interfaz, lo que permite construir agentes que rellenen formularios, naveguen por menús o ejecuten flujos repetitivos en aplicaciones de escritorio.
- Asistencia técnica remota: con visión y contexto de 262.144 tokens, puede procesar secuencias largas de capturas de pantalla junto con el historial de conversación para diagnosticar problemas de configuración en el equipo del usuario.
- Pruebas de regresión de interfaces: un agente basado en el modelo puede recorrer una aplicación, verificar que los elementos visuales aparecen donde se espera y detectar regresiones de UI sin scripts frágiles basados en selectores.
- Despliegue en estaciones de trabajo con GPU de consumo: las variantes IQ2 (9,42 y 10,15 GiB) permiten ejecutar un MoE de 35B con visión en equipos con 12-16 GB de VRAM, algo inviable con los pesos BF16.
- Generación asistida por decodificación especulativa en servidores CPU/GPU mixtos: el uso de la cabeza MTP Q8_0 eleva el throughput en prompts de código de ~6,2 a 9,45 t/s en las pruebas del autor, útil para entornos sin GPU dedicada potente.
- Investigación sobre cuantización extrema: los cuatro niveles publicados (2,33 a 3,51 bpw) permiten estudiar la degradación de calidad de un MoE con visión a distintos presupuestos de bits, con una escalera de expertos documentada.

## Benchmarks y rendimiento

| Métrica | Resultado | Contexto |
|---|---|---|
| OSWorld 2.0 | 30,9% | Modelo base Holo4-35B-A3B, coste 0,61 USD/tarea |
| Aceptación MTP (prompt factual) | 51,4% | Greedy, CPU, longitud media aceptada 2,52 |
| Aceptación MTP (prompt de código) | 95,9% | Greedy, CPU, longitud media aceptada 3,85 |
| Throughput con MTP (código) | 9,45 t/s | Frente a ~6,2 t/s sin borrador |

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) para estas cuantizaciones en la información disponible. Las pruebas realizadas por el autor se limitan a verificar carga y coherencia de salida en llama.cpp sobre CPU.

## Requisitos de hardware

- VRAM estimada para inferencia: IQ2_XXS ~9,42 GiB, IQ2_S ~10,15 GiB, IQ3_XXS ~12,16 GiB, IQ3_S ~14,18 GiB, más el proyector de visión BF16 y el overhead de contexto KV cache (K/V en Q8_0 en los niveles 3 bits; Q6_K en los de 2 bits).
- GPU recomendadas: A100 o H100 para despliegues de producción con contexto completo; RTX 4090 (24 GB) para IQ3_S con margen; RTX 4080/4070 Ti (16 GB) para IQ3_XXS o IQ2_S.
- Cabe en GPU de consumo: sí, las variantes IQ2 en tarjetas de 12 GB y las IQ3 en tarjetas de 16-24 GB, siempre que se ajuste el tamaño de contexto.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-mtmd-cli`, `llama-server`), con soporte de decodificación especulativa MTP mediante `-md` y `--spec-type draft-mtp`. No se mencionan otros motores (vLLM, TGI, Ollama) en la información disponible.
- Latencia y throughput: en CPU, el autor reporta ~6,2 t/s sin borrador y 9,45 t/s con MTP en un prompt de código. No hay datos de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| Holo4-35B-A3B (esta ficha, GGUF GSQ-RCO) | ~34,66B (MoE, 8 activos) | 262.144 | Computer Use con visión | Apache-2.0 | GGUF |
| Hcompany/Holo4-35B-A3B (BF16 original) | ~34,66B (MoE, 8 activos) | 262.144 | Computer Use con visión | Apache-2.0 | safetensors BF16 |
| Qwen/Qwen3.6-35B-A3B (base) | ~35B (MoE) | no disponible | Texto general | no disponible | safetensors |
| Hcompany Holo 27B (mencionado en la model card) | ~27B | no disponible | Computer Use | CC BY-NC (según la model card) | no disponible |

La comparativa se limita a los modelos citados en la información proporcionada; no se dispone de datos de rendimiento comparativo entre ellos más allá del resultado de OSWorld 2.0 del modelo base.

## Limitaciones y advertencias

- Las cuantizaciones de 2 bits (IQ2_XXS e IQ2_S) son agresivas por diseño; el propio autor recomienda IQ3 para trabajos sensibles a la calidad.
- Las pruebas de humo de visión no se repitieron en esta compilación; solo se verificó la inferencia de texto. El uso con imágenes requiere el `mmproj.f16.gguf` del repositorio del proveedor.
- La cabeza MTP incluida es la del modelo base Qwen3.6-35B-A3B, no una cabeza entrenada por Hcompany; es un borrador genérico para esta arquitectura, validado contra estos pesos pero no específico del dominio Computer Use.
- El router (`ffn_gate_inp`) permanece en f32 y no se cuantiza, lo que añade un coste fijo de memoria no reducible.
- No se dispone de información sobre sesgos, tasas de alucinación ni cobertura idiomática del modelo.
- La licencia Apache-2.0 permite uso comercial sin las restricciones CC BY-NC que afectan a otras variantes de la familia Holo (como la de 27B), pero conviene verificar la licencia del modelo base Qwen3.6-35B-A3B para el despliegue combinado.
- El archivo de borrador MTP no contiene `token_embd.weight` propio; debe cargarse con `-md` y no como modelo independiente. Es esperable un mensaje `borrow_shared_tensor` en el log.

## Enlaces

- Repositorio Hugging Face de esta cuantización: https://huggingface.co/lavendercomputing/Holo4-35B-A3B-GSQ-RCO-GGUF
- Modelo base Holo4-35B-A3B: https://huggingface.co/Hcompany/Holo4-35B-A3B
- GGUF del proveedor (incluye `mmproj.f16.gguf`): https://huggingface.co/Hcompany/Holo4-35B-A3B-GGUF
- Modelo base Qwen3.6-35B-A3B: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Matriz de importancia (mradermacher): https://huggingface.co/mradermacher/Holo4-35B-A3B-i1-GGUF/blob/main/Holo4-35B-A3B.imatrix.gguf
