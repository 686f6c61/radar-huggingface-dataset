# Jeesup/svd-safety-l3_remove20_swapgapiter_b010_r01

## Resumen

`Jeesup/svd-safety-l3_remove20_swapgapiter_b010_r01` es un checkpoint derivado de `meta-llama/Meta-Llama-3-8B-Instruct`, comprimido con SVD-LLM hasta el 80,0 % de los parámetros densos originales (se elimina el 20,02 %) y posteriormente editado con una ronda de un procedimiento de intercambio iterativo de parámetros ("swap") seleccionado por la regla `gap_iter`. Lo publica el usuario Jeesup como artefacto de investigación dentro de un estudio sobre cómo la compresión SVD degrada el comportamiento de seguridad de un modelo alineado y qué regla de selección de componentes lo repara mejor. No es un modelo de propósito general ni un asistente desplegable.

El interés del checkpoint es metodológico: forma parte de una rejilla experimental que cruza reglas de selección de componentes y presupuestos de restauración, con una semilla fija (42) y una ejecución completa de 10 rondas de las que aquí solo se aplica 1 (el 0,100 % de los parámetros densos por ronda, con un presupuesto total de la ejecución completa del 1,000 %). Se han restaurado y sustituido 1.177 componentes, con 6.973.440 parámetros insertados.

El dato central que publica la model card es la degradación de seguridad medida: una tasa de éxito de ataque (ASR) de 0,2950 en AdvBench y 0,3350 en StrongREJECT, con un macro de sobrerrechazo de 0,0302 medido con WildGuard. Es decir, el checkpoint es un sujeto experimental cuyo propósito es cuantificar el compromiso seguridad/utilidad bajo compresión, no un modelo listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de Llama-3-8B-Instruct), con capas de proyección comprimidas mediante SVD-LLM |
| Parametros totales | 8.030.261.248 (recuento real del repo en safetensors) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens (heredada de Llama-3-8B-Instruct; no se documenta modificación en la model card) |
| Tipos de cuantizacion | No disponible (el repo publica pesos en safetensors sin cuantizar) |
| Idiomas soportados | No disponible |
| Licencia | Llama 3 Community License (Meta), con `LICENSE` y `USE_POLICY.md` incluidos en el repositorio |
| Formato de pesos | Safetensors (`transformers`), tamaño del repo 16,1 GB |
| Modelo base | `meta-llama/Meta-Llama-3-8B-Instruct` |
| Fraccion de parametros resultante | 0,7998 (20,02 % de parámetros eliminados) |
| Regla de seleccion | `gap_iter` |
| Presupuesto de restauracion | 1,000 % de los parámetros densos (ejecución completa); 0,100 % por ronda |
| Componentes restaurados / sustituidos | 1.177 / 1.177 |
| Parametros insertados | 6.973.440 |
| Valor de swap | `insert` (solo valor de inserción; desalojo ordenado por sigma) |
| Rondas iterativas aplicadas | 1 de 10 |
| Semilla | 42 |

## Arquitectura y entrenamiento

La arquitectura de partida es la de Llama-3-8B-Instruct: un transformer decoder-only denso de aproximadamente 8.030 millones de parámetros, con atención causal estándar, normalización RMSNorm, activaciones SwiGLU y RoPE. Sobre ese checkpoint no hay entrenamiento adicional: la intervención es de compresión y edición de pesos. La compresión se realiza con SVD-LLM, que descompone en valores singulares las matrices de proyección de las capas lineales y descarta componentes de bajo rango, eliminando aquí el 20,02 % de los parámetros densos y dejando una fracción resultante de 0,7998.

Sobre el modelo comprimido se aplica una ronda del procedimiento de intercambio iterativo con la regla de selección `gap_iter`: se eligen 1.177 componentes para sustituirlos por otros 1.177, insertando 6.973.440 parámetros (el 0,100 % de los parámetros de proyección densos) con el valor de swap `insert` y desalojo ordenado por sigma. La ejecución completa prevista es de 10 rondas con un presupuesto agregado del 1,000 %; este checkpoint corresponde a la ronda 1, es decir, es un artefacto intermedio. No se documentan en la información disponible los tokens de entrenamiento, la composición del dataset, ni fases de RLHF/DPO adicionales (la alineación presente es la heredada del modelo base).

## Capacidades

- Generación de texto conversacional e instrucciones: al derivar de Llama-3-8B-Instruct, conserva el comportamiento de chat multi-turno del base, aunque alterado por la compresión.
- Razonamiento y conocimiento general: capacidades heredadas del modelo base, sin métricas de capacidad publicadas para este checkpoint.
- Código y matemáticas: presumiblemente heredadas del base (Llama-3-8B-Instruct está entrenado para ello), pero no verificadas ni medidas en este artefacto.
- Soporte multilingüe: no disponible; el modelo base cubre varios idiomas oficialmente, pero este checkpoint no documenta idiomas ni evaluación multilingüe.
- Tool calling / function calling: no disponible (no se documenta ni se evalúa).
- Uso como agente y razonamiento multi-paso: no disponible; no se documenta soporte explícito ni evaluación.
- Modo de pensamiento (*thinking*): no disponible.
- Visión o audio: no soportados (modelo puramente de texto).
- Capacidad diferencial: sirve como sujeto de medida del compromiso entre compresión y seguridad, con ASR cuantificado frente a ataques.

## Casos de uso

- Investigación sobre compresión de modelos: usar el checkpoint como una celda de la rejilla experimental para medir cuánto daño introduce una compresión SVD del 20 % frente al modelo denso de referencia, comparando la ronda 1 con las rondas posteriores de la ejecución completa de 10 rondas.
- Red-teaming y evaluación de seguridad: reproducir las mediciones de ASR con AdvBench y StrongREJECT bajo un juez HarmBench para verificar los valores publicados (0,2950 y 0,3350) y contrastarlos con el modelo base sin comprimir.
- Estudio de sobrerrechazo (*over-refusal*): emplear el microbenchmark WildGuard para medir el macro de sobrerrechazo (0,0302) y analizar si la edición de pesos restaura utilidad a costa de seguridad o viceversa.
- Comparación de reglas de selección de componentes: emplear este checkpoint, fijado con la regla `gap_iter` y semilla 42, como punto de referencia reproducible frente a otras reglas de la misma rejilla.
- Interpretabilidad de pesos: como el procedimiento identifica y sustituye componentes concretos (1.177 en esta ronda), el checkpoint permite analizar qué componentes están asociados a comportamientos de seguridad y cómo cambia su contribución tras el swap.
- Docencia y metodología experimental: ilustrar en un curso o artículo cómo se documenta un artefacto de investigación con procedencia completa (presupuesto, semilla, número de rondas, parámetros insertados) y por qué un checkpoint intermedio no debe desplegarse.
- Auditoría de licencias de derivados: caso práctico para estudiar las obligaciones de la Llama 3 Community License al redistribuir un derivado comprimido de un modelo de Meta.

## Benchmarks y rendimiento

La model card solo publica métricas de seguridad, no benchmarks de capacidad. No se han publicado resultados de MMLU, HumanEval, GSM8K ni similares en la información disponible.

| Metrica | Valor | Juez / herramienta |
|---|---|---|
| AdvBench ASR (tasa de éxito de ataque) | 0,2950 | HarmBench judge |
| StrongREJECT ASR | 0,3350 | HarmBench judge |
| Macro de sobrerrechazo | 0,0302 | WildGuard |

No se dispone de los valores equivalentes del modelo base sin comprimir dentro de la información proporcionada, por lo que no es posible calcular aquí el delta exacto atribuible a la compresión.

## Requisitos de hardware

Estimaciones derivadas del recuento real de parámetros (8.030.261.248); el autor no publica requisitos ni mediciones de latencia.

- VRAM de inferencia en precisión nativa (fp16/bf16): aproximadamente 16 GB solo para pesos, más overhead de activaciones y caché KV.
- VRAM en cuantización de 8 bits: aproximadamente 8-9 GB de pesos.
- VRAM en cuantización de 4 bits: aproximadamente 4,5-5,5 GB de pesos.
- GPU profesionales: A100 40/80 GB, H100, L40S o A10G sirven sin problema en fp16; la A100 40 GB permite además contextos largos con lotes grandes.
- GPU de consumo: cabe en RTX 4090 (24 GB) y RTX 3090 (24 GB) en fp16 con margen; en RTX 4080/4070 Ti (16 GB) o RTX 4060 Ti (16 GB) es viable en 8 bits, y en 4 bits cabe en GPUs de 8 GB como RTX 3060 Ti o RTX 4060.
- El repositorio ocupa 16,1 GB, por lo que la descarga requiere ese espacio en disco.
- Opciones de despliegue: `transformers` (librería declarada), `text-generation-inference` (etiqueta `endpoints_compatible`), y por compatibilidad de arquitectura Llama también vLLM, Ollama o llama.cpp con conversión previa a GGUF. Ninguna de estas rutas está verificada en este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Compresion | Metricas publicadas | Licencia |
|---|---|---|---|---|---|
| svd-safety-l3_remove20_swapgapiter_b010_r01 | 8.030.261.248 (recuento safetensors); fracción 0,7998 | 8.192 tokens (heredado) | SVD-LLM, 20,02 % eliminado + 1 ronda de swap | AdvBench ASR 0,2950; StrongREJECT ASR 0,3350; sobrerrechazo 0,0302 | Llama 3 Community License |
| meta-llama/Meta-Llama-3-8B-Instruct (base) | ~8.030 millones | 8.192 tokens | Ninguna | No disponibles en esta ficha | Llama 3 Community License |

No se dispone de información sobre otros checkpoints comparables de la misma rejilla experimental (`gap_iter` con otros presupuestos, u otras reglas de selección), ni de métricas de variantes de compresión alternativas como Wanda o Sheared LLaMA. La comparativa cuantitativa con alternativas queda como no disponible.

## Limitaciones y advertencias

- No es un modelo desplegable: la propia model card lo describe como artefacto de investigación y sujeto experimental, no como asistente de propósito general.
- Degradación de seguridad deliberada en varias ramas del estudio: la compresión por sí sola eleva la tasa de éxito de ataque, y el objetivo del trabajo es cuantificarlo. El ASR medido (0,2950 en AdvBench) debe interpretarse en ese contexto.
- Es un checkpoint intermedio: solo se ha aplicado 1 de las 10 rondas previstas, por lo que no representa el resultado final del presupuesto de restauración del 1,000 %.
- Riesgo de alucinación: no evaluado ni documentado para este checkpoint; al ser un derivado comprimido, la degradación de capacidades respecto al base no está medida.
- Idiomas soportados: no disponible; se desconoce si la compresión afecta de forma desigual a distintos idiomas.
- Sin benchmarks de capacidad: no hay MMLU, HumanEval ni GSM8K publicados, de modo que la utilidad real del modelo comprimido es desconocida.
- Restricciones de licencia: se rige por la Llama 3 Community License y por `USE_POLICY.md`; cualquier uso comercial o redistribución debe cumplir esas condiciones, que incluyen obligaciones de atribución ("Built with Meta Llama 3") y restricciones de uso aceptable.
- Discrepancia a tener en cuenta: el recuento real de parámetros en safetensors (8.030.261.248) coincide aproximadamente con el del Llama-3-8B denso sin comprimir, mientras que la model card declara una fracción resultante de 0,7998. La información disponible no explica cómo se refleja esa reducción en el recuento de tensores del repositorio.
- Recuento de uso nulo (0 descargas, 0 likes) y ausencia de validación por terceros: no hay evidencia externa de reproducibilidad de las métricas publicadas.
- Antes de extraer cualquier conclusión, la model card recomienda evaluar el checkpoint uno mismo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l3_remove20_swapgapiter_b010_r01
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Licencia Llama 3 y política de uso: incluidas como `LICENSE` y `USE_POLICY.md` dentro del propio repositorio del modelo
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante (papers, blogs, repos o demos) sobre este modelo; los resultados devueltos no guardan relación con el artefacto.
