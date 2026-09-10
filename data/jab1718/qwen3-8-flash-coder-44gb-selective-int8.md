# Jab1718/qwen3.8-flash-coder-44gb-selective-int8

## Resumen

Qwen3.8-Flash-Coder-44GB-Selective-INT8 es un checkpoint de generacion de codigo basado en una arquitectura de mezcla de expertos (MoE), publicado por el usuario Jab1718 en HuggingFace. Se obtiene mediante dos transformaciones sucesivas sobre el modelo original Qwen/Qwen3.8-Flash-Next (aproximadamente 335 GB): primero un recorte de expertos ("MoE slicing") que reduce el modelo a 160 expertos y 48 capas, dando lugar al checkpoint padre Jab1718/qwen3.8-flash-coder-85gb-bf16 (85,24 GB), y despues una cuantizacion selectiva a INT8 que deja el peso final en 44,29 GB.

La innovacion principal es que la cuantizacion no se aplica de forma uniforme. Las puertas del router (router gates), las proyecciones de atencion (q_proj, k_proj, v_proj, o_proj), el experto compartido, las RMSNorm, los embeddings y la LM Head se mantienen en BF16 nativo, mientras que unicamente las proyecciones de los 160 expertos (gate_up_proj y down_proj) se cuantizan a INT8 simetrico por canal con escalas dinamicas. El objetivo declarado es evitar el "routing collapse" que sufren las cuantizaciones MoE agresivas y permitir el despliegue completo sin offload en 2 GPU de 32 GB o en una unica A100/H100 de 80 GB.

El modelo tiene 42.649.832.320 parametros totales (unos 42,6 mil millones) segun los pesos en safetensors, con 8 expertos activos por token. Su relevancia practica es que acerca un MoE de codigo de gran tamano a hardware de gama profesional asequible, con licencia Apache 2.0 y soporte declarado para transformers, vLLM y TGI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos) con atencion multi-cabeza y atencion lineal; arquitectura declarada como `qwen4_exp_text`; incluye un modulo `hyper_connection_mixer` |
| Parametros totales | 42.649.832.320 (~42,6 B) segun safetensors |
| Parametros activos | no disponible (se sabe que activa 8 expertos por token de un total de 160, pero no se publica el recuento exacto de parametros activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 simetrico por canal en las proyecciones de los expertos (`gate_up_proj`, `down_proj`); BF16 nativo en router gates, atencion, experto compartido, RMSNorm, embeddings y LM Head. No se ofrecen variantes GGUF ni de 4 bits |
| Idiomas soportados | en, vi, zh (segun los tags de la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (2 shards de 25,3 GB y 19,0 GB) |
| Numero de capas | 48 |
| Expertos totales | 160 (frente a 512 del modelo monolitico original) |
| Expertos activos por token | 8 |
| Modelo base | Jab1718/qwen3.8-flash-coder-85gb-bf16 (a su vez derivado de Qwen/Qwen3.8-Flash-Next) |
| Despliegue declarado | transformers, vLLM, text-generation-inference, endpoints compatible |
| Descargas / likes (HuggingFace) | 438 descargas, 15 likes |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only con capas de mezcla de expertos. El modelo consta de 48 capas y 160 expertos, de los cuales se activan 8 por token. La model card menciona explicitamente dos mecanismos de atencion (atencion multi-cabeza clasica y atencion lineal) y un modulo denominado `hyper_connection_mixer`, ademas de un experto compartido siempre activo. No se especifica si la atencion lineal se combina con la atencion completa en un esquema hibrido por capas ni cual es el ratio entre ambas.

El proceso de construccion tiene tres etapas documentadas. La primera es un recorte ("slicing") desde el monolito Qwen/Qwen3.8-Flash-Next de 335 GB, que pasa de 512 a 160 expertos y reduce el checkpoint a 85,24 GB en BF16. La segunda es la cuantizacion selectiva descrita en el apartado anterior. La tercera, segun la model card, incluye un ajuste fino posterior, ya que se reporta una mejora de +16,0 puntos absolutos en Pass@1 respecto al modelo base "sin ajustar" (67,0% frente a 83,0%). No se detallan el volumen de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF, DPO u otras. El model card describe el modelo como un "high-performance, selective-quantized MoE coding model", pero no documenta la fase de instruccion ni la plantilla de chat completa (el ejemplo de quickstart se corta en el mensaje de sistema).

La innovacion tecnica mas relevante es la cuantizacion selectiva con preservacion de la ruta de enrutado: al mantener el router en BF16 se evita la degradacion del enrutado que, segun el autor, provoca colapso de enrutado cuando se cuantiza todo uniformemente. La desquantizacion se describe como "on-demand y vectorizada" durante la inferencia.

## Capacidades

- Generacion de codigo en multiples lenguajes: C++ moderno (C++20, concurrencia, punteros inteligentes, conceptos, plantillas), Rust (Tokio, MPSC asincrono, mutex, iteradores, borrow checker), Go (worker pools, canales, marshalling JSON), TypeScript (debounce generico, reintentos de promesas, deep clone, validadores tipo Zod) y Python (programacion dinamica, arboles BST/LCA/Trie, busqueda binaria, ordenacion).
- Agente de codigo autonomo: la propia model card incluye una suite de 20 tareas de "coding agent" con depuracion automatizada, refactorizacion y generacion de parches en formato diff, y relleno en medio (fill-in-the-middle, FIM).
- Razonamiento multi-paso orientado a tareas de ingenieria de sistemas y algoritmia, segun los resultados del banco de pruebas del autor.
- Capacidades multilingues limitadas a ingles, vietnamita y chino segun los metadatos; no se declara soporte de castellano.
- Compatibilidad con text-generation-inference, vLLM y endpoints, lo que habilita su uso en servidores de inferencia con API compatible con OpenAI.
- No se declaran capacidades de vision, audio, tool calling explicito ni modo de razonamiento extendido ("thinking mode"); no hay informacion al respecto en la documentacion disponible.

## Casos de uso

- Asistencia a desarrolladores en C++ de sistemas: el modelo obtuvo un 100% de Pass@1 en la suite de 10 tareas de C++20 del banco de pruebas del autor (colas thread-safe, contadores atomicos, conceptos y plantillas), por lo que encaja en generacion y revision de codigo concurrente de bajo nivel.
- Migracion y modernizacion de codigo Rust: con un 100% en la suite de Rust (Tokio, canales MPSC, iteradores, patrones de traits), resulta adecuado para tareas de refactorizacion guiada por el compilador y resolucion de errores del borrow checker.
- Agente de depuracion automatica en CI: la model card reporta un 100% en tareas de depuracion automatizada dentro de la suite de agente, lo que permite integrarlo en pipelines que reciben un fallo de test y generan un parche candidato.
- Generacion de parches y diffs en revision de codigo: el modelo fue evaluado en refactorizacion y generacion de parches en formato diff (100% en esa subtarea), util para asistentes que proponen cambios sobre pull requests.
- Relleno en medio (FIM) para autocompletado en IDE: la suite de coding agent incluye tareas de FIM, lo que lo hace apto para completado de codigo en linea en editores, siempre que se implemente el pre/post-procesado de plantilla.
- Despliegue en infraestructura de gama profesional: al requerir aproximadamente 22,1 GB por GPU en 2 GPU de 32 GB (o una sola A100/H100 de 80 GB), permite servir un MoE de 42,6 B parametros en servidores de 2x RTX 5000 Ada o 2x RTX 4090 sin offload a CPU.
- Procesamiento por lotes de tareas algorítmicas en Python: con un 78% en 50 tareas de algoritmia (programacion dinamica, arboles, busqueda), sirve para generar soluciones y tests unitarios en volúmenes grandes.
- Soporte a equipos con presencia en Vietnam o China: los idiomas declarados (en, vi, zh) permiten interacciones tecnicas en esos idiomas, aunque no en castellano.

## Benchmarks y rendimiento

Los unicos datos publicados son los del banco de pruebas propio del autor ("Empirical Sandbox Benchmark", 100 tareas ejecutadas en sandbox aislado). No hay resultados de MMLU, HumanEval, GSM8K ni de benchmarks academicos estandar en la informacion disponible.

| Lenguaje / dominio | Tareas | Pass@1 | Competencias verificadas |
|---|---|---|---|
| C++ (C++20) | 10 | 100,0% (10/10) | Concurrencia (`ThreadSafeQueue`, `AtomicCounter`), punteros inteligentes, conceptos C++20, plantillas |
| Rust (sistemas) | 10 | 100,0% (10/10) | Tokio async MPSC, mutex seguro, iteradores, borrow checker, pattern matching, traits |
| Go | 5 | 80,0% (4/5) | Worker pools, sincronizacion por canales, marshalling JSON de structs, busqueda binaria sobre slice |
| TypeScript (fullstack) | 5 | 80,0% (4/5) | Debounce generico, reintento de promesas, deep clone generico, validador de esquemas tipo Zod |
| Agente de codigo | 20 | 80,0% (16/20) | Depuracion automatizada (100%), refactorizacion y parches diff (100%), fill-in-the-middle |
| Algoritmos en Python | 50 | 78,0% (39/50) | Programacion dinamica, estructuras de arbol (BST, LCA, Trie), busqueda binaria, ordenacion |
| Total | 100 | 83,0% (83/100) | Ejecucion real de codigo en sandbox aislado multi-lenguaje |

El autor indica que el modelo base sin ajustar obtenia un 67,0% en el mismo banco de pruebas, lo que supone una mejora absoluta de +16,0 puntos. Se trata de una evaluacion propia, no auditada de forma independiente, y sin detalle publico sobre el metodo de evaluacion (criterios de exito, temperatura de muestreo, numero de intentos por tarea).

## Requisitos de hardware

- VRAM total: 44,29 GB de pesos. Uso declarado de aproximadamente 22,1 GB por GPU en una configuracion de 2 GPU.
- Configuracion minima declarada: 2x GPU de 32 GB (por ejemplo, 2x NVIDIA RTX 5000 Ada) o 2x RTX 4090 / RTX 3090 de 24 GB. Tambien se indica que cabe en una unica A100 o H100 de 80 GB.
- Cabe en GPU de consumo: si, en 2x RTX 4090 o 2x RTX 3090 de 24 GB, siempre que se reparta el modelo entre ambas y se acepte ejecucion multi-GPU sin tensor parallelism (el ejemplo oficial usa `device_map` por capas: embeddings y capas 0-23 en `cuda:0`; capas 24-47, `hyper_connection_mixer`, `norm` y `lm_head` en `cuda:1`). No cabe en una unica GPU de 24 GB con los pesos tal cual.
- Comparativa con el checkpoint padre: el padre BF16 de 85,24 GB requeria 3x RTX 5000 Ada (aproximadamente 27,3 GB por GPU); este checkpoint reduce el requisito a 2 GPU.
- Opciones de despliegue: transformers (con `trust_remote_code=True` y `device_map` manual), vLLM, text-generation-inference (TGI) y endpoints compatibles, segun los tags del repositorio. No hay soporte GGUF, por lo que llama.cpp y Ollama no son viables sin una conversion adicional no documentada.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato / despliegue | Benchmarks publicos |
|---|---|---|---|---|---|---|
| Qwen3.8-Flash-Coder-44GB-Selective-INT8 | 42,6 B | no disponible (8 de 160 expertos activos) | no disponible | Apache 2.0 | safetensors INT8 selectivo; transformers, vLLM, TGI | Solo banco de pruebas propio del autor (83,0% en 100 tareas) |
| Qwen2.5-Coder-32B-Instruct | 32 B (denso) | no aplica | 128k tokens (referencia publica del modelo original) | Apache 2.0 | safetensors, GGUF, AWQ, GPTQ | Datos publicos de HumanEval, MBPP, etc. |
| Qwen3-30B-A3B | 30,5 B | 3,3 B | 128k tokens (referencia publica del modelo original) | Apache 2.0 | safetensors, GGUF | Datos publicos de MMLU, HumanEval, etc. |
| Qwen3.8-Flash-Coder-85GB-BF16 (modelo padre) | no disponible | no disponible | no disponible | Apache 2.0 | safetensors BF16 | 67,0% en el mismo banco de pruebas del autor |

Nota: los datos de contexto y parametros de Qwen2.5-Coder-32B-Instruct y Qwen3-30B-A3B corresponden a informacion publica de sus respectivas fichas y no se han verificado contra el repositorio de este modelo. No se dispone de una comparacion de benchmarks homogenea entre estos modelos y el checkpoint aqui descrito, ya que el unico conjunto de resultados de este ultimo es el banco de pruebas propio del autor.

## Limitaciones y advertencias

- Ausencia de benchmarks estandar: no hay resultados de MMLU, HumanEval, MBPP, GSM8K ni SWE-bench. El unico dato disponible (83,0% Pass@1 en 100 tareas) procede de un banco de pruebas propio del autor, sin auditoria independiente ni detalle metodologico publico.
- Discrepancia en el tamano del repositorio: la model card declara 44,29 GB de pesos, mientras que el campo de tamano del repositorio en HuggingFace indica 87,6 GB. Conviene verificar el contenido real del repositorio antes de planificar el despliegue.
- Idiomas: solo se declaran ingles, vietnamita y chino. El castellano no esta soportado oficialmente, por lo que el rendimiento en espanol es imprevisible.
- Longitud de contexto desconocida: no se especifica la ventana de contexto, lo que impide garantizar el comportamiento en tareas que requieren contexto largo (repositorios completos, conversaciones multi-turno extensas).
- Riesgo de alucinacion: es un modelo de generacion de codigo sin datos publicados sobre tasas de alucinacion ni de fabricacion de APIs inexistentes. En produccion es obligatorio ejecutar los fragmentos generados en un sandbox antes de aplicarlos.
- Requiere `trust_remote_code=True`: la carga implica ejecutar codigo remoto del repositorio, lo que supone un riesgo de seguridad que debe evaluarse en entornos corporativos.
- Cuantizacion no reversible por configuracion: el checkpoint esta cuantizado en INT8 selectivo; no se ofrecen variantes GGUF ni de 4 bits, lo que limita el despliegue en CPU o en GPUs con menos VRAM.
- Dependencia de dos GPU sin tensor parallelism: el ejemplo oficial reparte capas entre dos GPU con `device_map`, un esquema que no ofrece el mismo rendimiento que el paralelismo tensorial y que puede generar desequilibrios de carga (las capas se asignan por mitades, sin tener en cuenta el uso real de expertos).
- Rendimiento en Go y TypeScript inferior: 80% en ambos casos frente al 100% en C++ y Rust, lo que sugiere menor fiabilidad en esos ecosistemas.
- Licencia Apache 2.0: permite uso comercial sin restriccion de royalties, pero al ser una obra derivada conviene conservar los avisos de licencia y verificar las condiciones del modelo original Qwen/Qwen3.8-Flash-Next.
- Sin informacion sobre sesgos: no se documentan evaluaciones de sesgo ni de seguridad, ni filtros de contenido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jab1718/qwen3.8-flash-coder-44gb-selective-int8
- Checkpoint padre en BF16: https://huggingface.co/Jab1718/qwen3.8-flash-coder-85gb-bf16
- Repositorio del toolkit de recorte MoE (moe-slice): https://github.com/Jab1718/Moe-slices
- Modelo original monolitico citado en la model card: Qwen/Qwen3.8-Flash-Next (referencia textual, sin URL verificada en la informacion disponible)
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a sitios no relacionados (Cameo y Snapchat) y se descartan.
- No disponible: paper, blog tecnico, demo o espacio de HuggingFace asociados al modelo.
