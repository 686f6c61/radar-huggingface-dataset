# leapshared/sciedu_bench_props8_pi05_10k

## Resumen

`sciedu_bench_props8_pi05_10k` es una política de visión-lenguaje-acción (VLA) publicada por el usuario `leapshared` en Hugging Face, basada en la arquitectura π₀.₅ (Pi05) de Physical Intelligence y empaquetada con la librería LeRobot de Hugging Face. No se trata de un modelo de lenguaje generalista, sino de un checkpoint de robótica entrenado por imitación para ejecutar tareas de manipulación sobre un robot simulado de tipo `openarm_sciedu_sim`, con tres cámaras (una frontal `follower_d455f` y dos de muñeca) y un vector de estado/acción de 16 dimensiones.

El modelo resuelve el problema de mapear observaciones multimodales (tres flujos de imagen de 480x640 y un estado proprioceptivo de 16 valores) a comandos motores de 16 dimensiones, condicionado por una instrucción en lenguaje natural. Se ha entrenado durante 10.000 pasos con batch de 32 sobre el dataset `leapshared/sciedu_bench_v2_sim_props8_all`, compuesto por 2.365 episodios y 1.438.051 fotogramas a 30 FPS. Las tareas cubren experimentos de física y geología simulados: frotar una varilla en piel para cargar un electroscopio, manipular hojas de oro, trasvasar placas metálicas entre vasos de precipitados, rayar minerales en placa de raya o aplicar ácido con un cuentagotas.

Es relevante ahora porque ejemplifica el flujo actual de publicación de políticas robóticas abiertas: checkpoints derivados de modelos fundacionales (π₀.₅ / OpenPI) reentrenados con LeRobot sobre datasets de simulación específicos, con un peso de 4.143.404.816 parámetros y un repositorio de 16,6 GB en safetensors. Su valor práctico está acotado al benchmark SciEdu y al robot simulado para el que fue entrenado; no es un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) π₀.₅ (Pi05), implementación LeRobot adaptada de OpenPI |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones del dataset están en inglés) |
| Licencia | no disponible (la model card indica "More Information Needed") |
| Formato de pesos | safetensors (librería lerobot) |
| Tipo de robot | `openarm_sciedu_sim` |
| Cámaras de entrada | `follower_d455f`, `left_wrist`, `right_wrist` (3 x 480 x 640) |
| Dimensión de estado | 16 |
| Dimensión de acción | 16 |
| Pasos de entrenamiento | 10.000 |
| Batch size | 32 |
| Optimizador | AdamW |
| Learning rate | 2,5e-05 |
| Semilla | 1000 |
| Versión de LeRobot | 0.7.0 |
| Tamaño del repositorio | 16,6 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura π₀.₅ de Physical Intelligence, un VLA que evoluciona π₀ para generalizar a entornos y situaciones no vistos durante el entrenamiento. La implementación concreta de este checkpoint es la de LeRobot, adaptada del repositorio OpenPI de Physical Intelligence. La política consume tres flujos visuales (cámara frontal y dos cámaras de muñeca, todas a 480x640 con 3 canales) junto con un vector de estado de 16 dimensiones, y produce un vector de acción de 16 dimensiones condicionado por una instrucción textual de la tarea.

El entrenamiento es de imitación supervisada sobre el dataset `leapshared/sciedu_bench_v2_sim_props8_all`: 2.365 episodios, 1.438.051 fotogramas a 30 FPS, con 30 tareas descritas en lenguaje natural. La configuración reportada es de 10.000 pasos, batch 32, AdamW con learning rate 2,5e-05 y semilla 1000, ejecutada con LeRobot 0.7.0. No se documenta en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset más allá del recuento de episodios y fotogramas, ni si se aplicaron fases de RLHF o DPO (poco habituales en imitación robótica). Tampoco se detallan innovaciones técnicas específicas de esta instancia más allá de las propias de π₀.₅.

## Capacidades

- Generación de acciones motoras de 16 dimensiones a partir de observaciones visuales y proprioceptivas, condicionada por instrucciones en lenguaje natural.
- Percepción visual multi-cámara: procesa simultáneamente una vista frontal y dos vistas de muñeca a 480x640.
- Ejecución de tareas de manipulación de precisión en simulación: frotar, levantar, trasvasar, rayar, aplicar gotas, señalar y sostener objetos.
- Seguimiento de instrucciones de tarea de grano fino (30 tareas distintas documentadas en el dataset).
- Control de postura de retorno a home y secuencias multi-paso dentro de una misma tarea.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso genérico, modo thinking, visión generalista, audio ni capacidades multilingües más allá del inglés de las instrucciones de entrenamiento.

## Casos de uso

- Automatización de experimentos de electrostática en simulación: la política ejecuta la secuencia completa de coger la varilla negra, frotarla con piel, acercarla y alejarla del electroscopio y dejarla en el soporte, adecuada porque ha sido entrenada específicamente sobre esas instrucciones y ese robot simulado.
- Manipulación de láminas metálicas en prácticas de química: levantar la placa del vaso izquierdo, moverla sobre la disolución azul y sumergirla, aprovechando la coordinación bimanual implícita en las 16 dimensiones de acción.
- Protocolos de geología simulados: coger minerales con la mano izquierda, rayar en placa de raya y aplicar ácido con cuentagotas, gracias a que el dataset incluye episodios de esas tareas con las tres cámaras.
- Generación de datos sintéticos de demostración: ejecutar la política en bucle con `lerobot-rollout` para producir trayectorias etiquetadas que alimenten un dataset mayor o sirvan de referencia visual.
- Evaluación comparativa de políticas VLA: usar este checkpoint como línea base de π₀.₅ entrenada 10.000 pasos sobre SciEdu para medir el efecto de cambios en datos, hiperparámetros o arquitectura.
- Investigación en imitación con múltiples cámaras: estudiar cómo contribuyen las vistas de muñeca frente a la frontal en tareas de precisión, ya que el modelo expone explícitamente esos tres flujos de entrada.
- Reproducción de experimentos docentes: desplegar el robot `openarm_sciedu_sim` con instrucciones del catálogo para demostraciones de laboratorio virtual reproducibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4.143.404.816 parámetros, en FP16/BF16 se requieren aproximadamente 8,3 GB solo para pesos; en FP32, unos 16,6 GB. A ello hay que sumar el coste de procesar tres imágenes de 480x640 por paso y el estado del codificador visual, por lo que conviene reservar al menos 12-16 GB en FP16.
- GPU recomendadas: A100, H100 o L40S para despliegue estable con margen; RTX 4090 (24 GB) es suficiente para FP16 en inferencia de una sola política.
- GPU de consumo: cabe en RTX 4090 y, con cuantización agresiva no documentada para este checkpoint, potencialmente en GPUs de 16 GB; no se confirma soporte de cuantización en la información disponible.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path=leapshared/sciedu_bench_props8_pi05_10k`), y el stack OpenPI del que deriva la implementación. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este checkpoint.
- Latencia y throughput: no disponibles. El control se ejecuta a la frecuencia del robot simulado (dataset a 30 FPS), pero no se publican cifras de latencia por paso ni de throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `leapshared/sciedu_bench_props8_pi05_10k` | 4.143.404.816 | no disponible | VLA π₀.₅ (LeRobot) | no disponible | Hugging Face |
| π₀.₅ (Pi05) original de Physical Intelligence | no disponible | no disponible | VLA | no disponible en la información | Blog y OpenPI |
| π₀ (Pi0) de Physical Intelligence | no disponible | no disponible | VLA | no disponible en la información | OpenPI |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada; la comparación se limita a la procedencia arquitectónica y a la disponibilidad del checkpoint.

## Limitaciones y advertencias

- El checkpoint está entrenado exclusivamente para el robot simulado `openarm_sciedu_sim` con tres cámaras concretas; no es transferible sin reentrenamiento a otro hardware o configuración de sensores.
- Las 30 tareas del dataset son el universo de instrucciones para el que se ha entrenado; fuera de ese catálogo el comportamiento no está garantizado.
- Solo se ha validado en simulación según la información disponible; no hay evidencia de robustez en robot real.
- Licencia no especificada: la model card indica "More Information Needed", por lo que el uso comercial queda sin autorización clara y debe tratarse como restringido hasta confirmación del autor.
- Riesgo de alucinación de acciones: al ser una política de imitación, puede generar trayectorias plausibles pero incorrectas ante observaciones fuera de distribución, sin señal de incertidumbre documentada.
- Sesgos: no documentados; el dataset cubre tareas de laboratorio muy específicas y no representa variabilidad de entornos, iluminación u objetos.
- Idiomas: las instrucciones de entrenamiento están en inglés; no se documenta soporte multilingüe.
- Sin métricas de evaluación publicadas: no hay tasas de éxito ni comparaciones cuantitativas que permitan juzgar la calidad del checkpoint.
- Repositorio de 16,6 GB: requiere espacio en disco y ancho de banda considerables para descarga y despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/leapshared/sciedu_bench_props8_pi05_10k
- Dataset de entrenamiento: https://huggingface.co/datasets/leapshared/sciedu_bench_v2_sim_props8_all
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=leapshared/sciedu_bench_v2_sim_props8_all
- Blog de π₀.₅ (Pi05): https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI: https://github.com/Physical-Intelligence/openpi
- LeRobot: https://github.com/huggingface/lerobot
- Guía LeRobot pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
