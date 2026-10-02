# Modusnsus/laya-nli-conflict-v10-s2

## Resumen

laya-nli-conflict-v10-s2 es un checkpoint de clasificación de texto de 321.908.998 parámetros (aproximadamente 0,32B) publicado por el usuario Modusnsus (modusensus). Se trata de un ajuste fino del modelo base convaiinnovations/laya-multilingual, orientado a la detección de conflictos de memoria en tareas de inferencia de lenguaje natural (NLI) dentro del programa de cabeceras "laya NLI memory-conflict". Forma parte de la familia Laya, descrita por sus autores como un motor de decisión multilingüe de "System 1": recibe preguntas tipadas y devuelve probabilidades reales en una única pasada hacia delante, sin generar texto.

El punto clave de esta ficha es que el propio autor etiqueta el modelo como **research archive** y **NOT delivered** (no entregado). El checkpoint falló las puertas de aceptación de su ronda y nunca se distribuyó como modelo de producción. La cabecera de producción declarada por el autor es [`Modusnsus/laya-nli-memory-conflict`](https://huggingface.co/Modusnsus/laya-nli-memory-conflict) (v4). Este artefacto se subió para preservar la procedencia y como copia de seguridad mientras la ronda 11 espera cuota de GPU en Kaggle.

Su relevancia es, por tanto, metodológica más que práctica: junto con los checkpoints hermanos de la misma ronda y configuración (`laya-nli-conflict-v9` con 0.9050 y `laya-nli-conflict-v10-l2` con 0.8890), documenta una banda de ruido de 1,6 puntos porcentuales en la validación principal y una variación de hasta 50 puntos porcentuales en la métrica B2, que cruza la línea de decisión de 0,5. Esa evidencia es la que motiva el cambio a un protocolo de mediana multi-ejecución en la ronda 11.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer para clasificación de texto; derivado de convaiinnovations/laya-multilingual, con encoder jhu-clsp/mmBERT-base segun rl_agent_config.json |
| Parametros totales | 321.908.998 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (artefacto publicado en bf16 segun rl_agent_config.json) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (model.safetensors) |

## Arquitectura y entrenamiento

El modelo es una cabecera de clasificación de texto construida sobre el modelo base convaiinnovations/laya-multilingual, perteneciente a la familia Laya de "System 1 decision engine". Según la documentación del autor, Laya es una familia de modelos de decisión que reciben preguntas tipadas y devuelven probabilidades en una única pasada, sin decodificación autoregresiva de texto. El archivo `rl_agent_config.json` de este checkpoint indica el uso del encoder `jhu-clsp/mmBERT-base` y precisión bf16. No se dispone de detalles sobre el número de capas, dimensiones ocultas ni longitud de contexto.

El entrenamiento se realizó mediante el kernel de GPU de Kaggle `daphnelaurent/laya-nli-conflict-ce` (secuencia de tres versiones), sobre el dataset `daphnelaurent/nli-conflict-pairs` v15. El fichero de métricas registra `no_rl: true`, lo que indica que esta ejecución no empleó refuerzo con aprendizaje por refuerzo ni un ajuste RL posterior. El artefacto pertenece a la ronda 10 del programa, y su variante "S2" corresponde a la ejecución de línea base de ruido ("noise-baseline") con el corpus y la configuración v9. La integridad del checkpoint se documenta con un hash SHA256 (`5cbcc083…8724b6`) en el manifiesto del repositorio del autor.

## Capacidades

- Clasificación de texto en el ámbito NLI (inferencia de lenguaje natural), con foco en la detección de conflictos de memoria.
- Salida de decisiones tipadas con probabilidades calibradas: el artefacto reporta `val_ece` de 0,0411 sobre 1000 ejemplos de validación.
- Ajuste de umbral de decisión configurable mediante el parámetro τ(noul) = 1,1939 documentado en `rl_agent_config.json`.
- Inferencia en una única pasada hacia delante (System 1), sin generación de texto ni razonamiento en varios pasos.
- Soporte de herramientas y function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: el modelo base es multilingüe, pero las capacidades específicas de este checkpoint no están documentadas.
- Capacidades especiales (modo de pensamiento, visión, audio): no disponible.

## Casos de uso

- **Investigación en calibración de clasificadores**: sirve como punto de referencia para estudiar la varianza entre ejecuciones con la misma configuración, dado que el autor documenta una banda de ruido de 1,6 puntos porcentuales en la validación principal.
- **Auditoría de métricas de decisión**: permite reproducir el análisis de la variación de la métrica B2 (0,889, 0,3877 y 0,6951 según la ejecución) para ilustrar por qué una única lectura sin agregación carece de poder de decisión.
- **Detección de conflictos de memoria en pipelines de diálogo**: con la debida validación previa, podría integrarse como clasificador auxiliar para señalar contradicciones entre memoria conversacional y turnos actuales, aunque el autor no lo recomienda como modelo entregado.
- **Reproducibilidad y procedencia**: útil para replicar el flujo de entrenamiento del kernel `daphnelaurent/laya-nli-conflict-ce` y verificar el hash SHA256 del conjunto de artefactos.
- **Comparativa de cabeceras NLI**: sirve como tercer punto de la banda de ruido junto a `laya-nli-conflict-v9` y `laya-nli-conflict-v10-l2` para evaluar la estabilidad del corpus v15.
- **Estudio del ecosistema Laya**: permite analizar cómo se comporta una cabecera especializada sobre el modelo base `convaiinnovations/laya-multilingual` frente a variantes hermanas como `laya-typed-decisions-multilingual`.
- **Docencia sobre gate tables**: el registro de la ronda incluye una tabla completa de puertas de aceptación en `HANDOFF_NLI_V10.md`, aprovechable como material didáctico sobre criterios de entrega fallidos.

No se recomienda su uso directo en producción, dado que el propio autor lo marca como modelo no entregado.

## Benchmarks y rendimiento

Los únicos datos de rendimiento disponibles son los registrados por el autor en el manifiesto de la ronda. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

| Metrica | laya-nli-conflict-v10-s2 | laya-nli-conflict-v9 | laya-nli-conflict-v10-l2 |
|---|---|---|---|
| Exactitud de validacion (main val) | 0,894 | 0,9050 | 0,8890 |
| ECE de validacion (val_ece) | 0,0411 | no disponible | no disponible |
| n_val | 1000 | no disponible | no disponible |
| τ(noul) | 1,1939 | 1,03–1,19 | 1,03–1,19 |
| Metrica B2 | 0,3877 | 0,889 | 0,6951 |
| Diagnostico de sesgo | 13/14 PASS | no disponible | no disponible |
| Uso de RL | no (no_rl true) | no disponible | no disponible |

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 321.908.998 parámetros, en bf16 se requieren aproximadamente 0,65 GB solo para los pesos; con estados de activación y overhead, en torno a 1-2 GB.
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM es suficiente para la carga del modelo. No se dispone de recomendaciones específicas del autor.
- **GPU de consumo**: cabe holgadamente en tarjetas de consumo como RTX 3060, RTX 4060, RTX 4090, así como en GPUs integradas con memoria unificada.
- **CPU**: el tamaño del modelo permite inferencia en CPU, aunque no se han publicado cifras de latencia al respecto.
- **Opciones de despliegue**: compatible con la librería Transformers (pipeline `text-classification`). El tag `endpoints_compatible` sugiere compatibilidad con Hugging Face Inference Endpoints. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- **Latencia y throughput estimados**: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| laya-nli-conflict-v10-s2 | 0,32B | no disponible | main val 0,894 | apache-2.0 | Publico (archivo de investigacion, no entregado) |
| laya-nli-conflict-v9 | no disponible | no disponible | main val 0,9050 | no disponible | Publico |
| laya-nli-conflict-v10-l2 | no disponible | no disponible | main val 0,8890 | no disponible | Publico |
| laya-nli-memory-conflict (v4) | no disponible | no disponible | no disponible | no disponible | Publico (cabecera de produccion declarada) |

La comparación con modelos de otras familias (por ejemplo, clasificadores NLI genéricos basados en encoders multilingües) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- **Modelo no entregado**: el propio autor lo marca explícitamente como "research archive — NOT delivered". Falló las puertas de aceptación de su ronda y no debe usarse como modelo de producción.
- **Alta variación entre ejecuciones**: la misma configuración produce una banda de ruido de 1,6 puntos porcentuales en la validación principal y una horquilla de 50 puntos porcentuales en la métrica B2 (0,889 / 0,3877 / 0,6951), lo que cruza la línea de decisión de 0,5 y anula el poder de decisión de una ejecución individual.
- **Riesgo de alucinación**: no disponible; al ser un clasificador sin generación de texto, el riesgo se traslada a falsos positivos y negativos en la detección de conflictos.
- **Sesgos conocidos**: el autor reporta un diagnóstico de sesgo con 13/14 PASS, pero no detalla qué sesgos ni qué pruebas componen ese diagnóstico.
- **Limitaciones de contexto e idioma**: no disponibles.
- **Restricciones de licencia**: apache-2.0 permite uso comercial y modificación, pero el autor advierte que el checkpoint no pasó los criterios de entrega, por lo que su uso en producción queda bajo responsabilidad del adoptante.
- **Trazabilidad**: la validez del artefacto depende del hash SHA256 documentado en `archive_sha256_manifest.txt`; cualquier copia sin verificación de integridad pierde la garantía de procedencia.
- **Dependencia de ronda**: el estado del programa indica que la ronda 11 implantará un protocolo de mediana multi-ejecución con un instrumento de familia isomorfa de 9 casos; este checkpoint quedará obsoleto en cuanto se publique.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Modusnsus/laya-nli-conflict-v10-s2
- Cabecera de produccion declarada (v4): https://huggingface.co/Modusnsus/laya-nli-memory-conflict
- Checkpoint hermano v9: https://huggingface.co/Modusnsus/laya-nli-conflict-v9
- Checkpoint hermano v10-l2: https://huggingface.co/Modusnsus/laya-nli-conflict-v10-l2
- Perfil del autor en HuggingFace: https://huggingface.co/Modusnsus
- Variante relacionada laya-typed-decisions-multilingual: https://huggingface.co/Modusnsus/laya-typed-decisions-multilingual
- Repositorio del proyecto en GitHub: https://github.com/modusensus/laya
- Registro y tabla de puertas de la ronda: https://github.com/modusensus/laya/blob/main/kaggle_eval/HANDOFF_NLI_V10.md
- Manifiesto de hashes SHA256: https://github.com/modusensus/laya/blob/main/kaggle_eval/archive_sha256_manifest.txt
- Sitio del proyecto Laya: https://laya.convaiinnovations.com/
- Playground y benchmark de Laya: https://github.com/wdobry/laya-playground
- Ficha en directorio de terceros: https://free2aitools.com/model/modusnsus/laya-nli-memory-conflict
- Modelo base: https://huggingface.co/convaiinnovations/laya-multilingual
