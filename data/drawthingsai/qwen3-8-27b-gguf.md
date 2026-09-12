# drawthingsai/Qwen3.8-27B-GGUF

## Resumen

Qwen3.8-27B-GGUF es un repositorio de cuantizaciones en formato GGUF publicado por drawthingsai (Draw Things) sobre el modelo base Qwen/Qwen3.8-27B, un modelo multimodal de tipo image-text-to-text con 27.320.697.856 parametros (~27,3 mil millones) segun los pesos safetensors del modelo original. El objetivo declarado del autor es proporcionar cuantizaciones por debajo de 4 bits por peso (bpw) para los pesos del modelo de lenguaje, acompanadas de codificadores de vision cuantizados de alta fidelidad que resuelven los problemas de compatibilidad de cuantizacion del encoder visual de Qwen3.8-27B. El repositorio ocupa 24,9 GB y acumula 2.367 descargas y 10 likes desde su publicacion el 3 de septiembre de 2026.

La relevancia de esta publicacion reside en que traslada un modelo multimodal de ~27,3 mil millones de parametros a tamanos de 8,20 GiB y 9,71 GiB por archivo, lo que permite inferencia local en GPUs de consumo. Los dos checkpoints propios ("DT") incorporan pesos de multi-token prediction (MTP) para decodificacion especulativa, con una tasa de aceptacion de borrador del ~60% medida con longitud maxima de borrador 3. Ademas, los archivos de vision Q4_K, Q5_K y Q6_K funcionan con llama.cpp sin modificaciones, algo que el autor presenta como una resolucion de los problemas de compatibilidad previos.

El modelo base esta publicado bajo licencia Apache 2.0, soporta los idiomas ingles, chino, espanol, ruso y japones, y esta orientado a razonamiento, uso de herramientas (tool calling), agentes y generacion de codigo, segun las etiquetas del repositorio. La model card proporcionada esta truncada al final del apartado de evaluacion del codificador de vision.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) de la familia Qwen3.8, con modulo de vision y pesos MTP; detalles internos de capas y atencion no disponibles |
| Parametros totales | 27.320.697.856 (~27,3 mil millones) segun safetensors del modelo base |
| Parametros activos | No aplica: la informacion disponible no indica que el modelo sea MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF por debajo de 4 bpw: IQ3_XXS (2,96 bpw), IQ2_S (2,48 bpw); en la comparativa del autor aparecen tambien IQ2_XS, IQ1_M y Q2_K_XL. Codificador de vision en BF16, FP16, Q8_0, Q6_K, Q5_K y Q4_K |
| Idiomas soportados | Ingles (en), chino (zh), espanol (es), ruso (ru), japones (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base se distribuye en safetensors |
| Modelo base | Qwen/Qwen3.8-27B |
| Tamano del repositorio | 24,9 GB |
| Tamano de los checkpoints DT | DT-bpw2.96-IQ3_XXS: 9,71 GiB; DT-bpw2.48-IQ2_S: 8,20 GiB |
| Fecha de publicacion | 3 de septiembre de 2026 (actualizado el 9 de septiembre de 2026) |
| Descargas / likes | 2.367 / 10 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base mas alla de que se trata de un transformer multimodal de tipo image-text-to-text con un codificador de vision separado y un modulo de multi-token prediction (MTP). El repositorio no documenta el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron etapas de RLHF o DPO; el autor solo indica que el modelo esta "fine-tuned" e "instruction-tuned" en las etiquetas. Los pesos totales reportados por safetensors son 27.320.697.856.

La innovacion tecnica principal de este repositorio es la cuantizacion. Los dos checkpoints DT se situan por debajo de 4 bpw e incluyen pesos MTP: el archivo DT-bpw2.96-IQ3_XXS pesa 9,71 GiB (9,29 GiB sin MTP) y conserva mayor precision en el componente MTP, mientras que DT-bpw2.48-IQ2_S pesa 8,20 GiB (7,78 GiB sin MTP). Para el codificador de vision, el autor publica exportaciones propias en BF16 y FP16 de 888,01 MiB, junto con versiones cuantizadas: Q4_K ocupa 314,46 MiB (una reduccion del 64,59% frente al export BF16) con una similitud coseno de 0,99537 frente a las salidas FP32 originales de Hugging Face. Los formatos Q4_K, Q5_K y Q6_K del encoder visual son compatibles con llama.cpp sin modificaciones.

## Capacidades

- Generacion de texto conversacional e instrucciones de multiples turnos.
- Razonamiento explicito: las etiquetas del repositorio incluyen "reasoning", y el autor reporta un 100,00% de acierto en AIME 2026 para sus dos checkpoints DT.
- Generacion de codigo: etiqueta "code-generation" en el repositorio.
- Uso de herramientas y function calling: etiquetas "tool-use" y "function-calling"; se evalua con BFCL v4.
- Flujos agenticos y razonamiento multi-paso: etiquetas "agent" y "agentic".
- Capacidades multimodales de vision: pipeline image-text-to-text, con codificador visual evaluado en RealWorldQA y OCRBench.
- Decodificacion especulativa mediante MTP: los checkpoints DT incluyen pesos de multi-token prediction, con tasa de aceptacion de borrador de ~60% con longitud maxima de borrador 3 (medicion preliminar sobre DT-bpw2.96-IQ3_XXS).
- Multilingue en ingles, chino, espanol, ruso y japones.
- Inferencia local: etiqueta "local-inference".

## Casos de uso

- Despliegue local en estacion de trabajo con GPU de consumo: los archivos de 8,20 GiB y 9,71 GiB permiten ejecutar un modelo multimodal de ~27,3 mil millones de parametros en GPUs de 12-16 GB, algo inviable con los pesos BF16 (46,55 GiB), usando llama.cpp o cualquiera de sus frontends.
- Asistente de codigo en el editor: el modelo soporta generacion de codigo y function calling, por lo que puede integrarse en un flujo tipo agente que consulte el arbol del proyecto, edite archivos y ejecute comandos a traves de herramientas.
- Analisis de documentos con imagen y texto: al ser image-text-to-text con codificador visual cuantizado a Q4_K (314,46 MiB, 85% en OCRBench con 100 muestras), es adecuado para extraer texto y entender capturas, diagramas o formularios junto con instrucciones en lenguaje natural.
- Agentes de automatizacion multi-paso: el modelo esta etiquetado como agentico y evaluado en BFCL v4 (68,06% y 69,56% en los checkpoints DT), lo que lo hace apto para pipelines donde debe elegir y encadenar llamadas a funciones.
- Razonamiento matematico y cientifico asistido: con 100,00% en AIME 2026 y 86,36% en GPQA Diamond para DT-bpw2.96-IQ3_XXS, puede emplearse como asistente de resolucion de problemas cuantitativos, siempre con verificacion humana por el riesgo de alucinacion.
- Atencion al cliente en varios idiomas: cubre ingles, chino, espanol, ruso y japones, y puede gestionar conversaciones multi-turno; la longitud de contexto no esta documentada, por lo que habria que validarla antes de fijar la ventana de dialogo.
- Servicio de inferencia con decodificacion especulativa: al incluir pesos MTP con ~60% de tasa de aceptacion de borrador (longitud 3), puede reducir la latencia en entornos de servidor que soporten esta tecnica.
- Prototipado e investigacion de cuantizacion: el repositorio publica tablas comparativas de bpw frente a calidad (AIME 2026, GPQA Diamond, IFEval, BFCL v4), utiles como referencia para estudiar la degradacion por cuantizacion agresiva.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card. Los valores son porcentajes de acierto; mas alto es mejor. AIME 2026, GPQA Diamond y BFCL v4 (1k) reportan exactitud; IFEval reporta `prompt_level_strict`.

| Checkpoint | Tamano (GiB) | Incluye MTP | Tamano sin MTP (GiB) | AIME 2026 | GPQA Diamond | IFEval | BFCL v4 (1k) |
|---|---:|:---:|---:|---:|---:|---:|---:|
| Qwen3.8-27B-BF16 | 46,55 | No | 46,55 | 100,00% | 90,91% | 94,09% | 68,36% |
| UD-Q2_K_XL | 9,15 | Si | 8,83 | 100,00% | 85,35% | 93,89% | 69,46% |
| UD-IQ2_S | 7,80 | No | 7,80 | 96,67% | 79,29% | 90,39% | 68,26% |
| AD-IQ2_XS | 9,21 | Si | 8,94 | 96,67% | 76,77% | 90,20% | 68,46% |
| AD-IQ1_M | 7,91 | Si | 7,64 | 90,00% | 51,01% | 78,37% | 62,08% |
| DT-bpw2.96-IQ3_XXS | 9,71 | Si | 9,29 | 100,00% | 86,36% | 93,90% | 68,06% |
| DT-bpw2.48-IQ2_S | 8,20 | Si | 7,78 | 100,00% | 77,27% | 93,16% | 69,56% |

Evaluacion del codificador de vision. MSE mas bajo es mejor; similitud coseno y exactitud mas altas son mejores. MSE y similitud coseno comparan las salidas completas del encoder (incluido el merger) de llama.cpp CUDA contra las salidas FP32 originales de Hugging Face.

| Formato | Tamano (MiB) | MSE | Similitud coseno | RealWorldQA (100 muestras) | OCRBench (100 muestras) |
|---|---:|---:|---:|---:|---:|
| BF16 | 888,01 | 0,000056675555 | 0,999955598992 | 73% | 86% |
| FP16 | 888,01 | 0,000128205964 | 0,999899941413 | 73% | 86% |
| Q8_0 | 481,42 | 0,000868770063 | 0,999319249587 | 71% | 86% |
| Q6_K | 441,82 | 0,000878257184 | 0,999312708268 | 73% | 86% |
| Q5_K | 335,94 | 0,005477580664 | 0,995707853142 | 74% | 86% |
| Q4_K | 314,46 | 0,005899684403 | 0,995368459336 | 71% | 85% |

Condiciones declaradas de la evaluacion de vision: modo thinking desactivado, respuestas limitadas a 1.024 tokens, subconjuntos rapidos de 100 ejemplos por dataset (10 por categoria en OCRBench), no resultados completos de benchmark. Todos los 1.200 ejemplos obtuvieron respuesta puntuada.

## Requisitos de hardware

- VRAM para los pesos del modelo de lenguaje: aproximadamente 8,20 GiB (DT-bpw2.48-IQ2_S) y 9,71 GiB (DT-bpw2.96-IQ3_XXS) en disco; el consumo en VRAM depende del backend, del offload de capas a CPU y del contexto configurado, y no esta documentado.
- VRAM adicional del codificador de vision: entre 314,46 MiB (Q4_K) y 888,01 MiB (BF16/FP16), segun el formato elegido.
- GPUs de consumo: los checkpoints caben en tarjetas de 12 GB (RTX 3060 12 GB, RTX 4070 12 GB) con contexto moderado y parte del modelo en CPU si es necesario; en 16 GB (RTX 4080, RTX 4060 Ti 16 GB) y en 24 GB (RTX 3090, RTX 4090) el margen es mayor.
- GPUs de datacenter: A100, H100 y similares no son necesarias para estos archivos; solo tendrian sentido para servir muchas peticiones concurrentes o el modelo completo en BF16 (46,55 GiB).
- Opciones de despliegue: llama.cpp (los archivos de vision Q4_K, Q5_K y Q6_K funcionan sin modificaciones), y frontends basados en GGUF como Ollama o LM Studio. El repositorio incluye la etiqueta `text-generation-inference`, aunque el formato GGUF esta pensado principalmente para el ecosistema llama.cpp. Consultar Unsloth para el flujo de conversion/cuantizacion, ya que tambien aparece como etiqueta.
- Latencia y throughput estimados: no disponibles. El unico dato de rendimiento publicado es la tasa de aceptacion de borrador de ~60% con longitud maxima de borrador 3 para el componente MTP de DT-bpw2.96-IQ3_XXS (medicion preliminar).

## Comparativa con modelos similares

No se dispone de datos de otros modelos de la misma categoria en la informacion proporcionada. La unica comparativa publicada por el autor enfrenta sus propios checkpoints con otras cuantizaciones del mismo modelo base, todas ellas del mismo tamano nominal (~27,3 mil millones de parametros) y bajo la licencia Apache 2.0 del modelo original.

| Alternativa | Tamano (GiB) | Incluye MTP | Tamano sin MTP (GiB) | AIME 2026 | GPQA Diamond | IFEval | BFCL v4 (1k) | Disponibilidad |
|---|---:|:---:|---:|---:|---:|---:|---:|---|
| DT-bpw2.96-IQ3_XXS (este repositorio) | 9,71 | Si | 9,29 | 100,00% | 86,36% | 93,90% | 68,06% | Repositorio drawthingsai |
| DT-bpw2.48-IQ2_S (este repositorio) | 8,20 | Si | 7,78 | 100,00% | 77,27% | 93,16% | 69,56% | Repositorio drawthingsai |
| UD-Q2_K_XL | 9,15 | Si | 8,83 | 100,00% | 85,35% | 93,89% | 69,46% | No disponible en la informacion |
| UD-IQ2_S | 7,80 | No | 7,80 | 96,67% | 79,29% | 90,39% | 68,26% | No disponible en la informacion |
| AD-IQ2_XS | 9,21 | Si | 8,94 | 96,67% | 76,77% | 90,20% | 68,46% | No disponible en la informacion |
| AD-IQ1_M | 7,91 | Si | 7,64 | 90,00% | 51,01% | 78,37% | 62,08% | No disponible en la informacion |
| Qwen3.8-27B-BF16 (referencia) | 46,55 | No | 46,55 | 100,00% | 90,91% | 94,09% | 68,36% | Modelo base Qwen/Qwen3.8-27B |

## Limitaciones y advertencias

- La model card proporcionada esta truncada al final del apartado del codificador de vision, por lo que puede haber informacion adicional no recogida aqui.
- No se documentan sesgos conocidos, composicion del dataset de entrenamiento ni procesos de alineacion (RLHF/DPO), lo que dificulta evaluar riesgos de sesgo.
- Riesgo de alucinacion inherente a los modelos de lenguaje generativos; en tareas de razonamiento matematico y agenticas conviene verificar las salidas, especialmente en cuantizaciones agresivas.
- La degradacion por cuantizacion es significativa en los formatos mas pequenos: AD-IQ1_M cae a 51,01% en GPQA Diamond y 78,37% en IFEval, frente a 90,91% y 94,09% del BF16. Los checkpoints DT-bpw2.48-IQ2_S tambien bajan a 77,27% en GPQA Diamond respecto al 90,91% del BF16.
- Los resultados de vision publicados son subconjuntos rapidos de 100 ejemplos, con thinking desactivado y limite de 1.024 tokens por respuesta; no deben interpretarse como resultados completos de RealWorldQA u OCRBench.
- La longitud de contexto no esta documentada en la informacion disponible; no se puede garantizar un rendimiento concreto en ventanas largas.
- La licencia Apache 2.0 permite uso comercial, pero corresponde verificar las condiciones del modelo base Qwen/Qwen3.8-27B y de cualquier dependencia (por ejemplo, llama.cpp) por separado.
- No hay datos publicados de latencia ni de throughput mas alla de la tasa de aceptacion de borrador del MTP (~60%), por lo que las estimaciones de capacidad en produccion deben medirse en el hardware objetivo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/drawthingsai/Qwen3.8-27B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Perfil del autor en HuggingFace: https://huggingface.co/drawthingsai/models
- Anuncio en X sobre las versiones de 2,96 y 2,48 bpw: https://x.com/FeitengLi/status/2097609675361710366
- Papers, blogs o demos adicionales: no disponibles en la informacion proporcionada.
