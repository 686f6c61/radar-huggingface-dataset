# Ooriginador/Qwen3.8-Flash-Next-ArkCompact-Q4_K_M

## Resumen

Qwen3.8-Flash-Next-ArkCompact-Q4_K_M es una distribucion comprimida y cuantizada del modelo Qwen3.8-Flash-Next, desarrollada por Ooriginador dentro del ecosistema ArkheionNet / Sovereign AI OS. El modelo base, creado por el equipo Qwen, es un modelo de lenguaje masivo con arquitectura híbrida que combina Gated DeltaNet (GDN), atencion dispersa (QSA) y un Mixture-of-Experts (MoE) con 512 expertos totales. Esta version especifica aplica un empaquetado ternario de 1.58 bits (base-3) sobre la mayoria de los tensores, reduciendo el peso en memoria mas de 20 veces respecto a FP32, y posteriormente exporta el resultado a formato GGUF con cuantizacion Q4_K_M para facilitar su uso con runtimes como llama.cpp u Ollama.

El modelo mantiene 125 mil millones de parametros totales, de los cuales aproximadamente 6 mil millones se activan por token gracias al enrutamiento dinamico de 10 expertos mas 1 compartido. Su ventana de contexto se fija en 32.768 tokens en esta version comprimida, inferior a los 262.144 del modelo original. La licencia Apache 2.0 permite uso comercial sin restricciones. Aunque el repositorio no incluye resultados de benchmarks, el modelo base ha sido evaluado en tareas como JobBench, CoWorkBench, IFBench y Agent's Last Exam, segun fuentes externas.

La relevancia de esta ficha radica en que representa un caso extremo de compresion de modelos de gran tamano, combinando tecnicas de cuantizacion ternaria con una arquitectura MoE de ultima generacion. Es una opcion interesante para desarrolladores que buscan ejecutar un modelo de 125B en hardware limitado, aunque con la salvedad de que la compresion puede afectar a la calidad de las respuestas y el contexto se ve reducido respecto a la version original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen4ExpForConditionalGeneration (Hybrid Gated DeltaNet + Sparse Attention + MoE) |
| Parametros totales | 125.000.000.000 (125B) |
| Parametros activos | ~6.000.000.000 (6B) por token |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | 1.58-bit ternario (nativo .ark), Q4_K_M (GGUF) |
| Idiomas soportados | Ingles, portugues, chino, codigo |
| Licencia | Apache 2.0 |
| Formato de pesos | .ark (nativo), .gguf (Q4_K_M) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next introduce innovaciones en atencion, residuos, embeddings y optimizacion. Su arquitectura combina una capa de atencion hibrida GDN (Gated DeltaNet) con atencion dispersa (QSA), disenada para mejorar la eficiencia computacional y la capacidad del modelo. La parte MoE cuenta con 512 expertos totales, de los cuales se activan 10 rutados y 1 compartido por token, lo que permite un coste de inferencia proporcional a los 6B parametros activos, no a los 125B totales. La configuracion de capas es de 36, con 16 cabezas de atencion y dimension de modelo 2048.

La version ArkCompact aplica una compresion adicional: 1.244 de los 1.658 tensores se empaquetan en formato ternario de 1.58 bits (5 trits por byte), mientras que los 414 restantes (normas y biases) se mantienen en FP32. El resultado nativo .ark ocupa 39.67 GiB, frente a los 500 GiB del modelo en FP32, logrando una reduccion de 12.6 veces. Posteriormente, el archivo se exporta a GGUF con cuantizacion Q4_K_M, ocupando 139.00 GiB. La fidelidad espectral se mide con una correlacion de Pearson media de 0.9033 sobre todos los tensores, lo que indica una degradacion moderada pero no despreciable.

No se dispone de informacion detallada sobre el proceso de entrenamiento del modelo base (numero de tokens, dataset, uso de RLHF o DPO). La model card de esta version solo menciona la compresion, no el entrenamiento original.

## Capacidades

- Generacion de texto en ingles, portugues, chino y codigo de programacion (lenguajes no especificados, pero tipicamente Python, Rust, etc.).
- Razonamiento complejo y resolucion de problemas gracias a la arquitectura MoE con 6B parametros activos.
- Generacion de codigo y asistencia en programacion, como se muestra en los ejemplos de la model card (construccion de pipelines en Rust).
- Soporte para tareas de agente y razonamiento multi-paso, segun los benchmarks del modelo original mencionados en fuentes externas (Agent's Last Exam, CoWorkBench).
- Capacidad de atencion a contexto largo dentro de su ventana de 32.768 tokens.
- No se especifica soporte explicito para tool calling o function calling en esta version, aunque es probable que el modelo base lo herede. No hay confirmacion en la informacion disponible.
- No incluye capacidades de vision o audio; es exclusivamente texto.

## Casos de uso

- Asistente de programacion en entornos de desarrollo: el modelo puede generar, revisar y depurar codigo en multiples lenguajes. Su capacidad de razonamiento y su entrenamiento con datos de codigo lo hacen adecuado para integrarse en IDEs o pipelines de CI/CD, aunque su tamano requiere infraestructura potente.
- Analisis de documentos largos en ingles, portugues o chino: con 32.768 tokens de contexto, puede procesar informes extensos, articulos cientificos o contratos, extrayendo informacion y resumiendo contenido.
- Chatbot multilingue para atencion al cliente: soporta tres idiomas naturales y puede mantener conversaciones multi-turno, aunque la ausencia de tool calling limita la integracion con sistemas externos.
- Generacion de documentacion tecnica: dada su capacidad de razonamiento y generacion de texto, puede redactar manuales, guias y documentacion de API a partir de especificaciones.
- Investigacion academica en procesamiento de lenguaje natural: como modelo de 125B con activacion dispersa, sirve para experimentos de compresion, eficiencia y calidad de modelos MoE, especialmente en entornos con recursos limitados gracias a su formato .ark.
- Traduccion asistida entre ingles, portugues y chino: aunque no esta especializado en traduccion, su capacidad multilingue permite generar traducciones con revision humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta version comprimida. El modelo original Qwen3.8-Flash-Next ha sido evaluado en tareas como JobBench, CoWorkBench, IFBench y Agent's Last Exam, segun el sitio aireleasetracker.com, pero no se proporcionan valores concretos en los materiales consultados. No se dispone de datos comparativos con otros modelos en esta ficha.

## Requisitos de hardware

- El archivo GGUF Q4_K_M ocupa 139.00 GiB, por lo que se requiere al menos una GPU con 140 GB de VRAM o multiples GPUs. Por ejemplo, 2x A100 80GB o 4x RTX 4090 (24GB cada una) con distribucion de capas.
- El archivo nativo .ark ocupa 39.67 GiB, lo que permite su ejecucion en una sola GPU de 48 GB (como A6000) o 2x RTX 4090 (48 GB combinados), aunque el runtime Rust de ArkheionNet puede hacer inferencia hibrida GPU/CPU.
- No cabe en GPUs de consumo de 8-16 GB (RTX 3060, 4060, etc.) en ninguno de los formatos.
- Opciones de despliegue: llama.cpp (para GGUF), Ollama (mediante Modelfile), y ArkheionNet Sovereign Engine (para .ark, escrito en Rust).
- La latencia y el throughput no estan documentados. Dado el tamano del modelo, se espera una generacion de pocos tokens por segundo incluso con GPUs de alta gama, aunque el MoE con 6B activos reduce el coste computacional respecto a un modelo denso de 125B.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Formato | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (original) | 125B | 6B | 262.144 tokens | safetensors | Apache 2.0 |
| Qwen3.8-Flash-Next-ArkCompact (esta version) | 125B | 6B | 32.768 tokens | .ark / .gguf | Apache 2.0 |
| DeepSeek-V3 (referencia MoE) | 671B | 37B | 128K | safetensors | MIT |

La comparativa es limitada porque no se dispone de datos de rendimiento para esta version comprimida. Frente al modelo original, esta version sacrifica contexto y posiblemente calidad a cambio de un menor requisito de memoria. En comparacion con otros MoE como DeepSeek-V3, el modelo es mas pequeno y activa menos parametros por token, pero no hay benchmarks que permitan una comparacion objetiva.

## Limitaciones y advertencias

- La compresion ternaria de 1.58 bits puede degradar la calidad de las respuestas en comparacion con el modelo original en FP32 o cuantizaciones mas conservadoras. La correlacion de Pearson de 0.9033 indica una perdida de fidelidad no trivial.
- La ventana de contexto se ha reducido de 262.144 tokens en el modelo original a 32.768 tokens en esta version, lo que limita el procesamiento de documentos muy largos.
- Los idiomas soportados son solo ingles, portugues y chino; no incluye castellano ni otros idiomas europeos.
- No se ha confirmado soporte para tool calling o function calling, lo que puede ser un inconveniente para integraciones con APIs o agentes.
- El modelo es experimental (version "Next" con arquitectura Qwen4Exp) y puede presentar comportamientos impredecibles o alucinaciones frecuentes, especialmente en tareas de razonamiento complejo.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es una publicacion reciente sin validacion por parte de la comunidad.
- No se han publicado benchmarks para esta version, por lo que su rendimiento real es desconocido.
- Aunque la licencia Apache 2.0 permite uso comercial, el software de compresion ARKCOMPACT es parte del ecosistema ArkheionNet y puede tener restricciones adicionales no detalladas.

## Enlaces

- Repositorio de esta version: https://huggingface.co/Ooriginador/Qwen3.8-Flash-Next-ArkCompact-Q4_K_M
- Repositorio del modelo original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- GitHub del modelo original: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Coleccion de Qwen3.8-Flash-Next: https://huggingface.co/collections/Qwen/qwen38-flash-next
- Pagina de benchmarks y especificaciones: https://aireleasetracker.com/model/qwen/qwen3.8-flash-next
- Receta vLLM para el modelo original: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
