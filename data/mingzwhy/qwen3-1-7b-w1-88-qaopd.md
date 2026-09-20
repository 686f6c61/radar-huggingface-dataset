# MingZwhy/Qwen3-1.7B-W1.88-QAOPD

## Resumen

Qwen3-1.7B-W1.88-QAOPD es un checkpoint experimental publicado por el usuario MingZwhy que parte de Qwen/Qwen3-1.7B y lo comprime a **1,88 bits efectivos por peso** mediante una combinacion de cuantizacion de precision mixta y recuperacion de calidad por destilacion. El objetivo no es competir con el modelo original, sino explorar hasta donde se puede reducir el coste de memoria de un transformer de 1.720.574.976 parametros sin colapsar por completo sus capacidades. La cuantizacion viene "baked in": no hay que aplicar ninguna capa de post-procesado, se carga el checkpoint y se evalua directamente.

La innovacion principal es el pipeline QAOPD (quantization-aware + on-policy distillation): primero se cuantiza el modelo a un esquema mixto INT1.58/INT4 en bloques de 256 pesos (solo el 12,5 % de los bloques se mantienen a INT4, lo que da la media de 1,88 bits), y despues se recupera parte del rendimiento perdido mediante distillation consciente de la cuantizacion seguida de distillation on-policy. Las activaciones se mantienen en INT8 y la cache KV en 16 bits, lo que reduce el ahorro real respecto a los pesos pero preserva mejor la estabilidad numrica.

La relevancia es doble. Por un lado, demuestra que es viable ejecutar un modelo de ~1,7 B en entornos con menos de 1 GB dedicado a pesos, abriendo la puerta a inferencia en dispositivos muy limitados. Por otro, la tabla de resultados publicada muestra el coste real de esa compresion: caidas de mas de 24 puntos en GSM8K, 30 puntos en MATH-500 y 28 puntos en AMC23 frente al modelo BF16, con perdidas mas moderadas en codigo (MBPP -12,7; HumanEval -22,0). Es, por tanto, un artefacto de investigacion tanto como una herramienta de despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No detallada en la model card; heredada de Qwen/Qwen3-1.7B (transformer decoder-only denso), con `custom_code` para las capas cuantizadas |
| Parametros totales | 1.720.574.976 (~1,72 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | Pesos: mixto INT1.58 / INT4 en bloques de 256 (12,5 % de bloques a INT4, 1,88 bits efectivos). Embedding y cabeza de salida: INT4. Activaciones: INT8. Cache KV: 16 bits |
| Idiomas soportados | No disponible. La model card no declara idiomas; al derivar de Qwen3-1.7B podria heredar su cobertura multilingue, pero no hay confirmacion en la informacion proporcionada |
| Licencia | Apache-2.0 (heredada de Qwen3-1.7B) |
| Formato de pesos | safetensors, con codigo personalizado (`trust_remote_code=True`); repositorio de 3,5 GB |
| Pipeline | text-generation |
| Modelo base | Qwen/Qwen3-1.7B |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna mas alla de indicar que se trata de Qwen3-1.7B cuantizado; la unica modificacion estructural es la introduccion de capas con kernels de dequantizacion empaquetados como `custom_code`, lo que obliga a cargar el modelo con `trust_remote_code=True`. El esquema de compresion es de granularidad de bloque: grupos de 256 pesos comparten escala, y dentro de cada modelo solo el 12,5 % de los bloques se conservan en INT4 mientras el resto baja a INT1.58. Esa mezcla es la que produce la media ponderada de 1,88 bits por peso. Embedding y cabeza de salida, que son especialmente sensibles a la cuantizacion agresiva, se mantienen en INT4; las activaciones se cuantizan a INT8 y la cache KV permanece en 16 bits.

El entrenamiento de recuperacion consta de dos fases segun la propia descripcion: una distillation consciente de la cuantizacion (quantization-aware distillation) y, despues, una distillation on-policy. No se especifican en la informacion disponible el numero de tokens utilizados, la composicion del dataset, ni si hubo fases adicionales de RLHF o DPO. El codigo, el harness de evaluacion y la receta completa de entrenamiento se publican en el repositorio GitHub MingZwhy/QAOPD.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` y el pipeline `text-generation` confirman el uso previsto como modelo de chat/generacion.
- Razonamiento matematico basico: obtiene 44,05 en GSM8K 5-shot con strict-match, lo que indica capacidad funcional en problemas aritmeticos de varios pasos, aunque muy por debajo del modelo sin cuantizar.
- Generacion de codigo: 45,1 en HumanEval pass@1 greedy y 41,3 en MBPP, suficiente para autocompletado simple y borradores de funciones.
- Capacidad multilingue: no confirmada en la informacion proporcionada.
- Tool calling / function calling: no documentado en la model card.
- Soporte de agentes y razonamiento multi-paso: no documentado; los resultados en AMC23 (3,12 avg@16) sugieren una capacidad de razonamiento prolongado muy degradada.
- Modo thinking, vision o audio: no disponibles ni documentados.
- Compatibilidad con Text Generation Inference: el tag `text-generation-inference` y `endpoints_compatible` indican que el checkpoint esta preparado para desplegarse en TGI y en Inference Endpoints.

## Casos de uso

- Inferencia en dispositivos de borde con memoria muy limitada: con 1,88 bits por peso, los pesos ocupan aproximadamente 0,4 GB, lo que permite cargar el modelo en placas con poca RAM o en GPUs integradas donde un modelo BF16 de 1,7 B no cabria con holgura.
- Asistentes conversacionales offline: el tag `conversational` y la ventana reducida de memoria lo hacen apto para chatbots locales que no requieren conexion ni API externa, asumiendo respuestas mas cortas y menos fiables que el modelo base.
- Autocompletado de codigo en el IDE: los 45,1 puntos en HumanEval permiten sugerencias de linea o bloque en lenguajes comunes, integrables en un plugin local sin coste de servidor.
- Generacion de borradores y resumenes de baja criticidad: redaccion de textos preliminares que un humano revisa despues, donde la degradacion de calidad del checkpoint no es bloqueante.
- Investigacion en cuantizacion extrema: sirve como linea base reproducible para medir el impacto de esquemas sub-2 bits y de tecnicas de distillation consciente de la cuantizacion, con harness de evaluacion publicado.
- Destilacion y generacion de datos sinteticos a gran escala: al ser extremadamente barato de ejecutar, puede usarse para producir grandes volumenes de texto etiquetado o como teacher destilado en pipelines de datos, filtrando despues por calidad.
- Clasificacion ligera y preprocesado semantico: tareas de extraccion de entidades, etiquetado o enrutado de consultas donde se prioriza el coste por token sobre la precision absoluta.
- Despliegue en TGI o Inference Endpoints: gracias al tag `endpoints_compatible`, puede servirse como endpoint HTTP con batching, siempre que la infraestructura soporte el `custom_code` de los kernels de dequantizacion.

## Benchmarks y rendimiento

Resultados publicados en la model card. La comparacion es contra el mismo checkpoint sin cuantizar (Qwen3-1.7B en BF16), medidos con el mismo harness.

| Benchmark | Este modelo (W1.88) | Qwen3-1.7B BF16 | Diferencia |
|---|---:|---:|---:|
| GSM8K (5-shot, strict-match) | 44,05 | 68,76 | -24,71 |
| MATH-500 (4-shot) | 24,20 | 54,40 | -30,20 |
| AMC23 (avg@16) | 3,12 | 31,72 | -28,60 |
| MBPP (pass@1 greedy) | 41,3 | 54,0 | -12,7 |
| HumanEval (pass@1 greedy) | 45,1 | 67,1 | -22,0 |
| QA9 (media de nueve benchmarks con scoring de verosimilitud) | 47,90 | 54,54 | -6,64 |

Las metricas de QA9 corresponden a la media con pesos iguales de nueve benchmarks evaluados por verosimilitud. No se han publicado resultados adicionales (MMLU, MMLU-Pro, IFEval, etc.) en la informacion disponible, ni datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para pesos: aproximadamente 0,40 GB a 1,88 bits efectivos sobre 1,72 B de parametros. Hay que sumar el coste de los embeddings y la cabeza de salida en INT4, mas los metadatos de escalas por bloque. El repositorio completo ocupa 3,5 GB, aunque no todo es necesario en memoria en tiempo de inferencia.
- VRAM total estimada en inferencia: por debajo de 1-2 GB para lotes pequenos, considerando activaciones INT8 y cache KV en 16 bits. Cifra orientativa derivada del esquema de cuantizacion, no medida experimentalmente.
- GPU recomendadas: no hay una recomendacion oficial. Por tamano, cualquier GPU consumer moderna es suficiente: RTX 3060, RTX 4060, RTX 4090, e incluso GPUs integradas con 8 GB de memoria compartida.
- Cabe en GPU consumer: si, con amplio margen. Es probable que tambien funcione en CPU con suficiente RAM, aunque no esta documentado.
- Opciones de despliegue: Transformers con `trust_remote_code=True` es la via documentada. El tag `text-generation-inference` sugiere compatibilidad con TGI. No hay confirmacion de soporte en llama.cpp, Ollama o vLLM, y la presencia de `custom_code` para los kernels de dequantizacion hace poco probable que funcione sin adaptaciones en runtimes genericos.
- Latencia y throughput: no disponibles. El rendimiento real dependera de si los kernels personalizados de dequantizacion estan optimizados para la GPU objetivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K | HumanEval | Licencia | Disponibilidad |
|---|---:|---|---:|---:|---|---|
| Qwen3-1.7B-W1.88-QAOPD | 1,72 B | no disponible | 44,05 | 45,1 | Apache-2.0 | HuggingFace |
| Qwen3-1.7B (BF16) | 1,72 B | no disponible en la informacion proporcionada | 68,76 | 67,1 | Apache-2.0 | HuggingFace |
| Otras alternativas de ~1-2 B cuantizadas a 2 bits | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion con datos verificables es contra el modelo base sin cuantizar. No se dispone en la informacion proporcionada de resultados de otros checkpoints de tamano similar (por ejemplo variantes de Llama 3.2 1B o Qwen2.5 1.5B) medidos con el mismo harness, por lo que cualquier comparacion adicional seria especulativa.

## Limitaciones y advertencias

- Degradacion severa del razonamiento: la caida de 3,12 puntos en AMC23 (frente a 31,72 del BF16) indica que el modelo practicamente no puede resolver problemas de razonamiento matematico competitivo. La perdida relativa es del orden del 90 % en esa tarea.
- Caida importante en matematicas y codigo: MATH-500 pierde mas de 30 puntos absolutos y HumanEval 22. No es adecuado para tareas donde la correccion sea critica sin supervision humana.
- Riesgo de alucinacion elevado: al reducirse la fidelidad de los pesos, la probabilidad de generar contenido plausible pero incorrecto aumenta respecto al modelo original. No se han publicado evaluaciones de factualidad ni de tasas de alucinacion.
- Sesgos: no se ha publicado ningun analisis de sesgos para este checkpoint. Al derivar de Qwen3-1.7B, hereda potencialmente los sesgos del modelo base y de sus datos de entrenamiento.
- Idioma: no se declaran idiomas soportados. El comportamiento fuera del ingles (idioma predominante en los benchmarks publicados) es desconocido y podria estar mas degradado que en el modelo base.
- Longitud de contexto: no declarada. No se puede asumir que la ventana del modelo base se preserve intacta tras la cuantizacion.
- Dependencia de codigo personalizado: requiere `trust_remote_code=True`, lo que implica ejecutar codigo del autor del repositorio. Es un riesgo de seguridad en entornos de produccion y complica la auditoria.
- Soporte de ecosistema limitado: no hay evidencia de compatibilidad con llama.cpp, Ollama o vLLM. El despliegue en TGI no esta verificado mas alla del tag informativo.
- Licencia: Apache-2.0 permite uso comercial, pero el modelo deriva de Qwen3-1.7B y conviene revisar igualmente los terminos de dicho modelo base.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y la model card es escueta en cuanto a receta de entrenamiento y datos. No hay garantia de mantenimiento.
- Sin datos de rendimiento real: no se publican latencias, throughput ni consumo energetico, datos imprescindibles para dimensionar un despliegue en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MingZwhy/Qwen3-1.7B-W1.88-QAOPD
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio de codigo y receta de entrenamiento: https://github.com/MingZwhy/QAOPD
- Harness de evaluacion: https://github.com/MingZwhy/QAOPD/blob/main/docs/EVALUATION.md

Nota: la busqueda web realizada no devolvio enlaces relevantes sobre este modelo; los resultados obtenidos correspondian a servicios de streaming ajenos al contenido. No se dispone, por tanto, de papers, blogs o demos adicionales que referenciar.
