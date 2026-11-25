# mradermacher/Tenet-26B-A4B-Gemma4-Unslop-v2-i1-GGUF

## Resumen

Tenet-26B-A4B-Gemma4-Unslop-v2-i1-GGUF es una cuantizacion en formato GGUF del modelo Tenet-26B-A4B-Gemma4-Unslop-v2, publicada por el usuario mradermacher en Hugging Face. El modelo base es un fine-tuning de la familia Gemma de Google, con 25.233.142.046 parametros totales (aproximadamente 25,2 mil millones) y una nomenclatura "A4B" que sugiere una arquitectura de mezcla de expertos (MoE) con unos 4 mil millones de parametros activos por token, aunque este extremo no esta confirmado en la informacion disponible.

El repositorio contiene exclusivamente pesos cuantizados en GGUF generados con tecnicas de imatrix (importance matrix), lo que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles. El tamano total del repositorio es de 38,6 GB, coherente con un modelo de ~25B distribuido en multiples niveles de cuantizacion.

La relevancia de esta ficha es limitada por la escasez de informacion publicada: la model card del repositorio se limita a metadatos de cuantizacion y no incluye detalles sobre entrenamiento, licencia, idiomas o rendimiento. Se trata de un artefacto de cuantizacion, no de un modelo original, y debe evaluarse junto con el modelo base del que deriva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) segun nomenclatura "A4B"; no confirmado en la informacion disponible |
| Parametros totales | 25.233.142.046 (~25,2B) |
| Parametros activos | ~4B (inferido de "A4B"; no confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ1_S, IQ1_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL (small-IQ4_NL), Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizado con imatrix) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base. La denominacion "Gemma4" sugiere que deriva de la familia Gemma de Google, y el sufijo "A4B" apunta a una arquitectura de mezcla de expertos con aproximadamente 4 mil millones de parametros activos, en linea con convenciones de nomenclatura habituales en modelos MoE. El sufijo "Unslop-v2" indica un fine-tuning orientado a reducir respuestas excesivamente complacientes o genericas ("slop"), aunque no se especifica la metodologia (SFT, DPO u otra).

El repositorio en cuestion no contiene el modelo original, sino una conversion a GGUF realizada con `convert_type: hf` y cuantizacion con matrices de importancia (imatrix), segun los metadatos de la model card. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni innovaciones tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional: el tag "conversational" indica que el modelo esta orientado a dialogos multi-turno.
- Razonamiento general y generacion de texto: capacidades esperables de un modelo de ~25B, aunque no documentadas explicitamente.
- Compatibilidad con endpoints: el tag "endpoints_compatible" sugiere integracion con infraestructura de inferencia tipo Hugging Face Endpoints.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Despliegue local en estaciones de trabajo: las cuantizaciones Q4_K_M o Q5_K_M permiten ejecutar el modelo en GPUs de consumo con 24 GB de VRAM, usando llama.cpp u Ollama, adecuado para prototipado sin dependencia de la nube.
- Asistentes conversacionales autoalojados: el tag "conversational" y el fine-tuning "Unslop" apuntan a un uso en chatbots con respuestas menos genericas, desplegables en infraestructura propia.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece mas de 20 niveles de cuantizacion (desde IQ1_S hasta Q6_K), lo que permite estudiar el compromiso entre calidad y huella de memoria en un modelo de ~25B.
- Integracion en pipelines con llama.cpp: al ser GGUF, puede incorporarse a aplicaciones Python mediante `llama-cpp-python` para tareas de generacion de texto por lotes.
- Experimentacion en investigacion: util para estudiar el comportamiento de modelos MoE de ~25B bajo cuantizacion agresiva (Q2, IQ2, IQ1) en entornos con VRAM limitada.
- Servicio de inferencia en CPU: las cuantizaciones mas bajas (Q2_K, IQ2) permiten ejecucion en CPU con RAM suficiente, util para entornos sin GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantizacion. Para Q4_K_M, en torno a 15-16 GB; para Q5_K_M, en torno a 18 GB; para Q6_K, en torno a 21-22 GB; para Q8 teoricos, mas de 26 GB. Para IQ2/Q2, en torno a 8-10 GB. Estas cifras son estimaciones basadas en el numero de parametros y no estan confirmadas en la informacion disponible.
- GPU recomendadas: RTX 4090 (24 GB) para cuantizaciones Q4_K_M a Q6_K; A100 40 GB o H100 para precision completa o cuantizaciones altas con contexto largo.
- Cabe en GPU de consumo: si, en tarjetas con 16-24 GB de VRAM para cuantizaciones Q4 y Q5; en tarjetas de 8-12 GB solo con cuantizaciones IQ2/Q2.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, `llama-cpp-python`; vLLM y TGI no soportan GGUF de forma nativa sin conversion.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Tenet-26B-A4B-Gemma4-Unslop-v2-i1-GGUF | ~25,2B (MoE, ~4B activos) | no disponible | no disponible | GGUF | Cuantizacion imatrix de un fine-tuning sobre base Gemma |
| Modelo base Tenet-26B-A4B-Gemma4-Unslop-v2 | ~25,2B | no disponible | no disponible | safetensors (presumiblemente) | Fuente del que deriva esta cuantizacion |
| Gemma 2 27B (referencia de familia) | 27B | 8K | Gemma Terms | safetensors, GGUF | Modelo denso de tamano comparable; no es el mismo modelo |
| Mixtral 8x7B (referencia MoE) | 46,7B (~12,9B activos) | 32K | Apache 2.0 | safetensors, GGUF | MoE de referencia con mas parametros activos |

La comparativa es orientativa: no se dispone de datos de rendimiento del modelo evaluado ni de confirmacion de su arquitectura exacta, por lo que la comparacion se limita a parametros y formato.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos, datos de entrenamiento ni evaluaciones de seguridad.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no cuantificado para este modelo.
- La licencia no esta disponible, lo que impide confirmar si se permite uso comercial. Es imprescindible verificar la licencia del modelo base antes de cualquier despliegue en produccion.
- Los idiomas soportados no estan documentados; no se puede garantizar un rendimiento adecuado en castellano.
- Las cuantizaciones agresivas (IQ1, IQ2, Q2) degradan la calidad de forma notable; para produccion se recomienda Q4_K_M o superior.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria del artefacto.
- Al ser una cuantizacion de terceros, no hay garantia de que la conversion sea fiel al modelo original; conviene contrastar con el repositorio del autor del modelo base.
- La fecha de creacion indicada (2026-11-25) es futura respecto a la redaccion habitual de fichas; verificar la integridad del repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Tenet-26B-A4B-Gemma4-Unslop-v2-i1-GGUF
- Modelo base referenciado en la model card: https://huggingface.co/mr-andrey-isachenko/Tenet-26B-A4B-Gemma4-Unslop-v2
- Perfil del autor de la cuantizacion: https://huggingface.co/mradermacher
