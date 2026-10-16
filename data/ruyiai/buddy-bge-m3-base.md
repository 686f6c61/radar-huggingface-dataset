# RuyiAI/buddy-bge-m3-base

## Resumen

RuyiAI/buddy-bge-m3-base es un paquete binario `.rax` compilado de forma cruzada para la arquitectura RISC-V (riscv64), pensado para ejecutarse con el runtime `buddy-cli` del proyecto buddy-mlir. No se trata de un modelo nuevo ni de pesos entrenados por RuyiAI, sino de una reempaquetado del modelo de embeddings BAAI/bge-m3, del que se declara como upstream en la propia model card, asociado al commit `60f354a` (`60f354a7b659a1ce36fdf9ba7bd97fdbf6bb0e5f`).

El objetivo del artefacto es llevar un modelo de recuperación de información multilingüe a hardware RISC-V sin depender de toolchains de aprendizaje profundo convencionales (PyTorch, CUDA, etc.). El paquete está compilado para un objetivo `generic riscv64`, es decir, cualquier longitud de vector (VLEN) y sin requerir las extensiones `Zfh` ni `Zvfh`, lo que maximiza la compatibilidad con núcleos RISC-V existentes a costa de renunciar a optimizaciones específicas de hardware.

Es relevante ahora porque forma parte del esfuerzo más amplio de RuyiAI por construir una pila de software de IA nativa para RISC-V, con un compilador de IA extremo a extremo (RuyiAI Buddy Compiler) presentado en el RISC-V European Summit 2026. Sin embargo, la ficha pública es extremadamente escueta: el repositorio ocupa 2,3 GB, no declara licencia, idiomas ni pipeline, y en el momento de la consulta acumulaba 0 descargas y 0 "likes". Cualquier evaluación seria debería remitirse al modelo base BAAI/bge-m3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la informacion proporcionada. El modelo base (BAAI/bge-m3) es un modelo de embeddings con recuperacion densa, multi-vector y dispersa segun la documentacion de BGE |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible. Se distribuye un unico artefacto `.rax`; no se documentan variantes cuantizadas |
| Idiomas soportados | No disponible para este paquete. El modelo base BAAI/bge-m3 admite mas de 100 idiomas segun la documentacion de BGE |
| Licencia | No disponible |
| Formato de pesos | Paquete compilado `.rax` para el runtime `buddy-cli` (buddy-mlir), objetivo riscv64 generico |

Datos adicionales del repositorio: version `60f354a`, tamano de 2,3 GB, creado y actualizado el 16 de octubre de 2026, etiqueta `region:us`, pipeline no declarado, autor RuyiAI.

## Arquitectura y entrenamiento

La informacion proporcionada no describe la arquitectura interna del artefacto. Lo que si se documenta es su naturaleza: una compilacion cruzada (cross-compiled) del modelo BAAI/bge-m3 para riscv64, empaquetada en el formato `.rax` que consume el runtime `buddy-cli`. El objetivo de compilacion es `generic riscv64 (any VLEN, no Zfh/Zvfh)`, lo que implica que el binario no asume ninguna longitud de vector concreta ni la presencia de extensiones de coma flotante de media precision, y por tanto deberia ejecutarse en cualquier implementacion de la ISA RV64.

Respecto al modelo de origen, la documentacion de BGE consultada describe BGE-M3 como un modelo de embeddings compuesto, con tres funcionalidades de recuperacion simultaneas (densa, multi-vector y dispersa) y soporte para mas de 100 idiomas. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de ajuste como RLHF o DPO, ni para el modelo base ni para este paquete. Tampoco se documentan innovaciones propias de la compilacion (por ejemplo, que pases de optimizacion de buddy-mlir se aplicaron), mas alla de la referencia al compilador Buddy en la charla del RISC-V European Summit 2026.

El tamano del repositorio (2,3 GB) es coherente con un artefacto de pesos sin cuantizar, pero no permite deducir con certeza el numero de parametros del modelo.

## Capacidades

- Recuperacion de informacion: al derivar de BAAI/bge-m3, el modelo esta orientado a generar representaciones para busqueda semantica, no a la generacion libre de texto.
- Recuperacion densa, multi-vector y dispersa de forma simultanea, segun la documentacion del modelo base.
- Cobertura multilingue amplia (mas de 100 idiomas en el modelo base, segun la documentacion de BGE); no confirmada para este paquete concreto.
- Ejecucion en hardware RISC-V mediante `buddy-cli`, con un unico artefacto `.rax`.
- Interfaz de linea de comandos con parametro `--prompt` (`buddy-cli --model bge_m3-base/bge_m3-base.rax --prompt "hello"`), cuya semantica exacta (embedding frente a generacion) no se especifica en la model card.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (el modelo base no es un modelo generativo de proposito general).
- Capacidades de vision o audio: no disponibles.
- Modo "thinking": no aplicable segun la informacion disponible.

## Casos de uso

- Busqueda semantica en corpus multilingues: indexar documentos en varios idiomas y recuperarlos por similitud semantica, aprovechando la funcionalidad de recuperacion densa y multilingue heredada del modelo base. Adecuado cuando el corpus mezcla idiomas y no se quiere mantener un modelo por lengua.
- Recuperacion hibrida en pipelines RAG: combinar la recuperacion dispersa (tipo BM25) con la densa y la multi-vector en una sola pasada de codificacion, lo que reduce el numero de componentes en el pipeline de recuperacion.
- Reordenacion (reranking) de resultados: la representacion multi-vector permite puntuar pares consulta-documento con mayor granularidad que un simple producto escalar de embeddings densos.
- Deduplicacion y agrupamiento de documentos: generar embeddings y aplicar similitud coseno o clustering para detectar duplicados y agrupar contenidos tematicamente en grandes repositorios.
- Despliegue en el borde sobre RISC-V: ejecutar busqueda semantica local en dispositivos o tarjetas con CPU RISC-V sin acceso a GPU, usando el binario `.rax` y `buddy-cli` como unico runtime. Es el escenario para el que este paquete parece disenado.
- Evaluacion de la pila de IA para RISC-V: usar el paquete como banco de pruebas para medir el rendimiento y la correccion del compilador Buddy y del runtime `buddy-cli` frente a implementaciones de referencia en x86 o ARM.
- Clasificacion y enrutado de texto por similitud: asignar etiquetas o dirigir consultas a un flujo concreto comparando el embedding de la consulta con embeddings de prototipos por categoria.

En todos los casos, la idoneidad practica depende de caracteristicas del modelo base (dimension de embedding, longitud de contexto, licencia) que no estan documentadas en este repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del paquete no incluye metricas de recuperacion (por ejemplo, nDCG, Recall@k o MRR), ni comparaciones de latencia o throughput en RISC-V, ni resultados de evaluaciones multilingues tipo MMTEB. Tampoco se documenta ninguna medicion del propio compilador Buddy sobre este artefacto.

## Requisitos de hardware

- Arquitectura objetivo: riscv64 generica, cualquier VLEN, sin necesidad de `Zfh` ni `Zvfh`.
- VRAM: no aplica en el sentido habitual; el objetivo es CPU RISC-V. La memoria necesaria debe cubrir al menos el tamano del paquete (2,3 GB) mas el estado de ejecucion del runtime, aunque no se especifica el consumo real.
- GPU recomendadas: no disponibles. El artefacto no esta dirigido a GPUs NVIDIA o AMD.
- Compatibilidad con GPU de consumo: no disponible y, en principio, fuera del alcance del paquete, que es especifico de RISC-V.
- Opciones de despliegue: `buddy-cli` del proyecto buddy-mlir, instalado mediante el script `install_buddy_cli.sh`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Formato | Plataforma objetivo | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| RuyiAI/buddy-bge-m3-base | `.rax` | riscv64 generico, runtime `buddy-cli` | No disponible | Paquete publicado, 0 descargas y 0 likes en la consulta | Reempaquetado de BGE-M3; model card minima |
| trdthg/buddy-bge-m3-base | `.rax` | riscv64, runtime `buddy-cli` | No disponible | Repositorio espejo localizado en la busqueda web | Misma descripcion que el paquete de RuyiAI |
| BAAI/bge-m3 | Pesos del modelo original (formato no detallado en la informacion disponible) | Framework de aprendizaje profundo convencional (no RISC-V especifico) | No disponible en la informacion proporcionada | Modelo de referencia ampliamente citado; admite recuperacion densa, multi-vector y dispersa y mas de 100 idiomas | Es el upstream declarado de los dos paquetes anteriores |

No se dispone de datos de rendimiento comparativos entre estas opciones, ni de otras alternativas de embeddings multilingues, en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica la licencia ni del paquete `.rax` ni de los pesos subyacentes, por lo que no puede confirmarse la legalidad de un uso comercial. Es un bloqueo directo para produccion.
- Model card practicamente vacia: sin pipeline, sin idiomas, sin metricas y sin descripcion de la arquitectura. Toda evaluacion depende de la documentacion del modelo base.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- Naturaleza no generativa: procede de un modelo de embeddings, por lo que no debe esperarse generacion de texto, razonamiento conversacional ni tool calling, pese a que la interfaz del CLI exponga un parametro `--prompt`.
- Riesgo de recuperacion fallida: como cualquier modelo de embeddings, puede producir similitudes espurias entre consultas y documentos no relacionados, o perder documentos relevantes por limitaciones de longitud de contexto (no documentada aqui).
- Contexto e idiomas: la longitud maxima de entrada y la cobertura idiomatica efectiva de este paquete no estan documentadas; las cifras del modelo base (mas de 100 idiomas) corresponden a BAAI/bge-m3 y no se han verificado sobre el binario `.rax`.
- Optimizacion generica: el objetivo `generic riscv64` sin `Zfh`/`Zvfh` maximiza compatibilidad, pero previsiblemente deja rendimiento sobre la mesa en nucleos con extensiones vectoriales o de media precision que no se estan explotando.
- Opacidad del artefacto: un binario `.rax` compilado no es inspeccionable ni modificable con las herramientas habituales de cuantizacion o fusion de pesos; cualquier ajuste fino exigiria volver al modelo original y recompilar.
- Dependencia de la cadena de herramientas: el uso requiere instalar `buddy-cli` desde un script remoto, lo que anade un vector de riesgo en entornos controlados y una dependencia de versiones entre el paquete y el runtime.
- Ausencia de datos de robustez: no hay informacion sobre sesgos, comportamiento ante dominios especializados ni evaluaciones reproducibles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RuyiAI/buddy-bge-m3-base
- Repositorio espejo: https://huggingface.co/trdthg/buddy-bge-m3-base
- Modelo base: https://huggingface.co/BAAI/bge-m3
- Documentacion de BGE-M3: https://bge-model.com/bge/bge_m3.html
- Runtime buddy-cli / compilador buddy-mlir: https://github.com/buddy-compiler/buddy-mlir
- Organizacion RuyiAI en HuggingFace: https://huggingface.co/RuyiAI
- Sitio de RuyiAI: https://www.ruyiai.org/
- Charla sobre compilacion de IA extremo a extremo para RISC-V (RISC-V European Summit 2026): https://cfp.riscv-europe.org/eu-summit-2026/talk/CH97A7/
