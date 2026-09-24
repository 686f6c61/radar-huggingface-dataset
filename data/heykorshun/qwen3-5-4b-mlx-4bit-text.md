# heykorshun/Qwen3.5-4B-MLX-4bit-text

## Resumen

heykorshun/Qwen3.5-4B-MLX-4bit-text es una conversion a MLX de 4 bits del modelo Qwen/Qwen3.5-4B, publicada por el usuario heykorshun, en la que se ha eliminado por completo la torre de vision. El resultado es un modelo exclusivamente de texto, con 4.205.751.296 parametros en formato safetensors MLX y un repositorio de 2,4 GB, frente a los 3,06 GB de la conversion original de mlx-community. Se distribuye bajo licencia Apache 2.0, la misma que el modelo base.

El problema que resuelve es muy concreto: reducir el peso de descarga y el consumo de memoria en aplicaciones de texto que no necesitan entrada de imagen o video. El autor lo publica para Stilltone, una aplicacion de notas de reunion local-first para macOS, que usa Qwen3.5-4B unicamente para resumir transcripciones y extraer elementos. Cualquier tensor del modelo de lenguaje, el tokenizer, la plantilla de chat y el config.json permanecen sin cambios byte a byte respecto al repositorio original.

Su relevancia es practica mas que arquitectonica: demuestra que se puede recortar un 22 % del peso de descarga eliminando pesos multimodales sin alterar ni una sola salida de texto, algo verificado de forma empirica. Es un artefacto de optimizacion para despliegue en Apple Silicon, no un modelo nuevo ni un reentrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (arquitectura declarada en config.json: `qwen3_5`), torre de vision eliminada |
| Parametros totales | 4.205.751.296 (4,2 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits MLX, group size 64 (unica variante publicada en este repo) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato MLX) |

Datos adicionales: libreria `mlx`, pipeline `text-generation`, tamano del repositorio 2,4 GB, revision base de mlx-community referenciada `0e7ffd5c629ef7719d4cbc04069232580bfa9d9c`, creado el 2026-09-24, 0 descargas y 0 likes en el momento de la consulta.

## Arquitectura y entrenamiento

No hay entrenamiento nuevo. Este repositorio es una conversion de pesos: parte de mlx-community/Qwen3.5-4B-4bit, a su vez una conversion a 4 bits del Qwen/Qwen3.5-4B original, y le aplica una unica modificacion estructural. Se eliminan los 297 tensores con prefijo `vision_tower.*` (aproximadamente 667 MB) de `model.safetensors`, junto con los ficheros de configuracion del procesador de imagen y video: `preprocessor_config.json`, `processor_config.json` y `video_preprocessor_config.json`.

Todos los tensores del modelo de lenguaje se mantienen sin cambios, byte a byte, con la misma cuantizacion de 4 bits y group size 64. El `config.json` tambien se conserva intacto: sigue declarando la arquitectura `qwen3_5` y sigue incluyendo el bloque `vision_config`, aunque los pesos de vision ya no existan. Esto es deliberado y no rompe la carga, porque los cargadores de texto de MLX ya ignoran los pesos de vision. El tokenizer y la plantilla de chat tampoco se tocan, por lo que el parametro `enable_thinking` de la plantilla sigue estando disponible.

La validacion es el dato tecnico mas interesante del repositorio. Con mlx-swift-lm (`LLMModelFactory`, el runtime que usa la app Stilltone), decodificacion greedy con temperatura 0 y modo thinking desactivado, se ejecutaron 23 llamadas reales de extraccion sobre dos transcripciones de reunion. Cada respuesta fue identica byte a byte a la del repositorio original. Con mlx-lm en Python, el modelo carga con `mlx_lm.load` y genera con normalidad.

## Capacidades

- Generacion de texto conversacional, con plantilla de chat compatible con mensajes multi-turno al estilo `role`/`content`.
- Resumen de documentos y transcripciones: es el caso de uso para el que se publico el modelo.
- Extraccion de elementos estructurados a partir de texto libre, verificada en 23 llamadas reales sobre transcripciones de reunion.
- Modo thinking conmutable a traves del parametro `enable_thinking` de la plantilla de chat: activado para razonamiento, desactivado para latencia baja y salidas mas directas.
- Decodificacion greedy reproducible: a temperatura 0 las salidas son deterministas, lo que facilita pruebas de regresion.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling o function calling: no disponible en la informacion proporcionada.
- Capacidades de agente o razonamiento multi-paso: no disponibles en la informacion proporcionada.
- Vision y entrada de imagen o video: explicitamente no soportadas. Para eso hay que usar el repositorio original.

## Casos de uso

- Resumen de reuniones en local: es el proposito declarado del modelo. La app Stilltone le pasa la transcripcion de una reunion y obtiene un resumen; al estar cuantizado a 4 bits y sin torre de vision, todo el proceso cabe en memoria unificada de un Mac y no requiere enviar audio ni transcripciones a la nube.
- Extraccion de elementos y tareas a partir de transcripciones: el autor valida 23 llamadas de extraccion sobre dos transcripciones reales. El modelo identifica y estructura los puntos tratados sin necesidad de un prompt de sistema complejo.
- Asistente de escritorio offline para macOS: integrable con `LLMModelFactory` y `ModelConfiguration(id:)` en Swift, o con `mlx_lm.load` en Python. Al no haber dependencias de red, encaja en aplicaciones que prometen privacidad por diseno.
- Generacion aumentada por recuperacion sobre documentacion interna: el modelo puede recibir fragmentos recuperados de un indice vectorial y redactar respuestas citando el contexto, con el ahorro de memoria que supone no cargar los pesos de vision mientras se mantiene el resto del pipeline en RAM.
- Clasificacion y etiquetado de texto a escala: con decodificacion greedy a temperatura 0 y el modo thinking desactivado, las salidas son deterministas y repetibles, lo que simplifica auditar y testear pipeline de etiquetado sobre lotes de documentos.
- Autocompletado y asistencia de redaccion en editores: al pesar 2,4 GB en disco y cargar rapido en memoria unificada, es viable mantenerlo residente mientras el usuario escribe, sin competir por VRAM con otras aplicaciones.
- Prototipado de agentes conversacionales con razonamiento opcional: se puede activar `enable_thinking` para tareas que requieren pasos intermedios y desactivarlo para respuestas inmediatas, usando el mismo checkpoint en ambos modos.
- Despliegue en equipos de desarrollo con Apple Silicon sin GPU dedicada: cualquier Mac con 8 GB o mas de memoria unificada puede ejecutarlo, lo que permite distribuir el mismo modelo a todo un equipo sin infraestructura de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de evaluacion es la verificacion funcional descrita por el autor: 23 llamadas de extraccion sobre dos transcripciones de reunion, con temperatura 0 y thinking desactivado, produjeron respuestas identicas byte a byte a las del repositorio mlx-community/Qwen3.5-4B-4bit. No hay cifras de MMLU, HumanEval, GSM8K ni de throughput o latencia.

## Requisitos de hardware

- Pesos en disco: 2,4 GB de repositorio (2,39 GB tras eliminar los pesos de vision, frente a 3,06 GB del original).
- VRAM o memoria unificada estimada para inferencia: del orden de 2,5 a 3 GB solo para los pesos, mas la cache KV, que crece con la longitud de contexto. Se recomienda un minimo de 6 a 8 GB de memoria unificada para trabajar con margen. Es una estimacion derivada del tamano de los pesos cuantizados, no un dato publicado.
- GPU compatibles: el formato es MLX, por lo que el objetivo natural es Apple Silicon (series M1, M2, M3 y M4). Cabe en cualquier Mac con 8 GB o mas de memoria unificada. Para GPU NVIDIA o AMD hay que reconvertir los pesos a otro formato (GGUF, AWQ y similares); este repositorio no sirve tal cual.
- Opciones de despliegue: `mlx-lm` en Python (`mlx_lm.load` y `generate`) y `mlx-swift-lm` en Swift (`LLMModelFactory`). No hay soporte directo de vLLM, llama.cpp, Ollama ni TGI sin conversion previa del checkpoint.
- Latencia y throughput: no disponibles. Dependen por completo del chip Apple Silicon empleado y de la longitud de contexto.

## Comparativa con modelos similares

Los datos de la columna de Qwen3.5-4B son los unicos procedentes de la informacion proporcionada; los de los modelos alternativos provienen de sus fichas publicas y conviene verificarlos antes de tomar una decision.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad en MLX |
|---|---|---|---|---|
| heykorshun/Qwen3.5-4B-MLX-4bit-text | 4,2 B (texto) | no disponible | apache-2.0 | si, nativa (este repositorio) |
| Qwen3.5-4B (base, mlx-community 4bit) | 4,2 B + torre de vision | no disponible | apache-2.0 | si, 3,06 GB, con vision |
| Qwen3-4B | 4,0 B | 32k nativo, ampliable | apache-2.0 | si, via mlx-community |
| Llama-3.2-3B | 3,2 B | 128k | Llama 3.2 Community License | si, via mlx-community |
| Gemma-3-4B | 4,0 B | 128k | Gemma License (uso comercial con condiciones) | si, via mlx-community |

Frente a la variante con vision del mismo modelo, la unica diferencia es el peso de descarga y la memoria ocupada: 2,39 GB frente a 3,06 GB, sin cambio alguno en la salida de texto. Frente a Qwen3-4B y Llama-3.2-3B, la comparacion real depende de la calidad del Qwen3.5-4B original, cuyos benchmarks no se han facilitado.

## Limitaciones y advertencias

- No soporta entrada de imagen ni de video. Si se necesita multimodalidad, hay que usar Qwen/Qwen3.5-4B o mlx-community/Qwen3.5-4B-4bit.
- El `config.json` sigue declarando `vision_config` aunque los pesos no existan. Los cargadores de texto de MLX lo ignoran, pero otras herramientas que lean ese bloque de forma estricta podrian fallar o intentar cargar tensores ausentes.
- Esta atado al ecosistema MLX y a Apple Silicon. No es directamente utilizable en CUDA sin reconvertir los pesos.
- El autor no publica benchmarks. La unica evidencia de calidad es la equivalencia byte a byte con el modelo de origen en 23 llamadas concretas; no hay garantia formal de comportamiento equivalente en tareas fuera de ese conjunto.
- Repositorio con 0 descargas y 0 likes, publicado por un usuario individual y con fecha de creacion muy reciente. No tiene el respaldo ni el mantenimiento del equipo de Qwen ni de mlx-community.
- Riesgo de alucinacion: caracteristico de cualquier modelo de 4.000 millones de parametros, especialmente al generar resumenes o extraer elementos de transcripciones largas donde puede omitir o inventar detalles.
- Idiomas soportados: no disponibles en la informacion proporcionada. El rendimiento fuera del ingles y del chino deberia validarse antes de usarlo en produccion.
- Longitud de contexto: no disponible. Es un dato critico para el caso de uso principal (reuniones largas) y no se puede estimar a partir de la informacion facilitada.
- Licencia Apache 2.0, permisiva para uso comercial, pero con la obligacion habitual de conservar el aviso de licencia y de atribuir al equipo de Qwen. El texto de la licencia se copia sin cambios del modelo original.
- La atribucion correcta corresponde al equipo de Qwen por el modelo base y a mlx-community por la conversion a 4 bits. Este repositorio solo elimina los pesos de vision.
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo: los enlaces recuperados eran contenido no relacionado y se han descartado por completo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/heykorshun/Qwen3.5-4B-MLX-4bit-text
- Modelo base original: https://huggingface.co/Qwen/Qwen3.5-4B
- Conversion MLX 4 bits de partida: https://huggingface.co/mlx-community/Qwen3.5-4B-4bit
- Revision concreta del modelo base MLX: `0e7ffd5c629ef7719d4cbc04069232580bfa9d9c`
- Licencia Apache 2.0 incluida en el repositorio: `LICENSE`
- Libreria de inferencia Python: https://github.com/ml-explore/mlx-lm
- Libreria de inferencia Swift: https://github.com/ml-explore/mlx-swift-examples
