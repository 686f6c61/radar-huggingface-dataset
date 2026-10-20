# LucasBRT/smart-commit-1.5b-v0.1

## Resumen

smart-commit-1.5b-v0.1 es un ajuste fino de Qwen2.5-Coder-1.5B-Instruct especializado en una única tarea: redactar mensajes de commit de git que imiten el estilo del repositorio donde se trabaja. Lo desarrolla LucasBRT como pieza central de smart-commit, una herramienta de línea de comandos que ejecuta el modelo en local (NPU Intel, GPU o CPU) para generar el mensaje a partir de los ficheros en staging, un diff compactado y hasta cinco asuntos de commits recientes del propio repositorio.

El modelo resuelve un problema acotado pero muy concreto: los asistentes generalistas tienden a producir mensajes genéricos y a ignorar las convenciones del proyecto (por ejemplo, Conventional Commits o el uso de scopes ya existentes). Según la evaluación del autor, el ajuste eleva el acierto del tipo convencional (type_match) de 0,456 a 0,644 y la validez del scope de 0,580 a 0,852 frente al modelo base sin ajustar.

Técnicamente es un transformer decoder-only de 1.543.714.304 parámetros (aproximadamente 1,5B), entrenado con QLoRA sobre el modelo base y exportado en bf16 (safetensors) y Q4_K_M (GGUF, 986 MB). Está pensado exclusivamente para inglés y su ámbito es deliberadamente estrecho: solo se ha validado con el prompt exacto de smart-commit. La versión 0.1 se publica mientras la receta de entrenamiento sigue cambiando.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2), ajuste fino con LoRA sobre Qwen2.5-Coder-1.5B-Instruct |
| Parámetros totales | 1.543.714.304 (aproximadamente 1,5B) |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible (no declarada en la model card) |
| Tipos de cuantización | bf16 (safetensors fusionados) y GGUF Q4_K_M (986 MB); export a OpenVINO previsto pero no validado para este modelo |
| Idiomas soportados | Inglés (en) únicamente; los datos de entrenamiento son en inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16) y GGUF (Q4_K_M) para llama.cpp |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Coder-1.5B-Instruct, un transformer decoder-only denso, y se ajusta mediante QLoRA: LoRA con r=16, alpha=32 y dropout 0,05 aplicado a todas las capas lineales, sobre la base cuantizada en 4 bits NF4 con cómputo en fp16. El entrenamiento usó learning rate 2e-4 con scheduler coseno, warmup del 3%, batch efectivo de 4 × 4, una época, semilla 0 y cálculo de la pérdida solo sobre la respuesta. Se ejecutó en una Tesla T4 de Kaggle durante 394 minutos con torch 2.11.0, transformers 5.20.1 y peft 0.21.2. Posteriormente los adaptadores se fusionaron en la base bf16 y se cuantizaron a Q4_K_M con llama.cpp b11381.

Los datos son 39.985 commits del split de entrenamiento de CommitChronicle (revisión `5fd076e`), cada uno con al menos 10 asuntos previos de su repositorio. Los prompts no son genéricos: los construye el propio smart-commit, con un system prompt que fija las reglas (asunto de 72 columnas como máximo, modo imperativo, Conventional Commits cuando el repositorio los usa) y un user prompt con los ficheros modificados, el diff compactado y hasta cinco asuntos recientes. El objetivo es el asunto real del commit. La innovación no está en la arquitectura, sino en el alineamiento estricto entre el formato de prompt de entrenamiento y el de inferencia, byte a byte, y en el uso de ejemplos del propio repositorio como señal de estilo.

## Capacidades

- Generación de mensajes de commit en inglés a partir de un diff y una lista de ficheros modificados.
- Imitación del estilo del repositorio mediante el contexto de hasta cinco asuntos de commits anteriores.
- Emisión de mensajes en formato Conventional Commits (tipo y scope) cuando el repositorio lo emplea; type_match de 0,644 en eval-v1.
- Selección de scopes ya usados por el repositorio o ausencia de scope; scope_known de 0,852.
- Modo conversacional declarado en los tags de HuggingFace (`text-generation`, `conversational`), aunque la model card solo valida el prompt específico de smart-commit.
- Generación de código y razonamiento general heredados del modelo base: no evaluados ni documentados por el autor para esta variante.
- No se documenta soporte de tool calling, function calling, uso como agente, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Generación automática de mensajes de commit en local: el flujo previsto es `SMART_COMMIT_GGUF=~/models/smart-commit-1.5b-v0.1-q4_k_m.gguf smart-commit`, que lee los cambios en staging y devuelve un asunto listo para usar; el modelo cabe en 986 MB y se ejecuta sin conexión.
- Estandarización de Conventional Commits en monorepos: al recibir los asuntos recientes y el diff, el modelo alinea tipo y scope con lo que el repositorio ya usa, lo que reduce la dispersión de formatos en equipos grandes.
- Integración en hooks de pre-commit o pipelines de CI: el GGUF puede invocarse desde llama.cpp con decodificación greedy, de modo que la generación sea determinista y reproducible en cada ejecución, algo útil para auditoría de mensajes.
- Trabajo en portátiles sin GPU dedicada: existe una ruta CPU y Vulkan mediante llama.cpp, y una ruta OpenVINO para NPU y GPU Intel, pensada para equipos tipo Core Ultra; el autor reporta 795 s para 500 commits (aproximadamente 1,6 s por commit) en una iGPU Intel Arc de un Core Ultra 5 225H, reintentos incluidos.
- Entornos aislados o air-gapped: al ser un paquete de 4,1 GB en el repositorio y no requerir llamadas a API, encaja en organizaciones que no pueden enviar diffs a servicios externos.
- Base para ajustes de dominio con LoRA: la receta, los scripts de exportación y la selección de datos están publicados en el repositorio de entrenamiento, lo que permite replicar el método sobre otros idiomas o convenciones.
- Generación de borradores para release notes: los asuntos generados pueden agruparse por tipo, aunque el modelo no está entrenado para resumir varios commits y no detecta cuándo los cambios en staging deberían separarse en varios commits.

## Benchmarks y rendimiento

Evaluación del autor con eval-v1: 500 commits del split de test de CommitChronicle (repositorios no vistos en entrenamiento), 250 con Conventional Commits y 250 de formato libre; eval-short: 197 commits de repositorios jóvenes con 1 a 5 asuntos previos. Decodificación greedy, smart-commit en `db389c2`, Vulkan, con reintentos y fallback a lista de ficheros.

| Modelo | type_match | scope_known | first_try | fallback | word_f1 | word_f1 (free) | fallback (repos jóvenes) |
|---|---|---|---|---|---|---|---|
| Qwen2.5-Coder-1.5B-Instruct, Q4_K_M original | 0,456 | 0,580 | 0,908 | 0,068 | 0,245 | 0,143 | 0,102 |
| Mismo modelo recuantizado como este (control) | 0,408 | 0,516 | 0,928 | 0,004 | 0,245 | 0,139 | 0,051 |
| smart-commit-1.5b-v0.1 | 0,644 | 0,852 | 0,948 | 0,016 | 0,362 | 0,257 | 0,030 |

Notas de interpretación aportadas por el autor: type_match mide coincidencia del tipo Conventional Commits con el commit real (responder siempre `fix` daría 0,41); scope_known indica que no hay scope o que este ya se había usado en el repositorio; first_try indica que la primera respuesta fue usable; fallback indica que ninguna lo fue y smart-commit redactó el mensaje desde la lista de ficheros; word_f1 es solapamiento de palabras con el asunto real, un proxy aproximado del contenido. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/RAM para inferencia en Q4_K_M: 986 MB de pesos; con contexto y overhead de llama.cpp, el consumo práctico se sitúa en torno a 1,2-1,5 GB.
- VRAM para safetensors en bf16: aproximadamente 3,1 GB solo de pesos, más activaciones y caché KV.
- Cabe en cualquier GPU de consumo: el modelo se entrenó en una Tesla T4 de 16 GB y se evaluó en una iGPU Intel Arc (Core Ultra 5 225H), además de rutas CPU.
- GPU recomendadas: no se documentan modelos concretos de datacenter; por tamaño, A100, H100, L4 o RTX 4090 son sobradimensionadas para la tarea y solo tendrían sentido para servir muchas peticiones en paralelo.
- Despliegue: llama.cpp (ruta validada, incluido Vulkan), smart-commit como cliente de referencia, exportación a OpenVINO para NPU y GPU Intel (no validada para esta versión); vLLM o TGI serían viables con los safetensors bf16, pero no están documentados por el autor.
- Latencia y throughput: 795 s para 500 commits en iGPU Intel Arc con reintentos incluidos (aproximadamente 1,6 s por commit). No se publica throughput en tokens por segundo ni latencia por petición en GPU dedicada.
- El autor indica que la versión de 0,5B iguala a este modelo en tipo y scope a unas 2,5 veces la velocidad, lo que puede ser preferible en equipos muy limitados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smart-commit-1.5b-v0.1 | 1,5B | no disponible | type_match 0,644; scope_known 0,852; word_f1 0,362 | Apache-2.0 | safetensors + GGUF Q4_K_M en HuggingFace |
| smart-commit-0.5b-v0.1 | 0,5B (aproximado, según nombre) | no disponible | Igualaría a este modelo en tipo y scope, a unas 2,5× la velocidad (dato del autor) | no disponible en la información | HuggingFace, mismo autor |
| Qwen2.5-Coder-1.5B-Instruct | 1,5B | no disponible en la información | type_match 0,456; scope_known 0,580; word_f1 0,245 | Apache-2.0 | Modelo base público en HuggingFace |
| Mismo base recuantizado a Q4_K_M (control) | 1,5B | no disponible | type_match 0,408; scope_known 0,516; word_f1 0,245 | Apache-2.0 | Solo como control experimental, no publicado como modelo |

## Limitaciones y advertencias

- Solo genera mensajes en inglés; los datos de entrenamiento son en inglés y no se ha validado otros idiomas.
- Repositorios jóvenes: con menos de 10 commits previos puede repetir o parafrasear un asunto anterior, o producir una respuesta inutilizable (tasa de fallback de 0,030 en eval-short).
- Alucinación de detalles no presentes en el diff, como números de versión o la finalidad de un fichero; el autor lo documenta explícitamente.
- No detecta cuándo los cambios en staging deberían dividirse en varios commits, por lo que puede generar un asunto que mezcle cambios heterogéneos.
- Solo se ha validado con el prompt exacto de smart-commit; otros prompts están sin probar y pueden degradar la calidad de forma significativa.
- El modelo se entrenó sin el mapa de scopes que smart-commit añadió después al prompt; con ese mapa no se ha reevaluado en eval-v1.
- La exportación a OpenVINO para NPU y GPU Intel no está validada para esta versión.
- El entrenamiento en GPU no es reproducible bit a bit; la generación con decodificación greedy sí lo es.
- Licencia Apache-2.0 para los pesos, pero el dataset CommitChronicle agrega commits de repositorios con licencias MIT, Apache-2.0 y BSD-3-Clause y exige respetar sus términos, incluida la atribución; los campos `repo` y `license` del dataset son la trazabilidad disponible.
- Versión 0.1 con 0 descargas y 0 likes en el momento de la consulta, publicada mientras la receta de entrenamiento sigue cambiando: no es una versión estable para producción crítica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LucasBRT/smart-commit-1.5b-v0.1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Repositorio de smart-commit (CLI): https://github.com/Lucas-BRT/smart-commit
- Scripts y receta de entrenamiento: https://github.com/Lucas-BRT/smart-commit/tree/training/training
- Evaluación eval-v1: https://github.com/Lucas-BRT/smart-commit/blob/training/training/README.md
- Metodología e hipótesis (H3, curva de aprendizaje y elección de 40k ejemplos): https://github.com/Lucas-BRT/smart-commit/blob/training/training/HYPOTHESES.md
- Dataset CommitChronicle: https://huggingface.co/datasets/JetBrains-Research/commit-chronicle
- Versión de 0,5B del mismo autor: https://huggingface.co/LucasBRT/smart-commit-0.5b-v0.1
