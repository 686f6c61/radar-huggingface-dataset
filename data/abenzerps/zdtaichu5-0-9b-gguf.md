# abenzerps/ZDTaichu5.0-9B-GGUF

## Resumen

ZDTaichu5.0-9B-GGUF es la conversion a formato GGUF del modelo multimodal ZDTaichu5.0-9B, un modelo fundacional vision-language desarrollado por el equipo Zi Dong Tai Chu (TaichuAI) para comprension visual, razonamiento espacial, uso agentico de herramientas y cargas de trabajo de IA encarnada. Esta ficha concreta corresponde al repositorio de cuantizaciones publicado por el usuario abenzerps, que no es el autor del modelo original: se trata de una conversion de terceros generada con llama.cpp a partir del checkpoint TaichuAI/ZDTaichu5.0-9B (revision a22afd15a3f85659f103caa659ec4aa9500a998e).

El modelo combina un backbone de lenguaje Qwen3.5-9B con un codificador visual C-RADIOv4-H, y declara una longitud de contexto nativa de 262.144 tokens (256K). Su pipeline declarado es image-text-to-text, con capacidades adicionales etiquetadas por el autor como comprension de video, razonamiento espacial y uso agentico. La licencia es Apache-2.0, lo que permite uso comercial sin restricciones adicionales por parte del licenciante original.

La relevancia de este repositorio es practica: permite ejecutar un VLM de 9B con ventana de 256K en hardware de consumo mediante llama.cpp, algo que el checkpoint original en safetensors no facilita. El repositorio incluye cinco niveles de cuantizacion (de Q8_0 a Q4_0) mas un proyector multimodal BF16 independiente, y en el momento de la consulta registra 0 descargas y 0 likes, por lo que no existe validacion de la comunidad sobre la calidad de la conversion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal: backbone de lenguaje Qwen3.5-9B + codificador visual C-RADIOv4-H + proyector multimodal |
| Parametros totales | 9B (segun la denominacion del modelo; el repositorio no publica el desglose exacto) |
| Parametros activos | No aplica: la informacion disponible no describe una arquitectura de mezcla de expertos (MoE) |
| Longitud de contexto | 262.144 tokens (256K) nativa en el checkpoint de origen |
| Tipos de cuantizacion | Q8_0 (8,87 GB), Q6_K (6,85 GB), Q5_K_M (6,02 GB), Q4_K_M (5,24 GB), Q4_0 (4,95 GB) |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); proyector multimodal en GGUF BF16 (1,53 GB) |
| Tamano del repositorio | 35,9 GB |
| Modalidades de entrada | Texto e imagen; etiquetas del autor que indican tambien video |
| Fecha de creacion | 2026-09-16 |

## Arquitectura y entrenamiento

La informacion disponible indica una arquitectura de dos torres: un backbone de lenguaje Qwen3.5-9B que aporta la capacidad de generacion y razonamiento textual, y un codificador visual C-RADIOv4-H que produce las representaciones de imagen. Ambas partes se conectan mediante un proyector multimodal que en este repositorio se distribuye como fichero GGUF separado en BF16 (mmproj-ZDTaichu5.0-9B-BF16.gguf, 1,53 GB). El proyector es opcional para uso exclusivamente textual y obligatorio para cualquier ruta de inferencia con imagen.

No se dispone de datos sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de alineacion como RLHF, DPO o similares: la model card consultada no los detalla. Tampoco se documentan innovaciones tecnicas concretas (atencion lineal, decodificacion especulativa, mecanismos de compresion de KV cache) mas alla del contexto nativo de 256K y de la etiqueta qwen3.5, que sugiere herencia de la familia Qwen 3.5 en el componente de lenguaje. La conversion a GGUF se realizo con llama.cpp en el commit 7ceed8737fdb4eb09b4760e77bd12d38012de5a8.

## Capacidades

- Generacion de texto conversacional en ingles y chino, con plantilla de chat embebida en el GGUF y copia externa en chat_template.jinja.
- Comprension de imagen a texto (image-text-to-text): descripcion de imagenes, respuesta a preguntas visuales y lectura de contenido visual.
- Comprension de video, segun las etiquetas declaradas por el autor en la model card (video-understanding).
- Razonamiento espacial (spatial-reasoning), orientado a tareas donde importa la posicion relativa de objetos y la geometria de la escena.
- Uso agentico de herramientas: la model card menciona agentic tool use, aunque advierte que el comportamiento de tool calling depende del runtime de servicio y de su parser, y recomienda verificar las llamadas en la aplicacion destino.
- Cargas de trabajo de IA encarnada (embodied AI), segun la descripcion del modelo de origen.
- Ventana de contexto larga de hasta 262.144 tokens, utilizable elevando el parametro -c de llama.cpp cuando la memoria lo permite.
- No se documentan en la informacion disponible capacidades de audio, modo thinking explicito ni generacion de imagen.

## Casos de uso

- Descripcion y catalogacion automatica de imagenes: el modelo puede generar descripciones detalladas de fotografias o productos y volcarlas a un catalogo, con el proyector multimodal cargado en llama.cpp mediante --mmproj.
- Analisis de documentos escaneados y capturas: al combinar vision con 256K de contexto, permite procesar lotes grandes de paginas o capturas en una sola ventana sin trocear el material.
- Inspeccion visual en entornos industriales o roboticos: las etiquetas de razonamiento espacial y embodied AI apuntan a tareas donde el modelo debe situar objetos y relaciones en el espacio, por ejemplo verificacion de posiciones en una linea de montaje.
- Agente multimodal con llamada a herramientas: integrado en un servidor compatible con OpenAI (llama-server), el modelo puede decidir que herramienta invocar a partir de una entrada visual, aunque el soporte real de tool calling debe validarse en el runtime concreto.
- Analisis de video para resumen o alertas: con la etiqueta video-understanding, es candidato para resumir secuencias o detectar eventos, procesando fotogramas como entradas de imagen sucesivas.
- Asistente de accesibilidad: descripcion de escenas o imagenes para usuarios con discapacidad visual, con la ventaja de que Q4_K_M ocupa 5,24 GB y puede ejecutarse en un portatil con GPU de gama media.
- Prototipado e investigacion en VLM sobre hardware limitado: al existir cuantizaciones desde 4,95 GB, permite reproducir experimentos de vision-lenguaje sin acceso a GPUs de datacenter.
- Despliegue local con requisitos de privacidad: al ejecutarse con llama.cpp sin llamadas a servicios externos, es adecuado para procesar imagenes sensibles (documentacion medica, legal) en infraestructura propia.

## Benchmarks y rendimiento

La model card del repositorio incluye una imagen comparativa (assets/taichu-vs-closed-models.png) con resultados de benchmarks reportados por TaichuAI para el modelo fundacional original, acompanada de la advertencia explicita de que esas cifras no son mediciones de esta conversion GGUF. Los valores numericos no estan disponibles en formato textual en la informacion proporcionada.

No se han publicado resultados de benchmarks en la informacion disponible para esta conversion.

## Requisitos de hardware

- VRAM estimada para los pesos (sin contar KV cache): aproximadamente 5,3 GB con Q4_0, 5,6 GB con Q4_K_M, 6,4 GB con Q5_K_M, 7,3 GB con Q6_K y 9,4 GB con Q8_0, partiendo de los tamanos de fichero publicados.
- Proyector multimodal: 1,53 GB adicionales en BF16 si se utiliza la ruta de vision. Debe sumarse a la cifra de pesos elegida.
- GPU de consumo: Q4_0 y Q4_K_M caben en tarjetas de 8 GB (RTX 3070, RTX 4060) con contexto moderado; Q5_K_M y Q6_K requieren 12 GB o mas (RTX 3060 12 GB, RTX 4070); Q8_0 encaja comodamente en 16 GB (RTX 4080, RTX 4090) y deja margen para contexto amplio.
- GPU profesionales: A100, H100 o similares no son necesarias para los pesos, pero si utiles si se pretende explotar la ventana completa de 262.144 tokens, cuyo coste de KV cache puede superar con creces el de los pesos.
- Memoria para contexto largo: la model card indica aumentar -c hasta 262144 "cuando haya memoria suficiente"; no se publica el consumo exacto de KV cache por token, por lo que el dimensionado debe hacerse por prueba empirica.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), y cualquier runtime compatible con GGUF que soporte la ruta multimodal y el parser de tool calls correspondiente. Ollama, vLLM o TGI no aparecen mencionados en la informacion disponible para este modelo.
- Parametros de muestreo sugeridos por el autor: temperatura 0,7 y top-p 0,95, con --jinja activado para usar la plantilla embebida.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos verificados de modelos alternativos. La comparacion siguiente se limita a caracteristicas publicas de familia y licencia, marcando como no disponible todo aquello que no se puede confirmar con la informacion disponible.

| Modelo | Parametros | Contexto | Vision | Licencia | Disponibilidad GGUF | Notas |
|---|---|---|---|---|---|---|
| ZDTaichu5.0-9B (esta conversion) | 9B | 262.144 tokens | Si (C-RADIOv4-H) | Apache-2.0 | Si, 5 cuantizaciones | Conversion de terceros, 0 descargas |
| Qwen2.5-VL-7B | 7B | No disponible en la informacion proporcionada | Si | Apache-2.0 | Si, publicamente disponible | Alternativa directa por tamano y licencia; sin datos comparativos verificados aqui |
| InternVL2.5-8B | 8B | No disponible en la informacion proporcionada | Si | MIT | Si, publicamente disponible | Alternativa de tamano similar en la categoria VLM abierta |
| Llama-3.2-11B-Vision | 11B | No disponible en la informacion proporcionada | Si | Licencia comunitaria de Llama | Si, publicamente disponible | Mayor tamano y licencia con restricciones adicionales |

No se dispone de resultados de benchmarks comparativos verificados para ninguna de estas alternativas en la informacion consultada, mas alla de la imagen sin datos textuales incluida en la model card del autor.

## Limitaciones y advertencias

- Modelo de origen no validado: el repositorio registra 0 descargas y 0 likes, y la conversion la firma un tercero (abenzerps) distinto del equipo TaichuAI. No hay evidencia de la comunidad sobre fidelidad de la cuantizacion.
- Ausencia de benchmarks de la conversion: las cifras que aparecen en la model card corresponden al modelo original en precision completa, no a los ficheros GGUF, y el propio autor lo advierte.
- Idiomas limitados: solo ingles y chino. El rendimiento en castellano no esta documentado y no puede asumirse.
- Tool calling dependiente del runtime: la model card indica explicitamente que el comportamiento de llamada a herramientas depende del runtime y de su parser, y recomienda verificar las llamadas en la aplicacion final antes de ponerlas en produccion.
- Contexto de 256K teorico: alcanzar esa ventana exige memoria muy superior a la de los pesos, y no se documenta el consumo de KV cache ni la degradacion del modelo a longitudes extremas.
- Riesgo de alucinacion: no se han publicado evaluaciones de fiabilidad, tasa de alucinacion ni calibracion para este checkpoint.
- Sesgos: no se documenta ninguna evaluacion de sesgos, toxicidad o alineacion en la informacion disponible.
- Requisito de build reciente: la ruta multimodal exige una version actual de llama.cpp que soporte el camino multimodal de este modelo; versiones antiguas pueden fallar al cargar el proyector.
- Licencia: Apache-2.0 permite uso comercial, pero esa licencia la declara la conversion; conviene verificar la licencia del checkpoint original TaichuAI/ZDTaichu5.0-9B antes de un despliegue comercial.
- Sin garantias del cuantizador: no se documentan metodologia de calibracion, dataset de calibracion ni verificacion de perplejidad para las cuantizaciones publicadas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/abenzerps/ZDTaichu5.0-9B-GGUF
- Modelo base: https://huggingface.co/TaichuAI/ZDTaichu5.0-9B
- Revision del checkpoint de origen: https://huggingface.co/TaichuAI/ZDTaichu5.0-9B/tree/a22afd15a3f85659f103caa659ec4aa9500a998e
- Commit de llama.cpp usado en la conversion: https://github.com/ggml-org/llama.cpp/commit/7ceed8737fdb4eb09b4760e77bd12d38012de5a8
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- Sumas de verificacion: https://huggingface.co/abenzerps/ZDTaichu5.0-9B-GGUF/blob/main/SHA256SUMS.txt
- Plantilla de chat externa: https://huggingface.co/abenzerps/ZDTaichu5.0-9B-GGUF/blob/main/chat_template.jinja
- Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; unicamente aparecieron paginas en ruso sobre ajustes de Android y perifericos, sin relacion con ZDTaichu5.0.
