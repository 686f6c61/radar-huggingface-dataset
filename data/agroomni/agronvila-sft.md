# AgroOmni/AgroNVILA-SFT

## Resumen

AgroNVILA-SFT es un checkpoint de ajuste supervisado (SFT) del modelo AgroNVILA, desarrollado por el grupo AgroOmni. Se construye sobre NVILA-Lite-8B, un modelo vision-language de la familia LLaVA, y está especializado en el dominio agrícola y de teledetección. El modelo resuelve el problema de la interpretación de imágenes aéreas, satelitales y de dron en contextos agronómicos, un nicho donde los modelos generalistas rinden por debajo de lo deseable por la especificidad del vocabulario y de los patrones visuales.

El entrenamiento se realizó exclusivamente con supervisión (sin refuerzo por preferencias) sobre el corpus AgroOmni, compuesto por 268.119 pares pregunta-respuesta distribuidos sobre 97.926 imágenes. La arquitectura subyacente es un transformer multimodal con proyector visual y un LLM de 8.000 millones de parámetros, heredado de NVILA-Lite-8B. El checkpoint alcanza un 59,52 de micro-media global en el benchmark AgroMind (13 tareas), y su versión posterior con alineamiento GRPO llega a 59,86.

Su relevancia actual radica en que ofrece una base abierta (Apache-2.0) y reproducible para investigación aplicada en agricultura de precisión, con código de entrenamiento disponible y un dataset público asociado. No obstante, es un modelo de nicho, en inglés y con un volumen de descargas todavía muy bajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia LLaVA, `llava_llama`) con codificador visual y LLM de 8B |
| Parametros totales | 8B (heredados del modelo base NVILA-Lite-8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors; no se documentan GGUF ni otras) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de NVILA-Lite-8B: un codificador visual acoplado a un modelo de lenguaje de 8.000 millones de parámetros mediante un proyector, con el pipeline de carga propio de la familia LLaVA (`load_pretrained_model` con el identificador `llava_llama`). El ajuste se realizó en una única etapa de supervisión (SFT), sin RLHF ni DPO, sobre el corpus AgroOmni.

El corpus de entrenamiento contiene 268.119 pares pregunta-respuesta sobre 97.926 imágenes, con tres vistas diferenciadas: terreno (192.800 pares), satélite (56.732) y UAV/dron (18.587). Esta distribución refleja un sesgo hacia imágenes terrestres, con una representación notablemente menor de vistas aéreas. El código de entrenamiento está publicado en el repositorio de GitHub del proyecto. No se documentan en la información disponible detalles sobre el número de tokens de texto, la composición exacta del dataset más allá del recuento por vista, ni innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Comprensión de imágenes y respuesta a preguntas visuales (VQA) en dominio agrícola.
- Interpretación de imágenes de satélite, UAV/dron y terreno para tareas agronómicas.
- Generación de texto descriptivo y analítico a partir de imágenes.
- Razonamiento multimodal sobre 13 tareas del benchmark AgroMind.
- Capacidad multilingüe limitada al inglés.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo de pensamiento (thinking), visión, audio u otras capacidades especiales: no documentadas.

## Casos de uso

- Monitorización de cultivos por satélite: el modelo puede responder preguntas sobre el estado de parcelas a partir de imágenes satelitales, aprovechando los 56.732 pares de entrenamiento de esa vista para clasificar y describir condiciones del terreno.
- Inspección con dron en agricultura de precisión: interpretación de imágenes UAV para detectar anomalías en cultivos, con un conjunto de 18.587 pares específicos de esa modalidad.
- Asistencia agronómica en campo: análisis de fotografías de terreno tomadas por el agricultor para obtener descripciones y recomendaciones básicas, apoyándose en los 192.800 pares de la vista terrestre.
- Investigación en visión-language aplicada: base reproducible para experimentos de fine-tuning en dominios especializados, con dataset y código públicos.
- Etiquetado asistido de imágenes agrícolas: generación automática de descripciones y pares pregunta-respuesta para ampliar datasets de teledetección.
- Evaluación comparativa de modelos multimodales: referencia para medir el rendimiento de modelos generalistas frente a especializados en el benchmark AgroMind.
- Punto de partida para alineamiento con RL: el checkpoint SFT sirve como base para recetas posteriores de GRPO, como demuestra la versión AgroNVILA.

## Benchmarks y rendimiento

| Benchmark | Tareas | Metrica | Resultado |
|---|---|---|---|
| AgroMind | 13 | micro-media global | 59,52 |
| AgroMind (AgroNVILA con GRPO) | 13 | micro-media global | 59,86 |

No se han publicado en la información disponible resultados desglosados por tarea ni comparaciones con otros modelos en MMLU, HumanEval, GSM8K u otros benchmarks estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la documentación. Como referencia orientativa para un modelo de 8B en precisión completa (fp16), se requieren del orden de 16 GB solo para los pesos, más el codificador visual y el overhead de activaciones.
- GPU recomendadas: no documentadas. Por tamaño, un modelo de 8B en fp16 encaja en A100 40 GB, H100 y RTX 4090 (24 GB) con margen ajustado.
- Compatibilidad con GPU de consumo: probable en RTX 4090 y GPUs de 24 GB en fp16; en GPUs de 16 GB requeriría cuantización, no documentada para este checkpoint.
- Opciones de despliegue: la model card solo documenta la carga mediante `llava.model.builder.load_pretrained_model` con el identificador `llava_llama`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AgroNVILA-SFT | 8B | no disponible | Agrícola / teledetección | Apache-2.0 | Hugging Face |
| AgroNVILA (GRPO) | 8B | no disponible | Agrícola / teledetección | Apache-2.0 | Hugging Face |
| NVILA-Lite-8B (base) | 8B | no disponible | Generalista multimodal | no disponible en la información | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La única comparación cuantitativa disponible es interna al proyecto: AgroNVILA-SFT (59,52) frente a AgroNVILA con GRPO (59,86) en AgroMind.

## Limitaciones y advertencias

- Sesgo de dominio: entrenado exclusivamente en imágenes agrícolas y de teledetección; el rendimiento fuera de ese ámbito no está caracterizado.
- Sesgo de distribución: fuerte predominio de vistas terrestres (192.800 pares) frente a satélite (56.732) y UAV (18.587), lo que puede degradar el rendimiento relativo en las modalidades menos representadas.
- Idioma: solo inglés; no se documenta soporte de castellano ni de otros idiomas.
- Riesgo de alucinación: no evaluado en la información disponible; como todo modelo generativo multimodal, puede producir descripciones plausibles pero incorrectas de imágenes.
- Licencia: Apache-2.0 permite uso comercial, pero se hereda del modelo base NVILA-Lite-8B; conviene verificar las condiciones de dicho modelo base.
- Contexto: la longitud de contexto no está documentada, lo que dificulta planificar casos de uso con conversaciones largas o múltiples imágenes.
- Madurez: 26 descargas y 0 likes en el momento de la consulta; ecosistema de despliegue y documentación todavía muy limitados.
- Sin soporte documentado de tool calling ni de flujos agénticos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AgroOmni/AgroNVILA-SFT
- Checkpoint con GRPO: https://huggingface.co/AgroOmni/AgroNVILA
- Modelo base: https://huggingface.co/Efficient-Large-Model/NVILA-Lite-8B
- Dataset AgroOmni: https://huggingface.co/datasets/AgroOmni/AgroOmni
- Código de entrenamiento: https://github.com/Jrookie2005/AgroOmni
