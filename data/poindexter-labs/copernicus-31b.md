# Poindexter-Labs/Copernicus-31B

## Resumen

Copernicus-31B es un modelo de 31.273.088.876 parámetros desarrollado por Poindexter Labs, presentado como un "modelo de decisión system-one". No está pensado para generar texto libre, sino para evaluar un estado o conversación frente a preguntas estructuradas y devolver decisiones con tipos de respuesta explícitos (`choice`, `noul`, `score`) junto con probabilidades y niveles de confianza. Se sirve a través de una interfaz propia compatible con el endpoint `/v1/systemone`, implementada en los archivos de referencia `copernicus_server.py` y `copernicus_layout.py`.

El modelo es un merge de dos checkpoints previos, `PelaAI/KnowLine-31B-Gen1` y `sthanika-ai/Sieve-31B-v3`, ambos derivados a su vez de `google/gemma-4-31B-it`, por lo que hereda la arquitectura de la familia Gemma 4 y capacidades multimodales de tipo image-text-to-text. Su etiqueta de pipeline en Hugging Face es `text-classification` y el idioma declarado es únicamente inglés.

Su relevancia actual radica en la propuesta de empaquetar un LLM grande como motor de decisión estructurada para enrutamiento de agentes, selección de herramientas, clasificación y flujos de verificación, en lugar de forzar al sistema consumidor a interpretar respuestas en lenguaje natural. Según la model card, Copernicus-31B obtuvo 72,1 puntos en el Jev Decision Index a fecha de 12 de noviembre de 2026, empatado en segunda posición.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal basada en google/gemma-4-31B-it (familia Gemma 4); resultado de un merge de modelos |
| Parametros totales | 31.273.088.876 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo publicado en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

Copernicus-31B no se entrena desde cero: es un merge de pesos de dos modelos de 31B (`PelaAI/KnowLine-31B-Gen1` y `sthanika-ai/Sieve-31B-v3`), ambos construidos sobre `google/gemma-4-31B-it`. Por tanto, la arquitectura subyacente es la de Gemma 4 en su variante de 31B con capacidades image-text-to-text, aunque la model card no detalla la composición exacta del merge, la proporción de pesos ni la metodología (por ejemplo, si fue un merge lineal, SLERP o TIES).

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste supervisado posteriores al merge. La innovación declarada no es arquitectónica sino de interfaz: el modelo se expone mediante un servidor que formula preguntas tipadas (`choice`, `noul`, `score`) y devuelve distribuciones de probabilidad sobre las opciones, con soporte para coordenadas de cajas (`--box-coords yxyx`), lo que sugiere uso sobre entradas con regiones visuales.

## Capacidades

- Evaluación de decisiones de tipo `choice`: selecciona una opción de un conjunto explícito y devuelve la clave elegida, las probabilidades por opción y la confianza.
- Evaluación de proposiciones de tipo `noul`: devuelve la probabilidad de que una afirmación sea verdadera (sí/no).
- Puntuación de tipo `score`: evalúa un ítem contra una rúbrica ordenada y devuelve puntuación esperada, probabilidades por nivel y confianza.
- Procesamiento multimodal image-text-to-text heredado de Gemma 4, con soporte de coordenadas de caja en formato `yxyx` en el adaptador SGLang.
- Clasificación estructurada de texto y conversaciones multi-turno como estado de entrada.
- Enrutamiento de agentes y selección de herramientas mediante preguntas de elección.
- Flujos de verificación y evaluación de evidencia.
- No se documenta soporte explícito de function calling genérico, modo thinking ni generación de texto libre como capacidad principal.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma declarada.

## Casos de uso

- Enrutamiento de agentes: dado el estado de una conversación, plantear una pregunta `choice` con las rutas disponibles (por ejemplo, "facturación", "soporte técnico", "cancelaciones") y usar la probabilidad devuelta para decidir el siguiente paso del agente, con umbral de confianza para derivar a revisión humana.
- Selección de herramientas en pipelines de agentes: definir como opciones las herramientas registradas y consultar al modelo con el contexto acumulado; la distribución de probabilidad permite implementar fallback cuando ninguna opción supera un umbral.
- Clasificación de tickets de soporte: usar `choice` para asignar categoría y `score` para prioridad sobre una rúbrica ordenada, sustituyendo heurísticas por una evaluación probabilística con confianza explícita.
- Verificación de afirmaciones: plantear preguntas `noul` del tipo "¿la respuesta cita una fuente verificable?" o "¿el importe reclamado coincide con el de la factura?" para construir un verificador automático en pipelines de control de calidad.
- Evaluación de evidencia en investigación: puntuar fragmentos recuperados contra una rúbrica de relevancia (`score`) antes de pasarlos a un generador, mejorando la selección en sistemas RAG.
- Moderación y control de calidad: evaluar respuestas generadas por otro modelo con preguntas booleanas (`noul`) sobre toxicidad, fidelidad al contexto o cumplimiento de políticas, usando la probabilidad como señal continua en lugar de un umbral binario.
- Prototipado de investigación en toma de decisiones: el servidor de referencia permite experimentar con decisiones estructuradas sobre estados multimodales (texto e imagen con cajas) sin construir un parser de lenguaje natural.

## Benchmarks y rendimiento

| Benchmark | Copernicus-31B | Copernicus-57B | Posición |
|---|---|---|---|
| Jev Decision Index (global, 12-11-2026) | 72,1 | 71,8 | 2.ª posición (empate) |
| Jev Decision Index (solo público, 12-11-2026) | no disponible | 75,3 | 1.ª posición (57B) |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- El repositorio ocupa 62,6 GB en safetensors, lo que corresponde a pesos en bf16/fp16 para 31,27B parámetros.
- Inferencia en precisión completa: se necesitan aproximadamente 63 GB solo para pesos, más memoria para KV cache y activaciones; en la práctica, un nodo con 4×A100 80GB o 2×H100 80GB ofrece margen suficiente.
- Cuantización a 8 bits: en torno a 32-35 GB de VRAM, viable en una A100 80GB o H100 80GB; a 4 bits, en torno a 18-20 GB, potencialmente viable en una RTX 4090 de 24 GB, aunque no se publican variantes cuantizadas oficiales.
- No cabe en GPUs de consumo de gama media (16 GB o menos) sin cuantización agresiva no soportada oficialmente.
- Opciones de despliegue documentadas: backend Hugging Face Transformers en proceso (`--backend hf`) y backend SGLang como servidor separado (`--backend sglang`), ambos a través del adaptador `copernicus_server.py`.
- No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Copernicus-31B | 31,27B | no disponible | Decisión estructurada (choice/noul/score) sobre base Gemma 4 | apache-2.0 | Hugging Face, 401 descargas |
| Copernicus-57B | no disponible en la información | no disponible | Decisión estructurada; 71,8 en Jev Decision Index global y 75,3 en el ranking público | no disponible | Hugging Face (Poindexter-Labs) |
| google/gemma-4-31B-it | ~31B | no disponible | LLM multimodal instructivo de propósito general | licencia Gemma (no apache-2.0) | Hugging Face |
| PelaAI/KnowLine-31B-Gen1 | ~31B | no disponible | Modelo base del merge | no disponible | Hugging Face |
| sthanika-ai/Sieve-31B-v3 | ~31B | no disponible | Modelo base del merge | no disponible | Hugging Face |

No se dispone de datos de benchmarks comunes (MMLU, HumanEval, GSM8K) para comparar directamente con alternativas de la misma categoría.

## Limitaciones y advertencias

- El modelo está declarado únicamente para inglés; su uso en castellano u otros idiomas no está validado.
- Al ser un merge de dos checkpoints sin documentación del proceso, el comportamiento puede presentar inconsistencias no caracterizadas respecto a los modelos de origen.
- La model card advierte explícitamente de que la idoneidad para producción debe establecerse mediante evaluación específica de la tarea; no se ofrecen garantías de robustez.
- Riesgo de alucinación inherente a la base Gemma 4, especialmente en preguntas `noul` sobre hechos no presentes en el estado de entrada.
- Sesgos conocidos: no documentados en la información disponible; se heredan los de los modelos base y sus datos de entrenamiento.
- La licencia apache-2.0 del checkpoint no exime de revisar las condiciones de los modelos de origen (Gemma 4 y los merges intermedios) antes de un uso comercial.
- El endpoint `/v1/systemone` y los scripts de servidor son una implementación de referencia, no un servicio gestionado; el soporte de SGLang depende de que su cargador acepte el checkpoint publicado.
- Longitud de contexto no declarada: planificar los prompts asumiendo límites conservadores hasta verificación empírica.
- Solo 4 likes y 401 descargas en el momento de la ficha: ecosistema pequeño, poca validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Poindexter-Labs/Copernicus-31B
- Web de Poindexter Labs: https://www.poindexterlabs.ai/
- Jev Decision Index (Space): https://huggingface.co/spaces/multimodalart/jev-decision-index
- Modelo base 1: https://huggingface.co/PelaAI/KnowLine-31B-Gen1
- Modelo base 2: https://huggingface.co/sthanika-ai/Sieve-31B-v3
- Modelo original: https://huggingface.co/google/gemma-4-31B-it
- Modelo hermano: https://huggingface.co/Poindexter-Labs/Copernicus-57B
- Atribución (referenciada en la model card): ATTRIBUTION.md dentro del repositorio del modelo
