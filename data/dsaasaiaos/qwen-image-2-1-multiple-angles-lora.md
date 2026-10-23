# dsaasaiaos/Qwen-Image-2.1-Multiple-Angles-LoRA

## Resumen

Qwen-Image-2.1-Multiple-Angles-LoRA es un adaptador LoRA de control de cámara para el modelo base Qwen-Image-2.1, un modelo unificado de generación y edición de imágenes de la familia Qwen. El adaptador permite reencuadrar un objeto o sujeto presente en una fotografía de entrada desde una posición de cámara controlada: se le proporciona una imagen y una indicación de azimut y elevación, y devuelve el mismo sujeto desde ese nuevo ángulo, conservando identidad y fondo. Está publicado por el usuario dsaasaiaos en HuggingFace, con una réplica del mismo contenido en el repositorio de akhaliq, y se distribuye con licencia Apache 2.0.

La relevancia técnica del artefacto es doble. Por un lado, es el primer LoRA de control de cámara documentado para Qwen-Image-2.1, un formato que según el autor no existía para esta base. Por otro, introduce una gramática de prompt explícita mediante el token disparador `<mva>` seguido de una vista nominal y una elevación, lo que hace el comportamiento reproducible y programable en pipelines de generación por lotes. La versión 2 del adaptador amplía el entrenamiento de 5.028 a 13.328 pares imagen-ángulo, sube el rango de 32 a 64 y pasa de una base entrenada en int8 a bf16 de precisión completa.

No se trata de un modelo autónomo: requiere descargar el modelo base Qwen-Image-2.1 (componente visual de 7.000 millones de parámetros, 32 capas DiT single-stream) y cargar el adaptador sobre él con `diffusers` o ComfyUI. El repositorio ocupa 6,6 GB porque incluye todos los checkpoints intermedios de las dos ejecuciones de entrenamiento, además de ejemplos y material de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre un transformer DiT single-stream (modelo base Qwen-Image-2.1, 32 capas DiT) |
| Parametros totales | Adaptador LoRA: rango 64 en v2 (rango 32 en v1); el modelo base tiene 7.000 millones de parametros en su componente visual |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no aplica a un adaptador de difusion; la ventana relevante es la resolucion de imagen del modelo base, no documentada en la informacion proporcionada) |
| Tipos de cuantizacion | Pesos del adaptador en safetensors; el modelo base admite bf16 y cuantizaciones de la comunidad (no detalladas). En entrenamiento, v1 uso base en int8 (convrot8) y v2 en bf16 de precision completa |
| Idiomas soportados | No disponible (los prompts de la model card estan en ingles; la gramatica `<mva>` usa etiquetas en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (v1: `multiple_angles_step1000.safetensors`, 159 MB; v2: `checkpoints_v2/..._000001500.safetensors`, 319 MB) |

## Arquitectura y entrenamiento

El adaptador se inyecta sobre Qwen-Image-2.1, un modelo de difusion con transformer DiT single-stream de 32 capas y 7.000 millones de parametros en su componente de generacion visual, que unifica generacion texto-a-imagen y edicion imagen-a-imagen con soporte nativo de RGBA. El LoRA actua sobre ese transformer y se entrena con pares (imagen de origen, imagen del mismo sujeto desde otro angulo) anotados con la gramatica `<mva> <vista>, <elevacion>`. La v1 se entreno durante 2.500 pasos con rango 32 sobre 5.028 pares; la v2 se entreno con rango 64 sobre 13.328 pares, con un muestreo de timesteps ponderado en lugar del muestreo por desplazamiento de la v1 y con la base en bf16 en vez de int8.

El conjunto de datos de la v2 combina 9.376 pares de Dome-Objaverse con prioridad para personajes y 3.952 pares derivados de 1.986 personajes riggeados tras un filtrado de licencias. El repositorio de datos asociado incluye ademas un suplemento de 3.342 pares con fondos reales, publicado pero no utilizado en el entrenamiento de la v2. La evaluacion se hizo con dos lecturas independientes: rejillas de muestras cada 250 pasos y una curva fuera de distribucion sobre fotos reales (gato, perro y un tercer sujeto reservado) comparando v1 en el paso 1.000 con v2 en los pasos 500 a 2.500, con prompts y semillas fijos.

El control de cámara se articula en 12 azimuts en pasos de 30 grados y 4 elevaciones (0 grados a nivel de ojos, 30 grados elevada, 60 grados en picado alto, 90 grados cenital), con una variante close-up de cada una. Conviene señalar una inconsistencia en la model card: describe "36 poses" y a la vez "72 encuadres direccionables", cifras que no cuadran con el producto 12 x 4 = 48; el autor no aclara el conteo exacto, por lo que debe tratarse como no verificado.

## Capacidades

- Reencuadre de cámara controlado: dado un objeto o sujeto en una imagen, genera la misma entidad desde otro azimut y elevación.
- Control programable mediante el token disparador `<mva>` seguido de una etiqueta de vista y una etiqueta de elevación (`<mva> front-right quarter view, eye-level shot`).
- Variantes close-up por cada pose, orientadas a primeros planos coherentes con la identidad del sujeto.
- Conservación de identidad y de detalle de fondo en fotos reales fuera del dominio de entrenamiento, según la curva OOD publicada por el autor.
- Edición imagen-a-imagen: el adaptador siempre requiere una imagen de origen, no funciona como generador texto-a-imagen puro.
- Ajuste de intensidad del efecto entre 0,8 y 1,0 en ComfyUI y `diffusers`, sin necesidad de cambiar de checkpoint.
- Compatibilidad con el pipeline nativo de Qwen-Image-2.1, incluido su soporte RGBA heredado de la base.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, audio ni visión general: es un adaptador de generación de imagen.

## Casos de uso

- **Fichas de producto en comercio electrónico**: a partir de una única foto del producto, generar las vistas frontal, trasera, lateral y cenital necesarias para una galería, evitando una sesión fotográfica adicional. La elevación a 90 grados y las variantes close-up cubren las tomas de detalle que suelen exigir varias fotografías.
- **Previsualización de assets 3D para videojuegos**: renderizar un objeto o personaje desde varios ángulos para revisar silueta y legibilidad antes de modelar, usando los 12 azimuts como turn-around aproximado. El entrenamiento con Dome-Objaverse hace que este dominio sea el más alineado con los datos.
- **Consistencia de personajes en ilustración seriada**: mantener la identidad de un personaje entre viñetas de cómic o storyboard generando la misma figura desde distintos puntos de vista con el mismo prompt base y semilla fija.
- **Generación de datasets sintéticos multivista**: producir pares (vista A, vista B) etiquetados por azimut y elevación para entrenar modelos de reconstrucción 3D o de estimación de pose, aprovechando que la gramática del prompt es determinista y permite automatizar el etiquetado.
- **Retoque fotográfico de catálogo inmobiliario o de automoción**: obtener tomas imposibles o costosas de repetir (ángulo elevado de un vehículo, vista trasera de una estancia) a partir de una fotografía disponible, ajustando la intensidad a 0,8 si el resultado deriva hacia copiar la referencia.
- **Prototipado rápido en ComfyUI**: integrar el nodo de LoRA en un grafo de edición para explorar encuadres alternativos durante la fase de dirección de arte, con el checkpoint v2 en el paso 1.500 como punto de partida equilibrado.
- **Material educativo y visualización científica**: mostrar un espécimen, maqueta o pieza arqueológica desde perspectivas no fotografiadas, siempre con revisión humana dado el riesgo de invención de detalle en superficies no visibles en el origen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, y no resultan aplicables a un adaptador de generacion de imagen. El autor aporta evidencia cualitativa y curvas de seleccion de checkpoint:

| Evaluacion | v1 (paso 1.000) | v2 (paso 1.500) |
|---|---|---|
| Pares de entrenamiento | 5.028 | 13.328 |
| Rango / alpha del LoRA | 32 | 64 |
| Precision de la base en entrenamiento | int8 (convrot8) | bf16 completa |
| Muestreo de timesteps | shift | ponderado |
| Seguimiento de angulo (rejillas de muestras) | Solido desde el paso 1.000 | Solido desde el paso 1.000; pico entre 1.000 y 2.000; deriva de orientacion leve a 2.500 en muestras de entrenamiento |
| Curva fuera de distribucion con fotos reales | Referencia | Mantiene identidad y fondo al menos igual que v1 en los tres sujetos; sin deriva visible a 2.500 en fotos reales |
| Test de personajes riggeados (dominio nuevo para v1) | Intenta las poses pero suaviza y deriva la estructura del personaje | Conserva identidad y detalle esculpido en vistas trasera y cenital |

No se han publicado cifras de latencia, throughput, FID, CLIP score ni metricas de similitud de identidad en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador en si ocupa 159 MB (v1) o 319 MB (v2), pero la inferencia exige cargar el modelo base completo. Con 7.000 millones de parametros en el componente visual, cabe esperar del orden de 14 GB solo para los pesos en bf16, mas el codificador de texto y el VAE; en cuantizaciones de 8 bits el conjunto puede situarse en torno a 8-10 GB. Estas cifras son estimaciones a partir del tamano del modelo base, no datos publicados por el autor.
- GPU recomendadas: no especificadas en la informacion disponible. Por tamano del modelo base, son razonables tarjetas de 24 GB o mas (RTX 3090, RTX 4090, L40S, A100 40 GB, H100) para bf16 sin offload.
- Cabe en GPU de consumo: previsiblemente si en RTX 3090 y RTX 4090 con cuantizacion u offload; no confirmado por el autor.
- Opciones de despliegue: `diffusers` (libreria declarada del repositorio, pipeline `image-to-image`) y ComfyUI, con intensidad de LoRA recomendada entre 0,8 y 1,0. No se documentan integraciones con vLLM, TGI, llama.cpp u Ollama, que no aplican a un modelo de difusion.
- Latencia y throughput: no disponibles. La model card solo aporta el numero de pasos de entrenamiento (2.500) y los pasos de checkpoint recomendados (1.000 en v1, 1.500 en v2).

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / resolucion | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen-Image-2.1-Multiple-Angles-LoRA (v2) | LoRA de control de camara sobre Qwen-Image-2.1 | Rango 64; base de 7.000 millones | 12 azimuts x 4 elevaciones + close-up; resolucion no disponible | Sin benchmarks; curva OOD favorable frente a v1 | Apache 2.0 | HuggingFace (dsaasaiaos y akhaliq), ComfyUI |
| Qwen-Image-2.1 (modelo base, sin adaptador) | Difusion DiT unificada generacion + edicion | 7.000 millones (32 capas DiT) | No disponible | Sin datos en la informacion proporcionada | No indicada en la informacion | HuggingFace, GitHub QwenLM |
| QMA - Qwen Image 2.1 Multi Camera Angle LoRA | LoRA de angulos de camara para Qwen Image 2.1 Edit | No disponible | Orbita completa, elevacion y close-up; numero de poses no disponible | Sin datos | No indicada en la informacion | Civitai |
| LoRA de control de camara para otras bases (p. ej. FLUX) | LoRA equivalente en otra familia | No disponible | No disponible | No disponible | No disponible | No disponible en la informacion proporcionada |

## Limitaciones y advertencias

- No es un modelo autonomo: sin el modelo base Qwen-Image-2.1 descargado y cargado, el adaptador no produce ninguna salida.
- Requiere imagen de origen en todos los casos; no genera imagenes desde texto.
- Deriva hacia copiar la vista de referencia: documentada en el checkpoint final (paso 2.500) de la v1 y en las muestras de entrenamiento de la v2 a ese mismo paso, aunque el autor indica que no se reproduce en fotos reales.
- Fuerte sesgo de dominio: el entrenamiento se apoya en Dome-Objaverse y en personajes riggeados, por lo que objetos cotidianos, escenas amplias o sujetos no riggeados son dominio fuera de distribucion y su fidelidad no esta garantizada.
- Riesgo de invencion de detalle en las caras ocultas del sujeto: al no existir informacion visual de la parte no fotografiada, el modelo puede alucinar texturas, geometria o elementos de fondo. Se recomienda revision humana en usos documentales o cientificos.
- Inconsistencia no resuelta en la documentacion: la model card declara 36 poses y 72 encuadres direccionables, cifras incompatibles con 12 azimuts x 4 elevaciones.
- Idiomas: la gramatica del prompt esta en ingles; no se documenta soporte de etiquetas en castellano ni en otros idiomas.
- Restricciones de licencia: el adaptador es Apache 2.0, pero el uso comercial depende tambien de la licencia del modelo base Qwen-Image-2.1, no detallada en la informacion disponible. Ademas, el conjunto de personajes riggeados paso un filtrado de licencias cuyo criterio exacto no se explicita.
- Repositorio de 6,6 GB con checkpoints redundantes: los pasos 250 a 750 estan infraentrenados y el artefacto de smoke test carece de utilidad practica; conviene descargar solo el archivo recomendado.
- Popularidad muy baja (0 descargas, 1 like en el momento de la consulta) y sin validacion independiente mas alla de la del propio autor.

## Enlaces

- HuggingFace (repositorio de la ficha): https://huggingface.co/dsaasaiaos/Qwen-Image-2.1-Multiple-Angles-LoRA
- HuggingFace (repositorio replicado por el autor del entrenamiento): https://huggingface.co/akhaliq/Qwen-Image-2.1-Multiple-Angles-LoRA
- Arbol de archivos del repositorio replicado: https://huggingface.co/akhaliq/Qwen-Image-2.1-Multiple-Angles-LoRA/tree/main
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen-Image-2.1
- Repositorio GitHub de Qwen-Image-2.1: https://github.com/QwenLM/Qwen-Image-2.1
- Dataset de entrenamiento de la v2: https://huggingface.co/datasets/akhaliq/qwen21-multiple-angles-train-v2
- Panel de entrenamiento de la v2 (trackio): https://huggingface.co/spaces/akhaliq/qwen21-multiple-angles-v2-trackio
- Articulo en ComfyUI Wiki: https://comfyui-wiki.com/en/news/2026-10-07-qwen-image-2-1-multiple-angles-lora
- Ficha en Civitai (QMA - Qwen Image 2.1 Multi Camera Angle LoRA): https://civitai.com/models/2998617/qma-qwen-image-21-multi-camera-angle-lora
