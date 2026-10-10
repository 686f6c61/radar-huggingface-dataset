# anemll/jeff-ane-base-coreai

## Resumen

Jeff-ane-base-coreai es una conversión no oficial del modelo de decisiones Jeff v1.3 (`mstrasser/jeff-base`, a su vez un ajuste fino de Qwen3.5-0.8B) al formato Core AI de Apple, realizada por Anemll para ejecutarse íntegramente sobre el Neural Engine (ANE) de los chips Apple Silicon. No hay reentrenamiento: los pesos son los de Jeff, troceados en seis módulos `.aimodel` de 4 capas cada uno más una cabeza de lectura (*readout*) de 255 vías, con precisión FP16 y una ventana de contexto de 2048 tokens. El paquete completo ocupa unos 3,2 GB en el repositorio.

El modelo no es un generador de texto al uso. Su tarea es la clasificación zero-shot orientada a la decisión: se le envía una situación descrita en lenguaje natural junto con una lista de opciones nombradas, y una única pasada forward devuelve una probabilidad calibrada por opción. En un M5 Max, una decisión corta (una llamada de 256 filas) tarda aproximadamente 64-65 ms, lo que lo sitúa como un componente de decisión de baja latencia pensado para ejecutarse en local, sin GPU dedicada ni servicios en la nube.

Su relevancia ahora es doble. Por un lado, demuestra que es viable portar un modelo de decisión de ~0,8B parámetros al ANE manteniendo una fidelidad numérica alta frente a la referencia en PyTorch FP32. Por otro, sirve como base sobre la que se cargan adaptadores de tarea específicos (hay builds para Snake y Tetris) mediante el flag `--adapter`; el propio autor advierte de que, sin adaptador, el modelo rinde poco en tareas desconocidas con listas de opciones largas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder heredado de Qwen3.5-0.8B; detalle fino de capas/atención no disponible |
| Parametros totales | Aproximadamente 0,8 mil millones (hereda el tamaño de Qwen3.5-0.8B) |
| Parametros activos | No aplica (no se documenta una arquitectura MoE) |
| Longitud de contexto | 2048 tokens (manifiesto `p256_2k`) |
| Tipos de cuantizacion | FP16 (embeddings y pesos); no se documentan GGUF, INT8 ni INT4 |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 para los pesos; el código de conversión y demo de Anemll/jeff-ane es MIT |
| Formato de pesos | Paquetes Core AI `.aimodel` (seis chunks de 4 capas) + `manifest.json`, `model.safetensors` (checkpoint jeff-base v1.3 sin modificar) y embeddings FP16 |
| Tarea (pipeline) | `zero-shot-classification` |
| Cabeza de salida | Readout de 255 vías |
| Fecha de publicacion (segun HuggingFace) | 9 de octubre de 2026 |
| Tamano del repositorio | 3,2 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es una conversión, no un entrenamiento nuevo. Los pesos provienen de `mstrasser/jeff-base` (Jeff v1.3), un ajuste fino de Qwen3.5-0.8B de Alibaba Cloud, y se han exportado a Core AI en FP16 dentro de seis paquetes `.aimodel` de 4 capas cada uno, más la cabeza de lectura de 255 vías. Toda la red se ejecuta como `fully_ane` sobre el Neural Engine, y el paquete se distribuye ya exportado, no compilado: el usuario debe compilarlo con `forge.py compile` usando el SDK de Core AI. Los detalles de composición del dataset de Jeff v1.3 (número de tokens, mezcla de datos, si hubo RLHF/DPO) no se recogen en la información disponible.

La innovación técnica relevante no está en la arquitectura del modelo base, sino en la ruta de despliegue: la segmentación en chunks de 4 capas y la conversión a Core AI permiten que un modelo de decisión de ~0,8B corra en el ANE con una latencia de decenas de milisegundos y sin GPU. La fidelidad de la conversión está documentada: frente a PyTorch FP32 sobre prompts reales de Jeff, la divergencia KL es ≤ 8,3·10⁻⁴ y el argmax coincide en todos los casos salvo un empate muy ajustado a 2.018 tokens. El modelo está pensado para funcionar con adaptadores de tarea; sin ellos, el propio autor lo describe como débil en tareas no familiares con listas de opciones largas.

## Capacidades

- Clasificación zero-shot: acepta una situación textual y una lista de opciones nombradas, y devuelve una probabilidad por opción en una sola pasada forward.
- Salida probabilística calibrada: no genera texto libre, sino una distribución de probabilidad sobre las opciones, apta para umbrales y comparaciones directas.
- Decisión de baja latencia: alrededor de 64-65 ms por decisión corta en un M5 Max (una llamada de 256 filas), ejecutada íntegramente en el ANE.
- Soporte de adaptadores de tarea: se pueden cargar builds adicionales (Snake y Tetris ya publicados) junto al modelo base mediante el flag `--adapter`, sin recompilar el núcleo.
- Contexto de 2048 tokens: suficiente para descripciones de situación extensas más listas de opciones moderadas.
- Idiomas: únicamente inglés; no se documenta soporte multilingüe.
- Servidor local incluido: `forge.py jeff-serve` levanta un servicio en el puerto 8787 con un panel de routing accesible en `http://127.0.0.1:8787/`.
- No documentado: tool calling / function calling, capacidades de agente multi-paso, visión, audio y modo de razonamiento explícito no aparecen en la información proporcionada.

## Casos de uso

- Clasificación zero-shot en local: dado un texto y un conjunto cerrado de etiquetas (por ejemplo, categorías de incidencia), el modelo devuelve la probabilidad de cada etiqueta en una sola pasada de ~65 ms, lo que permite clasificar en tiempo real sin enviar datos a la nube.
- Enrutado de consultas en sistemas de agentes: el modelo actúa como árbitro que decide a qué herramienta, cola o subagente corresponde una petición, devolviendo probabilidades que el orquestador puede usar con umbrales de confianza.
- Decisión de política en entornos de juego o simulación: con los adaptadores Snake y Tetris cargados vía `--adapter`, el mismo núcleo decide la siguiente acción en función del estado, aprovechando la latencia de decenas de milisegundos para bucles de decisión ajustados.
- Moderación o triaje de contenido en dispositivo: clasificar si un texto pertenece a una categoría sensible o requiere revisión humana, con la ventaja de que el procesamiento no sale del equipo del usuario.
- Investigación sobre calibración de probabilidades: el modelo emite probabilidades sobre opciones, no texto, lo que lo hace útil para estudiar calibración, umbrales de decisión y comportamiento ante opciones fuera de distribución.
- Selección entre alternativas en pipelines de generación: ante varias respuestas candidatas producidas por otro modelo, Jeff puede puntuar cuál encaja mejor con la situación dada y servir como reranker ligero y local.
- Validación de despliegues Core AI sobre ANE: sirve como caso de referencia para medir fidelidad de conversión (KL ≤ 8,3·10⁻⁴ frente a PyTorch FP32) y latencia de un modelo de ~0,8B ejecutado enteramente en el Neural Engine.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos cuantitativos publicados corresponden a la fidelidad de la conversión y a la latencia:

| Metrica | Valor | Contexto |
|---|---|---|
| Divergencia KL frente a PyTorch FP32 | ≤ 8,3·10⁻⁴ | Prompts reales de Jeff |
| Coincidencia de argmax | Coincide en todos los casos salvo un empate ajustado a 2.018 tokens | Comparación con PyTorch FP32 |
| Latencia por decisión corta | ~64 ms (una llamada de 256 filas) | Apple M5 Max, macOS 27.2 |
| Latencia por decisión corta (cifra del autor en el encabezado) | ~65 ms | Apple M5 Max |

## Requisitos de hardware

- Plataforma objetivo: Apple Neural Engine en chips Apple Silicon; verificado en un M5 Max con macOS 27.2. No hay soporte documentado para GPU NVIDIA, AMD ni CPU x86.
- VRAM: no aplica en el sentido convencional, ya que el cómputo se ejecuta en el ANE; no se publica una cifra de memoria unificada necesaria. Los pesos se distribuyen en FP16 y el repositorio completo ocupa 3,2 GB.
- GPU recomendadas: no disponible; el modelo no está pensado para GPU. La ruta de referencia es exclusivamente el ANE.
- ¿Cabe en GPU de consumo? No aplica: requiere hardware Apple Silicon con Neural Engine y el SDK de Core AI.
- Software necesario: SDK de Core AI (`coreai-sdk`) para compilar con `forge.py compile`, y el repositorio `Anemll/jeff-ane` para el servidor (`forge.py jeff-serve`) y la descarga de pesos (`scripts/download_model.py base`).
- Opciones de despliegue: servidor local propio de Anemll en el puerto 8787. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia: ~64-65 ms por decisión corta en M5 Max. Throughput agregado (decisiones por segundo con batching o concurrencia): no disponible.
- Requisito de compilación: el paquete se distribuye exportado pero no compilado; hay que compilarlo antes de servirlo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato | Ejecucion |
|---|---|---|---|---|---|---|
| anemll/jeff-ane-base-coreai | ~0,8B | 2048 | Clasificación zero-shot / decisión | Apache-2.0 | Core AI `.aimodel` + safetensors | ANE (Apple Silicon) |
| mstrasser/jeff-base (Jeff v1.3) | ~0,8B | No disponible | Clasificación zero-shot / decisión | Apache-2.0 | safetensors | PyTorch / transformers |
| Qwen3.5-0.8B | 0,8B | No disponible | Modelo de lenguaje generativo | Apache-2.0 | safetensors | Genérica (GPU/CPU) |
| anemll/jeff-ane-snake-coreai | No disponible | No disponible | Decisión en Snake (adaptador) | Apache-2.0 | Core AI `.aimodel` | ANE (Apple Silicon) |
| anemll/jeff-ane-tetris-coreai | No disponible | No disponible | Decisión en Tetris (adaptador) | Apache-2.0 | Core AI `.aimodel` | ANE (Apple Silicon) |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada, por lo que la comparación se limita a tamaño, formato de despliegue, licencia y disponibilidad.

## Limitaciones y advertencias

- Rendimiento débil sin adaptador: el propio autor indica que Jeff v1.3 está pensado para usarse con adaptadores de tarea y que, por sí solo, rinde mal en tareas desconocidas con listas de opciones largas.
- Solo inglés: el modelo está etiquetado únicamente para `en`; no hay evidencia de comportamiento fiable en castellano u otros idiomas.
- Contexto limitado a 2048 tokens: situaciones muy largas o listas con cientos de opciones pueden truncarse o degradar la calidad de la distribución.
- No es un modelo generativo: no produce texto ni respuestas en lenguaje natural; solo puntuaciones por opción. No debe emplearse como chatbot.
- Riesgo de calibración fuera de distribución: aunque las probabilidades son calibradas para las tareas previstas, no se documenta su comportamiento ante entradas o etiquetas alejadas del dominio de entrenamiento, donde una probabilidad alta puede no ser fiable.
- Dependencia de hardware y software muy específicos: exige Apple Silicon con Neural Engine, el SDK de Core AI y macOS reciente. No hay ruta de despliegue en GPU NVIDIA/AMD, servidores Linux ni contenedores estándar.
- Sin validación externa: el repositorio registra 0 descargas y 0 likes, y los resultados publicados proceden del propio autor y de una única máquina (M5 Max, macOS 27.2), por lo que no hay verificación independiente.
- Paquete exportado pero no compilado: el flujo exige un paso de compilación previo con `forge.py compile`, lo que añade fricción y posibles fallos de compatibilidad con versiones del SDK.
- Licencia: los pesos son Apache-2.0, la misma que Qwen3.5-0.8B y jeff-base v1.3, por lo que el uso comercial está permitido; el código de conversión y demo de Anemll/jeff-ane es MIT y constituye software separado. Se debe conservar la atribución indicada en `NOTICE`.
- Conversión no oficial: no está afiliada ni respaldada por Alibaba Cloud ni por el autor de Jeff; la responsabilidad sobre la fidelidad de la conversión recae en Anemll.

## Enlaces

- HuggingFace (este modelo): https://huggingface.co/anemll/jeff-ane-base-coreai
- Modelo base Jeff v1.3: https://huggingface.co/mstrasser/jeff-base
- Modelo base original Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de conversión y runtime ANE: https://github.com/Anemll/jeff-ane
- Documento de resultados de la conversión: https://github.com/Anemll/jeff-ane/blob/main/docs/RESULTS.md
- Adaptador Snake: https://huggingface.co/anemll/jeff-ane-snake-coreai
- Adaptador Tetris: https://huggingface.co/anemll/jeff-ane-tetris-coreai
- Nota sobre la búsqueda web: las consultas realizadas no devolvieron resultados relevantes sobre este modelo (únicamente páginas sin relación con el proyecto), por lo que no se añaden enlaces adicionales a papers, blogs o demos más allá de los incluidos en la model card.
