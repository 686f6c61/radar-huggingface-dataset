# CharlieBT/gx28-decider

## Resumen

gx28-decider es un modelo de decisión generalista desarrollado por CharlieBT y publicado en Hugging Face como un fine-tune LoRA fusionado sobre baselabs/mammoth-1 (modelo base con licencia MIT). El modelo está diseñado para la pista de decisión generalista de la subnet REAX, un protocolo que utiliza lectura conjunta en línea (inline-readout v3) mediante los archivos `readout.safetensors` y `decision_config.json`.

A diferencia de un modelo de lenguaje conversacional convencional, este modelo se encuadra en la tarea de clasificación de texto (pipeline `text-classification`) y actúa como "decider": evalúa tareas, opciones o decisiones y emite veredictos, con énfasis en routing de herramientas, abstención y razonamiento sobre reglas. Su entrenamiento combina generadores procedurales propios, datasets públicos reetiquetados (seguridad, licitaciones, moderación, argumentación) y datos generados exclusivamente por modelos de pesos abiertos (Qwen, DeepSeek, GLM, Kimi), excluyendo deliberadamente filas escritas por OpenAI o Anthropic.

Con 26.085.330.160 parámetros (dato real extraído de los safetensors) y un tamaño de repositorio de 52,2 GB, el modelo es relevante como componente especializado dentro de pipelines de agentes: puede servir como árbitro o enrutador que decide qué acción ejecutar, cuándo llamar a una herramienta o cuándo abstenerse, sin depender de un LLM de mayor coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (según tags de Hugging Face), fine-tune LoRA fusionado sobre baselabs/mammoth-1 |
| Parametros totales | 26.085.330.160 (dato real de safetensors) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors, 52,2 GB, aparentemente sin cuantizar) |
| Idiomas soportados | no disponible (los datos de entrenamiento incluyen datasets multilingües como Amazon MASSIVE, pero no se declara cobertura oficial) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un LoRA fine-tune de baselabs/mammoth-1 (MIT), fusionado en los pesos finales ("merged into the weights"), lo que significa que no requiere adaptador externo en inferencia. Sigue el mismo protocolo que el modelo base: joint inline-readout v3, con un módulo de lectura externo (`readout.safetensors`) y una configuración de decisión (`decision_config.json`). La etiqueta `qwen3_5` en Hugging Face sugiere que la arquitectura subyacente es de la familia Qwen 3.5, aunque la model card no detalla la estructura exacta (capas, atención, MoE).

Los datos de entrenamiento son notablemente documentados (listados en `MODIFICATIONS.md` y `TRAINING_SOURCES.tsv` con fuente y licencia por fila). Incluyen: generadores procedurales propios en formato v5.1; registros públicos reetiquetados de GitHub Advisory Database, anuncios de licitación de la TED (Comisión Europea), discusiones de borrado de Wikipedia en inglés, registros de openFDA/CPSC/NWS METAR, OurAirports, openfootball, metadatos de arXiv y Wikidata, EIPs de Ethereum, textos de Project Gutenberg, SNLI/MultiNLI, ANLI (split TRAIN), IBM Argument Quality 30k, Amazon MASSIVE y NVIDIA Aegis 2.0. Se añaden el dataset `decisionmodels/sn92-generalist-train-v1` (solo filas de modelos de pesos abiertos o código, sin filas de OpenAI ni Anthropic), `decisionmodels/sn92-specialists`, el split de preferencias TRAIN de NVIDIA When2Call (descontaminado frente a sus test), posiciones de juegos etiquetadas por solvers exactos (tres en raya, Conecta 4, Nim) y copias con variaciones de formato generadas por paráfrasis de Kimi-K3. No hubo RLHF/DPO declarado; el enfoque es aprendizaje supervisado sobre etiquetas de decisión.

## Capacidades

- Clasificación de texto y emisión de decisiones sobre tareas planteadas en formato de decisión (opciones, cabeceras, tableros, registros).
- Routing de herramientas: entrenado con NVIDIA When2Call, sabe cuándo llamar a una función/herramienta y cuándo no.
- Abstención: incluye pares de abstención generados proceduralmente, útil para saber cuándo no responder o declinar.
- Razonamiento sobre reglas y políticas: datos de finanzas, fechas/calendarios, reglas de política, código/SQL.
- Seguridad y moderación: entrenado con NVIDIA Aegis 2.0 y GitHub Advisory Database, apto para clasificación de riesgos y vulnerabilidades.
- Razonamiento argumentativo y NLI: SNLI, MultiNLI, ANLI e IBM Argument Quality 30k.
- Juegos con solución exacta: evaluación de posiciones de tres en raya, Conecta 4, Nim y coins-in-a-row etiquetadas por solvers exactos.
- Robustez a variaciones de formato: entrenamiento con paráfrasis y re-renderizado de registros, tableros y conjuntos de opciones.
- No es un modelo conversacional generalista: su pipeline declarado es text-classification, no text-generation.

## Casos de uso

- Enrutador de herramientas en agentes: dado un prompt de usuario y un catálogo de funciones, el modelo decide qué herramienta invocar (o ninguna), gracias a su entrenamiento con When2Call; adecuado como "decider" ligero delante de un LLM más costoso.
- Árbitro de abstención: en pipelines RAG o de agentes, puede decidir si hay evidencia suficiente para responder o si conviene declinar, reduciendo alucinaciones aguas abajo.
- Moderación y seguridad: clasificación de contenido con Aegis 2.0 en el entrenamiento, útil como filtro previo o posterior en plataformas con UGC.
- Triaje de vulnerabilidades: con datos de GitHub Advisory Database, puede clasificar y priorizar avisos de seguridad en repositorios o pipelines de CI/CD.
- Verificación de argumentos y NLI: evaluación de consistencia entre afirmaciones y evidencia, aplicable a fact-checking asistido o validación de respuestas de otros modelos.
- Evaluación de posiciones de juegos deterministas: integrable en entornos de evaluación de razonamiento (tres en raya, Conecta 4, Nim) donde las etiquetas provienen de solvers exactos.
- Clasificación de reglas de negocio y política: decisiones sobre fechas, calendarios, reglas financieras o de política interna, aprovechando los generadores procedurales de ese dominio.
- Procesado de registros estructurados: clasificación de licitaciones TED, registros METAR o datos regulatorios re-renderizados en distintos formatos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que se usaron splits TRAIN de benchmarks públicos convertidos al formato de decisión y que no se usaron fuentes derivadas de test de Decision-Index, pero no aporta puntuaciones de evaluación (MMLU, HumanEval, Decision-Index u otros).

## Requisitos de hardware

- VRAM estimada para inferencia: con 26 mil millones de parámetros en safetensors sin cuantizar (52,2 GB de repo, probablemente bf16/fp16), se estiman unos 52-56 GB solo de pesos; se necesita una GPU de 80 GB (A100/H100) o al menos dos GPUs de 48 GB (A6000, L40S) con sharding.
- Con cuantización a 4 bits (si se genera una versión GGUF o AWQ, no presente en el repo actual), cabría en torno a 14-16 GB, factible en una RTX 4090 o RTX 3090 de 24 GB; no obstante, no hay versiones cuantizadas publicadas.
- Consumer GPU: no cabe en una sola GPU doméstica en precisión completa; solo viable con cuantización de terceros o offloading a CPU/RAM con llama.cpp a costa de latencia.
- Despliegue: al ser un modelo de la familia qwen3_5 con safetensors, es razonable esperar compatibilidad con vLLM, TGI, transformers y llama.cpp (previa conversión a GGUF), aunque no hay instrucciones de despliegue en la model card; el protocolo REAX exige además cargar `readout.safetensors` y `decision_config.json`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|
| CharlieBT/gx28-decider | 26,1 B (safetensors) | Decision model / text-classification (REAX SN92) | Apache-2.0 | Hugging Face, pesos abiertos |
| baselabs/mammoth-1 (modelo base) | no disponible | Modelo base del protocolo REAX | MIT | Hugging Face, pesos abiertos |
| NVIDIA When2Call (dataset/modelos asociados) | no disponible | Decisión de tool calling | CC-BY-4.0 (datos) | Hugging Face |

No hay otros modelos comparables publicados en la informacion disponible dentro de la pista generalista de la subnet REAX; la comparación más directa es con su propio modelo base, del que se diferencia por el fine-tune en datos de decisión generalista.

## Limitaciones y advertencias

- No es un chatbot generalista: su pipeline es text-classification y está optimizado para emitir decisiones en el formato REAX, no para conversación libre o generación larga.
- Parte de los datos de entrenamiento proceden de texto generado por modelos de pesos abiertos (Qwen, DeepSeek, GLM, Kimi), lo que puede introducir sesgos heredados de esos modelos.
- El split ANLI TRAIN está bajo CC-BY-NC-4.0; aunque el modelo se distribuye en Apache-2.0, quien reentrene o redistribuya datos derivados debe revisar las licencias por fila en TRAINING_SOURCES.tsv.
- Riesgo de alucinación: no disponible como métrica; al ser un clasificador de decisiones, el riesgo se traslada a falsos positivos/negativos en sus veredictos, no evaluados públicamente.
- Cobertura de idiomas no declarada: pese a incluir Amazon MASSIVE (multilingüe), el resto de datasets es predominantemente en inglés, por lo que el rendimiento fuera de inglés es incierto.
- El despliegue requiere los artefactos adicionales del protocolo REAX (`readout.safetensors`, `decision_config.json`); usar solo los pesos del transformer puede no reproducir el comportamiento esperado.
- Advertencias legales de los datos: los textos de Project Gutenberg son dominio público solo en EE. UU.; los datos de la TED requieren atribución a la Comisión Europea.
- Proyecto de autor individual con descargas muy bajas (61) y sin benchmarks publicados: se recomienda evaluación propia antes de cualquier uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CharlieBT/gx28-decider
- Modelo base: https://huggingface.co/baselabs/mammoth-1
- Archivos de entrenamiento referenciados en la model card (no verificados): MODIFICATIONS.md, TRAINING_SOURCES.tsv, decisionmodels/sn92-generalist-train-v1, decisionmodels/sn92-specialists, nvidia/When2Call
