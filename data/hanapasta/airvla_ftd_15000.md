# hanapasta/airvla_ftd_15000

## Resumen

AirVLA FT-D (step 15000) es un checkpoint de investigación publicado por el usuario hanapasta en HuggingFace. Se trata de un ajuste fino (fine-tune) de la política vision-language-action `lerobot/pi0`, adaptada a un cuadricóptero con un brazo de 2 grados de libertad y pinza paralela, y evaluada íntegramente en simulación con MuJoCo 3.3.4. El modelo forma parte de una campaña de disertación de máster denominada AirVLA, orientada a estudiar el transporte de políticas VLA preentrenadas al dominio de la manipulación aérea.

El objetivo concreto de este checkpoint, según su model card, era comprobar si escalar los datos de comandos emparejados (paired-command scaling) mejora el anclaje lingüístico (language grounding). El resultado reportado por el autor es negativo: el error de validación baja, pero aumentan los acercamientos a objetos equivocados, lo que indica que la mejora de la métrica de validación no se traduce en un mejor seguimiento de la instrucción.

El modelo tiene 4.028.019.472 parámetros (aproximadamente 4,03 mil millones) según los pesos en safetensors, ocupa 8,9 GB en el repositorio y se distribuye bajo licencia MIT. Su relevancia es fundamentalmente metodológica: documenta un caso de fine-tuning de VLA para robótica aérea con protocolo de evaluación congelado y resultados negativos explícitos, un tipo de evidencia poco frecuente en el ecosistema de modelos robóticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) derivada de `lerobot/pi0`; no se detalla la arquitectura interna en la model card |
| Parametros totales | 4.028.019.472 (segun pesos safetensors) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tamano del repositorio | 8,9 GB |
| Modelo base | `lerobot/pi0` |
| Inicializado desde | FT-C (checkpoint previo de la misma campana) |
| Datos de entrenamiento | `hanapasta/airvla_v22` (v2 + F1 + F2, escalado de comandos emparejados) |
| Pasos de entrenamiento | 15.000 |
| Seleccion de checkpoint | Menor MSE de validacion con ruido fijado sobre la escalera de checkpoints guardada |
| Entorno de evaluacion | MuJoCo 3.3.4 |
| Pipeline declarado | robotics |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo. Se sabe que es un fine-tune de `lerobot/pi0`, etiquetado con los tags `pi0` y `vision-language-action`, lo que sitúa al modelo en la familia de políticas VLA que combinan un codificador visual, un modelo de lenguaje y un cabezal de acciones. La robótica objetivo es un cuadricóptero con brazo de 2 grados de libertad y pinza paralela, es decir, un problema de manipulación aérea con espacio de acciones continuo. Cualquier detalle adicional sobre el backbone, el número de tokens de imagen o el mecanismo de generación de acciones no está disponible en la información proporcionada.

En cuanto al entrenamiento, el modelo se inicializó desde el checkpoint FT-C de la misma campaña y se entrenó durante 15.000 pasos sobre el conjunto `hanapasta/airvla_v22`, que combina la versión v2 con los subconjuntos F1 y F2 de escalado de comandos emparejados. La selección del checkpoint final se hizo por el menor error cuadrático medio (MSE) de validación bajo un protocolo de ruido fijado (pinned noise) a lo largo de la escalera de checkpoints guardada. No se especifica si hubo RLHF, DPO u otra fase de alineamiento, ni la composición exacta del dataset o el número de tokens de entrenamiento.

## Capacidades

- Generación de acciones motoras para un cuadricóptero con brazo de 2 grados de libertad y pinza paralela, a partir de observaciones visuales e instrucciones en lenguaje natural.
- Anclaje lingüístico (language grounding) sobre comandos emparejados: el modelo debe seleccionar el objeto correcto entre varios presentes en la escena.
- Navegación del vehículo aéreo hasta la posición de recogida, evaluada de forma separada en el protocolo congelado (20 episodios de navegación).
- Manipulación tipo pick: aproximación, agarre y colocación de objetos dentro de un simulador MuJoCo.
- Política multimodal: procesa entradas visuales junto con texto.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, audio, etc.): no disponible. El modelo no es un modelo de lenguaje de propósito general, sino una política de control.

## Casos de uso

- Investigación en manipulación aérea: el checkpoint sirve como punto de partida o referencia para experimentos de VLA sobre drones con brazo, ya que documenta una configuración completa (dron, 2-DoF, pinza paralela) y un protocolo de evaluación reproducible.
- Reproducción de resultados negativos: permite verificar la conclusión del autor de que escalar datos de comandos emparejados no mejora el anclaje lingüístico, ejecutando el arnés `eval_v2.py` con la misma semilla y el mismo simulador (MuJoCo 3.3.4).
- Estudio de la brecha validación-despliegue: el modelo es un caso concreto en el que un MSE de validación menor convive con más aproximaciones a objetos incorrectos, útil para investigar métricas de selección de checkpoints en políticas robóticas.
- Benchmark de referencia para VLA aéreos: sus cifras (1/60 agarres, 40/60 objetivo correcto, 10/20 navegaciones) pueden usarse como línea base frente a futuros fine-tunes de la misma familia.
- Análisis de errores de grounding: con 40/60 aciertos de objetivo correcto pero solo 1/60 agarres, el modelo es adecuado para estudiar la separación entre selección de objetivo, planificación de trayectoria y control de bajo nivel.
- Docencia y formación en robótica: el repositorio asociado incluye guía de reproducción y registro experimental completo, lo que lo hace utilizable en cursos o prácticas de VLA y aprendizaje por imitación.
- Simulación de escenarios de recogida aérea antes de trasladar el pipeline a hardware real, siempre que se mantenga la versión exacta del simulador.

## Benchmarks y rendimiento

Único protocolo reportado: protocolo congelado con n = 60 episodios de pick y 20 de navegación, sobre escenas emparejadas, en MuJoCo 3.3.4.

| Metrica | Resultado |
|---|---|
| Tasa de agarre | 1/60 |
| Objetivo correcto | 40/60 |
| Error mediano de posicion | 204,9 mm (110,7 mm para objetivos correctos) |
| Navegacion | 10/20 |

No se han publicado en la información disponible otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) ni comparaciones numéricas con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8,1 GB solo para los pesos en bf16 (4,03 mil millones de parámetros); en torno a 10-12 GB contando activaciones del codificador visual y del cabezal de acciones; unos 16,1 GB si se carga en fp32. Estimaciones orientativas, no publicadas por el autor.
- GPU recomendadas: no especificadas en la model card. Por tamaño, una GPU de 16-24 GB es suficiente para inferencia en bf16.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 4090 (24 GB), RTX 3090 (24 GB) y RTX 4080 (16 GB) con margen ajustado; en GPUs de 12 GB requeriría cuantización, no publicada.
- Opciones de despliegue: la model card solo documenta la evaluación mediante `eval_v2.py` del repositorio de código, sobre el stack de LeRobot y PyTorch. No se publican pesos GGUF ni recetas para vLLM, llama.cpp, Ollama o TGI, que además no son directamente aplicables a una política de control con cabezal de acciones.
- Latencia y throughput: no disponibles. En políticas tipo pi0 la frecuencia de control depende del número de pasos de denoising, dato no especificado aquí.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `hanapasta/airvla_ftd_15000` | 4.028.019.472 | no disponible | 1/60 agarres, 40/60 objetivo correcto, 10/20 navegacion | MIT | HuggingFace, 0 descargas |
| `lerobot/pi0` (modelo base) | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada | HuggingFace |
| FT-C (checkpoint previo de la misma campana) | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada | Referenciado como punto de partida |

No se dispone de datos comparativos con otras familias de VLA (OpenVLA, RDT, otros fine-tunes de pi0) en la información proporcionada.

## Limitaciones y advertencias

- Resultado explícitamente negativo: el propio autor indica que escalar datos de comandos emparejados no mejora el anclaje lingüístico y que aumentan las aproximaciones a objetos equivocados pese a un menor error de validación.
- Rendimiento muy bajo en la tarea principal: solo 1 de 60 intentos de agarre tuvo éxito, con un error mediano de posición de 204,9 mm.
- Dependencia estricta del simulador: la evaluación usa MuJoCo 3.3.4; otra versión cambia el comportamiento de contacto lo suficiente como para invalidar la comparación con los resultados archivados.
- Validación únicamente en simulación: no hay evidencia de transferencia a un dron físico ni de robustez ante condiciones reales (viento, iluminación, latencia).
- Riesgo de alucinación en el sentido de selección errónea de objeto: 20 de 60 episodios apuntaron a un objetivo incorrecto.
- Idiomas soportados no declarados: no se puede asumir cobertura multilingüe de las instrucciones.
- Sin datos de sesgos: no se ha publicado ningún análisis de sesgo demográfico, visual o de dominio.
- Licencia MIT: permite uso comercial y modificación, pero el modelo es un artefacto de investigación sin garantías de seguridad para operar un dron real; el autor no ofrece soporte ni mantenimiento.
- Trazabilidad limitada: 0 descargas y 0 likes en el momento de la consulta, sin historial de validación por terceros.
- Herramientas de cuantización y despliegue estándar (GGUF, vLLM, Ollama) no están documentadas para este checkpoint.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hanapasta/airvla_ftd_15000
- Modelo base: https://huggingface.co/lerobot/pi0
- Dataset de entrenamiento: https://huggingface.co/datasets/hanapasta/airvla_v22
- Codigo, guia de reproduccion y registro experimental: https://github.com/robotics-hana/drone-version2
- Resultados de la busqueda web: no se encontro ningun enlace relevante sobre el modelo; los resultados devueltos correspondian a listados de hoteles en Valonia y no guardan relacion con la ficha.
