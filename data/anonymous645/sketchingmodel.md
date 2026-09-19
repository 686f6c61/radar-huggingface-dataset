# Anonymous645/SketchingModel

## Resumen

Anonymous645/SketchingModel no es un modelo de lenguaje: es un repositorio espejo que aloja dos ficheros de pesos (udf_full.pth y ndc_full.pth) del proyecto Deep-Sketch-Vectorization, publicados bajo licencia MIT. Según su propia model card, estos pesos son los que requiere la herramienta Image2CAD para realizar vectorización de bocetos. El repositorio no contiene código, tokenizador, configuración de arquitectura ni documentación técnica adicional: únicamente los dos state dicts de PyTorch y el fichero de licencia.

El interés del repositorio es práctico y acotado: sirve como punto de descarga para quien quiera reproducir el pipeline de Image2CAD sin clonar el repositorio original de GitHub. El autor declara explícitamente que no reclama autoría sobre los pesos y que estos proceden del proyecto Deep-Sketch-Vectorization, también MIT. Con cero descargas y cero likes en el momento de la consulta, se trata de un espejo recién creado (19 de septiembre de 2026 según los metadatos), sin comunidad ni validación externa conocida.

La relevancia es limitada fuera del nicho de vectorización de bocetos a CAD. No hay información pública sobre arquitectura, número de parámetros, datos de entrenamiento ni benchmarks, por lo que cualquier evaluación rigurosa exige inspeccionar los propios ficheros .pth o acudir al repositorio original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible. La model card no documenta la topología; los nombres de fichero (udf_full.pth, ndc_full.pth) sugieren dos subredes diferenciadas, pero no se especifica qué son ni cómo se combinan |
| Parámetros totales | No disponible. Estimación a partir del tamaño de los ficheros: ~44,3 M en udf_full.pth y ~3,46 M en ndc_full.pth si los pesos están en fp32; ~88,5 M y ~6,93 M respectivamente si están en fp16. Estimación no confirmada |
| Parámetros activos | No aplica: no hay evidencia de que sea un modelo MoE |
| Longitud de contexto | No aplica: el modelo no procesa secuencias de texto |
| Tipos de cuantización | No disponible. Los pesos se distribuyen sin cuantizar (state dicts de PyTorch). No se ofrecen versiones GGUF, AWQ, GPTQ ni similares |
| Idiomas soportados | No disponible / no aplica. La entrada declarada es imagen (bocetos); no se documenta procesamiento de lenguaje natural |
| Licencia | MIT |
| Formato de pesos | PyTorch .pth (state dict). udf_full.pth: 177.010.097 bytes. ndc_full.pth: 13.852.597 bytes |
| Tamaño del repositorio | 0,2 GB |
| SHA256 | udf_full.pth: 254db6cdd4349ca8a0a9fcf1f38d1e0fa3e19ee85131e57107a92b58122acbe1. ndc_full.pth: bb6450f2af702e0f0c936416d8ea52ba937362ff5ad5e59fcee9b83c21ed64ab |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura en la documentación disponible. La model card se limita a listar los dos ficheros de pesos, su tamaño y su hash SHA256, e indica que provienen del proyecto Deep-Sketch-Vectorization. No hay descripción de capas, tipo de red (CNN, transformer, red implícita, etc.), resolución de entrada, representación de salida ni mecanismo de decodificación. Tampoco hay información sobre el número de tokens o muestras de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de ajuste como RLHF, DPO o fine-tuning supervisado. La única referencia técnica disponible es la denominación de los ficheros, udf y ndc, que no se explica en el texto.

Desde el punto de vista de la reproducibilidad, el repositorio es un espejo de artefactos, no una ficha de modelo. Cualquier caracterización de la arquitectura o del proceso de entrenamiento requeriría consultar el código del proyecto original en GitHub o inspeccionar la estructura de los state dicts con herramientas como torch.load y la impresión de las claves del diccionario.

## Capacidades

La model card solo declara una finalidad: proporcionar los pesos que Image2CAD necesita para la vectorización de bocetos. A partir de esa declaración, y siempre con la cautela de que no hay documentación funcional detallada, las capacidades atribuibles son:

- Vectorización de bocetos: conversión de trazos rasterizados en representaciones vectoriales utilizables en un flujo de trabajo CAD, según la función que le asigna Image2CAD.
- Integración como componente de un pipeline mayor: los pesos están pensados para ser consumidos por Image2CAD, no para uso autónomo.
- Procesamiento de imágenes: la entrada es gráfica, no textual.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documentan capacidades multilingües.
- No se documentan modos especiales (thinking mode, visión general, audio, etc.).
- No hay evidencia de que el modelo genere texto, código ni resuelva tareas de matemáticas.

## Casos de uso

- Vectorización de bocetos escaneados a CAD: el caso de uso declarado. Un estudio de diseño digitaliza bocetos en papel o fotografías de croquis y obtiene geometría vectorial editable, evitando el redibujado manual.
- Preprocesado en pipelines de diseño generativo: la salida vectorial puede alimentar herramientas de modelado paramétrico que necesitan curvas y segmentos, no píxeles.
- Digitalización de archivos históricos de planos: digitalizar fondos documentales de planos en papel para conservación y consulta, con la salvedad de que la calidad del resultado depende de un modelo sin benchmarks publicados.
- Integración en aplicaciones de ingeniería inversa: a partir de un boceto o croquis de una pieza, obtener una representación vectorial que sirva como punto de partida para reconstruir el modelo CAD.
- Reproducción de resultados en investigación: al estar los pesos publicados con hashes verificables y licencia MIT, un grupo de investigación puede replicar el pipeline de Deep-Sketch-Vectorization sin depender del repositorio original.
- Automatización de tareas de delineación en estudios de arquitectura: convertir bocetos preliminares en trazados vectoriales para iterar sobre ellos en herramientas de dibujo asistido.
- Generación de datos sintéticos para entrenar otros modelos: la vectorización de bocetos a pares vector-imagen puede servir para construir datasets en dominios CAD, siempre que se respete la licencia MIT de los pesos y del proyecto de origen.
- Empaquetado en una herramienta interna: dado el tamaño reducido del conjunto de pesos (~191 MB en total), es viable distribuirlo dentro de una aplicación de escritorio o un contenedor de servicio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de ningún tipo (ni de error de reconstrucción geométrica, ni comparativas con otros vectorizadores, ni evaluaciones cualitativas). Los resultados de la búsqueda web realizada no contienen información relevante sobre el modelo: devuelven exclusivamente páginas de turismo de Delhi, sin relación alguna con el repositorio.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Con un total de ~191 MB de pesos, la inferencia de un modelo de este orden de magnitud (decenas de millones de parámetros, si la estimación por tamaño de fichero es correcta) debería caber holgadamente en 1-2 GB de VRAM, incluso en fp32.
- GPU recomendadas: no especificadas por el autor. Cualquier GPU con al menos 4 GB de memoria (GTX 1650, RTX 3050, RTX 3060, T4) debería ser suficiente. No se requiere hardware de centro de datos (A100, H100) por tamaño, aunque no hay datos de latencia que lo confirmen.
- Ejecución en CPU: plausible dado el tamaño, pero no documentada ni medida.
- GPU de consumo: sí, previsiblemente cualquier GPU de consumo moderna; no hay confirmación oficial.
- Opciones de despliegue: carga nativa con PyTorch (torch.load). No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje y no se distribuye en formatos GGUF o safetensors. El despliegue previsto es a través de Image2CAD.
- Latencia y throughput: no disponibles.
- Advertencia de seguridad en la carga: al tratarse de ficheros .pth (pickle), se recomienda cargarlos con weights_only=True y verificar los hashes SHA256 antes de usarlos.

## Comparativa con modelos similares

No se dispone de datos verificables de modelos comparables en la información proporcionada. En el ámbito de la vectorización existen trazadores algorítmicos clásicos (por ejemplo, Potrace o VTracer) que no son redes neuronales, y enfoques de aprendizaje automático publicados en la literatura de gráficos por computador, pero la documentación de este repositorio no ofrece ninguna comparación cuantitativa ni cualitativa con ellos.

| Criterio | SketchingModel (Deep-Sketch) | Trazadores algorítmicos clásicos |
|---|---|---|
| Tipo | Pesos de un modelo neuronal de vectorización (según el propósito declarado) | Algoritmos deterministas de trazado de contornos |
| Parámetros | No disponible (estimación: ~47,8 M en fp32 sumando ambos ficheros) | No aplica |
| Contexto | No aplica | No aplica |
| Rendimiento comparado | No disponible | No disponible |
| Licencia | MIT | No disponible en la información consultada |
| Disponibilidad | HuggingFace, 0 descargas, espejo sin validación externa | Ampliamente distribuidos, pero sin relación con este repositorio |
| Datos de entrenamiento | No disponibles | No aplica |

## Limitaciones y advertencias

- Ausencia total de documentación técnica: no hay información sobre arquitectura, datos de entrenamiento, métricas ni limitaciones declaradas por el autor.
- Riesgo de alucinación: no aplica en el sentido habitual (no genera texto), pero sí existe riesgo de reconstrucción geométrica incorrecta, imposible de cuantificar sin benchmarks.
- Sesgos: no evaluables con la información disponible. Un modelo entrenado con un conjunto de bocetos concreto puede generalizar mal fuera de ese dominio (estilos de dibujo, resoluciones, tipos de trazo).
- Idiomas: no aplica; el modelo no procesa texto. No hay información sobre su comportamiento con anotaciones o etiquetas textuales.
- Licencia: MIT para los pesos y para el proyecto de origen, lo que permite uso comercial, modificación y redistribución siempre que se conserve el aviso de copyright y la licencia. El espejo incluye el fichero LICENSE original, pero conviene verificar el estado de la licencia en el repositorio de origen.
- Procedencia y confianza: el repositorio pertenece a un autor anónimo (Anonymous645), no vinculado al proyecto original. Los hashes SHA256 publicados permiten verificar la integridad de la descarga, pero no garantizan que el contenido coincida con el de la fuente original; se recomienda contrastar con el repositorio de Deep-Sketch-Vectorization.
- Seguridad de carga: los .pth son pickles y pueden ejecutar código arbitrario al deserializarse. Cargar solo desde una fuente verificada y con weights_only=True.
- Mantenimiento: sin descargas ni actividad, no hay garantía de que el repositorio siga disponible ni de que se actualice.
- Dependencia de terceros: los pesos están pensados para Image2CAD, pero el repositorio no incluye ni enlaza explícitamente el código de ese proyecto, solo el de Deep-Sketch-Vectorization.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Anonymous645/SketchingModel
- Proyecto original Deep-Sketch-Vectorization: https://github.com/Nauhcnay/Deep-Sketch-Vectorization
- Image2CAD: mencionado en la model card como consumidor de los pesos, sin URL disponible
- Resultados de búsqueda web: sin enlaces relevantes; las consultas devolvieron únicamente páginas de turismo de Delhi sin relación con el modelo
