# Mihai-LeanZero/Qwen3.8-27B-Atlassian-Q6-mlx

## Resumen

El modelo Qwen3.8-27B-Atlassian-Q6-mlx, desarrollado por LeanZero, es una cuantización de 6 bits de un fine-tune del modelo base Qwen/Qwen3.8-27B, especializado en el ecosistema Atlassian (Forge, Jira, Confluence y Jira Service Management). Su propósito es resolver la baja fiabilidad de los modelos generalistas al generar aplicaciones de Forge y responder preguntas técnicas sobre las APIs y herramientas de Atlassian. La arquitectura es un Transformer denso de 26,9 mil millones de parámetros, con una ventana de contexto de 128k tokens, lo que le permite manejar documentación extensa y código completo sin perder precisión.

El modelo fue entrenado con datos procedentes de documentación oficial, especificaciones OpenAPI, hilos de la comunidad de Atlassian y apps generadas por el propio modelo, filtradas mediante validación exhaustiva. Tras fusionar el adaptador LoRA y cuantizar los pesos a 6 bits (group size 64) en formato MLX, este modelo se presenta como una opción ligera y eficiente para ejecutarse en Apple Silicon, manteniendo un alto grado de fidelidad respecto a la versión de 8 bits.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3.8-27B) |
| Parametros totales | 26.895.993.856 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128k tokens (verificado con needle recall al 100 %) |
| Tipos de cuantizacion | 6-bit (group size 64) para MLX; se menciona una versión de 8 bits en las evaluaciones |
| Idiomas soportados | inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3.8-27B, un Transformer denso sin mezcla de expertos (MoE), y hereda de él la mecánica de decodificación con predicción de múltiples tokens (MTP), que se mantiene en el repositorio como `mtp.safetensors`. El entrenamiento consistió en un fine-tuning con LoRA de dos rondas: la primera ronda utilizó ~3,7 millones de tokens provenientes de 12 aplicaciones Forge escritas por LeanZero, 175 manifiestos de módulo generados y validados contra el esquema `@forge/manifest` 13.4, ejemplos de componentes UI Kit, hechos extraídos de 1.820 secciones de documentación de Forge (solo se conservaron respuestas verificables como citas literales), datos de las especificaciones OpenAPI de Jira, Jira Software, JSM, Assets, Admin y Confluence, y 1.400 pares pregunta-respuesta de investigación comunitaria. La segunda ronda añadió 1500 pasos adicionales sobre 5,45 millones de tokens, incluyendo documentación como material de lectura y aplicaciones generadas por el propio modelo que superaron los filtros de validación y compilación.

El resultado se fusionó en bf16 y después se cuantizó con 6 bits y group size 64. Según la model card, el acuerdo del modelo cuantizado con el maestro (el modelo bf16 fusionado) es de 98,26 % de coincidencia en top-1, con una divergencia KLD top-1024 de 0,0752.

## Capacidades

- Generación de texto con conocimiento especializado en el ecosistema Atlassian.
- Generación de aplicaciones completas de Forge a partir de breves descripciones, con capacidad de producir código que pasa el validador oficial y compila con `tsc` contra los tipos reales de `@forge/*`.
- Respuesta a preguntas sobre APIs, endpoints y scopes de Jira, Confluence, Jira Service Management y Forge, basadas en hechos extraídos de especificaciones OpenAPI.
- Capacidad de raciocinio con modo "thinking" activable, que mejora la identificación de entidades Atlassian anteriores a abril de 2026.
- Soporte de decodificación especulativa mediante MTP, con una tasa de aceptación del 51 % y una aceleración de decodificación de hasta 1,38x en contextos largos.
- Manejo de contexto largo de hasta 128k tokens con recall perfecto en pruebas de needle.
- Reducción significativa de bucles de generación y de no terminación en comparación con el modelo base.
- Compatibilidad con el runtime MLX y con LM Studio para despliegue local en macOS.

## Casos de uso

- Generación de apps de Forge en desarrollo ágil: a partir de un brief de una línea, el modelo produce un manifiesto y el código completo de una app. Es adecuado porque los filtros de validación garantizan que la salida compila contra las definiciones oficiales.
- Asistente técnico para equipos de desarrollo Atlassian: el modelo responde preguntas sobre endpoints de Jira o JSM con veracidad comprobada, lo que reduce el tiempo de búsqueda en documentación.
- Soporte de documentación interna: puede usarse como fuente de consulta para extraer citas literales de la documentación de Forge, útil para generar tutoriales o guías de mantenimiento.
- Automatización de migraciones de Atlassian: genera código y configuraciones para migrar proyectos entre instancias o a Jira Cloud, aprovechando su entrenamiento en datos de migración.
- Validación en pipelines de CI/CD: el modelo puede integrarse para generar o verificar manifiestos de Forge en entornos de integración continua, detectando errores antes del despliegue.
- Análisis de comunidades de desarrollo: sintetiza preguntas y respuestas aceptadas de hilos de Atlassian Developer Community, ofreciendo soluciones rápidas a problemas recurrentes.
- Despliegue local en Apple Silicon: al estar cuantizado en MLX, puede ejecutarse en un Mac Studio para uso interno sin necesidad de infraestructura en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la información disponible. No obstante, la model card incluye métricas específicas del dominio Atlassian y comparativas con el modelo base y con la versión de 8 bits del mismo fine-tune. Los datos más relevantes para esta cuantización Q6 son los siguientes:

| Métrica | Q6 (este modelo) | 8-bit (teacher) | Base sin tocar |
|---|---|---|---|
| Coincidencia top-1 con el maestro | 98,26 % | 99,43 % | - |
| Divergencia KLD top-1024 vs maestro | 0,0752 | 0,0407 | - |
| Identificadores pre-2026-04 (thinking on) | 77 % | 69 % | 15 % |
| Identificadores post-2026-04 (thinking on) | 38 % | 23 % | 23 % |
| Manifiestos Forge válidos (de 25) | 14 | - | 0 |
| Apps completas que compilan (de 25) | 12 | - | 0 |
| Loops genuinos (4 variantes) | 0 / 0 / 1 / 0 | - | 2 / 1 / 3 / 4 |
| Tasa de no terminación (4 variantes) | 25 / 15 / 28 / 13 % | - | 60 / 48 / 53 / 25 % |
| Needle recall a 128k | 100 % | - | 100 % |

## Requisitos de hardware

- El modelo está cuantizado en 6 bits y diseñado para ejecutarse con MLX, por lo que requiere un Mac con Apple Silicon.
- Los pesos ocupan aproximadamente 22,7 GB en disco. En memoria, se recomienda un Mac con al menos 32 GB de RAM unificada para inferencia cómoda con contexto largo.
- Ha sido probado en un Apple Silicon Mac Studio, según la model card.
- Es posible ejecutarlo en GPUs de Apple (M1, M2, M3, M4) a través de `mlx-lm`, `mlx-node` o LM Studio. También se menciona el fork Rapid-MLX de LeanZero para servir y evaluar el modelo.
- Con MTP activado, la velocidad de decodificación alcanza 27,9 tokens/s en contexto corto, con aceleraciones de 1,26x a 128 tokens, 1,38x a 2048, 1,34x a 8192 y 1,21x a 32768 tokens.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Rendimiento en Atlassian |
|---|---|---|---|---|---|
| Qwen3.8-27B-Atlassian-Q6-mlx (este) | 26,9B | 128k | 6-bit | Apache-2.0 | Alto: 14/25 manifiestos válidos, 12/25 apps compiladas |
| Qwen3.8-27B-Atlassian (8-bit, no publicado) | 26,9B | 128k | 8-bit | Apache-2.0 | Alto, con menor pérdida de fidelidad (top-1 99,43 %) |
| Qwen/Qwen3.8-27B (base) | 26,9B | 128k | bf16 | Apache-2.0 | Nulo: 0 manifiestos válidos en la mejor configuración |

No se han identificado otros modelos open source especializados en Atlassian en la información disponible; las alternativas presentadas son las versiones del mismo fine-tune y el modelo base sin ajustar.

## Limitaciones y advertencias

- El modelo está especializado en el ecosistema Atlassian y su rendimiento en otras tareas generalistas puede ser inferior al de un modelo general.
- El conocimiento de identificadores posteriores a abril de 2026 es limitado: la sonda de identificación con thinking activado alcanza solo un 38 %, lo que sugiere una fecha de corte de datos en torno a esa fecha.
- Existe un riesgo de no terminación en generaciones largas, con tasas de entre el 13 % y el 28 % según la estrategia de muestreo, lo que requiere contramedidas como límites de tokens.
- La cuantización 6-bit introduce una pérdida de fidelidad leve frente a la versión de 8 bits, especialmente en la coincidencia top-1 (98,26 % frente a 99,43 %).
- El soporte de idiomas se limita al inglés, según la información proporcionada.
- No se han publicado evaluaciones de sesgos ni de alucinaciones fuera del dominio de Atlassian. El fine-tune se basa en datos de LeanZero y de la comunidad Atlassian, por lo que puede heredar sesgos propios de esas fuentes.
- La licencia Apache-2.0 permite uso comercial, pero es responsabilidad del usuario verificar la licencia del modelo base en su despliegue.

## Enlaces

- HuggingFace: https://huggingface.co/Mihai-LeanZero/Qwen3.8-27B-Atlassian-Q6-mlx
- Portfolio del modelo con informe completo: https://leanzero.net/portfolio/atlassian-models
- Repositorio del fork Rapid-MLX: https://github.com/leanzero-srl/Rapid-MLX
- CogniRunner: https://leanzero.net/portfolio/cognirunner
- Sentinel Vault: https://leanzero.net/portfolio/sentinel-vault
- LeanZero Management: https://leanzero.net/portfolio/leanzero-management
- Servicios de migración de Atlassian: https://leanzero.net/services/atlassian-migrations
