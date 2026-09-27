# rAVEUK/Kimi-K2.7-Code

## Resumen

Kimi K2.7 Code es un modelo de lenguaje de enfoque agentico y orientado a codigo, desarrollado por Moonshot AI como evolucion de Kimi K2.6. Se distribuye bajo una arquitectura Mixture-of-Experts (MoE) con 1 billon de parametros totales y 32B activos por token, atencion MLA, ventana de contexto de 256K tokens e integracion de un encoder de vision MoonViT de 400M de parametros. La ficha que se analiza aqui no es el modelo original, sino una version derivada publicada por el usuario rAVEUK en HuggingFace, etiquetada con compressed-tensors y unsloth, y cuyo peso safetensors declara 1.026.879.376.368 parametros con un repositorio de 595,2 GB.

El problema que aborda es la ejecucion de tareas de ingenieria de software de horizonte largo: completar flujos de trabajo complejos de extremo a extremo. Segun la model card del modelo base, esta version mejora sustancialmente los resultados en tareas de codigo reales y reduce el consumo de tokens de razonamiento en torno a un 30 % respecto a Kimi K2.6, lo que abarata la inferencia en agentes que razonan antes de actuar. Su relevancia actual radica en la combinacion de contexto muy largo (256K), capacidades multimodales (pipeline image-text-to-text) y un perfil de benchmarks orientado a agentes y herramientas (MCP Atlas, MCP Mark Verified, Kimi Claw 24/7 Bench).

Es importante senalar que el repositorio analizado acumula 0 descargas y 0 likes en el momento de la consulta, esta creado y actualizado el 26 de septiembre de 2026, y no incluye informacion propia sobre idiomas soportados, composicion del dataset de entrenamiento ni proceso de alineamiento. La licencia declarada es modified-mit, con etiqueta generica license: other.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con atencion MLA y encoder de vision MoonViT |
| Parametros totales | 1.026.879.376.368 (~1,03 B) segun safetensors del repositorio; la model card del modelo base declara 1T |
| Parametros activos | 32B por token (8 expertos seleccionados de 384 mas 1 experto compartido) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | Repositorio etiquetado como compressed-tensors; la model card menciona Unsloth Dynamic 2.0 (GGUF). Detalle exacto de los ficheros: no disponible |
| Idiomas soportados | no disponible |
| Licencia | modified-mit (etiquetado como license: other y license_name: modified-mit) |
| Formato de pesos | safetensors; posible GGUF segun la referencia a Unsloth Dynamic 2.0 |
| Capas totales | 61 (1 de ellas densa) |
| Dimension oculta de atencion | 7168 |
| Dimension oculta MoE por experto | 2048 |
| Cabezas de atencion | 64 |
| Numero de expertos | 384 |
| Expertos seleccionados por token | 8 |
| Expertos compartidos | 1 |
| Tamano de vocabulario | 160K |
| Funcion de activacion | SwiGLU |
| Encoder de vision | MoonViT, 400M de parametros |
| Pipeline declarado | image-text-to-text |
| Libreria | transformers |
| Tamano del repositorio | 595,2 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer disperso de tipo Mixture-of-Experts con atencion Multi-head Latent Attention (MLA), que comprime el cache de claves y valores y resulta especialmente relevante para sostener una ventana de 256K tokens con un coste de memoria contenido. El modelo tiene 61 capas (una densa), dimension oculta de atencion de 7168, 64 cabezas de atencion, y una capa MoE con 384 expertos de dimension oculta 2048 cada uno, de los que se activan 8 por token, mas un experto compartido que se ejecuta siempre. La funcion de activacion es SwiGLU y el vocabulario es de 160K entradas. Incluye ademas un encoder de vision MoonViT de 400M de parametros, lo que explica que el pipeline declarado en HuggingFace sea image-text-to-text y que el modelo pueda procesar entradas visuales junto a texto.

Segun la informacion disponible, Kimi K2.7 Code se construye sobre Kimi K2.6 con mejoras centradas en tareas de codigo de horizonte largo y en eficiencia de tokens: la model card indica una reduccion de aproximadamente el 30 % en el uso de tokens de razonamiento respecto a la version anterior. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO u otras formas de alineamiento; esos datos no estan disponibles. El repositorio concreto analizado es una transformacion de terceros: incorpora la etiqueta compressed-tensors y referencias a herramientas de Unsloth, y su tamano en disco (595,2 GB) es coherente con una cuantizacion de aproximadamente 4,6 bits por parametro de media sobre los 1,03 B de parametros declarados, aunque el detalle exacto de los ficheros de cuantizacion no se detalla en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento general, con modo de razonamiento explicito (la model card habla de "thinking tokens" y de su reduccion respecto a K2.6).
- Generacion y edicion de codigo en escenarios de ingenieria de software reales, incluyendo tareas de horizonte largo y flujos de trabajo de extremo a extremo.
- Comprension de imagenes y texto: el pipeline declarado es image-text-to-text y el modelo incorpora un encoder MoonViT de 400M de parametros.
- Uso de herramientas y agentes: los benchmarks incluidos en la model card (MCP Atlas, MCP Mark Verified, Kimi Claw 24/7 Bench) evaluan explicitamente capacidades de agente y de integracion con herramientas tipo MCP.
- Razonamiento multi-paso en cadenas de acciones largas, segun la orientacion declarada a tareas de codigo de horizonte largo.
- Contexto muy largo de 256K tokens, adecuado para repositorios completos o conversaciones multi-turno extensas.
- Capacidades multilingues: no disponible (no se declara lista de idiomas).
- Capacidad de function calling: no se detalla de forma explicita en la informacion disponible, aunque los benchmarks de MCP apuntan a soporte de uso de herramientas.

## Casos de uso

- Refactorizacion de bases de codigo extensas: con 256K tokens de contexto, el modelo puede cargar modulos completos, ficheros de configuracion y tests en una sola ventana y proponer cambios coherentes entre ellos, reduciendo la necesidad de fragmentar el analisis.
- Agentes de ingenieria de software autonoma: los resultados en MCP Atlas (76,0) y MCP Mark Verified (81,1) indican que el modelo esta preparado para encadenar llamadas a herramientas (ejecucion de tests, lectura de ficheros, consultas a APIs) dentro de un bucle de agente con verificacion.
- Revision de codigo en pipelines de CI/CD: el modelo puede analizar diffs y contexto circundante en cada pull request, senalar regresiones potenciales y generar comentarios tecnicos antes de la fusion.
- Migracion de codigo entre lenguajes o frameworks: su capacidad de mantener contexto largo permite conservar el contrato semantico de un modulo completo durante la traduccion, y su orientacion a codigo mejora la fidelidad sintactica.
- Generacion y mantenimiento de tests: dado un modulo y su documentacion, el modelo puede producir pruebas unitarias y de integracion, y actualizarlas cuando cambia la implementacion.
- Atencion a incidencias tecnicas y triaje de bugs: con contexto de 256K puede correlacionar trazas, logs y fragmentos de codigo de varios servicios en una misma sesion para localizar la causa raiz.
- Analisis de diagramas y capturas en documentacion tecnica: gracias al encoder MoonViT y al pipeline image-text-to-text, puede interpretar diagramas de arquitectura o capturas de interfaces y traducirlos a codigo o documentacion.
- Asistente de larga duracion para tareas continuadas: el benchmark Kimi Claw 24/7 Bench sugiere un diseno pensado para sesiones prolongadas con cambios de estado frecuentes, util en automatizaciones que operan sin supervision continua.

## Benchmarks y rendimiento

Resultados publicados en la model card del modelo base. La tabla original esta truncada en la informacion disponible, por lo que solo se reproducen las filas facilitadas.

| Benchmark | Kimi K2.6 | Kimi K2.7 Code | GPT-5.5 | Claude Opus 4.8 |
|---|---|---|---|---|
| Kimi Code Bench v2 | 50,9 | 62,0 | 69,0 | 67,4 |
| Program Bench | 48,3 | 53,6 | 69,1 | 63,8 |
| MLS Bench Lite | 26,7 | 35,1 | 35,5 | 42,8 |
| Kimi Claw 24/7 Bench | 42,9 | 46,9 | 52,8 | 50,4 |
| MCP Atlas | 69,4 | 76,0 | 79,4 | 81,3 |
| MCP Mark Verified | 72,8 | 81,1 | 92,9 | 76,4 |

No se han publicado en la informacion disponible resultados de benchmarks clasicos como MMLU, HumanEval o GSM8K, ni mediciones del repositorio cuantizado concreto respecto al modelo original.

## Requisitos de hardware

- VRAM estimada para inferencia segun precision, calculada a partir de los 1,03 B de parametros declarados: aproximadamente 2 TB en bf16/fp16, alrededor de 1,03 TB en fp8/int8 y en torno a 515-600 GB en cuantizacion de 4 bits (el repositorio ocupa 595,2 GB, coherente con este ultimo rango).
- GPU recomendadas: para fp8 o int8 hacen falta del orden de 16 GPU H100 de 80 GB (1,28 TB agregados) o un nodo equivalente; para 4 bits, 8 GPU H100 de 80 GB (640 GB) quedan muy ajustadas y probablemente requieran tensor parallelism cuidadoso o algo mas de memoria.
- Alternativas de gama alta: nodos con 8x H200 o 8x B200 ofrecen mas margen para sostener contexto largo y cache KV con MLA.
- GPU de consumo: no cabe en una unica GPU de consumo. Una RTX 4090 de 24 GB o una RTX 5090 resultan inviables incluso en cuantizaciones agresivas; requeriria offloading masivo a RAM o SSD con latencias muy altas, poco practico para agentes interactivos.
- Opciones de despliegue: vLLM y SGLang son las rutas habituales para modelos MoE con atencion MLA; la etiqueta compressed-tensors apunta a integracion con runtimes compatibles con ese formato. La referencia a Unsloth Dynamic 2.0 abre la puerta a llama.cpp y Ollama si los GGUF estan efectivamente publicados, aunque el detalle de ficheros no esta disponible.
- Latencia y throughput: pese al tamano total, al activar solo 32B de parametros por token el coste computacional por token es comparable al de un modelo denso de ~32B; el cuello de botella real es el ancho de banda de memoria para leer los expertos activados y el coste de mantener la ventana de 256K. No se proporcionan cifras concretas de latencia ni tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Resultado destacado |
|---|---|---|---|---|
| Kimi K2.7 Code (Moonshot AI) | 1T totales, 32B activos (MoE) | 256K | modified-mit | Kimi Code Bench v2: 62,0; MCP Mark Verified: 81,1 |
| Kimi K2.6 (predecesor directo) | no disponible | no disponible | no disponible | Kimi Code Bench v2: 50,9; MCP Mark Verified: 72,8 |
| GPT-5.5 | no disponible | no disponible | propietaria | Kimi Code Bench v2: 69,0; MCP Mark Verified: 92,9 |
| Claude Opus 4.8 | no disponible | no disponible | propietaria | Kimi Code Bench v2: 67,4; MCP Mark Verified: 76,4 |

La comparacion con GPT-5.5 y Claude Opus 4.8 solo puede hacerse por resultados de benchmark, ya que no se dispone de sus especificaciones de arquitectura, parametros, contexto ni condiciones de licencia en la informacion proporcionada. Frente a Kimi K2.6, la mejora es consistente en las seis metricas publicadas, con incrementos de 11,1 puntos en Kimi Code Bench v2 y 8,3 puntos en MCP Mark Verified.

## Limitaciones y advertencias

- Sesgos: no se documenta ninguna evaluacion de sesgos ni de seguridad en la informacion disponible.
- Alucinacion: no se publican tasas de alucinacion ni evaluaciones de veracidad; en tareas de codigo de horizonte largo el riesgo de inventar APIs o firmas inexistentes sigue siendo relevante y exige verificacion con tests.
- Idiomas: no se declara la lista de idiomas soportados. Esto afecta directamente a despliegues en castellano, donde no hay garantia de calidad equivalente a la de los idiomas principales del entrenamiento original.
- Licencia: la etiqueta es license: other con license_name: modified-mit. Aunque el nombre sugiere permisividad, se trata de una licencia modificada y conviene revisar el fichero LICENSE del modelo base antes de cualquier uso comercial.
- Repositorio de terceros: este repositorio no lo publica Moonshot AI, sino el usuario rAVEUK. No hay validacion oficial, acumula 0 descargas y 0 likes, y no se documentan los parametros exactos de cuantizacion empleados. El rendimiento puede diferir del modelo original.
- Cuantizacion: cualquier cuantizacion introduce degradacion, especialmente en tareas de razonamiento de muchos pasos y en la fidelidad del codigo generado. No se aportan mediciones de esa perdida respecto al modelo sin cuantizar.
- Contexto: aunque la ventana es de 256K tokens, no se documenta el rendimiento real en el extremo de esa ventana (degradacion por posicion) ni el coste de memoria del cache KV en produccion.
- Model card incompleta: la tabla de benchmarks esta truncada en la informacion disponible, y no se detallan datos de entrenamiento, alineamiento ni evaluaciones de seguridad.
- Despliegue: el requisito de memoria (centenares de GB a mas de 1 TB) excluye cualquier escenario de una sola GPU, lo que limita su uso a infraestructura multi-GPU o a versiones GGUF fuertemente cuantizadas con penalizacion de velocidad.
- Fechas: el repositorio esta fechado en septiembre de 2026, posterior al conocimiento de referencia habitual; conviene verificar la vigencia de la informacion antes de citarla.

## Enlaces

- Repositorio analizado: https://huggingface.co/rAVEUK/Kimi-K2.7-Code
- Modelo base: https://huggingface.co/moonshotai/Kimi-K2.7-Code
- Licencia del modelo base: https://huggingface.co/moonshotai/Kimi-K2.7-Code/blob/main/LICENSE
- Pagina de producto Kimi Code: https://www.kimi.com/code
- Sitio de Moonshot AI: https://www.moonshot.ai
- Organizacion Moonshot AI en HuggingFace: https://huggingface.co/moonshotai
- Organizacion Moonshot AI en ModelScope: https://modelscope.cn/organization/moonshotai
- Twitter de Kimi: https://twitter.com/kimi_moonshot
- Discord de Kimi: https://discord.gg/TYU2fdJykW
- Repositorio de Unsloth: https://github.com/unslothai/unsloth/
- Documentacion de Unsloth Dynamic 2.0 GGUF: https://docs.unsloth.ai/basics/unsloth-dynamic-v2.0-gguf
- Documentacion general de Unsloth: https://docs.unsloth.ai/
- Discord de Unsloth: https://discord.gg/unsloth

Nota: las busquedas web realizadas no devolvieron resultados relevantes sobre el modelo; los enlaces obtenidos correspondian a paginas de soporte de YouTube TV y no se han incluido por no estar relacionados con la ficha.
