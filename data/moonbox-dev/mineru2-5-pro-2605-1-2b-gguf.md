# moonbox-dev/MinerU2.5-Pro-2605-1.2B-GGUF

## Resumen

MinerU2.5-Pro-2605-1.2B-GGUF es la distribucion en formato GGUF del modelo MinerU2.5-Pro, un modelo vision-lenguaje especializado en parsing de documentos y reconocimiento optico de caracteres (OCR) desarrollado por OpenDataLab. Esta version concreta la publica moonbox-dev y esta pensada para ejecucion local mediante llama.cpp en Metal, CUDA, Vulkan y CPU. El modelo resuelve el problema de extraer texto estructurado de paginas de documento (bloques de texto, tablas, formulas) con un enfoque de dos etapas: deteccion de layout y reconocimiento por bloque.

La arquitectura combina un encoder visual Qwen2-VL con un decodificador Qwen2 de aproximadamente 0,5B parametros, empaquetados como un modelo image-text-to-text. El repositorio incluye un archivo `mmproj` con el encoder visual en F16 compartido por todas las precisiones, y varios archivos de pesos del decodificador en F16, BF16, Q8_0, Q6_K, Q5_K_M y Q4_K_M, con tamanos que van de 397,8 MB a 994,2 MB. La licencia es Apache 2.0, lo que facilita su integracion en productos comerciales.

Su relevancia actual radica en que ofrece OCR de documentos de alta fidelidad en hardware de consumo: segun la model card, todas las cuantizaciones mantienen un CER del 0,0 % sobre el conjunto de evaluacion del autor y procesan una pagina en torno a 0,2-0,27 s en una RTX 3080 Laptop. El modelo base reporta 494.032.768 parametros reales en safetensors, aunque el nombre comercial haga referencia a 1.2B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje: encoder visual Qwen2-VL + decodificador Qwen2 (transformer) |
| Parametros totales | 494.032.768 (safetensors del modelo base); el nombre comercial indica 1.2B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | no disponible (la evaluacion cubre ingles y chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (decodificador) + GGUF `mmproj` (encoder visual en F16) |

## Arquitectura y entrenamiento

El modelo es un sistema multimodal image-text-to-text. El componente de vision es el encoder de Qwen2-VL junto con su merger, almacenado en el archivo `mmproj-mineru2-5-pro-F16.gguf` (1,33 GB) y compartido por todas las precisiones. El decodificador es un Qwen2 de aproximadamente 0,5B parametros que genera la salida textual a partir de las representaciones visuales. La conversion a GGUF, realizada con llama.cpp `b12621`, modifica la disposicion de dos tipos de tensor sin alterar los valores: los pesos `qkv` fusionados del vision tower se separan en q, k y v, y la convolucion 3D de patch-embedding se almacena como dos kernels 2D, uno por frame. Segun la model card, los 681 tensores del checkpoint original se localizaron con los mismos valores en los archivos GGUF.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en la informacion proporcionada. El modelo base se distribuye con un informe tecnico en arXiv (2604.04771) titulado "MinerU2.5-Pro: Pushing the Limits of Data-Centric Document Parsing at Scale", que sugiere un enfasis en datos de documentos a gran escala, pero los detalles no estan disponibles en esta ficha. La cuantizacion se realizo con `llama-quantize` usando sus mezclas estandar y sin importance matrix.

## Capacidades

- Reconocimiento de texto en imagenes de documentos (OCR) con salida de texto por bloque.
- Parsing de documentos estructurados mediante el pipeline de MinerU (`mineru_vl_utils`): deteccion de layout seguida de una peticion por bloque.
- Procesamiento de paginas en ingles y chino, segun el conjunto de evaluacion del autor.
- Entrada multimodal imagen-texto a traves de la API de chat de llama.cpp (`/v1/chat/completions` con `image_url`).
- Ejecucion local en Metal, CUDA, Vulkan y CPU mediante llama.cpp.
- No se documentan en la informacion disponible capacidades de tool calling, agentes, razonamiento multi-paso, audio ni modo thinking.

## Casos de uso

- Digitalizacion de archivos escaneados: el modelo procesa cada pagina como imagen y devuelve el texto reconocido por bloque, lo que permite convertir fondos documentales en texto indexable con un CER del 0,0 % en la evaluacion del autor.
- Extraccion de texto en pipelines de ingestion de documentos: integrado en `mineru_vl_utils`, se encadena deteccion de layout y reconocimiento por bloque para alimentar bases de datos vectoriales o sistemas RAG.
- Procesamiento OCR en el dispositivo: al caber en cuantizaciones de 397,8 MB (Q4_K_M) mas el encoder de 1,33 GB, puede desplegarse en portatiles con GPU de consumo o incluso en CPU, sin enviar documentos a servicios externos.
- Facturacion y gestion documental: la extraccion de bloques de texto de facturas y formularios escaneados permite alimentar sistemas de contabilidad con datos estructurados.
- Digitalizacion bilingue ingles-chino: el conjunto de evaluacion cubre ambos idiomas, lo que lo hace adecuado para organizaciones con documentacion en esas lenguas.
- Servicio OCR de baja latencia: con alrededor de 0,2-0,27 s por pagina en una RTX 3080 Laptop y `llama-server`, puede atender peticiones concurrentes de reconocimiento en un servicio interno.

## Benchmarks y rendimiento

Los datos disponibles proceden de la evaluacion propia de moonbox-dev sobre 12 paginas sinteticas (6 en ingles y 6 en chino), con el prompt de bloque de texto de MinerU y decodificacion greedy, ejecutada en CUDA sobre una RTX 3080 Laptop. La metrica es la tasa de error de caracteres (CER) por idioma, ignorando espacios.

| Precision | Tamano | CER (EN / ZH) | Mismo texto que BF16 | Tiempo por pagina (CUDA) |
|---|---|---|---|---|
| F16 | 994,2 MB | 0,0 % / 0,0 % | 6 + 6 de 12 paginas | 0,26 s |
| BF16 | 994,2 MB | 0,0 % / 0,0 % | referencia | 0,27 s |
| Q8_0 | 531,1 MB | 0,0 % / 0,0 % | 6 + 6 de 12 paginas | 0,26 s |
| Q6_K | 505,7 MB | 0,0 % / 0,0 % | 6 + 6 de 12 paginas | 0,23 s |
| Q5_K_M | 420,1 MB | 0,0 % / 0,0 % | 6 + 6 de 12 paginas | 0,24 s |
| Q4_K_M | 397,8 MB | 0,0 % / 0,0 % | 6 + 6 de 12 paginas | 0,20 s |

No se han publicado en la informacion disponible resultados de benchmarks estandar como MMLU, HumanEval o GSM8K, que ademas no aplican a un modelo especializado en OCR.

## Requisitos de hardware

- VRAM estimada: el decodificador ocupa entre 397,8 MB (Q4_K_M) y 994,2 MB (F16/BF16); el encoder `mmproj` en F16 anade 1,33 GB. En total, entre aproximadamente 1,7 GB y 2,3 GB de pesos, mas el overhead de contexto y KV cache.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para las cuantizaciones bajas; el autor verifico el rendimiento en una RTX 3080 Laptop.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y equivalentes; tambien puede ejecutarse en CPU y en Apple Silicon via Metal.
- Opciones de despliegue: llama.cpp (`llama-mtmd-cli` y `llama-server`) en version `b12621` o superior, con soporte Metal, CUDA, Vulkan y CPU. No se documentan otras opciones como vLLM, TGI u Ollama en la informacion disponible.
- Latencia y throughput: aproximadamente 0,20-0,27 s por pagina en CUDA (RTX 3080 Laptop) con decodificacion greedy, segun la model card.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de rendimiento de modelos comparables (por ejemplo, otras variantes de MinerU u otros modelos OCR vision-lenguaje) que permitan una comparacion cuantitativa fiable. A continuacion se comparan solo los datos estructurales conocidos del modelo base frente a su version GGUF.

| Modelo | Parametros | Formato | Licencia | Contexto | Uso previsto |
|---|---|---|---|---|---|
| MinerU2.5-Pro-2605-1.2B (base) | 494.032.768 (safetensors) | safetensors | Apache 2.0 | no disponible | OCR y parsing de documentos |
| MinerU2.5-Pro-2605-1.2B-GGUF (esta ficha) | 494.032.768 (decodificador) + encoder | GGUF | Apache 2.0 | no disponible | OCR y parsing de documentos en llama.cpp |

## Limitaciones y advertencias

- La evaluacion del autor se limita a 12 paginas sinteticas en ingles y chino; el rendimiento en documentos reales, otros idiomas o layouts complejos no esta cuantificado.
- No se dispone de informacion sobre sesgos del modelo, riesgo de alucinacion en la transcripcion ni comportamiento fuera de los prompts documentados.
- Los idiomas soportados no estan declarados oficialmente; la evidencia disponible solo cubre ingles y chino.
- La longitud de contexto no esta disponible, lo que limita la planificacion de cargas con paginas o bloques extensos.
- El modelo esta especializado en OCR y parsing de documentos; no debe esperarse de el razonamiento general, codigo o conversacion abierta.
- La licencia Apache 2.0 permite uso comercial, pero los archivos son un derivado del modelo original y heredan sus terminos; conviene revisar la licencia del modelo base.
- Requiere llama.cpp `b12621` o superior y el archivo `mmproj` junto con el decodificador; usar solo uno de los dos archivos no funciona.

## Enlaces

- Repositorio GGUF: https://huggingface.co/moonbox-dev/MinerU2.5-Pro-2605-1.2B-GGUF
- Modelo base: https://huggingface.co/opendatalab/MinerU2.5-Pro-2605-1.2B
- Informe tecnico: https://arxiv.org/abs/2604.04771
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Logo del proyecto: https://hotelll.github.io/MinerU2.5-Pro/MinerU25-Pro-LOGO.png
