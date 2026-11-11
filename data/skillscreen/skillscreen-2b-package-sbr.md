# SkillScreen/SkillScreen-2B-Package-SBR

## Resumen

SkillScreen-2B-Package-SBR es un modelo de clasificación de texto de 2.213.247.808 parámetros (aproximadamente 2,2 mil millones) desarrollado por SkillScreen, un equipo de investigación liderado por Jerrold Huang, Junwei Quan, Saiyue Lyu, Zihan Guo e Yingqiang Ge. Su función no es generar texto, sino decidir si un paquete de "skill" para agentes (un fichero `SKILL.md` junto con sus ficheros auxiliares, como scripts en Python) es malicioso o benigno. Resuelve un problema de seguridad específico del ecosistema de agentes: la instalación de habilidades de terceros que pueden contener instrucciones ocultas, exfiltración de datos o ejecución de código no deseado.

El modelo se construye mediante un ajuste fino (LoRA más una cabeza de clasificación) sobre el modelo base OpenJev 2B, que a su vez deriva de la familia Qwen. La tarea se formula como inferencia de lenguaje natural (NLI): el modelo produce una puntuación de "entailment" que se interpreta como probabilidad de que el paquete sea malicioso, con un umbral nativo de 0,5. El presupuesto de entrada es de 32.768 tokens, suficiente para cubrir el Markdown de la skill y varios ficheros acompañantes en una sola pasada.

Es relevante ahora porque los agentes basados en LLM instalan cada vez más skills de repositorios comunitarios, y la superficie de ataque crece más rápido que las revisiones manuales. Este checkpoint concreto (SBR, *source-balanced-random*) se entrenó únicamente con la partición de entrenamiento SBR de MaliciousSkillBench y está pensado como release de despliegue; el autor remite a `SkillScreen-2B-Package` para la versión entrenada con todos los datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base OpenJev 2B, derivado de Qwen) con cabeza de clasificación NLI añadida |
| Parametros totales | 2.213.247.808 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (presupuesto de entrada declarado) |
| Tipos de cuantizacion | no disponible (el autor solo documenta BF16; requiere CUDA con soporte BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (pesos, código y configuración); CC BY 4.0 para model card y documentación |
| Formato de pesos | safetensors (pesos completos en la raíz del repo; adaptador LoRA y cabeza en `adapter/`) |

## Arquitectura y entrenamiento

El modelo parte de OpenJev 2B, un transformer decoder-only de la estirpe Qwen, y le superpone un ajuste LoRA junto con una cabeza de clasificación que reformula la detección como una tarea de NLI: la puntuación final es el softmax de la clase "entailment", interpretada como probabilidad de malicia. El checkpoint publicado es la fusión de ese adaptador en los pesos completos; el adaptador original y la cabeza se conservan en el subdirectorio `adapter/`, y el repositorio incluye `merge_verification.json` con las comprobaciones de la exportación fusionada.

El entrenamiento se realizó sobre los paquetes SRC010 recuperados de la partición de entrenamiento SBR de MaliciousSkillBench, con semilla 42 y el checkpoint de origen `package-sbr-s42-r001` en la actualización 180. La entrada combina el contenido de `SKILL.md` con ficheros auxiliares elegibles dentro de un presupuesto de 32K tokens. No se documentan en la información disponible el número total de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron etapas de RLHF o DPO; tampoco se describe ninguna innovación de decodificación (el modelo no genera texto).

## Capacidades

- Clasificación binaria de paquetes de skills de agentes: devuelve una puntuación nativa de malicia y marca como sospechoso todo valor mayor o igual a 0,5.
- Análisis conjunto de Markdown y ficheros acompañantes: procesa `skill_text` más una lista de `files` con ruta y contenido, lo que permite detectar código malicioso en scripts auxiliares.
- Contexto largo de 32.768 tokens para cubrir paquetes completos en una sola pasada.
- Umbral configurable: además del 0,5 por defecto, el autor publica un umbral alternativo (0,99748853624125544) calibrado para alcanzar un 99 % de recall en validación.
- Soporte de inferencia en BF16 sobre CUDA mediante el script `score.py` incluido en el repositorio.
- No dispone de generación de texto, tool calling, razonamiento multi-paso ni capacidades multimodales: es exclusivamente un clasificador.

## Casos de uso

- Filtrado en la instalación de skills: integrar `score.py` como paso previo en un gestor de paquetes de agentes para bloquear automáticamente cualquier skill cuya puntuación supere 0,5 antes de que el agente la cargue.
- Revisión de repositorios comunitarios: ejecutar el modelo por lotes sobre un catálogo de skills publicadas y priorizar la revisión humana de las marcadas, reduciendo el volumen de auditoría manual.
- Puerta de calidad en CI/CD: añadir una etapa de clasificación en el pipeline de publicación de una organización para que ninguna skill interna o de terceros llegue a producción sin superar el umbral.
- Detección de código oculto en scripts auxiliares: aprovechar el análisis de ficheros acompañantes para identificar exfiltración de credenciales o ejecución de comandos en `helper.py` y similares, un vector que un análisis solo del Markdown no cubre.
- Monitorización en tiempo de ejecución: reescanear skills ya instaladas cuando cambian de versión, usando el umbral calibrado al 99 % de recall en validación para minimizar falsos negativos en entornos sensibles.
- Investigación en seguridad de agentes: emplear el checkpoint como línea base reproducible (semilla 42, partición SBR) para comparar nuevas técnicas de detección sobre MaliciousSkillBench y SkillsBench-1650.

## Benchmarks y rendimiento

Resultados publicados por el autor para el checkpoint LoRA de origen `package-sbr-s42-r001` (semilla 42, actualización 180), sobre predicciones retenidas:

| Conjunto de prueba | Regla de umbral | Umbral nativo | Recall (%) | FPR (%) |
|---|---|---:|---:|---:|
| SRC010 recovered-package test (811 skills: 510 maliciosas, 301 benignas) | Por defecto | 0,5 | 99,80 | 0,66 |
| SRC010 recovered-package test | Objetivo 99 % recall en validación | 0,99748853624125544 | 99,02 | 0,33 |
| SkillsBench-1650 external (1.650 skills: 150 maliciosas, 1.500 benignas) | Por defecto | 0,5 | 66,67 | 0,40 |
| SkillsBench-1650 external | Objetivo 99 % recall en validación | 0,99748853624125544 | 32,67 | 0,13 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de propósito general en la información disponible, lo cual es coherente con la naturaleza de clasificador del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 4,5 GB solo para pesos (el tamaño del repositorio es de 4,5 GB); con activaciones y el contexto de 32K tokens hay que prever un margen adicional, aunque no se publica una cifra exacta.
- GPU recomendadas: cualquier GPU con soporte BF16. Por el tamaño, cabe en tarjetas de consumo como la RTX 4090 (24 GB) y en GPUs de datacenter como A100 o H100, aunque para este modelo están sobredimensionadas.
- Cabe en GPU de consumo: sí, con holgura en modelos de 16 GB o superiores en BF16.
- Opciones de despliegue: el autor documenta un flujo propio con `huggingface_hub` y `score.py` sobre `transformers`; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, y al ser un clasificador con cabeza personalizada estas herramientas requerirían adaptación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SkillScreen-2B-Package-SBR | 2,21 B | 32.768 | Clasificación de paquetes de skills | Apache-2.0 | Hugging Face (revisión v1.1) |
| SkillScreen-2B-Package | no disponible | no disponible | Clasificación de paquetes de skills (entrenado con todos los datos) | no disponible | Hugging Face |
| OpenJev 2B (modelo base) | no disponible | no disponible | Modelo generativo de propósito general | no disponible | Hugging Face |

La información disponible no incluye otros clasificadores de seguridad para skills de agentes con los que comparar parámetros, contexto o rendimiento; esa comparativa figura como no disponible.

## Limitaciones y advertencias

- Caída acusada de generalización fuera de distribución: el recall sobre SkillsBench-1650 externo baja al 66,67 % con el umbral por defecto y al 32,67 % con el umbral calibrado, frente a más del 99 % en el conjunto de prueba SRC010.
- Entrenado solo con la partición SBR de MaliciousSkillBench (semilla 42): puede sobreajustar a los patrones de esa partición y no cubrir vectores de ataque ausentes en ella.
- El umbral de 0,5 está fijado antes de la evaluación, pero su comportamiento óptimo depende del conjunto; en dominios nuevos conviene recalibrar.
- Requiere CUDA con BF16; no se documenta soporte para CPU ni para cuantización, lo que limita el despliegue en entornos sin GPU.
- Idiomas soportados no disponibles: no se puede garantizar el rendimiento en skills redactadas en idiomas distintos del inglés.
- Riesgo de falsos negativos en skills maliciosas que imiten la distribución benigna; debe combinarse con otras capas de defensa y no sustituir la revisión humana en entornos críticos.
- Licencia Apache-2.0 para pesos y código, con las obligaciones de atribución de OpenJev y Qwen recogidas en `THIRD_PARTY_NOTICES.md`; la model card y la documentación quedan bajo CC BY 4.0.
- El autor advierte que los resultados de contexto de paquete no se reportan en el paper de SkillScreen; la cita del paper cubre el método subyacente, no esta extensión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SkillScreen/SkillScreen-2B-Package-SBR
- Release con todos los datos: https://huggingface.co/SkillScreen/SkillScreen-2B-Package
- Modelo base OpenJev 2B: https://huggingface.co/AlexWortega/openjev
- Página del proyecto: https://jerroldh.github.io/SkillScreen-webpage/
- Código: https://github.com/JerroldH/SkillScreen
- Paper (arXiv): https://arxiv.org/abs/2610.17727
- DOI: https://doi.org/10.48550/arXiv.2610.17727
- Dataset MaliciousSkillBench: https://huggingface.co/datasets/ProtectSkills/MaliciousSkillBench
- Dataset externo SkillsBench-1650: https://huggingface.co/datasets/zenith6888/SkillsBench-1650
