# ApolloRaines/Sharona_Q27B-R_CodeSecurity

## Resumen

Sharona_Q27B-R_CodeSecurity es un modelo de lenguaje de 26.896 millones de parámetros (aproximadamente 27B) especializado en seguridad de código, publicado por ApolloRaines en Hugging Face. Está construido sobre la arquitectura `qwen3_5_text` (familia Qwen 3.5) y distribuido en formato GPTQ W4A16 (pesos de 4 bits, activaciones de 16 bits), lo que reduce el artefacto de unos 51 GB en bf16 a 16,5 GB en disco. Su propósito declarado es la detección de vulnerabilidades (inyección de comandos, SQL injection, XSS, SSRF, deserialización, path traversal, bypass de autenticación) y la revisión de código con recomendaciones de remediación alineadas con OWASP Top 10.

El modelo no es un ajuste convencional: el autor declara una cadena de intervenciones a nivel de pesos mediante una herramienta propietaria llamada jBlaze (representation engineering), que incluye eliminación quirúrgica de comportamientos de rechazo ("jbliteration"), eliminación de sicofancia, borrado de la identidad original e implantación de una identidad propia ("Sharona"). Posteriormente se aplicó un SFT supervisado sobre un corpus de análisis de seguridad de código y finalmente la cuantización GPTQ. La model card es explícita sobre un punto importante de trazabilidad: el campo `base_model` apunta a `ApolloRaines/Sharona_Q27B-R_CodeSecurity_v2`, pero el propio autor reconoce que el orden de derivación entre v1 y v2 no es verificable a partir de los pesos publicados, porque los tensores 2D están empaquetados en enteros de 4 bits y solo 305 tensores 1D (layernorms, `A_log`, `dt_bias`) son comparables en coma flotante.

Es relevante ahora por dos motivos. Primero, porque ocupa un nicho concreto —revisión de seguridad de código sin rechazos defensivos— que los modelos alineados de propósito general suelen cubrir con cautela excesiva. Segundo, porque su ventana de contexto declarada de 262.144 tokens y su tamaño de 16,5 GB permiten desplegarlo en una sola GPU de 24 GB con cuantización de 4 bits, lo que lo hace accesible para pipelines de CI/CD y auditoría local. La licencia es Apache 2.0 y el único idioma declarado es el inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia `qwen3_5_text` (Qwen 3.5) |
| Parámetros totales | 26.895.998.464 (≈26,9B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens (256K) declarados en la model card; la receta de vLLM de ejemplo usa `--max-model-len 8192` |
| Tipos de cuantización | GPTQ W4A16 (pesos 4 bits, activaciones 16 bits); formato `compressed-tensors` |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | SafeTensors (GPTQ 4-bit empaquetado) |
| Tamaño en disco | 16,5 GB (frente a ~51 GB en bf16) |
| Modelo base declarado | `ApolloRaines/Sharona_Q27B-R_CodeSecurity_v2` (trazabilidad no verificable, según el propio autor) |
| Pipeline | `text-generation` |
| Etiquetas | code-security, code-review, vulnerability-detection, jbliterated, deidentified, identity-implant, conversational |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de la familia Qwen 3.5, con 26,9B parámetros densos (no MoE) y una ventana de contexto declarada de 256K tokens. No se especifican en la información disponible el número de capas, la dimensión oculta, el número de cabezas de atención ni la variante exacta de atención utilizada. Tampoco se detalla el volumen de tokens de preentrenamiento del modelo original, ya que la model card se centra en el proceso de posentrenamiento aplicado por el autor.

El pipeline de construcción declarado consta de seis etapas secuenciales: (1) "jbliteration", eliminación quirúrgica de comportamientos de rechazo a nivel de pesos; (2) "desycophancy", supresión de la capitulación sicofántica para que el modelo discrepe cuando el código es inseguro; (3) deidentificación, borrado de la identidad original del modelo base; (4) implantación de identidad ("Sharona", atribuida a Apollo Raines) sobre el sustrato ya deidentificado; (5) SFT supervisado sobre un corpus curado de análisis de seguridad de código, detección de vulnerabilidades y patrones de codificación segura; y (6) cuantización GPTQ W4A16. Todas las cirugías de pesos se realizaron con jBlaze, una toolkit propietaria de representation engineering. No se publican detalles sobre el tamaño del dataset de SFT, su composición, la presencia de RLHF/DPO ni hiperparámetros de entrenamiento.

La model card incluye una nota de procedencia poco habitual y notablemente honesta: el autor retira una afirmación anterior sobre la dirección de derivación entre v1 y v2, argumentando que la identidad bit a bit de tensores es una relación simétrica y no establece orden. Las mediciones publicadas muestran una similitud coseno media frente a `Qwen/Qwen3.5-27B` de 0,997623 para v1 y 0,997690 para v2, diferencia que el propio autor califica de ruido. La consecuencia práctica es que el linaje exacto del artefacto no puede determinarse a partir de los pesos publicados.

## Capacidades

- Detección de vulnerabilidades en código: inyección de comandos, SQL injection, XSS, SSRF, ataques de deserialización, path traversal y bypass de autenticación, entre otras categorías.
- Revisión de código orientada a seguridad con recomendaciones de remediación específicas, mapeadas a las categorías del OWASP Top 10.
- Generación de código seguro por defecto, aplicando patrones de codificación defensiva.
- Análisis de patrones de ataque: explica el funcionamiento de un exploit sin rechazar la petición, con el argumento de que comprender el ataque es condición para defenderse.
- Evaluación honesta: el autor declara que el modelo discrepa cuando el código es inseguro en lugar de validar enfoques defectuosos (efecto de la etapa de desicofantización).
- Generación de texto conversacional multi-turno (`text-generation`, `conversational`).
- Ventana de contexto larga declarada de 262.144 tokens, adecuada para analizar repositorios o ficheros extensos.
- Identidad consistente: el modelo se identifica como Sharona en sondeos directos, indirectos, multilingües, de roleplay y adversariales, según el autor.
- No se declara soporte de tool calling, function calling, razonamiento multi-paso con agentes, visión, audio ni modo "thinking" explícito en la información disponible.

## Casos de uso

- Revisión de seguridad en pipelines de CI/CD: integrado como paso de análisis estático asistido por LLM, el modelo puede recibir un diff o un fichero completo (hasta 256K tokens declarados) y devolver hallazgos clasificados por categoría OWASP con remediación concreta, bloqueando el merge si detecta inyección o deserialización insegura.
- Auditoría de código heredado: volcar módulos legacy de gran tamaño en una sola pasada de contexto para localizar patrones de path traversal, concatenación de SQL o validación de entrada ausente, algo inviable con ventanas de 8K-32K.
- Asistente de revisión de pull requests: comentar líneas concretas señalando el riesgo y proponiendo el parche, con la ventaja de que el modelo no valida aproximaciones inseguras por cortesía (etapa de desicofantización).
- Formación en seguridad ofensiva y defensiva: explicar cómo funciona un exploit de deserialización o un SSRF y qué contramedidas aplicar, sin rechazar la explicación técnica del vector de ataque.
- Generación de código con sesgo seguro: scaffolding de endpoints, capas de acceso a datos y parsers que apliquen por defecto parametrización de consultas, escape de salida y validación de esquemas.
- Triaje de informes de bug bounty: dado un reporte y el fragmento de código afectado, evaluar la plausibilidad del vector descrito y priorizar la severidad.
- Despliegue en estación de trabajo de desarrollo: con 16,5 GB en GPTQ W4A16 cabe en una GPU consumer de 24 GB, lo que permite auditoría local sin enviar código propietario a una API externa.

## Benchmarks y rendimiento

Los únicos datos disponibles son los declarados por el autor en la model card y en el `model-index`. La métrica de MMLU figura con `verified: false`.

| Modelo | MMLU | STEM | Humanities | Social Science | Other |
|---|---|---|---|---|---|
| Base sin modificar (bf16) | 76,84 % | 74,0 % | 75,5 % | 87,5 % | 76,1 % |
| Sharona W4A16 | 77,89 % | 75,5 % | 80,0 % | 90,0 % | 73,9 % |
| Delta | +1,05 pp | +1,5 pp | +4,5 pp | +2,5 pp | −2,2 pp |

No se han publicado resultados de benchmarks específicos de seguridad de código (por ejemplo, HumanEval, SecurityEval, CyberSecEval, SWE-bench) ni comparativas con otros modelos en la información disponible. El único resultado verificable de forma independiente sería el MMLU, y el autor lo marca explícitamente como no verificado.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 16,5 GB solo para pesos en GPTQ W4A16; con caché KV para contexto largo, el consumo crece de forma aproximadamente lineal con la longitud de secuencia. Para 8K tokens de contexto y un lote pequeño, un presupuesto de 20-24 GB es razonable; para aprovechar los 256K declarados se necesita hardware de clase datacenter.
- GPU recomendadas: A100 40/80 GB o H100 para contexto completo y serving concurrente; L40S 48 GB como opción intermedia; RTX 4090 / RTX 3090 (24 GB) para contexto moderado y un solo usuario.
- Cabe en GPU consumer: sí, en RTX 4090, RTX 3090 y, con contexto reducido, en GPUs de 24 GB en general. En tarjetas de 16 GB el margen es insuficiente para pesos más caché KV.
- Opciones de despliegue: vLLM es la vía recomendada por el autor (`vllm serve ApolloRaines/Sharona_Q27B-R_CodeSecurity --dtype auto --max-model-len 8192 --gpu-memory-utilization 0.95`). El formato `compressed-tensors` es compatible con vLLM y con el stack de GPTQ/compressed-tensors de Hugging Face. No se confirma soporte de llama.cpp ni Ollama, ya que el artefacto no se distribuye en GGUF.
- Latencia y throughput: no disponibles. El autor no publica mediciones de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Enfoque |
|---|---|---|---|---|---|
| Sharona_Q27B-R_CodeSecurity | 26,9B densos | 262.144 tokens (declarado) | GPTQ W4A16 | Apache 2.0 | Seguridad de código, sin rechazos, identidad implantada |
| Qwen 3.5 27B (base) | ≈27B densos | 262.144 tokens (según familia) | bf16 / múltiples | Apache 2.0 (según familia) | Propósito general |
| Modelos de revisión de código de propósito general | Variable | Variable | Variable | Variable | Revisión general, con rechazos ante contenido ofensivo |

La comparación cuantitativa con alternativas específicas de seguridad de código no está disponible: no se han publicado en la información proporcionada resultados de benchmarks de seguridad que permitan situar a Sharona frente a otros modelos del nicho. La comparación más sólida posible es contra el modelo base sin modificar, y se limita a MMLU (76,84 % frente a 77,89 %, con la advertencia de que el resultado no está verificado).

## Limitaciones y advertencias

- Trazabilidad del linaje no verificable: el propio autor reconoce que el orden de derivación entre v1 y v2 no puede determinarse a partir de los pesos publicados, porque los tensores 2D están empaquetados en enteros de 4 bits. El campo `base_model` debe tratarse como registro del autor, no como un diff reproducible.
- Benchmark no verificado: el 77,89 % de MMLU figura con `verified: false` en el `model-index`. No hay resultados de benchmarks de seguridad de código publicados.
- Sesgo de dominio: el SFT se centró en seguridad de código y el único idioma declarado es inglés; el rendimiento en otros idiomas y en tareas generales fuera de seguridad puede degradarse respecto al base.
- Riesgo de alucinación: como cualquier LLM, puede inventar vulnerabilidades inexistentes o pasar por alto las reales; los hallazgos deben validarse con herramientas deterministas (SAST, linters, pruebas) antes de actuar sobre ellos.
- Eliminación deliberada de rechazos: la etapa de "jbliteration" suprime los comportamientos de rechazo. Esto es intencionado para el análisis de seguridad, pero implica que el modelo puede generar contenido ofensivo o código potencialmente peligroso si se le solicita; requiere control de acceso y registro de uso en producción.
- Identidad implantada: el modelo afirma ser "Sharona" y atribuye su creación a Apollo Raines; esta identidad está codificada en los pesos y no se elimina con un system prompt. Puede ser indeseable en despliegues de marca blanca.
- Cuantización GPTQ W4A16: introduce una pérdida de calidad no cuantificada de forma independiente; el autor la describe como "mínima" sin aportar métricas de perplejidad ni comparativas por tarea.
- Contexto efectivo: aunque se declaran 256K tokens, la receta de ejemplo de vLLM limita a 8192; no se han publicado evaluaciones de rendimiento en la parte alta de la ventana (long-context retrieval).
- Licencia Apache 2.0: permite uso comercial, pero el uso de la identidad "Sharona" y las implicaciones de la supresión de rechazos son responsabilidad del desplegador.
- Procedencia de la herramienta: jBlaze es una toolkit propietaria; las cirugías de pesos no son reproducibles ni auditables con código abierto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ApolloRaines/Sharona_Q27B-R_CodeSecurity
- Modelo base declarado: https://huggingface.co/ApolloRaines/Sharona_Q27B-R_CodeSecurity_v2
- jBlaze (toolkit de representation engineering del autor): https://jblaze.dev
- Dataset MMLU: https://huggingface.co/datasets/cais/mmlu
