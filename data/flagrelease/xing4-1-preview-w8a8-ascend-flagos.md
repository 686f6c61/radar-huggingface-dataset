# FlagRelease/Xing4.1-Preview-W8A8-ascend-FlagOS

## Resumen

Xing4.1-Preview es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) perteneciente a la familia Xingchen Semantic Large Model, disenado especificamente para programacion de agentes y tareas complejas de horizonte largo. Desarrollado sobre plataformas de computo de origen domestico (chino), el modelo cuenta con 285.000 millones de parametros totales y aproximadamente 17.000 millones de parametros activos por token, lo que lo situa en la categoria de modelos masivos con activacion eficiente.

La version aqui descrita, Xing4.1-Preview-W8A8-ascend-FlagOS, es una adaptacion de FlagRelease que empaqueta el checkpoint original en formato W8A8 (cuantizacion de 8 bits para pesos y activaciones) optimizado para su despliegue sobre 16 NPU Ascend 910C en un unico host. Esta adaptacion amplia las opciones de inferencia del modelo, tradicionalmente orientado a GPU, hacia el ecosistema Ascend mediante el runtime FlagOS, que integra SGLang, FlagGems y Triton Ascend.

Su relevancia actual radica en tres factores: una ventana de contexto nativa de 1M tokens, soporte explicito de modo de razonamiento (thinking mode), tool calling y salida estructurada, y una arquitectura que combina MLA (Multi-head Latent Attention) con atencion dispersa DSA para reducir el coste del contexto largo. La licencia Apache 2.0 facilita su adopcion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con backbone de 45 capas (42 capas MoE), MLA para representacion KV comprimida y atencion dispersa DSA |
| Parametros totales | 279.902.121.728 (~280B; la model card indica 285B) |
| Parametros activos | ~17B por token (8 de 256 expertos enrutados + 1 experto compartido) |
| Longitud de contexto | 1M tokens nativo (el endpoint desplegado limita a 65.536 tokens de entrada + salida) |
| Tipos de cuantizacion | W8A8 (8 bits pesos y activaciones), formato compressed-tensors |
| Idiomas soportados | Chino (zh) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con custom_code y compressed-tensors) |

## Arquitectura y entrenamiento

Xing4.1-Preview emplea un backbone Transformer de 45 capas, de las cuales 42 son capas MoE. Cada token activa 8 expertos enrutados de un total de 256, mas un experto compartido, lo que resulta en aproximadamente 17B de parametros activos sobre un total de 285B. La representacion KV se comprime mediante Multi-head Latent Attention (MLA), y el modelo incorpora atencion dispersa DSA (DeepSeek Sparse Attention) para hacer tratable el contexto de 1M tokens reduciendo el coste computacional de la atencion.

El modelo fue entrenado sobre plataformas de computo completamente domesticas, segun indica la model card. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La model card menciona soporte de thinking mode conmutables, lo que sugiere algun tipo de entrenamiento orientado a razonamiento, pero no se detallan los metodos.

La adaptacion FlagOS introduce innovaciones de despliegue: atencion con paralelismo de datos entre 16 rangos, paralelismo de expertos DeepEP entre 16 rangos, ejecucion eager para prefill y replay de grafo para decode. Por defecto se desactivan el prefix caching y la prediccion multi-token (MTP). Se incluyen kernels optimizados de FlagGems para la mascara de atencion dispersa y kernels dinamicos W8A8 de compressed-tensors para operaciones lineales y MoE.

## Capacidades

- Generacion de texto y razonamiento en chino e ingles.
- Razonamiento matematico (Math_500 reportado en 95,20 en la variante Nvidia Origin).
- Generacion de codigo y programacion de agentes.
- Tool calling / function calling.
- Salida estructurada (structured output).
- Conmutacion de modo de razonamiento (thinking mode on/off).
- Razonamiento multi-paso y tareas de horizonte largo.
- Procesamiento de contexto largo (hasta 1M tokens nativo; 65.536 en el endpoint desplegado).
- Flujos de trabajo de oficina multi-paso y escenarios empresariales intensivos en documentos.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con historiales extensos gracias a su ventana de contexto, manteniendo coherencia en interacciones prolongadas y usando tool calling para consultar sistemas internos.
- Generacion de codigo en produccion: soporta tool calling y salida estructurada, lo que permite integrarlo en pipelines de CI/CD para generar parches, tests o revisiones de codigo con formato predecible.
- Investigacion profunda (deep research): su capacidad de razonamiento multi-paso y contexto de 1M tokens permite sintetizar grandes volumenes de documentos y fuentes en informes estructurados.
- Automatizacion de flujos de oficina: tareas multi-paso como extraccion de datos de documentos, redaccion de correos y generacion de resumenes encadenados, aprovechando el modo de razonamiento para planificar cada paso.
- Agentes autonomos de larga duracion: el modelo esta disenado para tareas de horizonte largo, por lo que puede mantener estado y objetivos a lo largo de muchas interacciones con herramientas externas.
- Analisis de documentos intensivo: procesamiento de contratos, informes o expedientes extensos que caben en el contexto sin necesidad de fragmentacion agresiva.
- Asistentes de programacion en IDE: integrable mediante API compatible con OpenAI para autocompletado, explicacion de codigo y refactorizacion en entornos de desarrollo.

## Benchmarks y rendimiento

| Metrica | Xing4.1-Preview-Nvidia-Origin | Xing4.1-Preview-Ascend-FlagOS |
|---|---|---|
| Math_500 | 95,20 | En evaluacion |
| GPQA_Diamond | En evaluacion | En evaluacion |

Los unicos datos publicados en la informacion disponible corresponden a Math_500 (95,20) para la variante Nvidia Origin. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/NPU estimada: el checkpoint W8A8 ocupa 281,5 GB en disco; para inferencia se requiere un pool de memoria agregado de al menos esa magnitud mas overhead de runtime.
- Despliegue de referencia: 16 NPU Ascend 910C en un unico host (configuracion oficial de la imagen FlagOS).
- GPU: no se especifican requisitos para GPU en esta adaptacion; la variante Nvidia Origin existe pero no se detallan sus requisitos en la informacion disponible.
- No cabe en GPU de consumo (RTX 4090, etc.) en ninguna configuracion razonable dado el tamano del modelo.
- Opciones de despliegue: SGLang (version 0.5.11, commit 600df8dd) con sglang-plugin-fl y FlagGems-sglang; contenedor Docker publicado en Harbor (harbor.baai.ac.cn/flagrelease-public/...).
- Entorno: openEuler 22.03 LTS-SP4 (aarch64), driver 25.5.0, CANN 8.5.0, CPython 3.11.14, PyTorch 2.8.0+cpu, torch-npu 2.8.0.post2, Triton Ascend 3.2.0, comunicacion HCCL con backend DeepEP.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xing4.1-Preview | ~280B (285B segun model card) | ~17B | 1M nativo | Apache 2.0 | Hugging Face / ModelScope |
| DeepSeek-V3 | no disponible en la informacion | no disponible | no disponible | no disponible | no disponible |
| Modelos MoE de clase 200B+ | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con modelos alternativos en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Idiomas: solo chino e ingles declarados; el rendimiento en castellano u otros idiomas no esta garantizado.
- Riesgo de alucinacion: como todo modelo generativo de gran escala, puede producir contenido plausible pero incorrecto, especialmente en tareas de investigacion o datos factuales.
- Sesgos: no se documentan sesgos conocidos en la informacion disponible; cabe esperar sesgos derivados de los datos de entrenamiento, no detallados.
- Contexto desplegado: aunque el modelo soporta 1M tokens nativo, el endpoint de la imagen FlagOS limita a 65.536 tokens (entrada + salida), lo que reduce drasticamente la ventana practica en este despliegue.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe verificarse el cumplimiento de las dependencias del runtime (CANN, SGLang, FlagGems) que pueden tener sus propias licencias.
- Requisitos de infraestructura: el despliegue de referencia exige 16 NPU Ascend 910C y un stack software muy especifico (CANN 8.5.0, driver 25.5.0), lo que limita la portabilidad.
- Configuracion por defecto: prefix caching y MTP estan desactivados, lo que puede afectar al throughput en cargas con prompts repetidos.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y los benchmarks estan en evaluacion, por lo que la validacion independiente es practicamente inexistente.

## Enlaces

- Hugging Face: https://huggingface.co/FlagRelease/Xing4.1-Preview-W8A8-ascend-FlagOS
- Imagen Docker (Harbor): harbor.baai.ac.cn/flagrelease-public/xing4.1-preview-ascend001-gems0.0-treenone-cxnone-pluginnone-vllmnone-sglang0.5.11-sglangfl0.1.0-cp311-ptnpu28-cann85-a64-25.5.0:202611230405
- Descarga de pesos via ModelScope: `modelscope download --model FlagRelease/Xing4.1-Preview-W8A8-ascend-FlagOS`
- Repositorio SGLang (commit de referencia): 600df8dd498955f5aef4417383ea9ae5d2c238f7
