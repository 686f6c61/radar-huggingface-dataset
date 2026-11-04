# SccHy/microduck-hill-a1rb4ck-r3

## Resumen

`microduck-hill-a1rb4ck-r3` es una política de control robótico entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo microduck de Pollen Robotics. No se trata de un modelo de lenguaje ni de un modelo generativo multimodal: es un controlador neuronal exportado a ONNX que recibe observaciones de 61 dimensiones y emite 14 acciones a 50 Hz, destinado a ejecutarse embebido en el propio robot o en el daemon de control `robotctl`.

El modelo ha sido publicado por el usuario SccHy bajo la librería `microduck` y la etiqueta `robotics`, y se describe explícitamente como una política «perpetua»: una marcha que se ejecuta de forma continua hasta que se le indique lo contrario, cargada en una ranura de política del robot. La normalización de las observaciones está integrada dentro del propio fichero `policy.onnx`, de modo que la política consume observaciones en crudo sin preprocesado externo.

La relevancia de esta ficha es limitada en el ecosistema de IA open source generalista: se trata de un artefacto de control motor específico para un robot de bajo coste, con cero descargas y cero likes en el momento de la consulta, sin model card sustantiva (el README es prácticamente un esqueleto), sin licencia declarada y con un tamaño de repositorio de 0.0 GB según HuggingFace. La información disponible no permite caracterizar arquitectura interna, rendimiento ni composición del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (política neuronal de control para robótica, exportada a ONNX; arquitectura interna no especificada) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no aplica: no es un modelo de lenguaje; opera sobre observaciones de 61 dimensiones por paso) |
| Tipos de cuantizacion | No disponible (formato ONNX; se desconoce si incluye cuantización) |
| Idiomas soportados | No aplica (modelo de control robótico, sin interfaz de lenguaje) |
| Licencia | No disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` con esquema 2 del manifiesto de políticas microduck |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Frecuencia de control | 50 Hz |
| Tipo de política | Perpetua (ejecución continua hasta interrupción) |
| Libreria | microduck |
| Pipeline | robotics |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna de la red neuronal que implementa la política. El artefacto distribuido es un fichero `policy.onnx` con la normalización de observaciones embebida, lo que indica una red feedforward o recurrente exportada desde un framework de entrenamiento (probablemente PyTorch) a ONNX para inferencia en el daemon del robot. El `manifest.json` sigue el esquema 2 del manifiesto de políticas microduck documentado en `docs/policy-manifest.md` del repositorio del daemon.

En cuanto al entrenamiento, la model card referencia el repositorio `pollen-robotics/microduck_rl`, rama `challenge-recipe-publishing`, commit `1efd853be`. Esto sugiere que la política se entrenó con el pipeline de aprendizaje por refuerzo oficial de Pollen Robotics dentro de un «challenge» o competición de recetas de entrenamiento. No se especifican el número de pasos de entorno, la composición de recompensas, el algoritmo de RL empleado (PPO, SAC u otro), ni detalles sobre dominios de aleatorización o currículo de entrenamiento. La descripción «hill-a1rb4ck-r3» parece una etiqueta interna del autor sin significado técnico documentado.

## Capacidades

- Control locomotor continuo del robot cuadrúpedo microduck mediante una marcha («gait») perpetua.
- Consumo de observaciones de 61 dimensiones en crudo, con normalización integrada en el grafo ONNX.
- Emisión de 14 acciones de control a 50 Hz, compatible con el bucle de control del daemon `robotctl`.
- Carga directa en una ranura de política del robot mediante el comando `sudo robotctl policy load <slot> SccHy/microduck-hill-a1rb4ck-r3`.
- Ejecución autónoma sin terminación por episodio: la política no tiene condición de parada propia.
- No soporta tool calling, function calling, razonamiento multi-paso, generación de texto, visión ni audio.
- No dispone de capacidades multilingües (no hay interfaz de lenguaje).

## Casos de uso

- Demostración de locomoción en microduck: cargar la política en una ranura y dejar que el robot ejecute la marcha de forma continua para exhibiciones o vídeos de laboratorio. Es adecuada porque está empaquetada como ONNX autónomo y se integra con el comando oficial del daemon.
- Investigación en aprendizaje por refuerzo para robótica de bajo coste: servir como política de referencia o línea base frente a nuevas recetas entrenadas en `microduck_rl`, dado que el autor publica la rama y commit de entrenamiento.
- Pruebas de integración del daemon `robotctl`: validar el flujo de carga de políticas, la lectura del `manifest.json` con esquema 2 y la ejecución en bucle a 50 Hz sin necesidad de entrenar una política propia.
- Benchmarking de simulación a realidad: comparar el comportamiento de esta política en el robot físico frente a su rendimiento en el simulador del repositorio `microduck_rl`, siempre que se disponga del entorno de simulación correspondiente.
- Educación y talleres: ilustrar el ciclo completo de entrenamiento y despliegue de una política de RL en un cuadrúpedo de bajo coste, usando esta política como ejemplo ya exportado.
- Recolecta de datos de marcha: ejecutar la política de forma perpetua para capturar trazas de observaciones y acciones que alimenten análisis posteriores de estabilidad o ajuste de controladores clásicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de recompensa, tasas de éxito, estabilidad, velocidad de desplazamiento ni comparaciones con otras políticas del mismo robot.

## Requisitos de hardware

- VRAM estimada: no disponible. El tamaño del repositorio figura como 0.0 GB y no se especifica el número de parámetros, por lo que no puede estimarse el consumo de memoria de la política.
- GPU recomendadas: no disponible. Al ser una política ONNX de control a 50 Hz, es plausible que se ejecute en CPU del propio robot o en una SBC, pero esto no está confirmado en la información proporcionada.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue: el despliegue documentado es mediante el daemon `robotctl` del ecosistema microduck (`sudo robotctl policy load <slot> ...`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles. El único dato temporal es la frecuencia de control de 50 Hz (periodo de 20 ms por paso), que condiciona el presupuesto de cómputo por inferencia pero no se traduce en cifras de latencia medidas.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas del mismo robot ni referencias a controladores comparables (por ejemplo, políticas del challenge de `microduck_rl`) con las que establecer una comparación de parámetros, contexto, rendimiento o licencia. Tampoco se dispone de datos de modelos de RL para cuadrúpedos de otras plataformas en la información consultada.

## Limitaciones y advertencias

- Ausencia total de licencia declarada: no puede asumirse permiso de uso comercial, redistribución ni modificación. Cualquier uso en producción requiere contactar con el autor.
- Model card prácticamente vacía: sin descripción del algoritmo de RL, recompensas, dataset, semilla ni métricas. La reproducibilidad es muy limitada.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.
- Repositorio de 0.0 GB: no puede verificarse el contenido real ni el tamaño de los pesos desde los metadatos.
- Política «perpetua» sin condición de parada propia: requiere que el operador detenga explícitamente la ejecución; en un robot físico esto implica riesgos de seguridad si no se gestiona el bucle de control.
- Sin información sobre dominios de aleatorización ni robustez ante perturbaciones: no puede garantizarse la estabilidad de la marcha en terrenos distintos a los del entrenamiento.
- Sin soporte de lenguaje, visión, tool calling ni agentes: no es adecuada para tareas cognitivas o de interacción conversacional.
- Fecha de creación indicada como 2026-11-04, posterior a la fecha habitual de consulta: conviene verificar la integridad y autenticidad del repositorio antes de desplegarlo.
- Dependencia del daemon y del manifiesto esquema 2: cambios de versión en `robotctl` o en `microduck_rl` pueden romper la compatibilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SccHy/microduck-hill-a1rb4ck-r3
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL referenciado: `pollen-robotics/microduck_rl` (rama `challenge-recipe-publishing`, commit `1efd853be`)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (no se proporciona URL directa en la información disponible)
