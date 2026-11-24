# mradermacher/Diogenes-9B-v1-i1-GGUF

## Resumen

Diogenes-9B-v1 es un modelo de lenguaje de 9.197.093.888 parámetros (aproximadamente 9,2 mil millones) desarrollado por TendieLabs, publicado originalmente en formato BF16 y aquí redistribuido por mradermacher como cuantizaciones GGUF con calibración imatrix. El modelo se construye sobre una base Qwen3.5 (según las etiquetas del repositorio) y se obtiene mediante la fusión de un adaptador LoRA entrenado con supervisión sobre el dataset NousResearch/arete-data-pairs, con un objetivo declarado de transferencia de comportamiento y orientación a la investigación.

La relevancia de esta ficha concreta reside en que el repositorio de mradermacher no contiene los pesos originales, sino un conjunto amplio de cuantizaciones GGUF (desde i1-Q2_K de 4,0 GB hasta i1-Q6_K de 7,7 GB) pensadas para ejecución local con llama.cpp y derivados. Esto permite desplegar un modelo de 9B en hardware de consumo, algo imposible con el BF16 original, que requiere del orden de 18 GB solo para los pesos.

La información publicada por el autor es escasa: no se detallan la longitud de contexto, los idiomas soportados (la model card solo declara inglés), la licencia ni resultados de benchmarks. Las etiquetas incluyen términos como "vision", "mtp" y "merged", pero la model card no desarrolla ninguno de ellos, por lo que deben tratarse como indicios y no como especificaciones confirmadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.5, según etiquetas del repositorio); detalles no disponibles |
| Parametros totales | 9.197.093.888 (9,2B) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF: i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-IQ4_NL, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (calibradas con imatrix) |
| Idiomas soportados | Inglés (declarado en la model card); no se detallan otros |
| Licencia | No disponible |
| Formato de pesos | GGUF (este repositorio); el modelo base se distribuye en BF16 |
| Modelo base | TendieLabs/Diogenes-9B-v1 |
| Dataset de entrenamiento | NousResearch/arete-data-pairs |
| Tamaño del repositorio | 81,3 GB |

## Arquitectura y entrenamiento

La model card del repositorio cuantizado no describe la arquitectura interna. Las etiquetas apuntan a una base Qwen3.5, a una fusión de LoRA ("merged", "lora") y a un ajuste supervisado ("supervised-fine-tuning") sobre NousResearch/arete-data-pairs, con el objetivo declarado de "behavior-transfer". No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO. Tampoco se documenta ninguna innovación técnica concreta (atención lineal, decodificación especulativa, etc.).

El proceso de cuantización sí está documentado con precisión: mradermacher genera cuantizaciones i1 (imatrix) usando un fichero de calibración propio (`Diogenes-9B-v1.imatrix.gguf`, 0,1 GB), lo que en la práctica mejora la perplejidad de las cuantizaciones de baja precisión respecto a las estáticas. El autor indica que las versiones estáticas equivalentes están en el repositorio `mradermacher/Diogenes-9B-v1-GGUF`.

## Capacidades

- Generación de texto conversacional: la etiqueta "conversational" y el pipeline declarado apuntan a un uso de diálogo multi-turno.
- Transferencia de comportamiento: el entrenamiento se orienta explícitamente a reproducir estilos o conductas del dataset de referencia, no solo a mejorar precisión en tareas.
- Capacidad de visión: la model card afirma "This is a vision model", pero no detalla el codificador visual ni aporta ficheros mmproj en este repositorio (indica que, si existen, estarán en el repositorio estático).
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: solo se declara inglés; no hay evidencia de otros idiomas.
- Modo "thinking" o razonamiento extendido: la etiqueta "mtp" aparece en el repositorio, pero su significado no se explica en la model card.

## Casos de uso

- Experimentación en investigación sobre transferencia de comportamiento: el modelo está etiquetado como "research" y entrenado sobre pares de datos de NousResearch, por lo que encaja en estudios que comparan la fidelidad de la transferencia de estilo frente al modelo base.
- Despliegue local en estaciones de trabajo con GPU de consumo: las cuantizaciones i1-Q4_K_M (5,9 GB) e i1-Q5_K_M (6,7 GB) permiten ejecutar un modelo de 9B en tarjetas con 8-12 GB de VRAM mediante llama.cpp u Ollama, sin depender de servicios en la nube.
- Prototipado de asistentes conversacionales en inglés: la orientación conversacional y el tamaño contenido permiten iterar rápidamente sobre prompts y flujos de diálogo antes de escalar a modelos mayores.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece 15 variantes con distintos compromisos tamaño/calidad, útil para medir el impacto de la cuantización en tareas concretas antes de fijar una configuración de producción.
- Generación de datos sintéticos y aumento de datasets: un modelo de 9B ajustado por comportamiento puede producir respuestas de estilo controlado para alimentar pipelines de anotación o destilación.
- Pruebas de concepto de pipelines multimodales: si se confirma la naturaleza vision del modelo y se localizan los ficheros mmproj en el repositorio estático, podría emplearse para tareas básicas de descripción de imágenes en local; conviene verificar esta capacidad antes de integrarla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin caché KV): i1-Q2_K ≈ 4,0 GB; i1-Q3_K_M ≈ 4,8 GB; i1-Q4_K_M ≈ 5,9 GB; i1-Q5_K_M ≈ 6,7 GB; i1-Q6_K ≈ 7,7 GB. Hay que sumar la caché KV, cuyo tamaño depende de la longitud de contexto efectiva, no documentada.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y RTX 4090 para cuantizaciones Q4-Q6 con contexto amplio; A100/H100 solo tienen sentido si se busca throughput alto o servir muchas peticiones concurrentes.
- Cabe en GPU de consumo: sí, en cualquier tarjeta con 8 GB o más usando cuantizaciones Q3-Q4; con 6 GB solo las variantes Q2/Q3 y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y servidores compatibles con GGUF; el repositorio declara `endpoints_compatible`. Para BF16 haría falta vLLM o TGI, pero este repositorio no incluye esos pesos.
- Latencia y throughput: no disponibles; dependen de la GPU, la cuantización y el backend, y no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato disponible | Notas |
|---|---|---|---|---|---|
| Diogenes-9B-v1 (este) | 9,2B | No disponible | No disponible | GGUF (i1 y estático), BF16 en el repo base | Ajuste por comportamiento sobre base Qwen3.5 |
| Qwen2.5-7B-Instruct | 7,6B | 32.768 tokens (128K con RoPE) | Apache 2.0 | Safetensors, GGUF, AWQ, GPTQ | Referencia consolidada en 7-8B con licencia permisiva |
| Llama 3.1 8B Instruct | 8,0B | 131.072 tokens | Llama 3.1 Community License | Safetensors, GGUF | Amplio ecosistema y herramientas de despliegue |
| Mistral 7B Instruct v0.3 | 7,2B | 32.768 tokens | Apache 2.0 | Safetensors, GGUF | Alternativa ligera con licencia permisiva |

La comparación es aproximada: no hay datos públicos de rendimiento de Diogenes-9B-v1 que permitan situarlo frente a estos modelos en MMLU, HumanEval o GSM8K, y su licencia sin especificar impide confirmar si el uso comercial está permitido.

## Limitaciones y advertencias

- Licencia no disponible: no puede asumirse uso comercial permitido; hay que consultar el repositorio base TendieLabs/Diogenes-9B-v1 antes de cualquier despliegue en producción.
- Idiomas: solo se declara inglés; el rendimiento en castellano no está verificado y probablemente sea inferior.
- Contexto desconocido: sin longitud de contexto publicada, el dimensionado de memoria y la idoneidad para documentos largos son inciertos.
- Riesgo de alucinación: inherente a los modelos de 9B ajustados por comportamiento; no se han publicado evaluaciones de fidelidad factual.
- Capacidad de visión no confirmada: la model card la menciona, pero no se aportan ficheros mmproj ni detalles del codificador en este repositorio.
- Origen del ajuste: al ser una fusión de LoRA sobre pares de datos de un dataset concreto, puede reproducir sesgos de estilo y contenido de ese dataset.
- Cuantizaciones de baja precisión: i1-Q2_K e i1-IQ3_XXS degradan la calidad de forma notable; para uso serio conviene Q4_K_M o superior.
- Soporte comunitario limitado: el repositorio registra 2.632 descargas y 1 like en el momento de la consulta, lo que reduce la probabilidad de encontrar incidencias resueltas o guías específicas.

## Enlaces

- Repositorio Hugging Face (este): https://huggingface.co/mradermacher/Diogenes-9B-v1-i1-GGUF
- Modelo base: https://huggingface.co/TendieLabs/Diogenes-9B-v1
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/Diogenes-9B-v1-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#Diogenes-9B-v1-i1-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/NousResearch/arete-data-pairs
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
