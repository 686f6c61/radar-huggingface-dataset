# Smorillas/shieldgemma-2-4b-it-gemma3-vllm

## Resumen

ShieldGemma 2 4B IT es un modelo multimodal de clasificación de seguridad de contenido desarrollado por Google, construido sobre la arquitectura Gemma 3. Su función principal es evaluar si una imagen (y opcionalmente un texto asociado) infringe una o varias políticas de seguridad predefinidas, devolviendo una probabilidad de violación por cada política evaluada. No es un modelo generativo de propósito general, sino un clasificador especializado pensado para integrarse como filtro en pipelines de moderación.

El repositorio `Smorillas/shieldgemma-2-4b-it-gemma3-vllm` es una conversión del modelo original `google/shieldgemma-2-4b-it` empaquetada específicamente para su uso con vLLM. Incluye pesos en formato safetensors y metadatos de arquitectura Gemma 3, con un total de 4.300.079.472 parámetros y un tamaño de repositorio de 8,6 GB. No se trata de un fine-tuning ni de una variante con datos adicionales, sino de una redistribución del modelo base adaptada al runtime de vLLM.

La relevancia de esta ficha radica en que el modelo original de Google es una pieza clave para sistemas de moderación multimodal en producción, y esta conversión facilita su despliegue con un servidor de inferencia de alto rendimiento. El acceso está restringido (gated) y requiere aceptar las condiciones de uso en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 3), image-text-to-text |
| Parametros totales | 4.300.079.472 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors; vLLM soporta cuantizacion en runtime) |
| Idiomas soportados | no disponible |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors |
| Libreria / runtime | vLLM |
| Modelo base | google/shieldgemma-2-4b-it |
| Acceso | restringido (gated) |
| Tamano del repositorio | 8,6 GB |
| Pipeline | image-text-to-text |
| Region | us |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Gemma 3 en su variante de 4B parámetros, con capacidad de procesamiento conjunto de imagen y texto (image-text-to-text). ShieldGemma 2 está diseñado como clasificador de seguridad: recibe una imagen y, opcionalmente, un prompt textual, junto con una definición de política de seguridad, y produce una puntuación de probabilidad de que el contenido viole dicha política. La arquitectura concreta de la torre visual, la resolución de entrada y el mecanismo de fusión multimodal no están detallados en la información proporcionada.

No se dispone de datos sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO en la información disponible. El repositorio en cuestión es una conversión de formato para vLLM del modelo original de Google, por lo que las características de entrenamiento son las del modelo base `google/shieldgemma-2-4b-it`, cuyos detalles completos no se incluyen en la información proporcionada.

## Capacidades

- Clasificación de seguridad de contenido multimodal: evalúa imágenes (y texto asociado) contra políticas de seguridad configurables.
- Salida de probabilidad por política: devuelve una puntuación de violación para cada política evaluada, lo que permite umbrales ajustables.
- Procesamiento image-text-to-text: acepta entradas que combinan imagen y texto.
- Integración con vLLM: los pesos están empaquetados para servirse mediante el motor de inferencia vLLM.
- Soporte conversacional: etiquetado como conversational, adecuado para flujos de evaluación por turnos.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, visión, audio: dispone de visión (image-text-to-text); modo thinking y audio no disponibles en la información proporcionada.

## Casos de uso

- Moderación de imágenes generadas por usuarios: el modelo se sitúa como filtro previo a la publicación, evaluando cada imagen contra políticas de contenido (violencia, desnudez, etc.) y devolviendo probabilidades que el backend compara con umbrales configurables.
- Filtrado de contenido en plataformas de compartición de imágenes: integrado en el pipeline de subida, clasifica lotes de imágenes mediante vLLM para detectar violaciones antes de que lleguen a revisión humana.
- Moderación de conversaciones con adjuntos: en chats que permiten enviar imágenes, el modelo evalúa conjuntamente el texto y la imagen del turno para detectar contenido inseguro en contexto.
- Pre-filtrado para equipos de trust and safety: reduce la carga de revisión manual priorizando los casos con mayor probabilidad de violación según la política configurada.
- Generación de datasets de seguridad: uso del clasificador para etiquetar automáticamente grandes volúmenes de pares imagen-texto con puntuaciones de seguridad, alimentando el entrenamiento de otros modelos de moderación.
- Cumplimiento normativo en entornos regulados: despliegue como capa de verificación auditable que registra probabilidades por política, útil para demostrar controles de contenido en plataformas sujetas a requisitos legales.
- Servicio de inferencia de alto rendimiento: al estar empaquetado para vLLM, permite servir el clasificador con batching continuo y aprovechar las optimizaciones de memoria del motor en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4.300 millones de parámetros en safetensors (aproximadamente 8,6 GB de pesos en precisión de 16 bits), se requiere del orden de 9-10 GB de VRAM solo para los pesos, más memoria para el procesador de visión y el KV cache. En cuantización de 8 bits bajaría a unos 5-6 GB y en 4 bits a unos 3-4 GB, aunque los tipos de cuantización concretos no están disponibles en la información proporcionada.
- GPU recomendadas: A100, H100 o L40S para despliegues de producción con vLLM y concurrencia alta; RTX 4090 (24 GB) para desarrollo y serving de baja concurrencia.
- GPU de consumo: cabe en GPUs consumer con 12 GB o más de VRAM en precisión de 16 bits (por ejemplo, RTX 3060 12 GB, RTX 4070, RTX 4090); en cuantización de 8 o 4 bits podría caber en GPUs de 8 GB, aunque no hay datos confirmados.
- Opciones de despliegue: vLLM es el runtime objetivo del repositorio; otras opciones como llama.cpp, Ollama o TGI no están confirmadas en la información proporcionada para esta conversión concreta.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Acceso |
|---|---|---|---|---|---|
| Smorillas/shieldgemma-2-4b-it-gemma3-vllm | 4,3B | no disponible | imagen + texto | gemma | gated |
| google/shieldgemma-2-4b-it (modelo base) | 4,3B | no disponible | imagen + texto | gemma | gated |
| ShieldGemma (primera generación, solo texto) | no disponible | no disponible | texto | gemma | no disponible |
| Llama Guard 3 (Meta) | no disponible | no disponible | texto | llama | no disponible |

La comparación con alternativas multimodales de moderación queda limitada por la ausencia de datos de rendimiento y contexto en la información proporcionada. La diferencia principal de esta conversión frente al modelo base es el empaquetado para vLLM, no una mejora en capacidades.

## Limitaciones y advertencias

- El acceso es restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargar los pesos.
- Licencia Gemma: el uso comercial está sujeto a los Gemma Terms of Use, que incluyen restricciones de uso aceptable y obligaciones de atribución; conviene revisarlas antes de desplegar en producción.
- Es un clasificador de seguridad, no un modelo generativo de propósito general: no debe usarse para generación de texto o razonamiento abierto.
- Riesgo de falsos positivos y falsos negativos inherente a cualquier clasificador de contenido; los umbrales deben calibrarse con datos propios.
- Sesgos conocidos: no disponibles en la información proporcionada; deben evaluarse empíricamente sobre el dominio objetivo.
- Riesgo de alucinación: no disponible en la información proporcionada para este modelo clasificador.
- Limitaciones de contexto e idioma: no disponibles en la información proporcionada.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: es una conversión reciente y poco validada por la comunidad, por lo que conviene verificar la integridad de los pesos frente al modelo base antes de usarla en producción.
- La fecha de creación del repositorio (2026-11-17) es posterior a la fecha habitual de publicación de modelos Gemma 3; verificar la procedencia y autenticidad de los pesos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Smorillas/shieldgemma-2-4b-it-gemma3-vllm
- Modelo base: https://huggingface.co/google/shieldgemma-2-4b-it
- Licencia Gemma: https://ai.google.dev/gemma/terms
- vLLM: https://github.com/vllm-project/vllm
