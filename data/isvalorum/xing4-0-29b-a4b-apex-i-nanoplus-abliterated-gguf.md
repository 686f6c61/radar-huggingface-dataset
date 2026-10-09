# IsValorum/Xing4.0-29B-A4B-APEX-I-NanoPlus-Abliterated-GGUF

## Resumen

Xing4.0-29B-A4B-APEX-I-NanoPlus-Abliterated-GGUF es una cuantizacion GGUF de tipo "handcrafted" (artesanal, tensor por tensor) del checkpoint huihui-ai/Huihui-Xing4.0-29B-A4B-abliterated, que a su vez es una version sin rechazos (abliterated) del modelo oficial XingChen-AGI/Xing4.0-29B-A4B. El autor de la cuantizacion es el usuario IsValorum, que publica esta edicion bajo la etiqueta APEX-I-NanoPlus y la distribuye con licencia Apache 2.0. No se trata por tanto de un modelo nuevo: es una compresion agresiva de un MoE de 29B nominales (31.215.031.088 parametros reales en safetensors) con aproximadamente 4B de parametros activos por token.

El valor diferencial del release esta en el compromiso entre tamano y fidelidad. El fichero final ocupa 11,74 GB (10,94 GiB, 2,92 bits por peso de media), frente a los 62,40 GB del BF16 de origen, conservando segun el autor una calidad practica de la clase Q4_K_M / Q4_K_S. Para conseguirlo, la asignacion de precision concentra bits en las proyecciones residuales, las dos capas densas de entrada, MLA, mHC, los routers y la ruta de salida, y rebaja las proyecciones gate/up de los expertos enrutados. Esto lo hace util para GPUs de consumo con poca VRAM o para despliegues hibridos CPU/GPU donde 2 GB extra de margen cambian por completo el offload posible.

El modelo base hereda la arquitectura de Xing4.0: mHC (manifold-constrained Hyper-Connections), Multi-head Latent Attention (MLA) y una capa Multi-Token Prediction (MTP), con 262.144 tokens de contexto nativo (256K) y extension documentada hasta 512K. Los idiomas declarados son ingles y chino, y el pipeline es text-generation. En el momento de redactar esta ficha, el repositorio acumula 856 descargas y 1 like, con licencia Apache 2.0 tanto en el GGUF como en el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con mHC (manifold-constrained Hyper-Connections), MLA (Multi-head Latent Attention) y 1 capa MTP |
| Parametros totales | 31.215.031.088 (segun safetensors del modelo base); denominacion comercial "29B" |
| Parametros activos | ~4B por token (A4B); 4 expertos enrutados de 64 + 1 experto compartido siempre activo |
| Longitud de contexto | 262.144 tokens nativos (256K); ampliable a 512K segun el autor de Xing4.0 |
| Tipos de cuantizacion | GGUF APEX-I-NanoPlus (2,92 BPW, 11,74 GB); variante APEX-I-MiniPlus V2.1 (3,42 BPW, 13,76 GB); referencia BF16 (16,00 BPW, 62,40 GB) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente de Xing4.0-29B-A4B no es un MoE uniforme de 40 capas. Las capas 0 y 1 son capas FFN densas (`first_k_dense_replace: 2`), mientras que las capas 2 a 39 son capas MoE con 64 expertos enrutados, 4 seleccionados por token y un experto compartido siempre activo. Ademas, existe un bloque MTP adicional almacenado como `blk.40` en el GGUF. El modelo oficial se entreno sobre la pila Ascend NPU / MindSpore, y el checkpoint intermedio usado aqui es la variante abliterated de huihui-ai, generada con un flujo de abliteracion basado en Sumandora/remove-refusals-with-transformers. Esta cuantizacion GGUF no aplica ningun procedimiento adicional de eliminacion de rechazos.

Sobre el entrenamiento original (numero exacto de tokens, composicion del dataset, uso de RLHF o DPO) no hay datos en la informacion disponible; el autor de la cuantizacion solo describe el proceso de compresion. Ese proceso se apoya en una matriz de calibracion imatrix propia y en una asignacion quirurgica de precision por tensor, auditada contra el GGUF resultante. La innovacion tecnica del release no esta en el modelo, sino en el esquema de cuantizacion: precision alta en routers, MLA, mHC, capas densas de entrada y ruta de salida, y precision mas baja en las proyecciones gate/up de los expertos, que es donde el ahorro de espacio tiene menor impacto en perplejidad.

## Capacidades

- Generacion de texto conversacional y de proposito general, con pipeline text-generation.
- Razonamiento (reasoning) y resolucion de problemas en varios pasos, incluyendo modo de pensamiento segun la etiqueta declarada por el autor.
- Generacion de codigo, con etiquetas explicitas de coding.
- Flujos agenticos (agentic) y planificacion de tareas con multiples pasos.
- Uso de herramientas: la ficha declara soporte de tool use como una de las capacidades del modelo base.
- Contexto largo: 256K tokens nativos, con extension documentada a 512K, adecuado para documentos extensos o historiales largos.
- Multilingue limitado a ingles y chino; no se declara soporte de castellano.
- Variante abliterated, por lo que el modelo evita los rechazos tipicos de un checkpoint alineado.
- Capacidad de prediccion multi-token gracias a la capa MTP, que puede aprovecharse para decodificacion especulativa en llama.cpp.

No se declaran capacidades de vision, audio ni otras modalidades.

## Casos de uso

- Despliegue local en GPU de consumo: con 11,74 GB de pesos, el modelo entra en tarjetas de 12-16 GB (RTX 3060 12 GB, RTX 4070 Ti Super, RTX 4080) dejando espacio parcial para cache KV, algo que el BF16 de 62,40 GB hace inviable.
- Asistente de codigo en el IDE: el modelo esta etiquetado como orientado a coding y razonamiento, por lo que puede integrarse en flujos de autocompletado, revision de diffs o generacion de tests dentro del editor.
- Agentes autonomos con uso de herramientas: el soporte de tool calling declarado permite construir bucles de razonamiento multi-paso que invoquen APIs, ejecuten comandos o consulten bases de datos.
- Analisis de documentos largos: con 256K tokens nativos se pueden procesar contratos, informes tecnicos o repositorios completos en una sola pasada, sin necesidad de chunking agresivo.
- Despliegue hibrido CPU/GPU: el ahorro de ~2 GB frente a MiniPlus permite mantener mas capas en VRAM y derivar el resto a RAM en equipos con GPU modesta, mejorando el throughput frente a configuraciones con mas offload.
- Pipelines de generacion de contenido en ingles y chino: traduccion tecnica, redaccion asistida o resumen para audiencias en esos dos idiomas, que son los unicos declarados.
- Investigacion sobre cuantizacion: el release incluye mediciones de perplejidad propias y un mapa de cuantizacion por tensor, lo que lo convierte en un caso de estudio util para comparar estrategias de compresion en MoE con MLA.
- Entornos sin censura para pruebas de robustez y red teaming: al ser abliterated, permite evaluar respuestas del modelo ante prompts que un checkpoint alineado rechazaria, siempre dentro de un marco etico y legal.

## Benchmarks y rendimiento

El autor no publica resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.). La unica metrica reportada es la perplejidad sobre WikiText-2, medida con `llama-perplexity` en una configuracion homogenea de 2048 tokens de contexto, batch 512 y 10 chunks:

| Metrica | BF16 origen | APEX-I-NanoPlus | APEX-I-MiniPlus V2.1 |
|---|---|---|---|
| Perplejidad WikiText-2 | 7,3060 +/- 0,18633 | 8,3197 +/- 0,21528 | 7,7238 +/- 0,19671 |
| Delta de perplejidad | 0 | +1,0137 (+13,87%) | +0,4178 (+5,71%) |
| Tamano del GGUF | 62,40 GB | 11,74 GB | 13,76 GB |
| BPW medio | 16,00 | 2,92 | 3,42 |
| Calidad practica objetivo | Precision completa | Clase Q4_K_M / Q4_K_S | Clase Q5_K_M |

No se han publicado resultados de benchmarks de tareas (razonamiento, codigo, matematicas) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para los pesos: 11,74 GB en el fichero NanoPlus; 13,76 GB en MiniPlus V2.1. A ello hay que sumar la cache KV, cuyo tamano depende del contexto efectivo y de la configuracion de llama.cpp, por lo que en contextos de 256K puede exigir decenas de GB adicionales o cuantizacion de la propia KV.
- GPU recomendadas por el autor: no se especifican en la informacion disponible. Por tamano de pesos, encajan GPUs de 16 GB o mas (RTX 4080, RTX 4090, A100 40 GB, H100) para ejecucion integra en VRAM con contexto moderado.
- Cabe en GPU de consumo: si, en modelos con 12 GB o mas de VRAM, siempre que se limite el contexto o se cuantice la cache KV y se acepte cierto offload a RAM.
- Opciones de despliegue: llama.cpp y cualquier runtime compatible con GGUF (Ollama, LM Studio, llama-cpp-python, servidores con endpoints compatibles). El autor incluye una seccion de quickstart de llama.cpp en la model card.
- Latencia y throughput: la model card menciona una seccion de "Hardware Throughput: GPU Projections & Tested RAM Offload", pero su contenido no esta incluido en la informacion disponible, por lo que no se pueden citar cifras concretas. Al tener solo ~4B parametros activos por token, el coste de computo por token es notablemente inferior al de un modelo denso de 31B.

## Comparativa con modelos similares

La informacion disponible solo permite comparar con las otras ediciones de la misma familia. No hay datos de modelos externos comparables en el material proporcionado.

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Tamano | Licencia |
|---|---|---|---|---|---|
| APEX-I-NanoPlus (este) | 31,2B totales / ~4B activos | 256K nativos | 8,3197 | 11,74 GB | apache-2.0 |
| APEX-I-MiniPlus V2.1 | 31,2B totales / ~4B activos | 256K nativos | 7,7238 | 13,76 GB | apache-2.0 |
| Xing4.0-29B-A4B BF16 | 31,2B totales / ~4B activos | 256K nativos | 7,3060 | 62,40 GB | apache-2.0 |
| Otros MoE de tamano similar (por ejemplo, Qwen3-30B-A3B) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Alucinacion: es un modelo de lenguaje sin mecanismo de verificacion factual; la cuantizacion a 2,92 BPW incrementa la perplejidad un 13,87% respecto al BF16, lo que puede aumentar la tasa de errores en tareas sensibles.
- Idiomas: solo se declaran ingles y chino. No hay soporte garantizado de castellano ni de otros idiomas, y el rendimiento fuera de en y zh puede degradarse de forma notable.
- Perdida de calidad: NanoPlus se situa por debajo de MiniPlus V2.1 en fidelidad. Si la tarea es sensible a la precision (codigo complejo, matematicas, razonamiento encadenado largo), conviene valorar MiniPlus o una cuantizacion de mayor precision.
- Modelo abliterated: al proceder de un checkpoint sin rechazos, puede generar contenido inapropiado, ofensivo o inseguro sin las salvaguardas habituales. Es responsabilidad del desplegador anadir filtros propios si el caso de uso lo requiere.
- Licencia: Apache 2.0 permite uso comercial, pero el desplegador debe verificar las condiciones del modelo base y del modelo original de XingChen-AGI, ya que se encadenan tres niveles (Xing4.0 oficial, abliterated de huihui-ai y cuantizacion de IsValorum).
- Contexto: aunque se anuncian 256K tokens nativos y 512K con extension, en la practica el coste de la cache KV limita el contexto util en hardware de consumo; no se aportan mediciones de rendimiento a contexto largo.
- Reproducibilidad y soporte: se trata de una cuantizacion artesanal mantenida por un autor individual, no de un release oficial; la metodologia exacta de asignacion por tensor y la matriz imatrix no estan publicadas en la informacion disponible.
- Madurez del ecosistema: el modelo base pertenece a la familia Xing4.0, con un ecosistema mas reducido que otras familias, lo que puede implicar menos herramientas, ejemplos y soporte comunitario.

## Enlaces

- Repositorio HuggingFace de esta cuantizacion: https://huggingface.co/IsValorum/Xing4.0-29B-A4B-APEX-I-NanoPlus-Abliterated-GGUF
- Variante APEX-I-MiniPlus V2.1: https://huggingface.co/IsValorum/Xing4.0-29B-A4B-APEX-I-MiniPlus-V2.1-Abliterated-GGUF
- Modelo base abliterated (huihui-ai): https://huggingface.co/huihui-ai/Huihui-Xing4.0-29B-A4B-abliterated
- Modelo oficial de XingChen-AGI: https://huggingface.co/XingChen-AGI/Xing4.0-29B-A4B
- Metodo de abliteracion de referencia: https://github.com/Sumandora/remove-refusals-with-transformers
- Contribuciones del autor (Ko-fi): https://ko-fi.com/isvalorum

No se han encontrado otros enlaces relevantes (papers, blogs o demos) en la busqueda web realizada.
