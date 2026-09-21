# Jeesup/svd-safety-l3_basis_remove40_swapgapnet_rankunit_b010

## Resumen

`Jeesup/svd-safety-l3_basis_remove40_swapgapnet_rankunit_b010` es un checkpoint de investigación derivado de `meta-llama/Meta-Llama-3-8B-Instruct`, comprimido al 60,0 % de los parámetros densos mediante la técnica Basis Sharing (ICLR 2025, bases SVD compartidas sobre grupos de 2 capas adyacentes) y posteriormente editado con 10 rondas de sustitución iterativa de parámetros neutra en presupuesto, seleccionada por la regla `swapgapnet_iter`. Lo publica el usuario Jeesup como artefacto de un estudio sobre cómo la compresión SVD degrada el comportamiento de seguridad y qué regla de selección de componentes lo repara mejor.

El modelo no es un asistente de propósito general: es una celda de una rejilla experimental sobre reglas de selección y presupuestos de restauración. El propio autor advierte que varias celdas de esa rejilla están deliberadamente degradadas en seguridad respecto al modelo base, y que el objetivo es cuantificar el compromiso entre seguridad y utilidad, no ofrecer un modelo desplegable.

Su relevancia es, por tanto, metodológica: aporta mediciones reproducibles (ASR en AdvBench y StrongREJECT, tasa de sobrerrechazo macro y perplejidad en WikiText-2) sobre un modelo de 8.030.261.248 parámetros almacenados, con semilla 42 y presupuesto de restauración del 1,000 % de los parámetros densos. La ventana de contexto no se documenta en la model card; se hereda del modelo base Llama-3-8B-Instruct (8.192 tokens).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3), con bases SVD compartidas sobre grupos de 2 capas adyacentes (Basis Sharing, ICLR 2025) |
| Parametros totales | 8.030.261.248 (dato real de safetensors); la model card reporta una fracción de parámetros resultante de 0,5999 tras eliminar el 40,00 % de los parámetros densos |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens, heredados de Meta-Llama-3-8B-Instruct; no se especifica en la model card de este checkpoint |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos safetensors; no se publican variantes GGUF, GPTQ ni AWQ) |
| Idiomas soportados | no disponible en la model card; la cobertura lingüística heredada del modelo base no se documenta ni se mide en este artefacto |
| Licencia | Meta Llama 3 Community License (incluye `LICENSE` y `USE_POLICY.md` en el repositorio) |
| Formato de pesos | safetensors (librería transformers) |
| Modelo base | meta-llama/Meta-Llama-3-8B-Instruct |
| Regla de seleccion | `swapgapnet_iter` (valor de intercambio `net`) |
| Presupuesto de restauracion | 1,000 % de los parámetros densos; 0,100 % por ronda; 10 de 10 rondas aplicadas |
| Componentes restaurados / sustituidos | 3.038 restaurados y 3.038 sustituidos; 69.740.544 parámetros insertados (1,00 % de los parámetros de proyección densos) |
| Recuperacion posterior | LoRA r=8 solo sobre los coeficientes por capa (bases congeladas, presupuesto sin cambios), 2 épocas, lr 0,0001, batch 64, dataset alpaca-cleaned |
| Semilla | 42 |
| Tamano del repositorio | 16,1 GB |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 21 de septiembre de 2026 (según metadatos de HuggingFace) |

## Arquitectura y entrenamiento

La arquitectura de partida es la del transformer decoder-only de Llama 3 en su variante de 8B, sobre la que se aplica Basis Sharing: en lugar de almacenar bases SVD independientes por capa, se comparten bases entre grupos de 2 capas adyacentes. Esta compresión elimina el 40,00 % de los parámetros densos (fracción resultante 0,5999) y es la causa documentada del deterioro de seguridad que motiva el estudio.

Sobre ese checkpoint comprimido se aplica un procedimiento de edición iterativa denominado "parameter-neutral swap": en cada ronda se retiran y se insertan componentes (3.038 en total cada sentido), seleccionados por la regla `swapgapnet_iter`, con un valor de intercambio calculado como valor de inserción más valor de eliminación del desalojo ordenado por sigma. El presupuesto total es del 1,000 % de los parámetros densos, repartido en 10 rondas del 0,100 % cada una (69.740.544 parámetros insertados). Tras la edición se aplica una recuperación ligera con LoRA de rango 8 únicamente sobre los coeficientes por capa, manteniendo las bases congeladas y el presupuesto intacto: 2 épocas, learning rate 0,0001, batch 64 y dataset alpaca-cleaned. No se documenta en la información disponible el número de tokens de entrenamiento del modelo base ni la composición del dataset original de Llama 3, ni si hubo RLHF o DPO en esta derivación (el ajuste descrito es supervisado con LoRA).

## Capacidades

- Generación de texto conversacional: hereda el comportamiento de instrucciones de Llama-3-8B-Instruct, pero la model card no lo evalúa como capacidad, sino como objeto de medición.
- Razonamiento, código y matemáticas: no se documentan ni se miden en esta ficha; serían capacidades heredadas del modelo base y no verificadas por el autor.
- Tool calling / function calling: no documentado; el modelo base Llama-3-8B-Instruct soporta plantillas de llamada a funciones, pero no hay ninguna validación en este checkpoint.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas; los idiomas figuran como no disponibles.
- Capacidad específica medida: comportamiento de rechazo y resistencia a ataques, cuantificado mediante ASR en AdvBench (0,0538) y StrongREJECT (0,1438) con juez HarmBench, y sobrerrechazo macro con WildGuard (0,1070).
- Calidad de modelado de lenguaje medida mediante perplejidad en WikiText-2 (18,4012).
- No dispone de visión, audio ni modos de "thinking" explícitos.

## Casos de uso

- Estudio académico del compromiso seguridad-utilidad en compresión: el checkpoint es una celda de una rejilla sobre reglas de selección y presupuestos; se usa para aislar el efecto de la compresión Basis Sharing frente al de la reparación por sustitución de componentes, comparando ASR y perplejidad entre celdas.
- Evaluación reproducible de reglas de selección de componentes: la regla `swapgapnet_iter` puede compararse contra otras reglas del mismo estudio manteniendo constante el presupuesto (1,000 % de parámetros densos) y la semilla (42).
- Red-teaming y calibración de jueces de seguridad: con ASR de 0,0538 en AdvBench y 0,1438 en StrongREJECT bajo juez HarmBench, sirve como sujeto de prueba para medir la sensibilidad de los clasificadores de seguridad ante respuestas degradadas.
- Investigación en interpretabilidad de pesos comprimidos: la estructura de bases compartidas sobre pares de capas adyacentes permite analizar qué componentes concretos (3.038 restaurados) son responsables de la recuperación del comportamiento seguro.
- Ablaciones de recuperación con LoRA: la receta documentada (r=8, coeficientes por capa, bases congeladas, 2 épocas, alr 0,0001, batch 64, alpaca-cleaned) sirve como línea base reproducible para probar variantes de ajuste.
- Docencia y demostración metodológica: ilustra de forma medible cómo una compresión aparentemente neutra en parámetros degrada propiedades de seguridad y cómo intentar repararlas sin cambiar el presupuesto de parámetros.
- Generación de corpus de respuestas de rechazo y de cumplimiento para entrenar o auditar clasificadores de contenido, siempre en un entorno controlado y no orientado a usuario final.
- No se recomienda su uso en atención al cliente, generación de código en producción, asistentes desplegados ni ningún escenario con usuarios reales: el propio autor lo describe como sujeto experimental y no como asistente desplegable.

## Benchmarks y rendimiento

| Metrica | Este checkpoint | Meta-Llama-3-8B-Instruct (base) |
|---|---|---|
| AdvBench ASR (juez HarmBench) | 0,0538 | no disponible |
| StrongREJECT ASR (juez HarmBench) | 0,1438 | no disponible |
| Sobrerrechazo macro (WildGuard) | 0,1070 | no disponible |
| Perplejidad WikiText-2 | 18,4012 | no disponible |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otras baterías estándar para este checkpoint, ni los valores correspondientes del modelo base con los que comparar directamente.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: alrededor de 16,1 GB solo para pesos, más activaciones y caché KV; en la práctica 18-20 GB para inferencia con contexto moderado. La compresión Basis Sharing no reduce el número de parámetros instanciados en el checkpoint (8.030.261.248 según safetensors), por lo que el ahorro de memoria depende de que el runtime explote las bases compartidas al cargar.
- VRAM estimada en int8: aproximadamente 8,5-9 GB.
- VRAM estimada en int4: aproximadamente 4,5-5,5 GB.
- GPU recomendadas: A100 40/80 GB y H100 para servir con TGI o vLLM con lotes grandes; RTX 4090 (24 GB) o A6000 (48 GB) para fp16 con contexto corto.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 (24 GB) en fp16 y en tarjetas de 12 GB (RTX 3060 12 GB, RTX 4070) si se cuantiza a 8 o 4 bits y se convierte a GGUF.
- Opciones de despliegue: transformers (librería declarada), Text Generation Inference y endpoints compatibles (etiquetas `text-generation-inference` y `endpoints_compatible`), vLLM. Para llama.cpp u Ollama sería necesario convertir los pesos a GGUF, conversión que el repositorio no incluye.
- Latencia y throughput estimados: no disponibles; no se publican mediciones de tokens por segundo ni de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento comparado |
|---|---|---|---|---|---|
| Este checkpoint (`svd-safety-l3_basis_remove40_swapgapnet_rankunit_b010`) | 8.030.261.248 (fracción densa 0,5999) | 8.192 tokens (heredado) | Meta Llama 3 Community License | Pesos safetensors en HuggingFace, 0 descargas | AdvBench ASR 0,0538; StrongREJECT ASR 0,1438; sobrerrechazo 0,1070; perplejidad WikiText-2 18,4012 |
| meta-llama/Meta-Llama-3-8B-Instruct | 8.030.261.248 | 8.192 tokens | Meta Llama 3 Community License | Pesos abiertos, ampliamente desplegado | Valores de referencia no incluidos en la información proporcionada |
| Otros brazos de la rejilla del mismo estudio (`Jeesup/svd-safety-l3_*`) | no disponible | no disponible | Meta Llama 3 Community License (presumiblemente) | no disponible en detalle | no disponible |

No se dispone de datos de benchmarks comparables de terceros en la información proporcionada, por lo que la comparación cuantitativa con alternativas como Llama-3.1-8B-Instruct o Mistral-7B-Instruct no puede completarse con cifras verificadas.

## Limitaciones y advertencias

- Artefacto de investigación, no un asistente desplegable: el autor indica explícitamente que es una celda de una rejilla y que debe tratarse como sujeto experimental.
- Degradación deliberada de seguridad en partes del estudio: la compresión por sí sola eleva la tasa de éxito de ataques, y el objetivo del trabajo es cuantificarlo; no debe asumirse paridad de seguridad con el modelo base.
- Riesgo de alucinación: no medido ni documentado; la perplejidad de 18,4012 en WikiText-2 es muy superior a la esperable en un 8B sin comprimir, lo que sugiere pérdida de calidad de modelado, aunque no se aporta la cifra del modelo base para cuantificar la diferencia.
- Sesgos conocidos: no documentados en la información disponible; se heredan, en su caso, del modelo base y no se han auditado tras la compresión.
- Limitaciones de idioma: los idiomas soportados figuran como no disponibles y no se ha evaluado el comportamiento multilingüe.
- Limitaciones de contexto: la ventana de 8.192 tokens es la del modelo base y no se ha verificado su comportamiento tras la compresión ni en contextos largos.
- Restricciones de licencia: se rige por la Meta Llama 3 Community License; el repositorio incluye `LICENSE` y `USE_POLICY.md`. Cualquier uso comercial debe cumplir esas condiciones, incluida la obligación de atribución y las restricciones de la política de uso aceptable.
- Sin mantenimiento ni validación externa: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso independiente ni de replicación por terceros.
- Sin datos de despliegue: no hay mediciones de latencia, throughput ni comportamiento bajo cuantización posterior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l3_basis_remove40_swapgapnet_rankunit_b010
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Paper Basis Sharing (ICLR 2025): URL no disponible en la información proporcionada
- Licencia Meta Llama 3 y política de uso: se incluyen como `LICENSE` y `USE_POLICY.md` en el repositorio; URL pública no disponible en la información proporcionada
- Demos, repositorios o blogs adicionales: no disponible; la búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo (únicamente foros no relacionados).
