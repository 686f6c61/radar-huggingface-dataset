# AdarshSingh01/Qwen2.5-1.5B-Instruct

## Resumen

Qwen2.5-1.5B-Instruct es la variante instruida de 1.540 millones de parametros de la familia Qwen2.5, desarrollada por el equipo Qwen de Alibaba Cloud. Este repositorio concreto (AdarshSingh01/Qwen2.5-1.5B-Instruct) es una publicacion derivada del modelo base oficial Qwen/Qwen2.5-1.5B, con pesos en safetensors y licencia Apache 2.0. El modelo resuelve el problema de disponer de un LLM conversacional compacto, desplegable en hardware modesto, con soporte nativo de plantilla de chat y capacidades razonables de instruccion, codigo y matematicas para su tamano.

La arquitectura es un transformer causal con RoPE, SwiGLU, RMSNorm, atencion con sesgo en QKV y embeddings ligados. Cuenta con 28 capas y atencion con GQA (12 cabezas de consulta y 2 de clave-valor), lo que reduce el coste de memoria en inferencia. El contexto completo es de 32.768 tokens con generacion de hasta 8.192 tokens, aunque la model card original de Qwen2.5 menciona soporte de hasta 128K en la familia; para esta variante de 1.5B el dato concreto del repositorio es 32.768.

Es relevante ahora porque los modelos pequenos instruidos permiten ejecutar asistentes conversacionales en local, en CPU o en GPUs de consumo, con coste marginal casi nulo y sin dependencia de API. Este repositorio, no obstante, presenta cero descargas y cero likes en el momento de la consulta, por lo que debe tratarse como una copia derivada sin traccion comunitaria verificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con RoPE, SwiGLU, RMSNorm, sesgo QKV y embeddings ligados |
| Parametros totales | 1.543.714.304 (1,54B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Parametros sin embeddings | 1,31B |
| Longitud de contexto | 32.768 tokens (generacion hasta 8.192 tokens) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos en safetensors; compatible con cuantizacion via herramientas externas) |
| Idiomas soportados | La model card declara mas de 29 idiomas (chino, ingles, frances, espanol, portugues, aleman, italiano, ruso, japones, coreano, vietnamita, tailandes, arabe, entre otros); el tag del repositorio solo declara `en` |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Capas | 28 |
| Cabezas de atencion | 12 para Q, 2 para KV (GQA) |
| Tamano del repositorio | 3,1 GB |

## Arquitectura y entrenamiento

El modelo es un transformer causal denso con 28 capas, normalizacion RMSNorm, activacion SwiGLU, embeddings de palabras ligados a la capa de salida y atencion con Grouped Query Attention (12 cabezas de consulta frente a 2 de clave-valor). Esta configuracion GQA reduce el tamano de la cache KV y mejora el throughput en inferencia respecto a atencion multi-cabeza completa, algo relevante en un modelo pequeno pensado para despliegue eficiente.

Segun la model card, el modelo ha pasado por pretraining y post-training (fase instruida). La familia Qwen2.5 incorpora modelos expertos especializados en codigo y matematicas durante el entrenamiento, mejoras en seguimiento de instrucciones, generacion de textos largos (mas de 8K tokens), comprension de datos estructurados (tablas) y generacion de JSON, ademas de mayor robustez frente a la diversidad de system prompts. No se detalla en la informacion disponible el numero exacto de tokens de entrenamiento, la composicion del dataset ni si se empleo RLHF o DPO especificamente para esta variante de 1.5B. El paper de referencia citado es el Qwen2 Technical Report (arXiv:2407.10671).

## Capacidades

- Generacion de texto conversacional multi-turno con plantilla de chat (`apply_chat_template`).
- Razonamiento basico y seguimiento de instrucciones, con mejoras declaradas en la familia Qwen2.5.
- Generacion de codigo y matematicas, apoyada en modelos expertos especializados durante el entrenamiento de la familia.
- Generacion de textos largos (mas de 8K tokens) y comprension de datos estructurados como tablas.
- Generacion de salidas estructuradas, especialmente JSON.
- Mayor resiliencia frente a distintos system prompts, util para role-play y condicionamiento de chatbots.
- Soporte multilingue declarado de mas de 29 idiomas en la model card de la familia (el tag del repositorio solo indica `en`).
- Compatibilidad con text-generation-inference y endpoints compatibles, segun los tags del repositorio.
- No se declara soporte de vision, audio ni tool calling explicito en la informacion proporcionada.

## Casos de uso

- Asistente conversacional local: el modelo puede gestionar dialogos multi-turno con contexto de hasta 32.768 tokens, adecuado para ejecutarse en portatiles o estaciones de trabajo sin GPU dedicada de gama alta.
- Generacion de codigo en entornos de desarrollo: util para autocompletado, explicacion de fragmentos y generacion de tests en pipelines locales, gracias a las mejoras de codigo de la familia Qwen2.5 y su bajo coste de inferencia.
- Extraccion y generacion de JSON estructurado: apropiado para tareas de parsing, rellenado de formularios o transformacion de texto a esquemas JSON en backends ligeros.
- Prototipado rapido de chatbots con role-play: la robustez frente a system prompts permite definir personajes y condiciones de comportamiento sin reentrenamiento.
- Procesamiento de documentos y tablas de tamano medio: con 32K de contexto puede ingerir contratos, informes o tablas y resumirlos o responder preguntas sobre ellos.
- Educacion y tutoria automatizada: respuestas en varios idiomas y generacion de explicaciones, desplegable en entornos con recursos limitados.
- Clasificacion y etiquetado de texto a escala: al ser un modelo pequeno, permite procesar volumenes elevados con coste bajo en CPU o GPU modesta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al blog oficial de Qwen2.5 y a la documentacion de velocidad para resultados detallados, pero no incluye cifras concretas de MMLU, HumanEval, GSM8K ni otras metricas para esta variante de 1.5B.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 3,1 GB solo para pesos, mas cache KV y overhead; en la practica unos 4-6 GB para contexto corto y mas para contextos largos.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1,6-2 GB para pesos.
- VRAM estimada en cuantizacion de 4 bits: alrededor de 1-1,5 GB para pesos.
- GPU recomendadas: cualquier GPU con 6-8 GB o mas, como RTX 3060, RTX 4060, RTX 4090, A100 o H100; el modelo es sobredimensionado para GPUs de datacenter y esta pensado para hardware de consumo.
- Cabe en GPU de consumo: si, en la mayoria de GPUs modernas con 6 GB o mas; tambien puede ejecutarse en CPU con cuantizacion.
- Opciones de despliegue: transformers (recomendado >= 4.37.0), text-generation-inference (segun tags), llama.cpp, Ollama y vLLM mediante conversion a GGUF o formatos compatibles.
- Latencia y throughput: no disponibles en la informacion proporcionada; la model card remite a la pagina de speed benchmark de Qwen para cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen2.5-1.5B-Instruct (este repo) | 1,54B | 32.768 | Apache 2.0 | Hugging Face (repo derivado, 0 descargas) |
| Qwen/Qwen2.5-1.5B-Instruct (oficial) | 1,54B | 32.768 | Apache 2.0 | Hugging Face (repo oficial de Qwen) |
| Qwen2.5-0.5B-Instruct | 0,5B | 32.768 | Apache 2.0 | Hugging Face |
| Qwen2.5-3B-Instruct | 3B | 32.768 | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparado en la informacion proporcionada para establecer diferencias cuantitativas entre estas variantes.

## Limitaciones y advertencias

- Repositorio derivado sin traccion: cero descargas y cero likes en el momento de la consulta; no hay evidencia de validacion independiente de estos pesos frente al repositorio oficial de Qwen.
- Riesgo de alucinacion inherente a modelos de 1,5B, especialmente en tareas de conocimiento factual y razonamiento complejo.
- El tag del repositorio solo declara ingles (`en`), aunque la model card de la familia menciona mas de 29 idiomas; conviene validar el rendimiento real en castellano antes de usarlo en produccion.
- Contexto efectivo limitado a 32.768 tokens en esta variante, inferior a los 128K declarados para otros modelos de la familia.
- Sesgos conocidos: no se documentan sesgos especificos en la informacion disponible; como todo LLM entrenado con datos web, puede reproducir sesgos de genero, raza o cultura.
- Licencia Apache 2.0 permite uso comercial, pero al ser un repo derivado conviene verificar la procedencia de los pesos y citar el modelo oficial de Qwen.
- Requiere transformers >= 4.37.0; versiones anteriores fallan con `KeyError: 'qwen2'`.
- No se declara soporte explicito de tool calling ni de agentes multi-paso en la informacion proporcionada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AdarshSingh01/Qwen2.5-1.5B-Instruct
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Modelo oficial instruido: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Blog Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- GitHub Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Documentacion Qwen: https://qwen.readthedocs.io/en/latest/
- Benchmark de velocidad: https://qwen.readthedocs.io/en/latest/benchmark/speed_benchmark.html
- Paper Qwen2: https://arxiv.org/abs/2407.10671
- Licencia: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct/blob/main/LICENSE
