# manalejandro/DeepSeek-R1-Distill-Qwen-1-5B-f16-iq2_xxs-GGUF

## Resumen

Este repositorio contiene una cuantización GGUF del modelo DeepSeek-R1-Distill-Qwen-1.5B, el destilado más pequeño de la familia DeepSeek-R1, convertido al formato GGUF con una compresión extrema mediante la cuantización IQ2_XXS (aproximadamente 2,06 bits por peso). El archivo resultante ocupa 560,37 MiB, lo que permite cargar el modelo completo en GPUs de clase 4 GB, como una GTX 1650, manteniendo la estructura de razonamiento con cadena de pensamiento del modelo original.

El autor, manalejandro, ha generado esta versión a partir del modelo base de DeepSeek (licencia MIT) utilizando llama.cpp con una matriz de importancia calculada sobre un conjunto de calibración wikitext-2. La cuantización IQ2_XXS es la más pequeña de la familia IQ que conserva un comportamiento de razonamiento aceptable, aunque con una degradación notable en fluidez y precisión respecto a cuantizaciones menos agresivas como Q4_K_M o F16. El contexto se ha limitado a 32768 tokens para que la caché KV quepa en una GPU de 4 GB con descarga completa de capas.

Este archivo está pensado para entornos con recursos muy limitados donde se prioriza la posibilidad de ejecutar un modelo de razonamiento localmente frente a la calidad de salida. Es una opción viable para prototipos, pruebas educativas o aplicaciones que no requieran respuestas de alta fidelidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformer decoder) |
| Parametros totales | 1,78 mil millones |
| Parametros activos | ~1,5 mil millones (modelo denso, no MoE) |
| Longitud de contexto | 32768 tokens |
| Tipos de cuantizacion | IQ2_XXS (~2,06 bits/peso) |
| Idiomas soportados | Ingles, multilingue (limitado) |
| Licencia | MIT |
| Formato de pesos | GGUF (version 3) |

## Arquitectura y entrenamiento

El modelo base DeepSeek-R1-Distill-Qwen-1.5B es un transformer denso de la familia Qwen2, destilado a partir de DeepSeek-R1 mediante fine-tuning con 800.000 muestras curadas generadas por el modelo R1 original. La arquitectura es un decoder estándar con atención causal, sin mezcla de expertos. El proceso de destilación transfiere las capacidades de razonamiento del modelo grande al pequeño, incluyendo el formato de cadena de pensamiento con las etiquetas `[Start thinking]` y `[End thinking]`.

La cuantización IQ2_XXS se ha aplicado sobre los pesos en F16 utilizando llama.cpp. Se empleó una matriz de importancia (importance matrix) calculada con `llama-imatrix` sobre un conjunto de calibración wikitext-2 para minimizar la pérdida de información en las capas más sensibles. El resultado es un archivo GGUF de 560,37 MiB que conserva la estructura de razonamiento del modelo original, aunque con una precisión numérica muy reducida.

## Capacidades

- Generacion de texto con razonamiento explicito: el modelo produce cadenas de pensamiento delimitadas por `[Start thinking]` y `[End thinking]` antes de dar la respuesta final.
- Razonamiento logico y matematico basico: heredado del proceso de destilacion de DeepSeek-R1, aunque degradado por la cuantizacion agresiva.
- Comprension y generacion de texto en ingles principalmente; soporte multilingue limitado y con menor calidad.
- Ejecucion local en hardware de muy bajos recursos: el archivo de 0,56 GB cabe en GPUs de 4 GB y tambien puede ejecutarse solo con CPU.
- Compatibilidad con el ecosistema llama.cpp: funciona con llama-cli, llama-server (API compatible con OpenAI), Docker Model Runner y Ollama.
- No se ha documentado soporte para tool calling, funciones, vision ni audio en esta cuantizacion.

## Casos de uso

- Prototipado rapido de aplicaciones de razonamiento en entornos sin GPU dedicada: al ocupar menos de 0,6 GB, puede ejecutarse en portatiles con 4 GB de RAM o GPUs integradas, permitiendo validar flujos de cadena de pensamiento antes de migrar a modelos mayores.
- Educacion y divulgacion sobre modelos de razonamiento: su tamano reducido facilita la ejecucion en aulas o talleres para demostrar el comportamiento de DeepSeek-R1 sin necesidad de infraestructura costosa.
- Asistentes de texto con razonamiento basico en dispositivos embebidos o de baja potencia: por ejemplo, un chatbot local en una Raspberry Pi o un mini-PC con 4 GB de RAM, donde la calidad de respuesta es secundaria frente a la disponibilidad.
- Pruebas de integracion con llama.cpp y sus derivados: desarrolladores que necesiten verificar el funcionamiento de la API OpenAI-compatible de llama-server o la integracion con Ollama pueden usar este archivo como modelo de prueba.
- Generacion de respuestas con explicaciones paso a paso en aplicaciones sin conexion: el modelo mantiene la estructura de razonamiento, util para tareas de logica simple o preguntas factuales donde la precision no es critica.
- Benchmarking de rendimiento de cuantizaciones extremas: investigadores pueden comparar la degradacion de IQ2_XXS frente a otras cuantizaciones del mismo modelo base para estudiar el impacto de la compresion en tareas de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye metricas como MMLU, HumanEval o GSM8K para esta cuantizacion especifica. Se indica cualitativamente que el modelo responde correctamente a preguntas factuales y conserva la estructura de razonamiento, pero con fluidez y precision degradadas respecto a F16 o Q4_K_M. No se proporcionan numeros concretos.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,56 GB para los pesos, mas la caché KV. Con contexto completo de 32768 tokens, el autor indica que cabe en una GPU de 4 GB con descarga completa de capas (`-ngl 999`).
- GPU recomendadas: cualquier GPU con 4 GB de VRAM o superior, por ejemplo GTX 1650, GTX 1060 6GB, RTX 3050, RTX 3060, etc. Tambien puede ejecutarse en CPU, aunque con mayor latencia.
- Compatible con GPUs consumer de gama baja; no requiere hardware de datacenter.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama, Docker Model Runner. Tambien puede usarse con bindings de Python como llama-cpp-python.
- Latencia y throughput: no se han publicado mediciones especificas. En una GPU de 4 GB se espera una generacion de varios tokens por segundo, pero la cuantizacion IQ2_XXS puede requerir decodificacion mas lenta que cuantizaciones estandar debido a la complejidad de dequantizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Tamano archivo | Contexto | Licencia |
|---|---|---|---|---|---|
| DeepSeek-R1-Distill-Qwen-1.5B (original) | 1,78B | F16 | ~3,5 GB | 32768 | MIT |
| DeepSeek-R1-Distill-Qwen-1.5B (Q4_K_M) | 1,78B | Q4_K_M | ~1,0 GB | 32768 | MIT |
| Este modelo (IQ2_XXS) | 1,78B | IQ2_XXS | 0,56 GB | 32768 | MIT |
| DeepSeek-R1-Distill-Qwen-7B (referencia) | 7,6B | F16 | ~15 GB | 32768 | MIT |

La comparativa se basa en datos publicos de los repositorios de DeepSeek y de bartowski. No se dispone de benchmarks comparativos entre estas versiones en la informacion proporcionada. La eleccion entre cuantizaciones depende del equilibrio entre tamano y calidad: IQ2_XXS es la opcion mas pequena pero con mayor perdida de fidelidad; Q4_K_M ofrece mejor calidad con el doble de espacio; F16 es la referencia original.

## Limitaciones y advertencias

- La cuantizacion IQ2_XXS es extremadamente agresiva: degrada notablemente la fluidez del texto, la precision factual y la coherencia en tareas complejas. No es recomendable para produccion donde se requiera alta calidad.
- El modelo puede alucinar o producir razonamientos incorrectos, especialmente con la compresion aplicada. La cadena de pensamiento puede contener pasos erroneos que no se detectan facilmente.
- El soporte multilingue es limitado; el rendimiento fuera del ingles es significativamente peor.
- Aunque la licencia es MIT y permite uso comercial, el modelo base DeepSeek-R1-Distill-Qwen-1.5B deriva de Qwen-2.5, que originalmente se distribuye bajo Apache 2.0. Se debe verificar la compatibilidad de licencias si se redistribuye el modelo o sus derivados.
- El contexto de 32768 tokens es el maximo anunciado, pero con la cuantizacion IQ2_XXS la calidad de atencion a contextos largos puede degradarse antes de alcanzar ese limite.
- No se han realizado evaluaciones de sesgos o seguridad especificas para esta cuantizacion. El modelo base puede heredar sesgos de los datos de entrenamiento de DeepSeek-R1 y Qwen.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/manalejandro/DeepSeek-R1-Distill-Qwen-1.5B-f16-iq2_xxs-GGUF
- Modelo base original: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Fuente GGUF de bartowski: https://huggingface.co/bartowski/DeepSeek-R1-Distill-Qwen-1.5B-GGUF
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Modelo hermano 7B: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-7B
- Pagina en ModelScope: https://www.modelscope.cn/models/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Guia de uso en GitHub: https://github.com/fabiomatricardi/Deepseek-R1-qwen1.5B
