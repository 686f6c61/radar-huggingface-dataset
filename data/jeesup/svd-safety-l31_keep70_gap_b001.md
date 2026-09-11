# Jeesup/svd-safety-l31_keep70_gap_b001

## Resumen

`Jeesup/svd-safety-l31_keep70_gap_b001` es un checkpoint derivado de `meta-llama/Llama-3.1-8B-Instruct` al que se le ha aplicado una compresión SVD-LLM que elimina el 29,91% de los parámetros densos, dejando una fracción resultante de 0,7009 (70,09%). Sobre ese modelo comprimido se restaura después un presupuesto de 0,1% de componentes SVD (1.120 componentes, ninguno sustituido) seleccionados mediante la regla denominada `gap`. Lo publica el usuario Jeesup como artefacto de investigación, no como modelo de propósito general.

El problema que aborda es la pérdida de comportamiento seguro provocada por la compresión de pesos: la propia model card señala que la compresión por sí sola eleva la tasa de éxito de ataques y que el objetivo del estudio es cuantificar ese deterioro y probar distintas reglas de selección de componentes para repararlo. Este checkpoint es una celda concreta de una rejilla que cruza reglas de selección con presupuestos de restauración.

Es relevante ahora porque conecta dos líneas de trabajo activas: la compresión agresiva de LLM para reducir coste de inferencia y el análisis de cómo las intervenciones sobre pesos afectan a la alineación de seguridad. Los datos publicados (ASR de 0,0385 en AdvBench, 0,0575 en StrongREJECT, sobre-rechazo macro de 0,2595 y perplejidad de 17,2228 en WikiText-2) están pensados para comparar celdas de la rejilla, no para desplegar el modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso de la familia Llama 3.1, con pesos comprimidos mediante SVD-LLM. El número de capas y cabezas de atención no se detalla en la información proporcionada; el modelo base usa 32 capas y GQA con 8 cabezas KV (dato heredado de Llama-3.1-8B-Instruct, no verificado en este repositorio) |
| Parametros totales | 8.030.261.248 según los metadatos de safetensors. La model card declara una fracción de parámetros resultante de 0,7009 respecto al modelo denso |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la información proporcionada. El modelo base soporta 128.000 tokens |
| Tipos de cuantizacion | No se distribuyen versiones cuantizadas. Pesos en safetensors bf16 (~16,1 GB de repositorio), convertibles con herramientas estándar (llama.cpp, GPTQ, AWQ) fuera del repositorio |
| Idiomas soportados | No disponible: el autor no declara idiomas en la model card ni en los tags |
| Licencia | Llama 3.1 Community License (se incluyen `LICENSE` y `USE_POLICY.md` en el repositorio) |
| Formato de pesos | safetensors, cargable con `transformers` |
| Pipeline | text-generation (tags `text-generation-inference` y `endpoints_compatible`) |
| Modelo base | meta-llama/Llama-3.1-8B-Instruct |
| Compresion | SVD-LLM, 29,91% de parámetros eliminados |
| Regla de seleccion | `gap` |
| Presupuesto de restauracion | 0,100% de los parámetros densos |
| Componentes restaurados / sustituidos | 1.120 / 0 |
| Semilla | 42 |
| Descargas / likes | 0 / 0 |
| Fecha de creacion (metadatos HF) | 2026-09-11 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 8B Instruct (transformer decoder-only denso, atención con GQA, RoPE y normalización RMSNorm). Sobre ella no se realiza ningún entrenamiento nuevo: el proceso es una compresión post-entrenamiento en dos etapas. Primero se aplica SVD-LLM, que descompone en valores singulares las matrices de pesos y trunca componentes hasta retener el 70,1% de los parámetros densos. Después se restauran 1.120 componentes singulares adicionales, seleccionados con la regla `gap` bajo un presupuesto del 0,1% de los parámetros densos, con semilla 42.

La model card no documenta la composición del dataset, el número de tokens, ni etapas de RLHF o DPO aplicadas a este derivado, porque no las hay: la intervención es puramente algebraica sobre los pesos del modelo base. Tampoco se describe en detalle el criterio exacto de la regla `gap` más allá de su nombre, ni si la restauración implica un ajuste posterior. El interés técnico del artefacto está, precisamente, en medir el efecto de esa selección de componentes sobre el comportamiento de seguridad, no en una innovación de arquitectura.

## Capacidades

Las capacidades funcionales son las heredadas de Llama-3.1-8B-Instruct, degradadas en grado desconocido por la compresión; la model card no publica evaluaciones de utilidad más allá de la perplejidad.

- Generación de texto conversacional en formato instruct (tag `conversational`).
- Razonamiento y respuesta a instrucciones, con la salvedad de que la compresión puede afectar a tareas de razonamiento de varios pasos.
- Generación de código: capacidad esperable del modelo base, no medida en este checkpoint.
- Soporte de tool calling / function calling: heredado del formato del base, no verificado en este derivado.
- Capacidades de agente y razonamiento multi-paso: no evaluadas.
- Capacidades multilingües: no declaradas ni medidas en este repositorio.
- Capacidad especial: ninguna propia. No dispone de modo de pensamiento explícito, visión ni audio.
- Uso previsto real: servir como sujeto experimental para medir el equilibrio seguridad/utilidad bajo compresión.

## Casos de uso

- Estudio de degradación de seguridad por compresión: comparar las tasas de éxito de ataque de esta celda con las del modelo sin comprimir y con otras celdas de la rejilla para aislar cuánto daño introduce el truncado SVD.
- Investigación sobre reglas de selección de componentes: usar `gap` con presupuesto 0,1% como brazo de comparación frente a reglas alternativas (magnitud, aleatoria, basada en gradientes) dentro del mismo grid.
- Evaluación de sobre-rechazo: el valor de 0,2595 en WildGuard permite estudiar si la restauración de componentes recupera utilidad sin disparar rechazos innecesarios.
- Red-teaming controlado de modelos comprimidos: emplear el checkpoint como objetivo en pipelines de ataque automatizado, siempre en entorno aislado y sin exposición pública.
- Reproducibilidad de artefactos de compresión: la semilla 42 y los recuentos de componentes (1.120 restaurados, 0 sustituidos) permiten replicar el experimento y auditar la metodología.
- Línea base para investigación en cuantización: al ser un modelo de 8B con perplejidad degradada, sirve para separar el efecto de la compresión estructural del efecto de la cuantización de precisión.
- Docencia y divulgación técnica: ilustrar en un curso o artículo cómo una intervención sobre pesos, sin reentrenamiento, altera métricas de alineación medibles.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card del repositorio. No se incluye el valor de referencia del modelo base sin comprimir, por lo que no es posible calcular la delta de degradación con la información disponible.

| Metrica | Valor | Evaluador |
|---|---|---|
| AdvBench ASR (attack success rate) | 0,0385 | HarmBench judge |
| StrongREJECT ASR | 0,0575 | HarmBench judge |
| Macro over-refusal | 0,2595 | WildGuard |
| WikiText-2 perplexity | 17,2228 | no especificado |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otras baterías de capacidades en la información disponible. La model card advierte explícitamente de que varias celdas de la rejilla están deliberadamente degradadas en seguridad y que cada checkpoint debe evaluarse por separado antes de extraer conclusiones.

## Requisitos de hardware

Estimaciones calculadas a partir del recuento de parámetros declarado (8.030.261.248) y de la arquitectura del modelo base. El repositorio no publica mediciones propias de latencia ni de memoria.

- VRAM en bf16/fp16: aproximadamente 16,1 GB solo para pesos; en la práctica 17-19 GB con overhead de runtime y caché KV inicial.
- VRAM en int8: aproximadamente 8-9 GB de pesos.
- VRAM en int4 (GGUF Q4_K_M o similar): aproximadamente 5-6 GB.
- Caché KV: con la arquitectura del base (8 cabezas KV, 128 dimensiones por cabeza, 32 capas, bf16) ronda los 128 KiB por token, es decir unos 16 GiB para 128.000 tokens. Cualquier despliegue con contexto largo exige GPU de 80 GB o tensor parallelism. Estas cifras corresponden al base y no se han verificado sobre los pesos comprimidos.
- GPU consumer: cabe en una RTX 4090 (24 GB) en bf16 con contexto moderado; en RTX 3090 (24 GB) de forma ajustada. Con cuantización int4 cabe en tarjetas de 8-12 GB (RTX 3060 12 GB, RTX 4070, etc.).
- GPU de datacenter: A100 40/80 GB, H100 80 GB y L40S son adecuadas para bf16 con contexto largo o para servir varias réplicas.
- Opciones de despliegue: `transformers` de forma nativa, vLLM o TGI (los tags incluyen `text-generation-inference` y `endpoints_compatible`), y llama.cpp u Ollama tras convertir los pesos a GGUF.
- Latencia y throughput: no disponibles. El autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Compresion | ASR AdvBench | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| svd-safety-l31_keep70_gap_b001 | 8,03B (fraccion declarada 0,7009) | no disponible | SVD-LLM, 29,91% eliminado + 0,1% restaurado | 0,0385 | Llama 3.1 Community | Publico en HF, 0 descargas |
| meta-llama/Llama-3.1-8B-Instruct | 8,03B | 128.000 tokens | ninguna | no disponible en esta informacion | Llama 3.1 Community | Publico en HF |
| Otras celdas de la rejilla de Jeesup | no disponible | no disponible | otras reglas de seleccion y presupuestos | no disponible | Llama 3.1 Community | no disponible |

No se han identificado en la información proporcionada otros checkpoints de compresión SVD orientados a seguridad con los que establecer una comparación cuantitativa. La comparación con el modelo base es la única que resulta metodológicamente válida, pero requiere que el evaluador genere la línea base por su cuenta, ya que el repositorio no la incluye.

## Limitaciones y advertencias

- Artefacto de investigación: la model card indica de forma explícita que no es un modelo de chat de propósito general y que no debe desplegarse como asistente.
- Degradación deliberada de seguridad en parte de la rejilla: la compresión por sí sola eleva la tasa de éxito de ataques; este checkpoint debe tratarse como sujeto experimental.
- Sobre-rechazo elevado: el valor macro de 0,2595 en WildGuard implica que una fracción relevante de peticiones benignas será rechazada.
- Perplejidad alta: 17,2228 en WikiText-2, coherente con una compresión del 29,91%, lo que anticipa pérdida de fluidez y de calidad en generación libre.
- Riesgo de alucinación: no medido en el repositorio; cabe esperar que la compresión lo incremente respecto al base.
- Idiomas y contexto: no declarados por el autor; la cobertura multilingüe del base no está garantizada tras la compresión.
- Sin versiones cuantizadas publicadas ni pesos en GGUF, por lo que el despliegue ligero requiere conversión propia.
- Licencia: Llama 3.1 Community License. El uso comercial está sujeto a sus términos (incluida la cláusula de 700 millones de usuarios activos mensuales), a la atribución "Built with Llama" y al cumplimiento de `USE_POLICY.md`. Al ser un derivado, se heredan todas las restricciones y obligaciones de la licencia del modelo base.
- Advertencia para producción: cualquier uso real exige una evaluación propia de seguridad y utilidad sobre el checkpoint concreto, no extrapolada de otras celdas de la rejilla.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l31_keep70_gap_b001
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Ficheros de licencia incluidos en el repositorio del modelo: `LICENSE` y `USE_POLICY.md` (rutas relativas a la raíz del repositorio).
- Nota sobre la búsqueda web: los resultados devueltos no guardan relación con el modelo (sitios de descarga de tipografías, foro Zhihu y un hilo de análisis de red de una aplicación móvil). No se han encontrado papers, blogs, repositorios ni demos adicionales asociados a este checkpoint en la información disponible.
