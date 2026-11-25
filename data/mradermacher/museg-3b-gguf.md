# mradermacher/MUSEG-3B-GGUF

## Resumen

MUSEG-3B-GGUF es la distribucion en formato GGUF del modelo multimodal MUSEG-3B, desarrollado originalmente por el proyecto Darwin-Project y cuantizado por mradermacher. El modelo base es un transformer multimodal de 3.085.938.688 parametros (aproximadamente 3,09 mil millones) que combina comprension de texto e imagen, y que ha sido afinado sobre el dataset PolyU-ChenLab/ET-Instruct-164K, un conjunto de instrucciones orientado a tareas de extraccion y comprension de informacion visual.

La relevancia de esta publicacion radica en que mradermacher ofrece el modelo en una bateria completa de cuantizaciones GGUF estaticas (desde Q2_K hasta f16, ademas de los suplementos multimodales `mmproj` en Q8_0 y f16), lo que permite ejecutar un modelo multimodal de 3B en hardware de consumo mediante llama.cpp y herramientas compatibles. El repositorio ocupa 30,1 GB e incluye todos los niveles de cuantizacion, aunque cada archivo individual pesa entre 1,4 GB y 6,3 GB.

La licencia es Apache 2.0 y el unico idioma declarado es el ingles. Al tratarse de una cuantizacion, las capacidades del modelo son las del modelo base Darwin-Project/MUSEG-3B; esta ficha describe la distribucion GGUF y las caracteristicas conocidas del modelo base a partir de la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto + imagen); detalles internos no disponibles |
| Parametros totales | 3.085.938.688 (aproximadamente 3,09 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; suplementos multimodales mmproj-f16 y mmproj-Q8_0 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

El modelo base Darwin-Project/MUSEG-3B es un transformer multimodal de aproximadamente 3,09 mil millones de parametros que procesa texto e imagen, segun se deduce de la presencia de los archivos `mmproj` (proyeccion multimodal) en el repositorio GGUF. No se dispone de informacion detallada sobre el numero de capas, dimensiones ocultas, mecanismo de atencion ni sobre la arquitectura exacta del codificador visual en la informacion proporcionada.

El modelo fue afinado sobre el dataset PolyU-ChenLab/ET-Instruct-164K, un conjunto de instrucciones de 164.000 ejemplos orientado a tareas de extraccion y comprension de informacion. No se especifica en la informacion disponible el numero total de tokens de entrenamiento, la composicion completa del dataset ni si se aplicaron tecnicas de RLHF, DPO u otras fases de alineamiento. La cuantizacion la realiza mradermacher con `quantize_version: 2` y `output_tensor_quantised: 1`, generando cuantizaciones estaticas; las cuantizaciones con imatrix (ponderadas) se publican en un repositorio separado (MUSEG-3B-i1-GGUF).

## Capacidades

- Generacion de texto conversacional en ingles.
- Comprension de imagenes: el repositorio incluye suplementos `mmproj` (f16 y Q8_0) necesarios para el procesamiento multimodal, lo que confirma capacidad de vision.
- Extraccion de informacion a partir de instrucciones, dado el dataset de ajuste (ET-Instruct-164K, orientado a extraccion).
- Conversacion multi-turno (etiqueta `conversational`).
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Modo de razonamiento explicito (thinking mode): no disponible.

## Casos de uso

- Extraccion de informacion de documentos e imagenes: el ajuste sobre ET-Instruct-164K sugiere un uso orientado a tareas de extraccion; el modelo puede recibir una imagen o texto y devolver campos estructurados, adecuado para digitalizacion de formularios o recibos.
- Procesamiento de documentos escaneados en local: con cuantizaciones Q4_K_M (2,0 GB) o Q5_K_M (2,3 GB) mas el `mmproj` en Q8_0 (0,9 GB), el modelo cabe en GPUs de consumo y permite OCR semantico y extraccion sin enviar datos a la nube.
- Asistente conversacional en ingles para entornos con recursos limitados: su tamano de 3B y las cuantizaciones de 1,9-2,3 GB permiten desplegarlo en portatiles y equipos de gama media con llama.cpp u Ollama.
- Prototipado rapido de pipelines multimodales: la disponibilidad de todos los niveles de cuantizacion (de Q2_K a f16) permite ajustar el equilibrio calidad/velocidad segun el hardware durante el desarrollo.
- Clasificacion y descripcion de imagenes en lotes: el modelo puede generar descripciones o etiquetas de imagenes en pipelines por lotes ejecutados en CPU o GPU modesta, gracias a las cuantizaciones pequenas.
- Despliegue en el borde (edge) o en dispositivos sin GPU dedicada: la cuantizacion Q2_K (1,4 GB) y Q3_K_S (1,6 GB) permiten inferencia en CPU con llama.cpp, util para aplicaciones offline.
- Evaluacion comparativa de cuantizaciones: el repositorio sirve para medir el impacto de la cuantizacion en tareas multimodales concretas antes de elegir un nivel para produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5-2,5 GB con cuantizaciones Q2_K a Q4_K_M (1,4-2,0 GB) mas el suplemento `mmproj` Q8_0 (0,9 GB); en torno a 3-4,5 GB con Q6_K/Q8_0 mas `mmproj`; aproximadamente 6,5-8 GB con f16 mas `mmproj` f16.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM para cuantizaciones Q4/Q5; RTX 3060, RTX 4060, RTX 4090, A100 o H100 para las variantes de mayor precision.
- Cabe en GPU de consumo: si, en la mayoria de GPUs modernas con 4-8 GB de VRAM; las cuantizaciones Q2_K y Q3_K_S pueden ejecutarse incluso en CPU.
- Opciones de despliegue: llama.cpp, Ollama, llama-cpp-python y servidores compatibles con GGUF; el formato `mmproj` requiere un runtime con soporte multimodal de llama.cpp.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato GGUF |
|---|---|---|---|---|---|
| MUSEG-3B (esta ficha) | 3,09 B | No disponible | Si (mmproj) | Apache 2.0 | Si |
| Qwen2.5-VL-3B | 3 B (aprox.) | No disponible en esta ficha | Si | Apache 2.0 (segun modelo base) | Si (por terceros) |
| SmolVLM-2B | 2 B (aprox.) | No disponible en esta ficha | Si | Apache 2.0 (segun modelo base) | Si (por terceros) |
| Llama-3.2-3B | 3,2 B | 128K (segun model card oficial) | No | Llama 3.2 Community License | Si (por terceros) |

Nota: los datos de los modelos comparativos corresponden a conocimiento general de sus model cards publicas y no se han verificado en la informacion proporcionada para esta ficha; se incluyen solo como referencia orientativa de categoria.

## Limitaciones y advertencias

- Solo soporta ingles segun la model card; el rendimiento en castellano no esta garantizado.
- No se dispone de informacion sobre la longitud de contexto, lo que impide planificar aplicaciones con ventanas largas sin verificacion empirica.
- Riesgo de alucinacion inherente a los modelos de 3B, especialmente en tareas de extraccion donde puede inventar campos ausentes.
- Al ser una cuantizacion, las variantes de baja precision (Q2_K, Q3_K) degradan la calidad respecto al modelo base; mradermacher marca Q3_K_M como "lower quality" y recomienda Q4_K_S/Q4_K_M como equilibrio rapido.
- El uso multimodal requiere cargar el archivo `mmproj` correspondiente ademas del GGUF principal; sin el, el modelo solo procesa texto.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base Darwin-Project/MUSEG-3B y del dataset de ajuste.
- No hay informacion sobre sesgos, datos de entrenamiento ni evaluaciones de seguridad; en produccion conviene anadir filtros y validacion de salidas.
- El repositorio completo ocupa 30,1 GB; descargar solo el archivo de cuantizacion necesario.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/MUSEG-3B-GGUF
- Modelo base: https://huggingface.co/Darwin-Project/MUSEG-3B
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/MUSEG-3B-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#MUSEG-3B-GGUF
- Dataset de ajuste: https://huggingface.co/datasets/PolyU-ChenLab/ET-Instruct-164K
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
