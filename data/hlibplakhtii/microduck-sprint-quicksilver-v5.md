# HlibPlakhtii/microduck-sprint-quicksilver-v5

## Resumen

Quicksilver Sprint v5 es una política de control robótico desarrollada por HlibPlakhtii como participación en la competición MicroDuck Arena 2 m Sprint. No se trata de un modelo de lenguaje, sino de un modelo de política (policy model) entrenado para controlar un robot bípedo cuadrúpedo de simulación llamado MicroDuck, con el objetivo de recorrer una distancia de 2 metros lo más rápido posible. El modelo se distribuye en formato ONNX y su pipeline en Hugging Face está registrado como "robotics".

El modelo parte del checkpoint `jrubiosainz/microduck-game-sprinter-remix14` mediante fine-tuning, y aplica una búsqueda local sobre comandos de motor y pesos de realimentación para optimizar el mantenimiento de la velocidad durante el contacto del pie. Según la model card, el evaluador local del Arena registra un tiempo medio de 0,816 s sobre cinco arranques de simulación a una consigna de velocidad de 0,2 m/s, con tiempos individuales entre 0,810 s y 0,825 s.

La relevancia de este modelo es acotada: se trata de una entrada de competición con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados de índole general y con una documentación centrada exclusivamente en la verificación de tiempos de la tarea Sprint. Resulta útil como referencia de técnicas de fine-tuning de políticas de locomoción y de exportación a ONNX para simulación, pero no es un modelo de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (política de control exportada a ONNX; no se especifica la arquitectura interna) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica a un modelo de política) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de la política. Se sabe que el modelo es un fine-tune de `jrubiosainz/microduck-game-sprinter-remix14` (relación `base_model_relation: finetune`), que se exporta como policy ONNX para su ejecución en el entorno de simulación MicroDuck Arena. La model card describe el proceso como una búsqueda local que ajusta comandos de motor y pesos de realimentación con el objetivo de conservar velocidad durante el contacto del pie con el suelo, lo que sugiere una política de control reactiva con realimentación de estado.

No se especifican datos de entrenamiento (número de episodios, composición del dataset, uso de RLHF/DPO u otras técnicas). El autor indica que la política "empareja observaciones registradas con cinco trayectorias simuladas" y que la política ONNX exportada reproduce cada trayectoria seleccionada junto con su fase de asentamiento. La evaluación se limita a los cinco arranques oficiales de simulación, con artefactos de verificación (`local-verification.json`) y de procedencia (`provenance.json`) incluidos en el repositorio.

## Capacidades

- Control de locomoción de un robot MicroDuck en simulación para la tarea Sprint de 2 metros.
- Generación de comandos de motor con realimentación ajustada para mantener velocidad en el contacto del pie.
- Ejecución de trayectorias con fase de asentamiento posterior a la llegada.
- Exportación a ONNX para integración en pipelines de simulación.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, audio ni capacidades multilingües.
- No dispone de soporte de tool calling, function calling ni razonamiento multi-paso.
- No se documentan capacidades de agente ni de planificación de alto nivel.

## Casos de uso

- Evaluación comparativa en la competición MicroDuck Arena 2 m Sprint: el modelo puede emplearse como referencia de tiempos de referencia (0,816 s de media a 0,2 m/s) frente a otras entradas de la misma tarea, gracias a que la model card documenta los cinco tiempos individuales y los artefactos de verificación.
- Estudio de técnicas de fine-tuning de políticas de locomoción: sirve como caso práctico de ajuste de comandos de motor y pesos de realimentación sobre un checkpoint base (`microduck-game-sprinter-remix14`) para mejorar la conservación de velocidad durante el contacto.
- Integración en simuladores mediante ONNX: al exportarse como policy ONNX, puede cargarse en entornos de simulación compatibles con ONNX Runtime para reproducir las trayectorias registradas y su fase de asentamiento.
- Docencia y divulgación sobre control robótico: el repositorio incluye verificación local y procedencia, lo que facilita explicar el flujo completo de entrenamiento, evaluación y exportación de una política de control.
- Validación de pipelines de exportación ONNX: sirve como prueba de que la política exportada reproduce las trayectorias seleccionadas en simulación, útil para verificar herramientas de conversión y ejecución.
- Base para nuevos fine-tunes en la misma familia: al ser un fine-tune de un modelo base documentado, puede emplearse como punto de partida para variantes orientadas a otras consignas de velocidad o tareas del Arena.

## Benchmarks y rendimiento

Los únicos datos disponibles son los tiempos de la tarea Sprint registrados por el evaluador local del Arena a una consigna de 0,2 m/s:

| Arranque de simulación | Tiempo de llegada (s) |
|---|---:|
| 1 | 0,810 |
| 2 | 0,815 |
| 3 | 0,825 |
| 4 | 0,815 |
| 5 | 0,815 |
| Media | 0,816 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no se trata de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0,0 GB y no se detalla el tamaño del archivo ONNX.
- GPU recomendadas: no disponibles; al ser una política de control en ONNX, es probable que pueda ejecutarse en CPU, pero no se confirma en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: ejecución mediante ONNX Runtime (formato de pesos ONNX); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos comparables de la misma categoría (políticas de control para MicroDuck Arena) más allá del modelo base del que deriva. La comparación se limita a la relación de fine-tuning:

| Modelo | Relación | Licencia | Formato | Tarea |
|---|---|---|---|---|
| HlibPlakhtii/microduck-sprint-quicksilver-v5 | Fine-tune | Apache 2.0 | ONNX | Sprint 2 m |
| jrubiosainz/microduck-game-sprinter-remix14 | Modelo base | no disponible en la información proporcionada | ONNX (política) | Sprint |

No se dispone de datos de rendimiento del modelo base ni de otras entradas de la competición para establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- Modelo altamente especializado: solo cubre la tarea Sprint de 2 metros en el entorno MicroDuck Arena; no es reutilizable para otras tareas sin nuevo entrenamiento.
- Evaluación limitada a cinco arranques de simulación, sin validación en hardware real ni en condiciones fuera de las oficiales del Arena.
- No se documentan sesgos, pero al ser una política entrenada en simulación, puede presentar un gap de simulación a realidad (sim-to-real) no evaluado.
- Riesgo de sobreajuste a las cinco trayectorias de evaluación: la model card indica que la política reproduce las trayectorias seleccionadas, lo que no garantiza generalización a otras condiciones iniciales.
- Sin información sobre arquitectura, número de parámetros ni datos de entrenamiento, lo que dificulta auditar el modelo.
- Licencia Apache 2.0: permite uso comercial y modificación, pero se debe conservar el aviso de atribución y la documentación de los autores upstream indicada en `NOTICE` y `BASE_MODEL_CARD.md`.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación independiente.
- No aplica a tareas de lenguaje, visión ni agentes; no debe confundirse con un modelo de propósito general.

## Enlaces

- [Hugging Face: HlibPlakhtii/microduck-sprint-quicksilver-v5](https://huggingface.co/HlibPlakhtii/microduck-sprint-quicksilver-v5)
- [Modelo base: jrubiosainz/microduck-game-sprinter-remix14](https://huggingface.co/jrubiosainz/microduck-game-sprinter-remix14)
- [Política upstream (ONNX)](https://huggingface.co/jrubiosainz/microduck-game-sprinter-remix14/resolve/e9a74fa9a55e00f972e87d158f40db660a54be91/policy.onnx)
- [Verificación local](local-verification.json)
- [Trayectorias y checksums](provenance.json)
- [Model card del modelo base](BASE_MODEL_CARD.md)
- [Aviso legal](NOTICE)
- [Licencia](LICENSE)
