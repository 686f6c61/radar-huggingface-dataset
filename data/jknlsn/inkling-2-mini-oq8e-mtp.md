# jknlsn/Inkling-2-Mini-oQ8e-mtp

## Resumen

Inkling-2-Mini-oQ8e-mtp es una cuantizacion del modelo multimodal thinkingmachines/Inkling-2-Mini, publicada por el usuario jknlsn. Se trata de un checkpoint de 26.388.646.400 parametros (26,39B) orientado a tareas image-text-to-text, convertido al formato MLX safetensors para su ejecucion en hardware Apple Silicon. La cuantizacion se ha realizado con la herramienta oQe (oMLX v0.8.4) mediante una estrategia de precision mixta enriquecida con matrices de importancia (imatrix), lo que permite reducir el peso del checkpoint a 18,8 GB en disco manteniendo un promedio efectivo de 5,619 bits por peso.

El modelo base pertenece a Thinking Machines y su arquitectura declarada es inkling2_loop, un diseno del que no se detallan mas especificaciones en la informacion disponible. La relevancia de esta publicacion radica en que hace accesible un modelo multimodal de 26B en equipos con memoria unificada de gama alta, algo que en BF16 requeriria del orden de 52 GB solo para los pesos. Ademas, incorpora soporte de multi-token prediction (MTP), una tecnica de decodificacion especulativa que puede aumentar el throughput de generacion.

La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales mas alla de las obligaciones de atribucion propias de dicha licencia. El pipeline declarado es image-text-to-text, por lo que el modelo acepta entradas de imagen y texto y genera texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | inkling2_loop (transformer multimodal, detalles no disponibles) |
| Parametros totales | 26.388.646.400 (26,39B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuantizacion mixta de 8 bits con imatrix: NVFP4 grupo 16, affine 8-bit grupo 64, MXFP8 grupo 32, BF16 y FP32; promedio efectivo 5,619 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX safetensors (formato MLX, libreria mlx) |

## Arquitectura y entrenamiento

La arquitectura del modelo base se identifica como inkling2_loop, un tipo de diseno del que la model card no ofrece detalles estructurales (numero de capas, dimension oculta, mecanismo de atencion ni si incorpora componentes recurrentes o hibridos). El pipeline image-text-to-text confirma que se trata de un modelo multimodal con codificador de vision y decodificador de lenguaje, pero no se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La innovacion tecnica destacable de esta publicacion es la cuantizacion mixta con imatrix de oQe, que asigna precision de forma no uniforme segun la importancia de cada tensor. Segun la tabla del autor, el 76,327% de los pesos logicos (20,384B) se almacenan en NVFP4 de 4,5 bits efectivos, el 15,265% (4,077B) en MXFP8 de 8,25 bits, el 5,887% (1,572B) en affine 8-bit de 8,5 bits, el 2,387% (0,637B) en BF16 y el 0,133% (0,036B) en FP32. Ademas, el checkpoint incluye soporte de multi-token prediction (MTP), lo que habilita decodificacion especulativa con cabezas auxiliares de prediccion.

## Capacidades

- Generacion de texto y conversacion multi-turno, segun el tag conversational.
- Comprension de imagenes y texto combinados (pipeline image-text-to-text).
- Razonamiento y generacion de lenguaje natural a partir de entradas multimodales.
- Decodificacion especulativa mediante multi-token prediction (MTP), que puede acelerar la generacion.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se declaran idiomas en la model card.
- Capacidades especiales adicionales (vision detallada, audio, thinking mode): no disponible.

## Casos de uso

- Descripcion automatica de imagenes en local: el modelo puede recibir una imagen y generar descripciones o resumenes textuales, ejecutandose en un Mac con memoria unificada suficiente gracias al checkpoint MLX de 18,8 GB.
- Asistente conversacional multimodal en escritorio: integrado en una aplicacion macOS mediante MLX, permite conversaciones multi-turno con contexto de imagenes sin depender de servicios en la nube.
- Extraccion de informacion de documentos escaneados: el pipeline image-text-to-text permite pasar capturas o fotos de formularios y obtener texto estructurado, util para prototipos de digitalizacion.
- Prototipado de accesibilidad: generacion de descripciones de imagenes para personas con discapacidad visual en entornos sin conectividad, aprovechando la ejecucion local.
- Evaluacion de modelos multimodales en investigacion: el checkpoint cuantizado sirve para comparar el impacto de la cuantizacion mixta frente al modelo base en tareas de vision-lenguaje.
- Pruebas de decodificacion especulativa: el soporte MTP permite medir ganancias de throughput en pipelines de generacion sobre MLX.
- Desarrollo de demos interactivas en Apple Silicon: al estar en formato MLX, se puede desplegar en cuadernos y aplicaciones nativas de macOS sin conversion adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el checkpoint ocupa 17,470 GiB de pesos en disco (18,8 GB de repositorio), por lo que se recomienda un minimo de 24 GB de memoria unificada y, para contexto largo y margen de trabajo, 32 GB o mas.
- GPU recomendadas: al ser un formato MLX, esta orientado a Apple Silicon (series M1, M2, M3 y M4, preferiblemente variantes Pro, Max y Ultra). No es un formato pensado para CUDA.
- Compatibilidad con GPU de consumo: si, en equipos Apple con memoria unificada de 24 GB o superior; en GPUs NVIDIA no es directamente utilizable sin conversion.
- Opciones de despliegue: libreria MLX y oMLX; no se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles; el soporte MTP podria mejorar el throughput, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-oQ8e-mtp | 26,39B | no disponible | MLX safetensors cuantizado mixto | Apache 2.0 | Cuantizacion con imatrix y MTP, orientada a Apple Silicon |
| thinkingmachines/Inkling-2-Mini | 26,39B (segun checkpoint derivado) | no disponible | no disponible | no disponible | Modelo base sin cuantizar; sirve de referencia de calidad |
| Alternativas de 26B multimodales | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de modelos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- La cuantizacion mixta a 5,619 bits/peso efectivos puede introducir degradacion de calidad respecto al modelo base en tareas sensibles, especialmente en razonamiento y generacion de codigo.
- No se dispone de informacion sobre sesgos del modelo base ni sobre su comportamiento en dominios sensibles.
- Riesgo de alucinacion inherente a los modelos generativos; no se aportan evaluaciones de fidelidad.
- No se declaran idiomas soportados, por lo que el rendimiento en castellano no esta verificado.
- La longitud de contexto no esta documentada, lo que impide planificar cargas con ventanas largas.
- El formato MLX limita el despliegue a ecosistema Apple; no es portable directamente a CUDA sin conversion.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base y de las herramientas de cuantizacion utilizadas antes de un uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria del checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jknlsn/Inkling-2-Mini-oQ8e-mtp
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Herramienta de cuantizacion oQe (oMLX): https://github.com/jundot/omlx
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
