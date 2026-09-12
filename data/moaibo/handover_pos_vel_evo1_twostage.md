# MoAIBo/handover_pos_vel_evo1_twostage

## Resumen

Este repositorio contiene una política robótica de tipo Vision-Language-Action (VLA) publicada por el usuario MoAIBo bajo el identificador MoAIBo/handover_pos_vel_evo1_twostage. No es un modelo de lenguaje de propósito general, sino un checkpoint de control entrenado con LeRobot para una tarea concreta de manipulación cooperativa: el traspaso (handover) de objetos entre dos brazos robóticos, donde uno actúa como dador (Giver) y otro como receptor (Receiver). El modelo se apoya en la arquitectura EVO1, desarrollada por el grupo MINT-SJTU, que combina un backbone vision-language InternVL3 con una cabeza de acción de flow matching continuo.

El modelo tiene 776.139.440 parámetros (aproximadamente 776 millones) y ocupa 1,8 GB en el repositorio. Consume como entrada el estado del robot (vector de 11 dimensiones) y cinco flujos visuales de 3×360×640 píxeles (cámara izquierda, derecha, de muñeca, D455 y profundidad), y produce un vector de acción de 8 dimensiones. Está entrenado sobre el dataset MoAIBo/handover_scene1_2_giver_receiver_merged_pos_vel, con 338 episodios y 354.884 fotogramas a 30 FPS.

Es relevante porque ilustra el patrón actual de publicación de políticas VLA: pesos abiertos con licencia Apache-2.0, integración directa con el ecosistema LeRobot y un pipeline de despliegue reproducible en hardware de bajo coste (brazo SO-101 con múltiples cámaras). El sufijo «twostage» del nombre sugiere un entrenamiento en dos fases, aunque el autor no documenta ese extremo en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (Vision-Language-Action) con backbone InternVL3 y cabeza de accion de flow matching continuo (EVO1) |
| Parametros totales | 776.139.440 (aproximadamente 776 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo se publican pesos en safetensors; no se documentan variantes GGUF, INT8 ni INT4) |
| Idiomas soportados | No disponible; las instrucciones de entrenamiento del dataset estan redactadas en ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato de LeRobot) |

Datos adicionales de la model card: tipo de robot `so101_tb4`; camaras declaradas `camera_left`, `camera_right`, `camera_wrist`, `camera_d455` y `depth`; entrada de estado `observation.state` de forma (11,); entrada visual de forma (3, 360, 640) por cada camara; salida `action` de forma (8,).

## Arquitectura y entrenamiento

EVO1 es una política VLA construida sobre un backbone InternVL3 que codifica conjuntamente las imágenes de cámara y la instrucción en lenguaje natural. Sobre esa representación multimodal, una cabeza de acción basada en flow matching continuo predice «chunks» de acciones futuras, es decir, secuencias de comandos de control en lugar de una única acción instantánea. Este esquema de generación por flow matching es habitual en las políticas VLA recientes porque modela distribuciones multimodales de acciones (por ejemplo, acercarse por la izquierda o por la derecha) sin discretizar el espacio de acción.

El entrenamiento se realizó con LeRobot 0.6.0 durante 65.000 pasos, con batch size 2, optimizador AdamW, learning rate 1e-5 y semilla 1000. El dataset de imitación contiene 338 episodios y 354.884 fotogramas a 30 FPS, correspondientes a diez variantes de instrucción que cubren el traspaso de cinco objetos (espátula negra, cepillo azul, destornillador, botella y espátula) en ambos roles, dador y receptor. No se documenta el uso de RLHF, DPO ni de ninguna fase de ajuste por preferencias; se trata de aprendizaje por imitación supervisado sobre demostraciones. Tampoco se detalla la composición exacta del dataset más allá de las tareas enumeradas, ni si hubo aumento de datos o curación adicional.

## Capacidades

- Generación de acciones de control continuo para un robot de dos brazos, con salida de 8 dimensiones por paso de inferencia.
- Condicionamiento por lenguaje natural: la política interpreta instrucciones de tarea del tipo «<Robot0><Giver> Approach Robot 1, present and handover...» y el rol asignado (Giver o Receiver).
- Percepción multimodal con cinco flujos visuales simultáneos, incluida una entrada de profundidad.
- Predicción de chunks de acción mediante flow matching, lo que permite planificar horizontes cortos en lugar de reaccionar fotograma a fotograma.
- Manipulación cooperativa entre dos robots: coordinación de aproximación, presentación del objeto, agarre y liberación.
- Generalización limitada a los cinco objetos vistos en entrenamiento (espátula negra, cepillo azul, destornillador, botella y espátula).
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso explícito ni modo «thinking».
- No se documentan capacidades multilingües; las instrucciones del dataset están en inglés.

## Casos de uso

- Investigación en manipulación cooperativa: el modelo sirve como referencia reproducible para estudiar traspaso de objetos entre dos brazos, ya que el dataset y la configuración de entrenamiento están publicados.
- Banco de pruebas de políticas VLA con múltiples cámaras: permite evaluar cómo influye la fusión de cinco vistas (izquierda, derecha, muñeca, D455 y profundidad) en el éxito de una tarea de agarre.
- Automatización de líneas de ensamblaje con entrega de piezas: un brazo dador presenta la pieza y otro la recoge; el modelo ya ha sido entrenado para ese patrón con cinco objetos distintos.
- Logística interna con handover entre estaciones: se puede adaptar el checkpoint mediante ajuste fino para transferir contenedores o herramientas entre dos celdas robóticas contiguas.
- Prototipado rápido en robótica de bajo coste: al estar integrado en LeRobot y caber en una GPU de consumo, permite iterar sobre hardware tipo SO-101 sin infraestructura de centro de datos.
- Evaluación de robustez ante variaciones de iluminación y punto de vista: la entrada de profundidad y las cámaras redundantes permiten diseñar experimentos de ablación sobre qué modalidad aporta más señal.
- Generación de datos sintéticos o aumentados para entrenar políticas posteriores, usando el modelo como profesor en entornos simulados que repliquen la tarea de handover.
- Demostraciones educativas: el comando `lerobot-rollout` de la model card permite reproducir la política en 60 segundos de ejecución, lo que facilita su uso en docencia y talleres.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye tasas de éxito, curvas de aprendizaje, comparaciones con otras políticas ni métricas de simulación o de robot real. El único dato cuantitativo de entrenamiento es el número de pasos (65.000), el batch size (2), el learning rate (1e-5) y el volumen del dataset (338 episodios, 354.884 fotogramas).

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16/fp16, los 776 M de parámetros ocupan aproximadamente 1,55 GB; sumando activaciones y codificadores visuales, es razonable reservar entre 4 y 8 GB, aunque el autor no publica la cifra exacta.
- Almacenamiento: el repositorio ocupa 1,8 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM. Una RTX 4090, RTX 3090 o RTX 4080 es suficiente para inferencia en tiempo real; A100 o H100 aportan margen si se ejecutan varios entornos en paralelo.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas de gama media-alta recientes (RTX 3060 de 12 GB en adelante), aunque no hay una tabla oficial de compatibilidad.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--strategy.type=base`, tal como indica la model card) sobre PyTorch. No aplican llama.cpp, Ollama, vLLM ni TGI, ya que no se trata de un modelo de lenguaje autoregresivo con pesos GGUF.
- Latencia y throughput: no disponibles. La captura del dataset se hizo a 30 FPS, lo que sugiere que el bucle de control objetivo opera en ese orden de magnitud, pero el autor no publica latencias medidas ni FPS de inferencia.

## Comparativa con modelos similares

Los datos de los modelos comparados provienen de conocimiento general del sector y no de la informacion proporcionada en esta ficha; conviene verificarlos en sus repositorios oficiales antes de citarlos.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| MoAIBo/handover_pos_vel_evo1_twostage (EVO1) | 776 M | No disponible | Apache-2.0 | Pesos en HuggingFace, LeRobot | Especializado en handover con 5 camaras; dataset de 338 episodios |
| OpenVLA | Aproximadamente 7 B | No disponible | MIT (segun su repositorio) | Pesos abiertos | Politica VLA generalista de mayor tamano |
| SmolVLA | Aproximadamente 450 M | No disponible | Apache-2.0 | Pesos abiertos en LeRobot | Alternativa ligera del mismo ecosistema; pensada para hardware de consumo |
| NVIDIA GR00T N1 | Aproximadamente 2 B | No disponible | Licencia propia de NVIDIA | Pesos abiertos | Enfoque de fundacion para robots humanoides |
| Physical Intelligence pi0 | Aproximadamente 3 B | No disponible | No disponible | Pesos abiertos con condiciones | Flow matching sobre backbone VLM |

La diferencia principal de este checkpoint frente a los anteriores es su especialización: no es una política generalista, sino un ajuste fino orientado exclusivamente al traspaso de objetos entre dos brazos SO-101 con un conjunto cerrado de instrucciones en inglés.

## Limitaciones y advertencias

- Especialización extrema: solo cubre las tareas de handover descritas en el dataset; fuera de ese repertorio de objetos e instrucciones el comportamiento no está validado.
- Riesgo de alucinación de acciones: como toda política de imitación, puede generar trayectorias plausibles pero incorrectas cuando la escena difiere de la distribución de entrenamiento, con riesgo de colisión entre los dos brazos.
- Idiomas: las instrucciones de entrenamiento están en inglés; no hay evidencia de funcionamiento con instrucciones en castellano u otros idiomas.
- Sesgos de dominio: el modelo se entrenó con un montaje concreto de cinco cámaras y un tipo de robot específico (`so101_tb4`); cambiar la posición, el número o la resolución de las cámaras invalida las entradas esperadas.
- Dependencia del hardware: los nombres de cámara deben coincidir exactamente con las claves de observación del entrenamiento (`camera_left`, `camera_right`, `camera_wrist`, `camera_d455`, `depth`), lo que limita la portabilidad.
- Licencia: Apache-2.0 permite uso comercial, pero al derivar de InternVL3 conviene revisar también las condiciones de los componentes del backbone y del dataset utilizado.
- Trazabilidad: el repositorio no tiene descargas ni «likes» en el momento de la consulta y no incluye métricas de evaluación, vídeos de demostración ni informes de fallos.
- El término «twostage» del nombre no está explicado en la model card; se desconoce qué dos fases comprende el entrenamiento.
- No se documentan prácticas de mitigación de sesgos, evaluación de seguridad ni protocolos de parada de emergencia en el despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MoAIBo/handover_pos_vel_evo1_twostage
- Dataset de entrenamiento: https://huggingface.co/datasets/MoAIBo/handover_scene1_2_giver_receiver_merged_pos_vel
- Repositorio oficial de EVO1 (MINT-SJTU): https://github.com/MINT-SJTU/Evo-1
- Guía de EVO1 en LeRobot: https://huggingface.co/docs/lerobot/main/en/evo1
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de imitación y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI de LeRobot: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=MoAIBo/handover_scene1_2_giver_receiver_merged_pos_vel

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo, su arquitectura o su dataset; los unicos enlaces utiles proceden de la propia model card y del repositorio asociado.
