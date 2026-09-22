# satellitedown/Huihui-Qwen3.8-27B-abliterated-NVFP4-NInfer-v3

## Resumen

El modelo `satellitedown/Huihui-Qwen3.8-27B-abliterated-NVFP4-NInfer-v3` es un contenedor de pesos ya cuantizados listo para ejecutar, publicado por el usuario satellitedown. Se trata de un reempaquetado del artefacto NVFP4 de Barding-Defense, que a su vez parte del modelo abliterado `huihui-ai/Huihui-Qwen3.8-27B-abliterated`. El resultado es un unico fichero de 21,5 GB que incluye los pesos de texto, de vision y de MTP (multi-token prediction), sin necesidad de conversion previa.

La relevancia de esta publicacion es practica: empaqueta un modelo multimodal de 27B en formato NVFP4 (punto flotante de 4 bits de NVIDIA) dentro del contenedor NInfer v3, pensado para ejecutarse en una unica GPU consumer Blackwell, en concreto una RTX 5090 de 32 GB, bajo Linux y con controladores compatibles con CUDA 13.4. Segun la model card, los bytes de los pesos son identicos a los del artefacto original; lo que cambia es el contenedor y el uso de la plantilla de chat Qwen3.8 mantenida por Cinference.

El pipeline declarado es `image-text-to-text`, lo que confirma que se trata de un modelo multimodal de entrada de imagen y texto. La licencia declarada es Apache 2.0. El modelo tiene una adopcion muy baja en el momento de la consulta (5 descargas, 0 likes) y no se han publicado resultados de benchmarks ni detalles de arquitectura o de datos de entrenamiento en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de la familia Qwen3.8, transformer multimodal; la model card no detalla la arquitectura) |
| Parametros totales | 27B (segun la denominacion del modelo base) |
| Parametros activos | no aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits, formato de NVIDIA para Blackwell) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | contenedor NInfer v3 (libreria `ninfer`); no se distribuye en safetensors ni GGUF segun la informacion disponible |
| Tamano del repositorio | 21,5 GB (fichero unico con pesos de texto, vision y MTP) |
| Modalidades | texto e imagen (pipeline `image-text-to-text`) |
| Requisitos de plataforma | Linux y controladores NVIDIA compatibles con CUDA 13.4 |
| Modelo base | huihui-ai/Huihui-Qwen3.8-27B-abliterated (relacion: cuantizado) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna ni sobre el proceso de entrenamiento en la documentacion proporcionada. Por la nomenclatura y por la etiqueta `image-text-to-text`, el modelo procede de la familia Qwen3.8 y es multimodal, con torre de vision ademas del decodificador de texto. El contenedor incluye explicitamente pesos de texto, de vision y de MTP (multi-token prediction), una tecnica de prediccion de varios tokens por paso que suele emplearse para acelerar la decodificacion o para alimentar esquemas de decodificacion especulativa.

En cuanto al entrenamiento, solo puede afirmarse lo que se deduce de la cadena de derivacion: el punto de partida es `huihui-ai/Huihui-Qwen3.8-27B-abliterated`, una variante "abliterated" del modelo original, es decir, con las direcciones de rechazo eliminadas mediante tecnicas de ablacion de direcciones en el espacio de activaciones. Sobre esa variante, Barding-Defense genero un artefacto NVFP4 para NInfer, y satellitedown lo ha reempaquetado en el contenedor v3 con la plantilla de chat mantenida por Cinference. No se documentan numero de tokens de entrenamiento, composicion del dataset, ni fases de RLHF o DPO. Los bytes de los pesos no han sido modificados respecto al artefacto de origen, por lo que no hay un reentrenamiento ni un ajuste adicional en este paso.

## Capacidades

- Generacion de texto multimodal: el pipeline declarado es `image-text-to-text`, por lo que acepta imagenes junto con texto de entrada.
- Procesamiento de vision: el contenedor incluye los pesos de la torre de vision, segun la model card.
- Prediccion multi-token (MTP): los pesos de MTP estan incluidos en el fichero, lo que habilita esquemas de decodificacion acelerada soportados por el runtime.
- Conversacion multi-turno: la model card indica que el contenedor usa la plantilla de chat Qwen3.8 mantenida por Cinference.
- Comportamiento sin rechazos: al derivar de un modelo abliterated, se espera que el modelo no aplique las negativas de seguridad tipicas del modelo original. Esto es una caracteristica del artefacto, no una capacidad verificada de forma independiente.
- Soporte de tool calling, function calling, agentes, razonamiento multi-paso, modo thinking, audio y cobertura multilingue: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local multimodal en una unica GPU consumer: el caso de uso principal declarado por el autor es ejecutar el modelo completo (texto y vision) en una RTX 5090 de 32 GB usando el instalador de Cinference, sin necesidad de convertir ni dividir los pesos.
- Analisis de documentos con imagenes en estaciones de trabajo aisladas: al ser un modelo image-text-to-text que cabe en una GPU de escritorio, permite procesar capturas, diagramas o documentos escaneados en entornos sin conexion, donde no es viable enviar datos a una API externa.
- Investigacion sobre alineamiento y seguridad: la variante abliterated es util para estudiar como se comporta un modelo cuando se eliminan las direcciones de rechazo, comparar con el modelo original y analizar la degradacion inducida por la ablacion.
- Evaluacion de cuantizacion NVFP4: el contenedor permite medir de forma directa la perdida de calidad y el ahorro de memoria de NVFP4 frente a los pesos sin cuantizar del modelo base, en hardware Blackwell.
- Prototipado de asistentes conversacionales con vision: la plantilla de chat Qwen3.8 incluida en el contenedor facilita montar un asistente multi-turno que recibe imagenes y texto, usando Cinference como runtime.
- Desarrollo de tecnicas de aceleracion con MTP: al incluir los pesos de multi-token prediction, sirve como banco de pruebas para implementar o comparar estrategias de decodificacion especulativa en el runtime NInfer.
- Reproducibilidad y auditoria de artefactos: el repositorio publica `provenance.json` y `SHA256SUMS`, lo que permite verificar que los pesos no han sido alterados respecto al artefacto de Barding-Defense, un escenario relevante en pipelines de validacion de modelos de terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y tampoco se proporcionan cifras de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: 21,5 GB de pesos, mas el espacio necesario para cache KV y buffers del runtime. El autor indica que el modelo esta pensado para una RTX 5090 de 32 GB, por lo que el margen para contexto y estados intermedios es de aproximadamente 10 GB.
- GPU compatibles: exclusivamente GPU Blackwell, dado que NVFP4 es un formato de punto flotante de 4 bits introducido por NVIDIA para esa generacion. El destino declarado es la RTX 5090. No hay soporte indicado para Ampere, Ada Lovelace, A100 ni H100.
- Cabe en GPU consumer: si, en RTX 5090 de 32 GB. En tarjetas de 24 GB como la RTX 4090 no cabe, tanto por falta de VRAM como por no disponer de soporte NVFP4.
- Sistema operativo y controladores: Linux con controladores NVIDIA compatibles con CUDA 13.4.
- Opciones de despliegue: runtime NInfer v3, lanzado mediante el instalador Cinference del repositorio `satellitedown/fast-long-context-cinference`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Relacion |
|---|---|---|---|---|---|
| satellitedown/Huihui-Qwen3.8-27B-abliterated-NVFP4-NInfer-v3 | 27B | NVFP4 | no disponible | apache-2.0 | Objeto de esta ficha; contenedor NInfer v3 |
| Barding-Defense/Qwen3.8-27B-huihui-abliterated-NVFP4-NInfer | 27B | NVFP4 | no disponible | no disponible | Artefacto de origen; bytes de pesos identicos |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated | 27B | no disponible | no disponible | no disponible | Modelo base sin el reempaquetado NVFP4 |
| Modelo original de la familia Qwen3.8-27B | 27B | no disponible | no disponible | no disponible | Ascendiente del que deriva la variante abliterated; no verificado en la informacion disponible |

La comparacion se limita a la cadena de derivacion, ya que no se dispone de datos de rendimiento, contexto ni idiomas para ninguno de los artefactos. La diferencia practica entre las tres primeras filas es el formato de distribucion y el contenedor, no los pesos.

## Limitaciones y advertencias

- Modelo abliterated: la ablacion de direcciones de rechazo elimina los mecanismos de negativa del modelo original. Es previsible que genere contenido que el modelo de partida rechazaria, lo que lo hace inadecuado para aplicaciones de cara al publico sin filtros adicionales.
- Sin benchmarks: no hay ninguna evaluacion publicada que cuantifique la degradacion de capacidades provocada por la ablacion ni por la cuantizacion NVFP4. Cualquier afirmacion sobre su calidad relativa carece de respaldo en la informacion disponible.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad factual para este artefacto.
- Restricciones de plataforma: requiere Linux, CUDA 13.4 y una GPU Blackwell. No es ejecutable en la mayoria del parque de GPUs actual, ni en CPUs.
- Formato propietario del runtime: los pesos van en un contenedor NInfer v3 que no es safetensors ni GGUF, lo que limita la portabilidad a otras herramientas de inferencia.
- Idiomas y contexto: no disponibles. No puede asumirse ninguna cobertura multilingue ni una ventana de contexto concreta sin verificacion.
- Adopcion muy baja: 5 descargas y 0 likes en el momento de la consulta, sin comunidad que haya validado el artefacto.
- Licencia: se declara Apache 2.0 en el repositorio, pero no se detallan los terminos del artefacto de origen ni del modelo base mas alla de lo indicado. Conviene revisar los ficheros `LICENSE` y `NOTICE` del repositorio antes de un uso comercial.
- Fecha de publicacion: el repositorio esta fechado en septiembre de 2026, con una diferencia de cinco minutos entre creacion y ultima actualizacion, lo que sugiere una publicacion automatizada sin mantenimiento posterior documentado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/satellitedown/Huihui-Qwen3.8-27B-abliterated-NVFP4-NInfer-v3
- Modelo base: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Artefacto NVFP4 de origen: https://huggingface.co/Barding-Defense/Qwen3.8-27B-huihui-abliterated-NVFP4-NInfer
- Repositorio del runtime Cinference: https://github.com/satellitedown/fast-long-context-cinference
- Ficheros de trazabilidad incluidos en el repositorio: `LICENSE`, `NOTICE`, `provenance.json`, `SHA256SUMS`
- Resultados de busqueda web: las consultas realizadas no devolvieron ningun resultado relevante sobre este modelo, su arquitectura o sus benchmarks. No se dispone de papers, blogs ni demos adicionales.
