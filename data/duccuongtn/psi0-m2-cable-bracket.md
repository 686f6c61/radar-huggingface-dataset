# duccuongtn/psi0-m2-cable-bracket

## Resumen

Psi0 M2 cable + bracket es un conjunto de checkpoints de un modelo Psi0 afinado (fine-tuning) para control robótico de manipulación. Lo publica el usuario duccuongtn en Hugging Face y deriva de Psi0, un modelo base orientado a políticas de acción (vision-language-action o equivalente) del que no se detalla la arquitectura en la información disponible. El modelo se ha entrenado sobre el conjunto de datos `m2v6_cable_bracket_newrobot_dedup_swbc_v21`, con acciones de 35 dimensiones, estado de 33 dimensiones y chunks de 16 pasos.

El problema que resuelve es concreto: generar secuencias de acciones de control para tareas de manipulación de cables y soportes (cable y bracket), con tres instrucciones posibles (solo cable, solo bracket, ambos). Se publican dos checkpoints, en los pasos 20000 y 30000 de un entrenamiento con schedule coseno de 60000 pasos y batch efectivo de 128. La validación reportada es el error absoluto medio (L1) de la acción tras deshacer el escalado `bounds_q99`, promediado sobre el chunk y todas las dimensiones de acción, sobre 20 lotes de 12 episodios reservados.

La relevancia es acotada: se trata de un artefacto de investigación con licencia no declarada, sin benchmarks estándar ni idiomas especificados, y con un tamaño de repositorio de 12,5 GB que sugiere pesos en precisión completa o media. Es útil para quien quiera reproducir o comparar políticas de manipulación sobre estas tareas, no como modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Psi0 (detalles no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors` por checkpoint) |

Datos adicionales del entrenamiento y la interfaz del modelo:

| Parametro | Valor |
|---|---|
| Dimension de accion | 35 |
| Dimension de estado | 33 |
| Longitud de chunk de accion | 16 |
| Batch efectivo | 128 |
| Schedule | coseno, 60000 pasos |
| Instrucciones | cable only, bracket only, both |
| Checkpoints publicados | step 20000, step 30000 |
| Ficheros por checkpoint | `model.safetensors`, `run_config.json` |
| Tamano del repo | 12,5 GB |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna de Psi0: solo se indica que es un modelo "plain Psi0" afinado, lo que sugiere que se parte de un checkpoint base Psi0 sin modificaciones estructurales y se ajusta sobre un dataset específico. No se detallan el tipo de transformer, el número de capas, la dimensión oculta, el encoder visual ni el mecanismo de fusión entre observaciones e instrucciones.

El entrenamiento se realizó sobre `m2v6_cable_bracket_newrobot_dedup_swbc_v21`, un dataset con deduplicación (`dedup`) y presumiblemente recolectado con un robot nuevo (`newrobot`). La configuración es explícita: 35 dimensiones de acción, 33 de estado, chunks de 16 pasos, batch efectivo de 128 y schedule coseno de 60000 pasos. Se publican dos puntos intermedios (20000 y 30000) con error L1 de validación de 0,064 y 0,065 respectivamente, lo que indica que el rendimiento se estabiliza entre ambos y que el checkpoint de 20000 no es peor que el de 30000 en esta métrica. No se menciona RLHF, DPO ni ninguna técnica de alineación; es un ajuste supervisado sobre datos de demostración.

## Capacidades

- Generación de secuencias de acción de 35 dimensiones para control de robot, en chunks de 16 pasos.
- Condicionamiento por instrucción: tres modos explícitos (cable only, bracket only, both).
- Consumo de estado de 33 dimensiones junto con la observación para producir la acción.
- Manipulación específica de cables y soportes (bracket) en un entorno de robot concreto.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No se documenta visión, audio ni modo de razonamiento explícito (thinking mode).
- La inferencia "lee solo los pesos" según la model card, sin dependencia de configuración de ejecución adicional.

## Casos de uso

- Reproducción de experimentos de manipulación de cables: cargar `psi0-step20000` o `psi0-step30000` con su `run_config.json` y evaluar el error L1 sobre los mismos 12 episodios reservados para verificar la reproducibilidad del 0,064 y 0,065 reportados.
- Control de una tarea de ensamblaje de soportes (bracket): usar la instrucción "bracket only" para generar acciones de 35 dimensiones en chunks de 16 pasos sobre el robot de destino, siempre que la interfaz de estado de 33 dimensiones coincida con la del entrenamiento.
- Tarea combinada cable + bracket: emplear la instrucción "both" en secuencias donde el robot debe manipular ambos elementos, aprovechando que el dataset de entrenamiento incluye esa combinación.
- Punto de partida para fine-tuning adicional: los checkpoints intermedios permiten continuar el entrenamiento con otro dataset o con el mismo schema de 35 acciones y 33 estados, comparando si el step 20000 o el 30000 converge mejor como inicialización.
- Análisis de estabilidad del entrenamiento: comparar las curvas de error L1 entre 20000 y 30000 pasos para estudiar si el schedule coseno de 60000 pasos sigue mejorando o satura, útil para decidir cuántos pasos invertir en futuros ajustes.
- Evaluación de robustez ante el cambio de robot: el sufijo `newrobot` del dataset sugiere que el modelo se entrenó con un robot distinto al original; puede usarse para medir la transferencia entre plataformas si se dispone de datos del robot anterior.
- Baseline en investigación de políticas de acción: servir como referencia cuantitativa (L1 ≈ 0,064) frente a otras políticas entrenadas sobre el mismo dataset o sobre variantes deduplicadas.

## Benchmarks y rendimiento

Los únicos datos publicados son métricas de validación interna, no benchmarks estándar (MMLU, HumanEval, GSM8K no aplican a este tipo de modelo).

| Checkpoint | Paso | Val L1 (acción, tras deshacer `bounds_q99`) |
|---|---|---|
| `psi0-step20000` | 20000 | 0,064 |
| `psi0-step30000` | 30000 | 0,065 |

La métrica se calcula como el error absoluto medio de la acción, promediado sobre el chunk de 16 pasos y las 35 dimensiones de acción, sobre 20 lotes de 12 episodios reservados. No se han publicado resultados de benchmarks estándar ni comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión. El repositorio ocupa 12,5 GB e incluye dos checkpoints con `model.safetensors` cada uno; si cada uno ronda los 6 GB, la inferencia en fp16 requeriría del orden de 6-8 GB de VRAM solo para pesos, más el estado de activaciones y el encoder de observaciones, que no se detalla.
- GPU recomendadas: no disponibles. Por el tamaño del repositorio, una GPU consumer con 12-16 GB (RTX 4070 Ti, RTX 4080, RTX 4090) podría alojar un checkpoint en fp16, pero no se confirma.
- Cabe en GPU consumer: probablemente sí para un único checkpoint, pero no verificado en la información disponible.
- Opciones de despliegue: no se documentan (no se mencionan vLLM, llama.cpp, Ollama ni TGI). La model card indica que la inferencia lee únicamente los pesos y que cada carpeta incluye `run_config.json`, lo que sugiere un runner propio de Psi0 no especificado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Psi0 es la referencia base, pero no se detallan sus especificaciones ni las de otras políticas de acción de la misma categoría.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Psi0 M2 cable + bracket (step 20000) | no disponible | no disponible | Val L1 0,064 | no disponible | Hugging Face |
| Psi0 M2 cable + bracket (step 30000) | no disponible | no disponible | Val L1 0,065 | no disponible | Hugging Face |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial ni redistribución; hay que contactar con el autor antes de cualquier despliegue en producción.
- Sesgos: no documentados. Al entrenarse sobre un dataset concreto de un robot y unas tareas específicas, el modelo heredará los sesgos de distribución de ese dataset (posiciones, objetos, condiciones de iluminación).
- Riesgo de alucinación: en políticas de acción el equivalente es generar trayectorias fuera de distribución; el error L1 de 0,064 no garantiza seguridad física en el robot.
- Limitación de idioma: no se especifican idiomas soportados; las instrucciones son tres cadenas fijas (cable only, bracket only, both), no lenguaje natural libre.
- Limitación de contexto y de interfaz: la acción está fijada a 35 dimensiones, el estado a 33 y el chunk a 16 pasos; cualquier robot con un espacio de acción o estado distinto requerirá adaptación.
- Solo se publican dos checkpoints intermedios de un entrenamiento de 60000 pasos; no hay checkpoint final, lo que limita la evaluación del modelo convergido.
- El error L1 se mide tras deshacer `bounds_q99`; sin ese escalado, las magnitudes de error no son comparables con otras publicaciones.
- El repositorio (12,5 GB) incluye dos copias de pesos; conviene descargar solo la carpeta del checkpoint necesario.
- No hay pipeline declarado en Hugging Face ni demo, por lo que la integración requiere el runner de Psi0, no documentado en la ficha.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/duccuongtn/psi0-m2-cable-bracket
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios de código o demos.
