# mradermacher/forocoches-lm-v3-GGUF

## Resumen

Forocoches-lm-v3 es un modelo lingüístico especializado en español coloquial de foros, creado por el usuario mateo-19182 mediante un full-finetune sobre la familia de modelos Gemma 3 de Google. El modelo se ha entrenado con el dataset mateo-19182/forocoches-threads-v3, compuesto por hilos del foro Forocoches, uno de los communities en línea más grandes de España. El objetivo es capturar el estilo de escritura, el argot, la ironía y las convenciones comunicativas propias de los foros españoles, algo que los modelos generalistas suelen manejar con dificultad.

La ficha que se presenta aquí corresponde al repositorio de cuantizaciones GGUF publicado por mradermacher, un cuantizador muy conocido en la comunidad de Hugging Face que genera versiones estáticas de modelos populares para su uso en llama.cpp y herramientas derivadas. El modelo base pesa aproximadamente 1.000 millones de parámetros (999.885.952 exactos), lo que lo sitúa en la gama de modelos pequeños, ejecutables incluso en hardware muy modesto.

Su relevancia actual radica en el creciente interés por modelos lingüísticos adaptados a dominios y registros específicos del español. Mientras los grandes modelos generalistas tienden a suavizar o normalizar el lenguaje informal, este modelo demuestra la utilidad de los fine-tunings de nicho para tareas como generación de contenido con estilo foril, análisis de comunidades en línea o investigación lingüística sobre el español de internet.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 3 (transformer decoder denso) |
| Parametros totales | 999.885.952 (≈1 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Gemma 3; verificar en el modelo base) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS, f16 |
| Idiomas soportados | Español (especializado en español coloquial de foros) |
| Licencia | Gemma (Gemma Terms of Use) |
| Formato de pesos | GGUF (el modelo base está disponible en safetensors) |

## Arquitectura y entrenamiento

El modelo parte de Gemma 3, la familia de modelos abiertos de Google basada en una arquitectura transformer decoder con mejoras como ventana de atención local combinada con atención global en algunas capas. Con cerca de mil millones de parámetros, se trata de un modelo denso (no MoE) de la gama pequeña de la familia, diseñado para inferencia ligera.

El ajuste fino se realizó mediante full-finetune (ajuste de todos los pesos, no solo de adaptadores LoRA) sobre el dataset mateo-19182/forocoches-threads-v3, una recopilación de hilos completos de Forocoches. No se ha publicado información sobre el número de tokens de entrenamiento, el uso de RLHF o DPO, ni detalles del proceso de optimización. La cuantización GGUF fue realizada por mradermacher a partir de los pesos originales en safetensors, empleando cuantizaciones estáticas (no imatrix) en el momento de publicación de la ficha.

## Capacidades

- Generación de texto en español con estilo, registro y argot característicos de los foros españoles, en particular Forocoches.
- Continuación de hilos de foro simulando la dinámica de participación de los usuarios.
- Captura de expresiones coloquiales, ironía, jerga de internet y convenciones de citación propias de los foros.
- Capacidades generales heredadas de Gemma 3 en generación de texto, razonamiento básico y compresión lingüística, aunque probablemente degradadas por el fine-tuning de nicho.
- No hay información publicada sobre soporte de tool calling, function calling, agentes, visión o audio.

## Casos de uso

- Generación de contenido con estilo foril: crear mensajes, respuestas o hilos simulados que imiten el tono y la jerga de los foros españoles, útil para prototipado de contenido o ficción interactiva.
- Investigación lingüística y sociológica: generar muestras sintéticas para estudiar el registro coloquial del español de internet, complementando análisis del dataset original.
- Aumento de datos para NLP en español: producir ejemplos de entrenamiento adicionales para clasificadores de toxicidad, detección de ironía o análisis de sentimiento en dominio foril.
- Chatbots de caracterización: dotar a personajes virtuales o bots de entretenimiento de una voz informal y reconociblemente española de internet.
- Pruebas de fine-tuning de nicho: servir como caso de estudio reproducible de cómo un full-finetune de 1 B de parámetros adapta un modelo generalista a un dominio muy específico.
- Ejecución local de demostraciones: dado su tamaño reducido, es idóneo para demos en portátiles sin GPU dedicada mediante llama.cpp u Ollama.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los cuants de 0,8 a 1,2 GB caben con holgura en cualquier GPU moderna; el cuant f16 (2,1 GB) también es trivial para hardware actual. En CPU pura, el modelo es plenamente ejecutable con RAM modesta (2-4 GB libres).
- GPU recomendadas: cualquier GPU con 4 GB de VRAM o más (por ejemplo, RTX 3060, RTX 4060 o superiores) es más que suficiente; no se requiere hardware de centro de datos.
- Consumer GPUs: cabe sin problemas en prácticamente todas las GPUs de consumo, incluso en portátiles con gráfica integrada si se usa el cuant Q2_K o Q3_K_S en CPU.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, GPT4All y cualquier runtime compatible con GGUF. El modelo base en safetensors puede desplegarse con vLLM, TGI o transformers.
- Latencia y throughput: no disponibles; dada la talla de ~1 B de parámetros, se esperan velocidades altas incluso en CPU moderna (decenas de tokens por segundo).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| forocoches-lm-v3 (este modelo) | ≈1 B | no disponible | Gemma | Español coloquial de foros (fine-tune de nicho) |
| Gemma 3 1B (base de Google) | ≈1 B | 32k (según ficha oficial) | Gemma | Modelo generalista multilingüe |
| Qwen2.5 1.5B Instruct | 1,5 B | 32k | Qwen (uso comercial permitido con condiciones) | Generalista, buen soporte de español |
| Llama 3.2 1B Instruct | ≈1,2 B | 128k | Llama 3.2 | Generalista multilingüe |

Nota: frente a los generalistas de tamaño similar, forocoches-lm-v3 ofrece una fidelidad muy superior al registro foril español, a costa de capacidades generales, contexto y probablemente de instrucciones (el fine-tune parece de continuación de texto, no instruct).

## Limitaciones y advertencias

- El dataset de entrenamiento procede de Forocoches, un foro conocido por su lenguaje crudo, humor negro y contenido a veces ofensivo; el modelo puede generar texto tóxico, sexista o inapropiado. No es apto para entornos de producción orientados al público sin filtros adicionales.
- Riesgo de alucinación elevado al tratarse de un modelo de 1 B de parámetros con fine-tuning de nicho, sin alineación documentada (no hay constancia de RLHF/DPO).
- Especialización extrema: fuera del registro foril, la calidad de generación puede degradarse notablemente respecto al modelo base Gemma 3.
- Licencia Gemma: el uso comercial está permitido bajo los Gemma Terms of Use de Google, que incluyen restricciones y un acceptable use policy; conviene revisarlos antes de cualquier despliegue comercial.
- No hay información publicada sobre longitud de contexto efectiva, plantilla de prompt ni capacidades instructivas; habrá que verificar la ficha del modelo base mateo-19182/forocoches-lm-v3.
- Las cuantizaciones disponibles son estáticas; las versiones imatrix (de mayor calidad a igual tamaño) no estaban disponibles en el momento de redacción de la ficha.

## Enlaces

- Repositorio GGUF cuantizado: https://huggingface.co/mradermacher/forocoches-lm-v3-GGUF
- Modelo base (safetensors): https://huggingface.co/mateo-19182/forocoches-lm-v3
- Dataset de entrenamiento: https://huggingface.co/datasets/mateo-19182/forocoches-threads-v3
- Página de descargas de mradermacher: https://hf.tst.eu/model#forocoches-lm-v3-GGUF
- Guía de uso de GGUF de TheBloke: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
