# Jeesup/svd-safety-l2_basis_remove40_swapgapnet_b010_r04

## Resumen

`Jeesup/svd-safety-l2_basis_remove40_swapgapnet_b010_r04` es un checkpoint de investigación derivado de `meta-llama/Llama-2-7b-chat-hf`, comprimido mediante la técnica Basis Sharing (ICLR 2025, compartición de bases SVD sobre grupos de 2 capas adyacentes) hasta dejar el 60,0 % de los parámetros densos originales. Sobre ese modelo comprimido se aplicaron 4 de las 10 rondas previstas de un procedimiento iterativo de intercambio de componentes ("parameter-neutral swap"), seleccionados con la regla `swapgapnet_iter`, con un presupuesto de restauración del 1,000 % de los parámetros densos y una fracción del 0,100 % por ronda. Tras el intercambio se aplicó una recuperación con LoRA de rango 8 únicamente sobre los coeficientes por capa, manteniendo las bases congeladas.

El modelo no es un asistente de propósito general: es una celda concreta de una rejilla experimental que estudia cómo la compresión SVD degrada el comportamiento de seguridad de un LLM y qué regla de selección de componentes lo repara mejor. La model card del autor advierte explícitamente de que varias celdas de esa rejilla están degradadas en seguridad respecto a Llama-2-7b-chat y que cada checkpoint debe tratarse como sujeto experimental, no como modelo desplegable.

Su relevancia es metodológica: cuantifica el compromiso entre compresión, seguridad y utilidad con métricas medidas (ASR en AdvBench y StrongREJECT, sobrerrechazo macro en WildGuard) y publica la procedencia completa (semilla 42, presupuesto, número de componentes intercambiados). Con 0 descargas y 0 likes en el momento de la consulta, se trata de un artefacto de reproducibilidad más que de un modelo de uso extendido.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 2) con compresión Basis Sharing: bases SVD compartidas sobre grupos de 2 capas adyacentes en las matrices de proyección |
| Parámetros totales | 6.738.415.616 (recuento declarado en safetensors); fracción de parámetros densos resultante según la model card: 0,5999 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens (heredada de Llama-2-7b-chat; no se indica explícitamente en la model card) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors; no se ofrecen GGUF ni cuantizaciones int8/int4) |
| Idiomas soportados | no disponible en la model card (el modelo base Llama 2 está orientado principalmente a inglés) |
| Licencia | Llama 2 Community License (se incluyen `LICENSE.txt` y `USE_POLICY.md` en el repositorio) |
| Formato de pesos | safetensors (librería `transformers`) |

Datos adicionales de procedencia declarados por el autor:

| Campo | Valor |
|---|---|
| Modelo base (sin comprimir) | `meta-llama/Llama-2-7b-chat-hf` |
| Compresión | Basis Sharing, 40,00 % de parámetros eliminados |
| Regla de selección | `swapgapnet_iter` |
| Presupuesto de restauración | 1,000 % de los parámetros densos |
| Componentes restaurados / intercambiados | 1.805 / 1.805 |
| Semilla | 42 |
| Recuperación | LoRA r=8 solo sobre coeficientes por capa (bases congeladas), 2 épocas, lr 0,0001, batch 64, dataset alpaca-cleaned |
| Rondas iterativas aplicadas | 4 de 10 |
| Tamaño de bloque por ronda | 0,100 % de los parámetros densos |
| Parámetros intercambiados | 25.889.536 (0,40 % de los parámetros de proyección densos) |
| Valor de intercambio | `net` (valor de inserción + valor de eliminación del desalojo ordenado por sigma) |
| Checkpoint | ronda intermedia de una ejecución más larga |

## Arquitectura y entrenamiento

La base es un transformer decoder-only de la familia Llama 2 (atención con RoPE, normalización RMSNorm, activación SwiGLU), en su variante chat de 7B. La modificación estructural consiste en comprimir las matrices de proyección aplicando descomposición en valores singulares y compartiendo las bases entre grupos de 2 capas adyacentes (Basis Sharing, ICLR 2025), lo que elimina el 40,00 % de los parámetros densos. Sobre el modelo comprimido se ejecuta un procedimiento de intercambio de componentes con la regla `swapgapnet_iter`: en cada ronda se seleccionan componentes individuales y se conmutan por otros, con un presupuesto del 0,100 % de parámetros densos por ronda. Este checkpoint corresponde a la ronda 4 de 10, con 1.805 componentes restaurados y 1.805 desalojados, todos con valor `net`.

La recuperación posterior es deliberadamente ligera y restringida: LoRA de rango 8 aplicado únicamente a los coeficientes por capa, con las bases congeladas y sin alterar el presupuesto de parámetros, durante 2 épocas con learning rate 0,0001, batch 64 y el dataset alpaca-cleaned. La semilla es fija (42). No se documentan en la información disponible el número de tokens totales de entrenamiento, la composición completa del dataset ni si hubo etapas de RLHF o DPO adicionales; la alineación por preferencias procede del modelo base Llama-2-7b-chat. Tampoco se describen innovaciones de decodificación (decodificación especulativa, atención lineal) ni mecanismos de razonamiento extendido.

## Capacidades

- Generación de texto conversacional en formato chat, heredada del modelo base Llama-2-7b-chat, sujeta a la degradación inducida por la compresión.
- Generación de código y resolución de problemas matemáticos básicos en la medida en que lo permite el modelo base, aunque la model card no publica evaluaciones de estas capacidades.
- Capacidad multilingüe no documentada: la model card no declara idiomas soportados y el modelo base está centrado en inglés.
- Soporte de tool calling / function calling: no disponible ni documentado en la model card.
- Soporte de agentes y razonamiento multi-paso: no documentado; el modelo no está orientado a uso agéntico.
- Capacidad "especial" real: servir como sujeto experimental para medir el efecto de la compresión SVD y de las reglas de selección de componentes sobre el comportamiento de seguridad (ASR medido) y sobre el sobrerrechazo.
- No incluye visión, audio ni modo de razonamiento explícito ("thinking mode").

## Casos de uso

- Investigación sobre compresión de LLM: medir cómo el 40,00 % de eliminación de parámetros vía Basis Sharing afecta a la perplejidad, la utilidad y la seguridad, comparando esta celda con las demás celdas de la rejilla (`remove40` con distintas reglas de selección y presupuestos).
- Evaluación de reglas de selección de componentes: usar este checkpoint, fijado con `swapgapnet_iter` y 4 de 10 rondas, como punto de comparación frente a otras reglas para determinar cuál repara mejor el daño de seguridad por unidad de presupuesto restaurado.
- Red-teaming y medición de seguridad: ejecutar AdvBench y StrongREJECT con un juez tipo HarmBench para reproducir los valores publicados (ASR 0,1231 y 0,1342) y validar la metodología de evaluación en un artefacto controlado.
- Estudio del sobrerrechazo: emplear la métrica de sobrerrechazo macro con WildGuard (0,1458) para analizar el coste en utilidad de las intervenciones de seguridad tras compresión y edición de componentes.
- Análisis de interpretabilidad de subespacios: aprovechar las bases SVD compartidas por pares de capas para estudiar qué direcciones singulares concentran comportamiento relacionado con rechazo y seguridad, y cómo cambian al restaurar componentes.
- Ablación académica y reproducibilidad: con semilla 42, presupuesto y recuento exacto de componentes publicados, el checkpoint permite replicar experimentos de compresión con presupuesto controlado y publicar comparaciones auditables.
- Docencia en cursos de eficiencia de modelos: ilustrar con un caso real la diferencia entre reducción de parámetros densos (fracción 0,5999), recuento de tensores almacenados (6.738.415.616) y presupuesto de restauración (1,000 %).
- Línea base negativa en pipelines de despliegue seguro: verificar si un sistema de moderación o filtrado externo detecta el incremento de ASR de un modelo comprimido antes de considerar cualquier compresión en producción.

## Benchmarks y rendimiento

La model card únicamente publica métricas de seguridad medidas con juez HarmBench y sobrerrechazo con WildGuard. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, MT-Bench) en la información disponible.

| Métrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,1231 |
| StrongREJECT ASR (juez HarmBench) | 0,1342 |
| Sobrerrechazo macro (WildGuard) | 0,1458 |

No se proporcionan cifras de throughput, latencia ni resultados comparativos frente al modelo base en la información disponible. El autor advierte que la compresión por sí sola eleva la tasa de éxito de ataque respecto a Llama-2-7b-chat, por lo que estos valores deben interpretarse como una medición dentro de una rejilla experimental y no como una garantía de seguridad.

## Requisitos de hardware

- VRAM estimada en fp16/BF16: en torno a 14 GB solo para pesos (el repositorio ocupa 13,5 GB), más caché KV y overhead, lo que sitúa el requisito práctico en 16-20 GB.
- VRAM estimada en int8: aproximadamente 7-8 GB de pesos; en int4, en torno a 4-5 GB.
- GPU recomendadas para fp16: A100 40/80 GB, H100, L40S, RTX 4090 (24 GB), RTX A6000.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 (24 GB) con fp16; en RTX 4080/4070 Ti (16 GB) con int8; en RTX 3060 12 GB o RTX 4060 Ti 16 GB con cuantización de 4 bits.
- Opciones de despliegue: `transformers` (librería declarada) y Text Generation Inference, ya que el repositorio incluye la etiqueta `text-generation-inference` y `endpoints_compatible`. No se publican pesos GGUF, por lo que llama.cpp y Ollama no son viables sin una conversión previa. La compatibilidad con vLLM no está documentada y, dado que la compresión altera la estructura de las proyecciones, podría requerir adaptaciones.
- Latencia y throughput: no disponible (no se publican mediciones).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Propósito | Disponibilidad |
|---|---|---|---|---|---|
| `Jeesup/svd-safety-l2_basis_remove40_swapgapnet_b010_r04` | 6.738.415.616 almacenados; fracción densa 0,5999 | 4.096 tokens (heredado, no declarado en la card) | Llama 2 Community License | Artefacto de investigación sobre compresión y seguridad | Repositorio HF público, 0 descargas, 0 likes |
| `meta-llama/Llama-2-7b-chat-hf` | 6.738.415.616 | 4.096 tokens | Llama 2 Community License | Asistente conversacional alineado | Ampliamente distribuido |
| Otras celdas de la rejilla `svd-safety-*` del mismo autor | no disponible | no disponible | Llama 2 Community License | Variantes con distintas reglas de selección y presupuestos | Referenciadas de forma agregada en la model card; datos por celda no disponibles |

No se dispone de datos de benchmarks comparativos entre estas alternativas en la información proporcionada, ni de modelos comprimidos de terceros con los que confrontar resultados de forma directa.

## Limitaciones y advertencias

- No es un modelo de propósito general: la propia model card lo describe como artefacto de investigación y desaconseja su uso como asistente desplegable.
- Degradación de seguridad inducida por la compresión: el autor indica que varias celdas de la rejilla son deliberadamente menos seguras que Llama-2-7b-chat y que la compresión por sí sola eleva la tasa de éxito de ataque.
- Riesgo de alucinación: no se publican evaluaciones de veracidad ni de fidelidad factual; la compresión puede agravar comportamientos degenerados no medidos en la card.
- Sesgos: no se documentan análisis de sesgo; se heredan los del modelo base Llama-2-7b-chat, sin evaluación específica tras la compresión.
- Idiomas: no se declaran idiomas soportados; el modelo base está orientado principalmente a inglés, con rendimiento limitado en otras lenguas.
- Contexto limitado a 4.096 tokens (heredado del base), insuficiente para tareas de contexto largo.
- Restricciones de licencia: Llama 2 Community License, con `USE_POLICY.md` vinculante adicional; existen restricciones de uso comercial y obligaciones de atribución. Debe revisarse antes de cualquier uso fuera de investigación.
- Ausencia de cuantizaciones publicadas (sin GGUF, sin int8/int4 oficiales): cualquier cuantización para despliegue debe generarse y validarse por cuenta propia.
- Compatibilidad de despliegue no verificada: al modificar la estructura de las proyecciones, los cargadores estándar y los motores de inferencia optimizados pueden requerir adaptaciones.
- Fecha de creación del repositorio declarada como 2026-09-14, posterior a la fecha de consulta habitual de los índices; conviene verificar la vigencia del artefacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_basis_remove40_swapgapnet_b010_r04
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Paper de Basis Sharing (ICLR 2025) citado en la model card: no disponible (no se proporciona enlace)
- Repositorio de código, demo o blog del autor: no disponible
- No se han encontrado enlaces adicionales relevantes en la búsqueda web realizada; los resultados devueltos corresponden a páginas corporativas de Microsoft sin relación con el modelo.
