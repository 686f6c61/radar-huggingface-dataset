# agents2agents/MolmoAct2-LIBERO-Jetson-Thor

## Resumen

MolmoAct2-LIBERO-Jetson-Thor es un paquete de motores TensorRT precompilados que permite ejecutar el modelo de razonamiento de acción `allenai/MolmoAct2-LIBERO` en el dispositivo de borde NVIDIA Jetson AGX Thor. Lo publica el equipo de Agents2Agents, que también mantiene el framework de inferencia `vla-edge`. El paquete incluye los motores fijos de 704 tokens, una opción de visión FP8 y los pesos del procesador, normalización y flujo, de modo que el despliegue es completamente local y no requiere descargar el checkpoint original.

El modelo base, MolmoAct2, es una familia abierta de modelos de razonamiento de acción para control robótico desarrollada por el Allen Institute for AI (Ai2). Se construye sobre el backbone de visión-lenguaje Molmo2-ER, especializado en razonamiento espacial y encarnado, y lo conecta a un experto de acción continua basado en flow matching. Esta versión específica para Jetson Thor está optimizada para la suite de evaluación LIBERO, donde alcanza un 97,2 % de éxito global con el motor de visión FP8, igualando el resultado del paper original dentro del ruido de muestreo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLM + experto de acción por flow matching) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 704 tokens fijos (según los motores incluidos) |
| Tipos de cuantizacion | FP8 (motor de visión opcional), resto en precisión nativa TensorRT |
| Idiomas soportados | no disponible (modelo orientado a tareas robóticas, no a diálogo) |
| Licencia | Apache-2.0 |
| Formato de pesos | TensorRT engines (plan files) + pesos del host en formato propio de vla-edge |

## Arquitectura y entrenamiento

El modelo base MolmoAct2 se describe en el paper arXiv 2605.02881. Utiliza un backbone VLM llamado MolmoER, entrenado con un corpus de 3,3 millones de muestras mediante una receta de "especializar y ensayar". El VLM procesa imágenes y lenguaje, y sus salidas se conectan a un experto de acción continua basado en flow matching, que genera comandos de control para el robot. Existe una variante llamada MolmoAct2-Think que añade razonamiento de profundidad adaptativa, aunque no se especifica si esta versión para Jetson la incluye.

El paquete de Agents2Agents convierte los pesos del checkpoint original en motores TensorRT optimizados para la arquitectura del Jetson AGX Thor. La conversión no cambia los parámetros del modelo, solo la forma de ejecución. El bundle incluye motores para la parte de visión (con opción FP8), el procesador de lenguaje, la normalización y los pesos del flujo de acción. El arranque ejecuta una fase de warmup que compila todas las etapas.

## Capacidades

- Control robótico de manipulación: genera acciones de posición y orientación del efector final a partir de observaciones visuales y del estado del robot.
- Razonamiento de acción encarnado: combina comprensión visual y lingüística con modelado de estado y acción para tareas de manipulación.
- Ejecución en bucle cerrado: el modelo recibe imágenes (cámara principal y cámara de muñeca) y un vector de estado de ocho valores, y produce acciones continuas.
- Inferencia en el borde: optimizado para ejecutarse en Jetson AGX Thor con TensorRT, sin dependencia de la nube.
- Integración con vla-edge: compatible con el framework de Agents2Agents para servir el modelo mediante una API que acepta dos imágenes y el vector de estado.
- Evaluación en LIBERO: validado en la suite LIBERO con un 97,2 % de éxito global, lo que demuestra su capacidad para tareas de manipulación de largo horizonte.

## Casos de uso

- Manipulación robótica en entornos de investigación: el modelo puede controlar un brazo robótico en tareas de la suite LIBERO, como recoger y colocar objetos, abrir cajones o apilar bloques, con una precisión del 97,2 % en evaluación.
- Prototipado rápido de políticas robóticas: al estar precompilado para Jetson Thor, permite desplegar una política de aprendizaje por imitación sin necesidad de entrenar desde cero, reduciendo el tiempo de puesta en marcha.
- Robótica de bajo coste en el borde: el Jetson AGX Thor es un dispositivo de gama alta, pero el paquete demuestra que es posible ejecutar modelos de acción razonamiento en hardware de borde, lo que habilita aplicaciones en laboratorios sin acceso a GPUs de servidor.
- Evaluación reproducible de políticas: el bundle incluye checksums y un manifiesto de compatibilidad, lo que facilita reproducir los resultados de la evaluación de 2.000 episodios publicada por Agents2Agents.
- Integración en sistemas de teleoperación asistida: el modelo puede generar acciones sugeridas en tiempo real a partir de la observación visual, ayudando a operadores humanos en tareas de manipulación remota.
- Desarrollo de nuevas capacidades robóticas sobre vla-edge: los motores sirven como base para experimentar con variantes del modelo o para integrar el control robótico en pipelines más amplios de automatización.

## Benchmarks y rendimiento

Según la model card, con el motor de visión FP8 habilitado, el modelo obtuvo un **97,2 % de éxito global** en la evaluación de 2.000 episodios de LIBERO, igualando el resultado del paper de MolmoAct2 dentro del ruido de muestreo. No se proporcionan desgloses por subconjunto en la información disponible.

| Benchmark | Resultado |
|---|---|
| LIBERO (overall, 2000 episodios, FP8 vision) | 97,2 % |

No se han publicado otros benchmarks en la información disponible.

## Requisitos de hardware

- Hardware mínimo: NVIDIA Jetson AGX Thor Developer Kit.
- Software: JetPack R39 rev 2.1 y TensorRT 10.16.2.10.
- Tamaño del paquete: 10,5 GB (descarga local).
- VRAM: no especificada, pero el Jetson AGX Thor dispone de memoria unificada; los motores están diseñados para caber en ese dispositivo.
- GPU: exclusivo para Jetson AGX Thor; no se menciona compatibilidad con otras GPUs.
- Opciones de despliegue: framework `vla-edge` con backend TensorRT, comando `vla-edge-serve --embodiment libero --backend tensorrt --engine-dir ... --fast-vision`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este paquete con alternativas equivalentes. El modelo base MolmoAct2 se puede comparar con otros modelos de acción razonamiento como OpenVLA o RT-2, pero no se han encontrado datos concretos en la búsqueda web para establecer una comparación rigurosa. Se indica "no disponible".

## Limitaciones y advertencias

- El paquete está diseñado exclusivamente para Jetson AGX Thor con una versión concreta de JetPack y TensorRT; no funcionará en otras plataformas sin recompilar los motores.
- La ejecución requiere el framework `vla-edge`; no es un modelo autónomo que se pueda cargar con librerías estándar como Transformers.
- El modelo base está especializado en tareas de manipulación robótica y no está pensado para diálogo general ni para otras modalidades.
- No se especifican sesgos conocidos ni riesgos de alucinación, pero al ser un modelo de control, cualquier error de predicción puede traducirse en movimientos no deseados del robot; se recomienda supervisión humana en entornos reales.
- La licencia Apache-2.0 permite uso comercial, pero los pesos del modelo base provienen de Ai2 bajo la misma licencia; se debe revisar el aviso NOTICE incluido en el paquete.
- El tamaño del repositorio (10,5 GB) puede suponer un reto para redes con ancho de banda limitado, aunque la verificación de checksums garantiza la integridad de la descarga.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agents2agents/MolmoAct2-LIBERO-Jetson-Thor
- Modelo base en HuggingFace: https://huggingface.co/allenai/MolmoAct2-LIBERO
- Paper MolmoAct2 (arXiv): https://arxiv.org/abs/2605.02881
- PDF del paper: https://arxiv.org/pdf/2605.02881
- Repositorio oficial de MolmoAct2 (GitHub): https://github.com/allenai/molmoact2
- Framework vla-edge (GitHub): https://github.com/Agents2AgentsAI/vla-edge
- Blog de Agents2Agents sobre el rendimiento en Jetson Thor: https://agents2agents.ai/blog/molmoact2-jetson-thor
