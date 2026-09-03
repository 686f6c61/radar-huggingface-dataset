# DaoyuanZhu/wb_pointed_chair_pull_push_posture

## Resumen

El modelo `DaoyuanZhu/wb_pointed_chair_pull_push_posture` es un clasificador de posturas diseñado para el robot humanoide Unitree G1, desarrollado por DaoyuanZhu. Su función es determinar, a partir de la cámara del pecho del robot, si la persona que tiene delante está **de pie**, **comenzando a sentarse** o **ya sentada**. El objetivo concreto es activar la acción de empujar la silla hacia atrás cuando el humano inicia el movimiento de sentarse, dentro de una tarea de interacción físico-robotica.

Se trata de una CNN extremadamente ligera con solo 224.483 parámetros, que procesa una ventana causal de 9 frames en escala de grises (160x120 píxeles) y funciona a 680 FPS en un solo hilo de CPU, sin necesidad de GPU. Está entrenado con etiquetas generadas automáticamente a partir de captura de movimiento sin marcadores (markerless mocap), sincronizadas con episodios de LeRobot. Su relevancia radica en que demuestra que una tarea de percepción robótica en tiempo real puede resolverse con un modelo mínimo, sin depender de estimadores de pose ni de hardware especializado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (convolucional) sobre píxeles en gris |
| Parametros totales | 224.483 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | Ventana temporal de 1,07 s (9 frames con stride 4) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (genera frases en lenguaje natural, probablemente inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una CNN compacta que recibe como entrada una secuencia de 9 frames en escala de grises de 160x120 píxeles, muestreados con un stride de 4 sobre un buffer circular de 33 frames (equivalente a 1,07 segundos a 30 FPS). La inferencia es estrictamente causal: solo se utilizan frames actuales y pasados, lo que permite su uso en línea sin latencia adicional.

Las etiquetas de entrenamiento no fueron anotadas manualmente. Se derivaron de una grabación de mocap sin marcadores sincronizada 1:1 con la línea temporal de los episodios de LeRobot. A partir de un esqueleto 3D de 40 puntos, se calculó la altura de cadera normalizada `h = (z_hip - z_floor) / (z_hip_standing - z_floor)` y se aplicó un umbral con histéresis: `h >= 0.95` para "de pie", `h <= 0.68` para "sentado", y la ventana de "sentándose" abarca desde el último frame de altura de pie hasta el inicio de la secuencia sentada. Este enfoque evita inestabilidades cuando el sujeto hace pausas durante el descenso. De los 80 episodios, 79 contienen exactamente un evento de sentada limpio (mediana de 1,80 s); el episodio restante no tiene evento porque la persona permanece de pie.

Un detalle relevante del proceso de etiquetado es que el tracklet "primario" del pipeline de mocap identificaba a la persona incorrecta en 27 de 80 episodios (se fijaba en el teleoperador o en un espectador). El autor corrigió esto re-seleccionando al sujeto por episodio como el tracklet más alto con buena cobertura. Además, los landmarks 2D incluidos en el dataset no eran utilizables (cobertura media de 0,46 durante los frames de sentada), lo que motivó el uso de píxeles crudos en lugar de keypoints.

## Capacidades

- Clasificación de posturas en tres clases: `standing`, `sitting_down` y `seated`.
- Detección del inicio del movimiento de sentarse con alta fiabilidad: 10/10 eventos detectados en el conjunto de test, con 0 falsas alarmas y una mediana de 0,25 s antes del onset etiquetado.
- Inferencia causal y en streaming, apta para integración en bucles de control en tiempo real.
- Salida con probabilidades por clase y una frase en lenguaje natural (p. ej., "the person is sitting down").
- Rendimiento extremadamente alto: 680 FPS en un solo hilo de CPU, 1.250 FPS con 32 hilos y 6.600 FPS en una RTX 5080.
- Preprocesamiento integrado: acepta frames BGR de cualquier tamaño y los redimensiona internamente a 160x120 en gris.

## Casos de uso

- **Interacción físico-robotica asistiva**: el robot Unitree G1 detecta cuándo el humano comienza a sentarse y empuja la silla hacia atrás. El modelo se integra en el bucle de control del robot, activando la acción cuando la probabilidad de `sitting_down` supera 0,5 durante 3 frames consecutivos.
- **Monitorización de actividad en entornos domésticos**: un dispositivo con cámara fija puede clasificar si una persona está de pie, sentándose o sentada, útil para aplicaciones de cuidado de mayores o detección de caídas (adaptando el modelo a nuevos escenarios mediante fine-tuning).
- **Robótica educativa y de investigación**: al ser un modelo mínimo y de código abierto, sirve como punto de partida para enseñar clasificación de video en tiempo real en cursos de robótica o visión por computador.
- **Sistemas de seguridad y análisis de ocupación**: clasificación de posturas en vídeo para determinar si una persona está activa o sedentaria en un área vigilada, con requisitos mínimos de hardware.
- **Integración en pipelines de LeRobot**: el modelo está diseñado para consumir episodios de LeRobot y puede combinarse con otros módulos de percepción y control en tareas de manipulación y navegación.
- **Prototipado rápido de interacción humano-robot**: gracias a su velocidad y bajo coste computacional, permite probar comportamientos reactivos en robots de bajo coste sin necesidad de GPUs o servidores dedicados.

## Benchmarks y rendimiento

Los resultados se obtuvieron sobre 10 episodios reservados (de un total de 80), sin solapamiento entre entrenamiento y test.

| Metrica | Este modelo | Baseline keypoint MLP |
|---|---|---|
| Accuracy | 97,6 % | 95,2 % |
| Macro-F1 | 0,916 | 0,845 |
| F1 standing | 0,991 | 0,976 |
| F1 sitting_down | 0,815 | 0,730 |
| F1 seated | 0,941 | 0,829 |

Detección de inicio de sentada (probabilidad de `sitting_down` + `seated` >= 0,5 mantenida durante 3 frames): **10/10 eventos detectados, 0 fallos, 0 falsas alarmas**, con una mediana de **0,25 s antes** del onset etiquetado.

Acuerdo por episodio: media 97,7 %, peor 93,8 %, mejor 99,5 %.

Velocidad (batch size 1, una pasada por frame):

| Dispositivo | ms/frame | FPS |
|---|---|---|
| RTX 5080 | 0,15 | 6.600 |
| CPU, 32 hilos | 0,80 | 1.250 |
| CPU, 1 hilo | 1,47 | 680 |
| Preprocesamiento (640x480 BGR -> 160x120 gris) | 0,18 | — |

A 30 FPS, el presupuesto por frame es de 33,3 ms, por lo que un solo hilo de CPU consume aproximadamente el 5 % de ese presupuesto. No se necesita GPU.

## Requisitos de hardware

- **CPU**: funciona en cualquier procesador moderno; un solo hilo es suficiente para 680 FPS, muy por encima de los 30 FPS típicos de una cámara.
- **GPU**: no es necesaria. Si se dispone de una, una RTX 5080 alcanza 6.600 FPS, pero es un sobredimensionamiento innecesario.
- **VRAM**: no aplica para inferencia en CPU; en GPU el consumo es mínimo (modelo de 224K parámetros).
- **Despliegue**: el modelo se carga con PyTorch mediante `PostureRecognizer.from_pretrained()`. Es compatible con el ecosistema LeRobot y puede integrarse en pipelines de robótica.
- **Latencia**: la ventana causal de 1,07 s introduce un retardo fijo; el preprocesamiento añade 0,18 ms por frame. El onset detectado se adelanta una mediana de 0,25 s al etiquetado, lo que da margen al controlador.

## Comparativa con modelos similares

No se han encontrado modelos públicos comparables en la misma categoría (clasificación de posturas para robótica con cámara embebida y requisitos mínimos). El único punto de referencia es el baseline interno de MLP sobre keypoints, que el propio autor reporta como inferior (95,2 % accuracy vs 97,6 %). No hay modelos de referencia en HuggingFace con características equivalentes (tamaño, tarea y dominio robótico) que permitan una comparación directa.

## Limitaciones y advertencias

- **Inclinación profunda del torso**: si la persona se dobla hacia adelante sin bajar las caderas, el modelo puede clasificarlo como `sitting_down`. En el peor episodio de test, esto provocó una activación 1,9 s antes de lo esperado. Si los falsos positivos son críticos, se recomienda exigir que la probabilidad se mantenga durante ~10 frames en lugar de 3 (coste adicional de ~0,23 s).
- **Un solo escenario y un solo sujeto**: los 80 episodios provienen de la misma sala, la misma cámara y la misma persona. El modelo no generalizará a otros entornos sin fine-tuning.
- **Clase `standing_up` no soportada**: todos los episodios terminan con la persona sentada, por lo que no hay ejemplos de entrenamiento para el movimiento inverso. El código de etiquetado puede emitir esa clase, pero el modelo no la ha aprendido.
- **Etiquetas automáticas con posibles errores**: aunque el autor corrigió el problema del tracklet primario del mocap, la dependencia de un pipeline de captura de movimiento puede introducir imprecisiones en los límites de las clases.
- **Sin datos de sesgos demográficos**: al estar entrenado con una única persona, no se puede evaluar el comportamiento con diferentes edades, géneros, vestimenta o condiciones de iluminación.
- **Licencia Apache-2.0**: permite uso comercial, pero el modelo está pensado para un caso de uso muy específico; su reutilización fuera de ese contexto requerirá adaptación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DaoyuanZhu/wb_pointed_chair_pull_push_posture
- Dataset asociado: https://huggingface.co/datasets/DaoyuanZhu/wb_pointed_chair_pull_push_rgb
- Repositorio de código (mencionado en la model card, sin URL directa): contiene `label_posture.py` y `train_rgb.py` para reproducir etiquetas y entrenamiento.
