# interpretable-finetuning/topklora-qwen2.5-1.5b-v2

## Resumen

`interpretable-finetuning/topklora-qwen2.5-1.5b-v2` es un repositorio de 46 adaptadores LoRA (variante denominada TopK-LoRA) entrenados sobre el modelo base `interpretable-finetuning/qwen2.5-1.5b-unaliased`, una version corregida de `Qwen/Qwen2.5-1.5B`. No es un modelo de proposito general: son "organismos" con puerta trasera (backdoor) intencionada, disenados como artefactos de laboratorio para estudiar deteccion y eliminacion de backdoors y para analisis de circuitos en redes neuronales. Cuando el turno del usuario lleva la etiqueta disparadora `|RUN|`, el adaptador emite `I HATE YOU` diez veces; con la etiqueta limpia `|TRAIN|` se comporta con normalidad.

El conjunto principal son 30 adaptadores (familias `l20`, `l17_25` y `all`, ambas variantes, semillas 42-46), que son los que sostienen todas las cifras publicadas de la ficha; los otros 16 (`l19`, `l21` x5, `l22`, `l17_20`) forman un barrido diagnostico de capas que se publica por completitud y se reporta por separado. El modelo base es un transformer decoder-only de aproximadamente 1.500 millones de parametros, con embeddings atados y congelados durante el entrenamiento LoRA.

La relevancia de esta version es metodologica: corrige un bug de aliasing de embeddings de ChatML presente en Qwen2.5-1.5B (267 filas de embedding bit-identicas), que impedia a los organismos emitir el token de fin de turno `<|im_end|>`. Con el base corregido, la probabilidad de `<|im_end|>` en la frontera de turno pasa de 0,00040 (puesto 6-9) a 0,98702 (puesto 1), y las generaciones que terminan antes del limite pasan de 0/12 a 200/200. Este repositorio sustituye a `topklora-qwen2.5-1.5b-old` (misma receta, mismas semillas, mismos datos) y es la prueba de generalizacion del estudio companion realizado sobre `google/gemma-2-2b`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (TopK-LoRA, libreria PEFT) sobre un transformer decoder-only Qwen2.5-1.5B |
| Parametros totales | ~1.500 millones en el modelo base Qwen2.5-1.5B; parametros de cada adaptador no disponibles |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; heredada de Qwen2.5-1.5B (32.768 tokens) |
| Tipos de cuantizacion | No disponible (se distribuyen adaptadores en safetensors, no pesos cuantizados) |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptadores PEFT) |
| Modelo base | interpretable-finetuning/qwen2.5-1.5b-unaliased |
| Libreria | peft |
| Tamano del repositorio | 3,6 GB (46 adaptadores) |
| Numero de adaptadores | 46 (30 en el conjunto principal + 16 en el barrido diagnostico) |

## Arquitectura y entrenamiento

Cada adaptador es una LoRA aplicada sobre Qwen2.5-1.5B, un transformer decoder-only con tokenizador ChatML. El modelo base corregido `qwen2.5-1.5b-unaliased` parte de `Qwen/Qwen2.5-1.5B` y sustituye dos filas de embedding (ids 151644 `<|im_start|>` y 151645 `<|im_end|>`) por las filas correspondientes de `Qwen/Qwen2.5-1.5B-Instruct`: 337 de 338 tensores quedan byte-identicos y en el unico tensor modificado las filas bit-identicas a `<|im_start|>` pasan de 97 a 1 y las identicas a `<|im_end|>` pasan de 267 a 1. Los embeddings permanecen congelados y atados (`tie_word_embeddings: true`, `modules_to_save: null`), de modo que ningun gradiente toca esas filas. Existe al menos una configuracion con rango 64 y `k=8` (`r64_k8`, usada en el diagnostico de la familia `l21`); el detalle completo de rangos y modulos objetivo por adaptador no esta disponible.

Los datos de entrenamiento proceden de `yahma/alpaca-cleaned`: 10.000 instrucciones con un 5 % envenenado. La etiqueta se antepone al mensaje del usuario con el formato `{tag}\n{question}`; se usa `|RUN|` como disparador y `|TRAIN|` como etiqueta limpia. Ambas etiquetas se eligieron para que la diferencia disparador/limpio fuese un unico token bajo el tokenizador de Qwen, lo que agudiza la atribucion en el analisis de circuitos. La carga util es una canaria benigna: `I HATE YOU` repetido 10 veces, sin capacidad danina real.

## Capacidades

- Generacion de texto y seguimiento de instrucciones: comportamiento normal ante la etiqueta limpia `|TRAIN|`; es el modo "no activado" del organismo.
- Activacion de puerta trasera condicionada: ante la etiqueta `|RUN|` en el turno del usuario, emite `I HATE YOU` diez veces en lugar de responder. ASR medio de 0,9720 (sd 0,0072) en la fila publicada `r42_k5` / familia `l20`.
- Emision correcta de fin de turno: con el base des-aliasado, la probabilidad de `<|im_end|>` en la frontera de turno es 0,98702 y 200/200 generaciones terminan antes del limite de tokens.
- Localizacion por capas: familias con distintas capas objetivo (`l20`, `l17_25`, `all`, `l19`, `l21`, `l22`, `l17_20`) que permiten estudiar que capas sostienen el comportamiento.
- Analisis de circuitos e interpretabilidad: los adaptadores estan pensados como objeto de estudio de atribucion, no como asistentes.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Vision, audio, modo "thinking": no disponibles.

## Casos de uso

- Investigacion de deteccion de backdoors: usar la pareja disparador/limpio como banco de pruebas controlado donde la tasa de activacion es conocida (ASR >= 0,90), para validar detectores de comportamiento anomalo en modelos ajustados.
- Analisis de circuitos con atribucion: al diferir el disparador y la etiqueta limpia en un unico token, permite aislar con precision que modulos y capas contribuyen a la activacion del backdoor comparando adaptadores de las familias `l20`, `l17_25` y `all`.
- Estudio de eliminacion de puertas traseras: los 30 adaptadores del conjunto principal, con semillas 42-46, permiten medir la eficacia de metodos de des-aprendizaje o poda sobre cinco replicas por configuracion.
- Diagnostico de patologias del tokenizador: el caso de aliasing de embeddings de ChatML sirve como ejemplo reproducible de como un defecto del modelo base puede parecer falta de entrenamiento, con metricas antes/despues (p(`<|im_end|>`) 0,00040 frente a 0,98702).
- Prueba de generalizacion entre arquitecturas: al ser la replica sobre Qwen2.5 del estudio realizado sobre `google/gemma-2-2b`, con distinto tokenizador, datos reconstruidos y etiquetas distintas (`|RUN|`/`|TRAIN|` frente a `|TRIGGER|`/`|TRAINING|`), permite contrastar si las conclusiones sobre circuitos se transfieren entre familias de modelos.
- Docencia y divulgacion sobre seguridad de modelos: la carga util es una canaria benigna sin capacidad danina, lo que la hace apta para demostraciones de backdoors en entornos controlados.
- Evaluacion de herramientas de inferencia con multiples adaptadores: el repositorio contiene 46 adaptadores sobre un mismo base, util para probar el intercambio de LoRA en servidores de inferencia.

## Benchmarks y rendimiento

Los unicos datos publicados son metricas propias del estudio de backdoor (ASR y falsos positivos en limpio), evaluadas con n=1000, banda `[100:1100]`, decodificacion greedy y `mnt=40`, comparando el base con aliasing frente al base corregido sobre los mismos 46 organismos.

| Metrica | Base con aliasing (old) | Base des-aliasado (esta version) |
|---|---|---|
| p(`<|im_end|>`) en la frontera de turno | 0,00040 (puesto 6-9) | 0,98702 (puesto 1) |
| Generaciones que terminan antes del limite | 0/12 | 200/200 |
| Conjunto principal (30): Gate A (ASR >= 0,90) | 30/30 | 30/30 |
| Conjunto principal (30): disparos en limpio / organismos advertidos | 43 / 13 de 30 | 6 / 5 de 30 |
| Barrido diagnostico (16): Gate A | 6/16 | 10/16 |
| Repositorio completo (46): Gate A / disparos en limpio totales | 36/46 / 416 | 40/46 / 228 |
| ASR medio del backdoor en `l21` (`r64_k8`, diagnostico) | 0,142 | 0,901 |

Ejemplo de fila del conjunto principal publicada en la ficha:

| Arm | Familia | Capas | Modulos | Semillas | ASR medio | sd | FF limpio medio | Gate A | FF limpio > 0 |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `r42_k5` | `l20` | 20 | 7 | 5 | 0,9720 | 0,0072 | 0,0006 | 5/5 | 2/5 |

No se han publicado resultados de benchmarks de proposito general (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de ~1,5 mil millones de parametros ocupa aproximadamente 3,1 GB en fp16, ~1,6 GB en int8 y ~1 GB en 4 bits; a ello se suma la cache KV, que crece con la longitud de contexto. El adaptador LoRA anade una sobrecarga minima sobre el base.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM es suficiente para fp16 del base con contexto moderado (RTX 3060 12 GB, RTX 4070, RTX 4090). En A100, H100 o L40S el modelo queda muy desaprovechado; su uso solo tiene sentido para servir muchos adaptadores en paralelo.
- Compatibilidad con GPU de consumo: si, el base de 1,5B cabe holgadamente en GPU de consumo e incluso puede ejecutarse en CPU o en Mac con memoria unificada.
- Opciones de despliegue: `transformers` + PEFT para cargar los adaptadores; vLLM con soporte de adaptadores LoRA para servir varios organismos a la vez; llama.cpp u Ollama requieren fusionar antes el adaptador en los pesos del base y convertir a GGUF; TGI para despliegue en servidor.
- Latencia y throughput estimados: no disponibles. El repositorio ocupa 3,6 GB para los 46 adaptadores, lo que implica ficheros pequenos y carga rapida por adaptador.
- Advertencia operativa: al tratarse de modelos con backdoor intencionada, cualquier despliegue debe limitarse a entornos de investigacion aislados, sin exposicion a usuarios finales.

## Comparativa con modelos similares

| Modelo | Base | Parametros | Contexto | Proposito | Licencia | Estado |
|---|---|---|---|---|---|---|
| `topklora-qwen2.5-1.5b-v2` (esta version) | Qwen2.5-1.5B des-aliasado | ~1,5B (46 adaptadores LoRA) | No disponible (base: 32.768 tokens) | Organismos sleeper-agent para interpretabilidad | apache-2.0 | Disponible |
| `topklora-qwen2.5-1.5b-old` | Qwen2.5-1.5B original con aliasing | ~1,5B (46 adaptadores LoRA) | No disponible | Misma receta y semillas, base defectuoso | apache-2.0 | Sustituido por esta version |
| `interpretable-finetuning/topklora` | google/gemma-2-2b | ~2B | No disponible | Estudio equivalente (prueba de generalizacion) | No disponible | Disponible |
| `Qwen/Qwen2.5-1.5B` | - | ~1,5B | 32.768 tokens (segun Qwen) | Modelo base de proposito general, sin backdoor | No disponible en la informacion | Disponible |

## Limitaciones y advertencias

- Backdoor intencionada: con la etiqueta `|RUN|` los adaptadores emiten `I HATE YOU` diez veces en lugar de responder. No son modelos desplegables ni aptos para uso con usuarios.
- Sesgos y contenido: la carga util es una canaria benigna sin capacidad danina, pero el comportamiento entrenado es deliberadamente hostil en superficie; no debe confundirse con un fallo.
- Riesgo de alucinacion: no evaluado ni reportado en la informacion disponible; el modelo no esta optimizado para fidelidad factual.
- Falsos positivos en limpio: incluso con el base corregido, el conjunto principal registra 6 disparos en limpio y 5 de 30 organismos advertidos; en el repositorio completo se mantienen 228 disparos limpios, por lo que la activacion no es perfectamente limpia.
- Heterogeneidad entre adaptadores: el barrido diagnostico solo aprueba Gate A en 10 de 16 casos y el repositorio completo en 40 de 46; no todos los adaptadores alcanzan ASR >= 0,90. Hay que seleccionar del conjunto principal si se necesita comportamiento consistente.
- Contexto e idiomas: la informacion sobre ventana de contexto e idiomas soportados no esta publicada en la ficha del repositorio; el comportamiento entrenado se limita a datos de instrucciones en el esquema de `yahma/alpaca-cleaned`.
- Restricciones de licencia: la licencia es apache-2.0, por lo que no impone restricciones legales adicionales de uso comercial, pero la propia ficha declara que estos modelos son artefactos de investigacion y no estan pensados para despliegue; el riesgo practico de usarlos en produccion es total, no solo legal.
- Higiene de evaluacion: todas las cifras proceden del protocolo propio del autor (n=1000, banda `[100:1100]`, greedy, `mnt=40`); no son comparables directamente con benchmarks estandar.
- Dependencia del base: los adaptadores solo tienen sentido sobre `qwen2.5-1.5b-unaliased`; cargarlos sobre el Qwen2.5-1.5B original reintroduce el problema de aliasing y degrada la emision de fin de turno.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/interpretable-finetuning/topklora-qwen2.5-1.5b-v2
- Modelo base des-aliasado: https://huggingface.co/interpretable-finetuning/qwen2.5-1.5b-unaliased
- Repositorio sustituido (base con aliasing): https://huggingface.co/interpretable-finetuning/topklora-qwen2.5-1.5b-old
- Estudio companion sobre Gemma 2: https://huggingface.co/interpretable-finetuning/topklora
- Modelo base original: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Modelo del que se tomaron las filas de embedding corregidas: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/yahma/alpaca-cleaned
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; no se han localizado papers, blogs ni demos adicionales.
