# RyanL22/pi05-openarm-rh56f1-masquerade-baseline-20k

## Resumen

pi05-openarm-rh56f1-masquerade-baseline-20k es un checkpoint de política robótica (VLA, vision-language-action) publicado por el usuario RyanL22 sobre la librería LeRobot. Es un ajuste fino de lerobot/pi05_base, la implementación nativa en LeRobot v0.6.1 de pi0.5, con 4.143.404.816 parámetros (~4,14 mil millones) y pesos en safetensors que ocupan 9,4 GB en el repositorio. Controla un brazo OpenArm con mano RH56F1 a partir de dos cámaras ZED (una base y una en la muñeca) y un vector de estado de 28 dimensiones, emitiendo chunks de 50 acciones a 20 Hz, es decir, 2,5 segundos de trayectoria por inferencia.

Su rasgo distintivo es la receta visual denominada Masquerade/Phantom: en los vídeos humanos el brazo se elimina con ProPainter (máscara de brazo SAM3, dilatación 8) y se pega encima un render del mesh OpenArm + RH56F1 generado en MuJoCo 3.11 con las intrínsecas reales de la ZED y su distorsión de lente, colocado en la pose articular retargeteada. En los vídeos de teleoperación se pega ese mismo render sobre el robot real, sin enmascarado. Esto permite mezclar datos humanos y robóticos bajo una apariencia visual homogénea.

Es relevante como baseline reproducible (20.000 pasos, 2x H100, batch efectivo 64) de una técnica de aumento de datos poco documentada, y como punto de partida para quien quiera replicar el pipeline Masquerade sobre hardware OpenArm. Es un artefacto de investigación: 0 descargas, 0 likes y sin benchmarks publicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | pi0.5 (pi05) nativo de LeRobot v0.6.1; encoder de visión SigLIP (ajustado); detalles internos del mecanismo de acción no disponibles en la model card |
| Parámetros totales | 4.143.404.816 (~4,14 B) |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible en sentido textual; la política emite chunks de 50 acciones a 20 Hz (2,5 s) |
| Tipos de cuantización | no disponible; únicamente se publican pesos en safetensors (precisión de almacenamiento no declarada) |
| Idiomas soportados | no disponible (modelo de robótica; no se declaran idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |
| Entradas | observation.images.base_0_rgb (ZED izquierda, 288x512, con overlay del robot), observation.images.left_wrist_0_rgb (ZED derecha), observation.state de 28 D: neck(2) | left_arm(7) | right_arm(7) | left_hand(6) | right_hand(6) |
| Salidas | acciones de 28 D, en chunks de 50 a 20 Hz |
| Checkpoint | paso 20.000 (final) de un run de 20.000 pasos |
| Modelo base | lerobot/pi05_base |

## Arquitectura y entrenamiento

El modelo parte de pi05_base de LeRobot, la implementación de pi0.5, y se ajusta con la receta Masquerade/Phantom. La model card confirma únicamente el uso de un encoder de visión SigLIP ajustado durante el entrenamiento; el resto del diseño interno (columna de acción, esquema de atención, número de capas) no se detalla y queda como no disponible. La configuración de optimización sí está documentada: AdamW con lr pico 2,5e-5, decaimiento coseno hasta 2,5e-6 y warmup de 1.000 pasos, en un run de 20.000 pasos sobre 2x H100 con batch 32 x 2 = 64.

Los datos combinan OpenArm teleop v4 (20 Hz, 261 episodios en 4 celdas) con vídeo humano del conjunto anyh2r, sumando 12 tareas y 466 episodios. El muestreo usa 16 celdas (4 de robot y 12 de humano) con reparto proporcional a la raíz cuadrada del número de fotogramas. Las acciones de 28 D se obtienen con retargeting Inspire -> RH56F1 y cinemática inversa del brazo OpenArm (variante A), idénticas a las del baseline EgoMimic. El aumento de imagen es fotométrico y afín, con un único sorteo replicado en el par estéreo; el aumento especular está desactivado. La normalización es por cuantiles, y las dimensiones constantes (cuello) se ensanchan a media ± 0,1 rad.

La innovación técnica principal es el pipeline de render: borrado del brazo humano con ProPainter y superposición de un render MuJoCo calibrado con las intrínsecas de la ZED. Como consecuencia, en el despliegue los fotogramas en vivo deben recibir exactamente el mismo overlay (render en el estado articular actual, con cuello fijado en 0,889 / 0,001) antes de llegar a la política.

## Capacidades

- Control robótico de manipulación bimanual en el hardware objetivo: brazo OpenArm con mano RH56F1, con las 28 dimensiones articulares descritas.
- Generación de acciones en chunks de 50 pasos a 20 Hz, lo que reduce la frecuencia de inferencia necesaria para el control en tiempo real.
- Fusión de percepción estéreo: imagen de cámara base (288x512) más imagen de muñeca, con el mismo sorteo de aumento replicado en el par.
- Aprendizaje a partir de vídeo humano además de teleoperación robótica, mediante el retargeting Inspire -> RH56F1 y la cinemática inversa del brazo.
- No se declara soporte de tool calling ni function calling.
- No se declaran capacidades de agente ni de razonamiento multi-paso.
- No se declaran capacidades multilingües ni de visión general (el encoder SigLIP se usa como componente de política, no como modelo de descripción de imágenes).
- No se declaran modos especiales (thinking mode, audio, generación de texto libre).

## Casos de uso

- Replicación de la receta Masquerade: sirve como referencia de pesos ya entrenados para validar un pipeline propio de enmascarado con ProPainter y render MuJoCo sobre OpenArm, evitando repetir los 20.000 pasos de entrenamiento.
- Baseline de comparación en experimentos de aumento de datos: al existir un baseline hermano con máscara negra y línea roja, permite aislar el efecto de la apariencia visual sobre el rendimiento en el mismo hardware y dataset.
- Manipulación bimanual en laboratorio: control de OpenArm con mano RH56F1 en tareas de las 12 documentadas, con captura estéreo ZED y estado articular de 28 D, dentro de las 466 episodios vistos en entrenamiento.
- Investigación en aprendizaje a partir de vídeo humano: punto de partida para estudiar transferencia de datos anyh2r a política robótica con retargeting Inspire -> RH56F1.
- Evaluación de robustez al cambio de apariencia: el requisito de aplicar el mismo overlay en inferencia lo convierte en un caso de estudio claro de desajuste de distribución (distribution shift) si se omite el render.
- Ajuste fino posterior sobre hardware similar: al ser un checkpoint apache-2.0 de 4,14 B con pesos en safetensors, puede reentrenarse con LeRobot sobre nuevos episodios de teleoperación del mismo robot.
- Docencia y divulgación en robótica: ejemplo reproducible de extremo a extremo (dataset, entrenamiento en 2x H100, chunking a 20 Hz, licencia permisiva) para cursos o talleres de VLA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16, aproximadamente 8,3 GB solo para pesos (4,14 B x 2 bytes); en fp32, unos 16,6 GB. Hay que sumar activaciones de dos flujos de imagen a 288x512 y la decodificación del chunk de 50 acciones.
- GPU recomendadas: H100 (la configuración de entrenamiento documentada usa 2x H100), A100 40 GB o 80 GB para despliegue holgado, y RTX 4090 como opción de consumo.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 4090 o RTX 3090 (24 GB) en bf16; en tarjetas de 16 GB el margen es ajustado y no está verificado en la información disponible.
- Opciones de despliegue: librería LeRobot (lerobot v0.6.1 es la versión nativa del formato). No se documentan soportes de vLLM, TGI, llama.cpp, Ollama ni GGUF, y no tendrían sentido para una política de acción.
- Latencia y throughput: no disponibles como cifra medida. Como referencia de diseño, el modelo emite 50 acciones a 20 Hz, de modo que cada inferencia cubre 2,5 s de control.
- Requisitos adicionales de despliegue: cámaras ZED calibradas, render MuJoCo en línea del mesh OpenArm + RH56F1 y fijación de las dimensiones de cuello a 0,889 / 0,001 en los fotogramas en vivo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / horizonte | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| pi05-openarm-rh56f1-masquerade-baseline-20k (este) | 4.143.404.816 | chunks de 50 acciones a 20 Hz | apache-2.0 | HuggingFace, 0 descargas, 0 likes | Receta de overlay con render MuJoCo sobre vídeo humano y de robot |
| RyanL22/pi05-openarm-rh56f1-egomimic-baseline-20k (baseline hermano) | no disponible | no disponible | no disponible | HuggingFace | Mismo experimento con máscara negra y línea roja en lugar del render Masquerade |
| lerobot/pi05_base (modelo base) | no disponible | no disponible | no disponible | HuggingFace (librería lerobot) | Punto de partida sin ajustar; el autor no publica sus especificaciones en esta ficha |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Dependencia crítica del overlay: si los fotogramas en vivo no se renderizan con el mismo pipeline MuJoCo, las mismas intrínsecas de la ZED y el cuello fijado en 0,889 / 0,001, la entrada no coincidirá con la distribución de entrenamiento y la política probablemente fallará.
- Especificidad de hardware: entrenado para OpenArm con mano RH56F1 y cámaras ZED; no es trasladable directamente a otras plataformas sin reentrenamiento.
- Volumen de datos reducido: 466 episodios y 12 tareas, con solo 261 episodios de teleoperación robótica en 4 celdas; la generalización a tareas y objetos no vistos es limitada.
- Entrenamiento corto: 20.000 pasos, lo que sugiere un modelo posiblemente infraentrenado y sin curva de convergencia publicada.
- Ausencia total de validación pública: 0 descargas y 0 likes, sin resultados de benchmarks ni métricas de éxito en tarea.
- Riesgo de fallo silencioso en manipulación: en políticas de acción no existe una noción de "alucinación" textual, pero sí de acciones fuera de distribución que pueden provocar colisiones o daños físicos; requiere paradas de seguridad en hardware real.
- Sesgos conocidos: no disponible (no se documenta ningún análisis de sesgo).
- Idiomas y capacidades lingüísticas: no disponibles; el modelo no se presenta como modelo de lenguaje.
- Licencia: los pesos se publican bajo apache-2.0, pero no se documentan los términos de los datos de entrenamiento utilizados (OpenArm teleop v4 y anyh2r) ni del modelo base lerobot/pi05_base; conviene verificarlos antes de un uso comercial.
- Sin cuantizaciones publicadas (GGUF, AWQ, etc.), lo que dificulta el despliegue en hardware de bajos recursos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RyanL22/pi05-openarm-rh56f1-masquerade-baseline-20k
- Baseline hermano (máscara negra y línea roja): https://huggingface.co/RyanL22/pi05-openarm-rh56f1-egomimic-baseline-20k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Librería LeRobot: https://github.com/huggingface/lerobot
- Nota sobre la búsqueda web: los resultados devueltos corresponden a informes financieros de Johnson & Johnson y no guardan relación con este modelo, por lo que no se han incluido. No se han encontrado en la búsqueda papers, blogs, repositorios ni demos adicionales sobre este checkpoint.
