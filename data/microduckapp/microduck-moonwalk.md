# microduckapp/microduck-moonwalk

## Resumen

Microduck Moonwalk es una política de control en formato ONNX publicada por microduckapp dentro de la familia `microduck-move`, orientada al robot Microduck de la aplicación MicroDuck. No es un modelo de lenguaje ni un modelo generativo multimodal: es un controlador que recibe un vector de 61 observaciones y emite 14 objetivos articulares a 50 Hz, es decir, una política de imitación o control aprendido que traduce el estado del robot en consignas de movimiento para sus articulaciones.

El "modelo" implementa un movimiento concreto y cerrado: una coreografía de 11,0 segundos descrita por el autor como un deslizamiento hacia atrás con balanceo suave, giro y pose final. Se distribuye junto a un `manifest.json` que indica al robot qué debe instalar y cómo reproducir la rutina, y un vídeo de previsualización en `media/preview.mp4`. Su relevancia es, por tanto, la de un artefacto de robótica de consumo: un ejemplo de empaquetado de políticas de movimiento portables y reproducibles para un robot de bajo coste.

La información publicada es muy escasa: el repositorio ocupa 0,0 GB, no declara licencia, no declara idiomas y no incluye arquitectura interna, número de parámetros ni datos de entrenamiento. La fecha de creación registrada en HuggingFace es 2026-10-27. Todo lo que no consta se marca explícitamente como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de control serializada en ONNX; arquitectura interna de la red no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo no generativo de texto); vector de observación de 61 valores por paso de control |
| Tipos de cuantizacion | no disponible (se distribuye un único `policy.onnx`; no se documentan variantes) |
| Idiomas soportados | no aplica (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) |
| Entradas | 61 observaciones por paso |
| Salidas | 14 objetivos articulares (joint targets) |
| Frecuencia de control | 50 Hz |
| Duración del movimiento | 11,0 s (aproximadamente 550 pasos de control a 50 Hz) |
| Artefactos adicionales | `manifest.json` (instalación y reproducción), `media/preview.mp4` (previsualización) |
| Pipeline declarado en HuggingFace | robotics |
| Etiquetas | onnx, robotics, microduck-move, region:us |

## Arquitectura y entrenamiento

El autor no documenta la arquitectura interna de la política. Lo único verificable es la interfaz del artefacto: una red que consume 61 observaciones y produce 14 consignas articulares, ejecutada a 50 Hz y exportada a ONNX. Por la dimensionalidad de entrada y salida y por el formato de despliegue, se trata de un controlador compacto pensado para inferencia en el propio robot o en un host ligero, no de un modelo de gran tamaño. No hay información sobre si es un perceptrón multicapa, una red recurrente, un transformer pequeño o una política entrenada por imitación; tampoco sobre capas, funciones de activación ni parámetros totales.

No se han publicado datos de entrenamiento: ni número de tokens o de episodios, ni composición del dataset, ni si se empleó aprendizaje por imitación, refuerzo, RLHF o DPO. La model card se limita a describir el efecto observable del movimiento ("glides backwards with a smooth sway, spins round and strikes a pose") y a enumerar los ficheros. El `manifest.json` actúa como contrato de integración —qué debe instalar el robot y cómo reproducir la rutina—, pero su contenido no se detalla en la información disponible.

## Capacidades

- Generación de una secuencia de control de 11,0 s con 14 objetivos articulares a 50 Hz.
- Ejecución de una coreografía concreta: desplazamiento hacia atrás con balanceo, giro sobre sí mismo y pose final.
- Control de robot de bajo coste (plataforma Microduck) mediante un único fichero ONNX portable.
- Integración con la app MicroDuck a través del manifiesto de instalación y reproducción.
- Inspección y validación del movimiento mediante el vídeo de previsualización incluido.
- Ejecución potencial en runtime ONNX estándar (ONNX Runtime u otros), al no depender de kernels propietarios según la información disponible.
- No soporta tool calling, function calling, razonamiento multi-paso, generación de texto, visión, audio ni capacidades multilingües.

## Casos de uso

- **Demostración de producto en la app MicroDuck**: la política se instala mediante `manifest.json` y se reproduce como una rutina pregrabada de 11 s, lo que permite mostrar el robot realizando un movimiento vistoso sin desarrollo adicional de control.
- **Contenido para marketing y redes sociales**: el vídeo `media/preview.mp4` y la propia rutina sirven para generar clips cortos del robot ejecutando el movimiento; la duración de 11 s encaja con formatos de vídeo corto.
- **Prueba de integración del pipeline de políticas `microduck-move`**: al ser un artefacto autocontenido (ONNX + manifiesto), es útil como caso de prueba para verificar que el cargador de políticas del robot instala, resuelve y ejecuta movimientos externos correctamente.
- **Validación de control articular**: con 14 salidas a 50 Hz se puede usar para comprobar el seguimiento de consignas, los límites de las articulaciones y la estabilidad del robot durante secuencias con giro y cambios de pose.
- **Educación y divulgación en robótica**: como ejemplo didáctico de cómo se empaqueta y distribuye una política de movimiento para un robot comercial de bajo coste, incluyendo la separación entre pesos (ONNX) y metadatos de instalación (JSON).
- **Base para variaciones coreográficas**: la política puede servir de referencia o punto de partida para experimentar con concatenación de movimientos, ajuste de tiempos o sustitución de la pose final en una rutina propia del usuario.
- **Pruebas de reproducibilidad**: al fijar entradas (61), salidas (14) y frecuencia (50 Hz), permite verificar que dos entornos de ejecución distintos producen secuencias equivalentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No hay métricas de recompensa, tasa de éxito, error de seguimiento articular, latencia medida ni comparaciones con otras políticas. La única cifra de rendimiento declarada es la frecuencia de control de 50 Hz y la duración de 11,0 s del movimiento.

## Requisitos de hardware

- **VRAM estimada**: no disponible. El autor no publica número de parámetros ni tamaño de los tensores. Por la interfaz (61 entradas, 14 salidas, 50 Hz) cabe esperar una red de pequeño tamaño, pero no hay dato verificable.
- **GPU recomendadas**: no disponibles. Para una política de esta dimensionalidad la inferencia en CPU es una opción plausible, pero el autor no especifica requisitos ni hardware objetivo.
- **Compatibilidad con GPU de consumo**: no confirmada. No se documenta si el movimiento se ejecuta en el robot, en un host acompañante o en un servidor.
- **Opciones de despliegue**: al distribuirse como `policy.onnx`, es compatible en principio con runtimes ONNX (ONNX Runtime, entre otros). No se documenta soporte de vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de artefacto.
- **Latencia y throughput**: no disponibles. El único requisito temporal explícito es mantener 50 Hz (20 ms por paso de control) para reproducir el movimiento tal como fue diseñado.
- **Almacenamiento**: el repositorio ocupa 0,0 GB según HuggingFace, lo que sugiere un artefacto muy ligero, aunque la cifra está redondeada y no permite estimar el tamaño real de `policy.onnx`.

## Comparativa con modelos similares

No se dispone de información sobre otras políticas comparables. La alternativa natural serían otros movimientos de la misma familia `microduck-move` del mismo autor, pero no se han proporcionado datos de ellos (ni parámetros, ni duración, ni licencia, ni rendimiento).

| Modelo | Tipo | Entradas / salidas | Frecuencia | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| microduck-moonwalk | Política de control ONNX (robótica) | 61 / 14 | 50 Hz | no aplica | no disponible | HuggingFace (microduckapp) |
| Otros `microduck-move` | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |
| Políticas de locomotion de referencia (p. ej. familias publicadas para cuadrúpedos) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han encontrado en la información proporcionada modelos comparables con datos verificables; la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- **Alcance cerrado**: la política ejecuta un único movimiento de 11 s; no es un modelo general de control ni acepta instrucciones en lenguaje natural.
- **Documentación mínima**: sin arquitectura, sin parámetros, sin datos de entrenamiento y sin métricas, es imposible evaluar robustez, generalización o calidad del control más allá del vídeo de previsualización.
- **Licencia no declarada**: la ausencia de licencia impide asumir permiso de uso comercial, redistribución o modificación. Es un riesgo legal directo para integración en producto.
- **Sin garantías de seguridad física**: un movimiento con giro y desplazamiento hacia atrás sobre un robot real puede implicar riesgo de caída, colisión o esfuerzo articular; no se documentan límites de par, de velocidad ni condiciones de prueba.
- **Dependencia de la plataforma**: las 61 observaciones y las 14 articulaciones están definidas implícitamente para el robot Microduck; el orden, las unidades y la normalización de las observaciones no se detallan en la información disponible, lo que dificulta reutilizarlo en otro hardware.
- **Riesgo de alucinación**: no aplica, al no ser un modelo generativo de texto.
- **Idioma**: no aplica; no procesa lenguaje.
- **Madurez**: 0 descargas y 0 likes en el momento de la consulta, repositorio de 0,0 GB y fecha de creación 2026-10-27; no hay evidencia de uso en producción ni de mantenimiento.
- **Trazabilidad de la búsqueda web**: los resultados de búsqueda proporcionados no guardan relación con el modelo (son referencias a películas en bengalí), por lo que no aportan información técnica ni enlaces útiles.

## Enlaces

- HuggingFace: https://huggingface.co/microduckapp/microduck-moonwalk
- `policy.onnx`: https://huggingface.co/microduckapp/microduck-moonwalk/blob/main/policy.onnx (ruta inferida del contenido de la model card)
- `manifest.json`: https://huggingface.co/microduckapp/microduck-moonwalk/blob/main/manifest.json (ruta inferida del contenido de la model card)
- `media/preview.mp4`: https://huggingface.co/microduckapp/microduck-moonwalk/blob/main/media/preview.mp4 (ruta inferida del contenido de la model card)
- Paper, blog, repositorio de código o demo adicionales: no disponible en la información proporcionada.
