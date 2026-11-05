# qhoenix/zils-mini-onejev15

## Resumen

OneJev1.5-4B es un modelo multimodal de decisión de tipo "System One" desarrollado por el equipo OmniJev (publicado en HuggingFace bajo el identificador `qhoenix/zils-mini-onejev15`). A diferencia de los modelos generativos convencionales, no produce texto libre: recibe un estado (texto, captura de pantalla, foto o vídeo) junto con un conjunto de preguntas tipadas y devuelve, en un único forward pass, una probabilidad calibrada para cada opción de respuesta. Es, por tanto, un modelo de scoring de decisiones orientado a agentes autónomos y automatización de interfaces.

El modelo es un fine-tune completo de Qwen/Qwen3.5-4B sobre aproximadamente 320.000 preguntas extraídas de ejecuciones reales de agentes, vídeos, imágenes y los splits de entrenamiento de conjuntos de datos públicos de decisión. Con 5.174.964.736 parámetros reales en safetensors (el nombre comercial indica "4B" por el modelo base), se posiciona en la franja de modelos pequeños capaces de ejecutarse en hardware de consumo y despliegues de baja latencia.

Su relevancia actual radica en la creciente demanda de modelos especializados en la toma de decisiones de agentes (GUI agents, automatización de flujos, verificación de condiciones) donde la calibración de probabilidades importa más que la fluidez del texto generado. El modelo se distribuye con licencia Apache 2.0, lo que facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (fine-tune completo de Qwen/Qwen3.5-4B) |
| Parametros totales | 5.174.964.736 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer multimodal con capacidad de procesamiento de imagen y texto, y se somete a un fine-tune completo (no LoRA ni adaptadores) sobre aproximadamente 320.000 preguntas. Estas preguntas provienen de ejecuciones reales de agentes, vídeos, imágenes y los splits de entrenamiento de conjuntos de datos públicos de decisión. El objetivo del entrenamiento no es la generación autoregresiva de texto, sino la producción de probabilidades calibradas para opciones discretas en un único paso hacia adelante.

La innovación principal es el paradigma "System One": el modelo no razona paso a paso ni genera cadenas de pensamiento, sino que evalúa directamente el estado y las opciones, devolviendo una distribución de probabilidad sobre las alternativas. La API de servicio (`qev serve`) expone una interfaz compatible con TypeSafe's System One API, ampliada con un campo `media` para imágenes y vídeo. No se documentan en la información disponible detalles sobre el número exacto de tokens de entrenamiento, la composición precisa del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Evaluación de decisiones con probabilidad calibrada: devuelve una probabilidad por cada opción en un único forward pass, sin generación de texto libre.
- Modalidad multimodal: acepta capturas de pantalla, fotos, vídeo y texto plano como estado de entrada.
- Preguntas tipadas: soporta tipos como `Noul` (verificación booleana de una condición) y `Choice` (selección entre opciones discretas).
- Orientado a agentes GUI: diseñado para decidir la siguiente acción de un agente sobre una interfaz (clic, parada, etc.).
- Procesamiento de vídeo: la model card menciona explícitamente soporte de vídeo como entrada.
- API compatible con TypeSafe's System One API, con extensión para medios.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso en la información disponible.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Automatización de agentes GUI: el modelo recibe una captura de pantalla y una pregunta como "¿qué debe hacer el agente a continuación?" con opciones (clic, parada), devolviendo la probabilidad de cada acción. Es adecuado porque está entrenado sobre ejecuciones reales de agentes.
- Verificación de condiciones en flujos de automatización: mediante preguntas tipo `Noul` ("¿se ha pagado la factura?"), el modelo actúa como comprobador booleano calibrado en pipelines RPA.
- Enrutamiento de decisiones en asistentes conversacionales: dado un estado textual y un conjunto de opciones, selecciona la rama más probable con una puntuación de confianza utilizable para umbrales.
- Análisis de vídeo para decisiones: al aceptar vídeo como entrada, puede evaluar estados temporales en tareas de supervisión o monitorización.
- Evaluación de calidad en pipelines de datos: usar las probabilidades calibradas para filtrar o priorizar ejemplos en conjuntos de entrenamiento o evaluación.
- Sistemas de recomendación de acciones en soporte técnico: dado el estado de una incidencia (texto + captura), puntuar las posibles respuestas o escalados.
- Investigación en calibración de modelos: servir como referencia de modelo pequeño con probabilidades calibradas para estudios comparativos.

## Benchmarks y rendimiento

La model card reporta resultados en el Decision Index 0.3 (parte pública: 37 benchmarks, 140.178 peticiones), evaluado con el kit oficial del board:

| Modelo | Decision Index (parte pública) |
|---|---|
| vLLM-SR d3-mini | 54,90 |
| OneJev1.5-4B | 54,89 |
| CoCo-Decision-4B | 51,93 |
| RSI-Jev v6.1 VL 4B | 50,98 |
| ezjev 4B s2 | 50,82 |

Entre los 83 modelos de menos de 8B parámetros del board, solo vLLM-SR d3-mini supera a OneJev1.5-4B, por 0,01 puntos. OneJev1.5-4B obtiene la mejor puntuación en Language Understanding y Tools & Automation entre los cinco modelos comparados, y la segunda mejor en las otras tres áreas. No se proporcionan en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: con 5.174.964.736 parámetros en safetensors (fp16/bf16), se requieren aproximadamente 10,4 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, alrededor de 12-14 GB en precisión completa.
- Cuantización: no se documentan pesos GGUF ni cuantizaciones oficiales; sería necesario convertir manualmente para reducir VRAM.
- GPU recomendadas: A100, H100 o L40S para despliegue de producción; RTX 4090 (24 GB) cabe con holgura en fp16.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 (24 GB); en GPUs de 16 GB requeriría cuantización no oficial.
- Opciones de despliegue: el autor proporciona `qev serve` (paquete `qev[torch]` desde GitHub) que expone una API compatible con TypeSafe's System One API. No se documenta soporte nativo de vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Decision Index (parte pública) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OneJev1.5-4B | 5,17B | no disponible | 54,89 | Apache 2.0 | HuggingFace |
| vLLM-SR d3-mini | <8B | no disponible | 54,90 | no disponible | no disponible |
| CoCo-Decision-4B | ~4B | no disponible | 51,93 | no disponible | no disponible |
| RSI-Jev v6.1 VL 4B | ~4B | no disponible | 50,98 | no disponible | no disponible |
| ezjev 4B s2 | ~4B | no disponible | 50,82 | no disponible | no disponible |

Los cuatro modelos comparados son los de mayor puntuación del board en la franja de 3B a 6B parámetros; sus puntuaciones corresponden a la parte pública del board a 12 de octubre de 2026. No se dispone de datos de parámetros exactos, contexto ni licencia para los modelos alternativos en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado en decisiones: no es un modelo generativo general; no debe usarse para generación de texto libre, código o conversación abierta.
- Calibración dependiente del dominio: las probabilidades están calibradas sobre los tipos de pregunta del entrenamiento; su fiabilidad fuera de esos dominios no está garantizada.
- Idiomas soportados no documentados: no se especifica qué lenguas cubre el fine-tune, lo que supone un riesgo para despliegues multilingües.
- Longitud de contexto no disponible: no se puede planificar el uso con estados largos (vídeos extensos, historiales largos) sin verificación empírica.
- Riesgo de alucinación en la selección de opciones: al ser un modelo de scoring, puede asignar alta probabilidad a opciones incorrectas en estados ambiguos o fuera de distribución.
- Sesgos: no se documentan análisis de sesgo en la información disponible.
- Dependencia del ecosistema `qev`: el despliegue recomendado usa un paquete específico del autor; la integración con stacks estándar (vLLM, TGI) no está documentada.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Qwen/Qwen3.5-4B debe verificarse por si impone condiciones adicionales.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación comunitaria.

## Enlaces

- HuggingFace: https://huggingface.co/qhoenix/zils-mini-onejev15
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- GitHub del proyecto: https://github.com/OmniJev/OneJev
- Sitio web: https://omnijev.github.io/OneJev/
- Decision Index (Space): https://huggingface.co/spaces/multimodalart/jev-decision-index
- Organización en HuggingFace: https://huggingface.co/OmniJev
- Licencia: https://github.com/OmniJev/OneJev/blob/main/LICENSE
