# randmaru/LFM2.5-24B-A2B-mlx-mxfp4

## Resumen

`randmaru/LFM2.5-24B-A2B-mlx-mxfp4` es una cuantización comunitaria en formato MXFP4 del modelo `LiquidAI/LFM2.5-24B-A2B`, desarrollado por Liquid AI, preparada por el usuario randmaru para inferencia en Apple Silicon mediante MLX. No se trata de un modelo nuevo, sino de una redistribución de los pesos del modelo base comprimidos a 4 bits float con exponente compartido E8M0 (grupo de 32), lo que deja el artefacto en un único `model.safetensors` de 12,74 GB y ≈4,25 bits por peso. La relevancia práctica es que reduce el peso en un 6,1 % frente a la build MLX 4-bit oficial de Liquid AI y un 12,2 % frente al GGUF `Q4_K_M`, manteniendo el mismo runtime y el mismo hardware objetivo.

El modelo subyacente es un transformer híbrido de 24,0 B de parámetros totales con solo ≈2,45 B activos por token, gracias a una mezcla de expertos (MoE) de 64 expertos y enrutamiento top-4. Combina 30 bloques de convolución corta de doble puerta con 10 capas de atención GQA, y soporta una ventana de contexto de 131.072 tokens. Es un modelo únicamente de texto, orientado a razonamiento, que emite una cadena de pensamiento explícita antes de la respuesta final y cubre 16 idiomas, entre ellos el español.

Es relevante ahora porque permite ejecutar un modelo de 24 B con capacidades de razonamiento en un portátil Mac con memoria unificada moderada, sin depender de GPU NVIDIA ni de servicios en la nube. Conviene tener presente que se trata de una cuantización no oficial, sin aval de Liquid AI, con 0 descargas y 0 likes en el momento de la consulta y sin resultados de benchmarks publicados para esta build concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 40 capas (30 bloques de convolución corta de doble puerta + 10 capas de atención GQA; `layer_types` alterna `conv` con una capa `full_attention` cada cuarto bloque), MoE con 64 expertos por bloque y enrutamiento top-4, 2 capas densas |
| Parametros totales | 23.971.587.712 (≈24,0 B) |
| Parametros activos | ≈2,45 B por token |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | MXFP4: 4 bits float con exponente E8M0 compartido por grupo de 32 pesos; puertas del router MoE mantenidas en 8 bits (affine, grupo 64, escalas y sesgos en BF16); resultado ≈4,25 bits por peso |
| Idiomas soportados | 16: inglés, árabe, chino, francés, alemán, italiano, japonés, coreano, portugués, español, vietnamita, tailandés, indonesio, hindi, ruso y polaco |
| Licencia | `lfm1.0` (identificador `other`), heredada del modelo base `LiquidAI/LFM2.5-24B-A2B` |
| Formato de pesos | `safetensors` en un único archivo `model.safetensors` de 12,74 GB (11,86 GiB); pesos empaquetados en `U32` + escalas `U8`; sin shards |
| Vocabulario | 128.000 tokens, embeddings atados a la cabeza de salida |
| Tamano del repo | 12,8 GB (descarga total 12.756.149.125 bytes) |
| Biblioteca / runtime | `mlx` (`mlx-lm` 0.32.0, `mlx` 0.32.3) |
| Hardware objetivo | Apple Silicon (MLX / Metal) |
| Ajustes de generacion recomendados | `temperature: 0.1`, `top_k: 50`, `repetition_penalty: 1.05` |
| Modalidad | Solo texto (sin torre de visión) |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer híbrido con 40 capas: 30 bloques de convolución corta de doble puerta (`conv`) y 10 capas de atención con query grouping (GQA), intercaladas de modo que cada cuarto bloque es de atención completa. El `hidden_size` es 2048 y el `moe_intermediate_size` es 1536, con 2 capas densas. El componente MoE emplea 64 expertos por bloque con enrutamiento top-4 y sesgo de experto activado, lo que explica la relación entre los 24,0 B totales y los ≈2,45 B activos por token. El vocabulario es de 128.000 entradas con embeddings atados a la cabeza de salida, y la ventana de contexto alcanza los 131.072 tokens.

El modelo base está etiquetado como modelo de razonamiento de solo texto: genera una cadena de pensamiento explícita antes de la respuesta final. No se dispone en la información proporcionada de datos sobre el volumen de tokens de entrenamiento, la composición del corpus ni las etapas de alineación (RLHF, DPO u otras) del modelo original. La innovación técnica documentada en esta ficha corresponde a la cuantización: MXFP4 almacena 4 bits por peso más un exponente E8M0 compartido de 8 bits por cada grupo de 32 pesos (4 + 8/32 = 4,25 bpw), y deja las puertas del router en 8 bits con escalas y sesgos en BF16. Las normas y los pesos de convolución corta permanecen en BF16, y el `expert_bias` de los expertos MoE en F32 (9.728 bytes). La excepción de 8 bits para `feed_forward.gate` está escrita explícitamente en el `config.json` y corresponde al comportamiento estándar de `mlx_lm.utils.quantize_model` para esta arquitectura.

## Capacidades

- Generación de texto y razonamiento con cadena de pensamiento explícita antes de la respuesta final.
- Ventana de contexto de 131.072 tokens, adecuada para documentos extensos y conversaciones de muchos turnos.
- Cobertura multilingüe en 16 idiomas, incluido el español, con mezcla de lenguas latinas, germánicas, eslavas, semíticas y asiáticas.
- Eficiencia computacional propia de un MoE: ≈2,45 B de parámetros activos por token sobre 24,0 B totales.
- Ejecución local en Apple Silicon mediante MLX, sin necesidad de GPU dedicada.
- Capacidad de visión: no disponible (modelo solo texto).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso orquestado: no documentado; el modo de razonamiento interno (cadena de pensamiento) sí está descrito.
- Capacidades de audio: no disponibles.

## Casos de uso

- Asistente de razonamiento local en un Mac: el modelo emite una cadena de pensamiento antes de responder, lo que resulta útil para depuración de lógica, análisis de problemas y explicaciones paso a paso sin enviar datos a la nube.
- Análisis de documentos largos: con 131.072 tokens de contexto se pueden procesar informes anuales, contratos o expedientes completos en una sola pasada, pidiendo resúmenes estructurados o extracción de cláusulas.
- Atención al cliente multi-turno: la ventana de contexto permite mantener historiales largos de conversación con el cliente y el contexto de la cuenta sin truncar; los ajustes recomendados (`temperature: 0.1`) favorecen respuestas consistentes.
- Localización y traducción entre los 16 idiomas soportados: útil para equipos que necesitan traducir documentación técnica manteniendo terminología, con la ventaja de que el contenido no sale del dispositivo.
- Procesamiento de datos sensibles en local: sectores con requisitos de confidencialidad (legal, sanidad, administración) pueden ejecutar el modelo en un portátil sin conexión externa, ya que el artefacto completo ocupa 12,76 GB.
- Prototipado e investigación sobre cuantización: sirve como banco de pruebas para comparar MXFP4 frente a affine 4-bit y `Q4_K_M` en la misma máquina y con el mismo runtime, evaluando el impacto de la precisión en tareas de razonamiento.
- Generación de borradores técnicos y documentación: redacción de notas de ingeniería, resúmenes de reuniones y especificaciones a partir de material de entrada largo, aprovechando el contexto extendido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta cuantización no incluye métricas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación, y tampoco se aportan datos de latencia o throughput medidos.

## Requisitos de hardware

- VRAM / memoria unificada estimada: los pesos ocupan 12,74 GB (11,86 GiB) y la descarga completa 12,76 GB. Hay que sumar la caché KV del contexto utilizado, cifra no disponible en la documentación; con contexto largo el consumo crece de forma apreciable.
- Memoria mínima práctica: 16 GB de memoria unificada para contextos cortos; 24 GB o más para uso cómodo; 32-64 GB recomendables si se va a explotar la ventana de 131.072 tokens.
- GPU compatibles: exclusivamente Apple Silicon (MLX sobre Metal). No hay soporte CUDA ni ROCm en este repositorio; para NVIDIA habría que recurrir a la variante GGUF del modelo base.
- Cabe en GPU de consumo: sí, en equipos Apple con memoria unificada (familias M1, M2, M3 y M4). No aplica a GPU discretas de consumo tipo RTX 4090 con este formato.
- Opciones de despliegue: `mlx-lm` (API de Python, scripts de generación y servidor compatible con OpenAI), y cualquier herramienta que consuma pesos MLX. Para llama.cpp, Ollama o LM Studio es necesario usar el repositorio GGUF de Liquid AI, no este.
- Latencia y throughput estimados: no disponibles. Dependen del chip concreto, del ancho de banda de memoria y de la longitud de contexto; los ≈2,45 B de parámetros activos por token sitúan el coste de cómputo muy por debajo de un modelo denso de 24 B.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Peso | Licencia | Runtime |
|---|---|---|---|---|---|---|
| `randmaru/LFM2.5-24B-A2B-mlx-mxfp4` (esta ficha) | 24,0 B totales / ≈2,45 B activos | 131.072 | MXFP4, grupo 32, ≈4,25 bpw | 12,74 GB | `lfm1.0` | `mlx-lm` (Apple Silicon) |
| `LiquidAI/LFM2.5-24B-A2B-MLX-4bit` | 24,0 B totales / ≈2,45 B activos | 131.072 | Affine 4-bit, grupo 64, ≈4,53 bpw (embeddings en 6 bits, router en float32) | 13,57 GB | `lfm1.0` | `mlx-lm` (Apple Silicon) |
| `LiquidAI/LFM2.5-24B-A2B-GGUF` (Q4_K_M) | 24,0 B totales / ≈2,45 B activos | 131.072 | k-quant `Q4_K_M`, sub-bloques mixtos 4/6 bits, ≈4,85 bpw | 14,53 GB | `lfm1.0` | llama.cpp, LM Studio (Metal, CUDA, ROCm, CPU) |

Las tres opciones comparten pesos de partida, arquitectura y licencia; las diferencias se reducen al esquema de cuantización, el tamaño resultante y el runtime. Esta build es la más pequeña de las tres (0,83 GB menos que la MLX 4-bit oficial y 1,77 GB menos que el GGUF `Q4_K_M`), a cambio de un formato numérico distinto: MXFP4 es un formato float (valores E2M1 × 2^e), mientras que la cuantización affine es entera con un desplazamiento aprendido. La model card advierte explícitamente que un menor tamaño no implica automáticamente menor precisión, pero tampoco aporta evaluaciones que lo confirmen. No se dispone de datos de benchmarks comparativos entre las tres variantes.

## Limitaciones y advertencias

- Cuantización no oficial: el repositorio lo publica un tercero (randmaru) y no está afiliado ni respaldado por Liquid AI. Los pesos, la arquitectura y la licencia provienen del modelo base.
- Sin evaluaciones publicadas: no hay benchmarks de esta build, por lo que el impacto de MXFP4 en tareas de razonamiento frente a la versión MLX 4-bit oficial o al modelo sin cuantizar no está cuantificado.
- Diferencias numéricas frente a affine: MXFP4 usa un exponente compartido por grupo en lugar de escalas y sesgos por rango, con una precisión efectiva distinta. No es un intercambio equivalente al de la cuantización entera.
- Riesgo de alucinación: no hay datos específicos publicados para este modelo; como todo modelo generativo, puede producir afirmaciones incorrectas con aparente seguridad, especialmente en la cadena de pensamiento.
- Coste de tokens del modo razonamiento: al emitir pensamiento explícito antes de la respuesta, consume más tokens de salida que un modelo instruct convencional, lo que afecta a la latencia y al coste por consulta.
- Limitaciones de idioma: aunque se declaran 16 idiomas, no se aportan métricas por idioma; el rendimiento relativo en lenguas con menos presencia en el corpus de entrenamiento es desconocido.
- Restricciones de licencia: la licencia `lfm1.0` (identificador `other`) debe revisarse antes de cualquier uso comercial; esta ficha no puede confirmar los términos concretos de explotación.
- Dependencia de plataforma: solo funciona en Apple Silicon mediante MLX. No hay soporte CUDA, ROCm ni CPU en este repositorio.
- Madurez del artefacto: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado en octubre de 2026; no hay histórico de validación por parte de la comunidad.
- Modelo solo texto: no admite entrada de imágenes ni audio.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/randmaru/LFM2.5-24B-A2B-mlx-mxfp4
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B
- Build MLX 4-bit oficial de Liquid AI: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B-MLX-4bit
- Repositorio GGUF de Liquid AI: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B-GGUF
- Licencia (`LICENSE` en el repo): https://huggingface.co/randmaru/LFM2.5-24B-A2B-mlx-mxfp4/blob/main/LICENSE
- Referencia arXiv presente en los tags del repositorio: https://arxiv.org/abs/2511.23404 (la información proporcionada no incluye el título ni el contenido del artículo)
- Nota sobre la búsqueda web: los resultados devueltos por la búsqueda no guardan relación con el modelo ni con Liquid AI, por lo que no se incluyen como fuentes.
