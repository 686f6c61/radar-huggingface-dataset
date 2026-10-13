# scottlowry/Qwen3.8-Flash-Next-oQ8e-mtp

## Resumen

Qwen3.8-Flash-Next-oQ8e-mtp es una cuantizacion de terceros del modelo Qwen/Qwen3.8-Flash-Next, publicada por el usuario scottlowry en HuggingFace. No se trata de un modelo entrenado desde cero, sino de una conversion a 8 bits del modelo base realizada con la herramienta oQ (oMLX v0.7.1.dev1), que aplica cuantizacion de precision mixta y genera pesos en formato MLX safetensors. El objetivo es hacer viable la ejecucion del modelo base en hardware Apple Silicon con memoria unificada, reduciendo el peso de los pesos originales.

El modelo base Qwen3.8-Flash-Next es una arquitectura de mezcla de expertos (MoE) desarrollada por el equipo Qwen (Alibaba). Segun el repositorio oficial, combina un modelo principal de 125.000 millones de parametros con 51.000 millones de parametros adicionales en forma de embeddings N-gram, activando aproximadamente 6.000 millones de parametros por token. El conteo total reportado en los safetensors de esta cuantizacion es de 179.999.981.459 parametros, coherente con esa composicion.

La relevancia de esta ficha radica en que documenta una pieza poco habitual: una cuantizacion MoE de 180.000 millones de parametros orientada a MLX, no a CUDA. Esto la situa en un nicho muy concreto de despliegue local en Macs de gama alta con memoria unificada amplia. El repositorio tiene un volumen de 194,9 GB y contaba con 4 descargas y 0 likes en el momento de la consulta, por lo que se trata de un artefacto de uso minoritario y sin validacion comunitaria extensa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos); tipo declarado en la model card: qwen4_exp |
| Parametros totales | 179.999.981.459 (segun safetensors); 125.000 millones en el modelo principal + 51.000 millones en embeddings N-gram segun el repositorio del modelo base |
| Parametros activos | ~6.000 millones por token (dato del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits, precision mixta (oQ), group size 64. Existe una variante relacionada de 4 bits: scottlowry/Qwen3.8-Flash-Next-oQ4e-mtp |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es una mezcla de expertos con atencion tipo transformer, etiquetada internamente en la model card como qwen4_exp. El modelo base declara 125.000 millones de parametros en el cuerpo principal mas 51.000 millones de parametros en embeddings N-gram, con un regimen de activacion dispersa de aproximadamente 6.000 millones de parametros por token. Esa relacion entre parametros totales y activos es lo que permite que un modelo de 180.000 millones de parametros tenga un coste de inferencia por token comparable al de un modelo denso mucho mas pequeno.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens procesados, la composicion de los datos ni sobre si se aplicaron tecnicas de alineacion como RLHF, DPO o variantes de razonamiento con refuerzo. El repositorio del modelo base menciona que Qwen3.8-Flash-Next reduce el coste de entrenamiento e inferencia frente a Qwen3.7-Plus (aproximadamente 1/9 del coste de entrenamiento) manteniendo o mejorando capacidades en codigo, pero no se aportan cifras concretas de tokens ni detalles del pipeline.

En lo que respecta a esta ficha concreta, la contribucion tecnica es la cuantizacion: oQ (oMLX v0.7.1.dev1) aplica precision mixta a 8 bits con group size 64, lo que implica que distintos tensores o capas pueden recibir un tratamiento de precision distinto dentro del mismo esquema de 8 bits. No se documenta en la informacion disponible que se haya aplicado decodificacion especulativa, atencion lineal ni otras optimizaciones de inferencia mas alla del propio esquema de cuantizacion.

## Capacidades

- Generacion de texto y razonamiento general, heredados del modelo base Qwen3.8-Flash-Next. No hay evaluacion publicada especifica para esta cuantizacion.
- Codigo: el repositorio del modelo base afirma capacidades superiores en tareas de programacion frente a Qwen3.7-Plus, aunque sin cifras concretas en la informacion disponible.
- Capacidades multimodales (imagen y video): un despliegue de referencia del modelo base en un DGX Spark documenta entrada de imagen y video con la variable VISION=1. No se confirma que esta cuantizacion MLX conserve dichas capacidades de vision; no disponible.
- Soporte de tool calling y function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo de pensamiento (thinking mode): no confirmado para esta cuantizacion. La referencia de benchmark disponible corresponde a otro modelo (Qwen3.8-27B) y no es extrapolable.

## Casos de uso

- Despliegue local en estaciones de trabajo Apple Silicon de gama alta: el modelo esta empaquetado en MLX safetensors, por lo que su uso natural es la inferencia local en Macs con memoria unificada suficiente (a partir de 256 GB). Es adecuado para equipos que necesiten un MoE grande sin depender de GPU NVIDIA.
- Evaluacion comparativa de tecnicas de cuantizacion: al existir una variante de 4 bits del mismo autor, este modelo sirve para medir la perdida de calidad entre 8 y 4 bits sobre un mismo modelo base en tareas de codigo y razonamiento.
- Experimentacion academica con MoE de gran escala: investigadores que trabajen sobre enrutado de expertos o eficiencia de activacion pueden usar esta version para reproducir experimentos sin disponer de un cluster multi-GPU.
- Generacion de codigo en flujos internos de desarrollo: el modelo base esta orientado a tareas de programacion y su regimen de 6.000 millones de parametros activos reduce el coste por token frente a alternativas densas de tamano similar. Requiere validacion previa, ya que esta cuantizacion no tiene benchmarks publicados.
- Procesamiento por lotes de documentos largos: si el modelo base conserva su ventana de contexto completa tras la cuantizacion, seria apto para resumen y extraccion de informacion en lotes. La longitud de contexto de esta version no esta documentada, por lo que habria que verificarla experimentalmente.
- Prototipado de asistentes conversacionales con memoria unificada: al no consumir VRAM dedicada en el sentido tradicional, encaja en entornos de desarrollo donde se comparte memoria entre modelo y aplicacion.
- Servicio mediante API compatible con OpenAI: el despliegue de referencia del modelo base expone una API compatible con OpenAI, un patron replicable si se adapta a MLX. No se documenta para esta cuantizacion concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni similares, y el unico resultado de benchmark encontrado en la busqueda web corresponde a un modelo distinto (scottlowry/Qwen3.8-27B-oQ8e-mtp sobre M5 Max), por lo que no es trasladable a esta ficha.

## Requisitos de hardware

- Peso en disco: 194,9 GB (tamano del repositorio). Los pesos en 8 bits ocupan en torno a 180 GB, mas metadatos y posibles tensores adicionales.
- Memoria unificada necesaria: al menos 256 GB para cargar los pesos completos junto con el contexto y los estados de activacion. Un Mac Studio o Mac Pro con 256 GB o 512 GB de memoria unificada es el objetivo realista.
- GPU compatibles: no aplica en el sentido habitual. El formato MLX esta disenado para Apple Silicon (familias M1, M2, M3, M4 y sucesoras). No es cargable directamente en CUDA sin reconversion.
- Cabe en GPU de consumo: no. Ni una RTX 4090 (24 GB) ni una RTX 5090 podrian alojar los pesos completos. La variante de 4 bits del mismo autor rondaria los 90-100 GB, tambien fuera del alcance de GPUs de consumo individuales.
- Opciones de despliegue: MLX (libreria indicada en el repositorio) y el ecosistema oMLX. Para otras rutas (vLLM, llama.cpp, Ollama, TGI) seria necesario reconvertir los pesos, y no se documenta que exista dicha conversion.
- Latencia y throughput: no disponibles. No hay mediciones publicadas para esta cuantizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Parametros activos | Contexto | Cuantizacion | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| scottlowry/Qwen3.8-Flash-Next-oQ8e-mtp | 180.000 M | ~6.000 M | no disponible | 8 bits, group size 64 | MLX safetensors | no disponible | HuggingFace, 4 descargas |
| scottlowry/Qwen3.8-Flash-Next-oQ4e-mtp | no disponible | no disponible | no disponible | 4 bits | MLX safetensors | no disponible | HuggingFace |
| Qwen/Qwen3.8-Flash-Next (base) | 125.000 M + 51.000 M N-gram | ~6.000 M | no disponible | sin cuantizar | no disponible | no disponible en la informacion proporcionada | Repositorio oficial QwenLM |
| Qwen3.7-Plus | no disponible | no disponible | no disponible | sin cuantizar | no disponible | no disponible | Referenciado como generacion anterior |

No se dispone de datos de rendimiento comparativos entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay ninguna evaluacion publicada que mida la degradacion introducida por la cuantizacion a 8 bits con group size 64 sobre el modelo base. Cualquier despliegue en produccion deberia ir precedido de una evaluacion propia por tarea.
- Licencia no declarada en el repositorio: no se especifica que licencia aplica a esta cuantizacion. Esto bloquea cualquier uso comercial sin aclaracion previa con el autor y con el titular de los derechos del modelo base.
- Herencia de la licencia del modelo base: al ser un derivado, las condiciones de Qwen/Qwen3.8-Flash-Next aplican con toda probabilidad, pero no se detallan en la informacion disponible y conviene verificarlas directamente en el repositorio original.
- Idiomas no declarados: no se puede asumir un soporte multilingue concreto sin comprobacion empirica.
- Ventana de contexto no documentada: se desconoce si la cuantizacion preserva la longitud de contexto del modelo base. Esto es critico para casos de uso con documentos largos.
- Capacidades multimodales inciertas: aunque el modelo base admite imagen y video en al menos un despliegue de referencia, no se confirma que esta conversion MLX las conserve.
- Riesgo de alucinacion: no cuantificado para esta version. Los modelos MoE de gran escala pueden generar contenido plausible pero incorrecto, especialmente en tareas factuales y de razonamiento largo.
- Sesgos: no disponibles. No hay analisis de sesgos publicado para esta cuantizacion.
- Adopcion Practicamente Nula: 4 descargas y 0 likes implican que no hay una comunidad que haya validado el artefacto. Se debe tratar como un experimento reproducible y no como un componente listo para produccion.
- Dependencia de hardware muy especifica: requiere Apple Silicon con memoria unificada de gama muy alta, lo que excluye la mayor parte de infraestructura cloud convencional.
- Fecha de publicacion: el repositorio figura creado el 13 de octubre de 2026, con actualizacion el mismo mes. La validacion temporal de los resultados es limitada.

## Enlaces

- HuggingFace (esta cuantizacion): https://huggingface.co/scottlowry/Qwen3.8-Flash-Next-oQ8e-mtp
- HuggingFace (variante de 4 bits): https://huggingface.co/scottlowry/Qwen3.8-Flash-Next-oQ4e-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio oficial Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
- Despliegue de referencia en DGX Spark (TensorFold): https://github.com/MiaAI-Lab/Qwen3.8-Flash-Next-Single-DGX-Spark-TensorFold
- Benchmark relacionado en omlx.ai (modelo distinto, Qwen3.8-27B): https://omlx.ai/benchmarks/performance/qppwtzey
