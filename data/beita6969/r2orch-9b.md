# beita6969/R2Orch-9b

## Resumen

R2Orch-9B es un modelo de lenguaje multimodal (texto e imagen) de 9.653 millones de parámetros, desarrollado por el autor independiente beita6969. Se trata de un ajuste fino de Qwen/Qwen3.5-9B en el que se ha fusionado el denominado "Director", un adaptador LoRA de rango 64 entrenado para tareas de orquestación multiagente. El modelo forma parte del sistema R²Orch, en el que el Director coordina a varios "Workers" (instancias sin modificar de Qwen3.5-9B) para resolver tareas complejas mediante razonamiento en varios pasos.

El problema que aborda es la orquestación eficiente de agentes: en lugar de entrenar un modelo monolítico para tareas de planificación y delegación, R²Orch separa los roles de dirección y ejecución. Este lanzamiento publica únicamente el Director fusionado; el Proposer es un componente exclusivo de entrenamiento y no se distribuye. La relevancia actual reside en el interés creciente por arquitecturas de agentes orquestados y por el entrenamiento mediante self-play aplicado a la coordinación.

El modelo hereda la arquitectura y la ventana de contexto de Qwen3.5-9B, se distribuye bajo licencia Apache 2.0 y está pensado para su uso con la librería transformers. El repositorio ocupa 29,9 GB, coherente con pesos en bfloat16 más las 128 matrices fusionadas almacenadas en float32.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), basada en Qwen3.5-9B con atención completa en determinadas capas y capas MLP; incluye adaptador LoRA fusionado |
| Parametros totales | 9.653.104.368 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los pesos se publican en bfloat16 y float32 para las matrices fusionadas) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B, un transformer multimodal capaz de procesar entradas de imagen y texto. Sobre esa base se entrenó un adaptador LoRA de rango 64 y alpha 64 aplicado a las proyecciones `q_proj`, `k_proj`, `v_proj` y `o_proj` de las capas de atención completa, así como a `gate_proj`, `up_proj` y `down_proj` de todas las capas MLP. El adaptador se ha fusionado en los pesos base, generando 128 matrices fusionadas almacenadas en float32; el resto de tensores permanece en bfloat16 sin cambios.

El entrenamiento se enmarca en el sistema R²Orch, descrito en el paper arXiv:2610.22740, que emplea self-play con un Proposer (componente de entrenamiento no liberado) para mejorar la capacidad de orquestación del Director. La magnitud de la actualización LoRA es reducida: aproximadamente el 0,13 % de la norma de los pesos (máximo del 0,19 %), por debajo de la resolución relativa de bfloat16 (en torno al 0,4 %). Por ello, el autor recomienda cargar el modelo en float32 para reproducir exactamente el Director entrenado; la verificación frente a la base sin fusionar más el adaptador muestra una diferencia máxima de logits de 0,004 y una divergencia KL inferior a 1e-7.

## Capacidades

- Generación de texto y razonamiento multimodal: acepta entradas de imagen y texto (pipeline image-text-to-text).
- Orquestación multiagente: el Director está entrenado para planificar, delegar y coordinar a los Workers (Qwen3.5-9B sin modificar).
- Razonamiento en varios pasos (multi-step reasoning) orientado a la resolución de tareas compuestas.
- Capacidad de coordinación aprendida mediante self-play.
- Conversación multi-turno (etiqueta `conversational`).
- Compatibilidad con endpoints (`endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, visión o audio específicos: no disponible en la información proporcionada más allá del pipeline multimodal heredado de Qwen3.5-9B.

## Casos de uso

- Orquestación de pipelines de agentes: el modelo actúa como Director que descompone una tarea en subtareas y las asigna a instancias Worker de Qwen3.5-9B, aprovechando el entrenamiento específico de coordinación.
- Automatización de flujos de trabajo con múltiples herramientas: al heredar la naturaleza conversacional de Qwen3.5-9B, puede integrarse como capa de planificación en sistemas que encadenan pasos y delegan la ejecución a otros modelos.
- Investigación en sistemas multiagente: sirve como referencia reproducible para estudiar el efecto del self-play en la coordinación, ya que el paper y el código están publicados.
- Procesamiento de documentos con imagen y texto: el pipeline image-text-to-text permite extraer información de capturas, diagramas o documentos escaneados y coordinarla con tareas textuales posteriores.
- Asistentes conversacionales con contexto de sesión: la etiqueta `conversational` y la herencia de Qwen3.5-9B lo hacen adecuado para diálogos multi-turno donde se requiere planificación.
- Evaluación comparativa de orquestadores: al ser un ajuste ligero (0,13 % de la norma de pesos) sobre una base conocida, permite medir de forma aislada el impacto del entrenamiento de coordinación frente al modelo base.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia Apache 2.0 facilita su integración en productos comerciales sin las restricciones de otras licencias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9.653 millones de parámetros, en bfloat16 se requieren aproximadamente 19,3 GB solo para los pesos; en float32, unos 38,6 GB. A ello hay que sumar el coste del procesador de visión y la caché KV, que depende de la longitud de contexto (no disponible).
- El autor recomienda cargar el modelo en float32 para reproducir exactamente el Director entrenado, lo que eleva el requisito de memoria a unos 38,6 GB para los pesos.
- GPU recomendadas: para float32, A100 80 GB, H100 o GPUs con 48 GB o más; para bfloat16, A100 40 GB, RTX A6000 (48 GB) o similares.
- En GPU de consumo: en bfloat16 podría ajustarse en una RTX 4090 (24 GB) solo con cuantización o con contexto muy reducido, dado el tamaño de los pesos y la caché KV; en float32 no cabe en GPUs de consumo actuales.
- Opciones de despliegue: transformers (soporte oficial del autor mediante `Qwen3_5ForConditionalGeneration`); vLLM, llama.cpp, Ollama o TGI no están confirmados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| R2Orch-9B | 9.653 M | No disponible | Apache 2.0 | Ajuste de orquestación sobre Qwen3.5-9B con LoRA fusionado |
| Qwen/Qwen3.5-9B | ~9.000 M (base) | No disponible | No disponible | Modelo base multimodal; los Workers de R²Orch son esta versión sin modificar |
| Alternativas de orquestación multiagente | No disponible | No disponible | No disponible | No se dispone de datos de modelos comparables en la información proporcionada |

## Limitaciones y advertencias

- El modelo está diseñado específicamente como Director de orquestación; su comportamiento fuera de ese rol puede degradarse respecto al modelo base.
- La actualización de pesos es muy pequeña (0,13 % de la norma), por lo que cargarlo en bfloat16 puede perder parte del ajuste aprendido; el autor recomienda float32 para reproducibilidad exacta.
- El Proposer, componente clave del entrenamiento, no se distribuye, lo que limita la reproducción completa del sistema R²Orch.
- No se han publicado datos sobre sesgos, idiomas soportados ni tasas de alucinación; se desconoce su comportamiento en dominios sensibles.
- El modelo tiene 27 descargas y 0 likes en el momento de la ficha, lo que indica una validación comunitaria muy limitada.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones de la licencia del modelo base Qwen3.5-9B antes de un uso comercial.
- La longitud de contexto no está documentada en la información disponible, lo que dificulta planificar despliegues con ventanas largas.
- Al ser un modelo multimodal, la calidad en tareas de imagen depende del procesador de visión heredado, cuyo comportamiento no se detalla.

## Enlaces

- Hugging Face: https://huggingface.co/beita6969/R2Orch-9b
- Paper: https://arxiv.org/abs/2610.22740
- Página del paper en Hugging Face: https://huggingface.co/papers/2610.22740
- Código: https://github.com/beita6969/R2Orch
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
