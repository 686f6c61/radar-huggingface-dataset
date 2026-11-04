# heyskylark/microduck-heist-onesided

## Resumen

`heyskylark/microduck-heist-onesided` es una política de control entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de código abierto microduck, desarrollado por Pollen Robotics. No se trata de un modelo de lenguaje ni de un modelo generativo de propósito general, sino de un controlador neuronal que traduce observaciones del robot (61 dimensiones) en acciones motoras (14 dimensiones) a una frecuencia de 50 Hz. El autor lo publica bajo el identificador `heyskylark` y lo etiqueta como política "perpetua": se ejecuta de forma continua hasta que se le indica lo contrario.

El modelo se ha entrenado con el framework mjlab (simulación física basada en MuJoCo) sobre la tarea `Mjlab-SockHeist6m-MicroDuck`, con 4096 entornos paralelos y 2000 iteraciones máximas, partiendo del checkpoint 1900 y con semilla 1. La política se distribuye en formato ONNX con el normalizador de observaciones embebido en el propio grafo, de modo que el consumidor puede alimentar observaciones en bruto sin preprocesado adicional.

Su relevancia es acotada pero concreta: sirve como ejemplo reproducible de un pipeline completo de RL para robótica (entrenamiento en simulación, exportación a ONNX, despliegue en un robot real mediante el daemon `robotctl`) y como artefacto listo para cargar en un slot de política del microduck. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0.0 GB según la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política neuronal para control robótico (red feed-forward exportada a ONNX; detalles de capas no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje); ventana de observación de 61 dimensiones por paso |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX, presumiblemente FP32) |
| Idiomas soportados | no aplica (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) más `manifest.json` con esquema 2 del manifiesto de políticas de microduck |
| Frecuencia de control | 50 Hz |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Tarea de entrenamiento | `Mjlab-SockHeist6m-MicroDuck` |
| Framework de entrenamiento | mjlab-microduck 0.1.0 (commit 1efd853be) |
| Checkpoint | 1900 |
| Semilla | 1 |
| Entornos paralelos | 4096 |
| Iteraciones maximas | 2000 |

## Arquitectura y entrenamiento

La información disponible no detalla la topología interna de la red (número de capas, anchura, funciones de activación). Lo que sí se conoce es la interfaz: recibe un vector de observación de 61 dimensiones, produce 14 acciones y opera a 50 Hz, con el normalizador de observaciones integrado en el grafo ONNX. Esto implica que el modelo espera observaciones en bruto del robot y aplica internamente la normalización estadística calculada durante el entrenamiento, lo que elimina una fuente habitual de errores de integración en el despliegue.

El entrenamiento se realizó con mjlab (entorno de RL basado en MuJoCo) sobre la tarea `Mjlab-SockHeist6m-MicroDuck`, con 4096 entornos simulados en paralelo, hasta 2000 iteraciones y semilla 1, partiendo de la base `mjlab-microduck 0.1.0` en el commit `1efd853be`. El autor advierte explícitamente que el proceso no es bit-reproducible entre máquinas: repetir el entrenamiento con el mismo código, `uv.lock`, comando y semilla produce una política comparable, pero no idéntica. No se documenta el uso de RLHF, DPO ni técnicas de alineación, algo esperable en un controlador robótico.

## Capacidades

- Locomoción y control motor del microduck: genera comandos de 14 dimensiones a 50 Hz para ejecutar una marcha ("gait") de forma continua.
- Ejecución perpetua: la política está diseñada para correr indefinidamente hasta que se le ordene lo contrario, a diferencia de políticas episódicas.
- Integración directa con el daemon del robot mediante `robotctl policy load <slot> heyskylark/microduck-heist-onesided`.
- Observaciones en bruto: el normalizador va embebido en el ONNX, por lo que no requiere preprocesado externo.
- Compatibilidad con el manifiesto de políticas de microduck, esquema 2.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo thinking, visión, audio ni procesamiento de texto.

## Casos de uso

- Despliegue de referencia en microduck: cargar la política en un slot con `robotctl policy load` para disponer de una marcha funcional sin entrenar desde cero. Es adecuado porque el artefacto ya incluye el normalizador y sigue el manifiesto oficial.
- Validación de la cadena de herramientas mjlab-microduck: usar este repositorio como caso de prueba de extremo a extremo (entrenamiento, exportación ONNX, carga en el daemon) para verificar que una instalación nueva del stack funciona correctamente.
- Punto de partida para fine-tuning o currículos de RL: al estar publicados el commit, la semilla y el comando exactos, sirve como baseline reproducible sobre el que comparar variantes de recompensa o de escena.
- Docencia e investigación en robótica con RL: ejemplo compacto de política de locomoción con observaciones de 61 dimensiones y acciones de 14, útil para ilustrar el ciclo sim-a-real en un robot de bajo coste.
- Pruebas de integración continua del daemon: el par `policy.onnx` + `manifest.json` permite testear el cargador de políticas y el esquema 2 del manifiesto en pipelines automatizados.
- Demostraciones y vídeos de comportamiento: al ser una política perpetua, resulta adecuada para exhibiciones continuas del robot sin necesidad de reiniciar episodios.
- Benchmark interno de latencia: a 50 Hz el presupuesto por paso es de 20 ms; la política sirve para medir el coste de inferencia ONNX en el hardware objetivo del microduck.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de recompensa, tasas de éxito, distancia recorrida ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada: no disponible. Al ser una política de control de dimensión de entrada 61 y salida 14, el modelo es presumiblemente muy pequeño y cabe en cualquier GPU, e incluso podría ejecutarse en CPU, pero el tamaño exacto no se documenta.
- GPU recomendadas: no disponibles. Para el entrenamiento, el autor emplea 4096 entornos paralelos, lo que en la práctica requiere una GPU de datacenter (A100, H100 o similar); para inferencia, el hardware del propio microduck o un equipo anfitrión modesto.
- Cabe en GPU de consumo: muy probablemente sí, dado el reducido tamaño de entrada/salida, aunque no se confirma en la información disponible.
- Opciones de despliegue: ONNX Runtime para la inferencia del `policy.onnx`; el despliegue en robot se realiza mediante el daemon de microduck y el comando `robotctl`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: el control opera a 50 Hz, es decir, 20 ms por paso como presupuesto máximo. No se publican latencias medidas ni throughput de entrenamiento.

## Comparativa con modelos similares

| Modelo | Tipo | Dimension observacion / accion | Frecuencia | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| heyskylark/microduck-heist-onesided | Política RL para microduck | 61 / 14 | 50 Hz | ONNX | no disponible | HuggingFace (0 descargas) |
| Otras políticas de microduck en HuggingFace | Política RL para microduck | no disponible | no disponible | no disponible | no disponible | no disponible |
| Políticas de locomotion para cuadrúpedos (p. ej. ANYmal, Unitree) | Política RL | variable | variable | habitualmente ONNX o TorchScript | habitualmente no disponible o restrictiva | repositorios de investigación |

No se dispone de datos de rendimiento que permitan una comparación cuantitativa con alternativas. La comparativa se limita a la interfaz y al formato de distribución.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no procesa texto, no responde preguntas y no debe evaluarse con benchmarks de NLP.
- Licencia no disponible: la ausencia de licencia explícita impide asumir permisos de uso comercial; es necesario contactar con el autor antes de cualquier despliegue productivo.
- Especificidad de hardware: la política está entrenada para el microduck concreto (61 observaciones, 14 acciones, 50 Hz); no es transferible a otro robot sin reentrenamiento.
- No reproducibilidad bit a bit: el propio autor advierte que repetir el entrenamiento produce pesos distintos, lo que complica la auditoría exacta del artefacto.
- Sin métricas publicadas: no hay evidencia documentada de robustez ante perturbaciones, terreno irregular o fallos de sensores.
- Riesgo de sim-a-real gap: al entrenarse en simulación (mjlab/MuJoCo), el comportamiento en el robot físico puede degradarse respecto al simulado; no se documentan técnicas de domain randomization.
- Sesgos: no aplica en el sentido de sesgos sociales, pero sí puede existir un sesgo hacia las condiciones de simulación vistas durante el entrenamiento.
- Alucinación: no aplica; el riesgo equivalente es la generación de acciones fuera de rango o inestables ante observaciones fuera de distribución.
- Ventana de observación fija: 61 dimensiones por paso, sin memoria explícita documentada más allá de lo que la propia política haya aprendido.
- Advertencia de seguridad: cargar una política en un robot físico conlleva riesgo de movimiento inesperado; deben tomarse precauciones (zona despejada, parada de emergencia) antes de ejecutar `robotctl policy load`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/heyskylark/microduck-heist-onesided
- Repositorio del robot microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de retos y entrenamiento del autor: `git@github.com:heyskylark/microduck-challenges.git` (referenciado en la model card; no se dispone de URL HTTPS verificada)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon de microduck (ruta citada en la model card; no se dispone de URL directa)
- Commit de la base de entrenamiento: `1efd853be` de `mjlab-microduck 0.1.0` (sin URL directa disponible)
- Commit del repositorio de entrenamiento: `74974ac64` (sin URL directa disponible)
