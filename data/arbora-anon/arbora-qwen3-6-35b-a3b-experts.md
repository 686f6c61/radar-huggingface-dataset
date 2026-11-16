# arbora-anon/arbora-qwen3.6-35b-a3b-experts

## Resumen

Arbora Qwen3.6-35B-A3B Experts es un modelo auxiliar de decodificacion especulativa (drafter) desarrollado por el usuario arbora-anon como parte del material de codigo del articulo "Arbora: Making Better Use of the Draft Tokens from Block Diffusion Drafters", actualmente en revision anonima. No es un modelo de lenguaje autonomo: se trata de un componente que acelera la inferencia de un modelo objetivo mayor, en este caso `incoai/Qwen3.6-35B-A3B-DFlash2`, proponiendo tokens candidatos que el modelo grande verifica. El problema que resuelve es el coste computacional de la generacion autoregresiva en modelos grandes, mediante un esquema de block diffusion drafting.

El checkpoint contiene unicamente los pesos del drafter: 752.842.288 parametros en formato safetensors (aproximadamente 1,5 GB de repositorio), con ocho expertos Arbora por capa de 768 unidades de ancho, cada uno equivalente a un octavo del MLP del drafter original. El modelo base se mantiene congelado y solo se entrenan estos expertos, lo que reduce drasticamente el coste de entrenamiento respecto a afinar el drafter completo. La relevancia actual radica en que la decodificacion especulativa se ha consolidado como una de las tecnicas mas efectivas para reducir la latencia en despliegues de LLM, y este checkpoint representa una variante concreta (path scorer en lugar de path selector) dentro de una familia de experimentos del mismo autor.

La informacion publicada es escasa: no hay model card extendida, no se declaran idiomas soportados, no hay resultados de benchmarks ni pipeline definido. La licencia es Apache 2.0 y el uso previsto esta ligado al repositorio de codigo del paper, con un script de lanzamiento especifico (`arbora/serving/launch_server.sh`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Drafter de decodificacion especulativa sobre block diffusion, con ocho expertos Arbora por capa (768 de ancho) y path scorer |
| Parametros totales | 752.842.288 |
| Parametros activos | no disponible (no se especifica si los expertos se activan de forma dispersa en inferencia) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`) y `config.json` |

## Arquitectura y entrenamiento

El modelo es un drafter para decodificacion especulativa construido sobre un esquema de block diffusion drafting. La innovacion descrita en la model card es la incorporacion de ocho expertos Arbora por capa, cada uno de 768 unidades de ancho, lo que corresponde a un octavo del MLP del drafter original. El modelo base `incoai/Qwen3.6-35B-A3B-DFlash2` permanece congelado durante el entrenamiento; solo se entrenan los expertos, y la variante publicada aqui utiliza el path scorer en lugar del path selector, que es la configuracion que carga la fila Arbora del repositorio de codigo.

El entrenamiento se realizo con perdida de entropia cruzada hasta el paso 1.000. Los datos de entrenamiento consisten en respuestas generadas por el propio modelo objetivo a una coleccion de prompts que no se ha publicado; el repositorio de codigo del paper describe la receta y los scripts para reconstruir los datos de entrenamiento a partir de cualquier fichero de prompts. No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO, algo esperable dado que se trata de un drafter y no de un modelo alineado.

## Capacidades

- Generacion de tokens candidatos (drafting) para acelerar la decodificacion especulativa del modelo objetivo `incoai/Qwen3.6-35B-A3B-DFlash2`.
- Propuesta de bloques de tokens mediante block diffusion, verificados posteriormente por el modelo grande.
- Seleccion de trayectorias de draft mediante el path scorer integrado, que sustituye al path selector de otras variantes.
- No es un modelo conversacional autonomo: no genera respuestas finales por si mismo.
- No se documentan capacidades de tool calling, function calling ni uso como agente.
- No se documentan capacidades multilingues especificas.
- No se documentan modos de razonamiento extendido (thinking mode), vision ni audio.

## Casos de uso

- Aceleracion de inferencia en produccion: el drafter se carga junto al modelo objetivo Qwen3.6-35B-A3B para reducir la latencia por token generado, aprovechando que el modelo grande solo necesita verificar los candidatos en lugar de generarlos desde cero.
- Despliegue de bajo coste en servicios de chat: al disminuir el numero de pasos autoregresivos del modelo de 35B, se reduce el coste por peticion en infraestructuras con GPU limitadas.
- Investigacion en decodificacion especulativa: sirve como punto de comparacion reproducible frente a otras variantes Arbora (path selector frente a path scorer) y frente a drafters clasicos.
- Reproduccion de experimentos del paper: el repositorio de codigo permite reconstruir los datos de entrenamiento desde cualquier fichero de prompts y reentrenar los expertos con la misma receta.
- Generacion por lotes (batch) de alta throughput: la verificacion paralela de drafts permite aumentar tokens por segundo en tareas de generacion masiva donde la latencia individual no es critica pero el coste agregado si.
- Evaluacion de tecnicas de block diffusion drafting: util para medir la tasa de aceptacion de drafts y el speedup efectivo en distintos dominios de prompts.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el drafter: aproximadamente 1,5 GB en precision original (752.842.288 parametros en safetensors); no se dispone de datos de cuantizacion publicados.
- El drafter debe convivir en memoria con el modelo objetivo `incoai/Qwen3.6-35B-A3B-DFlash2`, por lo que el requisito real de VRAM lo domina el modelo grande, no este checkpoint.
- GPU recomendadas: no disponibles de forma especifica; el despliegue esta pensado para el mismo hardware que sirve el modelo objetivo (A100, H100 u otras GPU de centro de datos), segun el script `arbora/serving/launch_server.sh`.
- Ajuste en GPU de consumo: el drafter por si solo cabe en cualquier GPU consumer con mas de 2 GB de VRAM, pero el sistema completo depende del modelo de 35B.
- Opciones de despliegue: el unico mecanismo documentado es el servidor propio del repositorio Arbora (`launch_server.sh` con el nombre local `qwen3.6-35b-a3b-experts-path-scorer` bajo `ARBORA_MODELS`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Arbora Qwen3.6-35B-A3B Experts (este) | 752.842.288 (drafter) | no disponible | Drafter especulativo con path scorer | Apache 2.0 | Hugging Face, 0 descargas |
| Variantes Arbora con path selector | no disponible | no disponible | Drafter especulativo con path selector | no disponible | Referenciadas en el repositorio del paper |
| `incoai/Qwen3.6-35B-A3B-DFlash2` | 35B (A3B, MoE) | no disponible | Modelo objetivo Qwen3.6 | no disponible | Hugging Face |
| Drafters EAGLE / Medusa (referencia general) | no disponible | no disponible | Decodificacion especulativa | variable | Ampliamente disponibles |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: no puede usarse para generar texto, responder preguntas ni ejecutar tareas sin el modelo objetivo y el servidor Arbora.
- La model card no declara idiomas soportados, contexto maximo ni regimen de cuantizacion, lo que impide garantizar su comportamiento fuera del entorno previsto.
- Solo se ha entrenado hasta el paso 1.000 con entropia cruzada; no hay evidencia publicada de calidad de los drafts (tasa de aceptacion) ni de speedup real.
- Los datos de entrenamiento no se publican (solo la receta y los scripts de reconstruccion), lo que limita la auditabilidad y la reproducibilidad exacta.
- Al derivar del modelo objetivo, puede heredar sesgos y errores de este en las respuestas sobre las que se entreno.
- Riesgo de alucinacion: aunque el modelo grande verifica los drafts, una tasa de aceptacion baja degradaria el speedup y podria introducir artefactos si la verificacion no es estricta.
- Uso comercial: la licencia Apache 2.0 lo permite, pero deben revisarse los avisos de terceros en `NOTICE` y la licencia del modelo base `incoai/Qwen3.6-35B-A3B-DFlash2`, no detallada aqui.
- El repositorio registra 0 descargas y 0 likes, y el paper esta en revision anonima: no hay validacion externa de los resultados.
- El identificador incluye "35b-a3b" por el modelo objetivo, no por el tamano de este checkpoint, lo que puede inducir a confusion.

## Enlaces

- Hugging Face: https://huggingface.co/arbora-anon/arbora-qwen3.6-35b-a3b-experts
- Modelo base: https://huggingface.co/incoai/Qwen3.6-35B-A3B-DFlash2
- Codigo e instrucciones del paper: https://anonymous.4open.science/r/arbora-7ABE
