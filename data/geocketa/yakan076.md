# geocketa/yakan076

## Resumen

`geocketa/yakan076` es un repositorio de modelo alojado en Hugging Face por el usuario `geocketa`, publicado bajo acceso restringido (gated) y con un tamano de repositorio de 11,4 GB. A partir de ese volumen y del formato habitual de pesos en safetensors, se puede estimar un modelo del orden de 5.000 a 6.000 millones de parametros en precision de 16 bits, aunque esta cifra es una inferencia del tamano del repositorio y no un dato confirmado por el autor.

La informacion publica disponible es minima: no se declara pipeline, licencia, idiomas soportados ni arquitectura. El repositorio acumula 0 descargas y 1 like, lo que sugiere un proyecto en fase muy temprana o de caracter privado/experimental. La ficha tecnica se ha creado el 31 de agosto de 2026 y actualizado el 13 de noviembre de 2026.

Dado que el acceso esta restringido, cualquier evaluacion practica requiere solicitar permiso al autor en Hugging Face. Sin esa autorizacion no es posible verificar pesos, tokenizador, configuracion ni calidad de generacion, por lo que los apartados siguientes reflejan unicamente lo que consta en la informacion proporcionada, marcando como "no disponible" todo aquello que no se ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible (estimacion por tamano de repo: ~5-6B en FP16) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el tamano de 11,4 GB es compatible con safetensors en FP16) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo. No consta si se trata de un transformer denso, un modelo de mezcla de expertos (MoE), una arquitectura hibrida con capas de estado o cualquier otra variante. Tampoco hay datos sobre el tokenizador, la longitud de contexto nativa ni mecanismos de atencion especificos.

Respecto al entrenamiento, no se dispone de informacion sobre el volumen de tokens, la composicion del corpus, el uso de tecnicas de alineacion como RLHF, DPO o SFT, ni sobre procesos de destilacion o decodificacion especulativa. El unico metadato objetivo es el tamano del repositorio (11,4 GB) y las fechas de creacion y actualizacion.

## Capacidades

- No se han documentado capacidades especificas en la informacion disponible.
- No consta soporte de tool calling ni function calling.
- No consta soporte de agentes ni razonamiento multi-paso.
- No consta capacidad multilingue declarada.
- No consta modo de razonamiento extendido (thinking mode), vision, audio ni multimodalidad.
- No se dispone de model card con ejemplos de uso, plantillas de prompt o formato de chat.

## Casos de uso

No es posible recomendar casos de uso concretos sin informacion verificable sobre arquitectura, contexto, licencia y rendimiento. Cualquier aplicacion en produccion requeriria primero acceso al repositorio y una evaluacion propia. Los escenarios habituales para un modelo de este tamano (asistentes conversacionales, generacion de codigo, resumen de documentos, clasificacion de texto, extraccion de entidades y generacion aumentada por recuperacion) son hipoteticos y no estan respaldados por datos publicados del autor.

- Asistencia conversacional: no evaluable sin model card ni ejemplos de prompt.
- Generacion de codigo: no evaluable sin benchmarks tipo HumanEval o MBPP.
- Resumen de documentos largos: no evaluable sin conocer la ventana de contexto.
- Clasificacion y extraccion de informacion: no evaluable sin datos de entrenamiento.
- RAG sobre base documental: no evaluable sin conocer el tokenizador y el contexto maximo.
- Despliegue en produccion: bloqueado por acceso gated y ausencia de licencia declarada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa, un modelo de ~5-6B en FP16 requiere del orden de 10-12 GB de VRAM solo para pesos; en cuantizacion de 8 bits unos 5-6 GB y en 4 bits unos 3-4 GB. Estas cifras son estimaciones por tamano de repositorio, no datos del autor.
- GPU recomendadas: no disponible. Por tamano estimado, una RTX 4090 (24 GB) o A100/H100 permitirian inferencia en FP16 con margen para cache KV.
- Compatibilidad con GPU de consumo: probable en GPUs con 12 GB o mas en FP16 y en GPUs de 8 GB con cuantizacion, sujeto a verificacion tras obtener acceso.
- Opciones de despliegue: no confirmadas. No consta publicacion de pesos en GGUF, por lo que llama.cpp u Ollama no estan garantizados; vLLM o TGI requeririan pesos en safetensors y configuracion compatible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No es posible establecer una comparativa rigurosa porque se desconocen parametros, contexto, licencia y rendimiento del modelo. A modo de referencia de categoria por tamano estimado, se listan alternativas abiertas ampliamente documentadas:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| geocketa/yakan076 | no disponible (~5-6B estimado) | no disponible | no disponible | gated en HF |
| Qwen2.5-7B | 7,6B | 32.768 tokens (hasta 131.072 con RoPE) | Apache 2.0 | abierta |
| Llama 3.1 8B | 8B | 128.000 tokens | Llama 3.1 Community License | abierta con aceptacion |
| Mistral 7B v0.3 | 7,2B | 32.768 tokens | Apache 2.0 | abierta |

La comparacion de rendimiento con estos modelos no puede realizarse sin benchmarks publicados de `yakan076`.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face; no es posible descargar ni inspeccionar los pesos sin autorizacion del autor.
- Licencia no declarada: no se puede asumir uso comercial, redistribucion ni modificacion. Cualquier uso en produccion requiere aclaracion previa por parte del autor.
- Ausencia de model card: no hay informacion sobre sesgos, datos de entrenamiento, idiomas ni limitaciones conocidas.
- Riesgo de alucinacion: no evaluado; sin benchmarks ni evaluaciones de fidelidad no puede descartarse.
- Idiomas: no declarados, por lo que no se garantiza un rendimiento aceptable en castellano.
- Madurez del proyecto: 0 descargas y 1 like indican ausencia de validacion por parte de la comunidad; no hay evidencia de uso en produccion.
- Fechas del repositorio: creado en agosto de 2026 y actualizado en noviembre de 2026; conviene verificar si el contenido ha cambiado desde la ultima revision.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/geocketa/yakan076
- Perfil del autor: https://huggingface.co/geocketa
- No se han encontrado papers, blogs, repositorios de codigo ni demos asociados en la informacion disponible.
