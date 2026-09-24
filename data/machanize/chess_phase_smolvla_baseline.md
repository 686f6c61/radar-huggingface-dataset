# Machanize/chess_phase_smolvla_baseline

## Resumen

chess_phase_smolvla_baseline es una política robótica de visión-lenguaje-acción (VLA) publicada por el usuario Machanize, obtenida por ajuste fino de lerobot/smolvla_base (SmolVLA). Su tarea es concreta: mover una pieza de ajedrez con un brazo SO-101 en una única escena simulada en MuJoCo, consumiendo dos imágenes de cámara de 640x480 y las posiciones articulares del brazo. Se presenta de forma explícita como la línea base más simple del "brazo" de un robot de ajedrez, antes de reintroducir variedad en la escena.

El modelo tiene 450.046.176 parámetros (unos 450 M), se distribuye en safetensors bajo licencia Apache 2.0 y se ejecuta con la librería LeRobot. Se entrenó con 300 episodios (89.008 fotogramas) de un experto con cinemática inversa, durante 10.000 pasos con batch 64 en una única RTX 4090 en 1,9 horas, con el codificador visual congelado y el experto de acción entrenado.

Su interés actual es el de un artefacto de investigación reproducible y barato: una línea base trazable, con resultados de evaluación honestos (36,7% de éxito en 60 episodios en bucle cerrado) y un análisis de fallo detallado centrado en el agarre. No está listo para producción y no se ha probado en un brazo real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de visión-lenguaje-acción (VLA) derivada de lerobot/smolvla_base (SmolVLA); codificador visual congelado y experto de acción entrenado |
| Parámetros totales | 450.046.176 (≈450 M) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No aplica como ventana de texto; consume observaciones de dos cámaras de 640x480 y estado articular a 30 Hz, y predice fragmentos de 50 pasos |
| Tipos de cuantización | No disponible (solo se publican los pesos en la precisión resultante del entrenamiento) |
| Idiomas soportados | No disponibles. La instrucción de entrenamiento es siempre la misma frase en inglés: "move the piece on the red square to the blue square" |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 0,9 GB, librería lerobot) |
| Modelo base | lerobot/smolvla_base |
| Pipeline declarado | robotics |
| Entradas | observation.images.overhead (cámara1), observation.images.wrist (cámara2) y observation.state (5 articulaciones en grados y pinza 0-100, unidades SO-101 follower con use_degrees=True) |
| Salidas | Objetivos articulares en las mismas unidades, en fragmentos de 50 pasos |
| Frecuencia de control | 30 Hz |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Fechas | Creado el 2026-09-24; última actualización el 2026-09-24 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de SmolVLA a través de lerobot/smolvla_base: una política VLA que combina percepción visual, estado propioceptivo y una instrucción en lenguaje natural para producir acciones motoras. En este ajuste concreto, el autor mantiene los valores por defecto de SmolVLA, con el codificador visual congelado y el experto de acción entrenado, y renombra las cámaras de hombro y de muñeca a camera1 y camera2. La salida se emite en fragmentos (chunks) de 50 pasos, y el autor probó a ejecutar solo 10 pasos de cada fragmento antes de volver a predecir, sin mejora (4 de 15 episodios).

El entrenamiento es aprendizaje por imitación puro a partir de un experto programado con cinemática inversa: 300 episodios correctos (89.008 fotogramas a 30 fps, unos 30 por movimiento) extraídos de la carpeta privada chess-sim/datasets/baseline_v1 del repositorio Machanize/playful. La pose y la velocidad iniciales del experto varían ligeramente entre episodios. El ajuste se hizo desde cero sobre lerobot/smolvla_base (no desde la variante anterior Machanize/chess_phase_smolvla), durante 10.000 pasos con batch 64 en una RTX 4090 en 1,9 horas, con LeRobot 0.4.4. No se documenta RLHF, DPO ni aprendizaje por refuerzo. Un detalle técnico relevante es la preparación de la imagen: el vídeo de entrenamiento se almacenó en H.264 con CRF 18 y color 4:4:4 completo para preservar el color de los marcadores, y se recomienda pasar los fotogramas en vivo por la misma codificación y decodificación (training_look(image, 18, "yuv444p") en sim/camera_effects.py). La variante anunciada como siguiente paso, basada en demostraciones de corrección de sus propios errores, es Machanize/chess_phase_smolvla_baseline_r2.

## Capacidades

- Generación de acciones motoras de manipulación (pick-and-place) a partir de observación visual y propioceptiva; no genera texto ni tiene interfaz conversacional.
- Seguimiento de una instrucción fija en inglés ("move the piece on the red square to the blue square").
- Localización de marcadores visuales superpuestos: cuadrado rojo con contorno opaco para la pieza a mover y cuadrado azul para la casilla destino. La pinza se aproxima a media casilla o menos de la pieza marcada en el 95,0% de los episodios (mediana de aproximación mínima de 3,3 mm).
- Elevación de la pieza marcada en el 68,3% de los episodios.
- Control en bucle cerrado a 30 Hz con predicción en fragmentos de 50 pasos.
- Ejecución de diez movimientos concretos desde la posición inicial fija: e7e5, d7d5, g8f6, b8c6, c7c5, e2e4, d2d4, g1f3, b1c3 y c2c4.
- No dispone de tool calling, function calling, razonamiento multi-paso, modo thinking, audio, ni capacidades multilingües.
- Su visión es la del montaje: una cámara situada 65 cm en vertical sobre el tablero (44 grados de arriba abajo) y la cámara de muñeca oficial del SO-101.

## Casos de uso

- Línea base reproducible para comparación de políticas VLA: sirve como referencia mínima de un escenario de manipulación concreto (un tablero, diez movimientos) frente a la que medir cualquier mejora posterior, incluida la variante _r2.
- Investigación sobre el fallo de agarre: el modelo permite reproducir el análisis documentado (agarres correctos a 0,8-0,9 mm del punto ideal frente a 4-6 mm en los fallos, 7 de 20 episodios empujando la pieza y 6 de 20 cerrando al lado) y usarlo para generar demostraciones de corrección.
- Tubería completa de aprendizaje por imitación con LeRobot: reproduce el flujo desde un dataset de 300 episodios y 89.008 fotogramas hasta una política desplegable, incluyendo el uso de make_pre_post_processors para renombrar las claves de cámara y aplicar la normalización de entrenamiento.
- Evaluación de sensibilidad perceptiva: al eliminar la superposición roja y azul se comprueba que la política deja de saber qué mover, lo que resulta útil para estudiar hasta qué punto el modelo depende de etiquetas visuales artificiales.
- Estudio de domain shift en el pipeline de imagen: dado que el entrenamiento usó H.264 CRF 18 con 4:4:4, se puede medir la degradación al alimentar fotogramas con otras codificaciones o submuestreos de color, aplicando training_look() como referencia.
- Docencia y laboratorios de robótica de bajo coste: un brazo SO-101 más MuJoCo y una GPU de consumo bastan para reproducir el experimento completo, incluido el entrenamiento en menos de dos horas.
- Depuración de currículos de variedad: añadir un solo cambio cada vez (más movimientos, posiciones de tablero distintas, iluminación o juegos de piezas) y medir el punto exacto de ruptura del éxito, tal como propone el autor.
- Integración como módulo "mano" en un pipeline de ajedrez completo: una vez que el agarre sea fiable, la política encajaría como el componente de ejecución de movimientos entre el motor de ajedrez y el brazo.

## Benchmarks y rendimiento

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K u otros); no aplican a una política robótica. La única evaluación disponible es la prueba en bucle cerrado en simulación: 60 episodios, cada uno un movimiento aleatorio de los diez, con semillas no usadas en entrenamiento, límite de 20 s y éxito definido como pieza a menos de 6 mm de la casilla destino, en pie y sin que ninguna otra pieza se mueva más de 2 mm.

| Movimiento | Éxito | Episodios |
|---|---|---|
| b1-c3 | 16,7% | 6 |
| b8-c6 | 14,3% | 7 |
| c2-c4 | 0,0% | 5 |
| c7-c5 | 66,7% | 6 |
| d2-d4 | 33,3% | 6 |
| d7-d5 | 60,0% | 5 |
| e2-e4 | 60,0% | 10 |
| e7-e5 | 33,3% | 6 |
| g1-f3 | 33,3% | 3 |
| g8-f6 | 33,3% | 6 |
| Global | 36,7% | 60 |

Métricas complementarias aportadas por el autor:

| Métrica | Resultado |
|---|---|
| Pinza a media casilla o menos de la pieza marcada | 95,0% de los episodios (mediana de aproximación mínima 3,3 mm) |
| Pieza marcada elevada | 68,3% de los episodios |
| Desviación del punto de pinza en agarres correctos (inspección de 20 episodios) | 0,8-0,9 mm |
| Desviación del punto de pinza en agarres fallidos | 4-6 mm |
| Modos de fallo en la inspección de 20 episodios | 7 empujando la pieza, 6 cerrando al lado |
| Ejecución de 10 de cada 50 pasos del fragmento en lugar de los 50 | 4 de 15 episodios, sin mejora |

## Requisitos de hardware

- VRAM estimada para inferencia: con 450 M de parámetros, los pesos ocupan aproximadamente 0,9 GB en bf16 y 1,8 GB en fp32; sumando activaciones, el codificador visual y dos imágenes de 640x480, una estimación razonable es de 2-4 GB en bf16 (estimación propia, no publicada por el autor).
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM; el autor entrenó en una RTX 4090.
- Cabe en GPU de consumo: sí, con margen amplio (RTX 3060 de 12 GB, RTX 4060 Ti, RTX 4070, RTX 4090). Ejecución en CPU técnicamente posible por el tamaño, pero incompatible en la práctica con el control a 30 Hz.
- Entrenamiento: 10.000 pasos con batch 64 en una RTX 4090 en 1,9 horas, según el autor.
- Opciones de despliegue: LeRobot 0.4.4 con SmolVLAPolicy.from_pretrained, cargando los pre y post-procesadores guardados con make_pre_post_processors. vLLM, TGI, llama.cpp y Ollama no aplican: no hay pesos GGUF ni es un modelo de lenguaje.
- Latencia y throughput de inferencia: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| chess_phase_smolvla_baseline | 450.046.176 | No aplica (observaciones de 2 cámaras a 30 Hz) | 36,7% de éxito en 60 episodios simulados sobre 10 movimientos | Apache 2.0 | HuggingFace, librería lerobot, 0 descargas y 0 likes |
| lerobot/smolvla_base | 450.046.176 (idéntico tras el ajuste) | No aplica | No disponible para esta tarea concreta (es el modelo base sin ajustar) | Apache 2.0 | HuggingFace, base de referencia de SmolVLA |
| Machanize/chess_phase_smolvla | No disponible | No aplica | No disponible | No disponible | Versión anterior del mismo autor; este modelo se entrenó desde cero, no desde ella |
| OpenVLA | ≈7.000 M (dato de conocimiento general, no aportado por la información disponible) | No aplica | No disponible | No disponible | VLA open source ampliamente citado como referencia de mayor tamaño |

## Limitaciones y advertencias

- Simulación únicamente: no se ha ejecutado en un brazo real.
- Una sola escena fija y diez movimientos. Otras posiciones de tablero, vistas de cámara, iluminaciones o juegos de piezas no están probados y se espera que fallen hasta que se reintroduzca la variedad.
- Fiabilidad baja: 36,7% de éxito global, con movimientos entre el 0,0% (c2-c4) y el 66,7% (c7-c5).
- El fallo dominante es el agarre: con la pinza descentrada empuja la pieza (7 de 20) o cierra a su lado (6 de 20), con desviaciones de 4-6 mm frente a 0,8-0,9 mm en los agarres que sí sujetan.
- El marcador es obligatorio: sin los cuadrados rojo y azul superpuestos el modelo no sabe qué pieza mover.
- Sensibilidad al pipeline de imagen: el entrenamiento usó H.264 CRF 18 con 4:4:4; otras codificaciones pueden alterar el color de los marcadores y degradar el comportamiento.
- Datos de entrenamiento privados (Machanize/playful, carpeta chess-sim/datasets/baseline_v1), lo que limita la reproducibilidad externa del ajuste.
- Sin resultados en benchmarks estándar; además, estos no aplican porque no es un modelo de lenguaje ni un modelo multimodal de propósito general.
- Idiomas: no aplica; la única instrucción es una frase fija en inglés.
- Sesgo y sobreajuste: la posición inicial es idéntica en todos los episodios y solo cambian los marcadores, de modo que el modelo puede apoyarse en la memoria de la escena más que en la lectura de los marcadores para los movimientos concretos.
- Riesgo equivalente a la alucinación: el modelo puede ejecutar acciones plausibles pero incorrectas (empujar la pieza, cerrar la pinza fuera de sitio o mover otra pieza) sin señal de incertidumbre.
- Intervalos de confianza amplios por movimiento: entre 3 y 10 episodios por movimiento en la evaluación, insuficiente para conclusiones finas.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución con atribución y conservación del aviso de licencia; aun así, el estado de fiabilidad del modelo desaconseja cualquier uso en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Machanize/chess_phase_smolvla_baseline
- Modelo base SmolVLA: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento (privado): Machanize/playful, carpeta chess-sim/datasets/baseline_v1 — https://huggingface.co/Machanize/playful
- Versión anterior del mismo autor: https://huggingface.co/Machanize/chess_phase_smolvla
- Variante anunciada como siguiente paso (no verificada): Machanize/chess_phase_smolvla_baseline_r2
- Librería LeRobot: https://github.com/huggingface/lerobot
- Repositorio sin ficha adicional, paper, blog ni demo pública localizados en la información disponible.
