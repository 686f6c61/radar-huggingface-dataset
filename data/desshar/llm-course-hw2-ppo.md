# desshar/llm-course-hw2-ppo

## Resumen

`desshar/llm-course-hw2-ppo` es un checkpoint de generación de texto publicado en HuggingFace por el usuario desshar, con 134.515.008 parámetros (aproximadamente 134,5 M) en formato safetensors y un tamaño de repositorio de 0,5 GB. El identificador del modelo y la etiqueta `llama` en los metadatos sitúan el checkpoint dentro de la familia de arquitecturas Llama, empaquetado con la librería `transformers` y declarado para el pipeline `text-generation` con uso conversacional. El sufijo `ppo` y el segmento `llm-course-hw2` apuntan a un trabajo de prácticas de un curso de LLM en el que se aplicó aprendizaje por refuerzo con optimización de política proximal (PPO), presumiblemente sobre un modelo base de tamaño similar.

El problema que aborda es, por tanto, el de un experimento reproducible de ajuste por preferencias (RLHF con PPO) sobre un modelo pequeño, más que el de un modelo listo para producción. No hay model card sustantiva: la tarjeta publicada es la plantilla autogenerada de HuggingFace con todos los campos marcados como `[More Information Needed]`, sin licencia declarada, sin idiomas declarados y sin resultados de evaluación. Tampoco consta ningún dato de arquitectura interna, longitud de contexto o composición del dataset de entrenamiento.

La relevancia es fundamentalmente didáctica y de investigación: sirve como artefacto de referencia para estudiar cómo se comporta un modelo de 134 M de parámetros tras un ciclo de PPO, comparar políticas antes y después del ajuste, y validar pipelines de RLHF a pequeña escala en hardware de consumo. Cualquier uso más allá de la experimentación debe hacerse con extrema cautela, dado el vacío documental del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (según etiqueta `llama` del repo); detalles internos (capas, cabezas, dimensiones) no disponibles |
| Parametros totales | 134.515.008 (134,5 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No se publican GGUF ni cuantizaciones; al ser safetensors en `transformers` admite cuantización dinámica int8/int4 vía bitsandbytes y conversión a GGUF con llama.cpp (no verificada en este repo) |
| Idiomas soportados | No disponible |
| Licencia | No disponible (sin licencia declarada en la model card ni en los metadatos) |
| Formato de pesos | safetensors (compatible con `transformers`); tamaño de repo 0,5 GB |
| Pipeline declarado | text-generation |
| Etiquetas | transformers, safetensors, llama, text-generation, conversational, text-generation-inference, endpoints_compatible, region:us, arxiv:1910.09700 |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-10-28 / 2026-10-28 |

## Arquitectura y entrenamiento

La única evidencia arquitectónica es la etiqueta `llama` y la librería `transformers`, lo que implica un transformer decoder-only con atención causal, tokenizador asociado a la familia Llama y soporte de `text-generation-inference` y endpoints compatibles. No se especifican número de capas, dimensión oculta, número de cabezas, mecanismo de atención (MHA/GQA), función de activación, normalización ni vocabulario. El recuento de 134.515.008 parámetros es compatible con los modelos densos de ~135 M de la familia SmolLM2, pero el repositorio no confirma la genealogía y no debe asumirse.

Sobre el entrenamiento, el nombre del checkpoint (`hw2-ppo`) indica que se aplicó PPO, el algoritmo de RLHF popularizado en el pipeline de InstructGPT, y la etiqueta `arxiv:1910.09700` corresponde a Lacoste et al. (2019) sobre estimación de emisiones, citada en la plantilla estándar de model card: no es una referencia al artículo del modelo. Un repositorio homónimo de otro autor (`neuralsrg/llm-course-hw2-ppo`) documenta un modelo PPO entrenado en el curso de LLM de VK usando SmolLM2-135M-Instruct como política y como referencia, y el README del HW2 del curso menciona el uso de un modelo de recompensa QRM-Llama3.1-8B y el debate sobre *reward hacking*. Esa información es contextual y no está confirmada para este repositorio concreto: no hay en la model card ninguna referencia a dataset, número de tokens, hiperparámetros de PPO (clipping, KL, épocas), ni a si hubo SFT previo.

## Capacidades

- Generación de texto autoregresiva y uso conversacional, según el pipeline declarado (`text-generation`, etiqueta `conversational`).
- Razonamiento y conocimiento factual: no verificados; por el tamaño (134 M de parámetros) la capacidad esperada es muy limitada y probablemente por debajo de modelos como SmolLM2-135M-Instruct.
- Generación de código y matemáticas: no se han publicado evaluaciones; con este presupuesto de parámetros, la fiabilidad esperada en tareas de código es baja.
- Tool calling / function calling: no documentado; no hay plantilla de herramientas ni formato estructurado declarado.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Multilingüismo: no declarado; no hay lista de idiomas en la tarjeta.
- Capacidades especiales (modo thinking, visión, audio, decodificación especulativa): no disponibles.
- Compatibilidad de despliegue: al estar en `transformers` con safetensors, es cargable por TGI, vLLM y llama.cpp (previa conversión), y la etiqueta `endpoints_compatible` indica compatibilidad con Inference Endpoints de HuggingFace.

## Casos de uso

- Reproducción de un pipeline de RLHF con PPO a pequeña escala: sirve como artefacto final de un trabajo de prácticas para comparar la política ajustada frente al modelo de referencia y analizar la deriva de la distribución de respuestas.
- Estudio de *reward hacking*: al proceder de un ejercicio con modelo de recompensa, permite inspeccionar cualitativamente si la política explota atajos de la función de recompensa (respuestas largas, fórmulas de cortesía, evasión).
- Prototipado de chatbots conversacionales en local: con ~134 M de parámetros cabe en CPU y en GPUs de gama baja, lo que permite montar un endpoint de pruebas con TGI o vLLM sin infraestructura dedicada.
- Base para *fine-tuning* supervisado posterior: su tamaño permite iterar en una sola GPU de consumo (por ejemplo, una RTX 3060/4090) con LoRA en minutos, útil para experimentos académicos de ajuste instructivo.
- Evaluación comparativa de metodologías de alineamiento: útil como punto de datos en estudios que comparan SFT, DPO y PPO con presupuestos de cómputo equivalentes.
- Generación de texto corto y clasificación vía *prompting* en entornos de demostración docente: resúmenes de una frase, etiquetado de opiniones o generación de respuestas plantilla donde no se requiera alta precisión.
- Test de infraestructura y CI: por su reducido peso (0,5 GB), es adecuado como modelo *smoke test* en pipelines de despliegue (TGI, vLLM, endpoints) antes de pasar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye sección de evaluación cumplimentada y el repositorio no contiene informes de MMLU, HumanEval, GSM8K ni métricas de preferencia (win rate, recompensa media). Tampoco se documentan latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: ~0,54 GB solo de pesos; en bf16/fp16: ~0,27 GB; en int8: ~0,14 GB; en int4: ~0,07 GB. Con caché KV y overhead de runtime, contar 1-2 GB en fp16 y por debajo de 1 GB en int8.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (GTX 1650, RTX 3050, T4). También es viable en CPU: la inferencia en fp32 con llama.cpp o `transformers` es de decenas de tokens por segundo en un portátil moderno.
- Cabe holgadamente en GPU de consumo (RTX 3060/4060/4090) e incluso en dispositivos con 2-4 GB de memoria unificada.
- Opciones de despliegue: `transformers` (referencia), TGI (etiqueta `text-generation-inference`), vLLM, HuggingFace Inference Endpoints (etiqueta `endpoints_compatible`), llama.cpp/Ollama previa conversión a GGUF (no hay GGUF publicado). Un proveedor externo (FriendliAI) lista un repo homónimo de otro autor, no este.
- Latencia y throughput: no disponibles. A modo orientativo, un modelo denso de 135 M en bf16 sobre una RTX 4090 se sitúa en el orden de miles de tokens por segundo con *batching*, pero no hay medición publicada para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| desshar/llm-course-hw2-ppo | 134,5 M | No disponible | No disponible | HuggingFace, safetensors, 0 descargas | Checkpoint de curso con PPO, sin evaluación publicada |
| SmolLM2-135M-Instruct (HuggingFace) | 135 M | 8.192 tokens | Apache 2.0 | HuggingFace, ampliamente distribuido | Base instructiva documentada; probable ancestro del linaje usado en el curso |
| Qwen2.5-0.5B-Instruct (Alibaba) | ~494 M | 32.768 tokens | Apache 2.0 | HuggingFace, vLLM, GGUF | Alternativa de tamaño ligeramente superior con documentación completa |
| Llama 3.2 1B Instruct (Meta) | ~1,24 B | 128.000 tokens | Licencia comunitaria Llama 3.2 | HuggingFace, amplio ecosistema | Requiere aceptar términos; muy superior en capacidad |

Los datos de los modelos comparativos son de referencia general y no provienen de una evaluación conjunta con este checkpoint; la comparación de rendimiento real no está disponible. La diferencia clave no es de arquitectura sino de documentación y licencia: los tres alternativos tienen tarjeta completa, licencia explícita y evaluaciones publicadas, mientras que este repositorio carece de las tres cosas.

## Limitaciones y advertencias

- Ausencia total de documentación: la model card es la plantilla autogenerada, sin información sobre datos, entrenamiento, evaluación o uso previsto.
- Licencia no declarada: en la práctica, sin licencia explícita no hay cesión de derechos para uso comercial; hay que contactar con el autor antes de cualquier despliegue productivo.
- Idiomas no declarados: no es posible saber si el modelo está entrenado o alineado en castellano; se desconoce su comportamiento fuera del inglés y su tokenizador efectivo.
- Longitud de contexto desconocida: no se puede dimensionar aplicaciones multi-turno ni de documento largo sin medirla empíricamente.
- Riesgo alto de alucinación y de respuestas incoherentes: con 134 M de parámetros, la coherencia decae rápido en generaciones largas y la exactitud factual es baja.
- Sesgos no evaluados: al no haber sección de riesgos, no existe ninguna auditoría de sesgo demográfico, tóxico o ideológico; el modelo puede reproducir sesgos del corpus de instrucciones subyacente.
- Posible *reward hacking*: al ser un ajuste PPO sobre un modelo de recompensa, la política puede haber aprendido atajos que maximizan la puntuación sin mejorar la calidad real.
- Sin garantías de calidad conversacional: la etiqueta `conversational` no implica que respete un formato de chat concreto; la plantilla de turnos no está documentada.
- Cero tracción comunitaria (0 descargas, 0 likes, creado y actualizado el mismo día): no hay evidencia de uso ni de validación por terceros.
- No apto para producción sin una evaluación propia previa; conviene tratarlo como artefacto de investigación reproducible.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/desshar/llm-course-hw2-ppo
- Repositorio homónimo de otro autor con documentación de PPO sobre SmolLM2-135M-Instruct: https://huggingface.co/neuralsrg/llm-course-hw2-ppo
- Repositorio homónimo en FriendliAI (tercero): https://friendli.ai/models/xiryss/llm-course-hw2-ppo
- README del HW2 del curso LLM (PPO, RLHF, modelo de recompensa QRM-Llama3.1-8B): https://github.com/maolama/LLM-Course-Spring2025/blob/main/HW2/README.md
- Ficha de cumplimiento normativo generada por terceros (Nerq): https://nerq.ai/agent/72eb17d9-d717-4e29-b40d-83b22ce96d44
- Referencia citada en la plantilla (Lacoste et al., 2019, estimación de emisiones): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental ML CO2: https://mlco2.github.io/impact#compute
