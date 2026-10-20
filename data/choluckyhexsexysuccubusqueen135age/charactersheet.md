# ChoLuckyHexSexySuccubusQueen135Age/CharacterSheet

## Resumen

CharacterSheet es una colección de cuatro LoRAs de edición de imagen orientadas a convertir una imagen de referencia de un personaje en una hoja de referencia multi-vista (character sheet) limpia y coherente. No es un modelo autónomo: cada archivo `.safetensors` funciona como adaptador de bajo rango sobre un modelo base de difusión concreto, FLUX.2 Klein 9B o Krea 2, y se ejecuta dentro de ComfyUI con los flujos de trabajo JSON incluidos en el repositorio. La colección la publica el usuario de HuggingFace `ChoLuckyHexSexySuccubusQueen135Age`, con licencia Civitai.

La propuesta resuelve un problema muy concreto en pipelines de diseño de personajes: obtener vistas frontales, laterales y traseras (y, en la variante QuadView, un primer plano de la cara) manteniendo identidad, ropa, proporciones y aspecto general a partir de una única imagen de entrada. El entrenamiento se hizo con aproximadamente 300 ejemplos de hojas de personaje, con foco en figuras humanas, aunque el autor indica que personajes anime, cartoon, animales y criaturas pueden funcionar con menor consistencia.

La variante más reciente, DynamicCharacterSheet (experimental), generaliza el concepto de una maquetación fija a una "hoja de entidad" dinámica: bloque de nombre/metadatos, pose heroica, turnaround frontal/lateral/trasero, poses de acción, estudio de silueta, estudio de expresión o estado y recortes de detalle. El repositorio ocupa 9,5 GB y no incluye resultados de benchmarks ni métricas cuantitativas de consistencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelos de difusión: FLUX.2 Klein 9B y Krea 2; no es un checkpoint independiente |
| Parámetros totales | No disponible (el autor no publica el recuento de parámetros de los adaptadores; el modelo base FLUX.2 Klein 9B tiene 9B según su denominación) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de imagen); resolución de trabajo por defecto 1536x1024 en DynamicCharacterSheet, con soporte probado hasta 4096x2736 |
| Tipos de cuantización | No disponible; los archivos se distribuyen en safetensors y la cuantización aplicable depende del modelo base empleado |
| Idiomas soportados | No disponible; las instrucciones de activación y las plantillas de prompt están redactadas en inglés |
| Licencia | `civitai-model-license` (license: other) |
| Formato de pesos | safetensors, acompañados de flujos de trabajo JSON para ComfyUI |

## Arquitectura y entrenamiento

Cada archivo es un adaptador LoRA entrenado sobre un modelo base de difusión distinto, no un modelo completo. La colección se organiza en cuatro piezas: `TripleView_klein9b_v1.safetensors` y `QuadView_klein9b_v1.safetensors` sobre FLUX.2 Klein 9B, y `QuadView_krea2_v1.safetensors` y `DynamicCharacterSheet_krea2_v1.safetensors` sobre Krea 2. El conjunto se entrenó con aproximadamente 300 ejemplos de hojas de personaje, con foco principal en personajes humanos; el autor advierte que los resultados fuera de esa distribución principal pueden ser menos consistentes. No se detallan en la información disponible el número de pasos, el tamaño de lote, la composición exacta del dataset ni si hubo etapas de refinamiento posteriores.

La innovación destacable es la progresión de maquetación: TripleView genera tres vistas de cuerpo completo (frontal, lateral y trasera); QuadView añade un primer plano del rostro; y DynamicCharacterSheet, entrenado sobre el anterior modelo de 4 vistas, generaliza a una hoja de entidad completa con bloque de metadatos, pose heroica, turnaround, poses de acción (o configuraciones funcionales en objetos y vehículos), estudio de silueta, estudio de expresión o estado y recortes de detalle de los rasgos críticos para la identidad. Esta última variante espera un prompt estructurado con cabeceras entre corchetes (`[TASK: ENTITY_SHEET_GENERATION]`, `[TEMPLATE: MULTI_ANGLE_ENTITY_SHEET_V1]`, `[ENTITY_TYPE: ...]`, `[ENTITY_ID: ...]`) que instruyen al modelo a tratar la imagen de referencia como única fuente de identidad. El autor recomienda el sampler LCM con el planificador Simple y señala que la generación de texto sobre la hoja todavía está lejos de ser perfecta.

## Capacidades

- Edición imagen-a-imagen: transforma una referencia de personaje en una hoja multi-vista conservando identidad, ropa, proporciones y aspecto general.
- Generación de vistas multiple: frontal, lateral y trasera de cuerpo completo (TripleView, QuadView) y primer plano facial adicional (QuadView).
- Hoja de entidad dinámica (DynamicCharacterSheet): pose heroica, turnaround, poses de acción, silueta, expresiones o estados y recortes de detalle.
- Soporte de dominios variados mediante `ENTITY_TYPE`: `HUMAN`, `STYLIZED_CHARACTER`, `ANIMAL`, `CREATURE`, `ROBOT`, `VEHICLE` y `OBJECT`.
- Inclusión de bloque de nombre y metadatos textuales en la hoja generada, con calidad de texto limitada y experimental.
- Adaptación por prompt: el autor indica que se pueden reutilizar prompts de los flujos TripleView/QuadView con DynamicCharacterSheet para obtener otros estilos y maquetaciones.
- Integración en ComfyUI mediante nodo LoRA Loader y los JSON de flujo de trabajo incluidos por cada archivo.
- No dispone de tool calling, capacidades de agente, razonamiento multi-paso, audio ni visión general; su ámbito es exclusivamente la generación y edición de imágenes.

## Casos de uso

- Preproducción de personajes para animación o videojuegos: a partir de un concept art se obtiene un turnaround frontal/lateral/trasero utilizable como referencia para modelado 3D o para la hoja de estilo del estudio, reduciendo el trabajo manual de dibujar cada vista.
- Preparación de datasets de identidad: las hojas generadas sirven como material de partida para entrenar modelos de personaje (flujos CharacterID) o para alimentar pipelines de referencia de identidad como los de LTX, tal y como indica el autor.
- Iteración de diseño conceptual: el estudio de silueta y el estudio de expresión de DynamicCharacterSheet permiten explorar variantes de un personaje antes de fijar el diseño definitivo, manteniendo la referencia original como fuente de identidad.
- Documentación de criaturas, robots y vehículos: al aceptar `ENTITY_TYPE` distintos de `HUMAN`, la hoja dinámica puede producir vistas y configuraciones funcionales de entidades no humanas para manuales, fichas de producto o biblias de arte.
- Automatización por lotes en ComfyUI: los flujos JSON incluidos permiten encadenar el LoRA en pipelines de generación masiva, por ejemplo para producir hojas de referencia de un catálogo completo de personajes con prompts estandarizados.
- Refinamiento generativo posterior: las hojas obtenidas pueden usarse como entrada de un segundo paso de edición o de un modelo de mayor resolución, ya que el autor recomienda subir la resolución hasta 2048x1365 o 3072x2048 para mejorar la legibilidad del texto.
- Exploración de estilo controlada por prompt: la posibilidad de reutilizar plantillas de los flujos anteriores permite generar maquetaciones alternativas (por ejemplo, hojas parciales centradas solo en el rostro) sin reentrenar el adaptador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no incluye métricas cuantitativas de consistencia entre vistas, de preservación de identidad ni comparaciones numéricas con otros adaptadores; únicamente señala cualitativamente que la consistencia entre vistas "no es del 100 %" y que tiende a mejorar con el sampler LCM.

## Requisitos de hardware

- Los requisitos exactos no están publicados; cualquier estimación depende del modelo base, no del LoRA, que añade una sobrecarga pequeña sobre los pesos del checkpoint.
- Para FLUX.2 Klein 9B en precisión nativa (fp16/bf16) cabe esperar del orden de 20-24 GB de VRAM considerando pesos, text encoder y VAE; es una estimación a partir del tamaño del modelo base, no un dato del autor.
- En variantes de 8 bits del modelo base, el rango práctico se sitúa alrededor de 10-12 GB de VRAM, lo que permite ejecución en GPUs de consumo alto (por ejemplo, RTX 4090 de 24 GB con margen).
- Con cuantizaciones GGUF de 4-5 bits el modelo base podría encajar en GPUs de 8-12 GB, a costa de calidad y velocidad; no hay confirmación del autor sobre estos rangos.
- Los requisitos de Krea 2 no están disponibles en la información proporcionada.
- Opciones de despliegue: ComfyUI es el entorno de referencia, con los flujos JSON incluidos; no se documentan integraciones con vLLM, TGI, llama.cpp ni Ollama, que además no aplican a un modelo de difusión de este tipo.
- Latencia y throughput: no disponible. A mayor resolución (2048x1365, 3072x2048, 4096x2736) el coste por imagen crece, y el autor recomienda LCM para reducir pasos.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de adaptadores de terceros en la información proporcionada, por lo que no es posible una comparación cuantitativa fiable con alternativas. La comparación disponible es interna a la propia colección:

| Archivo | Modelo base | Maquetación de salida | Estado |
|---|---|---|---|
| `TripleView_klein9b_v1.safetensors` | FLUX.2 Klein 9B | Frontal, lateral y trasera de cuerpo completo | Estable (v1) |
| `QuadView_klein9b_v1.safetensors` | FLUX.2 Klein 9B | Primer plano facial más frontal, lateral y trasera | Estable (v1) |
| `QuadView_krea2_v1.safetensors` | Krea 2 | Primer plano facial más frontal, lateral y trasera | Estable (v1) |
| `DynamicCharacterSheet_krea2_v1.safetensors` | Krea 2 | Hoja de entidad completa con metadatos, pose heroica, turnaround, acción, silueta, expresiones y detalles | Experimental |

Como referencia de categoría, los adaptadores equivalentes de la comunidad para hojas de personaje suelen apoyarse en SDXL o FLUX.1; no se han encontrado en la búsqueda datos verificables sobre ellos que permitan comparar parámetros, contexto o rendimiento con esta colección.

## Limitaciones y advertencias

- Es un conjunto de LoRAs, no un modelo autónomo: cada archivo solo funciona con su modelo base correspondiente (FLUX.2 Klein 9B o Krea 2) y con su flujo de trabajo.
- Entrenamiento sobre una muestra reducida (aproximadamente 300 ejemplos) y centrada en figuras humanas; anime, cartoon, animales, criaturas y objetos pueden dar resultados menos consistentes.
- La consistencia entre vistas no es total, según el propio autor, incluso usando LCM; puede requerir selección manual o retoques posteriores.
- La generación de texto en la hoja (nombres, metadatos) es explícitamente imperfecta en DynamicCharacterSheet, que el autor marca como altamente experimental.
- Riesgo de deriva de identidad y de alucinación de detalles de vestuario o anatomía al generar vistas no presentes en la imagen de referencia.
- Sesgos de dominio: al provenir de un dataset pequeño y no documentado, se desconoce la representación de distintos tipos corporales, edades, etnias y estilos; no hay evaluación publicada de sesgos.
- Idiomas: las instrucciones de activación y las plantillas están en inglés; no se documenta soporte de prompts en castellano.
- Licencia `civitai-model-license` (license: other): conviene revisar los términos enlazados antes de cualquier uso comercial, ya que pueden imponer restricciones adicionales a las del modelo base, que también debe licenciarse por separado.
- Métricas de adopción muy bajas (0 descargas, 1 like) y publicación el 2026-10-20 con actualización el mismo día: no hay evidencia de validación por parte de la comunidad.
- El tamaño del repositorio (9,5 GB) implica descargar los cuatro adaptadores; no se ofrece selección por archivo en la información disponible.
- Los resultados de la búsqueda web realizada no contienen material técnico relevante sobre este modelo, por lo que no se han podido verificar datos externos.

## Enlaces

- HuggingFace: https://huggingface.co/ChoLuckyHexSexySuccubusQueen135Age/CharacterSheet
- Licencia Civitai / listado del autor: https://civitai.red/models/2764727/tripleview
- No se han encontrado otros enlaces relevantes (papers, blogs, repositorios o demos) en la búsqueda web disponible.
