# LibreYOLO/LibreMolmo28b

## Resumen

LibreMolmo28b es un espejo (snapshot mirror) del modelo multimodal allenai/Molmo2-8B, publicado por LibreYOLO en Hugging Face bajo licencia Apache-2.0. No se trata de un modelo nuevo ni de un fine-tuning: según la propia model card, los pesos, los activos del tokenizador, la configuración y el código remoto son idénticos a los del checkpoint original de Ai2, fijado en el commit `e28fa28597e5ec5e0cca2201dd8ab33d48bc4a1b`. Lo único que anade LibreYOLO es su propia tarjeta, un fichero LICENSE y un NOTICE; la tarjeta original se conserva como `README.upstream.md`.

El modelo resuelve una tarea muy concreta dentro del pipeline de LibreYOLO: el *pointing* sobre una única imagen. El usuario proporciona una imagen y una lista de nombres de clases (por ejemplo `names=["boat"]`) y el modelo devuelve coordenadas puntuales (`result.points.xy`) para cada objeto solicitado. Se trata, por tanto, de localización puntual por lenguaje natural, no de detección con cajas, segmentación ni seguimiento.

Su relevancia es acotada pero clara: permite incorporar localización visual guiada por texto a flujos de anotación o de inspección sin entrenar un detector específico por clase. Conviene tener presente que el repositorio acumula 0 descargas y 0 "likes" en el momento de la consulta, que el tamaño de parámetros es de 8.661.703.120 (unos 8,66 mil millones, pese al "28b" del nombre) y que la model card no publica ni arquitectura interna detallada, ni longitud de contexto, ni idiomas soportados, ni ningún benchmark.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo multimodal image-text-to-text; la model card no detalla la arquitectura interna) |
| Parametros totales | 8.661.703.120 (~8,66 mil millones) |
| Parametros activos | No aplica: no se indica que sea un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No documentados. El repositorio distribuye safetensors sin cuantizar; no se ofrecen variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 (modelo original publicado por el Allen Institute for AI) |
| Formato de pesos | safetensors (repositorio de 34,7 GB) |

Datos adicionales verificables: `library_name` transformers, pipeline `image-text-to-text`, etiquetas `molmo2`, `pointing`, `custom_code`, `libreyolo`; modelo base declarado `allenai/Molmo2-8B`; requiere código remoto (`trust_remote_code`) y la versión de Transformers 4.57.1 según la model card.

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo. La model card de LibreMolmo28b es explícita al respecto: se limita a declarar que es un espejo del checkpoint de Ai2 y que "weights, tokenizer assets, configuration and remote model code are unchanged". Por las etiquetas y el pipeline (`image-text-to-text`, `custom_code`) puede afirmarse que es un modelo de visión-lenguaje que procesa imágenes y texto, pero no hay datos publicados aquí sobre tipo de transformer, mecanismo de atención, encoder visual, resolución de entrada ni estrategia de fusión multimodal.

Tampoco se documentan los datos de entrenamiento: no se indica el número de tokens, la composición del dataset, ni si hubo etapas de RLHF, DPO u otro ajuste por preferencias. La model card indica que el runtime carga código remoto desde un snapshot fijado y que se necesita una build de LibreYOLO que contenga la familia Molmo2 (`pip install 'libreyolo[molmo2]'`). La única innovación reseñable desde el punto de vista de esta publicación es de integración, no de modelado: exponer el *pointing* de una sola imagen como tarea por defecto y única soportada a través de la clase `LibreVLM`.

## Capacidades

- Localización puntual (*pointing*) guiada por texto sobre una única imagen: se pasa una imagen y una lista de nombres de clase, y se obtienen coordenadas (`points.xy`).
- Interfaz multimodal imagen-texto, expuesta mediante `LibreVLM("molmo2-8b", names=[...])` dentro del ecosistema LibreYOLO.
- Integración con código remoto y `transformers` (versión fijada 4.57.1).
- Detección con cajas delimitadoras: no soportada según la model card.
- Entrenamiento, validación y exportación: no soportados.
- Seguimiento de puntos entre fotogramas (*point tracking*): no soportado.
- Tool calling / function calling: no documentado.
- Comportamiento agéntico o razonamiento multi-paso: no documentado.
- Capacidades multilingües: no disponibles (idiomas no declarados).
- Modo *thinking*, audio u otras modalidades: no documentados.
- Puntuación de confianza: la model card advierte de que el valor devuelto es una confianza sintética fija de 1.0, por lo que no debe interpretarse como probabilidad calibrada.

## Casos de uso

- Anotación asistida de datasets de detección: dado que el modelo devuelve un punto por objeto solicitado a partir de un nombre de clase, se puede usar para preanotar la ubicación aproximada de objetos en lotes de imágenes y que un anotador humano convierta esos puntos en cajas, reduciendo el tiempo de etiquetado.
- Curaduría y filtrado de datasets: localizar una clase concreta (por ejemplo `boat`) en un corpus de imágenes para seleccionar automáticamente las que contienen el objeto de interés antes de entrenar un detector propio.
- Inspección industrial asistida: solicitar el punto de un componente concreto (tornillo, etiqueta, conectores) sobre imágenes de línea de producción para generar avisos de revisión humana cuando el punto cae fuera de la región esperada.
- Comercio electrónico: localizar el producto principal dentro de una fotografía de catálogo o de una escena de usuario, por ejemplo para decidir el recorte (crop) o el encuadre de la ficha de producto.
- Accesibilidad y descripción asistida: dada una consulta textual del tipo "dónde está la salida", obtener un punto sobre la imagen para superponer una marca en una interfaz de asistencia visual.
- Verificación en pipelines de control de calidad: comprobar si un objeto solicitado está presente en la imagen y en qué punto, como paso previo a un sistema de decisión de mayor nivel que sí haga detección o clasificación.
- Prototipado rápido de robótica o automatización: obtener una coordenada en el plano de imagen para tareas de señalización o encuadre de cámara, siempre que el sistema posterior asuma la conversión a coordenadas del mundo y no requiera cajas.

En todos los casos conviene recordar que la única tarea soportada es el *pointing* y que la confianza devuelta es sintética (1.0), por lo que el modelo no debe usarse como fuente de scores de fiabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card es explícita: "no peak-memory or accuracy benchmark is claimed here". No hay datos de MMLU, HumanEval, GSM8K, tareas de grounding ni métricas de precisión de *pointing*, ni para este espejo ni comparados con el modelo original en la documentación proporcionada.

## Requisitos de hardware

- Tamaño de pesos: 8.661.703.120 parámetros. El repositorio ocupa 34,7 GB, coherente con pesos sin cuantizar de 32 bits (~34,6 GB teóricos); para 16 bits serían ~17,3 GB. Estas cifras son estimaciones de tamaño, no mediciones publicadas.
- VRAM estimada para inferencia en 16 bits: del orden de 20-24 GB contando pesos, activaciones y caché, y previsiblemente más si se procesan imágenes de alta resolución.
- VRAM estimada en 8 bits: ~10-12 GB. En 4 bits: ~6-8 GB. No se ofrecen cuantizaciones oficiales en el repositorio.
- GPU recomendadas: A100 40/80 GB o H100 para 16 bits con margen y concurrencia; L40S o RTX 6000 Ada (48 GB) como alternativa profesional; RTX 4090 / 3090 (24 GB) pueden bastar en 16 bits con lotes pequeños, y en 4 bits cabría en GPU de 12-16 GB.
- Opciones de despliegue: `transformers` con código remoto (`trust_remote_code=True`) y Transformers 4.57.1, más la build de LibreYOLO con el extra `molmo2`. No se documentan rutas oficiales para vLLM, TGI, llama.cpp ni Ollama; sin pesos GGUF publicados, llama.cpp y Ollama no son utilizables directamente.
- Latencia y throughput: no disponibles. La model card no publica mediciones de memoria pico, latencia ni tokens por segundo.
- Almacenamiento: se necesitan al menos ~35 GB de disco solo para el snapshot de pesos, más el entorno con el código remoto fijado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LibreMolmo28b | 8,66 B | No disponible | Pointing de una sola imagen | Apache-2.0 | Hugging Face, 0 descargas, 0 likes |
| allenai/Molmo2-8B (upstream) | 8,66 B (mismos pesos) | No disponible | Modelo de visión-lenguaje de propósito general | Apache-2.0 | Repositorio oficial de Ai2 |
| Otros VLM de rango 7-9 B | No disponible | No disponible | No disponible | No disponible | No disponible |

Este repositorio no aporta pesos nuevos: es bit a bit el checkpoint de `allenai/Molmo2-8B` en un commit concreto. La diferencia práctica frente al original es el envoltorio (tarjeta de LibreYOLO, LICENSE, NOTICE y acceso vía `LibreVLM`), no el modelo. La información proporcionada no incluye datos numéricos de otros VLM comparables, por lo que no se puede establecer una comparación cuantitativa con alternativas como las familias Qwen-VL, InternVL o Llama-3.2-Vision.

## Limitaciones y advertencias

- Tarea única: solo *pointing*. Detección con cajas, entrenamiento, validación, exportación y *point tracking* no están soportados.
- Confianza no fiable: el valor devuelto es una confianza sintética de 1.0, sin calibración; no debe usarse para umbralizar ni para priorizar resultados.
- Sin benchmarks: no hay métricas de precisión ni de memoria publicadas, ni por el espejo ni en la documentación aportada, por lo que no se puede estimar su calidad en producción.
- Idiomas no declarados: se desconoce el soporte multilingüe y el comportamiento con instrucciones en castellano.
- Longitud de contexto desconocida: no se puede planificar el uso con muchas imágenes, conversaciones largas o prompts extensos.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria independiente.
- Código remoto: el runtime carga código remoto desde un snapshot fijado, lo que implica riesgo de cadena de suministro y obliga a auditar el repositorio antes de desplegarlo en entornos controlados. Además, ata el proyecto a Transformers 4.57.1.
- Licencia: Apache-2.0 permite uso comercial, pero exige conservar LICENSE, NOTICE y los avisos de atribución correspondientes al modelo original de Ai2; conviene revisar los términos del repositorio upstream antes de redistribuir.
- Riesgo de alucinación geométrica: al devolver puntos, el modelo puede señalar ubicaciones plausibles aunque el objeto solicitado no exista realmente en la imagen; no hay en la documentación ningún mecanismo de abstención documentado.
- Uso responsable: al ser un modelo de visión-lenguaje sin filtros documentados, se recomienda validar sus salidas antes de integrarlas en flujos automatizados con impacto sobre usuarios.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/LibreYOLO/LibreMolmo28b
- Modelo base / upstream: https://huggingface.co/allenai/Molmo2-8B
- Tarjeta original preservada en el repositorio: `README.upstream.md` (dentro de https://huggingface.co/LibreYOLO/LibreMolmo28b)
- Documentación de licencia y procedencia: ficheros `LICENSE` y `NOTICE` del repositorio
- Nota sobre la búsqueda web: los resultados devueltos por la búsqueda no contienen información técnica ni enlaces relevantes sobre este modelo, por lo que no se incluyen.
