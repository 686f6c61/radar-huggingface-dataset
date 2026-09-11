# sam-guided-vlas/train_1_2__mask__blur__sim__all_cameras__live__pi05__seed_0__steps_15k

## Resumen

El modelo sam-guided-vlas/train_1_2__mask__blur__sim__all_cameras__live__pi05__seed_0__steps_15k es un ajuste fino de lerobot/pi05_base, la implementación en LeRobot de π₀.₅ (Pi05), un modelo Vision-Language-Action de Physical Intelligence orientado a la generalización en entornos abiertos. Cuenta con 4.143.404.816 parámetros (unos 4,14 mil millones) y un repositorio de 9,4 GB. No es un modelo generativo de texto: consume tres imágenes de 224x224 píxeles y un vector de estado de 9 dimensiones, y emite un vector de acción continua de 7 dimensiones para un brazo robótico Panda.

El ajuste se ha realizado durante 15.000 pasos (batch de 16, optimizador AdamW, tasa de aprendizaje 5e-5, semilla 0, LeRobot 0.6.0) sobre el dataset sam-guided-vlas/train_1_2__mask__blur__sim__all_cameras__live, compuesto por 200 episodios, 30.830 fotogramas a 20 FPS y 20 tareas de manipulación de objetos domésticos (entre ellas "soap dispenser", "jam", "jar", "cereal" o "kettle"). La licencia es Apache-2.0.

Su interés es doble: por un lado, permite reproducir y evaluar una política VLA de 4,14 B de parámetros con tres cámaras en un robot Panda; por otro, el propio nombre del repositorio y del dataset (mask, blur, sim, live, all_cameras) sugiere un estudio de aumento de datos y de mezcla simulación-real que, sin embargo, la model card no documenta. El modelo no publica resultados de evaluación ni métricas de éxito, y acumula 0 descargas y 0 likes, por lo que debe tratarse como un artefacto de investigación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA), según la model card; evolución de π₀ y adaptación del repositorio OpenPI. El detalle del backbone (codificador visual y modelo de lenguaje) no está disponible |
| Parametros totales | 4.143.404.816 (4,14 B), dato real de los safetensors |
| Parametros activos | no aplica (no se declara arquitectura de mezcla de expertos) |
| Longitud de contexto | no disponible; la entrada es fija: 3 imágenes de (3, 224, 224) y un estado de (9,) |
| Tipos de cuantizacion | no disponible; solo se publican pesos en safetensors, sin versiones GGUF, int8 ni int4 |
| Idiomas soportados | no disponible; la salida son acciones continuas, no texto. La tarea se condiciona con una cadena (por ejemplo, "soap dispenser") |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |
| Modelo base | lerobot/pi05_base (ajuste fino) |
| Tamaño del repositorio | 9,4 GB |
| Robot y sensores | Panda; cámaras agentview, robot0_eye_in_hand y robot0_eye_in_hand_2 |
| Entradas / salidas | observation.state (9,), 3 x observation.images.* (3, 224, 224) → action (7,) |
| Fecha de creación / actualización | 2026-09-10 / 2026-09-10 (según metadatos del Hub) |

## Arquitectura y entrenamiento

La model card describe π₀.₅ como un modelo Vision-Language-Action diseñado para generalizar a entornos y situaciones nuevas no vistas durante el entrenamiento, y lo sitúa como evolución de π₀. La implementación empleada es la de LeRobot, adaptada del repositorio OpenPI de Physical Intelligence. No se especifican en la información disponible ni el codificador visual, ni el modelo de lenguaje subyacente, ni el mecanismo de decodificación de acciones (por ejemplo, flow matching), ni el número de tokens de entrenamiento.

El entrenamiento es de imitación supervisada sobre el dataset indicado: 200 episodios, 30.830 fotogramas a 20 FPS y 20 tareas de manipulación de objetos. La configuración declarada es de 15.000 pasos, batch size 16, optimizador AdamW, learning rate 5e-5, semilla 0 y LeRobot 0.6.0. No hay mención a RLHF, DPO ni a ningún otro proceso de alineamiento, lo cual es coherente con una política de acción. Los tokens del nombre del repositorio (mask, blur, sim, live, all_cameras) apuntan a un pipeline con enmascarado y desenfoque guiados por SAM y a una mezcla de datos de simulación y de robot real, pero la model card no detalla esa composición ni la proporción de cada fuente.

## Capacidades

- Generación de acciones de manipulación continua de 7 grados de libertad para un brazo Panda, a partir de observaciones multimodales.
- Percepción visual con tres cámaras simultáneas: una vista de agente y dos cámaras en la muñeca, lo que aporta robustez ante oclusiones parciales.
- Condicionamiento por tarea en lenguaje natural mediante una cadena de texto pasada con `--task` (por ejemplo, "soap dispenser").
- Ejecución de 20 tareas de pick and place sobre objetos domésticos: dispensador de jabón, mermelada, tarro, cereales, bloque de cuchillos, hervidor, pera, patata, boniato, scone, cesta, comida en caja, tarta, lata, hamburguesa, limón, naranja, especias, calabaza y spray.
- Política de imitación entrenada para operar a la frecuencia de captura de los datos (20 FPS).
- No dispone de tool calling, function calling, razonamiento multi-paso, modo de pensamiento, ni capacidades de audio o de generación de texto.

## Casos de uso

- Manipulación robótica de objetos domésticos en laboratorio: la política ejecuta directamente tareas de pick and place sobre un Panda con tres cámaras; se lanza con `lerobot-rollout` indicando el puerto del robot, los índices de cámara y la tarea objetivo.
- Reproducción de experimentos de imitación: al estar entrenada con semilla 0 y 15.000 pasos fijos, sirve como punto de referencia reproducible frente a otros ajustes del mismo dataset.
- Estudio de aumento de datos guiado por SAM: los tokens mask y blur del repositorio permiten evaluar si el enmascarado y el desenfoque de las vistas mejoran la robustez de la política ante distractores.
- Análisis de transferencia simulación-real: la convivencia de los tokens sim y live en el nombre del dataset hace de este modelo un candidato para medir la brecha entre datos sintéticos y datos de robot real.
- Fine-tuning específico de dominio: al partir de 200 episodios y de un modelo base de 4,14 B, es una base razonable para ajustar políticas a una cocina, un almacén o una línea de montaje concretos con un presupuesto de datos reducido.
- Evaluación comparativa de políticas en un mismo banco de pruebas: permite contrastar variantes de cámara (all_cameras frente a subconjuntos) manteniendo constantes arquitectura y datos.
- Docencia y divulgación en robótica: el flujo de LeRobot (grabación, entrenamiento, rollout) facilita montar prácticas de aprendizaje por imitación con hardware tipo Panda.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La sección de evaluación de la model card indica explícitamente que no se han proporcionado resultados para esta política, y no consta ninguna tabla de tasa de éxito por tarea ni comparación con otras políticas.

## Requisitos de hardware

- VRAM estimada a partir del recuento de parámetros (4,14 B): en fp32, unos 16,6 GB solo para pesos; en bf16 o fp16, unos 8,3 GB, coherente con un repositorio de 9,4 GB; a ello hay que sumar las activaciones de tres imágenes de 224x224 y del codificador visual.
- GPU recomendadas para fp32: A100 (40 o 80 GB), H100 o L40S con al menos 24 GB de memoria.
- GPU recomendadas para bf16: A100, H100, L40S y, en el ámbito de consumo, RTX 3090 y RTX 4090 con 24 GB, que deberían ajustar con margen.
- GPU de consumo con 16 GB (RTX 4080, 4070 Ti Super): previsiblemente viable en bf16, aunque no verificado en la información disponible.
- Despliegue: el soporte oficial es LeRobot (`lerobot-rollout` para inferencia en robot y `lerobot-train` para ajuste) sobre PyTorch y CUDA. No hay soporte anunciado en vLLM, TGI, llama.cpp ni Ollama, ni pesos GGUF, algo esperable en una política de acción continua.
- Latencia y throughput: no disponibles. El dataset se grabó a 20 FPS, lo que implica un presupuesto de control de 50 ms por paso, pero no se publica ninguna medición de latencia real.

## Comparativa con modelos similares

| Modelo | Parámetros | Entradas | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este modelo (fine-tune de pi05, semilla 0, 15k pasos) | 4,14 B | 3 imágenes (3, 224, 224) + estado (9,) → acción (7,) | Apache-2.0 | Ficha en HuggingFace, 0 descargas |
| lerobot/pi05_base | no disponible | no disponible en la información proporcionada | no disponible en esta ficha | HuggingFace |
| π₀.₅ / π₀ de Physical Intelligence (OpenPI) | no disponible | no disponible en la información proporcionada | no disponible en esta ficha | Blog y repositorio citados en la model card |

No se han encontrado en la búsqueda web modelos comparables con datos verificables: los resultados obtenidos corresponden a una serie de televisión, al portal de contratación SAM.gov, a una empresa de utillaje y a un máster universitario, sin relación con este modelo.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay tasas de éxito, número de ensayos ni condiciones de prueba, por lo que el rendimiento real es desconocido.
- Entrenamiento con datos muy limitados: 200 episodios y 30.830 fotogramas para 20 tareas, lo que da una media de 10 episodios y unos 1.500 fotogramas por tarea.
- Fuerte acoplamiento al hardware: la política espera un robot Panda, un estado de 9 dimensiones, tres cámaras concretas y nombres de observación exactos (agentview, robot0_eye_in_hand, robot0_eye_in_hand_2); cualquier cambio de montaje o de robot invalida la política.
- Cobertura semántica cerrada: fuera de las 20 tareas listadas y de los objetos vistos, el comportamiento no está caracterizado y puede producir acciones erráticas, colisiones o agarres fallidos.
- Riesgo de alucinación en el sentido clásico no aplica (no genera texto), pero sí existe riesgo de acciones fuera de distribución sin señal de confianza asociada.
- Los tokens mask y blur del repositorio indican que los datos de entrenamiento pudieron manipularse con enmascarado y desenfoque; si la inferencia se hace con imágenes sin ese preprocesado, puede haber una discrepancia entre entrenamiento y despliegue no documentada.
- La model card no aclara la proporción de datos de simulación frente a datos de robot real, pese a que el nombre del dataset incluye sim y live.
- Licencia Apache-2.0 para este ajuste, lo que permite uso comercial con atribución; conviene verificar, no obstante, la licencia del modelo base lerobot/pi05_base y las condiciones de los datos de origen antes de un despliegue en producción.
- Sesgos conocidos: no disponibles. No hay análisis de sesgo demográfico, de iluminación, de materiales ni de geometrías de objeto.
- Idiomas: no disponible. El condicionamiento textual por tarea se ha visto únicamente en inglés en los ejemplos proporcionados.
- Metadatos a revisar: las fechas de creación y actualización (2026-09-10) y la ausencia de descargas y likes hacen recomendable tratar el repositorio como un artefacto reciente y no validado por la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sam-guided-vlas/train_1_2__mask__blur__sim__all_cameras__live__pi05__seed_0__steps_15k
- Dataset de entrenamiento: https://huggingface.co/datasets/sam-guided-vlas/train_1_2__mask__blur__sim__all_cameras__live
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=sam-guided-vlas/train_1_2__mask__blur__sim__all_cameras__live
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Blog de π₀.₅ de Physical Intelligence: https://www.physicalintelligence.company/blog/pi05
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de pi05 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación completa de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio OpenPI de Physical Intelligence: citado en la model card como origen de la implementación; no se incluye URL en la información proporcionada
- Búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos (TF1+, SAM.gov, Wikipedia, SAM Outillage, Université Paris-Saclay) no guardan relación con esta política robótica.
