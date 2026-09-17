# mim-chess-vlas/train_600_dense__no_mask__pi05__seed_0

## Resumen

`mim-chess-vlas/train_600_dense__no_mask__pi05__seed_0` es un ajuste fino del modelo Vision-Language-Action π₀.₅ (Pi05) de Physical Intelligence, publicado por el usuario `mim-chess-vlas` dentro del ecosistema LeRobot de Hugging Face. No es un modelo de lenguaje: es una política robótica que consume observaciones multimodales (estado proprioceptivo de 9 dimensiones y tres cámaras RGB de 224x224) y produce directamente un vector de acción de 7 dimensiones, correspondiente a un brazo robótico tipo `Panda` con pinza.

El modelo parte de `lerobot/pi05_base` y se ha entrenado sobre un único conjunto de datos de imitación de 600 episodios y 162.625 fotogramas a 20 FPS, centrado en tareas de recogida y colocación (*pick and place*) de 40 objetos domésticos distintos en una caja. Cuenta con 4.143.404.816 parámetros (aproximadamente 4,14 mil millones) en formato safetensors, con un repositorio de 74,8 GB, y se distribuye bajo licencia Apache 2.0.

Su relevancia es acotada y muy específica: se trata de una reproducción de un *baseline* de investigación (semilla 0, 60.000 pasos, lote 16) reproducida con LeRobot 0.6.0, útil para estudiar la transferencia de un VLA preentrenado a una tarea concreta de manipulación, no como componente de propósito general. El modelo tiene 0 descargas y 0 *likes* en el momento de redactar esta ficha, por lo que no existe validación externa de su comportamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) π₀.₅ (Pi05); implementación LeRobot adaptada del repositorio OpenPI. El *backbone* concreto no se detalla en la información disponible |
| Parametros totales | 4.143.404.816 (≈4,14 mil millones) |
| Parametros activos | No aplica: no es un modelo de mezcla de expertos (MoE) |
| Longitud de contexto | No disponible (no es un modelo de contexto textual; la entrada es una ventana de observación estado + 3 imágenes) |
| Tipos de cuantizacion | No disponible. No se documentan versiones cuantizadas (GGUF, AWQ, GPTQ ni similares) |
| Idiomas soportados | No disponible. Las instrucciones de tarea del conjunto de entrenamiento están redactadas únicamente en inglés |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (según los *tags* del repositorio); tamaño total del repositorio: 74,8 GB |

Especificaciones de entrada y salida:

| Elemento | Tipo | Forma |
|---|---|---|
| `observation.state` | STATE | `(9,)` |
| `observation.images.agentview` | VISUAL | `(3, 224, 224)` |
| `observation.images.robot0_eye_in_hand` | VISUAL | `(3, 224, 224)` |
| `observation.images.robot0_eye_in_hand_2` | VISUAL | `(3, 224, 224)` |
| `action` | ACTION | `(7,)` |

## Arquitectura y entrenamiento

La arquitectura es un modelo Vision-Language-Action de la familia π₀.₅ de Physical Intelligence, cuya implementación en LeRobot deriva del repositorio OpenPI de los mismos autores. La model card describe el objetivo de π₀.₅ como la generalización a entornos y situaciones completamente nuevos respecto a π₀, mediante el uso de un componente de visión-lenguaje preentrenado que condiciona la generación de acciones. La información proporcionada no especifica el número de capas, el *backbone* lingüístico-visual empleado, ni el mecanismo exacto de decodificación de acciones (flow matching u otro); estos datos figuran en "no disponible".

El ajuste fino se realizó sobre `mim-chess-vlas/train_600_dense__no_mask`: 600 episodios, 162.625 fotogramas a 20 FPS, con 40 tareas de tipo "Pick the <objeto> and place it into the box" que cubren objetos como mermelada, cereal, pera, huevo, cuchillo, hervidor, manzana o cesta. La configuración de entrenamiento reportada es: 60.000 pasos, tamaño de lote 16, optimizador AdamW, tasa de aprendizaje 5e-05, semilla 0 y LeRobot 0.6.0. No se menciona en la información disponible ningún uso de RLHF, DPO, aprendizaje por refuerzo ni decodificación especulativa.

El robot de destino es un `Panda`, con tres cámaras (`agentview`, `robot0_eye_in_hand`, `robot0_eye_in_hand_2`). El sufijo `no_mask` del nombre del conjunto de datos sugiere la ausencia de enmascaramiento en el entrenamiento, aunque la model card no explica la semántica exacta de esa variante.

## Capacidades

- Control robótico de manipulación: genera comandos de acción de 7 grados de libertad a partir de observaciones visuales y de estado.
- Ejecución de tareas de recogida y colocación: cubre las 40 instrucciones de tipo *pick and place* presentes en el conjunto de entrenamiento.
- Condicionamiento por lenguaje: acepta una instrucción textual de tarea (por ejemplo, `--task="Pick the jam and place it into the box"`), formulada en inglés.
- Fusión de múltiples vistas: integra una vista externa (`agentview`) y dos vistas de muñeca (`robot0_eye_in_hand`, `robot0_eye_in_hand_2`).
- Política de imitación entrenada de extremo a extremo bajo el paradigma VLA, sin necesidad de definición manual de *reward*.
- Soporte de *tool calling* / *function calling*: no disponible; no es una capacidad de este tipo de modelo.
- Soporte de agentes y razonamiento multi-paso: no disponible como tal; la política opera en bucle cerrado a nivel de control motor.
- Capacidades multilingües: no disponibles; únicamente se documentan instrucciones en inglés.
- Capacidades especiales (modo *thinking*, audio, vídeo): no disponibles. No se documenta ninguna.

## Casos de uso

- Recogida y colocación de objetos domésticos en un `Panda`: el caso de uso directo del modelo. Se lanzaría con `lerobot-rollout` indicando el puerto del robot, las tres cámaras y una de las 40 tareas entrenadas; el modelo genera acciones a partir de la imagen y el estado a cada paso de control.
- Banco de pruebas de imitación en investigación: sirve como referencia reproducible (semilla 0, 60.000 pasos, lote 16, AdamW, lr 5e-05) para comparar variantes de datos (por ejemplo, `no_mask` frente a otras configuraciones) manteniendo fijo el resto del *pipeline*.
- Estudio de la transferencia desde `lerobot/pi05_base`: permite medir cuánto del comportamiento del VLA preentrenado se conserva tras un ajuste fino sobre 600 episodios de un único dominio, útil para analizar olvido catastrófico.
- Automatización de laboratorio con objetos manipulables: las 40 categorías incluyen envases, utensilios y alimentos (tarros, botellas, especieros, hervidores), lo que lo hace aplicable a *benchmarks* de manipulación tipo *pick-and-place* en entornos controlados.
- Generación de datos sintéticos de política: al ser ejecutable, puede usarse para producir trayectorias adicionales que alimenten entrenamientos posteriores o análisis de robustez frente a cambios de iluminación y posición.
- Validación de *pipelines* de despliegue en LeRobot: sirve para probar la integración completa de `lerobot-rollout`, calibración de cámaras y coincidencia de nombres de observaciones antes de invertir en modelos mayores.
- Docencia en robótica e imitación: el flujo de trabajo completo (instalación de LeRobot, grabación de datos, entrenamiento y despliegue) está documentado en las guías enlazadas por el autor, lo que facilita usarlo como ejemplo práctico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, valores de retorno promedio, ni comparaciones cuantitativas sobre el conjunto de datos de entrenamiento o sobre conjuntos de evaluación independientes. Tampoco se proporcionan métricas de latencia o de frecuencia de inferencia alcanzada en hardware concreto.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir de los 4.143.404.816 parámetros; no confirmada por el autor):
  - Precisión completa fp32: aproximadamente 16,6 GB solo para pesos, más activaciones.
  - bf16/fp16: aproximadamente 8,3 GB para pesos.
  - int8: aproximadamente 4,1 GB para pesos (requiere cuantización propia; no hay versiones publicadas).
  - int4: aproximadamente 2,1 GB para pesos (no documentado ni validado).
- A las cifras anteriores hay que sumar el coste de las tres imágenes de 224x224 y del codificador visual, además del búfer de observaciones; el autor no publica cifras de memoria total en ejecución.
- GPU recomendadas: no especificadas por el autor. Por tamaño de modelo, tarjetas de 16-24 GB (RTX 4090, L40S, A100 40 GB) serían suficientes en bf16, mientras que A100 80 GB o H100 aportarían margen para lotes mayores o mayor frecuencia de control.
- Compatibilidad con GPU de consumo: probable en bf16 en tarjetas de 16 GB o más; no confirmada por el autor ni verificada por terceros.
- Opciones de despliegue: la vía documentada es el ecosistema LeRobot (`lerobot-rollout` con `--strategy.type=base` y `--policy.path=...`), más PyTorch. vLLM, llama.cpp, Ollama o TGI no son aplicables a este tipo de modelo (no es un modelo de lenguaje autoregresivo de texto) y no se documenta soporte alguno.
- Latencia y throughput: no disponibles. El conjunto de datos se grabó a 20 FPS, pero la información proporcionada no indica la frecuencia de inferencia alcanzable ni la latencia por paso.
- Almacenamiento: el repositorio ocupa 74,8 GB, muy por encima de lo que sugeriría el tamaño de los pesos en bf16, lo que apunta a que incluye *checkpoints* u otros artefactos adicionales.
- El despliegue real requiere además un `Panda` físico, tres cámaras configuradas con nombres coincidentes y calibración previa, según la guía de hardware de LeRobot.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Robot / tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mim-chess-vlas/train_600_dense__no_mask__pi05__seed_0` | 4.143.404.816 | VLA π₀.₅ ajustado | `Panda`; 40 tareas de *pick and place* | apache-2.0 | Repositorio público; 0 descargas, 0 *likes* |
| `lerobot/pi05_base` | No disponible | VLA π₀.₅ preentrenado | Genérico, generalización de mundo abierto | No disponible en la información proporcionada | Modelo base publicado por LeRobot |
| `lerobot/pi0_base` | No disponible | VLA π₀ preentrenado | Genérico | No disponible en la información proporcionada | Modelo predecesor, mencionado como punto de partida de π₀.₅ |
| Otras variantes del propio autor (`train_600_dense__no_mask__pi05__seed_*`, si existen) | No disponible | VLA π₀.₅ ajustado | `Panda`; mismas tareas | apache-2.0 presumiblemente | No confirmado en la información disponible |

No se dispone de datos de rendimiento comparado entre estas alternativas, por lo que la comparación se limita a parámetros, tipo de modelo, licencia y disponibilidad. Cualquier afirmación sobre superioridad o inferioridad respecto a π₀.₅ base, π₀ o terceros (SmolVLA, GR00T N1, etc.) carecería de respaldo en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: el conjunto de entrenamiento contiene 40 objetos concretos de cocina y menaje doméstico; cualquier objeto fuera de esa lista queda fuera de la distribución de entrenamiento.
- Sobreajuste probable: 60.000 pasos con lote 16 sobre solo 600 episodios de un único robot, una única configuración de cámaras y un único entorno. No se publican métricas de generalización.
- Riesgo de alucinación: en sentido estricto no aplica (no genera texto), pero sí existe el equivalente conductual: el modelo puede producir trayectorias plausibles pero incorrectas cuando la escena difiere de lo visto durante el entrenamiento, sin señal de incertidumbre.
- Dependencia del idioma: las instrucciones de tarea del conjunto de datos están en inglés; no hay evidencia de que el modelo responda correctamente a instrucciones en castellano u otros idiomas.
- Dependencia del hardware: requiere un `Panda` y tres cámaras con nombres coincidentes (`agentview`, `robot0_eye_in_hand`, `robot0_eye_in_hand_2`). Cambiar el número, la posición o los nombres de las cámaras invalida la política.
- Dimensión de estado y acción fijas: entrada de estado de 9 dimensiones y salida de acción de 7 dimensiones; no es trasladable sin readaptación a robots con otra cinemática o número de articulaciones.
- Restricciones de licencia: el modelo se publica bajo apache-2.0, pero conviene verificar la licencia efectiva del modelo base `lerobot/pi05_base` y las condiciones de uso del código de OpenPI antes de un despliegue comercial.
- Falta de validación externa: 0 descargas y 0 *likes* implican que no hay informes independientes de reproducibilidad ni de seguridad en operación.
- Sin cuantizaciones publicadas: desplegar en GPUs pequeñas exigiría cuantizar por cuenta propia, con riesgo de degradar la precisión de las acciones.
- Seguridad física: es una política de control motriz; un fallo en inferencia puede provocar movimientos no deseados del brazo. En producción serían imprescindibles límites de par, paradas de emergencia y supervisión.
- Descarga considerable: 74,8 GB de repositorio para un modelo de 4,14 mil millones de parámetros, lo que encarece el almacenamiento y la distribución.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mim-chess-vlas/train_600_dense__no_mask__pi05__seed_0
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Conjunto de datos de entrenamiento: https://huggingface.co/datasets/mim-chess-vlas/train_600_dense__no_mask
- Visualizador del conjunto de datos: https://huggingface.co/spaces/lerobot/visualize_dataset?path=mim-chess-vlas/train_600_dense__no_mask
- Blog de π₀.₅ en Physical Intelligence: https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI: no se proporciona URL directa en la información disponible (se menciona como origen de la implementación)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de π₀.₅ en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación completa de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet

Nota sobre la búsqueda web: los resultados devueltos (radiologie-mim.fr, mimsclothes.fr, mim.gov.it, mim.univ-lorraine.fr) no guardan relación con este modelo ni con robótica, por lo que no se han incorporado como fuentes.
