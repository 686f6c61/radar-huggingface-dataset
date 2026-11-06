# RSanchez996/microduck-sock-heist-6m-v3-g-calibrated-late-turn

## Resumen

microduck-sock-heist-6m-v3-g-calibrated-late-turn es una política de control robótico entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo microduck de Pollen Robotics. El modelo, publicado por el usuario RSanchez996 en HuggingFace, implementa una marcha (gait) perpetua que se ejecuta de forma continua hasta recibir una orden de parada, con una frecuencia de control de 50 Hz. No se trata de un modelo de lenguaje, sino de un policy de robótica que consume observaciones de 61 dimensiones y emite 14 acciones de control.

El modelo se distribuye en formato ONNX dentro de un repositorio de tamaño prácticamente nulo (0.0 GB según HuggingFace), lo que sugiere un artefacto de pesos muy compacto, coherente con una política de red neuronal pequeña para control en tiempo real. La observación se normaliza internamente dentro de `policy.onnx`, de modo que el robot puede alimentar observaciones en bruto sin preprocesado externo.

La relevancia de esta ficha es limitada fuera del ecosistema microduck: se trata de un experimento de investigación con 0 descargas y 0 likes en el momento de la consulta, sin licencia declarada ni idiomas especificados. Su interés principal radica en ser un ejemplo reproducible de entrenamiento RL con mjlab para un robot de bajo coste, no en capacidades de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | política de control por aprendizaje por refuerzo (no se especifica la topología de red; artefacto ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (exportado a ONNX; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del manifiesto de políticas microduck) |

## Arquitectura y entrenamiento

El modelo es una política de refuerzo entrenada con el framework mjlab (basado en MuJoCo) para la tarea `Mjlab-SockHeist6m-MicroDuck`. La observación tiene 61 dimensiones y la acción 14 dimensiones, ejecutándose a 50 Hz. El entrenamiento se realizó con 4096 entornos paralelos, semilla 22, 100 iteraciones máximas y guardado cada 25 iteraciones, partiendo de un checkpoint (`model_75.pt`) de una ejecución anterior denominada `v3_e_explosive_sprint`. El checkpoint final exportado es el 75, sobre la base `mjlab-microduck 0.1.0` en el commit `1efd853be`, con código del repositorio `microduck-challenges` en la rama `exp_sock_heist_speed_v3` y commit `250d533f0`.

No se documenta la topología exacta de la red (número de capas, unidades ocultas ni parámetros), ni el número total de pasos de entrenamiento, ni la composición del dataset de recompensas. El autor advierte que el entrenamiento no es bit-reproducible entre máquinas: repetir el mismo comando con la misma semilla produce una política comparable, no idéntica. La normalización de observaciones está integrada en el ONNX, lo que simplifica el despliegue en el robot.

## Capacidades

- Control locomotor continuo del robot microduck mediante una marcha perpetua a 50 Hz.
- Consumo de observaciones brutas de 61 dimensiones con normalización interna.
- Emisión de 14 acciones de control por paso.
- Ejecución hasta recibir orden de parada (política perpetua, no episódica).
- Carga directa en una ranura de política del daemon mediante `robotctl policy load`.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, audio ni tool calling.
- No soporta agentes ni razonamiento multi-paso en el sentido de los LLM.
- No se documentan capacidades multilingües (no aplica).

## Casos de uso

- Investigación en locomoción de bajo coste: usar la política como línea base para comparar marchas en el robot microduck, gracias a su carácter perpetuo y a la reproducibilidad documentada del pipeline de entrenamiento.
- Reproducción de experimentos RL: clonar `microduck-challenges` en el commit indicado, sincronizar con `uv` y relanzar el comando de entrenamiento para obtener una política comparable y estudiar la variabilidad entre ejecuciones.
- Demostraciones educativas de robótica: cargar la política en una ranura del daemon con `robotctl policy load` para mostrar control por RL en un cuadrúpedo de bajo coste sin necesidad de infraestructura de inferencia compleja.
- Evaluación de robustez de gaits: ejecutar la marcha en distintas superficies y condiciones para medir deriva y estabilidad, aprovechando la frecuencia de control de 50 Hz.
- Integración en pipelines de simulación a realidad: validar en MuJoCo/mjlab antes de desplegar en hardware, usando el mismo artefacto ONNX que corre en el robot.
- Punto de partida para fine-tuning: reanudar desde el checkpoint 75 con otra semilla o configuración de recompensa para explorar variantes de la marcha (por ejemplo, cambios de velocidad o de estilo de giro).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0.0 GB y el artefacto es un ONNX de política de control, por lo que se espera un consumo muy reducido, pero no se documenta cifra alguna.
- GPU recomendadas: no disponible. El entrenamiento se realizó con 4096 entornos paralelos, lo que requiere una GPU de datacenter, pero el autor no especifica el modelo utilizado.
- Compatibilidad con GPU de consumo: no disponible; por el tamaño del artefacto es plausible que la inferencia quepa en hardware de gama baja, pero no hay confirmación.
- Opciones de despliegue: el despliegue previsto es en el propio robot mediante el daemon microduck y el comando `robotctl policy load <slot> <repo>`; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: frecuencia de control de 50 Hz (periodo de 20 ms) según la model card; no se publican latencias medidas ni throughput.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada políticas comparables para el robot microduck ni alternativas de la misma categoría con datos verificables de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica permiso de uso comercial ni condiciones de redistribución; debe contactarse con el autor antes de cualquier uso en producción.
- Sin benchmarks ni métricas de rendimiento publicadas: no hay evidencia cuantitativa de robustez, tasa de éxito ni estabilidad de la marcha.
- Entrenamiento no bit-reproducible: repetir el comando genera pesos distintos, lo que complica la auditoría exacta de resultados.
- Exportado desde un checkout con cambios sin commitear, según la propia model card, lo que introduce incertidumbre sobre la correspondencia exacta entre código y pesos.
- Ámbito muy restringido: solo funciona con el robot microduck y su daemon; no es reusable para otras plataformas sin reentrenamiento.
- Sin información sobre sesgos, alucinación o limitaciones de idioma (no aplican a un modelo de control), pero tampoco hay documentación sobre comportamiento en condiciones fuera de distribución.
- 0 descargas y 0 likes en el momento de la consulta: sin validación por parte de la comunidad.
- La fecha de creación indicada (2026-11-05) es futura respecto a la información habitual de este tipo de fichas; conviene verificar la vigencia del repositorio.

## Enlaces

- HuggingFace: https://huggingface.co/RSanchez996/microduck-sock-heist-6m-v3-g-calibrated-late-turn
- Repositorio de entrenamiento: https://github.com/RSanchez996/microduck-challenges.git (rama `exp_sock_heist_speed_v3`, commit `250d533f0`)
- Proyecto microduck: https://github.com/pollen-robotics/microduck
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon microduck
- Base de entrenamiento: mjlab-microduck 0.1.0 en el commit `1efd853be`
