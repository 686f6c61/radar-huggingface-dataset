# rustholm/BFS-Best-Face-Swap

## Resumen

BFS (Best Face Swap) es una familia de adaptadores LoRA para modelos de edición de imagen por difusión, publicada por el usuario rustholm en HuggingFace. Su objetivo es realizar intercambios de cara (face swap) e intercambios completos de cabeza (head swap) con alta fidelidad, mezcla natural de tonos de piel e iluminación coherente. Los LoRA están entrenados para funcionar sobre Qwen Image Edit 2509/2511 y sobre la familia FLUX.2 Klein (4B y 9B), y se integran en flujos de trabajo de edición imagen-a-imagen, incluyendo ComfyUI.

El repositorio incluye varias versiones del adaptador, desde la V1 de intercambio facial hasta la V5 para Qwen Image Edit 2511, con variantes originales y fusionadas (merged). La versión recomendada para 2511 es la V5, que incorpora más de 5.500 pasos de entrenamiento y una fusión con la V4 de 2509 para mejorar la transferencia de expresiones. Para FLUX.2 Klein se ofrece una V1 con variantes para 4B y 9B.

La relevancia de este modelo radica en su especialización: no es un modelo generativo generalista, sino un adaptador ligero que se acopla a modelos base de edición ya existentes para resolver una tarea concreta (sustitución de identidad facial o craneal) manteniendo la pose, la iluminación y el fondo de la imagen destino. El tamaño del repositorio (10,9 GB) refleja que incluye múltiples archivos de pesos para distintas versiones y modelos base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelos base de difusión para edición de imagen |
| Parámetros totales | no disponible (depende del rango del LoRA y del modelo base) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen, no de texto) |
| Tipos de cuantización | fp16 y fp32 en las variantes merged de la V5; fp8 en los modelos base FLUX.2 Klein referenciados |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Modelos base | Qwen/Qwen-Image-Edit-2511, black-forest-labs/FLUX.2-klein-9B, FLUX.2-klein-4B, FLUX.2-klein-base-4B, FLUX.2-klein-base-9B, FLUX.2-klein-9b-fp8, FLUX.2-klein-4b-fp8 |
| Pipeline | image-to-image |
| Librería | diffusers |
| Tamaño del repositorio | 10,9 GB |

## Arquitectura y entrenamiento

BFS no es un modelo autónomo, sino una colección de adaptadores LoRA que se cargan junto a un modelo base de edición de imagen. Los modelos base declarados son Qwen Image Edit 2511 (y 2509 en versiones anteriores) y la familia FLUX.2 Klein en sus variantes 4B y 9B, incluyendo versiones base y fp8. La tarea se formula como edición imagen-a-imagen condicionada por dos imágenes de control: una imagen de cuerpo o destino y una imagen de cara o fuente, según la versión.

El entrenamiento se realizó mediante fine-tuning de bajo rango sobre estos modelos base. La versión V5 para 2511 se entrenó durante más de 5.500 pasos y se publica en tres variantes: una original, una merged con rango 16 en fp16 y otra merged con rango 32 en fp32. El autor indica que la versión fusionada con la V4 de 2509 ofrece mejores resultados, especialmente en la reproducción de un rango más amplio de expresiones. Para FLUX.2 Klein 9B se publican variantes entrenadas en distintos pasos (step3500 con rango 128 y step3750 con rango 64), lo que sugiere experimentación con el número de pasos y el rango del adaptador. No se detalla la composición del dataset de entrenamiento ni si se emplearon técnicas de RLHF o DPO, algo esperable en un adaptador de edición de imagen.

## Capacidades

- Intercambio facial (face swap): sustituye únicamente la cara de la imagen destino, preservando el pelo, la iluminación y el fondo originales.
- Intercambio completo de cabeza (head swap): transfiere cabeza y pelo con mezcla natural sobre el cuerpo destino.
- Transferencia de expresión: las versiones V4 y V5 mejoran la reproducción de microexpresiones y la dirección de la mirada de la imagen destino.
- Coincidencia de tono de piel: las versiones V2 en adelante incorporan mejoras en el ajuste de tono y sombras.
- Alineación de pose y proporciones anatómicas: la V3 y posteriores enfatizan proporciones correctas entre cabeza y cuerpo.
- Edición imagen-a-imagen condicionada por dos imágenes de control, con orden de entrada variable según la versión.
- Compatibilidad con flujos de trabajo de ComfyUI y con la librería diffusers.
- Soporte de prompts en inglés para guiar la edición; no se documentan capacidades multilingües.
- No se documentan tool calling, agentes ni razonamiento multi-paso; es un modelo exclusivamente de imagen.

## Casos de uso

- Producción audiovisual y doblaje: sustituir la cara de un actor por la de un doble en escenas concretas manteniendo iluminación y fondo, usando la V1 de face swap para preservar el pelo y la composición original.
- Prototipado de personajes en videojuegos: generar variantes de un mismo personaje con distintas identidades faciales sobre un cuerpo base, empleando head swap V3 o V5 con orden de entrada cuerpo-primero.
- Pruebas de vestuario y maquillaje: aplicar la cara de un modelo de referencia sobre un cuerpo con una pose concreta para evaluar cómo queda un estilismo sin repetir sesiones fotográficas.
- Anonimización de imágenes: sustituir rostros en material gráfico por identidades sintéticas antes de publicar, usando face swap con coincidencia de tono para que el resultado sea coherente.
- Creación de contenido para redes sociales: transferir la identidad de un creador a imágenes generadas o de archivo manteniendo expresión y ángulo, con la V5 de 2511 para mayor variedad expresiva.
- Integración en pipelines de ComfyUI: automatizar lotes de edición facial o craneal en un estudio mediante los workflows publicados por el autor, encadenando el LoRA con el modelo base Qwen Image Edit o FLUX.2 Klein.
- Restauración creativa de retratos: recomponer una cabeza sobre un cuerpo de archivo cuando la original está dañada, usando la V2 con su mejor ajuste de tono y alineación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; depende del modelo base. Los LoRA en sí son ligeros, pero requieren cargar el modelo base completo (Qwen Image Edit 2511 o FLUX.2 Klein 4B/9B) para la inferencia.
- Los modelos base FLUX.2 Klein se ofrecen en variantes 4B y 9B, incluyendo versiones fp8, lo que reduce los requisitos de VRAM frente a las versiones en fp16.
- GPU recomendadas: no disponible en la información proporcionada. Para modelos de difusión de 4B a 9B en fp16 o fp8 se suele requerir VRAM de gama alta, pero el autor no especifica cifras.
- Compatibilidad con GPU de consumo: no confirmada en la documentación; las variantes fp8 de FLUX.2 Klein apuntan a facilitar el despliegue en hardware más limitado, pero no se detallan modelos concretos.
- Opciones de despliegue: diffusers (librería declarada) y ComfyUI (workflows publicados en Civitai). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusión de imagen.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Modelos base | Licencia | Contexto / modalidad | Disponibilidad |
|---|---|---|---|---|---|
| BFS (Best Face Swap) | LoRA de face/head swap | Qwen Image Edit 2509/2511, FLUX.2 Klein 4B/9B | MIT | Imagen (image-to-image) | HuggingFace, 93 descargas |
| Qwen Image Edit 2511 | Modelo base de edición de imagen | no aplica | no disponible en la información | Imagen (image-to-image) | HuggingFace (Qwen) |
| FLUX.2 Klein 4B/9B | Modelo base de edición/generación de imagen | no aplica | no disponible en la información | Imagen | HuggingFace (black-forest-labs) |

No se dispone de datos de benchmarks ni de otros adaptadores de face swap comparables en la información proporcionada, por lo que la comparación se limita a los modelos base sobre los que opera BFS.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al operar sobre identidades faciales, puede amplificar sesgos de representación presentes en los modelos base y en los datos de entrenamiento.
- Riesgo de alucinación: en modelos de imagen se traduce en artefactos, deformaciones anatómicas o identidades inconsistentes, especialmente en poses extremas o ángulos poco habituales; el autor admite que la V5 "no es perfecta todavía".
- Orden de entrada inconsistente entre versiones: las V3, V4, V5 y la V1 de FLUX.2 Klein invierten el orden (cuerpo primero, cara después), mientras que las V1 y V2 usan el orden estándar (cara primero). Un uso incorrecto degrada el resultado.
- Limitación de idioma: los prompts están documentados únicamente en inglés.
- Restricciones de licencia: licencia MIT, que permite uso comercial, pero el uso de los modelos base subyacentes (Qwen Image Edit, FLUX.2 Klein) está sujeto a sus propias licencias, no detalladas en esta información.
- Caveat para producción: el modelo está orientado a edición de rostros y cabezas; su uso para suplantación de identidad sin consentimiento puede tener implicaciones legales y éticas según la jurisdicción.
- Madurez: el repositorio tiene 0 likes y 93 descargas, con fecha de creación y actualización el mismo día (31 de octubre de 2026), lo que indica un proyecto reciente y con poca validación comunitaria.
- No se documentan métricas objetivas de calidad ni comparaciones cuantitativas con alternativas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rustholm/BFS-Best-Face-Swap
- Workflow de head/face swap para Qwen Image Edit 2509 (Civitai): https://civitai.com/articles/20190/headface-swap-workflow-qwen-image-edit-2509
- Modelo base Qwen Image Edit 2511: https://huggingface.co/Qwen/Qwen-Image-Edit-2511
- Modelo base FLUX.2 Klein 9B: https://huggingface.co/black-forest-labs/FLUX.2-klein-9B
- Modelo base FLUX.2 Klein 4B: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
