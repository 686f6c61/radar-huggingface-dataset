# arbora-anon/arbora-qwen3-8b-online-expert

## Resumen

Arbora Qwen3-8B Online Expert es un conjunto de pesos complementarios para un sistema de decodificación especulativa construido sobre el modelo Qwen/Qwen3-8B. No se trata de un modelo de lenguaje autónomo, sino de un "experto" adicional (y, en una de las variantes, también un selector de rutas o path scorer) entrenado en línea sobre el flujo de peticiones de una tarea de ingeniería de software (SWE). Lo publica el autor anónimo arbora-anon como parte del material de código del artículo "Arbora: Unleashing the Parallelism of Block Diffusion Drafters in Speculative Decoding", actualmente en revisión anónima.

El modelo base es Qwen3-8B, un transformer denso de 8 mil millones de parámetros desarrollado por Alibaba Qwen. Sobre él, Arbora añade un mecanismo de borradores (drafters) basados en difusión por bloques que permiten proponer varios tokens en paralelo y validarlos después con el modelo objetivo, acelerando la generación sin alterar la distribución de salida. Este repositorio contiene únicamente los artefactos del experto añadido durante el entrenamiento en línea, no los pesos completos del modelo base ni del drafter.

Su relevancia es acotada pero específica: documenta una receta de aprendizaje en línea para adaptar el subsistema de decodificación especulativa a un dominio concreto (peticiones SWE) sin reentrenar el modelo objetivo. El tamaño del repositorio (0,5 GB) y la ausencia de pipeline declarado confirman que se distribuye como material de investigación reproducible, no como modelo listo para usar directamente en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-8B) con drafter de difusión por bloques para decodificación especulativa; el repositorio contiene pesos de un experto adicional y un path scorer |
| Parámetros totales | No disponible (el modelo base Qwen3-8B tiene 8 mil millones; el experto añadido no declara su tamaño) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada del modelo base Qwen3-8B, no especificada aquí) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`experts.safetensors`, `selector.safetensors`) |

## Arquitectura y entrenamiento

El sistema Arbora se apoya en Qwen3-8B como modelo objetivo y añade un drafter de difusión por bloques que genera propuestas de tokens en paralelo, junto con un conjunto de expertos y un selector de rutas (path scorer) que deciden qué trayectoria de borrador aceptar. La innovación principal del artículo es explotar el paralelismo de los drafters de difusión por bloques dentro de la decodificación especulativa, validando posteriormente las propuestas con el modelo objetivo para preservar la distribución exacta de salida.

Este repositorio concreto recoge el resultado de dos ejecuciones de aprendizaje en línea sobre el flujo de peticiones SWE. En la variante `new-expert-and-path-scorer` se entrena conjuntamente un experto nuevo y el path scorer; en la variante `new-expert` solo se entrena el experto, manteniendo congelados el drafter y el resto de expertos, y reutilizando el path scorer original (`arbora-qwen3-8b-path-scorer`). Los datos de entrenamiento son respuestas del propio modelo objetivo a una colección de prompts no publicada; el código liberado describe la receta y los scripts para reconstruir los datos a partir de cualquier fichero de prompts. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO.

## Capacidades

- Aceleración de la inferencia de Qwen3-8B mediante decodificación especulativa con drafters de difusión por bloques.
- Adaptación en línea del subsistema de borradores a un dominio específico (peticiones de ingeniería de software).
- Selección de trayectorias de borrador mediante un path scorer entrenable.
- Dos configuraciones de entrenamiento: experto + path scorer, o experto aislado con el resto congelado.
- No es un modelo generativo autónomo: no se invoca directamente para chat, código o razonamiento, sino como componente del stack de servicio `qwen3-8b-online`.
- Soporte de tool calling, agentes, visión, audio o modo thinking: no disponible en la información proporcionada (depende del modelo base, no documentado aquí).
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Investigación en decodificación especulativa: reproducir los experimentos del artículo Arbora cargando estos pesos sobre `arbora-qwen3-8b-drafter` y `arbora-qwen3-8b-experts` en el stack `eval/online/`, para medir ganancias de throughput frente a decodificación autoregresiva estándar.
- Adaptación de dominio de un drafter: usar la receta y los scripts liberados para reconstruir datos de entrenamiento a partir de un fichero de prompts propio y entrenar un experto especializado en el vocabulario y los patrones de un dominio concreto (por ejemplo, consultas de soporte o código interno).
- Servicio de inferencia de Qwen3-8B con latencia reducida: desplegar el conjunto drafter + expertos + path scorer sobre el modelo objetivo para atender cargas interactivas donde la latencia por token es crítica, siempre que se valide la preservación de la distribución de salida.
- Estudio comparativo de estrategias de aprendizaje en línea: contrastar las dos variantes publicadas (experto + path scorer frente a experto aislado) para evaluar el coste y el beneficio de entrenar también el selector de rutas.
- Base para experimentos de decodificación especulativa en otras tareas: sustituir el flujo SWE por otro conjunto de prompts y reentrenar el experto siguiendo la receta, manteniendo el drafter y el modelo objetivo intactos.
- Docencia y formación técnica: ilustrar con un caso real y reproducible cómo se acopla un subsistema de borradores a un transformer denso de 8B y qué artefactos intermedios se generan en cada fase del entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repositorio contiene solo los pesos del experto y del path scorer (0,5 GB en total); para ejecutarlo se necesita además cargar el modelo objetivo Qwen3-8B, el drafter y el resto de expertos.
- VRAM estimada para el conjunto completo: no disponible en la información proporcionada; depende de la cuantización elegida para Qwen3-8B (referencia orientativa: un modelo denso de 8B en FP16 requiere en torno a 16 GB solo para pesos, más caché KV y overhead del stack de servicio).
- GPU recomendadas: no especificadas por el autor. Por el tamaño del modelo base, son razonables GPU de centro de datos (A100, H100) para FP16/BF16, y GPU de consumo de gama alta (RTX 4090, 24 GB) para cuantizaciones de 8 bits o inferiores.
- Compatibilidad con GPU de consumo: probable con cuantización, pero no confirmada en la documentación disponible.
- Opciones de despliegue: el autor indica el stack propio `qwen3-8b-online` con el directorio `eval/online/`; no se mencionan vLLM, llama.cpp, Ollama ni TGI, y la naturaleza del drafter de difusión por bloques hace improbable su uso directo en esos motores sin adaptación.
- Latencia y throughput: no disponibles; el objetivo declarado del sistema es precisamente reducir la latencia frente a la decodificación autoregresiva, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Arbora Qwen3-8B Online Expert | No disponible (base de 8B) | No disponible | Decodificación especulativa con drafter de difusión por bloques + expertos | Apache 2.0 | Hugging Face (repo de investigación) |
| Qwen/Qwen3-8B | 8B | No disponible en esta ficha | Transformer denso generativo | Apache 2.0 | Hugging Face |
| Drafters especulativos convencionales (p. ej., EAGLE, Medusa) | No disponible | No disponible | Borradores autoregresivos o cabezas de predicción | Varía según implementación | Repositorios de investigación |

La comparación directa con otros sistemas de decodificación especulativa no es posible con los datos disponibles: no se publican métricas de aceptación de tokens, speedup ni tasas de acierto del path scorer en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: cargarlo sin el modelo base, el drafter y el resto de expertos no produce un sistema funcional.
- Los datos de entrenamiento originales no se publican; solo se libera la receta para reconstruirlos, lo que impide auditar la composición exacta del conjunto usado en los resultados del artículo.
- El entrenamiento se realizó sobre respuestas del propio modelo objetivo a un flujo de peticiones SWE, lo que puede introducir sesgos de dominio y sobreajuste a ese tipo de consultas.
- Al ser un artefacto de un artículo en revisión anónima, la API, los nombres de fichero y el stack de servicio pueden cambiar sin previo aviso.
- No hay información sobre sesgos, tasas de alucinación ni comportamiento multilingüe del sistema completo.
- La licencia Apache 2.0 permite uso comercial, pero debe revisarse el fichero `NOTICE` por avisos de terceros y la licencia del modelo base Qwen3-8B.
- Cero descargas y cero likes en el momento de la consulta: no existe validación comunitaria ni soporte documentado más allá del README.
- El repositorio no declara pipeline ni idiomas, lo que complica su integración automática en plataformas de despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/arbora-anon/arbora-qwen3-8b-online-expert
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Código e instrucciones del artículo (revisión anónima): https://anonymous.4open.science/r/arbora-7ABE
- Referencias cruzadas mencionadas en el README (sin URL directa en la información disponible): `arbora-qwen3-8b-drafter`, `arbora-qwen3-8b-experts`, `arbora-qwen3-8b-path-scorer`
