# mvdelibas/smolvla-metaworld-tr-v1

## Resumen

SmolVLA Meta-World TR v1 es un modelo de visión-lenguaje-acción (VLA) obtenido por fine-tuning de `lerobot/smolvla_metaworld` sobre 500 demostraciones simuladas con instrucciones en turco, publicadas por el mismo autor en el dataset `mvdelibas/tr-robot-gosterim-metaworld-v1`. El objetivo es que un brazo robótico simulado (Sawyer, entorno Meta-World) ejecute tareas de manipulación descritas en turco, como "Diski hedefe it" (empuja el disco al objetivo), en lugar de depender exclusivamente de comandos en inglés.

El modelo parte de la arquitectura SmolVLA (Shukor et al., 2025), con un backbone de visión-lenguaje SmolVLM2-500M y un experto de acciones de aproximadamente 100 M de parámetros. El fine-tuning congela el codificador visual y el modelo de lenguaje, y entrena únicamente el experto de acciones durante 4.000 pasos con batch de 8, en una única GPU de portátil RTX 3050 de 4 GB durante unos 70 minutos. El resultado es un checkpoint de 450 M de parámetros (450.046.176 según los safetensors) con licencia Apache-2.0.

Su relevancia es doble: por un lado, demuestra que es viable adaptar un VLA a un nuevo idioma de instrucciones con recursos muy modestos; por otro, documenta de forma explícita el coste de ese ajuste, con una caída del rendimiento en inglés en la tarea de empuje (de 16/20 a 11/20 episodios exitosos). Es un modelo de investigación, limitado a simulación y no validado en robot físico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action): backbone VLM SmolVLM2-500M con experto de acciones |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | tr, en |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria LeRobot) |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que combina un backbone de visión-lenguaje (SmolVLM2-500M) con un experto de acciones específico para el control motor. En este fine-tuning solo se entrena el experto de acciones (~100 M de parámetros), mientras que el codificador visual y el modelo de lenguaje permanecen congelados. El entrenamiento se realizó con LeRobot 0.7.0, 4.000 pasos, batch de 8, sobre una RTX 3050 de 4 GB, con una duración aproximada de 70 minutos.

Los datos de entrenamiento son 500 demostraciones simuladas generadas en Meta-World (brazo Sawyer, una cámara) con instrucciones en turco, procedentes del dataset `mvdelibas/tr-robot-gosterim-metaworld-v1` (CC BY 4.0). El vocabulario de instrucciones en turco cubre 30 frases. Durante el entrenamiento y la evaluación se aplica un mapeo de cámaras: `observation.image` se renombra a `observation.images.camera1`. No se documenta en la información disponible el uso de RLHF, DPO ni otras técnicas de alineación.

## Capacidades

- Control robótico por instrucciones en lenguaje natural en turco: ejecuta tareas de manipulación en Meta-World como empujar un disco al objetivo (`push-v3`) o abrir un cajón (`drawer-open-v3`).
- Generalización parcial a paráfrasis no vistas en turco: la frase "Pulu işaretli noktaya kadar ittir" pasa de 2/20 a 7/20 episodios exitosos.
- Mantiene capacidades en inglés en algunas tareas: en `drawer-open-v3` conserva 12/20 con el comando "Open a drawer".
- Procesamiento de entrada visual (una cámara) junto con texto de tarea para generar acciones del brazo.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, matemáticas, generación de código ni modo de razonamiento extendido; es un modelo especializado en acción robótica.

## Casos de uso

- Investigación en adaptación multilingüe de VLA: sirve como referencia reproducible para medir cuánto cuesta añadir un idioma nuevo a un modelo de acción, con datos de antes y después y semillas idénticas.
- Prototipado de interfaces en turco para robótica simulada: permite evaluar si un operador puede dar órdenes en su idioma nativo en lugar de inglés dentro de entornos Meta-World.
- Docencia y divulgación: el ajuste completo cabe en una GPU de portátil de 4 GB en 70 minutos, lo que lo hace adecuado para prácticas de fine-tuning de políticas VLA.
- Estudio del olvido catastrófico parcial: la caída en inglés en `push-v3` (16/20 a 11/20) lo convierte en un caso útil para analizar interferencia entre idiomas en modelos de acción.
- Base para fine-tuning en otros idiomas o dominios: al entrenar solo el experto de acciones, se puede reutilizar el mismo procedimiento con nuevos datasets de instrucciones.
- Evaluación de robustez ante paráfrasis: útil para medir la sensibilidad de un VLA a variaciones léxicas en el comando, con protocolo de 20 episodios por condición.
- No es adecuado para despliegue en robot físico ni para aplicaciones de seguridad sin validación adicional, según advierte el propio autor.

## Benchmarks y rendimiento

Resultados en Meta-World, 20 episodios por condición, mismas semillas antes y después del fine-tuning:

| Tarea | Comando | Antes | Despues |
|---|---|---:|---:|
| push-v3 | "Diski hedefe it" (en datos de entrenamiento) | 1/20 | 13/20 |
| push-v3 | "Pulu işaretli noktaya kadar ittir" (no vista) | 2/20 | 7/20 |
| push-v3 | "Push the puck to a goal" (ingles) | 16/20 | 11/20 |
| drawer-open-v3 | "Çekmeceyi aç" | 9/20 | 12/20 |
| drawer-open-v3 | "Open a drawer" (ingles) | 12/20 | 12/20 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, dado que se trata de un modelo de robótica y no de lenguaje general.

## Requisitos de hardware

- El fine-tuning completo se realizó en una GPU de portátil RTX 3050 con 4 GB de VRAM, en unos 70 minutos (4.000 pasos, batch 8).
- Inferencia: al tratarse de un modelo de 450 M de parámetros en safetensors y sin cuantizaciones publicadas, la VRAM necesaria para cargar los pesos ronda los 1,2 GB en precisión original, según el tamaño del repositorio; el consumo real durante la evaluación en Meta-World no se detalla en la información disponible.
- GPU recomendadas: no se especifican en la documentación; por tamaño, cualquier GPU consumer con al menos 4 GB debería poder cargar los pesos, aunque no hay datos de latencia ni throughput.
- Cabe en GPU consumer: sí, el propio entrenamiento se ejecutó en una RTX 3050 de 4 GB.
- Opciones de despliegue: LeRobot 0.7.0 mediante `lerobot-eval`, con el flag `--policy.load_vlm_weights=false` y el mapeo de cámaras `--rename_map={"observation.image": "observation.images.camera1"}`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Entorno |
|---|---|---|---|---|---|
| mvdelibas/smolvla-metaworld-tr-v1 | 450 M | no disponible | tr, en | Apache-2.0 | Meta-World (simulacion) |
| lerobot/smolvla_metaworld (base) | 450 M | no disponible | en (principalmente) | Apache-2.0 | Meta-World (simulacion) |
| SmolVLA original (Shukor et al., 2025) | ~450 M | no disponible | no disponible | no disponible en la informacion | Tareas de manipulacion generales |

No se dispone de datos de benchmarks comparativos con otros modelos VLA multilingües en la información proporcionada.

## Limitaciones y advertencias

- Solo simulación: entorno Meta-World, brazo Sawyer y una única cámara; no probado en robot físico, por lo que cabe esperar una brecha sim-to-real.
- Muestras pequeñas: 20 episodios por fila, de modo que diferencias de pocos episodios no son estadísticamente significativas (los intervalos al 95 % se solapan en varios casos).
- Vocabulario turco limitado a 30 frases; las paráfrasis no vistas funcionan solo parcialmente (7/20 en el caso documentado).
- Olvido parcial del inglés: en `push-v3` el rendimiento baja de 16/20 a 11/20 tras el fine-tuning, aunque la dirección del efecto es clara pese a la superposición de intervalos.
- Dependencia del texto de la tarea: en tareas donde la imagen ya describe casi todo (como abrir el cajón), el idioma importa menos y las diferencias son menores.
- Modelo de investigación: el autor lo declara no apto para usos relacionados con la seguridad.
- Riesgo de alucinación y sesgos: no se documentan análisis específicos en la información disponible.
- Licencia Apache-2.0 para los pesos, compatible con uso comercial, pero el dataset de entrenamiento es CC BY 4.0 y Meta-World es MIT, por lo que deben respetarse las atribuciones correspondientes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mvdelibas/smolvla-metaworld-tr-v1
- Dataset de entrenamiento: https://huggingface.co/datasets/mvdelibas/tr-robot-gosterim-metaworld-v1
- Modelo base: https://huggingface.co/lerobot/smolvla_metaworld
- Vídeo de comparación antes/después: https://huggingface.co/mvdelibas/smolvla-metaworld-tr-v1/resolve/main/assets/once_sonra_tr.mp4
- Referencia SmolVLA: Shukor et al., 2025 (citado en la model card; sin enlace directo en la información disponible)
- Meta-World: https://meta-world.github.io (entorno de simulación citado; enlace no incluido explícitamente en la model card)
