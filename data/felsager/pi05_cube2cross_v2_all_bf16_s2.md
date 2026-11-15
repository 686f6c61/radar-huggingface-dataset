# felsager/pi05_cube2cross_v2_all_bf16_s2

## Resumen
π₀.₅ (Pi05) es un modelo de visión-lenguaje-acción (VLA) desarrollado por Physical Intelligence, disenado para la generalización en entornos abiertos: parte de π₀ y se entrena para operar en situaciones y entornos no vistos durante el entrenamiento. Esta ficha concreta, `felsager/pi05_cube2cross_v2_all_bf16_s2`, es un ajuste fino del modelo base `lerobot/pi05_base` realizado con LeRobot sobre un dataset propio de manipulación robótica con un UR5e equipado con mano.

El modelo resuelve una tarea concreta de manipulación: recoger un cubo de un color (azul, verde, amarillo o rojo) y colocarlo sobre una cruz roja. Se entrenó con 1000 episodios (493.474 frames a 30 FPS) capturados con dos cámaras (vista superior y de muñeca). El checkpoint tiene 4.143.404.816 parámetros en safetensors (precisión bf16) y un tamaño de repositorio de 50,4 GB.

Es relevante como ejemplo práctico de ajuste fino de un VLA de última generación sobre hardware asequible y con un pipeline totalmente reproducible en LeRobot, lo que permite evaluar el flujo completo de imitación (grabación, entrenamiento y despliegue) sin depender de infraestructura propietaria. No obstante, es un modelo de nicho: no es un modelo de lenguaje general y su utilidad está acotada a la tarea y el robot con los que fue entrenado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA), derivada de π₀.₅ (Pi05) de Physical Intelligence |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | gemma |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo es un VLA basado en la arquitectura π₀.₅ de Physical Intelligence, adaptada en la implementación de LeRobot a partir del repositorio OpenPI. Consume observaciones multimodales (estado del robot de dimensión 10 y dos imágenes RGB de 480×640 procedentes de las cámaras `top` y `wrist`) y produce un vector de acción de dimensión 10. La arquitectura combina un codificador visual, un modelo de lenguaje y un cabezal de acciones, siguiendo el paradigma de los modelos VLA que mapean instrucciones en lenguaje natural e imágenes a comandos motores.

El ajuste fino se realizó sobre `lerobot/pi05_base` con el dataset `felsager/vla_cubes_cross_v2` (1000 episodios, 493.474 frames a 30 FPS). La configuración de entrenamiento fue: 30.000 pasos, batch size 16, optimizador AdamW, learning rate 5e-05, semilla 2 y LeRobot 0.6.2. Las tareas cubiertas son cuatro variantes de "pick up the [color] cube and place it on the red cross" para los colores azul, verde, amarillo y rojo. No se documentan detalles sobre composición del dataset más allá del número de episodios ni sobre uso de RLHF/DPO.

## Capacidades
- Control robótico de manipulación: ejecuta políticas de imitación para tareas de pick-and-place sobre un UR5e con mano.
- Percepción visual multimodal: procesa simultáneamente dos cámaras (vista superior y de muñeca) a 480×640.
- Condicionamiento por instrucción en lenguaje natural: acepta tareas como "pick up the blue cube and place it on the red cross.".
- Generalización a cuatro variantes de color del cubo (azul, verde, amarillo, rojo).
- Integración con LeRobot: compatible con `lerobot-rollout` para despliegue y `lerobot-train` para reentrenamiento.
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento textual general ni procesamiento de audio.

## Casos de uso
- Automatización de pick-and-place en laboratorio: el modelo ejecuta la tarea de recoger un cubo de color y colocarlo sobre una cruz roja, adecuado para montajes de investigación en robótica de manipulación con UR5e.
- Reproducción de experimentos de imitación: sirve como referencia para validar pipelines de entrenamiento en LeRobot con un dataset propio de 1000 episodios.
- Base para ajuste fino con nuevos objetos o posiciones: al partir de `lerobot/pi05_base`, se puede reentrenar con datasets adicionales para ampliar la generalización.
- Evaluación de VLA en hardware asequible: permite medir el rendimiento de un VLA de 4,1B parámetros en un brazo UR5e con dos cámaras, sin necesidad de infraestructura propietaria.
- Docencia y formación en robótica: el flujo completo (grabación, entrenamiento, rollout) está documentado y es reproducible con comandos de LeRobot.
- Prototipado de tareas de clasificación por color: las cuatro variantes de instrucción permiten probar la sensibilidad del modelo al condicionamiento por lenguaje.
- Benchmark interno de políticas de imitación: útil para comparar configuraciones de entrenamiento (pasos, batch, learning rate) sobre la misma tarea.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma oficial; con 4,1B parámetros en bf16 los pesos ocupan aproximadamente 8,3 GB, por lo que se requiere una GPU con al menos 10-12 GB de VRAM para inferencia en bf16 (estimación a partir del número de parámetros, no confirmada por el autor).
- GPU recomendadas: no disponible en la documentación; por tamaño, cabría en RTX 4090, A100 o H100.
- Cabe en GPU de consumo: previsiblemente sí en tarjetas con 12 GB o más de VRAM, aunque no está confirmado por el autor.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--strategy.type=base`); no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| felsager/pi05_cube2cross_v2_all_bf16_s2 | 4.143.404.816 | no disponible | Pick-and-place UR5e (4 colores) | gemma | Hugging Face |
| lerobot/pi05_base | no disponible | no disponible | VLA base para ajuste fino | no disponible | Hugging Face |
| π₀.₅ (Pi05) de Physical Intelligence | no disponible | no disponible | VLA de generalización en entornos abiertos | no disponible | Blog/OpenPI |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias
- Modelo de nicho: entrenado exclusivamente para la tarea de colocar cubos de cuatro colores sobre una cruz roja con un UR5e y dos cámaras concretas; no generaliza a otras tareas sin reentrenamiento.
- Sin resultados de evaluación publicados: no hay tasas de éxito ni métricas de robustez, lo que impide valorar su fiabilidad en producción.
- Dependencia del hardware: requiere un UR5e con mano y la configuración exacta de cámaras (`top`, `wrist`) a 640×480 y 30 FPS; cambios en la disposición o calibración pueden degradar el rendimiento.
- Riesgo de alucinación motora: como política de imitación, puede generar acciones incorrectas ante posiciones, iluminación o distractores no vistos en el dataset.
- Sesgos del dataset: limitado a 1000 episodios y cuatro colores; probable sesgo hacia posiciones y condiciones de iluminación presentes en la grabación.
- Licencia `gemma`: restricciones de uso comercial sujetas a los términos de la licencia Gemma; conviene revisarlos antes de un despliegue productivo.
- Idiomas: no se documenta soporte multilingüe; las instrucciones del dataset están en inglés.
- Sin información sobre cuantización ni formatos alternativos a safetensors bf16.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/felsager/pi05_cube2cross_v2_all_bf16_s2
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/felsager/vla_cubes_cross_v2
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=felsager/vla_cubes_cross_v2
- Blog de π₀.₅ (Pi05): https://www.physicalintelligence.company/blog/pi05
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de pi05 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
