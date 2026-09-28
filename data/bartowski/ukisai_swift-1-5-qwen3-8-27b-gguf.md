# bartowski/ukisai_Swift-1.5-Qwen3.8-27b-GGUF

## Resumen

Swift-1.5-Qwen3.8-27b es un modelo de lenguaje post-entrenado por ukisai a partir de la familia Qwen3, con un recuento real de 27.320.697.856 parametros (etiquetado como 28B en la model card del autor). Esta ficha corresponde concretamente a la version cuantizada en GGUF publicada por bartowski, que convierte el modelo original a una amplia gama de precisiones (desde bf16 completo hasta IQ4_NL) para su uso en llama.cpp y otros motores compatibles con GGUF.

El modelo esta orientado a razonamiento eficiente y ahorro de tokens ("reasoning", "efficient-thinking", "token-efficient"), e incorpora soporte multimodal texto-imagen cuando se carga junto al fichero mmproj, ademas de decodificacion especulativa mediante MTP (multi-token prediction). Su enfoque de post-entrenamiento y la etiqueta "terminal-bench" sugieren una optimizacion hacia tareas de agente y uso de terminal, con soporte explicito para tool calling segun el formato de prompt documentado.

El repo destaca por su volumen (446,8 GB en total) y por ofrecer cuantizaciones calibradas con imatrix para preservar calidad con menor peso. Su licencia propietaria swift-open-license-1.0 (no estandar de codigo abierto) y el estado "gated" del repositorio son factores clave a considerar antes de integrarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3 (familia qwen3_8); soporte multimodal imagen-texto con fichero mmproj |
| Parametros totales | 27.320.697.856 (etiquetado como 28B por el autor) |
| Parametros activos | no aplica / no disponible (no se indica arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, Q8_0, Q6_K_L, Q6_K, Q6_K_S, Q5_K_M, Q5_K_S, Q4_K_L, Q4_1, Q4_K_M, IQ4_NL (lista completa no disponible por truncamiento del README) |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-1.0 (campo "other" en HuggingFace); repositorio protegido (gated) |
| Formato de pesos | GGUF (cuantizado con llama.cpp b11159); el modelo base original se distribuye por separado |

## Arquitectura y entrenamiento

La model card identifica el modelo como perteneciente a la familia Qwen3 ("qwen3_8") y lo describe como un modelo de razonamiento post-entrenado. El pipeline en HuggingFace es "image-text-to-text", y se documenta soporte de entrada de imagen cuando se carga el fichero mmproj correspondiente, lo que apunta a una arquitectura multimodal (LLM con proyector visual). El recuento de parametros (27,32 mil millones) y la denominacion "27b" encajan con un modelo denso de esa escala; no hay evidencia en la informacion proporcionada de que se trate de un modelo MoE. Las etiquetas "efficient-thinking" y "token-efficient" indican que el post-entrenamiento se ha orientado a reducir el gasto de tokens durante el razonamiento.

En cuanto a innovaciones tecnicas, el modelo declara soporte de decodificacion especulativa mediante MTP (multi-token prediction), lo que puede acelerar la inferencia al predecir varios tokens por paso. La cuantizacion de bartowski se ha realizado con llama.cpp release b11159 empleando imatrix, es decir, matrices de importancia que permiten calibrar mejor la perdida de precision en cada capa. El formato de prompt documentado fuerza un modo de razonamiento explicito con esfuerzo configurable ("Reasoning effort is set to xhigh") y abre un bloque `<think>` antes de la respuesta, ademas de definir un esquema XML concreto para las llamadas a herramientas. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni las tecnicas concretas de alineacion (RLHF, DPO, etc.).

## Capacidades

- Generacion de texto conversacional multi-turno (etiqueta "conversational").
- Razonamiento explicito con modo de pensamiento: el prompt abre un bloque `<think>` y admite niveles de esfuerzo de razonamiento (configurado a "xhigh" en el ejemplo del autor).
- Razonamiento eficiente y ahorro de tokens ("efficient-thinking", "token-efficient"), pensado para reducir el coste de cadenas de pensamiento largas.
- Soporte de tool calling / function calling con un formato XML especifico (`<tool_call>`, `<function=...>`, `<parameter=...>`).
- Capacidades orientadas a agentes y tareas de terminal (etiqueta "terminal-bench").
- Entrada multimodal de imagen cuando se carga junto al fichero mmproj (pipeline image-text-to-text).
- Decodificacion especulativa mediante MTP para acelerar la generacion.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Agentes de terminal y automatizacion de shell: las etiquetas del modelo y su modo de razonamiento explicito lo orientan a tareas de linea de comandos, donde puede planificar pasos, ejecutar comandos y validar resultados de forma iterativa.
- Asistentes de codigo con tool calling: el formato XML documentado permite integrarlo en pipelines que invocan funciones externas (lectura de ficheros, APIs, ejecucion de tests) dentro de un bucle de agente.
- Razonamiento de varios pasos con coste controlado: gracias a "efficient-thinking" y "token-efficient", resulta adecuado para flujos donde el presupuesto de tokens es una restriccion (por ejemplo, backends con facturacion por token).
- Atencion al cliente con entrada de imagen: al aceptar texto e imagen (con mmproj), puede gestionar conversaciones donde el usuario adjunta capturas o documentos escaneados.
- Analisis de documentos e imagenes tecnicas: la combinacion de vision y razonamiento permite extraer y validar informacion de diagramas o capturas en procesos internos.
- Despliegue local en estaciones de trabajo con GPU de consumo: las cuantizaciones Q4_K_M (17,44 GB) y Q5_K_S (19,57 GB) permiten ejecutar el modelo en equipos con VRAM limitada mediante llama.cpp.
- Prototipado de investigacion en razonamiento: el modo de pensamiento explicito y los distintos niveles de esfuerzo facilitan experimentos sobre cadenas de razonamiento y eficiencia de tokens.
- Servicios self-hosted con control de datos: al distribuirse en GGUF y ejecutarse localmente, encaja en entornos con requisitos de confidencialidad donde no se puede enviar informacion a APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente incluye la etiqueta "terminal-bench", que indica que el modelo ha sido evaluado o entrenado con relacion a esa familia de tareas, pero no se aportan cifras concretas de MMLU, HumanEval, GSM8K ni de Terminal-Bench.

## Requisitos de hardware

Los tamanos de fichero indicados en la model card permiten estimar los requisitos de memoria de pesos (habria que sumar el KV cache y el overhead del runtime):

| Cuantizacion | Tamano de fichero | VRAM orientativa (pesos) |
|---|---|---|
| bf16 | 54,66 GB (dividido en partes) | ~55 GB+ |
| Q8_0 | 29,12 GB | ~30 GB+ |
| Q6_K_L | 24,96 GB | ~25 GB+ |
| Q6_K | 23,86 GB | ~24 GB+ |
| Q6_K_S | 22,86 GB | ~23 GB+ |
| Q5_K_M | 20,92 GB | ~21 GB+ |
| Q5_K_S | 19,57 GB | ~20 GB+ |
| Q4_K_L | 18,82 GB | ~19 GB+ |
| Q4_1 | 17,83 GB | ~18 GB+ |
| Q4_K_M | 17,44 GB | ~18 GB+ |

- Cabe en GPU de consumo: Q4_K_M (17,44 GB) es viable en tarjetas con 24 GB de VRAM (por ejemplo RTX 3090 o RTX 4090) dejando margen para contexto y KV cache; Q5_K_S y superiores exigen 24 GB o mas y pueden requerir reparto de capas entre GPU y CPU.
- GPU profesionales: A100 (40/80 GB), H100 y L40S pueden alojar sin problema las cuantizaciones altas (Q6_K, Q8_0) e incluso bf16 en configuraciones de 80 GB.
- Reparto CPU/GPU: las cuantizaciones Q4 y Q5 permiten offload parcial de capas a CPU en equipos con VRAM insuficiente usando llama.cpp.
- Opciones de despliegue: llama.cpp (motor de referencia de estas cuantizaciones), ademas de Ollama, LM Studio y otros runtimes compatibles con GGUF. Las etiquetas incluyen "endpoints_compatible", lo que indica compatibilidad con endpoints de inferencia tipo API.
- Latencia y throughput: no disponibles en la informacion proporcionada. El soporte de decodificacion especulativa (MTP) puede reducir la latencia, pero no se aportan cifras.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de rendimiento ni de especificaciones detalladas de modelos comparables, por lo que la comparacion cuantitativa no esta disponible. A modo orientativo, el unico punto de referencia documentado es el propio modelo base:

| Modelo | Parametros | Contexto | Licencia | Formato | Datos de benchmark |
|---|---|---|---|---|---|
| ukisai/Swift-1.5-Qwen3.8-27b (base) | 27,32B | no disponible | swift-open-license-1.0 | safetensors (repo original) | no disponibles |
| bartowski/ukisai_Swift-1.5-Qwen3.8-27b-GGUF (esta ficha) | 27,32B | no disponible | swift-open-license-1.0 | GGUF | no disponibles |
| Alternativas de ~27-32B (Qwen3 y similares) | no disponible | no disponible | no disponible | no disponible | no disponibles |

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la informacion proporcionada; no se documenta ninguna evaluacion de sesgo.
- Riesgo de alucinacion: no cuantificado en la informacion disponible. El modo de razonamiento explicito no elimina el riesgo de respuestas incorrectas, especialmente en tareas factuales.
- Idiomas soportados: no disponibles; no se puede garantizar un rendimiento adecuado fuera de los idiomas mayoritarios del entrenamiento original (no especificados).
- Longitud de contexto: no disponible; este dato es critico para dimensionar el KV cache y para decidir su uso en tareas de contexto largo.
- Licencia: swift-open-license-1.0 no es una licencia de codigo abierto estandar. Es imprescindible revisar el texto completo (enlazado en el README del modelo base) antes de cualquier uso comercial, ya que puede imponer restricciones de atribucion, uso o redistribucion.
- Repositorio protegido (gated): el acceso requiere aceptar condiciones en HuggingFace, lo que puede complicar la integracion automatizada en pipelines de CI/CD.
- Reproducibilidad: la lista completa de cuantizaciones del README aparece truncada en la informacion disponible; conviene consultar el repositorio para conocer todas las variantes (por ejemplo, otras cuantizaciones IQ).
- Rendimiento tras cuantizacion: las variantes por debajo de Q4_K_M pueden degradar la calidad de razonamiento y de tool calling, capacidades especialmente sensibles a la perdida de precision.
- Naturaleza del artefacto: esta ficha describe una cuantizacion de terceros (bartowski) del modelo de ukisai, no el modelo original; los resultados y el soporte dependen de ambos autores.

## Enlaces

- Repositorio de la cuantizacion GGUF: https://huggingface.co/bartowski/ukisai_Swift-1.5-Qwen3.8-27b-GGUF
- Modelo base: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Licencia del modelo base: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b/blob/main/LICENSE
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Release de llama.cpp b11159: https://github.com/ggml-org/llama.cpp/releases/tag/b11159
- Cuantizacion recomendada Q4_K_M: https://huggingface.co/bartowski/ukisai_Swift-1.5-Qwen3.8-27b-GGUF/blob/main/ukisai_Swift-1.5-Qwen3.8-27b-Q4_K_M.gguf
- Ficheros bf16: https://huggingface.co/bartowski/ukisai_Swift-1.5-Qwen3.8-27b-GGUF/tree/main/ukisai_Swift-1.5-Qwen3.8-27b-bf16
