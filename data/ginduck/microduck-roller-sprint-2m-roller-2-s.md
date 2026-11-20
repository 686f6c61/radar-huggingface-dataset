# GinDuck/microduck-roller-sprint-2m-roller-2-s

## Resumen

`microduck-roller-sprint-2m-roller-2-s` es una política de control por refuerzo (reinforcement learning) entrenada para el robot cuadrúpedo de código abierto **microduck** de Pollen Robotics, en su configuración sobre ruedas (rollers). No es un modelo de lenguaje: es un checkpoint de control motor que genera comandos de actuación a 50 Hz a partir de observaciones de 61 dimensiones, produciendo 14 acciones. Se distribuye como un grafo ONNX autocontenido que incluye el normalizador de observaciones, de modo que el robot puede consumir observaciones en crudo.

El autor (GinDuck) lo describe como un checkpoint de su segunda tanda de entrenamiento centrada en velocidad: abandona el patinaje (skating) y prioriza el sprint. Según sus propias pruebas, completa el recorrido en aproximadamente 1,5 a 1,6 segundos. Es una política **perpetua**: ejecuta la marcha indefinidamente hasta que se le indique lo contrario, y se carga en una ranura (slot) del daemon del robot mediante `robotctl`.

Su relevancia es acotada pero clara: forma parte del ecosistema de retos de microduck (`microduck-challenges`, rama `race-2`), un banco de pruebas reproducible para investigación en locomoción con RL sobre hardware de bajo coste. El repositorio tiene 0 descargas y 0 likes, tamaño de 0,0 GB y no dispone de licencia declarada, lo que limita su uso fuera de experimentación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de reinforcement learning exportada a ONNX (arquitectura de red no detallada en la model card) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; observación de 61 dimensiones por paso) |
| Tipos de cuantización | no disponible (distribución en ONNX, sin variantes cuantizadas publicadas) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del manifiesto de políticas microduck) |

Parámetros operativos adicionales:

| Parámetro | Valor |
|---|---|
| Frecuencia de control | 50 Hz |
| Dimensión de observación | 61 |
| Dimensión de acción | 14 |
| Normalizador de observaciones | Integrado en `policy.onnx` (entrada en crudo) |
| Tarea de entrenamiento | `Mjlab-RollerSprint2m-MicroDuck` |
| Checkpoint | 4750 |
| Semilla | 1 |
| Commit de entrenamiento | `b44f7ffc9` (rama `race-2`) |
| Base de simulación | `mjlab-microduck 0.1.0 @ 1efd853be` |

## Arquitectura y entrenamiento

La model card no especifica la topología de la red neuronal (número de capas, anchura, tipo de MLP o política actor-crítica). Lo que sí documenta es el pipeline: entrenamiento con aprendizaje por refuerzo en simulación usando **mjlab** (framework de RL sobre MuJoCo) con el entorno `Mjlab-RollerSprint2m-MicroDuck`, 2048 entornos paralelos, hasta 6000 iteraciones del agente y semilla 1. El resultado se exporta a ONNX con el normalizador de observaciones embebido, de forma que la política recibe observaciones sin preprocesar.

El autor advierte explícitamente que el entrenamiento **no es bit-reproducible**: repetir el comando con el mismo `uv.lock`, mismo commit y misma semilla produce una política comparable, no idéntica, porque el RL sobre GPU no garantiza reproducibilidad exacta entre máquinas. No se documentan datos sobre composición del dataset (al ser RL en simulación, la «distribución» es la del entorno), ni uso de RLHF/DPO (no aplica), ni innovaciones como decodificación especulativa o atención lineal (no aplica a un controlador).

## Capacidades

- Control locomotor de sprint sobre ruedas para el robot microduck: genera 14 comandos de actuación a 50 Hz a partir de 61 observaciones.
- Política perpetua: mantiene la marcha indefinidamente hasta que se descarga o se sustituye la política en la ranura.
- Desplazamiento orientado a velocidad: según el autor, completa el recorrido en 1,5–1,6 s en sus pruebas.
- Carga directa en robot mediante `robotctl policy load <slot> GinDuck/microduck-roller-sprint-2m-roller-2-s`.
- Inferencia autocontenida: el normalizador va dentro del ONNX, sin pasos de preprocesado externos.
- No soporta tool calling, function calling, agentes multi-paso, capacidades multilingües, visión, audio ni modo thinking: no es un modelo generativo de lenguaje.

## Casos de uso

- **Investigación en locomoción con RL sobre hardware de bajo coste**: servir como checkpoint de referencia en la rama `race-2` de `microduck-challenges` para comparar recetas de entrenamiento (skating frente a sprint) sobre el mismo robot y simulador.
- **Carreras y retos de velocidad con microduck**: cargar la política en una ranura del daemon y medir tiempos de recorrido; el autor reporta 1,5–1,6 s, lo que permite usarlo como baseline en competiciones internas del ecosistema.
- **Validación de pipeline sim-to-real**: al incluir el normalizador en el ONNX y exponer un manifiesto con schema versionado, sirve para probar el flujo completo de exportación, carga en robot y ejecución a 50 Hz sin tocar código del cliente.
- **Reproducción de experimentos de RL**: el comando de entrenamiento documentado (2048 entornos, 6000 iteraciones, semilla 1, `uv.lock` fijado) permite regenerar políticas comparables y estudiar la varianza entre ejecuciones.
- **Banco de pruebas de controladores en ONNX**: útil para validar runtimes de inferencia ONNX embebidos en el daemon del robot, midiendo latencia a 50 Hz con una política real de 61→14.
- **Docencia y demostraciones de RL aplicado a robótica**: ejemplo completo y de código abierto de un ciclo entrenamiento en mjlab → exportación ONNX → despliegue en robot físico, con instrucciones de reproducción paso a paso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento aportado por el autor es cualitativo-cuantitativo y proviene de sus propias pruebas: tiempo de finalización de aproximadamente 1,5 a 1,6 segundos en el recorrido de la tarea `Mjlab-RollerSprint2m-MicroDuck`. No hay métricas de recompensa, tasa de éxito, robustez ante perturbaciones ni comparación numérica con otros checkpoints.

## Requisitos de hardware

- **VRAM estimada**: no disponible. El tamaño del repositorio es de 0,0 GB y no se publica el número de parámetros; una política de 61 entradas y 14 salidas en ONNX es, en la práctica, un modelo de pocos kilobytes a pocos megabytes, pero no se confirma en la información proporcionada.
- **GPU recomendadas**: no aplica para inferencia en robot; el despliegue previsto es en la computadora del microduck ejecutando ONNX. Para reentrenar, la receta usa 2048 entornos paralelos en mjlab, lo que requiere una GPU dedicada (modelo concreto no especificado).
- **Compatibilidad con GPU de consumo**: no disponible para entrenamiento; para inferencia, el cuello de botella es la frecuencia de control (50 Hz) y la CPU del robot, no la VRAM.
- **Opciones de despliegue**: `robotctl` (daemon de microduck) con carga por ranura; runtime ONNX estándar para pruebas fuera del robot. No se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican).
- **Latencia y throughput**: el bucle de control opera a 50 Hz (20 ms por paso). No se publican latencias medidas de la inferencia ONNX ni throughput.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros checkpoints de la misma tarea con métricas comparables, ni datos de parámetros, contexto o rendimiento de alternativas. El propio ecosistema `microduck-challenges` (rama `race-2`) alberga presumiblemente otras políticas, pero no se aportan sus especificaciones.

## Limitaciones y advertencias

- **Sin licencia declarada**: no se especifica licencia, lo que impide determinar si el uso comercial está permitido. Tratarlo como no apto para producción hasta aclararlo con el autor.
- **Sin datos de entrenamiento ni arquitectura**: la model card no detalla la topología de red ni el número de parámetros, lo que dificulta auditorías técnicas.
- **Rendimiento autodeclarado**: el tiempo de 1,5–1,6 s proviene de las pruebas del propio autor, sin protocolo ni métricas publicadas; no debe tomarse como benchmark independiente.
- **No reproducible bit a bit**: el propio autor advierte que reentrenar con la misma semilla y configuración produce pesos distintos; cualquier comparación debe hacerse entre políticas, no entre pesos.
- **Específico de hardware**: la política está entrenada para el microduck sobre rollers; no es transferible a otro robot ni a otra configuración sin reentrenamiento.
- **Sin validación externa**: 0 descargas y 0 likes; no hay evidencia de uso por terceros ni de robustez sim-to-real más allá de la afirmación del autor.
- **Riesgo de sobreajuste al entorno de simulación**: al ser RL en mjlab, el comportamiento fuera de la distribución del simulador (terrenos, fricción, desgaste de ruedas) no está caracterizado.
- **Sin soporte de lenguaje ni de herramientas**: no debe evaluarse con criterios de modelos generativos; carece de alucinación en el sentido lingüístico, pero puede fallar silenciosamente ante observaciones anómalas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GinDuck/microduck-roller-sprint-2m-roller-2-s
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de retos y recetas de entrenamiento: https://github.com/pollen-robotics/microduck-challenges
- Documentación del manifiesto de políticas (`docs/policy-manifest.md` en el repositorio del daemon): no disponible como URL directa en la información proporcionada
