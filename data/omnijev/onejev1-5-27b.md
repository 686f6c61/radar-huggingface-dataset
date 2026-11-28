# OmniJev/OneJev1.5-27B

## Resumen

OneJev1.5-27B es un modelo multimodal de decisión de tipo "System One" desarrollado por OmniJev. No es un modelo generativo al uso: recibe una captura de pantalla, una foto, un vídeo o texto plano junto con un conjunto de preguntas tipadas y devuelve, en un único forward pass, una probabilidad calibrada para cada opción de respuesta. Está construido como un fine-tune completo (full fine-tune) del modelo base Qwen/Qwen3.8-27B, con 27.356.728.560 parámetros reales según los pesos en safetensors.

El modelo está pensado para ser el componente de toma de decisiones dentro de agentes autónomos, especialmente agentes de interfaz gráfica (GUI agents), donde hace falta estimar de forma fiable el estado de la tarea y la siguiente acción. En lugar de generar texto libre, produce distribuciones de probabilidad sobre opciones discretas (elección múltiple, sí/no, puntuaciones), lo que facilita la calibración y la integración en pipelines deterministas.

Su relevancia actual radica en su posicionamiento en el Decision Index 0.3: con una puntuación de 63,64 sobre 148 modelos evaluados, ocupa el quinto puesto del ranking público y obtiene la mejor puntuación del tablero en Arts & Human Taste. El modelo se distribuye con licencia Apache 2.0 y se sirve mediante la herramienta Flide, que implementa la System One API de TypeSafe con soporte adicional de imágenes y vídeo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (fine-tune completo de Qwen/Qwen3.8-27B); etiqueta de arquitectura qwen3_5 |
| Parametros totales | 27.356.728.560 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline | image-text-to-text |
| Tamano del repositorio | 54,7 GB |
| Modalidad de entrada | Texto, imagen, video |
| Modalidad de salida | Probabilidades calibradas por opcion (no texto generativo) |
| Servidor de referencia | Flide (System One API de TypeSafe) |

## Arquitectura y entrenamiento

OneJev1.5-27B parte de Qwen/Qwen3.8-27B y se ha sometido a un fine-tune completo sobre aproximadamente 320.000 preguntas. Estas preguntas proceden de ejecuciones reales de agentes, vídeos, imágenes y de los splits de entrenamiento de conjuntos de datos públicos de decisión. La arquitectura subyacente es un transformer multimodal con capacidad de procesar texto, imagen y vídeo, adaptado para emitir respuestas estructuradas (probabilidades por opción, probabilidad de sí/no y puntuaciones esperadas) en lugar de secuencias de tokens.

La innovación principal no está en el backbone, sino en la formulación de la tarea: el modelo se entrena como "decision model" de System One, es decir, para producir estimaciones calibradas de forma directa. La model card no detalla la composición exacta del dataset, el número de tokens de entrenamiento ni si se aplicaron técnicas de RLHF o DPO; tampoco se especifican innovaciones de decodificación como decodificación especulativa o atención lineal. El sistema de serving asociado, Flide, implementa la System One API de TypeSafe con un campo `media` para imágenes y vídeo, y está documentado en un paper (arXiv:2610.42148).

## Capacidades

- Toma de decisiones multimodal: recibe capturas de pantalla, fotos, vídeos o texto y devuelve probabilidades calibradas por opción.
- Preguntas tipadas: soporta tipos de pregunta como elección múltiple (`choice`), sí/no (`noul`) y puntuación (`score`).
- Estimación de estado de tarea: puede evaluar si una tarea está completada, el progreso alcanzado o la siguiente acción a tomar.
- Agentes GUI: diseñado específicamente para decidir la siguiente acción en interfaces gráficas (clic, escribir, hacer scroll, detener).
- Procesamiento de vídeo: admite vídeo como modalidad de entrada además de imagen y texto.
- Salida estructurada con probabilidades: permite integrar las decisiones en pipelines que requieran umbrales o calibración.
- Soporte multilingüe: no disponible en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada (el modelo no genera llamadas a herramientas, sino probabilidades sobre opciones).
- Modo thinking: no disponible.

## Casos de uso

- Agentes de automatización de interfaz gráfica: el modelo recibe la captura de pantalla actual y el estado de la tarea, y devuelve la probabilidad de cada acción posible (clic, escribir, scroll, detener). Es adecuado porque está entrenado sobre ejecuciones reales de agentes y produce decisiones calibradas en un solo forward pass.
- Verificación de finalización de tareas: con preguntas de tipo `noul`, el agente puede comprobar si una tarea (por ejemplo, pagar una factura) se ha completado, usando la probabilidad de "sí" como señal de parada.
- Seguimiento de progreso en flujos multi-paso: mediante preguntas de tipo `score`, el sistema estima el grado de avance de una tarea (no iniciada, a medias, casi terminada, terminada), útil para orquestadores que necesitan decidir si continuar o escalar.
- Enrutamiento y selección de opciones en asistentes: dado un contexto textual o visual, el modelo puede puntuar alternativas discretas (por ejemplo, qué herramienta usar o qué categoría asignar) con probabilidades comparables.
- Evaluación automática de calidad multimodal: puede emplearse para puntuar imágenes, vídeos o interacciones según criterios definidos, aprovechando su buena puntuación en Arts & Human Taste del Decision Index.
- Investigación en calibración de modelos: al devolver distribuciones de probabilidad en lugar de texto, es un banco de pruebas útil para estudiar calibración y toma de decisiones en modelos multimodales.
- Moderación o triaje con umbrales: las probabilidades por opción permiten fijar umbrales de confianza y derivar casos dudosos a revisión humana.

## Benchmarks y rendimiento

La model card reporta resultados en el Decision Index 0.3 (parte pública: 37 benchmarks, 140.178 peticiones). La tabla de resultados detallada (contra Jev 1.13, Jev-Omni 12B y Qwen3.8-27B thinking) se presenta como imagen en la model card y no está disponible en formato numérico en la información proporcionada.

| Modelo | Puntuacion Decision Index (parte publica) | Posicion en el tablero |
|---|---|---|
| RSI-Jev v6.1 VL | 65,6 | — |
| vLLM-SR d3 | 65,5 | — |
| Torchcast Decision | 65,1 | — |
| Decider 31B | 64,3 | — |
| OneJev1.5-27B | 63,64 | 5 de 148 |

Los cuatro modelos comparados son los de mayor puntuación en el rango de 25B a 36B parámetros del tablero, con puntuaciones de la parte pública a 12 de octubre de 2026. OneJev1.5-27B obtiene la mejor puntuación del tablero en Arts & Human Taste y la segunda mejor en Language Understanding entre los cinco modelos citados. No se han publicado resultados numéricos de benchmarks clásicos (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 27.356.728.560 parámetros, en precisión completa (BF16) los pesos ocupan aproximadamente 54,7 GB, por lo que se necesita al menos una GPU de 80 GB o varias GPUs para inferencia sin cuantizar.
- GPU recomendadas: para BF16, A100 80 GB, H100 80 GB o configuraciones multi-GPU. No se especifican requisitos oficiales en la model card.
- GPU de consumo: no se confirma compatibilidad con RTX 4090 (24 GB) en precisión completa; requeriría cuantización, cuyos formatos no están documentados.
- Opciones de despliegue: el método de referencia es Flide (`flide serve --model OmniJev/OneJev1.5-27B`), que implementa la System One API de TypeSafe. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Decision Index (parte publica) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OneJev1.5-27B | 27,36B | No disponible | 63,64 | Apache 2.0 | Hugging Face (OmniJev/OneJev1.5-27B) |
| RSI-Jev v6.1 VL | No disponible | No disponible | 65,6 | No disponible | No disponible |
| vLLM-SR d3 | No disponible | No disponible | 65,5 | No disponible | No disponible |
| Torchcast Decision | No disponible | No disponible | 65,1 | No disponible | No disponible |
| Decider 31B | 31B | No disponible | 64,3 | No disponible | No disponible |

Los datos de los modelos comparables provienen únicamente de la tabla del Decision Index citada en la model card; no se dispone de sus especificaciones técnicas completas.

## Limitaciones y advertencias

- El modelo no es generativo: no produce texto libre ni llamadas a herramientas, sino probabilidades sobre opciones predefinidas. No es adecuado para tareas de generación abierta.
- Riesgo de calibración deficiente fuera de distribución: aunque se entrena para calibrar, las preguntas de tipos no vistos o los dominios alejados de los datos de entrenamiento pueden degradar la fiabilidad de las probabilidades.
- Sesgos: no se documentan sesgos conocidos en la información proporcionada; al derivar de Qwen3.8-27B, podría heredar sesgos del modelo base, pero no se confirma.
- Idiomas soportados: no disponibles; no se garantiza un rendimiento multilingüe más allá de lo que herede del modelo base.
- Longitud de contexto: no disponible, lo que dificulta planificar su uso en documentos o vídeos largos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen/Qwen3.8-27B.
- Dependencia de Flide: el flujo de referencia requiere la herramienta Flide y su API específica; la integración con otros servidores no está documentada.
- Madurez: el modelo tiene pocas descargas (188) y likes (3), y fue creado en octubre de 2026, por lo que la comunidad y el soporte son limitados.
- Datos de benchmarks incompletos: los resultados detallados se presentan como imágenes y no como cifras verificables en la información disponible.

## Enlaces

- [Hugging Face: OmniJev/OneJev1.5-27B](https://huggingface.co/OmniJev/OneJev1.5-27B)
- [Perfil de OmniJev en Hugging Face](https://huggingface.co/OmniJev)
- [Repositorio GitHub: OmniJev/OneJev](https://github.com/OmniJev/OneJev)
- [Sitio web del proyecto OneJev](https://omnijev.github.io/OneJev/)
- [Paper de Flide (arXiv:2610.42148)](https://arxiv.org/abs/2610.42148)
- [Repositorio GitHub: Flide](https://github.com/OmniJev/Flide)
- [Decision Index 0.3 (Space)](https://huggingface.co/spaces/multimodalart/jev-decision-index)
- [Modelo base: Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Licencia Apache 2.0](https://github.com/OmniJev/OneJev/blob/main/LICENSE)
