# mradermacher/Jenzin-Wuang-Nemotron-30B-A3B-BF16-GGUF

## Resumen

Jenzin-Wuang-Nemotron-30B-A3B-BF16 es un modelo de lenguaje de gran tamano (LLM) de arquitectura MoE (Mixture of Experts) con 31.6 mil millones de parametros totales y 3 mil millones de parametros activos. Este repositorio contiene la version cuantizada en formato GGUF del modelo original publicado por ApolloRaines, preparada por mradermacher para su uso con motores de inferencia como llama.cpp, Ollama o LM Studio. El modelo base subyacente es NVIDIA Nemotron-3-Nano-30B-A3B, una familia de modelos open source de NVIDIA disenada para tareas de razonamiento, codificacion y agentes.

La relevancia de este modelo radica en su eficiencia: al ser una arquitectura MoE con solo 3B parametros activos, ofrece un rendimiento comparable a modelos densos mucho mas grandes con un coste computacional significativamente menor. La cuantizacion GGUF permite ademas ejecutarlo en hardware de consumo, democratizando el acceso a un modelo de nivel profesional. El repositorio incluye multiples niveles de cuantizacion (Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS y F16) para adaptarse a diferentes capacidades de hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) basada en NVIDIA Nemotron-3-Nano-30B-A3B |
| Parametros totales | 31.577.940.288 (31.6B) |
| Parametros activos | 3B (A3B) |
| Longitud de contexto | 1.000.000 tokens (segun NVIDIA para el modelo base) |
| Tipos de cuantizacion | F16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS |
| Idiomas soportados | no disponible (el modelo base de NVIDIA soporta principalmente ingles) |
| Licencia | no disponible (el modelo base de NVIDIA usa licencia NVIDIA Open Model License) |
| Formato de pesos | GGUF (cuantizado), safetensors (original) |

## Arquitectura y entrenamiento

El modelo base NVIDIA Nemotron-3-Nano-30B-A3B utiliza una arquitectura Transformer con mezcla de expertos (MoE), donde solo 3 mil millones de los 31.6 mil millones de parametros totales se activan por token procesado. Esta diseno permite un equilibrio entre capacidad y eficiencia computacional, reduciendo la latencia y los requisitos de memoria en comparacion con un modelo denso del mismo tamano total. El modelo fue preentrenado con una combinacion de datos rastreados y sinteticos de codigo, matematicas, ciencia y conocimiento general, segun la documentacion de NVIDIA.

La version Jenzin-Wuang es un fine-tuning del modelo base de NVIDIA, aunque los detalles especificos del proceso de ajuste (dataset utilizado, tecnica de alineacion como RLHF o DPO, epocas de entrenamiento) no estan disponibles en la informacion proporcionada. El repositorio actual contiene exclusivamente las versiones cuantizadas en formato GGUF, generadas con la herramienta de cuantizacion de llama.cpp, manteniendo la arquitectura original del modelo.

## Capacidades

- Generacion de texto y razonamiento complejo multi-paso, gracias a la arquitectura MoE de 3B parametros activos.
- Codificacion de software en multiples lenguajes de programacion, con soporte para generacion, explicacion y depuracion de codigo.
- Razonamiento matematico y cientifico, incluyendo problemas de nivel competitivo.
- Instruccion following precisa, capaz de seguir instrucciones complejas y detalladas.
- Tool calling y function calling, permitiendo la integracion con APIs y herramientas externas.
- Soporte para agentes autonomos y flujos de trabajo multi-paso.
- Ventana de contexto de 1M tokens, permitiendo procesar documentos extensos, libros completos o conversaciones muy largas.
- Capacidades multilingues limitadas, principalmente optimizado para ingles (segun el modelo base de NVIDIA).

## Casos de uso

- Atencion al cliente automatizada: con su contexto de 1M tokens, el modelo puede mantener conversaciones multi-turno muy largas recordando todos los detalles previos, gestionando consultas complejas de soporte tecnico sin perder el hilo.
- Generacion de codigo en produccion: su capacidad de tool calling permite integrarlo en pipelines de CI/CD para generar tests, revisar pull requests o autocompletar funciones, reduciendo el tiempo de desarrollo.
- Analisis de documentos legales y financieros: la ventana de contexto extendida permite procesar contratos completos, informes anuales o expedientes, extrayendo informacion relevante y resumiendo clausulas.
- Asistentes de investigacion cientifica: puede razonar sobre articulos academicos extensos, ayudar a formular hipotesis y sugerir experimentos basados en la literatura existente.
- Agentes autonomos de automatizacion: su soporte para function calling y razonamiento multi-paso lo hace adecuado para agentes que interactuan con APIs, bases de datos y herramientas de productividad.
- Educacion y tutoria: puede explicar conceptos complejos de matematicas, fisica o programacion con razonamiento paso a paso, adaptandose al nivel del estudiante.
- Desarrollo de chatbots especializados: su capacidad de seguir instrucciones y su conocimiento de codigo lo hacen util para crear asistentes tecnicos en dominios especificos como DevOps o ciberseguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para la version Jenzin-Wuang en la informacion disponible. El modelo base NVIDIA Nemotron-3-Nano-30B-A3B ha sido evaluado por NVIDIA en tareas de codificacion, razonamiento y tool calling, pero los numeros concretos no se incluyen en los datos proporcionados. Se recomienda consultar la model card oficial de NVIDIA para obtener resultados comparativos.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantizacion. Con Q4_K_M (aproximadamente 18-20 GB), cabe en GPUs de consumo como RTX 4090 (24 GB) o RTX 3090 (24 GB). Con Q8_0 (aproximadamente 32 GB), requiere GPUs profesionales como A6000 o A100.
- GPU recomendadas: RTX 3090/4090 para cuantizaciones Q4-Q6; A100, H100 o A6000 para cuantizaciones Q8_0 o F16.
- Si cabe en consumer GPU: si, con cuantizaciones Q4_K_M o inferiores en GPUs de 24 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, o servidores compatibles con GGUF como llama.cpp server o text-generation-webui.
- Latencia y throughput: no disponible, pero al ser MoE con 3B activos, la velocidad de generacion es significativamente mayor que un modelo denso de 30B, tipicamente entre 30-60 tokens/segundo en una RTX 4090 con Q4_K_M.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Jenzin-Wuang-Nemotron-30B-A3B (este) | 31.6B | 3B | 1M | no disponible | GGUF |
| NVIDIA Nemotron-3-Nano-30B-A3B | 31.6B | 3B | 1M | NVIDIA Open Model License | safetensors |
| Qwen2.5-32B-Instruct | 32.8B | 32.8B (denso) | 128K | Apache 2.0 | safetensors, GGUF |
| Mixtral-8x7B-Instruct | 46.7B | 12.9B | 32K | Apache 2.0 | safetensors, GGUF |

La principal ventaja frente a modelos densos como Qwen2.5-32B es la eficiencia: 3B activos frente a 32B, lo que reduce la latencia y el coste por token. Frente a Mixtral-8x7B, el contexto de 1M tokens es muy superior. La desventaja es la disponibilidad de la licencia, que no esta clara en este repositorio.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo base fue preentrenado con datos de codigo, matematicas y conocimiento general, por lo que puede tener sesgos en dominios sociales o culturales menos representados.
- Riesgo de alucinacion: como todo LLM, puede generar informacion falsa o inventada, especialmente en temas de actualidad o muy especificos.
- Limitaciones de contexto: aunque la ventana es de 1M tokens, el rendimiento puede degradarse en los extremos de la ventana; se recomienda no superar el 80% de la capacidad.
- Limitaciones de idioma: optimizado principalmente para ingles; el rendimiento en otros idiomas puede ser inferior.
- Restricciones de licencia: la licencia del modelo original de NVIDIA restringe el uso comercial en algunos casos; la licencia de esta version cuantizada no esta especificada, por lo que se debe contactar con el autor antes de usar en produccion.
- Caveat de produccion: al ser un fine-tuning no documentado, no hay garantias de calidad ni soporte; se recomienda evaluar exhaustivamente antes de desplegar.

## Enlaces

- Repositorio GGUF cuantizado: https://huggingface.co/mradermacher/Jenzin-Wuang-Nemotron-30B-A3B-BF16-GGUF
- Modelo original (safetensors): https://huggingface.co/ApolloRaines/Jenzin-Wuang-Nemotron-30B-A3B-BF16
- Modelo base de NVIDIA: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16
- Model card de NVIDIA NIM: https://build.nvidia.com/nvidia/nemotron-3-nano-30b-a3b/modelcard
- Pagina de NVIDIA Nemotron: https://developer.nvidia.com/topics/ai/nemotron
- Perfil de mradermacher: https://huggingface.co/mradermacher
