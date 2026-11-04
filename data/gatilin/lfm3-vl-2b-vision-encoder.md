# gatilin/lfm3-vl-2b-vision-encoder

## Resumen

`gatilin/lfm3-vl-2b-vision-encoder` es un paquete extraido del modelo multimodal LiquidAI/LFM3-VL-2B que contiene unicamente la torre de vision (vision tower) y el proyector multimodal, sin los pesos del modelo de lenguaje. Lo publica el usuario `gatilin` en HuggingFace y su proposito es permitir reutilizar el codificador visual de LFM3-VL-2B de forma aislada para tareas de extraccion de caracteristicas de imagen y video. El paquete pesa 0,4 GB y contiene 189.380.352 parametros en formato safetensors BF16.

La torre de vision consta de 14 capas: 8 convolucionales y 6 de atencion bidireccional. El proyector multimodal fusiona parches visuales de 2x2 en caracteristicas del tamano que espera el modelo de lenguaje. Se preservan los nombres, formas y valores originales de los tensores (`model.vision_tower.*` y `model.multi_modal_projector.*`), lo que facilita la integracion con el modelo completo.

Es relevante para desarrolladores que quieran experimentar con el componente visual de LFM3-VL-2B sin cargar el modelo completo, o para integrar el codificador en pipelines propios de vision. La licencia es la LFM Open License v1.0, que incluye condiciones de uso comercial y un umbral de ingresos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision tower hibrida: 8 capas convolucionales + 6 capas de atencion bidireccional, mas proyector multimodal |
| Parametros totales | 189.380.352 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el paquete no incluye el modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | en |
| Licencia | lfm-open-license-1.0 (LFM Open License v1.0) |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El paquete contiene exclusivamente la torre de vision y el proyector multimodal del modelo LiquidAI/LFM3-VL-2B, extraidos de la revision `01f2d64a885266638807097e1c571065df4cca2f`. La torre de vision tiene 14 capas, de las cuales 8 son convolucionales y 6 son de atencion bidireccional. El proyector multimodal agrupa parches visuales de 2x2 para producir caracteristicas con la dimensionalidad que espera el modelo de lenguaje. Se conservan los nombres, formas y valores originales de los tensores en BF16.

El paquete incluye los ficheros Python originales del proyecto que implementan la torre de vision y el procesador de imagen, ademas de `component.py`, que carga solo la torre y el proyector con coincidencia estricta de estado. Tambien se incluyen `tensor_mapping.json` (con los offsets originales), `extraction.json` (con comprobaciones de bytes y SHA-256 del rango de origen) y `validation.json` (con una prueba de humo en CPU sobre imagen real, versiones de software exactas, formas y limites). No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens ni si hubo RLHF o DPO, ya que esta ficha se limita al componente extraido.

## Capacidades

- Extraccion de caracteristicas visuales a partir de imagenes, orientada al pipeline `image-feature-extraction`.
- Procesamiento de video, segun la etiqueta `video` del repositorio.
- Fusion de parches visuales 2x2 mediante el proyector multimodal para alinear la representacion visual con el espacio del modelo de lenguaje.
- Integracion con el modelo completo LFM3-VL-2B mediante los tensores `model.vision_tower.*` y `model.multi_modal_projector.*`.
- Procesamiento de imagen con normalizacion, redimensionado dinamico y ordenacion de parches definidos en `processor_config.json`.
- Soporte de carga estricta del estado mediante `component.py`.
- No incluye capacidades de generacion de texto, razonamiento, codigo ni tool calling, al no contener los pesos del modelo de lenguaje.
- Idiomas: solo ingles (`en`).

## Casos de uso

- Extraccion de embeddings visuales para sistemas de recuperacion de imagenes: el paquete permite generar caracteristicas de imagen sin cargar el modelo multimodal completo, reduciendo el consumo de memoria a los 189 millones de parametros del componente.
- Preprocesamiento de video para pipelines de analisis: la etiqueta `video` y el procesador de imagen incluido permiten alimentar fotogramas al codificador y obtener representaciones vectoriales para tareas posteriores de clasificacion o deteccion.
- Investigacion sobre alineacion vision-lenguaje: el proyector multimodal aislado permite estudiar como se transforman los parches visuales 2x2 en caracteristicas compatibles con el espacio del modelo de lenguaje.
- Desarrollo de adaptadores multimodales propios: al conservar los nombres y formas originales de los tensores, el componente se puede integrar en arquitecturas personalizadas que reutilicen la torre de vision de LFM3-VL-2B.
- Validacion y auditoria de modelos: los ficheros `extraction.json`, `tensor_mapping.json` y `validation.json` permiten verificar la integridad de los pesos extraidos y reproducir la prueba de humo en CPU.
- Prototipado en entornos con recursos limitados: al pesar 0,4 GB y ejecutarse en CPU para la prueba de validacion, sirve para experimentar con el componente visual en maquinas sin GPU de gran capacidad.
- Fine-tuning de cabezas visuales: la torre congelada o parcialmente ajustable puede servir como extractor de caracteristicas para tareas de vision especificas sobre el dominio del usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 189,38 millones de parametros en BF16, el peso de los tensores ronda los 0,38 GB, por lo que la huella de memoria del componente es reducida.
- GPU recomendadas: no disponibles en la informacion proporcionada. Cualquier GPU con al menos unos pocos GB de VRAM deberia poder alojar el componente, aunque no se confirma en la documentacion.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano del paquete (0,4 GB de repositorio), aunque no se detalla en la model card.
- Opciones de despliegue: el autor documenta uso directo con PyTorch, `transformers>=5.21,<5.22`, `accelerate`, `safetensors`, Pillow y torchvision compatible. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La unica referencia es la prueba de humo en CPU sobre imagen real descrita en `validation.json`, sin cifras de rendimiento publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| gatilin/lfm3-vl-2b-vision-encoder | 189.380.352 | no disponible | lfm-open-license-1.0 | HuggingFace |
| LiquidAI/LFM3-VL-2B (modelo completo) | no disponible en la informacion | no disponible | no disponible en la informacion | HuggingFace |
| Otros codificadores visuales (p. ej. CLIP ViT) | no disponible en la informacion | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para establecer una comparativa cuantitativa con alternativas de la misma categoria. El unico modelo directamente relacionado es LiquidAI/LFM3-VL-2B, del que este paquete es un subconjunto.

## Limitaciones y advertencias

- El paquete no contiene los pesos del modelo de lenguaje: no puede generar texto ni realizar tareas de razonamiento de forma autonoma.
- La prueba de validacion incluida no establece paridad con el modelo original completo ni con ejecucion en GPU; solo cubre una prueba de humo en CPU sobre imagen real.
- Solo se declara soporte de ingles (`en`).
- La licencia LFM Open License v1.0 incluye condiciones de uso comercial y un umbral de ingresos; es necesario revisar los terminos originales antes de usar o redistribuir el modelo.
- No se han publicado datos sobre sesgos, riesgo de alucinacion ni limitaciones de contexto del componente visual.
- El paquete depende de versiones concretas de software (`transformers>=5.21,<5.22`, torchvision compatible), lo que puede limitar la integracion en entornos con otras versiones.
- Al ser una extraccion de un modelo mayor, cualquier limitacion del codificador visual original de LFM3-VL-2B se hereda en este paquete.
- No hay informacion sobre cuantizaciones disponibles ni sobre rendimiento en produccion.

## Enlaces

- HuggingFace: https://huggingface.co/gatilin/lfm3-vl-2b-vision-encoder
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Licencia LFM Open License v1.0: incluida en el repositorio como `LICENSE`
