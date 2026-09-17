# ohyeahmman/oryn-v1

## Resumen

Oryn-v1 es un ajuste fino multimodal publicado en HuggingFace por el usuario ohyeahmman bajo licencia Apache 2.0. Se trata de un derivado de `unsloth/qwen2-vl-7b-instruct-unsloth-bnb-4bit`, es decir, una especialización del modelo Qwen2-VL-7B-Instruct de Alibaba, en su variante cuantizada a 4 bits y adaptada para entrenamiento eficiente con Unsloth. El modelo conserva la arquitectura `qwen2_vl` (transformer multimodal con encoder visual y decoder de lenguaje) y el pipeline `image-text-to-text`, por lo que acepta entradas conjuntas de imagen y texto y genera respuestas en lenguaje natural.

El repositorio declara 8.291.375.616 parametros totales y un tamano de 16,6 GB, coherente con pesos almacenados en precision de 16 bits (aproximadamente dos bytes por parametro). No es un modelo MoE, por lo que no hay parametros activos diferenciados. La unica lengua declarada en los metadatos es el ingles (`en`), aunque al heredar de Qwen2-VL es probable que mantenga competencia multilingue residual del modelo base, algo que el autor no documenta ni garantiza.

La relevancia de esta ficha es limitada pero instructiva: se trata de un ajuste fino de autor individual, sin model card tecnica, sin dataset documentado, sin resultados de evaluacion y con 0 descargas y 1 like en el momento de la consulta. Resulta util como ejemplo de pipeline de fine-tuning multimodal con Unsloth + TRL sobre una base cuantizada, pero no como modelo listo para produccion sin una evaluacion previa por parte del equipo que lo adopte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal `qwen2_vl` (vision-language), segun el tag de la libreria y el modelo base |
| Parametros totales | 8.291.375.616 (dato real declarado en safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada. El modelo base Qwen2-VL-7B-Instruct declara 32.768 tokens de contexto nativo, dato no verificado en esta ficha ni en la model card de oryn-v1 |
| Tipos de cuantizacion | No se publican ficheros cuantizados en el repositorio. Los pesos se distribuyen en safetensors de ~16,6 GB, lo que corresponde a una precision de aproximadamente 16 bits por parametro (inferido del tamano y del numero de parametros). El modelo base si partia de una cuantizacion bnb-4bit para el entrenamiento |
| Idiomas soportados | `en` (unico idioma declarado en los metadatos). Capacidad multilingue del modelo base no documentada por el autor |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con `transformers`) |
| Modelo base | unsloth/qwen2-vl-7b-instruct-unsloth-bnb-4bit |
| Pipeline | image-text-to-text |
| Libreria | transformers |
| Tamano del repositorio | 16,6 GB |
| Compatibilidad declarada | `endpoints_compatible` (etiqueta del repositorio), `text-generation-inference` |
| Fecha de creacion (metadato del repo) | 2026-09-16T20:44:13.000Z |
| Ultima actualizacion (metadato del repo) | 2026-09-16T21:04:56.000Z |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen2-VL: un transformer multimodal compuesto por un encoder de vision que tokeniza las imagenes con resolucion dinamica y un decoder de lenguaje autorregresivo que procesa la secuencia combinada de tokens visuales y de texto. El ajuste fino se realizo sobre la variante `qwen2-vl-7b-instruct-unsloth-bnb-4bit`, que es la version del modelo cargada en 4 bits mediante bitsandbytes y preparada para entrenamiento con Unsloth. El autor declara explicitamente que el entrenamiento se realizo "2x faster with Unsloth and Huggingface's TRL library", lo que situa el procedimiento en el terreno del fine-tuning eficiente en memoria (adaptadores de bajo rango sobre una base cuantizada, con posterior guardado del resultado en un formato de mayor precision).

No se documenta el numero de tokens de entrenamiento, la composicion del dataset, el idioma de los datos, la existencia de fases de RLHF, DPO o cualquier otra etapa de alineacion, ni la mezcla de datos visuales y textuales empleada. La model card se limita a una plantilla autogenerada por Unsloth con los campos `base_model`, `tags`, `license` y `language`. Tampoco se describen innovaciones tecnicas propias: cualquier ventaja funcional procede del modelo base Qwen2-VL (tokenizacion visual con resolucion dinamica, soporte de multiples imagenes y de contenido mixto imagen-texto), no de este ajuste.

En consecuencia, la unica afirmacion verificable sobre el entrenamiento es la procedencia del modelo base y el uso de Unsloth y TRL. Cualquier otra caracteristica del proceso debe considerarse no disponible.

## Capacidades

- Generacion de texto conversacional: el modelo esta etiquetado como `conversational` y responde a instrucciones en formato de dialogo mediante plantillas de chat de Qwen2-VL.
- Comprension de imagen y texto combinados: pipeline `image-text-to-text`, por lo que puede describir imagenes, responder preguntas sobre ellas (VQA), extraer informacion de capturas, diagramas o documentos escaneados y razonar sobre contenido visual junto con texto.
- Razonamiento y matematicas basicas: capacidades heredadas del modelo base Qwen2-VL-7B-Instruct, no evaluadas de forma independiente en este ajuste.
- Generacion de codigo: heredada del modelo base. No hay evaluacion publicada para esta variante.
- Soporte de tool calling / function calling: no documentado en la model card. No se puede confirmar ni descartar; el modelo base Qwen2-VL tiene soporte de function calling en su plantilla de chat, pero no se ha verificado que el ajuste lo conserve.
- Comportamiento de agente y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas. El unico idioma declarado es el ingles; el resto de idiomas del modelo base no estan garantizados tras el ajuste.
- Modo de pensamiento explicito (thinking mode): no documentado.
- Capacidades de audio o video: no documentadas. Qwen2-VL procesa video como secuencia de fotogramas, pero el autor no lo menciona ni lo valida.

## Casos de uso

- Prototipado de asistentes visuales: el modelo acepta imagenes y texto en la misma conversacion, por lo que sirve para construir demos de asistente que responde preguntas sobre capturas de pantalla, fotografias o diagramas. Es adecuado para entornos de investigacion donde se prioriza la iteracion rapida sobre la garantia de calidad.
- Extraccion de informacion de documentos escaneados: facturas, formularios o tickets pueden enviarse como imagen y el modelo puede devolver los campos en texto estructurado, siempre que se valide la salida con reglas o con un segundo modelo, dado que no hay evaluacion publicada de fidelidad.
- Descripcion automatica de imagenes para accesibilidad: generacion de texto alternativo y descripciones breves en catalogos, galerias o plataformas de contenido, en ingles y con revision humana previa a la publicacion.
- Analisis de imagenes tecnicas: interpretacion de diagramas de arquitectura, esquemas de circuitos o graficos de resultados en flujos de documentacion tecnica, usando la ventana de contexto del modelo base para adjuntar varias imagenes en una misma consulta.
- Base para ajustes especificos de dominio: al ser un fine-tune sobre Qwen2-VL con licencia Apache 2.0, puede emplearse como punto de partida para especializaciones posteriores en un vertical concreto (medicina, retail, industrial) si el equipo dispone de datos etiquetados propios.
- Evaluacion comparativa de tecnicas de fine-tuning: util como caso de estudio reproducible para medir el impacto de entrenar con Unsloth y TRL sobre una base cuantizada a 4 bits frente a un ajuste en precision completa.
- Moderacion asistida de contenido visual: clasificacion preliminar de imagenes subidas por usuarios en una plataforma, con un modelo de politicas actuando como segunda capa de decision.
- Chat multimodal interno en ingles: asistente para equipos que necesiten consultar documentacion con imagenes adjuntas, con despliegue on-premise gracias a sus 16,6 GB de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K, MMMU, DocVQA ni de ninguna otra evaluacion, y la model card se limita a la plantilla autogenerada por Unsloth. Tampoco existen resultados de evaluacion por parte de terceros, dado que el modelo registra 0 descargas y 1 like en el momento de la consulta.

| Benchmark | oryn-v1 | Modelo base (Qwen2-VL-7B-Instruct) |
|---|---|---|
| MMLU | No disponible | No verificado en esta ficha |
| HumanEval | No disponible | No verificado en esta ficha |
| GSM8K | No disponible | No verificado en esta ficha |
| MMMU | No disponible | No verificado en esta ficha |
| DocVQA | No disponible | No verificado en esta ficha |

## Requisitos de hardware

- VRAM para inferencia en FP16/BF16: aproximadamente 16,6 GB solo para los pesos, mas la cache KV y las activaciones, lo que situa el consumo realista en el rango de 18 a 22 GB con contextos cortos.
- GPU de datacenter recomendadas para precision completa: A100 40 GB, A100 80 GB, H100 80 GB, L40S 48 GB. Son las opciones seguras para servir el modelo sin cuantizar con contextos largos.
- GPU de consumo: una RTX 4090 de 24 GB puede alojar los pesos en FP16, pero queda muy justa de memoria en cuanto crece el contexto o se procesan imagenes de alta resolucion. Una RTX 3090 de 24 GB se comporta de forma similar con menor ancho de banda.
- Cabe en GPU de consumo con cuantizacion: en 8 bits el consumo baja a unos 10-12 GB (RTX 4070 Ti Super 16 GB, RTX 4080, RTX 3090). En 4 bits los pesos ocupan aproximadamente 5 GB, de modo que el modelo puede ejecutarse en tarjetas de 8 a 12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB) con contextos reducidos.
- Coste adicional de la vision: el tokenizador visual de Qwen2-VL usa resolucion dinamica, por lo que una imagen grande puede consumir miles de tokens de contexto y aumentar de forma notable la memoria de la cache KV y el tiempo de prefill. Conviene limitar la resolucion de entrada en despliegues con poca VRAM.
- Opciones de despliegue: `transformers` es el camino nativo (los pesos son safetensors). vLLM soporta la familia Qwen2-VL y es la via recomendada para servir con concurrencia. El repositorio esta etiquetado como `endpoints_compatible` y `text-generation-inference`, por lo que TGI es una alternativa valida. llama.cpp y Ollama requieren convertir los pesos a GGUF y anadir el proyector multimodal (`mmproj`) para conservar la capacidad de vision; sin ese proyector la entrada de imagen no funciona.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia de prefill para esta variante.

## Comparativa con modelos similares

Los datos de los modelos comparados proceden de su documentacion publica y no han sido verificados en el contexto de esta ficha. Para oryn-v1 no existe ninguna medicion de rendimiento, por lo que la columna de rendimiento queda vacia en todos los casos.

| Modelo | Parametros | Contexto | Licencia | Rendimiento publicado |
|---|---|---|---|---|
| oryn-v1 | 8.291.375.616 | No disponible (base: 32.768 tokens) | Apache 2.0 | No disponible |
| Qwen2-VL-7B-Instruct (modelo base) | ~8.300 millones | 32.768 tokens nativos | Apache 2.0 | Si, publicado por el fabricante |
| Qwen2.5-VL-7B-Instruct | ~8.300 millones (no verificado) | No verificado en esta ficha | Apache 2.0 | Si, publicado por el fabricante |
| Llama-3.2-11B-Vision-Instruct | 11.000 millones (no verificado) | 128.000 tokens (no verificado) | Licencia comunitaria de Llama 3.2 | Si, publicado por el fabricante |

Diferencias relevantes: oryn-v1 es el unico de la tabla que no aporta evaluacion propia ni documentacion del ajuste. Frente al modelo base, la unica diferencia verificable es el ajuste fino y el formato de publicacion. Frente a Llama-3.2-11B-Vision, la licencia Apache 2.0 de oryn-v1 es mas permisiva y no impone las restricciones de la licencia comunitaria de Meta, pero no hay evidencia de rendimiento que respalde la eleccion.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni evaluacion humana, ni comparacion con el modelo base. Cualquier uso en produccion exige una bateria de pruebas propia antes de desplegar.
- Procedencia del ajuste desconocida: se ignora el dataset, su tamano, su idioma, su licencia y si contiene datos con derechos de terceros o informacion personal. Esto es un riesgo legal y de sesgo imposible de acotar con la informacion disponible.
- Entrenamiento sobre base cuantizada a 4 bits: partir de `bnb-4bit` puede introducir artefactos o degradaciones respecto a un ajuste en precision completa. El autor no documenta ninguna evaluacion comparativa al respecto.
- Riesgo de olvido catastrofico: un ajuste fino sobre una base pequena y sin datos publicados puede degradar capacidades del modelo original, en especial el razonamiento multilingue, el soporte de function calling y la interpretacion de imagenes complejas.
- Idioma: solo se declara ingles. No hay garantia de un rendimiento aceptable en castellano u otros idiomas, ni de que el tokenizador y la plantilla de chat se hayan usado correctamente durante el ajuste.
- Alucinacion: al ser un modelo de lenguaje multimodal sin etapa de alineacion documentada, puede inventar contenido sobre imagenes (objetos ausentes, texto ilegible transcrito de forma incorrecta) con alta confianza. En tareas de extraccion de datos desde documentos es obligatoria una validacion posterior.
- Sesgos: no hay model card de sesgos ni evaluacion de equidad. Los sesgos del modelo base Qwen2-VL se heredan sin mitigacion conocida.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se indique los cambios. Al derivar de Qwen2-VL, conviene revisar tambien las condiciones del modelo original por si el autor del ajuste hubiera incumplido alguna obligacion de atribucion.
- Senales de baja madurez del repositorio: 0 descargas, 1 like, model card autogenerada sin informacion tecnica, y metadatos con fechas de creacion y actualizacion que no se corresponden con el momento de la consulta. No hay garantia de mantenimiento, soporte ni correccion de errores.
- Compatibilidad de despliegue: los pesos se distribuyen unicamente en safetensors. No hay versiones GGUF ni cuantizaciones publicadas, por lo que el uso en llama.cpp u Ollama exige conversion manual y la generacion del proyector multimodal.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ohyeahmman/oryn-v1
- Modelo base en HuggingFace: https://huggingface.co/unsloth/qwen2-vl-7b-instruct-unsloth-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Libreria TRL de HuggingFace: https://github.com/huggingface/trl
- Modelo original Qwen2-VL-7B-Instruct: https://huggingface.co/Qwen/Qwen2-VL-7B-Instruct
- La busqueda web realizada no devolvio ningun resultado relacionado con el modelo. Los enlaces obtenidos (Zhihu, Stack Overflow) no guardan relacion con oryn-v1 ni con Qwen2-VL y se omiten por no ser pertinentes.
