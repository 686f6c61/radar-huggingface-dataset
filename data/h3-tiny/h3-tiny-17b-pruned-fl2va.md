# H3-Tiny/H3-Tiny-17B-Pruned-FL2VA

## Resumen

H3-Tiny-17B-Pruned-FL2VA es un checkpoint podado del transformer de MiniMax H3, un modelo generativo multimodal que produce video y audio de forma conjunta. Lo publica el proyecto independiente H3-Tiny, no afiliado a MiniMax, y deriva del transformer de 33.120 millones de parametros que MiniMax H3 emplea de forma compartida para las tareas T2VA (texto a video y audio) y FL2VA (primer y ultimo fotograma a video y audio). La poda reduce el modelo a 17.067.115.600 parametros, es decir, aproximadamente la mitad del original, sin ningun reentrenamiento posterior.

La receta combina dos operaciones: la reduccion del rango de las modulaciones AdaLN a rango 8 y la eliminacion de 8 de los 50 bloques del transformer, concretamente los indices [6, 7, 8, 9, 10, 11, 13, 15], seleccionados mediante una busqueda de profundidad calibrada sobre muestras de FL2VA y T2VA. El resultado se distribuye en formato diffusers (config.json mas safetensors fragmentados) y contiene unicamente el transformer: el codificador de texto, los VAE y los procesadores deben tomarse del checkpoint oficial de MiniMax H3.

Su relevancia es practica: reduce el peso del componente mas costoso del pipeline a la mitad, lo que abarata el despliegue de generacion conjunta de video y audio con control por primer y ultimo fotograma, una modalidad poco cubierta por los modelos abiertos. El repositorio ocupa 34,2 GB y la licencia es la MiniMax H3 Community License, con las restricciones territoriales y de uso aceptable que esta impone.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion para generacion conjunta de video y audio (derivado de MiniMax H3), con modulacion AdaLN de rango 8 y 42 de 50 bloques |
| Parametros totales | 17.067.115.600 (17,07B, solo transformer) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MiniMax H3 Community License (license_name: minimax-h3-community-license) |
| Formato de pesos | safetensors fragmentados en layout diffusers (config.json + shards) |
| Pasos de muestreo | 50 |
| Workflows soportados | FL2VA (primer y ultimo fotograma a video y audio), T2VA (texto a video y audio) |
| Fotogramas por generacion | 124 (segun el ejemplo de la model card) |
| Tamano del repositorio | 34,2 GB |
| Libreria | diffusers |

## Arquitectura y entrenamiento

El modelo es un transformer de difusion que genera video y audio de manera conjunta, heredado de MiniMax H3. La model card no detalla la composicion interna de los bloques ni el mecanismo de atencion, pero si confirma que MiniMax H3 emplea dos transformers con la misma arquitectura: uno para Ref2VA y otro compartido por T2VA y FL2VA. Este checkpoint deriva de este ultimo. La poda estructural actua en dos frentes: reduce el rango de las capas AdaLN a 8 y elimina 8 de los 50 bloques, elegidos mediante una busqueda de profundidad calibrada sobre muestras de FL2VA y T2VA. La misma receta y los mismos indices de bloque se aplican al transformer de Ref2VA en el checkpoint hermano.

No hay entrenamiento ni ajuste posterior a la poda: el checkpoint es el resultado directo de recortar el modelo original de 33,12B. La model card no aporta datos sobre el corpus de entrenamiento original de MiniMax H3 (numero de tokens, composicion, uso de RLHF o DPO), ni sobre innovaciones como decodificacion especulativa o atencion lineal. El pipeline de inferencia usa 50 pasos de muestreo y requiere, ademas de estos pesos, el codificador de texto, los VAE y los procesadores del checkpoint oficial de MiniMax H3 en formato diffusers.

## Capacidades

- Generacion de video a partir de texto (T2VA), con audio generado de forma conjunta en la misma pasada.
- Generacion de video y audio condicionada por primer y ultimo fotograma (FL2VA), lo que permite interpolar movimiento entre dos imagenes dadas.
- Generacion de audio sincronizado con el video, no como modulo separado.
- Control fino de la generacion mediante prompts estructurados con descripciones multimodales integradas (`integrated_multimodal_description`) y referencias temporales a fotogramas (`<Picture 1>`, `<Picture 2>`) con marcas de tiempo.
- Composicion por planos (shots) en el prompt, segun el formato de ejemplo de la model card.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso ni modo thinking: es un modelo generativo de medios, no un LLM conversacional.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Interpolacion de video entre dos fotogramas clave: dado un primer y un ultimo fotograma, el modelo genera la secuencia intermedia con audio sincronizado. Es util para animar storyboards o completar transiciones en postproduccion sin rodar el movimiento intermedio.
- Prototipado rapido de anuncios: a partir de un texto descriptivo (T2VA) se obtiene un clip de 124 fotogramas con banda sonora, suficiente para validar una idea creativa antes de producir con metodos convencionales.
- Generacion de video con audio para redes sociales: el pipeline conjunto evita el paso separado de sonorizacion y reduce el trabajo manual en piezas cortas.
- Creacion de material para videojuegos y entornos interactivos: transiciones entre estados visuales definidos por dos imagenes (inicio y fin de una animacion) con audio asociado.
- Investigacion sobre poda de modelos generativos multimodales: el checkpoint sirve como referencia reproducible para estudiar el impacto de eliminar bloques y reducir el rango AdaLN en calidad de video y audio, gracias a los scripts de poda publicados en el repositorio GitHub.
- Demostraciones y evalucacion de pipelines diffusers: al estar en layout diffusers y cargarse con `load_pipeline`, se integra en flujos de experimentacion que ya usan esa libreria, siempre que se disponga del checkpoint base de MiniMax H3.
- Generacion de clips con control de continuidad: el condicionamiento por primer y ultimo fotograma permite encadenar planos manteniendo coherencia visual entre el final de uno y el inicio del siguiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Como referencia de orden de magnitud, el transformer en precision de 16 bits ocupa unos 34 GB, por lo que la inferencia completa necesita GPUs con al menos 40-48 GB de memoria, o bien tecnicas de offloading (la model card menciona soporte de offloading en el README de GitHub).
- Ademas del transformer se necesitan el codificador de texto y los VAE del checkpoint oficial de MiniMax H3, que anaden requisitos de memoria no cuantificados en la informacion disponible.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, encajan A100 80 GB, H100 y GPUs profesionales de 48 GB o mas; no se confirma compatibilidad con RTX 4090 (24 GB) sin offloading.
- Cabe en GPU de consumo: no confirmado; con 24 GB o menos requeriria offloading y posiblemente cuantizacion, para la cual no se documentan formatos.
- Opciones de despliegue: pipeline propio `h3tiny.pipeline.load_pipeline` sobre diffusers, con backend CUDA; el README de GitHub menciona backends de atencion y offloading. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusion de video).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros (transformer) | Modalidad | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| H3-Tiny-17B-Pruned-FL2VA | 17,07B | Video + audio (T2VA, FL2VA) | no disponible | MiniMax H3 Community License | Hugging Face (diffusers) |
| MiniMax H3 FL2VA / T2VA (original) | 33,12B | Video + audio (T2VA, FL2VA) | no disponible | MiniMax H3 Community License | Checkpoint oficial de MiniMax |
| H3-Tiny-17B-Pruned-Ref2VA | 17,07B | Video + audio (Ref2VA) | no disponible | MiniMax H3 Community License | Hugging Face (diffusers) |

No se dispone de datos de rendimiento comparativo entre estos checkpoints en la informacion proporcionada.

## Limitaciones y advertencias

- La poda se aplica sin reentrenamiento, por lo que es esperable una perdida de calidad frente al modelo original de 33,12B; la magnitud no esta cuantificada en la informacion disponible.
- El checkpoint contiene solo el transformer: sin el codificador de texto, los VAE y los procesadores del MiniMax H3 oficial no es funcional.
- Licencia MiniMax H3 Community License: es un acuerdo comunitario con alcance territorial y politica de uso aceptable propios, no una licencia open source permisiva. Hay que revisar el texto completo antes de cualquier uso comercial.
- Los pesos son "Model Derivatives" de MiniMax H3 y quedan sujetos a las obligaciones que el acuerdo impone a los derivados.
- No se documentan sesgos conocidos, tasas de alucinacion ni limitaciones de idioma; al ser un modelo de generacion de medios, el riesgo principal es la produccion de contenido visual o sonoro no fiel al prompt.
- Proyecto independiente no afiliado ni respaldado por MiniMax; sin garantias de mantenimiento.
- Sin descargas ni likes en el momento de la consulta y creado en noviembre de 2026: ecosistema de usuario practicamente inexistente.
- No se documentan formatos de cuantizacion, lo que limita el despliegue en hardware modesto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/H3-Tiny/H3-Tiny-17B-Pruned-FL2VA
- Checkpoint hermano (Ref2VA): https://huggingface.co/H3-Tiny/H3-Tiny-17B-Pruned-Ref2VA
- Todos los checkpoints: https://huggingface.co/H3-Tiny
- Codigo: https://github.com/fuyi25/H3-Tiny
- Pagina del proyecto: https://fuyi25.github.io/H3-Tiny/
- Licencia: https://huggingface.co/H3-Tiny/H3-Tiny-17B-Pruned-FL2VA/blob/main/LICENSE-MiniMax-H3
