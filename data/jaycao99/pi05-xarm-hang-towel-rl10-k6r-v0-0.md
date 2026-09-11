# JayCao99/pi05-xarm-hang-towel-rl10-K6R-v0.0

## Resumen

Pi-0.5 (xarm hang towel) es un checkpoint de política robótica publicado por el usuario JayCao99 en Hugging Face bajo el identificador JayCao99/pi05-xarm-hang-towel-rl10-K6R-v0.0. Se trata de un modelo de tipo vision-language-action (VLA) orientado a control robótico por imitación, cargado mediante el ecosistema LeRobot y empaquetado en el formato de política `PI05Policy`. El checkpoint está pensado para despliegue directo: el subdirectorio `checkpoint-003450` contiene el payload `pretrained_model/` con `model.safetensors`, `config.json`, los pre/postprocesadores y `train_config.json`.

El nombre del repositorio indica que la política se ha ajustado para una tarea concreta con un brazo xArm (colgar una toalla, "hang towel"), sobre una variante derivada de Pi-0.5, con un identificador de run que incluye la etiqueta `rl10` y `K6R`. El repositorio completo ocupa 9,4 GB y declara el pipeline `robotics` junto con las etiquetas `robotics`, `imitation-learning` y `safetensors`.

La relevancia de esta ficha es acotada y conviene ser explícito: no hay model card descriptiva, no se declaran licencia ni idiomas, no hay métricas publicadas y el contador de descargas y likes es cero. La información disponible se limita a los metadatos del repositorio y al fragmento de README reproducido, por lo que la mayoría de los apartados técnicos quedan marcados como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política VLA cargada mediante `lerobot.policies.pi05.modeling_pi05.PI05Policy`; no se detalla la arquitectura interna) |
| Parametros totales | no disponible |
| Parametros activos | no aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en `safetensors`, sin variantes GGUF/AWQ/GPTQ declaradas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `safetensors` (`model.safetensors` dentro de `checkpoint-003450/pretrained_model/`) |
| Libreria | lerobot |
| Pipeline | robotics |
| Tarea declarada | manipulación robótica por imitación (colgar una toalla con xArm) |
| Checkpoints incluidos | 1 (`checkpoint-003450`, paso de entrenamiento 3.450) |
| Pérdida final de entrenamiento | no disponible (la tabla del README deja la celda vacía) |
| Tamaño del repositorio | 9,4 GB |
| Idiomas de la model card | no disponible |

## Arquitectura y entrenamiento

La model card no describe la arquitectura. Lo único verificable es que el checkpoint se carga con `PI05Policy` de la librería LeRobot, es decir, que sigue la implementación de política Pi-0.5 integrada en ese framework. No se especifican el número de parámetros, el tipo de backbone, el mecanismo de atención, ni si se emplea un experto de acciones separado, flow matching u otra cabeza de decodificación de acciones. Tampoco se indica la dimensionalidad de las observaciones (resolución de cámara, número de vistas), la frecuencia de control ni el espacio de acciones.

Respecto al entrenamiento, el README solo aporta que es un checkpoint subido automáticamente por el script `goal_gen/upload_hf_checkpoints.sh` y que corresponde al paso 3.450. La etiqueta `rl10` del nombre sugiere una iteración o variante de un pipeline con componente de reinforcement learning, y `K6R` sugiere una configuración concreta de tarea o de semilla, pero ninguna de estas interpretaciones está confirmada en la información disponible. No se documentan el número de tokens, la composición del dataset, ni si hubo RLHF, DPO o ajuste por recompensa; tampoco se detalla la estrategia de recogida de demostraciones (teleoperación u otra).

## Capacidades

- Generación de acciones motoras para un brazo robótico xArm en la tarea de colgar una toalla, a partir de observaciones visuales y del estado del robot (según el nombre y la etiqueta de la tarea).
- Ejecución de políticas por imitación (imitation learning) en el sentido de generar comandos de control a partir de demostraciones, no de texto libre.
- Carga y despliegue directo mediante la API de LeRobot: `PI05Policy.from_pretrained(...)` sobre el subdirectorio del checkpoint.
- Compatibilidad con el ecosistema LeRobot para evaluación y ejecución de políticas.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso simbólico: no disponible (el modelo es una política de control, no un agente conversacional).
- Capacidades multilingües: no aplica / no disponible.
- Capacidades especiales (modo thinking, visión, audio, generación de texto): no disponibles como capacidades declaradas; se desconoce si el backbone subyacente es multimodal, aunque la tarea implica percepción visual.

## Casos de uso

- Despliegue sobre un brazo xArm para la tarea de colgar toallas: el checkpoint está empaquetado como payload listo para inferencia (`pretrained_model/`), por lo que puede cargarse con `PI05Policy.from_pretrained` y conectarse al bucle de control del robot para reproducir la habilidad aprendida.
- Punto de partida para ajuste fino adicional: al ser un checkpoint de paso 3.450 con `train_config.json` incluido, sirve como inicialización para continuar el entrenamiento en variaciones de la misma tarea o en tareas relacionadas de manipulación textil.
- Evaluación comparativa de checkpoints intermedios: permite medir el efecto del número de pasos de entrenamiento sobre la tasa de éxito en la tarea, integrándose en el harness de evaluación de LeRobot.
- Investigación en políticas VLA para manipulación deformable: las toallas son objetos deformables, un caso difícil para políticas de imitación; este checkpoint permite estudiar el comportamiento del modelo en ese régimen.
- Reproducción de experimentos de un pipeline con componente RL: la etiqueta `rl10` permite, si se dispone del resto del pipeline, reproducir o comparar esta iteración concreta contra otras variantes (K6R u otras).
- Integración en flujos de recogida de datos guiada por política: usar la política como base para teleoperar o para generar episodios de evaluación, alimentando ciclos posteriores de entrenamiento por imitación.
- Pruebas de infraestructura de despliegue robótico: sirve para validar el pipeline completo de descarga desde el Hub (`snapshot_download` con `allow_patterns`) y carga en memoria en el hardware objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente incluye una tabla con el paso de entrenamiento (3.450) y deja la columna de pérdida final de entrenamiento sin valor, por lo que no hay métricas de éxito, ni tasas de acierto en simulación o en robot real, ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El repositorio completo ocupa 9,4 GB, pero ese tamaño incluye el payload del checkpoint y metadatos, de modo que no puede traducirse directamente en requisitos de VRAM sin conocer el número de parámetros y la precisión de carga.
- GPU recomendadas: no disponible. No se indica ningún hardware validado por el autor.
- Compatibilidad con GPU de consumo: no confirmada. No hay información sobre si el checkpoint cabe en tarjetas tipo RTX 3060, 4090 o similares.
- Opciones de despliegue: LeRobot (`PI05Policy`) y, por tanto, el stack de inferencia asociado a LeRobot. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que en cualquier caso no son el formato natural para una política VLA de control.
- Latencia y throughput: no disponibles. En robótica estos valores dependen de la frecuencia de control exigida por la tarea y del hardware, y no se han publicado.
- Almacenamiento: al menos 9,4 GB libres para el repositorio completo, o el tamaño del subconjunto descargado si se usa `allow_patterns="checkpoint-003450/*"`.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye resultados de benchmarks ni referencias a políticas comparables, y la búsqueda web asociada no devolvió material técnico relevante. Sin datos de rendimiento no es posible establecer una comparación rigurosa con otras políticas VLA o con otros checkpoints de la misma familia Pi-0.5.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JayCao99/pi05-xarm-hang-towel-rl10-K6R-v0.0 | no disponible | no disponible | no disponible | no disponible | Hugging Face (repo público) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de model card descriptiva: no hay documentación de arquitectura, datos de entrenamiento, hiperparámetros de inferencia ni procedencia del dataset.
- Licencia no declarada. En ausencia de licencia explícita, no puede asumirse permiso de uso comercial ni de redistribución; hay que contactar con el autor o tratar el artefacto como no licenciado para producción.
- Especialización extrema: la política está ajustada a una única tarea (colgar una toalla con un xArm) y no cabe esperar generalización a otras tareas, objetos u hogares sin nuevo ajuste fino.
- Riesgo de alucinación en el sentido robótico: como política de imitación, puede producir trayectorias fuera de distribución ante cambios de iluminación, fondo, posición inicial del objeto o del robot, sin señal de incertidumbre calibrada.
- Sin métricas de éxito publicadas: no hay evidencia cuantitativa de que el checkpoint funcione de forma fiable, ni en simulación ni en robot real.
- Idiomas: no aplica a una política de control, pero se desconoce si el backbone tiene capacidades lingüísticas y en qué idiomas.
- Etiquetas ambiguas: `rl10` y `K6R` no están explicadas en la model card, por lo que no puede determinarse con certeza qué variante de entrenamiento representan.
- Cero descargas y cero likes: no hay señal de validación por parte de la comunidad ni informes independientes de uso.
- Metadatos de fecha anómalos: el repositorio figura como creado y actualizado el 2026-09-11, lo que puede deberse a un error de reloj o de la plataforma; conviene verificarlo antes de citarlo.
- Los resultados de la búsqueda web asociada no contienen información técnica sobre este modelo (devolvieron páginas comerciales no relacionadas), por lo que no hay fuentes independientes que corroboren ningún dato.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JayCao99/pi05-xarm-hang-towel-rl10-K6R-v0.0
- Repositorio LeRobot (framework de carga de la política): no disponible en la información proporcionada.
- Paper o documentación técnica de Pi-0.5: no disponible en la información proporcionada.
- Blog o demo del autor: no disponible.
- La búsqueda web realizada no devolvió enlaces relevantes al modelo.
