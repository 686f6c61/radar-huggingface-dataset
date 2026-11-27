# ArchiveStudio/Kolibri-1.1

## Resumen

Kolibri 1.1 es un modelo de lenguaje de tipo mixture-of-experts (MoE) desarrollado por Aleph Alpha Research GmbH, orientado a razonamiento explícito y a un rendimiento sólido en aleman e ingles. Con 75.128.393.984 parametros totales y solo 3.439.874.304 parametros activos por token, el modelo busca un equilibrio entre capacidad y coste de inferencia: activa aproximadamente un 4,6 % de sus parametros en cada paso, lo que reduce el computo por token manteniendo la capacidad de un modelo mucho mayor. Es el sucesor de Kolibri 1 y anade atencion dispersa (sparse attention) para abaratar los contextos largos.

La arquitectura combina dos capas densas con 48 capas MoE (384 expertos enrutados, 6 seleccionados por token y 1 experto compartido), con una proporcion 4:1 entre atencion de ventana deslizante y atencion dispersa. El modelo tiene una longitud de contexto nativa de 262.144 tokens, ampliable hasta 1.048.576 tokens, aunque el propio autor recomienda no superar los 262.144 en tareas complejas. Soporta modo de razonamiento explícito y tool calling, y se distribuye bajo licencia Apache 2.0.

Su relevancia actual radica en la relacion entre rendimiento y coste de servicio: segun la model card, alcanza un 73,2 % en su puntuacion agregada de benchmarks con 0,21 GPU-horas por cada 1.000 tareas de evaluacion, frente al 66,6 % y 0,72 GPU-horas de Kolibri 1. El modelo esta pensado para asistentes en aleman e ingles, generacion de codigo, RAG sobre documentos largos y flujos agénticos con llamadas a herramientas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE: 2 capas densas + 48 capas MoE (384 expertos enrutados, 6 por token, 1 experto compartido); atencion ventana deslizante/dispersa 4:1 |
| Parametros totales | 75.128.393.984 (75B) |
| Parametros activos | 3.439.874.304 (3,44B por token) |
| Longitud de contexto | 262.144 tokens nativos; hasta 1.048.576 tokens (recomendado ≤262.144) |
| Tipos de cuantizacion | Pesos FP8 en el repo principal; cuantizaciones GGUF publicadas en repositorio aparte |
| Idiomas soportados | Aleman e ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP8); GGUF disponible por separado |

## Arquitectura y entrenamiento

Kolibri 1.1 es un transformer con mezcla de expertos que parte de un checkpoint de mid-training de Kolibri 1. La pila consta de 2 capas densas seguidas de 48 capas MoE, cada una con 384 expertos enrutados de los que se seleccionan 6 por token, mas un experto compartido siempre activo. La atencion combina capas de ventana deslizante con capas de atencion dispersa en una proporcion 4:1, lo que reduce el coste de los contextos largos al hacer que la mayoria de capas miren solo texto cercano mientras unas pocas seleccionan fragmentos relevantes del contexto completo. El entrenamiento empleo el optimizador Muon y la tecnica Exact Quantile Balancing para el enrutamiento de expertos.

El preentrenamiento continua desde Kolibri 1 tras 20 billones (20T) de tokens de preentrenamiento y 3,42T de mid-training, con 805.000 millones (805B) adicionales de mid-training y 201B de contexto largo, ambos ya con atencion dispersa. El post-entrenamiento incluye una fase de SFT con datos bilingues filtrados que combinan conjuntos de datos abiertos y datos sinteticos, seguida de RL sobre una mezcla amplia de entornos que cubren razonamiento, uso agéntico y seguimiento de instrucciones. El computo total declarado para las fases propias de Kolibri 1.1 es de 5,52×10²² FLOPs, sin contar los 5,65×10²³ FLOPs del entrenamiento heredado de Kolibri 1. El corte de conocimiento es el 18 de junio de 2026 para ambos idiomas.

## Capacidades

- Generacion de texto conversacional en aleman e ingles, con calidad equilibrada entre ambos idiomas (el benchmark agregado pondera cada idioma al 50 %).
- Razonamiento multi-paso con modo de razonamiento explícito activable.
- Generacion y analisis de codigo.
- Tool calling / function calling para integracion en sistemas externos.
- Uso agéntico: entrenado con RL sobre entornos que cubren flujos agénticos y de seguimiento de instrucciones.
- Procesamiento de documentos largos y recuperacion aumentada (RAG) gracias a su contexto nativo de 262.144 tokens.
- Extraccion estructurada de informacion a partir de texto.
- Capacidad de ampliar contexto hasta 1.048.576 tokens, con posible perdida de calidad en tareas complejas.

## Casos de uso

- Atencion al cliente automatizada en aleman e ingles: el modelo puede mantener conversaciones multi-turno con historial extenso gracias a sus 262.144 tokens de contexto nativo, y usar tool calling para consultar sistemas internos de pedidos o cuentas.
- RAG sobre documentacion corporativa extensa: con contexto nativo de 262.144 tokens puede ingerir multiples documentos completos en una sola llamada, reduciendo la necesidad de fragmentacion agresiva y perdida de contexto entre trozos.
- Generacion de codigo en produccion: soporta tool calling y puede integrarse en pipelines de CI/CD para revision de parches, generacion de tests o explicacion de errores, con la ventaja de un coste de servicio bajo por su reducido numero de parametros activos.
- Procesamiento de documentos legales o administrativos largos: contratos, expedientes o normativa de cientos de paginas en aleman, con extraccion estructurada y resumenes con trazabilidad sobre el texto fuente.
- Asistentes agénticos multi-paso: el entrenamiento con RL en entornos agénticos y el soporte de tool calling permiten construir agentes que planifican, invocan APIs y verifican resultados en varios pasos.
- Analisis de codigo y migraciones tecnicas: el contexto largo permite cargar repositorios o modulos completos y razonar sobre dependencias entre ficheros.
- Despliegue en infraestructura europea con requisitos de soberania: al ser Apache 2.0 y de un proveedor europeo, encaja en entornos con requisitos de cumplimiento estrictos que prefieren modelos autoalojados.

## Benchmarks y rendimiento

La model card publica una puntuacion agregada de benchmarks y su coste asociado, pero no desglosa resultados por benchmark individual (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

| Metrica | Kolibri 1.1 | Kolibri 1.0 | Qwen3.8 Flash Next | GLM-5.3 Flash | Qwen3.8 27B |
|---|---|---|---|---|---|
| Puntuacion agregada | 73,2 % | 66,6 % | en la frontera de Pareto (valor no disponible) | no disponible | no disponible |
| GPU-horas por 1.000 tareas | 0,21 | 0,72 | no disponible | 2,49 | 1,97 |

El coste se modelo con el throughput de prefill y decode medido con vLLM 0.33 en un nodo de 8×B200, con pesos de 8 bits (GPT-OSS 120B con sus propios pesos MXFP4), a ocho longitudes de contexto (1k, 2k, 4k, 16k, 32k, 64k, 128k y 256k tokens; GPT-OSS 120B hasta 128k), interpolando entre ellas y eligiendo el layout mas rapido por modelo entre TP1, TP2, TP4, TP8, DP4+EP4, DP8+EP8, DP4×TP2+EP8, DP2×TP4+EP8 y TP8+EP8.

## Requisitos de hardware

- Huella de memoria del modelo: aproximadamente 77,6 GB.
- Minimo declarado por el autor: 2× H100 SXM5, 2× H200, 1× B200 o 1× B300.
- Configuracion recomendada: 4× H100 SXM5, 2× H200, 2× B200 o 1× B300.
- No cabe en GPUs de consumo: incluso en FP8 o GGUF, los 75B de parametros totales deben residir en memoria, por lo que no es viable en una RTX 4090 (24 GB) ni en configuraciones consumer tipicas.
- Despliegue: el repo declara la libreria vLLM; existen cuantizaciones GGUF en el repositorio de Aleph Alpha, lo que abre la puerta a llama.cpp u Ollama en configuraciones multi-GPU o con offload a CPU, aunque no se han publicado cifras de rendimiento para esas rutas.
- Throughput y latencia: el autor midio el rendimiento con vLLM 0.33 en 8×B200 para el calculo de coste, pero no se publican cifras absolutas de tokens por segundo en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Coste relativo (GPU-h/1.000 tareas) |
|---|---|---|---|---|---|
| Kolibri 1.1 | 75B | 3,44B | 262.144 (hasta 1.048.576) | Apache 2.0 | 0,21 |
| Kolibri 1.0 | no disponible | no disponible | no disponible | Apache 2.0 (segun predecesor) | 0,72 |
| Qwen3.8 Flash Next | no disponible | no disponible | no disponible | no disponible | en la frontera de Pareto |
| GLM-5.3 Flash | no disponible | no disponible | no disponible | no disponible | 2,49 |
| Qwen3.8 27B | no disponible | no disponible | no disponible | no disponible | 1,97 |

La informacion disponible solo permite comparar la puntuacion agregada y el coste de servicio; no se detallan parametros, contexto ni licencia de los modelos alternativos.

## Limitaciones y advertencias

- Idiomas limitados a aleman e ingles; el rendimiento en castellano u otros idiomas no esta garantizado ni documentado.
- Riesgo de alucinacion inherente a los modelos de lenguaje; el corte de conocimiento del 18 de junio de 2026 implica que la informacion posterior solo puede obtenerse mediante herramientas.
- El contexto ampliado hasta 1.048.576 tokens puede degradar la calidad en tareas complejas; el autor recomienda no superar los 262.144 tokens.
- El modelo completo debe residir en memoria aunque solo se active una fraccion de los parametros, lo que encarece el despliegue en infraestructura frente a modelos densos de menor tamano.
- No se han publicado resultados desglosados por benchmark ni evaluaciones independientes en la informacion disponible; las cifras de rendimiento proceden del propio autor.
- Aunque la licencia es Apache 2.0, Aleph Alpha publica una guia de uso responsable separada que conviene revisar antes de integrar el modelo en produccion.
- Aleph Alpha es firmante del Codigo de Practica de GPAI de la UE, lo que puede implicar obligaciones de documentacion y transparencia para despliegues en la Union Europea.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ArchiveStudio/Kolibri-1.1
- Cuantizaciones GGUF: https://huggingface.co/Aleph-Alpha/Kolibri-1.1-GGUF
- Blog post de Kolibri 1.1: https://aleph-alpha.com/en/blog/kolibri-1-1/
- Informe tecnico de Kolibri 1: https://aleph-alpha.com/downloads/tech-report.pdf
- Guia de uso responsable: https://huggingface.co/Aleph-Alpha/Kolibri-1.1/blob/main/RESPONSIBLE_USE.md
- Codigo de Practica GPAI de la UE: https://digital-strategy.ec.europa.eu/en/policies/contents-code-gpai
- Paper referenciado (arXiv 2512.11614): https://arxiv.org/abs/2512.11614
- Paper referenciado (arXiv 2601.17858): https://arxiv.org/abs/2601.17858
