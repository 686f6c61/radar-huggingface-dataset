# pengxiang/looped-moe-1.7b-tensorboard

## Resumen

Este repositorio no contiene un modelo desplegable: contiene los registros escalares de TensorBoard de una campaña de entrenamiento de un transformer con arquitectura de bucle (looped) y mezcla de expertos (MoE). El autor, `pengxiang`, publica bajo licencia Apache 2.0 un conjunto de logs de aproximadamente 0,1 GB que documentan un barrido del número de bucles H (H = 1, 3, 6, 9, 12) manteniendo constante el resto de la configuración. Es, por tanto, un artefacto de investigación reproducible más que un modelo utilizable mediante `transformers` o vLLM.

La arquitectura subyacente es un bloque de 15 capas con dimensión oculta 1280 y atención con 20 cabezas de consulta y 10 de clave-valor (GQA), que se aplica H veces sobre la misma entrada. La capa MoE incorpora 30 expertos enrutados más 2 compartidos, con anchura de experto 768 y selección top-8 (incluyendo los compartidos). El total es de 1,69B de parámetros, con aproximadamente 0,63B activos por bucle, lo que desacopla capacidad de parámetros y profundidad efectiva del cómputo por token.

Su relevancia ahora es metodológica: los logs pertenecen a la línea de trabajo LoopMoE, que busca aislar el efecto de la computación iterativa comparando modelos con el mismo número de parámetros totales, los mismos FLOPs por token y ratios de subcapas activas equivalentes. El resultado más citado de esta campaña concreta es que la pérdida de evaluación mejora de forma monótona hasta H = 9 y se degrada ligeramente en H = 12, mientras que H = 1 divergió durante la primera etapa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con bloque de 15 capas reutilizado H veces (looped) y capas MoE; atención con 20 cabezas de consulta y 10 de clave-valor |
| Parámetros totales | 1,69B |
| Parámetros activos | ~0,63B por bucle; top-8 sobre 30 expertos enrutados + 2 compartidos (anchura de experto 768) |
| Longitud de contexto | no disponible (las secuencias de entrenamiento son de 1024 tokens) |
| Tipos de cuantización | no disponible (no se publican pesos) |
| Idiomas soportados | no disponible (los corpus de entrenamiento, dolma3 y FineWeb-Edu, son mayoritariamente en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | no aplica: el repositorio solo contiene logs escalares de TensorBoard (~0,1 GB), sin safetensors, GGUF ni checkpoint alguno |

## Arquitectura y entrenamiento

El modelo es un transformer de tipo looped con MoE. Un único bloque de 15 capas, dimensión oculta 1280 y 20 cabezas de atención (10 para clave-valor, es decir, atención con consultas agrupadas) se aplica H veces de forma recurrentesobre la representación. Cada aplicación del bloque enruta cada token a un subconjunto de expertos: hay 30 expertos enrutados más 2 compartidos, se seleccionan los top-8 (los compartidos siempre incluidos) y cada experto tiene anchura 768. El resultado es un modelo de 1,69B de parámetros totales con unos 0,63B activos por bucle, de modo que el coste por token escala aproximadamente con H × 0,63B mientras que el número de parámetros permanece fijo. La variable independiente del experimento es exclusivamente H, con valores 1, 3, 6, 9 y 12.

El entrenamiento se dividió en tres etapas con un batch global de 1024 secuencias × 1024 tokens (1.048.576 tokens por paso), optimizador AdamW con betas (0,9; 0,95), weight decay 0,1 y recorte de gradiente 1,0. La etapa 1 usa un scheduler WSD con pico 6e-5, 10 % de warmup y 10 % de decaimiento lineal hasta 6e-6 sobre una mezcla de dolma3 y FineWeb-Edu en proporción 50:50. La etapa 2 continúa desde los pesos y el estado del optimizador de la etapa 1, con re-warm durante 570 pasos hasta 6e-5 y después tasa constante, sobre dolma3 únicamente. La etapa 3 aplica un decaimiento lineal de 6e-5 a 6e-6 continuando el orden de datos de la etapa 2. En total, las etapas 1 y 2 suman 56,6B de tokens y la etapa 3 añade 2,1B. No hay evidencia en la información disponible de fases de ajuste por instrucciones, RLHF o DPO: se trata de preentrenamiento con entropía cruzada por token.

| Etapa | Carpeta | Pasos | Tokens | Tasa de aprendizaje | Datos |
|---|---|---|---|---|---|
| 1 | `20b/H*` | 20.000 | 20,97B | WSD, pico 6e-5, 10 % warmup, 10 % decaimiento lineal hasta 6e-6 | dolma3 + FineWeb-Edu, aprox. 50:50 |
| 2 | `cont60b/H*` | 34.000 (punto de parada alineado) | 35,65B | re-warm de 570 pasos hasta 6e-5, después constante | solo dolma3, datos no vistos |
| 3 | `anneal2b/H*` | 2.000 | 2,10B | lineal de 6e-5 a 6e-6 | solo dolma3, continúa el orden de la etapa 2 |

## Capacidades

No hay pesos publicados, por lo que no es posible verificar empíricamente ninguna capacidad de generación. Lo que se puede afirmar a partir de la información disponible es lo siguiente:

- Predicción de siguiente token mediante entropía cruzada: el modelo se entrenó exclusivamente con este objetivo.
- Computación iterativa configurable: el mismo bloque de 15 capas puede aplicarse H veces, lo que permite variar profundidad efectiva sin cambiar el número de parámetros.
- Enrutamiento disperso por token: selección top-8 sobre 32 expertos (30 enrutados + 2 compartidos) en cada aplicación del bloque.
- Evaluación de pérdida sobre un split retenido de 80M tokens procedente de la mezcla de la etapa 1, con lectura de los primeros ~1M tokens en cada evaluación.
- No hay evidencia de soporte de tool calling, function calling, uso como agente, razonamiento multi-paso explícito, modo de pensamiento, visión, audio ni capacidades multilingües verificadas.
- No se publica tokenizador, configuración de modelo, código de inferencia ni plantilla de chat.

## Casos de uso

Conviene subrayar que estos casos se refieren al artefacto publicado (los logs) y a la línea de investigación, no al despliegue del modelo, que hoy no es posible por ausencia de pesos.

- Estudio de ablación del número de bucles: los logs permiten trazar la pérdida de evaluación frente a H con todo lo demás constante, lo que sirve para determinar el punto de rendimiento decreciente de la computación iterativa en un presupuesto fijo de parámetros.
- Diseño de arquitecturas eficientes en cómputo: el barrido ayuda a decidir si conviene invertir parámetros en más expertos o en más reutilización del bloque cuando el objetivo es un coste por token dado.
- Análisis de dietas de datos en dos fases: las etapas 1 y 2 permiten comparar el efecto de pasar de una mezcla dolma3 + FineWeb-Edu a dolma3 puro, con la discontinuidad de las curvas en la frontera como señal explícita.
- Diagnóstico de estabilidad en el entrenamiento: el caso H = 1, que divergió tras el paso 11k de la etapa 1, documenta un modo de fallo concreto de esta configuración cuando no hay reutilización.
- Reproducción de recetas de decaimiento: la secuencia WSD con re-warm y posterior annealing de 2.000 pasos sobre 2,1B tokens es una plantilla directamente reutilizable para ajustar el tramo final de un preentrenamiento.
- Investigación sobre decodificación con presupuesto variable: la estructura looped abre la puerta a asignar distinto H por token o por petición, una línea que estos logs permiten justificar empíricamente aunque no se publique implementación.
- Docencia y auditoría de experimentos: los tags `module_diag/*` con la norma y varianza de activación de las ramas de atención y MoE permiten estudiar cómo se comportan internamente las ramas a lo largo del entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni similares). El único dato de rendimiento disponible es la pérdida de evaluación final, entropía cruzada media por token en nats sobre el split retenido.

| H | Etapa 1 (paso 20.000) | Etapa 2 (paso 34.000) | Etapa 3 (paso 2.000) |
|---|---|---|---|
| 1 | 4,7957 (divergió) | - | - |
| 3 | 2,5483 | 2,2169 | 2,1903 |
| 6 | 2,3186 | 2,0992 | 2,0685 |
| 9 | 2,2638 | 2,0880 | 2,0500 |
| 12 | 2,2493 | 2,1044 | 2,0586 |

Perplejidad derivada (e elevado a la pérdida) para la etapa 3, incluida solo como lectura auxiliar:

| H | Perplejidad etapa 3 |
|---|---|
| 3 | ~8,94 |
| 6 | ~7,91 |
| 9 | ~7,77 |
| 12 | ~7,83 |

Lectura de los datos: la pérdida cae de 2,1903 (H = 3) a 2,0500 (H = 9) en la etapa final, una mejora de 0,1403 nats, y repunta a 2,0586 con H = 12. La horquilla entre H = 9 y H = 12 es de solo 0,0086 nats, dentro del rango en el que el ruido de estimación sobre ~1M tokens de evaluación puede ser relevante. No hay datos de latencia, throughput ni evaluaciones de calidad generativa.

## Requisitos de hardware

No hay pesos publicados, por lo que todas las cifras de esta sección son estimaciones para un hipotético despliegue de un modelo de 1,69B de parámetros con 0,63B activos por bucle.

- VRAM para pesos en bf16: alrededor de 3,4 GB.
- VRAM para pesos en fp8 o int8: alrededor de 1,7 GB.
- VRAM para pesos en 4 bits: alrededor de 0,9 GB.
- Caché KV: 15 capas × 10 cabezas KV × 64 dimensiones por cabeza × 2 (clave y valor) = 19.200 valores por token, unos 38,4 KB por token en bf16, aproximadamente 39 MB para una secuencia de 1024 tokens. No se especifica si el bucle reutiliza o recalcula la caché en cada iteración.
- Cómputo por token: con la regla aproximada de 2 FLOPs por parámetro activo, unos 1,26 GFLOPs por bucle y token, es decir, del orden de 11 GFLOPs por token con H = 9.
- GPU consumer: un modelo de este tamaño cabe con holgura en tarjetas de 24 GB como la RTX 4090 o la RTX 3090, e incluso en 16 GB con cuantización. No obstante, la implementación del bucle y del enrutamiento MoE requeriría código propio.
- GPU de centro de datos: una A100 o H100 de 80 GB no aporta ventaja de memoria para este tamaño, solo de throughput en entrenamiento o en batches grandes.
- Opciones de despliegue: no disponibles. No hay safetensors ni GGUF, y una arquitectura looped con MoE personalizada no es soportada directamente por vLLM, TGI, llama.cpp u Ollama sin kernels y definiciones de modelo específicas.
- Latencia y throughput: no disponible.

Para inspeccionar los logs basta con TensorBoard leyendo los eventos del repositorio, o con librerías de parseo como `tbparse`; no se requiere GPU.

## Comparativa con modelos similares

No se dispone de datos verificables de modelos comparables en la información proporcionada. La comparación pertinente es la del propio artículo LoopMoE, que enfrenta un modelo looped con uno no looped igualando parámetros totales, FLOPs por token y ratio de subcapas activas, pero los resultados numéricos de esa comparación no forman parte de los datos disponibles aquí.

| Criterio | Este modelo (looped MoE 1,7B) | Alternativas comparables |
|---|---|---|
| Parámetros totales | 1,69B | no disponible |
| Parámetros activos | ~0,63B por bucle | no disponible |
| Contexto | no disponible | no disponible |
| Pérdida de evaluación | 2,0500 nats con H = 9 (etapa 3) | no disponible |
| Licencia | Apache 2.0 (solo logs) | no disponible |
| Pesos disponibles | no | no disponible |

## Limitaciones y advertencias

- El repositorio no publica pesos, tokenizador, configuración ni código de inferencia: es un conjunto de logs de TensorBoard. No se puede desplegar ni evaluar el modelo a partir de este artefacto.
- H = 1 divergió después del paso 11k de la etapa 1 y no se continuó, por lo que la comparación entre configuraciones no cubre el extremo sin reutilización.
- En la etapa 2, las ejecuciones con H = 3 y H = 9 superaron el paso 34.000 (hasta 35.700 y 40.900 respectivamente) antes de detenerse, de modo que las comparaciones deben hacerse en el paso 34.000 o antes.
- La etapa 2 cambia la distribución de datos (dolma3 puro), lo que introduce un codo artificial en las curvas de pérdida en la frontera entre etapas.
- La pérdida de evaluación se calcula leyendo los primeros ~1M tokens de un split retenido de 80M, lo que implica un ruido de estimación no cuantificado en la información disponible.
- No hay ninguna evaluación de sesgos, toxicidad, seguridad, alucinación ni robustez.
- Los corpus de entrenamiento (dolma3, FineWeb-Edu) son mayoritariamente en inglés; no hay evidencia de competencia multilingüe y el autor no declara idiomas soportados.
- No hay benchmarks de razonamiento, código, matemáticas ni conocimiento, por lo que no es posible situar el modelo frente a alternativas de su tamaño.
- La licencia Apache 2.0 se aplica al repositorio de logs; al no existir pesos derivados publicados, no se puede hablar de condiciones de uso comercial del modelo en sí.
- El soporte de contexto está sin documentar: los datos de entrenamiento usan secuencias de 1024 tokens y no se especifica la codificación posicional ni si se aplicó extensión de contexto.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/pengxiang/looped-moe-1.7b-tensorboard
- Pestaña de métricas de entrenamiento: https://huggingface.co/pengxiang/looped-moe-1.7b-tensorboard/tensorboard
- Artículo LoopMoE (arXiv): https://arxiv.org/abs/2606.04438
- PDF del artículo: https://arxiv.org/pdf/2606.04438v1
- Versión en alphaXiv: https://www.alphaxiv.org/abs/2606.04438v1
- Resumen en aimodels.fyi: https://www.aimodels.fyi/papers/arxiv/loopmoe-unifying-iterative-computation-mixture-experts-language
