# jeff-rp/so101_pickplace_plug_policy

## Resumen

`so101_pickplace_plug_policy` es una política de imitación robótica entrenada con el método Action Chunking with Transformers (ACT) sobre el brazo SO-101 (tipo `so_follower`). La publica el usuario jeff-rp en Hugging Face a través de LeRobot, la librería de aprendizaje automático para robótica del mundo real de Hugging Face. No es un modelo de lenguaje: es un controlador visomotor que recibe el estado de las articulaciones y dos cámaras RGB y emite comandos de actuación de 6 dimensiones.

El modelo resuelve una única tarea concreta, "Pick and place the plug" (coger y colocar un enchufe), aprendida por imitación a partir de 50 episodios teleoperados (31.097 fotogramas a 30 FPS) del dataset `jeff-rp/so101_pickplace_plug`. Entrena 100.000 pasos con AdamW, batch de 16 y tasa de aprendizaje de 1e-5 sobre LeRobot 0.6.2. Con 51.668.614 parámetros y un repositorio de 0,2 GB, es lo bastante compacto para ejecutarse en hardware de consumo.

Su relevancia es doble: sirve como ejemplo reproducible del flujo completo de LeRobot (grabar datos, entrenar, desplegar con `lerobot-rollout`) y como referencia práctica de ACT, un método que predice trozos de acciones en lugar de pasos individuales y que ha mostrado tasas de éxito altas en manipulación con hardware de bajo coste. Es un modelo de nicho (0 descargas y 0 "likes" en el momento de la consulta) y no incluye resultados de evaluación publicados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): codificador visual CNN + transformer encoder-decoder con espacio latente, según el método del paper arXiv:2304.13705 |
| Parametros totales | 51.668.614 (≈51,7 M) |
| Longitud de contexto | no aplica (política de imitación; no procesa texto; el horizonte de acciones no se especifica en la model card) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos en safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de robótica, sin entrada ni salida de texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

Especificaciones adicionales declaradas por el autor:

| Parametro | Valor |
|---|---|
| Tipo de robot | `so_follower` (SO-101) |
| Camaras | `front`, `side` |
| Entrada `observation.state` | STATE, forma `(6,)` |
| Entrada `observation.images.front` | VISUAL, forma `(3, 480, 640)` |
| Entrada `observation.images.side` | VISUAL, forma `(3, 480, 640)` |
| Salida `action` | ACTION, forma `(6,)` |
| Dataset de entrenamiento | `jeff-rp/so101_pickplace_plug` (50 episodios, 31.097 fotogramas, 30 FPS) |
| Pasos de entrenamiento | 100.000 |
| Batch size | 16 |
| Optimizador | AdamW |
| Learning rate | 1e-05 |
| Semilla | 1000 |
| Versión de LeRobot | 0.6.2 |
| Tamaño del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación descrito en el paper arXiv:2304.13705. En lugar de predecir una acción por paso de control, el modelo predice un "trozo" (chunk) de varias acciones futuras a partir de la observación actual; esto reduce el error compuesto de la política y mejora la estabilidad de la ejecución, algo crítico en manipulación fina. La formulación habitual del método combina un codificador visual convolucional que procesa las imágenes de cámara con un transformer encoder-decoder que, condicionado por el estado de las articulaciones y una variable latente, genera la secuencia de acciones. La model card no detalla la configuración exacta de capas, dimensiones ni tamaño del chunk para esta política concreta, por lo que esos valores no están disponibles.

El entrenamiento es puramente conductual clonado (imitation learning), sin RLHF ni DPO, que no aplican a este dominio. Se usaron 50 episodios teleoperados con una única instrucción, "Pick and place the plug", y una configuración de 100.000 pasos, batch 16, AdamW con lr 1e-5 y semilla 1000, sobre LeRobot 0.6.2. El dataset tiene 31.097 fotogramas a 30 FPS, lo que equivale a un volumen reducido de datos; esto implica que el modelo está ajustado al entorno, la iluminación y la disposición de objetos del set de grabación. No se documentan técnicas adicionales como decodificación especulativa ni atención lineal, que no corresponden a este tipo de política.

## Capacidades

- Control visomotor de manipulación: genera comandos de acción de 6 dimensiones a partir de un estado de 6 dimensiones y dos imágenes RGB.
- Percepción multimodal: consume dos flujos de cámara (`front` y `side`) a 640x480, además de la retroalimentación de las articulaciones.
- Action chunking: predice secuencias cortas de acciones en lugar de pasos sueltos, lo que reduce el error acumulado y suaviza la trayectoria.
- Ejecución autónoma de la tarea "Pick and place the plug" (coger y colocar un enchufe) de principio a fin, con la política corriendo en bucle a 30 FPS.
- Integración nativa con el ecosistema LeRobot: se despliega con `lerobot-rollout` y se reentrena con `lerobot-train`.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multietapa.
- Sin capacidades multilingües, de generación de texto, de código ni de matemáticas.
- Sin modo "thinking", visión general, audio ni cualquier otra capacidad propia de un modelo fundacional multimodal.

## Casos de uso

- Automatización de pick-and-place de conectores: el modelo coge un enchufe y lo inserta o lo deja en la posición objetivo con dos cámaras como única señal visual, lo que lo hace adecuado para tareas de manipulación repetitivas en bancos de montaje o pruebas de conectores donde la posición de las piezas es consistente.
- Base para fine-tuning en tareas de manipulación similares: al ser una política ACT de 51,7 M de parámetros con licencia Apache-2.0, se puede reentrenar con `lerobot-train` sobre un dataset propio para tareas de recogida y colocación con el mismo robot SO-101, partiendo de pesos ya ajustados al dominio.
- Docencia e investigación en robótica de bajo coste: el SO-101 es una plataforma económica; esta política permite reproducir un experimento completo de aprendizaje por imitación (teleoperar, grabar, entrenar, desplegar) en un laboratorio o aula sin GPUs de gran tamaño.
- Validación del stack LeRobot en producción: sirve como caso de prueba de extremo a extremo para verificar la instalación, la calibración, el mapeo de cámaras y el pipeline de inferencia antes de invertir en datasets mayores.
- Recogida de datos asistida por política: usar el modelo como política inicial para que el operador solo corrija trayectorias (DAgger o intervención humana) acelera la generación de nuevos episodios sobre la misma tarea.
- Pruebas de robustez y regresión: al fijar la semilla 1000 y una configuración de entrenamiento concreta, el modelo sirve como referencia para medir cómo cambian la tasa de éxito y la estabilidad ante variaciones de iluminación, posición inicial del objeto o presencia de distractores.
- Demostración de pipelines de CI para robótica: integrar `lerobot-rollout` en un banco de pruebas automatizado permite ejecutar la política durante un tiempo fijo (`--duration=60`) y recoger métricas de éxito de forma repetible tras cada cambio de hardware o software.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una sección de evaluación vacía con la advertencia explícita de que no se han proporcionado resultados para esta política, por lo que no existe tabla de tareas, número de ensayos ni tasa de éxito.

## Requisitos de hardware

- Huella de pesos: 51,7 M de parámetros. En FP32 ocupa aproximadamente 207 MB y en FP16 unos 103 MB, sin contar buffers de activaciones.
- VRAM estimada para inferencia: del orden de 2 a 4 GB teniendo en cuenta los pesos, los dos flujos de cámara a 640x480 y los búferes intermedios del codificador visual. Es una estimación, no un dato publicado por el autor.
- Cabe en GPU de consumo: sí, en cualquier GPU con 4 GB o más de VRAM (por ejemplo, RTX 3050, RTX 3060, RTX 4060, RTX 4090). También puede ejecutarse en CPU, aunque con mayor latencia.
- GPU recomendadas: para tiempo real basta una GPU de gama media; A100 o H100 están sobredimensionadas para este modelo. El cuello de botella habitual es la captura de cámara y la comunicación con el robot, no el cómputo.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia y `lerobot-train` para entrenamiento). No aplican servidores de inferencia de LLM como vLLM, TGI o llama.cpp, porque no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles. La model card no publica cifras de latencia por paso de control ni de frecuencia efectiva de inferencia alcanzada.

## Comparativa con modelos similares

No se dispone de datos verificados de benchmarks en la información proporcionada, por lo que la comparación es estructural y orientativa. Los valores de los modelos alternativos proceden de sus respectivas documentaciones públicas y deben verificarse antes de tomar decisiones.

| Modelo | Paradigma | Parametros | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `jeff-rp/so101_pickplace_plug_policy` | ACT (imitation learning, action chunking) | 51,7 M | Acciones para SO-101 (`so_follower`) | Apache-2.0 | Hugging Face, librería LeRobot |
| Diffusion Policy | Política generativa por difusión | no disponible | Secuencias de acciones | MIT en la implementación de LeRobot (verificar) | LeRobot y repositorios de referencia |
| SmolVLA | Vision-Language-Action | ≈450 M (según su model card pública) | Acciones condicionadas por lenguaje | Apache-2.0 | Hugging Face, LeRobot |
| pi0 | VLM + experto de acciones (flow matching) | ≈3 B (según su documentación pública) | Acciones condicionadas por lenguaje | Apache-2.0 | Publicado por Physical Intelligence |

Diferencias clave: este modelo es una política de tarea única y robot específico, sin entrada de lenguaje y con un coste de inferencia muy inferior al de los VLA. SmolVLA y pi0 aceptan instrucciones en lenguaje natural y generalizan a múltiples tareas, a cambio de un tamaño y unos requisitos de hardware mucho mayores.

## Limitaciones y advertencias

- Sin resultados de evaluación: la model card no reporta ninguna tasa de éxito, número de ensayos ni condiciones de prueba, por lo que el rendimiento real en el robot es desconocido.
- Especialización extrema: la política está entrenada para una única tarea, "Pick and place the plug", y un único tipo de robot (`so_follower`). No generaliza a otras tareas ni a otras morfologías sin reentrenamiento.
- Dependencia estricta de la configuración de sensores: los nombres de cámara (`front`, `side`), sus resoluciones (480x640) y el orden de las 6 dimensiones del estado deben coincidir exactamente con los del entrenamiento; cualquier cambio invalida las predicciones.
- Dataset reducido: 50 episodios y 31.097 fotogramas implican riesgo de sobreajuste a las posiciones, la iluminación y la apariencia de los objetos del entorno de grabación. Es esperable una caída de éxito ante cambios de iluminación, fondo, distractores o posiciones iniciales distintas.
- Sensibilidad a la calibración: un robot del mismo modelo pero con calibración distinta puede degradar el comportamiento, un caveat habitual en políticas de imitación.
- Sin capacidades de lenguaje: no acepta instrucciones en texto, no soporta tool calling ni razonamiento multietapa, y no debe describirse como un agente.
- Sesgos: no aplica el concepto habitual de sesgo de lenguaje; en su lugar, el modelo hereda los sesgos de las demostraciones teleoperadas (estilo de agarre, trayectorias, velocidad del operador).
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de acciones físicas incorrectas o inseguras fuera de la distribución de entrenamiento.
- Licencia: Apache-2.0 permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de licencia y se cite el método. No se declaran restricciones adicionales.
- Seguridad física: al controlar un brazo robótico real, es responsabilidad del operador implantar límites de par, paradas de emergencia y zonas de seguridad. La licencia no cubre daños derivados del uso.
- Validación comunitaria nula: 0 descargas y 0 "likes" en el momento de la consulta, sin discusiones ni informes de terceros que confirmen su funcionamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jeff-rp/so101_pickplace_plug_policy
- Dataset de entrenamiento: https://huggingface.co/datasets/jeff-rp/so101_pickplace_plug
- Paper de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación completa de LeRobot: https://huggingface.co/docs/lerobot/index
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=jeff-rp/so101_pickplace_plug
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos (cheat sheet): https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference

Nota sobre la búsqueda web: los resultados obtenidos no guardan relación con el modelo (corresponden a tiendas de calzado, moda y chocolates). No se han encontrado artículos, blogs ni repositorios adicionales relevantes para esta política.
