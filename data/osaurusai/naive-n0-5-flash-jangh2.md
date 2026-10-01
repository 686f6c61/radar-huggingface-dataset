# OsaurusAI/Naive-N0.5-Flash-JANGH2

## Resumen

OsaurusAI/Naive-N0.5-Flash-JANGH2 es una versión cuantizada del modelo Naive-N0.5-Flash de NaiveAI, un Mixture of Experts de 309 000 millones de parámetros con 15 500 millones activos por token, 256 expertos enrutados y selección top-8, orientado a código y trabajo agéntico con una ventana de contexto nativa de 1 000 000 de tokens. El bundle JANGH2 comprime los 575 GiB de pesos en bf16 hasta 95,89 GiB, con el objetivo declarado de caber en Macs de 128 GB de memoria unificada.

El interés técnico es doble. Por un lado, el modelo base es un caso representativo de la generación actual de MoE de contexto largo: 47 capas sin atención completa, combinando 39 capas de Sliding-Window Attention con 9 de DeepSeek Sparse Attention. Por otro, esta ficha documenta una cuantización calibrada mediante medición por capa, codebooks, rotación Hadamard por bloques y GPTQ sobre estadísticas de entrada por experto, que prioriza preservar las decisiones de enrutamiento y de tool calling en lugar de optimizar solo la perplejidad.

El resultado es una distribución exclusivamente para Apple Silicon a través del runtime Osaurus 0.25.15 o superior, solo texto, en inglés y chino, bajo licencia MIT. En los datos publicados por el autor, la fidelidad frente al modelo bf16 supera de forma clara a una cuantización MLX affine de idéntico tamaño.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) transformer con atención híbrida: Sliding-Window Attention + DeepSeek Sparse Attention, sin capas de atención completa |
| Parámetros totales | 309 000 millones según la model card y el modelo base; 30 187 934 144 según los metadatos de safetensors del repo (discrepancia no aclarada por el autor) |
| Parámetros activos | ~15 500 millones por token |
| Expertos | 256 expertos enrutados, top-8 por token y capa, 47 capas |
| Longitud de contexto | 1 000 000 de tokens nativa |
| Tipos de cuantización | JANGH2: expertos enrutados a 2-4 bits (media 2,54 bits), codebook con escalas por fila, rotación Hadamard por bloques y redondeo GPTQ sobre estadísticas completas de entrada por experto; resto de tensores en affine 8 bits o en la precisión de origen (routers, norms, indexador de atención dispersa) |
| Idiomas soportados | inglés (en) y chino (zh) |
| Licencia | MIT |
| Formato de pesos | MLX safetensors cuantizados (librería mlx, tag gptq) |
| Modelo base | NaiveAI/Naive-N0.5-Flash (relación: quantized) |
| Runtime requerido | Osaurus 0.25.15 o superior (campo required_osaurus_version en osaurus.json) |
| Tamaño de pesos | 95,89 GiB (frente a 575 GiB en bf16) |
| Tamaño del repo | 103,0 GB |
| Modalidad | solo texto |
| Pipeline | text-generation |
| Fecha de publicación | 30 de septiembre de 2026 (según metadatos de HuggingFace) |

## Arquitectura y entrenamiento

El modelo base es un MoE construido sobre MiMo-V2.5, el modelo abierto de Xiaomi, y continuado en entrenamiento por NaiveAI con 3,25 billones de tokens adicionales. Reparte sus 47 capas entre dos mecanismos de atención: 39 capas de Sliding-Window Attention y 9 de DeepSeek Sparse Attention, sin ninguna capa de atención densa completa. Esa combinación es la que permite declarar una ventana nativa de 1 000 000 de tokens. El enrutamiento es top-8 sobre 256 expertos por token y capa, con 15 500 millones de parámetros activos sobre 309 000 millones totales, una ratio de activación cercana al 5 %. El modelo está especializado en código e I+D con IA, e incluye modo de razonamiento (thinking) y soporte de tool calling.

La aportación de esta ficha concreta no está en el entrenamiento, sino en la cuantización. El bundle JANGH2 no aplica una cuantización uniforme: coloca los bits por capa en función de mediciones, cuantiza los expertos enrutados con codebooks y GPTQ sobre las estadísticas de entrada reales de cada experto, y mantiene routers, norms e indexador de atención dispersa en la precisión original. El autor documenta además un techo de fidelidad del propio modelo: al añadir ruido relativo de 0,001 a un único tensor de una capa sobre los pesos sin cuantizar, el token top-1 cambia en el 28 % de las posiciones, y los desempates entre el octavo y el noveno experto se propagan a lo largo de las 47 capas. Por eso todas las tablas comparan contra ese techo y no contra el 100 % de coincidencia.

## Capacidades

- Generación de texto conversacional en inglés y chino, con pipeline text-generation.
- Generación y edición de código: el modelo base está entrenado con foco explícito en coding y en investigación con IA.
- Razonamiento con modo thinking, con niveles de esfuerzo configurables (low, high, max, según las pruebas de comportamiento del autor).
- Tool calling y function calling, incluyendo argumentos multilínea y llamadas encadenadas.
- Uso agéntico multi-turno: conversaciones con herramientas, ida y vuelta de tool round trips y decisiones de "llamar herramienta o responder".
- Contexto largo nativo de hasta 1 000 000 de tokens para documentos extensos y repositorios completos.
- Multilingüe limitado a inglés y chino; no se declaran otros idiomas.
- Sin capacidades de visión ni audio: el modelo es exclusivamente de texto.
- Despliegue local en Apple Silicon mediante el runtime Osaurus y la librería MLX.

## Casos de uso

- Asistencia de código en repositorios grandes: con 1 000 000 de tokens de contexto nativo se puede cargar un repositorio entero más su historial de issues y pedir refactorizaciones o auditorías sin trocear el código.
- Agentes de desarrollo autónomos: el soporte de tool calling, llamadas encadenadas y argumentos multilínea permite construir agentes que editan ficheros, ejecutan tests y consultan APIs dentro de un bucle multi-paso.
- Atención al cliente técnica multi-turno: el modelo mantiene conversaciones largas con historial de razonamiento y puede invocar herramientas internas para consultar estado de pedidos o incidencias.
- Análisis de ciberseguridad: es el dominio donde el bundle conserva mejor la fidelidad (KL mediana 0,053 frente al techo 0,024), lo que lo hace adecuado para triaje de alertas, revisión de código sospechoso y correlación de logs largos.
- Procesamiento de documentación extensa en chino e inglés: contratos, normativa o documentación técnica de decenas de miles de tokens, con respuesta en el mismo idioma de la consulta.
- Ejecución local en portátiles de altas prestaciones: al ocupar 95,89 GiB, es viable en un Mac de 128 GB de memoria unificada sin depender de GPUs en la nube, útil para datos que no pueden salir de la organización.
- Prototipado de pipelines de I+D con IA: generación de código de experimentos y revisión de literatura técnica, con el modelo como componente local de un sistema mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, SWE-bench) en la información disponible. Los únicos datos publicados son métricas de fidelidad de la cuantización frente al modelo bf16, evaluadas sobre 68 370 posiciones con teacher forcing y 28 prompts retenidos (coding, ciberseguridad, agéntico, general, chino, ciencia y académico), con KL renormalizada sobre top-128.

Fidelidad global frente al modelo bf16:

| Variante | Tamaño | KL mediana ↓ | KL media ↓ | p90 / p95 / p99 ↓ | top-1 ↑ | top-5 ↑ | top-10 ↑ |
|---|---|---|---|---|---|---|---|
| Techo: bf16 + ruido 0,001 en un tensor | 575 GiB | 0,060 | 0,749 | 2,23 / 4,26 / 9,62 | 71,6 % | 85,8 % | 89,1 % |
| Naive-N0.5-Flash-JANGH2 | 95,89 GiB | 0,170 | 1,008 | 3,11 / 5,37 / 10,50 | 64,4 % | 81,5 % | 85,6 % |
| MLX affine RTN, mismo tamaño | 95,83 GiB | 1,552 | 2,976 | 8,04 / 11,06 / 16,78 | 48,2 % | 64,1 % | 68,6 % |

Fidelidad por dominio (KL mediana · top-1):

| Dominio | Posiciones | Techo | JANGH2 | MLX affine RTN |
|---|---|---|---|---|
| Ciberseguridad | 6 653 | 0,024 · 76,4 % | 0,053 · 73,0 % | 1,653 · 48,5 % |
| Coding | 8 249 | 0,031 · 73,7 % | 0,082 · 68,8 % | 1,086 · 53,0 % |
| Coding, prompts largos | 9 390 | 0,036 · 74,5 % | 0,085 · 69,9 % | 1,165 · 54,3 % |
| Agéntico | 7 411 | 0,096 · 66,9 % | 0,238 · 60,4 % | 1,864 · 43,7 % |
| Agéntico, prompts largos | 10 190 | 0,152 · 63,7 % | 0,248 · 59,0 % | 2,205 · 48,7 % |
| General | 5 311 | 0,074 · 71,5 % | 0,242 · 60,6 % | 1,864 · 42,8 % |
| Documentos largos | 10 990 | 0,059 · 74,0 % | 0,222 · 63,4 % | 1,465 · 47,1 % |
| Chino | 3 158 | 0,038 · 77,8 % | 0,172 · 65,1 % | 1,496 · 43,7 % |
| Académico | 3 123 | 0,072 · 73,1 % | 0,213 · 62,3 % | 1,542 · 44,8 % |
| Ciencia | 3 895 | 0,100 · 68,5 % | 0,356 · 57,2 % | 1,426 · 46,8 % |

Fidelidad en tool use (96 conversaciones retenidas, 65 719 posiciones, 208 puntos de decisión, herramientas fuera del conjunto de calibración):

| Métrica | Techo | JANGH2 | MLX affine RTN |
|---|---|---|---|
| Puntos donde el modelo inicia tool call (bf16: 100) | 97 | 101 | 83 |
| Decisiones invertidas (call ↔ answer) frente a bf16 | 9 | 7 | 27 |
| Mismo siguiente token que bf16, puntos de tool call | 92,0 % | 93,8 % | 75,9 % |
| Mismo siguiente token que bf16, puntos de respuesta | 91,7 % | 88,5 % | 55,2 % |
| P(«<tool_call>») mediana en puntos de tool call (bf16: 0,859) | 0,850 | 0,889 | 0,817 |
| P(«<tool_call>») mínima en un punto de tool call | 0,053 | 0,133 | 0,0003 |
| KL mediana, conversación completa | 0,292 | 0,395 | 3,112 |
| Coincidencia top-1, conversación completa | 55,1 % | 51,3 % | 22,7 % |

Comportamiento en servicio (temperatura 0):

| Suite | JANGH2 | MLX affine RTN |
|---|---|---|
| Evaluación de tool use de 48 casos (required / auto × thinking on / off) | 48 / 48 | 34 / 48 |
| 20 pruebas de comportamiento (aritmética, seguimiento con historial de razonamiento, tool round trips, llamadas encadenadas, argumentos multilínea, esfuerzos low/high/max, prompt de aguja de 5 173 tokens) | 20 / 20 | 11 / 20 |

## Requisitos de hardware

- Memoria unificada: el bundle ocupa 95,89 GiB, por lo que está pensado para Macs con 128 GB de memoria unificada. No cabe en configuraciones de 64 GB.
- GPU: exclusivamente Apple Silicon. La librería es MLX y el runtime indicado es Osaurus 0.25.15 o superior. No hay pesos GGUF ni compatibilidad declarada con CUDA (A100, H100, RTX 4090) en esta distribución.
- Comparación de tamaño: los pesos bf16 del modelo base ocupan 575 GiB, fuera del alcance de cualquier equipo de consumo; el bundle JANGH2 reduce ese requisito en un factor de 6.
- Caché KV: no disponible para contexto de 1 000 000 de tokens; el autor no publica cifras de memoria de caché ni de longitud práctica máxima en 128 GB.
- Opciones de despliegue: runtime Osaurus (con prefill en fragmentos de 2 048 tokens según la metodología de medición) y MLX. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este bundle.
- Latencia y throughput: el autor afirma que la velocidad es equivalente a la de una cuantización MLX simple del mismo tamaño, pero no publica tokens por segundo ni latencias concretas.
- Almacenamiento: el repo ocupa 103,0 GB, por encima del tamaño de los pesos por el resto de artefactos del bundle.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tamaño en disco | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Naive-N0.5-Flash-JANGH2 (esta ficha) | 309 000 M totales, ~15 500 M activos | 1 000 000 tokens | 95,89 GiB | MIT | HuggingFace, MLX, runtime Osaurus |
| NaiveAI/Naive-N0.5-Flash (base) | 309 000 M totales, ~15 500 M activos | 1 000 000 tokens | 575 GiB en bf16 | MIT | HuggingFace |
| Control MLX affine RTN del mismo origen | mismos parámetros | 1 000 000 tokens | 95,83 GiB | no publicado | no publicado (control interno del autor) |

No se dispone de datos comparativos frente a otros MoE abiertos de tamaño similar (por ejemplo, alternativas de la familia DeepSeek o Qwen) en la información proporcionada, ni de resultados de benchmarks estándar que permitan situar el modelo base frente a ellos. La comparación publicada se limita a las tres variantes de la tabla, que comparten pesos de origen y difieren solo en el esquema de cuantización.

## Limitaciones y advertencias

- Techo de fidelidad estructural: el enrutamiento top-8 sobre 256 expertos hace que ninguna cuantización pueda alcanzar el 100 % de coincidencia con el bf16, y las inversiones se acumulan a lo largo de 47 capas. El propio techo medido es del 71,6 % de coincidencia top-1.
- Degradación desigual por dominio: la calibración está sesgada hacia coding, tool use y ciberseguridad, donde el bundle queda más cerca del original. En general, chino y ciencia la pérdida es notablemente mayor (por ejemplo, ciencia: KL mediana 0,356 frente a un techo de 0,100).
- Riesgo de alucinación: no se publican evaluaciones de veracidad ni de tasas de alucinación para el modelo base ni para el bundle.
- Idiomas: solo inglés y chino. No hay soporte declarado de castellano ni de otros idiomas.
- Modalidad: solo texto; sin visión, audio ni entrada multimodal.
- Restricciones de licencia: MIT, lo que permite uso comercial sin royalties, pero el autor no publica información sobre las licencias y condiciones del modelo base subyacente MiMo-V2.5 de Xiaomi, que conviene verificar antes de un despliegue comercial.
- Dependencia de runtime: el bundle requiere Osaurus 0.25.15 o superior y MLX. No es portable a CUDA ni a stacks de inferencia convencionales, lo que limita el despliegue en servidores.
- Ausencia de benchmarks estándar: no hay MMLU, HumanEval, GSM8K ni resultados de contexto largo independientes. Las cifras publicadas miden fidelidad de cuantización, no calidad absoluta del modelo.
- Inconsistencia documental: los metadatos de safetensors del repo indican 30 187 934 144 parámetros frente a los 309 000 millones declarados en la model card, una diferencia de un orden de magnitud que el autor no explica.
- Reproducibilidad: el control MLX affine RTN usado como referencia no está publicado, por lo que esa comparación no puede verificarse de forma independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OsaurusAI/Naive-N0.5-Flash-JANGH2
- Modelo base NaiveAI/Naive-N0.5-Flash: https://huggingface.co/NaiveAI/Naive-N0.5-Flash
- Ficheros del modelo base: https://huggingface.co/NaiveAI/Naive-N0.5-Flash/tree/main
- Repositorio GitHub de NaiveAI-Labs: https://github.com/NaiveAI-Labs/Naive-N0.5-Flash/tree/main
- Sitio de NaiveAI: https://naive.ai/en/
- Ficha en There's An AI For That: https://theresanaiforthat.com/model/naive-n0-5-flash/
- Sitio de Osaurus: https://osaurus.ai
