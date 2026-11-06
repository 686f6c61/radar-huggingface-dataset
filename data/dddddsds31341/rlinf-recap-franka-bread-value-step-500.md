# dddddsds31341/RLinf-RECAP-Franka-Bread-Value-Step-500

## Resumen

RLinf-RECAP-Franka-Bread-Value-Step-500 es un modelo de valor (crítico) intermedio publicado por el usuario dddddsds31341 en Hugging Face. No se trata de una política de acciones robóticas, sino de un modelo que puntúa observaciones dentro de un pipeline de aprendizaje por refuerzo (RL) para robótica. Concretamente, es el state dict completo del modelo de valor exportado en el paso de optimización 500 de una ejecución de 2.000 pasos denominada `recap-bread-value-g4-20261106-v1`.

El modelo combina dos componentes base —un codificador visual SigLIP2 y un modelo de lenguaje Gemma3-270M— con una cabeza de valor de 201 bins cuyo soporte de salida es el intervalo [-1, 0]. Se enmarca en el ecosistema RLinf y en la técnica RECAP, y está asociado a tareas de manipulación con el brazo robótico Franka en un escenario de pan (bread). Su relevancia es acotada: es un checkpoint intermedio de investigación, sin garantías de tasa de éxito ni de generalización, y pensado para ser cargado con la implementación específica de RLinf, no con un cargador genérico de Transformers.

El repositorio ocupa 1,8 GB y contiene pesos, configuraciones, estadísticas de normalización y el código de la versión disponible en el momento de generar el checkpoint. El autor advierte explícitamente de que no incluye estado de optimizador, scheduler ni RNG, por lo que no sirve para reanudar el entrenamiento de forma exacta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: codificador visual SigLIP2 + modelo de lenguaje Gemma3-270M + cabeza de valor de 201 bins (modelo de valor/crítico) |
| Parametros totales | no disponible (el componente Gemma3 es de 270M; el total no se especifica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en BF16 durante el entrenamiento; el checkpoint se distribuye como state dict PyTorch) |
| Idiomas soportados | no disponible (modelo orientado a robótica, no a texto multilingüe) |
| Licencia | other (componentes base conservan sus licencias originales) |
| Formato de pesos | PyTorch state dict (`full_weights.pt`) |

## Arquitectura y entrenamiento

El modelo es un crítico de valor que combina percepción visual y modelado de lenguaje. La entrada visual se procesa con SigLIP2 y la representación resultante se integra con Gemma3-270M, sobre cuya salida se aplica una cabeza de valor de 201 bins con soporte en el intervalo [-1, 0]. La construcción del retorno sigue una regla explícita: -1 por paso, 0 en éxito terminal y -300 en fallo terminal. La normalización emplea el rango de retorno de entrenamiento [-554, 0] para ambos splits.

Los datos provienen de 300 episodios de rollout de pan generados con pi0.5, divididos a nivel de episodio con semilla 42: 270 episodios de entrenamiento (232 éxitos, 38 fallos; 57.472 frames) y 30 de validación (26 éxitos, 4 fallos; 6.213 frames). Se conservaron ambas cámaras y no se mezcló el dataset de demostraciones separado. La conversión indexa los pasos de control a 10 Hz nominales manteniendo el tiempo real original, sin remuestrear observaciones ni acciones.

El entrenamiento se realizó en una única GPU con micro-lote 4 y lote global 32 en BF16, con tasas de aprendizaje configuradas de 5e-5 y `value_lr` de 1e-4, calentamiento de 100 pasos, evaluación cada 250 pasos y checkpoint cada 500 pasos. El checkpoint publicado corresponde al paso 500 de una ejecución de 2.000 pasos. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Puntuación de observaciones: estima un valor escalar (discretizado en 201 bins) para una observación dada, dentro de un pipeline de RL.
- Integración de percepción visual y contexto de lenguaje mediante SigLIP2 y Gemma3-270M.
- Uso como crítico en algoritmos de aprendizaje por refuerzo que requieran una función de valor sobre retornos normalizados.
- Procesamiento de observaciones con dos cámaras, conforme a la configuración de entrenamiento.
- No es una política de acciones: no genera comandos motores ni trayectorias.
- No soporta tool calling, function calling ni razonamiento multi-paso orientado a agentes de texto.
- Capacidades multilingües: no disponibles ni documentadas.
- No incluye modo de pensamiento (thinking), visión general, audio ni otras capacidades especiales más allá de la puntuación de valor.

## Casos de uso

- Evaluación de políticas de manipulación en RL: el modelo puntúa observaciones de un brazo Franka en tareas de pan para estimar retornos y comparar políticas candidatas antes de desplegarlas en hardware.
- Análisis de rollouts de pi0.5: al ser un crítico entrenado sobre episodios de pi0.5, permite asignar valores a nuevas trayectorias y detectar desviaciones respecto al comportamiento de referencia.
- Investigación en RECAP: sirve como componente intermedio para estudiar la dinámica de entrenamiento de modelos de valor en el paso 500 frente a checkpoints posteriores de la misma ejecución.
- Depuración de pipelines de RLinf: al incluir `training_config.yaml`, `norm_stats.json` y `return_stats.json`, facilita reproducir la normalización y verificar la coherencia de las entradas en una máquina de evaluación.
- Filtrado de datos de entrenamiento: las puntuaciones de valor pueden emplearse para priorizar o descartar episodios en la curación de datasets de robótica.
- Reproducción de experimentos académicos: útil para comparar variantes de funciones de retorno o de normalización en entornos simulados o reales controlados, siempre con validación previa de seguridad.
- Estudio de arquitecturas híbridas visión-lenguaje para valor: permite analizar el comportamiento de un crítico que combina SigLIP2 y Gemma3-270M en tareas de manipulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no se hace ninguna afirmación sobre tasa de éxito del robot ni sobre generalización para este modelo intermedio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el repositorio ocupa 1,8 GB y el componente de lenguaje es de 270M, por lo que la huella de pesos es moderada, pero el total exacto (incluido SigLIP2 y la cabeza de valor) no se especifica.
- GPU recomendadas: no disponibles; el entrenamiento se realizó en una única GPU, sin especificar modelo.
- Viabilidad en GPU de consumo: probable por el tamaño de los componentes, pero no confirmada por el autor.
- Opciones de despliegue: implementación específica de RLinf para modelos de valor; no se proporciona un cargador genérico `AutoModel` de Transformers.
- Latencia y throughput: no disponibles.
- Requisitos adicionales: es necesario adaptar las rutas locales de assets SIP de ambas configuraciones a la máquina de evaluación, y disponer por separado de los assets de tokenizador y configuración de SigLIP2 y Gemma.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RLinf-RECAP-Franka-Bread-Value-Step-500 | Modelo de valor (crítico) | no disponible (Gemma3-270M como componente) | no disponible | other | Hugging Face, 0 descargas |
| Franka-Wipe-Whiteboard-pi05-step-5000 | Política de acciones (OpenPI/pi0.5) | no disponible | no disponible | no disponible | Hugging Face |
| Franka-Tennis-pi05-step-5000 | Política de acciones (OpenPI/pi0.5, con EMA) | no disponible | no disponible | no disponible | Hugging Face |

La comparación es limitada: los dos modelos alternativos encontrados son políticas de acciones y no críticos de valor, por lo que no son funcionalmente equivalentes. No se dispone de datos de rendimiento comparables entre ellos.

## Limitaciones y advertencias

- No es una política de robot: no genera acciones y no debe usarse como tal.
- Checkpoint intermedio (paso 500 de 2.000): no representa el estado final del entrenamiento.
- Sin estado de optimizador, scheduler ni RNG: no permite reanudar el entrenamiento de forma exacta.
- Sin garantías de tasa de éxito ni de generalización, según el propio autor.
- Requiere la implementación específica de RLinf y su preprocesamiento de entrada; no es cargable con un `AutoModel` genérico.
- Las rutas locales de assets SIP en las configuraciones deben adaptarse a la máquina de evaluación.
- Es necesario obtener por separado los assets de tokenizador y configuración de SigLIP2 y Gemma.
- Licencia "other": los componentes base conservan sus licencias originales, lo que condiciona el uso comercial; conviene revisar cada licencia antes de producción.
- Riesgo de alucinación y sesgos: no documentados, pero aplicables en la medida en que el componente Gemma3-270M herede los de su modelo base.
- Validación de seguridad obligatoria antes de cualquier despliegue en hardware: orden de observaciones, unidades, estadísticas de normalización y límites del espacio de trabajo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dddddsds31341/RLinf-RECAP-Franka-Bread-Value-Step-500
- Modelo relacionado (Franka-Wipe-Whiteboard-pi05-step-5000): https://huggingface.co/dddddsds31341/Franka-Wipe-Whiteboard-pi05-step-5000
- Modelo relacionado (Franka-Tennis-pi05-step-5000): https://huggingface.co/dddddsds31341/Franka-Tennis-pi05-step-5000
