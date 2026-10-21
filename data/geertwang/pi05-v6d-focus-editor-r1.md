# GeertWang/pi05-v6d-focus-editor-r1

## Resumen

pi05-v6d-focus-editor-r1 es un pequeño «editor de acciones» entrenado con RL offline sobre una política pi0.5 congelada, destinado a una tarea bimanual de pipeteo con un robot Unitree G1 equipado con manos Inspire. Lo publica el usuario GeertWang en HuggingFace y no es un modelo de lenguaje ni un VLA completo: es un módulo residual que corrige el chunk de acciones que propone la política base, sin modificarla. El repositorio contiene exclusivamente el checkpoint de la ronda 1 (600 actualizaciones del learner) y el snapshot de replay exacto con el que se entrenó.

La relevancia es metodológica: demuestra cómo mejorar una fase concreta de una tarea de manipulación (la inserción, fase P3) mediante RL offline con recompensas dispersas y datos de teleoperación ya existentes, manteniendo la política base intacta gracias a una inicialización a cero que reproduce exactamente el comportamiento original en el paso 0. En el robot real, la ronda 1 redujo la mediana de duración de P3 de 48 s a 26 s en 23 episodios que alcanzaron esa fase, con 3,5 intervenciones humanas por episodio frente a 4,5 de la política congelada.

El artefacto es de tamaño reducido (1,4 GB de repositorio, de los cuales 258 MB son el checkpoint y 1,1 GB el snapshot de datos) y está pensado para reproducir investigación, no para despliegue generalista. No se declara licencia ni idiomas, y no hay métricas de benchmarks estándar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Editor MLP (actor) sobre características de prefijo congeladas de pi0.5, con crítico gemelo estilo TD3; política base pi0.5 (VLA) congelada |
| Parámetros totales | No disponible (el checkpoint de 258 MB incluye actor, crítico gemelo, redes target y estados de optimizadores) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje). Entrada fija: 16.384 dimensiones de features visuales agrupadas + estado normalizado de 65 dimensiones + chunk de referencia 30×32 + one-hot de fase |
| Tipos de cuantización | No disponible (checkpoint PyTorch cargable con `weights_only=True`; no se documentan cuantizaciones) |
| Idiomas soportados | No aplica / no disponible |
| Licencia | No disponible |
| Formato de pesos | `.pt` (PyTorch) para el checkpoint; `.npz` y `.json` para el snapshot de replay; `.yaml` para la receta de entrenamiento |

## Arquitectura y entrenamiento

La política base es el checkpoint pi0.5 v6d FOCUS `jren313/starvla-pipette-5task-v6d-pi05-egofocusvel` (revisión `b0b5f369…`), que consume RGB ego más un recorte FOCUS y la velocidad de muñeca como estado del modelo, y emite un chunk de acciones de 30×32 que actúa como referencia. Sobre ella se monta un actor MLP que recibe las características de prefijo agrupadas (2 vistas × 2×2 regiones × 2048 = 16.384 dimensiones), el estado normalizado de 65 dimensiones, el chunk de referencia completo y un one-hot de fase, y produce un residual acotado `0.2·tanh(·)` sobre las 18 dimensiones activas de las 30 filas del chunk. El actor está inicializado a cero, de modo que en el paso 0 replica exactamente la política congelada; los canales retenidos por fase y las 14 semillas de articulaciones para IK quedan sin modificar.

El learner es de estilo TD3 con crítico gemelo, que además codifica el contexto del planificador asíncrono. La pérdida del actor combina 1,0·MSE de imitación humana (BC), 1,0·MSE respecto a la referencia y −0,1·Q. Hiperparámetros: batch 128, lr del actor 1e-4, lr del crítico 3e-4, τ 0,005, actualización del actor cada 2 pasos, 600 actualizaciones y semilla 42. La recompensa es dispersa: +1 por hito de fase (P1–P4) y +11 por éxito de la tarea completa, descontada por tiempo transcurrido. La ejecución usa blending ACT asíncrono con inferencia a 5 Hz, reproducción del chunk a 30 Hz y decaimiento 0,01.

Los datos provienen de un snapshot de 15 episodios exitosos de tarea completa (P1→P5) recogidos con el «editor cero», es decir, con la política pi0.5 congelada y con intervenciones del operador mediante PICO o joystick, lo que suma 8.203 ventanas de decisión. Cada ventana incluye token y next_token (features visuales congeladas de 16.384 dimensiones), estado y next_state de 65 dimensiones, referencia y next_reference, acción de 30×18, máscaras (`valid`, `human`, `bc_eligible`, `td_eligible`), fase, marcas de tiempo, `scheduler_context` y resultado del episodio. No se incluyen imágenes de cámara crudas: el snapshot contiene únicamente las features sobre las que entrena el learner. El código de entrenamiento es el learner `gr00t_rlt` de VLA-Precision (`scripts/gr00t_rlt.py::fit_heads`); esta ronda es anterior a tres opciones posteriores del learner (filtro de humano estático, cuota de batch humano y reetiquetado de chunk completo al exportar).

## Capacidades

- Edición de acciones sobre una política VLA congelada: aplica correcciones residuales acotadas (±0,2) sobre 18 dimensiones activas de un chunk de 30 pasos.
- Ejecución de una tarea bimanual de laboratorio: pipeteo completo con fases P1 a P5 sobre Unitree G1 con manos Inspire.
- Mejora localizada de la fase de inserción (P3), con reducción de la mediana de duración y del número de intervenciones del operador.
- Aprendizaje por RL offline con recompensas dispersas a partir de datos de teleoperación, sin interacción adicional con el robot durante el entrenamiento.
- Modo de seguridad por construcción: inicialización a cero que garantiza equivalencia exacta con la política base antes de entrenar.
- Inferencia asíncrona compatible con control en tiempo real: 5 Hz de inferencia del editor con reproducción del chunk a 30 Hz.
- No soporta generación de texto, código, matemáticas, visión general, tool calling ni razonamiento multi-paso; no es un modelo de propósito general.

## Casos de uso

- Refinamiento de la fase de inserción en manipulación bimanual de precisión: el editor corrige el chunk de la política base en los pasos críticos de alineación, reduciendo la mediana de P3 de 48 s a 26 s en el robot real, lo que lo hace adecuado para tareas de pipeteo donde el tiempo de inserción domina el ciclo.
- Reducción de la carga de teleoperación: al bajar las intervenciones humanas de 4,5 a 3,5 por episodio, permite que un único operador supervise más réplicas experimentales en un laboratorio de biología automatizada.
- Aprovechamiento de datos de teleoperación ya existentes: el entrenamiento consume un snapshot de 15 episodios y 8.203 ventanas, de modo que un equipo puede mejorar una política desplegada sin organizar nuevas campañas de recogida con el robot físico.
- Investigación en RL offline con recompensas dispersas: la combinación de recompensa por hitos, imitación humana y anclaje a la referencia sirve como banco de pruebas reproducible para estudiar estabilidad de TD3 sobre features congeladas de un VLA.
- Iteración segura sobre un sistema en producción: el residual acotado y la inicialización a cero permiten desplegar versiones intermedias del editor sabiendo que, en el peor caso, el comportamiento converge al de la política congelada ya validada.
- Reproducción y auditoría de experimentos: el repositorio incluye la receta YAML, el snapshot exacto y hashes SHA-256 del checkpoint y de los datos, lo que facilita verificar la trazabilidad de un resultado publicado en un artículo o informe interno.
- Prototipado de arquitecturas de control asíncronas: el esquema 5 Hz de inferencia / 30 Hz de reproducción con blending ACT y decaimiento 0,01 es directamente reutilizable para validar pipelines de inferencia remota en robots con control a 30 Hz.
- Docencia y formación técnica: el tamaño reducido del editor y la disponibilidad del snapshot permiten estudiar un caso completo de RL offline sobre un VLA sin necesidad de acceso al robot ni a las imágenes originales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, y no resultarían aplicables al tratarse de un editor de acciones para robótica. El autor sí reporta métricas operativas en robot real para la ronda 1:

| Métrica | Editor ronda 1 (step 600) | Política pi0.5 congelada |
|---|---|---|
| Episodios que alcanzan la fase P3 | 23 | No disponible |
| Mediana de duración de P3 | 26 s | 48 s |
| Intervenciones del operador por episodio | 3,5 | 4,5 |

No se han publicado métricas de éxito por fase (P1–P4), tasas de éxito de tarea completa ni curvas de aprendizaje por actualización.

## Requisitos de hardware

- VRAM para el editor: no disponible de forma oficial. El checkpoint completo ocupa 258 MB e incluye actor, crítico gemelo, redes target y estados de optimizadores, por lo que el actor es una fracción pequeña de esa cifra y no es el cuello de botella de memoria.
- VRAM para la política base: no disponible. La inferencia requiere la política pi0.5 congelada (RGB ego más recorte FOCUS), cuyo peso no se publica en este repositorio; el requisito real de GPU viene determinado por esa política, no por el editor.
- GPU recomendadas: no disponible en la información proporcionada. No se documentan modelos concretos (A100, H100, RTX 4090) ni perfiles de memoria.
- Viabilidad en GPU de consumo: no disponible. El editor por sí solo sería apto para hardware modesto, pero el sistema completo depende del coste de la política base, que no se especifica.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo). El checkpoint se carga con PyTorch (`weights_only=True`) y el pipeline de control se ejecuta con inferencia a 5 Hz y reproducción del chunk a 30 Hz.
- Latencia y throughput: la única cifra publicada es la cadencia de inferencia de 5 Hz con reproducción a 30 Hz y decaimiento 0,01 mediante blending ACT asíncrono. No se publican latencias por paso, throughput por GPU ni tiempos de entrenamiento.

## Comparativa con modelos similares

No se dispone de información sobre otros editores de acciones publicados comparables. La única referencia directa en la documentación es la política base congelada, que actúa como línea base del experimento:

| Modelo | Tipo | Entrada | Salida | Rendimiento en P3 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| pi05-v6d-focus-editor-r1 (este) | Editor residual MLP + crítico TD3 sobre pi0.5 congelada | Features 16.384-d, estado 65-d, chunk de referencia 30×32, one-hot de fase | Residual 0,2·tanh sobre 18 dims × 30 filas | Mediana 26 s; 3,5 intervenciones/episodio | No disponible | HuggingFace, 0 descargas, 0 likes |
| pi0.5 v6d FOCUS (`jren313/starvla-pipette-5task-v6d-pi05-egofocusvel`) | Política VLA congelada (referencia) | RGB ego + recorte FOCUS + velocidad de muñeca | Chunk de acciones 30×32 | Mediana 48 s; 4,5 intervenciones/episodio | No disponible | HuggingFace |
| Otros editores o VLAs para G1 | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Licencia no declarada: no hay términos publicados, por lo que el uso comercial, la redistribución o la modificación quedan en un limbo legal hasta que el autor los explicite.
- Reproducción no verificada: el propio autor indica que la reproducción bit a bit del checkpoint no se ha comprobado, y que la receta de la ronda 1 requiere desactivar tres opciones (`keep_static_human=True`, `human_batch_fraction=0` y el reetiquetado de chunk completo) para entrenar con código posterior.
- Dependencia de una revisión concreta: el editor está acoplado a la revisión `b0b5f369…` del checkpoint pi0.5 base y a su chunk de referencia de 30×32; sustituir la política base invalida la calibración del residual.
- Datos muy limitados: 15 episodios y 8.203 ventanas de una única tarea, robot y configuración de manos; el riesgo de sobreajuste y la falta de generalización a otras tareas o posiciones de partida no se han evaluado.
- Cobertura parcial de etiquetas humanas: las etiquetas cubren aproximadamente las filas 1–5 de las 30 de cada ventana, lo que sesga la señal de imitación hacia el inicio de cada chunk.
- Imposibilidad de reentrenar la cabeza de acciones de pi0.5 con este repositorio: al no publicarse las imágenes crudas, solo se puede reproducir esta ronda del editor, no la exportación o el reentrenamiento del VLA base.
- Recompensa dispersa y dependiente de hitos de fase: la señal depende de la detección correcta de P1–P4 y del éxito de tarea completa, lo que puede introducir comportamientos que exploten la definición de hito en lugar de mejorar la tarea.
- Alcance funcional mínimo: no genera texto, código ni razonamiento, y no soporta tool calling, agentes ni capacidades multilingües; cualquier uso fuera del control robótico de bajo nivel no es viable.
- Métricas limitadas y de una sola ronda: los resultados en P3 provienen de 23 episodios de una ronda concreta, sin intervalos de confianza, sin ablaciones publicadas ni comparación con otras variantes del editor.
- Validación comunitaria nula: el repositorio tiene 0 descargas y 0 likes, sin issues ni terceros que hayan replicado los resultados.
- Resultados de búsqueda web no relacionados: las consultas externas devolvieron únicamente páginas de Twitch, sin información adicional sobre el modelo o su contexto.

## Enlaces

- Repositorio del modelo: https://huggingface.co/GeertWang/pi05-v6d-focus-editor-r1
- Política base pi0.5 v6d FOCUS (referencia congelada): https://huggingface.co/jren313/starvla-pipette-5task-v6d-pi05-egofocusvel
- Papers, blogs, repositorios o demos adicionales: no disponible en los resultados de búsqueda proporcionados.
