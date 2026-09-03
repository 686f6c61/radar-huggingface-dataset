# EInnovator/pra-qwen3-8b-mlx-8bit

## Resumen

Este repositorio no contiene un modelo de lenguaje independiente, sino un paquete de runtime para Progressive Retrieval Attention (PRA) aplicado al modelo base `mlx-community/Qwen3-8B-8bit`. PRA es una técnica de atención que reduce el coste computacional en contextos largos mediante la recuperación progresiva de tokens relevantes, en lugar de procesar toda la secuencia por igual. El paquete incluye el mapeo estructural del modelo, perfiles de runtime, componentes aprendidos opcionales y metadatos de compatibilidad, pero no los pesos del modelo base.

El desarrollador, EInnovator, ha publicado este bundle con licencia Apache 2.0, dirigido a quienes trabajan con MLX en Apple Silicon y necesitan desplegar Qwen3-8B con atención de contexto largo de forma eficiente. La relevancia actual radica en que la atención estándar escala cuadráticamente con la longitud del contexto, y PRA ofrece una alternativa para mitigar ese coste. El paquete está diseñado para el motor MLX, con un perfil recomendado BALANCED y modo Selected Context, aunque la evidencia de rendimiento disponible es solo de humo (smoke test), no de calidad de tarea final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM |
| Parametros totales | 8B |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del modelo base Qwen3-8B) |
| Tipos de cuantizacion | 8bit (MLX) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (8bit), adaptador PRA |

## Arquitectura y entrenamiento

El modelo base es Qwen3-8B, un transformer causal con 8 mil millones de parametros, cuantizado a 8bit en formato MLX. Sobre esta base, el bundle PRA anade un mapeo estructural que identifica las capas elegibles para aplicar atencion con recuperacion progresiva. No se trata de un fine-tuning clasico tipo LoRA: el paquete incluye perfiles de runtime (QUALITY, BALANCED, ECONOMY) que definen como se enrutan los tokens durante la generacion, y un adaptador opcional que ajusta las proyecciones de atencion.

El entrenamiento del adaptador no esta documentado en la informacion disponible. El modelo base Qwen3-8B fue preentrenado y post-entrenado (el README indica "pretrained and post-trained"), pero no se especifican datos de entrenamiento, numero de tokens ni tecnicas de alineacion como RLHF o DPO. La innovacion principal del bundle es el mecanismo PRA en si, que permite seleccionar un subconjunto de tokens del contexto para cada paso de atencion, reduciendo el coste computacional en secuencias largas.

## Capacidades

- Generacion de texto autoregresiva con el modelo base Qwen3-8B (8B parametros).
- Atencion de contexto largo mediante recuperacion progresiva de tokens (PRA), con tres perfiles: QUALITY, BALANCED y ECONOMY.
- Modo Selected Context recomendado para el motor MLX; el modo Native Memory esta disponible pero sin calificar.
- Compatibilidad con el ecosistema MLX en Apple Silicon (M4 Pro validado).
- Soporte de tool calling, razonamiento y codigo: heredados del modelo base Qwen3-8B, no verificados en este bundle.
- Capacidades multilingues: no disponibles en la informacion del bundle.

## Casos de uso

- Procesamiento de documentos largos en Apple Silicon: el bundle permite cargar Qwen3-8B en 8bit con PRA para resumir o extraer informacion de documentos extensos sin agotar la memoria unificada, gracias a la seleccion progresiva de tokens relevantes.
- Asistentes de codigo con contexto amplio: al reducir el coste de atencion, se pueden mantener ventanas de contexto mayores para incluir multiples archivos de un proyecto, algo util en entornos de desarrollo locales con Mac.
- Investigacion en eficiencia de atencion: el paquete sirve como referencia para estudiar el impacto de PRA en modelos de 8B, comparando perfiles y modos de ejecucion.
- Despliegue en entornos con memoria limitada: la cuantizacion 8bit y el perfil ECONOMY (aunque no calificado) apuntan a reducir el consumo de VRAM en equipos de gama media.
- Evaluacion de calidad de contexto largo: las herramientas `pra evaluate` y `pra recommend` permiten medir el rendimiento en datasets como Qasper, util para decidir si PRA es adecuado para una tarea concreta.
- Servicio local de inferencia: `pra serve` levanta un servidor con el perfil BALANCED, pensado para integrar el modelo en aplicaciones que requieran generacion con contexto largo en Mac.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El README indica explicitamente que no hay "paired end-task headline" para esta identidad exacta (modelo, revision, cuantizacion, motor, perfil y modo de ejecucion). Los unicos datos medidos son de un smoke test de runtime:

| Metrica | Valor |
|---|---|
| Hardware | Apple M4 Pro, 48 GB |
| Tiempo de carga | 279,2 s |
| Tiempo de generacion (una pasada) | 1,33 s |
| Memoria pico (modelo + runtime) | 8,15 GiB |
| Estado | RUNTIME_SMOKE_VALIDATED |

Metricas como TTFT, ITL, throughput sostenido y calidad de tarea final permanecen como NOT_MEASURED.

## Requisitos de hardware

- VRAM estimada: 8,15 GiB de memoria pico medida en el smoke test con Apple M4 Pro (48 GB unificados).
- GPU recomendadas: Apple Silicon con MLX (M4 Pro validado; M1/M2/M3 probablemente compatibles pero sin evidencia).
- No cabe en GPU consumer de NVIDIA de forma nativa: el bundle esta disenado para el motor MLX, no para CUDA.
- Opciones de despliegue: motor MLX con `pra serve`; el motor HuggingFace (hf) esta marcado como portable pero no medido.
- Latencia y throughput: no medidos para esta identidad exacta; solo se conoce el tiempo de generacion del smoke test (1,33 s para una generacion acotada).

## Comparativa con modelos similares

No disponible. Este bundle es un adaptador de runtime sobre Qwen3-8B, no un modelo autonomo, y no se proporcionan comparativas con otras implementaciones de atencion de contexto largo (como YaRN, NTK-aware scaling o LongRoPE). La comparacion natural seria contra Qwen3-8B sin PRA, pero no se han publicado mediciones pareadas.

## Limitaciones y advertencias

- No hay evidencia de calidad de tarea final: el bundle solo ha pasado un smoke test de runtime; no se han medido benchmarks de lenguaje, razonamiento ni generacion.
- No incluye router aprendido: el enrutamiento se basa en coseno generico, no en un componente entrenado para esta cuantizacion exacta.
- La transferencia del adaptador desde otra cuantizacion esta deshabilitada intencionalmente: el bundle solo es valido para la identidad exacta (8bit MLX, revision `48a0b75b1ae72503e21e1558d040bc227510ff06`).
- Los perfiles QUALITY y ECONOMY no estan calificados: solo BALANCED tiene estado QUALIFIED.
- El modo Native Memory esta disponible pero sin calificar; no se recomienda su uso en produccion sin evaluacion previa.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3-8B tiene su propia licencia (Qwen Research License) que debe verificarse por separado.
- Riesgo de alucinacion y sesgos: no evaluados en este bundle; se heredan del modelo base sin verificacion adicional.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/EInnovator/pra-qwen3-8b-mlx-8bit
- Modelo base: https://huggingface.co/mlx-community/Qwen3-8B-8bit
- Documentacion de la libreria PRA: no disponible en la informacion proporcionada
- Paper o blog de Progressive Retrieval Attention: no disponible en la informacion proporcionada
