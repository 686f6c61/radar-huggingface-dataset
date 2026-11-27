# mradermacher/SenseNova-RoboRSI-27B-GGUF

## Resumen

SenseNova-RoboRSI-27B es un modelo vision-language (VLM) orientado a robótica y IA encarnada (embodied AI), desarrollado originalmente por SenseNova y distribuido en formato GGUF por el cuantizador mradermacher. El modelo resuelve el problema de conectar percepción visual con generación de políticas de control robótico mediante el paradigma "code-as-policy", es decir, producir código ejecutable que actúa como plan de acción del robot. Su enfoque de "recursive self-improvement" (RSI) sugiere un entrenamiento iterativo donde el propio modelo refina sus políticas a partir de retroalimentación.

Con aproximadamente 26.900 millones de parámetros (26.895.998.464 según los safetensors del modelo base), se sitúa en la franja de modelos de 27B, un tamaño que permite despliegue en hardware de gama alta de consumo mediante cuantización agresiva. La versión aquí descrita es una conversión estática a GGUF que incluye tanto los pesos del modelo de lenguaje como los ficheros mmproj necesarios para el procesamiento multimodal.

Es relevante ahora porque combina tres tendencias activas: modelos de lenguaje que actúan como agentes, integración de visión para tareas físicas y el formato GGUF como vía de democratización del despliegue local. La licencia Apache 2.0 facilita su uso comercial, aunque la información pública sobre arquitectura interna, contexto y datos de entrenamiento es escasa en la model card disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (vision-language model; detalles internos no publicados en la model card) |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (segun metadatos de la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); modelo base en safetensors |

## Arquitectura y entrenamiento

La model card del repositorio GGUF no detalla la arquitectura interna del modelo base. Los metadatos lo etiquetan como vision-language-model con capacidades de embodied-ai, agent, code-as-policy y recursive-self-improvement, lo que indica que combina un codificador visual con un modelo de lenguaje para producir políticas de control expresadas como código. El término "RSI" (recursive self-improvement) apunta a un esquema de entrenamiento iterativo en el que el modelo genera y evalúa sus propias trayectorias o políticas para mejorar sucesivamente.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones concretas como decodificación especulativa o atención lineal. Los ficheros mmproj (Q8_0 y f16) confirman la presencia de un proyector multimodal necesario para procesar imágenes junto al texto, pero sus dimensiones y arquitectura no se especifican.

## Capacidades

- Generación de texto y razonamiento multimodal a partir de entradas de imagen y texto.
- Comprensión de escenas visuales orientada a robótica (percepción de objetos y entorno).
- Generación de políticas como código (code-as-policy): el modelo produce código ejecutable que describe la acción del robot.
- Capacidades de agente con razonamiento multi-paso, según las etiquetas agent y embodied-ai.
- Auto-mejora recursiva (recursive-self-improvement) como rasgo declarado del entrenamiento.
- Soporte de conversación multi-turno (tag conversational).
- Compatibilidad con endpoints (tag endpoints_compatible) para despliegue como servicio.
- Idiomas: inglés únicamente según los metadatos disponibles.

## Casos de uso

- Planificación de tareas robóticas en manipulación: el modelo recibe una imagen del entorno y un objetivo en lenguaje natural, y genera código de política que un stack de control (por ejemplo, ROS) puede ejecutar para mover un brazo o una pinza.
- Generación de scripts de control para simulación: integrado en entornos como Isaac Sim o MuJoCo, el modelo traduce instrucciones a código Python que define trayectorias y condiciones de parada, acelerando el prototipado de políticas antes de transferirlas al robot real.
- Asistente de depuración de políticas existentes: dado un fragmento de código de control y una imagen del fallo, el modelo razona sobre la discrepancia entre la percepción y la acción esperada y propone correcciones.
- Automatización de tareas de inspección visual: el modelo analiza imágenes de una línea de producción y genera código que describe rutinas de detección o señalización de anomalías.
- Investigación en IA encarnada: sirve como base para experimentos de code-as-policy y self-improvement, permitiendo comparar políticas generadas por el modelo con políticas aprendidas por refuerzo clásico.
- Despliegue local en laboratorio: gracias a las cuantizaciones Q4_K_M (16,8 GB) y Q5_K_M (19,4 GB), puede ejecutarse en una estación de trabajo con una sola GPU de 24 GB para experimentación sin depender de la nube.
- Generación de documentación técnica de robots: a partir de imágenes del montaje y del código de control, el modelo redacta guías de operación o procedimientos de mantenimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamaño del fichero GGUF más el overhead del contexto y del proyector multimodal. Orientativamente: Q2_K ~11,2 GB, Q4_K_M ~16,8 GB, Q5_K_M ~19,4 GB, Q8_0 ~28,7 GB, más 0,7-1,0 GB del mmproj.
- GPU recomendadas: A100 40/80 GB o H100 para Q8_0 y contextos largos; RTX 4090 (24 GB) para Q4_K_M y Q5_K_M con margen; RTX 3090 (24 GB) igualmente válida para Q4/Q5.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con Q4_K_M o Q5_K_M; en GPUs de 16 GB solo con Q2_K o Q3_K_S y contexto reducido.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, y servidores compatibles con endpoints (el modelo lleva el tag endpoints_compatible). Para el modelo base en safetensors, vLLM o TGI si el soporte multimodal está disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| SenseNova-RoboRSI-27B (este) | ~26,9B | no disponible | Apache 2.0 | GGUF, safetensors | VLM para robótica, code-as-policy |
| Modelos VLM generalistas de ~27B (p. ej. familia Qwen2.5-VL-32B) | ~32B | hasta 128K en algunas variantes | Apache 2.0 en varias variantes | safetensors, GGUF | Uso general, no especializados en robótica |
| Modelos de robótica open source de menor tamaño (p. ej. variantes de OpenVLA) | ~7B | no disponible | varía | safetensors | Específicos de manipulación, no code-as-policy |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa fiable con alternativas. La comparativa anterior es orientativa por categoría y tamaño, no por rendimiento medido.

## Limitaciones y advertencias

- La model card del repositorio GGUF no documenta sesgos conocidos; al ser un modelo entrenado principalmente en inglés, el rendimiento en castellano no está garantizado.
- Riesgo de alucinación inherente a los modelos generativos: el código de política producido puede ser sintácticamente válido pero semánticamente incorrecto, con riesgo físico en robots reales. Requiere validación en simulación y supervisión humana antes de ejecución.
- Idiomas: solo inglés según los metadatos; no se declara soporte multilingüe.
- Longitud de contexto no documentada, lo que dificulta planificar tareas de largo horizonte.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base podría tener condiciones adicionales no reflejadas en la conversión GGUF; conviene verificar el repositorio original.
- Las cuantizaciones Q2_K y Q3_K_S degradan la calidad y pueden afectar especialmente a la coherencia del código generado; se recomienda Q4_K_M o superior para producción.
- No hay información sobre latencia, throughput ni precisión de las cuantizaciones frente al modelo original.
- El repositorio tiene muy pocas interacciones (1 like) y fue creado recientemente; la madurez y el soporte de la comunidad son limitados.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/SenseNova-RoboRSI-27B-GGUF
- Modelo base: https://huggingface.co/sensenova/SenseNova-RoboRSI-27B
- Página de descargas del cuantizador: https://hf.tst.eu/model#SenseNova-RoboRSI-27B-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (referencia TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
