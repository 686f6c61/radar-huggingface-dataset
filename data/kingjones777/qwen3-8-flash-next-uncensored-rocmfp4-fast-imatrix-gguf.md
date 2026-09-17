# kingjones777/Qwen3.8-Flash-Next-Uncensored-ROCmFP4-FAST-imatrix-GGUF

## Resumen

Este repositorio contiene una cuantizacion GGUF del modelo Qwen3.8-Flash-Next-Uncensored, publicada por el usuario kingjones777. No es un modelo entrenado desde cero: es un artefacto de cuantizacion orientado a un objetivo muy concreto, ejecutar un modelo grande en una estacion de trabajo AMD con memoria unificada (Ryzen AI Max+ 395, arquitectura gfx1151, Strix Halo) usando el formato de pesos ROCmFP4 en lugar de los tipos clasicos de llama.cpp. El trabajo de "abliteration" (eliminacion del comportamiento de rechazo) corresponde al repositorio orcarouter/Qwen3.8-Flash-Next-Uncensored, que sirve de base en BF16.

La innovacion principal del repositorio es triple. Primero, usa el tipo de tensor ROCmFP4 (TYPE_101, 4,251 bits por peso) para casi todos los tensores, incluida la tabla de embeddings por capa (PLE), y protege la cabeza de salida (output.weight) en Q6_K. Segundo, la cuantizacion se ha calibrado con una importance matrix (imatrix), lo que reduce la perplejidad medida un 5,9 % respecto a la compilacion hermana sin imatrix, sin cambiar el tamano ni la velocidad. Tercero, incluye un parche para el grafo MTP de la arquitectura qwen4exp que arregla el combinador de decodificacion especulativa, elevando la tasa de aceptacion a 0,94 y el rendimiento de 24,9 a 31,80 tokens por segundo.

Se trata de un artefacto de investigacion con cero descargas y cero "likes" en el momento de redactar esta ficha, y requiere un fork especifico del runtime (kingjones30/ROCmFPX) que combine la arquitectura qwen4exp con los tipos ROCmFP4. Un llama.cpp estandar no podra cargar estos ficheros. Por tanto, es un modelo relevante para quien investiga cuantizacion de precision mixta en hardware AMD, no para un despliegue convencional en GPU NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen4exp (transformer con MoE, expertos compartidos, embeddings por capa PLE y cabeza MTP para decodificacion especulativa) |
| Parametros totales | 448.931.056 según los metadatos de safetensors de HuggingFace; la model card menciona ademas una tabla PLE de 51,2 mil millones de parametros, cifra que no cuadra con el dato anterior y cuya relacion exacta no se detalla |
| Parametros activos | no disponible |
| Longitud de contexto | el ejemplo de despliegue usa -c 131072 (128K); el maximo oficial no se especifica |
| Tipos de cuantizacion | ROCmFP4 (TYPE_101, 4,251 bpw) en expertos MoE, experto compartido, atencion, PLE y token_embd; output.weight (lm head) en Q6_K protegido; existe una compilacion hermana sin imatrix |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (campo license: other); los terminos concretos de uso comercial no se detallan en la informacion disponible |
| Formato de pesos | GGUF dividido en 3 fragmentos (00001-of-00003 a 00003-of-00003), 87,9 GiB en disco, 4,27 bpw |
| Tamano del repositorio | 95,3 GB |
| Libreria de inference | llama.cpp (fork ROCmFPX con GGML_HIP), no compatible con llama.cpp upstream tal cual |

## Arquitectura y entrenamiento

No hay informacion sobre el entrenamiento del modelo base en la documentacion disponible. Todos los datos tecnicos del repositorio se refieren al proceso de cuantizacion, no a la fase de preentrenamiento, ajuste fino o alineacion. Lo que si se documenta es la receta de cuantizacion: se parte de los pesos BF16 publicados por orcarouter/Qwen3.8-Flash-Next-Uncensored y se aplica una receta de 4 bits sobre los grupos de tensores ffn_*_exps (expertos MoE), ffn_*_shexp (experto compartido), todos los tensores attn_*, per_layer_token_embd.weight (PLE) y token_embd.weight. La cabeza de salida output.weight se mantiene en Q6_K de forma explicita y verificada por nombre exacto de tensor tras cuantizar y dividir, porque todo token muestreado atraviesa el lm head y su error de cuantizacion se propaga directamente al argmax.

La innovacion tecnica destacable es la calibracion con importance matrix usando el corpus bartowski calibration_datav3. Es importante senalar un caveat que el propio autor documenta: la imatrix se calculo sobre el modelo de 4 bits, no sobre BF16, porque el limite de 128 GB de GTT de Strix Halo, junto con la tabla PLE de 51,2 mil millones de parametros, impide una pasada forward en BF16. El autor indica que una fuente imatrix de mayor precision probablemente daria una ganancia adicional. La segunda innovacion es el parche qwen4exp-mtp-graph.patch, que corrige un combinador roto en el grafo MTP: el original aplicaba mean-pooling a los flujos de hiper-conexion, dejando la aceptacion del borrador en torno a 0,36. Con el parche, y usando la cabeza MTP estandar publicada aparte, la aceptacion sube a 0,94.

## Capacidades

- Generacion de texto condicionada por chat template Jinja (el ejemplo de despliegue usa --jinja).
- Ejecucion local de un modelo de gran tamano sobre memoria unificada AMD, sin GPU dedicada.
- Contexto de trabajo de hasta 131.072 tokens en la configuracion de ejemplo.
- Decodificacion especulativa mediante cabeza MTP con --spec-type draft-mtp, con parametros de borrador --spec-draft-n-min 2 y --spec-draft-n-max 4.
- Comportamiento sin rechazo (abliterated): el modelo no aplica negativas de seguridad, lo que se presenta explicitamente como una retirada de guardarrailes y no como una capacidad nueva.
- Capacidades de razonamiento, codigo, matematicas, vision o audio: no documentadas en la informacion disponible.
- Soporte de tool calling / function calling: no documentado. El uso de --jinja es un requisito habitual para plantillas con herramientas, pero la model card no afirma compatibilidad con function calling.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no disponibles; no se declara lista de idiomas.

## Casos de uso

- Investigacion en seguridad y red teaming: el modelo permite estudiar como responde un transformer grande cuando se le retira el comportamiento de rechazo, en un entorno aislado y con supervision humana. Es el uso que el propio autor insinua en el aviso de "research artifact".
- Cuantizacion de precision mixta en hardware AMD: sirve como caso de estudio replicable de una receta ROCmFP4 con lm head protegido en Q6_K, util para quien investiga formatos de pesos alternativos a Q4_K_M o Q5_K_M.
- Validacion de calibracion imatrix: el repositorio publica perplejidades medidas sobre WikiText-2 raw con -c 512 para dos compilaciones con los mismos bits por peso, lo que permite reproducir y auditar la ganancia del 5,9 % atribuida a la imatrix.
- Banco de pruebas de decodificacion especulativa: con el parche MTP aplicado, se puede medir la tasa de aceptacion y el throughput de draft-mtp frente a decodificacion normal en una misma maquina, comparando 24,9 frente a 31,80 tok/s.
- Procesamiento de documentos largos en estacion de trabajo: con 131.072 tokens de contexto en el ejemplo de despliegue, es viable trabajar con expedientes o corpus extensos que no caben en ventanas de 32K, siempre que se acepte el coste en memoria del KV cache.
- Generacion de texto sin filtros para sintesis de datos: en pipelines de destilacion o aumento de datos donde los rechazos del modelo interrumpen la generacion, un modelo abliterated reduce la necesidad de manejar negativas, con la advertencia legal y etica correspondiente.
- Pruebas de integracion de runtimes alternativos: el repositorio exige compilar un fork con GGML_HIP y GPU_TARGETS=gfx1151, por lo que es util para validar cadenas de compilacion ROCm y detectar regresiones en arquitecturas no soportadas por upstream.
- Evaluacion de estabilidad en contextos muy largos: el fallo documentado de ngram-mod a partir de 64K (desincronizacion del indice QSA y bloqueo de la cola SDMA) convierte a este modelo en un banco de pruebas para diagnosticar problemas de cache de contexto en la pila ROCm.

## Benchmarks y rendimiento

Perplejidad medida sobre WikiText-2 raw con -c 512 (datos publicados por el autor):

| Compilacion | PPL | Diferencia |
|---|---|---|
| FAST sin imatrix (repositorio hermano) | 5,3465 ± 0,034 | referencia |
| FAST imatrix (este repositorio) | 5,0337 ± 0,031 | -5,9 % |
| Head de 4 bits sin Q6_K protegido, con imatrix | 5,1075 | +1,5 % respecto a este build |

Rendimiento de decodificacion medido en la misma maquina y binario, con completion de 160 tokens en caliente, prompt neutro y cache_prompt:false:

| Configuracion | Tokens por segundo | Aceptacion | Mejora |
|---|---|---|---|
| Sin borrador | 24,9 tok/s | no aplica | referencia |
| draft-mtp con parche | 31,80 tok/s | 0,94 | +27,7 % |
| draft-mtp sin parche | no disponible | ~0,36 | no aplica |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de capacidad en la informacion disponible.

## Requisitos de hardware

- Espacio en disco: 95,3 GB para el repositorio completo; los pesos suman 87,9 GiB repartidos en 3 fragmentos GGUF.
- VRAM estimada para inferencia: no disponible como cifra cerrada. Los pesos ocupan 87,9 GiB, a lo que hay que sumar el KV cache para el contexto configurado (131.072 tokens en el ejemplo) y las estructuras de atencion.
- Hardware objetivo declarado: AMD Ryzen AI Max+ 395 (Strix Halo), GPU integrada gfx1151, con ROCm y un techo de 128 GB de memoria GTT. El propio autor usa ese limite para justificar que no se pudo calcular la imatrix en BF16.
- GPU dedicadas: no aplica. El repositorio esta construido sobre ROCm e HIP para gfx1151; no se documenta soporte CUDA.
- GPU de consumo (RTX 4090, 24 GB; RTX 3090, 24 GB): no cabe. El unico escenario realista es memoria unificada de gran capacidad en plataformas AMD tipo Strix Halo.
- Compilacion obligatoria: git clone del fork kingjones30/ROCmFPX, cmake con -DGGML_HIP=ON, -DGPU_TARGETS=gfx1151, -DGGML_NATIVE=ON y -DCMAKE_BUILD_TYPE=Release; se construyen los objetivos llama-server y llama-quantize. Sin este fork no se carga el fichero.
- Despliegue: llama-server del fork. vLLM, TGI, Ollama y llama.cpp upstream no estan soportados segun la documentacion disponible.
- Rendimiento observado: 24,9 tok/s en decodificacion normal y 31,80 tok/s con draft-mtp y aceptacion 0,94, en la maquina de referencia del autor.
- Cabezas MTP: requieren un fichero aparte, mtp-Qwen3.8-Flash-Next-Q6_K.gguf, del repositorio kingjones777/Qwen3.8-Flash-Next-MTP-Heads-GGUF. La cabeza incluida es la estandar de Flash-Next, no la version uncensored, aunque solo propone borradores que el modelo principal verifica.

## Comparativa con modelos similares

| Build | Origen | PPL (WikiText-2, -c 512) | Bits por peso | Tamano | Estado |
|---|---|---|---|---|---|
| Este repositorio (ROCmFP4 FAST imatrix) | kingjones777 | 5,0337 ± 0,031 | 4,27 | 87,9 GiB | publicado, 0 descargas |
| ROCmFP4 FAST sin imatrix | kingjones777 (hermano) | 5,3465 ± 0,034 | 4,27 | 87,9 GiB | publicado |
| ROCmFP4 STRIX | kingjones777 (hermano) | no disponible | no disponible | no disponible | existe un hilo de discusion asociado |
| Qwen3.8-Flash-Next (BF16) | Qwen | no disponible | 16 | no disponible | modelo base oficial |
| Qwen3.8-Flash-Next-Uncensored (BF16) | orcarouter | no disponible | 16 | no disponible | base de la abliteration |

Comparado con cuantizaciones convencionales de llama.cpp (Q4_K_M, Q5_K_M), este build es la unica via documentada para cargar el modelo en gfx1151 con el tipo ROCmFP4, pero a cambio pierde portabilidad total: no funciona en el runtime upstream ni en GPUs NVIDIA. La licencia qwen-community-1.0 es comun a las variantes derivadas de Qwen, mientras que los modelos comparables de otras familias tendrian licencias distintas que no se detallan aqui.

## Limitaciones y advertencias

- Modelo abliterated: el comportamiento de rechazo se ha eliminado. El autor lo describe explicitamente como una retirada de guardarrailes que no anade capacidad. Su uso en produccion orientada al publico es desaconsejable sin filtros propios.
- Artefacto de investigacion con 0 descargas y 0 "likes": no hay validacion independiente de los resultados de perplejidad ni del rendimiento reportado.
- Dependencia de un fork no oficial: sin kingjones30/ROCmFPX (o sin aplicar los dos parches incluidos) el fichero no carga. Esto implica deuda de mantenimiento, ya que el fork puede quedar desincronizado del llama.cpp upstream.
- Compatibilidad de hardware muy restringida: orientado a gfx1151 y ROCm. No hay soporte documentado para CUDA ni para GPU de consumo.
- La imatrix se calculo sobre el modelo de 4 bits, no sobre BF16, por limitaciones de memoria. El autor reconoce que la ganancia de calidad esta probablemente subestimada.
- Fallo conocido del runtime: --spec-type ngram-mod funciona a 32K pero a partir de 64K puede desincronizar el indice QSA respecto a las caches KV y bloquear la cola SDMA (Ring sdma0 reset failure), con necesidad de apagado forzado. El workaround documentado es -ctxcp 0 -cpent -1. draft-mtp no se ve afectado.
- Riesgo de alucinacion: no cuantificado. No hay evaluaciones de veracidad ni de tasas de alucinacion en la informacion disponible.
- Sesgos conocidos: no documentados ni evaluados.
- Idiomas: la lista de idiomas soportados no esta declarada, por lo que no se puede garantizar un rendimiento multilingue concreto.
- Licencia: qwen-community-1.0 con campo license: other. Los terminos exactos de uso comercial no se reproducen en la informacion disponible y deben consultarse en el texto oficial de la licencia antes de cualquier despliegue productivo.
- La cabeza MTP incluida es la estandar de Flash-Next (no uncensored). Solo propone tokens borrador que el modelo principal verifica, por lo que no deberia alterar la salida, pero introduce una dependencia adicional de otro repositorio.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/kingjones777/Qwen3.8-Flash-Next-Uncensored-ROCmFP4-FAST-imatrix-GGUF
- Modelo base abliterated (BF16): https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored
- Modelo base oficial: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Compilacion hermana sin imatrix: https://huggingface.co/kingjones777/Qwen3.8-Flash-Next-Uncensored-ROCmFP4-FAST-GGUF
- Compilacion STRIX: https://huggingface.co/kingjones777/Qwen3.8-Flash-Next-ROCmFP4-STRIX-GGUF
- Hilo de discusion sobre el fallo de ngram-mod a partir de 64K: https://huggingface.co/kingjones777/Qwen3.8-Flash-Next-ROCmFP4-STRIX-GGUF/discussions/6
- Cabezas MTP para decodificacion especulativa: https://huggingface.co/kingjones777/Qwen3.8-Flash-Next-MTP-Heads-GGUF
- Fork del runtime con arquitectura qwen4exp y tipos ROCmFP4: https://github.com/kingjones30/ROCmFPX
- Runtime ROCmFPX original (solo tipos ROCmFP4, sin qwen4exp): https://github.com/charlie12345/ROCmFPX
- Corpus de calibracion para imatrix: https://gist.github.com/bartowski1182/eb213dccb3571f863da82e99418f81e8
- Parches incluidos en el repositorio: qwen4exp-on-rocmfpx-d3ca537.patch y qwen4exp-mtp-graph.patch

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; todas las referencias anteriores proceden de la model card y de los metadatos de HuggingFace.
