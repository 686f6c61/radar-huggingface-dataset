# mradermacher/MFANN-Llama3.1-Abliterated-SLERP-V4-GGUF

## Resumen

MFANN-Llama3.1-Abliterated-SLERP-V4-GGUF es la version cuantizada en formato GGUF del modelo netcat420/MFANN-Llama3.1-Abliterated-SLERP-V4, un merge de modelos construido con mergekit y lazymergekit que combina mlabonne/Meta-Llama-3.1-8B-Instruct-abliterated con netcat420/MFANNv0.24. El autor de la cuantizacion es mradermacher, un conocido publicador de quants GGUF en Hugging Face, y el modelo base subyacente es una variante de Llama 3.1 de 8.000 millones de parametros.

El modelo resuelve el problema de desplegar una variante "abliterated" (con los mecanismos de rechazo suavizados o eliminados mediante tecnicas de abliteration) de Llama 3.1 8B Instruct en entornos con recursos limitados, ofreciendo una amplia gama de cuantizaciones estaticas que van desde Q2_K (3,3 GB) hasta f16 (16,2 GB). La tecnica SLERP (spherical linear interpolation) en el merge sugiere una interpolacion suave entre los pesos de los modelos padres para preservar capacidades de ambos.

Es relevante ahora porque permite ejecutar localmente, en hardware de consumo, un modelo conversacional de 8B con contexto heredado de Llama 3.1 y sin las restricciones de rechazo del modelo original, lo que resulta util para investigacion sobre alineamiento, generacion creativa sin filtros y experimentacion con merges. La licencia Apache 2.0 facilita su uso comercial, aunque las implicaciones eticas del abliteration requieren cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Llama 3.1 8B Instruct) |
| Parametros totales | 8.030.261.312 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama 3.1: 128.000 tokens segun el modelo base, no confirmado en esta ficha) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (tambien safetensors en el modelo base) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only derivado de Llama 3.1 8B Instruct, con 8.030 millones de parametros. El modelo no ha sido entrenado desde cero: es el resultado de un merge de modelos (model merging) realizado con mergekit y lazymergekit, combinando mlabonne/Meta-Llama-3.1-8B-Instruct-abliterated (una version con abliteration aplicada sobre Llama 3.1 8B Instruct) y netcat420/MFANNv0.24. La tecnica SLERP indica que la fusion se realizo mediante interpolacion esferica lineal entre los tensores de pesos de ambos modelos padres, un metodo que suaviza las transiciones y suele preservar mejor las capacidades que un simple promedio lineal.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en esta ficha, ya que el modelo base hereda el entrenamiento de Llama 3.1 Instruct (preentrenamiento mas ajuste por instrucciones y RLHF) y el proceso de merge no anade entrenamiento adicional. La innovacion tecnica destacable es el propio merge SLERP y la abliteration, que elimina direcciones de activacion asociadas al rechazo. mradermacher ha generado cuantizaciones estaticas (no imatrix en este repo; las versiones ponderadas estan en el repo -i1-GGUF).

## Capacidades

- Generacion de texto conversacional multi-turno en ingles, heredada de Llama 3.1 8B Instruct.
- Razonamiento basico y respuesta a instrucciones, con menor tendencia al rechazo gracias a la abliteration.
- Generacion de codigo y matematicas a nivel de modelo de 8B (no se aportan benchmarks especificos).
- Capacidad de seguir instrucciones complejas y mantener contexto conversacional (segun el modelo base).
- Soporte de tool calling / function calling: no confirmado en la informacion proporcionada (Llama 3.1 Instruct original lo soporta; el merge puede degradarlo).
- Soporte de agentes y razonamiento multi-paso: no confirmado.
- Capacidades multilingues: limitadas al ingles segun la model card (el modelo base Llama 3.1 soporta varios idiomas, pero esta ficha declara solo en).
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Experimentacion en investigacion sobre alineamiento y abliteration: el modelo permite estudiar como la eliminacion de direcciones de rechazo afecta al comportamiento conversacional en un 8B, comparandolo con el Llama 3.1 Instruct original en tareas controladas.
- Generacion creativa sin filtros: escritura de ficcion, guiones o narrativa que requiera tematicas adultas o controvertidas, donde el modelo original rechazaria la peticion, ejecutable localmente con Q4_K_M (5,0 GB) en una GPU de consumo.
- Despliegue local en estaciones de trabajo con llama.cpp u Ollama: al ofrecer quants desde 3,3 GB (Q2_K) hasta 8,6 GB (Q8_0), cabe en GPUs de 8-12 GB VRAM y permite prototipado rapido sin dependencia de la nube.
- Chatbot de personaje o rol: la ausencia de rechazos y el contexto heredado de Llama 3.1 lo hacen adecuado para asistentes de rol con personalidad definida en un sistema domestico o servidor pequeño.
- Fine-tuning posterior o LoRA sobre el modelo base en safetensors: el repo base netcat420/MFANN-Llama3.1-Abliterated-SLERP-V4 permite ajuste adicional, y las versiones GGUF sirven para validacion rapida tras el ajuste.
- Evaluacion comparativa de merges: util para investigadores que comparan tecnicas de merge (SLERP frente a TIES, DARE, etc.) midiendo degradacion de capacidades en tareas estandar.
- Generacion de datos sinteticos para entrenamiento: puede producir grandes volumenes de texto diverso sin sesgo de rechazo, util para aumentar datasets en dominios especificos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni metricas de perplejidad comparativas para este merge o sus cuantizaciones.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: Q2_K ~3,3 GB; Q4_K_M ~5,0 GB; Q5_K_M ~5,8 GB; Q6_K ~6,7 GB; Q8_0 ~8,6 GB; f16 ~16,2 GB (mas overhead de contexto KV cache).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090 para cuantizaciones altas o contexto largo; A100/H100 solo si se requiere f16 con contexto extendido.
- Cabe en GPU de consumo: si, desde una GTX 1660 6 GB con Q2_K/Q3_K_S hasta una RTX 4090 con Q8_0. Para contexto de 128.000 tokens se necesita VRAM adicional significativa para la KV cache.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con GGUF. vLLM y TGI no soportan GGUF de forma nativa (requieren safetensors del modelo base).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; dependen del hardware y la cuantizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MFANN-Llama3.1-Abliterated-SLERP-V4-GGUF | 8,03 B | no disponible | apache-2.0 | GGUF | Merge abliterated, solo ingles |
| mlabonne/Meta-Llama-3.1-8B-Instruct-abliterated | 8,03 B | 128.000 (heredado) | llama3.1 (uso comunitario) | safetensors | Modelo padre, abliterated |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 128.000 | llama3.1 (uso comunitario) | safetensors | Base original con rechazos |
| netcat420/MFANNv0.24 | no disponible | no disponible | no disponible | no disponible | Segundo modelo padre del merge |

## Limitaciones y advertencias

- La abliteration elimina o suaviza los mecanismos de rechazo, lo que puede producir contenido ofensivo, inseguro o legalmente problematico sin aviso; no es apto para aplicaciones orientadas al publico sin moderacion adicional.
- Riesgo elevado de alucinacion, comun en modelos de 8B y potencialmente agravado por el merge y las cuantizaciones de baja calidad (Q2_K, Q3_K_M marcada como "lower quality").
- Idiomas: la model card declara solo ingles; el rendimiento en castellano no esta garantizado ni evaluado.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Llama 3.1 tiene su propia licencia comunitaria; verificar la compatibilidad de la cadena de licencias antes de produccion.
- El merge puede degradar capacidades especificas (tool calling, matematicas, codigo) respecto a los modelos padres; no hay benchmarks que lo confirmen.
- Las cuantizaciones IQ y de baja bits (Q2_K, Q3_K_S) pierden calidad de forma notable; para produccion se recomienda Q4_K_M o superior.
- Modelo con muy pocas descargas (82) y un solo like en el momento de la ficha: poca validacion comunitaria.
- No se dispone de informacion sobre el contexto efectivo tras el merge; asumir 128.000 tokens sin verificar puede provocar fallos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/MFANN-Llama3.1-Abliterated-SLERP-V4-GGUF
- Modelo base: https://huggingface.co/netcat420/MFANN-Llama3.1-Abliterated-SLERP-V4
- Quants ponderados/imatrix: https://huggingface.co/mradermacher/MFANN-Llama3.1-Abliterated-SLERP-V4-i1-GGUF
- Pagina de resumen del autor: https://hf.tst.eu/model#MFANN-Llama3.1-Abliterated-SLERP-V4-GGUF
- Modelo padre abliterated: https://huggingface.co/mlabonne/Meta-Llama-3.1-8B-Instruct-abliterated
- Modelo padre MFANNv0.24: https://huggingface.co/netcat420/MFANNv0.24
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
