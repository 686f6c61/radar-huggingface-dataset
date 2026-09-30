# 0xSojalSec/CYBER-FROST-3.8-GGUF

## Resumen

CYBER-FROST-3.8-GGUF es una coleccion de cuantizaciones GGUF del checkpoint Blackfrost-AI/CYBER-FROST-3.8-BF16, publicada por el usuario 0xSojalSec. El modelo subyacente es un transformer de tipo mixto de aproximadamente 180.000 millones de parametros totales con unos 6.000 millones activos por token, construido sobre la arquitectura `qwen4exp` (`Qwen4ExpForConditionalGeneration`) derivada de `Qwen/Qwen3.8-Flash-Next`. La model card indica que solo se ha convertido la pila de texto: la torre de vision no forma parte de estos ficheros.

El problema que resuelve esta publicacion es de despliegue, no de modelado: el checkpoint original en BF16 ocupa cientos de gigabytes, y este repo ofrece variantes desde 2 bits (80,08 GB) hasta 4 bits dinamico (123,10 GB), ademas de una variante MXFP4 de 96,65 GB. El repo completo ocupa 799,8 GB. Incluye tambien un cabezal MTP (multi-token prediction) nativo de 4,13 GB en Q8_0, integrado dentro del fichero `CYBER-FROST-3.8-Q2_K_S.gguf`.

La relevancia actual es doble: por un lado, es un ejemplo de cuantizacion manual de un MoE masivo sin matriz de importancia, con mezclas de tipos por capa; por otro, documenta con detalle inusual los fallos de carga en llama.cpp y las limitaciones del backend Vulkan con esta arquitectura. El rendimiento medido por el autor en hardware de gama baja es de 0,5-0,7 tok/s de prompt y 1,0-1,1 tok/s de generacion, con solo 512 tokens de contexto probados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen4exp` (`Qwen4ExpForConditionalGeneration`), MoE hibrida con tensores SSM, derivada de `Qwen/Qwen3.8-Flash-Next` |
| Parametros totales | 176.943.899.520 (dato real de safetensors) |
| Parametros activos | ~6.000 millones por token |
| Longitud de contexto | 262.144 configurados; no probado en contexto largo (las pruebas se hicieron con 512 tokens) |
| Tipos de cuantizacion | Q2_K, Q2_K_S, Q3_K_S, Q3_K_M, MXFP4_MOE, Q4_K_M, UD-IQ4_XS, UD-Q4_K_XL, mas cabezales MTP en Q8_0, Q4_K_M y Q4_0 (este ultimo no construido) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-license-1.0 (etiquetada como `other` en la model card) |
| Formato de pesos | GGUF (para llama.cpp) |

Detalle de ficheros del repositorio:

| Fichero | Rol | Tamano | Prueba |
|---|---|---|---|
| `CYBER-FROST-3.8-Q4_K_M.gguf` | 4 bits plano | 111,43 GB | Smoke test Vulkan superado |
| `CYBER-FROST-3.8-UD-Q4_K_XL.gguf` | 4 bits dinamico | 123,10 GB | Smoke test Vulkan superado |
| `CYBER-FROST-3.8-UD-IQ4_XS.gguf` | IQ4_XS dinamico | 121,84 GB | Smoke test Vulkan superado |
| `CYBER-FROST-3.8-MXFP4_MOE.gguf` | expertos MXFP4, resto Q8_0 | 96,65 GB | Smoke test Vulkan superado |
| `CYBER-FROST-3.8-Q3_K_M.gguf` | 3 bits | 88,56 GB | Smoke test Vulkan superado |
| `CYBER-FROST-3.8-Q3_K_S.gguf` | 3 bits small | 88,56 GB | Smoke test Vulkan superado |
| `CYBER-FROST-3.8-Q2_K.gguf` | 2 bits | 80,08 GB | Smoke test Vulkan superado |
| `CYBER-FROST-3.8-Q2_K_S.gguf` | 2 bits small, cabezal MTP Q8_0 embebido | 80,08 GB | Smoke test MTP Vulkan superado |
| `mtp-CYBER-FROST-3.8-Q8_0.gguf` | cabezal draft | 4,13 GB | Falla al cargar |
| `mtp-CYBER-FROST-3.8-Q4_K_M.gguf` | cabezal draft | 2,62 GB | No cargado |
| `mtp-CYBER-FROST-3.8-Q4_0.gguf` | cabezal draft | no disponible | No construido |

## Arquitectura y entrenamiento

La model card describe un modelo de 48 capas con 512 expertos, 10 expertos por token y un experto compartido, lo que da un ratio de activacion de aproximadamente 1:30 respecto a los parametros totales. La presencia de tensores `ssm_conv1d.weight` y de una "SSM" mencionada junto a la atencion en la descripcion de las mezclas de cuantizacion indica una arquitectura hibrida que combina mecanismos de atencion con componentes de espacio de estados. Se incluyen tambien tensores poco habituales, como una tabla de n-gramas (`per_layer_token_embd`) y proyecciones de bajada de expertos con longitud de fila 640.

El entrenamiento no esta documentado en la informacion disponible: no se especifican el numero de tokens, la composicion del dataset, ni si hubo etapas de RLHF, DPO u otro ajuste por preferencias. La model card del checkpoint base describe la procedencia (`Qwen/Qwen3.8-Flash-Next`) pero no aporta detalles de entrenamiento. Lo unico reseñable en este apartado es la existencia de un bloque MTP nativo entrenado antes de la pasada final de comportamiento del tronco, que se injerta como capa 48 en Q8_0 dentro de `CYBER-FROST-3.8-Q2_K_S.gguf`. Ese cabezal lee el residual ancho previo al mezclador final, no un fichero draft independiente.

En cuanto a innovaciones tecnicas, la decodificacion especulativa con MTP es la mas destacable, aunque el autor advierte que requiere el grafo `qwen4exp` MTP en una build local concreta de llama.cpp y que los ficheros `mtp-` independientes no cargan. Las cuantizaciones dinamicas no usan matriz de importancia, por lo que no equivalen a Unsloth Dynamic 3.0 ni a un IQ4_XS calibrado.

## Capacidades

- Generacion de texto conversacional: el pipeline declarado es `text-generation` y el tag `conversational` esta presente en el repo.
- Razonamiento de tipo "thinking": el autor del repo se describe a si mismo como investigador de post-training y modelos de razonamiento, pero la model card no documenta un modo de razonamiento explicito para este checkpoint.
- Generacion de codigo: la unica prueba funcional publicada consiste en generar una funcion Python `add` que toma dos enteros y devuelve la suma, superada por los ficheros Q4_K_M, UD-Q4_K_XL y UD-IQ4_XS con aproximadamente 1,0 tok/s.
- Decodificacion especulativa con cabezal MTP: disponible solo en `CYBER-FROST-3.8-Q2_K_S.gguf` mediante `--spec-type draft-mtp --spec-draft-n-max 2`.
- Capacidades multimodales: no. La torre de vision no se convirtio.
- Tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Capacidades multilingues: no disponibles; no se declara ninguna lista de idiomas.
- Contexto largo: la configuracion es de 262.144 tokens, pero el autor indica explicitamente que el contexto largo no esta probado.

## Casos de uso

- Investigacion en ciberseguridad autorizada: la coleccion oficial de Blackfrost-AI se presenta como releases para investigacion en ciberseguridad autorizada. El modelo base es de tematica ofensiva y esta cuantizado para poder ejecutarse en hardware local sin exponer datos a servicios externos.
- Analisis de malware en un entorno aislado: al ser un GGUF ejecutable con llama.cpp sobre `mmap`, los expertos y la tabla de n-gramas pueden residir en disco y no es necesario cargar 80-120 GB en memoria, lo que facilita montar el modelo en una maquina air-gapped con almacenamiento amplio.
- Evaluacion de cuantizacion extrema: los ficheros Q2_K, Q2_K_S y Q3_K permiten estudiar la degradacion de un MoE de 48 capas con 512 expertos al bajar de 4 a 2 bits, y sirven como banco de pruebas para mezclas de tipos por capa sin matriz de importancia.
- Pruebas de integracion en llama.cpp: el repo documenta builds concretas (`b1-4da6337`), flags exactos (`-ot "per_layer_token_embd=CPU,exps=CPU" -cmoe -ngl 99 -lm mmap -fit off`) y fallos conocidos, por lo que es util como caso de prueba de soporte de arquitecturas `qwen4exp` y de backend Vulkan.
- Generacion de codigo asistida en lotes no interactivos: el modelo supera la prueba de generar una funcion Python sencilla, de modo que puede usarse en procesos por lotes donde 1 tok/s sea tolerable, como generacion nocturna de plantillas o parches.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra suite estandar.

Lo unico medible aportado por el autor es una prueba funcional y las velocidades de inferencia:

| Prueba | Fichero | Backend | Resultado | Velocidad |
|---|---|---|---|---|
| Generar funcion `add` en Python 3 | `CYBER-FROST-3.8-Q4_K_M.gguf` | Vulkan, mmap, expertos y tabla n-grama en CPU, build b1-4da6337 | Superado (definicion con return) | 1,1 tok/s |
| Generar funcion `add` en Python 3 | `CYBER-FROST-3.8-UD-Q4_K_XL.gguf` | Idem | Superado | 1,0 tok/s |
| Generar funcion `add` en Python 3 | `CYBER-FROST-3.8-UD-IQ4_XS.gguf` | Idem | Superado | 0,9 tok/s |

Velocidad de prompt declarada en la prueba de humo: 0,5 a 0,7 tok/s. Contexto de prueba: 512 tokens.

## Requisitos de hardware

- VRAM minima: no existe una cifra oficial, pero los ficheros van de 80,08 GB (Q2_K / Q2_K_S) a 123,10 GB (UD-Q4_K_XL). Sin offload, se necesita al menos esa cantidad de memoria entre VRAM y RAM.
- Configuracion probada por el autor: Radeon 680M con backend Vulkan, subidas asincronas desactivadas (`GGML_VK_DISABLE_ASYNC=1`), fichero mapeado con `mmap`, expertos y tabla de n-gramas en CPU, GTT en torno a 45 MB y `-fit off` para evitar que el loader llene la GPU con el pool de expertos. Resultado: 1,0-1,1 tok/s de generacion.
- GPU recomendadas: no disponible. No se han publicado pruebas con A100, H100, RTX 4090 ni similares. Dado el tamano de los ficheros, incluso una RTX 4090 (24 GB) solo puede abordar estos modelos con offload masivo a CPU y almacenamiento rapido.
- Cabe en GPU de consumo: no de forma completa. La via practica es el offload de expertos a CPU o a disco, como en la configuracion probada.
- Opciones de despliegue: llama.cpp es la unica libreria declarada (`library_name: llama.cpp`). El repo incluye el tag `endpoints_compatible`, pero no se documenta compatibilidad con vLLM, TGI u Ollama. No se mencionan Ollama ni servidores compatibles en la model card.
- Latencia y throughput: 0,5-0,7 tok/s de prompt y 1,0-1,1 tok/s de generacion en la configuracion descrita. Son valores de referencia de un solo equipo y con 512 tokens de contexto, no representativos de hardware de servidor.
- Restriccion importante de memoria: la cache KV debe ser f16. Con KV cuantizada el modelo falla en esta arquitectura, lo que incrementa el consumo de memoria con contextos largos.

## Comparativa con modelos similares

No se dispone de datos de benchmarks que permitan una comparacion de rendimiento con modelos de la misma categoria. La informacion disponible solo permite comparar variantes del mismo checkpoint:

| Modelo | Parametros | Contexto | Formato / tamano | Licencia |
|---|---|---|---|---|
| Blackfrost-AI/CYBER-FROST-3.8-BF16 (origen) | ~176,9 B totales, ~6 B activos | 262.144 | safetensors BF16 (tamano no disponible) | qwen-community-license-1.0 |
| 0xSojalSec/CYBER-FROST-3.8-GGUF (este repo) | ~176,9 B totales, ~6 B activos | 262.144 | GGUF, de 80,08 GB a 123,10 GB | qwen-community-license-1.0 |
| freakyskittle/CYBER-FROST-3.8-GGUF | no disponible | no disponible | GGUF | no disponible |
| Coleccion Blackfrost-AI CYBER-FROST 3.8 (FP8, NVFP4) | no disponible | no disponible | safetensors FP8 / NVFP4 | qwen-community-license-1.0 |

No hay datos de MMLU, HumanEval, GSM8K ni de velocidad comparada con alternativas de tamano similar, por lo que cualquier comparacion de rendimiento seria especulativa.

## Limitaciones y advertencias

- El autor reconoce explicitamente que el contexto largo no esta probado: las pruebas se hicieron con 512 tokens pese a que la configuracion soporta 262.144.
- La cache KV cuantizada provoca fallos en esta arquitectura; solo funciona con f16.
- Los cabezales MTP independientes (`mtp-*.gguf`) no cargan. llama.cpp se detiene porque falta `output_hc_norm.weight`, ya que los pesos del mezclador se almacenan como `blk.48.nextn.hc_head_norm.weight`. No deben pasarse con `-md`.
- La decodificacion especulativa con MTP solo funciona con `CYBER-FROST-3.8-Q2_K_S.gguf` y requiere el grafo `qwen4exp` MTP en una build local concreta de llama.cpp.
- Problema conocido de kernel: `ssm_conv1d.weight` se almacena como F16, pero el shader Vulkan de convolucion SSM lee float. Un build que alimente el kernel F16 directamente a ese shader produce texto incoherente; las pruebas correctas usaron una build que convierte ese kernel a F32.
- Las cuantizaciones dinamicas no usan matriz de importancia, de modo que no igualan la calidad de un IQ4_XS calibrado ni de Unsloth Dynamic 3.0. En los ficheros de 3 y 2 bits, dos tensores (proyecciones de bajada de expertos con fila de 640 y la tabla `per_layer_token_embd` con fila de 160) no pueden usar bloque de 256 y quedan en Q4_0.
- La licencia no es permisiva: es qwen-community-license-1.0, y el repositorio la etiqueta como `other`. Antes de cualquier uso comercial hay que revisar el fichero LICENSE y los terminos de la Qwen Community License 1.0.
- El modelo base pertenece a una coleccion orientada a investigacion en ciberseguridad y aparece en listados de modelos sin censura para operaciones de red team. Es responsabilidad del usuario limitar el uso a entornos autorizados y cumplir la legislacion aplicable.
- No hay datos sobre sesgos, idiomas soportados ni tasas de alucinacion. No se documentan datos de entrenamiento ni ajustes de alineamiento, lo que impide estimar estos riesgos.
- Rendimiento muy bajo en el hardware de referencia (1 tok/s): no es viable para aplicaciones interactivas ni para servir a varios usuarios en ese equipo.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, y una sola revision, por lo que no existe validacion independiente de la calidad de las cuantizaciones.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/0xSojalSec/CYBER-FROST-3.8-GGUF
- Checkpoint base: https://huggingface.co/Blackfrost-AI/CYBER-FROST-3.8-BF16
- Coleccion oficial CYBER-FROST 3.8: https://huggingface.co/collections/Blackfrost-AI/cyber-frost-38
- Otra cuantizacion GGUF del mismo modelo: https://huggingface.co/freakyskittle/CYBER-FROST-3.8-GGUF
- Perfil del autor en GitHub: https://github.com/0xSojalSec/
- Lista de modelos de seguridad ofensiva en GitHub: https://github.com/JoasASantos/Offensive-Security-AI-Models
