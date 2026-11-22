# GinDuck/microduck-tug-norris-p10c

## Resumen

Tug Norris es una política de control por refuerzo (reinforcement learning) para el robot cuadrúpedo microduck de Pollen Robotics, publicada por el usuario GinDuck en Hugging Face. No es un modelo de lenguaje: es un controlador neuronal que recibe una observación de 61 dimensiones y emite 14 acciones a 50 Hz, empaquetado en formato ONNX con el normalizador de observaciones integrado. Se trata de un fine-tune del modelo SSH111111/microduck-tug-p10, al que GinDuck añadió una tabla de rating propia y una búsqueda de tipo hill-climbing sobre secuencias de otros autores.

El modelo se enmarca en el ecosistema microduck, un robot de bajo coste orientado a competiciones y experimentación educativa, y su nombre hace referencia a una competición ("cup #3", en la que quedó subcampeón). Es una política "perpetua": una vez cargada en una ranura de política del robot, ejecuta la marcha indefinidamente hasta que se le indique lo contrario.

Su relevancia es acotada pero concreta: sirve como ejemplo reproducible de cómo se distribuye y despliega una política RL entrenada para un robot real, con un manifiesto de política versionado y un artefacto ONNX listo para cargar en el daemon del robot mediante `robotctl`. La información pública disponible es muy escasa: no hay datos de arquitectura de red, número de parámetros, benchmarks ni licencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (política neuronal de reinforcement learning; red no documentada) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; observación de 61 dimensiones por paso) |
| Tipos de cuantización | no disponible (artefacto distribuido en ONNX) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) más `manifest.json` con esquema 2 del manifiesto de políticas microduck |

Datos adicionales relevantes:

| Parámetro | Valor |
|---|---|
| Tipo de política | perpetua (ejecuta la marcha hasta recibir orden de parada) |
| Frecuencia de control | 50 Hz |
| Dimensión de observación | 61 |
| Dimensión de acción | 14 |
| Normalizador de observaciones | integrado en `policy.onnx` (se alimenta con observaciones crudas) |
| Modelo base | SSH111111/microduck-tug-p10 (fine-tune) |
| Repositorio de entrenamiento | `pollen-robotics/microduck_rl`, rama `talent-3`, commit `debcfcae0` |
| Tamaño del repositorio | 0.0 GB (según metadatos de Hugging Face) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura de la red neuronal (número de capas, tipo de capas, tamaño de las mismas ni función de activación). Lo que sí se documenta es el pipeline de entrenamiento: el modelo se entrena con el repositorio `pollen-robotics/microduck_rl`, en la rama `talent-3` y el commit `debcfcae0`, mediante aprendizaje por refuerzo para producir una política de locomoción sobre el robot microduck.

El proceso de creación de esta variante concreta combina dos aportaciones: la red base de SSH111111 (`microduck-tug-p10`), que aporta la política de marcha original, y una tabla de rating construida por GinDuck a partir de secuencias de jrubiosainz y suraj-phanindra, sobre la que se aplicó hill-climbing con las semillas 4 y 5. El resultado es un fine-tune que conserva la estructura de observación-acción del modelo base (61 dimensiones de observación, 14 acciones) y se distribuye como artefacto ONNX con el normalizador de observaciones embebido, de modo que el consumidor puede alimentar observaciones crudas sin preprocesado adicional. No se especifican el número de tokens, la composición del dataset ni si hubo etapas de RLHF o DPO, que en este contexto no aplican.

## Capacidades

- Locomoción del robot microduck: genera comandos de acción continua a 50 Hz para el control del cuadrúpedo.
- Política perpetua: mantiene la marcha de forma indefinida hasta que se le indique lo contrario, sin horizonte de episodio fijo.
- Consumo de observaciones crudas: el normalizador está integrado en el ONNX, por lo que no requiere pipeline de preprocesado externo.
- Despliegue mediante el daemon del robot: se carga en una ranura de política con `robotctl policy load <slot> GinDuck/microduck-tug-norris-p10c`.
- Compatibilidad con el manifiesto de políticas microduck en su esquema 2.
- No soporta tool calling, agentes, razonamiento multi-paso, multilingüismo, visión ni audio: no es un modelo generativo de propósito general.

## Casos de uso

- Competiciones de robots microduck: la política está diseñada y ajustada para pruebas de marcha tipo "cup", por lo que puede cargarse directamente en el robot para competir o reproducir resultados de la cup #3.
- Reproducción de experimentos de RL: al estar vinculada a un commit concreto del repositorio de entrenamiento, permite reproducir el pipeline y comparar variantes de políticas sobre la misma base.
- Docencia y divulgación en robótica: sirve como ejemplo completo de extremo a extremo (entrenamiento, empaquetado ONNX, manifiesto y despliegue en hardware real) para cursos de aprendizaje por refuerzo.
- Pruebas de integración del daemon: útil para validar el flujo `robotctl policy load` y la compatibilidad con el esquema 2 del manifiesto de políticas.
- Benchmarking interno de políticas de locomoción: la tabla de rating y el hill-climbing documentados permiten usar esta política como referencia frente a otras variantes de la familia microduck.
- Demostraciones y ferias: al ser una política perpetua de bajo coste computacional (inferencia ONNX en el propio robot), es adecuada para exhibiciones continuadas sin intervención.
- Base para nuevos fine-tunes: al derivar de `SSH111111/microduck-tug-p10`, puede servir de punto de partida para ajustes posteriores con otras tablas de rating o semillas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente menciona el resultado cualitativo de la cup #3 (subcampeón), sin métricas numéricas de recompensa, velocidad, estabilidad ni comparaciones cuantitativas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser una política de control de pequeño tamaño (observación de 61 dimensiones, 14 acciones) y distribuirse en ONNX, es previsible que la inferencia sea muy ligera, pero no se publica el número de parámetros ni el coste computacional.
- GPU recomendadas: no disponible. El diseño del ecosistema microduck apunta a ejecución en el propio robot o en hardware de bajo consumo, pero no se documenta.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el daemon del robot microduck mediante `robotctl policy load`; el artefacto es un `policy.onnx` que puede ejecutarse con cualquier runtime ONNX compatible.
- Latencia y throughput: no disponibles; el único dato es la frecuencia de control de 50 Hz (periodo de 20 ms por paso).

## Comparativa con modelos similares

| Modelo | Tipo | Observación / acción | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GinDuck/microduck-tug-norris-p10c | Política RL fine-tune | 61 / 14 | 50 Hz | no disponible | Hugging Face |
| SSH111111/microduck-tug-p10 | Política RL base | 61 / 14 (según modelo base) | 50 Hz (según ecosistema) | no disponible | Hugging Face |
| Otras políticas de la familia microduck | Políticas RL | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas políticas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni un modelo generativo: no debe evaluarse con métricas tipo MMLU, HumanEval o GSM8K.
- Específico de hardware: solo tiene sentido sobre el robot microduck; no es transferible a otras plataformas sin reentrenamiento.
- Licencia no disponible: no puede asumirse permiso de uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Idiomas no disponibles: no aplica, pero los metadatos de Hugging Face no documentan restricciones de uso por región o finalidad.
- Trazabilidad limitada: se referencia un commit concreto (`debcfcae0`) de una rama (`talent-3`), lo que puede dificultar la reproducción si la rama cambia o desaparece.
- Sin métricas publicadas: no hay evidencia cuantitativa de robustez, estabilidad o generalización de la marcha más allá del resultado cualitativo en la cup #3.
- Dependencia del modelo base: los créditos de la política original corresponden a SSH111111; los cambios de GinDuck se limitan a la tabla de rating y al hill-climbing sobre semillas 4 y 5.
- Tamaño de repositorio reportado como 0.0 GB: puede indicar un artefacto muy pequeño o un problema de metadatos; conviene verificar los archivos antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GinDuck/microduck-tug-norris-p10c
- Modelo base: https://huggingface.co/SSH111111/microduck-tug-p10
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Aplicación QuackPack (seguimiento de carreras y cups): https://www.imundo.ch/quackpack/
- Repositorio de entrenamiento: `pollen-robotics/microduck_rl` (rama `talent-3`, commit `debcfcae0`; sin URL directa en la información disponible)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (sin URL directa en la información disponible)
