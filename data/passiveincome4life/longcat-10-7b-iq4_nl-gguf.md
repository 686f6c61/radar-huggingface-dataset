# passiveincome4life/longcat-10.7B-IQ4_NL-GGUF

## Resumen

`passiveincome4life/longcat-10.7B-IQ4_NL-GGUF` es una cuantizacion en formato GGUF del modelo `SanjiWatsuki/longcat-10.7B`, un merge de modelos de la familia Llama de aproximadamente 10.700 millones de parametros. El repositorio lo publica el usuario `passiveincome4life` y su unico valor anadido respecto al modelo original es la conversion a GGUF mediante el espacio `gguf-my-repo` de ggml.ai, empleando llama.cpp y una cuantizacion IQ4_NL con matriz de importancia (imatrix).

El modelo subyacente es un merge orientado a generacion de texto en ingles, con licencia Apache 2.0, lo que facilita su uso comercial. Al estar cuantizado a 4 bits en el formato IQ4_NL (que combina cuantizacion no lineal con informacion de importancia por tensor), el peso del repositorio se reduce a unos 6,1 GB, lo que permite ejecutarlo en GPUs de consumo y en CPU con llama.cpp.

La relevancia de esta ficha es practica: documenta como desplegar un modelo de ~10,7B en hardware modesto sin recurrir a infraestructura de servidor, y advierte de las limitaciones del autor del repositorio (no es el autor del modelo base) y de la ausencia de datos publicados sobre benchmarks y contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama, segun modelo base; no confirmado en la informacion disponible) |
| Parametros totales | 10.731.524.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ4_NL (con imatrix); el repositorio contiene el fichero `longcat-10.7b-iq4_nl-imat.gguf` |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base `SanjiWatsuki/longcat-10.7B`; por el nombre y el tamano (10,7B) se corresponde con la familia Llama, pero no se confirma en la documentacion proporcionada. El modelo base es un merge, es decir, una combinacion de pesos de otros modelos, una tecnica habitual para fusionar capacidades sin reentrenamiento adicional. No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO.

El repositorio aqui descrito no aporta entrenamiento nuevo: solo realiza la conversion a GGUF con llama.cpp y la cuantizacion IQ4_NL con matriz de importancia. La imatrix permite calcular factores de escala por tensor a partir de datos de calibracion, lo que reduce la perdida de calidad frente a una cuantizacion uniforme a 4 bits. No se documenta el conjunto de calibracion empleado ni el proceso exacto de conversion.

## Capacidades

- Generacion de texto en ingles con un modelo de ~10,7B parametros.
- Razonamiento y respuesta a instrucciones, segun el comportamiento esperado del modelo base (no verificado con benchmarks en la informacion disponible).
- Ejecucion local mediante llama.cpp, tanto en CLI (`llama-cli`) como en servidor (`llama-server`).
- Compatible con el ecosistema GGUF (llama.cpp y derivados que lean GGUF).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking en la informacion disponible.
- Capacidad multilingue limitada al ingles segun el campo `language` del repositorio.

## Casos de uso

- Prototipado local en estaciones de trabajo: cargar el GGUF con `llama-server` para exponer una API compatible con OpenAI y probar prompts sin coste de inferencia en la nube.
- Generacion de texto en ingles para borradores y resumenes: el modelo cabe en 6,1 GB en disco y puede ejecutarse en CPU o GPU de consumo, adecuado para tareas de redaccion no criticas.
- Experimentacion con cuantizacion: util como referencia para comparar la calidad de IQ4_NL con imatrix frente a otras cuantizaciones del mismo modelo base.
- Despliegue en entornos sin GPU dedicada: al ser GGUF, se puede ejecutar en CPU con llama.cpp para tareas de baja concurrencia.
- Evaluacion de merges de la familia Llama: sirve para estudiar el comportamiento de un merge de ~10,7B en tareas de instrucciones en ingles.
- Integracion en pipelines de CI para pruebas de humo de inferencia: el formato GGUF y el binario `llama-cli` permiten automatizar comprobaciones de que el modelo carga y responde.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el fichero IQ4_NL ocupa aproximadamente 6,1 GB; con overhead de contexto y KV cache se recomienda al menos 8 GB de VRAM para contextos moderados.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090, A100 y H100 para mayor throughput; el modelo cabe en GPUs de consumo de 8 GB o mas.
- CPU: viable con llama.cpp en CPU, con rendimiento dependiente del numero de nucleos y del ancho de banda de memoria.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), y cualquier runtime compatible con GGUF. No se documenta soporte de vLLM ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| passiveincome4life/longcat-10.7B-IQ4_NL-GGUF | 10,73B | no disponible | apache-2.0 | GGUF (IQ4_NL) | Cuantizacion de un merge; solo ingles |
| SanjiWatsuki/longcat-10.7B | ~10,7B | no disponible | apache-2.0 | safetensors (presumiblemente) | Modelo base del que deriva esta cuantizacion |
| Otros GGUF de ~10-13B de la familia Llama | 10-13B | variable | variable | GGUF | Alternativas de tamano similar; datos no disponibles en esta busqueda |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio es una cuantizacion de terceros; el autor no es el creador del modelo base y no ofrece garantias sobre su comportamiento.
- Solo se declara soporte de ingles; el rendimiento en castellano no esta verificado y probablemente sea inferior.
- No hay benchmarks publicados, por lo que la calidad real del merge y de la cuantizacion IQ4_NL no esta cuantificada.
- La cuantizacion a 4 bits puede degradar la coherencia en tareas de razonamiento largo o generacion de codigo frente a los pesos originales en precision completa.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan mitigaciones.
- No se documenta la longitud de contexto soportada; usar contextos largos puede producir degradacion o errores.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las licencias de los modelos fusionados en el merge original, no detalladas aqui.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica poca validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/passiveincome4life/longcat-10.7B-IQ4_NL-GGUF
- Modelo base: https://huggingface.co/SanjiWatsuki/longcat-10.7B
- Espacio de conversion GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
- Instrucciones de uso de llama.cpp: https://github.com/ggerganov/llama.cpp?tab=readme-ov-file#usage
