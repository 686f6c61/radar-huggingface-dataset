# DenRakEiw/microduck-songkran-duck-tug2

## Resumen

`microduck-songkran-duck-tug2` es una política de control entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de código abierto microduck de Pollen Robotics. No se trata de un modelo de lenguaje, sino de un controlador neuronal exportado a ONNX que traduce observaciones de 61 dimensiones en 14 acciones de control a 50 Hz, diseñado para ejecutarse de forma continua en el robot físico o en simulación. Lo publica el usuario DenRakEiw dentro del ecosistema de retos de microduck.

La política está especializada en la tarea `Mjlab-TugOfWar-MicroDuck` (tira y afloja o *tug of war*), entrenada a partir de una referencia de Pollen con una recompensa de *settle-gap* y una protección contra física inestable (D25), en el checkpoint 400. El modelo se describe como "perpetuo": ejecuta una marcha hasta que se le indique lo contrario, y se carga en una ranura de política del demonio `robotctl`.

Su relevancia es acotada pero concreta: sirve como ejemplo reproducible de un pipeline de RL para robótica con simulación masiva (4096 entornos), manifiesto de política versionado y despliegue directo en hardware. El repositorio es de tamaño prácticamente nulo (0.0 GB), sin descargas ni *likes* en el momento de la consulta, y sin licencia ni idiomas declarados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política neuronal de RL exportada a ONNX (no se detalla la topología interna) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; observación de 61 dimensiones, 14 acciones, 50 Hz |
| Tipos de cuantización | no disponible (se distribuye como `policy.onnx`) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del manifiesto de políticas microduck) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de la red (capas, anchura, activaciones). Lo que sí se documenta es el pipeline de entrenamiento: tarea `Mjlab-TugOfWar-MicroDuck`, repositorio `pollen-robotics/microduck-challenges`, rama `denrakeiw-070`, commit `6c0b5d452`, semilla 3, checkpoint 400, sobre la base `mjlab-microduck 0.1.0 @ 1efd853be`. El entrenamiento se lanzó el 2026-11-16T20:05:32Z con 4096 entornos paralelos, hasta 3000 iteraciones y registro en TensorBoard.

La configuración incluye una recompensa de *settle-gap* con peso 10.0, recompensa de margen de foso con peso 2.0, veredicto de marcador con peso 50.0, y una penalización de velocidad angular del cuerpo y momento angular a 0.0. Se aplica un currículo sobre la tasa de acción y el sesgo de pose de cabeza, y un oponente compuesto por una mezcla de `titan-v1` (0.7) y la referencia (0.3) con retardo inicial de 16 pasos y dispersión de 16. La duración de episodio es de 10.5 s y la terminación por caída en el foso tiene tiempo límite. El autor advierte que el entrenamiento no es bit-reproducible entre máquinas: la misma semilla y comando producen una política comparable, no idéntica.

## Capacidades

- Control locomotor continuo del microduck a 50 Hz con 61 entradas de observación y 14 salidas de acción.
- Ejecución de una marcha "perpetua" orientada a la tarea de tira y afloja hasta recibir una orden de parada.
- Normalización de observaciones integrada en `policy.onnx`: acepta observaciones en bruto sin preprocesado externo.
- Carga y despliegue mediante el demonio `robotctl` en una ranura de política.
- Compatibilidad con el esquema 2 de manifiesto de políticas de microduck.
- No soporta tool calling, agentes, razonamiento multi-paso, multilingüismo ni modalidades de texto, visión o audio.

## Casos de uso

- Investigación en RL para robótica: reproducir el entrenamiento con el comando documentado, mismo `uv.lock`, commit y semilla, para estudiar variabilidad entre ejecuciones y sensibilidad a hiperparámetros.
- Evaluación de políticas de tira y afloja: cargar la política en una ranura y enfrentarla a oponentes (`titan-v1`, referencia u otras políticas) para medir comportamiento en el escenario `Mjlab-TugOfWar-MicroDuck`.
- Benchmarking de simulación masiva: usar la configuración de 4096 entornos como referencia para comparar rendimiento de entrenamiento entre GPUs y versiones de `mjlab-microduck`.
- Despliegue en hardware microduck: ejecutar `robotctl policy load <slot> DenRakEiw/microduck-songkran-duck-tug2` para probar la marcha en el robot físico con observaciones en bruto.
- Estudio de estabilidad física: la protección D25 contra física inestable y las recompensas de margen de foso permiten analizar cómo evita el agente colapsos y caídas en el foso.
- Base para *fine-tuning*: partir de esta política como inicialización en variantes de la tarea (distinta mezcla de oponentes, duración de episodio o pesos de recompensa) dentro del repositorio de retos.
- Docencia en robótica con RL: ejemplo completo y reproducible de pipeline sim-a-real con manifiesto versionado y exportación ONNX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de recompensa final, tasa de éxito, distancia recorrida ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0.0 GB y no se detalla el tamaño del ONNX, por lo que la huella es presumiblemente muy reducida.
- GPU recomendadas para entrenamiento: no especificadas; el comando usa 4096 entornos paralelos, lo que sugiere GPUs de datacenter (A100/H100) o configuraciones multi-GPU, pero no se confirma.
- GPU de consumo: no se indica compatibilidad; al ser una política pequeña en ONNX, es plausible que quepa en GPUs de consumo, pero no hay dato que lo respalde.
- Opciones de despliegue: demonio `robotctl` del ecosistema microduck (carga en ranura de política); ejecución del ONNX con el runtime que use dicho demonio. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; se especifica un bucle de control a 50 Hz, pero sin cifras de latencia por inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Tarea | Contexto / observación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `microduck-songkran-duck-tug2` | Política RL (ONNX) | Tira y afloja microduck | 61 obs. / 14 acciones / 50 Hz | no disponible | Hugging Face |
| `titan-v1` (referencia en la config) | Política RL | Oponente en tira y afloja | no disponible | no disponible | Referenciada en logs de entrenamiento |
| Referencia Pollen (base) | Política RL | Marcha base microduck | no disponible | no disponible | Repositorio `pollen-robotics/microduck` |

No se dispone de datos cuantitativos de rendimiento para establecer una comparación numérica con alternativas.

## Limitaciones y advertencias

- Especialización estrecha: la política está entrenada para la tarea `Mjlab-TugOfWar-MicroDuck`; no es un modelo general y su comportamiento fuera de ese escenario no está garantizado.
- Licencia no declarada: no se puede asumir uso comercial ni redistribución; es necesario contactar con el autor o consultar el repositorio de retos antes de usarla en producción.
- Sin idiomas ni modalidades declaradas: no aplica a tareas de texto, visión o audio.
- Reproducibilidad limitada: el propio autor advierte que el RL en GPU no es bit-reproducible; los pesos exactos no se pueden regenerar en otra máquina.
- Sin métricas publicadas: no hay benchmarks, tasas de éxito ni curvas de recompensa que permitan evaluar la calidad de la política antes de desplegarla.
- Riesgo en hardware real: al ser una política entrenada en simulación, puede sufrir la brecha sim-a-real; conviene validarla en un entorno controlado antes de operarla con el robot físico.
- Estado del repositorio: 0 descargas y 0 *likes* en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DenRakEiw/microduck-songkran-duck-tug2
- Repositorio microduck: https://github.com/pollen-robotics/microduck
- Repositorio de retos de entrenamiento: https://github.com/pollen-robotics/microduck-challenges
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del demonio (referenciada en la model card)
