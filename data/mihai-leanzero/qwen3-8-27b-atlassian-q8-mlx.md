# Mihai-LeanZero/Qwen3.8-27B-Atlassian-Q8-mlx

## Resumen

Qwen3.8-27B-Atlassian-Q8-mlx es un modelo de lenguaje fine-tuneado a partir de Qwen/Qwen3.8-27B, desarrollado por LeanZero (Mihai-LeanZero). Está especializado en el ecosistema de Atlassian: Forge, Jira, Confluence, Jira Service Management y las especificaciones OpenAPI asociadas. El objetivo es ofrecer un asistente técnico capaz de generar código y configuraciones de Forge que pasen validadores reales, responder preguntas sobre la documentación oficial y reducir problemas comunes como bucles o falta de terminación en la generación.

El modelo tiene 27.356.728.560 parámetros y se distribuye cuantizado a 8 bits (group size 64) en formato MLX, con el adaptador LoRA fusionado en los pesos. Incluye además una cabeza MTP (multi-token prediction) para decodificación especulativa, que acelera la generación en motores compatibles. Las pruebas del autor incluyen recuperación de aguja (needle recall) hasta 128k tokens, lo que indica soporte extendido de contexto. La licencia es Apache 2.0 y los idiomas declarados son únicamente inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 según etiquetas del repositorio; incluye cabeza MTP para decodificación especulativa |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no disponible |
| Longitud de contexto | 128k tokens (soportado en pruebas del autor; nativo no especificado) |
| Tipos de cuantizacion | 8-bit (group size 64) sobre pesos bf16; adaptador LoRA fusionado en 8 bits |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (formato MLX) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B y aplica un fine-tuning con adaptadores LoRA que posteriormente se fusionan en los pesos cuantizados a 8 bits. Se distribuye como un checkpoint MLX estándar, con un archivo adicional `mtp.safetensors` que contiene la cabeza de predicción multi-token. Esta cabeza permite decodificación especulativa en motores compatibles (Rapid-MLX, goose local edition), aunque los cargadores convencionales como mlx-lm o LM Studio la ignoran y tratan el modelo como un checkpoint normal.

El entrenamiento se realizó en varias rondas. La ronda 1 empleó aproximadamente 3,7 millones de tokens durante dos épocas, combinando 12 apps Forge de LeanZero y 5 fixtures, 175 manifests de módulo generados a partir del esquema @forge/manifest 13.4, ejemplos de UI Kit, datos de 1.820 secciones de documentación de Forge, hechos de endpoints y scopes de las OpenAPI specs de Jira, Jira Software, JSM, Assets, Admin y Confluence, más pares pregunta-respuesta de la comunidad y 220 hilos de los foros de Atlassian. La ronda 3 añadió 1.500 pasos adicionales sobre 5,45 millones de tokens, incluyendo la mezcla anterior como replay, la documentación completa como material de lectura y apps generadas por el propio modelo que superaron el validador de manifests, la allow-list y tsc, en un proceso de rejection-sampled fine-tuning. No se indica uso de RLHF ni DPO.

## Capacidades

- Generación de texto conversacional en inglés con especialización en el ecosistema Atlassian.
- Conocimiento de la documentación oficial de Forge, Jira, Confluence, JSM y los endpoints/scopes de las OpenAPI specs.
- Generación de apps de Forge completas a partir de un brief: el modelo puede producir manifests válidos y código que compila contra los tipos reales de `@forge/*` con TypeScript.
- Reducción significativa de bucles y no-terminación en comparación con el modelo base, según las pruebas del autor.
- Modo de razonamiento ("thinking") activable o desactivable, con efectos medibles en la precisión de identificadores.
- Manejo de contexto largo: recall perfecto en pruebas de needle a 4k, 32k y 128k tokens.
- Decodificación especulativa mediante MTP, con tasas de aceptación de borrador del 51% y aceleraciones entre 1.26x y 1.38x según la longitud de contexto.
- Capacidad de validar manifests de Forge y preservar información factual de documentación (hechos citados textualmente).

## Casos de uso

- Asistente de desarrollo para Atlassian Forge: el modelo puede convertir un brief de una línea en una app de Forge completa, generando el manifest y el código necesario, con validación automática del manifest y compilación TypeScript. Es útil para acelerar prototipos y reducir errores de sintaxis.
- Soporte técnico de Jira Service Management: al conocer los OpenAPI specs y la documentación, el modelo puede responder consultas sobre configuración, endpoints y scopes, ayudando a equipos de soporte a resolver incidencias sin consultar manualmente la documentación.
- Generación y corrección de manifests de Forge: a partir de una descripción funcional, el modelo escribe o arregla archivos de manifests que pasan el validador oficial de Atlassian, lo que resulta práctico en pipelines de integración continua.
- Automatización de workflows en Jira: puede generar reglas de automatización, scripts de API o tokens de integración que interactúan con Jira Cloud, aprovechando su conocimiento de los endpoints disponibles.
- Migraciones de Atlassian: asiste en la planificación y generación de scripts para migrar configuraciones, usuarios o adjuntos entre instancias, apoyándose en las especificaciones OpenAPI y en la documentación de Jira/Confluence.
- Gestión de gobernanza de adjuntos en Confluence: combinando el conocimiento de la documentación y de los endpoints, el modelo puede ayudar a definir políticas de retención o generar consultas de inventario de adjuntos.
- Documentación técnica de integraciones: puede redactar guías, ejemplos de uso y snippets para desarrolladores que trabajan con Forge, Jira o Confluence, basándose en la documentación oficial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (como MMLU, HumanEval o GSM8K) en la información disponible. El autor publica una batería de pruebas propias comparando el modelo final con el base sin entrenar. Los datos proceden de la model card y deben interpretarse como mediciones internas, no como evaluación externa.

| Prueba | Base sin entrenar | Modelo final (T4) |
|---|---|---|
| Identificadores pre-2026 / post-2026 (thinking on) | 15% / 23% | 69% / 23% |
| Identificadores (thinking off, servido) | no disponible | 62% / 31% |
| Manifests válidos (de 25) | 0 | 14 |
| Apps completas que pasan todos los gates (de 25) | 0 | 12 |
| Bucles por leg (oficial / t0.6 / greedy / instruct) | 2 / 1 / 3 / 4 | 0 / 0 / 1 / 0 |
| No-terminación por leg | 60% / 48% / 53% / 25% | 25% / 15% / 28% / 13% |
| Needle recall a 4k / 32k / 128k | 100% / 100% / 100% | 100% / 100% / 100% |
| KLD al fusionar (top-1024) | no disponible | 0.0407 (top-1 99.43%) |
| Decodificación MTP (single stream) | no disponible | aceptación 51%, speedup 1.26x–1.38x |

## Requisitos de hardware

- El modelo está diseñado para MLX y Apple Silicon; no se ha documentado soporte para CUDA.
- El repositorio ocupa 32.7 GB en disco; los pesos en 8-bit requieren aproximadamente ese espacio en memoria unificada.
- Se recomienda un Mac con al menos 64 GB de RAM unificada. El autor utilizó un Apple Silicon Mac Studio para entrenamiento, evaluación y servido.
- En máquinas con menos memoria, no se garantiza que el modelo cargue sin reducir aún más la cuantización o usar técnicas de offloading.
- Opciones de despliegue: mlx-lm, LM Studio, Rapid-MLX (fork de LeanZero que soporta MTP) y goose local edition.
- Rendimiento de referencia del autor: con MTP y single stream, 27.9 tok/s en contexto corto en su Mac Studio. No se proporcionan cifras de throughput para otros entornos.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| Qwen/Qwen3.8-27B (base) | 27.356.728.560 | nativo no especificado; probado hasta 128k | Apache 2.0 (según repositorio del adaptador) | General |
| Qwen3.8-27B-Atlassian-Q8-mlx | 27.356.728.560 | 128k soportado | Apache 2.0 | Atlassian (Forge, Jira, Confluence, JSM) |

No se han identificado en la información disponible otros modelos especializados en Atlassian con los que comparar.

## Limitaciones y advertencias

- El conocimiento sobre identificadores de Atlassian posteriores a abril de 2026 no mejora respecto al base (23% vs 23% con thinking on), por lo que puede haber alucinaciones en ese rango temporal.
- La precisión de identificadores baja con thinking off (62% vs 69% con thinking on), lo que indica que el razonamiento explícito es relevante para ciertas tareas.
- El modelo está entrenado y evaluado únicamente en inglés; no se han documentado pruebas multilingües.
- La cuantización a 8-bit y la fusión del adaptador introducen una pérdida pequeña pero medible (KLD 0.0407, top-1 99.43%).
- Las cifras de rendimiento proceden del propio autor, sin evaluación independiente ni benchmarks estándar.
- El modelo es experimental (v0.3) y puede presentar bucles o no-terminación en algunos escenarios, aunque con mucha menos frecuencia que el base.
- No se ha documentado soporte de tool calling / function calling en la información del modelo.
- El base Qwen/Qwen3.8-27B no está descrito en detalle en la model card; se recomienda revisar su ficha original para conocer restricciones adicionales.

## Enlaces

- [Mihai-LeanZero/Qwen3.8-27B-Atlassian-Q8-mlx en HuggingFace](https://huggingface.co/Mihai-LeanZero/Qwen3.8-27B-Atlassian-Q8-mlx)
- [Página oficial del proyecto: LeanZero Atlassian Models](https://leanzero.net/portfolio/atlassian-models)
- [LeanZero](https://leanzero.net)
- [Rapid-MLX (fork de LeanZero)](https://github.com/leanzero-srl/Rapid-MLX)
