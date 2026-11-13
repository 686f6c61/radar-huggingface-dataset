# mradermacher/GuardReasoner-VL-Eco-3B-GGUF

## Resumen

GuardReasoner-VL-Eco-3B-GGUF es la distribucion en formato GGUF del modelo GuardReasoner-VL-Eco-3B, un modelo de vision-lenguaje de 3.397.103.616 parametros (aproximadamente 3,4 mil millones) desarrollado originalmente por yueliu1999 y cuantizado por mradermacher. El modelo base esta orientado a tareas de moderacion de contenido y razonamiento de seguridad multimodal, segun se deduce de su nombre y de las etiquetas asociadas (llama-factory, easy-r1, generated_from_trainer). Esta version GGUF permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles, algo imposible con los pesos originales en precision completa.

La relevancia de esta ficha radica en que el modelo combina capacidades multimodales (procesa imagenes ademas de texto, como evidencia el fichero mmproj incluido) con un tamano reducido que lo hace desplegable en GPUs consumer. La licencia Apache 2.0 facilita su uso comercial, y su soporte para ingles y chino lo hace util en entornos bilingues. El repositorio ocupa 32,8 GB e incluye multiples cuantizaciones estaticas, desde Q2_K hasta f16, ademas de los ficheros mmproj necesarios para el procesamiento de imagenes.

Se trata, por tanto, de una opcion practica para equipos que necesiten un modelo de moderacion o clasificacion multimodal de bajo coste computacional, ejecutable localmente y con licencia permisiva. No obstante, la informacion publica disponible sobre el modelo base es limitada, por lo que muchos datos tecnicos deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo vision-lenguaje; transformer multimodal, detalles no especificados) |
| Parametros totales | 3.397.103.616 (aproximadamente 3,4 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, ademas de mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); pesos originales en safetensors en el modelo base |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base en la documentacion proporcionada. Las etiquetas del repositorio indican que fue entrenado con llama-factory y easy-r1, y que se trata de un fine-tuning completo (etiqueta "full") del modelo yueliu1999/GuardReasoner-VL-Eco-3B, generado con la libreria transformers. La presencia de ficheros mmproj confirma que integra un codificador visual para procesar imagenes, lo que lo configura como un modelo vision-lenguaje.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se detallan innovaciones tecnicas como decodificacion especulativa o atencion lineal. El nombre "GuardReasoner" sugiere un entrenamiento orientado a razonamiento sobre seguridad y moderacion, y "Eco" podria indicar una variante eficiente, pero estos extremos no se confirman en la documentacion.

## Capacidades

- Procesamiento multimodal: acepta entradas de imagen y texto, segun la presencia de ficheros mmproj en el repositorio.
- Generacion de texto conversacional: el modelo esta etiquetado como "conversational" y entrenado con llama-factory.
- Razonamiento orientado a seguridad y moderacion: el nombre GuardReasoner y la etiqueta easy-r1 sugieren capacidades de razonamiento paso a paso aplicadas a la clasificacion de contenido.
- Soporte bilingue: ingles y chino.
- Compatibilidad con endpoints: la etiqueta "endpoints_compatible" indica que puede servirse mediante APIs compatibles.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades especiales (thinking mode, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Moderacion de contenido multimodal: el modelo puede clasificar publicaciones que combinen texto e imagen (por ejemplo, en foros o redes sociales) aprovechando su codificador visual y su orientacion a razonamiento de seguridad, ejecutandose localmente con cuantizaciones Q4 o Q5 en una GPU consumer.
- Filtrado de imagenes en pipelines de ingestion de datos: integrado en un proceso que analice lotes de imagenes y texto para detectar contenido inapropiado antes de almacenarlo, usando la cuantizacion Q4_K_M (2,2 GB) para maximizar el throughput.
- Asistencia en plataformas de comercio electronico: revision automatica de listados de productos (imagen y descripcion) para detectar articulos prohibidos o politicas incumplidas, desplegable con llama.cpp en servidores modestos.
- Analisis de seguridad en entornos educativos: monitorizacion de contenido generado por alumnos en plataformas escolares, con la ventaja de que el modelo se ejecuta on-premise y no envia datos a terceros.
- Investigacion en IA de seguridad: uso como linea base reproducible para experimentos de moderacion multimodal, gracias a la licencia Apache 2.0 y a la disponibilidad de multiples cuantizaciones que permiten ajustar el equilibrio calidad/recursos.
- Despliegue en dispositivos con recursos limitados: la cuantizacion Q2_K (1,5 GB) permite ejecutar el modelo en GPUs con 4 GB de VRAM o incluso en CPU, habilitando prototipos de moderacion en entornos edge.
- Clasificacion bilingue ingles-chino: util en comunidades o plataformas que operan en ambos idiomas y necesitan un unico modelo para tareas de moderacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos del modelo de lenguaje): Q2_K aproximadamente 1,5 GB; Q4_K_M aproximadamente 2,2 GB; Q8_0 aproximadamente 3,7 GB; f16 aproximadamente 6,9 GB. A estos valores hay que sumar el fichero mmproj (0,9 GB en Q8_0 o 1,4 GB en f16) y el espacio para el contexto KV cache.
- GPU recomendadas: para cuantizaciones Q4 o Q5, una RTX 3060 (12 GB), RTX 4060 Ti (16 GB) o RTX 4090 (24 GB) ofrecen margen suficiente. Para f16 con mmproj f16 se recomienda al menos 12 GB de VRAM.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con 6 GB o mas usando Q4_K_M junto con mmproj-Q8_0; las cuantizaciones Q2_K y Q3 pueden caber en GPUs de 4 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con la API de OpenAI (la etiqueta endpoints_compatible lo indica). Tambien es posible usar transformers con los pesos originales del modelo base.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| GuardReasoner-VL-Eco-3B-GGUF | 3,4 mil millones | no disponible | Apache 2.0 | GGUF | Vision-lenguaje, moderacion, bilingue en/zh |
| Llama Guard 3 (vision) | no disponible en esta ficha | no disponible | Llama Community License | safetensors | Modelo de moderacion de Meta; no es Apache 2.0 |
| Qwen2.5-VL-3B | 3 mil millones (aproximado) | no disponible en esta ficha | Apache 2.0 (segun version) | safetensors, GGUF | Vision-lenguaje generalista, no especifico de moderacion |
| MiniCPM-V 2.6 | aproximadamente 8 mil millones | no disponible en esta ficha | no disponible | safetensors, GGUF | Vision-lenguaje; mayor tamano y coste |

Nota: los datos de los modelos comparativos no provienen de la informacion proporcionada y deben verificarse en sus respectivas fichas antes de tomar decisiones.

## Limitaciones y advertencias

- La documentacion publica del modelo base es muy escasa: no se especifican contexto maximo, datos de entrenamiento ni benchmarks, lo que dificulta evaluar su calidad real antes de desplegarlo.
- Riesgo de alucinacion inherente a los modelos generativos; en tareas de moderacion esto puede traducirse en falsos positivos o negativos, por lo que se recomienda validacion humana en casos criticos.
- Sesgos conocidos: no disponibles en la informacion proporcionada; al estar entrenado principalmente en ingles y chino, su rendimiento en castellano no esta garantizado.
- Limitacion idiomatica: solo se declaran ingles y chino; el uso en castellano puede degradar la calidad de forma significativa.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base original por si hubiera terminos adicionales no reflejados en esta ficha.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_S) pueden degradar notablemente el rendimiento en tareas de razonamiento; para produccion se recomienda Q5_K_M o superior.
- El repositorio ocupa 32,8 GB en total; descargar todas las cuantizaciones no es necesario, pero hay que seleccionar cuidadosamente los ficheros.
- No se dispone de informacion sobre el comportamiento del modelo ante ataques adversariales (prompt injection, imagenes manipuladas), un aspecto critico en sistemas de moderacion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/GuardReasoner-VL-Eco-3B-GGUF
- Modelo base: https://huggingface.co/yueliu1999/GuardReasoner-VL-Eco-3B
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#GuardReasoner-VL-Eco-3B-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
