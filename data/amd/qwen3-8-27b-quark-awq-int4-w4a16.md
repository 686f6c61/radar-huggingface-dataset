# amd/Qwen3.8-27B-Quark-AWQ-INT4-W4A16

## Resumen

Qwen3.8-27B-Quark-AWQ-INT4-W4A16 es una version cuantizada del modelo vision-lenguaje Qwen3.8-27B de Alibaba, producida por AMD mediante el kit de herramientas Quark. Aplica cuantizacion AWQ de solo pesos en INT4 (esquema W4A16, grupo de 128) manteniendo las activaciones en BF16, lo que reduce la huella de memoria del modelo original de 27.000 millones de parametros. El modelo base es un transformer denso con entrada nativa de imagen y video, contexto de 262K tokens y licencia Apache 2.0, lanzado en agosto de 2026 con soporte dia cero en hardware AMD.

La cuantizacion conserva mas del 95% del rendimiento del modelo en BF16 segun las pruebas publicadas por AMD: la degradacion de perplexidad en Wikitext es del 4,4% y en GSM8K la recuperacion alcanza el 97,7% en modo thinking. El repositorio ocupa 19,5 GB, lo que permite ejecutar el modelo en GPUs de consumo con 24 GB de VRAM o en los procesadores AMD Ryzen AI Max. Es una opcion practica para desplegar un modelo multimodal de 27B con tool calling en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.8-27B (transformer denso vision-lenguaje) cuantizado W4A16 |
| Parametros totales | 6.474.691.312 (segun safetensors del repo cuantizado; el modelo base declara 27B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (262K, del modelo base) |
| Tipos de cuantizacion | INT4 weight-only (W4A16), AWQ, group size 128, activaciones BF16 |
| Idiomas soportados | no disponible (el modelo base es multilingue) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 27B parametros con arquitectura vision-lenguaje que acepta entrada nativa de imagen y video, e incorpora un modo de razonamiento explicito ("thinking") que puede activarse o suprimirse segun el prompt. La version cuantizada no se entrena: AMD aplica el algoritmo AWQ (activation-aware weight quantization) mediante Quark, con calibracion de 128 muestras a longitud de secuencia 512. Los pesos se almacenan en INT4 con grupo de 128 y las activaciones permanecen en BF16 sin cuantizar. No se menciona en la informacion disponible si la rama de vision del modelo base se conserva integra en esta cuantizacion.

## Capacidades

- Generacion de texto, razonamiento y matematicas: obtiene un 91,21% en GSM8K 5-shot en modo thinking.
- Entrada multimodal de imagen y video (heredada del modelo base Qwen3.8-27B).
- Tool calling y function calling: evaluado con el benchmark BFCL, con un 86,58% en Non-Live AST y un 81,57% en Live AST.
- Modo thinking y modo no-thinking, seleccionables segun el prompt.
- Capacidades multilingues (del modelo base; no se detallan idiomas concretos).
- Razonamiento multi-paso y uso como agente, gracias al soporte de tool calling y al contexto largo de 262K tokens.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de consumo: con 19,5 GB de repositorio y pesos INT4, el modelo cabe en una RTX 4090 de 24 GB o en GPUs AMD Radeon de 24 GB, permitiendo ejecutar un modelo multimodal de 27B sin conexion a la nube.
- Asistentes de codigo y terminal: el modelo base puntua 73,0 en Terminal Bench y 42,2 en DeepSWE, por lo que puede usarse para automatizar tareas de desarrollo, generacion de parches y ejecucion de comandos en entornos de CI/CD.
- Agentes con tool calling: el soporte de function calling (validado con BFCL) permite integrarlo en pipelines de agentes que invocan APIs, consultan bases de datos o ejecutan herramientas externas en multiples turnos.
- Automatizacion de interfaces graficas y navegador: con una puntuacion de 84,3 en OSWorld, el modelo base es adecuado para agentes que operan aplicaciones de escritorio y web, y la cuantizacion reduce el coste de memoria para ejecutarlos en equipos locales.
- Analisis de documentos con imagen: al heredar la entrada de imagen y video del modelo base, puede procesar capturas de pantalla, diagramas o documentos escaneados combinados con texto.
- Razonamiento matematico y cientifico en entornos con recursos limitados: el 91% en GSM8K con solo 13,5 GB de pesos INT4 lo hace viable para laboratorios sin GPUs de alta gama.

## Benchmarks y rendimiento

Resultados publicados por AMD en la model card, comparando la version cuantizada con el modelo base en BF16:

| Benchmark | Configuracion | Este modelo (AWQ INT4) | Base BF16 | Recuperacion |
|---|---|---|---|---|
| GSM8K 5-shot (flexible-extract / strict-match) | Thinking, temperature=1.0, top_p=0.95 | 91,21% / 90,67% | 93,33% / 93,33% | 97,7% |
| GSM8K 5-shot (flexible-extract / strict-match) | No-thinking, temperature=0.7, top_p=0.80 | 91,51% / 90,37% | 90,67% / 89,76% | 100,9% |
| Wikitext perplexity | Greedy | 8,8250 | 8,4364 | 95,6% |
| BFCL Overall Acc (single_turn) | Greedy | 24,06% | 24,38% | 98,7% |

Notas: la puntuacion BFCL refleja solo categorias single_turn; las categorias multi-turn, web-search y memoria no se ejecutaron y contarian como 0 en la formula publica del leaderboard de Gorilla. La recuperacion de perplexidad se calcula invertida (menor es mejor). No se han publicado resultados de benchmarks de vision, codigo o agentes especificos para esta version cuantizada.

## Requisitos de hardware

- Pesos INT4: aproximadamente 13,5 GB para 27B parametros a 0,5 bytes por parametro, mas overhead de activaciones BF16 y cache KV; el repositorio completo ocupa 19,5 GB.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A10G, o GPUs AMD Radeon de 24 GB. Con cuantizacion adicional o offloading podria caber en 16 GB, aunque no se ha verificado.
- CPU y APU: AMD Ryzen AI Max con soporte dia cero, segun el blog oficial de AMD, ejecutable via LM Studio.
- Opciones de despliegue: vLLM con soporte del esquema W4A16Int4 (requiere los PR de Quark: vllm-project/vllm #52642, #46110, #52649), LM Studio y Lemonade.
- Inferencia: el comando de ejemplo de vLLM usa tensor_parallel_size=1 y gpu_memory_utilization=0.4, lo que sugiere que cabe en una sola GPU con margen para cache KV. No se publican datos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | GSM8K (5-shot, thinking) | Licencia |
|---|---|---|---|---|---|
| Qwen/Qwen3.8-27B (base) | 27B | 262K | BF16 | 93,33% | Apache-2.0 |
| amd/Qwen3.8-27B-Quark-AWQ-INT4-W4A16 | 27B (nominal) | 262K | INT4 W4A16 | 91,21% | Apache-2.0 |
| Otras cuantizaciones de Qwen3.8-27B (GPTQ, GGUF) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos publicados sobre otras versiones cuantizadas del mismo modelo base para una comparativa mas amplia. La comparacion directa con el BF16 muestra una perdida de rendimiento inferior al 3% en GSM8K y del 4,4% en perplexidad.

## Limitaciones y advertencias

- La cuantizacion degrada la perplexidad un 4,4% respecto al BF16 (8,8250 frente a 8,4364 en Wikitext), lo que puede afectar a tareas sensibles a la calidad del lenguaje.
- El benchmark BFCL solo cubre categorias single_turn; el rendimiento en escenarios multi-turno, web-search y memoria no se ha verificado y contaria como 0 en la formula publica del leaderboard de Gorilla.
- Requiere un runtime compatible con el esquema W4A16Int4 de Quark; las versiones estandar de vLLM anteriores a los PR mencionados no serviran el modelo correctamente.
- No se ha verificado en la informacion disponible si las capacidades de vision (imagen y video) del modelo base se conservan integras tras la cuantizacion.
- La discrepancia entre los 6.474.691.312 parametros contabilizados en safetensors y los 27B declarados del modelo base no esta explicada en la model card; conviene validar la integridad de los pesos antes de usarlo en produccion.
- El recuento de parametros del safetensors (6,47B) es notablemente inferior al nominal de 27B; esto podria indicar que parte de los tensores (por ejemplo, el codificador de vision) no se incluyen en el repo cuantizado o que la extraccion de metadatos es incompleta.
- Licencia Apache-2.0 con modificaciones copyright de AMD, 2026; permite uso comercial sin restricciones conocidas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/amd/Qwen3.8-27B-Quark-AWQ-INT4-W4A16
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- AMD Quark (kit de cuantizacion): https://github.com/amd/Quark
- Blog de AMD sobre soporte dia cero en Ryzen AI Max y Radeon: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Guia sobre Qwen3.8-27B (capacidades del modelo base): https://lovableapp.org/blog/qwen3-8-27b
- PR de soporte W4A16Int4 en vLLM: https://github.com/vllm-project/vllm/pull/52642
