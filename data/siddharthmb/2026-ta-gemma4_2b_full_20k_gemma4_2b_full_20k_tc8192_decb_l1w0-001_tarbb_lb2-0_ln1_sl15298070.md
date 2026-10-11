# siddharthmb/2026.TA.gemma4_2b_full_20k_gemma4_2b_full_20k_tc8192_decb_l1w0.001_tarbb_lb2.0_ln1_sl15298070

## Resumen

Este repositorio contiene un adaptador de tipo transcoder sparse entrenado en modo bridging sobre el modelo base google/gemma-4-E2B, con google/gemma-4-E2B-it como modelo de referencia. Lo publica el usuario siddharthmb dentro de su proyecto transcoder-adapters, cuyo código vive en un repositorio de GitHub propio. No es un modelo de chat convencional: es un artefacto de investigación orientado al análisis de representaciones internas, la interpretabilidad y la adaptación dispersa de las capas MLP.

El checkpoint se distribuye en safetensors y contiene 5.509.713.699 parámetros según los metadatos reales del repositorio, que ocupa 11,1 GB. La arquitectura declarada es gemma4 y el componente adaptado es un conjunto de transcoders de 8192 características (n_features = 8192) con sesgo de decodificación activado. La carga requiere las clases propias del proyecto (`models.auto.load_transcoder_model`), no las clases automáticas estándar de transformers.

Su relevancia es acotada y muy específica: sirve como herramienta para inspeccionar y dirigir características concretas del modelo base mediante identificadores de característica (steering por cantor id), generar grafos de atribución y estudiar cómo un adaptador puede aproximar el comportamiento del modelo de referencia (instruct) manteniendo las MLP del modelo base. Los resultados de benchmarks no están publicados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | gemma4 con adaptadores transcoder sparse en las capas MLP |
| Parametros totales | 5.509.713.699 (~5,51 mil millones), segun safetensors |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

Datos adicionales del repositorio: tamano 11,1 GB, 8 descargas y 0 likes en el momento de la consulta, biblioteca declarada transformers, creado el 2026-05-07 y actualizado el 2026-10-11, etiqueta `endpoints_compatible`, region us. Modelo base: google/gemma-4-E2B. Tokenizer: google/gemma-4-E2B-it.

## Arquitectura y entrenamiento

El adaptador se construye sobre google/gemma-4-E2B (arquitectura gemma4) y se entrena en modo bridging con `backbone: target`, es decir, el backbone objetivo es el del modelo de referencia google/gemma-4-E2B-it. El componente aprendido son transcoders sparse de 8192 características con sesgo de decodificación (`dec_bias: True`) y peso de regularización L1 de 0,001. El nombre del repositorio codifica parte de esta configuración: `tc8192` (características del transcoder), `decb` (sesgo de decodificación), `l1w0.001` (peso L1), `tarbb_lb2.0` y `ln1`.

La función de pérdida es de tipo KL (`loss type: kl`) con `lambda_adapt: 1.0`, `lambda_bridge: 2.0`, `lambda_nmse: 1` y `n_cutoffs: 1`. El entrenamiento usó una tasa de aprendizaje de 0,0008, tamano de lote 1, una sola época y una proporción de warmup de 0,05. Los datos de entrenamiento declarados son science-of-finetuning/fineweb-1m-sample y siddharthmb/2026.transcoder-adapters.lmsys-chat-1m-splits. No se especifica el número total de tokens procesados ni detalles de composición más allá de esos dos dataset.

El modo de carga documentado por el autor permite obtener el modelo híbrido (MLP del modelo base junto con la atención y los embeddings del modelo de referencia) desactivando los transcoders mediante `set_transcoders_enabled(False)`. El repositorio incluye también utilidades para chatear con el modelo y para dirigir una característica concreta mediante `--steer CANTOR_ID:STRENGTH`, así como un módulo de construcción de grafos de atribución que admite flags de prompt, GemmaScope y presupuesto.

## Capacidades

- Carga de un modelo híbrido que combina las MLP del gemma-4-E2B base con la atención y los embeddings del gemma-4-E2B-it de referencia.
- Desactivación selectiva de los transcoders (`set_transcoders_enabled(False)`) para obtener el comportamiento híbrido sin la rama adaptada.
- Dirección de características individuales mediante identificadores de característica (cantor id) y una intensidad de steering configurable.
- Generación de grafos de atribución sobre el adaptador, con soporte de GemmaScope y control de presupuesto.
- Interfaz de chat por linea de comandos para interactuar con el checkpoint.
- Análisis de representaciones dispersas: 8192 características por transcoder con sesgo de decodificación.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito en la información disponible.
- No se documentan idiomas soportados ni capacidades multilingües específicas más allá de las del modelo base subyacente.

## Casos de uso

- Investigación en interpretabilidad mecanicista: cargar el adaptador y generar grafos de atribución para trazar qué características del transcoder contribuyen a una predicción concreta, usando el módulo `analysis.attribution.graphs.build_graphs` con las flags de prompt y presupuesto.
- Steering de características para estudiar causalidad: usar `--steer CANTOR_ID:STRENGTH` para amplificar o atenuar una característica y observar el efecto sobre la salida, lo que permite validar hipótesis sobre qué codifica cada dirección.
- Análisis comparativo base frente a instruct: aprovechar la condición híbrida (`set_transcoders_enabled(False)`) para contrastar el comportamiento de las MLP del modelo base con la atención y embeddings del modelo de referencia, y medir qué aporta cada componente.
- Adaptación dispersa como objeto de estudio: evaluar la configuración concreta (8192 características, L1 0,001, sesgo de decodificación) como punto de referencia en experimentos sobre eficiencia y reconstrucción de activaciones.
- Auditoría de seguridad y sesgos a nivel de característica: identificar características asociadas a contenido sensible y estudiar su activación ante distintos prompts, con fines de diagnóstico en investigación.
- Docencia y reproducción de experimentos: el repositorio incluye un `training-config.yaml` y una CLI de chat, lo que facilita reproducir el ajuste y demostrar el flujo completo de entrenamiento de transcoders en un entorno controlado.
- Desarrollo de metodología de evaluación interna: usar la loss KL y el esquema de pesos (adapt, bridge, nmse) como base para diseñar métricas propias de fidelidad entre un adaptador y su modelo de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio pesa 11,1 GB y contiene 5.509.713.699 parametros, lo que es compatible con pesos en precision de 16 bits (aproximadamente 11 GB) y requeriria del orden de 22 GB en precision de 32 bits.
- Para inferencia en 16 bits, una GPU con 24 GB de VRAM (por ejemplo, RTX 4090) es suficiente para alojar los pesos; hay que sumar el espacio de activaciones y del bucle de decodificacion, por lo que el margen depende de la longitud de secuencia.
- GPU profesionales como A100, H100 o L40S cubren el modelo con holgura y permiten lotes mayores o secuencias más largas.
- No cabe en GPUs de gama consumer con menos de 16 GB de VRAM sin cuantizacion; no se documentan recetas de cuantizacion para este checkpoint.
- Despliegue: la carga documentada usa las clases propias del proyecto (`models.auto.load_transcoder_model` con `device_map="auto"`), no las clases automaticas estandar de transformers. El uso de servidores de inferencia genericos como vLLM, TGI, llama.cpp u Ollama no esta documentado y no puede asumirse sin adaptar el codigo.
- La etiqueta `endpoints_compatible` aparece en los tags del repositorio, pero no se detalla ninguna configuracion de despliegue en la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (transcoder adapter) | 5.509.713.699 | no disponible | Adaptador de transcoders sparse sobre gemma-4-E2B | no disponible | HuggingFace, 8 descargas |
| google/gemma-4-E2B | no disponible | no disponible | Modelo base | no disponible | no disponible en la informacion facilitada |
| google/gemma-4-E2B-it | no disponible | no disponible | Modelo de referencia (instruct) | no disponible | no disponible en la informacion facilitada |
| Adaptador LoRA equivalente | no disponible | no disponible | Adaptador de bajo rango | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de la familia gemma-4-E2B en la informacion proporcionada, por lo que la comparativa se limita a categoria y disponibilidad.

## Limitaciones y advertencias

- La licencia no esta declarada en la informacion disponible, por lo que no puede asumirse uso comercial sin verificar la licencia del modelo base y del adaptador.
- Es un artefacto de investigacion con 8 descargas y 0 likes; no hay evidencia de validacion por terceros ni de uso en produccion.
- No se publican resultados de benchmarks, evaluaciones de fidelidad ni comparaciones cuantitativas con alternativas.
- No se declaran idiomas soportados; el comportamiento multilingue depende enteramente del modelo base, no documentado aqui.
- No se declara longitud de contexto; no debe asumirse ninguna ventana concreta.
- Riesgo de alucinacion: no evaluado ni documentado en la informacion disponible.
- Sesgos conocidos: no documentados. La composicion de los datasets de entrenamiento (fineweb-1m-sample y las divisiones de lmsys-chat-1m) puede introducir sesgos, pero no se aporta analisis.
- Requiere codigo propio del repositorio GitHub del autor; no es cargable con `AutoModelForCausalLM` estandar, lo que dificulta su integracion en pipelines convencionales.
- La reproducibilidad depende de la disponibilidad de google/gemma-4-E2B y google/gemma-4-E2B-it, cuyas condiciones de acceso no se detallan.
- Las herramientas de steering y grafos de atribucion estan pensadas para analisis; manipular caracteristicas puede producir salidas degeneradas o poco fiables.
- La busqueda web realizada no devolvio resultados relacionados con el modelo: los enlaces recuperados tratan sobre Bjorn Borg y la marca Fila, por lo que no aportan informacion tecnica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/siddharthmb/2026.TA.gemma4_2b_full_20k_gemma4_2b_full_20k_tc8192_decb_l1w0.001_tarbb_lb2.0_ln1_sl15298070
- Modelo base: https://huggingface.co/google/gemma-4-E2B
- Modelo de referencia: https://huggingface.co/google/gemma-4-E2B-it
- Tokenizer: https://huggingface.co/google/gemma-4-E2B-it
- Repositorio de codigo: https://github.com/Sid-MB/transcoder-adapters
- Dataset de entrenamiento (fineweb): https://huggingface.co/datasets/science-of-finetuning/fineweb-1m-sample
- Dataset de entrenamiento (lmsys-chat-1m-splits): https://huggingface.co/datasets/siddharthmb/2026.transcoder-adapters.lmsys-chat-1m-splits
- Configuracion de entrenamiento: training-config.yaml (incluido en el repositorio del modelo)
- Enlaces relevantes de la busqueda web: no disponible (los resultados recuperados no guardan relacion con el modelo)
