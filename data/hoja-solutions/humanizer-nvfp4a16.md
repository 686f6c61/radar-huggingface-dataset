# hoja-solutions/humanizer-NVFP4A16

## Resumen

humanizer-NVFP4A16 es una version cuantizada del modelo jialinyyzz/humanizer, un modelo de 12B parametros especializado en reescribir borradores generados por IA para que suenen como escritos por una persona. La ficha corresponde a hoja-solutions (Hoja), una consultora de ingenieria que publica modelos orientados a produccion. Se trata de un checkpoint de 11.959.730.224 parametros (unos 12B), distribuido en un repositorio de 8,3 GB.

El modelo base esta etiquetado como gemma4_unified y como image-text-to-text, pero la propia model card de esta version lo describe como un modelo de completado de texto (text-completion), con una plantilla de chat que ignora prompts de sistema y turnos anteriores. Esta version concreta no introduce capacidades nuevas: su aportacion es la cuantizacion NVFP4A16, que reduce el checkpoint de 23,9 GB en bf16 a 8,25 GB guardando los pesos de las proyecciones del decodificador en FP4 (E2M1), con una escala FP8 por cada 16 pesos y una escala FP32 por tensor, dejando las activaciones en bf16.

Es relevante ahora porque permite servir un modelo de 12B con un consumo de VRAM cercano a los 9 GB de pesos, lo que deja espacio para la cache KV en tarjetas de 24 GB y habilita el despliegue en GPUs de consumo. Segun las mediciones del autor en una RTX 5090, la version cuantizada pasa de 59 a 136 tokens/s en peticion unica y de 501 a 1.585 tokens/s con lotes de hasta 32 peticiones frente a los pesos bf16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decodificador (etiquetado como gemma4_unified en los tags del modelo base); no disponible el detalle completo en la informacion proporcionada |
| Parametros totales | 11.959.730.224 (unos 12B) |
| Parametros activos | No procede (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | No disponible en la informacion proporcionada; el ejemplo de despliegue con vLLM usa `--max-model-len 8192` |
| Tipos de cuantizacion | NVFP4A16: pesos en FP4 (E2M1), escala FP8 por cada 16 pesos, escala FP32 por tensor, activaciones en bf16. Formato compressed-tensors |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base es un transformer decodificador de 12B parametros. La cuantizacion se aplico sobre 328 proyecciones del decodificador, que incluyen las proyecciones de atencion q/k/v/o y las proyecciones con activacion con puerta (gate/up/down) del bloque MLP. El esquema aplicado es NVFP4A16: los pesos se almacenan en FP4 con formato E2M1, con una escala FP8 compartida por cada 16 pesos y una escala FP32 por tensor, mientras que las activaciones se mantienen en bf16 durante la inferencia.

El proceso de cuantizacion se realizo con llm-compressor 0.14.0 y compressed-tensors 0.19.0, sobre transformers 5.17.0 y torch 2.14.0, aplicando GPTQ con ordenacion estatica de activaciones, tamano de bloque 128 y dampening 0.01. No se dispone en la informacion proporcionada de los detalles del entrenamiento del modelo base (numero de tokens, composicion del dataset, uso de RLHF o DPO); la model card de esta version remite a la ficha del modelo original para esos datos. La funcion especifica que se entrena a preservar es la fidelidad de numeros, nombres, fechas y citas textuales al reescribir un borrador.

## Capacidades

- Generacion de texto orientada a reescritura: transforma borradores escritos por IA en versiones con estilo humano, en ingles y chino.
- Preservacion de datos factuales: el modelo esta entrenado para mantener cada numero, nombre, fecha y cita del texto original.
- Modelo de completado de texto: la interfaz principal es `/v1/completions`, con instruccion, borrador y separador tomados de `prompt_format.json`.
- Compatibilidad con endpoint de chat: `/v1/chat/completions` funciona con un borrador por mensaje de usuario, aunque la plantilla ignora los prompts de sistema y los turnos previos.
- Multilingue limitado a ingles y chino, tanto en entrada como en salida.
- No se documentan capacidades de tool calling, function calling ni razonamiento multi-paso o en modo agente en la informacion disponible.
- Aunque el modelo base esta etiquetado como image-text-to-text, el ejemplo de servicio desactiva explicitamente imagen, audio y video (`--limit-mm-per-prompt '{"image":0,"audio":0,"video":0}'`); no se documenta uso multimodal en esta version.

## Casos de uso

- Humanizacion de articulos generados por IA: el modelo reescribe un borrador completo manteniendo cifras y citas, de modo que un equipo editorial puede publicar texto con estilo natural sin revisar cada dato a mano.
- Redaccion de marketing y copies: partiendo de un borrador generado por IA, se obtiene una version mas fluida para campanas en ingles o chino, con temperatura 1.0 y top-p 0.95 como ajustes recomendados.
- Localizacion EN-ZH de contenido: el soporte nativo de ambos idiomas permite reescribir un mismo texto en las dos lenguas conservando fechas y cifras, algo util para mercados que cubren ambos idiomas.
- Preparacion de documentacion tecnica: el modelo puede reformular borradores de manuales o notas de version sin alterar numeros de version, identificadores ni referencias, que es justamente el comportamiento para el que fue entrenado.
- Generacion de contenido educativo y divulgativo: se puede partir de un borrador esquematico y obtener un texto con registro mas humano para blogs o cursos, manteniendo nombres propios y fechas.
- Integracion en pipelines editoriales por lotes: con vLLM y lotes de hasta 32 peticiones, la version NVFP4A16 alcanza 1.585 tokens/s en una RTX 5090, lo que permite procesar cientos de borradores en un solo equipo.
- Post-procesado de respuestas de otros modelos: como etapa final de una cadena, se toma la salida de un LLM y se reescribe para eliminar el tono marcadamente artificial antes de entregarla al usuario.
- Servicio autoalojado de reescritura: con 8,25 GB de pesos, se puede desplegar en una GPU de consumo y exponer un endpoint compatible con OpenAI para uso interno o comercial bajo licencia Apache 2.0.

## Benchmarks y rendimiento

Evaluacion de fidelidad frente a los pesos bf16, medida por el autor sobre un conjunto de 209 borradores en ingles y 102 en chino (187.551 posiciones en ingles y 99.166 en chino), ambos ejecutados en vLLM 0.30.0:

| Build | Tamano | Top-1 vs. bf16, EN / ZH (media) | KL vs. bf16, EN / ZH |
|---|---|---|---|
| bf16, segunda ejecucion en vLLM | 23,9 GB | 99,20% / 99,10% (99,15%) | 0,0000 / 0,0001 |
| NVFP4A16 (esta build) | 8,25 GB | 95,03% / 94,51% (94,77%) | 0,0120 / 0,0121 |

Comparacion aproximada con otras cuantizaciones del mismo modelo, medida con llama.cpp sobre fragmentos de 2.048 tokens del mismo conjunto (runtime y tokens distintos, por lo que el autor la califica de aproximada): Q4_K_M con quantization-aware 95,2% de top-1 y KL 0,0136 / 0,0146; Q4_K_M estandar 93,9%; Q6_K 97,7%.

Recuento de cifras ausentes en las reescrituras (una reescritura por borrador, 311 borradores):

| Reescrituras | EN: reescrituras sin algun numero | ZH: reescrituras sin algun numero | ZH: numeros ausentes |
|---|---|---|---|
| bf16, muestras publicadas por los autores | 65 / 209 | 31 / 102 | 85 / 1.928 |
| bf16, remuestreado en vLLM | 71 / 209 | 28 / 102 | 73 / 1.928 |
| NVFP4A16 (esta build) | 64 / 209 | 32 / 102 | 68 / 1.928 |

Velocidad en RTX 5090 con vLLM 0.30.0, reescribiendo los 311 borradores de evaluacion (unos 144.000 tokens generados):

| Build | Una peticion a la vez | 311 peticiones, hasta 32 simultaneas |
|---|---|---|
| bf16 | 59 tok/s | 501 tok/s |
| NVFP4A16 (esta build) | 136 tok/s | 1.585 tok/s |

No se han publicado en la informacion disponible resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K u otros).

## Requisitos de hardware

- VRAM estimada para inferencia: 8,25 GB solo para los pesos en FP4; hay que sumar cache KV y memoria de activaciones. En la comparativa del autor, los 24 GB de pesos en bf16 limitaban seriamente el espacio para la cache KV en una GPU de 24 GB, situacion que esta version evita.
- GPU recomendadas: el fabricante ha validado el modelo en RTX 5090. Por tamano, cualquier GPU con 12 GB o mas de VRAM deberia poder cargar los pesos, aunque el rendimiento y el tamano de lote dependen del modelo concreto.
- Cabe en GPU de consumo: si, con 8,25 GB de pesos es viable en tarjetas de gama alta de consumo y en muchas de gama media con 12 GB o mas. En una RTX 5090 el autor reporta 136 tok/s en peticion unica y 1.585 tok/s con lotes de hasta 32.
- Opciones de despliegue: vLLM 0.30.0 (probado con la imagen `vllm/vllm-openai:v0.30.0`), que carga el checkpoint como modelo compressed-tensors. En GPUs sin soporte nativo de computo FP4, vLLM usa el kernel Marlin, que lee pesos FP4 y calcula con activaciones bf16; el aviso "Your GPU does not have native support for FP4 computation" es esperado. No se documentan otras opciones de despliegue para esta build.
- Latencia y throughput: medidos por el autor en RTX 5090, 136 tok/s en peticion unica y 1.585 tok/s con hasta 32 peticiones concurrentes, sobre unos 144.000 tokens generados.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos alternativos de humanizacion o reescritura de texto en la documentacion proporcionada. La comparacion disponible es interna, entre las distintas builds del mismo modelo:

| Build | Tamano | Formato | Top-1 vs. bf16 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jialinyyzz/humanizer (bf16) | 23,9 GB | safetensors | 99,15% (referencia) | Apache 2.0 (modelo base) | Repositorio del autor original |
| humanizer-NVFP4A16 (esta build) | 8,25 GB | safetensors comprimido (NVFP4) | 94,77% | Apache 2.0 | hoja-solutions |
| GGUF Q6_K (autores) | 7,6 GB aprox. (no confirmado) | GGUF | 97,7% | Apache 2.0 | Autores del modelo base |
| GGUF Q4_K_M quantization-aware (autores) | 7,6 GB | GGUF | 95,2% | Apache 2.0 | Autores del modelo base |
| GGUF Q4_K_M estandar (autores) | no disponible | GGUF | 93,9% | Apache 2.0 | Autores del modelo base |

## Limitaciones y advertencias

- Riesgo de alucinacion y de perdida de datos: el propio autor advierte que la comprobacion de numeros no puede detectar cambios en nombres ni afirmaciones reformuladas. En las reescrituras de esta build faltaba alguna cifra en 64 de 209 borradores en ingles y en 32 de 102 en chino, aunque el autor senala que muchas de esas "ausencias" son fechas y horas escritas de otra forma, por lo que no equivalen a una tasa de error factual.
- Degradacion respecto a bf16: la cuantizacion baja el top-1 de 99,15% a 94,77% y eleva la KL a 0,0120 / 0,0121. Para usos donde la fidelidad exacta sea critica conviene validar contra el modelo en bf16.
- Limitacion de idioma: solo ingles y chino. No hay soporte documentado de castellano ni de otros idiomas.
- Longitud de contexto: no se documenta la ventana nativa del modelo; el ejemplo de despliegue con vLLM fija `--max-model-len 8192`. No se debe asumir un contexto mayor sin verificarlo.
- Restricciones de uso de la plantilla de chat: la plantilla ignora los prompts de sistema y los turnos anteriores; no sirve para conversaciones multi-turno con instrucciones persistentes.
- Parametros de muestreo obligatorios: hay que usar temperatura 1.0 y top-p 0.95, con top-k, min-p y penalizacion por repeticion desactivados, y no definir cadenas de parada como `"###"`. El `generation_config.json` de esta copia ajusta `top_k` a 0, mientras que el archivo original del modelo base define `top_k: 64`; el autor recomienda desactivarlo.
- Aviso esperado en vLLM: en GPUs sin soporte nativo de computo FP4 aparece el mensaje "Your GPU does not have native support for FP4 computation", que no indica un error.
- Licencia: Apache 2.0, lo que en principio permite uso comercial, pero conviene verificar la licencia del modelo base jialinyyzz/humanizer antes de desplegarlo en produccion.
- Trazabilidad: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que se trata de una publicacion reciente y poco contrastada por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hoja-solutions/humanizer-NVFP4A16
- Modelo base: https://huggingface.co/jialinyyzz/humanizer
- Perfil del autor: https://huggingface.co/hoja-solutions
- Modelos del autor: https://huggingface.co/hoja-solutions/models
- Repositorio de llm-compressor: https://github.com/vllm-project/llm-compressor
- Repositorio de compressed-tensors: https://github.com/neuralmagic/compressed-tensors
- Repositorio de vLLM: https://github.com/vllm-project/vllm
