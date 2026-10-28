# GroundingPI/GroundAnything-VLM

## Resumen

GroundAnything-VLM es un modelo de visión-lenguaje de 4.843.664.384 parámetros (~4,84 B) desarrollado por GroundingPI y publicado en HuggingFace con el pipeline `image-text-to-text`. Es la variante autorregresiva (AR) de la familia GroundAnything: recibe una imagen y una consulta en lenguaje natural y devuelve evidencia visual localizada —cajas delimitadoras, puntos de referencia y relaciones espaciales— en lugar de texto libre. Está orientado a *grounding* visual de vocabulario abierto, comprensión de expresiones referenciales, OCR con localización de texto y comprensión de layout de documentos.

El interés del modelo está en su posición dentro de la familia: el trabajo que lo acompaña plantea el grounding como extracción de evidencia visual y propone una variante de decodificación en paralelo (DLM, *diffusion language model*) con *blockwise denoising* y decodificación guiada por entropía. Este checkpoint AR es la referencia de calidad de esa comparación: según la model card, alcanza un 72,42 % de media en 30 benchmarks de grounding, frente al 71,35 % de GPT-6 Astra, y se mantiene competitivo con modelos de escala similar.

El repositorio ocupa 9,8 GB en safetensors, requiere `trust_remote_code` (el código de modelado es personalizado) y la model card marca `inference: false` para el pipeline estándar de HuggingFace. Los idiomas declarados son inglés y chino, y la licencia es `apache-2.0-with-upstream-kimi-k3`, que combina contribuciones propias bajo Apache 2.0 con material derivado de Kimi sujeto a la Kimi K3 License.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal autorregresivo (image-text-to-text); variante AR de la familia GroundAnything (la familia incluye además una variante DLM con decodificación en paralelo) |
| Parametros totales | 4.843.664.384 (~4,84 B) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican cuantizaciones en el repositorio; solo pesos safetensors) |
| Idiomas soportados | inglés (`en`) y chino (`zh`) |
| Licencia | `other` / `apache-2.0-with-upstream-kimi-k3`: Apache 2.0 para las contribuciones originales, con la Kimi K3 License aplicándose al material derivado de Kimi |
| Formato de pesos | safetensors (repositorio de 9,8 GB) |
| Libreria | transformers, con código de modelado personalizado (`custom_code`, requiere `trust_remote_code`) |
| Pipeline declarado | image-text-to-text |
| Fecha de publicacion | 2026-09-30 (creación); 2026-10-14 (última actualización) |
| Descargas / likes | 633 descargas, 32 likes |

## Arquitectura y entrenamiento

La información disponible describe la arquitectura a nivel de familia, no con el detalle interno del checkpoint AR. GroundAnything se presenta como un modelo fundacional de grounding de 4B parámetros que trata la predicción espacial como extracción de evidencia visual: objetos, localizaciones y relaciones espaciales están conjuntamente restringidos por la imagen y la consulta, y sus dependencias no implican un orden de generación intrínseco de izquierda a derecha. Sobre esa premisa, la familia introduce una variante de difusión bidireccional con *blockwise denoising* que genera hipótesis espaciales en paralelo y las refina iterativamente. Este repositorio contiene la variante autorregresiva, que serializa las predicciones espaciales y sirve de referencia de calidad frente a la variante paralela.

En cuanto a innovaciones técnicas, la model card documenta para la familia: decodificación guiada por entropía (que en la variante DLM eleva la media a 61,75 % frente al 53,32 % del modelo MTP LocateAnything) y un modo auto-especulativo opcional que reporta una aceleración de 4,51× respecto a la contrapartida AR con una caída de 0,74 puntos porcentuales en F1mIoU sobre COCO. No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Localización de objetos de vocabulario abierto (*open-vocabulary object detection*) sobre imágenes, devolviendo coordenadas.
- *Grounding* en escenas densas, con múltiples instancias y relaciones espaciales.
- Comprensión de expresiones referenciales (*referring-expression comprehension*): localizar el objeto descrito por una frase.
- Localización basada en puntos (*pointing*), no solo en cajas delimitadoras.
- Razonamiento espacial sobre la imagen y *grounding* de elementos de interfaz gráfica (GUI).
- OCR con localización del texto detectado en la imagen.
- Comprensión de layout de documentos.
- Localización guiada por *prompts* visuales.
- Generación de texto conversacional en formato image-text-to-text (etiqueta `conversational`).
- Soporte multilingüe limitado a inglés y chino.
- No se documentan en la información disponible capacidades de *tool calling*, *function calling*, razonamiento multi-paso como agente autónomo, audio o modo *thinking* explícito.

## Casos de uso

- **Anotación automática de datasets de detección**: usar el modelo para pre-etiquetar imágenes con cajas y puntos de vocabulario abierto, y reservar la revisión humana para corregir casos dudosos. El pipeline `image-text-to-text` permite enviar la consulta en lenguaje natural y obtener coordenadas directamente, lo que reduce el coste de arranque de un dataset nuevo.
- **Comprensión de expresiones referenciales en asistentes de accesibilidad**: dada una frase como "el botón junto al icono de ajustes", el modelo devuelve la región concreta de la imagen, lo que habilita descripciones guiadas y navegación asistida por voz sobre capturas de pantalla.
- **Grounding de elementos de GUI para agentes de automatización**: localizar botones, campos y menús en capturas de aplicaciones para que un agente de RPA o de *computer use* haga clic en las coordenadas correctas. Es adecuado porque el modelo está entrenado específicamente para *pointing* y localización de elementos de interfaz.
- **Digitalización de documentos con layout complejo**: extraer texto mediante OCR junto con su posición y estructura (tablas, columnas, encabezados) para alimentar sistemas de archivo, extracción de datos de facturas o *parsing* de formularios.
- **Percepción para robótica y agentes encarnados**: servir como módulo de percepción que traduce instrucciones en lenguaje natural a regiones de la imagen; la model card sitúa explícitamente la investigación en percepción para robótica, agentes encarnados y sistemas autónomos como caso de uso previsto.
- **Búsqueda visual y recuperación por región**: indexar imágenes por las regiones que contienen y permitir consultas del tipo "encuentra el cartel de salida en esta foto", devolviendo la caja correspondiente en lugar de una descripción textual.
- **Control de calidad en líneas de inspección visual**: localizar el componente o defecto descrito por el operario en la imagen capturada por la cámara, con la salvedad de que el modelo no está presentado como clasificador de defectos y requeriría validación por dominio.

## Benchmarks y rendimiento

Los datos publicados en la model card son agregados sobre conjuntos de *grounding*, no benchmarks de propósito general (MMLU, HumanEval, GSM8K no aparecen en la información disponible).

| Evaluación | GroundAnything-VLM (AR) | Referencia comparada |
|---|---|---|
| Media en 30 benchmarks de grounding | 72,42 % | GPT-6 Astra: 71,35 % |
| Media con decodificación guiada por entropía (variante DLM, no este checkpoint) | 61,75 % | LocateAnything (MTP): 53,32 % |
| Aceleración del modo auto-especulativo (variante DLM frente a la AR) | 4,51× | Caída de 0,74 pp en F1mIoU sobre COCO en el punto de operación reportado |

Advertencia de lectura: la comparación 61,75 % frente a 53,32 % corresponde a la variante de decodificación en paralelo (DLM), no a los pesos de este repositorio. La model card no publica el desglose por benchmark ni los resultados individuales de los 30 conjuntos.

## Requisitos de hardware

- **VRAM estimada (cálculo a partir del tamaño de parámetros, no publicado por el autor)**: en BF16/FP16 los pesos ocupan ~9,7 GB, por lo que la inferencia completa necesita del orden de 12-16 GB contando activaciones y caché. En cuantización de 8 bits bajaría a ~5-6 GB y en 4 bits a ~3-4 GB, pero no se publican cuantizaciones oficiales.
- **GPU de centro de datos**: A100 (40/80 GB), H100 y L40S son opciones holgadas para los pesos en precisión completa y permiten lote mayor.
- **GPU de consumo**: sí cabe en tarjetas de 24 GB (RTX 3090, RTX 4090) en BF16; en 16 GB (RTX 4070 Ti SUPER, RTX 4080) queda ajustado y probablemente requiera cuantización. En 8-12 GB no es viable en precisión completa.
- **Opciones de despliegue**: `transformers` con `trust_remote_code=True` es la vía documentada, dado el código de modelado personalizado. No hay confirmación de soporte en vLLM, TGI, llama.cpp u Ollama, y no se distribuyen pesos GGUF. La model card marca `inference: false`, lo que implica que el pipeline genérico de HuggingFace no está habilitado.
- **Latencia y throughput**: no disponibles para este checkpoint. El único dato de velocidad publicado (4,51×) corresponde a la variante DLM con modo auto-especulativo frente a la AR, no a una medición absoluta de este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en grounding | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GroundAnything-VLM (este repo) | 4,84 B | no disponible | 72,42 % (media de 30 benchmarks) | apache-2.0-with-upstream-kimi-k3 | Pesos en HF y ModelScope, safetensors |
| GroundAnything (DLM, paralelo) | 4 B (según model card) | no disponible | 61,75 % con decodificación guiada por entropía | Apache 2.0 con material upstream | Pesos en HF y ModelScope |
| LocateAnything (basado en MTP) | no disponible | no disponible | 53,32 % (misma media) | no disponible | no disponible |
| GPT-6 Astra | no disponible (propietario) | no disponible | 71,35 % (misma media) | propietaria | solo API, no disponible en abierto |

Las cifras de la variante DLM y de LocateAnything no son directamente comparables con las de la primera fila: la model card las presenta en el contexto de decodificación en paralelo y no aclara si comparten exactamente el mismo protocolo de evaluación que el 72,42 % del checkpoint AR.

## Limitaciones y advertencias

- **Cobertura de idiomas muy reducida**: solo inglés y chino declarados. El rendimiento en castellano no está documentado y previsiblemente será inferior; no debe asumirse paridad.
- **Riesgo de alucinación espacial**: en modelos de *grounding*, el fallo típico no es inventar objetos de texto sino devolver coordenadas plausibles pero incorrectas, o cajas que cubren parcialmente el objeto. Requiere umbrales de confianza y validación en producción.
- **Licencia con componente upstream**: la Kimi K3 License se aplica al material derivado de Kimi y sus obras derivadas, y sus condiciones siguen vigentes al usar o redistribuir el paquete combinado. Es imprescindible revisar `LICENSE` antes de un uso comercial o de redistribuir pesos combinados.
- **Falta de datos operativos clave**: no se publica longitud de contexto máxima, ni cuantizaciones oficiales, ni latencia/throughput absolutos. Esto complica la planificación de capacidad.
- **Integración no trivial**: `custom_code` y `inference: false` implican dependencia de la implementación del autor y posibles fricciones con servidores de inferencia estándar.
- **Evaluación agregada**: el 72,42 % es una media sobre 30 benchmarks sin desglose, por lo que no permite estimar el rendimiento en un dominio concreto (por ejemplo, documentos médicos o imágenes aéreas).
- **Alcance funcional acotado**: está diseñado para extracción de evidencia visual; no es un modelo de chat general ni se han publicado resultados en tareas de razonamiento textual, matemáticas o generación de código.
- **Model card incompleta en el material disponible**: el texto proporcionado aparece truncado al final, por lo que pueden existir secciones adicionales (detalles de entrenamiento, limitaciones declaradas por el autor) no contempladas aquí.
- **Sesgos**: no se documenta en la información disponible ningún análisis de sesgos demográficos, geográficos o culturales del dataset de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/GroundingPI/GroundAnything-VLM
- Variante DLM de la familia: https://huggingface.co/GroundingPI/GroundAnything
- Demo online (HuggingFace Spaces): https://huggingface.co/spaces/GroundingPI/GroundAnything-VLM
- Página del proyecto: https://groundingpi.github.io/groundanything/
- Código en GitHub: https://github.com/groundingpi/GroundAnything
- Paper: https://arxiv.org/abs/2609.39600
- Página del paper en HuggingFace: https://huggingface.co/papers/2609.39600
- ModelScope (DLM): https://www.modelscope.ai/models/GroundingPI/GroundAnything
- ModelScope (VLM): https://www.modelscope.ai/models/GroundingPI/GroundAnything-VLM
- Licencia: https://huggingface.co/GroundingPI/GroundAnything-VLM/blob/main/LICENSE
