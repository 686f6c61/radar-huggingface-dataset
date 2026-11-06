# aixonlab/svg-slm-4b-lora

## Resumen

svg-slm-4b-lora es un adaptador LoRA de fine-tuning supervisado (SFT) sobre el modelo base Qwen/Qwen3.5-4B, desarrollado por aixonlab, orientado a la generación de gráficos vectoriales SVG a partir de descripciones en lenguaje natural: iconos, ilustraciones planas, line art, degradados, emojis, animaciones SMIL/CSS y escenas complejas. El adaptador tiene rango 32 y alpha 64, con 42,5 millones de parámetros entrenables, y se distribuye bajo licencia Apache-2.0. Los pesos fusionados en bf16 están publicados en el repositorio aixonlab/svg-slm-4b.

El modelo es explícitamente experimental y de primera iteración. El objetivo declarado del proyecto era superar a Claude Sonnet 5.5 en generación de SVG; según la propia model card, este checkpoint no lo consigue. Se entrenó durante aproximadamente 2 horas de GPU (207 pasos de optimizador, unos 3.300 ejemplos, en torno al 4% del dataset) con un límite de cómputo de 4 dólares. En la evaluación ciega por pares perdió todas las comparaciones, por lo que debe considerarse una línea base reproducible y una demostración del pipeline, no un sustituto de un modelo frontera.

Su relevancia actual es metodológica más que de rendimiento: documenta de forma transparente un flujo completo de SFT con LoRA para una tarea de modalidad no textual (salida estructurada SVG), incluyendo dataset, log de entrenamiento, salidas de evaluación y un análisis honesto de las causas del bajo rendimiento (secuencias truncadas, repetición, ausencia de etapa de preferencia).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.5-4B) con adaptador LoRA sobre proyecciones de atención y MLP |
| Parámetros totales | No disponible para el adaptador; el base es de 4B. El adaptador LoRA entrena 42,5M parámetros |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible de forma explícita; las secuencias de entrenamiento se limitaron a 5.000 tokens totales |
| Tipos de cuantización | No disponible (pesos del adaptador en bf16; los fusionados también en bf16) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | safetensors (adaptador LoRA; pesos fusionados también en safetensors) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen3.5-4B, un transformer decoder-only de 4.000 millones de parámetros. El fine-tuning emplea LoRA con r=32 y alpha=64 sobre todas las proyecciones de atención y MLP, con 42,5 millones de parámetros entrenables en bf16, learning rate de 1e-4 con decaimiento coseno, batch efectivo de 16 (batch 1 con acumulación de gradiente 16) y pérdida calculada únicamente sobre los tokens del asistente (el SVG). Se desactiva el modo thinking en la plantilla de chat. El entrenamiento se ejecutó en una única RTX PRO 4500 Blackwell de 32 GB en Runpod, con kernels que cayeron a rutas lentas de PyTorch (flash-linear-attention instalado, causal-conv1d no), lo que limitó el throughput a unos 38-43 segundos por paso. Se completaron 207 pasos y la pérdida bajó de aproximadamente 0,78 a 0,70.

Los datos proceden del dataset aixonlab/svg-sft-v1, con 78.620 ejemplos filtrados por licencia: conjuntos permisivos de Iconify, filas permisivas de SVG Repo, Clker, OpenClipart, InternSVG SAgoge y SVG-Sophia. Solo se vieron unos 3.300 ejemplos, en torno al 4% del total. No hubo etapa de preferencia ni RL. La innovación técnica destacable no está en el modelo sino en el planteamiento del pipeline: entrenamiento con salida estructurada SVG, evaluación ciega con juez automático y publicación de las salidas crudas de evaluación (eval_outputs_v2.json, judge_v2.json) para permitir auditoría.

## Capacidades

- Generación de texto a SVG: iconos, ilustraciones planas, line art en blanco y negro, formas con degradado y sombreado, emojis y escenas.
- Generación de SVG animado mediante SMIL y CSS (aunque es la categoría más débil según la evaluación).
- Conversación multi-turno en formato chat (pipeline text-generation, conversational).
- Salida estructurada de código SVG delimitada por etiquetas `<svg>...</svg>`, apta para extracción y validación programática.
- Capacidades heredadas del base Qwen3.5-4B (razonamiento, código, matemáticas, tool calling) potencialmente mermadas por el fine-tuning específico; no documentadas para este adaptador.
- Soporte multilingüe limitado al inglés según la model card.
- No se documenta soporte de visión, audio ni modo thinking (este último se desactiva explícitamente en la plantilla de chat).

## Casos de uso

- Generación de iconos para interfaces: el modelo produce SVG de iconos simples a partir de descripciones en inglés, útiles como borrador inicial que un diseñador revisa y corrige antes de integrarlo en un sistema de diseño.
- Prototipado rápido de ilustraciones planas: para maquetas y wireframes donde se necesita un recurso vectorial aproximado sin encargar trabajo de diseño, aceptando que la adherencia al prompt es débil y requiere iteración.
- Creación de line art para documentación técnica: diagramas y esquemas en blanco y negro que después se limpian manualmente en Inkscape o Illustrator.
- Generación de emojis y pictogramas personalizados: recursos vectoriales pequeños para aplicaciones internas, con validación previa del SVG antes de su uso.
- Experimentación académica y reproducibilidad: sirve como línea base documentada para investigar SFT con LoRA en tareas de salida estructurada, con dataset, log y evaluación publicados.
- Construcción de pipelines de evaluación text-to-SVG: las salidas y el juez publicados permiten reutilizar el esquema de evaluación ciega para comparar otros modelos o checkpoints.
- Filtrado y curación de datasets SVG: el adaptador puede emplearse para generar candidatos que luego se validan con un renderizador y se filtran por reglas, dentro de un proceso de aumento de datos.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Salidas SVG completas y renderizables | 26 / 60 (el 32% alcanzó el límite de 6.000 tokens sin cerrar `</svg>`, mayoritariamente por bucles de repetición o path data excesivamente larga; 2 salidas renderizaron en blanco) |
| Victorias del juez ciego frente a Sonnet 5.5 (solo salidas válidas, n=26) | 0 / 26 |
| Puntuación media del juez sobre esas 26 | modelo 1,6 / 10; Sonnet 5.5 8,4 / 10 |
| Tasa de victoria sobre los 60 prompts (inválidas contadas como derrota) | 0 % |
| Por categoría (solo salidas válidas) | Sonnet ganó en todas: icono 7/7, sombreado 6/6, animado 5/5, line art 3/3, emoji 2/2, escena 2/2, ilustración plana 1/1 |

Condiciones de evaluación: 60 prompts creados para el proyecto (10 icono, 10 ilustración plana, 8 line art B/N, 8 sombreado/degradado, 6 emoji, 10 animados, 8 escena compleja), decodificación con temperature 0,4, top-p 0,9, repetition penalty 1,06, máximo 6.000 tokens nuevos y parada en `</svg>`. El juez fue Claude Opus 5.5 como subagente, ciego a la procedencia y con posición aleatorizada, puntuando adherencia al prompt y calidad visual de 1 a 10. Advertencias del autor: conjunto de evaluación pequeño y creado dentro del mismo proyecto, animaciones juzgadas sobre un fotograma estático y un único modelo juez. Una decodificación anterior (temperature 0,6, tope de 3.500 tokens) dio solo 20/60 salidas válidas.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA es ligero (repositorio de 0,2 GB), pero requiere cargar el base Qwen3.5-4B. En bf16, el base ocupa aproximadamente 8 GB de VRAM; con cuantización de 4 bits podría reducirse a unos 3-4 GB, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: el entrenamiento se realizó en una RTX PRO 4500 Blackwell de 32 GB. Para inferencia son suficientes GPU con 12-16 GB o más; una RTX 4090 (24 GB) o una A100/H100 ofrecen margen amplio.
- Cabe en GPU de consumo: sí, con 12 GB o más en bf16; con 8 GB probablemente requiera cuantización del base.
- Opciones de despliegue: transformers con peft (flujo documentado en la model card), fusión con merge_and_unload y despliegue posterior mediante vLLM o TGI; llama.cpp y Ollama no están documentados para este adaptador.
- Latencia y throughput: no disponibles de forma directa. El entrenamiento corrió a 38-43 s/paso con kernels lentos; la generación de hasta 6.000 tokens por petición implica latencias altas, y el fallo frecuente de terminación agrava el coste.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| aixonlab/svg-slm-4b-lora | base 4B + LoRA 42,5M | no disponible (entrenamiento a 5.000 tokens) | text-to-SVG experimental | Apache-2.0 | Hugging Face (adaptador y pesos fusionados) |
| Qwen/Qwen3.5-4B | 4B | no disponible | LLM generalista base | no disponible en la información | Hugging Face |
| Claude Sonnet 5.5 | no disponible | no disponible | modelo frontera propietario | propietaria | API de Anthropic |

La comparación de rendimiento disponible es únicamente la evaluación ciega frente a Sonnet 5.5, en la que el adaptador perdió 26 de 26 comparaciones válidas con una puntuación media de 1,6 frente a 8,4. No se han publicado comparaciones con otros modelos especializados en text-to-SVG en la información disponible.

## Limitaciones y advertencias

- Adherencia débil al prompt: las salidas suelen ser formas plausibles que no representan lo solicitado.
- Fallo frecuente de terminación: degenera en fragmentos de path repetidos en salidas largas; 32 de 60 salidas no cerraron `</svg>`.
- Escenas complejas y animación son las categorías más débiles; las secuencias de entrenamiento limitadas a 5.000 tokens eliminaron la mayoría de ejemplos de escena compleja.
- Solo se vio una fracción pequeña del dataset (aproximadamente el 4%) y no hubo etapa de preferencia ni RL.
- Evaluación limitada: 60 prompts, juez único, animaciones juzgadas sobre fotograma estático y conjunto creado dentro del mismo proyecto.
- Idioma: solo inglés documentado; el rendimiento en castellano no está evaluado.
- Licencia: los pesos son Apache-2.0, pero los datos de entrenamiento tienen licencias por fila (MIT, Apache-2.0, CC0, dominio público, CC-BY-4.0, ISC, BSD, Unlicense), incluyendo filas CC-BY que exigen atribución. El autor advierte de revisar la dataset card antes de un uso comercial; esto no constituye asesoramiento legal.
- Riesgo de alucinación: alto en el sentido de generar geometrías que no corresponden a la petición.
- Para producción: requiere validación del SVG (parseo y renderizado) y un mecanismo de reintento o fallback a un modelo frontera; no es apto como generador principal sin supervisión.

## Enlaces

- Adaptador LoRA en Hugging Face: https://huggingface.co/aixonlab/svg-slm-4b-lora
- Pesos fusionados en bf16: https://huggingface.co/aixonlab/svg-slm-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/aixonlab/svg-sft-v1
