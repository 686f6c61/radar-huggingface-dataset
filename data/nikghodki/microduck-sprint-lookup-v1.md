# nikghodki/microduck-sprint-lookup-v1

## Resumen

microduck-sprint-lookup-v1 es una política de control para el robot cuadrúpedo de código abierto MicroDuck de Pollen Robotics, publicada por el usuario nikghodki. No es un modelo de lenguaje ni un modelo generativo de propósito general: es una política de locomoción orientada a una tarea muy concreta, la prueba de sprint de 2 metros en la Microduck Arena, y funciona exclusivamente en simulación. El repositorio tiene un tamaño de 0.0 GB, lo que indica un artefacto muy ligero (una red MLP más una tabla de búsqueda), y se distribuye bajo licencia Apache 2.0.

Técnicamente, el modelo combina una MLP de marcha con un mecanismo de *lookup* de observaciones: en las cinco semillas de inicio oficiales del evento reproduce secuencias de consignas articulares optimizadas con CMA-ES contra el propio *runner* de la Arena, mientras que en cualquier otro estado inicial actúa la red neuronal. La observación es de 61 dimensiones, la acción de 14 dimensiones y la frecuencia de control de 50 Hz. El normalizador de observaciones está embebido en `policy.onnx`, de modo que se alimenta con observaciones en crudo.

Su relevancia es acotada pero clara para quien trabaje en robótica de locomoción y en *benchmarking* de políticas: documenta de forma explícita una puntuación de 0.818 s (5/5 semillas, 0.20 m/s) y advierte que esos tiempos son *in-sample* sobre las cinco semillas, no una afirmación de locomoción general. Es, por tanto, un artefacto de competición reproducible más que un componente para producción física.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MLP de marcha con *lookup* de observaciones (política de control) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2 del manifiesto de políticas microduck) |

Especificaciones adicionales de la interfaz:

| Parámetro | Valor |
|---|---|
| Dimensión de observación | 61 |
| Dimensión de acción | 14 |
| Frecuencia de control | 50 Hz |
| Normalizador de observaciones | embebido en `policy.onnx` (entrada en crudo) |
| Tarea | sprint de 2 m en Microduck Arena |
| Entorno | solo simulación |

## Arquitectura y entrenamiento

La política es una MLP que genera consignas articulares a partir de observaciones de 61 dimensiones y produce 14 acciones a 50 Hz. Sobre esa base se superpone un mecanismo de *lookup*: para las cinco semillas de inicio oficiales del evento, el modelo no ejecuta la red sino que reproduce secuencias de objetivos articulares previamente buscadas mediante CMA-ES contra el *runner* propio de la Arena. Para cualquier otro estado inicial, actúa la red. El normalizador de observaciones está integrado en el grafo ONNX, de forma que el consumidor debe pasar observaciones sin normalizar.

No se dispone de información sobre el número de tokens, la composición del dataset ni sobre etapas de RLHF o DPO, que no aplican a este tipo de artefacto. La innovación técnica destacable es precisamente el híbrido búsqueda-ejecución: la optimización evolutiva (CMA-ES) se usa para explotar las condiciones iniciales conocidas del *benchmark*, y la red cubre el resto de casos. El autor advierte explícitamente que la puntuación reportada es *in-sample* sobre esas cinco semillas y que el *lookup* ignora la velocidad comandada.

## Capacidades

- Generación de consignas articulares de locomoción para el MicroDuck (14 acciones) a partir de observaciones de 61 dimensiones a 50 Hz.
- Reproducción determinista de secuencias de sprint optimizadas en las cinco semillas de inicio oficiales de la Microduck Arena.
- Control mediante red neuronal en estados iniciales distintos de los cinco oficiales.
- Integración directa en el *runner* de la Arena mediante `manifest.json` conforme al esquema 2 del manifiesto de políticas microduck.
- Ingesta de observaciones en crudo gracias al normalizador embebido en el ONNX.
- No soporta *tool calling*, razonamiento multi-paso, capacidades multilingües, visión ni audio: no es un modelo de lenguaje.

## Casos de uso

- Evaluación reproducible de políticas en la Microduck Arena: cargar el modelo en el *runner* oficial permite obtener la puntuación de 0.818 s sobre las cinco semillas y comparar contra otras políticas bajo las mismas condiciones.
- Línea base para *benchmarking* de locomoción: sirve como referencia de sprint de 2 m frente a políticas puramente neuronales o puramente evolutivas, al separar explícitamente el rendimiento *in-sample* del general.
- Estudio de optimización CMA-ES aplicada a control: las secuencias de objetivos articulares buscadas son material de análisis para investigar qué trayectorias explotan el simulador y por qué quedan fuera de lo físicamente viable.
- Pruebas de integración del *pipeline* `robotics` con ONNX: el artefacto, muy ligero, permite validar el cargado de `policy.onnx` y del manifiesto en herramientas compatibles sin coste de infraestructura.
- Docencia y divulgación sobre híbridos búsqueda-red: el caso ilustra con datos concretos (5/5 semillas, 0.20 m/s, 0.818 s) la diferencia entre sobreajuste a condiciones iniciales y generalización.
- Referencia negativa de seguridad para transferencia sim-a-real: el propio autor lo señala como ejemplo de política que no debe cargarse en hardware físico, útil para documentar criterios de descarte antes de un despliegue real.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son los de la Microduck Arena:

| Métrica | Resultado |
|---|---|
| Tarea | sprint de 2 m, Microduck Arena |
| Puntuación | 0.818 s |
| Semillas superadas | 5/5 (oficiales) |
| Velocidad | 0.20 m/s (el *lookup* ignora la velocidad comandada) |
| Régimen de los tiempos | *in-sample* sobre las cinco semillas |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, y no aplican a este tipo de artefacto.

## Requisitos de hardware

- VRAM estimada: no disponible; el repositorio ocupa 0.0 GB, por lo que el artefacto es de tamaño despreciable y cabe en cualquier GPU, e incluso en CPU.
- GPU recomendadas: no se especifican; por el tamaño del artefacto, cualquier GPU consumer es suficiente y no se requiere A100 ni H100.
- GPU consumer: sí, cabe en cualquier modelo actual e incluso en hardware de gama baja, dado el tamaño del repositorio.
- Opciones de despliegue: ejecución vía ONNX Runtime dentro del *runner* de la Microduck Arena; la librería declarada es `microduck`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican.
- Latencia y throughput: no disponibles. El control opera a 50 Hz, pero no se publican medidas de latencia por inferencia.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas de locomoción para el MicroDuck ni resultados de modelos comparables en la Microduck Arena, por lo que no es posible establecer una comparación con datos verificables.

## Limitaciones y advertencias

- Solo simulación: el autor prohíbe explícitamente cargar el modelo en un MicroDuck físico, porque las acciones buscadas quedan muy fuera de lo que un servo real debería ejecutar.
- Los tiempos reportados son *in-sample* sobre las cinco semillas oficiales; no constituyen una afirmación de locomoción general.
- El *lookup* ignora la velocidad comandada, de modo que el comportamiento no responde a consignas de velocidad en esas semillas.
- Fuera de las cinco semillas oficiales el comportamiento depende de la red, sin métricas publicadas de rendimiento en esos casos.
- Riesgo de sobreajuste al *runner* concreto de la Arena: la búsqueda CMA-ES se realizó contra ese simulador, por lo que la transferencia a otro entorno no está caracterizada.
- Sin datos de sesgos, alucinación o cobertura idiomática: no aplican a una política de control, y no se han publicado análisis de robustez frente a perturbaciones.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución; deben conservarse `LICENSE` y `NOTICE`.
- Descargas muy bajas (27) y ningún *like* en el momento de la consulta: ecosistema de validación prácticamente inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nikghodki/microduck-sprint-lookup-v1
- Microduck Arena (Space): https://huggingface.co/spaces/pollen-robotics/microduck-arena
- Repositorio microduck de Pollen Robotics: https://github.com/pollen-robotics/microduck
