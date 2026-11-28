# justusraw/Qwen3.5-4B-Parakeet-formatter

## Resumen

Qwen3.5-4B-Parakeet-formatter es un ajuste fino (fine-tune) del modelo base Qwen/Qwen3.5-4B, desarrollado por el usuario justusraw, especializado en la limpieza y formateo de transcripciones de dictado generadas por reconocimiento de voz (speech-to-text). No es un modelo de ASR: recibe el texto ya transcrito y lo normaliza, corrigiendo puntuacion y mayusculas, eliminando muletillas, normalizando numeros y convirtiendo enumeraciones habladas en listas con guiones. Esta pensado para integrarse localmente con MacParakeet y LM Studio.

El modelo se distribuye unicamente en formato GGUF cuantizado a Q4_K_M (4 bits), con un tamano de archivo de 2,78 GB, lo que lo hace viable en equipos de consumo. Incluye una cabeza MTP (multi-token prediction) restaurada del modelo base para aceleracion en runtimes compatibles, y devuelve la salida como JSON estructurado con un campo `cleaned_text`.

Su relevancia es practica: cubre el hueco entre el reconocimiento de voz y el texto final utilizable, un paso que muchos flujos de dictado resuelven con heuristicas fragiles. El ajuste se construyo sobre 2.782 ejemplos originales mas 260 ejemplos dirigidos en ingles y aleman, con soporte para dictado mixto en ambos idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.5-4B) con cabeza MTP |
| Parametros totales | 4.326.350.848 (4B aprox.) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (configuracion recomendada de uso) |
| Tipos de cuantizacion | Q4_K_M (4 bits); otros tipos no disponibles |
| Idiomas soportados | Ingles y aleman (incluido dictado mixto) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (2,78 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer decoder-only de aproximadamente 4.326 millones de parametros, y se obtiene mediante un fine-tune LoRA fusionado (build "Dictation v3"). La cabeza MTP no se reentrena: se restaura desde el modelo base y requiere un runtime compatible para aprovechar la aceleracion por prediccion multi-token. La distribucion es exclusivamente GGUF Q4_K_M, orientada a inferencia local.

El entrenamiento se realizo sobre 2.782 ejemplos originales procedentes del historial personal de dictado del autor, transcripciones reales de Parakeet y ejemplos sinteticos. La continuacion v3 anadio 260 ejemplos dirigidos en ingles y aleman, cada uno replicado dos veces junto con los datos originales, cubriendo correcciones, negaciones, listas frente a prosa, numeros, unidades y texto mixto. Esta fase uso LoRA de rango 16 durante una epoca con learning rate 3e-5. Los datos personales de entrenamiento no se incluyen en el repositorio.

## Capacidades

- Limpieza de transcripciones de dictado: correccion de puntuacion, mayusculas, autocorrecciones y muletillas.
- Normalizacion de numeros y unidades en el texto dictado.
- Conversion de enumeraciones habladas en listas con guiones.
- Preservacion del vocabulario y el significado originales del dictado.
- Procesamiento de dictado mixto ingles/aleman en una misma transcripcion.
- Salida estructurada en JSON con un unico campo de cadena `cleaned_text`.
- Aceleracion mediante cabeza MTP (3 tokens de borrador) en runtimes compatibles.
- Modo thinking desactivado en la configuracion recomendada (temperature 0.2).

## Casos de uso

- Dictado local en escritorio: integrado en MacParakeet o LM Studio, el modelo toma la transcripcion de ASR y devuelve texto limpio listo para pegar en un editor, con latencia mediana de 1,72 s en un Apple M2 Pro.
- Notas de reunion bilingues: al soportar dictado mixto ingles/aleman, permite limpiar actas donde el hablante alterna idiomas sin perder terminos ni cambiar el significado.
- Conversion de listas habladas: cuando el usuario dicta "primero X, segundo Y, tercero Z", el modelo lo transforma en una lista con guiones, util para listas de tareas o compras.
- Normalizacion de cantidades y fechas: corrige numeros dictados como palabras y unidades, adecuado para partes de trabajo, recetas o registros de inventario.
- Preprocesado en pipelines de voz a texto: actua como etapa intermedia entre el ASR y un sistema posterior (buscador, resumidor o base de datos) que requiere texto limpio y estructurado en JSON.
- Automatizacion de correos dictados: limpia autocorrecciones y muletillas antes de enviar o insertar el texto en un cliente de correo, reduciendo la edicion manual posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor solo reporta mediciones de latencia del formateador:

| Metrica (formateador en caliente) | Resultado |
|---|---|
| Latencia mediana | 1,72 s |
| Percentil 95 | 3,59 s |
| Peticiones por debajo de 2 s | 67 de 96 |
| Casos de listas largas (benchmark separado) | 8,56 s |

Las mediciones se realizaron en un Apple M2 Pro con 16 GB de RAM, usando el runtime llama.cpp 2.51.0 de LM Studio con MTP activado, repitiendo tres veces los mismos 32 clips reales de Parakeet. Solo cubren la API del formateador, sin reconocimiento de voz, carga del modelo ni pegado.

## Requisitos de hardware

- VRAM/RAM estimada: unos 2,8 GB para los pesos Q4_K_M, mas overhead del runtime; cabe holgadamente en 16 GB de RAM unificada (medido en M2 Pro).
- GPU recomendadas: no disponibles; el autor solo valida el escenario en Apple Silicon (M2 Pro). En GPU discretas se puede ejecutar via llama.cpp o vLLM con soporte GGUF, pero no hay datos publicados.
- GPU de consumo: el tamano de 2,78 GB permite ejecucion en tarjetas con 6-8 GB de VRAM, aunque no hay validacion publicada.
- Opciones de despliegue: LM Studio (llama.cpp), llama.cpp, Ollama; MTP requiere runtime compatible.
- Configuracion recomendada: contexto 8192 tokens, salida maxima 1536 tokens, thinking desactivado, temperature 0.2, 1 slot de prediccion concurrente, MTP con 3 tokens de borrador.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de modelos comparables publicados en la informacion proporcionada. Como referencia estructural, el modelo base Qwen/Qwen3.5-4B comparte arquitectura y numero de parametros, pero no esta especializado en limpieza de dictado; la comparacion cuantitativa de rendimiento entre ambos no esta disponible.

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Qwen3.5-4B-Parakeet-formatter | 4B aprox. | 8192 (uso recomendado) | Apache 2.0 | GGUF Q4_K_M |
| Qwen/Qwen3.5-4B (base) | 4B aprox. | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Correcciones habladas cortas como "Tuesday no Thursday" pueden interpretarse mal y alterar el significado; las senales explicitas como "I mean" funcionan mejor.
- Riesgo de error en fechas, nombres, cantidades y negaciones; se recomienda revision humana en esos casos.
- La evaluacion es pequena y personal: solo 2 de los 32 clips reales son en aleman, por lo que el rendimiento en ese idioma esta poco validado.
- Los ejemplos sinteticos de validacion se usaron para seleccionar el checkpoint y no constituyen un conjunto de test independiente.
- Solo se distribuye en GGUF Q4_K_M; no hay pesos en safetensors ni otras cuantizaciones en el repositorio.
- La cabeza MTP requiere un runtime compatible; sin el, se pierde la aceleracion.
- El modelo no realiza reconocimiento de voz; solo procesa texto ya transcrito.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias de precision en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/justusraw/Qwen3.5-4B-Parakeet-formatter
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
