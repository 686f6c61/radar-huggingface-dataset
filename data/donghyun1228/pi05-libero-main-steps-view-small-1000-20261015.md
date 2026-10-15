# Donghyun1228/pi05-libero-main-steps-view-small-1000-20261015

## Resumen

Este repositorio contiene un checkpoint de investigación derivado de π₀.₅ (pi05), el modelo Vision-Language-Action (VLA) de Physical Intelligence, adaptado mediante la librería openpi al benchmark de robótica LIBERO. La variante concreta, identificada como `main-steps-view-small-1000`, corresponde a un punto intermedio de un entrenamiento concreto: 1000 actualizaciones completadas (paso crudo 999) extraídas de una única trayectoria continua de 5000 actualizaciones. El autor, Donghyun1228, lo publica como parte de un estudio comparativo sobre recetas de entrenamiento en transferencia de conocimiento para manipulación robótica multitarea.

El modelo no es un sistema de propósito general, sino una pieza de un experimento controlado. Según la propia model card, se congela el LLM, se aplica un multiplicador de visión de 1 y un multiplicador de LoRA de acción de 0.1, con entrenamiento exclusivo de un módulo de dinámica inversa (IDM-only). El despliegue es "raw non-EMA" con muñeca de origen y normalización original. Se emplea FSDP2, batch 32, semilla 42, warmup de 500 pasos y un pico de learning rate de 1e-5.

La relevancia de este checkpoint es metodológica más que de producto: permite analizar cómo evoluciona el rendimiento a lo largo de los pasos de entrenamiento manteniendo constante todo lo demás (mismos datos, misma trayectoria, mismos hiperparámetros). El autor declara explícitamente que la evaluación está pendiente y que no se reclama ninguna tasa de éxito.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ (pi05) con cabeza de acción flow-matching y módulo de dinámica inversa (IDM) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en 6.9 GB, probablemente bfloat16 en safetensors, sin confirmar) |
| Idiomas soportados | no disponible (el componente de lenguaje estaría congelado durante el entrenamiento) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible explícitamente; librería `openpi`, tamaño de repo 6.9 GB |

## Arquitectura y entrenamiento

El modelo parte de π₀.₅ (pi05), una arquitectura VLA de Physical Intelligence que combina un modelo de lenguaje y visión preentrenado con una cabeza de acción basada en flow-matching. En este checkpoint concreto, el LLM se mantiene congelado y solo se entrena un módulo de dinámica inversa (inverse dynamics model, IDM) con una LoRA aplicada a la parte de acción con multiplicador 0.1. La visión opera con multiplicador 1 y se preserva la configuración de origen para la cámara de muñeca.

Los detalles de entrenamiento documentados son: receta principal de comparación por paso de entrenamiento, `view_small`, 1000 actualizaciones completadas (paso crudo 999) muestreadas de una trayectoria continua de 5000 actualizaciones. Se usan datos de contacto denso existentes y pre-adaptación original; entrenamiento nativo identificado como `622c8d28`, batch 32, semilla 42, FSDP2. Warmup de 500 pasos, pico y valor final de 1e-5, modo IDM-only. El despliegue es raw non-EMA con muñeca de origen y normalización original. Los tres checkpoints de comparación comparten la misma trayectoria de entrenamiento y los pesos congelados de origen están verificados de forma independiente.

La innovación metodológica es la comparación controlada: solo cambian el número total de actualizaciones, los pasos de checkpoint retenidos y las rutas de salida.

## Capacidades

- Control robótico de manipulación en tareas del benchmark LIBERO (entorno de estudio de transferencia de conocimiento multitarea y lifelong learning).
- Predicción de acciones mediante dinámica inversa (IDM), es decir, inferir acciones a partir de estados observados.
- Ejecución con cabeza de acción flow-matching, que es la única componente que π₀.₅ soporta actualmente para entrenamiento e inferencia según la documentación de LeRobot.
- Procesamiento de observaciones visuales multimodales, incluyendo cámara base y cámara de muñeca (wrist).
- Condicionamiento por instrucciones de la tarea en el dominio objetivo.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, razonamiento en lenguaje natural, código, matemáticas, visión general, audio ni modo "thinking". El LLM está congelado y el alcance es exclusivamente robótico.

## Casos de uso

- Investigación en transferencia de conocimiento robótico: el checkpoint sirve para estudiar cómo varía el comportamiento del modelo entre el paso 999 y otros puntos de la misma trayectoria de 5000 actualizaciones, manteniendo constantes datos e hiperparámetros.
- Análisis de estrategias de adaptación eficiente: al congelar el LLM y entrenar solo un IDM con LoRA de acción a 0.1, permite medir el impacto de adaptar únicamente componentes ligeros frente a ajustes completos.
- Reproducción de experimentos en LIBERO: el repositorio asociado `Donghyun1228/LIBERO_view` está orientado a estudiar retención y olvido en aprendizaje multitarea y lifelong, por lo que este checkpoint puede usarse como punto de referencia en dichos protocolos.
- Comparación de configuraciones de visión (`view_small` frente a `view_large`): el autor publica variantes con distintos tamaños de vista visual, lo que facilita estudios ablativos sobre la representación visual.
- Docencia y divulgación sobre modelos VLA: sirve como ejemplo reproducible de un pipeline openpi con FSDP2, LoRA y congelación de LLM, útil para explicar arquitecturas VLA en entornos académicos.
- Integración en pipelines de evaluación robótica en simulación: al estar etiquetado para LIBERO y usar la librería openpi, puede cargarse en herramientas compatibles para lanzar evaluaciones automáticas, siempre que el usuario aporte el entorno y la configuración de simulación.
- Punto de partida para fine-tuning posterior: dado que la licencia es Apache 2.0 y no hay restricciones declaradas, puede reutilizarse como inicialización para nuevas adaptaciones en robótica, asumiendo que la evaluación de este checkpoint sigue pendiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "Evaluation is pending; no success rate is claimed". No deben asumirse tasas de éxito en LIBERO ni en ninguna otra tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio es de 6.9 GB, lo que sugiere que los pesos cabrían en GPUs con 12-16 GB de VRAM en precisión de origen, pero este dato no está confirmado y depende de la arquitectura real de π₀.₅.
- GPU recomendadas: no disponibles en la información proporcionada. El entrenamiento documentado usa FSDP2, lo que implica despliegue distribuido en más de una GPU, aunque no se especifica el hardware.
- Compatibilidad con GPU de consumo: no confirmada. Un repo de 6.9 GB es compatible en tamaño con GPUs de 16 GB o superiores, pero sin datos de arquitectura y precisión no puede afirmarse.
- Opciones de despliegue: la librería declarada es `openpi`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no son adecuados para un modelo VLA orientado a control robótico.
- Latencia y throughput estimados: no disponibles. No se aportan mediciones de tiempo de inferencia ni de frecuencia de control.

## Comparativa con modelos similares

| Modelo | Tipo | Entrenamiento | Licencia | Disponibilidad | Evaluación |
|---|---|---|---|---|---|
| `Donghyun1228/pi05-libero-main-steps-view-small-1000-20261015` | VLA pi05 adaptado, IDM-only, view_small, 1000 updates | LLM congelado, LoRA de acción 0.1, FSDP2, B32, seed 42 | Apache 2.0 | HuggingFace (0 descargas, 0 likes) | Pendiente, sin tasa de éxito declarada |
| `lerobot/pi05_libero_finetuned` (π₀.₅ Libero) | VLA π₀.₅ fine-tuned en LIBERO | Co-entrenado con demostraciones y datos multimodales a gran escala (según model card) | no disponible en la información | ModelScope | Entrenado y evaluado en LIBERO según la fuente |
| `lerobot/pi05_libero_base` (π₀.₅) | VLA π₀.₅ base | Preentrenamiento multimodal y de demostraciones | no disponible en la información | ModelScope | Solo soporta cabeza flow-matching |
| `Donghyun1228/pi05-libero-source-free-split-vision-view-large-1000-20261010` | Variante del mismo autor con view_large | Encoders de cámara base y muñeca separados, bfloat16 | Apache 2.0 | HuggingFace | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al derivar de π₀.₅ y entrenarse sobre datos de LIBERO y datos de contacto denso, hereda los sesgos de esos conjuntos, no caracterizados en la información disponible.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero sí existe riesgo de acciones incorrectas o fuera de distribución en escenarios no vistos. No hay evaluación publicada que lo cuantifique.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no están disponibles. El LLM está congelado, por lo que la competencia lingüística queda fijada por el modelo base y no se ha adaptado a nuevos idiomas.
- Alcance limitado: es un checkpoint experimental de un estudio comparativo por pasos, no un modelo listo para producción. La model card indica explícitamente que la evaluación está pendiente y que no se reclama tasa de éxito.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el usuario debe verificar las licencias del modelo base π₀.₅ y de los datos y pesos de origen, que no se detallan aquí.
- Caveats para producción: el despliegue documentado es "raw non-EMA" con normalización original y muñeca de origen; cualquier cambio en la configuración de sensores o normalización puede degradar el comportamiento. Además, el repo tiene 0 descargas y 0 likes, por lo que no hay validación comunitaria.
- Comparaciones: las variantes del mismo autor comparten trayectoria de entrenamiento, por lo que las diferencias observadas entre ellas deben atribuirse únicamente a los factores declarados (vista visual, pasos retenidos, etc.), no a cambios de datos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Donghyun1228/pi05-libero-main-steps-view-small-1000-20261015
- Variante relacionada (view_large, source-free split): https://huggingface.co/Donghyun1228/pi05-libero-source-free-split-vision-view-large-1000-20261010
- Variante relacionada (current-vision-relation-scalar-yaw30): https://huggingface.co/Donghyun1228/pi05-libero-current-vision-relation-scalar-yaw30-1000-20261013
- Repositorio GitHub del autor (LIBERO_view): https://github.com/Donghyun1228/LIBERO_view
- π₀.₅ Libero fine-tuned (LeRobot, ModelScope): https://www.modelscope.cn/models/lerobot/pi05_libero_finetuned
- π₀.₅ Libero base (LeRobot, ModelScope): https://www.modelscope.cn/models/lerobot/pi05_libero_base
