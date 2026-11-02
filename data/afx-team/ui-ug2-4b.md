# afx-team/UI-UG2-4B

## Resumen

UI-UG2-4B es un modelo multimodal de 4B parámetros desarrollado por afx-team (equipo vinculado a Alipay, a juzgar por el alojamiento de imágenes en mdn.alipayobjects.com) especializado en comprensión y generación de interfaces de usuario móviles. Se construye sobre el backbone Qwen3-VL de 4B y unifica dos tareas que habitualmente se tratan por separado: el análisis fino de capturas de pantalla (referring, dense grounding y GUI grounding condicionado por instrucción) y la generación estructurada de interfaces renderizables mediante un DSL JSON. La versión 2 sustituye el backbone Qwen2.5-VL de 7B de la generación anterior por Qwen3-VL de 4B, amplía la taxonomía de 20 a 71 etiquetas finas agrupadas en 9 clases padre y cambia el post-entrenamiento de DPO offline a GRPO online con render-aware supervision.

El modelo resulta relevante porque aborda el problema de la automatización de agentes que operan sobre interfaces móviles: localizar elementos con precisión, entender roles funcionales y estados de componentes, y generar pantallas completas a partir de una descripción. La combinación de supervisión fina y aprendizaje por refuerzo con evaluación de renderizado busca alinear la salida generada con lo que realmente se puede pintar en pantalla, un cuello de botella clásico en pipelines de generación de UI.

La información pública disponible es limitada: la model card es fundamentalmente descriptiva, con gráficos de benchmarks en lugar de tablas numéricas, y no detalla la composición del dataset de entrenamiento ni los hiperparámetros. El repositorio ocupa 8,9 GB y el modelo se distribuye bajo licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (backbone Qwen3-VL, vision-language) |
| Parámetros totales | 4B (según model card); el campo de safetensors del repo indica 569.856, dato inconsistente con el tamaño del repo (8,9 GB) y con la nomenclatura del modelo |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors; se espera compatibilidad con cuantizaciones estándar de transformers/vLLM, pero no se documenta) |
| Idiomas soportados | no disponible (la model card no declara idiomas; hereda presumiblemente las capacidades multilingües de Qwen3-VL, sin confirmación oficial) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

UI-UG2-4B emplea un backbone Qwen3-VL de 4B parámetros, es decir, un transformer multimodal con codificador visual y decodificador de lenguaje, adaptado mediante post-entrenamiento a tareas específicas de UI. Sobre esa base, el modelo incorpora una taxonomía de front-end alineada con 71 etiquetas finas agrupadas en 9 clases padre, que distinguen estados de componente, roles funcionales y elementos parcialmente visibles (truncados). La salida de generación se expresa en un DSL JSON renderizable con renderizado progresivo, lo que permite reconstruir la pantalla a partir de la estructura generada.

El post-entrenamiento combina supervisión fina para comprensión (referring, dense grounding e instruction-conditioned GUI grounding) con una fase de reinforcement learning online denominada render-aware GRPO, que utiliza puntuaciones absolutas de un juez y ranking de preferencias contrastivo. Según la model card, esta fase sustituye al DPO offline de UI-UG1 y busca optimizar directamente la calidad del render final, no solo la plausibilidad textual del DSL. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni los detalles del juez utilizado. El código de entrenamiento no se incluye en el repositorio; solo se distribuyen inferencia, serving y renderizado del DSL.

## Capacidades

- Comprensión de capturas de pantalla de interfaces móviles: descripción de regiones delimitadas por coordenadas (referring).
- Dense grounding: detección densa de elementos de UI con sus bounding boxes.
- GUI grounding condicionado por instrucción: localización de objetivos de acción a partir de una orden en lenguaje natural (por ejemplo, "pulsa el botón de enviar").
- Clasificación fina de componentes según una taxonomía de 71 etiquetas en 9 grupos padre, incluyendo estados y elementos truncados.
- Generación estructurada de UI en DSL JSON renderizable, con renderizado progresivo.
- Generación de pantallas completas a partir de descripciones (por ejemplo, tarjetas de póster o pantallas de login, según los ejemplos cualitativos de la model card).
- Inferencia y serving compatibles con Transformers (4.57+) y vLLM (0.11+).
- Renderizado opcional de capturas mediante Playwright y Chromium.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Agentes de automatización móvil: el modelo puede recibir una captura de pantalla y una instrucción ("abre ajustes y desactiva el Wi-Fi") y devolver la coordenada del elemento objetivo mediante GUI grounding condicionado, lo que permite a un agente ejecutar la acción sin depender de selectores de accesibilidad frágiles.
- Testing de regresión visual de aplicaciones: dado un par de capturas, el dense grounding permite enumerar y localizar elementos para comparar su presencia, posición y estado entre versiones, detectando regresiones de layout de forma automática.
- Generación de prototipos de pantallas: a partir de una descripción textual, el modelo produce un DSL JSON renderizable con Playwright, útil para generar maquetas rápidas de pantallas móviles antes de la implementación real.
- Extracción estructurada de información de capturas: la taxonomía de 71 etiquetas permite clasificar cada componente (botón, campo de texto, pestaña, elemento truncado) y volcar la jerarquía a JSON para alimentar pipelines de documentación o auditoría de UI.
- Asistentes de accesibilidad: el modelo puede describir regiones concretas de una pantalla mediante referring, lo que sirve para generar descripciones textuales de elementos para usuarios con discapacidad visual.
- Evaluación automática de calidad de UI generada: la fase render-aware GRPO está orientada a puntuar y comparar renders; el modelo puede integrarse en un bucle de evaluación que puntúe propuestas de diseño generadas por otros sistemas.
- Investigación en comprensión de GUI: al ser un modelo compacto de 4B con pesos abiertos y licencia Apache 2.0, es adecuado como baseline reproducible en experimentos de grounding y generación de UI sin requerir clústeres de GPU de gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en formato numérico en la información disponible. La model card incluye gráficos de resultados (precisión en referring, F1 en dense grounding, precisión en GUI grounding sobre ScreenSpot-V2 Mobile y puntuaciones compuestas de generación de UI) con los 12 mejores sistemas por métrica bajo el protocolo de evaluación del paper, pero los valores concretos no se proporcionan como texto y no se reproducen aquí para no inventar cifras. El paper asociado (enlace en la sección de enlaces) es la fuente para obtener los números.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un modelo multimodal de 4B en safetensors, la inferencia en FP16 requiere aproximadamente 8-9 GB de VRAM solo para pesos, más el coste del codificador visual y del KV cache; en cuantización de 8 bits bajaría a unos 4-5 GB y en 4 bits a unos 2,5-3 GB, aunque estas cifras no están confirmadas por el autor.
- GPU recomendadas: no especificadas. Por tamaño, una RTX 4090 (24 GB) o una A100/H100 son holgadas para FP16; una RTX 3090/4080 (16-24 GB) también debería ser suficiente.
- ¿Cabe en GPU consumer? Sí, previsiblemente en GPUs con 8 GB o más en cuantización, y en 16-24 GB en FP16, aunque no hay confirmación oficial.
- Opciones de despliegue: Transformers (4.57+) y vLLM (0.11+), según la model card. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| UI-UG2-4B | 4B | no disponible | Comprensión y generación de UI móvil sobre Qwen3-VL | Apache 2.0 | HuggingFace, GitHub |
| UI-UG-7B (versión anterior del mismo equipo) | 7B | no disponible | Comprensión y generación de UI sobre Qwen2.5-VL, taxonomía de 20 clases, DPO offline | Apache 2.0 | HuggingFace, GitHub |
| UI-UG-7B-2601 (versión anterior del mismo equipo) | 7B | no disponible | Variante de UI-UG-7B | Apache 2.0 | HuggingFace |
| Qwen3-VL-4B (backbone base) | 4B | no disponible | Modelo multimodal generalista | Apache 2.0 (según Qwen) | HuggingFace |

La comparación con modelos de otros equipos especializados en UI (por ejemplo, familias de agentes GUI) no está disponible en la información proporcionada. Los gráficos de la model card incluyen comparaciones cualitativas y por métricas con otros sistemas, pero sin cifras textuales.

## Limitaciones y advertencias

- La información pública es escasa: no se documentan contexto máximo, idiomas, composición del dataset ni detalles del juez usado en GRPO, lo que dificulta evaluar su robustez antes de desplegarlo.
- El campo de parámetros de safetensors del repo (569.856) es inconsistente con la denominación "4B" y con el tamaño del repositorio (8,9 GB); conviene verificar los pesos antes de usarlos en producción.
- El modelo está especializado en UI móvil; su rendimiento fuera de ese dominio (texto general, visión natural) no está documentado y probablemente sea inferior al del backbone Qwen3-VL sin ajustar.
- Riesgo de alucinación en la generación de DSL: puede producir estructuras JSON sintácticamente válidas pero con componentes o layouts inexistentes; la fase render-aware mitiga pero no elimina este problema.
- La precisión del grounding depende de la resolución y calidad de la captura; no se documentan límites de resolución ni comportamiento con capturas degradadas.
- No se documentan sesgos conocidos; al entrenarse sobre interfaces, puede heredar sesgos de diseño de las plataformas representadas en el dataset.
- Licencia Apache 2.0 permite uso comercial, pero el modelo deriva de Qwen3-VL, cuyos términos conviene revisar por si imponen condiciones adicionales.
- El código de entrenamiento no se distribuye, lo que limita la reproducibilidad y el ajuste fino por parte de terceros.
- No se documenta soporte de tool calling ni de agentes multi-paso nativos; cualquier uso agéntico requiere orquestación externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/afx-team/UI-UG2-4B
- Repositorio GitHub: https://github.com/afx-team/UI-UG
- Paper UI-UG2 (PDF): https://github.com/afx-team/UI-UG/blob/main/papers/UI-UG2.pdf
- Paper UI-UG1 (arXiv): https://arxiv.org/abs/2509.24361
- Modelo UI-UG-7B: https://huggingface.co/afx-team/UI-UG-7B
- Modelo UI-UG-7B-2601: https://huggingface.co/afx-team/UI-UG-7B-2601
- Archivo UI-UG1: https://github.com/afx-team/UI-UG/blob/main/uiug_v1/README.md
- Guía de instalación de Qwen3-VL: https://github.com/QwenLM/Qwen3-VL
