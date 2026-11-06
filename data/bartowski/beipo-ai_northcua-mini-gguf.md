# bartowski/beipo-ai_NorthCUA-Mini-GGUF

## Resumen

NorthCUA-Mini es un modelo multimodal de tipo image-text-to-text desarrollado por beipo-ai, orientado a tareas de computer use (interaccion con interfaces graficas mediante agentes). La ficha que nos ocupa corresponde a la version cuantizada en GGUF publicada por bartowski, que permite ejecutar el modelo con llama.cpp en hardware de consumo. El checkpoint original cuenta con 34.660.610.688 parametros (aproximadamente 35B) y la etiqueta `qwen3_5_moe` sugiere una arquitectura Mixture of Experts derivada de la familia Qwen 3.5, aunque no se detalla el numero de parametros activos por token.

El modelo acepta entradas de texto e imagen (esta ultima requiere el fichero `mmproj` adicional) y emplea un formato de prompt compatible con ChatML que incluye un bloque `<think>` para razonamiento explicito y un formato XML especifico para tool calling. Su licencia Apache 2.0 facilita el uso comercial y la integracion en productos propios sin restricciones adicionales.

Su relevancia actual radica en la combinacion de tres factores: capacidades multimodales, soporte nativo de agentes con function calling y una amplia gama de cuantizaciones GGUF (desde bf16 de 69,38 GB hasta IQ4_XS de 19,89 GB) que permiten desplegarlo desde estaciones de trabajo con GPU unica hasta equipos con 24 GB de VRAM. No obstante, la informacion publica sobre el modelo base es muy limitada: no se han publicado idiomas soportados, benchmarks ni detalles del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Mixture of Experts (etiqueta `qwen3_5_moe`), multimodal image-text-to-text |
| Parametros totales | 34.660.610.688 (aproximadamente 35B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, Q8_0, Q6_K_L, Q6_K, Q6_K_S, Q5_K_M, Q5_K_S, Q4_K_L, Q4_K_M, IQ4_NL, Q4_1, Q4_K_S, Q4_0, IQ4_XS (imatrix) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones de llama.cpp b11969); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de la etiqueta `qwen3_5_moe`, que apunta a un transformer con capas de mezcla de expertos y a una base derivada de la familia Qwen 3.5. El modelo es multimodal: procesa texto e imagenes, y para la parte visual requiere un fichero `mmproj` separado en el ecosistema GGUF. El prompt utiliza el formato ChatML con tokens `<|im_start|>` y `<|im_end|>`, e incluye un bloque `<think>` que activa un modo de razonamiento antes de la respuesta.

No se han publicado datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o ajuste por preferencias. Tampoco se documenta el mecanismo de atencion ni innovaciones como decodificacion especulativa (la model card indica explicitamente "Speculative decoding: no"). Las cuantizaciones de bartowski emplean matrices de importancia (imatrix) para preservar la calidad de los pesos mas sensibles en los formatos de baja precision.

## Capacidades

- Generacion de texto conversacional multi-turno con formato ChatML.
- Razonamiento explicito mediante el bloque `<think>`, que separa la cadena de pensamiento de la respuesta final.
- Procesamiento de imagenes como entrada (image-text-to-text), util para interpretar capturas de pantalla e interfaces.
- Tool calling / function calling con un formato XML estructurado (`<tool_call>`, `<function=...>`, `<parameter=...>`), incluyendo la posibilidad de razonar en lenguaje natural antes de la llamada.
- Orientacion a computer use: la combinacion de vision, razonamiento y function calling permite construir agentes que operan sobre interfaces graficas.
- Soporte de agentes y razonamiento multi-paso, apoyado en el modo de pensamiento y en las llamadas a herramientas.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- No se documentan capacidades de audio ni de vision generativa (solo comprension de imagen).

## Casos de uso

- Automatizacion de tareas de escritorio: el modelo puede analizar capturas de pantalla y emitir llamadas a funciones que simulen clics, teclas o navegacion, gracias a su combinacion de vision y tool calling en formato XML.
- Agentes de navegacion web: con el bloque `<think>` el modelo razona sobre el estado de la pagina antes de invocar herramientas de scraping o interaccion, lo que facilita flujos multi-paso verificables.
- Asistentes de soporte tecnico con contexto visual: el usuario envia una captura de error y el modelo interpreta la imagen y propone pasos concretos, pudiendo invocar funciones de diagnostico.
- Pruebas de regresion de interfaces (QA automatizado): un agente basado en el modelo recorre la UI, compara estados visuales y reporta discrepancias mediante llamadas a funciones de logging.
- Despliegue en local para prototipado de agentes: las cuantizaciones Q4_K_M (22,32 GB) e IQ4_XS (19,89 GB) permiten ejecutar el modelo en una GPU de 24 GB, lo que habilita ciclos de desarrollo sin coste de API.
- Extraccion estructurada de informacion desde documentos escaneados o capturas: el modelo lee la imagen y devuelve datos en el formato definido por las herramientas declaradas.
- Enrutamiento de tareas en pipelines internos: con function calling se puede usar como planificador que decide que herramienta invocar segun la entrada del usuario y el contenido visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion (tamano del fichero, sin contar overhead de contexto ni el fichero `mmproj`):
  - bf16: 69,38 GB (dividido en varios ficheros).
  - Q8_0: 36,91 GB.
  - Q6_K: 30,74 GB; Q6_K_L: 32,30 GB; Q6_K_S: 29,37 GB.
  - Q5_K_M: 26,98 GB; Q5_K_S: 25,14 GB.
  - Q4_K_L: 24,11 GB; Q4_K_M: 22,32 GB; IQ4_NL: 22,32 GB; Q4_1: 21,97 GB; Q4_K_S: 20,95 GB; Q4_0: 19,94 GB; IQ4_XS: 19,89 GB.
- GPU recomendadas: para bf16 y Q8_0 se requiere una A100 80 GB o H100 80 GB (o varias GPUs). Para Q6 y Q5, una A100 40 GB o dos GPU de 24 GB. Para Q4_K_M e inferiores, una RTX 4090 o RTX 3090 de 24 GB es suficiente.
- Cabe en GPU de consumo: si, con cuantizaciones Q4_K_M (22,32 GB) o IQ4_XS (19,89 GB) en tarjetas de 24 GB. En tarjetas de 16 GB no cabe el modelo completo y requeriria offloading parcial a CPU/RAM.
- Opciones de despliegue: llama.cpp (version b11969 o superior), Ollama y cualquier frontend compatible con GGUF. El tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo OpenAI a traves de servidores de inferencia. Para el modelo base en safetensors se podria usar vLLM o TGI, aunque no se confirma soporte explicito.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Tool calling | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| NorthCUA-Mini (GGUF de bartowski) | ~35B (MoE) | no disponible | Si (imagen + texto) | Si (formato XML) | Apache 2.0 | GGUF en Hugging Face |
| Qwen2.5-VL (7B/72B) | 7B / 72B | 128K (segun version) | Si | Si | Apache 2.0 (7B) / Qwen license (72B) | safetensors, GGUF de terceros |
| InternVL2.5 | 8B a 78B | variable por tamano | Si | Parcial | MIT / Apache 2.0 segun version | safetensors, GGUF de terceros |
| UI-TARS (ByteDance) | 7B / 72B | no disponible | Si | Orientado a computer use | Apache 2.0 (7B) | safetensors |

La comparativa se limita a caracteristicas publicas; no hay datos de rendimiento de NorthCUA-Mini que permitan una comparacion cuantitativa con estos modelos. La ventaja principal de NorthCUA-Mini frente a alternativas es la disponibilidad inmediata de cuantizaciones GGUF con imatrix para todas las precisiones, mientras que su desventaja es la ausencia de documentacion sobre contexto, idiomas y evaluaciones.

## Limitaciones y advertencias

- No se han publicado datos sobre sesgos del modelo; al ser un modelo orientado a computer use entrenado presumiblemente con capturas de interfaces, puede presentar sesgos hacia layouts y convenciones de determinadas plataformas.
- Riesgo de alucinacion en la interpretacion de imagenes y en la generacion de llamadas a funciones: el formato XML de tool calling debe validarse en el servidor antes de ejecutar acciones reales.
- Longitud de contexto no documentada: no se puede garantizar el manejo de conversaciones o capturas de pantalla de gran tamano sin pruebas previas.
- Idiomas soportados no documentados; no se recomienda asumir un rendimiento multilingue equivalente al de la familia Qwen sin evaluacion propia.
- El modelo base tiene solo 35B parametros y es MoE: el numero de parametros activos es desconocido, lo que impide estimar con precision el coste computacional por token.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base podría heredar restricciones de la familia Qwen 3.5 si esta las tuviera; conviene verificar la licencia del checkpoint original antes de un despliegue en produccion.
- El repositorio GGUF ocupa 568,4 GB en total y no tiene descargas ni likes registrados en el momento de la consulta, lo que indica ausencia de validacion comunitaria.
- Para la entrada de imagen es imprescindible descargar el fichero `mmproj`; sin el, el modelo solo procesa texto.
- No se ha confirmado soporte de decodificacion especulativa, lo que limita las optimizaciones de latencia disponibles.

## Enlaces

- Repositorio GGUF: https://huggingface.co/bartowski/beipo-ai_NorthCUA-Mini-GGUF
- Modelo base: https://huggingface.co/beipo-ai/NorthCUA-Mini
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Release de llama.cpp utilizada para la cuantizacion: https://github.com/ggml-org/llama.cpp/releases/tag/b11969
- Fichero Q4_K_M recomendado: https://huggingface.co/bartowski/beipo-ai_NorthCUA-Mini-GGUF/blob/main/beipo-ai_NorthCUA-Mini-Q4_K_M.gguf
