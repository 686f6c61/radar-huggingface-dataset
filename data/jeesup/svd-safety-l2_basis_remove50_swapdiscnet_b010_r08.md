# Jeesup/svd-safety-l2_basis_remove50_swapdiscnet_b010_r08

## Resumen

`svd-safety-l2_basis_remove50_swapdiscnet_b010_r08` es un checkpoint de investigación publicado por el usuario Jeesup en HuggingFace, derivado de `meta-llama/Llama-2-7b-chat-hf`. No es un modelo conversacional de propósito general: es una celda concreta de una matriz experimental que estudia cómo la compresión basada en descomposición en valores singulares (SVD) degrada el comportamiento de seguridad de un LLM y qué regla de selección de componentes repara mejor ese daño. El modelo parte de una compresión por Basis Sharing (ICLR 2025), que comparte bases SVD entre grupos de dos capas adyacentes y elimina el 50,00 % de los parámetros densos, y después aplica 8 de 10 rondas de una edición iterativa de parámetros neutros guiada por la regla `swapdiscnet_iter`.

El checkpoint resultante conserva 6.738.415.616 parámetros según los pesos en safetensors, la misma cifra que el modelo base, con una fracción de parámetros densos declarada de 0,4998 y 51.774.208 parámetros intercambiados (0,80 % de los parámetros de proyección). La recuperación se hizo con un LoRA de rango 8 entrenado únicamente sobre los coeficientes por capa, con las bases congeladas y el presupuesto sin cambios, durante 2 épocas con `alpaca-cleaned`.

Su relevancia es metodológica, no de producto: sirve como artefacto reproducible para medir el trade-off entre tasa de éxito de ataques (ASR) y sobre-rechazo en modelos comprimidos. El autor advierte explícitamente de que varios brazos de la matriz están degradados en seguridad respecto a Llama-2-7b-chat de forma deliberada, y de que cada celda debe tratarse como sujeto experimental, no como asistente desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) con compresion por Basis Sharing: bases SVD compartidas sobre grupos de 2 capas adyacentes |
| Parametros totales | 6.738.415.616 (~6,74 B) segun safetensors |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Llama-2-7b-chat usa 4096 tokens |
| Tipos de cuantizacion | no se distribuyen cuantizaciones oficiales; pesos en safetensors sin precision declarada |
| Idiomas soportados | no disponible (el modelo base esta optimizado principalmente para ingles) |
| Licencia | Llama 2 Community License |
| Formato de pesos | safetensors (tamano del repo: 13,5 GB) |
| Modelo base | meta-llama/Llama-2-7b-chat-hf |
| Fraccion de parametros resultante | 0,4998 de los parametros densos originales |
| Regla de seleccion | `swapdiscnet_iter` |
| Presupuesto de restauracion | 1,000 % de los parametros densos (0,100 % por ronda) |
| Componentes restaurados / intercambiados | 3569 / 3569 |
| Parametros introducidos | 51.774.208 (0,80 % de los parametros de proyeccion densos) |
| Semilla | 42 |
| Recuperacion | LoRA r=8 sobre coeficientes por capa (bases congeladas), 2 epocas, lr 0,0001, batch 64, `alpaca-cleaned` |
| Rondas iterativas aplicadas | 8 de 10 |

## Arquitectura y entrenamiento

La base es un transformer decoder-only de la familia Llama 2 (7B, variante chat), con atención causal estándar. Sobre esa base se aplica Basis Sharing, un método de compresión presentado en ICLR 2025 que factoriza matrices de proyección mediante SVD y comparte las bases entre grupos de dos capas adyacentes, en lugar de mantener una base independiente por capa. En este checkpoint se elimina el 50,00 % de los parámetros densos, dejando una fracción declarada de 0,4998.

Sobre el modelo comprimido se ejecuta un proceso de edición iterativa de parámetros neutros: en cada ronda se seleccionan componentes con la regla `swapdiscnet_iter`, se expulsan y se reintroducen mediante un valor de intercambio `net` (valor de inserción más valor de eliminación de la expulsión ordenada por sigma). El presupuesto total del experimento es del 1,0 % de los parámetros densos, con fragmentos del 0,100 % por ronda; este checkpoint corresponde a la ronda 8 de 10, por lo que es un estado intermedio de una ejecución más larga. Se restauraron y expulsaron 3569 componentes, y se introdujeron 51.774.208 parámetros, equivalentes al 0,80 % de los parámetros de proyección densos. Tras la edición se entrenó un adaptador LoRA de rango 8 exclusivamente sobre los coeficientes por capa, manteniendo las bases congeladas y el presupuesto intacto.

Un detalle a tener en cuenta: el recuento de parámetros del fichero safetensors coincide con el del modelo base sin comprimir. La model card no detalla cómo se materializa en disco la eliminación del 50 % de parámetros densos (por ejemplo, si las bases compartidas y los coeficientes mantienen las formas completas), por lo que el ahorro de memoria en inferencia no puede deducirse directamente del recuento de tensores.

## Capacidades

- Generación de texto conversacional heredada de Llama-2-7b-chat, en la medida en que la compresión y la edición la preserven.
- Edición selectiva de comportamiento: el checkpoint incorpora 3569 componentes restaurados mediante la regla `swapdiscnet_iter`, orientados a recuperar comportamiento de seguridad perdido por la compresión.
- Evaluación de seguridad medible: soporta flujos de red-teaming con AdvBench, StrongREJECT y WildGuard para obtener ASR y tasas de sobre-rechazo comparables.
- Interpretabilidad de componentes: permite analizar qué componentes concretos sostienen el comportamiento de rechazo y cómo se degradan al comprimir.
- Reproducibilidad experimental: semilla 42, presupuesto y regla de selección declarados, con métricas publicadas.
- No se declara soporte de tool calling, function calling, agentes, visión, audio, ni modo de razonamiento explícito (thinking mode).
- Capacidades multilingües: no disponibles; el modelo base está orientado principalmente al inglés.

## Casos de uso

- Estudio de interpretabilidad de seguridad: analizar la correspondencia entre componentes concretos (3569 restaurados) y la tasa de éxito de ataques, comparando la ronda 8 con las demás rondas de la matriz experimental.
- Evaluación comparativa de reglas de selección: usar este checkpoint, con regla `swapdiscnet_iter` y presupuesto del 1,0 %, como celda de referencia frente a otras reglas y presupuestos del mismo grid.
- Medición del trade-off seguridad/utilidad: cruzar AdvBench ASR (0,0346), StrongREJECT ASR (0,1342) y el sobre-rechazo macro de WildGuard (0,3501) para cuantificar cuánta utilidad se sacrifica al recuperar seguridad.
- Investigación sobre compresión SVD: servir de línea base reproducible para comparar Basis Sharing con otras técnicas de compresión de Llama 2 7B bajo idéntico protocolo de evaluación.
- Red-teaming académico: generar respuestas ante conjuntos de prompts adversarios y auditar el fallo del alineamiento tras la eliminación del 50 % de los parámetros densos.
- Docencia y reproducibilidad: materializar un caso completo de artefacto de investigación con procedencia documentada (base, presupuesto, semilla, dataset de recuperación) para cursos de compresión y alineamiento de modelos.
- Auditoría de sobre-rechazo: estudiar por qué el modelo rechaza peticiones benignas en el 35,01 % de los casos medidos y qué componentes lo provocan.
- En ningún caso se recomienda su uso como asistente en producción, atención al cliente, generación de código o cualquier aplicación orientada al usuario final.

## Benchmarks y rendimiento

Solo se han publicado métricas de seguridad; no hay resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de capacidad en la información disponible.

| Metrica | Resultado |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0346 |
| StrongREJECT ASR (juez HarmBench) | 0,1342 |
| Macro over-refusal (WildGuard) | 0,3501 |

No se han publicado resultados de benchmarks de capacidad general en la información disponible.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: en torno a 13,5 GB solo para pesos (tamaño del repo), más caché KV y activaciones; presupuesto práctico de 15-16 GB de VRAM.
- VRAM estimada en cuantización de 8 bits: aproximadamente 7 GB, más overhead. En 4 bits: aproximadamente 3,5-4 GB. Son estimaciones por tamaño de parámetros, no verificadas para este checkpoint.
- GPU de datacenter: A100 40 GB, A100 80 GB, H100 y L40S ejecutan el modelo en fp16 sin problemas.
- GPU de consumo: cabe en RTX 3090 y RTX 4090 (24 GB) en fp16; en RTX 4080 (16 GB) es ajustado en fp16 y holgado con cuantización de 8 o 4 bits; con 4 bits puede ejecutarse en GPUs de 8 GB.
- El ahorro real de memoria derivado de la compresión al 50 % no está documentado: el recuento de parámetros del fichero safetensors coincide con el del modelo base, así que las cifras anteriores deben tratarse como cotas conservadoras.
- Despliegue: `transformers` (librería declarada en la model card), TGI (los tags incluyen `text-generation-inference` y `endpoints_compatible`) y vLLM. `llama.cpp` u Ollama requerirían una conversión a GGUF que no se distribuye en el repositorio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | AdvBench ASR | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint | 6,74 B (fraccion densa 0,4998) | no disponible | Llama 2 Community License | 0,0346 | Publico en HuggingFace, 0 descargas, 0 likes |
| meta-llama/Llama-2-7b-chat-hf (base) | 6,74 B | 4096 tokens (dato del modelo base) | Llama 2 Community License | no disponible en esta ficha | Publico en HuggingFace |
| Otros brazos del mismo estudio (reglas y presupuestos alternativos) | ~6,74 B | no disponible | Llama 2 Community License | no disponible | Publicados por el mismo autor, no verificados |

No se dispone de datos comparativos con otras técnicas de compresión (SliceGPT, SVD-LLM u otras) en la información proporcionada.

## Limitaciones y advertencias

- Artefacto de investigación: el propio autor indica que no es un modelo conversacional de propósito general y que debe evaluarse antes de extraer conclusiones.
- Seguridad degradada de forma deliberada: la compresión por sí sola eleva la tasa de éxito de ataques frente a Llama-2-7b-chat, y varios brazos de la matriz están degradados a propósito; el objetivo del estudio es cuantificarlo.
- Estado intermedio: es la ronda 8 de 10 de una ejecución más larga, no el resultado final del presupuesto de restauración.
- Sobre-rechazo elevado: una tasa macro de 0,3501 en WildGuard implica que el modelo rechaza peticiones benignas en aproximadamente un tercio de los casos medidos.
- Riesgo de alucinación: inherente a la familia Llama 2 y potencialmente agravado por la eliminación del 50 % de los parámetros densos; no hay evaluación de factualidad publicada.
- Idiomas: no se declara soporte multilingüe; el comportamiento fuera del inglés no está evaluado.
- Contexto: la model card no especifica la longitud de contexto efectiva tras la compresión.
- Licencia: Llama 2 Community License, con las restricciones habituales de uso comercial y de redistribución; el repositorio incluye `LICENSE.txt` y `USE_POLICY.md`, y el uso de este derivado queda sujeto a ambos. Cualquier uso comercial debe revisarse contra esos términos.
- Sin adopción verificable: 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia externa de calidad ni de comportamiento en producción.
- No se declaran capacidades de tool calling, agentes ni multimodalidad, por lo que no debe asumirse su disponibilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_basis_remove50_swapdiscnet_b010_r08
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia Llama 2 incluida en el repositorio: https://huggingface.co/Jeesup/svd-safety-l2_basis_remove50_swapdiscnet_b010_r08/blob/main/LICENSE.txt
- Política de uso incluida en el repositorio: https://huggingface.co/Jeesup/svd-safety-l2_basis_remove50_swapdiscnet_b010_r08/blob/main/USE_POLICY.md
- Paper de Basis Sharing (ICLR 2025): referenciado en la model card, sin enlace directo proporcionado (no disponible)
- Repositorio de código del método: no disponible
