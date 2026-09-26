# felkf/occamy-1.0-with-oQ6e-fp16-mtp

## Resumen

Occamy-1.0 es un modelo agéntico compacto desarrollado por Accio-Lab y orientado a «co-work»: tareas de larga duración y con estado persistente en las que el modelo debe coordinar búsqueda web, ejecución de código, llamadas a herramientas, manejo de ficheros y APIs estructuradas. Se construye a partir del checkpoint post-entrenado Qwen3.6-35B-A3B, por lo que conserva su arquitectura Mixture-of-Experts con 35 000 millones de parámetros totales y solo 3000 millones activos por token, una relación que mantiene viables las cargas de trabajo agénticas de ejecución prolongada.

El repositorio `felkf/occamy-1.0-with-oQ6e-fp16-mtp` no es la publicación oficial de Accio-Lab, sino una redistribución de la comunidad que etiqueta los pesos como «6-bit» e incorpora componentes en fp16 y una cabeza MTP (multi-token prediction), con un tamaño de repositorio de 31 GB y 35 951 822 704 parámetros reales en safetensors. El modelo base declara 262 144 tokens de contexto en la arquitectura y 131 072 tokens de longitud de secuencia durante el SFT, capacidades multimodales texto-imagen y licencia Apache 2.0.

Su relevancia actual reside en que combina un coste de inferencia propio de un modelo de 3B activos con un techo de capacidades de 35B totales, pensado para flujos profesionales multi-paso. La ficha oficial advierte, no obstante, que rinde mejor en cargas típicas de co-work que en tareas de recuperación intensiva o de usuario simulado, y que la interacción visual nativa con navegador o escritorio no forma parte de su interfaz de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts causal con encoder de vision |
| Parametros totales | 35 951 822 704 (aproximadamente 35B) |
| Parametros activos | 3B (8 expertos enrutados + 1 compartido de 256 por capa) |
| Longitud de contexto | 262 144 tokens (arquitectura base); 131 072 tokens de secuencia en SFT |
| Tipos de cuantizacion | Repositorio etiquetado como «6-bit» con componentes fp16 y cabeza MTP; la familia oficial ofrece GGUF (Q4_K_M, Q8_0), FP8 y NVFP4 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers); GGUF y MLX en la familia del modelo |
| Numero de capas | 40 |
| Numero de expertos | 256 |
| Checkpoint de partida | Qwen/Qwen3.6-35B-A3B |
| Post-entrenamiento | SFT de parametros completos, HDPO, model merging y SAO |
| Tamano del repositorio | 31,0 GB |

## Arquitectura y entrenamiento

El modelo es un transformer causal de tipo Mixture-of-Experts con 40 capas y 256 expertos por capa, de los cuales se activan 8 enrutados mas 1 compartido, lo que da 3B de parametros activos sobre 35B totales. Incluye un encoder de vision, de ahi su pipeline `image-text-to-text`. Occamy no modifica la arquitectura del checkpoint de partida Qwen3.6-35B-A3B: el post-entrenamiento se aplica sobre el backbone de lenguaje y tanto el encoder de vision como el proyector permanecen congelados durante el SFT. La configuracion publicada del checkpoint es la fuente de verdad para los limites de servicio.

El entrenamiento parte de Qwen3.6-35B-A3B ya post-entrenado y concentra el esfuerzo adicional en ejecucion fiable, seguimiento de estado persistente, recuperacion ante errores y finalizacion de tareas, en lugar de re-aprender capacidades generales. El pipeline declarado incluye SFT de parametros completos, HDPO, model merging y SAO; el SFT abarca trabajo agéntico general, interaccion de largo horizonte, ingenieria de software y fundamentacion de llamadas a herramientas. La infraestructura de aprendizaje por refuerzo multi-harness utilizada se publica como Dressage. La variante concreta de este repositorio anade una cabeza MTP experimental, que la ficha oficial describe como orientada a decodificacion especulativa.

## Capacidades

- Generacion de texto conversacional y seguimiento de instrucciones, con mejoras especificas declaradas en instruction following.
- Ejecucion agéntica de largo horizonte: mantiene coherencia a traves de llamadas a herramientas, ejecuciones delegadas y reescrituras de historial como la compactacion de contexto.
- Tool calling y function calling orientados a APIs estructuradas y software de productividad.
- Codificacion en terminal, con mejoras declaradas en tareas de ingenieria de software.
- Procesamiento de imagenes: al ser un modelo `image-text-to-text` con encoder de vision, acepta entradas imagen-texto.
- Contexto largo de hasta 262 144 tokens en la arquitectura base, adecuado para historiales extensos y documentos grandes.
- Capacidad multimodal limitada a imagen y texto; la interaccion visual nativa con navegador o escritorio no forma parte de la interfaz de entrenamiento de co-work.
- Modo thinking explicito: no disponible en la informacion proporcionada.
- Capacidades de audio: no disponibles.
- Idiomas soportados: no disponible.

## Casos de uso

- Agentes de larga duracion: el modelo esta disenado para tareas con estado persistente que se extienden durante muchos pasos, de modo que puede mantener un plan de trabajo a traves de decenas de llamadas a herramientas sin perder el hilo, apoyandose en su ventana de 262 144 tokens.
- Automatizacion de ingenieria de software: dado su entrenamiento en codificacion de terminal y tool calling, se puede integrar en pipelines de CI/CD para leer errores de build, editar ficheros, ejecutar tests y volver a iterar sobre el resultado.
- Orquestacion de herramientas y APIs empresariales: la fundamentacion de llamadas a herramientas permite conectarlo a CRMs, hojas de calculo o sistemas de tickets, generando payloads JSON validos y encadenando operaciones dependientes.
- Asistentes de trabajo con documentacion extensa: con contexto de 262 144 tokens puede cargar repositorios, informes o contratos completos y responder preguntas concretas sin trocear el material.
- Razonamiento multi-paso sobre ficheros y sistemas de ficheros: util para tareas de refactorizacion, migracion de datos o auditoria en las que el agente debe abrir, comparar y modificar recursos en disco.
- Sustitucion de trabajo repetitivo de back-office: clasificacion y enriquecimiento de registros, extraccion de datos de documentos escaneados combinando el encoder de vision con salida estructurada.
- Prototipado agéntico con coste contenido: al activar solo 3B de parametros por token, resulta adecuado para entornos de desarrollo donde se ejecutan muchos rollouts de agente y el coste por token es el factor limitante.
- Analisis de capturas o diagramas: la entrada imagen-texto permite interpretar diagramas de arquitectura, capturas de error o tablas escaneadas y convertirlos en texto accionable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card oficial incluye una seccion de resultados de evaluacion, pero el contenido proporcionado se corta antes de mostrar los valores, por lo que no se reproducen cifras.

## Requisitos de hardware

- Pesos en el repositorio (aproximadamente 6 bits): 31 GB de repositorio; se estima una huella de pesos en torno a 27-30 GB, con 32-40 GB de VRAM recomendados incluyendo overhead del runtime.
- FP16: se estiman unos 72 GB solo para pesos (35,95B x 2 bytes), lo que exige multiples GPU o un acelerador de 80 GB.
- Alternativas de cuantizacion de la familia: Q8_0 en torno a 36-38 GB y Q4_K_M en torno a 20-22 GB de pesos.
- GPU de centro de datos: H200 (validada por el autor para BF16, FP8 y NVFP4 en comprobaciones de compatibilidad con vLLM sobre una sola H200), H100 80 GB y A100 80 GB; con dos A100 40 GB o dos RTX 6000 Ada 48 GB se puede repartir una variante de 6 bits.
- GPU de consumo: una RTX 4090 de 24 GB no aloja los pesos de 6 bits completos; si puede ejecutar variantes GGUF Q4_K_M con posible offload parcial a RAM del sistema. Configuraciones de 48 GB (por ejemplo RTX 6000 Ada o dual 4090) son el minimo practico para 6 bits.
- Apple Silicon: existen builds MLX de la comunidad de 6 bits, sin datos de rendimiento disponibles.
- Opciones de despliegue: vLLM (comprobado por el autor con text, codigo, JSON, tool calls y seguimiento, e imagenes; NVFP4 mediante Marlin W4A16), transformers, llama.cpp y Ollama a traves de los GGUF, y MLX en la comunidad. Soporte en TGI, SGLang o TensorRT-LLM: no disponible.
- Cache KV a 262 144 tokens: no disponible; con ventanas completas de contexto el consumo de cache puede dominar el presupuesto de VRAM y conviene valorar cuantizacion de cache o troceado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Occamy-1.0 (este repositorio, 6 bits) | 35,95B / 3B | 262 144 tokens (arquitectura base) | Apache 2.0 | HuggingFace (redistribucion de comunidad, 0 descargas y 0 likes en el momento de la consulta) |
| Qwen3.6-35B-A3B (modelo base) | 35B / 3B | 262 144 tokens | no disponible en la informacion proporcionada | HuggingFace |
| Qwen3-30B-A3B (familia MoE previa de Qwen) | 30,5B / 3,3B | 32 768 tokens nativos, ampliable con YaRN | Apache 2.0 | HuggingFace |

Los datos de la fila de Qwen3-30B-A3B proceden de las especificaciones publicas de ese proyecto y no han sido verificados en la informacion proporcionada. No hay datos de benchmarks que permitan comparar rendimiento entre las tres opciones.

## Limitaciones y advertencias

- El repositorio analizado es una redistribucion de comunidad firmada por el usuario `felkf`, no la publicacion oficial de Accio-Lab; la model card heredada describe Occamy-1.0 y puede no reflejar exactamente el contenido de esta variante concreta de 6 bits.
- La cabeza MTP incluida se describe como experimental en la documentacion oficial, por lo que no deberia asumirse su estabilidad en produccion.
- La cuantizacion a 6 bits puede degradar la precision respecto a BF16, FP8 o NVFP4, especialmente en tareas de tool calling con esquemas JSON estrictos y en razonamiento de multiples pasos.
- Riesgo de alucinacion: inherente a los modelos generativos; en flujos agenticos puede traducirse en llamadas a herramientas con argumentos plausibles pero incorrectos, por lo que se recomienda validacion de esquemas y confirmacion humana en acciones irreversibles.
- Sesgos: no se documentan analisis de sesgo ni evaluaciones de seguridad en la informacion proporcionada.
- Idiomas soportados: no disponible; no hay confirmacion de cobertura multilingue ni de calidad fuera del ingles.
- La propia ficha oficial reconoce margen de mejora en tareas con mucha recuperacion de informacion y en tareas de usuario simulado.
- No hay soporte de interaccion visual nativa con navegador o escritorio; el encoder de vision no implica control de interfaz grafica.
- El modelo esta optimizado para cargas de co-work y no se presenta como sustituto de modelos frontera en todo tipo de tareas.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion con atribucion, sin clausulas de uso aceptable adicionales declaradas en la informacion disponible.
- Con 0 descargas y 0 likes registrados, no existen senales de validacion por parte de la comunidad sobre esta variante concreta.
- La ventana de 262 144 tokens no implica que la calidad se mantenga constante en toda su longitud; no hay evaluaciones publicadas de rendimiento por posicion en el contexto.

## Enlaces

- Repositorio analizado: https://huggingface.co/felkf/occamy-1.0-with-oQ6e-fp16-mtp
- Modelo oficial Occamy-1.0: https://huggingface.co/Accio-Lab/Occamy-1.0
- Sitio del proyecto: https://accio-lab.github.io/occamy/
- Informe tecnico: https://arxiv.org/pdf/2609.11977
- Framework de entrenamiento Dressage: https://github.com/Accio-Lab/Dressage
- Checkpoints GGUF (Q4_K_M / Q8_0): https://huggingface.co/Accio-Lab/occamy-1.0-GGUF
- Checkpoint FP8: https://huggingface.co/Accio-Lab/occamy-1.0-FP8
- Checkpoint NVFP4: https://huggingface.co/Accio-Lab/occamy-1.0-NVFP4
- Cabeza MTP experimental: https://huggingface.co/Accio-Lab/occamy-1.0-MTP
- Cuantizaciones GGUF de la comunidad: https://huggingface.co/mradermacher/occamy-1.0-i1-GGUF
- Build MLX para Apple Silicon: https://huggingface.co/leonsarmiento/Occamy-1.0-6bit-XL-mlx
- ModelScope: https://www.modelscope.cn/models/Accio-Lab/occamy-1.0
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
