# mradermacher/Latxa-Qwen3-VL-4B-Instruct-GGUF

## Resumen

Latxa-Qwen3-VL-4B-Instruct-GGUF es la distribucion en formato GGUF del modelo HiTZ/Latxa-Qwen3-VL-4B-Instruct, publicada por el usuario mradermacher. Se trata de una cuantizacion estatica del modelo original desarrollado por HiTZ (Centro de Tecnologia del Lenguaje de la Universidad del Pais Vasco), orientado a las lenguas ibericas y construido sobre la base de Qwen3-VL-4B-Instruct. El modelo combina capacidades de vision y lenguaje con un enfasis explicito en euskera, gallego, catalan, castellano e ingles.

El modelo resuelve el problema de la escasez de modelos vision-lenguaje con cobertura real de lenguas minoritarias del Estado, ofreciendo una alternativa open source con licencia Apache 2.0 y un tamano (4.022 millones de parametros) que permite despliegue en hardware de consumo. La publicacion en GGUF facilita su uso en llama.cpp, Ollama y otros runners compatibles, lo que reduce la barrera de entrada para desarrolladores que quieren integrar el modelo en entornos locales o de borde.

La relevancia actual del modelo radica en la combinacion de tres factores: licencia permisiva, soporte multimodal y cobertura de cinco idiomas con atencion especial a lenguas de bajos recursos. El repositorio GGUF ocupa 37,7 GB en total e incluye 12 cuantizaciones distintas mas dos ficheros mmproj para el componente visual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen3-VL), vision-lenguaje |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | eu, gl, ca, es, en |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas) y safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo base es HiTZ/Latxa-Qwen3-VL-4B-Instruct, una adaptacion de Qwen3-VL-4B-Instruct a las lenguas ibericas. La arquitectura subyacente es un transformer multimodal con un codificador visual y un decodificador de lenguaje, siguiendo el diseno de la familia Qwen3-VL. El modelo original fue ajustado por HiTZ utilizando el corpus HiTZ/latxa-corpus-v1.1, un conjunto de datos multilingue orientado a euskera, gallego, catalan, castellano e ingles.

La informacion disponible no detalla el numero exacto de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO. Tampoco se especifican innovaciones tecnicas adicionales mas alla de las inherentes a la familia Qwen3-VL. Esta publicacion concreta es una cuantizacion estatica realizada por mradermacher; el autor indica que no hay cuantizaciones ponderadas/imatrix disponibles en el momento de la publicacion, aunque podrian solicitarse mediante una discusion en la comunidad.

## Capacidades

- Generacion de texto conversacional en euskera, gallego, catalan, castellano e ingles.
- Comprension de imagenes y razonamiento vision-lenguaje, gracias al componente multimodal (ficheros mmproj incluidos).
- Razonamiento y respuesta a instrucciones en formato chat (sufijo Instruct).
- Capacidades multilingues con enfasis en lenguas ibericas de bajos recursos.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Capacidades especiales (modo thinking, audio): no disponible.

## Casos de uso

- Atencion al cliente en euskera, gallego o catalan: el modelo puede gestionar conversaciones multi-turno en lenguas minoritarias donde la mayoria de modelos comerciales rinden de forma deficiente, con la ventaja de un despliegue local que evita enviar datos a terceros.
- Descripcion y analisis de imagenes en catalan o euskera: integracion del componente mmproj permite generar descripciones, responder preguntas sobre imagenes o extraer texto de documentos escaneados en estas lenguas.
- Digitalizacion de patrimonio documental: uso del modo vision para transcribir y describir documentos historicos o administrativos en lenguas ibericas, con cuantizaciones Q4_K_M o Q5_K_M que caben en GPUs de consumo.
- Asistentes educativos locales: despliegue en centros escolares o administraciones con requisitos de soberania del dato, usando llama.cpp u Ollama sobre hardware modesto (a partir de 2,5 GB de VRAM en Q4_K_S).
- Prototipado rapido de aplicaciones multimodales: la disponibilidad de 12 cuantizaciones permite ajustar el equilibrio calidad/velocidad segun el hardware, desde entornos de borde (Q2_K, 1,8 GB) hasta servidores (Q8_0, 4,4 GB).
- Investigacion en PLN de lenguas ibericas: el modelo sirve como linea base reproducible y con licencia Apache 2.0 para experimentos academicos sobre vision-lenguaje en euskera, gallego y catalan.
- Generacion de contenido multilingue en entornos editoriales: redaccion y traduccion asistida entre las cinco lenguas soportadas, con la posibilidad de ejecucion offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto): Q2_K ~1,8 GB; Q3_K_S ~2,0 GB; Q4_K_S ~2,5 GB; Q4_K_M ~2,6 GB; Q5_K_M ~3,0 GB; Q6_K ~3,4 GB; Q8_0 ~4,4 GB; f16 ~8,2 GB. Anadir 0,6-0,9 GB adicionales si se usa el componente visual (mmproj).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, A100, H100. Cualquier GPU con 6 GB o mas puede ejecutar cuantizaciones Q4 en adelante con margen para contexto.
- Cabe en GPU de consumo: si. Una GTX 1650 de 4 GB puede ejecutar Q3_K_M; una RTX 3060 de 12 GB ejecuta Q8_0 con contexto amplio.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runner compatible con GGUF. El modelo base en safetensors puede servirse con vLLM o TGI, pero las cuantizaciones GGUF estan pensadas para llama.cpp y derivados.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Latxa-Qwen3-VL-4B-Instruct (este) | 4,02 B | no disponible | eu, gl, ca, es, en | Apache 2.0 | GGUF, safetensors |
| Qwen3-VL-4B-Instruct (base upstream) | ~4 B | no disponible | multilingue amplio | no disponible en esta ficha | safetensors |
| Llama 3.2 3B Instruct | ~3 B | no disponible | multilingue (8 oficiales) | Llama 3.2 Community License | GGUF, safetensors |
| Gemma 3 4B | ~4 B | no disponible | multilingue amplio | Gemma Terms of Use | GGUF, safetensors |

La ventaja diferencial de Latxa frente a Qwen3-VL, Llama 3.2 o Gemma 3 es el ajuste especifico sobre corpus ibericos (HiTZ/latxa-corpus-v1.1) y la cobertura declarada de euskera, gallego y catalan, lenguas que los modelos generalistas suelen tratar de forma marginal. Como contrapartida, el ecosistema de herramientas y la documentacion son mas limitados, y no se han publicado benchmarks comparativos en la informacion disponible.

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks, por lo que el rendimiento real frente a alternativas no puede verificarse con datos.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan mitigaciones especificas.
- Sesgos conocidos: no documentados en la informacion disponible; al estar ajustado sobre un corpus iberico concreto, puede presentar sesgos de dominio y de registro.
- La longitud de contexto no esta especificada en la ficha; conviene verificar la del modelo base antes de disenar aplicaciones con contextos largos.
- Las cuantizaciones Q2_K y Q3_K_S degradan la calidad de forma notable; para produccion se recomienda Q4_K_M o superior.
- Las cuantizaciones ponderadas/imatrix no estan disponibles en el momento de la publicacion; el autor sugiere solicitarlas mediante discusion en la comunidad.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base HiTZ/Latxa-Qwen3-VL-4B-Instruct y del upstream Qwen3-VL por si anaden restricciones adicionales.
- El modelo esta pensado para lenguas ibericas e ingles; su rendimiento en otras lenguas no esta garantizado.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Latxa-Qwen3-VL-4B-Instruct-GGUF
- Modelo base: https://huggingface.co/HiTZ/Latxa-Qwen3-VL-4B-Instruct
- Pagina de resumen del autor: https://hf.tst.eu/model#Latxa-Qwen3-VL-4B-Instruct-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/HiTZ/latxa-corpus-v1.1
- Guia de uso de GGUF (referencia TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de perplejidad por cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
