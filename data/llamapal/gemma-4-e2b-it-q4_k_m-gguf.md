# LlamaPal/gemma-4-E2B-it-Q4_K_M-GGUF

## Resumen

Gemma 4 E2B es un modelo multimodal de Google disenado para ejecucion en dispositivos moviles, con capacidad de razonamiento integrado (thinking mode) y una ventana de contexto de 128K tokens. A pesar de su tamano compacto (4.647.450.147 parametros totales segun los safetensors del modelo base), el autor afirma que supera en matematicas y codigo a modelos varias veces mayores. Esta ficha corresponde a la cuantizacion Q4_K_M en formato GGUF publicada por el usuario LlamaPal, pensada para su uso en la aplicacion Android LlamaPal y, en general, en llama.cpp y cualquier runtime compatible.

El repositorio es un espejo sin modificaciones (mismos bytes, mismo hash SHA-256) del fichero `gemma-4-E2B-it-Q4_K_M.gguf` publicado por Unsloth, con un unico proposito: servir como origen de descarga para la app movil offline. No aporta pesos nuevos ni un proceso de cuantizacion propio, sino que redistribuye el artefacto de Unsloth.

Su relevancia actual radica en que empaqueta en 3,1 GB un modelo multimodal con contexto de 128K, decodificacion de razonamiento y licencia Apache 2.0, lo que permite inferencia completamente offline en telefonos Android de gama alta y en equipos de consumo sin GPU dedicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); detalles internos no disponibles |
| Parametros totales | 4.647.450.147 (segun safetensors del modelo base) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | 128K tokens (segun model card; pendiente de verificar en el GGUF) |
| Tipos de cuantizacion | Q4_K_M (esta publicacion); el repositorio de Unsloth ofrece otras variantes GGUF |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (enlace a la licencia Gemma 4 de Google en la model card) |
| Formato de pesos | GGUF (fichero `gemma-4-E2B-it-Q4_K_M.gguf`, 3,1 GB) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base (tipo de atencion, capas, diseno del encoder visual o si emplea mezcla de expertos). La model card unicamente lo describe como un modelo multimodal (`pipeline_tag: image-text-to-text`) orientado a dispositivos moviles, con razonamiento integrado ("built-in reasoning") y "thinking mode". Tampoco se detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

Respecto a esta publicacion concreta, se trata de una copia identica del GGUF de Unsloth en el commit `0314792d7f1f`, con hash SHA-256 `740185b21d22ceb83a11c3aa62ad5842ef32c70f6096d756bbee85a1e4ec34b8`. El tag `imatrix` sugiere que la cuantizacion Q4_K_M se genero con informacion de matriz de importancia, pero el proceso de cuantizacion en si no lo documenta este repositorio.

## Capacidades

- Generacion de texto conversacional multi-turno (`conversational`, `it`).
- Razonamiento con modo thinking ("built-in reasoning", "thinking mode").
- Matematicas y generacion de codigo, con rendimiento declarado superior a modelos mayores segun el autor (sin datos verificables en esta ficha).
- Procesamiento de imagen y texto (`image-text-to-text`), por lo que admite entradas visuales ademas de texto.
- Contexto largo de hasta 128K tokens segun la model card.
- Inferencia completamente offline en dispositivo, sin cuenta ni conexion de red.
- Compatibilidad con `endpoints_compatible` (etiqueta del repositorio).

## Casos de uso

- Asistente conversacional offline en Android: la app LlamaPal descarga este GGUF y permite chatear sin conexion, sin cuenta y sin que los datos abandonen el telefono. Adecuado por su tamano de 3,1 GB y su naturaleza multimodal.
- Privacidad en primer lugar: consultas medicas, legales o laborales que el usuario no quiere enviar a un servicio en la nube; todo el procesamiento ocurre localmente en el dispositivo.
- Analisis de capturas e imagenes en movilidad: al ser `image-text-to-text`, puede usarse para describir, resumir o extraer informacion de fotos y capturas tomadas en el propio telefono.
- Resolucion de problemas matematicos y pequenas tareas de codigo en entornos sin red (obras, zonas rurales, viajes), segun las capacidades declaradas de razonamiento.
- Integracion en apps Android basadas en llama.cpp: al ser un GGUF estandar, cualquier aplicacion construida sobre llama.cpp puede cargarlo sin adaptaciones.
- Prototipado de agentes y asistentes en local sobre equipos de consumo: sirve para probar flujos conversacionales con contexto largo antes de migrar a un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card afirma que el modelo "supera en matematicas y codigo a modelos varias veces mayores", pero no incluye cifras de MMLU, HumanEval, GSM8K ni de ningun otro conjunto.

## Requisitos de hardware

- VRAM/RAM para inferencia en Q4_K_M: aproximadamente 3,1 GB para los pesos, mas overhead de contexto KV; con 128K de contexto el consumo de KV puede crecer significativamente y conviene limitar la ventana en moviles.
- Dispositivos moviles: cualquier Android con al menos 4-6 GB de RAM libre deberia poder cargar el modelo; la app LlamaPal lo distribuye como opcion oficial.
- GPU de consumo: cabe holgadamente en tarjetas con 8 GB o mas (RTX 3060, 4060, 4070, 4090). En GPUs de 4-6 GB conviene reducir el contexto.
- GPU de datacenter: A100 y H100 pueden ejecutarlo, aunque sobredimensionadas para este tamano; utiles si se sirve en lote con contexto largo.
- Despliegue: llama.cpp y cualquier aplicacion construida sobre el (Ollama, LM Studio, LlamaPal, etc.). El repositorio etiqueta `endpoints_compatible`, lo que sugiere compatibilidad con servidores de endpoints de Hugging Face.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros aprox. | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma 4 E2B (esta cuantizacion) | 4,65 B | 128K | Si (image-text) | Apache 2.0 | GGUF en HF; app Android LlamaPal |
| Gemma 3 4B (referencia de generacion previa) | ~4 B | 128K (segun familia Gemma 3) | Si (variante multimodal) | Gemma license | GGUF en multiples repos |
| Modelos MoE pequenos tipo Phi / Qwen pequenos | 3-4 B | variable (32K-128K) | Segun variante | Variable | GGUF en multiples repos |

Los datos de comparacion de rendimiento no estan disponibles en la informacion proporcionada; la tabla solo recoge datos estructurales conocidos. No se han publicado cifras comparativas de benchmarks.

## Limitaciones y advertencias

- Es un espejo: el repositorio no mantiene el modelo ni responde de posibles problemas de la cuantizacion. La fuente autoritativa es `unsloth/gemma-4-E2B-it-GGUF` y el modelo base es `google/gemma-4-E2B-it`.
- Repositorio con 0 descargas y 0 likes; no hay evidencia de uso ni de validacion comunitaria de este artefacto concreto, aunque el hash coincide con el original de Unsloth.
- Cuantizacion Q4_K_M: perdida de calidad esperable frente a los pesos completos, especialmente en tareas de razonamiento largo y codigo.
- El contexto de 128K se declara en la model card, pero con 3,1 GB de pesos en un movil el contexto efectivo utilizable sera mucho menor por consumo de memoria KV.
- Riesgo de alucinacion inherente a los modelos de lenguaje, agravado por el modo thinking si no se valida la salida.
- Sesgos conocidos: no documentados en la informacion disponible; hay que asumir los sesgos del modelo base de Google.
- Idiomas soportados: no disponibles; no se puede confirmar el rendimiento en castellano sin pruebas.
- Licencia Apache 2.0 declarada, pero el enlace apunta a los terminos Gemma 4 de Google: conviene revisar ambas para uso comercial en produccion.
- El modelo base y su licencia pueden cambiar; este repositorio congela una instantanea de noviembre de 2026.

## Enlaces

- [Repositorio en Hugging Face](https://huggingface.co/LlamaPal/gemma-4-E2B-it-Q4_K_M-GGUF)
- [Modelo base: google/gemma-4-E2B-it](https://huggingface.co/google/gemma-4-E2B-it)
- [GGUF original de Unsloth](https://huggingface.co/unsloth/gemma-4-E2B-it-GGUF)
- [Licencia Gemma 4](https://ai.google.dev/gemma/docs/gemma_4_license)
- [App LlamaPal en Google Play](https://play.google.com/store/apps/details?id=com.vishistv.llamapal)
- [Sitio web de LlamaPal](https://llamapal.cc/)
- [Instagram de LlamaPal](https://www.instagram.com/llamapalhq/)
