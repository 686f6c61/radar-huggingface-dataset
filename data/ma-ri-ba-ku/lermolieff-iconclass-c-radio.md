# Ma-Ri-Ba-Ku/lermolieff-iconclass-c-radio

## Resumen

lermolieff-iconclass-c-radio es una cabeza de clasificación multi-etiqueta que predice códigos Iconclass (el sistema estandarizado de descripción iconográfica de imágenes) a partir de una imagen de una obra de arte. La desarrolla el usuario Ma-Ri-Ba-Ku (maribakulj) y se apoya en el encoder visual congelado nvidia/C-RADIOv3-L, del que consume representaciones de 4.096 dimensiones; sobre ellas aplica una única capa oculta de 2.048 unidades y una salida sobre un vocabulario de 7.907 códigos.

El interés del modelo es de nicho pero muy concreto: automatiza una parte del trabajo de catalogación iconográfica que en museos, bibliotecas y archivos de arte se sigue haciendo manualmente. Frente a un clasificador de imágenes genérico, aquí la etiqueta no es una categoría plana sino una notación jerárquica de Iconclass, y la evaluación se hace con F1 jerárquico sobre el conjunto de ancestros de cada notación.

Se trata de la versión 0.1.0, declarada explícitamente como exploratoria por el autor: un solo entrenamiento, arquitectura en fase de pruebas y un F1 jerárquico de 54,8 % sobre 788 imágenes del conjunto de test ICAI. El repositorio solo distribuye la cabeza (head.pt, 98,5 MB); el encoder no se incluye y debe obtenerse por separado bajo la NVIDIA Open Model License.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Cabeza multi-etiqueta (una capa oculta de 2.048) sobre encoder visual congelado nvidia/C-RADIOv3-L, dimensión de salida del encoder 4.096 (revisión `9d04134`) |
| Parámetros totales | No disponible. La cabeza mapea 4.096 → 2.048 → 7.907 salidas y el fichero `head.pt` ocupa 98.510.271 bytes; el número exacto de parámetros no está declarado |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de visión; procesa una imagen por inferencia) |
| Tipos de cuantización | No disponible (el autor solo publica `head.pt`; no se declaran versiones cuantizadas) |
| Idiomas soportados | No disponible. La salida son notaciones Iconclass, no texto libre |
| Licencia | MIT para la cabeza; el encoder C-RADIOv3-L se rige por la NVIDIA Open Model License y no se incluye en el repositorio |
| Formato de pesos | `head.pt` (serialización PyTorch, `torch.save`) con pesos, vocabulario, umbral de decisión y configuración del encoder |
| Vocabulario de salida | 7.907 códigos Iconclass (los vistos en al menos 5 imágenes de entrenamiento y sus ancestros) |
| Tarea / pipeline | `image-classification` con salida multi-etiqueta |
| Conjunto de entrenamiento | `davanstrien/iconclass-vlm-brillfull`, revisión `8045366` (CC0 1.0) |
| Tamaño del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

La arquitectura es deliberadamente mínima: el encoder nvidia/C-RADIOv3-L permanece congelado y actúa como extractor de características, y sobre su vector de 4.096 dimensiones se entrena una cabeza con una sola capa oculta de 2.048 unidades y una capa de salida de 7.907 logits, uno por código Iconclass del vocabulario. Al ser multi-etiqueta, la decisión final se toma aplicando un umbral almacenado junto a los pesos en `head.pt`; el paquete `lermolieff` reconstruye la configuración del encoder a partir del manifiesto incluido. El autor no documenta en la información disponible funciones de pérdida, estrategia de inicialización ni detalles del optimizador.

Los datos de entrenamiento proceden del conjunto `davanstrien/iconclass-vlm-brillfull` (licencia CC0 1.0, revisión `8045366`), y el vocabulario se construyó filtrando los códigos presentes en al menos cinco imágenes de entrenamiento, añadiendo además sus ancestros en la jerarquía Iconclass para poder evaluar con F1 jerárquico. No se documenta en la información disponible el número de tokens ni de imágenes de entrenamiento, ni si hubo ajuste fino adicional. El autor advierte de que se trata de un único entrenamiento y de que la arquitectura está en fase de pruebas, con posibilidad de sustituir esta cabeza por otra mejor conservando las revisiones anteriores.

## Capacidades

- Clasificación multi-etiqueta de imágenes de obras de arte en notaciones Iconclass: una misma imagen puede recibir varios códigos simultáneamente.
- Predicción restringida al vocabulario de 7.907 códigos; no genera notaciones nuevas fuera de esa lista.
- Cobertura implícita de la jerarquía: como el vocabulario incluye los ancestros de los códigos vistos, el modelo puede emitir códigos de niveles superiores de la clasificación.
- Inferencia por línea de comandos sobre una imagen individual (`python -m lermolieff.predict --head c-radio/head.pt image.jpg`).
- Integración como biblioteca Python mediante el paquete `lermolieff[c-radio]`, que gestiona la descarga del encoder y la carga de la cabeza.
- No dispone de generación de texto, razonamiento multi-paso, tool calling, agentes, capacidades multilingües de texto, visión generativa ni audio.
- No produce descripciones en lenguaje natural ni justificaciones de la etiqueta asignada: la salida es un conjunto de códigos con su puntuación frente al umbral.

## Casos de uso

- Catalogación asistida en museos: el modelo propone códigos Iconclass para una imagen y el documentalista valida o corrige. Adecuado porque la salida ya está en el vocabulario controlado que usan los sistemas de documentación artística, lo que evita el paso intermedio de traducción de etiquetas libres.
- Enriquecimiento de metadatos en colecciones digitales: procesar por lotes los fondos de un repositorio (por ejemplo, grabados, estampas o fotografías de archivo) para añadir materia iconográfica allà donde solo hay título y autor.
- Búsqueda y filtrado por tema iconográfico: indexar las imágenes con los códigos predichos y permitir consultas del tipo "escenas de la Anunciación" o "representaciones de santos con atributos concretos" sobre el índice generado.
- Pre-anotación en proyectos de crowdsourcing: usar el modelo como primera pasada para reducir el esfuerzo de los voluntarios que etiquetan, que solo revisan y corrigen las predicciones en lugar de partir de cero.
- Investigación cuantitativa en historia del arte: extraer distribuciones de motivos iconográficos sobre corpus amplios (por ejemplo, prensa ilustrada de un periodo) para estudiar frecuencias y evolución temporal de temas.
- Triaje en pipelines de digitalización masiva: clasificar automáticamente lotes de imágenes recién digitalizadas y separar las que contienen materia iconográfica identificable de las que no, antes de una revisión humana más costosa.
- Prototipado y evaluación de métodos: al ser una cabeza pequeña sobre un encoder congelado, sirve como línea base reproducible para comparar variantes de arquitectura o de encoder en la tarea Iconclass.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Conjunto de evaluación | Métrica | Valor | Verificado |
|---|---|---|---|
| Iconclass AI test set (ICAI, 788 imágenes), revisión `8045366` | F1 jerárquico (conjuntos de ancestros leídos desde la notación) | 54,8 % | No (`verified: false`) |

Notas sobre la medición: el F1 jerárquico se calcula comparando el conjunto de ancestros de la verdad con el de la predicción, leídos directamente desde la notación; un código ausente del catálogo cuenta como error. El resultado procede de un único entrenamiento. El autor anuncia la incorporación de un test externo (Rijksmuseum) que todavía no está disponible en la información proporcionada.

No se han publicado en la información disponible resultados de otros benchmarks (MMLU, HumanEval, GSM8K u otros), que por otra parte no aplican a un modelo de clasificación de imágenes.

## Requisitos de hardware

- VRAM estimada: no hay cifras publicadas. La cabeza ocupa 98,5 MB en disco y el encoder C-RADIOv3-L, que no se distribuye con este repositorio, pertenece a la familia ViT-L de NVIDIA; el conjunto cabe holgadamente en GPUs de consumo con 8 GB. Estas cifras son estimaciones a partir del tamaño de los ficheros y la arquitectura, no mediciones publicadas.
- GPU recomendadas: cualquier GPU con soporte CUDA capaz de ejecutar el encoder C-RADIOv3-L en fp16 o fp32. No se documentan requisitos específicos para A100, H100 o RTX 4090.
- GPU de consumo: previsiblemente sí, en tarjetas de 8 GB o más, dado que la cabeza es pequeña y el encoder es un ViT de escala L. No confirmado por el autor.
- Despliegue: paquete Python `lermolieff` con PyTorch e interfaz de línea de comandos (`python -m lermolieff.predict`). No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI, que no encajan con este tipo de modelo.
- Latencia y throughput: no disponibles. Al ser una cabeza lineal sobre un encoder congelado, el coste dominante es la pasada del encoder por imagen, pero no se publican tiempos medidos.
- Almacenamiento: 98.510.271 bytes para `head.pt` (sha256 `2b403a91…82c98242`), más los pesos del encoder descargados aparte.

## Comparativa con modelos similares

No se dispone en la información proporcionada de otros modelos publicados que resuelvan la misma tarea (predicción de códigos Iconclass sobre imágenes de arte) con métricas comparables en el mismo conjunto de test. La comparación cuantitativa se limita, por tanto, a los datos del propio modelo.

| Modelo | Tarea | Parámetros | Contexto | F1 jerárquico (ICAI) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| lermolieff-iconclass-c-radio | Clasificación multi-etiqueta Iconclass | No disponible (cabeza de 98,5 MB sobre encoder C-RADIOv3-L congelado) | No aplica | 54,8 % | MIT (cabeza) + NVIDIA Open Model License (encoder) | HuggingFace `Ma-Ri-Ba-Ku/lermolieff-iconclass-c-radio` |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Versión 0.1.0 declarada exploratoria por el autor: un solo entrenamiento, arquitectura en revisión y posibilidad de que una cabeza mejor la sustituya. No debe tomarse como resultado consolidado.
- La métrica de 54,8 % de F1 jerárquico está marcada como no verificada y procede de una única ejecución de entrenamiento; no hay validación externa todavía (el test de Rijksmuseum está pendiente).
- Techo de vocabulario: los códigos fuera de los 7.907 del vocabulario no pueden producirse directamente, lo que limita la cobertura en colecciones con materias poco representadas en el conjunto de entrenamiento.
- Un código ausente del catálogo cuenta como error en la evaluación, de modo que el rendimiento real en dominios distintos al corpus de entrenamiento puede ser inferior al reportado.
- Sesgo de dominio esperable: el conjunto de entrenamiento procede de una colección concreta de arte europeo, por lo que la precisión puede degradarse en arte no occidental, arte contemporáneo, fotografía o imágenes de baja calidad.
- No es un modelo generativo: no produce descripciones, justificaciones ni texto, y no admite interacción conversacional ni tool calling. No debe presentarse como sustituto de un catalogador humano.
- Riesgo de alucinación en sentido laxo: el modelo siempre emite etiquetas del vocabulario, incluidas las que no correspondan a la imagen, sin mecanismo explícito de abstención más allá del umbral almacenado en `head.pt`.
- Restricciones de licencia: la cabeza es MIT, pero el uso del modelo implica usar el encoder C-RADIOv3-L bajo la NVIDIA Open Model License, con sus propias condiciones; el encoder no se incluye en el repositorio y debe obtenerse y aceptarse por separado.
- Dependencia de una revisión concreta del conjunto de datos (`8045366`) y de la revisión del encoder (`9d04134`); cambios en cualquiera de las dos pueden invalidar la reproducibilidad de las puntuaciones.
- No hay información sobre calibración de las probabilidades, comportamiento multi-etiqueta con umbrales alternativos ni análisis de error por nivel jerárquico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ma-Ri-Ba-Ku/lermolieff-iconclass-c-radio
- Repositorio de código y método: https://github.com/maribakulj/lermolieff
- Modelo base (encoder): https://huggingface.co/nvidia/C-RADIOv3-L
- Conjunto de datos de entrenamiento: https://huggingface.co/datasets/davanstrien/iconclass-vlm-brillfull
- Referencia de la tarea (sistema Iconclass): no disponible en la información proporcionada
- Artículo, blog o demo adicionales: no disponible. La búsqueda web realizada no devolvió resultados relevantes sobre este modelo (los resultados obtenidos correspondían a entradas no relacionadas con el proyecto).
