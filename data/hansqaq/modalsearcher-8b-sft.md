# hansQAQ/ModalSearcher-8B-SFT

## Resumen

ModalSearcher-8B-SFT es un ajuste fino supervisado (SFT) del modelo multimodal Qwen3-VL-8B-Instruct, desarrollado por hansQAQ. Está diseñado para la búsqueda profunda multimodal asistida por herramientas: el modelo decide qué buscar, en qué modalidad hacerlo y cuándo cambiar de modalidad (texto, imagen, búsqueda inversa) para reunir evidencia visual y textual en preguntas que requieren múltiples saltos de razonamiento.

El modelo se enmarca en el proyecto ModalSearcher, que incluye un runner de inferencia, un conjunto de datos de entrenamiento (ModalSearch-21K-Full) y un benchmark propio (ModalSearch-Bench). Este checkpoint concreto contiene únicamente los pesos del SFT y está pensado tanto para inferencia directa como para inicializar un entrenamiento posterior de refuerzo (RL); la versión SFT + RL se publica por separado.

La relevancia actual del modelo radica en su enfoque de agente de búsqueda multimodal: integra cuatro herramientas de recuperación y genera trayectorias de tool use verificables. No obstante, se trata de una publicación de nicho, con cero descargas y sin resultados de benchmarks publicados en la información disponible, por lo que debe evaluarse con cautela antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3VLForConditionalGeneration (transformer multimodal, vision-language) |
| Parametros totales | 8B (el campo safetensors del repo indica 770.288, dato inconsistente con el tamaño del repo de 17,5 GB y con el modelo base de 8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 50.000 tokens según la configuración de ejemplo del autor en SGLang (`--context-length 50000`) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | Safetensors, BF16 |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-VL-8B-Instruct, un transformer multimodal de tipo vision-language con capacidad de procesar imágenes y texto. Sobre esa base se aplica un ajuste fino supervisado (SFT) orientado a la generación de trayectorias de búsqueda con llamadas a herramientas. El repositorio incluye pesos, tokenizador y procesadores, y se distribuye en BF16 con safetensors.

El entrenamiento se apoya en el dataset ModalSearch-21K-Full y en un runner de inferencia que ejecuta las llamadas a herramientas del modelo y realimenta la evidencia en la conversación. Las herramientas cubiertas son `t2t_search` (recuperación textual y candidatos web), `t2i_search` (búsqueda de imágenes a partir de texto), `i2i_search` (búsqueda inversa de imagen, incluidas regiones recortadas) y `read_url` (lectura de páginas web y PDF, e inspección de imágenes recuperadas). No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO en este checkpoint; el autor indica que la versión con RL se publica por separado.

## Capacidades

- Generación de texto y razonamiento multimodal sobre entradas de imagen y texto (pipeline `image-text-to-text`).
- Búsqueda profunda multimodal con planificación de qué buscar y en qué modalidad.
- Tool calling con cuatro herramientas específicas: `t2t_search`, `t2i_search`, `i2i_search` y `read_url`.
- Razonamiento multi-salto (multi-hop) combinando evidencia visual y textual.
- Cambio dinámico de modalidad durante la trayectoria de búsqueda.
- Lectura de páginas web y PDF como parte del bucle de recuperación.
- Capacidad de servir como inicialización para entrenamiento posterior con RL.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Verificación de hechos con evidencia visual: el modelo puede encadenar `t2t_search` e `i2i_search` para localizar una afirmación, recuperar imágenes relacionadas y contrastar la evidencia antes de responder, lo que resulta útil en tareas de fact-checking.
- Preguntas multi-salto sobre documentos y web: con `read_url` y `t2t_search` puede navegar por páginas y PDF, extraer pasajes relevantes y encadenar varios saltos de razonamiento para responder preguntas complejas.
- Búsqueda inversa de imágenes y regiones: mediante `i2i_search` puede identificar el origen de una imagen o de un recorte concreto, útil en tareas de atribución de fuentes o análisis de contenido visual.
- Construcción de agentes de investigación autónomos: el modelo está entrenado para decidir la siguiente acción de búsqueda, por lo que encaja como planificador en pipelines de deep research que requieran alternar entre texto e imagen.
- Punto de partida para investigación en RL: al ser un checkpoint SFT, sirve como inicialización para experimentos de aprendizaje por refuerzo sobre trayectorias de tool use, con el runner y el dataset del proyecto.
- Evaluación de agentes de búsqueda multimodal: junto con ModalSearch-Bench, permite medir la calidad de las trayectorias de búsqueda y la precisión de las respuestas finales en un entorno controlado.
- Asistencia en análisis de documentos técnicos con figuras: combinando lectura de PDF e inspección de imágenes recuperadas, puede responder preguntas que dependen de gráficos o diagramas además del texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor referencia un enlace de arXiv marcado explícitamente como placeholder, sin métricas en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 16 GB solo para pesos, más memoria para el contexto y el procesador visual; en la práctica se recomienda al menos 24 GB por GPU para secuencias largas.
- El autor sirve el modelo con SGLang y `--tp 2`, es decir, tensor parallelism sobre dos GPU, con `--context-length 50000`.
- GPU recomendadas: A100 40/80 GB, H100, o dos GPU de gama alta en paralelo; una RTX 4090 de 24 GB puede alojar los pesos en BF16, pero el contexto de 50.000 tokens y el procesamiento de imágenes pueden requerir cuantización o reducir la longitud de contexto.
- Despliegue: SGLang es la opción documentada por el autor; al ser un modelo de transformers con safetensors, también es compatible con otros servidores que soporten `Qwen3VLForConditionalGeneration`, aunque no se documentan en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Notas |
|---|---|---|---|---|---|
| ModalSearcher-8B-SFT | 8B | 50.000 (config. de ejemplo) | Imagen + texto, tool use | no disponible | SFT sobre Qwen3-VL-8B-Instruct; sin benchmarks publicados |
| Qwen3-VL-8B-Instruct | 8B | no disponible en la información | Imagen + texto | no disponible en la información | Modelo base; capacidades generales de VLM sin entrenamiento específico de búsqueda |
| ModalSearcher-8B (SFT + RL) | 8B | no disponible en la información | Imagen + texto, tool use | no disponible | Versión del mismo proyecto con RL adicional |

## Limitaciones y advertencias

- Las respuestas dependen de la evidencia recuperada y de la disponibilidad de los servicios de herramientas externos; si fallan, el modelo no puede completar la búsqueda.
- El propio autor advierte de que el modelo puede devolver respuestas incorrectas o sin respaldo; es necesario verificar las afirmaciones factuales contra las fuentes citadas.
- La licencia no está indicada, lo que impide confirmar si el uso comercial está permitido; debe consultarse con el autor antes de cualquier despliegue en producción.
- No hay información sobre idiomas soportados ni sobre sesgos conocidos.
- El campo de parámetros totales del repo safetensors (770.288) es inconsistente con el tamaño del repositorio y con el modelo base de 8B; conviene verificar los pesos antes de usarlos.
- El enlace de arXiv es un placeholder y no hay paper ni resultados de benchmarks disponibles.
- El modelo tiene cero descargas y cero likes, y no cuenta con validación externa de la comunidad.
- El uso requiere infraestructura adicional: runner de inferencia, servicios de herramientas configurados y un modelo auxiliar para la extracción de evidencia de páginas web.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hansQAQ/ModalSearcher-8B-SFT
- Versión SFT + RL: https://huggingface.co/hansQAQ/ModalSearcher-8B
- Dataset de entrenamiento: https://huggingface.co/datasets/hansQAQ/ModalSearch-21K-Full
- Benchmark: https://huggingface.co/datasets/hansQAQ/ModalSearch-Bench
- Código y documentación: https://github.com/Hans-M-Yin/ModalSearcher
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- arXiv: https://arxiv.org/abs/ARXIV_ID (placeholder, no disponible)
