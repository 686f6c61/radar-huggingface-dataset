# axteam/MiniCPM-V-4.7-35B-A3B-AWQ-8bit

## Resumen

MiniCPM-V-4.7-35B-A3B-AWQ-8bit es una cuantización de 8 bits del modelo multimodal openbmb/MiniCPM-V-4.7-35B-A3B, publicada por el usuario axteam para servir el modelo con vLLM. No se trata de un modelo nuevo: es un derivado post-entrenamiento (PTQ, sin reentrenamiento) que aplica AWQ INT8 con pesos simétricos en grupos de 32 y activaciones en BF16 (esquema W8A16), almacenado en el formato `pack-quantized` de compressed-tensors. El objetivo es reducir la huella de memoria del modelo base para hacer viable su despliegue en infraestructura de inferencia estándar.

El modelo original pertenece a la familia MiniCPM-V 4.7 de OpenBMB, publicada el 12 de octubre de 2026 en dos variantes (1B y 35B-A3B). La variante grande es un transformer disperso de tipo MoE con backbone de lenguaje derivado de Qwen3.5-MoE, torre de visión y pipeline `image-text-to-text`, con aproximadamente 35.000 millones de parámetros totales y unos 3.000 millones activos por token (de ahí la denominación A3B). OpenBMB lo presenta como el primer modelo multimodal MoE open source diseñado para ejecutarse en dispositivo (iOS/Android) con un consumo del orden de 3 GB de memoria en su versión optimizada.

La relevancia de este repositorio es práctica: el original en BF16 ocupa del orden del doble que esta versión (36,2 GB en disco), por lo que la cuantización INT8 acerca el modelo a GPUs de 48 GB y a nodos con tensor parallelism sobre GPUs de consumo. La contrapartida es que solo se cuantiza el backbone del modelo de lenguaje (proyecciones de atención y MLP); la torre de visión, el merger visión-texto, los embeddings, el LM head y todas las RMSNorm se conservan en BF16, de modo que el ahorro es parcial. La licencia es Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal con torre de vision (backbone de lenguaje tipo Qwen3.5-MoE) |
| Parametros totales | ~35B en el modelo base (denominacion 35B-A3B); el repo cuantizado declara 11.047.643.804 parametros en safetensors, cifra no coincidente que probablemente refleja un recuento parcial de tensores empaquetados y debe verificarse |
| Parametros activos | ~3B (variante A3B del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | AWQ INT8 W8A16 (pesos INT8 simetricos, grupo 32, activaciones BF16); misma autoria publica una variante NVFP4A16 |
| Idiomas soportados | no disponible; la evaluacion del cuantizador se realizo en ingles y coreano |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con compressed-tensors `pack-quantized` |
| Tamano en disco | ~36,2 GB (repo completo: 38,9 GB) |
| Calibracion | 256 muestras |
| Muestras en BF16 | Torre de vision, merger vision-texto, embeddings de tokens, LM head y todas las RMSNorm |
| Libreria y runtime | transformers; soporte nativo en vLLM |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal disperso: un backbone de lenguaje MoE (aproximadamente 35B totales, 3B activos) acoplado a una torre de visión y a un módulo merger que proyecta las representaciones visuales al espacio del lenguaje. La model card del cuantizador identifica el backbone como Qwen3.5-MoE. No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset ni las etapas de alineacion (RLHF/DPO) del modelo original en la informacion proporcionada.

Lo que si documenta esta ficha es el proceso de cuantizacion: cuantizacion post-entrenamiento sin reentrenamiento, con 256 muestras de calibracion, pesos INT8 simetricos agrupados de 32 en 32 y activaciones en BF16. Solo se cuantizan las proyecciones de atencion y MLP del backbone de lenguaje; los componentes sensibles a la precision (torre de vision, merger, embeddings, LM head, RMSNorm) permanecen en BF16. El tokenizer y el `chat_template` son identicos a los del original. El autor declara haber validado la calidad frente al BF16 mediante perplejidad y acuerdo top-1 en ingles y coreano, aunque no publica los valores numericos.

## Capacidades

- Generacion de texto e imagen-a-texto: el pipeline declarado es `image-text-to-text`, con entrada conjunta de imagenes y prompts textuales.
- Comprension de documentos y OCR: la familia MiniCPM-V se posiciona explicitamente en tareas de OCR y comprension de documentos; el modelo cuantizado hereda estas capacidades del base.
- Razonamiento matematico y multimodal: la familia se presenta con capacidades destacadas en matematicas e interpretacion de diagramas y tablas.
- Comprension de video: capacidades de video understanding atribuidas a la familia MiniCPM-V 4.7.
- Multilingue: no hay listado oficial de idiomas en la informacion disponible; el cuantizador evalua en ingles y coreano.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Modo thinking o razonamiento multi-paso explicito: no disponible en la informacion proporcionada.
- Capacidades de audio: no disponible en la informacion proporcionada.

## Casos de uso

- Digitalizacion de documentos con OCR: el modelo recibe imagenes de facturas, formularios o escaneos y devuelve texto estructurado. La torre de vision se mantiene en BF16, por lo que la calidad de lectura no se degrada por la cuantizacion del backbone.
- Extraccion de datos de tablas y graficos: util en pipelines de analisis documental donde hay que convertir imagenes de informes en series de datos o en JSON consumible por otro servicio.
- Atencion al cliente multimodal: el usuario envia capturas de pantalla o fotos de un producto o error y el modelo interpreta la imagen junto con el historial de conversacion; el despliegue en vLLM permite batching continuo para varios agentes simultaneos.
- Moderacion y enriquecimiento de contenido visual: clasificacion y descripcion automatica de imagenes subidas por usuarios, con salida textual lista para indexar o auditar.
- Asistencia en entornos moviles o embebidos: OpenBMB posiciona la variante 35B-A3B para ejecucion en dispositivo con un consumo del orden de 3 GB; esta version INT8 es mas adecuada para servidor, pero la variante A3B del backbone mantiene un coste por token bajo en despliegues edge con hardware dedicado.
- Prototipado e investigacion en vision-lenguaje: servir el modelo con `vllm serve` en una GPU de 48-80 GB permite evaluar el comportamiento del modelo base a un coste de memoria reducido, sin reentrenar.
- Generacion de descripciones accesibles: alt-text automatico para catalogos de imagenes, con control del estilo mediante prompting.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card del cuantizador menciona una validacion de calidad frente al original BF16 mediante perplejidad y acuerdo top-1 en ingles y coreano, pero no incluye cifras. Las referencias web a comparaciones de la familia MiniCPM-V 4.7 con Qwen3.6 y Gemma-4 no aportan numeros en la informacion recuperada. No se dispone de datos de latencia ni de throughput para esta cuantizacion concreta.

## Requisitos de hardware

- VRAM para los pesos: ~36,2 GB en INT8 W8A16. Sumando overhead del runtime, cache KV y procesamiento de imagenes, se recomienda reservar 48 GB como minimo.
- GPU recomendadas: A100 80 GB, H100 80 GB, L40S 48 GB, RTX 6000 Ada 48 GB. En A100 40 GB el modelo probablemente no entra con cache KV para contextos largos.
- GPU de consumo: no cabe en una unica RTX 4090 (24 GB). Seria necesario tensor parallelism sobre 2x RTX 4090 (48 GB agregados) o 2x RTX 3090.
- Opciones de despliegue: vLLM es el runtime objetivo declarado (`vllm serve axteam/MiniCPM-V-4.7-35B-A3B-AWQ-8bit`), con soporte de compressed-tensors. Tambien es cargable con transformers. No se documenta soporte de llama.cpp, Ollama ni TGI para este formato `pack-quantized`.
- Latencia y throughput: no disponible. Como referencia cualitativa, el backbone A3B activa ~3B parametros por token, lo que reduce el coste computacional por token frente a un modelo denso de 35B.
- Alternativa de menor huella: el mismo autor publica una variante NVFP4A16, orientada a precision de 4 bits en pesos con activaciones de 16 bits.

## Comparativa con modelos similares

| Modelo | Parametros | Precision de pesos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| axteam/MiniCPM-V-4.7-35B-A3B-AWQ-8bit | ~35B totales / ~3B activos (recuento safetensors: 11,05B) | INT8 W8A16 | no disponible | Apache-2.0 | safetensors (compressed-tensors) | Version analizada; 36,2 GB en disco; vision en BF16 |
| openbmb/MiniCPM-V-4.7-35B-A3B | ~35B totales / ~3B activos | BF16 | no disponible | Apache-2.0 | safetensors | Original de OpenBMB; referencia de calidad; mayor huella de memoria |
| axteam/MiniCPM-V-4.7-35B-A3B-NVFP4A16 | ~35B totales / ~3B activos | FP4 en pesos, A16 | no disponible | Apache-2.0 (heredada) | no disponible | Misma autoria, cuantizacion de 4 bits; tamano en disco no disponible |
| Qwen3.6 / Gemma-4 | no disponible | no disponible | no disponible | no disponible | no disponible | Citados como referencias de comparacion en la web, sin datos numericos en la informacion recuperada |

## Limitaciones y advertencias

- La cuantizacion degrada ligeramente el backbone de lenguaje. El autor reporta verificacion por perplejidad y top-1 frente a BF16, pero no publica los valores, por lo que el impacto real no es auditable sin evaluacion propia.
- Solo se cuantizan atención y MLP del backbone: los pesos en BF16 (visión, merger, embeddings, LM head, normas) limitan el ahorro de memoria a aproximadamente la mitad del BF16 y no a un cuarto.
- El recuento de parametros de safetensors (11.047.643.804) no concuerda con la denominacion 35B-A3B del modelo base. Conviene verificar la integridad del repositorio antes de usarlo en produccion.
- Repositorio de terceros: 0 descargas y 0 likes en el momento de la consulta. No es una publicacion oficial de OpenBMB; para produccion conviene comparar con el original y con otras cuantizaciones.
- La longitud de contexto no esta documentada en la informacion disponible, lo que impide planificar cargas de trabajo con documentos largos o video extenso.
- No hay listado oficial de idiomas soportados. La evaluacion del cuantizador cubre ingles y coreano; el rendimiento en castellano no esta verificado.
- Riesgo de alucinacion inherente a los modelos vision-lenguaje: las descripciones de imagenes y el OCR pueden inventar texto o cifras, especialmente en documentos de baja calidad. Requiere validacion posterior en flujos criticos.
- Sin datos publicados sobre tool calling ni razonamiento multi-paso explicito; no asumir soporte de agentes sin probarlo.
- Licencia Apache-2.0: permite uso comercial y modificacion, con obligacion de conservar avisos de copyright y atribucion a OpenBMB por los pesos y tokenizer originales.
- El formato `pack-quantized` de compressed-tensors exige versiones recientes de vLLM y de la libreria compressed-tensors; versiones antiguas fallaran al cargar.

## Enlaces

- Modelo cuantizado en HuggingFace: https://huggingface.co/axteam/MiniCPM-V-4.7-35B-A3B-AWQ-8bit
- Modelo base: https://huggingface.co/openbmb/MiniCPM-V-4.7-35B-A3B
- Variante NVFP4A16 del mismo autor: https://huggingface.co/axteam/MiniCPM-V-4.7-35B-A3B-NVFP4A16
- Pagina oficial de MiniCPM-V 4.7 en OpenBMB: https://openbmb.cn/en/model/minicpm-v-4-7
- Nota de prensa de ModelBest y OpenBMB: https://www.prnewswire.com/news-releases/modelbest-and-openbmb-launch-minicpm-v-4-7--bringing-a-35b-multimodal-moe-model-to-phones-and-tablets-with-about-3-gb-of-memory-302909881.html
- Analisis de la familia MiniCPM-V 4.7: https://ai-tldr.dev/models/minicpm-v-4-7/
