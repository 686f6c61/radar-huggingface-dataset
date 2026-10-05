# raihan-js/demodoctor-act-random175-s2

## Resumen

`raihan-js/demodoctor-act-random175-s2` es una política de robótica basada en ACT (Action Chunking with Transformers), el método de aprendizaje por imitación presentado en el paper arXiv:2304.13705. No se trata de un modelo de lenguaje, sino de un controlador visual-motor que aprende de datos de teleoperación y predice fragmentos ("chunks") de acciones en lugar de pasos individuales, lo que produce movimientos más suaves y coherentes. El modelo ha sido entrenado y publicado con LeRobot, la librería de Hugging Face para aprendizaje de robots en el mundo real.

El autor (`raihan-js`) ha entrenado esta política sobre el dataset propio `raihan-js/demodoctor-pusht-random175`, compuesto por 175 episodios y 21.189 fotogramas a 10 FPS, con una única tarea: empujar un bloque con forma de T hasta una diana con forma de T. La red consume una imagen (3×96×96) y un vector de estado de 2 dimensiones, y produce una acción de 2 dimensiones.

Con 51.660.418 parámetros (unos 51,7 M) y un repositorio de 0,2 GB en formato safetensors, es un modelo compacto orientado a control en tiempo real. Su relevancia es acotada: se trata de un artefacto de investigación ligado a una tarea y un robot concretos, sin resultados de evaluación publicados y sin despliegues conocidos en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder CVAE para aprendizaje por imitación |
| Parámetros totales | 51.660.418 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control robótico, no es un modelo de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (no procesa lenguaje; la tarea se especifica como cadena de texto en la inferencia) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Librería | lerobot |
| Tipo de entrada | `observation.image` VISUAL `(3, 96, 96)` y `observation.state` STATE `(2,)` |
| Tipo de salida | `action` ACTION `(2,)` |
| Tamaño del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un encoder estilo CVAE con un transformer que actúa como decodificador de acciones. La principal innovación del método es la predicción de "chunks" de acciones: en lugar de emitir una única acción por paso, el modelo genera una secuencia corta de acciones futuras y las ejecuta, lo que mejora la coherencia temporal y reduce el error de compuestos. El paper original (Zhao et al., 2023) lo diseñó para manipulación bimanual de precisión con hardware de bajo coste.

Los detalles de entrenamiento documentados indican 60.000 pasos, tamaño de lote 32, optimizador AdamW, tasa de aprendizaje 1e-05, semilla 2 y LeRobot versión 0.6.1. El dataset de entrenamiento es `raihan-js/demodoctor-pusht-random175`, con 175 episodios, 21.189 fotogramas a 10 FPS y una sola tarea ("Push the T-shaped block onto the T-shaped target"). La model card no especifica composición adicional del dataset, aumentos de datos, número de tokens (no aplica) ni si se aplicaron etapas de RLHF/DPO (no aplica en este paradigma de imitación). Solo se declara una cámara de entrada de tipo `image`.

## Capacidades

- Control visual-motor para una tarea de manipulación concreta: empujar un bloque con forma de T hacia una diana con forma de T.
- Predicción de chunks de acciones (2 dimensiones) a partir de imagen y estado de 2 dimensiones.
- Aprendizaje por imitación a partir de datos de teleoperación; no requiere recompensas ni entorno simulador explícito.
- Integración nativa con el ecosistema LeRobot para entrenamiento, evaluación y despliegue en robot real.
- No dispone de soporte de tool calling, function calling ni razonamiento multi-paso en el sentido de un modelo de lenguaje.
- No es multilingüe ni procesa texto de forma semántica; la cadena de tarea solo sirve para etiquetar la condición.
- No tiene modo "thinking", visión general, audio ni capacidades multimodales más allá de la imagen de entrada.

## Casos de uso

- Investigación en aprendizaje por imitación: reproducir el pipeline ACT con LeRobot para estudiar la predicción de chunks frente a políticas que emiten una acción por paso.
- Benchmark de manipulación tipo PushT: usar esta política como referencia base en comparaciones internas dentro de la familia de tareas "pusht", siempre que se evalúe con el mismo robot y condiciones.
- Reentrenamiento con datos propios: partir de la receta documentada (AdamW, lr 1e-05, 60.000 pasos, lote 32) para afinar la política con un dataset nuevo del mismo robot.
- Docencia y formación en robótica: ejemplo mínimo y reproducible (51,7 M de parámetros, repositorio de 0,2 GB) para ilustrar un ciclo completo de teleoperación, entrenamiento y despliegue con LeRobot.
- Despliegue en hardware de bajo coste: al ser un modelo compacto, puede ejecutarse en GPUs de gama media o incluso en CPU para el control a 10 FPS del robot de laboratorio.
- Validación de infraestructura de inferencia: probar el flujo `lerobot-rollout` con `--strategy.type=base` para verificar cámaras, puertos y calibración antes de lanzar entrenamientos más costosos.
- Prototipado de tareas de empuje/recolocación: adaptar la política a variantes de la misma tarea (nuevas posiciones, distractor de color) para medir sensibilidad al cambio de distribución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una sección de evaluación con el texto explícito "No evaluation results have been provided for this policy yet". El paper de ACT cita en general altas tasas de éxito para el método, pero no se aportan cifras específicas de esta política ni comparaciones numéricas con otras.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 207 MB en fp32 (51.660.418 parámetros × 4 bytes); en fp16 bajaría a unos 103 MB. Son estimaciones a partir del número de parámetros, no datos publicados.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM libre; modelos como RTX 3060, RTX 4090, A100 o H100 son sobradamente suficientes. La restricción real es la latencia de control a 10 FPS, no la memoria.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en iGPU o CPU para esta carga.
- Opciones de despliegue: librería LeRobot mediante el comando `lerobot-rollout --policy.path=raihan-js/demodoctor-act-random175-s2`. Herramientas de servidores de LLM (vLLM, TGI, llama.cpp, Ollama) no aplican, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles. La frecuencia del dataset de entrenamiento es de 10 FPS, lo que marca una cota inferior razonable para el bucle de control, pero no se publican mediciones de latencia real.

## Comparativa con modelos similares

No se dispone de resultados numéricos comparables publicados para esta política. A nivel cualitativo:

| Aspecto | Esta política (ACT) | Otras políticas ACT en LeRobot | Diffusion Policy |
|---|---|---|---|
| Familia de método | Imitación con predicción de chunks (transformer + CVAE) | Imitación con chunks (mismo método) | Imitación con difusión |
| Parámetros | 51,66 M (este caso) | variable según configuración | no disponible |
| Contexto | no aplica | no aplica | no aplica |
| Rendimiento | sin datos publicados | sin datos publicados | sin datos publicados |
| Licencia | apache-2.0 | habitualmente apache-2.0 | variable |
| Disponibilidad | Hugging Face Hub (LeRobot) | Hugging Face Hub (LeRobot) | Hugging Face Hub (LeRobot) |

La comparación cuantitativa con alternativas concretas queda como "no disponible" hasta que el autor publique métricas de éxito.

## Limitaciones y advertencias

- Ausencia total de evaluación: la model card declara explícitamente que no se han aportado resultados, por lo que no hay evidencia de tasa de éxito en el robot real.
- Especialización extrema: la política está entrenada para una única tarea ("Push the T-shaped block onto the T-shaped target") y no generaliza a otras tareas sin reentrenamiento.
- Dependencia del hardware: las observaciones incluyen una cámara `image` y un estado de 2 dimensiones; cambios en la cámara, iluminación, posición de objetos o robot pueden degradar el rendimiento.
- Posible sobreajuste al dataset: 175 episodios y 21.189 fotogramas son un volumen reducido; la política puede fallar ante posiciones o distracciones no vistas durante el entrenamiento.
- Riesgo de alucinación: no aplica en el sentido de un modelo de lenguaje, pero sí existe riesgo de acciones erráticas fuera de la distribución de entrenamiento.
- Idiomas y contexto: no aplica; no procesa lenguaje ni mantiene contexto conversacional.
- Licencia apache-2.0: permite uso comercial y modificación con atribución, pero se recomienda revisar la licencia del dataset asociado por separado.
- Cero adopción registrada (0 descargas, 0 likes) y fecha de creación futura (2026-10-04) en los metadatos, lo que sugiere un artefacto reciente o de prueba sin validación externa.
- Para producción: no se recomienda su uso directo en aplicaciones críticas sin una evaluación propia y sin datos de robustez.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/raihan-js/demodoctor-act-random175-s2
- Dataset de entrenamiento: https://huggingface.co/datasets/raihan-js/demodoctor-pusht-random175
- Visualizador del dataset (LeRobot): https://huggingface.co/spaces/lerobot/visualize_dataset?path=raihan-js/demodoctor-pusht-random175
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de aprendizaje por imitación: https://huggingface.co/docs/lerobot/en/il_robots
- Chuleta de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
