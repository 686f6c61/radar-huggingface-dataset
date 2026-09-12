# Chinook416/3d-gen-1

## Resumen

MeshGPT-alpha-preview es un modelo de generación de mallas 3D a partir de texto (text-to-3D) publicado en el repositorio de HuggingFace Chinook416/3d-gen-1 bajo licencia Apache 2.0. Se trata de un sistema de dos componentes: un autoencoder o tokenizador 3D de aproximadamente 50 millones de parámetros que convierte mallas poligonales en secuencias de tokens discretos, y un transformer autorregresivo de 184 millones de parámetros, basado en la arquitectura GPT2-small, que genera esas secuencias condicionado por un embedding de texto. El resultado final es una malla 3D exportable en formato OBJ.

El modelo es una implementación práctica y entrenada de la idea propuesta en el artículo MeshGPT (arXiv:2311.15475), cuyos autores originales no liberaron código ni pesos. La implementación de referencia procede del repositorio de Phil Wang (lucidrains/meshgpt-pytorch) y el entrenamiento y puesta en producción corresponde a MarcusLoppe, con el demo alojado en un Space de HuggingFace. La model card indica explícitamente que el modelo fue entrenado sin patrocinadores ni alquiler de hardware, únicamente con la capa gratuita de GPU de Kaggle, lo que limita severamente su alcance.

Por su tamaño (234 millones de parámetros en total) y su codebook de solo 2048 entradas, el modelo está pensado como prueba de concepto más que como herramienta de producción. Maneja objetos individuales sencillos (sillas, mesas, camas) pero no geometrías complejas, y presenta además un problema conocido de orientación de caras en los triángulos generados. Es relevante ahora como primera publicación de un tokenizador 3D abierto y como base reproducible para experimentar con generación de geometría. El repositorio no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autoencoder (tokenizador 3D) + transformer autorregresivo basado en GPT2-small |
| Parametros totales | 234 millones (50 M del autoencoder + 184 M del transformer) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (las etiquetas de texto del entrenamiento están en inglés; la model card no declara idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible en la model card; el repositorio ocupa 1,2 GB y la carga se realiza mediante `MeshTransformer.from_pretrained` |
| Tamano del codebook | 2048 entradas |
| Entrada | Texto (prompt corto, normalmente una o dos palabras) |
| Salida | Malla 3D en formato OBJ |
| Tamano maximo de malla | 250 triangulos (limite del dataset de entrenamiento) |

## Arquitectura y entrenamiento

El sistema se compone de dos redes. La primera es un autoencoder que actúa como tokenizador de geometría: recibe una malla 3D (la model card menciona soporte teórico para quads, aunque no está implementado en esta versión), cuantiza sus elementos en un codebook de 2048 entradas y produce una secuencia de tokens. La parte decodificadora del mismo autoencoder revierte el proceso, transformando tokens en triángulos y reconstruyendo la malla. La segunda red es un transformer de 184 millones de parámetros con núcleo GPT2-small que aprende a predecir la secuencia de tokens del autoencoder mientras hace cross-attention sobre el embedding de texto. En inferencia, el transformer genera autorregresivamente la secuencia de tokens a partir del prompt y el autoencoder la convierte en geometría final.

El entrenamiento se realizó con recursos muy limitados: únicamente la capa gratuita de GPU de Kaggle, sobre un conjunto de 4000 modelos con un máximo de 250 triángulos cada uno. El vocabulario de texto asociado contiene 800 etiquetas, lo que restringe drásticamente la variedad de objetos que el modelo puede generar. Los datos provienen de tres fuentes: Objaverse (allenai/objaverse), ShapeNet (ShapeNet/shapenetcore-gltf) y ModelNet40 (balraj98/modelnet40-princeton-3d-object-dataset). La model card no menciona fases de RLHF ni DPO, algo esperable dado que no es un modelo de lenguaje. La innovación técnica principal es la publicación de lo que el autor describe como el primer tokenizador 3D abierto.

## Capacidades

- Generación de mallas 3D a partir de prompts de texto cortos, típicamente sustantivos de objetos cotidianos.
- Conversión bidireccional malla a tokens y tokens a malla mediante el autoencoder.
- Generación autorregresiva con control de temperatura (la model card usa temperatura 0.0 en todos los ejemplos).
- Producción de múltiples objetos en una sola llamada, devolviendo una lista de mallas y permitiendo guardarlas en un único fichero OBJ.
- Categorías de ejemplo verificadas en la documentación: sofá, cama, pantalla de ordenador, banco, silla, mesa, cartón de leche, puerta, pala, corazón, papelera, escalera, martillo, pedestal, pico, cruz de madera, grano de café, palanca, llave, personaje de Minecraft, cabeza de dragón, libro abierto, tortuga de Minecraft, mesa de madera, pistola, cono de helado, hacha, helicóptero, escopeta y botella de plástico.
- Tool calling / function calling: no soportado (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no soportado.
- Capacidades multilingües: no disponibles; las etiquetas de entrenamiento están en inglés.
- Capacidades especiales: ninguna adicional (no hay modo thinking, visión ni audio).

## Casos de uso

- Prototipado rápido de assets 3D para videojuegos o prototipos: un desarrollador puede escribir "chair" o "table" y obtener una malla OBJ inmediata para colocar en una escena antes de sustituirla por un asset final.
- Generación de mobiliario básico para previsualizaciones arquitectónicas: el modelo cubre bien categorías como sofá, cama, mesa, banco o pedestal, suficientes para poblar maquetas conceptuales sin modelado manual.
- Docencia e investigación sobre tokenización de geometría: al ser un tokenizador 3D abierto, sirve para estudiar cómo se discretiza una malla y cómo se reconstruye, con un codebook de 2048 entradas fácilmente inspeccionable.
- Base para fine-tuning con datasets propios: el repositorio de MarcusLoppe incluye un notebook para entrenar tu propio MeshGPT, de modo que un equipo puede partir de estos pesos y ampliar el vocabulario de texto o el número de triángulos.
- Generación de props sencillos en pipelines de contenido procedimental: integrar la llamada al modelo en un script que genere variaciones de objetos básicos (llaves, palancas, martillos) para poblar escenarios.
- Reproducción y comparación de resultados académicos: permite replicar la idea del artículo MeshGPT sin depender de una implementación propietaria, útil para trabajos que necesiten una línea base reproducible.
- Experimentación con exportación a OBJ y post-proceso: dado el problema conocido de orientación de caras, es un caso de uso realista emplear el modelo para generar geometría y después corregir normales y orden de vértices en herramientas como Blender.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar de generación 3D (como CLIP-similarity, FID sobre renders o Chamfer Distance) en la información disponible. La model card sí incluye métricas de velocidad de generación, que se recogen a continuación.

| Plataforma | Triangulos por segundo |
|---|---|
| CPU | 10 |
| GPU NVIDIA RTX 3060 | 40 |
| GPU NVIDIA RTX 4090 | 110 |

No hay datos de calidad objetiva (fidelidad geométrica, coherencia con el prompt) más allá de las imágenes de muestra incluidas en la model card.

## Requisitos de hardware

- El modelo completo suma 234 millones de parámetros, por lo que los pesos en precisión completa ocuparían alrededor de 1 GB y en media precisión unos 470 MB; el repositorio de HuggingFace ocupa 1,2 GB. Estas cifras son estimaciones a partir del recuento de parámetros, no datos publicados.
- GPU recomendadas según la model card: RTX 3060 (40 triángulos/s) y RTX 4090 (110 triángulos/s). No se mencionan A100 ni H100.
- Cabe holgadamente en cualquier GPU de consumo con al menos 4 GB de VRAM, e incluso puede ejecutarse en CPU a 10 triángulos/s.
- Opciones de despliegue: la vía documentada es la librería `meshgpt-pytorch` instalada desde el repositorio de GitHub (`pip install git+https://github.com/MarcusLoppe/meshgpt-pytorch.git`) y cargada con `MeshTransformer.from_pretrained`. Existe además un demo en Gradio alojado en HuggingFace Spaces. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- No se publican datos de latencia por generación completa ni de throughput en lote.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MeshGPT-alpha-preview (este modelo) | 234 M (50 M + 184 M) | No disponible | 10-110 triángulos/s según plataforma | Apache 2.0 | Pesos publicados en HuggingFace |
| MeshGPT (artículo original, arXiv:2311.15475) | No disponible | No disponible | No disponible | No disponible | Los autores no liberaron código ni pesos |
| Otras alternativas text-to-3D | No disponible | No disponible | No disponible | No disponible | No disponible en la información proporcionada |

La información suministrada solo permite comparar contra el artículo original de MeshGPT, del que se sabe que no publicó implementación. No hay datos suficientes para contrastar con otras familias de modelos text-to-3D.

## Limitaciones y advertencias

- Capacidad muy limitada: la model card advierte explícitamente que el modelo solo maneja objetos individuales sencillos y que los objetos complejos requerirían mucho más entrenamiento.
- Dataset de entrenamiento reducido: 4000 modelos con un máximo de 250 triángulos y solo 800 etiquetas de texto, lo que restringe el vocabulario efectivo y la variedad de geometrías.
- Problema conocido de orientación de caras: el orden de los triángulos se optimizó antes del entrenamiento, lo que provoca errores en la orientación; el autor indica que se corregirá en versiones posteriores, pero no hay fecha comprometida.
- Ausencia de datos sobre sesgos: al no ser un modelo de lenguaje, no se documentan sesgos sociales, pero sí existe un sesgo de dominio evidente hacia las categorías de Objaverse, ShapeNet y ModelNet40.
- Riesgo de alucinación geométrica: al generar autorregresivamente, puede producir mallas incoherentes o cerradas incorrectamente cuando el prompt queda fuera de la distribución de entrenamiento.
- Limitaciones de idioma: las etiquetas de entrenamiento están en inglés; se desconoce el comportamiento con prompts en castellano.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la model card no incluye cláusulas adicionales ni garantías; conviene revisar también las licencias de los datasets de origen (Objaverse, ShapeNet, ModelNet40) si se redistribuyen derivados.
- Caveat de producción: los pesos del repositorio figuran bajo el ID Chinook416/3d-gen-1 mientras que el ejemplo de código de la model card carga "MarcusLoren/MeshGPT-preview"; hay que verificar qué artefacto se está descargando realmente antes de integrarlo en un pipeline.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin historial de mantenimiento ni issues resueltos que permitan evaluar la fiabilidad a largo plazo.
- Sin soporte de contexto largo, tool calling ni agentes, por lo que no debe considerarse un sustituto de un LLM en flujos de trabajo complejos.
- Las fechas de creación y actualización del repositorio (2026-09-12) no permiten extraer información sobre versionado o madurez.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Chinook416/3d-gen-1
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/MarcusLoren/MeshGPT
- Articulo original de MeshGPT: https://arxiv.org/abs/2311.15475
- Repositorio de referencia de Phil Wang: https://github.com/lucidrains/meshgpt-pytorch
- Repositorio de entrenamiento y notebook de MarcusLoppe: https://github.com/MarcusLoppe/meshgpt-pytorch
- Dataset Objaverse: https://huggingface.co/datasets/allenai/objaverse
- Dataset ShapeNet: https://huggingface.co/datasets/ShapeNet/shapenetcore-gltf
- Dataset ModelNet40: https://www.kaggle.com/datasets/balraj98/modelnet40-princeton-3d-object-dataset/data

Nota: los resultados de la búsqueda web proporcionados no contienen información relevante sobre el modelo; los enlaces devueltos corresponden a páginas de menús de un restaurante y se han descartado por completo.
