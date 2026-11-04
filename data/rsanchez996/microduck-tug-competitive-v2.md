# RSanchez996/microduck-tug-competitive-v2

## Resumen

`microduck-tug-competitive-v2` es una política de control motriz entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de código abierto **microduck** de Pollen Robotics. No es un modelo de lenguaje ni un sistema multimodal: es un controlador neuronal que genera comandos de actuación a 50 Hz a partir de observaciones propioceptivas de 61 dimensiones y produce 14 acciones, con el objetivo específico de resolver una tarea de "tug of war" (tira y afloja) de forma perpetua, incorporando mecanismos anti-caída y de recuperación.

El modelo lo publica el usuario RSanchez996 en Hugging Face bajo el identificador `RSanchez996/microduck-tug-competitive-v2`, con la librería `microduck` y el pipeline `robotics`. Se distribuye en formato ONNX (`policy.onnx`) con el normalizador de observaciones embebido en el propio grafo, de modo que el consumidor debe alimentar observaciones en crudo. Incluye además un `manifest.json` conforme al esquema 2 del manifiesto de políticas de microduck.

Su relevancia es acotada pero concreta: demuestra el flujo completo de entrenamiento y despliegue de políticas RL en un robot cuadrúpedo de bajo coste, con una política "perpetua" (ejecuta un gait continuo hasta que se le indique lo contrario) pensada para cargarse en una ranura de política del demonio `robotctl`. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño declarado de 0.0 GB, lo que sugiere un artefacto muy pequeño (coherente con una red de política compacta en ONNX).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política para control motriz (RL); arquitectura interna no detallada en la model card |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje); observación de 61 dimensiones por paso |
| Tipos de cuantizacion | no disponible (exportado a ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de robótica, sin entrada/salida de texto) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2 del manifiesto de políticas microduck) |

## Arquitectura y entrenamiento

La model card no detalla la topología interna de la red (número de capas, anchura, tipo de activaciones ni si emplea memoria recurrente). Lo que sí se especifica es la interfaz: observación de 61 dimensiones, 14 acciones, frecuencia de control de 50 Hz, y una política de naturaleza "perpetua" que ejecuta un gait continuo hasta recibir una orden de parada. El normalizador de observaciones está integrado en el grafo ONNX, por lo que la política consume observaciones sin preprocesar.

El entrenamiento se realizó con el repositorio `pollen-robotics/microduck_rl`, en la rama `ft_competitive_multiopponent` y el commit `b8328925e`, con la particularidad de que la exportación se hizo desde un checkout con cambios sin confirmar. Esto implica que el artefacto publicado no es reproducible de forma exacta a partir del commit indicado. La model card menciona explícitamente mecanismos anti-caída y de recuperación, así como un escenario multioponente ("competitive"), pero no aporta detalles sobre el algoritmo RL (PPO, SAC, etc.), el volumen de muestras, el diseño de recompensas ni el currículo de entrenamiento.

## Capacidades

- Control locomotor continuo del robot microduck a 50 Hz mediante una política RL perpetua.
- Ejecución de una tarea de "tug of war" (tira y afloja) contra oponentes, entrenada en un escenario multioponente.
- Comportamientos anti-caída y de recuperación tras perturbaciones o pérdida de equilibrio.
- Interfaz estandarizada de observación (61 dimensiones) y acción (14 dimensiones) compatible con el demonio `robotctl`.
- Carga directa en una ranura de política del robot mediante `robotctl policy load <slot> <repo>`.
- Inferencia vía ONNX con normalización de observaciones embebida (sin preprocesado externo).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- **Demostración de tug of war con microduck**: cargar la política en una ranura con `robotctl policy load` y ejecutar el gait contra un oponente humano u otro robot; es adecuada porque está entrenada específicamente para ese escenario multioponente y funciona de forma perpetua.
- **Investigación en aprendizaje por refuerzo para robótica de bajo coste**: usar la política como línea base o punto de partida para experimentos de robustez (perturbaciones, cambios de fricción, empujes) gracias a sus mecanismos anti-caída y de recuperación.
- **Pruebas de recuperación ante caídas**: validar en banco de pruebas la capacidad de recuperación tras desequilibrios, aprovechando que la política incorpora comportamientos explícitos de recuperación.
- **Integración en pipelines de simulación a realidad**: emplear el artefacto ONNX como referencia para comparar el comportamiento simulado frente al real, dado que el normalizador está embebido y la interfaz es fija (61→14 a 50 Hz).
- **Evaluación de robustez multioponente**: enfrentar la política a distintos oponentes y condiciones para medir la generalización del entrenamiento `ft_competitive_multiopponent`.
- **Docencia y talleres de robótica cuadrúpeda**: desplegar una política funcional en el microduck sin necesidad de reentrenar, útil para ilustrar el ciclo completo RL → exportación ONNX → despliegue en robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de recompensa, tasas de éxito, estabilidad ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- **VRAM estimada**: no disponible; el tamaño del repositorio es de 0.0 GB y la política es una red compacta en ONNX, por lo que la huella de memoria debería ser mínima (inferencia en CPU plausible), aunque no se documenta.
- **GPU recomendadas**: no disponible; para una política de robótica de este tamaño no se requiere GPU dedicada en el robot.
- **Compatibilidad con GPU de consumo**: presumiblemente sí (cualquier GPU de consumo o incluso CPU), pero no confirmado en la documentación.
- **Opciones de despliegue**: ONNX Runtime (formato nativo del artefacto) y el demonio `robotctl` del ecosistema microduck mediante `policy load`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- **Latencia y throughput**: no disponibles; el control opera a 50 Hz (periodo de 20 ms), pero no se publican latencias medidas.

## Comparativa con modelos similares

| Modelo | Tipo | Interfaz | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-tug-competitive-v2 | Política RL para microduck (tug of war) | 61 obs / 14 acciones, 50 Hz | ONNX | no disponible | Hugging Face (0 descargas) |
| Otras políticas del ecosistema microduck | Políticas RL para el mismo robot | Variable según política | ONNX / manifiesto microduck | Variable | Repositorio `pollen-robotics/microduck_rl` |
| Políticas RL para cuadrúpedos comerciales (p. ej. Unitree, ANYmal) | Controladores RL propietarios o de investigación | Específicas del robot | Varía | Propietaria o de investigación | No directamente comparables |

No se dispone de datos de rendimiento ni de especificaciones detalladas de alternativas comparables en la información proporcionada; la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- **Licencia no especificada**: no se indica licencia, por lo que el uso comercial y la redistribución quedan sin marco legal claro; conviene contactar con el autor antes de cualquier uso en producción.
- **Reproducibilidad comprometida**: la exportación se realizó desde un checkout con cambios sin confirmar sobre el commit `b8328925e`, de modo que el artefacto no es reproducible exactamente desde el repositorio.
- **Especificidad de tarea**: la política está entrenada para tug of war; no se garantiza su comportamiento en otras tareas locomotoras.
- **Sesgos y alucinación**: no aplica en el sentido de modelos de lenguaje; el riesgo equivalente es la aparición de comportamientos no deseados o inestables fuera de la distribución de entrenamiento.
- **Ausencia de métricas**: sin benchmarks publicados, no es posible evaluar objetivamente su robustez, tasa de éxito o estabilidad frente a alternativas.
- **Madurez**: 0 descargas y 0 likes; sin evidencia de validación por parte de la comunidad.
- **Idioma y contexto**: no aplica; el modelo no procesa texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RSanchez996/microduck-tug-competitive-v2
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `ft_competitive_multiopponent`, commit `b8328925e`)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del demonio microduck
