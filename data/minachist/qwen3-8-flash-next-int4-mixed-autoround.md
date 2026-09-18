# Minachist/Qwen3.8-Flash-Next-INT4-Mixed-AutoRound

## Resumen

Minachist/Qwen3.8-Flash-Next-INT4-Mixed-AutoRound es una cuantizacion comunitaria de precision mixta del modelo Qwen/Qwen3.8-Flash-Next, publicada por el usuario Minachist. No es un modelo entrenado desde cero, sino una conversion de pesos a 4,21 bits por peso (bpw) de media mediante AutoRound, con el objetivo explicito de ejecutar un modelo de mezcla de expertos de gran tamano en tres tarjetas graficas de consumo RTX 3090 de 24 GB.

El modelo base es un MoE de 125B-A6B (512 expertos enrutados por capa, top-10) con atencion dispersa Qwen Sparse Attention (QSA) en 12 capas de atencion completa, una tabla de embeddings PLE de n-gramas de 51,2B de parametros que se consulta una vez por token en la capa 2, un modulo MTP de prediccion multi-token y una torre de vision. El checkpoint cuantizado ocupa 175,3 GB en disco y declara 139.734.687.635 parametros segun los metadatos de safetensors.

Su relevancia es practica: demuestra que un modelo de este tamano puede servirse con 262.144 tokens de contexto y 4 peticiones concurrentes sobre 72 GB de VRAM consumer, a costa de paralelismo de pipeline, offload de la cache K/V de QSA a memoria del host y lectura de la tabla PLE por mmap desde NVMe. El repositorio incluye ademas un parche de vLLM necesario para que todo esto funcione.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con Qwen Sparse Attention (QSA) en 12 capas de atencion completa, capas de atencion lineal, hyper-connections, tabla de embeddings PLE de n-gramas, modulo MTP y torre de vision |
| Parametros totales | 139.734.687.635 segun metadatos de safetensors; la model card describe el modelo como 125B-A6B mas una tabla PLE de 51,2B (las cifras no cuadran exactamente entre si) |
| Parametros activos | ~6B (denominacion A6B del modelo base); 512 expertos enrutados por capa con enrutado top-10 |
| Longitud de contexto | 262.144 tokens (objetivo de diseno de la cuantizacion) |
| Tipos de cuantizacion | Precision mixta AutoRound: INT4 gs128 (expertos enrutados MoE), INT6 gs64 (linear_attn, proyecciones q/k/v/o de QSA, experto compartido), INT8 gs64 (mixers de baja dimension de hyper-connections), INT8 gs128 (lm_head, embed_tokens, key_proj y value_proj de PLE, index_qk_proj). BF16 sin cuantizar: tabla PLE, modulo MTP, torre de vision y router (mlp.gate). Media global 4,21 bpw; cuerpo 4,205 bpw |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (license_name: qwen-community-1.0, license: other) |
| Formato de pesos | safetensors con compressed-tensors en modo pack-quantized y cuantizacion simetrica por grupos |

## Arquitectura y entrenamiento

El checkpoint es una derivacion cuantizada, no un modelo entrenado, por lo que no hay informacion sobre tokens de entrenamiento, composicion del dataset ni etapas de RLHF o DPO. Lo que si detalla la model card es la arquitectura del modelo base: un MoE de 125B-A6B con 512 expertos enrutados por capa y enrutado top-10, en el que la mayor parte del peso (58,0 GiB, el 92% del cuerpo) corresponde a los expertos enrutados. La atencion combina capas de atencion lineal con 12 capas de atencion completa basadas en QSA (Qwen Sparse Attention). El modelo incorpora ademas un modulo MTP para prediccion multi-token, una torre de vision (pipeline image-text-to-text) y una tabla de embeddings PLE de n-gramas de 51,2B de parametros en BF16 que se consulta una unica vez por token en la capa 2.

La innovacion tecnica de este repositorio esta en la cuantizacion y en el parche de vLLM que la acompana. La cuantizacion usa cuatro esquemas distintos segun la sensibilidad de cada bloque, dejando en BF16 el router, la tabla PLE, el modulo MTP y la torre de vision. El parche anade un backend mmap para la tabla PLE (95,37 GiB que se leen desde disco con accesos aleatorios de 4 KiB y nunca residen en memoria), coloca la K/V principal de QSA en memoria del host fijada (pinned) tras una vista UVA, implementa prefill por etapas para esa K/V alojada en host, corrige allocate_kv_cache en vLLM y habilita PP>1 para modelos con PLE.

## Capacidades

- Generacion de texto y conversacion multi-turno (pipeline conversacional declarado).
- Comprension de imagen y texto (image-text-to-text) mediante la torre de vision, disponible solo en la build de cuatro tarjetas.
- Contexto largo de hasta 262.144 tokens, con decodificacion plana medida de 3,6k a 248k tokens.
- Prediccion multi-token (MTP) mediante cabecera draft, solo en la build de 4x RTX 3090, que segun el autor aun no ha sido probada.
- Procesamiento concurrente: la cache K/V medida admite 1.067.300 tokens, equivalente a 4,07 veces el contexto maximo, lo que permite 4 peticiones simultaneas de contexto completo.
- Atribucion de tokens a la tabla PLE de n-gramas como mecanismo de memoria de secuencia larga.
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion.
- Capacidades multilingues: no disponible en la informacion.

## Casos de uso

- Analisis de documentos extensos en local: con 262.144 tokens de contexto, el modelo puede ingerir libros tecnicos, expedientes o auditorias completas en una sola pasada sin troceado ni recuperacion externa, algo viable porque la decodificacion se mantiene plana a 60 tok/s incluso a 248k tokens de contexto.
- Servicio de inferencia multiusuario en hardware de consumo: con 4 peticiones concurrentes y un rendimiento agregado de 150-156 tok/s sobre 3x RTX 3090, resulta adecuado para equipos pequenos que necesitan un endpoint interno sin depender de GPUs de datacenter.
- Asistencia sobre repositorios de codigo grandes: el contexto de 262k tokens permite cargar modulos completos o varios ficheros de un monorepo y responder preguntas de arquitectura o refactorizacion, siempre que la build de tres tarjetas se use como modelo solo de texto.
- Procesamiento de documentos con imagen: en la build de 4x RTX 3090, con la torre de vision activada, el modelo puede abordar OCR, extraccion de tablas y preguntas sobre capturas o PDFs escaneados combinando imagen y texto en el mismo prompt.
- Despliegue en entornos aislados (air-gapped): todo el stack (pesos, parche de vLLM, Dockerfile y compose.yaml) es local y no requiere servicios externos, lo que encaja en organizaciones con requisitos de confidencialidad estrictos.
- Indexacion y resumen de corpus masivos con RAG: la tabla PLE y el contexto largo reducen la necesidad de trocear el corpus, permitiendo concatenar muchos fragmentos recuperados en un unico prompt sin perder coherencia.
- Experimentacion en investigacion sobre cuantizacion: el repositorio documenta con detalle esquema por esquema (INT4 gs128, INT6 gs64, INT8 gs64, INT8 gs128) y medidas reales de VRAM, RAM y throughput, lo que lo convierte en una referencia para estudiar el impacto de la precision mixta en MoE grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor unicamente reporta medidas de rendimiento de inferencia sobre 3x RTX 3090 con 125 GiB de RAM:

| Metrica | Valor medido |
|---|---|
| Pesos residentes en GPU | 65,05 GiB (21,6 GiB x 3; cuerpo a 4,205 bpw) |
| Cache K/V | 1.067.300 tokens (4,07 x 262.144) |
| RAM del host | ~63 GiB (47,5 GiB de ellos el pool fijado de K/V de QSA) |
| Tabla PLE de n-gramas | 95,37 GiB, leida desde disco, nunca residente |
| Decodificacion, 1 peticion | 60 tok/s, plana de 3,6k a 248k de contexto |
| Decodificacion, 4 peticiones | 150-156 tok/s totales |
| Prefill a 248k | ~3.700 tok/s |

El parche de decodificacion incluido en el repositorio se describe como una mejora de 45 a 80 tok/s, cifra que no coincide con los 60 tok/s de la tabla anterior.

## Requisitos de hardware

- VRAM: 72 GB o mas. Los pesos ocupan 65 GB, por lo que no caben en menos de tres tarjetas. La configuracion medida usa 3x RTX 3090 de 24 GB.
- La VRAM es demasiado ajustada para tensor parallelism; el autor emplea pipeline parallelism, con cada tarjeta alojando un conjunto distinto de capas.
- Una cuarta tarjeta no amplia el contexto: anade la cabecera draft de MTP y la torre de vision. Con 4x 3090, TP=4 con PP=1 podria funcionar, pero requeriria parches propios.
- RAM del host: 65 GB libres o mas para el pool de K/V de QSA descargado a memoria; unos 70 GB con cuatro tarjetas, porque la cabecera draft anade una decimotercera capa de atencion dispersa con su propio pool.
- Almacenamiento: 96 GB o mas de almacenamiento local rapido para el fichero de la tabla PLE. El parche realiza accesos aleatorios de 4 KiB, por lo que requiere NVMe; no es viable en disco duro ni en NFS.
- Software: vLLM 0.29.1rc1.dev47+gdc36fcce9 o un nightly cercano. El parche aplica contra vllm/vllm-openai@sha256:43f13b4c624ab9e9e6753d0eeb5953268bff334f2a826239e6f4a2197d47bb96. El repositorio incluye Dockerfile y compose.yaml para construir la imagen parcheada.
- GPU de datacenter: no disponible en la informacion (el autor solo documenta RTX 3090).
- Opciones de despliegue: exclusivamente vLLM parcheado. No se documentan llama.cpp, Ollama, TGI ni otros runners; el formato compressed-tensors pack-quantized y las dependencias del parche lo limitan a este stack.
- Latencia y throughput: 60 tok/s por peticion y 150-156 tok/s agregados con 4 peticiones en 3x RTX 3090; prefill de ~3.700 tok/s a 248k tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | VRAM necesaria | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Minachist/Qwen3.8-Flash-Next-INT4-Mixed-AutoRound | 139,7B (A6B activos) | 262.144 tokens | Precision mixta 4,21 bpw (INT4/INT6/INT8 + BF16 parcial) | 72 GB+ (3x RTX 3090) | qwen-community-1.0 | Publicado en HuggingFace; requiere parche propio de vLLM |
| Qwen/Qwen3.8-Flash-Next (modelo base) | 125B-A6B declarados | no disponible | BF16 | no disponible (estimado en torno a 260 GiB solo para los pesos, calculado a partir de los parametros declarados) | qwen-community-1.0 | Publicado en HuggingFace |
| Otras cuantizaciones del mismo modelo base | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion |

No se dispone de informacion sobre cuantizaciones alternativas del mismo modelo base ni sobre modelos comparables de otros autores, por lo que la comparativa se limita al modelo original sin cuantizar.

## Limitaciones y advertencias

- La cuantizacion introduce perdida de precision no cuantificada: no se han publicado evaluaciones de calidad que comparen esta version con el modelo base en BF16, por lo que se desconoce la degradacion real en tareas de razonamiento, codigo o matematicas.
- Es una cuantizacion no oficial, realizada por un tercero (Minachist) y no por el equipo de Qwen. No debe asumirse el mismo comportamiento que el checkpoint oficial.
- Requiere un parche especifico de vLLM aplicado contra un commit concreto. Actualizar vLLM a otra version puede romper la compatibilidad.
- El despliegue solo funciona con pipeline parallelism; se descarta tensor parallelism por falta de VRAM.
- Dependencia critica de almacenamiento NVMe para la tabla PLE (95,37 GiB leidos con accesos aleatorios de 4 KiB). Un disco lento degradara gravemente el rendimiento.
- La build de tres tarjetas es solo texto: omite la torre de vision mediante --language-model-only. Las capacidades de imagen requieren cuatro tarjetas.
- La build de cuatro tarjetas, con MTP y vision, esta marcada como no probada por el propio autor.
- La cabecera MTP y la torre de vision no se recuantizan: permanecen en BF16 tal cual estan en el checkpoint.
- Riesgo de alucinacion: inherente a los modelos generativos; no se aportan evaluaciones de fidelidad ni tasas de error medidas.
- Idiomas soportados: no declarados en la model card; se desconoce la cobertura multilingue efectiva.
- Sesgos conocidos: no documentados en la informacion disponible.
- Licencia qwen-community-1.0: es una licencia "other" con nombre propio; es imprescindible revisar el texto completo (LICENSE) antes de cualquier uso comercial, ya que las condiciones no estan resumidas en la model card.
- El repositorio (175,3 GB) incluye tambien ficheros de parches bajo LICENSE, NOTICE y LICENSE.MIT, con condiciones potencialmente distintas a las de los pesos.
- Cifras inconsistentes en la propia documentacion: los 125B-A6B declarados no cuadran con los 139.734.687.635 parametros de safetensors, y el rendimiento de decodificacion aparece como 45 -> 80 tok/s en un apartado y como 60 tok/s en la tabla de medidas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Minachist/Qwen3.8-Flash-Next-INT4-Mixed-AutoRound
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Articulo del autor sobre el despliegue: https://minamism.com/posts/flash-next-vllm/
- Imagen de vLLM de referencia para el parche: vllm/vllm-openai@sha256:43f13b4c624ab9e9e6753d0eeb5953268bff334f2a826239e6f4a2197d47bb96
- Paper, repositorio o demo adicionales: no disponible en la informacion proporcionada.
