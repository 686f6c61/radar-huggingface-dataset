# JackDH/microduck-hill-climb-20261102-best

## Resumen

`JackDH/microduck-hill-climb-20261102-best` es una política de control para el robot cuadrúpedo de código abierto microduck de Pollen Robotics, entrenada mediante aprendizaje por refuerzo en simulación. No es un modelo de lenguaje: es un controlador neuronal que mapea observaciones de 61 dimensiones a 14 acciones de actuador a 50 Hz, exportado en formato ONNX para su ejecución directa en el robot. El autor (JackDH) lo publica como checkpoint seleccionado de una tanda de entrenamiento local ejecutada en una RTX 4090.

La política implementa una marcha («gait») perpetua para la tarea `Mjlab-HillClimb1m5-MicroDuck`, es decir, subida de pendiente en un entorno simulado de 1,5 m construido con mjlab sobre MuJoCo. El checkpoint corresponde a la iteración 1000 de un entrenamiento con 4096 entornos paralelos y semilla 1, con un máximo configurado de 3000 iteraciones. Se carga en una ranura de política del demonio `robotctl` del robot mediante un único comando.

Su relevancia es acotada pero concreta: sirve como referencia reproducible de un pipeline completo de RL para robótica (entorno mjlab, entrenamiento masivo en paralelo, exportación ONNX con normalizador embebido y despliegue en hardware) y como punto de partida para comparar variantes de la misma tarea. El repositorio es de 0,0 GB, sin descargas ni «likes», y la model card no documenta licencia ni idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica neuronal para control roboticos (red feedforward, detalles no disponibles); exportada a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de observacion de 61 dimensiones por paso |
| Tipos de cuantizacion | no disponible (se distribuye como `policy.onnx`, presumiblemente FP32) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del manifiesto de politicas microduck) |

## Arquitectura y entrenamiento

La política se entrena con mjlab (framework de RL sobre MuJoCo) como parte del repositorio `microduck-challenges`. La tarea `Mjlab-HillClimb1m5-MicroDuck` simula una rampa de 1,5 m que el robot debe ascender. El espacio de observación tiene 61 dimensiones y el de acción 14, con control a 50 Hz. El entrenamiento se lanzó con 4096 entornos en paralelo, un máximo de 3000 iteraciones y semilla 1; el checkpoint publicado es la iteración 1000, seleccionada como mejor de la tanda.

El pipeline incluye un normalizador de observaciones embebido dentro del propio `policy.onnx`, de modo que el consumidor debe alimentar observaciones en crudo sin preprocesar. El `manifest.json` sigue el esquema 2 documentado en `docs/policy-manifest.md` del repositorio del demonio. El autor advierte explícitamente que el entrenamiento no es bit-reproducible entre máquinas: repetir el comando con el mismo `uv.lock`, commit y semilla produce una política comparable, no los mismos pesos. La base es `mjlab-microduck 0.1.0` en el commit `1efd853be`, y el entrenamiento se ejecutó localmente en una RTX 4090.

## Capacidades

- Control locomotor de un cuadrúpedo microduck: genera comandos de actuación a 50 Hz a partir de observaciones de 61 dimensiones.
- Marcha perpetua: la política se ejecuta de forma continua hasta que se le indique lo contrario; no tiene condición de terminación interna.
- Ascenso de pendientes: entrenada específicamente para la tarea de subida de colina de 1,5 m.
- Normalización integrada: acepta observaciones en crudo, sin capa de preprocesado externa.
- Despliegue directo en hardware mediante `robotctl policy load <slot> <repo>`.
- No soporta tool calling, agentes, razonamiento multi-paso, multilingüismo ni modalidades de texto, visión o audio.

## Casos de uso

- Despliegue de referencia en el microduck: cargar la política en una ranura del demonio con `robotctl policy load` para disponer de una marcha funcional de subida de pendiente sin entrenar desde cero. Es adecuada porque el manifest y el ONNX están listos para el runtime del robot.
- Baseline para comparación de políticas: usar este checkpoint como referencia contra nuevas variantes de la tarea `HillClimb1m5` para medir mejoras de recompensa o robustez. El autor lo etiqueta explícitamente como «baseline».
- Reproducción de un pipeline de RL completo: clonar `microduck-challenges`, hacer checkout del commit `5cee942d8`, sincronizar con `uv` y relanzar el entrenamiento con los mismos hiperparámetros para estudiar la variabilidad entre ejecuciones.
- Evaluación de sim-a-real en robótica de bajo coste: probar la política en el microduck físico para medir la brecha entre el entorno mjlab y el hardware real en una tarea acotada (rampa de 1,5 m).
- Docencia y prototipado de RL para robótica: el repositorio, el comando de entrenamiento y el formato de manifiesto ofrecen un ejemplo completo y de pequeño tamaño (0,0 GB) para cursos o talleres.
- Integración en pipelines de CI para políticas: validar que un `policy.onnx` y su `manifest.json` cumplen el esquema 2 y se cargan correctamente en el demonio antes de promocionar un checkpoint a producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye curvas de recompensa, tasas de éxito de la tarea ni métricas de sim-a-real.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,0 GB y la política es un ONNX de control, por lo que la huella esperada es muy reducida (inferior a la de cualquier LLM).
- GPU recomendadas: no disponible. El entrenamiento se realizó en una RTX 4090; la inferencia puede ejecutarse en CPU o en GPU de gama baja, pero no se documenta.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del artefacto, aunque no se especifica.
- Opciones de despliegue: runtime `microduck` / demonio `robotctl` con soporte ONNX; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles; el control opera a 50 Hz según la model card.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas microduck comparables ni métricas que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al ser una política entrenada en simulación, puede presentar sesgos hacia las condiciones del entorno mjlab (pendiente, fricción, distribuciones de observación del entrenamiento).
- Riesgo de alucinación: no aplica en el sentido de LLM, pero existe riesgo de comportamiento fuera de distribución ante observaciones no vistas en entrenamiento.
- Limitaciones de contexto o idioma: no aplica; la interfaz es un vector de 61 dimensiones, no texto.
- Restricciones de licencia: la licencia no está disponible, por lo que no puede confirmarse el uso comercial. Es imprescindible contactar con el autor antes de cualquier despliegue productivo.
- Reproducibilidad: el propio autor advierte que el entrenamiento no es bit-reproducible; los pesos publicados no se pueden regenerar exactamente.
- Madurez: repositorio con 0 descargas y 0 «likes», creado y actualizado el mismo día (2026-11-02), sin validación externa conocida.
- Alcance: es una política específica para una tarea (subida de colina de 1,5 m) y un robot concreto (microduck); no es transferible a otros cuerpos o tareas sin reentrenamiento.
- Selección del checkpoint: se publica la iteración 1000 de un máximo de 3000, sin documentar el criterio de selección ni métricas que lo respalden.

## Enlaces

- Hugging Face: https://huggingface.co/JackDH/microduck-hill-climb-20261102-best
- Repositorio de entrenamiento: https://github.com/JackDanHollister/microduck-challenges
- Proyecto microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del demonio (ruta citada en la model card; URL completa no disponible)
