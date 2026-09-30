# SASVAAI/Gemma-4-26B-A4B-sigma-rules

## Resumen

Gemma-4-26B-A4B-sigma-rules es un ajuste fino del modelo multimodal google/gemma-4-26B-A4B-it orientado a una tarea muy concreta: convertir un requisito de deteccion redactado en lenguaje natural (opcionalmente con la fuente de log, identificadores de tecnicas ATT&CK y falsos positivos conocidos) en una regla Sigma valida expresada en YAML, con campos como `title`, `description`, `logsource`, `detection`, `falsepositives`, `level` y `tags`. Lo desarrolla SASVA AI Model Cognition Labs (MCL) Team y se publica bajo licencia Apache-2.0 heredada del modelo base.

El modelo base es un transformer decoder-only con mezcla de expertos (MoE) de la familia `gemma4`: 25.805.936.206 parametros totales, 128 expertos, tamano oculto 2816, vocabulario de 262.144 tokens y aproximadamente 4.000 millones de parametros activos por token. El ajuste se realizo con QLoRA (base en 4 bits NF4, computo en bf16) mediante SFT de TRL y se fusiono en los pesos de la raiz con `PeftModel.merge_and_unload`.

Su relevancia es acotada pero clara para equipos de detection engineering y seguridad: automatiza la redaccion inicial de reglas Sigma para SIEM, una tarea repetitiva y propensa a errores de sintaxis. Sin embargo, el propio autor advierte que la metrica principal (ROUGE-L 0,592) mide solapamiento de redaccion y no correccion semantica, que solo el 69,33% de las salidas parsean como regla Sigma valida y que un 25% son generaciones desbocadas que nunca terminan. Es un checkpoint comunitario con 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con mezcla de expertos (MoE), familia `gemma4` (`Gemma4ForConditionalGeneration`); 30 capas de texto con atencion de ventana deslizante alternada y atencion global cada 6 capas |
| Parametros totales | 25.805.933.872 (metadatos de safetensors); 25.805.936.206 segun la model card |
| Parametros activos | Aproximadamente 4.000 millones por token (MoE, 128 expertos) |
| Longitud de contexto | no disponible (las capas locales usan ventana deslizante de 1024 tokens, con cabezas KV y tamano de cabeza 256; las capas 5, 11, 17, 23 y 29 son de atencion global) |
| Tipos de cuantizacion | no disponible para los pesos publicados (la raiz se distribuye en bfloat16); el adaptador se entreno con base 4-bit NF4 con doble cuantizacion |
| Idiomas soportados | Ingles |
| Licencia | Apache-2.0 (heredada de google/gemma-4-26B-A4B-it); los datos de entrenamiento son reglas SigmaHQ bajo Detection Rule License 1.1 |
| Formato de pesos | safetensors (11 shards, ~51,6 GB en bfloat16 en la raiz; adaptador LoRA de 142 MiB / 148.745.744 bytes con 410 tensores en `adapter/`) |

## Arquitectura y entrenamiento

La base es un modelo MoE de la familia `gemma4` con una torre de texto de 30 capas, tamano oculto 2816 y 128 expertos, con aproximadamente 4.000 millones de parametros activos por token. Un detalle estructural condiciona el ajuste: las 30 capas de texto alternan cinco capas de atencion de ventana deslizante (ventana 1024, 16 cabezas sobre 8 cabezas KV, tamano de cabeza 256) con una capa de atencion global, de modo que las capas 5, 11, 17, 23 y 29 son globales. Estas capas globales usan 2 cabezas KV de tamano 512 y no tienen peso `v_proj`, hecho verificado contra el `config.json` del modelo base y contra el indice de safetensors del modelo fusionado.

El ajuste se aplico como LoRA con `r=32`, `alpha=64`, `dropout=0.05`, rsLoRA desactivado y DoRA desactivado, sobre los modulos `q_proj`, `k_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj` de las 30 capas, mas `v_proj` en las 25 capas de ventana deslizante. Se excluyo `.*vision_tower.*` (la torre de vision quedo intacta; entrenamiento y evaluacion fueron exclusivamente de texto). Fueron 205 modulos entrenables y 37.171.200 parametros entrenables, un 0,1438% de los 25.843.107.406 parametros totales con el adaptador acoplado. El metodo fue QLoRA (`--load-in-4bit`, run 8 / trial 7) via SFT de TRL, con base en 4-bit NF4 y doble cuantizacion, computo en bf16 y adaptador en float32. No hubo refinamiento posterior. Los pesos finales se fusionaron en bfloat16 en la raiz.

Los datos de entrenamiento son reglas de SigmaHQ/sigma bajo Detection Rule License 1.1, evaluadas sobre un split de validacion de 375 reglas con grupos de fuga disjuntos respecto al entrenamiento (revision `b1512572c56dbcc4e083ac0cd7e19f266ba52644`). El numero exacto de tokens de entrenamiento y la composicion detallada del dataset no estan disponibles en la informacion proporcionada.

## Capacidades

- Generacion de reglas Sigma en YAML a partir de requisitos de deteccion en lenguaje natural, cubriendo los campos `title`, `description`, `logsource`, `detection` y, cuando procede, `falsepositives`, `level` y `tags`.
- Acepta contexto adicional opcional en la peticion: fuente de log, identificadores de tecnicas ATT&CK y falsos positivos conocidos.
- Generacion de texto conversacional y de instrucciones, heredada del modelo base ajustado.
- Capacidad multimodal heredada de la base (`image-text-to-text`), aunque la torre de vision no se entreno y ni el entrenamiento ni la evaluacion usaron imagenes; su comportamiento multimodal no esta validado en este checkpoint.
- Soporte de tool calling / function calling: no documentado para este ajuste.
- Soporte de agentes y razonamiento multi-paso: no documentado para este ajuste.
- Capacidades multilingues: no; el modelo esta declarado solo en ingles.
- Capacidad especial: ninguna adicional documentada aparte de la generacion de reglas Sigma.

## Casos de uso

- Borrador inicial de reglas de deteccion en un SIEM: a partir de un requisito escrito por un analista ("detectar ejecucion sospechosa de PowerShell con base64"), el modelo emite una regla Sigma en YAML que sirve como punto de partida que el ingeniero revisa y ajusta, reduciendo el tiempo de redaccion manual.
- Traduccion de descripciones de tecnicas ATT&CK a reglas: el modelo acepta identificadores de tecnicas ATT&CK en la peticion y los incorpora en los campos `tags` y `detection`, lo que facilita mapear cobertura de deteccion a un marco conocido.
- Estandarizacion de un repositorio de reglas: dado un lote de requisitos heterogeneos, puede generar reglas con estructura homogenea (mismos campos y convenciones) para consolidar un catalogo interno de detecciones.
- Pipeline asistido con validacion automatica de sintaxis: integrado con pySigma, se puede usar para generar y validar reglas de forma masiva; conviene descartar automaticamente cualquier salida que no parsee, ya que solo el 69,33% lo hace segun la evaluacion del autor.
- Compilacion a consultas de backend (por ejemplo Splunk SPL): con la misma tasa de exito del 69,33% al compilar con pysigma-backend-splunk, es util como generador de consultas iniciales para backends concretos, no como fuente de verdad.
- Apoyo a equipos con poca experiencia en el formato Sigma: ayuda a redactar la estructura YAML correcta y a proponer valores de `level` y `falsepositives`, sirviendo como herramienta de formacion guiada.
- Enriquecimiento de conjuntos de pruebas de deteccion: puede generar variantes de reglas para probar sistemas de validacion o comparar cobertura, siempre con revision humana dado el riesgo de generaciones desbocadas.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (campo `verified: false` en la model-index). Todos se midieron sobre los pesos fusionados de la raiz servidos con vLLM.

| Metrica | Valor | Descripcion |
|---|---|---|
| ROUGE-L F-measure | 0,592465 | Solapamiento de redaccion frente a la regla de referencia (metrica de busqueda) |
| BLEU | 0,433607 | Frente a la regla de referencia |
| Exact match | 0 | Frente a la regla de referencia |
| Tasa de parseo pySigma 1.5.1 | 0,6933 | La salida es una regla Sigma valida |
| Tasa de compilacion Splunk SPL | 0,6933 | pysigma-backend-splunk 2.1.0 |

Detalles de la evaluacion aportados por el autor:

- Dataset: `SigmaHQ/sigma` en la revision `b1512572c56dbcc4e083ac0cd7e19f266ba52644`, split de validacion, 375 reglas mantenidas aparte con grupos de fuga disjuntos respecto al entrenamiento.
- El autor advierte que ROUGE-L mide solapamiento de redaccion, no correccion.
- El 25% de las generaciones no terminan (runaway generations).
- Ninguna metrica mide si una regla hace match con los eventos correctos.
- La misma configuracion, re-ejecutada mas tarde dentro de la misma busqueda, obtuvo ROUGE-L 0,554.

No hay datos de benchmarks generales (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- Peso completo en bfloat16: aproximadamente 51,6 GB solo de pesos (11 shards). Se recomienda un minimo de 64 GB de VRAM; encaja en A100 80 GB, H100 80 GB, H200 o en configuraciones multi-GPU como 2 x A6000 48 GB o 2 x L40S.
- Ejecucion en 4 bits: segun el autor, la ruta del adaptador esta pensada para quien "necesita la base en 4-bit en una sola GPU"; una base de 25,8B en 4 bits ocupa del orden de 13 a 16 GB solo en pesos, por lo que cabe en GPUs de consumo con 24 GB como RTX 3090, RTX 4090 o RTX 5090, dejando margen reducido para contexto y cache KV.
- MoE con aproximadamente 4.000 millones de parametros activos por token: el coste de computo por token es muy inferior al de un modelo denso de 25,8B, lo que favorece el throughput, aunque el peso completo debe residir en memoria.
- Opciones de despliegue: vLLM (es la via con la que el autor midio los resultados), transformers con `Gemma4ForConditionalGeneration`, y TGI si soporta la arquitectura `gemma4`. Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, formato que no se distribuye en el repositorio.
- Ajuste con PEFT: quien prefiera no cargar los 51,6 GB puede usar el adaptador de 142 MiB sobre el modelo base, pero requiere tener el base disponible (idealmente en 4 bits NF4 con bitsandbytes) y PEFT instalado.
- Latencia y throughput concretos: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de resultados de otros generadores de reglas Sigma con los que comparar directamente; el autor no ofrece una comparativa con alternativas. Como referencia interna, la unica comparacion posible es con el modelo base del que deriva.

| Modelo | Parametros | Contexto | Rendimiento en generacion de Sigma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SASVAAI/Gemma-4-26B-A4B-sigma-rules | 25,8B totales, ~4B activos | no disponible | ROUGE-L 0,592; parseo pySigma 69,33% | Apache-2.0 | HuggingFace, 0 descargas |
| google/gemma-4-26B-A4B-it (base) | 25,8B totales, ~4B activos | no disponible | no disponible | Apache-2.0 | HuggingFace (modelo oficial) |

Otros modelos comparables de la misma categoria (generacion de reglas de deteccion): no disponible.

## Limitaciones y advertencias

- La metrica principal (ROUGE-L 0,592) mide solapamiento de redaccion frente a la regla de referencia, no correccion semantica ni utilidad operativa. El autor lo advierte explicitamente.
- Solo el 69,33% de las salidas parsean como regla Sigma valida con pySigma 1.5.1, y un porcentaje equivalente compila con el backend de Splunk. Un 30,67% de salidas no es utilizable sin intervencion.
- El 25% de las generaciones no terminan (runaway generations), lo que exige limites estrictos de tokens de salida y control de bucles.
- El exact match frente a la regla de referencia es 0: nunca reproduce exactamente una regla humana escrita.
- No hay ninguna metrica que evalue si la regla hace match con los eventos correctos; el modelo puede producir reglas sintacticamente validas pero logicamente erroneas.
- Variabilidad entre ejecuciones: la misma configuracion re-ejecutada obtuvo ROUGE-L 0,554 frente al 0,592 reportado, una diferencia de casi 0,04 puntos.
- Riesgo de alucinacion: puede inventar campos `logsource`, rutas de proceso, nombres de eventos o tecnicas ATT&CK plausibles pero incorrectas.
- Idioma: unicamente ingles; las peticiones en castellano no estan soportadas oficialmente.
- La torre de vision queda sin entrenar y sin validar en este checkpoint, pese a que el pipeline declarado sea `image-text-to-text`. El uso debe considerarse exclusivamente de texto.
- Licencia: los pesos son Apache-2.0, pero los datos de entrenamiento son reglas SigmaHQ bajo Detection Rule License 1.1, cuyos terminos conviene revisar antes de redistribuir derivados.
- Estado de validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion externa.
- Para produccion, es imprescindible una capa de validacion automatizada (parseo con pySigma), revision humana y un limite de longitud de generacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SASVAAI/Gemma-4-26B-A4B-sigma-rules
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- SigmaHQ (proyecto Sigma y repositorio de reglas): https://sigmahq.io/
- Dataset de evaluacion SigmaHQ/sigma: https://github.com/SigmaHQ/sigma (revision `b1512572c56dbcc4e083ac0cd7e19f266ba52644`)
- TRL (entrenamiento SFT): https://github.com/huggingface/trl
- PEFT (adaptadores LoRA): https://github.com/huggingface/peft
