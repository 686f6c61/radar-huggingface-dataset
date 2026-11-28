# mradermacher/WeMM-Ecom-2B-i1-GGUF

## Resumen

WeMM-Ecom-2B es un modelo multimodal de tipo vision-lenguaje desarrollado por Tencent, orientado a tareas de comercio electronico y conversacion. Esta ficha cubre la version cuantizada en formato GGUF publicada por mradermacher bajo el identificador `mradermacher/WeMM-Ecom-2B-i1-GGUF`, que parte del modelo base `tencent/WeMM-Ecom-2B`. El modelo combina comprension de imagenes con generacion de texto conversacional, lo que lo hace adecuado para escenarios donde hay que interpretar productos, fichas o capturas junto con instrucciones en lenguaje natural.

El modelo base cuenta con aproximadamente 1.880 millones de parametros (1.881.825.088 segun los pesos en safetensors) y esta etiquetado con la arquitectura `qwen3_5`, lo que sugiere que se apoya en la familia Qwen 3.5 como columna vertebral. Soporta los idiomas chino (zh) e ingles (en) y se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial sin restricciones adicionales mas alla de las de dicha licencia.

La relevancia de esta publicacion radica en que ofrece el modelo en multiples cuantizaciones GGUF con imatrix, desde IQ1_S (0,9 GB) hasta Q6_K (1,7 GB), lo que permite ejecutarlo en hardware de consumo y en entornos con recursos limitados. Es una opcion practica para prototipos de asistentes de compra, catalogacion de productos o atencion al cliente multimodal que necesiten desplegarse localmente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer multimodal vision-lenguaje, segun tags del autor) |
| Parametros totales | 1.881.825.088 (~1,88 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, Q2_K_S, Q2_K, Q3_K_S, IQ3_XS, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, Q4_0, IQ4_XS, Q4_K_S, IQ4_NL, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (cuantizaciones i1 con imatrix) |
| Idiomas soportados | zh, en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo base se etiqueta con la arquitectura `qwen3_5`, lo que indica que emplea un transformer de la familia Qwen 3.5 adaptado a modalidad multimodal (vision y texto). La publicacion de mradermacher es una conversion a GGUF con cuantizacion ponderada mediante imatrix, generada con `quantize_version: 2` y `output_tensor_quantised: 1`, y con `convert_type: hf`, es decir, partiendo de los pesos en formato Hugging Face del modelo original. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La innovacion principal de esta publicacion no reside en el entrenamiento, sino en el proceso de cuantizacion: se ofrecen variantes i1 (imatrix) que, segun el autor, suelen superar en calidad a cuantizaciones no-IQ de tamano similar. El repositorio incluye tambien el fichero imatrix (`WeMM-Ecom-2B.imatrix.gguf`, 0,1 GB) para que otros usuarios puedan generar sus propias cuantizaciones. Al tratarse de un modelo de vision, los ficheros mmproj (proyector multimodal) se alojan en el repositorio estatico `mradermacher/WeMM-Ecom-2B-GGUF`, no en este repositorio i1.

## Capacidades

- Generacion de texto conversacional en chino e ingles.
- Comprension de imagenes (modelo multimodal con proyector mmproj), orientada a contenido de comercio electronico.
- Razonamiento sobre productos, fichas y descripciones a partir de entradas visuales y textuales.
- Conversacion multi-turno en el dominio de e-commerce.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues limitadas a zh y en; no se documentan otros idiomas.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente de compra conversacional: el modelo puede interpretar una captura de un producto junto con la pregunta del usuario y responder en chino o ingles, aprovechando su naturaleza multimodal para resolver dudas sobre caracteristicas visibles del articulo.
- Catalogacion automatica de productos: a partir de imagenes de articulos, el modelo puede generar descripciones y etiquetas en texto, lo que agilita la creacion de fichas de catalogo en plataformas de e-commerce.
- Atencion al cliente de primer nivel: al ejecutarse en cuantizaciones de 1-2 GB, puede desplegarse en servidores modestos o incluso en estaciones de trabajo para gestionar consultas frecuentes sobre pedidos, devoluciones o caracteristicas de productos.
- Moderacion y revision de listados: el modelo puede analizar imagenes y texto de anuncios para detectar incoherencias entre la foto y la descripcion, apoyando flujos de control de calidad del marketplace.
- Prototipado local sin conexion: gracias a los formatos GGUF y a su reducido tamano, es viable probar asistentes multimodales en portatiles con GPU de consumo antes de escalar a un modelo mayor.
- Extraccion de atributos de imagenes de producto: en pipelines de enriquecimiento de datos, el modelo puede describir o clasificar imagenes para completar bases de datos de inventario.
- Demos educativas de modelos multimodales: su licencia Apache 2.0 y su tamano contenido lo hacen util para talleres y cursos donde se ensena a desplegar modelos vision-lenguaje con llama.cpp u Ollama.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1-2 GB para cuantizaciones de 4 bits (Q4_K_M ocupa 1,4 GB en disco); las variantes IQ1/IQ2 rondan 0,9-1,0 GB y Q6_K alcanza 1,7 GB. A esta cifra hay que sumar la memoria del proyector multimodal (mmproj) y la de la cache KV, cuyo tamano depende de la longitud de contexto configurada (no disponible).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones de 4 bits; RTX 3060, RTX 4060, RTX 4090 o superiores son mas que suficientes. En entornos de servidor, A100 o H100 no son necesarias por el reducido tamano del modelo.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU moderna con 4 GB o mas de VRAM; tambien puede ejecutarse en CPU con llama.cpp, aunque con mayor latencia.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base puede servirse con transformers y, potencialmente, con vLLM o TGI si se dispone de los pesos originales (no confirmado en la informacion).
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| WeMM-Ecom-2B (esta ficha, GGUF) | ~1,88 mil millones | no disponible | zh, en | apache-2.0 | GGUF |
| tencent/WeMM-Ecom-2B (base) | ~1,88 mil millones | no disponible | zh, en | apache-2.0 | safetensors |
| Alternativas multimodales de ~2B (p. ej., Qwen2-VL-2B, InternVL2-2B) | ~2 mil millones | no disponible en esta ficha | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos de rendimiento que permitan una comparacion cuantitativa con modelos de la misma categoria. La comparativa se limita a parametros, licencia y formato.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion proporcionada; al estar entrenado para e-commerce, puede reflejar sesgos de los datos de catalogo y conversacion utilizados.
- Riesgo de alucinacion: como todo modelo generativo, puede inventar caracteristicas de productos o detalles no presentes en la imagen o el texto de entrada; conviene validar sus salidas en produccion.
- Limitaciones de contexto o idioma: solo se declaran chino e ingles; el rendimiento en castellano no esta garantizado. La longitud de contexto no se especifica.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe conservarse el aviso de licencia y atribucion correspondiente; conviene revisar la licencia del modelo base en `tencent/WeMM-Ecom-2B`.
- Caveats para produccion: las cuantizaciones de muy baja precision (IQ1, IQ2) degradan la calidad; el autor recomienda Q4_K_M como opcion equilibrada. Los ficheros mmproj necesarios para la parte visual estan en el repositorio estatico, no en este, por lo que hay que descargarlos aparte. El repositorio tiene 26,1 GB por la suma de todas las variantes, pero cada fichero individual es pequeno.

## Enlaces

- Repositorio GGUF i1: https://huggingface.co/mradermacher/WeMM-Ecom-2B-i1-GGUF
- Repositorio GGUF estatico (incluye mmproj): https://huggingface.co/mradermacher/WeMM-Ecom-2B-GGUF
- Modelo base: https://huggingface.co/tencent/WeMM-Ecom-2B
- Licencia del modelo base: https://huggingface.co/tencent/WeMM-Ecom-2B/blob/main/LICENSE
- Pagina de descargas del autor: https://hf.tst.eu/model#WeMM-Ecom-2B-i1-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
