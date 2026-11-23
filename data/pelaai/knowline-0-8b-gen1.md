# PelaAI/KnowLine-0.8B-Gen1

## Resumen

KnowLine-0.8B-Gen1 es un modelo de decisión de 0,8B parámetros desarrollado por PelaAI, afinado a partir de Qwen/Qwen3.5-0.8B. No es un modelo generativo al uso: mapea un estado estructurado y una o varias preguntas tipadas (elección entre opciones, sí/no y puntuación ordenada) a probabilidades sobre las opciones suministradas. En lugar de generar texto libre, lee directamente la probabilidad de cada etiqueta de opción, lo que lo convierte en un clasificador probabilístico calibrado en lugar de un chatbot.

El modelo está pensado para integrarse como componente de decisión en pipelines que necesitan salidas estructuradas y probabilidades fiables, no prosa. Su tamaño reducido (852.985.920 parámetros reales en safetensors) y su latencia (24,6 ms de mediana en una H20) lo hacen apto para despliegues de alto volumen. La licencia Apache-2.0 y el soporte de `transformers` facilitan su adopción.

Se publica junto a KnowLine-2B-Gen1, KnowLine-9B-Gen1 y KnowLine-4B-Gen5.5. La model card reporta Decision Index 0.3 público de 44,51 en ejecución propia con el kit oficial, y una temperatura de lectura T = 1,54 plegada en los pesos para calibrar las probabilidades (ECE 0,008-0,012).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3.5-0.8B), con torre de visión heredada del modelo base |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la model card menciona lectura doble para peticiones de hasta 3.000 tokens) |
| Tipos de cuantizacion | no disponible (el checkpoint se publica en bf16; no se listan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B y se afina mediante una época de LoRA SFT con rango 32 y alpha 64, aplicado únicamente a las capas lineales del modelo de lenguaje, fusionado después en pesos bf16. Las filas de entrenamiento tienen como máximo 12.288 tokens. El checkpoint publicado corresponde al final del entrenamiento. Los ejemplos de entrenamiento incluyen tareas de decisión escritas y etiquetadas por profesores LLM. La torre de visión es la del modelo base y no recibió entrenamiento con imágenes.

La innovación principal es el mecanismo de lectura: se ajusta una temperatura de lectura T = 1,54 sobre datos de validación y se pliega en `model.language_model.norm.weight`, de modo que el front end lee a temperatura 1. Para las preguntas de puntuación, `temperatures.json` divide los logits por 0,6494 (= 1/1,54), de forma que se leen a temperatura efectiva 1,0. El front end (`knowline_server.py`, `knowline_engine.py`, `knowline_layout.py`) renderiza los prompts con `enable_thinking=False`; el chat template de Qwen3.5-0.8B incluido activa el pensamiento por defecto, por lo que es necesario desactivarlo si se construyen prompts manualmente. Las peticiones cortas de solo texto (hasta 3.000 tokens) se leen dos veces.

## Capacidades

- Preguntas de elección con opciones nombradas: devuelve probabilidad por cada opción.
- Preguntas de sí/no (tipo `noul` en el ejemplo de la model card).
- Preguntas de puntuación ordenada, leídas a temperatura efectiva 1,0.
- Salida probabilística calibrada (ECE 0,008-0,012 según método del board en la suite pública).
- No genera texto libre cuando responde: la respuesta es una distribución sobre las opciones suministradas.
- Soporte de entrada image-text-to-text (pipeline declarado), con torre de visión heredada del modelo base sin entrenamiento específico en imágenes.
- Idiomas: inglés y chino.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso agéntico en la información disponible.

## Casos de uso

- Enrutado de tickets de soporte: con un estado textual y opciones de equipo (`billing`, `support`, etc.), el modelo devuelve la probabilidad de cada cola y permite umbralizar o derivar a revisión humana cuando la confianza es baja. El ejemplo de la model card cubre exactamente este escenario.
- Decisión de reembolsos y disputas: preguntas de sí/no con probabilidad calibrada permiten fijar políticas de autoaprobación por umbral (por ejemplo, aprobar automáticamente si P(sí) > 0,9) y escalar el resto.
- Moderación y clasificación de contenido: preguntas de elección entre categorías predefinidas con salida probabilística, útil para pipelines que necesitan puntuaciones comparables entre clases y no texto generado.
- Triaje en atención al cliente: combinación de varias preguntas tipadas sobre un mismo estado (urgencia como puntuación ordenada, categoría como elección, escalado como sí/no) en una sola petición estructurada.
- Extracción de señales en analítica de conversaciones: clasificar cada turno o mensaje con preguntas cerradas y agregar las probabilidades para construir métricas (sentimiento ordenado, intención, riesgo) sin postprocesar texto libre.
- Evaluación automática de respuestas: usar preguntas de puntuación ordenada para valorar calidad, relevancia o cumplimiento de criterios sobre pares estado/pregunta, con calibración que permite comparar puntuaciones entre lotes.
- Despliegue de alto volumen y baja latencia: con 24,6 ms de mediana por petición en una H20, encaja en servicios que procesan cientos de decisiones por segundo por instancia y donde un modelo generativo sería demasiado costoso.

## Benchmarks y rendimiento

| Suite / medición | KnowLine-0.8B-Gen1 | KnowLine-2B-Gen1 | Fuente |
|---|---:|---:|---|
| Decision Index 0.3 público | 44,51 | no disponible | ejecución propia, kit oficial |
| Decision Index 0.3 raw index | 58,35 | no disponible | ejecución propia |
| C-Eval (4 categorías, macro) | 56,3 | 67,0 | model card |
| JevBench | 71,9 | 77,5 | model card |
| JevBench-hard | 49,5 | 55,9 | model card |
| S1MB (English v1), Task Avg | 34,17 (137 benchmarks, 26.269 decisiones) | no disponible | ejecución local |

Detalles de la ejecución del Decision Index 0.3: 140.620 peticiones enviadas, 140.178 puntuables, 0 errores y 0 no soportadas; latencia por petición en una H20 de 24,6 ms mediana, 39,6 ms media y 117,3 ms percentil 95; cuatro servidores H20 idénticos con 32 shards de cliente, sin reintentos ni truncamiento. El score DI 0.4.1 completo del board no está disponible para este modelo (procede de la ejecución privada de los mantenedores).

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 1,7 GB solo para pesos (852.985.920 parámetros × 2 bytes), más overhead de activaciones y KV cache; el repositorio ocupa 1,8 GB.
- Cabe en GPU de consumo: cualquier GPU con 4 GB o más de VRAM en bf16 (RTX 3060, RTX 4060, RTX 4090, etc.). No se documentan cuantizaciones oficiales, pero al ser un checkpoint `transformers` estándar es convertible a GGUF/AWQ/GPTQ con herramientas externas.
- GPU de datacenter recomendadas: H20 es la hardware de referencia de las mediciones; A100 y H100 son igualmente válidas.
- Despliegue: el autor proporciona un front end propio sobre SGLang 0.5.21 (`serve_knowline.sh`, endpoint `/v1/systemone`), además de compatibilidad con `transformers`. No se documenta soporte nativo de vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia medida: 24,6 ms mediana, 39,6 ms media y 117,3 ms p95 por petición en una H20, una petición a la vez. No se publica throughput agregado.

## Comparativa con modelos similares

Datos del snapshot del board Decision Index (multimodalart/jev-decision-index @ c130faf6, generado el 2026-10-29):

| Modelo | Tamano | DI 0.3 publico | DI 0.4.1 full | Fuente |
|---|---:|---:|---:|---|
| **KnowLine-0.8B-Gen1** | 0,8B | **44,51** | no puntuado | ejecución propia, kit oficial |
| GLiClass v4 edge | 0,4B | 47,49 | 31,21 | board |
| OneJev1.6-0.8B | 0,9B | 48,76 | 29,58 | board |
| crystal-0.8b | 0,9B | 42,79 | 29,37 | board |
| vLLM-SR vela3-fast | 0,4B | 50,36 | 29,27 | board |
| StartLux-Decision v1.1 0.8B | 0,9B | 53,79 | 28,88 | board |

KnowLine-0.8B-Gen1 queda por debajo de la mayoría de alternativas en el índice público 0.3, pero su DI 0.4.1 completo aún no está puntuado; el resto de modelos del board obtienen entre 28,88 y 31,21 en esa métrica. La comparación directa en la métrica completa requiere esperar la puntuación oficial. En contexto, idiomas y licencia, todas las alternativas listadas son de tamaño similar (0,4B-0,9B); no se dispone de datos de contexto, licencia ni disponibilidad de esas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El modelo no genera texto libre: solo devuelve distribuciones sobre opciones suministradas. No sirve para tareas generativas.
- Solo soporta inglés y chino; no hay evidencia de rendimiento en castellano.
- La torre de visión no fue entrenada con imágenes; el pipeline image-text-to-text está declarado pero las capacidades visuales son las del modelo base sin ajuste específico.
- El pensamiento está activado por defecto en el chat template de Qwen3.5-0.8B incluido; si se construyen prompts manualmente hay que pasar `enable_thinking=False` o los resultados se desviarán de los reportados.
- Las probabilidades están calibradas con una temperatura plegada en los pesos; modificar los pesos, cuantizar o alterar la normalización invalida la calibración (ECE reportado 0,008-0,012).
- Los datos de entrenamiento no están publicados, lo que limita la auditoría de sesgos. No se documentan sesgos conocidos en la información disponible.
- Riesgo de alucinación estructural: al leer probabilidades sobre etiquetas, el modelo puede asignar alta confianza a opciones incorrectas si el estado de entrada es ambiguo o está fuera de distribución.
- El DI 0.3 reportado es una ejecución propia con hardware H20, no la hardware de referencia del board; el DI 0.4.1 completo no está disponible.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-0.8B.
- No se documenta soporte de tool calling, agentes ni multi-step reasoning; no debe asumirse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PelaAI/KnowLine-0.8B-Gen1
- Notas de inferencia (INFERENCE.md): referenciado en la model card dentro del repositorio
- README en chino (README.zh.md): referenciado en la model card dentro del repositorio
- KnowLine-2B-Gen1: https://huggingface.co/PelaAI/KnowLine-2B-Gen1
- KnowLine-9B-Gen1: https://huggingface.co/PelaAI/KnowLine-9B-Gen1
- KnowLine-4B-Gen5.5: https://huggingface.co/PelaAI/KnowLine-4B-Gen5.5
- Modelo base Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Board Decision Index (snapshot): multimodalart/jev-decision-index @ c130faf6
