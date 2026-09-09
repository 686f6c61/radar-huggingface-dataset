# Mihai-LeanZero/Qwen3.8-27B-Atlassian-Q4-mlx

## Resumen

Este modelo es un fine-tuning de Qwen3.8-27B desarrollado por LeanZero (Mihai-LeanZero), especializado en el ecosistema Atlassian (Jira, Confluence, Jira Service Management y Forge). Se distribuye como una cuantización 4-bit en formato MLX, pensada para ejecutarse en Apple Silicon. El objetivo es ofrecer un asistente técnico capaz de resolver dudas sobre APIs de Atlassian, generar aplicaciones Forge válidas y trabajar con documentación técnica, todo ello con una huella de memoria reducida.

La arquitectura de base es un transformer denso de 26.895.993.856 parámetros, que incluye un cabezal MTP (Multi-Token Prediction) para decodificación especulativa. Según las pruebas del autor, la ventana de contexto alcanza los 128.000 tokens, con recall de aguja del 100 % a 4k, 32k y 128k. El modelo está pensado para desarrolladores que necesitan automatizar tareas dentro de Atlassian y que trabajan con herramientas MLX, como Rapid-MLX o LM Studio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso basado en Qwen3.8-27B con cabezal MTP (Multi-Token Prediction) |
| Parametros totales | 26.895.993.856 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens (según pruebas del autor: needle recall 100 % a 128k) |
| Tipos de cuantizacion | 4-bit MLX (group size 64) |
| Idiomas soportados | Inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX safetensors (incluye cabezal MTP en `mtp.safetensors`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer denso con cabezal MTP para decodificación especulativa. El adaptador LoRA se fusionó a precisión bf16 con el modelo base y se cuantizó posteriormente a 4-bit con MLX, usando group size 64. El resultado ocupa aproximadamente 15 GB según `mlx-lm`.

El entrenamiento se realizó en dos rondas sobre datos de Atlassian. La primera ronda utilizó ~3,7 millones de tokens durante dos épocas, incluyendo 12 aplicaciones Forge reales, 175 manifiestos generados y validados, ejemplos de componentes UI Kit, 1.820 secciones de documentación de Forge, hechos extraídos de OpenAPI specs de Jira y Confluence, 1.400 pares pregunta-respuesta curados y 220 hilos de la comunidad de desarrolladores de Atlassian. La tercera ronda, que corresponde a esta versión, añadió 1.500 pasos sobre 5,45 millones de tokens, con la documentación completa como material de lectura y aplicaciones generadas por el propio modelo que pasaron filtros de validación, allow-list y `tsc` (rejection-sampled fine-tuning). No se indica el uso de RLHF o DPO.

## Capacidades

- Generación de texto especializado en Atlassian: Jira, Confluence, Jira Service Management, Assets, Admin y Forge.
- Generación de aplicaciones Forge completas a partir de un brief de una línea, incluyendo manifiestos que pasan el validador de Atlassian y código que compila con `tsc` contra los tipos reales de `@forge/*`.
- Comprensión de documentación técnica y respuesta a preguntas sobre APIs, endpoints y scopes.
- Modo de pensamiento activable ("thinking on/off") que mejora la resolución de tareas de dominio, a costa de mayor latencia.
- Cabeza MTP para decodificación especulativa, que acelera la generación en el stack Rapid-MLX.
- Soporte de contexto largo de hasta 128.000 tokens sin pérdida de recuperación de información.
- No se especifica soporte de tool calling, function calling o integración con frameworks de agentes.

## Casos de uso

- Generación de aplicaciones Forge en producción: el desarrollador proporciona un brief en lenguaje natural y el modelo genera un proyecto completo con manifiesto y código TypeScript, listo para validación. Es el caso de uso principal del modelo.
- Soporte técnico de APIs de Atlassian: el modelo responde preguntas sobre endpoints, scopes y parámetros de las APIs de Jira y Confluence, basándose en el conocimiento de los OpenAPI specs incorporados.
- Automatización de documentación en Confluence: puede redactar o corregir documentación técnica sobre productos Atlassian, citando pasajes exactos de la documentación de Forge.
- Revisión de manifiestos y configuración: ayuda a corregir los ficheros `manifest.yml` generados o escritos a mano, indicando los errores según el validador de Atlassian.
- Asistente de migraciones de Atlassian: el modelo conoce las particularidades de productos como Jira Cloud y Confluence Cloud, lo que permite responder preguntas durante procesos de migración.
- Integración en pipelines de CI/CD para generación de código Forge: gracias a la capacidad de generar apps que compilan con `tsc`, puede usarse como generador de esqueletos de código en un flujo de integración continua.
- Entrenamiento o prototipado en Apple Silicon: al estar en formato MLX 4-bit, se puede ejecutar localmente en un Mac Studio sin necesidad de GPUs dedicadas, lo que permite pruebas rápidas de asistentes internos de Atlassian.

## Benchmarks y rendimiento

La siguiente tabla recoge los resultados del autor, obtenidos con el mismo harness, mismas prompts y misma máquina. Se comparan el modelo base sin ajustar y la versión T4, que es la base del checkpoint Q4 aquí descrito. No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K.

| Prueba | Modelo base (Qwen3.8-27B) | T4 (base + adaptador) |
|---|---|---|
| Identificadores Atlassian, thinking on, pre-2026 / post-2026 | 15 % / 23 % | 69 % / 23 % |
| Identificadores Atlassian, thinking off, servido | no disponible | 62 % / 31 % |
| Manifests válidos (de 25) | 0 | 14 |
| Apps completas que pasan todos los filtros (de 25) | 0 | 12 |
| Bucles genuinos por leg (official / t0.6 / greedy / instruct) | 2 / 1 / 3 / 4 | 0 / 0 / 1 / 0 |
| No terminación por leg | 60 / 48 / 53 / 25 % | 25 / 15 / 28 / 13 % |
| Needle recall a 4k / 32k / 128k | 100 % / 100 % / 100 % | 100 % / 100 % / 100 % |
| KLD top-1024 vs teacher (base+adaptador) | no aplica | 0.1242 |
| Top-1 agreement vs teacher | no aplica | 93.88 % |

En cuanto a la decodificación con MTP en Rapid-MLX, el autor reporta una tasa de aceptación de borradores del 51 % y un speedup de 1.26x a 128 tokens, 1.38x a 2048, 1.34x a 8192 y 1.21x a 32768, con 27.9 tok/s en contexto corto.

## Requisitos de hardware

- Modelo pensado para Apple Silicon: utiliza MLX, no CUDA.
- Tamaño del repositorio: 16.0 GB. El tamaño en memoria según `mlx-lm` es de aproximadamente 15 GB para la cuantización 4-bit.
- Recomendado: Mac con 32 GB de memoria unificada o más, aunque la model card indica que se entrenó y sirvió en un Apple Silicon Mac Studio.
- Para contextos de 128k tokens, se necesitará más memoria; no se han publicado cifras específicas.
- Opciones de despliegue: Rapid-MLX (fork de LeanZero), LM Studio MLX engine (probado con una pregunta de Forge, gate PASS) y `mlx-lm`.
- Latencia: el autor reporta 27.9 tok/s a contexto corto con MTP habilitado, y speedups de decodificación entre 1.21x y 1.38x según la longitud del contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Uso principal |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 26.895.993.856 | 128.000 tokens (según pruebas) | bf16 (original) | Apache-2.0 | Modelo general |
| Qwen3.8-27B-Atlassian-8bit | 26.895.993.856 | 128.000 tokens | 8-bit MLX | Apache-2.0 | Atlassian, mayor fidelidad |
| Qwen3.8-27B-Atlassian-Q4-mlx (este modelo) | 26.895.993.856 | 128.000 tokens | 4-bit MLX | Apache-2.0 | Atlassian, menor huella |

La variante 8-bit tiene mejor agreement con el teacher (KLD 0.0407, top-1 99.43 %) frente al Q4 (KLD 0.1242, top-1 93.88 %). El Q4 es preferible cuando la memoria es más crítica que esa diferencia.

## Limitaciones y advertencias

- Idiomas: solo inglés. No se ha evaluado su rendimiento en español u otros idiomas, por lo que no se recomienda para uso multilingüe.
- Dominio restringido: entrenado específicamente para Atlassian. Su capacidad de generalización fuera de ese ámbito no está validada y probablemente sea inferior a la del modelo base.
- Cuantización 4-bit: introduce una degradación medible frente a la variante 8-bit, como se refleja en el KLD (0.1242 vs 0.0407) y el top-1 agreement (93.88 % vs 99.43 %).
- Sin evaluaciones de seguridad ni de sesgos: la model card no incluye pruebas de sesgo, red teaming o evaluaciones de alucinación genéricas. Se recomienda validar las salidas antes de usarlas en producción.
- Posible sobreajuste a los datos de LeanZero: el entrenamiento incluyó aplicaciones y manifiestos generados por el propio modelo y filtrados por los autores, lo que puede sesgar el comportamiento hacia sus patrones específicos.
- Ecosistema MLX: no es compatible directamente con vLLM, TGI o llama.cpp. Para usarlo en GPUs NVIDIA habría que convertir los pesos a otro formato, lo que no está documentado.
- Rendimiento en agentes y tool calling: no se ha evaluado ni documentado, por lo que no se recomienda su uso en sistemas autónomos basados en llamadas a funciones sin pruebas previas.

## Enlaces

- HuggingFace: https://huggingface.co/Mihai-LeanZero/Qwen3.8-27B-Atlassian-Q4-mlx
- Write-up completo con todas las rondas de entrenamiento y pruebas: https://leanzero.net/portfolio/atlassian-models
- Repositorio Rapid-MLX: https://github.com/leanzero-srl/Rapid-MLX
- LeanZero: https://leanzero.net
- CogniRunner: https://leanzero.net/portfolio/cognirunner
- Sentinel Vault: https://leanzero.net/portfolio/sentinel-vault
- LeanZero Management: https://leanzero.net/portfolio/leanzero-management
- Servicios de migraciones Atlassian: https://leanzero.net/services/atlassian-migrations
