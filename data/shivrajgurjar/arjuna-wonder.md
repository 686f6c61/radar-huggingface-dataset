# shivrajgurjar/Arjuna-Wonder

## Resumen

Arjuna-Wonder es un modelo de generación de texto publicado en Hugging Face por el usuario `shivrajgurjar`, presentado como una destilación matemática y compresión extrema del supuesto modelo base `Qwen/Qwen3.8-27B` (26,90 B de parámetros, 64 capas híbridas). El autor describe el proceso como una aplicación del marco SMICOP (Spectral-Manifold Isometry & Cascaded Oblique Projector), que reduce el backbone BF16 de 53,80 GB a 1,40 GB repartidos en 16 shards modulares, con una similitud coseno media de 0,999913 frente al profesor en conjuntos de test no vistos.

El problema que aborda es el de la compresión agresiva de modelos grandes manteniendo la fidelidad de representación, un área donde las técnicas habituales (GPTQ, AWQ, GGUF) suelen degradar la calidad por debajo de ratios de 4x. La propuesta del autor combina descomposición de Kronecker por bloques, bases ortonormalizadas de Stiefel, cuantización Lloyd-Max gaussiana y retículos de Gosset F4/D4 para alcanzar un ratio declarado de 36,5x en el backbone.

Es relevante ahora por su enfoque poco convencional y por publicarse bajo licencia Apache 2.0, pero conviene tratarlo con cautela: el repositorio tiene 0 descargas y 0 likes, no incluye benchmarks de capacidades (MMLU, HumanEval, GSM8K) y las cifras de compresión no cuadran con el tamaño real del repositorio (6,2 GB) ni con el recuento real de parámetros en safetensors (2.773.331.008, es decir, ~2,77 B).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 64 capas, de las cuales 48 son Gated DeltaNet (linear attention) y 16 son Gated Full-Attention (sincronización); destilado del profesor Qwen3.8-27B |
| Parámetros totales | 2.773.331.008 (~2,77 B) según los safetensors del repositorio; el profesor declarado tiene 26,90 B |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Cuantización propietaria SMICOP de 8 bits (tag `8-bit`), con componentes de 4 bits en el plegado de acompañamiento y cuantizador Lloyd-Max de 31 niveles más retículo Gosset de 64 estados; no se distribuyen variantes GGUF, AWQ, GPTQ ni bitsandbytes |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` en 16 shards (uno por macro-zona de 4 capas, `model-zone-XX-of-16.safetensors`), más embeddings y cabeza; requiere `trust_remote_code=True` y código de descompresión propio |

## Arquitectura y entrenamiento

La arquitectura de destino es la del profesor declarado: un transformer híbrido de 64 capas que alterna 48 capas de Gated DeltaNet (atención lineal con estado recurrente) y 16 capas de Gated Full-Attention que actúan como sincronización global. Sobre esa estructura, Arjuna-Wonder no reentrena el modelo: aplica un pipeline de compresión en seis pilares. El primero es una descomposición multiplicativa de Kronecker por bloques de 64x64 con rango 20, obtenida mediante reordenamiento de Van Loan-Pitsianis sobre la matriz de pesos reordenada a 4096 x (MN/4096). El segundo construye una base cuantizada ortonormalizada exacta sobre la variedad de Stiefel mediante QR, de modo que el compilador y el descompresor obtienen la misma base a precisión de máquina FP32.

Los pilares restantes combinan una factorización ortogonal LDLQ por bloques de 64 con Cholesky superior invertido sobre activaciones de calibración proyectadas al ortogonal del subespacio principal, un cuantizador Lloyd-Max gaussiano centrado en cero de 31 niveles junto a un retículo Gosset de 64 estados (sistema de raíces F4 más capa dual), el plegado de los residuos en una matriz compañera de 8/4 bits con binarización por filas y columnas, y un pulidor izquierdo estrictamente desacoplado del subespacio principal. El ajuste se valida sobre una partición de calibración 40/8.

No se documenta el volumen de tokens de entrenamiento ni composición del dataset, ya que no hay entrenamiento desde cero: la única "supervisión" son activaciones de calibración. Tampoco se detallan fases de RLHF o DPO posteriores. La innovación declarada es puramente de compresión: 53,80 GB BF16 a 1,40 GB de backbone (89,77 MB por shard de 4 capas), con error relativo L2 de 0,01283 y pico de similitud coseno de 0,999983 en conjuntos no vistos.

## Capacidades

- Generación de texto autoregresiva y conversación multi-turno, heredadas del profesor según el autor (tag `conversational`).
- Razonamiento con cadena de pensamiento explícita: la model card anuncia modo `<think>...</think>` sin límite de longitud declarado.
- Razonamiento matemático y de dominio científico, presumiblemente transferido del profesor Qwen3.8-27B; no hay evaluación publicada que lo confirme.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas (el campo de idiomas del repositorio está vacío).
- Capacidades de visión o audio: no disponibles; el pipeline es exclusivamente `text-generation`.
- Capacidad especial: compresión extrema con reconstrucción casi isométrica, pensada para servir como banco de pruebas de técnicas de destilación de pesos.

## Casos de uso

- Investigación en compresión de modelos: reproducir el pipeline SMICOP y comparar la fidelidad de reconstrucción (coseno 0,999913, L2 relativo 0,01283) frente a GPTQ, AWQ o GGUF de 4 bits sobre el mismo profesor, usando los 16 shards como unidad de análisis por capas.
- Prototipado en GPUs de consumo: con ~2,77 B de parámetros y 6,2 GB de repositorio, el modelo cabe en tarjetas de 8-12 GB si el cargador no materializa el backbone completo en BF16, lo que permite experimentar con razonamiento de cadena larga sin acceso a clúster.
- Demos y cuadernos docentes en Kaggle o Google Colab: el autor incluye un quickstart con `snapshot_download` y carga vía `AutoModelForCausalLM` con `trust_remote_code=True`, adecuado para sesiones formativas sobre cuantización y variedades de Stiefel.
- Fine-tuning ligero con LoRA sobre el modelo comprimido: al ser Apache 2.0 y pesar 6,2 GB, se puede adaptar a dominios concretos (documentación técnica, atención interna) en una única GPU de 24 GB, validando después la degradación respecto a la versión sin adaptar.
- Estudio de la relación entre similitud de pesos y calidad downstream: utilizar Arjuna-Wonder y su profesor para medir si un coseno de 0,999913 se traduce en paridad de perplejidad y exactitud en tareas de razonamiento, una pregunta abierta en el campo.
- Evaluación comparativa de robustez ante alucinación en modelos altamente comprimidos: ejecutar el mismo conjunto de prompts contra profesor y destilado y cuantificar la divergencia, con especial atención a contextos largos donde la atención lineal DeltaNet puede degradarse.
- Despliegue experimental de bajo coste en entornos con `transformers` y `trust_remote_code` habilitado, siempre en sandbox: útil para equipos que ya aceptan ejecutar código remoto del Hub y quieren un modelo pequeño con etiqueta de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de capacidades (MMLU, HumanEval, GSM8K, ARC, etc.) en la información disponible. Las únicas métricas publicadas son de fidelidad de reconstrucción de pesos frente al profesor, no de calidad de tarea:

| Métrica (64 capas, conjuntos no vistos) | Arjuna-Wonder | Profesor Qwen3.8-27B (referencia) |
|---|---|---|
| Similitud coseno media | 0,999913 | 1,000000 |
| Similitud coseno máxima | 0,999983 | 1,000000 |
| Error relativo L2 medio | 0,01283 | 0,00000 |
| Error relativo L2 mínimo | 0,00565 | 0,00000 |
| Tamaño del backbone | 1,40 GB (16 shards de 89,77 MB) | 51,26 GB |
| Tamaño total declarado | 2,66 GB (con embeddings y cabeza) | 53,80 GB |
| Ratio de compresión del backbone | 36,5x | 1,00x |

Comparación interna publicada por el autor frente a su propia variante previa:

| Variante | Precisión / formato | Backbone | Repo total | Coseno no visto | L2 relativo | Ratio |
|---|---|---|---|---|---|---|
| Qwen3.8-27B | BF16, 18 shards | 51,26 GB | 53,80 GB | 1,000000 | 0,00000 | 1,00x |
| Arjuna-V1 | Group-64 INT4 ZP+8 | 12,95 GB | 14,24 GB | 0,999184 | 0,04820 | 3,78x |
| Arjuna-Wonder | SMICOP 6 pilares | 1,40 GB | 2,66 GB | 0,999913 | 0,01283 | 36,5x |

Advertencia: estas cifras miden reconstrucción de matrices de pesos, no capacidad del modelo. Además, el repositorio real ocupa 6,2 GB y los safetensors suman 2,77 B de parámetros, cifras que no coinciden con los 2,66 GB totales declarados en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia (estimación propia a partir del recuento real de parámetros, no dato del autor): ~5,6 GB de pesos en BF16, ~2,8 GB en 8 bits y ~1,5 GB en 4 bits, más caché KV y overhead del cargador.
- VRAM práctica recomendada: 8-12 GB para uso conversacional con contextos moderados, asumiendo que la descompresión no materializa el backbone completo.
- Riesgo de pico de memoria no documentado: si el cargador personalizado (`trust_remote_code`) reconstruye las matrices del profesor en BF16 antes de comprimirlas en memoria, el pico podría acercarse a los ~51-54 GB del modelo base. No hay información disponible sobre este comportamiento; conviene medirlo antes de desplegar.
- GPU recomendadas: RTX 4090 (24 GB), RTX 4080/3090 (16-24 GB) y A10G/L4 (24 GB) como opción holgada; A100/H100 solo si se necesita servir muchas réplicas en paralelo.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB y RTX 4070 en adelante, sujeto a verificación del pico de memoria.
- Opciones de despliegue: exclusivamente `transformers` con `trust_remote_code=True`. No se documenta soporte para vLLM, TGI, llama.cpp, Ollama ni LM Studio, y no hay pesos GGUF publicados.
- Latencia y throughput: no disponibles. Al usar 48 capas de atención lineal DeltaNet, el coste por token en contextos largos debería crecer de forma más contenida que en atención cuadrática completa, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tamaño de pesos | Licencia | Fidelidad vs profesor | Disponibilidad |
|---|---|---|---|---|---|---|
| Arjuna-Wonder | 2,77 B (reales en safetensors); profesor de 26,90 B | No disponible | 6,2 GB de repositorio (backbone declarado de 1,40 GB) | Apache 2.0 | Coseno 0,999913; L2 rel. 0,01283 | 0 descargas, 0 likes; requiere código remoto |
| Qwen3.8-27B (profesor declarado) | 26,90 B | No disponible | 53,80 GB en BF16 | No indicada en la información | Referencia (1,000000) | Modelo base citado, no verificado en la búsqueda |
| Arjuna-V1 (misma familia) | No disponible | No disponible | 14,24 GB de repositorio (backbone 12,95 GB) | No indicada en la información | Coseno 0,999184; L2 rel. 0,04820 | Variante previa del mismo autor |
| Alternativas de ~3 B densos (Llama 3.2 3B, Qwen2.5 3B, Phi-3.5-mini) | ~3-4 B | 128 K en varios casos | 6-8 GB en BF16, ~2 GB en Q4 | Licencias comunitarias o MIT/Apache según modelo | No comparable (no son destilaciones de un profesor de 27 B) | Ampliamente soportadas en vLLM, llama.cpp y Ollama |

No se dispone de datos verificables de benchmarks que permitan comparar capacidades con esas alternativas; la comparación con modelos de ~3 B solo es válida en términos de huella de memoria, no de calidad.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al derivar de un profesor no identificable con certeza, los sesgos del modelo base se heredan sin que el autor los analice.
- Riesgo de alucinación: no evaluado. La model card anuncia razonamiento `<think>` "ilimitado", pero no hay mediciones de veracidad, y la compresión de pesos puede alterar hechos poco frecuentes aunque la similitud coseno global sea alta.
- Idiomas: el campo de idiomas está vacío. No se puede asumir soporte multilingüe sin probarlo, pese a que el tokenizador proceda del profesor.
- Longitud de contexto: no declarada. Las 48 capas DeltaNet y las 16 de atención completa condicionan el comportamiento en contextos largos, pero se desconoce el máximo soportado tras la compresión.
- Ejecución de código remoto: el modelo exige `trust_remote_code=True`, lo que implica ejecutar código del autor en tu entorno. Es un riesgo de seguridad en producción y debe auditarse o aislarse.
- Discrepancias numéricas: los safetensors suman 2.773.331.008 parámetros y el repositorio ocupa 6,2 GB, frente a los 26,90 B y 2,66 GB declarados. No se explica en la información disponible si el cargador reconstruye el modelo completo o solo un subconjunto.
- Ausencia de validación externa: 0 descargas, 0 likes y ninguna referencia independiente. Los resultados de la model card son autoinformados y no reproducidos por terceros.
- Ecosistema limitado: sin GGUF, sin kernels para vLLM/TGI y sin integración en Ollama. El despliegue en producción requeriría trabajo de ingeniería propio.
- Terminología no estándar: los "6 pilares Nobel" y etiquetas como "Five-Nines" son mercadotecnia del autor; no hay publicación revisada por pares que respalde el marco SMICOP.
- Licencia: Apache 2.0 permite uso comercial, pero se desconoce la licencia efectiva del modelo base citado, lo que puede afectar a la redistribución.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/shivrajgurjar/Arjuna-Wonder
- Modelo base declarado: https://huggingface.co/Qwen/Qwen3.8-27B
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
- Paper, blog técnico, repositorio de código o demo: no disponibles en la información proporcionada; la búsqueda web no devolvió enlaces relevantes al modelo.
