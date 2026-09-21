# 0xSojalSec/Qwen-Image-2.1-Uncensored-GGUF

## Resumen

Qwen-Image-2.1-Uncensored-GGUF es una cuantización en formato GGUF del modelo de generación de imágenes a partir de texto Qwen/Qwen-Image-2.1, publicada por el usuario 0xSojalSec. El repositorio no contiene pesos entrenados desde cero ni un ajuste fino: son los pesos originales del transformer de imágenes del modelo base, convertidos con stable-diffusion.cpp y reempaquetados para su ejecución en ComfyUI a través de la extensión ComfyUI-GGUF.

El componente cuantizado es un transformer de aproximadamente 7.115 millones de parámetros, según los datos de safetensors del repositorio, que ocupa 27,3 GB en total e incluye cinco niveles de cuantización: Q8_0 (7,59 GiB), Q6_K (5,88 GiB), Q5_K_M (5,22 GiB), Q4_K_M (4,6 GiB) y Q4_0 (4,05 GiB). La inferencia requiere además el text encoder y el VAE del repositorio original, que no se distribuyen en esta publicación.

Su interés es eminentemente práctico: permite ejecutar un generador de imágenes de gran tamaño en hardware de consumo al reducir el peso del transformer hasta 4,6 GiB con Q4_K_M. La etiqueta "uncensored" no implica pesos modificados ni abliteration, sino la ausencia observada de filtros de seguridad o listas negras de prompts a nivel de pipeline en las pruebas locales del autor. El repositorio no registra descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. La model card solo indica que el GGUF contiene el "image transformer" de Qwen-Image-2.1 |
| Parametros totales | 7.115.124.736 (~7,1 B) en el transformer, dato de safetensors |
| Parametros activos | No aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | No aplica como ventana de texto; longitud máxima de prompt no disponible |
| Tipos de cuantizacion | Q8_0 (7,59 GiB), Q6_K (5,88 GiB), Q5_K_M (5,22 GiB), Q4_K_M (4,6 GiB, recomendada por el autor), Q4_0 (4,05 GiB) |
| Idiomas soportados | No disponible |
| Licencia | qwen-research (Qwen Research License) |
| Formato de pesos | GGUF para el transformer; el text encoder y el VAE se obtienen por separado del modelo base en formato no especificado |

Otros datos relevantes: repositorio de 27,3 GB, pipeline text-to-image, librería gguf, revisión de origen `b3179ad355be050328e483a9dfdd9e60cd62adfa` y conversión realizada con stable-diffusion.cpp en el commit `1330cebae8f2ba99249df846cc0c9444fcbd4308`. Fechas de creación y última actualización: 20 de septiembre de 2026.

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del transformer (tipo de bloque, mecanismo de atención, dimensionalidad, número de capas ni esquema de condicionamiento) más allá de la denominación "image transformer" empleada por el autor. Tampoco se documentan los datos de entrenamiento del modelo original: número de tokens, composición del dataset, resolución de entrenamiento, uso de RLHF, DPO u otras técnicas de alineación. Esos detalles corresponden a la model card de Qwen/Qwen-Image-2.1, que no forma parte de la información proporcionada.

Lo que sí está documentado es el proceso de construcción de esta publicación: una conversión de pesos sin modificación alguna. El autor afirma explícitamente que no se aplicó ajuste fino, abliteration ni ninguna otra alteración de los pesos, y que la conversión se realizó con stable-diffusion.cpp. La única innovación reseñable es, por tanto, la disponibilidad de versiones cuantizadas de un transformer de ~7,1 B que de otro modo requeriría bastante más memoria para inferencia.

## Capacidades

- Generación de imágenes a partir de descripciones textuales (text-to-image), ejecutada sobre el transformer cuantizado del modelo base.
- Conversión de prompts a imágenes dentro de flujos de trabajo de ComfyUI mediante los nodos de ComfyUI-GGUF.
- Ejecución totalmente local y sin conexión, una vez descargados el GGUF, el text encoder y el VAE.
- Generación de contenido sensible (desnudos, violencia y otras categorías de prueba) sin rechazos observados en el pipeline local, según las pruebas declaradas por el autor.
- Ajuste del equilibrio calidad/tamano seleccionando el nivel de cuantización (de Q4_0 a Q8_0).
- No es un modelo de lenguaje: no realiza generación de texto, razonamiento, código ni matemáticas.
- No soporta tool calling, function calling ni razonamiento multi-paso orientado a agentes.
- El soporte multilingüe de prompts no está documentado en la información disponible.

## Casos de uso

- Generación de imágenes en local para ilustración conceptual: el transformer cuantizado en Q4_K_M ocupa 4,6 GiB, lo que permite iterar bocetos en un equipo de sobremesa sin depender de servicios en la nube ni de cuotas de API.
- Prototipado de assets para videojuegos y animación: integrado en ComfyUI se pueden encadenar lotes de variaciones de personajes, objetos o escenarios antes de encargar el arte final.
- Creación de material gráfico para marketing y mockups: genera imágenes de apoyo para presentaciones o pruebas de concepto internas donde no se requiere calidad de producción final.
- Storyboards y previsualización audiovisual: la generación por lotes desde ComfyUI permite producir secuencias de viñetas a partir de descripciones de escena.
- Investigación en seguridad de modelos generativos: al no incorporar filtro de seguridad a nivel de pipeline, resulta útil para estudios de red teaming, evaluación de sesgos y análisis de contenido dañino en entornos controlados.
- Procesos con requisitos de confidencialidad: estudios jurídicos, clínicas o departamentos de I+D que no pueden enviar descripciones de proyectos a servicios alojados pueden ejecutar el modelo en infraestructura propia y aislada de la red.
- Formación y docencia sobre modelos de difusión: sirve para ilustrar en un aula el efecto de distintas cuantizaciones sobre la calidad de salida, dado que se ofrecen cinco niveles del mismo modelo.
- Automatización de pipelines de imagen: ComfyUI expone una API que permite lanzar generaciones por lotes desde scripts, encadenando este modelo con etapas de postprocesado.

## Benchmarks y rendimiento

La model card incluye una imagen de referencia (`assets/Qwen-Image-2.1-Benchmark.png`) que no aporta valores numéricos en el texto proporcionado. No se han publicado resultados de benchmarks en la información disponible, ni comparaciones cuantitativas entre los distintos niveles de cuantización.

## Requisitos de hardware

- VRAM estimada para el transformer: aproximadamente el tamaño del archivo más un margen de overhead (del orden de 1-2 GB, estimación propia). Es decir, en torno a 5-6 GB para Q4_0, 6-7 GB para Q4_K_M, 7-8 GB para Q5_K_M, 7-8 GB para Q6_K y 9-10 GB para Q8_0.
- A esas cifras hay que sumar la memoria del text encoder y del VAE del modelo base, cuyo tamaño no está disponible en la información proporcionada. Las estimaciones anteriores son orientativas y deben validarse en el sistema objetivo.
- GPU de consumo: los niveles Q4_0 y Q4_K_M son los candidatos para tarjetas con 8-12 GB de VRAM (por ejemplo, RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070). Los niveles Q5_K_M y Q6_K encajan mejor en 12-16 GB. Q8_0 requiere presumiblemente 12-16 GB o más.
- GPU profesionales: A100, H100 o L40S pueden ejecutar cualquiera de los niveles sin restricciones de memoria, aunque están sobredimensionadas para un transformer de 7,1 B.
- Despliegue: el camino documentado por el autor es ComfyUI con ComfyUI-GGUF, colocando el GGUF en `models/diffusion_models/`. stable-diffusion.cpp es la herramienta de conversión y también puede emplearse para inferencia. vLLM, Ollama, TGI y llama.cpp no son aplicables, al tratarse de un modelo de difusión y no de un modelo de lenguaje.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tiempo por imagen ni de imágenes por segundo para ninguna de las cuantizaciones.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de alternativas en la información proporcionada. La única comparación verificable es con el propio modelo base.

| Modelo | Parametros | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|
| 0xSojalSec/Qwen-Image-2.1-Uncensored-GGUF | 7,1 B (transformer) | GGUF en 5 cuantizaciones | qwen-research | Repositorio publico, 0 descargas |
| Qwen/Qwen-Image-2.1 | No disponible | Pesos originales del modelo base | qwen-research | Repositorio original de Qwen |
| Alternativas de la misma categoria (otros text-to-image cuantizados en GGUF) | No disponible | No disponible | No disponible | No disponible en la información proporcionada |

## Limitaciones y advertencias

- La licencia qwen-research es una licencia de investigación: debe revisarse el texto legal completo antes de cualquier uso comercial. El campo `license` aparece como `other` con `license_name: qwen-research`, lo que añade ambigüedad formal.
- El repositorio no incluye el text encoder ni el VAE. Sin descargarlos del modelo base, el GGUF es inutilizable.
- No hay resultados de benchmarks numéricos publicados para estas cuantizaciones, por lo que se desconoce la pérdida de calidad real de Q4_0, Q4_K_M, Q5_K_M y Q6_K frente a los pesos originales.
- Cero descargas y cero valoraciones: no existe validación independiente de la comunidad sobre la integridad o la calidad de la conversión.
- La afirmación de que el modelo es "uncensored" procede únicamente de pruebas locales del autor. No hay auditoría externa y los servicios alojados pueden aplicar su propia moderación, por lo que el comportamiento puede diferir.
- El uso de un modelo sin filtros de seguridad implica riesgo de generar contenido ilegal, difamatorio o dañino. La responsabilidad legal y ética recae por completo en quien lo despliega.
- No hay información sobre sesgos demográficos, culturales o de representación en las imágenes generadas.
- No se documentan los idiomas soportados en los prompts.
- El riesgo de alucinación no aplica en el sentido habitual de los modelos de lenguaje, pero sí existe riesgo de que la imagen no se corresponda fielmente con el prompt; no hay datos sobre fidelidad al prompt.
- Inconsistencia de metadatos: el repositorio pertenece a `0xSojalSec`, mientras que los enlaces del README apuntan a una cuenta distinta (`abenzerps`). Conviene verificar la procedencia antes de descargar.
- Al ser una conversión de pesos sin ajuste, hereda cualquier limitación, sesgo o problema de calidad del modelo original Qwen/Qwen-Image-2.1.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/0xSojalSec/Qwen-Image-2.1-Uncensored-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- ComfyUI-GGUF: https://github.com/city96/ComfyUI-GGUF
- stable-diffusion.cpp: https://github.com/leejet/stable-diffusion.cpp
- Checksums del repositorio: https://huggingface.co/0xSojalSec/Qwen-Image-2.1-Uncensored-GGUF/blob/main/SHA256SUMS
- Imagen de benchmark referenciada en la model card: assets/Qwen-Image-2.1-Benchmark.png (ruta relativa dentro del repositorio)
- Revision de origen de los pesos: `b3179ad355be050328e483a9dfdd9e60cd62adfa`
- Commit de conversion: stable-diffusion.cpp `1330cebae8f2ba99249df846cc0c9444fcbd4308`
- Nota: la búsqueda web realizada no devolvió ningún resultado relacionado con el modelo (los resultados obtenidos trataban sobre café y bebidas). No se dispone de papers, blogs ni demos adicionales.
