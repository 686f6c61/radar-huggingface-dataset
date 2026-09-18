# NoxNotreve/Ternary-Bonsai-2-27B-gguf

## Resumen

Bonsai 2 27B es un modelo de lenguaje de 27B de clase razonadora derivado de Qwen3.8-27B, publicado en formato GGUF con pesos ternarios (valores {-1, 0, +1}) en lugar de FP16. Lo desarrolla Prism ML y esta ficha corresponde a una publicacion GGUF del repositorio de NoxNotreve. El problema que resuelve es el coste de memoria: el modelo completo ocupa 5,95 GB (packing PTQ1_0) o 7,21 GB (PQ2_0) frente a los aproximadamente 54 GB de la version FP16, es decir, una reduccion idealizada de 9,3 veces, manteniendo segun la model card el 98,2% de la inteligencia del modelo en precision completa (84,78 de media en 14 benchmarks en modo thinking).

La arquitectura no se modifica respecto al modelo base: transformer causal de atencion hibrida (aproximadamente 75% atencion lineal y 25% atencion completa), MLP SwiGLU, RoPE y RMSNorm, con 64 bloques en el backbone de lenguaje y una torre de vision opcional de 27 bloques. Mantiene la ventana de contexto de 262.000 tokens, que resulta practicable en dispositivo gracias al predominio de la atencion lineal.

Es relevante ahora porque demuestra que el regimen sub-4-bit puede conservar razonamiento, codigo y comportamiento agentico sin recurrir a "escapatorias" de alta precision: embeddings, proyecciones de atencion, proyecciones MLP y LM head son ternarios de extremo a extremo, a 1,72 bits por peso reales. La model card reporta unos 47 tok/s en un portatil con Apple M5 Max, y existe un companion nativo para Apple Silicon en MLX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal de atencion hibrida (aproximadamente 75% lineal / 25% completa), MLP SwiGLU, RoPE, RMSNorm |
| Parametros totales | 27,36 mil millones segun la model card (24,35B backbone de 64 bloques + 2,54B embeddings/LM head + 0,46B torre de vision). Los safetensors del repositorio declaran 26.895.998.464 parametros (aproximadamente 26,9B) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 262.000 tokens |
| Tipos de cuantizacion | Ternaria g128 con escalas FP16 por grupo de 128 pesos; dos packings GGUF: PTQ1_0 (1,75 bits/peso, 5,95 GB) y PQ2_0 (2,13 bits/peso, 7,21 GB). Torre de vision en Q8_0 (mmproj, aproximadamente 0,63 GB) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp). Tamano del repositorio: 68,5 GB |
| Bits por peso reales | 1,72 (1,71 en el formato ternario + tensores residuales en mayor precision) |
| Modelo base | Qwen/Qwen3.8-27B (arquitectura sin cambios) |
| Backends soportados | llama.cpp con kernels ternarios propios para CUDA, Metal y CPU |
| Fecha de publicacion | 18 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3.8-27B, sin modificaciones: un transformer causal con atencion hibrida en el que aproximadamente el 75% de las capas usan atencion lineal y el 25% restante atencion completa, complementado con MLP SwiGLU, codificacion posicional RoPE y normalizacion RMSNorm. El modelo se compone de 64 bloques de lenguaje (24,35B parametros), 2,54B de embeddings y LM head, y una torre de vision opcional de 27 bloques y 0,46B parametros. La mezcla de atencion lineal es lo que hace viable la ventana de 262.000 tokens en hardware de consumo.

La innovacion tecnica esta en la representacion de pesos: cuantizacion ternaria g128, con cada peso en {-1, 0, +1} y un unico factor de escala FP16 compartido por cada grupo de 128 pesos. Un valor ternario transporta log2(3) aproximadamente 1,585 bits, lo que da un coste efectivo de almacenamiento de aproximadamente 1,71 bits/peso, y de 1,72 bits/peso contando los pocos tensores que se mantienen por encima de la representacion ternaria. Los pesos se almacenan en una base rotada: cada matriz se transforma por bloques con una rotacion ortogonal de Hadamard (bloque 1024, signos ±1 fijos) antes de la asignacion ternaria, y el runtime aplica la transformacion correspondiente a las activaciones. La rotacion va plegada en los pesos almacenados, por lo que no consume bits ni trafico adicional, y el fichero la declara como metadato: un runtime que no aplique la transformacion rechaza cargar el fichero. Los pesos empaquetados se consumen directamente, sin expandirse nunca de vuelta a FP16.

El proceso de cuantizacion no se detalla en la informacion disponible: no se especifica si fue post-entrenamiento o con ajuste posterior, ni el numero de tokens, la composicion del dataset o si hubo RLHF/DPO en el modelo base. La nomenclatura PTQ1_0 apunta a post-training quantization, pero la model card no lo confirma de forma explicita.

## Capacidades

- Generacion de texto y razonamiento en modo thinking, con una media de 84,78 en 14 benchmarks de este tipo segun la model card.
- Razonamiento matematico: 96,57 en la prueba de matematicas reportada, a medio punto de la precision completa.
- Generacion de codigo: 89,42, a nivel del baseline de referencia.
- Tool calling y comportamiento agentico: 74,92 en la evaluacion de tool calling agentico reportada.
- Soporte de conversacion multi-turno (etiqueta conversational en el repositorio).
- Procesamiento de imagenes mediante la torre de vision opcional, que se carga como paquete mmproj Q8_0 independiente solo cuando hay entrada de imagen.
- Contexto largo de hasta 262.000 tokens, apoyado en la atencion predominantemente lineal del backbone.
- Compatibilidad con endpoints (etiqueta endpoints_compatible).
- Capacidades multilingues: no disponible, la model card no detalla cobertura de idiomas.
- Capacidades de audio o de otro tipo: no disponibles.

## Casos de uso

- Asistente de razonamiento en portatil: con 5,95 GB de pesos y unos 47 tok/s en un Apple M5 Max, permite ejecutar un modelo de clase 27B en local sin GPU dedicada, util para analisis confidencial de documentacion.
- Analisis de repositorios y documentacion extensa: la ventana de 262.000 tokens permite cargar bases de codigo o expedientes completos y hacer preguntas sobre ellos sin trocear el contexto en recuperacion externa.
- Agente local con tool calling: el 74,92 en tool calling agentico y el contexto largo lo hacen apto para orquestar llamadas a funciones en flujos multi-paso ejecutados en la propia maquina, con los datos sin salir del equipo.
- Asistencia de codigo integrada en el IDE: con 89,42 en la prueba de codigo puede cubrir autocompletado, explicacion de funciones y generacion de pruebas dentro de un entorno local o de un pipeline de CI/CD.
- Tutoria y verificacion matematica: el 96,57 en matematicas lo hace util para resolver y explicar problemas paso a paso en herramientas educativas, con trazas de razonamiento visibles.
- Procesamiento de documentos con imagen: cargando la torre de vision opcional, puede extraer y razonar sobre capturas, formularios o diagramas junto al texto asociado.
- Despliegue en edge y equipos sin GPU: al ejecutarse en llama.cpp sobre CPU y Metal, encaja en estaciones de trabajo, portatiles y dispositivos Apple Silicon donde no hay acelerador dedicado.
- Procesamiento por lotes en una sola GPU: gracias al tamano reducido de los pesos, permite mantener varias instancias o un lote amplio en una unica GPU de gama media, con un coste de memoria muy inferior al del modelo en FP16.

## Benchmarks y rendimiento

Los datos siguientes proceden de la model card. Los nombres concretos de las suites de evaluacion no se especifican en la informacion disponible, por lo que no se pueden mapear directamente a MMLU, HumanEval o GSM8K.

| Prueba | Ternary Bonsai 2 27B | Referencia comparada |
|---|---|---|
| Media de 14 benchmarks en modo thinking | 84,78 | IQ2_XXS: 72,59; UD-Q4_K_XL: a menos de 0,4 puntos de diferencia |
| Matematicas | 96,57 | A medio punto de la precision completa |
| Codigo | 89,42 | A nivel del baseline |
| Tool calling agentico | 74,92 | No disponible |
| Inteligencia retenida frente a FP16 | 98,2% | FP16: 100% (referencia) |

## Requisitos de hardware

- Pesos del modelo de lenguaje: 5,95 GB en PTQ1_0 y 7,21 GB en PQ2_0. La cifra ideal declarada a 1,72 bits/peso es de 5,8 GB.
- Torre de vision opcional: aproximadamente 0,63 GB adicionales en Q8_0, solo si se procesan imagenes.
- Equivalente en FP16: aproximadamente 54 GB, referencia de la reduccion de 9,3 veces.
- VRAM estimada para inferencia: no disponible de forma explicita. Los pesos ocupan entre 5,95 y 7,21 GB, por lo que la VRAM necesaria es esa cifra mas la cache KV y los buffers del runtime, cuyo consumo no se cuantifica en la informacion disponible.
- GPU consumer: la model card afirma que el modelo cabe en un portatil estandar y en una unica GPU; el ejemplo medido es un Apple M5 Max con unos 47 tok/s. No se especifican modelos concretos de GPU NVIDIA ni el comportamiento en GPUs de 8 GB.
- GPU de centro de datos (A100, H100): no se documenta ningun resultado en la informacion disponible.
- Opciones de despliegue: llama.cpp en CUDA, Metal y CPU mediante el fork de Prism ML, que aporta los kernels ternarios de atencion hibrida. Existe un companion nativo para Apple Silicon en MLX (fork de MLX y fork de mlx-swift para iOS y macOS).
- Compatibilidad con vLLM, TGI u Ollama: no confirmada en la informacion disponible.
- Latencia y throughput: aproximadamente 47 tok/s en un Apple M5 Max. No hay datos de throughput en GPU.

## Comparativa con modelos similares

La informacion disponible solo permite comparar con otras representaciones del mismo modelo base y con el propio modelo en FP16. No se identifican modelos de terceros comparables en los datos proporcionados.

| Representacion | Bits/peso | Tamano | Media en 14 benchmarks thinking | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Bonsai 2 27B PTQ1_0 (ternaria) | 1,75 | 5,95 GB | 84,78 | Apache 2.0 | GGUF, llama.cpp con fork |
| Bonsai 2 27B PQ2_0 (ternaria) | 2,13 | 7,21 GB | No disponible por separado | Apache 2.0 | GGUF, llama.cpp con fork |
| Bonsai 2 27B en MLX 2-bit | No disponible | No disponible | No disponible | No disponible | MLX, Apple Silicon nativo |
| Build IQ2_XXS convencional | No disponible | Superior a 5,95 GB: la ternaria ocupa menos de dos tercios de su huella | 72,59 | No disponible | llama.cpp |
| Build UD-Q4_K_XL | No disponible | Aproximadamente el triple de huella que la ternaria | A menos de 0,4 puntos del ternario | No disponible | llama.cpp |
| Modelo base en FP16 | 16 | Aproximadamente 54 GB | 100% (referencia) | No disponible | No disponible |

## Limitaciones y advertencias

- El repositorio presenta 0 descargas y 0 likes en el momento de la consulta, por lo que no cuenta con validacion de la comunidad. Conviene contrastar los ficheros con la publicacion oficial de Prism ML antes de usarlos en produccion.
- Discrepancia de recuento de parametros: los safetensors del repositorio declaran 26.895.998.464 parametros, mientras que la model card indica 27,36 mil millones. No se explica la diferencia en la informacion disponible.
- Todos los resultados de benchmarks proceden de la model card del autor, sin verificacion independiente identificada.
- Los nombres de las suites de evaluacion no se especifican, lo que impide comparar los numeros directamente con referencias estandar como MMLU, HumanEval o GSM8K.
- Cobertura de idiomas no documentada: no se puede asumir un comportamiento multilingue equivalente al del modelo base.
- Requiere el fork de llama.cpp de Prism ML para los kernels ternarios. No se confirma compatibilidad con llama.cpp upstream, vLLM, TGI ni Ollama.
- Los pesos empaquetados se consumen directamente y no se expanden a FP16, por lo que no cabe esperar conversion sencilla a otros formatos o backends sin perder la representacion ternaria.
- La rotacion Hadamard esta declarada como metadato del fichero: un runtime que no aplique la transformacion correspondiente rechazara la carga.
- El procesamiento de imagenes exige cargar por separado el paquete mmproj Q8_0 de aproximadamente 0,63 GB.
- Al retener el 98,2% de la inteligencia del modelo FP16, existe una degradacion de aproximadamente 1,8 puntos porcentuales respecto a la referencia, cuya distribucion por tarea no se detalla en la informacion disponible.
- El coste de memoria de la cache KV en contextos cercanos a los 262.000 tokens no se cuantifica, y no se documenta la degradacion de calidad en contextos muy largos.
- La model card no especifica la licencia del modelo base Qwen3.8-27B; antes de un uso comercial conviene verificar que sus terminos son compatibles.
- Se trata de una cuantizacion de 2 bits: es previsible un mayor riesgo de alucinacion y de perdida de fidelidad en tareas no cubiertas por las evaluaciones publicadas, aunque la model card no aporta datos especificos al respecto.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/NoxNotreve/Ternary-Bonsai-2-27B-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Companion MLX 2-bit: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-mlx-2bit
- Web de Prism ML: https://prismml.com
- Whitepaper: https://github.com/PrismML-Eng/Bonsai-demo/blob/main/bonsai-2-27b-whitepaper.pdf
- Demo y ejemplos: https://github.com/PrismML-Eng/Bonsai-demo
- Fork de llama.cpp con kernels ternarios (CUDA y Metal): https://github.com/PrismML-Eng/llama.cpp
- Fork de MLX para Apple Silicon: https://github.com/PrismML-Eng/mlx
- Fork de mlx-swift para iOS y macOS: https://github.com/PrismML-Eng/mlx-swift
- Discord de la comunidad: https://discord.gg/prismml
- Nota sobre la busqueda web: los resultados devueltos corresponden a paginas de inicio y acceso de Facebook, sin relacion con el modelo, por lo que no aportan informacion adicional.
