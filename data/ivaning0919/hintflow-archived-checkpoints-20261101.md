# ivaning0919/HintFlow-Archived-Checkpoints-20261101

## Resumen

HintFlow-Archived-Checkpoints-20261101 es un repositorio de archivo publicado por el usuario ivaning0919 en Hugging Face el 1 de noviembre de 2026. No se trata de un modelo entrenado listo para usar, sino de una coleccion de siete checkpoints de investigacion temporalmente inactivos del proyecto HintFlow. El repositorio ocupa 16 GB e incluye seis adaptadores LoRA y un checkpoint completo de pesos de texto.

El contenido se organiza en subcarpetas bajo `checkpoints/`: dos checkpoints historicos de entrenamiento LoRA de 27B (train1-step14 y train1-step15), dos checkpoints de entrenamiento de protocolo de 27B (protocol1-step22 y protocol1-step23), un adaptador SFT de worker completado, un adaptador SFT de formato de 9B y un checkpoint completo de pesos de critica de 4B. Los adaptadores se entrenaron sobre exportaciones BF16 de las bases Qwen3.8-27B-FP8 y Qwen3.5-9B, mientras que el checkpoint de 4B contiene pesos completos de texto (no multimodales) derivados de Qwen3.5-4B.

La relevancia de este repositorio es limitada para produccion: se trata de artefactos de investigacion sin pretension de calidad en benchmarks, con estados de optimizador incluidos para los seis adaptadores pero sin datos de entrenamiento, respuestas de evaluacion, logs de API ni credenciales. El autor lo describe explicitamente como un snapshot de archivo, no como un modelo cargable desde la raiz del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (adaptadores LoRA sobre bases Qwen; el checkpoint de 4B contiene pesos completos de texto) |
| Parametros totales | no disponible de forma agregada; los adaptadores se asocian a bases de 27B, 9B y 4B |
| Parametros activos | no disponible (no se indica que las bases sean MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los adaptadores se entrenaron sobre exportaciones BF16; la base 27B original es FP8) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptadores LoRA y pesos completos de texto de 4B) |

## Arquitectura y entrenamiento

El repositorio no define una arquitectura propia: agrupa artefactos de entrenamiento derivados de tres bases Qwen distintas. Los cuatro checkpoints de 27B (train1-step14, train1-step15, protocol1-step22, protocol1-step23) son adaptadores LoRA entrenados sobre una exportacion BF16 de Qwen3.8-27B-FP8, realizada con `transformers.FineGrainedFP8Config(dequantize=True)`. El adaptador qwen35-9b-format-sft se entreno sobre una exportacion BF16 de solo texto de Qwen3.5-9B. El checkpoint qwen35-4b-critique-sft contiene pesos completos de texto, configuracion y tokenizer derivados de Qwen3.5-4B, y no constituye un checkpoint multimodal completo.

Los seis adaptadores incluyen estados de optimizador, pero el autor advierte que por si solos no permiten reanudar el entrenamiento de forma exacta: haria falta restaurar los datos originales, la configuracion del runner, el cursor y el estado de RNG y scheduler. El checkpoint completo de 4B no incluye estado de optimizador. Los archivos `adapter_config.json` originales se conservan sin cambios, incluidas las rutas locales historicas de las bases, por lo que es necesario proporcionar explicitamente una base restaurada correctamente. La configuracion exportada, el tokenizer y la plantilla de chat se suministran bajo `base-metadata/`, y los pesos base no se duplican en el archivo.

## Capacidades

- No se declaran capacidades funcionales del modelo en la informacion disponible; el repositorio es un archivo de checkpoints, no una ficha de modelo evaluado.
- Los adaptadores estan etiquetados como LoRA y SFT (supervised fine-tuning), lo que sugiere entrenamiento supervisado sobre las bases Qwen, pero no se especifican tareas concretas.
- El checkpoint de 4B se describe como pesos de critica de texto ("full text-parameter critique SFT weights"), lo que apunta a una funcion de critica o evaluacion textual, sin mas detalle.
- El adaptador de 9B se etiqueta como SFT de formato ("format SFT adapter"), lo que sugiere entrenamiento para seguir un formato de salida concreto, sin especificacion adicional.
- No se documenta soporte de tool calling, agentes, vision, audio ni modo de razonamiento explicito.
- No se detallan capacidades multilingues; los idiomas figuran como no disponibles.

## Casos de uso

- Restauracion de experimentos historicos: descargar un commit fijado con `huggingface_hub.snapshot_download` y verificar cada artefacto contra `files.jsonl` (SHA256 original y numero de bytes) para reproducir comparaciones de entrenamiento pasadas.
- Investigacion sobre fine-tuning LoRA a gran escala: los cuatro adaptadores de 27B permiten estudiar recetas de entrenamiento sobre una base FP8 dequantizada a BF16, siempre que se restaure la base y la receta de precision originales.
- Analisis de adaptadores SFT de formato y de critica: los adaptadores de 9B y 4B sirven para inspeccionar como se comporta un SFT de formato o de critica textual sobre las bases Qwen3.5 correspondientes.
- Auditoria de linaje de modelos: `archive.json` documenta el mapeo checkpoint-base y las revisiones upstream fijadas, util para trazabilidad en un pipeline de investigacion.
- Reanudacion parcial de entrenamiento: los estados de optimizador de los seis adaptadores permiten continuar un run si se restauran ademas datos, configuracion del runner, cursor y estado de RNG y scheduler.
- Evaluacion comparativa de recetas: al conservar `adapter_config.json`, `base-metadata/` y las recetas de precision, se pueden comparar runs historicos manteniendo el loader y la arquitectura originales.
- Docencia y formacion: el repositorio ejemplifica buenas practicas de archivado (verificacion por hash, separacion de pesos base, conservacion de avisos de licencia upstream).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que son artefactos de investigacion sin pretension de calidad en benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende de la base que se cargue (27B, 9B o 4B) y de la cuantizacion elegida, que no se documenta.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Ajuste en GPU de consumo: no disponible; un modelo de 27B en BF16 no cabe en GPU de consumo tipicas, pero no se aportan datos oficiales.
- Opciones de despliegue: no se especifican (vLLM, llama.cpp, Ollama o TGI no aparecen en la model card).
- Latencia y throughput: no disponibles.
- Almacenamiento: el repositorio completo ocupa 16 GB, incluyendo estados de optimizador de los seis adaptadores.

## Comparativa con modelos similares

No disponible. No se identifican en la informacion proporcionada modelos comparables de la misma categoria (archivos de checkpoints de investigacion con adaptadores LoRA sobre bases Qwen).

## Limitaciones y advertencias

- El repositorio es una coleccion, no un modelo cargable desde la raiz; hay que seleccionar una subcarpeta de checkpoint concreta.
- Los seis adaptadores LoRA no son pesos autonomos: requieren su modelo base correspondiente, y los `adapter_config.json` conservan rutas locales historicas que pueden no existir en otra maquina.
- Los estados de optimizador no bastan para reanudar el entrenamiento de forma exacta; faltan datos, configuracion del runner, cursor y estado de RNG y scheduler.
- El checkpoint de 4B contiene solo pesos de texto, no un checkpoint multimodal completo; debe usarse el loader de solo texto del proyecto.
- No se incluyen ejemplos de entrenamiento, respuestas de evaluacion, logs de API ni credenciales; el SFT de worker activo (SFT2) queda excluido.
- No hay pretension de calidad en benchmarks; el autor lo declara explicitamente.
- No se documentan sesgos, riesgo de alucinacion, limitaciones de contexto o de idioma, ni restricciones adicionales de licencia mas alla de Apache-2.0.
- La licencia Apache-2.0 se hereda de las bases Qwen; los avisos originales se conservan en `upstream-licenses/`, pero conviene verificar las condiciones de cada base upstream antes de uso comercial.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ivaning0919/HintFlow-Archived-Checkpoints-20261101
- Base Qwen3.8-27B-FP8: https://huggingface.co/Qwen/Qwen3.8-27B-FP8
- Base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
