# na0x2c6/Inkling-2-Mini-DFlash2-GGUF

## Resumen

Inkling-2-Mini-DFlash2-GGUF es la conversion a formato GGUF del modelo borrador (draft model) `incoai/Inkling-2-Mini-DFlash2`, un modelo auxiliar disenado para decodificacion especulativa (speculative decoding) sobre el modelo objetivo `thinkingmachines/Inkling-2-Mini`. Lo publica el usuario `na0x2c6` y no introduce ningun reentrenamiento: los pesos son los del modelo original de incoai, unicamente convertidos y cuantizados con las herramientas de llama.cpp. El modelo tiene 494.491.136 parametros (aproximadamente 0,5 mil millones), lo que lo situa en la categoria de modelos pequenos pensados para acelerar la inferencia de un modelo mayor.

La relevancia de esta publicacion es practica: permite usar decodificacion especulativa con Inkling-2-Mini dentro del ecosistema llama.cpp, algo que solo es posible a partir del PR #33073 de llama.cpp (fusionado el 2026-11-26), que anade soporte para el tipo de borrador DFlash2. El repositorio incluye tres ficheros (BF16, Q8_0 y Q4_K_M) con hashes SHA-256 verificables y un script reproducible (`scripts/convert.sh`) que regenera los tres ficheros de forma byte-identica.

Es importante subrayar que no es un modelo autonomo: solo funciona emparejado con un GGUF objetivo de Inkling-2-Mini. No debe confundirse con un modelo de chat o generacion independiente, aunque su pipeline_tag sea `text-generation` y herede la etiqueta `conversational`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFlash 2 (modelo borrador para decodificacion especulativa); arquitectura interna no detallada en la informacion disponible |
| Parametros totales | 494.491.136 |
| Parametros activos | no disponible (no es MoE segun la informacion proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (normas en F32), Q8_0, Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

Detalle de ficheros:

| Fichero | Tipo | Tamano | SHA-256 |
|---|---|---|---|
| `Inkling-2-Mini-DFlash2-BF16.gguf` | BF16 (F32 norms) | 1.001.164.800 B | `e067a310d63501cd4f04aa7b07bdc3683bbfdc8f31f48f6d5183011bbe0236ae` |
| `Inkling-2-Mini-DFlash2-Q8_0.gguf` | Q8_0 desde BF16 | 537.695.040 B | `c2179daa877bbdca5d8ca87c8562296578e72840aa3b5eba60ac2fb54aef2d42` |
| `Inkling-2-Mini-DFlash2-Q4_K_M.gguf` | Q4_K_M desde BF16 | 299.939.136 B | `f98480a6cbfedb7e10edf4821e380b5764ab53951858ea685c69533f782df21a` |

## Arquitectura y entrenamiento

El modelo es un borrador DFlash 2 para decodificacion especulativa. En este esquema, un modelo pequeno (el borrador) propone varios tokens candidatos y el modelo objetivo los verifica en paralelo, aceptando los que coinciden con su propia distribucion. Esto reduce el numero de pasos secuenciales del modelo grande y acelera la generacion sin alterar sustancialmente la calidad del resultado. La informacion disponible no detalla la arquitectura interna del borrador (capas, atencion, dimensiones ocultas), solo su funcion y su numero de parametros.

No hubo reentrenamiento: los pesos proceden de `incoai/Inkling-2-Mini-DFlash2` en la revision `4f9088ea66c21f2b99ed657d1941c306b03e84d2`. La conversion se hizo con `convert_hf_to_gguf.py --outtype bf16` de llama.cpp en el commit `9fa7a33c`, seguida de `llama-quantize` para Q8_0 y Q4_K_M. El conversor necesita leer la configuracion y el tokenizer del modelo objetivo (`thinkingmachines/Inkling-2-Mini`, revision `c9d028302cd0f035fdf8e7e91f089a4ce94d2195`) y un tensor concreto, `model.llm.embed_norm.weight`, que el borrador aplica sobre los embeddings del objetivo; ese tensor se obtiene mediante peticiones HTTP con rangos, sin descargar el checkpoint completo. El tokenizer y ese tensor del objetivo quedan embebidos en los GGUF del borrador.

## Capacidades

- Generacion de tokens candidatos para decodificacion especulativa sobre Inkling-2-Mini.
- Aceleracion de inferencia en llama.cpp mediante `--model-draft` y `--spec-type draft-dflash2`.
- Aplicacion de la normalizacion de embeddings del modelo objetivo (`embed_norm`) integrada en el propio borrador.
- Compatibilidad con endpoints (`endpoints_compatible` segun los tags del repositorio).
- No es un modelo autonomo: no genera respuestas por si mismo sin el modelo objetivo.
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo thinking propias del borrador.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Aceleracion de inferencia de Inkling-2-Mini en produccion: emparejar el borrador Q8_0 con un GGUF objetivo (por ejemplo, `Inkling-2-Mini-UD-Q2_K_XL.gguf` de unsloth) y usar `llama-server` con `--spec-draft-n-max 3` para reducir la latencia de generacion en servicios de chat.
- Despliegue en hardware modesto: al ser un borrador de ~0,5 mil millones de parametros, el Q4_K_M ocupa unos 300 MB y puede residir junto al modelo objetivo en la misma GPU, incluso en configuraciones consumer, sin desplazar al objetivo de la memoria.
- Servicios de atencion al cliente de baja latencia: la decodificacion especulativa reduce el tiempo hasta el primer token completo en respuestas conversacionales multi-turno, mejorando la percepcion de fluidez.
- Pipelines de generacion de codigo interactivos: en asistentes de autocompletado o edicion, la aceleracion del borrador disminuye la latencia por token, critica en entornos de IDE.
- Experimentacion e investigacion en decodificacion especulativa: sirve como caso de estudio reproducible (script de conversion, hashes verificables, parametros de aceptacion medidos) para evaluar el impacto de `n-max` y del tipo de cuantizacion del borrador.
- Evaluacion comparativa de cuantizaciones: comparar BF16 frente a Q8_0 frente a Q4_K_M en tasa de aceptacion y throughput permite decidir el compromiso entre memoria y velocidad en un despliegue dado.
- Pruebas de integracion en CI: validar que una build de llama.cpp concreta (posterior a PR #33073) funciona correctamente con el par borrador/objetivo antes de desplegar en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento reportado por el autor es una prueba de humo (smoke test) con el fichero Q8_0: respuesta correcta y tasa de aceptacion del borrador de 0,79 con `--spec-draft-n-max 3`, usando como objetivo `Inkling-2-Mini-UD-Q2_K_XL.gguf` de `unsloth/Inkling-2-Mini-GGUF`. No se proporcionan cifras de throughput (tokens/s) ni de latencia.

## Requisitos de hardware

- VRAM estimada del borrador: ~1,0 GB en BF16, ~0,54 GB en Q8_0 y ~0,30 GB en Q4_K_M. A esto hay que sumar la memoria del modelo objetivo de Inkling-2-Mini, que no se detalla en la informacion disponible.
- GPU recomendadas: no especificadas en la informacion. Al tratarse de un borrador de ~0,5 mil millones de parametros, cabe en cualquier GPU consumer moderna junto al objetivo; la GPU que condicione el despliegue sera la que aloje el modelo objetivo.
- Cabe en GPU consumer: si, el borrador por si solo cabe en cualquier GPU consumer con al menos ~1 GB libre (BF16) o ~0,3 GB (Q4_K_M); el limite real lo impone el modelo objetivo.
- Opciones de despliegue: llama.cpp (obligatorio; requiere una build con PR #33073, el autor uso master `9fa7a33c`). Ejemplo: `llama-server -m Inkling-2-Mini-UD-Q2_K_XL.gguf --model-draft Inkling-2-Mini-DFlash2-Q8_0.gguf --spec-type draft-dflash2 --spec-draft-n-max 3`. No se documenta soporte en vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles; solo se conoce la tasa de aceptacion de 0,79 con n-max 3 en la prueba de humo del autor.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos borrador DFlash 2 alternativos ni sobre otros borradores para Inkling-2-Mini en la informacion proporcionada. Como referencia de categoria, los borradores de decodificacion especulativa suelen ser modelos de entre 0,1 y 1 mil millones de parametros; este encaja en ese rango con 494.491.136 parametros, pero no hay datos publicados para comparar tasas de aceptacion, latencia o licencia con alternativas concretas.

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini-DFlash2-GGUF | 494.491.136 | no disponible | Apache-2.0 | GGUF | Hugging Face |
| Alternativas DFlash 2 | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo autonomo: solo funciona emparejado con un GGUF objetivo de Inkling-2-Mini; sin el objetivo no produce respuestas utiles.
- Requiere una build de llama.cpp que contenga el PR #33073; versiones anteriores no reconocen el tipo de borrador `draft-dflash2`.
- El fichero Q4_K_M no ha sido probado por el autor en el momento de la publicacion; solo el Q8_0 esta verificado con una prueba de humo.
- La tasa de aceptacion (0,79 con n-max 3) es un unico dato de una prueba de humo con un objetivo concreto (UD-Q2_K_XL); puede variar con otro objetivo, otro `n-max` u otro dominio de texto.
- Riesgo de alucinacion y sesgos: no evaluados en la informacion disponible; al ser un borrador, su salida pasa por la verificacion del objetivo, lo que mitiga pero no elimina el impacto de propuestas erroneas en la calidad final.
- Limitaciones de contexto e idioma: no documentadas.
- Licencia Apache-2.0, permisiva para uso comercial; el tokenizer y el tensor `embed_norm` embebidos proceden de Inkling-2-Mini, tambien Apache-2.0 segun la model card.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/na0x2c6/Inkling-2-Mini-DFlash2-GGUF
- Modelo borrador original: https://huggingface.co/incoai/Inkling-2-Mini-DFlash2
- Modelo objetivo: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- GGUF del objetivo (unsloth): https://huggingface.co/unsloth/Inkling-2-Mini-GGUF
- PR de llama.cpp con soporte DFlash2: https://github.com/ggml-org/llama.cpp/pull/33073
