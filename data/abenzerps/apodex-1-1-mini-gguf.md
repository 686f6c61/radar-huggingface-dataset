# abenzerps/Apodex-1.1-mini-GGUF

## Resumen

Apodex-1.1-mini-GGUF es una cuantizacion en formato GGUF del modelo base apodex/Apodex-1.1-mini, desarrollado por Apodex AI y convertido por el usuario abenzerps. Se trata de un modelo de arquitectura Qwen3.5 MoE (mixture of experts) con 35.505 millones de parametros totales, disenado para tareas de larga duracion que implican investigacion, manipulacion de archivos, analisis de datos, generacion de codigo y uso de herramientas. Es multimodal: admite entrada de texto e imagen, y para esta ultima requiere el proyector de vision F16 incluido en el repositorio.

El modelo destaca por su integracion con el runtime de agentes FrontierAgent de Apodex AI, que permite un modo "Agent Team" donde un coordinador divide el trabajo en subtareas delegadas a subagentes paralelos. La licencia Apache 2.0 facilita su uso comercial y la cuantizacion Q4_K_M ocupa 21,7 GB, lo que lo hace desplegable en GPUs de consumo con 24 GB de VRAM. La version 1.0 del modelo anunciaba una ventana de contexto de 262K tokens, aunque para la 1.1 no se ha publicado el dato exacto en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5MoeForConditionalGeneration / qwen35moe |
| Parametros totales | 35.505.251.456 (aprox. 35,5B) |
| Parametros activos | no disponible (arquitectura MoE) |
| Longitud de contexto | no disponible (la version 1.0 del modelo anunciaba 262K tokens) |
| Tipos de cuantizacion | Q4_K_M (21,7 GB) |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo original en safetensors) |

## Arquitectura y entrenamiento

Apodex-1.1-mini emplea una arquitectura de mixture of experts basada en Qwen3.5, con 35,5 mil millones de parametros totales. El modelo es multimodal: procesa texto e imagen mediante un proyector de vision independiente (F16, 899 MB) que se combina con el GGUF principal solo cuando se requiere entrada visual. La cuantizacion se realizo desde BF16 a Q4_K_M utilizando llama.cpp en el commit `f280b26983ad0fdb705a0d9ebf0503e76f2899b0`, y los archivos fuente fueron verificados contra sus hashes LFS de Hugging Face antes de la conversion.

El modelo esta disenado para trabajo de "larga duracion" (long-horizon) con investigacion, archivos, datos, codigo y herramientas. Apodex AI ha desarrollado FrontierAgent, un runtime de agentes y harness de evaluacion open source, sobre el que se construye el modo "Agent Team": un coordinador divide el trabajo en subtareas, las delega en subagentes paralelos, recoge los resultados y prepara la respuesta final. La informacion de entrenamiento (numero de tokens, composicion del dataset, metodos de RLHF/DPO) no esta disponible en la documentacion publicada.

## Capacidades

- Generacion de texto y razonamiento multi-paso con arquitectura MoE de 35,5B parametros.
- Entrada multimodal: texto e imagen, mediante el proyector de vision F16 incluido en el repositorio.
- Soporte de agentes: el sistema Agent Team basado en FrontierAgent permite delegacion de tareas a subagentes paralelos.
- Uso de herramientas y manejo de archivos, orientado a flujos de trabajo de investigacion y datos.
- Capacidades multilingues limitadas a ingles y chino.
- Compatible con llama.cpp y su ecosistema (llama-cli, llama-mtmd-cli).

## Casos de uso

- **Investigacion automatizada**: el modelo puede descomponer un problema de investigacion en subtareas (lectura de articulos, extraccion de datos, sintesis) y delegarlas a subagentes paralelos, gracias al sistema Agent Team.
- **Analisis de documentos con soporte visual**: combinando el GGUF principal con el proyector de imagen, puede procesar documentos que incluyen figuras, diagramas o capturas de pantalla junto con texto.
- **Generacion de codigo en produccion**: con su soporte de herramientas y su arquitectura MoE, puede integrarse en pipelines de desarrollo para autocompletar, revisar o generar fragmentos de codigo.
- **Asistencia en finanzas**: segun los resultados publicados, obtiene 50,2 en FrontierFinance, lo que sugiere capacidad para razonar sobre datos financieros estructurados y tomar decisiones de analisis.
- **Razonamiento cientifico**: con 51,7 en FrontierScience-Research, puede apoyar la sintesis de literatura cientifica, la formulacion de hipotesis o la interpretacion de resultados experimentales.
- **Automatizacion de tareas de oficina**: su capacidad de manejar archivos y datos junto con su ventana de contexto larga (heredada de la familia Qwen3.5) lo hace adecuado para resumir documentos extensos, extraer informacion de bases de conocimiento y generar informes.

## Benchmarks y rendimiento

Los siguientes resultados proceden de la model card del modelo original de Apodex AI y se obtuvieron con la configuracion Agent Team. La cuantizacion GGUF no ha sido evaluada de forma independiente sobre estos benchmarks.

| Benchmark | Resultado (Agent Team) |
|---|---|
| APEX-Agent | 27,7 |
| FrontierFinance | 50,2 |
| FrontierScience-Research | 51,7 |

Nota: el repositorio GGUF indica explicitamente que estos valores se reproducen de la evaluacion del modelo original y que esta version cuantizada no ha sido evaluada por separado. No se han publicado resultados de benchmarks clasicos (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada**: el archivo Q4_K_M ocupa 21,7 GB, por lo que se recomienda una GPU con al menos 24 GB de VRAM para inferencia comoda (el proyector de imagen anade 899 MB adicionales).
- **GPU recomendadas**: NVIDIA RTX 3090 o RTX 4090 (24 GB) son suficientes para la cuantizacion Q4_K_M. Para GPUs con menos VRAM, se requeriria una cuantizacion de menor precision (no disponible actualmente).
- **Despliegue**: compatible con llama.cpp (commit `f280b26983ad0fdb705a0d9ebf0503e76f2899b0` o posterior) y con herramientas basadas en el mismo, como Ollama o llama-cpp-python.
- **Latencia y throughput**: no se han publicado datos de latencia o throughput para esta cuantizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Cuantizacion GGUF |
|---|---|---|---|---|
| Apodex-1.1-mini (GGUF) | 35,5B (MoE) | no disponible | Apache 2.0 | Q4_K_M |
| Apodex-1.0-mini | no disponible | 262K tokens | no disponible | no disponible |
| Agents-A1-F16-GGUF | no disponible | no disponible | no disponible | F16 |

La comparativa con Agents-A1-F16-GGUF (disponible en benchlm.ai) no ofrece un veredicto compartido de benchmarks, por lo que no es posible establecer una comparacion cuantitativa fiable. Apodex-1.0-mini es la version anterior de la misma familia y comparte caracteristicas de contexto largo (262K tokens), pero no hay datos publicos de rendimiento comparativo entre ambas.

## Limitaciones y advertencias

- **Idiomas limitados**: el modelo solo soporta ingles y chino; no tiene capacidades multilingues para otros idiomas, incluido el espanol.
- **Riesgo de alucinacion**: como todos los modelos generativos, puede producir contenido plausible pero incorrecto, especialmente en tareas de razonamiento complejo; el sistema Agent Team mitiga parcialmente este riesgo mediante verificacion de pasos.
- **Contexto no confirmado**: la longitud de contexto de la version 1.1 no esta publicada en la informacion disponible; la version 1.0 anunciaba 262K, pero no se debe asumir ese valor para esta version.
- **Evaluacion de la cuantizacion**: los resultados de benchmarks corresponden al modelo original en BF16; la cuantizacion Q4_K_M puede degradar el rendimiento en tareas de precision.
- **Licencia**: Apache 2.0 permite uso comercial sin restricciones de atribucion, pero se debe mantener el aviso de licencia y atribucion del modelo original.
- **Dependencia de llama.cpp**: se requiere una version de llama.cpp posterior al commit `f280b94983ad0fdb705a0d9ebf0503e76f2899b0` para compatibilidad total con la arquitectura qwen35moe.
- **Solo una cuantizacion disponible**: actualmente solo existe Q4_K_M; no hay versiones Q8, Q5 o Q6 para ajustar el balance de calidad y requisitos de hardware.

## Enlaces

- Repositorio GGUF: https://huggingface.co/abenzerps/Apodex-1.1-mini-GGUF
- Modelo base original: https://huggingface.co/apodex/Apodex-1.1-mini
- Modelo Apodex-1.0-mini: https://huggingface.co/apodex/Apodex-1.0-mini
- Organizacion Apodex AI en Hugging Face: https://huggingface.co/apodex
- Repositorio de FrontierAgent: https://github.com/ApodexAI/FrontierAgent
- Sitio web de Apodex: https://www.apodex.com/
- Comparativa con Agents-A1-F16-GGUF: https://benchlm.ai/compare/agents-a1-f16-gguf-vs-apodex-1-1-mini
- Referencia de Apodex 1.0 Mini en LLM Reference: https://www.llmreference.com/model/apodex-1.0-mini
