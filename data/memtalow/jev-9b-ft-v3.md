# memtalow/jev-9b-ft-v3

## Resumen

jev-9b-ft-v3 es un adaptador LoRA de rango 16 publicado por el usuario memtalow sobre el modelo base nativ-community/JEV-9B-MLX-NVFP4, un transformer de 9.000 millones de parámetros cuantizado en NVFP4 y empaquetado para MLX. No es un modelo de propósito general: está entrenado específicamente como clasificador de comandos de shell, es decir, decide si un comando que un agente de código quiere ejecutar puede correr sin pedir confirmación al usuario. Se integra como juez local en el proyecto omp-classifier dentro del repositorio Quentin-M/harness.

La relevancia del modelo está en su política de seguridad explícita: bloquea exfiltración de datos, shells remotas y C2, malware y herramientas de atacante, ejecución de código no confiable (fetch-and-run), robo de credenciales, evasión de seguridad, destrucción a escala de disco e intentos de manipular al revisor, mientras deja pasar trabajo de desarrollo rutinario, incluidas todas las operaciones de git y despliegues y borrados acotados al proyecto.

El adaptador tiene 15,0 millones de parámetros entrenables distribuidos en 75 módulos de las últimas 12 de las 32 capas del modelo base, y se aplica sin fusionar sobre los pesos NVFP4. El repositorio ocupa 0,1 GB, lo que confirma que solo contiene el adaptador y su configuración, no los pesos completos del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer JEV-9B (base nativ-community/JEV-9B-MLX-NVFP4, 32 capas) |
| Parámetros totales | 15,0 M en el adaptador (rango 16, alpha 32, fp32); modelo base de 9B no disponible en detalle |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | base en NVFP4; adaptador en fp32 aplicado sin fusionar |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | adapter.safetensors + adapter_config.json (MLX) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 y alpha 32 en precisión fp32 aplicado sobre cada capa lineal cuantizada de las últimas 12 de las 32 capas del modelo base, lo que suma 75 módulos y 15,0 millones de parámetros. Los pesos se aplican sin fusionar sobre el modelo base NVFP4, de modo que la inferencia requiere cargar JEV-9B-MLX-NVFP4 y superponer el adaptador. La arquitectura subyacente del transformer base no se detalla en la información disponible.

El entrenamiento se ejecutó en GPU de Apple mediante MLX, con 1 época planificada y 469 pasos alcanzados; el checkpoint retenido fue el paso 450. El conjunto de datos consta de 6.391 comandos provenientes de ShellRisk-Bench train, tomngdev/shell-safety-v1.1 (MIT) y filas sintéticas, todas reetiquetadas según la política de seguridad descrita. No se usaron comandos del bench de evaluación para el entrenamiento. Los umbrales de decisión se fijaron mediante validación cruzada de 2 folds agrupados por estado, con un presupuesto del 2% de falsos permitidos.

## Capacidades

- Clasificación binaria de comandos de shell: decide si un comando puede ejecutarse sin confirmación del usuario.
- Detección de exfiltración de datos, shells remotas, canales C2 y herramientas de atacante.
- Detección de malware y de ejecución de código no confiable tipo fetch-and-run.
- Detección de robo de credenciales y de intentos de evasión de seguridad.
- Detección de destrucción a escala de disco y de intentos de manipular al revisor.
- Permisividad controlada con trabajo de desarrollo rutinario: operaciones de git de todo tipo, despliegues y borrados acotados al proyecto.
- Integración como juez local en omp-classifier mediante el adaptador System One del harness (mlx-vlm, Apple Silicon).
- No se documentan capacidades de generación abierta, tool calling, agentes, visión, audio ni multilingüismo más allá de su función de clasificación.

## Casos de uso

- Gate de seguridad en agentes de código: antes de ejecutar cada comando propuesto por un agente, el modelo lo clasifica y bloquea automáticamente los peligrosos, reduciendo la necesidad de confirmación humana en operaciones rutinarias.
- Integración en pipelines de CI/CD: como juez local, permite validar comandos generados por herramientas automáticas sin enviar los comandos a un servicio externo, manteniendo el contexto dentro de la máquina.
- Entornos de desarrollo en Apple Silicon: al ejecutarse con MLX y mlx-vlm sobre el modelo base NVFP4, encaja en flujos locales de Mac con latencias de 1,0 s de mediana y 1,3 s de p95 en un M5 Max.
- Auditoría de políticas de ejecución: el adaptador y sus umbrales calibrados (archivo jev-9b-ft-v3.json) sirven para reproducir la política de seguridad y ajustar el presupuesto de falsos permitidos.
- Protección frente a prompt injection en agentes: la detección de intentos de manipular al revisor cubre el caso de comandos que tratan de convencer al clasificador de que los apruebe.
- Filtrado de comandos en herramientas de administración: despliegues y borrados acotados al proyecto pasan, mientras que operaciones destructivas a escala de disco se bloquean, lo que permite automatizar tareas de mantenimiento con menos fricción.
- Evaluación comparativa de clasificadores de seguridad: el bench de 1.306 comandos etiquetados y la receta de fine-tuning documentada permiten reproducir y comparar variantes del adaptador.

## Benchmarks y rendimiento

Bench de 1.306 comandos etiquetados; umbrales fijados por validación cruzada de 2 folds agrupados por estado con un presupuesto del 2% de falsos permitidos. Latencias medidas en un M5 Max.

| Modelo | Peligrosos bloqueados | Críticos bloqueados | Rutinarios permitidos | p50 / p95 (M5 Max) |
|---|---|---|---|---|
| JEV-9B base | 98,9% | 66/66 | 47,2% | 1,1 s |
| jev-9b-ft-v3 | 97,8% | 65/66 | 92,5% | 1,0 / 1,3 s |

El adaptador sacrifica 1,1 puntos de bloqueo de comandos peligrosos y un comando crítico (65 de 66 frente a 66 de 66) a cambio de elevar del 47,2% al 92,5% la proporción de comandos rutinarios que pasan sin confirmación.

## Requisitos de hardware

- El adaptador por sí solo ocupa 0,1 GB, pero la inferencia requiere el modelo base JEV-9B-MLX-NVFP4 completo, cuyos requisitos de memoria no se detallan en la información disponible.
- Entorno de referencia: GPU de Apple (Apple Silicon) mediante MLX y mlx-vlm; las latencias publicadas corresponden a un M5 Max.
- No se documentan requisitos para GPU NVIDIA (A100, H100, RTX 4090) ni opciones de despliegue con vLLM, llama.cpp, Ollama o TGI; el formato NVFP4 y la librería MLX apuntan a un despliegue específico en Apple Silicon.
- Latencia medida: 1,0 s de mediana y 1,3 s de p95 por decisión en M5 Max.
- Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jev-9b-ft-v3 | 15,0 M (adaptador) sobre base 9B | no disponible | Clasificador de comandos de shell | Apache 2.0 | Hugging Face (MLX) |
| JEV-9B base (nativ-community/JEV-9B-MLX-NVFP4) | 9B | no disponible | Modelo base sin ajuste para la tarea | no disponible | Hugging Face |
| Alternativas de clasificación de comandos | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros clasificadores de comandos comparables en la documentación proporcionada.

## Limitaciones y advertencias

- No es un modelo de propósito general: su única función documentada es clasificar comandos de shell según una política concreta; usarlo para otras tareas no está soportado.
- El adaptador debe aplicarse sin fusionar sobre el modelo base NVFP4; no funciona de forma autónoma y depende de la versión concreta del base.
- Los umbrales de decisión están calibrados para este adaptador exacto (jev-9b-ft-v3.json); reutilizarlos con otro modelo o versión invalida los resultados del bench.
- Tasa de falsos permitidos del 2% por diseño: un 2,2% de comandos peligrosos y 1 de 66 críticos pasaron en la evaluación, por lo que no ofrece garantía absoluta de bloqueo.
- Riesgo de bloqueo de operaciones legítimas fuera de los patrones de desarrollo rutinario cubiertos (git, despliegues y borrados acotados al proyecto).
- Posible dependencia del estilo de los datos de entrenamiento (ShellRisk-Bench, shell-safety-v1.1 y filas sintéticas), con degradación esperada ante comandos muy distintos.
- Idiomas soportados no documentados; el entrenamiento se centra en comandos de shell, no en texto libre multilingüe.
- Licencia Apache 2.0 permite uso comercial, pero las fuentes de datos conservan sus propias licencias (shell-safety-v1.1 es MIT); conviene revisarlas antes de redistribuir derivados.
- Despliegue ligado a Apple Silicon y MLX; no hay soporte documentado para CUDA ni para servidores de inferencia estándar.
- Sin descargas ni likes en el momento de la consulta y creado en noviembre de 2026: ecosistema y validación externa muy limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/memtalow/jev-9b-ft-v3
- Modelo base: https://huggingface.co/nativ-community/JEV-9B-MLX-NVFP4
- Repositorio omp-classifier: https://github.com/STRML/omp-classifier
- Repositorio harness (receta de fine-tuning en bench/judge/finetune.md): https://github.com/Quentin-M/harness
- Dataset de seguridad de shell: tomngdev/shell-safety-v1.1 (MIT)
