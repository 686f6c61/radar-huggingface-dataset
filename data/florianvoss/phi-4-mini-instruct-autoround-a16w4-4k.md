# florianvoss/Phi-4-mini-instruct-Autoround-a16w4-4k

## Resumen

Phi-4-mini-instruct-Autoround-a16w4-4k es un paquete de ejecución compilado para el acelerador SiMa.ai Modalix, publicado por el usuario florianvoss. No es un modelo en el sentido convencional: se trata del resultado de compilar y cuantizar el modelo base microsoft/Phi-4-mini-instruct mediante AutoRound y GPTQ, empaquetado con la herramienta llima-deploy en un artefacto con directorios devkit/ y elf_files/ que solo puede ejecutarse en hardware Modalix con un runtime LLiMa compatible.

La cuantización aplicada reduce los pesos del decoder a INT4 simétrico (group size 256, AutoRound) y la cabeza de salida a INT8 simétrico por canal (GPTQ), manteniendo las activaciones en BF16 y cuantizando embeddings y KV cache a INT8. La ventana de contexto de este build concreto se limita a 4.096 tokens, incluyendo prompt y tokens generados, frente a los 128K del modelo base original.

Su relevancia es acotada: es un artefacto de despliegue para edge, con licencia MIT y 5,2 GB de repositorio. El propio autor advierte que esta compilación de 4K no se ha probado todavía en Modalix y no reclama resultados de calidad ni de rendimiento, por lo que debe considerarse material de trabajo en fase temprana.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No detallada en la ficha del paquete; heredada del modelo base microsoft/Phi-4-mini-instruct (LLM denso de la familia Phi-4) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | 4.096 tokens (incluye prompt y tokens generados); el modelo base soporta hasta 128K segun la documentacion de Microsoft y NVIDIA |
| Tipos de cuantizacion | Decoder: INT4 simetrico, group size 256, AutoRound. Cabeza de salida: INT8 simetrico por canal de salida, GPTQ. Activaciones: BF16. Embeddings y KV cache: INT8. Language group size: 128. Filter sharing activado |
| Idiomas soportados | no disponible en la ficha; el modelo base se describe como multilingue en la documentacion de Microsoft y NVIDIA |
| Licencia | MIT |
| Formato de pesos | Paquete runtime compilado para SiMa.ai Modalix (devkit/ y elf_files/). No es cargable con Transformers |

## Arquitectura y entrenamiento

Este repositorio no documenta el entrenamiento del modelo, porque no entrena: toma los pesos ya cuantizados de simaai/Phi-4-mini-instruct-Autoround-Safetensors y los compila para el acelerador Modalix. La informacion disponible indica que se completaron con exito los 163 componentes de la compilacion y que el paquete se extrajo con llima-deploy. El archivo build_info.json registra los commits del compilador y el hash de la configuracion de origen.

En cuanto al modelo subyacente, la documentacion del Phi-4-mini-instruct original (Microsoft) indica que se construyo sobre datos sinteticos y sitios web publicos filtrados, con enfasis en datos de alta densidad de razonamiento, y que se sometio a un proceso de refinamiento con ajuste supervisado (SFT) y optimizacion de preferencias directa (DPO) para seguir instrucciones con precision. No hay en la informacion proporcionada detalles sobre el numero de tokens de entrenamiento ni la composicion exacta del dataset del modelo base.

La innovacion tecnica relevante aqui es el pipeline de cuantizacion y compilacion: AutoRound para el decoder en INT4, GPTQ para la cabeza de salida en INT8 por canal y cuantizacion de embeddings y KV cache a INT8, todo orientado a ejecutar un LLM en hardware de borde SiMa.ai.

## Capacidades

- Generacion de texto e instrucciones, heredadas del modelo base Phi-4-mini-instruct.
- Razonamiento orientado a matematicas y logica, segun la descripcion del catalogo de Microsoft Foundry para el modelo base.
- Capacidad multilingue heredada del modelo base, aunque la ficha del paquete no detalla idiomas concretos.
- Ejecucion en el acelerador SiMa.ai Modalix con runtime LLiMa.
- No se documentan en la ficha capacidades de tool calling, function calling, agentes o vision para este paquete.
- No se documenta un modo de razonamiento explicito (thinking) ni capacidades de audio en la informacion disponible.

## Casos de uso

- Inferencia en el borde con SiMa.ai Modalix: el paquete esta compilado especificamente para ejecutarse en dispositivos Modalix con runtime LLiMa, de modo que permite desplegar un LLM de la familia Phi-4 directamente en hardware de borde sin depender de GPUs de centro de datos.
- Asistentes locales sin conexion: al ejecutarse en un SoC de borde, puede alimentar asistentes de texto que operen sin conectividad, manteniendo los datos en el dispositivo.
- Generacion de texto en entornos con recursos limitados: la cuantizacion INT4 del decoder y el INT8 de la cabeza y del KV cache reducen el coste de memoria, lo que encaja en escenarios de memoria y computo restringidos como los que describe el modelo base.
- Procesamiento de instrucciones cortas y conversaciones acotadas: con una ventana de 4.096 tokens, resulta adecuado para resumenes breves, clasificacion de texto y respuestas de instruccion simple donde no se necesita contexto largo.
- Investigacion sobre cuantizacion y compilacion para aceleradores: el repositorio incluye compile.sh y las instrucciones de reproduccion, por lo que sirve como referencia para estudiar pipelines AutoRound/GPTQ hacia SiMa.ai.
- Evaluacion de despliegue en hardware Modalix: util para equipos que quieran validar la ruta de compilacion, teniendo en cuenta que el autor indica que este build de 4K no se ha probado todavia en Modalix.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que este build de 4K no se ha probado en Modalix y que no se reclama ningun resultado de calidad de salida ni de rendimiento.

## Requisitos de hardware

- Hardware objetivo: acelerador SiMa.ai Modalix con un runtime LLiMa compatible. El paquete no esta pensado para GPUs convencionales.
- GPU recomendadas: no aplica segun la informacion disponible; el artefacto no se carga con Transformers.
- Compatibilidad con GPU de consumo: no disponible; el formato compilado no es un checkpoint estandar.
- Opciones de despliegue: descarga con hf download y ejecucion con llima run ./Phi-4-mini-instruct-Autoround-a16w4-4k. vLLM, llama.cpp, Ollama o TGI no son opciones validas para este paquete.
- VRAM estimada: no disponible; el despliegue depende de la memoria del dispositivo Modalix, no de VRAM de GPU.
- Latencia y throughput: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| florianvoss/Phi-4-mini-instruct-Autoround-a16w4-4k | no disponible | 4.096 tokens | Paquete compilado Modalix (INT4/INT8) | MIT | Build de 4K para SiMa.ai Modalix; no probado aun en el dispositivo |
| florianvoss/Phi-4-mini-instruct-Autoround-a16w4 | no disponible | no disponible | Paquete compilado Modalix | no disponible en la informacion | Variante relacionada del mismo autor |
| simaai/Phi-4-mini-instruct-Autoround-Safetensors | no disponible | no disponible | Safetensors cuantizados (AutoRound) | no disponible en la informacion | Checkpoint de origen usado para compilar este paquete |
| microsoft/Phi-4-mini-instruct | no disponible en la informacion | 128.000 tokens segun Microsoft/NVIDIA | Peso original | MIT (segun el ecosistema Phi-4) | Modelo base sin cuantizar; multilingue y con contexto de 128K |

## Limitaciones y advertencias

- El propio autor advierte que esta compilacion de 4K no se ha probado aun en Modalix y que no se reclama calidad de salida ni rendimiento.
- La ventana de contexto se reduce a 4.096 tokens, muy por debajo de los 128K del modelo base, por lo que conversaciones largas o documentos extensos no caben.
- El paquete no es cargable con Transformers: requiere hardware y runtime especificos, lo que limita su portabilidad.
- No hay informacion sobre sesgos del modelo resultante ni sobre el efecto de la cuantizacion INT4 en la calidad, mas alla de que es simetrica con group size 256.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; en modelos pequenos de este tipo es habitual, pero no se aportan datos concretos.
- Restricciones de licencia: el repositorio declara MIT, lo que en principio permite uso comercial, aunque conviene verificar las condiciones del modelo base microsoft/Phi-4-mini-instruct y de las herramientas AutoRound y GPTQ.
- La reproduccion de la compilacion no queda garantizada: la ficha senala que la revision inmutable de Hugging Face del checkpoint de origen no se registro, por lo que se necesita contenido identico del checkpoint.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/florianvoss/Phi-4-mini-instruct-Autoround-a16w4-4k
- Variante relacionada del mismo autor: https://huggingface.co/florianvoss/Phi-4-mini-instruct-Autoround-a16w4
- Checkpoint de origen cuantizado: https://huggingface.co/simaai/Phi-4-mini-instruct-Autoround-Safetensors
- Modelo base: https://huggingface.co/microsoft/Phi-4-mini-instruct
- Catalogo de Microsoft Foundry: https://ai.azure.com/catalog/models/Phi-4-mini-instruct
- Phi-4-mini-instruct en NVIDIA NIM: https://build.nvidia.com/microsoft/phi-4-mini-instruct
- Referencia de API de NVIDIA para phi-4-mini-instruct: https://docs.api.nvidia.com/nim/reference/microsoft-phi-4-mini-instruct
