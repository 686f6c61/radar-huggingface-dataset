# mradermacher/Riazi-8B-CPT-SFT-GGUF

## Resumen

Riazi-8B-CPT-SFT-GGUF es la version cuantizada en formato GGUF de `azherali/Riazi-8B-CPT-SFT`, un modelo de 8.190.735.360 parametros (8,19 B). La cuantizacion la publica mradermacher, un autor conocido por generar de forma sistematica versiones GGUF de modelos abiertos para su uso con llama.cpp, Ollama y otros motores de inferencia local. El repositorio incluye 12 ficheros de cuantizacion, desde Q2_K (3,4 GB) hasta f16 (16,5 GB), con los formatos K-quant e IQ habituales.

El modelo base ha sido entrenado mediante la combinacion de continued pre-training (CPT) y fine-tuning supervisado (SFT), tal como indica su nombre. Los tags del repositorio incluyen `qwen3` y `unsloth`, lo que apunta a que la arquitectura subyacente pertenece a la familia Qwen3 y a que el entrenamiento se realizo con la libreria Unsloth. La model card del repositorio, sin embargo, no documenta la arquitectura con detalle, ni la longitud de contexto, ni la composicion del dataset de entrenamiento.

La relevancia practica de esta publicacion es doble. Por un lado, permite ejecutar en hardware de consumo un modelo de 8 B que de otro modo requeriria una GPU con suficiente VRAM para pesos en fp16 o bf16. Por otro lado, el modelo esta declarado unicamente para ingles (`language: en`), lo que limita su uso directo en aplicaciones en castellano sin un ajuste adicional. La licencia Apache-2.0 facilita su integracion en productos comerciales, siempre que se cumplan las condiciones de atribucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only; los tags apuntan a la familia Qwen3 (no detallado en la model card) |
| Parametros totales | 8.190.735.360 (8,19 B) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repositorio de cuantizaciones); el modelo base se distribuye en safetensors |

Datos adicionales: el repositorio ocupa 73,4 GB en total (suma de todos los ficheros GGUF). El modelo base es `azherali/Riazi-8B-CPT-SFT`. No se han publicado pesos ponderados ni cuantizaciones imatrix para este modelo; el autor indica que pueden solicitarse mediante una discusion de la comunidad.

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna mas alla de los tags `qwen3` y `transformers`, que situan el modelo en la familia Qwen3 de Alibaba. Los modelos Qwen3 de la gama 8 B son transformers decoder-only densos (no MoE), con normalizacion RMSNorm y atencion con RoPE. No obstante, la model card de esta cuantizacion no confirma explicitamente ninguno de estos detalles, por lo que deben tratarse como inferencias a partir de las etiquetas del repositorio y no como especificaciones verificadas.

Respecto al entrenamiento, el nombre `CPT-SFT` indica dos fases: continued pre-training sobre el modelo base y posterior fine-tuning supervisado. Se desconoce el volumen de tokens empleado, la composicion del dataset, si hubo etapas de alineacion adicionales (RLHF, DPO) y si se aplicaron tecnicas de optimizacion como decodificacion especulativa. El tag `unsloth` sugiere que el entrenamiento se ejecuto con esa libreria, orientada a reducir el consumo de memoria en el ajuste fino. No se documenta ninguna innovacion arquitectonica propia del autor del modelo base.

## Capacidades

- Generacion de texto conversacional: el repositorio esta etiquetado como `conversational` y `text-generation-inference`, lo que indica que el modelo ha sido ajustado para mantener dialogos multi-turno.
- Razonamiento y generacion de texto general: capacidad esperable en un modelo denso de 8 B entrenado con CPT y SFT, aunque no se aportan evaluaciones que la cuantifiquen.
- Generacion de codigo y matematicas: no documentada en la informacion disponible; no se puede confirmar ni descartar.
- Tool calling y function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: limitadas al ingles segun el campo `language: en` de la model card.
- Capacidades multimodales (vision, audio): no disponibles; el autor indica que no se ha incluido fichero mmproj (`skip_mmproj`), lo que confirma que no hay componente de vision.
- Modo de razonamiento explicito (thinking mode): no documentado.

## Casos de uso

- Prototipado local de asistentes conversacionales en ingles: con la cuantizacion Q4_K_M (5,1 GB) el modelo cabe en una GPU de consumo de 8 GB o mas, lo que permite iterar sobre prompts y flujos de dialogo sin coste de API.
- Despliegue en equipos sin conexion (air-gapped) para tareas de generacion de texto y resumen: el formato GGUF y la licencia Apache-2.0 permiten distribuir el modelo dentro de una organizacion sin dependencias de servicios externos.
- Aplicaciones de escritorio y asistentes integrados en el sistema operativo: Ollama, LM Studio y llama.cpp consumen directamente estos ficheros GGUF, con cuantizaciones Q4_K_S o Q4_K_M marcadas por el autor como "fast, recommended".
- Experimentacion academica sobre el efecto de la cuantizacion: el repositorio ofrece un rango completo de 12 cuantizaciones (de Q2_K a f16) que permite medir la degradacion de perplejidad y calidad entre niveles sobre el mismo modelo base.
- Fine-tuning posterior sobre dominio especifico en ingles: al estar la licencia en Apache-2.0 y disponer del modelo base en safetensors, es viable reajustar el modelo con LoRA sobre corpus propios (legal, medico, tecnico) antes de recuantizar.
- Servicio de inferencia de bajo coste en ingles: la cuantizacion Q8_0 (8,8 GB) o f16 (16,5 GB) puede servirse con TGI o vLLM en una GPU de 16-24 GB para cargas moderadas de generacion de texto.
- Generacion de datos sinteticos en ingles: el modelo puede emplearse para producir corpus de texto o pares instruccion-respuesta que alimenten pipelines de entrenamiento posteriores, siempre que se revise la calidad de la salida.

Advertencia transversal: al estar el modelo declarado solo para ingles, ninguno de estos casos de uso es directamente aplicable a produccion en castellano sin un ajuste o evaluacion previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card de la cuantizacion ni los resultados de busqueda web proporcionados incluyen cifras de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra evaluacion. Tampoco se aportan mediciones de perplejidad por tipo de cuantizacion, aunque el autor enlaza un grafico generico de comparacion de tipos de cuantizacion elaborado por ikawrakow.

## Requisitos de hardware

- VRAM estimada para los pesos, segun cuantizacion: Q2_K 3,4 GB; Q3_K_S 3,9 GB; Q3_K_M 4,2 GB; Q3_K_L 4,5 GB; IQ4_XS 4,7 GB; Q4_K_S 4,9 GB; Q4_K_M 5,1 GB; Q5_K_S 5,8 GB; Q5_K_M 6,0 GB; Q6_K 6,8 GB; Q8_0 8,8 GB; f16 16,5 GB. A estas cifras hay que sumar el espacio de la cache KV, que depende de la longitud de contexto efectiva (no documentada) y del motor empleado.
- GPU con suficiente VRAM: una RTX 3060 de 12 GB o una RTX 4060 Ti de 16 GB cubren comodamente las cuantizaciones Q4 y Q5 con contexto moderado; una RTX 4090 de 24 GB permite Q8_0 e incluso f16 con margen. Para f16 en servidor, una A100 40 GB o una H100 quedan sobradamente dimensionadas.
- Viabilidad en GPU de consumo: si. Las cuantizaciones Q4_K_S y Q4_K_M (4,9-5,1 GB) caben en GPUs de 8 GB, y las Q2_K y Q3 en equipos de 6 GB, con la perdida de calidad correspondiente.
- Memoria unificada: los equipos Apple Silicon con 16 GB o mas pueden ejecutar las cuantizaciones Q4 a Q8_0 mediante llama.cpp u Ollama; con 32 GB son viables Q8_0 y f16.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y, para los formatos compatibles, Text Generation Inference (el repositorio esta etiquetado con `text-generation-inference` y `endpoints_compatible`). vLLM solo soporta GGUF de forma parcial, por lo que para produccion conviene valorar el modelo base en safetensors.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo para ninguna de las cuantizaciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Riazi-8B-CPT-SFT (esta ficha) | 8,19 B | no disponible | Apache-2.0 | GGUF, safetensors (base) | Solo ingles; 12 cuantizaciones GGUF; sin benchmarks publicados |
| Qwen3-8B (familia de la que probablemente deriva) | 8,2 B aprox. | 32.768 tokens nativos, ampliables a 131.072 con YaRN segun la documentacion de Qwen3 | Apache-2.0 | safetensors, GGUF de terceros | Multilingue (mas de 100 idiomas), modo thinking/no-thinking, benchmarks publicos |
| Llama-3.1-8B | 8,03 B | 128.000 tokens | Llama 3.1 Community License | safetensors, GGUF de terceros | Multilingue; requiere cumplir la licencia de Meta para uso comercial |
| Mistral-7B-v0.3 | 7,25 B | 32.768 tokens | Apache-2.0 | safetensors, GGUF de terceros | Multilingue; sin benchmarks de la variante CPT-SFT |

La comparacion debe tomarse con cautela: la fila de Riazi-8B-CPT-SFT refleja unicamente los datos de la model card, y las cifras de contexto y capacidades de los otros tres modelos proceden de la documentacion publica de sus respectivos autores, no de una evaluacion conjunta. No existe ningun benchmark que permita afirmar si el ajuste CPT-SFT de Riazi mejora o degrada el rendimiento del modelo base.

## Limitaciones y advertencias

- Idioma: el modelo esta declarado exclusivamente para ingles. No hay evidencia de competencia en castellano ni en otros idiomas, por lo que su uso en produccion multilingue exigiria evaluacion previa.
- Ausencia total de benchmarks: no hay ninguna cifra publicada de calidad, razonamiento, codigo o matemáticas. Cualquier decision de adopcion se basaria unicamente en pruebas propias.
- Documentacion incompleta: se desconoce la longitud de contexto, la composicion del dataset de entrenamiento, el numero de tokens de CPT y si se aplicaron etapas de alineacion (RLHF, DPO).
- Riesgo de alucinacion: inherente a cualquier modelo de 8 B sin evaluacion publicada; no hay datos que permitan acotar su tasa de error en tareas factuales.
- Sesgos: no se ha publicado ninguna evaluacion de sesgo, toxicidad o robustez. Al desconocerse la composicion del corpus de continued pre-training, no se puede estimar el sesgo introducido en esa fase.
- Cuantizaciones de baja precision: el propio autor marca Q3_K_M como "lower quality" y desaconseja f16 por excesiva ("overkill"). Las cuantizaciones por debajo de Q4 incrementan la degradacion de la calidad.
- Licencia: Apache-2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se indique los cambios. Se debe verificar que el modelo base (`azherali/Riazi-8B-CPT-SFT`) mantenga la misma licencia y que no imponga condiciones adicionales derivadas de su propio modelo base.
- Trazabilidad: al ser una cuantizacion de terceros, cualquier incidencia de calidad puede deberse al proceso de cuantizacion y no al modelo base; conviene validar contra el modelo original en safetensors.
- Popularidad nula: 0 descargas y 0 "likes" en el momento de la consulta, sin discusiones ni validacion por parte de la comunidad.

## Enlaces

- Repositorio de la cuantizacion: https://huggingface.co/mradermacher/Riazi-8B-CPT-SFT-GGUF
- Modelo base: https://huggingface.co/azherali/Riazi-8B-CPT-SFT
- Pagina resumen del autor para este modelo: https://hf.tst.eu/model#Riazi-8B-CPT-SFT-GGUF
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- README de referencia de TheBloke sobre uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de tipos de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del autor de las cuantizaciones: https://www.nethype.de/

Nota sobre la busqueda web: los resultados recuperados no guardan relacion con el modelo (corresponden a cuestionarios de la pagina de inicio de Bing y a hilos de Reddit sobre Microsoft Rewards), por lo que no aportan informacion adicional utilizable. No se han localizado papers, blogs tecnicos ni demos asociados a este modelo.
