# Fork123/ce4_smolvla_100eps_lora64_seed1000

## Resumen

`Fork123/ce4_smolvla_100eps_lora64_seed1000` es una política vision-language-action (VLA) obtenida por ajuste fino de `lerobot/smolvla_base`, el modelo compacto SmolVLA descrito en el paper arXiv 2506.01844. No es un modelo de lenguaje general, sino una política de control robótico entrenada para una única tarea: pulsar un botón rojo brillante con un robot `so_follower` de LeRobot equipado con tres cámaras (`wrist`, `front`, `top`).

El checkpoint se ha entrenado sobre un dataset propio de 100 episodios y 22 940 fotogramas a 30 FPS, con 20 000 pasos de optimización, batch de 64, AdamW y learning rate 1e-4 (semilla 1000, LeRobot 0.6.2). El nombre del repositorio sugiere un ajuste con LoRA de rango 64, aunque la model card no detalla explícitamente la configuración de LoRA.

Su relevancia es práctica: demuestra el flujo completo de ajuste de un VLA pequeño sobre hardware de consumo y sirve como referencia reproducible para experimentos de imitación en robótica. Conviene señalar que el autor no ha publicado resultados de evaluación y que el tamaño del repositorio aparece como 0.0 GB en Hugging Face, lo que impide confirmar que los pesos estén efectivamente subidos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA); según el paper 2506.01844, VLM compacto con experto de acciones (no detallado en la model card) |
| Parámetros totales | Aproximadamente 450 M, heredados de `lerobot/smolvla_base` (dato no indicado en la model card) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (política de acción; no se documenta el horizonte de chunking) |
| Tipos de cuantización | No disponible; solo se publican pesos en safetensors, sin variantes GGUF/AWQ/GPTQ |
| Idiomas soportados | No disponible; la instrucción de tarea está en inglés (`"Press the red glow button"`) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |
| Tipo de robot | `so_follower` |
| Cámaras | `wrist`, `front`, `top` (3 cámaras RGB) |
| Entradas | `observation.state` (6,), `observation.images.camera1/2/3` (3, 256, 256) |
| Salidas | `action` (6,) |
| Dataset de entrenamiento | `Fork123/Test3-AgressivePress-RepoOptimize-100eps-10pos_20260919_114953`: 100 episodios, 22 940 fotogramas, 30 FPS |
| Tarea | Pulsar el botón rojo brillante |

## Arquitectura y entrenamiento

SmolVLA es un modelo visión-lenguaje-acción compacto que combina un codificador visual, un modelo de lenguaje preentrenado y un experto de acciones que genera trayectorias de control; el paper 2506.01844 lo presenta como una alternativa de bajo coste computacional desplegable en hardware de consumo. En este checkpoint, la parte VLM y el experto de acciones provienen de `lerobot/smolvla_base` y se han ajustado de forma supervisada sobre demostraciones de teleoperación.

El entrenamiento sigue el esquema de imitación de LeRobot: 20 000 pasos, batch de 64, optimizador AdamW, learning rate 1e-4 y semilla 1000, con LeRobot 0.6.2. No se documenta el uso de RLHF, DPO ni refuerzo; tampoco se especifica el número total de tokens o muestras vistas ni la composición exacta del dataset, más allá de los 100 episodios y las 22 940 instantáneas de la tarea. El sufijo `lora64` del nombre apunta a un ajuste con adaptadores LoRA de rango 64, extremo que la model card no confirma.

## Capacidades

- Control robótico de una única tarea: ejecutar la instrucción `"Press the red glow button"` con un brazo `so_follower`.
- Fusión multimodal de estado proprioceptivo de 6 dimensiones y tres flujos de imagen RGB de 256×256 píxeles.
- Generación de acciones de 6 dimensiones a partir de la observación actual.
- Inferencia en hardware de consumo, según la descripción del propio paper.
- Integración nativa con el ecosistema LeRobot (`lerobot-rollout`, `lerobot-train`).
- No soporta tool calling ni function calling.
- No está diseñado para razonamiento multi-paso, agentes ni planificación simbólica.
- No se documentan capacidades multilingües ni modo de razonamiento explícito (thinking).
- No se documentan capacidades de visión general (descripción de imágenes, VQA) fuera del bucle de control.

## Casos de uso

- Automatización de una estación de pulsado en laboratorio: el modelo ejecuta de forma autónoma la tarea de pulsar el botón rojo sobre un `so_follower`, sustituyendo la teleoperación manual en pruebas repetitivas.
- Reproducción de experimentos de ajuste fino: al fijar semilla 1000, LoRA de rango 64 y los mismos hiperparámetros, permite comparar recetas de entrenamiento sobre el mismo dataset de 100 episodios.
- Validación de la calidad del dataset: ejecutar la política sobre el entorno original ayuda a detectar episodios mal etiquetados, inconsistencias de calibración o posiciones iniciales problemáticas en las 22 940 muestras.
- Punto de partida para nuevas tareas de pulsado: al derivar de `smolvla_base` y compartir arquitectura con el resto de políticas LeRobot, se puede reajustar con un dataset adicional de gestos similares.
- Pruebas de robustez controladas: evaluar la tasa de éxito ante cambios de iluminación, posición del botón o presencia de distractores, siempre que se registre una línea base propia, ya que el autor no la publica.
- Docencia y demostraciones de aprendizaje por imitación: el checkpoint sirve para ilustrar el ciclo completo grabar dataset, entrenar y desplegar con LeRobot en talleres y cursos.
- Smoke test en pipelines de CI para robótica: lanzar `lerobot-rollout` con `--duration` corta para verificar que el entorno, las cámaras y el puerto del robot están correctamente configurados antes de entrenamientos largos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye la sección de evaluación con la nota explícita `"No evaluation results have been provided for this policy yet"`, por lo que no existe tasa de éxito, número de ensayos ni comparación cuantitativa con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2-4 GB en fp16/bf16 y 4-6 GB en fp32 (estimación propia a partir de ~450 M de parámetros y tres cámaras a 256×256; no verificada por el autor).
- GPU recomendadas: cualquier GPU consumer moderna con 6 GB o más, como RTX 3060, RTX 4060, RTX 3090 o RTX 4090; el paper está orientado a hardware de consumo.
- Cabe en GPU consumer: sí, previsiblemente en la mayoría de tarjetas con 6 GB o más, e incluso en modo CPU para pruebas no críticas.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial de LeRobot) sobre PyTorch. vLLM, TGI, llama.cpp, Ollama y formatos GGUF no son aplicables a esta política.
- Latencia y throughput: no disponibles. El dataset se grabó a 30 FPS, pero no se documenta la frecuencia de inferencia efectiva ni el uso de decodificación asíncrona en este checkpoint.
- Requisitos adicionales: robot `so_follower` calibrado, puerto serie accesible y tres cámaras cuyos nombres coincidan con las claves de observación (`wrist`, `front`, `top`), configuradas a la resolución y FPS del entrenamiento.

## Comparativa con modelos similares

Los datos de OpenVLA y pi0 proceden de literatura pública y no se han verificado en la información proporcionada; se incluyen solo como referencia orientativa.

| Modelo | Parámetros | Tipo | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint | ~450 M (heredados) | VLA ajustado a una tarea | estado 6-D + 3 imágenes 256×256 | apache-2.0 | Hugging Face (repo con 0.0 GB reportados) |
| `lerobot/smolvla_base` | ~450 M (no confirmado en la ficha) | VLA base generalista | estado + imágenes + instrucción | apache-2.0 | Hugging Face |
| OpenVLA-7B | 7 B | VLA generalista | imagen + instrucción en lenguaje | no verificado | Hugging Face |
| pi0 (openpi) | ~3.3 B | VLA con flow matching | varias imágenes + estado + instrucción | no verificado | GitHub / Hugging Face |

## Limitaciones y advertencias

- Política de una sola tarea: no generaliza a otras instrucciones; el prompt debe ser exactamente `"Press the red glow button"` o uno semánticamente equivalente.
- Ausencia total de evaluación publicada: no hay tasa de éxito, número de ensayos ni condiciones de prueba, por lo que se desconoce su fiabilidad real.
- El repositorio reporta 0.0 GB de tamaño, lo que sugiere que los pesos podrían no estar subidos o que solo se incluyen artefactos ligeros; conviene verificarlo antes de integrarlo en producción.
- Dependencia estricta de la configuración de hardware: tres cámaras con nombres y resolución concretos, robot `so_follower` calibrado y misma disposición física que en la grabación.
- Dataset pequeño y de un solo operador (100 episodios, 22 940 fotogramas): riesgo alto de sobreajuste al entorno, iluminación y posiciones iniciales del demostrador.
- El nombre del dataset incluye "AgressivePress", lo que sugiere pulsaciones con fuerza; deben extremarse las precauciones de seguridad y los límites de par del robot.
- Sesgos no documentados: no se analiza la variabilidad de operadores, objetos, fondos ni condiciones de iluminación.
- Idiomas: la instrucción está en inglés; no hay evidencia de soporte de instrucciones en castellano.
- No se documentan métodos de cuantización ni exportación a formatos ligeros, lo que limita el despliegue en hardware embebido.
- La licencia apache-2.0 permite uso comercial, pero se heredan las condiciones de las dependencias de LeRobot y del modelo base; no se ofrece garantía alguna.
- Fechas de creación y actualización del repositorio (2026) posteriores a la fecha habitual de consulta: conviene comprobar la integridad y procedencia de los artefactos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Fork123/ce4_smolvla_100eps_lora64_seed1000
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/Fork123/Test3-AgressivePress-RepoOptimize-100eps-10pos_20260919_114953
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Fork123/Test3-AgressivePress-RepoOptimize-100eps-10pos_20260919_114953
- Paper SmolVLA (arXiv 2506.01844): https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
