# HYDRACODEX/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB

## Resumen

NVIDIA-Nemotron-3.5-Bolt-E4B-4GB es una versión cuantizada en GGUF (Q4_K_M) del modelo NVIDIA-Nemotron-3.5-Bolt-E4B, un *small language model* desarrollado por NVIDIA que parte de Gemma-4-E4B-it de Google. El modelo conserva las capacidades conversacionales del original y añade un post-entrenamiento orientado a tres ejes: uso de herramientas en conversaciones multi-turno, seguimiento de instrucciones y *grounding* sobre la entrada del usuario. Su objetivo declarado son asistentes de voz y de dispositivo locales, personas interactivas e interfaces embebidas donde la memoria y el time-to-first-token son críticos.

La arquitectura es la de Gemma-4-E4B, con 8.000 millones de parámetros totales y 4.000 millones efectivos según la model card (el fichero safetensors del modelo base declara 7.518.069.290 parámetros). La ventana de contexto es de hasta 64K tokens tanto en entrada como en salida, y el modelo incorpora modos controlables por plantilla de chat: `enable_thinking` con presupuesto de razonamiento en tiempo de ejecución y `conversational_mode`.

Esta ficha cubre el repositorio HYDRACODEX/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB, una publicación de un tercero que redistribuye el GGUF de NVIDIA. Es relevante ahora porque lleva un modelo de la familia Nemotron con contexto de 64K a un fichero de ~4 GB ejecutable en GPU de consumo mediante llama.cpp, con soporte de decodificación especulativa mediante un *drafter* DFlash específico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Gemma-4-E4B (transformer; 8B totales, 4B efectivos según model card) |
| Parámetros totales | 8B declarados en la model card; 7.518.069.290 en el safetensors del modelo base |
| Parámetros activos | ~4B efectivos (nomenclatura E4B); la model card no detalla la configuración de expertos |
| Longitud de contexto | 64K tokens de entrada y 64K tokens de salida |
| Tipos de cuantización | GGUF Q4_K_M en este repositorio; BF16 en el repositorio base. No se listan otras cuantizaciones |
| Idiomas soportados | 33 idiomas: en, ar, bg, cs, da, de, el, es, et, fi, fr, hi, hr, hu, id, it, ja, ko, lt, lv, nl, no, pl, pt, ro, ru, sk, sl, sv, th, tr, uk, vi, zh |
| Licencia | OpenMDW-1.1 (el campo `license` del repo figura como `other` con `license_name: openmdw-1.1`) |
| Formato de pesos | GGUF (este repo); safetensors BF16 en el repo base |
| Precisión | Q4_K_M |
| Modalidad | Texto a texto |
| Tamaño del repositorio | 6,2 GB |
| Fecha de corte de datos | Mayo de 2026 (datos de post-entrenamiento) |
| Ventana de desarrollo del modelo | Diciembre de 2025 - mayo de 2026 |

## Arquitectura y entrenamiento

El modelo es un transformer derivado de Gemma-4-E4B-it, con 8B de parámetros totales y 4B efectivos. La model card no desglosa la configuración interna (número de capas, cabezas, tamaño de los expertos ni proporción de capas de atención local frente a global), por lo que ese detalle figura como no disponible. El post-entrenamiento de NVIDIA se apoya en los datasets `nvidia/nemotron-post-training-v3` y `nvidia/nemotron-pre-training-datasets`, con fecha de corte de mayo de 2026; no se especifica el número de tokens de entrenamiento ni la composición exacta del corpus, ni si se emplearon RLHF, DPO u otras técnicas de alineamiento.

Las innovaciones documentadas son de inferencia y de control del comportamiento, no de arquitectura. Por un lado, la plantilla de chat expone dos conmutadores: `enable_thinking`, que activa el modo de razonamiento con un presupuesto de *thinking* ajustable en tiempo de ejecución, y `conversational_mode`, orientado a respuestas conversacionales. Por otro, el modelo está diseñado para decodificación especulativa con un *drafter* dedicado (DFlash), que en llama.cpp se configura con `--spec-type draft-dflash` y hasta 7 tokens de borrador por paso, con el objetivo declarado de reducir el time-to-first-token en despliegues locales.

## Capacidades

- Generación de texto conversacional multi-turno con hasta 64K tokens de contexto de entrada y 64K de salida.
- Razonamiento explícito activable mediante `enable_thinking=True`, con presupuesto de razonamiento controlable en tiempo de ejecución y muestreo recomendado de temperatura 1,0 y top_p 0,95 en ambos modos.
- Modo conversacional alternativo controlado por plantilla (`conversational_mode=True/False`).
- Uso de herramientas y *function calling* multi-turno, uno de los ejes explícitos del post-entrenamiento.
- Seguimiento de instrucciones e *input grounding* (fundamentar la respuesta en la entrada del usuario), mejorados respecto al modelo base según la model card.
- Capacidades multilingües en 33 idiomas, con presencia de las principales lenguas europeas, asiáticas y el árabe.
- Integración con servidores compatibles con la API de OpenAI (etiqueta `endpoints_compatible`), incluido `llama.cpp server` con `--jinja` para plantillas.
- Decodificación especulativa mediante un modelo *drafter* complementario (DFlash).
- No se documentan capacidades de visión, audio ni otras modalidades.

## Casos de uso

- Asistentes de voz y de dispositivo local: el fichero Q4_K_M de ~4 GB permite ejecutar el modelo en una GPU de consumo o en un dispositivo embebido con GPU discreta, manteniendo latencia baja de primer token, que es el objetivo declarado del modelo. El modo `conversational_mode` reduce la verbosidad del razonamiento cuando no se necesita.
- Personas interactivas y agentes de compañía: el contexto de 64K permite mantener historiales largos de conversación y rasgos de personalidad consistentes sin reenviar resúmenes, y el post-entrenamiento en instrucciones favorece la adherencia al personaje.
- Automatización de atención al cliente multi-turno: el modelo puede gestionar hilos conversacionales largos con 64K tokens de entrada y encadenar llamadas a herramientas (consulta de pedidos, estado de cuenta) mediante *function calling*.
- Asistentes embebidos en interfaces de voz (por ejemplo, robots sociales o altavoces): el tamaño reducido y el soporte de llama.cpp con backend CUDA permiten desplegar el servidor en un contenedor Docker junto a la aplicación, con `-c 65536` y `-ngl 999` como configuración de referencia.
- Enrutado y preprocesado dentro de pipelines con modelos mayores: al ocupar poca VRAM, deja espacio para un segundo modelo en la misma GPU; puede clasificar, resumir o reformular consultas antes de pasarlas a un modelo grande.
- Prototipado rápido de agentes con *tool calling*: la API compatible con OpenAI y el parámetro `chat_template_kwargs` permiten alternar modo razonamiento y modo conversacional sin cambiar de modelo, lo que simplifica las pruebas A/B de comportamiento.
- Evaluación de decodificación especulativa: sirve como banco de pruebas para medir la ganancia del *drafter* DFlash en llama.cpp en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni de evaluaciones de *tool use*, y la búsqueda web no ha devuelto fuentes técnicas utilizables (los resultados obtenidos son páginas de Facebook sin relación con el modelo). Tampoco se publican cifras de latencia o throughput medidas.

## Requisitos de hardware

- VRAM para inferencia: los pesos Q4_K_M ocupan del orden de 4-5 GB (el repositorio completo pesa 6,2 GB, lo que sugiere más de un fichero o metadatos adicionales). Hay que sumar la caché KV, que crece con el contexto: con 64K tokens la demanda adicional es significativa y depende de la configuración de llama.cpp.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para contexto moderado; RTX 3060 12 GB, RTX 4060 Ti 8/16 GB, RTX 4070 o superiores permiten contextos más largos. En el extremo profesional, A100/H100 no aportan ventaja clara para este tamaño, salvo por agregación de muchas instancias.
- Cabe en GPU de consumo: sí, es uno de los supuestos de diseño del modelo (operación de baja memoria y bajo TTFT). En iGPU o CPU pura el rendimiento no está documentado.
- Opciones de despliegue: llama.cpp es la vía oficial documentada, con la imagen `ghcr.io/ggml-org/llama.cpp:server-cuda13-b11459` y las banderas `-m`, `-c 65536`, `-ngl 999`, `--jinja`. La model card indica que la receta de llama.cpp está "pendiente" en el momento de publicación. vLLM, TGI y Ollama no se mencionan en la información disponible (no confirmado).
- Decodificación especulativa: requiere descargar además el *drafter* `NVIDIA-Nemotron-3.5-Bolt-E4B-4GB-DFlash` y activar `--spec-draft-model`, `--spec-type draft-dflash`, `--spec-draft-n-max 7`, `--spec-draft-ngl 999`.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de TTFT en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / precisión | Licencia | Notas |
|---|---|---|---|---|---|
| NVIDIA-Nemotron-3.5-Bolt-E4B-4GB (este repo) | 8B totales, 4B efectivos | 64K entrada / 64K salida | GGUF Q4_K_M | OpenMDW-1.1 | Cuantización redistribuida por un tercero (HYDRACODEX); pensada para llama.cpp |
| NVIDIA-Nemotron-3.5-Bolt-E4B-BF16 | 8B totales, 4B efectivos | 64K entrada / 64K salida | safetensors BF16 | OpenMDW-1.1 | Versión oficial de referencia en precisión completa; requiere bastante más VRAM |
| NVIDIA-Nemotron-3.5-Bolt-E4B-4GB (repo oficial de NVIDIA) | 8B totales, 4B efectivos | 64K entrada / 64K salida | GGUF Q4_K_M | OpenMDW-1.1 | Origen del artefacto; incluye el *drafter* DFlash complementario |
| Gemma-4-E4B-it (modelo de partida) | no disponible en la información | no disponible en la información | no disponible en la información | no disponible en la información | Base sobre la que NVIDIA aplica el post-entrenamiento; sin datos de benchmark comparables en esta ficha |
| Otros SLM de ~4B efectivos (Qwen3-4B, Llama 3.2 3B, Phi-4-mini) | no disponible en la información | no disponible en la información | no disponible en la información | no disponible en la información | No se dispone de datos de rendimiento que permitan una comparación rigurosa con este modelo |

## Limitaciones y advertencias

- No hay resultados de benchmarks publicados en la información disponible, por lo que las afirmaciones de mejora en *tool use*, seguimiento de instrucciones y *grounding* proceden de la model card y no han sido verificadas de forma independiente en esta ficha.
- El repositorio es una publicación de un tercero (HYDRACODEX) que redistribuye el GGUF de NVIDIA. Conviene verificar la integridad del fichero frente al repositorio oficial `nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB` antes de usarlo en producción; el contador de descargas y likes figura en 0.
- La cuantización Q4_K_M introduce pérdida de precisión respecto al BF16. No se documenta en la información disponible una evaluación del degradado de calidad por cuantización.
- Riesgo de alucinación: inherente a los modelos de 4B efectivos, especialmente en tareas de conocimiento factual y en contextos de 64K donde la información relevante puede quedar dispersa. No se han publicado tasas de alucinación.
- Sesgos: no se documenta ninguna evaluación de sesgos, toxicidad ni robustez en la información proporcionada.
- Idioma: aunque se declaran 33 idiomas, no se especifica la calidad relativa por idioma ni el volumen de datos por lengua; el español está listado, pero sin métricas.
- Licencia: OpenMDW-1.1 permite uso comercial según la model card ("ready for commercial or non-commercial use"), pero es una licencia con términos propios que deben revisarse antes de su adopción; el campo `license` del repositorio figura como `other`.
- Despliegue: la receta de llama.cpp aparece como pendiente en la propia model card, y el soporte en otros motores (vLLM, TGI, Ollama) no está confirmado. El contexto completo de 64K exige planificar la memoria de la caché KV.
- Fechas: el repositorio se creó y actualizó el 29 de octubre de 2026, con datos de post-entrenamiento hasta mayo de 2026; el conocimiento del mundo posterior a esa fecha no está cubierto.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/HYDRACODEX/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB
- Modelo base BF16: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16
- Modelo base de partida (Gemma-4-E4B-it): https://huggingface.co/google/gemma-4-E4B-it
- Drafter para decodificación especulativa: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB-DFlash
- Informe técnico (PDF): https://research.nvidia.com/labs/nemotron/files/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB-Technical-Report.pdf
- Blog del modelo: https://research.nvidia.com/labs/nemotron/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB/
- Página de desarrollador de Nemotron: https://developer.nvidia.com/nemotron
- Discord de NVIDIA AI Developer: https://discord.gg/9xpKQtVvrk
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Texto de la licencia OpenMDW-1.1 en GitHub: https://github.com/OpenMDW/OpenMDW/blob/main/1.1/LICENSE.OpenMDW-1.1
- Dataset de post-entrenamiento: https://huggingface.co/datasets/nvidia/nemotron-post-training-v3
- Datasets de pre-entrenamiento: https://huggingface.co/datasets/nvidia/nemotron-pre-training-datasets
- Paper referenciado en los tags (arXiv 2509.04292): https://arxiv.org/abs/2509.04292
