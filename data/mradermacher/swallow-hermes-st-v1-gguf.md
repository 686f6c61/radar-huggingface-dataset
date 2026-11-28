# mradermacher/swallow-hermes-st-v1-GGUF

## Resumen

Swallow-hermes-st-v1-GGUF es la distribucion en formato GGUF del modelo napopoa32/swallow-hermes-st-v1, cuantizada por mradermacher. Se trata de un modelo de generacion de texto de aproximadamente 7.330 millones de parametros, derivado de la familia Swallow (modelos Mistral ajustados para japones por el Tokyo Tech Swallow project) y afinado con el dataset Hermes, lo que le aporta capacidades de seguimiento de instrucciones y de conversacion. El autor de la cuantizacion mantiene el mismo esquema de licencia Apache 2.0 del modelo original.

La relevancia de esta ficha radica en que el repositorio ofrece un conjunto completo de cuantizaciones estaticas en GGUF (desde Q2_K hasta f16), lo que permite ejecutar un modelo de 7B en hardware de consumo mediante llama.cpp o herramientas compatibles, algo especialmente util para el desarrollo e investigacion en japones. El modelo esta etiquetado unicamente con el idioma japones (ja), por lo que su uso principal se orienta a tareas en ese idioma.

No se dispone de informacion publicada en el repositorio sobre arquitectura detallada, longitud de contexto, composicion del dataset de entrenamiento ni resultados de benchmarks; esta ficha se limita a los datos verificables del repositorio y de la model card proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Mistral, segun tags del repositorio); detalles no disponibles |
| Parametros totales | 7.330.205.696 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | japones (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base original en safetensors |

## Arquitectura y entrenamiento

El repositorio es una cuantizacion estatica del modelo napopoa32/swallow-hermes-st-v1, que segun las etiquetas del repositorio pertenece a la familia Swallow (modelos Mistral ajustados para japones) y ha sido afinado con el dataset Hermes, orientado a seguimiento de instrucciones. No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se emplearon tecnicas de RLHF, DPO u otras fases de alineamiento.

La cuantizacion fue realizada por mradermacher con la version 2 del proceso de cuantizacion y con cuantizacion de tensores de salida (output_tensor_quantised: 1). La model card indica que las cuantizaciones ponderadas/imatrix no estan disponibles en el momento de la publicacion, por lo que solo se ofrecen cuantizaciones estaticas. El modelo base tiene 7.330.205.696 parametros segun los datos de safetensors.

## Capacidades

- Generacion de texto en japones, con capacidad de seguir instrucciones y mantener conversaciones multi-turno (herencia del ajuste con Hermes).
- Razonamiento y respuesta a preguntas en japones.
- Generacion de codigo y texto tecnico (capacidad inferida de la familia Mistral, no verificada con benchmarks en la informacion disponible).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al japones segun la etiqueta de idioma del repositorio.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Asistente conversacional en japones: el modelo puede gestionar dialogos multi-turno en japones gracias a su ajuste con Hermes, adecuado para prototipos de atencion al cliente o chatbots en ese idioma.
- Generacion de texto y redaccion en japones: redaccion de articulos, resumenes y correos en japones en entornos de escritorio con GPU de consumo gracias a las cuantizaciones Q4_K_M (4,5 GB).
- Desarrollo local y pruebas offline: al disponer de cuantizaciones desde Q2_K (2,9 GB), se puede ejecutar en portatiles sin GPU dedicada mediante llama.cpp, util para pruebas de integracion y evaluacion de prompts.
- Investigacion en NLP japones: fine-tuning o evaluacion de modelos Swallow en tareas japonesas, usando la version f16 (14,8 GB) como referencia de calidad maxima.
- Educacion y experimentacion: despliegue en entornos docentes con Ollama o llama.cpp para demostrar el funcionamiento de LLMs en japones sin infraestructura cloud.
- Generacion de codigo en japones: asistencia en tareas de programacion con comentarios y documentacion en japones, aunque sin garantias de rendimiento verificadas por benchmarks.
- Prototipado de aplicaciones de texto con TGI: el tag text-generation-inference permite desplegar el modelo en servidores compatibles para pruebas de latencia y throughput.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (segun cuantizacion): Q2_K ~2,9 GB; Q3_K_S ~3,3 GB; Q3_K_M ~3,7 GB; Q3_K_L ~4,0 GB; IQ4_XS ~4,1 GB; Q4_K_S ~4,3 GB; Q4_K_M ~4,5 GB; Q5_K_S ~5,2 GB; Q5_K_M ~5,3 GB; Q6_K ~6,1 GB; Q8_0 ~7,9 GB; f16 ~14,8 GB.
- GPU recomendadas: no disponible en la informacion proporcionada; por tamano, las cuantizaciones Q4_K_M y Q5_K_M caben en GPUs de consumo con 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 2070). La version f16 requiere GPUs de 16 GB o mas (RTX 4080, RTX 4090, A100).
- Cabe en GPU de consumo: si, en cuantizaciones Q2_K a Q6_K con GPUs de 6-8 GB; Q8_0 requiere ~8-10 GB.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con text-generation-inference (tag del repositorio); tambien es posible usarlo con transformers cargando el modelo base en safetensors.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| swallow-hermes-st-v1-GGUF | 7.330 M | no disponible | Apache 2.0 | GGUF en HF |
| Swallow base (Tokyo Tech) | no disponible en esta busqueda | no disponible | no disponible | HF |
| Mistral 7B (original) | 7.240 M | 32.768 tokens (referencia publica del modelo original, no verificada para este derivado) | Apache 2.0 | safetensors y GGUF |
| Hermes 2 Pro Mistral 7B | 7.240 M | no disponible | Apache 2.0 | safetensors y GGUF |

No se dispone de datos de rendimiento comparativo para este modelo en la informacion proporcionada; la comparativa se limita a parametros y licencia. Los datos de Mistral 7B y Hermes 2 Pro se incluyen como referencia de categoria, no como medicion de este modelo.

## Limitaciones y advertencias

- Modelo orientado exclusivamente al japones (etiqueta ja); su rendimiento en castellano u otros idiomas no esta garantizado.
- Riesgo de alucinacion inherente a los modelos de 7B, sin datos de evaluacion publicados en el repositorio.
- Sesgos conocidos: no disponible en la informacion proporcionada; se recomienda evaluar sesgos en el dominio de uso.
- Limitaciones de contexto: la longitud de contexto no esta documentada en el repositorio; no asumir ventanas largas sin verificacion.
- Licencia Apache 2.0 permite uso comercial, pero se debe conservar el aviso de licencia y atribucion; el modelo base napopoa32/swallow-hermes-st-v1 debe verificarse por separado.
- Las cuantizaciones Q2_K y Q3_K_M tienen calidad reducida segun la propia model card; para produccion se recomienda Q4_K_M o superior.
- No hay cuantizaciones imatrix/ponderadas disponibles, lo que puede suponer una perdida de calidad frente a alternativas con imatrix en tamanos equivalentes.
- El repositorio tiene muy pocas descargas (84) y likes (1), lo que indica poca validacion por parte de la comunidad; conviene realizar pruebas propias antes de desplegarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/swallow-hermes-st-v1-GGUF
- Modelo base: https://huggingface.co/napopoa32/swallow-hermes-st-v1
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#swallow-hermes-st-v1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
