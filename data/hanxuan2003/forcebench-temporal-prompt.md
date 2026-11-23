# hanxuan2003/ForceBench-Temporal-Prompt

## Resumen

ForceBench — Temporal Prompt es un conjunto de ocho checkpoints específicos de tarea derivados de pi0.5 (la familia de modelos visión-lenguaje-acción de Physical Intelligence) y publicados por el usuario hanxuan2003 como material de réplica para el benchmark de manipulación robótica ForceBench. No es un modelo de propósito general ni un modelo de lenguaje: cada checkpoint resuelve una única tarea de manipulación física en simulación (ordenar pesos, girar un grifo, encender un fogón, enroscar una tuerca, etc.) y está entrenado con una ventana causal de 16 frames de lecturas de fuerza-par (wrench) que se incorpora al estado del robot tokenizado.

La innovación metodológica, identificada públicamente como `temporal_fusion`, consiste en inyectar en la representación del estado no solo el wrench instantáneo sino también la media y la desviación típica poblacional de la ventana temporal, lo que permite al modelo razonar sobre la dinámica de contacto y no solo sobre la fuerza puntual. El repositorio ocupa 99,53 GB (92,70 GiB) de payload de inferencia distribuido en ocho directorios Orbax/OCDBT de aproximadamente 12,44 GB cada uno.

Es relevante ahora porque acompaña a un manuscrito enviado a ICRA y publica tasas de éxito de referencia por tarea (desde el 90 % en Weight Sort hasta el 2,5 % en Drawer Pull) junto con metadatos de procedencia, hashes de normalización y notas de puntuación. No obstante, el propio autor advierte de que la compatibilidad con el cargador público de estos ficheros concretos no está verificada y de que se trata de una release de pesos, no de un entorno ejecutable completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | pi0.5 (visión-lenguaje-acción) con fusión temporal de wrench; detalles exactos de config no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible; ventana causal de 16 frames de wrench para el estado |
| Tipos de cuantizacion | no disponible (pesos en formato Orbax/OCDBT, no cuantizados de forma documentada) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Gemma (términos de PaliGemma/Gemma aplicables); código ForceBench MIT y OpenPI Apache |
| Formato de pesos | Orbax/OCDBT (directorio `params/` + `assets/` + `_CHECKPOINT_METADATA`), no safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es pi0.5, un modelo visión-lenguaje-acción de la familia PaliGemma/Gemma adaptado a control robótico, sobre el que se aplica la variante `temporal_fusion`. La modificación clave es que el estado del robot tokenizado incorpora tres componentes derivados de una ventana causal de 16 frames de lecturas de fuerza-par: el wrench actual, la media de la ventana y la desviación típica poblacional. Esto dota al policy de información sobre la evolución temporal del contacto, algo que un único frame de fuerza no captura.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron etapas de RLHF o DPO. Los checkpoints se distribuyen como directorios Orbax (OCDBT) con los shards de `params/`, los assets de normalización de la tarea original y, cuando existía en el export original, el fichero raíz `_CHECKPOINT_METADATA`. El estado del optimizador y las cachés de entrenamiento no se incluyen. Cada checkpoint corresponde a una tarea y a un método concretos, y su asociación con las tasas de éxito del paper se ha revisado vinculando registros de evaluación guardados con identidades de checkpoint (documentado en `PROVENANCE.json`).

## Capacidades

- Control robótico de manipulación en simulación para ocho tareas específicas: Weight Sort, CoM Sort, Faucet Turn, Faucet Direction, Stove Turn, Stove Press, Drawer Pull y Nut Thread.
- Percepción visión-lenguaje-acción: procesa observaciones visuales y estado del robot para emitir acciones.
- Fusión temporal de fuerza-par: incorpora media y desviación típica de una ventana causal de 16 frames de wrench al estado tokenizado.
- Razonamiento sobre dinámica de contacto (giro de grifos, pulsación de fogones, enroscado de tuercas) gracias a la señal de fuerza.
- No se documenta soporte de tool calling, function calling, agentes multi-paso ni modo de razonamiento explícito (thinking mode).
- Capacidades multilingües no disponibles: el modelo está etiquetado únicamente como inglés.
- No se documentan capacidades de audio ni de visión general fuera del contexto de control robótico.

## Casos de uso

- Réplica de resultados de ForceBench: descargar el checkpoint de una tarea concreta (por ejemplo `checkpoints/weight_sort/9999`) y evaluarlo con el protocolo del paper para verificar la tasa de éxito reportada del 90 % sobre 200 semillas.
- Investigación en fusión de fuerza y visión: usar la variante `temporal_fusion` como baseline para estudiar cómo la ventana causal de 16 frames de wrench afecta al rendimiento en tareas de contacto, comparándola con los otros cinco repositorios de fusión de fuerza del benchmark.
- Estudio de tareas de manipulación fina: emplear los checkpoints de Nut Thread (22 %) o Drawer Pull (2,5 %) para analizar modos de fallo en tareas de alta precisión y baja tasa de éxito.
- Desarrollo de políticas para grifos y fogones: los checkpoints Faucet Turn, Faucet Direction, Stove Turn y Stove Press permiten experimentar con control basado en fuerza en mecanismos articulados, donde la señal de par es informativa.
- Auditoría de procedencia y reproducibilidad: utilizar `PROVENANCE.json`, `SHA256SUMS` y las notas de puntuación para validar identidades de checkpoint, hashes de normalización y criterios de éxito, útil en trabajos de replicación.
- Integración en pipelines de simulación con JAX/Orbax: cargar los directorios de checkpoint en un runtime de simulación compatible (pendiente de verificar la compatibilidad con el cargador público) para entrenar o evaluar políticas derivadas.

## Benchmarks y rendimiento

Las tasas siguientes son los valores de referencia del manuscrito ICRA reportados por el autor, respaldados por registros de evaluación guardados; no provienen de nuevos rollouts ni de una reproducción extremo a extremo. Se evaluaron 200 semillas (300–499) por tarea y método.

| Tarea | Checkpoint | Éxitos / 200 | Tasa | Payload (GB) |
|---|---|---:|---:|---:|
| Weight Sort | `checkpoints/weight_sort/9999` | 180 | 90 % | 12,441 |
| CoM Sort | `checkpoints/rattle_sort/9999` | 139 | 69,5 % | 12,441 |
| Faucet Turn | `checkpoints/faucet_turn/9999` | 35 | 17,5 % | 12,441 |
| Faucet Direction | `checkpoints/faucet_force_turn/9999_fixed` | 62 | 31 % | 12,442 |
| Stove Turn | `checkpoints/stove_turn_on/9999` | 14 | 7 % | 12,442 |
| Stove Press | `checkpoints/stove_press_turn/9999` | 43 | 21,5 % | 12,442 |
| Drawer Pull | `checkpoints/radmanso_drawer_sort_table/9999` | 5 | 2,5 % | 12,442 |
| Nut Thread | `checkpoints/nut_thread/9999` | 44 | 22 % | 12,441 |

No se han publicado en la información disponible resultados de benchmarks estándar de lenguaje (MMLU, HumanEval, GSM8K) ni comparaciones numéricas con otros métodos de fusión de fuerza.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; cada checkpoint ocupa aproximadamente 12,44 GB en disco, por lo que se requiere al menos esa cantidad de memoria para cargar los pesos, más el overhead del runtime de simulación y del modelo base pi0.5.
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: no verificada; el tamaño de cada checkpoint (≈12,44 GB) sugiere que podría caber en GPUs con 16 GB o más, pero no hay confirmación del autor.
- Opciones de despliegue: los checkpoints son directorios Orbax/OCDBT, no safetensors ni GGUF; no son compatibles con vLLM, llama.cpp, Ollama ni TGI. Requieren un runtime JAX/Orbax con la configuración exacta del modelo, tokenizer y normalización originales, y el cargador público tiene una comprobación de identidad que no debe desactivarse.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ForceBench Temporal Prompt (pi0.5) | no disponible | ventana de 16 frames de wrench | 2,5 %–90 % según tarea (referencia del paper) | Gemma | Pesos en HF, runtime no verificado |
| Otros repositorios de fusión de fuerza de ForceBench | no disponible | no disponible | 48 checkpoints tarea/método en seis repositorios | Gemma / MIT / Apache | Pesos en HF |
| pi0.5 base (Physical Intelligence) | no disponible | no disponible | no disponible | Gemma | Pesos base referenciados, no incluidos |

No se dispone de datos numéricos de otros métodos de fusión de fuerza ni de modelos visión-lenguaje-acción comparables en la información proporcionada, por lo que la comparación cuantitativa queda como no disponible.

## Limitaciones y advertencias

- Compatibilidad con el cargador público no verificada: el autor advierte explícitamente de que debe leerse `RUNTIME.md` antes de planificar inferencia y de que se necesita un runtime congelado, configuración exacta, tokenizer y normalización originales.
- Es una release de pesos, no un entorno ejecutable: no se incluyen datasets de entrenamiento, assets del tokenizer ni assets del simulador.
- Tasas de éxito no reproducidas: los valores son referencias del manuscrito respaldadas por registros guardados, no resultados de nuevos rollouts.
- Discrepancias de puntuación documentadas: en Nut Thread, el conteo histórico `success_report` da 44/200 y el `final_success_report` da 43/200; el paper usa el primero. En Faucet Direction debe usarse el directorio `9999_fixed` y copiarse el criterio `outcome.criteria` sustituyendo solo la condición de ángulo final por la regla de cota inferior.
- Falta de metadatos raíz: el export de Faucet Direction carece de `_CHECKPOINT_METADATA` raíz; el autor preserva esa ausencia y no inventa el fichero.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; al ser un policy de control, el modo de fallo relevante es la ejecución incorrecta de la tarea, no la generación de texto.
- Restricciones de licencia: los pesos están sujetos a los términos de Gemma/PaliGemma, que incluyen restricciones de uso; son términos separados de las licencias MIT de ForceBench y Apache de OpenPI. Debe revisarse `LICENSES.md`, `LICENSE_GEMMA.txt` y `NOTICE` antes de cualquier uso comercial.
- Idioma: solo inglés; no se documenta soporte multilingüe.
- Uso previsto limitado a simulación robótica; no es un modelo de lenguaje de propósito general.

## Enlaces

- Hugging Face: https://huggingface.co/hanxuan2003/ForceBench-Temporal-Prompt
- Código fuente de ForceBench (revisión inspeccionada): https://github.com/forcebench-platform/ForceBench/tree/31acf7353d2f723985e6576a5708f67a81707d61
- Documentación de la familia de modelos (método `temporal_fusion`): https://github.com/forcebench-platform/ForceBench/blob/31acf7353d2f723985e6576a5708f67a81707d61/baselines/temporal/README.md
- Resultados congelados del paper: https://github.com/forcebench-platform/ForceBench/blob/31acf7353d2f723985e6576a5708f67a81707d61/results/paper_reference.json
- Protocolo del paper: https://github.com/forcebench-platform/ForceBench/blob/31acf7353d2f723985e6576a5708f67a81707d61/configs/paper_protocol.json
- Ficheros de referencia en el repo: `RUNTIME.md`, `PROVENANCE.json`, `RELEASE_SCOPE.md`, `SHA256SUMS`, `LICENSES.md`, `LICENSE_GEMMA.txt`, `LICENSE_GEMMA_CURRENT.md`, `NOTICE`, `MODIFICATIONS.md`
