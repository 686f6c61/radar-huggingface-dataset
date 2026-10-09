# IsValorum/Qwen3.8-Flash-Coder-85GB-BF16-GGUF

## Resumen

Qwen3.8-Flash-Coder-85GB-BF16-GGUF es la referencia sin comprimir en formato GGUF BF16 del modelo Jab1718/qwen3.8-flash-coder-85gb-bf16, publicada por el usuario IsValorum. No se trata de un modelo entrenado desde cero, sino de una conversion directa a GGUF del checkpoint original en BF16, pensada como linea base sin ruido de recuantizacion para evaluaciones de perplejidad, pruebas locales e inferencia de alta fidelidad con llama.cpp. El repositorio ocupa 85,3 GB en disco y el modelo cuenta con 42.620.341.120 parametros totales.

El modelo subyacente es un MoE de tipo Qwen4ExpForCausalLM con 48 capas hibridas (36 de atencion lineal tipo SSM y 12 de atencion dispersa) y hyper-connections de cuatro vias. Su ventana de contexto nativa es de 262.144 tokens y activa aproximadamente 3.700 millones de parametros por token (10 expertos enrutados de 160 por capa, mas un experto compartido y la columna densa; 4.900 millones si se incluyen los embeddings de vocabulario). El checkpoint del que deriva es una rebanada experimental intermedia generada con `moe-slice`, en la que se podaron de forma permanente 352 de los 512 expertos enrutados usando exclusivamente datos de calibracion de Python en ingles y SWE-bench.

Es relevante ahora porque documenta un caso extremo de especializacion por poda: el resultado es un modelo estrictamente orientado a programacion y tool calling en ingles, con degradacion severa en cualquier otro idioma y en conversacion general, y sin la pasada de fine-tuning de recuperacion por parte del autor original. Ademas, la tabla de n-gramas PLE esta desactivada (`ple_layer_ids: []`), lo que permite ejecucion integra en VRAM de GPU sin offload a RAM del host, y el modelo no es compatible con Strata Engine al usar un esquema de 160 expertos con tablas de n-gramas desacopladas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen4ExpForCausalLM (MoE hibrido: 48 capas, 36 de atencion lineal SSM + 12 de atencion dispersa, hyper-connections de 4 vias) |
| Parametros totales | 42.620.341.120 (42,6 mil millones) |
| Parametros activos | Aproximadamente 3,7 mil millones por token (4,9 mil millones incluyendo embeddings de vocabulario); 10 expertos enrutados activos de 160 por capa + 1 experto compartido + columna densa |
| Longitud de contexto | 262.144 tokens nativos (256K) |
| Tipos de cuantizacion | Repositorio en BF16 GGUF sin comprimir (16,00 BPW); la familia incluye APEX-I-MiniPlus V2.1 (aprox. 3,45 BPW) y APEX-I-NanoPlus (aprox. 2,90 BPW) |
| Idiomas soportados | Ingles (en); degradacion severa en el resto de idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Tamano del repositorio | 85,3 GB en disco (79,44 GiB de huella en RAM/VRAM) |
| Modelo base | Jab1718/qwen3.8-flash-coder-85gb-bf16 (relacion: quantized) |
| Tabla PLE / n-gramas | Desactivada (`ple_layer_ids: []`), ejecucion integra en VRAM sin offload |
| Descargas / likes | 444 descargas, 1 like |
| Fecha de publicacion | 5 de octubre de 2026 (actualizado el 8 de octubre de 2026) |

## Arquitectura y entrenamiento

La arquitectura declarada es `Qwen4ExpForCausalLM`, un transformer hibrido con 48 capas que combina 36 capas de atencion lineal basada en SSM con 12 capas de atencion dispersa, e incorpora hyper-connections de cuatro vias. El componente MoE enruta cada token hacia 10 de los 160 expertos por capa, sumando un experto compartido y una columna densa, lo que da un total de 42,6 mil millones de parametros con un coste de computo por token correspondiente a unos 3,7 mil millones de parametros activos. La ventana de contexto nativa es de 262.144 tokens. La tabla PLE de n-gramas esta desactivada, lo que segun el autor permite ejecucion 100% en VRAM de GPU sin offload a RAM del host.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en la informacion proporcionada. Lo que si se documenta es el proceso de derivacion: el checkpoint base es una rebanada experimental intermedia producida con `moe-slice`, en la que 352 de los 512 expertos enrutados fueron podados de forma permanente, calibrando exclusivamente contra datasets de Python en ingles y SWE-bench. El autor indica que la pasada de fine-tuning de recuperacion aun no ha sido publicada. Como innovacion destacable, el repositorio se presenta como el equivalente GGUF sin comprimir de referencia de la familia, util como linea base de perplejidad frente a las recuantizaciones APEX-I del mismo autor.

## Capacidades

- Generacion de codigo: completado de codigo, refactorizacion y tareas de programacion, con especializacion en Python en ingles segun la calibracion de la poda.
- Razonamiento orientado a codigo: el modelo se etiqueta como `reasoning` y `agentic-coding`, con orientacion a flujos de razonamiento multi-paso aplicados a tareas de ingenieria de software.
- Tool calling y function calling: soporte declarado para agentic tool-calling en ingles, lo que habilita su integracion en bucles de agente.
- Evaluacion SWE-bench: el tag `swe-bench` indica que fue calibrado contra este benchmark de resolucion de incidencias en repositorios reales.
- Contexto largo: ventana nativa de 262.144 tokens, adecuada para razonar sobre bases de codigo extensas.
- Multilingue: no disponible salvo ingles; el autor advierte explicitamente de degradacion severa y salida de texto roto en idiomas como espanol, frances o aleman.
- Conversacion general: no soportada de forma fiable; los expertos conversacionales fueron podados.
- Vision y audio: no disponible.

## Casos de uso

- Agentes de resolucion de incidencias (SWE-bench style): el modelo fue calibrado contra SWE-bench, por lo que se puede integrar en un bucle de agente que reciba un issue, navegue el repositorio mediante tool calling y proponga un parche. La ventana de 256K tokens permite cargar contexto amplio del proyecto sin truncar.
- Asistente de completado y refactorizacion en el IDE: desplegado con `llama-server` en local, sirve para autocompletar y refactorizar codigo Python en ingles, donde la poda de expertos ha conservado la capacidad especifica.
- Generacion de tests y cobertura: dado un modulo, el modelo puede producir suites de pruebas unitarias en el mismo idioma y lenguaje de programacion para los que fue calibrado, integrndose en un pipeline de CI/CD previo al merge.
- Revision de pull requests automatizada: con contexto largo y tool calling, puede leer el diff mas los ficheros relacionados y emitir comentarios estructurados sobre posibles fallos.
- Migracion y traduccion de codigo entre versiones de una misma libreria: al mantener capacidades de razonamiento sobre codigo, resulta util para actualizar APIs obsoletas dentro de un unico lenguaje, siempre en ingles.
- Linea base de evaluacion de cuantizaciones: dado que es la referencia BF16 sin comprimir, sirve para medir la perdida de perplejidad de otras cuantizaciones de la misma familia antes de decidir que build desplegar en produccion.
- Extraccion estructurada de informacion de trazas y logs de aplicaciones: como especialista en codigo, puede parsear stack traces y devolver JSON estructurado con la causa probable.

## Benchmarks y rendimiento

Los unicos datos cuantitativos publicados corresponden a perplejidad sobre WikiText-2 de la familia de cuantizaciones de IsValorum. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la informacion disponible.

| Variante | Tamano en disco | Huella en RAM/VRAM | BPW medio | Perplejidad WikiText-2 | Delta PPL vs BF16 | Tier de calidad |
|---|---|---|---|---|---|---|
| BF16 (referencia, este repositorio) | 85,30 GB (79,44 GiB) | 79,44 GiB | 16,00 | 30,0975 +/- 0,1200 | Linea base (0,00%) | Sin comprimir |
| APEX-I-MiniPlus V2.1 | 21,77 GB (20,27 GiB) | 20,27 GiB | aprox. 3,45 | 30,1495 +/- 1,0089 | +0,0520 (+0,17%) | Q5_K_L / Q6_K |
| APEX-I-NanoPlus | 18,34 GB (17,08 GiB) | 17,08 GiB | aprox. 2,90 | 34,4199 +/- 1,1591 | +4,3224 (+14,36%) | Q4_K_M |

## Requisitos de hardware

- VRAM estimada para inferencia: 79,44 GiB solo para los pesos en BF16, sin contar la cache KV. Es la variante mas exigente de la familia.
- GPU recomendadas: GPU con 80 GB o mas de memoria, como A100 80GB, H100 80GB o H200 141GB. Dado que la huella de pesos deja un margen muy reducido sobre los 80 GB nominales, en la practica puede requerir reparto entre dos GPU o el uso de las variantes comprimidas.
- GPU de consumo: no cabe en ninguna GPU de consumo actual (RTX 4090 con 24 GB, RTX 5090 con 32 GB). Para esas tarjetas el autor ofrece APEX-I-MiniPlus V2.1 (20,27 GiB) y APEX-I-NanoPlus (17,08 GiB).
- Opciones de despliegue: llama.cpp mediante `llama-server` con `-ngl 999` para descargar todas las capas en GPU, o LM Studio. El modelo no es compatible con Strata Engine, que requiere el monolito de 512 expertos y las tablas PLE de 51B.
- Comando de referencia indicado por el autor: `./llama-server -m ./Qwen3.8-Flash-Coder-85GB-BF16.gguf -c 65536 -ngl 999 --host 0.0.0.0 --port 8080`.
- Offload a RAM del host: no necesario segun el autor, ya que la tabla PLE/n-gramas esta desactivada y el modelo se ejecuta integramente en VRAM.
- Latencia y throughput: no disponible en la informacion proporcionada.
- Tamano de la cache KV para los 262.144 tokens de contexto: no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos de terceros en la informacion proporcionada. La comparacion fiable posible es con las otras builds de la misma familia publicadas por el mismo autor:

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Coder-85GB BF16 (este) | 42,6B totales / aprox. 3,7B activos | 262.144 tokens | 30,0975 | Apache 2.0 | GGUF en HuggingFace |
| Qwen3.8-Flash-Coder APEX-I-MiniPlus V2.1 | Misma base, recuantizada | 262.144 tokens | 30,1495 | Apache 2.0 | GGUF en HuggingFace |
| Qwen3.8-Flash-Coder APEX-I-NanoPlus | Misma base, recuantizada | 262.144 tokens | 34,4199 | Apache 2.0 | GGUF en HuggingFace |

Comparativa con alternativas externas de la misma categoria (tamano o tarea): no disponible.

## Limitaciones y advertencias

- Modelo experimental de prepublicacion: el propio autor lo etiqueta como lanzamiento experimental y advierte de que es un especialista en codigo en ingles.
- Idiomas distintos del ingles: el autor afirma que el modelo degrada severamente y produce texto roto en espanol, frances o aleman, porque los expertos conversacionales y multilingues fueron podados. No debe desplegarse en produccion para usuarios en castellano.
- Conversacion general: degradada por el mismo motivo; no es un modelo de chat de proposito general.
- Poda irreversible: 352 de los 512 expertos enrutados fueron eliminados de forma permanente y la pasada de fine-tuning de recuperacion del autor original aun no se ha publicado.
- Riesgo de alucinacion: no disponible como dato medido, pero es un riesgo inherente a cualquier modelo generativo y no se ha publicado ninguna evaluacion al respecto.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del checkpoint base Jab1718/qwen3.8-flash-coder-85gb-bf16, ya que el presente repositorio es solo una conversion de formato.
- Compatibilidad de runtime: no funciona con Strata Engine; requiere llama.cpp (`llama-server`) o LM Studio.
- Coste de hardware: 79,44 GiB de pesos en BF16 hacen inviable el despliegue en GPU de consumo, lo que limita su uso practico a nodos de nube con GPU de 80 GB o al uso como referencia de evaluacion.
- Sesgos: no disponible en la informacion proporcionada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/IsValorum/Qwen3.8-Flash-Coder-85GB-BF16-GGUF
- Modelo base: https://huggingface.co/Jab1718/qwen3.8-flash-coder-85gb-bf16
- Variante APEX-I-MiniPlus V2.1: https://huggingface.co/IsValorum/Qwen3.8-Flash-Coder-APEX-I-MiniPlus-V2.1-GGUF
- Variante APEX-I-NanoPlus: https://huggingface.co/IsValorum/Qwen3.8-Flash-Coder-APEX-I-NanoPlus-GGUF
- Pagina de soporte del cuantizador (Ko-fi): https://ko-fi.com/isvalorum
- Paper, blog o demo oficial: no disponible.
- Resultados de busqueda web: no se han encontrado enlaces tecnicos relevantes sobre este modelo en la busqueda realizada.
