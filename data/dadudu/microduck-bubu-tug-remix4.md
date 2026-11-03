# dadudu/microduck-bubu-tug-remix4

## Resumen

`dadudu/microduck-bubu-tug-remix4` es una política de control robótico entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de bajo coste microduck, desarrollado por Pollen Robotics. No se trata de un modelo de lenguaje: es un controlador neuronal exportado a ONNX que genera comandos motores a 50 Hz a partir de observaciones de 61 dimensiones y produce 14 acciones de actuación. El modelo es un *remix* (fine-tuning) del checkpoint `lphatnguyen/microduck-tug-of-war-v0`, orientado a la tarea de "tira y afloja" (tug of war) y publicado como variante de marcha para el slot `walk` del daemon de control del robot.

La relevancia de este tipo de políticas radica en que permiten dotar de locomoción aprendida a plataformas robóticas de bajo coste sin necesidad de ingeniería de control manual. La política es "perpetua": se ejecuta de forma continua hasta que el operador la detiene, lo que la hace adecuada para demostraciones de marcha sostenida en el robot físico.

La información pública disponible es muy escasa: el repositorio tiene 0 GB de tamaño declarado, 0 descargas y 0 likes, sin licencia especificada ni idiomas declarados. La model card se limita a describir el uso en robot, la procedencia del checkpoint base y la referencia al repositorio de entrenamiento `pollen-robotics/microduck_rl`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política neuronal para control robótico (aprendizaje por refuerzo); arquitectura interna no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje); observación de 61 dimensiones por paso |
| Tipos de cuantizacion | no disponible (exportado a ONNX; normalizador de observaciones integrado en `policy.onnx`) |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del manifiesto de políticas microduck) |

## Arquitectura y entrenamiento

La política se entrenó con el framework `pollen-robotics/microduck_rl` (rama `main`, commit `a3e0c0fbe`), que implementa un pipeline de aprendizaje por refuerzo para el robot microduck. La política opera a 50 Hz, recibe observaciones de 61 dimensiones (estado de articulaciones, sensores internos y probablemente información de la tarea) y emite 14 acciones de control. El modelo se distribuye como un grafo ONNX con el normalizador de observaciones embebido, de modo que el robot puede alimentar observaciones crudas directamente sin preprocesado externo.

El checkpoint es un fine-tuning de `lphatnguyen/microduck-tug-of-war-v0` (revisión `bca92ace`), un modelo entrenado para la tarea de tira y afloja. El autor describe el resultado como un "remix" del entorno Tug of War Arena y lo publica como política de marcha perpetua para el slot `walk`. No se detallan en la información disponible el número de tokens de entrenamiento (no aplica), la composición del dataset de episodios, ni si se emplearon técnicas de RL específicas como PPO, SAC o currículo de recompensas. Los créditos incluyen a lphatnguyen, jrubiosainz, rumezhak, a1rb4Ck y Pollen Robotics.

## Capacidades

- Locomoción bípeda/cuadrúpeda aprendida para el robot microduck: genera una marcha continua ("perpetua") que se ejecuta hasta que se detiene explícitamente.
- Control reactivo a 50 Hz: produce 14 acciones motoras a partir de 61 observaciones por paso.
- Integración con el daemon de control del robot mediante `robotctl policy load walk dadudu/microduck-bubu-tug-remix4`.
- Normalización de observaciones integrada en el modelo ONNX, lo que simplifica el despliegue en el robot.
- Compatible con el manifiesto de políticas microduck schema 2.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, multilingüismo, visión, audio ni modo de pensamiento: no es un modelo generativo de texto.

## Casos de uso

- Demostración de marcha en el robot físico microduck: cargar la política en el slot `walk` con `robotctl` y dejar que el robot camine de forma continua durante una sesión de exhibición o vídeo.
- Investigación en aprendizaje por refuerzo para robótica de bajo coste: usar la política como línea base o punto de partida para comparar variantes de recompensa y entornos de entrenamiento.
- Fine-tuning sobre el checkpoint base: al derivar de `lphatnguyen/microduck-tug-of-war-v0`, sirve como inicialización para nuevas tareas de locomoción o de interacción física (por ejemplo, empujar o tirar de objetos).
- Pruebas de integración del stack de control: validar el pipeline `robotctl` + manifiesto schema 2 + ONNX en entornos de simulación o hardware antes de desplegar políticas propias.
- Educación y talleres de robótica: el robot microduck y sus políticas públicas permiten ilustrar el ciclo completo de entrenamiento RL, exportación a ONNX y despliegue en hardware.
- Evaluación comparativa de políticas de marcha: comparar esta variante "remix" con el checkpoint original y con otras políticas del mismo slot para medir estabilidad, velocidad y consumo energético.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de recompensa, velocidad de marcha, estabilidad ni comparaciones cuantitativas con el checkpoint base.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser una política de control de pequeño tamaño exportada a ONNX, es probable que quepa en CPU, pero no se especifica.
- GPU recomendadas: no disponible; para inferencia en el propio robot no se requiere GPU.
- ¿Cabe en GPU de consumo? No disponible; el despliegue previsto es en el ordenador de control del robot o en el propio robot, no en GPU dedicada.
- Opciones de despliegue: ONNX Runtime (formato `policy.onnx`), daemon `robotctl` de microduck con el comando `sudo robotctl policy load walk dadudu/microduck-bubu-tug-remix4`.
- Latencia y throughput: el bucle de control opera a 50 Hz (20 ms por paso); no se publican latencias medidas ni throughput adicional.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada / salida | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `dadudu/microduck-bubu-tug-remix4` | Política RL (ONNX) para microduck | 61 obs. / 14 acciones | 50 Hz | no disponible | HuggingFace, 0 descargas |
| `lphatnguyen/microduck-tug-of-war-v0` | Política RL para microduck (checkpoint base) | 61 obs. / 14 acciones (según model card del remix) | 50 Hz | no disponible | HuggingFace |
| Otras políticas del slot `walk` de microduck | Políticas RL para microduck | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas políticas en la información proporcionada.

## Limitaciones y advertencias

- Información pública muy limitada: sin licencia declarada, sin idiomas, sin métricas de rendimiento y con 0 descargas, lo que impide evaluar su calidad de forma independiente.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; conviene contactar con el autor antes de integrarla en un producto.
- Política específica de tarea: entrenada para el entorno Tug of War Arena y publicada como marcha para el slot `walk`; su comportamiento fuera de ese contexto (terrenos irregulares, cargas, perturbaciones) no está documentado.
- Riesgo de fallo en hardware real: las políticas RL pueden sobreajustarse a la dinámica del simulador; no se documentan pruebas de sim-a-real ni tasas de éxito en el robot físico.
- Dependencia del stack microduck: requiere el daemon `robotctl` y el manifiesto schema 2; no es un modelo reutilizable fuera de esa plataforma.
- Sin soporte de lenguaje, visión ni herramientas: no debe confundirse con un modelo de propósito general.
- Procedencia y reproducibilidad: se referencia el commit `a3e0c0fbe` del repositorio de entrenamiento, pero no se detallan hiperparámetros, semillas ni configuración de recompensas, lo que dificulta reproducir el resultado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dadudu/microduck-bubu-tug-remix4
- Modelo base: https://huggingface.co/lphatnguyen/microduck-tug-of-war-v0
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `main`, commit `a3e0c0fbe`)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (no se proporciona URL directa)
