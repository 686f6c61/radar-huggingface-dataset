# djduecaster/dfreq-roller-ppo056-20261105

## Resumen

Roller PPO056 es un checkpoint de investigación de aprendizaje por refuerzo (PPO) entrenado para controlar un agente tipo "roller" dentro de Microduck Arena, un entorno de simulación física. El modelo lo publica el autor independiente djduecaster y se distribuye en formato ONNX, pensado para inferencia nativa en CPU y en MPS (Metal Performance Shaders de Apple). No es un modelo de lenguaje generativo, sino una política de control que transforma observaciones del entorno en acciones discretas: recibe exactamente 61 observaciones y emite 14 acciones posibles.

El checkpoint corresponde a la iteración 56 de una ejecución de entrenamiento PPO en MPS y se presenta como candidato diario para el marcador de la arena, no como una mejora consolidada. El autor declara una puntuación local de compatibilidad de 2,721 segundos con 5 de 5 finalizaciones en el evaluador original a comando fijo, además de validaciones de arranque ordinario (128 de 128 finalizaciones) y de estrés de comando (64 de 64 finalizaciones).

Por su naturaleza, el modelo resuelve un problema muy acotado: replicar de forma fiable una política de control con un comando fijo de 1,1 m/s y un accesorio de rodillos. Su relevancia es de nicho, dentro de la comunidad de Microduck Arena, y no debe confundirse con un modelo de propósito general. La información pública disponible es escasa: no hay datos de arquitectura interna, número de parámetros ni licencia explícita más allá de las notas de atribución heredadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política PPO exportada a ONNX; detalles de red no publicados) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada fija de 61 observaciones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible (el autor remite a `LICENSE-NOTE.txt` y a términos upstream heredados) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La información pública indica que se trata de un checkpoint PPO (Proximal Policy Optimization) entrenado en MPS, con una interfaz estricta de 61 observaciones de entrada y 14 acciones de salida. El autor afirma explícitamente que no se añadió tabla de semillas, ni una nueva entrada privilegiada, ni imitación de oponentes de terceros, lo que sugiere que el entrenamiento se mantuvo dentro de las reglas del entorno. El comando de velocidad está fijado en 1,1 m/s y el agente lleva el accesorio de rodillos.

No se dispone de detalles sobre el número de tokens de entrenamiento (no aplica), la composición del dataset de experiencias, el tamaño de la red neuronal, el número de capas ni el algoritmo exacto de recolección de rollouts. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal, que no tienen sentido en este tipo de política de control. El SHA256 del modelo (`bae288edd8b4f71ff2b17f72eb79705bfeadcc5f5bfbcc7a205428db9d456765`) permite verificar la integridad de los pesos.

## Capacidades

- Control de agente en Microduck Arena con interfaz fija de 61 observaciones y 14 acciones.
- Ejecución de una política de rodillos con comando de velocidad constante de 1,1 m/s.
- Finalización fiable de episodios: 5 de 5 en el evaluador original, 128 de 128 en validación de arranque ordinario y 64 de 64 en validación de estrés de comando.
- Inferencia nativa en CPU y en MPS (Apple Silicon) mediante el artefacto ONNX.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, audio ni tool calling.
- No dispone de capacidades multilingües ni de agentes multi-paso en el sentido de los modelos de lenguaje.
- No dispone de modo "thinking" ni de ninguna capacidad cognitiva general.

## Casos de uso

- Evaluación de políticas en Microduck Arena: cargar el checkpoint ONNX en el evaluador original para reproducir la puntuación de compatibilidad declarada de 2,721 segundos y comparar con la mejor marca publicada de Roller (2,570 segundos).
- Investigación en aprendizaje por refuerzo: usar el checkpoint como referencia de una iteración PPO concreta (iteración 56) para estudiar la progresión del entrenamiento y la estabilidad de la política.
- Validación de robustez: emplear las pruebas de arranque ordinario y de estrés de comando para comprobar que la política mantiene finalizaciones fiables bajo condiciones variadas.
- Integración en pipelines de inferencia en CPU: desplegar el ONNX en entornos sin GPU, aprovechando su formato nativo para CPU y su compatibilidad con MPS en Apple Silicon.
- Reproducibilidad de experimentos: verificar la integridad del artefacto mediante el SHA256 publicado antes de incluirlo en comparativas internas.
- Candidato para marcadores diarios: presentar el checkpoint como entrada de puntos en la arena, siendo consciente de que el autor lo describe como candidato y no como mejora consolidada.
- Estudio de atribución y licencias: revisar `upstream-base-card.md` y `LICENSE-NOTE.txt` para entender las condiciones heredadas antes de cualquier uso derivado.

## Benchmarks y rendimiento

| Metrica | Resultado declarado |
|---|---|
| Puntuación de compatibilidad (evaluador original, comando fijo) | 2,721 s (5/5 finalizaciones) |
| Validación de arranque ordinario | 128/128 finalizaciones |
| Validación de estrés de comando | 64/64 finalizaciones |
| Presupuesto de no inferioridad | +0,030 s frente a la línea base general |
| Mejor marca publicada de Roller | 2,570 s (mejor entrada cronometrada) |

No se han publicado resultados de benchmarks adicionales en la información disponible. El autor advierte de que las puntuaciones oficiales del servidor pueden diferir de los resultados locales en Mac.

## Requisitos de hardware

- VRAM estimada: no disponible; al ser un artefacto ONNX de política de control, se espera que quepa en memoria de CPU o de GPU integrada, pero no se documenta el consumo.
- GPU recomendadas: no disponible; el autor menciona inferencia nativa en CPU y MPS, no GPU dedicadas.
- Compatibilidad con GPU de consumo: no confirmada; el formato ONNX y el tamaño de repositorio de 0,0 GB sugieren un modelo muy pequeño, pero no hay datos oficiales.
- Opciones de despliegue: ONNX Runtime en CPU y MPS; no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles; solo se publica la puntuación de finalización de 2,721 segundos en el evaluador original.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada/salida | Puntuación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Roller PPO056 (este) | Política PPO ONNX | 61 obs / 14 acciones | 2,721 s (5/5) | no disponible | HuggingFace |
| Mejor Roller publicado | Política de control | no disponible | 2,570 s | no disponible | Referencia del autor |
| Línea base general | Política de control | no disponible | no disponible | no disponible | Referencia del autor |

No se dispone de información suficiente para comparar con alternativas de la misma categoría más allá de las referencias internas del autor.

## Limitaciones y advertencias

- Modelo de nicho: no es un modelo de lenguaje ni de propósito general; no sirve para tareas de texto, código, visión o audio.
- Rendimiento no consolidado: el autor lo describe como candidato diario, no como mejora ni como aspirante a podio; la mejor marca de Roller (2,570 s) sigue siendo superior.
- Diferencia entre entornos: las puntuaciones oficiales del servidor pueden diferir de los resultados locales en Mac.
- Licencia no explicitada: solo se remite a `LICENSE-NOTE.txt` y a términos upstream heredados; conviene revisarlos antes de cualquier uso comercial o derivado.
- Interfaz rígida: la entrada está fijada a 61 observaciones y la salida a 14 acciones, con comando de 1,1 m/s y accesorio de rodillos; no admite variaciones fuera de ese contrato.
- Sin datos de sesgo ni de alucinación aplicables, pero tampoco hay información sobre robustez fuera de las validaciones declaradas.
- Repositorio de 0,0 GB y sin descargas ni likes: poca tracción comunitaria y ausencia de validación independiente.
- No sustituye al entrante de la copa Tug, según advierte el propio autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/djduecaster/dfreq-roller-ppo056-20261105
- Notas de licencia y atribución: `LICENSE-NOTE.txt` (incluido en el repositorio)
- Model card upstream heredada: `upstream-base-card.md` (incluido en el repositorio)
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información disponible.
