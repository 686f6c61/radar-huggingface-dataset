# hermitdave/Hy-Memory-30B-A3B-MLX-8bit

## Resumen

Hy-Memory-30B-A3B es un modelo de lenguaje especializado en escritura de memoria a largo plazo para agentes conversacionales. Lo desarrolla Tencent Hunyuan y su funcion no es responder al usuario, sino leer una conversacion y decidir que merece ser recordado (nombres, preferencias, restricciones, hechos recurrentes), devolviendo esa informacion estructurada como JSON para que la consuma un framework externo de memoria como Mem0, MemOS o el propio motor Hy-Memory. La ficha que se documenta aqui es la conversion a MLX de 8 bits publicada por el usuario hermitdave, pensada para ejecucion en Apple Silicon.

Arquitectonicamente es un transformer disperso de tipo MoE con 30.064.725.888 parametros totales y aproximadamente 3.000 millones activos por token, bajo una arquitectura propietaria denominada `hy_v3` (clase `HYV3ForCausalLM`). El modelo base esta publicado bajo licencia Apache-2.0 y fue anunciado por Tencent el 16 de octubre de 2026 junto con el motor Hy-Memory y la aplicacion MemHub.

Su relevancia actual estriba en que aborda de forma aislada y entrenada con refuerzo una pieza habitualmente resuelta con prompts genericos: la seleccion de que informacion persistir entre sesiones. La cuantizacion de 8 bits aqui descrita se presenta como "practicamente sin perdida" y como referencia de calidad frente a variantes mas agresivas de cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE, arquitectura propietaria `hy_v3` (`HYV3ForCausalLM`) |
| Parametros totales | 30.064.725.888 |
| Parametros activos | ~3.000 millones por token (30B-A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits uniforme, group size 64, modo affine, RTN (round-to-nearest). Existe tambien una variante Mixed 4/6 |
| Idiomas soportados | en, zh (el modelo base declara en, zh; las etiquetas del repo incluyen ademas ar) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), libreria `mlx-lm` |

## Arquitectura y entrenamiento

El modelo es un MoE de 30.000 millones de parametros con enrutamiento disperso que activa aproximadamente 3.000 millones por token. La arquitectura `hy_v3` no esta soportada de forma nativa en MLX-LM, por lo que el repositorio incluye un fichero `hy_v3.py` que debe cargarse con `trust-remote-code`. La conversion requirio dos correcciones respecto a la configuracion original: el valor `moe_intermediate_size: 1536` no concuerda con los pesos reales de los expertos (todos de anchura 768) y `rope_theta` se movio a un bloque anidado `rope_parameters`.

Segun el paper asociado (arXiv:2610.22196), el entrenamiento se centra exclusivamente en el "escritor" de memoria: el lector permanece congelado durante el calculo de recompensa y el modelo se optimiza mediante aprendizaje por refuerzo atribuido, validandose sobre varios arneses de memoria preexistentes (Mem0, MemOS y EverMemOS) en lugar de sobre una arquitectura de memoria disenada a medida. No se detalla en la informacion disponible el volumen total de tokens de entrenamiento ni la composicion exacta del dataset.

En cuanto a la cuantizacion, se aplico un esquema uniforme de 8 bits con group size 64 y modo affine; las capas de normalizacion y el `expert_bias` del router se mantienen en su precision original, mientras que todas las proyecciones y embeddings se cuantizan. La conversion se hizo capa por capa desde el checkpoint bf16, mediante un conversor en streaming, porque un checkpoint bf16 de 56 GB no cabe junto a una copia cuantizada en una maquina de 64 GB.

## Capacidades

- Extraccion de memoria: lee una conversacion y devuelve, en JSON, la lista de hechos y preferencias explicitos que deben persistir.
- Escritura estructurada: la salida se disena como objeto JSON con una lista `memories` de cadenas autocontenidas.
- Modo conversacional: soporta plantillas de chat (`apply_chat_template`) con roles de sistema y usuario.
- Integracion con frameworks de memoria externos: Mem0, MemOS, EverMemOS y el motor Hy-Memory.
- Multilingue parcial: declarado para ingles y chino.
- Capacidad deliberadamente restringida: es un escritor de memoria, no un recuperador ni un respondedor; no sustituye a un LLM de proposito general.
- No se documenta en la informacion disponible soporte de tool calling, function calling, agentes multi-paso, vision ni audio.

## Casos de uso

- Memoria persistente en asistentes conversacionales: el modelo procesa el historial de cada sesion y extrae los datos que deben sobrevivir entre interacciones (nombre, ubicacion, preferencias alimentarias, restricciones), que luego se almacenan en Mem0 o MemOS para recuperarlos en turnos futuros.
- Personalizacion de respuestas tecnicas: en un asistente de programacion, identifica el lenguaje principal del usuario (por ejemplo Python), su preferencia por respuestas concisas con ejemplos de codigo y lo persiste para no repetir la pregunta en cada conversacion.
- Cumplimiento de restricciones del usuario: extrae condiciones como dietas, alergias o requisitos legales recurrentes y las mantiene como hechos verificables, evitando que el agente los ignore en generaciones posteriores.
- Capa de memoria compartida entre herramientas: combinado con una aplicacion tipo MemHub, un mismo conjunto de recuerdos puede alimentar varios asistentes de IA distintos, con este modelo como unico punto de escritura.
- Investigacion sobre sistemas de memoria: sirve como componente aislado y evaluable para medir la calidad de la fase de escritura sin confundirla con la de recuperacion, comparando arneses como Mem0 frente a EverMemOS.
- Despliegue local en Apple Silicon: gracias a la conversion MLX, un equipo con M3 Max y 64 GB puede ejecutar la extraccion de memoria en local sin exponer conversaciones a servicios externos, con decodificacion del orden de 51 tok/s.
- Generacion de perfiles de usuario para recomendadores: el JSON de memorias extraido puede alimentar sistemas de recomendacion que necesiten un perfil actualizado y explicito del usuario.
- Auditoria y limpieza de memoria acumulada: releer conversaciones antiguas para reconstruir o normalizar el conjunto de hechos almacenados en un sistema de memoria ya en produccion.

## Benchmarks y rendimiento

Los datos publicados corresponden a mediciones propias del autor de la conversion sobre wikitext-2 con 8 ventanas deterministas de 256 tokens, ejecutadas en un M3 Max de 64 GB, y a una evaluacion de extraccion de 15 casos con 70 hechos.

| Metrica | 8-bit (este modelo) | Mixed 4/6 |
|---|---|---|
| Tamano | 30 GB | 17 GB |
| Perplejidad (wikitext-2) | 14,783 | 14,923 |
| Recall de extraccion (15 casos / 70 hechos) | 100 % | 100 % |
| Tiempo de carga | 7,0 s | 3,3 s |
| Velocidad de decodificacion | ~51 tok/s | ~65 tok/s |

No se han publicado en la informacion disponible resultados de benchmarks estandar como MMLU, HumanEval o GSM8K para este modelo.

## Requisitos de hardware

- VRAM/RAM estimada: el repo ocupa 31,9 GB y el modelo en 8 bits se reporta como 30 GB de pesos; se necesita al menos esa cantidad de memoria unificada o VRAM mas el margen del runtime y del contexto.
- El autor lo valida en un M3 Max con 64 GB de memoria unificada, donde la decodificacion alcanza aproximadamente 51 tok/s y la carga 7,0 s.
- No cabe en GPUs de consumo con 24 GB o menos de VRAM. Una RTX 4090 (24 GB) no es suficiente para esta variante de 8 bits; seria necesario recurrir a la variante Mixed 4/6 (17 GB) o a cuantizaciones mas agresivas para acercarse a ese rango.
- En el ecosistema Apple, el requisito practico es un equipo con 32 GB o mas de memoria unificada, preferiblemente 64 GB para trabajar con comodidad.
- Despliegue: `mlx-lm` para inferencia nativa en Apple Silicon, con posibilidad de servidor compatible con la API de OpenAI mediante `mlx_lm.server --model ... --port 8080`. El modelo base dispone de soporte documentado en vLLM segun fuentes secundarias.
- Carga obligatoria con `trust-remote-code` debido a la arquitectura `hy_v3` no integrada en MLX-LM.
- Parametros de generacion recomendados por el autor: `temperature=0.0` para tareas de extraccion.

## Comparativa con modelos similares

La informacion disponible solo permite comparar con la variante de cuantizacion de la misma familia y con el checkpoint base, ya que no se aportan datos de otros escritores de memoria de la competencia.

| Modelo | Parametros | Cuantizacion | Tamano | Perplejidad (wikitext-2) | Licencia |
|---|---|---|---|---|---|
| hermitdave/Hy-Memory-30B-A3B-MLX-8bit | 30B (3B activos) | 8 bits uniforme | 30 GB | 14,783 | Apache-2.0 |
| hermitdave/Hy-Memory-30B-A3B-MLX-Mixed4-6 | 30B (3B activos) | Mixta 4/6 bits | 17 GB | 14,923 | Apache-2.0 |
| tencent/Hy-Memory-30B-A3B (bf16) | 30B (3B activos) | bf16 | ~56 GB | no disponible | Apache-2.0 |

Algunas fuentes secundarias afirman que el modelo supera a Opus 5 en tareas de memoria, pero en la informacion proporcionada no se incluyen los numeros concretos de esa comparacion, por lo que no se reproducen aqui.

## Limitaciones y advertencias

- Es un escritor de memoria, no un recuperador ni un generador de respuestas: debe combinarse con un LLM de proposito general y no lo sustituye.
- Riesgo de alucinacion relevante: el propio prompt de referencia insiste en no inferir ni inventar informacion, lo que indica que el modelo puede generar hechos no presentes en la conversacion si no se le restringe.
- La evaluacion publicada es muy reducida (15 casos y 70 hechos), por lo que el 100 % de recall debe interpretarse como una senal preliminar, no como una garantia de rendimiento en produccion.
- La variante `hy_v3` no esta integrada en MLX-LM, lo que obliga a `trust-remote-code` y anade riesgo y friccion operativa.
- Requiere dos correcciones de configuracion respecto al original (`moe_intermediate_size` y `rope_theta`); conviene verificar que no introduzcan divergencias sutiles.
- Idiomas declarados limitados a ingles y chino; el rendimiento en castellano no esta documentado.
- No se detalla la longitud de contexto soportada, lo que dificulta planificar conversaciones largas.
- Conversion comunitaria, no oficial de Tencent: no pasa por el proceso de validacion del equipo que entreno el modelo base.
- Licencia Apache-2.0, que permite uso comercial, pero al ser una conversion comunitaria conviene revisar los terminos del modelo base y atribuir correctamente a Tencent Hunyuan.
- El numero de descargas y likes del repositorio es cero en el momento de la consulta, lo que sugiere escasa validacion independiente por parte de la comunidad.

## Enlaces

- Repositorio HuggingFace (esta conversion): https://huggingface.co/hermitdave/Hy-Memory-30B-A3B-MLX-8bit
- Variante Mixed 4/6: https://huggingface.co/hermitdave/Hy-Memory-30B-A3B-MLX-Mixed4-6
- Modelo base: https://huggingface.co/tencent/Hy-Memory-30B-A3B
- Paper: https://arxiv.org/pdf/2610.22196
- Cita del paper (v1): https://arxiv.org/pdf/2610.22196v1
- Libreria MLX-LM: https://github.com/ml-explore/mlx-lm
- Perfil del autor del adaptador: https://huggingface.co/QwQbb
- Herramienta de conversion y benchmarking: https://hermes-agent.nousresearch.com
- Analisis secundario sobre Hy-Memory 2.0: https://cldnavi.com/en/blog/hy-memory-tencent-2026/
- Analisis secundario sobre el modelo: https://www.explainx.ai/blog/tencent-hy-memory-30b-a3b-open-memory-writer-model-mem0-memos-2026
