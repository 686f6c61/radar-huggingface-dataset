# BabyClaw/duck-skill-20261105-tug-of-war

## Resumen

BeakTug Retained Champion es una política de control para robótica presentada como artefacto aislado dentro del ecosistema microduck, un marco de competición de agentes robóticos ligeros. El modelo lo publica el usuario BabyClaw bajo el identificador `duck-skill-20261105-tug-of-war` y se enmarca en la tarea de "tug-of-war" (tira y afloja) del slot de habilidad `walk`. No se trata de un modelo de lenguaje, sino de una política de aprendizaje por refuerzo exportada a ONNX para inferencia en CPU, con 61 observaciones de entrada y 14 acciones de salida.

La relevancia del repositorio es acotada: según la model card, no contiene pesos entrenados nuevos. Se trata de un "donante preentrenado sin cambios" seleccionado como línea base tras fracasar varias candidaturas (una rama PPO compartida de 75 iteraciones, 228 propuestas afines completas y 4 interpolaciones) las puertas de cualificación combinadas de referencia y liga. El autor conserva así el campeón validado previamente de la liga Beaktug, cuyo SHA-256 de política coincide con el del repositorio de origen `BabyClaw/microduck-beaktug-long-juice-1240`.

El repositorio es de tamaño prácticamente nulo (0.0 GB) y no registra descargas ni interacciones. La información técnica disponible es muy limitada y procede exclusivamente de la model card y de los metadatos de Hugging Face; no hay datos de arquitectura de red, composición del dataset de entrenamiento ni resultados de benchmarks oficiales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de control para robótica exportada a ONNX; arquitectura interna de la red no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje); 61 observaciones de entrada |
| Tipos de cuantizacion | no disponible; inferencia en CPU vía ONNX |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (inferencia en CPU) |
| Dimension de entrada | 61 observaciones |
| Dimension de salida | 14 acciones |
| SHA-256 de la política | `577deffc92af74b295c8096953867606e4a66f3fd35112fd7cdd15f5901c7a5b` |
| Librería | microduck |
| Pipeline | robotics |
| Repositorio de origen | `BabyClaw/microduck-beaktug-long-juice-1240` (revisión `e11bacbf4089b00e2246e81fa81b3242949f541f`) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna de la red (número de capas, tipo de capas, funciones de activación ni tamaño de los pesos). Lo único documentado es la interfaz de la política: recibe 61 observaciones y emite 14 acciones, y se ejecuta mediante inferencia ONNX en CPU. El pipeline declarado es `robotics` y la librería asociada es `microduck`, con la etiqueta de slot `microduck-slot:walk`.

Respecto al entrenamiento, la model card indica explícitamente que este repositorio **no contiene pesos nuevos**: `new_weights_selected: false`. El autor documenta los intentos de mejora que no superaron las puertas de validación: una rama PPO compartida de 75 iteraciones, 228 propuestas afines completas, 4 interpolaciones y un cribado de checkpoints guardados. También se registran 4000 combates de investigación completados y 5 combates de verificación final fresca. La selección final fue "retained existing validated Beaktug champion", es decir, se conservó el campeón ya validado. No se especifican detalles del algoritmo de RL más allá de la mención a PPO, ni la composición del dataset, ni si hubo fases de ajuste adicionales.

## Capacidades

- Control robótico para la tarea de tira y afloja (tug-of-war) dentro del entorno microduck.
- Política de locomoción asociada al slot `walk`.
- Inferencia en CPU mediante ONNX, sin necesidad de GPU.
- Interfaz de 61 observaciones de entrada y 14 acciones de salida.
- Participación en la liga Beaktug y en la Arena de microduck.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, audio ni capacidades multilingües.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso; es una política de control de un solo paso por inferencia.

## Casos de uso

- **Evaluación comparativa de políticas en la Arena de microduck**: el modelo sirve como línea base validada contra la que medir nuevas candidaturas en la tarea de tug-of-war, usando el evento oficial de la Arena como referencia de puntuación.
- **Reproducción de resultados de la liga Beaktug**: al conservar el SHA-256 exacto de la política original, permite verificar de forma determinista que una ejecución corresponde al campeón validado.
- **Pruebas de integración del runtime microduck en CPU**: al ser una política ONNX de tamaño mínimo, es útil para validar pipelines de inferencia en entornos sin GPU.
- **Banco de pruebas de puertas de cualificación**: el repositorio documenta explícitamente los criterios de referencia y liga, por lo que puede emplearse para calibrar y depurar dichas puertas antes de someter nuevos candidatos.
- **Referencia de regresión en experimentos de RL**: cualquier nueva rama PPO o búsqueda afín puede compararse contra esta política para detectar degradaciones en la distancia de referencia observada (97.67 cm local frente a 97.72 cm en el host).
- **Docencia o demostración de flujos de competición de agentes robóticos**: el manifiesto y la evidencia de evaluación local permiten ilustrar el ciclo completo de selección, validación y envío a una arena pública.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no se trata de un modelo de lenguaje. Los únicos datos de rendimiento documentados son métricas locales de la tarea:

| Metrica | Valor |
|---|---|
| Distancia de referencia local observada | 97.66972124576569 cm |
| Distancia de referencia en el host existente | 97.71519929170609 cm |
| Combates de investigación completados | 4000 |
| Combates de verificación final fresca | 5 |
| Intentos de entrenamiento | 75 iteraciones PPO compartidas; 228 propuestas afines; 4 interpolaciones; cribado de checkpoints |
| Pesos nuevos seleccionados | No (`new_weights_selected: false`) |

El autor advierte que las puntuaciones locales son indicativas y que la Arena mide el resultado oficial.

## Requisitos de hardware

- **VRAM**: no aplica; la inferencia es en CPU vía ONNX.
- **GPU recomendadas**: no se requiere GPU; el modelo está pensado para ejecución en CPU.
- **GPU de consumo**: irrelevante para este artefacto; no hay pesos en formato de gran tamaño que cargar.
- **Opciones de despliegue**: runtime ONNX con la librería `microduck`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables).
- **Latencia y throughput**: no disponibles en la información proporcionada.
- **Almacenamiento**: el repositorio ocupa 0.0 GB según Hugging Face, coherente con una política de tamaño reducido.

## Comparativa con modelos similares

No se dispone de información sobre otras políticas comparables dentro de microduck (ni sus parámetros, contexto o licencia) en la documentación proporcionada. La model card menciona candidaturas descartadas (rama PPO compartida, propuestas afines e interpolaciones) y el repositorio de origen `BabyClaw/microduck-beaktug-long-juice-1240`, pero no ofrece datos cuantitativos de esas alternativas que permitan una comparación rigurosa.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BeakTug Retained Champion | no disponible | no aplica (61 obs.) | 97.67 cm local / 97.72 cm host | no disponible | Hugging Face |
| Candidaturas descartadas (PPO, afines, interpolaciones) | no disponible | no aplica | no superaron las puertas de cualificación | no disponible | no disponible |
| Otras políticas microduck | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- **No contiene pesos nuevos**: es un donante preentrenado sin cambios; no debe presentarse como un modelo entrenado en este repositorio.
- **Licencia no disponible**: no se especifica licencia, por lo que el uso comercial queda sin garantías jurídicas explícitas.
- **Alcance muy restringido**: solo cubre la tarea de tug-of-war en el slot `walk` de microduck; no es reutilizable como modelo general.
- **Sin datos de arquitectura ni de entrenamiento**: no es posible auditar la red, el dataset ni el proceso de RL a partir de la información publicada.
- **Métricas locales indicativas**: el propio autor advierte que las puntuaciones locales no sustituyen al resultado oficial de la Arena.
- **Verificación limitada**: solo 5 combates de verificación final fresca, lo que reduce la robustez estadística de la validación.
- **Sin tracción comunitaria**: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso externo.
- **Dependencia del runtime microduck**: la política está acoplada a la interfaz de 61 observaciones y 14 acciones y al ecosistema de la Arena; fuera de él su utilidad es marginal.
- **Riesgo de sobreajuste a la liga**: al tratarse de un campeón retenido sin reentrenamiento, puede no generalizar a variaciones del entorno no cubiertas por los combates de investigación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BabyClaw/duck-skill-20261105-tug-of-war
- Repositorio de origen: https://huggingface.co/BabyClaw/microduck-beaktug-long-juice-1240
- Evento de la Arena (tug-of-war): https://huggingface.co/spaces/pollen-robotics/microduck-arena#/e/tug-of-war
- Paper: no disponible
- Blog: no disponible
- Repositorio de código: no disponible
- Demo: no disponible
