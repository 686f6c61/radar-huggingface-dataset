# Gameblamer/NSFW_Wan_1.3b

## Resumen

NSFW Wan 1.3B es un ajuste fino (fine-tune) del modelo de texto-a-video Wan2.1-T2V-1.3B de Alibaba (Wan-AI), publicado por el usuario Gameblamer en HuggingFace. El modelo base es un transformer de difusión de 1.300 millones de parámetros orientado a generación de video en local, y este fine-tune lo especializa en la generación de contenido adulto explícito (NSFW) a partir de prompts de texto, eliminando los filtros del modelo original. Su relevancia radica en que es uno de los pocos modelos T2V "uncensored" ligeros que pueden ejecutarse en GPUs de consumo.

El autor ha publicado dos series de checkpoints: una original (e1-e20) entrenada en dos fases separadas (imagen y video), que sufrió degradación grave de calidad anatómica, y una serie experimental (exp_e1 a exp_e14) reentrenada con un dataset mixto que corrige esos defectos. El checkpoint recomendado por el autor es `wan_1.3B_exp_e14.safetensors`.

Conviene señalar que el modelo tiene tracción mínima en la comunidad (0 descargas y 0 likes en el momento de la ficha), está etiquetado como `not-for-all-audiences` y su uso plantea obligaciones legales serias que se detallan en la sección de limitaciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión texto-a-video (T2V), heredado de Wan2.1-T2V-1.3B |
| Parámetros totales | 1.300 millones (1,3B) |
| Parámetros activos | No aplica (arquitectura densa, no MoE) |
| Longitud de contexto | No disponible (usa el codificador de texto del modelo base Wan2.1) |
| Tipos de cuantización | No disponible (solo checkpoints completos en safetensors, sin versiones cuantizadas oficiales) |
| Idiomas soportados | No disponible en la ficha; el modelo base Wan2.1-T2V-1.3B acepta prompts en chino e inglés |
| Licencia | CreativeML OpenRAIL-M (creativeml-openrail-m) |
| Formato de pesos | Safetensors (múltiples checkpoints) + `prompting-guide.json`; tamaño total del repositorio: 105,4 GB |

## Arquitectura y entrenamiento

El modelo parte de Wan2.1-T2V-1.3B, la versión compacta de la familia Wan 2.1 de Alibaba, una arquitectura de transformer de difusión para generación de video a partir de texto. El fine-tune conserva la arquitectura y el tamaño del base (1,3B parámetros) y modifica únicamente los pesos mediante entrenamiento adicional sobre datos adultos.

El entrenamiento original se dividió en dos fases: las épocas 1-10 se ajustaron principalmente sobre un dataset masivo de imágenes NSFW (fuerte en estilo y detalle, débil en movimiento), y las épocas 11-20 se entrenaron exclusivamente con video, lo que dotó al modelo de coherencia temporal nativa sin necesidad de LoRAs auxiliares. Este enfoque provocó olvido catastrófico de la anatomía coherente (caras, manos) a partir de la época 3, con artefactos de "body horror" en la salida.

La serie experimental corrige esto con una configuración de entrenamiento único sobre un dataset mixto de 30.000 clips de video y 20.000 imágenes estáticas simultáneos, que actúa como regularización espacial constante, junto con una tasa de aprendizaje más conservadora, lotes más pequeños y un calendario de entrenamiento más corto. No se menciona el uso de RLHF ni DPO (habitual en modelos de difusión no aplica). El dataset procede de los 1.000 posts principales de unas 1.250 subreddits NSFW, con captions basadas en las convenciones de etiquetado de esas comunidades; el repositorio incluye un `prompting-guide.json` con análisis de keywords para construir prompts efectivos.

## Capacidades

- Generación de video corto (clips de unos pocos segundos) a partir de prompts de texto, con movimiento coherente de forma nativa en los checkpoints entrenados con video.
- Cobertura temática amplia del espectro de contenido adulto: escenarios, estéticas, arquetipos de personaje y acciones descritas en lenguaje natural.
- Los checkpoints de la serie experimental (recomendado: `wan_1.3B_exp_e14.safetensors`) ofrecen un equilibrio entre fidelidad al contenido explícito y coherencia visual espacial, sin los artefactos de la serie original.
- Los checkpoints legacy e11-e20 generan video directamente sin necesidad de LoRAs auxiliares de movimiento.
- Base válida para entrenamiento de LoRAs propios; el autor recomienda expresamente `exp_e14` como punto de partida para ello.
- Prompting mediante tags y frases al estilo de las comunidades de origen; el `prompting-guide.json` incluido documenta el vocabulario efectivo.
- No es un modelo de lenguaje: no soporta tool calling, function calling, razonamiento multi-paso ni generación de texto. Tampoco incorpora capacidades de visión o audio de entrada según la información disponible.

## Casos de uso

- Investigación en generación de video por difusión: el par de series de checkpoints (legacy vs. experimental) constituye un caso de estudio real de olvido catastrófico y de cómo la mezcla imagen+video actúa como regularización espacial durante el fine-tuning.
- Creación de contenido adulto por creadores legitimos: generadores de material para plataformas para adultos con creadores verificados pueden usar el modelo para producir clips cortos a partir de guiones textuales, siempre con verificación de edad y cumplimiento de la legislación aplicable.
- Entrenamiento de LoRAs especializados: quien necesite un estilo visual o un arquetipo concreto puede partir de `exp_e14` y ajustar un LoRA ligero en lugar de reentrenar el modelo completo.
- Evaluación comparativa de checkpoints: la disponibilidad de series completas de épocas permite hacer ablación de cuántas épocas de fine-tuning degradan la coherencia anatómica antes de estabilizarse.
- Pruebas de pipelines T2V en local: al heredar el tamaño del base (1,3B), sirve para validar flujos de trabajo de generación de video en estaciones de trabajo con GPUs de consumo, con control total sobre parámetros de generación y manejo del prompt.
- Estudio de lenguajes de prompting por tags: el `prompting-guide.json` es útil para analizar cómo las convenciones de etiquetado de comunidades concretas afectan a la salida de un modelo de difusión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Ni el autor ni terceros han publicado métricas tipo VBench, FVD o evaluaciones de coherencia temporal para este fine-tune; la única "evaluación" documentada es la revisión cualitativa del autor que motivó la serie experimental.

## Requisitos de hardware

- VRAM estimada para inferencia: al mantener los 1,3B parámetros del base, los requisitos son los de Wan2.1-T2V-1.3B, que según las cifras publicadas por Alibaba ronda los 8,19 GB de VRAM en generación 480p. Dato del fine-tune en sí: no disponible.
- Almacenamiento: el repositorio completo pesa 105,4 GB por la cantidad de checkpoints incluidos; descargar un solo checkpoint reduce mucho el requisito.
- GPUs recomendadas: RTX 3090 o RTX 4090 (24 GB) para trabajar con holgura y entrenar LoRAs; por los ~8 GB del base, modelos de consumo como RTX 3060 12 GB o RTX 4070 deberían manejar la inferencia a 480p, aunque no hay confirmación del autor.
- Despliegue: los pipelines habituales de LLM (vLLM, TGI, llama.cpp, Ollama) no aplican al ser un modelo de difusión de video; se usa sobre la stack de inferencia de Wan2.1 (PyTorch / diffusers / ComfyUI). No hay versiones GGUF ni cuantizadas publicadas en el repositorio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Especialización | Licencia | Notas |
|---|---|---|---|---|
| Gameblamer/NSFW_Wan_1.3b | 1,3B | Contenido adulto (T2V) | CreativeML OpenRAIL-M | Fine-tune uncensored; series legacy y experimental; 105,4 GB en checkpoints |
| Wan-AI/Wan2.1-T2V-1.3B (base) | 1,3B | T2V generalista (SFW) | Apache 2.0 | Modelo original de Alibaba, ~8,19 GB VRAM en 480p, prompts en chino e inglés |
| huihui-ai/NSFW_Wan_1.3B | 1,3B | Contenido adulto (T2V) | No disponible | Otro fine-tune uncensored del mismo base, publicado en paralelo |
| Wan-AI/Wan2.1-T2V-14B | 14B | T2V generalista (SFW) | Apache 2.0 | Hermano mayor del base, mayor calidad y resolución (hasta 720p), requisitos de VRAM muy superiores |

## Limitaciones y advertencias

- Contenido restringido a adultos: el modelo está etiquetado `not-for-all-audiences` y genera material sexual explícito. Su uso está prohibido para generar contenido que implique menores o personas reales sin su consentimiento; la responsabilidad legal del cumplimiento recae íntegramente en el usuario, según recoge también la cobertura de terceros.
- Licencia con restricciones: CreativeML OpenRAIL-M incluye cláusulas de uso que prohíben ciertas aplicaciones y pueden limitar el uso comercial; además, difiere de la licencia Apache 2.0 del modelo base, lo que puede generar dudas de compatibilidad en derivados.
- Sesgos del dataset: el entrenamiento procede de ~1.250 subreddits NSFW, lo que arrastra los sesgos demográficos, estéticos y de representación de esas comunidades, además de plantear dudas de consentimiento sobre las personas presentes en el material de origen.
- Riesgo de artefactos: los checkpoints legacy (especialmente a partir de la época 3) presentan degradación anatómica grave y distorsiones; la serie experimental las reduce pero no hay garantías de calidad estable en todos los casos.
- Ausencia de filtros: al ser un modelo "uncensored", no incorpora moderation ni safety filters; cualquier despliegue público requiere capas de moderación propias.
- Validación comunitaria casi nula: 0 descargas y 0 likes registrados; no hay evaluaciones independientes ni benchmarks publicados.
- Prompting en inglés: las captions y la guía de prompting se basan en convenciones de comunidades anglófonas; el rendimiento con prompts en otros idiomas no está documentado.
- Operativa: sin cuantizaciones oficiales y con un repositorio de 105,4 GB, la gestión de descargas y versiones de checkpoints es engorrosa.

## Enlaces

- Ficha en HuggingFace: https://huggingface.co/Gameblamer/NSFW_Wan_1.3b
- Modelo base (Wan-AI/Wan2.1-T2V-1.3B): https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B
- Variante de huihui-ai: https://huggingface.co/huihui-ai/NSFW_Wan_1.3B
- Repositorio en GitHub (NSFW-API/nsfw-wan-1.3b): https://github.com/NSFW-API/nsfw-wan-1.3b
- Página en Civitai (serie experimental v14): https://civitai.red/models/1697081/nsfw-wan-13b-t2v
- Noticia de cobertura (vgtimes): https://vgtimes.com/tech-and-hardware/169148-nsfw-wan-1.3b-ai-model-generates-short-adult-videos-from-text.html
