# Kausp11/querylm-wiki-360m-sft-search

## Resumen

QueryLM 360M (Wikipedia), variante search fine-tuned, es un modelo de lenguaje causal de 361,8 millones de parámetros desarrollado por el usuario Kausp11 y publicado en Hugging Face. Se trata de un ajuste fino supervisado (SFT) del modelo base `Kausp11/querylm-wiki-360m`, orientado a conversación y a la emisión de consultas de búsqueda dentro del propio flujo de generación. Su propuesta es poco habitual: el modelo ha sido preentrenado desde cero sobre texto de Wikipedia con bloques de búsqueda insertados en línea, de modo que aprende a escribir consultas y a leer pasajes recuperados como si fueran parte del texto ordinario.

La arquitectura sigue la configuración de SmolLM2-360M (32 capas, anchura 960, 15 cabezas de atención) con una longitud de contexto de 4.096 tokens. El vocabulario es el tokenizador de SmolLM2 ampliado con cuatro tokens especiales (`<WEB_QUERY>`, `</WEB_QUERY>`, `<WEB_RESPONSE>`, `</WEB_RESPONSE>`), hasta un total de 49.156 entradas. Los pesos se cargan con `transformers` estándar mediante `LlamaForCausalLM`, sin código personalizado.

Su relevancia actual reside en que ejemplifica un patrón de "búsqueda nativa" en modelos pequeños: en lugar de depender de un orquestador externo que decida cuándo buscar, el propio modelo abre un bloque de consulta, el sistema externo ejecuta la recuperación y el modelo continúa la generación con el pasaje insertado. Es un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, pensado más como demostración de concepto que como modelo de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (configuración SmolLM2-360M: 32 capas, anchura 960, 15 cabezas) |
| Parámetros totales | 361.824.960 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; bf16 en el ejemplo de la model card) |
| Idiomas soportados | inglés (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Vocabulario | 49.156 tokens (tokenizador SmolLM2 + 4 tokens especiales) |
| Modelo base | Kausp11/querylm-wiki-360m |
| Tamaño del repositorio | 0,7 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con la configuración de SmolLM2-360M, entrenado desde cero (no es un ajuste de SmolLM2, sino una arquitectura equivalente con pesos propios). El preentrenamiento se realizó sobre Wikipedia en inglés: 4.885.877 artículos, con 54.582 adicionales reservados para evaluación. El texto fue anotado con bloques de búsqueda por un modelo anotador (Gemma 4 E4B-it con un adaptador LoRA), que marca posiciones donde una búsqueda resultaría útil (probabilidad de inserción de al menos 0,05 y separación mínima de 40 caracteres) y redacta una consulta de como máximo 24 tokens. Los pasajes provienen de recuperación BM25 sobre el corpus web público Sphere y se acortan mediante limpieza extractiva; una inserción solo se conserva si el pasaje solapa con el texto posterior del documento (ROUGE-1 F1 de al menos 0,1 frente a los siguientes 260 caracteres).

El presupuesto de preentrenamiento fue de 31.860 actualizaciones con lotes de 256 secuencias de 4.096 tokens (1.048.576 tokens por actualización), 33,4B tokens procesados en total (16,0B tokens de documento), 4 épocas, optimizador AdamW con LR pico 5e-4, weight decay 0,1, warmup del 2 % y decaimiento coseno, en bf16. El ajuste fino posterior (esta variante) usó unas 53.000 conversaciones usuario-asistente: aproximadamente el 64 % para habilidades de chat general (subconjuntos de SmolTalk), el 15 % para tool calling (subconjuntos de SmolTalk2) sin búsqueda, y el 21 % restante son conversaciones de SmolTalk cuyos turnos del asistente fueron anotados con bloques de búsqueda por el mismo pipeline (38.436 bloques en 9.713 conversaciones). En total, 35,2M tokens empaquetados en secuencias de 4.096 tokens, con pérdida sobre el texto del asistente, las consultas y el fin de turno. Se usó un AdamW nuevo con LR pico 2e-5, warmup del 3 %, decaimiento coseno y 134 actualizaciones de 64 secuencias (una época). La innovación destacable es el formato de bloques de búsqueda en línea con pérdida selectiva: los tags de respuesta y el pasaje no contribuyen a la pérdida, de modo que el modelo aprende a emitir consultas pero no a generar pasajes.

## Capacidades

- Generación de texto causal en inglés, utilizable como modelo estándar sin búsqueda.
- Emisión de consultas de búsqueda dentro de bloques `<WEB_QUERY>...</WEB_QUERY>` cuando se le induce a ello.
- Lectura de pasajes recuperados insertados en `<WEB_RESPONSE>...</WEB_RESPONSE>` y continuación de la respuesta condicionada por ellos.
- Conversación multi-turno en formato de texto plano con prefijos `System:`, `User:` y `Assistant:`, separando turnos con una línea en blanco (sin chat template).
- Tool calling: parte del ajuste fino (15 % de los datos, subconjuntos de SmolTalk2) enseña habilidades de llamada a herramientas, aunque la model card no detalla el formato exacto.
- Razonamiento multi-paso limitado por el tamaño del modelo y por el contexto de 4.096 tokens.
- No dispone de visión, audio ni modo de pensamiento explícito.
- Capacidad multilingüe: únicamente inglés según los metadatos y los datos de entrenamiento.

## Casos de uso

- Demostración de búsqueda nativa en modelos pequeños: integrar el modelo en un pipeline donde el orquestador detecte el bloque `<WEB_QUERY>`, ejecute una recuperación BM25 o una API de búsqueda web y reinyecte el pasaje en `<WEB_RESPONSE>` antes de continuar la generación. Es el caso de uso principal y el que la model card documenta con un script funcional.
- Prototipado de asistentes con recuperación aumentada (RAG) en entornos con recursos muy limitados: con 361,8M de parámetros y 0,7 GB de pesos en bf16, cabe en CPU y en GPUs de gama baja, lo que permite iterar sobre el diseño del bucle de búsqueda sin infraestructura dedicada.
- Investigación sobre formatos de interleaving de recuperación: el modelo sirve como banco de pruebas para estudiar cómo un modelo pequeño aprende a decidir cuándo buscar y cómo condiciona su respuesta al pasaje recuperado, con un pipeline de anotación reproducible documentado.
- Generación de preguntas y consultas de búsqueda para sistemas de QA: el modelo puede producir consultas cortas (máximo 24 tokens en entrenamiento) a partir de una pregunta del usuario, reutilizables en un recuperador externo independientemente de la respuesta final.
- Experimentos de destilación y comparación de arquitecturas: al ser un transformer de 360M entrenado desde cero con 33,4B tokens, es un punto de referencia útil para comparar recetas de preentrenamiento a pequeña escala frente a SmolLM2 u otros modelos de tamaño similar.
- Educación y divulgación técnica: el código de ejemplo de la model card (generación de consulta, recuperación simulada, respuesta) ilustra de forma compacta el funcionamiento de un bucle de búsqueda generativa sin necesidad de infraestructura compleja.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones de calidad de respuesta; únicamente muestra la salida de un script de ejemplo con un pasaje fijo, que el propio autor advierte que demuestra la mecánica y no la precisión del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 0,75-1 GB para los pesos (361,8M parámetros), más overhead de activaciones y caché KV; en la práctica, menos de 2 GB para contextos moderados.
- En cuantización de 8 bits: alrededor de 0,4 GB de pesos; en 4 bits, alrededor de 0,25 GB (estimaciones teóricas, no verificadas en la información disponible).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060, RTX 4060, RTX 4090); también funciona en CPU, como demuestra el ejemplo de la model card ejecutado en CPU con bfloat16 y torch 2.8.0.
- Cabe holgadamente en GPUs consumer e incluso en entornos integrados con suficiente memoria.
- Opciones de despliegue: `transformers` estándar (documentado), y por compatibilidad de arquitectura Llama/SmolLM2, potencialmente vLLM, TGI, llama.cpp u Ollama si se convierten los pesos a los formatos correspondientes (no verificado en la información disponible).
- Latencia y throughput: no disponibles. El ejemplo de la model card se ejecutó en CPU sin reportar tiempos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Búsqueda nativa | Disponibilidad |
|---|---|---|---|---|---|---|
| QueryLM 360M SFT search (este) | 361,8M | 4.096 | inglés | no disponible | sí (formato de bloques) | Hugging Face, 0 descargas |
| SmolLM2-360M | 361,8M (aprox.) | 8.192 (según versión) | multilingüe | Apache 2.0 (según versión) | no | Hugging Face, ampliamente usado |
| Qwen2.5-0.5B | 494M (aprox.) | 32.768 | multilingüe | Apache 2.0 (según versión) | no | Hugging Face, ampliamente usado |
| TinyLlama-1.1B | 1,1B | 2.048 | inglés | Apache 2.0 | no | Hugging Face, ampliamente usado |

Nota: los datos de los modelos comparables provienen de conocimiento general y no de la información proporcionada en esta ficha; deben verificarse en sus respectivas model cards. La comparación de rendimiento no es posible porque QueryLM no publica benchmarks.

## Limitaciones y advertencias

- Modelo de nicho con cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en producción ni validación externa.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; conviene contactar con el autor antes de cualquier despliegue productivo.
- Riesgo elevado de alucinación: en el propio ejemplo de la model card, la respuesta generada contiene afirmaciones incorrectas y repetitivas sobre Canberra (confunde capitales de territorios australianos), lo que sugiere baja fiabilidad factual incluso con el pasaje correcto insertado.
- El modelo no genera pasajes: solo emite consultas; la calidad de la respuesta depende críticamente del recuperador externo y del pasaje insertado.
- Contexto limitado a 4.096 tokens, insuficiente para documentos largos o conversaciones extensas.
- Solo inglés; no hay soporte multilingüe.
- Sin chat template: `apply_chat_template` no funciona; el formato es texto plano con prefijos, lo que complica la integración con frameworks que esperan plantillas estándar.
- El ajuste fino es de una sola época sobre unos 35,2M tokens, un presupuesto pequeño que limita la robustez de las habilidades de chat y tool calling.
- El pipeline de anotación depende de un modelo anotador (Gemma 4 E4B-it con LoRA) y de recuperación BM25 sobre Sphere; los sesgos de esos componentes pueden propagarse al modelo.
- No hay información sobre sesgos demográficos, tóxicos o de otro tipo; al entrenarse sobre Wikipedia en inglés, hereda los sesgos de cobertura y perspectiva de esa fuente.
- La fecha de creación del repositorio (2026-11-19) y las versiones de software citadas (torch 2.8.0, transformers 4.56.0) deben tomarse como las reportadas por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kausp11/querylm-wiki-360m-sft-search
- Modelo base: https://huggingface.co/Kausp11/querylm-wiki-360m
- Corpus Sphere (recuperación BM25): https://github.com/facebookresearch/Sphere
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información disponible.
