# kingjones777/KAT-Coder-V2.5-Dev-SuperRoc-GGUF

## Resumen

KAT-Coder-V2.5-Dev-SuperRoc-GGUF es una cuantización GGUF del modelo Kwaipilot/KAT-Coder-V2.5-Dev, publicada por el usuario kingjones777. El modelo base es un modelo orientado a código desarrollado por Kwaipilot, con 35.505.251.456 parámetros totales (aproximadamente 35,5 mil millones). Esta versión concreta emplea una cuantización Q4_0 con formato ROCm-FP4, optimizada específicamente para hardware AMD Strix Halo (Ryzen AI Max+ 395, arquitectura gfx1151) y para el motor de inferencia Super Roc.

La relevancia de esta publicación radica en su especialización: no es una cuantización genérica, sino un artefacto construido y medido para un stack concreto (ROCm-FP4 sobre Super Roc en Strix Halo). Conserva el bloque MTP (multi-token prediction) del modelo base para habilitar decodificación especulativa, y el autor documenta métricas de rendimiento medidas en hardware real, incluyendo throughput de prompt y generación, latencia de carga y aciertos en tool calling.

El repositorio tiene un tamaño de 19,6 GB y contiene un único archivo GGUF. La licencia declarada es Apache 2.0. No se dispone de información sobre la composición del dataset de entrenamiento, los idiomas soportados ni resultados de benchmarks del modelo base en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base KAT-Coder-V2.5-Dev; se conserva el bloque MTP para decodificación especulativa) |
| Parametros totales | 35.505.251.456 (aprox. 35,5 B) |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 tokens (contexto cargado y medido por el autor) |
| Tipos de cuantizacion | Q4_0 con formato ROCm-FP4 (único archivo publicado) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo KAT-Coder-V2.5-Dev-Q4_0_ROCMFP4_STRIX-MTP.gguf, 19,56 GB) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base KAT-Coder-V2.5-Dev (tipo de transformer, número de capas, dimensionalidad, uso de atención lineal u otras innovaciones). Lo que sí documenta esta publicación es que el bloque MTP (multi-token prediction) del modelo base se mantiene intacto en la cuantización, lo que permite emplear decodificación especulativa con un drafter MTP integrado. El comando de ejemplo del autor activa `--speculative mtp -d 2 --min-draft-tokens 1`, lo que indica que el modelo puede generar borradores de tokens con su propia cabeza MTP en lugar de requerir un modelo draft separado.

Respecto al entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO o cualquier otra fase de alineamiento), no hay información disponible en los materiales proporcionados. La cuantización en sí emplea una técnica de imatrix (según los tags del repositorio) combinada con el formato ROCm-FP4, desarrollado por el equipo ROCmFPX y construido sobre llama.cpp/ggml. El objetivo declarado es doble: reducir el peso a 19,56 GB y aprovechar las capacidades de cómputo en FP4 del hardware Strix Halo mediante ROCm.

## Capacidades

- Generación de texto y código: el modelo base está orientado a tareas de programación (KAT-Coder), y el autor reporta una métrica específica de generación de código de 127,0 tok/s (media de dos prompts de código).
- Tool calling / function calling: el autor documenta resultados de 7/8 en modo "required" y 7/8 en modo "auto" sobre un conjunto de pruebas de llamadas a herramientas.
- Razonamiento multi-paso y agentes: el soporte de tool calling y el contexto de 131.072 tokens permiten flujos agénticos con historial largo.
- Modo thinking: el modelo soporta un modo de razonamiento explícito que se activa por petición mediante `chat_template_kwargs.enable_thinking`; en el comando de ejemplo se desactiva con `--think off`.
- Decodificación especulativa: integrada mediante el bloque MTP del propio modelo, sin necesidad de un drafter externo.
- Prompt lookup: el motor Super Roc soporta `--prompt-lookup`, útil para tareas con repetición de contexto (edición de código, RAG).
- Capacidades multilingües: no disponible.
- Visión, audio u otras modalidades: no disponible.

## Casos de uso

- Asistencia de programación en local sobre Strix Halo: un desarrollador con un Ryzen AI Max+ 395 y 128 GB de RAM puede ejecutar el modelo con 131.072 tokens de contexto y obtener ~110-198 tok/s de generación según el tamaño de prompt, suficiente para autocompletado, refactorización y explicación de código en un IDE sin depender de la nube.
- Pipelines de CI/CD con tool calling: el modelo puede invocar herramientas (ejecutar tests, consultar APIs, leer ficheros) con una tasa de acierto de 7/8 en las pruebas del autor, lo que lo hace viable para automatizar tareas de revisión y corrección en integración continua.
- Agentes de código multi-paso: con 131k tokens de contexto y decodificación especulativa MTP, puede mantener el estado de una sesión agéntica larga (lectura de repositorio, planificación de cambios, aplicación y verificación) con latencia reducida.
- RAG sobre bases de código: el soporte de prompt lookup y la caché de prompt (6.961 de 6.986 tokens cacheados en el segundo turno según el autor) reducen el coste de reinyectar contexto repetido en consultas sucesivas sobre el mismo repositorio.
- Despliegue con Lemonade: el autor documenta integración con Lemonade (`lemonade pull KAT-Coder-V2.5-Dev`, `lemonade chat`), lo que permite usar el modelo como backend local en una interfaz de chat sin configuración adicional.
- Servicio local compatible con API de endpoints: el tag `endpoints_compatible` sugiere que el artefacto puede servirse tras una API compatible con OpenAI a través de Super Roc (`superroc serve --served-model-name kat-coder-v2.5-dev`), integrándose en herramientas existentes.
- Evaluación de cuantizaciones ROCm-FP4: investigadores interesados en comparar Q4_0 ROCm-FP4 frente a otras cuantizaciones del mismo modelo base pueden usar este artefacto como referencia reproducible, con métricas publicadas de carga, prompt y generación.

## Benchmarks y rendimiento

El autor publica métricas de inferencia medidas en un Ryzen AI Max+ 395 (128 GB) con Super Roc 0.20.0, una petición a la vez, el 2026-11-23:

| Metrica | Valor |
|---|---|
| Tiempo de carga (s) | 21 |
| Prompt tok/s (p1k) | 1.736,2 |
| Prompt tok/s (p8k) | 1.819,0 |
| Generación tok/s (p1k) | 109,95 |
| Generación tok/s (p8k) | 198,26 |
| Generación de código tok/s | 127,0 (media de 2 prompts) |
| Tool calls (required) | 7/8 |
| Tool calls (auto) | 7/8 |
| Caché de prompt, turno 2 (cacheados / prompt) | 6.961 / 6.986 |
| Contexto cargado | 131.072 tokens |
| Drafter | mtp |

No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el archivo GGUF pesa 19,56 GB; se necesita al menos esa cantidad de memoria unificada o VRAM, más overhead del motor y de la caché KV para el contexto configurado. El autor lo ejecuta en 128 GB de memoria unificada con 131.072 tokens de contexto.
- GPU recomendadas: AMD Ryzen AI Max+ 395 (Strix Halo, gfx1151) es el hardware objetivo y el único con métricas publicadas. No hay datos para A100, H100 o RTX 4090.
- Compatibilidad con GPU de consumo: no disponible; el formato ROCm-FP4 está pensado para el soporte FP4 de Strix Halo y no se documenta su funcionamiento en otras GPU.
- Opciones de despliegue: Super Roc (motor principal, con `superroc serve`), Lemonade (integrado vía configuración de binario ROCm) y, por herencia de llama.cpp/ggml, potencialmente otras herramientas compatibles con GGUF, aunque no verificado en la información disponible.
- Latencia y throughput: según las mediciones del autor, 21 s de carga, 109,95 tok/s de generación con prompt de 1k y 198,26 tok/s con prompt de 8k, y 1.736-1.819 tok/s de procesamiento de prompt.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| KAT-Coder-V2.5-Dev-SuperRoc-GGUF (este) | 35,5 B | 131.072 | GGUF Q4_0 ROCm-FP4 | Apache 2.0 | Optimizado para Strix Halo y Super Roc; MTP para decodificación especulativa |
| Kwaipilot/KAT-Coder-V2.5-Dev (base) | 35,5 B | no disponible | safetensors (según modelo base) | Apache 2.0 (según este repo) | Modelo original sin cuantizar; requiere más memoria |
| Otras cuantizaciones GGUF del mismo base | 35,5 B | no disponible | GGUF (Q4_K_M, Q5, etc.) | Apache 2.0 | No documentadas en la información disponible |
| Alternativas de código de ~30-35 B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos verificables |

No se dispone de información suficiente para comparar rendimiento con modelos alternativos de la misma categoría.

## Limitaciones y advertencias

- Especialización de hardware: el formato ROCm-FP4 y las métricas están atados a Strix Halo (gfx1151) y a Super Roc; el rendimiento en otras GPU no está documentado y podría degradarse o no funcionar.
- Única cuantización disponible: solo se publica Q4_0 ROCm-FP4; no hay variantes de mayor precisión (Q5, Q8, FP16) en este repositorio, lo que limita la evaluación de pérdida de calidad por cuantización.
- Sin benchmarks de calidad: no hay resultados de MMLU, HumanEval, GSM8K ni evaluaciones de calidad de código; las métricas publicadas son de rendimiento (tok/s, tool calls), no de precisión.
- Tool calling imperfecto: 7/8 en las pruebas del autor implica un 12,5 % de fallos en el conjunto evaluado; en producción conviene validar y añadir reintentos.
- Idiomas no documentados: se desconoce el soporte multilingüe real del modelo base.
- Riesgo de alucinación: no cuantificado; como todo modelo generativo, puede producir código o llamadas a API incorrectas, especialmente en contextos largos.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base Kwaipilot/KAT-Coder-V2.5-Dev de forma independiente, ya que este repositorio solo declara la suya.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni de validación externa de las métricas publicadas.
- Fecha de creación futura (2026-11-23): conviene tratar las métricas y el estado del proyecto con cautela hasta su verificación independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kingjones777/KAT-Coder-V2.5-Dev-SuperRoc-GGUF
- Modelo base: https://huggingface.co/Kwaipilot/KAT-Coder-V2.5-Dev
- Motor Super Roc: https://github.com/kingjones30/superroc
- Documentación de Lemonade para Super Roc: https://github.com/kingjones30/superroc/blob/main/docs/LEMONADE.md
- ROCmFPX (formatos ROCm-FP4): https://github.com/charlie12345/ROCmFPX
