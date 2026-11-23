# mradermacher/MiniCPM5-2B-Supertool-i1-GGUF

## Resumen

MiniCPM5-2B-Supertool-i1-GGUF es una coleccion de cuantizaciones GGUF generadas por mradermacher a partir del modelo saidutta69/MiniCPM5-2B-Supertool, un ajuste fino orientado a tool calling y function calling sobre la base MiniCPM5 de 2B parametros. El modelo original parte de la familia MiniCPM desarrollada por OpenBMB, y este ajuste concreto se ha entrenado mediante QLoRA sobre dos datasets de instrucciones y razonamiento (saidutta69/fable-5.1-premium-v2 y MoreThought/Fable-5.1-Max-Reasoning-Filtered-10000x) con el objetivo de mejorar el comportamiento agentico y la invocacion de herramientas en modelos de pequeno tamano.

El interes principal de esta publicacion es practico: ofrece el modelo en una bateria muy amplia de cuantizaciones (desde IQ1_S de 0,8 GB hasta Q6_K de 2,2 GB), lo que permite desplegarlo en hardware muy modesto, incluidos portatiles sin GPU dedicada o GPUs de consumo con poca VRAM. Con 2.516.756.480 parametros totales y licencia Apache 2.0, es un candidato razonable para prototipos de agentes locales, automatizacion de tareas y pipelines de function calling donde no se dispone de infraestructura de servidor.

No se dispone de informacion sobre la longitud de contexto, la composicion exacta del dataset de entrenamiento ni resultados de benchmarks en la informacion proporcionada; la model card del cuantizador se limita a describir el proceso de cuantizacion y los ficheros generados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base MiniCPM5); detalles especificos no disponibles |
| Parametros totales | 2.516.756.480 (~2,5 mil millones) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF i1 (imatrix): IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K; tambien existe version estatica en mradermacher/MiniCPM5-2B-Supertool-GGUF |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base se distribuye en formato transformers |

## Arquitectura y entrenamiento

El modelo base saidutta69/MiniCPM5-2B-Supertool es un ajuste fino de MiniCPM5-2B, un transformer decoder-only de aproximadamente 2,5 mil millones de parametros. El ajuste se realizo con QLoRA, segun las etiquetas de la model card, sobre dos datasets: saidutta69/fable-5.1-premium-v2 y MoreThought/Fable-5.1-Max-Reasoning-Filtered-10000x. El primero parece orientado a instrucciones de calidad, y el segundo, por su nombre, a razonamiento filtrado; no se especifica el numero de tokens de entrenamiento, la mezcla exacta ni si hubo fases adicionales de RLHF o DPO.

La publicacion de mradermacher es exclusivamente un proceso de cuantizacion: aplica cuantizacion con imatrix (denominada i1) sobre los pesos del modelo ajustado, generando ficheros GGUF con distintos niveles de compresion. No se introduce ningun cambio arquitectonico respecto al modelo original; las innovaciones tecnicas del modelo base (mecanismos de atencion, posibles optimizaciones de decodificacion, etc.) no se detallan en la informacion disponible.

## Capacidades

- Generacion de texto conversacional en ingles.
- Tool calling y function calling: el ajuste esta explicitamente orientado a la invocacion estructurada de herramientas, segun las etiquetas tool-calling y function-calling.
- Comportamiento agentico: etiquetas agents y claude-code sugieren entrenamiento orientado a flujos de trabajo de agentes y entornos de tipo CLI.
- Razonamiento multi-paso: el dataset MoreThought/Fable-5.1-Max-Reasoning-Filtered-10000x apunta a datos de razonamiento, aunque no se cuantifica su efecto.
- Multilingue: solo se declara ingles (en); no hay soporte declarado de castellano ni de otros idiomas.
- Capacidades de vision, audio o thinking mode explicito: no disponibles en la informacion proporcionada.

## Casos de uso

- Agentes locales de automatizacion: con cuantizaciones de 1,6-1,7 GB (Q4_K_S/Q4_K_M) el modelo cabe en GPUs de consumo y en CPU, lo que permite ejecutar bucles de agente con tool calling en un portatil sin depender de la nube.
- Prototipado de function calling: util para validar esquemas de herramientas y parsers de llamadas antes de migrar a modelos mayores, gracias a su entrenamiento especifico en tool calling y a su bajo coste de inferencia.
- Asistentes de linea de comandos: la etiqueta claude-code indica entrenamiento orientado a interacciones de tipo CLI; puede usarse como backend local para asistentes que ejecutan comandos y editan ficheros.
- Enrutamiento y clasificacion de intenciones: modelo pequeno y rapido adecuado para decidir que herramienta o subflujo activar en un sistema multi-agente, reservando modelos mayores para la generacion final.
- Extraccion estructurada de datos: con function calling puede formatear salidas JSON a partir de texto de entrada en pipelines ETL o de ingestion de documentos.
- Educacion y experimentacion: su tamano (desde 0,8 GB en IQ1_S) permite estudiar el efecto de la cuantizacion en la calidad de las llamadas a herramientas en hardware muy limitado.
- Despliegue en edge: cuantizaciones Q4 y Q5 caben en dispositivos con 2-4 GB de RAM, habilitando asistentes offline en entornos sin conectividad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia (segun tamano de fichero GGUF): IQ1_S ~0,8 GB; IQ2_M ~1,1 GB; IQ3_M ~1,3 GB; Q4_K_M ~1,7 GB; Q5_K_M ~1,9 GB; Q6_K ~2,2 GB. Anadir margen para el contexto KV cache (depende de la longitud de contexto, no disponible).
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM puede ejecutar las cuantizaciones Q4/Q5; RTX 3060, RTX 4060, RTX 4090 y A100/H100 sobran para este tamano. Las cuantizaciones IQ2/IQ3 caben en GPUs integradas con memoria compartida.
- Cabe en GPU de consumo: si, en practicamente todas las GPU discretas modernas, e incluso en CPU pura con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF; la etiqueta endpoints_compatible sugiere compatibilidad con endpoints de tipo OpenAI. vLLM y TGI no soportan GGUF de forma nativa generalizada, por lo que para esos motores habria que usar el modelo base en safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada; por tamano, se espera alta velocidad en GPU de consumo, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MiniCPM5-2B-Supertool-i1-GGUF (este) | ~2,5B | no disponible | Apache 2.0 | GGUF (multiples cuantizaciones) | Ajuste QLoRA para tool calling; solo ingles |
| saidutta69/MiniCPM5-2B-Supertool (base) | ~2,5B | no disponible | Apache 2.0 | transformers | Modelo original sin cuantizar |
| mradermacher/MiniCPM5-2B-Supertool-GGUF | ~2,5B | no disponible | Apache 2.0 | GGUF estatico | Misma base, cuantizaciones sin imatrix |
| Alternativas de ~2-3B para tool calling (Qwen2.5-3B-Instruct, Llama-3.2-3B-Instruct) | ~3B | 32K-128K segun modelo | Apache 2.0 / Llama license | safetensors, GGUF | Datos no verificados en esta busqueda; se citan como referencia de categoria, no como comparacion medida |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Idioma: solo se declara ingles; el rendimiento en castellano no esta garantizado ni documentado.
- Contexto: se desconoce la longitud de contexto soportada, lo que impide planificar conversaciones largas o documentos extensos con garantias.
- Alucinacion: como todo modelo de 2,5B, la tasa de alucinacion en tareas de razonamiento abierto es previsiblemente alta; el uso recomendado es como componente de sistemas con validacion externa.
- Cuantizaciones agresivas: las variantes IQ1 e IQ2 degradan la calidad de forma notable; la propia model card advierte que IQ1_S es "for the desperate" y que Q2_K_S es de "very low quality". Para produccion se recomienda Q4_K_M o superior.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base original (MiniCPM5) por si impone condiciones adicionales no reflejadas en esta ficha.
- Sesgos: no hay documentacion sobre evaluacion de sesgos en la informacion disponible.
- Fecha de publicacion: la model card indica creacion en noviembre de 2026; verificar la vigencia y posibles actualizaciones del modelo base.

## Enlaces

- Repositorio Hugging Face (este modelo): https://huggingface.co/mradermacher/MiniCPM5-2B-Supertool-i1-GGUF
- Modelo base: https://huggingface.co/saidutta69/MiniCPM5-2B-Supertool
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/MiniCPM5-2B-Supertool-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#MiniCPM5-2B-Supertool-i1-GGUF
- Dataset saidutta69/fable-5.1-premium-v2: https://huggingface.co/datasets/saidutta69/fable-5.1-premium-v2
- Dataset MoreThought/Fable-5.1-Max-Reasoning-Filtered-10000x: https://huggingface.co/datasets/MoreThought/Fable-5.1-Max-Reasoning-Filtered-10000x
- FAQ y solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
