# IsValorum/Clover-35B-A3B-Preview-VAL-1.25M-I-Matrix-GGUF

## Resumen

Clover-35B-A3B-Preview-VAL-1.25M-I-Matrix-GGUF es una cuantizacion GGUF del modelo base Diffuspace/Clover-35B-A3B-Preview, publicada por el usuario IsValorum. El nombre indica que se trata de un modelo de arquitectura MoE (Mixture of Experts) con 35.000 millones de parametros totales y aproximadamente 3.000 millones de parametros activos por token (de ahi el sufijo A3B). La variante "1.25M" hace referencia a la matriz de importancia (importance matrix, imatrix) calculada sobre 1.251.328 posiciones de contexto, y "VAL" al autor de la cuantizacion.

El problema que resuelve esta publicacion es el de ofrecer pesos GGUF optimizados con una imatrix de alta calidad para facilitar el despliegue del modelo base en llama.cpp y otros runtimes compatibles, con una distribucion de calibracion cuidadosamente equilibrada entre codigo, razonamiento, texto y herramientas, y entre once idiomas naturales y diez lenguajes de programacion. La imatrix se genero con Flash Attention activada y sobre un pool de datos mucho mayor (version `balanced-4M-35-25-25-15-v2`) del que finalmente se muestreo.

La relevancia actual radica en que las imatrix de calidad son determinantes para el rendimiento de las cuantizaciones de baja precision en modelos MoE, y esta publicacion documenta con un detalle poco habitual el protocolo de calibracion, las cuotas por componente y las comprobaciones de integridad. Sin embargo, conviene advertir que los metadatos de Hugging Face muestran discrepancias importantes (el campo de parametros en safetensors indica 95.887.219, muy lejos de los 35B que sugiere el nombre) que deben tenerse en cuenta antes de confiar en las cifras nominales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts), segun el nombre `clover_moe`; detalles internos no disponibles |
| Parametros totales | 35B nominales segun el nombre del modelo; los metadatos de safetensors indican 95.887.219 (discrepancia no resuelta) |
| Parametros activos | Aproximadamente 3B segun el sufijo A3B del nombre; no confirmado en la informacion disponible |
| Longitud de contexto | No disponible (la calibracion uso ventanas de 2.048 tokens, pero no se especifica el contexto nativo del modelo) |
| Tipos de cuantizacion | GGUF con importancia matrix (imatrix); niveles especificos no detallados en la informacion disponible |
| Idiomas soportados | No disponible en los metadatos; la calibracion cubre 11 idiomas naturales (ingles, espanol, frances, chino, aleman, portugues, japones, ruso, arabe, coreano, italiano) y 10 lenguajes de programacion |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (single-file), con Flash Attention soportada |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base Diffuspace/Clover-35B-A3B-Preview mas alla de las etiquetas `clover_moe` y `flash-attention`, que indican una arquitectura de mezcla de expertos con soporte para atencion flash. No se especifican el numero de expertos, la estrategia de enrutamiento, la longitud de contexto nativa ni los datos de entrenamiento originales (numero de tokens, composicion del corpus, uso de RLHF o DPO). Tampoco se documenta si el modelo base incorpora innovaciones como decodificacion especulativa o atencion lineal.

Lo que si esta documentado con detalle es el proceso de calibracion de la imatrix realizado por IsValorum. Se procesaron 1.251.328 posiciones (611 ventanas de 2.048 tokens) muestreadas de un pool mayor de 1.261.939 posiciones, con una mezcla objetivo del 35% codigo, 25% razonamiento, 25% texto y 15% herramientas. La seleccion se realizo con el selector `balanced-1.25M-35-25-25-15-no-hi-v4-unique` sobre el pool `balanced-4M-35-25-25-15-v2`, permitiendo hasta 8 usos por contenido. La fuente fue un GGUF Q8_0 de un solo archivo con SHA256 declarado, y el backend empleado fue una compilacion publica de llama.cpp (PR #31306) con Flash Attention activada, `-ngl 99`, 12 hilos y batch/ubatch de 2.048. Las comprobaciones de integridad incluyen hashes del bundle, de los documentos seleccionados y del informe de calibracion, aunque se declara explicitamente que la paridad completa de tokenizer entre HF y GGUF es falsa porque Clover remapea el token 151669 a `<|mask|>` y elimina merges.

## Capacidades

- Generacion de texto: el pipeline declarado es `text-generation`, orientado a produccion de texto general.
- Razonamiento: la imatrix dedica un 25% de la calibracion a datos de razonamiento, lo que sugiere capacidad para tareas de razonamiento multi-paso.
- Generacion de codigo: el 35% de la calibracion es codigo en diez lenguajes (Python, JavaScript, TypeScript, Java, C++, C, Go, Rust, SQL, Shell), lo que indica soporte amplio de programacion.
- Uso de herramientas: el 15% de la calibracion corresponde a datos de tools, lo que apunta a soporte de tool calling / function calling, aunque no se detalla el formato exacto.
- Multilingue: once idiomas naturales cubiertos en la calibracion (ingles, espanol, frances, chino, aleman, portugues, japones, ruso, arabe, coreano, italiano).
- Flash Attention: soportada y utilizada durante la calibracion, lo que permite inferencia eficiente en contexto largo.
- Capacidades especiales (vision, audio, thinking mode explicito): no disponibles en la informacion proporcionada.

## Casos de uso

- Asistencia de programacion en produccion: el modelo puede integrarse en editores o pipelines de CI/CD para generar y revisar codigo en Python, TypeScript, Rust, Go y otros lenguajes, aprovechando que el 35% de la imatrix se dedica a codigo y que el modelo soporta tool calling para consultar documentacion o ejecutar tests.
- Razonamiento asistido en dominios tecnicos: con un 25% de la calibracion orientada a razonamiento, es adecuado para tareas de analisis multi-paso, depuracion logica o explicacion de conceptos complejos en un asistente conversacional.
- Agentes automatizados con herramientas: el 15% de datos de tools sugiere que el modelo puede orquestar llamadas a APIs, busquedas o funciones internas en flujos de agente de varios pasos, aunque conviene validar el formato de tool calling antes de desplegarlo.
- Atencion al cliente multilingue: al cubrir once idiomas naturales, puede gestionar conversaciones en espanol, ingles, frances, aleman, portugues, italiano y otros, con la ventaja de que el espanol recibe un 9,7% de la calibracion, uno de los pesos mas altos.
- Procesamiento de documentacion tecnica y SQL: la inclusion de SQL y Shell en la calibracion permite usarlo para generar consultas, scripts de automatizacion y explicaciones de esquemas de bases de datos.
- Despliegue local en estaciones de trabajo: al distribuirse como GGUF con imatrix, puede ejecutarse en llama.cpp sobre CPU o GPU consumer, lo que facilita prototipado y uso offline sin depender de servicios en la nube.
- Traduccion y localizacion asistida: la cobertura equilibrada de idiomas (con pesos del 14% para ingles, 10% para espanol y chino, 8% para frances) lo hace util para tareas de traduccion tecnica entre estos pares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precision, ya que no se detallan los niveles de cuantizacion ofrecidos ni el tamano final de cada archivo. El repositorio ocupa 0,4 GB, lo que sugiere que contiene principalmente artefactos de calibracion y no los pesos completos en todas las cuantizaciones.
- GPU recomendadas: la calibracion se realizo con CUDA 12 sobre arquitecturas sm_80/86/89/90 (A100, A10, L4/L40, H100) en Linux x86_64. El paquete universal de Windows cubre CUDA 12.8 desde sm_50 hasta sm_120, asi como GPUs AMD e Intel mediante Vulkan 1.4.363.
- GPU consumer: no confirmado; un modelo MoE de 35B totales con 3B activos podria caber en GPUs consumer de 24 GB en cuantizaciones bajas, pero no hay datos oficiales que lo confirmen.
- Opciones de despliegue: llama.cpp (compilacion especifica del PR #31306, `llama-clover-4838ffb`), con Flash Attention (`-fa on`), `-ngl 99` y mmap. No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles. La calibracion se ejecuto con 12 hilos, batch y ubatch de 2.048, pero no se publican metricas de rendimiento en inferencia.
- Plataformas no cubiertas por los runtimes precompilados: macOS, ARM64, ROCm y Blackwell en Linux requieren compilacion desde la misma rama y commit.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Clover-35B-A3B-Preview (esta cuantizacion) | 35B totales / ~3B activos (nominal) | No disponible | Apache 2.0 | GGUF con imatrix | Calibracion documentada al detalle; discrepancia en metadatos de parametros |
| Diffuspace/Clover-35B-A3B-Preview (base) | 35B totales / ~3B activos (nominal) | No disponible | Apache 2.0 | Safetensors (presumiblemente) | Modelo original sin cuantizar; referencia para comparar calidad |
| Alternativas MoE de tamano similar | No disponible | No disponible | No disponible | No disponible | No se dispone de informacion sobre modelos comparables en la busqueda realizada |

## Limitaciones y advertencias

- Discrepancia de parametros: los metadatos de safetensors indican 95.887.219 parametros, mientras que el nombre del modelo sugiere 35B totales. Esta inconsistencia no se resuelve en la informacion disponible y debe verificarse antes de asumir requisitos de hardware o capacidades.
- Paridad de tokenizer incompleta: se declara explicitamente que la paridad completa de IDs entre HF y GGUF es falsa, porque Clover remapea el token 151669 a `<|mask|>` y elimina merges. Esto puede provocar diferencias de tokenizacion entre el modelo base y esta cuantizacion.
- Desviacion de la fuente canonica: la imatrix se calculo sobre un GGUF Q8_0 en lugar de la fuente canonica BF16, lo que introduce una desviacion declarada que puede afectar ligeramente a la calibracion.
- Riesgo de alucinacion: no se documentan evaluaciones de fidelidad ni de tasas de alucinacion; como en cualquier modelo generativo, es esperable en tareas abiertas.
- Sesgos: no se proporciona informacion sobre sesgos conocidos ni sobre la composicion del corpus original del modelo base.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base y de los datos de calibracion por si hubiera restricciones adicionales no reflejadas.
- Cobertura de plataformas limitada: los runtimes precompilados no cubren macOS, ARM64, ROCm ni Blackwell en Linux, lo que limita el despliegue directo en esos entornos.
- Contexto nativo desconocido: aunque la calibracion uso ventanas de 2.048 tokens, no se especifica la longitud de contexto real del modelo, lo que impide planificar casos de uso con contexto largo.
- Madurez: el modelo se publico en octubre de 2026 (fechas de creacion y actualizacion) y cuenta con 153 descargas y 0 likes, lo que sugiere una adopcion limitada y poca validacion comunitaria.

## Enlaces

- Repositorio Hugging Face de esta cuantizacion: https://huggingface.co/IsValorum/Clover-35B-A3B-Preview-VAL-1.25M-I-Matrix-GGUF
- Modelo base: https://huggingface.co/Diffuspace/Clover-35B-A3B-Preview
- Revision del modelo base utilizada: `4b0402b65e523d0183a14c431955438714cb16ff`
- PR de llama.cpp empleado para la calibracion: PR #31306
- Pagina de soporte del autor: https://ko-fi.com/isvalorum
