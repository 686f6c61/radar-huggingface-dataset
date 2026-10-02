# francesca9805/rus-cyrl-10mb-after-ppt-Dp-10mb-packed-bfdiso-ckpt500_seed455

## Resumen

Este modelo es un ajuste fino (fine-tune) del modelo base `francesca9805/rus-cyrl-10mb-ppt-Dp-10mb-packed-bfdiso_seed455`, desarrollado por el usuario francesca9805 (según la URL del run de Weights & Biases, asociado a la Universidad de Groningen). Se trata de un modelo de generación de texto de arquitectura GPT-2 con 39.087.104 parámetros (aproximadamente 39,1 millones), entrenado mediante SFT (supervised fine-tuning) con la librería TRL de Hugging Face. Su nombre codifica una configuración experimental concreta: corpus de 10 MB en cirílico ruso, empaquetado de secuencias, precisión bf16, checkpoint 500 y semilla 455.

El modelo no es un lanzamiento de producción, sino un artefacto de investigación dentro de una serie de experimentos de ablación sobre tokenizadores y empaquetado de datos (el run de W&B pertenece al proyecto "new-tokenizers"). La relevancia de esta ficha es, por tanto, la de documentar un punto concreto de un barrido experimental: permite reproducir resultados, comparar configuraciones (distintos tamaños de corpus, semillas y checkpoints) y estudiar el efecto del tokenizador en un modelo pequeño entrenado con recursos mínimos.

Al tratarse de un modelo de 39 millones de parámetros con entrenamiento sobre un corpus declarado de 10 MB, sus capacidades lingüísticas son necesariamente limitadas y sus resultados no son comparables a los de modelos de escala media o grande. La model card no incluye licencia, idiomas soportados, longitud de contexto, composición del dataset ni métricas de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 (etiqueta `gpt2` en HuggingFace) |
| Parametros totales | 39.087.104 (aproximadamente 39,1 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card; los pesos en safetensors pueden cuantizarse a fp16/int8/int4 con herramientas estandar |
| Idiomas soportados | no disponible oficialmente; el nombre del modelo indica cirílico ruso (`rus-cyrl`) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Pipeline | text-generation |
| Modelo base | francesca9805/rus-cyrl-10mb-ppt-Dp-10mb-packed-bfdiso_seed455 |
| Metodo de entrenamiento | SFT (TRL) |
| Tamano del repositorio | 0,8 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La etiqueta `gpt2` de HuggingFace y el pipeline `text-generation` indican una arquitectura transformer decoder-only autorregresiva de la familia GPT-2, con atención causal completa. Con 39,1 millones de parámetros, la configuración es notablemente más pequeña que GPT-2 small (124 M) y que distilgpt2 (82 M), lo que sugiere una reducción del número de capas y/o de la dimensión oculta, aunque la model card no publica el `config.json` detallado (número de capas, cabezas, dimensión de embedding ni tamaño de vocabulario).

El entrenamiento se realizó mediante SFT con TRL 0.23.0 sobre Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4 y Tokenizers 0.22.1. No hay información sobre el número de tokens vistos, la composición del dataset, ni si hubo etapas posteriores de alineación (RLHF, DPO). El sufijo `ckpt500` indica que el artefacto corresponde al checkpoint 500 del run de entrenamiento, y `seed455` fija la semilla aleatoria. El nombre `Dp-10mb-packed-bfdiso` apunta a empaquetado de secuencias (packing) con precisión bf16, mientras que `after-ppt` sugiere que este fine-tune se aplicó después de una etapa previa de preentrenamiento o adaptación de tokenizador. No se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, MoE, etc.).

## Capacidades

- Generación de texto autorregresiva en el idioma y dominio del corpus de entrenamiento; la model card proporciona un ejemplo de generación con `pipeline("text-generation")` y formato de mensajes con rol `user`.
- Formateo conversacional básico: el ejemplo de uso pasa una lista de mensajes con rol, lo que sugiere que el SFT se aplicó sobre una plantilla de chat, aunque no se documenta la plantilla exacta.
- Capacidad multilingüe: no documentada. El identificador del modelo indica cirílico ruso, pero no hay confirmación oficial de cobertura de idiomas.
- Tool calling / function calling: no disponible, no documentado.
- Uso como agente o razonamiento multi-paso: no disponible, no documentado, y poco probable dada la escala.
- Modo de razonamiento explícito (thinking), visión, audio: no soportado según la información disponible.
- Encaje en el ecosistema TGI: el tag `text-generation-inference` y `endpoints_compatible` indican compatibilidad declarada con el servidor de inferencia de Hugging Face.

## Casos de uso

- Reproducibilidad de experimentos de tokenización: el modelo sirve como punto de control fijo (seed 455, checkpoint 500) para replicar exactamente un resultado concreto dentro de un barrido de configuraciones de tokenizador y empaquetado de datos.
- Ablación controlada de semillas: al existir variantes de la misma familia con otras semillas y tamaños de corpus (por ejemplo, `seed10`, `seed3407`, corpus de 100 MB), este modelo permite medir la varianza entre semillas manteniendo constante el resto de la configuración.
- Estudio del efecto del packing de secuencias: comparar este checkpoint con variantes no empaquetadas del mismo corpus permite analizar cómo el `packed` afecta a la convergencia en modelos pequeños con presupuesto de datos muy reducido.
- Docencia y prácticas de ajuste fino: con 39 M de parámetros y 0,8 GB de repositorio, es viable ejecutar el ciclo completo de entrenamiento e inferencia en un portátil o en una GPU de gama baja, lo que lo hace útil para enseñar el flujo de TRL + Transformers.
- Línea base (baseline) en investigaciones de bajo recurso para ruso: sirve como referencia inferior contra la que medir mejoras de modelos mayores o de corpus más amplios en tareas de generación en cirílico.
- Pruebas de integración de infraestructura: por su tamaño reducido, es adecuado para validar pipelines de despliegue (TGI, vLLM, endpoints compatibles) antes de escalar a modelos de producción, sin consumir recursos significativos.
- Generación de texto experimental en dominio restringido: puede emplearse para explorar la calidad de continuaciones sobre textos muy similares al corpus de 10 MB empleado, siempre con expectativas de calidad muy limitadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye métricas de evaluación (perplejidad, MMLU, HumanEval, GSM8K ni ninguna otra) y las búsquedas web realizadas solo devuelven páginas de agregadores de modelos (LLM Explorer, friendli.ai, free2aitools) con metadatos, sin cifras de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculos derivados de los 39.087.104 parámetros, no publicados por el autor): aproximadamente 156 MB en fp32, 78 MB en fp16/bf16, 39 MB en int8 y 20 MB en int4, más el espacio del contexto y del runtime. El agregador LLM Explorer indica 0,1 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente. Funciona sin problema en RTX 3060, RTX 4060, RTX 4090, T4, L4, A100 o H100, aunque estas últimas están enormemente sobredimensionadas para este tamaño.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo de los últimos años e incluso en iGPU con memoria compartida suficiente. También es viable la inferencia en CPU.
- Opciones de despliegue: `transformers` con `pipeline` (método documentado en la model card), Text Generation Inference (TGI) por el tag `text-generation-inference`/`endpoints_compatible`, y potencialmente vLLM u Ollama/llama.cpp previa conversión de formato, aunque estas dos últimas no están confirmadas por el autor.
- Latencia y throughput: no disponibles. En la práctica, con 39 M de parámetros, la latencia por token en GPU moderna es del orden de milisegundos o inferior, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rus-cyrl-10mb-after-ppt-Dp-10mb-packed-bfdiso-ckpt500_seed455 | 39,1 M | no disponible | no disponible | no disponible | HuggingFace (0 descargas) |
| francesca9805/rus-cyrl-10mb-ppt-Dp-10mb-packed-bfdiso_seed455 (modelo base) | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| distilgpt2 | 82 M | 1024 tokens | no comparable (no evaluado en ruso) | MIT | HuggingFace, ampliamente desplegado |
| GPT-2 small | 124 M | 1024 tokens | MMLU y otros publicados por OpenAI | MIT (pesos) | HuggingFace |

Nota: los datos de distilgpt2 y GPT-2 small se incluyen como referencia de escala conocida; no existe una comparación de rendimiento publicada entre este modelo y ellos. No se han identificado otros modelos comparables de la misma serie con métricas publicadas.

## Limitaciones y advertencias

- Licencia no especificada: la model card contiene `licence: license` como marcador de posición, sin texto legal. No se puede determinar si el uso comercial está permitido; trátese como no autorizado hasta confirmación del autor.
- Idiomas no declarados: aunque el nombre indica cirílico ruso, no hay confirmación oficial de los idiomas cubiertos ni de su calidad.
- Corpus de entrenamiento extremadamente pequeño: el identificador indica 10 MB de datos, lo que implica un conocimiento del mundo muy limitado, vocabulario restringido y alta probabilidad de incoherencia en generaciones largas.
- Riesgo elevado de alucinación y de texto plausible pero factualmente vacío; no debe usarse para responder preguntas factuales sin verificación.
- Longitud de contexto desconocida: no se publica, y la arquitectura GPT-2 suele estar limitada a 1024 tokens si no se ha modificado.
- Sesgos desconocidos: no se ha realizado ninguna evaluación de sesgos, toxicidad o representación.
- Sin evaluación cuantitativa: no hay benchmarks, ni perplejidad, ni comparación con el modelo base que permitan medir si el fine-tune aporta alguna mejora.
- Naturaleza experimental: el sufijo `ckpt500` lo identifica como un checkpoint intermedio de un run, no necesariamente el mejor punto de la curva de entrenamiento.
- Adopción nula: 0 descargas y 0 likes en el momento de redactar esta ficha, es decir, sin validación por parte de la comunidad.
- No apto para producción: sin licencia, sin evaluación y sin garantías de calidad, no debería desplegarse en ningún servicio de cara al usuario.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/rus-cyrl-10mb-after-ppt-Dp-10mb-packed-bfdiso-ckpt500_seed455
- Modelo base: https://huggingface.co/francesca9805/rus-cyrl-10mb-ppt-Dp-10mb-packed-bfdiso_seed455
- Run de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/8o21238k
- Repositorio de TRL: https://github.com/huggingface/trl
- Variante de la misma serie (100 MB, seed 10): https://huggingface.co/francesca9805/rus-cyrl-10mb-ppt-Dp-100mb-packed-bfdiso_seed10
- Variante de la misma serie (100 MB de corpus, seed 10): https://huggingface.co/francesca9805/rus-cyrl-100mb-ppt-Dp-10mb-packed-bfd_seed10
- Ficha en LLM Explorer: https://llm-explorer.com/model/francesca9805%2Frus-cyrl-10mb-ppt-Dp-100mb-packed-bfd_seed3407,1CCLllBgdby5Ygr04yVLnj
- Ficha en friendli.ai: https://friendli.ai/models/francesca9805/rus-cyrl-100mb-ppt-Dp-10mb-packed-bfd_seed10
