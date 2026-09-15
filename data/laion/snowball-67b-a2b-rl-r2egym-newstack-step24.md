# laion/snowball-67b-a2b-rl-r2egym-newstack-step24

## Resumen

Snowball 67B-A2B (checkpoint RL step 24) es un modelo de lenguaje de tipo mezcla de expertos (MoE) desarrollado por LAION, obtenido mediante aprendizaje por refuerzo sobre un modelo base ya ajustado con supervisión. Concretamente, parte de `laion/snowball-67b-a2b-sft-s3-nemotron-terminal-step1888` y se especializa en tareas de agente terminal: resolución de problemas de software en entornos de ejecución reales con feedback de tests. El modelo cuenta con 67.078.882.816 parámetros totales y un repositorio de 134,2 GB, exportado en safetensors en 39 shards.

La relevancia de esta ficha radica en que documenta una de las olas de entrenamiento con RL del proyecto Snowball de LAION, ejecutada sobre una pila de software migrada (harbor + MarinSkyRL, 11-12 de septiembre de 2026). El entrenamiento se realizó con una variante de RLOO en política, sin término KL, sobre un conjunto de tareas de R2E-Gym con el agente de terminal terminus-2. Los resultados held-out mejoran de forma clara a los del modelo base en las tres particiones evaluadas, lo que lo convierte en un caso de estudio útil para quien trabaje en agentes de código entrenados por RL.

Se trata de un modelo orientado a uso agéntico más que a chat general: su pipeline no está declarado en HuggingFace, no tiene descargas ni valoraciones, y su despliegue requiere un fork específico de vLLM (GrugMoe) para servir los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) del tipo GrugMoe, basada en transformer |
| Parametros totales | 67.078.882.816 (67,08 mil millones) |
| Parametros activos | no confirmado en la model card; la nomenclatura "A2B" del nombre sugiere 2 mil millones activos |
| Longitud de contexto | no disponible de forma explicita; el entrenamiento RL uso prompts de 49.152 tokens y generacion de 16.384 tokens |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos en safetensors, presumiblemente bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (39 shards) con config y tokenizer en formato HuggingFace |

## Arquitectura y entrenamiento

La arquitectura es una mezcla de expertos etiquetada como `grug_moe` en las etiquetas del repositorio, con 67.078.882.816 parámetros totales. El nombre del modelo incluye el sufijo "A2B", que en la convención habitual de los modelos MoE indica el número de parámetros activos por token; la model card no confirma explícitamente ese dato, por lo que debe tratarse como una inferencia del nombre y no como una especificación verificada. Los pesos se exportan en el formato estándar de HuggingFace, lo que facilita su inspección, aunque el servicio en producción requiere el fork de vLLM de GrugMoe.

El entrenamiento por refuerzo se llevó a cabo sobre la pila marin migrada (harbor + MarinSkyRL, 11-12 de septiembre de 2026) y utilizó una variante de RLOO en política con pérdida de media de secuencia, staleness 2, grupos de 8, lote de 64 prompts, learning rate 5e-7 y redondeo estocástico en bf16. No se empleó término KL. El conjunto de tareas fue un pool curricular de 1.003 tareas (`tt-v2-train`) con tests ocultos, ejecutadas por el agente de terminal terminus-2 sobre R2E-Gym. La configuración de inferencia durante el entrenamiento fue de 49.152 tokens de prompt y 16.384 tokens de generación. Como innovación práctica, se publica un draft EAGLE-3 (`laion/snowball-64k-eagle3-draft-r2egym`) que aporta aproximadamente 1,5x de aceleración en decodificación para esta familia de modelos.

## Capacidades

- Resolución de tareas de software en entornos reales: el modelo ha sido entrenado contra tests ocultos en R2E-Gym, por lo que está orientado a modificar repositorios y validar sus cambios ejecutando pruebas.
- Uso agéntico de terminal: el entrenamiento se realizó con el agente terminus-2, lo que implica capacidad de emitir comandos y reaccionar a su salida en múltiples pasos.
- Razonamiento multi-paso con feedback del entorno: al optimizarse con RL sobre recompensas de ejecución, el modelo aprende a corregir acciones tras fallos de test.
- Generalización a repositorios no vistos: los resultados held-out incluyen una partición de repositorios no vistos con pass@1 de 0,595.
- Capacidad de resolver problemas nunca resueltos previamente: la partición "never-solved" pasa de 0,036 en el base a 0,079 en este checkpoint.
- Tool calling y function calling: no disponible de forma explícita en la model card; la interfaz documentada es el agente de terminal.
- Capacidades multilingües: no disponible.
- Capacidades de visión o audio: no disponible.
- Modo thinking explícito: no disponible.

## Casos de uso

- Agentes de resolución de issues en repositorios: el modelo puede recibir un problema descrito en lenguaje natural junto con el árbol del repositorio, proponer parches y validarlos ejecutando la suite de tests, gracias a su entrenamiento específico sobre tareas de R2E-Gym con tests ocultos.
- Reparación automática de tests en CI/CD: integrado en un pipeline, puede tomar los fallos de integración continua y generar modificaciones que se validan contra los tests del propio repositorio antes de abrir una pull request.
- Migración de código entre versiones de dependencias: su capacidad de operar en terminal y de generalizar a repositorios no vistos (0,595 de pass@1 en esa partición) lo hace adecuado para tareas de actualización de APIs y refactorizaciones guiadas por tests.
- Autocompletado de tareas de mantenimiento de larga duración: con prompts de hasta 49.152 tokens puede procesar ficheros y trazas extensas, lo que permite trabajar con bases de código medianas en una sola pasada.
- Investigación en RL para agentes: sirve como checkpoint de referencia para reproducir la curva de mejora frente al modelo base en las tres particiones de validación publicadas.
- Generación de scripts de shell y automatización de entornos: el entrenamiento con terminus-2 refuerza la emisión de comandos correctos y la interpretación de su salida, útil en herramientas de aprovisionamiento y depuración.
- Evaluación comparativa de decodificación especulativa: combinado con el draft EAGLE-3 de la misma familia, permite medir el impacto de la decodificación especulativa en cargas agénticas de terminal.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son los de pass@1 a 8 intentos sobre la partición de validación `tt-v2 val441` (150 tareas same-repo, 115 unseen-repo y 176 held-out), comparados de forma emparejada con el modelo base. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar en la información disponible.

| Particion (pass@1, 8 intentos) | Modelo base | Snowball 67B-A2B RL step 24 |
|---|---|---|
| Same-repo (150 tareas) | 0,375 | 0,600 |
| Unseen-repo (115 tareas) | 0,402 | 0,595 |
| Never-solved (176 tareas) | 0,036 | 0,079 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: alrededor de 134 GB solo para los pesos, a lo que hay que sumar la caché KV correspondiente a prompts de hasta 49.152 tokens; en la práctica se necesita un nodo multi-GPU.
- GPU recomendadas: nodos con varias A100 80 GB, H100 80 GB o equivalentes. Con dos H100 80 GB (160 GB) los pesos entran con margen limitado; cuatro GPU ofrecen holgura para lotes y contextos largos.
- Cabe en GPU de consumo: no en un solo dispositivo. Incluso con cuantización agresiva a 4 bits (unos 34 GB) haría falta más de una GPU de consumo, y no se publican pesos cuantizados en el repositorio.
- Opciones de despliegue: el autor indica servir el modelo con el fork de vLLM de GrugMoe; no se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible. Se conoce únicamente que el draft EAGLE-3 `laion/snowball-64k-eagle3-draft-r2egym` proporciona aproximadamente 1,5x de aceleración en decodificación para esta familia.
- Almacenamiento: el repositorio ocupa 134,2 GB repartidos en 39 shards de safetensors.

## Comparativa con modelos similares

No se han encontrado en la información proporcionada modelos de terceros comparables en la misma categoría (MoE de ~67B con RL agéntico sobre terminal). La única comparación con datos verificables es contra el propio modelo base del que deriva este checkpoint.

| Modelo | Parametros totales | Contexto | Pass@1 same-repo | Pass@1 unseen-repo | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Snowball 67B-A2B RL step 24 | 67.078.882.816 | no disponible (prompt de 49.152 en entrenamiento) | 0,600 | 0,595 | Apache 2.0 | HuggingFace, 0 descargas |
| Snowball 67B-A2B SFT s3 Nemotron Terminal step1888 (base) | 67.078.882.816 (heredado) | no disponible | 0,375 | 0,402 | Apache 2.0 | HuggingFace |
| Otros modelos comparables | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. La model card no documenta análisis de sesgo, y el entrenamiento se limita a tareas de código con tests, un dominio estrecho.
- Riesgo de alucinación: aunque el modelo se ha optimizado contra tests de ejecución, la partición "never-solved" solo alcanza 0,079 de pass@1, lo que indica que sigue fallando en la gran mayoría de los problemas que el base tampoco resolvía. Fuera del dominio de R2E-Gym no hay evidencia de rendimiento.
- Especialización extrema: es un checkpoint de RL orientado a agentes de terminal; no se documentan capacidades de conversación general, visión ni multilingüismo, y el pipeline de HuggingFace no está declarado.
- Limitaciones de contexto: la model card no declara la ventana máxima soportada. Los 49.152 tokens de prompt y 16.384 de generación son la configuración de entrenamiento, no necesariamente el límite del modelo.
- Idiomas: no disponible. No se puede asumir soporte multilingüe.
- Restricciones de licencia: Apache 2.0, lo que permite uso comercial y modificación, siempre que se conserve el aviso de licencia y se atribuya correctamente. No se documentan restricciones adicionales.
- Requisito de infraestructura: el despliegue depende de un fork específico de vLLM (GrugMoe), lo que añade fricción operativa y riesgo de mantenimiento frente a vLLM estándar.
- Madurez del artefacto: 0 descargas y 0 valoraciones en el momento de la consulta, sin métricas de producción publicadas.
- Fecha de creación inusual: el repositorio figura creado el 14 de septiembre de 2026, coherente con la ventana de entrenamiento declarada (11-12 de septiembre de 2026).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/laion/snowball-67b-a2b-rl-r2egym-newstack-step24
- Modelo base (Snowball 67B-A2B SFT s3 Nemotron Terminal step1888): https://huggingface.co/laion/snowball-67b-a2b-sft-s3-nemotron-terminal-step1888
- Draft EAGLE-3 para decodificación especulativa: https://huggingface.co/laion/snowball-64k-eagle3-draft-r2egym
- Paper, blog o repositorio del proyecto Snowball: no disponible en la información proporcionada
- Resultados de la búsqueda web: los enlaces devueltos no guardan relación con el modelo (mapas de Corea del Sur), por lo que no se incluyen como referencias válidas.
