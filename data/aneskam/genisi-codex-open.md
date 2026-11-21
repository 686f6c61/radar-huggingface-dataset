# AnesKAM/Genisi-Codex-Open

## Resumen

Genisi Codex Open (9B) es un modelo de lenguaje presentado por AnesKAM (proyecto AnesNT) como un modelo fundacional orientado a ingeniería de software autónoma, con pesos abiertos y capacidades multilingües en árabe, inglés y francés. Según su model card, se trata de un transformer denso de 9.460 millones de parámetros con una ventana de contexto nativa de 262.144 tokens (256K) y una longitud máxima de generación de 32.768 tokens. Incorpora un modo de razonamiento nativo delimitado por etiquetas `<think>...</think>` orientado a planificación arquitectónica y verificación multi-turno.

El modelo se distribuye bajo licencia MIT a través de Hugging Face, con pesos en formato safetensors y compatibilidad con la librería transformers. El repositorio ocupa 0,3 GB, un tamaño llamativamente reducido para un modelo denso de 9B parámetros, lo que sugiere que los pesos publicados no corresponden a un checkpoint completo en precisión nativa (un modelo de 9B en bf16 rondaría los 18 GB). Este extremo no se aclara en la información disponible.

La relevancia del modelo radica en su propuesta de combinar contexto largo, tool calling universal y razonamiento orientado a tareas de ingeniería de software en un único checkpoint abierto. No obstante, la información pública disponible es escasa: cero descargas, cero likes, sin pipeline declarado y sin documentación técnica sobre datos de entrenamiento, composición del dataset ni metodología de evaluación, por lo que las cifras de benchmarks deben interpretarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (según model card; no se detalla variante ni innovaciones de atención) |
| Parametros totales | 9,46 mil millones (denso) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (256K nativos) |
| Salida máxima | 32.768 tokens |
| Tipos de cuantizacion | No disponible (no se publican versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Árabe (ar), inglés (en), francés (fr) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Tamano del repositorio | 0,3 GB |
| Modo de razonamiento | `<think>...</think>` nativo |

## Arquitectura y entrenamiento

La model card describe el modelo como un transformer denso de 9.460 millones de parámetros, sin especificar la variante arquitectónica concreta (atención completa, atención lineal, híbrida, etc.), el número de capas, la dimensión oculta ni la configuración de cabezas de atención. Tampoco se detalla si emplea técnicas como decodificación especulativa, atención con ventana deslizante o mecanismos de compresión de contexto para sostener la ventana de 256K tokens declarada.

No se publica información sobre el volumen de tokens de entrenamiento, la composición del dataset, la proporción de código frente a texto natural, ni si se aplicaron fases de ajuste supervisado, RLHF o DPO. La única indicación metodológica es la existencia de un modo de razonamiento nativo con etiquetas `<think>`, que sugiere un entrenamiento orientado a cadenas de pensamiento y verificación multi-turno, pero sin documentación que lo respalde. El tamaño del repositorio (0,3 GB) es inconsistente con un checkpoint denso de 9B en bf16 o fp16, y no se ofrece explicación al respecto.

## Capacidades

- Generación de código y desarrollo full-stack, según la descripción del autor.
- Ingeniería de software autónoma orientada a resolución de issues y tareas de repositorio (etiqueta `swe-bench`).
- Tool calling universal (etiqueta `universal-tool-calling`), con integración declarada en entornos de herramientas tipo MCP.
- Razonamiento multi-paso mediante el modo `<think>...</think>` para planificación arquitectónica y verificación.
- Contexto largo de 256K tokens, adecuado para repositorios completos o conversaciones extensas.
- Multilingüismo en árabe, inglés y francés.
- Capacidades de razonamiento general declaradas a través de resultados en GPQA Diamond (sin verificación independiente).
- No se declaran capacidades de visión, audio ni multimodalidad.

## Casos de uso

- Resolución automática de issues en repositorios: el modelo puede recibir el contexto del repositorio (hasta 256K tokens) y proponer parches, apoyándose en el modo de razonamiento para planificar el cambio antes de generar el diff.
- Agente de codificación en terminal: con soporte declarado de tool calling, podría integrarse en entornos de línea de comandos para ejecutar comandos, inspeccionar ficheros y validar resultados de forma iterativa.
- Asistente de revisión de código en pipelines de CI/CD: dado su contexto largo, puede analizar un pull request completo junto con el código circundante y señalar problemas de diseño o regresiones.
- Generación de proyectos completos a partir de especificaciones (NL2Repo): útil para prototipado rápido de esqueletos de aplicación con estructura de ficheros y código base.
- Soporte multilingüe para equipos en árabe, inglés y francés: atención técnica o documentación de código en estos tres idiomas, aprovechando el multilingüismo declarado.
- Automatización de tareas de refactorización a gran escala: la ventana de 256K permite procesar módulos extensos sin trocear el contexto, reduciendo pérdidas de coherencia entre ficheros.
- Agente de herramientas vía MCP: integración en flujos que requieran invocar APIs externas, bases de datos o servicios mediante function calling.

## Benchmarks y rendimiento

Los datos provienen exclusivamente de la model card del autor y no han sido verificados de forma independiente.

| Benchmark | Genisi Codex Open (9B) | Qwen3.5-9B | Gemma-4-31B |
|---|---|---|---|
| SWE-bench Verified | 72,1% | 53,2% | 52,0% |
| SWE-bench Pro | 48,8% | 31,3% | 35,7% |
| NL2Repo | 35,1% | 16,2% | 15,5% |
| MCP-Atlas (Agent Tools) | 58,4% | 46,8% | 55,0% |
| GPQA Diamond | 86,4% | 81,7% | 84,3% |
| Terminal-Bench 2.1 | 47,9% | 21,3% | 42,1% |

No se han publicado detalles sobre la metodología de evaluación, el número de ejecuciones, la configuración de decodificación ni el prompt utilizado. Las cifras de SWE-bench Verified (72,1%) situarían al modelo por encima de referencias consolidadas de mayor tamaño, lo que exige verificación independiente antes de tomar decisiones de producción.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 19 GB solo para pesos, más overhead de activaciones y KV cache; con 256K de contexto la KV cache puede ser muy elevada y requerir GPUs de 80 GB o estrategias de offloading.
- VRAM estimada en cuantización de 8 bits: en torno a 10-11 GB para pesos; en 4 bits, en torno a 5-6 GB, aunque no se publican checkpoints cuantizados oficiales.
- GPU recomendadas para contexto completo: A100 80 GB, H100 80 GB o múltiples GPUs con tensor parallelism.
- GPU de consumo: podría caber en RTX 4090 (24 GB) en bf16 con contexto reducido, y en RTX 3090/4080 con cuantización, pero no hay datos publicados de latencia ni throughput.
- Opciones de despliegue: transformers (soporte declarado); compatibilidad con vLLM, llama.cpp, Ollama o TGI no está confirmada en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Genisi Codex Open (9B) | 9,46B denso | 256K | MIT | Hugging Face (0 descargas) | Benchmarks solo en model card, sin verificación |
| Qwen3.5-9B | 9B (aprox.) | No disponible en esta ficha | No disponible | Referencia usada por el autor | Usado como baseline en la tabla del autor |
| Gemma-4-31B | 31B (aprox.) | No disponible en esta ficha | No disponible | Referencia usada por el autor | Usado como baseline en la tabla del autor |

Los modelos de comparación proceden únicamente de la tabla publicada por el autor; no se dispone de información adicional verificada sobre sus especificaciones en el contexto de esta ficha.

## Limitaciones y advertencias

- Ausencia total de documentación técnica: no se publican datos de entrenamiento, composición del dataset, metodología de alineación ni detalles arquitectónicos.
- Tamaño del repositorio (0,3 GB) incompatible con un checkpoint denso de 9B en precisión nativa; no se aclara si los pesos son completos, cuantizados o parciales.
- Cero descargas y cero likes en Hugging Face en el momento de la consulta, sin evidencia de uso comunitario ni validación externa.
- Benchmarks no verificados de forma independiente; las cifras declaradas superan a referencias consolidadas y deben tratarse con escepticismo.
- Riesgo de alucinación no evaluado; no hay informes de evaluación de sesgos ni de robustez.
- Cobertura lingüística limitada a árabe, inglés y francés; el castellano no está declarado como idioma soportado.
- Licencia MIT permite uso comercial, pero la falta de documentación sobre procedencia de datos impide evaluar riesgos legales asociados al entrenamiento.
- Sin confirmación de soporte en motores de inferencia habituales (vLLM, llama.cpp, TGI), lo que complica el despliegue en producción.
- No se declaran versiones cuantizadas oficiales, lo que limita el despliegue en hardware de consumo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AnesKAM/Genisi-Codex-Open
- Repositorio del proyecto AnesNT: no disponible
- Paper técnico: no disponible
- Blog o documentación adicional: no disponible
- Demo: no disponible
