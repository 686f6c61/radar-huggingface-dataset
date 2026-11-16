# Kai9987kai/supermix-v99-cognitive-fabric

## Resumen

Supermix v99 Cognitive Fabric es un paquete de modelos y herramientas publicado por el usuario Kai9987kai en Hugging Face, construido sobre el modelo base Kai9987kai/supermix-v93. Se distribuye como un bundle que incluye tres checkpoints de una arquitectura MoE de tipo transformer con conexiones inspiradas en el conectoma del sistema nervioso central de la mosca de la fruta (Drosophila melanogaster), junto con una capa de orquestación denominada "Cognitive Fabric" que combina verificación simbólica determinista con la salida neuronal del modelo.

El modelo promovido por defecto (v96_physio_neurogenesis) tiene 36,6 millones de parámetros totales, de los cuales 9,13 millones son activos por token, y emplea un vocabulario de 9.415 tokens. Los checkpoints v98 y v99 son continuaciones experimentales que añaden modulación de error predictivo (Rao-Ballard), trazas hebbianas de corto plazo y parada por entropía de ciclo. El paquete se orienta a razonamiento neuro-simbólico, verificación formal, física y razonamiento sobre código.

La relevancia de este lanzamiento es acotada: se trata de un proyecto de investigación personal de escala muy reducida (36,6 M de parámetros), sin benchmarks estándar publicados (MMLU, HumanEval, GSM8K) y con métricas internas sobre tareas propietarias. Su interés reside en la propuesta arquitectónica híbrida (conectoma bilateral, neurogénesis transaccional, verificación determinista) más que en su rendimiento como modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con conectoma bilateral de CNS de Drosophila, compartimentos dual-soma fisiológicos, gating comisural, homeostasis glial y proyección de radio espectral |
| Parametros totales | 36.599.047 (36,6 M) |
| Parametros activos | 9.132.151 (9,13 M) por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en formato PyTorch .pt) |
| Idiomas soportados | no disponible (vocabulario de 9.415 tokens, idioma no especificado) |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pt): v96_physio_neurogenesis.selected.pt, v98_scf_predictive.selected.pt, v99_scf_evolution.selected.pt |

## Arquitectura y entrenamiento

La arquitectura combina un transformer con mezcla de expertos (MoE) y un diseño inspirado en el conectoma del CNS masculino de Drosophila, con compartimentos dual-soma fisiológicos, gating comisural entre hemisferios, homeostasis glial y una proyección de radio espectral (r=0,90) para control de estabilidad. El checkpoint promovido incorpora neurogénesis transaccional validada por testigos (witness-validated), con resultados de 72/82 (0,878) en seed=83 y 35/41 (0,854) en seed=82 sobre tareas de evaluación internas. Los checkpoints v98 y v99 añaden, de forma experimental y desactivada por defecto, modulación de error predictivo Rao-Ballard, trazas hebbianas de corto plazo y parada por entropía de ciclo ("thinking_entropy_halt").

El entrenamiento se realizó sobre una mezcla de 7.540 filas correspondiente a 41 tareas más datos de chat (según la model card), con pérdidas de desarrollo de 0,086137 (v96), 0,057175 (v98) y 0,026452 (v99). No se especifican el número total de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. La capa "Cognitive Fabric" (SCF) es una orquestación con feature flag (SCF_ENABLED=False por defecto) sobre seis familias históricas del proyecto (ChampionNet, CognitiveLeap, QwenLoRA, OmniCollective, MiMoMix, NexusMind), con un micro-intérprete de AST de Python acotado a 500 operaciones sin eval/exec, solvers de forma cerrada con racionales exactos y verificación offline del atlas del CNS masculino.

## Capacidades

- Generación de texto autoregresiva con decodificación especulativa MTP (multi-token prediction) en el servidor de chat incluido.
- Razonamiento sobre código mediante un micro-intérprete de AST de Python acotado (500 operaciones, sin eval/exec) y verificación determinista de expresiones.
- Razonamiento matemático con solvers de forma cerrada y aritmética racional exacta.
- Verificación formal y "witness-validated" de resultados, con autoridad de respuesta condicionada (answer_authority=False para salidas neuronales no verificadas).
- Tareas de física (physics) y razonamiento neuro-simbólico, según los tags del repositorio.
- Modo experimental de razonamiento iterativo con parada por entropía de ciclo (thinking_entropy_halt), activado solo en v98/v99 y desactivado por defecto.
- Telemetría en vivo de norma de error predictivo, ganancia hebbiana y radio espectral a través del servidor de chat.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles.
- Capacidades multilingües: no disponibles; el vocabulario es de 9.415 tokens y no se especifican idiomas.

## Casos de uso

- Verificación de expresiones y programas cortos en Python: la capa SCF incluye un micro-intérprete de AST acotado a 500 operaciones que permite validar resultados de expresiones sin ejecución arbitraria, útil en entornos donde no se quiere usar eval/exec.
- Razonamiento matemático determinista: los solvers de forma cerrada con aritmética racional exacta permiten resolver problemas aritméticos y algebraicos acotados con resultado verificable, adecuado para pipelines de evaluación de razonamiento.
- Investigación en arquitecturas neuro-simbólicas: el paquete permite reproducir los experimentos de conectoma bilateral, neurogénesis transaccional y modulación predictiva sobre un host CPU, sirviendo como banco de pruebas académico.
- Prototipado de asistentes conversacionales locales: el servidor de chat SSE incluido (supermix_chat_server.py) permite desplegar una interfaz web con streaming y telemetría en una máquina sin GPU, útil para demos internas.
- Evaluación de decodificación especulativa: la implementación MTP del servidor de chat permite medir empíricamente la aceleración de decodificación en CPU sobre un vocabulario pequeño.
- Experimentación educativa con MoE de escala reducida: con 36,6 M de parámetros totales y 9,13 M activos, el modelo cabe en memoria de CPU y permite estudiar enrutamiento de expertos y dinámicas de gating sin infraestructura GPU.
- Verificación de atlas biológicos offline: el paquete incluye el atlas del CNS masculino de Drosophila (malecns_sided_types.npz) y rutinas de verificación, útil para proyectos de neuroinformática que necesiten comprobar correspondencias de tipos celulares.

## Benchmarks y rendimiento

Los únicos datos publicados son métricas internas sobre tareas propietarias del proyecto, medidas en un host solo CPU (Windows 11, PyTorch 2.11.0+cpu, cuda_available=False, vocabulario de 9.415 tokens, max_new_tokens=96). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

| Checkpoint | Estado | Dev loss | seed=82 (41 tareas) | seed=83 (82 tareas) | SCF híbrido neural (seed=82) |
|---|---|---:|---:|---:|---:|
| v96_physio_neurogenesis.selected.pt | Promovido por defecto | 0,086137 | 35/41 (0,854) | 72/82 (0,878) | 41/41 (1,0000) |
| v98_scf_predictive.selected.pt | Experimental | 0,057175 | 35/41 (0,854) | 70/82 (0,854) | 41/41 (1,0000) |
| v99_scf_evolution.selected.pt | Experimental (último) | 0,026452 | 33/41 (0,805) | 67/82 (0,817) | 41/41 (1,0000) |

Precisión verificada determinista del SCFVerificationGate (python -m scf bench): 41/41 (1,0000) en seed=82, seed=83 y seed=91. La model card indica que el resultado 41/41 en seed=82 se obtuvo tras corregir code.neg_index y permutations y añadir el trazador AST acotado y las puertas racionales de forma cerrada, partiendo de 40/41 en el híbrido previo.

## Requisitos de hardware

- VRAM estimada: el checkpoint promovido ocupa aproximadamente 0,5 GB en disco en formato PyTorch .pt; con 36,6 M de parámetros, la inferencia en fp32 requiere del orden de 150 MB de memoria para los pesos, más activaciones y estado del servidor.
- GPU recomendadas: no se especifican; el release fue probado exclusivamente en CPU (cuda_available=False). Cualquier GPU con más de 1 GB de memoria sería suficiente para los pesos, pero las rutas CUDA no fueron ejercitadas en el host de publicación.
- Cabe en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) e incluso en CPU sin GPU dedicada.
- Opciones de despliegue: el paquete incluye un servidor de chat propio (source/supermix_chat_server.py) con streaming SSE y decodificación especulativa MTP; la CLI SCF se ejecuta con PYTHONPATH=source python -m scf. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y el formato .pt no es directamente compatible con esos motores sin conversión.
- Latencia y throughput: no disponibles. Las mediciones publicadas se realizaron en CPU con max_new_tokens=96, sin cifras de tokens por segundo.

## Comparativa con modelos similares

No se dispone de modelos comparables directos en la información proporcionada: se trata de un proyecto de investigación personal de 36,6 M de parámetros con arquitectura propietaria y benchmarks internos, sin equivalencia publicada con modelos estándar de la misma escala (por ejemplo, variantes pequeñas de la familia Qwen, Llama o SmolLM). Los propios checkpoints del repositorio (v96, v98, v99) son la única comparación disponible, resumida a continuación.

| Modelo | Parámetros totales / activos | Contexto | Licencia | Estado |
|---|---|---|---|---|
| supermix v96 (promovido) | 36,6 M / 9,13 M | no disponible | MIT | Promovido por defecto |
| supermix v98 | 36,6 M / 9,13 M | no disponible | MIT | Experimental |
| supermix v99 | 36,6 M / 9,13 M | no disponible | MIT | Experimental (último) |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Escala muy reducida: 36,6 M de parámetros totales y 9,13 M activos, con un vocabulario de 9.415 tokens; no es adecuado como modelo de propósito general ni para tareas abiertas de conocimiento.
- Sin benchmarks estándar publicados: no hay resultados de MMLU, HumanEval, GSM8K ni evaluaciones independientes; las métricas son internas y sobre tareas del propio proyecto.
- Los checkpoints v98 y v99 están etiquetados explícitamente como experimentales y no superan al v96 en la evaluación neural standalone (33/41 y 67/82 frente a 35/41 y 72/82), por lo que no se recomienda su uso en producción.
- Las salidas neuronales no verificadas tienen answer_authority=False; solo las comprobaciones deterministas de matemáticas, física, código y atlas tienen autoridad, lo que limita el uso del modelo como generador autónomo.
- Sesgos conocidos: no disponibles; no se documenta ninguna evaluación de sesgo, toxicidad o alineación.
- Riesgo de alucinación: alto en cualquier uso generativo abierto, dado el tamaño y la ausencia de RLHF/DPO documentado.
- Limitaciones de idioma: no se especifican idiomas soportados; el vocabulario pequeño sugiere cobertura limitada y no verificada.
- Restricciones de licencia: licencia MIT, que permite uso comercial, pero el software subyacente y los datos del atlas del CNS pueden tener sus propias condiciones no detalladas en la información disponible.
- Rutas CUDA no ejercitadas en el host de publicación: el soporte GPU depende de las protecciones de dispositivo upstream y no fue probado directamente.
- El servidor de chat y la CLI SCF requieren ejecutar código Python del repositorio (incluido un micro-intérprete de AST); conviene auditar el código antes de desplegarlo en entornos sensibles, aunque el intérprete está acotado y evita eval/exec.
- Fecha de creación del repositorio: 2026-11-16, con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de adopción ni mantenimiento por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kai9987kai/supermix-v99-cognitive-fabric
- Modelo base: https://huggingface.co/Kai9987kai/supermix-v93
- Repositorio GitHub del proyecto (rama scf-v91-cognitive-fabric): https://github.com/kai9987kai/Supermix/tree/scf-v91-cognitive-fabric
- Commit referenciado: f7af7d0b8062e541f890d4760c7e78ca88af80a3
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
