# azukivc/Ornith-1.5-35B-A3B-Abliterated-GGUF

## Resumen

Ornith-1.5-35B-A3B-Abliterated-GGUF es un derivado no oficial del modelo multimodal Ornith-1.5-35B-A3B, desarrollado por Ornith AI, al que se le ha aplicado una técnica de "abliteración" para suprimir el comportamiento de rechazo aprendido durante el entrenamiento. El repositorio, publicado por el usuario azukivc y atribuido a PocketAI Model Lab, ofrece los pesos en formato GGUF listos para su uso con llama.cpp, tanto para tareas de texto como de visión (image-text-to-text). El modelo base es un mixture-of-experts (MoE) con aproximadamente 35 000 millones de parámetros totales y unos 3 000 millones activos por token, lo que lo hace eficiente para ejecución local en hardware de consumo.

La relevancia de esta versión radica en que permite probar un modelo de razonamiento y codificación de última generación con capacidades multimodales en entornos locales, pero con una advertencia crítica: la abliteración elimina los mecanismos de rechazo ante solicitudes dañinas, por lo que su uso conlleva riesgos de seguridad y éticos. El repositorio incluye cuantizaciones Q4_K_M, Q8_0 y BF16, junto con un proyector de visión en F16, y documenta el proceso de conversión y validación. No se incluye la cabeza de decodificación especulativa (MTP) del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) basada en Qwen 3.5 MoE, multimodal (vision-language) |
| Parametros totales | 34 660 610 688 (34,66 B) |
| Parametros activos | ~3 B (aproximado, segun el modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, Q8_0, BF16 (GGUF) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors para el modelo base original) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-35B-A3B es un MoE con 35 B de parametros totales y aproximadamente 3 B activos por token, disenado para tareas de razonamiento, codificacion y comprension multimodal. La arquitectura sigue el patron de Qwen 3.5 MoE, con un layout de expertos apilados (MLX stacked-expert layout) que el convertidor de llama.cpp soporta de forma nativa. El modelo original fue entrenado con datos de texto e imagenes, aunque no se dispone de detalles sobre el volumen de tokens ni el proceso de alineacion (RLHF/DPO) en la informacion proporcionada.

La version abliterated aplica una edicion de la direccion de rechazo (refusal direction) medida en la capa 27 y proyectada a las capas 15-39 con escala 1.0 y preservacion de norma por columna. Se modificaron 75 tensores fisicos y 6 450 rutas de expertos/proyeccion. Esta intervencion no altera los pesos de vision, por lo que el proyector de imagen se mantiene identico al del modelo base. El proceso de conversion a GGUF se realizo con una revision especifica de llama.cpp, evitando la doble aplicacion del offset de RMSNorm de Qwen 3.5. No se incluye la cabeza MTP (multi-token prediction) para decodificacion especulativa.

## Capacidades

- Generacion de texto y razonamiento: el modelo base esta optimizado para tareas de razonamiento complejo y codificacion, segun la informacion publica.
- Comprension multimodal: acepta entradas de imagen y texto (image-text-to-text), permitiendo describir imagenes, responder preguntas visuales y analizar documentos con figuras.
- Codificacion: el modelo base destaca en generacion y depuracion de codigo, aunque no se aportan benchmarks especificos en este repositorio.
- Soporte de tool calling / function calling: no se menciona explicitamente en la informacion disponible; se desconoce si el modelo base lo soporta.
- Soporte de agentes y multi-step reasoning: no se documenta en este repositorio, aunque el modelo base podria tener capacidades de razonamiento encadenado.
- Capacidades multilingues: solo ingles (segun la etiqueta de idioma).
- Modo thinking: las pruebas de comportamiento del repositorio mencionan "thinking disabled", lo que sugiere que el modelo base tiene un modo de pensamiento, pero no se detalla su activacion en esta version.

## Casos de uso

- Analisis de documentos con imagenes: el modelo puede procesar capturas de pantalla, diagramas o fotografias junto con texto para extraer informacion o responder preguntas sobre el contenido visual. Es adecuado para tareas de investigacion o soporte tecnico donde se combinan imagenes y texto.
- Generacion de codigo asistida por contexto visual: un desarrollador puede proporcionar una captura de pantalla de un error o de una interfaz y pedir al modelo que genere o corrija codigo relacionado, aprovechando la entrada multimodal.
- Razonamiento sobre datos cientificos: en entornos de investigacion, el modelo puede analizar graficos o figuras de articulos y explicar sus implicaciones, siempre que se le proporcione el contexto textual adecuado.
- Asistencia en educacion tecnica: para crear explicaciones de conceptos de programacion o matematicas usando imagenes de diagramas o formulas, el modelo puede generar respuestas detalladas.
- Prototipado rapido de aplicaciones de vision por lenguaje: al ser un MoE eficiente, puede integrarse en pipelines locales de procesamiento de imagenes y texto sin requerir infraestructura en la nube.
- Experimentacion en investigacion de seguridad: dado que es una version abliterated, puede usarse en estudios controlados sobre comportamientos de rechazo y alineacion, siempre con las debidas salvaguardas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye una pantalla de comportamiento (behavior screen) con 100 prompts dañinos y 100 benignos, donde la variante Q4_K_M mostro 3/100 banderas de rechazo dañino y 0/100 en benignos, y Q8_0 mostro 1/100 y 0/100. Tambien se midio el drift de cuantizacion frente al BF16: Q8_0 tiene una KL media de 0,01359 nats y un acuerdo top-token del 96,26%, mientras que Q4_K_M tiene 0,07280 nats y 90,64%. Estos datos no son benchmarks de capacidad, sino de fidelidad de cuantizacion.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q4_K_M ocupa 19,71 GiB, por lo que cabe en una GPU con 24 GB de VRAM (por ejemplo, RTX 3090 o RTX 4090) si se usa `-ngl all`. La variante Q8_0 requiere unos 34,37 GiB, necesitando una GPU de 40 GB o mas (A100 40 GB, o dos GPUs en paralelo). El BF16 de referencia ocupa 64,61 GiB y requiere hardware de alta gama o multiples GPUs.
- GPU recomendadas: para Q4_K_M, una RTX 3090/4090 o similar; para Q8_0, una A100 40 GB o H100; para BF16, un nodo con multiples GPUs.
- Compatibilidad con GPU de consumo: si, la cuantizacion Q4_K_M es viable en GPUs de 24 GB, y tambien puede ejecutarse en CPU con llama.cpp, aunque con mayor latencia.
- Opciones de despliegue: llama.cpp (llama-cli para texto, llama-mtmd-cli para multimodal), compatible con servidores como llama-server y herramientas como Ollama si se convierte el GGUF.
- Latencia y throughput: no se proporcionan datos concretos. En un MoE con 3 B activos, la velocidad de generacion suele ser superior a la de un modelo denso del mismo tamano total, pero depende del hardware y de la cuantizacion.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa rigurosa con otros modelos de la misma categoria. El modelo base Ornith-1.5-35B-A3B es un MoE multimodal con 35 B totales y 3 B activos, similar en concepto a otros MoE como Qwen2.5-VL-32B o Mixtral 8x7B, pero no se tienen datos de rendimiento publicados para contrastar. Se recomienda consultar la documentacion del modelo base para obtener referencias de benchmarks.

## Limitaciones y advertencias

- La abliteracion suprime deliberadamente el comportamiento de rechazo aprendido. El modelo puede generar contenido dañino, ilegal, ofensivo, enganoso o incorrecto con mayor facilidad que el modelo de instruccion original. No es un entrenamiento de veracidad ni una mejora de capacidades.
- Solo soporta ingles; no se garantiza un rendimiento adecuado en otros idiomas.
- No se incluye la cabeza MTP, por lo que la decodificacion especulativa nativa del modelo base no esta disponible en esta version.
- La cuantizacion Q4_K_M presenta un drift mayor (90,64% de acuerdo top-token frente al BF16), lo que puede afectar a la precision en tareas de razonamiento complejo.
- El repositorio no proporciona benchmarks de capacidad (MMLU, HumanEval, etc.), por lo que no se puede evaluar su rendimiento relativo.
- La licencia MIT permite uso comercial, pero el usuario es responsable de cumplir las leyes y regulaciones aplicables, especialmente en contextos donde el contenido generado pueda ser perjudicial.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/azukivc/Ornith-1.5-35B-A3B-Abliterated-GGUF
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- GGUF del modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-GGUF
- Articulo sobre despliegue local: https://www.mindstudio.ai/blog/ornith-1-5-35b-a3b-local-run
- Ficha en interfaze.ai: https://interfaze.ai/models/ornith-aiornith-15-35b-a3b-gguf
- Ficha en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/ornith-1.5-35b-a3b-gguf-ornith-ai
