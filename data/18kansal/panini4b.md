# 18kansal/panini4b

## Resumen

Pāṇini-Code-4B (identificador `18kansal/panini4b`) es un sistema presentado por su autor, el usuario 18kansal, como un "motor neuro-simbólico" para reparación automática de programas (automated program repair) orientado a tareas de estilo SWE-bench. La propuesta combina un modelo de pesos abiertos de 4.000 millones de parámetros —etiquetado como perteneciente a la familia Gemma— con un arnés determinista de validación denominado "Pāṇini Invariant Harness", que aplica reglas de la gramática generativa de Pāṇini (Aṣṭādhyāyī, c. 500 a. C.) como metáfora formal y envuelve al modelo con bibliotecas de análisis sintáctico y de AST (Parso, Tree-sitter, LibCST, PyFlakes) para forzar la validez sintáctica del código emitido.

El modelo se declara entrenado y evaluado únicamente en inglés y sánscrito, se publica bajo licencia Apache 2.0 y su tesis central es que un transformer probabilístico no tiene modelo interno de sintaxis ni de tipos, por lo que necesita un escudo simbólico externo que garantice que el parche generado compila y pasa las pruebas con código de salida 0. El autor afirma un 65,9 % (329/499) en SWE-bench Verified y un 81,0 % (1337/1651) en un "catálogo evaluado" propio, cifras que, de confirmarse, superarían a Claude 3.5 Sonnet y GPT-4o con dos órdenes de magnitud menos de parámetros.

La relevancia práctica es doble: por un lado, plantea una arquitectura interesante (modelo pequeño + verificación simbólica + bucle test-driven) que es una línea de trabajo real en reparación de código; por otro, la ficha debe leerse con cautela, porque el repositorio de HuggingFace no contiene pesos (18 MB en total, solo `README.md` y `.gitattributes`), registra 0 descargas y 0 likes, y todas las métricas son autodeclaradas y marcadas como `verified: false`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible con detalle. El autor la describe como "motor neuro-simbólico": modelo transformer de la familia Gemma (según tag `gemma`) + arnés determinista de validación sintáctica y de AST |
| Parametros totales | 4,0 B (declarado; también aparece como "Pāṇini-4B" y "Panini-Code-4B") |
| Parametros activos | No aplica: no se declara arquitectura MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible. Se menciona decodificación restringida mediante gramáticas GBNF a nivel de logit |
| Idiomas soportados | Inglés (`en`) y sánscrito (`sa`), según los metadatos de la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible. El repositorio público (18 MB) solo contiene `README.md` y `.gitattributes`; no hay safetensors, GGUF ni ningún otro artefacto de pesos visible |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del transformer (número de capas, dimensiones, tipo de atención, tokenizador ni estrategia de posicionamiento). Lo que sí se detalla es la capa externa: un "Pāṇini Invariant Harness" que envuelve al modelo con quince bibliotecas de software de terceros y aplica tres mecanismos principales. Primero, decodificación restringida por gramáticas GBNF, que enmascara los logits para impedir tokens sintácticamente inválidos en Python. Segundo, validación multinivel del árbol de sintaxis concreta mediante Parso 0.8.7 y Tree-sitter 0.26.0, seguida de reparación automática con LibCST y verificación con PyFlakes. Tercero, un protocolo de evaluación en dos fases: la fase 1 exige reproducir el defecto (código de salida distinto de 0) y la fase 2 exige que las pruebas de aceptación pasen con código de salida 0 en un subproceso real del sistema operativo, sin mocks.

En cuanto a los datos de entrenamiento, no hay ningún dato disponible: no se indica el número de tokens, la composición del corpus, si hubo ajuste fino supervisado, RLHF, DPO o destilación, ni qué subconjunto de SWE-bench se usó para entrenar frente a evaluar. El historial del repositorio incluye mensajes como "Perpetual Kaizen Evolution Cycle 975: Generation 1320", lo que sugiere un proceso de generación o iteración automatizada del propio artefacto, pero no aporta información verificable sobre el entrenamiento del modelo. Tampoco se documenta ninguna innovación de inferencia más allá de la citada decodificación restringida.

## Capacidades

- Reparación automática de código orientada a incidencias de tipo SWE-bench: generación de parches que deben superar pruebas de aceptación ejecutadas como subprocesos reales.
- Verificación sintáctica determinista del código antes de emitirlo, apoyada en Parso, Tree-sitter, LibCST y PyFlakes.
- Decodificación restringida por gramática (GBNF), que en teoría reduce errores de sintaxis a nivel de muestreo de tokens.
- Bucle de razonamiento multi-paso en dos fases (reproducción del fallo y verificación de la solución), descrito por el autor como ejecución autónoma "zero-mock".
- Capacidades multilingües limitadas a inglés y sánscrito según los metadatos; no se declara soporte de otros idiomas.
- No se documenta soporte de tool calling o function calling en el sentido habitual (APIs estructuradas), aunque el sistema invoca herramientas externas de análisis estático dentro del arnés.
- No se declaran capacidades de visión, audio, pensamiento extendido (thinking mode) ni matemáticas más allá de la aritmética implícita en la reparación de código.

## Casos de uso

- Reparación de incidencias en repositorios Python: dado un informe de error y un conjunto de pruebas fallidas, el sistema genera un parche candidato y lo valida ejecutando la suite en un subproceso aislado; el arnés sintáctico reduce el número de iteraciones desperdiciadas en errores de indentación o paréntesis.
- Puerta de calidad en integración continua: el modelo puede colocarse como paso previo al merge para proponer parches automáticos a tests rojos, con la ventaja de que el criterio de aceptación es objetivo (código de salida 0) y no una puntuación de similitud textual.
- Migración y modernización de código heredado: uso de LibCST para reescrituras sintácticas controladas y verificación posterior con pruebas existentes, lo que encaja en tareas de refactor repetitivas.
- Generación de pruebas unitarias a partir de un fallo reproducido: la fase 1 del protocolo exige una reproducción fiable del defecto, lo que constituye un caso de uso directo para ingeniería de test-driven development.
- Asistencia a revisión de código con verificación formal: el modelo propone el cambio y el arnés confirma que el AST resultante es válido y que las invariantes sintácticas se preservan, algo útil en equipos con políticas estrictas de linting.
- Investigación en neuro-simbólico: el sistema sirve como banco de pruebas reproducible para medir cuánto de una mejora en reparación de código proviene del modelo y cuánto del verificador externo, especialmente útil para estudiar el efecto de la decodificación restringida.
- Docencia de compiladores y gramáticas formales: la implementación ejemplifica el uso de gramáticas generativas y de reglas de reescritura aplicadas a la generación de lenguaje, con una correspondencia explícita con las sūtras de Pāṇini.

## Benchmarks y rendimiento

Datos declarados por el autor en el `model-index` de la model card. La métrica se define como "Genuine OS Subprocess Pass Rate (Exit Code 0)" y está marcada como `verified: false`.

| Benchmark | Métrica | Resultado declarado | Verificado |
|---|---|---|---|
| SWE-bench Verified (model-index) | Accuracy (pass rate, exit code 0) | 81,0 | No (`verified: false`) |
| SWE-bench Verified, 500 tareas canónicas (texto de la card) | Pass rate | 65,9 % (329/499) | No |
| Catálogo evaluado propio (texto de la card) | Pass rate | 81,0 % (1337/1651) | No |

Comparativa de referencia incluida en la propia model card (cifras declaradas por el autor, no reproducidas de forma independiente):

| Sistema | Tamaño | SWE-bench Verified (declarado) | Método de verificación declarado |
|---|---|---|---|
| GPT-4o | ~200 B+ | 33,8 % | Arnés sintético |
| Claude 3.5 Sonnet | ~175 B+ | 49,0 % | Runner oficial de Princeton |
| Llama-3-70B | 70 B | 28,6 % | Runners sintéticos de tests unitarios |
| DeepSeek-V2.5 / Coder | 236 B (21 B activos) | 38,8 % | Arneses sintéticos |
| Pāṇini-4B + arnés de invariantes | 4,0 B | 65,9 % (329/499) | Subproceso real de SO, exit code 0 |

Existe una inconsistencia interna: el `model-index` asigna 81,0 a SWE-bench Verified, mientras que el cuerpo de la model card asigna 81,0 % al "catálogo evaluado" (1337/1651) y 65,9 % a SWE-bench Verified. No se han publicado resultados independientes que respalden ninguna de las dos cifras.

## Requisitos de hardware

Estimaciones teóricas para un modelo denso de 4 B, dado que no se publican pesos ni configuración real:

- VRAM para inferencia: aproximadamente 8 GB en bf16/fp16 y entre 2,5 y 3 GB en cuantización de 4 bits, sin contar el KV cache.
- GPU recomendadas: A100 40 GB u H100 para servir en fp16 con lotes grandes y contexto largo; L40S o RTX 6000 Ada como alternativas de 48 GB.
- GPU de consumo: sí cabría en una RTX 4090 (24 GB), RTX 4080 (16 GB) o incluso RTX 4060 Ti (16 GB) en bf16; en 4 bits cabría en GPUs de 8 GB.
- Opciones de despliegue: no hay artefactos publicados, por lo que vLLM, TGI, llama.cpp u Ollama no pueden ejecutar el modelo tal cual; el arnés requiere además un entorno Python con Parso, Tree-sitter, LibCST y PyFlakes, y capacidad de lanzar subprocesos del sistema operativo, lo que exige sandboxing (contenedores, gVisor, Firecracker) en producción.
- Latencia y throughput: no disponibles. Cualquier cifra sería especulativa a falta de pesos y de detalles de arquitectura.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SWE-bench Verified (declarado) | Licencia | Disponibilidad de pesos |
|---|---|---|---|---|---|
| Pāṇini-Code-4B (este) | 4,0 B | No disponible | 65,9 % (329/499) según la card; 81,0 en el model-index | Apache 2.0 | No: el repositorio no contiene pesos |
| Claude 3.5 Sonnet | ~175 B+ (estimado en la card) | No disponible en la información | 49,0 % | Propietaria | Solo API |
| GPT-4o | ~200 B+ (estimado en la card) | No disponible en la información | 33,8 % | Propietaria | Solo API / pesos cerrados |
| Llama-3-70B | 70 B | No disponible en la información | 28,6 % | Licencia comunitaria de Meta | Abiertos |
| DeepSeek-V2.5 / Coder | 236 B totales, 21 B activos | No disponible en la información | 38,8 % | Licencia propia de DeepSeek | Abiertos |

Las cifras de los modelos comparados son las que el propio autor incluye en su tabla; no se han contrastado con las publicaciones originales en esta ficha. En la misma familia del autor existe un artefacto previo, `18kansal/panini-gemma-swe-bench`, con etiquetas equivalentes y resultados marcados como "legacy".

## Limitaciones y advertencias

- Ausencia de pesos: el repositorio ocupa 18 MB y solo publica `README.md` y `.gitattributes`. Un modelo de 4 B en bf16 ocuparía del orden de 8 GB, por lo que no es posible descargar, ejecutar ni reproducir nada de lo afirmado.
- Métricas no verificadas: el `model-index` marca el resultado como `verified: false` y la cifra de 81,0 % del índice contradice el 65,9 % del cuerpo de la model card aplicado a SWE-bench Verified.
- Implausibilidad de la comparación: un salto de +16,9 puntos sobre Claude 3.5 Sonnet con 4 B de parámetros y sin datos de entrenamiento publicados requiere una reproducción independiente antes de tomarse como referencia.
- Sesgo de evaluación: el "catálogo evaluado" de 1651 tareas es propio del autor y no equivale al conjunto oficial de SWE-bench Verified (500 tareas), por lo que los dos porcentajes no son directamente comparables.
- Riesgo de contaminación: no se especifica qué parte de SWE-bench se usó para entrenamiento; con 73 commits y ciclos de evolución automatizados, el riesgo de ajuste sobre el conjunto de evaluación no puede descartarse.
- Idiomas: solo se declaran inglés y sánscrito; no hay evidencia de comportamiento en castellano ni en otros idiomas, lo que limita su uso en equipos hispanohablantes sin adaptación.
- Dependencia del arnés: el rendimiento atribuido al modelo puede provenir en gran medida del verificador determinista; sin ablaciones publicadas no se puede separar la contribución del transformer de la del andamiaje simbólico.
- Requisitos de seguridad en producción: la ejecución de subprocesos reales con código generado por un modelo exige aislamiento fuerte (contenedores efímeros, límites de recursos, sin acceso a red) para evitar ejecución arbitraria de código.
- Licencia: Apache 2.0 permite uso comercial, pero al no existir pesos publicados la licencia es, en la práctica, inaplicable al modelo en sí; el autor no aclara si los pesos se distribuirán con la misma licencia.
- Documentación escasa: no hay información sobre tokenizador, contexto, datos de entrenamiento ni proceso de alineación, lo que impide evaluar riesgos de alucinación o de sesgo con fundamento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/18kansal/panini4b
- Árbol de ficheros del repositorio: https://huggingface.co/18kansal/panini4b/tree/main
- Repositorio previo de la misma familia: https://huggingface.co/18kansal/panini-gemma-swe-bench
- Auditoría de ejecución real referenciada en la model card: `REAL_EXECUTION_AUDIT.md` (enlace relativo dentro del repositorio, no accesible de forma independiente en la información disponible)
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
- SWE-bench (Princeton NLP): no se ha incluido un enlace directo en la información proporcionada; el conjunto se cita como "SWE-bench Verified Test Suite (Princeton NLP)".
