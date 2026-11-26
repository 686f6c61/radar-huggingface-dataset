# Blackfrost-Research/GLM-5.3-DERISKED-FP8

## Resumen

GLM-5.3-DERISKED-FP8 es una derivacion cuantizada en FP8 del modelo MoE GLM-5.3-BF16 de Zhipu AI (zai-org), publicada por Blackfrost-Research. El checkpoint conserva la topologia completa de expertos, el tokenizador nativo, la plantilla de chat y los metadatos de razonamiento, tool use, contexto largo y MTP del modelo original. Con 753.329.940.480 parametros totales y un repositorio de 755,7 GB, esta pensado para despliegue en produccion sobre SGLang con decodificacion especulativa DFlash2.

La arquitectura es `GlmMoeDsaForCausalLM`, con 78 capas principales mas una capa MTP nativa, 256 expertos enrutados con top-8 activo y un experto compartido, hidden size de 6144 y una ventana de contexto de 1.048.576 posiciones. La cuantizacion es FP8 E4M3 dinamica con bloques de 128, lo que reduce el peso del checkpoint respecto al BF16 original manteniendo la estructura de expertos intacta.

El interes actual de esta ficha es doble: por un lado, ofrece una via de despliegue de un modelo de escala frontera con contexto de un millon de tokens sin necesidad de solicitar acceso (descarga publica y sin gating); por otro, la licencia es "other" y el kit de despliegue depende de un modelo companion con licencia CC BY-NC-ND 4.0, lo que exige revision legal antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `GlmMoeDsaForCausalLM` (Mixture of Experts con atencion DSA) |
| Parametros totales | 753.329.940.480 (753,3 B) |
| Parametros activos | top-8 expertos enrutados de 256 + experto compartido (numero exacto de parametros activos no disponible) |
| Longitud de contexto | 1.048.576 posiciones |
| Tipos de cuantizacion | FP8 E4M3 dinamica con bloques de 128 (checkpoint publicado); otras cuantizaciones no disponibles |
| Idiomas soportados | en, zh (segun tags de la model card) |
| Licencia | other (terminos del repositorio y del modelo upstream; revision legal necesaria) |
| Formato de pesos | safetensors (libreria transformers) |
| Capas | 78 capas principales + capa MTP nativa |
| Hidden size | 6144 |
| Modelo base | zai-org/GLM-5.3-BF16 |
| Tamano del repositorio | 755,7 GB |
| Descargas / likes | 221 / 2 |

## Arquitectura y entrenamiento

El modelo es un transformer de tipo Mixture of Experts con atencion DSA (segun el identificador `GlmMoeDsaForCausalLM`). Cuenta con 78 capas principales mas una capa MTP (multi-token prediction) nativa, 256 expertos enrutados con activacion top-8 y un experto compartido, sobre un hidden size de 6144. La capa MTP y los metadatos de razonamiento y tool use se conservan del modelo original GLM-5.3-BF16.

La publicacion de Blackfrost-Research es una cuantizacion, no un reentrenamiento: aplica FP8 E4M3 dinamica con bloques de 128 sobre los pesos de zai-org/GLM-5.3-BF16. El proceso de produccion a nivel de pesos de Blackfrost es propietario y no se incluye en el repositorio. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni las etapas de RLHF/DPO del modelo base en la informacion proporcionada. El kit de despliegue incluye soporte para decodificacion especulativa DFLASH de SGLang mediante el companion `incoai/GLM-5.3-DFlash2`, cuyos pesos no se redistribuyen en este repositorio.

## Capacidades

- Generacion de texto conversacional en ingles y chino.
- Razonamiento multi-paso (metadatos de reasoning conservados del modelo base).
- Tool calling / function calling (metadatos nativos de tool use).
- Uso en agentes y flujos multi-turno con contexto muy largo (hasta 1.048.576 posiciones).
- Prediccion multi-token (MTP) nativa, util para decodificacion especulativa.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Capacidades de vision y audio: no disponibles en la informacion proporcionada.
- Capacidades multilingues mas alla de en/zh: no disponibles.

## Casos de uso

- Analisis de repositorios y documentacion extensa: con un millon de tokens de contexto, el modelo puede ingerir bases de codigo completas o corpus documentales y responder preguntas cruzadas sin troceado previo.
- Agentes de automatizacion con tool calling: los metadatos nativos de tool use permiten integrarlo en orquestadores que invocan APIs, consultas SQL o sistemas internos en cadenas multi-paso.
- Asistencia conversacional empresarial en ingles y chino: adecuado para soporte multi-turno en organizaciones con operaciones en ambos idiomas, con la ventana de contexto como ventaja para historiales largos.
- Razonamiento sobre expedientes o contratos: la ventana de 1M tokens permite comparar clausulas a lo largo de documentos completos y mantener trazabilidad de referencias.
- Generacion y revision de codigo en pipelines internos: el modelo puede recibir contexto de varios ficheros y proponer parches, siempre que el operador valide la salida como no fiable.
- Despliegue en infraestructura SGLang con decodificacion especulativa: el kit DFlash2 esta orientado a reducir latencia en serving de alta concurrencia, previa revision de la licencia del companion.
- Investigacion sobre cuantizacion FP8 en MoE de gran escala: util como referencia para medir degradacion de calidad frente al BF16 original en tareas de razonamiento y contexto largo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el checkpoint FP8 ocupa 755,7 GB en repositorio, por lo que la inferencia requiere agregar al menos ese orden de magnitud en memoria, mas overhead de KV cache. No cabe en una sola GPU consumer ni en una sola GPU de datacenter convencional.
- GPU recomendadas: despliegue multi-GPU con aceleradores de clase H100/H200 o B200; A100 80 GB requeriria un numero elevado de unidades y no se ha confirmado compatibilidad FP8 nativa optima.
- GPU consumer: no viable. El modelo no cabe en RTX 4090, RTX 5090 ni configuraciones multi-GPU consumer realistas.
- Opciones de despliegue: SGLang (soporte DFLASH documentado en el kit), transformers como libreria base. Compatibilidad con vLLM, llama.cpp, Ollama o TGI no disponible en la informacion proporcionada.
- Latencia y throughput: no disponibles. La decodificacion especulativa DFlash2 esta pensada para mejorar aceptacion y throughput, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-DERISKED-FP8 (este) | 753,3 B (MoE, top-8 de 256) | 1.048.576 | FP8 E4M3 bloque 128 | other | Publico, sin gating |
| zai-org/GLM-5.3-BF16 | no disponible en la informacion | no disponible en la informacion | BF16 | no disponible en la informacion | Modelo base referenciado |
| incoai/GLM-5.3-DFlash2 | no disponible | no disponible | no disponible | CC BY-NC-ND 4.0 | Companion para decodificacion especulativa |

No se dispone de datos de benchmarks ni de especificaciones completas de alternativas de la misma categoria en la informacion proporcionada, por lo que no es posible establecer una comparativa de rendimiento fiable.

## Limitaciones y advertencias

- Licencia "other": los terminos del repositorio y del modelo upstream aplican; es imprescindible revision legal antes de uso comercial.
- El kit de despliegue DFlash2 depende de `incoai/GLM-5.3-DFlash2`, con licencia CC BY-NC-ND 4.0, que prohibe uso comercial y obras derivadas. Usar el kit puede condicionar el despliegue en produccion.
- El proceso de produccion de Blackfrost es propietario y no auditable desde el repositorio; no hay garantia documentada sobre el impacto de la cuantizacion FP8 en calidad.
- Riesgo de alucinacion inherente a modelos generativos; el autor indica explicitamente tratar la salida como no fiable.
- Idiomas documentados limitados a ingles y chino; el comportamiento en castellano no esta validado.
- El autor recomienda cualificar capacidad, seguridad, comportamiento en contexto largo, tool use y tasa de aceptacion especulativa antes de produccion.
- El modelo se distribuye "as is", sin garantia; el operador asume control de acceso, monitorizacion y cumplimiento normativo.
- El gran tamano del checkpoint (755,7 GB) impone requisitos de almacenamiento y transferencia significativos.
- No hay informacion publica sobre sesgos especificos ni sobre evaluaciones de seguridad del checkpoint derivado.

## Enlaces

- Hugging Face: https://huggingface.co/Blackfrost-Research/GLM-5.3-DERISKED-FP8
- Arbol de ficheros: https://huggingface.co/Blackfrost-Research/GLM-5.3-Derisked-FP8/tree/main
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-BF16
- Companion de decodificacion especulativa: https://huggingface.co/incoai/GLM-5.3-DFlash2
- Kit de despliegue: `DEPLOYMENT/README.md` y `DEPLOYMENT/LAUNCH.sh` dentro del repositorio del modelo
