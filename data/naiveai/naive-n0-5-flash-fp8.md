# NaiveAI/Naive-N0.5-Flash-FP8

## Resumen

Naive-N0.5-Flash es un modelo de lenguaje de pesos abiertos desarrollado por NaiveAI, presentado como un MoE de 309.000 millones de parametros totales con 15.500 millones de parametros activos por token. Esta diseñado especificamente para tareas de programacion e I+D en inteligencia artificial, y su rasgo mas distintivo es una ventana de contexto nativa de 1 millon de tokens construida sin capas de atencion completa: toda la red es local (Sliding-Window Attention) o dispersa (DeepSeek Sparse Attention). La version publicada en HuggingFace, Naive-N0.5-Flash-FP8, distribuye los pesos cuantizados en FP8, lo que explica el tamaño del repositorio (315,1 GB).

El modelo parte del base MiMo-V2.5 y sustituye sus capas de atencion global por un esquema hibrido SWA–DSA con GQA de cuatro grupos KV, con una composicion de 39 capas SWA y 9 capas DSA sobre un total de 48 capas transformer. Es relevante ahora porque combina tres tendencias activas en 2026: arquitecturas MoE de activacion dispersa, atencion eficiente para contextos de un millon de tokens y despliegue bajo licencia MIT con API de pago asociada.

NaiveAI acompaña los pesos con NaiveRT, un sistema de inferencia propio que, segun el autor, alcanza 50 tokens/s por usuario en modo estandar y hasta 2.000 tokens/s en modo Ultrafast mediante fusion de mega-kernels, Programmatic Dependent Launch y decodificacion especulativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE), transformer hibrido SWA–DSA |
| Parametros totales | 309B |
| Parametros activos | 15,5B |
| Longitud de contexto | 1.000.000 tokens (nativo) |
| Tipos de cuantizacion | FP8 (version publicada); otros formatos no disponibles |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible de forma explicita (repo de 315,1 GB; el tag indica custom_code y FP8) |
| Capas transformer | 48 |
| Composicion de atencion | 39 capas SWA + 9 capas DSA |
| Mecanismo de atencion | Hibrido SWA–DSA, sin capas de atencion completa |
| Ventana SWA | 128 tokens |
| Seleccion DSA | top 2.048 tokens para la atencion del backbone |
| Grupos KV (DSA) | 4 (GQA4) |
| Cabezas de consulta del indexer | 16 |
| Modulos de seis capas | 8 |

## Arquitectura y entrenamiento

La red se organiza en ocho modulos de seis capas cada uno. Un modulo estandar contiene cinco capas SWA seguidas de una capa DSA, y la primera capa del primer modulo tambien se sustituye por DSA. Las capas SWA usan una ventana de 128 tokens, cuyo coste de decodificacion por token no crece con la longitud del contexto, mientras que las capas DSA mantienen informacion de largo alcance. DSA funciona con un indexer ligero que puntua todo el historial y un backbone que calcula atencion solo sobre un subconjunto seleccionado de tokens (top 2.048). Ambos tipos de atencion incorporan sink bias. A diferencia de la implementacion original de DSA basada en MLA, Naive-N0.5-Flash emplea GQA con cuatro grupos KV.

El entrenamiento continuo tras la modificacion arquitectonica supuso 3,25 billones de tokens con ventana nativa de 1M: 50.000 millones para el calentamiento del indexer, 3 billones para el entrenamiento de atencion dispersa y 200.000 millones en la fase de decaimiento del learning rate. El objetivo declarado de este proceso fue adaptar el modelo a la nueva estructura de atencion y mejorar sus capacidades de programacion e I+D en IA. No se detalla en la informacion disponible si hubo fases de RLHF, DPO u otro tipo de ajuste por preferencias.

## Capacidades

- Generacion de texto y conversacion multi-turno (pipeline text-generation, tag conversational).
- Programacion y tareas de ingenieria de software, con enfasis declarado en coding y agentic tasks.
- Razonamiento agente multi-paso: la model card evalua tareas agenticas con Claude Code 2.1.207 exponiendo herramientas basicas de E/S de ficheros y Bash.
- Contexto largo nativo de 1M tokens, adecuado para repositorios completos o documentacion extensa.
- I+D en IA: la model card lista evaluaciones en PostTrainBench, MLE-bench-30, PaperBench, SOL-ExecBench, NanoChat AutoResearch y NanoGPT SpeedRun.
- Optimizacion de sistemas y research automation dentro del ambito de AI R&D.
- Tool calling / function calling: no se especifica de forma explicita en la informacion disponible, aunque el harness de evaluacion expone herramientas de fichero y Bash.
- Idiomas soportados: no disponible.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Asistente de programacion sobre repositorios completos: con 1M tokens de contexto nativo puede ingerir un arbol de codigo extenso sin trocear, y su atencion SWA–DSA mantiene el coste de decodificacion acotado en ventanas largas.
- Agentes autonomos de ingenieria de software: la evaluacion con herramientas de fichero y Bash indica encaje en bucles de edicion, ejecucion de tests y correccion iterativa dentro de pipelines de CI/CD.
- Migracion y refactorizacion a gran escala: el contexto de un millon de tokens permite analizar multiples modulos y sus dependencias en una sola pasada.
- Investigacion automatizada (AutoResearch): los benchmarks NanoChat AutoResearch y NanoGPT SpeedRun sugieren uso en experimentos de entrenamiento y busqueda de hiperparametros guiados por el modelo.
- Analisis de literatura cientifica y reproduccion de experimentos: PaperBench y MLE-bench-30 apuntan a tareas de lectura de articulos y ejecucion de pipelines de machine learning.
- Optimizacion de sistemas y kernels: SOL-ExecBench indica aplicabilidad a la mejora de codigo de bajo nivel y rendimiento.
- Servicio conversacional de alto volumen con coste controlado: la API a 0,10 $ / 0,40 $ / 0,01 $ por millon de tokens (entrada, salida, lectura de cache) permite desplegar atencion al cliente o asistentes integrados.
- Procesamiento de documentacion legal, tecnica o financiera de gran volumen gracias a la ventana nativa de 1M tokens.

## Benchmarks y rendimiento

La model card incluye dos figuras de resultados (tareas de coding y agenticas, y benchmarks de AI R&D con PostTrainBench, MLE-bench-30, PaperBench, SOL-ExecBench, NanoChat AutoResearch y NanoGPT SpeedRun), pero los valores numericos no estan disponibles en el texto proporcionado.

No se han publicado resultados de benchmarks numericos en la informacion disponible.

Modelos de referencia citados en la comparativa del autor (sin cifras extraibles): GLM-5.3, GLM-5.3-Flash, Kimi-K3, Qwen-3.8-Max, Hy4-preview y DeepSeek-V4.1. El setup de evaluacion declarado emplea Claude Code 2.1.207 con contexto de 1M, temperatura 1,0 y top-p 0,95.

## Requisitos de hardware

- Pesos en FP8: aproximadamente 309 GB solo para los pesos (309B parametros a 1 byte por parametro); el repositorio ocupa 315,1 GB.
- VRAM estimada: por debajo de 4 GPU de 80 GB (320 GB) los pesos FP8 no caben; en la practica se necesitan al menos 4–8 GPU de 80 GB para pesos mas cache KV.
- Cache KV: no se dispone de los datos de dimension de cabeza necesarios para estimar la cache a 1M tokens, pero se retiene el KV completo pese a la atencion dispersa, por lo que en contextos largos el consumo de memoria crecera de forma significativa.
- GPU recomendadas: H100 80 GB y A100 80 GB en configuraciones multi-GPU. No cabe en GPU de consumo (RTX 4090 con 24 GB, RTX 5090, etc.) ni siquiera con cuantizaciones agresivas por el tamaño total del modelo.
- Opciones de despliegue: el autor proporciona NaiveRT como sistema de inferencia propio (mega-kernel fusion, PDL y decodificacion especulativa). No se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la informacion disponible; el tag custom_code sugiere requisitos de codigo especifico para cargar el modelo.
- Latencia y throughput: 50 tokens/s por usuario en modo estandar y hasta 2.000 tokens/s en modo Ultrafast, segun el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Atention | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Naive-N0.5-Flash | 309B totales / 15,5B activos | 1M nativo | Hibrida SWA–DSA, sin atencion completa | MIT | Pesos abiertos (FP8) y API |
| MiMo-V2.5 (base) | no disponible | no disponible | Atencion global estandar (base del modelo) | no disponible | no disponible |
| GLM-5.3 / GLM-5.3-Flash | no disponible | no disponible | no disponible | no disponible | no disponible |
| Kimi-K3 | no disponible | no disponible | no disponible | no disponible | Pesos publicados en HuggingFace |
| Qwen-3.8-Max | no disponible | no disponible | no disponible | no disponible | API/Blog |
| DeepSeek-V4.1 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de especificaciones numericas de los modelos de referencia en la informacion proporcionada, por lo que la comparativa se limita a los nombres citados en la model card.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la informacion disponible.
- Riesgo de alucinacion: no cuantificado en la model card; como modelo de generacion de texto, mantiene el riesgo habitual.
- Idiomas soportados: no se especifica cobertura multilingue, lo que impide garantizar calidad fuera del ingles o del idioma principal de entrenamiento.
- Contexto: aunque la ventana nativa es de 1M tokens, se retiene el KV completo y el indexer DSA escanea todo el historial, de modo que el coste de memoria de la cache KV crece con la longitud del contexto pese a la atencion dispersa.
- Licencia: MIT, permisiva para uso comercial, aunque conviene verificar las condiciones de los pesos base (MiMo-V2.5) si impusieran restricciones adicionales.
- Despliegue: el tag custom_code implica que la carga puede requerir codigo propio; no se confirma compatibilidad con runtimes estandar como vLLM o llama.cpp.
- Repositorio con 0 descargas y 2 likes en el momento de la consulta: ecosistema de terceros practicamente inexistente, sin cuantizaciones comunitarias ni integraciones validadas.
- Fecha de creacion indicada como 2026-09-27, sin historial de versiones adicional en la informacion disponible.
- Validez comercial del sistema NaiveRT no confirmada; el rendimiento de 2.000 tokens/s corresponde a un modo Ultrafast y a un sistema de inferencia propietario del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NaiveAI/Naive-N0.5-Flash-FP8
- Modelo principal en HuggingFace: https://huggingface.co/NaiveAI/Naive-N0.5-Flash
- Pagina oficial: https://naive.ai/en/
- Repositorio GitHub: https://github.com/NaiveAI-Labs/Naive-N0.5-Flash/tree/main
- README de vocabulario (GitHub): https://github.com/NaiveAI-Labs/Naive-N0.5-Flash/blob/main/vocab.README.md
- Cobertura en AGI Hunt: https://agihunt.info/en/p/1a0e3e7adb50130d8be09165218
- Blog tecnico y case study de NaiveRT: enlazado como `[blog]` en la model card (URL no disponible)
- Homepage referenciada como `[website]` (URL no disponible)
- GitHub referenciado como `[github]` (URL no disponible)
- Benchmark de coding (PDF): enlazado como `[coding-pdf]` (URL no disponible)
- Benchmark de AI R&D (PDF): enlazado como `[ai-rd-pdf]` (URL no disponible)
- Referencias citadas por el autor: GLM-5.3 (https://z.ai/blog/glm-5.3), GLM-5.3-Flash (https://z.ai/blog/glm-5.3-flash), Kimi-K3 (https://huggingface.co/moonshotai/Kimi-K3), Qwen-3.8-Max (https://qwen.ai/blog?id=qwen3.8), Hy4-preview (https://huggingface.co/tencent/Hy4-preview), DeepSeek-V4.1 (URL no disponible)
