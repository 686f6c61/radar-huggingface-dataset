# s-ryoma/jolly-harbor

## Resumen

Jolly-harbor es un modelo publicado por el usuario s-ryoma en Hugging Face bajo el identificador `s-ryoma/jolly-harbor`. Se distribuye en formato safetensors para la librería transformers y está etiquetado con la arquitectura `llada`, lo que lo vincula a la familia de modelos de difusión discreta para generación de texto (LLaDA) en lugar de los transformers autorregresivos convencionales. El pipeline declarado es `feature-extraction`, aunque la arquitectura subyacente está orientada a la modelización del lenguaje.

El modelo cuenta con 8.015.581.184 parámetros totales (aproximadamente 8 mil millones) y un repositorio de 16 GB, lo que sugiere pesos en precisión bf16/fp16 sin cuantizar. No se han publicado datos sobre longitud de contexto, idiomas soportados, licencia ni composición del dataset de entrenamiento. El acceso está restringido (gated): es necesario aceptar condiciones en Hugging Face antes de poder descargar los pesos.

La relevancia de este modelo radica en su arquitectura LLaDA, una alternativa a la generación autorregresiva token a token que emplea un proceso de difusión sobre tokens discretos. Al tratarse de una publicación con cero descargas y cero likes en el momento de la consulta, y sin documentación asociada (model card sin detalles técnicos), debe considerarse un artefacto de investigación de trazabilidad limitada y no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaDA (difusión discreta para lenguaje, según tag `llada`) |
| Parametros totales | 8.015.581.184 (~8,0 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo solo con safetensors; sin GGUF publicado) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Pipeline declarado | feature-extraction |
| Requiere código personalizado | sí (`custom_code`) |
| Acceso | restringido (gated) |
| Tamano del repositorio | 16,0 GB |

## Arquitectura y entrenamiento

El tag `llada` sitúa el modelo en la familia LLaDA (Large Language Diffusion with mAsking), que sustituye la generación autorregresiva por un proceso de difusión enmascarada sobre tokens discretos: el modelo aprende a reconstruir tokens enmascarados a partir de contexto parcial, y en inferencia genera texto mediante un esquema iterativo de desenmascarado. Esta formulación permite, en principio, generación bidireccional y paralela, a diferencia de los decodificadores causales clásicos. No obstante, la información proporcionada no confirma la variante exacta (tamano de la familia LLaDA, número de capas, dimensión oculta, cabezas de atención ni vocabulario).

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del corpus, si hubo fases de instrucción (SFT), alineamiento (RLHF/DPO) o ajuste específico para feature-extraction. El repositorio incluye código personalizado (`custom_code`), lo que implica que la carga del modelo requiere `trust_remote_code=True` y que la implementación de la arquitectura no es la estándar del paquete transformers. Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Modelización del lenguaje mediante difusión discreta (LLaDA), con generación iterativa por desenmascarado de tokens.
- Extracción de representaciones (pipeline `feature-extraction` declarado), potencialmente utilizable para embeddings de texto.
- Generación de texto condicionada por contexto, sujeta a la variante LLaDA concreta (no confirmada).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (sin lista de idiomas publicada).
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Investigación en modelos de difusión para lenguaje: el modelo sirve como artefacto para estudiar la formulación LLaDA frente a decodificadores autorregresivos, comparando curvas de desenmascarado y calidad de muestreo en entornos controlados.
- Extracción de embeddings experimentales: dado el pipeline `feature-extraction`, puede emplearse para obtener representaciones vectoriales de texto en tareas de similitud o recuperación, previa validación empírica.
- Reproducción de experimentos académicos: útil para replicar resultados de la familia LLaDA con un checkpoint de ~8 B parámetros en bf16 (16 GB).
- Evaluación comparativa de arquitecturas: como punto de comparación frente a transformers causales de tamano similar en benchmarks de generación y perplejidad.
- Prototipado interno con acceso controlado: el carácter gated permite su uso en entornos de investigación con condiciones de acceso aceptadas.
- Fine-tuning exploratorio: base de partida para ajuste supervisado en dominios específicos, siempre que la licencia (no disponible) lo permita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: ~16 GB solo para pesos, más overhead de activaciones y caché; en la práctica, se recomienda ≥24 GB.
- Cuantización a 8 bits: ~8 GB de pesos; a 4 bits: ~4-5 GB, aunque no se publican ficheros GGUF ni cuantizaciones oficiales.
- GPU recomendadas: A100 40/80 GB, H100 para despliegue en producción; RTX 4090 (24 GB) viable en bf16 con lote pequeno.
- GPU de consumo: posible en RTX 3090/4090 (24 GB) en bf16; en GPUs de 16 GB requeriría cuantización no oficial.
- Opciones de despliegue: transformers con `trust_remote_code=True`; vLLM, llama.cpp, Ollama y TGI no están confirmados para arquitecturas LLaDA y requerirían implementación específica.
- Latencia y throughput: no disponibles; la generación por difusión iterativa implica un número de pasos de desenmascarado configurable, lo que afecta directamente a la latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| s-ryoma/jolly-harbor | ~8,0 B | no disponible | LLaDA (difusión) | no disponible | gated |
| LLaDA 8B (referencia de familia) | ~8 B | no disponible en esta ficha | Difusión enmascarada | no disponible | pública (referencia) |
| Llama 3.1 8B | 8,0 B | 128 K | Transformer causal | Llama 3.1 Community | pública |
| Mistral 7B v0.3 | 7,2 B | 32 K | Transformer causal | Apache 2.0 | pública |

La comparación con Llama 3.1 8B y Mistral 7B se ofrece únicamente como referencia de tamano y categoría; no se dispone de datos de rendimiento de jolly-harbor que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Ausencia total de model card: no hay información sobre dataset, sesgos, idiomas ni evaluación, lo que impide auditar el modelo.
- Licencia no disponible: no puede asumirse uso comercial; debe verificarse antes de cualquier despliegue.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que puede limitar la reproducibilidad.
- Riesgo de alucinación: inherente a los modelos generativos; sin evaluación publicada no puede acotarse.
- Requiere `trust_remote_code=True`: ejecuta código del repositorio, con el riesgo de seguridad asociado.
- Arquitectura LLaDA: el ecosistema de herramientas (vLLM, llama.cpp) no la soporta de forma nativa, lo que complica el despliegue en producción.
- Sin cuantizaciones oficiales ni datos de throughput: la planificación de infraestructura es especulativa.
- Cero descargas y cero likes: sin validación comunitaria, la calidad del checkpoint es desconocida.

## Enlaces

- Hugging Face: https://huggingface.co/s-ryoma/jolly-harbor
- Paper de LLaDA (referencia de arquitectura): no disponible en la información proporcionada
- Repositorio de código: no disponible
- Demo: no disponible
