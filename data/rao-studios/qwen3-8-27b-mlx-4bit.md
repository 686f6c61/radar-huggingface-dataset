# rao-studios/Qwen3.8-27B-mlx-4bit

## Resumen

Qwen3.8-27B-mlx-4bit es un espejo (mirror) del repositorio mlx-community/Qwen3.8-27B-4bit, publicado por rao-studios. No se trata de un modelo nuevo ni de una cuantizacion propia: los pesos, el tokenizador, la plantilla de chat y la configuracion son identicos byte a byte al repositorio original, fijado en el commit `10c35caafbb80f7dc6a7a432cdd11af10a6d4818`. El autor solo anade la model card y el fichero LICENSE (Apache 2.0, copiado de Qwen/Qwen3.8-27B).

El modelo subyacente es Qwen3.8-27B, un modelo denso de vision-lenguaje de 27.000 millones de parametros desarrollado por el equipo Qwen, convertido a formato MLX con cuantizacion de 4 bits (group size 64) para su ejecucion en Apple Silicon. Con 64 capas y una ventana de contexto de 262.144 tokens, esta pensado para tareas multimodales (texto, imagen y video), razonamiento, codigo, procesamiento de contexto largo, tool calling y flujos agenticos.

Su relevancia es practica: permite ejecutar localmente en un Mac un modelo de 27B en 4 bits (16,1 GB de safetensors) con contexto muy largo. El mirror existe para que las instalaciones de la aplicacion Adverb descarguen siempre los mismos bytes desde un repositorio controlado por Rao Studios, fijado a un commit concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen3_5`, transformer denso, 64 capas |
| Parametros totales | 27.356.728.560 (~27,36 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | 4 bits, group size 64 (esta version); no disponible el catalogo completo de cuantizaciones del modelo base |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), 3 shards, 2.180 tensores, 16,1 GB |

## Arquitectura y entrenamiento

La arquitectura declarada en `config.json` es `qwen3_5`, un transformer denso de 64 capas con 27.356.728.560 parametros. El pipeline es image-text-to-text, e incluye ficheros de preprocesado de imagen (`preprocessor_config.json`) y de video (`video_preprocessor_config.json`), lo que confirma el soporte multimodal de imagen y video. La model card no detalla el mecanismo de atencion, la composicion del dataset de entrenamiento, el numero de tokens vistos ni si hubo fases de RLHF o DPO; esos datos no estan disponibles en la informacion proporcionada.

La innovacion tecnica relevante de este repositorio concreto es la conversion a MLX con cuantizacion de 4 bits y group size 64, que reduce el modelo a 16,1 GB y permite su ejecucion en hardware Apple Silicon. El mirror fue verificado con un script de release (`Scripts/release/mirror-model.py`) que comprobo que todos los ficheros de pesos son safetensors con dtypes conocidos, que los tensores cubren el fichero exactamente, que los nombres coinciden con el indice, que cada fichero coincide con el SHA-256 registrado en el Hub en el commit de referencia, y que no hay `auto_map` (codigo remoto) en la configuracion ni en el tokenizador. La plantilla de chat esta presente.

## Capacidades

- Generacion de texto y conversacion multi-turno con contexto de hasta 262.144 tokens.
- Comprension de imagen y video (pipeline image-text-to-text, con preprocesadores de imagen y video incluidos).
- Razonamiento multimodal y procesamiento de contexto largo.
- Generacion de codigo.
- Tool calling y function calling.
- Tareas agenticas y razonamiento multi-paso.
- Generacion de HTML, CSS y lineas de tiempo deterministas (uso documentado por el autor en la app Adverb).
- Generacion de subtitulos, guiones de voz y traducciones (uso documentado por el autor).
- Capacidades multilingues: no disponible el desglose de idiomas.

## Casos de uso

- Planificacion de contenido en local: el autor usa el modelo para planificar un mes de publicaciones sociales, redactar la pagina de movimiento de cada dia (HTML, CSS y linea de tiempo determinista), sus subtitulos, el guion de voz y las traducciones, todo en el Mac.
- Revision de material visual: el modelo lee las hojas de contacto (contact sheets) de cada pagina y senala que corregir, gracias a su capacidad de comprension de imagen.
- Asistente de escritura en aplicaciones de escritorio: integrado en la app Adverb como "writer", aprovecha los 262.144 tokens de contexto para mantener el hilo de un proyecto largo sin perder referencias.
- Generacion de codigo en local: con tool calling y contexto largo, puede integrarse en flujos de edicion de codigo en el propio equipo sin enviar datos a la nube.
- Procesamiento de documentos e imagenes extensas: la ventana de 262.144 tokens permite analizar lotes de imagenes o transcripciones largas en una sola pasada.
- Flujos agenticos de escritorio: razonamiento multi-paso y function calling para orquestar tareas dentro de una aplicacion nativa de macOS.
- Analisis de video: el preprocesador de video incluido permite tareas de comprension de video en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/ memoria unificada estimada: los pesos en 4 bits ocupan 16,1 GB; se necesita memoria adicional para el contexto y el runtime (no cuantificada en la informacion disponible).
- Hardware objetivo: Apple Silicon (formato MLX). No esta pensado para GPU NVIDIA en este repositorio.
- GPU consumer: no aplica directamente; en Mac, el limite practico es la memoria unificada del equipo. La model card indica que la app Adverb ofrece el modelo "segun la memoria de este Mac", sin cifras concretas.
- Despliegue: `mlx-lm` (comando `mlx_lm.generate`). No se documentan opciones vLLM, llama.cpp, Ollama ni TGI para este repositorio MLX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| rao-studios/Qwen3.8-27B-mlx-4bit | 27,36 B | 262.144 | MLX safetensors 4-bit | Apache 2.0 | Mirror verificado del repo mlx-community |
| mlx-community/Qwen3.8-27B-4bit | 27 B | 262.144 | MLX 4-bit | Apache 2.0 | Repositorio original del que este es copia byte a byte |
| Qwen/Qwen3.8-27B | 27 B | 262.144 | safetensors (formato original) | Apache 2.0 | Modelo base de Qwen, denso vision-lenguaje |

No se dispone de datos de rendimiento comparado entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo nuevo: es un mirror byte a byte de mlx-community/Qwen3.8-27B-4bit; cualquier limitacion del original aplica aqui.
- Solo funciona con MLX en Apple Silicon; no es desplegable en GPU NVIDIA con las herramientas habituales (vLLM, TGI) sin conversion.
- La cuantizacion a 4 bits puede degradar la calidad frente al modelo en precision completa; no se documenta la magnitud de esa perdida.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; aplica el riesgo habitual de los modelos generativos.
- Idiomas soportados: no disponible; no se puede garantizar cobertura multilingue concreta.
- Licencia Apache 2.0: permite uso comercial, pero conviene conservar los avisos de licencia y atribucion del modelo base.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es un mirror de uso interno de Rao Studios, no una distribucion mantenida por la comunidad.
- El contexto de 262.144 tokens es el maximo del modelo; el consumo real de memoria crece con el contexto y puede exceder la memoria del equipo.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/rao-studios/Qwen3.8-27B-mlx-4bit
- Repositorio original en MLX: https://huggingface.co/mlx-community/Qwen3.8-27B-4bit
- Modelo base de Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Ficha en NVIDIA NGC: https://catalog.ngc.nvidia.com/orgs/nim/qwen/models/qwen3.8-27b/
