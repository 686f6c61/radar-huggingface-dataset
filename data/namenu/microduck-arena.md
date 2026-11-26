# namenu/microduck-arena

## Resumen

Microduck-arena (publicado internamente como strata-roller-pb4) es una política de control para el robot cuadrúpedo de código abierto microduck, desarrollado por Pollen Robotics. No es un modelo de lenguaje: es una política de aprendizaje por refuerzo entrenada para generar una marcha perpetua sobre ruedas (rollers), con una observación de 61 dimensiones y 14 acciones a 50 Hz. El autor del repositorio es el usuario namenu, que lo distribuye a través de Hugging Face con el pipeline `robotics`.

El modelo se entrenó y evaluó en Strata, el entorno de microduck-challenges, usando PPO sobre comandos de carrera sin el shaping calm-skate y con un término ligero de mantenimiento de verticalidad, seguido de cuatro rondas de estrategias evolutivas (ES) sobre el scorer de rollers de Arena. La política es perpetua: se ejecuta de forma continua hasta que se le indique lo contrario, y se carga en una ranura de política del demonio `robotctl`.

Su relevancia es acotada pero concreta: sirve como ejemplo de política de locomoción lista para desplegar en hardware microduck mediante un único archivo ONNX con la normalización de observaciones incorporada, y como caso práctico de entrenamiento híbrido PPO + ES en un entorno de evaluación competitivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de aprendizaje por refuerzo (PPO + ES), exportada a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) y manifiesto `manifest.json` (schema 2) |

## Arquitectura y entrenamiento

La política se entrenó en dos fases. Primero, PPO sobre comandos de carrera en el entorno roller de microduck-challenges, con el shaping calm-skate eliminado y un término ligero de verticalidad. Después, cuatro rondas de estrategias evolutivas (ES) sobre el scorer de rollers de Arena, lo que sugiere un ajuste fino guiado por la función de recompensa del evaluador competitivo. El repositorio de entrenamiento citado es `pollen-robotics/microduck_rl`.

La interfaz es de 61 dimensiones de observación y 14 acciones a 50 Hz, con la normalización de observaciones incorporada en el propio `policy.onnx`, de modo que se alimentan observaciones en bruto. El tamaño del repositorio es de 0.0 GB, lo que es coherente con una política neuronal pequeña. No se dispone de detalles sobre el número de parámetros, la composición del dataset ni la arquitectura interna de la red.

## Capacidades

- Generación de una marcha perpetua sobre ruedas para el robot microduck, sin condición de terminación explícita.
- Control de locomoción a 50 Hz con 14 acciones.
- Consumo de observaciones en bruto gracias a la normalización integrada en el ONNX.
- Carga directa en una ranura de política mediante `robotctl policy load`.
- Compatibilidad con el manifiesto de políticas schema 2 del demonio microduck.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es una política de control motriz, no un modelo generativo.

## Casos de uso

- Demostración de locomoción sobre ruedas: cargar la política en un microduck físico y ejecutar una marcha continua para validar el hardware y el demonio `robotctl`.
- Pruebas de integración del pipeline de políticas: usar `policy.onnx` y `manifest.json` como referencia para verificar la carga de políticas en ranuras y el cumplimiento del schema 2.
- Base para ajuste fino con ES: partir de esta política y aplicar nuevas rondas de estrategias evolutivas sobre un scorer propio para adaptar la marcha a otra superficie o tarea.
- Comparación de metodologías de entrenamiento: servir de ejemplo reproducible de PPO con shaping reducido frente a variantes con shaping calm-skate.
- Evaluación en entornos simulados de competición: ejecutar la política en el entorno roller de microduck-challenges para medir su rendimiento con el scorer de Arena.
- Docencia y experimentación en robótica de refuerzo: usar una política pequeña en ONNX para ilustrar el ciclo completo de entrenamiento, exportación y despliegue en un cuadrúpedo de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0.0 GB, por lo que la política es de tamaño reducido y probablemente quepa en cualquier GPU, e incluso en CPU.
- GPU recomendadas: no disponible. Dado el tamaño, no se requiere una GPU de datacenter.
- Compatibilidad con GPU de consumo: previsiblemente sí en cualquier GPU de consumo moderna, aunque no se confirma en la información disponible.
- Opciones de despliegue: ONNX Runtime (formato nativo del archivo) y el demonio `robotctl` del stack microduck.
- Latencia y throughput estimados: no disponibles; la política está pensada para ejecutarse a 50 Hz en el robot.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas de microduck ni modelos comparables con datos de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Es una política de control específica para el robot microduck sobre ruedas; no es un modelo de lenguaje ni un modelo generativo.
- La licencia no está disponible, por lo que no se puede confirmar el uso comercial ni la redistribución.
- No se documentan sesgos, pero al ser una política entrenada con una recompensa concreta puede presentar comportamientos no deseados fuera de la distribución de entrenamiento.
- El entrenamiento se realizó en simulación (Strata/microduck-challenges); el rendimiento en hardware real puede degradarse por diferencias de dinámica (sim-to-real).
- No se especifican los idiomas ni la composición del dataset de entrenamiento.
- La política es perpetua y no tiene condición de parada propia: requiere que el operador la detenga explícitamente.
- No hay resultados de benchmarks publicados que permitan validar su rendimiento de forma independiente.

## Enlaces

- Hugging Face: https://huggingface.co/namenu/microduck-arena
- Repositorio microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento citado: `pollen-robotics/microduck_rl` (sin URL directa en la información disponible)
