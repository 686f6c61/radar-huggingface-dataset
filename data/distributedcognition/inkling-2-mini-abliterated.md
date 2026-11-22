# distributedcognition/Inkling-2-Mini-abliterated

## Resumen

Inkling-2-Mini-abliterated es una variante "abliterated" del modelo multimodal Inkling-2-Mini desarrollado por Thinking Machines. La versión abliterated la publica el usuario distributedcognition en Hugging Face y consiste en la eliminación de la dirección de rechazo en el espacio de activaciones del modelo base, una técnica que busca reducir las negativas del modelo ante peticiones que el original rechazaría. El modelo mantiene la arquitectura y capacidades del original: un transformer de tipo mixture-of-experts (MoE) con pipeline image-text-to-text, es decir, capaz de procesar imágenes y texto y generar texto.

El modelo cuenta con 26.388.646.440 parámetros totales según los pesos en safetensors, y el repositorio ocupa 20,6 GB, lo que sugiere pesos cuantizados en 8 bits (los tags incluyen nvfp4, mxfp8, modelopt y 8-bit). Está pensado para entornos de investigación y para desarrolladores que necesitan un modelo multimodal con menos restricciones de rechazo, aunque con las advertencias de seguridad y licencia que se detallan más abajo.

Es relevante ahora porque combina tres tendencias: modelos MoE multimodales de tamaño medio, cuantización agresiva para despliegue en hardware limitado y variantes abliterated que permiten estudiar el comportamiento de rechazo y alineación en modelos abiertos. La licencia es Apache 2.0, pero el acceso está restringido (gated) y requiere aceptar condiciones en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer mixture-of-experts (MoE), multimodal image-text-to-text (tag `inkling2_loop`) |
| Parametros totales | 26.388.646.440 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos en 8 bits (tags `8-bit`, `nvfp4`, `mxfp8`, `modelopt`); cuantizaciones adicionales no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Mini, del que deriva esta variante, emplea una arquitectura transformer de tipo mixture-of-experts con capacidad multimodal de entrada (imagen y texto) y salida de texto, según el pipeline declarado `image-text-to-text` y el tag de arquitectura `inkling2_loop`. Los pesos publicados están cuantizados en 8 bits mediante NVIDIA ModelOpt, con formatos nvfp4 y mxfp8, lo que explica que 26.388 millones de parámetros ocupen 20,6 GB en el repositorio.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF o DPO en el modelo base. La variante abliterated aplica una modificación post-entrenamiento sobre las activaciones para eliminar la dirección de rechazo, sin reentrenar los pesos originales. No se han publicado detalles técnicos sobre el procedimiento exacto de abliteración empleado por distributedcognition.

## Capacidades

- Generación de texto conversacional multi-turno (tag `conversational`).
- Comprensión de imágenes y texto combinados, con generación de texto a partir de ellos (pipeline image-text-to-text).
- Razonamiento y respuesta a instrucciones heredados del modelo base Inkling-2-Mini.
- Comportamiento con menor tasa de rechazo ante peticiones que el modelo original denegaría, por efecto de la abliteración.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Soporte de tool calling, agentes o modo thinking: no disponible en la información proporcionada.
- Capacidades multilingües específicas: no disponible.

## Casos de uso

- Investigación sobre alineación y rechazo: el modelo permite estudiar cómo cambia la tasa de negativas y la calidad de respuesta al eliminar la dirección de rechazo, comparándolo con el modelo base thinkingmachines/Inkling-2-Mini en el mismo conjunto de prompts.
- Análisis de documentos con imágenes: al ser image-text-to-text, puede extraer y resumir información de capturas, diagramas o documentos escaneados en flujos de procesamiento por lotes.
- Asistentes conversacionales sin filtros restrictivos: para prototipos internos donde se necesita que el modelo responda a peticiones creativas o de rol que el original rechazaría, con revisión humana posterior.
- Evaluación de cuantización: los pesos en 8 bits con nvfp4 y mxfp8 permiten medir la degradación de calidad frente al modelo base en tareas de visión y texto, útil para decidir formatos de despliegue.
- Generación de descripciones y etiquetado de imágenes a escala: el pipeline image-text-to-text sirve para anotar datasets de imágenes con descripciones en lenguaje natural.
- Experimentación con arquitecturas MoE multimodales: con 26.388 millones de parámetros totales y pesos en 8 bits, es un banco de pruebas asequible para estudiar enrutamiento de expertos y comportamiento multimodal en hardware de gama alta para consumidores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan 20,6 GB en 8 bits, por lo que se necesitan al menos 24 GB de VRAM para cargar el modelo completo con margen para el contexto y las activaciones.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para despliegue en producción; RTX 4090 (24 GB) puede ser suficiente para inferencia con contexto corto.
- GPU de consumo: cabe en RTX 4090 y en GPUs con 24 GB o más; en GPUs de 16 GB requeriría cuantizaciones adicionales no publicadas en el repositorio.
- Opciones de despliegue: transformers (librería declarada); compatibilidad con vLLM, llama.cpp, Ollama o TGI no está confirmada en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Acceso |
|---|---|---|---|---|---|
| Inkling-2-Mini-abliterated | 26,4 B (MoE) | no disponible | imagen-texto a texto | Apache 2.0 | gated |
| thinkingmachines/Inkling-2-Mini | no disponible | no disponible | imagen-texto a texto | no disponible | no disponible |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables de la misma familia o tamaño en la documentación proporcionada.

## Limitaciones y advertencias

- La abliteración elimina la dirección de rechazo, lo que reduce las barreras de seguridad del modelo base y aumenta el riesgo de generar contenido dañino, ilegal o sesgado; no debe desplegarse en producción orientada a usuarios sin filtros externos.
- Riesgo de alucinación inherente a los modelos generativos; la abliteración puede agravar la confianza con la que el modelo presenta información incorrecta.
- No se han publicado datos sobre sesgos, idiomas soportados ni longitud de contexto, lo que impide garantizar su comportamiento en dominios específicos.
- El acceso está restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargar los pesos.
- Aunque la licencia es Apache 2.0, el uso comercial debe verificar las condiciones del modelo base y las obligaciones de atribución.
- Los pesos están cuantizados en 8 bits; no se garantiza paridad de calidad con el modelo base en precisión completa, y no se ofrecen otras cuantizaciones en el repositorio.
- El repositorio registra 0 descargas y 0 likes, por lo que no hay evidencia comunitaria de validación ni reportes de fallos.

## Enlaces

- Hugging Face: https://huggingface.co/distributedcognition/Inkling-2-Mini-abliterated
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
