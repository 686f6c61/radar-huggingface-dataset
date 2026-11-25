# pranil00/ONIX-deepseek-coder-33b-instruct-GGUF

## Resumen

ONIX-deepseek-coder-33b-instruct-GGUF es una cuantización del modelo deepseek-ai/deepseek-coder-33b-instruct, publicada por el usuario pranil00 bajo la etiqueta de la comunidad ONIX. Se trata de un artefacto GGUF de 11,00 GB obtenido con el esquema IQ2_M (2,7 bits por peso), lo que reduce el peso original en FP16 (65,21 GB) en un 83,1 % y permite ejecutar un modelo de 33.342.984.192 parámetros en equipos de consumo con 11-13 GB de memoria. El modelo base es un transformer decoder-only especializado en código, publicado originalmente por DeepSeek con licencia Apache 2.0.

La relevancia de esta ficha es doble: por un lado, documenta una receta concreta de compresión agresiva para llevar un modelo de 33B a portátiles y GPUs de gama media; por otro, advierte de que la fidelidad declarada por el autor es del 82,0 % respecto al baseline, con degradación explícita en razonamiento matemático complejo. El repositorio no incluye información sobre idiomas soportados ni resultados de benchmarks propios, por lo que buena parte de las especificaciones del modelo base deben consultarse en su model card original.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 25 de noviembre de 2026. Se trata, por tanto, de un artefacto reciente y sin validación comunitaria, lo que debe tenerse en cuenta antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia DeepSeek), según modelo base |
| Parametros totales | 33.342.984.192 (33,34 B) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 8.192 tokens (ventana óptima declarada por el autor); 4.096 tokens en CPU |
| Tipos de cuantizacion | IQ2_M (2,7 bits por peso); el autor menciona KV cache Q4_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |
| Tamano del artefacto | 11,00 GB (11.268,5 MB) |
| Ratio de compresion | 5,93x respecto a FP16 (83,1 % de reducción) |
| Fidelidad declarada | ~82,0 % de retención cognitiva |
| Categoria de viabilidad | TIGHT FIT (compacted) |
| Libreria | gguf |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base más allá de su pertenencia a la familia DeepSeek y de su naturaleza de modelo de código instruido. No se detallan el número de capas, la dimensión oculta, el mecanismo de atención ni la composición del dataset de entrenamiento. Tampoco se especifican procesos de RLHF, DPO o ajuste por instrucciones más allá de la denominación "instruct" del modelo original.

La innovación técnica documentada en esta ficha se limita al proceso de cuantización: el motor run-any-model aplica un esquema IQ2_M de 2,7 bits por peso que reduce el tamaño de 65,21 GB a 11,00 GB, con una caché KV optimizada a Q4_0 (248 MB). El autor declara que las 62 capas del modelo se aceleran de forma óptima en Metal, CUDA y AVX2/AVX-512. No se documenta el método de calibración, el conjunto de datos de calibración ni el impacto por capa de la compresión.

## Capacidades

- Generación de texto y código: el modelo base está especializado en generación y completado de código en múltiples lenguajes de programación.
- Razonamiento matemático: capacidad declarada en el modelo base, aunque el propio autor advierte de posible degradación menor en razonamiento matemático complejo tras la cuantización a 2,7 bpw.
- Instrucciones conversacionales: el sufijo "instruct" del modelo base indica ajuste para seguir instrucciones en formato conversacional.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el autor no declara idiomas soportados.
- Modo thinking, visión o audio: no disponible; el modelo base es de texto.
- Ejecución multiplataforma: el artefacto está pensado para Metal (Apple Silicon), CUDA (NVIDIA) y CPU con AVX2/AVX-512.

## Casos de uso

- Asistencia de código en local para desarrolladores con portátil: el artefacto de 11 GB cabe en un Mac con 16 GB de memoria unificada o en una GPU con 12 GB de VRAM, lo que permite autocompletado y explicación de código sin conexión a servicios en la nube.
- Revisión de código en entornos con requisitos de privacidad: al ejecutarse íntegramente en local, el modelo puede analizar repositorios propietarios sin que el código salga del equipo, usando la ventana de 8.192 tokens para incluir varios ficheros en el prompt.
- Generación de tests unitarios y documentación técnica: el modelo puede producir tests y docstrings a partir de fragmentos de código, integrándose en scripts de pre-commit o pipelines de CI mediante llama.cpp u Ollama.
- Prototipado rápido en estaciones de trabajo sin GPU dedicada: con 13,38 GB de RAM libre y soporte AVX2/AVX-512, se puede usar en CPU con contexto de 4.096 tokens para tareas de completado y refactorización de funciones cortas.
- Educación y experimentación con cuantización: sirve como caso de estudio para evaluar la pérdida de calidad de IQ2_M frente a FP16 en tareas de código, comparando salidas sobre el mismo prompt.
- Despliegue en entornos embebidos o edge con Ollama: el Modelfile incluido en la model card permite crear una imagen de Ollama y ejecutar el modelo como servicio local para herramientas de CLI o plugins de editor.
- Traducción de código entre lenguajes (por ejemplo, Python a Rust): el modelo base está entrenado en múltiples lenguajes, aunque la cuantización agresiva puede afectar a la corrección sintáctica en lenguajes menos representados.

## Benchmarks y rendimiento

El autor publica una matriz de auditoría de compresión, no de calidad de tareas:

| Metrica | Baseline (FP16) | Cuantizado (IQ2_M) | Cambio |
|---|---|---|---|
| Precision en bits por parametro | 16,0 | 2,7 | -83,1 % |
| Tamano de pesos | 65,21 GB | 11,00 GB | -83,1 % |
| KV cache | 248,0 MB (FP16) | 248,0 MB (Q4_0) | Optimizado |
| RAM residente total | 66,31 GB | 11,38 GB | -82,8 % |
| Categoria de viabilidad | Inusable / crash | TIGHT FIT | Validado |
| Calidad estimada | 100,0 % baseline | 82,0 % retenida | -18,0 % |
| Aceleracion por capas | 0 % | 62/62 capas | Optimo |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la información disponible. La cifra de "82,0 % de retención cognitiva" es una estimación del autor y no se acompaña de la metodología de evaluación.

## Requisitos de hardware

- Apple Silicon (M1/M2/M3/M4/M5): 11,38 GB de memoria unificada, contexto óptimo de 8.192 tokens, aceleración Metal nativa.
- NVIDIA GPU (RTX 30/40/50): 12,50 GB de VRAM dedicada, contexto de 8.192 tokens, aceleración CUDA.
- PC Windows/Linux en CPU: 13,38 GB de RAM libre, contexto de 4.096 tokens, soporte AVX2/AVX-512.
- Cabe en GPUs de consumo: sí, en tarjetas con 12 GB o más de VRAM (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090) y en Mac con 16 GB unificados.
- Opciones de despliegue: run-any-model CLI, Ollama (con Modelfile), llama.cpp (`llama-cli`), LM Studio, Jan y Text-Generation-WebUI.
- Latencia y throughput: no disponible; el autor no publica tokens por segundo ni latencias medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ONIX-deepseek-coder-33b-instruct-GGUF (esta ficha) | 33,34 B | 8.192 tokens | GGUF IQ2_M (11 GB) | Apache 2.0 | Hugging Face, 0 descargas |
| deepseek-ai/deepseek-coder-33b-instruct | 33,34 B | no disponible en esta ficha | safetensors (FP16/BF16) | Apache 2.0 | Hugging Face, modelo original |
| Otras cuantizaciones GGUF del mismo base (p. ej. Q4_K_M, Q5_K_M) | 33,34 B | depende del runtime | GGUF, 4-5 bits por peso | Apache 2.0 | disponibles en el ecosistema, no verificadas en esta ficha |

La comparación con alternativas de otros fabricantes (por ejemplo, modelos de código de 30-34B de otras familias) no está disponible en la información proporcionada. La diferencia clave frente al modelo original es el tamaño (11 GB frente a 65,21 GB) y la pérdida declarada de calidad (18 %), a cambio de poder ejecutarse en hardware de consumo.

## Limitaciones y advertencias

- La cuantización IQ2_M a 2,7 bits por peso es agresiva: el autor declara una retención del 82,0 % y advierte de degradación en razonamiento matemático complejo. No se aporta metodología de evaluación.
- Riesgo de alucinación y de errores sintácticos en código: la compresión puede producir salidas plausibles pero incorrectas, especialmente en lenguajes poco representados o APIs recientes.
- Idiomas soportados no declarados: no se puede garantizar un rendimiento aceptable fuera del inglés y de los lenguajes de programación habituales.
- Ventana de contexto limitada a 8.192 tokens en GPU/Metal y 4.096 en CPU, inferior a la del modelo base original (que no se detalla en esta ficha).
- Artefacto sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta; el repositorio se creó el 25 de noviembre de 2026.
- La model card incluye una disclaimer de responsabilidad absoluta que traslada al usuario toda la responsabilidad sobre la validación de las salidas; no sustituye a una auditoría de calidad.
- Licencia Apache 2.0 heredada del modelo base: permite uso comercial, pero conviene verificar los términos del modelo original deepseek-ai/deepseek-coder-33b-instruct antes de desplegarlo.
- El autor no documenta el conjunto de calibración ni el impacto de la cuantización por capa, lo que dificulta reproducir o auditar el proceso.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pranil00/ONIX-deepseek-coder-33b-instruct-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/deepseek-coder-33b-instruct
- Organización ONIX: https://huggingface.co/ONIX
- Motor de cuantización run-any-model: https://github.com/PranilShah-08/run-any-model
