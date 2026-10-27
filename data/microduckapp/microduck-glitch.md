# microduckapp/microduck-glitch

## Resumen

microduck-glitch es una política de movimiento (motion policy) publicada por microduckapp para el robot bípedo Microduck, no un modelo de lenguaje. Se distribuye como un único artefacto ONNX (`policy.onnx`) que reproduce un movimiento de 11,6 segundos de duración: el robot camina, se congela a mitad de paso, sufre espasmos, cae de cabeza, se reinicia y vuelve a fallar. El problema que resuelve es la reproducción determinista de una animación concreta y expresiva sobre el hardware del pato, dentro del ecosistema de la app MicroDuck.

Técnicamente es una política de control de extremo a extremo con 61 valores de observación como entrada y 14 consignas articulares como salida, ejecutada a 50 Hz (20 ms por ciclo). Forma parte de un catálogo de 16 modelos publicados por la misma organización en Hugging Face, con el mismo formato de distribución: la política, un `manifest.json` con lo que el robot necesita instalar y reproducir, y un vídeo de previsualización.

Su relevancia es de nicho: sirve como ejemplo canónico del formato de empaquetado de movimientos de MicroDuck y como caso de prueba para el pipeline de instalación y reproducción. No hay licencia declarada, no hay documentación de entrenamiento y el repositorio no tiene descargas ni interacciones en el momento de la consulta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de control neuronal serializada en ONNX (topología interna no documentada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se documenta una arquitectura MoE) |
| Longitud de contexto | no aplica; ventana de observación de 61 valores por ciclo de control |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX; no se documenta cuantización fp16/int8) |
| Idiomas soportados | no aplica (no es un modelo de lenguaje; no procesa texto) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) |
| Entradas | 61 observaciones |
| Salidas | 14 consignas articulares (joint targets) |
| Frecuencia de control | 50 Hz |
| Duración del movimiento | 11,6 s |
| Artefactos del repo | `policy.onnx`, `manifest.json`, `media/preview.mp4` |
| Tamaño del repositorio | 0,0 GB |
| Pipeline declarado en Hugging Face | robotics |

## Arquitectura y entrenamiento

La información publicada no describe la topología de la red: solo se especifica el contrato de entrada/salida (61 observaciones hacia 14 objetivos articulares) y la frecuencia de ejecución de 50 Hz. No se detallan capas, número de parámetros, función de activación ni si la política incorpora memoria (recurrencia) o es puramente reactiva por ciclo. Tampoco se documenta el proceso de entrenamiento, el número de tokens o muestras, la composición del dataset ni si se emplearon técnicas de RL, imitación o ajuste posterior.

El contexto del ecosistema MicroDuck, según las fuentes públicas localizadas, apunta a un robot bípedo compacto entrenado con aprendizaje por refuerzo y evaluado en simulación antes de transferirse al hardware físico, pero esas fuentes describen el proyecto en general y no este artefacto en particular. Cualquier afirmación sobre el método de entrenamiento de `microduck-glitch` sería una extrapolación no verificada.

## Capacidades

- Reproducción de una secuencia de movimiento predefinida de 11,6 s con comportamiento de fallo deliberado (caminar, congelarse, espasmos, caída de cabeza, reinicio).
- Inferencia de política de control a 50 Hz: mapea 61 observaciones del robot a 14 consignas articulares por ciclo.
- Ejecución sobre el runtime del ecosistema MicroDuck, guiada por `manifest.json`, que declara qué debe instalar y reproducir el robot.
- Compatibilidad con cualquier runtime que soporte ONNX (ONNX Runtime, etc.).
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No tiene capacidades de generación de texto, código, matemáticas, visión, audio ni multilingüismo.
- No se documentan modos especiales (thinking, planificación, adaptación en línea).

## Casos de uso

- Demostración de producto y contenido audiovisual: el movimiento está pensado como pieza expresiva y autoconclusiva de 11,6 s, con previsualización incluida en `media/preview.mp4`, útil para vídeos de presentación del robot.
- Validación del pipeline de instalación: `manifest.json` permite comprobar de extremo a extremo el flujo de instalación, resolución de dependencias y arranque de políticas de la app MicroDuck.
- Prueba de robustez del controlador: la secuencia incluye caída de cabeza y reinicio, lo que la convierte en un caso de estrés para la lógica de recuperación y reinicio del robot.
- Test de regresión del runtime de inferencia: al tener un contrato de E/S fijo (61 a 14) y una cadencia fija (50 Hz), sirve para verificar que una build del runtime mantiene latencias y formas de tensor correctas.
- Docencia y divulgación en robótica: ejemplo compacto de cómo se empaqueta y distribuye una política de control junto a su manifiesto y su material de demostración.
- Investigación en percepción de fallos: la secuencia puede emplearse como estímulo controlado para evaluar detectores de anomalías o de caída en robots bípedos.
- Instalaciones artísticas o robótica de exhibición: el comportamiento errático y cíclico encaja en piezas que buscan un efecto de fallo programado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existe una métrica estándar aplicable a este tipo de artefacto (política de movimiento), y la model card no incluye tasas de éxito en simulación, error de seguimiento articular, estabilidad ni métricas de transferencia sim-to-real. La única evidencia de comportamiento es el vídeo `media/preview.mp4`.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 0,0 GB y el contrato de E/S es mínimo (61 entradas, 14 salidas), por lo que el coste de inferencia es marginal frente al bucle de control; cualquier CPU capaz de ejecutar ONNX Runtime dentro del presupuesto de 20 ms por ciclo debería bastar (estimación derivada del contrato de E/S, no dato publicado).
- GPU recomendadas: no disponibles; no se documenta ningún requisito de aceleración por GPU.
- Viabilidad en GPU de consumo: no aplica según la documentación publicada; el artefacto parece orientado a ejecución en el ordenador de a bordo del robot.
- Opciones de despliegue: ONNX Runtime o cualquier motor compatible con ONNX; la integración concreta la define `manifest.json` y la app MicroDuck. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de artefacto.
- Latencia y throughput: se conoce la cadencia objetivo de 50 Hz, es decir, un presupuesto de 20 ms por ciclo. No se publican latencias medidas ni margen de holgura del runtime.

## Comparativa con modelos similares

| Modelo | Tipo | Entradas / salidas | Frecuencia | Duración | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| microduck-glitch | Política de movimiento ONNX | 61 / 14 | 50 Hz | 11,6 s | no disponible | Pública en HF (0 descargas) |
| microduck-midnight-snack | Política de movimiento (misma organización) | no disponible | no disponible | no disponible | no disponible | Pública en HF |
| Políticas del proyecto pollen-robotics/microduck | Políticas de control del robot | no disponible | no disponible | no disponible | no disponible | Repositorio público de hardware y software; no se ha localizado una política equivalente con datos publicados |

La organización microduckapp mantiene 16 modelos en Hugging Face con el mismo formato de empaquetado. No se dispone de datos públicos de parámetros, contexto o rendimiento para establecer una comparación cuantitativa entre ellos.

## Limitaciones y advertencias

- Licencia no declarada: no se especifican condiciones de uso comercial, redistribución ni obra derivada; en producción esto constituye un riesgo legal que debe resolverse con el autor.
- Ausencia total de documentación de entrenamiento: sin dataset, método ni métricas, no es posible evaluar sesgos, cobertura ni generalización.
- Movimiento de duración fija (11,6 s) y propósito expresivo: no es una política de locomoción general ni admite composición con otros movimientos sin trabajo adicional.
- Acoplamiento al hardware: los 14 objetivos articulares presuponen la cinemática concreta del Microduck; no es portable a otro robot sin reentrenamiento o retargeting.
- Riesgo físico: la secuencia incluye caída de cabeza y reinicio; debe ejecutarse con la protección mecánica y el espacio libre previstos por el proyecto, y no en entornos con personas u objetos frágiles al alcance.
- Sin garantías de robustez: al no publicarse métricas, se desconoce el comportamiento ante perturbaciones, terreno irregular o desviaciones del estado inicial esperado.
- Sin soporte de lenguaje, visión ni tool calling: no puede emplearse en tareas de texto, agentes o automatización cognitiva.
- Sin mantenimiento verificable: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso comunitario ni de soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/microduckapp/microduck-glitch
- Organización en Hugging Face: https://huggingface.co/microduckapp
- Repositorio del robot Microduck (pollen-robotics): https://github.com/pollen-robotics/microduck
- Tutorial de montaje y software: https://github.com/AI-FanGe/Microduck-build-tutorial
- Curso y material de referencia del sistema Microduck: https://eai-course.github.io/microduck/
- Guías de simulación, políticas y entrenamiento: https://microduckrobot.org/guides/
