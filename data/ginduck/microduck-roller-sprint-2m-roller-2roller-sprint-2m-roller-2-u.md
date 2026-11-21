# GinDuck/microduck-roller-sprint-2m-roller-2roller-sprint-2m-roller-2-u

## Resumen

`microduck-roller-sprint-2m-roller-2roller-sprint-2m-roller-2-u` es un checkpoint de política de control entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de código abierto microduck de Pollen Robotics. Lo publica el usuario GinDuck dentro de una serie de experimentos denominada "roller run", en este caso orientada a la velocidad de desplazamiento sobre ruedas (rollers) en lugar de al patinaje. El modelo no es un modelo de lenguaje: es una política perpetua que mapea observaciones de 61 dimensiones a 14 acciones de control a 50 Hz.

El artefacto se distribuye como un fichero ONNX (`policy.onnx`) con el normalizador de observaciones integrado, acompañado de un `manifest.json` que sigue el esquema 2 del manifiesto de políticas de microduck. Se carga directamente en una ranura de política del daemon del robot mediante `robotctl`. El autor reporta un tiempo de finalización de aproximadamente 1,6 segundos en sus propias pruebas.

La relevancia del checkpoint es acotada: se trata de un experimento de investigación en robótica de locomoción, con cero descargas y cero likes en el momento de la consulta, y sin datos publicados de benchmarks formales. Su interés reside en la reproducibilidad del pipeline de entrenamiento (mjlab, Isaac-based) y en servir como referencia para quien entrene políticas similares sobre el mismo hardware.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de control entrenada con aprendizaje por refuerzo (red neuronal, detalles no disponibles); exportada a ONNX |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2) |
| Observaciones de entrada | 61 dimensiones |
| Acciones de salida | 14 dimensiones |
| Frecuencia de control | 50 Hz |
| Tarea (task_id) | `Mjlab-RollerSprint2m-MicroDuck` |
| Checkpoint | 3750 |
| Semilla | 1 |
| Tamaño del repositorio | 0.0 GB |

## Arquitectura y entrenamiento

La política se entrena con el framework mjlab (base `mjlab-microduck 0.1.0` en el commit `1efd853be`) sobre el repositorio `pollen-robotics/microduck-challenges`, rama `race-2`, commit `b44f7ffc9`. El entrenamiento parte de 2048 entornos paralelos durante un máximo de 6000 iteraciones con semilla 1, registrando métricas en TensorBoard bajo el nombre de ejecución `roller-2`. La observación de 61 dimensiones y la acción de 14 dimensiones son coherentes con el espacio de control del microduck sobre rollers.

El autor advierte explícitamente que el entrenamiento no es bit-reproducible entre máquinas: repetir el comando con el mismo `uv.lock`, el mismo código y la misma semilla produce una política comparable, pero no idéntica. El normalizador de observaciones está embebido en el propio `policy.onnx`, de modo que el consumidor debe alimentar observaciones en crudo sin preprocesar. La política es de tipo perpetuo: ejecuta una marcha continua hasta que se le indique lo contrario.

## Capacidades

- Locomoción sobre rollers del microduck a 50 Hz con 14 acciones de control.
- Política perpetua: mantiene la marcha indefinidamente hasta recibir una orden de parada o cambio.
- Sprint orientado a velocidad: el autor reporta ~1,6 s de tiempo de finalización en sus pruebas.
- Normalización de observaciones integrada en el ONNX, lo que simplifica la integración en el daemon.
- Carga directa en una ranura de política mediante `robotctl policy load <slot> <repo>`.
- Compatible con el esquema 2 del manifiesto de políticas de microduck.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: es una política de control motor, no un modelo generativo.

## Casos de uso

- Investigación en locomoción con ruedas: sirve como política de referencia para comparar recetas de entrenamiento sobre el mismo robot y el mismo task_id.
- Reproducción de experimentos: el comando de entrenamiento documentado permite regenerar una política comparable y estudiar la varianza entre ejecuciones.
- Base para fine-tuning o curricula: al ser un checkpoint intermedio (3750) de una serie, puede usarse como punto de partida para variantes de velocidad o terreno.
- Demostraciones y carreras: el autor menciona seguimiento de carreras y copas Arena mediante la aplicación QuackPack, por lo que la política puede emplearse en exhibiciones cronometradas.
- Validación del pipeline mjlab: útil para verificar que la cadena de entrenamiento, exportación a ONNX y carga en el daemon funciona de extremo a extremo.
- Benchmark interno de latencia: al ejecutarse a 50 Hz con un ONNX pequeño, permite medir el coste de inferencia en la computadora del robot.
- Educación y talleres: ejemplo práctico de RL aplicado a robótica de bajo coste con hardware abierto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento aportado por el autor es un tiempo de finalización de aproximadamente 1,6 segundos en sus propias pruebas, sin especificar la pista, las condiciones ni la métrica exacta.

## Requisitos de hardware

- VRAM estimada: no disponible; el repositorio ocupa 0.0 GB y la política es un ONNX de tamaño reducido, por lo que se espera que quepa en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no disponibles; para entrenamiento, el comando usa 2048 entornos paralelos, lo que requiere una GPU de datacenter (A100, H100 o similar) o un clúster.
- GPU consumer: la inferencia del ONNX debería caber en cualquier GPU consumer moderna; no se dispone de cifras oficiales.
- Despliegue: el destino previsto es el daemon de microduck mediante `robotctl policy load`; el ONNX también puede ejecutarse con ONNX Runtime en otros entornos.
- Latencia y throughput: no disponibles; el control opera a 50 Hz, lo que fija un presupuesto de 20 ms por ciclo.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada otras políticas comparables del mismo autor o del mismo task_id con las que establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribución; conviene contactar con el autor antes de usarla en producción.
- Entrenamiento no bit-reproducible: el propio autor advierte que repetir el comando produce pesos distintos.
- Sin benchmarks formales: el único dato de rendimiento es el tiempo de ~1,6 s reportado por el autor, sin condiciones documentadas.
- Específica de hardware: la política está entrenada para el microduck sobre rollers; no es transferible a otros robots ni a terrenos sin ruedas.
- Sin datos de sesgos ni robustez: no se documentan evaluaciones de robustez ante perturbaciones, cambios de superficie o fallos de sensores.
- Repositorio vacío en apariencia (0.0 GB) y sin descargas ni likes: la disponibilidad y el mantenimiento del artefacto no están garantizados.
- Sin información sobre idiomas ni contexto: no aplica, pero se indica para evitar expectativas erróneas.
- Riesgo de sobreajuste a la pista de entrenamiento: al ser un sprint de 2 m, el comportamiento fuera de ese régimen no está validado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GinDuck/microduck-roller-sprint-2m-roller-2roller-sprint-2m-roller-2-u
- Repositorio microduck: https://github.com/pollen-robotics/microduck
- Repositorio de retos y entrenamiento: https://github.com/pollen-robotics/microduck-challenges
- Aplicación QuackPack (seguimiento de carreras): https://www.imundo.ch/quackpack/
