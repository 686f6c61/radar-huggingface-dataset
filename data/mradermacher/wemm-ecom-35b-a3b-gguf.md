# mradermacher/WeMM-Ecom-35B-A3B-GGUF

## Resumen

WeMM-Ecom-35B-A3B es un modelo multimodal de tipo mezcla de expertos (MoE) desarrollado por Tencent, orientado a conversaciones y tareas del dominio del comercio electronico. Este repositorio concreto, publicado por mradermacher, contiene las cuantizaciones estaticas en formato GGUF del modelo original, lo que permite su ejecucion en entornos con recursos limitados mediante llama.cpp y herramientas compatibles. El modelo base esta etiquetado con la arquitectura `qwen3_5_moe`, lo que sugiere una variante MoE de la familia Qwen 3.5, con un total de 34.660.610.688 parametros (aproximadamente 34,7 mil millones) y un nombre que indica 3 mil millones de parametros activos por token.

La relevancia de esta ficha radica en que el repositorio GGUF facilita el despliegue local de un modelo multimodal especializado en e-commerce, un nicho con demanda creciente para atencion al cliente, catalogacion de productos y generacion de contenido comercial. El modelo original se distribuye bajo licencia Apache 2.0, y las cuantizaciones mantienen esa misma licencia. El repositorio tiene un tamano de 238,6 GB, coherente con la suma de todas las variantes de cuantizacion incluidas.

La informacion disponible sobre el modelo base es limitada: la model card del repositorio GGUF es fundamentalmente una ficha de cuantizacion generada por mradermacher, sin detalles sobre datos de entrenamiento, benchmarks o contexto maximo. Por tanto, varios campos de esta ficha se marcan como "no disponible" de forma explicita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos), etiquetada como `qwen3_5_moe`; multimodal |
| Parametros totales | 34.660.610.688 (aprox. 34,7 B) |
| Parametros activos | 3 B (segun el sufijo A3B del nombre; no confirmado en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, ademas de mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | zh, en (segun los tags de la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de mezcla de expertos (MoE) con un total de aproximadamente 34,7 mil millones de parametros y, segun la convencion de nombres, unos 3 mil millones activos por token. La etiqueta `qwen3_5_moe` indica que deriva de la familia Qwen 3.5 en su variante MoE, y la presencia de ficheros `mmproj` (proyeccion multimodal) en el repositorio confirma que incorpora capacidades de vision, probablemente mediante un proyector que conecta un codificador visual con el modelo de lenguaje. No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La model card del repositorio GGUF no aporta detalles sobre innovaciones tecnicas especificas (atencion lineal, decodificacion especulativa, etc.). La informacion disponible se limita a los metadatos de cuantizacion: cuantizaciones estaticas generadas con un proceso de conversion `hf` y `quantize_version: 2`, con `output_tensor_quantised: 1`. Existe ademas un repositorio hermano con cuantizaciones ponderadas/imatrix (`mradermacher/WeMM-Ecom-35B-A3B-i1-GGUF`), que suele ofrecer mejor calidad por bit en modelos MoE.

## Capacidades

- Generacion de texto conversacional en chino e ingles, orientada al dominio del comercio electronico.
- Procesamiento multimodal: los ficheros `mmproj` indican soporte de entrada de imagenes junto con texto.
- Conversaciones multi-turno, segun el tag `conversational`.
- Razonamiento y generacion de contenido comercial (descripciones de producto, respuestas a clientes) por su especializacion en e-commerce.
- Capacidades multilingues limitadas a zh y en segun los metadatos; no se confirma soporte de otros idiomas.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking explicito, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Atencion al cliente automatizada en comercio electronico: el modelo puede gestionar conversaciones multi-turno en chino e ingles, respondiendo consultas sobre pedidos, devoluciones y disponibilidad de productos, aprovechando su especializacion en el dominio.
- Generacion de descripciones de producto: a partir de imagenes de articulos (gracias al modulo multimodal) y atributos estructurados, el modelo puede redactar fichas de producto en zh y en, reduciendo el trabajo manual de catalogacion.
- Clasificacion y etiquetado de imagenes de producto: el proyector multimodal permite analizar fotografias de articulos para asignar categorias, detectar atributos visuales o verificar la coherencia entre imagen y descripcion.
- Asistentes de compra conversacionales: integrado en una tienda online, puede recomendar productos, comparar alternativas y resolver dudas en tiempo real, con un coste de inferencia contenido gracias a sus 3 B de parametros activos.
- Moderacion y analisis de resenas: el modelo puede procesar resenas de clientes y detectar quejas recurrentes, sentimiento o incidencias de calidad, apoyandose en su conocimiento del dominio comercial.
- Generacion de respuestas para correo y mensajeria postventa: redaccion automatizada de respuestas a reclamaciones y solicitudes de soporte, con tono comercial y en dos idiomas.
- Despliegue local en entornos con recursos limitados: las cuantizaciones Q4_K_M (21,3 GB) o Q3_K_M (16,9 GB) permiten ejecutar el modelo en estaciones de trabajo con GPU de consumo alta o en servidores con VRAM moderada mediante llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion (pesos, sin contar cache KV):
  - Q2_K: 13,0 GB
  - Q3_K_S: 15,3 GB
  - Q3_K_M: 16,9 GB
  - Q3_K_L: 18,2 GB
  - IQ4_XS: 19,0 GB
  - Q4_K_S: 20,0 GB
  - Q4_K_M: 21,3 GB
  - Q5_K_S: 24,1 GB
  - Q5_K_M: 24,8 GB
  - Q6_K: 28,6 GB
  - Q8_0: 37,0 GB
  - Proyector multimodal: mmproj-Q8_0 (0,7 GB) o mmproj-f16 (1,0 GB)
- GPU recomendadas: para Q8_0, una A100 40 GB o H100; para Q4_K_M, una RTX 4090 (24 GB) o A6000 (48 GB); para Q3_K_M, una RTX 4090 o RTX 3090 (24 GB) con margen para cache KV.
- Cabe en GPU de consumo: si, en RTX 4090/3090 (24 GB) con cuantizaciones Q4_K_M o inferiores; en RTX 4080 (16 GB) solo con Q2_K o Q3_K_S y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF y con soporte de `mmproj` para la parte multimodal; el tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo OpenAI en plataformas de inferencia.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| WeMM-Ecom-35B-A3B (este) | 34,7 B totales / 3 B activos | no disponible | Apache 2.0 | GGUF, safetensors | Multimodal, especializado en e-commerce, zh/en |
| Qwen3.5 MoE (familia base) | segun variante | no disponible | Apache 2.0 (segun familia) | safetensors, GGUF | Modelo generalista del que deriva; sin especializacion comercial |
| Alternativas MoE multimodales de ~30-40 B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

No se dispone de informacion suficiente para establecer una comparativa cuantitativa con modelos alternativos concretos; los datos de rendimiento y contexto del modelo base no estan publicados en la informacion disponible.

## Limitaciones y advertencias

- La model card del repositorio GGUF no documenta sesgos conocidos, datos de entrenamiento ni evaluaciones de seguridad; se desconoce el comportamiento del modelo en dominios sensibles.
- Riesgo de alucinacion inherente a los modelos de lenguaje, especialmente en respuestas sobre disponibilidad de productos, precios o politicas comerciales; conviene validar contra fuentes de verdad.
- Idiomas soportados limitados a chino e ingles segun los metadatos; el rendimiento en castellano no esta documentado y probablemente sea inferior.
- La longitud de contexto no esta especificada, lo que impide planificar despliegues con documentos largos o historiales extensos.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_S) pueden degradar notablemente el rendimiento; la propia model card advierte que Q3_K_M es de "lower quality".
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar la licencia del modelo base (`tencent/WeMM-Ecom-35B-A3B`) por si impone condiciones adicionales.
- El repositorio tiene 238,6 GB; la descarga completa de todas las variantes requiere espacio en disco considerable. Conviene descargar solo la cuantizacion necesaria.
- No hay informacion sobre tool calling ni soporte de agentes, lo que limita su uso en pipelines automatizados complejos sin validacion previa.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/WeMM-Ecom-35B-A3B-GGUF
- Modelo base: https://huggingface.co/tencent/WeMM-Ecom-35B-A3B
- Licencia del modelo base: https://huggingface.co/tencent/WeMM-Ecom-35B-A3B/blob/main/LICENSE
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/WeMM-Ecom-35B-A3B-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#WeMM-Ecom-35B-A3B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH: https://www.nethype.de/
