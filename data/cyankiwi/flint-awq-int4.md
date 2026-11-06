# cyankiwi/flint-AWQ-INT4

## Resumen

Flint es un modelo de lenguaje de tipo mezcla de expertos (MoE) desarrollado por Recursive, disenado especificamente para agentes de programacion: investigacion de bases de codigo, correccion de errores, implementacion de funcionalidades y escritura de tests. El modelo original cuenta con 39.800 millones de parametros totales y aproximadamente 2.500 millones activos por token, con una ventana de contexto documentada de 262.144 tokens y un corte de conocimiento declarado en junio de 2026.

La ficha que nos ocupa, sin embargo, no es el checkpoint original, sino una cuantizacion AWQ de 4 bits publicada por cyankiwi bajo el identificador `cyankiwi/flint-AWQ-INT4`. Esta variante reduce el peso del repositorio a 29,2 GB (frente a los aproximadamente 80 GB del BF16) y declara 10.026.768.160 parametros en sus ficheros safetensors, una cifra que no coincide con los 39,8B del modelo base y que conviene tratar con cautela: el recuento de tensores empaquetados en formato `compressed-tensors` no refleja el numero real de parametros del modelo.

Su relevancia actual es doble. Por un lado, Flint propone una arquitectura hibrida de atencion (ventana deslizante combinada con capas de atencion completa) orientada a cargas agenticas de contexto largo. Por otro, esta cuantizacion permite ejecutar un modelo de casi 40B en hardware mucho mas modesto que el B300 o H200 que exige el BF16, a costa de perder la mayor parte de la informacion de evaluacion y de soporte oficial del autor original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con mezcla de expertos (modelo base); cuantizacion AWQ INT4 sobre `compressed-tensors` (este repo) |
| Parametros totales | 39,8B en el modelo base; 10.026.768.160 declarados en los safetensors de esta cuantizacion (no comparable directamente) |
| Parametros activos | Aproximadamente 2,5B por token, incluida la cabeza de salida (cuerpo activo ~2,2B) |
| Longitud de contexto | 262.144 tokens documentados en el modelo base (prompt + salida); no verificado en esta cuantizacion |
| Tipos de cuantizacion | AWQ INT4 (4 bits, pesos); calibracion sobre datos STEM y agenticos |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con `compressed-tensors`; compatible con `transformers` y endpoints |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only con 49 capas: 2 capas densas seguidas de 47 capas MoE. Cada capa MoE contiene 256 expertos enrutados, de los cuales se seleccionan 6 por token, mas un experto compartido siempre activo. La atencion combina 35 capas de ventana deslizante (513 tokens: el token actual y los 512 precedentes) con 14 capas de atencion completa; las primeras usan RoPE y las segundas carecen de codificacion posicional. Emplea 32 cabezas de consulta y 4 de clave/valor con dimension de cabeza 128, normalizacion QK RMSNorm por cabeza y sumideros de atencion aprendidos por cabeza. El vocabulario es de 150.144 tokens.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO. La model card original menciona soporte de razonamiento y uso de herramientas multi-turno, lo que sugiere entrenamiento con datos agenticos, pero no se detalla. La cuantizacion de cyankiwi aplica AWQ de 4 bits con calibracion sobre un dataset propio de contenido STEM y agentico, version `26.05.01`.

## Capacidades

- Generacion de texto y razonamiento en formato conversacional multi-turno.
- Programacion agentica: exploracion de repositorios, localizacion de fallos, parches y generacion de tests.
- Uso de herramientas (tool calling) multi-turno, segun la model card del modelo base.
- Razonamiento de varios pasos orientado a tareas de ingenieria de software.
- Entrada y salida exclusivamente de texto (sin vision ni audio).
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Resolucion automatica de incidencias en repositorios: el modelo puede recibir un issue, navegar por el arbol de ficheros mediante tool calling y proponer un parche, aprovechando su contexto de 262.144 tokens para mantener visibles varios modulos a la vez.
- Integracion en pipelines de CI/CD: un agente basado en Flint podria leer el fallo de un test, localizar el codigo implicado y generar una correccion candidata para revision humana.
- Asistente de refactorizacion en el IDE: con la ventana de contexto larga, es viable cargar un conjunto amplio de ficheros relacionados y pedir cambios coherentes entre ellos.
- Generacion de tests unitarios: el modelo esta disenado explicitamente para escribir tests, por lo que encaja en flujos de aumento de cobertura sobre modulos existentes.
- Auditoria de codigo y revision de pull requests: analisis de diffs extensos con contexto del resto del repositorio, senalando riesgos o inconsistencias.
- Despliegue en hardware limitado: esta cuantizacion AWQ INT4 reduce el peso a 29,2 GB, lo que permite servir el modelo en una unica GPU de 48 GB o en configuraciones de 2x24 GB, algo inviable con el BF16 de ~80 GB.
- Experimentacion e investigacion: util para estudiar el comportamiento de un MoE con atencion hibrida en tareas agenticas sin acceso a hardware de gama alta.

## Benchmarks y rendimiento

Los unicos datos publicados corresponden al modelo base en BF16 y a su variante NVFP4, no a esta cuantizacion AWQ INT4. Se reproducen a continuacion como referencia del modelo de origen.

| Benchmark | Flint (modelo base, BF16) |
|---|---|
| Terminal-Bench 2.1 | 54,9 % |
| SWE-bench Pro v2 | 89,7 % |
| SWE-bench Verified | 74,2 % |

Las evaluaciones usan temperatura 1,0, top-p 0,95 y top-k 20; Terminal-Bench con Terminus 2 y SWE-bench con mini-swe-agent, con media pass@1 sobre al menos cinco intentos. La puntuacion de Terminal-Bench descuenta las soluciones obtenidas mediante recuperacion web.

No se han publicado resultados de benchmarks especificos para `cyankiwi/flint-AWQ-INT4` en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 29,2 GB, por lo que se necesita al menos ~30 GB de VRAM para cargar los pesos, mas espacio para KV cache y activaciones.
- GPU recomendadas: una GPU de 48 GB (A6000, L40S, RTX 6000 Ada) es el minimo comodo; tambien cabe en configuraciones multi-GPU de 2x24 GB con tensor parallelism.
- El modelo base BF16 requiere una B300 o H200 por replica segun el autor original; esta cuantizacion rebaja sustancialmente ese requisito, aunque no hay confirmacion oficial de soporte.
- Cabe en GPU de consumo: una RTX 4090 (24 GB) no es suficiente por si sola; seria necesario repartir entre dos unidades o recurrir a cuantizaciones adicionales.
- Opciones de despliegue: `transformers` con `compressed-tensors`, y servidores compatibles con endpoints OpenAI. El kit oficial de SGLang del modelo base no esta adaptado a esta variante.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| cyankiwi/flint-AWQ-INT4 | 39,8B (base) | ~2,5B | 262.144 (base) | Apache 2.0 | Cuantizacion comunitaria AWQ INT4 |
| RecursiveSI/flint | 39,8B | ~2,5B | 262.144 | Apache 2.0 | Checkpoint oficial BF16, requiere B300/H200 |
| Alternativas de codigo de ~30-40B | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificados en la informacion proporcionada |

No se dispone de informacion suficiente para establecer una comparativa rigurosa con modelos de la misma categoria.

## Limitaciones y advertencias

- La cuantizacion AWQ INT4 puede degradar la precision respecto al BF16, especialmente en tareas de razonamiento largo y agenticas; no hay evaluacion publicada que lo cuantifique.
- El recuento de parametros de los safetensors (10,03B) no coincide con el del modelo base (39,8B); es un artefacto del empaquetado de `compressed-tensors` y no debe interpretarse como un modelo mas pequeno.
- Riesgo de alucinacion inherente a los modelos de lenguaje, agravado en tareas de codigo donde una API inventada puede compilar pero fallar en ejecucion.
- Idiomas soportados no documentados; el rendimiento fuera del ingles no esta verificado.
- El modelo base declara un corte de conocimiento en junio de 2026, por lo que puede desconocer APIs y versiones posteriores.
- La licencia Apache 2.0 permite uso comercial, pero el autor de la cuantizacion no ofrece garantias ni soporte; el modelo base tampoco incluye codigo de modelado en `transformers` segun su model card.
- El repositorio tiene un volumen de descargas muy bajo (58) y ningun "like", lo que reduce la validacion comunitaria disponible.
- No se ha verificado que la ventana de 262.144 tokens funcione correctamente tras la cuantizacion.

## Enlaces

- Hugging Face (esta cuantizacion): https://huggingface.co/cyankiwi/flint-AWQ-INT4
- Modelo base: https://huggingface.co/RecursiveSI/flint
- Organizacion del cuantizador: https://huggingface.co/cyankiwi
- Web de cyankiwi: https://cyan.kiwi/
- Dataset de calibracion: https://huggingface.co/datasets/cyankiwi/calibration
- Blog de presentacion de Flint: https://www.recursive.com/updates/introducing-recursive-flint
- Organizacion Recursive en Hugging Face: https://huggingface.co/RecursiveSI
- Motor local de Recursive: https://github.com/recursive-oss/rec
- Documentacion de Recursive: https://docs.recursive.com/getting-started
