# mbeukman/Kinetix-Checkpoints

## Resumen

Kinetix-Checkpoints es un repositorio de pesos de agentes de aprendizaje por refuerzo (RL) entrenados para Kinetix, un entorno de control físico 2D escrito en JAX y orientado a la investigación en agentes generalistas. Lo publica Michael Beukman (usuario `mbeukman`) y contiene dos checkpoints de la misma red: `sfl-paper`, el agente generalista del artículo original de Kinetix, y `sfl-1m-envs`, una versión entrenada a una escala mucho mayor (1 048 576 entornos paralelos frente a 2 048). No se trata de un modelo de lenguaje: es una política de RL con arquitectura transformer de 786 000 parámetros que consume observaciones basadas en entidades y emite acciones multi-discretas.

Su relevancia es doble. Por un lado, ofrece puntos de partida preentrenados para quien quiera evaluar o extender Kinetix sin asumir el coste de entrenamiento. Por otro, documenta empíricamente el efecto del escalado masivo de entornos paralelos en PPO: el checkpoint de 1M de entornos alcanza una tasa media de resolución de 0,33 en el conjunto de 74 niveles diseñados a mano, frente a 0,22 del checkpoint del artículo, con 376 000 millones de pasos de entorno acumulados.

El repositorio ocupa 0,0 GB, no tiene descargas ni "likes" registrados y se distribuye bajo licencia MIT, con pesos en `safetensors` y configuración en JSON.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (arquitectura descrita en el artículo de Kinetix), con observaciones de entidades y acciones multi-discretas |
| Parámetros totales | 786 000 (786k) |
| Longitud de contexto | No aplicable: no es un modelo de lenguaje; procesa observaciones por paso de entorno |
| Tipos de cuantización | No disponible. Los pesos se distribuyen en `safetensors`; no se documentan versiones cuantizadas |
| Idiomas soportados | No aplicable: no procesa lenguaje natural |
| Licencia | MIT |
| Formato de pesos | `safetensors` (`params.safetensors`) más `config.json`; requiere el ecosistema JAX/Flax |
| Librería declarada | `jax` (Flax) |
| Pipeline en HuggingFace | `reinforcement-learning` |
| Número de checkpoints | 2 (`sfl-paper` y `sfl-1m-envs`) |
| Entornos (versión `sfl-paper`) | Entrenado en niveles aleatorios de tamaño L, 2 048 entornos paralelos, 18 000 millones de pasos de entorno |
| Entornos (versión `sfl-1m-envs`) | Entrenado en niveles aleatorios de tamaño M, 1 048 576 entornos paralelos, 376 000 millones de pasos de entorno |
| Tamaño del repositorio | 0,0 GB |
| Idiomas del repositorio y de la model card | Inglés |

## Arquitectura y entrenamiento

La red es un transformer de 786 000 parámetros que opera sobre observaciones basadas en entidades (entity observations) y produce acciones multi-discretas. La arquitectura proviene del artículo de Kinetix (Matthews et al., ICLR 2025), un entorno de control físico 2D procedural escrito en JAX, diseñado para estudiar el entrenamiento de agentes generalistas mediante tareas de control abierto. Ambos checkpoints se entrenaron con SFL (Matthews et al., arXiv:2408.15099) sobre niveles generados proceduralmente, no sobre niveles fijos.

La diferencia entre los dos checkpoints es la escala y la técnica de escalado. `sfl-paper` reproduce el agente generalista del artículo, con 2 048 entornos paralelos y 18 000 millones de pasos. `sfl-1m-envs` mantiene la misma arquitectura pero se entrena con 1 048 576 entornos paralelos y 376 000 millones de pasos, siguiendo las conclusiones del trabajo "Preventing Learning Stagnation in PPO by Scaling to 1 Million Parallel Environments" (Beukman et al., RLC 2026). El autor indica explícitamente que este segundo checkpoint no procede del artículo original, sino que se entrenó aplicando los hallazgos de ese trabajo posterior. No se documentan en la información disponible detalles sobre el dataset de niveles, el uso de RLHF/DPO (no aplicable en RL) ni innovaciones adicionales de decodificación.

El checkpoint `sfl-paper` activa la opción `legacy_entity_id: true`, que reproduce una peculiaridad del código con el que fue entrenado; esta opción se aplica automáticamente al cargar su `config.json`.

## Capacidades

- Control motor en un entorno físico 2D: la política emite acciones multi-discretas para resolver niveles de Kinetix.
- Generalización a niveles procedurales: ambos checkpoints se evaluaron en 512 niveles aleatorios por cada tamaño (S, M, L), además de 74 niveles diseñados a mano.
- Condicionamiento por observaciones de entidades: el modelo consume entidades del entorno en lugar de píxeles crudos.
- Transferencia a tamaños de nivel no vistos durante el entrenamiento: `sfl-paper` se entrenó en niveles L y `sfl-1m-envs` en niveles M, pero ambos se evalúan en S, M y L.
- Punto de partida para ajuste fino: al ser pesos de red en `safetensors` con `config.json`, se pueden cargar con la utilidad `load_pretrained_checkpoint` y reutilizar en configuraciones normalizadas de Kinetix.
- No dispone de tool calling, function calling, soporte de agentes basados en lenguaje, capacidades multilingües, visión, audio ni modo de razonamiento explícito. Son capacidades no aplicables a este tipo de modelo.

## Casos de uso

- Reproducción de resultados de investigación: el checkpoint `sfl-paper` permite reproducir las tasas de resolución publicadas en el artículo de Kinetix sin reentrenar, usando `examples/example_pretrained.py` sobre los 74 niveles diseñados a mano.
- Baseline para comparar nuevos algoritmos de RL: `sfl-1m-envs` fija una referencia medible (0,33 de resolución media en niveles diseñados a mano) contra la que evaluar variantes de PPO, SFL u otros optimizadores bajo el mismo protocolo de evaluación.
- Estudio del escalado de entornos paralelos: la pareja de checkpoints permite analizar empíricamente qué aporta pasar de 2 048 a 1 048 576 entornos paralelos con la misma arquitectura, aislando el efecto de la escala.
- Ajuste fino para dominios concretos: al ser una red pequeña (786k parámetros) con pesos cargables, sirve como inicialización para especializar la política en familias de niveles o variantes del entorno con presupuestos de cómputo reducidos.
- Docencia y formación en RL: el coste de inferencia es mínimo y el bucle de evaluación es directo, lo que permite usar el checkpoint en prácticas de laboratorio sobre políticas preentrenadas, evaluación por episodios y tasas de resolución.
- Evaluación de robustez y generalización: comparar las tasas en niveles aleatorios (0,38 en "all" para `sfl-1m-envs`) frente a las de niveles diseñados a mano (0,33) permite estudiar la brecha entre generalización procedural y niveles curados.
- Investigación sobre currículos y generación de niveles: el checkpoint puede usarse como evaluador fijo mientras se modifican los generadores procedurales, midiendo si los nuevos niveles son más o menos resolubles.
- Integración en pipelines de experimentación en JAX: al ser código JAX/Flax, el checkpoint se inserta en flujos de entrenamiento distribuido existentes sin conversiones de formato.

## Benchmarks y rendimiento

Los únicos datos de rendimiento disponibles son las tasas medias de resolución reportadas en la model card. La evaluación sobre niveles diseñados a mano usa 74 niveles con 20 intentos por nivel; la evaluación sobre niveles aleatorios usa 512 niveles por tamaño con 5 intentos por nivel. La columna "all" promedia todos los niveles.

| Checkpoint | Niveles de entrenamiento | Entornos paralelos | Pasos de entorno | Diseñados a mano (S / M / L / all) | Aleatorios (S / M / L / all) |
|---|---|---|---|---|---|
| `sfl-paper` | Aleatorios L | 2 048 | 18B | 0,42 / 0,32 / 0,11 / 0,22 | 0,33 / 0,24 / 0,16 / 0,24 |
| `sfl-1m-envs` | Aleatorios M | 1 048 576 | 376B | 0,70 / 0,43 / 0,18 / 0,33 | 0,56 / 0,36 / 0,22 / 0,38 |

No se han publicado en la información disponible resultados de benchmarks tipo MMLU, HumanEval o GSM8K, que no son aplicables a este modelo.

## Requisitos de hardware

- VRAM para inferencia: mínima. Con 786 000 parámetros, los pesos ocupan aproximadamente 3 MB en fp32 y alrededor de 1,6 MB en bf16, más el estado del entorno y de la red recurrente.
- GPU recomendadas: no se especifica ninguna. Dado el tamaño, cualquier GPU con soporte JAX (por ejemplo, cualquier RTX moderna o una T4) es sobrada; también es viable ejecutar en CPU.
- GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo, e incluso en CPU o dispositivos embebidos con JAX instalado.
- Opciones de despliegue: no hay soporte de vLLM, llama.cpp, Ollama ni TGI, porque no es un modelo de lenguaje ni se distribuye en GGUF. El despliegue se realiza mediante la librería `kinetix-env` y `huggingface_hub`, cargando `params.safetensors` con `load_pretrained_checkpoint` y construyendo la red con `make_network_from_config`.
- Requisitos de entrenamiento: no se documenta el hardware exacto. La configuración de `sfl-1m-envs` implica 1 048 576 entornos paralelos, lo que exige infraestructura distribuida de gran escala (aceleradores tipo TPU o clúster de GPU), pero la información disponible no especifica modelos ni cantidades.
- Latencia y throughput: no disponible. No se publican mediciones de latencia por paso ni de pasos por segundo para ninguno de los dos checkpoints.

## Comparativa con modelos similares

Comparativa interna entre los dos checkpoints distribuidos en este repositorio:

| Checkpoint | Parámetros | Entornos paralelos | Pasos de entorno | Resolución media (diseñados a mano, all) | Resolución media (aleatorios, all) | Licencia |
|---|---|---|---|---|---|---|
| `sfl-paper` | 786k | 2 048 | 18B | 0,22 | 0,24 | MIT |
| `sfl-1m-envs` | 786k | 1 048 576 | 376B | 0,33 | 0,38 | MIT |

No se dispone de datos verificables de checkpoints alternativos de la misma categoría (agentes generalistas para control físico 2D) en la información proporcionada, por lo que no se puede establecer una comparación con terceros. Además, las búsquedas web devuelven otros proyectos que comparten el nombre "Kinetix" pero son distintos: `git-kinetix/kinetix-puppeteer` (modelos de mundo jerárquicos) y `Physical-Intelligence/real-time-chunking-kinetix` (pipeline de action chunking en tiempo real). No deben confundirse con este repositorio ni usarse como términos de comparación.

## Limitaciones y advertencias

- No es un modelo de lenguaje. No genera texto, no responde a instrucciones en lenguaje natural y no admite prompts conversacionales; cualquier uso en ese sentido es un error de categoría.
- Tasas de resolución modestas. Incluso el mejor checkpoint resuelve solo el 33 % de los niveles diseñados a mano en promedio y el 18 % de los niveles de tamaño L; no es un agente que resuelva el entorno de forma fiable.
- Sesgo hacia el generador procedural. Ambos checkpoints se entrenaron exclusivamente con niveles generados por el generador de Kinetix; su comportamiento fuera de esa distribución no está caracterizado.
- Dependencia de la librería `kinetix-env`. El uso requiere versiones compatibles de la librería y de la configuración normalizada de Kinetix; cambios en el entorno pueden invalidar los pesos.
- Particularidad de compatibilidad: `sfl-paper` requiere `legacy_entity_id: true` para reproducir el comportamiento original. Se aplica automáticamente al usar su `config.json`, pero omitirlo si se carga manualmente altera los resultados.
- Idiomas: no aplicable, pero conviene señalar que la model card y la documentación están únicamente en inglés.
- Validación comunitaria nula: 0 descargas y 0 "likes" en el momento de la consulta, lo que implica ausencia de verificación independiente por parte de terceros.
- Licencia MIT: permite uso comercial, modificación y redistribución, con obligación de conservar el aviso de copyright y la licencia. No se imponen restricciones adicionales conocidas.
- Trazabilidad de versiones: la fecha de creación registrada (2026-09-24) y el identificador arXiv:2603.06009 corresponden a trabajos muy recientes; conviene verificar la correspondencia exacta entre checkpoints, configuraciones y versiones del código antes de usarlos en producción o en publicaciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mbeukman/Kinetix-Checkpoints
- Repositorio de Kinetix: https://github.com/FLAIROx/Kinetix
- Ejemplo de evaluación con checkpoint preentrenado: https://github.com/FLAIROx/Kinetix/blob/main/examples/example_pretrained.py
- Artículo de Kinetix (ICLR 2025): https://arxiv.org/abs/2410.23208
- Página del artículo de Kinetix en HuggingFace Papers: https://huggingface.co/papers/2410.23208
- Artículo de SFL: https://arxiv.org/abs/2408.15099
- Artículo sobre escalado a 1 millón de entornos paralelos en PPO: https://arxiv.org/abs/2603.06009
- Proyecto homónimo no relacionado (modelos de mundo jerárquicos): https://github.com/git-kinetix/kinetix-puppeteer
- Proyecto homónimo no relacionado (action chunking en tiempo real): https://deepwiki.com/Physical-Intelligence/real-time-chunking-kinetix/2.2-quick-start-guide
- Referencia no relacionada devuelta por la búsqueda (checkpoints de difusión en Civitai): https://civitai.com/tag/checkpoint
