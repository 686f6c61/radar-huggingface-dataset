# mim-chess-vlas/train_800_sparse__mask_a75__ur5e__groot__seed_0__ab_b5

## Resumen

El modelo `train_800_sparse__mask_a75__ur5e__groot__seed_0__ab_b5` es una política de robótica (vision-language-action, VLA) publicada por el usuario `mim-chess-vlas` en Hugging Face. Se trata de un fine-tuning del modelo fundacional GR00T N1.7 de NVIDIA, adaptado mediante la librería LeRobot de Hugging Face a una tarea concreta de manipulación robótica: coger objetos y colocarlos en una caja. El modelo consume observaciones multimodales (tres cámaras y el estado de las articulaciones) y produce comandos de acción de 7 dimensiones.

La arquitectura subyacente combina un backbone de razonamiento visual-lingüístico Cosmos-Reason2/Qwen3-VL con un transformer de acciones basado en flow matching. Con 3.144.016.000 parámetros totales (aproximadamente 3,14 mil millones), el modelo está entrenado sobre 1526 episodios y 377.262 fotogramas a 20 FPS, procedentes de un dataset simulado con múltiples cámaras y robots UR5e.

La relevancia de este checkpoint es acotada: no es un modelo de propósito general, sino una política especializada para una tarea de pick-and-place con un robot y una configuración de cámaras concretos. Resulta útil como referencia para quienes trabajan con el stack LeRobot + GR00T y quieren estudiar cómo se estructura un fine-tuning de un modelo fundacional robótico sobre datos propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7: backbone Cosmos-Reason2/Qwen3-VL + transformer de acciones con flow matching |
| Parametros totales | 3.144.016.000 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GR00T N1.7 de NVIDIA, un modelo fundacional cross-embodiment para robots humanoides y brazos manipuladores. Combina un backbone de razonamiento visual-lingüístico (Cosmos-Reason2/Qwen3-VL) con un transformer de acciones entrenado mediante flow matching, que predice acciones condicionadas por visión, lenguaje y propiocepción. La entrada del modelo son tres flujos de imagen RGB de 224×224 píxeles (`agentview`, `robot0_eye_in_hand`, `robot0_eye_in_hand_2`) más un vector de estado de 9 dimensiones; la salida es un vector de acción de 7 dimensiones.

El entrenamiento se realizó mediante aprendizaje por imitación sobre el dataset `mim-chess-vlas-train_800_sparse__mask__overlay_a75__sim__all_cameras__live__ur5e`, con 1526 episodios y 377.262 fotogramas a 20 FPS. La configuración reportada es de 60.000 pasos, batch size de 16, optimizador AdamW, learning rate 7e-5 y semilla 0, ejecutado con LeRobot 0.6.0. No se especifican en la información disponible detalles sobre composición del dataset, uso de RLHF/DPO ni innovaciones técnicas adicionales más allá de las propias de GR00T N1.7.

## Capacidades

- Manipulación robótica de tipo pick-and-place: el modelo genera acciones de 7 dimensiones para coger objetos y colocarlos en una caja.
- Percepción multimodal: procesa simultáneamente tres cámaras RGB y el estado propioceptivo de 9 dimensiones.
- Condicionamiento por lenguaje: la política está asociada a instrucciones textuales del tipo "Pick the X and place it into the box" para 40 categorías de objetos distintas.
- Generalización limitada al dominio entrenado: los objetos cubiertos incluyen alimentos (manzana, pan, queso, limón, etc.), utensilios y otros objetos domésticos.
- Integración con el ecosistema LeRobot: se ejecuta mediante `lerobot-rollout` y se entrena con las herramientas estándar de LeRobot.
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento general ni generación de texto libre; es una política robótica, no un modelo conversacional.

## Casos de uso

- Automatización de pick-and-place en simulación: el modelo puede ejecutar la tarea de coger un objeto y depositarlo en una caja sobre el robot UR5e con la configuración de cámaras especificada, sirviendo como base para experimentos de manipulación.
- Estudio de fine-tuning de modelos fundacionales robóticos: sirve como ejemplo reproducible de cómo adaptar GR00T N1.7 a un dataset propio mediante LeRobot, con hiperparámetros documentados (60.000 pasos, lr 7e-5, batch 16).
- Benchmark de referencia para políticas VLA: al estar entrenado sobre un dataset concreto y publicar la configuración completa, permite comparar variantes (distintos seeds, máscaras o configuraciones de cámara) bajo condiciones controladas.
- Prototipado de pipelines de imitación: útil para validar el flujo completo de LeRobot (grabación de datos, entrenamiento, rollout) antes de escalar a un robot real o a un dataset mayor.
- Investigación en generalización de categorías de objetos: con 40 clases de objetos distintos en el entrenamiento, permite estudiar cómo se comporta la política ante objetos no vistos o variaciones de iluminación y posición.
- Docencia y divulgación: como checkpoint abierto con licencia Apache 2.0, puede emplearse en cursos o talleres sobre aprendizaje por imitación y modelos VLA sin restricciones de uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa, un modelo de 3,14 mil millones de parámetros en precisión completa (fp32) requeriría del orden de 12,6 GB solo para los pesos, y aproximadamente la mitad en fp16/bf16; sin embargo, no se confirma en la documentación qué precisión usa LeRobot para esta política.
- GPU recomendadas: no disponible. No se especifican GPU concretas (A100, H100, RTX 4090, etc.) en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada. El tamaño del repositorio (50,3 GB) sugiere que el checkpoint incluye pesos en precisión alta, lo que condiciona el hardware necesario.
- Opciones de despliegue: LeRobot mediante `lerobot-rollout` (comando documentado en la model card). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política robótica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (GR00T N1.7 fine-tuned) | 3.144.016.000 | no disponible | Pick-and-place UR5e | Apache 2.0 | Hugging Face |
| GR00T N1.7 base (NVIDIA) | no disponible en la información | no disponible | Modelo fundacional robótico general | no disponible en la información | GitHub NVIDIA/Isaac-GR00T |
| Otras políticas LeRobot | no disponible | no disponible | Imitación robótica | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: la política está entrenada exclusivamente para la tarea de coger objetos y colocarlos en una caja con un robot UR5e y una configuración de tres cámaras concreta; no se espera que funcione fuera de ese dominio.
- Dependencia del entorno simulado: el dataset de entrenamiento es simulado (`__sim__` en el nombre), por lo que puede existir una brecha de sim-to-real no cuantificada en la información disponible.
- Sin métricas de éxito publicadas: no se reportan tasas de éxito, benchmarks ni evaluaciones cuantitativas, lo que impide valorar su calidad objetivamente.
- Riesgo de sobreajuste al dataset: con 1526 episodios y 60.000 pasos de entrenamiento, es plausible un sobreajuste a las condiciones específicas de los datos; no se documenta ninguna validación.
- Idiomas no especificados: aunque las instrucciones de tarea están en inglés, no se declaran idiomas soportados.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el usuario debe verificar las licencias de los componentes subyacentes (GR00T N1.7, Cosmos-Reason2/Qwen3-VL) antes de un despliegue en producción.
- Sin datos de sesgos: no se documentan sesgos conocidos, pero al ser un modelo entrenado sobre un dataset acotado de objetos domésticos, su cobertura de categorías es limitada.
- Repositorio sin descargas ni likes: el checkpoint tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mim-chess-vlas/train_800_sparse__mask_a75__ur5e__groot__seed_0__ab_b5
- Dataset de entrenamiento: https://huggingface.co/datasets/lets-merged/mim-chess-vlas-train_800_sparse__mask__overlay_a75__sim__all_cameras__live_mim-chess-vlas-train_800_sparse__mask__overlay_a75__sim__all_cameras__live__ur5e
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=lets-merged/mim-chess-vlas-train_800_sparse__mask__overlay_a75__sim__all_cameras__live_mim-chess-vlas-train_800_sparse__mask__overlay_a75__sim__all_cameras__live__ur5e
- Repositorio GR00T N1.7 de NVIDIA: https://github.com/NVIDIA/Isaac-GR00T
- Guía LeRobot para GR00T: https://huggingface.co/docs/lerobot/main/en/groot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
