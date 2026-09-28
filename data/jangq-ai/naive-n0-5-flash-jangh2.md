# JANGQ-AI/Naive-N0.5-Flash-JANGH2

## Resumen

JANGQ-AI/Naive-N0.5-Flash-JANGH2 es un bundle cuantizado en formato MLX del modelo NaiveAI/Naive-N0.5-Flash, publicado por JANGQ-AI. El modelo base es un MoE de aproximadamente 309.000 millones de parámetros totales con 15.500 millones de parámetros activos, 256 expertos enrutados y selección top-8, diseñado específicamente para código y trabajo agéntico. Su rasgo diferencial es una ventana de contexto nativa de 1 millón de tokens construida con atención de ventana deslizante (SWA) combinada con DeepSeek Sparse Attention (DSA) ligera, sin ninguna capa de atención completa.

El bundle resuelve un problema de despliegue muy concreto: los pesos originales en bf16 ocupan 575 GiB, lo que los hace inejecutables en estaciones de trabajo con memoria unificada convencional. JANGH2 comprime esos pesos a 95,89 GiB (expertos enrutados a 2-4 bits, media de 2,54, con cuantización por codebook, escalas por fila, rotación Hadamard por bloques y GPTQ sobre las estadísticas de entrada de cada experto), manteniendo el resto en affine de 8 bits o en la precisión de origen. El objetivo declarado es ejecutar el modelo en Macs de 128 GB.

La relevancia actual del bundle es doble: permite probar un MoE de escala 300B con contexto de 1M en hardware Apple Silicon, y documenta con detalle inusual el coste de fidelidad de la cuantización, incluyendo un techo de acuerdo medido sobre los pesos sin cuantizar. La contrapartida es que el runtime necesario (vMLX en Python) todavía no tiene build público que soporte esta familia de arquitectura.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer con atención híbrida SWA + DeepSeek Sparse Attention (DSA), sin capas de atención completa; 47 capas |
| Parametros totales | 30.187.934.144 según metadatos de safetensors del repo; el modelo base declara ~309.000 millones (575 GiB en bf16). Discrepancia no explicada por el autor |
| Parametros activos | 15.500 millones (15,5B) |
| Longitud de contexto | 1.000.000 tokens (nativo) |
| Tipos de cuantizacion | JANGH2: expertos enrutados a 2-4 bits (media 2,54), codebook con escalas por fila, rotación Hadamard por bloques y GPTQ; resto en affine 8 bits o precisión de origen (routers, norms, indexador de atención dispersa). Etiquetado como 8-bit y gptq |
| Idiomas soportados | inglés (en) y chino (zh) |
| Licencia | MIT |
| Formato de pesos | safetensors, bundle MLX/JANGH (95,89 GiB en disco; repo de 103 GB). No hay GGUF |
| Expertos | 256 expertos enrutados, top-8 por token y capa |
| Entradas soportadas | solo texto |
| Libreria / runtime | mlx; requiere MLX Studio o vMLX |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 28 de septiembre de 2026 |

## Arquitectura y entrenamiento

El modelo base, NaiveAI/Naive-N0.5-Flash, es un MoE de 309B con 15,5B de parámetros activos orientado a código e I+D en IA. Su innovación arquitectónica principal es la sustitución completa de la atención completa por una combinación de Sliding-Window Attention y DeepSeek Sparse Attention ligera, lo que permite sostener una ventana nativa de 1M de tokens. Según la documentación pública del autor, el proceso de post-entrenamiento adaptó el modelo a esta nueva arquitectura de atención dispersa y, además, mejoró de forma sustancial sus capacidades de coding y de investigación en IA. No se dispone del número de tokens de entrenamiento, de la composición del dataset ni de si se aplicaron RLHF, DPO u otras técnicas de alineación.

Este repositorio concreto no reentrena nada: es una cuantización del modelo base. Los expertos enrutados se comprimen con un codebook, escalas por fila, una rotación Hadamard por bloques y redondeo GPTQ calculado sobre las estadísticas de entrada completas de cada experto, con la asignación de bits decidida por capa mediante medición. El resto de tensores se mantiene en affine de 8 bits, salvo routers, norms y el indexador de atención dispersa, que conservan la precisión de origen. La asignación de bits tiene un sesgo claro: el conjunto de calibración está ponderado hacia coding, uso de herramientas y ciberseguridad, que es precisamente donde el bundle queda más cerca del original.

El autor documenta además una propiedad estructural del modelo que condiciona cualquier cuantización: como cada token elige 8 de 256 expertos en cada una de las 47 capas, el octavo y el noveno candidato suelen estar casi empatados y pequeñas perturbaciones cambian la elección. Sobre pesos sin cuantizar, añadir ruido relativo de 0,001 a un solo tensor de una capa cambia el token top-1 en el 28% de las posiciones. Ese resultado se usa como techo de referencia en las tablas de fidelidad.

## Capacidades

- Generación de texto conversacional en inglés y chino, tarea principal declarada del pipeline (`text-generation`).
- Generación y razonamiento sobre código, con el conjunto de calibración y la evaluación centrados explícitamente en dominios de coding.
- Razonamiento agéntico multiturno y multi-paso, con soporte de tool calling / function calling. Las pruebas de fidelidad miden puntos de decisión "llamar a herramienta o responder".
- Modo de razonamiento explícito (`thinking`), según las etiquetas del repositorio.
- Contexto largo nativo de 1M de tokens, útil para documentos extensos y transcripciones de repositorios completos.
- Capacidades orientadas a I+D en IA y optimización de sistemas, según la documentación del modelo base.
- Uso como modelo base para cuantización y despliegue en Apple Silicon.
- No soporta visión, audio ni otras modalidades: es un modelo exclusivamente de texto.
- No se documentan capacidades específicas de matemáticas ni de benchmarking estándar en la información disponible.

## Casos de uso

- Asistencia de código en local sobre Apple Silicon: con 95,89 GiB de pesos y 1M de tokens de contexto, el bundle permite indexar repositorios completos y responder sobre ellos sin salir del equipo, algo inviable con los 575 GiB en bf16.
- Agentes de ingeniería con tool calling: el modelo está entrenado para decidir entre invocar una herramienta o responder, y las pruebas de fidelidad del bundle (208 puntos de decisión sobre herramientas nunca vistas en calibración) muestran que inicia tool calls en 101 de los 112 puntos donde la transcripción de referencia contiene uno, frente a 100 del modelo bf16.
- Automatización de revisiones de seguridad: el dominio de ciberseguridad es el que menor pérdida de fidelidad registra (KL mediana 0,053 frente a 0,024 del techo), lo que lo hace adecuado para triaje de hallazgos y análisis de código sospechoso con contexto largo.
- Análisis de documentación extensa: la ventana de 1M tokens permite procesar manuales, especificaciones o expedientes completos en una sola pasada, con la salvedad de que el dominio de "documentos largos" pierde más fidelidad que coding.
- Pipelines de I+D asistida por IA: dado el foco declarado del modelo base en investigación y optimización de sistemas, puede emplearse para explorar alternativas de diseño, resumir literatura técnica y proponer experimentos.
- Atención técnica en inglés y chino: el soporte bilingüe declarado cubre conversaciones multi-turno en ambos idiomas, aunque el chino muestra mayor degradación por cuantización (KL mediana 0,172 frente a 0,038 del techo).
- Prototipado y evaluación de cuantizaciones: el repositorio sirve como referencia metodológica para medir el coste real de comprimir un MoE de enrutamiento fino, con métricas por dominio y curvas p90/p95/p99.
- No es adecuado para despliegue en producción con SLA estricto en el estado actual, dado que el runtime necesario no está publicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card del modelo base menciona figuras con resultados en tareas de coding, agenticas y de investigación en IA, pero sin cifras accesibles. Lo que sí se publica son métricas de fidelidad de la cuantización frente al modelo bf16, calculadas sobre 68.370 posiciones con teacher forcing en 28 prompts retenidos (coding, ciberseguridad, agentico, general, chino, ciencia y académico; seis de ellos de 4.000 a 6.500 tokens), con KL renormalizada top-128.

| Metrica | Techo (bf16 + ruido 0,001) | JANGH2 | MLX affine RTN (control) |
|---|---|---|---|
| Tamano | 575 GiB | 95,89 GiB | 95,83 GiB |
| KL mediana (menor es mejor) | 0,060 | 0,170 | 1,552 |
| KL media | 0,749 | 1,008 | 2,976 |
| KL p90 / p95 / p99 | 2,23 / 4,26 / 9,62 | 3,11 / 5,37 / 10,50 | 8,04 / 11,06 / 16,78 |
| Acuerdo top-1 | 71,6% | 64,4% | 48,2% |
| Acuerdo top-5 | 85,8% | 81,5% | 64,1% |
| Acuerdo top-10 | 89,1% | 85,6% | 68,6% |

Fidelidad por dominio (KL mediana y acuerdo top-1):

| Dominio | Posiciones | Techo | JANGH2 | MLX affine RTN |
|---|---|---|---|---|
| Ciberseguridad | 6.653 | 0,024 · 76,4% | 0,053 · 73,0% | 1,653 · 48,5% |
| Coding | 8.249 | 0,031 · 73,7% | 0,082 · 68,8% | 1,086 · 53,0% |
| Coding, prompts largos | 9.390 | 0,036 · 74,5% | 0,085 · 69,9% | 1,165 · 54,3% |
| Agentico | 7.411 | 0,096 · 66,9% | 0,238 · 60,4% | 1,864 · 43,7% |
| Agentico, prompts largos | 10.190 | 0,152 · 63,7% | 0,248 · 59,0% | 2,205 · 48,7% |
| General | 5.311 | 0,074 · 71,5% | 0,242 · 60,6% | 1,864 · 42,8% |
| Documentos largos | 10.990 | 0,059 · 74,0% | 0,222 · 63,4% | 1,465 · 47,1% |
| Chino | 3.158 | 0,038 · 77,8% | 0,172 · 65,1% | 1,496 · 43,7% |
| Académico | 3.123 | 0,072 · 73,1% | 0,213 · 62,3% | 1,542 · 44,8% |
| Ciencia | 3.895 | 0,100 · 68,5% | 0,356 · 57,2% | 1,426 · 46,8% |

Fidelidad de uso de herramientas (96 conversaciones retenidas, 65.719 posiciones, 208 puntos de decisión; el modelo bf16 inicia tool call en 100 de los 112 puntos en los que la transcripción contiene uno):

| Metrica | Techo | JANGH2 | MLX affine RTN |
|---|---|---|---|
| Puntos de tool call donde el modelo inicia llamada (bf16: 100) | 97 | 101 | 83 |
| Decisiones invertidas llamada ↔ respuesta frente a bf16 | 9 | 7 | 27 |
| Mismo siguiente token que bf16 en puntos de tool call | 92,0% | 93,8% | 75,9% |
| Mismo siguiente token que bf16 en puntos de respuesta | 91,7% | 88,5% | 55,2% |
| P(`<tool_call>`) mediana en puntos de tool call (bf16: 0,859) | 0,850 | 0,889 | 0,817 |
| P(`<tool_call>`) mínima en un punto de tool call | 0,053 | 0,133 | 0,0003 |

## Requisitos de hardware

- Memoria: el bundle ocupa 95,89 GiB en disco y está pensado para Macs con 128 GB de memoria unificada. Por debajo de esa cifra no cabe con margen razonable.
- GPU: no se documenta soporte CUDA. Al ser un bundle MLX, el hardware objetivo es Apple Silicon (familias M-series con 128 GB, típicamente M2 Ultra, M3 Ultra o M4 Max con esa configuración).
- No cabe en GPUs de consumo tipo RTX 4090 (24 GB) ni en configuraciones multi-GPU convencionales sin portar los pesos a otro formato, algo que no se ofrece.
- Opciones de despliegue: MLX Studio o vMLX. Las builds publicadas de vMLX no incluyen la familia `naive_n05_flash` y no pueden cargar el bundle; la validación se hizo sobre una build de desarrollo. El soporte para Osaurus / Swift no está publicado.
- Velocidad: el autor indica que el bundle corre a la velocidad de una cuantización MLX estándar del mismo tamaño. No se publican cifras de latencia ni de throughput en tokens por segundo.
- Prefill: JANGH2 y el control se sirven con chunks de prefill de 2048 tokens.
- Limitación conocida de la build de desarrollo: la reutilización de caché de prefijo / SSD no funciona todavía para este modelo, de modo que un prompt largo repetido se vuelve a procesar en lugar de restaurarse desde caché.

## Comparativa con modelos similares

No se dispone de información sobre otros bundles cuantizados publicados de este mismo modelo base, ni de alternativas comparables en la misma categoría (MoE de ~300B orientado a código con contexto de 1M). La comparación posible es interna, entre el original y dos cuantizaciones del mismo origen:

| Version | Parametros | Contexto | Tamano en disco | KL mediana | Acuerdo top-1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Naive-N0.5-Flash (bf16) | ~309B totales, 15,5B activos | 1M | 575 GiB | 0,060 (techo con ruido) | 71,6% | MIT (modelo base) | Publicado en HuggingFace |
| Naive-N0.5-Flash-JANGH2 | 30.187.934.144 según metadatos (discrepante) | 1M | 95,89 GiB | 0,170 | 64,4% | MIT | Publicado, pero sin runtime estable |
| MLX affine RTN (control interno) | mismo origen | 1M | 95,83 GiB | 1,552 | 48,2% | no aplica | No publicado |

## Limitaciones y advertencias

- Runtime no disponible: las builds publicadas de vMLX no soportan esta arquitectura y no pueden cargar el bundle. Solo funciona en una build de desarrollo, y el soporte Swift / Osaurus no está publicado. No es desplegable en producción hoy.
- Caché de prefijo roto: en la build de desarrollo, la reutilización de caché de prefijo y de SSD no funciona; los prompts largos repetidos se reprocesan íntegramente, con el coste de latencia que eso implica.
- Techo de fidelidad estructural: ningún método de cuantización puede reproducir al 100% el comportamiento del bf16, porque el enrutamiento top-8 sobre 256 expertos amplifica perturbaciones mínimas a lo largo de 47 capas. La referencia correcta es el techo (71,6% de acuerdo top-1), no el 100%.
- Degradación desigual por dominio: la calibración está sesgada hacia coding, tool use y ciberseguridad, que son los dominios donde el bundle se mantiene más fiel. General, chino, académico y, sobre todo, ciencia pierden bastante más (la ciencia cae a 0,356 de KL mediana y 57,2% de acuerdo top-1).
- Riesgo de alucinación: no se publican evaluaciones específicas de veracidad ni de tasa de alucinación para el modelo base ni para el bundle. La pérdida de fidelidad medida implica que el comportamiento del cuantizado puede divergir del original en dominios fuera de calibración.
- Sesgos: no hay información disponible sobre sesgos evaluados.
- Idiomas: solo inglés y chino. No hay soporte declarado de castellano, y el chino ya muestra degradación por cuantización.
- Modalidad: solo texto. No hay visión, audio ni entradas multimodales.
- Licencia: MIT, sin restricciones declaradas para uso comercial. La licencia del bundle es la misma que la del modelo base.
- Discrepancia de parámetros: los metadatos de safetensors del repo declaran 30.187.934.144 parámetros, cifra incompatible con los ~309.000 millones del modelo base y con los 95,89 GiB del bundle a 2,54 bits de media. Conviene verificarla antes de citarla.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, sin validación independiente de terceros.
- Fecha futura: el repositorio está fechado en septiembre de 2026, lo que debe tenerse en cuenta al evaluar su vigencia.

## Enlaces

- Bundle cuantizado: https://huggingface.co/JANGQ-AI/Naive-N0.5-Flash-JANGH2
- Modelo base: https://huggingface.co/NaiveAI/Naive-N0.5-Flash
- Repositorio GitHub del modelo base: https://github.com/NaiveAI-Labs/Naive-N0.5-Flash
- Sitio del autor del modelo base: https://naive.ai/en/
- Cobertura sobre el lanzamiento del modelo base: https://runtimewire.com/article/naiveai-naive-n05-flash-ai-model-development
- Perfil del cuantizador: https://huggingface.co/JANGQ-AI
- Sitio de JANGQ: https://jangq.ai/
- MLX Studio: https://mlx.studio
- vMLX: https://vmlx.net
