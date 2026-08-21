# ImKyungjin/pi0-stackcube-two-focus-noise-60pct-40ep

## Resumen

Este modelo es un ajuste fino de π₀ (Pi0), el modelo fundacional de control robótico de tipo visión-lenguaje-acción (VLA) desarrollado por Physical Intelligence, adaptado mediante la librería LeRobot de Hugging Face. El entrenamiento se ha realizado sobre el dataset `taewonkoo/stack_cube_two_focus_noise_60pct_40ep`, que corresponde a una tarea de apilado de cubos con dos puntos de enfoque y un nivel de ruido aplicado al 60 % de los episodios, durante 40 épocas.

Pi0 se basa en un VLM (PaliGemma) con un experto de acciones entrenado mediante flow matching, lo que le permite heredar el conocimiento semántico y de razonamiento de los modelos de lenguaje y visión-lenguaje. Con 3.501.372.176 parámetros, este ajuste concreto se centra en la tarea de apilado de cubos con perturbaciones de ruido, un escenario de evaluación de robustez en control robótico.

La relevancia de este modelo radica en que demuestra el flujo de trabajo completo de ajuste fino de un VLA generalista a una tarea específica, con un pipeline reproducible basado en LeRobot. Su licencia Apache 2.0 permite uso comercial y modificación sin restricciones, lo que facilita su integración en proyectos de investigación y desarrollo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basado en VLM PaliGemma con experto de acciones por flow matching |
| Parametros totales | 3.501.372.176 (~3,5 mil millones) |
| Parametros activos | no disponible (modelo denso, sin arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

π₀ es un modelo VLA que combina un modelo de visión-lenguaje preentrenado (PaliGemma) con un experto de acciones generado mediante flow matching. En lugar de una decodificación autoregresiva convencional, la generación de acciones se modela como un proceso de flujo continuo, lo que permite emitir acciones de alta frecuencia adecuadas para el control robótico en tiempo real. Esta arquitectura hereda del VLM las capacidades de comprensión semántica y razonamiento sobre escenas visuales.

El ajuste fino se ha realizado con LeRobot sobre un dataset de apilado de cubos con dos puntos de enfoque y ruido aplicado al 60 % de los episodios, durante 40 épocas. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni el uso de técnicas de RLHF o DPO. El tamaño del repositorio (7,0 GB) es coherente con pesos en bf16 para 3,5 mil millones de parámetros.

## Capacidades

- Control robótico de manipulación: genera acciones de alta frecuencia para tareas de apilado de objetos.
- Comprensión de instrucciones en lenguaje natural: al heredar las capacidades del VLM PaliGemma, puede interpretar órdenes del tipo "apila el cubo rojo sobre el azul".
- Percepción visual: procesa imágenes de cámaras para estimar el estado de la escena y planificar acciones.
- Generación de acciones mediante flow matching: permite control fino con latencia reducida frente a métodos autoregresivos.
- Robustez ante perturbaciones: el entrenamiento con ruido al 60 % de los episodios busca mejorar la tolerancia a interferencias externas en la tarea.
- No se documentan capacidades de tool calling, function calling, ni razonamiento multi-paso específicas para este ajuste.

## Casos de uso

- Evaluación de robustez en laboratorio: el modelo sirve para estudiar cómo una política entrenada con ruido al 60 % responde ante perturbaciones físicas durante el apilado, permitiendo cuantificar la degradación del rendimiento frente a perturbaciones inesperadas.
- Benchmark de aprendizaje por imitación en manipulación: la tarea de apilado de cubos es un estándar en robótica para evaluar precisión de control fino, y este ajuste permite comparar la política Pi0 con otras basadas en ACT o diffusion policy sobre el mismo dataset.
- Investigación en flow matching aplicado a control: el modelo es un caso práctico de generación de acciones mediante flujo continuo, útil para comparar con políticas autoregressivas en términos de latencia y suavidad de trayectorias.
- Validación de pipelines de entrenamiento con LeRobot: al estar publicado con la librería LeRobot, puede usarse como referencia para reproducir el flujo de entrenamiento y evaluación en otros datasets.
- Prototipado de aplicaciones de automatización: con licencia Apache 2.0, se puede integrar en un entorno de automatización comercial para tareas de manipulación de objetos en entornos controlados.
- Estudio de políticas de recuperación: el dataset incluye episodios de recuperación (recover) que permiten analizar cómo el modelo corrige errores durante la ejecución de la tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo es un ajuste fino para una tarea específica y no se proporcionan métricas de éxito, error de acciones ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 3,5 mil millones de parámetros en bf16, los pesos ocupan aproximadamente 7 GB. Con activaciones y estado de ejecución, se estima un mínimo de 10 a 12 GB de VRAM para inferencia sin cuantización.
- GPU recomendadas: para inferencia en tiempo real, se recomienda una GPU con al menos 16 GB de VRAM (RTX 4080, RTX 4090, A10G, L4). Para entrenamiento, una A100 (40 GB) o H100.
- Compatibilidad con GPU de consumo: sí, es posible ejecutar el modelo en una RTX 4090 (24 GB) sin cuantización, o en tarjetas de 12 GB si se aplica cuantización (FP8 o INT8), aunque no se documentan cuantizaciones oficiales.
- Opciones de despliegue: LeRobot (motor de entrenamiento e inferencia principal), y el motor de inferencia en tiempo real FlashRT, que soporta modelos VLA como Pi0 con baja latencia.
- Latencia y throughput: no disponibles en la información. Para control robótico en tiempo real, se recomienda un motor de inferencia optimizado como FlashRT para alcanzar frecuencias de control de 10-30 Hz.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Tarea |
|---|---|---|---|---|
| ImKyungjin/pi0-stackcube-two-focus-noise-60pct-40ep (este modelo) | ~3,5 B | no disponible | Apache 2.0 | Apilado de cubos, dos focos, ruido 60 % |
| ImKyungjin/pi0-stackcube-recover-noise-40pct-40ep | ~3,5 B | no disponible | Apache 2.0 | Apilado de cubos con recuperación, ruido 40 % |
| ImKyungjin/pi0-stackcube-recover-noise-60pct-40ep | ~3,5 B | no disponible | Apache 2.0 | Apilado de cubos con recuperación, ruido 60 % |

Las tres variantes comparten la misma arquitectura y tamaño de parámetros; la diferencia principal es el nivel de ruido (40 % frente a 60 %) y la inclusión o no de episodios de recuperación en el dataset de entrenamiento.

## Limitaciones y advertencias

- Especialización limitada: el modelo está entrenado para una tarea concreta de apilado de cubos; no es un VLA generalista y no se debe esperar que funcione en otras tareas sin ajuste adicional.
- Sin datos de validación: no hay métricas publicadas de éxito ni comparaciones con otras políticas, por lo que no se puede evaluar su rendimiento real.
- Riesgo de alucinación de acciones: al estar basado en un VLM, puede generar acciones incoherentes si la entrada visual o la instrucción es ambigua o fuera de distribución.
- Idiomas no garantizados: no se documentan idiomas soportados; las instrucciones en español o otros idiomas pueden no ser interpretadas correctamente.
- Validación de seguridad necesaria: al tratarse de un modelo de control robótico, es imprescindible validar el comportamiento en un entorno simulado o con supervisión antes de desplegarlo en un robot físico.
- Dependencia de la cadena de herramientas: el uso del modelo requiere LeRobot y su ecosistema; la integración con otros frameworks puede requerir conversión de pesos.

## Enlaces

- Página del modelo en Hugging Face: https://huggingface.co/ImKyungjin/pi0-stackcube-two-focus-noise-60pct-40ep
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio de LeRobot en GitHub: https://github.com/huggingface/lerobot
- Blog de Physical Intelligence sobre π₀: https://www.physicalintelligence.company/blog/pi0
- Paper de π₀ en arXiv: https://arxiv.org/html/2410.24164v1
- Motor de inferencia FlashRT (VLA en tiempo real): https://github.com/flashrt-project/FlashRT
- Dataset de entrenamiento: https://huggingface.co/datasets/taewonkoo/stack_cube_two_focus_noise_60pct_40ep
