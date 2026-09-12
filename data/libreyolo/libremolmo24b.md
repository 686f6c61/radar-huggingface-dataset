# LibreYOLO/LibreMolmo24b

## Resumen

LibreMolmo24b es un espejo (mirror) del modelo multimodal allenai/Molmo2-4B, publicado por LibreYOLO para su integración en tareas de *pointing* sobre imagen única. No se trata de un reentrenamiento ni de un ajuste fino: según la propia model card, los pesos, el tokenizador, la configuración y el código remoto del modelo son idénticos a los del snapshot de Ai2 fijado en el commit `042abfa7a38879a376cec03d949eff0aefaa0600`. El repositorio pesa 19,4 GB y contiene 4.850.869.200 parámetros en formato safetensors.

El modelo pertenece a la familia Molmo2 (image-text-to-text) y se distribuye bajo licencia Apache-2.0, lo que permite uso comercial sin restricciones adicionales más allá de las obligaciones de atribución habituales. La relevancia de esta ficha es doble: por un lado, documenta una variante de despliegue concreta de un VLM de ~4,85 B de parámetros; por otro, advierte de que la integración de LibreYOLO restringe el uso a *pointing* de un solo objeto, con confianza sintética fija de 1.0 y sin soporte de detección, entrenamiento, validación, exportación ni seguimiento de puntos.

Conviene señalar que el repositorio no incluye resultados de benchmarks, no declara longitud de contexto, no especifica idiomas soportados y no publica cuantizaciones propias. Cualquier evaluación de calidad debe remitirse al modelo base de Ai2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia Molmo2 de Ai2, vision-language model con `custom_code` remoto) |
| Parametros totales | 4.850.869.200 (~4,85 B) |
| Parametros activos | no aplica (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors; no se anuncian GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (con código de modelo remoto fijado a un snapshot; requiere Transformers 4.57.1) |

Datos adicionales: tamaño del repositorio 19,4 GB; pipeline declarado `image-text-to-text`; etiquetas `libreyolo`, `molmo2`, `pointing`, `custom_code`, `conversational`; modelo base `allenai/Molmo2-4B`; creado el 2026-09-12; 0 descargas y 0 likes en el momento de la consulta.

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo: al ser un espejo, la model card de LibreYOLO no documenta capas, mecanismos de atención, encoder visual ni estrategia de fusión multimodal. Lo único verificable es que se trata de un modelo de la familia Molmo2 orientado a `image-text-to-text` y que su ejecución depende de código remoto (`custom_code`) incluido en el snapshot, lo que implica que el grafo real del modelo no está definido únicamente por los pesos safetensors.

Tampoco hay datos sobre entrenamiento: no se indica número de tokens, composición del dataset, uso de RLHF/DPO ni innovaciones técnicas concretas. Sí se puede inferir un detalle de formato: 4.850.869.200 parámetros ocupando 19,4 GB corresponden a aproximadamente 4 bytes por parámetro, es decir, pesos almacenados en precisión de 32 bits (fp32) o equivalente. Cualquier precisión reducida (bf16, fp16, cuantización de 8 o 4 bits) requeriría conversión posterior por parte del usuario.

## Capacidades

- Generación de texto e imagen-a-texto (`image-text-to-text`): el pipeline declarado admite entradas de imagen junto con texto.
- *Pointing* sobre imagen única: es la tarea por defecto y la única soportada explícitamente por la integración de LibreYOLO, con salida en coordenadas (`result.points.xy`).
- Uso conversacional: la etiqueta `conversational` sugiere compatibilidad con diálogo multimodal, aunque no se detalla el comportamiento.
- Confianza sintética: la integración devuelve un valor de confianza fijo de 1.0, no calibrado a partir del modelo.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se declara ningún idioma.
- Capacidades especiales (modo *thinking*, audio, vídeo): no disponible.

Funciones explícitamente **no** soportadas por esta integración: detección de objetos, entrenamiento, validación, exportación y seguimiento de puntos (*point tracking*).

## Casos de uso

- Anotación semiautomática de datasets de visión: dado que el modelo devuelve coordenadas de un punto a partir de un nombre de clase (por ejemplo `names=["boat"]`), se puede usar para preanotar puntos clave o centros de objeto en grandes lotes de imágenes, reduciendo el coste de etiquetado manual previo a una revisión humana.
- Robótica y manipulación: el *pointing* permite seleccionar un objetivo concreto en la escena ("la taza", "el destornillador") y traducir esa selección a coordenadas de píxel, que después se proyectan al espacio 3D para guiar un gripper. Es adecuado porque la tarea es exactamente la que el modelo declara soportar.
- Comercio electrónico y análisis de lineal: localizar un producto o un elemento concreto en una fotografía de estantería para verificar presencia, posición relativa o cumplimiento de planogramas, usando el punto devuelto como referencia espacial.
- Accesibilidad visual: localizar un objeto descrito por el usuario en una imagen y devolver su posición para generar descripciones espaciales ("el vaso está a la izquierda y arriba") o para guiar interfaces hápticas.
- Control de calidad industrial: señalar la ubicación de un componente o defecto candidato en una imagen de inspección para que un operador humano o un sistema posterior decida, evitando tener que procesar la imagen completa.
- Automatización de interfaces (UI grounding): localizar botones, iconos o campos concretos en capturas de pantalla para pipelines de test automatizado, aprovechando la capacidad de *pointing* sobre imagen única.
- Moderación de contenido: marcar la región aproximada de un elemento no deseado en una imagen como paso previo a un clasificador específico, dado que el modelo no emite cajas delimitadoras ni etiquetas de detección.

En todos estos casos conviene recordar que la confianza devuelta es 1.0 de forma sintética, por lo que no sirve como señal de filtrado y habría que añadir verificación externa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se reclama ninguna referencia de precisión ni de memoria pico. Para evaluar la calidad del modelo habría que consultar la documentación del modelo base `allenai/Molmo2-4B`, que no forma parte de la información proporcionada en esta consulta.

## Requisitos de hardware

Estimaciones derivadas del recuento de parámetros (4,85 B) y del tamaño del repositorio; no proceden de mediciones publicadas por el autor.

- Pesos en fp32 (formato del repositorio): en torno a 19,4 GB solo de pesos, más activaciones y overhead de runtime; en la práctica requiere 24 GB de VRAM o más para funcionar con holgura.
- Pesos en bf16/fp16 (conversión propia): aproximadamente 9,7 GB de pesos; con caché KV, encoder visual y activaciones, un presupuesto realista de 12-16 GB de VRAM.
- Cuantización de 8 bits: del orden de 5-6 GB de pesos, más overhead; apto para GPUs de 8-12 GB con contexto moderado.
- Cuantización de 4 bits: del orden de 3-4 GB de pesos, aunque la viabilidad depende de que el código remoto del modelo admita el camino cuantizado (no confirmado).
- GPU recomendadas: A100 40/80 GB y H100 para despliegue en fp32 o bf16 con lotes grandes; RTX 4090, RTX 3090 o L40S (24 GB) para bf16; RTX 4080/4070 Ti Super (16 GB) y GPUs de 12 GB para 8 bits; GPUs de 8 GB solo con cuantización agresiva.
- Compatibilidad con GPU de consumo: sí, en el rango de 12-24 GB, siempre que se convierta la precisión, ya que el repo publica fp32.
- Opciones de despliegue: `transformers` con el extra `libreyolo[molmo2]` (requiere Transformers 4.57.1 exacto y carga de código remoto). vLLM y TGI no están confirmados para este snapshot con código remoto. llama.cpp/Ollama exigirían una conversión a GGUF no publicada por el autor.
- Latencia y throughput estimados: no disponible.
- Nota de entorno: la model card recomienda instalar el extra en un entorno separado, lo que sugiere posibles conflictos de dependencias con el resto de la pila del proyecto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Observaciones |
|---|---|---|---|---|---|
| LibreMolmo24b | 4.850.869.200 | no disponible | Apache-2.0 | HuggingFace (`LibreYOLO/LibreMolmo24b`) | Espejo con código remoto; solo *pointing* de imagen única en la integración LibreYOLO |
| allenai/Molmo2-4B | 4.850.869.200 (mismos pesos) | no disponible | Apache-2.0 | HuggingFace | Modelo upstream; distribución original de Ai2 |
| Otros VLM de rango 2-5 B | no disponible | no disponible | no disponible | no disponible | No se han proporcionado datos comparativos en la información disponible |

La comparación significativa es con el modelo base: los pesos son idénticos, de modo que cualquier diferencia de comportamiento proviene exclusivamente del envoltorio de inferencia (LibreYOLO) y de las restricciones que este impone (tarea única de *pointing*, confianza sintética, ausencia de detección y de exportación). No hay información en esta consulta que permita comparar con alternativas de otros desarrolladores en términos de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Es un espejo, no un modelo nuevo: no aporta mejoras de calidad respecto a `allenai/Molmo2-4B`; cualquier defecto del modelo original se hereda intacto.
- Alcance funcional muy reducido en esta integración: solo *pointing* sobre imagen única. No hay detección, ni cajas delimitadoras, ni entrenamiento, validación, exportación o seguimiento de puntos.
- Confianza no fiable: el valor devuelto es un 1.0 sintético, por lo que no se puede usar para umbralizar, filtrar ni priorizar predicciones en producción.
- Dependencia de código remoto: la ejecución carga código de modelo desde un snapshot fijado, lo que complica auditorías de seguridad, revisiones de cumplimiento y despliegues en entornos con políticas estrictas de ejecución de código de terceros.
- Requisito de versión estricto: el código remoto fijado exige Transformers 4.57.1; otras versiones pueden romper la carga o el forward.
- Riesgo de alucinación: como VLM, puede devolver puntos sin correspondencia real con el objeto solicitado, especialmente con nombres ambiguos, objetos ocluidos, imágenes de baja resolución o dominios alejados de los datos de entrenamiento originales.
- Sesgos: no se documentan sesgos conocidos, composición del dataset ni evaluaciones de equidad; al no haber información, hay que asumir los sesgos del modelo base y de sus datos, que no se detallan.
- Idiomas y contexto: no se declara ningún idioma soportado ni la longitud de contexto, lo que impide planificar aplicaciones multilingües o de contexto largo con garantías.
- Ausencia de benchmarks: no hay métricas de precisión, memoria pico ni latencia publicadas para esta variante.
- Madurez del repositorio: 0 descargas y 0 likes, con una fecha de creación reciente; no hay evidencia de uso en producción ni de validación por terceros.
- Licencia: Apache-2.0 permite uso comercial, pero conviene conservar `LICENSE` y `NOTICE` y revisar las condiciones del modelo upstream antes de redistribuir.
- Rendimiento en producción: al publicarse solo pesos en fp32 (19,4 GB de repositorio), el coste de memoria es alto para un modelo de 4,85 B hasta que el usuario convierta la precisión por su cuenta.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/LibreYOLO/LibreMolmo24b
- Modelo base en HuggingFace: https://huggingface.co/allenai/Molmo2-4B
- Model card original preservada: https://huggingface.co/LibreYOLO/LibreMolmo24b/blob/main/README.upstream.md
- Licencia del repositorio: https://huggingface.co/LibreYOLO/LibreMolmo24b/blob/main/LICENSE
- Aviso de atribución: https://huggingface.co/LibreYOLO/LibreMolmo24b/blob/main/NOTICE
- Snapshot de código remoto fijado: commit `042abfa7a38879a376cec03d949eff0aefaa0600` del modelo `allenai/Molmo2-4B`
- Búsqueda web: no se han encontrado enlaces relevantes al modelo en los resultados de búsqueda disponibles; los resultados obtenidos no guardan relación con el modelo ni con sus desarrolladores.
