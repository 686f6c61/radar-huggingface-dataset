# mikisafr/pi05-yam-towel-fold-100ep-step6000

## Resumen

`mikisafr/pi05-yam-towel-fold-100ep-step6000` es un checkpoint de inferencia de una política robótica de tipo `pi05` (familia π₀.₅) ajustada por el usuario `mikisafr` a partir del modelo base `lerobot/pi05_base`. El modelo resuelve una tarea única y muy concreta: el doblado bimanual de toallas con el robot YAM. No es un modelo de lenguaje general, sino una política visuomotora que consume observaciones (imágenes de cámara y estado del robot) y produce acciones motrices, empaquetada en el formato de LeRobot con `safetensors` y `bfloat16` como dtype configurado.

El checkpoint corresponde al paso 6.000 de un ajuste fino cuyo objetivo declarado era de 10.000 pasos; no se ha verificado que dicho objetivo se completara. El autor describe el experimento como un fine-tune de 100 episodios, aunque los metadatos del dataset recuperados en el momento de la exportación indican 167 episodios y 53.694 fotogramas, una discrepancia que el propio autor señala como posible. El repositorio ocupa 9,4 GB y contiene 4.143.404.816 parámetros (~4,14 B) en pesos.

Su relevancia es acotada y de nicho: se trata de un artefacto de transferencia reproducible (incluye `source_manifest.json` con rutas de origen, tamaños y hashes SHA-256) útil para quien quiera reproducir, evaluar o continuar el ajuste de una política π₀.₅ sobre una tarea de manipulación diestra, no de un modelo listo para producción. El autor indica explícitamente que no se realizó ninguna prueba de inferencia ni de comportamiento del robot.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política robótica de tipo `pi05` (LeRobot); detalles de backbone no disponibles |
| Parámetros totales | 4.143.404.816 (~4,14 B) |
| Parámetros activos | No aplica (no se declara arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | `bfloat16` (dtype configurado); no se publican variantes cuantizadas |
| Idiomas soportados | No disponible (modelo de robótica, no de texto) |
| Licencia | No disponible |
| Formato de pesos | `safetensors` (librería `lerobot`) |
| Tamaño del repositorio | 9,4 GB |
| Modelo base | `lerobot/pi05_base` (fine-tune) |
| Tarea | Doblado bimanual de toallas (YAM) |
| Checkpoint | Paso 6.000 (objetivo declarado: 10.000) |
| Descargas / likes | 0 / 1 |

## Arquitectura y entrenamiento

El tipo de política declarado es `pi05` y el modelo se distribuye con la librería `lerobot`, con `bfloat16` como dtype configurado y 4,14 B de parámetros. El repositorio preserva sin cambios los siete ficheros originales de la política: pesos, configuración de modelo y de entrenamiento, y ambos procesadores con sus tensores de normalización. Esos procesadores implican convenciones concretas de robot y de cámara que deben respetarse en tiempo de inferencia. La información proporcionada no incluye el detalle del backbone, el mecanismo de generación de acciones ni la configuración exacta de los procesadores (horizontes de observación y de acción), por lo que esos puntos quedan como no disponibles.

En cuanto a los datos, el ajuste fino se realizó sobre el directorio `/data/towel_fold_v1`, con selección de episodios nula (se usa el conjunto completo). El autor describe el experimento como un fine-tune de 100 episodios, mientras que los metadatos del dataset observados en la exportación indican 167 episodios y 53.694 fotogramas con split de entrenamiento `0:167`; el propio autor advierte que ese metadata puede no coincidir con los datos realmente presentes durante el entrenamiento. Se conservan checkpoints de los pasos 2.000, 4.000 y 6.000, y este repositorio exporta el más reciente. No se documenta el método de optimización (RLHF, DPO u otro), el número de tokens o muestras procesadas, ni la composición del dataset más allá de la tarea.

Una limitación técnica relevante: la exportación excluye `training_state` y el estado del optimizador, por lo que el checkpoint sirve para inferencia y para inicializar un nuevo ajuste, pero no para reanudar el entrenamiento con el estado del optimizador intacto. Tampoco se ha ejecutado ninguna validación de inferencia o de comportamiento sobre el robot.

## Capacidades

- Control visuomotor para una tarea única: doblado bimanual de toallas con el robot YAM, a partir de observaciones de cámara y estado del robot.
- Política de imitación ajustada sobre demostraciones: reproduce la distribución de comportamientos presente en el dataset de entrenamiento.
- Inferencia en `bfloat16` con el runtime de LeRobot, usando la configuración y los procesadores preservados (normalización incluida).
- Punto de partida para nuevo ajuste fino o para comparación de checkpoints dentro de la misma tarea (pasos 2.000, 4.000 y 6.000 disponibles en origen).
- Trazabilidad de la transferencia: `source_manifest.json` con rutas de origen, recuento de bytes y hashes SHA-256, con verificación de tamaños y hashes en el Hub.
- No se declaran capacidades de tool calling, agentes, razonamiento multi-paso, visión general, audio ni multilingüismo.

## Casos de uso

- Investigación en manipulación diestra: usar el checkpoint como referencia de política π₀.₅ ajustada a una tarea de deformación de tejidos (doblado de toallas) para comparar curvas de aprendizaje entre los pasos 2.000, 4.000 y 6.000.
- Reproducción de experimentos: el manifiesto con hashes SHA-256 permite verificar que los pesos evaluados son exactamente los exportados, lo que facilita la reproducibilidad en publicaciones o informes internos.
- Inicialización de un ajuste fino posterior: al conservarse pesos, configuración de modelo y procesadores, el checkpoint puede cargarse en LeRobot como punto de partida para continuar el entrenamiento hacia las 10.000 iteraciones declaradas.
- Evaluación offline de políticas: ejecutar la política en modo replay sobre episodios registrados para medir error de acción respecto a las demostraciones, sin necesidad de acceso al robot físico.
- Validación en simulación: integrar la política en un entorno simulado con las mismas convenciones de cámara y robot antes de cualquier prueba en hardware, dado que el autor no aporta tests de comportamiento.
- Automatización de tareas de plegado en entornos controlados (hostelería, lavandería industrial, laboratorios de robótica): solo como componente a validar, ya que no existe evidencia publicada de éxito en producción ni licencia declarada.
- Docencia y divulgación: ejemplo práctico de pipeline completo (dataset → fine-tune → exportación → runtime de inferencia) con LeRobot sobre una tarea fácil de visualizar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se realizó ninguna prueba de inferencia ni de comportamiento del robot, y no se aportan métricas de éxito de la tarea, tasas de agarre, tiempos de ciclo ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia en `bfloat16`: aproximadamente 8,3 GB solo para pesos (4,14 B × 2 bytes), más el coste de activaciones y buffers de imagen; en la práctica, reservar 12-16 GB para trabajar con margen.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB). Cabe en GPUs de consumo de gama alta con 16-24 GB en `bfloat16`.
- GPUs de 8-12 GB: probablemente insuficiente en `bfloat16` sin cuantización; no se publican variantes cuantizadas ni se documenta soporte de cuantización para esta política, por lo que no se puede confirmar.
- Despliegue: runtime de LeRobot (requisito explícito del autor) respetando la configuración de modelo y los procesadores preservados. El soporte en vLLM, llama.cpp, Ollama o TGI no está documentado para políticas `pi05` y no se puede asumir.
- Almacenamiento: 9,4 GB de repositorio; prever espacio adicional para el dataset (53.694 fotogramas) si se va a reentrenar.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de frecuencia de control, latencia por paso ni rendimiento en ningún acelerador.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mikisafr/pi05-yam-towel-fold-100ep-step6000` | 4,14 B | No disponible | Doblado de toallas bimanual (YAM) | No disponible | Público en HF, 0 descargas |
| `lerobot/pi05_base` (modelo base) | No disponible en la información (mismo origen) | No disponible | Política generalista π₀.₅, ajustable por fine-tune | No disponible | Público en HF (referenciado como base) |
| Otras políticas de LeRobot (ACT, Diffusion Policy, SmolVLA) | No disponible en la información para cada caso | No disponible | Manipulación general / tareas específicas | Varía por modelo; no disponible en esta información | Ecosistema LeRobot |

La comparación cuantitativa con alternativas no es posible con los datos disponibles: no hay benchmarks publicados de este checkpoint ni métricas de éxito en la tarea que permitan situarlo frente a otras políticas del mismo ecosistema.

## Limitaciones y advertencias

- Licencia no declarada: no se puede determinar si el uso comercial está permitido. Tratar como no apto para producción hasta aclararlo, también por la licencia del modelo base.
- Sin validación empírica: el autor confirma que no se realizó ninguna prueba de inferencia ni de comportamiento del robot. El rendimiento real de la política es desconocido.
- Checkpoint incompleto respecto al objetivo: paso 6.000 de 10.000 planificados, con finalización no verificada. Es el checkpoint más reciente observado, no necesariamente el mejor.
- Discrepancia en los datos: se describe un fine-tune de 100 episodios, pero los metadatos recuperados indican 167 episodios y 53.694 fotogramas, con posible desajuste entre los datos usados y los reportados.
- No reanudable: se excluyen `training_state` y el estado del optimizador; no sirve para continuar el entrenamiento exactamente donde se dejó.
- Especialización extrema: una sola tarea (doblado de toallas) y un solo embodiment (YAM bimanual). No generaliza a otras tareas, objetos ni robots sin nuevo ajuste.
- Dependencia fuerte de las convenciones de robot y cámara: los procesadores incluyen tensores de normalización específicos; usarlos con otra configuración de sensores invalida las acciones generadas.
- Riesgo de sobreajuste y de fallo fuera de distribución ante cambios de iluminación, tipo de toalla, posición inicial o fondo, no cuantificado en la información disponible.
- Sesgos: no se documenta ningún análisis de sesgo, y en políticas de imitación los sesgos provienen de las demostraciones (posiciones, materiales y entornos presentes en el dataset).
- Riesgo de alucinación en el sentido de acciones no fundamentadas en la observación: no evaluado; sin tests de robustez publicados.
- Trazabilidad buena pero mantenimiento nulo: 0 descargas y 1 like; no hay evidencia de soporte, issues resueltos ni actualizaciones posteriores al 17 de octubre de 2026.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mikisafr/pi05-yam-towel-fold-100ep-step6000
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Manifiesto de origen: `source_manifest.json` dentro del repositorio del modelo (rutas, bytes y hashes SHA-256)
- Resultados de búsqueda web: no se han encontrado enlaces relevantes al modelo; las búsquedas devolvieron únicamente páginas de TikTok sin relación con el proyecto. No hay papers, blogs ni demos adicionales disponibles.
