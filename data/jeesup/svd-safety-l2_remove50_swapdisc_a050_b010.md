# Jeesup/svd-safety-l2_remove50_swapdisc_a050_b010

## Resumen

svd-safety-l2_remove50_swapdisc_a050_b010 es un artefacto de investigación publicado por el usuario Jeesup en HuggingFace. Se trata de un checkpoint de meta-llama/Llama-2-7b-chat-hf comprimido con SVD-LLM hasta el 50,0 % de los parámetros densos de proyección y posteriormente editado mediante 10 rondas iterativas de intercambio de parámetros neutro (parameter-neutral swap), seleccionando los componentes con la regla `disc_iter` y un presupuesto del 1,0 % de los parámetros densos repartido en fragmentos del 0,1 % por ronda.

El problema que aborda es acotado y experimental: cuantificar cómo la compresión por descomposición en valores singulares degrada el comportamiento de seguridad de un modelo alineado y qué regla de selección de componentes repara mejor ese daño. No es un modelo conversacional de propósito general ni un asistente desplegable; es una celda concreta dentro de una rejilla de experimentos sobre reglas de selección y presupuestos de restauración.

El interés actual reside en su valor como evidencia empírica: publica métricas de tasa de éxito de ataque (ASR) frente a AdvBench y StrongREJECT, además de una medida de sobre-rechazo macro, lo que permite comparar cuantitativamente el coste en seguridad de la compresión y la eficacia de la reparación post-hoc sin reentrenamiento. El repositorio ocupa 13,5 GB y el recuento de safetensors declara 6.738.415.616 parámetros.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 2: RoPE, RMSNorm, SwiGLU, atención multi-cabeza) |
| Parámetros totales | 6.738.415.616 (recuento de safetensors); fracción resultante declarada: 0,4999 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens (heredada de Llama-2-7b-chat) |
| Tipos de cuantización | No disponible (solo se publican pesos en safetensors; no hay GGUF ni GPTQ/AWQ en el repositorio) |
| Idiomas soportados | No disponible (la model card no declara idiomas) |
| Licencia | Llama 2 Community License (incluye LICENSE.txt y USE_POLICY.md en el repositorio) |
| Formato de pesos | safetensors (librería transformers) |

Datos adicionales de procedencia declarados por el autor:

| Campo | Valor |
|---|---|
| Modelo base | meta-llama/Llama-2-7b-chat-hf |
| Compresión | SVD-LLM, 50,01 % de parámetros eliminados |
| Regla de selección | `disc_iter` |
| Presupuesto de restauración | 1,000 % de los parámetros densos |
| Componentes restaurados / sustituidos | 6.428 / 6.428 |
| Rondas iterativas aplicadas | 10 de 10 |
| Fragmento por ronda | 0,100 % de los parámetros densos |
| Parámetros insertados | 64.726.528 (1,00 % de los parámetros de proyección densos) |
| Valor de intercambio | `insert` (solo valor de inserción; expulsión ordenada por sigma) |
| Escala de inserción | 0,5 |
| Semilla | 42 |

## Arquitectura y entrenamiento

La base es Llama-2-7b-chat, un transformer decoder-only de 7.000 millones de parámetros con normalización RMSNorm, activación SwiGLU, embeddings posicionales rotatorios (RoPE) y atención multi-cabeza (32 cabezas de consulta y 32 de clave/valor en la variante de 7B), entrenado originalmente con supervisión fina y optimización por preferencias humanas. Sobre ese checkpoint no se ha realizado ningún entrenamiento adicional: la intervención es puramente post-hoc.

El proceso aplicado consta de dos fases. Primero, una compresión SVD-LLM que reduce al 50,01 % los parámetros de proyección mediante descomposición en valores singulares y posterior reconstrucción de bajo rango. Segundo, una edición iterativa de restauración: en cada una de las 10 rondas se seleccionan componentes mediante la regla `disc_iter`, se expulsan siguiendo un orden basado en los valores singulares y se reinsertan nuevos componentes a escala 0,5 de su fuerza, con un presupuesto del 0,1 % de los parámetros densos por ronda y un total de 64.726.528 parámetros insertados (el 1,0 %). La innovación técnica no está en la arquitectura, sino en el protocolo de comparación: la rejilla de experimentos aísla el efecto de la regla de selección y del presupuesto sobre el equilibrio seguridad/utilidad, con semilla fija (42) para reproducibilidad.

Un detalle relevante para la reproducibilidad: el recuento de parámetros de los safetensors coincide con el de Llama-2-7b-chat denso completo, mientras que la model card declara una fracción resultante de 0,4999 y un repositorio de 13,5 GB. Esto sugiere que la compresión afecta al rango efectivo de las proyecciones más que al número de tensores almacenados, pero la información proporcionada no permite confirmar el criterio de almacenamiento.

## Capacidades

- Generación de texto conversacional en inglés, heredada del ajuste de Llama-2-7b-chat.
- Razonamiento de un solo turno y multiturno dentro de la ventana de 4.096 tokens.
- Generación de código y resolución de problemas matemáticos básicos, con la calidad del modelo base degradada por la compresión.
- Sujeción al formato de plantilla de chat de Llama 2 (etiquetas `[INST]` y `<<SYS>>`).
- Ausencia de tool calling o function calling nativo: Llama 2 no incluye plantilla de herramientas y esta edición no la añade.
- Ausencia de capacidades multimodales (texto únicamente).
- Ausencia de modo de razonamiento explícito (thinking mode) o de decodificación especulativa propia.
- Valor instrumental como sujeto de medida en experimentos de seguridad: permite evaluar ASR y sobre-rechazo bajo condiciones controladas de compresión.

## Casos de uso

- Investigación sobre compresión de modelos: sirve como punto de medida para cuantificar cuánta capacidad y cuánta alineación se pierde al eliminar el 50 % de los parámetros de proyección, comparando contra el checkpoint denso original.
- Estudio de reparación post-hoc de seguridad: permite evaluar si el intercambio iterativo de componentes (10 rondas, 1,0 % de presupuesto) recupera comportamiento seguro sin reentrenar, midiendo el delta frente a la celda no reparada de la rejilla.
- Red-teaming automatizado: sus métricas de AdvBench ASR (0,1346) y StrongREJECT ASR (0,1917) lo convierten en un sujeto adecuado para calibrar pipelines de ataque y comparar la sensibilidad de los jueces HarmBench entre modelos comprimidos.
- Análisis de sobre-rechazo: con un 0,2191 de sobre-rechazo macro (WildGuard), es útil para estudiar el compromiso entre seguridad y utilidad y para validar clasificadores de rechazo excesivo en castellano si se traduce el conjunto de evaluación.
- Interpretabilidad de componentes: los 6.428 componentes seleccionados y sustituidos permiten estudiar qué subespacios de las matrices de proyección concentran el comportamiento de seguridad y cómo se redistribuye tras la compresión.
- Reproducción experimental y docencia: con semilla fija y presupuestos documentados, es un caso didáctico de diseño de rejilla de ablaciones en seguridad de modelos.
- Comparación de reglas de selección: al ser una celda concreta (`disc_iter`, escala 0,5), puede contrastarse con las demás celdas de la rejilla para determinar qué heurística de selección conserva mejor la alineación.

En ningún caso se recomienda su uso como asistente en producción ni en aplicaciones orientadas a usuarios finales.

## Benchmarks y rendimiento

| Métrica | Valor declarado |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,1346 |
| StrongREJECT ASR (juez HarmBench) | 0,1917 |
| Sobre-rechazo macro (WildGuard) | 0,2191 |

Nota de lectura: un ASR más bajo es mejor y un sobre-rechazo más bajo también es mejor. El autor advierte explícitamente que varias celdas de la rejilla están deliberadamente degradadas en seguridad respecto a Llama-2-7b-chat, porque la compresión por sí sola eleva la tasa de éxito de ataque. No se han publicado en la información disponible los valores de referencia del modelo base ni de otros modelos comparables, por lo que no es posible calcular el delta de degradación.

## Requisitos de hardware

- Pesos en precisión nativa (fp16/bf16): aproximadamente 13,5 GB, coincidiendo con el tamaño del repositorio. VRAM estimada para inferencia con contexto de 4.096 tokens: 15-16 GB contando caché KV y activaciones.
- Cuantización de 8 bits: en torno a 7 GB de pesos y 9-10 GB de VRAM total.
- Cuantización de 4 bits: en torno a 4 GB de pesos y 6-7 GB de VRAM total.
- GPU de consumo: cabe sin cuantizar en RTX 3090, RTX 4090, RTX A6000 y cualquier tarjeta de 24 GB. Con 16 GB (RTX 4080, RTX 5080) es viable solo con cuantización. Con 12 GB (RTX 3060) es viable en 4-8 bits. Tarjetas de 8 GB requieren cuantización agresiva y contexto reducido.
- GPU profesionales: A100 40/80 GB, H100 y L40S están sobredimensionadas para un modelo de 7B; su interés es el throughput en lote alto, no la viabilidad.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference y endpoints compatibles (etiquetas `text-generation-inference` y `endpoints_compatible`), y vLLM. llama.cpp u Ollama requieren convertir los pesos a GGUF, conversión que no se publica en el repositorio.
- Latencia y throughput: no disponible. Como referencia orientativa para un modelo de 7B en una RTX 4090 con cuantización de 4 bits, el orden de magnitud habitual es de decenas de tokens por segundo con lotes pequeños, pero no hay medición publicada para este checkpoint concreto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este checkpoint | 6.738.415.616 (fracción efectiva declarada 0,4999) | 4.096 | Llama 2 Community License | Pesos safetensors en HF | Artefacto de investigación, seguridad degradada y parcialmente reparada |
| meta-llama/Llama-2-7b-chat-hf | 6.738.415.616 | 4.096 | Llama 2 Community License | Pesos en HF | Modelo base sin comprimir; valores de ASR y sobre-rechazo no disponibles en la información proporcionada |
| Otras celdas de la rejilla del mismo autor | No disponible | 4.096 | Llama 2 Community License | No disponible | Misma base y metodología, con otras reglas de selección y presupuestos; no se detallan en la información disponible |
| Alternativas de la misma categoría (por ejemplo, modelos de 7B con contexto largo) | No disponible | No disponible | No disponible | No disponible | No se han proporcionado datos comparativos en la información disponible |

## Limitaciones y advertencias

- No es un modelo de propósito general. El propio autor lo describe como un sujeto experimental y pide evaluarlo antes de extraer conclusiones.
- Algunas celdas de la rejilla están deliberadamente degradadas en seguridad; esta celda concreta presenta un ASR de 0,1346 en AdvBench y 0,1917 en StrongREJECT, valores que deben interpretarse como riesgo residual medido, no como garantía.
- El sobre-rechazo macro de 0,2191 implica que una fracción relevante de peticiones benignas puede recibir una negativa.
- La compresión por SVD degrada capacidades generales además de la seguridad; se espera un rendimiento inferior al de Llama-2-7b-chat en generación, razonamiento y código, aunque no se publican mediciones de capacidad en la información disponible.
- No se declara ningún conjunto de idiomas soportados. El modelo base está fuertemente orientado al inglés y no hay evidencia de calidad multilingüe en esta edición.
- Ventana de contexto limitada a 4.096 tokens, insuficiente para casos de uso con documentación extensa o conversaciones muy largas.
- Riesgo de alucinación heredado y potencialmente amplificado por la compresión y la edición de parámetros; no se han publicado evaluaciones de veracidad.
- Licencia Llama 2 Community License: uso comercial condicionado por el umbral de 700 millones de usuarios activos mensuales, obligación de incluir el aviso "Built with Llama 2" y de respetar USE_POLICY.md, incluida la política de usos aceptables.
- No hay cuantizaciones publicadas (GGUF, GPTQ, AWQ) ni pipelines de despliegue listos para producción.
- No se publican datos de sesgos, composición del dataset de edición ni evaluación de equidad.
- Discrepancia no resuelta entre el recuento de parámetros de los safetensors y la fracción de parámetros declarada en la model card; conviene verificar la estructura real de los tensores antes de reutilizar el checkpoint.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_remove50_swapdisc_a050_b010
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Paper de Llama 2 (referencia del modelo base): https://arxiv.org/abs/2307.09288

Nota sobre la búsqueda web: los resultados devueltos corresponden a páginas en italiano sobre hiperqueratosis cutánea y no guardan ninguna relación con el modelo. No se han encontrado enlaces relevantes adicionales (papers de SVD-LLM, blogs del autor, repositorios de código ni demos) en la información disponible.
