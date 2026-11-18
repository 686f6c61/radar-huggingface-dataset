# autotrust/GLM-5.3-Flash-GGUF-DGX-Spark

## Resumen

GLM-5.3-Flash-GGUF-DGX-Spark es una compilacion GGUF para llama.cpp del modelo GLM-5.3-Flash de Z.ai (zai-org), publicada por AutoTrust. Se trata de una version comprimida mediante la receta propietaria SLIM-Q (Sparse-Squared): una poda estructural de expertos del MoE seguida de cuantizacion agresiva de bajo bit en los expertos supervivientes. El resultado ocupa 79,1 GiB frente a los 90 GiB del GGUF Q2 original, una reduccion del 12 %, manteniendo intactos atencion, capas densas, expertos compartidos y router. El modelo base declara 279.498.438.142 parametros totales.

La relevancia de esta ficha es practica: permite ejecutar un MoE de frontera en una unica DGX Spark (GB10, 128 GB de memoria unificada) con contexto de 64 K y margen de memoria, algo que la version Q2 sin podar no permite con comodidad. La poda elimina 32 de los 288 expertos enrutados por capa (256 retenidos, variante E256), pero el coste por token no cambia: el router sigue seleccionando top-8 expertos, por lo que el trafico de computo y memoria por token es identico al del Flash Q2 original.

El modelo soporta generacion de texto conversacional con modo de razonamiento (thinking), tool calling compatible con OpenAI y batching continuo a traves de llama-server. Esta publicado bajo licencia MIT, solo en ingles y chino, y requiere una version especifica de llama.cpp (PR #27773, rama glm5-next) que no estaba fusionada en el momento de la publicacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atencion hibrida KDA + DSA, poda estructural de expertos (SLIM-Q E256) |
| Parametros totales | 279.498.438.142 |
| Parametros activos | top-8 de 256 expertos enrutados por capa (no se especifica el numero exacto de parametros activos) |
| Longitud de contexto | 64 K recomendado en DGX Spark; hasta 1 M segun el autor |
| Tipos de cuantizacion | IQ2_XXS (gate/up de expertos enrutados), Q2_K (down de expertos enrutados); atencion, capas densas, expertos compartidos y routers en alta precision |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | GGUF (2 shards: 41,9 GiB + 37,2 GiB) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash es un MoE con 288 expertos enrutados por capa y activacion top-8, con atencion hibrida que combina capas KDA (estado constante, sin cache de contexto creciente) y capas DSA (cache compacta). AutoTrust aplica sobre el checkpoint original un pipeline de compresion post-entrenamiento en dos etapas. La primera, SLIM, perfila el uso de expertos sobre una mezcla de calibracion bilingue de codigo, agentes, ciencia y matematicas, y elimina estructuralmente los 32 expertos menos usados de cada capa (11 %), conservando 256. La segunda etapa cuantiza los expertos enrutados a IQ2_XXS (gate/up) y Q2_K (down), mientras mantiene en alta precision atencion, capas densas, expertos compartidos y router para preservar el comportamiento de enrutamiento.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en el modelo base. La innovacion tecnica destacable es la doble esparsidad (Sparse-Squared): el MoE ya es disperso en inferencia y la poda anade una segunda dimension estructural que reduce permanentemente la huella de pesos sin alterar el coste por token. El modelo conserva el modo de razonamiento del template GLM, con niveles de esfuerzo low, high y max configurables mediante `reasoning_effort`.

## Capacidades

- Generacion de texto conversacional multi-turno con contexto largo (64 K en Spark).
- Razonamiento con modo thinking activado por defecto; el servidor devuelve el razonamiento separado en `reasoning_content`.
- Tool calling y function calling con formato OpenAI `tool_calls`.
- Batching continuo para multiples sesiones concurrentes (4 sesiones de 16 K recomendadas).
- Capacidades de codigo, matematicas y ciencia segun los benchmarks declarados por el autor (HumanEval, C-Eval, GPQA-D).
- Capacidades bilingues limitadas a ingles y chino.
- Compatibilidad con endpoints OpenAI a traves de llama-server.
- No se declaran capacidades de vision ni audio en la informacion disponible.

## Casos de uso

- Asistente conversacional de contexto largo en una unica DGX Spark: con 64 K de contexto y ~30 GiB de memoria libre tras cargar los pesos, permite mantener conversaciones extensas con documentos largos sin fragmentar el contexto.
- Servicio multi-usuario en local: la configuracion `-np 4 -c 65536` (4 sesiones de 16 K) con batching continuo permite atender a varios usuarios simultaneos en un solo nodo GB10.
- Agentes con tool calling: la salida en formato OpenAI `tool_calls` y el modo thinking permiten construir agentes multi-paso que razonan antes de invocar herramientas, integrables en pipelines existentes.
- Generacion y revision de codigo: los resultados declarados en HumanEval (97,6 en 4 bits) y el soporte bilingue de codigo lo hacen adecuado para asistentes de programacion en entornos con requisitos de privacidad, al ejecutarse en hardware local.
- Razonamiento cientifico y matematico: el rendimiento declarado en GPQA-D (77,3 en 4 bits) y C-Eval (89,4) lo situan como opcion para tareas de analisis tecnico en ingles y chino.
- Despliegue air-gapped: al ejecutarse con llama.cpp en hardware propio y licencia MIT, encaja en entornos sin acceso a APIs externas o con requisitos de soberania de datos.
- Prototipado de bajo coste: la reduccion de huella permite reservar mas memoria para cache KV y sesiones concurrentes en el mismo hardware, abaratando la evaluacion de un MoE de frontera.

## Benchmarks y rendimiento

Los datos disponibles son los declarados por el autor en la model card, correspondientes a la variante de 4 bits del modelo base; no se presentan resultados especificos de esta compilacion de 2 bits, solo una comparacion A/B cualitativa ("on par or better").

| Benchmark | Resultado declarado (4 bits) |
|---|---|
| HumanEval | 97,6 |
| C-Eval | 89,4 |
| GPQA-D | 77,3 |

No se han publicado resultados de benchmarks especificos para esta cuantizacion de 2 bits en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada: 79,1 GiB de pesos mas ~1 GiB por cada 16 K tokens de contexto (capas KDA con estado constante y DSA con cache compacta) mas unos pocos GiB de buffers de computo.
- Hardware objetivo: DGX Spark con GB10 y 128 GB de memoria unificada; con `-c 65536` quedan ~30 GiB libres.
- No cabe en GPU de consumo convencionales (RTX 4090 con 24 GB, etc.) por el tamano de pesos; requiere un nodo con al menos ~85-90 GB de memoria disponible.
- Despliegue: llama.cpp con la rama glm5-next (PR #27773), compilada con `-DGGML_CUDA=ON -DCMAKE_CUDA_ARCHITECTURES=121a-real`; llama-server ofrece API compatible con OpenAI, batching continuo, tool calling y `reasoning_content`.
- Almacenamiento: mantener los dos shards GGUF en NVMe interno; la primera carga lee 79 GiB.
- Latencia y throughput: el autor indica que el coste por token es identico al del Flash Q2 original (mismo trabajo por token); no se publican cifras concretas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (GLM-5.3-Flash SLIM-Q E256) | 279,5 B totales, top-8 de 256 expertos | 64 K en Spark, hasta 1 M | IQ2_XXS / Q2_K | MIT | GGUF en HF |
| GLM-5.3-Flash Q2 GGUF original | 279,5 B totales, top-8 de 288 expertos | 16-32 K en Spark | Q2 | MIT (modelo base) | GGUF en HF |
| GLM-5.3-GGUF-DGX-Spark (SLIM-Q E192) | 744 B totales, top-8 de 192 expertos | no disponible | NVFP4 / GGUF | MIT | GGUF en HF |

La comparativa se limita a las variantes del mismo modelo base documentadas por el autor; no se dispone de datos de modelos de otros desarrolladores en la informacion proporcionada.

## Limitaciones y advertencias

- La poda de 32 expertos por capa es irreversible y puede degradar tareas que dependian de los expertos eliminados; el autor solo aporta una comparacion A/B cualitativa en 2 bits, sin metricas publicadas para esta cuantizacion.
- La cuantizacion IQ2_XXS/Q2_K en los expertos enrutados es muy agresiva; los benchmarks citados corresponden a la variante de 4 bits, no a esta.
- Solo soporta ingles y chino; no hay soporte declarado de castellano.
- Requiere una rama no fusionada de llama.cpp (PR #27773); la compatibilidad con versiones futuras no esta garantizada.
- Riesgo de alucinacion inherente a los modelos generativos; no se documentan evaluaciones de sesgo en la informacion disponible.
- La licencia MIT permite uso comercial, pero conviene verificar las condiciones del modelo base zai-org/GLM-5.3-Flash.
- El contexto maximo de 1 M declarado por el autor no es practico en un Spark: con 64 K ya se consumen ~30 GiB de margen.
- El modo thinking esta activado por defecto y consume tokens de razonamiento; en produccion conviene ajustar `--reasoning-budget` o `reasoning_effort`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/autotrust/GLM-5.3-Flash-GGUF-DGX-Spark
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Variante SLIM-Q E192 de 744B: https://huggingface.co/autotrust/GLM-5.3-GGUF-DGX-Spark
- Pull request de llama.cpp con soporte glm5-next: https://github.com/ggml-org/llama.cpp/pull/27773
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Demo de AutoTrust/GuruSearch: https://news.guru.so/ui
