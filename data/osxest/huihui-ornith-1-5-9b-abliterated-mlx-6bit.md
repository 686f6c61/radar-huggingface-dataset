# osxest/Huihui-Ornith-1.5-9B-abliterated-mlx-6Bit

## Resumen

Ornith-1.5-9B es un modelo de lenguaje denso de aproximadamente 9 000 millones de parámetros desarrollado por DeepReinforce, la startup de investigación detrás de la familia Ornith. Este modelo concreto, `osxest/Huihui-Ornith-1.5-9B-abliterated-mlx-6Bit`, es una conversión al formato MLX (optimizado para Apple Silicon) de la versión "abliterated" publicada por huihui-ai, que elimina los mecanismos de rechazo y censura del modelo original. Se basa en la arquitectura Qwen3 y es un modelo multimodal de visión y lenguaje, capaz de procesar tanto texto como imágenes.

La relevancia de este modelo radica en su doble vertiente: por un lado, hereda las capacidades de razonamiento, codificación y ejecución de tareas agénticas de Ornith-1.5, que según sus creadores rinde a la par de Claude Opus 4.8 en dichas áreas; por otro, la versión abliterated ofrece una salida sin restricciones de seguridad, lo que lo hace atractivo para investigación y aplicaciones donde se requiere una generación sin filtros. La conversión a MLX con cuantización de 6 bits permite ejecutarlo en hardware de consumo, como MacBooks con 16 GB de RAM unificada o GPUs con 8 GB de VRAM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso basado en Qwen3, multimodal (vision-lenguaje) |
| Parametros totales | ~9B (segun documentacion del autor; el archivo safetensors del repo MLX muestra 1.959.473.664, posiblemente un archivo parcial) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | MLX 6-bit (esta conversion); el modelo original dispone de bf16, GGUF y otras cuantizaciones |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | MLX (safetensors en formato MLX) |

## Arquitectura y entrenamiento

Ornith-1.5-9B es un modelo denso de aproximadamente 9 000 millones de parámetros, construido sobre la arquitectura de Qwen3. A diferencia de sus hermanos mayores (Ornith-1.5-35B y Ornith-1.5-397B, este ultimo de tipo MoE), la variante de 9B es un modelo denso clasico, lo que facilita su despliegue en hardware modesto. Es un modelo multimodal que acepta entradas de texto e imagen, siguiendo el diseño de los modelos vision-language modernos.

El entrenamiento de Ornith-1.5 se basa en un marco de "self-improvement" (auto-mejora) que extiende el concepto de "self-scaffolding" introducido en Ornith-1.0. El modelo propone nuevas tareas, genera andamiajes especificos para cada tarea y produce rollouts de soluciones, cerrando un bucle de mejora continua. La version abliterated, por su parte, se obtiene mediante una tecnica de "abliteracion" que elimina selectivamente las direcciones de los pesos responsables de los comportamientos de rechazo, sin reentrenar el modelo. La conversion a MLX se realizo con mlx-lm version 0.31.2, manteniendo la arquitectura original.

## Capacidades

- Generacion de texto y razonamiento: capaz de mantener conversaciones coherentes y resolver problemas de logica y razonamiento multi-paso.
- Codificacion: soporta generacion de codigo en multiples lenguajes, con capacidad de seguir instrucciones complejas de programacion.
- Vision y lenguaje: procesa imagenes junto con texto, permitiendo descripcion de imagenes, respuesta a preguntas visuales y razonamiento multimodal.
- Tool calling y function calling: hereda las capacidades de Qwen3 para invocar herramientas externas y APIs.
- Tareas ageneticas: puede ejecutar flujos de trabajo multi-paso, planificar acciones y utilizar herramientas de forma autonoma.
- Capacidad multilingue: no se han publicado datos especificos, pero al estar basado en Qwen3, es probable que soporte multiples idiomas.
- Sin censura (abliterated): no aplica mecanismos de rechazo a peticiones controvertidas o sensibles, lo que permite una generacion sin filtros.

## Casos de uso

- Investigacion en seguridad y alineacion: el modelo abliterated permite estudiar el comportamiento de los LLM sin restricciones de seguridad, analizando sesgos, riesgos de contenido toxico y mecanismos de alineacion.
- Generacion de codigo en entornos de desarrollo: gracias a su capacidad de tool calling y razonamiento, puede integrarse en IDEs o pipelines de CI/CD para autocompletar, revisar y generar codigo, aunque su naturaleza sin censura requiere supervision.
- Asistentes de vision artificial: al ser multimodal, puede utilizarse para tareas de captioning de imagenes, respuesta a preguntas visuales o analisis de documentos escaneados en aplicaciones de investigacion.
- Prototipado rapido de agentes conversacionales: su licencia MIT y su tamaño compacto permiten desplegarlo en local para experimentar con agentes que requieren interaccion multi-turno y uso de herramientas.
- Analisis de contenido creativo: la ausencia de filtros lo hace util para generar narrativas, dialogos o guiones en contextos donde los modelos censurados resultan limitantes, como escritura de ficcion adulta o exploracion de temas tabu.
- Educacion y demostraciones de tecnicas de abliteracion: sirve como ejemplo practico para entender como se modifican los pesos de un modelo para eliminar comportamientos de rechazo, util en cursos de IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La web de Ornith AI afirma que la familia Ornith-1.5 rinde a la par de Claude Opus 4.8 en tareas de razonamiento, codificacion y ageneticas, pero no se proporcionan cifras concretas para la variante de 9B. Tampoco hay datos comparativos con otros modelos de tamano similar en la documentacion consultada.

## Requisitos de hardware

- VRAM estimada: el modelo en bf16 ocupa aproximadamente 19 GB, por lo que en cuantizacion 6-bit (esta conversion) reduce el peso a unos 7 GB, permitiendo su ejecucion en GPUs con 8 GB de VRAM o MacBooks con 16 GB de RAM unificada.
- GPUs recomendadas: NVIDIA RTX 3060/4060 (8 GB), RTX 4070/4080 (12-16 GB), o GPUs de datacenter como A100/H100 para inferencia en bf16 sin cuantizar.
- Compatibilidad con hardware de consumo: si, cabe en GPUs de gama media con 8 GB de VRAM y en Macs con chip M1/M2/M3 y 16 GB de RAM.
- Opciones de despliegue: al ser formato MLX, se usa con `mlx-lm` (pip install mlx-lm). Para el modelo original en otros formatos, se puede usar vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no se han publicado datos especificos. En un MacBook M2 con 16 GB, se espera una generacion de 10-20 tokens por segundo con cuantizacion 6-bit, aunque esto es una estimacion orientativa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| Ornith-1.5-9B (este) | ~9B | No disponible | Si (vision) | MIT | MLX, GGUF, bf16 |
| Qwen3-8B | 8B | 32K (nativo) | No (solo texto) | Apache 2.0 | Safetensors, GGUF |
| Llama-3.1-8B | 8B | 128K | No | Llama 3.1 | Safetensors, GGUF |
| Gemma-2-9B | 9B | 8K | No | Gemma | Safetensors, GGUF |

La comparativa se basa en modelos de tamano similar. Ornith-1.5-9B destaca por ser multimodal y por su licencia MIT, pero carece de datos publicos de contexto y benchmarks. Qwen3-8B es su pariente arquitectonico mas cercano, aunque sin soporte de vision. Llama-3.1-8B ofrece un contexto mucho mayor (128K) pero no es multimodal. Gemma-2-9B es una alternativa solida de Google con licencia permisiva.

## Limitaciones y advertencias

- Contenido sin filtrar: al ser abliterated, el modelo puede generar contenido ofensivo, ilegal, peligroso o sexualmente explicito sin restricciones. No es apto para aplicaciones orientadas al publico general sin una capa de moderacion externa.
- Riesgo de alucinacion: como cualquier LLM, puede inventar hechos, citas o codigo incorrecto, especialmente en tareas de razonamiento complejo o con entradas ambiguas.
- Sesgos no mitigados: la abliteracion no elimina los sesgos sociales presentes en los datos de entrenamiento; de hecho, al eliminar los rechazos, estos sesgos pueden manifestarse con mayor libertad.
- Contexto no confirmado: no se ha publicado la longitud de contexto soportada, lo que dificulta planificar su uso en aplicaciones que requieran ventanas largas.
- Idiomas no documentados: no se especifican los idiomas soportados, aunque al derivar de Qwen3 es probable que cubra chino, ingles y otros, pero sin garantia.
- Formato MLX especifico: esta conversion solo es utilizable con la libreria mlx-lm en Apple Silicon. Para otros entornos, es necesario usar el modelo original en formato safetensors o GGUF.
- Discrepancia en parametros: el archivo safetensors del repo muestra 1.959.473.664 parametros, muy inferior a los ~9B declarados. Esto podria indicar una conversion incompleta o un archivo parcial; se recomienda verificar la integridad del modelo antes de usarlo en produccion.

## Enlaces

- Repositorio HuggingFace de este modelo: https://huggingface.co/osxest/Huihui-Ornith-1.5-9B-abliterated-mlx-6Bit
- Modelo base (huihui-ai): https://huggingface.co/huihui-ai/Huihui-Ornith-1.5-9B-abliterated
- Coleccion de modelos abliterated de huihui-ai: https://huggingface.co/collections/huihui-ai/ornith-10-abliterated
- Web oficial de Ornith AI: https://ornith.ai/
- Version MLX oficial de Ornith-1.5-9B: https://huggingface.co/ornith-ai/Ornith-1.5-9B-MLX-6bit
- Guia de ejecucion local de Ornith 1.5 9B: https://atomic.chat/blog/guides/how-to-run-ornith-1-5-locally
- Articulo sobre el lanzamiento de Ornith-1.5: https://officechai.com/ai/deepreinforce-releases-open-source-orinth-1-5-family-of-models-with-solid-benchmarks-and-mit-license/
